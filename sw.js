/* Forg3d.Art service worker — cosplay-only static shell. */
'use strict';

const CACHE_VERSION = 'forg3d-v4';
const PRECACHE = [
  '/',
  '/index.html',
  '/info.html',
  '/404.html',
  '/products/optimus-prime-cosplay-mask.html',
  '/products/sauron-cosplay-mask.html',
  '/products/wolverine-cosplay-mask.html',
  '/products/jack-skellington-cosplay-mask.html',
  '/products/deadpool-cosplay-mask.html',
  '/products/joker-bank-heist-cosplay-mask.html',
  '/products/iron-man-mk-46-cosplay-mask.html',
  '/products/discohead-cosplay-mask.html',
  '/products/oni-demon-cosplay-mask.html',
  '/styles.css',
  '/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/forg3dart_small.png',
  '/forg3dart_512.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/images/optimus-prime-cosplay-mask-egypt.jpeg',
  '/images/optimus-prime-cosplay-mask-egypt-2.jpg',
  '/images/sauron-cosplay-mask-egypt.jpg',
  '/images/sauron-cosplay-mask-egypt-2.jpg',
  '/images/wolverine-cosplay-mask-egypt.webp',
  '/images/wolverine-cosplay-mask-egypt-2.webp',
  '/images/jack-skellington-cosplay-mask-egypt.png',
  '/images/jack-skellington-cosplay-mask-egypt-2.png',
  '/images/deadpool-cosplay-mask-egypt.webp',
  '/images/deadpool-cosplay-mask-egypt-2.webp',
  '/images/joker-cosplay-mask-egypt.webp',
  '/images/joker-cosplay-mask-egypt-2.webp',
  '/images/iron-man-cosplay-mask-egypt.webp',
  '/images/iron-man-cosplay-mask-egypt-2.webp',
  '/images/discohead-cosplay-mask-egypt.webp',
  '/images/discohead-cosplay-mask-egypt-2.webp',
  '/images/oni-demon-cosplay-mask-egypt.webp',
  '/images/oni-demon-cosplay-mask-egypt-2.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(name => name.startsWith('forg3d-') && name !== CACHE_VERSION)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

async function cacheValidResponse(request, response) {
  if (response.ok && !response.redirected) {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname === '/main.js' || url.pathname === '/styles.css') {
    event.respondWith(
      fetch(request)
        .then(response => cacheValidResponse(request, response))
        .catch(() => caches.match(request))
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => cacheValidResponse(request, response))
        .catch(async () => (await caches.match(request)) || caches.match('/404.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => cacheValidResponse(request, response));
    })
  );
});
