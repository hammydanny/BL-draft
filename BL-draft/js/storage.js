// BLUE LOCK DRAFT // LOCAL STORAGE + SESSION RESTORE
// Split from the former root script.js. Classic scripts share the same global scope.

// Version the payloads, not the established localStorage keys.
const AUCTION_SAVE_SCHEMA_VERSION=1;
const STANDALONE_SAVE_SCHEMA_VERSION=1;

function isSaveRecord(value){
    return value!==null&&typeof value==="object"&&!Array.isArray(value);
}
function isSaveNumber(value){return Number.isFinite(value)&&value>=0;}
function isSavePlayerList(value){
    return Array.isArray(value)&&value.every(Number.isInteger);
}
function isSaveAssignment(value){
    return isSaveRecord(value)&&Object.entries(value).every(([slot,id])=>
        /^(?:[0-9]|10)$/.test(slot)&&(id===null||Number.isInteger(id))
    );
}
function isSaveUI(value){
    return isSaveRecord(value)&&["auction","formation","auction-team-builder"].includes(value.screen)&&
        ["coin","opening","bidding","zero","forced","sold","next","complete","team-builder"].includes(value.phase)&&
        (value.turn==null||value.turn===1||value.turn===2);
}
function isSaveTeam(value,playerKey){
    return isSaveRecord(value)&&typeof value.name==="string"&&
        typeof value.color==="string"&&isSaveNumber(value.budget)&&isSavePlayerList(value[playerKey]);
}
function isSaveHistory(value){
    return Array.isArray(value)&&value.every(entry=>isSaveRecord(entry)&&
        Number.isInteger(entry.playerId)&&[1,2].includes(entry.teamNumber)&&isSaveNumber(entry.price));
}
function isSaveSnapshot(value){
    return isSaveRecord(value)&&isSaveTeam(value.team1,"playerIds")&&isSaveTeam(value.team2,"playerIds")&&
        isSavePlayerList(value.remainingPlayerIds)&&isSaveHistory(value.auctionHistory)&&isSaveUI(value.uiState)&&
        isSaveNumber(value.currentBid)&&isSaveNumber(value.auctionNumber)&&
        (value.currentPlayerId==null||Number.isInteger(value.currentPlayerId))&&
        (value.currentBidder==null||[1,2].includes(value.currentBidder))&&
        (value.startingTeam==null||[1,2].includes(value.startingTeam));
}

// Old saves may contain a player removed from the playable database. Drop only
// missing IDs; keep recorded budgets, valid players and the save schema intact.
function cleanSavedPlayerReferences(value,teamPlayerKey="players"){
    const clean={...value};
    const known=id=>!!playerById(id);
    for(const key of ["remainingPlayerIds","selectedPlayerIds"]){
        if(Array.isArray(value[key]))clean[key]=value[key].filter(known);
    }
    for(const key of ["team1","team2"]){
        if(isSaveRecord(value[key])&&Array.isArray(value[key][teamPlayerKey])){
            clean[key]={...value[key],[teamPlayerKey]:value[key][teamPlayerKey].filter(known)};
        }
    }
    if(Array.isArray(value.auctionHistory))clean.auctionHistory=value.auctionHistory.filter(entry=>known(entry.playerId));
    if(value.currentPlayerId!=null&&!known(value.currentPlayerId)){
        clean.currentPlayerId=null;
        if(value.uiState?.phase!=="complete"&&value.uiState?.screen!=="formation"){
            clean.uiState={screen:"auction",phase:"next",turn:null};
        }
    }
    if(isSaveRecord(value.formationAssignments)&&Object.values(value.formationAssignments).every(isSaveRecord)){
        clean.formationAssignments=Object.fromEntries(Object.entries(value.formationAssignments).map(([team,assignment])=>
            [team,Object.fromEntries(Object.entries(assignment).filter(([,id])=>id===null||known(id)))]));
    }
    if(isSaveRecord(value.formationCaptainByTeam)){
        clean.formationCaptainByTeam=Object.fromEntries(Object.entries(value.formationCaptainByTeam).map(([team,id])=>[team,known(id)?id:null]));
    }
    return clean;
}

// Missing schemaVersion means the legacy payload. Migration is in memory only.
// Reject unsupported versions or malformed structures before they reach UI code.
function normalizeAuctionSave(value){
    if(!isSaveRecord(value)||
       (value.schemaVersion!==undefined&&value.schemaVersion!==AUCTION_SAVE_SCHEMA_VERSION))return null;
    if(value.gameActive!==undefined&&typeof value.gameActive!=="boolean")return null;
    if(value.setup!==undefined){
        const setup=value.setup;
        if(!isSaveRecord(setup))return null;
        if(setup.selected!==undefined&&!isSavePlayerList(setup.selected))return null;
        for(const key of ["poolCategories","poolManualOverrides"]){
            if(setup[key]!==undefined&&(!isSaveRecord(setup[key])||
               !Object.values(setup[key]).every(v=>typeof v==="boolean")))return null;
        }
        for(const key of ["team1Name","team2Name","team1Color","team2Color","poolPosition","poolGroup","poolSort"]){
            if(setup[key]!==undefined&&typeof setup[key]!=="string")return null;
        }
        for(const key of ["budget","bidIncrement","maxPlayers"]){
            if(setup[key]!==undefined&&!isSaveNumber(Number(setup[key])))return null;
        }
    }
    if(value.gameActive){
        if(!isSaveTeam(value.team1,"players")||!isSaveTeam(value.team2,"players")||
           !isSavePlayerList(value.remainingPlayerIds))return null;
        for(const key of ["startingBudget","bidIncrement","maxPlayers","auctionNumber","currentBid"]){
            if(!isSaveNumber(value[key]))return null;
        }
        if(value.bidIncrement<=0||value.maxPlayers<=0)return null;
        if(value.currentPlayerId!=null&&!Number.isInteger(value.currentPlayerId))return null;
        if(value.currentBidder!=null&&![1,2].includes(value.currentBidder))return null;
        if(value.startingTeam!=null&&![1,2].includes(value.startingTeam))return null;
        if(value.selectedPlayerIds!==undefined&&!isSavePlayerList(value.selectedPlayerIds))return null;
        if(value.uiState!==undefined&&!isSaveUI(value.uiState))return null;
        if(value.auctionHistory!==undefined&&!isSaveHistory(value.auctionHistory))return null;
        for(const key of ["auctionUndoStack","auctionRedoStack"]){
            if(value[key]!==undefined&&(!Array.isArray(value[key])||!value[key].every(isSaveSnapshot)))return null;
        }
        if(value.formationTeamNumber!==undefined&&![0,1,2].includes(value.formationTeamNumber))return null;
        if(value.activeFormation!==undefined&&!Object.hasOwn(FORMATIONS,value.activeFormation))return null;
        if(value.formationByTeam!==undefined&&(!isSaveRecord(value.formationByTeam)||
           !Object.values(value.formationByTeam).every(name=>Object.hasOwn(FORMATIONS,name))))return null;
        if(value.formationAssignments!==undefined&&(!isSaveRecord(value.formationAssignments)||
           !Object.values(value.formationAssignments).every(isSaveAssignment)))return null;
        if(value.formationCaptainByTeam!==undefined&&(!isSaveRecord(value.formationCaptainByTeam)||
           !Object.values(value.formationCaptainByTeam).every(id=>id===null||Number.isInteger(id))))return null;
    }
    const normalized={...cleanSavedPlayerReferences(value),schemaVersion:AUCTION_SAVE_SCHEMA_VERSION};
    if(value.setup){
        normalized.setup={...value.setup};
        if(value.setup.selected)normalized.setup.selected=value.setup.selected.filter(id=>playerById(id));
        if(value.setup.poolManualOverrides)normalized.setup.poolManualOverrides=Object.fromEntries(
            Object.entries(value.setup.poolManualOverrides).filter(([id])=>playerById(Number(id))));
    }
    for(const key of ["auctionUndoStack","auctionRedoStack"]){
        if(Array.isArray(value[key]))normalized[key]=value[key].map(snapshot=>cleanSavedPlayerReferences(snapshot,"playerIds"));
    }
    if(value.gameActive&&(value.uiState?.screen==="auction-team-builder"||value.uiState?.phase==="team-builder")){
        normalized.uiState={screen:"formation",phase:"complete",turn:null};
    }
    return normalized;
}

function normalizeStandaloneSave(value){
    if(!isSaveRecord(value)||
       (value.schemaVersion!==undefined&&value.schemaVersion!==STANDALONE_SAVE_SCHEMA_VERSION))return null;
    if(value.playerIds!==undefined&&!isSavePlayerList(value.playerIds))return null;
    if(value.assignment!==undefined&&!isSaveAssignment(value.assignment))return null;
    if(value.captainId!=null&&!Number.isInteger(value.captainId))return null;
    for(const key of ["role","sort","formation"]){
        if(value[key]!==undefined&&typeof value[key]!=="string")return null;
    }
    const playerIds=(value.playerIds||[]).filter(id=>playerById(id));
    const selected=new Set(playerIds);
    return {...value,schemaVersion:STANDALONE_SAVE_SCHEMA_VERSION,
        playerIds,
        formation:Object.hasOwn(FORMATIONS,value.formation)?value.formation:"4-3-3",
        assignment:Object.fromEntries(Object.entries(value.assignment||{}).filter(([,id])=>id===null||selected.has(id))),
        captainId:selected.has(value.captainId)?value.captainId:null};
}

function serializePlayerList(list){return list.map(p=>p.id);}
function hydratePlayers(ids=[]){return ids.map(playerById).filter(Boolean);}
function saveSetupPreferences(){
    try{
        const existing=normalizeAuctionSave(JSON.parse(localStorage.getItem(SAVE_KEY)||"{}"));
        if(!existing||existing.gameActive)return;
        localStorage.setItem(SAVE_KEY,JSON.stringify({
            ...existing,schemaVersion:AUCTION_SAVE_SCHEMA_VERSION,gameActive:false,
            setup:{
                team1Name:document.getElementById("team1Name").value,
                team2Name:document.getElementById("team2Name").value,
                team1Color:document.getElementById("team1Color").value,
                team2Color:document.getElementById("team2Color").value,
                budget:document.getElementById("budget").value,
                bidIncrement:document.getElementById("bidIncrement").value,
                maxPlayers:document.getElementById("maxPlayers").value,
                selected:[...selectedPlayerIds],
                poolCategories:{...playerPoolCategoryState},
                poolManualOverrides:{...playerPoolManualOverrides},
                poolPosition:playerPoolPositionFilter,
                poolGroup:playerPoolGroupFilter,
                poolSort:playerPoolSort
            }
        }));
    }catch(e){}
}
function saveGame(){
    if(uiState.screen==="standalone-builder"){
        if(typeof saveStandaloneBuilderState==="function")saveStandaloneBuilderState();
        return;
    }
    if(uiState.screen==="setup"){saveSetupPreferences();return;}
    try{
        localStorage.setItem(SAVE_KEY,JSON.stringify({
            schemaVersion:AUCTION_SAVE_SCHEMA_VERSION,
            gameActive:true,uiState,startingBudget,bidIncrement,maxPlayers,startingTeam,auctionNumber,currentBid,currentBidder,draftMode,
            currentPlayerId:currentPlayer?.id??null,
            remainingPlayerIds:serializePlayerList(remainingPlayers),
            selectedPlayerIds:[...selectedPlayerIds],
            team1:{...team1,players:serializePlayerList(team1.players)},
            team2:{...team2,players:serializePlayerList(team2.players)},
            auctionHistory:auctionHistory.map(x=>({...x,playerId:x.player.id,player:undefined})),
            auctionUndoStack,auctionRedoStack,
            formationTeamNumber,activeFormation,formationByTeam,formationAssignments,formationCaptainByTeam,benchCollapsed,formationInitialized
        }));
    }catch(e){}
}
function loadSavedData(){
    try{return normalizeAuctionSave(JSON.parse(localStorage.getItem(SAVE_KEY)||"null"));}catch(e){return null;}
}
function clearSavedGame(){localStorage.removeItem(SAVE_KEY);}
function restoreSetup(saved){
    const s=saved?.setup;if(!s)return;
    ["team1Name","team2Name","team1Color","team2Color","budget","bidIncrement","maxPlayers"].forEach(id=>{
        if(s[id]!==undefined)document.getElementById(id).value=s[id];
    });
    document.getElementById("team1ColorValue").textContent=document.getElementById("team1Color").value.toUpperCase();
    document.getElementById("team2ColorValue").textContent=document.getElementById("team2Color").value.toUpperCase();
    if(s.poolCategories&&typeof s.poolCategories==="object"){
        playerPoolCategoryState={...s.poolCategories};
        playerPoolManualOverrides={...(s.poolManualOverrides||{})};
        recomputeSelectedPlayersFromCategories();
    }else if(Array.isArray(s.selected)){
        // Backward-compatible migration from the old quick-preset save format.
        playerPoolCategoryState=Object.fromEntries(Object.keys(PLAYER_POOL_CATEGORIES||{}).map(k=>[k,false]));
        playerPoolManualOverrides=Object.fromEntries(s.selected.map(id=>[id,true]));
        recomputeSelectedPlayersFromCategories();
    }
    if(typeof renderPoolCategoryControls==="function")renderPoolCategoryControls();
    playerPoolPositionFilter=s.poolPosition||"ALL";
    playerPoolGroupFilter=(s.poolGroup==="all"||PLAYER_POOL_CATEGORY_IDS?.[s.poolGroup])?s.poolGroup:"all";
    playerPoolSort=s.poolSort||"id";
    if(document.getElementById("playerPositionFilter"))document.getElementById("playerPositionFilter").value=playerPoolPositionFilter;
    if(document.getElementById("playerGroupFilter"))document.getElementById("playerGroupFilter").value=playerPoolGroupFilter;
    if(document.getElementById("playerSort"))document.getElementById("playerSort").value=playerPoolSort;
    renderPlayerPool();
}
function showResumeCard(saved){
    const card=document.getElementById("resumeSessionCard");
    if(!saved?.gameActive){card.classList.add("hidden");return;}
    card.classList.remove("hidden");
    document.getElementById("resumeSessionTitle").textContent=`AUCTION ${String(saved.auctionNumber||0).padStart(2,"0")} // IN PROGRESS`;
    document.getElementById("resumeSessionMeta").textContent=
      `${saved.team1?.name||"TEAM 1"} ${saved.team1?.players?.length||0}/${saved.maxPlayers}  •  ${saved.team2?.name||"TEAM 2"} ${saved.team2?.players?.length||0}/${saved.maxPlayers}`;
}
function restoreGame(saved){
    saved=normalizeAuctionSave(saved);
    if(!saved?.gameActive)return;
    startingBudget=saved.startingBudget;bidIncrement=saved.bidIncrement;maxPlayers=saved.maxPlayers;startingTeam=saved.startingTeam;
    draftMode=saved.draftMode==="random"?"random":"auction";
    auctionNumber=saved.auctionNumber;currentBid=saved.currentBid;currentBidder=saved.currentBidder;
    currentPlayer=players.find(p=>p.id===saved.currentPlayerId)||null;
    remainingPlayers=hydratePlayers(saved.remainingPlayerIds);
    selectedPlayerIds=new Set(saved.selectedPlayerIds||players.map(p=>p.id));
    team1={...saved.team1,players:hydratePlayers(saved.team1?.players)};
    team2={...saved.team2,players:hydratePlayers(saved.team2?.players)};
    auctionHistory=(saved.auctionHistory||[]).map(x=>({...x,player:players.find(p=>p.id===x.playerId)})).filter(x=>x.player);
    auctionUndoStack=Array.isArray(saved.auctionUndoStack)?saved.auctionUndoStack:[];
    auctionRedoStack=Array.isArray(saved.auctionRedoStack)?saved.auctionRedoStack:[];
    formationTeamNumber=saved.formationTeamNumber||1;
    formationByTeam=saved.formationByTeam||{1:saved.activeFormation||"4-3-3",2:saved.activeFormation||"4-3-3"};
    activeFormation=formationByTeam[formationTeamNumber]||"4-3-3";
    formationAssignments=saved.formationAssignments||{1:{},2:{}};
    formationCaptainByTeam=saved.formationCaptainByTeam||{1:null,2:null};
    benchCollapsed=!!saved.benchCollapsed;formationInitialized=!!saved.formationInitialized;
    uiState=saved.uiState||{screen:"auction",phase:"opening",turn:null};
    menuScreen.classList.add("hidden");setupScreen.classList.add("hidden");formationScreen.classList.add("hidden");auctionScreen.classList.remove("hidden");
    updatePlayersRemaining();
    resumeCurrentView();
}
function resumeCurrentView(){
    if(uiState.phase==="coin"){showCoinFlip();return;}
    if(uiState.screen==="formation"){auctionScreen.classList.add("hidden");formationScreen.classList.remove("hidden");renderFormationBuilder();return;}
    if(uiState.phase==="complete"){showAuctionComplete();return;}
    if(!currentPlayer){startNextAuction();return;}
    if(uiState.phase==="bidding"){displayBiddingTurn(uiState.turn);return;}
    if(uiState.phase==="zero"){displayZeroBudgetChoice(uiState.turn);return;}
    if(uiState.phase==="forced"){showForcedAssignment(uiState.turn,true);return;}
    if(uiState.phase==="sold"){
        const last=auctionHistory[auctionHistory.length-1];
        renderSoldState(last);return;
    }
    displayOpeningBid();
}
