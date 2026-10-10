// BLUE LOCK DRAFT // MENU UI
function refreshMainMenu(){
    refreshDirectoryResume();
    const saved=loadSavedData();
    renderHomepageDiscovery();
    refreshHomepageSession(saved);
}
function goToMainMenu(options={}){
    if(uiState.screen==="setup")saveSetupPreferences();
    if(uiState.screen==="auction"||uiState.screen==="formation"||uiState.screen==="standalone-builder")saveGame();

    if(!options.skipHistory&&!historyOnlyNavigation()&&appRelativePath()!==routePath("menu")){updateRoute("menu");return;}

    if(uiState.screen==="standalone-builder"){
        formationScreen.classList.remove("standalone-builder-mode");

    }

    hideSiteError();

    const info=document.getElementById("infoModal");
    if(info)setSiteDialogState(info,false);

    const confirm=document.getElementById("confirmModal");
    if(confirm)setSiteDialogState(confirm,false);

    gameOverlay.classList.add("hidden");
    gameOverlay.classList.remove("overlay-out");

    setVisibleScreen(menuScreen,options);
    refreshMainMenu();
}

function openSetupFromMenu({quickDraft=false}={}){
    const saved=loadSavedData();
    if(saved?.gameActive){
        showConfirm("START A NEW AUCTION","A saved auction already exists. Starting a new setup will discard that unfinished auction.",()=>{
            clearSavedGame();
            uiState={screen:"setup",phase:"setup",turn:null};
            showResumeCard(null);
            refreshMainMenu();
            setVisibleScreen(setupScreen,{quickDraft});
            renderPlayerPool();
            saveSetupPreferences();
        });
        return;
    }
    setVisibleScreen(setupScreen,{quickDraft});
    renderPlayerPool();
}
document.getElementById("menuNewAuction").addEventListener("click",openSetupFromMenu);
document.getElementById("menuResumeAuction").addEventListener("click",()=>resumeSavedAuction(loadSavedData()));

let confirmReturnFocus=null;
function showConfirm(title,message,onAccept){
    confirmReturnFocus=document.activeElement;
    pendingConfirmAction=onAccept;
    document.getElementById("confirmTitle").textContent=title;
    document.getElementById("confirmMessage").textContent=message;
    setSiteDialogState(document.getElementById("confirmModal"),true);
    document.getElementById("confirmCancel").focus();
}
function closeConfirm(){
    setSiteDialogState(document.getElementById("confirmModal"),false);
    pendingConfirmAction=null;
    if(confirmReturnFocus?.isConnected)confirmReturnFocus.focus();
}
document.getElementById("confirmModal").addEventListener("keydown",event=>{
    if(event.key==="Escape"){event.preventDefault();closeConfirm();return;}
    trapSiteDialogFocus(event);
});
document.getElementById("confirmCancel").addEventListener("click",closeConfirm);
document.getElementById("confirmAccept").addEventListener("click",()=>{const fn=pendingConfirmAction;closeConfirm();if(fn)fn();});
document.getElementById("resumeSessionButton").addEventListener("click",()=>resumeSavedAuction(loadSavedData()));
document.getElementById("discardSessionButton").addEventListener("click",()=>showConfirm("DISCARD SAVED AUCTION","This permanently removes the unfinished local auction from this browser.",()=>{clearSavedGame();showResumeCard(null);}));
