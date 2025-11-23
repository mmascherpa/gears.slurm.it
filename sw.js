// Debug flag - disabled for production (enable only during development)
const DEBUG = false;

const CACHE_NAME = 'slurm-cache-2025-11-23T21-32-34';
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
    '/assets/About-ClGNkT5s.js',
    '/assets/AesDecrypt-D3yn3oYz.js',
    '/assets/AesEncrypt-DOSvifX2.js',
    '/assets/Base64Decode-Jh9_8VQt.js',
    '/assets/Base64Encode-DJTBNpiO.js',
    '/assets/CardSectionHeader-D1kN7Wuj.js',
    '/assets/CsvPreviewTable-bhG1WC7u.js',
    '/assets/EducationalAlert-KxFBZb_t.js',
    '/assets/FileUpload-DIrAnUGa.js',
    '/assets/HexViewer-DhgE2tpL.js',
    '/assets/InfoTooltip-Dv5jdlbH.js',
    '/assets/MetadataEditor-BzHJhJ_S.js',
    '/assets/PasswordGenerator-BTD6Z5-C.js',
    '/assets/PasswordInput-CP1MaKAM.js',
    '/assets/PasswordStrengthIndicator-CntUE4tE.js',
    '/assets/QrCodeGenerator-BQ6SWaQd.js',
    '/assets/TextInputWithActions-hOPLZdps.js',
    '/assets/ToolPageHeader-D-k5Jt3k.js',
    '/assets/fileDownload-B1vhVzTR.js',
    '/assets/index-CYaz045G.js',
    '/assets/useClipboard-KqVwDR14.js',
    '/assets/useDebounce-Cu5x-8Qr.js',
    '/assets/Base64Decode-DPonph36.css',
    '/assets/Base64Encode-DMPSs3q8.css',
    '/assets/FileUpload-Bh0Hu62H.css',
    '/assets/HexViewer-CRmqES-4.css',
    '/assets/MetadataEditor-56yngIGo.css',
    '/assets/PasswordGenerator-nPFnjeel.css',
    '/assets/PasswordStrengthIndicator-DOaI3AXz.css',
    '/assets/QrCodeGenerator-D6VrR134.css',
    '/assets/TextInputWithActions-CmArFb31.css',
    '/assets/index-CaYeA4OR.css',
    '/assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc-DqGufNeO.woff2',
    '/assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7-Dx4kXJAl.woff2',
    '/assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc-CkhJZR-_.woff2',
    '/assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc-DO1Apj_S.woff2',
    '/assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc-BOeWTOD4.woff2',
    '/assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc-DlzME5K_.woff2',
    '/assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc-CBcvBZtf.woff2',
    '/assets/V8mDoQDjQSkFtoMM3T6r8E7mPb54C-s0-D0rl6rjA.woff2',
    '/assets/V8mDoQDjQSkFtoMM3T6r8E7mPb94C-s0-D9tNdqV9.woff2',
    '/assets/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw-BhU9QXUp.woff2',
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