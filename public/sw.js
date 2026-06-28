const CACHE_NAME = "aureum-barber-cache-v1";
const ASSETS_TO_CACHE = [
  "/barbeiro",
  "/manifest.json",
  "/icon.svg",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Focus only on local assets and specific Google fonts
  const isLocal = url.origin === self.location.origin;
  const isGoogleFont =
    url.origin === "https://fonts.gstatic.com" ||
    url.origin === "https://fonts.googleapis.com";

  if (!isLocal && !isGoogleFont) return;

  // Let API requests handle themselves directly (or rely on React state offline fallback)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Caching strategy: Network First, Fallback to Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for local static files
        if (
          response &&
          response.status === 200 &&
          response.type === "basic" &&
          !url.pathname.startsWith("/_next/data/") // avoid caching dynamic next data loads
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the main dashboard page is not cached, return the offline fallback
          if (event.request.mode === "navigate") {
            return caches.match("/barbeiro");
          }
        });
      })
  );
});
