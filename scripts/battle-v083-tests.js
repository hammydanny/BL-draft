#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {battleContext}=require('./battle-sim-tests.js');
const {advance}=require('./battle-presentation-tests.js');
function runBattleV083Tests(){
 const h=battleContext();h.bs.quiet();
 const teams=h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+14)],assignment:{0:9100+n}},n))`);
 const b=h.bs;b.setTeams(teams);
 for(const [pending,expected] of [
  [{type:'free-kick',routine:'pass'},'pas'],
  [{type:'free-kick',routine:'direct'},'sho'],
  [{type:'corner',routine:'cross'},'pas'],
  [{type:'corner',routine:'short'},'pas'],
  [{type:'goal-kick',routine:'direct'},'gk'],
  [{type:'goal-kick',routine:'short'},'gk'],
  [{type:'penalty',routine:'direct'},'sho']
 ])assert.equal(b.setPieceSkill(pending),expected);
 const corner=b.createMatch();b.setMatch(corner);
 const cornerPending={type:'corner',teamNumber:1,zone:15,point:{x:98,y:4},routine:'cross'};
 const taker=b.setPieceTaker(corner,cornerPending);assert.notEqual(taker.role,'GK');
 b.arrangeSetPiece(corner,cornerPending,taker);
 assert(taker.x>=97&&Math.min(taker.y,100-taker.y)<=6,'corner taker stands at either correct corner');
 assert.equal(corner.carrierId,taker.id);assert.equal(corner.possession,1);
 assert(b.active(corner.teams[1]).filter(p=>p.id!==taker.id&&b.inOpponentBox(1,p)).length>=5,'attackers occupy box for corners');
 assert(b.active(corner.teams[2]).filter(p=>p.role!=='GK'&&b.inOpponentBox(1,p)).length>=5,'defenders mark corner');
 const gkCorner=b.keeper(corner.teams[2]);assert(gkCorner.x>=84&&gkCorner.x<=97&&gkCorner.y>=21&&gkCorner.y<=79);
 const fk=b.createMatch(),free={type:'free-kick',teamNumber:1,zone:15,point:{x:78,y:50},routine:'direct'};
 b.arrangeSetPiece(fk,free,b.setPieceTaker(fk,free));
 assert(b.active(fk.teams[2]).filter(p=>p.role!=='GK'&&p.x>=84&&p.x<=88&&Math.abs(p.y-50)<=8).length>=2,'free-kick defensive wall');
 const goalKick=b.createMatch();b.setMatch(goalKick);
 const fromGoal={type:'goal-kick',teamNumber:1,zone:2,point:{x:4,y:50},routine:'direct'};
 assert.equal(b.setPieceTaker(goalKick,fromGoal).role,'GK','keeper takes goal kick by default');
 const shotsBefore=goalKick.teams[1].stats.shots;b.resolveRestart(goalKick,fromGoal);
 assert.equal(goalKick.teams[1].stats.shots,shotsBefore,'long goal-kick must pass, never shoot at goal');
 assert(goalKick.events.some(e=>e.type==='set-piece'||e.type==='interception'),'goal kick resolves as pass');
 const saved=b.createMatch();b.setMatch(saved);
 const shooter=b.active(saved.teams[1]).filter(p=>p.role!=='GK').sort((a,c)=>a.stats.sho-c.stats.sho)[0];
 b.setPosition(shooter,{x:75,y:50});saved.possession=1;saved.carrierId=shooter.id;b.setBall(saved,shooter);
 saved.random=()=>.5;
 b.resolveShot(saved,shooter,false);
 const saveEvent=saved.events.find(e=>e.type==='save');
 assert(saveEvent,'deterministic shot should be saved');
 const keeper=b.keeper(saved.teams[2]);
 assert.equal(saved.carrierId,keeper.id,'keeper retains the ball after a catch');
 assert.equal(saved.possession,2);
 assert.equal(saved.ball.x,keeper.x);assert.equal(saved.ball.y,keeper.y);
 assert.equal(saveEvent.presentation.carrierId,keeper.id,'the reveal shows keeper with the ball');
 assert.equal(saveEvent.presentation.ball.x,keeper.x);
 const shots=[],goals=[],results=[];
 for(let seed=1;seed<=16;seed++){
  const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);
  let ticks=0;
  while(s.status!=='finished'&&ticks++<1000)advance(h,s);
  assert.equal(s.status,'finished','seed '+seed+' reaches full time');
  const shotCount=s.teams[1].stats.shots+s.teams[2].stats.shots;
  const goalCount=s.score[1]+s.score[2];
  assert.equal(shotCount,s.events.filter(e=>e.type==='shot-attempt').length,'shots match events '+seed);
  assert.equal(goalCount,s.events.filter(e=>e.type==='goal').length,'goals match events '+seed);
  assert(s.events.every(e=>!e.presentation||b.validPresentation(e.presentation,s)),'valid snapshots '+seed);
  shots.push(shotCount);goals.push(goalCount);results.push(s.score[1]+'-'+s.score[2]);
 }
 const totalShots=shots.reduce((a,c)=>a+c,0),totalGoals=goals.reduce((a,c)=>a+c,0),scoreless=goals.filter(n=>n===0).length;
 console.log('v0.8.6 16-match balance sample:',totalShots,'shots,',totalGoals,'goals,',scoreless,'scoreless');
 assert(totalShots>=100,'attacks must produce meaningful shot frequency, not 0-0 forever: '+shots);
 assert(totalGoals>=8,'goals must be possible in real-roster full matches: '+goals);
 assert(totalGoals<=96,'avoid excessive scoring');
 assert(scoreless<=8,'too many scoreless matches: '+results);
 const source=fs.readFileSync(path.join(__dirname,'../js/battle-sim.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../css/battle-renaissance.css'),'utf8');
 for(const token of ['bs-mini-card-face','bs-mini-card-info','bs-live-player-portrait','bs-live-keeper-tag'])
  assert(source.includes(token)&&css.includes(token),'portrait and sketch UI contract '+token);
 console.log('PASS v0.8.3: '+shots.length+' real-roster matches '+totalShots+' shots, '+totalGoals+' goals, '+scoreless+' scoreless; actual keeper catches, positional corners/free-kick walls/goal kicks, PAS/SHO contextual set pieces and portrait cards');
}
if(require.main===module)runBattleV083Tests();module.exports={runBattleV083Tests};
