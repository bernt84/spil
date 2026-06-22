/* Spasser Vest — service worker */
const CACHE = 'kortspil-v20';
const ASSETS = [
  './',
  './index.html',
  './kabale.html',
  './edderkop.html',
  './frimaerke.html',
  './freecell.html',
  './pyramide.html',
  './fyrre-og-tyve.html',
  './krig.html',
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
  './moelle.html',
  './taarnforsvar.html',
  './byg-taarn.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // Cache files individually so one missing file doesn't break the whole install
      Promise.allSettled(ASSETS.map(url => c.add(url)))
    ).then(() => self.skipWaiting())
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
  const url = new URL(e.request.url);
  const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHTML) {
    // Network-first for pages: always try to get the newest version online,
    // fall back to cache only when offline. Prevents being stuck on old versions.
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for other assets (icons etc.)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
