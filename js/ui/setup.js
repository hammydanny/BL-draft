// BLUE LOCK DRAFT // SETUP UI
// Split from the former root script.js. Classic scripts share the same global scope.

function applyGameMode(mode){
    const data=GAME_MODES[mode];
    document.querySelectorAll("[data-game-mode]").forEach(b=>b.classList.toggle("active",b.dataset.gameMode===mode));
    if(!data)return;
    document.getElementById("budget").value=data.budget;
    document.getElementById("bidIncrement").value=data.increment;
    document.getElementById("maxPlayers").value=data.maxPlayers;
    updatePoolStatus();
    saveSetupPreferences();
}
document.querySelectorAll("[data-game-mode]").forEach(button=>{
    button.addEventListener("click",()=>applyGameMode(button.dataset.gameMode));
});
["budget","bidIncrement","maxPlayers"].forEach(id=>{
    document.getElementById(id).addEventListener("input",()=>{
        const matched=Object.entries(GAME_MODES).find(([,m])=>
            Number(document.getElementById("budget").value)===m.budget &&
            Number(document.getElementById("bidIncrement").value)===m.increment &&
            Number(document.getElementById("maxPlayers").value)===m.maxPlayers
        );
        document.querySelectorAll("[data-game-mode]").forEach(b=>b.classList.toggle("active",matched?b.dataset.gameMode===matched[0]:b.dataset.gameMode==="custom"));
    });
});

function ensurePoolCategoryState(){
    const keys=Object.keys(PLAYER_POOL_CATEGORIES);
    if(!playerPoolCategoryState||typeof playerPoolCategoryState!=="object")playerPoolCategoryState={};
    if(!playerPoolManualOverrides||typeof playerPoolManualOverrides!=="object")playerPoolManualOverrides={};
    if(!keys.some(k=>Object.prototype.hasOwnProperty.call(playerPoolCategoryState,k))){
        keys.forEach(k=>playerPoolCategoryState[k]=true);
    }else keys.forEach(k=>{if(typeof playerPoolCategoryState[k]!=="boolean")playerPoolCategoryState[k]=false;});
}
function categoryBaseSelected(playerId){
    return Object.entries(playerPoolCategoryState).some(([key,enabled])=>enabled&&PLAYER_POOL_CATEGORY_IDS[key]?.has(playerId));
}
function recomputeSelectedPlayersFromCategories(){
    ensurePoolCategoryState();
    selectedPlayerIds=new Set(players.filter(player=>{
        if(!secretPlayerAvailable(player))return false;
        const manual=playerPoolManualOverrides[player.id];
        return typeof manual==="boolean"?manual:categoryBaseSelected(player.id);
    }).map(player=>player.id));
}
// Short chip captions keep the nine filters secondary. Full category names remain
// on each checkbox and in its tooltip, including the actual selection count.
const POOL_CATEGORY_CAPTIONS=Object.freeze({"blue-lock-project":"BLUE LOCK","original-u20":"JAPAN U-20 · ORIGINAL","world-five":"WORLD FIVE","master-strikers":"MASTERS","new-gen-11":"NG XI","nel-foreign":"NEL · OVERSEAS","japan-world-cup":"JAPAN · WORLD CUP","world-cup-new":"WORLD CUP · NEW","side-b":"SIDE-B"});
function renderPoolCategoryControls(){
    ensurePoolCategoryState();
    document.querySelectorAll("[data-pool-category]").forEach(input=>{
        const ids=PLAYER_POOL_CATEGORY_IDS[input.dataset.poolCategory]||new Set();
        const selectedCount=[...ids].filter(id=>selectedPlayerIds.has(id)).length;
        input.checked=ids.size>0&&selectedCount===ids.size;
        input.indeterminate=selectedCount>0&&selectedCount<ids.size;
        const label=input.closest("label");
        if(label){
            label.dataset.selectionState=input.checked?"all":input.indeterminate?"partial":"none";
            const category=PLAYER_POOL_CATEGORIES[input.dataset.poolCategory];
            input.setAttribute("aria-label",category.label);
            const caption=input.nextElementSibling?.firstChild;
            if(caption?.nodeType===3)caption.nodeValue=POOL_CATEGORY_CAPTIONS[input.dataset.poolCategory]||category.label;
            label.title=`${category.label} // ${selectedCount}/${ids.size} players selected`;
        }
    });
}
function setPoolCategoryEnabled(key,enabled){
    if(!PLAYER_POOL_CATEGORY_IDS[key])return;
    ensurePoolCategoryState();
    playerPoolCategoryState[key]=!!enabled;
    // The checkbox reflects actual members, not a hidden category flag. Apply
    // the explicit click to every member; overlapping groups show partial state.
    PLAYER_POOL_CATEGORY_IDS[key].forEach(id=>playerPoolManualOverrides[id]=!!enabled);
    recomputeSelectedPlayersFromCategories();
    renderPlayerPool();
    saveSetupPreferences();
}
function playerMatchesPoolGroup(player,group){
    if(!group||group==="all")return true;
    return !!PLAYER_POOL_CATEGORY_IDS[group]?.has(player.id);
}
function poolSortValue(player,key){
    if(key==="name")return player.name.toLowerCase();
    if(key==="id")return player.id;
    const stats=playerStats(player);
    if(key==="ovr")return playerOverall(player);
    return Number(stats[key]||0);
}
function renderPlayerPool(){
    const grid=document.getElementById("playerPoolGrid");
    const empty=document.getElementById("playerPoolEmpty");
    const query=document.getElementById("playerSearch").value.trim().toLowerCase();
    const position=document.getElementById("playerPositionFilter")?.value||playerPoolPositionFilter||"ALL";
    const group=document.getElementById("playerGroupFilter")?.value||playerPoolGroupFilter||"all";
    const sort=document.getElementById("playerSort")?.value||playerPoolSort||"id";
    playerPoolPositionFilter=position;playerPoolGroupFilter=group;playerPoolSort=sort;

    const revealSecretCharacters=query===SECRET_CHARACTER_CODE;
    let visiblePlayers=players.filter(player => {
        if(player.secretCharacter&&!revealSecretCharacters)return false;
        if(!secretPlayerAvailable(player))return false;
        const matchesQuery=player.secretCharacter?revealSecretCharacters:player.name.toLowerCase().includes(query);
        const matchesPosition=position==="ALL" || player.allPositions===true || positionGroup(primaryPosition(player))===position;
        const matchesGroup=playerMatchesPoolGroup(player,group);
        return matchesQuery&&matchesPosition&&matchesGroup;
    });
    visiblePlayers.sort((a,b)=>{
        if(a.secretCharacter!==b.secretCharacter)return a.secretCharacter?-1:1;
        const av=poolSortValue(a,sort),bv=poolSortValue(b,sort);
        if(typeof av==="string")return av.localeCompare(bv);
        return sort==="id"?comparePlayerAppearance(a,b):bv-av||comparePlayerAppearance(a,b);
    });

    grid.innerHTML=visiblePlayers.map(player => {
        const selected=selectedPlayerIds.has(player.id);
        return `<div class="pool-player-card ${selected?"selected":""}" data-player-id="${player.id}">
            <button type="button" class="pool-select-hit" aria-pressed="${selected}" aria-label="${selected?"Remove":"Add"} ${esc(player.name)} from auction pool">
              <div class="pool-player-check">${selected?"✓":"+"}</div>
              <img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" loading="lazy" decoding="async" width="160" height="168">
              <div class="pool-player-info">
                  <span>PLAYER // ${String(player.id).padStart(2,"0")} // OVR ${playerOverall(player)}</span>
                  <strong>${esc(player.name)}</strong>
              </div>
            </button>
        </div>`;
    }).join("");
    prioritizeVisiblePortraits(grid);

    grid.querySelectorAll(".pool-select-hit").forEach(button => {
        button.addEventListener("click", () => {
            const id=Number(button.closest(".pool-player-card").dataset.playerId);
            const next=!selectedPlayerIds.has(id);
            playerPoolManualOverrides[id]=next;
            recomputeSelectedPlayersFromCategories();
            renderPlayerPool();
            saveSetupPreferences();
        });
    });
    renderPoolCategoryControls();
    empty.classList.toggle("hidden", visiblePlayers.length !== 0);
    updatePoolStatus();
}
function updatePoolStatus(){
    const count=document.getElementById("selectedPlayerCount");
    const requirement=document.getElementById("poolRequirement");
    const max=Number(document.getElementById("maxPlayers").value)||0;
    const needed=max*2;
    const selected=selectedPlayerIds.size;
    const availableCount=players.filter(secretPlayerAvailable).length;
    count.textContent=`${selected} / ${availableCount}`;
    if(max<=0){
        requirement.textContent="ENTER A VALID TEAM SIZE";
        requirement.className="pool-requirement warning";
    } else if(selected<needed){
        requirement.textContent=`NEED ${needed} PLAYERS TO FILL BOTH TEAMS`;
        requirement.className="pool-requirement warning";
    } else {
        requirement.textContent=`READY // ${selected} PLAYERS IN POOL`;
        requirement.className="pool-requirement ready";
    }
}

ensurePoolCategoryState();
recomputeSelectedPlayersFromCategories();
document.querySelectorAll("[data-pool-category]").forEach(input=>{
    input.addEventListener("change",()=>setPoolCategoryEnabled(input.dataset.poolCategory,input.checked));
});
["playerPositionFilter","playerGroupFilter","playerSort"].forEach(id=>{
    document.getElementById(id)?.addEventListener("change",()=>{renderPlayerPool();saveSetupPreferences();});
});
// The destination route renders the pool after restoring setup preferences.

document.getElementById("startGame").addEventListener("click",startGame);
document.getElementById("randomDraftGame").addEventListener("click",startRandomDraft);
const playerSearchInput=document.getElementById("playerSearch");
playerSearchInput.placeholder="SEARCH PLAYERS...";
playerSearchInput.addEventListener("input",()=>{
    const revealSecretCharacters=playerSearchInput.value.trim()===SECRET_CHARACTER_CODE;
    if(revealSecretCharacters){
        unlockSecretCharacters();
        document.getElementById("playerGroupFilter").value="all";
        document.getElementById("playerPositionFilter").value="ALL";
        playerPoolGroupFilter="all";playerPoolPositionFilter="ALL";
        recomputeSelectedPlayersFromCategories();
        saveSetupPreferences();
    }
    // Keep the code in the search bar: secret entries are visible only while
    // this exact code remains here.
    renderPlayerPool();
});
document.getElementById("selectAllPlayers").addEventListener("click", () => {
    const revealSecretCharacters=playerSearchInput.value.trim()===SECRET_CHARACTER_CODE;
    const previousSelected=new Set(selectedPlayerIds);
    Object.keys(PLAYER_POOL_CATEGORIES).forEach(k=>playerPoolCategoryState[k]=true);
    playerPoolManualOverrides={};
    players.filter(player=>player.secretCharacter).forEach(player=>{
        // Bulk-select only reveals/adds hidden entries when their code is present.
        playerPoolManualOverrides[player.id]=revealSecretCharacters?true:previousSelected.has(player.id);
    });
    recomputeSelectedPlayersFromCategories();renderPlayerPool();saveSetupPreferences();
});
document.getElementById("invertPlayers").addEventListener("click", () => {
    const previous=new Set(selectedPlayerIds);
    const revealSecretCharacters=playerSearchInput.value.trim()===SECRET_CHARACTER_CODE;
    players.forEach(p=>{
        if(p.secretCharacter&&!revealSecretCharacters){
            playerPoolManualOverrides[p.id]=previous.has(p.id);
            return;
        }
        playerPoolManualOverrides[p.id]=secretPlayerAvailable(p)?!previous.has(p.id):false;
    });
    recomputeSelectedPlayersFromCategories();
    renderPlayerPool();
    saveSetupPreferences();
});
document.getElementById("clearAllPlayers").addEventListener("click", () => {
    Object.keys(PLAYER_POOL_CATEGORIES).forEach(k=>playerPoolCategoryState[k]=false);
    playerPoolManualOverrides={};
    recomputeSelectedPlayersFromCategories();renderPlayerPool();saveSetupPreferences();
});
document.getElementById("maxPlayers").addEventListener("input", updatePoolStatus);

function syncTeamConfigColor(input){
    if(!input)return;
    const team=input.id==="team1Color"?"1":"2";
    document.querySelector(`.team-config-${team}`)?.style.setProperty("--team-config-color",input.value);
    const output=document.getElementById(input.id+"Value");
    if(output)output.textContent=input.value.toUpperCase();
}
function syncTeamConfigColors(){
    ["team1Color","team2Color"].forEach(id=>syncTeamConfigColor(document.getElementById(id)));
}
["team1Color","team2Color"].forEach(id => {
    const input=document.getElementById(id);
    syncTeamConfigColor(input);
    input.addEventListener("input",()=>syncTeamConfigColor(input));
});
window.addEventListener("load",syncTeamConfigColors,{once:true});

["team1Name","team2Name","team1Color","team2Color","budget","bidIncrement","maxPlayers"].forEach(id=>document.getElementById(id).addEventListener("change",saveSetupPreferences));

