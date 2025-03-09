document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pixForm');
    const resultadoPix = document.getElementById('resultadoPix');
    const btnCopiar = document.getElementById('btnCopiar');
    let codigoPix = '';

    // Função para mostrar notificação
    function mostrarNotificacao(mensagem) {
        const notificacao = document.getElementById('notificacao');
        notificacao.textContent = mensagem;
        notificacao.classList.add('show');

        // Fechar notificação ao clicar
        notificacao.addEventListener('click', () => {
            notificacao.classList.remove('show');
        });

        // Fechar automaticamente após 3.5 segundos
        setTimeout(() => {
            notificacao.classList.remove('show');
        }, 3500);
    }

    // Função para validar os campos
    function validarCampos(formData) {
        const key = formData.get('key');
        const name = formData.get('name');
        const city = formData.get('city');
        const value = formData.get('value');
        const identifier = formData.get('identifier');

        if (!key) {
            mostrarNotificacao('Por favor, preencha a chave PIX');
            return false;
        }
        if (!name) {
            mostrarNotificacao('Por favor, preencha o nome do recebedor');
            return false;
        }
        if (!city) {
            mostrarNotificacao('Por favor, preencha a cidade');
            return false;
        }
        if (!value || value <= 0) {
            mostrarNotificacao('Por favor, insira um valor válido');
            return false;
        }
        if (!identifier || !/^\d{1,8}$/.test(identifier)) {
            mostrarNotificacao('O identificador deve conter até 8 números');
            return false;
        }

        return true;
    }

    // Função para gerar o código PIX
    async function gerarCodigoPix(dados) {
        try {
            const response = await fetch('/api/gerar-pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.erro || 'Erro ao gerar o código PIX');
            }

            const data = await response.json();
            return data.codigo;
        } catch (error) {
            mostrarNotificacao('Erro ao gerar o código PIX. Tente novamente mais tarde.');
            return null;
        }
    }

    // Manipulador do envio do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        if (!validarCampos(formData)) {
            return;
        }

        const dados = {
            key: formData.get('key'),
            name: formData.get('name'),
            city: formData.get('city'),
            value: parseFloat(formData.get('value')),
            identifier: formData.get('identifier')
        };

        codigoPix = await gerarCodigoPix(dados);
        
        if (codigoPix) {
            resultadoPix.style.display = 'block';
            mostrarNotificacao('Código PIX gerado com sucesso!');
        }
    });

    // Manipulador do botão copiar
    btnCopiar.addEventListener('click', () => {
        if (codigoPix) {
            navigator.clipboard.writeText(codigoPix)
                .then(() => {
                    mostrarNotificacao('Código PIX copiado para a área de transferência!');
                })
                .catch(() => {
                    mostrarNotificacao('Erro ao copiar o código PIX');
                });
        }
    });

    // Registro do Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    // Verificar atualizações do Service Worker
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                mostrarNotificacaoAtualizacao();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('Erro ao registrar Service Worker:', error);
                });

            // Verificar se há uma nova versão disponível
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        });
    }

    // Função para mostrar notificação de atualização
    function mostrarNotificacaoAtualizacao() {
        const notificacao = document.createElement('div');
        notificacao.className = 'notificacao-atualizacao';
        notificacao.innerHTML = `
            <p>Nova versão disponível!</p>
            <button onclick="atualizarAplicacao()">Atualizar agora</button>
        `;
        document.body.appendChild(notificacao);
    }

    // Função para atualizar a aplicação
    function atualizarAplicacao() {
        if (!navigator.serviceWorker.controller) {
            return;
        }

        navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }
}); 