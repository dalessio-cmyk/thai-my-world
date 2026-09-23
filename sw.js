const CACHE='thai-my-world-v3';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './data-bootstrap.js',
  './data/production.js',
  './data/vfx.js',
  './data/management.js',
  './data/finance.js',
  './data/vendor.js',
  './data/travel.js',
  './data/restaurant.js',
  './data/social.js',
  './data/partners.js',
  './noon.js',
  './letters.js',
  './voice.js',
  './grammar.js',
  './vocab.js',
  './app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(()=>{});
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
  );
});
