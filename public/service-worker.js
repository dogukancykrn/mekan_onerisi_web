const CACHE_NAME = 'mekan-takip-v1';

// Install: immediately take control on update
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: claim clients so new SW takes effect
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch: network-first for assets, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        // Optionally cache successful GET responses for future
        if (event.request.method === 'GET' && resp && resp.ok) {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, respClone);
          });
        }
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
