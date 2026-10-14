// One image boundary for every player UI. Metadata is optional; canon data stays intact.
const PLAYER_IMAGE_FALLBACK="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="272" viewBox="0 0 240 272"><rect width="240" height="272" fill="#0b2035"/><path d="M0 224 240 24M0 264 240 64" stroke="#16374e" stroke-width="1"/><circle cx="120" cy="94" r="35" fill="#355d78"/><path d="M46 225c0-51 29-83 74-83s74 32 74 83" fill="#355d78"/><path d="M24 24h36M24 24v36M216 248h-36M216 248v-36" fill="none" stroke="#3bbaff" stroke-width="2"/><text x="120" y="254" text-anchor="middle" fill="#b9e4ff" font-family="sans-serif" font-size="13" letter-spacing="4">BL DRAFT</text></svg>');
const playerPortraitRoot=new URL("../",document.currentScript?.src||new URL("js/player-images.js",document.baseURI));
function playerImageSource(player){
    const metadata=player?.imageSource;
    const source=metadata&&typeof metadata==="object"?metadata:{};
    const candidate=source.approved===true&&source.url?source.url:player?.image;
    let url=PLAYER_IMAGE_FALLBACK;
    try{
        const resolved=new URL(candidate,playerPortraitRoot);
        if(resolved.origin===playerPortraitRoot.origin&&resolved.pathname.startsWith(playerPortraitRoot.pathname+"images/"))resolved.searchParams.set("v",APP_VERSION);
        if(candidate&&["http:","https:","file:"].includes(resolved.protocol))url=resolved.href;
    }catch{/* A missing source uses the neutral profile. */}
    return {url,fallback:PLAYER_IMAGE_FALLBACK,credit:source.credit||player?.imageCredit||null,reference:source.reference||null,rightsStatus:source.rightsStatus||player?.imageRightsStatus||"unreviewed"};
}
function playerImageUrl(player){return playerImageSource(player).url;}
// One request per canonical URL, shared by warming and every visible portrait.
// Detached cards release their work; background requests cannot consume all slots.
const portraitDecodeCache=new Map(),portraitBindings=new WeakMap(),portraitQueue=[];
let portraitActiveLoads=0,portraitBackgroundLoads=0;
function trimPortraitCache(){
    if(portraitDecodeCache.size<=64)return;
    for(const [url,entry] of portraitDecodeCache){
        if(["ready","error"].includes(entry.state))portraitDecodeCache.delete(url);
        if(portraitDecodeCache.size<=64)break;
    }
}
function applyPortrait(image,entry){
    const binding=portraitBindings.get(image);
    // A previous player's completion must never touch a reused card.
    if(!image.isConnected||binding?.entry!==entry||binding.url!==image.dataset.portraitSrc||image.src!==binding.appliedSrc)return;
    const ready=entry.state==="ready";
    image.dataset.portraitState=ready?"ready":"error";
    if(ready)delete image.dataset.fallbackApplied;else image.dataset.fallbackApplied="true";
    image.removeAttribute("srcset");
    binding.appliedSrc=ready?entry.url:PLAYER_IMAGE_FALLBACK;
    if(image.src!==binding.appliedSrc)image.src=binding.appliedSrc;
}
function finishPortraitRequest(entry,ready,cancelled=false){
    clearTimeout(entry.timer);clearTimeout(entry.retryTimer);
    const loading=entry.state==="loading",loader=entry.image;
    if(loader){loader.onload=null;loader.onerror=null;}
    if(loading){portraitActiveLoads--;if(entry.background)portraitBackgroundLoads--;}
    entry.state=cancelled?"cancelled":ready?"ready":"error";
    if(!ready){entry.image=null;entry.retryAfter=Date.now()+30000;if(loader)loader.src=PLAYER_IMAGE_FALLBACK;}
    if(cancelled){if(portraitDecodeCache.get(entry.url)===entry)portraitDecodeCache.delete(entry.url);}
    else for(const image of entry.subscribers)applyPortrait(image,entry);
    entry.subscribers.clear();entry.resolve(entry);trimPortraitCache();drainPortraitQueue();
}
function startPortraitRequest(entry){
    entry.state="loading";entry.attempts++;entry.background=entry.priority==="low";
    portraitActiveLoads++;if(entry.background)portraitBackgroundLoads++;
    const loader=new Image();entry.image=loader;loader.decoding="async";loader.fetchPriority=entry.priority;
    const fail=()=>{
        if(entry.state!=="loading"||entry.image!==loader)return;
        if(entry.attempts>=2){finishPortraitRequest(entry,false);return;}
        clearTimeout(entry.timer);loader.onload=null;loader.onerror=null;loader.src=PLAYER_IMAGE_FALLBACK;
        portraitActiveLoads--;if(entry.background)portraitBackgroundLoads--;
        entry.state="queued";entry.image=null;entry.notBefore=Date.now()+250;portraitQueue.push(entry);
        entry.retryTimer=setTimeout(drainPortraitQueue,250);drainPortraitQueue();
    };
    loader.onerror=fail;
    loader.onload=()=>{
        const decoded=typeof loader.decode==="function"?loader.decode():Promise.resolve();
        decoded.then(()=>{if(entry.state==="loading"&&entry.image===loader)finishPortraitRequest(entry,loader.naturalWidth>0);},fail);
    };
    // Missing/aborted events and slow requests cannot strand the queue forever.
    entry.timer=setTimeout(fail,8000);loader.src=entry.url;
}
function drainPortraitQueue(){
    portraitQueue.sort((a,b)=>(a.priority==="low")-(b.priority==="low"));
    while(portraitActiveLoads<6){
        const index=portraitQueue.findIndex(entry=>entry.state==="queued"&&(!entry.notBefore||entry.notBefore<=Date.now())&&(entry.priority!=="low"||portraitBackgroundLoads<2));
        if(index<0)break;
        startPortraitRequest(portraitQueue.splice(index,1)[0]);
    }
    for(let index=portraitQueue.length-1;index>=0;index--)if(portraitQueue[index].state!=="queued")portraitQueue.splice(index,1);
}
function requestPortraitUrl(url,priority="low",keepAlive=false){
    let entry=portraitDecodeCache.get(url);
    if(entry?.state==="error"&&entry.retryAfter<=Date.now()){portraitDecodeCache.delete(url);entry=null;}
    if(!entry){
        entry={url,priority,keepAlive,state:"queued",attempts:0,subscribers:new Set()};
        entry.ready=new Promise(resolve=>entry.resolve=resolve);
        portraitDecodeCache.set(url,entry);portraitQueue.push(entry);
    }else{
        portraitDecodeCache.delete(url);portraitDecodeCache.set(url,entry);
        if(priority!=="low"){entry.priority=priority;if(entry.image)entry.image.fetchPriority=priority;}
        entry.keepAlive ||= keepAlive;
    }
    return entry;
}
function releasePlayerPortrait(image){
    portraitObserver?.unobserve(image);
    const entry=portraitBindings.get(image)?.entry;portraitBindings.delete(image);
    if(!entry)return;
    entry.subscribers.delete(image);
    if(!entry.keepAlive&&!entry.subscribers.size&&["queued","loading"].includes(entry.state))finishPortraitRequest(entry,false,true);
}
function revealPlayerPortrait(image,priority="high"){
    const desired=image.dataset.portraitSrc;
    if(!desired||desired===PLAYER_IMAGE_FALLBACK||typeof Image!=="function")return;
    const url=new URL(desired,playerPortraitRoot).href;
    let binding=portraitBindings.get(image);
    if(binding?.url!==url){
        releasePlayerPortrait(image);delete image.dataset.fallbackApplied;
        image.dataset.portraitSrc=url;
        binding={url,appliedSrc:PLAYER_IMAGE_FALLBACK};portraitBindings.set(image,binding);
        image.src=binding.appliedSrc;
    }
    portraitObserver?.unobserve(image);
    if(binding.failed)return;
    const entry=requestPortraitUrl(url,priority);binding.entry=entry;
    image.loading="eager";image.fetchPriority=priority;
    if(["ready","error"].includes(entry.state)){applyPortrait(image,entry);return;}
    image.dataset.portraitState="loading";entry.subscribers.add(image);drainPortraitQueue();
}
function warmPlayerPortrait(player,priority="high"){
    if(!player||typeof Image!=="function")return Promise.resolve();
    const url=playerImageUrl(player);
    if(url===PLAYER_IMAGE_FALLBACK)return Promise.resolve();
    const entry=requestPortraitUrl(url,priority,true);drainPortraitQueue();return entry.ready;
}
function warmSquadPortraits(squad){
    const queue=[...new Map(squad.filter(Boolean).slice(0,30).map(player=>[player.id,player])).values()];
    return Promise.all(Array.from({length:Math.min(3,queue.length)},async()=>{
        while(queue.length)await warmPlayerPortrait(queue.shift(),"low");
    }));
}
function playerPortraitReady(image){return portraitBindings.get(image)?.entry?.ready||Promise.resolve();}
const portraitObserver=typeof IntersectionObserver==="function"?new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
        const rect=entry.intersectionRect;
        revealPlayerPortrait(entry.target,rect.bottom>0&&rect.top<window.innerHeight?"high":"low");
    }
},{rootMargin:"100px 0px"}):null;
function observePlayerPortraits(container){
    if(!container?.querySelectorAll)return;
    const images=[...(container.matches?.("img[data-player-image]")?[container]:[]),...container.querySelectorAll("img[data-player-image]")];
    for(const image of images){
        if(!image.dataset.portraitSrc&&image.src!==PLAYER_IMAGE_FALLBACK)image.dataset.portraitSrc=image.src;
        if(!image.dataset.portraitSrc)continue;
        if(image.loading==="eager"||!portraitObserver)revealPlayerPortrait(image);else portraitObserver.observe(image);
    }
}
function prioritizeVisiblePortraits(container){
    if(!container||typeof window.innerHeight!=="number")return [];
    const visible=[],clips=new WeakMap();
    container.querySelectorAll('img[data-player-image]').forEach(image=>{
        const rect=image.getBoundingClientRect();
        if(!rect.width||!rect.height||rect.bottom<=0||rect.top>=window.innerHeight)return;
        let top=Math.max(0,rect.top),bottom=Math.min(window.innerHeight,rect.bottom);
        for(let parent=image.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
            if(!clips.has(parent)){const style=getComputedStyle(parent);clips.set(parent,/hidden|clip|auto|scroll/.test(style.overflowY)?parent.getBoundingClientRect():null);}
            const clip=clips.get(parent);if(clip){top=Math.max(top,clip.top);bottom=Math.min(bottom,clip.bottom);}
        }
        if(top>=bottom)return;
        image.loading="eager";image.fetchPriority="high";revealPlayerPortrait(image,"high");
        visible.push(image);
    });
    observePlayerPortraits(container);
    return visible;
}
if(document.documentElement?.style)document.documentElement.style.setProperty("--portrait-placeholder",`url("${PLAYER_IMAGE_FALLBACK}")`);
document.addEventListener("error",event=>{
    const image=event.target;
    if(image.tagName!=="IMG"||!image.hasAttribute("data-player-image"))return;
    const binding=portraitBindings.get(image);
    if(binding&&image.src!==binding.appliedSrc)return;
    if(image.src===PLAYER_IMAGE_FALLBACK||image.dataset.fallbackApplied)return;
    image.dataset.fallbackApplied="true";image.removeAttribute("srcset");
    image.dataset.portraitState="error";
    if(binding){binding.failed=true;binding.appliedSrc=PLAYER_IMAGE_FALLBACK;}
    image.src=PLAYER_IMAGE_FALLBACK;
},true);
if(typeof MutationObserver==="function")new MutationObserver(records=>{
    for(const record of records){
        if(record.type==="attributes"){
            const image=record.target,binding=portraitBindings.get(image);
            if(record.attributeName==="src"&&binding&&image.src!==binding.appliedSrc&&image.src!==PLAYER_IMAGE_FALLBACK)image.dataset.portraitSrc=image.src;
            observePlayerPortraits(image);
        }else{
            for(const node of record.removedNodes)if(node.nodeType===1&&!node.isConnected){
                if(node.matches("img[data-player-image]"))releasePlayerPortrait(node);
                node.querySelectorAll("img[data-player-image]").forEach(releasePlayerPortrait);
            }
            for(const node of record.addedNodes)if(node.nodeType===1)observePlayerPortraits(node);
        }
    }
}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["src","data-portrait-src"]});
window.addEventListener("online",()=>{
    for(const [url,entry] of portraitDecodeCache)if(entry.state==="error")portraitDecodeCache.delete(url);
    document.querySelectorAll('img[data-player-image][data-fallback-applied]').forEach(image=>{const binding=portraitBindings.get(image);if(binding)binding.failed=false;});
    prioritizeVisiblePortraits(document.getElementById("siteMain"));
});
