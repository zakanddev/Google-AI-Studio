const CACHE_NAME = 'ai-flappy-game-v1';
// Add all the app's shell files to the cache.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/services/geminiService.ts',
  '/services/historyService.ts',
  '/services/preloadedThemes.ts',
  '/components/Game.tsx',
  '/components/Bird.tsx',
  '/components/Pipe.tsx',
  '/components/Background.tsx',
  '/components/BirdTrail.tsx',
  '/components/UI/ThemeGenerator.tsx',
  '/components/UI/StartScreen.tsx',
  '/components/UI/GameOverScreen.tsx',
  '/manifest.json',
  '/icon.svg'
];

// Install the service worker and cache all the app's content.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// On fetch, serve from cache if available, otherwise fetch from network and cache.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request to use it both for fetch and cache.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }

            // Clone the response to use it for both browser and cache.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                  // Don't cache Gemini API calls.
                if (!event.request.url.includes('generativelanguage')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

// Clean up old caches on activation.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});