/* BATTLE SIM // Generic football simulation and text UI. */
(function () {
"use strict";
const SAVE_KEY="blBattleSimSavedTeamsV1", LAUNCH_KEY="blBattleSimLaunchV1", RESULT_KEY="blBattleSimLastResultV1", ACTIVE_MATCH_KEY="blBattleSimActiveMatchV1", SETUP_RETURN_KEY="blBattleSimSetupReturnV1";
const HALF=2700,FULL=5400,TICK=10,TICK_DELAY=85,MAX_SEQUENCE=10000,BLUE="#19a7ff",RED="#ff315d";
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
let launchSnapshot=null,savedTeams=[],setupTeams=[],match=null,initialized=false,runnerTimer=null,matchViewBuilt=false,feedTimer=null,feedQueue=[],feedQueueIds=new Set(),feedDelayMs=1000,draggedReserve=null;
const byId=id=>document.getElementById(id);
function make(tag,cls,label){const e=document.createElement(tag);if(cls)e.className=cls;if(label!==undefined&&label!==null)e.textContent=String(label);return e;}
function put(parent,child){if(parent&&child)parent.appendChild(child);return child;}
function labelField(parent,title,input){const label=make("label","bs-field");put(label,make("span","bs-field-label",title));put(label,input);put(parent,label);return label;}
function button(parent,label,cls,attrs){const b=make("button",cls||"bs-button",label);b.type="button";Object.keys(attrs||{}).forEach(k=>b.setAttribute(k,String(attrs[k])));put(parent,b);return b;}
function option(select,value,label,disabled){const o=make("option","",label);o.value=value;if(disabled)o.disabled=true;put(select,o);return o;}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function sigmoid(x){return 1/(1+Math.exp(-x));}
function logit(p){p=clamp(p,.001,.999);return Math.log(p/(1-p));}
function idOf(x){return String(x==null?"":x);}
function validColor(c){return /^#[0-9a-f]{6}$/i.test(String(c||""));}
function timeLabel(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(Math.floor(s%60)).padStart(2,"0");}
function baseStats(raw){const s=raw&&raw.stats&&typeof raw.stats==="object"?raw.stats:raw||{};const g=(k,d)=>{const n=Number(s[k]!=null?s[k]:raw&&raw[k]);return Number.isFinite(n)?clamp(n,1,100):d;};const v={off:g("off",70),sho:g("sho",65),dri:g("dri",65),pas:g("pas",65),def:g("def",60),gk:g("gk",25),spd:g("spd",65)};v.ovr=g("ovr",(v.off+v.sho+v.dri+v.pas+v.def+v.spd)/6);return v;}
function cleanPlayer(raw,index){raw=raw||{};const primary=String(raw.primaryPosition||raw.position||(raw.positions&&raw.positions[0])||"CM");return{id:idOf(raw.id==null?"p-"+index+"-"+raw.name:raw.id),name:String(raw.name||"Unnamed Player"),image:String(raw.image||""),primaryPosition:primary,positions:Array.isArray(raw.positions)?raw.positions.map(String):[primary],stats:baseStats(raw)};}
function randomPick(list,rng){return list.length?list[Math.floor(rng()*list.length)]:null;}
function playerIn(team,id){return team.roster.find(p=>idOf(p.id)===idOf(id))||null;}
function formationSlots(name){if(typeof FORMATIONS!=="undefined"&&FORMATIONS[name]&&FORMATIONS[name].length)return FORMATIONS[name].map(s=>({x:Number(s.x)||50,y:Number(s.y)||50,label:String(s.label||"CM")}));return BASE_SLOTS.map(s=>Object.assign({},s));}
function bestStarting(roster,count){if(!roster.length)return[];const sorted=roster.slice().sort((a,b)=>b.stats.gk-a.stats.gk);const keeper=sorted[0];const out=[keeper];roster.filter(p=>p.id!==keeper.id).sort((a,b)=>b.stats.ovr-a.stats.ovr).forEach(p=>{if(out.length<count)out.push(p);});return out.slice(0,count).map(p=>p.id);}
function defaultAssignment(roster,slots,count){const ids=bestStarting(roster,count),assignment={};if(ids.length)assignment["0"]=ids[0];let cursor=1;for(let i=1;i<slots.length&&cursor<ids.length;i++)assignment[String(i)]=ids[cursor++];return assignment;}
function normalizeTeam(input,number){input=input||{};const roster=[],seen=new Set();(input.roster||input.players||[]).forEach((raw,i)=>{const p=cleanPlayer(raw,i);if(!seen.has(p.id)){seen.add(p.id);roster.push(p);}});const formation=String(input.formation||"4-3-3"),slots=Array.isArray(input.slots)&&input.slots.length?input.slots.map(s=>({x:Number(s.x)||50,y:Number(s.y)||50,label:String(s.label||"CM")})):formationSlots(formation);const valid=new Set(roster.map(p=>p.id)),assignment={};const sourceAssignment=input.assignment||input.assignments||{};Object.keys(sourceAssignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const id=idOf(sourceAssignment[k]);if(Number(k)<slots.length&&valid.has(id)&&!Object.values(assignment).includes(id))assignment[String(k)]=id;});const count=Math.min(11,roster.length,slots.length);if(!Object.keys(assignment).length)Object.assign(assignment,defaultAssignment(roster,slots,count));else{const used=new Set(Object.values(assignment));const rest=roster.slice().sort((a,b)=>b.stats.ovr-a.stats.ovr).filter(p=>!used.has(p.id));for(let i=0;i<slots.length&&Object.keys(assignment).length<count;i++){if(assignment[String(i)]==null&&rest.length)assignment[String(i)]=rest.shift().id;}}while(Object.keys(assignment).length>count)delete assignment[Object.keys(assignment).sort((a,b)=>Number(b)-Number(a))[0]];const strategy={};STRATEGIES.forEach(d=>strategy[d.key]=clamp(Number(input.strategy&&input.strategy[d.key]!=null?input.strategy[d.key]:DEFAULT_STRATEGY[d.key]),0,100));return{number:number,name:String(input.name||"TEAM "+number).slice(0,32),color:validColor(input.color)?input.color:(number===1?BLUE:RED),roster:roster,formation:formation,slots:slots,assignment:assignment,strategy:strategy,source:String(input.source||"random"),savedId:input.savedId||""};}
function serializeTeam(team){return{name:team.name,color:team.color,formation:team.formation,slots:team.slots.map(s=>Object.assign({},s)),assignment:Object.assign({},team.assignment),strategy:Object.assign({},team.strategy),source:team.source,roster:team.roster.map(p=>({id:p.id,name:p.name,image:p.image,primaryPosition:p.primaryPosition,positions:p.positions.slice(),stats:Object.assign({},p.stats)}))};}
function loadSavedTeams(){try{const a=JSON.parse(localStorage.getItem(SAVE_KEY)||"[]");return Array.isArray(a)?a.filter(x=>x&&x.id&&x.team&&Array.isArray(x.team.roster)):[];}catch(e){return[];}}
function saveSavedTeams(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(savedTeams.slice(-40)));return true;}catch(e){return false;}}
function playerPool(){if(typeof players==="undefined"||!Array.isArray(players))return[];return players.filter(p=>p&&p.id!=null&&!p.secretCharacter);}
function randomTeam(number,old){const all=playerPool().slice();for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]];}const roster=all.slice(0,Math.min(15,all.length)).map(cleanPlayer);if(!roster.length){for(let i=0;i<15;i++)roster.push(cleanPlayer({id:"sample-"+number+"-"+i,name:"Player "+(i+1),primaryPosition:i===0?"GK":i<5?"DF":i<10?"MF":"FW",stats:{ovr:60+Math.floor(Math.random()*30),off:65,sho:65,dri:65,pas:65,def:65,gk:i===0?82:25,spd:65}},i));}const team=normalizeTeam({name:old&&old.name|| (number===1?"RANDOM XI A":"RANDOM XI B"),color:old&&old.color,roster:roster,formation:"4-3-3",strategy:old&&old.strategy},number);team.source="random";return team;}
function snapshotTeam(raw,number,snapshot){const formation=snapshot&&snapshot.formations&&snapshot.formations[number]||"4-3-3";const assignments=snapshot&&snapshot.assignments&&snapshot.assignments[number]||{};const t=normalizeTeam({name:raw&&raw.name,color:raw&&raw.color,players:raw&&raw.players||[],formation:formation,slots:formationSlots(formation),assignment:assignments,strategy:DEFAULT_STRATEGY,source:"auction"},number);t.source="auction";return t;}
function randSeed(){if(window.crypto&&window.crypto.getRandomValues){const a=new Uint32Array(1);window.crypto.getRandomValues(a);return a[0]||0x91e10da5;}return(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;}
function seeded(seed,restoreState){
 let v=(restoreState==null?seed:restoreState)>>>0;
 const rng=function(){v=(v+0x6D2B79F5)>>>0;let t=v;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
 rng.getState=function(){return v>>>0;};return rng;
}
function snapshotMatch(state){if(!state)return null;const copy=Object.assign({},state,{randomState:state.random&&state.random.getState?state.random.getState():state.randomState,runnerActive:false});delete copy.random;return copy;}
function hydrateMatch(snapshot){if(!snapshot||!snapshot.teams||!snapshot.events)return null;const state=Object.assign({},snapshot);state.random=seeded(state.seed,state.randomState);delete state.randomState;state.runnerActive=false;return state;}
function storeActiveMatch(){if(!match)return;try{sessionStorage.setItem(ACTIVE_MATCH_KEY,JSON.stringify(snapshotMatch(match)));}catch(e){}}
function readStoredMatch(key){try{let raw=sessionStorage.getItem(key);if(!raw&&key===RESULT_KEY)raw=localStorage.getItem(key);return hydrateMatch(raw?JSON.parse(raw):null);}catch(e){return null;}}
function ratingNow(p){return Math.round(clamp(6+(p&&p.match?Number(p.match.points)||0:0),3,10)*100)/100;}
function ratingColor(value){const ratio=clamp((Number(value)-3)/7,0,1);return "hsl("+Math.round(ratio*120)+" 78% 46%)";}
function playerMeta(ovr,rating,cls){const meta=make("span",cls||"bs-player-subline");put(meta,make("span","","OVR "+Math.round(ovr)+" · RATING "));const score=make("strong","bs-rating-value",Number(rating).toFixed(2));score.style.color=ratingColor(rating);put(meta,score);return meta;}
function cardLabel(p){return p.sentOff?"RED CARD":p.yellows>0?"YELLOW "+p.yellows+"/3":"NO CARDS";}
function flowMeter(value,name){const amount=clamp(Number.isFinite(Number(value))?Number(value):0,0,100),meter=make("span","bs-flow-meter");meter.style.setProperty("--flow",amount+"%");meter.title=(name?name+" · ":"")+"FLOW "+Math.round(amount)+"%";meter.setAttribute("role","meter");meter.setAttribute("aria-label",(name?name+" ":"")+"flow");meter.setAttribute("aria-valuemin","0");meter.setAttribute("aria-valuemax","100");meter.setAttribute("aria-valuenow",String(Math.round(amount)));put(meter,make("span","bs-flow-meter-fill"));return meter;}
function portraitWithStamina(parent,p,size){
 const px=size||32,stamina=clamp(Number(p.stamina)||0,0,100),ring=make("span","bs-stamina-ring");
 ring.style.setProperty("--stamina",stamina+"%");ring.style.setProperty("--stamina-hue",String(Math.round(stamina*1.2)));ring.style.setProperty("--portrait-size",px+"px");
 const img=make("img","bs-stamina-portrait");img.src=p.image||(typeof PLAYER_IMAGE_FALLBACK!=="undefined"?PLAYER_IMAGE_FALLBACK:"");img.alt=p.name||"Player";img.width=px;img.height=px;img.loading="lazy";
 img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;};put(ring,img);put(parent,ring);return ring;
}
function distance(a,b){if(!ZONES[a]||!ZONES[b])return 99;return Math.abs(ZONES[a].x-ZONES[b].x)+Math.abs(ZONES[a].y-ZONES[b].y);}
function neighbors(zone){return Object.keys(ZONES).map(Number).filter(n=>distance(zone,n)===1);}
function stepToward(state,zone,target,teamNumber){const ns=neighbors(zone);if(!ns.length)return zone;const d=Math.min.apply(null,ns.map(n=>distance(n,target)));let best=ns.filter(n=>distance(n,target)===d);if(teamNumber){const f=best.filter(n=>progress(teamNumber,n)>=progress(teamNumber,zone));if(f.length&&state.random()<.7)best=f;}return randomPick(best,state.random);}
function progress(number,zone){return number===1?ZONES[zone].y/5:(5-ZONES[zone].y)/5;}
function targetGoal(number){return number===1?17:2;}
function ownGoal(number){return number===1?2:17;}
function slotZone(number,slot){const x=clamp(Math.round((Number(slot.x)||50)/50),0,2);let y=clamp(Math.floor((100-(Number(slot.y)||50))/20),0,5);if(number===2)y=5-y;return GRID[y][x];}
function active(team){const ids=new Set(Object.values(team.assignment).map(idOf));return team.roster.filter(p=>ids.has(idOf(p.id))&&!p.sentOff);}
function bench(team){const ids=new Set(Object.values(team.assignment).map(idOf));return team.roster.filter(p=>!ids.has(idOf(p.id))&&!p.sentOff);}
function keeper(team){const list=active(team);return list.find(p=>p.role==="GK")||list.slice().sort((a,b)=>b.stats.gk-a.stats.gk)[0]||null;}
function runtimeTeam(config,number){const team={number:number,name:config.name,color:config.color,roster:config.roster.map((raw,i)=>{const p=cleanPlayer(raw,i);return Object.assign(p,{teamNumber:number,stamina:100,flow:0,flowFullTicks:0,movementProgress:0,zone:ownGoal(number),homeZone:ownGoal(number),role:p.primaryPosition,yellows:0,sentOff:false,match:{goals:0,assists:0,shots:0,onTarget:0,passes:0,passesAttempted:0,dribbles:0,dribblesAttempted:0,tackles:0,interceptions:0,fouls:0,saves:0,yellows:0,redCards:0,points:0,rating:6}});}),formation:config.formation,slots:config.slots.map(s=>Object.assign({},s)),assignment:Object.assign({},config.assignment),strategy:Object.assign({},config.strategy),stats:{poss:0,shots:0,onTarget:0,passes:0,attempted:0,tackles:0,interceptions:0,fouls:0,corners:0,saves:0,turnovers:0,goals:0,yellowCards:0,redCards:0}};Object.keys(team.assignment).forEach(k=>{const p=playerIn(team,team.assignment[k]),s=team.slots[Number(k)];if(p&&s){p.role=s.label;p.zone=slotZone(number,s);p.homeZone=p.zone;}});const g=keeper(team);if(g){g.role="GK";g.zone=ownGoal(number);g.homeZone=g.zone;}return team;}
function playerIn(team,id){return team.roster.find(p=>idOf(p.id)===idOf(id))||null;}
function effective(p,k){return(Number(p.stats[k])||1)*(.7+.3*clamp(p.stamina,0,100)/100);}
function addPoints(p,n){if(p&&p.match){p.match.points+=n;if(n>0){const before=clamp(Number.isFinite(Number(p.flow))?Number(p.flow):0,0,100);if(before<100){p.flow=clamp(before+Math.max(2,n*24),0,100);if(p.flow>=100)p.flowFullTicks=0;}}}}
function drain(p,success,action){const amount=action==="shot"?3:action==="dribble"?3.3:action==="pass"?2.2:2;p.stamina=clamp(p.stamina-(success?amount:amount*.48),0,100);}
function addEvent(state,options){const event={id:state.events.length+1,tick:state.tick,timeSeconds:state.timeSeconds,time:timeLabel(state.timeSeconds),type:options.type||"play",description:String(options.description||"Play continues."),teamNumber:options.teamNumber||null,possessionTeamNumber:state.possession||null,zone:options.zone==null?state.ballZone:options.zone,notable:!!options.notable,actors:(options.actors||[]).filter(Boolean).map(p=>({id:idOf(p.id),name:p.name,image:p.image||"",teamNumber:p.teamNumber||null,flow:clamp(Number.isFinite(Number(p.flow))?Number(p.flow):0,0,100)})),comparison:options.comparison?Object.assign({},options.comparison):null,probability:options.probability==null?null:clamp(Number(options.probability),0,1),probabilityLabel:options.probabilityLabel||"SUCCESS CHANCE",dialogue:(options.dialogue||[]).map(d=>({playerId:idOf(d.playerId),text:String(d.text||"")}))};state.events.push(event);return event;}
function pause(state,reason){state.status="paused";state.stoppage=reason||"PLAY PAUSED";}
function dialogue(state,p,kind,good){const lines={pass:good?["Here!","One touch!","Play it forward!"]:["Too slow!","I should have seen that!"],receive:good?["Got it!","I'm on it!","Keep moving!"]:["That was difficult to reach!"],dribble:good?["There's the gap!","Past you!","Can't catch me!"]:["They closed the lane!","I lost control!"],shot:good?["It's in!","Yes!","What a finish!"]:["Not enough!","I need to do better!"],defend:good?["Won it back!","Read that!","Not today!"]:["They got away!"],save:good?["I've got it!","Safe hands!","Not past me!"]:["Rebound!"]};const line=randomPick(lines[kind]||lines.pass,state.random);return{playerId:p.id,text:p.name+': "'+line+'"'};}
function opposing(state,number){return active(state.teams[number===1?2:1]);}
function defenderNear(state,number,zone){const list=opposing(state,number).filter(p=>p.role!=="GK");list.sort((a,b)=>(distance(a.zone,zone)*12-effective(a,"def")*.42-effective(a,"spd")*.2)-(distance(b.zone,zone)*12-effective(b,"def")*.42-effective(b,"spd")*.2));return list[0]||keeper(state.teams[number===1?2:1]);}
function preferredWideLane(p){
 const role=String(p&&p.role||"").toUpperCase();
 if(/^(LB|LWB|LM|LW|LWF|LF|LS|LCM|LCB)$/.test(role))return 0;
 if(/^(RB|RWB|RM|RW|RWF|RF|RS|RCM|RCB)$/.test(role))return 2;
 return null;
}
function moveOffBall(state){
 [1,2].forEach(n=>{
  const team=state.teams[n],attacking=state.possession===n,widthBias=clamp((team.strategy.width-50)/50,0,1);
  active(team).forEach(p=>{
   if(p.id===state.carrierId||p.role==="GK")return;
   const runner=/ST|CF|FW|LW|RW|SS/.test(p.role),wideRole=preferredWideLane(p)!=null;
   const intentChance=clamp(.075+(attacking?(runner?.065:.025):.035)+(attacking?team.strategy.tempo:team.strategy.pressing)/100*.045+(attacking?widthBias*(wideRole?.06:.02):0),.06,.26);
   if(state.random()>=intentChance)return;
   const target=attacking&&(runner||progress(n,p.zone)>.56)?targetGoal(n):state.ballZone;
   let next=null;
   if(attacking&&widthBias>0){
    const preferred=preferredWideLane(p),x=ZONES[p.zone].x,row=ZONES[p.zone].y;
    const lateral=neighbors(p.zone).filter(z=>ZONES[z].y===row&&ZONES[z].x!==x);
    if(preferred!=null&&x!==preferred&&lateral.length&&state.random()<.24+widthBias*.62){
     next=lateral.slice().sort((a,b)=>Math.abs(ZONES[a].x-preferred)-Math.abs(ZONES[b].x-preferred))[0];
    }else if(preferred==null&&runner&&x===1&&widthBias>.45&&state.random()<widthBias*.46&&lateral.length){
     next=randomPick(lateral,state.random);
    }
   }
   if(next==null)next=stepToward(state,p.zone,target,attacking?n:null);
   if(next===p.zone){p.movementProgress=0;return;}
   p.movementProgress=clamp((p.movementProgress||0)+effective(p,"spd")/75,0,2);
   if(p.movementProgress>=1){p.zone=next;p.movementProgress-=1;}
  });
 });
}
function receiverChoice(state,team,carrier){const list=active(team).filter(p=>p.id!==carrier.id&&p.role!=="GK");if(!list.length)return null;const p0=progress(team.number,carrier.zone);const ranked=list.map(p=>({p:p,s:(progress(team.number,p.zone)-p0)*(1+team.strategy.directness/100*1.6)-distance(carrier.zone,p.zone)*.24+(effective(p,"off")-75)/180+(effective(p,"spd")-75)/220+(ZONES[p.zone]&&ZONES[p.zone].x!==1?clamp((team.strategy.width-50)/50,0,1)*1.35:0)+(state.random()-.5)*.35})).sort((a,b)=>b.s-a.s);return randomPick(ranked.slice(0,Math.min(4,ranked.length)),state.random).p;}
function targetZone(state,teamNumber,from,to){if(from!==to&&distance(from,to)<=1)return to;return stepToward(state,from,to===from?targetGoal(teamNumber):to,teamNumber);}
function checkFoul(state,teamNumber,carrier,defender,zone){
 if(!carrier||!defender||state.random()>=.018+state.teams[defender.teamNumber].strategy.pressing/100*.025)return false;
 const defendingTeam=state.teams[defender.teamNumber];
 defender.match.fouls++;defendingTeam.stats.fouls++;addPoints(defender,-.12);
 const type=zone===targetGoal(teamNumber)?"penalty":"free-kick";
 state.pending={type:type,teamNumber:teamNumber,zone:zone,takerId:carrier.id,routine:"direct"};
 state.possession=teamNumber;state.carrierId=carrier.id;state.ballZone=zone;
 addEvent(state,{type:"foul",teamNumber:teamNumber,zone:zone,notable:true,
  description:defender.name+" fouls "+carrier.name+". "+(type==="penalty"?"Penalty awarded.":"Free kick awarded."),
  actors:[defender,carrier],dialogue:[{playerId:carrier.id,text:carrier.name+': "Foul! I was through!"'}]});
 const yellowChance=.12+defendingTeam.strategy.pressing/100*.10;
 if(state.random()<yellowChance){
  defender.yellows++;defender.match.yellows=defender.yellows;defendingTeam.stats.yellowCards++;addPoints(defender,-.08);
  addEvent(state,{type:"yellow-card",teamNumber:defender.teamNumber,zone:zone,notable:true,
   description:defender.name+" receives a yellow card ("+defender.yellows+"/3).",actors:[defender],
   dialogue:[{playerId:defender.id,text:defender.name+': "I was going for the ball!"'}]});
  if(defender.yellows>=3){
   defender.sentOff=true;defender.match.redCards++;defendingTeam.stats.redCards++;addPoints(defender,-.25);
   const slot=Object.keys(defendingTeam.assignment).find(k=>idOf(defendingTeam.assignment[k])===idOf(defender.id));
   const canReplace=slot!=null&&bench(defendingTeam).length>0;
   state.requiredSub=canReplace?{teamNumber:defender.teamNumber,slot:String(slot),playerId:defender.id}:null;
   const consequence=canReplace?" A replacement must be selected before play resumes.":" No reserve is available; the team will continue short-handed.";
   addEvent(state,{type:"red-card",teamNumber:defender.teamNumber,zone:zone,notable:true,
    description:defender.name+" receives a third yellow and is sent off."+consequence,
    actors:[defender],dialogue:[{playerId:defender.id,text:defender.name+': "You have got to be kidding me!"'}]});
  }
 }
 pause(state,state.requiredSub?"RED CARD — SUBSTITUTION REQUIRED":type==="penalty"?"PENALTY":"FREE KICK");
 return true;
}
function resolvePass(state,carrier,opts){opts=opts||{};const team=state.teams[carrier.teamNumber],receiver=receiverChoice(state,team,carrier);if(!receiver){const z=stepToward(state,carrier.zone,targetGoal(team.number),team.number);carrier.zone=z;state.ballZone=z;addEvent(state,{type:"carry",teamNumber:team.number,description:carrier.name+" carries the ball forward.",actors:[carrier]});return;}const zone=targetZone(state,team.number,carrier.zone,receiver.zone),defender=defenderNear(state,team.number,zone),dist=distance(carrier.zone,zone),lane=dist<=1?9:dist<=2?3:-5,space=!opposing(state,team.number).some(p=>p.role!=="GK"&&distance(p.zone,zone)<=1),speed=clamp((effective(receiver,"spd")-(defender?effective(defender,"spd"):70))*.18,-11,11),pressure=defender?Math.max(0,2-distance(defender.zone,zone))*team.strategy.pressing/100*2.5:0;let chance=sigmoid((effective(carrier,"pas")-(defender?effective(defender,"def"):60)+lane+speed+(space?2:-2)-pressure)/17);if(opts.guaranteed)chance=1;team.stats.attempted++;carrier.match.passesAttempted++;if(state.random()<chance){drain(carrier,true,"pass");addPoints(carrier,.025);team.stats.passes++;carrier.match.passes++;const old=progress(team.number,carrier.zone);receiver.zone=zone;state.ballZone=zone;state.carrierId=receiver.id;state.possession=team.number;state.lastPasser=carrier.id;const forward=progress(team.number,zone)>old,notable=!!opts.setPiece||(forward&&progress(team.number,zone)>=.48)||state.random()<.10;addEvent(state,{type:opts.setPiece?"set-piece":"pass",teamNumber:team.number,zone:zone,notable:notable,description:carrier.name+" completes a pass to "+receiver.name+(forward?", advancing play.":"."),comparison:{attackerLabel:"PAS",attackerValue:effective(carrier,"pas"),defenderLabel:"DEF",defenderValue:defender?effective(defender,"def"):60},probability:chance,probabilityLabel:"PASS SUCCESS",actors:[carrier,receiver],dialogue:notable?[dialogue(state,carrier,"pass",true),dialogue(state,receiver,"receive",true)]:[]});if(!opts.guaranteed&&defender&&state.random()<.012+team.strategy.pressing/100*.018)checkFoul(state,team.number,receiver,defender,zone);}else{drain(carrier,false,"pass");addPoints(carrier,-.16);team.stats.turnovers++;const opp=state.teams[team.number===1?2:1],interceptor=defender||randomPick(active(opp).filter(p=>p.role!=="GK"),state.random);if(interceptor&&checkFoul(state,team.number,carrier,interceptor,zone))return;if(interceptor){interceptor.match.interceptions++;addPoints(interceptor,.15);opp.stats.interceptions++;interceptor.zone=zone;}state.possession=opp.number;state.carrierId=interceptor?interceptor.id:(active(opp)[0]&&active(opp)[0].id);state.ballZone=zone;addEvent(state,{type:"interception",teamNumber:opp.number,zone:zone,notable:true,description:(interceptor?interceptor.name:"The defence")+" intercepts "+carrier.name+"'s pass. Possession changes.",comparison:{attackerLabel:"PAS",attackerValue:effective(carrier,"pas"),defenderLabel:"DEF",defenderValue:defender?effective(defender,"def"):60},probability:chance,probabilityLabel:"PASS SUCCESS",actors:[carrier,receiver,interceptor],dialogue:interceptor?[dialogue(state,interceptor,"defend",true)]:[]});}}
function resolveDribble(state,carrier){const team=state.teams[carrier.teamNumber],widthBias=clamp((team.strategy.width-55)/45,0,1),current=ZONES[carrier.zone],wideTargets=current&&current.x===1&&widthBias>0&&state.random()<widthBias*.62?neighbors(carrier.zone).filter(z=>ZONES[z].y===current.y&&ZONES[z].x!==current.x):[],target=wideTargets.length?randomPick(wideTargets,state.random):targetGoal(team.number),zone=stepToward(state,carrier.zone,target,team.number),defs=opposing(state,team.number).filter(p=>p.role!=="GK"&&distance(p.zone,zone)<=1).sort((a,b)=>(effective(b,"def")+effective(b,"spd")*.22)-(effective(a,"def")+effective(a,"spd")*.22)),def=defs[0]||defenderNear(state,team.number,zone),crowd=defs.length===0?7:defs.length===1?0:Math.min(16,(defs.length-1)*5),speed=def?clamp((effective(carrier,"spd")-effective(def,"spd"))*(defs.length?.2:.32),-12,14):7,chance=sigmoid((effective(carrier,"dri")-(def?effective(def,"def"):55)+speed-crowd)/17);carrier.match.dribblesAttempted++;if(state.random()<chance){drain(carrier,true,"dribble");carrier.match.dribbles++;addPoints(carrier,.07);carrier.zone=zone;state.ballZone=zone;const notable=!!def&&distance(def.zone,zone)<=1||progress(team.number,zone)>=.65||state.random()<.17;addEvent(state,{type:"dribble",teamNumber:team.number,zone:zone,notable:notable,description:carrier.name+(def?" beats "+def.name:" moves into space")+" and carries the ball forward.",comparison:{attackerLabel:"DRI",attackerValue:effective(carrier,"dri"),defenderLabel:"DEF",defenderValue:def?effective(def,"def"):55},probability:chance,probabilityLabel:"DRIBBLE SUCCESS",actors:def?[carrier,def]:[carrier],dialogue:notable?[dialogue(state,carrier,"dribble",true)]:[]});state.lastPasser=null;if(def&&state.random()<.012+team.strategy.pressing/100*.015)checkFoul(state,team.number,carrier,def,zone);}else{drain(carrier,false,"dribble");addPoints(carrier,-.19);const opp=state.teams[team.number===1?2:1];if(def&&checkFoul(state,team.number,carrier,def,zone))return;if(def){def.match.tackles++;addPoints(def,.18);opp.stats.tackles++;def.zone=zone;}state.possession=opp.number;state.carrierId=def?def.id:(active(opp)[0]&&active(opp)[0].id);state.ballZone=zone;addEvent(state,{type:"turnover",teamNumber:opp.number,zone:zone,notable:true,description:(def?def.name+" wins the tackle":"The defence recovers")+" after "+carrier.name+"'s dribble. Possession changes.",comparison:{attackerLabel:"DRI",attackerValue:effective(carrier,"dri"),defenderLabel:"DEF",defenderValue:def?effective(def,"def"):55},probability:1-chance,probabilityLabel:"TACKLE WIN",actors:[carrier,def],dialogue:def?[dialogue(state,def,"defend",true)]:[]});}}
function recoverLoose(state,zone,attackingNumber){const options=[];[1,2].forEach(n=>active(state.teams[n]).forEach(p=>{if(p.role==="GK")return;const d=distance(p.zone,zone);if(d<=3){const skill=n===attackingNumber?effective(p,"off"):effective(p,"def");options.push({p:p,s:effective(p,"spd")*.58+skill*.28-d*18+state.random()*8});}}));options.sort((a,b)=>b.s-a.s);if(!options.length)return null;const p=options[0].p;addPoints(p,.08);p.zone=zone;state.possession=p.teamNumber;state.carrierId=p.id;state.ballZone=zone;addEvent(state,{type:"rebound",teamNumber:p.teamNumber,zone:zone,notable:true,description:p.name+" reaches the rebound first and takes possession.",actors:[p],dialogue:[dialogue(state,p,"defend",true)]});return p;}
function resolveShot(state,shooter,penalty){const team=state.teams[shooter.teamNumber],defteam=state.teams[team.number===1?2:1],gk=keeper(defteam),progression=progress(team.number,shooter.zone),near=opposing(state,team.number).filter(p=>p.role!=="GK").reduce((v,p)=>Math.min(v,distance(p.zone,shooter.zone)),99),pressure=near<=1?8:near===2?3:0,base=penalty?.76:shooter.zone===targetGoal(team.number)?.28:progression>=.82?.19:progression>=.65?.105:.035,shoot=effective(shooter,"sho"),goalkeeperStat=gk?effective(gk,"gk"):45,goalChance=penalty?sigmoid((shoot-goalkeeperStat)/22+1.28):sigmoid(logit(base)+(shoot-75)/24-(goalkeeperStat-75)/26-pressure/36),saveChance=penalty?1-goalChance-.045:Math.min(1-goalChance-.015,clamp(.17+sigmoid((goalkeeperStat-shoot)/22)*.54,.16,.68)),roll=state.random();team.stats.shots++;shooter.match.shots++;drain(shooter,roll<goalChance,"shot");const assister=state.lastPasser&&state.lastPasser!==shooter.id?playerIn(team,state.lastPasser):null;if(roll<goalChance){team.stats.onTarget++;team.stats.goals++;shooter.match.onTarget++;shooter.match.goals++;addPoints(shooter,1.35);if(assister){assister.match.assists++;addPoints(assister,.68);}state.score[team.number]++;addEvent(state,{type:"goal",teamNumber:team.number,zone:shooter.zone,notable:true,description:"GOAL! "+shooter.name+" scores for "+team.name+(assister?" after a pass from "+assister.name:"")+".",comparison:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:goalkeeperStat},probability:goalChance,probabilityLabel:"GOAL CHANCE",actors:assister?[shooter,assister]:[shooter],dialogue:[dialogue(state,shooter,"shot",true)]});state.pending={type:"kickoff",teamNumber:team.number===1?2:1,zone:7};state.lastPasser=null;resetPositions(state);pause(state,"GOAL");return;}if(roll<goalChance+saveChance){team.stats.onTarget++;shooter.match.onTarget++;if(gk){gk.match.saves++;addPoints(gk,.54);defteam.stats.saves++;state.possession=defteam.number;state.carrierId=gk.id;gk.zone=ownGoal(defteam.number);state.ballZone=gk.zone;}const caught=state.random()<.64;addEvent(state,{type:"save",teamNumber:defteam.number,zone:state.ballZone,notable:true,description:(gk?gk.name:"The goalkeeper")+(caught?" catches ":" parries ")+shooter.name+"'s shot. The sequence stops.",comparison:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:goalkeeperStat},probability:goalChance,probabilityLabel:"GOAL CHANCE",actors:[shooter,gk],dialogue:gk?[dialogue(state,gk,"save",true)]:[]});if(!caught)recoverLoose(state,shooter.zone,team.number);state.lastPasser=null;pause(state,caught?"SAVE":"SAVE / REBOUND");return;}addPoints(shooter,-.08);const corner=state.random()<(progression>=.78?.23:.12);addEvent(state,{type:corner?"corner":"goal-kick",teamNumber:corner?team.number:defteam.number,zone:shooter.zone,notable:true,description:shooter.name+(corner?" forces a corner.":" sends the shot off target. Goal kick to "+defteam.name+"."),comparison:{attackerLabel:"SHO",attackerValue:shoot,defenderLabel:"GK",defenderValue:goalkeeperStat},probability:goalChance,probabilityLabel:"GOAL CHANCE",actors:[shooter],dialogue:[dialogue(state,shooter,"shot",false)]});if(corner)team.stats.corners++;state.pending={type:corner?"corner":"goal-kick",teamNumber:corner?team.number:defteam.number,zone:shooter.zone,takerId:null,routine:corner?"cross":"short"};state.lastPasser=null;pause(state,corner?"CORNER":"GOAL KICK");}
function chooseShot(state,carrier){const t=state.teams[carrier.teamNumber],pr=progress(t.number,carrier.zone);if(pr<.58)return false;const defenders=opposing(state,t.number).filter(p=>p.role!=="GK"),near=defenders.reduce((v,p)=>Math.min(v,distance(p.zone,carrier.zone)),99),expected=sigmoid(logit(carrier.zone===targetGoal(t.number)?.28:pr>.8?.19:.1)+(effective(carrier,"sho")-75)/30),threshold=clamp(.1+(100-t.strategy.tempo)/100*.1+(100-t.strategy.directness)/100*.08,.06,.3),urge=t.strategy.tempo/100*.08+Math.max(0,effective(carrier,"sho")-75)/100*.08;return expected>threshold+(near<=1?.07:0)||(state.random()<urge&&pr>=.72);}
function resetPositions(state){[1,2].forEach(n=>{const t=state.teams[n];t.roster.forEach(p=>{const k=Object.keys(t.assignment).find(i=>idOf(t.assignment[i])===idOf(p.id));if(k!=null&&t.slots[Number(k)]){p.role=t.slots[Number(k)].label;p.homeZone=slotZone(n,t.slots[Number(k)]);}p.zone=p.homeZone||ownGoal(n);});const g=keeper(t);if(g){g.role="GK";g.zone=ownGoal(n);g.homeZone=g.zone;}});state.ballZone=7;}
function kickoff(state,n){state.pending=null;resetPositions(state);const team=state.teams[n],options=active(team).filter(p=>p.role!=="GK").sort((a,b)=>distance(a.zone,7)-distance(b.zone,7)||b.stats.off-a.stats.off),p=options[0]||keeper(team);state.possession=n;state.carrierId=p?p.id:null;state.ballZone=7;if(p)p.zone=7;state.stoppage="";}
function resolveRestart(state,pending){const t=state.teams[pending.teamNumber],taker=playerIn(t,pending.takerId)||active(t).slice().sort((a,b)=>b.stats.pas-a.stats.pas)[0];if(!taker)return;state.possession=t.number;state.carrierId=taker.id;state.ballZone=pending.zone;taker.zone=pending.zone;if(pending.type==="penalty"){resolveShot(state,taker,true);return;}if(pending.type==="goal-kick"||pending.routine==="short"||pending.routine==="pass"){resolvePass(state,taker,{setPiece:true,guaranteed:pending.type==="goal-kick"});return;}if(pending.type==="corner"){const receiver=receiverChoice(state,t,taker);if(receiver)receiver.zone=t.number===1?14:5;resolvePass(state,taker,{setPiece:true});return;}resolveShot(state,taker,false);}
function playerTick(state){state.tick++;state.timeSeconds=Math.min(FULL,state.timeSeconds+TICK);[1,2].forEach(n=>state.teams[n].roster.forEach(p=>{if(p.flow>=100){p.flowFullTicks=(p.flowFullTicks||0)+1;if(p.flowFullTicks>=30){p.flow=0;p.flowFullTicks=0;}}else p.flowFullTicks=0;}));if(state.possession===1||state.possession===2)state.teams[state.possession].stats.poss++;moveOffBall(state);if(state.forced){const f=state.forced;state.forced=null;state.pending=null;resolveRestart(state,f);return;}const t=state.teams[state.possession],carrier=t&&playerIn(t,state.carrierId);if(!t||!carrier){const n=state.possession===1?2:1,p=active(state.teams[n]).find(p=>p.role!=="GK")||keeper(state.teams[n]);state.possession=n;state.carrierId=p&&p.id;if(p)p.zone=state.ballZone;return;}carrier.zone=state.ballZone;if(carrier.role==="GK"||carrier.id===(keeper(t)&&keeper(t).id)){resolvePass(state,carrier,{});return;}if(chooseShot(state,carrier)){resolveShot(state,carrier,false);return;}const pr=progress(t.number,carrier.zone),close=opposing(state,t.number).filter(p=>p.role!=="GK"&&distance(p.zone,carrier.zone)<=1).length,dribble=clamp(.4+(t.strategy.tempo-50)/250+(close>1?-.08:.06),.22,.67);if(state.random()<dribble||pr<.25&&close===0)resolveDribble(state,carrier);else resolvePass(state,carrier,{});}
function finish(state){
 if(state.status==="finished")return;state.timeSeconds=FULL;state.phase="fullTime";state.status="finished";state.manualPaused=false;state.runnerActive=false;
 addEvent(state,{type:"full-time",notable:true,description:"FULL TIME. "+state.teams[1].name+" "+state.score[1]+" — "+state.score[2]+" "+state.teams[2].name+".",actors:[]});
 [1,2].forEach(n=>state.teams[n].roster.forEach(p=>p.match.rating=Math.round(clamp(6+p.match.points,3,10)*100)/100));
 const saved=JSON.stringify(snapshotMatch(state));try{sessionStorage.setItem(RESULT_KEY,saved);localStorage.setItem(RESULT_KEY,saved);sessionStorage.removeItem(ACTIVE_MATCH_KEY);}catch(e){}
 if(typeof updateRoute==="function"&&typeof getRouteFromLocation==="function"&&getRouteFromLocation()!=="battleSimResults")updateRoute("battleSimResults");else showResults();
}
function runSequence(state){
 if(!state||state.status==="finished"||state.manualPaused||state.status!=="playing"||state.runnerActive)return;state.runnerActive=true;
 const step=function(){
  if(!match||match!==state||state.status==="finished"){state.runnerActive=false;runnerTimer=null;return;}
  if(state.manualPaused){state.runnerActive=false;runnerTimer=null;storeActiveMatch();renderMatch();return;}
  if(state.status==="paused"){state.runnerActive=false;runnerTimer=null;storeActiveMatch();renderMatch();return;}
  if(feedQueue.length){runnerTimer=setTimeout(step,100);return;}
  if(state.phase==="firstHalf"&&state.timeSeconds>=HALF){state.phase="halfTime";state.pending={type:"half-time",teamNumber:2,zone:7};addEvent(state,{type:"half-time",notable:true,description:"HALF TIME. The teams return to the touchline.",actors:[]});pause(state,"HALF TIME");state.runnerActive=false;runnerTimer=null;storeActiveMatch();renderMatch();return;}
  if(state.timeSeconds>=FULL){state.runnerActive=false;runnerTimer=null;finish(state);return;}
  playerTick(state);if(state.tick%6===0||state.status!=="playing")storeActiveMatch();renderMatch();
  if(state.status!=="playing"){state.runnerActive=false;runnerTimer=null;storeActiveMatch();renderMatch();return;}
  if(state.tick>=MAX_SEQUENCE){state.runnerActive=false;runnerTimer=null;finish(state);return;}runnerTimer=setTimeout(step,TICK_DELAY);
 };step();
}
function createMatch(){const seed=randSeed(),s={seed:seed,random:seeded(seed),tick:0,timeSeconds:0,phase:"firstHalf",status:"playing",stoppage:"",score:{1:0,2:0},teams:{1:runtimeTeam(setupTeams[0],1),2:runtimeTeam(setupTeams[1],2)},events:[],possession:1,carrierId:null,ballZone:7,lastPasser:null,pending:null,forced:null,requiredSub:null};kickoff(s,1);const p=playerIn(s.teams[1],s.carrierId);addEvent(s,{type:"kickoff",teamNumber:1,zone:7,notable:true,description:"Kick-off. "+s.teams[1].name+" get the match underway.",actors:[p],dialogue:p?[{playerId:p.id,text:p.name+": \"Let's get started!\""}]:[]});return s;}
function portrait(parent,p,size){if(!p)return;const img=make("img","bs-portrait");img.src=p.image||(typeof PLAYER_IMAGE_FALLBACK!=="undefined"?PLAYER_IMAGE_FALLBACK:"");img.alt=p.name||"Player";img.width=size||40;img.height=Math.round((size||40)*1.12);img.loading="lazy";img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;else img.remove();};put(parent,img);}
function stratControls(number,team,compact){const wrap=make("div",compact?"bs-strategy-grid bs-strategy-grid--compact":"bs-strategy-grid");STRATEGIES.forEach(d=>{const l=make("label","bs-strategy-control"),head=make("span","bs-strategy-heading");put(head,make("strong","",d.label));put(head,make("output","bs-strategy-value",team.strategy[d.key]));put(l,head);const range=make("input","bs-range");range.type="range";range.min="0";range.max="100";range.value=team.strategy[d.key];range.setAttribute("data-team-strategy",number);range.setAttribute("data-strategy-key",d.key);put(l,range);const ends=make("span","bs-strategy-ends");put(ends,make("span","",d.low));put(ends,make("span","",d.high));put(l,ends);put(wrap,l);});return wrap;}
function renderTeamCard(number){const t=setupTeams[number-1],card=make("section","bs-team-card");card.style.setProperty("--bs-team-color",t.color);card.setAttribute("data-team-card",number);const head=make("div","bs-team-card-heading");put(head,make("span","bs-kicker","TEAM 0"+number+" // MATCH SQUAD"));put(head,make("h2","",t.name));put(card,head);const identity=make("div","bs-team-identity"),name=make("input","bs-name-input");name.type="text";name.maxLength=32;name.value=t.name;name.setAttribute("data-team-name",number);labelField(identity,"Team name",name);const color=make("input","bs-color-input");color.type="color";color.value=t.color;color.setAttribute("data-team-color",number);labelField(identity,"Colour",color);put(card,identity);const source=make("div","bs-source-row"),sourceSelect=make("select","bs-select");sourceSelect.setAttribute("data-team-source",number);option(sourceSelect,"auction","Use drafted auction team",!launchSnapshot);option(sourceSelect,"saved","Use a saved team",!savedTeams.length);option(sourceSelect,"random","Generate a random team",false);sourceSelect.value=t.source==="auction"&&launchSnapshot?"auction":t.source==="saved"&&savedTeams.length?"saved":"random";labelField(source,"Squad source",sourceSelect);const saved=make("select","bs-select");saved.setAttribute("data-saved-team",number);option(saved,"",savedTeams.length?"Choose saved team…":"No saved teams yet",!savedTeams.length);savedTeams.forEach(item=>option(saved,item.id,item.name));saved.value=t.savedId||"";const savedLabel=labelField(source,"Saved team",saved);savedLabel.hidden=sourceSelect.value!=="saved";put(card,source);
const lineupHead=make("div","bs-roster-section-heading");put(lineupHead,make("h3","","STARTING LINE-UP"));put(lineupHead,make("span","",Object.keys(t.assignment).length+" STARTERS"));put(card,lineupHead);const starters=make("div","bs-starter-list");Object.keys(t.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const p=playerIn(t,t.assignment[k]),slot=t.slots[Number(k)];if(!p||!slot)return;const row=make("div","bs-player-row");portrait(row,p,38);const copy=make("div","bs-player-copy"),line=make("div","bs-player-name-line");put(line,make("strong","",p.name));put(line,make("span","bs-role-badge",slot.label));put(copy,line);put(copy,make("span","bs-player-subline","OVR "+Math.round(p.stats.ovr)+" · SPD "+Math.round(p.stats.spd)));put(row,copy);put(starters,row);});put(card,starters);
const reservePlayers=t.roster.filter(p=>!Object.values(t.assignment).map(idOf).includes(idOf(p.id))),reserveHead=make("div","bs-roster-section-heading");put(reserveHead,make("h3","","RESERVES"));put(reserveHead,make("span","",reservePlayers.length+" AVAILABLE"));put(card,reserveHead);const reserveList=make("div","bs-reserve-list");if(!reservePlayers.length)put(reserveList,make("p","bs-empty-note","No reserves on this roster."));reservePlayers.forEach(p=>{const row=make("div","bs-reserve-row");portrait(row,p,32);const copy=make("div","bs-player-copy");put(copy,make("strong","",p.name));put(copy,make("span","bs-player-subline","OVR "+Math.round(p.stats.ovr)));put(row,copy);const select=make("select","bs-select bs-swap-select");select.setAttribute("data-reserve-slot",number);select.setAttribute("data-reserve-player",p.id);option(select,"","Swap for…",false);Object.keys(t.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const starter=playerIn(t,t.assignment[k]);option(select,k,(t.slots[Number(k)]?t.slots[Number(k)].label:"Slot")+" · "+(starter?starter.name:"Empty"));});put(row,select);button(row,"SWAP","bs-mini-button",{"data-swap-player":p.id,"data-swap-team":number});put(reserveList,row);});put(card,reserveList);
const tactic=make("div","bs-roster-section-heading");put(tactic,make("h3","","TEAM STRATEGY"));put(tactic,make("span","","0–100"));put(card,tactic);put(card,stratControls(number,t,false));const save=make("div","bs-save-team-row"),saveName=make("input","bs-name-input");saveName.type="text";saveName.maxLength=32;saveName.value=t.name;saveName.setAttribute("data-save-name",number);saveName.placeholder="Name this saved team";put(save,saveName);button(save,"SAVE TEAM","bs-button bs-button--secondary",{"data-save-team":number});put(card,save);return card;}
function renderInit(){
 document.body.classList.remove("bs-game-route");clearFeedQueue();
 byId("bs-setup-view").hidden=false;byId("bs-match-view").hidden=true;byId("bs-results-view").hidden=true;
 const root=byId("bs-team-grid");root.replaceChildren();setupTeams.forEach((t,i)=>put(root,renderTeamCard(i+1)));
 const labels={auction:"AUCTION DRAFT",saved:"SAVED TEAM",random:"RANDOM TEAM"};
 byId("bs-source-status").textContent=setupTeams.map((t,i)=>"TEAM "+(i+1)+": "+(labels[t.source]||"CUSTOM SQUAD")).join(" · ");
 byId("bs-setup-help").textContent="Edit names, colours, starters, reserves and tactics. Saved teams stay in this browser.";
}
function addPlayerRow(parent,p,team,slotIndex){
 const row=make("div","bs-match-player-row");row.style.setProperty("--bs-team-color",team.color);portraitWithStamina(row,p,36);put(row,flowMeter(p.flow,p.name));
 const copy=make("div","bs-player-copy"),line=make("div","bs-player-name-line");put(line,make("strong","",p.name));put(line,make("span","bs-role-badge",p.role||"CM"));put(copy,line);
 put(copy,playerMeta(p.stats.ovr,ratingNow(p)));
 if(p.yellows>0||p.sentOff){const c=make("span","bs-player-card-state",cardLabel(p));c.classList.add(p.sentOff?"is-red-card":"is-yellow-card");put(copy,c);}
 const track=make("div","bs-stamina-track"),fill=make("span","bs-stamina-fill");fill.style.width=clamp(p.stamina,0,100)+"%";fill.style.background="hsl("+Math.round(clamp(p.stamina,0,100)*1.2)+" 82% 48%)";put(track,fill);put(copy,track);put(row,copy);put(parent,row);
}
function matchTeamPanel(number){
 const t=match.teams[number],aside=make("aside","bs-match-team-panel");aside.style.setProperty("--bs-team-color",t.color);
 put(aside,make("span","bs-kicker","TEAM 0"+number));put(aside,make("h2","",t.name));
 put(aside,make("span","bs-team-possession-label",match.possession===number?"IN POSSESSION":"OUT OF POSSESSION"));put(aside,renderMiniFormation(number));
 const benchHead=make("div","bs-panel-subhead");put(benchHead,make("strong","","RESERVES"));put(benchHead,make("span","",bench(t).length));put(aside,benchHead);
 const benchList=make("div","bs-match-bench");bench(t).forEach(p=>{const row=make("div","bs-bench-player");row.style.setProperty("--bs-team-color",t.color);portraitWithStamina(row,p,38);put(row,flowMeter(p.flow,p.name));if(match.status==="paused"){row.draggable=true;row.setAttribute("data-drag-reserve",p.id);row.setAttribute("data-drag-team",number);row.title="Drag onto a player on the pitch to substitute";}
  const info=make("div","bs-player-copy");put(info,make("strong","",p.name));put(info,playerMeta(p.stats.ovr,ratingNow(p)));
  if(p.yellows>0||p.sentOff){const c=make("span","bs-player-card-state",cardLabel(p));c.classList.add(p.sentOff?"is-red-card":"is-yellow-card");put(info,c);}put(row,info);
  if(match.status==="paused"&&!match.requiredSub){const sel=make("select","bs-select bs-swap-select");sel.setAttribute("data-sub-target-for",p.id);option(sel,"","Replace starter…");Object.keys(t.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const current=playerIn(t,t.assignment[k]);if(current&&current.role!=="GK")option(sel,k,(t.slots[Number(k)]?t.slots[Number(k)].label:"Slot")+" · "+current.name);});put(row,sel);button(row,"SUB IN","bs-mini-button",{"data-sub-in":p.id,"data-sub-team":number});}
  put(benchList,row);
 });if(!bench(t).length)put(benchList,make("p","bs-empty-note","No available reserves."));put(aside,benchList);
 const tactics=make("details","bs-match-tactics");put(tactics,make("summary","","ADJUST TACTICS"));put(tactics,stratControls(number,t,true));put(aside,tactics);return aside;
}
function renderMiniFormation(number){
 const team=match.teams[number],pitch=make("div","bs-mini-pitch");pitch.setAttribute("aria-label",team.name+" formation");put(pitch,make("div","bs-mini-pitch-markings"));
 Object.keys(team.assignment).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{
  const p=playerIn(team,team.assignment[k]),slot=team.slots[Number(k)];if(!slot)return;
  if(!p||(p&&p.sentOff)){
   const req=match.requiredSub;
   if(!(match.status==="paused"&&req&&req.teamNumber===number&&String(req.slot)===String(k)))return;
   const empty=make("div","bs-formation-player bs-formation-player--vacant");empty.style.setProperty("--player-x",clamp(Number(slot.x)||50,7,93)+"%");
   empty.style.setProperty("--player-y",clamp(number===1?100-(Number(slot.y)||50):(Number(slot.y)||50),7,93)+"%");empty.style.setProperty("--bs-team-color",team.color);
   empty.setAttribute("data-swap-slot",k);empty.setAttribute("data-swap-team",number);empty.title="Drop a reserve here to replace the sent-off player";
   put(empty,make("strong","bs-formation-player-name","VACANT"));put(empty,make("span","bs-formation-player-meta","DROP RESERVE"));put(pitch,empty);return;
  }
  const card=make("div","bs-formation-player");if(match.status==="paused"&&p.role!=="GK"){card.setAttribute("data-swap-slot",k);card.setAttribute("data-swap-team",number);card.title="Drop a reserve here to substitute";}
  card.style.setProperty("--player-x",clamp(Number(slot.x)||50,7,93)+"%");
  card.style.setProperty("--player-y",clamp(number===1?100-(Number(slot.y)||50):(Number(slot.y)||50),7,93)+"%");card.style.setProperty("--bs-team-color",team.color);
  const avatar=make("div","bs-formation-avatar");portraitWithStamina(avatar,p,40);put(avatar,flowMeter(p.flow,p.name));put(card,avatar);put(card,make("strong","bs-formation-player-name",p.name));put(card,playerMeta(p.stats.ovr,ratingNow(p),"bs-formation-player-meta"));
  if(p.yellows>0||p.sentOff){const c=make("span","bs-player-card-state",p.sentOff?"RED CARD":"YC "+p.yellows);c.classList.add(p.sentOff?"is-red-card":"is-yellow-card");put(card,c);}
  card.title=p.name+" · OVR "+Math.round(p.stats.ovr)+" · rating "+ratingNow(p).toFixed(2)+" · stamina "+Math.round(p.stamina)+"% · "+cardLabel(p);put(pitch,card);
 });return pitch;
}
function renderPitch(){const pitch=byId("bs-pitch");if(!pitch)return;pitch.replaceChildren();GRID.forEach((row,y)=>row.forEach((zone,x)=>{const z=make("div","bs-zone");z.setAttribute("role","gridcell");z.setAttribute("aria-label","Zone "+zone);if(zone===2||zone===17)z.classList.add("bs-zone--box");if(zone===match.ballZone)z.classList.add("bs-zone--ball");const people=[];[1,2].forEach(n=>active(match.teams[n]).forEach(p=>{if(p.zone===zone)people.push({p:p,t:match.teams[n]});}));if(zone===match.ballZone)put(z,make("span","bs-ball","●"));const markers=make("div","bs-zone-markers");people.slice(0,4).forEach(a=>{const m=make("span","bs-zone-player",a.p.name.split(/\s+/).map(s=>s[0]||"").join("").slice(0,2).toUpperCase());m.style.setProperty("--bs-team-color",a.t.color);m.title=a.p.name;put(markers,m);});put(z,markers);put(pitch,z);}));byId("bs-possession-status").textContent="POSSESSION: "+match.teams[match.possession].name;}
function renderEvent(event,archive){
 const item=make("article","bs-feed-event bs-feed-event--"+event.type+(event.notable?" is-notable":" is-routine"));item.dataset.eventId=String(event.id);
 const holder=match&&match.teams&&(match.teams[event.possessionTeamNumber]||match.teams[event.teamNumber]);if(holder&&holder.color)item.style.setProperty("--bs-event-team-color",holder.color);
 const top=make("div","bs-feed-event-top");put(top,make("time","bs-event-time",event.time||timeLabel(event.timeSeconds)));
 put(top,make("span","bs-event-type",String(event.type).replace(/-/g," ").toUpperCase()));put(item,top);put(item,make("p","bs-event-description",event.description));
 if(event.comparison||event.probability!=null){const analysis=make("div","bs-event-analysis");if(event.comparison){const c=event.comparison;put(analysis,make("span","bs-event-stat-comparison",String(c.attackerLabel||"ATT")+" "+Math.round(Number(c.attackerValue)||0)+" vs "+String(c.defenderLabel||"DEF")+" "+Math.round(Number(c.defenderValue)||0)));}if(event.probability!=null)put(analysis,make("span","bs-event-success",String(event.probabilityLabel||"SUCCESS CHANCE")+" "+Math.round(clamp(Number(event.probability)||0,0,1)*100)+"%"));put(item,analysis);}
 if(event.actors&&event.actors.length){const actors=make("div","bs-event-actors");event.actors.slice(0,3).forEach(p=>{const row=make("div","bs-event-actor"),img=make("img","bs-event-portrait"),actorTeam=match&&match.teams[p.teamNumber];if(actorTeam&&actorTeam.color)row.style.setProperty("--bs-actor-color",actorTeam.color);img.src=p.image||(typeof PLAYER_IMAGE_FALLBACK!=="undefined"?PLAYER_IMAGE_FALLBACK:"");img.alt=p.name||"Player";img.loading="lazy";img.onerror=function(){img.onerror=null;if(typeof PLAYER_IMAGE_FALLBACK!=="undefined")img.src=PLAYER_IMAGE_FALLBACK;};put(row,img);put(row,flowMeter(p.flow,p.name));put(row,make("span","bs-event-actor-name",p.name));put(actors,row);});put(item,actors);}
 if(event.dialogue&&event.dialogue.length){const q=make("div","bs-event-dialogue");event.dialogue.forEach(d=>put(q,make("p","",d.text)));put(item,q);}
 if(archive&&!event.notable)put(item,make("span","bs-routine-tag","ROUTINE EVENT"));return item;
}
function clearFeedQueue(){if(feedTimer!==null)clearTimeout(feedTimer);feedTimer=null;feedQueue=[];feedQueueIds.clear();}
function scheduleFeedEvent(){
 if(feedTimer!==null||!feedQueue.length)return;
 feedTimer=setTimeout(function(){
  feedTimer=null;
  const event=feedQueue.shift();if(event)feedQueueIds.delete(String(event.id));
  const root=byId("bs-live-feed");
  if(event&&root&&match&&match.status!=="finished"){
   const keep=new Set(match.events.filter(e=>e.notable).slice(-24).map(e=>String(e.id)));
   if(keep.has(String(event.id))&&!root.querySelector('[data-event-id="'+String(event.id)+'"]')){
    const empty=root.querySelector(".bs-empty-feed");if(empty)empty.remove();
    const node=renderEvent(event,false);node.style.setProperty("--bs-pop-delay","0ms");
    root.prepend(node);
    root.querySelectorAll("[data-event-id]").forEach(el=>{if(!keep.has(el.dataset.eventId))el.remove();});
    root.scrollTop=0;
   }
  }
  if(feedQueue.length)scheduleFeedEvent();else if(match&&match.status==="paused")renderStoppage();
 },feedDelayMs);
}
function renderFeed(){
 const root=byId("bs-live-feed");if(!root||!match)return;
 const all=match.events.filter(e=>e.notable),visible=all.slice(-24),keep=new Set(visible.map(e=>String(e.id)));
 Array.from(root.querySelectorAll("[data-event-id]")).forEach(el=>{if(!keep.has(el.dataset.eventId))el.remove();});
 feedQueue=feedQueue.filter(e=>keep.has(String(e.id)));feedQueueIds=new Set(feedQueue.map(e=>String(e.id)));
 if(!all.length){root.querySelectorAll(".bs-feed-event").forEach(el=>el.remove());if(!root.querySelector(".bs-empty-feed"))put(root,make("p","bs-empty-feed","The players take their positions. The first notable moment will appear here."));}
 else{
  visible.filter(e=>!root.querySelector('[data-event-id="'+String(e.id)+'"]')&&!feedQueueIds.has(String(e.id))).sort((a,b)=>a.id-b.id).forEach(e=>{feedQueue.push(e);feedQueueIds.add(String(e.id));});
  const empty=root.querySelector(".bs-empty-feed");if(empty&&root.querySelector("[data-event-id]"))empty.remove();
  scheduleFeedEvent();
 }
 root.scrollTop=0;const count=byId("bs-event-count");if(count)count.textContent=all.length+" NOTABLE EVENTS";
}
function renderStoppage(){
 const root=byId("bs-stoppage-panel");if(!root)return;
 const shouldShow=match.status==="paused"&&feedQueue.length===0&&feedTimer===null,wasHidden=root.hidden;root.hidden=!shouldShow;
 if(!shouldShow){root.classList.remove("bs-stoppage-pop");return;}
 const required=match.requiredSub;
 byId("bs-stoppage-title").textContent=match.stoppage||"PLAY PAUSED";
 byId("bs-stoppage-description").textContent=required?"A player has been sent off. Select a replacement before proceeding.":match.stoppage==="HALF TIME"?"Half-time. Adjust tactics or make substitutions before the second half.":match.stoppage==="GOAL"?"Goal confirmed. Proceed to the restart.":match.stoppage==="SAVE"?"The goalkeeper has possession. Proceed to the next sequence.":"Play is paused. Make substitutions or adjust tactics before proceeding.";
 const controls=byId("bs-set-piece-controls");controls.replaceChildren();const pending=match.pending;
 if(pending&&["penalty","free-kick","corner","goal-kick"].includes(pending.type)){
  const team=match.teams[pending.teamNumber],takerLabel=make("label","bs-field");put(takerLabel,make("span","bs-field-label","Set-piece taker"));
  const taker=make("select","bs-select");taker.id="bs-set-piece-taker";active(team).slice().sort((a,b)=>b.stats.sho-a.stats.sho).forEach(p=>option(taker,p.id,p.name+" · SHO "+Math.round(p.stats.sho)));
  if(pending.takerId!=null)taker.value=idOf(pending.takerId);put(takerLabel,taker);put(controls,takerLabel);
  const routineLabel=make("label","bs-field");put(routineLabel,make("span","bs-field-label","Routine"));
  const routine=make("select","bs-select");routine.id="bs-set-piece-routine";
  if(pending.type==="penalty")option(routine,"direct","Take the penalty");
  else if(pending.type==="goal-kick"){option(routine,"short","Short distribution");option(routine,"direct","Long distribution");}
  else if(pending.type==="corner"){option(routine,"cross","Cross into the box");option(routine,"short","Short corner");}
  else{option(routine,"direct","Direct shot");option(routine,"pass","Play a pass");}
  routine.value=pending.routine||"direct";put(routineLabel,routine);put(controls,routineLabel);
 }
 if(required){
  const section=make("section","bs-required-substitution");put(section,make("strong","","MANDATORY SUBSTITUTION"));
  put(section,make("p","bs-help-text","Replace the sent-off player to continue the match."));
  const select=make("select","bs-select");select.id="bs-required-sub-player";option(select,"","Choose a reserve…",false);
  const team=match.teams[required.teamNumber];bench(team).forEach(p=>option(select,p.id,p.name+" · OVR "+Math.round(p.stats.ovr)));
  put(section,select);button(section,"CONFIRM REPLACEMENT","bs-button bs-button--primary",{"data-required-substitute":required.teamNumber});put(controls,section);
 }
 const feed=byId("bs-live-feed");if(feed){const latest=match.events[match.events.length-1],target=latest?feed.querySelector('[data-event-id="'+String(latest.id)+'"]'):null;if(target){if(target.nextElementSibling!==root)target.insertAdjacentElement("afterend",root);}else{const first=feed.querySelector("[data-event-id]");if(first)first.insertAdjacentElement("afterend",root);else if(feed.lastElementChild!==root)feed.appendChild(root);}}
 if(wasHidden){root.classList.remove("bs-stoppage-pop");void root.offsetWidth;root.classList.add("bs-stoppage-pop");}
}
function renderMatch(){
 if(!match||match.status==="finished")return;
 document.body.classList.add("bs-game-route");
 byId("bs-setup-view").hidden=true;byId("bs-match-view").hidden=false;byId("bs-results-view").hidden=true;
 byId("bs-match-time").textContent=timeLabel(match.timeSeconds);byId("bs-score-1").textContent=match.score[1];byId("bs-score-2").textContent=match.score[2];
 byId("bs-match-team-name-1").textContent=match.teams[1].name;byId("bs-match-team-name-2").textContent=match.teams[2].name;
 byId("bs-match-phase").textContent=match.phase==="secondHalf"?"SECOND HALF":match.phase==="halfTime"?"HALF TIME":"FIRST HALF";
 byId("bs-match-status").textContent=match.status==="paused"?"STOPPAGE":match.manualPaused?"PAUSED":"LIVE";
 const root=byId("bs-match-team-panels");
 if(!root.querySelector(".bs-center-stage")){
  root.replaceChildren();put(root,matchTeamPanel(1));const center=make("section","bs-center-stage");put(root,center);put(root,matchTeamPanel(2));
  const pp=make("section","bs-pitch-panel"),ph=make("div","bs-panel-topline");put(ph,make("span","bs-kicker","3 × 6 VIRTUAL PITCH"));put(ph,make("span","bs-possession-status",""));put(pp,ph);
  const pitch=make("div","bs-pitch-grid");pitch.id="bs-pitch";pitch.setAttribute("role","grid");put(pp,pitch);
  const pos=make("p","bs-possession-footnote");pos.id="bs-possession-status";put(pp,pos);put(center,pp);
  const actions=byId("bs-match-view").querySelector(".bs-match-actions");if(actions){put(center,actions);const delay=byId("bs-feed-delay");if(delay)delay.value=String(feedDelayMs/1000);const output=byId("bs-feed-delay-value");if(output)output.textContent=(feedDelayMs/1000).toFixed(2).replace(/\.?0+$/,"")+"s";}
  const fp=make("section","bs-live-feed-panel");fp.style.setProperty("--bs-possession-color",match.teams[match.possession].color);
  const fh=make("div","bs-panel-topline");put(fh,make("h2","","MATCH FEED"));const count=make("span","bs-event-count");count.id="bs-event-count";put(fh,count);put(fp,fh);
  const feed=make("div","bs-live-feed");feed.id="bs-live-feed";feed.setAttribute("aria-live","polite");feed.setAttribute("aria-label","Notable match events");put(fp,feed);put(center,fp);
  const stop=make("section","bs-stoppage-panel");stop.id="bs-stoppage-panel";stop.hidden=true;put(stop,make("span","bs-kicker","SEQUENCE PAUSED"));
  const st=make("h2");st.id="bs-stoppage-title";put(stop,st);const sd=make("p");sd.id="bs-stoppage-description";put(stop,sd);
  const controls=make("div","bs-set-piece-controls");controls.id="bs-set-piece-controls";put(stop,controls);put(feed,stop);
 }else{
  const teams=root.querySelectorAll(":scope > .bs-match-team-panel");if(teams[0])root.replaceChild(matchTeamPanel(1),teams[0]);if(teams[1])root.replaceChild(matchTeamPanel(2),teams[1]);
 }
 const fp=root.querySelector(".bs-live-feed-panel");if(fp)fp.style.setProperty("--bs-possession-color",match.teams[match.possession].color);
 renderPitch();renderFeed();renderStoppage();
 const next=byId("bs-proceed-match");next.disabled=match.status!=="paused"||!!match.requiredSub;next.textContent=match.requiredSub?"SUBSTITUTION REQUIRED":match.status==="paused"?"PROCEED TO NEXT SEQUENCE →":"WAITING FOR STOPPAGE…";
 const pause=byId("bs-pause-match");if(pause){pause.disabled=match.status==="paused"||match.status==="finished";pause.textContent=match.manualPaused?"RESUME SIM":"PAUSE SIM";}
 const ff=byId("bs-fast-forward");if(ff)ff.disabled=match.status==="finished";
}
function teamSummary(number){
 const t=match.teams[number],s=t.stats,poss=Math.round(s.poss/Math.max(1,match.timeSeconds/TICK)*100),panel=make("section","bs-result-team-card");
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
function showResults(){document.body.classList.remove("bs-game-route");clearFeedQueue();byId("bs-setup-view").hidden=true;byId("bs-match-view").hidden=true;byId("bs-results-view").hidden=false;const score=byId("bs-result-score");score.replaceChildren();const a=make("strong","bs-result-team-name",match.teams[1].name),middle=make("strong","bs-result-final-score",match.score[1]+" — "+match.score[2]),b=make("strong","bs-result-team-name",match.teams[2].name);a.style.setProperty("--bs-team-color",match.teams[1].color);b.style.setProperty("--bs-team-color",match.teams[2].color);put(score,a);put(score,middle);put(score,b);const verdict=match.score[1]===match.score[2]?"DRAW":match.score[1]>match.score[2]?match.teams[1].name+" WIN":match.teams[2].name+" WIN";byId("bs-result-verdict").textContent=verdict+" · FULL TIME · "+timeLabel(match.timeSeconds);const summaries=byId("bs-result-team-summaries");summaries.replaceChildren();put(summaries,teamSummary(1));put(summaries,teamSummary(2));renderRatingTable();renderArchive();try{localStorage.setItem(RESULT_KEY,JSON.stringify({date:new Date().toISOString(),score:match.score,events:match.events,timeSeconds:match.timeSeconds}));}catch(e){}window.scrollTo({top:0,behavior:"instant"});}
function startMatch(){
 setupTeams=[normalizeTeam(setupTeams[0],1),normalizeTeam(setupTeams[1],2)];match=createMatch();match.manualPaused=false;matchViewBuilt=false;
 try{sessionStorage.removeItem(LAUNCH_KEY);sessionStorage.removeItem(SETUP_RETURN_KEY);sessionStorage.setItem(ACTIVE_MATCH_KEY,JSON.stringify(snapshotMatch(match)));}catch(e){}
 if(typeof updateRoute==="function")updateRoute("battleSimGame");else{renderMatch();runSequence(match);}
}
function replaceSetupStarter(team,slot,reserveId){const p=playerIn(team,reserveId);if(!p||Object.values(team.assignment).map(idOf).includes(idOf(p.id)))return false;team.assignment[String(slot)]=p.id;return true;}
function substitute(team,slot,reserveId){
 const p=playerIn(team,reserveId),out=playerIn(team,team.assignment[String(slot)]);
 if(!p||!out||active(team).some(x=>idOf(x.id)===idOf(p.id)))return false;
 p.zone=out.zone;p.homeZone=out.homeZone;p.role=team.slots[Number(slot)]?team.slots[Number(slot)].label:"CM";
 p.movementProgress=0;p.stamina=Math.max(p.stamina,92);team.assignment[String(slot)]=p.id;out.role="BENCH";out.homeZone=out.zone;
 if(match.requiredSub&&match.requiredSub.teamNumber===team.number&&String(match.requiredSub.slot)===String(slot))match.requiredSub=null;
 addEvent(match,{type:"substitution",teamNumber:team.number,notable:true,zone:p.zone,description:team.name+" substitute "+p.name+" for "+out.name+".",actors:[p,out],dialogue:[{playerId:p.id,text:p.name+": \"I am ready.\""}]});
 return true;
}
function toggleManualPause(){
 if(!match||match.status==="finished"||match.status==="paused")return;match.manualPaused=!match.manualPaused;
 if(match.manualPaused){if(runnerTimer)clearTimeout(runnerTimer);runnerTimer=null;match.runnerActive=false;storeActiveMatch();renderMatch();}
 else{storeActiveMatch();renderMatch();runSequence(match);}
}
function fastForwardMatch(){
 if(!match||match.status==="finished")return;clearFeedQueue();if(runnerTimer)clearTimeout(runnerTimer);runnerTimer=null;match.runnerActive=false;match.manualPaused=false;let guard=0;
 while(match.status!=="finished"&&guard<2000){guard++;
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
 if(match.status!=="finished")finish(match);
}
function continueMatch(){
 if(!match||match.status!=="paused"||match.requiredSub)return;
 if(match.phase==="halfTime"){match.phase="secondHalf";kickoff(match,2);const p=playerIn(match.teams[2],match.carrierId);addEvent(match,{type:"kickoff",teamNumber:2,notable:true,description:"Second-half kick-off. "+match.teams[2].name+" restart play.",actors:[p],dialogue:[]});}
 else if(match.pending&&match.pending.type==="kickoff")kickoff(match,match.pending.teamNumber);
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
 if(req&&(req.teamNumber!==teamNumber||String(req.slot)!==slot)){event.preventDefault();byId("bs-stoppage-description").textContent="Drag a reserve onto the highlighted vacant position to complete the mandatory substitution.";return;}
 event.preventDefault();const team=match.teams[teamNumber],reserveId=draggedReserve.playerId;
 if(team&&substitute(team,slot,reserveId)){draggedReserve=null;renderMatch();}
}
function handleDragEnd(){
 draggedReserve=null;const root=byId("bs-match-team-panels");if(root)root.querySelectorAll(".is-drop-target").forEach(el=>el.classList.remove("is-drop-target"));
}
function handleClick(event){
 const b=event.target.closest("button");if(!b)return;
 if(b.id==="bs-start-match")startMatch();else if(b.id==="bs-proceed-match")continueMatch();else if(b.id==="bs-pause-match")toggleManualPause();else if(b.id==="bs-fast-forward")fastForwardMatch();
 else if(b.id==="bs-back-home"){if(typeof updateRoute==="function")updateRoute("menu");else window.location.href="../";}
 else if(b.id==="bs-return-setup"||b.id==="bs-return-setup-results"){
  if(match){setupTeams=[normalizeTeam(serializeTeam(match.teams[1]),1),normalizeTeam(serializeTeam(match.teams[2]),2)];setupTeams.forEach(t=>t.source="random");try{sessionStorage.setItem(SETUP_RETURN_KEY,JSON.stringify({teams:setupTeams.map(serializeTeam)}));}catch(e){}}
  if(typeof updateRoute==="function")updateRoute("battleSimInitializer");else{renderInit();window.scrollTo({top:0,behavior:"instant"});}
 }else if(b.id==="bs-rematch")startMatch();
 else if(b.hasAttribute("data-required-substitute")){const n=Number(b.getAttribute("data-required-substitute")),req=match&&match.requiredSub,sel=byId("bs-required-sub-player"),team=match&&match.teams[n];if(!req||!team||req.teamNumber!==n||!sel||!sel.value){byId("bs-stoppage-description").textContent="Choose an available reserve to complete the mandatory substitution.";return;}if(substitute(team,req.slot,sel.value))renderMatch();}
 else if(b.hasAttribute("data-swap-player")){const n=Number(b.getAttribute("data-swap-team")),card=b.closest("[data-team-card]"),sel=card&&card.querySelector('[data-reserve-player="'+b.getAttribute("data-swap-player")+'"]');if(!sel||sel.value===""){byId("bs-setup-help").textContent="Choose which starter this reserve should replace, then press SWAP.";return;}if(replaceSetupStarter(setupTeams[n-1],sel.value,b.getAttribute("data-swap-player")))renderInit();}
 else if(b.hasAttribute("data-save-team")){const n=Number(b.getAttribute("data-save-team")),card=b.closest("[data-team-card]"),input=card&&card.querySelector('[data-save-name="'+n+'"]'),t=setupTeams[n-1],name=String(input&&input.value||t.name).trim().slice(0,32);if(!name){byId("bs-setup-help").textContent="Enter a name before saving this team.";return;}t.name=name;const saved={id:"bst-"+Date.now()+"-"+n,name:name,createdAt:new Date().toISOString(),team:serializeTeam(t)};savedTeams.push(saved);savedTeams=savedTeams.slice(-40);if(!saveSavedTeams()){byId("bs-setup-help").textContent="The browser could not save this team. Check local storage availability.";return;}t.savedId=saved.id;t.source="saved";renderInit();byId("bs-setup-help").textContent="Saved "+name+" to your Battle Sim team library.";}
 else if(b.hasAttribute("data-sub-in")){const n=Number(b.getAttribute("data-sub-team")),rid=b.getAttribute("data-sub-in"),team=match&&match.teams[n],row=b.closest(".bs-bench-player"),sel=row&&row.querySelector("[data-sub-target-for]");if(!team||match.status!=="paused")return;let slot=sel&&sel.value;if(slot==="")slot=Object.keys(team.assignment).find(k=>{const p=playerIn(team,team.assignment[k]);return p&&p.role!=="GK";});if(slot!=null&&substitute(team,slot,rid))renderMatch();}
}
function handleChange(event){const t=event.target;if(t.matches("[data-team-source]")){const n=Number(t.getAttribute("data-team-source")),source=t.value;if(source==="auction"&&launchSnapshot){setupTeams[n-1]=snapshotTeam(n===1?launchSnapshot.team1:launchSnapshot.team2,n,launchSnapshot);}else if(source==="random")setupTeams[n-1]=randomTeam(n,setupTeams[n-1]);else if(source==="saved"&&savedTeams.length){const saved=savedTeams[0];setupTeams[n-1]=normalizeTeam(saved.team,n);setupTeams[n-1].source="saved";setupTeams[n-1].savedId=saved.id;}renderInit();}else if(t.matches("[data-saved-team]")){const n=Number(t.getAttribute("data-saved-team")),saved=savedTeams.find(x=>x.id===t.value);if(saved){setupTeams[n-1]=normalizeTeam(saved.team,n);setupTeams[n-1].source="saved";setupTeams[n-1].savedId=saved.id;renderInit();}}else if(t.matches("[data-archive-filter]")||t.id==="bs-archive-filter")renderArchive();else if(t.matches("[data-team-name]")){const n=Number(t.getAttribute("data-team-name"));setupTeams[n-1].name=String(t.value||"TEAM "+n).slice(0,32);const h=t.closest("[data-team-card]").querySelector(".bs-team-card-heading h2");if(h)h.textContent=setupTeams[n-1].name;}else if(t.matches("[data-team-color]")){const n=Number(t.getAttribute("data-team-color"));if(validColor(t.value)){setupTeams[n-1].color=t.value;t.closest("[data-team-card]").style.setProperty("--bs-team-color",t.value);}}else if(t.matches("[data-team-strategy]")){const n=Number(t.getAttribute("data-team-strategy")),k=t.getAttribute("data-strategy-key"),v=clamp(Number(t.value),0,100);if(setupTeams[n-1])setupTeams[n-1].strategy[k]=v;if(match&&match.teams[n])match.teams[n].strategy[k]=v;const out=t.closest(".bs-strategy-control").querySelector(".bs-strategy-value");if(out)out.textContent=v;}}
function handleInput(event){const t=event.target;if(t&&t.id==="bs-feed-delay"){feedDelayMs=clamp(Number(t.value)||1,.25,5)*1000;const out=byId("bs-feed-delay-value");if(out)out.textContent=(feedDelayMs/1000).toFixed(2).replace(/\.?0+$/,"")+"s";if(feedTimer!==null){clearTimeout(feedTimer);feedTimer=null;scheduleFeedEvent();}return;}if(t.matches("[data-team-name]")){const n=Number(t.getAttribute("data-team-name"));setupTeams[n-1].name=String(t.value||"TEAM "+n).slice(0,32);const h=t.closest("[data-team-card]").querySelector(".bs-team-card-heading h2");if(h)h.textContent=setupTeams[n-1].name;}else if(t.matches("[data-team-color]")){const n=Number(t.getAttribute("data-team-color"));if(validColor(t.value)){setupTeams[n-1].color=t.value;t.closest("[data-team-card]").style.setProperty("--bs-team-color",t.value);}}else if(t.matches("[data-team-strategy]")){const n=Number(t.getAttribute("data-team-strategy")),k=t.getAttribute("data-strategy-key"),v=clamp(Number(t.value),0,100);if(setupTeams[n-1])setupTeams[n-1].strategy[k]=v;if(match&&match.teams[n])match.teams[n].strategy[k]=v;const out=t.closest(".bs-strategy-control").querySelector(".bs-strategy-value");if(out)out.textContent=v;}}
function init(){
 if(initialized||!byId("battle-sim-screen"))return;initialized=true;savedTeams=loadSavedTeams();
 try{launchSnapshot=JSON.parse(sessionStorage.getItem(LAUNCH_KEY)||"null");}catch(e){launchSnapshot=null;}
 let returned=null;try{returned=JSON.parse(sessionStorage.getItem(SETUP_RETURN_KEY)||"null");}catch(e){}
 const route=typeof getRouteFromLocation==="function"?getRouteFromLocation():"battleSim";
 if(route==="battleSimGame"){
  match=readStoredMatch(ACTIVE_MATCH_KEY);if(!match){if(typeof updateRoute==="function")updateRoute("battleSimInitializer",{replace:true});return;}
  if(match.status==="finished"){if(typeof updateRoute==="function")updateRoute("battleSimResults",{replace:true});else showResults();return;}
  setupTeams=[normalizeTeam(serializeTeam(match.teams[1]),1),normalizeTeam(serializeTeam(match.teams[2]),2)];
  const root=byId("battle-sim-screen");root.addEventListener("click",handleClick);root.addEventListener("change",handleChange);root.addEventListener("input",handleInput);root.addEventListener("dragstart",handleDragStart);root.addEventListener("dragover",handleDragOver);root.addEventListener("drop",handleDrop);root.addEventListener("dragend",handleDragEnd);
  renderMatch();if(match.status==="playing"&&!match.manualPaused)runSequence(match);return;
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