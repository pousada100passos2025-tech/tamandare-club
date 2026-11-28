const CACHE = "tamandare-pdv-shell-v1";
const SHELL = ["/pdv-offline", "/club/tamandare-club-profile.png"];
self.addEventListener("install", event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("tamandare-pdv-shell-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
 const url = new URL(event.request.url);
 if (event.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
 if (url.pathname === "/pdv-offline") {
  event.respondWith(fetch(event.request).then(response => {
   if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
   return response;
  }).catch(() => caches.match(event.request)));
 }
});
