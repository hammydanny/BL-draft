// Shared metadata and static-asset cache registration; no game-state writes.
document.querySelectorAll("[data-app-version]").forEach(element=>element.textContent=APP_VERSION_LABEL+element.textContent);
document.querySelectorAll("[data-supported-chapter]").forEach(element=>element.textContent=APP_SUPPORTED_CHAPTER);
if("serviceWorker" in navigator&&window.isSecureContext){
    window.addEventListener("load",()=>{
        const root=new URL("./",document.baseURI);
        navigator.serviceWorker.register(new URL(`service-worker.js?v=${APP_VERSION}`,root),{scope:root.pathname,updateViaCache:"none"}).catch(()=>{});
    },{once:true});
}
