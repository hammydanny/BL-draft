#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createModeTestContext}=require('./game-modes-tests');
function runSoloDraftTests(){
 const {context,run}=createModeTestContext();vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/solo-draft.js'),'utf8'),context,{filename:'solo-draft.js'});
 run(`
    const before={team:standaloneBuilderTeam,formation:formationByTeam[0],assignment:formationAssignments[0],captain:formationCaptainByTeam[0],size:maxPlayers,budget:startingBudget};
    localStorage.setItem(SAVE_KEY,'auction sentinel');localStorage.setItem(STANDALONE_SAVE_KEY,'builder sentinel');
    const themes=new Set(),sizes=new Set();for(let day=0;day<180;day++){const early=new Date(2026,0,1+day,0,1),late=new Date(2026,0,1+day,23,59),a=dailyPickRule(early),b=dailyPickRule(late);assert.deepEqual(a,b);themes.add(a.id);sizes.add(a.size);assert.equal(new Set(a.pool).size,a.pool.length);assert(a.pool.every(id=>playerById(id)&&!playerById(id).secretCharacter));if(a.id==='underdog')assert(a.pool.every(id=>playerOverall(playerById(id))<=89));if(a.id==='crisis')assert(!a.pool.includes(26));}
    assert.equal(themes.size,10);assert.deepEqual([...sizes].sort((a,b)=>a-b),[7,8,9,10,11,14]);assert.throws(()=>dailyPickRule('2026-02-30'));
    const completed=[];for(let day=0;day<30;day++){
        const date=localDraftDate(new Date(2026,9,1+day)),a=dailyPickNew(date),b=dailyPickNew(date);assert.deepEqual(dailyPickOptions(a),dailyPickOptions(b));dailyStartPicks(a);dailyStartPicks(b);soloBeginAttempt(a);soloState=a;assert(soloSave());assert.deepEqual(soloLoad().ids,a.ids);assert.equal(soloRecords()[soloRecordKey(a)].attempts,1);
        for(let r=0;r<2;r++){const previous=dailyPickOptions(a);dailyPickAction(a,{type:'reroll'});assert(dailyPickOptions(a).every(id=>!previous.includes(id)));}
        assert.equal(a.tokens,0);assert.throws(()=>dailyPickAction(a,{type:'reroll'}));assert.throws(()=>dailyPickAction(a,{type:'pick',id:80}));
        while(a.phase==='picking'){
            const choices=dailyPickOptions(a);assert.equal(choices.length,3);assert.equal(new Set(choices).size,3);assert(choices.every(id=>!a.ids.includes(id)&&!a.seen.includes(id)));assert.deepEqual(choices,dailyPickOptions(a));
            const pick=choices[day%3];dailyPickAction(a,{type:'pick',id:pick});assert.throws(()=>dailyPickAction(a,{type:'pick',id:pick}));
            if(a.phase==='picking'&&a.ids.length===3){const reload=normalizeSoloState(JSON.parse(JSON.stringify(a)));assert.deepEqual(dailyPickOptions(reload),dailyPickOptions(a));assert.deepEqual(reload.ids,a.ids);}
        }
        assert.equal(a.ids.length,dailyPickRule(date).size);assert.equal(new Set(a.ids).size,a.ids.length);assert.equal(a.phase,'review');const forms=dailyFormations(a);assert.equal(forms.length,3);assert(forms.every(f=>knownFormation(f.formation)));assert(forms.some(f=>f.formation===a.formation));assert(Object.values(a.assignment).includes(a.captain));
        const frozen=JSON.stringify(a),restored=normalizeSoloState(JSON.parse(frozen));assert.deepEqual(restored.assignment,a.assignment);const score=dailyPickScore(a);assert.equal(score.components.length,4);assert.equal(score.score,score.components.reduce((sum,c)=>sum+c.value,0));assert(score.score>=0&&score.score<=11000);assert.equal(score.snap.reserves.length,Math.max(0,a.ids.length-11));assert(Number.isFinite(score.snap.chemistry.overall));
        a.phase='result';soloRecordResult(a);soloState=a;soloSave();assert.equal(soloLoad().phase,'result');const best=soloRecords()[soloRecordKey(a)];assert.equal(best.score,score.score);assert.deepEqual(best.squad.assignment,a.assignment);soloBeginAttempt(dailyPickNew(date));assert.equal(soloRecords()[soloRecordKey(a)].attempts,2);completed.push(a);
        assert.throws(()=>normalizeSoloState({...a,formation:'8-8-8'}));assert.throws(()=>normalizeSoloState({...a,actions:[{type:'pick',id:80}]}));assert.throws(()=>normalizeSoloState({...a,v:99}));
    }
    assert.equal(standaloneBuilderTeam,before.team);assert.equal(formationByTeam[0],before.formation);assert.equal(formationAssignments[0],before.assignment);assert.equal(formationCaptainByTeam[0],before.captain);assert.equal(maxPlayers,before.size);assert.equal(startingBudget,before.budget);assert.equal(localStorage.getItem(SAVE_KEY),'auction sentinel');assert.equal(localStorage.getItem(STANDALONE_SAVE_KEY),'builder sentinel');
    assert.throws(()=>soloWithTeam(completed[0],()=>{throw Error('test');}));assert.equal(standaloneBuilderTeam,before.team);assert.equal(maxPlayers,before.size);
 `);
 const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/puzzle-completions.json'),'utf8'));
 run(`
    const witnesses=${JSON.stringify(fixtures)};assert.equal(witnesses.length,10);assert.equal(puzzleMissions().length,10);
    for(const fixture of witnesses){const mission=puzzleMission(fixture.id),state=puzzleNew(mission.id);assert.equal(puzzleScore(state).complete,false);assert.equal(puzzleScore(state).grade,'D');
        assert.throws(()=>puzzlePlace(state,mission.locked[0],null));assert.throws(()=>puzzlePlace(state,0,80));assert.throws(()=>normalizeSoloState({...state,formation:'8-8-8'}));assert.throws(()=>normalizeSoloState({...state,assignment:{...state.assignment,99:1}}));assert.throws(()=>normalizeSoloState({...state,captain:999}));
        // Apply the witness through actual placement validation, preserving all locked players.
        let working=state;for(const [slot,id]of Object.entries(working.assignment))if(!mission.locked.includes(+slot)&&fixture.assignment[slot]!==id){const next={...working,assignment:{...working.assignment}};delete next.assignment[slot];next.ids=Object.values(next.assignment);working=next;}
        for(const [slot,id]of Object.entries(fixture.assignment))if(working.assignment[slot]!==id)working=puzzlePlace(working,+slot,id);
        puzzleValidate(working);const result=puzzleScore(working);assert(result.complete,mission.id);assert.equal(soloFitCount(result.snap),11);assert.equal(result.snap.deployedCount,11);assert.equal(new Set(working.ids).size,11);assert(puzzleSpend(working)<=mission.budget);assert(mission.locked.every(slot=>working.assignment[slot]===mission.initial[slot]));assert(Object.values(working.assignment).includes(working.captain));assert(Number.isFinite(result.snap.chemistry.overall));
        soloBeginAttempt(working);working.phase='result';soloRecordResult(working);const record=soloRecords()[soloRecordKey(working)];assert(record.complete);assert.equal(record.grade,result.grade);assert.deepEqual(normalizeSoloState(JSON.parse(JSON.stringify(working))).assignment,working.assignment);
        soloRecordResult(state);assert(soloRecords()[soloRecordKey(working)].complete,'A failed replay cannot erase a completed mission');assert.equal(soloRecords()[soloRecordKey(working)].grade,result.grade);
        assert(result.bonus.every(g=>g.pass),'Every bonus is achievable: '+mission.id);
    }
    const missing=puzzleNew('missing-piece');assert.throws(()=>puzzlePlace(missing,2,undefined));assert.throws(()=>puzzlePlace(missing,2,3));assert.throws(()=>normalizeSoloState({...missing,assignment:{...missing.assignment,2:80}}));
    const repairs=puzzleNew('fix-team');const erased={...repairs,assignment:{...repairs.assignment}};for(const slot of [1,2,3])delete erased.assignment[slot];erased.ids=Object.values(erased.assignment);assert.throws(()=>puzzleValidate(erased),/Replacement limit/);
    const tooCostly=puzzleNew('budget-rescue');tooCostly.assignment={0:8,1:40,2:56,3:24,4:4,5:27,6:28,7:20,8:7,9:23,10:15};tooCostly.ids=Object.values(tooCostly.assignment);assert.throws(()=>puzzleValidate(tooCostly),/budget/);
    const stored=localStorage.setItem;localStorage.setItem=()=>{throw Error('quota');};assert.equal(soloSave(),false);assert.equal(soloWriteRecords({}),false);localStorage.setItem=stored;localStorage.setItem(SOLO_SAVE_KEY,'{bad');assert.equal(soloLoad(),null);localStorage.setItem(SOLO_RECORD_KEY,'{bad');assert.deepEqual(soloRecords(),{});
 `);
 run(`
    // The report must draw each player once: XI on the pitch, reserves only below it.
    const completedPuzzle={...puzzleNew('king-system'),assignment:witnesses[0].assignment};completedPuzzle.ids=Object.values(completedPuzzle.assignment);
    for(const reserveCount of [0,3])for(const reportTeam of [0,1,2]){
        const additions=challengePool().filter(id=>!completedPuzzle.ids.includes(id)).slice(0,reserveCount),state={...completedPuzzle,ids:[...completedPuzzle.ids,...additions]},snap=soloSnapshot(state),labels=[],images=[];
        const ctx=new Proxy({measureText:value=>({width:String(value).length}),fillText:(label,x,y)=>labels.push({label,x,y}),drawImage:(...args)=>images.push(args)},{get:(target,key)=>target[key]||(()=>{})});
        const portraits=new Map(state.ids.map(id=>[id,{id,naturalWidth:400,naturalHeight:600}]));
        drawAuctionShareImageTeam(ctx,snap.team,reportTeam,snap,{x:0,y:0,width:1004,height:900,portraits});
        assert.equal(images.length,state.ids.length);assert.deepEqual(images.map(args=>args[0].id).sort((a,b)=>a-b),[...state.ids].sort((a,b)=>a-b));
        for(const id of state.ids)assert.equal(labels.filter(item=>item.y>=181&&item.label===playerById(id).name).length,1,'Player duplicated in report: '+id);
        assert.equal(labels.some(item=>item.label==='RESERVES'&&item.y===575),reserveCount>0);
        assert.equal(labels.some(item=>item.label==='PLAYER'),reserveCount>0);
        assert(!labels.some(item=>item.label==='SQUAD ROSTER'||item.label==='STARTER'));
        for(const args of images){assert.equal(args.length,9);assert.equal(args[2],0);assert(Math.abs(args[3]/args[4]-args[7]/args[8])<.00001,'Portrait must preserve its aspect ratio');}
    }
 `);
 console.log('PASS v0.7.2.1: 30 complete Daily sessions, 180 stable dates, 10 themes/6 sizes, rerolls/refresh/records, 10 solvable locked-core puzzles, budgets/roles/grades, save isolation and reserve-only image reports');
}
module.exports={runSoloDraftTests};if(require.main===module)runSoloDraftTests();
