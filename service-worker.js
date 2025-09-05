// FORGE PWA — simple app-shell cache
const CACHE = "forge-v3.1.3";
const BASE  = "/FORGE/"; // wichtig wegen GitHub Pages Unterpfad
const ASSETS = [
  BASE,
  BASE + "index.html"
  // manifest NICHT cachen
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Manifest immer direkt aus dem Netz (auch mit ?v=…)
  if (url.pathname.endsWith("manifest.webmanifest")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // JSON/APIs → network first
  const isJSON = e.request.headers.get("accept")?.includes("application/json");
  if (isJSON) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Rest → cache first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
