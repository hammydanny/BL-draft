// BLUE LOCK AUCTION // VISUAL OVERHAUL

let team1 = { name:"", color:"#19a7ff", budget:0, players:[] };
let team2 = { name:"", color:"#ff315d", budget:0, players:[] };
let bidIncrement = 50, maxPlayers = 15, startingBudget = 15000;
let remainingPlayers = [], currentPlayer = null, currentBid = 0, currentBidder = null;
let startingTeam = null, auctionNumber = 0, auctionHistory = [];
let selectedPlayerIds = new Set(players.map(player => player.id));
const SAVE_KEY="blAuctionSaveV2";
let uiState={screen:"setup",phase:"setup",turn:null};
let pendingConfirmAction=null;

const setupScreen = document.getElementById("setup-screen");
const auctionScreen = document.getElementById("auction-screen");
const auctionContent = document.getElementById("auction-content");
const gameOverlay = document.getElementById("game-overlay");
const overlayContent = document.getElementById("overlay-content");
const playersRemainingDisplay = document.getElementById("playersRemaining");
const formationScreen = document.getElementById("formation-screen");
const formationContent = document.getElementById("formation-content");

let formationTeamNumber = 1;
let activeFormation = "4-3-3";
let formationAssignments = { 1: {}, 2: {} };
let selectedFormationPlayerId = null;

document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("playerSearch").addEventListener("input", renderPlayerPool);
document.getElementById("selectAllPlayers").addEventListener("click", () => {
    selectedPlayerIds = new Set(players.map(player => player.id));
    renderPlayerPool();
});
document.getElementById("clearAllPlayers").addEventListener("click", () => {
    selectedPlayerIds.clear();
    renderPlayerPool();
});
document.getElementById("maxPlayers").addEventListener("input", updatePoolStatus);

["team1Color","team2Color"].forEach(id => {
    const input = document.getElementById(id);
    const output = document.getElementById(id+"Value");
    input.addEventListener("input", () => output.textContent = input.value.toUpperCase());
});

function esc(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

let siteErrorTimer=null;
function showSiteError(message,title="INPUT ERROR"){
    let box=document.getElementById("siteError");
    if(!box){
        box=document.createElement("div");
        box.id="siteError";
        box.className="site-error";
        box.setAttribute("role","alert");
        box.setAttribute("aria-live","assertive");
        box.innerHTML=`
          <div class="site-error-bar"></div>
          <div class="site-error-icon">!</div>
          <div class="site-error-copy">
            <span id="siteErrorTitle"></span>
            <strong id="siteErrorMessage"></strong>
          </div>
          <button id="siteErrorClose" type="button" aria-label="Close error">×</button>`;
        document.body.appendChild(box);
        document.getElementById("siteErrorClose").addEventListener("click",hideSiteError);
    }
    document.getElementById("siteErrorTitle").textContent=title;
    document.getElementById("siteErrorMessage").textContent=message;
    box.classList.remove("show","error-pulse");
    void box.offsetWidth;
    box.classList.add("show","error-pulse");
    clearTimeout(siteErrorTimer);
    siteErrorTimer=setTimeout(hideSiteError,5200);
}
function hideSiteError(){
    const box=document.getElementById("siteError");
    if(box) box.classList.remove("show","error-pulse");
    clearTimeout(siteErrorTimer);
}

function teamByNumber(n){ return n === 1 ? team1 : team2; }
function isTeamFull(n){ return teamByNumber(n).players.length >= maxPlayers; }
function otherTeamNumber(n){ return n === 1 ? 2 : 1; }
function onlyTeamWithSpace(){
    const t1Full=isTeamFull(1), t2Full=isTeamFull(2);
    if(t1Full && !t2Full) return 2;
    if(t2Full && !t1Full) return 1;
    return null;
}
function teamVars(team){ return `--team:${team.color};--team-soft:${hexToRgba(team.color,.14)};--team-glow:${hexToRgba(team.color,.28)}`; }
function hexToRgba(hex,a){
    const h=hex.replace("#","");
    const n=parseInt(h.length===3?h.split("").map(x=>x+x).join(""):h,16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}

function renderPlayerPool(){
    const grid=document.getElementById("playerPoolGrid");
    const empty=document.getElementById("playerPoolEmpty");
    const query=document.getElementById("playerSearch").value.trim().toLowerCase();

    const visiblePlayers=players.filter(player =>
        player.name.toLowerCase().includes(query)
    );

    grid.innerHTML=visiblePlayers.map(player => {
        const selected=selectedPlayerIds.has(player.id);
        return `<button type="button"
            class="pool-player-card ${selected?"selected":""}"
            data-player-id="${player.id}"
            aria-pressed="${selected}">
            <div class="pool-player-check">${selected?"✓":"+"}</div>
            <img src="${player.image}" alt="${esc(player.name)}">
            <div class="pool-player-info">
                <span>PLAYER // ${String(player.id).padStart(2,"0")}</span>
                <strong>${esc(player.name)}</strong>
            </div>
        </button>`;
    }).join("");

    grid.querySelectorAll(".pool-player-card").forEach(card => {
        card.addEventListener("click", () => {
            const id=Number(card.dataset.playerId);
            if(selectedPlayerIds.has(id)) selectedPlayerIds.delete(id);
            else selectedPlayerIds.add(id);
            renderPlayerPool();
        });
    });

    empty.classList.toggle("hidden", visiblePlayers.length !== 0);
    updatePoolStatus();
}

function updatePoolStatus(){
    const count=document.getElementById("selectedPlayerCount");
    const requirement=document.getElementById("poolRequirement");
    const max=Number(document.getElementById("maxPlayers").value)||0;
    const needed=max*2;
    const selected=selectedPlayerIds.size;

    count.textContent=`${selected} / ${players.length}`;

    if(max<=0){
        requirement.textContent="ENTER A VALID TEAM SIZE";
        requirement.className="pool-requirement warning";
    } else if(selected<needed){
        requirement.textContent=`NEED ${needed} PLAYERS TO FILL BOTH TEAMS`;
        requirement.className="pool-requirement warning";
    } else {
        requirement.textContent=`READY // ${selected} PLAYERS IN POOL`;
        requirement.className="pool-requirement ready";
    }
}

renderPlayerPool();

const presetNames = {
    "all": players.map(p=>p.name),
    "blue-lock-project": [
        "Yoichi Isagi","Ryosuke Kira","Meguru Bachira","Gurimu Igarashi","Rensuke Kunigami","Hyoma Chigiri",
        "Gin Gagamaru","Jingo Raichi","Asahi Naruhaya","Okuhito Iemon","Wataru Kuon","Yudai Imamura",
        "Shoei Baro","Ikki Niko","Hibiki Okawa","Junichi Wanima","Keisuke Wanima","Reo Mikage","Seishiro Nagi",
        "Zantetsu Tsurugi","Rin Itoshi","Jyubei Aryu","Aoshi Tokimitsu","Ranze Kurona","Yo Hiori","Tabito Karasu",
        "Eita Otoya","Kenyu Yukimiya","Ryusei Shido","Nijiro Nanase","Jin Kiyora"
    ],
    "world-five": ["Leonardo Luna","Pablo Cavasoz","Adam Blake","Dada Silva","Julien Loki"],
    "u20-match": [
        "Sae Itoshi","Gen Fukaku","Oliver Aiku","Kazuma Nio","Miroku Darai","Teppei Neru","Itsuki Wakatsuki",
        "Haru Hayate","Kento Cho","Teru Kitsunezato","Shuto Sendo","Ryusei Shido"
    ],
    "nel-stars": [
        "Noel Noa","Michael Kaiser","Alexis Ness","Benedict Grim","Lavinho","Chris Prince","Agi",
        "Marc Snuffy","Don Lorenzo","Charles Chevalier","Julien Loki"
    ],
    "world-cup-new": [
        "Rooke","Renoir","Haneru Shindo","Bunny Iglesias","Innocent Onazi","Godwin Kuso",
        "Vivien Hugo","Achanpong","Lockhart","Teddy Knight","Childs"
    ]
};
const PLAYER_PRESETS=Object.fromEntries(Object.entries(presetNames).map(([key,names])=>[
    key, players.filter(p=>names.includes(p.name)).map(p=>p.id)
]));

document.querySelectorAll("[data-preset]").forEach(button=>{
    button.addEventListener("click",()=>{
        const ids=PLAYER_PRESETS[button.dataset.preset]||[];
        selectedPlayerIds=new Set(ids);
        renderPlayerPool();
        document.querySelectorAll("[data-preset]").forEach(b=>b.classList.toggle("active",b===button));
        saveSetupPreferences();
    });
});

function serializePlayerList(list){return list.map(p=>p.id);}
function hydratePlayers(ids=[]){return ids.map(id=>players.find(p=>p.id===id)).filter(Boolean);}
function saveSetupPreferences(){
    try{
        const existing=JSON.parse(localStorage.getItem(SAVE_KEY)||"{}");
        if(existing.gameActive) return;
        localStorage.setItem(SAVE_KEY,JSON.stringify({
            ...existing,gameActive:false,
            setup:{
                team1Name:document.getElementById("team1Name").value,
                team2Name:document.getElementById("team2Name").value,
                team1Color:document.getElementById("team1Color").value,
                team2Color:document.getElementById("team2Color").value,
                budget:document.getElementById("budget").value,
                bidIncrement:document.getElementById("bidIncrement").value,
                maxPlayers:document.getElementById("maxPlayers").value,
                selected:[...selectedPlayerIds]
            }
        }));
    }catch(e){}
}
function saveGame(){
    if(uiState.screen==="setup"){saveSetupPreferences();return;}
    try{
        localStorage.setItem(SAVE_KEY,JSON.stringify({
            gameActive:true,uiState,startingBudget,bidIncrement,maxPlayers,startingTeam,auctionNumber,currentBid,currentBidder,
            currentPlayerId:currentPlayer?.id??null,
            remainingPlayerIds:serializePlayerList(remainingPlayers),
            selectedPlayerIds:[...selectedPlayerIds],
            team1:{...team1,players:serializePlayerList(team1.players)},
            team2:{...team2,players:serializePlayerList(team2.players)},
            auctionHistory:auctionHistory.map(x=>({...x,playerId:x.player.id,player:undefined})),
            formationTeamNumber,activeFormation,formationAssignments
        }));
    }catch(e){}
}
function loadSavedData(){
    try{return JSON.parse(localStorage.getItem(SAVE_KEY)||"null");}catch(e){return null;}
}
function clearSavedGame(){localStorage.removeItem(SAVE_KEY);}
function restoreSetup(saved){
    const s=saved?.setup;if(!s)return;
    ["team1Name","team2Name","team1Color","team2Color","budget","bidIncrement","maxPlayers"].forEach(id=>{
        if(s[id]!==undefined)document.getElementById(id).value=s[id];
    });
    document.getElementById("team1ColorValue").textContent=document.getElementById("team1Color").value.toUpperCase();
    document.getElementById("team2ColorValue").textContent=document.getElementById("team2Color").value.toUpperCase();
    if(Array.isArray(s.selected))selectedPlayerIds=new Set(s.selected);
    renderPlayerPool();
}
function showResumeCard(saved){
    const card=document.getElementById("resumeSessionCard");
    if(!saved?.gameActive){card.classList.add("hidden");return;}
    card.classList.remove("hidden");
    document.getElementById("resumeSessionTitle").textContent=`AUCTION ${String(saved.auctionNumber||0).padStart(2,"0")} // IN PROGRESS`;
    document.getElementById("resumeSessionMeta").textContent=
      `${saved.team1?.name||"TEAM 1"} ${saved.team1?.players?.length||0}/${saved.maxPlayers}  •  ${saved.team2?.name||"TEAM 2"} ${saved.team2?.players?.length||0}/${saved.maxPlayers}`;
}
function restoreGame(saved){
    if(!saved?.gameActive)return;
    startingBudget=saved.startingBudget;bidIncrement=saved.bidIncrement;maxPlayers=saved.maxPlayers;startingTeam=saved.startingTeam;
    auctionNumber=saved.auctionNumber;currentBid=saved.currentBid;currentBidder=saved.currentBidder;
    currentPlayer=players.find(p=>p.id===saved.currentPlayerId)||null;
    remainingPlayers=hydratePlayers(saved.remainingPlayerIds);
    selectedPlayerIds=new Set(saved.selectedPlayerIds||players.map(p=>p.id));
    team1={...saved.team1,players:hydratePlayers(saved.team1?.players)};
    team2={...saved.team2,players:hydratePlayers(saved.team2?.players)};
    auctionHistory=(saved.auctionHistory||[]).map(x=>({...x,player:players.find(p=>p.id===x.playerId)})).filter(x=>x.player);
    formationTeamNumber=saved.formationTeamNumber||1;activeFormation=saved.activeFormation||"4-3-3";
    formationAssignments=saved.formationAssignments||{1:{},2:{}};
    uiState=saved.uiState||{screen:"auction",phase:"opening",turn:null};
    setupScreen.classList.add("hidden");formationScreen.classList.add("hidden");auctionScreen.classList.remove("hidden");
    updatePlayersRemaining();
    resumeCurrentView();
}
function resumeCurrentView(){
    if(uiState.screen==="formation"){auctionScreen.classList.add("hidden");formationScreen.classList.remove("hidden");renderFormationBuilder();return;}
    if(uiState.phase==="complete"){showAuctionComplete();return;}
    if(!currentPlayer){startNextAuction();return;}
    if(uiState.phase==="bidding"){displayBiddingTurn(uiState.turn);return;}
    if(uiState.phase==="zero"){displayZeroBudgetChoice(uiState.turn);return;}
    if(uiState.phase==="sold"){
        const last=auctionHistory[auctionHistory.length-1];
        renderSoldState(last);return;
    }
    displayOpeningBid();
}
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
["team1Name","team2Name","team1Color","team2Color","budget","bidIncrement","maxPlayers"].forEach(id=>document.getElementById(id).addEventListener("change",saveSetupPreferences));

document.addEventListener("error",event=>{
    const img=event.target;
    if(img?.tagName!=="IMG"||img.dataset.fallbackApplied)return;
    img.dataset.fallbackApplied="1";
    img.classList.add("image-fallback");
    img.removeAttribute("src");
    img.alt="Player image unavailable";
},true);

function startGame(){
    const n1=document.getElementById("team1Name").value.trim();
    const n2=document.getElementById("team2Name").value.trim();
    const budget=Number(document.getElementById("budget").value);
    bidIncrement=Number(document.getElementById("bidIncrement").value);
    maxPlayers=Number(document.getElementById("maxPlayers").value);
    if(!n1||!n2) return showSiteError("Please enter names for both teams.","SETUP INCOMPLETE");
    if(budget<=0) return showSiteError("Starting budget must be greater than $0.","INVALID BUDGET");
    if(bidIncrement<=0) return showSiteError("Bid interval must be greater than $0.","INVALID BID INTERVAL");
    if(maxPlayers<=0) return showSiteError("Maximum players must be greater than 0.","INVALID TEAM SIZE");

    const selectedPlayers=players.filter(player => selectedPlayerIds.has(player.id));
    const requiredPlayers=maxPlayers*2;

    if(selectedPlayers.length===0) return showSiteError("Select at least one player for the auction.","PLAYER POOL EMPTY");
    if(selectedPlayers.length<requiredPlayers){
        return showSiteError(`You need at least ${requiredPlayers} selected players to fill two teams of ${maxPlayers}. Select more players or lower the maximum players per team.`,"NOT ENOUGH PLAYERS");
    }

    startingBudget=budget;
    team1={name:n1,color:document.getElementById("team1Color").value,budget,players:[]};
    team2={name:n2,color:document.getElementById("team2Color").value,budget,players:[]};
    remainingPlayers=[...selectedPlayers]; auctionHistory=[]; auctionNumber=0;
    currentPlayer=null; currentBid=0; currentBidder=null;
    startingTeam=Math.random()<.5?1:2;
    uiState={screen:"auction",phase:"coin",turn:null};saveGame();
    setupScreen.classList.add("hidden"); auctionScreen.classList.remove("hidden");
    updatePlayersRemaining(); showCoinFlip();
}

function showCoinFlip(){
    const t=teamByNumber(startingTeam);
    showOverlay(`
      <div class="overlay-kicker">OPENING PRIORITY // RANDOMIZED</div>
      <div class="coin" style="${teamVars(t)}"><span>BL</span></div>
      <div class="overlay-eyebrow">FIRST BID CONTROL</div>
      <h2 style="color:${t.color}">${esc(t.name)}</h2>
      <p>WON THE INITIAL DRAW</p>`);
    setTimeout(()=>{hideOverlay();startNextAuction();},1800);
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

    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){ showForcedAssignment(forcedTeam); return; }

    showPlayerReveal();
    saveGame();
}

function showForcedAssignment(teamNumber){
    const team=teamByNumber(teamNumber);
    const fullTeam=teamByNumber(otherTeamNumber(teamNumber));
    showOverlay(`
      <div class="overlay-kicker">ROSTER CAPACITY PROTOCOL // ${String(auctionNumber).padStart(2,"0")}</div>
      <div class="reveal-image"><img src="${currentPlayer.image}" alt="${esc(currentPlayer.name)}"></div>
      <div class="overlay-eyebrow">AUTOMATIC ASSIGNMENT</div>
      <h2>${esc(currentPlayer.name)}</h2>
      <p><strong style="color:${fullTeam.color}">${esc(fullTeam.name)}</strong> HAS FILLED ITS ROSTER</p>
      <div class="forced-destination" style="${teamVars(team)}">ASSIGNED TO <strong>${esc(team.name)}</strong></div>`);
    setTimeout(()=>{hideOverlay();setTimeout(()=>awardPlayerFree(teamNumber,true),260);},1500);
}

function awardPlayerFree(teamNumber,forced=false){
    const winner=teamByNumber(teamNumber);
    winner.players.push(currentPlayer);
    auctionHistory.push({auction:auctionNumber,player:currentPlayer,teamNumber,teamName:winner.name,teamColor:winner.color,price:0,automatic:forced});
    startingTeam=otherTeamNumber(startingTeam);
    uiState={screen:"auction",phase:"sold",turn:teamNumber};saveGame();
    renderAuctionScreen(`
      <div class="sold-panel" style="${teamVars(winner)}">
        <div class="sold-stamp">${forced?"ROSTER AUTO-ASSIGNMENT":"TRANSFER COMPLETE"}</div>
        <div class="sold-word">${forced?"ASSIGNED":"SOLD"}</div>
        <div class="sold-to">${forced?"ROSTER SPACE AVAILABLE":"SIGNED BY"}</div>
        <h2 style="color:${winner.color}">${esc(winner.name)}</h2>
        <div class="winning-price">FREE</div>
        <button id="nextPlayerButton" class="primary-button team-action"><span>NEXT PLAYER</span><b>→</b></button>
      </div>`);
    document.getElementById("nextPlayerButton").addEventListener("click",startNextAuction);
}

function showPlayerReveal(){
    showOverlay(`
      <div class="overlay-kicker">TARGET ACQUIRED // ${String(auctionNumber).padStart(2,"0")}</div>
      <div class="reveal-image"><img src="${currentPlayer.image}" alt="${esc(currentPlayer.name)}"></div>
      <div class="overlay-eyebrow">PLAYER SELECTED</div>
      <h2>${esc(currentPlayer.name)}</h2>
      <div class="auction-number">AUCTION // ${String(auctionNumber).padStart(2,"0")}</div>`);
    setTimeout(()=>{hideOverlay();displayOpeningBid();},1500);
}

function createPlayerCard(){
    return `<div class="current-player">
      <div class="card-index">${String(auctionNumber).padStart(2,"0")}</div>
      <div class="player-image-container"><img class="player-image" src="${currentPlayer.image}" alt="${esc(currentPlayer.name)}"></div>
      <div class="player-card-bottom">
        <div class="player-card-label">CURRENT TARGET // AUCTION ${String(auctionNumber).padStart(2,"0")}</div>
        <div class="player-card-name">${esc(currentPlayer.name)}</div>
      </div>
    </div>`;
}

function createTeamTrackers(){
    return `<div class="team-trackers">${createTeamTracker(team1,1)}${createTeamTracker(team2,2)}</div>`;
}
function createTeamTracker(team,number){
    const roster=team.players.length?team.players.map(p=>`
      <div class="mini-player-card" title="${esc(p.name)}">
        <img src="${p.image}" alt="${esc(p.name)}"><span>${esc(p.name)}</span>
      </div>`).join(""):`<div class="empty-roster">NO SIGNINGS RECORDED</div>`;
    return `<div class="team-tracker team-${number}" style="${teamVars(team)}">
      <div class="team-accent"></div>
      <div class="team-header">
        <div><span class="team-code">SQUAD // 0${number}</span><h3>${esc(team.name)}</h3></div>
        <span class="roster-count">${team.players.length}/${maxPlayers}</span>
      </div>
      <div class="budget-label">AVAILABLE CAPITAL</div>
      <div class="budget-amount">$${team.budget.toLocaleString()}</div>
      <div class="budget-bar"><i style="width:${Math.max(0,(team.budget/startingBudget)*100)}%"></i></div>
      <div class="mini-roster">${roster}</div>
    </div>`;
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
        ${moneyInput("openingBid",bidIncrement,bidIncrement)}
        ${createQuickBidButtons("openingBid")}
        <button id="placeOpeningBid" class="primary-button team-action"><span>LOCK OPENING BID</span><b>→</b></button>
      </div>`);
    const input=document.getElementById("openingBid");
    document.getElementById("placeOpeningBid").addEventListener("click",placeOpeningBid);
    enableEnterKey(input,placeOpeningBid); input.select();
}

function turnIndicator(label,team){
    return `<div class="turn-indicator active-turn" style="${teamVars(team)}">
      <div class="turn-pulse"></div><span>${label}</span><strong>${esc(team.name)}</strong>
    </div>`;
}
function moneyInput(id,value,min){
    return `<div class="money-input"><span>$</span><input type="number" id="${id}" value="${value}" min="${min}" step="${bidIncrement}"></div>`;
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

function placeOpeningBid(){
    const bid=Number(document.getElementById("openingBid").value), starter=teamByNumber(startingTeam);
    if(!validateBid(bid,starter,0)) return;
    currentBid=bid; currentBidder=startingTeam;
    const other=startingTeam===1?2:1;
    if(teamByNumber(other).budget===0){awardPlayer(startingTeam);return;}
    displayBiddingTurn(other);
}

function displayBiddingTurn(teamNumber){
    uiState={screen:"auction",phase:"bidding",turn:teamNumber};saveGame();
    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){awardPlayerFree(forcedTeam,true);return;}
    const team=teamByNumber(teamNumber);
    if(team.budget===0){awardPlayer(currentBidder);return;}
    const holder=teamByNumber(currentBidder), min=currentBid+bidIncrement;
    renderAuctionScreen(`
      ${turnIndicator("YOUR TURN // BID OR PASS",team)}
      <div class="bid-panel" style="${teamVars(team)}">
        <div class="panel-code">LIVE VALUATION // ACTIVE</div>
        <div class="current-bid-label">CURRENT BID</div>
        <div class="current-bid">$${currentBid.toLocaleString()}</div>
        <div class="bid-holder">CONTROLLED BY <strong style="color:${holder.color}">${esc(holder.name)}</strong></div>
        ${moneyInput("nextBid",min,min)}
        ${createQuickBidButtons("nextBid")}
        <button id="placeBidButton" class="primary-button team-action"><span>PLACE BID</span><b>→</b></button>
        <button id="passButton" class="pass-button">PASS // WITHDRAW</button>
      </div>`);
    const input=document.getElementById("nextBid");
    document.getElementById("placeBidButton").addEventListener("click",()=>placeBid(teamNumber));
    document.getElementById("passButton").addEventListener("click",passBid);
    enableEnterKey(input,()=>placeBid(teamNumber)); input.select();
}
function placeBid(n){
    const team=teamByNumber(n), bid=Number(document.getElementById("nextBid").value);
    if(!validateBid(bid,team,currentBid)) return;
    currentBid=bid; currentBidder=n; displayBiddingTurn(n===1?2:1);
}
function validateBid(bid,team,minimum){
    if(bid<=minimum){showSiteError(minimum===0?"Please enter a valid bid.":`Your bid must be higher than $${minimum.toLocaleString()}.`,"BID REJECTED");return false;}
    if(bid%bidIncrement!==0){showSiteError(`Bids must be in intervals of $${bidIncrement}.`,"INVALID BID INTERVAL");return false;}
    if(bid>team.budget){showSiteError(`${team.name} only has $${team.budget.toLocaleString()} remaining.`,"INSUFFICIENT BUDGET");return false;}
    if(team.players.length>=maxPlayers){showSiteError(`${team.name}'s roster is full.`,"ROSTER FULL");return false;}
    return true;
}
function passBid(){awardPlayer(currentBidder);}

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
    renderAuctionScreen(`
      <div class="sold-panel" style="${teamVars(winner)}">
        <div class="sold-stamp">TRANSFER COMPLETE</div>
        <div class="sold-word">SOLD</div><div class="sold-to">SIGNED BY</div>
        <h2 style="color:${winner.color}">${esc(winner.name)}</h2>
        <div class="winning-price">${price===0?"FREE":"$"+price.toLocaleString()}</div>
        <button id="nextPlayerButton" class="primary-button team-action"><span>NEXT PLAYER</span><b>→</b></button>
      </div>`);
    document.getElementById("nextPlayerButton").addEventListener("click",startNextAuction);
}

function renderSoldState(last){
    if(!last){startNextAuction();return;}
    const winner=teamByNumber(last.teamNumber);
    renderAuctionScreen(`
      <div class="sold-panel" style="${teamVars(winner)}">
        <div class="sold-stamp">${last.automatic?"ROSTER AUTO-ASSIGNMENT":"TRANSFER COMPLETE"}</div>
        <div class="sold-word">${last.automatic?"ASSIGNED":"SOLD"}</div><div class="sold-to">${last.automatic?"ROSTER SPACE AVAILABLE":"SIGNED BY"}</div>
        <h2 style="color:${winner.color}">${esc(winner.name)}</h2>
        <div class="winning-price">${last.price===0?"FREE":"$"+last.price.toLocaleString()}</div>
        <button id="nextPlayerButton" class="primary-button team-action"><span>NEXT PLAYER</span><b>→</b></button>
      </div>`);
    document.getElementById("nextPlayerButton").addEventListener("click",startNextAuction);
}

function displayZeroBudgetChoice(n){
    uiState={screen:"auction",phase:"zero",turn:n};saveGame();
    const rich=teamByNumber(n), broke=teamByNumber(n===1?2:1);
    renderAuctionScreen(`
      ${turnIndicator("AUCTION CONTROL",rich)}
      <div class="bid-panel" style="${teamVars(rich)}">
        <div class="panel-code">ZERO-BUDGET PROTOCOL</div>
        <p><strong style="color:${broke.color}">${esc(broke.name)}</strong> has no remaining budget. Buy ${esc(currentPlayer.name)}, or pass and they receive the player for free.</p>
        ${moneyInput("controlBid",bidIncrement,bidIncrement)}
        ${createQuickBidButtons("controlBid")}
        <button id="buyPlayerButton" class="primary-button team-action"><span>BUY PLAYER</span><b>→</b></button>
        <button id="controlPassButton" class="pass-button">PASS // RELEASE</button>
      </div>`);
    const input=document.getElementById("controlBid");
    document.getElementById("buyPlayerButton").addEventListener("click",()=>buyWithControl(n));
    document.getElementById("controlPassButton").addEventListener("click",()=>passWithControl(n));
    enableEnterKey(input,()=>buyWithControl(n)); input.select();
}
function buyWithControl(n){
    const team=teamByNumber(n),bid=Number(document.getElementById("controlBid").value);
    if(!validateBid(bid,team,0)) return;
    currentBid=bid;currentBidder=n;awardPlayer(n);
}
function passWithControl(n){const broke=n===1?2:1;currentBid=0;currentBidder=broke;awardPlayer(broke);}
function enableEnterKey(input,action){input.addEventListener("keydown",e=>{if(e.key==="Enter")action();});}

function createAuctionHistoryPanel(){
    const latest=[...auctionHistory].reverse().slice(0,6);
    const rows=latest.length?latest.map(x=>`
      <div class="history-row" style="--row-team:${x.teamColor}">
        <img src="${x.player.image}" alt="${esc(x.player.name)}">
        <div class="history-player"><strong>${esc(x.player.name)}</strong><span>AUCTION ${String(x.auction).padStart(2,"0")} // <b style="color:${x.teamColor}">${esc(x.teamName)}</b></span></div>
        <div class="history-price">${x.price===0?"FREE":"$"+x.price.toLocaleString()}</div>
      </div>`).join(""):`<div class="history-empty">AWAITING FIRST TRANSFER...</div>`;
    return `<section class="auction-history-panel">
      <div class="history-heading"><div><span>TRANSFER DATABASE</span><h3>AUCTION HISTORY</h3></div><b>${String(auctionHistory.length).padStart(2,"0")}</b></div>
      <div class="history-list">${rows}</div>
    </section>`;
}

function renderAuctionScreen(actionHTML){
    auctionContent.innerHTML=`<div class="auction-layout">${createTeamTrackers()}
      <div class="auction-main">${createPlayerCard()}<div class="action-container">${actionHTML}</div></div>
      ${createAuctionHistoryPanel()}</div>`;
}
function updatePlayersRemaining(){playersRemainingDisplay.innerHTML=`<span>${remainingPlayers.length}</span>PLAYERS LEFT`;}
function showOverlay(html){overlayContent.innerHTML=html;gameOverlay.classList.remove("hidden");}
function hideOverlay(){gameOverlay.classList.add("overlay-out");setTimeout(()=>{gameOverlay.classList.add("hidden");gameOverlay.classList.remove("overlay-out");},250);}

function getTeamHistory(n){return auctionHistory.filter(x=>x.teamNumber===n);}
function getMostExpensiveSigning(n){
    const a=getTeamHistory(n); if(!a.length)return null;
    return a.reduce((best,x)=>x.price>best.price?x:best,a[0]);
}
function createFinalTeamCard(team,n){
    const spent=startingBudget-team.budget, expensive=getMostExpensiveSigning(n);
    const roster=team.players.length?team.players.map(p=>`<div class="final-player"><img src="${p.image}" alt="${esc(p.name)}"><span>${esc(p.name)}</span></div>`).join(""):`<div class="history-empty">NO PLAYERS DRAFTED</div>`;
    return `<article class="final-team-card" style="${teamVars(team)}">
      <div class="team-accent"></div>
      <div class="final-team-top"><span>SQUAD // 0${n}</span><h3>${esc(team.name)}</h3></div>
      <div class="final-stats">
        <div><span>PLAYERS</span><strong>${team.players.length}</strong></div>
        <div><span>SPENT</span><strong>$${spent.toLocaleString()}</strong></div>
        <div><span>REMAINING</span><strong>$${team.budget.toLocaleString()}</strong></div>
      </div>
      <div class="biggest-signing"><span>TOP VALUATION</span><strong>${expensive?esc(expensive.player.name):"—"}</strong><b>${expensive?(expensive.price===0?"FREE":"$"+expensive.price.toLocaleString()):"—"}</b></div>
      <div class="final-roster">${roster}</div>
    </article>`;
}
function createFullHistory(){
    if(!auctionHistory.length)return `<div class="history-empty">NO COMPLETED AUCTIONS</div>`;
    return auctionHistory.map(x=>`<div class="final-history-row" style="--row-team:${x.teamColor}">
      <span class="history-number">${String(x.auction).padStart(2,"0")}</span><img src="${x.player.image}" alt="${esc(x.player.name)}">
      <div><strong>${esc(x.player.name)}</strong><span style="color:${x.teamColor}">${esc(x.teamName)}</span></div>
      <b>${x.price===0?"FREE":"$"+x.price.toLocaleString()}</b></div>`).join("");
}
function showAuctionComplete(){
    uiState={screen:"auction",phase:"complete",turn:null};saveGame();
    playersRemainingDisplay.innerHTML="COMPLETE";
    auctionContent.innerHTML=`<div class="complete-screen results-screen">
      <div class="complete-label">BL // FINAL SELECTION REPORT</div>
      <h2>DRAFT <span>COMPLETE</span></h2><p class="results-subtitle">FINAL SQUAD DATA // ${auctionHistory.length} TRANSFERS</p>
      <div class="final-team-grid">${createFinalTeamCard(team1,1)}${createFinalTeamCard(team2,2)}</div>
      <section class="full-history"><div class="history-heading"><div><span>COMPLETE RECORD</span><h3>TRANSFER DATABASE</h3></div><b>${String(auctionHistory.length).padStart(2,"0")}</b></div><div class="full-history-list">${createFullHistory()}</div></section>
      <div class="results-actions">
        <button id="formationBuilderButton" class="primary-button restart-button"><span>BUILD FORMATIONS</span><b>⚽</b></button>
        <button id="restartAuctionButton" class="primary-button restart-button secondary-action"><span>NEW AUCTION</span><b>↻</b></button>
      </div>
    </div>`;
    document.getElementById("formationBuilderButton").addEventListener("click",openFormationBuilder);
    document.getElementById("restartAuctionButton").addEventListener("click",restartAuction);
}
function restartAuction(){
    showConfirm("START A NEW AUCTION","Your current auction and saved progress will be cleared.",()=>{
        clearSavedGame();
        uiState={screen:"setup",phase:"setup",turn:null};
        auctionScreen.classList.add("hidden");formationScreen.classList.add("hidden");setupScreen.classList.remove("hidden");
        auctionContent.innerHTML="";playersRemainingDisplay.innerHTML="";
        saveSetupPreferences();showResumeCard(null);
        window.scrollTo({top:0,behavior:"smooth"});
    });
}


const FORMATIONS = {
 "4-3-3":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:25,y:47,label:"CM"},{x:50,y:53,label:"CM"},{x:75,y:47,label:"CM"},
  {x:18,y:22,label:"LW"},{x:50,y:15,label:"ST"},{x:82,y:22,label:"RW"}],
 "4-4-2":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:16,y:45,label:"LM"},{x:39,y:51,label:"CM"},{x:61,y:51,label:"CM"},{x:84,y:45,label:"RM"},
  {x:37,y:19,label:"ST"},{x:63,y:19,label:"ST"}],
 "4-2-3-1":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:38,y:55,label:"DM"},{x:62,y:55,label:"DM"},
  {x:18,y:34,label:"LW"},{x:50,y:38,label:"AM"},{x:82,y:34,label:"RW"},
  {x:50,y:14,label:"ST"}],
 "3-4-3":[
  {x:50,y:88,label:"GK"},
  {x:25,y:70,label:"CB"},{x:50,y:74,label:"CB"},{x:75,y:70,label:"CB"},
  {x:15,y:48,label:"LM"},{x:39,y:53,label:"CM"},{x:61,y:53,label:"CM"},{x:85,y:48,label:"RM"},
  {x:18,y:22,label:"LW"},{x:50,y:15,label:"ST"},{x:82,y:22,label:"RW"}],
 "3-5-2":[
  {x:50,y:88,label:"GK"},
  {x:25,y:70,label:"CB"},{x:50,y:74,label:"CB"},{x:75,y:70,label:"CB"},
  {x:14,y:47,label:"LWB"},{x:35,y:52,label:"CM"},{x:50,y:43,label:"AM"},{x:65,y:52,label:"CM"},{x:86,y:47,label:"RWB"},
  {x:37,y:18,label:"ST"},{x:63,y:18,label:"ST"}]
};

function openFormationBuilder(){
    uiState={screen:"formation",phase:"formation",turn:null};
    auctionScreen.classList.add("hidden");
    formationScreen.classList.remove("hidden");
    formationTeamNumber=1; activeFormation="4-3-3"; selectedFormationPlayerId=null;
    formationAssignments={1:{},2:{}};
    autoFillFormation(1); autoFillFormation(2);
    renderFormationBuilder();saveGame();
    window.scrollTo({top:0,behavior:"smooth"});
}
function autoFillFormation(n){
    const team=teamByNumber(n), slots=FORMATIONS[activeFormation];
    formationAssignments[n]={};
    team.players.slice(0,11).forEach((p,i)=>formationAssignments[n][i]=p.id);
}
function switchFormationTeam(n){formationTeamNumber=n;selectedFormationPlayerId=null;renderFormationBuilder();saveGame();}
function changeFormation(name){
    activeFormation=name; selectedFormationPlayerId=null;
    autoFillFormation(formationTeamNumber); renderFormationBuilder();saveGame();
}
function getFormationPlayer(n,slotIndex){
    const id=formationAssignments[n][slotIndex];
    return teamByNumber(n).players.find(p=>p.id===id)||null;
}
function assignedIds(n){return new Set(Object.values(formationAssignments[n]).filter(Boolean));}
function clickFormationSlot(slotIndex){
    const n=formationTeamNumber;
    const current=getFormationPlayer(n,slotIndex);
    if(selectedFormationPlayerId){
        const existingSlot=Object.keys(formationAssignments[n]).find(k=>formationAssignments[n][k]===selectedFormationPlayerId);
        if(existingSlot!==undefined) delete formationAssignments[n][existingSlot];
        if(current && existingSlot!==undefined) formationAssignments[n][existingSlot]=current.id;
        formationAssignments[n][slotIndex]=selectedFormationPlayerId;
        selectedFormationPlayerId=null;
    }else if(current){
        selectedFormationPlayerId=current.id;
    }
    renderFormationBuilder();saveGame();
}
function selectBenchPlayer(id){
    if(selectedFormationPlayerId===id) selectedFormationPlayerId=null;
    else selectedFormationPlayerId=id;
    renderFormationBuilder();saveGame();
}
function renderFormationBuilder(){
    const team=teamByNumber(formationTeamNumber);
    const slots=FORMATIONS[activeFormation];
    const used=assignedIds(formationTeamNumber);
    const bench=team.players.filter(p=>!used.has(p.id));
    formationContent.innerHTML=`
      <div class="formation-topbar">
        <div class="formation-team-tabs">
          ${[1,2].map(n=>{const t=teamByNumber(n);return `<button class="${formationTeamNumber===n?"active":""}" style="${teamVars(t)}" onclick="switchFormationTeam(${n})">${esc(t.name)}</button>`}).join("")}
        </div>
        <div class="formation-picker">
          ${Object.keys(FORMATIONS).map(f=>`<button class="${activeFormation===f?"active":""}" onclick="changeFormation('${f}')">${f}</button>`).join("")}
        </div>
      </div>
      <div class="formation-instructions" style="${teamVars(team)}">
        <span>TACTICAL BOARD // ${esc(team.name)}</span>
        <strong>${selectedFormationPlayerId?"PLAYER SELECTED — CLICK A POSITION TO MOVE/SWAP":"CLICK A PLAYER, THEN CLICK ANOTHER POSITION TO SWAP"}</strong>
      </div>
      <div class="formation-layout">
        <div class="football-pitch" style="${teamVars(team)}">
          <div class="pitch-halfway"></div><div class="pitch-circle"></div>
          <div class="penalty-box top"></div><div class="penalty-box bottom"></div>
          ${slots.map((s,i)=>{
             const p=getFormationPlayer(formationTeamNumber,i);
             const selected=p&&p.id===selectedFormationPlayerId;
             return `<button class="formation-slot ${p?"occupied":""} ${selected?"selected":""}" style="left:${s.x}%;top:${s.y}%" onclick="clickFormationSlot(${i})">
                <span class="slot-position">${s.label}</span>
                ${p?`<img src="${p.image}" alt="${esc(p.name)}"><strong>${esc(p.name)}</strong>`:`<span class="empty-slot">+</span>`}
             </button>`;
          }).join("")}
        </div>
        <aside class="bench-panel" style="${teamVars(team)}">
          <div class="bench-heading"><span>RESERVES</span><strong>${bench.length}</strong></div>
          <div class="bench-list">
            ${bench.length?bench.map(p=>`<button class="bench-player ${p.id===selectedFormationPlayerId?"selected":""}" onclick="selectBenchPlayer(${p.id})"><img src="${p.image}" alt="${esc(p.name)}"><span>${esc(p.name)}</span></button>`).join(""):`<div class="history-empty">NO SUBSTITUTES</div>`}
          </div>
        </aside>
      </div>`;
}
document.getElementById("backToResults").addEventListener("click",()=>{
    uiState={screen:"auction",phase:"complete",turn:null};saveGame();
    formationScreen.classList.add("hidden");auctionScreen.classList.remove("hidden");
    window.scrollTo({top:0,behavior:"smooth"});
});

const initialSaved=loadSavedData();
if(initialSaved?.gameActive) showResumeCard(initialSaved);
else restoreSetup(initialSaved);
