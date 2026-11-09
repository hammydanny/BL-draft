#!/usr/bin/env node
'use strict';
// Optional DOM-only exercise. Install linkedom outside the project and expose it
// through NODE_PATH. This does not test browser layout, paint or real input.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const {battleContext}=require('./battle-sim-tests.js');
const h=battleContext(),{document}=parseHTML(fs.readFileSync(path.join(__dirname,'../battle-sim/game/index.html'),'utf8'));h.context.document=document;h.context.window.SiteI18n={text:x=>x,apply(){}};h.context.window.scrollTo=()=>{};
Object.defineProperty(Object.getPrototypeOf(document.createElement('select')),'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(v){for(const o of this.querySelectorAll('option')){if(o.value===v)o.setAttribute('selected','');else o.removeAttribute('selected');}}});
let now=0;h.context.Date=class extends Date{static now(){return now;}};let final=false;h.context.updateRoute=route=>{if(route==='battleSimResults'){final=true;h.bs.showResults();}};
h.bs.setTeams(h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+14)],assignment:{0:9100+n}},n))`));h.context.window.crypto={getRandomValues:a=>a[0]=42};let s=h.bs.createMatch();s.introPending=true;h.bs.setMatch(s);h.bs.renderMatchIntro();assert(document.getElementById('bs-broadcast-intro'),'intro overlay renders');assert.equal(document.querySelectorAll('.bs-intro-player-row').length,11,'the XI is listed');assert.equal(document.querySelectorAll('.bs-intro-pitch-player').length,11,'formation markers render');assert(document.getElementById('bs-skip-intro'),'skip control is available');s.manualPaused=true;h.bs.finishMatchIntro();assert.equal(s.introPending,false,'skip clears pending intro');assert.equal(document.getElementById('bs-broadcast-intro'),null,'skip dismisses intro');s.manualPaused=false;h.bs.clearFeedQueue();h.timers.clear();h.bs.renderMatch();assert.equal(document.querySelectorAll('.bs-live-player').length,22);assert.equal(document.querySelectorAll('.bs-live-ball').length,1);
for(const panel of document.querySelectorAll('.bs-match-team-panel'))for(const line of panel.querySelectorAll('.bs-mini-chemistry-lines line'))for(const [end,slot] of [[1,line.dataset.slotA],[2,line.dataset.slotB]]){const marker=panel.querySelector('.bs-formation-player[data-slot="'+slot+'"]');assert.equal(Number(line.getAttribute('x'+end)),parseFloat(marker.style.getPropertyValue('--player-x')));assert.equal(Number(line.getAttribute('y'+end)),parseFloat(marker.style.getPropertyValue('--player-y')));}
const center=document.querySelector('.bs-center-stage'),stoppage=document.getElementById('bs-stoppage-panel'),feedPanel=document.querySelector('.bs-live-feed-panel');assert([...center.children].indexOf(stoppage)<[...center.children].indexOf(feedPanel));assert.equal(document.querySelectorAll('#bs-proceed-match').length,1);
const actor=h.bs.active(s.teams[1])[1],key='1:'+actor.id;h.bs.addPoints(actor,5);h.bs.renderPitch();assert(!document.querySelector('[data-live-player="'+key+'"]').classList.contains('is-flowing'),'no future aura');h.bs.playerTick(s);s.presentedEventId=s.events.length;h.bs.renderPitch();assert(document.querySelector('[data-live-player="'+key+'"]').classList.contains('is-flowing'));actor.flowFullTicks=29;h.bs.playerTick(s);s.presentedEventId=s.events.length;h.bs.renderPitch();assert(!document.querySelector('[data-live-player="'+key+'"]').classList.contains('is-flowing'),'aura expires');h.bs.clearFeedQueue();s=h.bs.createMatch();h.bs.setMatch(s);h.bs.renderMatch();
const nodes=[...document.querySelectorAll('.bs-live-player')];h.bs.renderMatch();assert.deepEqual([...document.querySelectorAll('.bs-live-player')],nodes);
function timer(){const entry=[...h.timers.entries()].sort((a,b)=>a[1].delay-b[1].delay)[0];assert(entry,'running match must have a timer');const [id,t]=entry;h.timers.delete(id);now+=t.delay;t.fn();}
// Suspend midway through kickoff and rescale the remaining fraction.
now=500;h.bs.toggleManualPause();assert(s.manualPaused);assert.equal(h.timers.size,0);const speed=document.getElementById('bs-feed-delay');speed.value='.25';h.bs.handleInput({target:speed});assert.equal(h.timers.size,0);h.bs.toggleManualPause();assert.equal([...h.timers.values()][0].delay,125);timer();assert.equal(s.presentedEventId,1);
let guard=0,stops=0,half=false,sub=false,paused=false,reloaded=false;
while(!final&&guard++<1600){
 const view=h.bs.displayState();assert.equal(document.getElementById('bs-score-1').textContent,String(view.score[1]));assert.equal(document.getElementById('bs-score-2').textContent,String(view.score[2]));
 assert.equal(document.querySelectorAll('.bs-live-player').length,h.bs.active(view.teams[1]).length+h.bs.active(view.teams[2]).length);
 for(const panel of document.querySelectorAll('.bs-match-team-panel'))for(const marker of panel.querySelectorAll('[data-player-id]')){const p=view.teams[panel.dataset.team].roster.find(p=>p.id===marker.dataset.playerId);assert.equal(marker.querySelector('.bs-flow-meter').getAttribute('aria-valuenow'),String(Math.round(p.flow)));assert.equal(marker.querySelector('.bs-stamina-ring').style.getPropertyValue('--stamina'),p.stamina+'%');}
 if(h.bs.sequenceReady(s)){
  stops++;half||=s.phase==='halfTime';
  if(!sub){const t=s.teams[1],r=t.roster.find(p=>!Object.values(t.assignment).includes(p.id));assert(h.bs.substitute(t,'1',r.id));h.bs.renderMatch();assert(!h.bs.sequenceReady(s));sub=true;continue;}
  h.bs.continueMatch();const tick=s.tick;h.bs.continueMatch();assert.equal(s.tick,tick);
 }else if(s.requiredSub&&h.bs.progressionState()==='substitution'){
  const req=s.requiredSub,t=s.teams[req.teamNumber],r=t.roster.find(p=>!Object.values(t.assignment).includes(p.id)&&!p.sentOff);if(r)h.bs.substitute(t,req.slot,r.id);else s.requiredSub=null;h.bs.renderMatch();
 }else{
  if(!paused&&s.tick>10){h.bs.toggleManualPause();const before=s.presentedEventId;assert.equal(h.timers.size,0);h.bs.renderMatch();assert.equal(s.presentedEventId,before);h.bs.toggleManualPause();paused=true;}
  if(!reloaded&&s.tick>20){const restored=h.bs.hydrateMatch(JSON.parse(JSON.stringify(h.bs.snapshotMatch(s))));assert(restored);const expected=s.presentedEventId;h.bs.clearFeedQueue();h.timers.clear();s=restored;h.bs.setMatch(s);h.bs.renderMatch();assert.equal(s.presentedEventId,expected);if(s.status==='playing')h.bs.runSequence(s);reloaded=true;}
  timer();
 }
}
assert(final,'results reached automatically');assert(half);assert(stops>1);assert(sub&&paused&&reloaded);assert.equal(h.timers.size,0);console.log(JSON.stringify({mode:'linkedom; no browser layout/paint',seed:42,stops,half,sub,paused,reloaded,iterations:guard,score:s.score,events:s.events.length,saveBytes:JSON.stringify(h.bs.snapshotMatch(s)).length}));
