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
    const desk=document.querySelector(".home-scouting");
    if(!desk||desk.dataset.initialized)return;
    desk.dataset.initialized="true";
    document.getElementById("homePlayerSearch").addEventListener("input",renderHomepagePlayerLookup);
    renderHomepagePlayerLookup();
    initHomepageChemistryPicker("a");
    initHomepageChemistryPicker("b");
    renderHomepageChemistryCheck();
    document.getElementById("homeFormationCount").textContent=Object.keys(FORMATIONS).length;
    const markers=document.getElementById("homeTacticalMarkers");
    markers.innerHTML=FORMATIONS["4-3-3"].map((slot,index)=>`<g transform="translate(${46+slot.x*3.08} ${20+slot.y*2.35})"><circle r="${index===9?14:11}" class="${index===9?"is-striker":""}"/><text text-anchor="middle" dominant-baseline="central">${esc(slot.label)}</text></g>`).join("");
}
const homepageChemistryPlayers={a:1,b:26};
function homepagePlayerMatches(query){
    const text=query.trim().toLocaleLowerCase();
    return players.filter(player=>!text||player.name.toLocaleLowerCase().includes(text))
        .sort((a,b)=>playerOverall(b)-playerOverall(a)||a.id-b.id);
}
function renderHomepagePlayerLookup(){
    const input=document.getElementById("homePlayerSearch"),grid=document.getElementById("homePlayerResults");
    const matches=homepagePlayerMatches(input.value),shown=matches.slice(0,6);
    document.getElementById("homePlayerResultStatus").textContent=input.value.trim()
        ?`${matches.length} MATCH${matches.length===1?"":"ES"}${matches.length>6?" // SHOWING FIRST 6":""}`
        :`TOP RATED // ${shown.length} OF ${players.length} PLAYERS`;
    grid.innerHTML=shown.length?shown.map(player=>`<a class="scout-player" href="${homepageCharacterUrl(player)}">
      <img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" width="48" height="54" loading="lazy" decoding="async">
      <span><strong>${esc(player.name)}</strong><small>${esc(primaryPosition(player))} // OVR ${playerOverall(player)} <b class="evaluation-grade">${playerStatGrade(playerOverall(player))}</b></small></span><b aria-hidden="true">↗</b>
    </a>`).join(""):'<p class="scout-empty">No players match. Try another name or open the full directory.</p>';
    prioritizeVisiblePortraits(grid);
}
function renderHomepageChemistryCheck(){
    const result=document.getElementById("homeChemistryResult");
    const a=playerById(homepageChemistryPlayers.a),b=playerById(homepageChemistryPlayers.b);
    if(!a||!b){result.innerHTML='<p class="scout-empty">Choose two players to check their connection.</p>';return;}
    if(a.id===b.id){result.innerHTML='<p class="scout-empty">Choose two different players.</p>';return;}
    const relation=chemistryRelation(a,b);
    result.innerHTML=`<div class="scout-chemistry-pair"><a href="${homepageCharacterUrl(a)}">${esc(a.name)}</a><span aria-hidden="true">+</span><a href="${homepageCharacterUrl(b)}">${esc(b.name)}</a></div>
      <div class="scout-chemistry-score ${chemistryTier(relation.score)}"><strong>${relation.score}<small>/ 100</small></strong><span>${chemistryTierLabel(relation.score)}</span></div><p>${esc(relation.label)}</p>`;
}
function initHomepageChemistryPicker(key){
    const picker=document.querySelector(`[data-scout-picker="${key}"]`),input=picker.querySelector("input"),options=picker.querySelector('[role="listbox"]');
    let active=-1;
    input.value=playerById(homepageChemistryPlayers[key])?.name||"";
    function close(){options.hidden=true;input.setAttribute("aria-expanded","false");input.removeAttribute("aria-activedescendant");active=-1;}
    function show(){
        const query=input.value===playerById(homepageChemistryPlayers[key])?.name?"":input.value;
        const matches=homepagePlayerMatches(query).slice(0,6);
        options.innerHTML=matches.length?matches.map(player=>`<button id="scout-${key}-${player.id}" type="button" role="option" aria-selected="false" tabindex="-1" data-scout-player="${player.id}"><strong>${esc(player.name)}</strong><small>${esc(primaryPosition(player))} // ${playerOverall(player)}</small></button>`).join(""):'<p class="scout-empty">No matching players.</p>';
        options.hidden=false;input.setAttribute("aria-expanded","true");input.removeAttribute("aria-activedescendant");active=-1;
    }
    function choose(button){
        const player=playerById(Number(button.dataset.scoutPlayer));
        if(!player)return;
        homepageChemistryPlayers[key]=player.id;input.value=player.name;close();renderHomepageChemistryCheck();
    }
    input.addEventListener("focus",show);
    input.addEventListener("input",()=>{homepageChemistryPlayers[key]=null;show();renderHomepageChemistryCheck();});
    input.addEventListener("keydown",event=>{
        if(event.key==="Escape"){close();return;}
        if(event.key==="Tab"){close();return;}
        if(!["ArrowDown","ArrowUp","Enter"].includes(event.key))return;
        event.preventDefault();if(options.hidden)show();
        const buttons=[...options.querySelectorAll("button")];
        if(event.key==="Enter"){if(buttons[active])choose(buttons[active]);return;}
        if(!buttons.length)return;
        active=active<0?(event.key==="ArrowDown"?0:buttons.length-1):(active+(event.key==="ArrowDown"?1:-1)+buttons.length)%buttons.length;
        buttons.forEach((button,index)=>button.setAttribute("aria-selected",String(index===active)));
        input.setAttribute("aria-activedescendant",buttons[active].id);buttons[active].scrollIntoView({block:"nearest"});
    });
    options.addEventListener("pointerdown",event=>{if(event.pointerType==="mouse")event.preventDefault();});
    options.addEventListener("click",event=>{const button=event.target.closest("[data-scout-player]");if(button)choose(button);});
    document.addEventListener("click",event=>{if(!picker.contains(event.target))close();});
}
window.addEventListener("storage",event=>{
    if((event.key===SAVE_KEY||event.key===null)&&typeof refreshMainMenu==="function")refreshMainMenu();
});
document.querySelectorAll("[data-home-auction]").forEach(button=>button.addEventListener("click",()=>openSetupFromMenu()));
document.querySelectorAll("[data-home-quick]").forEach(button=>button.addEventListener("click",()=>openQuickDraft()));
