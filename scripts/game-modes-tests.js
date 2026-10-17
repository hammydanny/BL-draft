#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
function createModeTestContext(){
    const root=path.resolve(__dirname,'..'),store=new Map(),element={value:'#123abc',classList:{add(){},remove(){}},addEventListener(){},style:{setProperty(){}}};
    const context=vm.createContext({assert,URL,TextEncoder,TextDecoder,Date,btoa,atob,console,setTimeout:()=>1,clearTimeout(){},requestAnimationFrame(){},window:{addEventListener(){},SiteI18n:{text:value=>value}},document:{baseURI:'https://example.test/BL-draft/',getElementById:()=>element,querySelector(){return null;},querySelectorAll(){return [];},addEventListener(){}},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}}});
    for(const file of ['version','players','state','chemistry','player-reference','formations','replayability','storage','results','auction'])vm.runInContext(fs.readFileSync(path.join(root,'js',file+'.js'),'utf8'),context,{filename:file});
    return {context,run:code=>vm.runInContext(code,context)};
}
function runGameModeTests(){
    const {run}=createModeTestContext();
    run(`
        const rules=draftChallengePresets();assert.equal(rules.length,10);assert.equal(new Set(rules.map(r=>r.id)).size,10);
        for(const rule of rules){assert.deepEqual(importChallengeCode(exportChallengeCode(rule)),rule);assert.equal(Object.values(rule.weights).reduce((a,b)=>a+b),100);}
        const rule=rules[0];for(const patch of [{market:4},{scouts:4},{theme:'cheat'},{objectives:[{type:'unknown',target:1}]},{objectives:[{type:'player',id:99999,target:1}]},{objectives:[{type:'formation',target:'8-8-8'}]},{objectives:[{type:'player',id:1,target:1},{type:'exclude',id:1,target:0}]},{objectives:[{type:'position',key:'GK',target:7},{type:'position',key:'DEF',target:7}]},{objectives:[{type:'size',target:5}]},{objectives:[{type:'spend',target:100}]},{limits:[{category:'blue-lock-project',max:0}],objectives:[{type:'categoryMin',key:'blue-lock-project',target:8}]}])assert.throws(()=>normalizeDraftChallenge({...rule,...patch}));
        assert.throws(()=>importChallengeCode(replayCode('BLDC1',rule)));
        const forged=normalizeDraftChallenge({...rule,weights:{quality:1000000}});assert.deepEqual(forged.weights,MODE_WEIGHTS.balanced);
        const archetypes=new Set();for(let day=0;day<180;day++){const date=new Date(2026,0,1+day,0,1),r=dailyEgoDraft(date),late=dailyEgoDraft(new Date(2026,0,1+day,23,59));assert.deepEqual(r,late);archetypes.add(r.archetype);assert(r.playerIds.length>=r.size*2);assert(r.playerIds.every(id=>!playerById(id).secretCharacter));assert.equal(r.date,localDraftDate(date));}
        assert.equal(archetypes.size,16);assert.notEqual(exportChallengeCode(dailyEgoDraft(new Date(2026,9,17))),exportChallengeCode(dailyEgoDraft(new Date(2026,9,18))));
        const contract=rules[1],stars=contract.playerIds.map(playerById).filter(p=>modeCategory(p,'world-five')),club={players:[stars[0]],budget:7000};assert(!modeCanSign(club,stars[1],contract));assert(modeCanSign({players:[]},stars[1],contract));
        const elite=normalizeDraftChallenge({...rule,limits:[{elite:true,threshold:94,max:1}],objectives:[]}),superstars=elite.playerIds.map(playerById).filter(p=>playerOverall(p)>=94);assert(!modeCanSign({players:[superstars[0]]},superstars[1],elite));
        const daily=dailyEgoDraft(new Date(2026,9,17));cpuPersonalitySeed=1;const market=modeMarketOrder(daily).map(p=>p.id);cpuPersonalitySeed=999;assert.deepEqual(modeMarketOrder(daily).map(p=>p.id),market);assert.equal(new Set(market).size,daily.playerIds.length);
        const legacy=normalizeDraftChallenge({v:1,id:'old',title:'BALANCED XI',budget:9000,increment:50,size:11,playerIds:challengePool(),positionRequirements:{}});assert.deepEqual(importChallengeCode(exportChallengeCode(legacy)),legacy);
        maxPlayers=11;startingBudget=9000;team1={name:'A',color:'#123abc',players:[],budget:9000};team2={name:'CPU',color:'#ff1234',players:[],budget:9000};
    `);
    // Constructive witnesses use real players, exact slots and the production evaluator.
    const witnesses=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/mode-completions.json'),'utf8'));
    run(`globalThis.witnesses=${JSON.stringify(witnesses)};
        for(const witness of witnesses){const r=witness.date?dailyEgoDraft(new Date(witness.date+'T12:00:00')):draftChallengePresets().find(r=>r.id===witness.id);maxPlayers=r.size;startingBudget=r.budget;team1.players=witness.roster.map(playerById);team1.budget=r.budget-witness.spend;formationByTeam[1]=witness.formation;formationAssignments[1]={...witness.assignment};formationCaptainByTeam[1]=witness.captain;
            assert(team1.players.every(p=>r.playerIds.includes(p.id)));assert.equal(new Set(Object.values(witness.assignment)).size,Math.min(11,r.size));assert(Object.values(witness.assignment).every(id=>witness.roster.includes(id)));
            for(const p of team1.players)assert(modeCanSign({players:team1.players.filter(other=>other!==p)},p,r));
            const result=modeScore(r);assert(result.complete,r.id+': '+JSON.stringify(result.goals.filter(g=>!g.pass&&!g.bonus)));assert.equal(result.score,result.components.reduce((sum,c)=>sum+c.value,0));assert(result.score<=11000);assert(['S+','S','A','B','C','D'].includes(result.grade));
            assert(recordModeResult(r,result));assert.equal(modeBest(r).score,result.score);recordModeResult(r,{score:0,grade:'D',complete:false});assert.equal(modeBest(r).score,result.score);assert(modeBest(r).completed);
            team1.players=team1.players.slice(1);assert(!modeScore(r).complete);assert(['C','D'].includes(modeScore(r).grade));assert(!Object.values(modeSquadView(1).assignment).includes(witness.roster[0]),'Undo cannot score a departed player');
        }
        const before=localStorage.setItem;localStorage.setItem=()=>{throw Error('quota');};assert.equal(recordModeResult(daily,{score:100,grade:'D',complete:false}),false);localStorage.setItem=before;
        localStorage.setItem(MODE_RECORD_KEY,'{bad');assert.deepEqual(readModeRecords(),{});
        const partial={refreshes:99,lineupKey:42,retired:[99999,'1',1]};assert.deepEqual(normalizeDraftModeState(partial,rule),{refreshes:rule.scouts,lineupKey:'',retired:[1]});
        maxPlayers=11;cpuDifficulty='hard';activeDraftChallenge=null;bidIncrement=50;startingBudget=10000;cpuPersonalitySeed=19;selectedPlayerIds=new Set(challengePool());
        // A weak defender is a larger gain than another similar elite forward.
        const p=id=>playerById(id);team2={name:'CPU',color:'#123abc',budget:6000,players:[49,34,35,1,14,27,28,57,8].map(p)};team1.players=[];
        const publicQueue=remainingPlayers;remainingPlayers=new Proxy([],{get(){throw Error('Future auction order read');}});currentPlayer=p(40);const defender=evaluateCpuTarget(),defenderCap=cpuMaximumBid(team2,defender);currentPlayer=p(15);const luxury=evaluateCpuTarget(),luxuryCap=cpuMaximumBid(team2,luxury);assert(defender.fitGain>luxury.fitGain);assert(defenderCap>luxuryCap);assert.equal(cpuChooseBid(team2,10000),null);remainingPlayers=publicQueue;
        const beforePlan=cpuPlanRoster(team2.players),afterPlan=cpuPlanRoster([...team2.players,p(40)]);assert(afterPlan.fitCount>beforePlan.fitCount);assert.equal(cpuPlanRoster([...team2.players,team2.players[0]]).fitCount,beforePlan.fitCount);
        currentPlayer=p(40);assert(cpuChooseBid(team2,50)!==null,'Hard recognises a cheap needed defender');
        for(const difficulty of ['easy','normal','hard']){cpuDifficulty=difficulty;for(const budget of [100,500,2000,10000]){team2.budget=budget;const max=cpuMaximumBid(team2,evaluateCpuTarget());assert(max<=Math.max(0,budget-(maxPlayers-team2.players.length-1)*50));}}
    `);
    run(`
        // Exercise actual bidding/award logic against a deterministic budget-limited human policy.
        team2CpuControlled=true;renderAuctionScreen=()=>{};recordAuctionUndoPoint=()=>{};saveGame=()=>{};playSfx=()=>{};triggerFx=()=>{};esc=String;teamVars=()=>'';
        const reports=[];for(const difficulty of ['easy','normal','hard'])for(const poolKind of ['all','no-masters','underdogs','limited'])for(let seed=1;seed<=5;seed++){
            cpuDifficulty=difficulty;cpuPersonalitySeed=seed;maxPlayers=11;startingBudget=10000;bidIncrement=50;activeDraftChallenge=null;auctionHistory=[];auctionNumber=0;startingTeam=seed%2+1;
            team1={name:'HUMAN',color:'#123abc',budget:10000,players:[]};team2={name:'CPU',color:'#ff1234',budget:10000,players:[]};
            let ids=challengePool().filter(id=>poolKind!=='no-masters'||!modeCategory(playerById(id),'master-strikers')).filter(id=>poolKind!=='underdogs'||playerOverall(playerById(id))<=89);
            if(poolKind==='limited'){const ordered=seededDraftShuffle(ids,37),keep=new Set();for(const role of ['GK','DEF','MID','ATT'])for(const id of ordered.filter(id=>cpuPlayerRoles(playerById(id)).includes(role)).slice(0,role==='GK'?3:9))keep.add(id);ids=[...keep];}
            selectedPlayerIds=new Set(ids);const order=seededDraftShuffle(ids,seed*101);let passes=0;
            for(const id of order){if(isTeamFull(1)&&isTeamFull(2))break;currentPlayer=playerById(id);auctionNumber++;currentBid=0;currentBidder=null;
                const forced=onlyTeamWithSpace();if(forced){awardPlayerFree(forced,true);continue;}
                const humanSlots=maxPlayers-team1.players.length,average=team1.budget/humanSlots,humanCap=Math.min(team1.budget-(humanSlots-1)*50,average*(.7+(playerOverall(currentPlayer)-60)/30));
                currentBidder=startingTeam;currentBid=startingTeam===2?cpuChooseBid(team2,0,true):team1.budget>=50?50:0;
                for(let turns=0;turns<1000;turns++){const bidder=otherTeamNumber(currentBidder),next=bidder===2?cpuChooseBid(team2,currentBid):nextLegalAuctionBid(currentBid)<=humanCap?nextLegalAuctionBid(currentBid):null;if(next===null){if(bidder===2)passes++;break;}currentBid=next;currentBidder=bidder;}
                assert(currentBid<=teamByNumber(currentBidder).budget);awardPlayer(currentBidder);assert(team1.budget>=0&&team2.budget>=0);assert(team1.players.length<=maxPlayers&&team2.players.length<=maxPlayers);
            }
            assert.equal(team2.players.length,11,difficulty+'/'+poolKind+'/'+seed);assert.equal(new Set([...team1.players,...team2.players].map(p=>p.id)).size,22);ensureCpuSquadBuilt();assert.equal(Object.values(formationAssignments[2]).length,11);assert(Object.values(formationAssignments[2]).includes(formationCaptainByTeam[2]));
            const plan=cpuPlanRoster(team2.players);reports.push({difficulty,poolKind,seed,fit:plan.fitCount,ovr:naturalSquadOVR(team2),budget:team2.budget,passes});
        }
        team1.players=[];team2.players=[];team2.budget=10000;maxPlayers=11;currentPlayer=playerById(8);auctionHistory=[];startingTeam=1;currentBidder=1;currentBid=500;activeDraftChallenge=null;
        displayBiddingTurn=n=>{uiState={screen:'auction',phase:'bidding',turn:n};};
        for(const difficulty of ['easy','normal','hard']){cpuDifficulty=difficulty;currentBid=500;currentBidder=1;uiState={screen:'auction',phase:'bidding',turn:2};const saved=JSON.parse(JSON.stringify(auctionSnapshot()));currentBid=1234;assert(hydrateAuctionSnapshot(saved));performCpuResponse();assert.equal(currentBid,550,'Resumed '+difficulty+' CPU must raise exactly once');performCpuResponse();assert.equal(currentBid,550);}
        activeDraftChallenge=contract;maxPlayers=contract.size;team1.players=[stars[0]];team2.players=[stars[0]];currentPlayer=stars[1];currentBid=100;auctionHistory=[];const retire=retireModeTarget;let rejected=0;retireModeTarget=()=>{rejected++;};awardPlayer(1);awardPlayerFree(2,true);assert.equal(rejected,2);assert.equal(team1.players.length,1);assert.equal(team2.players.length,1);retireModeTarget=retire;activeDraftChallenge=null;
        const hard=reports.filter(r=>r.difficulty==='hard');assert(hard.reduce((sum,r)=>sum+r.fit,0)/hard.length>=8,'Hard should usually cover at least eight natural starting roles');assert(hard.every(r=>r.passes>0));console.log('CPU simulation:',reports.length,'auctions; Hard mean fit', (hard.reduce((sum,r)=>sum+r.fit,0)/hard.length).toFixed(2),'/11; mean OVR',(hard.reduce((sum,r)=>sum+r.ovr,0)/hard.length).toFixed(1));
    `);
    console.log('PASS v0.7.2: 10 feasible missions and 6 additional daily archetypes, 180 deterministic dates, contracts/codes/objectives/scoring/bests/Undo validation and 60 CPU auctions');
}
module.exports={runGameModeTests,createModeTestContext};
if(require.main===module)runGameModeTests();
