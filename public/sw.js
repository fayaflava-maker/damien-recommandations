const CACHE='damien-recommandations-v15-2';
self.addEventListener('install',e=>e.waitUntil((async()=>{await caches.open(CACHE).then(c=>c.addAll(['/','/index.html','/manifest.webmanifest','/damien-royez.jpg']));await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{await caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))));await self.clients.claim();})()));
self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
