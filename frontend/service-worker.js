const CACHE_NAME = 'dengue-watch-v1';

const APP_FILES = [
    './',
    './index.html',

    './map.html',
    './knowledge.html',
    './assessment.html',
    './report-breeding.html',

    './css/style.css',
    './css/map.css',
    './css/knowledge.css',
    './css/assessment.css',
    './css/report-breeding.css',

    './js/app.js',
    './js/map.js',
    './js/knowledge.js',
    './js/assessment.js',
    './js/report-breeding.js',

    './manifest.json',

    './icons/icon-192.png',
    './icons/icon-512.png'
];


// ================================
// INSTALL
// ================================

self.addEventListener('install', (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => {

                return cache.addAll(APP_FILES);

            })

    );

    self.skipWaiting();

});


// ================================
// ACTIVATE
// ================================

self.addEventListener('activate', (event) => {

    event.waitUntil(

        caches.keys()
            .then((cacheNames) => {

                return Promise.all(

                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))

                );

            })

    );

    self.clients.claim();

});


// ================================
// FETCH
// ================================

self.addEventListener('fetch', (event) => {

    // ไม่ cache API
    if (event.request.url.includes('/api/')) {
        return;
    }

    // เฉพาะ GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then((response) => {

                const responseClone = response.clone();

                caches.open(CACHE_NAME)
                    .then((cache) => {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                return response;

            })

            .catch(() => {

                return caches.match(event.request);

            })

    );

});