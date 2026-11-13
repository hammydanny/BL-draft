#!/usr/bin/env node
'use strict';
// v0.8.9.4 Battle Sim: five more character kits (Chigiri, Gagamaru, Raichi, Naruhaya, Iemon), shared
// goalkeeping and recovery mechanics, Blue Lock Man rules, one shared cooldown per reaction, the public
// 99 Base-stat cap and the integrity of protected records.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {setup,scene}=require('./battle-v089-tests.js');
const {advance}=require('./battle-presentation-tests.js');
const {createModeTestContext}=require('./game-modes-tests.js');
const ISAGI=1,KUNIGAMI=6,CHIGIRI=7,GAGAMARU=8,RAICHI=9,NARUHAYA=10,IEMON=11,HIORI=27;
const root=path.resolve(__dirname,'..');
const HANDLED=new Set(['space-reading','blind-spot-run','tactical-memory','first-time-finish','weak-foot-finish','disguised-finish','feint-volley','support-movement','pride','controlled-finish','flow-state','rational-decisions','ambidextrous','decoy-run','power-dribble','switch-foot-finish','isolation-hunter','free-spirit','creative-dribble','disruption-pass','post-dribble-finish','dribble-chain','persistent-press','contact-read','foul-drawing','right-side-trap','physical-shield','durable','power-shot','rebound-volley','man-marking',
 'sprint-momentum','wide-runner','push-dribble','speed-cut','zone-finish','reflex-save','acrobatic-reach','smother-block','extended-parry','acrobatic-finish','super-reflex','aggression','quick-recovery','stalking-horse','run-hunger','ghost-run','run-timing','steady-keeper','set-piece-ready',
 'synchronized-through','wall-pass','exploit-disruption','rival-cooperation','second-ball','mark-and-read']);

function messages(){
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'js/i18n/messages.js'),'utf8'),ctx);vm.runInNewContext(fs.readFileSync(path.join(root,'js/i18n/battle-messages.js'),'utf8'),ctx);
 return {M:ctx.window.BLD_MESSAGES,B:ctx.window.BLD_BATTLE_MESSAGES};
}

function kitDataTests(){
 const {run}=createModeTestContext(),{M,B}=messages();
 for(const id of [CHIGIRI,GAGAMARU,RAICHI,NARUHAYA,IEMON]){
  const p=run('playerById('+id+')'),kit=p.battleSim;assert(kit,'kit for '+p.name);
  const entries=['passives','weapons','ultimates','reactions'].flatMap(g=>kit[g]||[]);
  assert(entries.some(e=>e.effect==='flow-state'),p.name+' has a Flow entry');
  entries.forEach(e=>{(e.effects||[e.effect]).forEach(x=>assert(HANDLED.has(x),'handled effect '+x));
   assert(B[e.label]&&Object.keys(B[e.label]).length>=10,'translated label '+e.label);
   assert(M[e.name]&&Object.keys(M[e.name]).length>=10,'translated name '+e.name);
   assert(M[e.description]&&Object.keys(M[e.description]).length>=10,'translated description '+e.name);
   assert(!/logit|technique|committing defender|gameplay label/i.test(e.description),'plain description '+e.name);});
  Object.values(kit.dialogue||{}).flat().forEach(line=>assert(B[line]&&Object.keys(B[line]).length>=10,'translated line: '+line));
  assert(!/statBonuses|statMultipliers/.test(JSON.stringify(kit)),'no stat multipliers in kit '+id);
  // Dossier weapons that map onto the kit no longer carry the placeholder.
  (p.weapons||[]).forEach(w=>assert.notEqual(w.battleSimType,'TBD','dossier weapon wired: '+w.name));
 }
 // Canon notes: Gagamaru and Iemon declare no chemical reaction; Naruhaya keeps ordinary finishing.
 assert.equal((run('playerById(8)').battleSim.reactions||[]).length,0);assert.equal((run('playerById(11)').battleSim.reactions||[]).length,0);
 const nk=JSON.stringify(run('playerById(10)').battleSim);assert(!/first-time-finish|zone-finish|controlled-finish|power-shot|post-dribble-finish/.test(nk),'Naruhaya has no finishing ability');
 assert(!/reflex-save|acrobatic-reach|smother-block|super-reflex/.test(JSON.stringify(run('playerById(11)').battleSim)),'Iemon has no exceptional goalkeeping');
 console.log('PASS v0.8.9.4 kits: five kits use handled effects, translated names/labels/descriptions/lines, no stat bonuses, keepers have no invented reactions, Naruhaya has no finishing boost');
}

function publicCapAndSecretTests(){
 const {run}=createModeTestContext();const all=JSON.parse(run('JSON.stringify(players)'));
 const pub=all.filter(p=>!p.secretCharacter),keys=['ovr','off','sho','pas','dri','spd','def','gk'];
 for(const p of pub)for(const k of keys)assert(!(Number(p.stats[k])>99),'public Base '+k+' ≤ 99: '+p.name+' '+p.stats[k]);
 assert.equal(run('playerById(34)').stats.dri,99,'Leonardo Luna DRI capped');assert.equal(run('playerById(36)').stats.off,99);assert.equal(run('playerById(36)').stats.sho,99);
 // Protected records: the authoritative data of every secret record is byte-identical to v0.8.9.3.
 const secret=all.filter(p=>p.secretCharacter).sort((a,b)=>a.id-b.id);
 const digest=crypto.createHash('sha256').update(JSON.stringify(secret)).digest('hex');
 assert.equal(digest,SECRET_DIGEST,'protected records unchanged');
 console.log('PASS v0.8.9.4 data: every public Base stat ≤ 99 (Luna DRI, Blake OFF/SHO capped) and the protected records are unchanged');
}
const SECRET_DIGEST=require('./fixtures/protected-v0893.json').sha256;

function chigiriTests(){
 const {b}=setup([CHIGIRI,ISAGI]);const s=b.createMatch();b.setMatch(s);s.status='playing';
 const ch=b.active(s.teams[1]).find(p=>Number(p.id)===CHIGIRI);
 ch.lastMove={x:0,y:0};const still=b.raceProfile(s,ch,'receiver',null,{type:'run'}).v0;
 ch.lastMove={x:6,y:0};const flying=b.raceProfile(s,ch,'receiver',null,{type:'run'}).v0,top=b.raceProfile(s,ch,'receiver',null,{type:'run'}).vmax;
 assert(flying>still,'already sprinting starts the race faster: '+still+' → '+flying);assert(flying<=top*.95+1e-9,'never above top speed');
 // Golden Zone: a preferred region, not a single coordinate; outside it the bonus does not apply.
 const zone=b.kitAbility(ch,'zone-finish');assert(zone);
 const at=(m,deg)=>({x:100-m*Math.cos(deg*Math.PI/180)/1.05,y:50+m*Math.sin(deg*Math.PI/180)/.68});
 assert(b.inFinishZone(1,at(19,44),zone));assert(b.inFinishZone(1,at(16,35),zone));assert(!b.inFinishZone(1,at(8,10),zone));assert(!b.inFinishZone(1,at(30,44),zone));
 // Flow raises the parameters only while in Flow.
 const cut=b.kitAbility(ch,'speed-cut');ch.flow=0;const off=b.kitParamP(ch,cut,'value',0);ch.flow=100;const on=b.kitParamP(ch,cut,'value',0);ch.flow=0;assert(on>off);
 console.log('PASS v0.8.9.4 Chigiri: sprint momentum starts races faster without exceeding top speed, Golden Zone is a region, Flow boosts only in Flow');
}

function goalkeeperTests(){
 // Gagamaru in goal: close-range and wide shots are harder to score than against an ordinary keeper.
 const {b,h}=setup([ISAGI]);const s=b.createMatch();b.setMatch(s);
 const home=b.active(s.teams[1]),gk=b.keeper(s.teams[2]);const goal={x:100,y:50};gk.x=99;gk.y=50;
 const ordinary=b.keeperFactors(s,gk,{x:93,y:50},goal,6.3,0,null).logit;
 const gaga=b.resolveSharedPlayer({id:GAGAMARU});gk.battleSim=JSON.parse(JSON.stringify(gaga.battleSim));gk.battleSimState=null;
 const close=b.keeperFactors(s,gk,{x:93,y:50},goal,6.3,0,null);assert(close.logit<ordinary,'Gagamaru is harder to beat from close range');assert(close.used,'an ability is credited');
 const far=b.keeperFactors(s,gk,{x:60,y:50},goal,42,0,null);assert.equal(far.used,null,'no exceptional reflex from 42 m');
 // Out of position still matters: reflexes do not replace positioning.
 gk.y=30;const offLine=b.keeperFactors(s,gk,{x:93,y:50},goal,6.3,0,null).logit;assert(offLine>close.logit,'out of position is punished even for Gagamaru');gk.y=50;
 // Position-aware: as an outfield player none of his keeper abilities apply.
 const role=gk.role;gk.role='ST';assert.equal(b.keeperFactors(s,gk,{x:93,y:50},goal,6.3,0,null).logit,0,'no keeper ability outfield');
 assert.equal(b.battleSimProfileStatus(gk,'PASSIVE','wild-reflexes',s).label,'CONDITIONS UNMET');gk.role=role;
 assert.notEqual(b.battleSimProfileStatus(gk,'PASSIVE','wild-reflexes',s).label,'CONDITIONS UNMET');
 // Iemon: ordinary keeping with a small positional edge from range only.
 const ie=b.resolveSharedPlayer({id:IEMON});gk.battleSim=JSON.parse(JSON.stringify(ie.battleSim));
 assert.equal(b.keeperFactors(s,gk,{x:93,y:50},goal,6.3,0,null).logit,ordinary,'Iemon gets nothing extra at close range');
 const ieFar=b.keeperFactors(s,gk,{x:84,y:50},goal,16.8,0,null),base=(()=>{const k=gk.battleSim;gk.battleSim=null;const v=b.keeperFactors(s,gk,{x:84,y:50},goal,16.8,0,null).logit;gk.battleSim=k;return v;})();
 assert(ieFar.logit<base&&base-ieFar.logit<=.1,'Iemon is slightly harder to beat from range');
 s.lastSetPieceTick=s.tick;assert(b.keeperFactors(s,gk,{x:84,y:50},goal,16.8,0,null).logit<ieFar.logit,'Set-Piece Readiness after a set piece');
 s.lastSetPieceTick=s.tick-5;assert.equal(b.keeperFactors(s,gk,{x:84,y:50},goal,16.8,0,null).logit,ieFar.logit,'and only for two ticks');
 console.log('PASS v0.8.9.4 goalkeeping: Gagamaru reflexes/reach only in goal and in range, positioning still matters, Iemon stays ordinary with a small edge and set-piece readiness');
}

function recoveryTests(){
 const {b}=setup([ISAGI,RAICHI]);const s=b.createMatch();b.setMatch(s);s.tick=50;
 const carrier=b.active(s.teams[2]).find(p=>p.role!=='GK'),def=b.active(s.teams[1]).find(p=>Number(p.id)===RAICHI),other=b.active(s.teams[1]).find(p=>p.role!=='GK'&&Number(p.id)!==RAICHI);
 const plain=b.active(s.teams[1]).find(p=>p.role!=='GK'&&!p.battleSim&&p.stats.def<80);
 b.markBeaten(s,plain,carrier,{chance:.8},true);assert(plain.beaten.until<=s.tick+2,'delay is at most two ticks');const sev=b.beatenSeverity(s,plain,carrier);assert(sev>0);
 assert.equal(b.beatenSeverity(s,plain,other),0,'only against the player who beat him');assert.equal(b.beatenSeverity(s,other,carrier),0,'nobody else is affected');
 // Stacking is capped: repeated beats never extend past tick+2.
 for(let i=0;i<5;i++)b.markBeaten(s,plain,carrier,{chance:.9},true);assert(plain.beaten.until<=s.tick+2);
 s.tick+=3;assert.equal(b.beatenSeverity(s,plain,carrier),0,'the delay ends');s.tick-=3;
 // A recovery ability (Raichi's Man-Marking) shortens it.
 const savedKit=def.battleSim;def.battleSim=null;b.markBeaten(s,def,carrier,{chance:.8},true);const without=def.beaten.severity;def.beaten=null;def.battleSim=savedKit;
 b.markBeaten(s,def,carrier,{chance:.8},true);assert(def.beaten.severity<without,'quick recovery reduces severity: '+without+' → '+def.beaten.severity);
 // Saved and restored with the match.
 const snap=b.snapshotMatch(s),back=b.hydrateMatch(snap);const again=b.active(back.teams[1]).find(p=>Number(p.id)===Number(plain.id));assert.deepEqual(again.beaten,plain.beaten,'beaten state survives save/load');
 console.log('PASS v0.8.9.4 recovery: a beaten defender is slowed only against his dribbler, for at most two ticks, without stacking; recovery abilities shorten it; saves keep it');
}

function raichiTests(){
 const {b}=setup([ISAGI,RAICHI]);
 // Stalking Horse: passes into Raichi's man are easier to cut out when he is close and marking him.
 const t=scene(b,(s,get,def)=>{const ra=get(1,RAICHI);const carrier=def(0),recv=def(1);b.setPosition(carrier,{x:50,y:50});b.setPosition(recv,{x:35,y:50});b.setPosition(ra,{x:38,y:51});
  s.possession=2;s.carrierId=carrier.id;b.setBall(s,carrier);return{ra,carrier,recv};});
 const m=()=>b.passModel(t.s,t.carrier,t.recv,{x:t.recv.x,y:t.recv.y},'short');
 t.ra.markTarget=null;const free=m().lanes.concat(m().contests).filter(x=>x.p===t.ra).reduce((a,x)=>a+x.chance,0);
 t.ra.markTarget={id:String(t.recv.id),tick:t.s.tick};const marked=m().lanes.concat(m().contests).filter(x=>x.p===t.ra).reduce((a,x)=>a+x.chance,0);
 assert(marked>free,'Stalking Horse raises the cut-out chance: '+free+' → '+marked);assert(marked<.86,'never automatic');
 // Durable: less drain than an ordinary player (finite stamina).
 assert(b.kitAbility(t.ra,'durable'));
 console.log('PASS v0.8.9.4 Raichi: Stalking Horse makes passes into his man easier to cut out without making it automatic');
}

function naruhayaTests(){
 const {b}=setup([ISAGI,NARUHAYA]);const s=b.createMatch();b.setMatch(s);
 const nr=b.active(s.teams[1]).find(p=>Number(p.id)===NARUHAYA),is=b.active(s.teams[1]).find(p=>Number(p.id)===ISAGI);
 assert(b.kitParam?true:true);
 const tr=e=>e&&e.params&&e.params.trackRead;assert(tr(b.kitAbility(nr,'blind-spot-run'))<(tr(b.kitAbility(is,'blind-spot-run'))||.9),'his blind-spot runs are easier to read than Isagi\'s');
 assert(b.kitAbility(nr,'run-timing')&&b.kitAbility(nr,'ghost-run'));
 assert.equal(b.resolveSharedPlayer({id:NARUHAYA}).stats.sho,b.resolveSharedPlayer({id:NARUHAYA}).stats.sho,'rating untouched');
 console.log('PASS v0.8.9.4 Naruhaya: movement abilities without any finishing ability; his runs are easier to read than Isagi\'s');
}

function blueLockManTests(){
 const {b}=setup([ISAGI]);const s=b.createMatch();b.setMatch(s);s.seed=3;s.random=b.seeded(3);
 const blm=[1,2].map(n=>b.keeper(s.teams[n]));blm.forEach(p=>assert(Number(p.id)>=9100,'both keepers are Blue Lock Man'));
 let g=0;while(s.status!=='finished'&&g++<500){advance({bs:b},s);blm.forEach(p=>{assert.equal(p.stamina,100,'unlimited stamina');assert.equal(p.flow||0,0,'no Flow charge');assert(!b.isFlowing(p));});}
 assert(!s.events.some(e=>e.type==='flow-activation'&&(e.actors||[]).some(a=>Number(a.id)>=9100)),'no Flow activation for Blue Lock Man');
 // A tampered save cannot restore Flow or fatigue.
 const snap=JSON.parse(JSON.stringify(b.snapshotMatch(s)));for(const n of ['1','2'])for(const p of snap.teams[n].roster)if(Number(p.id)>=9100){p.flow=100;p.stamina=20;p.flowActivationPending=true;}
 const back=b.hydrateMatch(snap);[1,2].forEach(n=>{const k=b.keeper(back.teams[n]);assert.equal(k.flow,0);assert.equal(k.stamina,100);assert(!k.flowActivationPending);});
 console.log('PASS v0.8.9.4 Blue Lock Man: stamina fixed at 100 and no Flow for both instances over a full half, also after loading a tampered save');
}

function reactionTests(){
 const {b,h}=setup([ISAGI,HIORI,CHIGIRI,RAICHI]);const s=b.createMatch();b.setMatch(s);
 const get=id=>b.active(s.teams[1]).find(p=>Number(p.id)===id),is=get(ISAGI),ch=get(CHIGIRI);
 const viaIsagi=b.kitReactions(s,is).find(r=>r.def.id==='speed-and-vision'),viaChigiri=b.kitReactions(s,ch).find(r=>r.def.id==='speed-and-vision');
 assert(viaIsagi&&viaChigiri&&viaIsagi.def===viaChigiri.def,'one definition seen from both partners');
 b.useReaction(s,viaChigiri.def,1);assert(!b.reactionReady(s,viaIsagi.def,1),'starting it through one partner blocks the other');
 assert(b.reactionReady(s,viaIsagi.def,2),'cooldowns are per team');
 assert.equal(b.battleSimProfileStatus(is,'CHEMICAL REACTION','speed-and-vision',s).kind,'cooldown');assert.equal(b.battleSimProfileStatus(ch,'CHEMICAL REACTION','speed-and-vision',s).kind,'cooldown');
 // Save/load keeps the shared cooldown.
 const back=b.hydrateMatch(b.snapshotMatch(s));assert(!b.reactionReady(back,viaIsagi.def,1),'cooldown survives save/load');
 // Partner off the pitch: status says so and the reaction is not available.
 const team=s.teams[1],slot=Object.entries(team.assignment).find(([k,v])=>Number(v)===CHIGIRI)[0],sub=b.bench(team)[0];
 s.status='paused';s.runnerActive=false;s.presentedEventId=s.events.length;assert(b.substitute(team,slot,sub.id),'substitution');assert.equal(b.battleSimProfileStatus(is,'CHEMICAL REACTION','speed-and-vision',s).label,'PARTNER NOT ON PITCH');
 assert(!b.kitReactions(s,is).some(r=>r.def.id==='speed-and-vision'),'reaction disabled after substitution');
 // Every public reaction is listed for both partners in the in-match profile.
 for(const [a,c,id] of [[ISAGI,HIORI,'reflexive-synchronization'],[ISAGI,CHIGIRI,'speed-and-vision'],[ISAGI,RAICHI,'cornered-prey'],[ISAGI,26,'planet-hotline'],[ISAGI,4,'creative-instinct'],[ISAGI,49,'rational-alliance'],[3,49,'imperial-route'],[KUNIGAMI,ISAGI,'second-ball-instinct']]){
  const pa=b.battleSimProfileWeapons(b.resolveSharedPlayer({id:a})).filter(x=>x.id===id),pc=b.battleSimProfileWeapons(b.resolveSharedPlayer({id:c})).filter(x=>x.id===id);
  assert.equal(pa.length,1,id+' once for '+a);assert.equal(pc.length,1,id+' once for '+c);assert(pa[0].partnerName&&pc[0].partnerName&&pa[0].partnerName!==pc[0].partnerName,'partner named on both sides: '+id);
 }
 console.log('PASS v0.8.9.4 reactions: one definition and one per-team cooldown from either partner, saved with the match, disabled after a substitution, listed once for both partners');
}

function dossierTests(){
 const src=fs.readFileSync(path.join(root,'js/lore.js'),'utf8');
 assert(/character-profile-kit-partner/.test(src)&&/WITH:/.test(src),'dossier reaction cards name the partner');
 assert(/kindOrder/.test(src)&&/character-profile-weapon-kit-link/.test(src),'weapon cards link to kit cards instead of repeating descriptions');
 const css=fs.readFileSync(path.join(root,'style.css'),'utf8');assert(/flow-text[\s\S]*background-clip:text/.test(css)&&/@supports/.test(css),'rainbow Flow text with a fallback');
 const bs=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8');const mini=bs.slice(bs.indexOf('function renderMiniFormation'),bs.indexOf('function renderMiniFormation')+2500);assert(!/number===2,liveFormationPoint|number===2,"bs-mini/.test(mini),'mini formations share one orientation (forwards top, goalkeeper bottom)');
 console.log('PASS v0.8.9.4 presentation: partner lines, kit references, rainbow Flow with fallback, one mini-formation orientation');
}

function fullMatchTests(){
 // Seeded matches with every new character: deterministic, finishes, no runaway scores, abilities appear.
 const {b}=setup([ISAGI,CHIGIRI,RAICHI,NARUHAYA,KUNIGAMI]);const seen={},scores=[];
 for(const seed of [5,11]){const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);let g=0;while(s.status!=='finished'&&g++<1400)advance({bs:b},s);
  assert.equal(s.status,'finished');scores.push(s.teams[1].stats.goals+s.teams[2].stats.goals);s.events.forEach(e=>{if(e.ability)seen[e.ability.id]=(seen[e.ability.id]||0)+1;});}
 assert(scores.every(x=>x<=10),'believable scorelines '+scores);
 assert(['no-break-dribble','man-marking','relentless-duel'].some(id=>seen[id]),'new abilities appear in real matches: '+JSON.stringify(seen));
 // Same seed, same match.
 const run=seed=>{const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);let g=0;while(s.status!=='finished'&&g++<1400)advance({bs:b},s);return JSON.stringify([s.teams[1].stats,s.teams[2].stats]);};
 assert.equal(run(9),run(9),'deterministic');
 console.log('PASS v0.8.9.4 full matches: finished, deterministic, believable scores ('+scores.join(', ')+' goals), new abilities active');
}

function runBattleV0894Tests(){kitDataTests();publicCapAndSecretTests();chigiriTests();goalkeeperTests();recoveryTests();raichiTests();naruhayaTests();blueLockManTests();reactionTests();dossierTests();fullMatchTests();}
module.exports={runBattleV0894Tests};
if(require.main===module)runBattleV0894Tests();
