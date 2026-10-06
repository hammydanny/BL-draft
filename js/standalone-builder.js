// BLUE LOCK DRAFT // STANDALONE TEAM BUILDER
// One global squad, completely separate from auction Team 1 / Team 2.

let standaloneBuilderLoaded=false;

function standaloneBuilderSyncTeam(){
    standaloneBuilderTeam.players=players.filter(p=>standaloneBuilderPlayerIds.has(p.id));
    standaloneBuilderTeam.budget=0;
    standaloneBuilderTeam.name="GLOBAL XI";
    standaloneBuilderTeam.color="#19a7ff";
    if(!formationByTeam[0])formationByTeam[0]="4-3-3";
    if(!formationAssignments[0])formationAssignments[0]={};
    if(!Object.prototype.hasOwnProperty.call(formationCaptainByTeam,0))formationCaptainByTeam[0]=null;
    sanitizeFormationAssignments(0);
}
function loadStandaloneBuilderState(){
    if(standaloneBuilderLoaded)return;
    standaloneBuilderLoaded=true;
    try{
        const saved=JSON.parse(localStorage.getItem(STANDALONE_SAVE_KEY)||"null");
        if(saved){
            standaloneBuilderPlayerIds=new Set((saved.playerIds||[]).filter(id=>players.some(p=>p.id===id)));
            formationByTeam[0]=FORMATIONS[saved.formation]?saved.formation:"4-3-3";
            formationAssignments[0]=saved.assignment&&typeof saved.assignment==="object"?saved.assignment:{};
            formationCaptainByTeam[0]=saved.captainId||null;
            standaloneBuilderRole=saved.role||"ALL";
            standaloneBuilderSort=saved.sort||"ovr";
            standalonePoolHidden=!!saved.poolHidden;
        }
    }catch(e){}
    standaloneBuilderSyncTeam();
}
function saveStandaloneBuilderState(){
    try{
        localStorage.setItem(STANDALONE_SAVE_KEY,JSON.stringify({
            playerIds:[...standaloneBuilderPlayerIds],
            formation:formationByTeam[0]||"4-3-3",
            assignment:formationAssignments[0]||{},
            captainId:formationCaptainByTeam[0]||null,
            role:standaloneBuilderRole,
            sort:standaloneBuilderSort,
            poolHidden:standalonePoolHidden
        }));
    }catch(e){}
}
function configureFormationHeader(standalone){
    const code=document.getElementById("formationHeaderCode");
    const title=document.getElementById("formationHeaderTitle");
    const status=document.getElementById("formationHeaderStatus");
    const back=document.getElementById("backToResults");
    if(standalone){
        if(code)code.textContent="BL // GLOBAL SQUAD LAB";
        if(title)title.innerHTML='TEAM <span>BUILDER</span>';
        if(status)status.innerHTML="<i></i> STANDALONE MODE";
        if(back)back.textContent="← MAIN MENU";
    }else{
        if(code)code.textContent="BL // SQUAD DEPLOYMENT";
        if(title)title.innerHTML='FORMATION <span>BUILDER</span>';
        if(status)status.innerHTML="<i></i> TACTICAL MODE";
        if(back)back.textContent="← RESULTS";
    }
}
function openStandaloneBuilder(){
    loadStandaloneBuilderState();
    uiState={screen:"standalone-builder",phase:"builder",turn:null};
    formationTeamNumber=0;
    selectedFormationPlayerId=null;
    benchCollapsed=false;
    standaloneBuilderSyncTeam();
    setVisibleScreen(formationScreen);
    formationScreen.classList.add("standalone-builder-mode");
    configureFormationHeader(true);
    renderFormationBuilder();
    window.scrollTo({top:0,behavior:"smooth"});
}
function leaveStandaloneBuilder(options={}){
    saveStandaloneBuilderState();

    formationScreen.classList.remove("standalone-builder-mode");
    configureFormationHeader(false);

    setVisibleScreen(menuScreen,options);
    refreshMainMenu();
}
function standaloneBuilderPoolPlayers(){
    const query=standaloneBuilderQuery.trim().toLowerCase();
    let list=players.filter(player=>{
        const role=standaloneBuilderRole;
        const roleOk=role==="ALL"||positionGroup(primaryPosition(player))===role;
        const textOk=!query||player.name.toLowerCase().includes(query)||playerPositions(player).some(x=>x.toLowerCase().includes(query));
        return roleOk&&textOk;
    });
    list.sort((a,b)=>{
        if(standaloneBuilderSort==="name")return a.name.localeCompare(b.name);
        if(standaloneBuilderSort==="id")return a.id-b.id;
        return playerOverall(b)-playerOverall(a)||a.id-b.id;
    });
    return list;
}
function autoBestStandaloneTeam(){
    standaloneBuilderSyncTeam();
    if(!standaloneBuilderTeam.players.length){
        showSiteError(
            "Select at least one player from the Global Player Pool first. Auto Best Team only uses players in your selected standalone roster.",
            "SELECT A ROSTER"
        );
        return;
    }
    const best=applyBestFormationAndAssignment(0);
    if(!best){
        showSiteError("No valid lineup could be generated from the selected roster.","AUTO BEST TEAM");
        return;
    }
    selectedFormationPlayerId=null;
    playSfx("confirm");
    saveStandaloneBuilderState();
    renderFormationBuilder();
}
function toggleStandalonePoolVisibility(){
    standalonePoolHidden=!standalonePoolHidden;
    saveStandaloneBuilderState();
    renderFormationBuilder();
}

function standalonePoolCard(player){
    const selected=standaloneBuilderPlayerIds.has(player.id);
    return `<button type="button" class="standalone-pool-player ${selected?"selected":""}" data-standalone-player="${player.id}" aria-pressed="${selected}">
      <img src="${player.image}" alt="${esc(player.name)}">
      <span><strong>${esc(player.name)}</strong><small>${primaryPosition(player)} // OVR ${playerOverall(player)}</small></span>
      <b>${selected?"✓":"+"}</b>
    </button>`;
}
function standalonePoolMarkup(){
    if(standalonePoolHidden){
        return `<section class="standalone-pool-panel standalone-pool-collapsed">
          <div class="standalone-pool-head">
            <div><span>GLOBAL PLAYER POOL</span><strong>${standaloneBuilderPlayerIds.size} SELECTED</strong></div>
            <button type="button" class="standalone-pool-toggle" data-standalone-pool-toggle>SHOW PLAYER POOL</button>
          </div>
        </section>`;
    }
    return `<section class="standalone-pool-panel">
      <div class="standalone-pool-head">
        <div><span>GLOBAL PLAYER POOL</span><strong>${standaloneBuilderPlayerIds.size} SELECTED</strong></div>
        <div class="standalone-pool-head-actions">
          <small>SELECT YOUR ROSTER // PLAYERS OUTSIDE THE XI BECOME RESERVES</small>
          <button type="button" class="standalone-pool-toggle" data-standalone-pool-toggle>HIDE PLAYER POOL</button>
        </div>
      </div>
      <div class="standalone-pool-toolbar">
        <input id="standalonePoolSearch" type="search" value="${esc(standaloneBuilderQuery)}" placeholder="SEARCH PLAYERS..." autocomplete="off">
        <select id="standalonePoolRole">
          <option value="ALL" ${standaloneBuilderRole==="ALL"?"selected":""}>ALL ROLES</option>
          <option value="ATTACK" ${standaloneBuilderRole==="ATTACK"?"selected":""}>ATTACK</option>
          <option value="MIDFIELD" ${standaloneBuilderRole==="MIDFIELD"?"selected":""}>MIDFIELD</option>
          <option value="DEFENCE" ${standaloneBuilderRole==="DEFENCE"?"selected":""}>DEFENCE</option>
          <option value="GK" ${standaloneBuilderRole==="GK"?"selected":""}>GK</option>
        </select>
        <select id="standalonePoolSort">
          <option value="ovr" ${standaloneBuilderSort==="ovr"?"selected":""}>OVR ↓</option>
          <option value="name" ${standaloneBuilderSort==="name"?"selected":""}>NAME A-Z</option>
          <option value="id" ${standaloneBuilderSort==="id"?"selected":""}>PLAYER ID</option>
        </select>
        <button type="button" data-standalone-action="top15">TOP 15</button>
        <button type="button" data-standalone-action="all">ALL</button>
        <button type="button" data-standalone-action="clear">CLEAR</button>
      </div>
      <div id="standalonePoolGrid" class="standalone-pool-grid">${standaloneBuilderPoolPlayers().map(standalonePoolCard).join("")}</div>
    </section>`;
}
function refreshStandalonePoolGrid(){
    const grid=document.getElementById("standalonePoolGrid");
    if(grid)grid.innerHTML=standaloneBuilderPoolPlayers().map(standalonePoolCard).join("");
    const head=document.querySelector(".standalone-pool-head strong");
    if(head)head.textContent=`${standaloneBuilderPlayerIds.size} SELECTED`;
    bindStandalonePoolCards();
}
function bindStandalonePoolCards(){
    document.querySelectorAll("[data-standalone-player]").forEach(button=>{
        button.onclick=()=>{
            const id=Number(button.dataset.standalonePlayer);
            if(standaloneBuilderPlayerIds.has(id))standaloneBuilderPlayerIds.delete(id);
            else standaloneBuilderPlayerIds.add(id);
            standaloneBuilderSyncTeam();
            saveStandaloneBuilderState();
            renderFormationBuilder();
        };
    });
}
function bindStandaloneBuilderPoolUI(){
    if(formationTeamNumber!==0)return;
    document.querySelectorAll("[data-standalone-pool-toggle]").forEach(button=>{button.onclick=toggleStandalonePoolVisibility;});
    const search=document.getElementById("standalonePoolSearch");
    const role=document.getElementById("standalonePoolRole");
    const sort=document.getElementById("standalonePoolSort");
    if(search)search.oninput=()=>{standaloneBuilderQuery=search.value;refreshStandalonePoolGrid();};
    if(role)role.onchange=()=>{standaloneBuilderRole=role.value;refreshStandalonePoolGrid();saveStandaloneBuilderState();};
    if(sort)sort.onchange=()=>{standaloneBuilderSort=sort.value;refreshStandalonePoolGrid();saveStandaloneBuilderState();};
    document.querySelectorAll("[data-standalone-action]").forEach(button=>{
        button.onclick=()=>{
            const action=button.dataset.standaloneAction;
            if(action==="top15"){
                standaloneBuilderPlayerIds=new Set([...players].sort((a,b)=>playerOverall(b)-playerOverall(a)||a.id-b.id).slice(0,15).map(p=>p.id));
            }else if(action==="all"){
                standaloneBuilderPlayerIds=new Set(players.map(p=>p.id));
            }else{
                standaloneBuilderPlayerIds.clear();
            }
            standaloneBuilderSyncTeam();
            saveStandaloneBuilderState();
            renderFormationBuilder();
        };
    });
    bindStandalonePoolCards();
}

document.getElementById("menuStandaloneBuilder")?.addEventListener("click",openStandaloneBuilder);
