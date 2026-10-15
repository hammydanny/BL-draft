// BLUE LOCK DRAFT // RESULTS + SHARE
// Split from the former root script.js. Classic scripts share the same global scope.

function getTeamHistory(n){return auctionHistory.filter(x=>x.teamNumber===n);}
function getMostExpensiveSigning(n){
    const a=getTeamHistory(n); if(!a.length)return null;
    return a.reduce((best,x)=>x.price>best.price?x:best,a[0]);
}
function naturalSquadOVR(team){
    if(!team.players.length)return 0;
    // Results rate the strongest available XI rather than letting deep reserves
    // drag down the headline squad strength. The same balance-aware OVR model
    // used by the Team Builder keeps one weak starter from disappearing in a mean.
    const ratings=[...team.players].sort((a,b)=>playerOverall(b)-playerOverall(a)).slice(0,11).map(playerOverall);
    return lineupOVRProfile(ratings).value;
}
function rosterChemistrySnapshot(team){
    const links=[];
    for(let i=0;i<team.players.length;i++)for(let j=i+1;j<team.players.length;j++){
        const a=team.players[i],b=team.players[j],relation=chemistryRelation(a,b);
        links.push({a,b,score:relation.score,label:relation.label,reason:relation.reason,known:!!(relation.contexts.length||CHEMISTRY_SPECIAL[chemistryKey(a,b)])});
    }
    links.sort((x,y)=>y.score-x.score||x.a.name.localeCompare(y.a.name)||x.b.name.localeCompare(y.b.name));
    const known=links.filter(link=>link.known).map(link=>link.score);
    return {overall:chemistryNetworkScore(links.map(link=>link.score),known,links.length),links,source:"ROSTER NETWORK"};
}
function resultChemistrySnapshot(team,n){
    const assignment=formationAssignments?.[n]||{};
    const deployed=Object.values(assignment).filter(Boolean).length;
    if(deployed>=2){
        const formation=formationByTeam[n]||"4-3-3";
        const active=activeFormationSlotIndices(n);
        const chemistry=formationChemistryForAssignment(n,assignment,formation,active);
        const links=[...chemistry.links].sort((x,y)=>y.value-x.value).map(link=>({
            a:link.a.p,b:link.b.p,score:link.value,label:link.relation.label,reason:link.relation.reason,known:true
        }));
        return {overall:chemistry.overall,links,source:`${formation} ACTIVE LINKS`};
    }
    return rosterChemistrySnapshot(team);
}
function resultChemistryLinksMarkup(team,n){
    const snap=resultChemistrySnapshot(team,n);
    const meaningful=snap.links.filter(link=>link.score>=70||link.known);
    const shown=(meaningful.length?meaningful:snap.links).slice(0,6);
    return `<section class="results-chemistry-panel">
      <div class="results-chemistry-head"><div><span>CHEMISTRY LINKS</span><strong>${esc(snap.source)}</strong></div><b class="${snap.overall?chemistryTier(snap.overall):""}">${snap.overall||"--"}</b></div>
      <div class="results-chemistry-links">${shown.length?shown.map(link=>`<div class="result-chem-link ${chemistryTier(link.score)}" title="${esc(link.reason||link.label)}"><span>${esc(link.a.name)}</span><i>×</i><span>${esc(link.b.name)}</span><b>${link.score}</b><small>${esc(link.label)}</small></div>`).join(""):`<div class="results-chemistry-empty">NO ACTIVE CHEMISTRY LINKS YET</div>`}</div>
    </section>`;
}
function getMvpSigning(n){
    const history=getTeamHistory(n);if(!history.length)return null;
    return [...history].sort((a,b)=>playerOverall(b.player)-playerOverall(a.player)||a.price-b.price)[0];
}
function getBestValueSigning(n){
    const history=getTeamHistory(n);if(!history.length)return null;
    const score=x=>playerOverall(x.player)-(x.price/Math.max(1,startingBudget))*32;
    return [...history].sort((a,b)=>score(b)-score(a)||playerOverall(b.player)-playerOverall(a.player))[0];
}
function strongestRosterChemistry(team){
    let best=null;
    for(let i=0;i<team.players.length;i++)for(let j=i+1;j<team.players.length;j++){
        const relation=chemistryRelation(team.players[i],team.players[j]);
        if(!best||relation.score>best.score)best={a:team.players[i],b:team.players[j],...relation};
    }
    return best;
}
function resultMetricLeader(a,b,higher=true){
    if(a===b)return "EVEN";
    return (higher?a>b:a<b)?team1.name:team2.name;
}
function createResultsComparison(){
    const o1=naturalSquadOVR(team1),o2=naturalSquadOVR(team2);
    const c1=resultChemistrySnapshot(team1,1),c2=resultChemistrySnapshot(team2,2);
    const spent1=startingBudget-team1.budget,spent2=startingBudget-team2.budget;
    return `<section class="results-comparison">
      <div class="comparison-head"><span>HEAD-TO-HEAD // DRAFT INTELLIGENCE</span><strong>POST-AUCTION COMPARISON</strong></div>
      <div class="comparison-grid">
        <div><span>SQUAD OVR</span><b style="${teamVars(team1)};color:var(--team-heading,var(--team))">${o1}</b><em>${esc(resultMetricLeader(o1,o2))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team-heading,var(--team))">${o2}</b></div>
        <div><span>CAPITAL REMAINING</span><b style="${teamVars(team1)};color:var(--team-heading,var(--team))">$${team1.budget.toLocaleString()}</b><em>${esc(resultMetricLeader(team1.budget,team2.budget))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team-heading,var(--team))">$${team2.budget.toLocaleString()}</b></div>
        <div><span>CHEMISTRY OVR</span><b style="${teamVars(team1)};color:var(--team-heading,var(--team))">${c1.overall||"--"}</b><em>${esc(resultMetricLeader(c1.overall||0,c2.overall||0))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team-heading,var(--team))">${c2.overall||"--"}</b></div>
        <div><span>CAPITAL SPENT</span><b style="${teamVars(team1)};color:var(--team-heading,var(--team))">$${spent1.toLocaleString()}</b><em>${spent1===spent2?"EVEN SPEND":"DRAFT PROFILE"}</em><b style="${teamVars(team2)};color:var(--team-heading,var(--team))">$${spent2.toLocaleString()}</b></div>
      </div>
    </section>`;
}
function createFinalTeamCard(team,n){
    const spent=startingBudget-team.budget,expensive=getMostExpensiveSigning(n),mvp=getMvpSigning(n),value=getBestValueSigning(n),chemistry=resultChemistrySnapshot(team,n),chem=chemistry.links[0]||null;
    const roster=team.players.length?team.players.map(p=>`<div class="final-player"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(p)}" alt="${esc(p.name)}" loading="lazy" decoding="async"><span>${esc(p.name)}</span>${positionBadges(p,true)}<em class="effective-ovr">${playerOverall(p)}</em></div>`).join(""):`<div class="history-empty">NO PLAYERS DRAFTED</div>`;
    return `<article class="final-team-card results-team-card" style="${teamVars(team)}">
      <div class="team-accent"></div>
      <div class="final-team-top"><span>SQUAD // 0${n}</span><h3>${esc(team.name)}</h3></div>
      <div class="final-stats final-stats-v9">
        <div><span>SQUAD OVR</span><strong>${naturalSquadOVR(team)||"--"}</strong></div>
        <div><span>PLAYERS</span><strong>${team.players.length}</strong></div>
        <div><span>SPENT</span><strong>$${spent.toLocaleString()}</strong></div>
        <div><span>REMAINING</span><strong>$${team.budget.toLocaleString()}</strong></div>
      </div>
      <div class="result-intel-grid">
        <div><span>MVP SIGNING</span><strong>${mvp?esc(mvp.player.name):"—"}</strong><b>${mvp?`OVR ${playerOverall(mvp.player)}`:"—"}</b></div>
        <div><span>BEST VALUE</span><strong>${value?esc(value.player.name):"—"}</strong><b>${value?(value.price===0?"FREE":"$"+value.price.toLocaleString()):"—"}</b></div>
        <div><span>TOP VALUATION</span><strong>${expensive?esc(expensive.player.name):"—"}</strong><b>${expensive?(expensive.price===0?"FREE":"$"+expensive.price.toLocaleString()):"—"}</b></div>
        <div><span>STRONGEST CHEMISTRY</span><strong>${chem?`${esc(chem.a.name)} × ${esc(chem.b.name)}`:"—"}</strong><b class="${chem?chemistryTier(chem.score):""}">${chem?chem.score:"—"}</b></div>
      </div>
      ${resultChemistryLinksMarkup(team,n)}
      <div class="final-roster">${roster}</div>
    </article>`;
}
function createFullHistory(){
    if(!auctionHistory.length)return `<div class="history-empty">NO COMPLETED AUCTIONS</div>`;
    return auctionHistory.map(x=>`<div class="final-history-row" style="--row-team:${accessibleTeamAccent(x.teamColor)}">
      <span class="history-number">${String(x.auction).padStart(2,"0")}</span><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(x.player)}" alt="${esc(x.player.name)}" loading="lazy" decoding="async" width="40" height="49">
      <div><strong>${esc(x.player.name)}</strong><span style="${teamVars({color:x.teamColor})};color:var(--team-heading,var(--team))">${esc(x.teamName)}</span></div>
      <b>${x.price===0?"FREE":"$"+x.price.toLocaleString()}</b></div>`).join("");
}
function showAuctionComplete(){
    auctionScreen.dataset.auctionPhase="complete";
    auctionScreen.style.setProperty("--auction-dock-height","0px");
    const wasComplete=uiState.phase==="complete";
    uiState={screen:"auction",phase:"complete",turn:null};saveGame();
    if(!wasComplete)playSfx("result");
    if(!historyOnlyNavigation()&&appRelativePath()!==routePath("auctionResults")){updateRoute("auctionResults");return;}
    updateSiteDirectory(auctionScreen);
    auctionContent.innerHTML=`<div class="complete-screen results-screen">
      <div class="complete-label">BL // FINAL SELECTION REPORT</div>
      <h2>DRAFT <span>COMPLETE</span></h2><p class="results-subtitle">FINAL SQUAD DATA // ${auctionHistory.length} TRANSFERS</p>
      <div class="results-actions results-actions-top">
        <button id="formationBuilderButton" class="primary-button restart-button"><span>TEAM BUILDER</span><b>⚽</b></button>
        <button id="shareResultsButton" class="primary-button restart-button share-action"><span>SHARE / SAVE RESULT</span><b>↗</b></button>
        <button id="restartAuctionButton" class="primary-button restart-button secondary-action"><span>NEW AUCTION</span><b>↻</b></button>
      </div>
      ${createResultsComparison()}
      <div class="final-team-grid">${createFinalTeamCard(team1,1)}${createFinalTeamCard(team2,2)}</div>
      <section class="full-history"><div class="history-heading"><div><span>COMPLETE RECORD</span><h3>TRANSFER DATABASE</h3></div><b>${String(auctionHistory.length).padStart(2,"0")}</b></div><div class="full-history-list">${createFullHistory()}</div></section>
    </div>`;
    window.scrollTo({top:0,behavior:"instant"});
    document.getElementById("formationBuilderButton").addEventListener("click",openAuctionTeamBuilder);
    document.getElementById("shareResultsButton").addEventListener("click",openShareScreen);
    document.getElementById("restartAuctionButton").addEventListener("click",restartAuction);
    if(appRelativePath()!==routePath("auctionResults"))updateRoute("auctionResults");
}
function shareFormationSnapshot(n){
    const team=teamByNumber(n),formation=formationByTeam[n]||"4-3-3";
    const assignment={...(formationAssignments[n]||{})};
    const shape=FORMATIONS[formation]||FORMATIONS["4-3-3"];
    const deployedCount=Object.values(assignment).filter(Boolean).length;
    const active=deployedCount
      ?activeFormationSlotIndices(n)
      :new Set(preferredActiveSlotIndicesForFormation(n,formation));
    const chemistry=formationChemistryForAssignment(n,assignment,formation,active);
    const ovr=formationTeamOVRForAssignment(n,assignment,formation);
    const captainId=formationCaptainByTeam[n]&&Object.values(assignment).includes(formationCaptainByTeam[n])
      ?formationCaptainByTeam[n]
      :null;
    const used=new Set(Object.values(assignment));
    const reserves=team.players.filter(p=>!used.has(p.id));
    return {
      team,formation,assignment,chemistry,ovr,captainId,reserves,
      deployment:formationDeploymentLimit(n),
      deployedCount,
      complete:deployedCount>=Math.min(11,team.players.length),
      shape
    };
}
function shareChemistrySvg(snap){
    const links=snap?.chemistry?.links||[];
    if(!links.length)return "";
    return `<svg class="share-chemistry-lines chemistry-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${links.map(link=>`<line x1="${link.a.slot.x}" y1="${link.a.slot.y}" x2="${link.b.slot.x}" y2="${link.b.slot.y}" class="chem-link ${chemistryTier(link.value)}"></line>`).join("")}</svg>`;
}
function createShareTeam(team,n){
    const spent=startingBudget-team.budget,snap=shareFormationSnapshot(n);
    const captain=team.players.find(p=>p.id===snap.captainId)||null;
    const target=Math.min(11,team.players.length);
    const stateLabel=snap.deployedCount===0?"NO FORMATION BUILT":snap.complete?"FORMATION COMPLETE":`INCOMPLETE ${snap.deployedCount}/${target}`;
    return `<article class="share-team share-team-v15" style="${teamVars(team)}">
      <div class="share-team-head"><div><span>SQUAD 0${n} // ${stateLabel}</span><h3>${esc(team.name)}</h3></div><b>${team.players.length}</b></div>
      <div class="share-v14-metrics">
        <div><span>TEAM OVR</span><strong>${snap.ovr||"--"}</strong></div>
        <div><span>CHEMISTRY</span><strong class="${snap.chemistry.overall?chemistryTier(snap.chemistry.overall):""}">${snap.chemistry.overall||"--"}</strong></div>
        <div><span>CAPTAIN</span><strong>${captain?esc(captain.name):"—"}</strong></div>
        <div><span>DEPLOYED</span><strong>${snap.deployedCount}<small> / ${target}</small></strong></div>
      </div>
      <div class="share-mini-pitch ${snap.deployedCount===0?"empty-share-pitch":""}">
        <div class="share-pitch-half"></div><div class="share-pitch-circle"></div>
        ${shareChemistrySvg(snap)}
        ${snap.shape.map((slot,i)=>{
          const player=team.players.find(p=>p.id===snap.assignment[i]);
          if(!player)return `<div class="share-pitch-empty" style="left:${slot.x}%;top:${slot.y}%"><span>${slot.label}</span><b>+</b></div>`;
          const isCaptain=player.id===snap.captainId;
          return `<div class="share-pitch-player" style="left:${slot.x}%;top:${slot.y}%">
            <div class="report-player-portrait">${isCaptain?`<i class="report-captain" aria-label="Captain">C</i>`:""}<img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" width="50" height="50" loading="eager" decoding="async"><span class="report-position">${slot.label}</span></div><b>${esc(player.name)}</b>
          </div>`;
        }).join("")}
      </div>
      <div class="share-v14-bottom">
        <div class="share-money compact"><div><span>SPENT</span><strong>$${spent.toLocaleString()}</strong></div><div><span>REMAINING</span><strong>$${team.budget.toLocaleString()}</strong></div></div>
        <div class="share-chem-note"><span>BEST LINK</span><strong>${snap.chemistry.top?`${esc(snap.chemistry.top.a.p.name)} × ${esc(snap.chemistry.top.b.p.name)}`:"—"}</strong><b class="${snap.chemistry.top?chemistryTier(snap.chemistry.top.value):""}">${snap.chemistry.top?.value||"--"}</b></div>
      </div>
      ${snap.reserves.length?`<div class="share-reserves"><span>RESERVES // ${snap.reserves.length}</span><div>${snap.reserves.map(p=>`<b><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(p)}" alt="${esc(p.name)}" width="24" height="26" loading="lazy" decoding="async"><span>${esc(p.name)}</span> <i>${playerOverall(p)}</i></b>`).join("")}</div></div>`:""}
    </article>`;
}
function openShareScreen(){
    document.getElementById("shareScreen")?.remove();
    const screen=document.createElement("section");screen.id="shareScreen";screen.className="share-screen";
    screen.innerHTML=`<div class="share-shell">
      <div class="share-toolbar"><button id="closeShareScreen">← RESULTS</button><div><button id="copyShareSummary">COPY SUMMARY</button><button id="printShareResult">SAVE / PRINT</button></div></div>
      <div id="shareCard" class="share-card">
        <div class="share-card-top"><div><span>BL // FINAL MATCHUP REPORT</span><h2>BLUE LOCK <b>DRAFT</b></h2></div><strong>FINAL</strong></div>
        <div class="share-versus"><span>${esc(team1.name)}</span><b>VS</b><span>${esc(team2.name)}</span></div>
        <div class="share-team-grid">${createShareTeam(team1,1)}${createShareTeam(team2,2)}</div>
        <div class="share-card-footer"><span>DEVELOPED BY <b>HAMMYDANNY@GITHUB</b> // WITH THE SUPPORT OF <b>SYAAFIBWN@GITHUB</b></span><span>UNOFFICIAL FAN PROJECT // 2026</span></div>
      </div></div>`;
    document.body.appendChild(screen);
    document.getElementById("closeShareScreen").onclick=()=>{screen.remove();};
    document.getElementById("printShareResult").onclick=()=>window.print();
    document.getElementById("copyShareSummary").onclick=copyShareSummary;
}
async function copyShareSummary(){
    const t=value=>window.SiteI18n?.text(value)||value;
    const line=n=>{
        const snap=shareFormationSnapshot(n),captain=teamByNumber(n).players.find(p=>p.id===snap.captainId);
        return `${teamByNumber(n).name} // ${snap.formation} // OVR ${snap.ovr||"--"} // CHEM ${snap.chemistry.overall||"--"} // C ${captain?.name||"—"} // RES ${snap.reserves.length}`;
    };
    const names=t=>t.players.map(p=>p.name).join(", ");
    const text=`BLUE LOCK DRAFT // ${t("FINAL RESULT")}\n${line(1)}\n${names(team1)}\n\n${line(2)}\n${names(team2)}\n\n${t("DEVELOPED BY")} hammydanny@Github // ${t("WITH SUPPORT FROM")} syaafibwn@github`;
    try{await navigator.clipboard.writeText(text);const b=document.getElementById("copyShareSummary");b.textContent="COPIED ✓";setTimeout(()=>b.textContent="COPY SUMMARY",1400);}
    catch(e){showSiteError("Your browser blocked clipboard access. Use SAVE / PRINT instead.","SHARE ERROR");}
}
function restartAuction(){
    showConfirm("START A NEW AUCTION","Your current auction and saved progress will be cleared.",()=>{
        clearSavedGame();
        uiState={screen:"setup",phase:"setup",turn:null};

        auctionContent.innerHTML="";playersRemainingDisplay.innerHTML="";
        saveSetupPreferences();showResumeCard(null);refreshMainMenu();updateRoute("auctionSetup");
        window.scrollTo({top:0,behavior:"smooth"});
    });
}


function createStandaloneShareTeam(){
    const team=standaloneBuilderTeam,snap=shareFormationSnapshot(0);
    const captain=team.players.find(p=>p.id===snap.captainId)||null;
    const target=Math.min(11,team.players.length);
    const stateLabel=snap.deployedCount===0?"NO FORMATION BUILT":snap.complete?"FORMATION COMPLETE":`INCOMPLETE ${snap.deployedCount}/${target}`;
    return `<article class="share-team standalone-share-team" style="${teamVars(team)}">
      <div class="squad-report-status"><span>${stateLabel}</span><b>${team.players.length} SELECTED</b></div>
      <div class="share-v14-metrics">
        <div><span>FORMATION</span><strong>${snap.formation}</strong></div>
        <div><span>TEAM OVR</span><strong>${snap.ovr||"--"}</strong></div>
        <div><span>CHEMISTRY</span><strong class="${snap.chemistry.overall?chemistryTier(snap.chemistry.overall):""}">${snap.chemistry.overall||"--"}</strong></div>
        <div><span>DEPLOYED</span><strong>${snap.deployedCount}<small> / ${target}</small></strong></div>
      </div>
      <div class="squad-report-layout">
        <div class="share-mini-pitch ${snap.deployedCount===0?"empty-share-pitch":""}">
          <div class="share-pitch-half"></div><div class="share-pitch-circle"></div>
          ${shareChemistrySvg(snap)}
          ${snap.shape.map((slot,i)=>{
            const player=team.players.find(p=>p.id===snap.assignment[i]);
            if(!player)return `<div class="share-pitch-empty" style="left:${slot.x}%;top:${slot.y}%"><span>${slot.label}</span><b>+</b></div>`;
            return `<div class="share-pitch-player" style="left:${slot.x}%;top:${slot.y}%">
              <div class="report-player-portrait">${player.id===snap.captainId?'<i class="report-captain">C</i>':""}<img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" width="60" height="60" loading="eager" decoding="async"><span class="report-position">${slot.label}</span><em>${effectiveOVR(player,slot.label)}</em></div><b>${esc(player.name)}</b>
            </div>`;
          }).join("")}
        </div>
        <aside class="squad-report-info">
          <div class="report-info-item"><span>CAPTAIN</span><strong>${captain?esc(captain.name):"UNASSIGNED"}</strong></div>
          <div class="report-info-item report-best-link"><span>BEST LINK</span><strong>${snap.chemistry.top?`${esc(snap.chemistry.top.a.p.name)} × ${esc(snap.chemistry.top.b.p.name)}`:"NO ACTIVE LINK"}</strong><b class="${snap.chemistry.top?chemistryTier(snap.chemistry.top.value):""}">${snap.chemistry.top?.value||"--"}</b></div>
          <div class="share-reserves"><span>RESERVES // ${snap.reserves.length}</span><div>${snap.reserves.length?snap.reserves.map(p=>`<b><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(p)}" alt="${esc(p.name)}" width="36" height="40" loading="lazy" decoding="async"><span>${esc(p.name)}</span><i>${playerOverall(p)}</i></b>`).join(""):'<p>NO RESERVES</p>'}</div></div>
        </aside>
      </div>
    </article>`;
}

async function copyStandaloneShareSummary(){
    const t=value=>window.SiteI18n?.text(value)||value;
    const snap=shareFormationSnapshot(0);
    const captain=standaloneBuilderTeam.players.find(p=>p.id===snap.captainId);
    const starters=Object.values(snap.assignment)
      .map(id=>standaloneBuilderTeam.players.find(p=>p.id===id))
      .filter(Boolean)
      .map(p=>p.name)
      .join(", ");
    const reserves=snap.reserves.map(p=>p.name).join(", ");
    const text=`BLUE LOCK DRAFT // ${t("GLOBAL XI")}
${t("FORMATION")} ${snap.formation} // OVR ${snap.ovr||"--"} // CHEM ${snap.chemistry.overall||"--"} // C ${captain?.name||"—"}
${t("STARTERS")}: ${starters||t("NONE")}
${t("RESERVES")}: ${reserves||t("NONE")}

${t("DEVELOPED BY")} hammydanny@Github // ${t("WITH SUPPORT FROM")} syaafibwn@Github`;
    try{
        await navigator.clipboard.writeText(text);
        const b=document.getElementById("copyStandaloneShare");
        if(b){b.textContent="COPIED ✓";setTimeout(()=>b.textContent="COPY SUMMARY",1400);}
    }catch(e){
        showSiteError("Your browser blocked clipboard access. Use SAVE / PRINT instead.","SHARE ERROR");
    }
}

function openStandaloneShareScreen(){
    standaloneBuilderSyncTeam();
    saveStandaloneBuilderState();
    document.getElementById("shareScreen")?.remove();

    const screen=document.createElement("section");
    screen.id="shareScreen";
    screen.className="share-screen standalone-share-screen";
    screen.innerHTML=`<div class="share-shell standalone-share-shell">
      <div class="share-toolbar">
        <button id="closeShareScreen">← TEAM BUILDER</button>
        <div>
          <button id="copyStandaloneShare">COPY SUMMARY</button>
          <button id="printShareResult">SAVE / PRINT</button>
        </div>
      </div>
      <div id="shareCard" class="share-card standalone-share-card">
        <div class="share-card-top">
          <div><span>BL // STANDALONE SQUAD REPORT</span><h2>GLOBAL <b>XI</b></h2></div>
          <strong>TEAM</strong>
        </div>
        <div class="standalone-share-grid">${createStandaloneShareTeam()}</div>
        <div class="share-card-footer">
          <span>DEVELOPED BY <b>HAMMYDANNY@GITHUB</b> // WITH THE SUPPORT OF <b>SYAAFIBWN@GITHUB</b></span>
          <span>UNOFFICIAL FAN PROJECT // 2026</span>
        </div>
      </div>
    </div>`;
    screen.setAttribute("role","dialog");screen.setAttribute("aria-modal","true");screen.setAttribute("aria-label","Standalone squad report");
    const previousFocus=document.activeElement;
    const builderViewport=captureFormationViewport();
    document.body.appendChild(screen);
    prioritizeVisiblePortraits(screen);
    function close(){screen.remove();previousFocus?.focus({preventScroll:true});restoreFormationViewport(builderViewport);}
    screen.addEventListener("keydown",event=>{
        if(event.key==="Escape"){event.preventDefault();close();}
        if(event.key==="Tab"){
            const buttons=[...screen.querySelectorAll("button")],first=buttons[0],last=buttons.at(-1);
            if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        }
    });
    document.getElementById("closeShareScreen").onclick=close;
    document.getElementById("closeShareScreen").focus();
    document.getElementById("printShareResult").onclick=()=>window.print();
    document.getElementById("copyStandaloneShare").onclick=copyStandaloneShareSummary;
}
