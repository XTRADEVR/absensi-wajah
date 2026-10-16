const CACHE_NAME = 'gold-king-v1.4-cache';
const ASSETS_TO_CACHE = [
  './ABSENSI-WAJAH-V1.4-PWA-GOLD.html',
  './manifest.json',
  './sw.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Biarkan request Nominatim OSM online langsung tanpa dicegat cache lama
  if (event.request.url.includes('nominatim.openstreetmap.org') || event.request.url.includes('openstreetmap.org')) {
    event.respondWith(fetch(event.request).catch(() => new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        return caches.match('./ABSENSI-WAJAH-V1.4-PWA-GOLD.html');
      });
    })
  );
});
