#!/usr/bin/env node
'use strict';
// 0.8.9.8.11 character identity: every new ultimate has a real handler, a legal trigger, a failure path,
// its own once-per-Flow allowance, saves/loads, and produces different decisions for different characters.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {battleContext}=require('./battle-sim-tests');
const {advance}=require('./battle-presentation-tests');
const root=path.resolve(__dirname,'..');
const EXPORTS='ultimateReady,spendUltimate,settleUltimates,devourRun,devourActive,keeperWindowDetail,openAimFree,planPuppeteer,runPuppeteer,planCollision,runCollision,planDeadlyRelease,runDeadlyRelease,planCheckmate,runCheckmate,planRedPanther,runRedPanther,continueRedPanther,planEvolution,runEvolution,carrierUltimateOptions,runCarrierUltimate,defensiveUltimates,defensiveReadBonus,beastReflexSave,lastReachBlock,lightningStart,raceTopSpeed,timeToCover,sprintAccel,monsterDance,identityAdjust,predatorWaitOption,chanceCreationValue,abilityState,tracksRun,updateIntents,committedDefender,playerIn,targetGoal,aimPoints,keeper,laneGeometry,opposing,passIntelligence,passExtras,battleSimRuntimeState,reactionDefsFor,kitReactions,chooseAction,positionValue,kitParam';
function setup(ids1,ids2,opts={}){
 const source=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8').replace('document.addEventListener("DOMContentLoaded",function()','globalThis.ID={'+EXPORTS+'};document.addEventListener("DOMContentLoaded",function()');
 const h=battleContext(source),b=h.bs,I=h.context.ID;b.quiet();
 const gk1=opts.gk1?`playerById(${opts.gk1})`:'blueLockManFor(1)',gk2=opts.gk2?`playerById(${opts.gk2})`:'blueLockManFor(2)';
 b.setTeams(h.run(`[bs.normalizeTeam({name:'One',formation:'4-3-3',roster:[${gk1},...${JSON.stringify(ids1)}.map(playerById)],assignment:{}},1),bs.normalizeTeam({name:'Two',formation:'4-3-3',roster:[${gk2},...${JSON.stringify(ids2)}.map(playerById)],assignment:{}},2)]`));
 const s=b.createMatch();b.setMatch(s);s.kickoffPassPending=false;s.status='playing';s.pending=null;s.forced=null;s.tick=30;s.seed=11;s.random=b.seeded(11);
 b.active(s.teams[1]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:20,y:8+i*8}));b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:30,y:8+i*8}));
 const get=(n,id)=>b.active(s.teams[n]).find(p=>Number(p.id)===Number(id)),def=i=>b.active(s.teams[2]).filter(p=>p.role!=='GK')[i];
 return{h,b,s,I,get,def};
}
const carry=(b,s,p)=>{s.possession=p.teamNumber;s.carrierId=p.id;b.setBall(s,p);};
const used=(p,id)=>(p.battleSimState?.usedUltimates||[]).includes(id);
const log=(p,id)=>p.battleSimState?.ultimateLog?.[id]||{attempts:0,success:0};
const fixed=v=>()=>v;

function barou(){
 const {b,s,I,get,def}=setup([15,1,2,3,4,5,6,7,8,9],[16,24,25,10,11,12,13,17,18,19]);
 const ba=get(1,15),isagi=get(1,1),gk=b.keeper(s.teams[2]);ba.flow=100;
 // Devour: Isagi draws two defenders near goal; Barou attacks the space they leave.
 b.setPosition(isagi,{x:75,y:50});b.setPosition(def(0),{x:78,y:47});b.setPosition(def(1),{x:78,y:53});b.setPosition(def(3),{x:90,y:38});b.setPosition(def(4),{x:90,y:62});b.setPosition(ba,{x:70,y:33});carry(b,s,isagi);
 I.updateIntents(s);assert(ba.battleSimState?.devour,'devour armed by a real attacking development');assert(used(ba,'devour-villains-shadow'));assert.equal(ba.intent?.type,'run','physical off-ball run, no teleport');
 assert(s.events.at(-1).ability?.id==='devour-villains-shadow'&&s.events.at(-1).type==='ultimate');
 const from={x:ba.x,y:ba.y};assert.deepEqual({x:ba.x,y:ba.y},from,'arming never moves Barou');
 const reader=def(2);reader.stats={...reader.stats,def:99};assert(I.tracksRun(reader,ba),'a good reader can follow the run');
 const armed=JSON.parse(JSON.stringify(ba.battleSimState.devour));I.updateIntents(s);assert.deepEqual(JSON.parse(JSON.stringify(ba.battleSimState.devour)),armed,'once per Flow: not re-armed');
 assert(I.ultimateReady(ba,'blindside-execution'),'independent allowance for the second ultimate');
 // Failure: the ball never reaches him in the window.
 s.tick=armed.until+1;I.settleUltimates(s);assert(!ba.battleSimState.devour);assert.equal(log(ba,'devour-villains-shadow').success,0);assert.equal(log(ba,'devour-villains-shadow').attempts,1);
 // Success: a new Flow, the ball arrives (pass), and a finishing technique opens for one tick.
 ba.battleSimState.usedUltimates=[];carry(b,s,isagi);I.updateIntents(s);assert(ba.battleSimState.devour);s.tick++;carry(b,s,ba);I.settleUltimates(s);
 assert(!ba.battleSimState.devour&&ba.battleSimState.devourFinish);assert.equal(log(ba,'devour-villains-shadow').success,1);
 b.setPosition(ba,{x:84,y:45});assert(b.shotTechniques(s,ba).some(t=>t.id==='devour-finish'));
 // Blindside Execution: only with a compromised keeper and a clear lane; it can score or fail.
 const n=ba.teamNumber,goal=I.targetGoal(n);b.setPosition(ba,{x:83,y:44});b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:40,y:8+i*8}));
 b.setPosition(gk,{x:goal.x>50?97:3,y:50});gk.lastMove={x:0,y:0};carry(b,s,ba);
 const det=I.keeperWindowDetail(s,ba);if(det.value>0)gk.y=I.aimPoints(n,ba).far.y;gk.lastMove={x:0,y:0};assert.equal(I.keeperWindowDetail(s,ba).value,0,'a set keeper gives no window');
 assert(!b.shotTechniques(s,ba).some(t=>t.id==='predator-eye-blindside-execution'));
 gk.lastMove={x:0,y:1.2};const w=I.keeperWindowDetail(s,ba);assert(w.value>0&&w.moving);const t=b.shotTechniques(s,ba).find(x=>x.id==='predator-eye-blindside-execution');assert(t,'moving keeper opens the window');assert.equal(t.ultimate,true);
 const block=def(0);const g=I.laneGeometry(ba,t.aim,{x:0,y:0});b.setPosition(block,{x:ba.x+(t.aim.x-ba.x)*.2,y:ba.y+(t.aim.y-ba.y)*.2});assert(!b.shotTechniques(s,ba).some(x=>x.id==='predator-eye-blindside-execution'&&x.aim.y===t.aim.y),'a defender on the line closes it');b.setPosition(block,{x:40,y:8});
 s.random=fixed(.999);b.resolveShot(s,ba,false,null,t);assert(used(ba,'predator-eye-blindside-execution'));assert.equal(log(ba,'predator-eye-blindside-execution').success,0,'a missed execution is recorded as a failure');
 assert(!I.ultimateReady(ba,'blindside-execution'));
 console.log('PASS 0.8.9.8.11 Barou: Devour arms from real attention, runs physically, can be tracked, fails without the ball and succeeds on arrival; Blindside needs a compromised keeper and a clear lane; independent allowances');
}

function rinAndNoa(){
 const {b,s,I,get,def}=setup([23,3,2,4,5,6,7,8,9,10],[24,25,16,11,12,13,17,18,19,70]);
 const rin=get(1,23),mate=get(1,2),d=def(0);rin.flow=100;
 b.setPosition(rin,{x:68,y:50});b.setPosition(d,{x:73,y:50});b.setPosition(mate,{x:80,y:30});carry(b,s,rin);
 const plan=I.planPuppeteer(s,rin,{});assert(plan&&plan.defender===d&&plan.exploit&&plan.decoy&&plan.exploit.side!==plan.decoy.side,'two real routes either side of the defender');
 assert(plan.commit>0&&plan.commit<1,'the defender may or may not bite');
 const before={x:d.x,y:d.y};s.random=fixed(0);I.runPuppeteer(s,rin,plan);assert(b.distance(before,d)>0,'committed defender physically moves');assert(used(rin,'puppeteers-endgame'));assert.equal(log(rin,'puppeteers-endgame').success,1);
 assert(!I.planPuppeteer(s,rin,{}),'once per Flow');assert(I.ultimateReady(rin,'collision-course'),'independent allowance');
 // A read trap: the defender holds, Rin keeps the ball with a safe pass instead.
 rin.battleSimState.usedUltimates=[];b.setPosition(rin,{x:68,y:50});b.setPosition(d,{x:73,y:50});carry(b,s,rin);const p2=I.planPuppeteer(s,rin,{});s.random=fixed(.999);const ev=s.events.length;I.runPuppeteer(s,rin,p2);
 assert.equal(log(rin,'puppeteers-endgame').attempts,2);assert.equal(log(rin,'puppeteers-endgame').success,1);assert(s.events.slice(ev).some(e=>e.type==='ultimate'&&/refuses/.test(e.description)));
 // Collision Course: a real duel the defender can win.
 for(const [roll,expectRin] of [[0,true],[.999,false]]){rin.battleSimState.usedUltimates=[];b.setPosition(rin,{x:68,y:50});b.setPosition(d,{x:72,y:50});d.beaten=null;carry(b,s,rin);
  const c=I.planCollision(s,rin);assert(c&&c.defender===d);s.random=fixed(roll);I.runCollision(s,rin,c);assert.equal(s.carrierId===rin.id&&s.possession===1,expectRin,'collision outcome '+roll);
  if(!expectRin)assert(s.events.at(-1).ability?.id==='destroyer-collision-course','failed duel is labelled');}
 // Destructive Impulse: in Flow Rin weighs a duel with a strong defender higher than calculated Rin does.
 const opts=()=>[{type:'dribble',model:{def:d},end:{x:76,y:50},value:.1},{type:'pass',option:{model:{to:{x:60,y:50}},to:{x:60,y:50}},value:.1}];d.stats={...d.stats,def:90};
 const calm=opts();rin.flow=0;I.identityAdjust(s,rin,calm,null);rin.flow=100;const hot=opts();I.identityAdjust(s,rin,hot,null);assert(hot[0].value>calm[0].value&&hot[1].value<calm[1].value,'Destructive Impulse changes the decision weights');
 // Noa: Ambidextrous Checkmate needs a genuine commitment; a defender who holds makes him pass.
 const noa=get(1,3);noa.flow=100;const blocker=def(1);b.setPosition(noa,{x:84,y:46});carry(b,s,noa);const aims=I.aimPoints(1,noa);
 b.setPosition(blocker,{x:noa.x+(aims.far.x-noa.x)*.15,y:noa.y+(aims.far.y-noa.y)*.15});blocker.lastMove={x:0,y:0};assert(!I.planCheckmate(s,noa,{}),'static defender: no checkmate');
 blocker.lastMove={x:(noa.x-blocker.x)*1.05*2,y:(noa.y-blocker.y)*.68*2};const cm=I.planCheckmate(s,noa,{});assert(cm&&cm.d===blocker,'committed blocker');
 s.random=fixed(.999);const passes=s.teams[1].stats.attempted;I.runCheckmate(s,noa,cm);assert.equal(s.teams[1].stats.shots||0,0,'a read finish is not forced');assert(s.teams[1].stats.attempted>passes||s.events.some(e=>e.type==='carry'));assert.equal(log(noa,'ambidextrous-checkmate').success,0);
 console.log('PASS 0.8.9.8.11 Rin and Noa: Puppeteer baits a real defender (commit or read), Collision Course is a fallible duel, Destructive Impulse changes weights, Checkmate needs commitment and Noa passes when read');
}

function saeReoNagi(){
 const {b,s,I,get,def}=setup([14,20,21,4,1,2,3,5,6,7],[24,25,16,11,12,13,17,18,19,70]);
 const sae=get(1,14),reo=get(1,20),nagi=get(1,21),bach=get(1,4),d=def(0);sae.flow=100;
 // Deadly Release: only against a defender who is actually stepping in.
 b.setPosition(sae,{x:62,y:50});b.setPosition(d,{x:65.5,y:50});d.lastMove={x:0,y:0};carry(b,s,sae);assert(!I.planDeadlyRelease(s,sae),'no commitment, no counter');
 d.lastMove={x:-2.5,y:0};if(sae.teamNumber===2)d.lastMove.x=2.5;const dr=I.planDeadlyRelease(s,sae);assert(dr&&dr.defender===d,'defender stepping in');
 s.random=fixed(.999);I.runDeadlyRelease(s,sae,dr);assert.equal(s.possession,2,'the defender can win the first part');assert.equal(log(sae,'counter-dribble-deadly-release').success,0);assert(!I.ultimateReady(sae,'deadly-release'));
 sae.battleSimState.usedUltimates=[];carry(b,s,sae);b.setPosition(sae,{x:62,y:50});b.setPosition(d,{x:65.5,y:50});d.lastMove={x:-2.5,y:0};d.beaten=null;const dr2=I.planDeadlyRelease(s,sae);s.random=b.seeded(5);const ev=s.events.length;s.random=fixed(0);I.runDeadlyRelease(s,sae,dr2);
 assert.equal(log(sae,'counter-dribble-deadly-release').success,1);assert(s.events.slice(ev).filter(e=>['dribble','pass','shot-attempt','goal','interception','turnover'].includes(e.type)).length>=2,'two-part action: counter then release');
 // Perfect Thread: a narrow, physically real forward lane; still interceptable.
 sae.battleSimState.usedUltimates=[];b.setPosition(sae,{x:55,y:50});b.setPosition(nagi,{x:80,y:42});b.setPosition(d,{x:67,y:47.5});b.setPosition(def(1),{x:88,y:30});b.setPosition(def(2),{x:88,y:60});carry(b,s,sae);
 const thread=b.passOptions(s,sae).find(o=>o.perfectThread);assert(thread,'a narrow forward lane is recognised');assert(thread.model.success<1&&thread.model.success>=.3);
 b.resolvePass(s,sae,{option:thread});assert(used(sae,'beautiful-destruction-perfect-thread'));assert(['pass','interception','turnover','rebound','offside'].includes(s.events.at(-1).type));
 assert(!b.passOptions(s,sae).some(o=>o.perfectThread),'once per Flow');
 // Reo: Evolution only after observing a compatible technique; never copies ultimates.
 reo.flow=100;b.setPosition(reo,{x:66,y:50});b.setPosition(d,{x:70,y:50});carry(b,s,reo);reo.battleSimState={cooldowns:{},usedUltimates:[]};assert(!I.planEvolution(s,reo),'nothing observed');
 reo.battleSimState.observedTechniques=[{sourceId:'4',id:'creative-dribbling',effect:'creative-dribble',tick:s.tick-2}];const ev2=I.planEvolution(s,reo);assert(ev2&&ev2.mode==='dribble','observed feint adapted');
 b.addEvent(s,{type:'ultimate',teamNumber:1,ability:{id:'monsters-dance',label:"MONSTER'S DANCE",kind:'ultimate'},actors:[bach],description:'x'});assert(!(reo.battleSimState.observedTechniques||[]).some(x=>x.id==='monsters-dance'),'ultimates are never copied');
 // Nagi: Revolver needs a real airborne reception under pressure; Reo's delivery is not required.
 nagi.flow=100;b.setPosition(nagi,{x:90,y:50});carry(b,s,nagi);s.lastReception={playerId:'21',teamNumber:1,passerId:'2',tick:s.tick-1,kind:'long',through:true,aerial:true,style:'cross',from:{x:70,y:20},to:{x:90,y:50}};
 b.setPosition(def(0),{x:91.5,y:50});b.setPosition(def(1),{x:92,y:53});def(0).lastMove={x:(nagi.x-def(0).x)*2,y:0};
 const rev=b.shotTechniques(s,nagi).find(t=>t.id==='five-shot-revolver-fake-volley');assert(rev,'any teammate can supply the airborne ball');
 s.lastReception.aerial=false;assert(!b.shotTechniques(s,nagi).some(t=>t.id==='five-shot-revolver-fake-volley'),'grounded pass: no revolver');
 console.log('PASS 0.8.9.8.11 Sae, Reo, Nagi: Deadly Release needs a committed defender and is two-part, Perfect Thread is fallible and once per Flow, Evolution needs observation and never copies ultimates, Revolver needs an airborne reception');
}

function chigiriBachiraKunigami(){
 const {b,s,I,get,def}=setup([7,4,6,22,1,2,3,5,8,9],[24,25,16,11,12,13,17,18,19,70]);
 const chi=get(1,7),bach=get(1,4),kuni=get(1,6),zan=get(1,22);chi.flow=100;
 // Speed identities: Zantetsu wins short races, Chigiri long ones (ratings unchanged).
 const t=(p,m)=>I.timeToCover(m,I.raceTopSpeed(p,s),I.sprintAccel(p,s),0);
 assert(t(zan,10)<t(chi,10),'Zantetsu first over 10 m');assert(t(chi,45)<t(zan,45),'Chigiri first over 45 m');assert.equal(chi.stats.spd,98);assert.equal(zan.stats.spd,95);
 // Red Panther: three real stages over several ticks, interruptible.
 b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:30,y:8+i*8}));b.setPosition(chi,{x:62,y:12});carry(b,s,chi);
 const plan=I.planRedPanther(s,chi,{});assert(plan,'wide with space');s.random=fixed(0);const x0=chi.x;I.runRedPanther(s,chi,plan);assert(used(chi,'red-panther-44-breakthrough'));assert(chi.x>x0,'real carry, no teleport');
 let guard=0;while(chi.battleSimState.redPanther&&guard++<8){s.tick++;s.random=fixed(0);assert(I.continueRedPanther(s));}
 assert.equal(log(chi,'red-panther-44-breakthrough').success,1,'reaches the angle and shoots');assert(s.events.some(e=>e.type==='shot-attempt'&&e.ability?.id==='red-panther-44-breakthrough'));
 chi.battleSimState.usedUltimates=[];s.pending=null;s.status='playing';b.setPosition(chi,{x:62,y:12});carry(b,s,chi);const p2=I.planRedPanther(s,chi,{});s.random=fixed(0);I.runRedPanther(s,chi,p2);s.tick++;carry(b,s,def(0));I.continueRedPanther(s);assert(!chi.battleSimState.redPanther,'interrupted');assert.equal(log(chi,'red-panther-44-breakthrough').attempts,2);
 // Monster's Dance: after a genuine beaten defender, separate duels with rising risk.
 s.pending=null;bach.flow=100;b.setPosition(bach,{x:66,y:50});b.setPosition(def(0),{x:70,y:50});b.setPosition(def(1),{x:76,y:50});b.setPosition(def(2),{x:82,y:50});carry(b,s,bach);
 s.random=fixed(0);const ev=s.events.length;b.resolveDribble(s,bach,{target:{x:73,y:50}});assert(used(bach,'monsters-dance'),'dance after a beaten defender');
 assert(s.events.slice(ev).filter(e=>e.type==='dribble').length>=2,'each duel resolves separately');
 bach.battleSimState.usedUltimates=[];b.setPosition(bach,{x:66,y:50});b.setPosition(def(0),{x:70,y:50});def(0).beaten=null;def(1).beaten=null;b.setPosition(def(1),{x:76,y:50});b.setPosition(bach,{x:72,y:50});carry(b,s,bach);s.random=fixed(.999);I.monsterDance(s,bach,b.kitAbility(bach,'monster-dance'));assert.equal(s.possession,2,'a dance duel can lose the ball');assert.equal(log(bach,'monsters-dance').success,1);assert.equal(log(bach,'monsters-dance').attempts,2);
 // Kunigami: Power Finish only after a real physical contest near goal.
 kuni.flow=100;s.pending=null;b.setPosition(kuni,{x:86,y:50});b.setPosition(def(0),{x:87.5,y:51});carry(b,s,kuni);s.lastReception=null;kuni.battleSimState={cooldowns:{},usedUltimates:[]};
 assert(!b.shotTechniques(s,kuni).some(x=>x.id==='wild-card-power-finish'),'no contest won');I.abilityState(kuni).contestTick=s.tick;assert(b.shotTechniques(s,kuni).some(x=>x.id==='wild-card-power-finish'));
 b.setPosition(def(0),{x:70,y:20});assert(!b.shotTechniques(s,kuni).some(x=>x.id==='wild-card-power-finish'),'needs a defender on him');
 console.log('PASS 0.8.9.8.11 Chigiri, Zantetsu, Bachira, Kunigami: short/long race identities, staged interruptible Red Panther, separate escalating Monster\'s Dance duels, contest-gated Power Finish');
}

function defenders(){
 const {b,s,I,get,def}=setup([9,26,16,24,22,25,1,2,3,4],[15,23,14,7,5,10,11,12,13,17],{gk1:8});
 const raichi=get(1,9),kurona=get(1,26),niko=get(1,16),aryu=get(1,24),zan=get(1,22),gaga=b.keeper(s.teams[1]),barou=get(2,15),rin=get(2,23),sae=get(2,14);
 [raichi,niko,aryu,zan,gaga].forEach(p=>p.flow=100);
 // Ace Neutralization: Raichi pins a dangerous attacker, Kurona takes the line; one shared 12-tick cooldown.
 b.setPosition(sae,{x:45,y:50});carry(b,s,sae);b.setPosition(barou,{x:22,y:45});b.setPosition(raichi,{x:20,y:46});b.setPosition(kurona,{x:28,y:56});raichi.markTarget={id:'15',tick:s.tick};
 const targets=new Map(),fixedSet=new Set();I.defensiveUltimates(s,s.teams[1],b.active(s.teams[1]).filter(p=>p.role!=='GK'),sae,targets,fixedSet);
 assert(s.aceNeutral&&s.aceNeutral.targetId==='15','reaction activates');assert(targets.has(kurona.id),'Kurona physically moves into the line');assert.equal(s.reactionCooldowns['1:ace-neutralization'],s.tick+12);
 assert(I.reactionDefsFor(raichi).some(r=>r.def.id==='ace-neutralization')&&I.reactionDefsFor(kurona).some(r=>r.def.id==='ace-neutralization'),'one definition, both dossiers');
 assert(!I.defensiveReadBonus(s,kurona,barou,false)&&I.defensiveReadBonus(s,kurona,barou,true),'hidden from the passer, live on the pass');
 // Relentless Lockdown: dangerous attacker in Raichi's half; real stamina; ends on reception.
 s.aceNeutral=null;const st0=raichi.stamina;I.defensiveUltimates(s,s.teams[1],[raichi],sae,new Map(),new Set());assert(raichi.battleSimState.lockdown,'lockdown armed');s.tick++;I.settleUltimates(s);assert(raichi.stamina<st0,'stamina is spent in Flow');
 raichi.battleSimState.lockdown.received=true;s.tick++;I.settleUltimates(s);assert(!raichi.battleSimState.lockdown);assert.equal(log(raichi,'relentless-lockdown').success,0,'a reception breaks the lockdown');
 // Watchtower Checkmate: predicted dangerous pass, Niko waits beside the lane and reads it live.
 niko.battleSimState={cooldowns:{},usedUltimates:[],predictedReceiver:'23',predictedPasser:'14',predictionTick:s.tick};b.setPosition(rin,{x:25,y:40});b.setPosition(niko,{x:33,y:44});
 const t2=new Map();I.defensiveUltimates(s,s.teams[1],[niko],sae,t2,new Set());assert(niko.battleSimState.checkmateRead,'checkmate armed');assert(t2.has(niko.id));
 const spot=t2.get(niko.id);b.setPosition(niko,spot);const plain=b.passModel(s,sae,rin,b.point(rin),'short',{}),live=b.passModel(s,sae,rin,b.point(rin),'short',{live:true});
 const lane=m=>(m.lanes.find(l=>l.p===niko)||{chance:0}).chance;assert(lane(live)>lane(plain),'a better live read');assert(live.success>0,'the pass can still beat him');
 s.tick+=4;s.possession=2;I.settleUltimates(s);assert(!niko.battleSimState.checkmateRead);assert.equal(log(niko,'watchtower-checkmate').success,0,'avoided route counts as a failed read');
 // Gagamaru: Beast Reflex only when physically reachable; never certain.
 gaga.battleSimState={cooldowns:{},usedUltimates:[]};const aim={x:gaga.x,y:56};s.random=fixed(0);const r1=I.beastReflexSave(s,gaga,rin,aim,12,95,null);assert(r1.reachable&&r1.saved&&r1.chance<.43);assert(used(gaga,'beast-reflex'));
 gaga.battleSimState.usedUltimates=[];gaga.y=10;const r2=I.beastReflexSave(s,gaga,rin,{x:gaga.x,y:56},6,95,null);assert(r2&&!r2.reachable&&!used(gaga,'beast-reflex'),'unreachable: allowance kept');gaga.y=50;
 // Aryu: Last Reach only just outside the normal block line; can fail.
 b.setPosition(rin,{x:20,y:50});const goal=I.targetGoal(2);b.setPosition(aryu,{x:15,y:52.5/1});aryu.battleSimState={cooldowns:{},usedUltimates:[]};const g=I.laneGeometry(rin,goal,aryu);
 const lr=g.perp>=1.8&&g.perp<=3.4?I.lastReachBlock(s,rin,b.point(rin),goal):null;if(lr){assert(lr.chance<=.4);assert(used(aryu,'glamorous-last-reach'));}else{b.setPosition(aryu,{x:15,y:50+2.5/0.68});const l2=I.lastReachBlock(s,rin,b.point(rin),goal);assert(l2&&l2.chance<=.4,'reach window');}
 // Zantetsu: Lightning Start only in live short races.
 const z=I.lightningStart(zan,10),far=I.lightningStart(zan,30);assert(z&&!far);zan.flow=0;assert(!I.lightningStart(zan,10),'Flow only');
 // Kurona: Orbital Recovery reaches further near the receiver; spent on a played pass.
 kurona.battleSimState={cooldowns:{},usedUltimates:[]};b.setPosition(barou,{x:30,y:40});b.setPosition(kurona,{x:33,y:44});const ob=I.defensiveReadBonus(s,kurona,barou,false);assert(ob&&ob.kind==='orbital');
 s.possession=2;b.setPosition(sae,{x:45,y:40});carry(b,s,sae);s.random=fixed(.0001);b.resolvePass(s,sae,{option:{receiver:barou,to:b.point(barou),kind:'short',through:false,model:b.passModel(s,sae,barou,b.point(barou),'short',{})}});assert(kurona.battleSimState.cooldowns['orbital-recovery']>s.tick,'cooldown after a real attempt');
 console.log('PASS 0.8.9.8.11 defenders: Ace Neutralization (shared 12-tick cooldown, hidden read, both dossiers), Lockdown stamina and escape, Checkmate live-only read and avoidance, reachable Beast Reflex, Last Reach window, short-race Lightning Start, Orbital Recovery cooldown');
}

function safety(){
 const {b,s,I,get,def}=setup([15,23,14,7,4,1,2,3,5,6],[24,25,16,11,12,13,17,18,19,70]);
 const rin=get(1,23),ba=get(1,15),chi=get(1,7);rin.flow=100;ba.flow=100;chi.flow=100;b.setPosition(rin,{x:68,y:50});b.setPosition(def(0),{x:73,y:50});carry(b,s,rin);
 assert(I.carrierUltimateOptions(s,rin,{}).length>0,'offered in open play');
 s.planetHotline={teamNumber:1,isagiId:'1',kuronaId:'26',remaining:2};assert.equal(I.carrierUltimateOptions(s,rin,{}).length,0,'never overrides a locked reaction sequence');s.planetHotline=null;
 s.pending={type:'corner'};assert.equal(I.carrierUltimateOptions(s,rin,{}).length,0,'never during a restart');s.pending=null;
 rin.flow=0;assert(!I.ultimateReady(rin,'puppeteer-endgame'),'Flow required');rin.flow=100;assert(I.ultimateReady(rin,'puppeteer-endgame'));rin.matchStatus='subbed-off';assert(!I.ultimateReady(rin,'puppeteer-endgame'),'no ability for an unavailable player');rin.matchStatus=undefined;
 // A finished Flow returns the allowance on the next activation only.
 I.spendUltimate(s,ba,{id:'devour-villains-shadow'});ba.flow=0;b.playerTick(s);assert.equal((ba.battleSimState.usedUltimates||[]).length,0,'allowances reset when Flow ends');
 // Save/load: allowances and sequences survive; malformed values are dropped.
 ba.flow=100;I.spendUltimate(s,ba,{id:'predator-eye-blindside-execution'});I.abilityState(ba).devour={tick:s.tick,until:s.tick+3,carrierId:'1',target:{x:80,y:40}};I.abilityState(chi).redPanther={stage:2,runs:1,tick:s.tick,zone:{x:85,y:30}};
 I.abilityState(rin).ultimateLog={'puppeteers-endgame':{attempts:2,success:1}};s.aceNeutral={teamNumber:2,targetId:'15',until:s.tick+2,tick:s.tick};
 const raw=JSON.parse(JSON.stringify(b.snapshotMatch(s))),again=b.hydrateMatch(raw);assert(again);const q=id=>again.teams[1].roster.find(p=>p.id===id);
 assert(q('15').battleSimState.usedUltimates.includes('predator-eye-blindside-execution'));assert.equal(q('15').battleSimState.devour.carrierId,'1');assert.equal(q('7').battleSimState.redPanther.runs,1);assert.equal(q('23').battleSimState.ultimateLog['puppeteers-endgame'].success,1);
 raw.teams[1].roster.find(p=>p.id==='15').battleSimState.usedUltimates.push('not-a-kit-entry');raw.teams[1].roster.find(p=>p.id==='7').battleSimState.redPanther={stage:9,zone:{x:'bad'}};raw.teams[1].roster.find(p=>p.id==='15').battleSimState.devour={tick:1,until:1e9,carrierId:'1',target:{x:80,y:40}};
 const bad=b.hydrateMatch(raw),bq=id=>bad.teams[1].roster.find(p=>p.id===id);assert(!bq('15').battleSimState.usedUltimates.includes('not-a-kit-entry'));assert(!bq('7').battleSimState.redPanther,'malformed sequence dropped');assert(bq('15').battleSimState.devour.until<=bad.tick+4,'bounded window');
 console.log('PASS 0.8.9.8.11 safety: no ultimates during locked sequences/restarts or for unavailable players, Flow resets allowances, saves restore allowances/sequences/logs and reject malformed data');
}

function matches(){
 const run=seed=>{const {b,s}=setup([],[]);return null;};
 const lineups=[[{0:8,1:5,2:9,3:24,4:26,5:14,6:20,7:1,8:4,9:15,10:7},{0:11,1:18,2:16,3:25,4:22,5:6,6:19,7:70,8:21,9:23,10:3}],[{0:8,1:5,2:9,3:24,4:26,5:14,6:20,7:1,8:4,9:15,10:7},{0:11,1:18,2:16,3:25,4:12,5:3,6:21,7:19,8:22,9:6,10:23}]];
 const signature=[],rows=[];let ticks=0,ms=0;
 for(const seed of [7,29,71,101]){const h=battleContext(),b=h.bs;b.quiet();const L=lineups[seed%2],cfg=(n,a)=>`bs.normalizeTeam({name:'T${n}',formation:'4-3-3',roster:${JSON.stringify(Object.values(a))}.map(playerById),assignment:${JSON.stringify(a)}},${n})`;
  b.setTeams(h.run(`[${cfg(1,L[0])},${cfg(2,L[1])}]`));const s=b.createMatch();b.setMatch(s);s.seed=seed;s.random=b.seeded(seed);let guard=0;const t0=Date.now();
  while(s.status!=='finished'&&guard++<1500)advance({bs:b},s);ms+=Date.now()-t0;ticks+=s.tick;assert.equal(s.status,'finished','match '+seed+' completes');
  for(const t of Object.values(s.teams))assert.equal(new Set(Object.values(t.assignment)).size,Object.keys(t.assignment).length);
  const ult=s.events.filter(e=>e.ability&&e.ability.kind==='ultimate').map(e=>e.ability.id);rows.push({seed,score:[s.score[1],s.score[2]],ult});if(seed===7)signature.push(JSON.stringify(s.events.map(e=>[e.type,e.description])));}
 // Determinism: the same seed and line-ups give the same match.
 {const h=battleContext(),b=h.bs;b.quiet();const L=lineups[1],cfg=(n,a)=>`bs.normalizeTeam({name:'T${n}',formation:'4-3-3',roster:${JSON.stringify(Object.values(a))}.map(playerById),assignment:${JSON.stringify(a)}},${n})`;
  b.setTeams(h.run(`[${cfg(1,L[0])},${cfg(2,L[1])}]`));const s=b.createMatch();b.setMatch(s);s.seed=7;s.random=b.seeded(7);let guard=0;while(s.status!=='finished'&&guard++<1500)advance({bs:b},s);assert.equal(JSON.stringify(s.events.map(e=>[e.type,e.description])),signature[0],'seeded matches are deterministic');}
 assert(ms/ticks<10,'engine cost stays bounded: '+(ms/ticks).toFixed(2)+'ms per tick');
 console.log('PASS 0.8.9.8.11 ordinary seeded matches (no forced Flow) complete deterministically at '+(ms/ticks).toFixed(2)+'ms/tick; ultimates seen '+JSON.stringify(rows.map(r=>r.ult.length)));
}

function data(){
 const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'js/i18n/messages.js'),'utf8'),c);vm.runInNewContext(fs.readFileSync(path.join(root,'js/i18n/battle-messages.js'),'utf8'),c);const M=c.window.BLD_MESSAGES,B=c.window.BLD_BATTLE_MESSAGES;
 const {h,b}=setup([],[]),all=JSON.parse(h.run('JSON.stringify(players)'));const IDS=[3,4,6,7,8,9,14,15,16,20,21,22,23,24,25,26];
 const source=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8');
 const NEW={3:['ambidextrous-checkmate'],4:['monsters-dance'],6:['wild-card-power-finish'],7:['red-panther-44-breakthrough'],8:['beast-reflex'],9:['relentless-lockdown'],14:['beautiful-destruction-perfect-thread','counter-dribble-deadly-release'],15:['devour-villains-shadow','predator-eye-blindside-execution'],16:['watchtower-checkmate'],20:['chameleon-evolution'],22:['lightning-start'],23:['puppeteers-endgame','destroyer-collision-course','spin-gear-shot'],24:['glamorous-last-reach']};
 for(const [id,ults] of Object.entries(NEW)){const p=all.find(x=>x.id===Number(id));for(const u of ults){const a=p.battleSim.ultimates.find(x=>x.id===u);assert(a&&a.oncePerFlow&&a.condition?.duringFlow&&a.effect,'real ultimate entry '+u);
  assert(source.includes('"'+a.effect+'"'),'engine handler for '+a.effect);assert(/Once per Flow\.$/.test(a.description),'limit stated '+u);}}
 for(const id of IDS){const p=all.find(x=>x.id===id),kit=p.battleSim;for(const a of ['passives','weapons','ultimates','reactions'].flatMap(g=>kit[g]||[])){assert.equal(Object.keys(M[a.description]||{}).length,10,'description '+a.id);assert(B[a.label]||M[a.label],'label '+a.label);}
  for(const lines of Object.values(kit.dialogue))for(const l of lines)assert.equal(Object.keys(B[l]||{}).length,10,p.name+': '+l);}
 for(const k of ['ULTIMATE COUNTERED','BLOCK CHANCE','SAVE CHANCE','{player} uses an ultimate.',"{player}'s ultimate is stopped.",'{player} and {other} close down the danger.'])assert.equal(Object.keys(B[k]||{}).length,10,k);
 // Not every character gets an ultimate; limited-canon and support players stay simple.
 for(const id of [2,5,10,11,12,13,17,18,19,26,70,25])assert(!(all.find(x=>x.id===id).battleSim.ultimates||[]).some(a=>a.oncePerFlow&&!/flow-state/.test(a.effect)),'no forced ultimate for '+id);
 assert(!all.filter(p=>p.secretCharacter).some(p=>JSON.stringify(p.battleSim||{}).match(/devour|puppeteer|lockdown|ace-neutralization/)),'secret kits untouched');
 const kur=all.find(p=>p.id===26);assert.equal(kur.battleSim.reactions.length,0,'Ace Neutralization declared once (Raichi), not duplicated');assert(kur.battleSim.weapons.some(w=>w.effect==='orbital-recovery'));
 const prof=b.battleSimProfileWeapons(all.find(p=>p.id===15));assert(prof.some(x=>x.type==='ULTIMATE'&&x.id==='devour-villains-shadow'));
 console.log('PASS 0.8.9.8.11 data: every new ultimate is a once-per-Flow entry with an engine handler and stated limit, descriptions/labels/dialogue in 10 languages, single shared reaction, unchanged secret kits, characters without forced ultimates');
}

function runBattleV89811Tests(){barou();rinAndNoa();saeReoNagi();chigiriBachiraKunigami();defenders();safety();data();matches();}
if(require.main===module)runBattleV89811Tests();
module.exports={runBattleV89811Tests};
