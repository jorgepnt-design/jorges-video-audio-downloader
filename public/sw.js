const CACHE_NAME = "wm-2026-companion-v10";
const BASE_PATH = "/wm-2026-companion/";
const STATIC_ASSETS = [BASE_PATH, `${BASE_PATH}index.html`, `${BASE_PATH}offline.html`, `${BASE_PATH}manifest.json`, `${BASE_PATH}icons/icon-192.svg`, `${BASE_PATH}icons/icon-512.svg`];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match(`${BASE_PATH}offline.html`)));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(`${BASE_PATH}offline.html`));
    }),
  );
});
