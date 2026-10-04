// BLUE LOCK AUCTION // VISUAL OVERHAUL

let team1 = { name:"", color:"#19a7ff", budget:0, players:[] };
let team2 = { name:"", color:"#ff315d", budget:0, players:[] };
let bidIncrement = 50, maxPlayers = 15, startingBudget = 15000;
let remainingPlayers = [], currentPlayer = null, currentBid = 0, currentBidder = null;
let startingTeam = null, auctionNumber = 0, auctionHistory = [];
let draftMode = "auction";
let selectedPlayerIds = new Set(players.map(player => player.id));
let watchlistedPlayerIds = new Set();
let playerPoolPositionFilter = "ALL";
let playerPoolGroupFilter = "all";
let playerPoolSort = "id";
let formationDbQuery = "";
let formationDbPosition = "ALL";
let formationDbSort = "ovr";
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
    else if(name==="bid"){tone(520,.055,"square",.025);tone(700,.06,"square",.018,.045);}
    else if(name==="pass"){tone(230,.09,"sine",.025);tone(160,.12,"sine",.018,.06);}
    else if(name==="error"){tone(145,.11,"sawtooth",.025);tone(115,.15,"square",.018,.08);}
    else if(name==="sold"){tone(220,.08,"sawtooth",.025);tone(440,.1,"square",.025,.07);tone(880,.18,"sine",.03,.15);}
    else if(name==="nav"){tone(310,.04,"triangle",.014);tone(465,.055,"sine",.011,.03);}
    else if(name==="select"){tone(430,.035,"triangle",.013);tone(620,.045,"sine",.010,.025);}
    else if(name==="drop"){tone(500,.04,"sine",.014);tone(760,.065,"triangle",.012,.035);}
    else if(name==="confirm"){tone(420,.04,"triangle",.012);tone(630,.055,"sine",.012,.035);tone(840,.07,"sine",.009,.07);}
    else if(name==="back"){tone(320,.045,"sine",.011);tone(210,.07,"sine",.009,.035);}
    else if(name==="toggle"){tone(360,.035,"square",.008);tone(540,.04,"square",.008,.025);}
    else if(name==="result"){tone(330,.06,"triangle",.012);tone(495,.075,"triangle",.012,.05);tone(660,.10,"sine",.014,.10);}
    else if(name==="outbid"){tone(690,.04,"square",.014);tone(520,.05,"triangle",.012,.035);tone(820,.07,"sine",.011,.07);}
    else if(name==="watch"){tone(740,.04,"sine",.010);tone(980,.08,"triangle",.010,.035);}
    else if(name==="swap"){tone(430,.04,"triangle",.012);tone(640,.05,"triangle",.012,.035);tone(430,.06,"sine",.010,.075);}
    else if(name==="warning"){tone(180,.07,"square",.012);tone(140,.10,"sine",.010,.055);}
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


let audioUnlocked=false;
function unlockAudio(){
    if(!soundEnabled)return;
    const ctx=ensureAudio();
    if(ctx){audioUnlocked=true;if(ctx.state==="suspended")ctx.resume();}
}
document.addEventListener("pointerdown",unlockAudio,{capture:true});
document.addEventListener("keydown",unlockAudio,{capture:true});

document.addEventListener("click",e=>{
    const b=e.target.closest("button");
    if(!b || b.id==="soundToggle" || b.hasAttribute("data-sound-toggle"))return;
    if(b.classList.contains("pool-watch")||b.classList.contains("current-watch"))return;
    if(b.id==="placeBidButton"||b.id==="placeOpeningBid"||b.id==="passButton"||b.id==="buyPlayerButton"||b.id==="controlPassButton")return;
    const text=(b.textContent||"").toLowerCase();
    if(text.includes("back")||text.includes("main menu"))playSfx("back");
    else if(text.includes("start")||text.includes("confirm")||text.includes("enter")||text.includes("finish"))playSfx("confirm");
    else if(b.closest("#formation-screen"))playSfx("select");
    else playSfx("nav");
});
document.addEventListener("change",e=>{
    if(e.target.matches("input,select"))playSfx("toggle");
});

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
let playerDatabaseHidden = false;
let formationMoveFx=null;

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

function statStrip(player,compact=false){
    const s=playerStats(player);
    return `<div class="stat-strip ${compact?"compact":""}">
      <b><i>OVR</i>${s.ovr}</b><span><i>OFF</i>${s.off}</span><span><i>SHO</i>${s.sho}</span>
      <span><i>SPD</i>${s.spd}</span><span><i>DEF</i>${s.def}</span><span><i>PAS</i>${s.pas}</span>
      <span><i>DRI</i>${s.dri}</span><span><i>GK</i>${s.gk}</span>
    </div>`;
}
function squadRatings(teamNumber){
    const team=teamByNumber(teamNumber), assignments=formationAssignments[teamNumber]||{}, shape=FORMATIONS[formationByTeam[teamNumber]||"4-3-3"];
    const placed=Object.entries(assignments).map(([slot,id])=>{
      const p=team.players.find(x=>x.id===id), label=shape?.[Number(slot)]?.label;
      return p&&label?{p,label,eff:effectiveOVR(p,label)}:null;
    }).filter(Boolean);
    if(!placed.length)return {ovr:0,att:0,mid:0,def:0};
    const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/Math.max(1,a.length));
    const attack=placed.filter(x=>["ST","CF","LW","RW","AM"].includes(x.label));
    const midfield=placed.filter(x=>["CM","DM","AM","LM","RM","LWB","RWB"].includes(x.label));
    const defence=placed.filter(x=>["GK","CB","LB","RB","LWB","RWB","DM"].includes(x.label));
    return {ovr:avg(placed.map(x=>x.eff)),att:avg((attack.length?attack:placed).map(x=>x.eff)),mid:avg((midfield.length?midfield:placed).map(x=>x.eff)),def:avg((defence.length?defence:placed).map(x=>x.eff))};
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


const POSITION_WEIGHTS = {
  GK:{gk:.72,def:.10,pas:.08,spd:.10},
  CB:{def:.43,spd:.12,pas:.16,dri:.08,off:.06,sho:.05,gk:.10},
  LB:{def:.27,spd:.22,pas:.18,dri:.15,off:.08,sho:.05,gk:.05},
  RB:{def:.27,spd:.22,pas:.18,dri:.15,off:.08,sho:.05,gk:.05},
  LWB:{def:.20,spd:.24,pas:.19,dri:.18,off:.10,sho:.05,gk:.04},
  RWB:{def:.20,spd:.24,pas:.19,dri:.18,off:.10,sho:.05,gk:.04},
  DM:{def:.25,pas:.24,dri:.13,spd:.12,off:.11,sho:.08,gk:.07},
  CM:{pas:.27,dri:.20,off:.15,def:.13,spd:.12,sho:.10,gk:.03},
  AM:{off:.23,pas:.24,dri:.22,sho:.15,spd:.11,def:.03,gk:.02},
  LM:{spd:.22,dri:.22,pas:.19,off:.16,sho:.12,def:.07,gk:.02},
  RM:{spd:.22,dri:.22,pas:.19,off:.16,sho:.12,def:.07,gk:.02},
  LW:{spd:.23,dri:.24,off:.20,sho:.17,pas:.12,def:.02,gk:.02},
  RW:{spd:.23,dri:.24,off:.20,sho:.17,pas:.12,def:.02,gk:.02},
  ST:{sho:.29,off:.28,dri:.15,spd:.14,pas:.09,def:.03,gk:.02},
  CF:{sho:.25,off:.29,dri:.17,pas:.12,spd:.12,def:.03,gk:.02}
};
function normalizePosition(position){
  const p=String(position||"").toUpperCase();
  if(["FW","SS"].includes(p)) return "CF";
  if(p==="DF") return "CB";
  if(p==="WB") return "RWB";
  if(p==="WM") return "RM";
  return POSITION_WEIGHTS[p]?p:"CM";
}
function calculatePositionOVR(player,position){
  const s=playerStats(player), pos=normalizePosition(position), w=POSITION_WEIGHTS[pos];
  return Math.max(1,Math.min(100,Math.round(Object.entries(w).reduce((n,[k,v])=>n+(Number(s[k])||0)*v,0))));
}
function playerOverall(player){ return player ? calculatePositionOVR(player,primaryPosition(player)) : 0; }
function effectiveOVR(player,slotLabel){
  if(!player||!slotLabel)return 0;
  const base=calculatePositionOVR(player,slotLabel);
  if(primaryFit(player,slotLabel)) return base;
  if(canonicalFit(player,slotLabel)) return Math.max(1,base-2);
  const pg=positionGroup(primaryPosition(player)), sg=positionGroup(slotLabel);
  return Math.max(1,base-(pg===sg?5:11));
}
function positionGroup(position){
  const p=normalizePosition(position);
  if(p==="GK")return "GK";
  if(["ST","CF","LW","RW"].includes(p))return "ATTACK";
  if(["AM","CM","DM","LM","RM"].includes(p))return "MIDFIELD";
  return "DEFENCE";
}
function positionRatingGrid(player){
  const order=["GK","CB","LB","RB","LWB","RWB","DM","CM","AM","LM","RM","LW","RW","ST","CF"];
  return `<div class="position-rating-grid">${order.map(pos=>{
    const score=calculatePositionOVR(player,pos);
    const canon=canonicalFit(player,pos), primary=primaryFit(player,pos);
    return `<div class="position-rating ${canon?"canon":""} ${primary?"primary":""}"><span>${pos}</span><strong>${score}</strong></div>`;
  }).join("")}</div>`;
}



// ============================================================================
// CHEMISTRY MODEL // BLUE LOCK CANON + GAMEPLAY THROUGH MANGA CHAPTER 363
// ----------------------------------------------------------------------------
// Blue Lock does NOT publish an official 0-100 chemistry statistic.
// These scores are a fan-game model. Strong overrides are based on demonstrated
// combinations, chemical reactions, tactical systems, or clear incompatibility.
// Generic fallback scores come from repeated shared-team history.
// ============================================================================

const CHEMISTRY_CONTEXTS = [
  {name:"TEAM Z",score:79,players:["Yoichi Isagi","Meguru Bachira","Rensuke Kunigami","Hyoma Chigiri","Gin Gagamaru","Jingo Raichi","Gurimu Igarashi","Asahi Naruhaya","Wataru Kuon","Yudai Imamura","Okuhito Iemon"]},
  {name:"TEAM V",score:84,players:["Seishiro Nagi","Reo Mikage","Zantetsu Tsurugi"]},
  {name:"SECOND SELECTION // ISAGI UNIT",score:85,players:["Yoichi Isagi","Seishiro Nagi","Shoei Baro","Hyoma Chigiri"]},
  {name:"SECOND SELECTION // RIN UNIT",score:84,players:["Rin Itoshi","Jyubei Aryu","Aoshi Tokimitsu","Meguru Bachira","Yoichi Isagi"]},
  {name:"SECOND SELECTION // KARASU UNIT",score:84,players:["Tabito Karasu","Eita Otoya","Kenyu Yukimiya"]},
  {name:"SECOND SELECTION // SHIDO UNIT",score:81,players:["Ryusei Shido","Gurimu Igarashi","Reo Mikage","Ranze Kurona"]},
  {name:"THIRD SELECTION // A1",score:82,players:["Rin Itoshi","Ryusei Shido","Yoichi Isagi","Yo Hiori","Nijiro Nanase"]},
  {name:"BLUE LOCK ELEVEN",score:80,players:["Yoichi Isagi","Rin Itoshi","Meguru Bachira","Hyoma Chigiri","Seishiro Nagi","Shoei Baro","Tabito Karasu","Eita Otoya","Kenyu Yukimiya","Yo Hiori","Jyubei Aryu","Gin Gagamaru","Ikki Niko","Reo Mikage"]},
  {name:"JAPAN U-20 // ORIGINAL",score:80,players:["Sae Itoshi","Oliver Aiku","Shuto Sendo","Gen Fukaku","Kazuma Nio","Miroku Darai","Teppei Neru","Itsuki Wakatsuki","Haru Hayate","Kento Cho","Teru Kitsunezato"]},
  {name:"BASTARD MÜNCHEN",score:83,players:["Noel Noa","Michael Kaiser","Alexis Ness","Benedict Grim","Yoichi Isagi","Rensuke Kunigami","Kenyu Yukimiya","Gin Gagamaru","Ranze Kurona","Jingo Raichi","Yo Hiori","Jin Kiyora","Gurimu Igarashi","Teppei Neru"]},
  {name:"FC BARCHA",score:83,players:["Lavinho","Meguru Bachira","Eita Otoya"]},
  {name:"MANSHINE CITY",score:82,players:["Chris Prince","Agi","Seishiro Nagi","Reo Mikage","Hyoma Chigiri","Kazuma Nio","Junichi Wanima"]},
  {name:"UBERS",score:84,players:["Marc Snuffy","Don Lorenzo","Shoei Baro","Oliver Aiku","Ikki Niko","Jyubei Aryu","Gen Fukaku","Shuto Sendo"]},
  {name:"PARIS X GEN",score:82,players:["Julien Loki","Rin Itoshi","Ryusei Shido","Charles Chevalier","Tabito Karasu","Aoshi Tokimitsu","Nijiro Nanase","Zantetsu Tsurugi"]},
  {name:"JAPAN U-20 // WORLD CUP",score:79,players:["Yoichi Isagi","Rin Itoshi","Ryusei Shido","Meguru Bachira","Hyoma Chigiri","Reo Mikage","Rensuke Kunigami","Eita Otoya","Oliver Aiku","Tabito Karasu","Gin Gagamaru","Jyubei Aryu","Kenyu Yukimiya","Ikki Niko","Yo Hiori","Shuto Sendo","Ranze Kurona","Zantetsu Tsurugi","Gen Fukaku","Jingo Raichi","Jin Kiyora","Nijiro Nanase","Shoei Baro"]},
  {name:"FRANCE U-20 // GOLDEN GENERATION",score:89,players:["Julien Loki","Charles Chevalier","Vivien Hugo","Renoir"]},
  {name:"ENGLAND U-20 // FOX SYSTEM",score:86,players:["Teddy Knight","Lockhart","Achanpong","Childs","Agi","Rooke"]},
  {name:"NIGERIA U-20",score:88,players:["Innocent Onazi","Godwin Kuso"]},
  {name:"TEAM WORLD FIVE",score:92,players:["Leonardo Luna","Pablo Cavasoz","Adam Blake","Dada Silva","Julien Loki"]}
];

const CHEMISTRY_SPECIAL_PAIRS = [
  // Proven elite / named combinations
  ["Yoichi Isagi","Yo Hiori",99,"CHEMICAL REACTION","Ubers: shared metavision and the no-look final pass/finish created a goal neither player pre-signalled."],
  ["Ryusei Shido","Sae Itoshi",99,"MATCH MADE IN HEAVEN","Japan U-20: Sae immediately unlocked Shido's penalty-area instincts and supplied both of his goals."],
  ["Ryusei Shido","Charles Chevalier",99,"CHEMICAL REACTION","PXG: Charles' contrarian passing repeatedly targets Shido's extreme penalty-area movement."],
  ["Yoichi Isagi","Ranze Kurona",98,"PLANET HOTLINE","Bastard München: rapid orbiting one-twos were built specifically around Isagi's movement and Kurona's turning speed."],
  ["Tabito Karasu","Eita Otoya",98,"ASSASSIN × NINJA","Their play compatibility is repeatedly emphasized; short exchanges and off-ball movement let them read each other at speed."],
  ["Tabito Karasu","Yo Hiori",98,"CROW × ICE","Bambi Osaka history, personal trust, and chapter 337's France match: Karasu directly assists Hiori's equalizer."],
  ["Seishiro Nagi","Reo Mikage",95,"ESTABLISHED DUO","Their creator-finisher understanding is exceptional from Team V through Manshine, but the manga explicitly frames their repeated dependence as a ceiling on further growth."],
  ["Ranze Kurona","Jin Kiyora",92,"DOG HUNT","They share Third Selection/Bastard history, and chapter 363 gives them a direct two-man trap: Kurona presses Teddy while Kiyora seals the escape route."],
  ["Jin Kiyora","Michael Kaiser",95,"BORDERLINE PASS","PXG: Kiyora's extreme-backspin pass stopped perfectly for Kaiser's Magnus, directly creating Kaiser's goal."],
  ["Yoichi Isagi","Meguru Bachira",96,"MONSTER LINK","From Team Z through the Second Selection, Bachira repeatedly seeks the 'monster' he recognizes in Isagi and trusts him to reach the same attacking picture."],
  ["Yoichi Isagi","Seishiro Nagi",94,"SECOND-SELECTION REACTION","Their improvised combinations repeatedly converted each other's weapons into unpredictable scoring routes."],
  ["Yoichi Isagi","Shoei Baro",93,"MUTUAL DEVOURING","Second Selection: Isagi explicitly describes how he and Baro devoured one another to create unforeseeable chemical reactions."],
  ["Michael Kaiser","Yoichi Isagi",92,"RIVAL ALLIANCE","PXG: after prolonged conflict, Kaiser reset his ego and partnered with Isagi to break the genius-led defense."],
  ["Alexis Ness","Yoichi Isagi",84,"UNINTENTIONAL AWAKENING","Chapter 293 proves Isagi can read Ness' awakened pass and score from it, but Ness did not build that play as a trusted Isagi partnership and their personal relationship remains antagonistic."],
  ["Michael Kaiser","Alexis Ness",86,"FRACTURED ELITE DUO","Years of rehearsed combinations give them real technical compatibility, but the PXG match ends with Kaiser severing the dependency and Ness emotionally collapsing."],
  ["Yoichi Isagi","Hyoma Chigiri",91,"SPEED REACTION","Isagi helps Chigiri rediscover his ego, then later selects him specifically because Chigiri's speed can survive inside the Second Selection's devouring reactions."],
  ["Rin Itoshi","Nijiro Nanase",88,"RIN SUPPORT ROUTE","Nanase deliberately trains to become useful to Rin and becomes a dedicated PXG support route, but the relationship is heavily one-sided rather than an equal chemical duo."],
  ["Oliver Aiku","Ikki Niko",92,"UBERS DEFENSIVE CORE","Both are elite readers who repeatedly operate inside Ubers' synchronized defensive rotations, with Aiku anchoring the line and Niko stepping into interception lanes."],
  ["Don Lorenzo","Oliver Aiku",91,"UBERS DEFENSIVE CORE","Lorenzo's elite man-marking and Aiku's reading anchor Ubers' layered defensive system."],
  ["Marc Snuffy","Don Lorenzo",98,"MENTOR CORE","Snuffy built Lorenzo's football career and Ubers system around his rare defensive and ball-carrying qualities."],
  ["Marc Snuffy","Shoei Baro",91,"SUCCESSOR SYSTEM","Snuffy designs Ubers' attack around Baro and later recognizes him as the club's future king."],
  ["Rin Itoshi","Yoichi Isagi",89,"RIVAL READ","They frequently process the same decisive space at an elite level, but their egos make direct cooperation unstable."],
  ["Rin Itoshi","Jyubei Aryu",89,"TOP-3 UNIT","Second Selection: Aryu is a core member of Rin's dominant top-three unit and follows his field control cleanly."],
  ["Rin Itoshi","Aoshi Tokimitsu",89,"TOP-3 UNIT","Second Selection: Tokimitsu's physical pressure complements Rin's control in the top-three unit."],
  ["Rensuke Kunigami","Hyoma Chigiri",94,"TRUSTED POWER × SPEED","They are close from Team Z, deliberately team together in the Second Selection, repeatedly support one another, and combine complementary power/speed weapons."],
  ["Meguru Bachira","Eita Otoya",93,"BARCHA ATTACK","They share Barcha's free attacking structure, and the final NEL match explicitly has Bachira assist Otoya for a goal."],
  ["Don Lorenzo","Ikki Niko",90,"UBERS DEFENSIVE SYSTEM","Niko's reading and Lorenzo's man-marking/ball-carrying function inside the same coordinated Ubers defensive rotations."],
  ["Oliver Aiku","Jyubei Aryu",90,"UBERS DEFENSIVE SYSTEM","Aiku's reading and Aryu's reach/aerial coverage repeatedly share the Ubers back line and the Japan defensive unit."],
  ["Don Lorenzo","Shoei Baro",88,"UBERS TRANSITION","Lorenzo carries through pressure while Baro is the attack's designated finishing point."],
  ["Chris Prince","Seishiro Nagi",85,"MANSHINE DEVELOPMENT","Chris develops Nagi physically, but Nagi struggles to convert the training into independent reproducible creation."],
  ["Agi","Seishiro Nagi",86,"MANSHINE DEVELOPMENT","Agi actively tries to draw out Nagi's creativity, though he opposes Nagi falling back into dependence on Reo."],
  ["Reo Mikage","Hyoma Chigiri",94,"PROVEN CREATOR × RUNNER","Reo assisted Chigiri twice in their Second Selection 3v3 and again assists Chigiri's goal in chapter 295, showing a repeatable creator-runner relationship across arcs."],
  ["Noel Noa","Yoichi Isagi",86,"MASTER / PROTÉGÉ","Noa gives Isagi rational guidance and occasionally enters the same match structure, but they are not a fixed attacking duo."],
  ["Noel Noa","Michael Kaiser",87,"BASTARD SYSTEM","Kaiser is the established ace of Noa's rational Bastard München structure, though Noa does not build every play around him."],
  ["Charles Chevalier","Rin Itoshi",87,"PXG DUAL SYSTEM","Charles can supply Rin's system, but his contrarian personality is more naturally excited by Shido's chaos."],
  ["Charles Chevalier","Tabito Karasu",86,"PXG MIDFIELD","They share PXG's midfield structure and can circulate into either striker system."],
  ["Yo Hiori","Nijiro Nanase",86,"THIRD-SELECTION LINK","Friendly Team A1 teammates who repeatedly function as clean support options around the central striker."],
  ["Yoichi Isagi","Nijiro Nanase",84,"THIRD-SELECTION LINK","Team A1 gave them direct combination experience, though no signature duo developed."],
  ["Tabito Karasu","Yoichi Isagi",86,"TACTICAL FRICTION","They can read and use each other's movement, but chapter 337 shows a genuine philosophical/tactical clash over how Japan should attack."],

  // Team World Five // demonstrated professional passing chains
  ["Leonardo Luna","Julien Loki",97,"KICKOFF PUNISHMENT","Against the First Clear Team, Luna immediately feeds Loki from the restart and Loki turns the pass into the equalizer with his world-class acceleration."],
  ["Pablo Cavasoz","Dada Silva",97,"PINPOINT AERIAL ROUTE","Pablo threads/crosses through pressure to Dada, whose aerial presence turns the delivery into the next scoring action."],
  ["Dada Silva","Adam Blake",97,"AERIAL LAYOFF","Dada converts Pablo's service into a headed layoff and Blake finishes the move, a direct demonstrated two-man scoring connection."],
  ["Julien Loki","Dada Silva",96,"SPEED TO AERIAL","Loki attacks the entire field and later delivers the cross that Dada heads in over Aryu."],
  ["Leonardo Luna","Pablo Cavasoz",95,"CHAIN STARTER","Luna wins possession from Rin and immediately routes the ball into Pablo, starting the sequence that ends with Blake's goal."],
  ["Pablo Cavasoz","Adam Blake",95,"ACCURACY TO POWER","Pablo repeatedly facilitates the World Five passing chain and directly routes possession toward Blake in their professional attack."],
  ["Adam Blake","Julien Loki",94,"WORLD-CLASS TRANSITION","Blake supplies Loki during the World Five attack before Loki turns the phase into Dada's scoring cross."],
  ["Pablo Cavasoz","Julien Loki",94,"CONNECTOR × SPEED","Pablo is the team's central passing facilitator while Loki covers both attack and defense, making them naturally compatible inside the World Five optimal-position system."],
  ["Leonardo Luna","Adam Blake",93,"WORLD FIVE ATTACK","Both occupy the World Five attacking chain and repeatedly move possession toward the best-positioned finisher rather than forcing individual plays."],
  ["Leonardo Luna","Dada Silva",93,"WORLD FIVE ATTACK","Luna's progression and Dada's aerial finishing coexist cleanly inside the World Five's optimal-position passing structure."],

  // Additional demonstrated combinations and World Cup relationships
  ["Hyoma Chigiri","Zantetsu Tsurugi",89,"SPEED PAIR","Second Selection: the two speed specialists play on the same clear team, and Zantetsu directly assists a Chigiri goal."],
  ["Hyoma Chigiri","Seishiro Nagi",89,"SECOND-SELECTION / MANSHINE LINK","They clear the Second Selection together and later share Manshine's attack; their weapons can coexist without either needing to dominate possession."],
  ["Rensuke Kunigami","Reo Mikage",88,"SECOND-SELECTION UNIT","Reo and Kunigami remain together after Chigiri is selected away, giving them direct competitive experience and complementary roles."],
  ["Rin Itoshi","Yo Hiori",91,"THIRD-SELECTION CREATION","Hiori plays behind Rin on Team A, directly assists one of Rin's goals, and Rin is unusually receptive to him as a support option."],
  ["Rin Itoshi","Ranze Kurona",88,"THIRD-SELECTION ROUTE","Kurona plays in Rin's Team A structure and is credited with assisting Rin's winning goal against Team C."],
  ["Yoichi Isagi","Kenyu Yukimiya",90,"SWORD HEART ASSIST","Chapter 202: Isagi abandons his own shot, backheels through Kaiser's interference, and Yukimiya converts the match-winning Sword Screw."],
  ["Yoichi Isagi","Rensuke Kunigami",89,"BASTARD FINISHING ROUTE","Bastard vs Manshine: Isagi's attack becomes Kunigami's goal, one of the match sequences that establishes Isagi as the side's chance creator."],
  ["Oliver Aiku","Shuto Sendo",91,"CAPTAIN × ACE TRUST","Aiku repeatedly protects and encourages Sendo with the original Japan U-20, and they remain close teammates at Ubers."],
  ["Ikki Niko","Jyubei Aryu",91,"ANTI-PRODIGY DEFENSE","Chapter 245 explicitly pairs Niko and Aryu in Ubers' anti-prodigy defense against Nagi."],
  ["Shoei Baro","Ikki Niko",90,"UBERS COUNTER ROUTE","Chapter 245 shows Baro using Niko as the safe recycle option under pressure and receiving the return to immediately restore his attack."],
  ["Shoei Baro","Shuto Sendo",87,"KING × HYENA","They can combine inside Ubers and Sendo celebrates Baro's goals, but they also compete as forwards and Baro openly belittles Sendo's opportunistic finish."],
  ["Meguru Bachira","Lavinho",92,"GINGA MENTORSHIP","Lavinho's free-form dribbling philosophy directly develops Bachira's own monster-based style at Barcha."],
  ["Innocent Onazi","Godwin Kuso",98,"FOSTER-BROTHER AXIS","They grew up playing together; Kuso captains Nigeria, builds attacks around Onazi, and in the Japan match delivers a perfect cross for him after years of shared football."],
  ["Julien Loki","Vivien Hugo",98,"FRANCE GOLDEN AXIS","France U-20: Hugo and Loki have long youth-team history, and Hugo directly assists Loki's goal against Japan."],
  ["Charles Chevalier","Vivien Hugo",97,"FRANCE CREATOR PAIR","Against Japan, Hugo assists Charles' opener and Charles later assists Hugo's goal; their reciprocal creation is demonstrated in the same match."],
  ["Julien Loki","Charles Chevalier",94,"MASTERED PLAYMAKER ROUTE","Loki brings Charles into the NEL to develop him as a midfielder and they continue together as core France U-20 creators."],
  ["Teddy Knight","Lockhart",94,"FOX SYSTEM FINISH","Chapter 360: Teddy's cross directly creates Lockhart's go-ahead header, a clean example of England's automated collective football."],
  ["Teddy Knight","Achanpong",88,"ENGLAND VOLUNTEER SYSTEM","Achanpong explains that England willingly chose Fox's collective system; Teddy is its elite attacking reference and Achanpong its captain."],
  ["Agi","Teddy Knight",72,"SYSTEM FRICTION","They share England U-20, but Agi is removed for allowing his individual ego to disrupt Fox's system while Teddy remains its ideal obedient star."],

  // Explicitly poor or unstable links
  ["Sae Itoshi","Shuto Sendo",67,"DISMISSIVE PLAYMAKER","Sae repeatedly belittles Sendo's finishing during the original U-20 match; they can occupy the same attack, but trust and mutual respect are poor."],
  ["Ryusei Shido","Shuto Sendo",48,"HOSTILE TEAMMATES","Shido physically attacks Sendo before the U-20 match and Sae's preference for Shido further worsens the relationship."],
  ["Seishiro Nagi","Shoei Baro",80,"VOLATILE TEAM WHITE","They can function in the same Second Selection attack, but their constant clashes and competing egos make the partnership unstable."],
  ["Rin Itoshi","Ryusei Shido",58,"INCOMPATIBLE EGOS","Ego states they failed to spark a chemical reaction; PXG initially required separate systems, and they still clash after the France match."],
  ["Rin Itoshi","Sae Itoshi",62,"FRACTURED BROTHERS","They once combined naturally as children, but their shared dream collapsed and their current football relationship is openly hostile."],
  ["Rensuke Kunigami","Ryusei Shido",60,"PERSONAL CONFLICT","Shido eliminated Kunigami from the Second Selection path; their later encounters are defined more by confrontation than combination."],
  ["Sae Itoshi","Bunny Iglesias",58,"INTENSE RIVALRY","Sae is shown reacting bitterly to Bunny and his U-20 World Cup motivation is tied to confronting that rivalry."],
  ["Yoichi Isagi","Vivien Hugo",56,"PHILOSOPHY CLASH","France U-20: Hugo repeatedly challenges Isagi's ego philosophy and tries to redirect his idea of what a striker should be."]
];

const CHEMISTRY_SPECIAL = Object.fromEntries(
  CHEMISTRY_SPECIAL_PAIRS.map(([a,b,score,label,reason])=>[
    [a,b].sort().join("|"),{score,label,reason}
  ])
);

function chemistryKey(a,b){return [a.name,b.name].sort().join("|");}
function sharedChemistryContexts(a,b){
    return CHEMISTRY_CONTEXTS.filter(c=>c.players.includes(a.name)&&c.players.includes(b.name));
}
function chemistryRelation(a,b){
    if(!a||!b||a.id===b.id)return {score:0,label:"NO LINK",reason:"A player cannot form chemistry with themself.",contexts:[]};
    const special=CHEMISTRY_SPECIAL[chemistryKey(a,b)];
    const contexts=sharedChemistryContexts(a,b);
    if(special)return {...special,contexts:contexts.map(c=>c.name)};
    if(contexts.length){
        const ordered=[...contexts].sort((x,y)=>y.score-x.score);
        const score=Math.min(91,ordered[0].score+Math.min(6,(ordered.length-1)*2));
        return {
            score,
            label:ordered.length>1?"REPEATED TEAM HISTORY":"SHARED TEAM HISTORY",
            reason:`Shared competitive history: ${ordered.map(c=>c.name).join(" + ")}.`,
            contexts:ordered.map(c=>c.name)
        };
    }
    return {
        score:55,
        label:"UNPROVEN LINK",
        reason:"No sustained shared on-field system has been demonstrated in Blue Lock through chapter 363.",
        contexts:[]
    };
}
function playerChemistry(a,b){return chemistryRelation(a,b).score;}
function chemistryTier(v){return v>=95?"chemical":v>=90?"elite":v>=82?"strong":v>=70?"link":"weak";}
function chemistryTierLabel(v){return v>=95?"CHEMICAL":v>=90?"ELITE":v>=82?"STRONG":v>=70?"LINK":"WEAK";}

// Explicit tactical adjacency. Position-to-position links never change merely
// because the XI is incomplete. Slot numbers match FORMATIONS below.
const FORMATION_CHEMISTRY_EDGES = {
  "4-3-3":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,5],[2,5],[2,6],[3,6],[3,7],[4,7],
    [5,6],[6,7],
    [5,8],[5,9],[6,8],[6,9],[6,10],[7,9],[7,10],
    [8,9],[9,10]
  ],
  "4-2-3-1":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,5],[2,5],[2,6],[3,5],[3,6],[4,6],[5,6],
    [5,7],[5,8],[6,8],[6,9],[7,8],[8,9],
    [7,10],[8,10],[9,10]
  ],
  "4-4-2":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,5],[2,5],[2,6],[3,7],[3,8],[4,8],
    [5,6],[6,7],[7,8],
    [5,9],[6,9],[6,10],[7,9],[7,10],[8,10],[9,10]
  ],
  "4-1-3-2":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,6],[2,5],[3,5],[4,8],
    [5,6],[5,7],[5,8],[6,7],[7,8],
    [6,9],[7,9],[7,10],[8,10],[9,10]
  ],
  "4-3-2-1":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,5],[2,5],[2,6],[3,6],[3,7],[4,7],
    [5,6],[6,7],
    [5,8],[6,8],[6,9],[7,9],[8,9],[8,10],[9,10]
  ],
  "3-4-3":[
    [0,1],[0,2],[0,3],[1,2],[2,3],
    [1,4],[1,5],[2,5],[2,6],[3,6],[3,7],
    [4,5],[5,6],[6,7],
    [4,8],[5,8],[5,9],[6,9],[6,10],[7,10],[8,9],[9,10]
  ],
  "3-5-2":[
    [0,1],[0,2],[0,3],[1,2],[2,3],
    [1,4],[1,5],[2,5],[2,6],[2,7],[3,7],[3,8],
    [4,5],[5,6],[6,7],[7,8],
    [4,9],[5,9],[6,9],[6,10],[7,10],[8,10],[9,10]
  ],
  "3-4-2-1":[
    [0,1],[0,2],[0,3],[1,2],[2,3],
    [1,4],[1,5],[2,5],[2,6],[3,6],[3,7],
    [4,5],[5,6],[6,7],
    [4,8],[5,8],[5,9],[6,8],[6,9],[7,9],[8,9],[8,10],[9,10]
  ],
  "5-3-2":[
    [0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,5],
    [1,6],[2,6],[2,7],[3,7],[4,7],[4,8],[5,8],
    [6,7],[7,8],
    [6,9],[7,9],[7,10],[8,10],[9,10]
  ],
  "5-2-3":[
    [0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,5],
    [1,6],[2,6],[3,6],[3,7],[4,7],[5,7],[6,7],
    [6,8],[6,9],[7,9],[7,10],[8,9],[9,10]
  ]
};

function formationChemistry(teamNumber){
    const team=teamByNumber(teamNumber);
    const formation=formationByTeam[teamNumber]||"4-3-3";
    const shape=FORMATIONS[formation];
    const ass=formationAssignments[teamNumber]||{};
    const edgePairs=FORMATION_CHEMISTRY_EDGES[formation]||[];
    const links=edgePairs.map(([ai,bi])=>{
        const aId=ass[ai],bId=ass[bi];
        if(!aId||!bId)return null;
        const aPlayer=team.players.find(p=>p.id===aId);
        const bPlayer=team.players.find(p=>p.id===bId);
        if(!aPlayer||!bPlayer)return null;
        const relation=chemistryRelation(aPlayer,bPlayer);
        return {
            a:{index:ai,slot:shape[ai],p:aPlayer},
            b:{index:bi,slot:shape[bi],p:bPlayer},
            value:relation.score,
            relation
        };
    }).filter(Boolean);

    const overall=links.length?Math.round(links.reduce((n,l)=>n+l.value,0)/links.length):0;
    const sorted=[...links].sort((x,y)=>y.value-x.value);
    const counts={chemical:0,elite:0,strong:0,link:0,weak:0};
    links.forEach(l=>counts[chemistryTier(l.value)]++);
    return {
        overall,
        links,
        counts,
        activeLinks:links.length,
        possibleLinks:edgePairs.length,
        top:sorted[0]||null,
        weakest:sorted.length?sorted[sorted.length-1]:null
    };
}

function chemistrySvg(teamNumber){
    const c=formationChemistry(teamNumber);
    return `<svg class="chemistry-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Player chemistry links">${c.links.map(l=>`
      <line
        x1="${l.a.slot.x}" y1="${l.a.slot.y}" x2="${l.b.slot.x}" y2="${l.b.slot.y}"
        class="chem-link ${chemistryTier(l.value)}"
        data-a-id="${l.a.p.id}" data-b-id="${l.b.p.id}"
        aria-label="${esc(l.a.p.name)} and ${esc(l.b.p.name)} chemistry ${l.value}, ${esc(l.relation.label)}"
        onpointerenter="showChemistryTooltip(event,this)"
        onpointermove="moveChemistryTooltip(event)"
        onpointerleave="hideChemistryTooltip()"></line>`).join("")}</svg>`;
}

let chemistryTooltipEl=null;
function showChemistryTooltip(event,line){
    document.querySelectorAll(".chem-link.chem-active").forEach(el=>el.classList.remove("chem-active"));
    line.classList.add("chem-active");
    line.ownerSVGElement?.classList.add("chem-inspecting");
    const team=teamByNumber(formationTeamNumber);
    const a=team.players.find(p=>p.id===Number(line.dataset.aId));
    const b=team.players.find(p=>p.id===Number(line.dataset.bId));
    if(!a||!b)return;
    const r=chemistryRelation(a,b);
    if(!chemistryTooltipEl){
        chemistryTooltipEl=document.createElement("div");
        chemistryTooltipEl.className="chemistry-tooltip";
        document.body.appendChild(chemistryTooltipEl);
    }
    chemistryTooltipEl.innerHTML=`
      <div class="chem-tip-score ${chemistryTier(r.score)}">${r.score}</div>
      <div class="chem-tip-copy">
        <span>${esc(chemistryTierLabel(r.score))} // ${esc(r.label)}</span>
        <strong>${esc(a.name)} × ${esc(b.name)}</strong>
        <small>${esc(r.reason)}</small>
      </div>`;
    chemistryTooltipEl.classList.add("show");
    moveChemistryTooltip(event);
}
function moveChemistryTooltip(event){
    if(!chemistryTooltipEl)return;
    const pad=14;
    let x=event.clientX+18,y=event.clientY+18;
    const rect=chemistryTooltipEl.getBoundingClientRect();
    if(x+rect.width>window.innerWidth-pad)x=event.clientX-rect.width-18;
    if(y+rect.height>window.innerHeight-pad)y=event.clientY-rect.height-18;
    chemistryTooltipEl.style.left=Math.max(pad,x)+"px";
    chemistryTooltipEl.style.top=Math.max(pad,y)+"px";
}
function hideChemistryTooltip(){
    chemistryTooltipEl?.classList.remove("show");
    document.querySelectorAll(".chemistry-lines.chem-inspecting").forEach(el=>el.classList.remove("chem-inspecting"));
    document.querySelectorAll(".chem-link.chem-active").forEach(el=>el.classList.remove("chem-active"));
}

function chemistryLinkName(link){
    return link?`${link.a.p.name} × ${link.b.p.name}`:"—";
}
function chemistryHud(teamNumber,team){
    const c=formationChemistry(teamNumber);
    const top=c.top,weak=c.weakest;
    return `<div class="chemistry-hud chemistry-hud-v2" style="${teamVars(team)}">
      <div class="chem-score">
        <span>TEAM CHEMISTRY</span>
        <strong>${c.overall||"--"}</strong>
        <small>FAN MODEL // CANON GAMEPLAY THROUGH CH.363</small>
      </div>
      <div class="chemistry-summary">
        <div><span>ACTIVE LINKS</span><strong>${c.activeLinks}<small> / ${c.possibleLinks}</small></strong></div>
        <div><span>CHEMICAL</span><strong>${c.counts.chemical}</strong></div>
        <div><span>ELITE</span><strong>${c.counts.elite}</strong></div>
        <div><span>STRONG</span><strong>${c.counts.strong}</strong></div>
      </div>
      <div class="chemistry-featured">
        <div class="best"><span>BEST ACTIVE LINK</span><strong>${top?esc(chemistryLinkName(top)):"ADD PLAYERS"}</strong><b class="${top?chemistryTier(top.value):""}">${top?top.value:"--"}</b></div>
        <div class="risk"><span>LOWEST ACTIVE LINK</span><strong>${weak?esc(chemistryLinkName(weak)):"ADD PLAYERS"}</strong><b class="${weak?chemistryTier(weak.value):""}">${weak?weak.value:"--"}</b></div>
      </div>
      <div class="chem-key">
        <b>LINE KEY</b>
        <span><i class="chemical"></i>95+</span>
        <span><i class="elite"></i>90+</span>
        <span><i class="strong"></i>82+</span>
        <span><i class="link"></i>70+</span>
        <span><i class="weak"></i>&lt;70</span>
      </div>
    </div>`;
}

function currentPlayerSlot(teamNumber,id){
    const ass=formationAssignments[teamNumber]||{},shape=FORMATIONS[formationByTeam[teamNumber]||"4-3-3"];
    const k=Object.keys(ass).find(k=>ass[k]===id);return k==null?null:shape[+k]||null;
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
function normalizeHexColor(hex){
    let h=String(hex||"").replace("#","").trim();
    if(h.length===3)h=h.split("").map(c=>c+c).join("");
    return /^[0-9a-fA-F]{6}$/.test(h)?`#${h.toLowerCase()}`:"#19a7ff";
}
function hexRgb(hex){
    const h=normalizeHexColor(hex).slice(1);
    return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
}
function relativeLuminance(hex){
    const [r,g,b]=hexRgb(hex).map(v=>v/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
    return .2126*r+.7152*g+.0722*b;
}
function contrastRatio(a,b){
    const l1=relativeLuminance(a),l2=relativeLuminance(b);
    return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
}
function mixHexColors(a,b,amount){
    const aa=hexRgb(a),bb=hexRgb(b);
    const c=aa.map((v,i)=>Math.round(v+(bb[i]-v)*amount));
    return `#${c.map(v=>v.toString(16).padStart(2,"0")).join("")}`;
}
function accessibleTeamAccent(hex){
    const raw=normalizeHexColor(hex);
    let accent=raw;
    // The site is predominantly navy/black. Preserve the chosen hue whenever it
    // is already visible; only lift very dark colors (including pure black) until
    // borders, labels and highlights have reliable contrast against the UI.
    const uiDark="#06111c";
    for(let i=0;i<12 && contrastRatio(accent,uiDark)<4.6;i++){
        accent=mixHexColors(accent,"#ffffff",.14);
    }
    return accent;
}
function getContrastColor(hex){
    const color=normalizeHexColor(hex);
    const light="#f7fbff",dark="#06111c";
    return contrastRatio(color,light)>=contrastRatio(color,dark)?light:dark;
}
function teamVars(team){
    const raw=normalizeHexColor(team?.color||"#19a7ff");
    const accent=accessibleTeamAccent(raw);
    const onAccent=getContrastColor(accent);
    return [
        `--team-raw:${raw}`,
        `--team:${accent}`,
        `--team-color:${accent}`,
        `--team-accent:${accent}`,
        `--team-text:#f5f9fd`,
        `--team-on:${onAccent}`,
        `--team-contrast:${onAccent}`,
        `--team-soft:${hexToRgba(accent,.16)}`,
        `--team-glow:${hexToRgba(accent,.34)}`
    ].join(";");
}
function hexToRgba(hex,a){
    const [r,g,b]=hexRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
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

function playerMatchesPoolGroup(player,group){
    if(!group||group==="all")return true;
    const ids=PLAYER_PRESETS?.[group]||[];
    return ids.includes(player.id);
}
function poolSortValue(player,key){
    if(key==="name")return player.name.toLowerCase();
    if(key==="id")return player.id;
    const stats=playerStats(player);
    if(key==="ovr")return playerOverall(player);
    return Number(stats[key]||0);
}
function renderPlayerPool(){
    const grid=document.getElementById("playerPoolGrid");
    const empty=document.getElementById("playerPoolEmpty");
    const query=document.getElementById("playerSearch").value.trim().toLowerCase();
    const position=document.getElementById("playerPositionFilter")?.value||playerPoolPositionFilter||"ALL";
    const group=document.getElementById("playerGroupFilter")?.value||playerPoolGroupFilter||"all";
    const sort=document.getElementById("playerSort")?.value||playerPoolSort||"id";
    playerPoolPositionFilter=position;playerPoolGroupFilter=group;playerPoolSort=sort;

    let visiblePlayers=players.filter(player => {
        const matchesQuery=player.name.toLowerCase().includes(query);
        const matchesPosition=position==="ALL" || positionGroup(primaryPosition(player))===position;
        const matchesGroup=playerMatchesPoolGroup(player,group);
        return matchesQuery&&matchesPosition&&matchesGroup;
    });
    visiblePlayers.sort((a,b)=>{
        const av=poolSortValue(a,sort),bv=poolSortValue(b,sort);
        if(typeof av==="string")return av.localeCompare(bv);
        return sort==="id"?av-bv:bv-av;
    });

    grid.innerHTML=visiblePlayers.map(player => {
        const selected=selectedPlayerIds.has(player.id);
        const watched=watchlistedPlayerIds.has(player.id);
        return `<div class="pool-player-card ${selected?"selected":""} ${watched?"watchlisted":""}" data-player-id="${player.id}">
            <button type="button" class="pool-select-hit" aria-pressed="${selected}" aria-label="${selected?"Remove":"Add"} ${esc(player.name)} from auction pool">
              <div class="pool-player-check">${selected?"✓":"+"}</div>
              <img src="${player.image}" alt="${esc(player.name)}">
              <div class="pool-player-info">
                  <span>PLAYER // ${String(player.id).padStart(2,"0")} // OVR ${playerOverall(player)}</span>
                  <strong>${esc(player.name)}</strong>
              </div>
            </button>
            <button type="button" class="pool-watch ${watched?"active":""}" data-watch-id="${player.id}" title="${watched?"Remove from":"Add to"} shortlist" aria-pressed="${watched}">${watched?"★":"☆"}</button>
        </div>`;
    }).join("");

    grid.querySelectorAll(".pool-select-hit").forEach(button => {
        button.addEventListener("click", () => {
            const id=Number(button.closest(".pool-player-card").dataset.playerId);
            if(selectedPlayerIds.has(id)) selectedPlayerIds.delete(id);
            else selectedPlayerIds.add(id);
            renderPlayerPool();
            saveSetupPreferences();
        });
    });
    grid.querySelectorAll(".pool-watch").forEach(button=>{
        button.addEventListener("click",event=>{
            event.stopPropagation();
            toggleWatchlistPlayer(Number(button.dataset.watchId),true);
        });
    });

    empty.classList.toggle("hidden", visiblePlayers.length !== 0);
    updatePoolStatus();
}

function toggleWatchlistPlayer(id,rerenderPool=false){
    if(watchlistedPlayerIds.has(id))watchlistedPlayerIds.delete(id);
    else watchlistedPlayerIds.add(id);
    playSfx("watch");
    if(rerenderPool)renderPlayerPool();
    const button=document.querySelector(`[data-current-watch="${id}"]`);
    if(button){
        const active=watchlistedPlayerIds.has(id);
        button.classList.toggle("active",active);
        button.innerHTML=`${active?"★":"☆"} ${active?"SHORTLISTED":"SHORTLIST"}`;
    }
    if(uiState.screen==="auction")saveGame();else saveSetupPreferences();
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
["playerPositionFilter","playerGroupFilter","playerSort"].forEach(id=>{
    document.getElementById(id)?.addEventListener("change",()=>{renderPlayerPool();saveSetupPreferences();});
});
renderPlayerPool();

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
                selected:[...selectedPlayerIds],
                watchlisted:[...watchlistedPlayerIds],
                poolPosition:playerPoolPositionFilter,
                poolGroup:playerPoolGroupFilter,
                poolSort:playerPoolSort
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
            watchlistedPlayerIds:[...watchlistedPlayerIds],
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
    if(Array.isArray(s.watchlisted))watchlistedPlayerIds=new Set(s.watchlisted);
    playerPoolPositionFilter=s.poolPosition||"ALL";
    playerPoolGroupFilter=s.poolGroup||"all";
    playerPoolSort=s.poolSort||"id";
    if(document.getElementById("playerPositionFilter"))document.getElementById("playerPositionFilter").value=playerPoolPositionFilter;
    if(document.getElementById("playerGroupFilter"))document.getElementById("playerGroupFilter").value=playerPoolGroupFilter;
    if(document.getElementById("playerSort"))document.getElementById("playerSort").value=playerPoolSort;
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
    watchlistedPlayerIds=new Set(saved.watchlistedPlayerIds||[]);
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
    setupScreen.classList.add("hidden");auctionScreen.classList.remove("hidden");
    updatePlayersRemaining();showAuctionComplete();
}

function showCoinFlip(){
    const t=teamByNumber(startingTeam);
    showOverlay(`
      <div class="overlay-kicker">OPENING PRIORITY // RANDOMIZED</div>
      <div class="coin" style="${teamVars(t)}"><span>BL</span></div>
      <div class="overlay-eyebrow">FIRST BID CONTROL</div>
      <h2 style="${teamVars(t)};color:var(--team)">${esc(t.name)}</h2>
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
      <p><strong style="color:${accessibleTeamAccent(fullTeam.color)}">${esc(fullTeam.name)}</strong> HAS FILLED ITS ROSTER</p>
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
        <h2 style="color:var(--team-text)">${esc(winner.name)}</h2>
        <div class="winning-price">FREE</div>
        <button id="nextPlayerButton" class="primary-button team-action"><span>NEXT PLAYER</span><b>→</b></button>
      </div>`);
    document.getElementById("nextPlayerButton").addEventListener("click",startNextAuction);
}

function showPlayerReveal(){
    playSfx("reveal");
    showOverlay(`
      <div class="overlay-kicker">TARGET ACQUIRED // ${String(auctionNumber).padStart(2,"0")}</div>
      <div class="reveal-image ${watchlistedPlayerIds.has(currentPlayer.id)?"watchlisted-reveal":""}"><img src="${currentPlayer.image}" alt="${esc(currentPlayer.name)}">${watchlistedPlayerIds.has(currentPlayer.id)?`<span class="reveal-watch-badge">★ SHORTLIST TARGET</span>`:""}</div>
      <div class="overlay-eyebrow">PLAYER SELECTED</div>
      <h2>${esc(currentPlayer.name)}</h2>
      <div class="auction-number">AUCTION // ${String(auctionNumber).padStart(2,"0")}</div>`);
    setTimeout(()=>{hideOverlay();displayOpeningBid();},1500);
}

function createPlayerCard(){
    const watched=watchlistedPlayerIds.has(currentPlayer.id);
    return `<div class="current-player ${watched?"watchlisted-target":""}">
      <div class="card-index">${String(auctionNumber).padStart(2,"0")}</div>
      <button class="current-watch ${watched?"active":""}" data-current-watch="${currentPlayer.id}" onclick="toggleWatchlistPlayer(${currentPlayer.id})" type="button">${watched?"★ SHORTLISTED":"☆ SHORTLIST"}</button>
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
function placeBid(n){
    const team=teamByNumber(n), bid=Number(document.getElementById("nextBid").value);
    if(!validateBid(bid,team,currentBid)) return;
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
        <h2 style="color:var(--team-text)">${esc(winner.name)}</h2>
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
        <h2 style="color:var(--team-text)">${esc(winner.name)}</h2>
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
function buyWithControl(n){
    const team=teamByNumber(n),bid=Number(document.getElementById("controlBid").value);
    if(!validateBid(bid,team,0)) return;
    currentBid=bid;currentBidder=n;playSfx("bid");triggerFx("bid");awardPlayer(n);
}
function passWithControl(n){playSfx("pass");const broke=n===1?2:1;currentBid=0;currentBidder=broke;awardPlayer(broke);}
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

function renderAuctionScreen(actionHTML){
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
function showOverlay(html){overlayContent.innerHTML=html;gameOverlay.classList.remove("hidden");}
function hideOverlay(){gameOverlay.classList.add("overlay-out");setTimeout(()=>{gameOverlay.classList.add("hidden");gameOverlay.classList.remove("overlay-out");},250);}

function getTeamHistory(n){return auctionHistory.filter(x=>x.teamNumber===n);}
function getMostExpensiveSigning(n){
    const a=getTeamHistory(n); if(!a.length)return null;
    return a.reduce((best,x)=>x.price>best.price?x:best,a[0]);
}
function naturalSquadOVR(team){
    if(!team.players.length)return 0;
    return Math.round(team.players.reduce((sum,p)=>sum+playerOverall(p),0)/team.players.length);
}
function getMvpSigning(n){
    const history=getTeamHistory(n);if(!history.length)return null;
    return [...history].sort((a,b)=>playerOverall(b.player)-playerOverall(a.player)||a.price-b.price)[0];
}
function getBestValueSigning(n){
    const history=getTeamHistory(n);if(!history.length)return null;
    const score=x=>playerOverall(x.player)-(x.price/Math.max(1,startingBudget))*32;
    return [...history].sort((a,b)=>score(b)-score(a)||playerOverall(b.player)-playerOverall(a.player))[0];
}
function strongestRosterChemistry(team){
    let best=null;
    for(let i=0;i<team.players.length;i++)for(let j=i+1;j<team.players.length;j++){
        const relation=chemistryRelation(team.players[i],team.players[j]);
        if(!best||relation.score>best.score)best={a:team.players[i],b:team.players[j],...relation};
    }
    return best;
}
function resultMetricLeader(a,b,higher=true){
    if(a===b)return "EVEN";
    return (higher?a>b:a<b)?team1.name:team2.name;
}
function createResultsComparison(){
    const o1=naturalSquadOVR(team1),o2=naturalSquadOVR(team2);
    const c1=strongestRosterChemistry(team1),c2=strongestRosterChemistry(team2);
    const spent1=startingBudget-team1.budget,spent2=startingBudget-team2.budget;
    return `<section class="results-comparison">
      <div class="comparison-head"><span>HEAD-TO-HEAD // DRAFT INTELLIGENCE</span><strong>POST-AUCTION COMPARISON</strong></div>
      <div class="comparison-grid">
        <div><span>SQUAD OVR</span><b style="${teamVars(team1)};color:var(--team)">${o1}</b><em>${esc(resultMetricLeader(o1,o2))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team)">${o2}</b></div>
        <div><span>CAPITAL REMAINING</span><b style="${teamVars(team1)};color:var(--team)">$${team1.budget.toLocaleString()}</b><em>${esc(resultMetricLeader(team1.budget,team2.budget))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team)">$${team2.budget.toLocaleString()}</b></div>
        <div><span>BEST CHEMISTRY</span><b style="${teamVars(team1)};color:var(--team)">${c1?.score||"--"}</b><em>${esc(resultMetricLeader(c1?.score||0,c2?.score||0))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team)">${c2?.score||"--"}</b></div>
        <div><span>CAPITAL SPENT</span><b style="${teamVars(team1)};color:var(--team)">$${spent1.toLocaleString()}</b><em>${spent1===spent2?"EVEN SPEND":"DRAFT PROFILE"}</em><b style="${teamVars(team2)};color:var(--team)">$${spent2.toLocaleString()}</b></div>
      </div>
    </section>`;
}
function createFinalTeamCard(team,n){
    const spent=startingBudget-team.budget,expensive=getMostExpensiveSigning(n),mvp=getMvpSigning(n),value=getBestValueSigning(n),chem=strongestRosterChemistry(team);
    const roster=team.players.length?team.players.map(p=>`<div class="final-player"><img src="${p.image}" alt="${esc(p.name)}"><span>${esc(p.name)}</span>${positionBadges(p,true)}<em class="effective-ovr">${playerOverall(p)}</em></div>`).join(""):`<div class="history-empty">NO PLAYERS DRAFTED</div>`;
    return `<article class="final-team-card results-team-card" style="${teamVars(team)}">
      <div class="team-accent"></div>
      <div class="final-team-top"><span>SQUAD // 0${n}</span><h3>${esc(team.name)}</h3></div>
      <div class="final-stats final-stats-v9">
        <div><span>SQUAD OVR</span><strong>${naturalSquadOVR(team)||"--"}</strong></div>
        <div><span>PLAYERS</span><strong>${team.players.length}</strong></div>
        <div><span>SPENT</span><strong>$${spent.toLocaleString()}</strong></div>
        <div><span>REMAINING</span><strong>$${team.budget.toLocaleString()}</strong></div>
      </div>
      <div class="result-intel-grid">
        <div><span>MVP SIGNING</span><strong>${mvp?esc(mvp.player.name):"—"}</strong><b>${mvp?`OVR ${playerOverall(mvp.player)}`:"—"}</b></div>
        <div><span>BEST VALUE</span><strong>${value?esc(value.player.name):"—"}</strong><b>${value?(value.price===0?"FREE":"$"+value.price.toLocaleString()):"—"}</b></div>
        <div><span>TOP VALUATION</span><strong>${expensive?esc(expensive.player.name):"—"}</strong><b>${expensive?(expensive.price===0?"FREE":"$"+expensive.price.toLocaleString()):"—"}</b></div>
        <div><span>STRONGEST CHEMISTRY</span><strong>${chem?`${esc(chem.a.name)} × ${esc(chem.b.name)}`:"—"}</strong><b class="${chem?chemistryTier(chem.score):""}">${chem?chem.score:"—"}</b></div>
      </div>
      <div class="final-roster">${roster}</div>
    </article>`;
}
function createFullHistory(){
    if(!auctionHistory.length)return `<div class="history-empty">NO COMPLETED AUCTIONS</div>`;
    return auctionHistory.map(x=>`<div class="final-history-row" style="--row-team:${accessibleTeamAccent(x.teamColor)}">
      <span class="history-number">${String(x.auction).padStart(2,"0")}</span><img src="${x.player.image}" alt="${esc(x.player.name)}">
      <div><strong>${esc(x.player.name)}</strong><span style="color:${accessibleTeamAccent(x.teamColor)}">${esc(x.teamName)}</span></div>
      <b>${x.price===0?"FREE":"$"+x.price.toLocaleString()}</b></div>`).join("");
}
function showAuctionComplete(){
    const wasComplete=uiState.phase==="complete";
    uiState={screen:"auction",phase:"complete",turn:null};saveGame();
    if(!wasComplete)playSfx("result");
    playersRemainingDisplay.innerHTML="COMPLETE";
    auctionContent.innerHTML=`<div class="complete-screen results-screen">
      <div class="complete-label">BL // FINAL SELECTION REPORT</div>
      <h2>DRAFT <span>COMPLETE</span></h2><p class="results-subtitle">FINAL SQUAD DATA // ${auctionHistory.length} TRANSFERS</p>
      <div class="results-actions results-actions-top">
        <button id="formationBuilderButton" class="primary-button restart-button"><span>TEAM BUILDER</span><b>⚽</b></button>
        <button id="shareResultsButton" class="primary-button restart-button share-action"><span>SHARE / SAVE RESULT</span><b>↗</b></button>
        <button id="restartAuctionButton" class="primary-button restart-button secondary-action"><span>NEW AUCTION</span><b>↻</b></button>
      </div>
      ${createResultsComparison()}
      <div class="final-team-grid">${createFinalTeamCard(team1,1)}${createFinalTeamCard(team2,2)}</div>
      <section class="full-history"><div class="history-heading"><div><span>COMPLETE RECORD</span><h3>TRANSFER DATABASE</h3></div><b>${String(auctionHistory.length).padStart(2,"0")}</b></div><div class="full-history-list">${createFullHistory()}</div></section>
    </div>`;
    window.scrollTo({top:0,behavior:"auto"});
    requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"auto"}));
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
function autoBestXI(){
    const n=formationTeamNumber,team=teamByNumber(n),shape=FORMATIONS[formationByTeam[n]||"4-3-3"];
    const remaining=[...team.players];
    const assignment={};
    // Fill scarce positions first (GK/defensive specialists naturally rise to the top),
    // then maximize position-adjusted OVR with primary/canonical fit bonuses.
    const slotOrder=shape.map((slot,index)=>{
        const viable=remaining.filter(p=>canonicalFit(p,slot.label)).length;
        const primary=remaining.filter(p=>primaryFit(p,slot.label)).length;
        return {slot,index,scarcity:primary*2+viable};
    }).sort((a,b)=>a.scarcity-b.scarcity || a.index-b.index);
    for(const item of slotOrder){
        if(!remaining.length)break;
        const ranked=[...remaining].map(p=>{
            const score=effectiveOVR(p,item.slot.label)+(primaryFit(p,item.slot.label)?7:canonicalFit(p,item.slot.label)?3:0);
            return {p,score};
        }).sort((a,b)=>b.score-a.score || playerOverall(b.p)-playerOverall(a.p));
        const pick=ranked[0]?.p;if(!pick)continue;
        assignment[item.index]=pick.id;
        remaining.splice(remaining.findIndex(p=>p.id===pick.id),1);
    }
    formationAssignments[n]=assignment;
    selectedFormationPlayerId=null;
    playSfx("confirm");
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
    if(!team.players.some(p=>p.id===playerId))return;

    const targetPlayer=getFormationPlayer(n,slotIndex);
    const sourceSlot=Object.keys(formationAssignments[n]).find(k=>formationAssignments[n][k]===playerId);

    if(sourceSlot!==undefined) delete formationAssignments[n][sourceSlot];
    if(targetPlayer && targetPlayer.id!==playerId){
        if(sourceSlot!==undefined) formationAssignments[n][sourceSlot]=targetPlayer.id;
        // Dragging from reserves onto an occupied slot sends that player to reserves.
    }
    formationAssignments[n][slotIndex]=playerId;
    formationMoveFx={
        movedId:playerId,
        targetSlot:slotIndex,
        sourceSlot:sourceSlot!==undefined?Number(sourceSlot):null,
        displacedId:targetPlayer&&targetPlayer.id!==playerId?targetPlayer.id:null
    };
    playSfx(targetPlayer&&targetPlayer.id!==playerId?"swap":"drop");
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function movePlayerToBench(playerId){
    const n=formationTeamNumber;
    const sourceSlot=Object.keys(formationAssignments[n]).find(k=>formationAssignments[n][k]===playerId);
    if(sourceSlot!==undefined) delete formationAssignments[n][sourceSlot];
    playSfx("drop");
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function applyFormationMoveFx(){
    if(!formationMoveFx)return;
    const fx=formationMoveFx;
    formationMoveFx=null;
    requestAnimationFrame(()=>{
        const landed=document.querySelector(`.formation-slot[data-slot-index="${fx.targetSlot}"]`);
        if(landed){
            landed.classList.add("slot-landed");
            setTimeout(()=>landed.classList.remove("slot-landed"),420);
        }
        if(fx.displacedId && fx.sourceSlot!==null){
            const swapped=document.querySelector(`.formation-slot[data-slot-index="${fx.sourceSlot}"]`);
            if(swapped){
                swapped.classList.add("slot-swapped");
                setTimeout(()=>swapped.classList.remove("slot-swapped"),420);
            }
        }else if(fx.displacedId){
            const benchCard=document.querySelector(`.bench-player[data-player-id="${fx.displacedId}"]`);
            if(benchCard){
                benchCard.classList.add("bench-arrived");
                benchCard.scrollIntoView?.({block:"nearest"});
                setTimeout(()=>benchCard.classList.remove("bench-arrived"),520);
            }
        }
    });
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
function selectFormationPlayerOnly(id){
    selectedFormationPlayerId = selectedFormationPlayerId===id ? null : id;
    renderFormationBuilder();
    saveGame();
}
function selectBenchPlayer(id) {
    const benchList = document.querySelector('.bench-list');
    const scrollTop = benchList ? benchList.scrollTop : 0;

    if (selectedFormationPlayerId === id) selectedFormationPlayerId = null;
    else selectedFormationPlayerId = id;

    renderFormationBuilder();
    saveGame();

    requestAnimationFrame(() => {
        const newBenchList = document.querySelector('.bench-list');
        if (newBenchList) {
            newBenchList.scrollTop = scrollTop;
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        }
    });
}
function updateLiveFormationTargets(playerId){
    selectedFormationPlayerId=playerId;
    const player=teamByNumber(formationTeamNumber).players.find(p=>p.id===playerId);
    const panel=document.querySelector(".player-info-panel");
    if(panel && !playerDatabaseHidden && player){
      panel.outerHTML=createPlayerInfoSidebar(teamByNumber(formationTeamNumber));
    }
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

let formationPointerDrag=null;
let suppressFormationClick=false;

function createFormationPointerPreview(player,x,y){
    // A browser interruption must never be able to leave multiple drag visuals alive.
    document.querySelectorAll(".formation-pointer-preview").forEach(el=>el.remove());
    const preview=document.createElement("div");
    preview.className="formation-pointer-preview";
    preview.innerHTML=`<div class="formation-pointer-ring"><img src="${player.image}" alt="" draggable="false"></div><span>${esc(player.name)}</span>`;
    document.body.appendChild(preview);
    moveFormationPointerPreview(x,y);
    return preview;
}
function moveFormationPointerPreview(x,y){
    const preview=formationPointerDrag?.preview;
    if(!preview)return;
    preview.style.left=x+"px";
    preview.style.top=y+"px";
}
function clearFormationPointerHover(){
    document.querySelectorAll(".formation-slot.pointer-drop-target,.formation-slot.pointer-swap-target,.bench-panel.pointer-drop-target")
      .forEach(el=>el.classList.remove("pointer-drop-target","pointer-swap-target"));
}
function formationDropTargetAt(x,y){
    const hit=document.elementFromPoint(x,y);
    if(!hit)return null;
    return hit.closest(".formation-slot,[data-formation-bench]");
}
function beginFormationPointerDrag(event,id){
    if(event.button!==undefined && event.button!==0)return;
    if(formationPointerDrag)cleanupFormationPointerDrag();
    const player=teamByNumber(formationTeamNumber).players.find(p=>p.id===id);
    if(!player)return;
    const source=event.currentTarget;
    formationPointerDrag={
        id,player,source,pointerId:event.pointerId,
        startX:event.clientX,startY:event.clientY,
        dragging:false,preview:null,target:null,
        originSlot:source.closest(".formation-slot"),
        finishing:false
    };
    source.setPointerCapture?.(event.pointerId);
}
function moveFormationPointerDrag(event){
    const d=formationPointerDrag;
    if(!d || d.pointerId!==event.pointerId)return;
    // If right/middle click joins the primary drag, abort instead of letting the
    // browser enter a mixed-button state that can strand duplicate visuals.
    if(d.dragging && event.pointerType==="mouse" && (event.buttons & ~1)!==0){
        event.preventDefault();
        suppressFormationClick=true;
        cleanupFormationPointerDrag();
        setTimeout(()=>{suppressFormationClick=false},0);
        return;
    }
    const distance=Math.hypot(event.clientX-d.startX,event.clientY-d.startY);
    if(!d.dragging){
        if(distance<7)return;
        d.dragging=true;
        draggedFormationPlayerId=d.id;
        selectedFormationPlayerId=d.id;
        d.source.classList.add("pointer-drag-source");
        if(d.originSlot)d.originSlot.classList.add("pointer-drag-origin");
        d.preview=createFormationPointerPreview(d.player,event.clientX,event.clientY);
        updateLiveFormationTargets(d.id);
        playSfx("select");
        document.body.classList.add("formation-pointer-dragging");
    }
    event.preventDefault();
    moveFormationPointerPreview(event.clientX,event.clientY);
    clearFormationPointerHover();
    d.target=formationDropTargetAt(event.clientX,event.clientY);
    if(d.target){
        d.target.classList.add("pointer-drop-target");
        if(d.target.matches(".formation-slot.occupied"))d.target.classList.add("pointer-swap-target");
    }
}
function finishFormationPointerDrag(event){
    const d=formationPointerDrag;
    if(!d || d.pointerId!==event.pointerId)return;
    d.finishing=true;
    try{d.source.releasePointerCapture?.(event.pointerId)}catch(_){}
    if(!d.dragging){
        formationPointerDrag=null;
        return;
    }
    event.preventDefault();
    suppressFormationClick=true;
    const target=formationDropTargetAt(event.clientX,event.clientY)||d.target;
    const id=d.id;
    cleanupFormationPointerDrag();
    if(target?.matches(".formation-slot")){
        const slotIndex=Number(target.dataset.slotIndex);
        if(Number.isInteger(slotIndex))movePlayerToSlot(id,slotIndex);
    }else if(target?.matches("[data-formation-bench]")){
        movePlayerToBench(id);
    }
    setTimeout(()=>{suppressFormationClick=false},0);
}
function cancelFormationPointerDrag(event){
    const d=formationPointerDrag;
    if(!d || d.finishing || (event?.pointerId!=null && d.pointerId!==event.pointerId))return;
    cleanupFormationPointerDrag();
}
function cleanupFormationPointerDrag(){
    const d=formationPointerDrag;
    if(d?.preview)d.preview.remove();
    // Safety cleanup also removes any orphaned preview left by an interrupted tab/window action.
    document.querySelectorAll(".formation-pointer-preview").forEach(el=>el.remove());
    if(d?.source)d.source.classList.remove("pointer-drag-source");
    if(d?.originSlot)d.originSlot.classList.remove("pointer-drag-origin");
    document.querySelectorAll(".pointer-drag-source,.pointer-drag-origin").forEach(el=>{
        el.classList.remove("pointer-drag-source","pointer-drag-origin");
    });
    clearFormationPointerHover();
    clearLiveFormationTargets();
    document.body.classList.remove("formation-pointer-dragging");
    draggedFormationPlayerId=null;
    formationPointerDrag=null;
}
document.addEventListener("pointermove",moveFormationPointerDrag,{passive:false});
document.addEventListener("pointerup",finishFormationPointerDrag,{passive:false});
document.addEventListener("pointercancel",cancelFormationPointerDrag);
document.addEventListener("lostpointercapture",cancelFormationPointerDrag,true);

function abortFormationDragForSecondaryInput(event){
    if(!formationPointerDrag)return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    suppressFormationClick=true;
    cleanupFormationPointerDrag();
    setTimeout(()=>{suppressFormationClick=false},0);
}

// Mouse pointerdown is only guaranteed for the FIRST pressed button. mousedown
// still fires when right-click is pressed while left-click is already held.
document.addEventListener("mousedown",event=>{
    if(formationPointerDrag && event.button!==0)abortFormationDragForSecondaryInput(event);
},true);
document.addEventListener("auxclick",event=>{
    if(formationPointerDrag)abortFormationDragForSecondaryInput(event);
},true);
document.addEventListener("contextmenu",event=>{
    if(formationPointerDrag){
        abortFormationDragForSecondaryInput(event);
        event.preventDefault();
    }
},true);

// Never allow the browser's own image/HTML drag ghost inside Team Builder.
document.addEventListener("dragstart",event=>{
    if(event.target.closest?.("#formation-screen"))event.preventDefault();
},true);

// A pointerup is not guaranteed when the browser/tab loses focus (tab switch,
// screenshot UI, browser chrome, app switch, etc.). Always tear the drag UI down.
window.addEventListener("blur",()=>cancelFormationPointerDrag());
window.addEventListener("pagehide",()=>cancelFormationPointerDrag());
document.addEventListener("visibilitychange",()=>{
    if(document.hidden)cancelFormationPointerDrag();
});

document.addEventListener("click",event=>{
    if(!suppressFormationClick)return;
    if(event.target.closest(".formation-player-token,.bench-player")){
        event.preventDefault();
        event.stopImmediatePropagation();
    }
},true);

function togglePlayerDatabase(){
  playerDatabaseHidden=!playerDatabaseHidden;
  renderFormationBuilder();
}
function clearSelectedFormationPlayer(){
  selectedFormationPlayerId=null;
  clearLiveFormationTargets();
  renderFormationBuilder();
  saveGame();
}
function setFormationDbQuery(value){
    formationDbQuery=value||"";renderFormationBuilder();
    requestAnimationFrame(()=>{const input=document.querySelector(".database-toolbar input");if(input){input.focus();input.setSelectionRange(formationDbQuery.length,formationDbQuery.length);}});
}
function setFormationDbPosition(value){formationDbPosition=value||"ALL";renderFormationBuilder();}
function setFormationDbSort(value){formationDbSort=value||"ovr";renderFormationBuilder();}
function formationDatabasePlayers(team){
    const q=formationDbQuery.trim().toLowerCase();
    return [...team.players].filter(p=>{
        const queryOk=!q||p.name.toLowerCase().includes(q);
        const positionOk=formationDbPosition==="ALL"||positionGroup(primaryPosition(p))===formationDbPosition;
        return queryOk&&positionOk;
    }).sort((a,b)=>{
        if(formationDbSort==="name")return a.name.localeCompare(b.name);
        if(formationDbSort==="position")return primaryPosition(a).localeCompare(primaryPosition(b))||playerOverall(b)-playerOverall(a);
        return playerOverall(b)-playerOverall(a);
    });
}
function createPlayerInfoSidebar(team){
  const player=team.players.find(p=>p.id===selectedFormationPlayerId);
  if(playerDatabaseHidden) return "";
  if(!player){
    const database=formationDatabasePlayers(team);
    return `<aside class="player-info-panel player-database-browser" style="${teamVars(team)}">
      <div class="player-info-top"><div><span class="player-info-code">PLAYER // DATABASE</span><strong class="database-count">${database.length}</strong></div></div>
      <div class="database-toolbar">
        <input type="search" value="${esc(formationDbQuery)}" placeholder="SEARCH SQUAD..." oninput="setFormationDbQuery(this.value)">
        <select onchange="setFormationDbPosition(this.value)">
          ${["ALL","ATTACK","MIDFIELD","DEFENCE","GK"].map(x=>`<option value="${x}" ${formationDbPosition===x?"selected":""}>${x}</option>`).join("")}
        </select>
        <select onchange="setFormationDbSort(this.value)">
          <option value="ovr" ${formationDbSort==="ovr"?"selected":""}>OVR ↓</option>
          <option value="name" ${formationDbSort==="name"?"selected":""}>NAME A-Z</option>
          <option value="position" ${formationDbSort==="position"?"selected":""}>POSITION</option>
        </select>
      </div>
      <div class="database-roster">${database.length?database.map(p=>`<button onclick="selectFormationPlayerOnly(${p.id})"><img src="${p.image}" alt=""><span><strong>${esc(p.name)}</strong><small>${primaryPosition(p)} // OVR ${playerOverall(p)}</small></span><b>${playerOverall(p)}</b></button>`).join(""):`<div class="history-empty">NO MATCHING PLAYERS</div>`}</div>
    </aside>`;
  }
  const s=playerStats(player);
  const stat=(label,value)=>`<div class="player-stat-row"><div class="player-stat-label"><span>${label}</span><strong>${value}</strong></div><div class="player-stat-track"><i style="width:${Math.max(0,Math.min(100,value))}%"></i></div></div>`;
  return `<aside class="player-info-panel" style="${teamVars(team)}">
    <div class="player-info-top"><div><span class="player-info-code">PLAYER // PROFILE</span><strong class="player-info-id">${String(player.id).padStart(2,"0")}</strong></div>
    <button class="player-info-close" onclick="clearSelectedFormationPlayer()" aria-label="Clear selected player">×</button></div>
    ${(()=>{const slot=currentPlayerSlot(formationTeamNumber,player.id);const pos=slot?.label||primaryPosition(player);return `<div class="player-info-portrait"><img src="${player.image}" alt="${esc(player.name)}"><div class="player-info-ovr"><span>${slot?pos:"OVR"}</span><strong>${slot?effectiveOVR(player,pos):playerOverall(player)}</strong></div></div>`})()}
    <div class="player-info-name"><span>PLAYER</span><h2>${esc(player.name)}</h2>${positionBadges(player)}</div>
    <div class="player-info-section current-position-rating">${(()=>{const slot=currentPlayerSlot(formationTeamNumber,player.id);const pos=slot?.label||primaryPosition(player);return `<div class="player-info-section-title"><span>${slot?"CURRENT POSITION":"RESERVE // NATURAL POSITION"}</span></div><div class="current-ovr-row"><strong>${pos}</strong><b>${slot?effectiveOVR(player,pos):playerOverall(player)}</b></div>`})()}</div>
    <div class="player-info-section"><div class="player-info-section-title"><span>CORE ATTRIBUTES</span></div>
      ${stat("OFF",s.off)}${stat("SHO",s.sho)}${stat("SPD",s.spd)}${stat("DEF",s.def)}${stat("PAS",s.pas)}${stat("DRI",s.dri)}${stat("GK",s.gk)}
    </div>
  </aside>`;
}

function renderFormationBuilder(){
    hideChemistryTooltip();
    const team=teamByNumber(formationTeamNumber);
    activeFormation=formationByTeam[formationTeamNumber]||"4-3-3";
    const slots=FORMATIONS[activeFormation];
    sanitizeFormationAssignments(formationTeamNumber);
    const used=assignedIds(formationTeamNumber);
    const bench=team.players.filter(p=>!used.has(p.id));
    const selectedPlayer=team.players.find(p=>p.id===selectedFormationPlayerId);

    formationContent.innerHTML=`
      <div class="formation-v2-shell">
        <div class="formation-topbar">
          <div class="formation-team-tabs">
            ${[1,2].map(n=>{const t=teamByNumber(n);return `<button class="${formationTeamNumber===n?"active":""}" style="${teamVars(t)}" onclick="switchFormationTeam(${n})"><span>SQUAD 0${n}</span>${esc(t.name)}</button>`}).join("")}
          </div>
          <div class="formation-actions">
            <button class="formation-auto" onclick="autoBestXI()">⚡ AUTO BEST XI</button>
            <button class="formation-reset" onclick="resetCurrentFormation()">↻ CLEAR XI</button>
            <button class="formation-database-toggle" onclick="togglePlayerDatabase()">${playerDatabaseHidden?"SHOW DATABASE":"HIDE DATABASE"}</button>
                    <button class="formation-bench-toggle" onclick="toggleBench()">${benchCollapsed?"SHOW BENCH":"HIDE BENCH"}</button>
          </div>
        </div>

        <div class="formation-control-panel" style="${teamVars(team)}">
          <div>
            <span>FORMATION // ${esc(team.name)}</span>
            <strong>${activeFormation}</strong>
          </div>
          <details class="formation-menu">
            <summary><span>CHANGE FORMATION</span><b>${activeFormation}</b><i>⌄</i></summary>
            <div class="formation-menu-popover">
              <div class="formation-menu-group"><span>BACK FOUR</span>
                ${["4-3-3","4-2-3-1","4-4-2","4-1-3-2","4-3-2-1"].map(f=>`<button class="${activeFormation===f?"active":""}" onclick="changeFormation('${f}')">${f}</button>`).join("")}
              </div>
              <div class="formation-menu-group"><span>BACK THREE</span>
                ${["3-4-3","3-5-2","3-4-2-1"].map(f=>`<button class="${activeFormation===f?"active":""}" onclick="changeFormation('${f}')">${f}</button>`).join("")}
              </div>
              <div class="formation-menu-group"><span>BACK FIVE</span>
                ${["5-3-2","5-2-3"].map(f=>`<button class="${activeFormation===f?"active":""}" onclick="changeFormation('${f}')">${f}</button>`).join("")}
              </div>
            </div>
          </details>
        </div>

        ${chemistryHud(formationTeamNumber,team)}
        <div class="formation-instructions" style="${teamVars(team)}">
          <span>TACTICAL BOARD // DRAG & DROP ENABLED</span>
          <strong>${selectedPlayer?`${esc(selectedPlayer.name)} // PRIMARY: ${primaryPosition(selectedPlayer)} // CANON: ${playerPositions(selectedPlayer).join(" / ")}`:"SELECT A PLAYER TO HIGHLIGHT CANONICAL POSITIONS // DRAG OR TAP TO PLACE"}</strong>
        </div>

        <div class="formation-layout ${benchCollapsed?"bench-hidden":""} ${playerDatabaseHidden?"database-hidden":""}">
          <div class="football-pitch formation-pitch-v2" style="${teamVars(team)}">
            <div class="pitch-stripes"></div>
            ${chemistrySvg(formationTeamNumber)}
            <div class="pitch-halfway"></div><div class="pitch-circle"></div><div class="pitch-dot"></div>
            <div class="penalty-box top"></div><div class="penalty-box bottom"></div>
            <div class="goal-box top"></div><div class="goal-box bottom"></div>
            ${slots.map((s,i)=>{
               const p=getFormationPlayer(formationTeamNumber,i);
               const selected=p&&p.id===selectedFormationPlayerId;
               const canonicalTarget=selectedPlayer&&canonicalFit(selectedPlayer,s.label);
               const primaryTarget=selectedPlayer&&primaryFit(selectedPlayer,s.label);
               const currentFit=p&&canonicalFit(p,s.label);
               return `<button class="formation-slot ${p?"occupied":""} ${selected?"selected":""} ${canonicalTarget?"canonical-target":""} ${primaryTarget?"primary-target":""} ${currentFit?"natural-fit":""}"
                    style="left:${s.x}%;top:${s.y}%" data-slot-label="${s.label}" data-slot-index="${i}"
                    onclick="clickFormationSlot(${i})"
                    ondragover="allowFormationDrop(event)" ondragleave="leaveFormationDrop(event)" ondrop="dropOnFormationSlot(event,${i})">
                  <span class="slot-position">${s.label}</span>
                  ${p?`<div class="formation-player-token" draggable="false" onclick="event.stopPropagation();selectFormationPlayerOnly(${p.id})" onpointerdown="beginFormationPointerDrag(event,${p.id})">
                         <img src="${p.image}" alt="${esc(p.name)}"><strong>${esc(p.name)}</strong>${positionBadges(p,true)}
                       </div>`:`<span class="empty-slot">+</span>`}
               </button>`;
            }).join("")}
          </div>

          ${createPlayerInfoSidebar(team)}

          <aside class="bench-panel ${benchCollapsed?"collapsed":""}" style="${teamVars(team)}" data-formation-bench>
            <div class="bench-heading"><div><span>RESERVES</span><small>DROP HERE TO BENCH</small></div><strong>${bench.length}</strong></div>
            <div class="bench-list">
              ${bench.length?bench.map(p=>`<button class="bench-player ${p.id===selectedFormationPlayerId?"selected":""}"
                    data-player-id="${p.id}"
                    onclick="selectBenchPlayer(${p.id})" draggable="false"
                    onpointerdown="beginFormationPointerDrag(event,${p.id})">
                    <img src="${p.image}" alt="${esc(p.name)}">
                    <span class="bench-player-copy"><strong>${esc(p.name)}</strong>${positionBadges(p,true)}<small>OVR ${playerOverall(p)} // ${primaryPosition(p)}</small></span>
                    <b>DRAG</b>
                  </button>`).join(""):`<div class="history-empty">NO SUBSTITUTES</div>`}
            </div>
          </aside>
        </div>
      </div>`;
    applyFormationMoveFx();
}
document.getElementById("backToResults").addEventListener("click",()=>{
    hideChemistryTooltip();
    formationScreen.classList.add("hidden");auctionScreen.classList.remove("hidden");
    showAuctionComplete();
    window.scrollTo({top:0,behavior:"smooth"});
});

const initialSaved=loadSavedData();
if(initialSaved?.gameActive) showResumeCard(initialSaved);
else restoreSetup(initialSaved);
setVisibleScreen(menuScreen);
refreshMainMenu();
