// BLUE LOCK DRAFT // APPLICATION BOOTSTRAP
// Loaded last, after all classic-script modules have initialized.

document.querySelectorAll("[data-app-version]").forEach(el=>{
    el.textContent=APP_VERSION_LABEL+el.textContent;
});
document.querySelectorAll("[data-supported-chapter]").forEach(el=>el.textContent=APP_SUPPORTED_CHAPTER);
// No app-shell cache: a deployment cannot pin users to old HTML/CSS/JS.
if("serviceWorker" in navigator&&window.isSecureContext){
    window.addEventListener("load",()=>{
        navigator.serviceWorker.register(new URL(`service-worker.js?v=${APP_VERSION}`,appRootUrl()),{scope:appRootUrl().pathname,updateViaCache:"none"}).catch(()=>{});
    },{once:true});
}

const initialSaved=loadSavedData();
if(getRouteFromLocation()==="auctionRoom")warmPlayerPortrait(playerById(initialSaved?.currentPlayerId));
if(initialSaved?.gameActive) showResumeCard(initialSaved);
else restoreSetup(initialSaved);
const initialRoute=getRouteFromLocation();
const routeIsCanonical=normalizeCurrentRoute(initialRoute);

if(routeIsCanonical){
history.replaceState(
    {
        blDraftRoute:initialRoute
    },
    "",
    window.location.href
);

navigateToRoute(initialRoute,{skipHistory:true});
updateSiteDirectory();
if(!pendingRoutePath)document.documentElement.classList.remove("app-initializing");
}
