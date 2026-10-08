// BLUE LOCK DRAFT // APPLICATION BOOTSTRAP
// Loaded last, after all classic-script modules have initialized.

function acceleratePortraitLoading(){
    prioritizeVisiblePortraits(document);
    warmAllPlayerPortraits();
    if(!("serviceWorker" in navigator)||!/^https?:$/.test(window.location.protocol))return;
    const rootUrl=appRootUrl();
    navigator.serviceWorker.register(new URL("service-worker.js",rootUrl),{scope:rootUrl.pathname}).then(registration=>{
        const send=worker=>worker?.postMessage?.({type:"WARM_PORTRAITS",urls:[...new Set(players.map(player=>player.image).filter(Boolean))]});
        send(registration.active);
        navigator.serviceWorker.ready.then(ready=>send(ready.active)).catch(()=>{});
    }).catch(()=>{});
}

document.querySelectorAll("[data-app-version]").forEach(el=>{
    el.textContent=APP_VERSION_LABEL+el.textContent;
});

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
if(!pendingRoutePath){
    prioritizeVisiblePortraits(document);
    document.documentElement.classList.remove("app-initializing");
    acceleratePortraitLoading();
}
}
