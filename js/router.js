// BLUE LOCK DRAFT // MULTI-PAGE ROUTING
const APP_ROUTES={menu:"index.html",lore:"lore.html",auctionSetup:"auction/setup.html",auctionRoom:"auction/room.html",auctionResults:"auction/results.html",auctionTeamBuilder:"auction/team-builder.html",standaloneTeamBuilder:"team-builder.html"};
const LEGACY_HASH_ROUTES={"#/":"menu","#/lore":"lore","#/team-builder":"standaloneTeamBuilder","#/auction":"auctionSetup","#/auction/results":"auctionResults","#/auction/team-builder":"auctionTeamBuilder"};
let pendingRoutePath=null;

function routePath(route){return APP_ROUTES[route]||APP_ROUTES.menu;}
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
function legacyHashRoute(){
    const path=appRelativePath();
    if(path!==""&&path!=="index.html")return null;
    return LEGACY_HASH_ROUTES[window.location.hash||""]||null;
}
function getRouteFromLocation(){
    const legacy=legacyHashRoute();
    if(legacy)return legacy;
    const path=appRelativePath();
    if(path===""||path==="index.html")return "menu";
    if(path==="lore.html")return "lore";
    if(path==="team-builder.html")return "standaloneTeamBuilder";
    if(path==="auction/setup.html")return "auctionSetup";
    if(path==="auction/room.html")return "auctionRoom";
    if(path==="auction/results.html")return "auctionResults";
    if(path==="auction/team-builder.html")return "auctionTeamBuilder";
    return "menu";
}
function getRouteFromHash(){return getRouteFromLocation();}
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
function replaceLocation(url,route){
    if(typeof window.location.replace==="function")window.location.replace(url.href);
    else history.replaceState({blDraftRoute:route},"",url.href);
}
function assignLocation(url,route){
    if(typeof window.location.assign==="function")window.location.assign(url.href);
    else history.pushState({blDraftRoute:route},"",url.href);
}
function updateRoute(route,{replace=false}={}){
    const target=routePath(route),current=appRelativePath(),url=canonicalRouteUrl(route);
    if(route==="auctionTeamBuilder"&&isAuctionTeamBuilderState(uiState)&&(uiState.screen!=="formation"||uiState.phase!=="complete")){
        uiState={screen:"formation",phase:"complete",turn:null};
        saveGame();
    }
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
    const target=canonicalRouteUrl(route),current=new URL(window.location.href,appRootUrl());
    if(current.pathname!==target.pathname||current.search!==target.search||current.hash!==target.hash){
        replaceLocation(target,route);
        return false;
    }
    return true;
}
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
            restoreGame(saved);
            if(saved.uiState?.phase==="coin")showCoinFlip();
            break;
        }
        case "auctionResults":{
            const saved=loadSavedData();
            if(!saved?.gameActive){updateRoute("auctionSetup",{replace:true});break;}
            const state=saved.uiState;
            if(state?.phase!=="complete"&&!isAuctionTeamBuilderState(state)){updateRoute("auctionRoom",{replace:true});break;}
            restoreGame(completedAuctionSaveFor("auctionResults",saved));
            break;
        }
        case "auctionTeamBuilder":{
            const saved=loadSavedData();
            if(!saved?.gameActive){updateRoute("auctionSetup",{replace:true});break;}
            const state=saved.uiState;
            if(state?.phase!=="complete"&&!isAuctionTeamBuilderState(state)){updateRoute("auctionRoom",{replace:true});break;}
            restoreGame(completedAuctionSaveFor("auctionTeamBuilder",saved));
            openAuctionTeamBuilder();
            break;
        }
        default:
            goToMainMenu({...options,skipHistory:true});
            break;
    }
}
