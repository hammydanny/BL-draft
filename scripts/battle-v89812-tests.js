#!/usr/bin/env node
'use strict';
// 0.8.9.8.12 ability activation: Planet Hotline makes real forward progress, Perfect Trapping is a visible first
// touch, Chameleon learns from moves that are actually performed, Reflex × Reflex, six new kits (Luna, Pablo,
// Adam, Dada, Loki, Ishikari) with fallible effects, and a speech budget that keeps dialogue natural and rare.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {battleContext}=require('./battle-sim-tests');
const {advance}=require('./battle-presentation-tests');
const root=path.resolve(__dirname,'..');
const EXPORTS='runPlanetHotline,hotlineRoute,aheadM,distance,lastLineM,perfectTrapTouch,recordReception,noteTechnique,copiedTechnique,kitAbility,abilityState,ultimateReady,spendUltimate,devourRun,reflexRun,passModel,bendGeometry,laneSide,headedLinkOption,primeHeaderLink,planGodspeed,runGodspeed,raceProfile,raceTopSpeed,sprintAccel,dribbleModel,aerialDuel,aerialSkill,shotTechniques,speechBudget,basicActionDialogue,kitReactions,reactionBetween,passIntelligence,passExtras,precisionPassing,targetGoal,opposing,planCollision,monsterDance,laneGeometry,effective,readyKit,kitParam';
function setup(ids1,ids2,opts={}){
 const source=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8').replace('document.addEventListener("DOMContentLoaded",function()','globalThis.ID={'+EXPORTS+'};document.addEventListener("DOMContentLoaded",function()');
 const h=battleContext(source),b=h.bs,I=h.context.ID;b.quiet();
 b.setTeams(h.run(`[bs.normalizeTeam({name:'One',formation:'4-3-3',roster:[blueLockManFor(1),...${JSON.stringify(ids1)}.map(playerById)],assignment:{}},1),bs.normalizeTeam({name:'Two',formation:'4-3-3',roster:[blueLockManFor(2),...${JSON.stringify(ids2)}.map(playerById)],assignment:{}},2)]`));
 const s=b.createMatch();b.setMatch(s);s.kickoffPassPending=false;s.status='playing';s.pending=null;s.forced=null;s.tick=30;s.seed=opts.seed||11;s.random=b.seeded(opts.seed||11);
 b.active(s.teams[1]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:20,y:8+i*8}));b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:30,y:8+i*8}));
 const get=(n,id)=>b.active(s.teams[n]).find(p=>Number(p.id)===Number(id)),def=(i,n=2)=>b.active(s.teams[n]).filter(p=>p.role!=='GK')[i];
 return{h,b,s,I,get,def};
}
const carry=(b,s,p)=>{s.possession=p.teamNumber;s.carrierId=p.id;b.setBall(s,p);};
const fixed=v=>()=>v;
const OTHERS=[2,3,4,5,6,7,8,9],DEF=[16,24,25,10,11,12,13,17,18,19];

function hotline(){
 // Both attacking directions: three real passes, ~6 m each, ending on time and starting the shared cooldown.
 for(const dir of [1,2]){
  const {b,s,I,get}=dir===1?setup([1,26,...OTHERS],DEF):setup(DEF,[1,26,...OTHERS]);const X=v=>dir===1?v:100-v,opp=dir===1?2:1;
  b.active(s.teams[dir]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:X(30),y:8+i*8}));b.active(s.teams[opp]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:X(75+(i%3)*5),y:10+i*8}));
  const is=get(dir,1),ku=get(dir,26);b.setPosition(is,{x:X(48),y:50});b.setPosition(ku,{x:X(46),y:40});carry(b,s,is);
  const start=I.aheadM(dir,s.ball),seen=[];let passes=0;
  for(let t=0;t<4;t++){s.tick++;const before=s.events.length;I.runPlanetHotline(s);passes+=s.events.slice(before).filter(e=>e.type==='pass').length;seen.push(JSON.stringify([is.x.toFixed(2),is.y.toFixed(2),ku.x.toFixed(2),ku.y.toFixed(2)]));
   for(const p of [is,ku])assert(p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100,'on the pitch');}
  const gain=I.aheadM(dir,s.ball)-start;
  assert.equal(passes,3,'three exclusive passes');assert(gain>=10,'meaningful net forward progress in direction '+dir+': '+gain.toFixed(1)+' m');
  assert.equal(new Set(seen).size,seen.length-1,'positions change every pass (no static loop)');
  assert(!s.planetHotline,'sequence ends');assert(Number(s.reactionCooldowns[dir+':planet-hotline'])>s.tick,'shared cooldown starts when the sequence ends');
  s.tick++;carry(b,s,is);assert.equal(I.runPlanetHotline(s),false,'cooldown blocks an immediate restart');
 }
 // A blocked pitch: no forward route, so the reaction is never announced and abandoned.
 {const {b,s,I,get}=setup([1,26,...OTHERS],DEF);const is=get(1,1),ku=get(1,26);b.setPosition(is,{x:48,y:50});b.setPosition(ku,{x:46,y:40});
  b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>{const c=i<5?is:ku,a=(-80+(i%5)*40)*Math.PI/180;b.setPosition(p,{x:c.x+3*Math.cos(a),y:c.y+4*Math.sin(a)});});carry(b,s,is);
  const before=s.events.length;s.tick++;I.runPlanetHotline(s);assert(!s.events.slice(before).some(e=>e.type==='planet-hotline'),'blocked route: no activation');assert(!s.planetHotline);}
 // Interception and early termination: a failed pass ends it on the turnover; a pitch that closes mid-sequence ends it too.
 for(const mode of ['intercept','blocked']){const {b,s,I,get}=setup([1,26,...OTHERS],DEF,{seed:5});b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:80+(i%3)*4,y:10+i*8}));
  const is=get(1,1),ku=get(1,26);b.setPosition(is,{x:48,y:50});b.setPosition(ku,{x:46,y:40});carry(b,s,is);s.tick++;I.runPlanetHotline(s);assert(s.planetHotline,'started');
  const holder=b.active(s.teams[1]).find(p=>p.id===s.carrierId);
  if(mode==='intercept'){const other=holder===is?ku:is,d=b.active(s.teams[2]).filter(p=>p.role!=='GK')[0];b.setPosition(d,{x:(holder.x+other.x)/2+.3,y:(holder.y+other.y)/2});
   assert(I.passModel(s,holder,other,other,'short',{}).success<1,'a hotline pass through a defender\'s reach is interceptable');
   s.possession=2;s.carrierId=d.id;s.tick++;I.runPlanetHotline(s);}
  else{b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>{const a=i*Math.PI/5;b.setPosition(p,{x:holder.x+3+Math.cos(a)*4,y:holder.y+Math.sin(a)*6});});s.tick++;I.runPlanetHotline(s);}
  assert(!s.planetHotline,'sequence ends early ('+mode+')');assert(Number(s.reactionCooldowns['1:planet-hotline'])>s.tick,'cooldown starts on early termination');}
 // Save/load mid-sequence keeps only the bounded fields and continues deterministically.
 {const {b,s,I,get}=setup([1,26,...OTHERS],DEF,{seed:9});b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:75+(i%3)*5,y:10+i*8}));
  const is=get(1,1),ku=get(1,26);b.setPosition(is,{x:48,y:50});b.setPosition(ku,{x:46,y:40});carry(b,s,is);s.tick++;I.runPlanetHotline(s);
  const raw=JSON.parse(JSON.stringify(b.snapshotMatch(s))),again=b.hydrateMatch(raw);assert.deepEqual(again.planetHotline,s.planetHotline,'sequence survives save/load');
  raw.planetHotline={teamNumber:1,isagiId:'1',kuronaId:'26',remaining:99};assert.equal(b.hydrateMatch(raw).planetHotline,null,'malformed sequence rejected');}
 console.log('PASS 0.8.9.8.12 Planet Hotline: three real forward passes in both directions (≥10 m), no static loop, never started into a blocked pitch, interceptions end it, shared cooldown, save/load');
}

function nagiReoBarou(){
 // Perfect Trapping: a lofted ball dies on the first touch and is steered into the open side, toward goal.
 {const {b,s,I,get,def}=setup([21,20,...OTHERS],DEF);const nagi=get(1,21),reo=get(1,20),d=def(0);b.setPosition(nagi,{x:70,y:50});b.setPosition(d,{x:71.5,y:45});b.setPosition(reo,{x:40,y:50});carry(b,s,nagi);
  const before={x:nagi.x,y:nagi.y};I.recordReception(s,reo,nagi,{kind:'long',from:{x:40,y:50},to:{x:70,y:50},aerial:true});
  assert.equal(nagi.perfectTrapTick,s.tick,'trap recorded');assert(I.aheadM(1,nagi)>I.aheadM(1,before),'first touch moves toward goal');assert(I.distance(nagi,d)>I.distance(before,d),'into the side away from the marker');
  assert.equal(s.ball.x,nagi.x,'ball stays with the touch');
  const plain=setup([21,20,...OTHERS],DEF),n2=plain.get(1,21);plain.b.setPosition(n2,{x:70,y:50});const p0={x:n2.x,y:n2.y};plain.I.recordReception(plain.s,plain.get(1,20),n2,{kind:'short',from:{x:65,y:50},to:{x:70,y:50}});
  assert.deepEqual({x:n2.x,y:n2.y},p0,'an easy ball needs no special touch');
  const crowd=setup([21,20,...OTHERS],DEF),n3=crowd.get(1,21);crowd.b.setPosition(n3,{x:70,y:50});crowd.b.active(crowd.s.teams[2]).filter(p=>p.role!=='GK').slice(0,8).forEach((p,i)=>{const a=i*Math.PI/4;crowd.b.setPosition(p,{x:70+Math.cos(a)*1.9,y:50+Math.sin(a)*2.9});});
  const p1={x:n3.x,y:n3.y};crowd.I.recordReception(crowd.s,crowd.get(1,20),n3,{kind:'long',from:{x:40,y:50},to:{x:70,y:50},aerial:true});assert.deepEqual({x:n3.x,y:n3.y},p1,'no open side: the ball just stops');}
 // Chameleon: a move actually performed near Reo is learned even when no feed chip is shown; physical gifts never are.
 {const {s,I,get}=setup([20,4,7,...OTHERS.slice(2)],DEF);const reo=get(1,20),bachira=get(1,4),chigiri=get(1,7);
  I.noteTechnique(s,bachira,'creative-dribbling');assert((I.abilityState(reo).observedTechniques||[]).some(x=>x.effect==='creative-dribble'&&x.sourceId==='4'),'observed from the real action');
  I.noteTechnique(s,chigiri,'no-break-dribble');assert(!(I.abilityState(reo).observedTechniques||[]).some(x=>x.sourceId==='7'),'speed (physical) is never copied');
  const copy=I.kitAbility(reo,'creative-dribble');assert(copy&&copy.copied&&/^CHAMELEON: /.test(copy.label),'Reo uses the copy with his own ratings');
  I.abilityState(reo).cooldowns.chameleon=s.tick+5;assert(!I.copiedTechnique(reo,'creative-dribble'),'Chameleon cooldown respected');}
 // Barou's Devour reads a teammate taking a defender on (attention), not only two bodies already drawn.
 {const {b,s,I,get,def}=setup([15,1,...OTHERS],DEF);const ba=get(1,15),isagi=get(1,1);ba.flow=100;
  b.setPosition(isagi,{x:72,y:50});b.setPosition(def(0),{x:75,y:50});b.setPosition(def(3),{x:92,y:30});b.setPosition(def(4),{x:92,y:70});b.setPosition(ba,{x:68,y:30});carry(b,s,isagi);
  b.active(s.teams[2]).filter(p=>p.role!=='GK').slice(5).forEach((p,i)=>b.setPosition(p,{x:20,y:10+i*10}));
  I.devourRun(s,s.teams[1],isagi,95);assert(!ba.battleSimState?.devour,'one defender and nothing happening: no Devour');
  s.events.push({id:s.events.length+1,tick:s.tick,type:'dribble',teamNumber:1,actors:[{id:'1'}],dialogue:[]});I.devourRun(s,s.teams[1],isagi,95);
  assert(ba.battleSimState?.devour,'a teammate taking the defender on invites the Devour run');assert.equal(ba.intent?.type,'run','he runs; no teleport');}
 console.log('PASS 0.8.9.8.12 Nagi/Reo/Barou: visible Perfect Trapping first touch (none on easy balls or with no open side), Chameleon learns real moves but never physical gifts, Devour reads attention-drawing dribbles');
}

function reflex(){
 const {b,s,I,get,def}=setup([14,31,...OTHERS],DEF);const sae=get(1,14),shidou=get(1,31);
 b.setPosition(sae,{x:68,y:40});b.setPosition(shidou,{x:84,y:58});b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:i<4?93:40,y:20+i*12}));carry(b,s,sae);
 const rx=I.kitReactions(s,sae).find(r=>r.def.effect==='reflex-cross');assert(rx,'one authoritative reaction from Sae\'s kit');
 const line=I.lastLineM(s,1);I.reflexRun(s,s.teams[1],sae,line);const run=I.abilityState(shidou).reflexRun;assert(run,'Shidou picks a reachable spot near goal');assert(I.distance(shidou,run.target)<=8,'reachable from where he is');assert.equal(shidou.intent.type,'run','a legitimate run');
 assert(I.aheadM(1,run.target)<=line,'onside target');
 // Not guaranteed: an offside or impossible pass is never tagged, and the reaction respects its shared cooldown.
 s.reactionCooldowns={'1:reflex-x-reflex':s.tick+5};delete I.abilityState(shidou).reflexRun;I.reflexRun(s,s.teams[1],sae,line);assert(!I.abilityState(shidou).reflexRun,'shared 12-tick cooldown');
 // Both dossiers list it; Shidou's own kit stays pending.
 const {h}=setup([],[]),all=JSON.parse(h.run('JSON.stringify(players)')),shid=all.find(p=>p.id===31);assert(!shid.battleSim,'Shidou kit not implemented');
 assert.equal(all.flatMap(p=>(p.battleSim?.reactions||[]).filter(r=>r.effect==='reflex-cross')).length,1,'declared once');
 const lore=fs.readFileSync(path.join(root,'js/lore.js'),'utf8');assert(/members\.includes\(me\)/.test(lore),'dossiers list reactions for every member');
 console.log('PASS 0.8.9.8.12 Reflex × Reflex: Shidou runs to a reachable onside spot near goal, single definition shown in both dossiers, shared cooldown, Shidou kit still pending');
}

function newKits(){
 // Loki: Godspeed is acceleration and top speed together; he outruns a slower defender on a knock-and-run.
 {const {b,s,I,get,def}=setup([38,22,7,...OTHERS.slice(2)],DEF);const loki=get(1,38),zan=get(1,22),chi=get(1,7),d=def(0);
  assert(I.raceTopSpeed(loki,s)>I.raceTopSpeed(zan,s)&&I.raceTopSpeed(loki,s)>I.raceTopSpeed(chi,s),'highest top speed');
  assert(I.sprintAccel(loki,s)>I.sprintAccel(chi,s),'accelerates faster than a sustained-speed runner');assert(I.sprintAccel(loki,s)<I.sprintAccel(zan,s),'Zantetsu keeps the most explosive start');
  b.setPosition(loki,{x:60,y:50});b.setPosition(d,{x:63,y:50});d.stats={...d.stats,spd:70};carry(b,s,loki);
  const fast=I.dribbleModel(s,loki,{x:72,y:50},undefined,{push:true}).chance;d.stats={...d.stats,spd:96};const even=I.dribbleModel(s,loki,{x:72,y:50},undefined,{push:true}).chance;assert(fast>even,'pace decides the knock-and-run');
  // Godspeed Breakthrough: needs an opening; real movement; can fail.
  loki.flow=100;b.active(s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>b.setPosition(p,{x:i<2?80:20,y:i<2?35+i*30:10+i*8}));b.setPosition(loki,{x:58,y:50});
  const plan=I.planGodspeed(s,loki);assert(plan&&plan.key==='godspeed-breakthrough','an opening is recognised');const from={x:loki.x,y:loki.y};
  s.random=fixed(.01);I.runGodspeed(s,loki,plan);assert(I.distance(from,loki)>8,'real movement with the ball');assert(!I.ultimateReady(loki,'godspeed-breakthrough'),'once per Flow');
  const closed=setup([38,...OTHERS],DEF),l2=closed.get(1,38);l2.flow=100;closed.b.setPosition(l2,{x:58,y:50});closed.b.active(closed.s.teams[2]).filter(p=>p.role!=='GK').forEach((p,i)=>closed.b.setPosition(p,{x:62+(i%3)*3,y:38+Math.floor(i/3)*7}));
  assert.equal(closed.I.planGodspeed(closed.s,l2),null,'no gap: no breakthrough');}
 // Pablo: Bending Distribution curls around the blocker (geometry), Precision Masterclass needs a runner.
 {const {b,s,I,get,def}=setup([35,38,...OTHERS],DEF);const pablo=get(1,35),loki=get(1,38),d=def(0);
  const g=I.laneGeometry({x:40,y:50},{x:60,y:50},{x:50,y:51});const bent=I.bendGeometry(g,{x:40,y:50},{x:60,y:50},{x:50,y:51},{metres:2.4,side:I.laneSide({x:40,y:50},{x:60,y:50},{x:50,y:51})});
  assert(bent.perp>g.perp+2,'the curve moves away from the blocker');const other=I.bendGeometry(I.laneGeometry({x:40,y:50},{x:60,y:50},{x:50,y:49}),{x:40,y:50},{x:60,y:50},{x:50,y:49},{metres:2.4,side:I.laneSide({x:40,y:50},{x:60,y:50},{x:50,y:51})});
  assert(other.perp<I.laneGeometry({x:40,y:50},{x:60,y:50},{x:50,y:49}).perp+.01,'and toward anyone on the other side');
  assert(!I.ultimateReady(pablo,'precision-masterclass'),'Flow required');pablo.flow=100;assert(I.ultimateReady(pablo,'precision-masterclass'));}
 // Adam: Physical Superiority makes him harder to dispossess; Unyielding Charge is a real duel that can be lost.
 {const {b,s,I,get,def}=setup([36,...OTHERS],DEF);const adam=get(1,36),d=def(0);b.setPosition(adam,{x:70,y:50});b.setPosition(d,{x:73,y:50});carry(b,s,adam);
  const withShield=I.dribbleModel(s,adam,{x:76,y:50}).chance;adam.battleSim={...adam.battleSim,passives:adam.battleSim.passives.filter(a=>a.effect!=='physical-shield')};const without=I.dribbleModel(s,adam,{x:76,y:50}).chance;assert(withShield>without,'strength protects the ball');}
 {const {b,s,I,get,def}=setup([36,...OTHERS],DEF);const adam=get(1,36),d=def(0);adam.flow=100;b.setPosition(adam,{x:72,y:50});b.setPosition(d,{x:75,y:50});carry(b,s,adam);
  const plan=I.planCollision(s,adam);assert(plan,'charge offered against the defender in his path');}
 // Dada: aerial power (not reach) wins more duels; the challenge is a real duel.
 {const {s,I,get,def}=setup([37,24,...OTHERS],DEF);const dada=get(1,37),aryu=get(1,24),d=def(0);
  assert(I.aerialSkill(s,dada,true)>I.aerialSkill(s,{...dada,battleSim:{...dada.battleSim,passives:[]}},true),'aerial power adds strength');
  const duel=I.aerialDuel(s,dada,d,0,false);assert(duel>.03&&duel<.92,'never certain');}
 // Ishikari: towering reach and positioning start aerial races sooner; headed link-up is an ordinary pass.
 {const {s,I,get}=setup([92,...OTHERS],DEF);const ish=get(1,92);const flight={kind:'long',points:[{x:50,y:50}],from:{x:30,y:50}};
  const plain={...ish,battleSim:{...ish.battleSim,passives:[]}};assert(I.raceProfile(s,ish,'receiver',flight,null).reaction<I.raceProfile(s,plain,'receiver',flight,null).reaction,'reads high balls sooner');
  I.primeHeaderLink(s,ish);assert.equal(I.abilityState(ish).headerLink,s.tick,'link-up primed after winning a high ball');
  s.tick++;const mate=get(1,2),near={type:'pass',value:.05,option:{receiver:mate,to:{x:mate.x,y:mate.y},model:{len:10,success:.8,offside:false}}},far={type:'pass',value:.06,option:{receiver:get(1,3),to:{x:0,y:0},model:{len:30,success:.9,offside:false}}};
  I.headedLinkOption(s,ish,[near,far]);assert(near.option.headedLink&&!far.option.headedLink,'only a nearby teammate can be found with a header');assert(near.value>.05,'a quick header is preferred, not forced');
  const ex=I.passExtras(s,ish,near.option);assert.equal(ex.ability?.id,'headed-link-up');assert(I.abilityState(ish).cooldowns['headed-link-up']>s.tick,'cooldown');
  s.tick++;const again={type:'pass',value:.05,option:{receiver:mate,to:{x:mate.x,y:mate.y},model:{len:10,success:.8,offside:false}}};I.headedLinkOption(s,ish,[again]);assert(!again.option.headedLink,'not without a fresh aerial win');
  assert(!I.ultimateReady(ish,'flow-state')&&!(ish.battleSim.ultimates||[]).length,'no invented ultimate');}
 // Luna: close control holds under pressure, Elegant Breakthrough has its own cooldown, Masterful Escape is the shared dance.
 {const {b,s,I,get,def}=setup([34,...OTHERS],DEF);const luna=get(1,34);b.setPosition(luna,{x:70,y:50});b.setPosition(def(0),{x:72,y:50});b.setPosition(def(1),{x:71,y:53});carry(b,s,luna);
  const with_=I.dribbleModel(s,luna,{x:75,y:50}).chance;luna.battleSim={...luna.battleSim,passives:luna.battleSim.passives.filter(a=>a.effect!=='close-control')};assert(with_>I.dribbleModel(s,luna,{x:75,y:50}).chance,'close control matters under pressure');
  const st=I.abilityState(luna);st.cooldowns['elegant-breakthrough']=s.tick+3;assert.equal(I.readyKit(s,luna,'creative-dribble'),null,'Elegant Breakthrough cooldown respected');}
 console.log('PASS 0.8.9.8.12 kits: Loki outruns slower defenders (distinct from Zantetsu/Chigiri) and needs a real gap, Pablo curls around blockers, Adam protects the ball and charges, Dada wins by power, Ishikari reads high balls, Luna keeps control under pressure');
}

function dialogue(){
 const {b,s,I,get}=setup([35,36,37,38,34,31,...OTHERS.slice(0,4)],DEF);const adam=get(1,36),pablo=get(1,35),plain=get(1,31);
 // Shot attempts are never announced as goals; a miss is never celebrated.
 const pre=I.basicActionDialogue('shot-attempt',[plain],s);assert.equal(pre.length,0,'generic shot attempt is silent');
 const save=I.basicActionDialogue('save',[plain],s).map(l=>l.text).join(' ');assert(!/YES|GET IN|finish!/i.test(save),'no celebration on a miss: '+save);
 const goal=I.basicActionDialogue('goal',[get(1,2),plain],s).map(l=>l.text);assert(!goal.some(t=>/Great pass/.test(t)),'assister does not thank himself');
 // Routine events are mostly quiet, and the same player does not talk again within a few ticks.
 const e=(type,actors,extra={})=>b.addEvent?b.addEvent(s,{type,actors,description:'x',...extra}):null;
 let spoken=0;for(let t=0;t<40;t++){s.tick++;const ev={type:'pass',dialogue:[{playerId:'35',text:'Pablo Cavasoz: "There."'}]};spoken+=I.speechBudget(s,ev,{}).length;s.events.push({tick:s.tick,type:'pass',dialogue:I.speechBudget(s,ev,{})});}
 assert(spoken<=8,'routine passes rarely voiced: '+spoken);
 const big=I.speechBudget(s,{type:'goal',dialogue:[{playerId:'35',text:'a'},{playerId:'36',text:'b'}]},{});assert.equal(big.length,2,'big moments always voiced');
 // Blue Lock Man never speaks; Junichi stays nonverbal; robotic phrasing is gone from public kits.
 const {h}=setup([],[]),all=JSON.parse(h.run('JSON.stringify(players)'));
 const jun=all.find(p=>p.id===18);assert(Object.values(jun.battleSim.dialogue).flat().every(l=>/^(Hnn|Grr|Ngh|Hmph)[.!]*$/.test(l)),'Junichi nonverbal');
 const robotic=/\b(I am taking the shot|That was my goal|I will|I am|Do not|That is my goal)\b/;
 for(const p of all.filter(p=>p.battleSim&&!p.secretCharacter&&![1,27].includes(p.id)))for(const l of Object.values(p.battleSim.dialogue||{}).flat())assert(!robotic.test(l),'natural phrasing: '+p.name+' "'+l+'"');
 console.log('PASS 0.8.9.8.12 dialogue: no pre-shot goal claims or celebrated misses, routine speech budgeted, big moments voiced, Junichi nonverbal, no robotic phrasing');
}

function data(){
 const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'js/i18n/messages.js'),'utf8'),c);vm.runInNewContext(fs.readFileSync(path.join(root,'js/i18n/battle-messages.js'),'utf8'),c);const M=c.window.BLD_MESSAGES,B=c.window.BLD_BATTLE_MESSAGES;
 const {h}=setup([],[]),all=JSON.parse(h.run('JSON.stringify(players)'));const ok=(T,k)=>T[k]&&Object.keys(T[k]).length>=10;
 const src=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8');
 const RATINGS=[[34,{"ovr":96,"off":99,"sho":97,"spd":96,"def":73,"pas":94,"dri":99,"gk":58},["FW"],"FW","ES"],[35,{"ovr":95,"off":96,"sho":96,"spd":94,"def":69,"pas":99,"dri":98,"gk":55},["FW"],"FW","AR"],[36,{"ovr":96,"off":99,"sho":99,"spd":96,"def":70,"pas":92,"dri":95,"gk":59},["FW"],"FW","GB"],[37,{"ovr":95,"off":99,"sho":99,"spd":96,"def":74,"pas":88,"dri":93,"gk":63},["FW"],"FW","BR"],[38,{"ovr":97,"off":96,"sho":94,"spd":99,"def":74,"pas":91,"dri":97,"gk":61},["CF","FW"],"CF","FR"],[92,{"ovr":72,"off":79,"sho":78,"pas":69,"dri":64,"spd":64,"def":62,"gk":35},["FW"],"FW","JP"]];
 for(const id of [34,35,36,37,38,92]){const p=all.find(x=>x.id===id),k=p.battleSim;assert(k,'kit for '+p.name);
  const ents=['passives','weapons','ultimates','reactions'].flatMap(g=>k[g]||[]);assert(ents.some(e=>e.effect==='flow-state'),p.name+' Flow');
  for(const e of ents){for(const x of [e.effect,...(e.effects||[])])assert(new RegExp('"'+x.replace(/[-]/g,'\\-')+'"').test(src),'handled effect '+x);
   assert(ok(B,e.label)&&ok(B,e.name)&&ok(M,e.name)&&ok(M,e.description),'translated '+e.name);assert(!/logit|technique|committing defender|gameplay label/i.test(e.description),'plain description '+e.name);}
  Object.values(k.dialogue).flat().forEach(l=>assert(ok(B,l),'translated line '+l));
  (p.weapons||[]).forEach(w=>{assert.notEqual(w.battleSimType,'TBD','dossier weapon wired: '+w.name);assert(ok(M,w.battleSimDescription),'dossier description translated');});
  const r=RATINGS.find(x=>x[0]===id);assert.deepEqual([p.stats,p.positions,p.primaryPosition,p.nationality.code],r.slice(1),'ratings, positions and nationality unchanged: '+p.name);}
 assert.equal((all.find(p=>p.id===92).battleSim.ultimates||[]).length,0,'Ishikari: no ultimate without canon support');
 const reflexDefs=all.flatMap(p=>(p.battleSim?.reactions||[]).filter(r=>r.effect==='reflex-cross'));assert.equal(reflexDefs.length,1);assert.deepEqual(reflexDefs[0].members,[14,31]);assert.equal(reflexDefs[0].cooldownTicks,12);
 // No invented World Five pairwise reactions.
 const wf=new Set([34,35,36,37,38]);assert(!all.some(p=>(p.battleSim?.reactions||[]).some(r=>(r.members||[]).filter(m=>wf.has(m)).length>=2)),'no invented World Five reactions');
 // Every Chameleon copy label shown in the feed is translated.
 const effs=JSON.parse(src.match(/const COPY_EFFECTS=new Set\((\[[^\]]*\])\)/)[1]);
 for(const p of all.filter(p=>p.battleSim&&!p.secretCharacter&&p.id!==20))for(const a of [...(p.battleSim.weapons||[]),...(p.battleSim.passives||[])])if(effs.includes(a.effect))assert(ok(B,'CHAMELEON: '+a.name.toUpperCase()),'copy label '+a.name);
 assert(!effs.some(e=>/push-dribble|power|shield|aerial|speed|reflex|save|godspeed|flow/.test(e)),'no physical or goalkeeping copies');
 // Generic voice lines are translated.
 const gen=src.slice(src.indexOf('function basicActionDialogue'),src.indexOf(' const phrases=lines[type]'));for(const m of gen.matchAll(/"([^"]*[!.?~—][^"]*)"/g))assert(ok(B,m[1]),'generic line translated: '+m[1]);
 // Secret roster untouched and hidden.
 const secret=all.filter(p=>p.secretCharacter).sort((a,b)=>a.id-b.id),digest=require('node:crypto').createHash('sha256').update(JSON.stringify(secret)).digest('hex');assert.equal(digest,require('./fixtures/protected-main-v8988.json').sha256,'protected records unchanged');
 console.log('PASS 0.8.9.8.12 data: six kits use handled effects with translated names/labels/descriptions/lines, dossiers wired, ratings unchanged, no invented ultimate or World Five reaction, copy labels and generic lines translated, secret records unchanged');
}

function matches(){
 const lineups=[[{0:8,1:92,2:24,3:9,4:26,5:35,6:1,7:34,8:37,9:36,10:38},{0:11,1:5,2:16,3:25,4:22,5:14,6:20,7:21,8:15,9:31,10:23}],[{0:8,1:5,2:9,3:24,4:26,5:14,6:20,7:21,8:4,9:15,10:1},{0:11,1:18,2:16,3:25,4:12,5:3,6:19,7:7,8:22,9:6,10:23}]];
 let ticks=0,ms=0,lines=0,trap=0,hot=0;const sig=[];
 for(const seed of [7,29,71,101]){const h=battleContext(),b=h.bs;b.quiet();const L=lineups[[7,29,71,101].indexOf(seed)%2],cfg=(n,a)=>`bs.normalizeTeam({name:'T${n}',formation:'4-3-3',roster:${JSON.stringify(Object.values(a))}.map(playerById),assignment:${JSON.stringify(a)}},${n})`;
  b.setTeams(h.run(`[${cfg(1,L[0])},${cfg(2,L[1])}]`));const s=b.createMatch();b.setMatch(s);s.seed=seed;s.random=b.seeded(seed);let guard=0;const t0=Date.now();
  while(s.status!=='finished'&&guard++<1500)advance({bs:b},s);ms+=Date.now()-t0;ticks+=s.tick;assert.equal(s.status,'finished');
  lines+=s.events.reduce((n,e)=>n+(e.dialogue||[]).length,0);trap+=s.events.filter(e=>e.ability?.id==='perfect-trapping').length;hot+=s.events.filter(e=>e.type==='planet-hotline').length;
  assert(!s.events.some(e=>(e.dialogue||[]).some(d=>/Blue Lock Man/.test(d.text))),'Blue Lock Man silent');
  if(seed===7)sig.push(JSON.stringify(s.events.map(e=>[e.type,e.description,(e.dialogue||[]).map(d=>d.text)])));}
 {const h=battleContext(),b=h.bs;b.quiet();const L=lineups[0],cfg=(n,a)=>`bs.normalizeTeam({name:'T${n}',formation:'4-3-3',roster:${JSON.stringify(Object.values(a))}.map(playerById),assignment:${JSON.stringify(a)}},${n})`;
  b.setTeams(h.run(`[${cfg(1,L[0])},${cfg(2,L[1])}]`));const s=b.createMatch();b.setMatch(s);s.seed=7;s.random=b.seeded(7);let guard=0;while(s.status!=='finished'&&guard++<1500)advance({bs:b},s);
  assert.equal(JSON.stringify(s.events.map(e=>[e.type,e.description,(e.dialogue||[]).map(d=>d.text)])),sig[0],'deterministic events and dialogue');}
 assert(lines/4<200,'dialogue budgeted: '+(lines/4).toFixed(0)+' lines per match');assert(trap>0,'Perfect Trapping visible in ordinary matches');
 assert(ms/ticks<10,'engine cost stays bounded: '+(ms/ticks).toFixed(2)+'ms per tick');
 console.log('PASS 0.8.9.8.12 ordinary seeded matches with the World Five and Ishikari complete deterministically at '+(ms/ticks).toFixed(2)+'ms/tick; '+(lines/4).toFixed(0)+' lines/match, '+trap+' Perfect Trapping chips, '+hot+' Planet Hotline sequences');
}

function runBattleV89812Tests(){hotline();nagiReoBarou();reflex();newKits();dialogue();data();matches();}
if(require.main===module)runBattleV89812Tests();
module.exports={runBattleV89812Tests};
