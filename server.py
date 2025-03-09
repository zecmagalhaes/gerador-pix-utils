from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pix_utils import Code
import os
import unidecode  # Para remover acentos

app = Flask(__name__, static_folder='.')
app.config['JSON_AS_ASCII'] = False  # Permite caracteres UTF-8 no JSON
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/gerar-pix', methods=['POST', 'OPTIONS'])
def gerar_pix():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        dados = request.get_json()
        if not dados:
            return jsonify({'erro': 'Dados não fornecidos'}), 400
        
        campos_obrigatorios = ['key', 'name', 'city', 'value', 'identifier']
        for campo in campos_obrigatorios:
            if campo not in dados:
                return jsonify({'erro': f'Campo {campo} é obrigatório'}), 400

        # Remove acentos e caracteres especiais dos campos de texto
        name_sem_acento = unidecode.unidecode(dados['name'])
        city_sem_acento = unidecode.unidecode(dados['city'])
        
        try:
            valor = float(dados['value'])
        except ValueError:
            return jsonify({'erro': 'Valor inválido'}), 400
        
        codigo = Code(
            key=dados['key'],
            name=name_sem_acento,
            city=city_sem_acento,
            value=valor,
            identifier=dados['identifier']
        )
        
        return jsonify({'codigo': str(codigo)})
    
    except Exception as e:
        print(f"Erro ao gerar PIX: {str(e)}")
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 