#!/usr/bin/env node
'use strict';
// Optional real-browser gate. Requires Playwright + Chromium and a local HTTP server.
// Example: node scripts/browser-battle-sim.js http://127.0.0.1:8765/ /tmp/bld-browser-qa
// This script is deliberately separate from dependency-free preflight.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=process.argv[2]||'http://127.0.0.1:8765/',output=path.resolve(process.argv[3]||'/tmp/bld-browser-qa');
const sizes=[[1366,768],[320,640],[390,844],[430,932],[932,430],[1024,768],[1280,720],[1440,900],[1920,1080]];
async function main(){
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BLD_CHROMIUM?{executablePath:process.env.BLD_CHROMIUM}:{})});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
  async function preferences(theme,language='en'){
   await page.locator('#siteSettingsToggle').click();await page.locator(`[name="siteTheme"][value="${theme}"]`).check();await page.locator('#siteLanguage').selectOption(language);await page.locator('#siteSettingsToggle').click();
  }
  async function geometry(){
   const info=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,players:document.querySelectorAll('.bs-live-player').length,ball:document.querySelectorAll('.bs-live-ball').length,pitch:getComputedStyle(document.getElementById('bs-pitch')).display,direction:getComputedStyle(document.getElementById('bs-pitch')).direction}));
   assert(!info.overflow,'horizontal overflow');assert.equal(info.pitch,'block');assert.equal(info.ball,1);assert.equal(info.direction,'ltr');assert(info.players>0&&info.players<=22);
  }
  async function capture(screen){for(const theme of ['dark','light']){await preferences(theme);for(const [width,height] of sizes){await page.setViewportSize({width,height});await page.clock.runFor(1);if(screen==='live')await geometry();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:path.join(output,`${screen}-${theme}-${width}x${height}.png`),fullPage:true});}}await page.setViewportSize({width:1440,height:900});}
  await page.goto(new URL('battle-sim/initializer/',base).href);await page.locator('#bs-start-match').waitFor({state:'visible'});await capture('setup');
  await page.locator('#bs-start-match').click();await page.locator('#bs-pitch').waitFor({state:'visible'});await page.locator('#bs-feed-delay').press('Home');
  // Pause during presentation, then change speed without releasing the event.
  await page.locator('#bs-pause-match').click();const paused=await page.locator('#bs-event-count').innerText();await page.locator('#bs-feed-delay').press('ArrowRight');await page.clock.runFor(5000);assert.equal(await page.locator('#bs-event-count').innerText(),paused);await page.locator('#bs-pause-match').click();await page.locator('#bs-feed-delay').press('Home');
  let iterations=0,stoppages=0,halfTime=false,reloaded=false,substituted=false,captured=false;
  while(await page.locator('#bs-match-view').isVisible()){
   assert(iterations++<1800,'match did not reach full-time');
   if(await page.locator('#bs-proceed-match').isEnabled()){
    stoppages++;halfTime||=(await page.locator('#bs-stoppage-title').innerText()).includes('HALF TIME');
    if(!captured){await capture('live');await preferences('light','ar');await geometry();await page.screenshot({path:path.join(output,'live-arabic-light.png'),fullPage:true});await preferences('dark');captured=true;}
    if(!substituted){const select=page.locator('[data-sub-target-for]').first();const slot=await select.locator('option').nth(1).getAttribute('value');await select.selectOption(slot);await page.locator('[data-sub-in]').first().click();assert(!(await page.locator('#bs-proceed-match').isEnabled()));substituted=true;}
    else{await page.locator('#bs-proceed-match').click();assert(!(await page.locator('#bs-proceed-match').isEnabled()),'Proceed did not disable immediately');}
   }else if(await page.locator('#bs-required-sub-player').isVisible()){
    const option=page.locator('#bs-required-sub-player option').nth(1);await page.locator('#bs-required-sub-player').selectOption(await option.getAttribute('value'));await page.locator('[data-required-substitute]').click();
   }
   if(!reloaded&&stoppages>=2){await page.reload();await page.locator('#bs-pitch').waitFor({state:'visible'});reloaded=true;}
   // Check the actual visible state against the persisted revealed snapshot.
   if(await page.locator('#bs-match-view').isVisible())assert(await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('blBattleSimActiveMatchV1'));if(!s)return true;const v=s.events[(s.presentedEventId||0)-1]?.presentation||s.events[0]?.presentation;if(!v)return false;return [1,2].every(n=>document.getElementById('bs-score-'+n).textContent===String(v.score[n]))&&Number(document.getElementById('bs-event-count').textContent.split(' ')[0])===(s.presentedEventId||0);}), 'score/feed revealed state mismatch');
   await page.clock.runFor(500);
  }
  assert(halfTime&&reloaded&&substituted&&stoppages>1);await page.locator('#bs-results-view').waitFor({state:'visible'});await capture('results');
  await page.locator('#bs-rematch').click();await page.locator('#bs-fast-forward').click();await page.locator('#bs-results-view').waitFor({state:'visible'});await page.reload();await page.locator('#bs-results-view').waitFor({state:'visible'});
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({iterations,stoppages,halfTime,reloaded,substituted,sizes,errors},null,2));
  console.log('PASS real-browser match, timer/input controls, stoppages, half/full-time, substitution, reload, fast-forward and screenshot matrix:',output);
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
