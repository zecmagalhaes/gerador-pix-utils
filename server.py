from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pix_utils import Code
import os
import unidecode  # Para remover acentos

app = Flask(__name__, static_folder='.')
app.config['JSON_AS_ASCII'] = False  # Permite caracteres UTF-8 no JSON
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/gerar-pix', methods=['POST', 'OPTIONS'])
def gerar_pix():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

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
        
        codigo = Code(
            key=dados['key'],
            name=name_sem_acento,
            city=city_sem_acento,
            value=float(dados['value']),
            identifier=dados['identifier']
        )
        
        return jsonify({'codigo': str(codigo)})
    
    except Exception as e:
        print(f"Erro ao gerar PIX: {str(e)}")
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 