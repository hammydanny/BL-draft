// BLUE LOCK DRAFT // MULTI-PAGE ROUTING
// APP_ROUTE_PATHS owns the page URLs. APP_ROUTES only maps legacy hashes.
const APP_ROUTES={menu:"#/",lore:"#/lore",auctionSetup:"#/auction/setup",auctionRoom:"#/auction",auctionResults:"#/auction/results",auctionTeamBuilder:"#/auction/team-builder",standaloneTeamBuilder:"#/team-builder"};
const APP_ROUTE_PATHS={menu:"",lore:"lore/",auctionSetup:"auction/setup/",auctionRoom:"auction/room/",auctionResults:"auction/results/",auctionTeamBuilder:"auction/team-builder/",standaloneTeamBuilder:"team-builder/"};
const LEGACY_PAGE_ROUTES={"index.html":"menu","lore.html":"lore","team-builder.html":"standaloneTeamBuilder","auction/setup.html":"auctionSetup","auction/room.html":"auctionRoom","auction/results.html":"auctionResults","auction/team-builder.html":"auctionTeamBuilder"};
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
function databaseViewFromLocation(){
    const view=new URL(window.location.href).searchParams.get("view");
    return view==="characters"||view==="chemistry"?view:"lore";
}
function databaseViewForScreen(screen){
    return screen?.id==="character-lore-screen"?"characters":screen?.id==="chemistry-lore-screen"?"chemistry":"lore";
}
function canonicalRouteUrl(route,{databaseView=null}={}){
    const url=new URL(routePath(route),appRootUrl());
    if(route==="lore"&&(databaseView==="characters"||databaseView==="chemistry"))url.searchParams.set("view",databaseView);
    return url;
}
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
    if(Object.prototype.hasOwnProperty.call(LEGACY_PAGE_ROUTES,path))return LEGACY_PAGE_ROUTES[path];
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
function navigateRouteInPlace(route,{replace=false}={}){
    const url=canonicalRouteUrl(route);
    const state={blDraftRoute:route};
    if(replace)history.replaceState(state,"",url.href);
    else history.pushState(state,"",url.href);
    pendingRoutePath=null;
    navigateToRoute(route,{skipHistory:true});
}
function replaceLocation(url,route){
    if(typeof window.location.replace==="function")window.location.replace(url.href);
    else history.replaceState({blDraftRoute:route},"",url.href);
}
function assignLocation(url,route){
    if(typeof window.location.assign==="function")window.location.assign(url.href);
    else history.pushState({blDraftRoute:route},"",url.href);
}
function updateRoute(route,{replace=false,databaseView=null}={}){
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

    const target=routePath(route),current=appRelativePath(),url=canonicalRouteUrl(route,{databaseView});
    if(current===target||(route==="menu"&&current==="")){
        pendingRoutePath=null;
        if(route==="lore"){
            if(window.location.href!==url.href){
                if(replace)history.replaceState({blDraftRoute:route},"",url.href);
                else history.pushState({blDraftRoute:route},"",url.href);
            }
            navigateToRoute(route,{skipHistory:true});
            return;
        }
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
        const databaseView=route==="lore"?databaseViewForScreen(screen):null;
        if(route&&(appRelativePath()!==routePath(route)||(route==="lore"&&databaseView!==databaseViewFromLocation()))){updateRoute(route,{databaseView});return;}
    }
    [menuScreen,setupScreen,auctionScreen,formationScreen,document.getElementById("lore-menu-screen"),document.getElementById("character-lore-screen"),document.getElementById("chemistry-lore-screen")].forEach(el=>el&&el.classList.add("hidden"));
    if(screen)screen.classList.remove("hidden");
    updateSiteDirectory(screen);
    window.scrollTo({top:0,behavior:"instant"});
}
window.addEventListener("popstate",()=>navigateToRoute(getRouteFromLocation(),{skipHistory:true}));
window.addEventListener("pageshow",event=>{
    pendingRoutePath=null;
    if(event.persisted)navigateToRoute(getRouteFromLocation(),{skipHistory:true});
});
function normalizeCurrentRoute(route){
    // The preflight browser stub has no real navigation API. Treat a recognized
    // legacy hash as canonical there so bootstrap can exercise the destination
    // screen in-place. Real browsers still migrate hashes to clean page URLs.
    if(historyOnlyNavigation()&&legacyHashRoute()===route)return true;
    const target=canonicalRouteUrl(route,{databaseView:route==="lore"?databaseViewFromLocation():null}),current=new URL(window.location.href,appRootUrl());
    if(route==="menu"&&current.pathname===appRootUrl().pathname&&!current.search&&!current.hash)return true;
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

function navigateToRoute(route,options={}){
    switch(route){
        case "menu":
            goToMainMenu({...options,skipHistory:true});
            break;
        case "lore":
            if(databaseViewFromLocation()==="characters")openCharacterLore({...options,skipHistory:true});
            else if(databaseViewFromLocation()==="chemistry")openChemistryLore({...options,skipHistory:true});
            else openLoreMenu({...options,skipHistory:true});
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
