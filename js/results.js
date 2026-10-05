// BLUE LOCK DRAFT // RESULTS + SHARE
// Split from the former root script.js. Classic scripts share the same global scope.

function getTeamHistory(n){return auctionHistory.filter(x=>x.teamNumber===n);}
function getMostExpensiveSigning(n){
    const a=getTeamHistory(n); if(!a.length)return null;
    return a.reduce((best,x)=>x.price>best.price?x:best,a[0]);
}
function naturalSquadOVR(team){
    if(!team.players.length)return 0;
    return Math.round(team.players.reduce((sum,p)=>sum+playerOverall(p),0)/team.players.length);
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
    const c1=strongestRosterChemistry(team1),c2=strongestRosterChemistry(team2);
    const spent1=startingBudget-team1.budget,spent2=startingBudget-team2.budget;
    return `<section class="results-comparison">
      <div class="comparison-head"><span>HEAD-TO-HEAD // DRAFT INTELLIGENCE</span><strong>POST-AUCTION COMPARISON</strong></div>
      <div class="comparison-grid">
        <div><span>SQUAD OVR</span><b style="${teamVars(team1)};color:var(--team)">${o1}</b><em>${esc(resultMetricLeader(o1,o2))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team)">${o2}</b></div>
        <div><span>CAPITAL REMAINING</span><b style="${teamVars(team1)};color:var(--team)">$${team1.budget.toLocaleString()}</b><em>${esc(resultMetricLeader(team1.budget,team2.budget))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team)">$${team2.budget.toLocaleString()}</b></div>
        <div><span>BEST CHEMISTRY</span><b style="${teamVars(team1)};color:var(--team)">${c1?.score||"--"}</b><em>${esc(resultMetricLeader(c1?.score||0,c2?.score||0))} ADVANTAGE</em><b style="${teamVars(team2)};color:var(--team)">${c2?.score||"--"}</b></div>
        <div><span>CAPITAL SPENT</span><b style="${teamVars(team1)};color:var(--team)">$${spent1.toLocaleString()}</b><em>${spent1===spent2?"EVEN SPEND":"DRAFT PROFILE"}</em><b style="${teamVars(team2)};color:var(--team)">$${spent2.toLocaleString()}</b></div>
      </div>
    </section>`;
}
function createFinalTeamCard(team,n){
    const spent=startingBudget-team.budget,expensive=getMostExpensiveSigning(n),mvp=getMvpSigning(n),value=getBestValueSigning(n),chem=strongestRosterChemistry(team);
    const roster=team.players.length?team.players.map(p=>`<div class="final-player"><img src="${p.image}" alt="${esc(p.name)}"><span>${esc(p.name)}</span>${positionBadges(p,true)}<em class="effective-ovr">${playerOverall(p)}</em></div>`).join(""):`<div class="history-empty">NO PLAYERS DRAFTED</div>`;
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
      <div class="final-roster">${roster}</div>
    </article>`;
}
function createFullHistory(){
    if(!auctionHistory.length)return `<div class="history-empty">NO COMPLETED AUCTIONS</div>`;
    return auctionHistory.map(x=>`<div class="final-history-row" style="--row-team:${accessibleTeamAccent(x.teamColor)}">
      <span class="history-number">${String(x.auction).padStart(2,"0")}</span><img src="${x.player.image}" alt="${esc(x.player.name)}">
      <div><strong>${esc(x.player.name)}</strong><span style="color:${accessibleTeamAccent(x.teamColor)}">${esc(x.teamName)}</span></div>
      <b>${x.price===0?"FREE":"$"+x.price.toLocaleString()}</b></div>`).join("");
}
function showAuctionComplete(){
    const wasComplete=uiState.phase==="complete";
    uiState={screen:"auction",phase:"complete",turn:null};saveGame();
    if(!wasComplete)playSfx("result");
    playersRemainingDisplay.innerHTML="COMPLETE";
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
    window.scrollTo({top:0,behavior:"auto"});
    requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"auto"}));
    document.getElementById("formationBuilderButton").addEventListener("click",openFormationBuilder);
    document.getElementById("shareResultsButton").addEventListener("click",openShareScreen);
    document.getElementById("restartAuctionButton").addEventListener("click",restartAuction);
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
        ${snap.shape.map((slot,i)=>{
          const player=team.players.find(p=>p.id===snap.assignment[i]);
          if(!player)return `<div class="share-pitch-empty" style="left:${slot.x}%;top:${slot.y}%"><span>${slot.label}</span><b>+</b></div>`;
          const isCaptain=player.id===snap.captainId;
          return `<div class="share-pitch-player" style="left:${slot.x}%;top:${slot.y}%">
            ${isCaptain?`<i>C</i>`:""}<span>${slot.label}</span><img src="${player.image}" alt=""><b>${esc(player.name)}</b>
          </div>`;
        }).join("")}
      </div>
      <div class="share-v14-bottom">
        <div class="share-money compact"><div><span>SPENT</span><strong>$${spent.toLocaleString()}</strong></div><div><span>REMAINING</span><strong>$${team.budget.toLocaleString()}</strong></div></div>
        <div class="share-chem-note"><span>BEST LINK</span><strong>${snap.chemistry.top?`${esc(snap.chemistry.top.a.p.name)} × ${esc(snap.chemistry.top.b.p.name)}`:"—"}</strong><b class="${snap.chemistry.top?chemistryTier(snap.chemistry.top.value):""}">${snap.chemistry.top?.value||"--"}</b></div>
      </div>
      ${snap.reserves.length?`<div class="share-reserves"><span>RESERVES // ${snap.reserves.length}</span><div>${snap.reserves.map(p=>`<b><img src="${p.image}" alt="">${esc(p.name)} <i>${playerOverall(p)}</i></b>`).join("")}</div></div>`:""}
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
    document.getElementById("closeShareScreen").onclick=()=>screen.remove();
    document.getElementById("printShareResult").onclick=()=>window.print();
    document.getElementById("copyShareSummary").onclick=copyShareSummary;
}
async function copyShareSummary(){
    const line=n=>{
        const snap=shareFormationSnapshot(n),captain=teamByNumber(n).players.find(p=>p.id===snap.captainId);
        return `${teamByNumber(n).name} // ${snap.formation} // OVR ${snap.ovr||"--"} // CHEM ${snap.chemistry.overall||"--"} // C ${captain?.name||"—"} // RES ${snap.reserves.length}`;
    };
    const names=t=>t.players.map(p=>p.name).join(", ");
    const text=`BLUE LOCK DRAFT // FINAL RESULT\n${line(1)}\n${names(team1)}\n\n${line(2)}\n${names(team2)}\n\nDeveloped by hammydanny@Github // With the support of syaafibwn@github`;
    try{await navigator.clipboard.writeText(text);const b=document.getElementById("copyShareSummary");b.textContent="COPIED ✓";setTimeout(()=>b.textContent="COPY SUMMARY",1400);}
    catch(e){showSiteError("Your browser blocked clipboard access. Use SAVE / PRINT instead.","SHARE ERROR");}
}
function restartAuction(){
    showConfirm("START A NEW AUCTION","Your current auction and saved progress will be cleared.",()=>{
        clearSavedGame();
        uiState={screen:"setup",phase:"setup",turn:null};
        auctionScreen.classList.add("hidden");formationScreen.classList.add("hidden");setupScreen.classList.remove("hidden");
        auctionContent.innerHTML="";playersRemainingDisplay.innerHTML="";
        saveSetupPreferences();showResumeCard(null);refreshMainMenu();
        window.scrollTo({top:0,behavior:"smooth"});
    });
}
