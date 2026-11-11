#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createModeTestContext}=require('./game-modes-tests'),{battleContext}=require('./battle-sim-tests');
function runRosterExpansionTests(){
 const {context,run}=createModeTestContext();
 run(`
  const names=['Akira Endoji','Yukio Ishikari','Birkenstock','Erik Gesner','Ignacio Lara','Ryo Nameoka','Ringo Pondemizu','Camus'];
  const additions=players.filter(p=>p.id>=91);
  assert.deepEqual(additions.map(p=>p.name),names);assert.equal(players.filter(p=>!p.secretCharacter).length,88);
  for(const p of additions){
   assert(p.statEstimate&&!p.secretCharacter&&secretPlayerAvailable(p));
   assert(challengePool().includes(p.id));assert(PLAYER_REFERENCE_CONTENT_REVIEW.players[p.id]);
   const record=playerRecord(p.id);assert(record.profile.overview&&record.profile.positionAudit.throughChapter===368);
   assert(record.categories.length);assert(p.teamHistory.length);
   assert(p.weapons.every(w=>w.source&&w.source.note&&w.category));
   assert.equal(verifiedPlayerQuotes(p.id).length,0,'Unverified dialogue must stay absent');
   if(p.id!==93)assert.equal(playerOverall(p),calculatePositionOVR(p,primaryPosition(p)));
  }
  assert.equal(playerOverall(playerById(93)),86);assert.equal(calculatePositionOVR(playerById(93),'CB'),79);
  for(const id of [93,94,95])assert.equal(playerById(id).nationality,null,'Club affiliation is not nationality');
  for(const id of [91,93,95])assert.equal(playerById(id).weapons.length,0,'No invented signature skill');
  assert.deepEqual(playerById(92).weapons.map(w=>w.id),['aerial-reach']);
  assert.deepEqual(playerById(94).weapons.map(w=>w.id),['ball-control','lofted-passing']);
  assert.deepEqual(playerById(96).weapons.map(w=>w.id),['physical-power']);
  assert.deepEqual(playerById(97).weapons.map(w=>w.id),['headers']);assert.equal(playerById(97).jerseyNumber,undefined);
  assert.deepEqual(playerById(98).weapons.map(w=>w.id),['speed','opponent-pre-analysis']);
  assert.equal(playerById(96).debutChapter,327);assert(playerById(96).debutNote.includes('Episode Nagi chapter 1'));
  assert.equal(verifiedPlayerAliases(92)[0].name,'The Tallest High Schooler');
  assert(PLAYER_POOL_CATEGORY_IDS['blue-lock-project'].has(96)&&PLAYER_POOL_CATEGORY_IDS['side-b'].has(96));
  const legacy={v:1,name:'Mixed roster',color:'#123abc',playerIds:[8,1,27,...additions.map(p=>p.id)],formation:'4-3-3',assignment:{0:8,1:93,2:91,3:92,4:95,5:27,6:94,7:96,8:98,9:1,10:97},captainId:1};
  const saved=exportSquadCode(legacy);assert.deepEqual(importSquadCode(saved).playerIds,legacy.playerIds);
  team1={name:'Expansion',color:'#123abc',budget:12350,players:additions};team2={name:'Legacy',color:'#321abc',budget:15000,players:[playerById(8)]};remainingPlayers=[playerById(1),playerById(27)];uiState={screen:'auction',phase:'opening',turn:1};
  const snapshot=JSON.parse(JSON.stringify(auctionSnapshot()));assert(isSaveSnapshot(snapshot));team1.players=[];assert(hydrateAuctionSnapshot(snapshot));assert.deepEqual(team1.players.map(p=>p.id),additions.map(p=>p.id));assert.equal(team1.budget,12350);
  assert(!auctionSaveNeedsSecretCode(snapshot));
 `);
 const h=battleContext();h.bs.quiet();
 h.bs.setTeams(h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Expanded '+n,formation:'4-3-3',roster:[blueLockManFor(n),...players.filter(p=>p.id>=91),...players.filter(p=>!p.secretCharacter).slice(0,5)],assignment:{0:9100+n,1:93,2:91,3:92,4:95,5:27,6:94,7:96,8:98,9:1,10:97}},n))`));
 const state=h.bs.createMatch();h.bs.setMatch(state);
 for(const t of Object.values(state.teams))for(const formation of h.run('Object.keys(FORMATIONS)')){
  t.formation=formation;t.slots=h.bs.formationSlots(formation);
  for(const p of t.roster.filter(p=>Number(p.id)>=91&&Number(p.id)<=98)){
   p.stamina=100;const full=h.bs.playerOVR(t,p);assert(Number.isFinite(full.position)&&full.live===full.position);
   p.stamina=30;assert(h.bs.playerOVR(t,p).live<=full.live);p.stamina=100;
  }
 }
 const restored=h.bs.hydrateMatch(JSON.parse(JSON.stringify(h.bs.snapshotMatch(state))));assert(restored);
 for(const n of [1,2])for(let id=91;id<=98;id++)assert(restored.teams[n].roster.some(p=>Number(p.id)===id),'Battle save dropped '+id);
 // Resolve all added permanent content through the actual locale runtime.
 const additions=JSON.parse(run('JSON.stringify(players.filter(p=>p.id>=91))'));
 const text=additions.flatMap(p=>[run(`playerRecord(${p.id}).profile.overview`),...p.weapons.flatMap(w=>[w.name,w.description]),...p.teamHistory.map(t=>t.name)]);
 for(const language of ['en','ms','ja','ar','zh-CN','fr','de','ko','pt','ru','es']){
  context.window.SitePreferences={get:()=>({language}),locales:[{code:language}]};
  for(const file of ['js/i18n/messages.js','js/i18n/battle-messages.js','js/localization.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),context);
  for(const source of text){const rendered=context.window.SiteI18n.text(source);assert(rendered&&rendered!=='[object Object]');if(language!=='en'&&!/^(?:Paris X Gen|Ubers|Bastard München|FC Barcha|Side-B|Team [AC]|Blue Lock Eleven|France U-20)$/.test(source))assert.notEqual(rendered,source,language+': '+source);}
 }
 console.log('PASS eight-player expansion: stable public IDs, sourced skill boundaries, distinct Base/Position OVR, all formations, Auction and Battle saves, secret gating and 11-language content');
}
if(require.main===module)runRosterExpansionTests();module.exports={runRosterExpansionTests};
