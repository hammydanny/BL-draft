// BLUE LOCK DRAFT // AUCTION LOGIC
// Split from the former root script.js. Classic scripts share the same global scope.

function getValidatedSetup(){
    const n1=document.getElementById("team1Name").value.trim();
    const n2=document.getElementById("team2Name").value.trim();
    const budget=Number(document.getElementById("budget").value);
    const setupBidIncrement=Number(document.getElementById("bidIncrement").value);
    const setupMaxPlayers=Number(document.getElementById("maxPlayers").value);

    if(!n1||!n2) return showSiteError("Please enter names for both teams.","SETUP INCOMPLETE");
    if(budget<=0) return showSiteError("Starting budget must be greater than $0.","INVALID BUDGET");
    if(setupBidIncrement<=0) return showSiteError("Bid interval must be greater than $0.","INVALID BID INTERVAL");
    if(setupMaxPlayers<=0) return showSiteError("Maximum players must be greater than 0.","INVALID TEAM SIZE");

    const selectedPlayers=players.filter(player => selectedPlayerIds.has(player.id));
    const requiredPlayers=setupMaxPlayers*2;
    if(selectedPlayers.length===0) return showSiteError("Select at least one player for the auction.","PLAYER POOL EMPTY");
    if(selectedPlayers.length<requiredPlayers) return showSiteError(`You need at least ${requiredPlayers} selected players to fill two teams of ${setupMaxPlayers}. Select more players or lower the maximum players per team.`,"NOT ENOUGH PLAYERS");
    return {n1,n2,budget,bidIncrement:setupBidIncrement,maxPlayers:setupMaxPlayers,selectedPlayers};
}

function resetDraftState(setup){
    formationInitialized=false;formationAssignments={1:{},2:{}};formationByTeam={1:"4-3-3",2:"4-3-3"};formationCaptainByTeam={1:null,2:null};
    bidIncrement=setup.bidIncrement;maxPlayers=setup.maxPlayers;startingBudget=setup.budget;
    team1={name:setup.n1,color:document.getElementById("team1Color").value,budget:setup.budget,players:[]};
    team2={name:setup.n2,color:document.getElementById("team2Color").value,budget:setup.budget,players:[]};
    remainingPlayers=[...setup.selectedPlayers];auctionHistory=[];auctionNumber=0;
    currentPlayer=null;currentBid=0;currentBidder=null;
    auctionUndoStack=[];auctionRedoStack=[];auctionHistoryRestoring=false;
    updateAuctionUndoRedoControls?.();
}

function auctionSnapshot(){
    return {
        team1:{name:team1.name,color:team1.color,budget:team1.budget,playerIds:team1.players.map(p=>p.id)},
        team2:{name:team2.name,color:team2.color,budget:team2.budget,playerIds:team2.players.map(p=>p.id)},
        remainingPlayerIds:remainingPlayers.map(p=>p.id),
        currentPlayerId:currentPlayer?.id??null,
        currentBid,currentBidder,startingTeam,auctionNumber,draftMode,
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
    const byId=id=>players.find(p=>p.id===id)||null;
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
    hideOverlay();
    menuScreen.classList.add("hidden");
    setupScreen.classList.add("hidden");
    formationScreen.classList.add("hidden");
    auctionScreen.classList.remove("hidden");
    hydrateAuctionSnapshot(snapshot);
    updatePlayersRemaining();
    saveGame();
    resumeCurrentView();
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
    const t=teamByNumber(startingTeam);
    showOverlay(`
      <div class="overlay-kicker">OPENING PRIORITY // RANDOMIZED</div>
      <div class="coin" style="${teamVars(t)}"><span>BL</span></div>
      <div class="overlay-eyebrow">FIRST BID CONTROL</div>
      <h2 style="${teamVars(t)};color:var(--team)">${esc(t.name)}</h2>
      <p>WON THE INITIAL DRAW</p>`);
    setTimeout(()=>hideOverlay(startNextAuction),1800);
}

function startNextAuction(){
    uiState={screen:"auction",phase:"next",turn:null};
    if(remainingPlayers.length===0 || (isTeamFull(1) && isTeamFull(2))){
        showAuctionComplete(); return;
    }
    const i=Math.floor(Math.random()*remainingPlayers.length);
    currentPlayer=remainingPlayers.splice(i,1)[0];
    currentBid=0; currentBidder=null; auctionNumber++;
    updatePlayersRemaining();
    saveGame();

    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){ showForcedAssignment(forcedTeam); return; }

    showPlayerReveal();
}

function showForcedAssignment(teamNumber,resuming=false){
    uiState={screen:"auction",phase:"forced",turn:teamNumber};saveGame();
    const team=teamByNumber(teamNumber);
    const fullTeam=teamByNumber(otherTeamNumber(teamNumber));
    showOverlay(`
      <div class="overlay-kicker">ROSTER CAPACITY PROTOCOL // ${String(auctionNumber).padStart(2,"0")}</div>
      <div class="reveal-image"><img data-player-image src="${playerImageUrl(currentPlayer)}" alt="${esc(currentPlayer.name)}" loading="eager" fetchpriority="high" decoding="async" width="150" height="170"></div>
      <div class="overlay-eyebrow">AUTOMATIC ASSIGNMENT</div>
      <h2>${esc(currentPlayer.name)}</h2>
      <p><strong style="${teamVars(fullTeam)};color:var(--team-heading,var(--team))">${esc(fullTeam.name)}</strong> HAS FILLED ITS ROSTER</p>
      <div class="forced-destination" style="${teamVars(team)}">ASSIGNED TO <strong>${esc(team.name)}</strong></div>`);
    const delay=resuming?500:1500;
    setTimeout(()=>hideOverlay(()=>{
        if(currentPlayer && !isTeamFull(teamNumber)) awardPlayerFree(teamNumber,true);
        else if(isTeamFull(1)&&isTeamFull(2)) showAuctionComplete();
    }),delay);
}

function awardPlayerFree(teamNumber,forced=false){
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
      <div class="reveal-image"><img data-player-image src="${playerImageUrl(currentPlayer)}" alt="${esc(currentPlayer.name)}" loading="eager" fetchpriority="high" decoding="async" width="150" height="170"></div>
      <div class="overlay-eyebrow">PLAYER SELECTED</div>
      <h2>${esc(currentPlayer.name)}</h2>
      <div class="auction-number">AUCTION // ${String(auctionNumber).padStart(2,"0")}</div>`);
    setTimeout(()=>hideOverlay(displayOpeningBid),1500);
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
    if(bid<=minimum){showSiteError(minimum===0?"Please enter a valid bid.":`Your bid must be higher than $${minimum.toLocaleString()}.`,"BID REJECTED");return false;}
    if(bid%bidIncrement!==0){showSiteError(`Bids must be in intervals of $${bidIncrement}.`,"INVALID BID INTERVAL");return false;}
    if(bid>team.budget){showSiteError(`${team.name} only has $${team.budget.toLocaleString()} remaining.`,"INSUFFICIENT BUDGET");return false;}
    if(team.players.length>=maxPlayers){showSiteError(`${team.name}'s roster is full.`,"ROSTER FULL");return false;}
    return true;
}

function passBid(){recordAuctionUndoPoint("PASS / SOLD");playSfx("pass");awardPlayer(currentBidder);}

function awardPlayer(n){
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

