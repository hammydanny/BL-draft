// BLUE LOCK DRAFT // FORMATION UI + APP BOOTSTRAP
// Split from the former root script.js. Classic scripts share the same global scope.

function togglePlayerDatabase(){
  playerDatabaseHidden=!playerDatabaseHidden;
  renderFormationBuilder();
}
function clearSelectedFormationPlayer(){
  selectedFormationPlayerId=null;
  clearLiveFormationTargets();
  renderFormationBuilder();
  saveGame();
}
function setFormationDbQuery(value){
    formationDbQuery=value||"";renderFormationBuilder();
    requestAnimationFrame(()=>{const input=document.querySelector(".database-toolbar input");if(input){input.focus();input.setSelectionRange(formationDbQuery.length,formationDbQuery.length);}});
}
function setFormationDbPosition(value){formationDbPosition=value||"ALL";renderFormationBuilder();}
function setFormationDbSort(value){formationDbSort=value||"ovr";renderFormationBuilder();}
function formationDatabasePlayers(team){
    const q=formationDbQuery.trim().toLowerCase();
    return [...team.players].filter(p=>{
        const queryOk=!q||p.name.toLowerCase().includes(q);
        const positionOk=formationDbPosition==="ALL"||positionGroup(primaryPosition(p))===formationDbPosition;
        return queryOk&&positionOk;
    }).sort((a,b)=>{
        if(formationDbSort==="name")return a.name.localeCompare(b.name);
        if(formationDbSort==="position")return primaryPosition(a).localeCompare(primaryPosition(b))||playerOverall(b)-playerOverall(a);
        return playerOverall(b)-playerOverall(a);
    });
}
function createPlayerInfoSidebar(team){
  const player=team.players.find(p=>p.id===selectedFormationPlayerId);
  if(playerDatabaseHidden) return "";
  if(!player) return `<aside class="player-info-panel" style="${teamVars(team)}">
    <div class="player-info-top"><div><span class="player-info-code">PLAYER // DATABASE</span></div></div>
    <div class="player-info-empty">
      <div class="player-info-empty-icon">+</div>
      <strong>SELECT A PLAYER</strong>
      <span>Click, press, or begin dragging a player to inspect their current OVR, attributes and best positions.</span>
    </div>
  </aside>`;

  const st=playerStats(player);
  const stat=(label,value)=>`<div class="player-stat-row"><div class="player-stat-label"><span>${label}</span><strong>${value}</strong></div><div class="player-stat-track"><i style="width:${Math.max(0,Math.min(100,value))}%"></i></div></div>`;
  return `<aside class="player-info-panel" style="${teamVars(team)}">
    <div class="player-info-top">
      <div><span class="player-info-code">PLAYER // PROFILE</span><strong class="player-info-id">${String(player.id).padStart(2,"0")}</strong></div>
      <button class="player-info-close" onclick="clearSelectedFormationPlayer()" aria-label="Clear selected player">×</button>
    </div>
    ${(()=>{
      const slot=currentPlayerSlot(formationTeamNumber,player.id);
      const pos=slot?.label||primaryPosition(player);
      return `<div class="player-info-portrait"><img src="${player.image}" alt="${esc(player.name)}"><div class="player-info-ovr"><span>${slot?pos:"OVR"}</span><strong>${slot?effectiveOVR(player,pos):playerOverall(player)}</strong></div></div>`;
    })()}
    <div class="player-info-name"><span>PLAYER</span><h2>${esc(player.name)}</h2>${positionBadges(player)}</div>
    ${(()=>{
      const deployed=assignedIds(formationTeamNumber).has(player.id);
      const isCaptain=formationCaptainByTeam[formationTeamNumber]===player.id;
      return `<div class="player-captain-control ${isCaptain?"active":""}">
        <div><span>CAPTAIN ROLE</span><strong>${isCaptain?"CURRENT CAPTAIN":deployed?"AVAILABLE":"DEPLOY PLAYER FIRST"}</strong></div>
        <button type="button" ${deployed?`onclick="setFormationCaptain(${player.id})"`:"disabled"}>${isCaptain?"REMOVE C":"SET CAPTAIN"}</button>
      </div>`;
    })()}
    <div class="player-info-section current-position-rating">${(()=>{
      const slot=currentPlayerSlot(formationTeamNumber,player.id);
      const pos=slot?.label||primaryPosition(player);
      return `<div class="player-info-section-title"><span>${slot?"CURRENT POSITION":"RESERVE // NATURAL POSITION"}</span></div><div class="current-ovr-row"><strong>${pos}</strong><b>${slot?effectiveOVR(player,pos):playerOverall(player)}</b></div>`;
    })()}</div>
    <div class="player-info-section">
      <div class="player-info-section-title"><span>CORE ATTRIBUTES</span></div>
      ${stat("OFF",st.off)}${stat("SHO",st.sho)}${stat("SPD",st.spd)}${stat("DEF",st.def)}${stat("PAS",st.pas)}${stat("DRI",st.dri)}${stat("GK",st.gk)}
    </div>
  </aside>`;
}

function renderFormationBuilder(){
    hideChemistryTooltip();
    const standalone=formationTeamNumber===0;
    const team=teamByNumber(formationTeamNumber);
    activeFormation=formationByTeam[formationTeamNumber]||"4-3-3";
    const slots=FORMATIONS[activeFormation];
    sanitizeFormationAssignments(formationTeamNumber);
    const used=assignedIds(formationTeamNumber);
    const bench=team.players.filter(p=>!used.has(p.id));
    const selectedPlayer=team.players.find(p=>p.id===selectedFormationPlayerId);
    const deploymentLimit=formationDeploymentLimit(formationTeamNumber);
    const activeSlots=activeFormationSlotIndices(formationTeamNumber);
    const teamOvr=formationTeamOVR(formationTeamNumber);
    const captain=formationCaptain(formationTeamNumber);

    formationContent.innerHTML=`
      <div class="formation-v2-shell">
        <div class="formation-topbar">
          <div class="formation-team-tabs">
            ${standalone
              ?`<div class="standalone-builder-label"><span>STANDALONE</span><strong>GLOBAL XI</strong></div>`
              :[1,2].map(n=>{const t=teamByNumber(n);return `<button class="${formationTeamNumber===n?"active":""}" style="${teamVars(t)}" onclick="switchFormationTeam(${n})"><span>SQUAD 0${n}</span>${esc(t.name)}</button>`}).join("")}
          </div>
          <div class="formation-actions">
            <button class="formation-auto" onclick="${standalone&&typeof autoBestStandaloneTeam==='function'?'autoBestStandaloneTeam()':'autoBestXI()'}">⚡ AUTO BEST ${deploymentLimit===11?"XI":"TEAM"}</button>
            ${standalone?`<button class="formation-share" onclick="openStandaloneShareScreen()">↗ SHARE TEAM</button>`:""}
            <button class="formation-reset" onclick="resetCurrentFormation()">↻ CLEAR XI</button>
            <button class="formation-database-toggle" onclick="togglePlayerDatabase()">${playerDatabaseHidden?"SHOW DATABASE":"HIDE DATABASE"}</button>
            <button class="formation-bench-toggle" onclick="toggleBench()">${benchCollapsed?"SHOW BENCH":"HIDE BENCH"}</button>
          </div>
        </div>

        ${standalone&&typeof standalonePoolMarkup==="function"?standalonePoolMarkup():""}

        <div class="formation-control-panel formation-control-v13" style="${teamVars(team)}">
          <div class="formation-identity">
            <span>${standalone?"GLOBAL TEAM // FORMATION":`FORMATION // ${esc(team.name)}`}</span>
            <strong>${activeFormation}</strong>
          </div>
          <div class="formation-team-metrics">
            <div><span>TEAM OVR</span><strong>${teamOvr||"--"}</strong></div>
            <div><span>DEPLOYED</span><strong>${used.size}<small> / ${deploymentLimit}</small></strong></div>
            <div><span>RESERVES</span><strong>${bench.length}</strong></div>
            <div class="captain-metric"><span>CAPTAIN</span><strong>${captain?esc(captain.name):"UNASSIGNED"}</strong></div>
          </div>
          <details class="formation-menu">
            <summary><span>CHANGE FORMATION</span><b>${activeFormation}</b><i>⌄</i></summary>
            <div class="formation-menu-popover">
              <div class="formation-menu-group"><span>BACK FOUR</span>
                ${["4-3-3","4-2-3-1","4-4-2","4-1-3-2","4-3-2-1"].map(f=>`<button class="${activeFormation===f?"active":""}" onclick="changeFormation('${f}')">${f}</button>`).join("")}
              </div>
              <div class="formation-menu-group"><span>BACK THREE</span>
                ${["3-4-3","3-5-2","3-4-2-1"].map(f=>`<button class="${activeFormation===f?"active":""}" onclick="changeFormation('${f}')">${f}</button>`).join("")}
              </div>
              <div class="formation-menu-group"><span>BACK FIVE</span>
                ${["5-3-2","5-2-3"].map(f=>`<button class="${activeFormation===f?"active":""}" onclick="changeFormation('${f}')">${f}</button>`).join("")}
              </div>
            </div>
          </details>
        </div>

        ${chemistryHud(formationTeamNumber,team)}
        <div class="formation-instructions" style="${teamVars(team)}">
          <span>TACTICAL BOARD // DRAG & DROP ENABLED</span>
          <strong>${selectedPlayer?`${esc(selectedPlayer.name)} // PRIMARY: ${primaryPosition(selectedPlayer)} // CANON: ${playerPositions(selectedPlayer).join(" / ")}`:"SELECT A PLAYER TO HIGHLIGHT CANONICAL POSITIONS // DRAG OR TAP TO PLACE"}</strong>
        </div>

        <div class="formation-layout ${benchCollapsed?"bench-hidden":""} ${playerDatabaseHidden?"database-hidden":""}">
          <div class="football-pitch formation-pitch-v2" style="${teamVars(team)}">
            <div class="pitch-stripes"></div>
            ${chemistrySvg(formationTeamNumber)}
            <div class="pitch-halfway"></div><div class="pitch-circle"></div><div class="pitch-dot"></div>
            <div class="penalty-box top"></div><div class="penalty-box bottom"></div>
            <div class="goal-box top"></div><div class="goal-box bottom"></div>
            ${slots.map((s,i)=>{
               const p=getFormationPlayer(formationTeamNumber,i);
               const selected=p&&p.id===selectedFormationPlayerId;
               const canonicalTarget=selectedPlayer&&canonicalFit(selectedPlayer,s.label);
               const primaryTarget=selectedPlayer&&primaryFit(selectedPlayer,s.label);
               const currentFit=p&&canonicalFit(p,s.label);
               const partialInactive=team.players.length<11&&!p&&!activeSlots.has(i);
               const isCaptain=p&&formationCaptainByTeam[formationTeamNumber]===p.id;
               return `<button class="formation-slot ${p?"occupied":""} ${selected?"selected":""} ${canonicalTarget?"canonical-target":""} ${primaryTarget?"primary-target":""} ${currentFit?"natural-fit":""} ${partialInactive?"partial-inactive":""}"
                    style="left:${s.x}%;top:${s.y}%" data-slot-label="${s.label}" data-slot-index="${i}"
                    onclick="clickFormationSlot(${i})"
                    ondragover="allowFormationDrop(event)" ondragleave="leaveFormationDrop(event)" ondrop="dropOnFormationSlot(event,${i})">
                  <span class="slot-position">${s.label}</span>
                  ${p?`<div class="formation-player-token" draggable="false" onclick="event.stopPropagation();selectFormationPlayerOnly(${p.id})" onpointerdown="beginFormationPointerDrag(event,${p.id})">
                         ${isCaptain?`<span class="captain-badge" title="Captain">C</span>`:""}<img src="${p.image}" alt="${esc(p.name)}"><strong>${esc(p.name)}</strong>${positionBadges(p,true)}
                       </div>`:`<span class="empty-slot">${partialInactive?"·":"+"}</span>`}
               </button>`;
            }).join("")}
          </div>

          ${createPlayerInfoSidebar(team)}

          <aside class="bench-panel ${benchCollapsed?"collapsed":""}" style="${teamVars(team)}" data-formation-bench>
            <div class="bench-heading"><div><span>RESERVES</span><small>${standalone
  ?(team.players.length>11?"SELECTED PLAYERS OUTSIDE THE XI":"SELECT MORE THAN 11 TO CREATE RESERVES")
  :(team.players.length>11?"PLAYERS OUTSIDE THE XI STAY HERE":"DROP HERE TO BENCH")}</small></div><strong>${bench.length}</strong></div>
            <div class="bench-list">
              ${bench.length?bench.map(p=>`<button class="bench-player ${p.id===selectedFormationPlayerId?"selected":""}"
                    data-player-id="${p.id}"
                    onclick="selectBenchPlayer(${p.id})" draggable="false"
                    onpointerdown="beginFormationPointerDrag(event,${p.id})">
                    <img src="${p.image}" alt="${esc(p.name)}">
                    <span class="bench-player-copy"><strong>${esc(p.name)}</strong>${positionBadges(p,true)}<small>OVR ${playerOverall(p)} // ${primaryPosition(p)}</small></span>
                    <b>DRAG</b>
                  </button>`).join(""):`<div class="history-empty">NO SUBSTITUTES</div>`}
            </div>
          </aside>
        </div>
      </div>`;
    applyFormationMoveFx();
    if(standalone&&typeof bindStandaloneBuilderPoolUI==="function")bindStandaloneBuilderPoolUI();
}
document.getElementById("backToResults").addEventListener("click",()=>{
    hideChemistryTooltip();

    if(formationTeamNumber===0||uiState.screen==="standalone-builder"){
        if(typeof leaveStandaloneBuilder==="function"){
            leaveStandaloneBuilder();
        }else{
            goToMainMenu();
        }
        return;
    }

    configureFormationHeader?.(false);
    setVisibleScreen(auctionScreen);
    showAuctionComplete();
});

const initialSaved=loadSavedData();
if(initialSaved?.gameActive) showResumeCard(initialSaved);
else restoreSetup(initialSaved);
history.replaceState(
    {
        blDraftRoute:"menu"
    },
    "",
    window.location.href
);

setVisibleScreen(menuScreen,{skipHistory:true});
refreshMainMenu();
