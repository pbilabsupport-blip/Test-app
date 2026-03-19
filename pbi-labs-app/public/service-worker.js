const CACHE_NAME = 'pbi-vault-cache-v2';
const urlsToCache = ['/', '/index.html', '/manifest.json', '/logo191.png', '/logo192.png', '/logo512.png'];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// NETWORK-FIRST STRATEGY: Fixes the "Zombie App" cache loophole
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If the network works, save a copy to the cache and return the fresh data
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // If offline, serve from the cache
        return caches.match(event.request);
      })
  );
});