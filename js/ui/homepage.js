// Homepage discovery reads the existing database and save model; it never drafts.
function homepageResumeSummary(saved){
    if(!saved?.gameActive)return null;
    const roster=[...(saved.team1?.players||[]),...(saved.team2?.players||[])];
    const targetPending=saved.currentPlayerId!=null&&!roster.includes(saved.currentPlayerId);
    const remaining=saved.remainingPlayerIds.length+(targetPending?1:0);
    const route=auctionRouteForSavedState(saved);
    const phase=route==="auctionTeamBuilder"?"FORMATION BUILDER":route==="auctionResults"?"DRAFT COMPLETE":
        ({coin:"COIN FLIP",opening:"OPENING BID",bidding:"LIVE BIDDING",zero:"FREE SIGNING",forced:"FREE SIGNING",sold:"PLAYER SIGNED",next:"NEXT PLAYER"}[saved.uiState?.phase]||"AUCTION IN PROGRESS");
    return {remaining,phase,route,filled:roster.length,capacity:saved.maxPlayers*2};
}
function refreshHomepageSession(saved){
    const panel=document.getElementById("menuResumePanel");
    if(!panel)return;
    const summary=homepageResumeSummary(saved);
    panel.classList.toggle("hidden",!summary);
    if(!summary)return;
    document.getElementById("menuResumeMeta").textContent=summary.phase;
    for(const number of [1,2]){
        document.getElementById(`homeResumeTeam${number}`).textContent=saved[`team${number}`].name;
        document.getElementById(`homeResumeRoster${number}`).textContent=`${saved[`team${number}`].players.length} / ${saved.maxPlayers} PLAYERS`;
    }
    document.getElementById("homeResumeAuction").textContent=String(saved.auctionNumber).padStart(2,"0");
    document.getElementById("homeResumeRemaining").textContent=summary.remaining;
    document.getElementById("homeResumeProgress").value=Math.min(summary.filled,summary.capacity);
    document.getElementById("homeResumeProgress").max=summary.capacity;
    document.getElementById("homeResumeProgressLabel").textContent=`${summary.filled} OF ${summary.capacity} SQUAD PLACES FILLED`;
    document.getElementById("homeResumeAction").textContent=summary.route==="auctionResults"?"VIEW RESULTS":summary.route==="auctionTeamBuilder"?"CONTINUE BUILDING":"RESUME SESSION";
}
function homepageCharacterUrl(player){
    const url=canonicalRouteUrl("lore",{databaseView:"characters"});
    url.searchParams.set("character",player.id);
    return url.href;
}
function renderHomepageDiscovery(){
    const grid=document.getElementById("homeFeaturedPlayers");
    if(!grid||grid.dataset.initialized)return;
    grid.dataset.initialized="true";
    // Stable featured identities; every displayed field comes from the live records.
    const featured=[1,4,23,49].map(playerById).filter(Boolean);
    grid.innerHTML=featured.map(player=>`<a class="home-player" href="${homepageCharacterUrl(player)}" aria-label="View ${esc(player.name)} dossier">
      <div class="home-player-image"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" width="180" height="180" loading="lazy" decoding="async"><span>${esc(primaryPosition(player))}</span></div>
      <div class="home-player-copy"><h3>${esc(player.name)}</h3><div><span>OVR <strong>${playerOverall(player)}</strong> <b class="evaluation-grade">${playerStatGrade(playerOverall(player))}</b></span><span aria-hidden="true">↗</span></div></div>
    </a>`).join("");
    const leads=[playerById(1),playerById(26)].filter(Boolean);
    const pair=CHEMISTRY_SPECIAL_PAIRS.find(entry=>leads.length===2&&leads.every(player=>entry.slice(0,2).includes(player.name)))||
        CHEMISTRY_SPECIAL_PAIRS.find(([a,b])=>players.some(player=>player.name===a)&&players.some(player=>player.name===b));
    const chemistry=document.getElementById("homeChemistryFeature");
    if(pair){
        const a=players.find(player=>player.name===pair[0]),b=players.find(player=>player.name===pair[1]);
        const relation=chemistryRelation(a,b);
        chemistry.innerHTML=`<div class="home-reaction-pair"><a href="${homepageCharacterUrl(a)}">${esc(a.name)}</a><span aria-hidden="true">+</span><a href="${homepageCharacterUrl(b)}">${esc(b.name)}</a></div>
          <div class="home-reaction-score ${chemistryTier(relation.score)}"><strong>${relation.score}<small>/ 100</small></strong><span>${chemistryTierLabel(relation.score)}</span></div>
          <p>${esc(relation.label)}</p>`;
    }else chemistry.innerHTML='<p>Explore the registered player relationships.</p>';
    document.getElementById("homePlayerCount").textContent=players.length;
    document.getElementById("homeFormationCount").textContent=Object.keys(FORMATIONS).length;
    const markers=document.getElementById("homeTacticalMarkers");
    markers.innerHTML=FORMATIONS["4-3-3"].map((slot,index)=>`<g transform="translate(${46+slot.x*3.08} ${20+slot.y*2.35})"><circle r="${index===9?14:11}" class="${index===9?"is-striker":""}"/><text text-anchor="middle" dominant-baseline="central">${esc(slot.label)}</text></g>`).join("");
    refreshHomepageTheme();
    observePlayerPortraits(grid);
}
function refreshHomepageTheme(){
    const label=document.getElementById("homeThemeStatus");
    if(!label)return;
    const preferences=SitePreferences.get();
    label.textContent=preferences.theme==="system"?`SYSTEM / ${SitePreferences.resolvedTheme().toUpperCase()}`:preferences.theme.toUpperCase();
}
window.addEventListener("bld:preferences",refreshHomepageTheme);
window.addEventListener("storage",event=>{
    if((event.key===SAVE_KEY||event.key===null)&&typeof refreshMainMenu==="function")refreshMainMenu();
});
document.querySelectorAll("[data-home-auction]").forEach(button=>button.addEventListener("click",()=>openSetupFromMenu()));
document.querySelectorAll("[data-home-quick]").forEach(button=>button.addEventListener("click",()=>openQuickDraft()));
