/* ============================================================
   Forg3d.Art — Service Worker
   Cache-first for the static shell, network-first for pages,
   so content stays fresh while the site works offline.
   Bump CACHE_VERSION whenever styles.css / main.js change.
   ============================================================ */
const CACHE_VERSION = 'forg3d-v2';
const PRECACHE = [
  '/',
  '/index.html',
  '/custom-gifts.html',
  '/guides.html',
  '/guide-birthdays.html',
  '/guide-weddings.html',
  '/guide-couples.html',
  '/guide-corporate.html',
  '/guide-islamic.html',
  '/guide-diaspora.html',
  '/portfolio.html',
  '/info.html',
  '/404.html',
  '/styles.css',
  '/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Only handle same-origin GET requests; let WhatsApp, fonts, analytics pass through.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  const isPage = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isPage) {
    // Network-first for HTML so pages stay up to date, fall back to cache/offline.
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/404.html')))
    );
  } else {
    // Cache-first for static assets (css/js/images).
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(() => cached))
    );
  }
});
