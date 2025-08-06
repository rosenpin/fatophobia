// Service Worker for Body Perception Assessment PWA

const CACHE_NAME = 'fatophob-assessment-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/src/1.png',
    '/src/2.png',
    '/src/3.png',
    '/src/4.png',
    '/src/5.png',
    '/src/6.png',
    '/src/7.png',
    '/src/8.png',
    '/src/9.png',
    '/src/10.png',
    '/src/11.png',
    '/src/12.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            self.clients.claim();
        })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    // Skip API requests - always go to network
    if (event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(() => {
                // If both cache and network fail, show offline page for HTML requests
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
            })
    );
});