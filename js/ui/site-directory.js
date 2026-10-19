// BLUE LOCK DRAFT // SHARED DIRECTORY + PAGE CONTEXT
function refreshDirectoryResume(){
    const saved=typeof loadSavedData==="function"?loadSavedData():null;
    document.querySelectorAll('[data-directory-action="resume"]').forEach(button=>{
        button.hidden=!saved?.gameActive;
    });
}
function updateSiteDirectory(screen){
    const informationPage=document.body.dataset.sitePage;
    if(informationPage){
        const pageLabel=({privacy:"PRIVACY",legal:"LEGAL",changelog:"CHANGELOG","404":"PAGE NOT FOUND","battle-sim-disabled":"BATTLE SIM DISABLED"})[informationPage]||informationPage.toUpperCase();
        setMobilePageContext(pageLabel||"HOME");
        document.getElementById("siteBreadcrumb").textContent=`HOME / ${pageLabel}`;
        document.querySelectorAll(".footer-links a").forEach(link=>{
            if(new URL(link.href).pathname.endsWith(`/${informationPage}/`))link.setAttribute("aria-current","page");
        });
        document.querySelectorAll(".mobile-directory a").forEach(link=>{
            if(new URL(link.href).pathname.endsWith(`/${informationPage}/`))link.setAttribute("aria-current","page");
            else link.removeAttribute("aria-current");
        });
        refreshDirectoryResume();
        return;
    }
    const soloScreen=document.getElementById("soloDraftScreen");
    if(soloScreen&&!soloScreen.classList.contains("hidden")){
        const label=soloScreen.dataset.soloKind==="daily"?"DAILY EGO DRAFT":"DRAFT CHALLENGES";
        setMobilePageContext(label);
        document.querySelectorAll("[data-directory-section]").forEach(item=>{if(item.dataset.directorySection==="challenges")item.setAttribute("aria-current","page");else item.removeAttribute("aria-current");});
        document.getElementById("siteBreadcrumb").innerHTML=`<button type="button" data-directory-action="home">HOME</button><span class="directory-separator" aria-hidden="true"> / </span><span aria-current="location">${label}</span>`;
        if(typeof SiteI18n!=="undefined")SiteI18n.apply(document.getElementById("siteBreadcrumb"));
        refreshDirectoryResume();return;
    }
    const route=getRouteFromLocation();
    const section=route.startsWith("auction")?"play":route==="standaloneTeamBuilder"?"builder":route==="lore"?"database":route==="battleSim"?"battle-sim":"home";
    setMobilePageContext(({play:"AUCTION",builder:"TEAM BUILDER",database:"DATABASE","battle-sim":"BATTLE SIM",home:"HOME"})[section]);
    document.querySelectorAll("[data-directory-section]").forEach(item=>{
        if(item.dataset.directorySection===section)item.setAttribute("aria-current","page");
        else item.removeAttribute("aria-current");
    });
    const home={text:"HOME",action:"home"},auction={text:"AUCTION",action:"setup"},database={text:"DATABASE",action:"lore"};
    const paths={
        menu:[home],auctionSetup:[home,auction,{text:"SETUP"}],auctionRoom:[home,auction,{text:"ROOM"}],
        auctionResults:[home,auction,{text:"RESULTS"}],auctionTeamBuilder:[home,auction,{text:"TEAM BUILDER"}],
        standaloneTeamBuilder:[home,{text:"TEAM BUILDER"}],battleSim:[home,{text:"BATTLE SIM"}],lore:[home,database]
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
function setMobilePageContext(label){
    const context=document.getElementById("mobilePageContext");
    if(context)context.textContent=label;
    document.querySelectorAll(".mobile-directory [data-directory-section]").forEach(item=>{
        const active=item.dataset.directorySection===({AUCTION:"play","VS CPU":"play",CHALLENGES:"challenges","DAILY EGO DRAFT":"challenges","TEAM BUILDER":"builder","BATTLE SIM":"battle-sim",DATABASE:"database",HOME:"home"})[label];
        if(active)item.setAttribute("aria-current","page");else item.removeAttribute("aria-current");
    });
}
function configureTeamBuilderHeader(standalone){
    document.getElementById("formationHeaderCode").textContent=standalone?"BL // GLOBAL SQUAD LAB":"BL // SQUAD DEPLOYMENT";
    document.getElementById("formationHeaderTitle").innerHTML=standalone?'TEAM <span>BUILDER</span>':'FORMATION <span>BUILDER</span>';
    document.getElementById("formationHeaderStatus").innerHTML=standalone?"<i></i> STANDALONE MODE":"<i></i> TACTICAL MODE";
    document.getElementById("backToResults").hidden=standalone;
    const teamContext=document.getElementById("formationTeamContext");
    if(standalone)teamContext.innerHTML='<button type="button" class="context-control battle-sim-context" onclick="openBattleSimPage()">Battle Sim</button>';
    else teamContext.textContent=teamByNumber(formationTeamNumber).name;
    updateSiteDirectory(formationScreen);
}
function runDirectoryAction(action){
    if(["challenges","daily-draft","draft-challenges"].includes(action)&&typeof openChallengesMenu==="function"){
        if(action==="daily-draft")openDraftChallenges(true);else if(action==="draft-challenges")openDraftChallenges();else openChallengesMenu();return;
    }

    if(document.body.dataset.sitePage){
        const button=document.querySelector(`[data-directory-action="${action}"][data-directory-href]`);
        if(button)window.location.assign(new URL(button.dataset.directoryHref,document.baseURI).href);
        return;
    }
    if(uiState.screen==="setup")saveSetupPreferences();
    else if(uiState.screen==="auction"||uiState.screen==="formation"||uiState.screen==="standalone-builder")saveGame();
    switch(action){
        case "home":goToMainMenu();break;
        case "setup":updateRoute("auctionSetup");break;
        case "new-auction":openSetupFromMenu();break;
        case "quick-draft":openQuickDraft();break;
        case "resume":resumeSavedAuction(loadSavedData());break;
        case "builder":openStandaloneBuilder();break;
        case "battle-sim":openBattleSimPage();break;
        case "lore":case "characters":case "chemistry":updateRoute("lore",{databaseView:action});break;
    }
}
function isMobileSiteNavigation(){return getComputedStyle(document.getElementById("directoryMenuToggle")).display!=="none";}
function initSiteDirectory(){
    const header=document.querySelector(".site-header"),directory=document.getElementById("siteDirectory");
    const builderNav=directory.querySelector('[data-directory-action="builder"]'),battleNav=directory.querySelector('[data-directory-action="battle-sim"]');
    if(builderNav&&battleNav)directory.insertBefore(battleNav,builderNav);
    const toggle=document.getElementById("directoryMenuToggle"),groups=[...directory.querySelectorAll("details")];
    const settings=document.getElementById("siteSettings"),settingsToggle=document.getElementById("siteSettingsToggle");
    const settingsUtilities=settingsToggle.closest(".site-utilities"),soundToggle=document.getElementById("soundToggle");
    // Keep the desktop directory; mobile shares its actions in a flat touch layout.
    const drawer=document.createElement("div");drawer.id="mobileDirectory";drawer.className="mobile-directory hidden";
    drawer.setAttribute("role","dialog");drawer.setAttribute("aria-modal","true");drawer.setAttribute("aria-labelledby","mobileDirectoryTitle");
    drawer.classList.add("hidden");
    settings.setAttribute("aria-modal","true");
    drawer.innerHTML=`
      <button class="mobile-directory-backdrop" type="button" aria-label="Close navigation" tabindex="-1"></button>
      <section class="mobile-directory-panel">
        <div class="mobile-directory-heading"><div><span data-i18n-ignore>BLUE LOCK DRAFT</span><h2 id="mobileDirectoryTitle">Primary directory</h2></div><button type="button" data-directory-close aria-label="Close navigation">×</button></div>
        <nav class="mobile-directory-links" aria-label="Primary directory">
          <div class="mobile-primary-links">
            <button type="button" data-directory-action="home" data-directory-href="./" data-directory-section="home"><span aria-hidden="true" data-i18n-ignore>01</span><strong>HOME</strong></button>
            <button type="button" data-directory-action="setup" data-directory-href="auction/setup/" data-directory-section="play"><span aria-hidden="true" data-i18n-ignore>02</span><strong>AUCTION</strong></button>
            <button type="button" data-directory-action="challenges" data-directory-href="./?challenge=all" data-directory-section="challenges"><span aria-hidden="true" data-i18n-ignore>03</span><strong>CHALLENGES</strong></button>
            <button type="button" data-directory-action="battle-sim" data-directory-href="battle-sim-disabled/" data-directory-section="battle-sim"><span aria-hidden="true" data-i18n-ignore>04</span><strong>BATTLE SIM</strong></button>
            <button type="button" data-directory-action="builder" data-directory-href="team-builder/" data-directory-section="builder"><span aria-hidden="true" data-i18n-ignore>05</span><strong>TEAM BUILDER</strong></button>
            <button type="button" data-directory-action="lore" data-directory-href="lore/" data-directory-section="database"><span aria-hidden="true" data-i18n-ignore>06</span><strong>DATABASE</strong></button>
          </div>
          <div class="mobile-secondary-links">
            <button type="button" data-directory-action="quick-draft" data-directory-href="auction/setup/?draft=quick">QUICK DRAFT</button>
            <button type="button" data-directory-action="resume" data-directory-href="auction/room/" hidden>RESUME AUCTION</button>
            <button type="button" data-directory-action="characters" data-directory-href="lore/?view=characters">CHARACTERS</button>
            <button type="button" data-directory-action="chemistry" data-directory-href="lore/?view=chemistry">CHEMISTRY</button>
            <button type="button" data-how-to-play>HOW TO PLAY</button>
            <button type="button" data-about>ABOUT</button>
            <a href="changelog/">CHANGELOG</a><a href="privacy/">PRIVACY</a><a href="legal/">LEGAL</a>
          </div>
        </nav>
        <button type="button" class="mobile-settings-entry" data-mobile-settings><strong>SETTINGS</strong><span><span>THEME</span> · <span>SOUND EFFECTS</span> · <span>LANGUAGE</span></span><b aria-hidden="true">⚙</b></button>
      </section>`;
    document.body.appendChild(drawer);
    const drawerPanel=drawer.querySelector(".mobile-directory-panel");
    drawerPanel.tabIndex=0;
    drawerPanel.setAttribute("aria-label","Primary directory");
    const context=document.createElement("span");context.id="mobilePageContext";context.className="mobile-page-context";context.textContent="HOME";
    toggle.before(context);toggle.setAttribute("aria-controls","mobileDirectory");
    const settingsBackdrop=document.createElement("button");settingsBackdrop.type="button";settingsBackdrop.className="settings-backdrop";settingsBackdrop.hidden=true;
    settingsBackdrop.setAttribute("aria-label","Close settings");settingsBackdrop.setAttribute("data-dialog-dismiss","");settingsBackdrop.tabIndex=-1;header.appendChild(settingsBackdrop);
    let settingsReturnFocus=settingsToggle;
    function closeDirectory(restoreFocus=false){
        const wasOpen=!drawer.classList.contains("hidden");
        if(wasOpen)setSiteDialogState(drawer,false);
        toggle.setAttribute("aria-expanded","false");groups.forEach(group=>group.open=false);
        if(wasOpen&&restoreFocus)toggle.focus({preventScroll:true});
    }
    function closeSettings(restoreFocus=false){
        const wasOpen=!settings.hidden;
        if(wasOpen)setSiteDialogState(settings,false);
        if(settingsUtilities)settingsUtilities.inert=false;
        if(soundToggle)soundToggle.inert=false;
        settingsBackdrop.hidden=true;settingsToggle.setAttribute("aria-expanded","false");settingsToggle.setAttribute("aria-label","Open site settings");
        if(wasOpen&&restoreFocus)(isMobileSiteNavigation()?toggle:settingsReturnFocus).focus({preventScroll:true});
    }
    function refreshSettings(){
        const preferences=SitePreferences.get();
        settings.querySelectorAll('[name="siteSound"]').forEach(input=>input.checked=(input.value==="on")===preferences.sfxEnabled);
        settings.querySelectorAll('[name="siteTheme"]').forEach(input=>input.checked=input.value===preferences.theme);
        const language=settings.querySelector('[name="siteLanguage"]');
        if(language){
            if(!language.dataset.nativeOptions){language.replaceChildren(...SitePreferences.locales.map(locale=>{const option=document.createElement("option");option.value=locale.code;option.lang=locale.code;option.dir=locale.dir;option.textContent=locale.label;return option;}));language.dataset.nativeOptions="true";}
            language.value=preferences.language;
        }
    }
    function openSettings(){
        closeDirectory();settingsReturnFocus=document.activeElement;refreshSettings();
        setSiteDialogState(settings,true);
        // The dialog controller correctly inerts background branches, but the
        // settings gear lives inside one of those branches. Re-enable only its
        // utility row so the same gear can close the panel; keep SFX inert.
        if(settingsUtilities)settingsUtilities.inert=false;
        if(soundToggle)soundToggle.inert=true;
        settingsBackdrop.hidden=false;
        settingsToggle.setAttribute("aria-expanded","true");settingsToggle.setAttribute("aria-label","Close site settings");settings.querySelector("[data-settings-close]").focus();
    }
    settingsToggle.addEventListener("click",event=>{event.stopPropagation();if(settings.hidden)openSettings();else closeSettings(true);});
    drawer.querySelector("[data-mobile-settings]").addEventListener("click",openSettings);
    settings.querySelector("[data-settings-close]").addEventListener("click",()=>closeSettings(true));
    settingsBackdrop.addEventListener("click",()=>closeSettings(true));
    settings.addEventListener("keydown",trapSiteDialogFocus);
    settings.addEventListener("change",event=>{
        const input=event.target;
        if(input.name==="siteSound")SitePreferences.set({sfxEnabled:input.value==="on"});
        if(input.name==="siteTheme")SitePreferences.set({theme:input.value});
        if(input.name==="siteLanguage")SitePreferences.set({language:input.value});
    });
    settings.querySelector("[data-preferences-reset]").addEventListener("click",()=>SitePreferences.reset());
    window.addEventListener("bld:preferences",refreshSettings);refreshSettings();SitePreferences.syncAssets();
    document.querySelector(".skip-link").addEventListener("click",event=>{event.preventDefault();document.getElementById("siteMain").focus();});
    toggle.addEventListener("click",()=>{
        if(!drawer.classList.contains("hidden")){closeDirectory(true);return;}
        closeSettings();refreshDirectoryResume();setSiteDialogState(drawer,true);
        toggle.setAttribute("aria-expanded","true");drawer.querySelector("[data-directory-close]").focus();
    });
    drawer.querySelector("[data-directory-close]").addEventListener("click",()=>closeDirectory(true));
    drawer.querySelector(".mobile-directory-backdrop").addEventListener("click",()=>closeDirectory(true));
    drawer.addEventListener("keydown",trapSiteDialogFocus);
    drawer.addEventListener("click",event=>{
        const action=event.target.closest("[data-directory-action]");
        if(action){closeDirectory(true);runDirectoryAction(action.dataset.directoryAction);}
        else if(event.target.closest("[data-how-to-play],[data-about]")){
            const about=!!event.target.closest("[data-about]");closeDirectory(true);openInfoModal(about?"about":"how");
        }else if(event.target.closest("a[href]"))closeDirectory(true);
    });
    groups.forEach(group=>group.addEventListener("toggle",()=>{
        group.querySelector("summary").setAttribute("aria-expanded",String(group.open));
        if(group.open)groups.forEach(other=>{if(other!==group)other.open=false;});refreshDirectoryResume();
    }));
    header.addEventListener("click",event=>{
        const action=event.target.closest("[data-directory-action]");
        if(action){closeDirectory();runDirectoryAction(action.dataset.directoryAction);}
        else if(event.target.closest("[data-how-to-play],[data-about]")){closeDirectory();closeSettings();}
    });
    document.addEventListener("click",event=>{
        if(!header.contains(event.target))groups.forEach(group=>group.open=false);
    });
    document.addEventListener("keydown",event=>{
        if(event.key==="Escape"){
            if(!settings.hidden){event.preventDefault();closeSettings(true);return;}
            if(!drawer.classList.contains("hidden")){event.preventDefault();closeDirectory(true);return;}
            const openGroup=groups.find(group=>group.open);groups.forEach(group=>group.open=false);openGroup?.querySelector("summary").focus();
        }
        if(event.key==="ArrowDown"&&event.target.matches("summary.directory-item")){
            event.preventDefault();event.target.parentElement.open=true;event.target.parentElement.querySelector("button").focus();
        }
        const options=event.target.closest(".directory-options");
        if(options&&["ArrowDown","ArrowUp","Home","End"].includes(event.key)){
            event.preventDefault();const controls=[...options.querySelectorAll("button")].filter(button=>!button.hidden);
            const index=controls.indexOf(document.activeElement);
            const next=event.key==="Home"?0:event.key==="End"?controls.length-1:(index+(event.key==="ArrowDown"?1:-1)+controls.length)%controls.length;
            controls[next]?.focus();
        }
    });
    directory.addEventListener("focusout",event=>{if(event.relatedTarget&&!directory.contains(event.relatedTarget)&&!isMobileSiteNavigation())groups.forEach(group=>group.open=false);});
    // Preserve the desktop content-driven fallback for long translated menus.
    let compact=document.documentElement.hasAttribute("data-header-compact");
    function fitHeader(){
        const root=document.documentElement,inner=header.querySelector(".site-header-inner");
        let next=window.innerWidth<=1200;
        if(!next){
            root.removeAttribute("data-header-compact");
            const probe=directory.cloneNode(true);probe.removeAttribute("id");probe.className="site-directory directory-width-probe";probe.inert=true;probe.setAttribute("aria-hidden","true");
            probe.querySelectorAll("[id]").forEach(node=>node.removeAttribute("id"));header.append(probe);
            const required=header.querySelector(".site-header-brand").getBoundingClientRect().width+probe.getBoundingClientRect().width+header.querySelector(".site-utilities").getBoundingClientRect().width+150+64;
            probe.remove();next=required>inner.clientWidth;
        }
        root.toggleAttribute("data-header-compact",next);
        if(compact!==next){compact=next;closeDirectory();closeSettings();}
    }
    let fitFrame;function scheduleFit(){cancelAnimationFrame(fitFrame);fitFrame=requestAnimationFrame(fitHeader);}
    window.addEventListener("resize",scheduleFit);window.addEventListener("bld:language",scheduleFit);document.fonts?.ready.then(scheduleFit);scheduleFit();
    window.addEventListener("pageshow",()=>{closeDirectory();closeSettings();SitePreferences.syncAssets();});
    window.addEventListener("pagehide",()=>{closeDirectory();closeSettings();});
    window.addEventListener("bld:dialog-open",event=>{
        if(event.detail.modal!==drawer)closeDirectory();
        if(event.detail.modal!==settings)closeSettings();
    });
    if(document.body.dataset.sitePage)updateSiteDirectory();
}
initSiteDirectory();
