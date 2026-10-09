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
if(["auctionTeamBuilder","auctionResults"].includes(getRouteFromLocation()))warmSquadPortraits([...(initialSaved?.team1?.players||[]),...(initialSaved?.team2?.players||[])].map(playerById));
if(getRouteFromLocation()==="standaloneTeamBuilder"){
    try{const saved=normalizeStandaloneSave(JSON.parse(localStorage.getItem(STANDALONE_SAVE_KEY)||"null"));warmSquadPortraits((saved?.playerIds||[]).map(playerById));}catch{/* An empty or unavailable save needs no portraits. */}
}
if(initialSaved?.gameActive) showResumeCard(initialSaved);
else restoreSetup(initialSaved);
if(initialSaved?.gameActive&&getRouteFromLocation()==="auctionSetup")restoreSetup({setup:{
    team1Name:initialSaved.team1.name,team2Name:initialSaved.team2.name,
    team1Color:initialSaved.team1.color,team2Color:initialSaved.team2.color,
    budget:initialSaved.startingBudget,bidIncrement:initialSaved.bidIncrement,
    maxPlayers:initialSaved.maxPlayers,selected:initialSaved.selectedPlayerIds
}});
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
    const main=document.getElementById("siteMain");
    prioritizeVisiblePortraits(main);
    if(document.fonts){
        // A short bounded first-paint gate avoids normal font swaps. Slow/offline
        // fonts never leave the interface invisible for several seconds.
        const fonts=Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,450))]);
        // Final font metrics can bring another reserve row into view. Promote
        // that row before revealing the screen, while retaining the early fetch.
        fonts.then(()=>{
            const visible=prioritizeVisiblePortraits(main);
            return Promise.race([Promise.all(visible.map(image=>image.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,180))]);
        }).then(()=>document.documentElement.classList.remove("app-initializing"));
    }else document.documentElement.classList.remove("app-initializing");
}
}
