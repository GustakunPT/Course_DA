const CACHE_NAME = 'mercearia-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isPyodideCdn = url.origin === 'https://cdn.jsdelivr.net' && url.pathname.startsWith('/pyodide/v0.26.4/');

  if (!isSameOrigin && !isPyodideCdn) return;

  // Navegação HTML: network-first com fallback em cache para suportar offline após primeira visita.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            void caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/index.html'))),
    );
    return;
  }

  // Artefactos versionados (Vite assets com hash e Pyodide v0.26.4): cache-first.
  if (isPyodideCdn || (isSameOrigin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/pyodide/')))) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            void caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        });
      }),
    );
    return;
  }

  // CSVs e sql-wasm.wasm: stale-while-revalidate.
  if (isSameOrigin && (url.pathname.startsWith('/dados/') || url.pathname === '/sql-wasm.wasm')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            void caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        });
        return cached || networkFetch;
      }),
    );
  }
});
