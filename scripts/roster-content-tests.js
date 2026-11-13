#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createModeTestContext}=require('./game-modes-tests'),{battleContext}=require('./battle-sim-tests');
const baseline=require('./fixtures/roster-v088.json');
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function runRosterContentTests(){
 const {run}=createModeTestContext();
 const current=JSON.parse(run('JSON.stringify(players)'));
 for(const p of current.filter(p=>p.id<=89)){
  const copy=JSON.parse(JSON.stringify(p)),allow=baseline.allowed[p.id]||{};
  for(const key of allow.stats||[])delete copy.stats[key];if(allow.positions)delete copy.positions;
  for(const weapon of copy.weapons||[])if(weapon.id===allow.weapon)delete weapon.description;
  assert.equal(hash(copy),baseline.hashes[p.id],'Unapproved attribute or metadata change: '+p.name);
 }
 assert.deepEqual(current.map(p=>p.id),Array.from({length:98},(_,i)=>i+1),'Append-only roster IDs');
 const stable=require('./fixtures/roster-v0881.json');
 for(const p of current.filter(p=>p.id<=90))assert.equal(hash(p),stable.hashes[p.id],'Existing player changed: '+p.name);
 const permitted=[['floppy_willy','jon',65],['hdannyy','floppy_willy',92],['Yoichi Isagi','Ryusei Shido',61],['Yoichi Isagi','Hyoma Chigiri',93]],keys=new Set(permitted.map(p=>p.slice(0,2).sort().join('|')));
 const pairs=run('CHEMISTRY_SPECIAL_PAIRS');
 assert.equal(hash(pairs.filter(p=>!keys.has(p.slice(0,2).sort().join('|')))),baseline.chemistryHash,'Unapproved chemistry pair edit');
 assert.equal(hash(run('CHEMISTRY_CONTEXTS')),baseline.contextHash,'Existing chemistry contexts stay unchanged');
 for(const [a,b,score]of permitted)assert.equal(run(`playerChemistry(players.find(p=>p.name===${JSON.stringify(a)}),players.find(p=>p.name===${JSON.stringify(b)}))`),score);
 run(`
  assert.equal(APP_SUPPORTED_CHAPTER,368);assert.equal(players.filter(p=>!p.secretCharacter).length,88);assert.equal(players.filter(p=>p.secretCharacter).length,10);
  for(const [id,base]of [[83,94],[82,73],[84,80],[89,71],[85,94],[88,85],[86,88]])assert.equal(playerOverall(playerById(id)),base);
  for(const [id,stats]of [[83,{gk:73,dri:93}],[82,{spd:64,dri:68,sho:75}],[84,{spd:68}],[89,{sho:72,dri:79,spd:75}],[85,{pas:90,off:95,spd:92}],[88,{sho:90,def:78}],[86,{sho:90}]])for(const [key,value]of Object.entries(stats))assert.equal(playerById(id).stats[key],value);
  assert.deepEqual(playerPositions(playerById(83)),['RW','LW','CF','CM']);assert(!playerPositions(playerById(83)).includes('GK'));assert.equal(playerById(83).stats.gk,73);
  assert.equal(calculatePositionOVR(playerById(85),'CM'),93);assert.equal(playerOverall(playerById(85)),94);
  assert.equal(effectiveOVR(playerById(85),'CM'),94,'Shared position model retains its Base OVR anchor');
  for(const [id,target,position]of [[34,96,96],[35,95,95],[36,96,95],[37,95,95]]){const p=playerById(id);assert.equal(playerOverall(p),target);assert.equal(calculatePositionOVR(p,primaryPosition(p)),position);} // v0.8.9.4: Blake's OFF/SHO 100→99 (public 99 cap) lowers his derived FW rating by one; Base OVR is unchanged
  const exum=playerById(90);assert.equal(exum.name,'Exum');assert.equal(exum.primaryPosition,'DM');assert.equal(exum.debutChapter,368);assert.equal(exum.jerseyNumber,13);assert(!exum.secretCharacter);
  assert.deepEqual(exum.stats,{ovr:81,off:79,sho:68,pas:82,dri:78,spd:91,def:95,gk:39});
  assert.equal(calculatePositionOVR(exum,'DM'),81);assert.deepEqual(exum.weapons.map(w=>w.id),['man-marking']);assert.equal(verifiedPlayerQuotes(90).length,0);assert(PLAYER_POOL_CATEGORY_IDS['world-cup-new'].has(90));
  assert(!secretCharactersUnlocked);assert(challengePool().includes(90));assert(challengePool().every(id=>!playerById(id).secretCharacter));
  team1={name:'Saved Exum',color:'#123abc',budget:14750,players:[exum,playerById(8)]};team2={name:'B',color:'#ff1234',budget:15000,players:[playerById(7)]};remainingPlayers=[playerById(1),playerById(27)];uiState={screen:'auction',phase:'opening',turn:1};
  const auction=JSON.parse(JSON.stringify(auctionSnapshot()));assert(isSaveSnapshot(auction));team1.players=[];team1.budget=0;assert(hydrateAuctionSnapshot(auction));assert.equal(team1.budget,14750);assert.equal(team1.players[0],exum);assert.deepEqual(team1.players.map(p=>p.id),[90,8]);
  assert(!auctionSaveNeedsSecretCode({team1:{players:[90]},team2:{players:[8]},remainingPlayerIds:[1],selectedPlayerIds:[90,8,1],currentPlayerId:90,auctionHistory:[]}));
  const squad={v:1,name:'Legacy IDs',color:'#123abc',playerIds:[1,7,8,27,28],formation:'4-3-3',assignment:{0:8,5:28,6:27,8:7,9:1},captainId:1};
  assert.deepEqual(importSquadCode(exportSquadCode(squad)).playerIds,squad.playerIds);
  const newSquad={...squad,name:'New roster',playerIds:[...squad.playerIds,90],assignment:{...squad.assignment,7:90}};assert(importSquadCode(exportSquadCode(newSquad)).playerIds.includes(90));
  secretCharactersUnlocked=true;const secret={...squad,playerIds:[85],assignment:{6:85},captainId:85};const code=exportSquadCode(secret);secretCharactersUnlocked=false;assert.throws(()=>importSquadCode(code),/Unlock secret/);
 `);
 const h=battleContext();h.bs.quiet();
 h.bs.setTeams(h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,formation:'4-3-3',roster:[blueLockManFor(n),playerById(90),...players.filter(p=>!p.secretCharacter&&p.id!==90).slice((n-1)*12,(n-1)*12+12)],assignment:{0:9100+n,5:90}},n))`));
 const state=h.bs.createMatch();h.bs.setMatch(state);
 for(const n of [1,2])for(const formation of h.run('Object.keys(FORMATIONS)')){
  const t=state.teams[n];t.formation=formation;t.slots=h.bs.formationSlots(formation);
  const p=t.roster.find(p=>Number(p.id)===90);assert(p);
  const rating=h.bs.playerOVR(t,p);assert(rating&&rating.live===rating.position);p.stamina=50;assert(h.bs.playerOVR(t,p).live<=rating.position);p.stamina=100;
 }
 const saved=JSON.parse(JSON.stringify(h.bs.snapshotMatch(state))),restored=h.bs.hydrateMatch(saved);assert(restored);assert(restored.teams[1].roster.some(p=>Number(p.id)===90));
 // Validate newly edited canonical copy against every translation catalog, not just HTML strings.
 const records=require('./localization-sanity').load(path.resolve(__dirname,'..')),catalog=new Map(records.map(r=>[r.source,r.values]));
 for(const id of [1,7,27,28,31,90,91,92,93,94,95,96,97,98]){
  const p=current.find(p=>p.id===id),overview=run(`playerRecord(${id}).profile.overview`);
  for(const text of [overview,...p.weapons.flatMap(w=>[w.name,w.description])]){
   assert(catalog.has(text),'Missing content translation: '+text);for(const language of require('./localization-sanity').languages)assert(catalog.get(text)[language]);
  }
  assert(!/chapter|recently|368/i.test(overview),'Timeless profile: '+id);
 }
 const captions=['Verified deployments through chapter 368. Gameplay eligibility is unchanged.','No specific deployment was sufficiently verified through chapter 368. Gameplay badges are not canon evidence.','FAN MODEL // CANON GAMEPLAY THROUGH CH.368'];
 for(const language of ['en',...require('./localization-sanity').languages]){
  const {context}=createModeTestContext();context.window.SitePreferences={get:()=>({language}),locales:[{code:language}]};
  for(const file of ['js/i18n/messages.js','js/i18n/battle-messages.js','js/localization.js'])require('node:vm').runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),context);
  for(const caption of captions){const translated=context.window.SiteI18n.text(caption);assert(translated.includes('368'));if(language!=='en')assert.notEqual(translated,caption);if(language==='ar')assert(translated.includes('\u2068368\u2069'),'Arabic chapter numbers retain directional isolation');}
 }
 console.log('PASS roster content: all existing IDs and protected metadata pinned; approved Base/Position OVR and chemistry; Exum public access, secret gating, squad-code compatibility, all formations, Battle Sim hydration and 11-language content');
}
if(require.main===module)runRosterContentTests();module.exports={runRosterContentTests};
