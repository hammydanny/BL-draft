#!/usr/bin/env node
'use strict';
// v0.8.9 Battle Sim: physical through balls, tactical intelligence, the data-driven ability
// framework, Isagi's kit, chemical reactions, character dialogue and full-match validation.
const assert=require('node:assert/strict');
const {battleContext,positionalAssignment}=require('./battle-sim-tests.js');
const {advance}=require('./battle-presentation-tests.js');
const ISAGI=1,HIORI=27,KURONA=26,BACHIRA=4,KAISER=49;

function setup(stars=[ISAGI,HIORI,KURONA,BACHIRA,KAISER],formation='4-3-3'){
 const h=battleContext();h.bs.quiet();const b=h.bs;
 const pool=h.run('players.filter(p=>!p.secretCharacter&&![1,2,3,4,5,6,7,8,9,10,11,26,27,31,49].includes(Number(p.id))).map(p=>p.id)');
 const home=stars.concat(pool.slice(0,14-stars.length)),away=pool.slice(20,34);
 const teams=[1,2].map(n=>{const ids=n===1?home:away;let a=positionalAssignment(h,formation,ids,n);
  // The characters under test start in their own positions; the rest of the XI fills around them.
  if(n===1&&stars.length){const mine=positionalAssignment(h,formation,stars,n),rest=positionalAssignment(h,formation,ids.filter(id=>!stars.includes(id)),n),used=new Set(Object.values(mine));
   const spare=ids.filter(id=>!stars.includes(id)&&!Object.entries(rest).some(([k,v])=>v===id&&mine[k]==null));a={...mine};
   Object.keys(rest).forEach(k=>{if(a[k]==null&&!used.has(rest[k]))a[k]=rest[k];});
   h.run('FORMATIONS['+JSON.stringify(formation)+']').forEach((x,i)=>{if(a[i]==null)a[i]=spare.shift();});}
  return h.run(`bs.normalizeTeam({name:'T${n}',formation:${JSON.stringify(formation)},roster:[blueLockManFor(${n}),...${JSON.stringify(ids)}.map(playerById)],assignment:${JSON.stringify(a)},strategy:{tempo:55,directness:55,pressing:50,line:50,width:50}},${n})`);});
 b.setTeams(teams);return {h,b};
}
// A frozen scene: everyone parked out of the way, then the test places who matters.
function scene(b,place){
 const s=b.createMatch();b.setMatch(s);s.kickoffPassPending=false;s.status='playing';s.seed=7;s.random=b.seeded(7);
 b.active(s.teams[1]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:12,y:i%2?8:92}));
 b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:96-i*.3,y:i%2?6:94}));
 const get=(n,id)=>b.active(s.teams[n]).find(p=>Number(p.id)===Number(id));
 const def=i=>b.active(s.teams[2]).filter(p=>p.role!=='GK')[i];
 const ctx=place(s,get,def)||{};s.possession=1;if(ctx.carrier){s.carrierId=ctx.carrier.id;b.setBall(s,ctx.carrier);}return {s,get,def,...ctx};
}
const sprint=p=>4.3+p.stats.spd*.048;

function throughBallTests(){
 const {b}=setup();
 // 1. The receiver is never moved further than he can physically run in the time the ball takes.
 let checked=0;const outcomes=new Set();
 for(let seed=1;seed<=120;seed++){
  const r=b.seeded(seed);
  const t=scene(b,(s,get,def)=>{const c=get(1,HIORI),rec=get(1,ISAGI);b.setPosition(c,{x:45+r()*15,y:30+r()*40});b.setPosition(rec,{x:62+r()*16,y:20+r()*60});
   for(let i=0;i<4;i++)b.setPosition(def(i),{x:68+r()*22,y:15+r()*70});return {carrier:c,receiver:rec};});
  const to={x:Math.min(97,t.receiver.x+6+r()*16),y:Math.max(4,Math.min(96,t.receiver.y+(r()-.5)*30))},kind=r()<.2?'long':'short';
  const race=b.throughRace(t.s,t.carrier,t.receiver,to,kind,{pace:.8+r()*.5});outcomes.add(race.outcome);
  const rec=race.receiver;if(rec.meet){const run=b.distance(rec.start,rec.meet)-1.1,time=rec.meet.t-rec.prof.reaction;
   assert(run<=sprint(t.receiver)*Math.max(0,time)+.05,'receiver covers '+run.toFixed(1)+'m in '+time.toFixed(2)+'s at most at sprint speed');checked++;}
  race.racers.forEach(x=>{if(x.meet)assert(x.meet.t>=x.prof.reaction,'nobody reaches the ball before reacting');});
 }
 assert(checked>40,'enough reachable through balls were checked: '+checked);
 for(const o of ['receiver','defender','keeper','contested'])assert(outcomes.has(o),'through-ball race produces outcome '+o+': '+[...outcomes]);
 // 2. Resolution moves the receiver only to where he met the ball and records the run for the pitch.
 let success=0,fails=new Set();
 for(let seed=1;seed<=60;seed++){
  const t=scene(b,(s,get,def)=>{const c=get(1,HIORI),rec=get(1,ISAGI);b.setPosition(c,{x:52,y:50});b.setPosition(rec,{x:72,y:44+(seed%5)*3});
   b.setPosition(def(0),{x:76,y:40});b.setPosition(def(1),{x:76,y:60});b.setPosition(def(2),{x:70,y:52});return {carrier:c,receiver:rec};});
  t.s.random=b.seeded(seed*31);
  const opts=b.passOptions(t.s,t.carrier).filter(o=>o.through&&o.receiver===t.receiver);if(!opts.length)continue;
  const option=opts[0],start={x:t.receiver.x,y:t.receiver.y},before=t.s.events.length;
  b.resolvePass(t.s,t.carrier,{option});const e=t.s.events.slice(before).find(x=>x.passRoute||x.type==='offside');assert(e,'a through ball produces a routed event');
  if(e.type==='pass'){success++;assert(e.runRoute,'completed through balls carry the run route');
   assert(Math.abs(e.runRoute.from.x-start.x)<1e-9&&Math.abs(e.runRoute.from.y-start.y)<1e-9,'run starts where the receiver stood');
   assert(b.distance(t.receiver,e.passRoute.to)<.5,'receiver is at the reception point, not the aimed point');}
  else fails.add(e.type);
 }
 assert(success>5&&fails.size>=1,'through balls both succeed and fail: '+success+' / '+[...fails]);
 // 3. Offside still applies to runners and stops the ball before any flight.
 const off=scene(b,(s,get,def)=>{const c=get(1,HIORI),rec=get(1,ISAGI);b.setPosition(c,{x:55,y:50});b.setPosition(rec,{x:88,y:50});
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:70+(i%3),y:20+i*5}));return {carrier:c,receiver:rec};});
 const offOpt=b.passOptions(off.s,off.carrier).find(o=>o.through&&o.receiver===off.receiver);
 if(offOpt){assert(offOpt.model.offside,'beyond the last line is offside');b.resolvePass(off.s,off.carrier,{option:offOpt});assert.equal(off.s.events.at(-1).type,'offside');}
 // 4. Determinism: the same seeded scene resolves identically.
 const once=seed=>{const t=scene(b,(s,get,def)=>{const c=get(1,HIORI),rec=get(1,ISAGI);b.setPosition(c,{x:50,y:50});b.setPosition(rec,{x:70,y:40});b.setPosition(def(0),{x:78,y:45});return {carrier:c,receiver:rec};});
  t.s.random=b.seeded(seed);const o=b.passOptions(t.s,t.carrier).find(o=>o.through&&o.receiver===t.receiver);if(!o)return 'none';b.resolvePass(t.s,t.carrier,{option:o});const e=t.s.events.at(-1);return e.type+':'+JSON.stringify(e.passRoute&&e.passRoute.to);};
 for(const seed of [3,9,27])assert.equal(once(seed),once(seed),'seeded through balls are deterministic');
 console.log('PASS v0.8.9 through balls: physical race (no teleport, '+checked+' reachable runs within sprint limits), outcomes '+[...outcomes].join('/')+', '+success+' completions with run routes, offside first, deterministic');
}

function intelligenceTests(){
 const {b}=setup();
 const s=b.createMatch();b.setMatch(s);
 const isagi=b.active(s.teams[1]).find(p=>Number(p.id)===ISAGI),cb=b.active(s.teams[2]).filter(p=>p.role!=='GK').sort((x,y)=>y.stats.def-x.stats.def)[0];
 const awI=b.battleAwareness(isagi),awD=b.battleAwareness(cb);
 assert(awI.scan>awD.scan,'Isagi reads further across the pitch than a defender');
 assert(awI.anticipation>0&&awD.anticipation===0,'anticipation comes from the kit, not from ratings');
 const spread=new Set(b.active(s.teams[1]).map(p=>Math.round(b.battleAwareness(p).scan)));assert(spread.size>=4,'awareness differs between players: '+[...spread]);
 // Metavision does not change physical attributes.
 const offBall=b.effective(isagi,'spd',s);s.possession=1;s.carrierId=isagi.id;assert.equal(b.effective(isagi,'spd',s),offBall,'no speed bonus on or off the ball');
 // Runs: an onside gap in a high line produces at most two runners heading for gaps, not offside spots.
 let runsSeen=0,maxRunners=0;
 for(let seed=1;seed<=30;seed++){
  const r=b.seeded(seed);const t=scene(b,(s,get,def)=>{const c=get(1,HIORI);b.setPosition(c,{x:52,y:50});
   b.active(s.teams[1]).filter(p=>p.role!=='GK'&&p!==c).forEach((p,i)=>b.setPosition(p,{x:58+r()*14,y:10+i*8}));
   b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,i<4?{x:73+r()*2,y:14+i*22+r()*6}:{x:58+r()*8,y:12+(i-4)*12}));return {carrier:c};});
  b.updateIntents(t.s);const line=b.lastLineM(t.s,1),runners=b.active(t.s.teams[1]).filter(p=>p.intent&&p.intent.type==='run');
  maxRunners=Math.max(maxRunners,runners.length);runsSeen+=runners.length;
  runners.forEach(p=>assert(b.aheadM(1,p.intent.target)<=line+1e-6,'run targets stay onside'));
 }
 assert(runsSeen>10&&maxRunners<=2,'runs are made, at most two at a time: '+runsSeen+'/'+maxRunners);
 // Blind-side runs are tracked only by elite readers.
 const run={type:'run',blindSpot:true,target:{x:80,y:50}},normal={...run,blindSpot:false},runner={intent:run},seen={intent:normal};
 const defenders=b.active(s.teams[2]).filter(p=>p.role!=='GK'),elite=defenders.filter(d=>b.tracksRun(d,runner)).length,ordinary=defenders.filter(d=>b.tracksRun(d,seen)).length;
 assert(elite<ordinary,'blind-spot runs lose more markers than visible runs: '+elite+' vs '+ordinary);
 // Run recognition depends on the passer's vision; a run outside it is not offered.
 const t=scene(b,(s,get,def)=>{const c=b.active(s.teams[1]).filter(p=>p.role!=='GK'&&![ISAGI,HIORI].includes(Number(p.id))).sort((x,y)=>x.stats.pas-y.stats.pas)[0],rec=get(1,ISAGI);
  b.setPosition(c,{x:30,y:85});b.setPosition(rec,{x:70,y:20});rec.intent={type:'run',target:{x:72,y:20},until:99,primed:true,dir:{x:1,y:0}};return {carrier:c,receiver:rec};});
 const low=b.battleAwareness(t.carrier);const far=b.distance(t.carrier,t.receiver);
 if(far>low.scan+8)assert(!b.passOptions(t.s,t.carrier).some(o=>o.through&&o.receiver===t.receiver),'a run outside the passer\'s vision is not seen');
 console.log('PASS v0.8.9 intelligence: per-player awareness (Isagi scan '+awI.scan.toFixed(0)+'m vs '+awD.scan.toFixed(0)+'m), onside runs ('+runsSeen+' in 30 scenes, max '+maxRunners+'), blind-spot tracking '+elite+'/'+ordinary+', vision-limited recognition');
}

function isagiTests(){
 const {b}=setup();
 const base=(place,first=true)=>scene(b,(s,get,def)=>{const isg=get(1,ISAGI),c=get(1,HIORI);place(s,get,def,isg,c);
  if(first)s.lastReception={playerId:String(isg.id),teamNumber:1,passerId:String(c.id),tick:s.tick-1,kind:'short',through:false,from:{x:c.x,y:c.y},to:{x:isg.x,y:isg.y}};return {carrier:isg,passer:c};});
 // Direct Shot: first-time from a pass, without the former 24 m cap; defenders block 30% less effectively.
 let t=base((s,get,def,isg,c)=>{b.setPosition(c,{x:80,y:30});b.setPosition(isg,{x:86,y:52});b.setPosition(def(0),{x:88,y:56});});
 let techs=b.shotTechniques(t.s,t.carrier).map(x=>x.id);assert(techs.includes('direct-shot'),'first-time chance offers Direct Shot: '+techs);
 const direct=b.shotTechniques(t.s,t.carrier).find(x=>x.id==='direct-shot'),plain=b.shotModel(t.s,t.carrier,false,null,null).goalChance,withTech=b.shotModel(t.s,t.carrier,false,null,null,null,null,direct).goalChance;
 assert(withTech>plain&&withTech<.9,'Direct Shot improves the finish without guaranteeing it: '+plain.toFixed(3)+' → '+withTech.toFixed(3));
 const gk=b.keeper(t.s.teams[2]),gkBefore=gk.stats.gk;gk.stats.gk=99;const vsElite=b.shotModel(t.s,t.carrier,false,null,null,null,null,direct).goalChance;gk.stats.gk=gkBefore;assert(vsElite<withTech,'the goalkeeper still contests it');
 assert.equal(b.shotModel(t.s,t.carrier,false,null,null,null,null,direct).shoot,b.effective(t.carrier,'sho'),'no SHO multiplier');
 t=base((s,get,def,isg,c)=>{b.setPosition(c,{x:80,y:30});b.setPosition(isg,{x:86,y:52});},false);
 assert(!b.shotTechniques(t.s,t.carrier).some(x=>x.id==='direct-shot'),'no Direct Shot without a first-time pass');
 t=base((s,get,def,isg,c)=>{b.setPosition(c,{x:60,y:30});b.setPosition(isg,{x:70,y:50});});
 assert(b.shotTechniques(t.s,t.carrier).some(x=>x.id==='direct-shot'),'Direct Shot has no 24 m range cap');
 // Left-Footed Direct Shot: the near-post alternative wins when the far-post lane is blocked.
 t=base((s,get,def,isg,c)=>{b.setPosition(c,{x:80,y:70});b.setPosition(isg,{x:87,y:40});b.setPosition(def(0),{x:91,y:45.5});b.setPosition(def(1),{x:93,y:49});});
 const opts=b.shotTechniques(t.s,t.carrier),far=opts.find(x=>x.id==='direct-shot'),near=opts.find(x=>x.id==='left-footed-direct-shot');
 assert(far&&near,'both feet are options');const cFar=b.shotModel(t.s,t.carrier,false,null,null,null,null,far).goalChance,cNear=b.shotModel(t.s,t.carrier,false,null,null,null,null,near).goalChance;
 assert(cNear>cFar,'left foot to the near post when the far post is blocked: '+cNear.toFixed(3)+' vs '+cFar.toFixed(3));
 // Reverse Back Heel: in Flow, a tackle within 20 m preserves Isagi's possession for the immediate shot.
 t=base((s,get,def,isg,c)=>{b.setPosition(isg,{x:90,y:50});b.setPosition(def(0),{x:91.5,y:50.5});isg.flow=100;},false);
 assert(!b.shotTechniques(t.s,t.carrier).some(x=>x.id==='reverse-back-heel-shot'),'Back Heel is not a normal shot option');
 assert.equal(b.battleSimProfileStatus(t.carrier,'ULTIMATE','reverse-back-heel-shot',t.s).kind,'ready','Back Heel is a Flow ultimate');
 t.s.random=()=>.999999;b.resolveDribble(t.s,t.carrier);
 assert(t.s.events.some(e=>e.type==='shot-attempt'&&e.ability&&e.ability.id==='reverse-back-heel-shot'),'a tackle triggers Back Heel');
 assert(t.carrier.battleSimState.usedUltimates.includes('reverse-back-heel-shot'),'Back Heel is consumed for this Flow');
 assert.equal(b.battleSimProfileStatus(t.carrier,'ULTIMATE','reverse-back-heel-shot',t.s).kind,'used','Back Heel cannot repeat in the same Flow');
 // Two-Gun Volley: Flow + first-time pass + blocking defender; once per Flow.
 const volleyScene=()=>base((s,get,def,isg,c)=>{b.setPosition(c,{x:80,y:25});b.setPosition(isg,{x:88,y:48});b.setPosition(def(0),{x:89.5,y:49});isg.flow=100;});
 t=volleyScene();assert(b.shotTechniques(t.s,t.carrier).some(x=>x.id==='two-gun-volley'),'volley offered in Flow after a pass with a committing defender');
 t.carrier.flow=50;assert(!b.shotTechniques(t.s,t.carrier).some(x=>x.id==='two-gun-volley'),'never outside Flow');t.carrier.flow=100;
 const volley=b.shotTechniques(t.s,t.carrier).find(x=>x.id==='two-gun-volley');
 assert(b.shotModel(t.s,t.carrier,false,null,null,null,null,volley).goalChance<.95,'the keeper still contests the volley');
 t.s.random=()=>0;b.resolveShot(t.s,t.carrier,false,null,volley);assert.equal(t.s.score[1],1,'volley can score');
 const after=volleyScene();Object.assign(after.carrier.battleSimState=after.carrier.battleSimState||{},t.carrier.battleSimState);
 assert(!b.shotTechniques(after.s,after.carrier).some(x=>x.id==='two-gun-volley'),'one Two-Gun Volley goal per match');
 // Adaptability: a rolling last-three failure memory that persists across elapsed time and saves.
 const m=b.createMatch();b.setMatch(m);const isg=b.active(m.teams[1]).find(p=>Number(p.id)===ISAGI),gkm=b.keeper(m.teams[2]);
 for(let i=0;i<10;i++){m.tick=i;b.learn(m,isg,'lane',i,gkm);}b.learn(m,isg,'shot','far',gkm);b.learn(m,isg,'shot','far',gkm);b.learn(m,isg,'shot','far',gkm);b.learn(m,isg,'shot','far',gkm);
 assert.equal(isg.battleSimState.memory.length,3,'memory is a rolling three-event window');assert.equal(b.memoryCount(m,isg,'shot','far'),3,'counts are capped');
 m.tick=200;assert.equal(b.memoryCount(m,isg,'shot','far'),3,'last-three memory does not decay with time');m.tick=12;
 const restored=b.hydrateMatch(JSON.parse(JSON.stringify(b.snapshotMatch(m))));const isg2=b.active(restored.teams[1]).find(p=>Number(p.id)===ISAGI);
 assert.equal(b.memoryCount(restored,isg2,'shot','far'),3,'tactical memory is saved');
 const forged=JSON.parse(JSON.stringify(b.snapshotMatch(m)));const fp=forged.teams[1].roster.find(p=>Number(p.id)===ISAGI);
 fp.battleSimState.memory=Array.from({length:50},(_, i)=>({kind:i%2?'shot':'evil',key:'x'.repeat(99),count:1e9,tick:'NaN'}));fp.intent={type:'teleport',target:{x:1e9,y:-5}};
 const clean=b.hydrateMatch(forged),cp=b.active(clean.teams[1]).find(p=>Number(p.id)===ISAGI);
 assert.equal(cp.battleSimState.memory.length,3,'forged memory is trimmed to three events');assert(cp.battleSimState.memory.every(e=>e.count<=3&&e.key.length<=12&&e.kind!=='evil'),'forged memory is sanitised');assert(!cp.intent,'forged intents are dropped');
 // Data: ratings untouched, kit is data-driven and every effect has a handler.
 const data=b.resolveSharedPlayer({id:ISAGI});assert.deepEqual({...data.stats},{ovr:94,off:98,sho:94,spd:82,def:78,pas:91,dri:84,gk:48},'Isagi ratings unchanged');
 const effects=['space-reading','blind-spot-run','tactical-memory','first-time-finish','weak-foot-finish','disguised-finish','feint-volley'];
 effects.forEach(e=>assert(b.kitAbility(data,e),'kit declares '+e));
 assert((data.battleSim.ultimates||[]).some(x=>x.id==='reverse-back-heel-shot'&&x.oncePerFlow),'Back Heel is once per Flow');assert((data.battleSim.ultimates||[]).some(x=>x.id==='two-gun-volley'&&x.oncePerFlow),'Two-Gun is once per Flow');assert(!data.weapons.some(w=>w.id==='awareness'),'Awareness removed');assert(!JSON.stringify(data.battleSim).includes('statBonuses')&&!JSON.stringify(data.battleSim).includes('statMultipliers'),'no stat bonuses or SHO multipliers');
 console.log('PASS v0.8.9 Isagi: Direct Shot '+plain.toFixed(2)+'→'+withTech.toFixed(2)+' (first-time, ≤24 m, keeper contests), left foot '+cNear.toFixed(2)+' vs '+cFar.toFixed(2)+', back heel contextual with cooldown, Two-Gun Volley limited, bounded/decaying/saved/sanitised memory, ratings unchanged');
}

function reactionTests(){
 const {b}=setup();
 // Hiori: a run he reads is played more precisely and labelled; another passer gets no reaction.
 const sync=passerId=>scene(b,(s,get,def)=>{const c=passerId===HIORI?get(1,HIORI):b.active(s.teams[1]).find(p=>p.role!=='GK'&&![ISAGI,HIORI,KURONA,BACHIRA,KAISER].includes(Number(p.id))),isg=get(1,ISAGI);
  b.setPosition(c,{x:55,y:50});b.setPosition(isg,{x:72,y:42});isg.intent={type:'run',target:{x:73,y:42},until:s.tick+3,primed:true,blindSpot:false,dir:{x:1,y:0}};
  b.setPosition(def(0),{x:75,y:30});b.setPosition(def(1),{x:75,y:58});return {carrier:c,receiver:isg};});
 let t=sync(HIORI);const tagged=b.passOptions(t.s,t.carrier).filter(o=>o.receiver===t.receiver&&o.through&&o.reaction);
 assert(tagged.length&&tagged[0].reaction.def.id==='reflexive-synchronization'&&tagged[0].precision<1,'Hiori synchronises with Isagi\'s run');
 assert(tagged[0].model.success<1,'a reaction is never guaranteed');
 const passed=b.playReaction(t.s,t.carrier,tagged[0]);assert.equal(passed.reaction.id,'reflexive-synchronization');assert(passed.dialogue&&passed.dialogue[0].key,'reaction line is keyed for translation');
 assert(!b.passOptions(t.s,t.carrier).some(o=>o.reaction&&o.reaction.def.id==='reflexive-synchronization'),'cooldown after use');
 t=sync(0);assert(!b.passOptions(t.s,t.carrier).some(o=>o.reaction),'other passers do not trigger it');
 // Kurona: wall pass when Isagi is pressed, then the return is played into his run.
 t=scene(b,(s,get,def)=>{const isg=get(1,ISAGI),k=get(1,KURONA);b.setPosition(isg,{x:70,y:50});b.setPosition(k,{x:74,y:38});b.setPosition(def(0),{x:72,y:51});return {carrier:isg,partner:k};});
 const wall=b.passOptions(t.s,t.carrier).find(o=>o.receiver===t.partner&&o.reaction);assert(wall&&wall.reaction.def.id==='planet-hotline','Planet Hotline when Isagi is pressed');
 b.playReaction(t.s,t.carrier,wall);assert(t.carrier.intent&&t.carrier.intent.reaction==='planet-hotline','Isagi sets off for the return');
 t.s.carrierId=t.partner.id;b.setPosition(t.carrier,t.carrier.intent.target);const ret=b.passOptions(t.s,t.partner).find(o=>o.receiver===t.carrier&&o.reaction);
 assert(ret&&ret.reaction.def.id==='planet-hotline','Kurona returns the wall pass');
 const t2=scene(b,(s,get,def)=>{const isg=get(1,ISAGI),k=get(1,KURONA);b.setPosition(isg,{x:70,y:50});b.setPosition(k,{x:74,y:38});return {carrier:isg,partner:k};});
 assert(!b.passOptions(t2.s,t2.carrier).some(o=>o.reaction&&o.reaction.def.id==='planet-hotline'),'no wall pass without pressure');
 // Bachira: a dribble that drags defenders opens space Isagi attacks.
 t=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),isg=get(1,ISAGI);b.setPosition(ba,{x:70,y:60});b.setPosition(isg,{x:72,y:38});b.setPosition(def(0),{x:72,y:62});b.setPosition(def(1),{x:69,y:56});b.setPosition(def(2),{x:85,y:20});return {carrier:ba,receiver:isg};});
 b.afterDribble(t.s,t.carrier,null);assert(t.receiver.intent&&t.receiver.intent.reaction==='creative-instinct','Isagi reads the space Bachira created');
 assert(b.passOptions(t.s,t.carrier).some(o=>o.receiver===t.receiver&&o.reaction&&o.reaction.def.id==='creative-instinct'),'Bachira can find him there');
 t=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),isg=get(1,ISAGI);b.setPosition(ba,{x:70,y:60});b.setPosition(isg,{x:72,y:38});return {carrier:ba,receiver:isg};});
 b.afterDribble(t.s,t.carrier,null);assert(!t.receiver.intent,'no reaction when no defender was drawn');
 // Kaiser: rivals cooperate only when the other's chance is clearly better.
 t=scene(b,(s,get,def)=>{const ka=get(1,KAISER),isg=get(1,ISAGI);b.setPosition(ka,{x:72,y:20});b.setPosition(isg,{x:89,y:48});b.setPosition(def(0),{x:74,y:21});return {carrier:ka,receiver:isg};});
 assert(b.passOptions(t.s,t.carrier).some(o=>o.receiver===t.receiver&&o.reaction&&o.reaction.def.id==='rational-alliance'),'Rational Alliance when Isagi is clearly better placed');
 t=scene(b,(s,get,def)=>{const ka=get(1,KAISER),isg=get(1,ISAGI);b.setPosition(ka,{x:86,y:46});b.setPosition(isg,{x:75,y:25});return {carrier:ka,receiver:isg};});
 assert(!b.passOptions(t.s,t.carrier).some(o=>o.reaction),'no cooperation when Kaiser has the better chance');
 // Both players must be active: a benched partner removes the reaction.
 const solo=setup([ISAGI]);const s=solo.b.createMatch();solo.b.setMatch(s);const isg=solo.b.active(s.teams[1]).find(p=>Number(p.id)===ISAGI);
 assert.equal(solo.b.kitReactions(s,isg).length,0,'no reaction without the partner on the pitch');
 console.log('PASS v0.8.9 reactions: Reflexive Synchronization (precision, cooldown, Hiori only), Planet Hotline (pressure, wall and return), Creative Instinct (drawn defenders), Rational Alliance (rivalry), partner required, never guaranteed');
}

function dialogueTests(){
 const {h,b}=setup();
 const s=b.createMatch();b.setMatch(s);const isg=b.active(s.teams[1]).find(p=>Number(p.id)===ISAGI);
 const lines=[];for(let i=0;i<6;i++){s.tick=i*5;const l=b.kitLine(s,isg,'goal',true);lines.push(l.key);}
 for(let i=1;i<lines.length;i++)assert.notEqual(lines[i],lines[i-1],'a line is not repeated back to back');
 s.tick=100;assert(b.kitLine(s,isg,'read',false));assert.equal(b.kitLine(s,isg,'blindRun',false),null,'minor lines are throttled');assert(b.kitLine(s,isg,'goal',true),'major moments always speak');
 const data=b.resolveSharedPlayer({id:ISAGI}).battleSim,messages=h.run('typeof BLD_BATTLE_MESSAGES!=="undefined"?null:null');
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/i18n/battle-messages.js'),'utf8'),ctx);
 const M=ctx.window.BLD_BATTLE_MESSAGES,langs=['ms','ja','ar','zh-CN','fr','de','ko','pt','ru','es'];
 const required=[...Object.values(data.dialogue).flat(),...[...data.passives,...data.weapons,...data.ultimates,...data.reactions].map(a=>a.label),'CHEMICAL REACTION','PARTNER NOT ON PITCH','USED THIS MATCH'];
 required.forEach(k=>{assert(M[k],'translated: '+k);langs.forEach(l=>assert(M[k][l]&&M[k][l]!==k||/^[A-Z -]+$/.test(k)&&M[k][l],'translated to '+l+': '+k));});
 void messages;
 console.log('PASS v0.8.9 dialogue: no back-to-back repeats, minor lines throttled, '+required.length+' character lines and labels in 11 languages');
}

function fullMatchTests(){
 const scenarios={none:[],isagi:[ISAGI],hiori:[ISAGI,HIORI],kurona:[ISAGI,KURONA],bachira:[ISAGI,BACHIRA],kaiser:[ISAGI,KAISER]};
 const report=[],reactionsBy={};let msTotal=0,ticks=0;
 for(const [label,stars] of Object.entries(scenarios)){
  const {b}=setup(stars,'4-4-2');let goals=0,shots=0,abilities=0,reactions={},volleyGoals=0;
  for(let seed=1;seed<=4;seed++){
   const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);const t0=process.hrtime.bigint();let g=0;
   while(s.status!=='finished'&&g++<1300)advance({bs:b},s);msTotal+=Number(process.hrtime.bigint()-t0)/1e6;ticks+=s.tick;
   assert.equal(s.status,'finished',label+' '+seed+' finishes');goals+=s.score[1]+s.score[2];shots+=s.teams[1].stats.shots+s.teams[2].stats.shots;
   let vg=0;s.events.forEach((e,i)=>{if(e.ability)abilities++;if(e.reaction)reactions[e.reaction.id]=(reactions[e.reaction.id]||0)+1;
    if(e.ability&&e.ability.id==='two-gun-volley'&&s.events[i+1]&&s.events[i+1].type==='goal')vg++;
    if(e.runRoute)assert([e.runRoute.from,e.runRoute.to].every(p=>p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100),'run routes stay on the pitch');});
   volleyGoals+=vg;
   if(!stars.length)assert(!s.events.some(e=>e.ability||e.reaction),'no Isagi abilities without Isagi');
   const restored=b.hydrateMatch(JSON.parse(JSON.stringify(b.snapshotMatch(s))));assert(restored,'finished match with abilities restores');
  }
  reactionsBy[label]=reactions;
  assert(goals/4>=.5&&goals/4<=7,label+': plausible scoring '+goals/4);
  report.push(label+' '+(goals/4).toFixed(1)+'g/'+(shots/4).toFixed(0)+'sh/'+abilities+'ab');
 }
 assert(reactionsBy.hiori['reflexive-synchronization'],'Hiori reaction occurs in real matches');
 assert(reactionsBy.kaiser['rational-alliance'],'Kaiser reaction occurs in real matches');
 ['none','isagi'].forEach(k=>assert.equal(Object.keys(reactionsBy[k]).length,0,'no reactions without a partner ('+k+')'));
 const per=msTotal/ticks;assert(per<12,'engine cost stays bounded: '+per.toFixed(2)+'ms per tick');
 console.log('PASS v0.8.9 full matches: '+report.join(', ')+'; reactions '+JSON.stringify(reactionsBy)+'; '+per.toFixed(2)+'ms per tick');
}

function runBattleV089Tests(){throughBallTests();intelligenceTests();isagiTests();reactionTests();dialogueTests();fullMatchTests();}
module.exports={runBattleV089Tests,setup,scene};
if(require.main===module)runBattleV089Tests();
