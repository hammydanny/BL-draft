#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),{battleContext}=require('./battle-sim-tests');
function runRefinementTests(){
 const h=battleContext();h.bs.quiet();
 const configs=h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+14)],assignment:{0:9100+n}},n))`);h.bs.setTeams(configs);
 const state=h.bs.createMatch();h.bs.setMatch(state);
 for(const n of [1,2])for(const name of h.run('Object.keys(FORMATIONS)')){
  const team=state.teams[n];team.formation=name;team.slots=h.bs.formationSlots(name);
  // Builder uses the exact same assigned players; this is not an Auto Best call.
  h.run(`team${n}.players=${JSON.stringify(team.roster.map(p=>p.id))}.map(playerById);formationByTeam[${n}]=${JSON.stringify(name)};formationAssignments[${n}]=${JSON.stringify(Object.fromEntries(Object.entries(team.assignment).map(([k,v])=>[k,Number(v)])))};`);
  const expected=h.run(`formationContributionSnapshot(${n}).members`);
  for(const [slot,id] of Object.entries(team.assignment)){
   const p=team.roster.find(p=>p.id===id),part=expected.find(m=>String(m.player.id)===id),rating=h.bs.playerOVR(team,p);
   assert.equal(rating.position,part.effective,'Builder parity '+name+' '+slot);assert.equal(rating.live,rating.position);
   p.stamina=50;assert.equal(h.bs.playerOVR(team,p).live,Math.round(part.raw*(.85+.15*.5)));p.stamina=100;
   const point=h.bs.liveFormationPoint(team.slots[slot],n===1);assert(point.x>=12&&point.x<=88&&point.y>=10&&point.y<=90);
  }
 }
 const team=state.teams[1],p=team.roster.find(p=>p.id===team.assignment[1]);team.slots= h.bs.formationSlots('4-3-3');team.formation='4-3-3';team.slots[1]={...team.slots[1],label:'ST'};const striker=h.bs.playerOVR(team,p).position;team.slots[1]={...team.slots[1],label:'CB'};const defender=h.bs.playerOVR(team,p).position;
 assert.notEqual(striker,defender,'slot label changes invalidate ratings');
 // Record a fresh authoritative event at full stamina, then hide a future drain.
 state.events=[];state.presentedEventId=0;h.bs.addEvent(state,{type:'play',description:'Revealed view',actors:[]});state.presentedEventId=1;
 const original=h.bs.playerOVR(h.bs.displayState().teams[1],h.bs.displayState().teams[1].roster.find(v=>v.id===p.id));p.stamina=20;h.bs.addEvent(state,{type:'play',description:'Later view',actors:[]});
 const before=h.bs.displayState().teams[1];assert.equal(h.bs.playerOVR(before,before.roster.find(v=>v.id===p.id)).live,original.live);state.presentedEventId=2;
 const after=h.bs.displayState().teams[1];assert(h.bs.playerOVR(after,after.roster.find(v=>v.id===p.id)).live<original.live);
 state.status='paused';state.presentedEventId=state.events.length;const reserve=team.roster.find(p=>!Object.values(team.assignment).includes(p.id));assert.equal(h.bs.playerOVR(team,reserve),null);assert(h.bs.substitute(team,'1',reserve.id));state.presentedEventId=state.events.length;
 const shown=h.bs.displayState().teams[1];assert(h.bs.playerOVR(shown,shown.roster.find(p=>p.id===reserve.id)));assert.equal(h.bs.playerOVR(shown,shown.roster.find(v=>v.id===p.id)),null);
 assert(h.bs.hydrateMatch(JSON.parse(JSON.stringify(h.bs.snapshotMatch(state)))));
 console.log('PASS refinement: Builder parity in all formations/both teams, Blue Lock Man GK, single stamina multiplier, slot changes, substitutions, reserves, revealed-only ratings and save/reload');
}
if(require.main===module)runRefinementTests();module.exports={runRefinementTests};
