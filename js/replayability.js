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
function draftChallengePresets(){
    const all=challengePool(),japan=all.filter(id=>playerById(id).nationality?.code==="JP"),balanced=all.filter(id=>playerOverall(playerById(id))<=86);
    return [
        {id:"budget",title:"BUDGET EGO",budget:4000,playerIds:all},
        {id:"nation",title:"JAPAN SELECT",budget:9000,playerIds:japan},
        {id:"chemistry",title:"CHEMISTRY LAB",budget:11000,playerIds:all,minChemistry:82},
        {id:"balance",title:"BALANCED XI",budget:8500,playerIds:balanced,maxOverall:83},
        {id:"formation",title:"WIDE ATTACK",budget:11000,playerIds:all,formation:"4-3-3",positionRequirements:{GK:1,DEF:3,MID:2,ATT:3}}
    ].map(rule=>normalizeDraftChallenge({v:1,size:11,increment:50,minChemistry:null,maxOverall:null,formation:null,positionRequirements:{},...rule}));
}
function normalizeDraftChallenge(value){
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
function dailyEgoDraft(date=new Date()){
    const day=localDraftDate(date),seed=replayHash("BLD-daily-v1:"+day),preset=draftChallengePresets()[seed%3],shuffled=seededDraftShuffle(preset.playerIds,seed);
    // Include two natural keepers and enough role coverage for both teams, then fill by seeded draw.
    const chosen=new Set();for(const group of ["GK","DEF","MID","ATT"]){for(const id of shuffled.filter(id=>cpuPlayerRoles(playerById(id)).includes(group)).slice(0,group==="GK"?2:8))chosen.add(id);}
    for(const id of shuffled){if(chosen.size>=Math.min(44,shuffled.length))break;chosen.add(id);}
    return normalizeDraftChallenge({...preset,id:"daily",title:"DAILY EGO DRAFT",date:day,playerIds:[...chosen],budget:[7000,9000,11000][seed%3],minChemistry:null});
}
function exportChallengeCode(value){return replayCode("BLDC1",normalizeDraftChallenge(value));}
function importChallengeCode(code){return normalizeDraftChallenge(replayDecode(code,"BLDC1"));}
function validateChallengeSetup(setup){
    if(!setupDraftChallenge)return true;const rule=normalizeDraftChallenge(setupDraftChallenge);
    const actual=setup.selectedPlayers.map(p=>p.id).sort((a,b)=>a-b);
    if(!setup.team2CpuControlled||setup.cpuDifficulty!==rule.cpuDifficulty||setup.budget!==rule.budget||setup.bidIncrement!==rule.increment||setup.maxPlayers!==rule.size||JSON.stringify(actual)!==JSON.stringify(rule.playerIds)){
        showSiteError("Challenge setup is fixed. Restore its rules or leave the challenge.","DRAFT CHALLENGES");return false;
    }return true;
}
function challengeEvaluation(rule,n=1){
    const r=normalizeDraftChallenge(rule),team=teamByNumber(n),snap=shareFormationSnapshot(n),counts={GK:0,DEF:0,MID:0,ATT:0};
    for(const [slot,id]of Object.entries(snap.assignment)){if(!id)continue;const position=snap.shape[slot].label,group=cpuRoleGroup(position);if(group&&canonicalFit(playerById(id),position))counts[group]++;}
    const goals=[{label:"COMPLETE SQUAD",pass:team.players.length===r.size&&snap.deployedCount===Math.min(11,r.size)}];
    goals.push({label:"CHALLENGE POOL",pass:team.players.every(p=>r.playerIds.includes(p.id))});
    if(r.formation)goals.push({label:replayText("FORMATION")+" "+r.formation,pass:snap.formation===r.formation});
    if(r.minChemistry!==null)goals.push({label:replayText("CHEMISTRY")+" ≥ "+r.minChemistry,pass:snap.chemistry.overall>=r.minChemistry});
    if(r.maxOverall!==null)goals.push({label:"OVR ≤ "+r.maxOverall,pass:!!snap.ovr&&snap.ovr<=r.maxOverall});
    for(const [role,count]of Object.entries(r.positionRequirements))goals.push({label:role+" ≥ "+count,pass:counts[role]>=count});
    return {goals,complete:goals.every(goal=>goal.pass)};
}
function ensureCpuSquadBuilt(){
    if(!team2CpuControlled||!team2.players.length)return;
    const key=team2.players.map(p=>p.id).sort((a,b)=>a-b).join(",");
    const valid=Object.values(formationAssignments[2]||{}).length===Math.min(11,team2.players.length)&&Object.values(formationAssignments[2]||{}).every(id=>team2.players.some(p=>p.id===id));
    if(!valid||(cpuBuiltRosterKey&&cpuBuiltRosterKey!==key)){applyBestFormationAndAssignment(2);formationInitialized=true;}
    cpuBuiltRosterKey=key;
}
