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
    try{promptSaveReplayValue(replaySquadFromTeam(n),()=>document.querySelectorAll(`[data-replay-save="${n}"]`).forEach(button=>{button.disabled=true;button.textContent=replayText("SAVED");}));}catch(error){replayError(error);}
}
function promptSaveReplayValue(value,onSave=()=>{}){
    try{const squad=normalizeReplaySquad(value),modal=replayDialog("SAVE SQUAD",`<form id="saveSquadForm"><label for="savedSquadName">TEAM NAME</label><input id="savedSquadName" maxlength="32" required value="${esc(squad.name)}"><button type="submit" class="primary-button">SAVE SQUAD</button></form>`);
        modal.querySelector("form").onsubmit=event=>{event.preventDefault();try{squad.name=modal.querySelector("input").value.trim();saveReplaySquad(squad);onSave();openSavedSquads();}catch(error){replayError(error);}};
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
    modal.querySelector("form").onsubmit=event=>{event.preventDefault();try{const code=modal.querySelector("textarea").value.trim();if(challenge)openModeBriefing(importChallengeCode(code));else buildFromReplaySquad(importSquadCode(code));}catch(error){replayError(error);}};
}
function modeObjectiveInstructions(rule){
    const blank={assignment:{},shape:[],ovr:0,formation:"",captainId:null,chemistry:{overall:0}},team={players:[],budget:startingBudget};
    const rows=[replayText("Build {count} players into a usable formation.",{count:rule.size})];
    if(rule.minChemistry!==null)rows.push(replayText("CHEMISTRY")+" ≥ "+rule.minChemistry);if(rule.maxOverall!==null)rows.push("OVR ≤ "+rule.maxOverall);for(const [role,count]of Object.entries(rule.positionRequirements))rows.push(role+" ≥ "+count);
    for(const objective of rule.objectives||[]){const goal=modeObjectiveEvaluation(objective,team,blank),plain=["player","captain","exclude","formation"].includes(objective.type);rows.push(replayText(goal.label)+(plain?"":" "+(goal.maximum?"≤":"≥")+" "+objective.target)+(objective.bonus?" · "+replayText("BONUS"):""));}
    if(rule.formation)rows.push(replayText("FORMATION")+" "+rule.formation);
    for(const limit of rule.limits||[])rows.push(replayText(limit.elite?"ELITE CONTRACTS":PLAYER_POOL_CATEGORIES[limit.category].label)+" ≤ "+limit.max);
    return rows;
}
function modeBestMarkup(rule){const best=modeBest(rule);return best?`<div class="mode-best"><span>${esc(replayText(best.completed?"COMPLETED":"PERSONAL BEST"))}</span><strong>${best.grade} <b>${best.score.toLocaleString(SiteI18n.language)}</b></strong></div>`:`<div class="mode-best"><span>NO RESULT YET</span><strong>—</strong></div>`;}
function openModeBriefing(value){
    const rule=normalizeDraftChallenge(value),daily=rule.id==="daily",pool=rule.playerIds.map(playerById),focus=rule.theme==="speed"?"SPEED":rule.theme==="defence"?"DEFENCE":rule.theme==="creators"?"PASSING":rule.theme==="chemistry"?"CHEMISTRY":rule.theme==="value"?"BUDGET EFFICIENCY":"TEAM QUALITY";
    const modal=replayDialog(daily?"DAILY EGO DRAFT":"MISSION BRIEFING",`<div class="mode-briefing mode-theme-${rule.theme}"><div class="mode-brief-hero"><span class="mode-overline">${daily?esc(rule.date):esc(replayText(rule.difficulty?.toUpperCase()||"NORMAL"))}</span><h3>${esc(replayText(rule.title))}</h3><p>${esc(replayText(rule.description||"Build a squad within the challenge rules."))}</p>${modeBestMarkup(rule)}</div><div class="mode-facts"><div><span>BUDGET</span><b>$${rule.budget.toLocaleString(SiteI18n.language)}</b></div><div><span>PLAYERS</span><b>${rule.size}</b></div><div><span>SCORING FOCUS</span><b>${esc(replayText(focus))}</b></div></div><div class="mode-brief-columns"><section><h4>MISSION OBJECTIVES</h4><ul>${modeObjectiveInstructions(rule).map(line=>`<li>${esc(line)}</li>`).join("")}</ul></section><section><h4>SCOUT. NOMINATE. COMPETE.</h4><p>${esc(replayText(rule.v===2?"Choose one of three public targets before each auction. Spend scouting refreshes carefully.":"Classic auction rules. Objectives are checked at squad review."))}</p><p>${esc(replayText("Scouting refreshes: {count}",{count:rule.scouts||0}))}</p><p>Contract limits apply to both managers. The opponent has the same starting budget.</p></section></div><details class="mode-pool"><summary>${esc(replayText("PUBLIC MARKET"))} · ${pool.length}</summary><div>${pool.map(p=>`<span data-i18n-ignore>${esc(p.name)}</span>`).join("")}</div></details><div class="mode-primary-actions"><button type="button" class="primary-button" data-start-mode>ENTER DRAFT</button><button type="button" data-brief-code>CHALLENGE CODE</button></div></div>`);
    modal.classList.add("mode-dialog");modal.querySelector("[data-start-mode]").onclick=()=>launchDraftChallenge(rule);modal.querySelector("[data-brief-code]").onclick=()=>showReplayCode(exportChallengeCode(rule),"CHALLENGE CODE");
    playSfx("nav");
}
function challengeSummary(rule){return replayText("{budget} budget · {count} players",{budget:"$"+rule.budget.toLocaleString(SiteI18n.language),count:rule.size});}
function openDraftChallenges(daily=false){
    if(daily){openDailyBriefing();return;}
    openPuzzleHub();
}
function launchDraftChallenge(value){
    const rule=normalizeDraftChallenge(value);
    function start(){closeReplayDialog();clearSavedGame();setupDraftChallenge=rule;try{sessionStorage.setItem(CHALLENGE_SETUP_KEY,JSON.stringify(rule));}catch{}applyReplaySetup();document.getElementById("team2Name").value="CPU";startGame();}
    if(loadSavedData()?.gameActive){closeReplayDialog();showConfirm("START A NEW AUCTION","A saved auction already exists. Starting a new setup will discard that unfinished auction.",start);}else start();
}
function lockChallengeSetupControls(){document.querySelectorAll('#budget,#bidIncrement,#maxPlayers,#cpuDifficulty,#team2CpuControlled,#randomDraftGame,[data-game-mode],[data-pool-category],#selectAllPlayers,#invertPlayers,#clearAllPlayers,#playerPoolGrid button').forEach(control=>control.disabled=!!setupDraftChallenge);}
function applyReplaySetup(){
    if(!document.getElementById("cpuDifficulty"))return;let single=false;
    try{single=sessionStorage.getItem("bldSingleplayerEntryV1")==="true";sessionStorage.removeItem("bldSingleplayerEntryV1");const raw=sessionStorage.getItem(CHALLENGE_SETUP_KEY);if(raw)setupDraftChallenge=normalizeDraftChallenge(JSON.parse(raw));}catch{setupDraftChallenge=null;try{sessionStorage.removeItem(CHALLENGE_SETUP_KEY);}catch{}}
    const cpu=document.getElementById("team2CpuControlled"),banner=document.getElementById("setupChallengeStatus");if(single)cpu.checked=true;
    if(setupDraftChallenge){const rule=setupDraftChallenge;cpu.checked=true;document.getElementById("cpuDifficulty").value=rule.cpuDifficulty;for(const [id,value]of Object.entries({budget:rule.budget,bidIncrement:rule.increment,maxPlayers:rule.size}))document.getElementById(id).value=value;
        playerPoolCategoryState=Object.fromEntries(Object.keys(PLAYER_POOL_CATEGORIES).map(key=>[key,false]));playerPoolManualOverrides=Object.fromEntries(rule.playerIds.map(id=>[id,true]));selectedPlayerIds=new Set(rule.playerIds);renderPlayerPool();banner.innerHTML=`<strong>${esc(replayText(rule.title))}</strong><span>${esc(challengeSummary(rule))}</span><button type="button" data-leave-challenge>LEAVE CHALLENGE</button>`;banner.hidden=false;
    }else{banner.hidden=true;banner.innerHTML="";}
    document.getElementById("cpuDifficultyField").hidden=!cpu.checked;lockChallengeSetupControls();saveSetupPreferences();
}
function openCpuBriefing(){
    const modal=replayDialog("VS CPU",`<div class="cpu-briefing"><div class="mode-brief-hero"><span class="mode-overline">MANAGER DUEL</span><h3>OUTDRAFT THE MANAGER</h3><p>Equal budgets. Public information. Build the stronger squad.</p></div><form id="cpuBriefingForm"><fieldset class="cpu-levels"><legend>CPU DIFFICULTY</legend>${["easy","normal","hard"].map((level,i)=>`<label><input type="radio" name="managerLevel" value="${level}" ${i===1?"checked":""}><strong>${esc(replayText(level.toUpperCase()))}</strong><span>${esc(replayText(["A star-first manager who can overlook squad balance.","Balances starting roles, value and chemistry.","Plans formations, protects future contracts and rejects marginal upgrades."][i]))}</span></label>`).join("")}</fieldset><div class="cpu-start-fields"><label>BUDGET<input id="cpuStartBudget" type="number" min="1000" max="1000000" step="50" value="10000" required></label><label>PLAYERS<select id="cpuStartSize"><option value="8">8</option><option value="11" selected>11</option><option value="15">15</option></select></label></div><button type="submit" class="primary-button">CHALLENGE CPU</button></form></div>`);modal.classList.add("mode-dialog");
    modal.querySelector("form").onsubmit=event=>{event.preventDefault();const difficulty=modal.querySelector('[name="managerLevel"]:checked').value,budget=Number(modal.querySelector("#cpuStartBudget").value),size=Number(modal.querySelector("#cpuStartSize").value);if(!Number.isInteger(budget)||budget%50||budget<size*50){replayError(new Error("Enter a budget in valid bid intervals."));return;}startSingleplayer({difficulty,budget,size});};
}
function startSingleplayer(options={}){
    function start(){closeReplayDialog();clearSavedGame();try{sessionStorage.removeItem(CHALLENGE_SETUP_KEY);}catch{}setupDraftChallenge=null;lockChallengeSetupControls();document.getElementById("team2CpuControlled").checked=true;document.getElementById("cpuDifficulty").value=options.difficulty||"normal";document.getElementById("team2Name").value="CPU";document.getElementById("budget").value=options.budget||10000;document.getElementById("maxPlayers").value=options.size||11;document.getElementById("bidIncrement").value=50;
        playerPoolCategoryState=Object.fromEntries(Object.keys(PLAYER_POOL_CATEGORIES).map(key=>[key,true]));playerPoolManualOverrides={};recomputeSelectedPlayersFromCategories();renderPlayerPool();startGame();}
    if(loadSavedData()?.gameActive){closeReplayDialog();showConfirm("START A NEW AUCTION","A saved auction already exists. Starting a new setup will discard that unfinished auction.",start);}else start();
}
function openChallengesMenu(){const modal=replayDialog("CHALLENGES",`<div class="challenges-menu"><button type="button" data-daily-draft><span aria-hidden="true">◈</span><strong>DAILY EGO DRAFT</strong><small>Pick one player each round and chase today's high score.</small></button><button type="button" data-draft-challenges><span aria-hidden="true">◎</span><strong>DRAFT CHALLENGES</strong><small>Solve handcrafted squad-building missions.</small></button></div>`);modal.classList.add("mode-dialog");}
function modeHudMarkup(){
    if(!activeDraftChallenge)return team2CpuControlled?`<div class="manager-hud"><b>VS CPU</b><span>${esc(replayText(cpuDifficulty.toUpperCase()))}</span><span>${esc(replayText("Equal budgets. Public information. Build the stronger squad."))}</span></div>`:"";
    const rule=activeDraftChallenge,result=modeScore(rule,1,true),passed=result.goals.filter(g=>g.pass).length,wasOpen=auctionContent.querySelector(".mode-live-hud")?.open;
    const previous=auctionContent.querySelector(".mode-live-hud");if(previous&&uiState.phase==="market"&&passed>Number(previous.dataset.passed))playSfx("confirm");
    return `<details data-passed="${passed}" class="mode-live-hud mode-theme-${rule.theme||"balanced"}" ${wasOpen?"open":""}><summary><span class="mode-hud-title"><small>${esc(replayText(rule.id==="daily"?"DAILY EGO DRAFT":"DRAFT CHALLENGES"))}${rule.date?" · "+esc(rule.date):""}</small><strong>${esc(replayText(rule.title))}</strong></span><span class="mode-hud-progress">${passed}/${result.goals.length} <span>OBJECTIVES</span></span><span class="mode-hud-budget">$${team1.budget.toLocaleString(SiteI18n.language)}</span></summary><ul>${result.goals.map(g=>`<li class="${g.pass?"objective-met":""}"><span aria-hidden="true">${g.pass?"✓":"○"}</span><span>${esc(replayText(g.label))}</span><b>${g.current} / ${g.target}</b></li>`).join("")}</ul><p>Lineup and chemistry figures are provisional until squad review.</p></details>`;
}
function updateModeHud(){configureModeAuctionHeader();const previous=auctionContent.querySelector(".mode-live-hud,.manager-hud");if(previous)previous.outerHTML=modeHudMarkup();}
function challengeStatusMarkup(){return "";}
function modeResultsMarkup(){
    if(!activeDraftChallenge)return team2CpuControlled?cpuResultsMarkup():"";
    const rule=activeDraftChallenge,result=modeScore(rule),previous=modeBest(rule),persisted=recordModeResult(rule,result),best=modeBest(rule)||previous;
    return `<section class="mission-result mode-theme-${rule.theme||"balanced"}"><div class="mission-result-heading"><div><span>${esc(replayText(rule.id==="daily"?"DAILY EGO DRAFT":"DRAFT CHALLENGES"))}${rule.date?" · "+esc(rule.date):""}</span><h3>${esc(replayText(rule.title))}</h3><b>${esc(replayText(result.complete?"CHALLENGE COMPLETE":"MISSION FAILED"))}</b></div><div class="mode-grade" data-i18n-ignore>${result.grade}</div></div><div class="mode-score-heading"><div><span>FINAL SCORE</span><strong data-mode-score="${result.score}">${result.score.toLocaleString(SiteI18n.language)}</strong><b>${esc(replayText(result.gradeLabel))}</b></div><div><span>PERSONAL BEST</span><strong>${(best?.score||result.score).toLocaleString(SiteI18n.language)}</strong><small>${best?.grade||result.grade}</small></div></div><div class="mode-score-details"><dl>${result.components.map(c=>`<div><dt>${esc(replayText(c.label))}</dt><dd>${c.value>0?"+":""}${c.value.toLocaleString(SiteI18n.language)}</dd></div>`).join("")}</dl><ul>${result.goals.map(g=>`<li class="${g.pass?"objective-met":""}"><span aria-hidden="true">${g.pass?"✓":"○"}</span><span>${esc(replayText(g.label))}</span><b>${g.current} / ${g.target}</b></li>`).join("")}</ul></div><div class="mode-result-actions"><button type="button" data-mode-replay>REPLAY MISSION</button><button type="button" data-draft-challenges>MISSION SELECT</button><span>Review your lineup in Team Builder to improve the result.</span></div>${persisted?"":"<p role=\"status\">Your result could not be saved locally.</p>"}</section>`;
}
function animateModeResult(){
    const output=auctionContent.querySelector("[data-mode-score]");if(!output||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
    const target=Number(output.dataset.modeScore);let start=null;
    requestAnimationFrame(function count(now){if(!output.isConnected)return;if(start===null)start=now;const progress=Math.min(1,(now-start)/280);output.textContent=Math.round(target*(1-Math.pow(1-progress,3))).toLocaleString(SiteI18n.language);if(progress<1)requestAnimationFrame(count);});
}
function cpuResultsMarkup(){
    const metrics=[1,2].map(n=>{const team=teamByNumber(n),profile=resultSquadContribution(team,n);return {base:profile.baseQuality,effective:profile.effectiveQuality,fit:profile.members.filter(m=>canonicalFit(m.player,m.label)).length,chemistry:profile.chemistry.overall,strength:profile.effectiveRaw-Math.max(0,Math.min(11,maxPlayers)-profile.deployed)*2};}),labels={base:"BASE QUALITY",effective:"EFFECTIVE OVR",fit:"POSITIONAL FIT",chemistry:"CHEMISTRY"};
    const difference=metrics[0].strength-metrics[1].strength,edge=Math.abs(difference)<.5?0:difference;

    return `<section class="cpu-verdict"><div><span>${esc(replayText("VS CPU"))} · ${esc(replayText(cpuDifficulty.toUpperCase()))}</span><h3>DRAFT VERDICT</h3><strong>${esc(replayText(edge>0?"YOUR SQUAD HAS THE EDGE":edge<0?"CPU SQUAD HAS THE EDGE":"BALANCED DRAFT"))}</strong></div><div class="cpu-verdict-grid">${Object.entries(labels).map(([key,label])=>`<div><span>${esc(replayText(label))}</span><b>${metrics[0][key]}</b><em aria-hidden="true">/</em><b>${metrics[1][key]}</b></div>`).join("")}</div><p>Draft comparison only. No match has been simulated.</p></section>`;
}
function resultTeamActions(n){if(!teamByNumber(n)?.players.length)return "";const squad=replaySquadFromTeam(n),code=exportSquadCode(squad),saved=readSquadLibrary().items.some(item=>{try{return exportSquadCode(item.squad)===code;}catch{return false;}});return `<details class="result-team-actions"><summary>TEAM ACTIONS <span aria-hidden="true">⌄</span></summary><div><button type="button" data-replay-save="${n}" ${saved?"disabled":""}>${saved?"SAVED":"SAVE SQUAD"}</button>${n?`<button type="button" data-replay-build="${n}">BUILD FROM TEAM</button>`:""}<button type="button" data-replay-export="${n}">SQUAD CODE</button><button type="button" data-replay-copy="${n}">Copy code</button></div></details>`;}
function renderPlayModeHub(home){
    const daily=dailyPickRule(),best=soloRecords()["daily:"+daily.date];home.classList.add("home-mode-utilities");home.insertAdjacentHTML("beforebegin",`<div id="replayDiscovery" class="play-mode-hub"><button type="button" class="play-mode-card mode-classic" data-mode-classic><span class="mode-card-symbol" aria-hidden="true">⇄</span><span class="mode-overline">AUCTION</span><strong>THE ORIGINAL DUEL</strong><p>Two managers. One market. Every bid is yours.</p><b>CLASSIC MULTIPLAYER <span aria-hidden="true">↗</span></b></button><button type="button" class="play-mode-card mode-cpu" data-singleplayer><span class="mode-card-symbol" aria-hidden="true">⌘</span><span class="mode-overline">VS CPU</span><strong>OUTDRAFT THE MANAGER</strong><p>Face a manager who plans formations and protects the squad budget.</p><b>${["EASY","NORMAL","HARD"].map(value=>replayText(value)).join(" · ")} <span aria-hidden="true">↗</span></b></button><button type="button" class="play-mode-card mode-daily" data-daily-draft><span class="mode-card-symbol" aria-hidden="true">◈</span><span class="mode-overline">DAILY EGO DRAFT · ${esc(daily.date)}</span><strong>${esc(replayText(daily.title))}</strong><p>Pick one player each round and chase today's high score.</p><b>${best?esc(replayText("PERSONAL BEST"))+" · "+best.grade+" / "+best.score.toLocaleString(SiteI18n.language):esc(replayText("TODAY'S MISSION"))} <span aria-hidden="true">↗</span></b></button><button type="button" class="play-mode-card mode-mission" data-draft-challenges><span class="mode-card-symbol" aria-hidden="true">◎</span><span class="mode-overline">DRAFT CHALLENGES</span><strong>CHOOSE YOUR MISSION</strong><p>Solve handcrafted squad-building missions.</p><b>${esc(replayText("{count} MISSIONS",{count:puzzleMissions().length}))} <span aria-hidden="true">↗</span></b></button></div>`);home.insertAdjacentHTML("afterend",`<div class="mode-library-links"><button type="button" data-saved-squads>SAVED SQUADS</button><button type="button" data-replay-import>IMPORT SQUAD</button></div>`);
}
function initReplayabilityUI(){
    const home=document.querySelector(".home-modes");if(home&&!document.getElementById("replayDiscovery"))renderPlayModeHub(home);
    document.getElementById("team2CpuControlled")?.addEventListener("change",()=>{document.getElementById("cpuDifficultyField").hidden=!document.getElementById("team2CpuControlled").checked;saveSetupPreferences();});document.getElementById("cpuDifficulty")?.addEventListener("change",saveSetupPreferences);
    if(getRouteFromLocation()==="auctionSetup")applyReplaySetup();
    const url=new URL(window.location.href),requested=url.searchParams.get("challenge");if(getRouteFromLocation()==="menu"&&["daily","draft","all","cpu"].includes(requested)){url.searchParams.delete("challenge");history.replaceState(history.state,"",url.href);if(requested==="daily")openDraftChallenges(true);else if(requested==="draft")openDraftChallenges();else if(requested==="cpu")openCpuBriefing();else openChallengesMenu();}
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
        else if(button.matches("[data-singleplayer]"))openCpuBriefing();
        else if(button.matches("[data-mode-classic]")){setupDraftChallenge=null;try{sessionStorage.removeItem(CHALLENGE_SETUP_KEY);sessionStorage.removeItem("bldSingleplayerEntryV1");}catch{}document.getElementById("team2CpuControlled").checked=false;lockChallengeSetupControls();saveSetupPreferences();openSetupFromMenu();}
        else if(button.matches("[data-mode-replay]"))openModeBriefing(activeDraftChallenge);
        else if(button.matches("[data-replay-copy]")){const code=exportSquadCode(replaySquadFromTeam(Number(button.dataset.replayCopy)));if(!navigator.clipboard?.writeText){showReplayCode(code,"SQUAD CODE");return;}navigator.clipboard.writeText(code).then(()=>{button.textContent=replayText("COPIED ✓");setTimeout(()=>{if(button.isConnected)button.textContent=replayText("Copy code");},1800);}).catch(()=>showReplayCode(code,"SQUAD CODE"));}
        else if(button.matches("[data-daily-draft]"))openDraftChallenges(true);
        else if(button.matches("[data-draft-challenges]"))openDraftChallenges(false);
        else if(button.matches("[data-leave-challenge]")){setupDraftChallenge=null;try{sessionStorage.removeItem(CHALLENGE_SETUP_KEY);}catch{}applyReplaySetup();}
    }catch(error){replayError(error);}
});

function configureModeAuctionHeader(){
    if(uiState.phase==="complete")return;
    const title=document.getElementById("auctionHeaderTitle");if(!title)return;
    document.getElementById("playersRemaining").hidden=false;
    const actions=auctionScreen.querySelector(".auction-context-actions");if(actions)actions.hidden=false;
    if(activeDraftChallenge){title.textContent=replayText(activeDraftChallenge.id==="daily"?"DAILY MARKET":"MISSION MARKET");setMobilePageContext(activeDraftChallenge.id==="daily"?"DAILY EGO DRAFT":"CHALLENGES");}
    else if(team2CpuControlled){title.textContent=replayText("MANAGER DUEL");setMobilePageContext("VS CPU");}
}
