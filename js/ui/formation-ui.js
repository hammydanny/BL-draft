// BLUE LOCK DRAFT // FORMATION UI
// Split from the former root script.js. Classic scripts share the same global scope.
function waitForAutoBestPaint(){
    return new Promise(resolve=>{
        requestAnimationFrame(()=>{
            requestAnimationFrame(resolve);
        });
    });
}

function showAutoBestLoader(label="AUTO BEST"){
    document.getElementById("autoBestLoader")?.remove();

    const overlay=document.createElement("div");
    overlay.id="autoBestLoader";
    overlay.className="auto-best-loader";
    overlay.setAttribute("role","status");
    overlay.setAttribute("aria-live","polite");

    overlay.innerHTML=`
        <div class="auto-best-loader-grid"></div>
        <div class="auto-best-loader-orbit orbit-a"></div>
        <div class="auto-best-loader-orbit orbit-b"></div>
        <div class="auto-best-loader-scan"></div>

        <div class="auto-best-loader-content">
            <div class="auto-best-loader-kicker">BLUE LOCK // TACTICAL COMPUTATION</div>

            <div class="auto-best-loader-title">
                <span>CALCULATING</span>
                <i>...</i>
            </div>

            <div class="auto-best-loader-label">
                ${esc(label)} // FORMATION + OVR + CHEMISTRY
            </div>

            <div class="auto-best-loader-progress">
                <span></span>
            </div>

            <div class="auto-best-loader-status">
                SCANNING FORMATIONS // OPTIMIZING XI // EVALUATING CHEMISTRY
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(()=>{
        overlay.classList.add("is-visible");
    });

    return overlay;
}

function hideAutoBestLoader(overlay){
    if(!overlay)return;

    overlay.classList.remove("is-visible");

    window.setTimeout(()=>{
        overlay.remove();
    },220);
}
function togglePlayerDatabase(){
  playerDatabaseHidden=!playerDatabaseHidden;
  renderFormationBuilder();
}
function clearSelectedFormationPlayer(){
  const previousId=selectedFormationPlayerId;
  const index=Object.keys(formationAssignments[formationTeamNumber]||{}).find(index=>formationAssignments[formationTeamNumber][index]===previousId);
  const focusTarget=index===undefined?`.bench-player[data-player-id="${previousId}"]`:`.formation-slot[data-slot-index="${index}"]`;
  selectedFormationPlayerId=null;
  clearLiveFormationTargets();
  refreshFormationSelection();
  if(mobileBuilderMedia.matches)formationContent.querySelector(focusTarget)?.focus({preventScroll:true});
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

  const slot=currentPlayerSlot(formationTeamNumber,player.id);
  const pos=slot?.label||primaryPosition(player);
  const rating=slot?effectiveOVR(player,pos):playerOverall(player);
  const deployed=assignedIds(formationTeamNumber).has(player.id);
  const isCaptain=formationCaptainByTeam[formationTeamNumber]===player.id;
  const captainControl=`<div class="player-captain-control ${isCaptain?"active":""}">
    <div><span>CAPTAIN ROLE</span><strong>${isCaptain?"CURRENT CAPTAIN":deployed?"AVAILABLE":"DEPLOY PLAYER FIRST"}</strong></div>
    <button type="button" ${deployed?`onclick="setFormationCaptain(${player.id})"`:"disabled"}>${isCaptain?"REMOVE C":"SET CAPTAIN"}</button>
  </div>`;

  return `<aside class="player-info-panel" style="${teamVars(team)}">
    <div class="player-info-top">
      <div><span class="player-info-code">PLAYER // PROFILE</span><strong class="player-info-id">${String(player.id).padStart(2,"0")}</strong></div>
      <button class="player-info-close" onclick="clearSelectedFormationPlayer()" aria-label="Clear selected player">×</button>
    </div>
    <div class="player-info-portrait"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" loading="eager" decoding="async" width="240" height="270"><div class="player-info-ovr"><span>${pos}</span><strong>${rating}</strong><b class="evaluation-grade">${playerStatGrade(rating)}</b></div></div>
    <div class="player-info-name"><h2>${esc(player.name)}</h2>${playerNationalityMarkup(player)}${positionBadges(player)}</div>
    ${captainControl}
    <div class="player-info-section">
      <div class="player-info-section-title"><span>CORE ATTRIBUTES</span></div>
      ${playerStatsRadar(player,"sidebar")}
    </div>
    <div class="player-info-section current-position-rating">
      <div class="player-info-section-title"><span>${slot?"CURRENT POSITION":"RESERVE // NATURAL POSITION"}</span></div>
      <div class="current-ovr-row"><strong>${pos}</strong><b>${rating} <small class="evaluation-grade">${playerStatGrade(rating)}</small></b></div>
    </div>
  </aside>`;
}

function captureFormationViewport(anchorSelector){
    const active=document.activeElement,anchor=anchorSelector?formationContent.querySelector(anchorSelector):active;
    const scrolls=["#standalonePoolGrid",".standalone-pool-reveal",".bench-list",".database-roster",".player-info-panel"].map(selector=>{
        const node=formationContent.querySelector(selector);return node?{selector,top:node.scrollTop,left:node.scrollLeft}:null;
    }).filter(Boolean);
    let focus=null;
    if(formationContent.contains(active)){
        if(active.id)focus=`#${active.id}`;
        else for(const name of ["data-standalone-player","data-player-id","data-slot-index"]){
            if(active.hasAttribute(name)){focus=`[${name}="${active.getAttribute(name)}"]`;break;}
        }
    }
    const rect=anchor&&formationContent.contains(anchor)?anchor.getBoundingClientRect():null;
    return {x:window.scrollX,y:window.scrollY,scrolls,focus,anchor:rect&&rect.top>=0&&rect.bottom<=window.innerHeight?{selector:anchorSelector||focus,top:rect.top}:null};
}
function restoreFormationViewport(snapshot){
    if(!snapshot)return;
    for(const scroll of snapshot.scrolls){const node=formationContent.querySelector(scroll.selector);if(node){node.scrollTop=scroll.top;node.scrollLeft=scroll.left;}}
    if(snapshot.focus)formationContent.querySelector(snapshot.focus)?.focus({preventScroll:true});
    const anchor=snapshot.anchor?.selector?formationContent.querySelector(snapshot.anchor.selector):null;
    const adjustment=anchor?anchor.getBoundingClientRect().top-snapshot.anchor.top:0;
    window.scrollTo({left:snapshot.x,top:snapshot.y+adjustment,behavior:"instant"});
}
function formationSlotFit(player,label){return player&&primaryFit(player,label)?"best":player&&canonicalFit(player,label)?"good":"";}
function setFormationSlotHint(slot,fit,action=""){
    if(fit)slot.dataset.fit=fit;else delete slot.dataset.fit;
    if(action)slot.dataset.targetAction=action;else delete slot.dataset.targetAction;
    const label=slot.querySelector(".slot-target-label"),state=action||fit;
    if(label){label.textContent=state==="swap"?"SWAP":state==="best"?"BEST FIT":state==="good"?"GOOD FIT":"";label.hidden=!label.textContent;}
}
function refreshFormationSelection(anchorSelector){
    const snapshot=captureFormationViewport(anchorSelector),team=teamByNumber(formationTeamNumber);
    const player=team.players.find(p=>p.id===selectedFormationPlayerId);
    const panel=formationContent.querySelector(".player-info-panel");
    if(panel)panel.outerHTML=createPlayerInfoSidebar(team);
    const mobilePanel=formationContent.querySelector(".mobile-builder-player");
    if(mobilePanel)mobilePanel.outerHTML=mobileBuilderPlayerMarkup(team);
    formationContent.querySelectorAll(".formation-slot").forEach(slot=>{
        slot.classList.toggle("selected",getFormationPlayer(formationTeamNumber,Number(slot.dataset.slotIndex))?.id===selectedFormationPlayerId);
        const occupant=getFormationPlayer(formationTeamNumber,Number(slot.dataset.slotIndex));
        slot.setAttribute("aria-pressed",String(occupant?.id===selectedFormationPlayerId));
        setFormationSlotHint(slot,formationSlotFit(player,slot.dataset.slotLabel),mobileBuilderMedia.matches&&player&&occupant&&occupant.id!==player.id?"swap":"");
    });
    formationContent.querySelectorAll(".bench-player").forEach(card=>{const selected=Number(card.dataset.playerId)===selectedFormationPlayerId;card.classList.toggle("selected",selected);card.setAttribute("aria-pressed",String(selected));});
    const hint=formationContent.querySelector(".formation-instructions strong");
    if(hint)hint.textContent=player?`${player.name} // PRIMARY: ${primaryPosition(player)} // GAMEPLAY ROLES: ${playerPositions(player).join(" / ")}`:"SELECT A PLAYER TO HIGHLIGHT COMPATIBLE POSITIONS // DRAG OR TAP TO PLACE";
    restoreFormationViewport(snapshot);prioritizeVisiblePortraits(formationContent);
}
function renderFormationBuilder({preserveScroll=true}={}){
    const snapshot=preserveScroll&&formationContent.firstElementChild?captureFormationViewport():null;
    configureTeamBuilderHeader(formationTeamNumber===0);
    hideChemistryTooltip();
    const standalone=formationTeamNumber===0;
    const pool=standalone?formationContent.querySelector(".standalone-pool-panel"):null;
    const team=teamByNumber(formationTeamNumber);
    activeFormation=formationByTeam[formationTeamNumber]||"4-3-3";
    const slots=FORMATIONS[activeFormation];
    sanitizeFormationAssignments(formationTeamNumber);
    const used=assignedIds(formationTeamNumber);
    const bench=team.players.filter(p=>!used.has(p.id));
    if(standalone)bench.sort(compareStandalonePlayers);
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
              ?`<div class="standalone-builder-label"><span>STANDALONE</span><strong data-i18n-ignore>${esc(team.name)}</strong></div>`
              :[1,2].map(n=>{const t=teamByNumber(n);return `<button class="${formationTeamNumber===n?"active":""}" style="${teamVars(t)}" onclick="switchFormationTeam(${n})"><span>SQUAD 0${n}</span>${esc(t.name)}</button>`}).join("")}
          </div>
          <div class="formation-actions">
            <button class="formation-auto" onclick="${standalone&&typeof autoBestStandaloneTeam==='function'?'autoBestStandaloneTeam()':'autoBestXI()'}">⚡ AUTO BEST ${deploymentLimit===11?"XI":"TEAM"}</button>
            <details class="builder-more"><summary aria-controls="builderMoreActions">MORE ACTIONS <span aria-hidden="true">⋯</span></summary><div id="builderMoreActions" class="builder-more-actions">
            ${standalone?`<button class="formation-share" onclick="openStandaloneShareScreen()">↗ TEAM REPORT</button>`:""}

            <button class="formation-reset" onclick="resetCurrentFormation()">↻ CLEAR XI</button>
            <button class="formation-database-toggle" onclick="togglePlayerDatabase()">${playerDatabaseHidden?"SHOW DATABASE":"HIDE DATABASE"}</button>
            <button class="formation-bench-toggle" onclick="toggleBench()">${benchCollapsed?"SHOW BENCH":"HIDE BENCH"}</button>
            </div></details>
          </div>
        </div>

        ${pool?'<div data-standalone-pool-mount></div>':standalone&&typeof standalonePoolMarkup==="function"?standalonePoolMarkup():""}

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
            <summary aria-controls="builderFormationOptions"><span>CHANGE FORMATION</span><b>${activeFormation}</b><i>⌄</i></summary>
            <div id="builderFormationOptions" class="formation-menu-popover">
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

        <section class="mobile-builder-chemistry ${mobileBuilderChemistryExpanded?"is-expanded":""}">
          <button type="button" class="mobile-chemistry-toggle" aria-expanded="${mobileBuilderChemistryExpanded}" aria-controls="builderChemistryDetails" onclick="toggleMobileBuilderSection('chemistry',this)"><span>TEAM CHEMISTRY</span><strong>${formationChemistry(formationTeamNumber).overall||"--"}</strong><span>VIEW LINKS</span><i aria-hidden="true">⌄</i></button>
          <div id="builderChemistryDetails">${chemistryHud(formationTeamNumber,team)}</div>
        </section>

        <div class="formation-instructions" style="${teamVars(team)}">
          <span>TACTICAL BOARD // DRAG & DROP ENABLED</span>
          <strong>${selectedPlayer?`${esc(selectedPlayer.name)} // PRIMARY: ${primaryPosition(selectedPlayer)} // GAMEPLAY ROLES: ${playerPositions(selectedPlayer).join(" / ")}`:"SELECT A PLAYER TO HIGHLIGHT COMPATIBLE POSITIONS // DRAG OR TAP TO PLACE"}</strong>
        </div>

        <div class="formation-layout ${standalone?"standalone-layout":""} ${benchCollapsed?"bench-hidden":""} ${playerDatabaseHidden?"database-hidden":""}">
          <div class="football-pitch formation-pitch-v2" style="${teamVars(team)}">
            <div class="pitch-stripes"></div>
            ${chemistrySvg(formationTeamNumber)}
            <div class="pitch-halfway"></div><div class="pitch-circle"></div><div class="pitch-dot"></div>
            <div class="penalty-box top"></div><div class="penalty-box bottom"></div>
            <div class="goal-box top"></div><div class="goal-box bottom"></div>
            ${slots.map((s,i)=>{
               const p=getFormationPlayer(formationTeamNumber,i);
               const selected=p&&p.id===selectedFormationPlayerId;
               const fit=formationSlotFit(selectedPlayer,s.label);
               const swap=mobileBuilderMedia.matches&&selectedPlayer&&p&&p.id!==selectedPlayer.id;
               const currentFit=p&&canonicalFit(p,s.label);
               const partialInactive=team.players.length<11&&!p&&!activeSlots.has(i);
               const isCaptain=p&&formationCaptainByTeam[formationTeamNumber]===p.id;
               return `<button class="formation-slot ${p?"occupied":""} ${selected?"selected":""} ${currentFit?"natural-fit":""} ${partialInactive?"partial-inactive":""}"
                    style="left:${s.x}%;top:${s.y}%" data-slot-label="${s.label}" data-slot-index="${i}" ${fit?`data-fit="${fit}"`:""} ${swap?'data-target-action="swap"':""}
                    aria-pressed="${!!selected}" aria-label="${esc(builderSlotAccessibleName(s,p))}" onclick="clickFormationSlot(${i})">
                  <span class="slot-target-label" ${fit||swap?"":"hidden"}>${swap?"SWAP":fit==="best"?"BEST FIT":fit==="good"?"GOOD FIT":""}</span>
                  <span class="slot-position">${s.label}</span>
                  ${p?`<div class="formation-player-token" draggable="false" onclick="event.stopPropagation();clickFormationPlayerToken(${p.id},${i})" onpointerdown="beginFormationPointerDrag(event,${p.id})">
                         ${isCaptain?`<span class="captain-badge" title="Captain">C</span>`:""}<div class="pitch-player-portrait"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(p)}" alt="${esc(p.name)}" loading="eager" decoding="async" width="62" height="62"><span class="effective-ovr" aria-label="${s.label} overall ${effectiveOVR(p,s.label)}">${effectiveOVR(p,s.label)}</span></div><strong title="${esc(p.name)}">${esc(p.name)}</strong>
                       </div>`:`<span class="empty-slot">${partialInactive?"·":"+"}</span>`}
               </button>`;
            }).join("")}
          </div>

          ${createPlayerInfoSidebar(team)}
          ${mobileBuilderPlayerMarkup(team)}

          <div class="formation-roster-panel ${mobileBuilderReservesExpanded?"mobile-reserves-expanded":""} ${!standalone&&benchCollapsed?"hidden":""}">
          <button type="button" class="mobile-reserves-toggle" aria-expanded="${mobileBuilderReservesExpanded}" aria-controls="builderReserveList" onclick="toggleMobileBuilderSection('reserves',this)"><span>RESERVES</span><strong>${bench.length}</strong><i aria-hidden="true">⌄</i></button>
          <aside class="bench-panel ${benchCollapsed?"collapsed":""}" style="${teamVars(team)}" data-formation-bench>
            <div class="bench-heading"><div><span>RESERVES</span><small>${standalone
  ?(team.players.length>11?"SELECTED PLAYERS OUTSIDE THE XI":"SELECT MORE THAN 11 TO CREATE RESERVES")
  :(team.players.length>11?"PLAYERS OUTSIDE THE XI STAY HERE":"DROP HERE TO BENCH")}</small></div><strong>${bench.length}</strong></div>
            <div id="builderReserveList" class="bench-list">
              ${bench.length?bench.map(p=>`<button class="bench-player ${p.id===selectedFormationPlayerId?"selected":""}"
                    data-player-id="${p.id}"
                    onclick="selectBenchPlayer(${p.id})" draggable="false"
                    onpointerdown="beginFormationPointerDrag(event,${p.id})" aria-pressed="${p.id===selectedFormationPlayerId}">
                    <img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(p)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="44" height="52">
                    <span class="bench-player-copy"><strong>${esc(p.name)}</strong>${positionBadges(p,true)}<small>OVR ${playerOverall(p)} // ${primaryPosition(p)}</small></span>
                    <b>DRAG</b>
                  </button>`).join(""):`<div class="history-empty">NO SUBSTITUTES</div>`}
            </div>
          </aside>
          </div>
        </div>
      </div>`;
    if(pool){formationContent.querySelector("[data-standalone-pool-mount]").replaceWith(pool);syncStandalonePoolSelection();}
    restoreFormationViewport(snapshot);
    prioritizeVisiblePortraits(formationContent);
    applyFormationMoveFx();
    if(standalone&&typeof bindStandaloneBuilderPoolUI==="function")bindStandaloneBuilderPoolUI();
    bindMobileBuilderPresentation();
}
// Shared responsive presentation only; assignments, ratings and saves use the
// existing Builder functions. Disclosure state is deliberately not game data.
const mobileBuilderMedia=window.matchMedia("(max-width:1024px)");
let mobileBuilderChemistryExpanded=false;
let mobileBuilderReservesExpanded=false;
let mobileBuilderPoolReturnFocus=null;
let mobileBuilderPoolScroll={x:0,y:0};
function builderText(value){return window.SiteI18n?.text(value)||value;}
function builderSlotAccessibleName(slot,player){
    return [slot.label,player?.name,player?`${builderText("OVR")} ${effectiveOVR(player,slot.label)}`:builderText("PLACE ON PITCH")].filter(Boolean).join(" · ");
}
function clickFormationPlayerToken(id,slotIndex){
    if(mobileBuilderMedia.matches&&selectedFormationPlayerId&&selectedFormationPlayerId!==id)clickFormationSlot(slotIndex);
    else selectFormationPlayerOnly(id);
}
// Empty-slot shortcut: the existing placement function owns every assignment.
function openFormationReservePicker(slotIndex){
    if(selectedFormationPlayerId||getFormationPlayer(formationTeamNumber,slotIndex))return;
    const teamNumber=formationTeamNumber,team=teamByNumber(teamNumber),slot=FORMATIONS[formationByTeam[teamNumber]][slotIndex];
    if(!slot)return;
    const used=assignedIds(teamNumber),reserves=team.players.filter(player=>!used.has(player.id)&&secretPlayerAvailable(player));
    if(teamNumber===0)reserves.sort(compareStandalonePlayers);
    document.getElementById("formationReservePicker")?.remove();
    const dialog=document.createElement("dialog"),top=window.scrollY;
    dialog.id="formationReservePicker";dialog.className="phase4-sheet reserve-picker";
    dialog.setAttribute("aria-labelledby","reservePickerTitle");
    dialog.innerHTML=`<header class="phase4-sheet-heading"><h2 id="reservePickerTitle"><span>ADD PLAYER</span> <b data-i18n-ignore>// ${slot.label}</b></h2><button type="button" data-sheet-close aria-label="CLOSE">×</button></header><div class="phase4-sheet-content">${reserves.length?reserves.map(player=>{const fit=formationSlotFit(player,slot.label);return `<button type="button" class="reserve-picker-player ${fit}" data-reserve-pick="${player.id}"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" width="42" height="48"><span><strong data-i18n-ignore>${esc(player.name)}</strong>${positionBadges(player,true)}<small>OVR <b>${playerOverall(player)}</b></small></span><em>${fit==="best"?"BEST FIT":fit==="good"?"GOOD FIT":"OUT OF POSITION"}</em></button>`;}).join(""):'<p class="lore-empty">NO RESERVES AVAILABLE</p>'}</div>`;
    dialog.addEventListener("click",event=>{
        if(event.target===dialog||event.target.closest("[data-sheet-close]")){dialog.close();return;}
        const button=event.target.closest("[data-reserve-pick]");if(!button||!dialog.open)return;
        const id=Number(button.dataset.reservePick);
        if(formationTeamNumber!==teamNumber||getFormationPlayer(teamNumber,slotIndex)||!reserves.some(player=>player.id===id)||assignedIds(teamNumber).has(id))return;
        dialog.close();movePlayerToSlot(id,slotIndex);
    });
    dialog.addEventListener("close",()=>{dialog.remove();requestAnimationFrame(()=>{formationContent.querySelector(`[data-slot-index="${slotIndex}"]`)?.focus({preventScroll:true});window.scrollTo({top,behavior:"instant"});});},{once:true});
    document.body.appendChild(dialog);window.SiteI18n?.apply(dialog);dialog.showModal();dialog.querySelector("[data-sheet-close]").focus({preventScroll:true});prioritizeVisiblePortraits(dialog);
}

function mobileBuilderPlayerMarkup(team){
    const player=team.players.find(p=>p.id===selectedFormationPlayerId);
    if(!player)return `<section class="mobile-builder-player mobile-builder-player-empty"><span>SELECT A PLAYER</span><p>TAP PLAYER, THEN TAP POSITION</p></section>`;
    const slot=currentPlayerSlot(formationTeamNumber,player.id);
    const captain=formationCaptainByTeam[formationTeamNumber]===player.id;
    return `<section class="mobile-builder-player" style="${teamVars(team)}" aria-label="SELECTED PLAYER">
      <div class="mobile-player-identity"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="" width="52" height="58"><div><strong data-i18n-ignore>${esc(player.name)}</strong>${playerNationalityMarkup(player)}${positionBadges(player)}<div class="mobile-player-ratings"><span>BASE OVR</span> <b>${playerOverall(player)}</b>${slot?` · <span>CURRENT POSITION</span> <b>${slot.label}</b> · <span>OVR</span> <b>${effectiveOVR(player,slot.label)}</b>`:""}</div></div></div>
      <div class="mobile-player-actions">
        <button type="button" id="builderPositionAction" onclick="focusMobileBuilderPitch()">${slot?"SELECT POSITION":"PLACE ON PITCH"}</button>
        ${slot?`<button type="button" id="builderBenchAction" onclick="movePlayerToBench(${player.id})">MOVE TO RESERVES</button><button type="button" id="builderCaptainAction" aria-pressed="${captain}" onclick="setFormationCaptain(${player.id})">${captain?"CURRENT CAPTAIN":"SET CAPTAIN"}</button>`:""}
        <button type="button" id="builderClearAction" onclick="clearSelectedFormationPlayer()">CLEAR SELECTION</button>
        <button type="button" class="mobile-builder-drag-handle" data-formation-drag-handle onpointerdown="beginFormationPointerDrag(event,${player.id})" aria-label="Drag selected player"><span aria-hidden="true">⠿</span> <span>DRAG</span></button>
      </div>
      <div class="mobile-fit-key"><span class="best">BEST FIT</span><span class="good">GOOD FIT</span><span class="swap">SWAP</span></div>
      <p class="mobile-player-instruction" aria-live="polite">TAP PLAYER, THEN TAP POSITION</p>
    </section>`;
}
function focusMobileBuilderPitch(){
    const pitch=formationContent.querySelector(".football-pitch");
    pitch?.scrollIntoView({block:"start",behavior:"instant"});
    formationContent.querySelector('.formation-slot[data-fit="best"]')?.focus({preventScroll:true});
}
function toggleMobileBuilderSection(section,button){
    const chemistry=section==="chemistry";
    if(chemistry)mobileBuilderChemistryExpanded=!mobileBuilderChemistryExpanded;
    else mobileBuilderReservesExpanded=!mobileBuilderReservesExpanded;
    const expanded=chemistry?mobileBuilderChemistryExpanded:mobileBuilderReservesExpanded;
    button.setAttribute("aria-expanded",String(expanded));
    button.parentElement.classList.toggle(chemistry?"is-expanded":"mobile-reserves-expanded",expanded);
}
function openMobileBuilderPool(){
    const panel=formationContent.querySelector(".standalone-pool-panel");
    const dialog=panel?.querySelector("dialog");
    const reveal=panel?.querySelector(".standalone-pool-reveal");
    if(!dialog||dialog.open||!reveal)return;
    mobileBuilderPoolReturnFocus=panel.querySelector("[data-standalone-pool-toggle]");
    mobileBuilderPoolScroll={x:window.scrollX,y:window.scrollY};
    reveal.inert=false;reveal.setAttribute("aria-hidden","false");
    dialog.appendChild(reveal);
    dialog.showModal();
    panel.querySelector("[data-standalone-pool-toggle]")?.setAttribute("aria-expanded","true");
    dialog.querySelector(".mobile-builder-pool-heading button")?.focus({preventScroll:true});
    prioritizeVisiblePortraits(dialog);
}
function closeMobileBuilderPool(){
    const dialog=document.getElementById("mobileBuilderPoolDialog");
    if(dialog?.open)dialog.close();
}
function bindMobileBuilderPresentation(){
    const panel=formationContent.querySelector(".standalone-pool-panel");
    const dialog=panel?.querySelector("dialog");
    if(dialog&&!dialog.dataset.bound){
        dialog.dataset.bound="true";
        dialog.addEventListener("close",()=>{
            const reveal=dialog.querySelector(".standalone-pool-reveal");
            if(reveal){panel.appendChild(reveal);reveal.inert=standalonePoolHidden;reveal.setAttribute("aria-hidden",String(standalonePoolHidden));}
            panel.querySelector("[data-standalone-pool-toggle]")?.setAttribute("aria-expanded",String(!mobileBuilderMedia.matches&&!standalonePoolHidden));
            if(standalonePoolBuilderDirty){standalonePoolBuilderDirty=false;renderFormationBuilder();}
            (panel.querySelector("[data-standalone-pool-toggle]")||mobileBuilderPoolReturnFocus)?.focus({preventScroll:true});
            window.scrollTo({left:mobileBuilderPoolScroll.x,top:mobileBuilderPoolScroll.y,behavior:"instant"});
        });
        dialog.addEventListener("click",event=>{if(event.target===dialog)closeMobileBuilderPool();});
    }
    const toggle=panel?.querySelector("[data-standalone-pool-toggle]");
    if(toggle){
        const mobile=mobileBuilderMedia.matches;
        toggle.textContent=mobile?"OPEN PLAYER POOL":standalonePoolHidden?"SHOW PLAYER POOL":"HIDE PLAYER POOL";
        toggle.setAttribute("aria-controls",mobile?"mobileBuilderPoolDialog":"standalonePoolBody");
        toggle.setAttribute("aria-expanded",String(mobile?!!dialog?.open:!standalonePoolHidden));
    }
    const actions=formationContent.querySelector(".formation-actions");
    let more=actions?.querySelector(".builder-more");
    if(!mobileBuilderMedia.matches&&more){
        more.querySelectorAll(".builder-more-actions>button,.builder-more-actions>.replay-actions>button").forEach(button=>actions.insertBefore(button,more));
        more.remove();
    }else if(mobileBuilderMedia.matches&&actions&&!more){
        more=document.createElement("details");more.className="builder-more";
        more.innerHTML='<summary aria-controls="builderMoreActions">MORE ACTIONS <span aria-hidden="true">⋯</span></summary><div id="builderMoreActions" class="builder-more-actions"></div>';
        const body=more.querySelector(".builder-more-actions");
        actions.querySelectorAll(":scope>button:not(.formation-auto)").forEach(button=>body.appendChild(button));
        actions.appendChild(more);
    }
    // Native <details> provides keyboard operation; reflect its state for AT.
    formationContent.querySelectorAll(".formation-menu,.builder-more").forEach(details=>{
        details.ontoggle=()=>details.querySelector("summary")?.setAttribute("aria-expanded",String(details.open));
        details.querySelector("summary")?.setAttribute("aria-expanded",String(details.open));
    });
}
mobileBuilderMedia.addEventListener("change",()=>{
    closeMobileBuilderPool();
    bindMobileBuilderPresentation();
});
document.addEventListener("keydown",event=>{
    if(formationScreen.classList.contains("hidden")||event.key!=="Escape")return;
    const disclosure=formationContent.querySelector(".formation-menu[open],.builder-more[open]");
    if(disclosure){disclosure.open=false;disclosure.querySelector("summary")?.focus({preventScroll:true});return;}
    if(!document.querySelector("dialog[open]")&&selectedFormationPlayerId)clearSelectedFormationPlayer();
});
formationContent.addEventListener("click",event=>{
    if(!mobileBuilderMedia.matches||!selectedFormationPlayerId)return;
    if(event.target.matches(".football-pitch,.pitch-stripes,.pitch-halfway,.pitch-circle,.pitch-dot,.penalty-box,.goal-box"))clearSelectedFormationPlayer();
});

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

    if(!historyOnlyNavigation()&&appRelativePath()!==routePath("auctionResults")){updateRoute("auctionResults");return;}
    setVisibleScreen(auctionScreen);
    showAuctionComplete();
});
