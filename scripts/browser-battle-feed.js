#!/usr/bin/env node
'use strict';
// Optional real-browser check of the Battle Sim live feed for character kits (v0.8.9.1).
// Browser-level replacement for the linkedom DOM exercise when linkedom is unavailable.
// Requires Playwright + Chromium and a local HTTP server:
//   node scripts/browser-battle-feed.js http://127.0.0.1:8765/ /tmp/bld-feed-qa
// It builds a seeded match in Node with the real engine, stops on an event that carries a character
// ability (and, if found, a chemical reaction) with a keyed character line, restores that save in the
// browser and checks chips, translated lines, the run route and layout in several languages and sizes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {setup}=require('./battle-v089-tests.js');
const {advance}=require('./battle-presentation-tests.js');
const base=process.argv[2]||'http://127.0.0.1:8765/',output=path.resolve(process.argv[3]||'/tmp/bld-feed-qa');

function savedMatch(stars,want){
 const {b}=setup(stars,'4-4-2');
 for(let seed=1;seed<=40;seed++){
  const s=b.createMatch();s.seed=seed;s.random=b.seeded(seed);b.setMatch(s);let g=0;
  while(s.status!=='finished'&&g++<1300){advance({bs:b},s);const e=s.events.at(-1);
   if(s.status==='playing'&&e&&want(e)){s.presentedEventId=s.events.length;s.status='paused';s.manualPaused=true;s.stoppage='PLAY PAUSED';return {snapshot:b.snapshotMatch(s),event:e};}}
 }
 throw new Error('no qualifying event for '+stars);
}
async function main(){
 fs.mkdirSync(output,{recursive:true});
 const cases=[
  {name:'reaction',stars:[1,27],want:e=>e.reaction&&e.dialogue.some(d=>d.key)},
  {name:'bachira',stars:[4],want:e=>e.ability&&String(e.ability.id).startsWith('creative')},
  {name:'chigiri',stars:[7,1],want:e=>(e.ability&&['no-break-dribble','high-speed-cut-in','golden-zone-shot'].includes(e.ability.id))||(e.reaction&&e.reaction.id==='speed-and-vision')},
  {name:'raichi',stars:[9],want:e=>e.ability&&['man-marking','relentless-duel'].includes(e.ability.id)},
  {name:'kunigami',stars:[6],want:e=>e.ability&&['power-shot','physical-dominance','ambidextrous-finishing','physical-man-marking','rush-volley'].includes(e.ability.id)},
  {name:'igarashi',stars:[5],want:e=>e.ability&&['malicia','right-side-trap'].includes(e.ability.id)},
  {name:'noa',stars:[3],want:e=>e.ability&&e.ability.id==='machine-dribble'}
 ];
 const browser=await chromium.launch({headless:true,...(process.env.BLD_CHROMIUM?{executablePath:process.env.BLD_CHROMIUM}:{})});
 const report=[];
 try{
  for(const c of cases){
   const {snapshot,event}=savedMatch(c.stars,c.want);
   for(const [lang,theme,width,height] of [['en','dark',1440,900],['ja','light',1280,720],['ar','dark',1440,900],['en','light',390,844]]){
    const ctx=await browser.newContext({viewport:{width,height}}),errors=[];
    await ctx.addInitScript(s=>{try{if(!sessionStorage.getItem('qa-feed')){sessionStorage.setItem('blBattleSimActiveMatchV1',s);sessionStorage.setItem('qa-feed','1');}}catch(e){}},JSON.stringify(snapshot));
    const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(new URL('battle-sim/game/',base).href);await page.locator('#bs-pitch').waitFor({state:'visible'});
    if(lang!=='en'||theme!=='dark'){
     if(!(await page.locator('#siteSettingsToggle').isVisible()))await page.setViewportSize({width:1280,height:800});
     await page.locator('#siteSettingsToggle').click();await page.locator(`[name="siteTheme"][value="${theme}"]`).check();await page.locator('#siteLanguage').selectOption(lang);await page.locator('#siteSettingsToggle').click();
     await page.setViewportSize({width,height});await page.waitForTimeout(400);
    }
    const info=await page.evaluate(()=>{const first=document.querySelector('.bs-feed-event');return{
     chips:[...first.querySelectorAll('.bs-event-ability-label')].map(x=>x.textContent.trim()),badgeBeforeCards:(()=>{const r=first.querySelector('.bs-event-abilities'),a=first.querySelector('.bs-event-actors');return !r||!a||!!(r.compareDocumentPosition(a)&Node.DOCUMENT_POSITION_FOLLOWING);})(),
     lines:[...first.querySelectorAll('.bs-event-line-text')].map(x=>x.textContent.trim()),
     route:(()=>{const r=document.querySelector('.bs-run-route');return r?getComputedStyle(r).opacity:null;})(),
     overflow:document.documentElement.scrollWidth>innerWidth+1,dir:document.documentElement.dataset.textDirection||'ltr'};});
    const expectChips=[event.reaction,event.ability,event.abilityNote].filter(Boolean).length;
    assert.equal(info.chips.length,expectChips,c.name+' '+lang+': one chip per ability/reaction');
    assert(info.chips.every(t=>t.length>0),'chips have text');assert(info.badgeBeforeCards,'ability label sits above the player cards');
    if(lang!=='en')assert(info.chips.every((t,i)=>t!==[event.reaction,event.ability,event.abilityNote].filter(Boolean)[i].label),c.name+' '+lang+': chips translated '+info.chips);
    const keyed=event.dialogue.filter(d=>d.key);assert.equal(info.lines.length,keyed.length,'keyed lines rendered');
    if(lang!=='en')info.lines.forEach((t,i)=>assert.notEqual(t,keyed[i].key,c.name+' '+lang+': line translated'));
    if(event.runRoute)assert.equal(info.route,'1','run route drawn');else assert.notEqual(info.route,'1','no stale run route');
    assert(!info.overflow,c.name+' '+lang+' '+width+': no horizontal overflow');
    if(lang==='ar')assert.equal(info.dir,'rtl');
    assert.deepEqual(errors,[],'no page errors');
    await page.locator('.bs-feed-event').first().screenshot({path:path.join(output,`${c.name}-${lang}-${theme}-${width}.png`)});
    report.push(c.name+'/'+lang+'/'+width+':'+info.chips.join('+'));
    await ctx.close();
   }
  }
 }finally{await browser.close();}
 console.log('PASS browser feed: character ability/reaction chips, translated keyed lines, run routes, RTL and no overflow ('+report.length+' views):',output);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
