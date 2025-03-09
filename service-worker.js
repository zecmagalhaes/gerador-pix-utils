const CACHE_NAME = 'pix-generator-v1';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'styles.css',
    'script.js',
    'manifest.json',
    'assets/images/pix-icon.svg',
    'assets/images/apple-touch-icon.png',
    'assets/images/apple-touch-icon-152x152.png',
    'assets/images/apple-touch-icon-167x167.png',
    'assets/images/apple-touch-icon-180x180.png',
    'assets/images/icon-192x192.png',
    'assets/images/icon-512x512.png',
    'assets/images/favicon-16x16.png',
    'assets/images/favicon-32x32.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Tenta fazer cache de cada arquivo individualmente
                return Promise.all(
                    ASSETS_TO_CACHE.map(url => {
                        return fetch(url)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`Failed to cache ${url}`);
                                }
                                return cache.put(url, response);
                            })
                            .catch(error => {
                                console.warn(`Failed to cache ${url}:`, error);
                                // Continua mesmo se um arquivo falhar
                                return Promise.resolve();
                            });
                    })
                );
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    if (event.request.method === 'GET') {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(event.request)
                        .then((networkResponse) => {
                            // Verifica se a resposta é válida
                            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                                return networkResponse;
                            }

                            // Faz cache da nova resposta
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });

                            return networkResponse;
                        })
                        .catch(() => {
                            // Retorna uma resposta de fallback se estiver offline
                            return new Response('Offline - Conteúdo não disponível');
                        });
                })
        );
    }
});

// Recebimento de mensagens
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

// Gerenciamento de notificações push
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Atualização disponível!',
        icon: 'assets/images/pix-icon.svg',
        badge: 'assets/images/pix-icon.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver atualização'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Gerador PIX Atualizado', options)
    );
}); 