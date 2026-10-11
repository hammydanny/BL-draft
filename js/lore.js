// BLUE LOCK DRAFT // PLAYER INTELLIGENCE
// Display-only views: gameplay records, chemistry and saves remain untouched.
let loreDatabaseCache=null;
const characterCompareIds=new Set();
let characterDirectoryReturn=null,loreControlsInitialized=false;
const dossierNavigation={observer:null,frame:0,cancelScroll:null};
function stopDossierNavigation(){
    dossierNavigation.observer?.disconnect();dossierNavigation.observer=null;
    dossierNavigation.cancelScroll?.();
}
function setDossierSectionActive(id){
    document.querySelectorAll(".character-profile-jump a").forEach(link=>{
        if(link.hash==="#"+id)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");
    });
}
function trackDossierSections(grid){
    if(typeof IntersectionObserver!=="function")return;
    const sections=[...grid.querySelectorAll(".character-profile-page>[id]")];if(!sections.length)return;
    const visible=new Map(),offset=parseFloat(getComputedStyle(sections[0]).scrollMarginTop)||72;
    dossierNavigation.observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>visible.set(entry.target,entry.isIntersecting));
        const section=[...visible].filter(([,shown])=>shown).map(([node])=>node).sort((a,b)=>Math.abs(a.getBoundingClientRect().top-offset)-Math.abs(b.getBoundingClientRect().top-offset))[0];
        if(section)setDossierSectionActive(section.id);
    },{rootMargin:`-${offset}px 0px 0px 0px`,threshold:[0,1]});
    sections.forEach(section=>dossierNavigation.observer.observe(section));
}
function scrollDossierSection(link){
    const section=document.getElementById(link.hash.slice(1));if(!section)return;
    dossierNavigation.cancelScroll?.();setDossierSectionActive(section.id);
    const heading=section.querySelector("h3");heading?.setAttribute("tabindex","-1");heading?.focus({preventScroll:true});
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){section.scrollIntoView({behavior:"instant",block:"start"});return;}
    const start=window.scrollY,margin=parseFloat(getComputedStyle(section).scrollMarginTop)||0;
    const end=Math.max(0,Math.min(section.getBoundingClientRect().top+start-margin,document.documentElement.scrollHeight-window.innerHeight));
    const began=performance.now();
    const cancel=()=>{cancelAnimationFrame(dossierNavigation.frame);dossierNavigation.frame=0;for(const type of ["wheel","touchstart","keydown"])window.removeEventListener(type,cancel);dossierNavigation.cancelScroll=null;};
    dossierNavigation.cancelScroll=cancel;
    for(const type of ["wheel","touchstart","keydown"])window.addEventListener(type,cancel,{passive:true});
    const step=now=>{const progress=Math.min(1,(now-began)/300),eased=1-Math.pow(1-progress,3);window.scrollTo({top:start+(end-start)*eased,behavior:"instant"});if(progress<1)dossierNavigation.frame=requestAnimationFrame(step);else cancel();};
    dossierNavigation.frame=requestAnimationFrame(step);
}
function normalizeLoreSearch(value){return String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function matchesLoreSearch(text,query){return query.split(/\s+/).filter(Boolean).every(word=>text.includes(word));}
function characterLoreDescription(player){return playerRecord(player.id)?.profile?.overview||`${player.name} is listed in the project as a ${primaryPosition(player)}. No additional profile is recorded.`;}
function loreDatabase(){
    if(loreDatabaseCache)return loreDatabaseCache;
    const chemistry=[...CHEMISTRY_REFERENCE_PAIRS,...CHEMISTRY_REFERENCE_CONTEXTS].map(reference=>{
        const entry={...reference,characters:reference.playerIds.map(id=>playerById(id).name)};
        entry.title=entry.type==="pair"?entry.characters.join(" × "):entry.name;
        entry.contextIds=entry.type==="pair"?CHEMISTRY_REFERENCE_CONTEXTS.filter(context=>entry.playerIds.every(id=>context.playerIds.includes(id))).map(context=>context.id):[entry.id];
        entry.search=normalizeLoreSearch([entry.title,entry.label,entry.description,...entry.characters].join(" "));return entry;
    });
    const byId=new Map(players.map(player=>[player.id,{pairLinks:[],teamLinks:[]}]));
    for(const entry of chemistry)for(const id of entry.playerIds)byId.get(id)[entry.type==="pair"?"pairLinks":"teamLinks"].push(entry);
    const characters=[...PLAYER_RECORDS.values()].map(record=>({...record,chemistry:byId.get(record.player.id),search:normalizeLoreSearch([record.player.name,...playerPositions(record.player),characterLoreDescription(record.player),...record.categories.map(category=>category.label),...record.affiliations.map(context=>context.name)].join(" "))}));
    loreDatabaseCache={characters,chemistry,byId,characterSorts:new Map(),chemistrySorts:new Map()};return loreDatabaseCache;
}
function getCharacterChemistry(player){return loreDatabase().byId.get(player.id)||{pairLinks:[],teamLinks:[]};}
function loreControlValue(id,fallback=""){return document.getElementById(id)?.value||fallback;}
function initializeLoreControls(){
    if(loreControlsInitialized)return;loreControlsInitialized=true;
    const fill=(id,records,label)=>{const control=document.getElementById(id);if(control)control.innerHTML=`<option value="ALL">${label}</option>`+records.map(([value,text])=>`<option value="${esc(value)}">${esc(text)}</option>`).join("");};
    const contexts=CHEMISTRY_REFERENCE_CONTEXTS.map(context=>[context.id,context.name]).sort((a,b)=>a[1].localeCompare(b[1]));
    fill("characterLoreAffiliation",contexts,"All Affiliations / History");
    fill("characterLoreCategory",Object.entries(PLAYER_POOL_CATEGORIES).map(([key,category])=>[key,category.label]),"All Player Categories");
    const names=players.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(player=>[String(player.id),player.name]);
    fill("chemistryLorePlayerA",names,"Any Player A");fill("chemistryLorePlayerB",names,"Any Player B");fill("chemistryLoreContext",contexts,"All Team Contexts");
}
function sortedCharacterRecords(sort){
    const database=loreDatabase();if(database.characterSorts.has(sort))return database.characterSorts.get(sort);
    const names=(a,b)=>a.player.name.localeCompare(b.player.name);
    const records=database.characters.slice().sort((a,b)=>{
        if(sort==="chronological")return comparePlayerAppearance(a.player,b.player);
        if(sort==="name-asc")return names(a,b);if(sort==="name-desc")return names(b,a);
        if(sort==="position")return primaryPosition(a.player).localeCompare(primaryPosition(b.player))||names(a,b);
        if(["sho","spd","dri","pas","def","off"].includes(sort))return playerStats(b.player)[sort]-playerStats(a.player)[sort]||names(a,b);
        return (sort==="ovr-asc"?1:-1)*(playerOverall(a.player)-playerOverall(b.player))||names(a,b);
    });database.characterSorts.set(sort,records);return records;
}
function filteredCharacterLore(){
    const query=normalizeLoreSearch(loreControlValue("characterLoreSearch").trim()),position=loreControlValue("characterLorePosition","ALL"),grade=loreControlValue("characterLoreGrade","ALL"),category=loreControlValue("characterLoreCategory","ALL"),affiliation=loreControlValue("characterLoreAffiliation","ALL");
    return sortedCharacterRecords(loreControlValue("characterLoreSort","chronological")).filter(record=>matchesLoreSearch(record.search,query)&&(position==="ALL"||playerPositions(record.player).some(role=>role===position||positionGroup(role)===position))&&(grade==="ALL"||playerStatGrade(playerOverall(record.player))===grade)&&(category==="ALL"||record.categories.some(item=>item.key===category))&&(affiliation==="ALL"||record.affiliations.some(context=>context.id===affiliation)));
}
function characterDossierHref(id){const url=canonicalRouteUrl("lore",{databaseView:"characters"});url.searchParams.set("character",String(id));return url.href;}
function characterLoreCard(record){
    if(record.html)return record.html;const player=record.player,overall=playerOverall(player);
    record.html=`<article class="character-lore-card"><a class="character-lore-card-link" data-character-id="${player.id}" href="${characterDossierHref(player.id)}" aria-label="Open ${esc(player.name)} dossier, ${primaryPosition(player)}, overall ${overall}, grade ${playerStatGrade(overall)}"><span class="character-lore-image-wrap"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" class="character-lore-image" loading="lazy" decoding="async" width="180" height="225"><span class="character-card-rating"><strong>${overall}</strong><b>${playerStatGrade(overall)}</b><small>OVR</small></span></span><span class="character-lore-card-name">${esc(player.name)}</span>${positionBadges(player,true)}</a><button class="character-compare-toggle" type="button" data-compare-player="${player.id}" aria-pressed="false" aria-label="Compare ${esc(player.name)}">+ COMPARE</button></article>`;return record.html;
}
function characterPersonLink(id){const player=playerById(id);return `<a class="character-profile-person-link" data-character-id="${id}" href="${characterDossierHref(id)}">${esc(player.name)}</a>`;}
function dossierSection(code,title,content){return `<section class="character-profile-section"><div class="character-profile-section-heading"><span>${code}</span><h3>${title}</h3></div>${content}</section>`;}
function characterLoreProfileMarkup(player){
    const record=playerRecord(player.id),weapons=player.weapons||[],history=record.affiliations,quotes=verifiedPlayerQuotes(player.id),canon=record.profile?.canonPositions||[];
    const links=getCharacterChemistry(player).pairLinks.slice().sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
    const rows=PLAYER_RADAR_AXES.map(axis=>`<div class="character-profile-stat"><span>${axis.label}</span><small>${axis.name.toUpperCase()}</small><strong>${playerStats(player)[axis.key]}</strong><b class="evaluation-grade">${playerStatGrade(playerStats(player)[axis.key])}</b></div>`).join("");
    const positions=`<div class="character-position-analysis"><div><span class="reference-classification">GAMEPLAY INTERPRETATION</span><h4>PROJECT POSITIONS</h4><dl><dt>Primary</dt><dd>${primaryPosition(player)}</dd><dt>Secondary</dt><dd>${playerPositions(player).filter(position=>position!==primaryPosition(player)).join(" / ")||"None listed"}</dd></dl><p>These roles determine compatibility in Blue Lock Draft. They are separate from demonstrated story positions.</p></div><div><span class="reference-classification">CANON ROLE REFERENCE</span><h4>DEMONSTRATED POSITIONS</h4>${canon.length?`<ul>${canon.map(role=>`<li><b>${role.position}</b> ${esc(role.context)}</li>`).join("")}</ul><p>Based on the existing character profile. This is a partial role record, not a complete career list.</p>`:`<p>No specific demonstrated position is recorded in this dossier yet. Gameplay badges are not used as canon evidence.</p>`}</div></div>`;
    const weaponCards=weapons.length?`<div class="character-profile-weapons-grid">${weapons.map(weapon=>`<article class="character-profile-weapon-card"><div class="character-profile-weapon-heading"><h4>${esc(weapon.name)}</h4><span class="character-profile-weapon-kind">PLAYSTYLE</span></div><p class="character-profile-weapon-description">${esc(weapon.description)}</p></article>`).join("")}</div>`:`<p class="character-profile-weapons-empty">No registered football weapons.</p>`;
    const pairCards=links.map(link=>`<article class="character-profile-chemistry-card ${chemistryTier(link.score)}"><div class="character-profile-chemistry-top"><div class="character-profile-chemistry-names">${link.playerIds.filter(id=>id!==player.id).map(characterPersonLink).join(" × ")}</div><div class="character-profile-score ${chemistryTier(link.score)}"><small>${chemistryTierLabel(link.score)}</small><strong>${link.score}</strong><span>/ 100</span></div></div><span class="character-profile-chemistry-label">${esc(link.label)}</span><p>${esc(link.description)}</p></article>`).join("");
    const teamCards=history.map(context=>`<article class="character-profile-team-card"><div class="character-profile-chemistry-top"><h4>${esc(context.name)}</h4><div class="character-profile-score ${chemistryTier(context.score)}"><small>CONTEXT</small><strong>${context.score}</strong><span>${chemistryTierLabel(context.score)}</span></div></div><p>${esc(context.description)}</p><div class="character-profile-context-members">${context.playerIds.map(characterPersonLink).join("")}</div></article>`).join("");
    return `<div class="character-profile-page"><div class="character-profile-back-row"><button type="button" class="character-profile-back" data-character-back>← ALL CHARACTERS</button><span>PLAYER // DOSSIER ${String(player.id).padStart(2,"0")}</span></div>
      <section class="character-profile-hero" aria-label="Player identity"><div class="character-profile-portrait"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" loading="eager" decoding="async" width="280" height="350"></div><div class="character-profile-overview"><span class="character-profile-kicker">FIELD INTELLIGENCE // MANGA APPEARANCE CH. ${player.debutChapter}</span><h2>${esc(player.name)}</h2>${playerNationalityMarkup(player)}<div class="character-profile-positions">${positionBadges(player)}</div><div class="character-profile-ovr"><span>OVERALL RATING</span><strong>${playerOverall(player)}</strong><b class="evaluation-grade">${playerStatGrade(playerOverall(player))}</b></div><p class="character-profile-rating-note">PROJECT RATING // FAN-MADE GAMEPLAY VALUES</p><div class="character-profile-description"><h3>PLAYER PROFILE</h3><p>${esc(characterLoreDescription(player))}</p></div><div class="character-profile-categories">${record.categories.map(category=>`<span>${esc(category.label)}</span>`).join("")}</div></div></section>
      <nav class="character-profile-jump" aria-label="Dossier sections"><a href="#dossier-attributes" aria-current="location">ATTRIBUTES</a><a href="#dossier-positions">POSITIONS</a><a href="#dossier-weapons">PLAYSTYLE</a><a href="#dossier-chemistry">CHEMISTRY</a><a href="#dossier-history">HISTORY</a>${quotes.length?'<a href="#dossier-quote">EGO STATEMENT</a>':""}</nav>
      <div id="dossier-attributes">${dossierSection("01 // PROJECT RATINGS","CORE ATTRIBUTES",`<div class="character-attribute-layout">${playerStatsRadar(player,"lore")}<div class="character-profile-stat-grid">${rows}<p class="character-attribute-note">S 90–100 · A 80–89 · B 70–79 · C 60–69 · D 50–59 · E 40–49 · F 30–39 · G 0–29. GK remains a separate specialist metric.</p></div></div>`)}</div>
      <div id="dossier-positions">${dossierSection("02 // POSITIONAL ANALYSIS","ROLES &amp; EVIDENCE",positions)}</div>
      <div id="dossier-weapons">${dossierSection("03 // WEAPON / PLAYSTYLE","FOOTBALL WEAPONS",weaponCards)}</div>
      <div id="dossier-chemistry">${dossierSection("04 // CHEMICAL REACTIONS","PAIR CHEMISTRY",`<p class="character-section-note">${links.length} registered relationships, from strongest links to rivalry and weak links. Scores use the project's existing chemistry model.</p><div class="character-profile-chemistry-grid">${pairCards||'<p class="lore-empty">No special pair relationship is registered. Shared-history or unproven links still apply in the game.</p>'}</div>`)}</div>
      <div id="dossier-history">${dossierSection("05 // CAREER / AFFILIATION","TEAM HISTORY",`<p class="character-section-note">Recorded team memberships and shared match groups; inclusion does not mean a current club affiliation.</p><div class="character-profile-team-grid">${teamCards||'<p class="lore-empty">No team history is recorded for this player yet.</p>'}</div>`)}</div>
      ${quotes.length?`<div id="dossier-quote">${dossierSection("06 // VERIFIED DIALOGUE","EGO STATEMENT",quotes.map(quote=>`<figure class="character-quote"><blockquote>${esc(quote.text)}</blockquote><figcaption>— ${esc(player.name)} <span>${quote.sourceType==="manga"?`MANGA // CH. ${quote.chapter}`:`ANIME // EP. ${quote.episode}`}</span></figcaption></figure>`).join(""))}</div>`:""}</div>`;
}
function renderLoreCards(grid,records,cardMarkup,emptyMessage){
    if(!records.length){grid.innerHTML=`<p class="lore-empty">${emptyMessage}</p>`;return;}
    const nodes=records.map(record=>{if(!record.node){const template=document.createElement("template");template.innerHTML=cardMarkup(record);record.node=template.content.firstElementChild;}return record.node;});
    if(grid.children.length!==nodes.length||nodes.some((node,index)=>grid.children[index]!==node))grid.replaceChildren(...nodes);
}
function syncCharacterCompareButtons(){document.querySelectorAll(".character-compare-toggle").forEach(button=>{const selected=characterCompareIds.has(Number(button.dataset.comparePlayer));button.setAttribute("aria-pressed",String(selected));button.textContent=selected?"✓ COMPARING":"+ COMPARE";});}
function renderCharacterComparison(){
    const panel=document.getElementById("characterLoreComparison");if(!panel)return;panel.hidden=!characterCompareIds.size;
    const view=document.getElementById("characterLoreCompareView");if(view){view.disabled=!characterCompareIds.size;view.textContent=`VIEW COMPARISON · ${characterCompareIds.size}/3`;}
    panel.innerHTML=characterCompareIds.size?`<div class="character-comparison-heading"><div><span class="lore-kicker">SIDE BY SIDE // PROJECT RATINGS</span><h2 id="characterCompareTitle">COMPARE PLAYERS <small>${characterCompareIds.size} / 3</small></h2></div><button type="button" data-compare-clear>CLEAR COMPARISON</button></div><div class="character-comparison-grid">${[...characterCompareIds].map(playerById).map(player=>`<article><div class="character-comparison-identity"><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" width="48" height="60" decoding="async"><div><h3>${characterPersonLink(player.id)}</h3><span>${playerPositions(player).join(" / ")}</span></div><button type="button" data-compare-player="${player.id}" aria-label="Remove ${esc(player.name)} from comparison">×</button></div>${playerStatsRadar(player,"lore",{overall:playerOverall(player)})}</article>`).join("")}</div>`:"";
    prioritizeVisiblePortraits(panel);syncCharacterCompareButtons();
}
function toggleCharacterComparison(id){
    id=Number(id);if(!playerById(id))return;const status=document.getElementById("characterLoreCompareStatus");
    if(characterCompareIds.has(id))characterCompareIds.delete(id);else if(characterCompareIds.size<3)characterCompareIds.add(id);else{if(status)status.textContent="Compare up to three players. Remove one to add another.";return;}
    renderCharacterComparison();if(status)status.textContent=`${characterCompareIds.size} players selected for comparison.`;
}
function renderCharacterLore(){
    stopDossierNavigation();
    initializeLoreControls();const grid=document.getElementById("characterLoreGrid");if(!grid)return;grid.classList.remove("character-lore-profile-grid");
    const screen=document.getElementById("character-lore-screen");screen?.classList.remove("character-lore-detail-view");
    const title=screen?.querySelector(".page-context h1");if(title)title.textContent="CHARACTERS";
    const code=screen?.querySelector(".page-context-code");if(code)code.textContent="BL // PLAYER INTELLIGENCE";
    const status=screen?.querySelector(".page-context-status");if(status)status.textContent="SCOUT // COMPARE // OPEN A DOSSIER";
    const filtered=filteredCharacterLore();renderLoreCards(grid,filtered,characterLoreCard,"NO CHARACTERS MATCH YOUR FILTERS. TRY RESET FILTERS.");prioritizeVisiblePortraits(grid);syncCharacterCompareButtons();
    const count=document.getElementById("characterLoreCount");if(count)count.textContent=`${filtered.length} / ${players.length} PLAYERS`;
}
function renderCharacterProfile(player){stopDossierNavigation();const grid=document.getElementById("characterLoreGrid");if(!grid)return;grid.classList.add("character-lore-profile-grid");grid.innerHTML=characterLoreProfileMarkup(player);prioritizeVisiblePortraits(grid);trackDossierSections(grid);}
function syncDatabaseMetadata(title,description){
    document.title=`${title} — Blue Lock Draft`;
    for(const selector of ['meta[name="description"]','meta[property="og:description"]'])document.querySelector(selector)?.setAttribute("content",description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content",document.title);
    let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.appendChild(canonical);}
    const id=new URL(window.location.href).searchParams.get("character");canonical.href=id&&playerById(Number(id))?characterDossierHref(id):canonicalRouteUrl("lore",{databaseView:databaseViewFromLocation()}).href;
    document.querySelector('meta[property="og:url"]')?.setAttribute("content",canonical.href);
}
function openCharacterProfileById(value,options={}){
    const player=playerById(Number(value));if(!player)return;
    if(!document.getElementById("character-lore-screen")?.classList.contains("character-lore-detail-view"))characterDirectoryReturn={top:window.scrollY,id:player.id};
    if(!options.skipHistory){const url=characterDossierHref(player.id);if(window.location.href!==url){if(options.replace)history.replaceState({blDraftRoute:"lore"},"",url);else history.pushState({blDraftRoute:"lore"},"",url);}}
    const screen=document.getElementById("character-lore-screen");screen?.classList.add("character-lore-detail-view");
    const title=screen?.querySelector(".page-context h1");if(title)title.textContent=player.name;
    const code=screen?.querySelector(".page-context-code");if(code)code.textContent="BL // CHARACTER DOSSIER";
    const status=screen?.querySelector(".page-context-status");if(status)status.textContent="IDENTITY // ATTRIBUTES // ROLES // RELATIONSHIPS";
    setVisibleScreen(screen,{...options,skipHistory:true});renderCharacterProfile(player);syncDatabaseMetadata(`${player.name} / Player Dossier`,`${player.name}: profile, project OVR and attributes, positions, weapons and recorded chemistry in Blue Lock Draft.`);
    if(!options.skipHistory){title?.setAttribute("tabindex","-1");title?.focus({preventScroll:true});}
}
function restoreCharacterDirectory(){if(!characterDirectoryReturn)return;const previous=characterDirectoryReturn;characterDirectoryReturn=null;requestAnimationFrame(()=>{window.scrollTo({top:previous.top,behavior:"instant"});document.querySelector(`#characterLoreGrid [data-character-id="${previous.id}"]`)?.focus({preventScroll:true});});}
function returnToCharacterDirectory(){updateRoute("lore",{databaseView:"characters"});restoreCharacterDirectory();}
function filteredChemistryLore(){
    const query=normalizeLoreSearch(loreControlValue("chemistryLoreSearch").trim()),type=loreControlValue("chemistryLoreType","ALL"),tier=loreControlValue("chemistryLoreTier","ALL"),a=loreControlValue("chemistryLorePlayerA","ALL"),b=loreControlValue("chemistryLorePlayerB","ALL"),context=loreControlValue("chemistryLoreContext","ALL"),sort=loreControlValue("chemistryLoreSort","score-desc"),database=loreDatabase();
    if(!database.chemistrySorts.has(sort))database.chemistrySorts.set(sort,database.chemistry.slice().sort((x,y)=>{if(sort==="name-asc")return x.title.localeCompare(y.title);if(sort==="name-desc")return y.title.localeCompare(x.title);return (sort==="score-asc"?1:-1)*(x.score-y.score)||x.title.localeCompare(y.title);}));
    return database.chemistrySorts.get(sort).filter(entry=>matchesLoreSearch(entry.search,query)&&(type==="ALL"||entry.type===type)&&(tier==="ALL"||chemistryTier(entry.score)===tier)&&(a==="ALL"||entry.playerIds.includes(Number(a)))&&(b==="ALL"||entry.playerIds.includes(Number(b)))&&(context==="ALL"||entry.contextIds.includes(context)));
}
function chemistryLoreCard(entry){
    if(entry.html)return entry.html;const pair=entry.type==="pair",tier=chemistryTier(entry.score);
    entry.html=`<article class="chemistry-lore-card ${tier}"><div class="chemistry-lore-heading"><div><span class="lore-kicker">${pair?"PLAYER RELATIONSHIP":"AFFILIATION / TEAM CONTEXT"}</span><h2>${esc(entry.title)}</h2><span class="chemistry-lore-label">${esc(pair?entry.label:"SHARED TEAM HISTORY")}</span></div><div class="chemistry-lore-score ${tier}"><span>${chemistryTierLabel(entry.score)}</span><strong>${entry.score}</strong><small>/ 100</small></div></div><p class="chemistry-lore-description">${esc(entry.description)}</p><div class="chemistry-lore-characters">${entry.playerIds.map(characterPersonLink).join("")}</div></article>`;return entry.html;
}
function renderChemistryPairEvaluation(){
    const panel=document.getElementById("chemistryLorePairEvaluation");if(!panel)return;
    const a=playerById(Number(loreControlValue("chemistryLorePlayerA"))),b=playerById(Number(loreControlValue("chemistryLorePlayerB")));panel.hidden=!a||!b;
    if(!a||!b){panel.innerHTML="";return;}if(a.id===b.id){panel.innerHTML='<p class="lore-empty">Choose two different players to evaluate a relationship.</p>';return;}
    const relation=chemistryRelation(a,b);panel.innerHTML=`<div class="chemistry-pair-evaluation ${chemistryTier(relation.score)}"><div><span class="lore-kicker">EXACT PAIR // EXISTING GAME MODEL</span><h2>${characterPersonLink(a.id)} × ${characterPersonLink(b.id)}</h2><span class="chemistry-lore-label">${esc(relation.label)}</span><p>${esc(relation.reason)}</p></div><div class="chemistry-lore-score ${chemistryTier(relation.score)}"><span>${chemistryTierLabel(relation.score)}</span><strong>${relation.score}</strong><small>/ 100</small></div></div>`;
}
function renderChemistryLore(){initializeLoreControls();const grid=document.getElementById("chemistryLoreGrid");if(!grid)return;renderChemistryPairEvaluation();const entries=filteredChemistryLore();renderLoreCards(grid,entries,chemistryLoreCard,"NO REGISTERED ENTRIES MATCH YOUR FILTERS. EXACT PAIR EVALUATION STILL USES THE GAME MODEL.");const count=document.getElementById("chemistryLoreCount");if(count)count.textContent=`${entries.length} / ${loreDatabase().chemistry.length} REGISTERED ENTRIES`;}
function resetLoreFilters(kind){const defaults=kind==="character"?{Search:"",Position:"ALL",Grade:"ALL",Affiliation:"ALL",Category:"ALL",Sort:"chronological"}:{Search:"",PlayerA:"ALL",PlayerB:"ALL",Context:"ALL",Type:"ALL",Tier:"ALL",Sort:"score-desc"};for(const [control,value] of Object.entries(defaults)){const input=document.getElementById(kind+"Lore"+control);if(input)input.value=value;}if(kind==="character")renderCharacterLore();else renderChemistryLore();}
function openLoreMenu(options={}){stopDossierNavigation();setVisibleScreen(document.getElementById("lore-menu-screen"),options);const counts=document.getElementById("databaseHubCounts");if(counts)counts.innerHTML=`<span>${players.length} PLAYER DOSSIERS</span><span>${CHEMISTRY_REFERENCE_PAIRS.length} PAIR RELATIONSHIPS</span><span>${CHEMISTRY_REFERENCE_CONTEXTS.length} TEAM CONTEXTS</span>`;syncDatabaseMetadata("Database / Player Intelligence","Explore character dossiers, compare project ratings, and inspect recorded chemistry and team history.");}
function openCharacterLore(options={}){const id=new URL(window.location.href).searchParams.get("character");if(id&&playerById(Number(id))){openCharacterProfileById(id,{...options,skipHistory:true});return;}if(id){updateRoute("lore",{databaseView:"characters",replace:true});return;}setVisibleScreen(document.getElementById("character-lore-screen"),options);renderCharacterLore();restoreCharacterDirectory();syncDatabaseMetadata("Character Database","Search, filter and compare Blue Lock players. Browse fan-made OVR, S–G grades, positions and detailed dossiers.");}
function openChemistryLore(options={}){stopDossierNavigation();setVisibleScreen(document.getElementById("chemistry-lore-screen"),options);renderChemistryLore();syncDatabaseMetadata("Chemistry Database","Explore player chemistry, relationship tiers and team histories. Check any two players using the existing game model.");}
function bindLoreUI(){
    const navigate=event=>{const person=event.target.closest("[data-character-id]");if(!person||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();openCharacterProfileById(person.dataset.characterId);};
    document.getElementById("character-lore-screen")?.addEventListener("click",event=>{
        if(event.target.closest("[data-character-back]")){event.preventDefault();returnToCharacterDirectory();return;}
        const compare=event.target.closest("[data-compare-player]");if(compare){const withinPanel=!!compare.closest(".character-comparison");toggleCharacterComparison(compare.dataset.comparePlayer);if(withinPanel){const next=document.querySelector(".character-comparison [data-compare-clear]")||document.getElementById("characterLoreSearch");next?.focus({preventScroll:true});}return;}
        if(event.target.closest("[data-compare-clear]")){characterCompareIds.clear();renderCharacterComparison();const status=document.getElementById("characterLoreCompareStatus");if(status)status.textContent="Comparison cleared.";document.getElementById("characterLoreSearch")?.focus();return;}
        const jump=event.target.closest('.character-profile-jump a');if(jump){event.preventDefault();scrollDossierSection(jump);return;}navigate(event);
    });
    document.getElementById("chemistry-lore-screen")?.addEventListener("click",navigate);
    document.getElementById("characterLoreCompareView")?.addEventListener("click",()=>{const panel=document.getElementById("characterLoreComparison");panel?.scrollIntoView({behavior:"instant",block:"start"});const title=document.getElementById("characterCompareTitle");title?.setAttribute("tabindex","-1");title?.focus({preventScroll:true});});
    document.getElementById("menuLore")?.addEventListener("click",openLoreMenu);document.getElementById("loreCharacters")?.addEventListener("click",openCharacterLore);document.getElementById("loreChemistry")?.addEventListener("click",openChemistryLore);
    for(const [kind,render] of [["character",renderCharacterLore],["chemistry",renderChemistryLore]]){
        let pending;document.getElementById(kind+"LoreSearch")?.addEventListener("input",()=>{clearTimeout(pending);pending=setTimeout(render,120);});
        for(const control of kind==="character"?["Position","Grade","Affiliation","Category","Sort"]:["PlayerA","PlayerB","Context","Type","Tier","Sort"])document.getElementById(kind+"Lore"+control)?.addEventListener("change",()=>{clearTimeout(pending);render();});
        document.getElementById(kind+"LoreReset")?.addEventListener("click",()=>{clearTimeout(pending);resetLoreFilters(kind);});
    }
}
bindLoreUI();
