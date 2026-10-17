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
    if(typeof validateChallengeSetup==="function"&&!validateChallengeSetup({budget,bidIncrement:setupBidIncrement,maxPlayers:setupMaxPlayers,selectedPlayers,team2CpuControlled:document.getElementById("team2CpuControlled").checked,cpuDifficulty:document.getElementById("cpuDifficulty")?.value||"normal"}))return;
    return {cpuDifficulty:document.getElementById("cpuDifficulty")?.value||"normal",challenge:setupDraftChallenge,n1,n2,budget,bidIncrement:setupBidIncrement,maxPlayers:setupMaxPlayers,team2CpuControlled:document.getElementById("team2CpuControlled").checked,selectedPlayers};
}

function resetDraftState(setup){
    cancelAuctionTransition();
    formationInitialized=false;formationAssignments={1:{},2:{}};formationByTeam={1:"4-3-3",2:"4-3-3"};formationCaptainByTeam={1:null,2:null};
    bidIncrement=setup.bidIncrement;maxPlayers=setup.maxPlayers;startingBudget=setup.budget;team2CpuControlled=!!setup.team2CpuControlled;
    cpuDifficulty=normalizeCpuDifficulty(setup.cpuDifficulty);cpuPersonalitySeed=(Math.random()*0xffffffff)>>>0;cpuLastAction="";cpuBuiltRosterKey="";
    activeDraftChallenge=setup.challenge?normalizeDraftChallenge(setup.challenge):null;
    team1={name:setup.n1,color:document.getElementById("team1Color").value,budget:setup.budget,players:[]};
    team2={name:setup.n2,color:document.getElementById("team2Color").value,budget:setup.budget,players:[]};
    remainingPlayers=shufflePlayers(setup.selectedPlayers);auctionHistory=[];auctionNumber=0;
    currentPlayer=null;currentBid=0;currentBidder=null;
    auctionUndoStack=[];auctionRedoStack=[];auctionHistoryRestoring=false;
    updateAuctionUndoRedoControls?.();
}


// The same authoritative minimum is used by human inputs and CPU decisions.
function nextLegalAuctionBid(current=0){
    const step=Number(bidIncrement);return (Math.floor((Math.max(0,Number(current)||0)+1e-8)/step)+1)*step;
}
const CPU_POSITION_GROUPS={GK:["GK"],DEF:["CB","LB","RB","LWB","RWB","DF","WB"],MID:["DM","CDM","CM","CAM","AM","LM","RM","WM","MF"],ATT:["CF","ST","SS","LW","RW","FW"]};
const CPU_DIFFICULTIES=Object.freeze({
    easy:{need:.35,scarcity:.05,chemistry:.08,quality:.95,discipline:.62,variation:.35},
    normal:{need:.75,scarcity:.45,chemistry:.38,quality:.8,discipline:.84,variation:.18},
    hard:{need:1.1,scarcity:.85,chemistry:.65,quality:.75,discipline:1,variation:.12}
});
function normalizeCpuDifficulty(value){return Object.hasOwn(CPU_DIFFICULTIES,value)?value:"normal";}
function cpuRoleGroup(position){return Object.keys(CPU_POSITION_GROUPS).find(group=>CPU_POSITION_GROUPS[group].includes(String(position).toUpperCase()))||null;}
function cpuPlayerRoles(player){return player?.allPositions?Object.keys(CPU_POSITION_GROUPS):[...new Set(playerPositions(player).map(cpuRoleGroup).filter(Boolean))];}
function cpuRoleTargets(){
    const size=Math.min(11,maxPlayers),gk=size>=5?1:0,def=Math.round(size*.3),mid=Math.round(size*.28);
    return {GK:gk,DEF:def,MID:mid,ATT:Math.max(1,size-gk-def-mid)};
}
function cpuPublicAlternatives(){
    // Public pool membership and already-signed players only. Never read the hidden queue.
    const signed=new Set([...team1.players,...team2.players].map(p=>p.id));
    return players.filter(p=>selectedPlayerIds.has(p.id)&&!signed.has(p.id)&&p.id!==currentPlayer?.id&&secretPlayerAvailable(p));
}
function cpuVariation(salt){
    let hash=(cpuPersonalitySeed||1)>>>0;
    for(const c of String(salt))hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
    return hash/4294967296;
}
function cpuFormationCoverage(roster){
    let best=0;
    for(const shape of Object.values(FORMATIONS)){
        const used=new Set();let score=0;
        // Scarce slots first so a flexible forward does not displace the only keeper.
        const slots=shape.map(slot=>({slot,options:roster.filter(p=>canonicalFit(p,slot.label))})).sort((a,b)=>a.options.length-b.options.length);
        for(const {slot,options} of slots){
            const p=options.filter(p=>!used.has(p.id)).sort((a,b)=>effectiveOVR(b,slot.label)-effectiveOVR(a,slot.label))[0];
            if(p){used.add(p.id);score+=1+effectiveOVR(p,slot.label)/100;}
        }
        best=Math.max(best,score);
    }return best;
}
function cpuPositionFit(player,team){
    const targets=cpuRoleTargets(),counts={GK:0,DEF:0,MID:0,ATT:0};
    for(const p of team.players){const role=cpuRoleGroup(primaryPosition(p));if(role)counts[role]++;}
    return Math.max(...cpuPlayerRoles(player).map(role=>targets[role]>counts[role]?6+6*(targets[role]-counts[role])/Math.max(1,targets[role]):-4-3*(counts[role]-targets[role])),0);
}
function cpuChemistryFit(player,team){
    const links=team.players.map(p=>playerChemistry(player,p)).sort((a,b)=>b-a).slice(0,4);
    return links.length?Math.max(-8,Math.min(10,(links.reduce((a,b)=>a+b,0)/links.length-72)*.4)):0;
}
function evaluateCpuTarget(team=team2){
    if(!currentPlayer)return {rating:0,positionFit:0,chemistryFit:0,score:0};
    const cfg=CPU_DIFFICULTIES[normalizeCpuDifficulty(cpuDifficulty)],rating=playerOverall(currentPlayer),roles=cpuPlayerRoles(currentPlayer),alternatives=cpuPublicAlternatives();
    const positionFit=cpuPositionFit(currentPlayer,team),chemistryFit=cpuChemistryFit(currentPlayer,team);
    const available=alternatives.filter(p=>cpuPlayerRoles(p).some(role=>roles.includes(role)));
    const stronger=available.filter(p=>playerOverall(p)>rating).length,percentile=1-stronger/Math.max(1,available.length);
    const scarcity=positionFit>0?Math.max(0,10-available.length)*1.3:0;
    const improvement=cpuDifficulty==="hard"?Math.max(0,cpuFormationCoverage([...team.players,currentPlayer])-cpuFormationCoverage(team.players)):0;
    const saturation=team.players.filter(p=>cpuPlayerRoles(p).some(role=>roles.includes(role))&&playerOverall(p)>=rating).length;
    const score=rating*cfg.quality+positionFit*cfg.need+chemistryFit*cfg.chemistry+scarcity*cfg.scarcity+improvement*3+percentile*6-saturation*(cpuDifficulty==="hard"?3:1);
    return {rating,positionFit,chemistryFit,scarcity,improvement,score,saturation,percentile};
}
function cpuMaximumBid(team,evaluation){
    const cfg=CPU_DIFFICULTIES[normalizeCpuDifficulty(cpuDifficulty)],slots=Math.max(1,maxPlayers-team.players.length);
    const reserve=(slots-1)*nextLegalAuctionBid(0),affordable=Math.max(0,team.budget-reserve),average=team.budget/slots;
    const style=.9+cpuVariation(currentPlayer?.id+":"+team.players.map(p=>p.id).join(","))*cfg.variation*2;
    const quality=Math.max(.18,(evaluation.score-35)/45),urgency=evaluation.positionFit>8?1.15:1;
    const limit=Math.min(affordable,average*quality*style*urgency/(cfg.discipline||1),team.budget*(slots<=2?1:.48));
    return Math.max(0,Math.floor((limit+1e-7)/bidIncrement)*bidIncrement);
}
function cpuOpeningBid(team,evaluation){
    const minimum=nextLegalAuctionBid(0),maximum=cpuMaximumBid(team,evaluation);
    if(team.budget<minimum)return 0;
    // An opener must bid or yield to the existing free-signing choice.
    if(maximum<minimum)return minimum;
    const extra=evaluation.positionFit>8&&evaluation.rating>86?Math.floor(cpuVariation("open:"+currentPlayer.id)*3):0;
    return Math.min(maximum,minimum*(1+extra));
}
function cpuValuesTarget(evaluation){return evaluation.score>=48||evaluation.positionFit>=8;}
function cpuChooseBid(team,current=0,opening=false,evaluation=evaluateCpuTarget(team)){
    if(team.players.length>=maxPlayers)return null;
    if(opening)return cpuOpeningBid(team,evaluation);
    const next=nextLegalAuctionBid(current),maximum=cpuMaximumBid(team,evaluation);
    if(next>maximum||next>team.budget||!cpuValuesTarget(evaluation))return null;
    // Willingness changes through a bidding war, rather than one mechanical fixed ceiling.
    const pressure=next/Math.max(1,maximum),bargain=next<team.budget/Math.max(1,maxPlayers-team.players.length)*.45;
    const caution=cpuDifficulty==="easy"?.03:cpuDifficulty==="hard"?.12:.08;
    const opponent=team===team2?team1:team2,opponentAverage=opponent.budget/Math.max(1,maxPlayers-opponent.players.length);
    const opponentOverpay=current>opponentAverage*1.6&&evaluation.positionFit<8;
    const fatigue=Math.max(0,pressure-.55)*caution+(evaluation.saturation>2?.08:0)+(opponentOverpay?(cpuDifficulty==="hard"?.12:cpuDifficulty==="normal"?.06:0):0);
    const interest=cpuVariation(currentPlayer.id+":"+current+":"+team.players.length);
    if(!bargain&&evaluation.positionFit<10&&interest<fatigue)return null;
    return next;
}
function showCpuThinking(){
    renderAuctionScreen(`
      ${turnIndicator("CPU EVALUATING",team2)}
      <div class="bid-panel" style="${teamVars(team2)}">
        <div class="panel-code">CPU considering…</div>
      </div>`);
    SiteI18n.apply?.(auctionContent);
}
function performCpuOpeningBid(){
    if(!team2CpuControlled||startingTeam!==2||!currentPlayer||uiState.phase!=="opening")return;
    const evaluation=evaluateCpuTarget(team2);
    const bid=cpuChooseBid(team2,0,true,evaluation);
    if(!bid){displayZeroBudgetChoice(1);return;}
    recordAuctionUndoPoint("OPENING BID");
    cpuLastAction=evaluation.positionFit>9?"CPU prioritising squad need":"CPU raises";
    currentBid=bid;currentBidder=2;
    playSfx("bid");triggerFx("bid");
    displayBiddingTurn(1);
}
function performCpuResponse(){
    if(!team2CpuControlled||uiState.phase!=="bidding"||uiState.turn!==2||!currentPlayer)return;
    const bid=cpuChooseBid(team2,currentBid,false);
    if(bid===null){cpuLastAction="CPU passes";passBid();return;}
    recordAuctionUndoPoint("BID");
    const previousBidder=currentBidder;
    cpuLastAction=evaluateCpuTarget(team2).positionFit>9?"CPU prioritising squad need":"CPU raises";
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
        currentBid,currentBidder,startingTeam,auctionNumber,draftMode,team2CpuControlled,cpuDifficulty,cpuPersonalitySeed,activeDraftChallenge,
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
    cpuDifficulty=normalizeCpuDifficulty(snapshot.cpuDifficulty);cpuPersonalitySeed=Number.isInteger(snapshot.cpuPersonalitySeed)?snapshot.cpuPersonalitySeed:1;activeDraftChallenge=snapshot.activeDraftChallenge?normalizeDraftChallenge(snapshot.activeDraftChallenge):null;cpuLastAction="";
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
    if(setupDraftChallenge){showSiteError("Challenge setup is fixed. Restore its rules or leave the challenge.","DRAFT CHALLENGES");return;}
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
    cpuLastAction="";
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

