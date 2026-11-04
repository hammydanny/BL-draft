#!/usr/bin/env node
'use strict';
// v0.7.4 Foundation Lock: cross-mode consistency, save robustness, roster/identity
// invariants and release-infrastructure guards. Gameplay values are read, never changed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {v073Context}=require('./v073-tests.js');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
function pass(label){console.log('PASS v0.7.4: '+label);}
function runV074Tests(){
    const {context,run}=v073Context(),block=code=>run('{'+code+'\n}');

    // ---------- Roster identity and totals come from player data ----------
    block(`
        const unique=[...new Set(PLAYER_BY_ID.values())];
        const secret=players.filter(p=>p.secretCharacter),publicRoster=players.filter(p=>!p.secretCharacter);
        assert(publicRoster.length>0&&secret.length>0);
        assert.equal(publicRoster.length+secret.length,players.length,'public and secret rosters partition the roster');
        assert.equal(new Set(players.map(p=>p.id)).size,players.length,'unique numeric ids');
        assert.equal(new Set(secret.map(p=>String(p.secretId).toUpperCase())).size,secret.length,'unique secret ids');
        // Blue Lock Man resolves by id but never joins the roster, the Database or any total.
        for(const id of BLUE_LOCK_MAN_IDS){assert(isBlueLockMan(playerById(id)));assert(!players.some(p=>p.id===id));}
        assert.equal(unique.length,players.length+BLUE_LOCK_MAN_IDS.length,'registry holds the roster plus Blue Lock Man only');
        // Aliases are lookups, never extra players.
        for(const p of players)assert.equal(playerById(p.id),p);
        // Base OVR is a pure function of the record.
        for(const p of unique)assert.equal(playerOverall(p),playerOverall(JSON.parse(JSON.stringify(p))),p.name+' base OVR');
        // Chemistry is symmetric and a player never links with themself.
        for(const a of players)for(const b of players){if(a===b){assert.equal(chemistryRelation(a,b).score,0);continue;}assert.equal(chemistryRelation(a,b).score,chemistryRelation(b,a).score);}
    `);
    pass('roster totals derive from data, secret ids are unique, Blue Lock Man and aliases never inflate totals, base OVR and chemistry are pure');

    // ---------- One squad, one evaluation, every mode ----------
    block(`
        let seed=74;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
        const pool=players.filter(p=>!p.secretCharacter),formations=['4-3-3','4-4-2','3-5-2','4-2-3-1','5-3-2','3-4-3'];
        for(let t=0;t<18;t++){
            const ids=[...pool].sort(()=>rnd()-.5).slice(0,14).map(p=>p.id),formation=formations[t%formations.length];
            duelEvaluationCache.clear();const duel=duelEvaluate(ids,14,formation);
            duelEvaluationCache.clear();const shuffled=duelEvaluate([...ids].reverse(),14,formation);duelEvaluationCache.clear();
            assert(duel&&shuffled,formation+' evaluates');
            assert.equal(shuffled.ovr,duel.ovr,'signing order must not change OVR');assert.equal(shuffled.chemistry,duel.chemistry,'signing order must not change chemistry');
            // The same lineup placed in the Team Builder scores identically.
            maxPlayers=14;team1.players=ids.map(playerById);formationByTeam[1]=formation;formationAssignments[1]={...duel.assignment};formationCaptainByTeam[1]=duel.captain;
            const builder=shareFormationSnapshot(1);
            assert.equal(builder.ovr,duel.ovr,'Team Builder and Draft Duel agree on OVR');assert.equal(builder.chemistry.overall,duel.chemistry,'Team Builder and Draft Duel agree on chemistry');
            assert.equal(builder.formation,formation,'snapshot keeps the built formation');
            // Exporting never runs Auto Best: the assignment is preserved exactly.
            assert.deepEqual({...builder.assignment},{...duel.assignment});
            // Every member's role fit is the shared positional profile.
            for(const [slot,id] of Object.entries(duel.assignment))assert(['primary','secondary','adapted','poor','incompatible'].includes(playerPositionProfile(playerById(id),formationShape(formation)[slot].label).fit));
        }
    `);
    pass('18 random squads: Draft Duel, Team Builder and share snapshots agree on OVR, chemistry and exact lineup; signing order is irrelevant');

    // ---------- Saves survive malformed, hostile and blocked storage ----------
    block(`
        const keys=[SOLO_SAVE_KEY,SOLO_RECORD_KEY,MODE_RECORD_KEY,SQUAD_LIBRARY_KEY,DUEL_SAVE_KEY,DUEL_RECORD_KEY,LAB_LIBRARY_KEY,EGO_RECORD_KEY,SAVE_KEY,STANDALONE_SAVE_KEY];
        assert.equal(new Set(keys).size,keys.length,'every system owns its own storage key');
        const loaders={soloLoad,soloRecords,readModeRecords,readSquadLibrary,duelLoad,duelRecords,labLibrary,egoRecordLoad,loadSavedData,standalone:()=>normalizeStandaloneSave(JSON.parse(localStorage.getItem(STANDALONE_SAVE_KEY)||'null'))};
        const hostile=['{','null','[]','1','"x"','true','{"v":1}','{"v":1,"items":"x"}','{"v":1,"items":[null,1,"a",{},{"code":5}]}','{"v":99,"x":[1,2]}',
            JSON.stringify({v:1,activity:{'2026-01-01':'daily',bad:[1]},counts:{daily:-5,tactic:1e12},players:{abc:1,9101:3},achievements:{'first-mission':'nope'},best:{chemistry:{value:1e9}}}),
            '{"__proto__":{"polluted":1},"daily:2026-01-01":{"score":"x","squad":{"formation":"9-9-9","playerIds":[1,"a",null]}}}'];
        for(const value of hostile){for(const key of keys)localStorage.setItem(key,value);
            for(const [name,fn] of Object.entries(loaders)){try{fn();}catch(error){if(name!=='standalone')throw new Error(name+' threw on '+value.slice(0,30)+': '+error.message);}}}
        assert.equal(({}).polluted,undefined,'stored JSON cannot pollute prototypes');
        // Unrelated saves are never erased by another system reading garbage.
        for(const key of keys)localStorage.setItem(key,'{');localStorage.setItem('blSitePreferencesV1','{"theme":"light"}');
        for(const fn of Object.values(loaders))try{fn();}catch{}
        assert.equal(localStorage.getItem('blSitePreferencesV1'),'{"theme":"light"}');
        // Blue Lock Man is never counted as a favourite player.
        localStorage.setItem(EGO_RECORD_KEY,JSON.stringify({v:1,migrated:true,players:{9101:9,9102:9,[players[0].id]:1}}));
        const ego=egoRecordLoad();assert.equal(ego.players[9101],undefined);assert.equal(ego.players[9102],undefined);assert.equal(ego.players[players[0].id],1);
        const fav=egoFavourites({...ego,players:{9101:50,[players[0].id]:1}});assert(fav.players.every(([p])=>!isBlueLockMan(p)));
        const tracked=egoEmpty();egoTrackSquad(tracked,'4-3-3',[9101,players[1].id]);assert.deepEqual(Object.keys(tracked.players),[String(players[1].id)]);
    `);
    const store=context.localStorage,{getItem,setItem}=store;
    store.getItem=()=>{throw new Error('blocked');};store.setItem=()=>{throw new Error('blocked');};
    try{
        block(`for(const fn of [soloLoad,soloRecords,readModeRecords,readSquadLibrary,duelLoad,duelRecords,labLibrary,egoRecordLoad,loadSavedData])fn();
            assert(Array.isArray(egoRecordEvent({mode:'daily',score:10,grade:'S'})),'recording a result with blocked storage degrades quietly');`);
    }finally{store.getItem=getItem;store.setItem=setItem;}
    pass('every storage reader tolerates malformed JSON, hostile shapes, prototype keys and blocked storage without erasing unrelated saves; Ego Record never counts Blue Lock Man');

    // ---------- Release infrastructure ----------
    const versions=require('./set-version.js'),cached=versions.cachedAssets();
    const loaderFolders=JSON.parse(/const folders = (\[[^\]]*\]);/.exec(read('js/players-loader.js'))[1]);
    const moduleFolders=fs.readdirSync(path.join(root,'js/players'),{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>entry.name);
    assert.deepEqual([...moduleFolders].sort(),[...loaderFolders].sort(),'every character folder is loaded (and versioned) by js/players-loader.js');
    for(const folder of loaderFolders)for(const file of ['player.js','reference.js'])assert(cached.includes(`js/players/${folder}/${file}`),folder+'/'+file+' is fingerprinted');
    for(const file of fs.readdirSync(path.join(root,'images')))if(fs.statSync(path.join(root,'images',file)).isFile())assert(cached.includes('images/'+file),'images/'+file+' is fingerprinted');
    const manifest=JSON.parse(read(versions.MANIFEST));assert.equal(manifest.version,versions.currentVersion(),'release manifest matches APP_VERSION');
    const workflow=read('.github/workflows/preflight.yml');
    for(const needle of ['pull_request:','push:','workflow_dispatch:','contents: read','concurrency:','node scripts/preflight.js','node scripts/sync-shells.js --check','node scripts/set-version.js --check'])assert(workflow.includes(needle),'workflow: '+needle);
    assert(!/secrets\./.test(workflow),'workflow uses no secrets');
    for(const [,ref] of workflow.matchAll(/uses:\s*(\S+)/g))assert(/^actions\/[\w-]+@[0-9a-f]{40}$/.test(ref),'official actions pinned to a commit: '+ref);
    pass('every character module and image is versioned and fingerprinted; CI workflow is read-only, pinned and runs the full gate');
}
module.exports={runV074Tests};
if(require.main===module)runV074Tests();
