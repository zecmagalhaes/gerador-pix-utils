@echo off
echo Iniciando Servidor PIX...

REM Verifica se o Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo Python nao encontrado! Por favor, instale o Python 3.7 ou superior.
    pause
    exit
)

REM Verifica se as dependências estão instaladas
echo Verificando dependencias...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias...
    pip install -r requirements.txt
)

REM Inicia o servidor
echo Iniciando o servidor...
echo Servidor rodando em http://localhost:5000
echo Para encerrar, feche esta janela ou pressione Ctrl+C
python server.py

pause