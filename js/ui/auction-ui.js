// BLUE LOCK DRAFT // AUCTION UI
// Split from the former root script.js. Classic scripts share the same global scope.

let overlayHideTimer=null;
const mobileAuctionMedia=window.matchMedia("(max-width:1024px)");
const mobileAuctionExpandedTeams=new Set();
function defaultMobileAuctionStatsExpanded(){return mobileAuctionMedia.matches&&window.matchMedia("(min-width:768px) and (min-height:501px)").matches;}
let mobileAuctionStatsExpanded=defaultMobileAuctionStatsExpanded(),mobileAuctionHistoryExpanded=false,mobileAuctionDockObserver=null;
let lastAuctionTouchAction=0;
function isMobileAuctionLayout(){return mobileAuctionMedia.matches;}
function auctionTouchAction(action){
    return event=>{
        if(event?.pointerType==="touch"){
            const now=performance.now();if(lastAuctionTouchAction&&now-lastAuctionTouchAction<320)return;lastAuctionTouchAction=now;
        }
        action();
    };
}
function measureMobileAuctionDock(){
    const action=auctionContent.querySelector(".action-container");
    const dock=isMobileAuctionLayout()&&action&&["opening","bidding","zero","sold"].includes(uiState.phase);
    auctionScreen.style.setProperty("--auction-dock-height",dock?`${Math.ceil(action.getBoundingClientRect().height)}px`:"0px");
}
function syncMobileAuctionPresentation(){
    auctionScreen.dataset.auctionPhase=uiState.phase;
    const action=auctionContent.querySelector(".action-container");
    if(!action)return;
    action.setAttribute("role","region");action.setAttribute("aria-label","AUCTION CONTROL");
    if(isMobileAuctionLayout())action.style.removeProperty("min-height");
    let notice=auctionContent.querySelector(".mobile-auction-notice");
    if(!notice){notice=document.createElement("div");notice.className="mobile-auction-notice";auctionContent.querySelector(".current-player")?.after(notice);}
    const explanation=action.querySelector(".bid-panel>p");
    if(notice){notice.innerHTML=uiState.phase==="zero"?(explanation?.innerHTML||""):"";notice.hidden=uiState.phase!=="zero";}
    mobileAuctionDockObserver?.disconnect();
    if(typeof ResizeObserver==="function"){
        mobileAuctionDockObserver=new ResizeObserver(measureMobileAuctionDock);mobileAuctionDockObserver.observe(action);
    }
    measureMobileAuctionDock();
}
auctionContent.addEventListener("click",event=>{
    const teamButton=event.target.closest("[data-auction-team]");
    if(teamButton){
        const number=Number(teamButton.dataset.auctionTeam),expanded=!mobileAuctionExpandedTeams.has(number);
        if(expanded)mobileAuctionExpandedTeams.add(number);else mobileAuctionExpandedTeams.delete(number);
        teamButton.setAttribute("aria-expanded",String(expanded));teamButton.closest(".side-team").classList.toggle("is-expanded",expanded);
        prioritizeVisiblePortraits(teamButton.closest(".side-team"));
    }
    const statsButton=event.target.closest("[data-auction-stats]");
    if(statsButton){mobileAuctionStatsExpanded=!mobileAuctionStatsExpanded;statsButton.setAttribute("aria-expanded",String(mobileAuctionStatsExpanded));statsButton.closest(".auction-attributes").classList.toggle("is-expanded",mobileAuctionStatsExpanded);}
    const historyButton=event.target.closest("[data-auction-history]");
    if(historyButton){mobileAuctionHistoryExpanded=!mobileAuctionHistoryExpanded;historyButton.setAttribute("aria-expanded",String(mobileAuctionHistoryExpanded));historyButton.closest(".auction-history-panel").classList.toggle("is-expanded",mobileAuctionHistoryExpanded);prioritizeVisiblePortraits(historyButton.closest(".auction-history-panel"));}
});
window.addEventListener("resize",measureMobileAuctionDock);
mobileAuctionMedia.addEventListener("change",measureMobileAuctionDock);

function createPlayerCard(){
    return `<div class="current-player">
      <div class="auction-identity-rail">
      <div class="player-image-container"><img class="player-image" data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(currentPlayer)}" alt="${esc(currentPlayer.name)}" loading="eager" fetchpriority="high" decoding="async" width="136" height="155">
      </div>
        <div class="player-card-identity">
          <div class="auction-player-heading"><div>
          <div class="player-card-label">AUCTION ${String(auctionNumber).padStart(2,"0")}</div>
          <div class="player-card-name">${esc(currentPlayer.name)}</div>${playerNationalityMarkup(currentPlayer)}${positionBadges(currentPlayer)}
          <div class="mobile-evaluation-score"><span>OVR</span><strong>${playerOverall(currentPlayer)}</strong><b>${playerStatGrade(playerOverall(currentPlayer))}</b></div>
          </div></div>
        </div>
      </div>
        <div class="auction-attributes ${mobileAuctionStatsExpanded?"is-expanded":""}"><button type="button" class="auction-stats-toggle" data-auction-stats aria-expanded="${mobileAuctionStatsExpanded}" aria-controls="auctionPlayerStats"><span>ATTRIBUTE ANALYSIS</span><b aria-hidden="true">⌄</b></button><div id="auctionPlayerStats" class="auction-stats-body">${playerStatsRadar(currentPlayer,"auction",{overall:playerOverall(currentPlayer),position:primaryPosition(currentPlayer)})}</div></div>
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
        <img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(p)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="42" height="48"><span><strong>${esc(p.name)}</strong><small>${primaryPosition(p)} // ${playerOverall(p)}</small></span>
      </div>`).join(""):`<div class="empty-roster">NO SIGNINGS RECORDED</div>`;
    const warnings=[];
    if(full)warnings.push("ROSTER FULL");
    else if(slotsLeft<=2)warnings.push(`${slotsLeft} SLOT${slotsLeft===1?"":"S"} LEFT`);
    if(lowBudget)warnings.push("LOW CAPITAL");
    if(team.budget===0)warnings.push("NO CAPITAL");
    const expanded=mobileAuctionExpandedTeams.has(number);
    return `<aside class="team-tracker side-team team-${number} ${isTurn?"is-turn":""} ${isLeader?"is-leader":""} ${expanded?"is-expanded":""}" style="${teamVars(team)}">
      <button type="button" class="mobile-team-summary" data-auction-team="${number}" aria-expanded="${expanded}" aria-controls="auctionTeam${number}Details"><strong data-i18n-ignore>${esc(team.name)}</strong><span class="mobile-team-budget">$${team.budget.toLocaleString()}</span><span class="mobile-team-count">${team.players.length}/${maxPlayers} <b aria-hidden="true">⌄</b></span><small>${isTurn?"● ACTIVE TURN":isLeader?"◆ LEADING BID":full?"ROSTER FULL":team.budget===0?"NO CAPITAL":"SQUAD STATUS"}</small>${(isTurn||isLeader)&&(full||team.budget===0)?`<small class="mobile-team-alert">${full?"ROSTER FULL":"NO CAPITAL"}</small>`:""}</button>
      <div id="auctionTeam${number}Details" class="team-tracker-details">
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
      <div class="mini-roster">${roster}</div></div>
    </aside>`;
}

function displayOpeningBid(){
    uiState={screen:"auction",phase:"opening",turn:startingTeam};saveGame();
    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){awardPlayerFree(forcedTeam,true);return;}
    const starter=teamByNumber(startingTeam);
    if(team1.budget===0&&team2.budget===0){currentBid=0;currentBidder=startingTeam;awardPlayer(startingTeam);return;}
    if(starter.budget===0){displayZeroBudgetChoice(startingTeam===1?2:1);return;}
    if(team2CpuControlled&&startingTeam===2){showCpuThinking();scheduleAuctionTransition(performCpuOpeningBid,850);return;}
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
    document.getElementById("placeOpeningBid").addEventListener("click",auctionTouchAction(placeOpeningBid));
    enableEnterKey(input,placeOpeningBid); focusBidInput(input);
}

function turnIndicator(label,team){
    return `<div class="turn-indicator active-turn" style="${teamVars(team)}">
      <div class="turn-pulse"></div><span>${label}</span><strong>${esc(team.name)}</strong>
    </div>`;
}

function moneyInput(id,value,min){
    const label={openingBid:"Opening bid",nextBid:"Next bid",controlBid:"Control bid"}[id]||"Bid amount";
    return `<div class="money-input"><span>$</span><input type="number" inputmode="decimal" id="${id}" aria-label="${label}" value="${value}" min="${min}" step="${bidIncrement}"></div>`;
}

function bidPressureRow(team,minBid){
    const after=Math.max(0,team.budget-minBid);
    return `<div class="bid-pressure-row"><span>MINIMUM <b>$${minBid.toLocaleString()}</b></span><span>AFTER MIN BID <b>$${after.toLocaleString()}</b></span></div>`;
}

function createQuickBidButtons(id){
    return `<div class="quick-bids${bidIncrement*10>=1000?" quick-bids-wide":""}">
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
    if(teamNumber===2&&team2CpuControlled){showCpuThinking();scheduleAuctionTransition(performCpuResponse,850);return;}
    const holder=teamByNumber(currentBidder), min=currentBid+bidIncrement;
    renderAuctionScreen(`
      ${turnIndicator("YOUR TURN // BID OR PASS",team)}
      <div class="bid-panel" style="${teamVars(team)}">
        <div class="panel-code">LIVE VALUATION // ACTIVE</div>
        <div class="bid-valuation"><div><span class="current-bid-label">CURRENT BID</span><strong class="current-bid">$${currentBid.toLocaleString()}</strong></div>
        <div class="bid-holder">CONTROLLED BY <strong style="${teamVars(holder)};color:var(--team-heading,var(--team))">${esc(holder.name)}</strong></div></div>
        ${bidPressureRow(team,min)}
        ${moneyInput("nextBid",min,min)}
        ${createQuickBidButtons("nextBid")}
        <div class="bid-actions"><button id="placeBidButton" class="primary-button team-action"><span>PLACE BID</span><b>→</b></button>
        <button id="passButton" class="pass-button">PASS // WITHDRAW</button></div>
      </div>`);
    const input=document.getElementById("nextBid");
    document.getElementById("placeBidButton").addEventListener("click",auctionTouchAction(()=>placeBid(teamNumber)));
    document.getElementById("passButton").addEventListener("click",auctionTouchAction(passBid));
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
    if(n===2&&team2CpuControlled){showCpuThinking();scheduleAuctionTransition(resolveCpuZeroBudgetChoice,850);return;}
    const rich=teamByNumber(n), broke=teamByNumber(n===1?2:1);
    renderAuctionScreen(`
      ${turnIndicator("AUCTION CONTROL",rich)}
      <div class="bid-panel" style="${teamVars(rich)}">
        <div class="panel-code">ZERO-BUDGET PROTOCOL</div>
        <p><strong style="${teamVars(broke)};color:var(--team-heading,var(--team))">${esc(broke.name)}</strong> has no remaining budget. Buy ${esc(currentPlayer.name)}, or pass and they receive the player for free.</p>
        ${bidPressureRow(rich,bidIncrement)}
        ${moneyInput("controlBid",bidIncrement,bidIncrement)}
        ${createQuickBidButtons("controlBid")}
        <div class="bid-actions"><button id="buyPlayerButton" class="primary-button team-action"><span>BUY PLAYER</span><b>→</b></button>
        <button id="controlPassButton" class="pass-button">PASS // RELEASE</button></div>
      </div>`);
    const input=document.getElementById("controlBid");
    document.getElementById("buyPlayerButton").addEventListener("click",auctionTouchAction(()=>buyWithControl(n)));
    document.getElementById("controlPassButton").addEventListener("click",auctionTouchAction(()=>passWithControl(n)));
    enableEnterKey(input,()=>buyWithControl(n)); focusBidInput(input);
}

function focusBidInput(input){
    if(!input)return;
    if(isMobileAuctionLayout())return; // Tapping the field opens the keyboard, not every new turn.
    try{input.focus({preventScroll:true});input.setSelectionRange(0,String(input.value).length);}catch(_){try{input.focus({preventScroll:true})}catch(__){}}
}

function enableEnterKey(input,action){input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.repeat){e.preventDefault();action();}});}

function createAuctionHistoryPanel(){
    const latest=[...auctionHistory].reverse();
    const rows=latest.length?latest.map(x=>`
      <div class="history-row" style="--row-team:${accessibleTeamAccent(x.teamColor)}">
        <img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(x.player)}" alt="${esc(x.player.name)}" loading="lazy" decoding="async" width="40" height="49">
        <div class="history-player"><strong>${esc(x.player.name)}</strong><span>AUCTION ${String(x.auction).padStart(2,"0")} // <b style="${teamVars({color:x.teamColor})};color:var(--team-heading,var(--team))">${esc(x.teamName)}</b></span></div>
        <div class="history-price">${x.price===0?"FREE":"$"+x.price.toLocaleString()}</div>
      </div>`).join(""):`<div class="history-empty">AWAITING FIRST TRANSFER...</div>`;
    return `<section class="auction-history-panel ${mobileAuctionHistoryExpanded?"is-expanded":""}">
      <button type="button" class="mobile-history-toggle" data-auction-history aria-expanded="${mobileAuctionHistoryExpanded}" aria-controls="auctionHistoryRows"><span>AUCTION HISTORY</span><strong>${auctionHistory.length}</strong><b aria-hidden="true">⌄</b></button>
      <div class="history-heading"><div><span>TRANSFER DATABASE</span><h3>AUCTION HISTORY</h3></div><b>${String(auctionHistory.length).padStart(2,"0")}</b></div>
      <div id="auctionHistoryRows" class="history-list">${rows}</div>
    </section>`;
}

function ensureAuctionHistoryControls(){
    const actions=auctionScreen.querySelector(".auction-context-actions");
    if(!document.getElementById("auctionUndoButton")){
        const wrap=document.createElement("div");
        wrap.className="auction-history-controls";
        wrap.innerHTML=`
          <button id="auctionUndoButton" class="context-control auction-history-button" type="button" disabled>↶ <span>UNDO</span></button>
          <button id="auctionRedoButton" class="context-control auction-history-button" type="button" disabled>↷ <span>REDO</span></button>`;
        actions.insertBefore(wrap,actions.firstChild);
        document.getElementById("auctionUndoButton").addEventListener("click",undoAuctionAction);
        document.getElementById("auctionRedoButton").addEventListener("click",redoAuctionAction);
    }
    updateAuctionUndoRedoControls();
}

function renderAuctionScreen(actionHTML){
    ensureAuctionHistoryControls();
    const action=auctionContent.querySelector(".action-container");
    const previousPlayerId=auctionContent.dataset.playerId;
    const samePlayer=previousPlayerId===String(currentPlayer.id)&&!!action;
    const scroll=window.scrollY;
    if(samePlayer){
        // Keep the immutable evaluation SVG/image and stabilize the action area
        // while the same player moves through bidding, zero-budget and sold states.
        if(!isMobileAuctionLayout())action.style.minHeight=action.getBoundingClientRect().height+"px";
        action.innerHTML=actionHTML;
        auctionContent.querySelectorAll(".side-team").forEach((node,index)=>{
            node.outerHTML=createTeamTracker(index===0?team1:team2,index+1);
        });
        const historyPanel=auctionContent.querySelector(".auction-history-panel");
        if(historyPanel)historyPanel.outerHTML=createAuctionHistoryPanel();
        window.scrollTo({top:scroll,behavior:"instant"});
        syncMobileAuctionPresentation();
        return;
    }
    auctionContent.dataset.playerId=String(currentPlayer.id);
    mobileAuctionStatsExpanded=defaultMobileAuctionStatsExpanded();
    auctionContent.classList.remove("auction-enter");void auctionContent.offsetWidth;auctionContent.classList.add("auction-enter");
    auctionContent.innerHTML=`<div class="auction-layout auction-command-shell">
      <div class="auction-command-grid">
        ${createTeamTracker(team1,1)}
        <main class="auction-main auction-command-center">${createPlayerCard()}<div class="action-container">${actionHTML}</div></main>
        ${createTeamTracker(team2,2)}
      </div>
      ${createAuctionHistoryPanel()}
    </div>`;
    window.scrollTo({top:previousPlayerId?scroll:0,behavior:"instant"});
    syncMobileAuctionPresentation();
}

function updatePlayersRemaining(){
    playersRemainingDisplay.innerHTML=`<span>${remainingPlayers.length}</span> <small>PLAYERS LEFT</small>`;
    playersRemainingDisplay.classList.remove("counter-pop");void playersRemainingDisplay.offsetWidth;playersRemainingDisplay.classList.add("counter-pop");
}

function showOverlay(html,kind="reveal"){
    warmPlayerPortrait(currentPlayer);
    clearTimeout(overlayHideTimer);
    overlayContent.innerHTML=html;
    gameOverlay.dataset.auctionOverlay=kind;
    overlayContent.scrollTop=0;
    gameOverlay.classList.remove("hidden","overlay-out");
}

function hideOverlay(onHidden=null){
    const epoch=auctionTransitionEpoch;
    clearTimeout(overlayHideTimer);
    gameOverlay.classList.add("overlay-out");
    overlayHideTimer=setTimeout(()=>{
        if(epoch!==auctionTransitionEpoch)return;
        gameOverlay.classList.add("hidden");
        gameOverlay.classList.remove("overlay-out");
        overlayHideTimer=null;
        if(typeof onHidden==="function")onHidden();
    },250);
}
