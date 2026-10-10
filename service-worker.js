// Images/fonts only. HTML, CSS and JavaScript always use the network/browser cache.
const CACHE_NAME="bld-static-v0.6.8";
const CACHEABLE=/\.(?:avif|webp|svg|png|jpe?g|woff2)$/i;
const scope=new URL(self.registration.scope);
function staticAsset(url){return url.origin===scope.origin&&url.pathname.startsWith(scope.pathname)&&CACHEABLE.test(url.pathname);}
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith("bld-static-")&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
    const request=event.request,url=new URL(request.url);
    if(request.method!=="GET"||!staticAsset(url))return;
    const refresh=async cache=>{
        const response=await fetch(request);
        if(response.ok)event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
        else if(response.status===404||response.status===410)event.waitUntil(cache.delete(request).catch(()=>{}));
        return response;
    };
    event.respondWith((async()=>{
        let cache;
        try{cache=await caches.open(CACHE_NAME);}catch{return fetch(request);}
        // Match the complete URL, including versions. Revalidate cached assets in the background.
        const cached=await cache.match(request);
        if(cached){event.waitUntil(refresh(cache).catch(()=>{}));return cached;}
        return refresh(cache);
    })());
});
