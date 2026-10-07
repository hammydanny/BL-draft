#!/usr/bin/env node
'use strict';
// Dependency-free integrity checks. DOM stubs below are NOT browser UI tests.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
let failures=0;
function check(name,fn){
    try{fn();console.log(`PASS ${name}`);}
    catch(error){failures++;console.error(`FAIL ${name}: ${error.message}`);}
}
function walk(dir){
    return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
        if(['.git','node_modules'].includes(entry.name))return [];
        const file=path.join(dir,entry.name);
        return entry.isDirectory()?walk(file):[file];
    });
}
const jsFiles=walk(root).filter(file=>file.endsWith('.js'));
check(`JavaScript syntax (${jsFiles.length} files)`,()=>{
    const errors=[];
    for(const file of jsFiles){
        const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
        if(result.error||result.status!==0)errors.push(result.error?.message||result.stderr);
    }
    assert.equal(errors.length,0,errors.join('\n'));
});
const html=read('index.html');
const scriptTags=[...html.matchAll(/<script\b([^>]*)>/gi)].map(match=>match[1]);
const scripts=scriptTags.map(tag=>/\bsrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]).filter(Boolean);
check('Classic deferred script dependencies and bootstrap order',()=>{
    assert.equal(new Set(scripts).size,scripts.length,'Duplicate script reference');
    for(const [index,src] of scripts.entries()){
        assert(!/^(?:https?:)?\/\//.test(src),'Unexpected remote application script');
        assert(fs.existsSync(path.join(root,src.split('?')[0])),`Missing ${src}`);
        assert(/\bdefer\b/i.test(scriptTags[index]),`${src} must be deferred`);
        assert(!/\btype\s*=\s*["']module["']/i.test(scriptTags[index]),'Keep classic scripts');
    }
    const expected=['js/version.js','js/players.js','js/state.js','js/ui/player-stats.js','js/audio.js','js/chemistry.js',
        'js/lore.js','js/formations.js','js/storage.js','js/results.js','js/auction.js',
        'js/ui/auction-ui.js','js/router.js','js/ui/menu.js','js/ui/setup.js',
        'js/standalone-builder.js','js/ui/formation-ui.js','js/app.js'];
    for(let i=0;i<expected.length;i++){
        assert(scripts.includes(expected[i]),`Missing ${expected[i]}`);
        if(i)assert(scripts.indexOf(expected[i])>scripts.indexOf(expected[i-1]),`Order: ${expected[i]}`);
    }
    assert.equal(scripts.at(-1),'js/app.js','Bootstrap must load last');
});
const sandbox=vm.createContext({document:{addEventListener(){}},window:{addEventListener(){}}});
let data;
check('Data modules initialize in classic shared scope',()=>{
    for(const file of ['js/version.js','js/players.js','js/chemistry.js','js/formations.js','js/storage.js']){
        vm.runInContext(read(file),sandbox,{filename:file});
    }
    data=vm.runInContext('({players,FORMATIONS,CHEMISTRY_CONTEXTS,CHEMISTRY_SPECIAL_PAIRS,FORMATION_CHEMISTRY_EDGES,SHARED_TEAM_FLOOR_EXCEPTIONS,APP_VERSION,APP_VERSION_LABEL,AUCTION_SAVE_SCHEMA_VERSION,STANDALONE_SAVE_SCHEMA_VERSION})',sandbox);
});
check('Unique player IDs, required records, numeric stats and image paths',()=>{
    assert(data?.players.length>0,'No players loaded');
    const ids=new Set();
    for(const player of data.players){
        assert(Number.isInteger(player.id)&&player.id>0,`Invalid ID ${player.id}`);
        assert(!ids.has(player.id),`Duplicate player ID ${player.id}`);ids.add(player.id);
        for(const field of ['name','image','primaryPosition'])assert(typeof player[field]==='string'&&player[field].length,`${player.id}: ${field}`);
        assert(Array.isArray(player.positions)&&player.positions.length&&player.positions.every(p=>typeof p==='string'&&p.length),`${player.name}: positions`);
        assert(player.positions.includes(player.primaryPosition),`${player.name}: missing primary position`);
        for(const stat of ['ovr','off','sho','spd','def','pas','dri','gk']){
            assert(Number.isFinite(player.stats?.[stat])&&player.stats[stat]>=0&&player.stats[stat]<=100,`${player.name}: ${stat} outside 0–100`);
        }
        assert(fs.existsSync(path.join(root,player.image)),`Missing image: ${player.image}`);
    }
});
check('Chemistry player references and score bounds',()=>{
    const names=new Set(data.players.map(p=>p.name));
    const score=value=>assert(Number.isFinite(value)&&value>=0&&value<=100,`Invalid chemistry score ${value}`);
    for(const context of data.CHEMISTRY_CONTEXTS){
        score(context.score);
        for(const name of context.players)assert(names.has(name),`Unknown chemistry player ${name}`);
    }
    for(const [a,b,value] of data.CHEMISTRY_SPECIAL_PAIRS){
        assert(names.has(a)&&names.has(b),`Unknown chemistry pair ${a}/${b}`);score(value);
    }
    for(const pair of data.SHARED_TEAM_FLOOR_EXCEPTIONS){
        for(const name of pair.split('|'))assert(names.has(name),`Unknown floor exception ${name}`);
    }
});
check('Formation slots and chemistry edges',()=>{
    assert(Object.keys(data.FORMATIONS).length>1,'Missing formations');
    for(const [name,slots] of Object.entries(data.FORMATIONS)){
        assert.equal(slots.length,11,`${name}: must contain eleven slots`);
        assert.equal(slots.filter(slot=>slot.label==='GK').length,1,`${name}: goalkeeper`);
        for(const slot of slots){
            assert(typeof slot.label==='string'&&slot.label.length,`${name}: missing label`);
            for(const axis of ['x','y'])assert(Number.isFinite(slot[axis])&&slot[axis]>=0&&slot[axis]<=100,`${name}: ${axis}`);
        }
        assert(Array.isArray(data.FORMATION_CHEMISTRY_EDGES[name]),`${name}: missing chemistry edges`);
    }
    for(const [name,edges] of Object.entries(data.FORMATION_CHEMISTRY_EDGES)){
        assert(data.FORMATIONS[name],`Unknown formation ${name}`);
        for(const edge of edges)assert(edge.length===2&&edge[0]!==edge[1]&&edge.every(i=>Number.isInteger(i)&&i>=0&&i<11),`${name}: invalid edge`);
    }
});
check('Release, save schema constants and established storage keys',()=>{
    assert.equal(data.APP_VERSION_LABEL,`V${data.APP_VERSION} ALPHA`);
    assert.equal(data.APP_VERSION,'0.6.1.3');
    assert(html.includes(`style.css?v=${data.APP_VERSION}`),'Stylesheet cache version mismatch');
    assert(html.includes(`css/player-stats.css?v=${data.APP_VERSION}`),'Radar stylesheet cache version mismatch');
    assert(html.includes(`css/site-header.css?v=${data.APP_VERSION}`),'Header stylesheet cache version mismatch');
    assert(fs.existsSync(path.join(root,'scripts/validate.js')),'Validation entry point missing');
    assert.equal((html.match(/data-app-version/g)||[]).length,2,'Version label targets');
    for(const version of [data.AUCTION_SAVE_SCHEMA_VERSION,data.STANDALONE_SAVE_SCHEMA_VERSION])assert(Number.isInteger(version)&&version>0);
    assert(read('js/state.js').includes('"blAuctionSaveV2"'));
    assert(read('js/state.js').includes('"blStandaloneBuilderV1"'));
});
check('Legacy/current saves normalize without mutation or storage writes',()=>{
    const run=code=>vm.runInContext(code,sandbox);
    sandbox.assert=assert;
    run(`
        const legacy={gameActive:true,startingBudget:15000,bidIncrement:50,maxPlayers:15,
            startingTeam:1,auctionNumber:1,currentBid:50,currentBidder:1,currentPlayerId:1,
            remainingPlayerIds:[2,3],selectedPlayerIds:[1,2,3],
            team1:{name:'A',color:'#19a7ff',budget:15000,players:[]},
            team2:{name:'B',color:'#ff315d',budget:15000,players:[]},
            uiState:{screen:'auction',phase:'bidding',turn:2},auctionHistory:[]};
        const original=JSON.stringify(legacy);
        const migrated=normalizeAuctionSave(legacy);
        assert.equal(migrated.schemaVersion,AUCTION_SAVE_SCHEMA_VERSION);
        assert.equal(JSON.stringify(legacy),original);
        assert.deepEqual(normalizeAuctionSave(migrated),migrated);
        const setup={setup:{selected:[1,2],budget:'15000',poolPosition:'ALL'}};
        assert.deepEqual(normalizeAuctionSave(setup).setup,setup.setup);
        const categories={setup:{poolCategories:{'blue-lock':true},poolManualOverrides:{1:false}}};
        assert.deepEqual(normalizeAuctionSave(categories).setup,categories.setup);
        const standalone={playerIds:[1,2,999999],formation:'4-4-2',assignment:{0:1},captainId:1};
        const normalized=normalizeStandaloneSave(standalone);
        assert.deepEqual(normalized.playerIds,[1,2]);
        assert.equal(normalized.formation,'4-4-2');
        assert.deepEqual(normalized.assignment,{0:1});
        assert.equal(normalized.captainId,1);
        assert.equal(normalized.schemaVersion,STANDALONE_SAVE_SCHEMA_VERSION);
        assert.deepEqual(normalizeStandaloneSave(normalized),normalized);
        for(const bad of [null,[],42,'bad',{schemaVersion:999},{schemaVersion:null}]){
            assert.equal(normalizeAuctionSave(bad),null);
            assert.equal(normalizeStandaloneSave(bad),null);
        }
        for(const patch of [{team1:{}},{remainingPlayerIds:{}},{currentBid:'bad'},
            {auctionHistory:[null]},{auctionUndoStack:[{}]},{formationAssignments:{1:[]}},
            {formationByTeam:{1:'bad'}},{uiState:{screen:'auction',phase:'bad'}},
            {selectedPlayerIds:'bad'},{setup:{poolCategories:[]}}]){
            assert.equal(normalizeAuctionSave({...legacy,...patch}),null);
        }
        assert.equal(normalizeStandaloneSave({playerIds:{}}),null);
        assert.equal(normalizeStandaloneSave({assignment:[]}),null);
        assert.equal(normalizeStandaloneSave({captainId:{}}),null);
        const savedText=original;
        let writes=0;
        globalThis.SAVE_KEY='blAuctionSaveV2';
        globalThis.localStorage={getItem:()=>savedText,setItem:()=>writes++};
        assert.equal(loadSavedData().schemaVersion,AUCTION_SAVE_SCHEMA_VERSION);
        assert.equal(writes,0);
        localStorage.getItem=()=>'{broken';assert.equal(loadSavedData(),null);
        localStorage.getItem=()=>'null';assert.equal(loadSavedData(),null);
    `);
});
check('Hash routes and popstate handler remain available',()=>{
    const listeners={};
    const window={location:{href:'https://example.test/#/',hash:'#/'},addEventListener:(name,fn)=>{listeners[name]=fn;}};
    const history={replaceState(state,unused,url){this.state=state;this.url=String(url);},pushState(state,unused,url){this.state=state;this.url=String(url);}};
    const context=vm.createContext({window,history,URL});
    vm.runInContext(read('js/router.js'),context);
    for(const [route,hash] of Object.entries(vm.runInContext('APP_ROUTES',context))){
        window.location.hash=hash;
        assert.equal(vm.runInContext('getRouteFromHash()',context),route);
        vm.runInContext(`updateRoute(${JSON.stringify(route)},{replace:true})`,context);
        assert.equal(history.state.blDraftRoute,route);
        assert.equal(new URL(history.url).hash,hash);
    }
    window.location.hash='#/unknown';assert.equal(vm.runInContext('getRouteFromHash()',context),'menu');
    vm.runInContext('navigateToRoute=(route,options)=>{globalThis.routed={route,options};}',context);
    window.location.hash='#/lore';listeners.popstate();
    assert.equal(context.routed.route,'lore');assert.equal(context.routed.options.skipHistory,true);
});
check('CSS loader is unique and obsolete global Back code is absent',()=>{
    const css=read('style.css').replace(/\/\*[\s\S]*?\*\//g,'');
    assert.equal((css.match(/(?:^|})\s*\.auto-best-loader\s*\{/g)||[]).length,1,'Duplicate/missing loader rule');
    const animations=[...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(match=>match[1]);
    assert.equal(new Set(animations).size,animations.length,'Duplicate animation definitions');
    assert(!/global-back-button/.test(css),'Legacy Back styles remain');
    for(const src of scripts)assert(!/globalBackButton|ensureGlobalBackButton|updateGlobalBackButton|handleGlobalBack/.test(read(src)),`Legacy Back code in ${src}`);
});
check('HTML IDs, contextual navigation, and chapter labels',()=>{
    const ids=[...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match=>match[1]);
    assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
    for(const id of ['menu-screen','setup-screen','auction-screen','formation-screen','menuNewAuction','menuStandaloneBuilder','menuLore','setupBackToMenu','backToResults'])assert(ids.includes(id),`Missing ${id}`);
    for(const src of ['index.html','style.css',...scripts])assert(!/(?:chapter\s+|ch\.\s*)363\b/i.test(read(src)),`Old chapter label in ${src}`);
    assert(!/initialSaved|getRouteFromHash|history\.replaceState/.test(read('js/ui/formation-ui.js')),'Bootstrap still in Formation UI');
    assert(!/const\s+APP_ROUTES|function\s+navigateToRoute/.test(read('js/ui/menu.js')),'Router still in Menu UI');
});
// Minimal platform adapter: exercises script initialization and state, not layout,
// browser event dispatch, pointer dragging, painting, or real Back/Forward history.
function appContext(initialStorage={},hash='#/'){
    const elements=new Map();
    const makeElement=(id='')=>{
        const classes=new Set();
        return {id,value:'',textContent:'',innerHTML:'',dataset:{},style:{setProperty(){}},
            classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},
                contains:name=>classes.has(name),toggle(name,force){const add=force??!classes.has(name);if(add)classes.add(name);else classes.delete(name);}},
            addEventListener(){},setAttribute(){},removeAttribute(){},appendChild(){},remove(){},focus(){},select(){},
            querySelector(){return null;},querySelectorAll(){return [];},closest(){return null;}};
    };
    const element=id=>{if(!elements.has(id))elements.set(id,makeElement(id));return elements.get(id);};
    for(const match of html.matchAll(/<[^>]+\bid=["']([^"']+)["'][^>]*>/g)){
        const el=element(match[1]);
        el.value=/\bvalue=["']([^"']*)["']/.exec(match[0])?.[1]||'';
        const classes=/\bclass=["']([^"']*)["']/.exec(match[0])?.[1]||'';
        el.classList.add(...classes.split(/\s+/));
    }
    const labels=[makeElement(),makeElement()];labels.forEach(el=>el.textContent=' // FAN PROJECT // 2026');
    const document={getElementById:element,querySelector(){return null;},querySelectorAll:selector=>selector==='[data-app-version]'?labels:[],
        createElement:()=>makeElement(),addEventListener(){},body:makeElement(),documentElement:makeElement()};
    const saved=new Map(Object.entries(initialStorage));
    const localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,String(value)),removeItem:key=>saved.delete(key)};
    const window={location:{href:'https://example.test/'+hash,hash},addEventListener(){},scrollTo(){}};
    const history={state:null,replaceState(state,unused,url){this.state=state;window.location.hash=new URL(url).hash;},
        pushState(state,unused,url){this.state=state;window.location.hash=new URL(url).hash;}};
    const context=vm.createContext({document,window,history,localStorage,URL,console,assert,
        setTimeout(){return 1;},clearTimeout(){},requestAnimationFrame(){return 1;},cancelAnimationFrame(){}});
    const run=code=>vm.runInContext(code,context,{timeout:30000});
    for(const file of scripts)vm.runInContext(read(file),context,{filename:file,timeout:30000});
    return {run,saved,element,labels};
}
check('All classic scripts bootstrap together (simulated platform)',()=>{
    for(const hash of ['#/','#/lore','#/team-builder','#/auction','#/auction/results','#/auction/team-builder']){
        const app=appContext({},hash);
        assert(app.labels.every(el=>el.textContent===`${data.APP_VERSION_LABEL} // FAN PROJECT // 2026`));
        assert(app.run('typeof navigateToRoute==="function"&&typeof renderFormationBuilder==="function"'));
    }
});
check('Auction save/restore, bidding and Undo/Redo round trips (simulated platform)',()=>{
    const app=appContext();
    app.run(`
        document.getElementById('team1Name').value='TEAM A';
        document.getElementById('team2Name').value='TEAM B';
        resetDraftState({n1:'TEAM A',n2:'TEAM B',budget:15000,bidIncrement:50,maxPlayers:2,selectedPlayers:players.slice(0,6)});
        startingTeam=1;auctionNumber=1;currentPlayer=remainingPlayers.shift();
        displayOpeningBid();
        document.getElementById('openingBid').value='50';placeOpeningBid();
        assert.equal(currentBid,50);assert.equal(currentBidder,1);
        document.getElementById('nextBid').value='100';placeBid(2);
        assert.equal(currentBid,100);assert.equal(currentBidder,2);
        passBid();assert.equal(team2.players.length,1);assert.equal(team2.budget,14900);
        assert(loadSavedData(),'The application must accept its own saved auction');
        const sold=JSON.stringify(auctionSnapshot());
        undoAuctionAction();assert.equal(team2.players.length,0);assert.equal(currentBid,100);
        redoAuctionAction();assert.equal(JSON.stringify(auctionSnapshot()),sold);
        const saved=loadSavedData();assert(saved);
        const before=JSON.stringify(auctionSnapshot());
        restoreGame(saved);assert.equal(JSON.stringify(auctionSnapshot()),before);
        const old={...saved};delete old.schemaVersion;
        restoreGame(old);assert.equal(JSON.stringify(auctionSnapshot()),before);
        assert.equal(loadSavedData().schemaVersion,AUCTION_SAVE_SCHEMA_VERSION);
    `);
    const legacy=JSON.parse(app.saved.get('blAuctionSaveV2'));delete legacy.schemaVersion;
    const resumed=appContext({blAuctionSaveV2:JSON.stringify(legacy)},'#/auction');
    assert.equal(resumed.run('team2.players.length'),1);
    assert.equal(resumed.run('team2.budget'),14900);
});
check('Random Draft results, drafted formation and sharing (simulated platform)',()=>{
    const app=appContext();
    app.run(`
        document.getElementById('team1Name').value='TEAM A';
        document.getElementById('team2Name').value='TEAM B';
        document.getElementById('maxPlayers').value='3';
        startRandomDraft();
        assert.equal(team1.players.length,3);assert.equal(team2.players.length,3);
        assert.equal(uiState.phase,'complete');assert(loadSavedData(),'Random Draft save rejected');
        openAuctionTeamBuilder();
        formationByTeam[1]='4-4-2';
        formationAssignments[1]={9:team1.players[0].id};
        formationCaptainByTeam[1]=team1.players[0].id;
        const before=JSON.stringify({formationByTeam,formationAssignments,formationCaptainByTeam});
        applyBestFormationAndAssignment=()=>{throw new Error('Sharing must not run Auto Best');};
        openShareScreen();
        const share=shareFormationSnapshot(1);
        assert.equal(share.formation,'4-4-2');assert.equal(share.deployedCount,1);
        assert.equal(share.reserves.length,2);assert.equal(share.captainId,team1.players[0].id);
        assert.equal(JSON.stringify({formationByTeam,formationAssignments,formationCaptainByTeam}),before);
        saveGame();assert(loadSavedData(),'Formation save rejected');
    `);
});
check('Legacy standalone restore, all-formation Auto Best, exact sharing (simulated platform)',()=>{
    const original={playerIds:[1,2,3,8],formation:'4-4-2',assignment:{0:8,9:1},captainId:1,role:'ALL',sort:'ovr',poolHidden:false};
    const app=appContext({blStandaloneBuilderV1:JSON.stringify(original)},'#/team-builder');
    assert.equal(app.saved.get('blStandaloneBuilderV1'),JSON.stringify(original),'Opening must not rewrite legacy save');
    app.run(`
        assert.equal(formationByTeam[0],'4-4-2');assert.equal(formationAssignments[0][9],1);
        assert.equal(formationCaptainByTeam[0],1);assert.equal(standaloneBuilderTeam.players.length,4);
        const shapeBefore=JSON.stringify({formationByTeam,formationAssignments,formationCaptainByTeam});
        const auto=applyBestFormationAndAssignment;
        applyBestFormationAndAssignment=()=>{throw new Error('Sharing must not run Auto Best');};
        openStandaloneShareScreen();
        assert.equal(JSON.stringify({formationByTeam,formationAssignments,formationCaptainByTeam}),shapeBefore);
        applyBestFormationAndAssignment=auto;
        const visited=[];const evaluate=bestLineupForFormation;
        bestLineupForFormation=(n,name,search)=>{visited.push(name);return evaluate(n,name,search);};
        assert(applyBestFormationAndAssignment(0));
        assert.deepEqual(visited,Object.keys(FORMATIONS));
        bestLineupForFormation=evaluate;
        saveStandaloneBuilderState();
        const saved=normalizeStandaloneSave(JSON.parse(localStorage.getItem(STANDALONE_SAVE_KEY)));
        assert(saved);assert.equal(saved.schemaVersion,STANDALONE_SAVE_SCHEMA_VERSION);
        assert.equal(saved.formation,formationByTeam[0]);
        assert.deepEqual(saved.assignment,formationAssignments[0]);
    `);
});

check('Shared radar axes, source values, specialist grading and core UI replacement',()=>{
    const app=appContext();
    app.run(`
        assert.deepEqual(PLAYER_RADAR_AXES.map(axis=>axis.label),['SPD','DEF','PAS','DRI','SHO','OFF']);
        const gk=players.find(player=>player.name==='Gin Gagamaru');
        const radar=playerStatsRadar(gk,'auction');
        assert(radar.includes('is-specialist'));assert(radar.includes('GK</small> '+gk.stats.gk));
        assert.equal((radar.match(/class="player-stats-axis"/g)||[]).length,6);
        assert(!radar.includes('>OVR<'));
        const outfield=players.find(player=>player.name==='Yoichi Isagi');
        assert(playerStatsRadar(outfield,'lore').includes('is-outfield'));
        for(const axis of PLAYER_RADAR_AXES)assert(radar.includes('>'+gk.stats[axis.key]+'</tspan>'));
        for(const [value,grade] of [[100,'S'],[90,'S'],[89,'A'],[80,'A'],[79,'B'],[70,'B'],
            [69,'C'],[60,'C'],[59,'D'],[50,'D'],[49,'E'],[40,'E'],[39,'F'],[30,'F'],[29,'G'],[0,'G']]){
            assert.equal(playerStatGrade(value),grade);
        }
    `);
    for(const file of ['js/ui/auction-ui.js','js/lore.js','js/ui/formation-ui.js']){
        assert(read(file).includes('playerStatsRadar('),`${file}: shared radar missing`);
        assert(!/statStrip\(|character-lore-stats|player-stat-row/.test(read(file)),`${file}: old core stat UI remains`);
    }
    assert(!/\.stat-strip|\.character-lore-stats|\.player-stat-(?:row|track|label)/.test(read('style.css')),'Unused core stat CSS remains');
});
check('Auto Best cached scoring equals live scoring and uses conservative OVR weights',()=>{
    const app=appContext();
    app.run(`
        standaloneBuilderTeam.players=[8,1,28,40,26].map(id=>players.find(p=>p.id===id));
        const before=JSON.stringify(standaloneBuilderTeam);
        const search=createAutoBestSearchContext(0);
        for(const name of Object.keys(FORMATIONS)){
            const assignment={};
            preferredActiveSlotIndicesForFormation(0,name).forEach((slot,i)=>{assignment[slot]=standaloneBuilderTeam.players[i].id;});
            assert.deepEqual(evaluateFormationCandidate(0,name,assignment,search),evaluateFormationCandidate(0,name,assignment));
            const m=formationLineupMetrics(0,name,assignment);
            if(m.chemistry){
                const expected=m.teamOvrRaw*.54+m.chemistry*.24+m.fitScore*.14+m.lineupFloor*.05+m.chemistryFloor*.03
                    -m.offPosition*.38-m.weakLinks*.22+Math.min(m.eliteLinks,4)*.08;
                assert.equal(m.composite,expected);
            }
        }
        assert.equal(JSON.stringify(standaloneBuilderTeam),before,'Search context mutated roster');
    `);
});

console.log(`\n${failures?'FAIL':'PASS'} preflight — ${failures} failed check(s). Browser UI testing is separate.`);
process.exitCode=failures?1:0;
