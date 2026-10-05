const CACHE_NAME = "redsun-app-v9-purple-icons";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icons/add.png",
  "./assets/icons/calendar.png",
  "./assets/icons/cancel.png",
  "./assets/icons/confirm.png",
  "./assets/icons/delete.png",
  "./assets/icons/edit.png",
  "./assets/icons/image.png",
  "./assets/icons/key.png",
  "./assets/icons/list.png",
  "./assets/icons/lock.png",
  "./assets/icons/moon.png",
  "./assets/icons/pdf.png",
  "./assets/icons/products.png",
  "./assets/icons/settings.png",
  "./assets/icons/sun.png",
  "./assets/icons/upload.png",
  "./assets/icons/wallet.png",
  "./redsun-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put("./index.html", copy));

          return response;
        })
        .catch(() => caches.match("./index.html"))
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }

            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, copy));

            return response;
          });
      })
  );
});
