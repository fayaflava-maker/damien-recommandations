const CACHE='damien-recommandations-v15-4';
const STATIC=['/manifest.webmanifest','/damien-royez.jpg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        return await fetch(req,{cache:'no-store'});
      }catch(err){
        const cached=await caches.match('/index.html');
        if(cached) return cached;
        throw err;
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(req);
    if(cached) return cached;
    const fresh=await fetch(req);
    if(fresh && fresh.ok && new URL(req.url).origin===self.location.origin){
      const cache=await caches.open(CACHE);
      cache.put(req,fresh.clone());
    }
    return fresh;
  })());
});
