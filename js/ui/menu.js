// BLUE LOCK DRAFT // MENU UI
// Split from the former root script.js. Classic scripts share the same global scope.

function setVisibleScreen(screen){
    [
        menuScreen,setupScreen,auctionScreen,formationScreen,
        document.getElementById("lore-menu-screen"),
        document.getElementById("character-lore-screen"),
        document.getElementById("chemistry-lore-screen")
    ].forEach(el=>el&&el.classList.add("hidden"));
    if(screen)screen.classList.remove("hidden");
    window.scrollTo({top:0,behavior:"smooth"});
}
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
function goToMainMenu(){
    if(uiState.screen==="auction"||uiState.screen==="formation"||uiState.screen==="standalone-builder")saveGame();
    if(uiState.screen==="standalone-builder"){
        formationScreen.classList.remove("standalone-builder-mode");
        if(typeof configureFormationHeader==="function")configureFormationHeader(false);
    }
    hideSiteError();
    const info=document.getElementById("infoModal");if(info)info.classList.add("hidden");
    const confirm=document.getElementById("confirmModal");if(confirm)confirm.classList.add("hidden");
    gameOverlay.classList.add("hidden");gameOverlay.classList.remove("overlay-out");
    setVisibleScreen(menuScreen);refreshMainMenu();
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
            <div class="rule"><b>01</b><span>SET UP</span><p>Name both teams, choose colors, budget, bid interval, roster size and the characters in the player pool.</p></div>
            <div class="rule"><b>02</b><span>OPENING BID</span><p>A coin flip chooses who opens first. Opening responsibility alternates every player. The opener chooses any valid amount within their budget.</p></div>
            <div class="rule"><b>03</b><span>BID OR PASS</span><p>Teams take turns. A new bid must beat the current bid, fit the configured interval, and stay within that team's remaining budget.</p></div>
            <div class="rule"><b>04</b><span>WIN PLAYER</span><p>Passing ends the auction and the current highest bidder signs the player. Their winning bid is deducted from their budget.</p></div>
            <div class="rule"><b>05</b><span>ZERO BUDGET</span><p>If the opening side has no money, the funded team controls the decision: buy the player or pass and release them to the zero-budget team for free.</p></div>
            <div class="rule"><b>06</b><span>FULL ROSTER</span><p>Once one team reaches its roster limit, future players are automatically assigned to the other team until both squads are complete.</p></div>
            <div class="rule"><b>07</b><span>FORMATION</span><p>After the draft, compare both squads and build formations using the players each team won.</p></div>
            <div class="rule"><b>08</b><span>AUTOSAVE</span><p>Your active auction is stored locally in this browser. Return to the main menu and use Resume Auction to continue.</p></div>
          </div>`;
    }
    modal.classList.remove("hidden");
}
function closeInfoModal(){document.getElementById("infoModal").classList.add("hidden");}

document.getElementById("menuNewAuction").addEventListener("click",openSetupFromMenu);
document.getElementById("menuResumeAuction").addEventListener("click",()=>restoreGame(loadSavedData()));
document.getElementById("menuHowToPlay").addEventListener("click",()=>openInfoModal("how"));
document.getElementById("menuAbout").addEventListener("click",()=>openInfoModal("about"));
document.getElementById("setupBackToMenu").addEventListener("click",()=>{saveSetupPreferences();setVisibleScreen(menuScreen);refreshMainMenu();});
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
document.getElementById("resumeSessionButton").addEventListener("click",()=>restoreGame(loadSavedData()));
document.getElementById("discardSessionButton").addEventListener("click",()=>showConfirm("DISCARD SAVED AUCTION","This permanently removes the unfinished local auction from this browser.",()=>{clearSavedGame();showResumeCard(null);}));
