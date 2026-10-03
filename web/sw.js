const CACHE='pantrymind-v2';
const FILES=['./','index.html','styles.css','app.mjs','core.mjs','storage.mjs','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest','data/nutrition.json','data/recipes.json','data/photo-credits.json','images/salad.jpg','images/pasta.jpg','images/rice.jpg','images/breakfast.jpg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pantrymind-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
