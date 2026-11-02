// v0.7.3 Challenge Lab, Daily Tactical Challenge and the shared puzzle solver.
// Every challenge is an ordinary puzzle mission: the same pricing, positional rules,
// objectives, scoring and records as the curated Draft Challenges.
const LAB_LIBRARY_KEY="bldChallengeLabV1",LAB_CODE_PREFIX="BLDL1";
const LAB_POOLS=Object.freeze({
    all:{label:"ALL PUBLIC PLAYERS",filter:()=>true},
    "no-masters":{label:"NO MASTER STRIKERS",filter:p=>!modeCategory(p,"master-strikers")},
    "under-90":{label:"89 OVR AND BELOW",filter:p=>playerOverall(p)<=89},
    "under-86":{label:"85 OVR AND BELOW",filter:p=>playerOverall(p)<=85},
    "blue-lock":{label:"BLUE LOCK PROJECT ONLY",filter:p=>modeCategory(p,"blue-lock-project")}
});
const LAB_GOAL_TYPES=Object.freeze(["chemistry","minOVR","remaining","nation","categoryMin"]);
// ---------- Solver ----------
// Beam search over open roles. Candidates are natural fits only (the puzzle rule),
// ranked by positional rating and links to the locked core; finished squads are scored
// with puzzleScore itself, so the witness is evaluated exactly like a player's answer.
function puzzleCandidateList(mission,slot,exclude){
    const label=FORMATIONS[mission.formation][slot].label,core=mission.locked.map(s=>playerById(mission.initial[s]));
    return mission.pool.filter(id=>!exclude.has(id)&&canonicalFit(playerById(id),label)).map(id=>{const p=playerById(id),links=core.map(other=>playerChemistry(p,other));const wanted=mission.goals.filter(g=>g.type==="categoryMin"&&modeCategory(p,g.key)||g.type==="nation"&&p.nationality?.code===g.key).length;
        // Required category/nation goals steer the search towards players who count for them.
        return {id,price:puzzlePrice(id),h:playerPositionProfile(p,label).position+(links.length?links.reduce((a,b)=>a+b,0)/links.length-65:0)*.35+wanted*9};}).sort((a,b)=>b.h-a.h||a.id-b.id);
}
function puzzleSolve(mission,{beam=10,perSlot=7,evaluate=12,require=null}={}){
    registerPuzzleMission(mission);
    const shape=FORMATIONS[mission.formation],locked=new Set(mission.locked),open=shape.map((_,i)=>i).filter(i=>!locked.has(i)),lockedIds=new Set(mission.locked.map(slot=>mission.initial[slot]));
    const initial=new Set(Object.values(mission.initial)),cost=id=>initial.has(id)?0:puzzlePrice(id);
    const lists=new Map(open.map(slot=>{const list=puzzleCandidateList(mission,slot,lockedIds),top=list.slice(0,perSlot),cheap=[...list].sort((a,b)=>a.price-b.price||b.h-a.h).slice(0,3),own=mission.initial[slot]!==undefined&&canonicalFit(playerById(mission.initial[slot]),shape[slot].label)?list.filter(c=>c.id===mission.initial[slot]):[];return [slot,[...new Map([...own,...top,...cheap].map(c=>[c.id,c])).values()]];}));
    const order=[...open].sort((a,b)=>lists.get(a).length-lists.get(b).length||a-b);
    const cheapest=order.map(slot=>Math.min(...lists.get(slot).map(c=>cost(c.id)),Infinity));
    let states=[{assignment:Object.fromEntries(mission.locked.map(slot=>[slot,mission.initial[slot]])),used:new Set(lockedIds),spend:0,h:0}];
    order.forEach((slot,step)=>{
        const next=[],restMin=cheapest.slice(step+1).reduce((a,b)=>a+b,0);
        for(const state of states)for(const c of lists.get(slot)){
            if(state.used.has(c.id))continue;const spend=state.spend+cost(c.id);if(spend+restMin>mission.budget)continue;
            next.push({assignment:{...state.assignment,[slot]:c.id},used:new Set([...state.used,c.id]),spend,h:state.h+c.h});
        }
        states=next.sort((a,b)=>b.h-a.h||a.spend-b.spend).slice(0,beam);
    });
    let best=null;
    // Replacement limits are enforced by puzzleValidate, exactly as for a player's answer.
    for(const candidate of states.slice(0,evaluate)){
        let state;try{state=puzzleValidate({v:1,kind:"puzzle",mission:mission.id,formation:mission.formation,assignment:candidate.assignment,captain:mission.captain,ids:[],phase:"building"});}catch{continue;}
        if(mission.captain==null)state.captain=soloChooseCaptain(state);
        const result=puzzleScore(state);if(!result.complete||require&&!require(result,state))continue;
        if(!best||result.score>best.result.score)best={state,result};
    }
    return best;
}
// ---------- Daily Tactical Challenge ----------
const TACTIC_TEMPLATES=Object.freeze([
    {id:"final-pieces",title:"FINAL PIECES",description:"Nine starters are locked. Sign the last two within budget.",open:2,budget:500,category:"Tactical"},
    {id:"budget-crunch",title:"BUDGET CRUNCH",description:"Three roles are open and the budget is tight. Every dollar counts.",open:3,budget:550,category:"Budget"},
    {id:"repair-job",title:"REPAIR JOB",description:"Two starters are out of position. Make at most two replacements.",open:0,budget:700,category:"Tactical"},
    {id:"chemistry-call",title:"CHEMISTRY CALL",description:"Three roles are open. Find the partners who lift the team's chemistry.",open:3,budget:900,category:"Chemistry"}
]);
const tacticCache=new Map();
function tacticBaseXI(formation,pool,random){
    const shape=FORMATIONS[formation],assignment={},used=new Set();
    for(const [slot,s] of shape.entries()){
        const options=pool.filter(id=>!used.has(id)&&canonicalFit(playerById(id),s.label)&&playerOverall(playerById(id))>=76&&playerOverall(playerById(id))<=93);if(!options.length)return null;
        const id=options[Math.floor(random()*options.length)];assignment[slot]=id;used.add(id);
    }
    return assignment;
}
function dailyTacticMission(date=localDraftDate()){
    const day=soloDate(typeof date==="string"?date:localDraftDate(date)),key=SQUAD_BALANCE_REVISION+":"+day;
    if(tacticCache.has(key))return tacticCache.get(key);
    const number=dailyDayNumber(day),template=TACTIC_TEMPLATES[dailyRotation(TACTIC_TEMPLATES.length,number,"BLD-tactic-v073").index],pool=challengePool(),formations=Object.keys(FORMATIONS);
    let mission=null;
    for(let attempt=0;attempt<12&&!mission;attempt++){
        const random=duelRandom(replayHash("BLD-tactic:"+day+":"+attempt)),formation=formations[Math.floor(random()*formations.length)],base=tacticBaseXI(formation,pool,random);if(!base)continue;
        const shape=FORMATIONS[formation],outfield=shape.map((_,i)=>i).filter(i=>shape[i].label!=="GK");
        const pickSlots=count=>{const slots=[...outfield],out=[];while(out.length<count&&slots.length)out.push(slots.splice(Math.floor(random()*slots.length),1)[0]);return out;};
        const draft={id:"tactic:"+day,kind:"tactic",template:template.id,title:template.title,description:template.description,formation,budget:template.budget,initial:{...base},locked:[],captain:null,goals:[],bonus:[],difficulty:"normal",category:template.category,pool:[...pool],replacements:null};
        if(template.id==="repair-job"){
            // Swap two starters from different lines into each other's roles; seven others stay locked.
            const groups=outfield.filter(i=>outfield.some(j=>positionGroup(shape[j].label)!==positionGroup(shape[i].label)));const a=groups[Math.floor(random()*groups.length)],b=groups.filter(j=>positionGroup(shape[j].label)!==positionGroup(shape[a].label))[0];
            if(a===undefined||b===undefined)continue;[draft.initial[a],draft.initial[b]]=[draft.initial[b],draft.initial[a]];
            if(canonicalFit(playerById(draft.initial[a]),shape[a].label)||canonicalFit(playerById(draft.initial[b]),shape[b].label))continue;
            const extra=outfield.filter(i=>i!==a&&i!==b).sort(()=>random()-.5).slice(0,2);draft.locked=shape.map((_,i)=>i).filter(i=>![a,b,...extra].includes(i));draft.replacements=2;
        }else{
            const open=pickSlots(template.open);for(const slot of open)delete draft.initial[slot];draft.locked=Object.keys(draft.initial).map(Number);
        }
        draft.captain=null;
        // Solve without goals first, then set the goals from the solver's witness.
        const witness=puzzleSolve({...draft,bonus:[]},{beam:14,perSlot:8,evaluate:14});if(!witness)continue;
        const ovr=witness.result.snap.ovr,chem=witness.result.snap.chemistry.overall,left=draft.budget-puzzleSpend(witness.state);
        // Required goals sit just below the witness; bonus goals ask for the witness itself.
        const spare=left>=50?{type:"remaining",target:Math.min(200,left-left%50)}:null;
        if(template.id==="final-pieces"){draft.goals=[{type:"chemistry",target:Math.max(60,chem-2)}];draft.bonus=[{type:"minOVR",target:ovr},spare||{type:"chemistry",target:chem}];}
        else if(template.id==="budget-crunch"){draft.goals=[{type:"minOVR",target:Math.max(70,ovr-1)}];draft.bonus=[{type:"chemistry",target:chem},spare||{type:"minOVR",target:ovr}];}
        else if(template.id==="repair-job"){draft.goals=[{type:"chemistry",target:Math.max(60,chem-3)}];draft.bonus=[{type:"minOVR",target:ovr},spare||{type:"chemistry",target:chem}];}
        else {draft.goals=[{type:"chemistry",target:Math.max(60,chem-2)}];draft.bonus=[{type:"chemistry",target:chem},{type:"minOVR",target:ovr}];}
        registerPuzzleMission(draft);
        // The witness must satisfy every required goal; the generated mission is rejected otherwise.
        const check=puzzleScore({...witness.state,mission:draft.id});if(!check.complete)continue;
        draft.witness=Object.entries(witness.state.assignment).map(([slot,id])=>[Number(slot),id]);mission=Object.freeze(draft);
    }
    if(!mission)replayFail("Invalid challenge rules.");
    registerPuzzleMission(mission);if(tacticCache.size>40)tacticCache.clear();tacticCache.set(key,mission);return mission;
}
// ---------- Challenge Lab ----------
function labCleanTitle(value){if(typeof value!=="string")replayFail("Invalid challenge rules.");const title=value.replace(/[\u0000-\u001f\u007f<>]/g,"").replace(/\s+/g," ").trim();if(!title||title.length>40)replayFail("Give the challenge a title of up to 40 characters.");return title;}
function labGoal(goal,rule){
    if(!replayRecord(goal)||!LAB_GOAL_TYPES.includes(goal.type)||!Number.isInteger(goal.target))replayFail("Invalid challenge rules.");
    const clean={type:goal.type,target:goal.target};
    if(goal.type==="chemistry"&&(goal.target<50||goal.target>99)||goal.type==="minOVR"&&(goal.target<60||goal.target>99)||goal.type==="remaining"&&(goal.target<0||goal.target>rule.budget))replayFail("Invalid challenge rules.");
    if(goal.type==="nation"){if(typeof goal.key!=="string"||!/^[A-Z]{2}$/.test(goal.key)||!challengePool().some(id=>playerById(id).nationality?.code===goal.key)||goal.target<1||goal.target>11)replayFail("Invalid challenge rules.");clean.key=goal.key;}
    if(goal.type==="categoryMin"){if(typeof goal.key!=="string"||!Object.hasOwn(PLAYER_POOL_CATEGORIES,goal.key)||goal.target<1||goal.target>11)replayFail("Invalid challenge rules.");clean.key=goal.key;}
    return clean;
}
// Converts untrusted Lab settings into a puzzle mission. Secret characters are never accepted.
function labMission(value){
    if(!replayRecord(value)||value.v!==1)replayFail("Invalid or outdated code.");
    const title=labCleanTitle(value.title);
    if(typeof value.formation!=="string"||!Object.hasOwn(FORMATIONS,value.formation))replayFail("This squad uses an unknown formation.");
    if(!Number.isInteger(value.budget)||value.budget<300||value.budget>6000||value.budget%50)replayFail("Invalid challenge rules.");
    if(!Object.hasOwn(LAB_POOLS,value.pool))replayFail("Invalid challenge rules.");
    const ids=list=>Array.isArray(list)&&list.every(Number.isInteger)&&new Set(list).size===list.length;
    if(!ids(value.banned)||value.banned.length>8)replayFail("Invalid challenge rules.");
    if(!Array.isArray(value.locked)||value.locked.length>10)replayFail("Invalid challenge rules.");
    for(const id of [...value.banned,...value.locked.map(pair=>Array.isArray(pair)?pair[1]:null)]){const p=Number.isInteger(id)?playerById(id):null;if(!p)replayFail("This squad contains a missing player.");if(p.secretCharacter)replayFail("This squad contains a missing player.");}
    const shape=FORMATIONS[value.formation],banned=new Set(value.banned),pool=challengePool().filter(id=>LAB_POOLS[value.pool].filter(playerById(id))&&!banned.has(id));
    const initial={};
    for(const pair of value.locked){
        if(!Array.isArray(pair)||pair.length!==2||!Number.isInteger(pair[0])||pair[0]<0||pair[0]>=shape.length||Object.hasOwn(initial,pair[0])||Object.values(initial).includes(pair[1]))replayFail("Invalid squad positions.");
        if(!pool.includes(pair[1]))replayFail("Locked players must be in the challenge pool.");
        if(!canonicalFit(playerById(pair[1]),shape[pair[0]].label))replayFail("Choose a player who fits this position.");
        initial[pair[0]]=pair[1];
    }
    if(value.captain!==null&&(!Number.isInteger(value.captain)||!Object.values(initial).includes(value.captain)))replayFail("Invalid squad captain.");
    if(!Array.isArray(value.goals)||value.goals.length>4||!Array.isArray(value.bonus)||value.bonus.length>3)replayFail("Invalid challenge rules.");
    const rule={budget:value.budget},goals=value.goals.map(goal=>labGoal(goal,rule)),bonus=value.bonus.map(goal=>labGoal(goal,rule));
    const canonical={v:1,title,formation:value.formation,budget:value.budget,pool:value.pool,banned:[...value.banned].sort((a,b)=>a-b),locked:Object.entries(initial).map(([slot,id])=>[Number(slot),id]).sort((a,b)=>a[0]-b[0]),captain:value.captain,goals,bonus};
    const id="lab:"+replayHash(JSON.stringify(canonical)).toString(36);
    return {id,kind:"lab",title,description:"",formation:value.formation,budget:value.budget,initial,locked:Object.keys(initial).map(Number),captain:value.captain,goals,bonus,difficulty:"custom",category:"Lab",pool,replacements:null,settings:canonical};
}
function labEncode(settings){const m=labMission(settings),s=m.settings;return replayCode(LAB_CODE_PREFIX,[1,s.title,s.formation,s.budget,s.pool,s.banned,s.locked,s.captain,s.goals.map(g=>[g.type,g.target,g.key??null]),s.bonus.map(g=>[g.type,g.target,g.key??null])]);}
function labDecode(code){
    const value=replayDecode(typeof code==="string"?code.trim():code,LAB_CODE_PREFIX);
    if(!Array.isArray(value)||value.length!==10||value[0]!==1||!Array.isArray(value[8])||!Array.isArray(value[9]))replayFail("Invalid or outdated code.");
    const goal=item=>{if(!Array.isArray(item)||item.length!==3)replayFail("Invalid challenge rules.");return item[2]===null?{type:item[0],target:item[1]}:{type:item[0],target:item[1],key:item[2]};};
    return {v:1,title:value[1],formation:value[2],budget:value[3],pool:value[4],banned:value[5],locked:value[6],captain:value[7],goals:value[8].map(goal),bonus:value[9].map(goal)};
}
const labFeasibilityCache=new Map();
// Proves a challenge can be completed before it is exported or played.
function labFeasible(mission){
    if(labFeasibilityCache.has(mission.id))return labFeasibilityCache.get(mission.id);
    if(mission.locked.length>=11){labFeasibilityCache.set(mission.id,null);return null;}
    const witness=puzzleSolve(mission,{beam:16,perSlot:8,evaluate:16});
    if(labFeasibilityCache.size>30)labFeasibilityCache.clear();labFeasibilityCache.set(mission.id,witness);return witness;
}
function labRegisterCode(code){
    const mission=labMission(labDecode(code));mission.code=labEncode(mission.settings);
    if(!labFeasible(mission))replayFail("This challenge has no valid solution.");
    return registerPuzzleMission(Object.freeze(mission));
}
function labLibrary(){
    try{const raw=JSON.parse(localStorage.getItem(LAB_LIBRARY_KEY)||'{"v":1,"items":[]}');if(!replayRecord(raw)||raw.v!==1||!Array.isArray(raw.items))return [];
        const items=[];for(const item of raw.items.slice(0,20)){try{if(!replayRecord(item)||typeof item.code!=="string"||item.code.length>2000)continue;const mission=labMission(labDecode(item.code));items.push({code:item.code,id:mission.id,title:mission.title,formation:mission.formation,mine:item.mine===true});}catch{}}
        return items;}catch{return [];}
}
function labSaveToLibrary(code,mine=false){
    const mission=labMission(labDecode(code)),items=labLibrary().filter(item=>item.id!==mission.id);
    items.unshift({code,id:mission.id,title:mission.title,formation:mission.formation,mine});
    try{localStorage.setItem(LAB_LIBRARY_KEY,JSON.stringify({v:1,items:items.slice(0,20).map(item=>({code:item.code,mine:item.mine}))}));return true;}catch{replayFail("Storage is full or unavailable. Export a squad code instead.");}
}
function labRemoveFromLibrary(id){const items=labLibrary().filter(item=>item.id!==id);try{localStorage.setItem(LAB_LIBRARY_KEY,JSON.stringify({v:1,items:items.map(item=>({code:item.code,mine:item.mine}))}));}catch{}}
