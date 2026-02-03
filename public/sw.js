// Detect BASE_PATH van Service Worker URL
const BASE_PATH = self.location.pathname.replace('/sw.js', '');

const CACHE_NAME = 'awl-scanner-v4'; // Versie bump: pure server-side HEIC
const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/manifest.json',  // Dynamic endpoint
  BASE_PATH + '/icon-192.png',
  BASE_PATH + '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
].map(url => {
  // Voor externe URLs, return as-is
  if (url.startsWith('http')) return url;
  // Voor interne URLs, converteer naar absolute URL
  return new URL(url, self.location.origin).href;
});

console.log('Service Worker BASE_PATH:', BASE_PATH || '/ (root)');
console.log('Caching URLs:', urlsToCache);

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Don't cache API calls
  if (event.request.url.includes('/api/')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
