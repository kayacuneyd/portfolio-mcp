/* Versioned Workbox service worker for Portfolio MCP - v2
   This worker forces immediate activation and claims clients so updated
   assets (including profile image changes) are picked up promptly.
*/

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  workbox.setConfig({ debug: false });

  // Ensure new SW activates and takes control immediately
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  workbox.precaching.precacheAndRoute([
    { url: '/', revision: 'v2' },
    { url: '/index.html', revision: 'v2' },
    { url: '/styles.min.css', revision: 'v2' },
    { url: '/app.min.js', revision: 'v2' }
  ]);

  // Images: cache-first
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache-v2',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
      ]
    })
  );

  // Static resources (css/js): stale-while-revalidate
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'static-resources-v2' })
  );

  // API: network-first
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({ cacheName: 'api-cache-v2', networkTimeoutSeconds: 3 })
  );

  // Navigation fallback
  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    }
  });

  console.log('✅ Workbox sw-v2 registered');
} else {
  console.log('⚠️ Workbox failed to load (sw-v2)');
}
