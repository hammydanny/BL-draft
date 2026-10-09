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

// Only the selected target is warmed. Never prefetch the full roster or draw a player.
const portraitDecodeCache=new Map();
function warmPlayerPortrait(player){
    if(!player||typeof Image!=="function")return Promise.resolve();
    const url=playerImageUrl(player);
    if(portraitDecodeCache.has(url))return portraitDecodeCache.get(url);
    const image=new Image();image.decoding="async";image.fetchPriority="high";image.src=url;
    const ready=image.decode().catch(()=>{});
    portraitDecodeCache.set(url,ready);
    if(portraitDecodeCache.size>8)portraitDecodeCache.delete(portraitDecodeCache.keys().next().value);
    return ready;
}
function prioritizeVisiblePortraits(container){
    if(!container||typeof window.innerHeight!=="number")return;
    container.querySelectorAll('img[loading="lazy"]').forEach(image=>{
        const rect=image.getBoundingClientRect();
        if(rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<window.innerHeight)image.loading="eager";
    });
}
