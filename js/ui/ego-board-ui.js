// v0.7.3 play views: Ego Board, Draft Challenges browser and Ego Record share one screen
// on the home document (`./?play=<view>`), like the existing `./?solo=run` screen.
const PLAY_VIEW_NAMES=Object.freeze(["board","challenges","duel","lab","record"]);
let playViewLanguage=SiteI18n.language,challengeFilter={category:"ALL",open:false};
function playViewScreen(){let screen=document.getElementById("playViewScreen");if(!screen){screen=document.createElement("section");screen.id="playViewScreen";screen.className="play-view-screen hidden";screen.setAttribute("aria-live","off");document.getElementById("siteMain").appendChild(screen);}return screen;}
function playViewVisible(){const screen=document.getElementById("playViewScreen");return !!screen&&!screen.classList.contains("hidden");}
function playViewRenderer(name){return ({board:renderEgoBoard,challenges:renderChallengeBrowser,record:renderEgoRecord,duel:typeof renderDuelView==="function"?renderDuelView:null,lab:typeof renderLabView==="function"?renderLabView:null})[name]||null;}
function openPlayView(name,{replace=false}={}){
    if(!PLAY_VIEW_NAMES.includes(name))return;closeReplayDialog();
    const url=new URL("./",appRootUrl());url.searchParams.set("play",name);
    if(appRelativePath()!==""){window.location.assign(url.href);return;}
    history[replace?"replaceState":"pushState"]({blDraftRoute:"menu"},"",url.href);renderPlayView(name);window.scrollTo({top:0,behavior:"instant"});
}
function renderPlayView(name){
    const render=playViewRenderer(name);if(!render)return;
    const screen=playViewScreen();setVisibleScreen(screen,{skipHistory:true});screen.dataset.view=name;
    render(screen);document.title="Blue Lock Draft — "+replayText(playViewTitle(name));
    updateSiteDirectory(screen);SiteI18n.apply(screen);prioritizeVisiblePortraits(screen);playSfx?.("nav");
}
function playViewTitle(name){return ({board:"EGO BOARD",challenges:"DRAFT CHALLENGES",duel:"DRAFT DUEL",lab:"CHALLENGE LAB",record:"EGO RECORD"})[name];}
function playViewSection(name){return name==="duel"?"play":"challenges";}
function resumePlayView(){const name=new URL(window.location.href).searchParams.get("play");if(PLAY_VIEW_NAMES.includes(name))renderPlayView(name);}
function refreshPlayView(){const screen=document.getElementById("playViewScreen");if(playViewVisible())renderPlayView(screen.dataset.view);}
function leavePlayView(){const url=new URL("./",appRootUrl());history.pushState({blDraftRoute:"menu"},"",url.href);goToMainMenu({skipHistory:true});}
function playViewHeader(kicker,title,lead,actions=""){return `<header class="play-view-header"><div><span class="play-view-kicker">${kicker}</span><h1>${title}</h1>${lead?`<p>${lead}</p>`:""}</div>${actions?`<div class="play-view-actions">${actions}</div>`:""}</header>`;}
function playDateLabel(day,options={weekday:"short",day:"numeric",month:"short"}){try{return new Intl.DateTimeFormat(SiteI18n.language,{...options,timeZone:"UTC"}).format(new Date(day+"T12:00:00Z"));}catch{return day;}}
function egoToast(ids){
    if(!ids?.length)return;const holder=document.getElementById("egoToast")||document.body.appendChild(Object.assign(document.createElement("div"),{id:"egoToast",className:"ego-toast"}));
    holder.setAttribute("role","status");holder.innerHTML=ids.map(id=>{const item=EGO_ACHIEVEMENTS.find(a=>a.id===id);return item?`<p><span>ACHIEVEMENT UNLOCKED</span><strong>${esc(replayText(item.title))}</strong><small>${esc(replayText(item.description))}</small></p>`:"";}).join("");
    SiteI18n.apply(holder);holder.classList.add("is-visible");clearTimeout(holder._timer);holder._timer=setTimeout(()=>holder.classList.remove("is-visible"),5200);playSfx?.("confirm");
}
// ---------- Ego Board ----------
function egoBoardToday(){
    const today=localDraftDate(),solo=soloRecords(),dailyRule=dailyPickRule(today),run=soloLoad(),duel=duelRecords(),duelSave=duelLoad();
    let tactic=null;try{tactic=dailyTacticMission(today);}catch{}
    const dailyBest=solo["daily:"+today],tacticBest=solo["puzzle:tactic:"+today],duelBest=duel.daily[today];
    const dailyLive=run?.kind==="daily"&&run.date===today&&run.phase!=="result",tacticLive=run?.kind==="puzzle"&&run.mission==="tactic:"+today&&run.phase!=="result",duelLive=duelSave?.daily===today&&duelSave.phase!=="result";
    return {today,dailyRule,tactic,daily:{done:!!dailyBest?.score,best:dailyBest,live:dailyLive},tacticState:{done:!!tacticBest?.complete,best:tacticBest,live:tacticLive},duel:{done:!!duelBest,best:duelBest,live:duelLive,setup:duelDailySetup(today)}};
}
function egoStatusMarkup(item,doneText){return item.done?`<span class="ego-status is-done">✓ <b>${doneText}</b></span>`:item.live?`<span class="ego-status is-live">◐ <b>${esc(replayText("IN PROGRESS"))}</b></span>`:`<span class="ego-status">○ <b>${esc(replayText(item.best?.attempts?"NOT COMPLETED":"NOT STARTED"))}</b></span>`;}
function egoWeekMarkup(record,solo,duel,today){
    const start=dailyDayNumber(today);
    return `<ol class="ego-week" aria-label="${esc(replayText("LAST 7 DAYS"))}">${Array.from({length:7},(_,i)=>dailyDayString(start-6+i)).map(day=>{
        const marks=[["daily",!!solo["daily:"+day]?.score],["tactic",!!solo["puzzle:tactic:"+day]?.complete],["duel",!!duel.daily[day]]],count=marks.filter(([,done])=>done).length;
        return `<li class="${day===today?"is-today":""}" aria-label="${esc(playDateLabel(day,{weekday:"long",day:"numeric",month:"long"})+" · "+replayText("{count} / 3 COMPLETE",{count}))}"><span data-i18n-ignore>${esc(playDateLabel(day,{weekday:"short"}))}</span><b data-i18n-ignore>${esc(playDateLabel(day,{day:"numeric"}))}</b><i aria-hidden="true">${marks.map(([mode,done])=>`<em class="${done?"is-done":""}" data-mode="${mode}"></em>`).join("")}</i></li>`;
    }).join("")}</ol>`;
}
function renderEgoBoard(screen){
    const board=egoBoardToday(),record=egoRecordLoad(),solo=soloRecords(),duel=duelRecords(),done=[board.daily.done,board.tacticState.done,board.duel.done].filter(Boolean).length;
    const rule=board.dailyRule,tactic=board.tactic,setup=board.duel.setup,curated=curatedPuzzleMissions(),completed=curated.filter(m=>solo["puzzle:"+m.id]?.complete).length,unlocked=Object.keys(record.achievements).length;
    screen.innerHTML=`${playViewHeader(`EGO BOARD · <time datetime="${board.today}" data-i18n-ignore>${esc(playDateLabel(board.today,{weekday:"long",day:"numeric",month:"long"}))}</time>`,"TODAY'S EGO BOARD","Three new activities every day. Missing a day costs nothing.",`<button type="button" data-play-back>← <span>HOME</span></button>`)}
    <div class="ego-progress" role="group" aria-label="${esc(replayText("{count} / 3 COMPLETE",{count:done}))}"><strong>${esc(replayText("{count} / 3 COMPLETE",{count:done}))}</strong><span class="ego-progress-bar" aria-hidden="true"><i style="width:${done/3*100}%"></i></span><small>${done===3?esc(replayText("Board complete. New activities arrive tomorrow.")):esc(replayText("Each activity is deterministic: everyone gets the same challenge today."))}</small></div>
    <div class="ego-activities">
        <article class="ego-activity" data-activity="daily"><span class="ego-activity-kicker">01 // DAILY EGO DRAFT</span><h2>${esc(replayText(rule.title))}</h2><p>${esc(replayText(rule.description))}</p>${rule.modifier?`<p class="ego-rule"><span>TODAY'S RULE</span> <strong>${esc(replayText(rule.modifier.title))}</strong></p>`:""}<dl><div><dt>PICKS</dt><dd>${rule.size}</dd></div><div><dt>BEST TODAY</dt><dd>${board.daily.best?.score?`${board.daily.best.grade} · ${board.daily.best.score.toLocaleString(SiteI18n.language)}`:"—"}</dd></div></dl>${egoStatusMarkup(board.daily,board.daily.best?.grade||"")}<button type="button" class="primary-button" data-daily-draft>${board.daily.live?"RESUME DRAFT":board.daily.done?"IMPROVE SCORE":"START DAILY DRAFT"}</button></article>
        <article class="ego-activity" data-activity="tactic"><span class="ego-activity-kicker">02 // DAILY TACTICAL CHALLENGE</span><h2>${esc(replayText(tactic?.title||"DAILY TACTICAL CHALLENGE"))}</h2><p>${esc(replayText(tactic?.description||""))}</p><p class="ego-rule"><span>FORMATION</span> <strong data-i18n-ignore>${esc(tactic?.formation||"—")}</strong> · <span>BUDGET</span> <strong data-i18n-ignore>$${(tactic?.budget||0).toLocaleString(SiteI18n.language)}</strong></p><dl><div><dt>OPEN ROLES</dt><dd>${tactic?11-tactic.locked.length:"—"}</dd></div><div><dt>BEST TODAY</dt><dd>${board.tacticState.best?.complete?`${board.tacticState.best.grade} · ${board.tacticState.best.score.toLocaleString(SiteI18n.language)}`:"—"}</dd></div></dl>${egoStatusMarkup(board.tacticState,board.tacticState.best?.grade||"")}<button type="button" class="primary-button" data-solo-mission="${tactic?.id||""}" ${tactic?"":"disabled"}>${board.tacticState.live?"RESUME DRAFT":board.tacticState.done?"IMPROVE SCORE":"SOLVE TODAY'S PUZZLE"}</button></article>
        <article class="ego-activity" data-activity="duel"><span class="ego-activity-kicker">03 // DAILY DRAFT DUEL</span><h2>${esc(replayText("{format} DUEL",{format:replayText(DUEL_FORMATS[setup.format].title)}))}</h2><p>Draft against the Normal CPU from today's shared market.</p><p class="ego-rule"><span>PLAYERS</span> <strong data-i18n-ignore>${DUEL_FORMATS[setup.format].size}</strong> · <span>CPU</span> <strong>${esc(replayText("NORMAL"))}</strong></p><dl><div><dt>RESULT</dt><dd>${board.duel.best?esc(replayText(board.duel.best.outcome.toUpperCase())):"—"}</dd></div><div><dt>MARGIN</dt><dd>${board.duel.best?signedImpact(board.duel.best.margin):"—"}</dd></div></dl>${egoStatusMarkup(board.duel,board.duel.best?replayText(board.duel.best.outcome.toUpperCase()):"")}<button type="button" class="primary-button" data-duel-daily>${board.duel.live?"RESUME DUEL":board.duel.done?"REMATCH":"START DAILY DUEL"}</button></article>
    </div>
    <section class="ego-history" aria-labelledby="egoHistoryTitle"><div class="ego-section-heading"><h2 id="egoHistoryTitle">LAST 7 DAYS</h2><p>Each mark is a finished activity: Daily Draft, Tactical Challenge, Draft Duel.</p></div>${egoWeekMarkup(record,solo,duel,board.today)}</section>
    <section class="ego-links" aria-label="${esc(replayText("MORE CHALLENGES"))}">
        <button type="button" data-play-view="challenges"><span>DRAFT CHALLENGES</span><strong>${esc(replayText("{done} / {total} COMPLETED",{done:completed,total:curated.length}))}</strong><small>Handcrafted squad-building missions with medals.</small></button>
        <button type="button" data-play-view="duel"><span>DRAFT DUEL</span><strong>${esc(replayText("CHOOSE YOUR OPPONENT"))}</strong><small>Quick, Standard or Full XI against Easy, Normal or Hard.</small></button>
        <button type="button" data-play-view="lab"><span>CHALLENGE LAB</span><strong>${esc(replayText("CREATE · SHARE · BEAT THIS"))}</strong><small>Build a challenge and send its code to a friend.</small></button>
        <button type="button" data-play-view="record"><span>EGO RECORD</span><strong>${esc(replayText("{count} / {total} ACHIEVEMENTS",{count:unlocked,total:EGO_ACHIEVEMENTS.length}))}</strong><small>Your personal bests, history and milestones.</small></button>
    </section>`;
}
// ---------- Draft Challenges browser ----------
const CHALLENGE_CATEGORIES=Object.freeze(["Tactical","Chemistry","Budget","Formation","Character","Restricted","Expert"]);
function challengeMedalMarkup(best){const medal=egoMedal(best?.grade,best?.complete);return medal?`<span class="challenge-medal is-${medal}" aria-label="${esc(replayText(medal.toUpperCase()+" MEDAL"))}"><i aria-hidden="true"></i><b>${esc(replayText(medal.toUpperCase()+" MEDAL"))}</b></span>`:`<span class="challenge-medal"><b>${esc(replayText(best?.attempts?"NOT COMPLETED":"NO RESULT YET"))}</b></span>`;}
function renderChallengeBrowser(screen){
    const solo=soloRecords(),missions=curatedPuzzleMissions(),completed=missions.filter(m=>solo["puzzle:"+m.id]?.complete),medals={gold:0,silver:0,bronze:0};
    for(const m of missions){const medal=egoMedal(solo["puzzle:"+m.id]?.grade,solo["puzzle:"+m.id]?.complete);if(medal)medals[medal]++;}
    const visible=missions.map((m,i)=>({m,i})).filter(({m})=>(challengeFilter.category==="ALL"||m.category===challengeFilter.category)&&(!challengeFilter.open||!solo["puzzle:"+m.id]?.complete));
    screen.innerHTML=`${playViewHeader("DRAFT CHALLENGES","CHOOSE YOUR MISSION","Fixed prices, locked cores and clear objectives. Earn a medal, then chase S+.",`<button type="button" data-play-back>← <span>HOME</span></button><button type="button" data-play-view="lab">CHALLENGE LAB</button>`)}
    <div class="challenge-summary"><div><span>COMPLETED</span><strong>${completed.length} / ${missions.length}</strong></div><div class="is-gold"><span>GOLD MEDAL</span><strong>${medals.gold}</strong></div><div class="is-silver"><span>SILVER MEDAL</span><strong>${medals.silver}</strong></div><div class="is-bronze"><span>BRONZE MEDAL</span><strong>${medals.bronze}</strong></div></div>
    <p class="challenge-medal-key">Bronze: complete the required goals. Silver: grade A. Gold: grade S or S+.</p>
    <div class="challenge-filters" role="group" aria-label="${esc(replayText("FILTER CHALLENGES"))}">${["ALL",...CHALLENGE_CATEGORIES].map(category=>`<button type="button" data-challenge-category="${category}" aria-pressed="${challengeFilter.category===category}">${esc(replayText(category.toUpperCase()))}</button>`).join("")}<button type="button" class="challenge-open-toggle" data-challenge-open aria-pressed="${challengeFilter.open}">${esc(replayText("NOT COMPLETED"))}</button></div>
    <div class="challenge-grid">${visible.map(({m,i})=>{const best=solo["puzzle:"+m.id];return `<article class="challenge-card" data-difficulty="${m.difficulty}"><span class="mode-overline"><b data-i18n-ignore>${String(i+1).padStart(2,"0")}</b> · ${esc(replayText(m.category.toUpperCase()))} · ${esc(replayText(m.difficulty.toUpperCase()))}</span><h3>${esc(replayText(m.title))}</h3><p>${esc(replayText(m.description))}</p><ul class="challenge-facts"><li data-i18n-ignore>${esc(m.formation)}</li><li><span>BUDGET</span> <b data-i18n-ignore>$${m.budget.toLocaleString(SiteI18n.language)}</b></li><li><span>OPEN ROLES</span> <b data-i18n-ignore>${11-m.locked.length}</b></li></ul><div class="challenge-card-foot">${challengeMedalMarkup(best)}<span class="challenge-best">${best?.complete?`<b data-i18n-ignore>${best.grade}</b> ${best.score.toLocaleString(SiteI18n.language)}`:""}</span></div><button type="button" data-solo-mission="${m.id}" aria-label="${esc(replayText("Play {mission}",{mission:replayText(m.title)}))}">${best?.complete?"IMPROVE":"PLAY"}</button></article>`;}).join("")||'<p class="challenge-empty">No missions match this filter.</p>'}</div>
    <section class="challenge-import"><h2>IMPORT A CHALLENGE</h2><p>Paste a Challenge Lab code or an auction mission code from a friend.</p><form id="challengeImportForm"><label for="challengeImportCode" class="visually-hidden">CHALLENGE CODE</label><textarea id="challengeImportCode" maxlength="12000" required dir="ltr" autocomplete="off" spellcheck="false"></textarea><button type="submit" class="primary-button">IMPORT CHALLENGE</button></form><p id="challengeImportFeedback" class="replay-feedback" role="status" aria-live="polite"></p></section>`;
    screen.querySelector("#challengeImportForm").onsubmit=event=>{event.preventDefault();importAnyChallenge(screen.querySelector("#challengeImportCode").value,screen.querySelector("#challengeImportFeedback"));};
}
function importAnyChallenge(code,feedback){
    try{const value=String(code||"").trim();if(value.startsWith(LAB_CODE_PREFIX+".")){const mission=labRegisterCode(value);openPuzzleBriefing(mission.id);return;}openModeBriefing(importChallengeCode(value));}
    catch(error){if(feedback)feedback.textContent=replayText(error.message||"Invalid or outdated code.");else showSiteError(error.message||"Invalid or outdated code.","DRAFT CHALLENGES");}
}
// ---------- Ego Record ----------
function renderEgoRecord(screen){
    const record=egoRecordLoad(),solo=soloRecords(),duel=duelRecords(),today=localDraftDate(),fav=egoFavourites(record),missions=curatedPuzzleMissions(),medals={gold:0,silver:0,bronze:0};
    for(const m of missions){const medal=egoMedal(solo["puzzle:"+m.id]?.grade,solo["puzzle:"+m.id]?.complete);if(medal)medals[medal]++;}
    const active30=egoActiveDays(record,today,30).length,week=Array.from({length:7},(_,i)=>dailyDayString(dailyDayNumber(today)-6+i));
    const stat=(label,value,detail="")=>`<div class="ego-stat"><span>${label}</span><strong>${value}</strong>${detail?`<small>${detail}</small>`:""}</div>`;
    const levels=DUEL_LEVELS.map(level=>{const r=duel.levels[level];return `<div><span>${esc(replayText(level.toUpperCase()))}</span><strong data-i18n-ignore>${r.w}–${r.l}–${r.d}</strong></div>`;}).join("");
    const best=key=>record.best[key]?`${record.best[key].value} <small>${esc(replayText(({daily:"DAILY EGO DRAFT",tactic:"DAILY TACTICAL CHALLENGE",duel:"DRAFT DUEL",challenge:"DRAFT CHALLENGES",lab:"CHALLENGE LAB"})[record.best[key].mode]))} · <span data-i18n-ignore>${esc(formationLabel(record.best[key].formation||""))}</span></small>`:"—";
    screen.innerHTML=`${playViewHeader("EGO RECORD","YOUR EGO RECORD","Only results finished in this browser are counted. Nothing is uploaded.",`<button type="button" data-play-back>← <span>HOME</span></button><button type="button" data-play-view="board">EGO BOARD</button>`)}
    <div class="ego-stats">
        ${stat("ACTIVE DAYS",active30,esc(replayText("Last 30 days")))}
        ${stat("BEST DAILY SCORE",record.dailyBest?record.dailyBest.toLocaleString(SiteI18n.language):"—")}
        ${stat("DAILY S / S+",`<span data-i18n-ignore>${record.gradeCounts.S} / ${record.gradeCounts["S+"]}</span>`)}
        ${stat("TACTICAL SOLVED",record.counts.tactic)}
        ${stat("CHALLENGES COMPLETED",`${missions.filter(m=>solo["puzzle:"+m.id]?.complete).length} / ${missions.length}`,`<span class="ego-medal-row"><b class="is-gold">${medals.gold}</b><b class="is-silver">${medals.silver}</b><b class="is-bronze">${medals.bronze}</b></span>`)}
        ${stat("LAB CHALLENGES CREATED",record.counts.created)}
        ${stat("BEST CHEMISTRY",best("chemistry"))}
        ${stat("BEST EFFECTIVE OVR",best("ovr"))}
    </div>
    <section class="ego-record-section"><h2>DRAFT DUEL RECORD</h2><p class="ego-note">Wins – losses – draws by CPU difficulty.</p><div class="ego-duel-levels">${levels}</div></section>
    <section class="ego-record-section"><h2>THIS WEEK</h2><ol class="ego-week ego-week-modes">${week.map(day=>`<li class="${day===today?"is-today":""}"><span data-i18n-ignore>${esc(playDateLabel(day,{weekday:"short"}))}</span><b>${record.activity[day]?.length||0}</b></li>`).join("")}</ol></section>
    <section class="ego-record-section ego-favourites"><h2>FAVOURITES</h2><div><span>FAVOURITE FORMATION</span><strong data-i18n-ignore>${fav.formation?esc(formationLabel(fav.formation)):"—"}</strong></div><div><span>MOST USED PLAYERS</span><ul>${fav.players.length?fav.players.map(([p,n])=>`<li><img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(p)}" alt="" width="36" height="40"><b data-i18n-ignore>${esc(p.name)}</b><small>${esc(replayText("{count} squads",{count:n}))}</small></li>`).join(""):'<li class="ego-empty">No finished squads yet.</li>'}</ul></div></section>
    <section class="ego-record-section"><h2>ACHIEVEMENTS</h2><p class="ego-note">${esc(replayText("{count} / {total} ACHIEVEMENTS",{count:Object.keys(record.achievements).length,total:EGO_ACHIEVEMENTS.length}))}</p><ul class="ego-achievements">${EGO_ACHIEVEMENTS.map(item=>{const date=record.achievements[item.id];return `<li class="${date?"is-unlocked":""}"><i aria-hidden="true">${date?"◆":"◇"}</i><div><strong>${esc(replayText(item.title))}</strong><small>${esc(replayText(item.description))}</small>${date?`<time datetime="${date}" data-i18n-ignore>${esc(playDateLabel(date,{day:"numeric",month:"short",year:"numeric"}))}</time>`:`<span class="visually-hidden">${esc(replayText("LOCKED"))}</span>`}</div></li>`;}).join("")}</ul></section>`;
}
document.addEventListener("click",event=>{
    const button=event.target.closest("button");if(!button)return;
    try{
        if(button.matches("[data-play-view]")){openPlayView(button.dataset.playView);return;}
        if(button.matches("[data-play-back]")){leavePlayView();return;}
        if(button.matches("[data-challenge-category]")){challengeFilter.category=button.dataset.challengeCategory;renderPlayView("challenges");document.querySelector(`[data-challenge-category="${challengeFilter.category}"]`)?.focus({preventScroll:true});return;}
        if(button.matches("[data-challenge-open]")){challengeFilter.open=!challengeFilter.open;renderPlayView("challenges");document.querySelector("[data-challenge-open]")?.focus({preventScroll:true});return;}
    }catch(error){showSiteError(error.message||"Invalid draft action.","EGO BOARD");}
});
window.addEventListener("bld:preferences",()=>{if(SiteI18n.language===playViewLanguage)return;playViewLanguage=SiteI18n.language;refreshPlayView();});
