// Fast entry to the existing Random Draft path; no second drafting algorithm.
function quickDraftPlayerPool(){
    const saved=loadSavedData();
    const ids=uiState.screen==="setup"?[...selectedPlayerIds]:saved?.gameActive?saved.selectedPlayerIds:saved?.setup?.selected;
    return players.filter(player=>(Array.isArray(ids)?ids:[...selectedPlayerIds]).includes(player.id));
}
function openQuickDraft(){
    document.getElementById("quickDraftModal")?.remove();
    const saved=loadSavedData(),preferences=saved?.setup||{};
    const pool=quickDraftPlayerPool();
    const value=(n,field)=>saved?.gameActive?saved[`team${n}`]?.[field]:preferences[`team${n}${field==="name"?"Name":"Color"}`];
    const size=Number(saved?.maxPlayers||preferences.maxPlayers||document.getElementById("maxPlayers").value);
    const overlay=document.createElement("div");overlay.id="quickDraftModal";overlay.className="quick-draft-overlay";
    overlay.innerHTML=`<section class="quick-draft-card" role="dialog" aria-modal="true" aria-labelledby="quickDraftTitle" tabindex="-1">
      <div class="quick-draft-heading"><div><span>BL // INSTANT SELECTION</span><h2 id="quickDraftTitle">QUICK <b>DRAFT</b></h2></div><button type="button" data-quick-close aria-label="Close Quick Draft">×</button></div>
      <p>Choose your teams. Random Draft fills both squads and takes you straight to Results.</p>
      <form id="quickDraftForm">
        <div class="quick-draft-teams">${[1,2].map(n=>`<fieldset><legend>TEAM ${n}</legend><label for="quickTeam${n}Name">NAME</label><input id="quickTeam${n}Name" maxlength="30" value="${esc(value(n,"name")||document.getElementById(`team${n}Name`).value)}" autocomplete="off"><label class="quick-color" for="quickTeam${n}Color"><span>COLOR</span><input id="quickTeam${n}Color" type="color" value="${esc(value(n,"color")||document.getElementById(`team${n}Color`).value)}"></label></fieldset>`).join("")}</div>
        <fieldset class="quick-draft-size"><legend>TEAM SIZE</legend><div>${[5,11,15].map(n=>`<label><input type="radio" name="quickSize" value="${n}" ${(size===n||(![5,11,15].includes(size)&&n===11))?"checked":""}>${n}v${n}</label>`).join("")}</div></fieldset>
        <div class="quick-draft-pool"><span>SAVED PLAYER POOL</span><strong>${pool.length} AVAILABLE</strong><small id="quickPoolRequired"></small></div>
        <p id="quickDraftValidation" class="quick-draft-validation" role="status" aria-live="polite"></p>
        <div class="quick-draft-actions"><button type="button" data-quick-edit>EDIT FULL PLAYER POOL</button><button type="submit" class="primary-button">START QUICK DRAFT <b>→</b></button></div>
      </form>
    </section>`;
    const previousFocus=document.activeElement;
    const returnFocus=previousFocus?.closest(".site-header")
      ?document.querySelector(isMobileSiteNavigation()?"#directoryMenuToggle":'.directory-item[data-directory-section="play"]')
      :previousFocus;
    function close(){overlay.remove();returnFocus?.focus();}
    const form=overlay.querySelector("form"),message=overlay.querySelector("#quickDraftValidation");
    function updateRequirement(){
        const required=Number(form.elements.quickSize.value)*2;
        overlay.querySelector("#quickPoolRequired").textContent=`${required} PLAYERS REQUIRED`;
        message.textContent=pool.length<required?`Select at least ${required} players for this preset. Your saved pool has ${pool.length}.`:"";
    }
    form.addEventListener("change",updateRequirement);
    overlay.querySelector("[data-quick-close]").onclick=close;
    overlay.addEventListener("click",event=>{if(event.target===overlay)close();});
    overlay.addEventListener("keydown",event=>{
        if(event.key==="Escape"){event.preventDefault();close();}
        if(event.key==="Tab"){
            const controls=[...overlay.querySelectorAll("button,input")],first=controls[0],last=controls.at(-1);
            if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        }
    });
    overlay.querySelector("[data-quick-edit]").onclick=()=>{close();updateRoute("auctionSetup",{quickDraft:false});};
    form.addEventListener("submit",event=>{
        event.preventDefault();
        const n1=form.querySelector("#quickTeam1Name").value.trim(),n2=form.querySelector("#quickTeam2Name").value.trim();
        const rosterSize=Number(form.elements.quickSize.value);
        if(!n1||!n2){message.textContent="Enter a name for both teams.";form.querySelector(!n1?"#quickTeam1Name":"#quickTeam2Name").focus();return;}
        if(![5,11,15].includes(rosterSize)){message.textContent="Choose 5v5, 11v11 or 15v15.";return;}
        if(pool.length<rosterSize*2){updateRequirement();return;}
        [1,2].forEach(n=>{document.getElementById(`team${n}Name`).value=n===1?n1:n2;document.getElementById(`team${n}Color`).value=form.querySelector(`#quickTeam${n}Color`).value;});
        document.getElementById("maxPlayers").value=rosterSize;
        selectedPlayerIds=new Set(pool.map(player=>player.id));
        close();startRandomDraft();
    });
    document.body.appendChild(overlay);updateRequirement();overlay.querySelector("[data-quick-close]").focus();
}
