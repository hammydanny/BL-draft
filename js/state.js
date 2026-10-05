// BLUE LOCK DRAFT // APPLICATION STATE + SHARED HELPERS
// Split from the former root script.js. Classic scripts share the same global scope.

let team1 = { name:"", color:"#19a7ff", budget:0, players:[] };
let team2 = { name:"", color:"#ff315d", budget:0, players:[] };
let bidIncrement = 50, maxPlayers = 15, startingBudget = 15000;
let remainingPlayers = [], currentPlayer = null, currentBid = 0, currentBidder = null;
let startingTeam = null, auctionNumber = 0, auctionHistory = [];
let draftMode = "auction";
let selectedPlayerIds = new Set(players.map(player => player.id));
let playerPoolPositionFilter = "ALL";
let playerPoolGroupFilter = "all";
let playerPoolSort = "id";
let playerPoolCategoryState = {};
let playerPoolManualOverrides = {};
let formationDbQuery = "";
let formationDbPosition = "ALL";
let formationDbSort = "ovr";
const SAVE_KEY="blAuctionSaveV2";
let uiState={screen:"setup",phase:"setup",turn:null};
let pendingConfirmAction=null;

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
let formationCaptainByTeam = { 1:null, 2:null };
let selectedFormationPlayerId = null;
let benchCollapsed = false;
let draggedFormationPlayerId = null;
let formationInitialized = false;
let playerDatabaseHidden = false;
let formationMoveFx=null;

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

