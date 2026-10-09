// One image boundary for every player UI. Metadata is optional; canon data stays intact.
const PLAYER_IMAGE_FALLBACK="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="272" viewBox="0 0 240 272"><rect width="240" height="272" fill="#0b2035"/><path d="M0 224 240 24M0 264 240 64" stroke="#16374e" stroke-width="1"/><circle cx="120" cy="94" r="35" fill="#355d78"/><path d="M46 225c0-51 29-83 74-83s74 32 74 83" fill="#355d78"/><path d="M24 24h36M24 24v36M216 248h-36M216 248v-36" fill="none" stroke="#3bbaff" stroke-width="2"/><text x="120" y="254" text-anchor="middle" fill="#b9e4ff" font-family="sans-serif" font-size="13" letter-spacing="4">BL DRAFT</text></svg>');
function playerImageSource(player){
    const metadata=player?.imageSource;
    const source=metadata&&typeof metadata==="object"?metadata:{};
    const candidate=source.approved===true&&source.url?source.url:player?.image;
    let url=PLAYER_IMAGE_FALLBACK;
    try{
        const resolved=new URL(candidate,document.baseURI);
        if(candidate&&["http:","https:","file:"].includes(resolved.protocol))url=resolved.href;
    }catch{/* A missing source uses the neutral profile. */}
    return {url,fallback:PLAYER_IMAGE_FALLBACK,credit:source.credit||player?.imageCredit||null,reference:source.reference||null,rightsStatus:source.rightsStatus||player?.imageRightsStatus||"unreviewed"};
}
function playerImageUrl(player){return playerImageSource(player).url;}
document.addEventListener("error",event=>{
    const image=event.target;
    if(image.tagName!=="IMG"||!image.hasAttribute("data-player-image")||image.dataset.fallbackApplied)return;
    image.dataset.fallbackApplied="true";
    image.removeAttribute("srcset");
    image.src=PLAYER_IMAGE_FALLBACK;
},true);

// Retain decoded images for this document; bounded queues never draw a draft target.
const portraitDecodeCache=new Map();
function warmPlayerPortrait(player,priority="high"){
    if(!player||typeof Image!=="function")return Promise.resolve();
    const url=playerImageUrl(player);
    if(portraitDecodeCache.has(url))return portraitDecodeCache.get(url).ready;
    const image=new Image();image.decoding="async";image.fetchPriority=priority;image.src=url;
    const ready=image.decode().catch(()=>{});
    portraitDecodeCache.set(url,{image,ready});
    if(portraitDecodeCache.size>64)portraitDecodeCache.delete(portraitDecodeCache.keys().next().value);
    return ready;
}
function warmSquadPortraits(squad){
    const queue=[...new Map(squad.filter(Boolean).slice(0,30).map(player=>[player.id,player])).values()];
    return Promise.all(Array.from({length:Math.min(3,queue.length)},async()=>{
        while(queue.length)await warmPlayerPortrait(queue.shift());
    }));
}
const deferredPortraitQueue=[];
let deferredPortraitLoads=0;
function revealPlayerPortrait(image,priority="auto"){
    if(!image.dataset.portraitSrc)return;
    const url=image.dataset.portraitSrc;
    delete image.dataset.portraitSrc;
    image.fetchPriority=priority;image.loading="eager";image.src=url;
}
function drainPortraitQueue(){
    while(deferredPortraitLoads<2&&deferredPortraitQueue.length){
        const image=deferredPortraitQueue.shift();
        if(!image.isConnected||!image.dataset.portraitSrc)continue;
        deferredPortraitLoads++;
        const finish=()=>{image.removeEventListener("load",finish);image.removeEventListener("error",finish);deferredPortraitLoads--;drainPortraitQueue();};
        image.addEventListener("load",finish,{once:true});image.addEventListener("error",finish,{once:true});
        revealPlayerPortrait(image,"low");
    }
}
const portraitObserver=typeof IntersectionObserver==="function"?new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){portraitObserver.unobserve(entry.target);deferredPortraitQueue.push(entry.target);}
    const idle=window.requestIdleCallback||((callback)=>window.setTimeout(callback,16));
    idle(drainPortraitQueue,{timeout:200});
},{rootMargin:"100px 0px"}):null;
function observePlayerPortraits(container){
    if(!container?.querySelectorAll)return;
    const images=[...(container.matches?.("img[data-portrait-src]")?[container]:[]),...container.querySelectorAll("img[data-portrait-src]")];
    for(const image of images)if(portraitObserver)portraitObserver.observe(image);else revealPlayerPortrait(image);
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
if(typeof MutationObserver==="function")new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)observePlayerPortraits(node);
}).observe(document.body,{childList:true,subtree:true});
