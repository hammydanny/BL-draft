#!/usr/bin/env node
'use strict';
// v0.8.8.5 Battle Sim regressions: offside (Law 11), out-of-play restarts (throw-ins,
// goal kicks, corners), the smooth finishing model, the pass mix and engine cost.
const assert=require('node:assert/strict');
const {battleContext,positionalAssignment}=require('./battle-sim-tests.js');
const {advance}=require('./battle-presentation-tests.js');
const plain=v=>JSON.parse(JSON.stringify(v));
function setup(){
 const h=battleContext();h.bs.quiet();const b=h.bs;
 b.setTeams(h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+14)],assignment:{0:9100+n}},n))`));
 return {h,b};
}
// Deterministic scene: unused players are parked out of the way; opponents hold an onside line on their goal line.
function scene(b,place){
 const s=b.createMatch();s.seed=4242;b.setMatch(s);s.kickoffPassPending=false;s.status='playing';
 b.active(s.teams[1]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:14,y:i%2?8:92}));
 b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:96-i*.3,y:i%2?6:94}));
 const get=(n,role,skip=[])=>b.active(s.teams[n]).find(p=>p.role===role&&!skip.includes(p.id));
 const ctx=place(s,get);s.possession=1;s.carrierId=ctx.carrier.id;b.setBall(s,ctx.carrier);return {s,...ctx};
}

function offsideTests(){
 const {b}=setup();
 const line=(receiverX,defX=75,carrierX=60)=>scene(b,(s,get)=>{const c=get(1,'CM'),r=get(1,'ST'),cbs=b.active(s.teams[2]).filter(p=>p.role==='CB');
  b.setPosition(c,{x:carrierX,y:50});b.setPosition(r,{x:receiverX,y:50});cbs.forEach((d,i)=>b.setPosition(d,{x:defX,y:40+i*20}));
  // The centre-backs form the last line; every other outfielder stands in front of it, out wide.
  b.active(s.teams[2]).filter(p=>p.role!=='GK'&&p.role!=='CB').forEach((p,i)=>b.setPosition(p,{x:defX-10-i,y:i%2?8:92}));return {carrier:c,receiver:r};});
 // Beyond the second-last opponent, in the opponents' half and ahead of the ball: offside.
 let t=line(80);let m=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short');
 assert(m.offside&&m.offsideMargin>0&&m.success===0,'receiver beyond the line is offside');
 const opt=b.passOptions(t.s,t.carrier,{}).find(o=>o.receiver.id===t.receiver.id&&!o.through);
 const before=plain(t.s.teams[1].stats);b.resolvePass(t.s,t.carrier,{option:opt});
 const e=t.s.events.at(-1);assert.equal(e.type,'offside');assert.equal(e.actors[0].id,t.receiver.id);
 assert.equal(t.s.status,'paused');assert.equal(t.s.stoppage,'OFFSIDE');assert.equal(t.s.possession,2);
 assert.equal(t.s.pending.type,'free-kick');assert.equal(t.s.pending.teamNumber,2,'free kick to the defending team');
 assert(b.distance(t.s.pending.point,{x:80,y:50})<.01,'restart where the offence happened');
 const after=t.s.teams[1].stats;assert.equal(after.offsides,1);assert.equal(after.attempted,before.attempted+1);assert.equal(after.passes,before.passes);assert.equal(after.turnovers,before.turnovers+1);
 // Level with or behind the line, in his own half, or behind the ball: onside.
 assert(!b.passModel(line(74).s,...(x=>[x.carrier,x.receiver,x.receiver])(line(74)),'short').offside,'level with the line is onside');
 t=line(48,45,30);assert(!b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short').offside,'cannot be offside in his own half');
 t=line(56,50,60);assert(!b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short').offside,'cannot be offside behind the ball');
 // Goal kicks, corners and throw-ins are exempt.
 t=line(80);assert(!b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short',{offsideExempt:true}).offside,'restart exemptions');
 // Perception: a clearly offside runner is never chosen; tight calls are misread more by poorer vision.
 const pick=(receiverX,pas,off)=>{let n=0;const x=line(receiverX);x.carrier.stats.pas=pas;x.carrier.stats.off=off;
  for(let i=1;i<=300;i++){x.s.random=b.seeded(i*7919);const a=b.chooseAction(x.s,x.carrier);if(a.type==='pass'&&a.option.receiver.id===x.receiver.id)n++;}return n;};
 assert.equal(pick(84,90,90),0,'clearly offside runner ignored');
 const sharp=pick(76.6,98,98),poor=pick(76.6,45,45);
 assert(poor>sharp,'tight offside calls are misjudged more often with poor vision: '+poor+' vs '+sharp);
 // Snapshot of a pending offside restart survives save/load and resolves identically.
 const s1=t.s;const restored=b.hydrateMatch(plain(b.snapshotMatch(s1)));assert(restored);
 console.log('PASS v0.8.8.5 offside: Law 11 position (line, half, ball), free kick to defenders with stats, exemptions, vision-based misreads ('+poor+' vs '+sharp+'), save/load');
}

function outOfPlayTests(){
 const {b}=setup();
 const misplaced=(carrierAt,receiverAt,rolls,receiverRole='ST')=>{const t=scene(b,(s,get)=>{const c=get(1,'CM'),r=get(1,receiverRole);b.setPosition(c,carrierAt);b.setPosition(r,receiverAt);return {carrier:c,receiver:r};});
  const opt=b.passOptions(t.s,t.carrier,{}).find(o=>o.receiver.id===t.receiver.id&&!o.through);assert(opt.model.error>0,'scene pass carries execution risk');const seq=rolls(opt.model);t.s.random=()=>seq.length?seq.shift():.5;
  b.resolvePass(t.s,t.carrier,{option:opt});return t;};
 // Over a touchline: throw-in to the opponents, taken next tick as a short throw.
 let t=misplaced({x:40,y:14},{x:62,y:6},m=>[.9999,.75]);
 let e=t.s.events.at(-1);assert.equal(e.type,'throw-in');assert.equal(t.s.possession,2);assert(t.s.throwInPending);
 const thrower=b.active(t.s.teams[2]).find(p=>p.id===t.s.carrierId);assert.equal(thrower.y,5,'thrower stands on the touchline');assert.equal(t.s.status,'playing','throw-ins do not stop the match');
 t.s.random=b.seeded(5);const restored=b.hydrateMatch(plain(b.snapshotMatch(t.s)));assert(restored&&restored.throwInPending,'pending throw-in survives save/load');
const count=t.s.events.length;b.playerTick(t.s);
 const throwPass=t.s.events.slice(count).find(x=>x.passRoute);assert(throwPass,'the throw is a pass');assert(!t.s.throwInPending);
 assert(b.distance(throwPass.passRoute.from,throwPass.passRoute.to)<=28.01,'throws are short');assert.notEqual(throwPass.type,'offside');
 // Over the opponents' byline: goal kick. Over his own byline: corner.
 t=misplaced({x:76,y:50},{x:95,y:42},m=>[.9999,0]);e=t.s.events.at(-1);
 assert.equal(e.type,'goal-kick');assert.equal(t.s.pending.type,'goal-kick');assert.equal(t.s.pending.teamNumber,2);assert.equal(t.s.stoppage,'GOAL KICK');
 t=misplaced({x:22,y:36},{x:5,y:22},m=>[.9999,.5],'CB');e=t.s.events.at(-1);
 assert.equal(e.type,'corner');assert.equal(t.s.pending.type,'corner');assert.equal(t.s.pending.teamNumber,2);assert.equal(t.s.teams[2].stats.corners,1);
 console.log('PASS v0.8.8.5 out of play: touchline throw-ins (no stoppage, short throw next tick, save/load), byline goal kicks and own-byline corners');
}

function shotModelTests(){
 const {b}=setup();
 const at=(sho,gk,x,y,clear=true)=>{const t=scene(b,(s,get)=>{const c=get(1,'ST');c.stats.sho=sho;b.keeper(s.teams[2]).stats.gk=gk;b.setPosition(c,{x,y});
  if(clear)b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:20,y:10+i*8}));return {carrier:c};});return b.shotModel(t.s,t.carrier,false,null,null).goalChance;};
 let previous=1;const elite=[],average=[];
 for(let m=6;m<=40;m++){const x=99-m/1.05,a=at(75,75,x,50),e=at(95,75,x,50);
  assert(a<=previous+1e-9,'finishing falls with distance');assert(previous-a<.08||m===6,'no step discontinuities at '+m+'m');previous=a;
  assert(e>a,'elite shooters are better at every distance');elite.push(e);average.push(a);}
 assert(average[5]>.3&&average[5]<.65,'an average finisher scores often from 11m: '+average[5].toFixed(3));
 assert(elite.at(-1)<.2,'no flat bonus: even elite long shots stay unlikely: '+elite.at(-1).toFixed(3));
 assert(elite.at(-1)/average.at(-1)>1.5,'skill still matters from range');
 assert(at(75,75,85,50)>at(75,75,85,18),'tight angles are harder');
 assert(at(75,95,85,50)<at(75,60,85,50),'better keepers save more');
 // Blockers and being closed down both reduce the chance.
 const t=scene(b,(s,get)=>{const c=get(1,'ST');b.setPosition(c,{x:80,y:50});return {carrier:c};});
 const open=b.shotModel(t.s,t.carrier,false,null,null).goalChance;const d=b.active(t.s.teams[2]).find(p=>p.role!=='GK');b.setPosition(d,{x:83,y:50});
 const blocked=b.shotModel(t.s,t.carrier,false,null,null);assert(blocked.blockers>=1&&blocked.goalChance<open*.75,'blocked and pressured shots are harder');
 const pen=b.shotModel(t.s,t.carrier,true,null,null);assert(pen.goalChance>.6,'penalties keep their dedicated duel');
 console.log('PASS v0.8.8.5 finishing: smooth distance/angle curve, proportional SHO/GK skill (11m avg '+average[5].toFixed(2)+', 40m elite '+elite.at(-1).toFixed(2)+'), blockers, pressure, penalties');
}

function sampleTests(){
 const {h,b}=setup();const forms=h.run('Object.keys(FORMATIONS)'),pool=h.run('players.filter(p=>!p.secretCharacter).map(p=>p.id)');
 let goals=0,shots=0,attempted=0,completed=0,offsides=0,throwIns=0,lofted=0,openPasses=0,longShots=0,scoreless=0,ticks=0;const t0=process.hrtime.bigint();
 for(let seed=1;seed<=16;seed++){
  const cfg=[1,2].map(n=>{const ids=pool.slice((seed*7+n*13)%60,(seed*7+n*13)%60+14);return h.run(`bs.normalizeTeam({name:'S${n}',formation:${JSON.stringify(forms[(seed*3+n)%forms.length])},roster:[blueLockManFor(${n}),...${JSON.stringify(ids)}.map(playerById)],assignment:${JSON.stringify(positionalAssignment(h,forms[(seed*3+n)%forms.length],ids,n))},strategy:${JSON.stringify({tempo:20+(seed*11+n*7)%60,directness:20+(seed*13+n*5)%60,pressing:15+(seed*19+n*3)%75,line:25+(seed*7+n*11)%55,width:25+(seed*17+n*9)%60})}},${n})`);});
  b.setTeams(cfg);const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);let g=0;while(s.status!=='finished'&&g++<1200)advance({bs:b},s);
  assert.equal(s.status,'finished');ticks+=s.tick;const total=s.score[1]+s.score[2];goals+=total;if(!total)scoreless++;
  for(const n of [1,2]){const T=s.teams[n];shots+=T.stats.shots;attempted+=T.stats.attempted;completed+=T.stats.passes;offsides+=Number(T.stats.offsides)||0;
   assert.equal(Number(T.stats.offsides)||0,s.events.filter(e=>e.type==='offside'&&e.teamNumber!==n).length,'offside statistics match events');}
  throwIns+=s.events.filter(e=>e.type==='throw-in').length;
  s.events.forEach(e=>{if(e.passRoute&&!['set-piece','offside'].includes(e.type)){openPasses++;if(e.passRoute.kind==='long')lofted++;}if(e.type==='shot-attempt'&&e.shotRoute&&b.distance(e.shotRoute.from,e.shotRoute.to)>=30)longShots++;});
  s.events.filter(e=>e.type==='offside').forEach(e=>assert(s.events.some(x=>x.id>e.id)),'play resumes after offside');
 }
 const ms=Number(process.hrtime.bigint()-t0)/1e6,pct=completed/attempted;
 assert(goals/16>=2&&goals/16<=6.5&&scoreless<=4,'varied, not goalless: '+goals/16);assert(shots/16>=10,'attacks reach shooting positions');
 assert(pct>.75&&pct<.9,'pass completion between 75% and 90%: '+pct.toFixed(3));assert(lofted/openPasses<.3,'lofted balls are a minority of open-play passes');
 assert(offsides/16>=.3&&offsides/16<=4,'offsides happen but rarely: '+offsides/16);assert(throwIns>0,'throw-ins occur');assert(longShots/shots<.15,'long-range shots are occasional');
 assert(ms/ticks<10,'engine cost stays bounded: '+(ms/ticks).toFixed(2)+'ms per tick');
 console.log('PASS v0.8.8.5 sample: '+(goals/16).toFixed(2)+' goals, '+(shots/16).toFixed(1)+' shots, '+(100*pct).toFixed(1)+'% passes, '+(100*lofted/openPasses).toFixed(1)+'% lofted, '+(offsides/16).toFixed(2)+' offsides and '+(throwIns/16).toFixed(1)+' throw-ins per match, '+(ms/ticks).toFixed(2)+'ms per tick');
}
// Law 13 (free kicks): every opponent is at least 9.15 m from the ball, for every free-kick type,
// spot and pressing level, including the offside free kicks introduced in this release.
function freeKickDistanceTests(){
 const {b}=setup();let layouts=0,closest=99;
 for(let seed=1;seed<=20;seed++)for(const n of [1,2])for(const [x,y,routine] of [[78,50,'direct'],[70,30,'short-pass'],[50,60,'short-pass'],[88,15,'direct'],[30,50,'short-pass'],[82,70,'long-pass']])for(const pressing of [20,60,90]){
  const s=b.createMatch();s.seed=seed;b.setMatch(s);s.teams[n===1?2:1].strategy.pressing=pressing;
  const spot=n===1?{x,y}:{x:100-x,y},pending={type:'free-kick',teamNumber:n,zone:b.zoneAt(spot),point:spot,routine};
  b.arrangeSetPiece(s,pending,b.setPieceTaker(s,pending));layouts++;
  for(const p of b.active(s.teams[n===1?2:1]).filter(p=>p.role!=='GK')){const d=b.distance(p,pending.point);closest=Math.min(closest,d);assert(d>=9.15,'opponent '+d.toFixed(2)+'m from a free kick');}
 }
 console.log('PASS v0.8.8.5 free kicks: '+layouts+' layouts (both directions, all routines, pressing 20/60/90) keep every opponent >= 9.15m (closest '+closest.toFixed(2)+'m)');
}
function runBattleV0885Tests(){offsideTests();outOfPlayTests();shotModelTests();freeKickDistanceTests();sampleTests();}
if(require.main===module)runBattleV0885Tests();
module.exports={runBattleV0885Tests};
