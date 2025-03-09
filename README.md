# Gerador de PIX

Uma aplicação web PWA para gerar códigos PIX de forma simples e rápida.

## Requisitos

- Python 3.7+
- pip (gerenciador de pacotes Python)

## Instalação

1. Clone este repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd gerador-pix-utils
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Executando a aplicação

1. Inicie o servidor:
```bash
python server.py
```

2. Abra seu navegador e acesse:
```
http://localhost:5000
```

## Uso

1. Preencha os campos necessários:
   - Chave PIX do recebedor
   - Nome do recebedor
   - Cidade
   - Valor (use ponto para separar decimais)
   - Identificador (até 8 números)

2. Clique em "Gerar PIX"

3. Use o botão "Copiar Código PIX" para copiar o código gerado

## Funcionalidades

- Geração de códigos PIX
- Validação de campos
- Notificações de erro/sucesso
- Interface responsiva
- Funciona como PWA (pode ser instalado no dispositivo)

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Python (Flask)
- pix-utils 