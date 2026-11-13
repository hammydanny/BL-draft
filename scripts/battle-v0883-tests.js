#!/usr/bin/env node
'use strict';
// v0.8.8.3 Battle Sim football-intelligence regressions: substitution eligibility,
// Law 16 goal-kick shapes, off-ball spacing, lane-based interceptions and decisions.
const assert=require('node:assert/strict');
const {battleContext,positionalAssignment}=require('./battle-sim-tests.js');
const {advance}=require('./battle-presentation-tests.js');
const plain=v=>JSON.parse(JSON.stringify(v));
function setup(){
 const h=battleContext();h.bs.quiet();const b=h.bs;
 const teams=h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+14)],assignment:{0:9100+n}},n))`);
 b.setTeams(teams);return {h,b,teams};
}
function stoppage(b,s){b.setMatch(s);s.status='paused';s.runnerActive=false;s.presentedEventId=s.events.length;}

function substitutionTests(){
 const {b}=setup();
 for(const n of [1,2]){
  const s=b.createMatch();stoppage(b,s);const t=s.teams[n];
  const a=b.active(t).find(p=>p.role!=='GK'),slot=Object.keys(t.assignment).find(k=>t.assignment[k]===a.id);
  const unused=b.bench(t);assert(unused.length>=2,'fixture has reserves');assert(unused.every(p=>p.matchStatus==='reserve'),'reserves have never entered');
  const first=unused[0],second=unused[1];
  assert(b.active(t).every(p=>p.matchStatus==='starter'));
  assert(b.substitute(t,slot,first.id),'a reserve can legally enter (team '+n+')');
  assert.equal(a.matchStatus,'subbed-off');assert.equal(first.matchStatus,'subbed-on');
  assert(!b.bench(t).some(p=>p.id===a.id),'substituted-off player leaves the bench list');
  s.presentedEventId=s.events.length;
  const otherSlot=Object.keys(t.assignment).find(k=>k!==slot&&b.active(t).find(p=>p.id===t.assignment[k]).role!=='GK');
  assert(!b.substitute(t,otherSlot,a.id),'substituted-off player cannot return in another slot');
  assert(!b.substitute(t,slot,a.id),'substituted-off player cannot return in his own slot');
  assert(b.substitute(t,slot,second.id),'a second substitution is legal');s.presentedEventId=s.events.length;
  assert.equal(first.matchStatus,'subbed-off','a substitute who is taken off is also ineligible');
  assert(!b.substitute(t,otherSlot,first.id),'removed substitute cannot return');
  // Invalid requests never duplicate players or corrupt assignments.
  const before=plain(t.assignment);
  assert(!b.substitute(t,otherSlot,t.assignment[slot]),'an active player cannot be "substituted on" again');
  assert(!b.substitute(t,'42',b.bench(t)[0].id),'unknown slot rejected');
  assert(!b.substitute(t,otherSlot,'no-such-player'),'unknown player rejected');
  assert(!b.substitute(s.teams[n===1?2:1],otherSlot,b.bench(t)[0].id),'another team cannot use this bench');
  s.requiredSub={teamNumber:n,slot:otherSlot,playerId:t.assignment[otherSlot]};
  const thirdSlot=Object.keys(t.assignment).find(k=>k!==slot&&k!==otherSlot&&b.active(t).find(p=>p.id===t.assignment[k]).role!=='GK');
  assert(!b.substitute(t,thirdSlot,b.bench(t)[0].id),'a pending mandatory replacement cannot be bypassed');
  s.requiredSub=null;
  assert.deepEqual(plain(t.assignment),before);assert.equal(new Set(Object.values(t.assignment)).size,Object.keys(t.assignment).length);
  assert.equal(t.substitutions.length,2);
  // Save/load preserves eligibility.
  const restored=b.hydrateMatch(plain(b.snapshotMatch(s)));assert(restored);
  const rt=restored.teams[n];for(const id of [a.id,first.id])assert(!b.bench(rt).some(p=>p.id===id),'eligibility survives save/load');
  assert.equal(rt.substitutions.length,2);
  // Older saves without participation data are rebuilt from substitution events.
  const legacy=plain(b.snapshotMatch(s));for(const k of [1,2]){delete legacy.teams[k].substitutions;legacy.teams[k].roster.forEach(p=>delete p.matchStatus);}
  const migrated=b.hydrateMatch(legacy);assert(migrated,'legacy save remains loadable');
  for(const id of [a.id,first.id])assert(!b.bench(migrated.teams[n]).some(p=>p.id===id),'legacy save: substituted players stay ineligible');
  assert(b.bench(migrated.teams[n]).every(p=>p.matchStatus==='reserve'));
  // A tampered save that puts a substituted-off player back on is rejected.
  const tampered=plain(b.snapshotMatch(s));const tt=tampered.teams[n];tt.assignment[otherSlot]=a.id;
  assert.equal(b.hydrateMatch(tampered),null,'tampered participation is rejected');
 }
 // Fast-forward and required substitutions never use ineligible players.
 for(let seed=1;seed<=10;seed++){
  const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);stoppage(b,s);
  const t=s.teams[1],outs=[];
  for(const p of b.active(t).filter(p=>p.role!=='GK').slice(0,3)){const slot=Object.keys(t.assignment).find(k=>t.assignment[k]===p.id),r=b.bench(t)[0];if(!r)break;assert(b.substitute(t,slot,r.id));outs.push(p.id);s.presentedEventId=s.events.length;}
  const victim=b.active(t).find(p=>p.role!=='GK'&&!outs.includes(p.id));victim.sentOff=true;victim.matchStatus='sent-off';
  s.requiredSub={teamNumber:1,slot:Object.keys(t.assignment).find(k=>t.assignment[k]===victim.id),playerId:victim.id};
  b.fastForwardMatch();assert.equal(s.status,'finished');
  for(const n of [1,2]){const team=s.teams[n],gone=team.roster.filter(p=>['subbed-off','sent-off'].includes(p.matchStatus)).map(p=>p.id);
   assert(Object.values(team.assignment).every(id=>!gone.includes(id)||team.roster.find(p=>p.id===id).sentOff),'fast-forward never reuses a removed player');
   const ons=team.substitutions.map(x=>x.on),offs=team.substitutions.map(x=>x.off);
   team.substitutions.forEach((x,i)=>assert(!offs.slice(0,i).includes(x.on),'no player re-enters after leaving'));
   assert.equal(new Set(ons).size,ons.length);}
  assert(b.hydrateMatch(plain(b.snapshotMatch(s))),'fast-forwarded result reloads');
 }
 console.log('PASS v0.8.8.3 substitutions: permanent ineligibility, legal entries, second substitutions, invalid/forged requests, mandatory slots, save/load, legacy migration, fast-forward, both teams');
}

function goalKickTests(){
 const {b}=setup();
 for(const n of [1,2])for(const routine of ['short','direct'])for(const pressing of [20,50,85])for(const taker of ['gk','outfield']){
  const s=b.createMatch();s.seed=1000+n*97+pressing+(routine==='short'?1:2)+(taker==='gk'?0:5);b.setMatch(s);const team=s.teams[n],opp=s.teams[n===1?2:1];opp.strategy.pressing=pressing;
  const spot=n===1?{x:4,y:50}:{x:96,y:50};
  s.pending={type:'goal-kick',teamNumber:n,point:spot,zone:b.zoneAt(spot),routine,goalKickTaker:taker,takerId:taker==='outfield'?b.active(team).find(p=>p.role==='CB').id:null};
  b.addEvent(s,{type:'goal-kick',teamNumber:n,description:'Goal kick',actors:[]});b.stagePendingSetPiece(s);
  const label=`team ${n} ${routine} pressing ${pressing} ${taker}`,k=b.setPieceTaker(s,s.pending);
  assert.deepEqual([k.x,k.y],[spot.x,spot.y],'taker at the ball: '+label);assert(b.inGoalArea(n,k),'restart inside the goal area: '+label);
  assert.equal(s.carrierId,k.id);assert.deepEqual(plain(s.ball),spot);
  const rivals=b.active(opp).filter(p=>p.role!=='GK');
  assert(rivals.every(p=>!b.inOpponentBox(opp.number,p)&&b.aheadM(n,p)>=16.5),'opponents outside the penalty area: '+label);
  const mates=b.active(team).filter(p=>p.id!==k.id&&p.role!=='GK');
  assert(mates.every(p=>!b.inGoalArea(n,p)),'six-yard area kept clear: '+label);
  for(let i=0;i<mates.length;i++)for(let j=i+1;j<mates.length;j++)assert(b.distance(mates[i],mates[j])>=4.5,'teammates spread out: '+label);
  const close=b.active(team).filter(p=>p.id!==k.id&&b.distance(p,spot)<=26).length,far=mates.filter(p=>b.aheadM(n,p)>=45).length;
  if(routine==='short')assert(close>=3,'short build-up has nearby options: '+label);else assert(far>=4,'long kick has players farther forward: '+label);
  const deepest=Object.fromEntries(['CB','ST'].map(g=>[g,Math.min(...mates.filter(p=>b.roleGroup(p.role)===g).map(p=>b.aheadM(n,p)))]));
  assert(deepest.CB<deepest.ST,'structure: centre-backs deeper than strikers: '+label);
  const high=rivals.filter(p=>b.aheadM(n,p)<26).length,engaged=rivals.filter(p=>b.aheadM(n,p)<26||mates.some(m=>b.distance(m,p)<5)).length;
  if(pressing>=62)assert(engaged>=3,'high press challenges the build-up: '+label);if(pressing<35)assert.equal(high,0,'low block retreats: '+label);
  // The stoppage reveal shows exactly the positions the restart uses.
  const shown=s.events.at(-1).presentation.teams;
  for(const m of [1,2])for(const row of shown[m].players){const p=s.teams[m].roster.find(x=>x.id===row[0]);assert.deepEqual([row[8],row[9]],[p.x,p.y]);}
  const before=plain([1,2].map(m=>s.teams[m].roster.map(p=>[p.x,p.y])));s.random=()=>0;b.resolveRestart(s,{...s.pending});
  const pass=s.events.at(-1);assert(pass.passRoute,'goal kick is a pass: '+label);assert.deepEqual(plain(pass.passRoute.from),spot);
  assert.equal(pass.passRoute.kind,routine==='short'?'short':'long','routine controls the distribution: '+label);
  if(pass.type==='set-piece')assert.deepEqual(plain([1,2].map(m=>s.teams[m].roster.map(p=>[p.x,p.y]))),before,'kicked from the staged shape');
 }
 console.log('PASS v0.8.8.3 goal kicks: Law 16 taker/goal area/penalty area for both directions, short/long support, GK/outfield takers, pressing levels, revealed positions match the restart');
}

// Live-play shape samples across seeded matches (structure, clustering, pressing, support, movement).
function positioningTests(){
 const {b}=setup();let samples=0,pairs=0,ordered=0,orderSamples=0,pressedHard=0,support=0,supportSamples=0,overMove=0,moves=0;
 for(let seed=1;seed<=8;seed++){
  const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);let guard=0;
  while(s.status!=='finished'&&guard++<1000){
   if(s.status==='playing'&&!s.forced&&!s.kickoffPassPending&&s.tick%3===0){
    const before=new Map([1,2].flatMap(n=>b.active(s.teams[n]).map(p=>[n+':'+p.id,{x:p.x,y:p.y,limit:b.movementMeters(p)*1.8+.01}])));
    const copy=b.hydrateMatch(plain(b.snapshotMatch(s)));b.setMatch(copy);b.moveOffBall(copy);
    for(const n of [1,2])for(const p of b.active(copy.teams[n])){const q=before.get(n+':'+p.id);moves++;if(b.distance(p,q)>q.limit)overMove++;}
    b.setMatch(s);
   }
   advance({bs:b},s);
   if(s.status!=='playing')continue;samples++;
   const holder=s.teams[s.possession],carrier=holder&&b.active(holder).find(p=>p.id===s.carrierId);
   for(const n of [1,2]){
    const out=b.active(s.teams[n]).filter(p=>p.role!=='GK');for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++)if(b.distance(out[i],out[j])<3)pairs++;
    const depth=g=>{const list=out.filter(p=>b.roleGroup(p.role)===g);return list.length?list.reduce((a,p)=>a+b.aheadM(n,p),0)/list.length:null;};
    const cb=depth('CB'),st=depth('ST');if(cb!=null&&st!=null){orderSamples++;if(cb<st)ordered++;}
   }
   if(carrier&&carrier.role!=='GK'){
    if(b.active(s.teams[s.possession===1?2:1]).filter(p=>p.role!=='GK'&&b.distance(p,carrier)<6).length>=4)pressedHard++;
    supportSamples++;
    const opps=b.active(s.teams[s.possession===1?2:1]).filter(p=>p.role!=='GK');
    if(b.active(holder).some(m=>m.id!==carrier.id&&m.role!=='GK'&&b.distance(m,carrier)<=30&&!opps.some(o=>{const g=(()=>{const ax=carrier.x*1.05,ay=carrier.y*.68,bx=m.x*1.05-ax,by=m.y*.68-ay,qx=o.x*1.05-ax,qy=o.y*.68-ay,len=Math.hypot(bx,by)||1;return{along:(qx*bx+qy*by)/len,perp:Math.abs(qx*by-qy*bx)/len,len};})();return g.along>1&&g.along<g.len-1&&g.perp<2;})))support++;
   }
  }
 }
 assert(pairs/samples<1.2,'teammates do not collapse into clusters: '+(pairs/samples).toFixed(2)+' pairs within 3m per tick');
 assert(ordered/orderSamples>.97,'formation depth order is maintained: '+(ordered/orderSamples).toFixed(3));
 assert(pressedHard/supportSamples<.03,'pressing does not attract every defender: '+pressedHard);
 assert(support/supportSamples>.85,'the carrier has a supporting option with a clear lane: '+(support/supportSamples).toFixed(3));
 assert.equal(overMove,0,'off-ball movement stays gradual (no teleporting): '+overMove+'/'+moves);
 // Repeated planning with a frozen ball converges instead of oscillating.
 // v0.8.9: tactical runs are deliberate (and re-planned as the ball moves), so the convergence
 // check measures the formation planner with run intents rested.
 const s=b.createMatch();b.setMatch(s);s.kickoffPassPending=false;let last=[];[1,2].forEach(n=>s.teams[n].roster.forEach(p=>{p.runRest=1e9;}));
 for(let i=0;i<14;i++){const before=[1,2].flatMap(n=>b.active(s.teams[n]).map(p=>({p,x:p.x,y:p.y})));b.moveOffBall(s);s.tick++;last.push(before.reduce((a,o)=>a+b.distance(o.p,o),0)/before.length);}
 assert(last.slice(-3).every(v=>v<1.2),'settled players make only small adjustments: '+last.map(v=>v.toFixed(2)).join(','));
 console.log('PASS v0.8.8.3 positioning: '+(pairs/samples).toFixed(2)+' clustered pairs/tick, formation order '+(100*ordered/orderSamples).toFixed(1)+'%, supported carrier '+(100*support/supportSamples).toFixed(1)+'%, gradual and convergent movement');
}

// Deterministic scenes: every player parked away from the action unless placed.
function scene(b,place){
 const s=b.createMatch();b.setMatch(s);s.kickoffPassPending=false;s.status='playing';
 b.active(s.teams[1]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:14,y:i%2?8:92}));
 // Unused opponents wait wide on their own goal line, so they hold a legal (onside) last line.
 b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:96-i*.3,y:i%2?6:94}));
 const get=(n,role,skip=[])=>b.active(s.teams[n]).find(p=>p.role===role&&!skip.includes(p.id));
 const ctx=place(s,get);s.possession=1;s.carrierId=ctx.carrier.id;b.setBall(s,ctx.carrier);return {s,...ctx};
}
function choices(b,s,carrier,runs=240){
 const out={shot:0,dribble:0,pass:0,back:0,forwardDribble:0,to:{}};
 for(let i=1;i<=runs;i++){s.random=b.seeded(i*7919);const a=b.chooseAction(s,carrier);out[a.type]++;
  if(a.type==='pass'){const id=a.option.receiver.id;out.to[id]=(out.to[id]||0)+1;if(b.aheadM(1,a.option.to)<b.aheadM(1,carrier)-3)out.back++;}
  if(a.type==='dribble'&&b.aheadM(1,a.end)>b.aheadM(1,carrier))out.forwardDribble++;}
 return out;
}
function passingTests(){
 const {h,b}=setup();
 const lane=place=>scene(b,(s,get)=>{const c=get(1,'CM'),r=get(1,'ST'),d=get(2,'CB');b.setPosition(c,{x:40,y:50});b.setPosition(r,{x:55,y:50});place(s,d,get);return {carrier:c,receiver:r,defender:d};});
 // A clear lane with a defender off the trajectory is not an interception threat.
 let t=lane((s,d)=>b.setPosition(d,{x:47,y:64}));let m=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short');
 assert.equal(m.lanes.length,0,'off-lane defender cannot intercept');assert(m.success>.9,'clear lanes are reliable: '+m.success);
 // Old model regression: a defender near the passer but behind him is pressure, not a lane threat.
 t=lane((s,d)=>b.setPosition(d,{x:33,y:50}));m=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short');
 assert.equal(m.lanes.length,0);assert(m.success>.9,'defender behind the passer does not cut the lane');
 // A receiver can accept a pass with an opponent nearby but not on top of him.
 t=lane((s,d)=>b.setPosition(d,{x:58,y:57}));m=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short');
 assert(m.success>.8,'nearby defender is not an automatic turnover: '+m.success);
 // A defender standing in the lane can genuinely intercept, with DEF and PAS mattering.
 t=lane((s,d)=>b.setPosition(d,{x:47.5,y:51}));m=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short');
 assert.equal(m.lanes.length,1,'in-lane defender is an interception threat');assert(m.success<.8);
 const base=m.success;t.defender.stats.def=98;const strongDef=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short').success;
 t.defender.stats.def=50;const weakDef=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short').success;
 assert(strongDef<base&&base<weakDef||strongDef<weakDef,'DEF affects interceptions');
 t.carrier.stats.pas=98;const goodPas=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short').success;t.carrier.stats.pas=50;const poorPas=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'short').success;
 assert(goodPas>poorPas,'PAS affects passing');
 // Chemistry matters for execution.
 t=lane((s,d)=>b.setPosition(d,{x:90,y:90}));b.setPosition(t.receiver,{x:80,y:50});
 const relation=h.context.chemistryRelation;h.context.chemistryRelation=()=>({score:98});const hiChem=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'long').success;
 h.context.chemistryRelation=()=>({score:40});const loChem=b.passModel(t.s,t.carrier,t.receiver,t.receiver,'long').success;h.context.chemistryRelation=relation;
 assert(hiChem>loChem,'chemistry affects coordinated passing');
 // Interception events, credit and statistics agree.
 t=lane((s,d)=>b.setPosition(d,{x:47.5,y:50}));const opt=b.passOptions(t.s,t.carrier,{}).find(o=>o.receiver.id===t.receiver.id&&!o.through);
 // A roll just past the success chance lands in the first failure band: the lane.
 t.s.random=()=>opt.model.success+1e-6;b.resolvePass(t.s,t.carrier,{option:opt});const e=t.s.events.at(-1);
 assert.equal(e.type,'interception');assert.equal(e.actors.at(-1).id,t.defender.id);assert.equal(t.s.possession,2);
 assert.equal(t.s.teams[2].stats.interceptions,1);assert.equal(t.defender.match.interceptions,1);assert.equal(t.s.teams[1].stats.turnovers,1);
 assert.equal(e.nearbyDefenders.filter(d=>d.selected).length,1);
 // Full matches: statistics are internally consistent and possession chains are sustained.
 let attempted=0,completed=0,ints=0,spells=0,actions=0,multi=0;
 for(let seed=1;seed<=8;seed++){const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);let g=0,team=s.possession,len=0,passes=0;
  while(s.status!=='finished'&&g++<1000){const kind=s.status==='playing';advance({bs:b},s);if(!kind)continue;
   if(s.possession===team){len++;if(s.events.at(-1).type==='pass')passes++;}else{spells++;actions+=len;if(passes>=3)multi++;team=s.possession;len=1;passes=0;}}
  for(const n of [1,2]){const T=s.teams[n];
   assert.equal(T.stats.interceptions,s.events.filter(e=>e.type==='interception'&&e.teamNumber===n).length,'interception stats match events');
   assert.equal(T.stats.passes,T.roster.reduce((a,p)=>a+p.match.passes,0));assert.equal(T.stats.attempted,T.roster.reduce((a,p)=>a+p.match.passesAttempted,0));
   assert.equal(T.stats.interceptions,T.roster.reduce((a,p)=>a+p.match.interceptions,0));assert.equal(T.stats.tackles,T.roster.reduce((a,p)=>a+p.match.tackles,0));
   attempted+=T.stats.attempted;completed+=T.stats.passes;ints+=T.stats.interceptions;}}
 const pct=completed/attempted;
 assert(pct>.65&&pct<.95,'pass completion is realistic, not guaranteed: '+pct.toFixed(3));
 assert(ints/8>=2&&ints/8<=40,'interceptions happen for real reasons, not every turn: '+ints/8);
 assert(actions/spells>=3,'possession chains are sustained: '+(actions/spells).toFixed(2));assert(multi/spells>.25,'many possessions contain 3+ passes');
 console.log('PASS v0.8.8.3 passing: lane geometry, receiver contests, PAS/DEF/chemistry, credited interceptions, '+(100*pct).toFixed(1)+'% completion, '+(ints/8).toFixed(1)+' interceptions/match, '+(actions/spells).toFixed(1)+' actions per possession');
}

function decisionTests(){
 const {b}=setup();const report=[];
 // 1. Unmarked attacker advancing: continue the attack, do not recycle to an isolated midfielder.
 let t=scene(b,(s,get)=>{const c=get(1,'ST'),m=get(1,'CM');b.setPosition(c,{x:60,y:50});b.setPosition(m,{x:44,y:30});b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:30+i,y:10+i*8}));return {carrier:c};});
 let r=choices(b,t.s,t.carrier);assert(r.back/240<=.08,'unmarked attacker rarely passes backwards: '+r.back);assert((r.forwardDribble+r.shot)/240>=.75,'unmarked attacker carries on');report.push('advance '+Math.round(100*(r.forwardDribble+r.shot)/240)+'%');
 // 2. Striker close to goal with a clear sight of it shoots.
 t=scene(b,(s,get)=>{const c=get(1,'ST');b.setPosition(c,{x:88,y:50});b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:40+i,y:10+i*8}));return {carrier:c};});
 r=choices(b,t.s,t.carrier);assert(r.shot/240>=.8,'clear chance is taken: '+r.shot);report.push('shoot '+Math.round(100*r.shot/240)+'%');
 // 3. Carrier surrounded by defenders releases the ball.
 t=scene(b,(s,get)=>{const c=get(1,'CM'),m=get(1,'CM',[c.id]);b.setPosition(c,{x:55,y:50});b.setPosition(m,{x:46,y:25});
  b.active(s.teams[2]).filter(p=>p.role!=='GK').slice(0,4).forEach((p,i)=>b.setPosition(p,{x:55+[2,-2,0,1.6][i],y:50+[0,0,3.5,-3.5][i]}));return {carrier:c};});
 r=choices(b,t.s,t.carrier);assert(r.pass/240>=.6,'surrounded carrier passes: '+JSON.stringify(r));report.push('release '+Math.round(100*r.pass/240)+'%');
 // 4. Winger with space ahead attacks it.
 t=scene(b,(s,get)=>{const c=get(1,'RW');b.setPosition(c,{x:62,y:88});b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:84+(i%3)*3,y:35+i*3}));return {carrier:c};});
 r=choices(b,t.s,t.carrier);assert(r.forwardDribble/240>=.6,'winger runs into space: '+JSON.stringify(r));report.push('winger '+Math.round(100*r.forwardDribble/240)+'%');
 // 5. Midfielder prefers the safe progressive option over a marked target.
 t=scene(b,(s,get)=>{const c=get(1,'CM'),safe=get(1,'CM',[c.id]),risky=get(1,'ST');b.setPosition(c,{x:50,y:50});b.setPosition(safe,{x:60,y:36});b.setPosition(risky,{x:74,y:52});
  const defs=b.active(s.teams[2]).filter(p=>p.role!=='GK');b.setPosition(defs[0],{x:74.5,y:54});b.setPosition(defs[1],{x:62,y:51.5});b.setPosition(defs[2],{x:73,y:49});b.setPosition(defs[3],{x:53,y:53});return {carrier:c,safe,risky};});
 r=choices(b,t.s,t.carrier);assert((r.to[t.safe.id]||0)>3*(r.to[t.risky.id]||0)&&(r.to[t.safe.id]||0)>=100,'safe option preferred: '+JSON.stringify(r.to));report.push('safe '+Math.round(100*(r.to[t.safe.id]||0)/240)+'%');
 // 6. Forward route blocked, safe backward option available.
 t=scene(b,(s,get)=>{const c=get(1,'AM')||get(1,'CM'),back=get(1,'CM',[c.id]);b.setPosition(c,{x:62,y:50});b.setPosition(back,{x:50,y:62});
  const defs=b.active(s.teams[2]).filter(p=>p.role!=='GK');b.setPosition(defs[0],{x:63.6,y:50});defs.slice(1,7).forEach((p,i)=>b.setPosition(p,{x:66+(i%2)*2,y:36+i*5.5}));return {carrier:c,back};});
 r=choices(b,t.s,t.carrier);assert(r.back/240>=.5,'recycles when blocked: '+JSON.stringify(r));assert(r.shot/240<=.35,'speculative long shot is the exception');report.push('recycle '+Math.round(100*r.back/240)+'%');
 // 7. A high-skill dribbler takes on a weak defender far more than a weak dribbler takes on a strong one.
 const duel=(dri,def)=>{const x=scene(b,(s,get)=>{const c=get(1,'LW'),d=get(2,'RB')||get(2,'CB');c.stats.dri=dri;c.stats.spd=dri;d.stats.def=def;b.setPosition(c,{x:70,y:30});b.setPosition(d,{x:73,y:30});return {carrier:c};});
  const m=b.dribbleModel(x.s,x.carrier,{x:76,y:30});return {chance:m.chance,r:choices(b,x.s,x.carrier)};};
 const star=duel(97,52),weak=duel(52,95);assert(star.chance>.6&&star.chance>weak.chance+.2,'DRI vs DEF decides the duel');assert(star.r.forwardDribble>weak.r.forwardDribble+40,'skilled dribbler takes the defender on more (v0.8.9.4: a weak dribbler may shield instead)');report.push('take-on '+star.r.forwardDribble+' vs '+weak.r.forwardDribble);
 // 8. A teammate in a clearly better scoring position receives the ball.
 t=scene(b,(s,get)=>{const c=get(1,'LW'),st=get(1,'ST');b.setPosition(c,{x:82,y:16});b.setPosition(st,{x:89,y:48});b.setPosition(b.active(s.teams[2]).filter(p=>p.role!=='GK')[0],{x:83.5,y:17.5});return {carrier:c,st};});
 r=choices(b,t.s,t.carrier);assert((r.to[t.st.id]||0)/240>=.55,'square ball to the better-placed striker: '+JSON.stringify(r));assert(r.shot/240<.3);report.push('square '+Math.round(100*(r.to[t.st.id]||0)/240)+'%');
 console.log('PASS v0.8.8.3 decisions: '+report.join(', '));
}

function sampleTests(){
 const {h,b}=setup();const forms=h.run('Object.keys(FORMATIONS)'),pool=h.run('players.filter(p=>!p.secretCharacter).map(p=>p.id)');
 let goals=0,shots=0,scoreless=0,attempted=0,completed=0,ints=0,longShots=0;const results=[];
 for(let seed=1;seed<=16;seed++){
  const cfg=[1,2].map(n=>{const ids=pool.slice((seed*5+n*17)%60,(seed*5+n*17)%60+14);return h.run(`bs.normalizeTeam({name:'S${n}',formation:${JSON.stringify(forms[(seed+n)%forms.length])},roster:[blueLockManFor(${n}),...${JSON.stringify(ids)}.map(playerById)],assignment:${JSON.stringify(positionalAssignment(h,forms[(seed+n)%forms.length],ids,n))},strategy:${JSON.stringify({tempo:20+(seed*13+n*7)%60,directness:20+(seed*11+n*5)%60,pressing:15+(seed*17+n*3)%75,line:25+(seed*7+n)%50,width:25+(seed*19+n*9)%60})}},${n})`);});
  b.setTeams(cfg);const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);let g=0;while(s.status!=='finished'&&g++<1200)advance({bs:b},s);
  assert.equal(s.status,'finished');const total=s.score[1]+s.score[2];goals+=total;if(!total)scoreless++;results.push(s.score[1]+'-'+s.score[2]);
  for(const n of [1,2]){shots+=s.teams[n].stats.shots;attempted+=s.teams[n].stats.attempted;completed+=s.teams[n].stats.passes;ints+=s.teams[n].stats.interceptions;}
  longShots+=s.events.filter(e=>e.type==='shot-attempt'&&+(e.description.match(/(\d+)m/)||[0,0])[1]>=30).length;
 }
 assert(goals/16>=2&&goals/16<=7,'varied scoring without 0-0 droughts or blowouts: '+results.join(' '));assert(scoreless<=4);
 assert(shots/16>=10,'attacks still produce shots');assert(longShots/shots<.3,'long-range shots are a minority');
 console.log('PASS v0.8.8.3 sample: 16 varied formations/strategies, '+(goals/16).toFixed(2)+' goals and '+(shots/16).toFixed(1)+' shots per match, '+(100*completed/attempted).toFixed(1)+'% passes, '+(ints/16).toFixed(1)+' interceptions, '+scoreless+' scoreless ('+results.join(' ')+')');
}
function runBattleV0883Tests(){substitutionTests();goalKickTests();positioningTests();passingTests();decisionTests();sampleTests();}
if(require.main===module)runBattleV0883Tests();
module.exports={runBattleV0883Tests};
