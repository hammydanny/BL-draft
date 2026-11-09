#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {battleContext}=require('./battle-sim-tests.js');
const plain=x=>JSON.parse(JSON.stringify(x));
function runSpatialTests(){
 const h=battleContext();h.bs.quiet();
 const teams=h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+14)],assignment:{0:9100+n}},n))`);
 h.bs.setTeams(teams);const s=h.bs.createMatch();h.bs.setMatch(s);const b=h.bs;
 for(const n of [1,2]){
  const players=b.active(s.teams[n]);
  assert.equal(players.length,11);
  assert(players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100));
  assert(players.every(p=>n===1?p.x<=50:p.x>=50),'kickoff restricted to own half');
  const keeper=players.find(p=>p.role==='GK');assert(keeper);
  b.setPosition(keeper,{x:50,y:0});
  assert(n===1?keeper.x<=16:keeper.x>=84,'keeper must stay inside own box');
  assert(keeper.y>=21&&keeper.y<=79);
 }
 const order=b.offBallOrder(s);assert.equal(order.length,21);
 for(let i=1;i<order.length;i++)assert(order[i-1].stats.spd>=order[i].stats.spd,'fastest mover takes turn first at full stamina');
 const before=new Map(order.map(p=>[p.teamNumber+':'+p.id,[p.x,p.y]]));
 b.moveOffBall(s);
 for(const p of order){
  const [x,y]=before.get(p.teamNumber+':'+p.id);
  assert(Math.hypot(p.x-x,p.y-y)>0,'every off-ball player moves every tick: '+p.name);
 }
 const fast=order[0],slow=order.at(-1);assert(b.movementMeters(fast)>b.movementMeters(slow));
 assert(b.dribbleMeters(fast)>b.dribbleMeters(slow),'speed increases dribble distance');
 const a={x:50,y:50},close={x:55,y:50},far={x:75,y:50};
 assert(b.distance(a,close)<b.distance(a,far));
 assert(b.inOpponentBox(1,{x:90,y:50}));
 assert(!b.inOpponentBox(1,{x:90,y:91}));
 assert(b.inOpponentBox(2,{x:10,y:50}));
 assert(!b.inOpponentBox(2,{x:40,y:50}));
 const receiver=b.active(s.teams[1]).find(p=>p.role!=='GK');
 for(const p of b.active(s.teams[2]))if(p.role!=='GK')b.setPosition(p,{x:90,y:90});
 assert.equal(b.receiverPressure(s,1,receiver),0,'distant defenders do not pressure receiver');
 const defender=b.active(s.teams[2]).find(p=>p.role!=='GK');
 b.setPosition(defender,{x:receiver.x+2,y:receiver.y});
 assert.equal(b.receiverPressure(s,1,receiver),1,'receiver pressure uses actual metre radius');
 const old=plain(b.projectPitch(s).get('1:'+receiver.id));const oldZone=receiver.zone;
 b.setPosition(receiver,{x:receiver.x+.4,y:receiver.y});
 assert.equal(receiver.zone,oldZone,'small free movement remains inside old compatibility cell');
 assert.notEqual(b.projectPitch(s).get('1:'+receiver.id).x,old.x,'visual pitch follows exact coordinates');
 b.playerTick(s);
 assert(s.events.every(e=>e.presentation?.v===2),'each revealed event has a coordinate snapshot');
 assert(s.events.every(e=>b.validPresentation(e.presentation,s)));
 const saved=plain(b.snapshotMatch(s));assert.equal(saved.presentationVersion,2);
 const restored=b.hydrateMatch(saved);assert(restored,'spatial save must restore');
 assert.deepEqual(plain(b.capturePresentation(restored)),plain(b.capturePresentation(s)));
 // A zone-era match can be read safely and converted without clearing saves.
 const legacy=plain(saved);legacy.presentationVersion=1;delete legacy.ball;
 for(const n of [1,2])for(const p of legacy.teams[n].roster){delete p.x;delete p.y;delete p.homeX;delete p.homeY;}
 for(const e of legacy.events)if(e.presentation){e.presentation.v=1;delete e.presentation.ball;for(const n of [1,2])for(const p of e.presentation.teams[n].players)p.splice(8);}
 assert(b.hydrateMatch(legacy),'v0.8.1 zone saves remain compatible');
 console.log('PASS Battle Sim spatial: kickoff halves, 22 movers, speed order/movement/dribbling, receiver pressure, penalty boxes, visual coordinates, v2 snapshots and legacy migration');
}
if(require.main===module)runSpatialTests();module.exports={runSpatialTests};
