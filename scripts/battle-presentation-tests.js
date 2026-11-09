#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {battleContext}=require('./battle-sim-tests.js');
function teams(h){h.bs.setTeams(h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+14)],assignment:{0:9100+n}},n))`));}
function prepare(h,seed){teams(h);h.context.window.crypto={getRandomValues:a=>{a[0]=seed;}};const s=h.bs.createMatch();s.seed=seed;s.random=h.bs.seeded(seed);h.bs.setMatch(s);return s;}
function advance(h,s){
 s.presentedEventId=s.events.length;
 if(s.status==='paused'){
  if(s.requiredSub){const req=s.requiredSub,t=s.teams[req.teamNumber],r=t.roster.find(p=>!Object.values(t.assignment).includes(p.id)&&!p.sentOff);if(r)assert(h.bs.substitute(t,req.slot,r.id));else s.requiredSub=null;}
  if(s.phase==='halfTime'){s.phase='secondHalf';h.bs.kickoff(s,2);}else if(s.pending?.type==='kickoff')h.bs.kickoff(s,s.pending.teamNumber);else if(s.pending)s.forced={...s.pending};s.status='playing';s.stoppage='';
 }
 if(s.timeSeconds>=5400){h.bs.finish(s);return;}
 if(s.phase==='firstHalf'&&s.timeSeconds>=2700){s.phase='halfTime';s.status='paused';return;}
 h.bs.playerTick(s);
}
const plain=v=>JSON.parse(JSON.stringify(v));
function runPresentationTests(){
 const h=battleContext();h.bs.quiet();const s=prepare(h,81);s.presentedEventId=1;
 const before=plain(h.bs.displayState());
 const shooter=s.teams[1].roster.find(p=>p.role!=='GK');shooter.zone=17;s.ballZone=17;h.bs.resolveShot(s,shooter,false,{name:'Test finish'});
 const attempt=s.events.find(e=>e.type==='shot-attempt'),goal=s.events.find(e=>e.type==='goal');assert(goal);
 assert.equal(h.bs.displayState().score[1],0,'unrevealed goal cannot change displayed score');
 assert.equal(JSON.stringify(h.bs.displayState().teams[1].roster.map(p=>[p.zone,p.flow,p.stamina])),JSON.stringify(before.teams[1].roster.map(p=>[p.zone,p.flow,p.stamina])),'future position and meters hidden');
 s.presentedEventId=attempt.id;assert.equal(h.bs.displayState().score[1],0);s.presentedEventId=goal.id;assert.equal(h.bs.displayState().score[1],1);
 assert.notEqual(s.ballZone,goal.presentation.ballZone,'goal reset stays behind the event boundary');
 const clone=h.bs.hydrateMatch(plain(h.bs.snapshotMatch(s)));assert(clone);assert.deepEqual(plain(h.bs.capturePresentation(h.bs.displayState(clone))),plain(h.bs.capturePresentation(h.bs.displayState(s))));
 const malformed=plain(h.bs.snapshotMatch(s));malformed.events.at(-1).presentation.teams[1].players[0][3]=999;assert.equal(h.bs.hydrateMatch(malformed),null);
 const legacy=plain(h.bs.snapshotMatch(s));legacy.events.forEach(e=>delete e.presentation);delete legacy.presentationVersion;legacy.presentedEventId=0;const restored=h.bs.hydrateMatch(legacy);assert.equal(restored.presentedEventId,restored.events.length,'legacy history revealed as one existing state');
 for(const n of [1,2])s.teams[n].roster.forEach(p=>p.zone=7);
 let points=h.bs.projectPitch(s);assert.equal(points.size,22);assert.equal(new Set([...points.values()].map(p=>p.x+':'+p.y)).size,22);
 assert([...points.values()].every(p=>p.x>=4.5&&p.x<=95.5&&p.y>=7&&p.y<=93));assert.deepEqual(plain([...h.bs.projectPitch(s)]),plain([...points]),'projection is stable');
 for(let zone=0;zone<18;zone++){for(const n of [1,2])s.teams[n].roster.forEach(p=>p.zone=zone);const packed=[...h.bs.projectPitch(s).values()];assert.equal(new Set(packed.map(p=>p.x+':'+p.y)).size,22);assert(packed.every(p=>p.x>=4.5&&p.x<=95.5&&p.y>=7&&p.y<=93));}
 const sent=s.teams[1].roster.find(p=>p.role!=='GK');sent.sentOff=true;assert.equal(h.bs.projectPitch(s).size,21);sent.sentOff=false;
 s.presentedEventId=s.events.length;const t=s.teams[1],slot='1',out=t.roster.find(p=>p.id===t.assignment[slot]),reserve=t.roster.find(p=>!Object.values(t.assignment).includes(p.id));
 h.bs.addEvent(s,{type:'play',description:'Waiting for reveal',actors:[]});assert(!h.bs.substitute(t,slot,reserve.id),'substitution blocked while feed is presenting');s.presentedEventId=s.events.length;
 assert(h.bs.substitute(t,slot,reserve.id));assert(h.bs.projectPitch(h.bs.displayState(s)).has('1:'+out.id),'old lineup remains visible before substitution reveal');s.presentedEventId=s.events.length;assert(h.bs.projectPitch(h.bs.displayState(s)).has('1:'+reserve.id));assert(!h.bs.projectPitch(h.bs.displayState(s)).has('1:'+out.id));
 const p=t.roster[3];p.flow=98;h.bs.addPoints(p,.1);assert.equal(p.flow,100);assert(p.flowActivationPending);h.bs.playerTick(s);const count=s.events.filter(e=>e.type==='flow-activation'&&e.actors[0].id===p.id).length;h.bs.playerTick(s);assert.equal(s.events.filter(e=>e.type==='flow-activation'&&e.actors[0].id===p.id).length,count);
 console.log('PASS presentation: event-boundary score/positions/Flow/stamina, snapshot restore/validation, legacy saves, 22 markers, red cards, substitutions and one Flow activation');
 // The old fixture captured zone-era physics. Preserve its twelve seed IDs,
 // but assert independent complete spatial simulations reproduce the exact
 // position, Flow, stamina and match-event timeline.
 const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/battle-presentation-v081.json'),'utf8'));
 for(const fixture of fixtures.matches){
  const a=prepare(h,fixture.seed),b=prepare(h,fixture.seed),digestA=createHash('sha256'),digestB=createHash('sha256');let ticks=0;
  while((a.status!=='finished'||b.status!=='finished')&&ticks++<1000){
   if(a.status!=='finished'){h.bs.setMatch(a);advance(h,a);digestA.update(JSON.stringify(a.teams[1].roster.map(p=>[p.x,p.y,p.flow,p.stamina,p.match])));}
   if(b.status!=='finished'){h.bs.setMatch(b);advance(h,b);digestB.update(JSON.stringify(b.teams[1].roster.map(p=>[p.x,p.y,p.flow,p.stamina,p.match])));}
  }
  assert.equal(a.status,'finished');assert.equal(b.status,'finished');
  assert.equal(digestA.digest('hex'),digestB.digest('hex'),'spatial timeline seed '+fixture.seed);
  assert.deepEqual(plain(h.bs.snapshotMatch(a)),plain(h.bs.snapshotMatch(b)),'complete seeded physics/RNG/events seed '+fixture.seed);
 }
 console.log('PASS presentation: 12 full spatial seeded simulations reproduce position/Flow/stamina/statistic timelines and results');
 schedulerTests();
 const r=battleContext();r.bs.quiet();const restart=prepare(r,9);r.bs.resolveShot(restart,restart.teams[1].roster.find(p=>p.role!=="GK"),false,{name:"Test finish"});restart.presentedEventId=restart.events.length;
 const rng=restart.random.getState();r.bs.continueMatch();assert.equal(restart.random.getState(),rng,"restart presentation cannot consume RNG");assert.equal(restart.events.at(-1).type,"kickoff");assert(restart.events.at(-1).presentationOnly);
 for(const reason of ["GOAL","SAVE","FREE KICK","RED CARD"]){const terminal=prepare(r,9);terminal.timeSeconds=5400;terminal.phase="secondHalf";terminal.status="paused";terminal.stoppage=reason;terminal.presentedEventId=terminal.events.length;r.bs.presentationSettled();assert.equal(terminal.status,"finished",reason+" at 90:00 finishes automatically");assert.equal(terminal.events.at(-1).type,"full-time");}
 console.log('PASS presentation: real kickoff reveal consumes no RNG; goals/saves/fouls/cards at 90:00 end without Proceed');
}
function schedulerTests(){
 const h=battleContext();h.bs.quiet();const s=prepare(h,42),root={children:[],querySelector(){return null;},prepend(e){this.children.unshift(e);},querySelectorAll(){return [];}};
 h.context.document.getElementById=id=>id==='bs-live-feed'?root:null;
 let now=0;h.context.Date=class extends Date{static now(){return now;}};
 h.bs.setFeed([s.events[0]]);h.bs.scheduleFeedEvent();assert.equal(h.timers.size,1);
 now=400;h.bs.toggleManualPause();assert.equal(h.timers.size,0);assert(s.manualPaused);
 h.bs.handleInput({target:{id:'bs-feed-delay',value:'.25'}});assert.equal(h.timers.size,0,'speed cannot resume paused presentation');
 h.bs.toggleManualPause();const [id,timer]=[...h.timers][0];assert.equal(timer.delay,150,'remaining fraction is preserved');h.timers.delete(id);timer.fn();assert.equal(s.presentedEventId,1);assert.equal(root.children.length,1);
 const outgoing=s.teams[1].assignment['1'];s.status='paused';s.teams[1].roster.find(p=>p.id===outgoing).sentOff=true;s.requiredSub={teamNumber:1,slot:'1',playerId:outgoing};
 h.bs.fastForwardMatch();assert.notEqual(s.teams[1].assignment['1'],outgoing,'fast-forward resolves mandatory replacements');assert.equal(h.timers.size,0);assert.equal(s.status,'finished');assert(h.bs.hydrateMatch(plain(h.bs.snapshotMatch(s))),'fast-forward result survives reload');
 console.log('PASS presentation: pause suspends timers, speed preserves remaining fraction, resume reveals once, fast-forward cancels all work');
}
if(require.main===module)runPresentationTests();module.exports={runPresentationTests,prepare,advance};
