const CACHE = "raiz-v1";
const ASSETS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  event.respondWith(
    caches
      .match(request)
      .then((response) => response || fetch(request))
      .catch(() => {
        if (request.destination === "document") {
          return caches.match("/");
        }
      })
  );
});
