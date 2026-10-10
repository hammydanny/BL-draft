// One information modal for the game pages and the standalone project pages.
let infoModalReturnFocus=null;
const siteDialogBackground=new Map();
function setSiteDialogState(modal,open){
    if(open)window.dispatchEvent(new CustomEvent("bld:dialog-open",{detail:{}}));
    modal.classList.toggle("hidden",!open);
    if(open){
        document.querySelectorAll(".site-header,main,.site-footer").forEach(element=>{
            if(!siteDialogBackground.has(element))siteDialogBackground.set(element,element.inert);
            element.inert=true;
        });
    }else{
        for(const [element,inert] of siteDialogBackground)element.inert=inert;
        siteDialogBackground.clear();
    }
    document.body.classList.toggle("dialog-open",open);
}
function siteInformationContent(type){
    if(type==="about")return `
      <div class="about-intro"><span class="info-eyebrow">FOOTBALL. DRAFTING. COMPETITION.</span>
        <h3>YOUR SQUAD. YOUR EGO.</h3>
        <p>Blue Lock Draft is an unofficial fan-made football drafting and squad-building experience inspired by Blue Lock. Compete in a two-team Auction, create a standalone XI, explore formations and chemistry, and discover the players behind your next signing.</p>
      </div>
      <div class="about-features"><span>AUCTION DRAFT</span><span>TEAM BUILDER</span><span>PLAYER EVALUATION</span><span>DATABASE &amp; LORE</span></div>
      <div class="credit-grid">
        <a class="credit-card" href="https://github.com/hammydanny" target="_blank" rel="noopener noreferrer"><span>DEVELOPED BY</span><strong>HAMMYDANNY</strong><small>VIEW GITHUB PROFILE ↗</small></a>
        <a class="credit-card" href="https://github.com/syaafibwn" target="_blank" rel="noopener noreferrer"><span>WITH SUPPORT FROM</span><strong>SYAAFIBWN</strong><small>VIEW GITHUB PROFILE ↗</small></a>
      </div>
      <div class="info-release"><span>CURRENT RELEASE <b>${APP_VERSION_LABEL}</b></span><span>DATA THROUGH <b>CH. ${APP_SUPPORTED_CHAPTER}</b></span></div>
      <section class="info-section"><h3>BUILT BY FANS</h3><p>A non-commercial, unofficial project. It is not affiliated with, endorsed by, or sponsored by the creators, publishers, licensors or official Blue Lock entities. Blue Lock names, characters, imagery and related intellectual property belong to their respective rights holders. Original website code and project design are separate from those rights.</p>
        <div class="info-links"><a href="privacy/">PRIVACY NOTICE →</a><a href="legal/">LEGAL NOTICE →</a><a href="changelog/">RELEASE HISTORY →</a></div>
      </section>`;
    return `
      <p class="guide-intro">Choose your route to the ultimate XI. Auction is a local two-player contest; Team Builder is your own squad lab. Your progress stays in this browser.</p>
      <nav class="guide-jump" aria-label="How to Play sections"><a href="#guide-auction">AUCTION</a><a href="#guide-builder">TEAM BUILDER</a><a href="#guide-extras">QUICK DRAFT &amp; RATINGS</a></nav>
      <section id="guide-auction" class="guide-section"><div class="guide-heading"><span>01 // COMPETE</span><h3>AUCTION DRAFT</h3></div>
        <ol class="guide-steps">
          <li><h4>CONFIGURE YOUR TEAMS</h4><p>Choose names, colors, budgets, bid interval and roster size.</p></li>
          <li><h4>CHOOSE THE PLAYER POOL</h4><p>Use categories, search and individual selections. Include enough players to fill both squads.</p></li>
          <li><h4>OPEN, BID OR PASS</h4><p>A coin flip picks the first opener; openings alternate. Bid in multiples of your interval within your budget. A pass awards the player to the bid leader.</p></li>
          <li><h4>COMPLETE BOTH SQUADS</h4><p>Watch your budget and roster space. A full team stops bidding; the other receives remaining signings free. Zero-budget situations allow free signings. Undo / Redo revisits Auction actions.</p></li>
          <li><h4>BUILD YOUR FORMATIONS</h4><p>Drag players onto the pitch, swap positions, manage Reserves and choose a Captain.</p></li>
          <li><h4>COMPARE &amp; SHARE</h4><p>Review the two teams and share the exact formation you built, with its Captain and Reserves.</p></li>
        </ol>
      </section>
      <section id="guide-builder" class="guide-section"><div class="guide-heading"><span>02 // EXPERIMENT</span><h3>TEAM BUILDER</h3></div>
        <ol class="guide-steps">
          <li><h4>SELECT YOUR PLAYERS</h4><p>Build a separate squad from the full player pool.</p></li>
          <li><h4>ARRANGE THE PITCH</h4><p>Pick a formation, then drag players into slots or onto Reserves.</p></li>
          <li><h4>REVIEW PLAYER OVR</h4><p>Check individual attributes and the OVR adjusted for each occupied position.</p></li>
          <li><h4>BUILD CHEMISTRY</h4><p>Inspect pitch links and the chemistry panel to find connected combinations.</p></li>
          <li><h4>TRY AUTO BEST</h4><p>Optionally let Auto Best check all ten formations for a strong lineup from your selected squad.</p></li>
          <li><h4>SHARE YOUR XI</h4><p>The shared report preserves your chosen formation. Partial squads use only deployed players.</p></li>
        </ol>
      </section>
      <section id="guide-extras" class="guide-section guide-extras">
        <div class="guide-note"><h3>QUICK DRAFT</h3><p>Set up a 5v5, 11v11 or 15v15 game and randomly deal two squads from the selected pool, skipping bidding. Full Setup also offers Random Draft.</p></div>
        <div class="guide-note"><h3>CHEMISTRY LINKS</h3><p>Link colors show the strength of a registered relationship. The database explains shared history and combinations; player placement also matters when evaluating your XI.</p></div>
        <div class="guide-note"><h3>PLAYER RATINGS</h3><p>Numbers and S–G grades are fan-made gameplay values, not official Blue Lock ratings. The six-axis radar shows field attributes; GK is a separate specialist metric.</p></div>
        <div class="guide-note"><h3>LOCAL SAVES</h3><p>Return through Resume Auction to continue a valid session. Team Builder saves separately. Clearing this site's browser data removes those saves.</p></div>
      </section>`;
}
function openInfoModal(type){
    infoModalReturnFocus=document.activeElement;
    const about=type==="about",modal=document.getElementById("infoModal");
    document.getElementById("infoModalCode").textContent=about?"BL // PROJECT INFORMATION":"BL // FIELD MANUAL";
    document.getElementById("infoModalTitle").textContent=about?"ABOUT / CREDITS":"HOW TO PLAY";
    document.getElementById("infoModalBody").innerHTML=siteInformationContent(type);
    modal.querySelector(".info-card").scrollTop=0;
    setSiteDialogState(modal,true);
    document.getElementById("infoModalClose").focus();
}
function closeInfoModal(){
    setSiteDialogState(document.getElementById("infoModal"),false);
    if(infoModalReturnFocus?.closest(".site-directory")&&isMobileSiteNavigation())document.getElementById("directoryMenuToggle").focus();
    else if(infoModalReturnFocus?.isConnected)infoModalReturnFocus.focus();
}
function trapSiteDialogFocus(event){
    if(event.key!=="Tab")return;
    const controls=[...event.currentTarget.querySelectorAll('button,a[href],input,select,[tabindex="0"]')].filter(element=>!element.disabled&&element.getClientRects().length);
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
}
document.querySelectorAll("[data-how-to-play],#menuHowToPlay").forEach(button=>button.addEventListener("click",()=>openInfoModal("how")));
document.querySelectorAll("[data-about],#menuAbout").forEach(button=>button.addEventListener("click",()=>openInfoModal("about")));
document.getElementById("infoModalClose").addEventListener("click",closeInfoModal);
document.getElementById("infoModalDone").addEventListener("click",closeInfoModal);
document.getElementById("infoModal").addEventListener("keydown",event=>{
    if(event.key==="Escape"){event.preventDefault();closeInfoModal();return;}
    trapSiteDialogFocus(event);
});
document.getElementById("infoModal").addEventListener("click",event=>{
    if(event.target.id==="infoModal")closeInfoModal();
    const jump=event.target.closest('.guide-jump a');
    if(jump){event.preventDefault();document.getElementById(jump.hash.slice(1))?.scrollIntoView({behavior:"instant",block:"start"});}
});
