// BLUE LOCK DRAFT // LOCAL STORAGE + SESSION RESTORE
// Split from the former root script.js. Classic scripts share the same global scope.

function serializePlayerList(list){return list.map(p=>p.id);}
function hydratePlayers(ids=[]){return ids.map(id=>players.find(p=>p.id===id)).filter(Boolean);}
function saveSetupPreferences(){
    try{
        const existing=JSON.parse(localStorage.getItem(SAVE_KEY)||"{}");
        if(existing.gameActive) return;
        localStorage.setItem(SAVE_KEY,JSON.stringify({
            ...existing,gameActive:false,
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
            gameActive:true,uiState,startingBudget,bidIncrement,maxPlayers,startingTeam,auctionNumber,currentBid,currentBidder,draftMode,
            currentPlayerId:currentPlayer?.id??null,
            remainingPlayerIds:serializePlayerList(remainingPlayers),
            selectedPlayerIds:[...selectedPlayerIds],
            team1:{...team1,players:serializePlayerList(team1.players)},
            team2:{...team2,players:serializePlayerList(team2.players)},
            auctionHistory:auctionHistory.map(x=>({...x,playerId:x.player.id,player:undefined})),
            formationTeamNumber,activeFormation,formationByTeam,formationAssignments,formationCaptainByTeam,benchCollapsed,formationInitialized
        }));
    }catch(e){}
}
function loadSavedData(){
    try{return JSON.parse(localStorage.getItem(SAVE_KEY)||"null");}catch(e){return null;}
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
        // Backward-compatible migration from the pre-category save format.
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
