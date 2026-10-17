// Native BL-Draft surfaces for local squads and rule-based drafting.
let replayReturnFocus=null;
function closeReplayDialog(){const dialog=document.getElementById("replayDialog");if(dialog){setSiteDialogState(dialog,false);dialog.remove();if(replayReturnFocus?.isConnected)replayReturnFocus.focus({preventScroll:true});}}
function replayDialog(title,body){
    closeReplayDialog();replayReturnFocus=document.activeElement;
    const modal=document.createElement("div");modal.id="replayDialog";modal.className="info-modal replay-modal";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-labelledby","replayDialogTitle");
    modal.innerHTML=`<section class="info-card replay-card"><button type="button" class="info-close" data-replay-close aria-label="Close">×</button><h2 id="replayDialogTitle">${esc(title)}</h2><div class="replay-body">${body}</div><p id="replayFeedback" class="replay-feedback" role="status" aria-live="polite"></p></section>`;
    document.body.appendChild(modal);setSiteDialogState(modal,true);modal.querySelector("[data-replay-close]").onclick=closeReplayDialog;
    modal.addEventListener("click",event=>{if(event.target===modal)closeReplayDialog();});modal.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();closeReplayDialog();return;}trapSiteDialogFocus(event);});
    SiteI18n.apply(modal);modal.querySelector("[data-replay-close]").focus();return modal;
}
function replayError(error){const output=document.getElementById("replayFeedback");if(output)output.textContent=replayText(error.message||"Invalid squad data.");else showSiteError(error.message||"Invalid squad data.","SAVED SQUADS");}
function squadReplayActions(n){return `<div class="replay-actions"><button type="button" data-replay-save="${n}">SAVE SQUAD</button><button type="button" data-replay-build="${n}">BUILD FROM TEAM</button><button type="button" data-replay-export="${n}">SQUAD CODE</button></div>`;}
function promptSaveReplaySquad(n){
    try{const squad=replaySquadFromTeam(n),modal=replayDialog("SAVE SQUAD",`<form id="saveSquadForm"><label for="savedSquadName">TEAM NAME</label><input id="savedSquadName" maxlength="32" required value="${esc(squad.name)}"><button type="submit" class="primary-button">SAVE SQUAD</button></form>`);
        modal.querySelector("form").onsubmit=event=>{event.preventDefault();try{squad.name=modal.querySelector("input").value.trim();saveReplaySquad(squad);openSavedSquads();}catch(error){replayError(error);}};
    }catch(error){replayError(error);}
}
function openSavedSquads(){
    const library=readSquadLibrary();const modal=replayDialog("SAVED SQUADS",`<div class="replay-actions"><button type="button" data-replay-import>IMPORT SQUAD</button>${library.damaged?'<button type="button" data-replay-reset>RESET SAVED SQUADS</button>':""}</div>${library.damaged?'<p>Saved squad data needs attention. Export valid squads before resetting the library.</p>':""}<div class="saved-squad-list">${library.items.length?library.items.map(item=>`<article class="saved-squad-item"><h3 data-i18n-ignore>${esc(item.squad.name)}</h3><p>${esc(item.squad.formation)} · ${esc(replayText("{count} players",{count:item.squad.playerIds.length}))}</p><div class="replay-actions"><button type="button" data-saved-build="${item.id}">BUILD FROM TEAM</button><button type="button" data-saved-copy="${item.id}">DUPLICATE</button><button type="button" data-saved-export="${item.id}">SQUAD CODE</button><button type="button" data-saved-delete="${item.id}">DELETE</button></div></article>`).join(""):'<p>No saved squads yet.</p>'}</div>`);
    modal.querySelector("[data-replay-reset]")?.addEventListener("click",()=>{closeReplayDialog();showConfirm("RESET SAVED SQUADS","Delete all saved squads?",()=>{try{writeSquadLibrary([]);openSavedSquads();}catch(error){replayError(error);}});});
    modal.querySelectorAll("[data-saved-build],[data-saved-copy],[data-saved-export],[data-saved-delete]").forEach(button=>button.onclick=()=>{
        const id=button.dataset.savedBuild||button.dataset.savedCopy||button.dataset.savedExport||button.dataset.savedDelete,item=readSquadLibrary().items.find(item=>item.id===id);if(!item)return;
        try{if(button.hasAttribute("data-saved-build"))buildFromReplaySquad(item.squad);
        else if(button.hasAttribute("data-saved-copy")){saveReplaySquad({...item.squad,name:item.squad.name});openSavedSquads();}
        else if(button.hasAttribute("data-saved-export"))showReplayCode(exportSquadCode(item.squad),"SQUAD CODE");
        else {closeReplayDialog();showConfirm("DELETE SQUAD","Delete this saved squad?",()=>{try{deleteReplaySquad(id);openSavedSquads();}catch(error){replayError(error);}});}}catch(error){replayError(error);}
    });
}
function showReplayCode(code,title){
    const modal=replayDialog(title,`<label for="replayCodeOutput">${esc(title)}</label><textarea id="replayCodeOutput" readonly dir="ltr">${esc(code)}</textarea><button type="button" data-copy-replay>Copy code</button>`);
    modal.querySelector("[data-copy-replay]").onclick=async()=>{const input=modal.querySelector("textarea");input.focus();input.select();try{await navigator.clipboard.writeText(code);modal.querySelector("[data-copy-replay]").textContent=replayText("COPIED ✓");}catch{document.getElementById("replayFeedback").textContent=replayText("Select and copy the code above.");}};
}
function openReplayImport(challenge=false){
    const title=challenge?"IMPORT CHALLENGE":"IMPORT SQUAD",modal=replayDialog(title,`<form id="replayImportForm"><label for="replayCodeInput">${title}</label><textarea id="replayCodeInput" maxlength="12000" required dir="ltr" autocomplete="off"></textarea><button type="submit" class="primary-button">${title}</button></form>`);
    modal.querySelector("form").onsubmit=event=>{event.preventDefault();try{const code=modal.querySelector("textarea").value.trim();if(challenge)launchDraftChallenge(importChallengeCode(code));else buildFromReplaySquad(importSquadCode(code));}catch(error){replayError(error);}};
}
function challengeSummary(rule){return replayText("{budget} budget · {count} players",{budget:"$"+rule.budget.toLocaleString(SiteI18n.language),count:rule.size});}
function challengeCard(rule,index){return `<article class="saved-squad-item"><h3>${esc(replayText(rule.title))}</h3><p>${esc(challengeSummary(rule))}</p>${rule.minChemistry!==null?`<p>${esc(replayText("CHEMISTRY"))} ≥ ${rule.minChemistry}</p>`:""}${rule.maxOverall!==null?`<p>OVR ≤ ${rule.maxOverall}</p>`:""}${Object.entries(rule.positionRequirements).length?`<p>${Object.entries(rule.positionRequirements).map(([role,n])=>esc(role)+" ≥ "+n).join(" · ")}</p>`:""}${rule.formation?`<p>${esc(replayText("FORMATION"))} ${esc(rule.formation)}</p>`:""}<div class="replay-actions"><button type="button" data-play-challenge="${index}">START CHALLENGE</button><button type="button" data-code-challenge="${index}">CHALLENGE CODE</button></div></article>`;}
function openDraftChallenges(daily=false){
    const rules=daily?[dailyEgoDraft()]:draftChallengePresets();let completed=false;try{completed=daily&&JSON.parse(localStorage.getItem(DAILY_PROGRESS_KEY)||"{}")[rules[0].date]===exportChallengeCode(rules[0]);}catch{}const modal=replayDialog(daily?"DAILY EGO DRAFT":"DRAFT CHALLENGES",`${completed?"<p>Completed today</p>":""}${daily?`<p><time>${esc(rules[0].date)}</time> · ${esc(replayText("Same rules throughout your local calendar day."))}</p>`:""}<div class="replay-actions"><button type="button" data-import-challenge>IMPORT CHALLENGE</button></div><div class="challenge-list">${rules.map(challengeCard).join("")}</div>`);
    modal.querySelectorAll("[data-play-challenge]").forEach(button=>button.onclick=()=>launchDraftChallenge(rules[Number(button.dataset.playChallenge)]));
    modal.querySelectorAll("[data-code-challenge]").forEach(button=>button.onclick=()=>showReplayCode(exportChallengeCode(rules[Number(button.dataset.codeChallenge)]),"CHALLENGE CODE"));
}
function launchDraftChallenge(value){
    const rule=normalizeDraftChallenge(value);
    function start(){closeReplayDialog();clearSavedGame();setupDraftChallenge=rule;try{sessionStorage.setItem(CHALLENGE_SETUP_KEY,JSON.stringify(rule));sessionStorage.setItem("bldSingleplayerEntryV1","true");}catch{}if(appRelativePath()===routePath("auctionSetup")){applyReplaySetup();setVisibleScreen(setupScreen);}else updateRoute("auctionSetup");}
    if(loadSavedData()?.gameActive){closeReplayDialog();showConfirm("START A NEW AUCTION","A saved auction already exists. Starting a new setup will discard that unfinished auction.",start);}else start();
}
function lockChallengeSetupControls(){
    document.querySelectorAll('#budget,#bidIncrement,#maxPlayers,#cpuDifficulty,#team2CpuControlled,#randomDraftGame,[data-game-mode],[data-pool-category],#selectAllPlayers,#invertPlayers,#clearAllPlayers,#playerPoolGrid button').forEach(control=>control.disabled=!!setupDraftChallenge);
}
function applyReplaySetup(){
    if(!document.getElementById("cpuDifficulty"))return;
    let single=false;try{single=sessionStorage.getItem("bldSingleplayerEntryV1")==="true";if(single)sessionStorage.removeItem("bldSingleplayerEntryV1");const raw=sessionStorage.getItem(CHALLENGE_SETUP_KEY);if(raw)setupDraftChallenge=normalizeDraftChallenge(JSON.parse(raw));}catch{setupDraftChallenge=null;try{sessionStorage.removeItem(CHALLENGE_SETUP_KEY);}catch{}}
    const cpu=document.getElementById("team2CpuControlled");if(single){cpu.checked=true;if(document.getElementById("team2Name").value==="TEAM 2")document.getElementById("team2Name").value="CPU";}
    document.getElementById("cpuDifficultyField").hidden=!cpu.checked;
    const banner=document.getElementById("setupChallengeStatus");
    if(setupDraftChallenge){const rule=setupDraftChallenge;cpu.checked=true;document.getElementById("cpuDifficulty").value=rule.cpuDifficulty;document.getElementById("cpuDifficultyField").hidden=false;for(const [id,value]of Object.entries({budget:rule.budget,bidIncrement:rule.increment,maxPlayers:rule.size}))document.getElementById(id).value=value;
        playerPoolCategoryState=Object.fromEntries(Object.keys(PLAYER_POOL_CATEGORIES).map(key=>[key,false]));playerPoolManualOverrides=Object.fromEntries(rule.playerIds.map(id=>[id,true]));selectedPlayerIds=new Set(rule.playerIds);renderPlayerPool();
        banner.innerHTML=`<strong>${esc(replayText(rule.title))}</strong><span>${esc(challengeSummary(rule))}</span><button type="button" data-leave-challenge>LEAVE CHALLENGE</button>`;banner.hidden=false;
    }else {banner.hidden=true;banner.innerHTML="";}
    lockChallengeSetupControls();saveSetupPreferences();
}
function startSingleplayer(){
    function start(){clearSavedGame();try{sessionStorage.removeItem(CHALLENGE_SETUP_KEY);sessionStorage.setItem("bldSingleplayerEntryV1","true");}catch{}setupDraftChallenge=null;if(appRelativePath()===routePath("auctionSetup"))applyReplaySetup();else updateRoute("auctionSetup");}
    if(loadSavedData()?.gameActive)showConfirm("START A NEW AUCTION","A saved auction already exists. Starting a new setup will discard that unfinished auction.",start);else start();
}
function challengeStatusMarkup(n){
    if(!activeDraftChallenge||n!==1)return "";
    const evaluation=challengeEvaluation(activeDraftChallenge,n);
    if(evaluation.complete&&activeDraftChallenge.id==="daily")try{const progress=JSON.parse(localStorage.getItem(DAILY_PROGRESS_KEY)||"{}");progress[activeDraftChallenge.date]=exportChallengeCode(activeDraftChallenge);const entries=Object.entries(progress).sort().slice(-60);localStorage.setItem(DAILY_PROGRESS_KEY,JSON.stringify(Object.fromEntries(entries)));}catch{}
    return `<section class="challenge-progress"><h3>${esc(replayText(activeDraftChallenge.title))}</h3><strong>${esc(replayText(evaluation.complete?"CHALLENGE COMPLETE":"CHALLENGE IN PROGRESS"))}</strong><ul>${evaluation.goals.map(goal=>`<li><span aria-hidden="true">${goal.pass?"✓":"○"}</span> ${esc(replayText(goal.label))}</li>`).join("")}</ul></section>`;
}
function initReplayabilityUI(){
    const home=document.querySelector(".home-modes");if(home&&!document.getElementById("replayDiscovery"))home.insertAdjacentHTML("afterend",`<div id="replayDiscovery" class="replay-discovery"><button type="button" data-singleplayer>SINGLEPLAYER / VS CPU</button><button type="button" data-daily-draft>DAILY EGO DRAFT</button><button type="button" data-draft-challenges>DRAFT CHALLENGES</button><button type="button" data-saved-squads>SAVED SQUADS</button></div>`);
    document.getElementById("team2CpuControlled")?.addEventListener("change",()=>{document.getElementById("cpuDifficultyField").hidden=!document.getElementById("team2CpuControlled").checked;saveSetupPreferences();});
    document.getElementById("cpuDifficulty")?.addEventListener("change",saveSetupPreferences);
    if(getRouteFromLocation()==="auctionSetup")applyReplaySetup();
}
document.addEventListener("click",event=>{
    const button=event.target.closest("button");if(!button)return;
    try{
        if(button.matches("[data-replay-save]"))promptSaveReplaySquad(Number(button.dataset.replaySave));
        else if(button.matches("[data-replay-build]"))buildFromReplaySquad(replaySquadFromTeam(Number(button.dataset.replayBuild)));
        else if(button.matches("[data-replay-export]"))showReplayCode(exportSquadCode(replaySquadFromTeam(Number(button.dataset.replayExport))),"SQUAD CODE");
        else if(button.matches("[data-saved-squads]"))openSavedSquads();
        else if(button.matches("[data-replay-import]"))openReplayImport(false);
        else if(button.matches("[data-import-challenge]"))openReplayImport(true);
        else if(button.matches("[data-singleplayer]"))startSingleplayer();
        else if(button.matches("[data-daily-draft]"))openDraftChallenges(true);
        else if(button.matches("[data-draft-challenges]"))openDraftChallenges(false);
        else if(button.matches("[data-leave-challenge]")){setupDraftChallenge=null;try{sessionStorage.removeItem(CHALLENGE_SETUP_KEY);}catch{}applyReplaySetup();}
    }catch(error){replayError(error);}
});
