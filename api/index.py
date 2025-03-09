from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)

def gerar_codigo_pix(key, name, city, value, identifier):
    # Dados do payload PIX
    payload = f"00020126330014BR.GOV.BCB.PIX01{len(key)}{key}0214{len(identifier)}{identifier}"
    payload += f"52040000530398654{format(float(value), '.2f')}5802BR59{len(name)}{name}"
    payload += f"60{len(city)}{city}62070503***6304"

    # Calcula o CRC16
    crc16 = 0xFFFF
    for char in payload:
        crc16 ^= (ord(char) << 8)
        for _ in range(8):
            if crc16 & 0x8000:
                crc16 = (crc16 << 1) ^ 0x1021
            else:
                crc16 = crc16 << 1
        crc16 &= 0xFFFF

    # Adiciona o CRC16 ao payload
    codigo_completo = f"{payload}{crc16:04X}"
    return codigo_completo

def handler(request):
    if request.method == 'POST':
        try:
            dados = request.get_json()
            
            # Validação dos dados
            if not all(key in dados for key in ['key', 'name', 'city', 'value', 'identifier']):
                return jsonify({'erro': 'Dados incompletos'}), 400

            # Validação do identificador
            if not re.match(r'^\d{1,8}$', dados['identifier']):
                return jsonify({'erro': 'Identificador inválido'}), 400

            # Validação do valor
            if not isinstance(dados['value'], (int, float)) or dados['value'] <= 0:
                return jsonify({'erro': 'Valor inválido'}), 400

            codigo = gerar_codigo_pix(
                dados['key'],
                dados['name'],
                dados['city'],
                dados['value'],
                dados['identifier']
            )

            return jsonify({'codigo': codigo})

        except Exception as e:
            return jsonify({'erro': 'Erro ao gerar código PIX'}), 500

    return jsonify({'erro': 'Método não permitido'}), 405

# Rota para a Vercel
def index(request):
    return handler(request) 