// BLUE LOCK DRAFT // LORE DATABASE
// Local-only character and chemistry reference UI.

const CHARACTER_DESCRIPTIONS = {
  "Yoichi Isagi": "An adaptive striker whose spatial awareness, off-ball movement and metavision let him read entire attacks and repeatedly reinvent the route to goal.",
  "Ryosuke Kira": "A highly regarded high-school forward known as the Jewel of Japanese Soccer before Blue Lock's opening test eliminated him and challenged his team-first ideals.",
  "Noel Noa": "The world's benchmark striker and Bastard München master, defined by ruthless rationality, elite two-footed finishing and an ability to choose the most efficient scoring action.",
  "Meguru Bachira": "A free-form dribbler who follows his instinctive 'monster,' using elastic close control, creativity and fearless one-on-one play to break defensive structure.",
  "Gurimu Igarashi": "A survival-focused forward whose persistence and Malicia-style foul drawing let him manufacture value even when he lacks the elite technical weapons of Blue Lock's stars.",
  "Rensuke Kunigami": "A powerful left-footed striker rebuilt through the Wild Card into a physically dominant finisher with long-range shooting, strength and a more severe competitive edge.",
  "Hyoma Chigiri": "An explosive runner whose top speed, acceleration and wide attacking routes turn open grass into a direct scoring weapon.",
  "Gin Gagamaru": "An acrobatic instinct player who successfully converted into goalkeeper, combining reach, reflexes, flexibility and unusual body control for spectacular saves.",
  "Jingo Raichi": "A relentless duel specialist whose stamina, physical pressure and man-marking make him valuable as a defensive midfielder or disruptive central presence.",
  "Asahi Naruhaya": "A quick forward whose best weapon is off-the-ball movement, using blind spots and sharp runs to appear in finishing spaces despite limited individual power.",
  "Okuhito Iemon": "Team Z's dependable utility player who accepted the goalkeeper role during the First Selection and contributed through composure, sacrifice and basic all-around ability.",
  "Wataru Kuon": "A tall, intelligent forward with aerial ability and planning instincts, remembered for both his calculated betrayal of Team Z and his later attempt to make amends.",
  "Yudai Imamura": "A Team Z attacker whose speed and forward instincts gave him value in transition, though he never developed a defining weapon strong enough to survive deeper Blue Lock stages.",
  "Sae Itoshi": "A New Generation World XI midfielder whose technique, scanning, dribbling and surgical passing let him dictate the tempo and quality of an entire attack.",
  "Shoei Baro": "A domineering striker who treats the field as his kingdom, combining power, chop dribbles, disciplined shooting zones and a predator's willingness to devour teammates' plans.",
  "Ikki Niko": "A cerebral defender converted from striker, using vision, anticipation and metavision-like reading to intercept passing lanes and organize defensive space.",
  "Hibiki Okawa": "Team Y's recognized ace scorer, used as the focal point of Niko's early tactical system and valued primarily for direct finishing presence.",
  "Junichi Wanima": "One half of the Wanima partnership, a forward who thrives on synchronized movement and familiar combination play built through years beside his brother.",
  "Keisuke Wanima": "One half of the Wanima partnership, relying on coordinated timing, shared reads and rehearsed attacking movement with his brother.",
  "Reo Mikage": "An elite all-rounder whose copy ability, passing and tactical flexibility let him reproduce a wide range of techniques and serve as creator, midfielder or defender.",
  "Seishiro Nagi": "A prodigious trapping genius capable of killing impossible passes and inventing finishes from awkward situations, though his growth depends heavily on finding genuine personal motivation.",
  "Zantetsu Tsurugi": "A left-footed speedster with exceptional initial acceleration, dangerous diagonal shooting and a simple direct style that contrasts with his poor academic instincts.",
  "Rin Itoshi": "A complete elite striker whose shooting, technique, field control and destructive ego allow him to dominate matches while constantly seeking opponents strong enough to force evolution.",
  "Jyubei Aryu": "Aerial and reach specialist whose long limbs, jumping ability and stylish body control make him dangerous in both penalty boxes and highly useful as a center back.",
  "Aoshi Tokimitsu": "An anxious but physically exceptional player with huge stamina, acceleration and strength, capable of overwhelming opponents once he commits to a duel.",
  "Ranze Kurona": "A compact combination player whose turning speed, short passing and orbiting support runs make him an ideal connector for rapid one-two attacks such as Isagi's Planet Hotline.",
  "Yo Hiori": "A technically refined playmaker with calm scanning, elite passing precision and metavision, at his best when creating the decisive route rather than simply following another striker.",
  "Tabito Karasu": "A calculating midfielder who targets weaknesses, protects the ball intelligently and controls tempo through positioning, pressing choices and efficient distribution.",
  "Eita Otoya": "A stealth-oriented attacker who specializes in slipping behind markers, exploiting blind spots and timing off-ball runs to arrive where defenders stop tracking him.",
  "Kenyu Yukimiya": "A gifted one-on-one dribbler with strong pace, gyro-style shooting and the confidence to attack defenders directly, even when his personal ambition conflicts with the team's route.",
  "Ryusei Shido": "An explosive penalty-box striker driven by instinct, using extraordinary spatial reactions, athleticism and acrobatic finishing to score from situations most players cannot even attempt.",
  "Nijiro Nanase": "A hard-working support player who developed greater two-footed usefulness and learned to position himself as a reliable passing route around stronger central stars.",
  "Jin Kiyora": "A balanced, technically subtle player whose sharp positioning, break-dance-like body control and precisely weighted passing let him influence decisive moments without dominating possession.",
  "Leonardo Luna": "A Spanish World Five forward with elite senior-level technique, playful provocation and the composure to expose the gap between Blue Lock prospects and established international stars.",
  "Pablo Cavasoz": "An Argentine World Five technician whose precise passing, set-piece quality and light-footed control make him one of the group's strongest connectors.",
  "Adam Blake": "An English World Five striker built around senior-level power and finishing, using strength and direct attacking force to punish defenders who cannot match him physically.",
  "Dada Silva": "A Brazilian World Five forward whose imposing physique, aerial ability and athletic presence make him a major target in direct attacks.",
  "Julien Loki": "A French super-prodigy and master striker whose transcendent acceleration changes the geometry of the field, pairing world-class speed with increasingly mature tactical leadership.",
  "Gen Fukaku": "The original Japan U-20 goalkeeper, valued for conventional shot-stopping fundamentals, positioning and experience behind a disciplined national-team defense.",
  "Oliver Aiku": "A commanding center back and proven captain whose physicality, reading, leadership and metavision make him one of Japan's most complete defensive organizers.",
  "Kazuma Nio": "A rugged original U-20 center back who specializes in physical contests, contact-heavy defending and using strength to disrupt opposing forwards.",
  "Miroku Darai": "A disciplined U-20 defender known for tight marking, agile footwork and persistence when assigned to contain dangerous wide attackers.",
  "Teppei Neru": "A pace-focused U-20 fullback whose quick recovery speed and acceleration let him contest fast wingers and support an aggressive defensive line.",
  "Itsuki Wakatsuki": "A defensive midfielder from the original Japan U-20 setup, providing structure, ball-winning support and positional discipline in front of the back line.",
  "Haru Hayate": "A composed original U-20 midfielder who contributes through circulation, positioning and support play rather than a single overwhelming individual weapon.",
  "Kento Cho": "An original Japan U-20 attacker used as part of the national side's forward structure, offering movement and finishing support around the main ace.",
  "Teru Kitsunezato": "A wide U-20 attacker whose role emphasizes running lanes, support and maintaining attacking width within Japan's pre-Blue-Lock system.",
  "Shuto Sendo": "The original Japan U-20 ace forward, an opportunistic finisher with strong instincts around loose balls who later adapts well to Ubers' organized attacking structure.",
  "Michael Kaiser": "A New Generation World XI striker with metavision, ruthless positioning and the Kaiser Impact, a world-class shooting weapon built around extraordinary swing speed.",
  "Alexis Ness": "A highly technical left-footed midfielder whose close control and imaginative passing earned the 'Magician' identity, historically functioning as Kaiser's most devoted creator.",
  "Benedict Grim": "A Bastard München attacker who supports the club's established system through movement, width and combination play around its central stars.",
  "Lavinho": "Brazil's flamboyant master dribbler, teaching Barcha through freedom, rhythm and individual expression rather than rigid tactical imitation.",
  "Chris Prince": "Manshine City's master striker and physical idealist, obsessively engineering his body so every movement, shot and duel can be produced at elite athletic output.",
  "Agi": "A tall, intelligent Manshine attacker who initially acts as Nagi's development partner, combining technical quality with an analytical interest in drawing out other players' creativity.",
  "Marc Snuffy": "Ubers' master striker and tactical mastermind, famous for designing repeatable team patterns, maximizing player roles and leading through preparation rather than pure individual ego.",
  "Don Lorenzo": "A New Generation World XI center back nicknamed the Ace Eater, combining elite man-marking with unusual dribbling and ball-carrying to erase star attackers and launch counters.",
  "Charles Chevalier": "A gifted French playmaker whose contrarian personality and pinpoint passing make him especially dangerous when a difficult or unexpected attacking route captures his interest.",
  "Rooke": "A U-20 World Cup goalkeeper in the current player pool, profiled as a high-level shot stopper with the athletic tools expected of an international youth keeper.",
  "Renoir": "A French U-20 goalkeeper associated with the tournament's elite international generation, offering strong reflexes and composure behind France's talented outfield group.",
  "Haneru Shindo": "A World Cup-era forward in the current database, represented as a developing attacker whose value comes from direct movement and finishing support.",
  "Bunny Iglesias": "An elite U-20 forward recognized among the New Generation World XI, carrying the reputation and technical ceiling of a striker already measured against the world's best youth talent.",
  "Innocent Onazi": "Nigeria's powerful central forward and major attacking reference, combining strength, finishing and long-standing chemistry with foster brother Godwin Kuso.",
  "Godwin Kuso": "Nigeria's attacking midfielder and leader, a creator who has played alongside Onazi for years and focuses on supplying the striker with high-quality chances.",
  "Vivien Hugo": "An elite French central midfielder and New Generation World XI-level presence whose passing, control and tactical confidence make him a major connector in France's attack.",
  "Achanpong": "An England U-20 forward operating inside the team's collective system, offering athletic running and supporting movement rather than being treated as an individual superstar.",
  "Lockhart": "An England U-20 forward with proven penalty-area presence, including the movement and aerial finishing required to convert service from the team's structured wide attacks.",
  "Teddy Knight": "An elite England U-20 right-sided attacker and New Generation World XI-level talent, combining delivery, pace and high-end chance creation within England's collective system.",
  "Childs": "An England U-20 forward used as part of the team's system-oriented attack, providing supporting runs and finishing options around the more prominent creators."
};

function characterLoreDescription(player){
    return CHARACTER_DESCRIPTIONS[player.name] ||
        `${player.name} is currently profiled as a ${primaryPosition(player)} with ${playerPositions(player).join(", ")} listed roles.`;
}
function loreImageFallback(name){
    return name.split(/\s+/).map(part=>part[0]).join("").slice(0,3).toUpperCase();
}
function getCharacterChemistry(player){
    const name=player.name;
    const pairLinks=CHEMISTRY_SPECIAL_PAIRS
      .filter(pair=>Array.isArray(pair)&&pair.length>=5&&(pair[0]===name||pair[1]===name))
      .map(pair=>({type:"pair",characters:[pair[0],pair[1]],score:Number(pair[2])||0,label:pair[3]||"CHEMISTRY",description:pair[4]||""}));
    const teamLinks=CHEMISTRY_CONTEXTS
      .filter(context=>Array.isArray(context.players)&&context.players.includes(name))
      .map(context=>({type:"context",name:context.name,score:Number(context.score)||0,characters:context.players,
        description:`${name} is part of the ${context.name} chemistry context represented in the game's fan chemistry model.`}));
    return {pairLinks,teamLinks};
}
function renderCharacterLore(){
    const grid=document.getElementById("characterLoreGrid");if(!grid)return;
    const query=String(document.getElementById("characterLoreSearch")?.value||"").trim().toLowerCase();
    const filtered=players.filter(player=>
      !query||player.name.toLowerCase().includes(query)||primaryPosition(player).toLowerCase().includes(query)||
      playerPositions(player).some(pos=>pos.toLowerCase().includes(query))
    ).sort((a,b)=>playerOverall(b)-playerOverall(a));
    if(!filtered.length){grid.innerHTML=`<div class="lore-empty">NO CHARACTERS MATCH YOUR SEARCH.</div>`;return;}
    grid.innerHTML=filtered.map(player=>{
      const chemistry=getCharacterChemistry(player);
      const chemistryPreview=chemistry.pairLinks.slice().sort((a,b)=>b.score-a.score).slice(0,3);
      const st=playerStats(player);
      return `<article class="character-lore-card">
        <div class="character-lore-image-wrap" data-fallback="${esc(loreImageFallback(player.name))}">
          <img src="${player.image}" alt="${esc(player.name)}" class="character-lore-image" loading="lazy"
            onerror="this.classList.add('lore-image-broken')">
        </div>
        <div class="character-lore-main">
          <div class="character-lore-heading"><div><span class="lore-kicker">${esc(primaryPosition(player))}</span><h2>${esc(player.name)}</h2>${positionBadges(player)}</div>
            <div class="character-lore-ovr"><span>OVR</span><strong>${playerOverall(player)}</strong></div></div>
          <p class="character-lore-description">${esc(characterLoreDescription(player))}</p>
          <div class="character-lore-stats">
            <div><span>OFF</span><strong>${st.off}</strong></div><div><span>SHO</span><strong>${st.sho}</strong></div>
            <div><span>SPD</span><strong>${st.spd}</strong></div><div><span>DEF</span><strong>${st.def}</strong></div>
            <div><span>PAS</span><strong>${st.pas}</strong></div><div><span>DRI</span><strong>${st.dri}</strong></div>
            <div><span>GK</span><strong>${st.gk}</strong></div>
          </div>
          <div class="character-lore-chemistry"><div class="lore-subheading">RELEVANT CHEMISTRY</div>
            ${chemistryPreview.length?chemistryPreview.map(link=>`<div class="character-chemistry-link"><div>
              <strong>${esc(link.characters.filter(name=>name!==player.name).join(" × "))}</strong><span>${esc(link.label)}</span>
              </div><b class="${chemistryTier(link.score)}">${link.score}</b></div>`).join(""):`<div class="lore-muted">NO NAMED CHEMISTRY LINKS</div>`}
            ${chemistry.teamLinks.length?`<div class="character-team-contexts">${chemistry.teamLinks.slice(0,5).map(context=>`<span>${esc(context.name)}</span>`).join("")}</div>`:""}
          </div>
        </div>
      </article>`;
    }).join("");
}
function renderChemistryLore(){
    const grid=document.getElementById("chemistryLoreGrid");if(!grid)return;
    const query=String(document.getElementById("chemistryLoreSearch")?.value||"").trim().toLowerCase();
    const pairEntries=CHEMISTRY_SPECIAL_PAIRS.map(pair=>({type:"pair",characters:[pair[0],pair[1]],score:Number(pair[2])||0,label:pair[3]||"CHEMISTRY",description:pair[4]||""}));
    const contextEntries=CHEMISTRY_CONTEXTS.map(context=>({type:"context",name:context.name,characters:context.players||[],score:Number(context.score)||0,
      description:"A chemistry context based on shared history and tactical relationships in the game's fan model."}));
    const entries=[...pairEntries,...contextEntries].filter(entry=>{
      if(!query)return true;
      return entry.characters.join(" ").toLowerCase().includes(query)||String(entry.name||"").toLowerCase().includes(query)||
        String(entry.label||"").toLowerCase().includes(query)||String(entry.description||"").toLowerCase().includes(query);
    });
    grid.innerHTML=entries.length?entries.map(entry=>{
      const isPair=entry.type==="pair";
      return `<article class="chemistry-lore-card">
        <div class="chemistry-lore-heading"><div><span class="lore-kicker">${isPair?"PLAYER LINK":"TEAM CONTEXT"}</span>
          <h2>${isPair?`${esc(entry.characters[0])} × ${esc(entry.characters[1])}`:esc(entry.name)}</h2>
          ${isPair?`<span class="chemistry-lore-label">${esc(entry.label)}</span>`:""}</div>
          <div class="chemistry-lore-score ${chemistryTier(entry.score)}"><span>CHEM</span><strong>${entry.score}</strong></div></div>
        <p class="chemistry-lore-description">${esc(entry.description)}</p>
        <div class="chemistry-lore-characters">${entry.characters.map(name=>`<span>${esc(name)}</span>`).join("")}</div>
      </article>`;
    }).join(""):`<div class="lore-empty">NO CHEMISTRY ENTRIES MATCH YOUR SEARCH.</div>`;
}
function openLoreMenu(){setVisibleScreen(document.getElementById("lore-menu-screen"));}
function openCharacterLore(){setVisibleScreen(document.getElementById("character-lore-screen"));renderCharacterLore();}
function openChemistryLore(){setVisibleScreen(document.getElementById("chemistry-lore-screen"));renderChemistryLore();}
function bindLoreUI(){
    document.getElementById("menuLore")?.addEventListener("click",openLoreMenu);
    document.getElementById("loreBackToMenu")?.addEventListener("click",()=>{setVisibleScreen(menuScreen);refreshMainMenu();});
    document.getElementById("loreCharacters")?.addEventListener("click",openCharacterLore);
    document.getElementById("loreChemistry")?.addEventListener("click",openChemistryLore);
    document.getElementById("charactersBackToLore")?.addEventListener("click",openLoreMenu);
    document.getElementById("chemistryBackToLore")?.addEventListener("click",openLoreMenu);
    document.getElementById("characterLoreSearch")?.addEventListener("input",renderCharacterLore);
    document.getElementById("chemistryLoreSearch")?.addEventListener("input",renderChemistryLore);
}
bindLoreUI();
