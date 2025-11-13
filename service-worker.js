const CACHE_NAME = "qr-maker-cache-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./styles/main.css",
  "./styles/splash.css",
  "./styles/generator.css",
  "./styles/scanner.css",
  "./styles/history.css",
  "./scripts/main.js",
  "./scripts/navigation.js",
  "./scripts/generator.js",
  "./scripts/scanner.js",
  "./scripts/history.js",
  "./scripts/share.js",
  "https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// Install event: cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event: serve cached files if available
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
