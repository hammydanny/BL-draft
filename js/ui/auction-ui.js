// BLUE LOCK DRAFT // AUCTION UI
// Split from the former root script.js. Classic scripts share the same global scope.

let overlayHideTimer=null;

function createPlayerCard(){
    return `<div class="current-player">
      <div class="card-index">${String(auctionNumber).padStart(2,"0")}</div>
      <div class="player-image-container"><img class="player-image" src="${currentPlayer.image}" alt="${esc(currentPlayer.name)}"></div>
      <div class="player-card-bottom">
        <div class="player-card-label">CURRENT TARGET // AUCTION ${String(auctionNumber).padStart(2,"0")}</div>
        <div class="player-card-name">${esc(currentPlayer.name)}</div>${positionBadges(currentPlayer)}${statStrip(currentPlayer)}
      </div>
    </div>`;
}

function createTeamTrackers(){
    return `<div class="team-trackers">${createTeamTracker(team1,1)}${createTeamTracker(team2,2)}</div>`;
}

function createTeamTracker(team,number){
    const isTurn=uiState.turn===number;
    const isLeader=currentBidder===number&&currentBid>0;
    const slotsLeft=Math.max(0,maxPlayers-team.players.length);
    const budgetPct=startingBudget?Math.max(0,Math.round(team.budget/startingBudget*100)):0;
    const lowBudget=budgetPct<=20&&team.budget>0;
    const full=slotsLeft===0;
    const roster=team.players.length?team.players.map(p=>`
      <div class="mini-player-card" title="${esc(p.name)} // OVR ${playerOverall(p)}">
        <img src="${p.image}" alt="${esc(p.name)}"><span><strong>${esc(p.name)}</strong><small>${primaryPosition(p)} // ${playerOverall(p)}</small></span>
      </div>`).join(""):`<div class="empty-roster">NO SIGNINGS RECORDED</div>`;
    const warnings=[];
    if(full)warnings.push("ROSTER FULL");
    else if(slotsLeft<=2)warnings.push(`${slotsLeft} SLOT${slotsLeft===1?"":"S"} LEFT`);
    if(lowBudget)warnings.push("LOW CAPITAL");
    if(team.budget===0)warnings.push("NO CAPITAL");
    return `<aside class="team-tracker side-team team-${number} ${isTurn?"is-turn":""} ${isLeader?"is-leader":""}" style="${teamVars(team)}">
      <div class="team-accent"></div>
      <div class="team-live-state">${isTurn?"● ACTIVE TURN":isLeader?"◆ LEADING BID":"SQUAD STATUS"}</div>
      <div class="team-header">
        <div><span class="team-code">SQUAD // 0${number}</span><h3>${esc(team.name)}</h3></div>
        <span class="roster-count">${team.players.length}/${maxPlayers}</span>
      </div>
      <div class="team-economy-grid">
        <div><span>AVAILABLE CAPITAL</span><strong>$${team.budget.toLocaleString()}</strong></div>
        <div><span>ROSTER SPACE</span><strong>${slotsLeft}</strong></div>
      </div>
      <div class="budget-bar"><i style="width:${budgetPct}%"></i></div>
      ${warnings.length?`<div class="strategy-warning">${warnings.join(" // ")}</div>`:"<div class=\"strategy-clear\">BUDGET HEALTHY // SQUAD OPEN</div>"}
      <div class="mini-roster">${roster}</div>
    </aside>`;
}

function displayOpeningBid(){
    uiState={screen:"auction",phase:"opening",turn:startingTeam};saveGame();
    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){awardPlayerFree(forcedTeam,true);return;}
    const starter=teamByNumber(startingTeam);
    if(team1.budget===0&&team2.budget===0){currentBid=0;currentBidder=startingTeam;awardPlayer(startingTeam);return;}
    if(starter.budget===0){displayZeroBudgetChoice(startingTeam===1?2:1);return;}
    renderAuctionScreen(`
      ${turnIndicator("OPENING BID",starter)}
      <div class="bid-panel" style="${teamVars(starter)}">
        <div class="panel-code">MANUAL VALUATION // OPEN</div>
        <p>Set your opening valuation for <strong>${esc(currentPlayer.name)}</strong>.</p>
        ${bidPressureRow(starter,bidIncrement)}
        ${moneyInput("openingBid",bidIncrement,bidIncrement)}
        ${createQuickBidButtons("openingBid")}
        <button id="placeOpeningBid" class="primary-button team-action"><span>LOCK OPENING BID</span><b>→</b></button>
      </div>`);
    const input=document.getElementById("openingBid");
    document.getElementById("placeOpeningBid").addEventListener("click",placeOpeningBid);
    enableEnterKey(input,placeOpeningBid); focusBidInput(input);
}

function turnIndicator(label,team){
    return `<div class="turn-indicator active-turn" style="${teamVars(team)}">
      <div class="turn-pulse"></div><span>${label}</span><strong>${esc(team.name)}</strong>
    </div>`;
}

function moneyInput(id,value,min){
    return `<div class="money-input"><span>$</span><input type="number" id="${id}" value="${value}" min="${min}" step="${bidIncrement}"></div>`;
}

function bidPressureRow(team,minBid){
    const after=Math.max(0,team.budget-minBid);
    const pct=team.budget?Math.round(minBid/team.budget*100):100;
    return `<div class="bid-pressure-row"><span>MINIMUM <b>$${minBid.toLocaleString()}</b></span><span>AFTER MIN BID <b>$${after.toLocaleString()}</b></span><span>CAP PRESSURE <b>${Math.min(999,pct)}%</b></span></div>`;
}

function createQuickBidButtons(id){
    return `<div class="quick-bids">
      <button type="button" onclick="increaseBidInput('${id}',${bidIncrement})">+$${bidIncrement.toLocaleString()}</button>
      <button type="button" onclick="increaseBidInput('${id}',${bidIncrement*5})">+$${(bidIncrement*5).toLocaleString()}</button>
      <button type="button" onclick="increaseBidInput('${id}',${bidIncrement*10})">+$${(bidIncrement*10).toLocaleString()}</button>
    </div>`;
}

function increaseBidInput(id,amount){
    const el=document.getElementById(id); if(el) el.value=(Number(el.value)||0)+amount;
}

function displayBiddingTurn(teamNumber){
    uiState={screen:"auction",phase:"bidding",turn:teamNumber};saveGame();
    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){awardPlayerFree(forcedTeam,true);return;}
    const team=teamByNumber(teamNumber);
    if(isTeamFull(teamNumber)){awardPlayer(otherTeamNumber(teamNumber));return;}
    if(team.budget===0){awardPlayer(currentBidder);return;}
    const holder=teamByNumber(currentBidder), min=currentBid+bidIncrement;
    renderAuctionScreen(`
      ${turnIndicator("YOUR TURN // BID OR PASS",team)}
      <div class="bid-panel" style="${teamVars(team)}">
        <div class="panel-code">LIVE VALUATION // ACTIVE</div>
        <div class="current-bid-label">CURRENT BID</div>
        <div class="current-bid">$${currentBid.toLocaleString()}</div>
        <div class="bid-holder">CONTROLLED BY <strong style="color:${accessibleTeamAccent(holder.color)}">${esc(holder.name)}</strong></div>
        ${bidPressureRow(team,min)}
        ${moneyInput("nextBid",min,min)}
        ${createQuickBidButtons("nextBid")}
        <button id="placeBidButton" class="primary-button team-action"><span>PLACE BID</span><b>→</b></button>
        <button id="passButton" class="pass-button">PASS // WITHDRAW</button>
      </div>`);
    const input=document.getElementById("nextBid");
    document.getElementById("placeBidButton").addEventListener("click",()=>placeBid(teamNumber));
    document.getElementById("passButton").addEventListener("click",passBid);
    enableEnterKey(input,()=>placeBid(teamNumber)); focusBidInput(input);
}

function renderSoldState(last){
    if(!last){startNextAuction();return;}
    const winner=teamByNumber(last.teamNumber);
    renderAuctionScreen(`
      <div class="sold-panel" style="${teamVars(winner)}">
        <div class="sold-stamp">${last.automatic?"ROSTER AUTO-ASSIGNMENT":"TRANSFER COMPLETE"}</div>
        <div class="sold-word">${last.automatic?"ASSIGNED":"SOLD"}</div><div class="sold-to">${last.automatic?"ROSTER SPACE AVAILABLE":"SIGNED BY"}</div>
        <h2 style="color:var(--team-text)">${esc(winner.name)}</h2>
        <div class="winning-price">${last.price===0?"FREE":"$"+last.price.toLocaleString()}</div>
        <button id="nextPlayerButton" class="primary-button team-action"><span>NEXT PLAYER</span><b>→</b></button>
      </div>`);
    document.getElementById("nextPlayerButton").addEventListener("click",advanceToNextAuction);
}

function displayZeroBudgetChoice(n){
    uiState={screen:"auction",phase:"zero",turn:n};saveGame();
    const rich=teamByNumber(n), broke=teamByNumber(n===1?2:1);
    renderAuctionScreen(`
      ${turnIndicator("AUCTION CONTROL",rich)}
      <div class="bid-panel" style="${teamVars(rich)}">
        <div class="panel-code">ZERO-BUDGET PROTOCOL</div>
        <p><strong style="color:${accessibleTeamAccent(broke.color)}">${esc(broke.name)}</strong> has no remaining budget. Buy ${esc(currentPlayer.name)}, or pass and they receive the player for free.</p>
        ${bidPressureRow(rich,bidIncrement)}
        ${moneyInput("controlBid",bidIncrement,bidIncrement)}
        ${createQuickBidButtons("controlBid")}
        <button id="buyPlayerButton" class="primary-button team-action"><span>BUY PLAYER</span><b>→</b></button>
        <button id="controlPassButton" class="pass-button">PASS // RELEASE</button>
      </div>`);
    const input=document.getElementById("controlBid");
    document.getElementById("buyPlayerButton").addEventListener("click",()=>buyWithControl(n));
    document.getElementById("controlPassButton").addEventListener("click",()=>passWithControl(n));
    enableEnterKey(input,()=>buyWithControl(n)); focusBidInput(input);
}

function focusBidInput(input){
    if(!input)return;
    try{input.focus({preventScroll:true});input.setSelectionRange(0,String(input.value).length);}catch(_){try{input.focus({preventScroll:true})}catch(__){}}
}

function enableEnterKey(input,action){input.addEventListener("keydown",e=>{if(e.key==="Enter")action();});}

function createAuctionHistoryPanel(){
    const latest=[...auctionHistory].reverse().slice(0,6);
    const rows=latest.length?latest.map(x=>`
      <div class="history-row" style="--row-team:${accessibleTeamAccent(x.teamColor)}">
        <img src="${x.player.image}" alt="${esc(x.player.name)}">
        <div class="history-player"><strong>${esc(x.player.name)}</strong><span>AUCTION ${String(x.auction).padStart(2,"0")} // <b style="color:${accessibleTeamAccent(x.teamColor)}">${esc(x.teamName)}</b></span></div>
        <div class="history-price">${x.price===0?"FREE":"$"+x.price.toLocaleString()}</div>
      </div>`).join(""):`<div class="history-empty">AWAITING FIRST TRANSFER...</div>`;
    return `<section class="auction-history-panel">
      <div class="history-heading"><div><span>TRANSFER DATABASE</span><h3>AUCTION HISTORY</h3></div><b>${String(auctionHistory.length).padStart(2,"0")}</b></div>
      <div class="history-list">${rows}</div>
    </section>`;
}

function ensureAuctionHistoryControls(){
    const actions=auctionScreen.querySelector(".header-mini-actions");
    if(!actions)return;
    if(!document.getElementById("auctionUndoButton")){
        const wrap=document.createElement("div");
        wrap.className="auction-history-controls";
        wrap.innerHTML=`
          <button id="auctionUndoButton" class="compact-control auction-history-button" type="button" disabled>↶ <span>UNDO</span></button>
          <button id="auctionRedoButton" class="compact-control auction-history-button" type="button" disabled>↷ <span>REDO</span></button>`;
        actions.insertBefore(wrap,actions.firstChild);
        document.getElementById("auctionUndoButton").addEventListener("click",undoAuctionAction);
        document.getElementById("auctionRedoButton").addEventListener("click",redoAuctionAction);
    }
    updateAuctionUndoRedoControls();
}

function renderAuctionScreen(actionHTML){
    ensureAuctionHistoryControls();
    auctionContent.classList.remove("auction-enter");void auctionContent.offsetWidth;auctionContent.classList.add("auction-enter");
    auctionContent.innerHTML=`<div class="auction-layout auction-command-shell">
      <div class="auction-command-grid">
        ${createTeamTracker(team1,1)}
        <main class="auction-main auction-command-center">${createPlayerCard()}<div class="action-container">${actionHTML}</div></main>
        ${createTeamTracker(team2,2)}
      </div>
      ${createAuctionHistoryPanel()}
    </div>`;
    window.scrollTo({top:0,behavior:"auto"});
}

function updatePlayersRemaining(){
    playersRemainingDisplay.innerHTML=`<span>${remainingPlayers.length}</span>PLAYERS LEFT`;
    playersRemainingDisplay.classList.remove("counter-pop");void playersRemainingDisplay.offsetWidth;playersRemainingDisplay.classList.add("counter-pop");
}

function showOverlay(html){
    clearTimeout(overlayHideTimer);
    overlayContent.innerHTML=html;
    gameOverlay.classList.remove("hidden","overlay-out");
}

function hideOverlay(onHidden=null){
    clearTimeout(overlayHideTimer);
    gameOverlay.classList.add("overlay-out");
    overlayHideTimer=setTimeout(()=>{
        gameOverlay.classList.add("hidden");
        gameOverlay.classList.remove("overlay-out");
        overlayHideTimer=null;
        if(typeof onHidden==="function")onHidden();
    },250);
}

