// BLUE LOCK AUCTION // VISUAL OVERHAUL

let team1 = { name:"", color:"#19a7ff", budget:0, players:[] };
let team2 = { name:"", color:"#ff315d", budget:0, players:[] };
let bidIncrement = 50, maxPlayers = 15, startingBudget = 15000;
let remainingPlayers = [], currentPlayer = null, currentBid = 0, currentBidder = null;
let startingTeam = null, auctionNumber = 0, auctionHistory = [];
let draftMode = "auction";
let selectedPlayerIds = new Set(players.map(player => player.id));
const SAVE_KEY="blAuctionSaveV2";
let uiState={screen:"setup",phase:"setup",turn:null};
let pendingConfirmAction=null;
let soundEnabled=localStorage.getItem("blAuctionSound")!=="off";
let audioCtx=null;

function ensureAudio(){
    if(!soundEnabled)return null;
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return null;
    if(!audioCtx) audioCtx=new AudioContextClass();
    if(audioCtx.state==="suspended")audioCtx.resume();
    return audioCtx;
}
function tone(freq=440,duration=.08,type="sine",volume=.035,delay=0){
    const ctx=ensureAudio();if(!ctx)return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    const t=ctx.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+duration);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+duration+.02);
}
function playSfx(name){
    if(!soundEnabled)return;
    if(name==="reveal"){tone(180,.08,"sawtooth",.025);tone(360,.11,"square",.018,.07);}
    if(name==="bid"){tone(520,.055,"square",.025);tone(700,.06,"square",.018,.045);}
    if(name==="pass"){tone(230,.09,"sine",.025);tone(160,.12,"sine",.018,.06);}
    if(name==="error"){tone(145,.11,"sawtooth",.025);tone(115,.15,"square",.018,.08);}
    if(name==="sold"){tone(220,.08,"sawtooth",.025);tone(440,.1,"square",.025,.07);tone(880,.18,"sine",.03,.15);}
}
function updateSoundButton(){
    document.querySelectorAll("#soundToggle,[data-sound-toggle]").forEach(b=>{
        b.classList.toggle("muted",!soundEnabled);
        const label=b.querySelector("strong");if(label)label.textContent=soundEnabled?"SFX":"MUTED";
        const icon=b.querySelector(".sound-icon");if(icon)icon.textContent=soundEnabled?"◖))":"◖×";
    });
}
function toggleSound(){
    soundEnabled=!soundEnabled;localStorage.setItem("blAuctionSound",soundEnabled?"on":"off");updateSoundButton();
    if(soundEnabled)playSfx("bid");
}
document.getElementById("soundToggle").addEventListener("click",toggleSound);
document.querySelectorAll("[data-sound-toggle]").forEach(b=>b.addEventListener("click",toggleSound));
updateSoundButton();

function triggerFx(type,text=""){
    const layer=document.getElementById("fxLayer");
    if(type==="bid"){
        const el=document.getElementById("bidFlash");el.classList.remove("go");void el.offsetWidth;el.classList.add("go");
    }
    if(type==="sold"){
        const el=document.getElementById("soldBurst");el.textContent=text||"SOLD";el.classList.remove("go");void el.offsetWidth;el.classList.add("go");
    }
}

const menuScreen = document.getElementById("menu-screen");
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
let formationByTeam = { 1:"4-3-3", 2:"4-3-3" };
let formationAssignments = { 1: {}, 2: {} };
let selectedFormationPlayerId = null;
let benchCollapsed = false;
let draggedFormationPlayerId = null;
let formationInitialized = false;

document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("randomDraftGame").addEventListener("click", startRandomDraft);
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
    playSfx("error");
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

function playerStats(player){return player?.stats||{ovr:70,off:70,sho:70,spd:70,def:70,pas:70,dri:70,gk:40};}
function effectiveOVR(player, slotLabel){
    const s = playerStats(player);

    if(slotLabel === "GK"){
        return s.gk;
    }

    if(primaryFit(player, slotLabel)){
        return s.ovr;
    }

    if(canonicalFit(player, slotLabel)){
        return Math.max(1, s.ovr - 2);
    }

    return Math.max(1, s.ovr - 12);
}
function statStrip(player,compact=false){
    const s=playerStats(player);
    return `<div class="stat-strip ${compact?"compact":""}">
      <b><i>OVR</i>${s.ovr}</b><span><i>OFF</i>${s.off}</span><span><i>SHO</i>${s.sho}</span>
      <span><i>SPD</i>${s.spd}</span><span><i>DEF</i>${s.def}</span><span><i>PAS</i>${s.pas}</span>
      <span><i>DRI</i>${s.dri}</span><span><i>GK</i>${s.gk}</span>
    </div>`;
}
function squadRatings(teamNumber){
    const team = teamByNumber(teamNumber);

    const assignments =
        formationAssignments[teamNumber] || {};

    const formation =
        formationByTeam[teamNumber] || "4-3-3";

    const shape = FORMATIONS[formation] || FORMATIONS["4-3-3"];

    const placed = Object.entries(assignments)
        .map(([slot, id]) => {
            const player = team.players.find(p => p.id === id);
            const slotData = shape[Number(slot)];

            if(!player || !slotData){
                return null;
            }

            return {
                player,
                label: slotData.label,
                ovr: effectiveOVR(player, slotData.label)
            };
        })
        .filter(Boolean);

    if(!placed.length){
        return {
            ovr: 0,
            att: 0,
            mid: 0,
            def: 0
        };
    }

    const average = values =>
        Math.round(
            values.reduce((sum, value) => sum + value, 0) /
            Math.max(1, values.length)
        );

    const attack = placed.filter(x =>
        ["ST","CF","LW","RW","AM"].includes(x.label)
    );

    const midfield = placed.filter(x =>
        ["CM","DM","AM","LM","RM","LWB","RWB"].includes(x.label)
    );

    const defence = placed.filter(x =>
        ["GK","CB","LB","RB","LWB","RWB","DM"].includes(x.label)
    );

    return {
        ovr: average(placed.map(x => x.ovr)),
        att: average(
            (attack.length ? attack : placed).map(x => x.ovr)
        ),
        mid: average(
            (midfield.length ? midfield : placed).map(x => x.ovr)
        ),
        def: average(
            (defence.length ? defence : placed).map(x => x.ovr)
        )
    };
}

function playerPositions(player){return Array.isArray(player?.positions)&&player.positions.length?player.positions:["FW"];}
function primaryPosition(player){return player?.primaryPosition||playerPositions(player)[0]||"FW";}
function slotMatchesRole(slot,role){
    const map={
        GK:["GK"],
        CB:["CB","DF"], LB:["LB","LWB","WB","DF"], RB:["RB","RWB","WB","DF"],
        LWB:["LWB","WB","LB","LM"], RWB:["RWB","WB","RB","RM"],
        DM:["DM","CM"], CM:["CM","DM","AM"], AM:["AM","CM","SS"],
        LM:["LM","LW","WM","LWB"], RM:["RM","RW","WM","RWB"],
        LW:["LW","LM","WM","FW"], RW:["RW","RM","WM","FW"],
        ST:["CF","ST","FW","SS"], CF:["CF","ST","FW","SS"]
    };
    return (map[slot]||[slot]).includes(role);
}
function canonicalFit(player,slotLabel){
    return playerPositions(player).some(role=>slotMatchesRole(slotLabel,role));
}
function primaryFit(player,slotLabel){
    return slotMatchesRole(slotLabel,primaryPosition(player));
}
function positionBadges(player,compact=false){
    return `<span class="position-badges ${compact?"compact":""}">${playerPositions(player).map(pos=>`<i class="${pos===primaryPosition(player)?"primary":""}">${pos}</i>`).join("")}</span>`;
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


const GAME_MODES={
    quick:{budget:5000,increment:50,maxPlayers:5},
    standard:{budget:11000,increment:50,maxPlayers:11},
    full:{budget:15000,increment:50,maxPlayers:15}
};

function setVisibleScreen(screen){
    [menuScreen,setupScreen,auctionScreen,formationScreen].forEach(el=>el&&el.classList.add("hidden"));
    if(screen)screen.classList.remove("hidden");
    window.scrollTo({top:0,behavior:"smooth"});
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
    if(uiState.screen==="auction"||uiState.screen==="formation")saveGame();
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
          <div class="info-section"><span>PROJECT</span><h3>BLUE LOCK AUCTION</h3>
          <p>A local two-player auction team builder developed by <strong>hammydanny</strong>, with the support of <strong>syaafibwn</strong>. Draft a custom player pool, compete for every signing, then arrange your finished squads in the formation builder.</p></div>
          <div class="info-section"><span>STATUS</span><h3>UNOFFICIAL FAN PROJECT</h3>
          <p>This is a non-commercial fan-made project. It is not affiliated with, endorsed by, or sponsored by the creators, publishers, licensors, or rights holders of Blue Lock. Blue Lock and related characters and imagery belong to their respective rights holders.</p></div>`;
    }else{
        code.textContent="BL // AUCTION PROTOCOL";
        title.textContent="HOW TO PLAY";
        body.innerHTML=`
          <div class="rule-grid">
            <div class="rule"><b>01</b><span>SET UP</span><p>Name both teams, choose colors, budget, bid interval, roster size and the characters in the player pool.</p></div>
            <div class="rule"><b>02</b><span>OPENING BID</span><p>A coin flip chooses who opens first. Opening responsibility alternates every player. The opener chooses any valid amount within their budget.</p></div>
            <div class="rule"><b>03</b><span>BID OR PASS</span><p>Teams take turns. A new bid must beat the current bid, fit the configured interval, and stay within that team's remaining budget.</p></div>
            <div class="rule"><b>04</b><span>WIN PLAYER</span><p>Passing ends the auction and the current highest bidder signs the player. Their winning bid is deducted from their budget.</p></div>
            <div class="rule"><b>05</b><span>ZERO BUDGET</span><p>If the opening side has no money, the funded team controls the decision: buy the player or pass and release them to the zero-budget team for free.</p></div>
            <div class="rule"><b>06</b><span>FULL ROSTER</span><p>Once one team reaches its roster limit, future players are automatically assigned to the other team until both squads are complete.</p></div>
            <div class="rule"><b>07</b><span>FORMATION</span><p>After the draft, compare both squads and build formations using the players each team won.</p></div>
            <div class="rule"><b>08</b><span>AUTOSAVE</span><p>Your active auction is stored locally in this browser. Return to the main menu and use Resume Auction to continue.</p></div>
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

function applyGameMode(mode){
    const data=GAME_MODES[mode];
    document.querySelectorAll("[data-game-mode]").forEach(b=>b.classList.toggle("active",b.dataset.gameMode===mode));
    if(!data)return;
    document.getElementById("budget").value=data.budget;
    document.getElementById("bidIncrement").value=data.increment;
    document.getElementById("maxPlayers").value=data.maxPlayers;
    updatePoolStatus();
    saveSetupPreferences();
}
document.querySelectorAll("[data-game-mode]").forEach(button=>{
    button.addEventListener("click",()=>applyGameMode(button.dataset.gameMode));
});
["budget","bidIncrement","maxPlayers"].forEach(id=>{
    document.getElementById(id).addEventListener("input",()=>{
        const matched=Object.entries(GAME_MODES).find(([,m])=>
            Number(document.getElementById("budget").value)===m.budget &&
            Number(document.getElementById("bidIncrement").value)===m.increment &&
            Number(document.getElementById("maxPlayers").value)===m.maxPlayers
        );
        document.querySelectorAll("[data-game-mode]").forEach(b=>b.classList.toggle("active",matched?b.dataset.gameMode===matched[0]:b.dataset.gameMode==="custom"));
    });
});

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
            gameActive:true,uiState,startingBudget,bidIncrement,maxPlayers,startingTeam,auctionNumber,currentBid,currentBidder,draftMode,
            currentPlayerId:currentPlayer?.id??null,
            remainingPlayerIds:serializePlayerList(remainingPlayers),
            selectedPlayerIds:[...selectedPlayerIds],
            team1:{...team1,players:serializePlayerList(team1.players)},
            team2:{...team2,players:serializePlayerList(team2.players)},
            auctionHistory:auctionHistory.map(x=>({...x,playerId:x.player.id,player:undefined})),
            formationTeamNumber,activeFormation,formationByTeam,formationAssignments,benchCollapsed,formationInitialized
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
    draftMode=saved.draftMode==="random"?"random":"auction";
    auctionNumber=saved.auctionNumber;currentBid=saved.currentBid;currentBidder=saved.currentBidder;
    currentPlayer=players.find(p=>p.id===saved.currentPlayerId)||null;
    remainingPlayers=hydratePlayers(saved.remainingPlayerIds);
    selectedPlayerIds=new Set(saved.selectedPlayerIds||players.map(p=>p.id));
    team1={...saved.team1,players:hydratePlayers(saved.team1?.players)};
    team2={...saved.team2,players:hydratePlayers(saved.team2?.players)};
    auctionHistory=(saved.auctionHistory||[]).map(x=>({...x,player:players.find(p=>p.id===x.playerId)})).filter(x=>x.player);
    formationTeamNumber=saved.formationTeamNumber||1;
    formationByTeam=saved.formationByTeam||{1:saved.activeFormation||"4-3-3",2:saved.activeFormation||"4-3-3"};
    activeFormation=formationByTeam[formationTeamNumber]||"4-3-3";
    formationAssignments=saved.formationAssignments||{1:{},2:{}};
    benchCollapsed=!!saved.benchCollapsed;formationInitialized=!!saved.formationInitialized;
    uiState=saved.uiState||{screen:"auction",phase:"opening",turn:null};
    menuScreen.classList.add("hidden");setupScreen.classList.add("hidden");formationScreen.classList.add("hidden");auctionScreen.classList.remove("hidden");
    updatePlayersRemaining();
    resumeCurrentView();
}
function resumeCurrentView(){
    if(uiState.screen==="formation"){auctionScreen.classList.add("hidden");formationScreen.classList.remove("hidden");renderFormationBuilder();return;}
    if(uiState.phase==="complete"){showAuctionComplete();return;}
    if(!currentPlayer){startNextAuction();return;}
    if(uiState.phase==="bidding"){displayBiddingTurn(uiState.turn);return;}
    if(uiState.phase==="zero"){displayZeroBudgetChoice(uiState.turn);return;}
    if(uiState.phase==="forced"){showForcedAssignment(uiState.turn,true);return;}
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
    formationInitialized=false;formationAssignments={1:{},2:{}};formationByTeam={1:"4-3-3",2:"4-3-3"};
    bidIncrement=setup.bidIncrement;maxPlayers=setup.maxPlayers;startingBudget=setup.budget;
    team1={name:setup.n1,color:document.getElementById("team1Color").value,budget:setup.budget,players:[]};
    team2={name:setup.n2,color:document.getElementById("team2Color").value,budget:setup.budget,players:[]};
    remainingPlayers=[...setup.selectedPlayers];auctionHistory=[];auctionNumber=0;
    currentPlayer=null;currentBid=0;currentBidder=null;
}
function startGame(){
    const setup=getValidatedSetup();if(!setup)return;
    resetDraftState(setup);draftMode="auction";startingTeam=Math.random()<.5?1:2;
    uiState={screen:"auction",phase:"coin",turn:null};saveGame();
    setupScreen.classList.add("hidden");auctionScreen.classList.remove("hidden");
    updatePlayersRemaining();showCoinFlip();
}
function shufflePlayers(list){
    const shuffled=[...list];
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
    return shuffled;
}
function startRandomDraft(){
    const setup = getValidatedSetup();
    if(!setup) return;

    resetDraftState(setup);
    draftMode = "random";

    // Shuffle the selected pool, then split it between the two teams.
    const shuffled = shufflePlayers(setup.selectedPlayers);

    const requiredPerTeam = maxPlayers;

    team1.players = shuffled.slice(0, requiredPerTeam);
    team2.players = shuffled.slice(requiredPerTeam, requiredPerTeam * 2);

    // Any players beyond the two completed rosters remain unused.
    remainingPlayers = shuffled.slice(requiredPerTeam * 2);

    // Record the randomized draft in a true pick-by-pick order.
    auctionHistory = [];

    for(let i = 0; i < requiredPerTeam; i++){
        const player1 = team1.players[i];
        if(player1){
            auctionHistory.push({
                auction: i + 1,
                player: player1,
                teamNumber: 1,
                teamName: team1.name,
                teamColor: team1.color,
                price: 0,
                randomDraft: true
            });
        }

        const player2 = team2.players[i];
        if(player2){
            auctionHistory.push({
                auction: i + 1,
                player: player2,
                teamNumber: 2,
                teamName: team2.name,
                teamColor: team2.color,
                price: 0,
                randomDraft: true
            });
        }
    }

    auctionNumber = auctionHistory.length;

    currentPlayer = null;
    currentBid = 0;
    currentBidder = null;
    startingTeam = null;

    // Start with completely empty formation assignments.
    formationInitialized = false;
    formationByTeam = {
        1: "4-3-3",
        2: "4-3-3"
    };
    formationAssignments = {
        1: {},
        2: {}
    };

    uiState = {
        screen: "auction",
        phase: "complete",
        turn: null
    };

    setupScreen.classList.add("hidden");
    formationScreen.classList.add("hidden");
    auctionScreen.classList.remove("hidden");

    updatePlayersRemaining();
    showAuctionComplete();
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
      <div class="reveal-image"><img src="${currentPlayer.image}" alt="${esc(currentPlayer.name)}"></div>
      <div class="overlay-eyebrow">AUTOMATIC ASSIGNMENT</div>
      <h2>${esc(currentPlayer.name)}</h2>
      <p><strong style="color:${fullTeam.color}">${esc(fullTeam.name)}</strong> HAS FILLED ITS ROSTER</p>
      <div class="forced-destination" style="${teamVars(team)}">ASSIGNED TO <strong>${esc(team.name)}</strong></div>`);
    const delay=resuming?500:1500;
    setTimeout(()=>{hideOverlay();setTimeout(()=>{
        if(currentPlayer && !isTeamFull(teamNumber)) awardPlayerFree(teamNumber,true);
        else if(isTeamFull(1)&&isTeamFull(2)) showAuctionComplete();
    },260);},delay);
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
        <h2 style="color:${winner.color}">${esc(winner.name)}</h2>
        <div class="winning-price">FREE</div>
        <button id="nextPlayerButton" class="primary-button team-action"><span>NEXT PLAYER</span><b>→</b></button>
      </div>`);
    document.getElementById("nextPlayerButton").addEventListener("click",startNextAuction);
}

function showPlayerReveal(){
    playSfx("reveal");
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
        <div class="player-card-name">${esc(currentPlayer.name)}</div>${positionBadges(currentPlayer)}${statStrip(currentPlayer)}
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
    const forcedTeam=onlyTeamWithSpace();
    if(forcedTeam){awardPlayerFree(forcedTeam,true);return;}
    const bid=Number(document.getElementById("openingBid").value), starter=teamByNumber(startingTeam);
    if(!validateBid(bid,starter,0)) return;
    currentBid=bid; currentBidder=startingTeam;
    playSfx("bid");triggerFx("bid");
    const other=startingTeam===1?2:1;
    if(teamByNumber(other).budget===0){awardPlayer(startingTeam);return;}
    displayBiddingTurn(other);
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
    currentBid=bid; currentBidder=n;
    playSfx("bid");triggerFx("bid");
    displayBiddingTurn(n===1?2:1);
}
function validateBid(bid,team,minimum){
    if(bid<=minimum){showSiteError(minimum===0?"Please enter a valid bid.":`Your bid must be higher than $${minimum.toLocaleString()}.`,"BID REJECTED");return false;}
    if(bid%bidIncrement!==0){showSiteError(`Bids must be in intervals of $${bidIncrement}.`,"INVALID BID INTERVAL");return false;}
    if(bid>team.budget){showSiteError(`${team.name} only has $${team.budget.toLocaleString()} remaining.`,"INSUFFICIENT BUDGET");return false;}
    if(team.players.length>=maxPlayers){showSiteError(`${team.name}'s roster is full.`,"ROSTER FULL");return false;}
    return true;
}
function passBid(){playSfx("pass");awardPlayer(currentBidder);}

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
    currentBid=bid;currentBidder=n;playSfx("bid");triggerFx("bid");awardPlayer(n);
}
function passWithControl(n){playSfx("pass");const broke=n===1?2:1;currentBid=0;currentBidder=broke;awardPlayer(broke);}
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
    auctionContent.classList.remove("auction-enter");void auctionContent.offsetWidth;auctionContent.classList.add("auction-enter");
    auctionContent.innerHTML=`<div class="auction-layout">${createTeamTrackers()}
      <div class="auction-main">${createPlayerCard()}<div class="action-container">${actionHTML}</div></div>
      ${createAuctionHistoryPanel()}</div>`;
}
function updatePlayersRemaining(){
    playersRemainingDisplay.innerHTML=`<span>${remainingPlayers.length}</span>PLAYERS LEFT`;
    playersRemainingDisplay.classList.remove("counter-pop");void playersRemainingDisplay.offsetWidth;playersRemainingDisplay.classList.add("counter-pop");
}
function showOverlay(html){overlayContent.innerHTML=html;gameOverlay.classList.remove("hidden");}
function hideOverlay(){gameOverlay.classList.add("overlay-out");setTimeout(()=>{gameOverlay.classList.add("hidden");gameOverlay.classList.remove("overlay-out");},250);}

function getTeamHistory(n){return auctionHistory.filter(x=>x.teamNumber===n);}
function getMostExpensiveSigning(n){
    const a=getTeamHistory(n); if(!a.length)return null;
    return a.reduce((best,x)=>x.price>best.price?x:best,a[0]);
}
function createFinalTeamCard(team, n){
    const spent = startingBudget - team.budget;
    const expensive = getMostExpensiveSigning(n);

    const roster = team.players.length
        ? team.players.map(p => {
            const stats = playerStats(p);

            return `
                <div class="final-player">
                    <img src="${p.image}" alt="${esc(p.name)}">
                    <span>${esc(p.name)}</span>
                    ${positionBadges(p, true)}
                    <em class="effective-ovr">${stats.ovr}</em>
                </div>
            `;
        }).join("")
        : `<div class="history-empty">NO PLAYERS DRAFTED</div>`;

    return `
        <article class="final-team-card" style="${teamVars(team)}">
            <div class="team-accent"></div>

            <div class="final-team-top">
                <span>SQUAD // 0${n}</span>
                <h3>${esc(team.name)}</h3>
            </div>

            <div class="final-stats">
                <div>
                    <span>PLAYERS</span>
                    <strong>${team.players.length}</strong>
                </div>

                <div>
                    <span>SPENT</span>
                    <strong>$${spent.toLocaleString()}</strong>
                </div>

                <div>
                    <span>REMAINING</span>
                    <strong>$${team.budget.toLocaleString()}</strong>
                </div>
            </div>

            <div class="biggest-signing">
                <span>TOP VALUATION</span>
                <strong>${expensive ? esc(expensive.player.name) : "—"}</strong>
                <b>
                    ${
                        expensive
                            ? (expensive.price === 0
                                ? "FREE"
                                : "$" + expensive.price.toLocaleString())
                            : "—"
                    }
                </b>
            </div>

            <div class="final-roster">
                ${roster}
            </div>
        </article>
    `;
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
      <div class="results-actions results-actions-top">
        <button id="formationBuilderButton" class="primary-button restart-button"><span>TEAM BUILDER</span><b>⚽</b></button>
        <button id="shareResultsButton" class="primary-button restart-button share-action"><span>SHARE / SAVE RESULT</span><b>↗</b></button>
        <button id="restartAuctionButton" class="primary-button restart-button secondary-action"><span>NEW AUCTION</span><b>↻</b></button>
      </div>
      <div class="final-team-grid">${createFinalTeamCard(team1,1)}${createFinalTeamCard(team2,2)}</div>
      <section class="full-history"><div class="history-heading"><div><span>COMPLETE RECORD</span><h3>TRANSFER DATABASE</h3></div><b>${String(auctionHistory.length).padStart(2,"0")}</b></div><div class="full-history-list">${createFullHistory()}</div></section>
    </div>`;
    document.getElementById("formationBuilderButton").addEventListener("click",openFormationBuilder);
    document.getElementById("shareResultsButton").addEventListener("click",openShareScreen);
    document.getElementById("restartAuctionButton").addEventListener("click",restartAuction);
}
function createShareTeam(team,n){
    const spent=startingBudget-team.budget,formation=formationByTeam[n]||"4-3-3";
    const slots=FORMATIONS[formation]||FORMATIONS["4-3-3"];
    const arranged=slots.map((slot,i)=>({slot,player:getFormationPlayer(n,i)})).filter(x=>x.player);
    const list=arranged.length?arranged.map(x=>({p:x.player,pos:x.slot.label})):team.players.map(p=>({p,pos:"RES"}));
    return `<article class="share-team" style="${teamVars(team)}">
      <div class="share-team-head"><div><span>SQUAD 0${n} // ${arranged.length?formation:"DRAFTED ROSTER"}</span><h3>${esc(team.name)}</h3></div><b>${team.players.length}</b></div>
      <div class="share-money"><div><span>SPENT</span><strong>$${spent.toLocaleString()}</strong></div><div><span>REMAINING</span><strong>$${team.budget.toLocaleString()}</strong></div></div>
      <div class="share-lineup">${list.map(x=>`<div class="share-player"><span>${x.pos}</span><img src="${x.p.image}" alt=""><strong>${esc(x.p.name)}</strong>${positionBadges(x.p,true)}</div>`).join("")}</div>
    </article>`;
}
function openShareScreen(){
    document.getElementById("shareScreen")?.remove();
    const screen=document.createElement("section");screen.id="shareScreen";screen.className="share-screen";
    screen.innerHTML=`<div class="share-shell">
      <div class="share-toolbar"><button id="closeShareScreen">← RESULTS</button><div><button id="copyShareSummary">COPY SUMMARY</button><button id="printShareResult">SAVE / PRINT</button></div></div>
      <div id="shareCard" class="share-card">
        <div class="share-card-top"><div><span>BL // FINAL MATCHUP REPORT</span><h2>BLUE LOCK <b>AUCTION</b></h2></div><strong>FINAL</strong></div>
        <div class="share-versus"><span>${esc(team1.name)}</span><b>VS</b><span>${esc(team2.name)}</span></div>
        <div class="share-team-grid">${createShareTeam(team1,1)}${createShareTeam(team2,2)}</div>
        <div class="share-card-footer"><span>DEVELOPED BY <b>HAMMYDANNY</b> // WITH THE SUPPORT OF <b>SYAAFIBWN</b></span><span>UNOFFICIAL FAN PROJECT // 2026</span></div>
      </div></div>`;
    document.body.appendChild(screen);
    document.getElementById("closeShareScreen").onclick=()=>screen.remove();
    document.getElementById("printShareResult").onclick=()=>window.print();
    document.getElementById("copyShareSummary").onclick=copyShareSummary;
}
async function copyShareSummary(){
    const names=t=>t.players.map(p=>p.name).join(", ");
    const text=`BLUE LOCK AUCTION // FINAL RESULT\n${team1.name}: ${names(team1)}\n${team2.name}: ${names(team2)}\n\nDeveloped by hammydanny // With the support of syaafibwn`;
    try{await navigator.clipboard.writeText(text);const b=document.getElementById("copyShareSummary");b.textContent="COPIED ✓";setTimeout(()=>b.textContent="COPY SUMMARY",1400);}
    catch(e){showSiteError("Your browser blocked clipboard access. Use SAVE / PRINT instead.","SHARE ERROR");}
}
function restartAuction(){
    showConfirm("START A NEW AUCTION","Your current auction and saved progress will be cleared.",()=>{
        clearSavedGame();
        uiState={screen:"setup",phase:"setup",turn:null};
        auctionScreen.classList.add("hidden");formationScreen.classList.add("hidden");setupScreen.classList.remove("hidden");
        auctionContent.innerHTML="";playersRemainingDisplay.innerHTML="";
        saveSetupPreferences();showResumeCard(null);refreshMainMenu();
        window.scrollTo({top:0,behavior:"smooth"});
    });
}


const FORMATIONS = {
 "4-3-3":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:25,y:47,label:"CM"},{x:50,y:53,label:"CM"},{x:75,y:47,label:"CM"},
  {x:18,y:22,label:"LW"},{x:50,y:15,label:"ST"},{x:82,y:22,label:"RW"}],
 "4-2-3-1":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:38,y:55,label:"DM"},{x:62,y:55,label:"DM"},
  {x:18,y:34,label:"LW"},{x:50,y:38,label:"AM"},{x:82,y:34,label:"RW"},
  {x:50,y:14,label:"ST"}],
 "4-4-2":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:16,y:45,label:"LM"},{x:39,y:51,label:"CM"},{x:61,y:51,label:"CM"},{x:84,y:45,label:"RM"},
  {x:37,y:19,label:"ST"},{x:63,y:19,label:"ST"}],
 "4-1-3-2":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:50,y:57,label:"DM"},
  {x:20,y:39,label:"LM"},{x:50,y:42,label:"AM"},{x:80,y:39,label:"RM"},
  {x:37,y:17,label:"ST"},{x:63,y:17,label:"ST"}],
 "4-3-2-1":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:27,y:51,label:"CM"},{x:50,y:56,label:"DM"},{x:73,y:51,label:"CM"},
  {x:36,y:31,label:"AM"},{x:64,y:31,label:"AM"},
  {x:50,y:13,label:"ST"}],
 "3-4-3":[
  {x:50,y:88,label:"GK"},
  {x:25,y:70,label:"CB"},{x:50,y:74,label:"CB"},{x:75,y:70,label:"CB"},
  {x:15,y:48,label:"LM"},{x:39,y:53,label:"CM"},{x:61,y:53,label:"CM"},{x:85,y:48,label:"RM"},
  {x:18,y:22,label:"LW"},{x:50,y:15,label:"ST"},{x:82,y:22,label:"RW"}],
 "3-5-2":[
  {x:50,y:88,label:"GK"},
  {x:25,y:70,label:"CB"},{x:50,y:74,label:"CB"},{x:75,y:70,label:"CB"},
  {x:14,y:47,label:"LWB"},{x:35,y:52,label:"CM"},{x:50,y:43,label:"AM"},{x:65,y:52,label:"CM"},{x:86,y:47,label:"RWB"},
  {x:37,y:18,label:"ST"},{x:63,y:18,label:"ST"}],
 "3-4-2-1":[
  {x:50,y:88,label:"GK"},
  {x:25,y:70,label:"CB"},{x:50,y:74,label:"CB"},{x:75,y:70,label:"CB"},
  {x:15,y:50,label:"LWB"},{x:40,y:54,label:"CM"},{x:60,y:54,label:"CM"},{x:85,y:50,label:"RWB"},
  {x:36,y:31,label:"AM"},{x:64,y:31,label:"AM"},
  {x:50,y:13,label:"ST"}],
 "5-3-2":[
  {x:50,y:91,label:"GK"},
  {x:10,y:62,label:"LWB"},{x:29,y:66,label:"CB"},{x:50,y:68,label:"CB"},{x:71,y:66,label:"CB"},{x:90,y:62,label:"RWB"},
  {x:27,y:48,label:"CM"},{x:50,y:53,label:"DM"},{x:73,y:48,label:"CM"},
  {x:37,y:18,label:"ST"},{x:63,y:18,label:"ST"}],
 "5-2-3":[
  {x:50,y:91,label:"GK"},
  {x:10,y:62,label:"LWB"},{x:29,y:66,label:"CB"},{x:50,y:68,label:"CB"},{x:71,y:66,label:"CB"},{x:90,y:62,label:"RWB"},
  {x:39,y:49,label:"CM"},{x:61,y:49,label:"CM"},
  {x:18,y:22,label:"LW"},{x:50,y:15,label:"ST"},{x:82,y:22,label:"RW"}]
};

function openFormationBuilder(){
    uiState={screen:"formation",phase:"formation",turn:null};
    auctionScreen.classList.add("hidden");
    formationScreen.classList.remove("hidden");
    selectedFormationPlayerId=null;
    if(!formationByTeam || typeof formationByTeam!=="object") formationByTeam={1:"4-3-3",2:"4-3-3"};
    [1,2].forEach(n=>{if(!formationByTeam[n]||!FORMATIONS[formationByTeam[n]])formationByTeam[n]="4-3-3";});
    if(!formationInitialized){
        formationTeamNumber=1;formationByTeam={1:"4-3-3",2:"4-3-3"};formationAssignments={1:{},2:{}};
        formationInitialized=true;
    }else [1,2].forEach(n=>sanitizeFormationAssignments(n));
    activeFormation=formationByTeam[formationTeamNumber]||"4-3-3";
    renderFormationBuilder();saveGame();
    window.scrollTo({top:0,behavior:"smooth"});
}
function autoFillFormation(n){
    const team=teamByNumber(n);
    const formation=formationByTeam[n]||"4-3-3";
    const slots=FORMATIONS[formation];
    formationAssignments[n]={};
    team.players.slice(0,Math.min(11,slots.length)).forEach((p,i)=>formationAssignments[n][i]=p.id);
}
function sanitizeFormationAssignments(n){
    const teamIds=new Set(teamByNumber(n).players.map(p=>p.id));
    const slots=FORMATIONS[formationByTeam[n]||"4-3-3"];
    const clean={},seen=new Set();
    Object.entries(formationAssignments[n]||{}).forEach(([slot,id])=>{
        const i=Number(slot);
        if(i>=0 && i<slots.length && teamIds.has(id) && !seen.has(id)){clean[i]=id;seen.add(id);}
    });
    formationAssignments[n]=clean;
}
function switchFormationTeam(n){
    formationTeamNumber=n;
    activeFormation=formationByTeam[n]||"4-3-3";
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function changeFormation(name){
    if(!FORMATIONS[name])return;
    const n=formationTeamNumber;
    const previous={...(formationAssignments[n]||{})};
    formationByTeam[n]=name;activeFormation=name;selectedFormationPlayerId=null;
    const slotCount=FORMATIONS[name].length,preserved={};
    Object.entries(previous).forEach(([slot,id])=>{
        const i=Number(slot);
        if(Number.isInteger(i)&&i>=0&&i<slotCount)preserved[i]=id;
    });
    formationAssignments[n]=preserved;
    sanitizeFormationAssignments(n);
    renderFormationBuilder();saveGame();
}
function resetCurrentFormation(){
    formationAssignments[formationTeamNumber]={};
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function toggleBench(){
    benchCollapsed=!benchCollapsed;
    renderFormationBuilder();saveGame();
}
function getFormationPlayer(n,slotIndex){
    const id=formationAssignments[n][slotIndex];
    return teamByNumber(n).players.find(p=>p.id===id)||null;
}
function assignedIds(n){return new Set(Object.values(formationAssignments[n]).filter(Boolean));}
function movePlayerToSlot(playerId,slotIndex){
    const n=formationTeamNumber;
    const team=teamByNumber(n);

    if(!team.players.some(p=>p.id===playerId)) return;

    const targetPlayer=getFormationPlayer(n,slotIndex);

    const sourceSlot=Object.keys(
        formationAssignments[n]
    ).find(
        k => formationAssignments[n][k]===playerId
    );

    if(sourceSlot!==undefined){
        delete formationAssignments[n][sourceSlot];
    }

    if(targetPlayer && targetPlayer.id!==playerId){
        if(sourceSlot!==undefined){
            formationAssignments[n][sourceSlot]=targetPlayer.id;
        }
    }

    formationAssignments[n][slotIndex]=playerId;

    selectedFormationPlayerId=playerId;

    renderFormationBuilder();
    saveGame();
}
function movePlayerToBench(playerId){
    const n=formationTeamNumber;
    const sourceSlot=Object.keys(formationAssignments[n]).find(k=>formationAssignments[n][k]===playerId);
    if(sourceSlot!==undefined) delete formationAssignments[n][sourceSlot];
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function clickFormationSlot(slotIndex){
    const n=formationTeamNumber;
    const current=getFormationPlayer(n,slotIndex);
    if(selectedFormationPlayerId){
        movePlayerToSlot(selectedFormationPlayerId,slotIndex);
    }else if(current){
        selectedFormationPlayerId=current.id;
        renderFormationBuilder();saveGame();
    }
}
function selectBenchPlayer(id){
    if(selectedFormationPlayerId===id) selectedFormationPlayerId=null;
    else selectedFormationPlayerId=id;
    renderFormationBuilder();saveGame();
}
function updateLiveFormationTargets(playerId){
    const player=teamByNumber(formationTeamNumber).players.find(p=>p.id===playerId);
    document.querySelectorAll(".formation-slot").forEach(slot=>{
        slot.classList.remove("drag-canonical-target","drag-primary-target");
        if(!player)return;
        const label=slot.dataset.slotLabel;
        if(canonicalFit(player,label))slot.classList.add("drag-canonical-target");
        if(primaryFit(player,label))slot.classList.add("drag-primary-target");
    });
    const hint=document.querySelector(".formation-instructions strong");
    if(hint&&player)hint.innerHTML=`${esc(player.name)} // PRIMARY: ${primaryPosition(player)} // BEST FITS GLOWING ON PITCH`;
}
function clearLiveFormationTargets(){
    document.querySelectorAll(".formation-slot").forEach(slot=>slot.classList.remove("drag-canonical-target","drag-primary-target"));
}
function startFormationDrag(event,id){
    draggedFormationPlayerId=id;
    selectedFormationPlayerId=id;
    event.dataTransfer.effectAllowed="move";
    event.dataTransfer.setData("text/plain",String(id));
    updateLiveFormationTargets(id);
    requestAnimationFrame(()=>event.currentTarget.classList.add("dragging"));
}
function endFormationDrag(event){
    event.currentTarget.classList.remove("dragging");
    clearLiveFormationTargets();
    draggedFormationPlayerId=null;
}
function allowFormationDrop(event){
    event.preventDefault();
    event.dataTransfer.dropEffect="move";
    event.currentTarget.classList.add("drag-over");
}
function leaveFormationDrop(event){event.currentTarget.classList.remove("drag-over");}
function dropOnFormationSlot(event,slotIndex){
    event.preventDefault();event.currentTarget.classList.remove("drag-over");
    const id=Number(event.dataTransfer.getData("text/plain")||draggedFormationPlayerId);
    if(id)movePlayerToSlot(id,slotIndex);
}
function dropOnBench(event){
    event.preventDefault();event.currentTarget.classList.remove("drag-over");
    const id=Number(event.dataTransfer.getData("text/plain")||draggedFormationPlayerId);
    if(id)movePlayerToBench(id);
}

function createPlayerInfoSidebar(team){
    const player = team.players.find(
        p => p.id === selectedFormationPlayerId
    );

    // Nothing selected yet.
    if(!player){
        return `
            <aside class="player-info-panel" style="${teamVars(team)}">
                <div class="player-info-code">PLAYER // DATABASE</div>

                <div class="player-info-empty">
                    <div class="player-info-empty-icon">+</div>
                    <strong>SELECT A PLAYER</strong>
                    <span>
                        Click a player on the pitch or from the reserves
                        to view their profile.
                    </span>
                </div>
            </aside>
        `;
    }

    const s = playerStats(player);

    const stat = (label, value) => {
        const safeValue = Math.max(
            0,
            Math.min(100, Number(value) || 0)
        );

        return `
            <div class="player-stat-row">
                <div class="player-stat-label">
                    <span>${label}</span>
                    <strong>${safeValue}</strong>
                </div>

                <div class="player-stat-track">
                    <i style="width:${safeValue}%"></i>
                </div>
            </div>
        `;
    };

    const passive = player.passive || {
        name: "Placeholder Passive",
        trigger: "TBD",
        effect: "TBD"
    };

    const special = player.special || {
        name: "Placeholder Special",
        trigger: "TBD",
        effect: "TBD"
    };

    return `
        <aside class="player-info-panel" style="${teamVars(team)}">

            <div class="player-info-top">
                <div>
                    <span class="player-info-code">PLAYER // PROFILE</span>
                    <strong class="player-info-id">
                        ${String(player.id).padStart(2, "0")}
                    </strong>
                </div>

                <button
                    type="button"
                    class="player-info-close"
                    onclick="clearSelectedFormationPlayer()"
                    aria-label="Close player profile"
                >×</button>
            </div>

            <div class="player-info-portrait">
                <img
                    src="${player.image}"
                    alt="${esc(player.name)}"
                >

                <div class="player-info-ovr">
                    <span>OVR</span>
                    <strong>${s.ovr}</strong>
                </div>
            </div>

            <div class="player-info-name">
                <span>PLAYER</span>
                <h2>${esc(player.name)}</h2>

                <div class="player-info-positions">
                    ${positionBadges(player)}
                </div>
            </div>

            <div class="player-info-section">
                <div class="player-info-section-title">
                    <span>CORE ATTRIBUTES</span>
                </div>

                ${stat("OFF", s.off)}
                ${stat("SHO", s.sho)}
                ${stat("SPD", s.spd)}
                ${stat("DEF", s.def)}
                ${stat("PAS", s.pas)}
                ${stat("DRI", s.dri)}
                ${stat("GK", s.gk)}
            </div>

            <div class="player-info-section">
                <div class="player-info-section-title">
                    <span>PASSIVE</span>
                </div>

                <div class="player-ability">
                    <strong>${esc(passive.name)}</strong>
                    <span>TRIGGER // ${esc(passive.trigger)}</span>
                    <p>${esc(passive.effect)}</p>
                </div>
            </div>

            <div class="player-info-section">
                <div class="player-info-section-title">
                    <span>SPECIAL MOVE</span>
                </div>

                <div class="player-ability special">
                    <strong>${esc(special.name)}</strong>
                    <span>TRIGGER // ${esc(special.trigger)}</span>
                    <p>${esc(special.effect)}</p>
                </div>
            </div>

        </aside>
    `;
}

function clearSelectedFormationPlayer(){
    selectedFormationPlayerId = null;
    clearLiveFormationTargets();
    renderFormationBuilder();
    saveGame();
}
function renderFormationBuilder(){
    const team = teamByNumber(formationTeamNumber);
    const rating = squadRatings(formationTeamNumber);

    activeFormation =
        formationByTeam[formationTeamNumber] || "4-3-3";

    const slots = FORMATIONS[activeFormation];

    sanitizeFormationAssignments(formationTeamNumber);

    const used = assignedIds(formationTeamNumber);

    const bench = team.players.filter(
        p => !used.has(p.id)
    );

    const selectedPlayer = team.players.find(
        p => p.id === selectedFormationPlayerId
    );

    formationContent.innerHTML = `
        <div class="formation-v2-shell">

            <div class="formation-topbar">

                <div class="formation-team-tabs">
                    ${[1,2].map(n => {
                        const t = teamByNumber(n);

                        return `
                            <button
                                class="${formationTeamNumber === n ? "active" : ""}"
                                style="${teamVars(t)}"
                                onclick="switchFormationTeam(${n})"
                            >
                                <span>SQUAD 0${n}</span>
                                ${esc(t.name)}
                            </button>
                        `;
                    }).join("")}
                </div>

                <div class="formation-actions">
                    <button
                        class="formation-reset"
                        onclick="resetCurrentFormation()"
                    >
                        ↻ CLEAR XI
                    </button>

                    <button
                        class="formation-bench-toggle"
                        onclick="toggleBench()"
                    >
                        ${benchCollapsed ? "SHOW BENCH" : "HIDE BENCH"}
                    </button>
                </div>

            </div>

            <div
                class="formation-control-panel"
                style="${teamVars(team)}"
            >
                <div class="formation-control-main">
                    <span>FORMATION // ${esc(team.name)}</span>
                    <strong>${activeFormation}</strong>
                </div>

                <div class="formation-team-rating">
                    <span>TEAM OVR</span>
                    <strong>${rating.ovr}</strong>
                </div>

                <details class="formation-menu">

                    <summary>
                        <span>CHANGE FORMATION</span>
                        <b>${activeFormation}</b>
                        <i>⌄</i>
                    </summary>

                    <div class="formation-menu-popover">

                        <div class="formation-menu-group">
                            <span>BACK FOUR</span>

                            ${[
                                "4-3-3",
                                "4-2-3-1",
                                "4-4-2",
                                "4-1-3-2",
                                "4-3-2-1"
                            ].map(f => `
                                <button
                                    class="${activeFormation === f ? "active" : ""}"
                                    onclick="changeFormation('${f}')"
                                >
                                    ${f}
                                </button>
                            `).join("")}
                        </div>

                        <div class="formation-menu-group">
                            <span>BACK THREE</span>

                            ${[
                                "3-4-3",
                                "3-5-2",
                                "3-4-2-1"
                            ].map(f => `
                                <button
                                    class="${activeFormation === f ? "active" : ""}"
                                    onclick="changeFormation('${f}')"
                                >
                                    ${f}
                                </button>
                            `).join("")}
                        </div>

                        <div class="formation-menu-group">
                            <span>BACK FIVE</span>

                            ${[
                                "5-3-2",
                                "5-2-3"
                            ].map(f => `
                                <button
                                    class="${activeFormation === f ? "active" : ""}"
                                    onclick="changeFormation('${f}')"
                                >
                                    ${f}
                                </button>
                            `).join("")}
                        </div>

                    </div>
                </details>

            </div>

            <div
                class="formation-instructions"
                style="${teamVars(team)}"
            >
                <span>TACTICAL BOARD // DRAG & DROP ENABLED</span>

                <strong>
                    ${
                        selectedPlayer
                            ? `${esc(selectedPlayer.name)}
                               // PRIMARY: ${primaryPosition(selectedPlayer)}
                               // CANON: ${playerPositions(selectedPlayer).join(" / ")}`
                            : "SELECT A PLAYER TO HIGHLIGHT CANONICAL POSITIONS // DRAG OR TAP TO PLACE"
                    }
                </strong>
            </div>

            <div class="formation-layout ${benchCollapsed ? "bench-hidden" : ""}">

                <!-- PITCH -->

                <div
                    class="football-pitch formation-pitch-v2"
                    style="${teamVars(team)}"
                >
                    <div class="pitch-stripes"></div>
                    <div class="pitch-halfway"></div>
                    <div class="pitch-circle"></div>
                    <div class="pitch-dot"></div>

                    <div class="penalty-box top"></div>
                    <div class="penalty-box bottom"></div>

                    <div class="goal-box top"></div>
                    <div class="goal-box bottom"></div>

                    ${slots.map((s,i) => {

                        const p =
                            getFormationPlayer(
                                formationTeamNumber,
                                i
                            );

                        const selected =
                            p &&
                            p.id === selectedFormationPlayerId;

                        const canonicalTarget =
                            selectedPlayer &&
                            canonicalFit(
                                selectedPlayer,
                                s.label
                            );

                        const primaryTarget =
                            selectedPlayer &&
                            primaryFit(
                                selectedPlayer,
                                s.label
                            );

                        const currentFit =
                            p &&
                            canonicalFit(
                                p,
                                s.label
                            );

                        return `
                            <button
                                class="
                                    formation-slot
                                    ${p ? "occupied" : ""}
                                    ${selected ? "selected" : ""}
                                    ${canonicalTarget ? "canonical-target" : ""}
                                    ${primaryTarget ? "primary-target" : ""}
                                    ${currentFit ? "natural-fit" : ""}
                                "
                                style="left:${s.x}%;top:${s.y}%"
                                data-slot-label="${s.label}"

                                onclick="clickFormationSlot(${i})"

                                ondragover="allowFormationDrop(event)"
                                ondragleave="leaveFormationDrop(event)"
                                ondrop="dropOnFormationSlot(event,${i})"
                            >

                                <span class="slot-position">
                                    ${s.label}
                                </span>

                                ${
                                    p
                                        ? `
                                            <div
                                                class="formation-player-token"
                                                draggable="true"
                                                onpointerdown="updateLiveFormationTargets(${p.id})"
                                                ondragstart="startFormationDrag(event,${p.id})"
                                                ondragend="endFormationDrag(event)"
                                            >
                                                <img
                                                    src="${p.image}"
                                                    alt="${esc(p.name)}"
                                                >

                                                <strong>
                                                    ${esc(p.name)}
                                                </strong>

                                                ${positionBadges(p,true)}
                                            </div>
                                        `
                                        : `
                                            <span class="empty-slot">
                                                +
                                            </span>
                                        `
                                }

                            </button>
                        `;
                    }).join("")}

                </div>

                <!-- PLAYER INFORMATION -->

                ${createPlayerInfoSidebar(team)}

                <!-- RESERVES -->

                <aside
                    class="bench-panel ${benchCollapsed ? "collapsed" : ""}"
                    style="${teamVars(team)}"

                    ondragover="allowFormationDrop(event)"
                    ondragleave="leaveFormationDrop(event)"
                    ondrop="dropOnBench(event)"
                >

                    <div class="bench-heading">

                        <div>
                            <span>RESERVES</span>
                            <small>DROP HERE TO BENCH</small>
                        </div>

                        <strong>${bench.length}</strong>

                    </div>

                    <div class="bench-list">

                        ${
                            bench.length
                                ? bench.map(p => `
                                    <button
                                        class="
                                            bench-player
                                            ${p.id === selectedFormationPlayerId ? "selected" : ""}
                                        "

                                        onclick="selectBenchPlayer(${p.id})"

                                        onpointerdown="updateLiveFormationTargets(${p.id})"

                                        draggable="true"

                                        ondragstart="startFormationDrag(event,${p.id})"
                                        ondragend="endFormationDrag(event)"
                                    >

                                        <img
                                            src="${p.image}"
                                            alt="${esc(p.name)}"
                                        >

                                        <span>
                                            ${esc(p.name)}
                                            ${positionBadges(p,true)}
                                        </span>

                                        <b>DRAG</b>

                                    </button>
                                `).join("")
                                : `
                                    <div class="history-empty">
                                        NO SUBSTITUTES
                                    </div>
                                `
                        }

                    </div>

                </aside>

            </div>

        </div>
    `;
}
document.getElementById("backToResults").addEventListener("click",()=>{
    formationScreen.classList.add("hidden");auctionScreen.classList.remove("hidden");
    showAuctionComplete();
    window.scrollTo({top:0,behavior:"smooth"});
});

function playerStats(player){
    const stats = player?.stats || {};

    return {
        ovr: Number(stats.ovr ?? player?.ovr ?? 0),
        off: Number(stats.off ?? player?.off ?? 0),
        sho: Number(stats.sho ?? player?.sho ?? 0),
        spd: Number(stats.spd ?? player?.spd ?? 0),
        def: Number(stats.def ?? player?.def ?? 0),
        pas: Number(stats.pas ?? player?.pas ?? 0),
        dri: Number(stats.dri ?? player?.dri ?? 0),
        gk: Number(stats.gk ?? player?.gk ?? 0)
    };
}

const initialSaved=loadSavedData();
if(initialSaved?.gameActive) showResumeCard(initialSaved);
else restoreSetup(initialSaved);
setVisibleScreen(menuScreen);
refreshMainMenu();
