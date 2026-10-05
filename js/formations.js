// BLUE LOCK DRAFT // FORMATION LOGIC
// Split from the former root script.js. Classic scripts share the same global scope.

function currentPlayerSlot(teamNumber,id){
    const ass=formationAssignments[teamNumber]||{},shape=FORMATIONS[formationByTeam[teamNumber]||"4-3-3"];
    const k=Object.keys(ass).find(k=>ass[k]===id);return k==null?null:shape[+k]||null;
}

const FORMATIONS = {
 "4-3-3":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:25,y:47,label:"CM"},{x:50,y:53,label:"CM"},{x:75,y:47,label:"CM"},
  {x:18,y:22,label:"LW"},{x:50,y:15,label:"ST"},{x:82,y:22,label:"RW"}],
 "4-2-3-1":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:38,y:55,label:"DM"},{x:62,y:55,label:"DM"},
  {x:18,y:34,label:"LW"},{x:50,y:38,label:"AM"},{x:82,y:34,label:"RW"},
  {x:50,y:14,label:"ST"}],
 "4-4-2":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:16,y:45,label:"LM"},{x:39,y:51,label:"CM"},{x:61,y:51,label:"CM"},{x:84,y:45,label:"RM"},
  {x:37,y:19,label:"ST"},{x:63,y:19,label:"ST"}],
 "4-1-3-2":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:50,y:57,label:"DM"},
  {x:20,y:39,label:"LM"},{x:50,y:42,label:"AM"},{x:80,y:39,label:"RM"},
  {x:37,y:17,label:"ST"},{x:63,y:17,label:"ST"}],
 "4-3-2-1":[
  {x:50,y:88,label:"GK"},
  {x:17,y:69,label:"LB"},{x:39,y:73,label:"CB"},{x:61,y:73,label:"CB"},{x:83,y:69,label:"RB"},
  {x:27,y:51,label:"CM"},{x:50,y:56,label:"DM"},{x:73,y:51,label:"CM"},
  {x:36,y:31,label:"AM"},{x:64,y:31,label:"AM"},
  {x:50,y:13,label:"ST"}],
 "3-4-3":[
  {x:50,y:88,label:"GK"},
  {x:25,y:70,label:"CB"},{x:50,y:74,label:"CB"},{x:75,y:70,label:"CB"},
  {x:15,y:48,label:"LM"},{x:39,y:53,label:"CM"},{x:61,y:53,label:"CM"},{x:85,y:48,label:"RM"},
  {x:18,y:22,label:"LW"},{x:50,y:15,label:"ST"},{x:82,y:22,label:"RW"}],
 "3-5-2":[
  {x:50,y:88,label:"GK"},
  {x:25,y:70,label:"CB"},{x:50,y:74,label:"CB"},{x:75,y:70,label:"CB"},
  {x:14,y:47,label:"LWB"},{x:35,y:52,label:"CM"},{x:50,y:43,label:"AM"},{x:65,y:52,label:"CM"},{x:86,y:47,label:"RWB"},
  {x:37,y:18,label:"ST"},{x:63,y:18,label:"ST"}],
 "3-4-2-1":[
  {x:50,y:88,label:"GK"},
  {x:25,y:70,label:"CB"},{x:50,y:74,label:"CB"},{x:75,y:70,label:"CB"},
  {x:15,y:50,label:"LWB"},{x:40,y:54,label:"CM"},{x:60,y:54,label:"CM"},{x:85,y:50,label:"RWB"},
  {x:36,y:31,label:"AM"},{x:64,y:31,label:"AM"},
  {x:50,y:13,label:"ST"}],
 "5-3-2":[
  {x:50,y:91,label:"GK"},
  {x:10,y:62,label:"LWB"},{x:29,y:66,label:"CB"},{x:50,y:68,label:"CB"},{x:71,y:66,label:"CB"},{x:90,y:62,label:"RWB"},
  {x:27,y:48,label:"CM"},{x:50,y:53,label:"DM"},{x:73,y:48,label:"CM"},
  {x:37,y:18,label:"ST"},{x:63,y:18,label:"ST"}],
 "5-2-3":[
  {x:50,y:91,label:"GK"},
  {x:10,y:62,label:"LWB"},{x:29,y:66,label:"CB"},{x:50,y:68,label:"CB"},{x:71,y:66,label:"CB"},{x:90,y:62,label:"RWB"},
  {x:39,y:49,label:"CM"},{x:61,y:49,label:"CM"},
  {x:18,y:22,label:"LW"},{x:50,y:15,label:"ST"},{x:82,y:22,label:"RW"}]
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
function preferredActiveSlotIndices(n){
    const formation=formationByTeam[n]||"4-3-3";
    const shape=FORMATIONS[formation]||[];
    const priority=FORMATION_ACTIVE_PRIORITY[formation]||shape.map((_,i)=>i);
    return priority.slice(0,formationDeploymentLimit(n));
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
function formationTeamOVR(n){
    const team=teamByNumber(n),shape=FORMATIONS[formationByTeam[n]||"4-3-3"],ass=formationAssignments[n]||{};
    const ratings=Object.entries(ass).map(([slot,id])=>{
        const player=team.players.find(p=>p.id===id),pos=shape[Number(slot)]?.label;
        return player&&pos?effectiveOVR(player,pos):null;
    }).filter(Number.isFinite);
    return ratings.length?Math.round(ratings.reduce((a,b)=>a+b,0)/ratings.length):0;
}
function formationCaptain(n){
    const id=formationCaptainByTeam?.[n];
    return id?teamByNumber(n).players.find(p=>p.id===id)||null:null;
}
function captainRecommendationScore(player){return playerOverall(player)+(CAPTAIN_LEADERSHIP[player.name]||0);}
function recommendedFormationCaptain(n){
    const ids=assignedIds(n);
    return teamByNumber(n).players.filter(p=>ids.has(p.id)).sort((a,b)=>captainRecommendationScore(b)-captainRecommendationScore(a)||playerOverall(b)-playerOverall(a))[0]||null;
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
function formationAssignmentScore(n,assignment){
    const team=teamByNumber(n),formation=formationByTeam[n]||"4-3-3",shape=FORMATIONS[formation];
    let score=0;
    Object.entries(assignment).forEach(([slot,id])=>{
        const i=Number(slot),player=team.players.find(p=>p.id===id),label=shape[i]?.label;
        if(!player||!label)return;
        score+=effectiveOVR(player,label)+(primaryFit(player,label)?5:canonicalFit(player,label)?2:0);
    });
    (FORMATION_CHEMISTRY_EDGES[formation]||[]).forEach(([a,b])=>{
        const pa=team.players.find(p=>p.id===assignment[a]),pb=team.players.find(p=>p.id===assignment[b]);
        if(!pa||!pb)return;
        const chem=chemistryRelation(pa,pb).score;
        score+=(chem-70)*.10;
        if(chem>=95)score+=1.2;
        else if(chem<70)score-=(70-chem)*.05;
    });
    return score;
}

function openFormationBuilder(){
    uiState={screen:"formation",phase:"formation",turn:null};
    auctionScreen.classList.add("hidden");
    formationScreen.classList.remove("hidden");
    selectedFormationPlayerId=null;
    if(!formationByTeam || typeof formationByTeam!=="object") formationByTeam={1:"4-3-3",2:"4-3-3"};
    [1,2].forEach(n=>{if(!formationByTeam[n]||!FORMATIONS[formationByTeam[n]])formationByTeam[n]="4-3-3";});
    if(!formationInitialized){
        formationTeamNumber=1;formationByTeam={1:"4-3-3",2:"4-3-3"};formationAssignments={1:{},2:{}};formationCaptainByTeam={1:null,2:null};
        formationInitialized=true;
    }else [1,2].forEach(n=>sanitizeFormationAssignments(n));
    activeFormation=formationByTeam[formationTeamNumber]||"4-3-3";
    renderFormationBuilder();saveGame();
    window.scrollTo({top:0,behavior:"smooth"});
}
function autoFillFormation(n){
    const team=teamByNumber(n),active=preferredActiveSlotIndices(n);
    formationAssignments[n]={};
    team.players.slice(0,active.length).forEach((p,i)=>formationAssignments[n][active[i]]=p.id);
    ensureFormationCaptain(n,true);
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
    const n=formationTeamNumber,team=teamByNumber(n),shape=FORMATIONS[formationByTeam[n]||"4-3-3"];
    const active=preferredActiveSlotIndices(n);
    const remaining=[...team.players];
    let assignment={};

    // Phase 1: fill the hardest active roles first using role-adjusted OVR.
    const slotOrder=active.map(index=>{
        const slot=shape[index];
        const viable=remaining.filter(p=>canonicalFit(p,slot.label)).length;
        const primary=remaining.filter(p=>primaryFit(p,slot.label)).length;
        return {slot,index,scarcity:primary*2+viable};
    }).sort((a,b)=>a.scarcity-b.scarcity||a.index-b.index);
    for(const item of slotOrder){
        if(!remaining.length)break;
        const ranked=[...remaining].map(p=>({
            p,
            score:effectiveOVR(p,item.slot.label)+(primaryFit(p,item.slot.label)?5:canonicalFit(p,item.slot.label)?2:0)
        })).sort((a,b)=>b.score-a.score||playerOverall(b.p)-playerOverall(a.p));
        const pick=ranked[0]?.p;if(!pick)continue;
        assignment[item.index]=pick.id;
        remaining.splice(remaining.findIndex(p=>p.id===pick.id),1);
    }

    // Phase 2: local search improves both role quality and demonstrated chemistry.
    // It can swap deployed players or replace one with a reserve if the total XI is better.
    for(let iteration=0;iteration<6;iteration++){
        const current=formationAssignmentScore(n,assignment);
        let bestScore=current,best=null;
        const slots=Object.keys(assignment).map(Number);
        for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++){
            const a=slots[i],b=slots[j],test={...assignment};
            [test[a],test[b]]=[test[b],test[a]];
            const score=formationAssignmentScore(n,test);
            if(score>bestScore+.05){bestScore=score;best=test;}
        }
        const used=new Set(Object.values(assignment));
        const reserves=team.players.filter(p=>!used.has(p.id));
        for(const slot of slots)for(const candidate of reserves){
            const test={...assignment,[slot]:candidate.id};
            const score=formationAssignmentScore(n,test);
            if(score>bestScore+.05){bestScore=score;best=test;}
        }
        if(!best)break;
        assignment=best;
    }

    formationAssignments[n]=assignment;
    ensureFormationCaptain(n,true);
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

