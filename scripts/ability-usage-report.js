#!/usr/bin/env node
'use strict';
// Developer report: how often each Battle Sim ability is eligible, rejected (and why), chosen against
// ordinary actions, attempted and successful in ORDINARY seeded matches (nothing is forced).
//   node scripts/ability-usage-report.js [--seeds 7,29,...] [--engine path/to/battle-sim.js] [--by-seed] [--out file.json]
// The same seeds and line-ups are used for every run so before/after comparisons are like for like.
const fs=require('node:fs'),path=require('node:path');
const {battleContext}=require('./battle-sim-tests');
const {advance}=require('./battle-presentation-tests');

// 4-3-3 slots: 0 GK, 1 LB, 2 CB, 3 CB, 4 RB, 5-7 CM, 8 LW, 9 ST, 10 RW.
const LINEUPS=[
 [{0:8,1:5,2:9,3:24,4:26,5:14,6:20,7:1,8:4,9:15,10:7},{0:11,1:18,2:16,3:25,4:22,5:6,6:19,7:70,8:21,9:23,10:3}],
 [{0:8,1:5,2:9,3:24,4:26,5:14,6:20,7:21,8:4,9:15,10:1},{0:11,1:18,2:16,3:25,4:12,5:3,6:19,7:7,8:22,9:6,10:23}],
 [{0:8,1:92,2:24,3:9,4:26,5:35,6:1,7:34,8:37,9:36,10:38},{0:11,1:5,2:16,3:25,4:22,5:14,6:20,7:21,8:15,9:31,10:23}],
 // Ishikari in his canonical forward role, supplied by Pablo and Kurona.
 [{0:8,1:5,2:9,3:24,4:26,5:35,6:20,7:34,8:37,9:92,10:38},{0:11,1:18,2:16,3:25,4:12,5:3,6:19,7:7,8:22,9:6,10:23}]
];
function args(){const a=process.argv.slice(2),o={};for(let i=0;i<a.length;i++)if(a[i].startsWith('--'))o[a[i].slice(2)]=a[i+1]&&!a[i+1].startsWith('--')?a[++i]:true;return o;}
function runReport({seeds=[7,29,71,101,131,157,181,211,233,257,283,307],engine=null,lineups=LINEUPS,bySeed=false}={}){
 const pick=seed=>bySeed?seed%3:seeds.indexOf(seed)%lineups.length;   // --by-seed reproduces the first (diagnostics-only) baseline
 const source=engine?fs.readFileSync(engine,'utf8'):undefined;
 const scorers={},opp={},ult={},chips={},flows={},hotline=[],speech={total:0,byKey:{}};let ticks=0,ms=0,goals=0,events=0;const perSeed=[];
 for(const seed of seeds){
  const h=battleContext(source),b=h.bs;b.quiet();h.context.__bsOpportunity=opp;h.context.__bsUltimates=ult;
  const L=lineups[pick(seed)],cfg=(n,a)=>`bs.normalizeTeam({name:'T${n}',formation:'4-3-3',roster:${JSON.stringify(Object.values(a))}.map(playerById),assignment:${JSON.stringify(a)}},${n})`;
  let teams=h.run(`[${cfg(1,L[0])},${cfg(2,L[1])}]`);if(Math.floor(seed/3)%2===1)teams=teams.reverse().map((t,i)=>h.run(`bs.normalizeTeam(${JSON.stringify(t)},${i+1})`));
  b.setTeams(teams);const s=b.createMatch();b.setMatch(s);s.seed=seed;s.random=b.seeded(seed);let guard=0,hl=null;const t0=Date.now();
  while(s.status!=='finished'&&guard++<1500){
   const before=s.events.length;advance({bs:b},s);
   const seq=s.planetHotline;
   if(seq&&!hl){const t=s.teams[seq.teamNumber];hl={team:seq.teamNumber,start:b.aheadM?null:null,ball0:{x:s.ball.x,y:s.ball.y},tick:s.tick,passes:0};}
   if(hl){for(const e of s.events.slice(before))if(e.type==='pass'&&e.teamNumber===hl.team&&e.actors&&e.actors.some(a=>['1','26'].includes(String(a.id))))hl.passes++;}
   if(hl&&!s.planetHotline){const dir=hl.team===1?1:-1,adv=(s.ball.x-hl.ball0.x)*1.05*dir;hotline.push({seed,progressMetres:+adv.toFixed(1),passes:hl.passes,kept:s.possession===hl.team});hl=null;}
  }
  ms+=Date.now()-t0;ticks+=s.tick;goals+=s.score[1]+s.score[2];events+=s.events.length;perSeed.push({seed,lineup:pick(seed),score:[s.score[1],s.score[2]],ticks:s.tick});
  for(const e of s.events){
   if(e.type==='goal'){const k=e.actors[0].name+(e.ability?' ['+e.ability.label+']':'');scorers[k]=(scorers[k]||0)+1;}
   if(e.type==='flow-activation'){const k=e.actors[0].name;flows[k]=(flows[k]||0)+1;}
   if(e.ability){const k=e.ability.kind+':'+e.ability.id;chips[k]=(chips[k]||0)+1;}
   if(e.reaction){const k='reaction:'+e.reaction.id;chips[k]=(chips[k]||0)+1;}
   for(const line of e.dialogue||[]){speech.total++;const t=String(line.text||line);speech.byKey[t]=(speech.byKey[t]||0)+1;}
  }
 }
 const diag={};for(const [k,v] of Object.entries(opp)){if(!k.startsWith('diag:'))continue;const [,ability,...ev]=k.split(':');(diag[ability]=diag[ability]||{})[ev.join(':')]=v;}
 const reasons=Object.fromEntries(Object.entries(opp).filter(([k])=>!k.startsWith('diag:')).sort());
 const progress=hotline.map(h=>h.progressMetres);
 return{seeds,matches:seeds.length,goalsPerMatch:+(goals/seeds.length).toFixed(2),perSeed,msPerTick:+(ms/ticks).toFixed(2),
  hotline:{sequences:hotline.length,meanProgressMetres:progress.length?+(progress.reduce((a,b)=>a+b,0)/progress.length).toFixed(1):0,keptPossession:hotline.filter(h=>h.kept).length,samples:hotline.slice(0,12)},
  flowActivations:flows,scorers:Object.fromEntries(Object.entries(scorers).sort((a,b)=>b[1]-a[1])),feedChips:chips,ultimateOutcomes:ult,diagnostics:diag,conditionCounters:reasons,
  dialogue:{lines:speech.total,perMatch:+(speech.total/seeds.length).toFixed(1),mostRepeated:Object.entries(speech.byKey).sort((a,b)=>b[1]-a[1]).slice(0,15)}};
}
if(require.main===module){const a=args();const r=runReport({seeds:a.seeds?String(a.seeds).split(',').map(Number):undefined,engine:a.engine?path.resolve(a.engine):null,bySeed:!!a['by-seed']});
 const text=JSON.stringify(r,null,1);if(a.out)fs.writeFileSync(a.out,text+'\n');else console.log(text);}
module.exports={runReport,LINEUPS};
