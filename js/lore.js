// BLUE LOCK DRAFT // LORE DATABASE
// Local-only character and chemistry reference UI.

const CHARACTER_DESCRIPTIONS = {
  "Yoichi Isagi": "An adaptive striker whose spatial awareness, off-ball movement and metavision let him read entire attacks and repeatedly reinvent the route to goal.",
  "Ryosuke Kira": "A highly regarded high-school forward known as the Jewel of Japanese Soccer before Blue Lock's opening test eliminated him and challenged his team-first ideals. He later returns through Side-B.",
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
  "Hibiki Okawa": "Team Y's recognized ace scorer, used as the focal point of Niko's early tactical system and valued primarily for direct finishing presence. He later participates in Side-B.",
  "Junichi Wanima": "One half of the Wanima partnership, a forward who thrives on synchronized movement and familiar combination play built through years beside his brother.",
  "Keisuke Wanima": "One half of the Wanima partnership, relying on coordinated timing, shared reads and rehearsed attacking movement with his brother. After his First Selection elimination, he later enters Side-B.",
  "Reo Mikage": "An elite all-rounder whose copy ability, passing and tactical flexibility let him reproduce a wide range of techniques and serve as creator, midfielder or defender.",
  "Seishiro Nagi": "A prodigious trapping genius capable of killing impossible passes and inventing finishes from awkward situations, though his growth depends heavily on finding genuine personal motivation. After the NEL, he enters Side-B.",
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
  "Rooke": "A goalkeeper first shown with Manshine City’s U-20 side in the Neo Egoist League in chapter 173. He later plays in goal for England U-20, wearing number 1 in both roles.",
  "Renoir": "A French U-20 goalkeeper associated with the tournament's elite international generation, offering strong reflexes and composure behind France's talented outfield group.",
  "Haneru Shindo": "A World Cup-era forward in the current database, represented as a developing attacker whose value comes from direct movement and finishing support.",
  "Bunny Iglesias": "An elite U-20 forward recognized among the New Generation World XI, carrying the reputation and technical ceiling of a striker already measured against the world's best youth talent.",
  "Innocent Onazi": "Nigeria's powerful central forward and major attacking reference, combining strength, finishing and long-standing chemistry with foster brother Godwin Kuso.",
  "Godwin Kuso": "Nigeria's attacking midfielder and leader, a creator who has played alongside Onazi for years and focuses on supplying the striker with high-quality chances.",
  "Vivien Hugo": "An elite French central midfielder and New Generation World XI-level presence whose passing, control and tactical confidence make him a major connector in France's attack.",
  "Achanpong": "An England U-20 forward operating inside the team's collective system, offering athletic running and supporting movement rather than being treated as an individual superstar.",
  "Lockhart": "An England U-20 forward with proven penalty-area presence, including the movement and aerial finishing required to convert service from the team's structured wide attacks.",
  "Teddy Knight": "An elite England U-20 left winger and New Generation World XI-level talent, combining delivery, pace and high-end chance creation within England’s collective system.",
  "Shigeo Mizuki": "A Japanese forward in Side-B, first shown on a screen in chapter 311 and introduced in person in chapter 327. He identifies stamina as his strength and partners with Nagi in the Bird Cage challenge.",
  "Hajime Nishioka": "The Japanese forward known as Aomori’s Messi. He teamed with Baro and Naruhaya, cleared the Second Selection with Niko and Hiori, joined Manshine City in the NEL and later entered Side-B. His distinctive football weapon is not specifically demonstrated.",
  "Shizuka Haiji": "A Japanese forward who survived the Second Selection with Nanase, Hiiragi and Tsunzaki. He played on Third Selection Team A3 and joined FC Barcha during the NEL. A distinctive weapon is not specifically demonstrated. His selection jersey number was 19.",
  "Reiji Hiiragi": "A Japanese forward whose trapping and prediction are explored in Episode Nagi. He teamed with Niko and Zantetsu, cleared the Second Selection with Nanase’s group and played for Manshine City before entering Side-B. His selection number was 22; Manshine number 17.",
  "Taiga Tsunzaki": "A Japanese forward in the fourth Second Selection clear team alongside Nanase, Hiiragi and Haiji. He played on Third Selection Team C2 and was a Manshine City reserve in the NEL. A distinctive weapon is not specifically demonstrated. His selection number was 100.",
  "Oboabona": "Nigeria U-20’s number 8 centre-back. His headers and vertical leap support his aerial defending. He grew up playing football with Onazi, Kuso and Bello; their shared Nigeria team history provides his ordinary chemistry links.",
  "Bello": "Nigeria U-20’s number 11 right midfielder. His quick dribbling tempo is demonstrated against Bachira. He grew up playing football with Onazi, Kuso and Oboabona.",
  "Bats": "France U-20’s number 5 defensive midfielder. He uses his physique to pressure and obstruct opponents, including Karasu, in France’s match against Japan.",
  "Leyden": "France U-20’s number 8 left winger. His speed lets him keep pace with Chigiri, and he uses threatening deliveries and decoy movement during the Japan match.",
  "Hermes": "France U-20’s number 2 centre-back, introduced with the team in chapter 330. He contests Reo in the air during the Japan match. A distinctive named weapon is not specifically demonstrated.",
  "Aiki Himizu": "A Japanese forward whose feints, reading of deceptive movements and pressing are demonstrated in Episode Nagi. He cleared the Second Selection in Karasu’s group, played on Third Selection Team C2, joined FC Barcha and later entered Side-B. His selection number was 77.",
  "Childs": "An England U-20 forward used as part of the team's system-oriented attack, providing supporting runs and finishing options around the more prominent creators."
};

function characterLoreDescription(player){
    return CHARACTER_DESCRIPTIONS[player.name] ||
        `${player.name} is currently profiled as a ${primaryPosition(player)} with ${playerPositions(player).join(", ")} listed roles.`;
}
// Static database records and markup are reused across client-side filter changes.
// The gameplay arrays remain untouched.
let loreDatabaseCache=null;
function loreDatabase(){
    if(loreDatabaseCache)return loreDatabaseCache;
    const chemistry=[
      ...CHEMISTRY_SPECIAL_PAIRS.map(pair=>({type:"pair",characters:[pair[0],pair[1]],score:Number(pair[2])||0,label:pair[3]||"CHEMISTRY",description:pair[4]||""})),
      ...CHEMISTRY_CONTEXTS.map(context=>({type:"context",name:context.name,characters:context.players||[],score:Number(context.score)||0,
        description:"A chemistry context based on shared history and tactical relationships in the game's fan model."}))
    ];
    const byName=new Map(players.map(player=>[player.name,{pairLinks:[],teamLinks:[]}]));
    for(const entry of chemistry){
      entry.title=entry.type==="pair"?entry.characters.join(" × "):entry.name;
      entry.search=[entry.title,entry.label,entry.description,...entry.characters].join(" ").toLowerCase();
      for(const name of entry.characters){
        const profile=byName.get(name);if(!profile)continue;
        if(entry.type==="pair")profile.pairLinks.push(entry);
        else profile.teamLinks.push(entry);
      }
    }
    const characters=players.map(player=>({player,chemistry:byName.get(player.name),
      search:[player.name,primaryPosition(player),...playerPositions(player),characterLoreDescription(player),...byName.get(player.name).teamLinks.map(link=>link.name)].join(" ").toLowerCase()}));
    loreDatabaseCache={characters,chemistry,byName};
    return loreDatabaseCache;
}
function getCharacterChemistry(player){return loreDatabase().byName.get(player.name)||{pairLinks:[],teamLinks:[]};}
function loreControlValue(id,fallback=""){return document.getElementById(id)?.value||fallback;}
function filteredCharacterLore(){
    const query=loreControlValue("characterLoreSearch").trim().toLowerCase();
    const group=loreControlValue("characterLorePosition","ALL"),grade=loreControlValue("characterLoreGrade","ALL");
    const filtered=loreDatabase().characters.filter(record=>
      (!query||record.search.includes(query))&&
      (group==="ALL"||playerPositions(record.player).some(pos=>positionGroup(pos)===group))&&
      (grade==="ALL"||playerStatGrade(playerOverall(record.player))===grade)
    );
    const sort=loreControlValue("characterLoreSort","chronological");
    const compareNames=(a,b)=>a.player.name.localeCompare(b.player.name);
    return filtered.sort((a,b)=>{
      if(sort==="chronological")return comparePlayerAppearance(a.player,b.player);
      if(sort==="name-asc")return compareNames(a,b);
      if(sort==="name-desc")return compareNames(b,a);
      if(sort==="position")return primaryPosition(a.player).localeCompare(primaryPosition(b.player))||compareNames(a,b);
      return (sort==="ovr-asc"?1:-1)*(playerOverall(a.player)-playerOverall(b.player))||compareNames(a,b);
    });
}
function characterLoreCard(record){
    if(record.html)return record.html;
    const {player,chemistry}=record;
    const preview=chemistry.pairLinks.slice().sort((a,b)=>b.score-a.score).slice(0,3);
    const duo=chemistry.pairLinks.find(link=>link.label==="SECOND SELECTION DUO");
    if(duo&&!preview.includes(duo))preview.push(duo);
    record.html=`<article class="character-lore-card">
      <div class="character-lore-identity">
        <div class="character-lore-image-wrap">
          <img data-player-image src="${PLAYER_IMAGE_FALLBACK}" data-portrait-src="${playerImageUrl(player)}" alt="${esc(player.name)}" class="character-lore-image" loading="lazy" decoding="async" width="120" height="136">
        </div>
        <div class="character-lore-heading"><span class="lore-kicker">${esc(primaryPosition(player))} // MANGA CH. ${player.debutChapter}</span><h2>${esc(player.name)}</h2>${positionBadges(player)}
          <div class="character-lore-ovr" aria-label="Overall ${playerOverall(player)}, grade ${playerStatGrade(playerOverall(player))}"><span>OVR</span><strong>${playerOverall(player)}</strong><b class="evaluation-grade">${playerStatGrade(playerOverall(player))}</b></div>
        </div>
        <p class="character-lore-description">${esc(characterLoreDescription(player))}${player.statEstimate?"<br><small>RATINGS // GAME BALANCING ESTIMATES, NOT OFFICIAL STATS</small>":""}</p>
      </div>
      ${playerStatsRadar(player,"lore")}
      <div class="character-lore-chemistry"><div class="lore-subheading">RELEVANT CHEMISTRY</div>
        ${preview.length?preview.map(link=>`<div class="character-chemistry-link"><div>
          <strong>${esc(link.characters.filter(name=>name!==player.name).join(" × "))}</strong><span>${esc(link.label)}</span>
          </div><b class="${chemistryTier(link.score)}">${link.score}</b></div>`).join(""):`<div class="lore-muted">NO NAMED CHEMISTRY LINKS</div>`}
        ${chemistry.teamLinks.length?`<div class="character-team-contexts">${chemistry.teamLinks.slice(0,5).map(context=>`<span>${esc(context.name)}</span>`).join("")}</div>`:""}
      </div>
    </article>`;
    return record.html;
}
function renderLoreCards(grid,records,cardMarkup,emptyMessage){
    if(!records.length){grid.innerHTML=`<div class="lore-empty">${emptyMessage}</div>`;return;}
    const nodes=records.map(record=>{
        if(!record.node){
            const template=document.createElement("template");
            template.innerHTML=cardMarkup(record);
            record.node=template.content.firstElementChild;
        }
        return record.node;
    });
    // Reordering existing cards keeps decoded portraits and SVGs intact.
    if(grid.children.length!==nodes.length||nodes.some((node,index)=>grid.children[index]!==node)){
        grid.replaceChildren(...nodes);
    }
}
function renderCharacterLore(){
    const grid=document.getElementById("characterLoreGrid");if(!grid)return;
    const filtered=filteredCharacterLore();
    renderLoreCards(grid,filtered,characterLoreCard,"NO CHARACTERS MATCH YOUR FILTERS.");
    prioritizeVisiblePortraits(grid);
    const count=document.getElementById("characterLoreCount");if(count)count.textContent=`${filtered.length} / ${players.length} PLAYERS`;
}
function filteredChemistryLore(){
    const query=loreControlValue("chemistryLoreSearch").trim().toLowerCase();
    const type=loreControlValue("chemistryLoreType","ALL"),tier=loreControlValue("chemistryLoreTier","ALL");
    const filtered=loreDatabase().chemistry.filter(entry=>(!query||entry.search.includes(query))&&
      (type==="ALL"||entry.type===type)&&(tier==="ALL"||chemistryTier(entry.score)===tier));
    const sort=loreControlValue("chemistryLoreSort","score-desc");
    return filtered.sort((a,b)=>{
      if(sort==="name-asc")return a.title.localeCompare(b.title);
      if(sort==="name-desc")return b.title.localeCompare(a.title);
      return (sort==="score-asc"?1:-1)*(a.score-b.score)||a.title.localeCompare(b.title);
    });
}
function chemistryLoreCard(entry){
    if(entry.html)return entry.html;
    const isPair=entry.type==="pair";
    entry.html=`<article class="chemistry-lore-card">
      <div class="chemistry-lore-heading"><div><span class="lore-kicker">${isPair?"PLAYER LINK":"TEAM CONTEXT"}</span>
        <h2>${esc(entry.title)}</h2>${isPair?`<span class="chemistry-lore-label">${esc(entry.label)}</span>`:""}</div>
        <div class="chemistry-lore-score ${chemistryTier(entry.score)}"><span>CHEM</span><strong>${entry.score}</strong></div></div>
      <p class="chemistry-lore-description">${esc(entry.description)}</p>
      <div class="chemistry-lore-characters">${entry.characters.map(name=>`<span>${esc(name)}</span>`).join("")}</div>
    </article>`;
    return entry.html;
}
function renderChemistryLore(){
    const grid=document.getElementById("chemistryLoreGrid");if(!grid)return;
    const entries=filteredChemistryLore();
    renderLoreCards(grid,entries,chemistryLoreCard,"NO CHEMISTRY ENTRIES MATCH YOUR FILTERS.");
    const count=document.getElementById("chemistryLoreCount");if(count)count.textContent=`${entries.length} / ${loreDatabase().chemistry.length} ENTRIES`;
}
function resetLoreFilters(kind){
    const defaults=kind==="character"?{Search:"",Position:"ALL",Grade:"ALL",Sort:"chronological"}:{Search:"",Type:"ALL",Tier:"ALL",Sort:"score-desc"};
    for(const [control,value] of Object.entries(defaults)){const input=document.getElementById(kind+"Lore"+control);if(input)input.value=value;}
    if(kind==="character")renderCharacterLore();else renderChemistryLore();
}
function openLoreMenu(options={}){setVisibleScreen(document.getElementById("lore-menu-screen"),options);}
function openCharacterLore(options={}){setVisibleScreen(document.getElementById("character-lore-screen"),options);renderCharacterLore();}
function openChemistryLore(options={}){setVisibleScreen(document.getElementById("chemistry-lore-screen"),options);renderChemistryLore();}
function bindLoreUI(){
    document.getElementById("menuLore")?.addEventListener("click",openLoreMenu);
    document.getElementById("loreCharacters")?.addEventListener("click",openCharacterLore);
    document.getElementById("loreChemistry")?.addEventListener("click",openChemistryLore);
    for(const [kind,render] of [["character",renderCharacterLore],["chemistry",renderChemistryLore]]){
      document.getElementById(kind+"LoreSearch")?.addEventListener("input",render);
      const controls=kind==="character"?["Position","Grade","Sort"]:["Type","Tier","Sort"];
      for(const control of controls)document.getElementById(kind+"Lore"+control)?.addEventListener("change",render);
      document.getElementById(kind+"LoreReset")?.addEventListener("click",()=>resetLoreFilters(kind));
    }
}
bindLoreUI();
