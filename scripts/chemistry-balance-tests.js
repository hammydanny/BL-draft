#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {createModeTestContext}=require('./game-modes-tests');

function runChemistryBalanceTests({seeds=18}={}){
 const {context,run}=createModeTestContext();
 const fs=require('node:fs'),path=require('node:path');
 require('node:vm').runInContext(fs.readFileSync(path.join(__dirname,'../js/solo-draft.js'),'utf8'),context);
 const legacy=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/legacy-solo-v0722.json'),'utf8'));
 run(`for(const old of ${JSON.stringify(legacy)}){
    const clean=normalizeSoloState(old);assert.deepEqual(clean.ids,old.ids);assert.deepEqual(clean.assignment,old.assignment);assert.equal(clean.tokens,old.tokens);assert.equal(clean.captain,old.captain);
    const loaded=normalizeSoloState(JSON.parse(JSON.stringify(clean)));assert.deepEqual(loaded.assignment,clean.assignment);assert.deepEqual(loaded.ids,old.ids);
    if(clean.phase==='picking'){assert.deepEqual(dailyPickOptions(clean),dailyPickOptions(loaded));dailyPickAction(clean,{type:'pick',id:dailyPickOptions(clean)[0]});assert.deepEqual(normalizeSoloState(JSON.parse(JSON.stringify(clean))).ids,clean.ids);}
    assert.throws(()=>normalizeSoloState({...old,ids:[80]}));assert.throws(()=>normalizeSoloState({...old,assignment:{...old.assignment,'00':old.assignment[0]}}));
 }`);
 run(`
    esc=String;teamVars=()=>'';
    const byName=name=>players.find(p=>p.name===name),pair=(a,b)=>chemistryRelation(byName(a),byName(b));
    const unknown=pair('Noel Noa','Hibiki Okawa');
    assert.equal(unknown.score,CHEMISTRY_NEUTRAL_SCORE);assert.equal(chemistryTier(unknown.score),'neutral');
    assert.equal(chemistryLineStyle(unknown.score).color,'#94a3b8');assert.equal(playerChemistryPerformance([unknown.score,unknown.score]),0);
    const negative=pair('Rin Itoshi','Ryusei Shido');assert.equal(chemistryTier(negative.score),'negative');
    assert.equal(chemistryLineStyle(negative.score).color,'#ff496d');assert(playerChemistryPerformance([negative.score])<=-2);
    assert.equal(chemistryTier(pair('Yoichi Isagi','Yo Hiori').score),'chemical');
    assert(playerChemistryPerformance([pair('Yoichi Isagi','Hyoma Chigiri').score])>0);
    for(const [a,b]of [['Junichi Wanima','Hyoma Chigiri'],['Keisuke Wanima','Hyoma Chigiri'],['Rin Itoshi','Sae Itoshi'],['Rensuke Kunigami','Ryusei Shido'],['Sae Itoshi','Bunny Iglesias'],['Yoichi Isagi','Vivien Hugo']])assert.equal(chemistryTier(pair(a,b).score),'neutral',a+'/'+b);
    for(const a of ['Sae Itoshi','Ryusei Shido'])assert.equal(chemistryTier(pair(a,'Shuto Sendo').score),'link');
    assert.equal(chemistryNetworkScore(Array(20).fill(65),[],20),65);
    assert(chemistryNetworkScore(Array(20).fill(65),[],20)>chemistryNetworkScore(Array(20).fill(58),[],20)+10);
    assert(chemistryNetworkScore(Array(20).fill(65),[],20)<80,'Neutral networks cannot complete chemistry-80 objectives');
    assert.equal(playerChemistryPerformance(Array(30).fill(65)),0);assert(playerChemistryPerformance(Array(30).fill(99))<=4);
    const fixture=(id,rating,position)=>({id,name:'Fixture '+id,primaryPosition:position,positions:[position],stats:{ovr:rating,off:rating,sho:rating,spd:rating,def:rating,pas:rating,dri:rating,gk:40}});
    const adapted=fixture(9001,94,'CM'),natural=fixture(9002,74,'DM'),striker=fixture(9003,99,'ST');
    assert.equal(playerPositionProfile(adapted,'DM').fit,'adapted');assert(effectiveOVR(adapted,'DM')>effectiveOVR(natural,'DM'));
    assert.equal(cpuAssignment([adapted,natural,striker],[{label:'DM'}],[0])[0],adapted.id);
    assert.deepEqual(cpuAssignment([striker],[{label:'CB'},{label:'GK'}],[0,1]),{});
    // Evaluation caches cannot change decisions across bids, pool edits or difficulties.
    team1={players:[],budget:10000};team2={players:[playerById(8)],budget:10000};maxPlayers=11;selectedPlayerIds=new Set(challengePool());currentPlayer=playerById(40);
    for(const level of ['easy','normal','hard']){cpuDifficulty=level;assert.deepEqual(evaluateCpuTarget(team2),computeCpuTarget(team2));assert.equal(evaluateCpuTarget(team2),evaluateCpuTarget(team2));}
    const cached=evaluateCpuTarget(team2);team1.players.push(playerById(16));assert.notEqual(evaluateCpuTarget(team2),cached);assert.deepEqual(evaluateCpuTarget(team2),computeCpuTarget(team2));
    selectedPlayerIds.delete(24);assert.deepEqual(evaluateCpuTarget(team2),computeCpuTarget(team2));team2.players.push(playerById(27));assert.deepEqual(evaluateCpuTarget(team2),computeCpuTarget(team2));
    // Auto Best sees the same neutral/negative distinction, including reserve alternatives.
    const savedRelation=chemistryRelation;
    const solveFixture=(aRating,bRating,aChem,bChem)=>{
        const shape=FORMATIONS['4-3-3'],core=shape.slice(0,10).map((slot,i)=>fixture(9100+i,88,slot.label));
        const a=fixture(9200,aRating,'RW'),b=fixture(9201,bRating,'RW');team1.players=[...core,a,b];formationByTeam[1]='4-3-3';
        chemistryRelation=(x,y)=>({score:[x.id,y.id].includes(a.id)?aChem:[x.id,y.id].includes(b.id)?bChem:65,label:'Fixture',reason:'Fixture',contexts:[]});
        const assignment=bestLineupForFormation(1,'4-3-3').assignment;return Object.values(assignment);
    };
    assert(solveFixture(88,89,95,40).includes(9200));assert(solveFixture(95,80,65,95).includes(9200));chemistryRelation=savedRelation;
    // A slightly weaker coherent team can win effective strength while losing base quality.
    const shape=FORMATIONS['4-3-3'],makeSquad=(offset,rating,chem)=>{
        const roster=shape.map((slot,i)=>fixture(offset+i,rating,slot.label)),assignment=Object.fromEntries(roster.map((p,i)=>[i,p.id]));
        const links=FORMATION_CHEMISTRY_EDGES['4-3-3'].map(([a,b])=>({a:{p:roster[a]},b:{p:roster[b]},value:chem}));
        return {...lineupContributionSnapshot(roster,assignment,shape,{links}),formation:'4-3-3',chemistry:{links,overall:chem},projected:false};
    };
    const high=makeSquad(9300,91,58),coherent=makeSquad(9400,89,95),originalResult=resultSquadContribution;
    team1={name:'RAW',players:high.members.map(m=>m.player),budget:0};team2={name:'COHERENT',players:coherent.members.map(m=>m.player),budget:0};
    assert(high.baseQuality>coherent.baseQuality);assert(high.effectiveQuality<coherent.effectiveQuality);
    resultSquadContribution=(_,n)=>n===1?high:coherent;
    const comparison=createResultsComparison();assert(comparison.includes('EFFECTIVE OVR'));assert(comparison.includes('BASE QUALITY'));
    assert(comparison.split('<span>EFFECTIVE OVR</span>')[1].split('</div>')[0].includes('COHERENT ADVANTAGE'));
    // The star has a near-equal reserve; the lower-rated keeper has no replacement.
    team1={name:'AWARDS',players:[...coherent.members.map(m=>m.player),fixture(9500,95,'ST'),fixture(9501,94,'ST')],budget:4000};
    formationByTeam[1]='4-3-3';formationAssignments[1]=Object.fromEntries(coherent.members.map(m=>[m.slot,m.player.id]));formationAssignments[1][9]=9500;
    auctionHistory=team1.players.map(p=>({teamNumber:1,player:p,price:p.id===9500?2500:p.id===9501?2000:100}));
    resultSquadContribution=originalResult;
    const source=JSON.stringify({team1,formationAssignments,formationByTeam,auctionHistory}),contributions=resultSigningContributions(1),mvp=getMvpSigning(1,contributions),value=getBestValueSigning(1,contributions);
    assert.notEqual(mvp.player.id,9500,'Raw highest OVR need not be MVP when replaceable');assert.notEqual(value.player.id,9501,'A redundant expensive reserve cannot beat a useful starter');
    assert.equal(JSON.stringify({team1,formationAssignments,formationByTeam,auctionHistory}),source,'Results awards never mutate squads or saves');
 `);
 const report=run(`(()=>{
    const runs=[],sales=[];team2CpuControlled=true;activeDraftChallenge=null;renderAuctionScreen=()=>{};recordAuctionUndoPoint=()=>{};saveGame=()=>{};playSfx=()=>{};triggerFx=()=>{};
    for(const difficulty of ['easy','normal','hard'])for(const poolKind of ['all','no-masters','under-90'])for(let seed=1;seed<=${seeds};seed++){
        cpuPersonalitySeed=seed;maxPlayers=seed%3===0?15:11;startingBudget=seed%2?10000:7000;bidIncrement=50;auctionHistory=[];auctionNumber=0;startingTeam=seed%2+1;
        team1={name:'Normal opponent',color:'#123abc',players:[],budget:startingBudget};team2={name:difficulty,color:'#ff1234',players:[],budget:startingBudget};
        formationAssignments[1]={};formationAssignments[2]={};
        const ids=challengePool().filter(id=>poolKind!=='no-masters'||!modeCategory(playerById(id),'master-strikers')).filter(id=>poolKind!=='under-90'||playerOverall(playerById(id))<90);selectedPlayerIds=new Set(ids);
        const choose=(n,current,opening)=>{cpuDifficulty=n===2?difficulty:'normal';return cpuChooseBid(teamByNumber(n),current,opening);};
        let redundant=0,purchases=0;
        for(const id of seededDraftShuffle(ids,seed*113)){
            if(isTeamFull(1)&&isTeamFull(2))break;currentPlayer=playerById(id);auctionNumber++;currentBid=0;currentBidder=null;
            const forced=onlyTeamWithSpace();
            if(forced){awardPlayerFree(forced,true);sales.push({rating:playerOverall(currentPlayer),price:0,difficulty,poolKind,forced:true});continue;}
            currentBidder=startingTeam;currentBid=choose(currentBidder,0,true);
            for(let turn=0;turn<1000;turn++){const bidder=otherTeamNumber(currentBidder),amount=choose(bidder,currentBid,false);if(amount===null)break;assert.equal(amount,nextLegalAuctionBid(currentBid));currentBid=amount;currentBidder=bidder;}
            if(currentBidder===2){cpuDifficulty=difficulty;const evaluation=evaluateCpuTarget(team2);if(!evaluation.fitGain&&evaluation.upgrade<2)redundant++;purchases++;}
            sales.push({rating:playerOverall(currentPlayer),price:currentBid,difficulty,poolKind,forced:false});awardPlayer(currentBidder);
            assert(team1.budget>=0&&team2.budget>=0);assert(team1.players.length<=maxPlayers&&team2.players.length<=maxPlayers);
        }
        assert.equal(team2.players.length,maxPlayers);assert.equal(team1.players.length,maxPlayers);
        assert.equal(new Set([...team1.players,...team2.players].map(p=>p.id)).size,maxPlayers*2);
        const plan=solveBestFormationAndAssignment(2),network=formationChemistryForAssignment(2,plan.assignment,plan.formation),c=lineupContributionSnapshot(team2.players,plan.assignment,formationShape(plan.formation),network),spent=startingBudget-team2.budget;
        runs.push({difficulty,poolKind,seed,size:maxPlayers,effective:c.effectiveRaw,base:c.baseRaw,chemistry:network.overall,coverage:c.members.filter(m=>acceptablePositionFit(m.player,m.label)).length,natural:c.members.filter(m=>canonicalFit(m.player,m.label)).length,remaining:team2.budget,completion:team2.players.length/maxPlayers,cost:spent/team2.players.length,efficiency:c.effectiveRaw/Math.max(1,spent)*1000,redundant,purchases,formation:plan.formation});
    }return {runs,sales};
 })()`);
 const mean=(rows,key)=>rows.reduce((sum,r)=>sum+r[key],0)/Math.max(1,rows.length);
 const summary=['easy','normal','hard'].map(difficulty=>{
   const rows=report.runs.filter(r=>r.difficulty===difficulty);
   return {difficulty,auctions:rows.length,...Object.fromEntries(['effective','base','chemistry','coverage','natural','remaining','completion','cost','efficiency','redundant'].map(key=>[key,Number(mean(rows,key).toFixed(3))]))};
 });
 const prices=[['94+',94,101],['88–93',88,94],['80–87',80,88],['<80',0,80]].map(([tier,min,max])=>{
   const rows=report.sales.filter(s=>!s.forced&&s.price>0&&s.rating>=min&&s.rating<max);
   return {tier,sales:rows.length,mean:Number(mean(rows,'price').toFixed(2))};
 });
 console.table(summary);console.table(prices);
 assert(summary[2].effective>summary[1].effective,'Hard must beat Normal in paired aggregate Effective OVR');
 assert(summary[1].effective>summary[0].effective,'Normal must beat Easy in paired aggregate Effective OVR');
 assert(prices[0].mean>prices[2].mean*1.2,'Elite paid-price separation should remain meaningful');
 console.log('PASS v0.7.2.3 chemistry tiers, network, adapted roles, Auto Best, Results/awards and paired difficulty auctions');
 return {...report,summary,prices};
}
module.exports={runChemistryBalanceTests};
if(require.main===module){const result=runChemistryBalanceTests();if(process.argv[2])require('node:fs').writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');}
