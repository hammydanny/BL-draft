#!/usr/bin/env node
'use strict';
// v0.8.9.1 Battle Sim: five character kits (Kira, Noa, Bachira, Igarashi, Kunigami), the shared
// mechanics behind them, the reaction registry, crosses/cut-backs and full-match integration.
const assert=require('node:assert/strict');
const {setup,scene}=require('./battle-v089-tests.js');
const {advance}=require('./battle-presentation-tests.js');
const ISAGI=1,KIRA=2,NOA=3,BACHIRA=4,IGARASHI=5,KUNIGAMI=6,KURONA=26,KAISER=49,SHIDO=31;
const seq=values=>{let i=0;return()=>values[Math.min(i++,values.length-1)];};
const stripKit=p=>{const kit=p.battleSim;p.battleSim=null;return()=>{p.battleSim=kit;};};

function frameworkTests(){
 const {b}=setup([ISAGI,BACHIRA,KUNIGAMI,NOA,KAISER]);
 const s=b.createMatch();b.setMatch(s);const get=id=>b.active(s.teams[1]).find(p=>Number(p.id)===id);
 // One authoritative identity per reaction, whichever member's kit declares it.
 const isg=get(ISAGI),ba=get(BACHIRA);
 const viaIsagi=b.kitReactions(s,isg).filter(r=>r.def.id==='creative-instinct'),viaBachira=b.kitReactions(s,ba).filter(r=>r.def.id==='creative-instinct');
 assert.equal(viaIsagi.length,1,'Isagi sees the reaction declared in Bachira\'s kit');assert.equal(viaBachira.length,1);
 assert.equal(viaIsagi[0].owner,isg,'members decide roles, not the declaring kit');
 const copy=JSON.parse(JSON.stringify(ba.battleSim.reactions[0]));isg.battleSim={...isg.battleSim,reactions:[...isg.battleSim.reactions,copy]};
 assert.equal(b.kitReactions(s,isg).filter(r=>r.def.id==='creative-instinct').length,1,'a duplicate declaration does not create a second identity or cooldown');
 // Flow boosts parameters through the kit's flow-state entry only while in Flow.
 const ku=get(KUNIGAMI),pw=b.kitAbility(ku,'power-shot');ku.flow=0;const off=b.kitParamP(ku,pw,'technique',0);ku.flow=100;const on=b.kitParamP(ku,pw,'technique',0);ku.flow=0;
 assert(on>off,'Physical Breakthrough raises Power Shot in Flow only: '+off+' → '+on);
 // Every kit entry has an effect the engine handles, a translated label and no stat multipliers.
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/i18n/battle-messages.js'),'utf8'),ctx);
 const M=ctx.window.BLD_BATTLE_MESSAGES,handled=new Set(['space-reading','blind-spot-run','tactical-memory','first-time-finish','weak-foot-finish','disguised-finish','feint-volley','support-movement','pride','controlled-finish','flow-state','rational-decisions','ambidextrous','decoy-run','power-dribble','switch-foot-finish','isolation-hunter','free-spirit','creative-dribble','disruption-pass','post-dribble-finish','dribble-chain','persistent-press','contact-read','foul-drawing','right-side-trap','physical-shield','durable','power-shot','rebound-volley','man-marking','synchronized-through','wall-pass','exploit-disruption','rival-cooperation','second-ball']);
 for(const id of [ISAGI,KIRA,NOA,BACHIRA,IGARASHI,KUNIGAMI]){const kit=b.resolveSharedPlayer({id}).battleSim;assert(kit,'kit for '+id);
  const entries=['passives','weapons','ultimates','reactions'].flatMap(g=>kit[g]||[]);
  entries.forEach(e=>{(e.effects||[e.effect]).forEach(x=>assert(handled.has(x),'handled effect '+x));assert(M[e.label],'translated label '+e.label);});
  assert(!/statBonuses|statMultipliers/.test(JSON.stringify(kit)),'no stat multipliers in kit '+id);
  Object.values(kit.dialogue||{}).flat().forEach(line=>assert(M[line]&&Object.keys(M[line]).length>=10,'translated line: '+line));}
 // Ratings, positions and chemistry are untouched.
 const ratings={2:{ovr:79,off:83,sho:84,spd:79,def:60,pas:77,dri:80,gk:43},3:{ovr:98,off:99,sho:98,spd:94,def:84,pas:91,dri:94,gk:66},4:{ovr:93,off:95,sho:88,spd:84,def:68,pas:88,dri:95,gk:51},5:{ovr:69,off:67,sho:65,spd:68,def:77,pas:66,dri:65,gk:54},6:{ovr:90,off:91,sho:95,spd:87,def:86,pas:75,dri:79,gk:58}};
 for(const [id,r] of Object.entries(ratings))assert.deepEqual({...b.resolveSharedPlayer({id:Number(id)}).stats},r,'ratings unchanged for '+id);
 console.log('PASS v0.8.9.1 framework: one reaction identity from either kit, Flow boosts via kit data, all effects handled, labels and lines translated, ratings unchanged');
}

function kiraTests(){
 const {b}=setup([KIRA,ISAGI]);
 // Composed Forward: offers a close option to an isolated carrier; Isagi (no such kit entry) does not.
 const t=scene(b,(s,get,def)=>{const c=b.active(s.teams[1]).find(p=>p.role!=='GK'&&![KIRA,ISAGI].includes(Number(p.id))),k=get(1,KIRA),i=get(1,ISAGI);
  b.setPosition(c,{x:60,y:50});b.setPosition(k,{x:62,y:20});b.setPosition(i,{x:62,y:80});
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,n)=>b.setPosition(p,{x:80+n*.5,y:10+n*8}));return {carrier:c,kira:k,isagi:i};});
 b.updateIntents(t.s);assert(t.kira.intent&&t.kira.intent.type==='support','Kira offers support');assert(!(t.isagi.intent&&t.isagi.intent.type==='support'),'support is Kira\'s trait, not everyone\'s');
 assert(b.distance(t.kira.intent.target,t.carrier)<=14.5,'the support spot is a close option');
 // Striker's Pride: off when level early on, on when trailing; it raises his shot appetite, not his accuracy.
 const s=t.s;s.tick=5;s.score={1:0,2:0};assert.equal(b.prideActive(s,t.kira),null,'not at the start');s.score={1:0,2:1};assert(b.prideActive(s,t.kira),'when trailing');
 b.setPosition(t.kira,{x:80,y:46});s.carrierId=t.kira.id;b.setBall(s,t.kira);
 const shotValue=()=>b.shotModel(s,t.kira,false,null,null).goalChance;
 s.score={1:0,2:0};const level=shotValue();s.score={1:0,2:1};assert.equal(shotValue(),level,'Pride never changes the shot\'s chance');
 // Ace's Finish: after a reception inside 16 m with nobody within 2 m.
 const ace=(pos,tight)=>{const x=scene(b,(s,get,def)=>{const k=get(1,KIRA),c=get(1,ISAGI);b.setPosition(c,{x:80,y:30});b.setPosition(k,pos);if(tight)b.setPosition(def(0),{x:pos.x+1,y:pos.y+1});
  s.lastReception={playerId:String(k.id),teamNumber:1,passerId:String(c.id),tick:s.tick-1,kind:'short',through:false,from:{x:80,y:30},to:pos};return {carrier:k};});return b.shotTechniques(x.s,x.carrier).some(q=>q.id==='aces-finish');};
 assert(ace({x:88,y:50},false),'Ace\'s Finish after a settled reception in the box');assert(!ace({x:88,y:50},true),'not with a defender on him');assert(!ace({x:78,y:50},false),'not from 22 m');
 const kit=b.resolveSharedPlayer({id:KIRA});assert(['passives','weapons','ultimates'].every(g=>(kit.battleSim[g]||[]).every(e=>e.interpretation||e.id==='composed-forward')),'Kira\'s kit is marked as gameplay interpretation');
 assert.equal((kit.weapons||[]).length,0,'no invented weapons added to his permanent database');
 console.log('PASS v0.8.9.1 Kira: support option for isolated carriers, Striker\'s Pride contextual (no accuracy change), Ace\'s Finish only in its window, modest kit, database untouched');
}

function noaTests(){
 const {b}=setup([NOA,KAISER,KUNIGAMI,ISAGI]);
 // Ambidexterity: the other-foot near-post option on any shot at no cost; Kunigami pays a little; Isagi only first-time.
 const t=scene(b,(s,get,def)=>{const n=get(1,NOA),k=get(1,KUNIGAMI),i=get(1,ISAGI);b.setPosition(n,{x:84,y:40});b.setPosition(k,{x:84,y:60});b.setPosition(i,{x:84,y:50});return {carrier:n,ku:k,is:i};});
 const nNear=b.shotTechniques(t.s,t.carrier).find(q=>q.ability&&q.ability.id==='perfect-ambidexterity'),kNear=b.shotTechniques(t.s,t.ku).find(q=>q.ability&&q.ability.id==='ambidextrous-finishing');
 assert(nNear&&kNear&&nNear.aimSide==='near'&&nNear.logit===0&&kNear.logit<0,'Noa has no weaker foot; Kunigami pays a small cost');
 assert(!b.shotTechniques(t.s,t.is).some(q=>q.aimSide==='near'),'Isagi\'s left foot is a first-time technique only');
 // Machine Dribble: longer, straight carries only; protection helps but defenders still win some.
 const d=scene(b,(s,get,def)=>{const n=get(1,NOA);b.setPosition(n,{x:60,y:50});b.setPosition(def(0),{x:64,y:50});return {carrier:n};});
 const opts=b.dribbleOptions(d.s,d.carrier),stride=b.dribbleMeters(d.carrier);
 assert(opts.every(o=>b.distance(o.end,d.carrier)>stride*1.1),'longer strides than an ordinary carry');assert(opts.every(o=>!o.sharp),'no sharp cuts');
 const engaged=opts.filter(o=>o.model.def);assert(engaged.length&&engaged.every(o=>o.model.chance<1),'defenders keep a real chance');
 const restore=stripKit(d.carrier),plain=b.dribbleOptions(d.s,d.carrier).find(o=>o.model.def);restore();const mine=b.dribbleOptions(d.s,d.carrier).find(o=>o.model.def);
 assert(plain&&mine&&mine.model.chance>plain.model.chance,'ball protection matters in the duel');
 // Two-Footed Execution: a defender committed to one side is beaten with the other foot; the keeper still matters.
 const e=scene(b,(s,get,def)=>{const n=get(1,NOA);b.setPosition(n,{x:86,y:40});b.setPosition(def(0),{x:88,y:42.5});return {carrier:n};});
 const sw=b.shotTechniques(e.s,e.carrier).find(q=>q.id==='two-footed-execution');assert(sw&&sw.ignoreId,'two-footed finish available past the committed defender');
 const gk=b.keeper(e.s.teams[2]),before=gk.stats.gk,c1=b.shotModel(e.s,e.carrier,false,null,null,null,null,sw).goalChance;gk.stats.gk=99;const c2=b.shotModel(e.s,e.carrier,false,null,null,null,null,sw).goalChance;gk.stats.gk=before;
 assert(c1<.95&&c2<c1,'the goalkeeper still contests it');
 // Rational Football: with the same options he picks the best one more consistently.
 const r=scene(b,(s,get,def)=>{const n=get(1,NOA);b.setPosition(n,{x:50,y:50});const mates=b.active(s.teams[1]).filter(p=>p.role!=='GK'&&p!==n).slice(0,4);[[58,38],[58.4,62],[57,30],[57.6,70]].forEach((q,i)=>b.setPosition(mates[i],{x:q[0],y:q[1]}));
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:66+(i%3)*4,y:10+i*8}));return {carrier:n};});
 // Same options either way: only the rational-decisions entry is removed for the comparison.
 const top=()=>{const counts={};for(let i=1;i<=300;i++){r.s.random=b.seeded(i*17);const a=b.chooseAction(r.s,r.carrier);const k=a.type+':'+(a.option?a.option.receiver.id:'')+':'+(a.end?a.end.x.toFixed(2)+','+a.end.y.toFixed(2):'');counts[k]=counts[k]||{n:0,v:a.value};counts[k].n++;}
  const best=Object.values(counts).sort((x,y)=>y.v-x.v)[0];return best.n;};
 const withKit=top(),full=r.carrier.battleSim;r.carrier.battleSim={...full,passives:full.passives.filter(e=>e.effect!=='rational-decisions')};const withoutKit=top();r.carrier.battleSim=full;
 assert(withKit>withoutKit,'Rational Football chooses the best option more often: '+withKit+' vs '+withoutKit+' of 300');
 // Imperial Route: Kaiser on the ball sets Noa off on a run; one shared reaction identity.
 const k=scene(b,(s,get,def)=>{const ka=get(1,KAISER),n=get(1,NOA);b.setPosition(ka,{x:62,y:40});b.setPosition(n,{x:70,y:60});
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,i<4?{x:75,y:14+i*22}:{x:60+i,y:10+(i-4)*12}));return {carrier:ka,noa:n};});
 b.updateIntents(k.s);assert(k.noa.intent&&k.noa.intent.type==='run','Noa makes a run when Kaiser has the ball');
 console.log('PASS v0.8.9.1 Noa: no weaker foot (Kunigami pays, Isagi first-time only), straight economical carries with real counterplay, Two-Footed Execution vs committed defenders, Rational Football '+withKit+' vs '+withoutKit+' best picks, Imperial Route run');
}

function bachiraTests(){
 const {b}=setup([BACHIRA,ISAGI]);
 // Creative Dribbling: sharp cuts exist; feints make a poor reader hesitate, an elite reader barely.
 const poor=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),d=b.active(s.teams[2]).filter(p=>p.role!=='GK').sort((x,y)=>x.stats.def-y.stats.def)[0];b.setPosition(ba,{x:60,y:50});b.setPosition(d,{x:62.5,y:50});return {carrier:ba,d};});
 const opts=b.dribbleOptions(poor.s,poor.carrier);assert(opts.some(o=>o.sharp),'sharp cuts are real directional options');
 const hesPoor=Math.max(...opts.filter(o=>o.model.def===poor.d).map(o=>o.model.hesitation));
 const elite=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),d=b.active(s.teams[2]).filter(p=>p.role!=='GK').sort((x,y)=>y.stats.def-x.stats.def)[0];b.setPosition(ba,{x:60,y:50});b.setPosition(d,{x:62.5,y:50});return {carrier:ba,d};});
 const hesElite=Math.max(0,...b.dribbleOptions(elite.s,elite.carrier).filter(o=>o.model.def===elite.d).map(o=>o.model.hesitation));
 assert(hesPoor>hesElite,'feints bite on poor readers more than on elite ones: '+hesPoor.toFixed(3)+' vs '+hesElite.toFixed(3));
 assert(opts.filter(o=>o.model.def).every(o=>o.model.chance<1),'creative dribbles can fail');
 // Free Spirit: a lost dribble costs him less caution than an ordinary player.
 const other=b.active(poor.s.teams[1]).find(p=>p.role!=='GK'&&Number(p.id)!==BACHIRA);[poor.carrier,other].forEach(p=>{p.dribbleSlump=2;p.dribbleSlumpTick=poor.s.tick;});
 assert(b.dribbleSlump(poor.s,poor.carrier)<b.dribbleSlump(poor.s,other),'Free Spirit');
 // Bee Shot: straight out of a dribble that beat a defender, within 22 m, then cooldown.
 const bee=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA);b.setPosition(ba,{x:84,y:46});ba.lastDribble={tick:s.tick-1,beaten:String(def(0).id),sharp:true};return {carrier:ba};});
 const shot=b.shotTechniques(bee.s,bee.carrier).find(q=>q.id==='bee-shot');assert(shot&&shot.ignoreId,'Bee Shot after beating a defender');
 bee.s.random=()=>.99;b.resolveShot(bee.s,bee.carrier,false,null,shot);bee.carrier.lastDribble={tick:bee.s.tick-1,beaten:null};b.setPosition(bee.carrier,{x:84,y:46});
 assert(!b.shotTechniques(bee.s,bee.carrier).some(q=>q.id==='bee-shot'),'Bee Shot cooldown');
 const noDribble=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA);b.setPosition(ba,{x:84,y:46});return {carrier:ba};});assert(!b.shotTechniques(noDribble.s,noDribble.carrier).some(q=>q.id==='bee-shot'),'no Bee Shot without a dribble');
 // Ginga × Monster: in Flow a beaten defender can be followed by further real dribbles; not outside Flow.
 const chain=flow=>{const x=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA);b.setPosition(ba,{x:55,y:50});b.setPosition(def(0),{x:57.5,y:50});b.setPosition(def(1),{x:63,y:52});b.setPosition(def(2),{x:69,y:48});ba.flow=flow?100:0;return {carrier:ba};});
  x.s.random=()=>.01;const n0=x.s.events.length;b.resolveDribble(x.s,x.carrier,{});return x.s.events.slice(n0).filter(e=>e.type==='dribble').length;};
 assert(chain(true)>=2,'Ginga × Monster chains real dribbles in Flow');assert.equal(chain(false),1,'one dribble per action outside Flow');
 // Creative Passing: straight after a dribble the opened space is used and labelled.
 const cp=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),i=get(1,ISAGI);b.setPosition(ba,{x:62,y:50});b.setPosition(i,{x:70,y:40});i.intent={type:'run',target:{x:72,y:40},until:s.tick+3,primed:true,dir:{x:1,y:0}};ba.lastDribble={tick:s.tick-1,beaten:null};
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,n)=>b.setPosition(p,n<4?{x:76,y:20+n*15}:{x:96-n*.3,y:n%2?6:94}));return {carrier:ba,isg:i};});
 assert(b.passOptions(cp.s,cp.carrier).some(o=>o.creative),'Creative Passing marks the options into the opened space');
 // Creative Instinct: one beaten defender can be enough when real space opens.
 const ci=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),i=get(1,ISAGI);b.setPosition(ba,{x:70,y:60});b.setPosition(i,{x:72,y:38});b.setPosition(def(0),{x:71,y:61});return {carrier:ba,isg:i};});
 b.afterDribble(ci.s,ci.carrier,ci.s.teams[2].roster.find(p=>p.id===b.active(ci.s.teams[2]).filter(q=>q.role!=='GK')[0].id));
 assert(ci.isg.intent&&ci.isg.intent.reaction==='creative-instinct','Isagi reads the space after one beaten defender');
 console.log('PASS v0.8.9.1 Bachira: sharp cuts, feints '+hesPoor.toFixed(2)+' vs elite '+hesElite.toFixed(2)+', failures possible, Free Spirit, Bee Shot with cooldown, Ginga × Monster chains only in Flow, Creative Passing, Creative Instinct after one beaten defender');
}

function igarashiTests(){
 const {b}=setup([IGARASHI]);
 const at=(pos,defPick)=>scene(b,(s,get,def)=>{const ig=get(1,IGARASHI),d=defPick(b.active(s.teams[2]).filter(p=>p.role!=='GK'));b.setPosition(ig,{x:70,y:50});b.setPosition(d,pos);d.lastMove={x:0,y:0};return {carrier:ig,d};});
 const weak=list=>list.slice().sort((x,y)=>x.stats.def-y.stats.def)[0],strong=list=>list.slice().sort((x,y)=>y.stats.def-x.stats.def)[0];
 assert.equal(b.maliciaRead(at({x:80,y:50},weak).s,at({x:80,y:50},weak).carrier),null,'no Malicia without a defender close by');
 const behind=at({x:68,y:50},weak),front=at({x:72,y:50},weak),rb=b.maliciaRead(behind.s,behind.carrier),rf=b.maliciaRead(front.s,front.carrier);
 assert(rb&&rf&&rb.foul>rf.foul,'a challenge from behind is likelier to be a foul: '+rb.foul.toFixed(2)+' vs '+rf.foul.toFixed(2));
 const disciplined=at({x:68,y:50},strong),rd=b.maliciaRead(disciplined.s,disciplined.carrier);assert(rd.foul<rb.foul,'disciplined defenders rarely bite');
 assert(rb.foul<1&&rb.lose>0&&rb.dive>0,'no foul is guaranteed; losing the ball and a booking are possible');
 const outcomes={};for(let seed=1;seed<=200;seed++){const t=at({x:68,y:50},weak);t.s.random=b.seeded(seed);const r=b.maliciaRead(t.s,t.carrier);const n0=t.s.events.length;b.resolveMalicia(t.s,t.carrier,r);
  const e=t.s.events.slice(n0)[0];const k=e.type==='foul'?'foul':e.type==='yellow-card'?'booked':e.type==='turnover'?'lost':'kept';outcomes[k]=(outcomes[k]||0)+1;
  if(k==='foul')assert.equal(t.s.pending&&t.s.pending.type,'free-kick','a won foul gives his team the set piece');}
 ['foul','kept','lost','booked'].forEach(k=>assert(outcomes[k]>0,'Malicia outcome occurs: '+k+' '+JSON.stringify(outcomes)));
 console.log('PASS v0.8.9.1 Igarashi: Malicia needs a close defender, angle and discipline matter ('+rb.foul.toFixed(2)+' behind / '+rf.foul.toFixed(2)+' front / '+rd.foul.toFixed(2)+' disciplined), outcomes '+JSON.stringify(outcomes)+', won fouls become set pieces');
}

function kunigamiTests(){
 const {b}=setup([KUNIGAMI,ISAGI]);
 // Physical Dominance: a real effect in the duel, never untackleable.
 const d=scene(b,(s,get,def)=>{const k=get(1,KUNIGAMI);b.setPosition(k,{x:60,y:50});b.setPosition(def(0),{x:62.5,y:50});return {carrier:k};});
 const mine=b.dribbleOptions(d.s,d.carrier).find(o=>o.model.def);const undo=stripKit(d.carrier);const plain=b.dribbleOptions(d.s,d.carrier).find(o=>o.model.def);undo();
 assert(mine&&plain&&mine.model.chance>plain.model.chance&&mine.model.chance<1,'shielding changes the duel without guaranteeing it');
 // Power Shot: only from range, scaled by distance, and more saves become parries.
 const ps=metres=>{const x=scene(b,(s,get,def)=>{const k=get(1,KUNIGAMI);b.setPosition(k,{x:99-metres/1.05,y:50});return {carrier:k};});return b.shotTechniques(x.s,x.carrier).find(q=>q.id==='power-shot');};
 assert(!ps(10),'no Power Shot from close range');const p20=ps(20),p28=ps(28);assert(p20&&p28&&p28.logit>p20.logit&&p28.parry>0,'Power Shot scales with distance and creates parries');assert(!ps(36),'not beyond its range');
 // Rush Volley: only if he physically reaches the parried ball first; he is never moved further than he can run.
 const rebound=(kPos,shooterId)=>{const x=scene(b,(s,get,def)=>{const k=get(1,KUNIGAMI),i=get(1,ISAGI);b.setPosition(i,{x:84,y:40});b.setPosition(k,kPos);return {k,i};});
  const loose={x:91,y:50};const win=b.reboundRace(x.s,loose,1,shooterId===ISAGI?x.i:x.k);return {win,x};};
 const near=rebound({x:88,y:52},ISAGI);assert.equal(near.win.p,near.x.k,'close to the rebound, he gets there first');assert(near.win.rx&&near.win.rx.def.id==='second-ball-instinct','after an Isagi shot the reaction applies');
 const far=rebound({x:55,y:52},ISAGI);assert.notEqual(far.win&&far.win.p,far.x.k,'far away, he cannot reach it');
 // Man-marking: he picks up Shidou and stays tight, goal-side.
 const {b:b2}=setup([KUNIGAMI]);const m=b2.createMatch();b2.setMatch(m);
 const ku=b2.active(m.teams[1]).find(p=>Number(p.id)===KUNIGAMI),shidoTeam=m.teams[2],sh=b2.active(shidoTeam).find(p=>p.role!=='GK');
 // The named rival (Shidou, id 31) is data; here an opponent stands in for him so the lineup stays valid.
 const mm=b2.kitAbility(ku,'man-marking');assert.equal(JSON.stringify(mm.params.targets.map(Number)),JSON.stringify([SHIDO]));const saved=mm.params.targets;mm.params.targets=[sh.id];
 b2.setPosition(ku,{x:30,y:50});b2.setPosition(sh,{x:28,y:48});const strongest=b2.active(shidoTeam).filter(p=>p.role!=='GK'&&p!==sh).sort((x,y)=>b2.effective(y,'off')-b2.effective(x,'off'))[0];b2.setPosition(strongest,{x:31,y:52});
 const att=b2.active(shidoTeam).filter(p=>p.role!=='GK'),shape=new Map([[ku.id,{x:30,y:50}]]);
 assert.equal(b2.manMarkTarget(m,ku,att,shape),sh,'Kunigami marks his named rival when he is near, ahead of a stronger attacker');mm.params.targets=saved;
 const fallback=b2.manMarkTarget(m,ku,att,shape),nearby=att.filter(a=>b2.distance({x:30,y:50},a)<18);assert(fallback&&nearby.every(a=>b2.effective(a,'off')<=b2.effective(fallback,'off')),'otherwise the most dangerous nearby attacker');void strongest;
 console.log('PASS v0.8.9.1 Kunigami: shielding '+plain.model.chance.toFixed(2)+'→'+mine.model.chance.toFixed(2)+', Power Shot 16–32 m scaled with parries, Rush Volley only on reachable rebounds (second-ball reaction after Isagi shots), man-marks Shidou');
}

function attackingTests(){
 const {b}=setup([ISAGI,BACHIRA]);
 // Crosses: a wide carrier in the final third can cross into the box for a team-mate; the race decides.
 const x=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),i=get(1,ISAGI);b.setPosition(ba,{x:84,y:10});b.setPosition(i,{x:84,y:46});
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,n)=>b.setPosition(p,n<3?{x:88,y:42+n*6}:{x:70-n,y:20+n*5}));return {carrier:ba,isg:i};});
 const cross=b.passOptions(x.s,x.carrier).find(o=>o.style==='cross'&&o.receiver===x.isg);assert(cross&&cross.through&&cross.kind==='long','a lofted cross into the box is an option');
 const outcomes=new Set();for(let seed=1;seed<=40;seed++){const y=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),i=get(1,ISAGI);b.setPosition(ba,{x:84,y:10});b.setPosition(i,{x:84,y:46});
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,n)=>b.setPosition(p,n<3?{x:86+n,y:36+n*11+(seed%5)}:{x:70-n,y:20+n*5}));return {carrier:ba,isg:i};});
  y.s.random=b.seeded(seed);const o=b.passOptions(y.s,y.carrier).find(q=>q.style==='cross'&&q.receiver===y.isg);if(!o)continue;const n0=y.s.events.length;b.resolvePass(y.s,y.carrier,{option:o});const e=y.s.events.slice(n0).find(q=>q.passRoute||q.type==='offside'||q.type==='save');if(e)outcomes.add(e.type);
  if(e&&e.type==='pass')assert.equal(y.s.lastReception.style,'cross','the reception remembers it was a cross');}
 assert(outcomes.has('pass')&&outcomes.size>=2,'crosses are met and also cleared/claimed: '+[...outcomes]);
 // A cross met first-time is a header or volley, not a settled shot.
 const h=scene(b,(s,get,def)=>{const i=get(1,ISAGI);b.setPosition(i,{x:92,y:48});s.lastReception={playerId:String(i.id),teamNumber:1,passerId:String(get(1,BACHIRA).id),tick:s.tick-1,kind:'long',through:true,style:'cross',from:{x:84,y:10},to:{x:92,y:48}};return {carrier:i};});
 assert(b.shotTechniques(h.s,h.carrier).some(q=>q.id==='header'),'header option after a cross');
 // Cut-back: near the byline, a ground pass back to a team-mate arriving behind the defenders.
 const c=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),i=get(1,ISAGI);b.setPosition(ba,{x:96,y:30});b.setPosition(i,{x:86,y:48});return {carrier:ba,isg:i};});
 assert(b.passOptions(c.s,c.carrier).some(o=>o.style==='cutback'&&o.receiver===c.isg&&!o.through),'cut-back option');
 // Box occupation: with the ball wide in the final third and a deep line, forwards attack box spots.
 const box=scene(b,(s,get,def)=>{const ba=get(1,BACHIRA),i=get(1,ISAGI);b.setPosition(ba,{x:86,y:10});b.setPosition(i,{x:75,y:50});
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,n)=>b.setPosition(p,{x:88+(n%3),y:25+n*5}));return {carrier:ba,isg:i};});
 b.updateIntents(box.s);assert(box.isg.intent&&box.isg.intent.type==='run'&&b.distance(box.isg.intent.target,{x:99,y:50})<=20,'Isagi attacks the box');
 console.log('PASS v0.8.9.1 attacking: lofted crosses resolved by the physical race ('+[...outcomes].join('/')+'), headers after crosses, cut-backs, box occupation');
}

function fullMatchTests(){
 const scen={kira:[KIRA],noa:[NOA],bachira:[BACHIRA],igarashi:[IGARASHI],kunigami:[KUNIGAMI],'isagi+bachira':[ISAGI,BACHIRA],'isagi+kunigami':[ISAGI,KUNIGAMI]};
 const report=[],seen={};let ms=0,ticks=0;
 for(const [label,stars] of Object.entries(scen)){const {b}=setup(stars,'4-4-2');let goals=0,shots=0;const chips={};
  for(let seed=1;seed<=3;seed++){const s=b.createMatch();s.seed=seed*11;s.random=b.seeded(s.seed);b.setMatch(s);const t0=process.hrtime.bigint();let g=0;
   while(s.status!=='finished'&&g++<1400)advance({bs:b},s);ms+=Number(process.hrtime.bigint()-t0)/1e6;ticks+=s.tick;assert.equal(s.status,'finished');
   goals+=s.score[1]+s.score[2];shots+=s.teams[1].stats.shots+s.teams[2].stats.shots;
   s.events.forEach(e=>{[e.ability,e.abilityNote,e.reaction].filter(Boolean).forEach(a=>{chips[a.id]=(chips[a.id]||0)+1;seen[a.id]=(seen[a.id]||0)+1;});});
   assert(b.hydrateMatch(JSON.parse(JSON.stringify(b.snapshotMatch(s)))),'match with new kits restores');}
  assert(goals/3<=7,label+': no runaway scoring '+goals/3);report.push(label+' '+(goals/3).toFixed(1)+'g/'+(shots/3).toFixed(0)+'sh '+Object.keys(chips).length+' kinds');}
 // Signature identities must appear in real matches, not only in constructed scenes.
 ['machine-dribble','creative-dribbling','power-shot','physical-dominance'].forEach(id=>assert(seen[id]>0,'appears in full matches: '+id));
 const per=ms/ticks;assert(per<12,'tick cost bounded: '+per.toFixed(2));
 console.log('PASS v0.8.9.1 full matches: '+report.join(', ')+'; labels seen '+JSON.stringify(seen)+'; '+per.toFixed(2)+'ms per tick');
}

function runBattleV0891Tests(){frameworkTests();kiraTests();noaTests();bachiraTests();igarashiTests();kunigamiTests();attackingTests();fullMatchTests();}
module.exports={runBattleV0891Tests};
if(require.main===module)runBattleV0891Tests();
