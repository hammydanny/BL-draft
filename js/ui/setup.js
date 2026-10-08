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

const PLAYER_POOL_CATEGORIES = {
    "blue-lock-project":{
        label:"BLUE LOCK PROJECT",
        names:["Yoichi Isagi","Ryosuke Kira","Meguru Bachira","Gurimu Igarashi","Rensuke Kunigami","Hyoma Chigiri","Gin Gagamaru","Jingo Raichi","Asahi Naruhaya","Okuhito Iemon","Wataru Kuon","Yudai Imamura","Shoei Baro","Ikki Niko","Hibiki Okawa","Junichi Wanima","Keisuke Wanima","Reo Mikage","Seishiro Nagi","Zantetsu Tsurugi","Rin Itoshi","Jyubei Aryu","Aoshi Tokimitsu","Ranze Kurona","Yo Hiori","Tabito Karasu","Eita Otoya","Kenyu Yukimiya","Ryusei Shido","Nijiro Nanase","Jin Kiyora","Hajime Nishioka","Shizuka Haiji","Reiji Hiiragi","Taiga Tsunzaki","Aiki Himizu"]
    },
    "original-u20":{
        label:"ORIGINAL JAPAN U-20",
        names:["Sae Itoshi","Gen Fukaku","Oliver Aiku","Kazuma Nio","Miroku Darai","Teppei Neru","Itsuki Wakatsuki","Haru Hayate","Kento Cho","Teru Kitsunezato","Shuto Sendo","Ryusei Shido"]
    },
    "world-five":{
        label:"WORLD FIVE",
        names:["Leonardo Luna","Pablo Cavasoz","Adam Blake","Dada Silva","Julien Loki"]
    },
    "master-strikers":{
        label:"MASTER STRIKERS",
        names:["Noel Noa","Lavinho","Chris Prince","Marc Snuffy","Julien Loki"]
    },
    "new-gen-11":{
        label:"NEW GENERATION XI",
        names:["Sae Itoshi","Michael Kaiser","Don Lorenzo","Bunny Iglesias","Vivien Hugo","Teddy Knight"]
    },
    "nel-foreign":{
        label:"NEL FOREIGN PLAYERS",
        names:["Noel Noa","Julien Loki","Michael Kaiser","Alexis Ness","Benedict Grim","Lavinho","Chris Prince","Agi","Marc Snuffy","Don Lorenzo","Charles Chevalier","Rooke","Renoir"]
    },
    "japan-world-cup":{
        label:"JAPAN U-20 WORLD CUP",
        names:["Yoichi Isagi","Rin Itoshi","Ryusei Shido","Meguru Bachira","Hyoma Chigiri","Reo Mikage","Rensuke Kunigami","Eita Otoya","Oliver Aiku","Tabito Karasu","Gin Gagamaru","Jyubei Aryu","Kenyu Yukimiya","Ikki Niko","Yo Hiori","Shuto Sendo","Ranze Kurona","Zantetsu Tsurugi","Gen Fukaku","Jingo Raichi","Jin Kiyora","Nijiro Nanase","Shoei Baro"]
    },
    "world-cup-new":{
        label:"U-20 WC NEWCOMERS",
        names:["Bunny Iglesias","Innocent Onazi","Godwin Kuso","Vivien Hugo","Achanpong","Lockhart","Teddy Knight","Childs","Oboabona","Bello","Bats","Leyden","Hermes"]
    },
    "side-b":{
        label:"SIDE-B",
        names:["Seishiro Nagi","Ryosuke Kira","Haneru Shindo","Hajime Nishioka","Shigeo Mizuki","Reiji Hiiragi","Aiki Himizu","Keisuke Wanima","Hibiki Okawa"]
    }
};
const PLAYER_POOL_CATEGORY_IDS=Object.fromEntries(Object.entries(PLAYER_POOL_CATEGORIES).map(([key,data])=>[
    key,new Set(players.filter(p=>data.names.includes(p.name)).map(p=>p.id))
]));

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
        const manual=playerPoolManualOverrides[player.id];
        return typeof manual==="boolean"?manual:categoryBaseSelected(player.id);
    }).map(player=>player.id));
}
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
            label.title=`${selectedCount}/${ids.size} players selected`;
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

    let visiblePlayers=players.filter(player => {
        const matchesQuery=player.name.toLowerCase().includes(query);
        const matchesPosition=position==="ALL" || positionGroup(primaryPosition(player))===position;
        const matchesGroup=playerMatchesPoolGroup(player,group);
        return matchesQuery&&matchesPosition&&matchesGroup;
    });
    visiblePlayers.sort((a,b)=>{
        const av=poolSortValue(a,sort),bv=poolSortValue(b,sort);
        if(typeof av==="string")return av.localeCompare(bv);
        return sort==="id"?comparePlayerAppearance(a,b):bv-av||comparePlayerAppearance(a,b);
    });

    grid.innerHTML=visiblePlayers.map(player => {
        const selected=selectedPlayerIds.has(player.id);
        return `<div class="pool-player-card ${selected?"selected":""}" data-player-id="${player.id}">
            <button type="button" class="pool-select-hit" aria-pressed="${selected}" aria-label="${selected?"Remove":"Add"} ${esc(player.name)} from auction pool">
              <div class="pool-player-check">${selected?"✓":"+"}</div>
              <img src="${player.image}" alt="${esc(player.name)}" loading="lazy" decoding="async" width="160" height="168">
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
    count.textContent=`${selected} / ${players.length}`;
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

document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("randomDraftGame").addEventListener("click", startRandomDraft);
document.getElementById("playerSearch").addEventListener("input", renderPlayerPool);
document.getElementById("selectAllPlayers").addEventListener("click", () => {
    Object.keys(PLAYER_POOL_CATEGORIES).forEach(k=>playerPoolCategoryState[k]=true);
    playerPoolManualOverrides={};
    recomputeSelectedPlayersFromCategories();renderPlayerPool();saveSetupPreferences();
});
document.getElementById("invertPlayers").addEventListener("click", () => {
    const previous=new Set(selectedPlayerIds);
    players.forEach(p=>playerPoolManualOverrides[p.id]=!previous.has(p.id));
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

["team1Color","team2Color"].forEach(id => {
    const input = document.getElementById(id);
    const output = document.getElementById(id+"Value");
    input.addEventListener("input", () => output.textContent = input.value.toUpperCase());
});

["team1Name","team2Name","team1Color","team2Color","budget","bidIncrement","maxPlayers"].forEach(id=>document.getElementById(id).addEventListener("change",saveSetupPreferences));

document.addEventListener("error",event=>{
    const img=event.target;
    if(img?.tagName!=="IMG"||img.dataset.fallbackApplied)return;
    img.dataset.fallbackApplied="1";
    img.classList.add("image-fallback");
    img.removeAttribute("src");
    img.alt="Player image unavailable";
},true);

