/* Erişkin Aşı Sihirbazı – çevrimdışı önbellek */
const SURUM = "asi-sihirbazi-v1";
const DOSYALAR = ["./", "index.html", "manifest.webmanifest", "lib/html2canvas.min.js", "lib/jspdf.umd.min.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Sayfa: önce ağ (güncel sürüm), ağ yoksa önbellek
  if (req.mode === "navigate" || (url.origin === location.origin && url.pathname.endsWith("/index.html"))) {
    e.respondWith(fetch(req).then(r => { const k = r.clone(); caches.open(SURUM).then(c => c.put("index.html", k)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // Yazı tipleri ve diğer dosyalar: önce önbellek, sonra ağ
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(h => h || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const k = r.clone(); caches.open(SURUM).then(c => c.put(req, k)); } return r; })));
  }
});
