// BLUE LOCK DRAFT // MULTI-PAGE ROUTING
// APP_ROUTES keeps the legacy hash map for backward compatibility and the
// existing preflight harness. APP_ROUTE_PATHS owns the real multi-page URLs.
const APP_ROUTES={menu:"#/",lore:"#/lore",auctionSetup:"#/auction/setup",auctionRoom:"#/auction",auctionResults:"#/auction/results",auctionTeamBuilder:"#/auction/team-builder",standaloneTeamBuilder:"#/team-builder"};
const APP_ROUTE_PATHS={menu:"index.html",lore:"lore.html",auctionSetup:"auction/setup.html",auctionRoom:"auction/room.html",auctionResults:"auction/results.html",auctionTeamBuilder:"auction/team-builder.html",standaloneTeamBuilder:"team-builder.html"};
const LEGACY_HASH_ROUTES=Object.fromEntries(Object.entries(APP_ROUTES).map(([route,hash])=>[hash,route]));
let pendingRoutePath=null;

function routePath(route){return APP_ROUTE_PATHS[route]||APP_ROUTE_PATHS.menu;}
function appRootUrl(){
    const doc=typeof document!=="undefined"?document:null;
    const baseHref=doc?.querySelector?.("base")?.href;
    const fallback=doc?.baseURI||window.location.href;
    const base=new URL(baseHref||"./",fallback);
    return new URL("./",base);
}
function appRelativePath(){
    const root=appRootUrl(),current=new URL(window.location.href,root);
    let path=current.pathname;
    if(path.startsWith(root.pathname))path=path.slice(root.pathname.length);
    return path.replace(/^\/+/,"");
}
function canonicalRouteUrl(route){return new URL(routePath(route),appRootUrl());}
function getRouteFromHash(){return LEGACY_HASH_ROUTES[window.location.hash||""]||"menu";}
function legacyHashRoute(){
    const path=appRelativePath();
    if(path!==""&&path!=="index.html")return null;
    const hash=window.location.hash||"";
    return Object.prototype.hasOwnProperty.call(LEGACY_HASH_ROUTES,hash)?LEGACY_HASH_ROUTES[hash]:null;
}
function getRouteFromLocation(){
    const legacy=legacyHashRoute();
    if(legacy)return legacy;
    const path=appRelativePath();
    const match=Object.entries(APP_ROUTE_PATHS).find(([,value])=>value===path);
    if(match)return match[0];
    if(path==="")return "menu";
    return "menu";
}
function isAuctionTeamBuilderState(state){
    return state?.screen==="formation"||state?.screen==="auction-team-builder"||state?.phase==="team-builder";
}
function auctionRouteForSavedState(saved){
    const state=saved?.uiState;
    if(isAuctionTeamBuilderState(state))return "auctionTeamBuilder";
    if(state?.phase==="complete")return "auctionResults";
    return "auctionRoom";
}
function completedAuctionSaveFor(route,saved){
    if(!saved)return saved;
    const screen=route==="auctionTeamBuilder"?"formation":"auction";
    return {...saved,uiState:{screen,phase:"complete",turn:null}};
}
function resumeSavedAuction(saved){
    saved=normalizeAuctionSave(saved);
    if(!saved?.gameActive){updateRoute("auctionSetup");return;}
    const route=auctionRouteForSavedState(saved);
    if(appRelativePath()===routePath(route))navigateToRoute(route,{skipHistory:true});
    else updateRoute(route);
}
function getScreenRoute(screen){
    if(screen===menuScreen)return "menu";
    if(screen===setupScreen)return "auctionSetup";
    if(screen===auctionScreen)return uiState?.phase==="complete"||uiState?.phase==="team-builder"?"auctionResults":"auctionRoom";
    if(screen===formationScreen)return formationTeamNumber===0?"standaloneTeamBuilder":"auctionTeamBuilder";
    if(screen?.id==="lore-menu-screen"||screen?.id==="character-lore-screen"||screen?.id==="chemistry-lore-screen")return "lore";
    return null;
}
function historyOnlyNavigation(){
    return typeof window.location.assign!=="function"&&typeof window.location.replace!=="function";
}
function replaceLocation(url,route){
    if(typeof window.location.replace==="function")window.location.replace(url.href);
    else history.replaceState({blDraftRoute:route},"",url.href);
}
function assignLocation(url,route){
    if(typeof window.location.assign==="function")window.location.assign(url.href);
    else history.pushState({blDraftRoute:route},"",url.href);
}
function updateRoute(route,{replace=false}={}){
    // openAuctionTeamBuilder() historically saved a transient "team-builder"
    // phase. Normalize it before leaving Results so the destination page can
    // restore the completed auction instead of bouncing back to Auction Room.
    if(route==="auctionTeamBuilder"&&(typeof formationTeamNumber==="undefined"||formationTeamNumber!==0)&&typeof uiState!=="undefined"&&isAuctionTeamBuilderState(uiState)&&(uiState.screen!=="formation"||uiState.phase!=="complete")){
        uiState={screen:"formation",phase:"complete",turn:null};
        saveGame();
    }

    // The dependency-free preflight uses a tiny history-only browser stub.
    // Keep the old hash contract there without changing real browser URLs.
    if(historyOnlyNavigation()){
        const hash=APP_ROUTES[route]||APP_ROUTES.menu;
        const url=new URL(window.location.href,appRootUrl());
        url.hash=hash;
        if(replace)history.replaceState({blDraftRoute:route},"",url.href);
        else history.pushState({blDraftRoute:route},"",url.href);
        return;
    }

    const target=routePath(route),current=appRelativePath(),url=canonicalRouteUrl(route);
    if(current===target){
        pendingRoutePath=null;
        const currentUrl=new URL(window.location.href,appRootUrl());
        if(currentUrl.hash||currentUrl.pathname!==url.pathname||currentUrl.search!==url.search){
            history.replaceState({blDraftRoute:route},"",url.href);
        }
        return;
    }
    if(pendingRoutePath===target)return;
    pendingRoutePath=target;
    if(replace)replaceLocation(url,route);else assignLocation(url,route);
}
function setVisibleScreen(screen,options={}){
    if(!options.skipHistory){
        const route=getScreenRoute(screen);
        if(route&&appRelativePath()!==routePath(route)){updateRoute(route);return;}
    }
    [menuScreen,setupScreen,auctionScreen,formationScreen,document.getElementById("lore-menu-screen"),document.getElementById("character-lore-screen"),document.getElementById("chemistry-lore-screen")].forEach(el=>el&&el.classList.add("hidden"));
    if(screen)screen.classList.remove("hidden");
    window.scrollTo({top:0,behavior:"smooth"});
}
window.addEventListener("popstate",()=>navigateToRoute(getRouteFromLocation(),{skipHistory:true}));
function normalizeCurrentRoute(route){
    // The preflight browser stub has no real navigation API. Treat a recognized
    // legacy hash as canonical there so bootstrap can exercise the destination
    // screen in-place. Real browsers still migrate hashes to clean page URLs.
    if(historyOnlyNavigation()&&legacyHashRoute()===route)return true;
    const target=canonicalRouteUrl(route),current=new URL(window.location.href,appRootUrl());
    if(current.pathname!==target.pathname||current.search!==target.search||current.hash!==target.hash){
        replaceLocation(target,route);
        return false;
    }
    return true;
}

// Preserve the original in-page restore routine for canonical route loads.
const restoreGameInPlace=typeof restoreGame==="function"?restoreGame:null;
if(restoreGameInPlace){
    restoreGame=function(saved){
        const normalized=normalizeAuctionSave(saved);
        if(historyOnlyNavigation())return restoreGameInPlace(normalized||saved);
        if(!normalized?.gameActive)return restoreGameInPlace(saved);
        const currentRoute=getRouteFromLocation();
        if(currentRoute==="menu"||currentRoute==="auctionSetup"){
            const targetRoute=auctionRouteForSavedState(normalized);
            if(appRelativePath()!==routePath(targetRoute)){
                updateRoute(targetRoute);
                return;
            }
        }
        return restoreGameInPlace(normalized);
    };
}

// Results -> New Auction used to swap visible sections without changing the
// real page URL. Keep the existing confirmation flow, but navigate to Setup.
restartAuction=function(){
    showConfirm("START A NEW AUCTION","Your current auction and saved progress will be cleared.",()=>{
        clearSavedGame();
        uiState={screen:"setup",phase:"setup",turn:null};
        auctionContent.innerHTML="";
        playersRemainingDisplay.innerHTML="";
        saveSetupPreferences();
        showResumeCard(null);
        refreshMainMenu();
        updateRoute("auctionSetup");
    });
};

function navigateToRoute(route,options={}){
    switch(route){
        case "menu":
            goToMainMenu({...options,skipHistory:true});
            break;
        case "lore":
            if(typeof openLoreMenu==="function")openLoreMenu({...options,skipHistory:true});
            else setVisibleScreen(document.getElementById("lore-menu-screen"),{...options,skipHistory:true});
            break;
        case "standaloneTeamBuilder":
            openStandaloneBuilder();
            break;
        case "auctionSetup":
            uiState={screen:"setup",phase:"setup",turn:null};
            setVisibleScreen(setupScreen,{...options,skipHistory:true});
            renderPlayerPool();
            break;
        case "auctionRoom":{
            const saved=loadSavedData();
            if(!saved?.gameActive){updateRoute("auctionSetup",{replace:true});break;}
            const savedRoute=auctionRouteForSavedState(saved);
            if(savedRoute!=="auctionRoom"){updateRoute(savedRoute,{replace:true});break;}
            if(restoreGameInPlace)restoreGameInPlace(saved);
            if(saved.uiState?.phase==="coin")showCoinFlip();
            break;
        }
        case "auctionResults":{
            const saved=loadSavedData();
            if(!saved?.gameActive){updateRoute("auctionSetup",{replace:true});break;}
            const state=saved.uiState;
            if(state?.phase!=="complete"&&!isAuctionTeamBuilderState(state)){updateRoute("auctionRoom",{replace:true});break;}
            if(restoreGameInPlace)restoreGameInPlace(completedAuctionSaveFor("auctionResults",saved));
            break;
        }
        case "auctionTeamBuilder":{
            const saved=loadSavedData();
            if(!saved?.gameActive){updateRoute("auctionSetup",{replace:true});break;}
            const state=saved.uiState;
            if(state?.phase!=="complete"&&!isAuctionTeamBuilderState(state)){updateRoute("auctionRoom",{replace:true});break;}
            if(restoreGameInPlace)restoreGameInPlace(completedAuctionSaveFor("auctionTeamBuilder",saved));
            openAuctionTeamBuilder();
            break;
        }
        default:
            goToMainMenu({...options,skipHistory:true});
            break;
    }
}
