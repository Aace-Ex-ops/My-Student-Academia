// Immediate cache purge & service worker unregister script
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass-through to network for all requests (zero caching)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
