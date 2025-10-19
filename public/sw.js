const CACHE_NAME = 'slurm-cache-v2.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/worker.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/libs/enc-uint8array.min.js',
    '/libs/aes_crypt.min.js',
    // CDN dependencies for crypto (CORS)
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/core.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/enc-utf16.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('Failed to cache resources during install:', err);
                    throw err;
                });
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    const { request } = event;

    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Cache all responses regardless of type (including CORS)
                        // This fixes the CDN caching issue
                        const shouldCache =
                            response.type === 'basic' ||           // Same-origin
                            response.type === 'cors';              // CORS (CDN resources)

                        if (shouldCache) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                })
                                .catch(err => console.warn('Failed to cache:', request.url, err));
                        }

                        return response;
                    })
                    .catch(err => {
                        console.error('Fetch failed for:', request.url, err);

                        // Offline fallback: return a user-friendly error for HTML requests
                        const acceptHeader = request.headers.get('accept');
                        if (acceptHeader && acceptHeader.includes('text/html')) {
                            return new Response(
                                '<h1>Offline</h1><p>You are currently offline and this page is not cached.</p>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        }

                        throw err;
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()  // Take control of all pages immediately
        ])
    );
}); 