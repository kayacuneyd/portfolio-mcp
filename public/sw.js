/* Workbox service worker for Portfolio MCP
   Uses Workbox CDN to precache core assets and apply runtime caching strategies.
   This is a simple setup; update the precache list on each deploy for proper cache invalidation.
*/

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  workbox.setConfig({ debug: false });

  // Precache basic app shell. Keep revisions updated on deploy if assets change.
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: 'v1' },
    { url: '/index.html', revision: 'v1' },
    { url: '/styles.min.css', revision: 'v1' },
    { url: '/app.min.js', revision: 'v1' }
  ]);

  // App shell routing for SPA navigation
  const handler = workbox.precaching.createHandlerBoundToURL('/index.html');
  const navigationRoute = new workbox.routing.NavigationRoute(handler);
  workbox.routing.registerRoute(navigationRoute);

  // Images: cache first, keep max entries
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
      ]
    })
  );

  // Static resources (css/js): stale-while-revalidate
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'static-resources' })
  );

  // API calls: network-first with short timeout
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 3,
      plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 50 })]
    })
  );

  // Catch handler for offline fallback (return offline page or cached index)
  self.addEventListener('fetch', (event) => {
    // Let Workbox handle routes; we only handle failures for navigation requests
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => caches.match('/index.html'))
      );
    }
  });

  console.log('✅ Workbox service worker registered');
} else {
  console.log('⚠️ Workbox failed to load');
}
