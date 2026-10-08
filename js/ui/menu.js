// BLUE LOCK DRAFT // MENU UI
function initPersistentSiteChrome(){
    const sidebar=document.getElementById("siteSidebar");
    if(!sidebar)return;
    const toggleButtons=document.querySelectorAll("[data-site-sidebar-toggle]");
    const closeButtons=sidebar.querySelectorAll("[data-site-sidebar-close]");
    const closeSidebar=()=>{
        sidebar.classList.remove("is-open");
        sidebar.setAttribute("aria-hidden","true");
        toggleButtons.forEach(button=>button.setAttribute("aria-expanded","false"));
        document.body.classList.remove("sidebar-open");
    };
    const openSidebar=()=>{
        sidebar.classList.add("is-open");
        sidebar.setAttribute("aria-hidden","false");
        toggleButtons.forEach(button=>button.setAttribute("aria-expanded","true"));
        document.body.classList.add("sidebar-open");
        sidebar.querySelector(".site-sidebar-close")?.focus();
    };
    toggleButtons.forEach(button=>button.addEventListener("click",()=>sidebar.classList.contains("is-open")?closeSidebar():openSidebar()));
    closeButtons.forEach(button=>button.addEventListener("click",closeSidebar));
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&sidebar.classList.contains("is-open"))closeSidebar();});
    sidebar.querySelectorAll("[data-site-nav]").forEach(button=>button.addEventListener("click",()=>{
        const action=button.getAttribute("data-site-nav");
        closeSidebar();
        if(action==="home")goToMainMenu();
        else if(action==="new-auction")openSetupFromMenu();
        else if(action==="resume")resumeSavedAuction(loadSavedData());
        else if(action==="builder")openStandaloneBuilder();
        else if(action==="lore")updateRoute("lore");
        else if(action==="how-to-play")openInfoModal("how");
        else if(action==="about")openInfoModal("about");
    }));
}
initPersistentSiteChrome();

function refreshMainMenu(){
    const saved=loadSavedData();
    const hasGame=!!saved?.gameActive;
    const resume=document.getElementById("menuResumeAuction");
    const panel=document.getElementById("menuResumePanel");
    resume.classList.toggle("hidden",!hasGame);
    panel.classList.toggle("hidden",!hasGame);
    if(hasGame){
        document.getElementById("menuResumeMeta").textContent=
          `AUCTION ${String(saved.auctionNumber||0).padStart(2,"0")} // ${saved.team1?.name||"TEAM 1"} ${saved.team1?.players?.length||0}/${saved.maxPlayers} VS ${saved.team2?.name||"TEAM 2"} ${saved.team2?.players?.length||0}/${saved.maxPlayers}`;
    }
}
function goToMainMenu(options={}){
    if(uiState.screen==="auction"||uiState.screen==="formation"||uiState.screen==="standalone-builder")saveGame();

    if(!options.skipHistory&&!historyOnlyNavigation()&&appRelativePath()!==routePath("menu")){updateRoute("menu");return;}

    if(uiState.screen==="standalone-builder"){
        formationScreen.classList.remove("standalone-builder-mode");

    }

    hideSiteError();

    const info=document.getElementById("infoModal");
    if(info)info.classList.add("hidden");

    const confirm=document.getElementById("confirmModal");
    if(confirm)confirm.classList.add("hidden");

    gameOverlay.classList.add("hidden");
    gameOverlay.classList.remove("overlay-out");

    setVisibleScreen(menuScreen,options);
    refreshMainMenu();
}
document.querySelectorAll("[data-main-menu]").forEach(b=>b.addEventListener("click",goToMainMenu));

function openSetupFromMenu(){
    const saved=loadSavedData();
    if(saved?.gameActive){
        showConfirm("START A NEW AUCTION","A saved auction already exists. Starting a new setup will discard that unfinished auction.",()=>{
            clearSavedGame();
            uiState={screen:"setup",phase:"setup",turn:null};
            showResumeCard(null);
            refreshMainMenu();
            setVisibleScreen(setupScreen);
            renderPlayerPool();
            saveSetupPreferences();
        });
        return;
    }
    setVisibleScreen(setupScreen);
    renderPlayerPool();
}
function openInfoModal(type){
    const modal=document.getElementById("infoModal");
    const title=document.getElementById("infoModalTitle");
    const code=document.getElementById("infoModalCode");
    const body=document.getElementById("infoModalBody");
    if(type==="about"){
        code.textContent="BL // PROJECT INFORMATION";
        title.textContent="ABOUT";
        body.innerHTML=`
          <div class="info-section"><span>PROJECT</span><h3>BLUE LOCK DRAFT</h3>
          <p>A local two-player auction team builder developed by <strong>hammydanny@Github</strong>, with the support of <strong>syaafibwn@Github</strong>. Draft a custom player pool, compete for every signing, then arrange your finished squads in the formation builder.</p></div>
          <div class="info-section"><span>STATUS</span><h3>UNOFFICIAL FAN PROJECT</h3>
          <p>This is a non-commercial fan-made project. It is not affiliated with, endorsed by, or sponsored by the creators, publishers, licensors, or rights holders of Blue Lock. Blue Lock and related characters and imagery belong to their respective rights holders.</p></div>`;
    }else{
        code.textContent="BL // AUCTION PROTOCOL";
        title.textContent="HOW TO PLAY";
        body.innerHTML=`
          <div class="rule-grid">
            <div class="rule"><b>01</b><span>CHOOSE YOUR SETTINGS</span><p>Name teams. Pick budgets, bid interval, roster size and players. Random Draft skips bidding.</p></div>
            <div class="rule"><b>02</b><span>AUCTION PLAYERS</span><p>Players appear one at a time. A coin flip picks the first opener; teams alternate openings.</p></div>
            <div class="rule"><b>03</b><span>BID OR PASS</span><p>Open or raise in multiples of the bid interval, within your budget. Passing awards the player to the bid leader.</p></div>
            <div class="rule"><b>04</b><span>BUILD YOUR SQUAD</span><p>Manage money and roster space. A full team stops bidding; the other team receives remaining signings free. Zero-budget situations allow free signings.</p></div>
            <div class="rule"><b>05</b><span>BUILD YOUR FORMATION</span><p>After drafting, drag players into positions, swap them or move them to Reserves. Choose a captain.</p></div>
            <div class="rule"><b>06</b><span>CHEMISTRY &amp; POSITIONS</span><p>Suitable positions improve player performance. Shared history and demonstrated combinations improve chemistry.</p></div>
            <div class="rule"><b>07</b><span>AUTO BEST</span><p>Auto Best checks all ten formations for a strong lineup using your selected squad.</p></div>
            <div class="rule"><b>08</b><span>RESULTS</span><p>Compare both squads. Share saves the exact formation you built, including captain and reserves.</p></div>
          </div>
          <div class="info-section"><p><strong>UNDO / REDO</strong> reverses or repeats auction actions. <strong>PARTIAL SQUADS</strong> use only deployed players. <strong>STANDALONE TEAM BUILDER</strong> makes a separate squad. Both modes save locally in this browser.</p></div>`;
    }
    modal.classList.remove("hidden");
}
function closeInfoModal(){document.getElementById("infoModal").classList.add("hidden");}

document.getElementById("menuNewAuction").addEventListener("click",openSetupFromMenu);
document.getElementById("menuResumeAuction").addEventListener("click",()=>resumeSavedAuction(loadSavedData()));
document.getElementById("menuHowToPlay").addEventListener("click",()=>openInfoModal("how"));
document.querySelectorAll("[data-how-to-play]").forEach(button=>button.addEventListener("click",()=>openInfoModal("how")));
document.getElementById("menuAbout").addEventListener("click",()=>openInfoModal("about"));
document.getElementById("setupBackToMenu")?.addEventListener("click",()=>{saveSetupPreferences();setVisibleScreen(menuScreen);refreshMainMenu();});
document.getElementById("infoModalClose").addEventListener("click",closeInfoModal);
document.getElementById("infoModalDone").addEventListener("click",closeInfoModal);
document.getElementById("infoModal").addEventListener("click",e=>{if(e.target.id==="infoModal")closeInfoModal();});

function showConfirm(title,message,onAccept){
    pendingConfirmAction=onAccept;
    document.getElementById("confirmTitle").textContent=title;
    document.getElementById("confirmMessage").textContent=message;
    document.getElementById("confirmModal").classList.remove("hidden");
}
function closeConfirm(){document.getElementById("confirmModal").classList.add("hidden");pendingConfirmAction=null;}
document.getElementById("confirmCancel").addEventListener("click",closeConfirm);
document.getElementById("confirmAccept").addEventListener("click",()=>{const fn=pendingConfirmAction;closeConfirm();if(fn)fn();});
document.getElementById("resumeSessionButton").addEventListener("click",()=>resumeSavedAuction(loadSavedData()));
document.getElementById("discardSessionButton").addEventListener("click",()=>showConfirm("DISCARD SAVED AUCTION","This permanently removes the unfinished local auction from this browser.",()=>{clearSavedGame();showResumeCard(null);}));
