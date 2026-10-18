// v0.7.2.1: isolated solo modes. Canonical football calculations stay in the shared modules.
const SOLO_SAVE_KEY="bldSoloDraftV1",SOLO_RECORD_KEY="bldSoloRecordsV1";
let soloState=null,soloUndo=[],soloRedo=[],soloStorageFailed=false;
function soloDate(value){if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value+"T12:00:00Z"))||new Date(value+"T12:00:00Z").toISOString().slice(0,10)!==value)replayFail("Invalid challenge rules.");return value;}
function soloWithTeam(state,callback){
    const old={team:standaloneBuilderTeam,formation:formationByTeam[0],assignment:formationAssignments[0],captain:formationCaptainByTeam[0],size:maxPlayers,budget:startingBudget};
    standaloneBuilderTeam={name:replayText(state.kind==="daily"?"DAILY EGO DRAFT":puzzleMission(state.mission).title),color:state.kind==="daily"?"#e1b24f":"#dc7389",players:state.ids.map(playerById),budget:state.kind==="daily"?0:puzzleMission(state.mission).budget-puzzleSpend(state)};
    formationByTeam[0]=state.formation||"4-3-3";formationAssignments[0]={...(state.assignment||{})};formationCaptainByTeam[0]=state.captain||null;maxPlayers=state.kind==="daily"?dailyRuleForState(state).size:11;startingBudget=state.kind==="daily"?0:puzzleMission(state.mission).budget;
    try{return callback();}finally{standaloneBuilderTeam=old.team;if(old.formation===undefined)delete formationByTeam[0];else formationByTeam[0]=old.formation;if(old.assignment===undefined)delete formationAssignments[0];else formationAssignments[0]=old.assignment;if(old.captain===undefined)delete formationCaptainByTeam[0];else formationCaptainByTeam[0]=old.captain;maxPlayers=old.size;startingBudget=old.budget;}
}
function soloSnapshot(state){return soloWithTeam(state,()=>{const snap=shareFormationSnapshot(0);return {...snap,team:{...snap.team,players:[...snap.team.players]},assignment:{...snap.assignment}};});}
function soloChooseCaptain(state){return soloWithTeam(state,()=>{ensureFormationCaptain(0,true);return formationCaptainByTeam[0];});}
function soloFitCount(snap){return Object.entries(snap.assignment).filter(([slot,id])=>canonicalFit(playerById(id),snap.shape[slot]?.label)).length;}
const DAILY_PICK_THEMES=Object.freeze([
    {id:"speed",title:"SPEED KILLS",description:"Fast players appear more often. Build an explosive squad.",stat:"spd",target:83},
    {id:"core",title:"BLUE LOCK ELEVEN",description:"Blue Lock players lead today's draft. Connect the core.",target:.65},
    {id:"world",title:"WORLD CLASS",description:"International stars appear more often. Make every position count.",target:85},
    {id:"underdog",title:"NO SUPERSTARS",description:"No player is above 89 OVR. Find strength in balance.",target:78},
    {id:"chemistry",title:"CHEMICAL REACTION",description:"Choose partners who bring the best out of each other.",target:80},
    {id:"wall",title:"IRON WALL",description:"Defensive specialists appear more often. Protect your team.",target:3},
    {id:"king",title:"ONE SUPERSTAR",description:"One elite offer. Build the right team around your choice.",target:83},
    {id:"creative",title:"TECHNICIANS",description:"Creators lead today's draft. Turn passing into a weapon.",target:3},
    {id:"chaos",title:"CHAOS DRAFT",description:"A varied market. Adapt your plan after every pick.",target:.8},
    {id:"crisis",title:"POSITION CRISIS",description:"Wide defenders are scarce. Take useful roles when they appear.",target:.9}
]);
function dailyPickRule(date=localDraftDate()){
    const day=soloDate(typeof date==="string"?date:localDraftDate(date)),seed=replayHash("BLD-picks-v0721:"+day),theme=DAILY_PICK_THEMES[seed%DAILY_PICK_THEMES.length];
    const size=theme.id==="underdog"?[7,8,9,10,11][seed%5]:[7,8,9,10,11,14][Math.floor(seed/10)%6];
    let pool=challengePool().filter(id=>theme.id!=="underdog"||playerOverall(playerById(id))<=89);
    if(theme.id==="crisis")pool=pool.filter(id=>![26,29,33,43].includes(id));
    // Keep enough distinct choices for the largest run, including both token rerolls.
    return {...theme,date:day,seed,size,tokens:2,pool};
}
function dailyRuleForState(state){const rule=dailyPickRule(state.date);return state.carry?{...rule,size:state.carry.size}:rule;}
function dailyPickNew(date=localDraftDate()){
    const rule=dailyPickRule(date),formation=dailyFormationNames(rule.size)[0];
    return {v:2,kind:"daily",date:rule.date,ids:[],seen:[],actions:[],tokens:2,chosenFormation:formation,formation,assignment:{},captain:null,phase:"formation",attempt:0};
}
function dailyPickPlan(state,formation=state.formation){
    return soloWithTeam(state,()=>{
        const shape=formationShape(formation),slots=shape.map((_,i)=>i),assignment=cpuAssignment(standaloneBuilderTeam.players,shape,slots),used=new Set(Object.values(assignment)),remaining=state.ids.filter(id=>!used.has(id));
        for(const slot of slots)if(!assignment[slot]&&remaining.length)assignment[slot]=remaining.shift();
        return {formation,assignment};
    });
}
function dailyStartPicks(state){if(state.kind!=="daily"||state.phase!=="formation"||!dailyFormationNames(dailyRuleForState(state).size).includes(state.formation))replayFail("Invalid draft action.");state.chosenFormation=state.formation;state.phase="picking";return state;}
function dailyPickWeight(p,rule,state){
    const s=playerStats(p),links=state.ids.map(id=>playerChemistry(p,playerById(id))),chem=links.length?Math.max(...links):72;
    switch(rule.id){case "speed":return 1+Math.max(0,s.spd-70)/4;case "core":return modeCategory(p,"blue-lock-project")?7:1;case "world":return p.nationality?.code!=="JP"&&playerOverall(p)>=90?7:1;case "chemistry":return 1+Math.max(0,chem-70)/3;case "wall":return 1+Math.max(0,s.def-65)/4;case "creative":return 1+Math.max(0,(s.pas+s.dri)/2-70)/4;case "crisis":return cpuPlayerRoles(p).includes("ATT")?4:1;default:return 1;}
}
function dailyPickOptions(state){
    const rule=dailyRuleForState(state);if(state.ids.length>=rule.size)return [];
    const available=rule.pool.map(playerById).filter(p=>!state.seen.includes(p.id)&&!state.ids.includes(p.id)),round=state.ids.length;
    // The superstar theme has one elite offer round; unused elite cards cannot return.
    const kingRound=rule.id==="king"&&round===Math.min(2,rule.size-1);
    let pool=available.filter(p=>rule.id!=="king"||kingRound||playerOverall(p)<94);
    let h=replayHash("v0722:"+rule.seed+":"+state.chosenFormation+":"+round+":"+state.actions.length+":"+state.ids.join(","));const random=()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/4294967296;};
    const chosen=[],take=list=>{if(!list.length)return;let total=list.reduce((sum,p)=>sum+dailyPickWeight(p,rule,state),0),value=random()*total;const p=list.find(p=>(value-=dailyPickWeight(p,rule,state))<=0)||list.at(-1);chosen.push(p);pool=pool.filter(other=>other.id!==p.id);};
    if(kingRound){take(pool.filter(p=>playerOverall(p)>=94));pool=pool.filter(p=>playerOverall(p)<94);}
    const plan=dailyPickPlan(state),shape=formationShape(plan.formation),slots=shape.map((_,i)=>i),gaps=slots.filter(i=>!plan.assignment[i]||!canonicalFit(playerById(plan.assignment[i]),shape[i].label));
    const need=gaps.sort((a,b)=>pool.filter(p=>canonicalFit(p,shape[a].label)).length-pool.filter(p=>canonicalFit(p,shape[b].label)).length)[0];
    if(chosen.length<2&&need!==undefined&&(random()<.72||rule.size-round<=2))take(pool.filter(p=>canonicalFit(p,shape[need].label)));
    while(chosen.length<3&&pool.length)take(pool);
    return chosen.map(p=>p.id);
}
function dailyPickAction(state,action){
    if(state.kind!=="daily"||state.phase!=="picking")replayFail("Invalid draft action.");const options=dailyPickOptions(state);if(!options.length)replayFail("Invalid draft action.");
    if(action.type==="reroll"){if(!state.tokens)replayFail("No Ego Tokens left.");state.tokens--;}
    else if(action.type==="pick"&&Number.isInteger(action.id)&&options.includes(action.id))state.ids.push(action.id);
    else replayFail("Invalid draft action.");
    state.seen.push(...options);state.actions.push(action.type==="pick"?{type:"pick",id:action.id}:{type:"reroll"});
    Object.assign(state,dailyPickPlan(state));state.captain=soloChooseCaptain(state);
    if(state.ids.length===dailyRuleForState(state).size){state.phase="review";const best=dailyFormations(state).find(f=>f.formation===state.formation);if(best)Object.assign(state,{assignment:best.assignment});state.captain=soloChooseCaptain(state);}
    return state;
}
const dailyFormationCache=new Map();
function dailyFormations(state){
    const key=SQUAD_BALANCE_REVISION+":"+state.ids.join(",")+":"+state.captain+":"+dailyRuleForState(state).size;
    if(dailyFormationCache.has(key))return dailyFormationCache.get(key).map(f=>({...f,assignment:{...f.assignment}}));
    const result=soloWithTeam(state,()=>dailyFormationNames(dailyRuleForState(state).size).map(formation=>{
        const best=bestLineupForFormation(0,formation);if(!best)return null;
        formationByTeam[0]=formation;formationAssignments[0]=best.assignment;
        const snap=shareFormationSnapshot(0);return {formation,assignment:best.assignment,fit:soloFitCount(snap),ovr:snap.ovr,chemistry:snap.chemistry.overall};
    }).filter(Boolean));
    if(dailyFormationCache.size>40)dailyFormationCache.clear();dailyFormationCache.set(key,result);return result.map(f=>({...f,assignment:{...f.assignment}}));
}
function dailyObjective(state,snap){
    const rule=dailyRuleForState(state),roster=state.ids.map(playerById);let current=0,target=rule.target,label="DAILY OBJECTIVE";
    switch(rule.id){case "speed":current=Math.round(roster.reduce((sum,p)=>sum+playerStats(p).spd,0)/Math.max(1,roster.length));label="SPEED";break;case "core":current=roster.filter(p=>modeCategory(p,"blue-lock-project")).length;target=Math.ceil(rule.size*rule.target);label="BLUE LOCK ELEVEN";break;case "chemistry":current=snap.chemistry.overall;label="CHEMISTRY";break;case "wall":current=roster.filter(p=>playerStats(p).def>=82).length;label="DEFENCE";break;case "creative":current=roster.filter(p=>playerStats(p).pas>=85).length;label="PASSING";break;case "chaos":case "crisis":current=soloFitCount(snap);target=Math.ceil(Math.min(11,rule.size)*rule.target);label="POSITIONAL FIT";break;default:current=snap.ovr;label="TEAM OVR";}
    return {current,target,label,pass:current>=target};
}
function dailyPickScore(state){const snap=soloSnapshot(state),goal=dailyObjective(state,snap),slots=Math.min(11,dailyRuleForState(state).size),fit=soloFitCount(snap),components=[{label:"TEAM QUALITY",value:Math.round(qualityScore(snap.positionOvr)*52)},{label:"CHEMISTRY",value:Math.round(boundedNumber((snap.contribution.chemistryImpact+3)/7,0,1)*2500)},{label:"DAILY OBJECTIVE",value:Math.round(Math.min(1,goal.current/Math.max(1,goal.target))*1400)},{label:"SQUAD BALANCE",value:Math.round(fit/slots*1900)}],score=components.reduce((sum,c)=>sum+c.value,0),complete=state.ids.length===dailyRuleForState(state).size,[grade,gradeLabel]=modeGrade(score,complete&&fit>=Math.ceil(slots*.7)&&canonicalFit(playerById(state.assignment[0]),"GK"));return {snap,goal,components,score,grade,gradeLabel,complete};}
// Fixed mission recipes: canonical player IDs, fixed formations and visible acquisition costs.
function puzzleMissions(){
    const full=challengePool(),budgetPool=full.filter(id=>playerOverall(playerById(id))<=89),base=[8,33,40,16,26,20,28,27,7,15,29,24,4,23,9,39,42,43,45,41,78,74,49,50,51,56,30,22,25,48];
    const mission=(id,title,description,formation,budget,initial,locked,captain,goals=[],bonus=[],options={})=>({id,title,description,formation,budget,initial,locked,captain,goals,bonus,difficulty:"normal",pool:[...new Set([...base,...Object.values(initial)])],...options});
    return [
        mission("king-system","THE KING'S SYSTEM","Barou, Aiku and Niko are locked in. Complete their 4-3-3.","4-3-3",3600,{2:40,3:16,9:15},[2,3,9],15,[],[{type:"chemistry",target:80},{type:"remaining",target:1200}],{difficulty:"hard"}),
        mission("kaiser-links","KAISER'S EMPIRE","Kaiser, Ness and Grim need a supporting cast. Connect the team.","4-2-3-1",3400,{7:51,8:50,10:49},[7,8,10],49,[{type:"chemistry",target:76}],[{type:"chemistry",target:84}],{difficulty:"hard"}),
        mission("budget-rescue","BUDGET RESCUE","A strong core is paid for. Finish the team with limited funds.","3-4-3",1600,{0:8,1:40,5:27,6:28,9:23},[0,1,5,6,9],23,[],[{type:"minOVR",target:84},{type:"remaining",target:300}],{difficulty:"hard",pool:[...base,13,19,2,18]}),
        mission("fix-team","FIX THE TEAM","Two starters are out of position. Replace at most two players.","3-4-3",1000,{0:8,1:1,2:49,3:24,4:4,5:27,6:28,7:20,8:7,9:23,10:15},[0,5,6,9],23,[],[{type:"remaining",target:400}],{replacements:2,difficulty:"normal"}),
        mission("chemistry-lab","CHEMISTRY LAB","The core stays together. Find the partners who complete it.","3-4-3",4000,{4:4,5:27,7:20,8:7,9:23},[4,5,7,8,9],23,[{type:"chemistry",target:80}],[{type:"chemistry",target:86}],{difficulty:"extreme",pool:full.filter(id=>!modeCategory(playerById(id),"master-strikers"))}),
        mission("no-headlines","NO SUPERSTARS","No elite shortcuts. Build a balanced XI from this restricted pool.","4-4-2",3200,{0:39,2:16},[0,2],16,[{type:"minOVR",target:78}],[{type:"chemistry",target:82}],{pool:budgetPool,difficulty:"normal"}),
        mission("missing-piece","ONE MISSING PIECE","Ten starters are locked. Choose the final centre-back.","3-4-3",500,{0:8,1:40,3:24,4:4,5:27,6:28,7:20,8:7,9:23,10:15},[0,1,3,4,5,6,7,8,9,10],23,[],[{type:"chemistry",target:82},{type:"remaining",target:250}],{pool:[8,40,24,4,27,28,20,7,23,15,16,56,78,41,74],difficulty:"easy"}),
        mission("national-project","NATIONAL PROJECT","Keep the Japanese core and finish with at least nine Japanese players.","4-3-3",3500,{0:8,2:40,3:16,6:27},[0,2,3,6],40,[{type:"nation",key:"JP",target:9}],[{type:"chemistry",target:84}],{difficulty:"normal"}),
        mission("rival-system","RIVAL SYSTEM","Isagi and Kaiser share the attack. Make their whole team connect.","4-4-2",3200,{0:8,2:40,9:1,10:49},[0,2,9,10],1,[{type:"chemistry",target:78}],[{type:"player",id:50,target:1},{type:"remaining",target:800}],{difficulty:"hard"}),
        mission("formation-code","FORMATION CODE","The 5-2-3 is fixed. Every starter needs a demonstrated role.","5-2-3",3500,{0:8,3:40,6:27,9:23},[0,3,6,9],40,[],[{type:"minOVR",target:87},{type:"remaining",target:1000}],{difficulty:"hard"})
    ];
}
function puzzleMission(id){const mission=puzzleMissions().find(m=>m.id===id);if(!mission)replayFail("Invalid challenge rules.");return mission;}
function puzzlePrice(id){return Math.max(100,Math.round((playerOverall(playerById(id))-60)/5)*50);}
function puzzleNew(id){const m=puzzleMission(id),assignment={...m.initial};return {v:1,kind:"puzzle",mission:id,ids:Object.values(assignment),formation:m.formation,assignment,captain:m.captain,phase:"building"};}
function puzzleSpend(state){const m=puzzleMission(state.mission),initial=new Set(Object.values(m.initial));return state.ids.filter(id=>!initial.has(id)).reduce((sum,id)=>sum+puzzlePrice(id),0);}
function puzzleValidate(state){
    const m=puzzleMission(state.mission);if(state.formation!==m.formation||!replayRecord(state.assignment)||Object.keys(state.assignment).length>11)replayFail("Invalid squad positions.");
    const ids=Object.values(state.assignment);if(new Set(ids).size!==ids.length||ids.some(id=>!Number.isInteger(id)||!m.pool.includes(id)||!playerById(id)||playerById(id).secretCharacter)||Object.keys(state.assignment).some(slot=>!/^([0-9]|10)$/.test(slot)))replayFail("Invalid squad data.");
    if(m.locked.some(slot=>state.assignment[slot]!==m.initial[slot])||state.captain!==m.captain)replayFail("Locked players must stay in their positions.");
    state.ids=ids;if(puzzleSpend(state)>m.budget)replayFail("Not enough puzzle budget.");if(m.replacements!=null&&Object.values(m.initial).filter(id=>!ids.includes(id)).length>m.replacements)replayFail("Replacement limit reached.");return state;
}
function puzzlePlace(state,slot,id){
    if(state.kind!=="puzzle"||state.phase!=="building"||!Number.isInteger(slot)||slot<0||slot>10)replayFail("Invalid draft action.");const m=puzzleMission(state.mission);if(m.locked.includes(slot))replayFail("Locked players must stay in their positions.");
    const next={...state,assignment:{...state.assignment}};
    if(id===null)delete next.assignment[slot];else{if(!m.pool.includes(id)||!canonicalFit(playerById(id),FORMATIONS[m.formation][slot].label))replayFail("Choose a player who fits this position.");const previous=Object.keys(next.assignment).find(i=>next.assignment[i]===id);if(previous!==undefined){if(m.locked.includes(Number(previous)))replayFail("Locked players must stay in their positions.");delete next.assignment[previous];}next.assignment[slot]=id;}
    return puzzleValidate(next);
}
function puzzleScore(state){return soloWithTeam(state,()=>{const m=puzzleMission(state.mission),snap=shareFormationSnapshot(0),fit=soloFitCount(snap),valid={label:"POSITIONAL FIT",current:fit,target:11,pass:fit===11&&snap.deployedCount===11},required=[valid,...m.goals.map(o=>modeObjectiveEvaluation(o,standaloneBuilderTeam,snap))],bonus=m.bonus.map(o=>modeObjectiveEvaluation(o,standaloneBuilderTeam,snap)),complete=required.every(g=>g.pass),hits=bonus.filter(g=>g.pass).length,efficiency=(m.budget-puzzleSpend(state))/Math.max(1,m.budget),score=Math.round(qualityScore(snap.positionOvr)*45+boundedNumber((snap.contribution.chemistryImpact+3)/7,0,1)*2500+fit/11*1500+hits/Math.max(1,bonus.length)*1500+efficiency*500),grades=["D","C","B","A","S","S+"],grade=!complete?"D":hits===0?"C":hits<bonus.length?"B":score>=8600?"S+":score>=7900?"S":"A";return {snap,required,bonus,complete,score,grade,gradeLabel:complete?"CHALLENGE COMPLETE":"MISSION FAILED",components:[{label:"TEAM QUALITY",value:Math.round(qualityScore(snap.positionOvr)*45)},{label:"CHEMISTRY",value:Math.round(boundedNumber((snap.contribution.chemistryImpact+3)/7,0,1)*2500)},{label:"BONUS",value:hits}]};});}
function soloSquad(state){const snap=soloSnapshot(state);return normalizeReplaySquad({v:1,name:snap.team.name,color:snap.team.color,playerIds:[...state.ids],formation:state.formation,assignment:{...state.assignment},captainId:state.captain});}
function soloRecords(){try{const raw=JSON.parse(localStorage.getItem(SOLO_RECORD_KEY)||"{}");if(!replayRecord(raw))return {};const out={};for(const [key,item]of Object.entries(raw).slice(-60)){try{if(!/^(?:daily:\d{4}-\d{2}-\d{2}|puzzle:[a-z-]+)$/.test(key)||!replayRecord(item)||!Number.isInteger(item.attempts)||item.attempts<1||item.attempts>100000||!Number.isInteger(item.score)||item.score<0||item.score>12000||!["S+","S","A","B","C","D"].includes(item.grade))continue;out[key]={...item,complete:item.complete===true,squad:item.squad?normalizeReplaySquad(item.squad):null};}catch{}}return out;}catch{return {};}}
function soloRecordKey(state){return state.kind==="daily"?"daily:"+state.date:"puzzle:"+state.mission;}
function soloWriteRecords(records){try{const entries=Object.entries(records),daily=entries.filter(([key])=>key.startsWith("daily:")).sort(([a],[b])=>b.localeCompare(a)).slice(0,31),puzzles=entries.filter(([key])=>puzzleMissions().some(m=>key==="puzzle:"+m.id));localStorage.setItem(SOLO_RECORD_KEY,JSON.stringify(Object.fromEntries([...daily,...puzzles])));return true;}catch{soloStorageFailed=true;return false;}}
function soloBeginAttempt(state){const all=soloRecords(),key=soloRecordKey(state),old=all[key]||{attempts:0,score:0,grade:"D",squad:null,complete:false};state.attempt=Math.min(100000,(old.attempts||0)+1);all[key]={...old,attempts:state.attempt};soloWriteRecords(all);return state;}
function soloRecordResult(state){
    const result=state.kind==="daily"?dailyPickScore(state):puzzleScore(state),all=soloRecords(),key=soloRecordKey(state),old=all[key]||{attempts:state.attempt||1,score:0,grade:"D",squad:null,complete:false},rank=grade=>["D","C","B","A","S","S+"].indexOf(grade);
    const better=state.kind==="daily"?result.score>old.score:!old.squad||result.complete&&!old.complete||result.complete===old.complete&&(rank(result.grade)>rank(old.grade)||result.grade===old.grade&&result.score>old.score);
    if(better)all[key]={...old,score:result.score,grade:result.grade,squad:soloSquad(state),complete:result.complete};else all[key]=old;
    soloWriteRecords(all);return result;
}

function normalizeDailyCarry(value,date){
    const rule=dailyPickRule(date);if(!replayRecord(value)||![7,8,11,14].includes(value.size)||!Array.isArray(value.ids)||value.ids.length>value.size||new Set(value.ids).size!==value.ids.length||!value.ids.every(id=>Number.isInteger(id)&&rule.pool.includes(id))||!Array.isArray(value.seen)||value.seen.length>48||!value.seen.every(id=>Number.isInteger(id)&&rule.pool.includes(id))||!value.ids.every(id=>value.seen.includes(id))||!Number.isInteger(value.tokens)||value.tokens<0||value.tokens>2||value.captainId!=null&&(!Number.isInteger(value.captainId)||!value.ids.includes(value.captainId)))replayFail("Saved draft is invalid or outdated.");
    return {size:value.size,ids:[...value.ids],seen:[...new Set(value.seen)],tokens:value.tokens,captainId:value.captainId??null};
}
function migrateDailyRun(value){
    const date=soloDate(value.date);if(!Array.isArray(value.actions)||value.actions.length>16||!value.actions.every(a=>replayRecord(a)&&(a.type==="pick"&&Number.isInteger(a.id)||a.type==="reroll")))replayFail("Saved draft is invalid or outdated.");
    const ids=value.actions.filter(a=>a.type==="pick").map(a=>a.id),tokens=2-value.actions.filter(a=>a.type==="reroll").length,seed=dailyPickRule(date).seed,theme=DAILY_PICK_THEMES[seed%10],size=theme.id==="underdog"?[7,8,11][seed%3]:[7,8,11,14][Math.floor(seed/10)%4];
    if(JSON.stringify(ids)!==JSON.stringify(value.ids)||tokens!==value.tokens||!knownFormation(value.formation))replayFail("Saved draft is invalid or outdated.");
    const state=dailyPickNew(date);state.carry=normalizeDailyCarry({size,ids,seen:value.seen,tokens,captainId:value.captain},date);state.ids=[...ids];state.seen=[...state.carry.seen];state.tokens=tokens;state.formation=dailyFormationNames(size)[0];state.chosenFormation=state.formation;Object.assign(state,dailyPickPlan(state));state.captain=state.carry.captainId;state.captain=soloChooseCaptain(state);state.phase=ids.length===size?(value.phase==="result"?"result":"review"):ids.length?"picking":"formation";state.attempt=Number.isInteger(value.attempt)&&value.attempt>0&&value.attempt<=100000?value.attempt:1;return state;
}
function normalizeSoloState(value){
    if(!replayRecord(value)||![1,2].includes(value.v))replayFail("Saved draft is invalid or outdated.");
    if(value.kind==="daily"){
        if(value.v===1)return migrateDailyRun(value);
        let clean=dailyPickNew(soloDate(value.date));
        if(value.carry){clean.carry=normalizeDailyCarry(value.carry,value.date);clean.ids=[...clean.carry.ids];clean.seen=[...clean.carry.seen];clean.tokens=clean.carry.tokens;}
        if(!dailyFormationNames(dailyRuleForState(clean).size).includes(value.chosenFormation))replayFail("This squad uses an unknown formation.");
        clean.formation=value.chosenFormation;clean.chosenFormation=value.chosenFormation;Object.assign(clean,dailyPickPlan(clean));clean.captain=clean.carry?.captainId||null;clean.captain=soloChooseCaptain(clean);
        if(clean.ids.length===dailyRuleForState(clean).size)clean.phase="review";else if(value.phase!=="formation")dailyStartPicks(clean);
        if(!Array.isArray(value.actions)||value.actions.length>16)replayFail("Saved draft is invalid or outdated.");for(const action of value.actions){if(!replayRecord(action))replayFail("Invalid draft action.");dailyPickAction(clean,action);}
        if(clean.phase==="review"){
            const form=dailyFormations(clean).find(f=>f.formation===value.formation);if(!form)replayFail("This squad uses an unknown formation.");Object.assign(clean,{formation:form.formation,assignment:form.assignment});clean.captain=soloChooseCaptain(clean);if(value.phase==="result")clean.phase="result";
        }
        clean.attempt=Number.isInteger(value.attempt)&&value.attempt>0&&value.attempt<=100000?value.attempt:1;return clean;
    }
    if(value.kind==="puzzle"){const m=puzzleMission(value.mission);return puzzleValidate({v:1,kind:"puzzle",mission:m.id,formation:value.formation,assignment:value.assignment,captain:value.captain,ids:[],phase:value.phase==="result"?"result":"building",attempt:Number.isInteger(value.attempt)&&value.attempt>0&&value.attempt<=100000?value.attempt:1});}
    replayFail("Saved draft is invalid or outdated.");
}
function soloLoad(){try{const raw=localStorage.getItem(SOLO_SAVE_KEY);return raw?normalizeSoloState(JSON.parse(raw)):null;}catch{return null;}}
function soloSave(){try{localStorage.setItem(SOLO_SAVE_KEY,JSON.stringify(soloState));return true;}catch{soloStorageFailed=true;return false;}}
