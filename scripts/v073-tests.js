#!/usr/bin/env node
'use strict';
// v0.7.3 regression suite: Daily rules, Daily Tactical, curated mission solvability,
// Challenge Lab code safety, Draft Duel, Ego Record and navigation wiring.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createModeTestContext}=require('./game-modes-tests');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
function v073Context(){
    const {context,run}=createModeTestContext();
    for(const file of ['solo-draft.js','draft-duel.js','challenge-lab.js','ego-record.js'])vm.runInContext(read('js/'+file),context,{filename:file});
    return {context,run};
}
function pass(label){console.log('PASS v0.7.3: '+label);}
function runV073Tests(){
    const {run}=v073Context(),block=code=>run('{'+code+'\n}');
    // ---------- Daily rules ----------
    block(`
        const first=dailyDayNumber('2026-11-02');assert.equal(dailyDayString(first),'2026-11-02','day arithmetic round-trips');
        const modifiers=new Set(),themes=new Set(),sizes=new Set();let previous=null;
        for(let d=0;d<365;d++){
            const date=dailyDayString(first+d),rule=dailyPickRule(date),again=dailyV3Rule(date);assert.deepEqual(rule,again);assert.equal(rule.rules,3);
            modifiers.add(rule.modifier.id);themes.add(rule.id);sizes.add(rule.size);
            assert(!(DAILY_MODIFIER_CONFLICTS[rule.id]||[]).includes(rule.modifier.id),'conflicting rule on '+date);
            if(previous){assert.notEqual(previous.id,rule.id,'theme repeated on '+date);assert.notEqual(previous.modifier.id,rule.modifier.id,'rule repeated on '+date);}
            previous=rule;
            assert(rule.pool.every(id=>!playerById(id).secretCharacter)&&rule.start.every(id=>rule.pool.includes(id)),'public pool only');
            assert(rule.formations.length>=1&&rule.formations.every(name=>dailyFormationNames(rule.size).includes(name)));
            if(rule.modifier.id==='locked-captain')assert(rule.captainId&&rule.start.includes(rule.captainId));
            if(rule.modifier.id==='head-start'){assert.equal(rule.start.length,2);assert.equal(positionGroup(primaryPosition(playerById(rule.start[0]))),'DEFENCE');assert.equal(positionGroup(primaryPosition(playerById(rule.start[1]))),'ATTACK');}
        }
        assert.equal(modifiers.size,DAILY_MODIFIERS.length);assert.equal(themes.size,10);assert.deepEqual([...sizes].sort((a,b)=>a-b),[7,8,9,10,11,14]);
        assert.equal(dailyPickRule('2026-11-01').rules,undefined,'earlier dates keep the legacy rules');assert.equal(dailyRevisionForDate('2026-11-01'),2);
        // Complete runs on a sample of dates, including every rule.
        const seen=new Set();for(let d=0;d<80&&seen.size<DAILY_MODIFIERS.length*2;d++){
            const date=dailyDayString(first+d),rule=dailyPickRule(date);if(seen.has(rule.modifier.id+':'+(d%2)))continue;seen.add(rule.modifier.id+':'+(d%2));
            const state=dailyPickNew(date);assert.equal(state.rules,3);assert.equal(state.tokens,rule.tokens);assert.deepEqual(state.ids,rule.start);dailyStartPicks(state);
            let guard=0;while(state.phase==='picking'&&guard++<30){const options=dailyPickOptions(state);assert(options.length>=2&&options.length<=(rule.offers||3),'offers on '+date);assert.equal(new Set(options).size,options.length);
                if(rule.tokens===0)assert.throws(()=>dailyPickAction(state,{type:'reroll'}));
                const pick=options[(d+state.ids.length)%options.length];dailyPickAction(state,{type:'pick',id:pick});}
            assert.equal(state.phase,'review',date);assert.equal(state.ids.length,rule.size);
            if(rule.cap!=null)assert(dailyBudgetLeft(state)>=0,'cap respected '+date);
            if(rule.eliteCap)assert(state.ids.filter(id=>playerOverall(playerById(id))>=rule.eliteCap).length<=1+rule.start.filter(id=>playerOverall(playerById(id))>=rule.eliteCap).length);
            if(rule.captainId&&Object.values(state.assignment).includes(rule.captainId))assert.equal(state.captain,rule.captainId);
            const restored=normalizeSoloState(JSON.parse(JSON.stringify(state)));assert.deepEqual(restored.ids,state.ids);assert.equal(restored.rules,3);
            const score=dailyPickScore(state);assert(score.score>0&&score.score<12500);
        }
        // Regression: 14-pick Locked Captain days where the best lineup benches the captain must still reload.
        for(const date of ['2027-05-17','2027-07-26']){const rule=dailyPickRule(date);assert.equal(rule.modifier.id,'locked-captain');assert.equal(rule.size,14);
            const state=dailyPickNew(date);state.formation=rule.formations[0];dailyStartPicks(state);while(state.phase==='picking'){const o=dailyPickOptions(state);dailyPickAction(state,{type:'pick',id:[...o].sort((a,b)=>playerOverall(playerById(b))-playerOverall(playerById(a)))[0]});}
            assert(Object.values(state.assignment).includes(state.captain),'captain is deployed '+date);assert.deepEqual(normalizeSoloState(JSON.parse(JSON.stringify(state))).ids,state.ids);}
        // A run saved before v0.7.3 on a v3 date keeps its original (legacy) rules.
        const legacy=dailyPickNew('2026-11-05',2);assert.equal(legacy.rules,undefined);dailyStartPicks(legacy);dailyPickAction(legacy,{type:'pick',id:dailyPickOptions(legacy)[0]});
        const reloaded=normalizeSoloState(JSON.parse(JSON.stringify(legacy)));assert.equal(reloaded.rules,undefined);assert.deepEqual(reloaded.ids,legacy.ids);assert.equal(dailyRuleForState(reloaded).modifier,null);
        assert.throws(()=>normalizeSoloState({...legacy,rules:7}));
    `);
    pass('365 Daily dates: no consecutive theme/rule repeats, every rule and size, conflicts excluded, sampled runs complete under caps, captains and offers; legacy runs keep legacy rules');
    // ---------- Daily Tactical ----------
    block(`
        const first=dailyDayNumber('2026-11-02'),templates=new Set(),formations=new Set();
        for(let d=0;d<120;d++){
            const date=dailyDayString(first+d),mission=dailyTacticMission(date);tacticCache.clear();const again=dailyTacticMission(date);
            assert.deepEqual(JSON.parse(JSON.stringify(mission)),JSON.parse(JSON.stringify(again)),'deterministic tactic '+date);
            templates.add(mission.template);formations.add(mission.formation);
            assert(Object.hasOwn(FORMATIONS,mission.formation));assert(mission.pool.every(id=>!playerById(id).secretCharacter));assert(Object.values(mission.initial).every(id=>!playerById(id).secretCharacter));
            assert(mission.locked.length>=7&&mission.locked.length<=9);assert(mission.goals.length>=1&&mission.bonus.length===2);
            const state=puzzleValidate({v:1,kind:'puzzle',mission:mission.id,formation:mission.formation,assignment:Object.fromEntries(mission.witness),captain:null,ids:[],phase:'building'});
            state.captain=soloChooseCaptain(state);const result=puzzleScore(state);assert(result.complete,'witness solves '+date);
            assert(puzzleSpend(state)<=mission.budget);
            const fresh=puzzleNew(mission.id);assert(!puzzleScore(fresh).complete,'the starting squad is not already solved '+date);
        }
        assert.equal(templates.size,TACTIC_TEMPLATES.length);assert(formations.size>=6);
        // The record key and storage window accept tactic results.
        const state=puzzleNew('tactic:2026-11-02');soloBeginAttempt(state);assert(soloRecords()['puzzle:tactic:2026-11-02'].attempts===1);
    `);
    pass('120 Daily Tactical dates: deterministic, public-only, every template, solver witness completes the required goals within budget, starting squads unsolved');
    // ---------- Curated missions ----------
    block(`
        const missions=curatedPuzzleMissions();assert.equal(missions.length,16);assert.equal(new Set(missions.map(m=>m.id)).size,16);
        const categories=new Set(["Tactical","Chemistry","Budget","Formation","Character","Restricted","Expert"]);
        for(const m of missions){
            assert(categories.has(m.category),m.id+' category');assert(m.pool.every(id=>!playerById(id).secretCharacter));
            for(const slot of m.locked)assert(m.pool.includes(m.initial[slot]));
            const witness=puzzleSolve(m,{beam:30,perSlot:10,evaluate:30});assert(witness&&witness.result.complete,m.id+' must be solvable');
        }
        assert(missions.some(m=>m.category==='Budget')&&missions.some(m=>m.category==='Expert'));
        assert.equal(egoMedal('S+'),'gold');assert.equal(egoMedal('S'),'gold');assert.equal(egoMedal('A'),'silver');assert.equal(egoMedal('C'),'bronze');assert.equal(egoMedal('D'),null);assert.equal(egoMedal('A',false),null);
    `);
    pass('all 16 curated Draft Challenges are solvable by the shared solver; categories and medals are valid');
    // ---------- Challenge Lab ----------
    block(`
        const base={v:1,title:'Beat This',formation:'4-3-3',budget:2500,pool:'all',banned:[3],locked:[[9,1],[0,8]],captain:1,goals:[{type:'chemistry',target:74}],bonus:[{type:'minOVR',target:86},{type:'nation',key:'JP',target:6}]};
        const code=labEncode(base),mission=labRegisterCode(code);assert(code.startsWith('BLDL1.'));
        assert.deepEqual(labMission(labDecode(code)).settings,labMission(base).settings,'code round-trip');assert.equal(mission.id,labMission(base).id);
        assert(!mission.pool.includes(3)&&mission.pool.every(id=>!playerById(id).secretCharacter));
        const state=puzzleNew(mission.id);assert.equal(state.code,mission.code);soloState=state;soloSave();const loaded=soloLoad();assert.equal(loaded.mission,mission.id);
        PUZZLE_EXTRA_MISSIONS.clear();assert.equal(normalizeSoloState(JSON.parse(JSON.stringify(state))).mission,mission.id,'a saved Lab run re-registers from its own code');
        const bad=[
            {...base,formation:'8-8-8'},{...base,budget:250},{...base,budget:2510},{...base,budget:9000},{...base,pool:'secret'},
            {...base,banned:[1,2,3,4,5,6,7,8,9]},{...base,banned:[80]},{...base,locked:[[9,80]]},{...base,locked:[[9,1],[9,4]]},{...base,locked:[[9,1],[10,1]]},
            {...base,locked:[[0,1]]},{...base,locked:[[11,1]]},{...base,captain:4},{...base,goals:[{type:'chemistry',target:120}]},{...base,goals:[{type:'eval',target:1}]},
            {...base,goals:[{type:'nation',key:'ZZ',target:3}]},{...base,goals:[{type:'categoryMin',key:'__proto__',target:3}]},{...base,goals:[1,2,3,4,5].map(()=>({type:'chemistry',target:70}))},
            {...base,title:''},{...base,title:'x'.repeat(41)},{...base,title:42},{...base,v:2},{...base,locked:[[9,3]]}
        ];
        for(const value of bad)assert.throws(()=>labMission(value),JSON.stringify(value).slice(0,80));
        assert.equal(labMission({...base,title:'  <b>Hi</b>\\u0007 '}).title,'bHi/b','markup and control characters are stripped');
        const parts=code.split('.');assert.throws(()=>labDecode(parts[0]+'.'+parts[1]+'.zzz'),'tampered checksum');assert.throws(()=>labDecode('BLDC2.'+parts[1]+'.'+parts[2]),'wrong prefix');assert.throws(()=>labDecode('x'.repeat(13000)));
        assert.throws(()=>labRegisterCode(replayCode('BLDL1',[1,'Secret','4-3-3',2500,'all',[],[[9,81]],null,[],[]])),'secret characters cannot be imported');
        assert.throws(()=>labMission({...base,locked:[[9,81]]}),/missing player/,'the error never names the secret roster');
        assert.throws(()=>labRegisterCode(labEncode({...base,budget:300,locked:[[0,8]],captain:null,goals:[{type:'chemistry',target:99},{type:'minOVR',target:99}],bonus:[]})),'infeasible challenges are rejected');
        labSaveToLibrary(code,true);assert.equal(labLibrary()[0].id,mission.id);labRemoveFromLibrary(mission.id);assert.equal(labLibrary().length,0);
        localStorage.setItem(LAB_LIBRARY_KEY,'{"v":1,"items":[{"code":"BLDL1.bad.0"},{"code":42},null]}');assert.deepEqual(labLibrary(),[]);
    `);
    pass('Challenge Lab codes round-trip; malformed, forged, secret, impossible-slot and infeasible challenges are rejected; Lab runs restore from their own code');
    // ---------- Draft Duel ----------
    block(`
        for(const format of Object.keys(DUEL_FORMATS))for(const level of DUEL_LEVELS){
            const a=duelNew({seed:1234,format,level}),b=duelNew({seed:1234,format,level});duelStart(a);duelStart(b);
            while(a.phase==='draft'){assert.deepEqual(a.market,b.market);assert(a.market.every(id=>!playerById(id).secretCharacter));const pick=a.market[a.log.length%a.market.length];duelPick(a,pick);duelPick(b,pick);assert.throws(()=>duelPick(a,pick));}
            assert.equal(a.phase,'review');assert.deepEqual(a.cpu,b.cpu,'deterministic CPU');assert.equal(a.human.length,DUEL_FORMATS[format].size);assert.equal(a.cpu.length,DUEL_FORMATS[format].size);
            assert.equal(new Set([...a.human,...a.cpu]).size,a.human.length*2,'no player is owned twice');
            const saved={v:1,kind:'duel',seed:a.seed,format,level,daily:null,phase:'review',humanFormation:a.humanFormation,actions:a.actions,finalFormation:a.finalFormation,attempt:1};
            assert.deepEqual(normalizeDuelState(saved).cpu,a.cpu);assert.throws(()=>normalizeDuelState({...saved,actions:[...a.actions.slice(0,-1),9999]}));assert.throws(()=>normalizeDuelState({...saved,format:'mega'}));
            const result=duelResult(duelFinish(a));assert(['win','loss','draw'].includes(result.outcome));assert(Number.isFinite(result.margin));
        }
        const coded=duelFromCode(duelCode(duelNew({seed:77,format:'quick',level:'hard'})));assert.equal(coded.seed,77);assert.equal(coded.level,'hard');assert.throws(()=>duelFromCode('BLDD1.e30.0'));
        // The CPU choice only depends on the visible market and both rosters.
        const s=duelNew({seed:99,format:'standard',level:'hard'});duelStart(s);const options=[...s.market],choice=duelCpuChoice(s,options);assert.equal(duelCpuChoice({...s,futureMarket:[1,2,3]},options),choice);
        localStorage.setItem(DUEL_RECORD_KEY,JSON.stringify({v:1,levels:{hard:{w:-4,l:'x',d:2,best:900}},daily:{'bad':{outcome:'win',margin:1}},recent:[{outcome:'win',level:'god',format:'quick',margin:1}]}));
        const records=duelRecords();assert.deepEqual(records.levels.hard,{w:0,l:0,d:2,best:null});assert.deepEqual(records.daily,{});assert.deepEqual(records.recent,[]);
        const daily=duelDailySetup('2026-11-02');assert.equal(daily.level,'normal');assert.deepEqual(duelDailySetup('2026-11-02'),daily);
    `);
    // Comparative CPU sample: same seeds, same fixed human policy.
    const levels=JSON.parse(run(`(()=>{const out={};for(const level of DUEL_LEVELS){let strength=0,n=0;for(const format of ['quick','standard','full'])for(let seed=1;seed<=6;seed++){const state=duelNew({seed:seed*7919,format,level});duelStart(state);while(state.phase==='draft'){const best=[...state.market].sort((a,b)=>duelValue(state.human,state.humanFormation,b)-duelValue(state.human,state.humanFormation,a)||a-b)[0];duelPick(state,best);}strength+=duelResult(state).cpu.strength;n++;}out[level]=strength/n;}return JSON.stringify(out);})()`));
    assert(levels.hard>levels.normal&&levels.normal>levels.easy,JSON.stringify(levels));
    pass(`Draft Duel is deterministic, never duplicates players, validates saves/codes/records; CPU strength over 18 paired duels Easy ${levels.easy.toFixed(2)} < Normal ${levels.normal.toFixed(2)} < Hard ${levels.hard.toFixed(2)}`);
    // ---------- Blue Lock Man (Auction setup toggle) ----------
    block(`
        const [k1,k2]=[blueLockManFor(1),blueLockManFor(2)];
        assert(!players.includes(k1)&&!players.includes(k2)&&!players.some(isBlueLockMan),'never in the Database/player list');
        assert.equal(playerById(9101),k1);assert.equal(playerById(9102),k2);assert(!challengePool().includes(9101));
        assert.deepEqual(k1.positions,['GK']);assert(canonicalFit(k1,'GK')&&!acceptablePositionFit(k1,'ST'));
        const pool=players.filter(p=>!p.secretCharacter).slice(0,40);
        const setup={n1:'A',n2:'B',budget:10000,bidIncrement:50,maxPlayers:11,team2CpuControlled:true,cpuDifficulty:'hard',selectedPlayers:pool,blueLockMan:true};
        resetDraftState(setup);assert.deepEqual(team1.players,[k1]);assert.deepEqual(team2.players,[k2]);assert.equal(signedCount(team1),0);assert(!isTeamFull(1));
        resetDraftState({...setup,blueLockMan:false});assert.deepEqual(team1.players,[]);
        resetDraftState({...setup,challenge:draftChallengePresets()[0]});assert.deepEqual(team1.players,[],'challenges never add him');
        resetDraftState(setup);
        const gks=players.filter(p=>!p.secretCharacter&&canonicalFit(p,'GK')).slice(0,2),field=players.filter(p=>!p.secretCharacter&&!canonicalFit(p,'GK')).slice(0,11);
        team1.players=[k1,...gks,...field.slice(0,9)];assert.equal(signedCount(team1),11);assert(isTeamFull(1));
        // Auto Best: every formation keeps him in the GK slot, even with real keepers available.
        const winner=solveBestFormationAndAssignment(1);assert.equal(winner.assignment[keeperSlotIndex(winner.formation)],k1.id);
        for(const name of Object.keys(FORMATIONS)){const best=bestLineupForFormation(1,name);const gk=keeperSlotIndex(name);assert.equal(best.assignment[gk],k1.id,name);assert.equal(Object.values(best.assignment).filter(id=>id===k1.id).length,1,name);}
        // Team Builder: he cannot move, be benched or be displaced from goal.
        formationByTeam[1]='4-3-3';formationAssignments[1]={};sanitizeFormationAssignments(1);assert.equal(formationAssignments[1][0],k1.id,'sanitize puts him in goal');
        formationAssignments[1]={0:gks[0].id,5:k1.id};sanitizeFormationAssignments(1);assert.equal(formationAssignments[1][0],k1.id);assert(!Object.entries(formationAssignments[1]).some(([slot,id])=>id===k1.id&&slot!=='0'));
        assert.equal(formationMoveAssignment(1,k1.id,5),null);assert.equal(formationMoveAssignment(1,gks[1].id,0),null);assert.notEqual(formationMoveAssignment(1,field[0].id,9),null);
        formationByTeam[1]='3-5-2';sanitizeFormationAssignments(1);assert.equal(formationAssignments[1][keeperSlotIndex('3-5-2')],k1.id,'formation change keeps him in goal');
        // CPU planning counts him as its goalkeeper.
        const plan=cpuPlanRoster([k2,...field]);assert.equal(plan.assignment[keeperSlotIndex(plan.formation)],k2.id);
        // Saves restore him through playerById; the home resume card does not count him.
        const saved=cleanSavedPlayerReferences({team1:{name:'A',players:[9101,1]},team2:{name:'B',players:[9102,2]},remainingPlayerIds:[3]});
        assert.deepEqual(saved.team1.players,[9101,1]);assert.deepEqual(hydratePlayers(saved.team2.players).map(p=>p.id),[9102,2]);
    `);
    pass('Blue Lock Man stays out of the Database and roster counts, is always the GK under Auto Best/CPU/Team Builder, and saves cleanly');
    // ---------- Language-independent layout and secret roster count ----------
    {
        const directory=read('js/ui/site-directory.js'),header=read('css/site-header.css'),i18n=read('js/localization.js'),setup=read('js/ui/setup.js');
        assert(directory.includes('data-header-dense')&&directory.includes('data-header-tight')&&directory.includes('if(!fits(150))'),'longer translations try denser desktop headers before the phone layout');
        assert(header.includes(':root[data-header-dense]')&&header.includes(':root[data-header-tight]'),'dense header styles');
        assert(i18n.includes("translated=translated.toLocaleUpperCase(language)"),'all-caps English labels stay all-caps in every cased language');
        assert(setup.includes('codeTyped||secretSelected>0'),'secret roster count shows while the code is typed or a secret player is selected');
    }
    pass('Header fit tiers, consistent capitalisation across languages and the secret roster count rule');
    // ---------- Ego Record ----------
    const fresh=v073Context();
    fresh.run(`{
        localStorage.setItem(SOLO_RECORD_KEY,JSON.stringify({'daily:2026-10-30':{attempts:2,score:9600,grade:'S',complete:true,squad:null},'puzzle:missing-piece':{attempts:1,score:8000,grade:'S+',complete:true,squad:null}}));
        const record=egoRecordLoad();assert(record.migrated);assert.equal(record.counts.daily,1);assert.equal(record.dailyBest,9600);assert.equal(record.gradeCounts.S,1);assert.equal(record.counts.challenge,1);
        assert(record.achievements['first-mission']&&record.achievements['world-class-day']&&!record.achievements['singularity']);
        assert.equal(egoRecordLoad().counts.daily,1,'migration runs once');
        let unlocked=egoRecordEvent({mode:'duel',complete:true,outcome:'win',level:'hard',formation:'4-3-3',playerIds:[1,2],chemistry:86,ovr:88});
        assert(unlocked.includes('giant-killer')&&unlocked.includes('manager-duel')&&unlocked.includes('chemical-reaction'));
        assert.deepEqual(egoRecordEvent({mode:'duel',complete:true,outcome:'loss',level:'hard',formation:'4-3-3',playerIds:[1]}),[]);
        egoRecordEvent({mode:'lab',complete:false,created:true});assert(egoRecordLoad().achievements.architect);assert.equal(egoRecordLoad().activity[localDraftDate()].includes('lab'),false,'creating is not a finished activity');
        for(const formation of ['3-4-3','5-3-2'])egoRecordEvent({mode:'challenge',complete:true,formation,playerIds:[3]});assert(egoRecordLoad().achievements['tactical-range']);
        // Secret players never appear among favourites in a locked session.
        egoRecordEvent({mode:'challenge',complete:true,formation:'4-3-3',playerIds:[81,81]});secretCharactersUnlocked=false;assert(egoFavourites(egoRecordLoad()).players.every(([p])=>!p.secretCharacter));
        secretCharactersUnlocked=true;assert(egoFavourites(egoRecordLoad()).players.every(([p])=>!p.secretCharacter),'never, even when unlocked');secretCharactersUnlocked=false;
        localStorage.setItem(EGO_RECORD_KEY,JSON.stringify({v:1,migrated:true,counts:{daily:-5,duel:'x'},formations:{'9-9-9':3,'4-4-2':2},players:{'99999':4,'1':2},achievements:{'giant-killer':'never','regular':'2026-11-01'},activity:{'2026-11-01':['daily','hack']}}));
        const clean=egoRecordLoad();assert.equal(clean.counts.daily,0);assert.deepEqual(clean.formations,{'4-4-2':2});assert.deepEqual(clean.players,{'1':2});assert.deepEqual(clean.achievements,{regular:'2026-11-01'});assert.deepEqual(clean.activity['2026-11-01'],['daily']);
        localStorage.setItem(EGO_RECORD_KEY,'{broken');assert.equal(egoRecordLoad().v,1);
    }`);
    pass('Ego Record migrates existing records once, unlocks only earned achievements, hides locked secrets and sanitizes malformed storage');
    // ---------- Navigation wiring ----------
    const index=read('index.html'),router=read('js/router.js');
    for(const action of ['vs-cpu','draft-duel','ego-board','draft-challenges','challenge-lab','ego-record'])assert(index.includes(`data-directory-action="${action}"`),'Header action '+action);
    for(const view of ['board','challenges','duel','lab','record'])assert(index.includes(`./?play=${view}`)||view==='board'||view==='challenges','Header link '+view);
    assert(router.includes('"board","challenges","duel","lab","record"')&&router.includes('resumePlayView'),'Router preserves and resumes play views');
    assert(index.includes('data-directory-href="battle-sim/initializer/"')&&!index.includes('battle-sim-disabled'),'Battle Sim stays on its Early Access route');
    const directory=read('js/ui/site-directory.js');assert(directory.includes('data-directory-href="./?play=duel"')&&directory.includes('data-directory-href="./?play=board"'),'Mobile directory exposes the new destinations');
    pass('header, mobile directory and router expose Ego Board, Draft Duel, Challenge Lab and Ego Record without touching Battle Sim Early Access');
}
module.exports={runV073Tests,v073Context};
if(require.main===module)runV073Tests();
