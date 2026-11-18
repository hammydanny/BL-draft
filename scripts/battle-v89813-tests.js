#!/usr/bin/env node
'use strict';
// 0.8.9.8.13: drafted squads reach Battle Sim exactly (and a fresh hand-off beats a stale setup), one shared
// saved-squad library (legacy compatible, de-duplicated, secret-gated), the Team Builder's Battle Sim kit
// panel and Randomise Team, seeded goal-kick variety without free strikers, cover behind the marked
// threat, and the UI clean-up (no Early Access labels, taller feed, scrollable weapon list).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {battleContext}=require('./battle-sim-tests');
const ENGINE=process.env.BS_ENGINE||'js/battle-sim.js';
const {createModeTestContext}=require('./game-modes-tests');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const EXPORTS='launchTeams,setupSource,loadSavedTeams,saveTeamToSquadLibrary,arrangeSetPiece,defensivePlan,aheadM,distance,ownGoal,roleGroup,inGoalArea,active';
function engine(){
 const source=fs.readFileSync(path.resolve(root,ENGINE),'utf8').replace('document.addEventListener("DOMContentLoaded",function()','globalThis.ID={'+EXPORTS+'};document.addEventListener("DOMContentLoaded",function()');
 const h=battleContext(source),store=new Map(),session=new Map();
 h.context.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 h.context.sessionStorage={getItem:k=>session.has(k)?session.get(k):null,setItem:(k,v)=>session.set(k,String(v)),removeItem:k=>session.delete(k)};
 h.bs.quiet();return{...h,I:h.context.ID,store,session};
}
const ids=list=>Array.from(list,p=>Number(p.id));

function transfer(){
 const {run,I,session,context}=engine();context.openBattleSimPage=()=>{};
 // Two different formations, manual (non-optimal) slot choices, a bench, a captain and both special keepers.
 run(`team1={name:'KAISER FC',color:'#ff2255',budget:0,players:[blueLockManFor(1),...[1,2,3,4,5,6,7,8,9,10,11,12,13].map(playerById)]};
  team2={name:'NAGI UNITED',color:'#22aaff',budget:0,players:[blueLockManFor(2),...[14,15,16,17,18,19,20,21,22,23,24,25].map(playerById)]};
  formationByTeam={1:'4-4-2',2:'3-5-2'};
  formationAssignments={1:{0:9101,1:13,2:12,3:11,4:10,5:9,6:8,7:7,8:6,9:5,10:4},2:{0:9102,1:25,2:24,3:23,4:22,5:21,6:20,7:19,8:18,9:17,10:16}};
  formationCaptainByTeam={1:6,2:20};`);
 session.set('blBattleSimSetupReturnV1',JSON.stringify({timestamp:1,teams:[{name:'OLD'},{name:'OLD'}]}));
 run('openBattleSimFromResults()');
 assert(!session.has('blBattleSimSetupReturnV1'),'a new hand-off clears the stale setup return');
 const snapshot=JSON.parse(session.get('blBattleSimLaunchV1')),launch=I.launchTeams(snapshot);
 assert.equal(launch.missing,0);assert(launch.teams,'both squads load');
 const want=[{name:'KAISER FC',color:'#ff2255',formation:'4-4-2',captain:'6',roster:[9101,1,2,3,4,5,6,7,8,9,10,11,12,13],a:run('formationAssignments[1]')},
  {name:'NAGI UNITED',color:'#22aaff',formation:'3-5-2',captain:'20',roster:[9102,14,15,16,17,18,19,20,21,22,23,24,25],a:run('formationAssignments[2]')}];
 launch.teams.forEach((t,i)=>{const w=want[i];
  assert.equal(t.name,w.name);assert.equal(t.color,w.color);assert.equal(t.formation,w.formation,'formation kept');
  assert.deepEqual(ids(t.roster).sort((a,b)=>a-b),w.roster.slice().sort((a,b)=>a-b),'every player, bench included');
  for(const [slot,id] of Object.entries(w.a))assert.equal(String(t.assignment[slot]),String(id),'exact slot '+slot+' in team '+(i+1));
  assert.equal(String(t.captainId),w.captain,'captain kept');});
 // Precedence: a stale setup never hides a newer transfer; a setup returned after the transfer is kept.
 assert.equal(I.setupSource({timestamp:200,team1:{},team2:{}},{timestamp:100,teams:[{},{}]}),'launch');
 assert.equal(I.setupSource({timestamp:100,team1:{},team2:{}},{timestamp:200,teams:[{},{}]}),'returned');
 assert.equal(I.setupSource({timestamp:100,team1:{},team2:{}},{teams:[{},{}]}),'launch','an undated (older) return loses to a transfer');
 assert.equal(I.setupSource(null,{timestamp:5,teams:[{},{}]}),'returned');assert.equal(I.setupSource(null,null),'random');
 // Unresolvable players are counted for the notice; a squad with nobody left is never replaced silently.
 const partial=JSON.parse(JSON.stringify(snapshot));partial.team1.players.push({id:999999,name:'Ghost'});
 assert.equal(I.launchTeams(partial).missing,1);
 const empty=JSON.parse(JSON.stringify(snapshot));empty.team2.players=[{id:999998}];
 assert.equal(I.launchTeams(empty).teams,null,'no partial random replacement');
 const src=read('js/battle-sim.js');
 assert(src.includes('could not be loaded in Battle Sim.')&&src.includes('so Battle Sim opened new random teams.')&&src.includes('help.setAttribute("role","alert")'),'failures are reported, not silent');
 console.log('PASS v0.8.9.8.13 transfer: names, colours, 4-4-2 / 3-5-2, all 27 players, 22 exact slots, captains and both special keepers; fresh hand-off beats a stale setup');
}

function savedSquads(){
 const {run,I,store}=engine();
 run(`formationByTeam={0:'4-3-3',1:'4-3-3',2:'4-3-3'};formationAssignments={0:{},1:{},2:{}};`);
 store.set('blStandaloneBuilderV1',JSON.stringify({v:1,name:'MY BUILDER XI',color:'#123456',playerIds:[1,2,3],formation:'4-3-3',assignment:{}}));
 const builderBefore=store.get('blStandaloneBuilderV1');
 const team=run(`bs.normalizeTeam({name:'SIM SAVE',color:'#33cc77',formation:'4-2-3-1',roster:[blueLockManFor(1),...[1,2,3,4,5,6,7,8,9,10,11,12].map(playerById)],assignment:{},strategy:{pressing:81,width:22}},1)`);
 team.captainId=team.assignment[5];
 const res=I.saveTeamToSquadLibrary(team,'SIM SAVE');assert(res.ok,res.error);
 assert.equal(store.get('blStandaloneBuilderV1'),builderBefore,'saving from Battle Sim never overwrites the Team Builder');
 const library=run('readSquadLibrary()');assert.equal(library.items.length,1);const saved=library.items[0].squad;
 assert.equal(saved.formation,'4-2-3-1');assert.equal(saved.color,'#33cc77');assert.equal(saved.strategy.pressing,81);assert.equal(saved.strategy.width,22);
 assert.equal(String(saved.captainId),String(team.captainId));assert.equal(saved.playerIds.length,13,'bench kept');
 for(const [slot,id] of Object.entries(team.assignment))assert.equal(String(saved.assignment[slot]),String(id));
 // A Team Builder save, an imported code and a legacy Battle Sim save all appear in Battle Sim's dropdown.
 run(`saveReplaySquad({v:1,name:'BUILDER SQUAD',color:'#abcdef',playerIds:[20,21,22,23,24,25,26,27,28,29,30],formation:'4-3-3',assignment:{0:20},captainId:null});
  saveReplaySquad(importSquadCode(exportSquadCode({v:1,name:'IMPORTED',color:'#fedcba',playerIds:[31,32,33,34,35,36,37,38,39,40,41],formation:'4-4-2',assignment:{1:31},captainId:31})));`);
 store.set('blBattleSimTeamLibraryV1',JSON.stringify([{id:'old-1',name:'LEGACY SIM',color:'#111111',formation:'4-3-3',playerIds:[42,43,44,45,46,47,48,49,50,51,52],assignment:{0:42}},
  // The same squad as the library's SIM SAVE (identical name, formation, players and slots) is listed once.
  {id:'dup',name:saved.name,color:saved.color,formation:saved.formation,playerIds:saved.playerIds,assignment:saved.assignment}]));
 let list=I.loadSavedTeams();const names=list.map(x=>x.team.name);
 for(const n of ['SIM SAVE','BUILDER SQUAD','IMPORTED','LEGACY SIM','MY BUILDER XI'])assert(names.includes(n),n+' is offered');
 assert.equal(names.filter(n=>n==='SIM SAVE').length,1,'no duplicates across storages');
 const imported=list.find(x=>x.team.name==='IMPORTED').team;assert.equal(imported.formation,'4-4-2');assert.equal(String(imported.assignment[1]),'31');assert.equal(String(imported.captainId),'31');
 // Secret gate: a library squad containing a locked secret player is not offered (nor partially loaded).
 const secret=run('players.find(p=>p.secretCharacter).id');
 run(`secretCharactersUnlocked=true;saveReplaySquad({v:1,name:'SECRET SQUAD',color:'#000000',playerIds:[53,54,${secret}],formation:'4-3-3',assignment:{},captainId:null});secretCharactersUnlocked=false;`);
 list=I.loadSavedTeams();assert(!list.some(x=>x.team.name==='SECRET SQUAD'),'locked secret squads stay hidden');
 assert(!list.some(x=>x.team.roster.some(p=>String(p.id)===String(secret))),'no secret player leaks');
 run('secretCharactersUnlocked=true');assert(I.loadSavedTeams().some(x=>x.team.name==='SECRET SQUAD'),'available once unlocked');run('secretCharactersUnlocked=false');
 // Legacy library files are read, never rewritten.
 assert(store.get('blBattleSimTeamLibraryV1').includes('LEGACY SIM'));
 console.log('PASS v0.8.9.8.13 saved squads: Battle Sim saves to bldSavedSquadsV1 (formation, slots, bench, captain, strategy), lists builder/imported/legacy/auction squads once, Team Builder untouched, secret squads gated');
}

function teamBuilder(){
 const {context,run}=createModeTestContext();context.window.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});
 for(const f of ['js/lore.js','js/ui/formation-ui.js']){try{vm.runInContext(read(f),context);}catch(e){if(!/matchMedia|is not a function|Cannot read/.test(e.message))throw e;}}
 // Battle Sim kit panel: the authoritative categorisation, every group, partners for reactions, no duplicates.
 const isagi=run('playerBattleAbilitiesMarkup(playerById(1))'),kit=run('battleSimKitList(playerById(1))');
 for(const box of ['PASSIVE','SPECIAL','ULTIMATE','FLOW'])assert(isagi.includes('<h3>'+box+'</h3>'),'Isagi shows '+box);
 const names=kit.map(k=>k.entry.name);assert.equal(new Set(names.map((n,i)=>n+'|'+(kit[i].partner?.id||''))).size,names.length,'no duplicate kit entries');
 for(const k of kit)assert(isagi.includes(run('esc')(k.entry.name)),k.entry.name+' rendered');
 const reaction=run('players.find(p=>!p.secretCharacter&&battleSimKitList(p).some(k=>k.kind==="CHEMICAL REACTION"&&k.partner&&!k.partner.secretCharacter))');
 const markup=run(`playerBattleAbilitiesMarkup(playerById(${reaction.id}))`);
 assert(markup.includes('CHEMICAL REACTION')&&markup.includes('player-battle-partner'),'reactions name their partner');
 const sae=run('playerBattleAbilitiesMarkup(playerById(14))'),shidou=run('playerBattleAbilitiesMarkup(playerById(31))');
 assert(sae.includes('Reflex')&&shidou.includes('Reflex'),'a shared reaction shows in both partners');
 assert(!/specials\b/.test(read('js/ui/formation-ui.js').match(/function playerBattleAbilitiesMarkup[\s\S]*?\n}/)[0]),'no private categorisation');
 // Randomise Team: only the squad's own players, a valid same-format formation, a keeper in goal.
 run(`maxPlayers=15;team1={name:'R',color:'#123456',budget:0,players:[blueLockManFor(1),...[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(playerById)]};team2={name:'S',color:'#654321',budget:0,players:[]};
  formationByTeam={1:'4-3-3',2:'4-3-3'};formationAssignments={1:{},2:{}};formationCaptainByTeam={1:null,2:null};`);
 const own=run('team1.players.map(p=>p.id)'),formations=new Set();
 for(let seed=1;seed<=40;seed++){
  const lineup=run(`(()=>{let v=${seed*7919};return randomLineupForTeam(1,()=>{v=(Math.imul(v,1103515245)+12345)>>>0;return v/4294967296;});})()`);
  formations.add(lineup.formation);const shape=run(`formationShape(${JSON.stringify(lineup.formation)})`),used=Object.values(lineup.assignment);
  assert(used.every(id=>own.includes(id)),'only selected players');assert.equal(new Set(used).size,used.length,'nobody twice');assert.equal(used.length,11,'a full XI');
  const gk=Object.entries(lineup.assignment).find(([s])=>shape[s].label==='GK');assert(gk&&gk[1]===9101,'the special keeper stays in goal');
 }
 assert(formations.size>=4,'formations vary: '+[...formations].join(', '));
 run(`team1.players=[];`);assert.equal(run('randomLineupForTeam(1)'),null,'nothing to randomise without players');
 const ui=read('js/ui/formation-ui.js');assert(ui.includes('onclick="randomiseTeam()"')&&ui.includes('RANDOMISE TEAM'),'button next to Auto Best');
 assert(!/confirm\(|showConfirm/.test(read('js/formations.js').match(/function randomiseTeam[\s\S]*?\n}/)[0]),'no confirmation menu');
 console.log('PASS v0.8.9.8.13 team builder: kit panel (passive/special/ultimate/Flow/reactions with partner, no duplicates); Randomise Team keeps the squad, a keeper and varies formations ('+formations.size+')');
}

function goalKicks(){
 const {bs:b,I,run}=engine();b.setTeams(run(`[bs.normalizeTeam({name:'A',formation:'4-3-3',roster:[blueLockManFor(1),...[1,2,3,4,5,6,7,8,9,10,11].map(playerById)],assignment:{}},1),bs.normalizeTeam({name:'B',formation:'4-4-2',roster:[blueLockManFor(2),...[12,13,14,15,16,17,18,19,20,21,22].map(playerById)],assignment:{}},2)]`));const layouts=new Set();let checked=0;
 for(const routine of ['short','direct'])for(const n of [1,2])for(let seed=1;seed<=24;seed++){
  const s=b.createMatch();s.seed=seed*977;s.tick=40+seed;b.setMatch(s);s.teams[n===1?2:1].strategy.pressing=[20,55,85][seed%3];
  const pending={type:'goal-kick',teamNumber:n,routine,zone:'D1'},taker=b.keeper(s.teams[n]);I.arrangeSetPiece(s,pending,taker);checked++;
  const own=I.active(s.teams[n]).filter(p=>p.id!==taker.id&&p.role!=='GK'),opp=I.active(s.teams[n===1?2:1]).filter(p=>p.role!=='GK');
  layouts.add(routine+':'+own.map(p=>Math.round(p.x/4)+','+Math.round(p.y/4)).join(';'));
  for(const p of [...own,...opp]){assert(p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100,'on the pitch');assert(!I.inGoalArea(n,p),'nobody stands in the goal area');}
  for(const p of opp)assert(I.aheadM(n,p)>=18.5,'opponents start outside the penalty area');
  if(routine==='direct'){
   // The opposition reads a long kick: every advanced striker has a defender goal-side within reach.
   const strikers=own.filter(p=>I.roleGroup(p.role)==='ST');
   for(const st of strikers){const goalSide=opp.filter(d=>I.aheadM(n,d)>I.aheadM(n,st)-1&&I.distance(d,st)<16);assert(goalSide.length>=1,'striker left unmarked on a long goal kick (seed '+seed+', side '+n+')');}
  }
 }
 const short=[...layouts].filter(x=>x.startsWith('short')).length,long=[...layouts].filter(x=>x.startsWith('direct')).length;
 assert(short>=20&&long>=20,'seeded variety: '+short+' short and '+long+' long layouts');
 // Determinism: the same stoppage gives the same arrangement.
 const again=()=>{const s=b.createMatch();s.seed=4242;s.tick=77;b.setMatch(s);const pending={type:'goal-kick',teamNumber:1,routine:'direct',zone:'D1'};I.arrangeSetPiece(s,pending,b.keeper(s.teams[1]));return JSON.stringify(I.active(s.teams[1]).map(p=>[p.x.toFixed(3),p.y.toFixed(3)]));};
 assert.equal(again(),again(),'deterministic');
 console.log('PASS v0.8.9.8.13 goal kicks: '+checked+' layouts (both directions, short and long, three pressing levels): '+short+'/'+long+' distinct, none in the goal area, strikers always have a goal-side defender on a long kick');
}

function cover(){
 const {bs:b,I,run}=engine();let covered=0,cases=0;
 for(const n of [1,2])for(let k=0;k<6;k++){
  const t=run(`[bs.normalizeTeam({name:'A',formation:'4-3-3',roster:[blueLockManFor(1),...[1,2,3,4,5,6,7,8,9,10,11].map(playerById)],assignment:{}},1),bs.normalizeTeam({name:'B',formation:'4-3-3',roster:[blueLockManFor(2),...[12,13,14,15,16,17,18,19,20,21,22].map(playerById)],assignment:{}},2)]`);
  b.setTeams(t);const s=b.createMatch();b.setMatch(s);s.status='playing';s.tick=50+k;const att=n===1?2:1,X=v=>n===1?v:100-v;
  const defenders=I.active(s.teams[n]).filter(p=>p.role!=='GK'),attackers=I.active(s.teams[att]).filter(p=>p.role!=='GK');
  // An attack entering our half: the carrier 46 m out, a striker running at the line, the defence in its shape.
  const depth={CB:17,FB:21,DM:27,CM:31,WM:33,AM:36,W:42,ST:44},lane={};defenders.forEach(p=>{const g=I.roleGroup(p.role);lane[g]=(lane[g]||0)+1;const count=defenders.filter(q=>I.roleGroup(q.role)===g).length;b.setPosition(p,{x:X(depth[g]||30),y:count===1?50:15+70*(lane[g]-1)/(count-1)});});attackers.forEach((p,i)=>b.setPosition(p,{x:X(46+(i%3)*4),y:10+i*8}));
  const carrier=attackers.find(p=>I.roleGroup(p.role)==='CM')||attackers[0],st=attackers.find(p=>I.roleGroup(p.role)==='ST');
  b.setPosition(carrier,{x:X(44),y:50});b.setPosition(st,{x:X(28),y:44+k});s.possession=att;s.carrierId=carrier.id;b.setBall(s,carrier);
  const shape=new Map(defenders.map(p=>[p.id,{x:p.x,y:p.y}])),targets=new Map(),fixed=new Set();
  I.defensivePlan(s,s.teams[n],defenders,carrier,shape,targets,fixed,new Map());cases++;
  const behind=defenders.filter(d=>targets.get(d.id)&&I.aheadM(n,targets.get(d.id))<I.aheadM(n,st)&&I.distance(targets.get(d.id),st)<12);
  if(behind.length>=2)covered++;
  for(const d of defenders){const q=targets.get(d.id);assert(q&&q.x>=0&&q.x<=100&&q.y>=0&&q.y<=100,'defensive targets stay on the pitch');}
 }
 assert(covered>=cases-1,'a marker and a cover defender stay goal-side of the striker: '+covered+'/'+cases);
 console.log('PASS v0.8.9.8.13 defending: marker plus a goal-side cover defender behind the striker in '+covered+'/'+cases+' midfield attacks (both directions)');
}

function ui(){
 const shells=['index.html','team-builder/index.html','lore/index.html','auction/room/index.html','auction/setup/index.html','auction/results/index.html','auction/team-builder/index.html','battle-sim/initializer/index.html','battle-sim/game/index.html','battle-sim/results/index.html','battle-sim/index.html','battle-sim-disabled/index.html'];
 for(const f of shells){const html=read(f).replace(/battle=early-access\d/g,'');assert(!/early access/i.test(html),f+' still shows an Early Access label');}
 for(const f of ['js/battle-sim.js','js/ui/site-directory.js','js/router.js'])assert(!/EARLY ACCESS|Early Access/.test(read(f)),f+' still sets an Early Access label');
 assert(/release-089812[\s\S]*?</.test(read('changelog/index.html')),'history keeps older entries');
 const feed=read('css/battle-renaissance.css').match(/body\.bs-game-route \.bs-live-feed\{height:clamp\((\d+)px,[\d.]+vh,(\d+)px\);min-height:0;max-height:(\d+)px/);
 assert(feed&&Number(feed[2])>=480&&Number(feed[2])<=520&&feed[2]===feed[3],'Match Feed is 60–100px taller than 420px');
 const bs=read('css/battle-sim.css');assert(/overflow-y:auto/.test(bs.slice(bs.indexOf('0.8.9.8.13'))),'the weapon list scrolls as one container');
 assert(/a\.home-mode[^{]*\{text-decoration:none\}/.test(read('css/homepage.css'))&&/a\.lore-action[^{]*\{text-decoration:none\}/.test(read('css/character-lore.css')),'route cards are not underlined');
 console.log('PASS v0.8.9.8.13 UI: no active Early Access labels in '+shells.length+' shells, Match Feed 500px cap, one scrolling weapon list, route cards without underlines');
}

function runBattleV89813Tests(){transfer();savedSquads();teamBuilder();goalKicks();cover();ui();}
if(require.main===module)runBattleV89813Tests();
module.exports={runBattleV89813Tests};
