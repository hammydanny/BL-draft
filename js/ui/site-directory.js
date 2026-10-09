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
    const quick=route==="auctionSetup"&&new URL(window.location.href).searchParams.get("draft")==="quick";
    document.getElementById("setupHeaderTitle").innerHTML=quick?'QUICK <span>DRAFT</span>':'AUCTION <span>SETUP</span>';
    if(quick)crumbs.splice(1,2,{text:"PLAY",action:"setup"},{text:"QUICK DRAFT"});
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
        case "quick-draft":openQuickDraft();break;
        case "resume":resumeSavedAuction(loadSavedData());break;
        case "builder":openStandaloneBuilder();break;
        case "lore":case "characters":case "chemistry":updateRoute("lore",{databaseView:action});break;
    }
}
function isMobileSiteNavigation(){return getComputedStyle(document.getElementById("directoryMenuToggle")).display!=="none";}
function initSiteDirectory(){
    const header=document.querySelector(".site-header");
    const directory=document.getElementById("siteDirectory");
    const toggle=document.getElementById("directoryMenuToggle");
    const backdrop=header.querySelector(".directory-backdrop");
    const groups=[...directory.querySelectorAll("details")];
    const settings=document.getElementById("siteSettings"),settingsToggle=document.getElementById("siteSettingsToggle");
    function closeSettings(restoreFocus=false){
        const wasOpen=!settings.hidden;settings.hidden=true;settingsToggle.setAttribute("aria-expanded","false");
        if(wasOpen&&restoreFocus)settingsToggle.focus();
    }
    function refreshSettings(){
        const preferences=SitePreferences.get();
        settings.querySelectorAll('[name="siteSound"]').forEach(input=>input.checked=(input.value==="on")===preferences.sfxEnabled);
        settings.querySelectorAll('[name="siteTheme"]').forEach(input=>input.checked=input.value===preferences.theme);
    }
    settingsToggle.addEventListener("click",()=>{
        closeDirectory();
        if(!settings.hidden){closeSettings(true);return;}
        settings.hidden=false;settingsToggle.setAttribute("aria-expanded","true");refreshSettings();
        settings.querySelector("[data-settings-close]").focus();
    });
    settings.querySelector("[data-settings-close]").addEventListener("click",()=>closeSettings(true));
    settings.addEventListener("change",event=>{
        const input=event.target;
        if(input.name==="siteSound")SitePreferences.set({sfxEnabled:input.value==="on"});
        if(input.name==="siteTheme")SitePreferences.set({theme:input.value});
    });
    settings.querySelector("[data-preferences-reset]").addEventListener("click",()=>SitePreferences.reset());
    window.addEventListener("bld:preferences",refreshSettings);
    refreshSettings();SitePreferences.syncAssets();
    document.querySelector(".skip-link").addEventListener("click",event=>{event.preventDefault();document.getElementById("siteMain").focus();});
    function closeDirectory(restoreFocus=false){
        const wasOpen=directory.classList.contains("is-open");
        directory.classList.remove("is-open");
        toggle.setAttribute("aria-expanded","false");
        backdrop.hidden=true;
        groups.forEach(group=>group.open=false);
        if(wasOpen&&restoreFocus)toggle.focus();
    }
    toggle.addEventListener("click",()=>{
        closeSettings();
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
        else if(event.target.closest("[data-how-to-play],[data-about]")){closeDirectory();closeSettings();}
    });
    document.addEventListener("click",event=>{
        if(!header.contains(event.target))closeDirectory();
        if(!settings.contains(event.target)&&!settingsToggle.contains(event.target))closeSettings();
    });
    document.addEventListener("keydown",event=>{
        if(event.key==="Escape"){
            const openGroup=groups.find(group=>group.open);
            if(!settings.hidden){event.preventDefault();closeSettings(true);return;}
            closeDirectory(true);
            if(openGroup&&!isMobileSiteNavigation())openGroup.querySelector("summary").focus();
        }
        if(event.key==="ArrowDown"&&event.target.matches("summary.directory-item")){
            event.preventDefault();event.target.parentElement.open=true;event.target.parentElement.querySelector("button").focus();
        }
        if(event.key==="Tab"&&!settings.hidden){
            const controls=[...settings.querySelectorAll("button,input")];const first=controls[0],last=controls.at(-1);
            if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        }
    });
    directory.addEventListener("focusout",event=>{if(event.relatedTarget&&!directory.contains(event.relatedTarget)&&!isMobileSiteNavigation())closeDirectory();});
    let mobile=isMobileSiteNavigation();
    window.addEventListener("resize",()=>{const next=isMobileSiteNavigation();if(next!==mobile){mobile=next;closeDirectory();closeSettings();}});
    window.addEventListener("pageshow",()=>{closeDirectory();closeSettings();SitePreferences.syncAssets();});
}
initSiteDirectory();
