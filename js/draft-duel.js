// v0.7.3 Ego Draft Duel: a competitive draft against a CPU manager. No match is simulated.
// Squad quality uses the shared position, chemistry, Auto Best and snapshot models.
// The CPU sees the current market, both rosters and the public roster only — never a future market.
const DUEL_SAVE_KEY="bldDraftDuelV1",DUEL_RECORD_KEY="bldDraftDuelRecordsV1",DUEL_MARKET_SIZE=4;
const DUEL_FORMATS=Object.freeze({quick:{size:7,title:"QUICK"},standard:{size:9,title:"STANDARD"},full:{size:11,title:"FULL XI"}});
const DUEL_LEVELS=Object.freeze(["easy","normal","hard"]);
let duelState=null,duelStorageFailed=false;
function duelRandom(seed){let h=seed>>>0;return ()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/4294967296;};}
function duelSize(state){return DUEL_FORMATS[state.format].size;}
function duelFormations(size){return dailyFormationNames(size);}
function duelDailySetup(date=localDraftDate()){
    const day=soloDate(typeof date==="string"?date:localDraftDate(date)),number=dailyDayNumber(day);
    return {seed:replayHash("BLD-duel-v073:"+day),format:["standard","quick","full"][((number%3)+3)%3],level:"normal",daily:day};
}
function duelNew({seed,format="standard",level="normal",daily=null,formation=null}={}){
    if(!Object.hasOwn(DUEL_FORMATS,format)||!DUEL_LEVELS.includes(level)||!Number.isInteger(seed)||seed<0||seed>4294967295)replayFail("Invalid draft action.");
    if(daily!==null)soloDate(daily);
    const size=DUEL_FORMATS[format].size,forms=duelFormations(size),human=formation&&forms.includes(formation)?formation:forms[0];
    const cpu=forms[replayHash("cpu-shape:"+seed)%forms.length];
    return {v:1,kind:"duel",seed,format,level,daily,phase:"formation",humanFormation:human,cpuFormation:cpu,human:[],cpu:[],seen:[],actions:[],log:[],market:[],finalFormation:null,attempt:0};
}
// Who chooses first alternates; a seeded coin decides the opening pick.
function duelOpeningHuman(state){return replayHash("duel-first:"+state.seed)%2===0;}
function duelHumanFirst(state){return (state.log.length%2===0)===duelOpeningHuman(state);}
function duelProjection(ids,formation){
    const roster=ids.map(playerById),shape=formationShape(formation),slots=shape.map((_,i)=>i),assignment=cpuAssignment(roster,shape,slots),used=new Set(Object.values(assignment));
    // Remaining players fill open slots only where the role is acceptable; poor fits stay on the bench.
    for(const player of roster)if(!used.has(player.id)){const slot=slots.find(i=>!assignment[i]&&acceptablePositionFit(player,shape[i].label));if(slot!==undefined){assignment[slot]=player.id;used.add(player.id);}}
    const chemistry=tacticalChemistrySnapshot(roster,assignment,shape,formationEdgePairs(formation),new Set(Object.keys(assignment).map(Number))),contribution=lineupContributionSnapshot(roster,assignment,shape,chemistry);
    // Empty roles count as a modest 60-rated replacement, so every useful signing has positive value.
    const strength=(contribution.members.reduce((sum,m)=>sum+m.raw,0)+(shape.length-contribution.members.length)*60)/shape.length;
    return {assignment,strength,open:slots.filter(i=>!assignment[i]).map(i=>shape[i].label)};
}
function duelOpenRoles(ids,formation){return duelProjection(ids,formation).open;}
function duelMarket(state){
    const size=duelSize(state),round=state.log.length;if(round>=size)return [];
    const taken=new Set([...state.seen,...state.human,...state.cpu]),pool=challengePool().filter(id=>!taken.has(id)).map(playerById);
    const random=duelRandom(replayHash("duel-market:"+state.seed+":"+round+":"+state.human.join(",")+"|"+state.cpu.join(","))),chosen=[];
    let rest=[...pool];
    const take=list=>{if(!list.length)return;const total=list.reduce((sum,p)=>sum+Math.pow(Math.max(1,playerOverall(p)-62),1.15),0);let value=random()*total;const p=list.find(p=>(value-=Math.pow(Math.max(1,playerOverall(p)-62),1.15))<=0)||list.at(-1);chosen.push(p);rest=rest.filter(other=>other.id!==p.id);};
    // Symmetric needs: one offer for each manager's scarcest open role, then the open market.
    for(const [ids,formation] of [[state.human,state.humanFormation],[state.cpu,state.cpuFormation]]){
        const open=duelOpenRoles(ids,formation);if(!open.length)continue;
        const scarce=[...new Set(open)].sort((a,b)=>rest.filter(p=>canonicalFit(p,a)).length-rest.filter(p=>canonicalFit(p,b)).length)[0];
        if(chosen.some(p=>canonicalFit(p,scarce)))continue;
        const late=size-round<=Math.max(2,open.length);
        if(late||random()<.65)take(rest.filter(p=>canonicalFit(p,scarce)));
    }
    while(chosen.length<DUEL_MARKET_SIZE&&rest.length)take(rest);
    return seededDraftShuffle(chosen.map(p=>p.id),replayHash("duel-order:"+state.seed+":"+round));
}
function duelValue(ids,formation,id){return duelProjection([...ids,id],formation).strength-duelProjection(ids,formation).strength;}
// Flexible planning: the best shape available to this squad size before and after the signing.
function duelFlexibleValue(ids,size,id){const best=list=>Math.max(...duelFormations(size).map(name=>duelProjection(list,name).strength));return best([...ids,id])-best(ids);}
function duelCpuChoice(state,options){
    const random=duelRandom(replayHash("duel-cpu:"+state.seed+":"+state.log.length+":"+state.level)),level=state.level;
    const remaining=challengePool().filter(id=>!new Set([...state.seen,...state.human,...state.cpu,...state.market]).has(id)).map(playerById);
    const scored=options.map(id=>{
        const p=playerById(id),noise=random()-.5;
        if(level==="easy"){
            // Star-first: reputation dominates and squad fit is often overlooked.
            const own=random()<.45?0:duelValue(state.cpu,state.cpuFormation,id);
            return {id,score:playerOverall(p)*.6+own*3+noise*14};
        }
        if(level==="normal"){const own=duelValue(state.cpu,state.cpuFormation,id);return {id,score:own+playerOverall(p)*.02+noise*1.2};}
        const own=duelFlexibleValue(state.cpu,duelSize(state),id);
        if(level==="normal")return {id,score:own+playerOverall(p)*.02+noise*1.2};
        // Hard: own improvement, denial value against the human and scarcity of the role in the public pool.
        const denial=duelValue(state.human,state.humanFormation,id),open=duelOpenRoles(state.cpu,state.cpuFormation),fills=open.filter(label=>canonicalFit(p,label));
        const scarcity=fills.length?Math.max(...fills.map(label=>2.2/(1+remaining.filter(other=>canonicalFit(other,label)).length))):0;
        return {id,score:own+Math.max(0,denial)*(own>.15?.35:.08)+scarcity*.6+noise*.1};
    }).sort((a,b)=>b.score-a.score||a.id-b.id);
    return scored[0].id;
}
function duelOpenMarket(state){
    state.market=duelMarket(state);
    if(!duelHumanFirst(state)&&state.market.length){const pick=duelCpuChoice(state,state.market);state.cpu.push(pick);state.pending={cpu:pick};state.market=state.market.filter(id=>id!==pick);}
    else state.pending={};
    return state;
}
function duelStart(state){
    if(state.kind!=="duel"||state.phase!=="formation"||!duelFormations(duelSize(state)).includes(state.humanFormation))replayFail("Invalid draft action.");
    state.phase="draft";return duelOpenMarket(state);
}
function duelPick(state,id){
    if(state.kind!=="duel"||state.phase!=="draft"||!Number.isInteger(id)||!state.market.includes(id))replayFail("Invalid draft action.");
    state.human.push(id);state.actions.push(id);
    const entry={human:id,humanFirst:duelHumanFirst(state)};let rest=state.market.filter(other=>other!==id);
    if(entry.humanFirst){const pick=duelCpuChoice({...state,market:state.market},rest);state.cpu.push(pick);entry.cpu=pick;rest=rest.filter(other=>other!==pick);}
    else entry.cpu=state.pending.cpu;
    entry.discarded=rest;state.seen.push(...rest,id,entry.cpu);state.log.push(entry);state.market=[];state.pending={};
    if(state.log.length>=duelSize(state)){state.phase="review";state.finalFormation=duelBestFormation(state.human,duelSize(state)).formation;}
    else duelOpenMarket(state);
    return state;
}
function duelWithSquad(ids,size,callback){
    const old={team:standaloneBuilderTeam,formation:formationByTeam[0],assignment:formationAssignments[0],captain:formationCaptainByTeam[0],size:maxPlayers,budget:startingBudget};
    standaloneBuilderTeam={name:"DRAFT DUEL",color:"#4fb4e1",players:ids.map(playerById),budget:0};maxPlayers=size;startingBudget=0;formationCaptainByTeam[0]=null;
    try{return callback();}finally{standaloneBuilderTeam=old.team;if(old.formation===undefined)delete formationByTeam[0];else formationByTeam[0]=old.formation;if(old.assignment===undefined)delete formationAssignments[0];else formationAssignments[0]=old.assignment;if(old.captain===undefined)delete formationCaptainByTeam[0];else formationCaptainByTeam[0]=old.captain;maxPlayers=old.size;startingBudget=old.budget;}
}
const duelEvaluationCache=new Map();
// Final squads use the same all-formation Auto Best lineup search as the Team Builder.
function duelEvaluate(ids,size,formation){
    const key=SQUAD_BALANCE_REVISION+":"+size+":"+formation+":"+[...ids].sort((a,b)=>a-b).join(",");
    if(duelEvaluationCache.has(key))return duelEvaluationCache.get(key);
    const result=duelWithSquad(ids,size,()=>{
        formationByTeam[0]=formation;formationAssignments[0]={};
        const best=bestLineupForFormation(0,formation);if(!best)return null;
        formationByTeam[0]=formation;formationAssignments[0]={...best.assignment};ensureFormationCaptain(0,true);
        const snap=shareFormationSnapshot(0),fit=soloFitCount(snap);
        return {snap:{...snap,team:{...snap.team,players:[...snap.team.players]},assignment:{...snap.assignment}},formation,assignment:{...best.assignment},captain:formationCaptainByTeam[0],ovr:snap.ovr,base:snap.baseOvr,chemistry:snap.chemistry.overall,fit,slots:formationShape(formation).length,strength:snap.contribution.effectiveRaw};
    });
    if(duelEvaluationCache.size>120)duelEvaluationCache.clear();duelEvaluationCache.set(key,result);return result;
}
function duelFormationOptions(ids,size){return duelFormations(size).map(name=>duelEvaluate(ids,size,name)).filter(Boolean);}
function duelBestFormation(ids,size){return duelFormationOptions(ids,size).sort((a,b)=>b.strength-a.strength||b.chemistry-a.chemistry)[0];}
function duelChooseFormation(state,formation){if(state.kind!=="duel"||state.phase!=="review"||!duelFormations(duelSize(state)).includes(formation))replayFail("This squad uses an unknown formation.");state.finalFormation=formation;return state;}
function duelResult(state){
    const size=duelSize(state),human=duelEvaluate(state.human,size,state.finalFormation),cpu=duelBestFormation(state.cpu,size),margin=Math.round((human.strength-cpu.strength)*10)/10;
    // Effective strength decides; chemistry and base quality break near-ties.
    let outcome=margin>=.5?"win":margin<=-.5?"loss":human.chemistry!==cpu.chemistry?(human.chemistry>cpu.chemistry?"win":"loss"):human.base!==cpu.base?(human.base>cpu.base?"win":"loss"):"draw";
    const steals=state.log.filter(entry=>!entry.humanFirst).length,denied=state.log.filter(entry=>entry.humanFirst&&entry.discarded.some(id=>duelValue(state.cpu,state.cpuFormation,id)>0));
    return {human,cpu,margin,outcome,steals,denied:denied.length};
}
function duelFinish(state){if(state.phase!=="review")replayFail("Invalid draft action.");state.phase="result";return state;}
function duelCode(state){return replayCode("BLDD1",[1,state.seed,state.format,state.level]);}
function duelFromCode(code){const value=replayDecode(code,"BLDD1");if(!Array.isArray(value)||value.length!==4||value[0]!==1)replayFail("Invalid or outdated code.");return duelNew({seed:value[1],format:value[2],level:value[3]});}
function normalizeDuelState(value){
    if(!replayRecord(value)||value.v!==1||value.kind!=="duel"||!Array.isArray(value.actions)||value.actions.length>11)replayFail("Saved draft is invalid or outdated.");
    const clean=duelNew({seed:value.seed,format:value.format,level:value.level,daily:value.daily??null,formation:value.humanFormation});
    if(clean.humanFormation!==value.humanFormation)replayFail("This squad uses an unknown formation.");
    clean.attempt=Number.isInteger(value.attempt)&&value.attempt>=0&&value.attempt<=100000?value.attempt:0;
    if(value.phase==="formation"){if(value.actions.length)replayFail("Saved draft is invalid or outdated.");return clean;}
    duelStart(clean);for(const id of value.actions)duelPick(clean,id);
    if(["review","result"].includes(value.phase)){if(clean.phase!=="review")replayFail("Saved draft is invalid or outdated.");duelChooseFormation(clean,value.finalFormation);if(value.phase==="result")duelFinish(clean);}
    else if(clean.phase!=="draft")replayFail("Saved draft is invalid or outdated.");
    return clean;
}
function duelLoad(){try{const raw=localStorage.getItem(DUEL_SAVE_KEY);return raw?normalizeDuelState(JSON.parse(raw)):null;}catch{return null;}}
function duelSave(){try{localStorage.setItem(DUEL_SAVE_KEY,JSON.stringify({v:1,kind:"duel",seed:duelState.seed,format:duelState.format,level:duelState.level,daily:duelState.daily,phase:duelState.phase,humanFormation:duelState.humanFormation,actions:duelState.actions,finalFormation:duelState.finalFormation,attempt:duelState.attempt}));return true;}catch{duelStorageFailed=true;return false;}}
function duelRecords(){
    const empty={v:1,levels:{easy:{w:0,l:0,d:0,best:null},normal:{w:0,l:0,d:0,best:null},hard:{w:0,l:0,d:0,best:null}},daily:{},recent:[]};
    try{
        const raw=JSON.parse(localStorage.getItem(DUEL_RECORD_KEY)||"null");if(!replayRecord(raw)||raw.v!==1)return empty;
        const count=value=>Number.isInteger(value)&&value>=0&&value<=1000000?value:0,margin=value=>Number.isFinite(value)&&Math.abs(value)<=100?Math.round(value*10)/10:null;
        for(const level of DUEL_LEVELS){const item=raw.levels?.[level];if(replayRecord(item))empty.levels[level]={w:count(item.w),l:count(item.l),d:count(item.d),best:margin(item.best)};}
        if(replayRecord(raw.daily))for(const [day,item]of Object.entries(raw.daily).sort(([a],[b])=>b.localeCompare(a)).slice(0,60))if(/^\d{4}-\d{2}-\d{2}$/.test(day)&&replayRecord(item)&&["win","loss","draw"].includes(item.outcome)&&margin(item.margin)!==null)empty.daily[day]={outcome:item.outcome,margin:margin(item.margin),attempts:Math.max(1,count(item.attempts))};
        if(Array.isArray(raw.recent))empty.recent=raw.recent.filter(item=>replayRecord(item)&&["win","loss","draw"].includes(item.outcome)&&DUEL_LEVELS.includes(item.level)&&Object.hasOwn(DUEL_FORMATS,item.format)&&margin(item.margin)!==null).slice(0,10).map(item=>({outcome:item.outcome,level:item.level,format:item.format,margin:margin(item.margin),date:typeof item.date==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(item.date)?item.date:null}));
        return empty;
    }catch{return empty;}
}
function duelRecordResult(state){
    const result=duelResult(state),records=duelRecords(),level=records.levels[state.level],key=result.outcome==="win"?"w":result.outcome==="loss"?"l":"d";
    level[key]++;if(level.best===null||result.margin>level.best)level.best=result.margin;
    if(state.daily){const old=records.daily[state.daily];records.daily[state.daily]=!old||result.margin>old.margin?{outcome:result.outcome,margin:result.margin,attempts:(old?.attempts||0)+1}:{...old,attempts:old.attempts+1};}
    records.recent=[{outcome:result.outcome,level:state.level,format:state.format,margin:result.margin,date:localDraftDate()},...records.recent].slice(0,10);
    try{localStorage.setItem(DUEL_RECORD_KEY,JSON.stringify(records));}catch{duelStorageFailed=true;}
    const human=result.human,shape=formationShape(human.formation);
    result.unlocked=typeof egoRecordEvent==="function"?egoRecordEvent({mode:"duel",complete:true,outcome:result.outcome,level:state.level,formation:human.formation,playerIds:[...state.human],chemistry:human.chemistry,ovr:human.ovr,naturalEleven:human.slots===11&&Object.entries(human.assignment).every(([slot,id])=>playerPositionProfile(playerById(id),shape[slot].label).fit==="primary")}):[];
    return result;
}
