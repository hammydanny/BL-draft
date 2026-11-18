#!/usr/bin/env node
'use strict';
// Developer report: how the football looks in ORDINARY seeded matches (nothing forced).
//   node scripts/football-metrics-report.js [--seeds 7,30,...] [--goal-kicks short|direct] [--out file.json]
// Pass mix and completion (short / long / through / cross), what follows a goal kick, interceptions,
// aerial contests, second balls, who is involved (by role group), chances, goals, ability usage and cost.
// Same seeds and line-ups as scripts/ability-usage-report.js so before/after runs are like for like.
const fs=require('node:fs');
const {battleContext}=require('./battle-sim-tests');
const {advance}=require('./battle-presentation-tests');
const {LINEUPS}=require('./ability-usage-report');
const GROUP={GK:'GK',CB:'DEF',LB:'DEF',RB:'DEF',LWB:'DEF',RWB:'DEF',DM:'MID',CM:'MID',LM:'MID',RM:'MID',AM:'MID',CAM:'MID',LW:'WING',RW:'WING',ST:'FWD',CF:'FWD',SS:'FWD'};
const group=role=>GROUP[role]||(/B$/.test(role)?'DEF':/M$/.test(role)?'MID':/W$/.test(role)?'WING':'FWD');
function args(){const a=process.argv.slice(2),o={};for(let i=0;i<a.length;i++)if(a[i].startsWith('--'))o[a[i].slice(2)]=a[i+1]&&!a[i+1].startsWith('--')?a[++i]:true;return o;}
// goalKicks:'direct' replays every goal kick as a long kick (what a user who picks LONG sees), via a
// harness-only source transform; the engine itself still defaults to a short goal kick.
function runFootball({seeds=[7,30,53,76,99,122,145,168,191,214,237,260,283,306,329,352,375,398,421,444,467,490,513,536],lineups=LINEUPS,strategies=null,goalKicks='short',engineSource=null}={}){
 const engine=engineSource||fs.readFileSync(require('node:path').join(__dirname,'..','js','battle-sim.js'),'utf8'),source=goalKicks==='direct'?engine.split('goalKickTaker:"gk",routine:"short"}').join('goalKickTaker:"gk",routine:"direct"}'):engineSource||undefined;
 const t={matches:0,ticks:0,ms:0,goals:0,shots:0,passes:{},interceptions:0,aerial:{contested:0,clean:0},secondBalls:{attack:0,defence:0},
  goalKicks:{short:0,long:0,through:0,cross:0,none:0},directShots:0,directGoals:0,shotsAfterGoalKick:{short:0,long:0,through:0,cross:0},goalsAfterGoalKick:0,involvement:{},slots:{},abilities:0,perSeed:[]};
 const cat=(c,k)=>{t.passes[c]=t.passes[c]||{attempted:0,completed:0};t.passes[c][k]++;};
 for(const seed of seeds){
  const h=battleContext(source),b=h.bs;b.quiet();h.context.__bsStats={};
  const L=lineups[seeds.indexOf(seed)%lineups.length],cfg=(n,a)=>`bs.normalizeTeam({name:'T${n}',formation:'4-3-3',roster:${JSON.stringify(Object.values(a))}.map(playerById),assignment:${JSON.stringify(a)}${strategies?',strategy:'+JSON.stringify(strategies[n-1]):''}},${n})`;
  b.setTeams(h.run(`[${cfg(1,L[0])},${cfg(2,L[1])}]`));const s=b.createMatch();b.setMatch(s);s.seed=seed;s.random=b.seeded(seed);let guard=0;const t0=Date.now();
  while(s.status!=='finished'&&guard++<1500)advance({bs:b},s);
  t.ms+=Date.now()-t0;t.ticks+=s.tick;t.matches++;t.goals+=s.score[1]+s.score[2];t.perSeed.push({seed,score:[s.score[1],s.score[2]]});
  const role=new Map();for(const n of [1,2])for(const p of s.teams[n].roster)role.set(String(p.id)+':'+n,group(p.role));
  for(const n of [1,2])for(const p of b.active(s.teams[n])){const g=group(p.role);t.slots[g]=(t.slots[g]||0)+1;}
  const inv=(a,n)=>{if(!a)return;const g=role.get(String(a.id)+':'+n)||'FWD';t.involvement[g]=(t.involvement[g]||0)+1;};
  const ev=s.events;
  ev.forEach((e,i)=>{
   if(e.__cat){cat(e.__cat,'attempted');if(e.type==='pass')cat(e.__cat,'completed');if(e.__aerial)t.aerial[e.__aerial]++;}
   if(e.type==='interception')t.interceptions++;
   if(e.type==='shot-attempt'){t.shots++;inv(e.actors[0],e.teamNumber);}
   if(e.type==='pass'){inv(e.actors[0],e.teamNumber);inv(e.actors[1],e.teamNumber);}
   if(e.type==='dribble')inv(e.actors[0],e.teamNumber);
   if(e.ability)t.abilities++;
   if(e.type==='rebound')t.secondBalls[e.possessionTeamNumber===e.teamNumber?'attack':'defence']++;
   // A shot straight off a long ball, through ball or cross (the pass immediately before it, same team).
   if(e.type==='shot-attempt'||e.type==='goal'){for(let j=i-1;j>=Math.max(0,i-3);j--){const x=ev[j];if(x.type==='shot-attempt')continue;if(x.type==='pass'&&x.teamNumber===e.teamNumber&&['long','through','cross'].includes(x.__cat)){if(e.type==='goal')t.directGoals++;else t.directShots++;}break;}}
   if(e.type==='goal-kick'){
    // Only quick attacks count: the kick plus at most one more pass before the shot.
    const T=e.teamNumber;let first=null,shot=false,goal=false,passes=0;
    for(let j=i+1;j<ev.length&&Number(ev[j].tick)<=Number(e.tick)+5;j++){const x=ev[j];
     if(!first&&x.__cat&&x.teamNumber===T)first=x;if(x.type==='pass'&&x.teamNumber===T&&++passes>2)break;if(['foul','offside','corner','throw-in','goal-kick'].includes(x.type))break;
     if(x.teamNumber!==T&&['pass','dribble','shot-attempt','interception','turnover'].includes(x.type)&&x.possessionTeamNumber!==T)break;
     if(['interception','turnover'].includes(x.type)&&x.possessionTeamNumber!==T)break;
     if(x.type==='shot-attempt'&&x.teamNumber===T){shot=true;}
     if(x.type==='goal'&&x.teamNumber===T){goal=true;break;}}
    const c=first?first.__cat:'none';t.goalKicks[c]=(t.goalKicks[c]||0)+1;if(shot&&first)t.shotsAfterGoalKick[c]++;if(goal)t.goalsAfterGoalKick++;}
  });
 }
 const per=x=>+(x/t.matches).toFixed(2),out={matches:t.matches,goalsPerMatch:per(t.goals),shotsPerMatch:per(t.shots),msPerTick:+(t.ms/t.ticks).toFixed(2),
  passes:Object.fromEntries(Object.entries(t.passes).map(([k,v])=>[k,{perMatch:per(v.attempted),completion:+(v.completed/Math.max(1,v.attempted)).toFixed(3)}])),
  longShare:+((t.passes.long?.attempted||0)/Math.max(1,Object.values(t.passes).reduce((a,v)=>a+v.attempted,0))).toFixed(3),
  shotsStraightOffLongThroughOrCross:+(t.directShots/Math.max(1,t.shots)).toFixed(3),goalsStraightOffLongThroughOrCross:+(t.directGoals/Math.max(1,t.goals)).toFixed(3),
  interceptionsPerMatch:per(t.interceptions),aerialPerMatch:{contested:per(t.aerial.contested),clean:per(t.aerial.clean)},secondBalls:t.secondBalls,
  goalKicks:t.goalKicks,quickShotsAfterGoalKick:t.shotsAfterGoalKick,quickGoalsAfterGoalKick:t.goalsAfterGoalKick,
  involvementShare:Object.fromEntries(Object.entries(t.involvement).map(([k,v])=>[k,+(v/Object.values(t.involvement).reduce((a,b)=>a+b,0)).toFixed(3)])),
  touchesPerPlayerPerMatch:Object.fromEntries(Object.entries(t.involvement).map(([k,v])=>[k,+(v/Math.max(1,t.slots[k])).toFixed(1)])),
  abilityChipsPerMatch:per(t.abilities),perSeed:t.perSeed};
 return out;
}
if(require.main===module){const a=args();const r=runFootball({seeds:a.seeds?String(a.seeds).split(',').map(Number):undefined,goalKicks:a['goal-kicks']||'short'});const text=JSON.stringify(r,null,1);if(a.out)fs.writeFileSync(a.out,text+'\n');else console.log(text);}
module.exports={runFootball};
