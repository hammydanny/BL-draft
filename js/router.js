// BLUE LOCK DRAFT // HASH ROUTING + BROWSER HISTORY
// Classic shared globals; loaded before UI modules and app.js.
const APP_ROUTES={
    menu:"#/",
    lore:"#/lore",
    standaloneTeamBuilder:"#/team-builder",
    auction:"#/auction",
    auctionResults:"#/auction/results",
    auctionTeamBuilder:"#/auction/team-builder"
};

function routeHash(route){
    return APP_ROUTES[route]||APP_ROUTES.menu;
}

function getRouteFromHash(){
    const hash=window.location.hash||"#/";

    if(hash==="#/"||hash==="#")return "menu";
    if(hash==="#/lore")return "lore";
    if(hash==="#/team-builder")return "standaloneTeamBuilder";
    if(hash==="#/auction")return "auction";
    if(hash==="#/auction/results")return "auctionResults";
    if(hash==="#/auction/team-builder")return "auctionTeamBuilder";

    return "menu";
}

function getScreenRoute(screen){
    if(screen===menuScreen)return "menu";

    // Setup is the entry point for the Auction route.
    if(screen===setupScreen)return "auction";

    if(screen===auctionScreen){
        return uiState?.phase==="complete"
            ?"auctionResults"
            :"auction";
    }

    if(screen===formationScreen){
        return formationTeamNumber===0
            ?"standaloneTeamBuilder"
            :"auctionTeamBuilder";
    }

    if(screen?.id==="lore-menu-screen")return "lore";

    // Keep these as internal Lore subviews rather than creating another
    // top-level public route.
    if(screen?.id==="character-lore-screen")return "lore";
    if(screen?.id==="chemistry-lore-screen")return "lore";

    return null;
}

function updateRoute(route,{replace=false}={}){
    const url=new URL(window.location.href);
    url.hash=routeHash(route);

    const state={
        blDraftRoute:route
    };

    if(replace){
        history.replaceState(state,"",url);
    }else{
        history.pushState(state,"",url);
    }
}

function setVisibleScreen(screen,options={}){
    [
        menuScreen,
        setupScreen,
        auctionScreen,
        formationScreen,
        document.getElementById("lore-menu-screen"),
        document.getElementById("character-lore-screen"),
        document.getElementById("chemistry-lore-screen")
    ].forEach(el=>el&&el.classList.add("hidden"));

    if(screen)screen.classList.remove("hidden");

    window.scrollTo({top:0,behavior:"smooth"});

    if(!options.skipHistory){
        const route=getScreenRoute(screen);

        if(route && history.state?.blDraftRoute!==route){
            updateRoute(route);
        }
    }
}
window.addEventListener("popstate",()=>{
    navigateToRoute(getRouteFromHash(),{skipHistory:true});
});

function navigateToRoute(route,options={}){
    switch(route){
        case "menu":
            goToMainMenu(options);
            break;

        case "lore":
            if(typeof openLoreMenu==="function"){
                openLoreMenu(options);
            }else{
                setVisibleScreen(
                    document.getElementById("lore-menu-screen"),
                    options
                );
            }
            break;

        case "standaloneTeamBuilder":
            openStandaloneBuilder();
            break;

        case "auction":
            if(uiState?.phase==="complete"){
                setVisibleScreen(auctionScreen,options);
                showAuctionComplete();
                return;
            }

            if(loadSavedData()?.gameActive){
                restoreGame(loadSavedData());
            }else{
                uiState={
                    screen:"setup",
                    phase:"setup",
                    turn:null
                };

                setVisibleScreen(setupScreen,options);
                renderPlayerPool();
            }
            break;

        case "auctionResults":
            if(uiState?.phase==="complete"){
                setVisibleScreen(auctionScreen,options);
                showAuctionComplete();
            }else if(loadSavedData()?.gameActive){
                restoreGame(loadSavedData());

                if(uiState?.phase==="complete"){
                    showAuctionComplete();
                }else{
                    navigateToRoute("auction",{skipHistory:false});
                }
            }else{
                navigateToRoute("auction",{skipHistory:false});
            }
            break;

        case "auctionTeamBuilder":
            if(uiState?.phase==="complete"){
                openAuctionTeamBuilder();
            }else if(loadSavedData()?.gameActive){
                restoreGame(loadSavedData());

                if(uiState?.phase==="complete"){
                    openAuctionTeamBuilder();
                }else{
                    navigateToRoute("auction",{skipHistory:false});
                }
            }else{
                navigateToRoute("auction",{skipHistory:false});
            }
            break;

        default:
            goToMainMenu(options);
            break;
    }
}
