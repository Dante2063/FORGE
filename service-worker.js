// Simple app-shell cache for FORGE (GitHub Pages, subpath /FORGE/)
const CACHE = "forge-v3.1.1";   // <— neue Version, zwingt Update
const BASE = "/FORGE/";
const ASSETS = [
  BASE,
  BASE + "index.html",
  // ⚠️ Manifest NICHT mehr cachen!
  // BASE + "manifest.webmanifest"
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

// Netzwerk-Strategie:
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 1) Manifest IMMER aus dem Netz holen (keine Cache-Version!)
  if (url.pathname.endsWith("manifest.webmanifest")) {
    e.respondWith(fetch(req));
    return;
  }

  // 2) JSON (OpenFoodFacts) network-first
  const isJSON = req.headers.get("accept")?.includes("application/json");
  if (isJSON) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // 3) Standard: cache-first für statische Assets
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
