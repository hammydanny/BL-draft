#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createModeTestContext}=require('./game-modes-tests');
function simulateBalanceAuctions(run){return run(`(()=>{
    const sales=[],runs=[];team2CpuControlled=true;activeDraftChallenge=null;renderAuctionScreen=()=>{};recordAuctionUndoPoint=()=>{};saveGame=()=>{};playSfx=()=>{};triggerFx=()=>{};esc=String;teamVars=()=>'';
    for(const difficulty of ['easy','normal','hard'])for(const poolKind of ['all','no-masters','under-90'])for(let seed=1;seed<=5;seed++){
        cpuDifficulty=difficulty;cpuPersonalitySeed=seed;maxPlayers=11;startingBudget=10000;bidIncrement=50;auctionHistory=[];auctionNumber=0;startingTeam=seed%2+1;
        team1={name:'A',color:'#123abc',players:[],budget:10000};team2={name:'B',color:'#ff1234',players:[],budget:10000};
        const ids=challengePool().filter(id=>poolKind!=='no-masters'||!modeCategory(playerById(id),'master-strikers')).filter(id=>poolKind!=='under-90'||playerOverall(playerById(id))<90);selectedPlayerIds=new Set(ids);
        for(const id of seededDraftShuffle(ids,seed*113)){
            if(isTeamFull(1)&&isTeamFull(2))break;currentPlayer=playerById(id);auctionNumber++;currentBid=0;currentBidder=null;
            const forced=onlyTeamWithSpace();if(forced){awardPlayerFree(forced,true);sales.push({rating:playerOverall(currentPlayer),price:0,difficulty,poolKind,forced:true});continue;}
            currentBidder=startingTeam;currentBid=cpuChooseBid(teamByNumber(currentBidder),0,true);
            for(let turn=0;turn<1000;turn++){const bidder=otherTeamNumber(currentBidder),amount=cpuChooseBid(teamByNumber(bidder),currentBid);if(amount===null)break;assert.equal(amount,nextLegalAuctionBid(currentBid));currentBid=amount;currentBidder=bidder;}
            sales.push({rating:playerOverall(currentPlayer),price:currentBid,difficulty,poolKind,forced:false});awardPlayer(currentBidder);
            assert(team1.budget>=0&&team2.budget>=0);assert(team1.players.length<=11&&team2.players.length<=11);
        }
        assert.equal(team1.players.length,11);assert.equal(team2.players.length,11);assert.equal(new Set([...team1.players,...team2.players].map(p=>p.id)).size,22);
        runs.push({difficulty,poolKind,seed,coverage:cpuPlanRoster(team2.players).fitCount,budget:team2.budget});
    }
    return {sales,runs};
})()`);}
function runBalanceTests(){
 const {context,run}=createModeTestContext();vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/solo-draft.js'),'utf8'),context,{filename:'solo-draft.js'});
 run(`
    assert(qualityScore(95)-qualityScore(90)>qualityScore(85)-qualityScore(80));assert(ratingStrength(95)-ratingStrength(90)>ratingStrength(85)-ratingStrength(80));
    assert.equal(chemistryPerformanceModifier(65),0);assert.equal(chemistryPerformanceModifier(100),4);assert.equal(chemistryPerformanceModifier(40),-3);assert(playerChemistryPerformance(Array(30).fill(99))<=4);
    const synthetic=(rating,id=999)=>({id,name:'Balance fixture '+id,primaryPosition:'CM',positions:['CM','DM'],stats:{ovr:rating,off:rating,sho:rating,spd:rating,def:rating,pas:rating,dri:rating,gk:40}});
    assert(playerContribution(synthetic(88),'CM',[95,95]).raw>playerContribution(synthetic(91),'CM',[55,55]).raw,'Chemistry can reverse a small quality gap');
    assert(playerContribution(synthetic(95),'CM',[65,65]).raw>playerContribution(synthetic(80),'CM',[100,100]).raw,'Chemistry cannot erase a large quality gap');
    const canonical=JSON.stringify(players),fixture=synthetic(90);assert(playerContribution(fixture,'CM',[98,98]).effective>playerContribution(fixture,'CM',[48,48]).effective);assert(playerContribution(fixture,'GK',[100,100]).effective<65);assert(playerPositionProfile(fixture,'DM').position>=playerPositionProfile(fixture,'ST').position+10);
    assert(effectiveOVR(playerById(8),'GK')>effectiveOVR(playerById(3),'GK'),'A real goalkeeper beats an elite striker in goal');
    assert.equal(JSON.stringify(players),canonical);
    // Two coherent squad comparisons use the production model, not a parallel formula.
    const sample=(rating,chem)=>{const shape=FORMATIONS['4-3-3'],roster=shape.map((slot,i)=>({...synthetic(rating,1000+i),primaryPosition:slot.label,positions:[slot.label]})),assignment=Object.fromEntries(roster.map((p,i)=>[i,p.id])),links=FORMATION_CHEMISTRY_EDGES['4-3-3'].map(([a,b])=>({a:{p:roster[a]},b:{p:roster[b]},value:chem}));return lineupContributionSnapshot(roster,assignment,shape,{links});};
    assert(sample(88,95).effectiveQuality>sample(91,55).effectiveQuality);assert(sample(95,65).effectiveQuality>sample(80,100).effectiveQuality);
    // Position/chemistry effects stay visible independently of immutable base ratings.
    const standardFingerprint=JSON.stringify(FORMATIONS);for(const [name,shape]of Object.entries(DAILY_FORMATIONS)){
        const size=Number(name.split('v')[0]);assert.equal(shape.length,size);assert.equal(shape.filter(s=>s.label==='GK').length,1);assert.equal(new Set(shape.map(s=>s.x+':'+s.y)).size,size);assert(shape.every(s=>s.x>=10&&s.x<=90&&s.y>=12&&s.y<=90));
        for(const [a,b]of formationEdgePairs(name)){assert(a>=0&&a<size&&b>=0&&b<size&&a!==b);}assert.equal(new Set(formationEdgePairs(name).map(e=>e.join(':'))).size,formationEdgePairs(name).length);
    }assert.equal(JSON.stringify(FORMATIONS),standardFingerprint);
    // Auto Best uses all ten full formations, never the future auction queue.
    const rosters=[[8,40,16,26,29,27,28,1,49,50,20,7,15,3],[8,40,16,24,4,27,28,20,7,23,15,31,39,50],[8,3,34,35,36,37,38,52,53,55,49,50,40,56]];
    for(const ids of rosters){team1.players=ids.map(playerById);formationByTeam[1]='4-3-3';formationAssignments[1]={};const before=JSON.stringify(team1),all=[],original=bestLineupForFormation;bestLineupForFormation=function(n,name,search){all.push(name);return original(n,name,search);};const winner=solveBestFormationAndAssignment(1);bestLineupForFormation=original;assert.deepEqual(all,Object.keys(FORMATIONS));assert.equal(new Set(Object.values(winner.assignment)).size,11);assert(Object.values(winner.assignment).includes(8));assert(formationLineupMetrics(1,winner.formation,winner.assignment).canonicalFits>=cpuPlanRoster(team1.players).fitCount,"Auto Best should not give up available natural roles");assert.equal(JSON.stringify(team1),before);}
    const oldQueue=remainingPlayers;remainingPlayers=new Proxy([],{get(){throw Error('Hidden order was read');}});team2.players=[];team2.budget=10000;maxPlayers=11;cpuDifficulty='hard';selectedPlayerIds=new Set(challengePool());
    currentPlayer=playerById(3);const starCap=cpuMaximumBid(team2,evaluateCpuTarget());currentPlayer=playerById(79);const depthCap=cpuMaximumBid(team2,evaluateCpuTarget());assert(starCap>depthCap);remainingPlayers=oldQueue;
 `);
 const legacy=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/legacy-solo-v0721.json'),'utf8'));
 run(`for(const old of ${JSON.stringify(legacy)}){const migrated=normalizeSoloState(old);assert.equal(migrated.v,2);assert.deepEqual(migrated.ids,old.ids);assert.equal(migrated.tokens,old.tokens);if(Object.values(migrated.assignment).includes(old.captain))assert.equal(migrated.captain,old.captain);assert.equal(dailyRuleForState(migrated).size,old.ids.length===14?14:7);assert.deepEqual(normalizeSoloState(JSON.parse(JSON.stringify(migrated))).ids,old.ids);if(migrated.phase==='picking')dailyPickAction(migrated,{type:'pick',id:dailyPickOptions(migrated)[0]});assert.throws(()=>normalizeSoloState({...old,ids:[80],actions:[{type:'pick',id:80}],seen:[80]}));}
    const seenSizes=new Map();for(let d=0;d<120;d++){const date=localDraftDate(new Date(2026,9,1+d)),size=dailyPickRule(date).size;if(!seenSizes.has(size))seenSizes.set(size,date);}
    assert.equal(seenSizes.size,6);let runs=0,usable=0;for(const [size,date]of seenSizes)for(const name of dailyFormationNames(size)){
        const state=dailyPickNew(date);state.formation=name;dailyStartPicks(state);assert.equal(state.chosenFormation,name);
        while(state.phase==='picking'){
            let id=null,value=-Infinity;for(const option of dailyPickOptions(state)){const next={...state,ids:[...state.ids,option]},plan=dailyPickPlan(next),snap=soloSnapshot({...next,...plan}),score=soloFitCount(snap)*1000+snap.ovr+snap.chemistry.overall*.5;if(score>value){value=score;id=option;}}
            dailyPickAction(state,{type:'pick',id});assert.equal(state.formation,name);
        }
        const result=dailyPickScore(state);runs++;if(soloFitCount(result.snap)>=Math.ceil(Math.min(11,size)*.7)&&canonicalFit(playerById(state.assignment[0]),'GK'))usable++;
        assert.equal(result.snap.shape.length,Math.min(11,size));assert.equal(Object.keys(state.assignment).length,Math.min(11,size));assert.equal(result.snap.reserves.length,Math.max(0,size-11));
        const code=exportSquadCode(soloSquad(state)),loaded=importSquadCode(code);assert.equal(loaded.formation,name);assert.deepEqual(loaded.assignment,state.assignment);assert.throws(()=>normalizeReplaySquad({...loaded,formation:'__proto__'}));
        if(size<11)assert.throws(()=>normalizeReplaySquad({...loaded,assignment:{...loaded.assignment,10:state.ids[0]}}));
        const restored=normalizeSoloState(JSON.parse(JSON.stringify(state)));assert.deepEqual(restored.ids,state.ids);assert.deepEqual(restored.assignment,state.assignment);
    }assert(usable>=runs*.8,'At least 80% of sensible-pick runs must remain functional');console.log('Daily balance:',usable+'/'+runs,'functional formation paths across all six sizes');
 `);
 const miniWitnesses=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/daily-mini-completions.json'),'utf8'));
 run(`for(const witness of ${JSON.stringify(miniWitnesses)}){const state=dailyPickNew(witness.date);state.formation=witness.name;dailyStartPicks(state);for(const action of witness.actions)dailyPickAction(state,action);const snap=soloSnapshot(state);assert.equal(soloFitCount(snap),snap.shape.length,'Every mini-formation has a complete natural-fit drafting path: '+witness.name);assert.equal(state.phase,'review');}`);
 run(`const miniExample=${JSON.stringify(miniWitnesses[0])};const miniState=dailyPickNew(miniExample.date);miniState.formation=miniExample.name;dailyStartPicks(miniState);for(const action of miniExample.actions)dailyPickAction(miniState,action);const miniWinner=soloWithTeam(miniState,()=>solveBestFormationAndAssignment(0));assert(DAILY_FORMATIONS[miniWinner.formation]);assert.equal(Object.values(miniWinner.assignment).length,7);`);
 const result=simulateBalanceAuctions(run),paid=result.sales.filter(s=>!s.forced&&s.price>0),average=rows=>rows.reduce((sum,r)=>sum+r.price,0)/Math.max(1,rows.length),elite=average(paid.filter(s=>s.rating>=94)),mid=average(paid.filter(s=>s.rating>=80&&s.rating<90));
 require('node:assert/strict')(elite>mid*1.2,'Elite signings should carry a clear paid-price premium');
 console.log('Auction balance:',result.runs.length,'complete auctions; elite paid mean',elite.toFixed(0),'vs mid-tier',mid.toFixed(0));
 console.log('PASS v0.7.2.2: nonlinear quality, bounded contextual chemistry, fit penalties, every-formation Auto Best, legacy saves, mini-layout/code integrity, Daily paths and CPU price distributions');
 return result;
}
module.exports={runBalanceTests,simulateBalanceAuctions};if(require.main===module)runBalanceTests();
