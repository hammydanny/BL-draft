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

function playerMatchesPoolGroup(player,group){
    if(!group||group==="all")return true;
    const ids=PLAYER_PRESETS?.[group]||[];
    return ids.includes(player.id);
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
        return sort==="id"?av-bv:bv-av;
    });

    grid.innerHTML=visiblePlayers.map(player => {
        const selected=selectedPlayerIds.has(player.id);
        return `<div class="pool-player-card ${selected?"selected":""}" data-player-id="${player.id}">
            <button type="button" class="pool-select-hit" aria-pressed="${selected}" aria-label="${selected?"Remove":"Add"} ${esc(player.name)} from auction pool">
              <div class="pool-player-check">${selected?"✓":"+"}</div>
              <img src="${player.image}" alt="${esc(player.name)}">
              <div class="pool-player-info">
                  <span>PLAYER // ${String(player.id).padStart(2,"0")} // OVR ${playerOverall(player)}</span>
                  <strong>${esc(player.name)}</strong>
              </div>
            </button>
        </div>`;
    }).join("");

    grid.querySelectorAll(".pool-select-hit").forEach(button => {
        button.addEventListener("click", () => {
            const id=Number(button.closest(".pool-player-card").dataset.playerId);
            if(selectedPlayerIds.has(id)) selectedPlayerIds.delete(id);
            else selectedPlayerIds.add(id);
            renderPlayerPool();
            saveSetupPreferences();
        });
    });
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

const presetNames = {
    "all": players.map(p=>p.name),
    "blue-lock-project": [
        "Yoichi Isagi","Ryosuke Kira","Meguru Bachira","Gurimu Igarashi","Rensuke Kunigami","Hyoma Chigiri",
        "Gin Gagamaru","Jingo Raichi","Asahi Naruhaya","Okuhito Iemon","Wataru Kuon","Yudai Imamura",
        "Shoei Baro","Ikki Niko","Hibiki Okawa","Junichi Wanima","Keisuke Wanima","Reo Mikage","Seishiro Nagi",
        "Zantetsu Tsurugi","Rin Itoshi","Jyubei Aryu","Aoshi Tokimitsu","Ranze Kurona","Yo Hiori","Tabito Karasu",
        "Eita Otoya","Kenyu Yukimiya","Ryusei Shido","Nijiro Nanase","Jin Kiyora"
    ],
    "world-five": ["Leonardo Luna","Pablo Cavasoz","Adam Blake","Dada Silva","Julien Loki"],
    "u20-match": [
        "Sae Itoshi","Gen Fukaku","Oliver Aiku","Kazuma Nio","Miroku Darai","Teppei Neru","Itsuki Wakatsuki",
        "Haru Hayate","Kento Cho","Teru Kitsunezato","Shuto Sendo","Ryusei Shido"
    ],
    "nel-stars": [
        "Noel Noa","Michael Kaiser","Alexis Ness","Benedict Grim","Lavinho","Chris Prince","Agi",
        "Marc Snuffy","Don Lorenzo","Charles Chevalier","Julien Loki"
    ],
    "world-cup-new": [
        "Rooke","Renoir","Haneru Shindo","Bunny Iglesias","Innocent Onazi","Godwin Kuso",
        "Vivien Hugo","Achanpong","Lockhart","Teddy Knight","Childs"
    ]
};
const PLAYER_PRESETS=Object.fromEntries(Object.entries(presetNames).map(([key,names])=>[
    key, players.filter(p=>names.includes(p.name)).map(p=>p.id)
]));

document.querySelectorAll("[data-preset]").forEach(button=>{
    button.addEventListener("click",()=>{
        const ids=PLAYER_PRESETS[button.dataset.preset]||[];
        selectedPlayerIds=new Set(ids);
        renderPlayerPool();
        document.querySelectorAll("[data-preset]").forEach(b=>b.classList.toggle("active",b===button));
        saveSetupPreferences();
    });
});
["playerPositionFilter","playerGroupFilter","playerSort"].forEach(id=>{
    document.getElementById(id)?.addEventListener("change",()=>{renderPlayerPool();saveSetupPreferences();});
});
renderPlayerPool();


document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("randomDraftGame").addEventListener("click", startRandomDraft);
document.getElementById("playerSearch").addEventListener("input", renderPlayerPool);
document.getElementById("selectAllPlayers").addEventListener("click", () => {
    selectedPlayerIds = new Set(players.map(player => player.id));
    renderPlayerPool();
});
document.getElementById("clearAllPlayers").addEventListener("click", () => {
    selectedPlayerIds.clear();
    renderPlayerPool();
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

