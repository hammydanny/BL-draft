/* BATTLE SIM // Generic football simulation and text UI. */
(function () {
"use strict";
const BATTLE_TEAM_LIBRARY_KEY="blBattleSimTeamLibraryV1";
const AUCTION_STORAGE_KEY="blAuctionSaveV2", STANDALONE_STORAGE_KEY="blStandaloneBuilderV1", LAUNCH_KEY="blBattleSimLaunchV1", RESULT_KEY="blBattleSimLastResultV1", ACTIVE_MATCH_KEY="blBattleSimActiveMatchV1", SETUP_RETURN_KEY="blBattleSimSetupReturnV1";
const HALF=2700,FULL=5400,TICK_DELAY=45,MAX_SEQUENCE=10000,MAX_LIVE_FEED_EVENTS=20,BLUE="#19a7ff",RED="#ff315d";
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
 if(auction&&auction.team1&&auction.team2){
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
 const library=readSharedStorage(BATTLE_TEAM_LIBRARY_KEY);
 if(Array.isArray(library))library.slice(-20).forEach(item=>{
  if(!item||typeof item!=="object"||!Array.isArray(item.playerIds))return;
  const roster=resolveSharedRoster(item.playerIds);if(!roster.length)return;
  const team=normalizeTeam({name:item.name,color:item.color,formation:item.formation,roster,
    assignment:item.assignment,strategy:item.strategy,source:"saved",savedId:idOf(item.id)},3);
  if(team.roster.length!==roster.length)return;
  team.source="saved";team.savedId=idOf(item.id);
  out.push({id:team.savedId,name:team.name+" · SAVED SQUAD",createdAt:item.createdAt||"",team});
 });
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
  try{
   const library=readSharedStorage(BATTLE_TEAM_LIBRARY_KEY),list=Array.isArray(library)?library.filter(x=>x&&Array.isArray(x.playerIds)).slice(-19):[];
   list.push({id:"battle-squad-"+Date.now(),name:saved.name,color:saved.color,playerIds:saved.playerIds,
    formation:saved.formation,assignment:saved.assignment,strategy:{...team.strategy},createdAt:new Date().toISOString()});
   localStorage.setItem(BATTLE_TEAM_LIBRARY_KEY,JSON.stringify(list));
  }catch(e){}
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
   Array.isArray(e.dialogue)&&e.actors.every(a=>resolveSharedPlayer(a,0))&&
   (!e.nearbyDefenders||(Array.isArray(e.nearbyDefenders)&&e.nearbyDefenders.length<=22&&
    e.nearbyDefenders.every(d=>d&&typeof d.name==="string"&&Number.isFinite(d.def)&&d.def>=0&&d.def<=100&&
     Number.isFinite(d.distance)&&d.distance>=0&&typeof d.selected==="boolean")))&&
   (!e.shotRoute||[e.shotRoute.from,e.shotRoute.to].every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100))&&
   (!e.runRoute||[e.runRoute.from,e.runRoute.to].every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100))&&
   ["ability","abilityNote","reaction"].every(k=>!e[k]||typeof e[k].id==="string"&&typeof e[k].label==="string"&&e[k].label.length<=40)&&
   e.dialogue.every(d=>d&&typeof d.text==="string"&&(d.key==null||typeof d.key==="string"))))return null;
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
   if(!restoreMatchParticipation(team,n,snapshot.events))return null;
   delete team._bsChemistryCache;delete team._bsChemistrySignature;
  }
  const state={...snapshot};sanitizeIntelligence(state);[1,2].forEach(n=>state.teams[n].roster.forEach(enforceBlueLockMan));state.random=seeded(state.seed,state.randomState);delete state.randomState;state.runnerActive=false;state.introPending=snapshot.introPending===true;
  state.ball=state.ball&&Number.isFinite(state.ball.x)&&Number.isFinite(state.ball.y)?state.ball:legacyPoint(state.ballZone);
  state.presentedEventId=Math.floor(clamp(Number(state.presentedEventId)||0,0,state.events.length));
  if(snapshot.presentationVersion==null&&state.events.some(e=>!e.presentation)){
   state.presentedEventId=state.events.length;state.events.forEach(e=>delete e.presentation);
   if(state.events.length)state.events.at(-1).presentation=capturePresentation(state);
  }else if(!state.events.filter(e=>e.id>=Math.max(1,state.presentedEventId)).every(e=>validPresentation(e.presentation,state)))return null;
  return state;
 }catch(e){return null;}
}
// v0.8.9 intelligence state from storage: intents, tactical memory, ability uses and reaction
// cooldowns are re-validated (bounded, finite, referring to players in the match) or dropped.
function sanitizeIntelligence(state){
 const fin=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,pt=v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)?{x:clamp(v.x,0,100),y:clamp(v.y,0,100)}:null;
 [1,2].forEach(n=>state.teams[n].roster.forEach(p=>{
  const it=p.intent;
  if(it&&(it.type==="run"||it.type==="hold"||it.type==="support")&&pt(it.target)){const dir=it.dir&&Number.isFinite(it.dir.x)&&Number.isFinite(it.dir.y)?{x:clamp(it.dir.x,-1,1),y:clamp(it.dir.y,-1,1)}:{x:n===1?1:-1,y:0};
   p.intent={type:it.type,target:pt(it.target),buffer:clamp(fin(it.buffer),0,10),band:Math.floor(clamp(fin(it.band),0,4)),tick:fin(it.tick),until:fin(it.until),primed:!!it.primed,blindSpot:!!it.blindSpot,...(it.ghost?{ghost:true}:{}),dir,
    ...(typeof it.reaction==="string"?{reaction:it.reaction.slice(0,40),reactionPasser:idOf(it.reactionPasser)}:{})};}
  else if("intent" in p)p.intent=null;
  if(p.runRest!=null)p.runRest=fin(p.runRest);
  if(p.beaten!=null){const b=p.beaten;if(b&&Number.isFinite(Number(b.until))&&Number.isFinite(Number(b.severity)))p.beaten={until:Math.min(fin(b.until),fin(state.tick)+2),by:idOf(b.by),severity:clamp(fin(b.severity),0,1)};else p.beaten=null;}
  if(p.dribbleSlump!=null){p.dribbleSlump=clamp(fin(p.dribbleSlump),0,3);p.dribbleSlumpTick=fin(p.dribbleSlumpTick);}
  if(p.lastDribble!=null)p.lastDribble=p.lastDribble&&Number.isFinite(Number(p.lastDribble.tick))?{tick:fin(p.lastDribble.tick),beaten:p.lastDribble.beaten==null?null:idOf(p.lastDribble.beaten),sharp:!!p.lastDribble.sharp}:null;
  if(p.lastMove)p.lastMove=Number.isFinite(p.lastMove.x)&&Number.isFinite(p.lastMove.y)?{x:clamp(p.lastMove.x,-30,30),y:clamp(p.lastMove.y,-30,30)}:undefined;if(!p.lastMove)delete p.lastMove;
  const st=p.battleSimState;if(!st||typeof st!=="object"){delete p.battleSimState;return;}
  // Only fields that were saved are restored (absent fields stay absent, so a restored match is identical).
  const r=battleSimRuntimeState(p);
  if("memory" in st)r.memory=Array.isArray(st.memory)?st.memory.filter(m=>m&&["run","lane","shot","line"].includes(m.kind)).slice(-6).map(m=>({kind:m.kind,key:String(m.key).slice(0,12),count:Math.floor(clamp(fin(m.count,1),1,3)),tick:fin(m.tick),by:m.by==null?null:idOf(m.by)})):[];
  if("uses" in st)r.uses=Object.fromEntries(Object.entries(st.uses&&typeof st.uses==="object"?st.uses:{}).slice(0,12).map(([k,u])=>[String(k).slice(0,40),{attempts:Math.floor(clamp(fin(u&&u.attempts),0,99)),goals:Math.floor(clamp(fin(u&&u.goals),0,99))}]));
  if("recentLines" in st)r.recentLines=Array.isArray(st.recentLines)?st.recentLines.filter(l=>typeof l==="string").slice(-6):[];
  if("lastLineTick" in st)r.lastLineTick=fin(st.lastLineTick,-99);
  if("chips" in st)r.chips=Object.fromEntries(Object.entries(st.chips&&typeof st.chips==="object"?st.chips:{}).slice(0,24).map(([k,v])=>[String(k).slice(0,40),fin(v,-99)]));
 }));
 if(state.chain!=null){state.chain=Math.floor(clamp(fin(state.chain),0,999));state.chainTeam=[1,2].includes(state.chainTeam)?state.chainTeam:null;}
 if(state.reactionCooldowns!=null)state.reactionCooldowns=Object.fromEntries(Object.entries(state.reactionCooldowns&&typeof state.reactionCooldowns==="object"?state.reactionCooldowns:{}).slice(0,24).map(([k,v])=>[String(k).slice(0,40),fin(v)]));
 const r=state.lastReception;if(r!=null)state.lastReception=r&&pt(r.from)&&pt(r.to)&&[1,2].includes(r.teamNumber)?{playerId:idOf(r.playerId),teamNumber:r.teamNumber,passerId:idOf(r.passerId),tick:fin(r.tick),kind:r.kind==="long"?"long":"short",through:!!r.through,...(r.style==="cross"||r.style==="cutback"?{style:r.style}:{}),from:pt(r.from),to:pt(r.to)}:null;
}
// v0.8.8.3 participation state. Older saves have no matchStatus, so it is
// rebuilt from the append-only substitution events; current saves are validated.
function restoreMatchParticipation(team,number,events){
 const assigned=new Set(Object.values(team.assignment).map(idOf));
 const statuses=team.roster.map(p=>p.matchStatus);
 if(statuses.every(s=>MATCH_STATUSES.includes(s))){
  if(team.roster.some(p=>assigned.has(idOf(p.id))&&["subbed-off","reserve"].includes(p.matchStatus)&&!p.sentOff))return false;
  team.roster.forEach(p=>{if(p.sentOff)p.matchStatus="sent-off";});
  if(!Array.isArray(team.substitutions))team.substitutions=[];
  team.substitutions=team.substitutions.filter(s=>s&&playerIn(team,s.on)&&playerIn(team,s.off)).map(s=>({slot:String(s.slot),on:idOf(s.on),off:idOf(s.off),tick:Number(s.tick)||0,timeSeconds:Number(s.timeSeconds)||0}));
  return true;
 }
 const status=new Map(team.roster.map(p=>[idOf(p.id),assigned.has(idOf(p.id))?"starter":"reserve"])),log=[];
 (events||[]).filter(e=>e&&e.type==="substitution"&&Number(e.teamNumber)===number&&Array.isArray(e.actors)&&e.actors.length>=2).forEach(e=>{
  const on=idOf(e.actors[0].id),off=idOf(e.actors[1].id);if(!status.has(on)||!status.has(off))return;
  status.set(on,"subbed-on");status.set(off,"subbed-off");log.push({slot:"",on,off,tick:Number(e.tick)||0,timeSeconds:Number(e.timeSeconds)||0});
 });
 team.roster.forEach(p=>{let s=status.get(idOf(p.id));
  // A legacy bug could bring a substituted player back; keep the live lineup intact.
  if(assigned.has(idOf(p.id))&&s==="subbed-off")s="subbed-on";
  if(p.sentOff)s="sent-off";p.matchStatus=s;});
 team.substitutions=log;return true;
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
 ring.style.setProperty("--stamina",stamina+"%");ring.style.setProperty("--stamina-hue",String(Math.round(stamina*1.2)));ring.style.setProperty("--portrait-size",px+"px");ring.classList.toggle("is-flowing",isFlowing(p));
 const img=make("img","bs-stamina-portrait");img.src=portraitSource(p);img.alt=p.name||"Player";img.width=px;img.height=px;img.loading="lazy";
 img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;};put(ring,img);put(parent,ring);return ring;
}
/* Spatial engine: the old 18 zone IDs are retained ONLY to migrate v0.8.1 saves.
   All live decisions use physical metre distances on a continuous 105m x 68m pitch. */
const PITCH_LENGTH=105,PITCH_WIDTH=68,RECEIVE_PRESSURE_M=10,TACKLE_RADIUS_M=8;
const VIRTUAL_PITCH={width:1050,height:680}; // physics-only pixel plane, never rendered
const LONG_PASS_MIN_M=PITCH_WIDTH*2/3; // minimum ~45.3 metres (2/3 virtual pitch height)
const SHORT_PASS_MAX_M=36;
function virtualPoint(p){const v=point(p);return{x:v.x*VIRTUAL_PITCH.width/100,y:v.y*VIRTUAL_PITCH.height/100};}
function renderPoint(p){const v=virtualPoint(p);return{x:100*v.x/VIRTUAL_PITCH.width,y:100*v.y/VIRTUAL_PITCH.height};}
function passingChemistry(a,b){
 const rel=typeof chemistryRelation==="function"?chemistryRelation(a,b):null;
 return rel&&Number.isFinite(rel.score)?clamp(rel.score,0,100):65;
}
function chemistryPassColor(score){
 return score>=95?"#53f6d1":score>=90?"#57a7ff":score>=82?"#54e78a":score>=70?"#a6dcff":score>=65?"#e7f2f5":"#ff6a7f";
}

function legacyPoint(zone){const z=ZONES[zone]||ZONES[7];return{x:8+z.y*16.8,y:17+z.x*33};}
function point(value){if(value&&typeof value==="object"&&Number.isFinite(value.x)&&Number.isFinite(value.y))return{x:value.x,y:value.y};if(value&&typeof value==="object"&&Number.isFinite(value.zone))return legacyPoint(value.zone);if(Number.isInteger(value)&&ZONES[value])return legacyPoint(value);return{x:50,y:50};}
// Hot path: plain coordinate objects skip point() allocation; same metre conversion.
function distance(a,b){
 let ax=a&&a.x,ay=a&&a.y,bx=b&&b.x,by=b&&b.y;
 // x-x===0 is true only for finite numbers; anything else takes the general point() path.
 if(!(ax-ax===0&&ay-ay===0)){const p=point(a);ax=p.x;ay=p.y;}
 if(!(bx-bx===0&&by-by===0)){const q=point(b);bx=q.x;by=q.y;}
 const dx=(ax-bx)*PITCH_LENGTH/100,dy=(ay-by)*PITCH_WIDTH/100;return Math.sqrt(dx*dx+dy*dy);
}
// Legacy zones are a regular 6x3 grid of centres, so the nearest centre is found per axis.
function zoneAt(pos){const a=point(pos);return GRID[clamp(Math.round((a.x-8)/16.8),0,5)][clamp(Math.round((a.y-17)/33),0,2)];}
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
function offBallOrder(state){const carrier=state.teams[state.possession]&&playerIn(state.teams[state.possession],state.carrierId);return[...active(state.teams[1]),...active(state.teams[2])].filter(p=>!carrier||p.id!==carrier.id||p.teamNumber!==carrier.teamNumber).map(p=>({p,spd:effective(p,"spd"),id:idOf(p.id)})).sort((a,b)=>b.spd-a.spd||a.p.teamNumber-b.p.teamNumber||a.id.localeCompare(b.id)).map(x=>x.p);}
function movementMeters(p){return clamp(.75+effective(p,"spd")*.051,1.25,6.1);}
function receiverPressure(state,number,where){return opposing(state,number).filter(p=>p.role!=="GK"&&distance(p,where)<=RECEIVE_PRESSURE_M).length;}
// Goalkeeper positioning: on the line between the goal centre and the ball (covering both posts), a few
// metres off the line as the ball approaches, and further out as a sweeper when play is far away.
function keeperTarget(state,p){const ball=point(state.ball),home=ownGoal(p.teamNumber),dx=(ball.x-home.x)*XM,dy=(ball.y-home.y)*YM,dist=Math.hypot(dx,dy)||1;
 const depth=dist>45?clamp(dist*.15,4,10):clamp(1.4+dist*.08,1.4,4.2);
 return{x:home.x+dx/dist*depth/XM,y:clamp(home.y+dy/dist*depth/YM,28,72)};}
function active(team){const ids=new Set(Object.values(team.assignment).map(idOf));return team.roster.filter(p=>ids.has(idOf(p.id))&&!p.sentOff);}
// Match participation is persistent per player: starter, reserve (never entered),
// subbed-on, subbed-off or sent-off. Only unused reserves may ever enter the pitch.
const MATCH_STATUSES=["starter","reserve","subbed-on","subbed-off","sent-off"];
function substitutionEligible(team,p){const ids=new Set(Object.values(team.assignment).map(idOf));return !!p&&!ids.has(idOf(p.id))&&!p.sentOff&&p.matchStatus!=="subbed-off"&&p.matchStatus!=="sent-off";}
function bench(team){return team.roster.filter(p=>substitutionEligible(team,p));}
function keeper(team){const list=active(team);return list.find(p=>p.role==="GK")||list.slice().sort((a,b)=>b.stats.gk-a.stats.gk)[0]||null;}
function runtimeTeam(config,number){
 const team={number,name:config.name,color:config.color,roster:config.roster.map((raw,i)=>{
  const p=cleanPlayer(raw,i);return Object.assign(p,{teamNumber:number,stamina:100,flow:0,flowFullTicks:0,movementProgress:0,
   x:number===1?8:92,y:50,homeX:number===1?8:92,homeY:50,zone:slotZone(number,{x:50,y:90}),
   role:p.primaryPosition,yellows:0,sentOff:false,match:{goals:0,assists:0,shots:0,onTarget:0,passes:0,passesAttempted:0,dribbles:0,dribblesAttempted:0,tackles:0,interceptions:0,fouls:0,saves:0,yellows:0,redCards:0,points:0,rating:6}});
 }),formation:config.formation,slots:config.slots.map(q=>({...q})),assignment:{...config.assignment},strategy:{...config.strategy},
 stats:{poss:0,shots:0,onTarget:0,passes:0,attempted:0,tackles:0,interceptions:0,fouls:0,corners:0,saves:0,turnovers:0,goals:0,yellowCards:0,redCards:0}};
 team.substitutions=[];
 Object.keys(team.assignment).forEach(k=>{const p=playerIn(team,team.assignment[k]),slot=team.slots[Number(k)];if(!p||!slot)return;p.role=slot.label;p.matchStatus="starter";const home=slot.label==="GK"?ownGoal(number):formationStart(number,slot);p.homeX=home.x;p.homeY=home.y;setPosition(p,home);});
 team.roster.filter(p=>!Object.values(team.assignment).map(idOf).includes(idOf(p.id))).forEach(p=>{p.role="BENCH";p.matchStatus="reserve";setPosition(p,ownGoal(number));});
 const g=keeper(team);if(g){g.role="GK";const home=ownGoal(number);g.homeX=home.x;g.homeY=home.y;setPosition(g,home);}
 return team;
}
function playerIn(team,id){return team.roster.find(p=>idOf(p.id)===idOf(id))||null;}
const FLOW_STAT_MULTIPLIER=1.085;
// Blue Lock Man (both instances) never enters Flow.
/* ---------- Beaten-defender recovery ----------
   A defender who genuinely engaged a dribbler and lost needs a moment to turn and accelerate again.
   Stored on the defender ({until,by,severity}); only that one defender is affected, the delay lasts one
   action (two for a decisive dribble against a slow reader), never stacks beyond its cap, and strong
   readers, quick players and recovery abilities shorten it. While it lasts he moves slower, reacts later
   to balls played past him and can barely tackle the player who beat him. Saved with the match. */
// 0..1: how close to top speed he already is (metres covered last tick, in a straight line).
// A diagonal shooting zone: a distance band and an angle band from the goal centre line (either side).
function inFinishZone(n,at,zone){const goal=targetGoal(n),dx=Math.abs(goal.x-at.x)*XM,dy=Math.abs(goal.y-at.y)*YM,m=Math.hypot(dx,dy),deg=Math.atan2(dy,dx)*180/Math.PI,[m0,m1]=kitParam(zone,"metres",[15,23]),[a0,a1]=kitParam(zone,"angle",[30,58]);return m>=m0&&m<=m1&&deg>=a0&&deg<=a1;}
function sprintMomentum(p){const m=p&&p.lastMove;return m?clamp((Math.hypot(Number(m.x)||0,Number(m.y)||0)-2.5)/3,0,1):0;}
function markBeaten(state,def,carrier,model,sharp){
 const recover=kitAbility(def,"quick-recovery"),read=battleAwareness(def).defensiveRead;
 const recovery=clamp((effective(def,"def",state)*.45+effective(def,"spd",state)*.55-68)/30,0,1)+(recover?kitParamP(def,recover,"recovery",.3):0);
 const margin=clamp((Number(model.chance)||.5)-.35,0,.6),severity=clamp(.55+margin*.6+(Number(model.hesitation)||0)*1.5+(sharp?.1:0)-recovery*.45-(read-.75)*.4,.2,1);
 const until=Number(state.tick)+(severity>=.8?2:1),current=def.beaten&&Number(def.beaten.until)>=Number(state.tick)?def.beaten:null;
 def.beaten={until:Math.min(Number(state.tick)+2,Math.max(until,current?Number(current.until):0)),by:idOf(carrier.id),severity:Math.max(severity,current?Number(current.severity)||0:0)};
 state.beatenCount=(Number(state.beatenCount)||0)+1;
}
// 0 when the defender is not recovering. Against the player who beat him the full effect applies;
// his general movement and reactions are affected at the same severity until the delay ends.
function beatenSeverity(state,p,against){
 const b=p&&p.beaten;if(!b||!(Number(b.until)>=Number(state.tick)))return 0;
 if(against&&idOf(against.id)!==String(b.by))return 0;
 return clamp(Number(b.severity)||0,0,1);
}
// Blue Lock Man: stamina fixed at 100, no Flow charge, activation or bonuses (also enforced on load).
function enforceBlueLockMan(p){if(!isBlueLockMan(p))return;p.stamina=100;p.flow=0;p.flowFullTicks=0;p.flowActivationPending=false;}
function isFlowing(p){return !!p&&!isBlueLockMan(p)&&Number(p.flow)>=100;}
function hasBall(p,state=match){
 const team=state&&state.teams&&state.teams[p.teamNumber];
 return !!team&&Number(state.possession)===Number(p.teamNumber)&&idOf(state.carrierId)===idOf(p.id);
}
function battleSimPassiveMultiplier(p,k,state=match){
 if(!p||!p.battleSim||!state||!state.teams)return 1;
 let multiplier=1;
 (Array.isArray(p.battleSim.passives)?p.battleSim.passives:[]).forEach(passive=>{
  if(passive&&passive.condition==="off-ball"&&!hasBall(p,state)){
   const bonus=Number(passive.statBonuses&&passive.statBonuses[k]);
   if(Number.isFinite(bonus)&&bonus>0)multiplier*=1+bonus;
  }
 });
 return multiplier;
}
function effective(p,k,state=match){
 const flowing=isFlowing(p);
 const staminaMultiplier=flowing?1:(.7+.3*clamp(p.stamina,0,100)/100);
 const flowMultiplier=flowing?FLOW_STAT_MULTIPLIER:1;
 return(Number(p.stats[k])||1)*staminaMultiplier*flowMultiplier*battleSimPassiveMultiplier(p,k,state);
}
function isagi(p){return !!p&&(idOf(p.id)==="1"||p.name==="Yoichi Isagi")&&!!p.battleSim;}
function battleSimRuntimeState(p){
 if(!p.battleSimState||typeof p.battleSimState!=="object")p.battleSimState={cooldowns:{},usedUltimates:[]};
 if(!p.battleSimState.cooldowns||typeof p.battleSimState.cooldowns!=="object")p.battleSimState.cooldowns={};
 if(!Array.isArray(p.battleSimState.usedUltimates))p.battleSimState.usedUltimates=[];
 return p.battleSimState;
}
function battleSimNearbyDefenders(state,p,where,range=RECEIVE_PRESSURE_M){
 return opposing(state,p.teamNumber).filter(d=>d.role!=="GK"&&distance(d,where)<=range).length;
}
function activateBattleSimSpecial(state,p,trigger){
 const abilities=p&&p.battleSim&&Array.isArray(p.battleSim.specials)?p.battleSim.specials:[];
 for(const ability of abilities){
  if(!ability||ability.effect||ability.trigger!==trigger)continue;
  const runtime=battleSimRuntimeState(p),id=idOf(ability.id);
  if(Number(runtime.cooldowns[id]||0)>Number(state.tick||0))continue;
  runtime.cooldowns[id]=Number(state.tick||0)+Math.max(0,Number(ability.cooldownTicks)||0);
  return ability;
 }
 return null;
}
function hasJustReceivedPass(state,p){
 const passerId=state&&state.lastPasser;
 if(passerId==null||idOf(passerId)===idOf(p.id))return false;
 const team=state.teams&&state.teams[p.teamNumber];
 return !!team&&!!playerIn(team,passerId);
}
function activateBattleSimUltimate(state,p){
 const abilities=p&&p.battleSim&&Array.isArray(p.battleSim.ultimates)?p.battleSim.ultimates:[];
 const runtime=battleSimRuntimeState(p);
 for(const ability of abilities){
  if(!ability||ability.effect)continue;
  const id=idOf(ability.id),condition=ability.condition||{};
  if(ability.oncePerFlow&&runtime.usedUltimates.includes(id))continue;
  if(condition.duringFlow&&!isFlowing(p))continue;
  if(condition.receivedPass&&!hasJustReceivedPass(state,p))continue;
  if(ability.oncePerFlow)runtime.usedUltimates.push(id);
  return ability;
 }
 return null;
}
function battleSimAbilityDialogue(p,ability){
 return ability&&ability.dialogue?[{playerId:idOf(p.id),text:p.name+": "+String.fromCharCode(34)+String(ability.dialogue)+String.fromCharCode(34)}]:[];
}
function addPoints(p,n){if(p&&p.match){p.match.points+=n;if(n>0&&!isBlueLockMan(p)){const before=clamp(Number.isFinite(Number(p.flow))?Number(p.flow):0,0,100);if(before<100){p.flow=clamp(before+Math.max(2,n*38),0,100);if(p.flow>=100){p.flowFullTicks=0;p.flowActivationPending=true;const runtime=battleSimRuntimeState(p);runtime.usedUltimates=[];runtime.flowActivationCount=(Number(runtime.flowActivationCount)||0)+1;}}}}}
function drain(p,success,action){if(isBlueLockMan(p)){p.stamina=100;return;}if(isFlowing(p))return;const durable=kitAbility(p,"durable"),scale=durable?kitParam(durable,"drain",.75):1,amount=scale*(action==="shot"?3:action==="dribble"?3.3:action==="pass"?2.2:2);p.stamina=clamp(p.stamina-(success?amount:amount*.48),0,100);}
function playerWeaponsText(player){
 const weapons=Array.isArray(player&&player.weapons)?player.weapons:[];
 if(!weapons.length)return "WEAPONS\nNone registered";
 return "WEAPONS\n"+weapons.map(w=>typeof w==="string"?w:(String(w.name||w.id||"Weapon")+(w.description?" — "+String(w.description):""))).join("\n");
}
function basicActionDialogue(type,actors){
 const lines={pass:["Here you go!","Got it!"],"set-piece":["Here you go!","Got it!"],
  dribble:["I’m getting past you!","Not so fast!"],carry:["Keep moving!"],"shot-attempt":["I’m taking the shot!"],
  goal:["That’s the finish!","Great pass!"],save:["I should have done better.","Not past me!"],
  interception:["I should have seen that.","Read it perfectly!"],turnover:["I lost it!","Won it back!"],
  rebound:["Loose ball!"],foul:["I had to stop you!","Referee!"],"yellow-card":["I’ll be more careful."],
  "red-card":["I have to leave the pitch."],substitution:["I’m ready to play!","Good luck out there!"],
  "flow-activation":["I’m in the zone!"],corner:["So close!"],"goal-kick":["That one’s gone wide."],
  kickoff:["Let’s get started!"],play:["Keep moving!"],offside:["I was level!","Hold your run!"],"throw-in":["Too heavy!","Our throw!"]};
 const phrases=lines[type]||["Keep moving!"];
 return(actors||[]).filter(Boolean).slice(0,3).map((p,i)=>({playerId:idOf(p.id),text:p.name+": "+String.fromCharCode(34)+phrases[Math.min(i,phrases.length-1)]+String.fromCharCode(34)}));
}
function addEvent(state,options){const type=options.type||"play",actionTypes=new Set(["pass","dribble","shot-attempt"]),important=new Set(["kickoff","goal","half-time","full-time","foul","offside","yellow-card","red-card","set-piece","substitution","flow-activation","pass","dribble","shot-attempt"]);let notable=!!options.notable||actionTypes.has(type);if(notable){const now=Number(state.timeSeconds)||0;if(!important.has(type)&&Number.isFinite(state.nextNotableAt)&&now<state.nextNotableAt)notable=false;else state.nextNotableAt=now+600+Math.floor((typeof state.random==="function"?state.random():Math.random())*1201);}const event={id:state.events.length+1,tick:state.tick,timeSeconds:state.timeSeconds,time:timeLabel(state.timeSeconds),type:type,description:String(options.description||"Play continues."),teamNumber:options.teamNumber||null,possessionTeamNumber:state.possession||null,zone:options.zone==null?state.ballZone:options.zone,notable:notable,actors:(options.actors||[]).filter(Boolean).map(p=>({id:idOf(p.id),name:p.name,image:p.image||"",teamNumber:p.teamNumber||null,flow:clamp(Number.isFinite(Number(p.flow))?Number(p.flow):0,0,100)})),comparison:options.comparison?Object.assign({},options.comparison):null,probability:options.probability==null?null:clamp(Number(options.probability),0,1),probabilityLabel:options.probabilityLabel||"SUCCESS CHANCE",dialogue:((options.dialogue&&options.dialogue.length)?options.dialogue:basicActionDialogue(type,options.actors||[])).map(d=>d.key?{playerId:idOf(d.playerId),text:String(d.text||""),key:String(d.key)}:{playerId:idOf(d.playerId),text:String(d.text||"")})};if(options.passRoute){
  const r=options.passRoute;
  event.passRoute={kind:r.kind==="long"?"long":"short",from:point(r.from),to:point(r.to),chemistry:clamp(Number(r.chemistry)||65,0,100)};
 }
 if(options.shotRoute){const r=options.shotRoute;event.shotRoute={from:point(r.from),to:point(r.to)};}
 if(options.runRoute){const r=options.runRoute;event.runRoute={from:point(r.from),to:point(r.to)};}
 // Character ability and chemical-reaction labels shown on the event card (never the outcome).
 for(const k of ["ability","abilityNote","reaction"])if(options[k]&&options[k].id)event[k]={id:String(options[k].id),label:String(options[k].label||options[k].id).slice(0,40),...(options[k].kind?{kind:String(options[k].kind)}:{})};
 if(Array.isArray(options.nearbyDefenders)&&options.nearbyDefenders.length){
  event.nearbyDefenders=options.nearbyDefenders.map(d=>({id:idOf(d.id),name:String(d.name||"Defender"),
   def:clamp(Number(d.def)||0,0,100),distance:Math.max(0,Number(d.distance)||0),selected:!!d.selected}));
 }
 if(options.presentationOnly)event.presentationOnly=true;if(!fastForwarding)event.presentation=capturePresentation(state);state.events.push(event);return event;}

function stagePendingSetPiece(state){
 const pending=state?.pending;
 if(!pending||!["free-kick","corner","penalty","goal-kick"].includes(pending.type))return;
 const taker=setPieceTaker(state,pending);if(!taker)return;
 arrangeSetPiece(state,pending,taker);pending.staged=true;
 // Update only the stoppage event's presentation. No unrevealed future action
 // is simulated or shown by choosing a taker/routine.
 if(!fastForwarding&&state.events.length)state.events[state.events.length-1].presentation=capturePresentation(state);
}
function pause(state,reason){
 state.status="paused";state.stoppage=reason||"PLAY PAUSED";
 stagePendingSetPiece(state);
}

function dialogue(state,p,kind,good){
 // Data-driven character lines (localized by key) take precedence over the generic set.
 // Kit-driven lines for every character with a kit (localized by key); generic lines otherwise.
 const key=kind==="dribble"&&!good?"dribbleFail":kind==="shot"&&!good?"miss":kind==="shot"&&good?"goal":kind;
 if(p.battleSim&&p.battleSim.dialogue&&Array.isArray(p.battleSim.dialogue[key])){const line=kitLine(state,p,key,true);if(line)return line;}
 const lines={pass:good?["Here!","One touch!","Play it forward!"]:["Too slow!","I should have seen that!"],receive:good?["Got it!","I’m on it!","Keep moving!"]:["That was difficult to reach!"],dribble:good?["There’s the gap!","Past you!","Can’t catch me!"]:["They closed the lane!","I lost control!"],shot:good?["It’s in!","Yes!","What a finish!"]:["Not enough!","I need to do better!"],"shot-attempt":good?["I’m taking this!","Let’s test the keeper!","Here comes the shot!"]:["I need a better opening!"],flow:good?["I’m in the zone!","This is my moment!","Nothing can stop me now!"]:["I need to find my rhythm!"],defend:good?["Won it back!","Read that!","Not today!"]:["They got away!"],save:good?["I’ve got it!","Safe hands!","Not past me!"]:["Rebound!"]};
 return{playerId:p.id,text:p.name+": "+String.fromCharCode(34)+randomPick(lines[kind]||lines.pass,state.random)+String.fromCharCode(34)};
}
function opposing(state,number){return active(state.teams[number===1?2:1]);}
function defenderNear(state,number,where){const list=opposing(state,number).filter(p=>p.role!=="GK");list.sort((a,b)=>(distance(a,where)*1.7-effective(a,"def")*.13-effective(a,"spd")*.05)-(distance(b,where)*1.7-effective(b,"def")*.13-effective(b,"spd")*.05));return list[0]||keeper(state.teams[number===1?2:1]);}
function defenderFeedDetails(defenders,locations,selected){
 return defenders.map(p=>({id:idOf(p.id),name:p.name,def:Math.round(effective(p,"def")),
  distance:Math.round(Math.min(...locations.map(where=>distance(p,where)))*10)/10,
  selected:!!selected&&idOf(p.id)===idOf(selected.id)})).sort((a,b)=>a.distance-b.distance||a.name.localeCompare(b.name));
}
/* v0.8.8.4 tactical football model. Positions, lanes and decisions are measured in real
   metres on the shared 105m x 68m virtual pitch; nothing here is presentation-only. */
const XM=PITCH_LENGTH/100,YM=PITCH_WIDTH/100;
function aheadM(number,where){return progress(number,where)*PITCH_LENGTH;}
function pitchAt(number,metres,y){const x=clamp(metres,0,PITCH_LENGTH)/XM;return{x:clamp(number===1?x:100-x,2,98),y:clamp(y,5,95)};}
function shiftM(from,forwardM,lateralM,number){const a=point(from),dir=number===1?1:-1;return{x:clamp(a.x+dir*forwardM/XM,2,98),y:clamp(a.y+lateralM/YM,5,95)};}
function offsetM(from,toward,metres){const a=point(from),b=point(toward),dx=(b.x-a.x)*XM,dy=(b.y-a.y)*YM,d=Math.hypot(dx,dy)||1;return{x:clamp(a.x+dx/d*metres/XM,2,98),y:clamp(a.y+dy/d*metres/YM,5,95)};}
function lerpPoint(a,b,t){const p=point(a),q=point(b);return{x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t};}
// Projection of `where` onto the segment from->to: metres along it and perpendicular distance.
function plainPoint(v){return v&&v.x-v.x===0&&v.y-v.y===0?v:point(v);}
function laneGeometry(from,to,where){const a=plainPoint(from),b=plainPoint(to),q=plainPoint(where),bx=(b.x-a.x)*XM,by=(b.y-a.y)*YM,qx=(q.x-a.x)*XM,qy=(q.y-a.y)*YM,len=Math.max(.001,Math.hypot(bx,by)),along=(qx*bx+qy*by)/len;return{len,along,perp:Math.abs(qx*by-qy*bx)/len};}
function runSpeed(p,state=match){return 4.4+effective(p,"spd",state)*.036;} // metres per second
function roleGroup(role){
 const r=String(role||"").toUpperCase();
 if(r==="GK")return "GK";if(/^(LWB|RWB|WB|LB|RB)$/.test(r))return "FB";if(/CB/.test(r))return "CB";if(/DM/.test(r))return "DM";
 if(/^(LM|RM)$/.test(r))return "WM";if(/AM/.test(r))return "AM";if(/^(LW|RW|LF|RF|LWF|RWF)$/.test(r))return "W";if(/ST|CF|FW|SS|LS|RS/.test(r))return "ST";return "CM";
}
function teamSlotOf(team,p){const k=Object.keys(team.assignment).find(i=>idOf(team.assignment[i])===idOf(p.id)),s=k!=null&&team.slots[Number(k)];return s?{index:Number(k),x:Number(s.x)||50,y:Number(s.y)||50,label:s.label}:{index:99,x:clamp(Number(p.homeY)||50,5,95),y:50,label:p.role};}
function slotDepth(slot){return clamp((74-slot.y)/62,0,1);}
// Second-deepest opponent (keeper included), in the attacking team's metres: the offside line.
function lastLineM(state,number){const line=active(state.teams[number===1?2:1]).map(p=>aheadM(number,p)).sort((a,b)=>b-a);return line.length>1?line[1]:PITCH_LENGTH;}
// Expected attacking value of controlling the ball at a location (both directions).
function threatAt(number,where){const q=point(where),a=progress(number,q),lat=Math.abs(q.y-50)/50;return clamp(.006+Math.exp((a-1)*4.6)*.3*(1-.55*lat*lat),0,.32);}
// What having this player on the ball here is worth: positional threat, or the
// player's own finishing chance from that spot under the shared shot model.
function positionValue(state,p,where,opponents){const n=p.teamNumber,base=threatAt(n,where);if(p.role==="GK"||distance(where,targetGoal(n))>40)return base;return Math.max(base,shotModel(state,p,false,null,null,where,opponents).goalChance*.78);}
function lossCost(number,where){return .015+threatAt(number===1?2:1,where)*.9;}
function nearestOpponentM(state,number,where,opponents){let best=40;(opponents||opposing(state,number)).forEach(o=>{if(o.role!=="GK")best=Math.min(best,distance(o,where));});return best;}
function spaceAhead(state,number,where,opponents){const q=point(where),dir=number===1?1:-1;let best=25;(opponents||opposing(state,number)).forEach(o=>{if(o.role==="GK")return;const fx=(o.x-q.x)*dir*XM,ly=Math.abs(o.y-q.y)*YM;if(fx>-1&&ly<fx*.8+3)best=Math.min(best,Math.hypot(fx,ly));});return best;}

// Formation shape: the team block slides with the ball, compresses out of possession
// and stretches in possession, so every role keeps its own lane and depth.
function shapeTarget(team,p,ctx){
 const slot=teamSlotOf(team,p),group=roleGroup(p.role),depth=slotDepth(slot),s=team.strategy,n=team.number,ball=ctx.ball,ballA=aheadM(n,ball),tempo=(s.tempo-50)/50,direct=(s.directness-50)/50;
 if(ctx.attacking){
  const back=clamp(ballA*.60+5+(s.line-50)*.20,11,66),front=clamp(Math.min(ctx.offside-1,back+54+direct*13+Math.max(0,tempo)*6),back+20,103);
  let d=depth;
  if(group==="FB")d+=ballA>45?.12+(s.width-50)*.0028:.035;
  if(group==="ST")d+=direct*.15+tempo*.075;
  else if(group==="W"||group==="WM")d+=direct*.12+tempo*.045;
  else if(group==="AM")d+=direct*.095+tempo*.035;
  else d+=direct*.035+tempo*.02;
  if(ctx.secondStriker&&idOf(ctx.secondStriker)===idOf(p.id))d-=.075;
  const stretch=.62+s.width*.0076,lane=group==="W"||group==="WM"||group==="FB"?stretch*1.16:group==="CM"||group==="DM"?stretch*.72:stretch*.86;
  // Once the ball is in the opponents' half the forwards live on the last line (onside), wingers just
  // behind it and the attacking midfielder between the lines, instead of trailing the play.
  let along=back+clamp(d,0,1.08)*(front-back);
  if(ballA>=55&&ctx.offside<PITCH_LENGTH){const push=group==="ST"?1.2:group==="W"||group==="WM"?3.5:group==="AM"?8:null;if(push!=null)along=Math.max(along,Math.min(ctx.offside-push,PITCH_LENGTH-6));}
  return pitchAt(n,along,clamp(50+(slot.x-50)*lane+(ball.y-50)*(group==="W"?.055:.13),5,95));
 }
 // Out of possession the block compresses toward the ball side, and deeper still near our own box;
 // after a backward ball the line steps up together (offside trap).
 // With the ball wide and within ~45 m, the line drops towards the box to defend the cross.
 // With the ball central and close (inside ~50 m) the line drops towards the box edge as well, so
 // attackers can occupy the box while onside instead of being held 20 m out.
 const near=clamp((50-ballA)/15,0,1),open=clamp(ballA*.50+8+(s.line-50)*.34+(ctx.stepUp||0),7,58),deep=clamp(ballA*.35+6+(s.line-50)*.1+(ctx.stepUp||0)*.5,9,58);
 const wideThreat=ballA<48&&Math.abs(ball.y-50)*YM>12,back=Math.min(open*(1-near)+deep*near,wideThreat?clamp(10+ballA*.25+(s.line-50)*.08,9,24):99),span=(16+s.pressing*.22)*(ballA<35?.76:1);
 let m=back+depth*span;if(depth<.5)m=Math.min(m,ballA+4);
 const lane=.50+s.width*.0068;
 return pitchAt(n,m,clamp(50+(slot.x-50)*lane+(ball.y-50)*.38,5,95));
}
/* ===== v0.8.9 intelligence and character-ability framework =====
   Awareness: how a player reads the game, derived from his attributes and adjusted by his kit.
   Intents: short plans grounded in pitch geometry (a run into a gap, a wall pass, exploiting
            space a teammate created, tracking a run). Stored on the player, saved with the match,
            re-validated every tick and dropped as soon as the opportunity disappears.
   Abilities: data in each player's battleSim block ({effect, params}); the engine executes them
            through shared effect handlers, so other characters can reuse the same effects later. */
const AWARENESS_CACHE=new WeakMap();
function battleAwareness(p){
 if(!p||!p.stats)return{vision:.6,space:.6,anticipation:0,defensiveRead:.6,scan:36,tendencies:{shoot:1,dribble:0,pass:0,direct:0}};
 let a=AWARENESS_CACHE.get(p);if(a)return flowAware(p,a);
 const s=p.stats,kit=p.battleSim||{},k=kit.awareness||{},t=kit.tendencies||{},num=v=>Number(v)||0;
 const vision=clamp((s.pas*.6+s.off*.4)/100+num(k.vision),0,1.25),space=clamp(s.off/100+num(k.space),0,1.25);
 a={vision,space,anticipation:clamp(num(k.anticipation),0,1),defensiveRead:clamp(s.def/100+num(k.defensiveRead),0,1.25),
  // How far across the pitch he reads runs, gaps and passing options (metres).
  scan:clamp(14+vision*30+num(k.scan),18,60),
  // Character priorities: evaluation weights, never success-rate bonuses.
  tendencies:{shoot:1+clamp((s.sho-(s.pas+s.dri)/2)/100,-.2,.2)+num(t.shoot),dribble:clamp((s.dri-s.pas)/100,-.15,.15)+num(t.dribble),
   pass:clamp((s.pas-s.sho)/100,-.15,.15)+num(t.pass),direct:clamp((s.spd+s.sho-s.pas-s.dri)/200,-.15,.15)+num(t.direct)}};
 AWARENESS_CACHE.set(p,a);return flowAware(p,a);
}
// Flow changes tactical awareness, never physical Speed or stored ratings.
function flowAware(p,base){
 if(!isFlowing(p))return base;
 const flow=kitAbility(p,"flow-state"),extra=flow&&flow.params&&flow.params.awareness;
 if(!extra)return base;
 const add=k=>Number(extra[k])||0;
 return {...base,vision:clamp(base.vision+add("vision"),0,1.25),
  space:clamp(base.space+add("space"),0,1.25),
  anticipation:clamp(base.anticipation+add("anticipation"),0,1),
  scan:clamp(base.scan+add("scan"),18,60)};
}
function kitAbility(p,effect){const kit=p&&p.battleSim;if(!kit)return null;for(const group of ["passives","weapons","ultimates"]){const list=kit[group];if(Array.isArray(list))for(const a of list)if(a&&(a.effect===effect||Array.isArray(a.effects)&&a.effects.includes(effect)))return a;}return null;}
function kitParam(ability,key,fallback){const v=ability&&ability.params&&ability.params[key];return v==null?fallback:v;}
function abilityState(p){const r=battleSimRuntimeState(p);if(!Array.isArray(r.memory))r.memory=[];if(!r.uses||typeof r.uses!=="object")r.uses={};if(!Array.isArray(r.recentLines))r.recentLines=[];return r;}
function abilityBadge(ability,kind){return ability?{id:String(ability.id),label:String(ability.label||ability.name||ability.id).toUpperCase(),kind:kind||"ability"}:null;}
function teammateById(state,p,id){const t=state.teams[p.teamNumber];return t?active(t).find(x=>idOf(x.id)===idOf(id))||null:null;}

/* ---------- Intents ---------- */
// Defenders forming the last line, as lateral positions in metres (attacking team's view).
function backLineYs(state,n,line){return opposing(state,n).filter(o=>o.role!=="GK"&&Math.abs(aheadM(n,o)-line)<7).map(o=>o.y*YM).sort((a,b)=>a-b);}
// A gap in the back line this player can read and attack. Better readers accept narrower gaps
// and scan further across; Metavision predicts the line's shift; Adaptability avoids channels that failed.
function findRunGap(state,team,p,line){
 const n=team.number,aw=battleAwareness(p),meta=kitAbility(p,"space-reading"),ys=backLineYs(state,n,line);
 const edges=[PITCH_LINE_Y*YM+4,...ys,(100-PITCH_LINE_Y)*YM-4],minGap=10-aw.space*3.2,py=p.y*YM,ball=state.ball.y*YM;
 let best=null;
 for(let i=0;i<edges.length-1;i++){
  const a=edges[i],b=edges[i+1],width=b-a;if(width<minGap)continue;
  const mid=clamp((a+b)/2+(meta?(ball-(a+b)/2)*.12:0),edges[i]+2,edges[i+1]-2),lateral=Math.abs(mid-py);
  if(lateral>aw.scan*.55)continue;
  const wideRun=kitAbility(p,"wide-runner");
  let score=Math.min(width,20)*.35+(wideRun?Math.min(1,Math.abs(mid-34)/20)*kitParam(wideRun,"wide",4):(1-Math.abs(mid-34)/34)*4)-lateral*.22-memoryPenalty(state,p,"run",gapBand(mid))*40;
  if(!best||score>best.score)best={y:mid/YM,width,score,band:gapBand(mid)};
 }
 return best;
}
function gapBand(yMetres){return Math.max(0,Math.min(4,Math.floor(yMetres/13.6)));}
function updateIntents(state){
 for(const n of [1,2]){
  const team=state.teams[n],attacking=state.possession===n,carrier=attacking?playerIn(team,state.carrierId):null,players=active(team).filter(p=>p.role!=="GK");
  const line=lastLineM(state,n),keeperAt=Math.max(line,...opposing(state,n).filter(o=>o.role==="GK").map(o=>aheadM(n,o))),depth=keeperAt-line;
  let runners=0;
  players.forEach(p=>{
   const it=p.intent;if(!it)return;
   const expired=state.tick>it.until||!attacking&&it.type!=="track"||attacking&&it.type==="track"||carrier&&idOf(carrier.id)===idOf(p.id)&&it.type!=="hold";
   // A held position is abandoned once the play has gone past it (he follows the attack up to the line).
   if(!expired&&it.type==="hold"&&aheadM(n,state.ball)>aheadM(n,p)+2&&aheadM(n,p)<line-4){p.intent=null;return;}
   let closed=false;
   if(!expired&&it.type==="run"){const target=point(it.target),blocker=opposing(state,n).find(o=>o.role!=="GK"&&distance(o,target)<3.2);
    if(blocker||Math.abs(aheadM(n,target)-(line-it.buffer))>6){closed=blocker?"blocked":"moved";if(blocker)learn(state,p,"run",gapBand(target.y*YM),blocker);}}
   // An unused run is not repeated at once: the runner holds his ground (onside), then rests.
   if(expired||closed){p.intent=null;const hunger=kitAbility(p,"run-hunger");p.runRest=state.tick+(hunger?kitParamP(p,hunger,"rest",2):3);
    if(it.type==="run"&&attacking&&(!carrier||idOf(carrier.id)!==idOf(p.id))){const at=aheadM(n,p)>line-.8?pitchAt(n,line-.8,p.y):point(p);p.intent={type:"hold",target:at,until:state.tick+4,tick:state.tick};}}
   else if(it.type==="run"){runners++;if(distance(p,it.target)<3)it.primed=true;}
  });
  if(!attacking||!carrier)continue;
  const rested=p=>!(Number(p.runRest)>state.tick);
  // Support: a close option for the carrier (a wall-pass partner overlapping from his own role,
  // or a player whose kit makes him offer combinations), then back to his shape when it expires.
  if(aheadM(n,carrier)>=42){const supporters=[];
   for(const r of kitReactions(state,carrier))if(r.def.effect==="wall-pass"&&r.owner===carrier&&reactionReady(state,r.def,r.owner.teamNumber)&&!r.partner.intent&&rested(r.partner)&&distance(r.partner,carrier)>12&&distance(r.partner,carrier)<40)supporters.push(r.partner);
   if(!players.some(m=>m!==carrier&&distance(m,carrier)<12))players.forEach(m=>{if(m!==carrier&&!m.intent&&rested(m)&&kitAbility(m,"support-movement")&&distance(m,carrier)>11&&distance(m,carrier)<30&&!supporters.includes(m))supporters.push(m);});
   supporters.forEach(m=>{const spot=supportSpot(state,n,carrier,m,line);if(spot)m.intent={type:"support",target:spot,buffer:0,band:0,tick:state.tick,until:state.tick+2,primed:false,blindSpot:false,dir:{x:n===1?1:-1,y:0}};});}
  // Runs in behind when there is depth to attack; against a deep block, or when the ball is wide
  // in the final third, runs into the box (between the defenders, onside).
  const wideBall=aheadM(n,state.ball)>=62&&Math.abs(state.ball.y-50)*YM>12;
  // Box occupation: with the ball wide in the final third, forwards attack the near post, the far post
  // and the penalty spot, and a midfielder arrives at the edge of the box for the cut-back (all onside).
  if(wideBall&&PITCH_LENGTH-line<=27){const side=state.ball.y<50?-1:1,spots=[{m:6,y:50+side*7,who:"F"},{m:8,y:50-side*9,who:"F"},{m:11,y:50,who:"F"},{m:14,y:50+side*4,who:"M"}],taken=new Set();
   for(const sp of spots){const where=pitchAt(n,Math.min(PITCH_LENGTH-sp.m,line-.5),sp.y);
    const pick=players.filter(p=>p!==carrier&&!taken.has(p)&&rested(p)&&(!p.intent||p.intent.type==="hold")&&(sp.who==="F"?["ST","W","AM"].includes(roleGroup(p.role))||p.stats.off>=88:["CM","AM","DM"].includes(roleGroup(p.role)))&&distance(p,where)<42)
     .sort((a,b)=>distance(a,where)-distance(b,where)||idOf(a.id).localeCompare(idOf(b.id)))[0];
    if(!pick)continue;taken.add(pick);
    pick.intent={type:sp.who==="F"?"run":"support",target:where,buffer:.5,band:gapBand(where.y*YM),tick:state.tick,until:state.tick+2,primed:distance(pick,where)<3,blindSpot:sp.who==="F"&&!!kitAbility(pick,"blind-spot-run")&&onBlindSide(state,pick,where),dir:{x:n===1?1:-1,y:0}};if(sp.who==="F")runners++;}
  }
  const box=depth<12||wideBall;if(line<PITCH_LENGTH/2-3||aheadM(n,state.ball)<38||box&&aheadM(n,state.ball)<58)continue;
  const candidates=players.filter(p=>rested(p)&&!p.intent&&p.id!==carrier.id&&["ST","W","AM"].includes(roleGroup(p.role))||rested(p)&&!p.intent&&p.id!==carrier.id&&p.stats.off>=88)
   .filter(p=>aheadM(n,p)>=line-(kitAbility(p,"run-timing")?kitParamP(p,kitAbility(p,"run-timing"),"reach",24):16)&&aheadM(n,carrier)<=aheadM(n,p)+4)
   .map(p=>({p,gap:findRunGap(state,team,p,line)})).filter(c=>c.gap).sort((a,b)=>b.gap.score-a.gap.score||idOf(a.p.id).localeCompare(idOf(b.p.id)));
  // A synchronised partner on the ball: the runner sets off on the same beat, already at full speed.
  for(const r of kitReactions(state,carrier)){
   if(!(r.def.effect==="synchronized-through"||kitParam(r.def,"startsRun",false))||r.partner!==carrier||r.owner.intent&&r.owner.intent.type==="run"||!reactionReady(state,r.def,r.owner.teamNumber))continue;
   const c=candidates.find(x=>x.p===r.owner)||(aheadM(n,r.owner)>=line-22?{p:r.owner,gap:findRunGap(state,team,r.owner,line)}:null);if(!c||!c.gap)continue;
   const target=pitchAt(n,line-.6,c.gap.y);c.p.intent={type:"run",target,buffer:.6,band:c.gap.band,tick:state.tick,until:state.tick+3,primed:true,blindSpot:!!kitAbility(c.p,"blind-spot-run")&&onBlindSide(state,c.p,target),dir:{x:n===1?1:-1,y:0}};runners++;
  }
  for(const c of candidates){
   if(c.p.intent)continue;
   if(runners>=2&&!kitAbility(c.p,"decoy-run")&&!kitAbility(c.p,"run-timing"))continue;   // a decoy runner goes anyway, to drag a marker
   const opposition=state.teams[n===1?2:1].strategy,buffer=(.3+(Number(opposition.line)||50)*.018)*clamp(1.3-effective(c.p,"off",state)/150,.25,1)+memoryCount(state,c.p,"line",0)*.4;
   const target=pitchAt(n,line-buffer,box?clamp(c.gap.y,33,67):c.gap.y),blind=!!kitAbility(c.p,"blind-spot-run")&&onBlindSide(state,c.p,target);
   c.p.intent={type:"run",target,buffer,band:c.gap.band,tick:state.tick,until:state.tick+3,primed:distance(c.p,target)<3,blindSpot:blind,dir:{x:n===1?1:-1,y:0}};
   // Ghost Run: an especially well-timed blind-side run (cooldown): he is already moving when it starts.
   const ghost=blind?kitAbility(c.p,"ghost-run"):null;if(ghost&&!(Number(abilityState(c.p).cooldowns["ghost-run"]||0)>state.tick)){c.p.intent.ghost=true;c.p.intent.primed=true;abilityState(c.p).cooldowns["ghost-run"]=state.tick+Math.max(1,Number(kitParamP(c.p,ghost,"cooldownTicks",14)));}
   runners++;
  }
 }
}
// Is a point outside the nearest marker's field of attention (he is watching the ball)?
function onBlindSide(state,p,target){
 const marker=opposing(state,p.teamNumber).filter(o=>o.role!=="GK").sort((a,b)=>distance(a,p)-distance(b,p))[0];
 if(!marker||distance(marker,p)>8)return false;
 const bx=(state.ball.x-marker.x)*XM,by=(state.ball.y-marker.y)*YM,tx=(target.x-marker.x)*XM,ty=(target.y-marker.y)*YM;
 const cos=(bx*tx+by*ty)/((Math.hypot(bx,by)||1)*(Math.hypot(tx,ty)||1));return cos<-.34;   // more than ~110° away from where he looks
}
// Defenders who read a run follow its destination; elite readers are needed to track a blind-side run.
function tracksRun(defender,attacker){
 const run=attacker.intent;if(!run||run.type!=="run")return false;
 const read=battleAwareness(defender).defensiveRead+battleAwareness(defender).anticipation*.3;
 // A decoy run is made to be seen: ordinary readers follow it, which is the point.
 const blind=run.blindSpot?kitAbility(attacker,"blind-spot-run"):null;
 return read>=(run.blindSpot?kitParam(blind,"trackRead",.9)+(run.ghost?.04:0):kitAbility(attacker,"decoy-run")?.6:.74);
}

/* ---------- Adaptability: bounded, match-specific tactical memory ---------- */
function learn(state,p,kind,key,actor){
 const ability=kitAbility(p,"tactical-memory");if(!ability)return;
 const mem=abilityState(p).memory,k=String(key),max=kitParam(ability,"maxEntries",6),cap=kitParam(ability,"maxCount",3);
 let entry=mem.find(m=>m.kind===kind&&m.key===k);
 if(entry){entry.count=Math.min(cap,entry.count+1);entry.tick=Number(state.tick)||0;if(actor)entry.by=idOf(actor.id);}
 else{mem.push({kind,key:k,count:1,tick:Number(state.tick)||0,by:actor?idOf(actor.id):null});if(mem.length>max)mem.sort((a,b)=>a.tick-b.tick).shift();}
}
function memoryCount(state,p,kind,key){
 const ability=kitAbility(p,"tactical-memory");if(!ability)return 0;
 const st=p.battleSimState,mem=st&&Array.isArray(st.memory)?st.memory:[],now=Number(state&&state.tick)||0,decay=kitParam(ability,"decayTicks",90);
 const entry=mem.find(m=>m.kind===kind&&m.key===String(key)&&now-m.tick<=decay);return entry?entry.count:0;
}
function memoryPenalty(state,p,kind,key){const ability=kitAbility(p,"tactical-memory");return ability?memoryCount(state,p,kind,key)*kitParam(ability,"weight",.1):0;}
function laneBucket(from,to){return Math.round(((Math.atan2((to.y-from.y)*YM,(to.x-from.x)*XM)+Math.PI)/(Math.PI*2))*8)%8;}

/* ---------- Finishing techniques (weapons and ultimates) ---------- */
// The ball was received last action and can be struck first-time from this position.
function firstTimeChance(state,p){
 const r=state.lastReception;if(!r||r.playerId!==idOf(p.id)||r.teamNumber!==p.teamNumber||Number(r.tick)!==Number(state.tick)-1)return null;
 const goal=targetGoal(p.teamNumber),ix=(r.to.x-r.from.x)*XM,iy=(r.to.y-r.from.y)*YM,gx=(goal.x-p.x)*XM,gy=(goal.y-p.y)*YM;
 const cos=(ix*gx+iy*gy)/((Math.hypot(ix,iy)||1)*(Math.hypot(gx,gy)||1));
 return cos>-.5?r:null;   // a ball coming straight back at him from the goal side cannot be met cleanly
}
function aimPoints(n,p){const goal=targetGoal(n),far=p.y<50?56:44,near=p.y<50?44:56;return{far:{x:goal.x,y:far},near:{x:goal.x,y:near}};}
// Defender in the line of a strike at this aim, if any (the one a feint or disguise would target).
function lineBlocker(state,p,aim){return opposing(state,p.teamNumber).filter(d=>d.role!=="GK").map(d=>({d,g:laneGeometry(p,aim,d)})).filter(x=>x.g.along>.5&&x.g.along<9&&x.g.perp<2.2).sort((a,b)=>a.g.along-b.g.along)[0]?.d||null;}
// Opportunity metrics for benchmarking (no-op unless a harness installs globalThis.__bsOpportunity).
// Each key counts once per player per tick, so repeated evaluations of the same moment are not inflated.
function opportunity(state,p,key){const m=typeof globalThis!=="undefined"?globalThis.__bsOpportunity:null;if(!m)return;
 const tag=key+"@"+(p?idOf(p.id):"-")+"@"+state.tick;if(m.__seen===tag||m.__seenSet&&m.__seenSet.has(tag))return;if(!m.__seenSet)m.__seenSet=new Set();if(m.__seenSet.size>5000)m.__seenSet.clear();m.__seenSet.add(tag);m[key]=(m[key]||0)+1;}
function shotTechniques(state,p){
 const n=p.teamNumber,aims=aimPoints(n,p),list=[{id:"conventional",aim:null,logit:0}],first=firstTimeChance(state,p);
 const metres=distance(p,targetGoal(n)),runtime=abilityState(p),ready=a=>!(Number(runtime.cooldowns[a.id]||0)>Number(state.tick)),rivals=opposing(state,n).filter(d=>d.role!=="GK");
 // Any player: a cross met first-time inside the box is a header or volley, not a controlled shot.
 if(first&&first.style==="cross"&&metres<=16)list.push({id:"header",aim:null,logit:-.25,blockFactor:.6});
 // Any player: a pass met first-time inside 18 m denies the nearest defender time to close or block.
 if(first&&first.style!=="cross"&&metres<=18&&!kitAbility(p,"first-time-finish"))list.push({id:"first-time",aim:null,logit:-.05,pressureRelief:1.5,blockFactor:.85});
 const direct=kitAbility(p,"first-time-finish");
 if(direct&&first&&metres<=kitParam(direct,"maxMetres",24)){
  const passer=teammateById(state,p,first.passerId),quality=passer?(effective(passer,"pas",state)-80)/100:0;
  list.push({id:"direct-shot",ability:direct,aim:aims.far,aimSide:"far",logit:kitParam(direct,"technique",.25)+quality*.6,pressureRelief:kitParam(direct,"pressureRelief",2.5),blockFactor:kitParam(direct,"blockFactor",.7)});
  const weak=kitAbility(p,"weak-foot-finish");
  if(weak&&!kitParam(weak,"anyShot",false))list.push({id:"left-footed-direct-shot",ability:weak,aim:aims.near,aimSide:"near",logit:kitParam(direct,"technique",.25)+kitParam(weak,"technique",-.12)+quality*.6,pressureRelief:kitParam(direct,"pressureRelief",2.5),blockFactor:kitParam(direct,"blockFactor",.7)});
 }
 // Two-footed players: the other foot to the near post on any shot (Noa without a weaker foot).
 const amb=kitAbility(p,"ambidextrous"),wf=kitAbility(p,"weak-foot-finish"),other=amb||(wf&&kitParam(wf,"anyShot",false)?wf:null);
 if(other&&metres<=kitParam(other,"maxMetres",28))list.push({id:other.id,ability:other,aim:aims.near,aimSide:"near",logit:kitParam(other,"technique",0)+(first?kitParam(other,"firstTime",0):0),blockFactor:1});
 // Composed finish after a settled reception (Kira): placement, not power.
 const ace=kitAbility(p,"controlled-finish"),r=state.lastReception;
 if(ace&&r&&r.playerId===idOf(p.id)&&r.teamNumber===n&&Number(r.tick)>=Number(state.tick)-1&&metres<=kitParamP(p,ace,"maxMetres",16)&&!rivals.some(d=>distance(d,p)<2))
  list.push({id:ace.id,ability:ace,aim:aims.far,aimSide:"far",logit:kitParamP(p,ace,"technique",.12),blockFactor:.85});
 // Two-Footed Execution: a defender committed to one side is beaten by finishing with the other foot.
 const sw=kitAbility(p,"switch-foot-finish");
 if(sw&&metres<=kitParamP(p,sw,"maxMetres",24)){const commit=rivals.filter(d=>distance(d,p)<kitParamP(p,sw,"commitRange",4)).sort((a,b)=>distance(a,p)-distance(b,p))[0];
  if(commit){const far=lineBlocker(state,p,aims.far)===commit,near=lineBlocker(state,p,aims.near)===commit;
   if(far||near)list.push({id:sw.id,ability:sw,aim:far?aims.near:aims.far,aimSide:far?"near":"far",logit:kitParamP(p,sw,"technique",.06),ignoreId:idOf(commit.id),blockFactor:1});}}
 // Bee Shot: finishing straight out of a dribble that beat a defender.
 // Golden-zone finish: a diagonal strike from his preferred distance and angle, curled to the far post.
 const zoneKit=kitAbility(p,"zone-finish");
 if(zoneKit&&inFinishZone(n,p,zoneKit))list.push({id:zoneKit.id,ability:zoneKit,aim:aims.far,aimSide:"far",logit:kitParamP(p,zoneKit,"technique",.3),pressureRelief:.5,blockFactor:1});
 // Acrobatic finish: an outfield player with this kit can meet a cross or a dropping ball in the air.
 const acro=p.role!=="GK"?kitAbility(p,"acrobatic-finish"):null;
 if(acro&&first&&first.style==="cross"&&metres<=kitParam(acro,"maxMetres",12))list.push({id:acro.id,ability:acro,aim:aims.far,aimSide:"far",logit:kitParamP(p,acro,"technique",.15),pressureRelief:1.5,blockFactor:.9});
 const bee=kitAbility(p,"post-dribble-finish"),ld=p.lastDribble;
 if(bee&&ld&&Number(ld.tick)===Number(state.tick)-1&&metres<=kitParamP(p,bee,"maxMetres",22)&&ready(bee))
  list.push({id:bee.id,ability:bee,aim:aims.far,aimSide:"far",logit:kitParamP(p,bee,"technique",.1),ignoreId:ld.beaten||null,pressureRelief:1,blockFactor:.9,cooldown:kitParam(bee,"cooldownTicks",10)});
 // Power Shot: a properly struck shot from range is harder to hold; it is not more accurate.
 const pw=kitAbility(p,"power-shot");
 if(pw&&metres>=kitParam(pw,"minMetres",16)&&metres<=kitParamP(p,pw,"maxMetres",32))
  list.push({id:pw.id,ability:pw,aim:null,logit:kitParamP(p,pw,"technique",.3)*clamp((metres-12)/12,0,1),blockFactor:1.1,parry:kitParam(pw,"parry",.12)});
 // Reverse Back Heel: moving away from goal, or receiving with his back to it, with a defender tight on him.
 const heel=kitAbility(p,"disguised-finish");
 if(heel)opportunity(state,p,metres<=kitParam(heel,"maxMetres",16)?"heel:in-range":"heel:too-far");
 if(heel&&metres<=kitParam(heel,"maxMetres",16)&&ready(heel)&&Number(runtime.cooldowns["disguised-finish"]||0)<=Number(state.tick)){
  const gx=(targetGoal(n).x-p.x)*XM,gy=(targetGoal(n).y-p.y)*YM,cosTo=(v)=>(v.x*gx+v.y*gy)/((Math.hypot(v.x,v.y)||1)*(Math.hypot(gx,gy)||1));
  const move=p.lastMove,away=move&&Math.hypot(move.x,move.y)>1.5&&cosTo(move)<-.2,rec=state.lastReception;
  const backToGoal=rec&&rec.playerId===idOf(p.id)&&Number(rec.tick)===Number(state.tick)-1&&cosTo({x:(rec.to.x-rec.from.x)*XM,y:(rec.to.y-rec.from.y)*YM})<-.3;
  const tight=rivals.filter(d=>distance(d,p)<kitParam(heel,"tightMetres",3)).sort((a,b)=>distance(a,p)-distance(b,p))[0];
  opportunity(state,p,!(away||backToGoal)?"heel:facing-goal":!tight?"heel:no-tight-defender":aheadM(n,tight)>aheadM(n,p)-1?"heel:offered":"heel:defender-behind");
  if((away||backToGoal)&&tight&&aheadM(n,tight)>aheadM(n,p)-1)list.push({id:"reverse-back-heel-shot",ability:heel,aim:aims.far,aimSide:"far",logit:kitParam(heel,"technique",-.45),ignoreId:idOf(tight.id),pressureRelief:1.5,blockFactor:1,cooldown:kitParam(heel,"cooldownTicks",40)});
 }
 // Two-Gun Volley: in Flow, a pass met first-time while a defender commits to the block.
 const volley=kitAbility(p,"feint-volley"),uses=runtime.uses["two-gun-volley"]||{attempts:0,goals:0};
 if(volley)opportunity(state,p,!first?"tgv:no-first-time":!isFlowing(p)?"tgv:first-time-no-flow":metres>kitParam(volley,"maxMetres",20)?"tgv:flow-too-far":"tgv:flow-in-range");
 if(volley&&first&&isFlowing(p)&&metres<=kitParam(volley,"maxMetres",20)&&uses.goals<kitParam(volley,"maxGoalsPerMatch",1)&&uses.attempts<kitParam(volley,"maxAttemptsPerMatch",2)){
  const committing=rivals.filter(d=>distance(d,p)<kitParam(volley,"commitRange",4.5)||lineBlocker(state,p,targetGoal(n))===d&&distance(d,p)<7).sort((a,b)=>distance(a,p)-distance(b,p))[0];
  opportunity(state,p,committing?"tgv:offered":"tgv:no-committing-defender");
  if(committing){const switched=lineBlocker(state,p,aims.far)===committing?aims.near:aims.far;
   list.push({id:"two-gun-volley",ability:volley,ultimate:true,aim:switched,aimSide:switched===aims.far?"far":"near",logit:kitParam(volley,"technique",.45),ignoreId:idOf(committing.id),pressureRelief:3,blockFactor:1});}
 }
 // Rush Volley is offered by the rebound race (reboundRace), not from a settled position.
 return list;
}

/* ---------- Chemical reactions ---------- */
// Reactions are declared in a character's kit with a partner id; both must be active on the same team.
// One identity per reaction id: "members" names both players (first = the kit's lead role), so the
// reaction works whichever member's kit declares it and shares one cooldown in state.reactionCooldowns.
function reactionMembers(def,holder){return(Array.isArray(def.members)&&def.members.length===2?def.members:[holder.id,def.partnerId]).map(idOf);}
function kitReactions(state,p){
 const out=[],team=state.teams[p.teamNumber];if(!team)return out;const act=active(team),seen=new Set();
 act.forEach(holder=>{(holder.battleSim&&Array.isArray(holder.battleSim.reactions)?holder.battleSim.reactions:[]).forEach(r=>{
  if(!r||seen.has(r.id))return;const [a,b]=reactionMembers(r,holder),owner=act.find(x=>idOf(x.id)===a),partner=act.find(x=>idOf(x.id)===b);
  if(!owner||!partner)return;seen.add(r.id);if(owner===p||partner===p)out.push({def:r,owner,partner});
 });});
 return out;
}
// Cheap gate for hot paths: does any active player on this team hold a reaction with this effect?
function teamHasReactionEffect(state,teamNumber,effect){const team=state.teams[teamNumber];return !!team&&active(team).some(h=>h.battleSim&&Array.isArray(h.battleSim.reactions)&&h.battleSim.reactions.some(r=>r&&r.effect===effect));}
// One cooldown per reaction identity per team: both partners read and start the same entry.
function reactionKey(def,teamNumber){return (Number(teamNumber)===2?2:1)+":"+def.id;}
function reactionReady(state,def,teamNumber){const cd=state.reactionCooldowns&&state.reactionCooldowns[reactionKey(def,teamNumber)];return !(Number(cd)>Number(state.tick));}
function useReaction(state,def,teamNumber){if(!state.reactionCooldowns||typeof state.reactionCooldowns!=="object")state.reactionCooldowns={};state.reactionCooldowns[reactionKey(def,teamNumber)]=Number(state.tick)+Math.max(1,Number(def.cooldownTicks)||12);}

/* ---------- Character dialogue ---------- */
// Situational lines from the kit; no line repeats within the last six, minor lines are throttled.
function kitLine(state,p,key,major){
 const lines=p&&p.battleSim&&p.battleSim.dialogue&&p.battleSim.dialogue[key];if(!Array.isArray(lines)||!lines.length)return null;
 const st=abilityState(p),now=Number(state.tick)||0;
 if(!major&&now-(Number(st.lastLineTick)||-99)<3)return null;
 const fresh=lines.filter(l=>!st.recentLines.includes(l)),others=lines.filter(l=>l!==st.recentLines[st.recentLines.length-1]),pool=fresh.length?fresh:others.length?others:lines,line=pool[Math.floor(state.random()*pool.length)%pool.length];
 st.recentLines.push(line);if(st.recentLines.length>6)st.recentLines.shift();st.lastLineTick=now;
 return{playerId:idOf(p.id),text:p.name+": "+String.fromCharCode(34)+line+String.fromCharCode(34),key:line};
}
function reactionBetween(state,a,b,effect){
 for(const r of kitReactions(state,a))if(r.def.effect===effect&&(r.owner===a&&r.partner===b||r.owner===b&&r.partner===a)&&reactionReady(state,r.def,r.owner.teamNumber))return r;
 return null;
}
// Does the passer notice this teammate's run? Vision sets how far across the pitch he reads;
// a synchronised partner is read beyond that.
function seesRun(state,carrier,receiver,from){const aw=battleAwareness(carrier);return distance(from,receiver)<=aw.scan+8||!!reactionBetween(state,carrier,receiver,"synchronized-through");}
// Character intelligence applied to one pass option: chemical reactions, run recognition,
// rivalry and tactical memory. Returns false when the passer does not see the option at all.
function passIntelligence(state,carrier,option,ctx){
 const receiver=option.receiver,run=receiver.intent,aw=battleAwareness(carrier),n=carrier.teamNumber;
 option.value+=aw.tendencies.pass*.02*(option.through?1.5:1);
 // Creative Passing: straight after a dribble that drew or beat a defender, the space he opened is seen and used.
 const cp=kitAbility(carrier,"disruption-pass"),ld=carrier.lastDribble;
 if(cp&&ld&&Number(state.tick)-Number(ld.tick)<=1&&(option.through||option.style==="cutback")){option.creative=cp;option.value+=kitParamP(carrier,cp,"value",.01);
  if(option.through){const m=passModel(state,carrier,receiver,option.to,option.kind,{...ctx.opts,through:true,precision:kitParam(cp,"precision",.8)});if(!m.offside){option.model=m;option.precision=kitParam(cp,"precision",.8);}}}
 if(option.through&&run&&run.type==="run"&&!seesRun(state,carrier,receiver,option.model.from))return false;
 // Adaptability: a lane that has been cut out before is avoided.
 const lane=laneBucket(option.model.from,option.to),seen=memoryCount(state,carrier,"lane",lane);
 if(seen)option.value-=seen*.006;
 if(!option.through){const w=reactionBetween(state,carrier,receiver,"wall-pass");if(w&&w.owner===carrier)opportunity(state,carrier,!ctx.pressured?"hotline:not-pressured":distance(carrier,receiver)>=20?"hotline:too-far":option.model.success<=.65?"hotline:risky":"hotline:eligible");}
 const tag=(r,bonus,precision)=>{option.reaction=r;option.value+=bonus;if(precision&&option.through){option.precision=precision;const m=passModel(state,carrier,receiver,option.to,option.kind,{...ctx.opts,through:true,precision});if(!m.offside){option.model=m;option.value=passValue(state,carrier,option)+bonus;}}};
 let r;
 if(option.through&&run&&(r=reactionBetween(state,carrier,receiver,"synchronized-through"))&&r.owner===receiver&&!option.model.offside)
  tag(r,kitParam(r.def,"value",.012),kitParam(r.def,"precision",.55));
 else if(run&&run.reaction&&idOf(run.reactionPasser)===idOf(carrier.id)&&(r=kitReactions(state,carrier).find(x=>x.def.id===run.reaction&&(x.partner===receiver||x.owner===receiver)))&&!option.model.offside)
  tag(r,kitParam(r.def,"returnValue",.02),kitParam(r.def,"precision",.6));   // second half of a wall pass / exploiting created space
 else if(!option.through&&(r=reactionBetween(state,carrier,receiver,"wall-pass"))&&r.owner===carrier&&ctx.pressured&&distance(carrier,receiver)<20&&option.model.success>.65)
  tag(r,kitParam(r.def,"value",.012));
 else if((r=reactionBetween(state,carrier,receiver,"rival-cooperation"))){
  // Rivals prefer to finish themselves; they cooperate only when the other's chance is clearly better.
  const own=ctx.ownShot(),theirs=positionValue(state,receiver,option.model.valueAt||option.to,option.opponents);
  if(theirs>own+kitParam(r.def,"margin",.08)&&option.model.success>.55)tag(r,kitParam(r.def,"value",.02));
  else option.value-=kitParam(r.def,"rivalry",.01);
 }
 return true;
}
// Called when a tagged pass is played: cooldown, presentation badge and the reaction line.
function playReaction(state,carrier,option){
 const r=option.reaction;if(!r)return{};
 const chained=option.receiver.intent&&option.receiver.intent.reaction===r.def.id;
 if(!chained)useReaction(state,r.def,r.owner.teamNumber);
 const line=kitLine(state,r.owner,r.def.dialogue||r.def.id,true);
 // Wall pass: the passer sets off for the return into the space behind his marker.
 if(r.def.effect==="wall-pass"&&!chained&&r.owner===carrier){
  const n=carrier.teamNumber,goal=targetGoal(n),dir=Math.atan2((goal.y-carrier.y)*YM,(goal.x-carrier.x)*XM),target=shiftM(carrier,Math.abs(Math.cos(dir))*12,(goal.y-carrier.y)*YM*.15,n);
  carrier.intent={type:"run",target:point(target),buffer:0,band:gapBand(target.y*YM),tick:state.tick,until:state.tick+2,primed:true,blindSpot:true,dir:{x:n===1?1:-1,y:0},reaction:r.def.id,reactionPasser:idOf(option.receiver.id)};
 }
 if(chained)option.receiver.intent=null;
 state.reactionCount=(Number(state.reactionCount)||0)+1;
 return{reaction:{id:String(r.def.id),label:String(r.def.label||r.def.name).toUpperCase(),partners:[idOf(r.owner.id),idOf(r.partner.id)]},dialogue:line?[line]:undefined};
}
// Creative Instinct: a dribble that drags two or more defenders leaves space; the partner reads it.
function afterDribble(state,carrier,beaten){
 for(const r of kitReactions(state,carrier)){
  if(r.def.effect!=="exploit-disruption"||r.partner!==carrier&&r.owner!==carrier||!reactionReady(state,r.def,r.owner.teamNumber))continue;
  const reader=r.owner===carrier?r.partner:r.owner,n=carrier.teamNumber,drawn=opposing(state,n).filter(d=>d.role!=="GK"&&distance(d,carrier)<9).length;
  if(drawn+(beaten?1:0)<kitParam(r.def,"defendersDrawn",2)||distance(reader,carrier)>32||reader.intent&&reader.intent.reaction)continue;
  const opp=opposing(state,n),line=lastLineM(state,n);let best=null;
  for(const [f,l] of [[8,0],[8,8],[8,-8],[12,4],[12,-4],[5,12],[5,-12]]){
   let c=shiftM(reader,f,l,n);if(aheadM(n,c)>line-2.5)c=pitchAt(n,line-2.5,c.y);
   const space=Math.min(12,nearestOpponentM(state,n,c,opp)),score=space+aheadM(n,c)*.05;if(!best||score>best.score)best={c,score};
  }
  if(!best||best.score<6)continue;
  useReaction(state,r.def,r.owner.teamNumber);
  reader.intent={type:"run",target:point(best.c),buffer:0,band:gapBand(best.c.y*YM),tick:state.tick,until:state.tick+2,primed:true,blindSpot:false,dir:{x:n===1?1:-1,y:0},reaction:r.def.id,reactionPasser:idOf(carrier.id)};
  return;
 }
}
/* ---------- v0.8.9.1 shared character mechanics ---------- */
// A kit's Flow entry ("flow-state") raises named parameters of its other abilities while in Flow.
function kitParamP(p,ability,key,fallback){
 if(ability&&isFlowing(p)){const flow=kitAbility(p,"flow-state"),boost=flow&&flow.params&&flow.params.boost;
  // Entries with several effects are boosted through any of them.
  if(boost)for(const e of [ability.effect,...(Array.isArray(ability.effects)?ability.effects:[])]){const b=e&&boost[e];if(b&&b[key]!=null)return b[key];}}
 return kitParam(ability,key,fallback);
}
// Presentation chips are throttled per ability so passives are visible without spamming the feed.
function chipOnce(state,p,ability,kind,gap){
 if(!ability)return undefined;const st=abilityState(p);if(!st.chips||typeof st.chips!=="object")st.chips={};
 if(Number(state.tick)-(Number(st.chips[ability.id])||-99)<(gap==null?6:gap))return undefined;st.chips[ability.id]=Number(state.tick);return abilityBadge(ability,kind);
}
// Striker's Pride: trailing, or no shot after the opening phase, makes a forward take responsibility.
function prideActive(state,p){
 const a=kitAbility(p,"pride");if(!a)return null;const opp=p.teamNumber===1?2:1;
 const trailing=state.score[p.teamNumber]<state.score[opp],quiet=Number(state.tick)>=kitParam(a,"quietAfter",30)&&!(p.match.shots>0);
 return trailing||quiet||kitParamP(p,a,"always",false)?a:null;
}
// Support movement: an option 9–14 m from the carrier, onside, in space, reachable from where he is.
function supportSpot(state,n,carrier,p,line){
 const goal=targetGoal(n),dir=Math.atan2((goal.y-carrier.y)*YM,(goal.x-carrier.x)*XM),opp=opposing(state,n);let best=null;
 for(const deg of [-70,-45,-20,20,45,70])for(const m of [9,12]){
  const a=dir+deg*Math.PI/180,c=clampPitch({x:carrier.x+Math.cos(a)*m/XM,y:carrier.y+Math.sin(a)*m/YM});if(aheadM(n,c)>line-1||distance(p,c)>26)continue;
  const lane=opp.some(o=>o.role!=="GK"&&laneGeometry(carrier,c,o).perp<1.5&&laneGeometry(carrier,c,o).along>0&&laneGeometry(carrier,c,o).along<m);
  const score=Math.min(10,nearestOpponentM(state,n,c,opp))-(lane?6:0)+aheadM(n,c)*.04-distance(p,c)*.05;if(!best||score>best.score)best={c,score};
 }
 return best&&best.score>3?best.c:null;
}
function clampPitch(q){return{x:clamp(q.x,1,99),y:clamp(q.y,2,98)};}
// Recent failed dribbles make an ordinary player more cautious; Free Spirit shrugs most of it off.
function dribbleSlump(state,p){const s=Number(p.dribbleSlump)||0;if(!s)return 0;const left=Math.max(0,s-(Number(state.tick)-(Number(p.dribbleSlumpTick)||0))/8),free=kitAbility(p,"free-spirit");return left*(free?kitParam(free,"factor",.35):1);}
// Malicia: inviting a challenge from a defender who approaches from a poor angle or too fast.
function maliciaRead(state,carrier){
 const mal=kitAbility(carrier,"foul-drawing");if(!mal)return null;const n=carrier.teamNumber,goal=targetGoal(n);
 const opp=kitAbility(carrier,"contact-read"),range=kitParam(mal,"range",3.4)+(opp?kitParam(opp,"range",1):0);
 const d=opposing(state,n).filter(o=>o.role!=="GK"&&distance(o,carrier)<range).sort((a,b)=>distance(a,carrier)-distance(b,carrier))[0];if(!d)return null;
 const ax=(goal.x-carrier.x)*XM,ay=(goal.y-carrier.y)*YM,al=Math.hypot(ax,ay)||1,vx=(carrier.x-d.x)*XM,vy=(carrier.y-d.y)*YM,vl=Math.hypot(vx,vy)||1;
 const along=(ax*vx+ay*vy)/(al*vl),behind=along>.35,side=Math.abs(along)<=.35;   // >0: the defender comes from behind him
 const right=(ax*vy-ay*vx)/(al*vl)>.3,move=d.lastMove||{x:0,y:0},momentum=clamp((move.x*vx+move.y*vy)/vl/6,0,1);
 const discipline=battleAwareness(d).defensiveRead,trap=kitAbility(carrier,"right-side-trap"),st=abilityState(carrier);
 const trapOn=trap&&right&&!(Number(st.cooldowns[trap.id]||0)>Number(state.tick));
 const foul=clamp(kitParamP(carrier,mal,"base",.14)+(behind?.22:side?.12:0)+momentum*.12+(trapOn?kitParam(trap,"bonus",.1):0)-Math.max(0,discipline-.6)*.45,.02,.6);
 const keep=(1-foul)*clamp(.42+(effective(carrier,"dri")-effective(d,"def"))*.006,.15,.6),dive=(1-foul-keep)*clamp(.25-(behind?.12:0),.05,.3);
 return{ability:mal,defender:d,foul,keep,dive,lose:1-foul-keep-dive,trap:trapOn?trap:null,behind,side};
}
// Kunigami's man-marking target: a named rival if present, else the most dangerous nearby attacker.
function manMarkTarget(state,d,attackers,shape){
 const mm=kitAbility(d,"man-marking");if(!mm)return null;const named=(kitParam(mm,"targets",[])||[]).map(idOf);
 return attackers.find(a=>named.includes(idOf(a.id))&&distance(shape.get(d.id),a)<kitParam(mm,"range",30))||attackers.filter(a=>distance(shape.get(d.id),a)<kitParam(mm,"range",30)*.6).sort((a,b)=>effective(b,"off")-effective(a,"off"))[0]||null;
}
// Second balls: who physically reaches a loose ball first (reaction, acceleration, top speed).
function reboundRace(state,loose,attackingNumber,shooter){
 const reach=[];[1,2].forEach(n=>active(state.teams[n]).forEach(p=>{
  if(p===shooter)return;const d=distance(p,loose);if(d>22)return;if(p.role==="GK"&&n===attackingNumber)return;
  let reaction=.35-(effective(p,n===attackingNumber?"off":"def",state)-70)*.004-(p.role==="GK"?.12:0),rx=null;
  const shield=kitAbility(p,"physical-shield"),persist=kitAbility(p,"persistent-press");
  if(shield)reaction-=kitParamP(p,shield,"looseBall",.1);if(persist)reaction-=kitParamP(p,persist,"looseBall",.1);
  if(n===attackingNumber&&shooter)for(const r of kitReactions(state,p))if(r.def.effect==="second-ball"&&(r.owner===shooter||r.partner===shooter)&&reactionReady(state,r.def,r.owner.teamNumber)){reaction-=kitParam(r.def,"reaction",.2);rx=r;opportunity(state,p,"secondball:in-race");}
  // Following in: attackers already running at the box when the shot is struck arrive at speed and
  // anticipate the parry (strikers more than anyone); defenders facing their own goal have to turn.
  const follow=n===attackingNumber&&d<=18&&(p.intent&&(p.intent.type==="run"||p.intent.type==="support")||["ST","W","AM"].includes(roleGroup(p.role)));
  if(follow)reaction-=roleGroup(p.role)==="ST"?.1:.05;
  reach.push({p,rx,d,t:Math.max(.05,reaction)+timeToCover(Math.max(0,d-1),sprintSpeed(p,state),sprintAccel(p,state),follow?sprintSpeed(p,state)*.5:0)+state.random()*.25});
 }));
 reach.sort((a,b)=>a.t-b.t||idOf(a.p.id).localeCompare(idOf(b.p.id)));
 const nearA=Math.min(99,...reach.filter(r=>r.p.teamNumber===attackingNumber).map(r=>r.d)),nearD=Math.min(99,...reach.filter(r=>r.p.teamNumber!==attackingNumber&&r.p.role!=="GK").map(r=>r.d));
 opportunity(state,null,"rebound:nearest-attacker-"+(nearA<4?"<4m":nearA<8?"4-8m":nearA<14?"8-14m":"14m+"));opportunity(state,null,"rebound:nearest-defender-"+(nearD<4?"<4m":nearD<8?"4-8m":"8m+"));
 return reach[0]||null;
}
// Presentation extras for a pass that is played: reaction, the run's ability and the passer's read.
function passExtras(state,carrier,option){
 const extras=playReaction(state,carrier,option),run=option.receiver.intent;
 const sup=run&&run.type==="support"?kitAbility(option.receiver,"support-movement"):null;
 if(!extras.reaction&&sup&&!option.through){extras.ability=chipOnce(state,option.receiver,sup,"passive",10);const line=extras.ability&&kitLine(state,option.receiver,sup.dialogue||"support",false);if(line)extras.dialogue=[line];if(extras.ability)return extras;}
 if(!extras.reaction&&option.creative){extras.ability=chipOnce(state,carrier,option.creative,"weapon",4);const line=extras.ability&&kitLine(state,carrier,option.creative.dialogue||"create",false);if(line)extras.dialogue=[line];return extras;}
 if(!extras.reaction&&option.through&&run&&run.type==="run"){
  const blind=run.blindSpot&&kitAbility(option.receiver,"blind-spot-run"),meta=kitAbility(carrier,"space-reading"),ghost=run.ghost?kitAbility(option.receiver,"ghost-run"):null;
  if(ghost){extras.ability=abilityBadge(ghost,"weapon");const line=kitLine(state,option.receiver,ghost.dialogue||"blindRun",true);if(line)extras.dialogue=[line];}
  else if(blind){extras.ability=abilityBadge(blind,"passive");const line=kitLine(state,option.receiver,blind.dialogue||"blindRun",false);if(line)extras.dialogue=[line];}
  // Metavision is always working; only a significant read is labelled (a run found from distance,
  // or his own run arriving behind the line), at most once every 12 ticks.
  else if(meta&&distance(carrier,option.receiver)>22){extras.ability=chipOnce(state,carrier,meta,"passive",12);const line=extras.ability&&kitLine(state,carrier,meta.dialogue||"read",false);if(line)extras.dialogue=[line];}
  else{const own=kitAbility(option.receiver,"space-reading");if(own&&option.behind){extras.ability=chipOnce(state,option.receiver,own,"passive",12);const line=extras.ability&&kitLine(state,option.receiver,own.dialogue||"read",false);if(line)extras.dialogue=[line];}}
 }
 return extras;
}
// Attacking support: each runner searches a few nearby points around its shape
// target for open, reachable space with a clear lane, away from teammates.
function bestOpenSpot(state,team,p,base,carrier,chosen,offside,oppM){
 // oppM holds opponent outfield coordinates in metres (shared per team plan; allocation-free loops).
 const n=team.number,group=roleGroup(p.role),runner=group==="ST"||group==="W"||group==="AM",t=team.strategy,tempo=(t.tempo-50)/50,direct=(t.directness-50)/50,ballAhead=aheadM(n,state.ball);
 // Runners hold a safety margin against a line that may step up this tick; a higher line and
 // a sharper forward (OFF) change how close to it they dare to stand.
 const opposition=state.teams[n===1?2:1].strategy,onsideBuffer=(.3+(Number(opposition.line)||50)*.018)*clamp(1.3-effective(p,"off",state)/150,.25,1);
 const offsets=runner?SUPPORT_OFFSETS_RUNNER.concat(direct>.18?SUPPORT_OFFSETS_DIRECT:[]):SUPPORT_OFFSETS;
 const progressWeight=runner?.025+Math.max(0,direct)*.095+Math.max(0,tempo)*.045:group==="CM"||group==="WM"?.012+Math.max(0,direct)*.035:0;
 const ax=carrier?carrier.x*XM:0,ay=carrier?carrier.y*YM:0;
 const prev=p.supportTarget&&state.tick-p.supportTarget.tick<=5&&distance(state.ball,{x:p.supportTarget.bx,y:p.supportTarget.by})<8?p.supportTarget:null;
 let best=null,bestScore=-Infinity;
 for(const [f,l] of offsets){
  let c=shiftM(base,f,l,n);
  if(aheadM(n,c)>offside-onsideBuffer&&aheadM(n,c)>ballAhead)c=pitchAt(n,Math.max(offside-onsideBuffer,ballAhead),c.y);
  const cx=c.x*XM,cy=c.y*YM;let open2=100,lane=0;
  const bx=cx-ax,by=cy-ay,len=Math.sqrt(bx*bx+by*by)||.001,idealGap=20+tempo*5+direct*5,band=carrier?Math.abs(len-idealGap)*.12:0;
  for(let i=0;i<oppM.length;i+=2){
   const ox=oppM[i],oy=oppM[i+1],dx=ox-cx,dy=oy-cy,d2=dx*dx+dy*dy;if(d2<open2)open2=d2;
   if(carrier){const qx=ox-ax,qy=oy-ay,along=(qx*bx+qy*by)/len;if(along>1.5&&along<len-1.5&&Math.abs(qx*by-qy*bx)/len<2.2)lane++;}
  }
  let crowd=0;for(const q of chosen){const dx=q.x*XM-cx,dy=q.y*YM-cy,d=Math.sqrt(dx*dx+dy*dy);if(d<9)crowd+=(9-d)*.9;}
  const hx=base.x*XM-cx,hy=base.y*YM-cy,px=p.x*XM-cx,py=p.y*YM-cy;
  let commit=0;if(prev){const tx=prev.x*XM-cx,ty=prev.y*YM-cy;if(tx*tx+ty*ty<25)commit=3.4;}
  // Attacking the box: with the ball in the final third, forwards value an onside spot inside the box
  // even with defenders around it (that is where cut-backs, crosses and rebounds are won).
  const boxPull=runner&&ballAhead>=62&&inOpponentBox(n,c)?2.2:0;
  const score=Math.min(7,Math.sqrt(open2))*.9-lane*3-band-crowd-Math.sqrt(hx*hx+hy*hy)*.32-Math.sqrt(px*px+py*py)*.12+aheadM(n,c)*progressWeight+(px*px+py*py<9?1:0)+commit+boxPull;
  if(score>bestScore){bestScore=score;best=c;}
 }
 best=best||base;if(!prev||distance(best,prev)>=4)p.supportTarget={x:best.x,y:best.y,tick:state.tick,bx:state.ball.x,by:state.ball.y};return best;
}
const SUPPORT_OFFSETS=[[0,0],[6,0],[-6,0],[0,7],[0,-7],[5,5],[5,-5],[-4,6],[-4,-6]],SUPPORT_OFFSETS_RUNNER=SUPPORT_OFFSETS.concat([[11,0],[9,6],[9,-6]]),SUPPORT_OFFSETS_DIRECT=[[14,0],[13,7],[13,-7],[18,0],[16,10],[16,-10]];
// Controlled defending: one presser, one cover player, an optional lane cutter for
// aggressive pressing, zonal man-marking for the rest. Nobody else chases the ball.
function defensivePlan(state,team,players,carrier,shape,targets,fixed,plans){
 const n=team.number,t=team.strategy,goal=ownGoal(n),ball=point(state.ball);if(!carrier)return;
 const transition=state.tick-(Number(state.transitionTick)||0)<=1,range=7+t.pressing*.33+(transition&&t.pressing>=58?8:0);
 const pressedBy=state.pressRoles&&state.pressRoles[n]&&idOf(state.pressRoles[n].carrier)===idOf(carrier.id)?state.pressRoles[n].ids:[];
 const persist=p=>{const a=kitAbility(p,"persistent-press");return a?kitParamP(p,a,"press",.5):0;};
 const time=p=>distance(p,carrier)/runSpeed(p,state)-(pressedBy.indexOf(idOf(p.id))>=0?.9-pressedBy.indexOf(idOf(p.id))*.3:0)-persist(p);
 const ranked=players.slice().sort((a,b)=>time(a)-time(b)||idOf(a.id).localeCompare(idOf(b.id)));
 state.pressRoles={...(state.pressRoles||{}),[n]:{carrier:idOf(carrier.id),ids:ranked.slice(0,4).map(p=>idOf(p.id))}};
 const presser=ranked[0],cover=ranked[1],cutter=ranked[2],screen=ranked[3];
 if(presser&&distance(presser,carrier)<=range){
  const press=offsetM(carrier,goal,1.4);press.sprint=1.35;targets.set(presser.id,press);fixed.add(presser.id);
  if(cover&&t.pressing>=28&&distance(cover,carrier)<=range+9){targets.set(cover.id,offsetM(carrier,goal,6.5));fixed.add(cover.id);}
  if(cutter&&t.pressing>=60&&fixed.has(cover&&cover.id)){
   const mates=active(state.teams[carrier.teamNumber]).filter(m=>m.role!=="GK"&&m.id!==carrier.id).sort((a,b)=>distance(a,carrier)-distance(b,carrier));
   if(mates[0]&&distance(cutter,carrier)<=range+14){targets.set(cutter.id,lerpPoint(carrier,mates[0],.45));fixed.add(cutter.id);}
  }
  if(screen&&t.pressing>=84&&distance(screen,carrier)<=range+18){targets.set(screen.id,offsetM(carrier,goal,11));fixed.add(screen.id);}
 }else if(presser)targets.set(presser.id,lerpPoint(shape.get(presser.id),offsetM(carrier,goal,5),.4));
 const free=players.filter(p=>!targets.has(p.id)),attackers=active(state.teams[carrier.teamNumber]).filter(o=>o.role!=="GK"&&o.id!==carrier.id),pairs=[];
 // Defenders read the run: they mark where the attacker is going, weighted by DEF anticipation.
 const anticipation=new Map(players.map(d=>[d,clamp(.3+(effective(d,"def",state)-60)/70,.3,.85)]));
 const read=(d,a)=>{const planned=plans&&plans.get(a.teamNumber+":"+idOf(a.id));if(a.intent&&a.intent.type==="run")return tracksRun(d,a)?point(a.intent.target):lerpPoint(a,a.intent.target,.25);return planned?lerpPoint(a,planned,anticipation.get(d)):point(a);};
 // Marking assignments are sticky for a few ticks so two defenders never swap men every tick.
 const kept=d=>d.markTarget&&state.tick-d.markTarget.tick<=4?d.markTarget.id:null;
 free.forEach(d=>attackers.forEach(a=>{const cost=distance(shape.get(d.id),read(d,a))-(kept(d)===idOf(a.id)?5:0);if(cost<20)pairs.push({d,a,cost});}));
 pairs.sort((x,y)=>x.cost-y.cost||idOf(x.d.id).localeCompare(idOf(y.d.id))||idOf(x.a.id).localeCompare(idOf(y.a.id)));
 const usedD=new Set(),usedA=new Set();
 // Physical man-marking: the marker takes his target first and stays goal-side and tight.
 free.forEach(d=>{const a=manMarkTarget(state,d,attackers,shape);if(!a||usedA.has(a.id))return;usedD.add(d.id);usedA.add(a.id);
  if(!(d.markTarget&&d.markTarget.id===idOf(a.id)))d.markTarget={id:idOf(a.id),tick:state.tick};else d.markTarget.tick=state.tick;
  const at=read(d,a);targets.set(d.id,{...lerpPoint(offsetM(at,goal,1.1),ball,.05),sprint:1.2});fixed.add(d.id);});
 pairs.forEach(({d,a})=>{if(usedD.has(d.id)||usedA.has(a.id))return;usedD.add(d.id);usedA.add(a.id);
  if(kept(d)!==idOf(a.id))d.markTarget={id:idOf(a.id),tick:state.tick};
  const at=read(d,a),danger=aheadM(n,at)<35,live=distance(at,ball)<28,mark=lerpPoint(offsetM(at,goal,danger?1.5:2.2),ball,.1);
  targets.set(d.id,lerpPoint(shape.get(d.id),mark,danger?.9:live?.8:.5));});
 free.forEach(p=>{if(!targets.has(p.id))targets.set(p.id,shape.get(p.id));});
}
// Context-dependent spacing: support players keep passing distance; pressers,
// cover and markers may legitimately stand close to opponents and each other.
function separateTargets(targets,fixed,minSep){
 const ids=[...targets.keys()];
 for(let it=0;it<3;it++)for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const a=targets.get(ids[i]),b=targets.get(ids[j]),fa=fixed.has(ids[i]),fb=fixed.has(ids[j]);if(fa&&fb)continue;
  const need=fa||fb?Math.min(minSep,4.5):minSep;let dx=(b.x-a.x)*XM,dy=(b.y-a.y)*YM,d=Math.hypot(dx,dy);if(d>=need)continue;
  if(d<.01){dx=0;dy=i%2?1:-1;d=1;}else{dx/=d;dy/=d;}
  const gap=need-Math.min(d,need),wa=fa?0:1,wb=fb?0:1,share=gap/(wa+wb);
  if(wa)targets.set(ids[i],{x:clamp(a.x-dx*share/XM,2,98),y:clamp(a.y-dy*share/YM,5,95)});
  if(wb)targets.set(ids[j],{x:clamp(b.x+dx*share/XM,2,98),y:clamp(b.y+dy*share/YM,5,95)});
 }
}
function planTeamShape(state,team,plans){
 const n=team.number,attacking=state.possession===n,ball=point(state.ball),players=active(team).filter(p=>p.role!=="GK");
 const holder=state.teams[state.possession],carrier=holder&&playerIn(holder,state.carrierId);
 const strikers=players.filter(p=>roleGroup(p.role)==="ST").sort((a,b)=>teamSlotOf(team,a).index-teamSlotOf(team,b).index);
 const offside=attacking?Math.max(lastLineM(state,n),aheadM(n,ball),PITCH_LENGTH/2):PITCH_LENGTH;
 // Offside trap: after a backward ball the line steps up together, more so for a high line.
 const previous=state.previousBall,retreat=!attacking&&previous?aheadM(n,ball)-aheadM(n,previous):0;
 const stepUp=retreat>=4?clamp(2+(team.strategy.line-40)*.1,1.5,7):0;
 const ctx={attacking,ball,offside,stepUp,secondStriker:strikers.length>1?strikers[1].id:null};
 const shape=new Map(players.map(p=>[p.id,shapeTarget(team,p,ctx)])),targets=new Map(),fixed=new Set();
 if(attacking){
  const own=carrier&&carrier.teamNumber===n?carrier:null,chosen=own?[point(own)]:[],oppM=[];
  opposing(state,n).forEach(o=>{if(o.role!=="GK")oppM.push(o.x*XM,o.y*YM);});
  players.filter(p=>!own||p.id!==own.id).sort((a,b)=>distance(a,ball)-distance(b,ball)||idOf(a.id).localeCompare(idOf(b.id))).forEach(p=>{
   const run=p.intent&&(p.intent.type==="run"||p.intent.type==="hold"||p.intent.type==="support")?p.intent:null;
   if(run){const t=run.type==="run"?{...point(run.target),sprint:1.3}:run.type==="support"?{...point(run.target),sprint:1.15}:point(run.target);targets.set(p.id,t);fixed.add(p.id);chosen.push(t);return;}
   const t=bestOpenSpot(state,team,p,shape.get(p.id),own,chosen,offside,oppM);targets.set(p.id,t);chosen.push(t);});
  if(own){targets.set("__carrier",point(own));fixed.add("__carrier");}
  separateTargets(targets,fixed,6.5+team.strategy.width*.025);targets.delete("__carrier");
 }else{
  defensivePlan(state,team,players,carrier&&carrier.teamNumber!==n?carrier:null,shape,targets,fixed,plans);
  players.forEach(p=>{if(!targets.has(p.id))targets.set(p.id,shape.get(p.id));});
  separateTargets(targets,fixed,4.5+team.strategy.width*.02);
 }
 targets.forEach((t,id)=>plans.set(n+":"+idOf(id),t));
}
function moveOffBall(state){
 if(state.shapePossession!==state.possession){state.shapePossession=state.possession;state.transitionTick=state.tick;}
 updateIntents(state);
 const plans=new Map(),runners=offBallOrder(state);
 const first=state.possession===2?2:1;[first,first===1?2:1].forEach(n=>planTeamShape(state,state.teams[n],plans));
 state.previousBall={x:state.ball.x,y:state.ball.y};
 // Order is determined once per tick: fastest effective SPD runs first.
 runners.forEach(p=>{
  if(p.role==="GK"){moveToward(p,keeperTarget(state,p),Math.min(2.2,movementMeters(p)*.56));return;}
  let target=plans.get(p.teamNumber+":"+idOf(p.id))||{x:p.homeX,y:p.homeY};
  // Settled players make small, deterministic adjustments instead of freezing or oscillating.
  if(distance(p,target)<.3){const phase=(state.tick+Number(p.id||0))*.7;target={x:p.x+Math.sin(phase)*.3,y:p.y+Math.cos(phase)*.4};}
  // Players far from their job make a longer recovery run (still SPD-based and stamina-costed).
  const old=point(p),gap=distance(p,target);moveToward(p,target,movementMeters(p)*Math.max(target.sprint||1,1+clamp((gap-6)/18,0,.8))*(1-.45*beatenSeverity(state,p)));
  p.lastMove={x:(p.x-old.x)*XM,y:(p.y-old.y)*YM};   // metres moved this tick (body orientation for disguised finishes)
  if(isBlueLockMan(p))p.stamina=100;else if(!isFlowing(p))p.stamina=clamp(p.stamina-distance(old,p)*.007,0,100);
 });
}
function targetZone(state,number,from,to){return point(to);}
function checkFoul(state,teamNumber,carrier,defender,where,nearbyDefenders,forced,extras){
 if(!carrier||!defender)return false;
 if(!forced&&distance(carrier,defender)>TACKLE_RADIUS_M)return false;
 const defending=state.teams[defender.teamNumber];
 // Aggressive duellers (kit "aggression") win more contests but commit more fouls.
 const aggro=kitAbility(defender,"aggression");
 if(!forced&&state.random()>=.012+defending.strategy.pressing*.0004+(aggro?kitParam(aggro,"foulRisk",.012):0))return false;
 const location=point(where||carrier),penalty=inOpponentBox(teamNumber,location);
 const freeKickType=!penalty&&distance(location,targetGoal(teamNumber))>40?"midfield":"attacking";
 defender.match.fouls++;defending.stats.fouls++;addPoints(defender,-.12);
 state.pending={type:penalty?"penalty":"free-kick",teamNumber,zone:zoneAt(location),point:location,
  takerId:carrier.id,freeKickType:penalty?null:freeKickType,
  routine:penalty?"direct":freeKickType==="midfield"?"short-pass":"direct"};
 state.possession=teamNumber;state.carrierId=carrier.id;setBall(state,location);
 addEvent(state,{type:"foul",teamNumber,notable:true,
  description:extras&&extras.description?extras.description+" "+(penalty?"Penalty awarded.":"Free kick awarded."):defender.name+" fouls "+carrier.name+". "+(penalty?"Penalty awarded.":"Free kick awarded."),
  actors:[defender,carrier],nearbyDefenders,ability:extras&&extras.ability,dialogue:extras&&extras.dialogue});
 if(state.random()<.07+defending.strategy.pressing*.0004){
  defender.yellows++;defender.match.yellows=defender.yellows;defending.stats.yellowCards++;addPoints(defender,-.08);
  addEvent(state,{type:"yellow-card",teamNumber:defender.teamNumber,notable:true,
   description:defender.name+" receives a yellow card ("+defender.yellows+"/3).",actors:[defender]});
  if(defender.yellows>=3){
   defender.sentOff=true;defender.matchStatus="sent-off";defender.match.redCards++;defending.stats.redCards++;addPoints(defender,-.25);
   const slot=Object.keys(defending.assignment).find(k=>idOf(defending.assignment[k])===idOf(defender.id));
   state.requiredSub=slot!=null?{teamNumber:defender.teamNumber,slot:String(slot),playerId:defender.id}:null;
   addEvent(state,{type:"red-card",teamNumber:defender.teamNumber,notable:true,
    description:defender.name+" is sent off."+(state.requiredSub?" A replacement is required.":""),actors:[defender]});
  }
 }
 pause(state,state.requiredSub?"RED CARD — SUBSTITUTION REQUIRED":penalty?"PENALTY":"FREE KICK");return true;
}

// Passing kinds stay "short" (ground) or "long" (lofted) for routes and saves.
function passKindFor(metres){return metres>=32?"long":"short";}
function choosePassKind(state,team,carrier,opts={}){return opts.passKind==="short"||opts.passKind==="long"?opts.passKind:"short";}
// Driven through balls travel faster than ordinary ground passes.
function ballSpeed(kind,through){return kind==="long"?18:through?19:15;}
function passingSkill(state,carrier,opts={}){
 if(opts.goalKick&&carrier.role==="GK")return effective(carrier,"gk",state);
 return carrier.role==="GK"?Math.max(effective(carrier,"pas",state),effective(carrier,"gk",state)*.85):effective(carrier,"pas",state);
}
/* One authoritative pass model, used both to choose a pass and to resolve it.
   Separates (1) execution error, (2) defenders who can physically reach the
   actual trajectory in time, and (3) defenders who can contest the reception. */
// Opponent attributes are fixed during one decision; evaluate them once per player.
function opponentAttributes(state,o,cache){let a=cache&&cache.get(o);if(!a){a={def:effective(o,"def",state),gk:effective(o,"gk",state),spd:effective(o,"spd",state)};a.run=4.4+a.spd*.036;if(cache)cache.set(o,a);}return a;}
function passModel(state,carrier,receiver,to,kind,opts={}){
 const n=carrier.teamNumber,from=point(opts.fromPoint||carrier),dest=point(to),len=distance(from,dest),lofted=kind==="long";
 const pas=passingSkill(state,carrier,opts),chem=passingChemistry(carrier,receiver),opponents=opts.opponents||opposing(state,n);
 const model={from,to:dest,len,kind,pas,chem,error:0,lanes:[],contests:[],success:1,involved:[]};
 model.involved=opponents.filter(o=>o.role!=="GK"&&(distance(o,from)<=RECEIVE_PRESSURE_M||distance(o,dest)<=RECEIVE_PRESSURE_M));
 if(opts.kickoff)return model;
 // Law 11: judged when the pass is played. Goal kicks, corners and throw-ins are exempt.
 model.offsideMargin=opts.offsideExempt?-99:offsideMargin(state,n,receiver,opts.lastLine);model.offside=model.offsideMargin>0;
 if(opts.through){
  const estimate=throughBallEstimate(state,carrier,receiver,dest,kind,{...opts,opponents});
  model.estimate=estimate;model.onsideSuccess=estimate.chance;model.success=model.offside?0:estimate.chance;model.valueAt=estimate.meet;
  const defender=estimate.race.bestDefender;if(defender&&!model.involved.includes(defender.p)&&defender.p.role!=="GK")model.involved.push(defender.p);
  return model;
 }
 const passerPressure=opponents.filter(o=>o.role!=="GK"&&distance(o,from)<=4).length;
 const difficulty=Math.max(0,len-(lofted?22:12))*(lofted?.012:.014)+passerPressure*.07+(opts.through?.11:0);
 model.error=clamp(difficulty*(1.1-(pas-40)/70)-(chem-65)*.0012,0,.6);
 const speed=ballSpeed(kind,opts.through),receiverSkill=effective(receiver,"off",state)*.45+effective(receiver,"dri",state)*.35+effective(receiver,"spd",state)*.2;
 opponents.forEach(o=>{
  const keeperOpp=o.role==="GK",attr=opponentAttributes(state,o,opts.attributes),def=keeperOpp?attr.gk:attr.def,spd=attr.run,g=laneGeometry(from,dest,o);
  if(!keeperOpp&&g.along>1.2&&g.along<g.len-2.5){
   // Reach grows with the time the ball needs to get level with the defender.
   const reach=lofted?(g.along<3?1.1:0):.9+Math.max(0,g.along/speed-.3)*spd*(.6+def/220);
   if(reach>0&&g.perp<reach){
    let chance=clamp(Math.pow(1-g.perp/reach,1.4)*(.18+.62*sigmoid(((def-75)-(pas-75)*.65)/14)),0,.85),rx=null;
    // Mark-and-read reaction: a partner pinning the receiver lets the reader anticipate the ball into him.
    if(o.battleSim&&teamHasReactionEffect(state,o.teamNumber,"mark-and-read"))for(const r of kitReactions(state,o)){
     if(r.def.effect!=="mark-and-read"||r.partner!==o||!reactionReady(state,r.def,r.owner.teamNumber))continue;
     const m=r.owner;if(!(m.markTarget&&m.markTarget.id===idOf(receiver.id)&&state.tick-m.markTarget.tick<=4&&distance(m,receiver)<=4.5))continue;
     if(distance(o,receiver)>kitParam(r.def,"range",14))continue;
     chance=clamp(chance+kitParam(r.def,"read",.12)*(1-g.perp/reach),0,.85);rx=r;
    }
    // Stalking Horse Defense: the marker waits a step ahead of his man and attacks the ball played into him.
    const stalk=o.battleSim?kitAbility(o,"stalking-horse"):null;
    if(stalk&&o.markTarget&&o.markTarget.id===idOf(receiver.id)&&state.tick-o.markTarget.tick<=4&&distance(o,receiver)<=kitParam(stalk,"radius",6))chance=clamp(chance+kitParamP(o,stalk,"read",.1)*(1-g.perp/reach),0,.85);
    if(chance>.005)model.lanes.push({p:o,chance,along:g.along,rx});
   }
  }
  // Keepers claim balls into the box and sweep balls played into the space behind their line.
  const sweep=keeperOpp&&(lofted||opts.through)&&distance(dest,ownGoal(o.teamNumber))<30;
  if(keeperOpp&&!sweep)return;
  const radius=sweep?16:opts.through?14:lofted?12:4.5,dd=distance(o,dest);if(dd>radius)return;
  let access=1-dd/radius;
  // Defenders react a beat late to a ball played into space (keepers come straight off their line).
  if(opts.through){const race=sigmoid((distance(receiver,dest)/runSpeed(receiver,state)-dd/spd-(keeperOpp?0:.35))/.6);access=clamp(access*race*1.6,0,1);}
  const duel=keeperOpp?sigmoid((def-70)/12):sigmoid(((def*.65+attr.spd*.35)-receiverSkill-(chem-65)*.25)/12);
  const chance=clamp(Math.pow(access,1.25)*duel*(lofted?.95:.8),0,.85);
  if(chance>.005)model.contests.push({p:o,chance});
 });
 model.lanes.sort((a,b)=>a.along-b.along);model.contests.sort((a,b)=>b.chance-a.chance);model.contests=model.contests.slice(0,2);
 const laneSurvive=model.lanes.reduce((s,l)=>s*(1-l.chance),1),contestSurvive=model.contests.reduce((s,c)=>s*(1-c.chance),1);
 model.onsideSuccess=(1-model.error)*laneSurvive*contestSurvive;model.success=model.offside?0:model.onsideSuccess;
 [...model.lanes,...model.contests].forEach(x=>{if(!model.involved.includes(x.p)&&x.p.role!=="GK")model.involved.push(x.p);});
 return model;
}
function passValue(state,carrier,option){
 const team=state.teams[carrier.teamNumber],n=team.number,m=option.model,t=team.strategy,direction=(t.directness-50)/50;
 const at=m.valueAt||m.to,forward=aheadM(n,at)-aheadM(n,m.from),directionFactor=forward>0?1+direction*.45:1-direction*.13;
 const throughFactor=option.through?1+Math.max(0,direction)*.12:1,longFactor=m.kind==="long"&&forward>0?1+Math.max(0,direction)*.10:1;
 const gain=positionValue(state,option.receiver,at,option.opponents)*directionFactor*throughFactor*longFactor;
 const open=Math.min(10,nearestOpponentM(state,n,at,option.opponents))/10,lossAt=m.lanes.length?lerpPoint(m.from,m.to,.5):at;
 const riskCost=lossCost(n,lossAt)*(1-Math.max(0,direction)*.16);
 const ok=m.onsideSuccess==null?m.success:m.onsideSuccess,value=ok*.85*(gain+open*.012+(m.chem-65)*.0002)-(1-ok)*riskCost;
 if(!(m.offsideMargin>-4))return value;
 // The passer reads the line with an error that shrinks with vision: tight calls are misread
 // both ways (a runner wrongly held back, or a pass played to a runner who is just off).
 const vision=clamp((effective(carrier,"pas",state)+effective(carrier,"off",state)-100)/100,0,1);
 const read=m.offsideMargin+(state.random()-.5)*2*(.6+(1-vision)*1.6);
 return read>0?-lossCost(n,option.receiver):value;
}
// Positive when the receiver is in an offside position: in the opponents' half,
// ahead of the ball and beyond the second-last opponent (keeper included).
function offsideMargin(state,number,receiver,line){const at=aheadM(number,receiver);if(at<=PITCH_LENGTH/2||at<=aheadM(number,state.ball))return -99;return at-(line==null?lastLineM(state,number):line);}
// Prospective receivers: to feet, or into space ahead of a runner (through ball).
function passOptions(state,carrier,opts={}){
 const team=state.teams[carrier.teamNumber],n=team.number,from=point(opts.fromPoint||carrier),options=[];
 opts={...opts,opponents:opts.opponents||opposing(state,n),attributes:opts.attributes||new Map()};if(opts.lastLine==null)opts.lastLine=lastLineM(state,n);
 const pressured=opts.opponents.filter(o=>o.role!=="GK"&&distance(o,carrier)<6).length>=2&&aheadM(n,carrier)<40;
 let ownShot=null;const ctx={opts,pressured:opts.opponents.some(o=>o.role!=="GK"&&distance(o,carrier)<6),ownShot:()=>ownShot==null?(ownShot=carrier.role==="GK"?0:shotModel(state,carrier,false,null,null,null,opts.opponents).goalChance):ownShot};
 const smart=!opts.setPiece&&!opts.kickoff&&!opts.throwIn;
 active(team).filter(p=>p.id!==carrier.id&&(p.role!=="GK"||opts.allowKeeper||pressured)).forEach(p=>{
  const feet=distance(from,p),add=(to,through,style)=>{
   const metres=distance(from,to),kind=opts.passKind||(style==="cross"?"long":through?(metres>=42?"long":"short"):passKindFor(metres));// through balls are threaded along the ground unless very long
   if(opts.kindFilter==="short"&&metres>SHORT_PASS_MAX_M)return;if(opts.kindFilter==="long"&&metres<30)return;if(opts.maxMetres&&metres>opts.maxMetres)return;
   const option={receiver:p,to:point(to),kind,through,behind:through&&aheadM(n,to)>opts.lastLine,opponents:opts.opponents,...(style?{style}:{})};option.model=passModel(state,carrier,p,to,kind,{...opts,through,aerial:style==="cross"});option.value=passValue(state,carrier,option);if(smart&&!passIntelligence(state,carrier,option,ctx))return;options.push(option);
  };
  add(p,false);
  const group=roleGroup(p.role);
  // Wide deliveries. A cross is lofted towards a team-mate attacking the box (the ball can only be met
  // around its landing point: the physical race decides header, clearance, keeper claim or loose ball).
  // A cut-back is a ground pass from near the byline back to a team-mate arriving behind the defenders.
  if(smart&&p.role!=="GK"){const toGoal=distance(p,targetGoal(n)),wide=Math.abs(from.y-50)*YM,a=aheadM(n,from),target=p.intent&&p.intent.type==="run"?point(p.intent.target):shiftM(p,1.5,0,n);
   // The cross is aimed into the box (near post, penalty spot or far post by where he is coming from);
   // a runner who is onside when it is struck may meet it behind the line, as with a through ball.
   // Aimed where the receiver will arrive: his run's destination, or a couple of metres ahead of him,
   // kept inside the danger zone between the six-yard line and the penalty spot area.
   const aimAt=p.intent&&(p.intent.type==="run"||p.intent.type==="support")?point(p.intent.target):shiftM(p,2.5,0,n),boxTarget=pitchAt(n,clamp(aheadM(n,aimAt),PITCH_LENGTH-14,PITCH_LENGTH-4.5),clamp(aimAt.y,38,62));
   if(wide>11&&a>=62&&aheadM(n,p)>=PITCH_LENGTH-24&&Math.abs(p.y-50)*YM<16&&distance(p,boxTarget)<14)add(boxTarget,true,"cross");
   if(a>=86&&wide>5&&toGoal>=7&&toGoal<=18&&aheadM(n,p)<a-2&&Math.abs(p.y-50)*YM<11)add(point(p),false,"cutback");}
  // A teammate making a run: the ball is played to where the run is going, beyond the line.
  const run=p.intent&&p.intent.type==="run"?p.intent:null;
  if(smart&&run&&feet<48){const line=opts.lastLine,keeperAt=Math.max(...opts.opponents.filter(o=>o.role==="GK").map(o=>aheadM(n,o)),line),depth=keeperAt-line,goalSide=aheadM(n,run.target)>=line-2;
   const target=goalSide&&depth>6?pitchAt(n,line+clamp(depth*.4,3,14),run.target.y):point(run.target);if(distance(from,target)<50&&aheadM(n,target)<102)add(target,true);}
  if(!opts.setPiece&&!opts.kickoff&&!opts.throwIn&&!run&&group!=="CB"&&group!=="GK"&&aheadM(n,p)>=aheadM(n,from)+3&&feet<42){
   const space=spaceAhead(state,n,p,opts.opponents);
   if(space>9){const lead=clamp(space*.5,4,12),to=shiftM(p,lead,(50-p.y)*YM*.12,n);if(aheadM(n,to)<102)add(to,true);}
   // Run in behind: an onside runner level with the last line is played into the space
   // between the line and the keeper; he sets off with the pass, defenders have to turn.
   const line=opts.lastLine,keeperAt=Math.max(...opts.opponents.filter(o=>o.role==="GK").map(o=>aheadM(n,o)),line);
   const gap=line-aheadM(n,p),depth=keeperAt-line;
   if(space<=9&&gap>=0&&gap<6&&depth>9&&line>PITCH_LENGTH/2){const target=pitchAt(n,line+clamp(depth*.45,4,15),p.y+(50-p.y)*.2);if(distance(from,target)<48)add(target,true);}
  }
 });
 return options;
}
function pickPassReceiver(state,team,carrier,kind,opts={}){
 const mates=active(team).filter(p=>p.id!==carrier.id&&p.role!=="GK");
 if(opts.setPiece&&opts.receiverId){const special=mates.find(p=>idOf(p.id)===idOf(opts.receiverId));if(special)return special;}
 let options=passOptions(state,carrier,{...opts,kindFilter:kind}).filter(o=>!o.through&&o.receiver.role!=="GK");
 if(!options.length)options=passOptions(state,carrier,opts).filter(o=>!o.through&&o.receiver.role!=="GK");
 if(opts.receiverId){const r=options.find(o=>idOf(o.receiver.id)===idOf(opts.receiverId));if(r)return r.receiver;}
 return options.length?options.sort((a,b)=>b.value-a.value)[0].receiver:null;
}
// v0.8.8.4 open-play finishing: a smooth expected-goals curve by distance and angle,
// shooter SHO and keeper GK entering proportionally (logit scale) instead of a flat
// elite bonus, then a single Blue Lock uplift. Penalties keep their dedicated duel.
const SHOT_UPLIFT=1.3;
// Blue Lock finishing lift: full inside the box, fading to the v0.8.8.5 level for long range.
function shotUplift(metres){return .9+(SHOT_UPLIFT-.9)*clamp((32-metres)/16,0,1);}
function shotBaseXG(metres){return clamp(.62*Math.exp(-(metres-4)/11),.012,.62);}
/* ---------- Goalkeeping (shared fundamentals + keeper kits) ----------
   Positioning: a keeper caught off the line between ball and goal covers less of it. Kit effects only
   apply to a player actually in goal: reflex-save (close-range reactions), acrobatic-reach (wide-angle
   and placed shots within reach), smother-block (one-on-one inside 9 m, cooldown), set-piece-ready.
   Everything is a term in the same shot model: no save is guaranteed. */
function keeperFactors(state,gk,spot,goal,metres,angleRatio,tech){
 const out={logit:0,used:null};if(!gk||gk.role!=="GK")return out;
 const g=laneGeometry(spot,goal,gk),off=g.along>0&&g.along<g.len+1?g.perp:Math.min(6,distance(gk,goal));
 if(off>2.2)out.logit+=Math.min(.55,(off-2.2)*.14);                      // out of position
 const add=(ability,value)=>{if(!ability||!(value>0))return;out.logit-=value;if(!out.used||value>out.usedValue){out.used=ability;out.usedValue=value;}};
 const reflex=kitAbility(gk,"reflex-save");if(reflex)add(reflex,kitParamP(gk,reflex,"reflex",.28)*clamp((17-metres)/10,0,1));
 const reach=kitAbility(gk,"acrobatic-reach");if(reach)add(reach,kitParamP(gk,reach,"reach",.2)*clamp(Math.max(angleRatio*1.6,tech&&tech.aim?.6:0),0,1));
 const smother=kitAbility(gk,"smother-block");if(smother&&metres<=kitParam(smother,"maxMetres",9)&&distance(gk,spot)<=kitParam(smother,"maxGap",7)&&!(Number(abilityState(gk).cooldowns["smother-block"]||0)>Number(state.tick)))add(smother,kitParamP(gk,smother,"block",.35));
 const ready=kitAbility(gk,"set-piece-ready");if(ready&&state.lastSetPieceTick!=null&&Number(state.tick)-Number(state.lastSetPieceTick)<=kitParam(ready,"window",2))add(ready,kitParamP(gk,ready,"ready",.22));
 // Super Reflex Save (cooldown): a fast reaction to a well-placed shot from mid-range.
 const sr=kitAbility(gk,"super-reflex");if(sr&&metres>=kitParam(sr,"minMetres",8)&&metres<=kitParam(sr,"maxMetres",22)&&(tech&&tech.aim||angleRatio>=.18||metres>=14)&&!(Number(abilityState(gk).cooldowns["super-reflex"]||0)>Number(state.tick)))add(sr,kitParamP(gk,sr,"reflex",.3));
 const steady=kitAbility(gk,"steady-keeper");if(steady&&off<=2.2&&metres>=12)add(steady,kitParamP(gk,steady,"positioning",.08));
 return out;
}
function shotModel(state,shooter,penalty,ultimate,special,at,opponents,technique){
 const tech=technique&&!penalty?technique:null,skip=tech&&tech.ignoreId?String(tech.ignoreId):null;
 const team=state.teams[shooter.teamNumber],defteam=state.teams[team.number===1?2:1],gk=keeper(defteam),spot=point(at||shooter),goal=targetGoal(team.number);
 const metres=distance(spot,goal),rivals=opponents||opposing(state,team.number);
 let near=99;for(const d of rivals)if(d.role!=="GK"&&idOf(d.id)!==skip){const m=distance(d,spot);if(m<near)near=m;}
 // A first-time or disguised finish denies the closest defender the moment he needs to engage.
 if(tech&&tech.pressureRelief)near+=tech.pressureRelief;
 const shootMultiplier=Math.max(1,Number(ultimate&&ultimate.statMultipliers&&ultimate.statMultipliers.sho)||1);
 const shoot=effective(shooter,"sho")*shootMultiplier,gkStat=gk?effective(gk,"gk"):45;
 const lateral=Math.abs(spot.y-50)*YM,angleRatio=lateral/Math.max(1,metres);
 const finishing=penalty?sigmoid((shoot-gkStat)/22+1.28):sigmoid(logit(shotBaseXG(metres))+shotUplift(metres)+(shoot-75)/17-(gkStat-75)/18-2.2*angleRatio*angleRatio+(tech?Number(tech.logit)||0:0)+keeperFactors(state,gk,spot,goal,metres,angleRatio,tech).logit);
 const bonus=special&&special.successChanceBonus?special.successChanceBonus:null;
 const nearbyCount=bonus?battleSimNearbyDefenders(state,shooter,spot,Math.max(0,Number(bonus.rangeMeters)||RECEIVE_PRESSURE_M)):0;
 const specialBonus=bonus?Math.min(Math.max(0,Number(bonus.maxBonus)||0),nearbyCount*Math.max(0,Number(bonus.perNearbyDefender)||0)):0;
 // Outfield defenders standing in the shooting lane can block the strike.
 let blockers=0,openChance=1;
 const aim=tech&&tech.aim?tech.aim:goal,blockScale=tech&&tech.blockFactor!=null?tech.blockFactor:1;
 if(!penalty)rivals.forEach(d=>{if(d.role==="GK"||idOf(d.id)===skip)return;const g=laneGeometry(spot,aim,d);if(g.along>.8&&g.along<g.len-1.5&&g.perp<1.8){blockers++;openChance*=1-.32*blockScale*(1-g.perp/1.8);}});
 // Close-range finishes are routinely pressured; the same pressure smothers a long-range strike.
 const closedDown=penalty?1:1-(near<2.5?.4:near<4?.24:near<TACKLE_RADIUS_M?.08:0)*clamp((metres-6)/22,.3,1);
 const goalChance=clamp((finishing+specialBonus)*openChance*closedDown,0,1);
 return{team,defteam,gk,metres,shoot,gkStat,goalChance,blockers};
}
function dribbleModel(state,carrier,end,opponents,style={}){
 // Every defender who can reach any part of the carry (not just its start) can engage.
 const reachOf=d=>{const g=laneGeometry(carrier,end,d),gap=g.along<0?distance(d,carrier):g.along>g.len?distance(d,end):g.perp;return{g,gap};};
 const defenders=(opponents||opposing(state,carrier.teamNumber)).filter(p=>p.role!=="GK"&&reachOf(p).gap<=TACKLE_RADIUS_M);
 let def=null,access=0,close=0;
 defenders.forEach(d=>{const {g,gap}=reachOf(d),angle=g.along>0?1:g.along>-1.5?.62:.35;if(gap<=3.5)close++;
  // A defender this carrier has just beaten is still recovering and cannot immediately tackle him again.
  const reach=(Math.pow(Math.max(0,1-gap/TACKLE_RADIUS_M),.8)*angle+(gap<2.5?.25:0))*(1-.6*beatenSeverity(state,d,carrier));
  if(!def||reach>access||(reach===access&&distance(d,carrier)<distance(def,carrier))){def=d;access=Math.min(1,reach);}});
 // DRI and SPD oppose the engaging defender's DEF on the same 75-centred scale; extra bodies in the path add risk.
 let advantage=(effective(carrier,"dri")-75)*.60+(effective(carrier,"spd")-75)*.40-(def?(effective(def,"def")-75)*.50:0)-Math.max(0,close-1)*8;
 // Character contests change the duel itself, never the outcome directly:
 // Machine Dribble protects the ball with economical touches; physical players shield or barge;
 // a man-marker is tighter on his assigned target; a feint makes a poor reader hesitate (less access).
 const power=kitAbility(carrier,"power-dribble"),shield=kitAbility(carrier,"physical-shield"),creative=kitAbility(carrier,"creative-dribble");
 if(power)advantage+=kitParamP(carrier,power,"protection",5);if(shield)advantage+=kitParamP(carrier,shield,"shield",6);
 if(def){const dShield=kitAbility(def,"physical-shield"),mm=kitAbility(def,"man-marking");if(dShield)advantage-=kitParamP(def,dShield,"shield",6)*.5;
  if(mm&&def.markTarget&&def.markTarget.id===idOf(carrier.id))advantage-=kitParamP(def,mm,"duel",4);
  const aggro=kitAbility(def,"aggression");if(aggro)advantage-=kitParamP(def,aggro,"duel",3);}
 // Sprint momentum: at full speed a straight carry into open grass is a footrace (SPD matters more),
 // while turning sharply at speed costs control. A pushed ball can always get away from him.
 const mom=kitAbility(carrier,"sprint-momentum"),speed=mom?sprintMomentum(carrier):0;
 if(mom&&style.push){advantage+=(effective(carrier,"spd")-effective(carrier,"dri"))*.3+speed*kitParamP(carrier,mom,"race",5);}
 if(mom&&style.sharp&&speed>.4&&!style.cut)advantage-=6*speed;
 let hesitation=0;if(creative&&def){hesitation=kitParamP(carrier,creative,"feint",.12)*(style.sharp?1.6:1)*clamp((1.02-battleAwareness(def).defensiveRead)*1.8,0,1);access*=1-hesitation;}
 const raw=defenders.length===0?1:1-access*(1-sigmoid(advantage/18));
 return{defenders,def,access,hesitation,chance:style.push?Math.min(raw,.9):raw};
}
// Reaching the byline wide of the box is worth something when team-mates are arriving in the box:
// from there a cut-back or a low cross is on (it is still a pass that can be cut out).
function deliveryValue(state,carrier,end){
 const n=carrier.teamNumber,a=aheadM(n,end),wide=Math.abs(end.y-50)*YM;if(a<84||a>103||wide<9||wide>30)return 0;
 const arriving=active(state.teams[n]).filter(m=>m!==carrier&&m.role!=="GK"&&(m.intent&&(m.intent.type==="run"||m.intent.type==="support")&&aheadM(n,m.intent.target)>=PITCH_LENGTH-18||inOpponentBox(n,m))).length;
 return Math.min(2,arriving)*.008;
}
function dribbleOptions(state,carrier){
 const team=state.teams[carrier.teamNumber],n=team.number,t=team.strategy,rivals=opposing(state,n);
 const power=kitAbility(carrier,"power-dribble"),creative=kitAbility(carrier,"creative-dribble"),iso=kitAbility(carrier,"isolation-hunter");
 const stride=dribbleMeters(carrier)*(power?kitParamP(carrier,power,"stride",1.2):1),slump=dribbleSlump(state,carrier);
 const a=aheadM(n,carrier),goal=targetGoal(n),baseAngle=a>68?Math.atan2((goal.y-carrier.y)*YM,Math.abs(goal.x-carrier.x)*XM):0,tempo=(t.tempo-50)/50,direct=(t.directness-50)/50,out=[];
 // Angles: a direct runner keeps to the straight lines; a creative dribbler adds sharp cuts;
 // a wide player in the final third can also take the touchline route towards the byline.
 // Preferred shooting zone (kit "zone-finish"): carries that end inside it are worth a little more.
 const zone=kitAbility(carrier,"zone-finish"),zoneValue=end=>zone&&inFinishZone(n,end,zone)?kitParamP(carrier,zone,"approach",.012):0;
 let degs=[-60,-38,-18,0,18,38,60];if(power)degs=degs.filter(d=>Math.abs(d)<=38);if(creative)degs=degs.concat(kitParamP(carrier,creative,"cuts",[-84,84]));
 if(a>68&&Math.abs(carrier.y-50)*YM>13&&a<97)degs.push(-baseAngle*180/Math.PI);
 // Shielding: with a defender squared up in front, turning away to keep the ball is an option too
 // (possession is kept for support to arrive instead of forcing a duel he is unlikely to win).
 if(!power&&rivals.some(d=>d.role!=="GK"&&distance(d,carrier)<5&&aheadM(n,d)>a)&&!active(team).some(m=>m!==carrier&&m.role!=="GK"&&distance(m,carrier)<18))degs.push(140,-140);
 degs.forEach(deg=>{
  const angle=baseAngle+deg*Math.PI/180,end=shiftM(carrier,Math.cos(angle)*stride,Math.sin(angle)*stride,n);if(distance(end,carrier)<stride*.7)return;
  const sharp=Math.abs(deg)>=70,model=dribbleModel(state,carrier,end,rivals,{sharp}),space=Math.min(12,nearestOpponentM(state,n,end,rivals)),progressGain=Math.max(0,aheadM(n,end)-a);
  const ego=tempo*.018+(isFlowing(carrier)?.008:0)+progressGain*direct*.00055;
  // Monster Instinct: one defender, space behind him; the duel is worth taking on.
  const isolated=iso&&model.def&&model.defenders.length===1&&space>=4?kitParamP(carrier,iso,"value",.01):0;
  out.push({type:"dribble",end,model,sharp,value:model.chance*.85*(positionValue(state,carrier,end,rivals)+space*.0015+deliveryValue(state,carrier,end))-(1-model.chance)*lossCost(n,carrier)+ego+isolated-slump*.005+zoneValue(end)});
 });
 // No-Break Dribble: with open grass ahead the ball is knocked on and chased (a longer carry decided by pace).
 const push=kitAbility(carrier,"push-dribble"),mom=kitAbility(carrier,"sprint-momentum"),speed=mom?sprintMomentum(carrier):0;
 if(push)[-14,0,14].forEach(deg=>{
  const angle=baseAngle+deg*Math.PI/180,long=stride*kitParamP(carrier,push,"stride",1.5),end=shiftM(carrier,Math.cos(angle)*long,Math.sin(angle)*long,n);
  if(distance(end,carrier)<long*.8||nearestOpponentM(state,n,end,rivals)<kitParam(push,"space",5))return;
  const model=dribbleModel(state,carrier,end,rivals,{push:true}),space=Math.min(12,nearestOpponentM(state,n,end,rivals));
  out.push({type:"dribble",end,model,push:true,stride:long,value:model.chance*.85*(positionValue(state,carrier,end,rivals)+space*.0015)-(1-model.chance)*lossCost(n,carrier)+speed*.006+zoneValue(end)});
 });
 // High-Speed Cut-In: wide and at speed, he can cut inside without the usual loss of control.
 const cut=kitAbility(carrier,"speed-cut");
 if(cut&&speed>=kitParam(cut,"minSpeed",.35)&&Math.abs(carrier.y-50)*YM>10&&a>60){
  const inside=(carrier.y<50?1:-1)*(n===1?1:-1),angle=inside*kitParam(cut,"angle",48)*Math.PI/180,end=shiftM(carrier,Math.cos(angle)*stride,Math.sin(angle)*stride,n);
  if(distance(end,carrier)>=stride*.7){const model=dribbleModel(state,carrier,end,rivals,{sharp:true,cut:true}),space=Math.min(12,nearestOpponentM(state,n,end,rivals));
   out.push({type:"dribble",end,model,sharp:true,cut:true,value:model.chance*.85*(positionValue(state,carrier,end,rivals)+space*.0015)-(1-model.chance)*lossCost(n,carrier)+kitParamP(carrier,cut,"value",.006)+zoneValue(end)});}
 }
 return out;
}
// Evaluate shooting, carrying/dribbling and every pass against the actual
// situation, then add bounded variation among the best few choices only.
function chooseAction(state,carrier){
 const team=state.teams[carrier.teamNumber],n=team.number,options=[],tempo=(team.strategy.tempo-50)/50;
 if(carrier.role!=="GK"){
  const shot=shotModel(state,carrier,false,null,null),aw=battleAwareness(carrier),pride=prideActive(state,carrier);
  if(shot.metres<=40){const egoFull=1+(0.5+tempo*.22+Math.max(0,effective(carrier,"sho")-75)*.008+(isFlowing(carrier)?.15:0))*(aw.tendencies.shoot+(pride?kitParamP(carrier,pride,"shoot",.2):0));
   // Ego makes strikers bolder with half-chances; it does not make hopeless attempts attractive.
   // A speculative long shot gives up a possession that could still be worked into the box: from beyond
   // about 18 m, part of the value of keeping the ball here is weighed against the miss.
   const keep=shot.metres>18?positionValue(state,carrier,point(carrier))*clamp((shot.metres-18)/8,0,1.5)*.6:0;
   const ego=1+(egoFull-1)*clamp((shot.goalChance-.03)/.07,0,1)*clamp((34-shot.metres)/6,0,1),loss=Math.max(0,.5*lossCost(n,carrier)-.005)+keep;
   // Character finishing techniques are alternatives evaluated with the same shot model;
   // Adaptability steers away from an aim the keeper has already dealt with.
   let best=null,plain=null;
   for(const tech of shotTechniques(state,carrier)){
    const chance=tech.aim||tech.logit?shotModel(state,carrier,false,null,null,null,null,tech).goalChance:shot.goalChance,penalty=memoryPenalty(state,carrier,"shot",tech.aimSide||"centre");
    const value=chance*ego-(1-chance)*loss,choice={type:"shot",technique:tech.id==="conventional"?null:tech,chance,value:value-penalty*.05,raw:value,pride:pride||null};
    if(!best||choice.value>best.value)best=choice;if(!plain||choice.raw>plain.raw)plain=choice;
   }
   if(best.technique&&plain!==best)best.adapted=true;
   options.push(best);}
  options.push(...dribbleOptions(state,carrier).map(o=>({...o,value:o.value+aw.tendencies.dribble*.08})));
  // Malicia: inviting the challenge is an option only when a defender is actually closing in.
  const mal=maliciaRead(state,carrier);
  if(mal){const where=point(carrier),here=positionValue(state,carrier,where),fk=here*.9+(aheadM(n,carrier)>70?.012:.005);
   options.push({type:"malicia",read:mal,value:mal.foul*fk+mal.keep*here*.85-(mal.lose+mal.dive)*lossCost(n,carrier)+kitParamP(carrier,mal.ability,"preference",.012)});}
 }
 // Possession intent: a long spell of passing without progress makes recycling less attractive
 // (an exhausted attack still recycles if nothing better exists); a fresh turnover with space ahead
 // makes forward passes attractive (a counter-attack).
 const chain=state.chainTeam===n?Number(state.chain)||0:0,urgency=aheadM(n,carrier)<68?clamp((chain-3)/6,0,1):0;
 const ahead=aheadM(n,carrier),blockers=opposing(state,n).filter(o=>o.role!=="GK"&&aheadM(n,o)>ahead).length,counter=chain<=2&&blockers<=4&&ahead<70;
 passOptions(state,carrier,{}).forEach(o=>{const at=o.model.valueAt||o.to,fwd=aheadM(n,at)-ahead;options.push({type:"pass",option:o,value:o.value-(fwd<-2?urgency*.006:fwd<4?urgency*.003:0)+(counter&&fwd>8?.006:0)+(fwd>6&&ahead>=50&&aheadM(n,at)>=70?.008:0)});});
 if(!options.length)return null;options.sort((a,b)=>b.value-a.value);
 // Rational Football: an efficient decision-maker picks the best option more consistently.
 const rational=kitAbility(carrier,"rational-decisions"),sharpness=rational?kitParamP(carrier,rational,"sharpness",.45):0;
 const top=options.slice(0,4),vision=clamp((effective(carrier,"pas")+effective(carrier,"off")-100)/100,0,1),tau=(.006+.009*(1-vision))*(1-sharpness);
 const weights=top.map(o=>Math.exp((o.value-top[0].value)/tau)),total=weights.reduce((a,b)=>a+b,0);
 let roll=state.random()*total;for(let i=0;i<top.length;i++){roll-=weights[i];if(roll<=0)return top[i];}return top[0];
}
function looseBallWinner(state,where,rand){
 let best=null,bestTime=Infinity;
 [1,2].forEach(n=>active(state.teams[n]).forEach(p=>{
  if(p.role==="GK"&&!inOpponentBox(n===1?2:1,where))return;
  const time=distance(p,where)/runSpeed(p,state)-(effective(p,n===state.possession?"off":"def",state)-70)*.01+rand()*.8;
  if(time<bestTime){bestTime=time;best=p;}
 }));
 return best;
}
function resolvePass(state,carrier,opts={}){
 if(opts.setPiece)state.lastSetPieceTick=Number(state.tick);
 const team=state.teams[carrier.teamNumber],opp=state.teams[team.number===1?2:1];
 let option=opts.option||null;
 if(!option&&opts.receiverId){const r=active(team).find(p=>idOf(p.id)===idOf(opts.receiverId)&&p.id!==carrier.id);
  if(r){const to=point(r),kind=opts.passKind||passKindFor(distance(opts.fromPoint||carrier,r));option={receiver:r,to,kind,through:false,model:passModel(state,carrier,r,to,kind,opts)};}}
 if(!option){
  // Requested kinds (kick-off, set pieces) filter by real distance; labels follow the chosen pass.
  const base={...opts,passKind:undefined};let options=passOptions(state,carrier,{...base,kindFilter:opts.passKind});
  if(!options.length)options=passOptions(state,carrier,base);
  if(options.length)option=options.sort((a,b)=>b.value-a.value)[0];
 }
 if(!option){moveToward(carrier,targetGoal(team.number),movementMeters(carrier)*.6);setBall(state,carrier);addEvent(state,{type:"carry",teamNumber:team.number,description:carrier.name+" carries the ball.",actors:[carrier]});return;}
 if(option.through){resolveThroughBall(state,carrier,option,opts);return;}
 const receiver=option.receiver,kind=option.kind,model=option.model;
 const from=model.from,to=model.to,metres=model.len,chance=model.success,route={kind,from,to,chemistry:model.chem};
 if(model.offside){awardOffside(state,carrier,receiver,route);return;}
 const roll=state.random();team.stats.attempted++;carrier.match.passesAttempted++;if(option.style==="cutback")team.stats.cutbacks=(team.stats.cutbacks||0)+1;
 const extras=opts.setPiece||opts.kickoff?{}:passExtras(state,carrier,option);
 const statLabel=opts.goalKick&&carrier.role==="GK"?"GK":"PAS";
 // The feed lists defenders near either end plus anyone who could reach the lane or contest the
 // reception; the highlighted defender is the one who acted, or otherwise the biggest threat.
 const threat=[...model.lanes,...model.contests].sort((a,b)=>b.chance-a.chance)[0];
 const likely=threat?threat.p:model.involved.slice().sort((a,b)=>Math.min(distance(a,from),distance(a,to))-Math.min(distance(b,from),distance(b,to)))[0]||null;
 const feed=selected=>defenderFeedDetails(model.involved,[from,to],selected||likely);
 const comparison=defender=>({attackerLabel:statLabel,attackerValue:model.pas,defenderLabel:"DEF",defenderValue:defender?effective(defender,"def"):60});
 if(roll<chance){
  drain(carrier,true,"pass");addPoints(carrier,option.through?.06:.035);team.stats.passes++;carrier.match.passes++;
  setBall(state,receiver);state.carrierId=receiver.id;state.possession=team.number;state.lastPasser=carrier.id;
  recordReception(state,carrier,receiver,{kind,from,to,through:false,style:option.style});
  if(option.style==="cutback")team.stats.cutbacksCompleted=(team.stats.cutbacksCompleted||0)+1;
  addEvent(state,{type:opts.setPiece?"set-piece":"pass",teamNumber:team.number,notable:true,
   description:carrier.name+(option.style==="cutback"?" cuts the ball back ":option.through?" threads a through ball ":kind==="long"?" launches a long ball ":" passes ")+Math.round(metres)+"m to "+receiver.name+".",
   comparison:comparison(likely),probability:chance,probabilityLabel:"PASS SUCCESS",actors:[carrier,receiver],passRoute:route,nearbyDefenders:feed(null),...extras});
  return;
 }
 drain(carrier,false,"pass");team.stats.turnovers++;state.lastPasser=null;
 // The failure type follows the same probabilities that produced the success chance.
 const laneFail=1-model.lanes.reduce((s,l)=>s*(1-l.chance),1),contestFail=1-model.contests.reduce((s,c)=>s*(1-c.chance),1);
 const wError=model.error,wLane=(1-model.error)*laneFail,wContest=(1-model.error)*(1-laneFail)*contestFail,total=wError+wLane+wContest||1;
 let v=(roll-chance)/Math.max(1e-9,1-chance)*total;
 if(v<wLane&&model.lanes.length){
  let pick=model.lanes[model.lanes.length-1],acc=0,survive=1;for(const l of model.lanes){acc+=survive*l.chance;survive*=1-l.chance;if(v/wLane*laneFail<=acc){pick=l;break;}}
  const interceptor=pick.p;setPosition(interceptor,lerpPoint(from,to,clamp(pick.along/Math.max(.001,metres),0,1)));
  addPoints(carrier,-.12);learn(state,carrier,"lane",laneBucket(from,to),interceptor);interceptor.match.interceptions++;addPoints(interceptor,.16);opp.stats.interceptions++;
  // Marking that changes the attack is credited: the marker cut out a ball meant for his assigned man.
  const markKit=kitAbility(interceptor,"man-marking"),markWin=markKit&&interceptor.markTarget&&interceptor.markTarget.id===idOf(receiver.id);
  if(markWin){addPoints(interceptor,.08);interceptor.match.markWins=(interceptor.match.markWins||0)+1;}
  let markChip=markWin?chipOnce(state,interceptor,markKit,"weapon",4):undefined,markLine=markChip?kitLine(state,interceptor,markKit.dialogue||"mark",false):null;
  if(pick.rx&&reactionReady(state,pick.rx.def,pick.rx.owner.teamNumber)){useReaction(state,pick.rx.def,pick.rx.owner.teamNumber);markChip=abilityBadge(pick.rx.def,"reaction");markLine=kitLine(state,pick.rx.owner,pick.rx.def.dialogue||"trap",false);addPoints(pick.rx.owner,.06);}
  state.possession=opp.number;state.carrierId=interceptor.id;setBall(state,interceptor);
  addEvent(state,{type:"interception",teamNumber:opp.number,notable:true,ability:markChip,dialogue:markLine?[markLine]:undefined,description:interceptor.name+" reads the lane and cuts out "+carrier.name+"'s "+(option.through?"through":kind)+" pass.",
   comparison:comparison(interceptor),probability:1-chance,probabilityLabel:"INTERCEPTION CHANCE",actors:[carrier,interceptor],passRoute:route,nearbyDefenders:feed(interceptor)});
  return;
 }
 v-=wLane;
 if(v<wContest&&model.contests.length){
  const first=model.contests[0],winner=model.contests.length>1&&v/wContest>first.chance/(contestFail||1)?model.contests[1].p:first.p;
  moveToward(winner,to,movementMeters(winner));addPoints(carrier,-.1);addPoints(receiver,-.04);
  // A marker who denies his own man the reception is credited (the attack actually stopped).
  if(kitAbility(winner,"man-marking")&&winner.markTarget&&winner.markTarget.id===idOf(receiver.id)){addPoints(winner,.06);winner.match.markWins=(winner.match.markWins||0)+1;}
  state.possession=opp.number;state.carrierId=winner.id;setBall(state,winner);
  if(kind==="long"||option.through){
   winner.match.interceptions++;addPoints(winner,.14);opp.stats.interceptions++;
   addEvent(state,{type:"interception",teamNumber:opp.number,notable:true,description:winner.name+" beats "+receiver.name+" to "+carrier.name+"'s "+(option.through?"through ball":"long ball")+".",
    comparison:comparison(winner),probability:1-chance,probabilityLabel:"INTERCEPTION CHANCE",actors:[carrier,receiver,winner],passRoute:route,nearbyDefenders:feed(winner)});
  }else{
   winner.match.tackles++;addPoints(winner,.14);opp.stats.tackles++;
   addEvent(state,{type:"turnover",teamNumber:opp.number,notable:true,description:winner.name+" challenges "+receiver.name+" on the first touch and wins the ball.",
    comparison:comparison(winner),probability:1-chance,probabilityLabel:"TACKLE WIN",actors:[carrier,winner,receiver],passRoute:route,nearbyDefenders:feed(winner)});
  }
  return;
 }
 // Misplaced: the ball runs loose and the quickest player to the landing spot collects it.
 const errorM=3+metres*.18,angle=state.random()*Math.PI*2,raw={x:to.x+Math.cos(angle)*errorM/XM,y:to.y+Math.sin(angle)*errorM/YM};
 if(raw.x<PITCH_LINE_X||raw.x>100-PITCH_LINE_X||raw.y<PITCH_LINE_Y||raw.y>100-PITCH_LINE_Y){addPoints(carrier,-.1);ballOutOfPlay(state,carrier,receiver,raw,route);return;}
 const landing={x:clamp(raw.x,3,97),y:clamp(raw.y,6,94)};
 const winner=looseBallWinner(state,landing,state.random)||receiver;
 moveToward(winner,landing,movementMeters(winner)*1.4);setBall(state,winner);state.carrierId=winner.id;state.possession=winner.teamNumber;addPoints(carrier,-.1);
 if(winner.teamNumber===team.number){
  team.stats.turnovers--;addPoints(winner,.04);
  addEvent(state,{type:"rebound",teamNumber:team.number,notable:true,description:carrier.name+"'s pass to "+receiver.name+" is loose, but "+winner.name+" recovers it.",
   comparison:comparison(null),probability:chance,probabilityLabel:"PASS SUCCESS",actors:[winner,carrier],passRoute:route,nearbyDefenders:feed(null)});
 }else{
  addPoints(winner,.06);
  addEvent(state,{type:"turnover",teamNumber:opp.number,notable:true,description:carrier.name+"'s pass to "+receiver.name+" goes astray and "+winner.name+" collects it.",
   comparison:comparison(winner),probability:chance,probabilityLabel:"PASS SUCCESS",actors:[carrier,winner],passRoute:route,nearbyDefenders:feed(winner)});
 }
}
/* v0.8.8.4 restarts. Pitch lines match the rendered field (26..1024 x 22..658 of 1050 x 680). */
const PITCH_LINE_X=26/10.5,PITCH_LINE_Y=22/6.8;
function awardOffside(state,carrier,receiver,route){
 const team=state.teams[carrier.teamNumber],opp=state.teams[team.number===1?2:1],spot={x:clamp(receiver.x,3,97),y:clamp(receiver.y,5,95)};
 team.stats.attempted++;carrier.match.passesAttempted++;team.stats.turnovers++;team.stats.offsides=(Number(team.stats.offsides)||0)+1;addPoints(receiver,-.05);addPoints(carrier,-.03);learn(state,receiver,"line",0,null);receiver.intent=null;
 const restart=active(opp).filter(p=>p.role!=="GK").sort((a,b)=>distance(a,spot)-distance(b,spot))[0]||keeper(opp);
 state.pending={type:"free-kick",teamNumber:opp.number,zone:zoneAt(spot),point:spot,takerId:null,offside:true,
  freeKickType:distance(spot,targetGoal(opp.number))>40?"midfield":"attacking",routine:"short-pass"};
 state.lastPasser=null;state.possession=opp.number;state.carrierId=restart?restart.id:null;setBall(state,spot);
 addEvent(state,{type:"offside",teamNumber:opp.number,notable:true,description:receiver.name+" is caught offside from "+carrier.name+"'s pass. Free kick to "+opp.name+".",actors:[receiver,carrier],passRoute:route});
 pause(state,"OFFSIDE");
}
// The passer's team touched it last: throw-in over a touchline, goal kick or corner over a byline.
function ballOutOfPlay(state,carrier,receiver,raw,route){
 const team=state.teams[carrier.teamNumber],opp=state.teams[team.number===1?2:1],n=team.number;state.lastPasser=null;
 if(raw.y<PITCH_LINE_Y||raw.y>100-PITCH_LINE_Y){
  const side=raw.y<50?5:95,spot={x:clamp(raw.x,4,96),y:side};
  const taker=active(opp).filter(p=>p.role!=="GK").sort((a,b)=>distance(a,spot)-distance(b,spot))[0];
  if(taker)setPosition(taker,spot);
  state.possession=opp.number;state.carrierId=taker?taker.id:null;setBall(state,spot);state.throwInPending=!!taker;
  addEvent(state,{type:"throw-in",teamNumber:opp.number,notable:true,description:carrier.name+"'s pass to "+receiver.name+" runs out of play. Throw-in to "+opp.name+".",actors:taker?[carrier,taker]:[carrier],passRoute:route});
  return;
 }
 const beyondAttack=n===1?raw.x>50:raw.x<50;
 if(beyondAttack){
  const spot=ownGoal(opp.number);state.pending={type:"goal-kick",teamNumber:opp.number,zone:zoneAt(spot),point:spot,takerId:null,goalKickTaker:"gk",routine:"short"};
  state.possession=opp.number;state.carrierId=null;setBall(state,spot);
  addEvent(state,{type:"goal-kick",teamNumber:opp.number,notable:true,description:carrier.name+"'s pass runs out of play. Goal kick for "+opp.name+".",actors:[carrier],passRoute:route});pause(state,"GOAL KICK");return;
 }
 const spot={x:opp.number===1?98:2,y:raw.y<50?3:97};opp.stats.corners++;
 state.pending={type:"corner",teamNumber:opp.number,zone:zoneAt(spot),point:spot,takerId:null,routine:"cross"};
 state.possession=opp.number;state.carrierId=null;setBall(state,spot);
 addEvent(state,{type:"corner",teamNumber:opp.number,notable:true,description:carrier.name+"'s pass runs behind his own goal line. Corner to "+opp.name+".",actors:[carrier],passRoute:route});pause(state,"CORNER");
}
/* v0.8.9 through balls: a physical race between the ball, the intended runner, defenders and the
   keeper. The ball is struck to arrive at running pace and then decelerates (or, if lofted, is only
   playable at take-off and on the drop). Every player has a sprint speed and acceleration from SPD and
   a reaction delay; a primed runner starts on the move, defenders turning to chase a ball played
   behind them react later. Whoever can first physically reach the ball's path wins it; nobody is
   moved further than they could run in the ball's travel time. Distances are virtual-pitch metres. */
const BALL_ROLL_DECEL=1.7,THROUGH_ARRIVAL_SPEED=6.5,LOFTED_SPEED=19,CONTROL_RADIUS_M=1.1,KEEPER_REACH_M=1.9,THROUGH_STEP_M=1.5;
function sprintSpeed(p,state=match){return 4.3+effective(p,"spd",state)*.048;}  // metres per second (SPD 60 ≈ 7.2, 90 ≈ 8.6)
function sprintAccel(p,state=match){return 3.9+effective(p,"spd",state)*.02;}   // metres per second²
function timeToCover(dist,vmax,acc,v0=0){
 dist=Math.max(0,dist);v0=Math.min(Math.max(0,v0),vmax);
 const ta=(vmax-v0)/acc,da=(v0+vmax)/2*ta;
 return dist<=da?(-v0+Math.sqrt(v0*v0+2*acc*dist))/acc:ta+(dist-da)/vmax;
}
function distanceCovered(time,vmax,acc,v0=0){
 if(time<=0)return 0;v0=Math.min(Math.max(0,v0),vmax);const ta=(vmax-v0)/acc;
 return time<=ta?v0*time+.5*acc*time*time:(v0+vmax)/2*ta+(time-ta)*vmax;
}
function outsidePitchLines(q){return q.x<PITCH_LINE_X||q.x>100-PITCH_LINE_X||q.y<PITCH_LINE_Y||q.y>100-PITCH_LINE_Y;}
// Ball path sampled every 1.5 m: {s, t, x, y}. pace scales the strike (1 = as intended); angle in radians.
function ballFlight(from,to,kind,pace=1,angle=0){
 const a=point(from),b=point(to),dx=(b.x-a.x)*XM,dy=(b.y-a.y)*YM,d=Math.max(.5,Math.hypot(dx,dy));
 let ux=dx/d,uy=dy/d;if(angle){const c=Math.cos(angle),s=Math.sin(angle);[ux,uy]=[ux*c-uy*s,ux*s+uy*c];}
 const at=s=>({x:a.x+ux*s/XM,y:a.y+uy*s/YM}),points=[];let exit=null;
 if(kind==="long"){
  const land=d*pace,flight=land/LOFTED_SPEED+.45,roll=8,decel=2.6,rollStop=roll*roll/(2*decel);
  for(let s=THROUGH_STEP_M;s<=land+rollStop;s+=THROUGH_STEP_M){
   const q=at(s),air=s<land,t=air?s/land*flight:flight+(roll-Math.sqrt(Math.max(0,roll*roll-2*decel*(s-land))))/decel;
   if(outsidePitchLines(q)&&(!air||s>=land-1)){exit={s,t,...q};break;}
   if(air&&s>2.5&&s<land-4)continue;   // out of reach while it is in the air
   points.push({s,t,...q});
  }
 }else{
  const v0=Math.min(24,Math.sqrt(THROUGH_ARRIVAL_SPEED*THROUGH_ARRIVAL_SPEED+2*BALL_ROLL_DECEL*d))*pace,stop=Math.min(80,v0*v0/(2*BALL_ROLL_DECEL));
  for(let s=THROUGH_STEP_M;s<=stop;s+=THROUGH_STEP_M){
   const q=at(s),t=(v0-Math.sqrt(Math.max(0,v0*v0-2*BALL_ROLL_DECEL*s)))/BALL_ROLL_DECEL;
   if(outsidePitchLines(q)){exit={s,t,...q};break;}
   points.push({s,t,...q});
  }
 }
 return{from:a,points,exit,stop:exit?null:points.at(-1)||{s:0,t:0,...a}};
}
// Reaction and starting speed for one racer. Abilities change anticipation, never speed limits.
function raceProfile(state,p,role,flight,receiverRun){
 const vmax=sprintSpeed(p,state),acc=sprintAccel(p,state),aware=battleAwareness(p);
 if(role==="receiver"){
  const primed=!!receiverRun;
  // Sprint momentum: a runner already at speed starts the race faster (never above his top speed).
  const mom=kitAbility(p,"sprint-momentum"),carry=mom?sprintMomentum(p)*kitParamP(p,mom,"carry",.35):0;
  return{vmax,acc,v0:primed?vmax*Math.min(.95,.55+carry):vmax*carry*.6,reaction:Math.max(0,(primed?.02:.24)-aware.anticipation*.08)};
 }
 if(role==="keeper")return{vmax:vmax*.92,acc,v0:0,reaction:.22};
 // A defender chasing a ball played in behind him has to turn first.
 const own=ownGoal(p.teamNumber),end=flight.points.at(-1)||flight.from,behind=distance(end,own)<distance(p,own)-1;
 return{vmax,acc,v0:0,reaction:Math.max(.08,.3+.3*beatenSeverity(state,p)+(behind?.16:0)+(receiverRun&&receiverRun.blindSpot&&!tracksRun(p,{intent:receiverRun})?.12:0)-(effective(p,"def",state)-70)*.004-aware.anticipation*.08)};
}
function throughRace(state,carrier,receiver,to,kind,opts={}){
 const n=carrier.teamNumber,flight=ballFlight(opts.fromPoint||carrier,to,kind,opts.pace??1,opts.angle??0),noise=opts.noise||null;
 const run=receiverRunFor(receiver,to),racers=[];
 const consider=(p,role)=>{
  const prof=raceProfile(state,p,role,flight,run);prof.reaction=Math.max(0,prof.reaction+(noise?noise(p):0));
  const reach=role==="keeper"?KEEPER_REACH_M:CONTROL_RADIUS_M;let meet=null;
  for(const q of flight.points){
   if(role==="keeper"&&(distance(q,ownGoal(p.teamNumber))>30||(!inOpponentBox(n,q)&&distance(q,p)>12)))continue;
   const need=prof.reaction+timeToCover(distance(p,q)-reach,prof.vmax,prof.acc,prof.v0);
   if(need<=q.t){meet={...q,slack:q.t-need};break;}
  }
  racers.push({p,role,side:role==="receiver"?"attack":"defend",prof,meet,start:point(p)});
 };
 consider(receiver,"receiver");
 opposing(state,n).forEach(o=>{if(o.role==="GK")consider(o,"keeper");else if(distance(o,to)<40||distance(o,carrier)<25)consider(o,"defender");});
 const meets=racers.filter(r=>r.meet).sort((a,b)=>a.meet.t-b.meet.t||b.meet.slack-a.meet.slack);
 const recv=racers[0],bestDefender=meets.find(r=>r.side==="defend")||null;
 let outcome,winner=null,rival=null;
 if(meets.length){
  winner=meets[0];rival=meets.find(r=>r.side!==winner.side)||null;
  outcome=winner.side==="attack"?"receiver":winner.role==="keeper"?"keeper":"defender";
  // A cross hangs in the air: players arriving within ~0.45 s of each other contest it in the air.
  if(rival&&rival.meet.t-winner.meet.t<(opts.aerial&&winner.role!=="keeper"&&rival.role!=="keeper"?.45:.18))outcome="contested";
 }else outcome=flight.exit?"out":"loose";
 return{flight,racers,winner,rival,outcome,receiver:recv,bestDefender,
  receiverTime:recv.meet?recv.meet.t:Infinity,defenderTime:bestDefender?bestDefender.meet.t:Infinity,run:!!run};
}
// The receiver is "primed" when his current run is already heading where the ball is played.
function receiverRunFor(receiver,to){
 const intent=receiver&&receiver.intent;
 if(!intent||intent.type!=="run"||!intent.primed)return null;
 const dir=intent.dir||{x:1,y:0},dx=(to.x-receiver.x)*XM,dy=(to.y-receiver.y)*YM,len=Math.hypot(dx,dy)||1;
 return (dx*dir.x+dy*dir.y)/len>.8?intent:null;
}
// Expected outcome for decisions: the same race without execution error, converted to a probability
// with the spread that pace/direction error and reactions produce for this passer.
// Expected outcome for decisions: the same race evaluated for an under-hit, true and over-hit
// strike (the passer's pace spread), each converted to a probability with the reaction spread.
// The value is taken where the runner would actually meet the ball, not where it was aimed.
// Aerial contest for a cross: timing (who attacks the ball first, a runner arrives with momentum)
// and a heading proxy from the ratings (no height data exists): striking intent, defending, power.
function aerialSkill(state,p,attacking){const phys=kitAbility(p,"physical-shield");return effective(p,attacking?"off":"def",state)*.45+effective(p,"sho",state)*(attacking?.2:0)+effective(p,"def",state)*(attacking?.1:.25)+effective(p,"spd",state)*.2+(phys?kitParamP(p,phys,"aerial",4):0);}
function aerialDuel(state,attacker,defender,lead,running){return clamp(sigmoid(lead/.22+(aerialSkill(state,attacker,true)-aerialSkill(state,defender,false))/10+(running?.35:0)-.25),.03,.92);}
function throughBallEstimate(state,carrier,receiver,to,kind,opts){
 const pas=passingSkill(state,carrier,opts),pressure=(opts.opponents||opposing(state,carrier.teamNumber)).filter(o=>o.role!=="GK"&&distance(o,carrier)<=4).length;
 const paceSpread=(.05+(1-pas/100)*.22+pressure*.04)*(opts.precision||1),cases=[[1-paceSpread*1.2,.25],[1,.5],[1+paceSpread*1.2,.25]];
 let chance=0,race=null;
 for(const [pace,weight] of cases){
  const r=throughRace(state,carrier,receiver,to,kind,{fromPoint:opts.fromPoint,pace,aerial:opts.aerial});if(pace===1)race=r;
  const def=r.bestDefender,keeperFirst=def&&def.role==="keeper"&&r.defenderTime<r.receiverTime;
  const p=r.receiverTime===Infinity?0:r.defenderTime===Infinity?.97:opts.aerial&&!keeperFirst?aerialDuel(state,receiver,def.p,r.defenderTime-r.receiverTime,!!r.run):sigmoid(1.7*(r.defenderTime-r.receiverTime)/.16);
  chance+=weight*p;
 }
 const meet=race.receiver.meet;
 return{race,chance:clamp(chance,.02,.95),meet:meet?{x:meet.x,y:meet.y}:point(to)};
}
function resolveThroughBall(state,carrier,option,opts={}){
 const team=state.teams[carrier.teamNumber],opp=state.teams[team.number===1?2:1],receiver=option.receiver,kind=option.kind,model=option.model;
 const intended=point(option.to);
 if(model.offside){awardOffside(state,carrier,receiver,{kind,from:model.from,to:intended,chemistry:model.chem});return;}
 team.stats.attempted++;carrier.match.passesAttempted++;if(option.style==="cross")team.stats.crosses=(team.stats.crosses||0)+1;
 const extras=passExtras(state,carrier,option);
 // Execution: pace and direction error from PAS and pressure (a synchronised partner is more precise).
 const pas=passingSkill(state,carrier,opts),pressure=opposing(state,team.number).filter(o=>o.role!=="GK"&&distance(o,carrier)<=4).length,precision=option.precision||opts.precision||1;
 const gauss=()=>(state.random()+state.random()+state.random()-1.5)*2;
 const pace=1+gauss()*(.05+(1-pas/100)*.22+pressure*.04)*precision,angle=gauss()*(.02+(1-pas/100)*.07)*precision;
 const reactions=new Map();const noise=p=>{const k=idOf(p.id)+":"+p.teamNumber;if(!reactions.has(k))reactions.set(k,gauss()*.06);return reactions.get(k);};
 const race=throughRace(state,carrier,receiver,intended,kind,{fromPoint:model.from,pace,angle,noise,aerial:option.style==="cross"});
 // Everyone involved runs for the time the ball took to be decided, within their own physical limits.
 const decided=race.winner?race.winner.meet.t:(race.flight.exit||race.flight.stop||{t:2}).t;
 const chase=(r,target)=>{const covered=distanceCovered(decided-r.prof.reaction,r.prof.vmax,r.prof.acc,r.prof.v0);if(covered>0)moveToward(r.p,target,covered);};
 let outcome=race.outcome,winner=race.winner;
 const duelChance=()=>{const rec=race.racers[0],def=race.rival&&race.rival.side==="defend"?race.rival:race.winner.side==="defend"?race.winner:null;if(!def)return 1;
  if(option.style==="cross"&&def.role!=="keeper")return aerialDuel(state,receiver,def.p,(def.meet?def.meet.t:9)-(rec.meet?rec.meet.t:9),race.run);
  const skill=effective(receiver,"off",state)*.45+effective(receiver,"dri",state)*.35+effective(receiver,"spd",state)*.2,guard=effective(def.p,"def",state)*.65+effective(def.p,"spd",state)*.35;
  return sigmoid((skill-guard)/12+((def.meet?def.meet.t:9)-(rec.meet?rec.meet.t:9))/.12);};
 if(outcome==="contested"){const att=race.racers[0];const won=state.random()<duelChance();
  winner=won?att:(race.winner.side==="defend"?race.winner:race.rival);outcome=won?"receiver":winner.role==="keeper"?"keeper":"tackled";}
 const route={kind,from:model.from,to:winner?{x:winner.meet.x,y:winner.meet.y}:race.flight.exit?{x:clamp(race.flight.exit.x,0,100),y:clamp(race.flight.exit.y,0,100)}:{x:race.flight.stop.x,y:race.flight.stop.y},chemistry:model.chem};
 const ballAt=route.to;
 race.racers.forEach(r=>{if(r!==winner)chase(r,r.meet?{x:r.meet.x,y:r.meet.y}:ballAt);});
 const start=point(receiver),ballName=option.style==="cross"?"cross":option.behind?"through ball":"pass into space";
 const involved=race.racers.filter(r=>r.side==="defend"&&r.meet).map(r=>r.p);
 const feed=sel=>defenderFeedDetails(involved.length?involved:model.involved,[model.from,ballAt],sel||(race.bestDefender&&race.bestDefender.p)||null);
 const metres=Math.round(distance(model.from,ballAt)),runM=Math.round(distance(start,ballAt));
 const comparison=d=>({attackerLabel:"PAS",attackerValue:pas,defenderLabel:"DEF",defenderValue:d?effective(d,"def",state):60});
 if(outcome==="receiver"){
  setPosition(receiver,ballAt);receiver.lastMove={x:(ballAt.x-start.x)*XM,y:(ballAt.y-start.y)*YM};drain(carrier,true,"pass");addPoints(carrier,.06);team.stats.passes++;carrier.match.passes++;
  setBall(state,receiver);state.carrierId=receiver.id;state.possession=team.number;state.lastPasser=carrier.id;
  recordReception(state,carrier,receiver,{kind,from:model.from,to:ballAt,through:true,style:option.style});
  if(option.style==="cross")team.stats.crossesCompleted=(team.stats.crossesCompleted||0)+1;
  addEvent(state,{type:"pass",teamNumber:team.number,notable:true,
   description:option.style==="cross"?carrier.name+" crosses "+metres+"m and "+receiver.name+" meets it after a "+runM+"m run.":carrier.name+(option.behind?" threads a through ball ":" plays the ball into space ")+metres+"m into "+receiver.name+"'s run; he reaches it after "+runM+"m.",
   comparison:comparison(race.bestDefender&&race.bestDefender.p),probability:model.success,probabilityLabel:"PASS SUCCESS",actors:[carrier,receiver],
   passRoute:route,runRoute:runM>=2?{from:start,to:ballAt}:null,nearbyDefenders:feed(null),...extras});
  return;
 }
 drain(carrier,false,"pass");team.stats.turnovers++;state.lastPasser=null;addPoints(carrier,-.1);
 if(outcome==="defender"||outcome==="tackled"||outcome==="keeper"){
  const d=winner.p;learn(state,carrier,"lane",laneBucket(model.from,intended),d);setPosition(d,ballAt);state.possession=opp.number;state.carrierId=d.id;setBall(state,d);
  if(outcome==="keeper"){
   d.match.saves=(d.match.saves||0);addPoints(d,.12);
   addEvent(state,{type:"interception",teamNumber:opp.number,notable:true,description:d.name+(inOpponentBox(team.number,ballAt)?" comes off his line and claims ":" sweeps up ")+carrier.name+"'s "+ballName+".",
    comparison:{attackerLabel:"PAS",attackerValue:pas,defenderLabel:"GK",defenderValue:effective(d,"gk",state)},probability:1-model.success,probabilityLabel:"INTERCEPTION CHANCE",actors:[carrier,d],passRoute:route,runRoute:runM>=2?{from:start,to:point(receiver)}:null,nearbyDefenders:feed(d)});
   d.match.interceptions++;opp.stats.interceptions++;return;
  }
  if(outcome==="tackled"){d.match.tackles++;opp.stats.tackles++;addPoints(d,.14);
   addEvent(state,{type:"turnover",teamNumber:opp.number,notable:true,description:d.name+" arrives with "+receiver.name+" and wins the "+ballName+".",
    comparison:comparison(d),probability:1-model.success,probabilityLabel:"TACKLE WIN",actors:[carrier,d,receiver],passRoute:route,runRoute:runM>=2?{from:start,to:point(receiver)}:null,nearbyDefenders:feed(d)});return;}
  d.match.interceptions++;opp.stats.interceptions++;addPoints(d,.16);
  addEvent(state,{type:"interception",teamNumber:opp.number,notable:true,description:d.name+" reads the "+ballName+" and gets there before "+receiver.name+".",
   comparison:comparison(d),probability:1-model.success,probabilityLabel:"INTERCEPTION CHANCE",actors:[carrier,d],passRoute:route,runRoute:runM>=2?{from:start,to:point(receiver)}:null,nearbyDefenders:feed(d)});
  return;
 }
 if(outcome==="out"){ballOutOfPlay(state,carrier,receiver,{x:race.flight.exit.x,y:race.flight.exit.y},route);return;}
 // Nobody reached it in motion: it stops, and the first player to arrive collects it.
 const stop=race.flight.stop,arrivals=[...active(team).filter(p=>p.role!=="GK"),...active(opp)].map(p=>{const prof=p===receiver?race.racers[0].prof:{vmax:sprintSpeed(p,state),acc:sprintAccel(p,state),v0:0,reaction:.3};return{p,t:Math.max(stop.t,prof.reaction+timeToCover(distance(p,stop)-CONTROL_RADIUS_M,prof.vmax,prof.acc,prof.v0))};}).sort((a,b)=>a.t-b.t);
 const first=arrivals[0].p;setPosition(first,stop);setBall(state,first);state.carrierId=first.id;state.possession=first.teamNumber;
 if(first.teamNumber===team.number){team.stats.turnovers--;addEvent(state,{type:"rebound",teamNumber:team.number,notable:true,description:carrier.name+"'s "+ballName+" runs past "+receiver.name+", but "+first.name+" collects it.",probability:model.success,probabilityLabel:"PASS SUCCESS",actors:[first,carrier],passRoute:route,nearbyDefenders:feed(null)});}
 else addEvent(state,{type:"turnover",teamNumber:opp.number,notable:true,description:carrier.name+"'s "+ballName+" runs out of "+receiver.name+"'s reach; "+first.name+" collects it.",probability:model.success,probabilityLabel:"PASS SUCCESS",actors:[carrier,first],passRoute:route,nearbyDefenders:feed(first)});
}
// The last completed reception: who received, from whom, when and how (used for first-time finishing).
function recordReception(state,passer,receiver,info){state.lastReception={playerId:idOf(receiver.id),teamNumber:receiver.teamNumber,passerId:idOf(passer.id),tick:Number(state.tick)||0,kind:info.kind,through:!!info.through,...(info.style?{style:String(info.style)}:{}),from:point(info.from),to:point(info.to)};}
// Malicia outcome: foul awarded, possession kept, a booking for simulation, or the ball lost.
function resolveMalicia(state,carrier,read){
 const team=state.teams[carrier.teamNumber],opp=state.teams[team.number===1?2:1],d=read.defender,roll=state.random(),nearby=defenderFeedDetails([d],[carrier],d);
 const trap=read.trap,label=trap?abilityBadge(trap,"weapon"):abilityBadge(read.ability,"weapon"),st=abilityState(carrier);
 if(trap)st.cooldowns[trap.id]=Number(state.tick)+Math.max(1,Number(kitParam(trap,"cooldownTicks",8)));
 carrier.match.malicia=(carrier.match.malicia||0)+1;
 if(roll<read.foul){const line=kitLine(state,carrier,"malicia",true);
  checkFoul(state,team.number,carrier,d,carrier,nearby,true,{ability:label,dialogue:line?[line]:undefined,description:carrier.name+" draws "+d.name+" into a challenge"+(read.behind?" from behind.":" from the side.")});return;}
 if(roll<read.foul+read.keep){addPoints(carrier,.03);
  addEvent(state,{type:"shield",teamNumber:team.number,notable:true,ability:label,description:carrier.name+" leans into "+d.name+"'s challenge and keeps the ball.",probability:read.keep,probabilityLabel:"BALL KEPT",actors:[carrier,d],nearbyDefenders:nearby});return;}
 if(roll<read.foul+read.keep+read.dive){
  carrier.yellows++;carrier.match.yellows=carrier.yellows;team.stats.yellowCards++;addPoints(carrier,-.15);
  const line=kitLine(state,carrier,"maliciaFail",true);
  state.possession=opp.number;state.carrierId=d.id;setBall(state,d);state.lastPasser=null;
  addEvent(state,{type:"yellow-card",teamNumber:team.number,notable:true,ability:label,dialogue:line?[line]:undefined,description:"The referee waves play on and books "+carrier.name+" for simulation ("+carrier.yellows+"/3).",actors:[carrier]});
  if(carrier.yellows>=3){carrier.sentOff=true;carrier.matchStatus="sent-off";carrier.match.redCards++;team.stats.redCards++;
   const slot=Object.keys(team.assignment).find(k=>idOf(team.assignment[k])===idOf(carrier.id));state.requiredSub=slot!=null?{teamNumber:team.number,slot:String(slot),playerId:carrier.id}:null;
   addEvent(state,{type:"red-card",teamNumber:team.number,notable:true,description:carrier.name+" is sent off."+(state.requiredSub?" A replacement is required.":""),actors:[carrier]});}
  return;}
 d.match.tackles++;opp.stats.tackles++;team.stats.turnovers++;addPoints(d,.15);addPoints(carrier,-.12);
 state.possession=opp.number;state.carrierId=d.id;state.lastPasser=null;setBall(state,d);
 addEvent(state,{type:"turnover",teamNumber:opp.number,notable:true,ability:label,description:d.name+" stays on his feet and takes the ball from "+carrier.name+".",probability:read.lose,probabilityLabel:"TACKLE WIN",actors:[carrier,d],nearbyDefenders:nearby});
}
function resolveDribble(state,carrier,opts={}){
 const team=state.teams[carrier.teamNumber],before=point(carrier);
 // Without a chosen target the carrier takes the defender on (shielding turns are a decision of chooseAction).
 const all=opts.target?[]:dribbleOptions(state,carrier),fwd=all.filter(o=>aheadM(team.number,o.end)>=aheadM(team.number,carrier)-1),best=opts.target?null:(fwd.length?fwd:all).sort((a,b)=>b.value-a.value)[0];
 const end=opts.target?point(opts.target):(best||{end:shiftM(carrier,dribbleMeters(carrier),0,team.number)}).end,sharp=opts.target?!!opts.sharp:!!(best&&best.sharp);
 const power=kitAbility(carrier,"power-dribble"),pushKit=opts.push?kitAbility(carrier,"push-dribble"):null,cutKit=opts.cut?kitAbility(carrier,"speed-cut"):null,maxStride=pushKit&&opts.stride?Number(opts.stride):dribbleMeters(carrier)*(power?kitParamP(carrier,power,"stride",1.2):1);
 const stride=Math.min(maxStride,distance(before,end)||maxStride);
 const model=dribbleModel(state,carrier,end,undefined,{sharp,push:!!pushKit,cut:!!cutKit}),defenders=model.defenders,chance=model.chance;
 // Only a defender who genuinely engages the carrier is "beaten" (and can foul him).
 const def=model.def&&model.access>=.35?model.def:null;
 const nearbyDefenderInfo=defenderFeedDetails(defenders,[carrier],model.def);
 carrier.match.dribblesAttempted++;
 if(state.random()<chance){
  drain(carrier,true,"dribble");carrier.match.dribbles++;addPoints(carrier,def?.07:.03);moveToward(carrier,end,stride);setBall(state,carrier);state.lastPasser=null;
  carrier.lastMove={x:(carrier.x-before.x)*XM,y:(carrier.y-before.y)*YM};carrier.lastDribble={tick:Number(state.tick),beaten:def?idOf(def.id):null,sharp};
  if(def)markBeaten(state,def,carrier,model,sharp);
  // Visible identity (throttled): the cut, the machine-like carry, the shrugged-off challenge, the Flow chain.
  const creative=kitAbility(carrier,"creative-dribble"),shield=kitAbility(carrier,"physical-shield"),chain=opts.chain?kitAbility(carrier,"dribble-chain"):null;
  const chip=chain?abilityBadge(chain,"ultimate"):cutKit?chipOnce(state,carrier,cutKit,"weapon",5):pushKit?chipOnce(state,carrier,pushKit,"weapon",6):creative&&def&&(sharp||model.hesitation>.04)?chipOnce(state,carrier,creative,"weapon",5):power&&def?chipOnce(state,carrier,power,"weapon",10):shield&&def?chipOnce(state,carrier,shield,"passive",10):undefined;
  const dribbleLine=chip?kitLine(state,carrier,chain?"flowDribble":"dribble",!!chain):null;
  addEvent(state,{type:"dribble",teamNumber:team.number,notable:true,ability:chip,dialogue:dribbleLine?[dribbleLine]:undefined,description:carrier.name+(chain?" chains another move and ":sharp?" cuts sharply and ":"")+(def?(sharp||chain?"beats ":" beats ")+def.name:model.def?(sharp||chain?"accelerates away from ":" accelerates away from ")+model.def.name:(sharp||chain?"accelerates into open space":" accelerates into open space"))+" over "+Math.round(distance(before,carrier))+"m.",
   comparison:{attackerLabel:"DRI",attackerValue:effective(carrier,"dri"),defenderLabel:"DEF",defenderValue:def?effective(def,"def"):0},
   probability:chance,probabilityLabel:"DRIBBLE SUCCESS",actors:def?[carrier,def]:[carrier],nearbyDefenders:nearbyDefenderInfo});
   afterDribble(state,carrier,def);
   // A successful dribble continues 85% of the time; the remaining 15% can be a foul.
   if(def&&state.random()>=.85&&checkFoul(state,team.number,carrier,def,before,nearbyDefenderInfo,true))return;
   // Ginga × Monster: in Flow, a beaten defender can be followed straight away by another move
   // (a further real dribble, resolved and contestable like the first).
   const ch=kitAbility(carrier,"dribble-chain");
   if(ch&&def&&isFlowing(carrier)&&(opts.chain||0)<kitParam(ch,"maxChain",2)&&state.possession===team.number&&idOf(state.carrierId)===idOf(carrier.id)){
    const next=dribbleOptions(state,carrier).filter(o=>o.model.def&&aheadM(team.number,o.end)>aheadM(team.number,carrier)-1).sort((a,b)=>b.value-a.value)[0];
    if(next&&next.value>0&&next.model.chance>.45)resolveDribble(state,carrier,{target:next.end,sharp:next.sharp,chain:(opts.chain||0)+1});}
 }else if(def||model.def){
  const def=model.def;drain(carrier,false,"dribble");addPoints(carrier,-.18);carrier.dribbleSlump=Math.min(3,dribbleSlump(state,carrier)+1);carrier.dribbleSlumpTick=Number(state.tick);
  const opp=state.teams[team.number===1?2:1];
  if(distance(def,carrier)<=TACKLE_RADIUS_M&&checkFoul(state,team.number,carrier,def,carrier,nearbyDefenderInfo))return;
  def.match.tackles++;addPoints(def,.18);opp.stats.tackles++;team.stats.turnovers++;moveToward(def,carrier,movementMeters(def));
  state.lastPasser=null;state.possession=opp.number;state.carrierId=def.id;setBall(state,def);
  const mm=kitAbility(def,"man-marking"),onMark=mm&&def.markTarget&&def.markTarget.id===idOf(carrier.id),dsh=kitAbility(def,"physical-shield");
  if(onMark){addPoints(def,.05);def.match.markWins=(def.match.markWins||0)+1;}
  const defChip=onMark?chipOnce(state,def,mm,"weapon",4):dsh?chipOnce(state,def,dsh,"passive",6):undefined,defLine=kitLine(state,def,"defend",false)||(defChip?null:kitLine(state,carrier,"dribbleFail",false));
  addEvent(state,{type:"turnover",teamNumber:opp.number,notable:true,ability:defChip,dialogue:defLine?[defLine]:undefined,description:def.name+(onMark?" stays tight on his man and wins the ball from ":" wins the ball from ")+carrier.name+".",
   comparison:{attackerLabel:"DRI",attackerValue:effective(carrier,"dri"),defenderLabel:"DEF",defenderValue:effective(def,"def")},
   probability:1-chance,probabilityLabel:"TACKLE WIN",actors:[carrier,def],nearbyDefenders:nearbyDefenderInfo});
 }else{
  drain(carrier,false,"dribble");addPoints(carrier,-.08);
  addEvent(state,{type:"play",teamNumber:team.number,notable:true,
   description:carrier.name+" miscontrols the ball while dribbling into open space.",
   comparison:{attackerLabel:"DRI",attackerValue:effective(carrier,"dri"),defenderLabel:"DEF",defenderValue:0},
   probability:1-chance,probabilityLabel:"DRIBBLE ERROR",actors:[carrier],nearbyDefenders:nearbyDefenderInfo});
 }
}
function recoverLoose(state,where,attackingNumber){
 const target=point(where),options=[];[1,2].forEach(n=>active(state.teams[n]).forEach(p=>{
  if(p.role==="GK")return;const d=distance(p,target);if(d>24)return;const skill=n===attackingNumber?effective(p,"off"):effective(p,"def"),hunt=kitAbility(p,"persistent-press")||kitAbility(p,"physical-shield");
  options.push({p,value:effective(p,"spd")*.52+skill*.25-d*1.5+state.random()*5+(hunt?4:0)});
 }));
 options.sort((a,b)=>b.value-a.value);if(!options.length)return null;
 const p=options[0].p;moveToward(p,target,movementMeters(p));addPoints(p,.08);state.lastPasser=null;state.possession=p.teamNumber;state.carrierId=p.id;setBall(state,p);
 addEvent(state,{type:"rebound",teamNumber:p.teamNumber,notable:true,description:p.name+" reaches the rebound first.",actors:[p]});return p;
}
function resolveShot(state,shooter,penalty,ultimate,technique,adapted,pride){
 const tech=!penalty&&technique&&technique.id!=="conventional"?technique:null;
 const special=!penalty&&!ultimate&&!tech?activateBattleSimSpecial(state,shooter,"shot"):null;
 const {team,defteam,gk,metres,shoot,gkStat,goalChance:rawChance}=shotModel(state,shooter,penalty,ultimate,special,null,null,tech);
 const goalChance=rawChance,roll=state.random();team.stats.shots++;shooter.match.shots++;
 if(!penalty){opportunity(state,null,"shot:"+(metres<12?"<12m":metres<18?"12-18m":metres<25?"18-25m":"25m+"));const mates=active(team).filter(m=>m!==shooter&&m.role!=="GK"&&inOpponentBox(team.number,m)).length;opportunity(state,null,"shot:teammates-in-box-"+Math.min(3,mates));}
 const activeAbility=ultimate||special,runtime=tech&&tech.ability?abilityState(shooter):null;
 if(tech&&tech.ability){const id=String(tech.ability.id),uses=runtime.uses[id]||(runtime.uses[id]={attempts:0,goals:0});uses.attempts++;
  if(tech.cooldown)runtime.cooldowns[id]=Number(state.tick)+Math.max(1,Number(tech.cooldown));}
 const rivals=(shooter.battleSim&&Array.isArray(shooter.battleSim.rivals)?shooter.battleSim.rivals:[]).map(idOf),rState=rivals.length?abilityState(shooter):null;
 const rivalOn=rState&&!rState.rivalSpoken&&opposing(state,team.number).some(o=>rivals.includes(idOf(o.id)));if(rivalOn)rState.rivalSpoken=true;
 const prideOn=!tech&&pride?pride:null,techLine=rivalOn?kitLine(state,shooter,"rival",true):tech&&tech.ability?kitLine(state,shooter,tech.ability.dialogue||tech.id,true):prideOn?kitLine(state,shooter,prideOn.dialogue||"responsibility",false):null,abilityDialogue=techLine?[techLine]:battleSimAbilityDialogue(shooter,activeAbility);
 const shotDescription=tech&&!tech.ability?shooter.name+(tech.id==="header"?" attacks the cross from "+Math.round(metres)+"m!":" strikes first-time from "+Math.round(metres)+"m!"):tech?shooter.name+(tech.ultimate?" unleashes "+tech.ability.name+"!":" goes for a "+tech.ability.name+" from "+Math.round(metres)+"m!"):ultimate?shooter.name+" unleashes "+ultimate.name+"!":special?shooter.name+" uses "+special.name+" from "+Math.round(metres)+"m!":shooter.name+" shoots from "+Math.round(metres)+"m!";
 const aim=tech&&tech.aim?point(tech.aim):targetGoal(team.number);
 addEvent(state,{type:"shot-attempt",teamNumber:team.number,notable:true,description:shotDescription,
  comparison:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:gkStat},
  probability:goalChance,probabilityLabel:"GOAL CHANCE",actors:[shooter],
  ability:tech?abilityBadge(tech.ability,tech.ultimate?"ultimate":"weapon"):undefined,abilityNote:tech&&adapted?abilityBadge(kitAbility(shooter,"tactical-memory"),"passive"):prideOn?chipOnce(state,shooter,prideOn,"passive",10):undefined,
  dialogue:abilityDialogue.length?abilityDialogue:undefined,shotRoute:{from:point(shooter),to:aim}});
 drain(shooter,roll<goalChance,"shot");
 // Adaptability: remember how the keeper or a blocker dealt with this attempt.
 const learnShot=()=>{if(roll>=goalChance)learn(state,shooter,"shot",tech&&tech.aimSide||"centre",gk);};
 const assister=state.lastPasser&&state.lastPasser!==shooter.id?playerIn(team,state.lastPasser):null;
 state.lastPasser=null;
 if(roll<goalChance){
  team.stats.onTarget++;team.stats.goals++;shooter.match.onTarget++;shooter.match.goals++;addPoints(shooter,1.35);
  if(tech&&tech.ability)runtime.uses[String(tech.ability.id)].goals++;
  const goalLine=kitLine(state,shooter,"goal",true);
  if(assister){assister.match.assists++;addPoints(assister,.68);}
  state.score[team.number]++;setBall(state,targetGoal(team.number));
  addEvent(state,{type:"goal",teamNumber:team.number,notable:true,
   description:"GOAL! "+shooter.name+(isFlowing(shooter)?" strikes in FLOW":" scores")+" for "+team.name+(assister?" assisted by "+assister.name:"")+".",
   comparison:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:gkStat},
   probability:goalChance,probabilityLabel:"GOAL CHANCE",actors:assister?[shooter,assister]:[shooter],dialogue:goalLine?[goalLine]:undefined});
  if(special||tech&&!tech.ultimate)shooter.match.specials=(shooter.match.specials||0)+1;
  if(ultimate||tech&&tech.ultimate)shooter.match.ultimates=(shooter.match.ultimates||0)+1;
  state.pending={type:"kickoff",teamNumber:defteam.number,zone:7,point:{x:50,y:50}};
  resetPositions(state);pause(state,"GOAL");return;
 }
 addPoints(shooter,-.08);learnShot();
 // Every failed shot: 25% deflected for a corner, 25% held, 25% parried, 25% wide. A powerful strike
 // is harder to hold, so more of its saves are parries (a live second ball).
 const outcome=state.random(),parry=tech&&tech.parry?Number(tech.parry):0,missLine=kitLine(state,shooter,"miss",false);
 if(outcome<.25){
  const spot={x:team.number===1?98:2,y:shooter.y<50?3:97};team.stats.corners++;
  state.pending={type:"corner",teamNumber:team.number,zone:zoneAt(spot),point:spot,takerId:null,routine:"cross"};
  state.possession=team.number;state.carrierId=null;setBall(state,spot);
  addEvent(state,{type:"corner",teamNumber:team.number,notable:true,description:shooter.name+"'s strike is deflected behind. Corner to "+team.name+".",actors:[shooter,gk]});pause(state,"CORNER");return;
 }
 // Catch or parry: better keepers hold more; close-range and powerful strikes are parried more often.
 const steadyKeeper=gk&&gk.role==="GK"?kitAbility(gk,"steady-keeper"):null,parryKeeper=gk&&gk.role==="GK"?kitAbility(gk,"extended-parry"):null;
 const catchShare=clamp(.25+(gkStat-82)*.005-(metres<12?.06:0)-parry+(steadyKeeper?kitParamP(gk,steadyKeeper,"hold",.07):0)-(parryKeeper?kitParamP(gk,parryKeeper,"parry",.05):0),.07,.42);
 const keeperUsed=keeperFactors(state,gk,point(shooter),targetGoal(team.number),metres,0,tech).used,keeperChip=gk&&keeperUsed?chipOnce(state,gk,keeperUsed,["smother-block","super-reflex"].includes(keeperUsed.effect)?"weapon":"passive",4):undefined;
 if(keeperUsed&&["smother-block","super-reflex"].includes(keeperUsed.effect))abilityState(gk).cooldowns[keeperUsed.effect]=Number(state.tick)+Math.max(1,Number(kitParam(keeperUsed,"cooldownTicks",12)));
 const keeperLine=keeperChip?kitLine(state,gk,keeperUsed.dialogue||"save",false):null;
 if(outcome<.25+catchShare){
  team.stats.onTarget++;shooter.match.onTarget++;if(gk){gk.match.saves++;addPoints(gk,.54);defteam.stats.saves++;}
  const spot=ownGoal(defteam.number);state.pending={type:"goal-kick",teamNumber:defteam.number,zone:zoneAt(spot),point:spot,takerId:null,goalKickTaker:"gk",routine:"short"};
  state.possession=defteam.number;state.carrierId=null;setBall(state,spot);
  addEvent(state,{type:"save",teamNumber:defteam.number,notable:true,description:(gk?gk.name:"The keeper")+" catches "+shooter.name+"'s shot cleanly.",
   comparison:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:gkStat},actors:[shooter,gk],ability:keeperChip,dialogue:keeperLine?[keeperLine]:missLine?[missLine]:undefined});pause(state,"SAVE / GOAL KICK");return;
 }
 if(outcome<.75){
  team.stats.onTarget++;shooter.match.onTarget++;if(gk){gk.match.saves++;addPoints(gk,.25);defteam.stats.saves++;}
  const loose={x:team.number===1?91:9,y:clamp(shooter.y+state.random()*10-5,26,74)};
  addEvent(state,{type:"save",teamNumber:defteam.number,notable:true,description:(gk?gk.name:"The keeper")+" parries "+shooter.name+"'s shot into danger!",actors:[shooter,gk],ability:keeperChip||(parryKeeper?chipOnce(state,gk,parryKeeper,"weapon",6):undefined),dialogue:keeperLine?[keeperLine]:undefined});
  // The second ball goes to whoever physically reaches it first; nobody is moved further than he can run.
  const win=reboundRace(state,loose,team.number,shooter);
  if(!win){const recovered=recoverLoose(state,loose,team.number);if(!recovered&&gk){state.possession=defteam.number;state.carrierId=gk.id;setBall(state,gk);}pause(state,"SAVE / REBOUND");return;}
  const q=win.p,qt=state.teams[q.teamNumber],from=point(q);setPosition(q,loose);q.lastMove={x:(loose.x-from.x)*XM,y:(loose.y-from.y)*YM};
  state.possession=q.teamNumber;state.carrierId=q.id;state.lastPasser=null;setBall(state,q);addPoints(q,.08);
  if(win.rx)opportunity(state,q,"secondball:won");
  let rx;if(win.rx){useReaction(state,win.rx.def,win.rx.owner.teamNumber);state.reactionCount=(Number(state.reactionCount)||0)+1;rx={id:String(win.rx.def.id),label:String(win.rx.def.label||win.rx.def.name).toUpperCase()};}
  const rv=q.teamNumber===team.number?kitAbility(q,"rebound-volley"):null,rvState=rv?abilityState(q):null;
  if(rv)opportunity(state,q,!(win.t<=kitParamP(q,rv,"reach",1.6))?"rush:too-slow":Number(rvState.cooldowns[rv.id]||0)>Number(state.tick)?"rush:cooldown":distance(q,targetGoal(team.number))>18?"rush:too-far":"rush:offered");
  else opportunity(state,null,q.teamNumber===team.number?"rebound:attack-won":"rebound:defence-won");
  const volley=rv&&win.t<=kitParamP(q,rv,"reach",1.6)&&!(Number(rvState.cooldowns[rv.id]||0)>Number(state.tick))&&distance(q,targetGoal(team.number))<=18;
  const rLine=rx?kitLine(state,win.rx.owner===q?win.rx.owner:q,win.rx.def.dialogue||"secondBall",true):volley?null:kitLine(state,q,q.teamNumber===team.number?"secondBall":"defend",false);
  addEvent(state,{type:"rebound",teamNumber:q.teamNumber,notable:true,description:q.name+" reaches the loose ball first after "+Math.round(distance(from,loose))+"m"+(q.teamNumber===team.number?".":" and clears the danger."),
   actors:[q],reaction:rx,runRoute:distance(from,loose)>=2?{from,to:loose}:null,dialogue:rLine?[rLine]:undefined});
  // Rush Volley: arriving at full speed, he hits it before anyone can close him down.
  if(volley){resolveShot(state,q,false,null,{id:"rush-volley",ability:rv,aim:null,logit:kitParamP(q,rv,"technique",.15),pressureRelief:2.5,blockFactor:.9,cooldown:kitParam(rv,"cooldownTicks",6)});return;}
  pause(state,"SAVE / REBOUND");return;
 }
 const spot=ownGoal(defteam.number);state.pending={type:"goal-kick",teamNumber:defteam.number,zone:zoneAt(spot),point:spot,takerId:null,goalKickTaker:"gk",routine:"short"};
 state.possession=defteam.number;state.carrierId=null;setBall(state,spot);
 addEvent(state,{type:"goal-kick",teamNumber:defteam.number,notable:true,description:shooter.name+" misses. Goal kick for "+defteam.name+".",actors:[shooter],dialogue:missLine?[missLine]:undefined});pause(state,"GOAL KICK");
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
 state.kickoffPassPending=true;state.stoppage="";
}
function setPieceUsesPass(pending){
 return pending.type==="goal-kick"||pending.type==="corner"||(pending.type==="free-kick"&&pending.routine!=="direct");
}
function setPieceSkill(pending){
 if(pending.type==="goal-kick")return "gk";
 if(pending.type==="free-kick")return pending.routine==="direct"?"sho":"pas";
 return setPieceUsesPass(pending)?"pas":"sho";
}

function setPieceTaker(state,pending){
 const team=state.teams[pending.teamNumber],gk=keeper(team);
 if(pending.type==="goal-kick"&&pending.goalKickTaker!=="outfield")return gk;
 const eligible=active(team).filter(p=>pending.type!=="goal-kick"||p.role!=="GK");
 const picked=eligible.find(p=>idOf(p.id)===idOf(pending.takerId));if(picked)return picked;
 const skill=setPieceSkill(pending);
 return eligible.slice().sort((a,b)=>effective(b,skill)-effective(a,skill))[0]||gk;
}
function freeKickRestartPoint(teamNumber,spot){
 const x=Number(spot.x),y=Number(spot.y),nearSide=teamNumber===1?x>=76&&x<83:x>17&&x<=24;
 if(nearSide&&y>=20&&y<=80)return{x:teamNumber===1?82:18,y:clamp(y,5,95)};
 const inside=teamNumber===1?x>=83:x<=17;
 if(inside&&y>=15&&y<20)return{x:clamp(x,3,97),y:18};
 if(inside&&y>80&&y<=85)return{x:clamp(x,3,97),y:82};
 return{x:clamp(x,3,97),y:clamp(y,5,95)};
}
function pointAlong(from,toward,alongM,lateralM=0){
 const a=point(from),b=point(toward),dx=(b.x-a.x)*XM,dy=(b.y-a.y)*YM,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,px=-uy,py=ux;
 return{x:clamp(a.x+(ux*alongM+px*lateralM)/XM,2,98),y:clamp(a.y+(uy*alongM+py*lateralM)/YM,5,95)};
}
function freeKickLaneY(team,p){
 const slot=teamSlotOf(team,p),group=roleGroup(p.role),width=.62+team.strategy.width*.0076;
 const spread=group==="W"||group==="WM"||group==="FB"?1.12:group==="ST"||group==="CB"?.28:group==="AM"?.42:.68;
 return clamp(50+(slot.x-50)*width*spread,5,95);
}
function freeKickThreatScore(p){
 const group=roleGroup(p.role);
 return effective(p,"off")*.42+effective(p,"sho")*.28+effective(p,"spd")*.20+(group==="ST"?12:group==="W"?10:group==="AM"?8:group==="CB"?4:0);
}
function freeKickShortScore(p){
 const group=roleGroup(p.role);
 return effective(p,"pas")*.45+effective(p,"off")*.15+(group==="CM"?24:group==="DM"?23:group==="AM"?16:group==="FB"?13:group==="WM"?12:group==="W"?8:0);
}
function attackingFreeKickTarget(state,team,p,spot,index){
 const group=roleGroup(p.role),goal=targetGoal(team.number),slot=teamSlotOf(team,p);
 const depth=group==="ST"?7+index*.8:group==="W"||group==="WM"?8.5+index*.7:group==="CB"?6.5+index*.7:group==="AM"?13:group==="CM"?18:group==="DM"?21:group==="FB"?20:16;
 const lateralScale=group==="W"||group==="WM"||group==="FB"?.95:group==="CB"||group==="ST"?.18:group==="AM"?.35:.62;
 const lateral=(slot.x-50)*.34*lateralScale*(.62+team.strategy.width*.0076),y=clamp(50+lateral*100/PITCH_WIDTH,6,94),intended=shiftM(goal,-depth,lateral,team.number);
 const limit=Math.min(aheadM(team.number,spot)-.8,lastLineM(state,team.number)-.7);
 return pitchAt(team.number,clamp(Math.min(aheadM(team.number,intended),limit),3,103),y);
}
function arrangeFreeKick(state,pending,team,opposition,taker,restart,attackers,defenders){
 const n=team.number,defN=opposition.number,goal=targetGoal(n);
 const shortReceiver=attackers.slice().sort((a,b)=>freeKickShortScore(b)-freeKickShortScore(a)||idOf(a.id).localeCompare(idOf(b.id)))[0]||null;
 const longPool=attackers.filter(p=>!shortReceiver||p.id!==shortReceiver.id);
 const longReceiver=longPool.slice().sort((a,b)=>freeKickThreatScore(b)-freeKickThreatScore(a)||idOf(a.id).localeCompare(idOf(b.id)))[0]||shortReceiver;
 pending.shortReceiverId=shortReceiver?idOf(shortReceiver.id):null;pending.longReceiverId=longReceiver?idOf(longReceiver.id):null;
 if(pending.freeKickType==="midfield"){
  const base=aheadM(n,restart),cap=Math.min(103,lastLineM(state,n)-.8);
  attackers.forEach(p=>{
   const group=roleGroup(p.role),lane=freeKickLaneY(team,p);
   let forward=group==="ST"?20:group==="W"||group==="WM"?18:group==="AM"?16:group==="CM"?10:group==="DM"?8:group==="FB"?8:5;
   forward+=(team.strategy.directness-50)*.08+(team.strategy.tempo-50)*.05;
   if(shortReceiver&&p.id===shortReceiver.id)forward=6;if(longReceiver&&p.id===longReceiver.id)forward=Math.max(forward,24+(team.strategy.directness-50)*.10);
   const m=clamp(Math.min(base+forward,cap),3,103),y=shortReceiver&&p.id===shortReceiver.id?clamp(50+(lane-50)*.62,5,95):lane;
   setPosition(p,pitchAt(n,m,y));
  });
  const press=opposition.strategy.pressing,ballA=aheadM(defN,restart),retreat=press>=68?5:press<=32?19:12,line=clamp(ballA-retreat+(opposition.strategy.line-50)*.13,6,58);
  defenders.forEach(p=>{
   const group=roleGroup(p.role),slot=teamSlotOf(opposition,p),depth=group==="ST"?13:group==="W"||group==="WM"?11:group==="AM"?8:group==="CM"?4:group==="DM"?1:group==="FB"?-3:-7;
   setPosition(p,pitchAt(defN,clamp(line+depth,4,70),clamp(50+(slot.x-50)*(.44+opposition.strategy.width*.0058),5,95)));
  });
  if(press>=55){
   const count=press>=84?3:press>=68?2:1,pressers=defenders.slice().sort((a,b)=>(effective(b,"spd")*.45+effective(b,"def")*.55)-(effective(a,"spd")*.45+effective(a,"def"))).slice(0,count),offsets=[0,-3.5,3.5];
   pressers.forEach((p,i)=>setPosition(p,pointAlong(restart,targetGoal(defN),FREE_KICK_DISTANCE_M+.3+i*1.8,offsets[i])));
  }
 }else{
  attackers.forEach((p,i)=>{
   if(pending.routine==="short-pass"&&shortReceiver&&p.id===shortReceiver.id)setPosition(p,shiftM(restart,7,(teamSlotOf(team,p).x-50)*.12,n));
   else setPosition(p,attackingFreeKickTarget(state,team,p,restart,i));
  });
  const gap=distance(restart,goal),wallCount=gap<=34&&pending.routine==="direct"?clamp(3+Math.floor((34-gap)/12),3,5):0;
  const wallers=defenders.slice().sort((a,b)=>{
   const score=p=>effective(p,"def")+(roleGroup(p.role)==="CB"?12:roleGroup(p.role)==="DM"?8:0);
   return score(b)-score(a);
  }).slice(0,wallCount),wallOffsets=[-2.4,-1.2,0,1.2,2.4];
  wallers.forEach((p,i)=>setPosition(p,pointAlong(restart,goal,9.25,wallOffsets[i])));
  const remaining=defenders.filter(p=>!wallers.includes(p)),marked=attackers.slice().sort((a,b)=>freeKickThreatScore(b)-freeKickThreatScore(a));
  remaining.sort((a,b)=>effective(b,"def")-effective(a,"def"));
  remaining.forEach((d,i)=>{
   const a=marked[i];if(a)setPosition(d,offsetM(a,ownGoal(defN),2));
   else{const slot=teamSlotOf(opposition,d),y=clamp(50+(slot.x-50)*(.52+opposition.strategy.width*.004),6,94);setPosition(d,pitchAt(defN,clamp(aheadM(defN,restart)-9,8,88),y));}
  });
 }
 // Law 13: every opponent stays at least 9.15 m from the ball until it is in play.
 defenders.forEach(d=>{if(distance(d,restart)<FREE_KICK_DISTANCE_M+.1)setPosition(d,offsetM(restart,distance(d,restart)<.5?ownGoal(defN):d,FREE_KICK_DISTANCE_M+.3));});
 const ownKeeper=keeper(team),opponentKeeper=keeper(opposition);
 if(ownKeeper)setPosition(ownKeeper,ownGoal(team.number));
 if(opponentKeeper){const home=ownGoal(defN);setPosition(opponentKeeper,{x:home.x,y:clamp(50+(restart.y-50)*.3,30,70)});}
 return{team,taker,spot:restart,attackers,defenders};
}
const FREE_KICK_DISTANCE_M=9.15;
function randomOutsidePenalty(teamNumber,rand){
 for(let i=0;i<240;i++){const q={x:4+rand()*92,y:5+rand()*90};if(!inOpponentBox(teamNumber,q))return q;}
 return{x:teamNumber===1?55:45,y:10+rand()*80};
}
/* Goal kicks (IFAB Law 16): the taker stands at the ball inside the goal area,
   teammates may use the penalty area, opponents stay outside it until the kick.
   The six-yard area is kept clear of outfield players as a presentation preference.
   These are the physical positions the restart pass is resolved from. */
const GOAL_KICK_SHORT_DEPTH={CB:12,FB:23,DM:22,CM:34,WM:38,AM:44,W:50,ST:58},GOAL_KICK_LONG_DEPTH={CB:19,FB:36,DM:40,CM:50,WM:54,AM:58,W:63,ST:69};
const GOAL_KICK_PRESS_DEPTH={high:{ST:20,W:21,AM:27,CM:30,WM:32,DM:38,FB:46,CB:52},mid:{ST:31,W:33,AM:37,CM:42,WM:42,DM:47,FB:58,CB:62},low:{ST:42,W:44,AM:48,CM:54,WM:55,DM:59,FB:68,CB:72}};
const PENALTY_AREA_CLEARANCE_M=19;
function inGoalArea(number,where){const q=point(where);return aheadM(number,q)<7&&Math.abs(q.y-50)*YM<9.5;}
function arrangeGoalKick(state,pending,team,opposition,taker,restart,rand){
 const n=team.number,long=pending.routine==="direct",s=team.strategy,jitter=()=>(rand()-.5)*3;
 pending.point={...restart};pending.zone=zoneAt(restart);
 setPosition(taker,restart);setBall(state,restart);state.carrierId=taker.id;state.possession=n;
 const ownKeeper=keeper(team);if(ownKeeper&&ownKeeper.id!==taker.id)setPosition(ownKeeper,pitchAt(n,9,62));
 const own=active(team).filter(p=>p.id!==taker.id&&p.role!=="GK"),cbs=own.filter(p=>roleGroup(p.role)==="CB").sort((a,b)=>teamSlotOf(team,a).x-teamSlotOf(team,b).x);
 const targets=new Map();
 // Without a holding midfielder, the most central midfielder drops in as the "6" for a short build-up.
 const anchor=!long&&!own.some(p=>roleGroup(p.role)==="DM")?own.filter(p=>roleGroup(p.role)==="CM").sort((a,b)=>Math.abs(teamSlotOf(team,a).x-50)-Math.abs(teamSlotOf(team,b).x-50))[0]:null;
 own.forEach(p=>{
  const group=anchor&&p.id===anchor.id?"DM":roleGroup(p.role),slot=teamSlotOf(team,p);
  let m=(long?GOAL_KICK_LONG_DEPTH:GOAL_KICK_SHORT_DEPTH)[group]||40,y=50+(slot.x-50)*(long?1:1.18)*(.9+s.width/500);
  if(group==="CB"&&!long){const i=cbs.indexOf(p),count=cbs.length;if(count===3&&i===1){m+=5;y=50;}else y=50+(i<count/2?-1:1)*24;}
  if(group==="ST"&&long)y=50+(slot.x-50)*.55;
  m+=(s.directness-50)*.06+jitter();y+=jitter();
  const q=pitchAt(n,m,clamp(y,5,95));targets.set(p.id,inGoalArea(n,q)?pitchAt(n,7.5,q.y):q);
 });
 separateTargets(targets,new Set(),7);
 own.forEach(p=>{const q=targets.get(p.id);setPosition(p,inGoalArea(n,q)?pitchAt(n,7.5,q.y):q);});
 // Opposition: a pressing shape outside the area, marking the likely first receivers.
 const press=opposition.strategy.pressing>=62?"high":opposition.strategy.pressing>=35?"mid":"low",depths=GOAL_KICK_PRESS_DEPTH[press];
 const rivals=active(opposition).filter(p=>p.role!=="GK"),marks=new Map(),taken=new Set();
 const markOrder=rivals.slice().sort((a,b)=>(depths[roleGroup(a.role)]||45)-(depths[roleGroup(b.role)]||45)||idOf(a.id).localeCompare(idOf(b.id)));
 markOrder.forEach(p=>{
  const group=roleGroup(p.role),slot=teamSlotOf(opposition,p),depth=depths[group]||45,defender=group==="CB"||group==="FB";
  let q=pitchAt(n,depth,clamp(50+(slot.x-50)*.9,6,94));
  // Pressers step onto build-up options; defenders stay goal-side of the targets of a long kick.
  const pool=own.filter(o=>!taken.has(o.id)&&(defender?long&&["ST","W","AM"].includes(roleGroup(o.role)):press!=="low"&&Math.abs(aheadM(n,o)-depth)<14));
  const target=pool.sort((a,b)=>distance(a,q)-distance(b,q))[0];
  if(target&&distance(target,q)<20){taken.add(target.id);q=pitchAt(n,Math.max(aheadM(n,target)+(defender?3:2.5),defender?depth-8:0),target.y+(defender?0:(50-target.y)*.08));}
  marks.set(p.id,pitchAt(n,Math.max(PENALTY_AREA_CLEARANCE_M,aheadM(n,q)),q.y));
 });
 separateTargets(marks,new Set(),6);
 rivals.forEach(p=>{const q=marks.get(p.id);setPosition(p,pitchAt(n,Math.max(PENALTY_AREA_CLEARANCE_M,aheadM(n,q)),q.y));});
 const opponentKeeper=keeper(opposition);if(opponentKeeper)setPosition(opponentKeeper,ownGoal(opposition.number));
 setBall(state,restart);
}
function arrangeSetPiece(state,pending,taker){
 const team=state.teams[pending.teamNumber],opposition=state.teams[team.number===1?2:1];
 const dir=team.number===1?1:-1,spot=point(pending.point||legacyPoint(pending.zone));
 const rand=seeded(((state.seed>>>0)^(state.tick*2654435761)^(pending.type==="corner"?0x2468:pending.type==="penalty"?0x3579:pending.type==="free-kick"?0x1357:0x8642))>>>0);
 let restart={...spot};
 if(pending.type==="penalty")restart={x:team.number===1?89.5:10.5,y:50};
 if(pending.type==="goal-kick")restart=ownGoal(team.number);
 if(pending.type==="corner")restart={x:team.number===1?98:2,y:rand()<.5?4:96};
 if(pending.type==="free-kick"){
  pending.freeKickType=pending.freeKickType||(distance(spot,targetGoal(team.number))>40?"midfield":"attacking");
  if(pending.routine==="pass")pending.routine="short-pass";
  if(pending.freeKickType==="midfield"&&pending.routine==="direct")pending.routine="short-pass";
  restart=freeKickRestartPoint(team.number,spot);pending.point={...restart};pending.zone=zoneAt(restart);
 }
 const attackers=active(team).filter(p=>p.id!==taker.id&&p.role!=="GK").sort((a,b)=>(effective(b,"off")+effective(b,"sho")*.3)-(effective(a,"off")+effective(a,"sho")*.3));
 const defenders=active(opposition).filter(p=>p.role!=="GK").sort((a,b)=>effective(b,"def")-effective(a,"def"));
 if(pending.type==="goal-kick"){arrangeGoalKick(state,pending,team,opposition,taker,restart,rand);return{team,taker,spot:restart,attackers,defenders};}
 setPosition(taker,restart);setBall(state,taker);state.carrierId=taker.id;state.possession=team.number;
 if(pending.type==="penalty"){
  pending.point={...restart};pending.zone=zoneAt(restart);
  attackers.forEach(p=>setPosition(p,randomOutsidePenalty(team.number,rand)));
  defenders.forEach(p=>setPosition(p,randomOutsidePenalty(team.number,rand)));
  const ownKeeper=keeper(team),opponentKeeper=keeper(opposition);
  if(ownKeeper)setPosition(ownKeeper,ownGoal(team.number));if(opponentKeeper)setPosition(opponentKeeper,ownGoal(opposition.number));
  return{team,taker,spot:restart,attackers,defenders};
 }
 if(pending.type==="free-kick"){
  pending.point={...restart};pending.zone=zoneAt(restart);
  return arrangeFreeKick(state,pending,team,opposition,taker,restart,attackers,defenders);
 }
 const within=(low,high)=>clamp(low+rand()*(high-low),low,high);
 attackers.forEach((p,i)=>{let x=p.homeX,y=p.homeY;if(pending.type==="corner"){if(i<7){x=team.number===1?within(87,96):within(4,13);y=within(25,75);}else{x=team.number===1?within(72,82):within(18,28);y=within(12,88);}}setPosition(p,{x,y});});
 defenders.forEach(p=>{let x=p.homeX,y=p.homeY;if(pending.type==="corner"){x=team.number===1?within(87,96):within(4,13);y=within(25,75);}setPosition(p,{x,y});});
 if(pending.type==="corner"&&pending.routine==="short"){
  const mate=attackers[Math.floor(rand()*attackers.length)],opponent=defenders[Math.floor(rand()*defenders.length)];
  if(mate){setPosition(mate,{x:clamp(restart.x-dir*10,3,97),y:clamp(restart.y+(restart.y<50?9:-9),7,93)});pending.shortReceiverId=mate.id;}
  if(opponent)setPosition(opponent,{x:clamp(restart.x-dir*13,3,97),y:clamp(restart.y+(restart.y<50?12:-12),7,93)});
 }else delete pending.shortReceiverId;
 const gk=keeper(opposition),ownKeeper=keeper(team);if(gk)setPosition(gk,ownGoal(opposition.number));if(ownKeeper)setPosition(ownKeeper,ownGoal(team.number));
 return{team,taker,spot:restart,attackers,defenders};
}
function setPieceReceiver(state,pending,taker){
 const team=state.teams[pending.teamNumber],list=active(team).filter(p=>p.role!=="GK"&&p.id!==taker.id);if(!list.length)return null;
 if(pending.type==="corner"&&pending.routine==="short")return list.find(p=>idOf(p.id)===idOf(pending.shortReceiverId))||list.slice().sort((a,b)=>distance(a,taker)-distance(b,taker))[0];
 if(pending.type==="corner")return list.slice().sort((a,b)=>(effective(b,"off")*.6+effective(b,"sho")*.4)-(effective(a,"off")*.6+effective(a,"sho")*.4))[0];
 if(pending.type==="free-kick"){
  if(pending.routine==="pass"||pending.routine==="short-pass")return list.find(p=>idOf(p.id)===idOf(pending.shortReceiverId))||list.slice().sort((a,b)=>distance(a,taker)-distance(b,taker))[0];
  if(pending.routine==="long-pass")return list.find(p=>idOf(p.id)===idOf(pending.longReceiverId))||list.slice().sort((a,b)=>distance(b,taker)-distance(a,taker))[0];
 }
 if(pending.type==="goal-kick"){
  const from=point(pending.point||ownGoal(team.number)),long=pending.routine==="direct";
  const best=passOptions(state,taker,{setPiece:true,goalKick:true,offsideExempt:true,fromPoint:from,kindFilter:long?"long":"short"}).filter(o=>o.receiver.role!=="GK").sort((a,b)=>b.value-a.value)[0];
  return best?best.receiver:list.slice().sort((a,b)=>long?distance(b,from)-distance(a,from):distance(a,from)-distance(b,from))[0];
 }
 return null;
}
function resolveRestart(state,pending){
 state.lastPasser=null;const team=state.teams[pending.teamNumber],taker=setPieceTaker(state,pending);
 if(!taker)return;
 // Formations were already staged on stoppage; only stage here for old saves.
 if(!pending.staged)arrangeSetPiece(state,pending,taker);
 state.possession=team.number;state.carrierId=taker.id;
 const restartPoint=point(pending.point||ownGoal(team.number));
 if(pending.type==="goal-kick")setBall(state,restartPoint);else setBall(state,taker);
 if(pending.type==="penalty"){resolveShot(state,taker,true);return;}
 if(pending.type==="free-kick"){
  if(pending.routine==="pass")pending.routine="short-pass";
  if(pending.routine==="direct"){resolveShot(state,taker,false);return;}
  const receiver=setPieceReceiver(state,pending,taker);
  resolvePass(state,taker,{setPiece:true,receiverId:receiver?receiver.id:undefined,passKind:pending.routine==="long-pass"?"long":"short"});
  return;
 }
 if(setPieceUsesPass(pending)){
  const receiver=setPieceReceiver(state,pending,taker);
  resolvePass(state,taker,{setPiece:true,offsideExempt:true,receiverId:receiver?.id,goalKick:pending.type==="goal-kick",
   passKind:pending.type==="corner"?(pending.routine==="short"?"short":"long"):pending.type==="goal-kick"?(pending.routine==="short"?"short":"long"):"short",
   fromPoint:pending.type==="goal-kick"?restartPoint:undefined,
   guaranteed:pending.type==="goal-kick"&&pending.routine==="short"&&taker.role==="GK"});
  return;
 }
 if(pending.type==="free-kick"&&distance(taker,targetGoal(team.number))>40){
  const receiver=setPieceReceiver(state,{...pending,routine:"pass"},taker);
  resolvePass(state,taker,{setPiece:true,receiverId:receiver?.id,passKind:"short"});return;
 }
 resolveShot(state,taker,false);
}
function ensureTickEvent(state,eventsBefore,description){if(state.events.length!==eventsBefore)return;const team=state.teams[state.possession],p=team&&playerIn(team,state.carrierId);addEvent(state,{type:"play",teamNumber:team?team.number:null,zone:state.ballZone,notable:true,description:description||(p?p.name+" keeps play moving.":"Both teams reset their shape."),actors:p?[p]:[]});}
function simulateTick(state){
 const eventsBefore=state.events.length;state.tick++;
 const limit=state.phase==="firstHalf"?HALF:FULL;
 state.timeSeconds=Math.min(limit,state.timeSeconds+10+Math.floor(state.random()*11));
 for(const n of [1,2])for(const p of state.teams[n].roster){if(isBlueLockMan(p)){enforceBlueLockMan(p);continue;}if(p.flow>=100){p.flowFullTicks=(p.flowFullTicks||0)+1;if(p.flowFullTicks>40){p.flow=0;p.flowFullTicks=0;}}else p.flowFullTicks=0;}
 if(state.possession===1||state.possession===2)state.teams[state.possession].stats.poss++;
 // A restart is taken from the staged, law-compliant shape: the ball is kicked before players move.
 if(state.forced){const forced=state.forced;state.forced=null;state.pending=null;resolveRestart(state,forced);ensureTickEvent(state,eventsBefore);return;}
 moveOffBall(state);
 const t=state.teams[state.possession],carrier=t&&playerIn(t,state.carrierId);
 if(!t||!carrier||carrier.sentOff){const n=state.possession===1?2:1,p=active(state.teams[n]).find(p=>p.role!=="GK")||keeper(state.teams[n]);state.possession=n;state.carrierId=p?.id;if(p)setBall(state,p);ensureTickEvent(state,eventsBefore);return;}
 setBall(state,carrier);
 if(state.throwInPending){
  state.throwInPending=false;
  resolvePass(state,carrier,{throwIn:true,offsideExempt:true,passKind:"short",maxMetres:28});
  ensureTickEvent(state,eventsBefore);return;
 }
 if(state.kickoffPassPending){
  state.kickoffPassPending=false;
  resolvePass(state,carrier,{passKind:"short",kickoff:true});
  ensureTickEvent(state,eventsBefore);return;
 }
 if(state.chainTeam!==state.possession){state.chainTeam=state.possession;state.chain=0;}state.chain=(Number(state.chain)||0)+1;
 const action=chooseAction(state,carrier);
 if(action&&action.type==="shot"){const ultimate=action.technique?null:activateBattleSimUltimate(state,carrier);resolveShot(state,carrier,false,ultimate,action.technique,action.adapted,action.pride);}
 else if(action&&action.type==="dribble")resolveDribble(state,carrier,{target:action.end,sharp:action.sharp,push:action.push,cut:action.cut,stride:action.stride});
 else if(action&&action.type==="malicia")resolveMalicia(state,carrier,action.read);
 else resolvePass(state,carrier,action?{option:action.option}:{});
 ensureTickEvent(state,eventsBefore);
}
function playerTick(state){
 simulateTick(state);
 [1,2].forEach(n=>state.teams[n].roster.forEach(p=>{if(p.flowActivationPending){p.flowActivationPending=false;addEvent(state,{type:"flow-activation",notable:true,teamNumber:n,description:p.name+" activates FLOW. Their flow is fully charged.",actors:[p],ability:abilityBadge(kitAbility(p,"flow-state"),"ultimate")||undefined,dialogue:[dialogue(state,p,"flow",true)]});}}));
}
function finish(state){
 if(state.status==="finished")return;state.timeSeconds=FULL;state.phase="fullTime";state.status="finished";state.manualPaused=false;state.runnerActive=false;state.pending=null;state.forced=null;state.requiredSub=null;state.stoppage="";
 addEvent(state,{type:"full-time",notable:true,description:"FULL TIME. "+state.teams[1].name+" "+state.score[1]+" — "+state.score[2]+" "+state.teams[2].name+".",actors:[]});
 [1,2].forEach(n=>state.teams[n].roster.forEach(p=>{const weaponBonus=p.battleSim?Math.min(.25,(p.match.specials||0)*.05):0;p.match.rating=Math.round(clamp(6+p.match.points+weaponBonus,3,10)*100)/100;}));
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

const INTRO_REVEAL_MS=760;
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
 let index=0;const reveal=()=>{introTimer=null;if(!match||!byId("bs-broadcast-intro"))return;spotlightMatchIntroPlayer(index,starters);index++;if(index<starters.length)introTimer=setTimeout(reveal,INTRO_REVEAL_MS);else introTimer=setTimeout(()=>{introTimer=null;if(number===1)showMatchIntroTeam(2);else showMatchIntroFinish();},1100);};
 introTimer=setTimeout(reveal,420);
}
function showMatchIntroFinish(){
 if(!match)return;clearMatchIntroTimer();const content=byId("bs-intro-content");if(!content)return;content.replaceChildren();const overlay=byId("bs-broadcast-intro");if(overlay){overlay.classList.add("bs-intro-fulltime");overlay.dataset.team="final";}
 const heading=make("div","bs-intro-finish-heading");put(heading,make("span","bs-kicker","ALL LINE-UPS CONFIRMED"));put(heading,make("h2","","MATCH READY"));put(heading,make("p","","Two teams. One kick-off. Let the match begin."));put(content,heading);
 const showdown=make("div","bs-intro-showdown");
 [1,2].forEach(number=>{const team=match.teams[number],card=make("section","bs-intro-showdown-team");card.style.setProperty("--bs-intro-team-color",team.color);put(card,make("span","bs-kicker","TEAM 0"+number));put(card,make("strong","",team.name));put(card,make("span","bs-intro-showdown-formation",team.formation+" · "+matchIntroStarters(team).length+" STARTERS"));put(showdown,card);});
 const vs=make("span","bs-intro-showdown-vs","VS");showdown.insertBefore(vs,showdown.children[1]);put(content,showdown);
 const kickoff=make("div","bs-intro-kickoff-call");put(kickoff,make("strong","","KICK-OFF"));put(kickoff,make("span","","THE LIVE MATCH STARTS NOW"));put(content,kickoff);
 const progress=byId("bs-intro-progress-fill");if(progress){progress.classList.remove("is-running");progress.style.setProperty("--intro-duration","1.2s");void progress.offsetWidth;progress.classList.add("is-running");}
 introTimer=setTimeout(()=>{introTimer=null;finishMatchIntro();},2200);
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
  marker.style.setProperty("--bs-team-color",team.color||BLUE);marker.title=player.name+" · "+slot.label+"\n"+playerWeaponsText(player);
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

function renderTeamCard(number){const t=setupTeams[number-1],card=make("section","bs-team-card");card.style.setProperty("--bs-team-color",t.color);card.setAttribute("data-team-card",number);const head=make("div","bs-team-card-heading");put(head,make("span","bs-kicker","TEAM 0"+number+" // MATCH SQUAD"));put(head,make("h2","",t.name));put(card,head);const identity=make("div","bs-team-identity"),name=make("input","bs-name-input");name.type="text";name.maxLength=32;name.value=t.name;name.setAttribute("data-team-name",number);labelField(identity,"Team name",name);const color=make("input","bs-color-input");color.type="color";color.value=t.color;color.setAttribute("data-team-color",number);labelField(identity,"Colour",color);put(card,identity);const source=make("div","bs-source-row"),sourceSelect=make("select","bs-select");
sourceSelect.setAttribute("data-team-source",number);
option(sourceSelect,"random","Generate random squad");
if(launchSnapshot)option(sourceSelect,"auction","Use current auction team");
savedTeams.forEach(item=>option(sourceSelect,"saved:"+idOf(item.id),"LOAD SAVED: "+item.name));
sourceSelect.value=t.source==="auction"&&launchSnapshot?"auction":t.source==="saved"&&savedTeams.some(item=>idOf(item.id)===idOf(t.savedId))?"saved:"+idOf(t.savedId):"random";
labelField(source,"CHOOSE SQUAD",sourceSelect);
const refresh=make("button","bs-mini-button","REFRESH SAVES");refresh.type="button";refresh.setAttribute("data-refresh-saved-teams","");put(source,refresh);
const formationSelect=make("select","bs-select");formationSelect.setAttribute("data-team-formation",number);Object.keys(FORMATIONS).forEach(f=>option(formationSelect,f,f));formationSelect.value=t.formation;labelField(source,"FORMATION",formationSelect);put(card,source);put(card,renderSetupFormation(t));put(card,renderSetupChemistry(t));
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
 byId("bs-setup-help").textContent="Choose a team directly from CHOOSE SQUAD, including Team Builder, Auction, and saved squads. REFRESH SAVES finds newly saved teams. SAVE TO BUILDER also keeps a named copy for Battle Sim.";window.SiteI18n?.apply(byId("bs-setup-view"));
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
 return p.name+" · "+(values?copy("Position OVR: position and chemistry. Live OVR: after stamina. Match Rating: performance."):copy("BASE OVR"))+" · "+cardLabel(p)+"\n"+playerWeaponsText(p);
}
function positionOVRMarkup(team,p){
 const values=playerOVR(team,p),wrap=make("span","bs-position-ratings");
 if(!values){put(wrap,make("span","","BASE OVR"));put(wrap,make("b","",Math.round(p.stats.ovr)));return wrap;}
 for(const [label,key] of [["POS OVR","position"],["LIVE OVR","live"]]){const row=make("span","bs-position-rating bs-position-rating--"+key);put(row,make("span","",label));put(row,make("b","",values[key]));put(wrap,row);}
 wrap.title=ratingTooltip(team,p);return wrap;
}
function liveFormationPoint(slot,flipY){const p=formationPoint(slot,flipY);return{x:12+(p.x-7)*76/86,y:10+(p.y-9)*80/82};}
function addPlayerRow(parent,p,team,slotIndex){
 const row=make("div","bs-match-player-row");row.dataset.playerId=p.id;row.setAttribute("role","button");row.tabIndex=0;row.setAttribute("aria-label","View "+p.name+" player profile");row.style.setProperty("--bs-team-color",team.color);portraitWithStamina(row,p,36);put(row,flowMeter(p.flow,p.name));
 const copy=make("div","bs-player-copy"),line=make("div","bs-player-name-line");put(line,make("strong","",p.name));put(line,make("span","bs-role-badge",p.role||"CM"));put(copy,line);
 put(copy,playerMeta(p.stats.ovr,ratingNow(p)));
 if(p.yellows>0||p.sentOff){const c=make("span","bs-player-card-state",cardLabel(p));c.classList.add(p.sentOff?"is-red-card":"is-yellow-card");put(copy,c);}
 const track=make("div","bs-stamina-track"),fill=make("span","bs-stamina-fill");fill.style.width=clamp(p.stamina,0,100)+"%";fill.style.background="hsl("+Math.round(clamp(p.stamina,0,100)*1.2)+" 82% 48%)";put(track,fill);put(copy,track);put(row,copy);put(parent,row);
}
// Registry lookup: every public reaction this player belongs to, from any kit in the player pool.
function reactionDefsFor(player){
 const out=[],seen=new Set(),me=idOf(player&&player.id),pool=typeof players!=="undefined"&&Array.isArray(players)?players:[];
 for(const holder of pool)for(const def of holder&&holder.battleSim&&Array.isArray(holder.battleSim.reactions)?holder.battleSim.reactions:[]){
  if(!def||!def.id||seen.has(def.id))continue;const members=reactionMembers(def,holder);if(!members.includes(me))continue;
  const partner=pool.find(x=>idOf(x.id)===members.find(id=>id!==me));if(!partner||partner.secretCharacter&&!player.secretCharacter)continue;
  seen.add(def.id);out.push({def,partner,members});
 }
 return out;
}
function battleSimProfileWeapons(player){
 const data=player&&player.battleSim&&typeof player.battleSim==="object"?player.battleSim:{};
 return[
  {type:"PASSIVE",items:Array.isArray(data.passives)?data.passives:[]},
  {type:"SPECIAL",items:Array.isArray(data.specials)?data.specials:[]},
  {type:"SPECIAL",items:Array.isArray(data.weapons)?data.weapons:[]},
  {type:"ULTIMATE",items:Array.isArray(data.ultimates)?data.ultimates:[]},
  // One shared definition per reaction, listed for both partners (whichever kit declares it).
  {type:"CHEMICAL REACTION",items:reactionDefsFor(player).map(x=>({...x.def,name:x.def.name,partnerName:x.partner.name}))}
 ].flatMap(group=>group.items.map(item=>({
  ...(item&&item.partnerName?{partnerName:String(item.partnerName)}:{}),
  id:String(item&&item.id||""),
  type:item&&[item.effect,...(Array.isArray(item.effects)?item.effects:[])].includes("flow-state")?"FLOW":group.type,
  name:String(item&& (item.name||item.id)||"Unnamed Battle Sim Weapon"),
  description:String(item&&item.description||"No description registered.")
 })));
}
const KEEPER_EFFECTS=["reflex-save","acrobatic-reach","smother-block","extended-parry","set-piece-ready","steady-keeper","super-reflex"],OUTFIELD_EFFECTS=["acrobatic-finish","support-movement"];
function battleSimProfileStatus(player,type,abilityId,state=match){
 if(!player||!state)return{label:"MATCH STATUS UNAVAILABLE",kind:"inactive"};
 // v0.8.9 data-driven kit entries.
 const kit=player.battleSim||{},shared=type==="CHEMICAL REACTION"?reactionDefsFor(player).find(x=>idOf(x.def.id)===idOf(abilityId)):null,entry=shared?shared.def:[...(kit.passives||[]),...(kit.weapons||[]),...(kit.ultimates||[])].find(item=>item&&(item.effect||item.effects)&&idOf(item.id)===idOf(abilityId));
 if(entry){
  const tick=Number(state.tick||0),runtime=player.battleSimState||{};
  // Position-aware kits: goalkeeping abilities only in goal, outfield-only abilities never in goal.
  const effects=[entry.effect,...(Array.isArray(entry.effects)?entry.effects:[])];
  if(type!=="CHEMICAL REACTION"&&effects.some(e=>KEEPER_EFFECTS.includes(e))&&player.role!=="GK"||effects.some(e=>OUTFIELD_EFFECTS.includes(e))&&player.role==="GK")return{label:"CONDITIONS UNMET",kind:"inactive"};
  if(type==="CHEMICAL REACTION"){
   const team=state.teams&&state.teams[player.teamNumber],partner=team&&shared&&active(team).find(p=>idOf(p.id)===idOf(shared.partner.id));
   if(!team||!active(team).some(p=>idOf(p.id)===idOf(player.id)))return{label:"CONDITIONS UNMET",kind:"inactive"};
   if(!partner)return{label:"PARTNER NOT ON PITCH",kind:"inactive"};
   const left=Math.max(0,Number(state.reactionCooldowns&&state.reactionCooldowns[reactionKey(entry,player.teamNumber)]||0)-tick);
   return left>0?{label:"ON COOLDOWN · "+left+" TICKS LEFT",kind:"cooldown",ticksLeft:left}:{label:"READY",kind:"ready",ticksLeft:0};
  }
  if(entry.effect==="feint-volley"){
   const uses=runtime.uses&&runtime.uses[entry.id]||{attempts:0,goals:0};
   if(uses.goals>=kitParam(entry,"maxGoalsPerMatch",1)||uses.attempts>=kitParam(entry,"maxAttemptsPerMatch",2))return{label:"USED THIS MATCH",kind:"used"};
   if(!isFlowing(player))return{label:"REQUIRES FLOW",kind:"inactive"};
   return{label:"READY · WAITING FOR PASS",kind:"ready"};
  }
  if(entry.effect==="flow-state")return isFlowing(player)?{label:"IN EFFECT",kind:"active"}:{label:"REQUIRES FLOW",kind:"inactive"};
  if(entry.params&&entry.params.cooldownTicks){const left=Math.max(0,Number(runtime.cooldowns&&(runtime.cooldowns[entry.id]||runtime.cooldowns["disguised-finish"])||0)-tick);return left>0?{label:"ON COOLDOWN · "+left+" TICKS LEFT",kind:"cooldown",ticksLeft:left}:{label:"READY",kind:"ready",ticksLeft:0};}
  return type==="PASSIVE"?{label:"IN EFFECT",kind:"active"}:{label:"READY",kind:"ready",ticksLeft:0};
 }
 if(type==="PASSIVE"){
  const ability=(player.battleSim&&player.battleSim.passives||[]).find(item=>idOf(item.id)===idOf(abilityId));
  if(ability&&ability.condition==="off-ball"){
   const active=!hasBall(player,state);
   return{label:active?"IN EFFECT":"INACTIVE · HAS POSSESSION",kind:active?"active":"inactive"};
  }
  return{label:"CONDITIONAL PASSIVE",kind:"inactive"};
 }
 if(type==="SPECIAL"){
  const until=Number(player.battleSimState&&player.battleSimState.cooldowns&&player.battleSimState.cooldowns[abilityId])||0;
  const ticksLeft=Math.max(0,until-Number(state.tick||0));
  return ticksLeft>0?{label:"ON COOLDOWN · "+ticksLeft+" TICKS LEFT",kind:"cooldown",ticksLeft}:{label:"READY",kind:"ready",ticksLeft:0};
 }
 if(type==="ULTIMATE"){
  const ability=(player.battleSim&&player.battleSim.ultimates||[]).find(item=>idOf(item.id)===idOf(abilityId));
  if(ability&&ability.condition&&ability.condition.duringFlow&&!isFlowing(player))return{label:"REQUIRES FLOW",kind:"inactive"};
  const used=Array.isArray(player.battleSimState&&player.battleSimState.usedUltimates)&&player.battleSimState.usedUltimates.includes(idOf(abilityId));
  if(used)return{label:"USED THIS FLOW",kind:"used"};
  if(ability&&ability.condition&&ability.condition.receivedPass&&!hasJustReceivedPass(state,player))return{label:"READY · WAITING FOR PASS",kind:"ready"};
  return{label:"READY THIS FLOW",kind:"ready"};
 }
 return{label:"REGISTERED",kind:"ready"};
}
function updateMatchPlayerProfileStatuses(root){
 if(!root||!match)return;
 root.querySelectorAll(".bs-player-profile-overlay").forEach(overlay=>{
  const team=match.teams&&match.teams[Number(overlay.dataset.profileTeamNumber)];
  const player=team&&playerIn(team,overlay.dataset.profilePlayerId);
  if(!player)return;
  overlay.querySelectorAll(".bs-player-profile-weapon[data-profile-ability-id]").forEach(card=>{
   const statusNode=card.querySelector("[data-profile-ability-status]");
   if(!statusNode)return;
   const status=battleSimProfileStatus(player,card.dataset.profileAbilityType,card.dataset.profileAbilityId,match);
   statusNode.textContent=status.label;
   statusNode.className="bs-player-profile-weapon-status is-"+status.kind;
   statusNode.title=status.ticksLeft>0?status.ticksLeft+" match ticks remaining":status.label;
  });
 });
}
function closeMatchPlayerProfile(panel,restoreFocus=true){
 if(!panel)return;
 const overlay=panel.querySelector(".bs-player-profile-overlay");
 if(!overlay)return;
 const trigger=panel._profileTrigger;
 overlay.remove();
 panel._profileTrigger=null;
 if(trigger)trigger.setAttribute("aria-expanded","false");
 if(restoreFocus&&trigger&&trigger.isConnected){
  try{trigger.focus({preventScroll:true});}catch(error){trigger.focus();}
 }
}
function openMatchPlayerProfile(panel,player,trigger){
 if(!panel||!player)return;
 closeMatchPlayerProfile(panel,false);
 panel._profileTrigger=trigger||null;
 if(trigger)trigger.setAttribute("aria-expanded","true");
 const overlay=make("section","bs-player-profile-overlay");
 overlay.dataset.profilePlayerId=idOf(player.id);overlay.dataset.profileTeamNumber=String(player.teamNumber||panel.dataset.team||"");
 overlay.setAttribute("role","dialog");
 overlay.setAttribute("aria-modal","false");
 overlay.setAttribute("aria-label",player.name+" Battle Sim profile");

 const header=make("header","bs-player-profile-header");
 const identity=make("div","bs-player-profile-identity");
 const portrait=make("img","bs-player-profile-portrait");
 portrait.src=portraitSource(player);
 portrait.alt=player.name;
 portrait.loading="lazy";
 portrait.onerror=function(){
  portrait.onerror=null;
  if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")portrait.src=PLAYER_IMAGE_FALLBACK;
 };
 put(identity,portrait);
 const heading=make("div","bs-player-profile-heading");
 put(heading,make("strong","bs-player-profile-name",player.name));
 const positions=Array.isArray(player.positions)&&player.positions.length?player.positions:[player.primaryPosition||"—"];
 put(heading,make("span","bs-player-profile-positions",positions.join(" · ")));
 put(identity,heading);
 put(header,identity);
 button(header,"×","bs-player-profile-close",{"aria-label":"Close player profile","data-close-player-profile":"true"});
 put(overlay,header);

 const statsSection=make("section","bs-player-profile-stats");
 put(statsSection,make("h3","bs-player-profile-section-title","BASE STATS"));
 const grid=make("div","bs-player-profile-stat-grid");
 const stats=player.stats||{};
 [["OVR","ovr"],["OFF","off"],["SHO","sho"],["DRI","dri"],["PAS","pas"],["SPD","spd"],["DEF","def"],["GK","gk"]].forEach(([label,key])=>{
  const cell=make("div","bs-player-profile-stat");
  put(cell,make("span","",label));
  const value=Number(stats[key]);
  put(cell,make("strong","",Number.isFinite(value)?String(Math.round(value)):"—"));
  put(grid,cell);
 });
 put(statsSection,grid);
 put(overlay,statsSection);

 const weaponSection=make("section","bs-player-profile-weapons");
 put(weaponSection,make("h3","bs-player-profile-section-title","BATTLE SIM WEAPONS"));
 const weaponList=make("div","bs-player-profile-weapon-list");
 const weapons=battleSimProfileWeapons(player);
 weaponList.style.setProperty("--bs-profile-weapon-count",String(Math.max(1,weapons.length)));
 if(!weapons.length){
  put(weaponList,make("p","bs-player-profile-empty","No Battle Sim weapons registered."));
 }else{
  weapons.forEach(weapon=>{
   const item=make("article","bs-player-profile-weapon");
   item.dataset.profileAbilityId=weapon.id;item.dataset.profileAbilityType=weapon.type;
   const top=make("div","bs-player-profile-weapon-top");
   put(top,make("strong","bs-player-profile-weapon-name",weapon.name));
   put(top,make("span","bs-player-profile-weapon-type",weapon.type));
   put(item,top);
   if(weapon.partnerName){const withLine=make("p","bs-player-profile-weapon-partner"),lead=make("span","","WITH:");lead.dataset.battleMessage="WITH:";lead.dataset.battleEnglish="WITH:";withLine.append(lead," "+weapon.partnerName);put(item,withLine);item.classList.add("has-partner");}
   const status=make("span","bs-player-profile-weapon-status");status.dataset.profileAbilityStatus="true";put(item,status);
   put(item,make("p","bs-player-profile-weapon-description",weapon.description));
   put(weaponList,item);
  });
 }
 put(weaponSection,weaponList);
 put(overlay,weaponSection);
 put(panel,overlay);
 updateMatchPlayerProfileStatuses(panel);
 const close=overlay.querySelector(".bs-player-profile-close");
 if(close)close.focus({preventScroll:true});
}
function bindMatchPlayerProfiles(root){
 if(!root||root._playerProfileEventsBound)return;
 root._playerProfileEventsBound=true;
 root.addEventListener("click",event=>{
  const node=event.target&&event.target.nodeType===1?event.target:event.target&&event.target.parentElement;
  if(!node)return;
  const close=node.closest("[data-close-player-profile]");
  if(close){
   closeMatchPlayerProfile(close.closest(".bs-match-team-panel"));
   return;
  }
  if(node.closest("button,select,input,textarea,a"))return;
  const trigger=node.closest(".bs-match-team-panel [data-player-id]");
  if(!trigger||!root.contains(trigger))return;
  const panel=trigger.closest(".bs-match-team-panel"),teamNumber=Number(panel.dataset.team);
  const team=match&&match.teams&&match.teams[teamNumber];
  const player=team&&playerIn(team,trigger.dataset.playerId);
  if(player)openMatchPlayerProfile(panel,player,trigger);
 });
 root.addEventListener("keydown",event=>{
  const node=event.target&&event.target.nodeType===1?event.target:event.target&&event.target.parentElement;
  if(!node)return;
  if(event.key==="Escape"){
   const panel=node.closest(".bs-match-team-panel");
   if(panel&&panel.querySelector(".bs-player-profile-overlay")){
    event.preventDefault();
    closeMatchPlayerProfile(panel);
   }
   return;
  }
  if(event.key!=="Enter"&&event.key!==" ")return;
  const trigger=node.closest(".bs-match-team-panel .bs-formation-player, .bs-match-team-panel .bs-bench-player, .bs-match-team-panel .bs-match-player-row");
  if(!trigger||node!==trigger||node.closest("button,select,input,textarea,a"))return;
  event.preventDefault();
  const panel=trigger.closest(".bs-match-team-panel"),teamNumber=Number(panel.dataset.team);
  const team=match&&match.teams&&match.teams[teamNumber];
  const player=team&&playerIn(team,trigger.dataset.playerId);
  if(player)openMatchPlayerProfile(panel,player,trigger);
 });
}
function stoppageReady(state=match){return ["stoppage","substitution"].includes(progressionState(state));}
function panelSignature(team){return JSON.stringify([team.formation,team.slots,team.assignment,team.roster.filter(p=>p.sentOff).map(p=>p.id),stoppageReady(),stoppageReady()&&match.requiredSub]);}
function updateTeamPanel(panel,team,state=match){
 const possession=panel.querySelector(".bs-team-possession-label");if(possession)possession.textContent=state.possession===team.number?"IN POSSESSION":"OUT OF POSSESSION";
 if(!panel._playerBindings)panel._playerBindings=Array.from(panel.querySelectorAll("[data-player-id]")).map(marker=>({marker,ring:marker.querySelector(".bs-stamina-ring"),meter:marker.querySelector(".bs-flow-meter"),rating:marker.querySelector(".bs-rating-value"),live:marker.querySelector(".bs-live-ovr b"),liveWrap:marker.querySelector(".bs-live-ovr")}));
 const roster=new Map(team.roster.map(p=>[p.id,p])),ratings=positionRatings(team);
 panel._playerBindings.forEach(({marker,ring,meter,rating,live,liveWrap})=>{
  const p=roster.get(marker.dataset.playerId);if(!p)return;
  marker.title=ratingTooltip(team,p,ratings);marker.classList.toggle("is-flowing",isFlowing(p));const ovr=playerOVR(team,p,ratings);if(live&&ovr&&live.textContent!==String(ovr.live))live.textContent=ovr.live;if(liveWrap)liveWrap.style.setProperty("--stamina-hue",String(Math.round(clamp(p.stamina,0,100)*1.2)));
  if(ring){ring.classList.toggle("is-flowing",isFlowing(p));ring.style.setProperty("--stamina",clamp(p.stamina,0,100)+"%");ring.style.setProperty("--stamina-hue",Math.round(p.stamina*1.2));}
  if(meter){meter.style.setProperty("--flow",p.flow+"%");meter.setAttribute("aria-valuenow",Math.round(p.flow));meter.title=p.name+" · FLOW "+Math.round(p.flow)+"%";meter.classList.toggle("is-full",p.flow>=100);}
  if(rating&&rating.textContent!==ratingNow(p).toFixed(2)){rating.textContent=ratingNow(p).toFixed(2);rating.style.color=ratingColor(ratingNow(p));}
 });
}
function matchTeamPanel(number,state=displayState()){
 const t=state.teams[number],aside=make("aside","bs-match-team-panel");aside.dataset.team=number;aside.dataset.structure=panelSignature(t);aside.style.setProperty("--bs-team-color",t.color);
 put(aside,make("span","bs-kicker","TEAM 0"+number));put(aside,make("h2","",t.name));
 put(aside,make("span","bs-team-possession-label",state.possession===number?"IN POSSESSION":"OUT OF POSSESSION"));put(aside,renderMiniFormation(number,state));put(aside,renderMatchChemistry(t));
 const benchHead=make("div","bs-panel-subhead");put(benchHead,make("strong","","RESERVES"));put(benchHead,make("span","",bench(t).length));put(aside,benchHead);
 const benchList=make("div","bs-match-bench");bench(t).forEach(p=>{const row=make("div","bs-bench-player");row.dataset.playerId=p.id;row.setAttribute("role","button");row.tabIndex=0;row.setAttribute("aria-label","View "+p.name+" player profile");row.style.setProperty("--bs-team-color",t.color);portraitWithStamina(row,p,38);put(row,flowMeter(p.flow,p.name));if(stoppageReady()){row.draggable=true;row.setAttribute("data-drag-reserve",p.id);row.setAttribute("data-drag-team",number);row.title="Drag onto a player on the pitch to substitute";}
  const info=make("div","bs-player-copy");put(info,make("strong","",p.name));put(info,playerMeta(p.stats.ovr,ratingNow(p),"bs-player-subline","BASE OVR"));
  if(p.yellows>0||p.sentOff){const c=make("span","bs-player-card-state",cardLabel(p));c.classList.add(p.sentOff?"is-red-card":"is-yellow-card");put(info,c);}put(row,info);
  if(stoppageReady()&&!match.requiredSub){const sel=make("select","bs-select bs-swap-select");sel.setAttribute("aria-label","Replace starter…");sel.setAttribute("data-sub-target-for",p.id);option(sel,"","Replace starter…");Object.keys(t.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const current=playerIn(t,t.assignment[k]);if(current&&current.role!=="GK")option(sel,k,(t.slots[Number(k)]?t.slots[Number(k)].label:"Slot")+" · "+current.name);});put(row,sel);button(row,"SUB IN","bs-mini-button",{"data-sub-in":p.id,"data-sub-team":number});}
  put(benchList,row);
 });if(!bench(t).length)put(benchList,make("p","bs-empty-note","No available reserves."));put(aside,benchList);
 const tactics=make("details","bs-match-tactics");put(tactics,make("summary","","ADJUST TACTICS"));put(tactics,stratControls(number,t,true));put(aside,tactics);const dossier=make("details","bs-team-dossier");dossier.open=window.matchMedia?window.matchMedia("(min-width: 781px)").matches:true;put(dossier,make("summary","","FORMATION & SQUAD"));Array.from(aside.children).slice(3).forEach(child=>put(dossier,child));put(aside,dossier);return aside;
}
// Both side formations read top-to-bottom the same way: forwards at the top, goalkeeper and goal box at
// the bottom. Display only; simulation coordinates are untouched.
function renderMiniFormation(number,state=displayState()){
 const team=state.teams[number],pitch=make("div","bs-mini-pitch");
 pitch.setAttribute("aria-label",(window.BattleCopy?window.BattleCopy("{team} formation",{team:team.name}):team.name+" formation"));
 put(pitch,make("div","bs-mini-pitch-markings"));
 appendFormationChemistryLines(pitch,team,false,"bs-mini-chemistry-lines",liveFormationPoint);
 const ratings=positionRatings(team);
 Object.keys(team.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{
  const p=playerIn(team,team.assignment[k]),slot=team.slots[Number(k)];if(!slot)return;
  if(!p||p.sentOff){
   const req=match.requiredSub;
   if(!(stoppageReady()&&req&&req.teamNumber===number&&String(req.slot)===String(k)))return;
   const empty=make("div","bs-formation-player bs-formation-player--vacant");
   positionMarker(empty,slot,false,liveFormationPoint);empty.dataset.slot=k;empty.style.setProperty("--bs-team-color",team.color);
   empty.setAttribute("data-swap-slot",k);empty.setAttribute("data-swap-team",number);
   put(empty,make("strong","bs-formation-player-name","VACANT"));put(pitch,empty);return;
  }
  const card=make("div","bs-formation-player bs-formation-player--compact"+(isFlowing(p)?" is-flowing":""));
  card.setAttribute("role","button");card.tabIndex=0;card.setAttribute("aria-label","View "+p.name+" player profile · "+slot.label);
  if(stoppageReady()&&p.role!=="GK"){card.setAttribute("data-swap-slot",k);card.setAttribute("data-swap-team",number);}
  positionMarker(card,slot,false,liveFormationPoint);
  card.dataset.slot=k;card.dataset.playerId=p.id;card.style.setProperty("--bs-team-color",team.color);
  const face=make("div","bs-mini-card-face"),picture=make("div","bs-mini-card-avatar");
  portraitWithStamina(picture,p,27);put(face,picture);
  const info=make("div","bs-mini-card-info"),role=make("strong","bs-mini-card-role",slot.label),live=make("span","bs-live-ovr");
  const ovr=playerOVR(team,p,ratings);
  live.title=ratingTooltip(team,p,ratings);
  live.style.setProperty("--stamina-hue",String(Math.round(clamp(p.stamina,0,100)*1.2)));
  put(live,make("b","",ovr?.live??Math.round(p.stats.ovr)));
  put(info,role);put(info,live);put(face,info);put(card,face);
  const meter=flowMeter(p.flow,p.name);meter.classList.add("bs-mini-flow-horizontal");put(card,meter);
  // The compact sketch deliberately omits a visible name; full identity is
  // retained for pointer/keyboard assistive technology and card interaction.
  put(card,make("strong","bs-formation-player-name bs-visually-hidden",p.name));
  if(p.yellows>0)put(card,make("span","bs-player-card-state is-yellow-card","YC "+p.yellows));
  card.title=p.name+" · "+slot.label+" · "+(ovr?.live??p.stats.ovr)+" LIVE OVR · FLOW "+Math.round(p.flow)+"% · Click to view profile";put(pitch,card);
 });return pitch;
}
function projectPitch(state){
 const points=new Map(),placed=[];
 // Independent physics pixel plane -> displayed percentage plane. Visual collision
 // adjustments NEVER mutate the physical coordinates or action calculations.
 for(const n of [1,2])for(const p of active(state.teams[n])){
  const q=renderPoint(p),key=n+":"+p.id;let x=clamp(q.x,4.5,95.5),y=clamp(q.y,7,93),crowded=false;
  for(let tries=0;tries<12&&placed.some(a=>Math.hypot((x-a.x)*1.05,(y-a.y)*.68)<1.75);tries++){
   crowded=true;const theta=((tries*137.5+(Number(p.id)||p.name.length)*13)%360)*Math.PI/180;
   x=clamp(q.x+Math.cos(theta)*(1.6+tries*.28),4.5,95.5);
   y=clamp(q.y+Math.sin(theta)*(2.2+tries*.38),7,93);
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
 const trail=document.createElementNS(svg.namespaceURI,"svg");trail.setAttribute("viewBox","0 0 100 100");trail.setAttribute("preserveAspectRatio","none");trail.setAttribute("class","bs-ball-trail");trail.setAttribute("aria-hidden","true");const line=document.createElementNS(svg.namespaceURI,"path");line.setAttribute("fill","none");line.setAttribute("stroke-linecap","round");put(trail,line);const run=document.createElementNS(svg.namespaceURI,"path");run.setAttribute("fill","none");run.setAttribute("stroke-linecap","round");run.setAttribute("class","bs-run-route");put(trail,run);put(pitch,trail);
 const ball=make("span","bs-live-ball","⚽");ball.setAttribute("aria-hidden","true");put(pitch,ball);
 pitch._live={markers:new Map(),ball,line,run,lastEvent:0};
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
 let target=renderPoint(state.ball||state.ballZone);
 if(event?.type==="goal")target={x:event.teamNumber===1?98:2,y:50};
 ui.ball.style.setProperty("--x",clamp(target.x,2,98));ui.ball.style.setProperty("--y",clamp(target.y,4,96));
 if(eventId!==ui.lastEvent){
  const route=event?.passRoute,shotRoute=event?.type==="shot-attempt"?event.shotRoute:null;
  if(shotRoute){
   const a=renderPoint(shotRoute.from),b=renderPoint(shotRoute.to);
   ui.line.setAttribute("d",["M",a.x,a.y,"L",b.x,b.y].join(" "));
   ui.line.style.stroke="#ffe08a";ui.line.style.strokeDasharray="1.5 1.1";
   ui.line.style.strokeWidth="0.8";ui.line.style.filter="drop-shadow(0 0 1.5px rgba(255,224,138,.8))";
   ui.line.style.opacity="1";
  }else if(route&&["pass","set-piece","interception","turnover","rebound","offside","throw-in"].includes(event.type)){
   const a=renderPoint(route.from),b=renderPoint(route.to),dx=b.x-a.x,dy=b.y-a.y,span=Math.max(1,Math.hypot(dx,dy));
   const curve=Math.min(20,span*.22),middle={x:(a.x+b.x)/2-dy/span*curve,y:(a.y+b.y)/2+dx/span*curve};
   const path=route.kind==="long"?["M",a.x,a.y,"Q",middle.x,middle.y,b.x,b.y].join(" "):["M",a.x,a.y,"L",b.x,b.y].join(" ");
   ui.line.setAttribute("d",path);ui.line.style.stroke=chemistryPassColor(route.chemistry);
   ui.line.style.strokeDasharray="";ui.line.style.strokeWidth="";ui.line.style.filter="";ui.line.style.opacity="1";
  }else{
   ui.line.style.strokeDasharray="";ui.line.style.strokeWidth="";ui.line.style.filter="";ui.line.style.opacity="0";
  }
  // The receiver's run (through balls): drawn from where he started to where he met the ball.
  const runRoute=event?.runRoute;
  if(ui.run){if(runRoute){const a=renderPoint(runRoute.from),b=renderPoint(runRoute.to);ui.run.setAttribute("d",["M",a.x,a.y,"L",b.x,b.y].join(" "));ui.run.style.opacity="1";}else ui.run.style.opacity="0";}
  pitch.dataset.action=event?.type||"kickoff";
  ui.target=target;ui.lastEvent=eventId;
 }
 const possession=byId("bs-possession-status");if(possession)possession.textContent="POSSESSION: "+state.teams[state.possession].name;
}
function eventMessage(event){
 const actor=event.actors?.[0],other=event.actors?.[1],team=match?.teams[event.teamNumber];
 const keys={pass:"{player} completes a pass to {other}.","set-piece":"{player} completes a pass to {other}.",dribble:"{player} advances with the ball.",carry:"{player} advances with the ball.",interception:"{player} wins possession.",turnover:"{player} wins possession.",rebound:"{player} wins possession.","shot-attempt":"{player} shoots for {team}.",goal:"{player} scores for {team}!",save:"{player} saves the shot.",kickoff:"{team} restart play.",foul:"{player} commits a foul.","yellow-card":"{player} receives a card.","red-card":"{player} receives a card.",substitution:"{team} bring on {player} for {other}.","flow-activation":"{player} activates FLOW.","half-time":"HALF TIME","full-time":"FULL TIME",corner:"CORNER","goal-kick":"GOAL KICK",offside:"{player} is caught offside.","throw-in":"{team} take a throw-in.",shield:"{player} holds off the challenge and keeps the ball."};
 const player=event.type==="save"||event.type==="turnover"?other:event.type==="interception"?event.actors?.at(-1):actor;
 return{key:keys[event.type]||"Both teams reset their shape.",values:{player:player?.name||"",other:other?.name||"",team:team?.name||""}};
}
function renderEvent(event,archive){
 const item=make("article","bs-feed-event bs-feed-event--"+event.type+(event.notable?" is-notable":" is-routine"));item.dataset.eventId=String(event.id);
 const holder=match&&match.teams&&(match.teams[event.teamNumber]||match.teams[event.possessionTeamNumber]);if(holder&&holder.color)item.style.setProperty("--bs-event-team-color",holder.color);
 const top=make("div","bs-feed-event-top");put(top,make("time","bs-event-time",event.time||timeLabel(event.timeSeconds)));
 const typeLabel=String(event.type).replace(/-/g," ").toUpperCase(),typeNode=make("span","bs-event-type",typeLabel);typeNode.dataset.battleMessage=typeLabel;typeNode.dataset.battleEnglish=typeLabel;if(event.type==="flow-activation")typeNode.classList.add("flow-text");put(top,typeNode);put(item,top);const description=make("p","bs-event-description",event.description),copy=eventMessage(event);description.dataset.battleMessage=copy.key;description.dataset.battleValues=JSON.stringify(copy.values);description.dataset.battleEnglish=event.description;put(item,description);
 if(event.comparison||event.probability!=null){const analysis=make("div","bs-event-analysis");if(event.comparison){const c=event.comparison;put(analysis,make("span","bs-event-stat-comparison",String(c.attackerLabel||"ATT")+" "+Math.round(Number(c.attackerValue)||0)+" ↔ "+String(c.defenderLabel||"DEF")+" "+Math.round(Number(c.defenderValue)||0)));}if(event.probability!=null)put(analysis,make("span","bs-event-success",String(event.probabilityLabel||"SUCCESS CHANCE")+" "+Math.round(clamp(Number(event.probability)||0,0,1)*100)+"%"));put(item,analysis);}
 // Activated ability / chemical reaction labels sit directly above the player cards, each tied to the
 // player who used it (both partners for a reaction). Translated; the outcome is in the description.
 const badges=["reaction","ability","abilityNote"].map(k=>event[k]&&{k,b:event[k]}).filter(Boolean).filter((x,i,list)=>list.findIndex(y=>y.b.id===x.b.id)===i);
 if(badges.length){const row=make("div","bs-event-abilities"),cast=Array.isArray(event.actors)?event.actors:[];
  const ownsKit=(actor,id)=>{const source=typeof playerById==="function"?playerById(actor.id):null,kit=source&&source.battleSim;return !!kit&&["passives","weapons","ultimates"].some(g=>(kit[g]||[]).some(e=>e&&String(e.id)===String(id)));};
  badges.forEach(({k,b})=>{const chip=make("span","bs-event-ability bs-event-ability--"+(k==="reaction"?"reaction":b.kind||"ability")),label=make("span","bs-event-ability-label",b.label);label.dataset.battleMessage=b.label;label.dataset.battleEnglish=b.label;put(chip,label);
   const owners=k==="reaction"?cast.slice(0,2):cast.filter(actor=>ownsKit(actor,b.id)).slice(0,1);
   if(owners.length)put(chip,make("span","bs-event-ability-owner",owners.map(o=>o.name).join(" × ")));
   put(row,chip);});put(item,row);}
 if(event.actors&&event.actors.length){const actors=make("div","bs-event-actors");event.actors.slice(0,3).forEach(p=>{const row=make("div","bs-event-actor"),img=make("img","bs-event-portrait"),actorTeam=match&&match.teams[p.teamNumber];if(actorTeam&&actorTeam.color)row.style.setProperty("--bs-actor-color",actorTeam.color);img.src=portraitSource(p);img.alt=p.name||"Player";img.loading="lazy";img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;};put(row,img);put(row,flowMeter(p.flow,p.name));put(row,make("span","bs-event-actor-name",p.name));put(actors,row);});put(item,actors);}
 if(Array.isArray(event.nearbyDefenders)&&event.nearbyDefenders.length){
  const panel=make("div","bs-event-nearby-defenders");
  put(panel,make("strong","bs-event-nearby-heading","NEARBY DEFENDERS · "+event.nearbyDefenders.length));
  const list=make("div","bs-event-nearby-list");
  event.nearbyDefenders.forEach(defender=>{
   const row=make("div","bs-event-nearby-player"+(defender.selected?" is-selected":""));
   put(row,make("span","bs-event-nearby-name",defender.name));
   put(row,make("span","bs-event-nearby-meta","DEF "+Math.round(Number(defender.def)||0)+" · "+Number(defender.distance||0).toFixed(1)+"m"));
   if(defender.selected)put(row,make("span","bs-event-nearby-selected","USED FOR ROLL"));
   put(list,row);
  });
  put(panel,list);put(item,panel);
 }
if(Array.isArray(event.dialogue)&&event.dialogue.length){const lines=make("div","bs-event-dialogue");event.dialogue.forEach(line=>{
  // Character lines carry their source key and are shown in the reader's language.
  if(line.key&&line.text.endsWith(String.fromCharCode(34)+line.key+String.fromCharCode(34))){const p=make("p","bs-event-line"),speaker=line.text.slice(0,line.text.length-line.key.length-2),quote=make("span","bs-event-line-text",line.key);quote.dataset.battleMessage=line.key;quote.dataset.battleEnglish=line.key;p.append(speaker+String.fromCharCode(8220),quote,String.fromCharCode(8221));put(lines,p);}
  else put(lines,make("p","",line.text));});put(item,lines);}
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
   trimLiveFeed(root);
   match.presentedEventId=event.id;storeActiveMatch();renderMatch();
  }
  if(feedQueue.length)scheduleFeedEvent();
  presentationSettled();
 },delay);
}
function trimLiveFeed(root){
 if(!root)return;
 const events=Array.from(root.querySelectorAll("[data-event-id]"));
 events.slice(MAX_LIVE_FEED_EVENTS).forEach(event=>event.remove());
}
function renderFeed(){
 const root=byId("bs-live-feed");if(!root||!match)return;
 // Append-only engine history: restore once, enqueue only the new suffix.
 if(root._feedMatch!==match){
  root._feedMatch=match;root._queuedThrough=match.presentedEventId||0;
  root.querySelectorAll("[data-event-id]").forEach(e=>e.remove());
  const firstVisible=Math.max(0,root._queuedThrough-MAX_LIVE_FEED_EVENTS);
  match.events.slice(firstVisible,root._queuedThrough).forEach(e=>root.prepend(renderEvent(e,false)));
  trimLiveFeed(root);
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
 if(freeKick?.type==="free-kick"){
  freeKick.freeKickType=freeKick.freeKickType||(distance(point(freeKick.point||legacyPoint(freeKick.zone)),targetGoal(freeKick.teamNumber))>40?"midfield":"attacking");
  if(freeKick.routine==="pass")freeKick.routine="short-pass";
  if(freeKick.freeKickType==="midfield"&&freeKick.routine==="direct")freeKick.routine="short-pass";
 }
 const signature=JSON.stringify([match.stoppage,match.pending,required]);if(!wasHidden&&root.dataset.stoppageSignature===signature)return;root.dataset.stoppageSignature=signature;
 byId("bs-stoppage-title").textContent=match.stoppage||"PLAY PAUSED";
 byId("bs-stoppage-title").dataset.battleMessage=match.stoppage||"PLAY PAUSED";byId("bs-stoppage-title").dataset.battleEnglish=match.stoppage||"PLAY PAUSED";
 byId("bs-stoppage-description").textContent=required?"A player has been sent off. Select a replacement before proceeding.":match.stoppage==="HALF TIME"?"Half-time. Adjust tactics or make substitutions before the second half.":match.stoppage==="GOAL"?"Goal confirmed. Proceed to the restart.":match.stoppage==="SAVE"?"The goalkeeper has possession. Proceed to the next sequence.":"Play is paused. Make substitutions or adjust tactics before proceeding.";
 const controls=byId("bs-set-piece-controls");controls.replaceChildren();const pending=match.pending;
 if(pending&&["penalty","free-kick","corner","goal-kick"].includes(pending.type)){
  const team=match.teams[pending.teamNumber];if(pending.type==="goal-kick"){const modeLabel=make("label","bs-field");put(modeLabel,make("span","bs-field-label","Goal kick taker"));const mode=make("select","bs-select");mode.id="bs-goal-kick-taker-mode";option(mode,"gk","Goalkeeper (default)");option(mode,"outfield","Choose an outfield player");mode.value=pending.goalKickTaker==="outfield"?"outfield":"gk";put(modeLabel,mode);put(controls,modeLabel);}const takerLabel=make("label","bs-field");put(takerLabel,make("span","bs-field-label","Set-piece taker"));
  const taker=make("select","bs-select");taker.id="bs-set-piece-taker";
  const skill=setPieceSkill(pending),isGoalKick=pending.type==="goal-kick";
  active(team).filter(p=>isGoalKick?(pending.goalKickTaker==="outfield"?p.role!=="GK":p.role==="GK"):p.role!=="GK")
   .slice().sort((a,b)=>effective(b,skill)-effective(a,skill))
   .forEach(p=>option(taker,p.id,p.name+" · "+skill.toUpperCase()+" "+Math.round(effective(p,skill))));
  const selected=setPieceTaker(match,pending);if(selected)taker.value=idOf(selected.id);put(takerLabel,taker);put(controls,takerLabel);
  const routineLabel=make("label","bs-field");put(routineLabel,make("span","bs-field-label","Routine"));
  const routine=make("select","bs-select");routine.id="bs-set-piece-routine";
  if(pending.type==="penalty")option(routine,"direct","Take the penalty");
  else if(pending.type==="goal-kick"){option(routine,"short","Short distribution");option(routine,"direct","Long distribution");}
  else if(pending.type==="corner"){option(routine,"cross","Cross into the box");option(routine,"short","Short corner");}
  else if(pending.type==="free-kick"){
   if(pending.freeKickType==="midfield"){option(routine,"short-pass","Short pass");option(routine,"long-pass","Long pass");}
   else{option(routine,"direct","Shoot");option(routine,"short-pass","Short pass");option(routine,"long-pass","Long pass");}
  }
  routine.value=pending.routine||"direct";put(routineLabel,routine);put(controls,routineLabel);
 }
 if(required){
  const section=make("section","bs-required-substitution");put(section,make("strong","","MANDATORY SUBSTITUTION"));
  put(section,make("p","bs-help-text","Replace the sent-off player to continue the match."));
  const select=make("select","bs-select");select.id="bs-required-sub-player";option(select,"","Choose a reserve…",false);
  const team=match.teams[required.teamNumber],reserves=bench(team);
  reserves.forEach(p=>option(select,p.id,p.name+" · OVR "+Math.round(p.stats.ovr)));
  if(required.reserveId)select.value=required.reserveId;
  if(!reserves.length){select.disabled=true;put(section,make("p","bs-help-text","No reserve is available. Return to setup and add a substitute before continuing."));}
  put(section,select);
  const confirm=button(section,"CONFIRM REPLACEMENT","bs-button bs-button--primary",{"data-required-substitute":required.teamNumber});confirm.disabled=!reserves.length;put(controls,section);
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
 bindMatchPlayerProfiles(root);
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
 updateMatchPlayerProfileStatuses(root);
 updateSequenceControls();
 window.SiteI18n?.apply(byId("bs-match-view"));
 const pause=byId("bs-pause-match");if(pause){pause.disabled=stoppageReady()||match.status==="finished";pause.textContent=match.manualPaused?"RESUME SIM":"PAUSE SIM";}
 const ff=byId("bs-fast-forward");if(ff)ff.disabled=match.status==="finished";
}
function teamSummary(number){
 const t=match.teams[number],s=t.stats,poss=Math.round(s.poss/Math.max(1,match.tick)*100),panel=make("section","bs-result-team-card");
 panel.style.setProperty("--bs-team-color",t.color);put(panel,make("span","bs-kicker","TEAM 0"+number));put(panel,make("h3","",t.name));
 const grid=make("div","bs-result-team-metrics");
 const values=[["Possession",poss+"%"],["Shots",s.shots],["On target",s.onTarget],["Passes",s.passes+"/"+s.attempted],["Pass accuracy",(s.attempted?Math.round(s.passes/s.attempted*100):0)+"%"],["Tackles",s.tackles],["Interceptions",s.interceptions],["Saves",s.saves],["Turnovers",s.turnovers],["Fouls",s.fouls],["Offsides",Number(s.offsides)||0],["Corners",s.corners],["Cards",s.yellowCards+"Y / "+s.redCards+"R"]];
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
 slot=String(slot);
 const p=playerIn(team,reserveId),out=playerIn(team,team.assignment[slot]),required=match&&match.requiredSub;
 // Simulation-level guard: UI state can never return a substituted-off player,
 // duplicate a starter, or bypass a pending mandatory replacement.
 if(!match||match.teams[team.number]!==team||(!fastForwarding&&!stoppageReady())||!p||!out||idOf(p.id)===idOf(out.id)||!substitutionEligible(team,p)||
  isSpecialKeeper(p)||isSpecialKeeper(out)||!team.slots[Number(slot)]||
  (required&&required.teamNumber===team.number&&String(required.slot)!==slot))return false;
 if(idOf(match.carrierId)===idOf(out.id)&&match.possession===team.number)match.carrierId=p.id;
 setPosition(p,out);p.homeX=out.homeX;p.homeY=out.homeY;p.homeZone=out.homeZone;p.role=team.slots[Number(slot)]?team.slots[Number(slot)].label:"CM";
 p.movementProgress=0;p.stamina=Math.max(p.stamina,92);team.assignment[slot]=p.id;out.role="BENCH";out.homeZone=out.zone;
 p.matchStatus="subbed-on";out.matchStatus=out.sentOff?"sent-off":"subbed-off";
 if(!Array.isArray(team.substitutions))team.substitutions=[];
 team.substitutions.push({slot,on:idOf(p.id),off:idOf(out.id),tick:Number(match.tick)||0,timeSeconds:Number(match.timeSeconds)||0});
 if(required&&required.teamNumber===team.number&&String(required.slot)===slot)match.requiredSub=null;
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
 if(b.hasAttribute("data-refresh-saved-teams")){savedTeams=loadSavedTeams();renderInit();byId("bs-setup-help").textContent=savedTeams.length?"Saved teams refreshed. Select a squad from CHOOSE SQUAD.":"No saved squads found yet. Save one in Team Builder first.";}else if(b.id==="bs-start-match")startMatch();else if(b.id==="bs-skip-intro")finishMatchIntro();else if(b.id==="bs-proceed-match")continueMatch();else if(b.id==="bs-pause-match")toggleManualPause();else if(b.id==="bs-fast-forward")fastForwardMatch();
 else if(b.id==="bs-back-home"){if(typeof updateRoute==="function")updateRoute("menu");else window.location.href="../";}
 else if(b.id==="bs-return-setup"||b.id==="bs-return-setup-results"){
  if(match){setupTeams=[normalizeTeam(serializeTeam(match.teams[1]),1),normalizeTeam(serializeTeam(match.teams[2]),2)];setupTeams.forEach(t=>t.source="random");try{sessionStorage.setItem(SETUP_RETURN_KEY,JSON.stringify({teams:setupTeams.map(serializeTeam)}));}catch(e){}}
  if(typeof updateRoute==="function")updateRoute("battleSimInitializer");else{renderInit();window.scrollTo({top:0,behavior:"instant"});}
 }else if(b.id==="bs-rematch")startMatch();
 else if(b.hasAttribute("data-required-substitute")){const n=Number(b.getAttribute("data-required-substitute")),req=match&&match.requiredSub,sel=byId("bs-required-sub-player"),team=match&&match.teams[n];if(!req||!team||req.teamNumber!==n||!sel||!sel.value){byId("bs-stoppage-description").textContent="Choose an available reserve to complete the mandatory substitution.";return;}if(substitute(team,req.slot,sel.value))renderMatch();}
 else if(b.hasAttribute("data-swap-player")){const n=Number(b.getAttribute("data-swap-team")),card=b.closest("[data-team-card]"),sel=card&&card.querySelector('[data-reserve-player="'+b.getAttribute("data-swap-player")+'"]');if(!sel||sel.value===""){byId("bs-setup-help").textContent="Choose which starter this reserve should replace, then press SWAP.";return;}if(replaceSetupStarter(setupTeams[n-1],sel.value,b.getAttribute("data-swap-player")))renderInit();}
 else if(b.hasAttribute("data-save-team")){const n=Number(b.getAttribute("data-save-team")),card=b.closest("[data-team-card]"),input=card&&card.querySelector('[data-save-name="'+n+'"]'),t=setupTeams[n-1],oldName=t.name,name=String(input&&input.value||t.name).trim().slice(0,32);if(!name){byId("bs-setup-help").textContent="Enter a name before saving this team.";return;}t.name=name;if(!saveTeamToSharedStandalone(t,name)){t.name=oldName;byId("bs-setup-help").textContent="Unable to save this squad. Check browser storage and player availability.";return;}t.savedId="standalone-global-xi";t.source="saved";savedTeams=loadSavedTeams();renderInit();byId("bs-setup-help").textContent="Squad saved to Team Builder."; }else if(b.hasAttribute("data-sub-in")){const n=Number(b.getAttribute("data-sub-team")),rid=b.getAttribute("data-sub-in"),team=match&&match.teams[n],row=b.closest(".bs-bench-player"),sel=row&&row.querySelector("[data-sub-target-for]");if(!team||match.status!=="paused")return;let slot=sel&&sel.value;if(slot==="")slot=Object.keys(team.assignment).find(k=>{const p=playerIn(team,team.assignment[k]);return p&&p.role!=="GK";});if(slot!=null&&substitute(team,slot,rid))renderMatch();}
}
function handleChange(event){const t=event.target;if(t.id==="bs-required-sub-player"&&match?.requiredSub){match.requiredSub.reserveId=t.value;storeActiveMatch();return;}if(match?.pending&&["bs-set-piece-taker","bs-set-piece-routine","bs-goal-kick-taker-mode"].includes(t.id)){
 const pending=match.pending;
 if(t.id==="bs-goal-kick-taker-mode"){pending.goalKickTaker=t.value==="outfield"?"outfield":"gk";pending.takerId=null;}
 else if(t.id==="bs-set-piece-taker")pending.takerId=t.value;
 else pending.routine=t.value;
 stagePendingSetPiece(match);storeActiveMatch();renderMatch();return;}if(t.matches("[data-team-formation]")){const n=Number(t.getAttribute("data-team-formation")),team=setupTeams[n-1];if(FORMATIONS[t.value]){setupTeams[n-1]=normalizeTeam(Object.assign({},team,{formation:t.value,slots:formationSlots(t.value)}),n);renderInit();}return;}if(t.matches("[data-team-source]")){
 const n=Number(t.getAttribute("data-team-source")),source=t.value;
 if(source==="auction"&&launchSnapshot)setupTeams[n-1]=snapshotTeam(n===1?launchSnapshot.team1:launchSnapshot.team2,n,launchSnapshot);
 else if(source==="random")setupTeams[n-1]=randomTeam(n,setupTeams[n-1]);
 else if(source.startsWith("saved:")){
  savedTeams=loadSavedTeams();
  const chosen=savedTeams.find(item=>idOf(item.id)===source.slice(6));
  if(chosen){setupTeams[n-1]=normalizeTeam(chosen.team,n);setupTeams[n-1].source="saved";setupTeams[n-1].savedId=idOf(chosen.id);}
 }
 renderInit();
}else if(t.matches("[data-archive-filter]")||t.id==="bs-archive-filter")renderArchive();else if(t.matches("[data-team-name]")){const n=Number(t.getAttribute("data-team-name"));setupTeams[n-1].name=String(t.value||"TEAM "+n).slice(0,32);const h=t.closest("[data-team-card]").querySelector(".bs-team-card-heading h2");if(h)h.textContent=setupTeams[n-1].name;}else if(t.matches("[data-team-color]")){const n=Number(t.getAttribute("data-team-color"));if(validColor(t.value)){setupTeams[n-1].color=t.value;t.closest("[data-team-card]").style.setProperty("--bs-team-color",t.value);}}else if(t.matches("[data-team-strategy]")){const n=Number(t.getAttribute("data-team-strategy")),k=t.getAttribute("data-strategy-key"),v=clamp(Number(t.value),0,100);if(setupTeams[n-1])setupTeams[n-1].strategy[k]=v;if(match&&match.teams[n])match.teams[n].strategy[k]=v;const out=t.closest(".bs-strategy-control").querySelector(".bs-strategy-value");if(out)out.textContent=v;if(match)storeActiveMatch();}}
function handleInput(event){const t=event.target;if(t&&t.id==="bs-feed-delay"){const oldDelay=feedDelayMs;suspendFeed();feedDelayMs=clamp(Number(t.value)||1,.1,5)*1000;if(feedRemaining!==null)feedRemaining=feedRemaining/oldDelay*feedDelayMs;const out=byId("bs-feed-delay-value");if(out)out.textContent=feedDelayLabel(feedDelayMs);scheduleFeedEvent();return;}if(t.matches("[data-team-name]")){const n=Number(t.getAttribute("data-team-name"));setupTeams[n-1].name=String(t.value||"TEAM "+n).slice(0,32);const h=t.closest("[data-team-card]").querySelector(".bs-team-card-heading h2");if(h)h.textContent=setupTeams[n-1].name;}else if(t.matches("[data-team-color]")){const n=Number(t.getAttribute("data-team-color"));if(validColor(t.value)){setupTeams[n-1].color=t.value;t.closest("[data-team-card]").style.setProperty("--bs-team-color",t.value);}}else if(t.matches("[data-team-strategy]")){const n=Number(t.getAttribute("data-team-strategy")),k=t.getAttribute("data-strategy-key"),v=clamp(Number(t.value),0,100);if(setupTeams[n-1])setupTeams[n-1].strategy[k]=v;if(match&&match.teams[n])match.teams[n].strategy[k]=v;const out=t.closest(".bs-strategy-control").querySelector(".bs-strategy-value");if(out)out.textContent=v;}}
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
