/* Spasser Vest — service worker */
const CACHE = 'kortspil-v13';
const ASSETS = [
  './',
  './index.html',
  './kabale.html',
  './edderkop.html',
  './frimaerke.html',
  './minestryger.html',
  './sudoku.html',
  './tetris.html',
  './yatzy.html',
  './varulv.html',
  './skak.html',
  './2048.html',
  './slange.html',
  './kryds-bolle.html',
  './vendespil.html',
  './fire-paa-stribe.html',
  './reversi.html',
  './dam.html',
  './moelle.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        // cache same-origin successful responses
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      // serve cache first, fall back to network
      return cached || network;
    })
  );
});
