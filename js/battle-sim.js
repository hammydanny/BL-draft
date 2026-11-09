/* BATTLE SIM // Generic football simulation and text UI. */
(function () {
"use strict";
const AUCTION_STORAGE_KEY="blAuctionSaveV2", STANDALONE_STORAGE_KEY="blStandaloneBuilderV1", LAUNCH_KEY="blBattleSimLaunchV1", RESULT_KEY="blBattleSimLastResultV1", ACTIVE_MATCH_KEY="blBattleSimActiveMatchV1", SETUP_RETURN_KEY="blBattleSimSetupReturnV1";
const HALF=2700,FULL=5400,TICK_DELAY=45,MAX_SEQUENCE=10000,BLUE="#19a7ff",RED="#ff315d";
const GRID=[[0,2,1],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,17,16]];
const ZONES={};
GRID.forEach((r,y)=>r.forEach((id,x)=>ZONES[id]={x:x,y:y,id:id}));
const BASE_SLOTS=[
{x:50,y:90,label:"GK"},{x:16,y:72,label:"LB"},{x:38,y:72,label:"CB"},{x:62,y:72,label:"CB"},{x:84,y:72,label:"RB"},
{x:24,y:48,label:"CM"},{x:50,y:48,label:"CM"},{x:76,y:48,label:"CM"},{x:18,y:20,label:"LW"},{x:50,y:20,label:"ST"},{x:82,y:20,label:"RW"}
];
const STRATEGIES=[
{key:"tempo",label:"Tempo",low:"Measured",high:"Fast"},
{key:"directness",label:"Directness",low:"Short passes",high:"Forward balls"},
{key:"pressing",label:"Pressing",low:"Hold shape",high:"Aggressive"},
{key:"line",label:"Defensive line",low:"Deep",high:"High"},
{key:"width",label:"Width",low:"Compact",high:"Wide"}
];
const DEFAULT_STRATEGY={tempo:52,directness:48,pressing:48,line:45,width:55};
let launchSnapshot=null,savedTeams=[],setupTeams=[],match=null,initialized=false,runnerTimer=null,matchViewBuilt=false,feedTimer=null,feedQueue=[],feedQueueIds=new Set(),feedDelayMs=1000,stoppageTimer=null,draggedReserve=null,feedDeadline=0,feedRemaining=null,fastForwarding=false,introTimer=null;
const byId=id=>document.getElementById(id);
function make(tag,cls,label){const e=document.createElement(tag);if(cls)e.className=cls;if(label!==undefined&&label!==null)e.textContent=String(label);return e;}
function put(parent,child){if(parent&&child)parent.appendChild(child);return child;}
function labelField(parent,title,input){const label=make("label","bs-field");put(label,make("span","bs-field-label",title));put(label,input);put(parent,label);return label;}
function button(parent,label,cls,attrs){const b=make("button",cls||"bs-button",label);b.type="button";Object.keys(attrs||{}).forEach(k=>b.setAttribute(k,String(attrs[k])));put(parent,b);return b;}
function option(select,value,label,disabled){const o=make("option","",label);o.value=value;if(disabled)o.disabled=true;put(select,o);return o;}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function feedDelayLabel(milliseconds){return (milliseconds/1000).toFixed(2).replace(/\.?0+$/,'')+'s';}
function sigmoid(x){return 1/(1+Math.exp(-x));}
function logit(p){p=clamp(p,.001,.999);return Math.log(p/(1-p));}
function idOf(x){return String(x==null?"":x);}
function validColor(c){return /^#[0-9a-f]{6}$/i.test(String(c||""));}
function timeLabel(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(Math.floor(s%60)).padStart(2,"0");}
function baseStats(raw){const s=raw&&raw.stats&&typeof raw.stats==="object"?raw.stats:raw||{};const g=(k,d)=>{const n=Number(s[k]!=null?s[k]:raw&&raw[k]);return Number.isFinite(n)?clamp(n,1,100):d;};const v={off:g("off",70),sho:g("sho",65),dri:g("dri",65),pas:g("pas",65),def:g("def",60),gk:g("gk",25),spd:g("spd",65)};v.ovr=g("ovr",(v.off+v.sho+v.dri+v.pas+v.def+v.spd)/6);return v;}
function cleanPlayer(raw,index){raw=raw||{};const primary=String(raw.primaryPosition||raw.position||(raw.positions&&raw.positions[0])||"CM");return{id:idOf(raw.id==null?"p-"+index+"-"+raw.name:raw.id),name:String(raw.name||"Unnamed Player"),blueLockMan:isSpecialKeeper(raw)&&raw.blueLockMan===true,image:String(raw.image||""),primaryPosition:primary,positions:Array.isArray(raw.positions)?raw.positions.map(String):[primary],stats:baseStats(raw),weapons:Array.isArray(raw.weapons)?raw.weapons:[],battleSim:raw.battleSim||null};}
function randomPick(list,rng){return list.length?list[Math.floor(rng()*list.length)]:null;}
function playerIn(team,id){return team.roster.find(p=>idOf(p.id)===idOf(id))||null;}
function formationSlots(name){if(typeof FORMATIONS!=="undefined"&&FORMATIONS[name]&&FORMATIONS[name].length)return FORMATIONS[name].map(s=>({x:Number(s.x)||50,y:Number(s.y)||50,label:String(s.label||"CM")}));return BASE_SLOTS.map(s=>Object.assign({},s));}
function bestStarting(roster,count){if(!roster.length)return[];const sorted=roster.slice().sort((a,b)=>b.stats.gk-a.stats.gk);const keeper=sorted[0];const out=[keeper];roster.filter(p=>p.id!==keeper.id).sort((a,b)=>b.stats.ovr-a.stats.ovr).forEach(p=>{if(out.length<count)out.push(p);});return out.slice(0,count).map(p=>p.id);}
function defaultAssignment(roster,slots,count){
 const remaining=roster.slice(),assignment={};
 // Use the shared position-suitability model for generated lineups only.
 slots.slice(0,count).forEach((slot,i)=>{
  remaining.sort((a,b)=>{
   const score=p=>slot.label==="GK"?p.stats.gk:typeof playerPositionProfile==="function"?playerPositionProfile(typeof playerById==="function"?playerById(p.id)||p:p,slot.label).position:p.stats.ovr;
   return score(b)-score(a)||Number(a.id)-Number(b.id);
  });const p=remaining.shift();if(p)assignment[String(i)]=p.id;
 });return assignment;
}
function normalizeTeam(input,number){input=input&&typeof input==="object"?input:{};const roster=[],seen=new Set();(Array.isArray(input.roster)?input.roster:Array.isArray(input.players)?input.players:[]).forEach((raw,i)=>{let p=resolveSharedPlayer(raw,i);if(p&&isSpecialKeeper(p)){if(roster.some(isSpecialKeeper))return;p=cleanPlayer(blueLockManFor(number===2?2:1),i);}if(p&&!seen.has(p.id)){seen.add(p.id);roster.push(p);}});const formation=typeof FORMATIONS!=="undefined"&&FORMATIONS[input.formation]?String(input.formation):"4-3-3",slots=formationSlots(formation);const valid=new Set(roster.map(p=>p.id)),assignment={};const sourceAssignment=input.assignment||input.assignments||{};Object.keys(sourceAssignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const sourceId=idOf(sourceAssignment[k]),id=isSpecialKeeper({id:sourceId})?idOf(blueLockManFor(number===2?2:1).id):sourceId;if(Number.isInteger(Number(k))&&Number(k)>=0&&Number(k)<slots.length&&valid.has(id)&&!Object.values(assignment).includes(id))assignment[String(k)]=id;});const count=Math.min(11,roster.length,slots.length);if(!Object.keys(assignment).length)Object.assign(assignment,defaultAssignment(roster,slots,count));else{const used=new Set(Object.values(assignment));const rest=roster.slice().sort((a,b)=>b.stats.ovr-a.stats.ovr).filter(p=>!used.has(p.id));for(let i=0;i<slots.length&&Object.keys(assignment).length<count;i++){if(assignment[String(i)]==null&&rest.length)assignment[String(i)]=rest.shift().id;}}while(Object.keys(assignment).length>count)delete assignment[Object.keys(assignment).sort((a,b)=>Number(b)-Number(a))[0]];const special=roster.find(p=>isSpecialKeeper(p));
if(special){const goal=String(slots.findIndex(s=>s.label==="GK"));const previous=assignment[goal];Object.keys(assignment).forEach(k=>{if(assignment[k]===special.id)delete assignment[k];});assignment[goal]=special.id;if(previous&&previous!==special.id){const free=slots.findIndex((s,i)=>assignment[String(i)]==null);if(free>=0&&Object.keys(assignment).length<count)assignment[String(free)]=previous;}}
const strategy={};STRATEGIES.forEach(d=>{const v=Number(input.strategy&&input.strategy[d.key]!=null?input.strategy[d.key]:DEFAULT_STRATEGY[d.key]);strategy[d.key]=Number.isFinite(v)?clamp(v,0,100):DEFAULT_STRATEGY[d.key];});return{number:number,name:String(input.name||"TEAM "+number).slice(0,32),color:validColor(input.color)?input.color:(number===1?BLUE:RED),roster:roster,formation:formation,slots:slots,assignment:assignment,strategy:strategy,source:String(input.source||"random"),savedId:input.savedId||""};}
function serializeTeam(team){return{name:team.name,color:team.color,formation:team.formation,slots:team.slots.map(s=>Object.assign({},s)),assignment:Object.assign({},team.assignment),strategy:Object.assign({},team.strategy),source:team.source,roster:team.roster.map(p=>({id:p.id,name:p.name,image:p.image,primaryPosition:p.primaryPosition,positions:p.positions.slice(),stats:Object.assign({},p.stats)}))};}
function readSharedStorage(key){try{return JSON.parse(localStorage.getItem(key)||"null");}catch(e){return null;}}
function isSpecialKeeper(p){return p&&(idOf(p.id)==="9101"||idOf(p.id)==="9102");}
function resolveSharedPlayer(ref,index){
 const refId=ref&&typeof ref==="object"?(ref.id!=null?ref.id:ref.playerId):ref;
 const pool=typeof players!=="undefined"&&Array.isArray(players)?players:[];
 const raw=typeof playerById==="function"?playerById(refId):pool.find(p=>p&&idOf(p.id)===idOf(refId));
 if(raw){
  if(raw.secretCharacter&&(typeof secretPlayerAvailable!=="function"||!secretPlayerAvailable(raw)))return null;
  return cleanPlayer(raw,index);
 }
 return null;
}
function resolveSharedRoster(list){
 if(!Array.isArray(list))return[];
 const roster=[],seen=new Set();
 list.forEach((ref,index)=>{const p=resolveSharedPlayer(ref,index);if(p&&!seen.has(p.id)){seen.add(p.id);roster.push(p);}});
 return roster;
}
function loadSavedTeams(){
 const out=[];
 let auction=readSharedStorage(AUCTION_STORAGE_KEY);
 try{if(auction&&typeof normalizeAuctionSave==="function")auction=normalizeAuctionSave(auction);}catch(e){auction=null;}
 if(auction&&auction.gameActive===true&&auction.team1&&auction.team2){
  [1,2].forEach(number=>{
   const raw=auction["team"+number]||{};
   const refs=Array.isArray(raw.players)?raw.players:Array.isArray(raw.playerIds)?raw.playerIds:Array.isArray(raw.roster)?raw.roster:[];
   const roster=resolveSharedRoster(refs);
   if(!roster.length)return;
   const key=String(number),savedFormation=auction.formationByTeam&&auction.formationByTeam[key];
   const formation=typeof FORMATIONS!=="undefined"&&FORMATIONS[savedFormation]?savedFormation:"4-3-3";
   const assignment=auction.formationAssignments&&auction.formationAssignments[key]||{};
   const team=normalizeTeam({name:raw.name,color:raw.color,roster:roster,formation:formation,slots:formationSlots(formation),assignment:assignment,source:"saved",savedId:"auction-team-"+number},number);
   team.source="saved";team.savedId="auction-team-"+number;
   out.push({id:team.savedId,name:team.name+" · AUCTION TEAM "+number,createdAt:"",team:team});
  });
 }
 let standalone=readSharedStorage(STANDALONE_STORAGE_KEY);
 try{if(standalone&&typeof normalizeStandaloneSave==="function")standalone=normalizeStandaloneSave(standalone);}catch(e){standalone=null;}
 if(standalone){
  const roster=resolveSharedRoster(standalone.playerIds);
  if(roster.length){
   const formation=typeof FORMATIONS!=="undefined"&&FORMATIONS[standalone.formation]?standalone.formation:"4-3-3";
   const team=normalizeTeam({name:standalone.name||"GLOBAL XI",color:standalone.color,roster:roster,formation:formation,slots:formationSlots(formation),assignment:standalone.assignment||{},source:"saved",savedId:"standalone-global-xi"},3);
   team.source="saved";team.savedId="standalone-global-xi";
   out.push({id:team.savedId,name:team.name+" · STANDALONE BUILDER",createdAt:"",team:team});
  }
 }
 return out;
}
function saveTeamToSharedStandalone(team,name){
 try{
  const pool=typeof players!=="undefined"&&Array.isArray(players)?players:[];
  const availableIds=new Set(pool.concat(typeof BLUE_LOCK_MAN_KEEPERS!=="undefined"?BLUE_LOCK_MAN_KEEPERS:[]).filter(p=>p&&(!p.secretCharacter||(typeof secretPlayerAvailable==="function"&&secretPlayerAvailable(p)))).map(p=>Number(p.id)).filter(Number.isInteger));
  const rosterIds=Array.from(new Set(team.roster.map(p=>Number(p.id))));
  if(!rosterIds.length||rosterIds.some(id=>!Number.isInteger(id)||!availableIds.has(id)))return false;
  const valid=new Set(rosterIds),assignment={};
  Object.entries(team.assignment||{}).forEach(([slot,id])=>{const slotNumber=Number(slot),playerId=Number(id);if(Number.isInteger(slotNumber)&&slotNumber>=0&&slotNumber<=10&&Number.isInteger(playerId)&&valid.has(playerId))assignment[String(slotNumber)]=playerId;});
  const previous=readSharedStorage(STANDALONE_STORAGE_KEY)||{};
  const previousCaptain=previous.captainId==null?null:Number(previous.captainId);
  const saved={
   schemaVersion:typeof STANDALONE_SAVE_SCHEMA_VERSION!=="undefined"?STANDALONE_SAVE_SCHEMA_VERSION:1,
   name:String(name||team.name||"GLOBAL XI").slice(0,32),
   color:validColor(team.color)?team.color:BLUE,
   playerIds:rosterIds,
   formation:typeof FORMATIONS!=="undefined"&&FORMATIONS[team.formation]?team.formation:"4-3-3",
   assignment:assignment,
   captainId:previousCaptain!==null&&Number.isInteger(previousCaptain)&&valid.has(previousCaptain)?previousCaptain:null,
   role:["ALL","ATTACK","MIDFIELD","DEFENCE","GK"].includes(previous.role)?previous.role:"ALL",
   sort:["id","ovr","name"].includes(previous.sort)?previous.sort:"id",
   poolHidden:!!previous.poolHidden
  };
  localStorage.setItem(STANDALONE_STORAGE_KEY,JSON.stringify(saved));
  return true;
 }catch(e){return false;}
}
function playerPool(){if(typeof players==="undefined"||!Array.isArray(players))return[];return players.filter(p=>p&&p.id!=null&&!p.secretCharacter);}
function randomTeam(number,old){const all=playerPool().slice();for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]];}const roster=all.slice(0,Math.min(15,all.length)).map(cleanPlayer);if(!roster.length){for(let i=0;i<15;i++)roster.push(cleanPlayer({id:"sample-"+number+"-"+i,name:"Player "+(i+1),primaryPosition:i===0?"GK":i<5?"DF":i<10?"MF":"FW",stats:{ovr:60+Math.floor(Math.random()*30),off:65,sho:65,dri:65,pas:65,def:65,gk:i===0?82:25,spd:65}},i));}const team=normalizeTeam({name:old&&old.name|| (number===1?"RANDOM XI A":"RANDOM XI B"),color:old&&old.color,roster:roster,formation:"4-3-3",strategy:old&&old.strategy},number);team.source="random";return team;}
function snapshotTeam(raw,number,snapshot){const formation=snapshot&&snapshot.formations&&snapshot.formations[number]||"4-3-3";const assignments=snapshot&&snapshot.assignments&&snapshot.assignments[number]||{};const t=normalizeTeam({name:raw&&raw.name,color:raw&&raw.color,players:raw&&raw.players||[],formation:formation,slots:formationSlots(formation),assignment:assignments,strategy:DEFAULT_STRATEGY,source:"auction"},number);t.source="auction";return t;}
function randSeed(){if(window.crypto&&window.crypto.getRandomValues){const a=new Uint32Array(1);window.crypto.getRandomValues(a);return a[0]||0x91e10da5;}return(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;}
function seeded(seed,restoreState){
 let v=(restoreState==null?seed:restoreState)>>>0;
 const rng=function(){v=(v+0x6D2B79F5)>>>0;let t=v;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
 rng.getState=function(){return v>>>0;};return rng;
}
// Compact event-boundary views contain only mutable match data, never another roster.
// The engine stays authoritative; rendering cannot consume its future state or RNG.
function capturePresentation(state){
 return{v:2,timeSeconds:state.timeSeconds,phase:state.phase,score:{...state.score},possession:state.possession,
  ball:{...point(state.ball||state.ballZone)},ballZone:state.ballZone,carrierId:state.carrierId,
  teams:Object.fromEntries([1,2].map(n=>[n,{assignment:{...state.teams[n].assignment},
   players:state.teams[n].roster.map(p=>[p.id,p.zone,p.stamina,p.flow,p.role,p.yellows,!!p.sentOff,p.match.points,p.x,p.y])}]))};
}
function validPresentation(view,state){
 if(!view||![1,2].includes(view.v)||!Number.isFinite(view.timeSeconds)||view.timeSeconds<0||view.timeSeconds>FULL||
  !["firstHalf","halfTime","secondHalf","fullTime"].includes(view.phase)||![1,2].includes(view.possession)||!ZONES[view.ballZone])return false;
 if(view.v===2&&(!view.ball||!Number.isFinite(view.ball.x)||!Number.isFinite(view.ball.y)||view.ball.x<0||view.ball.x>100||view.ball.y<0||view.ball.y>100))return false;
 return[1,2].every(n=>{
  const t=view.teams?.[n],team=state.teams[n];
  return Number.isInteger(view.score?.[n])&&view.score[n]>=0&&view.score[n]<=state.score[n]&&t&&t.assignment&&
   Array.isArray(t.players)&&t.players.length===team.roster.length&&new Set(t.players.map(p=>p[0])).size===team.roster.length&&
   t.players.every(p=>Array.isArray(p)&&playerIn(team,p[0])&&!!ZONES[p[1]]&&Number.isFinite(p[2])&&p[2]>=0&&p[2]<=100&&
    Number.isFinite(p[3])&&p[3]>=0&&p[3]<=100&&typeof p[4]==="string"&&Number.isInteger(p[5])&&p[5]>=0&&
    typeof p[6]==="boolean"&&Number.isFinite(p[7])&&(view.v===1||(Number.isFinite(p[8])&&p[8]>=0&&p[8]<=100&&Number.isFinite(p[9])&&p[9]>=0&&p[9]<=100)))&&
   Object.entries(t.assignment).every(([slot,id])=>team.slots[Number(slot)]&&playerIn(team,id))&&
   new Set(Object.values(t.assignment)).size===Object.keys(t.assignment).length;
 })&&(view.carrierId==null||!!playerIn(state.teams[view.possession],view.carrierId));
}
function displayState(state=match){
 if(!state)return null;const view=state.events[(state.presentedEventId||0)-1]?.presentation||state.events[0]?.presentation;
 if(!view)return state;
 return{...state,...view,ball:view.v===2?{...view.ball}:legacyPoint(view.ballZone),
  teams:Object.fromEntries([1,2].map(n=>{
   const team=state.teams[n],shown=view.teams[n],players=new Map(shown.players.map(p=>[p[0],p]));
   return[n,{...team,assignment:shown.assignment,roster:team.roster.map(p=>{
    const a=players.get(p.id),legacy=legacyPoint(a[1]);return{...p,zone:a[1],stamina:a[2],flow:a[3],role:a[4],yellows:a[5],sentOff:a[6],
      x:view.v===2?a[8]:legacy.x,y:view.v===2?a[9]:legacy.y,match:{...p.match,points:a[7]}};
   })}];
  }))};
}
function snapshotMatch(state){
 if(!state)return null;const copy={...state,randomState:state.random&&state.random.getState?state.random.getState():state.randomState,runnerActive:false};
 delete copy.random;copy.presentationVersion=2;
 copy.events=state.events.map(e=>{if(e.id>=(state.presentedEventId||1))return e;const previous={...e};delete previous.presentation;return previous;});
 copy.teams=Object.fromEntries([1,2].map(n=>{const team={...state.teams[n]};delete team._bsChemistryCache;delete team._bsChemistrySignature;return[n,team];}));
 return copy;
}
function hydrateMatch(snapshot){
 try{
  if(snapshot?.presentationVersion!=null&&![1,2].includes(snapshot.presentationVersion))return null;
  if(!snapshot||!snapshot.teams||!Array.isArray(snapshot.events)||snapshot.events.length>20000||
   !["playing","paused","finished"].includes(snapshot.status)||!["firstHalf","halfTime","secondHalf","fullTime"].includes(snapshot.phase)||
   !Number.isFinite(snapshot.timeSeconds)||snapshot.timeSeconds<0||snapshot.timeSeconds>FULL||
   !Number.isInteger(snapshot.seed)||!Number.isInteger(snapshot.randomState))return null;
  if(![1,2].includes(snapshot.possession)||!ZONES[snapshot.ballZone]||!Number.isInteger(snapshot.tick)||snapshot.tick<0||
   ![1,2].every(n=>Number.isInteger(snapshot.score?.[n])&&snapshot.score[n]>=0))return null;
  if(!snapshot.events.every((e,i)=>e&&e.id===i+1&&typeof e.type==="string"&&typeof e.description==="string"&&Array.isArray(e.actors)&&
   Array.isArray(e.dialogue)&&e.actors.every(a=>resolveSharedPlayer(a,0))))return null;
  for(const n of [1,2]){
   const team=snapshot.teams[n];
   if(!team||!Array.isArray(team.roster)||!team.assignment||!team.stats||!Array.isArray(team.slots)||team.slots.length!==11||!team.strategy||
    !STRATEGIES.every(d=>Number.isFinite(team.strategy[d.key])))return null;
   const normalized=normalizeTeam(team,n);
   if(normalized.roster.length!==team.roster.length||new Set(Object.values(team.assignment).map(idOf)).size!==Object.keys(team.assignment).length)return null;
   team.roster=team.roster.map((p,i)=>{
    const canonical=resolveSharedPlayer(p,i);
    if(!canonical||!p.match||!Number.isFinite(p.stamina)||!Number.isFinite(p.flow)||!ZONES[p.zone])throw Error("Invalid saved player");
    const player={...p,...canonical},legacy=legacyPoint(p.zone);
    if(snapshot.presentationVersion===2&&(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>100||p.y<0||p.y>100))throw Error("Invalid coordinates");
    player.x=Number.isFinite(p.x)?p.x:legacy.x;player.y=Number.isFinite(p.y)?p.y:legacy.y;
    player.homeX=Number.isFinite(p.homeX)?p.homeX:player.x;player.homeY=Number.isFinite(p.homeY)?p.homeY:player.y;
    return player;
   });
   if(!Object.entries(team.assignment).every(([slot,id])=>Number.isInteger(Number(slot))&&Number(slot)>=0&&Number(slot)<team.slots.length&&playerIn(team,id)))return null;
   if(team.roster.some(p=>isSpecialKeeper(p)&&idOf(team.assignment[String(team.slots.findIndex(s=>s.label==="GK"))])!==p.id))return null;
   delete team._bsChemistryCache;delete team._bsChemistrySignature;
  }
  const state={...snapshot};state.random=seeded(state.seed,state.randomState);delete state.randomState;state.runnerActive=false;state.introPending=snapshot.introPending===true;
  state.ball=state.ball&&Number.isFinite(state.ball.x)&&Number.isFinite(state.ball.y)?state.ball:legacyPoint(state.ballZone);
  state.presentedEventId=Math.floor(clamp(Number(state.presentedEventId)||0,0,state.events.length));
  if(snapshot.presentationVersion==null&&state.events.some(e=>!e.presentation)){
   state.presentedEventId=state.events.length;state.events.forEach(e=>delete e.presentation);
   if(state.events.length)state.events.at(-1).presentation=capturePresentation(state);
  }else if(!state.events.filter(e=>e.id>=Math.max(1,state.presentedEventId)).every(e=>validPresentation(e.presentation,state)))return null;
  return state;
 }catch(e){return null;}
}
function storeActiveMatch(){if(!match)return;try{sessionStorage.setItem(ACTIVE_MATCH_KEY,JSON.stringify(snapshotMatch(match)));}catch(e){}}
function readStoredMatch(key){try{let raw=sessionStorage.getItem(key);if(!raw&&key===RESULT_KEY)raw=localStorage.getItem(key);return hydrateMatch(raw?JSON.parse(raw):null);}catch(e){return null;}}
function ratingNow(p){return Math.round(clamp(6+(p&&p.match?Number(p.match.points)||0:0),3,10)*100)/100;}
function ratingColor(value){const ratio=clamp((Number(value)-3)/7,0,1);return "color-mix(in srgb,hsl("+Math.round(ratio*120)+" 78% 46%) 45%,var(--text-primary))";}
function playerMeta(ovr,rating,cls,label="OVR"){const meta=make("span",cls||"bs-player-subline");put(meta,make("span","",label+" "+Math.round(ovr)+" · RATING "));const score=make("strong","bs-rating-value",Number(rating).toFixed(2));score.style.color=ratingColor(rating);put(meta,score);return meta;}
function cardLabel(p){return p.sentOff?"RED CARD":p.yellows>0?"YELLOW CARD · "+p.yellows+"/3":"NO CARDS";}
function flowMeter(value,name){const amount=clamp(Number.isFinite(Number(value))?Number(value):0,0,100),meter=make("span","bs-flow-meter"+(Number(value)>=100?" is-full":""));meter.style.setProperty("--flow",amount+"%");meter.title=(name?name+" · ":"")+"FLOW "+Math.round(amount)+"%";meter.setAttribute("role","meter");meter.setAttribute("aria-label",(name?name+" ":"")+"flow");meter.setAttribute("aria-valuemin","0");meter.setAttribute("aria-valuemax","100");meter.setAttribute("aria-valuenow",String(Math.round(amount)));put(meter,make("span","bs-flow-meter-fill"));return meter;}
function portraitSource(p){try{if(typeof playerImageUrl==="function"){const url=playerImageUrl(p);if(url)return String(url);}}catch(e){}return String(p&&p.image||(typeof PLAYER_IMAGE_FALLBACK!=="undefined"?PLAYER_IMAGE_FALLBACK:""));}
function portraitWithStamina(parent,p,size){
 const px=size||32,stamina=clamp(Number(p.stamina)||0,0,100),ring=make("span","bs-stamina-ring");
 ring.style.setProperty("--stamina",stamina+"%");ring.style.setProperty("--stamina-hue",String(Math.round(stamina*1.2)));ring.style.setProperty("--portrait-size",px+"px");
 const img=make("img","bs-stamina-portrait");img.src=portraitSource(p);img.alt=p.name||"Player";img.width=px;img.height=px;img.loading="lazy";
 img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;};put(ring,img);put(parent,ring);return ring;
}
/* Spatial engine: the old 18 zone IDs are retained ONLY to migrate v0.8.1 saves.
   All live decisions use physical metre distances on a continuous 105m x 68m pitch. */
const PITCH_LENGTH=105,PITCH_WIDTH=68,RECEIVE_PRESSURE_M=9,TACKLE_RADIUS_M=7;
function legacyPoint(zone){const z=ZONES[zone]||ZONES[7];return{x:8+z.y*16.8,y:17+z.x*33};}
function point(value){if(value&&typeof value==="object"&&Number.isFinite(value.x)&&Number.isFinite(value.y))return{x:value.x,y:value.y};if(value&&typeof value==="object"&&Number.isFinite(value.zone))return legacyPoint(value.zone);if(Number.isInteger(value)&&ZONES[value])return legacyPoint(value);return{x:50,y:50};}
function distance(a,b){const x=point(a),y=point(b);return Math.hypot((x.x-y.x)*PITCH_LENGTH/100,(x.y-y.y)*PITCH_WIDTH/100);}
function zoneAt(pos){const a=point(pos);let chosen=7,best=Infinity;for(const key of Object.keys(ZONES)){const d=distance(a,legacyPoint(Number(key)));if(d<best){best=d;chosen=Number(key);}}return chosen;}
function setPosition(p,pos){const q=point(pos);p.x=clamp(q.x,2,98);p.y=clamp(q.y,5,95);if(p.role==="GK"){p.x=p.teamNumber===1?clamp(p.x,3,16):clamp(p.x,84,97);p.y=clamp(p.y,21,79);}p.zone=zoneAt(p);return p;}
function setBall(state,pos){const q=point(pos);state.ball={x:clamp(q.x,1,99),y:clamp(q.y,2,98)};state.ballZone=zoneAt(state.ball);}
function formationStart(number,slot){const depth=clamp(100-(Number(slot.y)||50),0,100);return{x:number===1?6+depth*.42:94-depth*.42,y:clamp(Number(slot.x)||50,6,94)};}
function moveToward(p,target,limit){const from=point(p),to=point(target),dx=(to.x-from.x)*PITCH_LENGTH/100,dy=(to.y-from.y)*PITCH_WIDTH/100,dist=Math.hypot(dx,dy);if(dist<.001)return p;const fraction=Math.min(1,Math.max(0,limit)/dist);return setPosition(p,{x:from.x+(to.x-from.x)*fraction,y:from.y+(to.y-from.y)*fraction});}
function progress(number,where){const q=point(where);return number===1?q.x/100:(100-q.x)/100;}
function targetGoal(number){return{x:number===1?99:1,y:50};}
function ownGoal(number){return{x:number===1?4:96,y:50};}
function slotZone(number,slot){return zoneAt(formationStart(number,slot));}
function inOpponentBox(number,where){const q=point(where);return(number===1?q.x>=83:q.x<=17)&&q.y>=20&&q.y<=80;}
function dribbleMeters(p){return clamp(.85+effective(p,"spd")*.068,1.4,8.2);}
function offBallOrder(state){const carrier=state.teams[state.possession]&&playerIn(state.teams[state.possession],state.carrierId);return[...active(state.teams[1]),...active(state.teams[2])].filter(p=>!carrier||p.id!==carrier.id||p.teamNumber!==carrier.teamNumber).sort((a,b)=>effective(b,"spd")-effective(a,"spd")||a.teamNumber-b.teamNumber||idOf(a.id).localeCompare(idOf(b.id)));}
function movementMeters(p){return clamp(.75+effective(p,"spd")*.051,1.25,6.1);}
function receiverPressure(state,number,where){return opposing(state,number).filter(p=>p.role!=="GK"&&distance(p,where)<=RECEIVE_PRESSURE_M).length;}
function keeperTarget(state,p){const ball=point(state.ball);const home=ownGoal(p.teamNumber);return{x:home.x+(p.teamNumber===1?1.8:-1.8),y:clamp(50+(ball.y-50)*.28,28,72)};}
function active(team){const ids=new Set(Object.values(team.assignment).map(idOf));return team.roster.filter(p=>ids.has(idOf(p.id))&&!p.sentOff);}
function bench(team){const ids=new Set(Object.values(team.assignment).map(idOf));return team.roster.filter(p=>!ids.has(idOf(p.id))&&!p.sentOff);}
function keeper(team){const list=active(team);return list.find(p=>p.role==="GK")||list.slice().sort((a,b)=>b.stats.gk-a.stats.gk)[0]||null;}
function runtimeTeam(config,number){
 const team={number,name:config.name,color:config.color,roster:config.roster.map((raw,i)=>{
  const p=cleanPlayer(raw,i);return Object.assign(p,{teamNumber:number,stamina:100,flow:0,flowFullTicks:0,movementProgress:0,
   x:number===1?8:92,y:50,homeX:number===1?8:92,homeY:50,zone:slotZone(number,{x:50,y:90}),
   role:p.primaryPosition,yellows:0,sentOff:false,match:{goals:0,assists:0,shots:0,onTarget:0,passes:0,passesAttempted:0,dribbles:0,dribblesAttempted:0,tackles:0,interceptions:0,fouls:0,saves:0,yellows:0,redCards:0,points:0,rating:6}});
 }),formation:config.formation,slots:config.slots.map(q=>({...q})),assignment:{...config.assignment},strategy:{...config.strategy},
 stats:{poss:0,shots:0,onTarget:0,passes:0,attempted:0,tackles:0,interceptions:0,fouls:0,corners:0,saves:0,turnovers:0,goals:0,yellowCards:0,redCards:0}};
 Object.keys(team.assignment).forEach(k=>{const p=playerIn(team,team.assignment[k]),slot=team.slots[Number(k)];if(!p||!slot)return;p.role=slot.label;const home=slot.label==="GK"?ownGoal(number):formationStart(number,slot);p.homeX=home.x;p.homeY=home.y;setPosition(p,home);});
 team.roster.filter(p=>!Object.values(team.assignment).map(idOf).includes(idOf(p.id))).forEach(p=>{p.role="BENCH";setPosition(p,ownGoal(number));});
 const g=keeper(team);if(g){g.role="GK";const home=ownGoal(number);g.homeX=home.x;g.homeY=home.y;setPosition(g,home);}
 return team;
}
function playerIn(team,id){return team.roster.find(p=>idOf(p.id)===idOf(id))||null;}
function effective(p,k){const stamina=clamp(p.stamina,0,100),flow=p.flow>=100&&k!=="ovr"&&k!=="gk"?1.085:1;return(Number(p.stats[k])||1)*(.7+.3*stamina/100)*flow;}
function isagi(p){return !!p&&(idOf(p.id)==="1"||p.name==="Yoichi Isagi")&&!!p.battleSim;}
function isagiNearDefenders(state,p,where){return opposing(state,p.teamNumber).filter(d=>d.role!=="GK"&&distance(d,where)<=RECEIVE_PRESSURE_M).length;}
function isagiChemistryDialogue(actor,partner,event){const striker=isagi(actor)?actor:isagi(partner)?partner:null,other=striker===actor?partner:actor;if(!striker||!other)return[];const lines=striker.battleSim.chemistryDialogue&&striker.battleSim.chemistryDialogue[other.name],text=lines&&lines[event];return text?[{playerId:striker.id,text:striker.name+": "+String.fromCharCode(34)+text+String.fromCharCode(34)}]:[];}
function addPoints(p,n){if(p&&p.match){p.match.points+=n;if(n>0){const before=clamp(Number.isFinite(Number(p.flow))?Number(p.flow):0,0,100);if(before<100){p.flow=clamp(before+Math.max(2,n*38),0,100);if(p.flow>=100){p.flowFullTicks=0;p.flowActivationPending=true;}}}}}
function drain(p,success,action){const amount=action==="shot"?3:action==="dribble"?3.3:action==="pass"?2.2:2;p.stamina=clamp(p.stamina-(success?amount:amount*.48),0,100);}
function addEvent(state,options){const type=options.type||"play",actionTypes=new Set(["pass","dribble","shot-attempt"]),important=new Set(["kickoff","goal","half-time","full-time","foul","yellow-card","red-card","set-piece","substitution","flow-activation","pass","dribble","shot-attempt"]);let notable=!!options.notable||actionTypes.has(type);if(notable){const now=Number(state.timeSeconds)||0;if(!important.has(type)&&Number.isFinite(state.nextNotableAt)&&now<state.nextNotableAt)notable=false;else state.nextNotableAt=now+600+Math.floor((typeof state.random==="function"?state.random():Math.random())*1201);}const event={id:state.events.length+1,tick:state.tick,timeSeconds:state.timeSeconds,time:timeLabel(state.timeSeconds),type:type,description:String(options.description||"Play continues."),teamNumber:options.teamNumber||null,possessionTeamNumber:state.possession||null,zone:options.zone==null?state.ballZone:options.zone,notable:notable,actors:(options.actors||[]).filter(Boolean).map(p=>({id:idOf(p.id),name:p.name,image:p.image||"",teamNumber:p.teamNumber||null,flow:clamp(Number.isFinite(Number(p.flow))?Number(p.flow):0,0,100)})),comparison:options.comparison?Object.assign({},options.comparison):null,probability:options.probability==null?null:clamp(Number(options.probability),0,1),probabilityLabel:options.probabilityLabel||"SUCCESS CHANCE",dialogue:(options.dialogue||[]).map(d=>({playerId:idOf(d.playerId),text:String(d.text||"")}))};if(options.presentationOnly)event.presentationOnly=true;if(!fastForwarding)event.presentation=capturePresentation(state);state.events.push(event);return event;}
function pause(state,reason){state.status="paused";state.stoppage=reason||"PLAY PAUSED";}
function dialogue(state,p,kind,good){
 if(isagi(p)){
  const profile=p.battleSim.dialogue||{},key=kind==="dribble"&&!good?"dribbleFail":kind==="shot"&&!good?"shotMiss":kind==="shot"&&good?"goal":kind==="shot-attempt"?"shotAttempt":kind;
  const lines=profile[key]||(kind==="pass"?profile.pass:kind==="dribble"?profile.dribble:null);
  if(Array.isArray(lines)&&lines.length)return{playerId:p.id,text:p.name+": "+String.fromCharCode(34)+randomPick(lines,state.random)+String.fromCharCode(34)};
 }
 const lines={pass:good?["Here!","One touch!","Play it forward!"]:["Too slow!","I should have seen that!"],receive:good?["Got it!","I’m on it!","Keep moving!"]:["That was difficult to reach!"],dribble:good?["There’s the gap!","Past you!","Can’t catch me!"]:["They closed the lane!","I lost control!"],shot:good?["It’s in!","Yes!","What a finish!"]:["Not enough!","I need to do better!"],"shot-attempt":good?["I’m taking this!","Let’s test the keeper!","Here comes the shot!"]:["I need a better opening!"],flow:good?["I’m in the zone!","This is my moment!","Nothing can stop me now!"]:["I need to find my rhythm!"],defend:good?["Won it back!","Read that!","Not today!"]:["They got away!"],save:good?["I’ve got it!","Safe hands!","Not past me!"]:["Rebound!"]};
 return{playerId:p.id,text:p.name+": "+String.fromCharCode(34)+randomPick(lines[kind]||lines.pass,state.random)+String.fromCharCode(34)};
}
function opposing(state,number){return active(state.teams[number===1?2:1]);}
function defenderNear(state,number,where){const list=opposing(state,number).filter(p=>p.role!=="GK");list.sort((a,b)=>(distance(a,where)*1.7-effective(a,"def")*.13-effective(a,"spd")*.05)-(distance(b,where)*1.7-effective(b,"def")*.13-effective(b,"spd")*.05));return list[0]||keeper(state.teams[number===1?2:1]);}
function preferredWideLane(p){const role=String(p&&p.role||"").toUpperCase();if(/^(LB|LWB|LM|LW|LWF|LF|LS|LCM|LCB)$/.test(role))return 24;if(/^(RB|RWB|RM|RW|RWF|RF|RS|RCM|RCB)$/.test(role))return 76;return 50;}
function moveOffBall(state){
 const ball=point(state.ball),runners=offBallOrder(state);
 // Order is determined once per tick: fastest effective SPD runs first.
 runners.forEach(p=>{
  if(p.role==="GK"){moveToward(p,keeperTarget(state,p),Math.min(2.2,movementMeters(p)*.56));return;}
  const t=state.teams[p.teamNumber],attacking=state.possession===t.number;
  const striker=/ST|CF|FW|SS|LW|RW|LF|RF/.test(p.role),mid=/CM|AM|LM|RM|CAM/.test(p.role),back=/CB|LB|RB|WB|DM/.test(p.role);
  const direction=t.number===1?1:-1,home={x:p.homeX,y:p.homeY},width=clamp((t.strategy.width-50)/50,-1,1);
  let target;
  if(attacking){
   // The old home-anchor kept forwards too far from goal to shoot.
   const lead=striker?23:mid?7:back?-13:8;
   const anchored=striker?.055:mid?.16:.28,goalward=ball.x+direction*lead;
   const spacing=clamp(goalward*(1-anchored)+home.x*anchored,3,97);
   target={x:spacing,y:clamp(home.y*.65+ball.y*.35+width*(preferredWideLane(p)-50)*.28,7,93)};
   if(striker&&progress(t.number,ball)>.6)target.x=direction===1?Math.max(target.x,87):Math.min(target.x,13);
  }else{
   const near=distance(p,ball),hunt=near<11+t.strategy.pressing*.18;
   if(hunt){target={x:ball.x-direction*1.3,y:ball.y};}
   else{
    const shift=(ball.x-50)*(.25+(t.strategy.line-50)*.0015);
    target={x:clamp(home.x+shift,3,97),y:clamp(home.y+(ball.y-50)*.28,7,93)};
   }
  }
  if(distance(p,target)<.3){const phase=(state.tick+Number(p.id||0))*.7;target={x:p.x+Math.sin(phase)*.4,y:p.y+Math.cos(phase)*.5};}
  const old=point(p);moveToward(p,target,movementMeters(p));
  p.stamina=clamp(p.stamina-distance(old,p)*.007,0,100);
 });
}
function receiverChoice(state,team,carrier,options={}){
 const list=active(team).filter(p=>p.id!==carrier.id&&(options.allowKeeper||p.role!=="GK"));if(!list.length)return null;
 const ranked=list.map(p=>{
  const metres=distance(carrier,p),pressure=receiverPressure(state,team.number,p),forward=progress(team.number,p)-progress(team.number,carrier);
  const roleBoost=/ST|CF|FW|LW|RW|AM/.test(p.role)?Math.max(0,forward)*2.1:0;
  const shortBonus=metres<=27?1:0;
  const value=forward*(6+team.strategy.directness*.11)+roleBoost+shortBonus-Math.max(0,metres-24)*.083-pressure*.72+
   (effective(p,"off")-70)*.026+(state.random()-.5)*1.2;
  return{p,value};
 }).sort((a,b)=>b.value-a.value);
 return randomPick(ranked.slice(0,Math.min(3,ranked.length)),state.random).p;
}
function targetZone(state,number,from,to){return point(to);}
function checkFoul(state,teamNumber,carrier,defender,where){
 if(!carrier||!defender||distance(carrier,defender)>TACKLE_RADIUS_M||state.random()>=.018+state.teams[defender.teamNumber].strategy.pressing*.00025)return false;
 const defending=state.teams[defender.teamNumber],location=point(where||carrier),penalty=inOpponentBox(teamNumber,location),type=penalty?"penalty":"free-kick";
 defender.match.fouls++;defending.stats.fouls++;addPoints(defender,-.12);
 state.pending={type,teamNumber,zone:zoneAt(location),point:location,takerId:carrier.id,routine:"direct"};
 state.possession=teamNumber;state.carrierId=carrier.id;setBall(state,location);
 addEvent(state,{type:"foul",teamNumber,notable:true,description:defender.name+" fouls "+carrier.name+". "+(penalty?"Penalty awarded.":"Free kick awarded."),actors:[defender,carrier]});
 if(state.random()<.12+defending.strategy.pressing*.001){
  defender.yellows++;defender.match.yellows=defender.yellows;defending.stats.yellowCards++;addPoints(defender,-.08);
  addEvent(state,{type:"yellow-card",teamNumber:defender.teamNumber,notable:true,description:defender.name+" receives a yellow card ("+defender.yellows+"/3).",actors:[defender]});
  if(defender.yellows>=3){
   defender.sentOff=true;defender.match.redCards++;defending.stats.redCards++;addPoints(defender,-.25);
   const slot=Object.keys(defending.assignment).find(k=>idOf(defending.assignment[k])===idOf(defender.id));
   const canReplace=slot!=null&&bench(defending).length>0;
   state.requiredSub=canReplace?{teamNumber:defender.teamNumber,slot:String(slot),playerId:defender.id}:null;
   addEvent(state,{type:"red-card",teamNumber:defender.teamNumber,notable:true,description:defender.name+" is sent off."+(canReplace?" A replacement is required.":""),actors:[defender]});
  }
 }
 pause(state,state.requiredSub?"RED CARD — SUBSTITUTION REQUIRED":penalty?"PENALTY":"FREE KICK");return true;
}
function resolvePass(state,carrier,opts){
 opts=opts||{};const team=state.teams[carrier.teamNumber],receiver=opts.receiverId?playerIn(team,opts.receiverId):receiverChoice(state,team,carrier);
 if(!receiver){moveToward(carrier,targetGoal(team.number),movementMeters(carrier)*.6);setBall(state,carrier);addEvent(state,{type:"carry",teamNumber:team.number,description:carrier.name+" moves with the ball.",actors:[carrier]});return;}
 const metres=distance(carrier,receiver),target=point(receiver),pressure=receiverPressure(state,team.number,receiver),
  defender=defenderNear(state,team.number,receiver),defDistance=defender?distance(defender,receiver):99;
 const distancePenalty=Math.max(0,metres-12)*.40,closePressure=pressure*3.6,
  defensiveMatch=defDistance<16?effective(defender,"def")*.42:16;
 let chance=sigmoid((effective(carrier,"pas")*.61+effective(receiver,"off")*.23-defensiveMatch+16-distancePenalty-closePressure)/18);
 if(opts.guaranteed)chance=1;
 team.stats.attempted++;carrier.match.passesAttempted++;
 if(state.random()<chance){
  drain(carrier,true,"pass");addPoints(carrier,.025);team.stats.passes++;carrier.match.passes++;
  const forward=progress(team.number,receiver)>progress(team.number,carrier);
  setBall(state,receiver);state.carrierId=receiver.id;state.possession=team.number;state.lastPasser=carrier.id;
  addEvent(state,{type:opts.setPiece?"set-piece":"pass",teamNumber:team.number,notable:true,
   description:carrier.name+" completes a "+Math.round(metres)+"m pass to "+receiver.name+(forward?", advancing play.":"."),comparison:{attackerLabel:"PAS",attackerValue:effective(carrier,"pas"),defenderLabel:"DEF",defenderValue:defender?effective(defender,"def"):60},
   probability:chance,probabilityLabel:"PASS SUCCESS",actors:[carrier,receiver]});
  if(!opts.guaranteed&&defDistance<TACKLE_RADIUS_M&&state.random()<.018)checkFoul(state,team.number,receiver,defender,receiver);
 }else{
  drain(carrier,false,"pass");addPoints(carrier,-.16);team.stats.turnovers++;
  const opp=state.teams[team.number===1?2:1],interceptor=defDistance<17?defender:active(opp).filter(p=>p.role!=="GK").sort((a,b)=>distance(a,receiver)-distance(b,receiver))[0];
  if(interceptor&&defDistance<TACKLE_RADIUS_M&&checkFoul(state,team.number,carrier,interceptor,carrier))return;
  if(interceptor){interceptor.match.interceptions++;addPoints(interceptor,.15);opp.stats.interceptions++;moveToward(interceptor,target,movementMeters(interceptor));}
  state.lastPasser=null;state.possession=opp.number;state.carrierId=interceptor?interceptor.id:(active(opp)[0]&&active(opp)[0].id);
  if(interceptor)setBall(state,interceptor);else setBall(state,target);
  addEvent(state,{type:"interception",teamNumber:opp.number,notable:true,
   description:(interceptor?interceptor.name:"The defence")+" intercepts "+carrier.name+"'s pass.",comparison:{attackerLabel:"PAS",attackerValue:effective(carrier,"pas"),defenderLabel:"DEF",defenderValue:interceptor?effective(interceptor,"def"):60},
   probability:chance,probabilityLabel:"PASS SUCCESS",actors:[carrier,receiver,interceptor]});
 }
}
function resolveDribble(state,carrier){
 const team=state.teams[carrier.teamNumber],before=point(carrier),toward=targetGoal(team.number),width=clamp((team.strategy.width-50)/50,-1,1);
 const target={x:toward.x,y:clamp(carrier.y+width*(preferredWideLane(carrier)-50)*.24,6,94)};
 const stride=dribbleMeters(carrier);
 const desired={x:before.x+(target.x-before.x)*Math.min(1,stride/Math.max(.01,distance(before,target))),y:before.y+(target.y-before.y)*Math.min(1,stride/Math.max(.01,distance(before,target)))};
 const defenders=opposing(state,team.number).filter(p=>p.role!=="GK"&&distance(p,desired)<=TACKLE_RADIUS_M)
  .sort((a,b)=>distance(a,desired)-distance(b,desired));
 const def=defenders[0]||null,crowd=defenders.length,score=effective(carrier,"dri")+(effective(carrier,"spd")-70)*.3-(def?effective(def,"def")*.56:17)-Math.max(0,crowd-1)*7;
 const chance=sigmoid((score+14)/18);carrier.match.dribblesAttempted++;
 if(state.random()<chance){
  drain(carrier,true,"dribble");carrier.match.dribbles++;addPoints(carrier,.07);moveToward(carrier,target,stride);setBall(state,carrier);state.lastPasser=null;
  addEvent(state,{type:"dribble",teamNumber:team.number,notable:true,description:carrier.name+(def?" beats "+def.name:" attacks the space")+" and moves "+Math.round(distance(before,carrier))+"m forward.",
   comparison:{attackerLabel:"DRI",attackerValue:effective(carrier,"dri"),defenderLabel:"DEF",defenderValue:def?effective(def,"def"):55},probability:chance,probabilityLabel:"DRIBBLE SUCCESS",actors:def?[carrier,def]:[carrier]});
  if(def&&state.random()<.018)checkFoul(state,team.number,carrier,def,carrier);
 }else{
  drain(carrier,false,"dribble");addPoints(carrier,-.19);
  const opp=state.teams[team.number===1?2:1],tackler=def;
  // A defender across the pitch cannot magically win possession.
  if(!tackler){setBall(state,carrier);state.lastPasser=null;addEvent(state,{type:"dribble",teamNumber:team.number,description:carrier.name+" loses control briefly but recovers the ball.",actors:[carrier]});return;}
  if(tackler&&distance(tackler,carrier)<=TACKLE_RADIUS_M&&checkFoul(state,team.number,carrier,tackler,carrier))return;
  if(tackler){tackler.match.tackles++;addPoints(tackler,.18);opp.stats.tackles++;moveToward(tackler,carrier,movementMeters(tackler));}
  state.lastPasser=null;state.possession=opp.number;state.carrierId=tackler?tackler.id:(active(opp)[0]&&active(opp)[0].id);
  if(tackler)setBall(state,tackler);
  addEvent(state,{type:"turnover",teamNumber:opp.number,notable:true,description:(tackler?tackler.name:"The defence")+" wins the ball from "+carrier.name+".",
   comparison:{attackerLabel:"DRI",attackerValue:effective(carrier,"dri"),defenderLabel:"DEF",defenderValue:tackler?effective(tackler,"def"):55},probability:1-chance,probabilityLabel:"TACKLE WIN",actors:[carrier,tackler]});
 }
}
function recoverLoose(state,where,attackingNumber){
 const target=point(where),options=[];[1,2].forEach(n=>active(state.teams[n]).forEach(p=>{
  if(p.role==="GK")return;const d=distance(p,target);if(d>24)return;const skill=n===attackingNumber?effective(p,"off"):effective(p,"def");
  options.push({p,value:effective(p,"spd")*.52+skill*.25-d*1.5+state.random()*5});
 }));
 options.sort((a,b)=>b.value-a.value);if(!options.length)return null;
 const p=options[0].p;moveToward(p,target,movementMeters(p));addPoints(p,.08);state.lastPasser=null;state.possession=p.teamNumber;state.carrierId=p.id;setBall(state,p);
 addEvent(state,{type:"rebound",teamNumber:p.teamNumber,notable:true,description:p.name+" reaches the rebound first.",actors:[p]});return p;
}
function resolveShot(state,shooter,penalty,ultimate){
 const team=state.teams[shooter.teamNumber],defteam=state.teams[team.number===1?2:1],gk=keeper(defteam);
 const metres=distance(shooter,targetGoal(team.number)),near=opposing(state,team.number).filter(p=>p.role!=="GK").reduce((v,p)=>Math.min(v,distance(p,shooter)),99),
  pressure=near<4?10:near<TACKLE_RADIUS_M?6:near<11?2:0;
 const base=penalty?.76:metres<9?.28:metres<17?.19:metres<27?.10:metres<37?.035:.008;
 const shoot=effective(shooter,"sho"),goalkeeperStat=gk?effective(gk,"gk"):45;
 const baseGoalChance=penalty?sigmoid((shoot-goalkeeperStat)/22+1.28):sigmoid(logit(base)+(shoot-75)/24-(goalkeeperStat-75)/26-pressure/36);
 const statMatchupChance=sigmoid((shoot-85)/5+(75-goalkeeperStat)/7+.8);
 const anglePenalty=penalty?0:Math.abs(shooter.y-50)*.004;
 const isagiBonus=!penalty&&isagi(shooter)?Math.min(.12,isagiNearDefenders(state,shooter,shooter)*.025):0;
 const goalChance=ultimate?1:clamp(penalty?baseGoalChance:Math.max(baseGoalChance,Math.min(statMatchupChance,base+.24))+isagiBonus-anglePenalty,0,penalty?.96:.82);
 const saveChance=ultimate?0:penalty?Math.max(0,1-goalChance-.045):Math.min(1-goalChance-.015,clamp(.17+sigmoid((goalkeeperStat-shoot)/22)*.54,.16,.68));
 const roll=ultimate?0:state.random();team.stats.shots++;shooter.match.shots++;
 addEvent(state,{type:"shot-attempt",teamNumber:team.number,notable:true,
  description:ultimate?shooter.name+" unleashes "+ultimate.name+"!":shooter.name+(isagi(shooter)?" uses Direct Shot!":" takes a shot from "+Math.round(metres)+"m."),
  comparison:ultimate?null:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:goalkeeperStat},
  probability:goalChance,probabilityLabel:ultimate?"ULTIMATE SUCCESS":"GOAL CHANCE",actors:[shooter]});
 drain(shooter,roll<goalChance,"shot");
 const assister=state.lastPasser&&state.lastPasser!==shooter.id?playerIn(team,state.lastPasser):null;
 if(roll<goalChance){
  team.stats.onTarget++;team.stats.goals++;shooter.match.onTarget++;shooter.match.goals++;addPoints(shooter,1.35);
  if(assister){assister.match.assists++;addPoints(assister,.68);}
  state.score[team.number]++;setBall(state,targetGoal(team.number));
  addEvent(state,{type:"goal",teamNumber:team.number,notable:true,
   description:"GOAL! "+shooter.name+(shooter.flow>=100?" strikes in FLOW":" scores")+" for "+team.name+(assister?" assisted by "+assister.name:"")+".",
   comparison:ultimate?null:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:goalkeeperStat},
   probability:goalChance,probabilityLabel:ultimate?"ULTIMATE SUCCESS":"GOAL CHANCE",actors:assister?[shooter,assister]:[shooter]});
  if(isagi(shooter)){shooter.match.specials=(shooter.match.specials||0)+1;if(ultimate)shooter.match.ultimates=(shooter.match.ultimates||0)+1;}
  state.pending={type:"kickoff",teamNumber:team.number===1?2:1,zone:7,point:{x:50,y:50}};
  state.lastPasser=null;resetPositions(state);pause(state,"GOAL");return;
 }
 if(roll<goalChance+saveChance){
  team.stats.onTarget++;shooter.match.onTarget++;
  if(gk){gk.match.saves++;addPoints(gk,.54);defteam.stats.saves++;state.possession=defteam.number;state.carrierId=gk.id;setBall(state,gk);}
  const caught=state.random()<.64;
  addEvent(state,{type:"save",teamNumber:defteam.number,notable:true,description:(gk?gk.name:"The goalkeeper")+(caught?" catches ":" parries ")+shooter.name+"'s shot.",
   comparison:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:goalkeeperStat},probability:goalChance,probabilityLabel:"GOAL CHANCE",actors:[shooter,gk]});
  if(!caught)recoverLoose(state,shooter,team.number);
  state.lastPasser=null;pause(state,caught?"SAVE":"SAVE / REBOUND");return;
 }
 addPoints(shooter,-.08);
 const corner=state.random()<.16+(metres<18?.08:0);
 const spot=corner?{x:team.number===1?98:2,y:shooter.y<50?3:97}:ownGoal(defteam.number);
 if(corner)team.stats.corners++;
 state.pending={type:corner?"corner":"goal-kick",teamNumber:corner?team.number:defteam.number,zone:zoneAt(spot),point:spot,takerId:null,routine:corner?"cross":"short"};
 state.possession=state.pending.teamNumber;state.carrierId=null;setBall(state,spot);state.lastPasser=null;
 addEvent(state,{type:corner?"corner":"goal-kick",teamNumber:state.pending.teamNumber,notable:true,
  description:shooter.name+(corner?" forces a corner.":" misses the target. Goal kick for "+defteam.name+"."),
  comparison:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:goalkeeperStat},probability:goalChance,probabilityLabel:"GOAL CHANCE",actors:[shooter]});
 pause(state,corner?"CORNER":"GOAL KICK");
}
function chooseShot(state,carrier){
 const team=state.teams[carrier.teamNumber],metres=distance(carrier,targetGoal(team.number));
 if(metres>36)return false;
 const pressure=receiverPressure(state,team.number,carrier),shoot=effective(carrier,"sho");
 const urge=(metres<12?.78:metres<21?.55:metres<31?.31:.14)
   +clamp((shoot-75)*.007,-.12,.14)+(team.strategy.tempo-50)*.0015-pressure*.035+
   (carrier.flow>=100?.13:0);
 return state.random()<clamp(urge,.07,.88);
}
function resetPositions(state){
 [1,2].forEach(n=>{const team=state.teams[n];team.roster.forEach(p=>{
  const k=Object.keys(team.assignment).find(i=>idOf(team.assignment[i])===idOf(p.id));
  if(k!=null&&team.slots[Number(k)]){const slot=team.slots[Number(k)];p.role=slot.label;const start=slot.label==="GK"?ownGoal(n):formationStart(n,slot);p.homeX=start.x;p.homeY=start.y;setPosition(p,start);}
 });const g=keeper(team);if(g){g.role="GK";setPosition(g,ownGoal(n));}
 });setBall(state,{x:50,y:50});
}
function kickoff(state,n){
 state.pending=null;resetPositions(state);
 const team=state.teams[n],center={x:50,y:50},options=active(team).filter(p=>p.role!=="GK").sort((a,b)=>distance(a,center)-distance(b,center)||effective(b,"off")-effective(a,"off"));
 const p=options[0]||keeper(team);
 state.possession=n;state.carrierId=p?p.id:null;setBall(state,center);
 if(p)setPosition(p,{x:n===1?49.5:50.5,y:50});
 state.stoppage="";
}

function setPieceUsesPass(pending){
 return pending.type==="goal-kick"||pending.type==="corner"||
 (pending.type==="free-kick"&&pending.routine==="pass");
}
function setPieceSkill(pending){return setPieceUsesPass(pending)?"pas":"sho";}
function setPieceTaker(state,pending){
 const team=state.teams[pending.teamNumber],skill=setPieceSkill(pending),special=pending.type==="goal-kick";
 const eligible=active(team).filter(p=>special||p.role!=="GK");
 const valid=eligible.find(p=>idOf(p.id)===idOf(pending.takerId));
 return valid||eligible.slice().sort((a,b)=>
  (special&&b.role==="GK"?180:0)+effective(b,skill)-(special&&a.role==="GK"?180:0)-effective(a,skill))[0]||keeper(team);
}
function arrangeSetPiece(state,pending,taker){
 const team=state.teams[pending.teamNumber],opposition=state.teams[team.number===1?2:1];
 const dir=team.number===1?1:-1,spot=point(pending.point||legacyPoint(pending.zone));
 let restart={...spot};
 if(pending.type==="penalty")restart={x:team.number===1?89.5:10.5,y:50};
 if(pending.type==="goal-kick")restart=ownGoal(team.number);
 if(pending.type==="corner")restart={x:team.number===1?98:2,y:spot.y<50?4:96};
 setPosition(taker,restart);setBall(state,taker);state.carrierId=taker.id;state.possession=team.number;
 const attackers=active(team).filter(p=>p.id!==taker.id&&p.role!=="GK")
  .sort((a,b)=>effective(b,"off")+effective(b,"sho")*.3-effective(a,"off")-effective(a,"sho")*.3);
 const defenders=active(opposition).filter(p=>p.role!=="GK").sort((a,b)=>effective(b,"def")-effective(a,"def"));
 attackers.forEach((p,i)=>{
  let x=p.homeX,y=p.homeY;
  if(pending.type==="corner"){
   // More than half the attacking outfield players crash the box.
   x=i<6?(team.number===1?clamp(89+i*.6,88,96):clamp(11-i*.6,4,12)):(team.number===1?76:24);
   y=i<6?32+(i%3)*15+(Math.floor(i/3)*4):25+(i%4)*17;
  }else if(pending.type==="penalty"){
   x=team.number===1?76+(i%3):24-(i%3);
   y=30+(i%5)*10;
  }else if(pending.type==="free-kick"){
   const box=inOpponentBox(team.number,spot),deep=progress(team.number,spot)>.55;
   x=team.number===1?clamp(spot.x+(i<5?11:deep?3:-4),4,96):clamp(spot.x-(i<5?11:deep?3:-4),4,96);
   y=clamp(28+(i%5)*12,7,93);
   if(box&&i<4)x=team.number===1?91:9;
  }else if(pending.type==="goal-kick"){
   x=team.number===1?19+(i%5)*7:81-(i%5)*7;
   y=16+(i%5)*15;
  }
  setPosition(p,{x,y});
 });
 defenders.forEach((p,i)=>{
  let x=p.homeX,y=p.homeY;
  if(pending.type==="corner"){
   x=team.number===1?92-(i%3)*2:8+(i%3)*2;
   y=30+(i%5)*11;
  }else if(pending.type==="penalty"){
   x=team.number===1?80-(i%3):20+(i%3);
   y=24+(i%6)*10;
  }else if(pending.type==="free-kick"){
   const wall=i<3&&distance(spot,targetGoal(team.number))<36;
   x=wall?spot.x+dir*8:(team.number===1?85-(i%3)*5:15+(i%3)*5);
   y=wall?clamp(spot.y+(i-1)*5,7,93):25+(i%5)*13;
  }else if(pending.type==="goal-kick"){
   x=team.number===1?62+(i%3)*5:38-(i%3)*5;
   y=14+(i%6)*13;
  }
  setPosition(p,{x,y});
 });
 const gk=keeper(opposition);if(gk)setPosition(gk,ownGoal(opposition.number));
 return {team,taker,spot:restart,attackers,defenders};
}
function setPieceReceiver(state,pending,taker){
 const team=state.teams[pending.teamNumber];
 const list=active(team).filter(p=>p.role!=="GK"&&p.id!==taker.id);
 if(!list.length)return null;
 if(pending.type==="corner"&&pending.routine!=="short")
  return list.slice().sort((a,b)=>effective(b,"off")*.6+effective(b,"sho")*.4-effective(a,"off")*.6-effective(a,"sho")*.4)[0];
 if(pending.type==="corner"&&pending.routine==="short")
  return list.slice().sort((a,b)=>distance(a,taker)-distance(b,taker))[0];
 if(pending.type==="free-kick")return list.slice().sort((a,b)=>progress(team.number,b)-progress(team.number,a))[0];
 if(pending.type==="goal-kick")
  return list.slice().sort((a,b)=>(progress(team.number,a)-.36)**2-(progress(team.number,b)-.36)**2)[0];
 return null;
}


function resolveRestart(state,pending){
 state.lastPasser=null;
 const team=state.teams[pending.teamNumber],taker=setPieceTaker(state,pending);if(!taker)return;
 const staged=arrangeSetPiece(state,pending,taker);
 if(pending.type==="penalty"){resolveShot(state,taker,true);return;}
 if(setPieceUsesPass(pending)){
  const receiver=setPieceReceiver(state,pending,taker);
  resolvePass(state,taker,{setPiece:true,receiverId:receiver?.id||null,guaranteed:pending.type==="goal-kick"&&pending.routine==="short"});
  return;
 }
 // Direct free kick is a shot, unless the taker is too far away to score.
 if(pending.type==="free-kick"&&distance(taker,targetGoal(team.number))>38){
  const receiver=setPieceReceiver(state,{...pending,routine:"pass"},taker);
  resolvePass(state,taker,{setPiece:true,receiverId:receiver?.id||null});
  return;
 }
 resolveShot(state,taker,false);
}

function ensureTickEvent(state,eventsBefore,description){if(state.events.length!==eventsBefore)return;const team=state.teams[state.possession],p=team&&playerIn(team,state.carrierId);addEvent(state,{type:"play",teamNumber:team?team.number:null,zone:state.ballZone,notable:true,description:description||(p?p.name+" keeps play moving.":"Both teams reset their shape."),actors:p?[p]:[]});}
function simulateTick(state){
 const eventsBefore=state.events.length;state.tick++;
 const limit=state.phase==="firstHalf"?HALF:FULL;
 state.timeSeconds=Math.min(limit,state.timeSeconds+10+Math.floor(state.random()*11));
 for(const n of [1,2])for(const p of state.teams[n].roster){if(p.flow>=100){p.flowFullTicks=(p.flowFullTicks||0)+1;if(p.flowFullTicks>=30){p.flow=0;p.flowFullTicks=0;}}else p.flowFullTicks=0;}
 if(state.possession===1||state.possession===2)state.teams[state.possession].stats.poss++;
 moveOffBall(state);
 if(state.forced){const forced=state.forced;state.forced=null;state.pending=null;resolveRestart(state,forced);ensureTickEvent(state,eventsBefore);return;}
 const t=state.teams[state.possession],carrier=t&&playerIn(t,state.carrierId);
 if(!t||!carrier||carrier.sentOff){const n=state.possession===1?2:1,p=active(state.teams[n]).find(p=>p.role!=="GK")||keeper(state.teams[n]);state.possession=n;state.carrierId=p?.id;if(p)setBall(state,p);ensureTickEvent(state,eventsBefore);return;}
 setBall(state,carrier);
 if(carrier.role==="GK"){resolvePass(state,carrier,{});ensureTickEvent(state,eventsBefore);return;}
 const ultimate=carrier.battleSim?.ultimates?.find(ability=>ability.id==="two-gun-volley");
 if(isagi(carrier)&&carrier.flow>=100&&ultimate&&distance(carrier,targetGoal(t.number))<=24){resolveShot(state,carrier,false,ultimate);ensureTickEvent(state,eventsBefore);return;}
 if(chooseShot(state,carrier)){resolveShot(state,carrier,false);ensureTickEvent(state,eventsBefore);return;}
 const near=receiverPressure(state,t.number,carrier),dribble=clamp(.40+(t.strategy.tempo-50)/250+(near>1?-.08:.06),.22,.67);
 if(state.random()<dribble||(progress(t.number,carrier)<.25&&near===0))resolveDribble(state,carrier);else resolvePass(state,carrier,{});
 ensureTickEvent(state,eventsBefore);
}
function playerTick(state){
 simulateTick(state);
 [1,2].forEach(n=>state.teams[n].roster.forEach(p=>{if(p.flowActivationPending){p.flowActivationPending=false;addEvent(state,{type:"flow-activation",notable:true,teamNumber:n,description:p.name+" activates FLOW. Their flow is fully charged.",actors:[p],dialogue:[dialogue(state,p,"flow",true)]});}}));
}
function finish(state){
 if(state.status==="finished")return;state.timeSeconds=FULL;state.phase="fullTime";state.status="finished";state.manualPaused=false;state.runnerActive=false;state.pending=null;state.forced=null;state.requiredSub=null;state.stoppage="";
 addEvent(state,{type:"full-time",notable:true,description:"FULL TIME. "+state.teams[1].name+" "+state.score[1]+" — "+state.score[2]+" "+state.teams[2].name+".",actors:[]});
 [1,2].forEach(n=>state.teams[n].roster.forEach(p=>{const weaponBonus=isagi(p)?Math.min(.25,(p.match.specials||0)*.05):0;p.match.rating=Math.round(clamp(6+p.match.points+weaponBonus,3,10)*100)/100;}));
 if(fastForwarding){state.presentedEventId=state.events.length;state.events.at(-1).presentation=capturePresentation(state);completeResults();}else{storeActiveMatch();renderMatch();}
}
function completeResults(){
 const saved=JSON.stringify(snapshotMatch(match));try{sessionStorage.setItem(RESULT_KEY,saved);localStorage.setItem(RESULT_KEY,saved);sessionStorage.removeItem(ACTIVE_MATCH_KEY);}catch(e){}
 if(typeof updateRoute==="function"&&typeof getRouteFromLocation==="function"&&getRouteFromLocation()!=="battleSimResults")updateRoute("battleSimResults");else showResults();
}
function runSequence(state){
 if(!state||state.status!=="playing"||state.manualPaused||state.runnerActive||!presentationIdle())return;
 if(runnerTimer!==null)clearTimeout(runnerTimer);runnerTimer=null;state.runnerActive=true;
 if(state.phase==="firstHalf"&&state.timeSeconds>=HALF){state.phase="halfTime";state.pending={type:"half-time",teamNumber:2,zone:7};addEvent(state,{type:"half-time",notable:true,description:"HALF TIME. The teams return to the touchline.",actors:[]});pause(state,"HALF TIME");}
 else if(state.timeSeconds>=FULL){state.runnerActive=false;finish(state);return;}
 else playerTick(state);
 state.runnerActive=false;storeActiveMatch();renderMatch();
}
function createMatch(){const seed=randSeed(),s={seed:seed,random:seeded(seed),tick:0,timeSeconds:0,phase:"firstHalf",status:"playing",stoppage:"",introPending:false,score:{1:0,2:0},teams:{1:runtimeTeam(setupTeams[0],1),2:runtimeTeam(setupTeams[1],2)},events:[],presentedEventId:0,possession:1,carrierId:null,ballZone:7,lastPasser:null,pending:null,forced:null,requiredSub:null};kickoff(s,1);const p=playerIn(s.teams[1],s.carrierId);addEvent(s,{type:"kickoff",teamNumber:1,zone:7,notable:true,description:"Kick-off. "+s.teams[1].name+" get the match underway.",actors:[p],dialogue:p?[{playerId:p.id,text:p.name+": \"Let's get started!\""}]:[]});return s;}

const INTRO_REVEAL_MS=340;
function clearMatchIntroTimer(){if(introTimer!==null){clearTimeout(introTimer);introTimer=null;}}
function matchIntroStarters(team){
 const starters=Object.keys(team.assignment||{}).sort((a,b)=>Number(a)-Number(b)).map(slot=>{const p=playerIn(team,team.assignment[slot]);return p?{player:p,slot:team.slots[Number(slot)]||BASE_SLOTS[Number(slot)]||{label:""}}:null;}).filter(Boolean);
 return starters.length?starters:team.roster.slice(0,11).map((player,index)=>({player,slot:team.slots[index]||BASE_SLOTS[index]}));
}
function renderMatchIntro(){
 if(!match)return;clearMatchIntroTimer();document.body.classList.remove("bs-game-route");
 byId("bs-setup-view").hidden=true;byId("bs-match-view").hidden=true;byId("bs-results-view").hidden=true;
 const root=byId("battle-sim-screen"),previous=byId("bs-broadcast-intro");if(previous)previous.remove();
 const overlay=make("section","bs-broadcast-intro");overlay.id="bs-broadcast-intro";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-label","Pre-match team line-up presentation");
 const frame=make("div","bs-intro-frame"),top=make("header","bs-intro-topbar");
 put(top,make("span","bs-intro-network-mark","BLD"));
 const network=make("div","bs-intro-network");put(network,make("strong","","BLUE LOCK DRAFT"));put(network,make("span","","MATCHDAY · TEAM PRESENTATION"));put(top,network);
 const live=make("span","bs-intro-live");put(live,make("i","",""));put(live,make("b","","LIVE"));put(top,live);put(frame,top);
 const content=make("div","bs-intro-content");content.id="bs-intro-content";put(frame,content);
 const footer=make("footer","bs-intro-footer"),track=make("span","bs-intro-progress-track"),fill=make("span","bs-intro-progress-fill");fill.id="bs-intro-progress-fill";put(track,fill);put(footer,track);
 put(footer,make("span","bs-intro-footer-label","STARTING LINE-UPS · FORMATION · PLAYER SPOTLIGHTS"));
 button(footer,"SKIP INTRO →","bs-button bs-button--primary",{id:"bs-skip-intro","aria-label":"Skip the match introduction"});
 put(frame,footer);put(overlay,frame);put(root,overlay);showMatchIntroTeam(1);
}
function spotlightMatchIntroPlayer(index,starters){
 const entry=starters[index];if(!entry)return;
 const content=byId("bs-intro-content");if(!content)return;
 content.querySelectorAll("[data-intro-player]").forEach((row,i)=>row.classList.toggle("is-featured",i===index));
 const image=byId("bs-intro-feature-image"),name=byId("bs-intro-feature-name"),role=byId("bs-intro-feature-role"),ovr=byId("bs-intro-feature-ovr");
 if(image){image.classList.remove("is-changing");void image.offsetWidth;image.classList.add("is-changing");image.src=portraitSource(entry.player);image.alt=entry.player.name||"Starting player";image.onerror=function(){image.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")image.src=PLAYER_IMAGE_FALLBACK;else image.remove();};}
 if(name)name.textContent=entry.player.name;if(role)role.textContent=String(entry.slot.label||entry.player.primaryPosition||"PLAYER").toUpperCase();if(ovr)ovr.textContent="OVR "+Math.round(entry.player.stats.ovr);
}
function showMatchIntroTeam(number){
 if(!match)return;clearMatchIntroTimer();const team=match.teams[number],starters=matchIntroStarters(team),content=byId("bs-intro-content");if(!team||!content)return;
 const overlay=byId("bs-broadcast-intro");overlay.style.setProperty("--bs-intro-team-color",team.color);overlay.dataset.team=String(number);content.replaceChildren();
 const heading=make("div","bs-intro-team-heading"),headingCopy=make("div","bs-intro-heading-copy");
 put(headingCopy,make("span","bs-kicker","TEAM 0"+number+" // STARTING XI"));put(headingCopy,make("h2","",team.name));put(headingCopy,make("p","",team.formation+" FORMATION · "+starters.length+" PLAYERS"));
 put(heading,headingCopy);put(heading,make("span","bs-intro-formation-tag",team.formation));put(content,heading);
 const composition=make("div","bs-intro-composition"),pitchPanel=make("section","bs-intro-pitch-panel"),pitchHead=make("div","bs-intro-panel-heading");
 put(pitchHead,make("strong","","TEAM FORMATION"));put(pitchHead,make("span","","TACTICAL VIEW"));put(pitchPanel,pitchHead);
 const pitch=make("div","bs-intro-pitch");pitch.setAttribute("role","img");pitch.setAttribute("aria-label",team.name+" "+team.formation+" formation");
 put(pitch,make("span","bs-intro-pitch-midline"));put(pitch,make("span","bs-intro-pitch-circle"));put(pitch,make("span","bs-intro-pitch-box bs-intro-pitch-box--top"));put(pitch,make("span","bs-intro-pitch-box bs-intro-pitch-box--bottom"));
 starters.forEach((entry,index)=>{const marker=make("span","bs-intro-pitch-player",String(index+1)),point=formationPoint(entry.slot,number===1);marker.style.setProperty("--player-x",point.x+"%");marker.style.setProperty("--player-y",point.y+"%");marker.title=(entry.slot.label||"")+" · "+entry.player.name;marker.setAttribute("aria-hidden","true");put(pitch,marker);});
 put(pitchPanel,pitch);put(composition,pitchPanel);
 const lineupPanel=make("section","bs-intro-lineup-panel"),lineupHead=make("div","bs-intro-panel-heading");put(lineupHead,make("strong","","STARTING LINE-UP"));put(lineupHead,make("span","","01 / "+String(starters.length).padStart(2,"0")));put(lineupPanel,lineupHead);
 const lineup=make("div","bs-intro-lineup-list");
 starters.forEach((entry,index)=>{const row=make("div","bs-intro-player-row");row.setAttribute("data-intro-player",String(index));row.style.setProperty("--intro-delay",(index*32)+"ms");put(row,make("span","bs-intro-player-number",String(index+1).padStart(2,"0")));put(row,make("span","bs-intro-player-role",entry.slot.label||entry.player.primaryPosition||"—"));put(row,make("strong","bs-intro-player-name",entry.player.name));put(row,make("b","bs-intro-player-ovr",Math.round(entry.player.stats.ovr)));put(lineup,row);});
 put(lineupPanel,lineup);put(composition,lineupPanel);
 const spotlight=make("section","bs-intro-spotlight");spotlight.id="bs-intro-spotlight";const visual=make("div","bs-intro-feature-visual"),image=make("img","bs-intro-feature-image");
 image.id="bs-intro-feature-image";image.alt="";image.loading="eager";image.decoding="async";if(starters[0]){image.src=portraitSource(starters[0].player);image.alt=starters[0].player.name||"Starting player";}
 image.onerror=function(){image.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")image.src=PLAYER_IMAGE_FALLBACK;else image.remove();};
 put(visual,image);put(visual,make("span","bs-intro-feature-shade"));put(spotlight,visual);
 const copy=make("div","bs-intro-feature-copy");put(copy,make("span","bs-intro-feature-kicker","PLAYER SPOTLIGHT"));
 const featureName=make("strong","bs-intro-feature-name",starters[0]?.player.name||"STARTING XI");featureName.id="bs-intro-feature-name";put(copy,featureName);
 const meta=make("div","bs-intro-feature-meta"),featureRole=make("span","",starters[0]?.slot.label||"PLAYER"),featureOVR=make("b","",starters[0]?"OVR "+Math.round(starters[0].player.stats.ovr):"");
 featureRole.id="bs-intro-feature-role";featureOVR.id="bs-intro-feature-ovr";put(meta,featureRole);put(meta,featureOVR);put(copy,meta);put(spotlight,copy);put(composition,spotlight);put(content,composition);
 const progress=byId("bs-intro-progress-fill");if(progress){progress.classList.remove("is-running");progress.style.setProperty("--intro-duration",((starters.length*INTRO_REVEAL_MS+700)/1000)+"s");void progress.offsetWidth;progress.classList.add("is-running");}
 overlay.classList.remove("is-team-changing");void overlay.offsetWidth;overlay.classList.add("is-team-changing");
 let index=0;const reveal=()=>{introTimer=null;if(!match||!byId("bs-broadcast-intro"))return;spotlightMatchIntroPlayer(index,starters);index++;if(index<starters.length)introTimer=setTimeout(reveal,INTRO_REVEAL_MS);else introTimer=setTimeout(()=>{introTimer=null;if(number===1)showMatchIntroTeam(2);else showMatchIntroFinish();},700);};
 introTimer=setTimeout(reveal,160);
}
function showMatchIntroFinish(){
 if(!match)return;clearMatchIntroTimer();const content=byId("bs-intro-content");if(!content)return;
 const heading=make("div","bs-intro-finish-heading");put(heading,make("span","bs-kicker","ALL LINE-UPS CONFIRMED"));put(heading,make("h2","","MATCH READY"));put(heading,make("p","","Two teams. One kick-off. Let the match begin."));put(content,heading);
 const showdown=make("div","bs-intro-showdown");
 [1,2].forEach(number=>{const team=match.teams[number],card=make("section","bs-intro-showdown-team");card.style.setProperty("--bs-intro-team-color",team.color);put(card,make("span","bs-kicker","TEAM 0"+number));put(card,make("strong","",team.name));put(card,make("span","bs-intro-showdown-formation",team.formation+" · "+matchIntroStarters(team).length+" STARTERS"));put(showdown,card);});
 const vs=make("span","bs-intro-showdown-vs","VS");showdown.insertBefore(vs,showdown.children[1]);put(content,showdown);
 const kickoff=make("div","bs-intro-kickoff-call");put(kickoff,make("strong","","KICK-OFF"));put(kickoff,make("span","","THE LIVE MATCH STARTS NOW"));put(content,kickoff);
 const progress=byId("bs-intro-progress-fill");if(progress){progress.classList.remove("is-running");progress.style.setProperty("--intro-duration","1.2s");void progress.offsetWidth;progress.classList.add("is-running");}
 introTimer=setTimeout(()=>{introTimer=null;finishMatchIntro();},1200);
}
function finishMatchIntro(){
 clearMatchIntroTimer();if(!match)return;match.introPending=false;storeActiveMatch();const overlay=byId("bs-broadcast-intro");if(overlay)overlay.remove();renderMatch();
 if(match.status==="playing"&&!match.manualPaused)runSequence(match);else presentationSettled();
}

function portrait(parent,p,size){if(!p)return;const img=make("img","bs-portrait");img.src=portraitSource(p);img.alt=p.name||"Player";img.width=size||40;img.height=Math.round((size||40)*1.12);img.loading="lazy";img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;else img.remove();};put(parent,img);}
function stratControls(number,team,compact){const wrap=make("div",compact?"bs-strategy-grid bs-strategy-grid--compact":"bs-strategy-grid");STRATEGIES.forEach(d=>{const l=make("label","bs-strategy-control"),head=make("span","bs-strategy-heading");put(head,make("strong","",d.label));put(head,make("output","bs-strategy-value",team.strategy[d.key]));put(l,head);const range=make("input","bs-range");range.type="range";range.min="0";range.max="100";range.value=team.strategy[d.key];range.setAttribute("data-team-strategy",number);range.setAttribute("data-strategy-key",d.key);put(l,range);const ends=make("span","bs-strategy-ends");put(ends,make("span","",d.low));put(ends,make("span","",d.high));put(l,ends);put(wrap,l);});return wrap;}

function teamChemistrySnapshot(team){
 if(!team)return{overall:0,links:[],counts:{chemical:0,elite:0,strong:0,link:0,neutral:0,negative:0},activeLinks:0,possibleLinks:0,top:null,weakest:null};
 const assignment=team.assignment||{},formation=team.formation||"4-3-3";
 const signature=formation+"|"+team.roster.filter(p=>p.sentOff).map(p=>p.id).join(",")+"|"+Object.keys(assignment).sort((a,b)=>Number(a)-Number(b)).map(k=>k+":"+idOf(assignment[k])).join(",");
 if(team._bsChemistrySignature===signature&&team._bsChemistryCache)return team._bsChemistryCache;
 const edgeMap=typeof FORMATION_CHEMISTRY_EDGES!=="undefined"?FORMATION_CHEMISTRY_EDGES:{};
 const edgePairs=edgeMap[formation]||edgeMap["4-3-3"]||[];
 const slots=team.slots||[],eligible=edgePairs.filter(([a,b])=>slots[a]&&slots[b]);
 const relationFor=(a,b)=>typeof chemistryRelation==="function"?chemistryRelation(a,b):{score:65,label:"NEUTRAL",reason:"No chemistry model is available.",contexts:[]};
 const links=eligible.map(([ai,bi])=>{
  const aId=assignment[String(ai)],bId=assignment[String(bi)];
  if(!aId||!bId)return null;
  const a=playerIn(team,aId),b=playerIn(team,bId);if(!a||!b||a.sentOff||b.sentOff)return null;
  const relation=relationFor(a,b);
  return{a:{index:ai,slot:slots[ai],p:a},b:{index:bi,slot:slots[bi],p:b},value:relation.score,relation};
 }).filter(Boolean);
 const deployed=Object.keys(assignment).map(k=>playerIn(team,assignment[k])).filter(p=>p&&!p.sentOff),knownPairs=[];
 for(let i=0;i<deployed.length;i++)for(let j=i+1;j<deployed.length;j++){
  const a=deployed[i],b=deployed[j],relation=relationFor(a,b);
  const key=typeof chemistryKey==="function"?chemistryKey(a,b):[a.name,b.name].sort().join("|");
  const special=typeof CHEMISTRY_SPECIAL!=="undefined"&&Object.prototype.hasOwnProperty.call(CHEMISTRY_SPECIAL,key);
  if((relation.contexts&&relation.contexts.length)||special)knownPairs.push(relation.score);
 }
 const values=links.map(l=>l.value);
 const overall=typeof chemistryNetworkScore==="function"?chemistryNetworkScore(values,knownPairs,eligible.length):(values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):0);
 const counts={chemical:0,elite:0,strong:0,link:0,neutral:0,negative:0};
 links.forEach(l=>{const tier=typeof chemistryTier==="function"?chemistryTier(l.value):(l.value>=82?"strong":l.value>=70?"link":l.value>=65?"neutral":"negative");counts[tier]=(counts[tier]||0)+1;});
 const sorted=links.slice().sort((a,b)=>b.value-a.value);
 const result={overall,links,counts,activeLinks:links.length,possibleLinks:eligible.length,knownPairs:knownPairs.length,deployedCount:deployed.length,coverage:eligible.length?Math.round(links.length/eligible.length*100):0,top:sorted[0]||null,weakest:sorted.length?sorted[sorted.length-1]:null};
 team._bsChemistrySignature=signature;team._bsChemistryCache=result;return result;
}
function formationPoint(slot,flipY){return{x:clamp(Number(slot.x)||50,7,93),y:clamp(flipY?100-(Number(slot.y)||50):(Number(slot.y)||50),9,91)};}
function positionMarker(marker,slot,flipY,project=formationPoint){const point=project(slot,flipY);marker.style.setProperty("--player-x",point.x+"%");marker.style.setProperty("--player-y",point.y+"%");}
function appendFormationChemistryLines(pitch,team,flipY,className,project=formationPoint){
 const chemistry=teamChemistrySnapshot(team),ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");
 svg.setAttribute("class",className||"bs-setup-chemistry-lines");svg.setAttribute("viewBox","0 0 100 100");svg.setAttribute("preserveAspectRatio","none");svg.setAttribute("aria-label","Formation player chemistry links");
 chemistry.links.forEach(link=>{
  const line=document.createElementNS(ns,"line"),a=project(link.a.slot,flipY),b=project(link.b.slot,flipY),x1=a.x,x2=b.x,y1=a.y,y2=b.y;
  line.dataset.slotA=String(link.a.index);line.dataset.slotB=String(link.b.index);
  const tier=typeof chemistryTier==="function"?chemistryTier(link.value):"neutral";
  line.setAttribute("x1",String(x1));line.setAttribute("y1",String(y1));line.setAttribute("x2",String(x2));line.setAttribute("y2",String(y2));
  line.setAttribute("class","bs-chem-line "+tier);line.setAttribute("data-chemistry",String(link.value));
  line.setAttribute("aria-label",link.a.p.name+" and "+link.b.p.name+" chemistry "+link.value+", "+(link.relation.label||"NEUTRAL"));
  line.setAttribute("title",link.a.p.name+" × "+link.b.p.name+" · "+link.value+" · "+(link.relation.label||"CHEMISTRY"));
  svg.appendChild(line);
 });
 pitch.appendChild(svg);return svg;
}
function renderSetupFormation(team){
 const section=make("section","bs-setup-formation-panel"),head=make("div","bs-setup-preview-head");
 put(head,make("strong","","TACTICAL BOARD"));put(head,make("span","",String(team.formation||"4-3-3").toUpperCase()+" FORMATION"));put(section,head);
 const pitch=make("div","football-pitch formation-pitch-v2 bs-setup-formation-pitch");pitch.setAttribute("role","img");pitch.setAttribute("aria-label",(window.BattleCopy?window.BattleCopy("{team} formation",{team:team.name}):team.name+" formation")+" · "+(team.formation||"4-3-3"));pitch.style.setProperty("--pitch-stripe","color-mix(in srgb,"+(team.color||BLUE)+" 22%,transparent)");pitch.style.setProperty("--pitch-legacy-start","#0d5a45");pitch.style.setProperty("--pitch-legacy-end","#084331");pitch.style.setProperty("--pitch-line-strong","#d5ffe77a");pitch.style.setProperty("--pitch-line","#d5ffe75c");pitch.style.setProperty("--pitch-dot","#d5ffe7");pitch.style.setProperty("--pitch-goal","#d5ffe77a");pitch.style.setProperty("--team",team.color||BLUE);
 put(pitch,make("div","pitch-stripes"));
 appendFormationChemistryLines(pitch,team,false,"bs-setup-chemistry-lines");
 ["pitch-halfway","pitch-circle","pitch-dot","penalty-box top","penalty-box bottom","goal-box top","goal-box bottom"].forEach(cls=>put(pitch,make("div",cls)));
 Object.keys(team.assignment||{}).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{
  const player=playerIn(team,team.assignment[k]),slot=team.slots[Number(k)];if(!player||!slot)return;
  const marker=make("div","bs-setup-formation-player");positionMarker(marker,slot,false);marker.dataset.slot=k;
  marker.style.setProperty("--bs-team-color",team.color||BLUE);marker.title=player.name+" · "+slot.label;
  const role=make("span","bs-setup-formation-role",slot.label),avatar=make("span","bs-setup-formation-portrait"),img=make("img","bs-setup-formation-avatar");
  img.src=portraitSource(player);img.alt=player.name;img.loading="lazy";img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;else img.remove();};
  const ovr=make("span","bs-setup-formation-ovr",Math.round(player.stats.ovr));put(avatar,img);put(avatar,ovr);put(marker,role);put(marker,avatar);put(marker,make("strong","",player.name));put(pitch,marker);
 });
 put(section,pitch);return section;
}
function renderSetupChemistry(team){
 const c=teamChemistrySnapshot(team),section=make("section","bs-setup-chemistry-panel"),main=make("div","bs-setup-chemistry-main"),score=make("div","bs-setup-chemistry-score");
 put(score,make("span","","TEAM CHEMISTRY"));put(score,make("strong","",c.overall||"--"));put(score,make("small","","FORMATION-LINK MODEL"));
 const metrics=make("div","bs-setup-chemistry-metrics");
 [["TACTICAL LINKS",c.activeLinks+" / "+c.possibleLinks],["CHEMICAL",c.counts.chemical],["ELITE",c.counts.elite],["STRONG",c.counts.strong]].forEach(item=>{const cell=make("div","bs-setup-chemistry-metric");put(cell,make("span","",item[0]));put(cell,make("strong","",item[1]));put(metrics,cell);});
 put(main,score);put(main,metrics);put(section,main);
 const featured=make("div","bs-setup-chemistry-featured");
 [[ "BEST ACTIVE LINK",c.top,true ],[ "LOWEST ACTIVE LINK",c.weakest,false ]].forEach(item=>{
  const cell=make("div",item[2]?"best":"risk"),link=item[1],label=make("span","",item[0]),name=make("strong","",link?(typeof chemistryLinkName==="function"?chemistryLinkName(link):link.a.p.name+" × "+link.b.p.name):"ADD STARTERS"),value=make("b",link&&typeof chemistryTier==="function"?chemistryTier(link.value):"",link?link.value:"--");
  put(cell,label);put(cell,name);put(cell,value);put(featured,cell);
 });
 put(section,featured);
 const key=make("div","bs-setup-chemistry-key");put(key,make("b","","LINK KEY"));
 [["chemical","95+"],["elite","90+"],["strong","82+"],["link","70+"],["neutral","NEUTRAL"],["negative","NEGATIVE"]].forEach(item=>{const part=make("span","");put(part,make("i",item[0]));put(part,make("span","",item[1]));put(key,part);});
 put(section,key);return section;
}
function renderMatchChemistry(team){
 const c=teamChemistrySnapshot(team),panel=make("section","bs-match-chemistry"),head=make("div","bs-match-chemistry-head");
 put(head,make("span","","TEAM CHEMISTRY"));put(head,make("strong","",String(c.overall||0)));put(panel,head);
 const track=make("div","bs-match-chemistry-track"),fill=make("span","bs-match-chemistry-fill");fill.style.width=clamp(c.overall,0,100)+"%";put(track,fill);put(panel,track);
 const metrics=make("p","bs-match-chemistry-metrics","LINKS "+c.activeLinks+"/"+c.possibleLinks+"  ·  CHEMICAL "+c.counts.chemical+"  ·  ELITE "+c.counts.elite+"  ·  STRONG "+c.counts.strong);put(panel,metrics);
 const pair=c.top?make("p","bs-match-chemistry-featured","BEST LINK · "+(typeof chemistryLinkName==="function"?chemistryLinkName(c.top):c.top.a.p.name+" × "+c.top.b.p.name)+" ("+c.top.value+")"):null;
 if(pair)put(panel,pair);return panel;
}

function renderTeamCard(number){const t=setupTeams[number-1],card=make("section","bs-team-card");card.style.setProperty("--bs-team-color",t.color);card.setAttribute("data-team-card",number);const head=make("div","bs-team-card-heading");put(head,make("span","bs-kicker","TEAM 0"+number+" // MATCH SQUAD"));put(head,make("h2","",t.name));put(card,head);const identity=make("div","bs-team-identity"),name=make("input","bs-name-input");name.type="text";name.maxLength=32;name.value=t.name;name.setAttribute("data-team-name",number);labelField(identity,"Team name",name);const color=make("input","bs-color-input");color.type="color";color.value=t.color;color.setAttribute("data-team-color",number);labelField(identity,"Colour",color);put(card,identity);const source=make("div","bs-source-row"),sourceSelect=make("select","bs-select");sourceSelect.setAttribute("data-team-source",number);option(sourceSelect,"auction","Use drafted auction team",!launchSnapshot);option(sourceSelect,"saved","Use a saved team",!savedTeams.length);option(sourceSelect,"random","Generate a random team",false);sourceSelect.value=t.source==="auction"&&launchSnapshot?"auction":t.source==="saved"&&savedTeams.some(item=>idOf(item.id)===idOf(t.savedId))?"saved":"random";labelField(source,"Squad source",sourceSelect);const saved=make("select","bs-select");saved.setAttribute("data-saved-team",number);option(saved,"",savedTeams.length?"Choose saved team…":"No saved teams yet",!savedTeams.length);savedTeams.forEach(item=>option(saved,item.id,item.name));saved.value=savedTeams.some(item=>idOf(item.id)===idOf(t.savedId))?idOf(t.savedId):"";const savedLabel=labelField(source,"Saved team",saved);savedLabel.hidden=sourceSelect.value!=="saved";const formationSelect=make("select","bs-select");formationSelect.setAttribute("data-team-formation",number);Object.keys(FORMATIONS).forEach(f=>option(formationSelect,f,f));formationSelect.value=t.formation;labelField(source,"FORMATION",formationSelect);put(card,source);put(card,renderSetupFormation(t));put(card,renderSetupChemistry(t));
const lineupHead=make("div","bs-roster-section-heading");put(lineupHead,make("h3","","STARTING LINE-UP"));put(lineupHead,make("span","",Object.keys(t.assignment).length+" STARTERS"));put(card,lineupHead);const starters=make("div","bs-starter-list");Object.keys(t.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const p=playerIn(t,t.assignment[k]),slot=t.slots[Number(k)];if(!p||!slot)return;const row=make("div","bs-player-row");portrait(row,p,38);const copy=make("div","bs-player-copy"),line=make("div","bs-player-name-line");put(line,make("strong","",p.name));put(line,make("span","bs-role-badge",slot.label));put(copy,line);put(copy,make("span","bs-player-subline","OVR "+Math.round(p.stats.ovr)+" · SPD "+Math.round(p.stats.spd)));put(row,copy);put(starters,row);});put(card,starters);
const reservePlayers=t.roster.filter(p=>!Object.values(t.assignment).map(idOf).includes(idOf(p.id))),reserveHead=make("div","bs-roster-section-heading");put(reserveHead,make("h3","","RESERVES"));put(reserveHead,make("span","",reservePlayers.length+" AVAILABLE"));put(card,reserveHead);const reserveList=make("div","bs-reserve-list");if(!reservePlayers.length)put(reserveList,make("p","bs-empty-note","No reserves on this roster."));reservePlayers.forEach(p=>{const row=make("div","bs-reserve-row");portrait(row,p,32);const copy=make("div","bs-player-copy");put(copy,make("strong","",p.name));put(copy,make("span","bs-player-subline","OVR "+Math.round(p.stats.ovr)));put(row,copy);const select=make("select","bs-select bs-swap-select");select.setAttribute("aria-label","Replace starter…");select.setAttribute("data-reserve-slot",number);select.setAttribute("data-reserve-player",p.id);option(select,"","Swap for…",false);Object.keys(t.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const starter=playerIn(t,t.assignment[k]);option(select,k,(t.slots[Number(k)]?t.slots[Number(k)].label:"Slot")+" · "+(starter?starter.name:"Empty"));});put(row,select);button(row,"SWAP","bs-mini-button",{"data-swap-player":p.id,"data-swap-team":number});put(reserveList,row);});put(card,reserveList);
const tactic=make("div","bs-roster-section-heading");put(tactic,make("h3","","TEAM STRATEGY"));put(tactic,make("span","","0–100"));put(card,tactic);put(card,stratControls(number,t,false));const save=make("div","bs-save-team-row"),saveName=make("input","bs-name-input");saveName.type="text";saveName.maxLength=32;saveName.value=t.name;saveName.setAttribute("data-save-name",number);saveName.placeholder="Name this saved team";saveName.setAttribute("aria-label","Name this saved team");put(save,saveName);button(save,"SAVE TO BUILDER","bs-button bs-button--secondary",{"data-save-team":number});put(card,save);return card;}
function renderInit(){
 savedTeams=loadSavedTeams();
 document.body.classList.remove("bs-game-route");clearFeedQueue();
 byId("bs-setup-view").hidden=false;byId("bs-match-view").hidden=true;byId("bs-results-view").hidden=true;
 const root=byId("bs-team-grid");root.replaceChildren();setupTeams.forEach((t,i)=>put(root,renderTeamCard(i+1)));
 const labels={auction:"AUCTION DRAFT",saved:"SAVED TEAM",random:"RANDOM TEAM"};
 byId("bs-source-status").textContent=setupTeams.map((t,i)=>"TEAM "+(i+1)+" · "+(labels[t.source]||"SAVED TEAM")).join(" // ");
 byId("bs-setup-help").textContent="Saved squads load from the existing auction save and Standalone Team Builder storage. SAVE TO BUILDER updates the standalone builder squad.";window.SiteI18n?.apply(byId("bs-setup-view"));
}
// Reuse Builder contribution/chemistry with canonical players. Cache only the
// stable lineup component; stamina always comes from the revealed player view.
const positionRatingCache=new Map();
function positionRatings(team){
 const key=JSON.stringify([team.number,team.formation,team.slots,team.assignment,team.roster.map(p=>[p.id,p.sentOff])]);
 if(positionRatingCache.has(key))return positionRatingCache.get(key);
 const links=teamChemistrySnapshot(team).links,ratings=new Map();
 Object.entries(team.assignment).forEach(([slot,id])=>{
  const p=playerIn(team,id),label=team.slots[Number(slot)]?.label;if(!p||p.sentOff||!label)return;
  const canonical=typeof playerById==="function"?playerById(p.id):p;
  const values=links.filter(l=>l.a.p.id===p.id||l.b.p.id===p.id).map(l=>l.value);
  ratings.set(p.id,playerContribution(canonical||p,label,values));
 });
 if(positionRatingCache.size>=8)positionRatingCache.clear();positionRatingCache.set(key,ratings);return ratings;
}
function playerOVR(team,p,ratings=positionRatings(team)){
 const part=ratings.get(p.id);if(!part)return null;
 return{position:part.effective,live:Math.round(effective({...p,stats:{...p.stats,ovr:part.raw}},"ovr"))};
}
function ratingTooltip(team,p,ratings=positionRatings(team)){
 const values=playerOVR(team,p,ratings),copy=window.BattleCopy||((key)=>key);
 return p.name+" · "+(values?copy("Position OVR: position and chemistry. Live OVR: after stamina. Match Rating: performance."):copy("BASE OVR"))+" · "+cardLabel(p);
}
function positionOVRMarkup(team,p){
 const values=playerOVR(team,p),wrap=make("span","bs-position-ratings");
 if(!values){put(wrap,make("span","","BASE OVR"));put(wrap,make("b","",Math.round(p.stats.ovr)));return wrap;}
 for(const [label,key] of [["POS OVR","position"],["LIVE OVR","live"]]){const row=make("span","bs-position-rating bs-position-rating--"+key);put(row,make("span","",label));put(row,make("b","",values[key]));put(wrap,row);}
 wrap.title=ratingTooltip(team,p);return wrap;
}
function liveFormationPoint(slot,flipY){const p=formationPoint(slot,flipY);return{x:12+(p.x-7)*76/86,y:10+(p.y-9)*80/82};}
function addPlayerRow(parent,p,team,slotIndex){
 const row=make("div","bs-match-player-row");row.dataset.playerId=p.id;row.style.setProperty("--bs-team-color",team.color);portraitWithStamina(row,p,36);put(row,flowMeter(p.flow,p.name));
 const copy=make("div","bs-player-copy"),line=make("div","bs-player-name-line");put(line,make("strong","",p.name));put(line,make("span","bs-role-badge",p.role||"CM"));put(copy,line);
 put(copy,playerMeta(p.stats.ovr,ratingNow(p)));
 if(p.yellows>0||p.sentOff){const c=make("span","bs-player-card-state",cardLabel(p));c.classList.add(p.sentOff?"is-red-card":"is-yellow-card");put(copy,c);}
 const track=make("div","bs-stamina-track"),fill=make("span","bs-stamina-fill");fill.style.width=clamp(p.stamina,0,100)+"%";fill.style.background="hsl("+Math.round(clamp(p.stamina,0,100)*1.2)+" 82% 48%)";put(track,fill);put(copy,track);put(row,copy);put(parent,row);
}
function stoppageReady(state=match){return ["stoppage","substitution"].includes(progressionState(state));}
function panelSignature(team){return JSON.stringify([team.formation,team.slots,team.assignment,team.roster.filter(p=>p.sentOff).map(p=>p.id),stoppageReady(),stoppageReady()&&match.requiredSub]);}
function updateTeamPanel(panel,team,state=match){
 const possession=panel.querySelector(".bs-team-possession-label");if(possession)possession.textContent=state.possession===team.number?"IN POSSESSION":"OUT OF POSSESSION";
 if(!panel._playerBindings)panel._playerBindings=Array.from(panel.querySelectorAll("[data-player-id]")).map(marker=>({marker,ring:marker.querySelector(".bs-stamina-ring"),meter:marker.querySelector(".bs-flow-meter"),rating:marker.querySelector(".bs-rating-value"),live:marker.querySelector(".bs-live-ovr b"),liveWrap:marker.querySelector(".bs-live-ovr")}));
 const roster=new Map(team.roster.map(p=>[p.id,p])),ratings=positionRatings(team);
 panel._playerBindings.forEach(({marker,ring,meter,rating,live,liveWrap})=>{
  const p=roster.get(marker.dataset.playerId);if(!p)return;
  marker.title=ratingTooltip(team,p,ratings);const ovr=playerOVR(team,p,ratings);if(live&&ovr&&live.textContent!==String(ovr.live))live.textContent=ovr.live;if(liveWrap)liveWrap.style.setProperty("--stamina-hue",String(Math.round(clamp(p.stamina,0,100)*1.2)));
  if(ring){ring.style.setProperty("--stamina",clamp(p.stamina,0,100)+"%");ring.style.setProperty("--stamina-hue",Math.round(p.stamina*1.2));}
  if(meter){meter.style.setProperty("--flow",p.flow+"%");meter.setAttribute("aria-valuenow",Math.round(p.flow));meter.title=p.name+" · FLOW "+Math.round(p.flow)+"%";meter.classList.toggle("is-full",p.flow>=100);}
  if(rating&&rating.textContent!==ratingNow(p).toFixed(2)){rating.textContent=ratingNow(p).toFixed(2);rating.style.color=ratingColor(ratingNow(p));}
 });
}
function matchTeamPanel(number,state=displayState()){
 const t=state.teams[number],aside=make("aside","bs-match-team-panel");aside.dataset.team=number;aside.dataset.structure=panelSignature(t);aside.style.setProperty("--bs-team-color",t.color);
 put(aside,make("span","bs-kicker","TEAM 0"+number));put(aside,make("h2","",t.name));
 put(aside,make("span","bs-team-possession-label",state.possession===number?"IN POSSESSION":"OUT OF POSSESSION"));put(aside,renderMiniFormation(number,state));put(aside,renderMatchChemistry(t));
 const benchHead=make("div","bs-panel-subhead");put(benchHead,make("strong","","RESERVES"));put(benchHead,make("span","",bench(t).length));put(aside,benchHead);
 const benchList=make("div","bs-match-bench");bench(t).forEach(p=>{const row=make("div","bs-bench-player");row.dataset.playerId=p.id;row.style.setProperty("--bs-team-color",t.color);portraitWithStamina(row,p,38);put(row,flowMeter(p.flow,p.name));if(stoppageReady()){row.draggable=true;row.setAttribute("data-drag-reserve",p.id);row.setAttribute("data-drag-team",number);row.title="Drag onto a player on the pitch to substitute";}
  const info=make("div","bs-player-copy");put(info,make("strong","",p.name));put(info,playerMeta(p.stats.ovr,ratingNow(p),"bs-player-subline","BASE OVR"));
  if(p.yellows>0||p.sentOff){const c=make("span","bs-player-card-state",cardLabel(p));c.classList.add(p.sentOff?"is-red-card":"is-yellow-card");put(info,c);}put(row,info);
  if(stoppageReady()&&!match.requiredSub){const sel=make("select","bs-select bs-swap-select");sel.setAttribute("aria-label","Replace starter…");sel.setAttribute("data-sub-target-for",p.id);option(sel,"","Replace starter…");Object.keys(t.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const current=playerIn(t,t.assignment[k]);if(current&&current.role!=="GK")option(sel,k,(t.slots[Number(k)]?t.slots[Number(k)].label:"Slot")+" · "+current.name);});put(row,sel);button(row,"SUB IN","bs-mini-button",{"data-sub-in":p.id,"data-sub-team":number});}
  put(benchList,row);
 });if(!bench(t).length)put(benchList,make("p","bs-empty-note","No available reserves."));put(aside,benchList);
 const tactics=make("details","bs-match-tactics");put(tactics,make("summary","","ADJUST TACTICS"));put(tactics,stratControls(number,t,true));put(aside,tactics);const dossier=make("details","bs-team-dossier");dossier.open=window.matchMedia?window.matchMedia("(min-width: 781px)").matches:true;put(dossier,make("summary","","FORMATION & SQUAD"));Array.from(aside.children).slice(3).forEach(child=>put(dossier,child));put(aside,dossier);return aside;
}
function renderMiniFormation(number,state=displayState()){
 const team=state.teams[number],pitch=make("div","bs-mini-pitch");
 pitch.setAttribute("aria-label",(window.BattleCopy?window.BattleCopy("{team} formation",{team:team.name}):team.name+" formation"));
 put(pitch,make("div","bs-mini-pitch-markings"));
 appendFormationChemistryLines(pitch,team,number===1,"bs-mini-chemistry-lines",liveFormationPoint);
 const ratings=positionRatings(team);
 Object.keys(team.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{
  const p=playerIn(team,team.assignment[k]),slot=team.slots[Number(k)];if(!slot)return;
  if(!p||p.sentOff){
   const req=match.requiredSub;
   if(!(stoppageReady()&&req&&req.teamNumber===number&&String(req.slot)===String(k)))return;
   const empty=make("div","bs-formation-player bs-formation-player--vacant");
   positionMarker(empty,slot,number===1,liveFormationPoint);empty.dataset.slot=k;empty.style.setProperty("--bs-team-color",team.color);
   empty.setAttribute("data-swap-slot",k);empty.setAttribute("data-swap-team",number);
   put(empty,make("strong","bs-formation-player-name","VACANT"));put(pitch,empty);return;
  }
  const card=make("div","bs-formation-player bs-formation-player--compact");
  if(stoppageReady()&&p.role!=="GK"){card.setAttribute("data-swap-slot",k);card.setAttribute("data-swap-team",number);}
  positionMarker(card,slot,number===1,liveFormationPoint);
  card.dataset.slot=k;card.dataset.playerId=p.id;card.style.setProperty("--bs-team-color",team.color);
  const face=make("div","bs-mini-card-face"),picture=make("div","bs-mini-card-avatar");
  portraitWithStamina(picture,p,27);put(face,picture);
  const info=make("div","bs-mini-card-info"),role=make("strong","bs-mini-card-role",slot.label),live=make("span","bs-live-ovr");
  const ovr=playerOVR(team,p,ratings);
  live.title=ratingTooltip(team,p,ratings);
  live.style.setProperty("--stamina-hue",String(Math.round(clamp(p.stamina,0,100)*1.2)));
  put(live,make("span","",window.BattleCopy?window.BattleCopy("LIVE OVR"):"LIVE OVR"));put(live,make("b","",ovr?.live??Math.round(p.stats.ovr)));
  put(info,role);put(info,live);put(face,info);put(card,face);
  const meter=flowMeter(p.flow,p.name);meter.classList.add("bs-mini-flow-horizontal");put(card,meter);
  // The compact sketch deliberately omits a visible name; full identity is
  // retained for pointer/keyboard assistive technology and card interaction.
  put(card,make("strong","bs-formation-player-name bs-visually-hidden",p.name));
  if(p.yellows>0)put(card,make("span","bs-player-card-state is-yellow-card","YC "+p.yellows));
  card.title=p.name+" · "+slot.label+" · "+(ovr?.live??p.stats.ovr)+" LIVE OVR · FLOW "+Math.round(p.flow)+"%";
  card.setAttribute("aria-label",card.title);put(pitch,card);
 });return pitch;
}
function projectPitch(state){
 const points=new Map(),placed=[];
 // Physics coordinates are authoritative; only near-overlapping markers get a
 // deterministic sub-metre visual separation so no active player disappears.
 for(const n of [1,2])for(const p of active(state.teams[n])){
  const q=point(p),key=n+":"+p.id;let x=clamp(q.x,4.5,95.5),y=clamp(q.y,7,93),crowded=false;
  for(let tries=0;tries<12&&placed.some(a=>Math.hypot((x-a.x)*1.05,(y-a.y)*.68)<1.75);tries++){
   crowded=true;const theta=((tries*137.5+(Number(p.id)||p.name.length)*13)%360)*Math.PI/180;
   x=clamp(q.x+Math.cos(theta)*(1.6+tries*.28),4.5,95.5);y=clamp(q.y+Math.sin(theta)*(2.2+tries*.38),7,93);
  }
  points.set(key,{x,y,p,crowded});placed.push({x,y});
 }
 return points;
}
function buildLivePitch(pitch){
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 1050 680");svg.setAttribute("preserveAspectRatio","none");svg.setAttribute("class","bs-field-lines");svg.setAttribute("aria-hidden","true");
 const shape=(tag,attrs)=>{const e=document.createElementNS(svg.namespaceURI,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));put(svg,e);};
 shape("rect",{x:26,y:22,width:998,height:636,rx:2});shape("path",{d:"M525 22V658 M26 138H185V542H26 M1024 138H865V542H1024 M26 247H82V433H26 M1024 247H968V433H1024 M26 298H6V382H26 M1024 298H1044V382H1024 M185 271A92 92 0 0 1 185 409 M865 271A92 92 0 0 0 865 409"});shape("circle",{cx:525,cy:340,r:88});
 [[525,340],[130,340],[920,340]].forEach(([cx,cy])=>shape("circle",{cx,cy,r:3,fill:"currentColor"}));put(pitch,svg);
 const trail=document.createElementNS(svg.namespaceURI,"svg");trail.setAttribute("viewBox","0 0 100 100");trail.setAttribute("preserveAspectRatio","none");trail.setAttribute("class","bs-ball-trail");trail.setAttribute("aria-hidden","true");const line=document.createElementNS(svg.namespaceURI,"line");put(trail,line);put(pitch,trail);
 const ball=make("span","bs-live-ball","⚽");ball.setAttribute("aria-hidden","true");put(pitch,ball);
 pitch._live={markers:new Map(),ball,line,lastEvent:0};
}
function renderPitch(state=displayState()){
 const pitch=byId("bs-pitch");if(!pitch||!state)return;if(!pitch._live)buildLivePitch(pitch);
 const ui=pitch._live,points=projectPitch(state),event=match.events[(match.presentedEventId||0)-1],eventId=event?.id||0,actors=new Set((event?.actors||[]).map(p=>p.teamNumber+":"+p.id));
 ui.markers.forEach((marker,key)=>{if(!points.has(key)){marker.remove();ui.markers.delete(key);}});
 points.forEach(({x,y,p,crowded},key)=>{
  let marker=ui.markers.get(key);
  if(!marker){
   marker=make("span","bs-live-player");marker.dataset.livePlayer=key;
   const avatar=make("img","bs-live-player-portrait");avatar.src=portraitSource(p);avatar.alt="";avatar.loading="eager";avatar.decoding="async";
   avatar.onerror=function(){avatar.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")avatar.src=PLAYER_IMAGE_FALLBACK;};
   put(marker,avatar);
   const gkTag=make("span","bs-live-keeper-tag","GK");gkTag.hidden=p.role!=="GK";put(marker,gkTag);
   const label=make("span","bs-live-player-name",p.name.split(/\s+/).at(-1));put(marker,label);put(pitch,marker);ui.markers.set(key,marker);
  }
  marker.style.setProperty("--x",x);marker.style.setProperty("--y",y);marker.dataset.team=p.teamNumber;marker.style.setProperty("--bs-team-color",state.teams[p.teamNumber].color);
  const tag=marker.querySelector(".bs-live-keeper-tag");if(tag)tag.hidden=p.role!=="GK";
  marker.classList.toggle("is-carrier",state.possession===p.teamNumber&&state.carrierId===p.id);marker.classList.toggle("is-keeper",p.role==="GK");marker.classList.toggle("is-crowded",crowded);marker.classList.toggle("is-involved",actors.has(key));marker.classList.toggle("is-flowing",p.flow>=100);
  marker.title=p.name+" · "+p.role;marker.setAttribute("aria-label",p.name+" · "+p.role);
 });
 const carrier=points.get(state.possession+":"+state.carrierId);
 let target={...point(state.ball||state.ballZone)};
 if(event?.type==="goal")target={x:event.teamNumber===1?98:2,y:50};
 ui.ball.style.setProperty("--x",clamp(target.x,2,98));ui.ball.style.setProperty("--y",clamp(target.y,4,96));
 if(eventId!==ui.lastEvent){
  const previous=ui.target||target;Object.entries({x1:previous.x,y1:previous.y,x2:target.x,y2:target.y}).forEach(([k,v])=>ui.line.setAttribute(k,v));
  pitch.dataset.action=event?.type||"kickoff";ui.line.style.opacity=event&&["pass","set-piece","goal","save","interception","turnover","rebound"].includes(event.type)?"1":"0";
  ui.target=target;ui.lastEvent=eventId;
 }
 const possession=byId("bs-possession-status");if(possession)possession.textContent="POSSESSION: "+state.teams[state.possession].name;
}
function eventMessage(event){
 const actor=event.actors?.[0],other=event.actors?.[1],team=match?.teams[event.teamNumber];
 const keys={pass:"{player} completes a pass to {other}.","set-piece":"{player} completes a pass to {other}.",dribble:"{player} advances with the ball.",carry:"{player} advances with the ball.",interception:"{player} wins possession.",turnover:"{player} wins possession.",rebound:"{player} wins possession.","shot-attempt":"{player} shoots for {team}.",goal:"{player} scores for {team}!",save:"{player} saves the shot.",kickoff:"{team} restart play.",foul:"{player} commits a foul.","yellow-card":"{player} receives a card.","red-card":"{player} receives a card.",substitution:"{team} bring on {player} for {other}.","flow-activation":"{player} activates FLOW.","half-time":"HALF TIME","full-time":"FULL TIME",corner:"CORNER","goal-kick":"GOAL KICK"};
 const player=event.type==="save"||event.type==="turnover"?other:event.type==="interception"?event.actors?.at(-1):actor;
 return{key:keys[event.type]||"Both teams reset their shape.",values:{player:player?.name||"",other:other?.name||"",team:team?.name||""}};
}
function renderEvent(event,archive){
 const item=make("article","bs-feed-event bs-feed-event--"+event.type+(event.notable?" is-notable":" is-routine"));item.dataset.eventId=String(event.id);
 const holder=match&&match.teams&&(match.teams[event.teamNumber]||match.teams[event.possessionTeamNumber]);if(holder&&holder.color)item.style.setProperty("--bs-event-team-color",holder.color);
 const top=make("div","bs-feed-event-top");put(top,make("time","bs-event-time",event.time||timeLabel(event.timeSeconds)));
 const typeLabel=String(event.type).replace(/-/g," ").toUpperCase(),typeNode=make("span","bs-event-type",typeLabel);typeNode.dataset.battleMessage=typeLabel;typeNode.dataset.battleEnglish=typeLabel;put(top,typeNode);put(item,top);const description=make("p","bs-event-description",event.description),copy=eventMessage(event);description.dataset.battleMessage=copy.key;description.dataset.battleValues=JSON.stringify(copy.values);description.dataset.battleEnglish=event.description;put(item,description);
 if(event.comparison||event.probability!=null){const analysis=make("div","bs-event-analysis");if(event.comparison){const c=event.comparison;put(analysis,make("span","bs-event-stat-comparison",String(c.attackerLabel||"ATT")+" "+Math.round(Number(c.attackerValue)||0)+" ↔ "+String(c.defenderLabel||"DEF")+" "+Math.round(Number(c.defenderValue)||0)));}if(event.probability!=null)put(analysis,make("span","bs-event-success",String(event.probabilityLabel||"SUCCESS CHANCE")+" "+Math.round(clamp(Number(event.probability)||0,0,1)*100)+"%"));put(item,analysis);}
 if(event.actors&&event.actors.length){const actors=make("div","bs-event-actors");event.actors.slice(0,3).forEach(p=>{const row=make("div","bs-event-actor"),img=make("img","bs-event-portrait"),actorTeam=match&&match.teams[p.teamNumber];if(actorTeam&&actorTeam.color)row.style.setProperty("--bs-actor-color",actorTeam.color);img.src=portraitSource(p);img.alt=p.name||"Player";img.loading="lazy";img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;};put(row,img);put(row,flowMeter(p.flow,p.name));put(row,make("span","bs-event-actor-name",p.name));put(actors,row);});put(item,actors);}
 // Commentary uses translated event templates. Source dialogue remains exact in saves.
 window.SiteI18n?.apply(item);
 if(archive&&!event.notable)put(item,make("span","bs-routine-tag","ROUTINE EVENT"));return item;
}
function presentationIdle(){return feedQueue.length===0&&feedTimer===null&&stoppageTimer===null&&(!match||match.events.length<=(match.presentedEventId||0));}
function sequenceReady(state,presentation){return progressionState(state,presentation)==="stoppage"&&state.phase!=="fullTime"&&state.timeSeconds<FULL;}
function progressionState(state=match,presentation){
 if(!state)return "finished";
 if(state.manualPaused)return "paused";
 const pending=presentation||{queued:feedQueue.length,timer:feedTimer!==null,presenting:stoppageTimer!==null,unpresented:state.events.length>(state.presentedEventId||0)};
 if(pending.queued||pending.timer||pending.presenting||pending.unpresented)return "presenting";
 if(state.status==="finished"||state.phase==="fullTime")return "finished";
 if(state.status==="paused"&&!state.runnerActive)return state.requiredSub?"substitution":"stoppage";
 return "simulating";
}
function updateSequenceControls(){
 if(!match)return;const next=byId("bs-proceed-match");if(!next)return;
 const state=progressionState(),ready=sequenceReady(match);next.disabled=!ready;next.setAttribute("aria-busy",String(state==="presenting"));
 next.textContent=state==="substitution"?"SUBSTITUTION REQUIRED":ready?"PROCEED TO NEXT SEQUENCE →":state==="presenting"?"PLAYING SEQUENCE…":state==="paused"?"PAUSED":"WAITING FOR STOPPAGE…";
 window.SiteI18n?.apply(next);
}
function presentationSettled(){
 if(!match||!presentationIdle()||match.manualPaused)return;
 if(match.status==="finished"){completeResults();return;}
 if(match.timeSeconds>=FULL&&match.phase!=="firstHalf"){finish(match);return;}
 renderMatch();
 if(match.status==="playing"&&runnerTimer===null&&!match.runnerActive){runnerTimer=setTimeout(()=>{runnerTimer=null;runSequence(match);},TICK_DELAY);}
}
function clearFeedQueue(){if(feedTimer!==null)clearTimeout(feedTimer);if(stoppageTimer!==null)clearTimeout(stoppageTimer);feedTimer=null;stoppageTimer=null;feedDeadline=0;feedRemaining=null;feedQueue=[];feedQueueIds.clear();}
function suspendFeed(){if(feedTimer!==null){feedRemaining=Math.max(0,feedDeadline-Date.now());clearTimeout(feedTimer);feedTimer=null;}}
function scheduleFeedEvent(){
 if(feedTimer!==null||!feedQueue.length||!match||match.manualPaused)return;
 const delay=feedRemaining??feedDelayMs;feedRemaining=null;feedDeadline=Date.now()+delay;
 feedTimer=setTimeout(function(){
  feedTimer=null;feedDeadline=0;
  const event=feedQueue.shift();if(event)feedQueueIds.delete(String(event.id));
  const root=byId("bs-live-feed");
  if(event&&root&&match){
   const empty=root.querySelector(".bs-empty-feed");if(empty)empty.remove();
   if(!root.querySelector('[data-event-id="'+String(event.id)+'"]'))root.prepend(renderEvent(event,false));
   match.presentedEventId=event.id;storeActiveMatch();renderMatch();
  }
  if(feedQueue.length)scheduleFeedEvent();
  presentationSettled();
 },delay);
}
function renderFeed(){
 const root=byId("bs-live-feed");if(!root||!match)return;
 // Append-only engine history: restore once, enqueue only the new suffix.
 if(root._feedMatch!==match){
  root._feedMatch=match;root._queuedThrough=match.presentedEventId||0;
  root.querySelectorAll("[data-event-id]").forEach(e=>e.remove());
  match.events.slice(0,root._queuedThrough).forEach(e=>root.prepend(renderEvent(e,false)));
 }
 match.events.slice(root._queuedThrough).forEach(e=>{feedQueue.push(e);feedQueueIds.add(String(e.id));});root._queuedThrough=match.events.length;
 if(!match.events.length&&!root.querySelector(".bs-empty-feed"))put(root,make("p","bs-empty-feed","Every match tick will appear here."));
 scheduleFeedEvent();
 const count=byId("bs-event-count");if(count)count.textContent=(match.presentedEventId||0)+" EVENTS";
}
function renderStoppage(){
 const root=byId("bs-stoppage-panel");if(!root)return;
 const shouldShow=stoppageReady(),wasHidden=root.hidden;root.hidden=!shouldShow;
 if(!shouldShow){root.classList.remove("bs-stoppage-pop");return;}
 const required=match.requiredSub;
 // Long-range free kicks are passing situations: do not label their taker SHO
 // when the engine will distribute rather than attempt an unrealistic shot.
 const freeKick=match.pending;
 if(freeKick?.type==="free-kick"&&distance(point(freeKick.point||legacyPoint(freeKick.zone)),targetGoal(freeKick.teamNumber))>38)
  freeKick.routine="pass";
 const signature=JSON.stringify([match.stoppage,match.pending,required]);if(!wasHidden&&root.dataset.stoppageSignature===signature)return;root.dataset.stoppageSignature=signature;
 byId("bs-stoppage-title").textContent=match.stoppage||"PLAY PAUSED";
 byId("bs-stoppage-title").dataset.battleMessage=match.stoppage||"PLAY PAUSED";byId("bs-stoppage-title").dataset.battleEnglish=match.stoppage||"PLAY PAUSED";
 byId("bs-stoppage-description").textContent=required?"A player has been sent off. Select a replacement before proceeding.":match.stoppage==="HALF TIME"?"Half-time. Adjust tactics or make substitutions before the second half.":match.stoppage==="GOAL"?"Goal confirmed. Proceed to the restart.":match.stoppage==="SAVE"?"The goalkeeper has possession. Proceed to the next sequence.":"Play is paused. Make substitutions or adjust tactics before proceeding.";
 const controls=byId("bs-set-piece-controls");controls.replaceChildren();const pending=match.pending;
 if(pending&&["penalty","free-kick","corner","goal-kick"].includes(pending.type)){
  const team=match.teams[pending.teamNumber],takerLabel=make("label","bs-field");put(takerLabel,make("span","bs-field-label","Set-piece taker"));
  const taker=make("select","bs-select");taker.id="bs-set-piece-taker";
  const skill=setPieceSkill(pending),isGoalKick=pending.type==="goal-kick";
  active(team).filter(p=>isGoalKick||p.role!=="GK")
   .slice().sort((a,b)=>((isGoalKick&&b.role==="GK")?150:0)+b.stats[skill]-((isGoalKick&&a.role==="GK")?150:0)-a.stats[skill])
   .forEach(p=>option(taker,p.id,p.name+" · "+skill.toUpperCase()+" "+Math.round(effective(p,skill))));
  if(pending.takerId!=null)taker.value=idOf(pending.takerId);put(takerLabel,taker);put(controls,takerLabel);
  const routineLabel=make("label","bs-field");put(routineLabel,make("span","bs-field-label","Routine"));
  const routine=make("select","bs-select");routine.id="bs-set-piece-routine";
  if(pending.type==="penalty")option(routine,"direct","Take the penalty");
  else if(pending.type==="goal-kick"){option(routine,"short","Short distribution");option(routine,"direct","Long distribution");}
  else if(pending.type==="corner"){option(routine,"cross","Cross into the box");option(routine,"short","Short corner");}
  else{if(distance(point(pending.point||legacyPoint(pending.zone)),targetGoal(pending.teamNumber))<=38)option(routine,"direct","Direct shot");option(routine,"pass","Play a pass");}
  routine.value=pending.routine||"direct";put(routineLabel,routine);put(controls,routineLabel);
 }
 if(required){
  const section=make("section","bs-required-substitution");put(section,make("strong","","MANDATORY SUBSTITUTION"));
  put(section,make("p","bs-help-text","Replace the sent-off player to continue the match."));
  const select=make("select","bs-select");select.id="bs-required-sub-player";option(select,"","Choose a reserve…",false);
  const team=match.teams[required.teamNumber];bench(team).forEach(p=>option(select,p.id,p.name+" · OVR "+Math.round(p.stats.ovr)));
  if(required.reserveId)select.value=required.reserveId;put(section,select);button(section,"CONFIRM REPLACEMENT","bs-button bs-button--primary",{"data-required-substitute":required.teamNumber});put(controls,section);
 }
 if(wasHidden){root.classList.remove("bs-stoppage-pop");void root.offsetWidth;root.classList.add("bs-stoppage-pop");}
}
function renderMatch(){
 if(!match)return;
 const state=displayState();
 document.body.classList.add("bs-game-route");
 byId("bs-setup-view").hidden=true;byId("bs-match-view").hidden=false;byId("bs-results-view").hidden=true;
 byId("bs-match-time").textContent=timeLabel(state.timeSeconds);byId("bs-score-1").textContent=state.score[1];byId("bs-score-2").textContent=state.score[2];
 byId("bs-match-team-name-1").textContent=state.teams[1].name;byId("bs-match-team-name-2").textContent=state.teams[2].name;
 byId("bs-match-phase").textContent=state.phase==="secondHalf"?"SECOND HALF":state.phase==="halfTime"?"HALF TIME":state.phase==="fullTime"?"FULL TIME":"FIRST HALF";
 byId("bs-match-status").textContent=match.manualPaused?"PAUSED":stoppageReady()?"STOPPAGE":"LIVE";
 const root=byId("bs-match-team-panels");
 if(!root.querySelector(".bs-center-stage")){
  root.replaceChildren();put(root,matchTeamPanel(1,state));const center=make("section","bs-center-stage");root.insertBefore(center,root.firstElementChild);put(root,matchTeamPanel(2,state));
  const pp=make("section","bs-pitch-panel"),ph=make("div","bs-panel-topline");put(ph,make("span","bs-kicker","LIVE PITCH"));put(pp,ph);
  const legend=make("div","bs-pitch-legend");[1,2].forEach(n=>{const name=make("span","",n===1?state.teams[n].name+" →":"← "+state.teams[n].name);name.style.setProperty("--bs-team-color",state.teams[n].color);put(legend,name);});put(pp,legend);
  const pitch=make("div","bs-live-pitch");pitch.id="bs-pitch";pitch.setAttribute("role","group");pitch.setAttribute("aria-label","LIVE PITCH");put(pp,pitch);
  const pos=make("p","bs-possession-footnote");pos.id="bs-possession-status";put(pp,pos);put(center,pp);
  const actions=byId("bs-match-view").querySelector(".bs-match-actions");if(actions){center.insertBefore(actions,pp);const delay=byId("bs-feed-delay");if(delay)delay.value=String(feedDelayMs/1000);const output=byId("bs-feed-delay-value");if(output)output.textContent=feedDelayLabel(feedDelayMs);}
  const fp=make("section","bs-live-feed-panel");fp.style.setProperty("--bs-possession-color",state.teams[state.possession].color);
  const fh=make("div","bs-panel-topline");put(fh,make("h2","","MATCH FEED"));const count=make("span","bs-event-count");count.id="bs-event-count";put(fh,count);put(fp,fh);
  const feed=make("div","bs-live-feed");feed.id="bs-live-feed";feed.setAttribute("aria-live","polite");feed.setAttribute("aria-label","All match tick events");put(fp,feed);put(center,fp);
  const stop=make("section","bs-stoppage-panel");stop.id="bs-stoppage-panel";stop.hidden=true;put(stop,make("span","bs-kicker","SEQUENCE PAUSED"));
  const st=make("h2");st.id="bs-stoppage-title";put(stop,st);const sd=make("p");sd.id="bs-stoppage-description";put(stop,sd);
  const controls=make("div","bs-set-piece-controls");controls.id="bs-set-piece-controls";put(stop,controls);center.insertBefore(stop,fp);const sequence=make("div","bs-sequence-controls");const proceed=byId("bs-proceed-match");if(proceed)put(sequence,proceed);center.insertBefore(sequence,fp);
 }else{
  const teams=root.querySelectorAll(":scope > .bs-match-team-panel");teams.forEach((panel,i)=>{const team=state.teams[i+1];if(panel.dataset.structure!==panelSignature(team)){const replacement=matchTeamPanel(i+1,state);for(const selector of [".bs-team-dossier",".bs-match-tactics"]){const old=panel.querySelector(selector),next=replacement.querySelector(selector);if(old&&next)next.open=old.open;}root.replaceChild(replacement,panel);}else updateTeamPanel(panel,team,state);});
 }
 const fp=root.querySelector(".bs-live-feed-panel");if(fp)fp.style.setProperty("--bs-possession-color",state.teams[state.possession].color);
 renderPitch(state);renderFeed();renderStoppage();
 updateSequenceControls();
 window.SiteI18n?.apply(byId("bs-match-view"));
 const pause=byId("bs-pause-match");if(pause){pause.disabled=stoppageReady()||match.status==="finished";pause.textContent=match.manualPaused?"RESUME SIM":"PAUSE SIM";}
 const ff=byId("bs-fast-forward");if(ff)ff.disabled=match.status==="finished";
}
function teamSummary(number){
 const t=match.teams[number],s=t.stats,poss=Math.round(s.poss/Math.max(1,match.tick)*100),panel=make("section","bs-result-team-card");
 panel.style.setProperty("--bs-team-color",t.color);put(panel,make("span","bs-kicker","TEAM 0"+number));put(panel,make("h3","",t.name));
 const grid=make("div","bs-result-team-metrics");
 const values=[["Possession",poss+"%"],["Shots",s.shots],["On target",s.onTarget],["Passes",s.passes+"/"+s.attempted],["Pass accuracy",(s.attempted?Math.round(s.passes/s.attempted*100):0)+"%"],["Tackles",s.tackles],["Interceptions",s.interceptions],["Saves",s.saves],["Turnovers",s.turnovers],["Fouls",s.fouls],["Corners",s.corners],["Cards",s.yellowCards+"Y / "+s.redCards+"R"]];
 values.forEach(v=>{const cell=make("div","bs-result-metric");put(cell,make("span","",v[0]));put(cell,make("strong","",v[1]));put(grid,cell);});put(panel,grid);return panel;
}
function renderRatingTable(){
 const root=byId("bs-player-ratings");root.replaceChildren();
 [1,2].forEach(n=>{
  const t=match.teams[n],section=make("section","bs-ratings-team"),title=make("h3","",""+t.name+" · PLAYER RATINGS");
  title.style.color=t.color;put(section,title);
  const scroll=make("div","bs-table-scroll"),table=make("table","bs-ratings-table"),head=make("thead"),tr=make("tr");
  ["Player","Rating","G","A","Shots","Passes","Tackles","Ints","Saves","Cards","Stamina"].forEach(s=>put(tr,make("th","",s)));
  put(head,tr);put(table,head);const body=make("tbody");
  t.roster.slice().sort((a,b)=>b.match.rating-a.match.rating).forEach(p=>{
   const row=make("tr"),name=make("td","bs-result-player-name"),person=make("span","bs-result-player");
   portrait(person,p,29);put(person,make("strong","",p.name));put(name,person);put(row,name);
   const cards=p.yellows+"Y"+(p.sentOff?" · RC":"");
   [p.match.rating.toFixed(2),p.match.goals,p.match.assists,p.match.shots,p.match.passes+"/"+p.match.passesAttempted,p.match.tackles,p.match.interceptions,p.match.saves,cards,Math.round(p.stamina)+"%"].forEach((v,i)=>{const cell=make("td",i===0?"bs-rating-cell":"",v);if(i===0)cell.style.color=ratingColor(p.match.rating);put(row,cell);});
   row.style.setProperty("--bs-team-color",t.color);put(body,row);
  });
  put(table,body);put(scroll,table);put(section,scroll);put(root,section);
 });
}
function renderArchive(){
 const root=byId("bs-event-archive");if(!root||!match)return;root.replaceChildren();
 const filter=byId("bs-archive-filter").value,list=match.events.filter(e=>filter!=="notable"||e.notable).slice().reverse();
 byId("bs-archive-count").textContent=list.length+" EVENTS · LATEST FIRST";list.forEach(e=>put(root,renderEvent(e,true)));
}
function showResults(){document.body.classList.remove("bs-game-route");clearFeedQueue();byId("bs-setup-view").hidden=true;byId("bs-match-view").hidden=true;byId("bs-results-view").hidden=false;const score=byId("bs-result-score");score.replaceChildren();const a=make("strong","bs-result-team-name",match.teams[1].name),middle=make("strong","bs-result-final-score",match.score[1]+" — "+match.score[2]),b=make("strong","bs-result-team-name",match.teams[2].name);a.style.setProperty("--bs-team-color",match.teams[1].color);b.style.setProperty("--bs-team-color",match.teams[2].color);put(score,a);put(score,middle);put(score,b);const verdict=match.score[1]===match.score[2]?"DRAW":match.score[1]>match.score[2]?match.teams[1].name+" WIN":match.teams[2].name+" WIN";byId("bs-result-verdict").textContent=verdict+" · FULL TIME · "+timeLabel(match.timeSeconds);const summaries=byId("bs-result-team-summaries");summaries.replaceChildren();put(summaries,teamSummary(1));put(summaries,teamSummary(2));const star=[...match.teams[1].roster,...match.teams[2].roster].filter(p=>Object.values(match.teams[p.teamNumber].assignment).includes(p.id)||Object.entries(p.match).some(([key,value])=>!["rating","points"].includes(key)&&value>0)).sort((a,b)=>b.match.rating-a.match.rating||b.match.goals-a.match.goals)[0];
const previousStar=byId("bs-standout");if(previousStar)previousStar.remove();if(star){const standout=make("p","bs-standout");standout.id="bs-standout";put(standout,make("span","","PLAYER OF THE MATCH"));put(standout,make("strong","",star.name));put(standout,make("b","",star.match.rating.toFixed(2)));score.after(standout);}
renderRatingTable();renderArchive();window.SiteI18n?.apply(byId("bs-results-view"));try{const finishedSnapshot=JSON.stringify(snapshotMatch(match));sessionStorage.setItem(RESULT_KEY,finishedSnapshot);localStorage.setItem(RESULT_KEY,finishedSnapshot);}catch(e){}window.scrollTo({top:0,behavior:"instant"});}
function startMatch(){
 setupTeams=[normalizeTeam(setupTeams[0],1),normalizeTeam(setupTeams[1],2)];match=createMatch();match.manualPaused=false;match.introPending=true;matchViewBuilt=false;
 try{sessionStorage.removeItem(LAUNCH_KEY);sessionStorage.removeItem(SETUP_RETURN_KEY);sessionStorage.setItem(ACTIVE_MATCH_KEY,JSON.stringify(snapshotMatch(match)));}catch(e){}
 if(typeof updateRoute==="function")updateRoute("battleSimGame");else renderMatchIntro();
}
function replaceSetupStarter(team,slot,reserveId){const p=playerIn(team,reserveId);if(!p||isSpecialKeeper(p)||team.slots[Number(slot)]?.label==="GK"&&isSpecialKeeper(playerIn(team,team.assignment[String(slot)]))||Object.values(team.assignment).map(idOf).includes(idOf(p.id)))return false;team.assignment[String(slot)]=p.id;return true;}
function substitute(team,slot,reserveId){
 const p=playerIn(team,reserveId),out=playerIn(team,team.assignment[String(slot)]);
 if((!fastForwarding&&!stoppageReady())||!p||!out||p.sentOff||isSpecialKeeper(p)||isSpecialKeeper(out)||!team.slots[Number(slot)]||active(team).some(x=>idOf(x.id)===idOf(p.id)))return false;
 if(idOf(match.carrierId)===idOf(out.id)&&match.possession===team.number)match.carrierId=p.id;
 setPosition(p,out);p.homeX=out.homeX;p.homeY=out.homeY;p.homeZone=out.homeZone;p.role=team.slots[Number(slot)]?team.slots[Number(slot)].label:"CM";
 p.movementProgress=0;p.stamina=Math.max(p.stamina,92);team.assignment[String(slot)]=p.id;out.role="BENCH";out.homeZone=out.zone;
 if(match.requiredSub&&match.requiredSub.teamNumber===team.number&&String(match.requiredSub.slot)===String(slot))match.requiredSub=null;
 addEvent(match,{type:"substitution",teamNumber:team.number,notable:true,zone:p.zone,description:team.name+" substitute "+p.name+" for "+out.name+".",actors:[p,out],dialogue:[{playerId:p.id,text:p.name+": \"I am ready.\""}]});
 storeActiveMatch();return true;
}
function toggleManualPause(){
 if(!match||match.status==="finished"||stoppageReady())return;match.manualPaused=!match.manualPaused;
 if(match.manualPaused){if(runnerTimer!==null)clearTimeout(runnerTimer);runnerTimer=null;match.runnerActive=false;suspendFeed();storeActiveMatch();renderMatch();}
 else{storeActiveMatch();renderMatch();scheduleFeedEvent();presentationSettled();}
}
function fastForwardMatch(){
 if(!match||match.status==="finished")return;fastForwarding=true;clearFeedQueue();if(runnerTimer)clearTimeout(runnerTimer);runnerTimer=null;match.runnerActive=false;match.manualPaused=false;let guard=0;
 while(match.status!=="finished"&&guard<2000){guard++;if(match.timeSeconds>=FULL){finish(match);break;}
  if(match.status==="paused"){
   if(match.requiredSub){const req=match.requiredSub,team=match.teams[req.teamNumber],reserve=bench(team)[0];if(reserve)substitute(team,req.slot,reserve.id);else match.requiredSub=null;}
   if(match.phase==="halfTime"){match.phase="secondHalf";kickoff(match,2);const p=playerIn(match.teams[2],match.carrierId);addEvent(match,{type:"kickoff",teamNumber:2,notable:true,description:"Second-half kick-off. "+match.teams[2].name+" restart play.",actors:[p],dialogue:[]});}
   else if(match.pending&&match.pending.type==="kickoff")kickoff(match,match.pending.teamNumber);
   else if(match.pending&&["penalty","free-kick","corner","goal-kick"].includes(match.pending.type))match.forced=Object.assign({},match.pending);
   match.stoppage="";match.status="playing";
  }
  if(match.phase==="firstHalf"&&match.timeSeconds>=HALF){match.phase="halfTime";match.pending={type:"half-time",teamNumber:2,zone:7};addEvent(match,{type:"half-time",notable:true,description:"HALF TIME. The teams return to the touchline.",actors:[]});pause(match,"HALF TIME");continue;}
  if(match.timeSeconds>=FULL){finish(match);break;}playerTick(match);
 }
 if(match.status!=="finished")finish(match);fastForwarding=false;
}
function continueMatch(){
 if(!sequenceReady(match))return;
 match.status="resolving";
 if(match.phase==="halfTime"){match.phase="secondHalf";kickoff(match,2);const p=playerIn(match.teams[2],match.carrierId);addEvent(match,{type:"kickoff",teamNumber:2,notable:true,description:"Second-half kick-off. "+match.teams[2].name+" restart play.",actors:[p],dialogue:[]});}
 else if(match.pending&&match.pending.type==="kickoff"){
  const n=match.pending.teamNumber;kickoff(match,n);
  // Record a real restart for presentation without consuming simulation RNG.
  addEvent(match,{type:"kickoff",presentationOnly:true,teamNumber:n,description:match.teams[n].name+" restart play.",actors:[playerIn(match.teams[n],match.carrierId)]});
 }
 else if(match.pending&&["penalty","free-kick","corner","goal-kick"].includes(match.pending.type)){const pending=Object.assign({},match.pending),taker=byId("bs-set-piece-taker"),routine=byId("bs-set-piece-routine");if(taker&&taker.value)pending.takerId=taker.value;if(routine&&routine.value)pending.routine=routine.value;match.forced=pending;}
 match.stoppage="";match.status="playing";match.manualPaused=false;storeActiveMatch();renderMatch();runSequence(match);
}
function handleDragStart(event){
 const row=event.target.closest("[data-drag-reserve]");
 if(!row||!match||match.status!=="paused"){event.preventDefault();return;}
 draggedReserve={teamNumber:Number(row.getAttribute("data-drag-team")),playerId:String(row.getAttribute("data-drag-reserve"))};
 if(event.dataTransfer){event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",JSON.stringify(draggedReserve));}
}
function handleDragOver(event){
 const target=event.target.closest("[data-swap-slot][data-swap-team]");if(!target||!draggedReserve||!match||match.status!=="paused")return;
 const teamNumber=Number(target.getAttribute("data-swap-team")),slot=String(target.getAttribute("data-swap-slot")),req=match.requiredSub;
 if(teamNumber!==draggedReserve.teamNumber||(req&&(req.teamNumber!==teamNumber||String(req.slot)!==slot)))return;
 event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect="move";target.classList.add("is-drop-target");
}
function handleDrop(event){
 const target=event.target.closest("[data-swap-slot][data-swap-team]");if(!target||!draggedReserve||!match||match.status!=="paused")return;
 const teamNumber=Number(target.getAttribute("data-swap-team")),slot=String(target.getAttribute("data-swap-slot")),req=match.requiredSub;
 if(teamNumber!==draggedReserve.teamNumber)return;
 if(req&&(req.teamNumber!==teamNumber||String(req.slot)!==slot)){event.preventDefault();byId("bs-stoppage-description").textContent="Choose an available reserve to complete the mandatory substitution.";return;}
 event.preventDefault();const team=match.teams[teamNumber],reserveId=draggedReserve.playerId;
 if(team&&substitute(team,slot,reserveId)){draggedReserve=null;renderMatch();}
}
function handleDragEnd(){
 draggedReserve=null;const root=byId("bs-match-team-panels");if(root)root.querySelectorAll(".is-drop-target").forEach(el=>el.classList.remove("is-drop-target"));
}
function handleClick(event){
 const b=event.target.closest("button");if(!b)return;
 if(b.id==="bs-start-match")startMatch();else if(b.id==="bs-skip-intro")finishMatchIntro();else if(b.id==="bs-proceed-match")continueMatch();else if(b.id==="bs-pause-match")toggleManualPause();else if(b.id==="bs-fast-forward")fastForwardMatch();
 else if(b.id==="bs-back-home"){if(typeof updateRoute==="function")updateRoute("menu");else window.location.href="../";}
 else if(b.id==="bs-return-setup"||b.id==="bs-return-setup-results"){
  if(match){setupTeams=[normalizeTeam(serializeTeam(match.teams[1]),1),normalizeTeam(serializeTeam(match.teams[2]),2)];setupTeams.forEach(t=>t.source="random");try{sessionStorage.setItem(SETUP_RETURN_KEY,JSON.stringify({teams:setupTeams.map(serializeTeam)}));}catch(e){}}
  if(typeof updateRoute==="function")updateRoute("battleSimInitializer");else{renderInit();window.scrollTo({top:0,behavior:"instant"});}
 }else if(b.id==="bs-rematch")startMatch();
 else if(b.hasAttribute("data-required-substitute")){const n=Number(b.getAttribute("data-required-substitute")),req=match&&match.requiredSub,sel=byId("bs-required-sub-player"),team=match&&match.teams[n];if(!req||!team||req.teamNumber!==n||!sel||!sel.value){byId("bs-stoppage-description").textContent="Choose an available reserve to complete the mandatory substitution.";return;}if(substitute(team,req.slot,sel.value))renderMatch();}
 else if(b.hasAttribute("data-swap-player")){const n=Number(b.getAttribute("data-swap-team")),card=b.closest("[data-team-card]"),sel=card&&card.querySelector('[data-reserve-player="'+b.getAttribute("data-swap-player")+'"]');if(!sel||sel.value===""){byId("bs-setup-help").textContent="Choose which starter this reserve should replace, then press SWAP.";return;}if(replaceSetupStarter(setupTeams[n-1],sel.value,b.getAttribute("data-swap-player")))renderInit();}
 else if(b.hasAttribute("data-save-team")){const n=Number(b.getAttribute("data-save-team")),card=b.closest("[data-team-card]"),input=card&&card.querySelector('[data-save-name="'+n+'"]'),t=setupTeams[n-1],oldName=t.name,name=String(input&&input.value||t.name).trim().slice(0,32);if(!name){byId("bs-setup-help").textContent="Enter a name before saving this team.";return;}t.name=name;if(!saveTeamToSharedStandalone(t,name)){t.name=oldName;byId("bs-setup-help").textContent="Unable to save this squad. Check browser storage and player availability.";return;}t.savedId="standalone-global-xi";t.source="saved";savedTeams=loadSavedTeams();renderInit();byId("bs-setup-help").textContent="Squad saved to Team Builder."; }else if(b.hasAttribute("data-sub-in")){const n=Number(b.getAttribute("data-sub-team")),rid=b.getAttribute("data-sub-in"),team=match&&match.teams[n],row=b.closest(".bs-bench-player"),sel=row&&row.querySelector("[data-sub-target-for]");if(!team||match.status!=="paused")return;let slot=sel&&sel.value;if(slot==="")slot=Object.keys(team.assignment).find(k=>{const p=playerIn(team,team.assignment[k]);return p&&p.role!=="GK";});if(slot!=null&&substitute(team,slot,rid))renderMatch();}
}
function handleChange(event){const t=event.target;if(t.id==="bs-required-sub-player"&&match?.requiredSub){match.requiredSub.reserveId=t.value;storeActiveMatch();return;}if(match?.pending&&(t.id==="bs-set-piece-taker"||t.id==="bs-set-piece-routine")){match.pending[t.id==="bs-set-piece-taker"?"takerId":"routine"]=t.value;storeActiveMatch();if(t.id==="bs-set-piece-routine")renderStoppage();return;}if(t.matches("[data-team-formation]")){const n=Number(t.getAttribute("data-team-formation")),team=setupTeams[n-1];if(FORMATIONS[t.value]){setupTeams[n-1]=normalizeTeam(Object.assign({},team,{formation:t.value,slots:formationSlots(t.value)}),n);renderInit();}return;}if(t.matches("[data-team-source]")){const n=Number(t.getAttribute("data-team-source")),source=t.value;if(source==="auction"&&launchSnapshot){setupTeams[n-1]=snapshotTeam(n===1?launchSnapshot.team1:launchSnapshot.team2,n,launchSnapshot);}else if(source==="random")setupTeams[n-1]=randomTeam(n,setupTeams[n-1]);else if(source==="saved"&&savedTeams.length){const current=setupTeams[n-1],saved=savedTeams.find(item=>idOf(item.id)===idOf(current.savedId))||savedTeams[0];setupTeams[n-1]=normalizeTeam(saved.team,n);setupTeams[n-1].source="saved";setupTeams[n-1].savedId=idOf(saved.id);}renderInit();}else if(t.matches("[data-saved-team]")){const n=Number(t.getAttribute("data-saved-team")),saved=savedTeams.find(x=>idOf(x.id)===idOf(t.value));if(saved){setupTeams[n-1]=normalizeTeam(saved.team,n);setupTeams[n-1].source="saved";setupTeams[n-1].savedId=saved.id;renderInit();}}else if(t.matches("[data-archive-filter]")||t.id==="bs-archive-filter")renderArchive();else if(t.matches("[data-team-name]")){const n=Number(t.getAttribute("data-team-name"));setupTeams[n-1].name=String(t.value||"TEAM "+n).slice(0,32);const h=t.closest("[data-team-card]").querySelector(".bs-team-card-heading h2");if(h)h.textContent=setupTeams[n-1].name;}else if(t.matches("[data-team-color]")){const n=Number(t.getAttribute("data-team-color"));if(validColor(t.value)){setupTeams[n-1].color=t.value;t.closest("[data-team-card]").style.setProperty("--bs-team-color",t.value);}}else if(t.matches("[data-team-strategy]")){const n=Number(t.getAttribute("data-team-strategy")),k=t.getAttribute("data-strategy-key"),v=clamp(Number(t.value),0,100);if(setupTeams[n-1])setupTeams[n-1].strategy[k]=v;if(match&&match.teams[n])match.teams[n].strategy[k]=v;const out=t.closest(".bs-strategy-control").querySelector(".bs-strategy-value");if(out)out.textContent=v;if(match)storeActiveMatch();}}
function handleInput(event){const t=event.target;if(t&&t.id==="bs-feed-delay"){const oldDelay=feedDelayMs;suspendFeed();feedDelayMs=clamp(Number(t.value)||1,0.25,5)*1000;if(feedRemaining!==null)feedRemaining=feedRemaining/oldDelay*feedDelayMs;const out=byId("bs-feed-delay-value");if(out)out.textContent=feedDelayLabel(feedDelayMs);scheduleFeedEvent();return;}if(t.matches("[data-team-name]")){const n=Number(t.getAttribute("data-team-name"));setupTeams[n-1].name=String(t.value||"TEAM "+n).slice(0,32);const h=t.closest("[data-team-card]").querySelector(".bs-team-card-heading h2");if(h)h.textContent=setupTeams[n-1].name;}else if(t.matches("[data-team-color]")){const n=Number(t.getAttribute("data-team-color"));if(validColor(t.value)){setupTeams[n-1].color=t.value;t.closest("[data-team-card]").style.setProperty("--bs-team-color",t.value);}}else if(t.matches("[data-team-strategy]")){const n=Number(t.getAttribute("data-team-strategy")),k=t.getAttribute("data-strategy-key"),v=clamp(Number(t.value),0,100);if(setupTeams[n-1])setupTeams[n-1].strategy[k]=v;if(match&&match.teams[n])match.teams[n].strategy[k]=v;const out=t.closest(".bs-strategy-control").querySelector(".bs-strategy-value");if(out)out.textContent=v;}}
function init(){
 if(initialized||!byId("battle-sim-screen"))return;initialized=true;savedTeams=loadSavedTeams();
 const bsEarlyAccessStatus=byId("battle-sim-screen")?.querySelector(".page-context-status");
 if(bsEarlyAccessStatus){bsEarlyAccessStatus.innerHTML="<i></i> <span>EARLY ACCESS</span> // TEXT-BASED MATCH ENGINE";window.SiteI18n?.apply(bsEarlyAccessStatus);}
 document.title="Blue Lock Draft — Battle Sim Early Access";
 try{launchSnapshot=JSON.parse(sessionStorage.getItem(LAUNCH_KEY)||"null");}catch(e){launchSnapshot=null;}
 let returned=null;try{returned=JSON.parse(sessionStorage.getItem(SETUP_RETURN_KEY)||"null");}catch(e){}
 const route=typeof getRouteFromLocation==="function"?getRouteFromLocation():"battleSim";
 if(route==="battleSimGame"){
  match=readStoredMatch(ACTIVE_MATCH_KEY);if(!match){if(typeof updateRoute==="function")updateRoute("battleSimInitializer",{replace:true});return;}
  if(match.status==="finished"&&match.presentedEventId>=match.events.length){if(typeof updateRoute==="function")updateRoute("battleSimResults",{replace:true});else showResults();return;}
  setupTeams=[normalizeTeam(serializeTeam(match.teams[1]),1),normalizeTeam(serializeTeam(match.teams[2]),2)];
  const root=byId("battle-sim-screen");root.addEventListener("click",handleClick);root.addEventListener("change",handleChange);root.addEventListener("input",handleInput);root.addEventListener("dragstart",handleDragStart);root.addEventListener("dragover",handleDragOver);root.addEventListener("drop",handleDrop);root.addEventListener("dragend",handleDragEnd);
  if(match.introPending){renderMatchIntro();return;}renderMatch();if(match.status==="playing"&&!match.manualPaused)runSequence(match);else presentationSettled();return;
 }
 if(route==="battleSimResults"){
  match=readStoredMatch(RESULT_KEY);if(!match||match.status!=="finished"){if(typeof updateRoute==="function")updateRoute("battleSimInitializer",{replace:true});return;}
  setupTeams=[normalizeTeam(serializeTeam(match.teams[1]),1),normalizeTeam(serializeTeam(match.teams[2]),2)];setupTeams.forEach(t=>t.source="random");
  const root=byId("battle-sim-screen");root.addEventListener("click",handleClick);root.addEventListener("change",handleChange);root.addEventListener("input",handleInput);showResults();return;
 }
 if(returned&&Array.isArray(returned.teams)&&returned.teams.length===2){setupTeams=returned.teams.map((t,i)=>normalizeTeam(t,i+1));try{sessionStorage.removeItem(SETUP_RETURN_KEY);}catch(e){}}
 else if(launchSnapshot&&launchSnapshot.team1&&launchSnapshot.team2)setupTeams=[snapshotTeam(launchSnapshot.team1,1,launchSnapshot),snapshotTeam(launchSnapshot.team2,2,launchSnapshot)];
 else setupTeams=[randomTeam(1),randomTeam(2)];
 const root=byId("battle-sim-screen");root.addEventListener("click",handleClick);root.addEventListener("change",handleChange);root.addEventListener("input",handleInput);renderInit();
}
document.addEventListener("DOMContentLoaded",function(){let route="";try{route=typeof getRouteFromLocation==="function"?getRouteFromLocation():"";}catch(e){}if(["battleSim","battleSimInitializer","battleSimGame","battleSimResults"].includes(route)||(byId("battle-sim-screen")&&!byId("battle-sim-screen").classList.contains("hidden")))init();});})();
