const CACHE='pantrymind-v11';
const FILES=['./','index.html','styles.css','app.mjs','core.mjs','storage.mjs','kitchen.mjs','food-vocabulary.mjs','images/food-fallback.svg','estimation.mjs','recognition-client.mjs','recognition-worker.mjs','vendor/transformers.min.js','vendor/ort.bundle.min.mjs','vendor/ort-wasm-simd-threaded.jsep.mjs','vendor/ort-wasm-simd-threaded.jsep.wasm','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest','data/nutrition.json','data/recipes.json','data/photo-credits.json','images/salad.jpg','images/pasta.jpg','images/rice.jpg','images/breakfast.jpg','images/burger.jpg','images/pizza.jpg','images/biryani.jpg','images/curry.jpg','images/eggs.jpg','images/soup.jpg','images/fish.jpg','images/sandwich.jpg','images/oats.jpg','images/potato.jpg','images/pancakes.jpg','images/omelette.jpg','images/spanish-omelette.jpg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pantrymind-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
