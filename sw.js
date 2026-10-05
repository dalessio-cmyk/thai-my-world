const CACHE='thai-my-world-v9';
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
  './visuals.js',
  './app.js',
  './teacher.js',
  './gemini-live.js',
  './gemini-pcm-worklet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("thai-my-world-") && k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const assets = new Set(ASSETS.map(path => new URL(path, self.registration.scope).href));
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !assets.has(url.href)) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if(response.ok){
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(()=>{}));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
