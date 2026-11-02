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
function dailyLegacyRule(date=localDraftDate()){
    const day=soloDate(typeof date==="string"?date:localDraftDate(date)),seed=replayHash("BLD-picks-v0721:"+day),theme=DAILY_PICK_THEMES[seed%DAILY_PICK_THEMES.length];
    const size=theme.id==="underdog"?[7,8,9,10,11][seed%5]:[7,8,9,10,11,14][Math.floor(seed/10)%6];
    let pool=challengePool().filter(id=>theme.id!=="underdog"||playerOverall(playerById(id))<=89);
    if(theme.id==="crisis")pool=pool.filter(id=>![26,29,33,43].includes(id));
    // Keep enough distinct choices for the largest run, including both token rerolls.
    return {...theme,date:day,seed,size,tokens:2,pool};
}
// v0.7.3 Daily rules: each date adds one validated mechanical rule to its theme.
// A run records the rule revision it started with, so older runs replay unchanged.
const DAILY_RULES_V3_FROM="2026-11-02";
const DAILY_MODIFIERS=Object.freeze([
    {id:"deep-scout",title:"DEEP SCOUTING",description:"Four players are offered every round, but there are no rerolls.",offers:4,tokens:0},
    {id:"salary-cap",title:"SALARY CAP",description:"Every player has a price. Finish the squad without breaking the cap.",tokens:2,scoring:{quality:1.07,balance:1.08}},
    {id:"locked-captain",title:"LOCKED CAPTAIN",description:"{player} starts in your squad and wears the armband.",tokens:2},
    {id:"elite-cap",title:"ELITE CAP",description:"Only one player rated 90 or higher may join your squad.",tokens:2},
    {id:"natural-roles",title:"NATURAL ROLES",description:"Squad balance is worth more today. Only natural roles count.",tokens:2,scoring:{quality:.82,balance:1.5}},
    {id:"chemistry-first",title:"CHEMISTRY FIRST",description:"Chemistry is worth more today. Individual quality is worth less.",tokens:2,scoring:{quality:.8,chemistry:1.4}},
    {id:"extra-scouting",title:"EXTRA SCOUTING",description:"Four Ego Tokens today. Chase the perfect squad.",tokens:4},
    {id:"head-start",title:"HEAD START",description:"Two players are already signed. Complete the team around them.",tokens:2},
    {id:"fixed-shape",title:"FIXED SHAPE",description:"One formation today. Build for it from the first pick.",tokens:2}
]);
// Pairs that would be redundant or contradictory. Every theme keeps several valid rules.
const DAILY_MODIFIER_CONFLICTS=Object.freeze({underdog:["elite-cap"],king:["elite-cap","locked-captain"],chemistry:["chemistry-first"],chaos:["natural-roles"],crisis:["natural-roles"]});
function dailyDayNumber(day){return Math.floor(Date.parse(day+"T00:00:00Z")/86400000);}
function dailyDayString(number){return new Date(number*86400000).toISOString().slice(0,10);}
// Shuffled blocks: every entry appears once per block and a block never starts with the previous block's last entry.
function dailyRotation(length,dayNumber,salt){
    const order=block=>{const list=seededDraftShuffle([...Array(length).keys()],replayHash(salt+":"+block));if(block>0){const previous=seededDraftShuffle([...Array(length).keys()],replayHash(salt+":"+(block-1)));if(list[0]===previous[length-1])[list[0],list[1]]=[list[1],list[0]];}return list;};
    const block=Math.floor(dayNumber/length),list=order(block);return {list,index:list[((dayNumber%length)+length)%length]};
}
function dailyThemeV3(dayNumber){return DAILY_PICK_THEMES[dailyRotation(DAILY_PICK_THEMES.length,dayNumber,"BLD-theme-v073").index];}
const dailyModifierCache=new Map();
function dailyModifierV3(dayNumber,depth=0){
    if(dailyModifierCache.has(dayNumber))return dailyModifierCache.get(dayNumber);
    const theme=dailyThemeV3(dayNumber),{list,index}=dailyRotation(DAILY_MODIFIERS.length,dayNumber,"BLD-rule-v073"),blocked=new Set(DAILY_MODIFIER_CONFLICTS[theme.id]||[]);
    const previous=depth<14?dailyModifierV3(dayNumber-1,depth+1).id:null,start=list.indexOf(index);
    let chosen=null;for(let step=0;step<list.length&&!chosen;step++){const candidate=DAILY_MODIFIERS[list[(start+step)%list.length]];if(!blocked.has(candidate.id)&&candidate.id!==previous)chosen=candidate;}
    if(depth===0){if(dailyModifierCache.size>800)dailyModifierCache.clear();dailyModifierCache.set(dayNumber,chosen);}
    return chosen;
}
function dailyPrice(id){return puzzlePrice(id);}
function dailyV3Rule(date=localDraftDate()){
    const day=soloDate(typeof date==="string"?date:localDraftDate(date)),number=dailyDayNumber(day),seed=replayHash("BLD-picks-v073:"+day),theme=dailyThemeV3(number),modifier=dailyModifierV3(number);
    const size=[7,8,9,9,10,11,11,14][Math.floor(seed/7)%8];
    let pool=challengePool().filter(id=>theme.id!=="underdog"||playerOverall(playerById(id))<=89);
    if(theme.id==="crisis")pool=pool.filter(id=>![26,29,33,43].includes(id));
    const formations=modifier.id==="fixed-shape"?[dailyFormationNames(size)[seed%dailyFormationNames(size).length]]:dailyFormationNames(size);
    const rank=list=>[...list].sort((a,b)=>replayHash(seed+":"+a)-replayHash(seed+":"+b));
    let start=[],captainId=null,cap=null;
    if(modifier.id==="locked-captain"){const star=rank(pool.filter(id=>{const p=playerById(id);return playerOverall(p)>=88&&playerOverall(p)<94&&!canonicalFit(p,"GK");}))[0];start=[star];captainId=star;}
    if(modifier.id==="head-start"){const defender=rank(pool.filter(id=>{const p=playerById(id);return positionGroup(primaryPosition(p))==="DEFENCE"&&playerOverall(p)>=80&&playerOverall(p)<=89;}))[0],attacker=rank(pool.filter(id=>{const p=playerById(id);return positionGroup(primaryPosition(p))==="ATTACK"&&!canonicalFit(p,"GK")&&playerOverall(p)>=80&&playerOverall(p)<=89;}))[0];start=[defender,attacker].filter(Number.isInteger);}
    if(modifier.id==="salary-cap")cap=Math.round(size*235/50)*50;
    return {...theme,date:day,seed,size,tokens:modifier.tokens,offers:modifier.offers||3,pool,rules:3,modifier:{id:modifier.id,title:modifier.title,description:modifier.description},scoring:{quality:1,chemistry:1,objective:1,balance:1,...(modifier.scoring||{})},formations,start,captainId,cap,eliteCap:modifier.id==="elite-cap"?90:null};
}
function dailyRevisionForDate(date){return soloDate(typeof date==="string"?date:localDraftDate(date))>=DAILY_RULES_V3_FROM?3:2;}
function dailyPickRule(date=localDraftDate()){const day=soloDate(typeof date==="string"?date:localDraftDate(date));return dailyRevisionForDate(day)===3?dailyV3Rule(day):dailyLegacyRule(day);}
function dailyRuleForState(state){
    if(state.rules===3)return dailyV3Rule(state.date);
    const rule={...dailyLegacyRule(state.date),offers:3,rules:2,modifier:null,scoring:{quality:1,chemistry:1,objective:1,balance:1},start:[],captainId:null,cap:null,eliteCap:null};
    if(state.carry)rule.size=state.carry.size;rule.formations=dailyFormationNames(rule.size);return rule;
}
function dailyModifierText(rule){if(!rule.modifier)return "";return replayText(rule.modifier.description,{player:rule.captainId?playerById(rule.captainId).name:""});}
function dailySpend(state){const rule=dailyRuleForState(state),start=new Set(rule.start||[]);return state.ids.filter(id=>!start.has(id)).reduce((sum,id)=>sum+dailyPrice(id),0);}
function dailyBudgetLeft(state){const rule=dailyRuleForState(state);return rule.cap==null?null:rule.cap-dailySpend(state);}
function dailyCaptain(state){const rule=dailyRuleForState(state);return rule.captainId&&state.ids.includes(rule.captainId)?rule.captainId:soloChooseCaptain(state);}
function dailyPickNew(date=localDraftDate(),revision=null){
    const day=soloDate(typeof date==="string"?date:localDraftDate(date)),rules=revision||dailyRevisionForDate(day),state={v:2,balanceRevision:SQUAD_BALANCE_REVISION,kind:"daily",date:day,ids:[],seen:[],actions:[],tokens:2,chosenFormation:null,formation:null,assignment:{},captain:null,phase:"formation",attempt:0};
    if(rules===3)state.rules=3;const rule=dailyRuleForState(state),formation=rule.formations[0];
    Object.assign(state,{ids:[...rule.start],seen:[...rule.start],tokens:rule.tokens,chosenFormation:formation,formation});
    if(rule.start.length){Object.assign(state,dailyPickPlan(state));state.captain=dailyCaptain(state);}
    return state;
}
function dailyPickPlan(state,formation=state.formation){
    return soloWithTeam(state,()=>{
        const shape=formationShape(formation),slots=shape.map((_,i)=>i),assignment=cpuAssignment(standaloneBuilderTeam.players,shape,slots),used=new Set(Object.values(assignment)),remaining=state.ids.filter(id=>!used.has(id));
        for(const slot of slots)if(!assignment[slot]&&remaining.length)assignment[slot]=remaining.shift();
        return {formation,assignment};
    });
}
function dailyStartPicks(state){if(state.kind!=="daily"||state.phase!=="formation"||!dailyRuleForState(state).formations.includes(state.formation))replayFail("Invalid draft action.");state.chosenFormation=state.formation;state.phase="picking";if(state.ids.length){Object.assign(state,dailyPickPlan(state));state.captain=dailyCaptain(state);}return state;}
function dailyPickWeight(p,rule,state){
    const s=playerStats(p),links=state.ids.map(id=>playerChemistry(p,playerById(id))),chem=links.length?Math.max(...links):72;
    switch(rule.id){case "speed":return 1+Math.max(0,s.spd-70)/4;case "core":return modeCategory(p,"blue-lock-project")?7:1;case "world":return p.nationality?.code!=="JP"&&playerOverall(p)>=90?7:1;case "chemistry":return 1+Math.max(0,chem-70)/3;case "wall":return 1+Math.max(0,s.def-65)/4;case "creative":return 1+Math.max(0,(s.pas+s.dri)/2-70)/4;case "crisis":return cpuPlayerRoles(p).includes("ATT")?4:1;default:return 1;}
}
function dailyPickOptions(state){
    const rule=dailyRuleForState(state);if(state.ids.length>=rule.size)return [];
    let available=rule.pool.map(playerById).filter(p=>!state.seen.includes(p.id)&&!state.ids.includes(p.id));const round=state.ids.length-(rule.start?.length||0),offers=rule.offers||3;
    const allowed=list=>{
        // Elite cap: once one 90+ player is owned, no further 90+ offers appear.
        if(rule.eliteCap&&state.ids.some(id=>playerOverall(playerById(id))>=rule.eliteCap))list=list.filter(p=>playerOverall(p)<rule.eliteCap);
        // Salary cap: an offer must leave enough for the cheapest possible completion of every remaining pick.
        if(rule.cap!=null){const left=dailyBudgetLeft(state),after=rule.size-state.ids.length-1,prices=rule.pool.filter(id=>!state.ids.includes(id)).map(dailyPrice).sort((a,b)=>a-b);list=list.filter(p=>{const reserve=[...prices];const index=reserve.indexOf(dailyPrice(p.id));if(index>=0)reserve.splice(index,1);return dailyPrice(p.id)+reserve.slice(0,after).reduce((sum,v)=>sum+v,0)<=left;});}
        return list;
    };
    available=allowed(available);
    // v0.7.3 rules: a short market may bring back earlier unpicked players, never the previous round's offers.
    if(rule.rules===3&&available.length<offers+2){const recent=new Set(state.seen.slice(-offers)),returning=allowed(rule.pool.filter(id=>state.seen.includes(id)&&!state.ids.includes(id)&&!recent.has(id)).map(playerById));available=[...available,...returning.filter(p=>!available.some(other=>other.id===p.id))];}
    // The superstar theme has one elite offer round; unused elite cards cannot return.
    const kingRound=rule.id==="king"&&round===Math.min(2,rule.size-(rule.start?.length||0)-1);
    let pool=available.filter(p=>rule.id!=="king"||kingRound||playerOverall(p)<94);
    let h=replayHash((rule.rules===3?"v073:":"v0722:")+rule.seed+":"+state.chosenFormation+":"+round+":"+state.actions.length+":"+state.ids.join(","));const random=()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/4294967296;};
    const chosen=[],take=list=>{if(!list.length)return;let total=list.reduce((sum,p)=>sum+dailyPickWeight(p,rule,state),0),value=random()*total;const p=list.find(p=>(value-=dailyPickWeight(p,rule,state))<=0)||list.at(-1);chosen.push(p);pool=pool.filter(other=>other.id!==p.id);};
    if(kingRound){take(pool.filter(p=>playerOverall(p)>=94));pool=pool.filter(p=>playerOverall(p)<94);}
    const plan=dailyPickPlan(state),shape=formationShape(plan.formation),slots=shape.map((_,i)=>i),gaps=slots.filter(i=>!plan.assignment[i]||!canonicalFit(playerById(plan.assignment[i]),shape[i].label));
    const need=gaps.sort((a,b)=>pool.filter(p=>canonicalFit(p,shape[a].label)).length-pool.filter(p=>canonicalFit(p,shape[b].label)).length)[0];
    if(chosen.length<2&&need!==undefined&&(random()<.72||rule.size-state.ids.length<=2))take(pool.filter(p=>canonicalFit(p,shape[need].label)));
    while(chosen.length<offers&&pool.length)take(pool);
    return chosen.map(p=>p.id);
}
function dailyPickAction(state,action){
    if(state.kind!=="daily"||state.phase!=="picking")replayFail("Invalid draft action.");const options=dailyPickOptions(state);if(!options.length)replayFail("Invalid draft action.");
    if(action.type==="reroll"){if(!state.tokens)replayFail("No Ego Tokens left.");state.tokens--;}
    else if(action.type==="pick"&&Number.isInteger(action.id)&&options.includes(action.id))state.ids.push(action.id);
    else replayFail("Invalid draft action.");
    state.seen.push(...options);state.actions.push(action.type==="pick"?{type:"pick",id:action.id}:{type:"reroll"});
    Object.assign(state,dailyPickPlan(state));state.captain=dailyCaptain(state);
    if(state.ids.length===dailyRuleForState(state).size){state.phase="review";const best=dailyFormations(state).find(f=>f.formation===state.formation);if(best)Object.assign(state,{assignment:best.assignment});state.captain=dailyCaptain(state);}
    return state;
}
const dailyFormationCache=new Map();
function dailyFormations(state){
    const rule=dailyRuleForState(state),key=SQUAD_BALANCE_REVISION+":"+state.ids.join(",")+":"+state.captain+":"+rule.size+":"+rule.formations.join("|");
    if(dailyFormationCache.has(key))return dailyFormationCache.get(key).map(f=>({...f,assignment:{...f.assignment}}));
    const result=soloWithTeam(state,()=>rule.formations.map(formation=>{
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
function dailyPickScore(state){const snap=soloSnapshot(state),goal=dailyObjective(state,snap),slots=Math.min(11,dailyRuleForState(state).size),fit=soloFitCount(snap),w=dailyRuleForState(state).scoring,components=[{label:"TEAM QUALITY",value:Math.round(qualityScore(snap.positionOvr)*52*w.quality)},{label:"CHEMISTRY",value:Math.round(boundedNumber((snap.contribution.chemistryImpact+3)/7,0,1)*2500*w.chemistry)},{label:"DAILY OBJECTIVE",value:Math.round(Math.min(1,goal.current/Math.max(1,goal.target))*1400*w.objective)},{label:"SQUAD BALANCE",value:Math.round(fit/slots*1900*w.balance)}],score=components.reduce((sum,c)=>sum+c.value,0),complete=state.ids.length===dailyRuleForState(state).size,[grade,gradeLabel]=modeGrade(score,complete&&fit>=Math.ceil(slots*.7)&&canonicalFit(playerById(state.assignment[0]),"GK"));return {snap,goal,components,score,grade,gradeLabel,complete};}
// Fixed mission recipes: canonical player IDs, fixed formations and visible acquisition costs.
function puzzleMissions(){
    const full=challengePool(),budgetPool=full.filter(id=>playerOverall(playerById(id))<=89),base=[8,33,40,16,26,20,28,27,7,15,29,24,4,23,9,39,42,43,45,41,78,74,49,50,51,56,30,22,25,48];
    const mission=(id,title,description,formation,budget,initial,locked,captain,goals=[],bonus=[],options={})=>({id,title,description,formation,budget,initial,locked,captain,goals,bonus,difficulty:"normal",pool:[...new Set([...base,...Object.values(initial)])],...options});
    return [
        mission("king-system","THE KING'S SYSTEM","Barou, Aiku and Niko are locked in. Complete their 4-3-3.","4-3-3",3600,{2:40,3:16,9:15},[2,3,9],15,[],[{type:"chemistry",target:80},{type:"remaining",target:1200}],{category:"Character",difficulty:"hard"}),
        mission("kaiser-links","KAISER'S EMPIRE","Kaiser, Ness and Grim need a supporting cast. Connect the team.","4-2-3-1",3400,{7:51,8:50,10:49},[7,8,10],49,[{type:"chemistry",target:76}],[{type:"chemistry",target:84}],{category:"Chemistry",difficulty:"hard"}),
        mission("budget-rescue","BUDGET RESCUE","A strong core is paid for. Finish the team with limited funds.","3-4-3",1600,{0:8,1:40,5:27,6:28,9:23},[0,1,5,6,9],23,[],[{type:"minOVR",target:84},{type:"remaining",target:300}],{category:"Budget",difficulty:"hard",pool:[...base,13,19,2,18]}),
        mission("fix-team","FIX THE TEAM","Two starters are out of position. Replace at most two players.","3-4-3",1000,{0:8,1:1,2:49,3:24,4:4,5:27,6:28,7:20,8:7,9:23,10:15},[0,5,6,9],23,[],[{type:"remaining",target:400}],{category:"Tactical",replacements:2,difficulty:"normal"}),
        mission("chemistry-lab","CHEMISTRY LAB","The core stays together. Find the partners who complete it.","3-4-3",4000,{4:4,5:27,7:20,8:7,9:23},[4,5,7,8,9],23,[{type:"chemistry",target:80}],[{type:"chemistry",target:86}],{category:"Expert",difficulty:"extreme",pool:full.filter(id=>!modeCategory(playerById(id),"master-strikers"))}),
        mission("no-headlines","NO SUPERSTARS","No elite shortcuts. Build a balanced XI from this restricted pool.","4-4-2",3200,{0:39,2:16},[0,2],16,[{type:"minOVR",target:78}],[{type:"chemistry",target:82}],{category:"Restricted",pool:budgetPool,difficulty:"normal"}),
        mission("missing-piece","ONE MISSING PIECE","Ten starters are locked. Choose the final centre-back.","3-4-3",500,{0:8,1:40,3:24,4:4,5:27,6:28,7:20,8:7,9:23,10:15},[0,1,3,4,5,6,7,8,9,10],23,[],[{type:"chemistry",target:82},{type:"remaining",target:250}],{category:"Tactical",pool:[8,40,24,4,27,28,20,7,23,15,16,56,78,41,74],difficulty:"easy"}),
        mission("national-project","NATIONAL PROJECT","Keep the Japanese core and finish with at least nine Japanese players.","4-3-3",3500,{0:8,2:40,3:16,6:27},[0,2,3,6],40,[{type:"nation",key:"JP",target:9}],[{type:"chemistry",target:84}],{category:"Restricted",difficulty:"normal"}),
        mission("rival-system","RIVAL SYSTEM","Isagi and Kaiser share the attack. Make their whole team connect.","4-4-2",3200,{0:8,2:40,9:1,10:49},[0,2,9,10],1,[{type:"chemistry",target:78}],[{type:"player",id:50,target:1},{type:"remaining",target:800}],{category:"Character",difficulty:"hard"}),
        mission("formation-code","FORMATION CODE","The 5-2-3 is fixed. Every starter needs a demonstrated role.","5-2-3",3500,{0:8,3:40,6:27,9:23},[0,3,6,9],40,[],[{type:"minOVR",target:87},{type:"remaining",target:1000}],{category:"Formation",difficulty:"hard"}),
        // v0.7.3 additions: each introduces a decision the original ten do not ask for.
        mission("back-five","THE BACK FIVE","Renoir and Kaiser are signed. Find five defenders for a 5-3-2.","5-3-2",2600,{0:59,10:49},[0,10],49,[{type:"minOVR",target:87}],[{type:"chemistry",target:76},{type:"remaining",target:200}],{category:"Formation",difficulty:"hard"}),
        mission("world-stage","WORLD STAGE","Isagi needs world-class company. Sign at least three New Generation XI players.","4-3-3",3400,{0:8,9:1},[0,9],1,[{type:"categoryMin",key:"new-gen-11",target:3}],[{type:"minOVR",target:91},{type:"chemistry",target:75}],{category:"Character",difficulty:"normal",pool:full}),
        mission("shoestring","SHOESTRING XI","Kunigami leads a team built on almost nothing. Ten roles, very little money.","4-4-2",1900,{9:6},[9],6,[{type:"minOVR",target:78}],[{type:"chemistry",target:71},{type:"remaining",target:100}],{category:"Budget",difficulty:"hard",pool:full}),
        mission("u20-reunion","U-20 REUNION","Sae calls the original Japan U-20 back. Field at least six of them.","4-2-3-1",2800,{8:14},[8],14,[{type:"categoryMin",key:"original-u20",target:6}],[{type:"chemistry",target:74},{type:"minOVR",target:87}],{category:"Character",difficulty:"normal"}),
        mission("foreign-legion","FOREIGN LEGION","No Japanese players are available. Connect an international 3-4-3.","3-4-3",3300,{0:59},[0],59,[{type:"chemistry",target:71}],[{type:"minOVR",target:90},{type:"remaining",target:300}],{category:"Restricted",difficulty:"normal",pool:full.filter(id=>playerById(id).nationality?.code!=="JP")}),
        mission("banned-stars","BANNED STARS","Every 95+ player is banned. Isagi must lead a team without them.","4-2-3-1",2600,{10:1},[10],1,[{type:"minOVR",target:85}],[{type:"chemistry",target:80},{type:"remaining",target:150}],{category:"Expert",difficulty:"extreme",pool:full.filter(id=>id===1||playerOverall(playerById(id))<95),banned:full.filter(id=>id!==1&&playerOverall(playerById(id))>=95)})
    ];
}
// Generated (Daily Tactical) and imported (Challenge Lab) missions register here and use the same rules.
const PUZZLE_EXTRA_MISSIONS=new Map();
let curatedPuzzleCache=null;
function curatedPuzzleMissions(){return curatedPuzzleCache||(curatedPuzzleCache=puzzleMissions());}
function registerPuzzleMission(mission){PUZZLE_EXTRA_MISSIONS.set(mission.id,mission);if(PUZZLE_EXTRA_MISSIONS.size>40)PUZZLE_EXTRA_MISSIONS.delete(PUZZLE_EXTRA_MISSIONS.keys().next().value);return mission;}
function puzzleMission(id){
    if(typeof id!=="string")replayFail("Invalid challenge rules.");
    const mission=curatedPuzzleMissions().find(m=>m.id===id)||PUZZLE_EXTRA_MISSIONS.get(id)||(id.startsWith("tactic:")&&typeof dailyTacticMission==="function"?dailyTacticMission(id.slice(7)):null);
    if(!mission)replayFail("Invalid challenge rules.");return mission;
}
function puzzleKind(id){return id.startsWith("tactic:")?"tactic":id.startsWith("lab:")?"lab":"curated";}
function puzzlePrice(id){return Math.max(100,Math.round((playerOverall(playerById(id))-60)/5)*50);}
function puzzleNew(id){const m=puzzleMission(id),assignment={...m.initial},state={v:1,kind:"puzzle",mission:id,ids:Object.values(assignment),formation:m.formation,assignment,captain:m.captain,phase:"building"};if(m.code)state.code=m.code;if(m.captain==null)state.captain=Object.keys(assignment).length?soloChooseCaptain(state):null;return state;}
function puzzleSpend(state){const m=puzzleMission(state.mission),initial=new Set(Object.values(m.initial));return state.ids.filter(id=>!initial.has(id)).reduce((sum,id)=>sum+puzzlePrice(id),0);}
function puzzleValidate(state){
    const m=puzzleMission(state.mission);if(state.formation!==m.formation||!replayRecord(state.assignment)||Object.keys(state.assignment).length>11)replayFail("Invalid squad positions.");
    const ids=Object.values(state.assignment);if(new Set(ids).size!==ids.length||ids.some(id=>!Number.isInteger(id)||!m.pool.includes(id)||!playerById(id)||playerById(id).secretCharacter)||Object.keys(state.assignment).some(slot=>!/^([0-9]|10)$/.test(slot)))replayFail("Invalid squad data.");
    if(m.locked.some(slot=>state.assignment[slot]!==m.initial[slot])||m.captain!=null&&state.captain!==m.captain)replayFail("Locked players must stay in their positions.");
    if(m.captain==null&&state.captain!=null&&!ids.includes(state.captain))state.captain=null;
    state.ids=ids;if(puzzleSpend(state)>m.budget)replayFail("Not enough puzzle budget.");if(m.replacements!=null&&Object.values(m.initial).filter(id=>!ids.includes(id)).length>m.replacements)replayFail("Replacement limit reached.");return state;
}
function puzzlePlace(state,slot,id){
    if(state.kind!=="puzzle"||state.phase!=="building"||!Number.isInteger(slot)||slot<0||slot>10)replayFail("Invalid draft action.");const m=puzzleMission(state.mission);if(m.locked.includes(slot))replayFail("Locked players must stay in their positions.");
    const next={...state,assignment:{...state.assignment}};
    if(id===null)delete next.assignment[slot];else{if(!m.pool.includes(id)||!canonicalFit(playerById(id),FORMATIONS[m.formation][slot].label))replayFail("Choose a player who fits this position.");const previous=Object.keys(next.assignment).find(i=>next.assignment[i]===id);if(previous!==undefined){if(m.locked.includes(Number(previous)))replayFail("Locked players must stay in their positions.");delete next.assignment[previous];}next.assignment[slot]=id;}
    const valid=puzzleValidate(next);if(m.captain==null)valid.captain=Object.keys(valid.assignment).length?soloChooseCaptain(valid):null;return valid;
}
function puzzleScore(state){return soloWithTeam(state,()=>{const m=puzzleMission(state.mission),snap=shareFormationSnapshot(0),fit=soloFitCount(snap),valid={label:"POSITIONAL FIT",current:fit,target:11,pass:fit===11&&snap.deployedCount===11},required=[valid,...m.goals.map(o=>modeObjectiveEvaluation(o,standaloneBuilderTeam,snap))],bonus=m.bonus.map(o=>modeObjectiveEvaluation(o,standaloneBuilderTeam,snap)),complete=required.every(g=>g.pass),hits=bonus.filter(g=>g.pass).length,efficiency=(m.budget-puzzleSpend(state))/Math.max(1,m.budget),score=Math.round(qualityScore(snap.positionOvr)*45+boundedNumber((snap.contribution.chemistryImpact+3)/7,0,1)*2500+fit/11*1500+hits/Math.max(1,bonus.length)*1500+efficiency*500),grades=["D","C","B","A","S","S+"],grade=!complete?"D":!bonus.length?(score>=8600?"S+":score>=7900?"S":score>=7000?"A":"B"):hits===0?"C":hits<bonus.length?"B":score>=8600?"S+":score>=7900?"S":"A";return {snap,required,bonus,complete,score,grade,gradeLabel:complete?"CHALLENGE COMPLETE":"MISSION FAILED",components:[{label:"TEAM QUALITY",value:Math.round(qualityScore(snap.positionOvr)*45)},{label:"CHEMISTRY",value:Math.round(boundedNumber((snap.contribution.chemistryImpact+3)/7,0,1)*2500)},{label:"BONUS",value:hits}]};});}
function soloSquad(state){const snap=soloSnapshot(state);return normalizeReplaySquad({v:1,name:snap.team.name,color:snap.team.color,playerIds:[...state.ids],formation:state.formation,assignment:{...state.assignment},captainId:state.captain});}
function soloRecords(){try{const raw=JSON.parse(localStorage.getItem(SOLO_RECORD_KEY)||"{}");if(!replayRecord(raw))return {};const out={};for(const [key,item]of Object.entries(raw).slice(-140)){try{if(!/^(?:daily:\d{4}-\d{2}-\d{2}|puzzle:[a-z-]+|puzzle:tactic:\d{4}-\d{2}-\d{2}|puzzle:lab:[a-z0-9]{1,12})$/.test(key)||!replayRecord(item)||!Number.isInteger(item.attempts)||item.attempts<1||item.attempts>100000||!Number.isInteger(item.score)||item.score<0||item.score>12000||!["S+","S","A","B","C","D"].includes(item.grade))continue;out[key]={...item,complete:item.complete===true,squad:item.squad?normalizeReplaySquad(item.squad):null};}catch{}}return out;}catch{return {};}}
function soloRecordKey(state){return state.kind==="daily"?"daily:"+state.date:"puzzle:"+state.mission;}
function soloWriteRecords(records){try{const entries=Object.entries(records),daily=entries.filter(([key])=>key.startsWith("daily:")).sort(([a],[b])=>b.localeCompare(a)).slice(0,31),puzzles=entries.filter(([key])=>curatedPuzzleMissions().some(m=>key==="puzzle:"+m.id)),tactics=entries.filter(([key])=>key.startsWith("puzzle:tactic:")).sort(([a],[b])=>b.localeCompare(a)).slice(0,31),labs=entries.filter(([key])=>key.startsWith("puzzle:lab:")).slice(-40);localStorage.setItem(SOLO_RECORD_KEY,JSON.stringify(Object.fromEntries([...daily,...puzzles,...tactics,...labs])));return true;}catch{soloStorageFailed=true;return false;}}
function soloBeginAttempt(state){const all=soloRecords(),key=soloRecordKey(state),old=all[key]||{attempts:0,score:0,grade:"D",squad:null,complete:false};state.attempt=Math.min(100000,(old.attempts||0)+1);all[key]={...old,attempts:state.attempt};soloWriteRecords(all);return state;}
function soloRecordResult(state){
    const result=state.kind==="daily"?dailyPickScore(state):puzzleScore(state),all=soloRecords(),key=soloRecordKey(state),old=all[key]||{attempts:state.attempt||1,score:0,grade:"D",squad:null,complete:false},rank=grade=>["D","C","B","A","S","S+"].indexOf(grade);
    const better=state.kind==="daily"?result.score>old.score:!old.squad||result.complete&&!old.complete||result.complete===old.complete&&(rank(result.grade)>rank(old.grade)||result.grade===old.grade&&result.score>old.score);
    if(better)all[key]={...old,score:result.score,grade:result.grade,squad:soloSquad(state),complete:result.complete};else all[key]=old;
    soloWriteRecords(all);
    // v0.7.3: every finished result also updates the local Ego Record.
    result.unlocked=typeof egoRecordEvent==="function"?egoRecordEvent(egoEventFromSolo(state,result)):[];
    return result;
}

function normalizeDailyCarry(value,date){
    const rule=dailyLegacyRule(date);if(!replayRecord(value)||![7,8,9,10,11,14].includes(value.size)||!Array.isArray(value.ids)||value.ids.length>value.size||new Set(value.ids).size!==value.ids.length||!value.ids.every(id=>Number.isInteger(id)&&rule.pool.includes(id))||!Array.isArray(value.seen)||value.seen.length>48||!value.seen.every(id=>Number.isInteger(id)&&rule.pool.includes(id))||!value.ids.every(id=>value.seen.includes(id))||!Number.isInteger(value.tokens)||value.tokens<0||value.tokens>2||value.captainId!=null&&(!Number.isInteger(value.captainId)||!value.ids.includes(value.captainId)))replayFail("Saved draft is invalid or outdated.");
    return {size:value.size,ids:[...value.ids],seen:[...new Set(value.seen)],tokens:value.tokens,captainId:value.captainId??null};
}
function migrateDailyRun(value){
    const date=soloDate(value.date);if(!Array.isArray(value.actions)||value.actions.length>16||!value.actions.every(a=>replayRecord(a)&&(a.type==="pick"&&Number.isInteger(a.id)||a.type==="reroll")))replayFail("Saved draft is invalid or outdated.");
    const ids=value.actions.filter(a=>a.type==="pick").map(a=>a.id),tokens=2-value.actions.filter(a=>a.type==="reroll").length,seed=dailyLegacyRule(date).seed,theme=DAILY_PICK_THEMES[seed%10],size=theme.id==="underdog"?[7,8,11][seed%3]:[7,8,11,14][Math.floor(seed/10)%4];
    if(JSON.stringify(ids)!==JSON.stringify(value.ids)||tokens!==value.tokens||!knownFormation(value.formation))replayFail("Saved draft is invalid or outdated.");
    const state=dailyPickNew(date,2);state.carry=normalizeDailyCarry({size,ids,seen:value.seen,tokens,captainId:value.captain},date);state.ids=[...ids];state.seen=[...state.carry.seen];state.tokens=tokens;state.formation=dailyFormationNames(size)[0];state.chosenFormation=state.formation;Object.assign(state,dailyPickPlan(state));state.captain=state.carry.captainId;state.captain=soloChooseCaptain(state);state.phase=ids.length===size?(value.phase==="result"?"result":"review"):ids.length?"picking":"formation";state.attempt=Number.isInteger(value.attempt)&&value.attempt>0&&value.attempt<=100000?value.attempt:1;return state;
}
function normalizeSoloState(value){
    if(!replayRecord(value)||![1,2].includes(value.v))replayFail("Saved draft is invalid or outdated.");
    if(value.kind==="daily"){
        if(value.v===1)return migrateDailyRun(value);
        if(value.balanceRevision==null)return migrateDailyBalanceRun(value);
        if(value.balanceRevision!==SQUAD_BALANCE_REVISION)replayFail("Saved draft is invalid or outdated.");
        if(value.rules!==undefined&&value.rules!==3)replayFail("Saved draft is invalid or outdated.");
        let clean=dailyPickNew(soloDate(value.date),value.rules===3?3:2);if(value.rules===3&&value.carry)replayFail("Saved draft is invalid or outdated.");
        if(value.carry){clean.carry=normalizeDailyCarry(value.carry,value.date);clean.ids=[...clean.carry.ids];clean.seen=[...clean.carry.seen];clean.tokens=clean.carry.tokens;}
        if(!dailyRuleForState(clean).formations.includes(value.chosenFormation))replayFail("This squad uses an unknown formation.");
        clean.formation=value.chosenFormation;clean.chosenFormation=value.chosenFormation;Object.assign(clean,dailyPickPlan(clean));clean.captain=clean.carry?.captainId||null;clean.captain=dailyCaptain(clean);
        if(clean.ids.length===dailyRuleForState(clean).size)clean.phase="review";else if(value.phase!=="formation")dailyStartPicks(clean);
        if(!Array.isArray(value.actions)||value.actions.length>(clean.rules===3?24:16))replayFail("Saved draft is invalid or outdated.");for(const action of value.actions){if(!replayRecord(action))replayFail("Invalid draft action.");dailyPickAction(clean,action);}
        if(clean.phase==="review"){
            const form=dailyFormations(clean).find(f=>f.formation===value.formation);if(!form)replayFail("This squad uses an unknown formation.");Object.assign(clean,{formation:form.formation,assignment:validatedDailyAssignment(clean.ids,form.formation,value.assignment)});clean.captain=value.captain; if(clean.captain!=null&&!Object.values(clean.assignment).includes(clean.captain)||dailyRuleForState(clean).captainId&&clean.captain!==dailyRuleForState(clean).captainId)replayFail("Invalid squad data.");if(value.phase==="result")clean.phase="result";
        }
        clean.attempt=Number.isInteger(value.attempt)&&value.attempt>0&&value.attempt<=100000?value.attempt:1;return clean;
    }
    if(value.kind==="puzzle"){if(typeof value.mission==="string"&&value.mission.startsWith("lab:")){if(typeof labRegisterCode!=="function")replayFail("Saved draft is invalid or outdated.");const lab=labRegisterCode(value.code);if(lab.id!==value.mission)replayFail("Saved draft is invalid or outdated.");}const m=puzzleMission(value.mission);return puzzleValidate({v:1,kind:"puzzle",mission:m.id,...(m.code?{code:m.code}:{}),formation:value.formation,assignment:value.assignment,captain:value.captain,ids:[],phase:value.phase==="result"?"result":"building",attempt:Number.isInteger(value.attempt)&&value.attempt>0&&value.attempt<=100000?value.attempt:1});}
    replayFail("Saved draft is invalid or outdated.");
}

// Older deterministic offers depended on the previous chemistry/position model.
// Preserve the validated owned state as a carry instead of replaying obsolete offers.
function migrateDailyBalanceRun(value){
    const date=soloDate(value.date),rule=dailyLegacyRule(date),size=value.carry?.size||rule.size;
    if(!Array.isArray(value.actions)||value.actions.length>16||!value.actions.every(a=>replayRecord(a)&&(a.type==="pick"&&Number.isInteger(a.id)||a.type==="reroll")))replayFail("Saved draft is invalid or outdated.");
    const previous=value.carry?normalizeDailyCarry(value.carry,date):{ids:[],tokens:2};
    const ids=[...previous.ids,...value.actions.filter(a=>a.type==="pick").map(a=>a.id)],tokens=previous.tokens-value.actions.filter(a=>a.type==="reroll").length;
    if(JSON.stringify(ids)!==JSON.stringify(value.ids)||tokens!==value.tokens||!["formation","picking","review","result"].includes(value.phase))replayFail("Saved draft is invalid or outdated.");
    if(value.phase==="formation"&&ids.length)replayFail("Saved draft is invalid or outdated.");
    if(["review","result"].includes(value.phase)!==(ids.length===size))replayFail("Saved draft is invalid or outdated.");
    const clean=dailyPickNew(date,2);
    clean.carry=normalizeDailyCarry({size,ids,seen:value.seen,tokens,captainId:value.captain},date);
    Object.assign(clean,{ids:[...ids],seen:[...clean.carry.seen],tokens,chosenFormation:value.chosenFormation,formation:value.formation,captain:value.captain,phase:value.phase,attempt:Number.isInteger(value.attempt)&&value.attempt>0&&value.attempt<=100000?value.attempt:1});
    if(!dailyFormationNames(size).includes(clean.chosenFormation)||!dailyFormationNames(size).includes(clean.formation))replayFail("This squad uses an unknown formation.");
    clean.assignment=validatedDailyAssignment(ids,clean.formation,value.assignment);
    if(clean.captain!=null&&!Object.values(clean.assignment).includes(clean.captain))replayFail("Invalid squad data.");
    return clean;
}
function soloLoad(){try{const raw=localStorage.getItem(SOLO_SAVE_KEY);return raw?normalizeSoloState(JSON.parse(raw)):null;}catch{return null;}}
function soloSave(){try{localStorage.setItem(SOLO_SAVE_KEY,JSON.stringify(soloState));return true;}catch{soloStorageFailed=true;return false;}}

function validatedDailyAssignment(ids,formation,assignment){
    const shape=formationShape(formation);
    if(!replayRecord(assignment)||Object.keys(assignment).some(slot=>!/^\d+$/.test(slot)||String(Number(slot))!==slot||!shape[Number(slot)])||Object.values(assignment).some(id=>!ids.includes(id))||new Set(Object.values(assignment)).size!==Object.values(assignment).length||Object.values(assignment).length!==Math.min(shape.length,ids.length))replayFail("Invalid squad data.");
    return {...assignment};
}
