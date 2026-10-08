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
const scripts=scriptTags.map(tag=>/\bsrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]).filter(Boolean).map(src=>src.split('?')[0]);
check('Classic deferred script dependencies and bootstrap order',()=>{
    assert.equal(new Set(scripts).size,scripts.length,'Duplicate script reference');
    for(const [index,src] of scripts.entries()){
        assert(!/^(?:https?:)?\/\//.test(src),'Unexpected remote application script');
        assert(fs.existsSync(path.join(root,src.split('?')[0])),`Missing ${src}`);
        assert(/\bdefer\b/i.test(scriptTags[index]),`${src} must be deferred`);
        assert(!/\btype\s*=\s*["']module["']/i.test(scriptTags[index]),'Keep classic scripts');
    }
    const expected=['js/version.js','js/players.js','js/state.js','js/ui/player-stats.js','js/fx.js','js/chemistry.js',
        'js/lore.js','js/formations.js','js/storage.js','js/results.js','js/auction.js',
        'js/ui/auction-ui.js','js/router.js','js/ui/menu.js','js/ui/setup.js',
        'js/standalone-builder.js','js/ui/formation-ui.js','js/app.js'];
    for(let i=0;i<expected.length;i++){
        assert(scripts.includes(expected[i]),`Missing ${expected[i]}`);
        if(i)assert(scripts.indexOf(expected[i])>scripts.indexOf(expected[i-1]),`Order: ${expected[i]}`);
    }
    assert.equal(scripts.at(-1),'js/app.js','Bootstrap must load last');
});
const baseURI='https://example.test/BL-draft/';
const sandbox=vm.createContext({URL,document:{baseURI,addEventListener(){}},window:{addEventListener(){}}});
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
        const positions=['GK','CB','LB','RB','LWB','RWB','DM','CM','AM','LM','RM','LW','RW','ST','CF','FW','DF','WB','WM','SS'];
        assert(Array.isArray(player.positions)&&player.positions.length&&player.positions.every(p=>positions.includes(p)),`${player.name}: positions`);
        assert(player.positions.includes(player.primaryPosition),`${player.name}: missing primary position`);
        for(const stat of ['ovr','off','sho','spd','def','pas','dri','gk']){
            assert(Number.isFinite(player.stats?.[stat])&&player.stats[stat]>=0&&player.stats[stat]<=100,`${player.name}: ${stat} outside 0–100`);
        }
        const image=new URL(player.image,baseURI);
        assert(image.href.startsWith(baseURI),`Unexpected image origin: ${player.image}`);
        assert(fs.existsSync(path.join(root,decodeURIComponent(image.pathname.slice(new URL(baseURI).pathname.length)))),`Missing image: ${player.image}`);
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
            assert(['GK','CB','LB','RB','LWB','RWB','DM','CM','AM','LM','RM','LW','RW','ST','CF'].includes(slot.label),`${name}: invalid label`);
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
    assert.equal(data.APP_VERSION,'0.6.5');
    assert(html.includes(`style.css?v=${data.APP_VERSION}`),'Stylesheet cache version mismatch');
    assert(html.includes(`css/player-stats.css?v=${data.APP_VERSION}`),'Radar stylesheet cache version mismatch');
    assert(html.includes(`css/site-header.css?v=${data.APP_VERSION}`),'Header stylesheet cache version mismatch');
    assert(fs.existsSync(path.join(root,'scripts/preflight.js')),'Validation entry point missing');
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
        for(const state of [{screen:'auction-team-builder',phase:'team-builder',turn:null},
            {screen:'formation',phase:'team-builder',turn:null},{screen:'auction',phase:'team-builder',turn:null}]){
            const oldBuilder={...legacy,uiState:state};
            const originalBuilder=JSON.stringify(oldBuilder);
            const builder=normalizeAuctionSave(oldBuilder);
            assert.deepEqual(builder.uiState,{screen:'formation',phase:'complete',turn:null});
            assert.equal(JSON.stringify(oldBuilder),originalBuilder);
            assert.deepEqual(normalizeAuctionSave(builder),builder);
        }
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
check('Multi-page routes, legacy hashes and navigation helpers',()=>{
    const listeners={},navigation=[];
    const location={
        href:'https://example.test/BL-draft/index.html',
        hash:'',
        assign(url){navigation.push({type:'assign',url:String(url)});},
        replace(url){navigation.push({type:'replace',url:String(url)});}
    };
    const document={baseURI:'https://example.test/BL-draft/index.html',querySelector:selector=>selector==='base'?{href:'https://example.test/BL-draft/'}:null};
    const history={replaceState(state,unused,url){this.state=state;this.url=String(url);},pushState(state,unused,url){this.state=state;this.url=String(url);}};
    const window={location,addEventListener:(name,fn)=>{listeners[name]=fn;}};
    const context=vm.createContext({window,document,history,URL});
    const setLocation=(path,hash='')=>{
        location.href=`https://example.test/BL-draft/${path}${hash}`;
        location.hash=hash;
        document.baseURI=location.href;
    };
    vm.runInContext(read('js/router.js'),context);
    const routes=vm.runInContext('APP_ROUTE_PATHS',context);
    for(const [route,routePath] of Object.entries(routes)){
        assert(fs.existsSync(path.join(root,routePath)),`Missing route page ${routePath}`);
        setLocation(routePath);
        assert.equal(vm.runInContext('getRouteFromLocation()',context),route,`${routePath}: route resolution`);
        assert.equal(vm.runInContext(`canonicalRouteUrl(${JSON.stringify(route)}).href`,context),`https://example.test/BL-draft/${routePath}`);
    }
    const legacy={
        '#/':'menu','#/lore':'lore','#/team-builder':'standaloneTeamBuilder','#/auction':'auctionRoom','#/auction/setup':'auctionSetup',
        '#/auction/results':'auctionResults','#/auction/team-builder':'auctionTeamBuilder'
    };
    for(const [hash,route] of Object.entries(legacy)){
        setLocation('index.html',hash);
        assert.equal(vm.runInContext('getRouteFromLocation()',context),route,`${hash}: legacy route`);
    }
    setLocation('index.html');navigation.length=0;
    vm.runInContext('updateRoute("auctionResults")',context);
    assert.equal(navigation.at(-1).type,'assign');
    assert.equal(navigation.at(-1).url,'https://example.test/BL-draft/auction/results.html');
    setLocation('index.html','#/auction/team-builder');navigation.length=0;
    assert.equal(vm.runInContext('normalizeCurrentRoute(getRouteFromLocation())',context),false);
    assert.equal(navigation.at(-1).type,'replace');
    assert.equal(navigation.at(-1).url,'https://example.test/BL-draft/auction/team-builder.html');
    for(const state of [{screen:'auction',phase:'complete'},{screen:'formation',phase:'complete'},
        {screen:'auction-team-builder',phase:'team-builder'}]){
        context.saved={uiState:state};
        const expected=state.screen==='auction'?'auctionResults':'auctionTeamBuilder';
        assert.equal(vm.runInContext('auctionRouteForSavedState(saved)',context),expected);
        for(const route of ['auctionResults','auctionTeamBuilder']){
            context.route=route;
            const completed=vm.runInContext('completedAuctionSaveFor(route,saved)',context);
            assert.equal(completed.uiState.phase,'complete');
            assert.equal(completed.uiState.screen,route==='auctionResults'?'auction':'formation');
        }
    }
    vm.runInContext('navigateToRoute=(route,options)=>{globalThis.routed={route,options};}',context);
    setLocation('lore.html');listeners.popstate();
    assert.equal(context.routed.route,'lore');assert.equal(context.routed.options.skipHistory,true);
});
check('Every section page has ordered scripts, versioned styles, valid assets and unique IDs',()=>{
    const context=vm.createContext({window:{addEventListener(){}},URL});
    vm.runInContext(read('js/router.js'),context);
    for(const page of Object.values(vm.runInContext('APP_ROUTE_PATHS',context))){
        const content=read(page);
        const tags=[...content.matchAll(/<script\b([^>]*)>/gi)].map(match=>match[1]);
        const refs=tags.map(tag=>/\bsrc=["']([^"']+)["']/i.exec(tag)?.[1]).filter(Boolean);
        assert.deepEqual(refs.map(src=>src.split('?')[0]),scripts,`${page}: script order`);
        refs.forEach((src,index)=>{
            assert(tags[index].includes('defer'),`${page}: non-deferred script`);
            assert(src.endsWith(`?v=${data.APP_VERSION}`),`${page}: script cache version`);
            assert(fs.existsSync(path.join(root,src.split('?')[0])),`${page}: missing ${src}`);
        });
        for(const css of ['style.css','css/player-stats.css','css/site-header.css']){
            assert(content.includes(`${css}?v=${data.APP_VERSION}`),`${page}: missing/versioned ${css}`);
        }
        const ids=[...content.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>match[1]);
        assert.equal(new Set(ids).size,ids.length,`${page}: duplicate ID`);
        const base=/\bhref=["']([^"']+)["']/.exec(content.match(/<base\b[^>]*>/i)?.[0]||'')?.[1]||'./';
        const pageUrl=new URL(page,baseURI),resolved=new URL(base,pageUrl);
        assert.equal(resolved.href,baseURI,`${page}: incorrect subdirectory asset base`);
        for(const [,src] of content.matchAll(/<(?:img|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)){
            if(/^(?:https?:|data:)/.test(src))continue;
            assert(fs.existsSync(path.join(root,src.split('?')[0])),`${page}: missing asset ${src}`);
        }
        assert.equal((content.match(/data-app-version/g)||[]).length,2,`${page}: version targets`);
    }
});
check('Auction page state stays aligned with canonical URLs',()=>{
    const formations=read('js/formations.js'),menu=read('js/ui/menu.js'),results=read('js/results.js'),router=read('js/router.js');
    assert(/function openAuctionTeamBuilder\(\)[\s\S]*?screen:"formation"[\s\S]*?phase:"complete"/.test(formations),'Team Builder must preserve completed-auction state');
    assert.equal((menu.match(/resumeSavedAuction\(loadSavedData\(\)\)/g)||[]).length,2,'Both Resume controls must route through saved-state navigation');
    assert(/function restartAuction\(\)[\s\S]*?updateRoute\("auctionSetup"\)/.test(results),'New Auction must navigate to auction/setup.html');
    assert(router.includes('auctionRouteForSavedState'),'Saved auction route helper missing');
    assert(router.includes('LEGACY_HASH_ROUTES'),'Legacy hash migration missing');
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
    for(const id of ['siteSidebar','menu-screen','setup-screen','auction-screen','formation-screen','menuNewAuction','menuStandaloneBuilder','menuLore'])assert(ids.includes(id),`Missing ${id}`);
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
    const document={baseURI,getElementById:element,querySelector(){return null;},querySelectorAll:selector=>selector==='[data-app-version]'?labels:[],
        createElement:()=>makeElement(),addEventListener(){},body:makeElement(),documentElement:makeElement()};
    const saved=new Map(Object.entries(initialStorage));
    const localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,String(value)),removeItem:key=>saved.delete(key)};
    const window={location:{href:baseURI+'index.html'+hash,hash},addEventListener(){},scrollTo(){}};
    const history={state:null,replaceState(state,unused,url){this.state=state;window.location.hash=new URL(url).hash;},
        pushState(state,unused,url){this.state=state;window.location.hash=new URL(url).hash;}};
    const context=vm.createContext({document,window,history,localStorage,URL,console,assert,
        setTimeout(){return 1;},clearTimeout(){},requestAnimationFrame(){return 1;},cancelAnimationFrame(){}});
    const run=code=>vm.runInContext(code,context,{timeout:30000});
    for(const file of scripts)vm.runInContext(read(file),context,{filename:file,timeout:30000});
    return {run,saved,element,labels};
}
check('v0.6.3 player expansion, conservative estimates and stable chronology',()=>{
    const requested=['Shigeo Mizuki','Hajime Nishioka','Shizuka Haiji','Reiji Hiiragi','Taiga Tsunzaki',
        'Oboabona','Bello','Bats','Leyden','Hermes','Aiki Himizu'];
    for(const name of requested){
        const player=data.players.find(p=>p.name===name);
        assert(player,`Missing ${name}`);assert(player.id>68,`${name}: reused existing ID`);
        assert(player.statEstimate,`${name}: estimates must be identified`);
        for(const [stat,value] of Object.entries(player.stats))assert(value<=89,`${name}: ${stat} must stay below 90`);
    }
    for(const player of data.players){
        assert(Number.isInteger(player.debutChapter)&&player.debutChapter>=1&&player.debutChapter<=364,`${player.name}: debut chapter`);
        assert(Number.isInteger(player.appearanceOrder),`${player.name}: stable appearance order`);
    }
    assert.equal(data.players.find(p=>p.name==='Innocent Onazi').stats.ovr,89);
    assert.equal(data.players.find(p=>p.name==='Junichi Wanima').stats.ovr,data.players.find(p=>p.name==='Keisuke Wanima').stats.ovr+1);
    assert(!data.players.some(p=>p.name==='John Paccini'));
    assert(!JSON.stringify([data.CHEMISTRY_CONTEXTS,data.CHEMISTRY_SPECIAL_PAIRS]).includes('John Paccini'));
    for(const name of ['MANSHINE CITY','ENGLAND U-20 // FOX SYSTEM']){
        assert(data.CHEMISTRY_CONTEXTS.find(c=>c.name===name)?.players.includes('Rooke'),`Rooke: missing ${name}`);
    }
    const app=appContext();
    app.run(`const ordered=[...players].sort(comparePlayerAppearance);
        assert(ordered.every((p,i)=>!i||comparePlayerAppearance(ordered[i-1],p)<=0));
        assert.equal(players.find(p=>p.name==='Rooke').primaryPosition,'GK');
        assert(CHARACTER_DESCRIPTIONS.Rooke.includes('Manshine City')&&CHARACTER_DESCRIPTIONS.Rooke.includes('England U-20'));`);
});
check('Every pool category has valid members and first-click selection works with overlaps',()=>{
    const app=appContext();
    app.run(`
        for(const [key,category] of Object.entries(PLAYER_POOL_CATEGORIES)){
            assert(category.names.length>0,key);
            assert.equal(new Set(category.names).size,category.names.length,key+' duplicate member');
            category.names.forEach(name=>assert(players.some(p=>p.name===name),key+' unknown '+name));
            assert.equal(PLAYER_POOL_CATEGORY_IDS[key].size,category.names.length);
            playerPoolCategoryState=Object.fromEntries(Object.keys(PLAYER_POOL_CATEGORIES).map(k=>[k,true]));
            playerPoolManualOverrides={};recomputeSelectedPlayersFromCategories();
            assert.equal(selectedPlayerIds.size,players.length);
            setPoolCategoryEnabled(key,false);
            assert.equal(selectedPlayerIds.size,players.length-category.names.length,key+' first click');
            assert([...PLAYER_POOL_CATEGORY_IDS[key]].every(id=>!selectedPlayerIds.has(id)),key+' remove members');
            playerPoolCategoryState=Object.fromEntries(Object.keys(PLAYER_POOL_CATEGORIES).map(k=>[k,false]));
            playerPoolManualOverrides={};recomputeSelectedPlayersFromCategories();
            setPoolCategoryEnabled(key,true);
            assert.equal(selectedPlayerIds.size,category.names.length,key+' select exact members');
            const id=[...selectedPlayerIds][0];playerPoolManualOverrides[id]=false;recomputeSelectedPlayersFromCategories();
            assert(!selectedPlayerIds.has(id));setPoolCategoryEnabled(key,true);assert(selectedPlayerIds.has(id));
        }
        assert(PLAYER_POOL_CATEGORY_IDS['master-strikers'].size>0);
        assert(PLAYER_POOL_CATEGORY_IDS['original-u20'].size>0);
        assert(PLAYER_POOL_CATEGORY_IDS['japan-world-cup'].size>0);
    `);
});
check('Missing saved IDs drop safely from teams, targets, histories, undo stacks and formations',()=>{
    const app=appContext();
    app.run(`
        const old={gameActive:true,startingBudget:15000,bidIncrement:50,maxPlayers:15,auctionNumber:2,currentBid:50,currentBidder:1,
            startingTeam:1,currentPlayerId:999999,remainingPlayerIds:[1,999999],selectedPlayerIds:[1,2,999999],
            team1:{name:'A',color:'#19a7ff',budget:14000,players:[2,999999]},team2:{name:'B',color:'#ff315d',budget:15000,players:[]},
            uiState:{screen:'auction',phase:'bidding',turn:2},auctionHistory:[{playerId:999999,teamNumber:1,price:1000}],
            formationAssignments:{1:{0:2,1:999999},2:{}},formationCaptainByTeam:{1:999999,2:null},
            setup:{selected:[1,999999],poolManualOverrides:{1:true,999999:true}}};
        const snapshot={...old,team1:{...old.team1,playerIds:old.team1.players},team2:{...old.team2,playerIds:old.team2.players}};
        old.auctionUndoStack=[snapshot];old.auctionRedoStack=[snapshot];
        const original=JSON.stringify(old),clean=normalizeAuctionSave(old);
        assert.equal(JSON.stringify(old),original);assert.equal(clean.team1.budget,14000);
        assert.deepEqual(clean.team1.players,[2]);assert.deepEqual(clean.remainingPlayerIds,[1]);
        assert.deepEqual(clean.selectedPlayerIds,[1,2]);assert.equal(clean.currentPlayerId,null);assert.equal(clean.uiState.phase,'next');
        assert.equal(clean.auctionHistory.length,0);assert.deepEqual(clean.formationAssignments[1],{0:2});assert.equal(clean.formationCaptainByTeam[1],null);
        assert.deepEqual(clean.setup.selected,[1]);assert.deepEqual(clean.setup.poolManualOverrides,{1:true});
        for(const stack of [clean.auctionUndoStack,clean.auctionRedoStack]){assert.deepEqual(stack[0].team1.playerIds,[2]);assert.equal(stack[0].currentPlayerId,null);assert.equal(stack[0].auctionHistory.length,0);}
        const solo=normalizeStandaloneSave({playerIds:[1,999999],assignment:{0:1,1:999999},captainId:999999,formation:'4-4-2'});
        assert.deepEqual(solo.playerIds,[1]);assert.deepEqual(solo.assignment,{0:1});assert.equal(solo.captainId,null);
    `);
});
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
check('Second Selection duo resolves to the purple chemistry tier',()=>{
    const app=appContext();
    app.run(`
        const a=players.find(player=>player.name==='Shoei Baro');
        const b=players.find(player=>player.name==='Asahi Naruhaya');
        const pair=CHEMISTRY_SPECIAL_PAIRS.find(([x,y])=>x===a.name&&y===b.name);
        assert(pair);assert.equal(pair[2],78);assert.equal(pair[3],'SECOND SELECTION DUO');
        assert.equal(playerChemistry(a,b),78);assert.equal(playerChemistry(b,a),78);
        assert.equal(chemistryTier(playerChemistry(a,b)),'link');
        assert(getCharacterChemistry(a).pairLinks.some(link=>link.label===pair[3]));
        assert(getCharacterChemistry(b).pairLinks.some(link=>link.label===pair[3]));
    `);
});
check('Coin-phase restoration waits before drawing the first player',()=>{
    const app=appContext();
    app.run(`
        resetDraftState({n1:'A',n2:'B',budget:15000,bidIncrement:50,maxPlayers:2,selectedPlayers:players.slice(0,6)});
        uiState={screen:'auction',phase:'coin',turn:null};saveGame();
        const saved=loadSavedData();
        let flips=0;showCoinFlip=()=>{flips++;};
        restoreGameInPlace(saved);
        assert.equal(flips,1);assert.equal(auctionNumber,0);assert.equal(currentPlayer,null);
        assert.deepEqual(remainingPlayers.map(player=>player.id),saved.remainingPlayerIds);
    `);
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
