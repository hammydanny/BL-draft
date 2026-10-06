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
    updateGlobalBackButton?.();
}
let globalBackButton=null;
function ensureGlobalBackButton(){
    if(globalBackButton&&document.body.contains(globalBackButton))return globalBackButton;
    globalBackButton=document.createElement("button");
    globalBackButton.id="globalBackButton";
    globalBackButton.className="global-back-button hidden";
    globalBackButton.type="button";
    globalBackButton.innerHTML="← <span>BACK</span>";
    globalBackButton.addEventListener("click",handleGlobalBack);
    document.body.appendChild(globalBackButton);
    return globalBackButton;
}
function updateGlobalBackButton(){
    const button=ensureGlobalBackButton();
    const shareOpen=!!document.getElementById("shareScreen");
    const auctionVisible=!auctionScreen.classList.contains("hidden");
    const auctionResults=uiState?.screen==="auction"&&uiState?.phase==="complete";
    // Setup, Lore, Formation and completed Results already have their own navigation/actions.
    // Only surface the global Back during an active auction where the page itself has no Back control.
    button.classList.toggle("hidden",shareOpen||!auctionVisible||auctionResults);
}
function handleGlobalBack(){
    const info=document.getElementById("infoModal");
    if(info&&!info.classList.contains("hidden")){closeInfoModal();return;}
    const confirm=document.getElementById("confirmModal");
    if(confirm&&!confirm.classList.contains("hidden")){closeConfirm();return;}
    const share=document.getElementById("shareScreen");
    if(share){share.remove();return;}
    if(!document.getElementById("character-lore-screen")?.classList.contains("hidden")||
       !document.getElementById("chemistry-lore-screen")?.classList.contains("hidden")){
        if(typeof openLoreMenu==="function")openLoreMenu();
        else setVisibleScreen(document.getElementById("lore-menu-screen"));
        return;
    }
    if(!document.getElementById("lore-menu-screen")?.classList.contains("hidden")){
        setVisibleScreen(menuScreen);refreshMainMenu();return;
    }
    if(!setupScreen.classList.contains("hidden")){
        saveSetupPreferences();setVisibleScreen(menuScreen);refreshMainMenu();return;
    }
    if(!formationScreen.classList.contains("hidden")){
        if(formationTeamNumber===0||uiState.screen==="standalone-builder"){
            if(typeof leaveStandaloneBuilder==="function")leaveStandaloneBuilder();
            else goToMainMenu();
        }else document.getElementById("backToResults")?.click();
        return;
    }
    if(!auctionScreen.classList.contains("hidden")){
        goToMainMenu();return;
    }
    setVisibleScreen(menuScreen);refreshMainMenu();
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
            <div class="rule"><b>01</b><span>BUILD THE PLAYER POOL</span><p>Choose roster size and auction rules, then combine the category checks, use search/role filters, Select All, Invert, Clear All or individual player cards to define exactly who can appear. Overlapping categories remain selected while any enabled category still includes that player.</p></div>
            <div class="rule"><b>02</b><span>CHOOSE A DRAFT MODE</span><p>Initialize the live auction for two-player bidding, or use Random Draft to skip bidding and instantly create both squads from the selected pool.</p></div>
            <div class="rule"><b>03</b><span>OPENING BID</span><p>A coin flip chooses the first opener. Opening responsibility alternates by player. Enter a valid opening value that fits the bid interval and available budget.</p></div>
            <div class="rule"><b>04</b><span>BID OR PASS</span><p>The active side can raise or pass. Every raise must beat the current valuation, respect the interval and stay within that team's remaining capital.</p></div>
            <div class="rule"><b>05</b><span>SIGNINGS & BUDGET</span><p>Passing awards the player to the current leader. The command-center view keeps both budgets, roster counts, signings and the live bid visible together.</p></div>
            <div class="rule"><b>06</b><span>SPECIAL AUCTION STATES</span><p>Zero-budget and full-roster situations are handled automatically so the draft can continue without impossible bids or overfilled squads.</p></div>
            <div class="rule"><b>07</b><span>TEAM BUILDER</span><p>After the draft, place players into formations, swap or bench them, assign a captain, inspect position-adjusted OVR and build around tactical chemistry links.</p></div>
            <div class="rule"><b>08</b><span>AUTO BEST TEAM</span><p>Auto Best Team searches the selected roster for a stronger positional and chemistry-aware lineup. Players outside the active XI remain in Reserves.</p></div>
            <div class="rule"><b>09</b><span>PARTIAL SQUADS</span><p>Squads smaller than eleven use only the appropriate number of active formation slots. Team OVR and chemistry are calculated from the players actually deployed.</p></div>
            <div class="rule"><b>10</b><span>RESULTS & SHARE</span><p>Results compare both squads. Share displays the formation exactly as you built it—including empty or incomplete teams—along with OVR, chemistry, captain and reserves.</p></div>
            <div class="rule"><b>11</b><span>STANDALONE BUILDER</span><p>TEAM BUILDER on the main menu creates one independent Global XI. Select a roster, use Auto Best, manage reserves, captain, chemistry and formations, and save it locally.</p></div>
            <div class="rule"><b>12</b><span>LORE DATABASE</span><p>The Lore section contains character descriptions, attributes, positions and chemistry references. Search Characters or Chemistry directly from the main menu.</p></div>
            <div class="rule"><b>13</b><span>AUTOSAVE & MOBILE</span><p>Active auctions and the standalone builder save locally in this browser. Setup, bidding, formation building, results and Lore all adapt to mobile layouts.</p></div>
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

ensureGlobalBackButton();
updateGlobalBackButton();
