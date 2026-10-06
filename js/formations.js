// BLUE LOCK DRAFT // FORMATION LOGIC
// Split from the former root script.js. Classic scripts share the same global scope.

function currentPlayerSlot(teamNumber,id){
    const ass=formationAssignments[teamNumber]||{},shape=FORMATIONS[formationByTeam[teamNumber]||"4-3-3"];
    const k=Object.keys(ass).find(k=>ass[k]===id);return k==null?null:shape[+k]||null;
}

const FORMATIONS = {
 "4-3-3":[
  {x:50,y:90,label:"GK"},
  {x:16,y:72,label:"LB"},{x:38,y:72,label:"CB"},{x:62,y:72,label:"CB"},{x:84,y:72,label:"RB"},
  {x:24,y:48,label:"CM"},{x:50,y:48,label:"CM"},{x:76,y:48,label:"CM"},
  {x:18,y:20,label:"LW"},{x:50,y:20,label:"ST"},{x:82,y:20,label:"RW"}],
 "4-2-3-1":[
  {x:50,y:90,label:"GK"},
  {x:16,y:72,label:"LB"},{x:38,y:72,label:"CB"},{x:62,y:72,label:"CB"},{x:84,y:72,label:"RB"},
  {x:37,y:55,label:"DM"},{x:63,y:55,label:"DM"},
  {x:18,y:35,label:"LW"},{x:50,y:35,label:"AM"},{x:82,y:35,label:"RW"},
  {x:50,y:14,label:"ST"}],
 "4-4-2":[
  {x:50,y:90,label:"GK"},
  {x:16,y:72,label:"LB"},{x:38,y:72,label:"CB"},{x:62,y:72,label:"CB"},{x:84,y:72,label:"RB"},
  {x:15,y:46,label:"LM"},{x:39,y:46,label:"CM"},{x:61,y:46,label:"CM"},{x:85,y:46,label:"RM"},
  {x:36,y:18,label:"ST"},{x:64,y:18,label:"ST"}],
 "4-1-3-2":[
  {x:50,y:90,label:"GK"},
  {x:16,y:72,label:"LB"},{x:38,y:72,label:"CB"},{x:62,y:72,label:"CB"},{x:84,y:72,label:"RB"},
  {x:50,y:57,label:"DM"},
  {x:19,y:38,label:"LM"},{x:50,y:38,label:"AM"},{x:81,y:38,label:"RM"},
  {x:36,y:16,label:"ST"},{x:64,y:16,label:"ST"}],
 "4-3-2-1":[
  {x:50,y:90,label:"GK"},
  {x:16,y:72,label:"LB"},{x:38,y:72,label:"CB"},{x:62,y:72,label:"CB"},{x:84,y:72,label:"RB"},
  {x:25,y:51,label:"CM"},{x:50,y:51,label:"DM"},{x:75,y:51,label:"CM"},
  {x:35,y:30,label:"AM"},{x:65,y:30,label:"AM"},
  {x:50,y:11,label:"ST"}],
 "3-4-3":[
  {x:50,y:90,label:"GK"},
  {x:24,y:72,label:"CB"},{x:50,y:72,label:"CB"},{x:76,y:72,label:"CB"},
  {x:14,y:48,label:"LM"},{x:38,y:48,label:"CM"},{x:62,y:48,label:"CM"},{x:86,y:48,label:"RM"},
  {x:18,y:20,label:"LW"},{x:50,y:20,label:"ST"},{x:82,y:20,label:"RW"}],
 "3-5-2":[
  {x:50,y:90,label:"GK"},
  {x:24,y:72,label:"CB"},{x:50,y:72,label:"CB"},{x:76,y:72,label:"CB"},
  {x:13,y:50,label:"LWB"},{x:34,y:50,label:"CM"},{x:50,y:35,label:"AM"},{x:66,y:50,label:"CM"},{x:87,y:50,label:"RWB"},
  {x:36,y:16,label:"ST"},{x:64,y:16,label:"ST"}],
 "3-4-2-1":[
  {x:50,y:90,label:"GK"},
  {x:24,y:72,label:"CB"},{x:50,y:72,label:"CB"},{x:76,y:72,label:"CB"},
  {x:13,y:50,label:"LWB"},{x:38,y:50,label:"CM"},{x:62,y:50,label:"CM"},{x:87,y:50,label:"RWB"},
  {x:35,y:29,label:"AM"},{x:65,y:29,label:"AM"},
  {x:50,y:10,label:"ST"}],
 "5-3-2":[
  {x:50,y:91,label:"GK"},
  {x:9,y:70,label:"LWB"},{x:29,y:70,label:"CB"},{x:50,y:70,label:"CB"},{x:71,y:70,label:"CB"},{x:91,y:70,label:"RWB"},
  {x:25,y:48,label:"CM"},{x:50,y:48,label:"DM"},{x:75,y:48,label:"CM"},
  {x:36,y:16,label:"ST"},{x:64,y:16,label:"ST"}],
 "5-2-3":[
  {x:50,y:91,label:"GK"},
  {x:9,y:70,label:"LWB"},{x:29,y:70,label:"CB"},{x:50,y:70,label:"CB"},{x:71,y:70,label:"CB"},{x:91,y:70,label:"RWB"},
  {x:38,y:48,label:"CM"},{x:62,y:48,label:"CM"},
  {x:18,y:20,label:"LW"},{x:50,y:20,label:"ST"},{x:82,y:20,label:"RW"}]
};

// Partial squads still use the selected 11-a-side shape, but only the most useful
// tactical slots are treated as the default deployment footprint. Players may
// still be moved into any other slot manually; the footprint follows occupied slots.
const FORMATION_ACTIVE_PRIORITY = {
  "4-3-3":[0,9,6,2,3,8,10,5,7,1,4],
  "4-2-3-1":[0,10,8,2,3,5,6,7,9,1,4],
  "4-4-2":[0,9,10,6,7,2,3,5,8,1,4],
  "4-1-3-2":[0,9,10,5,7,2,3,6,8,1,4],
  "4-3-2-1":[0,10,6,2,3,8,9,5,7,1,4],
  "3-4-3":[0,9,2,5,6,8,10,1,3,4,7],
  "3-5-2":[0,9,10,2,6,5,7,1,3,4,8],
  "3-4-2-1":[0,10,2,5,6,8,9,1,3,4,7],
  "5-3-2":[0,9,10,3,7,2,4,6,8,1,5],
  "5-2-3":[0,9,6,3,7,8,10,2,4,1,5]
};

const CAPTAIN_LEADERSHIP = {
  "Oliver Aiku":12,"Marc Snuffy":12,"Noel Noa":11,"Godwin Kuso":11,"Achanpong":10,
  "Tabito Karasu":10,"Julien Loki":9,"Chris Prince":9,"Lavinho":9,"Sae Itoshi":8,
  "Yoichi Isagi":8,"Reo Mikage":7,"Michael Kaiser":7,"Rin Itoshi":6
};

function formationDeploymentLimit(n){return Math.min(11,teamByNumber(n).players.length);}
function preferredActiveSlotIndicesForFormation(n,formationName){
    const formation=formationName||formationByTeam[n]||"4-3-3";
    const shape=FORMATIONS[formation]||[];
    const priority=FORMATION_ACTIVE_PRIORITY[formation]||shape.map((_,i)=>i);
    return priority.slice(0,formationDeploymentLimit(n));
}
function preferredActiveSlotIndices(n){
    return preferredActiveSlotIndicesForFormation(n,formationByTeam[n]||"4-3-3");
}
function activeFormationSlotIndices(n){
    const limit=formationDeploymentLimit(n);
    if(!limit)return new Set();
    const formation=formationByTeam[n]||"4-3-3";
    const priority=FORMATION_ACTIVE_PRIORITY[formation]||FORMATIONS[formation].map((_,i)=>i);
    const occupied=new Set(Object.keys(formationAssignments[n]||{}).map(Number));
    const active=[];
    priority.forEach(i=>{if(occupied.has(i)&&active.length<limit)active.push(i);});
    [...occupied].forEach(i=>{if(!active.includes(i)&&active.length<limit)active.push(i);});
    priority.forEach(i=>{if(!active.includes(i)&&active.length<limit)active.push(i);});
    return new Set(active.slice(0,limit));
}
function formationTeamOVRForAssignment(n,assignment,formationName=formationByTeam[n]||"4-3-3"){
    const team=teamByNumber(n),shape=FORMATIONS[formationName]||FORMATIONS["4-3-3"];
    const ratings=Object.entries(assignment||{}).map(([slot,id])=>{
        const player=team.players.find(p=>p.id===id),pos=shape[Number(slot)]?.label;
        return player&&pos?effectiveOVR(player,pos):null;
    }).filter(Number.isFinite);
    return ratings.length?Math.round(ratings.reduce((a,b)=>a+b,0)/ratings.length):0;
}
function formationTeamOVR(n){
    return formationTeamOVRForAssignment(n,formationAssignments[n]||{},formationByTeam[n]||"4-3-3");
}
function formationCaptain(n){
    const id=formationCaptainByTeam?.[n];
    return id?teamByNumber(n).players.find(p=>p.id===id)||null:null;
}
function captainRecommendationScore(player){return playerOverall(player)+(CAPTAIN_LEADERSHIP[player.name]||0);}
function recommendedCaptainForAssignment(n,assignment){
    const ids=new Set(Object.values(assignment||{}).filter(Boolean));
    return teamByNumber(n).players.filter(p=>ids.has(p.id)).sort((a,b)=>captainRecommendationScore(b)-captainRecommendationScore(a)||playerOverall(b)-playerOverall(a))[0]||null;
}
function recommendedFormationCaptain(n){
    return recommendedCaptainForAssignment(n,formationAssignments[n]||{});
}
function ensureFormationCaptain(n,autoAssign=false){
    const captain=formationCaptain(n),deployed=assignedIds(n);
    if(captain&&deployed.has(captain.id))return captain;
    formationCaptainByTeam[n]=null;
    if(autoAssign){const next=recommendedFormationCaptain(n);formationCaptainByTeam[n]=next?.id||null;return next;}
    return null;
}
function setFormationCaptain(playerId){
    const n=formationTeamNumber;
    if(!assignedIds(n).has(playerId)){showSiteError("Place the player in the active formation before making them captain.","CAPTAIN MUST BE DEPLOYED");return;}
    formationCaptainByTeam[n]=formationCaptainByTeam[n]===playerId?null:playerId;
    playSfx("confirm");renderFormationBuilder();saveGame();
}
function formationRoleScore(player,label){
    const effective=effectiveOVR(player,label);
    let fit=primaryFit(player,label)?8:canonicalFit(player,label)?3:-7;
    if(label==="GK" && !canonicalFit(player,"GK"))fit-=18;
    if(["CB","LB","RB"].includes(label) && positionGroup(primaryPosition(player))==="ATTACK")fit-=4;
    return effective+fit;
}
function formationChemistryScoreValue(value){
    let bonus=(value-70)*.18;
    if(value>=95)bonus+=2;
    else if(value>=90)bonus+=1;
    if(value<70)bonus-=(70-value)*.12;
    return bonus;
}
function formationAssignmentScore(n,assignment,formationName=formationByTeam[n]||"4-3-3"){
    const team=teamByNumber(n),shape=FORMATIONS[formationName]||FORMATIONS["4-3-3"];
    let score=0;
    Object.entries(assignment||{}).forEach(([slot,id])=>{
        const i=Number(slot),player=team.players.find(p=>p.id===id),label=shape[i]?.label;
        if(player&&label)score+=formationRoleScore(player,label);
    });
    (FORMATION_CHEMISTRY_EDGES[formationName]||[]).forEach(([a,b])=>{
        const pa=team.players.find(p=>p.id===assignment?.[a]),pb=team.players.find(p=>p.id===assignment?.[b]);
        if(pa&&pb)score+=formationChemistryScoreValue(chemistryRelation(pa,pb).score);
    });
    return score;
}
function incrementalFormationCandidateScore(n,formationName,assignment,slotIndex,player){
    const team=teamByNumber(n),shape=FORMATIONS[formationName],label=shape[slotIndex]?.label;
    let score=formationRoleScore(player,label);
    (FORMATION_CHEMISTRY_EDGES[formationName]||[]).forEach(([a,b])=>{
        let other=null;
        if(a===slotIndex)other=b;
        else if(b===slotIndex)other=a;
        if(other===null||assignment[other]==null)return;
        const teammate=team.players.find(p=>p.id===assignment[other]);
        if(teammate)score+=formationChemistryScoreValue(chemistryRelation(player,teammate).score);
    });
    return score;
}
function refineFormationAssignment(n,formationName,initial,maxIterations=10){
    const team=teamByNumber(n);
    let assignment={...initial};
    for(let iteration=0;iteration<maxIterations;iteration++){
        let bestScore=formationAssignmentScore(n,assignment,formationName),best=null;
        const slots=Object.keys(assignment).map(Number);
        for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++){
            const a=slots[i],b=slots[j],test={...assignment};
            [test[a],test[b]]=[test[b],test[a]];
            const score=formationAssignmentScore(n,test,formationName);
            if(score>bestScore+.02){bestScore=score;best=test;}
        }
        const used=new Set(Object.values(assignment));
        const reserves=team.players.filter(p=>!used.has(p.id));
        for(const slot of slots)for(const candidate of reserves){
            const test={...assignment,[slot]:candidate.id};
            const score=formationAssignmentScore(n,test,formationName);
            if(score>bestScore+.02){bestScore=score;best=test;}
        }
        if(!best)break;
        assignment=best;
    }
    return assignment;
}
function solveBestFormationAssignment(n,formationName=formationByTeam[n]||"4-3-3",options={}){
    const team=teamByNumber(n),shape=FORMATIONS[formationName]||FORMATIONS["4-3-3"];
    const active=preferredActiveSlotIndicesForFormation(n,formationName);
    if(!active.length||!team.players.length)return {};

    // Hardest/scarcest roles are solved first so unique GKs/defenders are not consumed elsewhere.
    const ordered=active.map(index=>{
        const label=shape[index].label;
        const primary=team.players.filter(p=>primaryFit(p,label)).length;
        const canonical=team.players.filter(p=>canonicalFit(p,label)).length;
        return {index,label,scarcity:primary*3+canonical};
    }).sort((a,b)=>a.scarcity-b.scarcity||(["GK","CB","DM","ST"].includes(a.label)?-1:1)||a.index-b.index);

    // Beam search keeps several competing lineups alive instead of locking in one greedy pick.
    let beam=[{assignment:{},used:new Set(),score:0}];
    const BEAM_WIDTH=options.beamWidth??220;
    const CANDIDATES_PER_SLOT=Math.min(options.candidatesPerSlot??10,team.players.length);
    const REFINE_ITERATIONS=options.refineIterations??10;
    const REFINE_ALTERNATES=options.refineAlternates??10;
    for(const item of ordered){
        const next=[];
        for(const state of beam){
            const candidates=team.players
              .filter(p=>!state.used.has(p.id))
              .map(p=>({p,inc:incrementalFormationCandidateScore(n,formationName,state.assignment,item.index,p)}))
              .sort((a,b)=>b.inc-a.inc||playerOverall(b.p)-playerOverall(a.p))
              .slice(0,CANDIDATES_PER_SLOT);
            for(const {p,inc} of candidates){
                const used=new Set(state.used);used.add(p.id);
                next.push({assignment:{...state.assignment,[item.index]:p.id},used,score:state.score+inc});
            }
        }
        next.sort((a,b)=>b.score-a.score);
        beam=next.slice(0,BEAM_WIDTH);
    }
    if(!beam.length)return {};
    // Re-rank complete beam states with the exact full scoring function, then locally polish.
    beam.sort((a,b)=>formationAssignmentScore(n,b.assignment,formationName)-formationAssignmentScore(n,a.assignment,formationName));
    let best=refineFormationAssignment(n,formationName,beam[0].assignment,REFINE_ITERATIONS);
    // Give a few alternate top beams a refinement pass so a slightly weaker partial path can win globally.
    for(const candidate of beam.slice(1,Math.min(REFINE_ALTERNATES,beam.length))){
        const refined=refineFormationAssignment(n,formationName,candidate.assignment,REFINE_ITERATIONS);
        if(formationAssignmentScore(n,refined,formationName)>formationAssignmentScore(n,best,formationName)+.02)best=refined;
    }
    return best;
}

function evaluateFormationCandidate(n,formationName,assignment){
    const team=teamByNumber(n),shape=FORMATIONS[formationName]||FORMATIONS["4-3-3"];
    const deployed=Object.entries(assignment||{}).map(([slot,id])=>{
        const i=Number(slot),player=team.players.find(p=>p.id===id),label=shape[i]?.label;
        return player&&label?{player,label}:null;
    }).filter(Boolean);
    if(!deployed.length)return {score:-Infinity,roleAverage:0,teamOvr:0,chemistry:0,exactScore:-Infinity};

    // Normalize role quality so formations with more chemistry edges do not win just
    // because their graph contains more links. Chemistry then acts as a meaningful,
    // but secondary, tie-breaker to positional quality.
    const roleAverage=deployed.reduce((sum,x)=>sum+formationRoleScore(x.player,x.label),0)/deployed.length;
    const teamOvr=formationTeamOVRForAssignment(n,assignment,formationName);
    const activeSlots=new Set(preferredActiveSlotIndicesForFormation(n,formationName));
    const chemistry=formationChemistryForAssignment(n,assignment,formationName,activeSlots).overall||0;
    const chemistryWeight=deployed.length>=2?.28:0;
    const score=roleAverage*(1-chemistryWeight)+chemistry*chemistryWeight;
    return {score,roleAverage,teamOvr,chemistry,exactScore:formationAssignmentScore(n,assignment,formationName)};
}
function solveBestFormationAndAssignment(n){
    const current=formationByTeam[n]||"4-3-3";
    let best=null;
    Object.keys(FORMATIONS).forEach(formationName=>{
        const assignment=solveBestFormationAssignment(n,formationName,{
            beamWidth:80,candidatesPerSlot:8,refineIterations:5,refineAlternates:4
        });
        if(!Object.keys(assignment).length)return;
        const metrics=evaluateFormationCandidate(n,formationName,assignment);
        const candidate={formation:formationName,assignment,...metrics};
        if(!best ||
           candidate.score>best.score+.02 ||
           (Math.abs(candidate.score-best.score)<=.02 && candidate.roleAverage>best.roleAverage+.02) ||
           (Math.abs(candidate.score-best.score)<=.02 && Math.abs(candidate.roleAverage-best.roleAverage)<=.02 && candidate.chemistry>best.chemistry) ||
           (Math.abs(candidate.score-best.score)<=.02 && Math.abs(candidate.roleAverage-best.roleAverage)<=.02 && candidate.chemistry===best.chemistry && candidate.teamOvr>best.teamOvr) ||
           (Math.abs(candidate.score-best.score)<=.02 && Math.abs(candidate.roleAverage-best.roleAverage)<=.02 && candidate.chemistry===best.chemistry && candidate.teamOvr===best.teamOvr && formationName===current)){
            best=candidate;
        }
    });
    return best;
}
function applyBestFormationAndAssignment(n){
    const best=solveBestFormationAndAssignment(n);
    if(!best)return null;
    formationByTeam[n]=best.formation;
    formationAssignments[n]=best.assignment;
    if(formationTeamNumber===n)activeFormation=best.formation;
    ensureFormationCaptain(n,true);
    return best;
}

function openFormationBuilder(){
    uiState={screen:"formation",phase:"formation",turn:null};
    if(formationTeamNumber!==1&&formationTeamNumber!==2)formationTeamNumber=1;
    auctionScreen.classList.add("hidden");
    formationScreen.classList.remove("hidden");
    formationScreen.classList.remove("standalone-builder-mode");
    if(typeof configureFormationHeader==="function")configureFormationHeader(false);
    selectedFormationPlayerId=null;
    if(!formationByTeam || typeof formationByTeam!=="object") formationByTeam={0:"4-3-3",1:"4-3-3",2:"4-3-3"};
    [0,1,2].forEach(n=>{if(!formationByTeam[n]||!FORMATIONS[formationByTeam[n]])formationByTeam[n]="4-3-3";});
    if(!formationInitialized){
        formationTeamNumber=1;
        formationByTeam={0:formationByTeam[0]||"4-3-3",1:"4-3-3",2:"4-3-3"};
        formationAssignments={0:formationAssignments[0]||{},1:{},2:{}};
        formationCaptainByTeam={0:formationCaptainByTeam[0]||null,1:null,2:null};
        formationInitialized=true;
    }else [1,2].forEach(n=>sanitizeFormationAssignments(n));
    activeFormation=formationByTeam[formationTeamNumber]||"4-3-3";
    renderFormationBuilder();saveGame();
    window.scrollTo({top:0,behavior:"smooth"});
}
function autoFillFormation(n){
    return applyBestFormationAndAssignment(n);
}
function sanitizeFormationAssignments(n){
    const teamIds=new Set(teamByNumber(n).players.map(p=>p.id));
    const slots=FORMATIONS[formationByTeam[n]||"4-3-3"];
    const clean={},seen=new Set();
    Object.entries(formationAssignments[n]||{}).forEach(([slot,id])=>{
        const i=Number(slot);
        if(i>=0 && i<slots.length && teamIds.has(id) && !seen.has(id)){clean[i]=id;seen.add(id);}
    });
    formationAssignments[n]=clean;
    ensureFormationCaptain(n,false);
}
function switchFormationTeam(n){
    if(n!==1&&n!==2)return;
    formationTeamNumber=n;
    activeFormation=formationByTeam[n]||"4-3-3";
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function changeFormation(name){
    if(!FORMATIONS[name])return;
    const n=formationTeamNumber;
    const previous={...(formationAssignments[n]||{})};
    formationByTeam[n]=name;activeFormation=name;selectedFormationPlayerId=null;
    const slotCount=FORMATIONS[name].length,preserved={};
    Object.entries(previous).forEach(([slot,id])=>{
        const i=Number(slot);
        if(Number.isInteger(i)&&i>=0&&i<slotCount)preserved[i]=id;
    });
    formationAssignments[n]=preserved;
    sanitizeFormationAssignments(n);
    renderFormationBuilder();saveGame();
}
function autoBestXI(){
    const n=formationTeamNumber;
    const best=applyBestFormationAndAssignment(n);
    if(!best){
        showSiteError("No valid lineup could be generated from this squad.","AUTO BEST TEAM");
        return;
    }
    selectedFormationPlayerId=null;
    playSfx("confirm");
    renderFormationBuilder();saveGame();
}

function resetCurrentFormation(){
    formationAssignments[formationTeamNumber]={};
    formationCaptainByTeam[formationTeamNumber]=null;
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function toggleBench(){
    benchCollapsed=!benchCollapsed;
    renderFormationBuilder();saveGame();
}
function getFormationPlayer(n,slotIndex){
    const id=formationAssignments[n][slotIndex];
    return teamByNumber(n).players.find(p=>p.id===id)||null;
}
function assignedIds(n){return new Set(Object.values(formationAssignments[n]).filter(Boolean));}
function movePlayerToSlot(playerId,slotIndex){
    const n=formationTeamNumber;
    const team=teamByNumber(n);
    if(!team.players.some(p=>p.id===playerId))return;

    const targetPlayer=getFormationPlayer(n,slotIndex);
    const sourceSlot=Object.keys(formationAssignments[n]).find(k=>formationAssignments[n][k]===playerId);

    if(sourceSlot!==undefined) delete formationAssignments[n][sourceSlot];
    if(targetPlayer && targetPlayer.id!==playerId){
        if(sourceSlot!==undefined) formationAssignments[n][sourceSlot]=targetPlayer.id;
        // Dragging from reserves onto an occupied slot sends that player to reserves.
    }
    formationAssignments[n][slotIndex]=playerId;
    if(targetPlayer&&targetPlayer.id!==playerId&&sourceSlot===undefined&&formationCaptainByTeam[n]===targetPlayer.id)formationCaptainByTeam[n]=null;
    formationMoveFx={
        movedId:playerId,
        targetSlot:slotIndex,
        sourceSlot:sourceSlot!==undefined?Number(sourceSlot):null,
        displacedId:targetPlayer&&targetPlayer.id!==playerId?targetPlayer.id:null
    };
    playSfx(targetPlayer&&targetPlayer.id!==playerId?"swap":"drop");
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function movePlayerToBench(playerId){
    const n=formationTeamNumber;
    const sourceSlot=Object.keys(formationAssignments[n]).find(k=>formationAssignments[n][k]===playerId);
    if(sourceSlot!==undefined) delete formationAssignments[n][sourceSlot];
    if(formationCaptainByTeam[n]===playerId)formationCaptainByTeam[n]=null;
    playSfx("drop");
    selectedFormationPlayerId=null;
    renderFormationBuilder();saveGame();
}
function applyFormationMoveFx(){
    if(!formationMoveFx)return;
    const fx=formationMoveFx;
    formationMoveFx=null;
    requestAnimationFrame(()=>{
        const landed=document.querySelector(`.formation-slot[data-slot-index="${fx.targetSlot}"]`);
        if(landed){
            landed.classList.add("slot-landed");
            setTimeout(()=>landed.classList.remove("slot-landed"),420);
        }
        if(fx.displacedId && fx.sourceSlot!==null){
            const swapped=document.querySelector(`.formation-slot[data-slot-index="${fx.sourceSlot}"]`);
            if(swapped){
                swapped.classList.add("slot-swapped");
                setTimeout(()=>swapped.classList.remove("slot-swapped"),420);
            }
        }else if(fx.displacedId){
            const benchCard=document.querySelector(`.bench-player[data-player-id="${fx.displacedId}"]`);
            if(benchCard){
                benchCard.classList.add("bench-arrived");
                benchCard.scrollIntoView?.({block:"nearest"});
                setTimeout(()=>benchCard.classList.remove("bench-arrived"),520);
            }
        }
    });
}
function clickFormationSlot(slotIndex){
    const n=formationTeamNumber;
    const current=getFormationPlayer(n,slotIndex);
    if(selectedFormationPlayerId){
        movePlayerToSlot(selectedFormationPlayerId,slotIndex);
    }else if(current){
        selectedFormationPlayerId=current.id;
        renderFormationBuilder();saveGame();
    }
}
function selectFormationPlayerOnly(id){
    selectedFormationPlayerId = selectedFormationPlayerId===id ? null : id;
    renderFormationBuilder();
    saveGame();
}
function selectBenchPlayer(id) {
    const benchList = document.querySelector('.bench-list');
    const scrollTop = benchList ? benchList.scrollTop : 0;

    if (selectedFormationPlayerId === id) selectedFormationPlayerId = null;
    else selectedFormationPlayerId = id;

    renderFormationBuilder();
    saveGame();

    requestAnimationFrame(() => {
        const newBenchList = document.querySelector('.bench-list');
        if (newBenchList) {
            newBenchList.scrollTop = scrollTop;
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        }
    });
}
function updateLiveFormationTargets(playerId){
    selectedFormationPlayerId=playerId;
    const player=teamByNumber(formationTeamNumber).players.find(p=>p.id===playerId);
    const panel=document.querySelector(".player-info-panel");
    if(panel && !playerDatabaseHidden && player){
      panel.outerHTML=createPlayerInfoSidebar(teamByNumber(formationTeamNumber));
    }
    document.querySelectorAll(".formation-slot").forEach(slot=>{
        slot.classList.remove("drag-canonical-target","drag-primary-target");
        if(!player)return;
        const label=slot.dataset.slotLabel;
        if(canonicalFit(player,label))slot.classList.add("drag-canonical-target");
        if(primaryFit(player,label))slot.classList.add("drag-primary-target");
    });
    const hint=document.querySelector(".formation-instructions strong");
    if(hint&&player)hint.innerHTML=`${esc(player.name)} // PRIMARY: ${primaryPosition(player)} // BEST FITS GLOWING ON PITCH`;
}
function clearLiveFormationTargets(){
    document.querySelectorAll(".formation-slot").forEach(slot=>slot.classList.remove("drag-canonical-target","drag-primary-target"));
}

let formationPointerDrag=null;
let suppressFormationClick=false;

function createFormationPointerPreview(player,x,y){
    // A browser interruption must never be able to leave multiple drag visuals alive.
    document.querySelectorAll(".formation-pointer-preview").forEach(el=>el.remove());
    const preview=document.createElement("div");
    preview.className="formation-pointer-preview";
    preview.innerHTML=`<div class="formation-pointer-ring"><img src="${player.image}" alt="" draggable="false"></div><span>${esc(player.name)}</span>`;
    document.body.appendChild(preview);
    moveFormationPointerPreview(x,y);
    return preview;
}
function moveFormationPointerPreview(x,y){
    const preview=formationPointerDrag?.preview;
    if(!preview)return;
    preview.style.left=x+"px";
    preview.style.top=y+"px";
}
function clearFormationPointerHover(){
    document.querySelectorAll(".formation-slot.pointer-drop-target,.formation-slot.pointer-swap-target,.bench-panel.pointer-drop-target")
      .forEach(el=>el.classList.remove("pointer-drop-target","pointer-swap-target"));
}
function formationDropTargetAt(x,y){
    const hit=document.elementFromPoint(x,y);
    if(!hit)return null;
    return hit.closest(".formation-slot,[data-formation-bench]");
}
function beginFormationPointerDrag(event,id){
    if(event.button!==undefined && event.button!==0)return;
    if(formationPointerDrag)cleanupFormationPointerDrag();
    const player=teamByNumber(formationTeamNumber).players.find(p=>p.id===id);
    if(!player)return;
    const source=event.currentTarget;
    formationPointerDrag={
        id,player,source,pointerId:event.pointerId,
        startX:event.clientX,startY:event.clientY,
        dragging:false,preview:null,target:null,
        originSlot:source.closest(".formation-slot"),
        finishing:false
    };
    source.setPointerCapture?.(event.pointerId);
}
function moveFormationPointerDrag(event){
    const d=formationPointerDrag;
    if(!d || d.pointerId!==event.pointerId)return;
    // If right/middle click joins the primary drag, abort instead of letting the
    // browser enter a mixed-button state that can strand duplicate visuals.
    if(d.dragging && event.pointerType==="mouse" && (event.buttons & ~1)!==0){
        event.preventDefault();
        suppressFormationClick=true;
        cleanupFormationPointerDrag();
        setTimeout(()=>{suppressFormationClick=false},0);
        return;
    }
    const distance=Math.hypot(event.clientX-d.startX,event.clientY-d.startY);
    if(!d.dragging){
        if(distance<7)return;
        d.dragging=true;
        draggedFormationPlayerId=d.id;
        selectedFormationPlayerId=d.id;
        d.source.classList.add("pointer-drag-source");
        if(d.originSlot)d.originSlot.classList.add("pointer-drag-origin");
        d.preview=createFormationPointerPreview(d.player,event.clientX,event.clientY);
        updateLiveFormationTargets(d.id);
        playSfx("select");
        document.body.classList.add("formation-pointer-dragging");
    }
    event.preventDefault();
    moveFormationPointerPreview(event.clientX,event.clientY);
    clearFormationPointerHover();
    d.target=formationDropTargetAt(event.clientX,event.clientY);
    if(d.target){
        d.target.classList.add("pointer-drop-target");
        if(d.target.matches(".formation-slot.occupied"))d.target.classList.add("pointer-swap-target");
    }
}
function finishFormationPointerDrag(event){
    const d=formationPointerDrag;
    if(!d || d.pointerId!==event.pointerId)return;
    d.finishing=true;
    try{d.source.releasePointerCapture?.(event.pointerId)}catch(_){}
    if(!d.dragging){
        formationPointerDrag=null;
        return;
    }
    event.preventDefault();
    suppressFormationClick=true;
    const target=formationDropTargetAt(event.clientX,event.clientY)||d.target;
    const id=d.id;
    cleanupFormationPointerDrag();
    if(target?.matches(".formation-slot")){
        const slotIndex=Number(target.dataset.slotIndex);
        if(Number.isInteger(slotIndex))movePlayerToSlot(id,slotIndex);
    }else if(target?.matches("[data-formation-bench]")){
        movePlayerToBench(id);
    }
    setTimeout(()=>{suppressFormationClick=false},0);
}
function cancelFormationPointerDrag(event){
    const d=formationPointerDrag;
    if(!d || d.finishing || (event?.pointerId!=null && d.pointerId!==event.pointerId))return;
    cleanupFormationPointerDrag();
}
function cleanupFormationPointerDrag(){
    const d=formationPointerDrag;
    if(d?.preview)d.preview.remove();
    // Safety cleanup also removes any orphaned preview left by an interrupted tab/window action.
    document.querySelectorAll(".formation-pointer-preview").forEach(el=>el.remove());
    if(d?.source)d.source.classList.remove("pointer-drag-source");
    if(d?.originSlot)d.originSlot.classList.remove("pointer-drag-origin");
    document.querySelectorAll(".pointer-drag-source,.pointer-drag-origin").forEach(el=>{
        el.classList.remove("pointer-drag-source","pointer-drag-origin");
    });
    clearFormationPointerHover();
    clearLiveFormationTargets();
    document.body.classList.remove("formation-pointer-dragging");
    draggedFormationPlayerId=null;
    formationPointerDrag=null;
}
document.addEventListener("pointermove",moveFormationPointerDrag,{passive:false});
document.addEventListener("pointerup",finishFormationPointerDrag,{passive:false});
document.addEventListener("pointercancel",cancelFormationPointerDrag);
document.addEventListener("lostpointercapture",cancelFormationPointerDrag,true);

function abortFormationDragForSecondaryInput(event){
    if(!formationPointerDrag)return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    suppressFormationClick=true;
    cleanupFormationPointerDrag();
    setTimeout(()=>{suppressFormationClick=false},0);
}

// Mouse pointerdown is only guaranteed for the FIRST pressed button. mousedown
// still fires when right-click is pressed while left-click is already held.
document.addEventListener("mousedown",event=>{
    if(formationPointerDrag && event.button!==0)abortFormationDragForSecondaryInput(event);
},true);
document.addEventListener("auxclick",event=>{
    if(formationPointerDrag)abortFormationDragForSecondaryInput(event);
},true);
document.addEventListener("contextmenu",event=>{
    if(formationPointerDrag){
        abortFormationDragForSecondaryInput(event);
        event.preventDefault();
    }
},true);

// Never allow the browser's own image/HTML drag ghost inside Team Builder.
document.addEventListener("dragstart",event=>{
    if(event.target.closest?.("#formation-screen"))event.preventDefault();
},true);

// A pointerup is not guaranteed when the browser/tab loses focus (tab switch,
// screenshot UI, browser chrome, app switch, etc.). Always tear the drag UI down.
window.addEventListener("blur",()=>cancelFormationPointerDrag());
window.addEventListener("pagehide",()=>cancelFormationPointerDrag());
document.addEventListener("visibilitychange",()=>{
    if(document.hidden)cancelFormationPointerDrag();
});

document.addEventListener("click",event=>{
    if(!suppressFormationClick)return;
    if(event.target.closest(".formation-player-token,.bench-player")){
        event.preventDefault();
        event.stopImmediatePropagation();
    }
},true);

