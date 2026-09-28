const CACHE='damien-recommandations-v17-7-1';
const STATIC=['/manifest.webmanifest','/damien-royez.jpg','/favicon.png','/icons/apple-touch-icon.png','/icons/icon-192.png','/icons/icon-512.png','/icons/icon-maskable-512.png'];

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

self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch(e){data={body:event.data?.text()||''}}
  const title=data.title||'Damien Recommandations';
  const options={
    body:data.body||'Vous avez une nouvelle notification.',
    icon:'/icons/icon-192.png',
    badge:'/icons/icon-192.png',
    data:{url:data.url||'/?push=1',notification_id:data.notification_id||null,referral_id:data.referral_id||null},
    tag:data.notification_id||'damien-recommandations',
    renotify:true
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'/?push=1',self.location.origin).href;
  event.waitUntil((async()=>{
    const all=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of all){if('focus'in c){await c.focus();if('navigate'in c)await c.navigate(target);return}}
    if(clients.openWindow)return clients.openWindow(target);
  })());
});
