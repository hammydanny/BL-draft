// BLUE LOCK DRAFT // STATIC IMAGE CACHE // v0.6.6.4
const CACHE_NAME="bld-static-v0.6.6.4";
const CACHEABLE=/\.(?:avif|webp|png|jpe?g|woff2)$/i;

self.addEventListener("install",event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener("activate",event=>{
    event.waitUntil((async()=>{
        const keys=await caches.keys();
        await Promise.all(keys.filter(key=>key.startsWith("bld-static-")&&key!==CACHE_NAME).map(key=>caches.delete(key)));
        await self.clients.claim();
    })());
});
self.addEventListener("fetch",event=>{
    const request=event.request;
    if(request.method!=="GET")return;
    const url=new URL(request.url);
    if(url.origin!==self.location.origin||!CACHEABLE.test(url.pathname))return;
    event.respondWith((async()=>{
        const cache=await caches.open(CACHE_NAME);
        const cached=await cache.match(request,{ignoreSearch:true});
        if(cached)return cached;
        const response=await fetch(request);
        if(response.ok)event.waitUntil(cache.put(request,response.clone()));
        return response;
    })());
});
self.addEventListener("message",event=>{
    if(event.data?.type!=="WARM_PORTRAITS"||!Array.isArray(event.data.urls))return;
    event.waitUntil((async()=>{
        const cache=await caches.open(CACHE_NAME);
        const urls=[...new Set(event.data.urls)].filter(Boolean);
        let cursor=0;
        const worker=async()=>{
            while(cursor<urls.length){
                const url=urls[cursor++];
                try{
                    const request=new Request(url,{credentials:"same-origin"});
                    if(await cache.match(request,{ignoreSearch:true}))continue;
                    const response=await fetch(request);
                    if(response.ok)await cache.put(request,response.clone());
                }catch{}
            }
        };
        await Promise.all(Array.from({length:Math.min(10,urls.length)},worker));
    })());
});
