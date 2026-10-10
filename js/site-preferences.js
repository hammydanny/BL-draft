// Runs in <head>, before styles: theme and favicon are ready for the first paint.
// Auction/builder saves are deliberately outside this preference store.
(function(){
    const key="blSitePreferencesV1",soundKey="blAuctionSound";
    const root=document.documentElement;
    const system=window.matchMedia("(prefers-color-scheme: light)");
    const assetVersion=new URL(document.currentScript.src,document.baseURI).searchParams.get("v");
    const themes=["dark","light","system"];
    function read(key){try{return localStorage.getItem(key);}catch{return null;}}
    function write(key,value){try{localStorage.setItem(key,value);}catch{/* Preferences still work for this page. */}}
    function stored(){try{const value=JSON.parse(read(key));return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}catch{return {};}}
    function normalize(value){return {...value,theme:themes.includes(value.theme)?value.theme:"dark",sfxEnabled:typeof value.sfxEnabled==="boolean"?value.sfxEnabled:read(soundKey)!=="off"};}
    let preferences=normalize(stored());
    // An older build may have changed sound since this model was last written.
    const legacySound=read(soundKey);
    if(legacySound==="on"||legacySound==="off")preferences.sfxEnabled=legacySound==="on";
    const warmedBrandAssets=new Set();
    function asset(path){return new URL(path+(assetVersion?`?v=${encodeURIComponent(assetVersion)}`:""),document.baseURI).href;}
    function resolvedTheme(){return preferences.theme==="system"?(system.matches?"light":"dark"):preferences.theme;}
    function syncAssets(){
        const light=resolvedTheme()==="light";
        const theme=light?"light":"dark";
        const logoUrl=asset(light?"images/bld-logo-light.svg":"images/bld-logo-header.webp");
        if(typeof Image==="function"&&!warmedBrandAssets.has(logoUrl)){
            warmedBrandAssets.add(logoUrl);const preload=new Image();preload.fetchPriority="high";preload.src=logoUrl;
        }
        document.querySelectorAll("[data-theme-logo]").forEach(image=>{
            if(image.src!==logoUrl){image.dataset.logoTheme="";image.src=logoUrl;}
            image.decode().then(()=>{if(image.src===logoUrl)image.dataset.logoTheme=theme;}).catch(()=>{});
        });
    }
    // Tab chrome follows the browser/OS preference, independently of the site palette.
    function syncFavicon(){
        const favicon=document.getElementById("siteFavicon");
        if(favicon)favicon.href=asset(system.matches?"images/bld-favicon-light.svg":"images/bld-favicon-dark.svg");
    }
    function apply(){
        root.dataset.theme=resolvedTheme();
        root.dataset.themePreference=preferences.theme;
        root.style.colorScheme=resolvedTheme();
        syncAssets();
    }
    function notify(){window.dispatchEvent(new CustomEvent("bld:preferences",{detail:{...preferences}}));}
    function save(){write(key,JSON.stringify(preferences));write(soundKey,preferences.sfxEnabled?"on":"off");}
    function set(patch){preferences=normalize({...preferences,...patch});save();apply();notify();return {...preferences};}
    function reset(){preferences={theme:"dark",sfxEnabled:true};save();apply();notify();}
    window.SitePreferences=Object.freeze({get:()=>({...preferences}),set,reset,syncAssets,resolvedTheme,key,soundKey});
    apply();
    syncFavicon();
    window.addEventListener("DOMContentLoaded",syncAssets,{once:true});
    system.addEventListener("change",()=>{syncFavicon();if(preferences.theme==="system"){apply();notify();}});
    window.addEventListener("storage",event=>{
        if(event.key===key){preferences=normalize(stored());apply();notify();}
        else if(event.key===soundKey&&event.newValue!==null)set({sfxEnabled:event.newValue!=="off"});
    });
})();
