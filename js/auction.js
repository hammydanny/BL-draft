// Only one pending cinematic transition may own the current auction state.
let auctionTransitionTimer=null,auctionTransitionEpoch=0;
function cancelAuctionTransition(){clearTimeout(auctionTransitionTimer);auctionTransitionTimer=null;auctionTransitionEpoch++;}
function scheduleAuctionTransition(callback,delay){
    cancelAuctionTransition();
    const epoch=auctionTransitionEpoch;
    auctionTransitionTimer=setTimeout(()=>{if(epoch!==auctionTransitionEpoch)return;auctionTransitionTimer=null;callback();},delay);
}

// BLUE LOCK DRAFT // AUCTION LOGIC
// Split from the former root script.js. Classic scripts share the same global scope.

function getValidatedSetup(){
    const n1=document.getElementById("team1Name").value.trim();
    const n2=document.getElementById("team2Name").value.trim();
    const budget=Number(document.getElementById("budget").value);
    const setupBidIncrement=Number(document.getElementById("bidIncrement").value);
    const setupMaxPlayers=Number(document.getElementById("maxPlayers").value);

    if(!n1||!n2) return showSiteError("Please enter names for both teams.","SETUP INCOMPLETE");
    if(!Number.isFinite(budget)||budget<=0) return showSiteError("Starting budget must be greater than $0.","INVALID BUDGET");
    if(!Number.isFinite(setupBidIncrement)||setupBidIncrement<=0) return showSiteError("Bid interval must be greater than $0.","INVALID BID INTERVAL");
    if(!Number.isInteger(setupMaxPlayers)||setupMaxPlayers<=0) return showSiteError("Maximum players must be greater than 0.","INVALID TEAM SIZE");

    const selectedPlayers=players.filter(player => secretPlayerAvailable(player)&&selectedPlayerIds.has(player.id));
    const requiredPlayers=setupMaxPlayers*2;
    if(selectedPlayers.length===0) return showSiteError("Select at least one player for the auction.","PLAYER POOL EMPTY");
    if(selectedPlayers.length<requiredPlayers) return showSiteError(`You need at least ${requiredPlayers} selected players to fill two teams of ${setupMaxPlayers}. Select more players or lower the maximum players per team.`,"NOT ENOUGH PLAYERS");
    return {n1,n2,budget,bidIncrement:setupBidIncrement,maxPlayers:setupMaxPlayers,team2CpuControlled:document.getElementById("team2CpuControlled").checked,selectedPlayers};
}

function resetDraftState(setup){
    cancelAuctionTransition();
    formationInitialized=false;formationAssignments={1:{},2:{}};formationByTeam={1:"4-3-3",2:"4-3-3"};formationCaptainByTeam={1:null,2:null};
    bidIncrement=setup.bidIncrement;maxPlayers=setup.maxPlayers;startingBudget=setup.budget;team2CpuControlled=!!setup.team2CpuControlled;
    team1={name:setup.n1,color:document.getElementById("team1Color").value,budget:setup.budget,players:[]};
    team2={name:setup.n2,color:document.getElementById("team2Color").value,budget:setup.budget,players:[]};
    remainingPlayers=shufflePlayers(setup.selectedPlayers);auctionHistory=[];auctionNumber=0;
    currentPlayer=null;currentBid=0;currentBidder=null;
    auctionUndoStack=[];auctionRedoStack=[];auctionHistoryRestoring=false;
    updateAuctionUndoRedoControls?.();
}


const CPU_POSITION_GROUPS={
    GK:["GK"],
    DEF:["CB","LB","RB","LWB","RWB"],
    MID:["CDM","CM","CAM","AM","LM","RM"],
    ATT:["CF","ST","SS","LW","RW"]
};
function cpuRoleGroup(position){
    const value=String(position||"").trim().toUpperCase();
    return Object.keys(CPU_POSITION_GROUPS).find(group=>CPU_POSITION_GROUPS[group].includes(value))||null;
}
function cpuPlayerRoles(player){
    return [...new Set([player?.primaryPosition,...(player?.positions||[])].map(cpuRoleGroup).filter(Boolean))];
}
function cpuRoleTargets(){
    const goalkeeper=Math.max(0,Math.round(maxPlayers*.08));
    const defender=Math.round(maxPlayers*.28);
    const midfielder=Math.round(maxPlayers*.27);
    const attacker=Math.max(1,maxPlayers-goalkeeper-defender-midfielder);
    return {GK:goalkeeper,DEF:defender,MID:midfielder,ATT:attacker};
}
function cpuPositionFit(player,team){
    const counts={GK:0,DEF:0,MID:0,ATT:0};
    team.players.forEach(member=>{
        const role=cpuRoleGroup(member?.primaryPosition||(member?.positions||[])[0]);
        if(role)counts[role]++;
    });
    const roles=cpuPlayerRoles(player);
    if(!roles.length)return 0;
    const targets=cpuRoleTargets();
    let best=-12;
    roles.forEach(role=>{
        const target=Math.max(1,targets[role]||1),gap=target-counts[role];
        const fit=gap>0?2+Math.min(8,gap/target*8):-4-Math.min(8,(counts[role]-target)*2);
        best=Math.max(best,fit);
    });
    if(roles.filter(role=>targets[role]>counts[role]).length>1)best+=1.25;
    return Math.max(-12,Math.min(11,best));
}
function cpuChemistryFit(player,team){
    if(!team.players.length||typeof playerChemistry!=="function")return 0;
    const values=team.players.map(member=>Number(playerChemistry(player,member))).filter(Number.isFinite);
    if(!values.length)return 0;
    const average=values.reduce((sum,value)=>sum+value,0)/values.length;
    const strongest=Math.max(...values);
    const fit=(average-75)*.3+(strongest>=90?1.5:strongest<65?-1.5:0);
    return Math.max(-8,Math.min(8,fit));
}
function evaluateCpuTarget(team=team2){
    if(!currentPlayer)return {rating:0,positionFit:0,chemistryFit:0,score:0};
    const rawRating=typeof playerOverall==="function"?Number(playerOverall(currentPlayer)):Number(currentPlayer.stats?.ovr);
    const rating=Number.isFinite(rawRating)?rawRating:(Number(currentPlayer.stats?.ovr)||50);
    const positionFit=cpuPositionFit(currentPlayer,team);
    const chemistryFit=cpuChemistryFit(currentPlayer,team);
    const score=Math.max(40,Math.min(100,rating+positionFit+chemistryFit));
    return {rating,positionFit,chemistryFit,score};
}
function cpuMaximumBid(team,evaluation){
    const slots=Math.max(1,maxPlayers-team.players.length);
    const reserve=Math.max(0,(slots-1)*bidIncrement);
    const affordable=Math.max(0,team.budget-reserve);
    const averageBudget=team.budget/slots;
    const playerValue=averageBudget*(.2+evaluation.score/50);
    const purseLimit=team.budget*(slots<=2?.85:.42);
    const limit=Math.min(affordable,playerValue,purseLimit);
    return Math.floor((limit+1e-7)/bidIncrement)*bidIncrement;
}
function cpuOpeningBid(team,evaluation){
    const step=bidIncrement;
    if(team.budget<step)return 0;
    const slots=Math.max(1,maxPlayers-team.players.length);
    const averageBudget=team.budget/slots;
    const maximum=Math.max(step,cpuMaximumBid(team,evaluation));
    const proposed=Math.floor((averageBudget*(.1+evaluation.score/450)+1e-7)/step)*step;
    return Math.min(maximum,Math.max(step,proposed));
}
function cpuValuesTarget(evaluation){
    return evaluation.score>=68||evaluation.positionFit>=7||evaluation.chemistryFit>=6;
}
function cpuChooseBid(team,current=0,opening=false,evaluation=evaluateCpuTarget(team)){
    if(opening)return cpuOpeningBid(team,evaluation);
    if(!cpuValuesTarget(evaluation))return null;
    const next=current+bidIncrement;
    return next<=cpuMaximumBid(team,evaluation)?next:null;
}
function showCpuThinking(){
    renderAuctionScreen(`
      ${turnIndicator("CPU EVALUATING",team2)}
      <div class="bid-panel" style="${teamVars(team2)}">
        <div class="panel-code">POSITION / CHEMISTRY / BUDGET ANALYSIS</div>
      </div>`);
    SiteI18n.apply?.(auctionContent);
}
function performCpuOpeningBid(){
    if(!team2CpuControlled||startingTeam!==2||!currentPlayer||uiState.phase!=="opening")return;
    const evaluation=evaluateCpuTarget(team2);
    const bid=cpuChooseBid(team2,0,true,evaluation);
    if(!bid){displayZeroBudgetChoice(1);return;}
    recordAuctionUndoPoint("OPENING BID");
    currentBid=bid;currentBidder=2;
    playSfx("bid");triggerFx("bid");
    displayBiddingTurn(1);
}
function performCpuResponse(){
    if(!team2CpuControlled||uiState.phase!=="bidding"||uiState.turn!==2||!currentPlayer)return;
    const bid=cpuChooseBid(team2,currentBid,false);
    if(bid===null){passBid();return;}
    recordAuctionUndoPoint("BID");
    const previousBidder=currentBidder;
    currentBid=bid;currentBidder=2;
    playSfx(previousBidder&&previousBidder!==2?"outbid":"bid");triggerFx("bid");
    displayBiddingTurn(1);
}
function resolveCpuZeroBudgetChoice(){
    if(!team2CpuControlled||uiState.phase!=="zero"||uiState.turn!==2||!currentPlayer)return;
    const evaluation=evaluateCpuTarget(team2);
    const bid=cpuChooseBid(team2,0,true,evaluation);
    if(bid>=bidIncrement&&(evaluation.score>=74||evaluation.positionFit>=7||evaluation.chemistryFit>=7)){
        currentBid=bid;currentBidder=2;
        playSfx("bid");triggerFx("bid");
        awardPlayer(2);
    }else{
        currentBid=0;currentBidder=1;
        playSfx("pass");
        awardPlayer(1);
    }
}

function auctionSnapshot(){
    return {
        team1:{name:team1.name,color:team1.color,budget:team1.budget,playerIds:team1.players.map(p=>p.id)},
        team2:{name:team2.name,color:team2.color,budget:team2.budget,playerIds:team2.players.map(p=>p.id)},
        remainingPlayerIds:remainingPlayers.map(p=>p.id),
        currentPlayerId:currentPlayer?.id??null,
        currentBid,currentBidder,startingTeam,auctionNumber,draftMode,team2CpuControlled,
        auctionHistory:auctionHistory.map(x=>({
            auction:x.auction,playerId:x.player?.id??x.playerId,teamNumber:x.teamNumber,
            teamName:x.teamName,teamColor:x.teamColor,price:x.price,
            automatic:!!x.automatic,randomDraft:!!x.randomDraft
        })),
        uiState:{...uiState}
    };
}
function hydrateAuctionSnapshot(snapshot){
    if(!snapshot)return false;
    const byId=id=>playerById(Number(id))||null;
    team1={
        name:snapshot.team1?.name||team1.name,color:snapshot.team1?.color||team1.color,
        budget:Number(snapshot.team1?.budget??team1.budget),
        players:(snapshot.team1?.playerIds||[]).map(byId).filter(Boolean)
    };
    team2={
        name:snapshot.team2?.name||team2.name,color:snapshot.team2?.color||team2.color,
        budget:Number(snapshot.team2?.budget??team2.budget),
        players:(snapshot.team2?.playerIds||[]).map(byId).filter(Boolean)
    };
    remainingPlayers=(snapshot.remainingPlayerIds||[]).map(byId).filter(Boolean);
    currentPlayer=byId(snapshot.currentPlayerId);
    currentBid=Number(snapshot.currentBid||0);
    currentBidder=snapshot.currentBidder??null;
    startingTeam=snapshot.startingTeam??startingTeam;
    auctionNumber=Number(snapshot.auctionNumber||0);
    draftMode=snapshot.draftMode==="random"?"random":"auction";
    team2CpuControlled=!!snapshot.team2CpuControlled;
    auctionHistory=(snapshot.auctionHistory||[]).map(x=>{
        const player=byId(x.playerId);
        return player?{...x,player}:null;
    }).filter(Boolean);
    uiState={...(snapshot.uiState||{screen:"auction",phase:"opening",turn:null})};
    return true;
}
function updateAuctionUndoRedoControls(){
    const undo=document.getElementById("auctionUndoButton");
    const redo=document.getElementById("auctionRedoButton");
    if(undo){
        undo.disabled=!auctionUndoStack.length;
        undo.title=auctionUndoStack.length?`Undo ${auctionUndoStack[auctionUndoStack.length-1].label||"last action"}`:"Nothing to undo";
    }
    if(redo){
        redo.disabled=!auctionRedoStack.length;
        redo.title=auctionRedoStack.length?`Redo ${auctionRedoStack[auctionRedoStack.length-1].label||"last action"}`:"Nothing to redo";
    }
}
function recordAuctionUndoPoint(label){
    if(auctionHistoryRestoring||draftMode!=="auction")return;
    const snap=auctionSnapshot();
    snap.label=label||"ACTION";
    auctionUndoStack.push(snap);
    if(auctionUndoStack.length>AUCTION_UNDO_LIMIT)auctionUndoStack.shift();
    auctionRedoStack=[];
    updateAuctionUndoRedoControls();
}
function restoreAuctionSnapshot(snapshot){
    if(!snapshot)return;
    auctionHistoryRestoring=true;
    cancelAuctionTransition();
    clearTimeout(overlayHideTimer);
    gameOverlay.classList.add("hidden");
    gameOverlay.classList.remove("overlay-out");
    menuScreen.classList.add("hidden");
    setupScreen.classList.add("hidden");
    formationScreen.classList.add("hidden");
    auctionScreen.classList.remove("hidden");
    hydrateAuctionSnapshot(snapshot);
    updatePlayersRemaining();
    saveGame();
    // Rendering an undone automatic award must never award the target again.
    // Older/opening/bidding snapshots can legitimately have one full roster too.
    const forcedTeam=currentPlayer&&!auctionHistory.some(entry=>entry.player.id===currentPlayer.id)?onlyTeamWithSpace():null;
    if(uiState.phase==="forced"||forcedTeam)showForcedAssignment(forcedTeam||uiState.turn,true,true);
    else resumeCurrentView();
    auctionHistoryRestoring=false;
    updateAuctionUndoRedoControls();
}
function undoAuctionAction(){
    if(!auctionUndoStack.length)return;
    const current=auctionSnapshot();
    current.label=auctionUndoStack[auctionUndoStack.length-1]?.label||"ACTION";
    const target=auctionUndoStack.pop();
    auctionRedoStack.push(current);
    restoreAuctionSnapshot(target);
}
function redoAuctionAction(){
    if(!auctionRedoStack.length)return;
    const current=auctionSnapshot();
    current.label=auctionRedoStack[auctionRedoStack.length-1]?.label||"ACTION";
    const target=auctionRedoStack.pop();
    auctionUndoStack.push(current);
    restoreAuctionSnapshot(target);
}
function advanceToNextAuction(){
    cancelAuctionTransition();
    // An undone award still owns the current target. Next resumes that target,
    // rather than removing a second player from the queue.
    if(currentPlayer&&!auctionHistory.some(entry=>entry.player.id===currentPlayer.id)){
        if(uiState.phase==="forced")hideOverlay(()=>awardPlayerFree(uiState.turn,true));
        else resumeCurrentView();
        return;
    }
    recordAuctionUndoPoint("NEXT PLAYER");
    startNextAuction();
}

function startGame(){
    const setup=getValidatedSetup();if(!setup)return;
    resetDraftState(setup);draftMode="auction";startingTeam=Math.random()<.5?1:2;
    uiState={screen:"auction",phase:"coin",turn:null};saveGame();
    // Save once, then let the actual destination document restore the coin phase.
    if(!historyOnlyNavigation()){updateRoute("auctionRoom");return;}
    auctionContent.innerHTML="";
    gameOverlay.classList.add("hidden");
    gameOverlay.classList.remove("overlay-out");
    setVisibleScreen(auctionScreen,{skipHistory:true});
    updatePlayersRemaining();
    updateRoute("auctionRoom");
    showCoinFlip();
}

function shufflePlayers(list){
    const shuffled=[...list];
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
    return shuffled;
}

function startRandomDraft(){
    const setup=getValidatedSetup();if(!setup)return;
    resetDraftState(setup);draftMode="random";
    const shuffled=shufflePlayers(setup.selectedPlayers);
    team1.players=shuffled.slice(0,maxPlayers);team2.players=shuffled.slice(maxPlayers,maxPlayers*2);
    remainingPlayers=shuffled.slice(maxPlayers*2);
    auctionHistory=[
        ...team1.players.map((player,index)=>({auction:index+1,player,teamNumber:1,teamName:team1.name,teamColor:team1.color,price:0,randomDraft:true})),
        ...team2.players.map((player,index)=>({auction:maxPlayers+index+1,player,teamNumber:2,teamName:team2.name,teamColor:team2.color,price:0,randomDraft:true}))
    ];
    auctionNumber=auctionHistory.length;currentPlayer=null;currentBid=0;currentBidder=null;startingTeam=null;
    uiState={screen:"auction",phase:"complete",turn:null};
    saveGame();
    if(!historyOnlyNavigation()){updateRoute("auctionResults");return;}
    setVisibleScreen(auctionScreen,{skipHistory:true});
    updatePlayersRemaining();
    updateRoute("auctionResults");
    showAuctionComplete();
}

function showCoinFlip(){
    showOverlay(`
      <div class="overlay-kicker">OPENING PRIORITY // RANDOMIZED</div>
      <div class="coin-stage" aria-label="${esc(SiteI18n.text('Team coin flip'))}"><div class="coin" style="--coin-end:${startingTeam===1?'1440deg':'1620deg'}">
        <div class="coin-face coin-front" style="${teamVars(team1)}"><span>1</span></div>
        <div class="coin-face coin-back" style="${teamVars(team2)}"><span>2</span></div>
      </div></div>
      <p>DETERMINING FIRST TEAM</p>`,"coin");
    // The existing physical flip lasts 2 seconds. Announce its existing result
    // only after the coin has settled; never draw another random winner.
    scheduleAuctionTransition(showCoinResult,2200);
}
function showCoinResult(){
    const winner=teamByNumber(startingTeam);
    uiState={screen:"auction",phase:"coin-result",turn:startingTeam};saveGame();
    showOverlay(`
      <div class="overlay-kicker">COIN FLIP RESULT</div>
      <h2 class="coin-winner" data-i18n-ignore style="${teamVars(winner)};color:var(--team-heading,var(--team))">${esc(winner.name)}</h2>
      <p class="coin-first-label">GOES FIRST</p>`,"coin-result");
    scheduleAuctionTransition(()=>hideOverlay(startNextAuction),1400);
}

function startNextAuction(){
    uiState={screen:"auction",phase:"next",turn:null};
    if(remainingPlayers.length===0 || (isTeamFull(1) && isTeamFull(2))){
        showAuctionComplete(); return;
    }
    currentPlayer=remainingPlayers.shift();
    currentBid=0; currentBidder=null; auctionNumber++;
    updatePlayersRemaining();
    saveGame();

    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){ showForcedAssignment(forcedTeam); return; }

    showPlayerReveal();
}

function showForcedAssignment(teamNumber,resuming=false,hold=false){
    cancelAuctionTransition();
    uiState={screen:"auction",phase:"forced",turn:teamNumber,...(hold?{assignmentHeld:true}:{})};saveGame();
    const team=teamByNumber(teamNumber);
    const fullTeam=teamByNumber(otherTeamNumber(teamNumber));
    // Refresh the underlying target and roster counts as well as the cinematic.
    renderAuctionScreen(`<div class="forced-destination" style="${teamVars(team)}">ASSIGNED TO <strong>${esc(team.name)}</strong></div>`);
    showOverlay(`
      <div class="overlay-kicker">ROSTER CAPACITY PROTOCOL // ${String(auctionNumber).padStart(2,"0")}</div>
      <div class="reveal-image"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(currentPlayer)}" alt="${esc(currentPlayer.name)}" loading="eager" fetchpriority="high" decoding="async" width="150" height="170"></div>
      <div class="overlay-eyebrow">AUTOMATIC ASSIGNMENT</div>
      <h2>${esc(currentPlayer.name)}</h2>
      ${playerNationalityMarkup(currentPlayer)}
      <p><strong style="${teamVars(fullTeam)};color:var(--team-heading,var(--team))">${esc(fullTeam.name)}</strong> HAS FILLED ITS ROSTER</p>
      <div class="forced-destination" style="${teamVars(team)}">ASSIGNED TO <strong>${esc(team.name)}</strong></div><div class="assignment-controls"><button id="assignmentUndoButton" class="context-control" type="button" ${auctionUndoStack.length?"":"disabled"}>↶ <span>UNDO</span></button>${hold?'<button id="resumeAssignedPlayer" class="primary-button"><span>NEXT PLAYER</span><b>→</b></button>':''}</div>`,"assigned");
    document.getElementById("assignmentUndoButton").addEventListener("click",undoAuctionAction);
    if(hold){document.getElementById("resumeAssignedPlayer").addEventListener("click",advanceToNextAuction);return;}
    const delay=resuming?500:1500;
    scheduleAuctionTransition(()=>hideOverlay(()=>{
        if(currentPlayer && !isTeamFull(teamNumber)) awardPlayerFree(teamNumber,true);
        else if(isTeamFull(1)&&isTeamFull(2)) showAuctionComplete();
    }),delay);
}

function awardPlayerFree(teamNumber,forced=false){
    if(!currentPlayer||isTeamFull(teamNumber)||auctionHistory.some(entry=>entry.player.id===currentPlayer.id))return;
    recordAuctionUndoPoint(forced?"AUTO ASSIGNMENT":"FREE SIGNING");
    const winner=teamByNumber(teamNumber);
    winner.players.push(currentPlayer);
    auctionHistory.push({auction:auctionNumber,player:currentPlayer,teamNumber,teamName:winner.name,teamColor:winner.color,price:0,automatic:forced});
    startingTeam=otherTeamNumber(startingTeam);
    uiState={screen:"auction",phase:"sold",turn:teamNumber};saveGame();
    playSfx("sold");triggerFx("sold",forced?"ASSIGNED":"SOLD");
    renderAuctionScreen(`
      <div class="sold-panel" style="${teamVars(winner)}">
        <div class="sold-stamp">${forced?"ROSTER AUTO-ASSIGNMENT":"TRANSFER COMPLETE"}</div>
        <div class="sold-word">${forced?"ASSIGNED":"SOLD"}</div>
        <div class="sold-to">${forced?"ROSTER SPACE AVAILABLE":"SIGNED BY"}</div>
        <h2 style="color:var(--team-text)">${esc(winner.name)}</h2>
        <div class="winning-price">FREE</div>
        <button id="nextPlayerButton" class="primary-button team-action"><span>NEXT PLAYER</span><b>→</b></button>
      </div>`);
    document.getElementById("nextPlayerButton").addEventListener("click",advanceToNextAuction);
}

function showPlayerReveal(){
    playSfx("reveal");
    showOverlay(`
      <div class="overlay-kicker">TARGET ACQUIRED // ${String(auctionNumber).padStart(2,"0")}</div>
      <div class="reveal-image"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(currentPlayer)}" alt="${esc(currentPlayer.name)}" loading="eager" fetchpriority="high" decoding="async" width="150" height="170"></div>
      <div class="overlay-eyebrow">PLAYER SELECTED</div>
      <h2>${esc(currentPlayer.name)}</h2>
      ${playerNationalityMarkup(currentPlayer)}
      <div class="mobile-reveal-evaluation">${positionBadges(currentPlayer)}<strong>OVR ${playerOverall(currentPlayer)} <b>${playerStatGrade(playerOverall(currentPlayer))}</b></strong></div>
      <div class="auction-number">AUCTION // ${String(auctionNumber).padStart(2,"0")}</div>`);
    scheduleAuctionTransition(()=>hideOverlay(displayOpeningBid),1500);
}

function placeOpeningBid(){
    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){awardPlayerFree(forcedTeam,true);return;}
    const bid=Number(document.getElementById("openingBid").value), starter=teamByNumber(startingTeam);
    if(!validateBid(bid,starter,0)) return;
    recordAuctionUndoPoint("OPENING BID");
    currentBid=bid; currentBidder=startingTeam;
    playSfx("bid");triggerFx("bid");
    const other=startingTeam===1?2:1;
    if(teamByNumber(other).budget===0){awardPlayer(startingTeam);return;}
    displayBiddingTurn(other);
}

function placeBid(n){
    const team=teamByNumber(n), bid=Number(document.getElementById("nextBid").value);
    if(!validateBid(bid,team,currentBid)) return;
    recordAuctionUndoPoint("BID");
    const previousBidder=currentBidder;
    currentBid=bid; currentBidder=n;
    playSfx(previousBidder&&previousBidder!==n?"outbid":"bid");triggerFx("bid");
    displayBiddingTurn(n===1?2:1);
}

function validateBid(bid,team,minimum){
    if(!Number.isFinite(bid)||bid<=minimum){showSiteError(minimum===0?"Please enter a valid bid.":`Your bid must be higher than $${minimum.toLocaleString()}.`,"BID REJECTED");return false;}
    if(bid%bidIncrement!==0){showSiteError(`Bids must be in intervals of $${bidIncrement}.`,"INVALID BID INTERVAL");return false;}
    if(bid>team.budget){showSiteError(`${team.name} only has $${team.budget.toLocaleString()} remaining.`,"INSUFFICIENT BUDGET");return false;}
    if(team.players.length>=maxPlayers){showSiteError(`${team.name}'s roster is full.`,"ROSTER FULL");return false;}
    return true;
}

function passBid(){recordAuctionUndoPoint("PASS / SOLD");playSfx("pass");awardPlayer(currentBidder);}

function awardPlayer(n){
    if(!currentPlayer||auctionHistory.some(entry=>entry.player.id===currentPlayer.id))return;
    if(isTeamFull(n)){
        const other=otherTeamNumber(n);
        if(!isTeamFull(other)){awardPlayerFree(other,true);return;}
        showAuctionComplete();return;
    }
    const winner=teamByNumber(n), price=currentBid;
    winner.budget-=price; winner.players.push(currentPlayer);
    auctionHistory.push({auction:auctionNumber,player:currentPlayer,teamNumber:n,teamName:winner.name,teamColor:winner.color,price});
    startingTeam=startingTeam===1?2:1;
    uiState={screen:"auction",phase:"sold",turn:n};saveGame();
    playSfx("sold");triggerFx("sold","SOLD");
    renderAuctionScreen(`
      <div class="sold-panel" style="${teamVars(winner)}">
        <div class="sold-stamp">TRANSFER COMPLETE</div>
        <div class="sold-word">SOLD</div><div class="sold-to">SIGNED BY</div>
        <h2 style="color:var(--team-text)">${esc(winner.name)}</h2>
        <div class="winning-price">${price===0?"FREE":"$"+price.toLocaleString()}</div>
        <button id="nextPlayerButton" class="primary-button team-action"><span>NEXT PLAYER</span><b>→</b></button>
      </div>`);
    document.getElementById("nextPlayerButton").addEventListener("click",advanceToNextAuction);
}

function buyWithControl(n){
    const team=teamByNumber(n),bid=Number(document.getElementById("controlBid").value);
    if(!validateBid(bid,team,0)) return;
    recordAuctionUndoPoint("CONTROL BUY");
    currentBid=bid;currentBidder=n;playSfx("bid");triggerFx("bid");awardPlayer(n);
}

function passWithControl(n){recordAuctionUndoPoint("CONTROL PASS");playSfx("pass");const broke=n===1?2:1;currentBid=0;currentBidder=broke;awardPlayer(broke);}

