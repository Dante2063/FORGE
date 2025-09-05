// Simple app-shell cache for FORGE (GitHub Pages, subpath /FORGE/)
const CACHE = "forge-v3.1.0";
const BASE = "/FORGE/";
const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // network-first for JSON (OpenFoodFacts), cache-first for static
  const isJSON = req.headers.get("accept")?.includes("application/json");
  if (isJSON) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
  } else {
    e.respondWith(caches.match(req).then((r) => r || fetch(req)));
  }
});
