// Debug flag - replaced during build (true in dev, false in production)
const DEBUG = false;

const CACHE_NAME = 'slurm-cache-2025-11-02T18-01-34';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/worker.js',
    '/favicon.svg',
    '/favicon.png',
    '/favicon.ico',
    '/favicon-32x32.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icon.svg',
    '/libs/enc-uint8array.min.js',
    '/libs/aes_crypt.min.js',
    '/assets/index-4nu6XbR2.js',
    '/assets/index-qcR2926f.css',
    '/assets/materialdesignicons-webfont-6eb_lmTU.woff2',
    '/assets/materialdesignicons-webfont-D15t_tsC.woff',
    '/assets/materialdesignicons-webfont-e5j8FT_3.ttf',
    '/assets/materialdesignicons-webfont-kq_ClZaA.eot',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/core.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/enc-utf16.min.js'
];

self.addEventListener('install', event => {
    if (DEBUG) console.log('[SW] Installing new service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Cache files individually to avoid installation failure if one file fails
                const cachePromises = urlsToCache.map(url => {
                    return cache.add(url).catch(err => {
                        if (DEBUG) console.warn('[SW] Failed to cache:', url, err);
                        // Don't throw - allow installation to continue with partial cache
                    });
                });

                return Promise.all(cachePromises);
            })
            .then(() => {
                if (DEBUG) console.log('[SW] Installation complete, waiting for activation');
            })
            .catch(err => {
                console.error('[SW] Installation failed:', err);
            })
    );
    // Don't automatically skip waiting - let the user decide when to update
    // self.skipWaiting() will be called when user clicks "Update Now"
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // For font files and favicons, ignore query parameters when matching cache
    // This allows cached resources to match requests with version/cache-busting params
    const isFontFile = /\.(woff2?|ttf|eot|otf)$/i.test(url.pathname);
    const isFavicon = /favicon\.(svg|png|ico)|favicon-\d+x\d+\.png/i.test(url.pathname);
    const shouldIgnoreSearch = isFontFile || isFavicon;
    const matchOptions = shouldIgnoreSearch ? { ignoreSearch: true } : {};

    event.respondWith(
        caches.match(request, matchOptions)
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

                        // Only cache GET requests (Cache API doesn't support HEAD, POST, etc.)
                        const isGetRequest = request.method === 'GET';

                        // Cache all responses regardless of type (including CORS)
                        // This fixes the CDN caching issue
                        const shouldCache = isGetRequest && (
                            response.type === 'basic' ||           // Same-origin
                            response.type === 'cors'               // CORS (CDN resources)
                        );

                        if (shouldCache) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                })
                                .catch(err => {
                                    if (DEBUG) console.warn('[SW] Failed to cache:', request.url, err);
                                });
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

// Listen for messages from the client (for update control)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        if (DEBUG) console.log('[SW] Received SKIP_WAITING message, activating new service worker...');
        self.skipWaiting();
    }
}); 