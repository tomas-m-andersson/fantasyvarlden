// Fantasyvärlden – service worker.
// Egna filer: nätet först (så uppdateringar syns direkt), cachen som reserv när man är offline.
// GitHub-API:t (sparfilen) cachas aldrig.
const CACHE = "fantasyvarlden-v58";
const SHELL = ["./","./index.html","./spel.js","./regler.js","./varld.js","./hjaltar.js","./figurer.js","./fiendebilder.js","./bakgrund.js","./grafik.js","./manifest.json","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
function put(req, res){ if(res && (res.ok || res.type === "opaque")){ const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; }
self.addEventListener("fetch", e => {
  const req = e.request; if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.hostname === "api.github.com") return;
  if(url.origin === location.origin){
    e.respondWith(fetch(req, {cache:"no-cache"}).then(r => put(req, r)).catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
    return;
  }
  if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => put(req, res))));
  }
});
