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
check('No unresolved merges or duplicate document asset declarations',()=>{
    const marker=new RegExp('^\\s*(?:'+'<'.repeat(7)+'|'+'>'.repeat(7)+'|'+'[|]'.repeat(7)+')(?:[ \t].*)?$','m');
    for(const file of walk(root).filter(file=>/\.(?:html|css|js|md|yml|json|svg)$/.test(file))){
        const content=fs.readFileSync(file,'utf8'),relative=path.relative(root,file);
        assert(!marker.test(content),`${relative}: unresolved conflict`);
        if(!file.endsWith('.html'))continue;
        const head=content.match(/<head>[\s\S]*?<\/head>/i)?.[0]||'';
        assert.equal((head.match(/rel="icon"/g)||[]).length,1,`${relative}: exactly one favicon in head`);
        const assets=[...content.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"?]+)(?:\?[^"]*)?"/g)].map(match=>match[1]);
        assert.equal(new Set(assets).size,assets.length,`${relative}: duplicate script/style/font reference`);
    }
});
check('Conflict detection accepts documentation separators and rejects merge headers',()=>{
    const marker=new RegExp('^\\s*(?:'+'<'.repeat(7)+'|'+'>'.repeat(7)+'|'+'[|]'.repeat(7)+')(?:[ \t].*)?$','m');
    assert(!marker.test('A section\n'+'='.repeat(7)+'\nA paragraph'),'Ordinary documentation separator');
    for(const character of ['<','>','|'])assert(marker.test(character.repeat(7)+' HEAD'),'Merge or diff3 header');
});
check('Information routes, shared shell, metadata and nested local assets',()=>{
    const pages=['privacy/index.html','legal/index.html','changelog/index.html','404.html'];
    const version=/const APP_VERSION="([^"]+)"/.exec(read('js/version.js'))[1];
    const home=read('index.html');
    const shell=content=>content.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
    const footer=content=>content.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
    for(const page of pages){
        const content=read(page);
        assert.equal(shell(content),shell(home),`${page}: shared header`);
        assert.equal(footer(content),footer(home),`${page}: shared footer`);
        for(const id of ['siteMain','siteSettings','infoModal','siteFavicon'])assert(content.includes(`id="${id}"`),`${page}: missing ${id}`);
        const ids=[...content.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
        assert.equal(new Set(ids).size,ids.length,`${page}: duplicate ID`);
        for(const [,source] of content.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)){
            assert(fs.existsSync(path.join(root,source)),`${page}: missing ${source}`);
        }
        for(const deployment of ['https://example.test/','https://example.test/BL-draft/']){
            const pageUrl=new URL(page,deployment),base=new URL(page==='404.html'?'./':'../',pageUrl);
            assert.equal(base.href,deployment,`${page}: base path`);
            for(const [,destination] of content.matchAll(/data-directory-href="([^"]+)"/g)){
                const url=new URL(destination.replace(/&amp;/g,'&'),base);
                assert(url.href.startsWith(deployment),`${page}: escaped deployment`);
                const relative=url.pathname.slice(base.pathname.length);
                assert(fs.existsSync(path.join(root,relative.endsWith('/')?relative+'index.html':relative||'index.html')),`${page}: broken destination ${relative}`);
            }
        }
        assert(content.includes('js/site-runtime.js?v='+version),'Shared version/cache runtime');
        assert(!content.includes('js/players.js'),'Information pages need no game database payload');
    }
    for(const file of walk(root).filter(file=>file.endsWith('.html'))){
        const content=fs.readFileSync(file,'utf8');
        assert.equal((content.match(/<header class="site-header"/g)||[]).length,1,'One shared header');
        assert.equal((content.match(/<footer class="site-footer"/g)||[]).length,1,'One shared footer');
        assert(!content.includes('aria-disabled="true"'),'No planned footer destinations');
    }
});
const html=read('index.html');
const scriptTags=[...html.matchAll(/<script\b([^>]*)>/gi)].map(match=>match[1]);
const scripts=scriptTags.map(tag=>/\bsrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]).filter(Boolean).map(src=>src.split('?')[0]);
check('Classic deferred script dependencies and bootstrap order',()=>{
    assert.equal(new Set(scripts).size,scripts.length,'Duplicate script reference');
    for(const [index,src] of scripts.entries()){
        assert(!/^(?:https?:)?\/\//.test(src),'Unexpected remote application script');
        assert(fs.existsSync(path.join(root,src.split('?')[0])),`Missing ${src}`);
        assert(src==='js/site-preferences.js'||/\bdefer\b/i.test(scriptTags[index]),`${src} must be deferred`);
        assert(!/\btype\s*=\s*["']module["']/i.test(scriptTags[index]),'Keep classic scripts');
    }
    assert.equal(scripts[0],'js/site-preferences.js','Theme must initialize in the head before styles');
    assert(html.indexOf('js/site-preferences.js')<html.indexOf('rel="stylesheet"'),'Theme before first stylesheet');
    const expected=['js/site-preferences.js','js/version.js','js/i18n/messages.js','js/localization.js','js/player-images.js','js/players.js','js/state.js','js/ui/player-stats.js','js/audio.js','js/fx.js','js/chemistry.js',
        'js/player-reference.js','js/lore.js','js/formations.js','js/storage.js','js/results.js','js/auction.js',
        'js/ui/auction-ui.js','js/router.js','js/ui/site-information.js','js/ui/homepage.js','js/ui/menu.js','js/ui/site-directory.js','js/ui/setup.js',
        'js/standalone-builder.js','js/ui/formation-ui.js','js/ui/quick-draft.js','js/site-runtime.js','js/app.js'];
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
    for(const file of ['js/version.js','js/players.js','js/chemistry.js','js/player-reference.js','js/formations.js','js/storage.js']){
        vm.runInContext(read(file),sandbox,{filename:file});
    }
    data=vm.runInContext('({players,FORMATIONS,CHEMISTRY_CONTEXTS,CHEMISTRY_SPECIAL_PAIRS,FORMATION_CHEMISTRY_EDGES,SHARED_TEAM_FLOOR_EXCEPTIONS,PLAYER_PROFILE_METADATA,PLAYER_QUOTES,PLAYER_ALIASES,PLAYER_COUNTRIES,PLAYER_POOL_CATEGORIES,PLAYER_POOL_CATEGORY_IDS,CHEMISTRY_REFERENCE_PAIRS,CHEMISTRY_REFERENCE_CONTEXTS,APP_VERSION,APP_VERSION_LABEL,AUCTION_SAVE_SCHEMA_VERSION,STANDALONE_SAVE_SCHEMA_VERSION})',sandbox);
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
    assert.equal(data.APP_VERSION,'0.6.9.6');
    assert(/style\.css\?v=/.test(html),'Stylesheet cache version missing');
    assert(/css\/player-stats\.css\?v=/.test(html),'Radar stylesheet cache version missing');
    assert(/css\/site-header\.css\?v=/.test(html),'Header stylesheet cache version missing');
    assert(!html.includes('class="home-status"'),'Homepage status strip removed');
    assert(!read('js/ui/player-stats.js').includes('06 // FIELD METRICS'),'Obsolete field-metrics sublabel removed');
    const formationUi=read('js/ui/formation-ui.js');
    assert(formationUi.indexOf('${captainControl}')<formationUi.indexOf('CORE ATTRIBUTES'),'Captain control precedes core attributes');
    const auctionUi=read('js/ui/auction-ui.js');
    assert(auctionUi.includes('top:previousPlayerId?scroll:0'),'Auction player advance preserves scroll position');
    assert(read('css/site-theme.css').includes('--scroll-track:#dfe9f1'),'Light scrollbar tokens present');
    assert(read('style.css').includes('html[data-theme="light"] .formation-slot strong'),'Light pitch labels have a dedicated treatment');
    assert(fs.existsSync(path.join(root,'scripts/preflight.js')),'Validation entry point missing');
    assert.equal((html.match(/data-app-version/g)||[]).length,1,'Version label targets');
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
    assert.equal(navigation.at(-1).url,'https://example.test/BL-draft/auction/results/');
    setLocation('index.html','#/auction/team-builder');navigation.length=0;
    assert.equal(vm.runInContext('normalizeCurrentRoute(getRouteFromLocation())',context),false);
    assert.equal(navigation.at(-1).type,'replace');
    assert.equal(navigation.at(-1).url,'https://example.test/BL-draft/auction/team-builder/');
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
        const content=read(page.endsWith('/')?page+'index.html':page||'index.html');
        const tags=[...content.matchAll(/<script\b([^>]*)>/gi)].map(match=>match[1]);
        const refs=tags.map(tag=>/\bsrc=["']([^"']+)["']/i.exec(tag)?.[1]).filter(Boolean);
        assert.deepEqual(refs.map(src=>src.split('?')[0]),scripts,`${page}: script order`);
        refs.forEach((src,index)=>{
            assert(src.startsWith('js/site-preferences.js?')||tags[index].includes('defer'),`${page}: non-deferred application script`);
            assert.equal(new URL(src,baseURI).searchParams.get('v'),data.APP_VERSION,`${page}: script cache version`);
            assert(fs.existsSync(path.join(root,src.split('?')[0])),`${page}: missing ${src}`);
        });
        for(const css of ['css/fonts.css','css/site-theme.css','style.css','css/player-stats.css','css/site-header.css']){
            assert(content.includes(`${css}?v=${data.APP_VERSION}`),`${page}: missing/versioned ${css}`);
        }
        const ids=[...content.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>match[1]);
        assert.equal(new Set(ids).size,ids.length,`${page}: duplicate ID`);
        const base=/\bhref=["']([^"']+)["']/.exec(content.match(/<base\b[^>]*>/i)?.[0]||'')?.[1]||'./';
        const pageUrl=new URL(page||'index.html',baseURI),resolved=new URL(base,pageUrl);
        assert.equal(resolved.href,baseURI,`${page}: incorrect subdirectory asset base`);
        for(const [,src] of content.matchAll(/<(?:img|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)){
            if(/^(?:https?:|data:)/.test(src))continue;
            assert(fs.existsSync(path.join(root,src.split('?')[0])),`${page}: missing asset ${src}`);
        }
        assert.equal((content.match(/data-app-version/g)||[]).length,1,`${page}: version targets`);
    }
});
check('Auction page state stays aligned with canonical URLs',()=>{
    const formations=read('js/formations.js'),menu=read('js/ui/menu.js'),results=read('js/results.js'),router=read('js/router.js');
    assert(/function openAuctionTeamBuilder\(\)[\s\S]*?screen:"formation"[\s\S]*?phase:"complete"/.test(formations),'Team Builder must preserve completed-auction state');
    for(const id of ['menuResumeAuction','resumeSessionButton'])assert(menu.includes(`getElementById("${id}").addEventListener("click",()=>resumeSavedAuction(loadSavedData()))`),`${id}: saved-state navigation`);
    assert(read('js/ui/site-directory.js').includes('resumeSavedAuction(loadSavedData())'),'Directory Resume must reuse save normalization');
    assert(/function restartAuction\(\)[\s\S]*?updateRoute\("auctionSetup"\)/.test(results),'New Auction must navigate to auction/setup.html');
    assert(router.includes('auctionRouteForSavedState'),'Saved auction route helper missing');
    assert(router.includes('LEGACY_HASH_ROUTES'),'Legacy hash migration missing');
});
check('Canonical directory shell, global help and contextual recovery targets',()=>{
    const standaloneInfoPages=new Set(['legal/index.html','privacy/index.html','changelog/index.html','404.html']);
    const pages=walk(root).filter(file=>file.endsWith('.html')).map(file=>path.relative(root,file)).filter(page=>!standaloneInfoPages.has(page));
    const shell=content=>content.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
    const expected=shell(html);assert(expected,'Missing global directory');
    for(const page of pages){
        const content=read(page.endsWith('/')?page+'index.html':page||'index.html');
        assert.equal(shell(content),expected,`${page}: header shell differs`);
        assert.equal((content.match(/<header class="site-header"/g)||[]).length,1,`${page}: global header count`);
        assert.equal((content.match(/id="infoModal"/g)||[]).length,1,`${page}: shared information modal`);
        assert.equal((shell(content).match(/data-how-to-play/g)||[]).length,1,`${page}: one header help action`);
        assert(!/siteSidebar|site-sidebar|site-header-football|data-site-nav/.test(content),`${page}: obsolete chrome`);
        for(const id of ['startGame','randomDraftGame','playersRemaining','backToResults','formationHeaderTitle'])assert(content.includes(`id="${id}"`),`${page}: missing ${id}`);
        assert(content.includes('class="auction-context-actions"'),`${page}: Auction history target`);
    }
    for(const page of standaloneInfoPages){
        const content=read(page);
        assert.equal((content.match(/<header class="site-header"/g)||[]).length,1,`${page}: standalone header count`);
        assert(content.includes('BLUE LOCK <em>DRAFT</em>'),`${page}: brand missing`);
        assert(content.includes('css/legal.css?v='+data.APP_VERSION),`${page}: legal styling/version`);
        assert(content.indexOf('js/site-preferences.js')<content.indexOf('rel="stylesheet"'),`${page}: early theme`);
    }
    assert(fs.existsSync(path.join(root,'images/bld-logo-header.webp')),'BLD logo missing');
    const directory=read('js/ui/site-directory.js'),menu=read('js/ui/site-information.js'),setup=read('js/ui/setup.js');
    assert(directory.includes('button.hidden=!saved?.gameActive'),'Hide unavailable Resume');
    assert(directory.includes('getElementById("backToResults").hidden=standalone'),'No Results action in standalone');
    assert(menu.includes('openInfoModal("how")'),'Help must use the existing information modal');
    assert.equal((scripts.map(read).join('\n').match(/function openInfoModal\(/g)||[]).length,1,'Duplicate modal implementation');
    for(const [id,fn] of [['startGame','startGame'],['randomDraftGame','startRandomDraft']])assert(setup.includes(`getElementById("${id}").addEventListener("click",${fn})`),`${id}: required handler`);
    assert(read('js/ui/auction-ui.js').includes('querySelector(".auction-context-actions")'),'Undo/Redo injection target');
    assert(!/history.pushState/.test(read('js/auction.js')),'Setup must load a destination document');
    assert(!/site-sidebar|site-header-football|sidebar-open|HEADER FIX/.test(read('css/site-header.css')),'Obsolete header CSS');
    for(const file of scripts)assert(!/initPersistentSiteChrome|data-site-sidebar|data-site-nav/.test(read(file)),`Obsolete listener in ${file}`);
});
check('Original sound engine, persistence and separate visual feedback',()=>{
    const audio=read('js/audio.js'),fx=read('js/fx.js');
    for(const name of ['ensureAudio','playSfx','toggleSound','unlockAudio'])assert(audio.includes(`function ${name}(`),`Missing ${name}`);
    assert(read('js/site-preferences.js').includes('"blAuctionSound"'),'Preserve sound preference key');
    assert(audio.includes('SitePreferences.set({sfxEnabled:'),'One shared sound preference writer');
    for(const name of ['reveal','bid','pass','error','sold','nav','select','drop','confirm','back','toggle','result','outbid','swap','warning'])assert(audio.includes(`name==="${name}"`),`Missing original ${name} sound`);
    assert(!/function triggerFx/.test(audio),'Audio must not duplicate visual FX');
    assert(fx.includes('function triggerFx('),'Preserve current visual FX');
});
check('Foundation shell, early theme, global utilities and theme assets',()=>{
    const standaloneInfoPages=new Set(['legal/index.html','privacy/index.html','changelog/index.html','404.html']);
    const pages=walk(root).filter(file=>file.endsWith('.html')).map(file=>path.relative(root,file)).filter(page=>!standaloneInfoPages.has(page));
    const footer=content=>content.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
    for(const page of pages){
        const content=read(page.endsWith('/')?page+'index.html':page||'index.html');
        assert.equal(footer(content),footer(html),`${page}: shared footer`);
        for(const id of ['siteFavicon','soundToggle','siteSettingsToggle','siteSettings','siteMain','setupHeaderTitle'])assert(content.includes(`id="${id}"`),`${page}: missing ${id}`);
        assert.equal((content.match(/id="soundToggle"/g)||[]).length,1,`${page}: one global SFX control`);
        assert(!content.includes('data-sound-toggle'),`${page}: obsolete contextual SFX copy`);
        assert(content.indexOf('js/site-preferences.js')<content.indexOf('rel="stylesheet"'),`${page}: early theme`);
        assert(content.includes('data-directory-action="quick-draft"'),`${page}: Quick Draft`);
        assert(content.includes('data-about'),`${page}: global About`);
    }
    for(const page of standaloneInfoPages){
        const content=read(page);
        assert(footer(content),`${page}: footer missing`);
        assert(content.includes('href="privacy/"')||page==='privacy/index.html',`${page}: privacy navigation`);
        assert(content.includes('href="legal/"')||page==='legal/index.html',`${page}: legal navigation`);
    }
    for(const asset of ['images/bld-logo-header.webp','images/bld-logo-light.svg','images/bld-favicon-dark.svg','images/bld-favicon-light.svg','css/site-theme.css','DEVELOPMENT.md','RELEASE_CHECKLIST.md'])assert(fs.existsSync(path.join(root,asset)),`Missing ${asset}`);
    assert(!/filter\s*:\s*invert\(/.test(read('style.css')+read('css/site-theme.css')),'Themes must use semantic colors');
});
check('Preferences import legacy audio, follow System, preserve saves and reset only preferences',()=>{
    const saved=new Map([['blAuctionSound','off'],['blAuctionSaveV2','auction sentinel'],['blStandaloneBuilderV1','builder sentinel']]);
    const root={dataset:{},style:{},classList:{add(){},remove(){}}},favicon={};let listener;
    const media={matches:false,addEventListener(type,fn){listener=fn;}};
    const window={matchMedia:()=>media,addEventListener(){},dispatchEvent(){}};
    const document={baseURI,currentScript:{src:baseURI+'js/site-preferences.js?v=0.6.8.3'},documentElement:root,getElementById:()=>favicon,querySelectorAll:()=>[]};
    const localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
    const context=vm.createContext({document,window,localStorage,URL,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}});
    vm.runInContext(read('js/site-preferences.js'),context);const preferences=window.SitePreferences;
    assert.equal(preferences.get().sfxEnabled,false);assert.equal(root.dataset.theme,'dark');
    preferences.set({theme:'system'});media.matches=true;listener();assert.equal(root.dataset.theme,'light');assert(favicon.href.includes('bld-favicon-light.svg'));
    media.matches=false;listener();assert.equal(root.dataset.theme,'dark');
    preferences.set({theme:'light',sfxEnabled:true});assert.equal(saved.get('blAuctionSound'),'on');assert.equal(JSON.parse(saved.get(preferences.key)).theme,'light');
    media.matches=false;listener();assert.equal(root.dataset.theme,'light','Explicit choice must beat OS');
    preferences.set({language:'ja'});assert.equal(root.lang,'ja');assert.equal(preferences.get().theme,'light');assert.equal(preferences.get().sfxEnabled,true);
    preferences.reset();assert.equal(root.lang,'en');assert.equal(root.dataset.theme,'dark');assert.equal(preferences.get().sfxEnabled,true);
    assert.equal(saved.get('blAuctionSaveV2'),'auction sentinel');assert.equal(saved.get('blStandaloneBuilderV1'),'builder sentinel');
    localStorage.getItem=()=>{throw Error('Storage blocked');};localStorage.setItem=()=>{throw Error('Storage blocked');};preferences.set({theme:'light'});assert.equal(root.dataset.theme,'light');
});
check('Shared image fallback, bounded squad/visible warming and background queue',()=>{
    const images=read('js/player-images.js');assert(images.includes('data:image/svg+xml'),'Self-contained neutral fallback');
    assert(images.includes('image.dataset.fallbackApplied'),'One-shot fallback guard');
    assert(images.includes('portraitDecodeCache.size<=64'),'Bounded settled decode cache');assert(images.includes('portraitBackgroundLoads<2')&&images.includes('portraitActiveLoads<6'),'Bounded background and visible concurrency');assert(images.includes('slice(0,30)'),'Bounded squad warming');
    for(const guard of ['binding?.entry!==entry','binding.url!==image.dataset.portraitSrc','entry.attempts>=2','8000','releasePlayerPortrait','document.currentScript?.src'])assert(images.includes(guard),`Central portrait guard ${guard}`);
    assert(!read('js/lore.js').includes('onerror='),'Lore must use the shared fallback');
    assert(!read('js/ui/setup.js').includes('image-fallback'),'Remove the superseded image handler');
    for(const file of ['js/auction.js','js/results.js','js/formations.js','js/lore.js','js/standalone-builder.js','js/ui/auction-ui.js','js/ui/formation-ui.js','js/ui/setup.js']){
        const source=read(file);assert(!/src="\$\{[\w.]+\.image\}"/.test(source),`${file}: direct image source`);
        assert(source.includes('data-player-image'),`${file}: shared error handling marker`);
    }
});
check('Worker is scope-safe, version-sensitive and cannot pin an old app shell',()=>{
    const worker=read('service-worker.js'),app=read('js/site-runtime.js');
    assert(worker.includes(`bld-static-v${data.APP_VERSION}`),'Worker cache version');
    assert(!/ignoreSearch\s*:\s*true/.test(worker),'Version queries must remain part of cache keys');
    assert(worker.includes('url.pathname.startsWith(scope.pathname)'),'Worker app scope');
    assert(worker.includes('cache.delete(request)'),'Deleted assets leave cache');
    assert(!/CACHEABLE=.*(?:html|css|javascript)/.test(worker),'No app-shell cache');
    assert(app.includes('updateViaCache:"none"'),'Worker update freshness');
    assert(app.includes('scope:root.pathname')&&app.includes('document.baseURI'),'Nested Pages registration scope');
});
check('Readability/builder UX, independent transparent favicon and Quick Draft contracts',()=>{
    const ui=read('js/ui/formation-ui.js'),standalone=read('js/standalone-builder.js'),quick=read('js/ui/quick-draft.js'),preferences=read('js/site-preferences.js');
    const pitch=ui.slice(ui.indexOf('${slots.map'),ui.indexOf('${createPlayerInfoSidebar'));
    assert(pitch.includes('effectiveOVR(p,s.label)'),'Pitch must display current adjusted OVR');
    assert(!pitch.includes('positionBadges('),'No player position lists beneath pitch portraits');
    assert(ui.includes('playerStatsRadar(player,"sidebar")'),'Builder profile keeps the shared attribute radar');
    assert(!ui.includes('<span>PLAYER</span>'),'Redundant profile label removed');
    assert(ui.includes('bench.sort(compareStandalonePlayers)'),'Standalone reserves share the pool comparator');
    assert(standalone.includes('list.sort(compareStandalonePlayers)'),'Pool uses the same comparator');
    const toggle=standalone.slice(standalone.indexOf('function toggleStandalonePoolVisibility'),standalone.indexOf('function standalonePoolCard'));
    assert(!toggle.includes('renderFormationBuilder()'),'Pool collapse preserves the live DOM');
    assert(toggle.includes('aria-expanded'),'Collapse exposes its state');
    const favicon=preferences.slice(preferences.indexOf('function syncFavicon'),preferences.indexOf('function apply'));
    assert(favicon.includes('system.matches')&&!/preferences|resolvedTheme/.test(favicon),'Favicon follows browser/OS rather than site theme');
    for(const file of ['images/bld-favicon-dark.svg','images/bld-favicon-light.svg'])assert(!read(file).includes('<rect'),'Favicon has no background tile');
    assert(read('js/ui/site-directory.js').includes('case "quick-draft":openQuickDraft()'),'Header opens mini setup');
    assert(quick.includes('startRandomDraft()')&&!quick.includes('shufflePlayers('),'Reuse the existing Random Draft algorithm');
    assert(quick.includes('pool.length<rosterSize*2'),'Validate roster capacity');
    for(const file of ['style.css','css/site-header.css','css/player-stats.css'])for(const match of read(file).matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g))assert(Number(match[1])>=12,`${file}: meaningful text below 12px`);
});
check('Character routes retain IDs while non-auction profile layouts stay unchanged',()=>{
    const context=vm.createContext({window:{addEventListener(){}},URL});vm.runInContext(read('js/router.js'),context);
    for(const file of ['lore/','lore.html']){
        let destination;
        context.document={baseURI,querySelector:()=>({href:baseURI})};
        context.window.location={href:baseURI+file+'?view=characters&character=8',assign(){},replace:url=>destination=url};
        const canonical=vm.runInContext('normalizeCurrentRoute("lore")',context);
        assert.equal(canonical,file==='lore/');
        if(destination)assert.equal(new URL(destination).searchParams.get('character'),'8','Legacy profile must retain the selected character');
    }
    const ui=read('js/ui/formation-ui.js');
    assert(ui.includes('player-info-ovr'),'Team Builder profile keeps its portrait OVR overlay');
    const lore=read('js/lore.js');
    assert(lore.includes('<div class="character-profile-ovr"><span>OVERALL RATING</span>'),'Dedicated dossier keeps its original OVR placement');
    assert(!lore.includes('character-profile-attributes-heading'),'Dedicated dossier was not changed by the Auction OVR fix');
});
check('Team Builder target presentation, Auction OVR and shared report contracts',()=>{
    const ui=read('js/ui/formation-ui.js'),auctionUi=read('js/ui/auction-ui.js'),styles=read('style.css'),stats=read('css/player-stats.css');
    const poolAt=ui.indexOf('${pool?');
    const chemistryAt=ui.indexOf('${chemistryHud(formationTeamNumber,team)}');
    const layoutAt=ui.indexOf('<div class="formation-layout');
    assert(poolAt>=0&&poolAt<layoutAt,'Standalone player pool must stay above lineup');
    assert(chemistryAt>=0&&chemistryAt<layoutAt,'Chemistry HUD must stay above lineup');
    assert(ui.includes('function setFormationSlotHint')&&ui.includes('action||fit')&&ui.includes('BEST FIT')&&ui.includes('GOOD FIT'),'One target label with action priority');
    assert(!/content:"(?:BEST FIT|GOOD FIT|SWAP)"/.test(styles),'No overlapping pseudo-labels');
    assert(styles.includes('[data-target-action="swap"]')&&styles.includes('--target-color:var(--fit-swap)')&&read('css/site-theme.css').includes('--fit-swap:var(--chem-strong)'),'Swap uses chemistry blue');
    assert(styles.includes('.money-input input:focus,.money-input input:focus-visible{outline:none!important'),'Bid input focus rectangle removed');
    assert(styles.includes('.share-team-grid{display:grid')&&styles.includes('.report-player-portrait{'),'Shared report retains squad columns and portrait frames');
    assert(read('js/results.js').includes('report-position')&&read('js/results.js').includes('report-captain'),'Report keeps readable position and Captain indicators');
    assert(!auctionUi.includes('auction-player-ovr')&&!stats.includes('.auction-player-ovr'),'Auction OVR must not cover the portrait');
    assert(/playerStatsRadar\(currentPlayer,"auction",\{overall:playerOverall\(currentPlayer\),position:primaryPosition\(currentPlayer\)\}\)/.test(auctionUi),'Auction OVR must render inside Attribute Analysis');
});
check('Clean canonical directory pages, legacy compatibility and critical fonts',()=>{
    const context=vm.createContext({window:{addEventListener(){}},URL});vm.runInContext(read('js/router.js'),context);
    const routes=vm.runInContext('APP_ROUTE_PATHS',context);
    for(const route of Object.values(routes)){
        assert(!route.includes('.html'),'Canonical route must be extensionless');
        assert(fs.existsSync(path.join(root,route,'index.html')),`Missing canonical ${route}`);
    }
    const legacy=vm.runInContext('LEGACY_PAGE_ROUTES',context);
    for(const page of Object.keys(legacy))assert(fs.existsSync(path.join(root,page)),`Missing legacy ${page}`);
    const preload=content=>[...content.matchAll(/<link rel="preload"[^>]+>/g)].map(match=>match[0]);
    for(const page of walk(root).filter(file=>file.endsWith('.html'))){
        const content=fs.readFileSync(page,'utf8');
        const relative=path.relative(root,page);
        if(!['legal/index.html','privacy/index.html','changelog/index.html','404.html'].includes(relative))assert.deepEqual(preload(content),preload(html),'Consistent critical font preloads');
        assert.equal(new Set(preload(content)).size,preload(content).length,'No duplicate font preloads');
        assert(content.indexOf('css/fonts.css')<content.indexOf('style.css'),'Font faces precede component CSS');
    }
    assert.equal((read('css/fonts.css').match(/@font-face/g)||[]).length,54,'Nine Latin faces and matching-weight Japanese, Chinese, Korean, Arabic and extended UI faces');
    assert(!read('css/site-header.css').includes('@font-face'),'No duplicate font definitions');
});
check('CSS loader is unique and obsolete global Back code is absent',()=>{
    const css=read('style.css').replace(/\/\*[\s\S]*?\*\//g,'');
    assert(!/@media[^{}]*var\(/.test(css),'CSS variables cannot define media-query breakpoints');
    assert.equal((css.match(/(?:^|})\s*\.auto-best-loader\s*\{/g)||[]).length,1,'Duplicate/missing loader rule');
    const animations=[...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(match=>match[1]);
    assert.equal(new Set(animations).size,animations.length,'Duplicate animation definitions');
    assert(!/global-back-button/.test(css),'Legacy Back styles remain');
    for(const src of scripts)assert(!/globalBackButton|ensureGlobalBackButton|updateGlobalBackButton|handleGlobalBack/.test(read(src)),`Legacy Back code in ${src}`);
});
check('HTML IDs, contextual navigation, and chapter labels',()=>{
    const ids=[...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match=>match[1]);
    assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
    for(const id of ['siteDirectory','siteBreadcrumb','menu-screen','setup-screen','auction-screen','formation-screen','menuNewAuction','menuStandaloneBuilder','menuLore'])assert(ids.includes(id),`Missing ${id}`);
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
        return {id,value:'',textContent:'',innerHTML:'',dataset:{},style:{setProperty(){},removeProperty(){}},
            classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},
                contains:name=>classes.has(name),toggle(name,force){const add=force??!classes.has(name);if(add)classes.add(name);else classes.delete(name);}},
            contains(){return false;},addEventListener(){},setAttribute(){},removeAttribute(){},hasAttribute(){return false;},appendChild(){},insertBefore(){},before(){},remove(){},focus(){},select(){},matches(){return false;},
            querySelector(selector){return ['.auction-context-actions','.directory-backdrop','[data-settings-close]','[data-preferences-reset]','[data-mobile-settings]','[data-directory-close]','.mobile-directory-backdrop','.mobile-directory-panel'].includes(selector)?element(`${id} ${selector}`):null;},querySelectorAll(){return [];},closest(){return null;}};
    };
    const element=id=>{if(!elements.has(id))elements.set(id,makeElement(id));return elements.get(id);};
    for(const match of html.matchAll(/<[^>]+\bid=["']([^"']+)["'][^>]*>/g)){
        const el=element(match[1]);
        el.value=/\bvalue=["']([^"']*)["']/.exec(match[0])?.[1]||'';
        const classes=/\bclass=["']([^"']*)["']/.exec(match[0])?.[1]||'';
        el.classList.add(...classes.split(/\s+/));
    }
    const labels=[makeElement(),makeElement()];labels.forEach(el=>el.textContent=' // FAN PROJECT // 2026');
    const document={baseURI,currentScript:{src:baseURI+'js/site-preferences.js?v=0.6.8.3'},getElementById:element,querySelector:selector=>['.site-header','.skip-link'].includes(selector)?element(selector):null,querySelectorAll:selector=>selector==='[data-app-version]'?labels:[],
        createElement:()=>makeElement(),addEventListener(){},body:makeElement(),head:makeElement(),documentElement:makeElement()};
    const saved=new Map(Object.entries(initialStorage));
    const localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,String(value)),removeItem:key=>saved.delete(key)};
    const events={};
    const window={location:{href:baseURI+'index.html'+hash,hash},addEventListener(type,fn){(events[type]??=[]).push(fn);},dispatchEvent(event){for(const fn of events[event.type]||[])fn(event);},scrollTo(){},matchMedia:()=>({matches:false,addEventListener(){}})};
    const history={state:null,replaceState(state,unused,url){this.state=state;window.location.hash=new URL(url).hash;},
        pushState(state,unused,url){this.state=state;window.location.hash=new URL(url).hash;}};
    const context=vm.createContext({document,window,history,localStorage,URL,console,assert,navigator:{},getComputedStyle:()=>({display:'none'}),CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},
        setTimeout(){return 1;},clearTimeout(){},requestAnimationFrame(){return 1;},cancelAnimationFrame(){}});
    const run=code=>vm.runInContext(code,context,{timeout:30000});
    for(const file of scripts){
        vm.runInContext(read(file),context,{filename:file,timeout:30000});
        if(file==='js/site-preferences.js')context.SitePreferences=window.SitePreferences;
    }
    return {run,saved,element,labels};
}
check('Mobile foundation loads on every route without restricting zoom; dialog locks preserve saves',()=>{
    for(const file of walk(root).filter(file=>file.endsWith('.html'))){
        const content=fs.readFileSync(file,'utf8');
        const viewport=content.match(/<meta name="viewport" content="([^"]+)"/)?.[1]||'';
        assert(viewport.includes('viewport-fit=cover'),path.relative(root,file)+': safe-area viewport');
        assert(!/user-scalable\s*=\s*no|maximum-scale/i.test(viewport),'Accessibility zoom must stay available');
        assert.equal((content.match(/href="css\/mobile.css\?v=/g)||[]).length,1,'One shared mobile stylesheet');
        assert(content.indexOf('css/mobile.css')>content.indexOf('css/localization.css'),'Mobile foundation follows locale layout');
    }
    const app=appContext();app.run(`
        localStorage.setItem(SAVE_KEY,'unchanged auction');localStorage.setItem(STANDALONE_SAVE_KEY,'unchanged builder');
        const info=document.getElementById('infoModal'),confirm=document.getElementById('confirmModal');
        setSiteDialogState(info,true);setSiteDialogState(confirm,true);
        assert(document.body.classList.contains('dialog-open'));
        setSiteDialogState(confirm,false);assert(document.body.classList.contains('dialog-open'));
        setSiteDialogState(info,false);assert(!document.body.classList.contains('dialog-open'));
        assert.equal(localStorage.getItem(SAVE_KEY),'unchanged auction');assert.equal(localStorage.getItem(STANDALONE_SAVE_KEY),'unchanged builder');
    `);
});
check('Phase 2 presentation preserves Auction state, exposes full history and uses original-source HD branding',()=>{
    const source=fs.readFileSync(path.join(root,'images/bld-logo.png'));
    assert.equal(source.readUInt32BE(16),1254,'Original high-resolution source retained');
    const hd=fs.readFileSync(path.join(root,'images/bld-logo-header-hd.webp'));
    const light=read('images/bld-logo-light.svg');
    assert(light.includes('viewBox="0 0 512 512"'));
    const embedded=/data:image\/webp;base64,([^\"]+)/.exec(light)?.[1];
    assert(embedded&&Buffer.from(embedded,'base64').equals(hd),'Both themes derive from the same legitimate HD image');
    for(const file of walk(root).filter(file=>file.endsWith('.html')))assert(fs.readFileSync(file,'utf8').includes('images/bld-logo-header-hd.webp?v=0.6.9.6&header=phase2'),'Every entry point uses HD branding');
    const app=appContext();app.run(`
        resetDraftState({n1:'A',n2:'B',budget:15000,bidIncrement:50,maxPlayers:11,selectedPlayers:players.slice(0,30)});
        currentPlayer=playerById(3);startingTeam=1;auctionNumber=13;currentBid=50;currentBidder=1;
        auctionHistory=players.slice(0,12).map((player,index)=>({auction:index+1,player,teamNumber:1,teamName:'A',teamColor:team1.color,price:50}));
        const before=JSON.stringify(auctionSnapshot());
        const history=createAuctionHistoryPanel();assert.equal((history.match(/class="history-row"/g)||[]).length,12);
        assert(history.includes('aria-controls="auctionHistoryRows"'));
        const team=createTeamTracker(team1,1);assert(team.includes('aria-controls="auctionTeam1Details"'));
        const card=createPlayerCard();assert(card.includes('aria-controls="auctionPlayerStats"'));assert(card.includes(playerNationalityMarkup(currentPlayer)));
        assert(moneyInput('nextBid',100,100).includes('inputmode="decimal"'));
        assert.equal(JSON.stringify(auctionSnapshot()),before,'Presentation must not mutate bids, budgets, queue, rosters or history');
    `);
});
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
    assert(!data.players.filter(p=>!p.secretCharacter).some(p=>p.name==='John Paccini'));
    assert(data.players.filter(p=>p.secretCharacter).every(p=>p.id>79),'Project characters remain separate from the canon roster');
    assert(!JSON.stringify([data.CHEMISTRY_CONTEXTS,data.CHEMISTRY_SPECIAL_PAIRS]).includes('John Paccini'));
    for(const name of ['MANSHINE CITY','ENGLAND U-20 // FOX SYSTEM']){
        assert(data.CHEMISTRY_CONTEXTS.find(c=>c.name===name)?.players.includes('Rooke'),`Rooke: missing ${name}`);
    }
    const app=appContext();
    app.run(`const ordered=[...players].sort(comparePlayerAppearance);
        assert(ordered.every((p,i)=>!i||comparePlayerAppearance(ordered[i-1],p)<=0));
        assert.equal(players.find(p=>p.name==='Rooke').primaryPosition,'GK');
        assert(characterLoreDescription(playerById(58)).includes('Manshine City')&&characterLoreDescription(playerById(58)).includes('England U-20'));`);
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
            assert.equal(selectedPlayerIds.size,players.filter(p=>!p.secretCharacter).length);
            setPoolCategoryEnabled(key,false);
            assert.equal(selectedPlayerIds.size,players.filter(p=>!p.secretCharacter).length-category.names.length,key+' first click');
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

check('Homepage Scouting Desk reuses database helpers and valid saved-phase navigation',()=>{
    const source=read('js/ui/homepage.js');
    for(const helper of ['playerById','playerImageUrl','playerOverall','playerStatGrade','chemistryRelation','canonicalRouteUrl','prioritizeVisiblePortraits'])assert(source.includes(helper),`Homepage must reuse ${helper}`);
    assert(!/Math\.random|startRandomDraft\(|localStorage\.setItem|function playerStatGrade/.test(source),'Discovery must not draft, write saves or duplicate grades');
    const content=read('index.html');
    for(const id of ['homeTitle','homePlayerSearch','homePlayerResults','homeChemistryA','homeChemistryB','homeChemistryResult','menuResumePanel','menuResumeAuction'])assert(content.includes(`id="${id}"`),`Missing Homepage ${id}`);
    for(const route of ['lore/?view=characters','lore/?view=chemistry','changelog/'])assert(content.includes(`href="${route}"`),`Homepage discovery link ${route}`);
    const app=appContext();
    app.run(`
        assert.equal(homepageResumeSummary(null),null);
        assert.equal(homepageResumeSummary({gameActive:false}),null);
        const saved={gameActive:true,maxPlayers:5,auctionNumber:8,currentPlayerId:8,remainingPlayerIds:[9,10],
            team1:{name:'A',players:[1,2]},team2:{name:'B',players:[3]},uiState:{screen:'auction',phase:'bidding'}};
        assert.equal(homepageResumeSummary(saved).remaining,3);
        assert.equal(homepageResumeSummary(saved).filled,3);
        assert.equal(homepageResumeSummary(saved).route,'auctionRoom');
        saved.team1.players.push(8);saved.uiState.phase='sold';
        assert.equal(homepageResumeSummary(saved).remaining,2,'Signed target must not be counted twice');
        saved.uiState.phase='complete';
        assert.equal(homepageResumeSummary(saved).route,'auctionResults');
        saved.uiState.screen='formation';
        assert.equal(homepageResumeSummary(saved).route,'auctionTeamBuilder');
        assert(homepagePlayerMatches('isagi').some(p=>p.id===1));
        assert.equal(homepagePlayerMatches('no such player').length,0);
        assert.equal(homepagePlayerMatches('').length,players.filter(p=>!p.secretCharacter).length);
        const dossier=new URL(homepageCharacterUrl(playerById(1)));
        assert.equal(dossier.searchParams.get('view'),'characters');
        assert.equal(dossier.searchParams.get('character'),'1');
    `);
});
// v0.6.9.1 integrity baseline: latest-main 2fb9dfdd09330f3fb91f061466e6feeaa743b33f.
const {validateReferenceData,formationFingerprint}=require('../scripts/data-validation.js');
function referenceValidationInput(){return {
    players:data.players,contexts:data.CHEMISTRY_CONTEXTS,pairs:data.CHEMISTRY_SPECIAL_PAIRS,
    metadata:data.PLAYER_PROFILE_METADATA,categories:data.PLAYER_POOL_CATEGORIES,categoryIds:data.PLAYER_POOL_CATEGORY_IDS,
    referencePairs:data.CHEMISTRY_REFERENCE_PAIRS,referenceContexts:data.CHEMISTRY_REFERENCE_CONTEXTS,quotes:data.PLAYER_QUOTES,aliases:data.PLAYER_ALIASES,countries:data.PLAYER_COUNTRIES,
    formations:data.FORMATIONS,expectedFormationFingerprint:'b4b138d62909697c9909e6684a0c612fdddd53368c583e0a4628b4e25993f59e',
    assetExists(source){try{const url=new URL(source,baseURI);return url.href.startsWith(baseURI)&&fs.existsSync(path.join(root,decodeURIComponent(url.pathname.slice(new URL(baseURI).pathname.length))));}catch{return false;}}
};}
check('Player/reference integrity, chemistry ID adapters, verified quotes and immutable formation baseline',()=>{
    assert.deepEqual(validateReferenceData(referenceValidationInput()),[]);
    assert.equal(formationFingerprint(data.FORMATIONS),'b4b138d62909697c9909e6684a0c612fdddd53368c583e0a4628b4e25993f59e');
    const app=appContext();app.run(`
        assert.equal(PLAYER_RECORDS.size,players.length);
        for(const player of players){const record=playerRecord(player.id);assert.equal(record.player,player);assert(record.profile?.overview||player.secretCharacter&&player.description);assert.equal(record.quote,verifiedPlayerQuotes(player.id)[0]||null);assert.equal(record.nationality,player.nationality||null);}
        for(const pair of CHEMISTRY_REFERENCE_PAIRS){assert.equal(pair.score,playerChemistry(...pair.playerIds.map(playerById)));}
        const missing={playerId:1,text:'Validation fixture only',sourceType:'manga',chapter:1,sourceReference:'https://example.test/source',sourceNote:'Integrity fixture',verified:false};
        assert(!isVerifiedCanonQuote(missing));assert(!isVerifiedCanonQuote({...missing,verified:true,sourceReference:''}));
        for(const value of [null,{}, {...missing,verified:'true'}, {...missing,verified:true,text:''}, {...missing,verified:true,chapter:0}])assert(!isVerifiedCanonQuote(value));
        for(const player of players){const markup=characterLoreProfileMarkup(player);assert.equal(markup.includes('class="character-profile-quote"'),!!(playerRecord(player.id).quote||player.secretCharacter&&player.quote));assert(!markup.includes('EGO STATEMENT')&&!markup.includes('<figcaption>'),'Quotes stay inside Player Profile without attribution/source UI');}
    `);
});
check('Data validation rejects malformed players, reversed pairs, missing labels, bad IDs, quotes and coordinates',()=>{
    const baseline=referenceValidationInput();
    const reject=(changes,fragment)=>assert(validateReferenceData({...baseline,...changes}).some(error=>error.includes(fragment)),fragment);
    reject({players:[...data.players,data.players[0]]},'duplicated');
    reject({players:data.players.map((player,index)=>index?player:{...player,positions:['CF','CF'],stats:{...player.stats,spd:101}})},'secondary positions');
    reject({players:data.players.map((player,index)=>index?player:{...player,image:'images/nonexistent.jpg'})},'image reference');
    const first=data.CHEMISTRY_SPECIAL_PAIRS[0];reject({pairs:[...data.CHEMISTRY_SPECIAL_PAIRS,[first[1],first[0],...first.slice(2)]]},'reversed');
    reject({pairs:[['Unknown Player',first[0],101,'','']]},'Unknown/self');
    reject({pairs:[[first[0],first[0],50,'LABEL','Reason']]},'Unknown/self');
    reject({pairs:[[first[0],first[1],50,'','']]},'label/reason');
    reject({referencePairs:[{id:'bad',playerIds:[1,999999]}]},'Bad reference IDs');
    const quote={playerId:1,text:'Validation fixture only',verified:true,sourceType:'manga',chapter:1,sourceReference:'https://example.test/source',sourceNote:'Integrity fixture'};
    for(const change of [{verified:false},{verified:'true'},{text:''},{chapter:0},{chapter:-1},{sourceType:'fan-fiction'},{sourceReference:''},{sourceNote:''}])reject({quotes:[{...quote,...change}]},'quote');
    reject({quotes:[quote,{...quote,playerId:2}]},'Duplicate quote');
    assert.deepEqual(validateReferenceData({...baseline,quotes:[null]}),[],'Missing quote is valid');
    const changePlayer=change=>data.players.map((player,index)=>index?player:{...player,...change});
    const weapon=data.players[0].weapons[0];
    for(const weapons of [[null],[{}],[{...weapon,description:'TBD'}],[weapon,{...weapon,id:'another-id'}],[{...weapon,source:{type:'manga',url:'not-a-url',note:'Source',chapter:-1}}]])reject({players:changePlayer({weapons})},'weapon');
    for(const category of [undefined,null,'flow','physical,mental',['physical','mental']])reject({players:changePlayer({weapons:[{...weapon,category}]})},'weapon category');
    reject({players:changePlayer({weapons:[{...weapon,name:'Flow State'}]})},'Flow');
    const alias={name:'Integrity fixture',verified:true,source:{type:'anime-subtitles',url:'https://example.test/source',episode:1,note:'Integrity fixture'}};
    for(const aliases of [{999999:[alias]},{1:[]},{1:[null]},{1:[{...alias,verified:false}]},{1:[alias,alias]},{1:[{...alias,source:{...alias.source,episode:0}}]}])reject({aliases},'alias');
    assert.deepEqual(validateReferenceData({...baseline,aliases:{}}),[],'No alias is valid');
    reject({players:changePlayer({nationality:{code:'JPN',name:'Japan'}})},'nationality');
    reject({players:changePlayer({nationality:{...data.players[0].nationality,code:'ZZ'}})},'nationality');
    reject({countries:{...data.PLAYER_COUNTRIES,JP:{...data.PLAYER_COUNTRIES.JP,flag:'images/flags/missing.svg'}}},'flag asset');
    assert.deepEqual(validateReferenceData({...baseline,players:changePlayer({nationality:null,weapons:[]})}),[],'Unknown nationality and no weapons are valid');
    const formations=JSON.parse(JSON.stringify(data.FORMATIONS));formations['4-3-3'][0].x=51;reject({formations},'coordinates changed');
    reject({metadata:{999999:{overview:'Unknown',classification:'CANON'}}},'Unknown/malformed profile');
    reject({metadata:{1:{overview:'Role test',classification:'CANON',canonPositions:[{position:'INVALID'}]}}},'canon role');
    reject({categories:{unknown:{label:'Unknown',names:['Unknown Player']}}},'category');
});
check('Database guidance, accessible controls, scoped styling and metadata foundations',()=>{
    const lore=read('js/lore.js'),css=read('css/character-lore.css');
    assert(!lore.includes('BATTLE SIM')&&!lore.includes('Placeholder:'),'No future-mode placeholder UI');
    for(const id of ['characterLoreAffiliation','characterLoreCategory','characterLoreComparison','chemistryLorePlayerA','chemistryLorePlayerB','chemistryLoreContext','chemistryLorePairEvaluation'])assert(html.includes(`id="${id}"`),id);
    for(const key of ['sho','spd','dri','pas','def'])assert(html.includes(`value="${key}"`),'Attribute sort '+key);
    assert(lore.includes('setTimeout(render,120)')&&lore.includes('characterSorts:new Map()')&&lore.includes('grid.replaceChildren(...nodes)'),'Debounced search, cached sorting and reused nodes');
    assert(lore.includes('href="${characterDossierHref')&&lore.includes('aria-pressed'),'Real dossier links and accessible compare controls');
    assert(css.includes('aspect-ratio:4/5')&&css.includes('object-fit:cover'),'Portrait frames');
    for(const file of walk(root).filter(file=>file.endsWith('.html'))){const content=fs.readFileSync(file,'utf8');for(const tag of ['name="description"','property="og:title"','property="og:description"',...(file.endsWith('404.html')?[]:['rel="canonical"'])])assert(content.includes(tag),`${path.relative(root,file)}: ${tag}`);}
    for(const file of ['fonts/LICENSE-Barlow-Condensed.txt','fonts/LICENSE-Rajdhani.txt'])assert(read('legal/index.html').includes(`href="${file}"`),'Visible font licence '+file);
});

check('Chapter-364 quote boundary, review coverage and new canon aliases remain searchable',()=>{
    const app=appContext();app.run(`
        assert.deepEqual(Object.keys(PLAYER_REFERENCE_CONTENT_REVIEW.players).map(Number).sort((a,b)=>a-b),players.filter(p=>!p.secretCharacter).map(p=>p.id).sort((a,b)=>a-b));
        const fixture={...PLAYER_QUOTES.find(q=>q.playerId===49),chapter:364};
        assert.equal(fixture.sourceType,'manga');assert(isVerifiedCanonQuote(fixture));
        assert(!isVerifiedCanonQuote({...fixture,chapter:365}));
        for(const [id,name] of [[1,'Game Master'],[7,'Red Panther'],[16,'The Watchtower'],[49,'Emperor'],[49,'Superstar'],[31,'Pink Devil'],[55,'Royal Messenger'],[56,'Zombie'],[57,'Contrarian']]){
            assert(verifiedPlayerAliases(id).some(alias=>alias.name===name));
            assert(homepagePlayerMatches(name).some(player=>player.id===id));
            assert(loreDatabase().characters.some(record=>record.player.id===id&&matchesLoreSearch(record.search,normalizeLoreSearch(name))));
        }
        const markup=characterLoreProfileMarkup(playerById(49));
        assert(markup.includes(esc(fixture.text)));assert(!markup.includes('uniqlo.com'));
        assert(!markup.includes('Licensed English wording')&&!markup.includes('sourceAccess'));
    `);
    const baseline=referenceValidationInput(),fixture={...data.PLAYER_QUOTES.find(q=>q.playerId===49),chapter:364};
    assert.deepEqual(validateReferenceData({...baseline,quotes:[fixture]}),[]);
    assert(validateReferenceData({...baseline,quotes:[{...fixture,chapter:365}]}).some(error=>error.includes('quote')));
    const alias=data.PLAYER_ALIASES[49][0];
    assert(validateReferenceData({...baseline,aliases:{49:[{...alias,source:{...alias.source,chapter:365}}]}}).some(error=>error.includes('alias')));
});
check('Mandatory localization release gate covers current visible update copy in every language',()=>{
    const source=read('js/localization.js');
    const startToken='const releaseGateOverrides=Object.freeze(',endToken=');\n    const catalog=';
    const start=source.indexOf(startToken),end=source.indexOf(endToken,start);
    assert(start>=0&&end>start,'releaseGateOverrides catalog exists');
    const gate=JSON.parse(source.slice(start+startToken.length,end));
    const locales=['ms','ja','ar','zh-CN','fr','de','ko','pt','ru','es'];
    const required=["ADD PLAYER","BEST FIT","GOOD FIT","OUT OF POSITION","NO RESERVES AVAILABLE","CLOSE","RELEASE HISTORY","CURRENT RELEASE","V0.6 SERIES","V0.5 SERIES","V0.6 BASE","Changelog releases","Open site settings","Close site settings","Tapping an empty pitch position now opens the active team’s Reserve Picker on both desktop and mobile, with positional fit labels. Desktop uses a compact centered dialog with aligned player identity, position badges, OVR and fit status for cleaner scanning; choosing a reserve still uses existing placement logic and selected-player placement takes priority.","The Changelog release-history sidebar now keeps subversions hidden inside click-to-open version groups, uses a small + / − expansion indicator, and animates each group open/closed.","Opening Settings now keeps the document scrollbar gutter reserved while background scrolling is locked, preventing the page from shifting sideways when the gear panel opens or closes.","Localization is now a mandatory release gate: every new or changed visible UI string, accessibility label and Changelog note must ship in all supported languages before an update is considered complete."];
    for(const key of required){
        assert(gate[key],'Release-gate translation exists: '+key);
        for(const locale of locales)assert(typeof gate[key][locale]==='string'&&gate[key][locale].trim(),'Release-gate locale '+locale+': '+key);
    }
    const formation=read('js/ui/formation-ui.js'),changelog=read('changelog/index.html'),directory=read('js/ui/site-directory.js');
    for(const key of ['ADD PLAYER','BEST FIT','GOOD FIT','OUT OF POSITION','NO RESERVES AVAILABLE','CLOSE'])assert(formation.includes(key)&&gate[key],key);
    for(const key of ['RELEASE HISTORY','CURRENT RELEASE','V0.6 SERIES','V0.5 SERIES','V0.6 BASE'])assert(changelog.includes(key)&&gate[key],key);
    for(const key of ['Open site settings','Close site settings'])assert(directory.includes(key)&&gate[key],key);
    assert(formation.includes('SiteI18n?.apply(dialog)'),'Dynamic Reserve Picker localizes immediately');
    for(const key of ["Tapping an empty pitch position now opens the active team’s Reserve Picker on both desktop and mobile, with positional fit labels. Desktop uses a compact centered dialog with aligned player identity, position badges, OVR and fit status for cleaner scanning; choosing a reserve still uses existing placement logic and selected-player placement takes priority.","The Changelog release-history sidebar now keeps subversions hidden inside click-to-open version groups, uses a small + / − expansion indicator, and animates each group open/closed.","Opening Settings now keeps the document scrollbar gutter reserved while background scrolling is locked, preventing the page from shifting sideways when the gear panel opens or closes.","Localization is now a mandatory release gate: every new or changed visible UI string, accessibility label and Changelog note must ship in all supported languages before an update is considered complete."])assert(changelog.includes(key)&&gate[key],'Localized current Changelog note');
});
check('v0.6.9.4 local languages, English canon references and 404 contract',()=>{
    const window={},sandbox=vm.createContext({window});vm.runInContext(read('js/i18n/messages.js'),sandbox);
    const messages=window.BLD_MESSAGES;assert(Object.keys(messages).length>1000);
    for(const [key,value] of Object.entries(messages))for(const language of ['ms','ja','ar','zh-CN','fr','de','ko','pt','ru','es'])assert(key&&typeof value[language]==='string'&&value[language].trim()&&!/[XＸХ]1\d\d|إكس\s*1\d\d|ZXQ|⁇|\[object Object\]/.test(value[language]),'Complete language entry: '+language+' '+key);
    for(const template of window.BLD_MESSAGE_TEMPLATES)for(const language of ['ms','ja','ar','zh-CN','fr','de','ko','pt','ru','es'])assert(typeof template[language]==='string'&&template[language].trim(),'Localized dynamic format '+language);
    for(const profile of Object.values(data.PLAYER_PROFILE_METADATA))assert(messages[profile.overview],'Translated profile');
    for(const player of data.players)for(const weapon of player.weapons||[])assert(messages[weapon.description],'Translated weapon '+weapon.name);
    assert(data.PLAYER_QUOTES.length>=25,'Meaningful expanded verified quote collection');
    const notFound=read('404.html');assert(notFound.includes('noindex')&&notFound.includes('data-site-page="404"'));
    assert(!notFound.includes('js/app.js')&&!notFound.includes('location.replace(')&&!notFound.includes('location.href='),'404 stays a real error document');
    for(const link of ['./','auction/setup/','team-builder/','lore/?view=characters'])assert(notFound.includes('href="'+link+'"'),'404 recovery '+link);
});
check('v0.6.9.2 balanced OVR, chemistry-network scoring and results links',()=>{
    const metric=vm.runInContext(`({
        balanced:lineupOVRProfile([90,90,90,90,90,90,90,90,90,90,90]).value,
        topHeavy:lineupOVRProfile([99,98,97,96,95,94,93,92,91,90,70]).value,
        weakChem:chemistryNetworkScore(Array(20).fill(55),[],20),
        solidChem:chemistryNetworkScore(Array(20).fill(80),[80,80],20),
        eliteChem:chemistryNetworkScore(Array(20).fill(95),[95,95],20)
    })`,sandbox);
    assert.equal(metric.balanced,90);
    assert(metric.topHeavy<93,'Weak lower band affects Team OVR');
    assert(metric.weakChem<metric.solidChem&&metric.solidChem<metric.eliteChem,'Chemistry network scale ordering');
    const results=read('js/results.js'),playerStats=read('css/player-stats.css');
    assert(results.includes('resultChemistryLinksMarkup')&&results.includes('shareChemistrySvg'),'Results chemistry links present');
    assert(playerStats.includes('.results-chemistry-panel')&&playerStats.includes('.formation-pitch-v2 .slot-position'),'Results/link and larger position-tag styles present');
});

check('v0.6.9.5 deterministic target queue and exact-full free-award Undo',()=>{
    const app=appContext();app.run(`
        resetDraftState({n1:'A',n2:'B',budget:15000,bidIncrement:50,maxPlayers:2,selectedPlayers:players.slice(0,8)});
        startingTeam=1;currentPlayer=remainingPlayers.shift();auctionNumber=1;displayOpeningBid();
        document.getElementById('openingBid').value='50';placeOpeningBid();passBid();
        const firstId=currentPlayer.id,nextId=remainingPlayers[0].id;
        const sold=JSON.stringify(auctionSnapshot());
        advanceToNextAuction();assert.equal(currentPlayer.id,nextId);
        undoAuctionAction();assert.equal(JSON.stringify(auctionSnapshot()),sold);
        advanceToNextAuction();assert.equal(currentPlayer.id,nextId);
        undoAuctionAction();undoAuctionAction();assert.equal(currentPlayer.id,firstId);
        const queue=JSON.stringify(remainingPlayers.map(p=>p.id));
        advanceToNextAuction();assert.equal(currentPlayer.id,firstId);
        assert.equal(JSON.stringify(remainingPlayers.map(p=>p.id)),queue);
        for(const capacity of [1,2,5,15,39]){
            resetDraftState({n1:'A',n2:'B',budget:15000,bidIncrement:50,maxPlayers:capacity,selectedPlayers:players});
            team1.players=players.slice(0,capacity);team2.players=players.slice(capacity,2*capacity-1);
            currentPlayer=players[2*capacity-1];remainingPlayers=players.slice(2*capacity);auctionNumber=2*capacity;
            uiState={screen:'auction',phase:'forced',turn:2};const target=currentPlayer.id;
            awardPlayerFree(2,true);const full=JSON.stringify(auctionSnapshot());
            for(let repeat=0;repeat<3;repeat++){
                undoAuctionAction();assert.equal(currentPlayer.id,target);assert.equal(team2.players.length,capacity-1);
                assert.equal(uiState.phase,'forced');assert(overlayContent.innerHTML.includes('resumeAssignedPlayer'));
                redoAuctionAction();assert.equal(JSON.stringify(auctionSnapshot()),full);
            }
            const before=JSON.stringify(auctionSnapshot());awardPlayerFree(2,true);assert.equal(JSON.stringify(auctionSnapshot()),before);
        }
        assert(!validateBid(NaN,team1,0));assert(!validateBid(Infinity,team1,0));
    `);
});
check('Full-team automatic assignment Undo from opening/bidding is held without awarding again',()=>{
    for(const phase of ['opening','bidding']){
        const app=appContext();app.run(`
            resetDraftState({n1:'A',n2:'B',budget:15000,bidIncrement:50,maxPlayers:2,selectedPlayers:players.slice(0,8)});
            team1.players=players.slice(0,2);team2.players=[players[2]];
            currentPlayer=players[3];remainingPlayers=players.slice(4,8);auctionNumber=4;startingTeam=2;
            currentBid=50;currentBidder=2;uiState={screen:'auction',phase:'${phase}',turn:2};
            const target=currentPlayer.id,queue=JSON.stringify(remainingPlayers.map(p=>p.id));
            ${phase==='opening'?'displayOpeningBid();':'displayBiddingTurn(2);'}
            assert.equal(team2.players.length,2);
            undoAuctionAction();
            assert.equal(team2.players.length,1,'Undo must not immediately replay the award while rendering');
            assert.equal(currentPlayer.id,target);assert.equal(JSON.stringify(remainingPlayers.map(p=>p.id)),queue);
            assert.equal(uiState.phase,'forced');assert.equal(uiState.assignmentHeld,true);
            assert(overlayContent.innerHTML.includes('resumeAssignedPlayer'));
            const held=JSON.stringify(auctionSnapshot());resumeCurrentView();assert.equal(JSON.stringify(auctionSnapshot()),held);
        `);
    }
});
check('Auction flags reuse verified nationality and saved secret players require session access',()=>{
    const app=appContext();app.run(`
        for(const id of [1,3,80,81]){
            currentPlayer=playerById(id);
            assert(createPlayerCard().includes(playerNationalityMarkup(currentPlayer)));
        }
        const base={team1:{players:[1]},team2:{players:[2]},remainingPlayerIds:[3],selectedPlayerIds:[1,2,3],currentPlayerId:1,auctionHistory:[]};
        assert(!auctionSaveNeedsSecretCode(base));
        for(const id of [80,81]){
            for(const saved of [{...base,currentPlayerId:id},{...base,remainingPlayerIds:[id]},{...base,selectedPlayerIds:[id]},{...base,team1:{players:[id]}},{...base,auctionHistory:[{playerId:id}]},{...base,auctionUndoStack:[{team2:{playerIds:[id]}}]},{...base,auctionRedoStack:[{currentPlayerId:id}]}]){
                const before=JSON.stringify(saved);assert(auctionSaveNeedsSecretCode(saved));assert.equal(JSON.stringify(saved),before);
            }
        }
        selectedPlayerIds=new Set(players.map(p=>p.id));
        document.getElementById('team1Name').value='A';document.getElementById('team2Name').value='B';
        document.getElementById('budget').value='1000';document.getElementById('bidIncrement').value='50';document.getElementById('maxPlayers').value='2';
        assert(getValidatedSetup().selectedPlayers.every(p=>!p.secretCharacter));
        unlockSecretCharacters();assert(!auctionSaveNeedsSecretCode({...base,currentPlayerId:80}));
    `);
});
check('Demonstrated-role audit covers the canon roster without changing gameplay or project characters',()=>{
    const app=appContext();app.run(`
        for(const player of players.filter(p=>!p.secretCharacter)){
            const profile=playerRecord(player.id).profile,audit=profile.positionAudit;
            assert.equal(audit.throughChapter,364);assert(['documented','unresolved'].includes(audit.status));
            assert.equal(audit.status==='documented',!!profile.canonPositions?.length);
            for(const role of profile.canonPositions||[]){assert(/^https:\\/\\//.test(role.sourceUrl));assert(!role.chapter||role.chapter<=364);}
        }
        for(const [id,name]of [[18,'Double Aces of Rajitsu Tech'],[19,'Double Aces of Rajitsu Tech'],[20,'King-of-All-Trades'],[62,'Luminous'],[64,'Butterfly Lashes'],[66,'Iron Man'],[67,'Rainbow Knight']])assert(verifiedPlayerAliases(id).some(a=>a.name===name));
        for(const id of [80,81]){assert(playerById(id).secretCharacter);assert(!PLAYER_PROFILE_METADATA[id]?.canonPositions?.length);}
        assert(!secretCharactersUnlocked);assert(players.filter(p=>p.secretCharacter).every(p=>!selectedPlayerIds.has(p.id)));
        unlockSecretCharacters();assert(secretCharactersUnlocked);assert(players.filter(p=>p.secretCharacter).every(p=>!selectedPlayerIds.has(p.id)));
        assert(canonicalFit(playerById(80),'GK'));assert.equal(positionBadges(playerById(80)).includes('ALL'),true);
        assert.equal(playerChemistry(playerById(81),playerById(9)),99);
    `);
});
check('v0.6.9.5 localized quote, alias and weapon catalogs preserve reference provenance',()=>{
    const window={},context=vm.createContext({window});vm.runInContext(read('js/i18n/messages.js'),context);
    const messages=window.BLD_MESSAGES;
    for(const quote of data.PLAYER_QUOTES)assert(messages[quote.text],'Quote display translation '+quote.playerId);
    for(const aliases of Object.values(data.PLAYER_ALIASES))for(const alias of aliases)assert(messages[alias.name],'Alias display translation '+alias.name);
    for(const player of data.players)for(const weapon of player.weapons)assert(messages[weapon.name]&&messages[weapon.description],'Weapon display translation '+player.id);
    const app=appContext();app.run(`
        const shindo=verifiedPlayerQuotes(60)[0];assert(shindo&&shindo.chapter===327);
        assert.equal(shindo.localization,'project-translation-Japanese-manga');assert(shindo.originalText.includes('新導ハネル'));
        assert(!isVerifiedCanonQuote({...shindo,originalText:''}));assert(!isVerifiedCanonQuote({...shindo,chapter:365}));
        assert.equal(normalizeLoreSearch('التكيّف'),normalizeLoreSearch('التكيف'));
        selectedFormationPlayerId=1;formationTeamNumber=0;standaloneBuilderTeam.players=[playerById(1)];
        const info=createPlayerInfoSidebar(standaloneBuilderTeam);assert(info.includes('player-info-name')&&info.includes('Yoichi Isagi'));assert(!info.includes('player-aliases'));
    `);
});

console.log(`\n${failures?'FAIL':'PASS'} preflight — ${failures} failed check(s). Browser UI testing is separate.`);
process.exitCode=failures?1:0;
