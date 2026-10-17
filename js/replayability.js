// v0.7.1 replayability data. No rendering, network or hidden auction-order access.
const SQUAD_LIBRARY_KEY="bldSavedSquadsV1",CHALLENGE_SETUP_KEY="bldChallengeSetupV1",DAILY_PROGRESS_KEY="bldDailyDraftV1";
function replayText(key,values={}){return Object.entries(values).reduce((text,[name,value])=>text.replaceAll("{"+name+"}",String(value)),window.SiteI18n?.text(key)||key);}
function replayFail(message){throw new Error(message);}
function replayRecord(value){return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function replayHash(value){let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;}
function replayCode(prefix,value){const json=JSON.stringify(value),bytes=new TextEncoder().encode(json);let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);return prefix+"."+btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")+"."+replayHash(json).toString(36);}
function replayDecode(code,prefix){
    if(typeof code!=="string"||code.length>12000)replayFail("Invalid or outdated code.");
    const parts=code.trim().split(".");if(parts.length!==3||parts[0]!==prefix||!/^[-_A-Za-z0-9]+$/.test(parts[1]))replayFail("Invalid or outdated code.");
    try{const bytes=Uint8Array.from(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0)),json=new TextDecoder("utf-8",{fatal:true}).decode(bytes);if(replayHash(json).toString(36)!==parts[2])throw Error();return JSON.parse(json);}catch{replayFail("Invalid or outdated code.");}
}
function normalizeReplaySquad(value,{allowLocked=false}={}){
    if(!replayRecord(value)||value.v!==1||typeof value.name!=="string"||!value.name.trim()||value.name.length>32||typeof value.color!=="string"||!/^#[0-9a-f]{6}$/i.test(value.color))replayFail("Invalid squad data.");
    if(typeof value.formation!=="string"||!Object.hasOwn(FORMATIONS,value.formation))replayFail("This squad uses an unknown formation.");
    const ids=value.playerIds;
    if(!Array.isArray(ids)||!ids.length||ids.length>players.length||!ids.every(Number.isInteger)||new Set(ids).size!==ids.length)replayFail("Invalid squad data.");
    if(ids.some(id=>!playerById(id)))replayFail("This squad contains a missing player.");
    if(!allowLocked&&ids.some(id=>!secretPlayerAvailable(playerById(id))))replayFail("Unlock secret players before loading this squad.");
    if(!replayRecord(value.assignment))replayFail("Invalid squad positions.");
    const assignment={};const used=new Set();
    for(const [slot,id]of Object.entries(value.assignment)){
        if(!/^(?:[0-9]|10)$/.test(slot)||!ids.includes(id)||used.has(id))replayFail("Invalid squad positions.");
        assignment[slot]=id;used.add(id);
    }
    if(value.captainId!==null&&(!Number.isInteger(value.captainId)||!used.has(value.captainId)))replayFail("Invalid squad captain.");
    return {v:1,name:value.name.trim(),color:value.color,playerIds:[...ids],formation:value.formation,assignment,captainId:value.captainId};
}
function replaySquadFromTeam(n){
    const team=teamByNumber(n);if(!team?.players.length)replayFail("Choose players before saving a squad.");
    return normalizeReplaySquad({v:1,name:team.name||"GLOBAL XI",color:normalizeHexColor(team.color),playerIds:team.players.map(p=>p.id),formation:formationByTeam[n]||"4-3-3",assignment:{...formationAssignments[n]},captainId:formationCaptainByTeam[n]||null});
}
function exportSquadCode(squad){const s=normalizeReplaySquad(squad);return replayCode("BLD1",[s.v,s.name,s.color,s.formation,s.playerIds,Object.entries(s.assignment).map(([slot,id])=>[Number(slot),id]),s.captainId]);}
function importSquadCode(code){
    const value=replayDecode(code,"BLD1");if(!Array.isArray(value)||value.length!==7||!Array.isArray(value[5])||value[5].length>11)replayFail("Invalid squad data.");
    const assignment={};for(const pair of value[5]){if(!Array.isArray(pair)||pair.length!==2||!Number.isInteger(pair[0])||Object.hasOwn(assignment,pair[0]))replayFail("Invalid squad positions.");assignment[pair[0]]=pair[1];}
    return normalizeReplaySquad({v:value[0],name:value[1],color:value[2],formation:value[3],playerIds:value[4],assignment,captainId:value[6]});
}
function readSquadLibrary(){
    let saved;try{saved=JSON.parse(localStorage.getItem(SQUAD_LIBRARY_KEY)||'{"v":1,"items":[]}');}catch{return {items:[],damaged:true};}
    if(!replayRecord(saved)||saved.v!==1||!Array.isArray(saved.items)||saved.items.length>50)return {items:[],damaged:true};
    const items=[];let damaged=false;const keys=new Set();
    for(const item of saved.items){try{if(typeof item.id!=="string"||!/^[a-z0-9-]{1,80}$/.test(item.id)||keys.has(item.id))throw Error();const squad=normalizeReplaySquad(item.squad,{allowLocked:true});items.push({id:item.id,squad});keys.add(item.id);}catch{damaged=true;}}
    return {items,damaged};
}
function writeSquadLibrary(items){try{localStorage.setItem(SQUAD_LIBRARY_KEY,JSON.stringify({v:1,items}));}catch{replayFail("Storage is full or unavailable. Export a squad code instead.");}}
function saveReplaySquad(squad){
    const valid=normalizeReplaySquad(squad),library=readSquadLibrary();
    if(library.damaged)replayFail("Saved squad data needs attention. Export valid squads before resetting the library.");
    if(library.items.length>=50)replayFail("Squad library is full. Delete a squad first.");
    const id=Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10);writeSquadLibrary([...library.items,{id,squad:valid}]);return id;
}
function deleteReplaySquad(id){const {items}=readSquadLibrary();writeSquadLibrary(items.filter(item=>item.id!==id));}
function buildFromReplaySquad(value){
    const squad=normalizeReplaySquad(value);standaloneBuilderLoaded=true;
    standaloneBuilderName=squad.name;standaloneBuilderColor=squad.color;standaloneBuilderPlayerIds=new Set(squad.playerIds);
    formationByTeam[0]=squad.formation;formationAssignments[0]={...squad.assignment};formationCaptainByTeam[0]=squad.captainId;
    standaloneBuilderSyncTeam();saveStandaloneBuilderState();closeReplayDialog();openStandaloneBuilder();
}
function localDraftDate(date=new Date()){return String(date.getFullYear()).padStart(4,"0")+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");}
function challengePool(){return players.filter(p=>!p.secretCharacter).map(p=>p.id).sort((a,b)=>a-b);}
function seededDraftShuffle(ids,seed){let h=seed>>>0;const result=[...ids];for(let i=result.length-1;i>0;i--){h=(Math.imul(h,1664525)+1013904223)>>>0;const j=h%(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;}
function normalizeLegacyDraftChallenge(value){
    if(!replayRecord(value)||value.v!==1||typeof value.id!=="string"||!/^[a-z0-9-]{1,32}$/.test(value.id)||typeof value.title!=="string"||!value.title.trim()||value.title.length>60)replayFail("Invalid challenge rules.");
    if(!Number.isInteger(value.size)||value.size<5||value.size>15||!Number.isInteger(value.increment)||value.increment<1||value.increment>1000||!Number.isInteger(value.budget)||value.budget<value.increment*value.size||value.budget>1000000||value.budget%value.increment)replayFail("Invalid challenge rules.");
    if(!Array.isArray(value.playerIds)||value.playerIds.length<value.size*2||value.playerIds.length>players.length||!value.playerIds.every(id=>Number.isInteger(id)&&playerById(id)&&!playerById(id).secretCharacter)||new Set(value.playerIds).size!==value.playerIds.length)replayFail("Challenge player pool is invalid or too small.");
    for(const key of ["minChemistry","maxOverall"])if(value[key]!=null&&(!Number.isInteger(value[key])||value[key]<0||value[key]>100))replayFail("Invalid challenge rules.");
    if(value.formation!=null&&(typeof value.formation!=="string"||!Object.hasOwn(FORMATIONS,value.formation)))replayFail("Invalid challenge rules.");
    if(!replayRecord(value.positionRequirements)||Object.entries(value.positionRequirements).some(([role,n])=>!["GK","DEF","MID","ATT"].includes(role)||!Number.isInteger(n)||n<0||n>11)||Object.values(value.positionRequirements).reduce((a,b)=>a+b,0)>Math.min(11,value.size))replayFail("Invalid challenge rules.");
    const pool=value.playerIds.map(playerById),requirements=value.positionRequirements;
    for(const [role,n]of Object.entries(requirements))if(pool.filter(p=>cpuPlayerRoles(p).includes(role)).length<n*2)replayFail("Challenge positional requirements are not achievable.");
    if(value.date!=null&&(typeof value.date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value.date)||Number.isNaN(Date.parse(value.date+"T12:00:00Z"))||new Date(value.date+"T12:00:00Z").toISOString().slice(0,10)!==value.date))replayFail("Invalid challenge rules.");
    return {v:1,id:value.id,title:value.title.trim(),budget:value.budget,increment:value.increment,size:value.size,playerIds:[...value.playerIds].sort((a,b)=>a-b),minChemistry:value.minChemistry??null,maxOverall:value.maxOverall??null,formation:value.formation??null,positionRequirements:{...requirements},cpuDifficulty:["easy","normal","hard"].includes(value.cpuDifficulty)?value.cpuDifficulty:"normal",...(value.date?{date:value.date}:{})};
}
// Mission rules share the existing auction, player registry and exact squad state.
const MODE_RECORD_KEY="bldModeRecordsV2";
const MODE_WEIGHTS=Object.freeze({balanced:{quality:38,fit:15,chemistry:20,efficiency:10,theme:7,objectives:10},speed:{quality:25,fit:15,chemistry:10,efficiency:10,theme:30,objectives:10},defence:{quality:25,fit:20,chemistry:15,efficiency:5,theme:25,objectives:10},creators:{quality:25,fit:15,chemistry:20,efficiency:5,theme:25,objectives:10},chemistry:{quality:20,fit:15,chemistry:40,efficiency:5,theme:10,objectives:10},value:{quality:25,fit:15,chemistry:10,efficiency:35,theme:5,objectives:10},quality:{quality:55,fit:15,chemistry:10,efficiency:5,theme:5,objectives:10}});
function modeCategory(player,key){return !!PLAYER_POOL_CATEGORY_IDS[key]?.has(player.id);}
function modeNamedId(name){const p=players.find(p=>p.name===name);if(!p)replayFail("Challenge player pool is invalid or too small.");return p.id;}
function modeDefinition(id,title,description,options={}){
    const theme=options.theme||"balanced";
    return normalizeDraftChallenge({v:2,id,title,description,theme,difficulty:"normal",cpuDifficulty:options.difficulty==="hard"||options.difficulty==="extreme"?"hard":options.difficulty==="easy"?"easy":"normal",budget:9000,size:11,increment:50,playerIds:challengePool(),minChemistry:null,maxOverall:null,formation:null,positionRequirements:{},objectives:[],limits:[],market:3,scouts:2,...options,weights:MODE_WEIGHTS[theme]});
}
function draftChallengePresets(){
    const all=challengePool(),noMasters=all.filter(id=>!modeCategory(playerById(id),"master-strikers")),under=all.filter(id=>playerOverall(playerById(id))<=89);
    return [
        modeDefinition("blue-lock-eleven","BLUE LOCK ELEVEN","Turn the Blue Lock project into a balanced national core.",{playerIds:noMasters,difficulty:"easy",objectives:[{type:"categoryMin",key:"blue-lock-project",target:8}]}),
        modeDefinition("world-five","WORLD FIVE","One world-class contract. Build the supporting cast without buying another.",{playerIds:noMasters,size:8,budget:7500,difficulty:"hard",limits:[{category:"world-five",max:1}],objectives:[{type:"categoryMin",key:"world-five",target:1},{type:"remaining",target:1000,bonus:true}],theme:"quality"}),
        modeDefinition("kaiser-empire","KAISER'S EMPIRE","Win Kaiser, then create a team that connects around him.",{playerIds:noMasters,budget:10000,difficulty:"hard",objectives:[{type:"player",id:modeNamedId("Michael Kaiser"),target:1},{type:"chemistry",target:78}],theme:"chemistry"}),
        modeDefinition("the-king","THE KING'S RANSOM","Give Barou the armband and a disciplined attacking structure.",{playerIds:noMasters,budget:8000,difficulty:"hard",formation:"4-3-3",objectives:[{type:"player",id:modeNamedId("Shoei Baro"),target:1},{type:"captain",id:modeNamedId("Shoei Baro"),target:1},{type:"spend",target:6500}],theme:"balanced"}),
        modeDefinition("chemical-reaction","CHEMICAL REACTION","Partnerships decide the grade. Build a connected XI.",{budget:11000,difficulty:"extreme",objectives:[{type:"chemistry",target:84}],theme:"chemistry"}),
        modeDefinition("no-superstars","NO SUPERSTARS","A restricted market rewards structure over headline signings.",{playerIds:under,budget:7500,difficulty:"normal",objectives:[{type:"minOVR",target:77}],theme:"balanced"}),
        modeDefinition("bargain-hunter","BARGAIN HUNTER","Build an effective team and leave capital in reserve.",{size:8,budget:5000,difficulty:"normal",objectives:[{type:"spend",target:3600},{type:"minOVR",target:78}],theme:"value"}),
        modeDefinition("complete-football","COMPLETE FOOTBALL","Every starter must have a demonstrated role in the chosen position.",{playerIds:noMasters,difficulty:"hard",objectives:[{type:"fitCount",target:11},{type:"position",key:"GK",target:1},{type:"position",key:"DEF",target:3}],theme:"balanced"}),
        modeDefinition("u20-wall","U-20 WALL","Recruit Japan's original U-20 core and build a defensive unit.",{playerIds:noMasters,difficulty:"normal",objectives:[{type:"categoryMin",key:"original-u20",target:5},{type:"statAverage",key:"def",target:76}],theme:"defence"}),
        modeDefinition("speed-kills","SPEED KILLS","Win the pace specialists without sacrificing positional balance.",{size:8,budget:8500,difficulty:"normal",objectives:[{type:"statCount",key:"spd",threshold:88,target:3},{type:"statAverage",key:"spd",target:80}],theme:"speed"})
    ];
}
function normalizeModeObjective(objective,rule){
    if(!replayRecord(objective))replayFail("Invalid challenge rules.");
    const types=["player","exclude","chemistry","minOVR","maxOVR","spend","remaining","formation","position","nation","categoryMin","categoryMax","captain","size","statCount","statAverage","fitCount"];
    const {type,target}=objective;if(!types.includes(type))replayFail("Invalid challenge rules.");
    if(type==="formation"){if(typeof target!=="string"||!Object.hasOwn(FORMATIONS,target))replayFail("Invalid challenge rules.");return {type,target,bonus:objective.bonus===true};}
    if(!Number.isInteger(target)||target<0||target>(["spend","remaining"].includes(type)?rule.budget:["chemistry","minOVR","maxOVR","statAverage"].includes(type)?100:rule.size))replayFail("Invalid challenge rules.");
    const clean={type,target,bonus:objective.bonus===true};
    if(["player","exclude","captain"].includes(type)){if(!Number.isInteger(objective.id)||!playerById(objective.id)||(!rule.playerIds.includes(objective.id)&&type!=="exclude"))replayFail("Invalid challenge rules.");clean.id=objective.id;}
    if(["categoryMin","categoryMax"].includes(type)){if(typeof objective.key!=="string"||!Object.hasOwn(PLAYER_POOL_CATEGORIES,objective.key))replayFail("Invalid challenge rules.");clean.key=objective.key;}
    if(type==="position"){if(!["GK","DEF","MID","ATT"].includes(objective.key)||target>Math.min(11,rule.size))replayFail("Invalid challenge rules.");clean.key=objective.key;}
    if(type==="nation"){if(typeof objective.key!=="string"||!players.some(p=>p.nationality?.code===objective.key))replayFail("Invalid challenge rules.");clean.key=objective.key;}
    if(["statCount","statAverage"].includes(type)){if(!["off","sho","spd","def","pas","dri","gk"].includes(objective.key))replayFail("Invalid challenge rules.");clean.key=objective.key;if(type==="statCount"){if(!Number.isInteger(objective.threshold)||objective.threshold<0||objective.threshold>100)replayFail("Invalid challenge rules.");clean.threshold=objective.threshold;}}
    const pool=rule.playerIds.map(playerById);
    if(type==="categoryMin"&&pool.filter(p=>modeCategory(p,clean.key)).length<target||type==="nation"&&pool.filter(p=>p.nationality?.code===clean.key).length<target||type==="statCount"&&pool.filter(p=>playerStats(p)[clean.key]>=clean.threshold).length<target)replayFail("Challenge positional requirements are not achievable.");
    return clean;
}
function normalizeDraftChallenge(value){
    if(!replayRecord(value)||![1,2].includes(value.v))replayFail("Invalid challenge rules.");
    const rule=normalizeLegacyDraftChallenge({...value,v:1});if(value.v===1)return rule;
    if(typeof value.description!=="string"||value.description.length>180||!Object.hasOwn(MODE_WEIGHTS,value.theme)||!["easy","normal","hard","extreme"].includes(value.difficulty)||value.market!==3||!Number.isInteger(value.scouts)||value.scouts<0||value.scouts>3)replayFail("Invalid challenge rules.");
    if(!Array.isArray(value.objectives)||value.objectives.length>12||!Array.isArray(value.limits)||value.limits.length>4)replayFail("Invalid challenge rules.");
    const limits=value.limits.map(limit=>{if(!replayRecord(limit)||!Number.isInteger(limit.max)||limit.max<0||limit.max>rule.size)replayFail("Invalid challenge rules.");if(limit.category&&Object.hasOwn(PLAYER_POOL_CATEGORIES,limit.category))return {category:limit.category,max:limit.max};if(limit.elite===true&&Number.isInteger(limit.threshold)&&limit.threshold>=85&&limit.threshold<=100)return {elite:true,threshold:limit.threshold,max:limit.max};replayFail("Invalid challenge rules.");});
    const normalized={...rule,v:2,description:value.description,theme:value.theme,difficulty:value.difficulty,market:3,scouts:value.scouts,limits,weights:{...MODE_WEIGHTS[value.theme]}};
    normalized.objectives=value.objectives.map(o=>normalizeModeObjective(o,normalized));
    const required=normalized.objectives.filter(o=>!o.bonus),excluded=new Set(required.filter(o=>o.type==="exclude").map(o=>o.id));
    const eligible=normalized.playerIds.map(playerById).filter(p=>!excluded.has(p.id)&&limits.every(l=>l.max!==0||!modeLimitMatches(p,l)));
    const requiredIds=new Set(required.filter(o=>["player","captain"].includes(o.type)).map(o=>o.id));
    if(eligible.length<rule.size*2||requiredIds.size>rule.size||[...requiredIds].some(id=>!eligible.some(p=>p.id===id))||new Set(required.filter(o=>o.type==="captain").map(o=>o.id)).size>1)replayFail("Challenge positional requirements are not achievable.");
    for(const limit of limits){const matching=eligible.filter(p=>modeLimitMatches(p,limit));if(eligible.length-matching.length+Math.min(matching.length,limit.max*2)<rule.size*2||[...requiredIds].filter(id=>modeLimitMatches(playerById(id),limit)).length>limit.max)replayFail("Challenge positional requirements are not achievable.");}
    for(const o of required){
        if(["player","captain"].includes(o.type)&&o.target!==1||o.type==="exclude"&&o.target!==0||o.type==="size"&&o.target!==rule.size||o.type==="spend"&&o.target<rule.size*rule.increment||o.type==="remaining"&&o.target>rule.budget-rule.size*rule.increment)replayFail("Invalid challenge rules.");
        if(o.type==="formation"&&rule.formation&&o.target!==rule.formation||o.type==="minOVR"&&required.some(other=>other.type==="maxOVR"&&other.target<o.target))replayFail("Invalid challenge rules.");
        if(o.type==="categoryMin"&&(eligible.filter(p=>modeCategory(p,o.key)).length<o.target||limits.some(l=>l.category===o.key&&l.max<o.target)||required.some(other=>other.type==="categoryMax"&&other.key===o.key&&other.target<o.target)))replayFail("Challenge positional requirements are not achievable.");
        if(o.type==="nation"&&eligible.filter(p=>p.nationality?.code===o.key).length<o.target||o.type==="statCount"&&eligible.filter(p=>playerStats(p)[o.key]>=o.threshold).length<o.target)replayFail("Challenge positional requirements are not achievable.");
    }
    const positions={...rule.positionRequirements};for(const o of required.filter(o=>o.type==="position"))positions[o.key]=Math.max(positions[o.key]||0,o.target);
    if(Object.values(positions).reduce((a,b)=>a+b,0)>Math.min(11,rule.size))replayFail("Challenge positional requirements are not achievable.");
    if(value.archetype!==undefined){if(typeof value.archetype!=="string"||!/^[a-z0-9-]{1,32}$/.test(value.archetype))replayFail("Invalid challenge rules.");normalized.archetype=value.archetype;}
    return normalized;
}
function dailyEgoDraft(date=new Date()){
    const day=localDraftDate(date),seed=replayHash("BLD-daily-v072:"+day),presets=draftChallengePresets(),all=challengePool();
    const extra=[
        modeDefinition("national-core","NATIONAL CORE","Build around a Japanese core while keeping the whole squad balanced.",{size:9,objectives:[{type:"nation",key:"JP",target:6}],theme:"balanced"}),
        modeDefinition("one-superstar","ONE SUPERSTAR","One elite contract is allowed. Spend the rest on the team.",{size:9,limits:[{elite:true,threshold:94,max:1}],objectives:[{type:"statCount",key:"off",threshold:94,target:1}],theme:"value"}),
        modeDefinition("technicians","TECHNICIANS","Passing and close control carry the evaluation.",{size:9,objectives:[{type:"statCount",key:"pas",threshold:85,target:3},{type:"statAverage",key:"dri",target:79}],theme:"creators"}),
        modeDefinition("galacticos","GALACTICOS","Five contracts. Elite quality, with every role still counting.",{size:5,budget:15000,objectives:[{type:"minOVR",target:86}],theme:"quality"}),
        modeDefinition("limited-market","LIMITED MARKET","A smaller public market makes each nomination a tactical choice.",{size:8,theme:"balanced"}),
        modeDefinition("rivalry","RIVALRY DRAFT","Use the chemistry network to turn a connected market into a team.",{size:8,objectives:[{type:"chemistry",target:79}],theme:"chemistry"})
    ];
    const templates=[...presets,...extra],base=templates[seed%templates.length];let ids=[...base.playerIds];
    if(base.id==="limited-market"||base.id==="rivalry"){
        const shuffled=seededDraftShuffle(ids,seed),pivot=playerById(shuffled[0]),ordered=base.id==="rivalry"?[...ids].sort((a,b)=>playerChemistry(pivot,playerById(b))-playerChemistry(pivot,playerById(a))||a-b):shuffled;
        const chosen=new Set();for(const role of ["GK","DEF","MID","ATT"])for(const id of ordered.filter(id=>cpuPlayerRoles(playerById(id)).includes(role)).slice(0,role==="GK"?2:7))chosen.add(id);
        for(const id of ordered){if(chosen.size>=34)break;chosen.add(id);}ids=[...chosen];
    }
    return normalizeDraftChallenge({...base,id:"daily",archetype:base.id,date:day,playerIds:ids,cpuDifficulty:base.cpuDifficulty});
}
function exportChallengeCode(value){const rule=normalizeDraftChallenge(value);return replayCode(rule.v===2?"BLDC2":"BLDC1",rule);}
function importChallengeCode(code){const prefix=typeof code==="string"&&code.trim().startsWith("BLDC2.")?"BLDC2":"BLDC1",value=replayDecode(code,prefix);if(value?.v!==(prefix==="BLDC2"?2:1))replayFail("Invalid or outdated code.");return normalizeDraftChallenge(value);}
function modeLimitMatches(player,limit){return limit.elite?playerOverall(player)>=limit.threshold:modeCategory(player,limit.category);}
function modeCanSign(team,player,rule=activeDraftChallenge){return !rule||rule.v!==2||rule.playerIds.includes(player.id)&&!rule.objectives.some(o=>o.type==="exclude"&&!o.bonus&&o.id===player.id)&&rule.limits.every(limit=>!modeLimitMatches(player,limit)||team.players.filter(p=>modeLimitMatches(p,limit)).length<limit.max);}
function modeThemeValue(player,theme){const s=playerStats(player);return theme==="speed"?s.spd:theme==="defence"?s.def:theme==="creators"?(s.pas+s.dri)/2:playerOverall(player);}
function modeSquadView(n,live=false){
    const team=teamByNumber(n),snap=shareFormationSnapshot(n);
    // Auction Undo can restore the roster before the first lineup was built.
    // Score only owned, uniquely deployed players without changing the user's builder state.
    const owned=new Set(team.players.map(p=>p.id)),used=new Set();
    const assignment=Object.fromEntries(Object.entries(snap.assignment).filter(([i,id])=>snap.shape[i]&&owned.has(id)&&!used.has(id)&&(used.add(id),true)));
    if(Object.keys(assignment).length!==snap.deployedCount){snap.assignment=assignment;snap.deployedCount=Object.keys(assignment).length;snap.captainId=used.has(snap.captainId)?snap.captainId:null;snap.ovr=formationTeamOVRForAssignment(n,assignment,snap.formation);snap.chemistry=formationChemistryForAssignment(n,assignment,snap.formation,new Set(Object.keys(assignment).map(Number)));}
    if(live&&team.players.length&&snap.deployedCount!==Math.min(11,team.players.length)){
        const plan=cpuPlanRoster(team.players),shape=FORMATIONS[plan.formation];const ratings=Object.entries(plan.assignment).map(([i,id])=>effectiveOVR(playerById(id),shape[i].label));
        const links=[];const placed=Object.values(plan.assignment).map(playerById);for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++)links.push(playerChemistry(placed[i],placed[j]));
        return {...snap,formation:plan.formation,shape,assignment:plan.assignment,deployedCount:placed.length,ovr:lineupOVRProfile(ratings).value,chemistry:{overall:chemistryNetworkScore(links)},captainId:snap.captainId};
    }return snap;
}
function modeGoal(type,current,target,label,extra={}){return {type,current,target,label,pass:extra.maximum?current<=target:current>=target,...extra};}
function modeObjectiveEvaluation(o,team,snap){
    const roster=team.players,placed=Object.values(snap.assignment).map(playerById).filter(Boolean),spent=startingBudget-team.budget;
    const counts={GK:0,DEF:0,MID:0,ATT:0};let fit=0;for(const [index,id]of Object.entries(snap.assignment)){const p=playerById(id),label=snap.shape[index]?.label;if(p&&label&&canonicalFit(p,label)){fit++;const group=cpuRoleGroup(label);if(group)counts[group]++;}}
    const name=o.id?playerById(o.id).name:"",extra={bonus:o.bonus};
    switch(o.type){
        case "player":return modeGoal(o.type,roster.some(p=>p.id===o.id)?1:0,1,replayText("Draft {player}",{player:name}),extra);
        case "exclude":return modeGoal(o.type,roster.some(p=>p.id===o.id)?1:0,0,replayText("Exclude {player}",{player:name}),{...extra,maximum:true});
        case "captain":return modeGoal(o.type,snap.captainId===o.id?1:0,1,replayText("Captain: {player}",{player:name}),extra);
        case "chemistry":return modeGoal(o.type,snap.chemistry.overall||0,o.target,"CHEMISTRY",extra);
        case "minOVR":case "maxOVR":return modeGoal(o.type,snap.ovr||0,o.target,"TEAM OVR",{...extra,maximum:o.type==="maxOVR"});
        case "spend":return modeGoal(o.type,spent,o.target,"SPENT",{...extra,maximum:true});
        case "remaining":return modeGoal(o.type,team.budget,o.target,"REMAINING",extra);
        case "formation":return modeGoal(o.type,snap.formation===o.target?1:0,1,replayText("FORMATION")+" "+o.target,extra);
        case "position":return modeGoal(o.type,counts[o.key]||0,o.target,replayText("In-position starters: {role}",{role:o.key}),extra);
        case "nation":return modeGoal(o.type,roster.filter(p=>p.nationality?.code===o.key).length,o.target,replayText("National core: {nation}",{nation:o.key}),extra);
        case "categoryMin":case "categoryMax":return modeGoal(o.type,roster.filter(p=>modeCategory(p,o.key)).length,o.target,PLAYER_POOL_CATEGORIES[o.key].label,{...extra,maximum:o.type==="categoryMax"});
        case "size":return modeGoal(o.type,roster.length,o.target,"PLAYERS",{...extra,pass:roster.length===o.target});
        case "statCount":return modeGoal(o.type,roster.filter(p=>playerStats(p)[o.key]>=o.threshold).length,o.target,replayText("Specialists: {stat} ≥ {value}",{stat:replayText(({spd:"SPEED",def:"DEFENCE",pas:"PASSING",dri:"DRIBBLING",sho:"SHOOTING",off:"OFFENSE",gk:"GOALKEEPING"})[o.key]),value:o.threshold}),extra);
        case "statAverage":return modeGoal(o.type,Math.round(roster.reduce((sum,p)=>sum+playerStats(p)[o.key],0)/Math.max(1,roster.length)),o.target,replayText("Squad average: {stat}",{stat:replayText(({spd:"SPEED",def:"DEFENCE",pas:"PASSING",dri:"DRIBBLING",sho:"SHOOTING",off:"OFFENSE",gk:"GOALKEEPING"})[o.key])}),extra);
        case "fitCount":return modeGoal(o.type,fit,o.target,"POSITIONAL FIT",extra);
    }
}
function challengeEvaluation(rule,n=1,live=false){
    const r=normalizeDraftChallenge(rule),team=teamByNumber(n),snap=modeSquadView(n,live),goals=[modeGoal("size",team.players.length,r.size,"COMPLETE SQUAD",{pass:team.players.length===r.size&&snap.deployedCount===Math.min(11,r.size)})];
    goals.push(modeGoal("pool",team.players.every(p=>r.playerIds.includes(p.id))?1:0,1,"CHALLENGE POOL"));
    const legacy=[];if(r.formation)legacy.push({type:"formation",target:r.formation});if(r.minChemistry!==null)legacy.push({type:"chemistry",target:r.minChemistry});if(r.maxOverall!==null)legacy.push({type:"maxOVR",target:r.maxOverall});for(const [key,target]of Object.entries(r.positionRequirements))legacy.push({type:"position",key,target});
    for(const objective of [...legacy,...(r.objectives||[])])goals.push(modeObjectiveEvaluation(objective,team,snap));
    for(const limit of r.limits||[]){const count=team.players.filter(p=>modeLimitMatches(p,limit)).length;goals.push(modeGoal("limit",count,limit.max,limit.elite?"ELITE CONTRACTS":PLAYER_POOL_CATEGORIES[limit.category].label,{maximum:true}));}
    return {goals,complete:goals.filter(g=>!g.bonus).every(g=>g.pass),snap};
}
function modeGrade(score,complete){const grades=[[10500,"S+","EGO SINGULARITY"],[9500,"S","WORLD CLASS DRAFT"],[8500,"A","ELITE SQUAD"],[7200,"B","STRONG FOUNDATION"],[5800,"C","INCOMPLETE EGO"],[0,"D","REBUILD THE VISION"]];return grades.find(([min,grade])=>score>=min&&(complete||["C","D"].includes(grade))).slice(1);}
function modeScore(rule,n=1,live=false){
    const evaluation=challengeEvaluation(rule,n,live),team=teamByNumber(n),snap=evaluation.snap,w=rule.weights||MODE_WEIGHTS.balanced;
    const placed=Object.entries(snap.assignment).filter(([i,id])=>id&&snap.shape[i]),fit=placed.filter(([i,id])=>canonicalFit(playerById(id),snap.shape[i].label)).length,size=Math.min(11,rule.size);
    const quality=(snap.ovr||0)/100,chemistry=(snap.chemistry.overall||0)/100,efficiency=Math.min(1,Math.max(0,team.budget/rule.budget)*.65+quality*.35),theme=team.players.reduce((sum,p)=>sum+modeThemeValue(p,rule.theme),0)/Math.max(1,team.players.length)/100,objective=evaluation.goals.filter(g=>g.pass).length/evaluation.goals.length;
    const components=[{label:"TEAM QUALITY",value:Math.round(quality*w.quality*100)},{label:"POSITIONAL FIT",value:Math.round(fit/size*w.fit*100)},{label:"CHEMISTRY",value:Math.round(chemistry*w.chemistry*100)},{label:"BUDGET EFFICIENCY",value:Math.round(efficiency*w.efficiency*100)},{label:"THEME BONUS",value:Math.round(theme*w.theme*100)},{label:"OBJECTIVE BONUS",value:Math.round(objective*w.objectives*100)}];
    const penalty=(size-fit)*180+Math.max(0,rule.size-team.players.length)*500+evaluation.goals.filter(g=>!g.pass&&!g.bonus).length*350;
    if(penalty)components.push({label:"SQUAD PENALTIES",value:-penalty});
    const score=Math.max(0,components.reduce((sum,c)=>sum+c.value,0)+(evaluation.complete?1000:0));if(evaluation.complete)components.push({label:"MISSION BONUS",value:1000});
    const [grade,gradeLabel]=modeGrade(score,evaluation.complete);return {...evaluation,score,grade,gradeLabel,components};
}
function modeRecordId(rule){return (rule.id==="daily"?"daily:"+rule.date:rule.id)+":"+replayHash(exportChallengeCode(rule)).toString(36);}
function readModeRecords(){try{const data=JSON.parse(localStorage.getItem(MODE_RECORD_KEY)||"{}");if(!replayRecord(data))return {};return Object.fromEntries(Object.entries(data).filter(([key,r])=>key.length<100&&replayRecord(r)&&Number.isFinite(r.score)&&r.score>=0&&r.score<=20000&&["S+","S","A","B","C","D"].includes(r.grade)&&typeof r.completed==="boolean").slice(-240));}catch{return {};}}
function modeBest(rule){return readModeRecords()[modeRecordId(rule)]||null;}
function recordModeResult(rule,result){
    const all=readModeRecords(),key=modeRecordId(rule),previous=all[key];
    const best=!previous||result.score>previous.score?{score:result.score,grade:result.grade,completed:result.complete}:previous;all[key]={...best,completed:!!(previous?.completed||result.complete)};
    try{localStorage.setItem(MODE_RECORD_KEY,JSON.stringify(Object.fromEntries(Object.entries(all).slice(-240))));return true;}catch{return false;}
}
function ensureModeInitialLineup(){
    if(!activeDraftChallenge||!team1.players.length)return;
    const key=team1.players.map(p=>p.id).sort((a,b)=>a-b).join(",");if(draftModeState.lineupKey===key)return;
    if(activeDraftChallenge.formation){const best=bestLineupForFormation(1,activeDraftChallenge.formation);if(best){formationByTeam[1]=best.formation;formationAssignments[1]=best.assignment;ensureFormationCaptain(1,true);}}
    else applyBestFormationAndAssignment(1);
    const captain=activeDraftChallenge.objectives?.find(o=>o.type==="captain");if(captain&&Object.values(formationAssignments[1]).includes(captain.id))formationCaptainByTeam[1]=captain.id;
    draftModeState.lineupKey=key;formationInitialized=true;
}
function normalizeDraftModeState(value,rule){const v=replayRecord(value)?value:{};return {refreshes:Number.isInteger(v.refreshes)?Math.max(0,Math.min(rule?.scouts||0,v.refreshes)):rule?.scouts||0,lineupKey:typeof v.lineupKey==="string"?v.lineupKey.slice(0,500):"",retired:Array.isArray(v.retired)?v.retired.filter(id=>Number.isInteger(id)&&playerById(id)).slice(0,players.length):[]};}
function validateChallengeSetup(setup){
    if(!setupDraftChallenge)return true;const rule=normalizeDraftChallenge(setupDraftChallenge);
    const actual=setup.selectedPlayers.map(p=>p.id).sort((a,b)=>a-b);
    if(!setup.team2CpuControlled||setup.cpuDifficulty!==rule.cpuDifficulty||setup.budget!==rule.budget||setup.bidIncrement!==rule.increment||setup.maxPlayers!==rule.size||JSON.stringify(actual)!==JSON.stringify(rule.playerIds)){
        showSiteError("Challenge setup is fixed. Restore its rules or leave the challenge.","DRAFT CHALLENGES");return false;
    }return true;
}
function ensureCpuSquadBuilt(){
    if(!team2CpuControlled||!team2.players.length)return;
    const key=team2.players.map(p=>p.id).sort((a,b)=>a-b).join(",");
    const valid=Object.values(formationAssignments[2]||{}).length===Math.min(11,team2.players.length)&&Object.values(formationAssignments[2]||{}).every(id=>team2.players.some(p=>p.id===id));
    if(!valid||(cpuBuiltRosterKey&&cpuBuiltRosterKey!==key)){applyBestFormationAndAssignment(2);formationInitialized=true;}
    cpuBuiltRosterKey=key;
}
