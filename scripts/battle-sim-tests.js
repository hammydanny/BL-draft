#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createModeTestContext}=require('./game-modes-tests.js');
const root=path.resolve(__dirname,'..');
function battleContext(source=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8')){
 const {context,run}=createModeTestContext(),timers=new Map();let timerId=0;
 context.setTimeout=(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;};context.clearTimeout=id=>timers.delete(id);
 context.updateRoute=()=>{};context.getRouteFromLocation=()=> 'battleSimGame';
 const hook=`globalThis.bs={normalizeTeam,resolveSharedPlayer,resolveSharedRoster,serializeTeam,runtimeTeam,keeper,seeded,createMatch,snapshotMatch,hydrateMatch,playerTick,kickoff,resolvePass,resolveShot,resolveDribble,resolveRestart,teamChemistrySnapshot,formationPoint,formationSlots,sequenceReady,continueMatch,runSequence,substitute,replaceSetupStarter,fastForwardMatch,toggleManualPause,finish,saveTeamToSharedStandalone,
 matchTeamPanel,updateTeamPanel,eventMessage,setMatch:s=>match=s,setTeams:t=>setupTeams=t,setFeed:(q,t=null,p=null)=>{feedQueue=q;feedTimer=t;stoppageTimer=p;},get:()=>match,quiet:()=>{renderMatch=()=>{};showResults=()=>{};},getTimers:()=>[runnerTimer,feedTimer,stoppageTimer]};`;
 vm.runInContext(source.replace('document.addEventListener("DOMContentLoaded",function()',hook+'\ndocument.addEventListener("DOMContentLoaded",function()'),context);
 return {context,run,timers,bs:context.bs};
}
function runBattleSimTests(){
 const {context,run,timers,bs}=battleContext();bs.quiet();
 const teams=run(`[1,2].map(n=>({name:'Team '+n,color:n===1?'#19a7ff':'#ff315d',formation:'4-3-3',roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice(n===1?0:20,n===1?14:34)],assignment:{0:blueLockManFor(n).id}}))`);
 context.sessionStorage.setItem=(key,value)=>context.handoff=JSON.parse(value);context.openBattleSimPage=()=>{};
 run(`team1.players=[blueLockManFor(1),...players.filter(p=>!p.secretCharacter).slice(0,14)];team2.players=[blueLockManFor(2),...players.filter(p=>!p.secretCharacter).slice(20,34)];formationAssignments={1:{0:9101},2:{0:9102}};openBattleSimFromResults();`);
 assert(context.handoff.team1.players.some(p=>p.id===9101));assert(context.handoff.team2.players.some(p=>p.id===9102));assert.equal(context.handoff.assignments[1][0],9101);assert.equal(context.handoff.assignments[2][0],9102);
 context.sessionStorage.setItem=()=>{};
 const configs=teams.map((t,i)=>bs.normalizeTeam(t,i+1));bs.setTeams(configs);
 for(let i=0;i<2;i++){
  const team=configs[i],id=String(9101+i);assert.equal(team.assignment[0],id);
  assert.equal(bs.keeper(bs.runtimeTeam(team,i+1)).stats.gk,86);
  const copy=bs.normalizeTeam(bs.serializeTeam(team),i+1);assert.equal(copy.assignment[0],id);
  assert.equal(bs.resolveSharedPlayer({id:Number(id),name:'FORGED',stats:{gk:100}}).stats.gk,86);
  assert.equal(bs.resolveSharedPlayer({id:Number(id),name:'FORGED',stats:{gk:100}}).name,'Blue Lock Man');
  assert(!bs.replaceSetupStarter(team,0,team.roster.at(-1).id),'locked special keeper');
  assert(bs.saveTeamToSharedStandalone(team,team.name),'special keeper saves through shared builder storage');
 }
 const forgedTwins=bs.normalizeTeam({...teams[0],roster:[...teams[0].roster,run('blueLockManFor(2)')]},1);assert.equal(forgedTwins.roster.filter(p=>p.id==='9101'||p.id==='9102').length,1);
 for(const malformed of [null,42,{roster:'bad'},{players:{}},{roster:[null,{id:88888}]}])assert.equal(bs.normalizeTeam(malformed,1).roster.length,0);
 assert.equal(bs.resolveSharedPlayer({id:888888,name:'Blue Lock Man',stats:{gk:100}}),null);
 assert.equal(run('players.filter(p=>p.id===9101||p.id===9102).length'),0);
 assert.equal(bs.resolveSharedPlayer(run('players.find(p=>p.secretCharacter)')),null);
 const formations=run('Object.keys(FORMATIONS)');
 for(const name of formations)for(const n of [1,2]){
  const config=bs.normalizeTeam({...teams[n-1],formation:name,slots:bs.formationSlots(name)},n),team=bs.runtimeTeam(config,n);
  assert.equal(Object.keys(team.assignment).length,11,name);assert.equal(new Set(Object.values(team.assignment)).size,11);
  assert.equal(bs.keeper(team).role,'GK');
  for(const link of bs.teamChemistrySnapshot(team).links){
   for(const endpoint of [link.a,link.b]){const point=bs.formationPoint(endpoint.slot,n===1);assert(point.x>=7&&point.x<=93&&point.y>=9&&point.y<=91);assert.equal(team.assignment[endpoint.index],endpoint.p.id);}
  }
  const first=Object.values(team.assignment).find(id=>id!==String(9100+n));team.roster.find(p=>p.id===first).sentOff=true;
  assert(bs.teamChemistrySnapshot(team).links.every(l=>l.a.p.id!==first&&l.b.p.id!==first),'sent-off links invalidated');
 }
 console.log('PASS Battle Sim: canonical Blue Lock Man handoff/attributes/saves/locks, secret gate; every formation/orientation/lineup');
 let state=bs.createMatch();bs.setMatch(state);state.status='paused';state.runnerActive=false;
 assert(bs.sequenceReady(state,{queued:0,timer:false,presenting:false}));
 for(const p of [{queued:1},{timer:true},{presenting:true}])assert(!bs.sequenceReady(state,p));
 for(const patch of [{manualPaused:true},{requiredSub:{}},{runnerActive:true},{status:'playing'},{status:'finished'},{phase:'fullTime'},{timeSeconds:5400}])assert(!bs.sequenceReady({...state,...patch},{queued:0,timer:false,presenting:false}));
 bs.setFeed([{id:1}]);const tick=state.tick;bs.continueMatch();assert.equal(state.tick,tick);
 bs.setFeed([]);state.presentedEventId=state.events.length;bs.continueMatch();const runningTick=state.tick;bs.continueMatch();assert.equal(state.tick,runningTick,'double click starts only one sequence');
 bs.toggleManualPause();assert(state.manualPaused);const pausedTick=state.tick;assert.equal(state.tick,pausedTick);bs.toggleManualPause();assert(!state.manualPaused);
 bs.setFeed([],123,456);bs.fastForwardMatch();assert.equal(state.status,'finished');assert.equal(state.timeSeconds,5400);assert(bs.getTimers().every(t=>t===null));
 assert.equal(timers.size,0,'fast forward clears timers');
 console.log('PASS Battle Sim: progression gates feed/timers/presentation/half-time/substitution/pause/full-time, double clicks and fast-forward');
 function advance(s){if(s.status==='paused'){
  if(s.requiredSub){bs.setMatch(s);const req=s.requiredSub,t=s.teams[req.teamNumber],reserve=t.roster.find(p=>!Object.values(t.assignment).includes(p.id)&&!p.sentOff);if(reserve)assert(bs.substitute(t,req.slot,reserve.id));else s.requiredSub=null;}
  if(s.phase==='halfTime'){s.phase='secondHalf';bs.kickoff(s,2);}else if(s.pending?.type==='kickoff')bs.kickoff(s,s.pending.teamNumber);else if(s.pending)s.forced={...s.pending};s.status='playing';s.stoppage='';
 }
 if(s.timeSeconds>=5400){bs.finish(s);return;}
 if(s.phase==='firstHalf'&&s.timeSeconds>=2700){s.phase='halfTime';s.status='paused';return;}
 bs.playerTick(s);
 }
 for(let seed=1;seed<=24;seed++){
  const a=bs.createMatch();a.seed=seed;a.random=bs.seeded(seed);bs.setMatch(a);
  for(let i=0;i<45;i++)advance(a);
  const b=bs.hydrateMatch(JSON.parse(JSON.stringify(bs.snapshotMatch(a))));assert(b,'valid match restores');
  let guard=0;while(a.status!=='finished'&&guard++<1000){bs.setMatch(a);advance(a);bs.setMatch(b);advance(b);}
  assert.equal(a.status,'finished');assert.equal(b.status,'finished');
  assert.deepEqual(JSON.parse(JSON.stringify(bs.snapshotMatch(a))),JSON.parse(JSON.stringify(bs.snapshotMatch(b))),'seed '+seed+' save/restore continuation');
  for(const n of [1,2]){const t=a.teams[n];assert.equal(t.stats.goals,a.score[n]);assert.equal(t.stats.shots,t.roster.reduce((s,p)=>s+p.match.shots,0));assert.equal(t.stats.saves,t.roster.reduce((s,p)=>s+p.match.saves,0));assert(t.roster.every(p=>p.stamina>=0&&p.stamina<=100&&p.flow>=0&&p.flow<=100));assert.equal(new Set(Object.values(t.assignment)).size,Object.keys(t.assignment).length);}
  assert.equal(new Set(a.events.map(e=>e.id)).size,a.events.length);
 }
 assert.equal(bs.hydrateMatch({teams:{},events:[]}),null);
 const full=bs.createMatch();full.status='paused';full.timeSeconds=5400;full.phase='secondHalf';full.presentedEventId=full.events.length;assert(!bs.sequenceReady(full,{queued:0,timer:false,presenting:false}));
 for(const type of ['interception','turnover','save']){const copy=bs.eventMessage({type,actors:[{name:'Losing attacker'},{name:'Winning defender'},{name:'Interceptor'}]});assert.equal(copy.values.player,type==='interception'?'Interceptor':'Winning defender');}

 // A substitute holding the ball must hand possession to the incoming player.
 state=bs.createMatch();bs.setMatch(state);state.status='paused';const team=state.teams[1],slot='1',out=team.roster.find(p=>p.id===team.assignment[slot]),reserve=team.roster.find(p=>!Object.values(team.assignment).includes(p.id));state.possession=1;state.carrierId=out.id;
 assert(bs.substitute(team,slot,reserve.id));assert.equal(state.carrierId,reserve.id);assert(!bs.substitute(team,'2',reserve.id));
 console.log('PASS Battle Sim: 24 seeded full matches preserve subsequent state after restore, statistics, stamina/Flow, unique events and substitution possession');
 // Execute bundle and original modules in separate shared classic scopes.
 const original=vm.createContext({}),bundled=vm.createContext({});require('./test-player-modules.js').loadPlayerModules(original);
 vm.runInContext(fs.readFileSync(path.join(root,'js/characters.generated.js'),'utf8'),bundled);
 const moduleNames=[...fs.readFileSync(path.join(root,'js/characters.generated.js'),'utf8').matchAll(/const ([A-Z0-9_]+)\s*=/g)].map(m=>m[1]);
 for(const name of moduleNames)assert.equal(JSON.stringify(vm.runInContext(name,bundled)),JSON.stringify(vm.runInContext(name,original)),name);
 assert(moduleNames.length>100);assert(require('./bundle-characters.js').check());
 const fingerprinted=require('./set-version.js').cachedAssets();
 for(const file of ['js/battle-sim.js','css/battle-sim.css','css/battle-renaissance.css','js/characters.generated.js'])assert(fingerprinted.includes(file),'nested base-href asset fingerprint: '+file);
 const localeContext=vm.createContext({window:{}});
 for(const file of ['messages','quote-messages','replayability-messages','ego-messages'])vm.runInContext(fs.readFileSync(path.join(root,'js/i18n/'+file+'.js'),'utf8'),localeContext);
 const previousMessages=JSON.stringify(localeContext.window.BLD_MESSAGES),previous=JSON.parse(previousMessages);
 vm.runInContext(fs.readFileSync(path.join(root,'js/i18n/battle-messages.js'),'utf8'),localeContext);
 for(const [key,values] of Object.entries(previous))assert.equal(JSON.stringify(localeContext.window.BLD_MESSAGES[key]),JSON.stringify(values),'existing mode translation preserved: '+key);
 localeContext.window.SiteI18n={language:'ms',text:value=>value};assert.equal(localeContext.window.BattleCopy('PASS'),'HANTARAN');assert.equal(localeContext.window.BLD_MESSAGES.PASS.ms,'Lepas');assert.equal(localeContext.window.BattleCopy('SAVE'),'SELAMATAN');
 console.log('PASS Battle Sim: generated bundle is current and byte-equivalent in data to individual classic modules ('+moduleNames.length+' records)');
}
if(require.main===module)runBattleSimTests();
module.exports={battleContext,runBattleSimTests};
