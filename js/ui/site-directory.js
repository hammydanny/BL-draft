// BLUE LOCK DRAFT // SHARED DIRECTORY + PAGE CONTEXT
function refreshDirectoryResume(){
    const saved=loadSavedData();
    document.querySelectorAll('[data-directory-action="resume"]').forEach(button=>{
        button.hidden=!saved?.gameActive;
    });
}
function updateSiteDirectory(screen){
    const route=getRouteFromLocation();
    const section=route.startsWith("auction")?"play":route==="standaloneTeamBuilder"?"builder":route==="lore"?"database":"home";
    document.querySelectorAll("[data-directory-section]").forEach(item=>{
        if(item.dataset.directorySection===section)item.setAttribute("aria-current","page");
        else item.removeAttribute("aria-current");
    });
    const home={text:"HOME",action:"home"},auction={text:"AUCTION",action:"setup"},database={text:"DATABASE",action:"lore"};
    const paths={
        menu:[home],auctionSetup:[home,auction,{text:"SETUP"}],auctionRoom:[home,auction,{text:"ROOM"}],
        auctionResults:[home,auction,{text:"RESULTS"}],auctionTeamBuilder:[home,auction,{text:"TEAM BUILDER"}],
        standaloneTeamBuilder:[home,{text:"TEAM BUILDER"}],lore:[home,database]
    };
    const crumbs=[...(paths[route]||paths.menu)];
    if(route==="lore"){
        const view=screen?databaseViewForScreen(screen):databaseViewFromLocation();
        if(view!=="lore")crumbs.push({text:view.toUpperCase()});
    }
    const breadcrumb=document.getElementById("siteBreadcrumb");
    breadcrumb.innerHTML=crumbs.map((crumb,index)=>{
        const divider=index?'<span class="directory-separator" aria-hidden="true"> / </span>':"";
        return divider+(index===crumbs.length-1?`<span aria-current="location">${crumb.text}</span>`:
            `<button type="button" data-directory-action="${crumb.action}">${crumb.text}</button>`);
    }).join("");
    refreshDirectoryResume();
    const complete=route==="auctionResults";
    document.getElementById("auctionHeaderCode").textContent=complete?"BL // FINAL SELECTION":"BL // LIVE SELECTION";
    document.getElementById("auctionHeaderTitle").innerHTML=complete?'AUCTION <span>RESULTS</span>':'AUCTION <span>ROOM</span>';
    document.getElementById("auctionHeaderStatus").innerHTML=complete?"<i></i> DRAFT COMPLETE":"<i></i> SYSTEM LIVE";
    document.getElementById("playersRemaining").hidden=complete;
    auctionScreen.querySelector(".auction-context-actions").hidden=complete;
    if(route==="auctionRoom")ensureAuctionHistoryControls();
}
function configureTeamBuilderHeader(standalone){
    document.getElementById("formationHeaderCode").textContent=standalone?"BL // GLOBAL SQUAD LAB":"BL // SQUAD DEPLOYMENT";
    document.getElementById("formationHeaderTitle").innerHTML=standalone?'TEAM <span>BUILDER</span>':'FORMATION <span>BUILDER</span>';
    document.getElementById("formationHeaderStatus").innerHTML=standalone?"<i></i> STANDALONE MODE":"<i></i> TACTICAL MODE";
    document.getElementById("backToResults").hidden=standalone;
    document.getElementById("formationTeamContext").textContent=standalone?"GLOBAL XI":teamByNumber(formationTeamNumber).name;
    updateSiteDirectory(formationScreen);
}
function runDirectoryAction(action){
    if(uiState.screen==="setup")saveSetupPreferences();
    else if(uiState.screen==="auction"||uiState.screen==="formation"||uiState.screen==="standalone-builder")saveGame();
    switch(action){
        case "home":goToMainMenu();break;
        case "setup":updateRoute("auctionSetup");break;
        case "new-auction":openSetupFromMenu();break;
        case "resume":resumeSavedAuction(loadSavedData());break;
        case "builder":openStandaloneBuilder();break;
        case "lore":case "characters":case "chemistry":updateRoute("lore",{databaseView:action});break;
    }
}
function initSiteDirectory(){
    const header=document.querySelector(".site-header");
    const directory=document.getElementById("siteDirectory");
    const toggle=document.getElementById("directoryMenuToggle");
    const backdrop=header.querySelector(".directory-backdrop");
    const groups=[...directory.querySelectorAll("details")];
    const narrow=window.matchMedia("(max-width: 1050px)");
    function closeDirectory(restoreFocus=false){
        const wasOpen=directory.classList.contains("is-open");
        directory.classList.remove("is-open");
        toggle.setAttribute("aria-expanded","false");
        backdrop.hidden=true;
        groups.forEach(group=>group.open=false);
        if(wasOpen&&restoreFocus)toggle.focus();
    }
    toggle.addEventListener("click",()=>{
        if(directory.classList.contains("is-open")){closeDirectory(true);return;}
        directory.classList.add("is-open");
        toggle.setAttribute("aria-expanded","true");
        backdrop.hidden=false;
        directory.querySelector("button").focus();
    });
    backdrop.addEventListener("click",()=>closeDirectory(true));
    groups.forEach(group=>group.addEventListener("toggle",()=>{
        group.querySelector("summary").setAttribute("aria-expanded",String(group.open));
        if(group.open)groups.forEach(other=>{if(other!==group)other.open=false;});
        refreshDirectoryResume();
    }));
    header.addEventListener("click",event=>{
        const action=event.target.closest("[data-directory-action]");
        if(action){closeDirectory();runDirectoryAction(action.dataset.directoryAction);}
        else if(event.target.closest("[data-how-to-play]"))closeDirectory();
    });
    document.addEventListener("click",event=>{if(!header.contains(event.target))closeDirectory();});
    document.addEventListener("keydown",event=>{
        if(event.key==="Escape"){
            const openGroup=groups.find(group=>group.open);
            closeDirectory(true);
            if(openGroup&&!narrow.matches)openGroup.querySelector("summary").focus();
        }
    });
    narrow.addEventListener("change",()=>closeDirectory());
    window.addEventListener("pageshow",()=>closeDirectory());
}
initSiteDirectory();
