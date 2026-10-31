// BLUE LOCK DRAFT // PLAYER DATA + RATINGS
// Split from the former root script.js. Classic scripts share the same global scope.

const players = [
    ISAGI_PLAYER_DATA,
    PLAYER_2_DATA,
    PLAYER_3_DATA,
    PLAYER_4_DATA,
    PLAYER_5_DATA,
    PLAYER_6_DATA,
    PLAYER_7_DATA,
    PLAYER_8_DATA,
    PLAYER_9_DATA,
    PLAYER_10_DATA,
    PLAYER_11_DATA,
    PLAYER_12_DATA,
    PLAYER_13_DATA,
    PLAYER_14_DATA,
    PLAYER_15_DATA,
    PLAYER_16_DATA,
    PLAYER_17_DATA,
    PLAYER_18_DATA,
    PLAYER_19_DATA,
    PLAYER_20_DATA,
    PLAYER_21_DATA,
    PLAYER_22_DATA,
    PLAYER_23_DATA,
    PLAYER_24_DATA,
    PLAYER_25_DATA,
    PLAYER_26_DATA,
    PLAYER_27_DATA,
    PLAYER_28_DATA,
    PLAYER_29_DATA,
    PLAYER_30_DATA,
    PLAYER_31_DATA,
    PLAYER_32_DATA,
    PLAYER_33_DATA,
    PLAYER_34_DATA,
    PLAYER_35_DATA,
    PLAYER_36_DATA,
    PLAYER_37_DATA,
    PLAYER_38_DATA,
    PLAYER_39_DATA,
    PLAYER_40_DATA,
    PLAYER_41_DATA,
    PLAYER_42_DATA,
    PLAYER_43_DATA,
    PLAYER_44_DATA,
    PLAYER_45_DATA,
    PLAYER_46_DATA,
    PLAYER_47_DATA,
    PLAYER_48_DATA,
    PLAYER_49_DATA,
    PLAYER_50_DATA,
    PLAYER_51_DATA,
    PLAYER_52_DATA,
    PLAYER_53_DATA,
    PLAYER_54_DATA,
    PLAYER_55_DATA,
    PLAYER_56_DATA,
    PLAYER_57_DATA,
    PLAYER_58_DATA,
    PLAYER_59_DATA,
    PLAYER_60_DATA,
    PLAYER_61_DATA,
    PLAYER_62_DATA,
    PLAYER_63_DATA,
    PLAYER_64_DATA,
    PLAYER_65_DATA,
    PLAYER_66_DATA,
    PLAYER_67_DATA,
    PLAYER_68_DATA,
    PLAYER_69_DATA,
    PLAYER_70_DATA,
    PLAYER_71_DATA,
    PLAYER_72_DATA,
    PLAYER_73_DATA,
    PLAYER_74_DATA,
    PLAYER_75_DATA,
    PLAYER_76_DATA,
    PLAYER_77_DATA,
    PLAYER_78_DATA,
    PLAYER_79_DATA,
    PLAYER_80_DATA,
    PLAYER_81_DATA,
    PLAYER_82_DATA,
    PLAYER_83_DATA,
    PLAYER_84_DATA,
    PLAYER_85_DATA,
    PLAYER_86_DATA,
    PLAYER_87_DATA,
    PLAYER_88_DATA
];

players.forEach(player=>{
    // Keep a stable weapons array on every character for the future Battle Sim.
    if(!Array.isArray(player.weapons)) player.weapons=[];
    if(player?.image) player.image=new URL(player.image,document.baseURI).href;
});

// IDs and gameplay array order stay stable. Chronology is a display-only sort.
const PLAYER_BY_ID=new Map(players.map(player=>[player.id,player]));
const PLAYER_BY_SECRET_ID=new Map(players.filter(player=>player.secretCharacter&&player.secretId).map(player=>[player.secretId.toUpperCase(),player]));
function playerById(id){
    if(typeof id==="string"&&/^SC-\d+$/i.test(id.trim()))return PLAYER_BY_SECRET_ID.get(id.trim().toUpperCase())||null;
    return PLAYER_BY_ID.get(Number(id))||null;
}
// Keep internal numeric keys stable for saves; secret characters use their own visible IDs.
function playerDisplayId(player){
    if(player?.secretCharacter)return player.secretId||("SC-"+String(player.id));
    return String(player?.id??"").padStart(2,"0");
}
function comparePlayerAppearance(a,b){
    return a.debutChapter-b.debutChapter||a.appearanceOrder-b.appearanceOrder||a.id-b.id;
}

function playerStats(player){return player?.stats||{ovr:70,off:70,sho:70,spd:70,def:70,pas:70,dri:70,gk:40};}

function squadRatings(teamNumber){
    const profile=formationContributionSnapshot(teamNumber),placed=profile.members;
    if(!placed.length)return {ovr:0,att:0,mid:0,def:0};
    const group=labels=>{const matches=placed.filter(x=>labels.includes(x.label));return lineupOVRProfile((matches.length?matches:placed).map(x=>x.raw)).value;};
    return {ovr:profile.effectiveQuality,att:group(["ST","CF","LW","RW","AM"]),mid:group(["CM","DM","AM","LM","RM","LWB","RWB"]),def:group(["GK","CB","LB","RB","LWB","RWB","DM"])};
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
    return !!player?.allPositions || playerPositions(player).some(role=>slotMatchesRole(slotLabel,role));
}
function primaryFit(player,slotLabel){
    return !!player?.allPositions || slotMatchesRole(slotLabel,primaryPosition(player));
}
function positionBadges(player,compact=false){
    const positions=player?.allPositions?["ALL"]:playerPositions(player);
    return `<span class="position-badges ${compact?"compact":""}">${positions.map(pos=>`<i class="${player?.allPositions||pos===primaryPosition(player)?"primary":""}">${pos}</i>`).join("")}</span>`;
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
function playerOverall(player){
  if(!player)return 0;
  const stated=Number(playerStats(player).ovr);
  return Number.isFinite(stated)?Math.max(1,Math.min(100,Math.round(stated))):calculatePositionOVR(player,primaryPosition(player));
}
function effectiveOVR(player,slotLabel,links=[]){return playerContribution(player,slotLabel,links).effective;}
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
    const score=effectiveOVR(player,pos);
    const canon=canonicalFit(player,pos), primary=primaryFit(player,pos);
    return `<div class="position-rating ${canon?"canon":""} ${primary?"primary":""}"><span>${pos}</span><strong>${score}</strong></div>`;
  }).join("")}</div>`;
}
