#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createModeTestContext}=require('./game-modes-tests.js');
const root=path.resolve(__dirname,'..');
function battleContext(source=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8')){
 const {context,run}=createModeTestContext(),timers=new Map();let timerId=0;
 context.setTimeout=(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;};context.clearTimeout=id=>timers.delete(id);
 context.updateRoute=()=>{};context.getRouteFromLocation=()=> 'battleSimGame';
 const hook=`globalThis.bs={runPlanetHotline,normalizeTeam,resolveSharedPlayer,resolveSharedRoster,serializeTeam,runtimeTeam,keeper,seeded,createMatch,snapshotMatch,hydrateMatch,playerTick,johnUse,johnAutomaticSpecial,johnPaccini,johnHistorySnapshot,johnReverseFateReady,kickoff,resolvePass,resolveShot,resolveDribble,resolveRestart,teamChemistrySnapshot,formationPoint,formationSlots,sequenceReady,continueMatch,runSequence,substitute,replaceSetupStarter,fastForwardMatch,toggleManualPause,finish,saveTeamToSharedStandalone,
 matchTeamPanel,updateTeamPanel,eventMessage,playerOVR,positionRatings,liveFormationPoint,showResults,capturePresentation,validPresentation,displayState,projectPitch,setPosition,setBall,moveOffBall,offBallOrder,movementMeters,dribbleMeters,distance,point,receiverPressure,inOpponentBox,formationStart,zoneAt,setPieceSkill,setPieceUsesPass,setPieceTaker,arrangeSetPiece,checkFoul,playerWeaponsText,trimLiveFeed,setPieceReceiver,virtualPoint,renderPoint,passingChemistry,chemistryPassColor,choosePassKind,pickPassReceiver,stagePendingSetPiece,bench,substitutionEligible,restoreMatchParticipation,maliciaRead,resolveMalicia,reboundRace,supportSpot,prideActive,kitParamP,dribbleSlump,manMarkTarget,reactionMembers,battleAwareness,updateIntents,findRunGap,tracksRun,onBlindSide,shotTechniques,kitAbility,kitReactions,reactionBetween,passIntelligence,playReaction,afterDribble,learn,memoryCount,kitLine,throughRace,throughBallEstimate,ballFlight,resolveThroughBall,recordReception,sanitizeIntelligence,battleSimProfileWeapons,battleSimProfileStatus,keeperFactors,markBeaten,beatenSeverity,reactionKey,reactionReady,useReaction,enforceBlueLockMan,isFlowing,raceProfile,sprintMomentum,inFinishZone,reactionDefsFor,teamHasReactionEffect,renderMiniFormation,chooseAction,passModel,passOptions,dribbleModel,dribbleOptions,shotModel,positionValue,threatAt,aheadM,planTeamShape,roleGroup,arrangeGoalKick,inGoalArea,lastLineM,loadSavedTeams,renderMatch,renderMatchIntro,finishMatchIntro,renderPitch,renderFeed,renderStoppage,scheduleFeedEvent,presentationSettled,progressionState,handleInput,addPoints,addEvent,active,effective,clearFeedQueue,setMatch:s=>match=s,setTeams:t=>setupTeams=t,setFeed:(q,t=null,p=null)=>{feedQueue=q;feedTimer=t;stoppageTimer=p;},get:()=>match,quiet:()=>{renderMatch=()=>{};renderEvent=e=>({id:e.id});showResults=()=>{};},getTimers:()=>[runnerTimer,feedTimer,stoppageTimer]};`;
 const compatibleHook=hook.replace(/\b(capturePresentation|validPresentation|displayState|projectPitch|progressionState|playerOVR|positionRatings|liveFormationPoint|maliciaRead|resolveMalicia|reboundRace|supportSpot|prideActive|kitParamP|dribbleSlump|manMarkTarget|reactionMembers|battleAwareness|updateIntents|findRunGap|tracksRun|onBlindSide|shotTechniques|kitAbility|kitReactions|reactionBetween|passIntelligence|playReaction|afterDribble|learn|memoryCount|kitLine|throughRace|throughBallEstimate|ballFlight|resolveThroughBall|recordReception|sanitizeIntelligence|battleSimProfileWeapons|battleSimProfileStatus|keeperFactors|markBeaten|beatenSeverity|reactionKey|reactionReady|useReaction|enforceBlueLockMan|isFlowing|raceProfile|sprintMomentum|inFinishZone|reactionDefsFor|teamHasReactionEffect|renderMiniFormation)(?=,)/g,name=>name+':typeof '+name+'===\"function\"?'+name+':null');
 vm.runInContext(source.replace('document.addEventListener("DOMContentLoaded",function()',compatibleHook+'\ndocument.addEventListener("DOMContentLoaded",function()'),context);
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
 function attachJohn(state){
  const raw=JSON.parse(JSON.stringify(run('playerById(80)')));
  const slot=Object.keys(state.teams[1].assignment).sort((a,b)=>Number(a)-Number(b)).at(-1);
  const source=state.teams[1].roster.find(p=>String(p.id)===String(state.teams[1].assignment[slot]));
  const john=JSON.parse(JSON.stringify(source));
  Object.assign(john,{id:"80",name:"John Paccini",teamNumber:1,battleSim:raw.battleSim,battleSimState:{cooldowns:{},usedUltimates:[]}});
  state.teams[1].roster.push(john);state.teams[1].assignment[slot]=john.id;
  return john;
 }
 const decreeCases=[
  {rule:"pass-only",line:"The world will stand still. Every player. Every step."},
  {rule:"center-only",line:"All paths lead to the center. You will move where I decree."},
  {rule:"blindness",line:"Then let the pitch disappear. Play without sight."}
 ];
 decreeCases.forEach((test,index)=>{
  const state=bs.createMatch();attachJohn(state);state.random=()=>((index+.25)/3);
  assert(bs.johnAutomaticSpecial(state),"Universal Decree activates automatically");
  assert.equal(state.decree.rule,test.rule,"Universal Decree randomly selects the expected rule");
  assert.equal(state.decree.untilTick,state.tick+3,"Universal Decree lasts for exactly three following ticks");
  assert(state.events.at(-1).dialogue[0].text.includes(test.line),"the selected rule uses its matching John dialogue");
 });
 const passOnlyState=bs.createMatch();attachJohn(passOnlyState);bs.johnUse(passOnlyState,"universal-decree","pass-only");
 for(let i=0;i<3;i++){bs.playerTick(passOnlyState);assert.equal(passOnlyState.decree.rule,"pass-only","pass-only rule remains active for three ticks");}
 bs.playerTick(passOnlyState);assert.equal(passOnlyState.decree,null,"Universal Decree expires after its third affected tick");
 const centerState=bs.createMatch();attachJohn(centerState);bs.johnUse(centerState,"universal-decree","center-only");
 const centerMover=bs.active(centerState.teams[2]).filter(p=>p.role!=="GK").sort((a,b)=>Math.hypot(bs.point(b).x-50,bs.point(b).y-50)-Math.hypot(bs.point(a).x-50,bs.point(a).y-50))[0];
 const centerDistance=Math.hypot(bs.point(centerMover).x-50,bs.point(centerMover).y-50);
 bs.playerTick(centerState);assert(Math.hypot(bs.point(centerMover).x-50,bs.point(centerMover).y-50)<centerDistance,"center-only rule moves players towards the center");
 const blindState=bs.createMatch();attachJohn(blindState);bs.johnUse(blindState,"universal-decree","blindness");
 bs.playerTick(blindState);assert.equal(blindState.blindnessUntil,blindState.decree.untilTick,"blindness rule removes pitch vision for the decree duration");
 const authorityState=bs.createMatch(),authorityJohn=attachJohn(authorityState);bs.setMatch(authorityState);
 authorityJohn.flow=100;authorityJohn.flowActivationPending=true;authorityJohn.battleSimState.cooldowns["universal-decree"]=1000;
 bs.playerTick(authorityState);
 assert(authorityState.authorityUsed,"Absolute Authority activates when John enters Flow");
 assert.equal(authorityState.authoritySequence.remaining,6,"Absolute Authority starts with six separate goal ticks");
 assert.equal(authorityState.authoritySequence.winner,undefined,"Absolute Authority does not preselect one winning team");
 const baseScore={1:authorityState.score[1],2:authorityState.score[2]};
 const baseGoals={1:authorityState.teams[1].stats.goals,2:authorityState.teams[2].stats.goals};
 authorityState.nextNotableAt=Number.MAX_SAFE_INTEGER;
 const coinRolls=[.1,.9,.9,.1,.9,.1],expectedWinners=coinRolls.map(roll=>roll<.5?1:2);let randomCalls=0,flipCalls=0;
 authorityState.random=()=>{const call=randomCalls++;if(call%2===0)return .5;return coinRolls[flipCalls++];};authorityState.random.getState=()=>0;
 for(let i=0;i<6;i++){
  const winner=expectedWinners[i],beforeTick=authorityState.tick,beforeEvents=authorityState.events.length,beforeScore=authorityState.score[winner],beforeGoals=authorityState.teams[winner].stats.goals,beforeTotal=authorityState.score[1]+authorityState.score[2];
  bs.playerTick(authorityState);
  assert.equal(authorityState.tick,beforeTick+1,"each coin flip consumes exactly one tick");
  assert.equal(authorityState.score[1]+authorityState.score[2],beforeTotal+1,"each flip awards exactly one goal");
  assert.equal(authorityState.score[winner],beforeScore+1,"the flip winner receives the goal");
  assert.equal(authorityState.teams[winner].stats.goals,beforeGoals+1,"the flip winner's goal statistic increments");
  const goalEvent=authorityState.events.slice(beforeEvents).find(event=>event.type==="absolute-authority-goal");
  assert(goalEvent,"each Absolute Authority tick records a goal event");
  assert.equal(goalEvent.teamNumber,winner,"each tick awards its goal to that tick's coin-flip winner");
  assert(goalEvent.description.includes("coin flip "+(i+1)+" of 6"),"the event identifies the current coin-flip number");
  assert(goalEvent.description.includes(authorityState.teams[winner].name),"the event names the team selected by the flip");
  if(i<5)assert.equal(authorityState.authoritySequence?.remaining,5-i,"the six-tick sequence decrements once per flip");
  else assert.equal(authorityState.authoritySequence,null,"the sequence ends on the sixth flip");
 }
 assert.equal(flipCalls,6,"Absolute Authority makes exactly six independent coin flips");
 assert.equal(authorityState.score[1],baseScore[1]+3,"team 1 receives exactly the three goals selected by its flips");
 assert.equal(authorityState.score[2],baseScore[2]+3,"team 2 receives exactly the three goals selected by its flips");
 assert.equal(authorityState.teams[1].stats.goals,baseGoals[1]+3,"team 1 goal statistics include its three flips");
 assert.equal(authorityState.teams[2].stats.goals,baseGoals[2]+3,"team 2 goal statistics include its three flips");
 assert.equal(authorityState.authoritySequence,null,"Absolute Authority ends after the sixth flip");
 assert.equal(authorityState.status,"paused","the match pauses when the six-tick sequence is complete");
 assert.equal(authorityState.pending?.type,"kickoff","the match stages a kickoff after the final goal");
 console.log('PASS Battle Sim: Absolute Authority flips independently on six consecutive ticks and awards one goal per flip');
 console.log('PASS Battle Sim: John Paccini Universal Decree randomly selects one of three rules, matching dialogue and three-tick effects');
 const reverseState=bs.createMatch();attachJohn(reverseState);bs.setMatch(reverseState);
 for(let i=0;i<9;i++)bs.playerTick(reverseState);
 assert.equal(reverseState.tick,9,"Reverse Fate remains unavailable during the first nine match ticks");
 const target=reverseState.johnHistory.at(-4),targetData=target.data,targetEventCount=target.eventsLength;
 assert.equal(targetData.tick,5,"The five-tick target snapshot is retained");
 bs.playerTick(reverseState);
 assert.equal(reverseState.tick,targetData.tick,"Reverse Fate restores the exact tick from five ticks earlier");
 assert.equal(reverseState.timeSeconds,targetData.timeSeconds,"Reverse Fate restores match time");
 assert.equal(JSON.stringify(reverseState.score),JSON.stringify(targetData.score),"Reverse Fate restores the score");
 assert.equal(JSON.stringify(reverseState.ball),JSON.stringify(targetData.ball),"Reverse Fate restores the ball position");
 assert.equal(reverseState.possession,targetData.possession,"Reverse Fate restores possession");
 assert.equal(reverseState.events.length,targetEventCount+1,"Only the retained history and single activation message remain");
 assert.equal(reverseState.events.at(-1).type,"reverse-fate","The Reverse Fate message survives the rewind");
 assert.equal(reverseState.events.filter(e=>e.type==="reverse-fate").length,1,"The rewind does not duplicate Reverse Fate messages");
 assert.equal(reverseState.events.at(-1).presentation.timeSeconds,targetData.timeSeconds,"Reverse Fate presents the restored state immediately");
 assert.equal(reverseState.events.at(-1).reversePresentations,undefined,"Reverse Fate does not replay discarded ticks through a blocking presentation sequence");
 assert.equal(reverseState.johnHistory.length,3,"Snapshots from the reverted ticks are removed from history");
 assert.equal(new Set(reverseState.events.map(e=>e.id)).size,reverseState.events.length,"Event IDs remain unique after truncation");
 for(const n of [1,2]){
  const actual=reverseState.teams[n],expected=targetData.teams[n];
  assert.equal(JSON.stringify(actual.assignment),JSON.stringify(expected.assignment),"Reverse Fate restores substitutions and player availability");
  for(const p of actual.roster){const old=expected.roster.find(q=>String(q.id)===String(p.id));assert(old,"The restored roster player exists");assert.equal(JSON.stringify([p.x,p.y,p.stamina,p.flow,p.yellows,p.sentOff,p.matchStatus,p.match.goals,p.match.assists]),JSON.stringify([old.x,old.y,old.stamina,old.flow,old.yellows,old.sentOff,old.matchStatus,old.match.goals,old.match.assists]),"Reverse Fate restores player and disciplinary state");}
 }
 const restoredJohn=bs.johnPaccini(reverseState);
 assert(Number(restoredJohn.battleSimState.cooldowns["reverse-fate"])>reverseState.tick,"Reverse Fate cooldown is not refunded");
 const secondHalfGate=bs.createMatch();attachJohn(secondHalfGate);secondHalfGate.phase="secondHalf";secondHalfGate.halfStartTick=100;secondHalfGate.tick=109;secondHalfGate.johnHistory=Array(8).fill({});
 assert.equal(bs.johnReverseFateReady(secondHalfGate),false,"Reverse Fate is unavailable during the first nine ticks of the second half");
 assert.equal(bs.johnUse(secondHalfGate,"reverse-fate"),false,"Direct activation cannot bypass the second-half gate");
 secondHalfGate.tick=110;
 assert.equal(bs.johnReverseFateReady(secondHalfGate),true,"Reverse Fate becomes available after ten second-half ticks");
 const cooldownState=bs.createMatch(),cooldownJohn=attachJohn(cooldownState),otherCooldownPlayer=bs.active(cooldownState.teams[1]).find(p=>String(p.id)!=="80");
 cooldownState.tick=10;cooldownJohn.battleSimState={cooldowns:{existingJohnAbility:85},usedUltimates:[]};
 otherCooldownPlayer.battleSimState={cooldowns:{existingPlayerAbility:75},usedUltimates:[]};
 cooldownState.reactionCooldowns={existingReaction:65};
 cooldownState.johnHistory=Array.from({length:5},()=>bs.johnHistorySnapshot(cooldownState));
 // Advance cooldowns after the snapshots so the rewind must restore other players
 // and reaction cooldowns while keeping John's current cooldowns.
 otherCooldownPlayer.battleSimState.cooldowns.existingPlayerAbility=95;
 otherCooldownPlayer.battleSimState.cooldowns.futureAbility=99;
 cooldownState.reactionCooldowns.existingReaction=95;
 assert(bs.johnUse(cooldownState,"reverse-fate"),"Reverse Fate can activate after the ten-tick gate");
 const cooldownJohnAfter=bs.johnPaccini(cooldownState),otherCooldownAfter=bs.active(cooldownState.teams[1]).find(p=>String(p.id)===String(otherCooldownPlayer.id));
 assert.equal(cooldownJohnAfter.battleSimState.cooldowns.existingJohnAbility,85,"John's existing ability cooldown is retained");
 assert.equal(cooldownJohnAfter.battleSimState.cooldowns["reverse-fate"],50,"The new Reverse Fate cooldown is retained");
 assert.equal(otherCooldownAfter.battleSimState.cooldowns.existingPlayerAbility,75,"Other players' ability cooldowns rewind to the selected snapshot");
 assert.equal(otherCooldownAfter.battleSimState.cooldowns.futureAbility,undefined,"Cooldowns added during the reverted ticks are removed");
 assert.equal(cooldownState.reactionCooldowns.existingReaction,65,"Global reaction cooldowns rewind to the selected snapshot");
 console.log("PASS Battle Sim: Reverse Fate gates, five-tick state restoration, event trimming and John-only cooldown preservation");
 const introMatch=bs.createMatch();introMatch.introPending=true;const restoredIntro=bs.hydrateMatch(JSON.parse(JSON.stringify(bs.snapshotMatch(introMatch))));assert(restoredIntro&&restoredIntro.introPending,'pre-match intro survives route handoff and reload');assert.equal(restoredIntro.tick,0,'no simulation ticks are consumed during the intro');restoredIntro.introPending=false;assert.equal(restoredIntro.introPending,false,'skipping clears the intro state');
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
  if(s.requiredSub){bs.setMatch(s);s.presentedEventId=s.events.length;const req=s.requiredSub,t=s.teams[req.teamNumber],reserve=bs.bench(t)[0];if(reserve)assert(bs.substitute(t,req.slot,reserve.id));else s.requiredSub=null;}
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

 // Kickoff passes remain guaranteed even with the highest possible random roll.
 {
  const kickoffPass=bs.createMatch();bs.setMatch(kickoffPass);
  const kickoffTaker=bs.active(kickoffPass.teams[1]).find(p=>p.role!=="GK");
  const kickoffReceiver=bs.active(kickoffPass.teams[1]).find(p=>p.id!==kickoffTaker.id&&p.role!=="GK");
  bs.setPosition(kickoffTaker,{x:49.5,y:50});bs.setPosition(kickoffReceiver,{x:46,y:50});
  bs.active(kickoffPass.teams[2]).forEach(p=>bs.setPosition(p,{x:99,y:99}));
  kickoffPass.random=()=>0.999999;
  bs.resolvePass(kickoffPass,kickoffTaker,{passKind:"short",receiverId:kickoffReceiver.id,kickoff:true});
  assert.equal(kickoffPass.events.at(-1).type,"pass","kickoff passes are guaranteed");
  assert.equal(kickoffPass.events.at(-1).probability,1,"kickoff pass probability is exactly 100%");
 }
 // Nearby defenders reduce pass and dribble success by count.
 {
  const makePass=near=>{const state=bs.createMatch();bs.setMatch(state);const p=bs.active(state.teams[1]).find(x=>x.role!=="GK"),r=bs.active(state.teams[1]).find(x=>x.id!==p.id&&x.role!=="GK");bs.setPosition(p,{x:42,y:50});bs.setPosition(r,{x:46,y:50});bs.active(state.teams[2]).filter(x=>x.role!=="GK").forEach((d,i)=>bs.setPosition(d,near&&i<2?{x:46,y:50}:{x:99,y:99}));state.random=()=>.5;bs.resolvePass(state,p,{passKind:"short",receiverId:r.id});const e=state.events.at(-1);return e.type==="pass"?e.probability:1-e.probability;};
  assert(makePass(false)>makePass(true),"nearby defenders reduce pass success probability");
  assert.equal(makePass(false),1,"passes with no nearby defenders are guaranteed");
  const makeDribble=count=>{const state=bs.createMatch();bs.setMatch(state);const p=bs.active(state.teams[1]).find(x=>x.role!=="GK");bs.setPosition(p,{x:42,y:50});bs.active(state.teams[2]).filter(x=>x.role!=="GK").forEach((d,i)=>bs.setPosition(d,i<count?{x:47,y:50}:{x:99,y:99}));state.random=()=>.5;bs.resolveDribble(state,p);const e=state.events.at(-1);return e.type==="dribble"?e.probability:1-e.probability;};
  assert(makeDribble(0)>makeDribble(2),"multiple nearby defenders reduce dribble success probability");
  assert.equal(makeDribble(0),1,"dribbles into space with no nearby defenders are guaranteed");
  // A 75 DRI player should not have an almost-certain dribble against an 85 DEF marker.
  {
   const state=bs.createMatch();bs.setMatch(state);
   const attacker=bs.active(state.teams[1]).find(p=>p.role!=="GK");
   const marker=bs.active(state.teams[2]).find(p=>p.role!=="GK");
   attacker.stats.dri=75;attacker.stats.spd=75;marker.stats.def=85;
   bs.setPosition(attacker,{x:42,y:50});
   bs.active(state.teams[2]).filter(p=>p.role!=="GK").forEach(p=>bs.setPosition(p,p.id===marker.id?{x:47,y:50}:{x:99,y:99}));
   state.random=()=>0;bs.resolveDribble(state,attacker);
   const event=state.events.at(-1);
   assert.equal(event.type,"dribble","deterministic success roll exposes the calculated dribble chance");
   assert(event.probability<.95,"a 75 DRI player must not exceed 95% against an 85 DEF nearby defender");
  }
  // Pass success also uses the receiver's OFF, chemistry, defender count and one nearby DEF roll.
  {
   const state=bs.createMatch();bs.setMatch(state);
   const passer=bs.active(state.teams[1]).find(p=>p.role!=="GK");
   const receiver=bs.active(state.teams[1]).find(p=>p.id!==passer.id&&p.role!=="GK");
   const marker=bs.active(state.teams[2]).find(p=>p.role!=="GK");
   passer.stats.pas=75;receiver.stats.off=75;marker.stats.def=85;
   bs.setPosition(passer,{x:42,y:50});bs.setPosition(receiver,{x:46,y:50});
   bs.active(state.teams[2]).filter(p=>p.role!=="GK").forEach(p=>bs.setPosition(p,p.id===marker.id?{x:46,y:50}:{x:99,y:99}));
   state.random=()=>0;bs.resolvePass(state,passer,{passKind:"short",receiverId:receiver.id});
   const event=state.events.at(-1);
   assert.equal(event.type,"pass","deterministic success roll exposes the calculated pass chance");
   assert(event.probability<.95,"a contested average pass must not be almost guaranteed");
  }
 }
 // Passing pressure and the feed include defenders near both the passer and receiver.
 {
  const state=bs.createMatch();bs.setMatch(state);
  const passer=bs.active(state.teams[1]).find(p=>p.role!=="GK");
  const receiver=bs.active(state.teams[1]).find(p=>p.id!==passer.id&&p.role!=="GK");
  const markers=bs.active(state.teams[2]).filter(p=>p.role!=="GK");
  bs.setPosition(passer,{x:42,y:50});bs.setPosition(receiver,{x:46,y:50});
  bs.setPosition(markers[0],{x:42,y:50});bs.setPosition(markers[1],{x:46,y:50});
  markers.slice(2).forEach(p=>bs.setPosition(p,{x:99,y:99}));
  state.random=()=>0;bs.resolvePass(state,passer,{passKind:"short",receiverId:receiver.id});
  const event=state.events.at(-1);
  assert.equal(event.type,"pass");
  assert.equal(event.nearbyDefenders.length,2,"pass considers defenders near either endpoint");
  assert.equal(event.nearbyDefenders.filter(d=>d.selected).length,1,"one random defender is marked for the DEF roll");
  assert(event.nearbyDefenders.every(d=>Number.isFinite(d.distance)&&d.def>=0&&d.def<=100));
 }
 // Dribble events retain every nearby defender, not only the random defender used for DEF.
 {
  const state=bs.createMatch();bs.setMatch(state);
  const carrier=bs.active(state.teams[1]).find(p=>p.role!=="GK");
  const markers=bs.active(state.teams[2]).filter(p=>p.role!=="GK");
  bs.setPosition(carrier,{x:42,y:50});bs.setPosition(markers[0],{x:47,y:50});bs.setPosition(markers[1],{x:47,y:51});
  markers.slice(2).forEach(p=>bs.setPosition(p,{x:99,y:99}));
  state.random=()=>.99;bs.resolveDribble(state,carrier);
  const event=state.events.at(-1);
  assert(["dribble","turnover"].includes(event.type));
  assert.equal(event.nearbyDefenders.length,2,"dribble feed lists every nearby defender");
  assert.equal(event.nearbyDefenders.filter(d=>d.selected).length,1);
 }
 // Shot attempts store a dedicated straight route from the shooter to the attacking goal.
 {
  const state=bs.createMatch();bs.setMatch(state);
  const shooter=bs.active(state.teams[1]).find(p=>p.role!=="GK");
  bs.setPosition(shooter,{x:72,y:43});state.random=()=>0;
  bs.resolveShot(state,shooter,false);
  const event=state.events.find(e=>e.type==="shot-attempt");
  assert(event?.shotRoute,"shot attempt includes a separate pitch route");
  assert.deepEqual(JSON.parse(JSON.stringify(event.shotRoute.from)),{x:72,y:43});
  assert.deepEqual(JSON.parse(JSON.stringify(event.shotRoute.to)),{x:99,y:50});
 }
 // Failed shots have four equally sized outcome bands; the shot-attempt event also draws its notable-event interval.
 {
  const expected=["corner","save","rebound","goal-kick"];
  for(let i=0;i<4;i++){const state=bs.createMatch();bs.setMatch(state);const p=bs.active(state.teams[1]).find(x=>x.role!=="GK");bs.setPosition(p,{x:40,y:50});const rolls=[.999999,.5,(i+.5)/4];state.random=()=>rolls.shift()??.5;bs.resolveShot(state,p,false);assert.equal(state.events.at(-1).type,expected[i],"failed shot outcome "+i);if(i===1)assert.equal(state.pending?.type,"goal-kick","clean save restarts with a goal kick");}
 }
 // A substitute holding the ball must hand possession to the incoming player.
 state=bs.createMatch();bs.setMatch(state);state.status='paused';state.presentedEventId=state.events.length;const team=state.teams[1],slot='1',out=team.roster.find(p=>p.id===team.assignment[slot]),reserve=team.roster.find(p=>!Object.values(team.assignment).includes(p.id));state.possession=1;state.carrierId=out.id;
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
// Positional lineup for balance samples (a stand-in for Auto Best): every slot takes the best-rated
// remaining player whose primary position fits it, then one whose listed positions fit, then anyone.
const SLOT_FIT={LB:['LB','LWB','WB','DF'],RB:['RB','RWB','WB','DF'],CB:['CB','DF'],DM:['DM','CM'],CM:['CM','DM','AM'],AM:['AM','SS','CM'],LW:['LW','LM','WM','FW','SS'],RW:['RW','RM','WM','FW','SS'],LM:['LM','LW','WM'],RM:['RM','RW','WM'],LWB:['LWB','LB','WB'],RWB:['RWB','RB','WB'],ST:['ST','CF','FW','SS']};
function positionalAssignment(h,formation,ids,teamNumber){
 const slots=h.run('FORMATIONS['+JSON.stringify(formation)+'].map(s=>s.label)'),info=h.run('Object.fromEntries('+JSON.stringify(ids)+'.map(id=>{const p=playerById(id);return[id,{ovr:p.stats.ovr,pos:p.positions||[],prim:p.primaryPosition||""}];}))');
 const a={0:9100+teamNumber},left=ids.slice(),order=slots.map((l,i)=>i).filter(i=>slots[i]!=='GK'),fit=i=>SLOT_FIT[slots[i]]||[slots[i]];
 const take=(i,list)=>{const pick=list.sort((x,y)=>info[y].ovr-info[x].ovr||String(x).localeCompare(String(y)))[0];if(pick!=null){a[i]=pick;left.splice(left.indexOf(pick),1);}};
 order.forEach(i=>take(i,left.filter(id=>fit(i).includes(info[id].prim))));
 order.filter(i=>a[i]==null).forEach(i=>take(i,left.filter(id=>info[id].pos.some(p=>fit(i).includes(p)))));
 order.filter(i=>a[i]==null).forEach(i=>take(i,left.slice()));
 return a;
}
module.exports={battleContext,runBattleSimTests,positionalAssignment};
