#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {battleContext,positionalAssignment}=require('./battle-sim-tests.js');
const {scene}=require('./battle-v089-tests.js');
const {advance}=require('./battle-presentation-tests.js');
const {createModeTestContext}=require('./game-modes-tests.js');
const root=path.resolve(__dirname,'..'),IDS=[1,2,3,4,5,6,7,8,9,10,11,12,13,16,17,18];
function setup(stars,source,contextFactory=battleContext){
 const h=contextFactory(source),b=h.bs;b.quiet();
 const pool=h.run('players.filter(p=>!p.secretCharacter&&![1,2,3,4,5,6,7,8,9,10,11,12,13,16,17,18,19,26,27,31,49].includes(Number(p.id))).map(p=>p.id)');
 const configs=[1,2].map(n=>{const ids=n===1?stars.concat(pool.slice(0,14-stars.length)):pool.slice(18,32),a=positionalAssignment(h,'4-4-2',ids,n);
  if(n===1){const preferences={1:['ST'],2:['ST'],3:['ST'],4:['RM','LM'],5:['RB','LB'],6:['ST'],7:['LM','RM'],8:['CB'],9:['CM'],10:['ST'],11:['CM'],12:['ST'],13:['LM','RM'],16:['CB'],17:['ST'],18:['RM','LM'],19:['CM'],27:['CM']};const slots=h.run('FORMATIONS["4-4-2"]'),chosen=new Set();for(const id of stars){let slot=slots.findIndex((s,i)=>i>0&&!chosen.has(i)&&(preferences[id]||['ST','CM','CB']).includes(s.label));if(slot<0)slot=slots.findIndex((s,i)=>i>0&&!chosen.has(i));chosen.add(slot);const old=Object.keys(a).find(k=>Number(a[k])===id);if(old!=null){const swap=a[slot];a[old]=swap;}a[slot]=id;}}
  return h.run(`bs.normalizeTeam({name:'Test ${n}',formation:'4-4-2',roster:[blueLockManFor(${n}),...${JSON.stringify(ids)}.map(playerById)],assignment:${JSON.stringify(a)},strategy:{tempo:55,directness:55,pressing:50,line:50,width:50}},${n})`);});
 b.setTeams(configs);return{h,b};
}
function dataTests(){
 const {run}=createModeTestContext(),all=JSON.parse(run('JSON.stringify(players)'));
 const secret=all.filter(p=>p.secretCharacter).sort((a,b)=>a.id-b.id);assert.equal(crypto.createHash('sha256').update(JSON.stringify(secret)).digest('hex'),require('./fixtures/protected-v0893.json').sha256,'all secret records protected');
 const protectedData=require('./fixtures/character-batch-protected.json');for(const expected of protectedData.public){const p=all.find(p=>p.id===expected.id);assert.deepEqual({id:p.id,stats:p.stats,positions:p.positions,primaryPosition:p.primaryPosition},expected,'public Base data '+p.name);}for(const expected of protectedData.priorKits){const kit=JSON.parse(JSON.stringify(all.find(p=>p.id===expected.id).battleSim));delete kit.dialogue;assert.deepEqual(kit,expected.kit,'prior kit mechanics '+expected.id);}assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'js/chemistry.js'))).digest('hex'),protectedData.chemistry,'chemistry source unchanged');
 const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'js/i18n/messages.js'),'utf8'),c);vm.runInNewContext(fs.readFileSync(path.join(root,'js/i18n/battle-messages.js'),'utf8'),c);
 for(const id of IDS){const p=all.find(p=>p.id===id);for(const [key,lines]of Object.entries(p.battleSim.dialogue)){for(const line of lines)assert.equal(Object.keys(c.window.BLD_BATTLE_MESSAGES[line]||{}).length,10,p.name+' '+key+': '+line);}
  if([12,13,16,17,18].includes(id)){const kit=p.battleSim;for(const a of ['passives','weapons','ultimates','reactions'].flatMap(g=>kit[g]||[])){assert.equal(Object.keys(c.window.BLD_MESSAGES[a.description]||{}).length,10,a.description);assert.equal(Object.keys(c.window.BLD_BATTLE_MESSAGES[a.label]||{}).length,10,a.label);}}
 }
 assert.equal(all.find(p=>p.id===1).stats.ovr,94);assert.equal(all.find(p=>p.id===17).stats.ovr,73);
 assert.deepEqual(Object.keys(all.find(p=>p.id===19).battleSim),['dialogue'],'Keisuke has no full kit');
 console.log('PASS 8.9.8.2 data: protected secret hash, 16 localized voices, localized new ability copy, unchanged OVR, interpreter-only Keisuke');
}
function aerialAndCarryTests(){
 const {b}=setup([12,13,1]);
 const t=scene(b,(s,get,def)=>{const k=get(1,12),i=get(1,13);b.setPosition(k,{x:84,y:50});b.setPosition(i,{x:55,y:45});return{carrier:k,im:i};});
 const flight=b.ballFlight({x:65,y:20},{x:89,y:50},'long'),normal=b.raceProfile(t.s,t.carrier,'receiver',null,null),air=b.raceProfile(t.s,t.carrier,'receiver',flight,null);
 assert(air.reaction<normal.reaction);assert.equal(air.vmax,normal.vmax,'aerial ability never changes speed');
 t.s.lastReception={playerId:'12',teamNumber:1,passerId:'1',tick:t.s.tick-1,style:'cross',aerial:false,from:{x:76,y:20},to:{x:84,y:50}};
 assert(!b.shotTechniques(t.s,t.carrier).some(x=>x.id==='high-point-header'),'no header for a grounded cross');t.s.lastReception.aerial=true;
 const header=b.shotTechniques(t.s,t.carrier).find(x=>x.id==='high-point-header');assert(header);const airSave=b.hydrateMatch(JSON.parse(JSON.stringify(b.snapshotMatch(t.s))));assert(airSave?.lastReception.aerial,'airborne reception survives reload');assert(b.shotTechniques(airSave,airSave.teams[1].roster.find(p=>p.id==='12')).some(q=>q.id==='high-point-header'),'header stays eligible after reload');assert(b.shotModel(t.s,t.carrier,false,null,null,null,null,header).goalChance<.95);
 const far=scene(b,(s,get)=>{const k=get(1,12),p=get(1,1);b.setPosition(k,{x:10,y:8});b.setPosition(p,{x:80,y:90});return{carrier:p,k};});
 const race=b.throughRace(far.s,far.carrier,far.k,{x:95,y:50},'long');assert(!race.receiver.meet,'Kuon cannot reach an impossible delivery');
 for(const [roll,expected]of [[0,'goal'],[.999,'goal-kick'],[.8,'save']]){const q=scene(b,(s,get)=>{const k=get(1,12);b.setPosition(k,{x:89,y:50});return{carrier:k};});let draw=0;q.s.random=()=>draw++===0?(roll===0?0:.999):(roll===.8?.5:roll);b.resolveShot(q.s,q.carrier,false,null,header);assert(q.s.events.some(e=>e.type===expected),'header can '+expected);assert.equal(q.carrier.battleSimState.cooldowns['high-point-header'],q.s.tick+8);}
 const im=t.im,start={x:im.x,y:im.y};t.s.possession=1;t.s.carrierId=im.id;b.setBall(t.s,im);t.s.random=()=>0;b.resolveDribble(t.s,im,{target:{x:60,y:45}});assert(b.distance(start,im)<=b.dribbleMeters(im)+.01,'real carry movement');assert.equal(im.battleSimState.cooldowns['speed-technique-carry'],t.s.tick+7);
 const lose=scene(b,(s,get,def)=>{const i=get(1,13);b.setPosition(i,{x:70,y:50});b.setPosition(def(0),{x:71,y:50});return{carrier:i};});lose.s.random=()=>.999;b.resolveDribble(lose.s,lose.carrier,{target:{x:75,y:50}});assert.equal(lose.s.possession,2,'Imamura can lose to a defender');
 console.log('PASS 8.9.8.2 aerial/carry: reachable airborne balls only, unchanged speed limit, saved/missed/scoring headers, attempt cooldown, physical carries and tackle losses');
}
function nikoTests(){
 const {b}=setup([16,17]);const s=b.createMatch();b.setMatch(s);const n=b.active(s.teams[1]).find(p=>Number(p.id)===16),c=b.active(s.teams[2]).find(p=>p.role!=='GK'),r=b.active(s.teams[2]).filter(p=>p.role!=='GK')[1];
 s.possession=2;s.carrierId=c.id;b.setPosition(c,{x:36,y:50});b.setPosition(n,{x:27,y:50});b.setPosition(r,{x:20,y:54});b.setBall(s,c);const before={x:n.x,y:n.y};
 b.planTeamShape(s,s.teams[1],new Map());assert.equal(n.battleSimState.predictedPasser,c.id,'observed route is tracked');assert(n.battleSimState.cooldowns['defensive-trap']>s.tick);
 assert.deepEqual({x:n.x,y:n.y},before,'planning does not teleport Niko');b.moveOffBall(s);assert(b.distance(before,n)<12,'ordinary physical movement toward read');
 b.setPosition(n,{x:5,y:5});b.setPosition(c,{x:90,y:90});s.tick+=20;delete n.battleSimState.predictedPasser;b.planTeamShape(s,s.teams[1],new Map());assert(!n.battleSimState.predictedPasser,'no prediction beyond observation range');
 const t=scene(b,(s,get,def)=>{const n=get(1,16),o=get(1,17);b.setPosition(n,{x:60,y:50});b.setPosition(o,{x:72,y:50});b.setPosition(def(0),{x:66,y:51});return{carrier:n,receiver:o};});const opt=b.passOptions(t.s,t.carrier).find(q=>q.receiver===t.receiver&&q.reaction?.def.id==='hidden-playmaker-ace');assert(opt,'real supply option');assert(opt.model.success<1);const extra=b.playReaction(t.s,t.carrier,opt);assert.equal(extra.reaction.id,'hidden-playmaker-ace');assert(!b.reactionReady(t.s,opt.reaction.def,1));
 assert(b.reactionDefsFor(t.carrier).some(r=>r.def.id==='hidden-playmaker-ace'));assert(b.reactionDefsFor(t.receiver).some(r=>r.def.id==='hidden-playmaker-ace'));
 t.receiver.sentOff=true;assert.equal(b.kitReactions(t.s,t.carrier).length,0);
 console.log('PASS 8.9.8.2 Niko: observed threats change physical positioning, range-limited anticipation, 10-tick trap and interruptible shared supply with partner gating');
}
function okawaAndTwinTests(){
 const {b}=setup([17,18,19]);const t=scene(b,(s,get)=>{const o=get(1,17);b.setPosition(o,{x:84,y:50});return{carrier:o};}),gk=b.keeper(t.s.teams[2]);
 gk.lastMove={x:0,y:0};assert(!b.shotTechniques(t.s,t.carrier).some(q=>q.id==='super-shooting'));b.setPosition(gk,{x:92,y:50});gk.lastMove={x:0,y:1};assert(b.shotTechniques(t.s,t.carrier).some(q=>q.id==='super-shooting'),'keeper commits away from chosen side');
 assert(!b.shotTechniques(t.s,t.carrier).some(q=>q.id==='chip-shot'),'line-positioned keeper not chipped');b.setPosition(gk,{x:88,y:50});const chips=b.shotTechniques(t.s,t.carrier).filter(q=>q.id==='chip-shot');assert(chips.length);assert(b.shotModel(t.s,t.carrier,false,null,null,null,null,chips[0]).goalChance<.95);
 const w=scene(b,(s,get,def)=>{const j=get(1,18),k=get(1,19);b.setPosition(j,{x:60,y:50});b.setPosition(k,{x:65,y:62});b.setPosition(def(0),{x:59,y:49});return{carrier:j,receiver:k};});const opt=b.passOptions(w.s,w.carrier).find(q=>q.receiver===w.receiver&&q.reaction?.def.id==='eye-contact');assert(opt,'a safe short combination exists');
 const ex=b.playReaction(w.s,w.carrier,opt);assert.equal(ex.dialogue[0].playerId,'19','Keisuke interprets');assert(w.carrier.intent?.type==='run');assert.equal(b.battleSimProfileStatus(w.carrier,'CHEMICAL REACTION','eye-contact',w.s).kind,'cooldown');assert.equal(b.battleSimProfileStatus(w.receiver,'CHEMICAL REACTION','eye-contact',w.s).kind,'cooldown');
 const restored=b.hydrateMatch(JSON.parse(JSON.stringify(b.snapshotMatch(w.s))));assert(restored);assert.deepEqual({...restored.reactionCooldowns},{...w.s.reactionCooldowns});
 w.receiver.sentOff=true;assert(!b.kitReactions(w.s,w.carrier).length,'dismissal disables both sides of reaction');
 console.log('PASS 8.9.8.2 Okawa/twins: commitment-only delayed shot, advanced-keeper chip, non-guaranteed shot model; real one-two intent, Keisuke speech, shared saved cooldown and dismissal gate');
}
function isagiAndDialogueTests(){
 const {b}=setup([1,27]);let t=scene(b,(s,get,def)=>{const i=get(1,1),h=get(1,27);b.setPosition(i,{x:88,y:45});b.setPosition(h,{x:80,y:25});b.setPosition(def(0),{x:90,y:47});s.lastReception={playerId:'1',teamNumber:1,passerId:'27',tick:s.tick-1,from:{x:80,y:25},to:{x:88,y:45}};return{carrier:i};});
 const opts=b.shotTechniques(t.s,t.carrier),d=opts.find(q=>q.id==='direct-shot');assert(d);assert.equal(d.blockFactor,.7);t.s.random=()=>.99;b.resolveShot(t.s,t.carrier,false,null,d);
 assert(!b.shotTechniques(t.s,t.carrier).some(q=>['direct-shot','left-footed-direct-shot'].includes(q.id)),'one cooldown gates both feet');
 assert(t.carrier.battleSimState.memory.some(m=>m.kind==='shot'),'missed and saved shots learned');
 t=scene(b,(s,get,def)=>{const i=get(1,1);b.setPosition(i,{x:90,y:50});b.setPosition(def(0),{x:91.5,y:50.5});i.flow=100;return{carrier:i,defender:def(0)};});t.s.random=()=>.999;b.resolveDribble(t.s,t.carrier);assert(!t.s.events.some(e=>e.ability?.id==='reverse-back-heel-shot'),'mere proximity never defeats a tackle');assert.equal(t.s.possession,2);
 t=scene(b,(s,get,def)=>{const i=get(1,1);b.setPosition(i,{x:88,y:48});b.setPosition(def(0),{x:89.5,y:49});b.setPosition(def(1),{x:93,y:48});i.flow=100;s.lastReception={playerId:'1',teamNumber:1,passerId:'27',tick:s.tick-1,from:{x:80,y:25},to:{x:88,y:48}};return{carrier:i,defender:def(0),other:def(1)};});
 assert(!b.shotTechniques(t.s,t.carrier).some(q=>q.id==='two-gun-volley'));t.defender.lastMove={x:-1,y:0};const v=b.shotTechniques(t.s,t.carrier).find(q=>q.id==='two-gun-volley');assert(v);assert.equal(v.blockFactor,1);assert.equal(v.feintId,t.defender.id);assert(b.shotModel(t.s,t.carrier,false,null,null,null,null,v).blockers>=1,'other blocker remains');
 t.s.random=()=>.999;b.resolveShot(t.s,t.carrier,false,null,v);assert.deepEqual([...t.carrier.battleSimState.usedUltimates],['two-gun-volley']);t.s.random=b.seeded(t.s.seed);const save=b.hydrateMatch(JSON.parse(JSON.stringify(b.snapshotMatch(t.s))));assert(save);assert(save.teams[1].roster.find(p=>p.id==='1').battleSimState.usedUltimates.includes('two-gun-volley'));
 t.carrier.flow=99;b.addPoints(t.carrier,.1);assert.equal(t.carrier.battleSimState.usedUltimates.length,0,'a later Flow restores both allowances');
 const {b:db}=setup(IDS.slice(0,8));const s=db.createMatch();db.setMatch(s);const pool=IDS.map(id=>db.resolveSharedPlayer({id}));
 for(const p of pool){const rng=s.random.getState();const line=db.kitLine(s,p,'pass',true),next=db.kitLine(s,p,'pass',true);assert(line?.key);assert.notEqual(line.key,next.key,'pass variety '+p.name);assert.equal(s.random.getState(),rng,'dialogue uses no gameplay RNG');assert.notEqual(db.kitLine(s,p,'passFail',true).key,line.key,'failure differs');if(p.id==='18')for(const list of Object.values(p.battleSim.dialogue))assert(list.every(l=>/^(Hmph|Hnn|Ngh|Grr)[.!]*$/.test(l)),'Junichi never speaks sentences');}
 const j=db.resolveSharedPlayer({id:18});s.tick+=5;const event=db.addEvent(s,{type:'kickoff',actors:[j],dialogue:[{playerId:j.id,text:'Junichi: Let us start!'}]});assert(event.dialogue.every(d=>/Hmph|Hnn|Ngh|Grr/.test(d.key)),'legacy explicit fallback cannot make Junichi speak');
 console.log('PASS 8.9.8.2 Isagi/dialogue: 0.70 relative block factor, shared cooldown, failed shots learned, no free tackle immunity, targeted volley, saved Flow allowance/reset, 16 personalities with isolated presentation choices and silent Junichi');
}
function runBattleV8982Tests(){dataTests();aerialAndCarryTests();nikoTests();okawaAndTwinTests();isagiAndDialogueTests();}
if(require.main===module)runBattleV8982Tests();
module.exports={runBattleV8982Tests,setup};
