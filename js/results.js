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
      ${typeof resultTeamActions==="function"?resultTeamActions(n):""}
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
    if(typeof ensureCpuSquadBuilt==="function")ensureCpuSquadBuilt();
    if(typeof ensureModeInitialLineup==="function")ensureModeInitialLineup();
    auctionScreen.dataset.auctionPhase="complete";
    auctionScreen.style.setProperty("--auction-dock-height","0px");
    const wasComplete=uiState.phase==="complete";
    uiState={screen:"auction",phase:"complete",turn:null};saveGame();
    if(!wasComplete)playSfx("result");
    if(!historyOnlyNavigation()&&appRelativePath()!==routePath("auctionResults")){updateRoute("auctionResults");return;}
    updateSiteDirectory(auctionScreen);
    auctionContent.innerHTML=`<div class="complete-screen results-screen">
      <div class="complete-label">BL // FINAL SELECTION REPORT</div>
      <h2>${activeDraftChallenge?esc(replayText(activeDraftChallenge.id==="daily"?"DAILY REPORT":"MISSION REPORT")):"DRAFT <span>COMPLETE</span>"}</h2><p class="results-subtitle">FINAL SQUAD DATA // ${auctionHistory.length} TRANSFERS</p>
      <div class="results-actions results-actions-top result-action-toolbar">
        <button id="formationBuilderButton" class="primary-button restart-button"><span>TEAM BUILDER</span><b>⚽</b></button>
        <button id="shareResultsButton" type="button">SAVE</button><button id="nativeShareResults" type="button">SHARE</button>
        <button id="restartAuctionButton" class="primary-button restart-button secondary-action"><span>NEW AUCTION</span><b>↻</b></button>
      </div>
      ${team2CpuControlled?`<p class="cpu-status">${esc(SiteI18n.text("SINGLEPLAYER"))} · ${esc(SiteI18n.text(cpuDifficulty.toUpperCase()))}</p>`:""}
      ${typeof modeResultsMarkup==="function"?modeResultsMarkup():""}
      ${createResultsComparison()}
      <div class="final-team-grid">${createFinalTeamCard(team1,1)}${createFinalTeamCard(team2,2)}</div>
      <section class="full-history"><div class="history-heading"><div><span>COMPLETE RECORD</span><h3>TRANSFER DATABASE</h3></div><b>${String(auctionHistory.length).padStart(2,"0")}</b></div><div class="full-history-list">${createFullHistory()}</div></section>
    </div>`;
    if(!wasComplete&&typeof animateModeResult==="function")animateModeResult();
    window.scrollTo({top:0,behavior:"instant"});
    document.getElementById("formationBuilderButton").addEventListener("click",openAuctionTeamBuilder);
    document.getElementById("nativeShareResults").onclick=()=>shareResultsImageAndLink();
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
function openShareScreen(){return openExportPreview();}
function openExportPreview(teamNumber=null,reportContext=null){
    const previous=document.getElementById("shareScreen");if(previous){setSiteDialogState(previous,false);previous.remove();}
    const previousFocus=document.activeElement,screen=document.createElement("section");let imageUrl=null,preparedBlob=null;
    screen.id="shareScreen";screen.className="share-screen export-preview";screen.setAttribute("role","dialog");screen.setAttribute("aria-modal","true");screen.setAttribute("aria-label","SAVE PREVIEW");
    screen.innerHTML=`<div class="export-preview-shell"><div class="share-toolbar"><button id="closeShareScreen" type="button">BACK</button><h2>SAVE PREVIEW</h2><div><button id="saveReportImage" type="button" disabled>SAVE IMAGE</button><button id="printShareResult" type="button" disabled>PRINT</button>${reportContext?"":teamNumber===0?'<button id="copyStandaloneShare" type="button">COPY SUMMARY</button>':'<button id="shareTeamsAndLink" type="button" disabled>SHARE</button>'}</div></div><p id="exportPreviewStatus" role="status">PREPARING IMAGE…</p><div id="shareCard" class="export-preview-image"><img id="exportPreviewImage" alt="Result image preview" hidden></div>${teamNumber===0&&!reportContext?`<div class="standalone-report-actions">${resultTeamActions(0)}<button type="button" data-saved-squads>SAVED SQUADS</button><button type="button" data-replay-import>IMPORT SQUAD</button></div>`:""}</div>`;
    document.body.appendChild(screen);setSiteDialogState(screen,true);SiteI18n.apply(screen);
    const close=()=>{setSiteDialogState(screen,false);screen.remove();if(imageUrl)URL.revokeObjectURL(imageUrl);if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});};
    document.getElementById("closeShareScreen").onclick=close;document.getElementById("closeShareScreen").focus();
    screen.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();close();}else trapSiteDialogFocus(event);});
    document.getElementById("saveReportImage").onclick=()=>{if(preparedBlob)saveDraftImage(teamNumber,preparedBlob);};document.getElementById("printShareResult").onclick=()=>{if(preparedBlob)window.print();};
    if(!reportContext){if(teamNumber===0)document.getElementById("copyStandaloneShare").onclick=copyStandaloneShareSummary;
    else document.getElementById("shareTeamsAndLink").onclick=()=>shareResultsImageAndLink(preparedBlob);}
    requestAnimationFrame(async()=>{try{const blob=await createAuctionShareImageBlob(teamNumber,reportContext?.entries,reportContext?.report);if(!screen.isConnected)return;preparedBlob=blob;imageUrl=URL.createObjectURL(blob);const image=document.getElementById("exportPreviewImage");image.src=imageUrl;await image.decode();if(!screen.isConnected)return;image.hidden=false;document.getElementById("exportPreviewStatus").textContent=replayText("This is the exact image that will be saved.");for(const id of ["saveReportImage","printShareResult","shareTeamsAndLink"]){const button=document.getElementById(id);if(button)button.disabled=false;}}
        catch(error){if(screen.isConnected)document.getElementById("exportPreviewStatus").textContent=replayText(error.message==="Some portraits are not ready. Try again."?error.message:"Image export is unavailable.");}});
    return screen;
}
function exportModeReport(){
    if(activeDraftChallenge){const r=modeScore(activeDraftChallenge);return {title:replayText(activeDraftChallenge.title),subtitle:[activeDraftChallenge.date,r.grade,replayText(r.gradeLabel),replayText("FINAL SCORE")+" "+r.score.toLocaleString(SiteI18n.language)].filter(Boolean).join(" · "),left:r.components.map(c=>replayText(c.label)+"  "+(c.value>0?"+":"")+c.value.toLocaleString(SiteI18n.language)),right:r.goals.map(g=>(g.pass?"✓ ":"○ ")+replayText(g.label)+"  "+g.current+" / "+g.target)};}
    if(team2CpuControlled)return {title:replayText("VS CPU")+" · "+replayText(cpuDifficulty.toUpperCase()),subtitle:replayText("DRAFT VERDICT"),left:[team1.name+" · "+replayText("TEAM QUALITY")+" "+naturalSquadOVR(team1),team2.name+" · "+replayText("TEAM QUALITY")+" "+naturalSquadOVR(team2)],right:[team1.name+" · "+replayText("CHEMISTRY")+" "+resultChemistrySnapshot(team1,1).overall,team2.name+" · "+replayText("CHEMISTRY")+" "+resultChemistrySnapshot(team2,2).overall]};
    return null;
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

function shareImageRoundRect(ctx,x,y,w,h,r,fill,stroke){
    const radius=Math.min(r,w/2,h/2);
    ctx.beginPath();ctx.moveTo(x+radius,y);ctx.lineTo(x+w-radius,y);ctx.arcTo(x+w,y,x+w,y+radius,radius);
    ctx.lineTo(x+w,y+h-radius);ctx.arcTo(x+w,y+h,x+w-radius,y+h,radius);ctx.lineTo(x+radius,y+h);ctx.arcTo(x,y+h,x,y+h-radius,radius);
    ctx.lineTo(x,y+radius);ctx.arcTo(x,y,x+radius,y,radius);ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}
}
function shareImageText(ctx,value,x,y,maxWidth,font,color,align="left"){
    let label=String(value??"");ctx.font=font;ctx.fillStyle=color;ctx.direction=/[\u0600-\u06ff]/.test(label)?"rtl":"ltr";ctx.textAlign=align;
    while(label.length>2&&ctx.measureText(label).width>maxWidth)label=label.slice(0,-2)+"…";
    ctx.fillText(label,x,y);ctx.textAlign="left";
}
function drawReportPortrait(ctx,image,x,y,width,height){
    const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;if(!iw||!ih)return;
    const scale=Math.max(width/iw,height/ih),sw=width/scale,sh=height/scale;ctx.drawImage(image,(iw-sw)/2,0,sw,sh,x,y,width,height);
}
function drawAuctionShareImageTeam(ctx,team,n,snap,layout){
    const {x,y,width,height,portraits}=layout,accent=/^#[0-9a-f]{3,8}$/i.test(String(team.color||""))?team.color:"#25a9ff";
    const translate=value=>window.SiteI18n?.text(value)||value,spent=startingBudget-team.budget;
    const captain=team.players.find(player=>player.id===snap.captainId)||null;
    const reportOVR=snap.deployedCount?snap.ovr:naturalSquadOVR(team),reportChemistry=snap.deployedCount?snap.chemistry:rosterChemistrySnapshot(team);
    const usedIds=new Set(Object.values(snap.assignment||{}).filter(Boolean).map(String));
    shareImageRoundRect(ctx,x,y,width,height,18,"#0a1d33","#234866");ctx.fillStyle=accent;ctx.fillRect(x+1,y+18,5,height-36);
    shareImageText(ctx,translate("SQUAD")+(n?" "+String(n).padStart(2,"0"):"")+"  //  "+"\u2066"+snap.formation+"\u2069",x+28,y+35,width-56,'800 18px "Barlow Condensed", sans-serif',"#61bcff");
    shareImageText(ctx,team.name,x+28,y+78,width-178,'900 italic 39px "Barlow Condensed", sans-serif',"#f0f7ff");
    shareImageText(ctx,team.players.length+" "+translate("PLAYERS"),x+width-28,y+72,125,'800 17px "Barlow Condensed", sans-serif',"#9cbad4","right");
    const metricY=y+100,metricH=62,gap=8,insideW=width-48,metricW=(insideW-gap*4)/5;
    const metrics=[
        [translate(snap.deployedCount?"TEAM OVR":"SQUAD OVR"),String(reportOVR||"--")],[translate("CHEMISTRY"),String(reportChemistry?.overall||"--")],
        [translate("CAPTAIN"),captain?.name||translate("UNASSIGNED")],[translate("DEPLOYED"),snap.deployedCount+"/"+Math.min(11,team.players.length)],
        n?[translate("REMAINING"),"$"+team.budget.toLocaleString()]:[translate("RESERVES"),String(snap.reserves.length)]
    ];
    metrics.forEach((metric,i)=>{
        const mx=x+24+i*(metricW+gap);shareImageRoundRect(ctx,mx,metricY,metricW,metricH,8,"#102b46","#244c6d");
        shareImageText(ctx,metric[0],mx+10,metricY+19,metricW-20,'800 11px "Barlow Condensed", sans-serif',"#87a9c8");
        shareImageText(ctx,metric[1],mx+10,metricY+46,metricW-20,'800 19px "Barlow Condensed", sans-serif',"#f2f8ff");
    });
    const pitchX=x+24,pitchY=y+181,pitchW=width-48,pitchH=360;
    shareImageRoundRect(ctx,pitchX,pitchY,pitchW,pitchH,10,"#071d31","#2c5774");
    ctx.strokeStyle="rgba(109,185,229,.24)";ctx.lineWidth=1.5;ctx.strokeRect(pitchX+14,pitchY+14,pitchW-28,pitchH-28);
    ctx.beginPath();ctx.moveTo(pitchX+14,pitchY+pitchH/2);ctx.lineTo(pitchX+pitchW-14,pitchY+pitchH/2);ctx.stroke();
    ctx.beginPath();ctx.arc(pitchX+pitchW/2,pitchY+pitchH/2,52,0,Math.PI*2);ctx.stroke();
    ctx.strokeRect(pitchX+pitchW*.34,pitchY+14,pitchW*.32,53);ctx.strokeRect(pitchX+pitchW*.34,pitchY+pitchH-67,pitchW*.32,53);
    ctx.strokeRect(pitchX+pitchW*.42,pitchY+14,pitchW*.16,21);ctx.strokeRect(pitchX+pitchW*.42,pitchY+pitchH-35,pitchW*.16,21);
    (snap.chemistry?.links||[]).filter(link=>Number(link.value)>=82&&link.a?.slot&&link.b?.slot).slice(0,14).forEach(link=>{
        ctx.strokeStyle="rgba(63,173,255,.30)";ctx.lineWidth=2;ctx.beginPath();
        ctx.moveTo(pitchX+pitchW*(Number(link.a.slot.x)||0)/100,pitchY+pitchH*(Number(link.a.slot.y)||0)/100);
        ctx.lineTo(pitchX+pitchW*(Number(link.b.slot.x)||0)/100,pitchY+pitchH*(Number(link.b.slot.y)||0)/100);ctx.stroke();
    });
    const markerW=Math.min(148,pitchW*.205),markerH=48;
    (snap.shape||[]).forEach((slot,index)=>{
        const player=team.players.find(item=>item.id===snap.assignment?.[index]);
        const centerX=pitchX+pitchW*(Number(slot.x)||0)/100,centerY=pitchY+pitchH*(Number(slot.y)||0)/100;
        const markerX=Math.max(pitchX+3,Math.min(pitchX+pitchW-markerW-3,centerX-markerW/2));
        const markerY=Math.max(pitchY+3,Math.min(pitchY+pitchH-markerH-3,centerY-markerH/2));
        if(!player){shareImageRoundRect(ctx,markerX,markerY,markerW,markerH,6,"rgba(7,31,51,.90)","rgba(101,153,186,.50)");shareImageText(ctx,slot.label+"  +",markerX+markerW/2,markerY+29,markerW-12,'800 15px "Barlow Condensed", sans-serif',"#6887a2","center");return;}
        const isCaptain=player.id===snap.captainId;
        shareImageRoundRect(ctx,markerX,markerY,markerW,markerH,6,"#0c3456",isCaptain?"#ffd36e":accent);
        shareImageText(ctx,slot.label+(isCaptain?" · C":""),markerX+8,markerY+15,markerW-40,'800 11px "Barlow Condensed", sans-serif',isCaptain?"#ffdc83":"#70c6ff");
        shareImageText(ctx,String(playerOverall(player)),markerX+markerW-8,markerY+15,27,'900 12px "Barlow Condensed", sans-serif',"#eaf6ff","right");
        if(portraits?.get(player.id))drawReportPortrait(ctx,portraits.get(player.id),markerX+5,markerY+18,24,26);
        shareImageText(ctx,player.name,markerX+33,markerY+35,markerW-38,'800 13px "Barlow Condensed", sans-serif',"#f5faff","left");
    });
    shareImageText(ctx,n?translate("SPENT")+"  $"+spent.toLocaleString()+"     //     "+translate("REMAINING")+"  $"+team.budget.toLocaleString():translate("DEPLOYED")+"  "+snap.deployedCount+"     //     "+translate("RESERVES")+"  "+snap.reserves.length,x+25,y+(snap.reserves.length?616+snap.reserves.length*29:571),width-50,'800 15px "Barlow Condensed", sans-serif',"#8fb6d4");
    if(!snap.reserves.length)return;
    shareImageText(ctx,translate("RESERVES"),x+25,y+575,width-50,'900 21px "Barlow Condensed", sans-serif',"#e6f4ff");
    const listX=x+24,listY=y+600,rowH=29,listW=width-48;
    shareImageText(ctx,translate("PLAYER"),listX+12,listY-5,390,'800 11px "Barlow Condensed", sans-serif',"#6e9cbe");
    shareImageText(ctx,translate("POSITION"),listX+435,listY-5,85,'800 11px "Barlow Condensed", sans-serif',"#6e9cbe");
    shareImageText(ctx,translate("ROLE"),listX+540,listY-5,75,'800 11px "Barlow Condensed", sans-serif',"#6e9cbe");
    shareImageText(ctx,"OVR",listX+685,listY-5,42,'800 11px "Barlow Condensed", sans-serif',"#6e9cbe","right");
    if(n)shareImageText(ctx,translate("FEE"),listX+listW-10,listY-5,73,'800 11px "Barlow Condensed", sans-serif',"#6e9cbe","right");
    snap.reserves.forEach((player,index)=>{
        const ry=listY+index*rowH;ctx.fillStyle=index%2===0?"#0c2742":"#0a2139";ctx.fillRect(listX,ry,listW,rowH-2);
        const signing=getTeamHistory(n).find(record=>record.player?.id===player.id),fee=signing?.price??0;
        let position="—";try{position=typeof primaryPosition==="function"?primaryPosition(player):(player.position||player.positions?.[0]||"—");}catch(e){}
        if(Array.isArray(position))position=position[0]||"—";
        const starter=usedIds.has(String(player.id)),status=starter?translate("STARTER"):translate("RESERVE");
        if(portraits?.get(player.id))drawReportPortrait(ctx,portraits.get(player.id),listX+7,ry+1,23,25);
        shareImageText(ctx,player.name,listX+38,ry+19,380,'700 14px "Barlow Condensed", sans-serif',"#e3eef8");
        shareImageText(ctx,String(position),listX+435,ry+19,85,'700 13px "Barlow Condensed", sans-serif',"#9bc0dc");
        shareImageText(ctx,status,listX+540,ry+19,82,'800 12px "Barlow Condensed", sans-serif',starter?"#72c4ff":"#7e9bb6");
        shareImageText(ctx,String(playerOverall(player)),listX+685,ry+19,42,'900 14px "Barlow Condensed", sans-serif',"#f2f8ff","right");
        if(n)shareImageText(ctx,fee===0?translate("FREE"):"$"+fee.toLocaleString(),listX+listW-10,ry+19,73,'800 13px "Barlow Condensed", sans-serif',"#b3d4ec","right");
    });
}
async function createAuctionShareImageBlob(teamNumber=null,reportEntries=null,reportOverride=null){
    const numbers=teamNumber===0?[0]:[1,2];
    const entries=reportEntries||numbers.map(n=>({n,team:{...teamByNumber(n),players:[...teamByNumber(n).players]},snap:shareFormationSnapshot(n)}));
    const modeReport=reportOverride||(teamNumber===0?null:exportModeReport());
    await document.fonts?.ready;
    const text=["TEAM OVR","SQUAD OVR","CHEMISTRY","CAPTAIN","DEPLOYED","REMAINING","RESERVES","SPENT","PLAYERS","UNASSIGNED","SQUAD","SQUAD REPORT","SQUAD ROSTER","PLAYER","POSITION","ROLE","FEE","FREE","STARTER","RESERVE","FINAL RESULT"].map(value=>SiteI18n.text(value)).concat(entries.flatMap(entry=>[entry.team.name,...entry.team.players.map(player=>player.name)]),modeReport?[modeReport.title,modeReport.subtitle,...modeReport.left,...modeReport.right]:[]).join(" ");
    if(document.fonts?.load)await Promise.all([document.fonts.load('800 18px "Barlow Condensed"',text),document.fonts.load('700 14px "Rajdhani"',text)]);
    const portraits=new Map();
    await Promise.all([...new Map(entries.flatMap(entry=>entry.team.players).map(p=>[p.id,p])).values()].map(async player=>{
        const ready=await warmPlayerPortrait(player);
        if(!ready?.image||ready.state!=="ready")throw new Error("Some portraits are not ready. Try again.");
        portraits.set(player.id,ready.image);
    }));
    const reportHeight=modeReport?125+Math.max(modeReport.left.length,modeReport.right.length)*27:0;
    const maxReserves=Math.max(...entries.map(entry=>entry.snap.reserves.length),0),panelY=175,panelHeight=maxReserves?645+maxReserves*29:610;
    const canvas=document.createElement("canvas");canvas.width=entries.length===1?1100:1800;canvas.height=panelY+panelHeight+reportHeight+90;
    const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image export is unavailable.");
    const backdrop=ctx.createLinearGradient(0,0,canvas.width,canvas.height);backdrop.addColorStop(0,"#0c2b49");backdrop.addColorStop(.48,"#061426");backdrop.addColorStop(1,"#081c31");
    ctx.fillStyle=backdrop;ctx.fillRect(0,0,canvas.width,canvas.height);
    shareImageText(ctx,"BLUE LOCK DRAFT",54,75,980,'900 italic 56px "Barlow Condensed", sans-serif',"#f1f8ff");
    shareImageText(ctx,SiteI18n.text(teamNumber===0?"SQUAD REPORT":"FINAL RESULT"),58,120,canvas.width-108,'800 22px "Barlow Condensed", sans-serif',"#5abaff");
    ctx.fillStyle="#2caeff";ctx.fillRect(54,143,canvas.width-108,3);
    if(modeReport){
        const reportY=panelY+panelHeight+18;
        shareImageRoundRect(ctx,48,reportY,canvas.width-96,reportHeight-12,12,"#102b46","#2c5774");
        shareImageText(ctx,modeReport.title,72,reportY+33,canvas.width-144,'900 28px "Barlow Condensed", sans-serif',"#f4d17d");
        shareImageText(ctx,modeReport.subtitle,72,reportY+62,canvas.width-144,'800 20px "Barlow Condensed", sans-serif',"#d5eaff");
        for(const [column,lines]of [modeReport.left,modeReport.right].entries())for(const [row,line]of lines.entries())shareImageText(ctx,line,72+column*(canvas.width-144)/2,reportY+95+row*27,(canvas.width-170)/2,'700 17px "Rajdhani", sans-serif',"#bcd4e9");
    }
    const margin=48,gap=24,panelW=(canvas.width-margin*2-gap*(entries.length-1))/entries.length;
    entries.forEach((entry,i)=>drawAuctionShareImageTeam(ctx,entry.team,entry.n,entry.snap,{x:margin+i*(panelW+gap),y:panelY,width:panelW,height:panelHeight,portraits}));
    ctx.fillStyle="#2a81ba";ctx.fillRect(54,canvas.height-64,canvas.width-108,1);
    shareImageText(ctx,appRootUrl().href,canvas.width/2,canvas.height-31,canvas.width-108,'700 17px "Barlow Condensed", sans-serif',"#8eb5d4","center");
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Image export is unavailable.")),"image/png"));
}
async function saveDraftImage(teamNumber=null,preparedBlob=null){
    const button=document.getElementById("saveReportImage")||document.getElementById("saveResultsImage");if(button?.disabled)return;
    if(button){button.disabled=true;button.textContent=SiteI18n.text("PREPARING IMAGE…");}
    try{const blob=preparedBlob||await createAuctionShareImageBlob(teamNumber),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="blue-lock-draft-"+localDraftDate()+".png";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
    catch(error){showSiteError(error.message==="Some portraits are not ready. Try again."?error.message:"Image export is unavailable.","SAVE IMAGE");}
    finally{if(button?.isConnected){button.disabled=false;button.textContent=SiteI18n.text("SAVE IMAGE");}}
}
function fallbackCopyShareText(text){
    const field=document.createElement("textarea");field.value=text;field.setAttribute("readonly","");
    field.style.position="fixed";field.style.opacity="0";field.style.pointerEvents="none";document.body.appendChild(field);field.select();
    let copied=false;try{copied=document.execCommand("copy");}catch(e){}field.remove();return copied;
}

function createAuctionShareMessage(){
    const link=appRootUrl().href;
    return SiteI18n.text("I just finished my Blue Lock Draft!")+"\n"+team1.name+" vs. "+team2.name+"\n"+SiteI18n.text("View the teams and build your own:")+" "+link;
}
async function copyShareMessageText(message){
    if(navigator.clipboard?.writeText){
        try{await navigator.clipboard.writeText(message);return true;}catch(e){}
    }
    return fallbackCopyShareText(message);
}
async function shareResultsImageAndLink(previewBlob=null){
    const button=document.getElementById("shareTeamsAndLink")||document.getElementById("nativeShareResults");if(!button)return;
    const translate=value=>window.SiteI18n?.text(value)||value;
    const message=createAuctionShareMessage();
    button.disabled=true;
    try{
        if(typeof navigator.share==="function"&&typeof navigator.canShare==="function"){
            const imageBlob=previewBlob||await createAuctionShareImageBlob();
            const imageFile=new File([imageBlob],"blue-lock-draft-results-"+new Date().toISOString().slice(0,10)+".png",{type:"image/png"});
            if(navigator.canShare({files:[imageFile]})){
                await navigator.share({title:"Blue Lock Draft",text:message,files:[imageFile]});
                button.textContent="SHARED ✓";
                return;
            }
        }
        const copied=await copyShareMessageText(message);
        if(copied){
            button.textContent=translate("COPIED ✓");
            showSiteError("This browser cannot share the image and message together. The message and website link were copied; no image was downloaded.","IMAGE SHARING UNAVAILABLE");
        }else{
            showSiteError("This browser could not copy the share message. No image was downloaded.","SHARE ERROR");
        }
    }catch(error){
        if(error?.name==="AbortError")return;
        const copied=await copyShareMessageText(message);
        if(copied){
            button.textContent=translate("COPIED ✓");
            showSiteError("Image sharing was unavailable, so the message and website link were copied instead. No image was downloaded.","IMAGE SHARING UNAVAILABLE");
        }else{
            showSiteError("Your browser blocked sharing and clipboard access. No image was downloaded.","SHARE ERROR");
        }
    }finally{
        button.disabled=false;
        setTimeout(()=>{if(button.isConnected)button.textContent=translate("SHARE");},1800);
    }
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
    standaloneBuilderSyncTeam();saveStandaloneBuilderState();return openExportPreview(0);
}
