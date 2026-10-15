// Reference metadata is keyed by stable player IDs. Ratings and weapons are referenced,
// never copied. Existing latest-main profiles/categories are retained verbatim.
const PLAYER_REFERENCE_SCHEMA_VERSION=1;
const PLAYER_DATA_CLASSIFICATIONS=Object.freeze({ratings:"PROJECT_RATING",positions:"GAMEPLAY_INTERPRETATION",canonPositions:"CANON",profile:"PROJECT_REFERENCE"});
const PLAYER_PROFILE_METADATA = {
  "1": {"overview":"An adaptive striker whose spatial awareness, off-ball movement and metavision let him read entire attacks and repeatedly reinvent the route to goal.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"AM","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"},{"position":"RM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.hellominju.com/2025/04/BlueLock173.html","chapter":173,"club":"Bastard München"},{"position":"CF","context":"First Selection","sourceType":"manga","sourceReference":"Isagi wins the pre-match selection for the striker slot and starts there.","sourceUrl":"https://bluelock.fandom.com/wiki/Team_X_vs_Team_Z","chapter":5,"club":"Team Z"},{"position":"CM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Japan’s deployed 4–1–4–1 formation against England (match starts ch.355); no hypothetical compatibility used.","sourceUrl":"https://h-snufkin.com/bluelock-en/manga-chapter-354/","chapter":354,"club":"Japan U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "2": {"overview":"A highly regarded high-school forward known as the Jewel of Japanese Soccer before Blue Lock's opening test eliminated him and challenged his team-first ideals. He later returns through Side-B.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"FW","context":"High-school football","sourceType":"manga","sourceReference":"Official anime profile describes Kira as the forward shown playing the opening high-school match.","sourceUrl":"https://tv.bluelock-pr.com/tv1st/character/","chapter":1}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "3": {"overview":"The world's benchmark striker and Bastard München master, defined by ruthless rationality, elite two-footed finishing and an ability to choose the most efficient scoring action.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"DM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Noa explicitly announces he is entering as DMF, not FW.","sourceUrl":"https://www.hellominju.com/2025/03/BlueLock192.html","chapter":192,"club":"Bastard München"},{"position":"CF","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Master-striker substitutions during the Bastard München–FC Barcha match; central attacking deployment.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_160","chapter":160}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "4": {"overview":"A free-form dribbler who follows his instinctive 'monster,' using elastic close control, creativity and fearless one-on-one play to break defensive structure.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LB","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"},{"position":"CF","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_158","chapter":158,"club":"FC Barcha"},{"position":"LM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "5": {"overview":"A survival-focused forward whose persistence and Malicia-style foul drawing let him manufacture value even when he lacks the elite technical weapons of Blue Lock's stars.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RB","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_276","chapter":276,"club":"Bastard München"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "6": {"overview":"A powerful left-footed striker rebuilt through the Wild Card into a physically dominant finisher with long-range shooting, strength and a more severe competitive edge.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.hellominju.com/2025/04/BlueLock173.html","chapter":173,"club":"Bastard München"},{"position":"DM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.animeexplained.com/spoilers/blue-lock-chapter-341-spoilers/","chapter":341,"club":"Japan U-20"},{"position":"FW","context":"First Selection","sourceType":"manga","sourceReference":"Team Z explicitly selects these three as its forwards for the Team V game.","sourceUrl":"https://bluelock.fandom.com/wiki/Team_V_vs_Team_Z","chapter":26,"club":"Team Z"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "7": {"overview":"An explosive runner whose top speed, acceleration and wide attacking routes turn open grass into a direct scoring weapon.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RB","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"},{"position":"LW","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Bastard_M%C3%BCnchen_vs_Manshine_City","chapter":174,"club":"Manshine City"},{"position":"RW","context":"Manshine City training match","sourceType":"manga","sourceReference":"Chris explicitly contrasts Chigiri’s played right-wing role with the left-wing deployment he prescribes and uses.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_175","chapter":175,"club":"Manshine City"},{"position":"FW","context":"First Selection","sourceType":"manga","sourceReference":"Team Z explicitly selects these three as its forwards for the Team V game.","sourceUrl":"https://bluelock.fandom.com/wiki/Team_V_vs_Team_Z","chapter":26,"club":"Team Z"},{"position":"CF","context":"High-school football","sourceType":"manga","sourceReference":"Chigiri is explicitly installed as his high-school team’s centre-forward during the depicted flashback.","sourceUrl":"https://bluelock.fandom.com/wiki/Hyoma_Chigiri/Synopsis","chapter":19}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "8": {"overview":"An acrobatic instinct player who successfully converted into goalkeeper, combining reach, reflexes, flexibility and unusual body control for spectacular saves.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"GK","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"},{"position":"FW","context":"First Selection","sourceType":"manga","sourceReference":"Team Z explicitly selects these three as its forwards for the Team V game.","sourceUrl":"https://bluelock.fandom.com/wiki/Team_V_vs_Team_Z","chapter":26,"club":"Team Z"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "9": {"overview":"A relentless duel specialist whose stamina, physical pressure and man-marking make him valuable as a defensive midfielder or disruptive central presence.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"DM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.hellominju.com/2025/02/BlueLock209.html","chapter":209,"club":"Bastard München"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "10": {"overview":"A quick forward whose best weapon is off-the-ball movement, using blind spots and sharp runs to appear in finishing spaces despite limited individual power.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Second Selection match is shown, but no precise deployed position is explicitly established by the checked evidence."}},
  "11": {"overview":"Team Z's dependable utility player who accepted the goalkeeper role during the First Selection and contributed through composure, sacrifice and basic all-around ability.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"GK","context":"First Selection","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.crunchyroll.com/news/guides/2024/10/5/all-blue-lock-season-1-matches-goals","chapter":5,"club":"Team Z"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "12": {"overview":"A tall, intelligent forward with aerial ability and planning instincts, remembered for both his calculated betrayal of Team Z and his later attempt to make amends.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"First Selection","sourceType":"manga","sourceReference":"Kuon is the attacking focal point of Team Z’s planned formation and scores its opening three goals against Team W.","sourceUrl":"https://www.crunchyroll.com/news/guides/2024/10/5/all-blue-lock-season-1-matches-goals","chapter":18,"club":"Team Z"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "13": {"overview":"A Team Z attacker whose speed and forward instincts gave him value in transition, though he never developed a defining weapon strong enough to survive deeper Blue Lock stages.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"First Selection participation verified; exact rotating assignments not sufficiently documented in the checked sources."}},
  "14": {"overview":"A New Generation World XI midfielder whose technique, scanning, dribbling and surgical passing let him dictate the tempo and quality of an entire attack.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"AM","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"},{"position":"FW","context":"Youth football","sourceType":"manga","sourceReference":"Sae’s depicted youth forward role before changing to midfielder; no specialist striker slot inferred.","sourceUrl":"https://bluelock.fandom.com/wiki/Sae_Itoshi/Synopsis","chapter":123}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "15": {"overview":"A domineering striker who treats the field as his kingdom, combining power, chop dribbles, disciplined shooting zones and a predator's willingness to devour teammates' plans.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RW","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"},{"position":"CF","context":"First Selection","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.crunchyroll.com/news/guides/2024/10/5/all-blue-lock-season-1-matches-goals","chapter":5,"club":"Team X"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "16": {"overview":"A cerebral defender converted from striker, using vision, anticipation and metavision-like reading to intercept passing lanes and organize defensive space.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CB","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"},{"position":"DM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_210","chapter":210,"club":"Ubers"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "17": {"overview":"Team Y's recognized ace scorer, used as the focal point of Niko's early tactical system and valued primarily for direct finishing presence. He later participates in Side-B.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"First Selection","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Team_Y_vs_Team_Z","chapter":10,"club":"Team Y"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "18": {"overview":"One half of the Wanima partnership, a forward who thrives on synchronized movement and familiar combination play built through years beside his brother.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Team W and later participation verified; exact position not established by the checked deployment evidence."}},
  "19": {"overview":"One half of the Wanima partnership, relying on coordinated timing, shared reads and rehearsed attacking movement with his brother. After his First Selection elimination, he later enters Side-B.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Team W participation verified; exact position not established by the checked deployment evidence."}},
  "20": {"overview":"An elite all-rounder whose copy ability, passing and tactical flexibility let him reproduce a wide range of techniques and serve as creator, midfielder or defender.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CB","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"},{"position":"CM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Bastard_M%C3%BCnchen_vs_Manshine_City","chapter":174,"club":"Manshine City"},{"position":"RM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"},{"position":"RB","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Japan’s deployed 4–1–4–1 formation against England (match starts ch.355); no hypothetical compatibility used.","sourceUrl":"https://h-snufkin.com/bluelock-en/manga-chapter-354/","chapter":354,"club":"Japan U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "21": {"overview":"A prodigious trapping genius capable of killing impossible passes and inventing finishes from awkward situations, though his growth depends heavily on finding genuine personal motivation. After the NEL, he enters Side-B.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"AM","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"},{"position":"RW","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Bastard_M%C3%BCnchen_vs_Manshine_City","chapter":174,"club":"Manshine City"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "22": {"overview":"A left-footed speedster with exceptional initial acceleration, dangerous diagonal shooting and a simple direct style that contrasts with his poor academic instincts.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RW","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_249","chapter":249,"club":"Paris X Gen"},{"position":"RM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Japan’s deployed 4–1–4–1 formation against England (match starts ch.355); no hypothetical compatibility used.","sourceUrl":"https://h-snufkin.com/bluelock-en/manga-chapter-354/","chapter":354,"club":"Japan U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "23": {"overview":"A complete elite striker whose shooting, technique, field control and destructive ego allow him to dominate matches while constantly seeking opponents strong enough to force evolution.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "24": {"overview":"Aerial and reach specialist whose long limbs, jumping ability and stylish body control make him dangerous in both penalty boxes and highly useful as a center back.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CB","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "25": {"overview":"An anxious but physically exceptional player with huge stamina, acceleration and strength, capable of overwhelming opponents once he commits to a duel.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_249","chapter":249,"club":"Paris X Gen"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "26": {"overview":"A compact combination player whose turning speed, short passing and orbiting support runs make him an ideal connector for rapid one-two attacks such as Isagi's Planet Hotline.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RB","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.hellominju.com/2025/04/BlueLock173.html","chapter":173,"club":"Bastard München"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "27": {"overview":"A technically refined playmaker with calm scanning, elite passing precision and metavision, at his best when creating the decisive route rather than simply following another striker.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RB","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_249","chapter":249,"club":"Bastard München"},{"position":"LB","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"},{"position":"RW","context":"Japan U-20 exhibition","sourceType":"manga","sourceReference":"Hiori’s right-wing/right-back role is separately recorded in the exhibition match reference.","sourceUrl":"https://bluelock.fandom.com/wiki/Yo_Hiori","chapter":130,"club":"Blue Lock Eleven"},{"position":"CM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Japan’s deployed 4–1–4–1 formation against England (match starts ch.355); no hypothetical compatibility used.","sourceUrl":"https://h-snufkin.com/bluelock-en/manga-chapter-354/","chapter":354,"club":"Japan U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "28": {"overview":"A calculating midfielder who targets weaknesses, protects the ball intelligently and controls tempo through positioning, pressing choices and efficient distribution.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"DM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"},{"position":"CB","context":"Japan U-20 exhibition","sourceType":"manga","sourceReference":"Ego’s explicit 3–6–1 attacking switch drops Karasu into the back line.","sourceUrl":"https://bluelock.fandom.com/wiki/Blue_Lock_vs_Japan_U-20","chapter":112,"club":"Blue Lock Eleven"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "29": {"overview":"A stealth-oriented attacker who specializes in slipping behind markers, exploiting blind spots and timing off-ball runs to arrive where defenders stop tracking him.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RW","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Eita_Otoya","chapter":158,"club":"FC Barcha"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "30": {"overview":"A gifted one-on-one dribbler with strong pace, gyro-style shooting and the confidence to attack defenders directly, even when his personal ambition conflicts with the team's route.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LW","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"},{"position":"LB","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.hellominju.com/2025/04/BlueLock173.html","chapter":173,"club":"Bastard München"},{"position":"LM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Japan’s deployed 4–1–4–1 formation against England (match starts ch.355); no hypothetical compatibility used.","sourceUrl":"https://h-snufkin.com/bluelock-en/manga-chapter-354/","chapter":354,"club":"Japan U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "31": {"overview":"An explosive penalty-box striker driven by instinct, using extraordinary spatial reactions, athleticism and acrobatic finishing to score from situations most players cannot even attempt.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_249","chapter":249,"club":"Paris X Gen"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "32": {"overview":"A hard-working support player who developed greater two-footed usefulness and learned to position himself as a reliable passing route around stronger central stars.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LW","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_249","chapter":249,"club":"Paris X Gen"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "33": {"overview":"A balanced, technically subtle player whose sharp positioning, break-dance-like body control and precisely weighted passing let him influence decisive moments without dominating possession.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LB","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_249","chapter":249,"club":"Bastard München"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "34": {"overview":"A Spanish World Five forward with elite senior-level technique, playful provocation and the composure to expose the gap between Blue Lock prospects and established international stars.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"FW","context":"World Five assessment","sourceType":"manga","sourceReference":"World Five’s played attacking roles, confirmed by their official introduction. No eleven-a-side specialist slot is inferred from this five-a-side match.","sourceUrl":"https://tv.bluelock-pr.com/tv1st/news/1844/","chapter":90}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "35": {"overview":"An Argentine World Five technician whose precise passing, set-piece quality and light-footed control make him one of the group's strongest connectors.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"FW","context":"World Five assessment","sourceType":"manga","sourceReference":"World Five’s played attacking roles, confirmed by their official introduction. No eleven-a-side specialist slot is inferred from this five-a-side match.","sourceUrl":"https://tv.bluelock-pr.com/tv1st/news/1844/","chapter":90}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "36": {"overview":"An English World Five striker built around senior-level power and finishing, using strength and direct attacking force to punish defenders who cannot match him physically.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"FW","context":"World Five assessment","sourceType":"manga","sourceReference":"World Five’s played attacking roles, confirmed by their official introduction. No eleven-a-side specialist slot is inferred from this five-a-side match.","sourceUrl":"https://tv.bluelock-pr.com/tv1st/news/1844/","chapter":90}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "37": {"overview":"A Brazilian World Five forward whose imposing physique, aerial ability and athletic presence make him a major target in direct attacks.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"FW","context":"World Five assessment","sourceType":"manga","sourceReference":"World Five’s played attacking roles, confirmed by their official introduction. No eleven-a-side specialist slot is inferred from this five-a-side match.","sourceUrl":"https://tv.bluelock-pr.com/tv1st/news/1844/","chapter":90}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "38": {"overview":"A French super-prodigy and master striker whose transcendent acceleration changes the geometry of the field, pairing world-class speed with increasingly mature tactical leadership.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-france-player-result/","chapter":330,"club":"France U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "39": {"overview":"The original Japan U-20 goalkeeper, valued for conventional shot-stopping fundamentals, positioning and experience behind a disciplined national-team defense.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"GK","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "40": {"overview":"A commanding center back and proven captain whose physicality, reading, leadership and metavision make him one of Japan's most complete defensive organizers.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CB","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/","chapter":330,"club":"Japan U-20"},{"position":"FW","context":"Youth football","sourceType":"manga","sourceReference":"Aiku’s depicted childhood forward role before his later conversion to defender; no specialist striker slot inferred.","sourceUrl":"https://bluelock.fandom.com/wiki/Oliver_Aiku/Synopsis","chapter":134}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "41": {"overview":"A rugged original U-20 center back who specializes in physical contests, contact-heavy defending and using strength to disrupt opposing forwards.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CB","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "42": {"overview":"A disciplined U-20 defender known for tight marking, agile footwork and persistence when assigned to contain dangerous wide attackers.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LB","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "43": {"overview":"A pace-focused U-20 fullback whose quick recovery speed and acceleration let him contest fast wingers and support an aggressive defensive line.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RB","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "44": {"overview":"A defensive midfielder from the original Japan U-20 setup, providing structure, ball-winning support and positional discipline in front of the back line.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"DM","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "45": {"overview":"A composed original U-20 midfielder who contributes through circulation, positioning and support play rather than a single overwhelming individual weapon.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"DM","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "46": {"overview":"An original Japan U-20 attacker used as part of the national side's forward structure, offering movement and finishing support around the main ace.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LW","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "47": {"overview":"A wide U-20 attacker whose role emphasizes running lanes, support and maintaining attacking width within Japan's pre-Blue-Lock system.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RW","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "48": {"overview":"The original Japan U-20 ace forward, an opportunistic finisher with strong instincts around loose balls who later adapts well to Ubers' organized attacking structure.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"Japan U-20 exhibition","sourceType":"licensed-anime-reference","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://times.abema.tv/articles/-/10149578"},{"position":"AM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_210","chapter":210,"club":"Ubers"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "49": {"overview":"A New Generation World XI striker with metavision, ruthless positioning and the Kaiser Impact, a world-class shooting weapon built around extraordinary swing speed.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.hellominju.com/2025/04/BlueLock173.html","chapter":173,"club":"Bastard München"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "50": {"overview":"A highly technical left-footed midfielder whose close control and imaginative passing earned the 'Magician' identity, historically functioning as Kaiser's most devoted creator.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"AM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.hellominju.com/2025/04/BlueLock173.html","chapter":173,"club":"Bastard München"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "51": {"overview":"A Bastard München attacker who supports the club's established system through movement, width and combination play around its central stars.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://www.hellominju.com/2025/04/BlueLock173.html","chapter":173,"club":"Bastard München"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "52": {"overview":"Brazil's flamboyant master dribbler, teaching Barcha through freedom, rhythm and individual expression rather than rigid tactical imitation.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Master-striker substitutions during the Bastard München–FC Barcha match; central attacking deployment.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_160","chapter":160}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "53": {"overview":"Manshine City's master striker and physical idealist, obsessively engineering his body so every movement, shot and duel can be produced at elite athletic output.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Bastard_M%C3%BCnchen_vs_Manshine_City","chapter":174,"club":"Manshine City"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "54": {"overview":"A tall, intelligent Manshine attacker who initially acts as Nagi's development partner, combining technical quality with an analytical interest in drawing out other players' creativity.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-england-player-summary/","chapter":355,"club":"England U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "55": {"overview":"Ubers' master striker and tactical mastermind, famous for designing repeatable team patterns, maximizing player roles and leading through preparation rather than pure individual ego.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"documented"},"canonPositions":[{"position":"DM","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit deployment in the cited match/formation.","sourceUrl":"https://www.devdiscourse.com/article/entertainment/2504094-blue-lock-chapter-223-release-date-time-and-prediction","chapter":222,"club":"Ubers"}]},
  "56": {"overview":"A New Generation World XI center back nicknamed the Ace Eater, combining elite man-marking with unusual dribbling and ball-carrying to erase star attackers and launch counters.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CB","context":"Neo Egoist League","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_210","chapter":210,"club":"Ubers"},{"position":"CM","context":"Ubers positional rotation","sourceType":"manga","sourceReference":"Lorenzo explicitly exchanges centre-back and midfield positions with Niko while carrying the ball.","sourceUrl":"https://bluelock.fandom.com/wiki/Chapter_211","chapter":211,"club":"Ubers"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "57": {"overview":"A gifted French playmaker whose contrarian personality and pinpoint passing make him especially dangerous when a difficult or unexpected attacking route captures his interest.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"AM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-france-player-result/","chapter":330,"club":"France U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "58": {"overview":"A goalkeeper first shown with Manshine City’s U-20 side in the Neo Egoist League in chapter 173. He later plays in goal for England U-20, wearing number 1 in both roles.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"GK","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-england-player-summary/","chapter":355,"club":"England U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "59": {"overview":"A French U-20 goalkeeper associated with the tournament's elite international generation, offering strong reflexes and composure behind France's talented outfield group.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"GK","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-france-player-result/","chapter":330,"club":"France U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "60": {"overview":"A World Cup-era forward in the current database, represented as a developing attacker whose value comes from direct movement and finishing support.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Professional/Side-B profile verified; exact deployed slot is not established by the checked evidence."}},
  "61": {"overview":"An elite U-20 forward recognized among the New Generation World XI, carrying the reputation and technical ceiling of a striker already measured against the world's best youth talent.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"documented"},"canonPositions":[{"position":"FW","context":"FC Barcha","sourceType":"manga","sourceReference":"Chapter 307’s on-field first-team introduction explicitly identifies Bunny as FW while Isagi watches the match. No CF/wing slot is inferred.","sourceUrl":"https://h-snufkin.com/bluelock-episode307/","chapter":307}]},
  "62": {"overview":"Nigeria's powerful central forward and major attacking reference, combining strength, finishing and long-standing chemistry with foster brother Godwin Kuso.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-nigeria-player-result/","chapter":314,"club":"Nigeria U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "63": {"overview":"Nigeria's attacking midfielder and leader, a creator who has played alongside Onazi for years and focuses on supplying the striker with high-quality chances.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"AM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-nigeria-player-result/","chapter":314,"club":"Nigeria U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "64": {"overview":"An elite French central midfielder and New Generation World XI-level presence whose passing, control and tactical confidence make him a major connector in France's attack.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-france-player-result/","chapter":330,"club":"France U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "65": {"overview":"An England U-20 forward operating inside the team's collective system, offering athletic running and supporting movement rather than being treated as an individual superstar.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"AM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-england-player-summary/","chapter":355,"club":"England U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "66": {"overview":"An England U-20 forward with proven penalty-area presence, including the movement and aerial finishing required to convert service from the team's structured wide attacks.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CF","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Lockhart directly replaces centre-forward Agi; same central attacking deployment, not a guessed role.","sourceUrl":"https://h-snufkin.com/bluelock-episode359/","chapter":359,"club":"England U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "67": {"overview":"An elite England U-20 left winger and New Generation World XI-level talent, combining delivery, pace and high-end chance creation within England’s collective system.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LW","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-england-player-summary/","chapter":355,"club":"England U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "68": {"overview":"An England U-20 forward used as part of the team's system-oriented attack, providing supporting runs and finishing options around the more prominent creators.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RW","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-england-player-summary/","chapter":355,"club":"England U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "69": {"overview":"A Japanese forward in Side-B, first shown on a screen in chapter 311 and introduced in person in chapter 327. He identifies stamina as his strength and partners with Nagi in the Bird Cage challenge.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Japan U-20 and Side-B participation does not itself establish a demonstrated position."}},
  "70": {"overview":"The Japanese forward known as Aomori’s Messi. He teamed with Baro and Naruhaya, cleared the Second Selection with Niko and Hiori, joined Manshine City in the NEL and later entered Side-B. His distinctive football weapon is not specifically demonstrated.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Participation and Aomori’s Messi title do not establish a deployed specialist position."}},
  "71": {"overview":"A Japanese forward who survived the Second Selection with Nanase, Hiiragi and Tsunzaki. He played on Third Selection Team A3 and joined FC Barcha during the NEL. A distinctive weapon is not specifically demonstrated. His selection jersey number was 19.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Small-sided appearance and NEL bid do not establish a deployed eleven-a-side position."}},
  "72": {"overview":"A Japanese forward whose trapping and prediction are explored in Episode Nagi. He teamed with Niko and Zantetsu, cleared the Second Selection with Nanase’s group and played for Manshine City before entering Side-B. His selection number was 22; Manshine number 17.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Episode Nagi appearance and NEL bid do not establish a deployed specialist position."}},
  "73": {"overview":"A Japanese forward in the fourth Second Selection clear team alongside Nanase, Hiiragi and Haiji. He played on Third Selection Team C2 and was a Manshine City reserve in the NEL. A distinctive weapon is not specifically demonstrated. His selection number was 100.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Selection/club membership does not establish an on-field deployment."}},
  "74": {"overview":"Nigeria U-20’s number 8 centre-back. His headers and vertical leap support his aerial defending. He grew up playing football with Onazi, Kuso and Bello; their shared Nigeria team history provides his ordinary chemistry links.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CB","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-nigeria-player-result/","chapter":314,"club":"Nigeria U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "75": {"overview":"Nigeria U-20’s number 11 right midfielder. His quick dribbling tempo is demonstrated against Bachira. He grew up playing football with Onazi, Kuso and Oboabona.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"RM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-nigeria-player-result/","chapter":314,"club":"Nigeria U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "76": {"overview":"France U-20’s number 5 defensive midfielder. He uses his physique to pressure and obstruct opponents, including Karasu, in France’s match against Japan.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"DM","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-france-player-result/","chapter":330,"club":"France U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "77": {"overview":"France U-20’s number 8 left winger. His speed lets him keep pace with Chigiri, and he uses threatening deliveries and decoy movement during the Japan match.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"LW","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-france-player-result/","chapter":330,"club":"France U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "78": {"overview":"France U-20’s number 2 centre-back, introduced with the team in chapter 330. He contests Reo in the air during the Japan match. A distinctive named weapon is not specifically demonstrated.","classification":"PROJECT_REFERENCE","canonPositions":[{"position":"CB","context":"U-20 World Cup","sourceType":"manga","sourceReference":"Explicit lineup/deployment; not inferred from attributes or gameplay badges.","sourceUrl":"https://h-snufkin.com/bluelock-u20worldcup-france-player-result/","chapter":330,"club":"France U-20"}],"positionAudit":{"throughChapter":364,"status":"documented"}},
  "79": {"overview":"A Japanese forward whose feints, reading of deceptive movements and pressing are demonstrated in Episode Nagi. He cleared the Second Selection in Karasu’s group, played on Third Selection Team C2, joined FC Barcha and later entered Side-B. His selection number was 77.","classification":"PROJECT_REFERENCE","positionAudit":{"throughChapter":364,"status":"unresolved","note":"Episode Nagi pressing and feints establish actions, not a precise deployed position."}}
};

// Shared category registry: Auction selection and Database browsing use the same data.
const PLAYER_POOL_CATEGORIES = {
    "blue-lock-project":{label:"BLUE LOCK PROJECT",names:["Yoichi Isagi","Ryosuke Kira","Meguru Bachira","Gurimu Igarashi","Rensuke Kunigami","Hyoma Chigiri","Gin Gagamaru","Jingo Raichi","Asahi Naruhaya","Okuhito Iemon","Wataru Kuon","Yudai Imamura","Shoei Baro","Ikki Niko","Hibiki Okawa","Junichi Wanima","Keisuke Wanima","Reo Mikage","Seishiro Nagi","Zantetsu Tsurugi","Rin Itoshi","Jyubei Aryu","Aoshi Tokimitsu","Ranze Kurona","Yo Hiori","Tabito Karasu","Eita Otoya","Kenyu Yukimiya","Ryusei Shido","Nijiro Nanase","Jin Kiyora","Hajime Nishioka","Shizuka Haiji","Reiji Hiiragi","Taiga Tsunzaki","Aiki Himizu"]},
    "original-u20":{label:"ORIGINAL JAPAN U-20",names:["Sae Itoshi","Gen Fukaku","Oliver Aiku","Kazuma Nio","Miroku Darai","Teppei Neru","Itsuki Wakatsuki","Haru Hayate","Kento Cho","Teru Kitsunezato","Shuto Sendo","Ryusei Shido"]},
    "world-five":{label:"WORLD FIVE",names:["Leonardo Luna","Pablo Cavasoz","Adam Blake","Dada Silva","Julien Loki"]},
    "master-strikers":{label:"MASTER STRIKERS",names:["Noel Noa","Lavinho","Chris Prince","Marc Snuffy","Julien Loki"]},
    "new-gen-11":{label:"NEW GENERATION XI",names:["Sae Itoshi","Michael Kaiser","Don Lorenzo","Bunny Iglesias","Vivien Hugo","Teddy Knight"]},
    "nel-foreign":{label:"NEL FOREIGN PLAYERS",names:["Noel Noa","Julien Loki","Michael Kaiser","Alexis Ness","Benedict Grim","Lavinho","Chris Prince","Agi","Marc Snuffy","Don Lorenzo","Charles Chevalier","Rooke","Renoir"]},
    "japan-world-cup":{label:"JAPAN U-20 WORLD CUP",names:["Yoichi Isagi","Rin Itoshi","Ryusei Shido","Meguru Bachira","Hyoma Chigiri","Reo Mikage","Rensuke Kunigami","Eita Otoya","Oliver Aiku","Tabito Karasu","Gin Gagamaru","Jyubei Aryu","Kenyu Yukimiya","Ikki Niko","Yo Hiori","Shuto Sendo","Ranze Kurona","Zantetsu Tsurugi","Gen Fukaku","Jingo Raichi","Jin Kiyora","Nijiro Nanase","Shoei Baro"]},
    "world-cup-new":{label:"U-20 WC NEWCOMERS",names:["Bunny Iglesias","Innocent Onazi","Godwin Kuso","Vivien Hugo","Achanpong","Lockhart","Teddy Knight","Childs","Oboabona","Bello","Bats","Leyden","Hermes"]},
    "side-b":{label:"SIDE-B",names:["Seishiro Nagi","Ryosuke Kira","Haneru Shindo","Hajime Nishioka","Shigeo Mizuki","Reiji Hiiragi","Aiki Himizu","Keisuke Wanima","Hibiki Okawa"]}
};
const PLAYER_POOL_CATEGORY_IDS=Object.fromEntries(Object.entries(PLAYER_POOL_CATEGORIES).map(([key,data])=>[
    key,new Set(players.filter(p=>data.names.includes(p.name)).map(p=>p.id))
]));

// Local flags describe confirmed nationality or national-team representation.
// GB is the ISO parent country; England's football representation uses GB-ENG.
const PLAYER_COUNTRIES=Object.freeze({
    JP:{name:"Japan",label:"Japan",flag:"images/flags/jp.svg"},
    DE:{name:"Germany",label:"Germany",flag:"images/flags/de.svg"},
    FR:{name:"France",label:"France",flag:"images/flags/fr.svg"},
    ES:{name:"Spain",label:"Spain",flag:"images/flags/es.svg"},
    BR:{name:"Brazil",label:"Brazil",flag:"images/flags/br.svg"},
    AR:{name:"Argentina",label:"Argentina",flag:"images/flags/ar.svg"},
    IT:{name:"Italy",label:"Italy",flag:"images/flags/it.svg"},
    NG:{name:"Nigeria",label:"Nigeria",flag:"images/flags/ng.svg"},
    MT:{name:"Malta",label:"Malta",flag:"images/flags/mt.svg"},
    GB:{name:"United Kingdom",label:"England",representation:"England",flag:"images/flags/gb-eng.svg"}
});

// Marc Snuffy is Maltese. Apply the correction to the shared player object before
// dossier/team-builder reference records are created so every existing nationality UI uses it.
const MARC_SNUFFY_PLAYER=players.find(player=>player.name==="Marc Snuffy");
if(MARC_SNUFFY_PLAYER&&!MARC_SNUFFY_PLAYER.nationality){
    MARC_SNUFFY_PLAYER.nationality={
        code:"MT",
        name:"Malta",
        basis:"nationality",
        source:{
            type:"canon-reference",
            url:"https://bluelock.fandom.com/wiki/Marc_Snuffy",
            note:"Marc Snuffy is a professional footballer from the Republic of Malta."
        }
    };
}
function playerNationalityMarkup(player){
    if(player?.nationalityUnknown===true)return `<div class="player-nationality" title="Nationality unknown"><span>UNKNOWN</span></div>`;
    const nationality=player?.nationality,country=PLAYER_COUNTRIES[nationality?.code];
    if(!country||nationality.name!==country.name)return "";
    const label=country.label,src=new URL(country.flag,document.baseURI);src.searchParams.set("v",APP_VERSION);
    return `<div class="player-nationality" title="${esc(label)}"><img src="${src.href}" alt="" width="24" height="16" decoding="async"><span>${esc(label)}</span></div>`;
}

// Canon aliases are display/search references only. A missing entry deliberately renders nothing.
const PLAYER_ALIASES=Object.freeze({
  "1": [
    {
      "name": "Genius of Adaptability",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e15-devour",
        "episode": 15,
        "timestamp": "16:53",
        "note": "Naruhaya explicitly calls Isagi a genius of adaptability after their Second Selection match."
      }
    },
    {
      "name": "Mr. Average",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/26-the-assassin-and-the-ninja",
        "episode": 26,
        "timestamp": "18:51",
        "note": "Karasu directly addresses Isagi during the Third Selection match. Official English Crunchyroll subtitle transcript; direct canon usage."
      }
    },
    {
      "name": "Game Master",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 207,
        "url": "https://www.hellominju.com/2025/02/BlueLock207.html",
        "note": "Kaiser describes Isagi as a game master pretending to be a clown (ゲームマスター). Checked the chapter-207 dialogue and the speaker/subject context; this is a direct canon epithet, not a description invented for the site."
      }
    },
    {
      "name": "Demon King of Blue Lock",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 293,
        "url": "https://www.hellominju.com/2025/02/BlueLock293.html",
        "note": "Checked chapter-293 speaker/subject dialogue context: ブルーロックの魔王. Rin describes the newly evolved Isagi after the decisive NEL goal; chapter panel and dialogue context cross-checked. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    },
    {
      "name": "The Neo-Egoist",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 293,
        "url": "https://www.hellominju.com/2025/02/BlueLock293.html",
        "note": "Checked chapter-293 speaker/subject dialogue context: 新英雄(ネオ・エゴイスト). Rin identifies Isagi by this designation in the same goal sequence; it is not inferred merely from the chapter title. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    },
    {
      "name": "Logic Demon",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 321,
        "url": "https://www.hellominju.com/2025/10/BlueLock321.html",
        "note": "Checked chapter-321 speaker/subject dialogue context: 論理(ロジック)魔王. Rin directly addresses Isagi after his Nigeria-match goal. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    }
  ],
  "2": [
    {
      "name": "Jewel of Japanese Soccer",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e1-dream",
        "episode": 1,
        "timestamp": "02:01",
        "note": "The interviewer explicitly says people call Kira the jewel of Japanese soccer."
      }
    },
    {
      "name": "Japan's Hope",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 327,
        "url": "https://www.hellominju.com/2025/08/BlueLock327.html",
        "note": "Checked chapter-327 speaker/subject dialogue context: 日本の希望 吉良涼介. Shindo addresses Kira in his introduction; source speech bubble was inspected. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    },
    {
      "name": "Anti-Blue Lock Extremist",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 327,
        "url": "https://www.hellominju.com/2025/11/BlueLock327.html",
        "note": "In the SIDE-B introduction, after Kira explains his desire to refute Blue Lock, Shindo directly characterizes him as 反ブルーロック最右翼. Speaker, subject and rejection-of-Blue-Lock context checked. This is a project English rendering of the canonical designation."
      }
    }
  ],
  "3": [
    {
      "name": "World’s Greatest Striker",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e1-dream",
        "episode": 1,
        "timestamp": "10:52",
        "note": "Ego explicitly identifies Noa with this title before quoting his football philosophy."
      }
    },
    {
      "name": "Cyborg",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 163,
        "url": "https://www.hellominju.com/2025/08/BlueLock163.html",
        "note": "Checked chapter-163 speaker/subject dialogue context: サイボーグデータ野郎. Lavinho addresses Noel Noa during their on-field reunion; repeated directly as サイボーグ in chapter 164. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    }
  ],
  "4": [
    {
      "name": "Blunt Bangs",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e13-top3",
        "episode": 13,
        "timestamp": "02:53",
        "note": "Aryu tells Tokimitsu to mark Bachira using this nickname; repeated by Barou and Team V."
      }
    },
    {
      "name": "Bob Cut",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e13-top3",
        "timestamp": "20:46",
        "note": "Rin addresses Bachira after choosing him. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 13
      }
    },
    {
      "name": "King Dribbler",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 315,
        "url": "https://kmanga.kodansha.com/title/10008/episode/360767",
        "originalLanguage": "ja",
        "originalText": "キングドリブラー蜂楽廻",
        "note": "The match commentator names Bachira King Dribbler after the opening Nigeria goal. Speaker, player and goal context cross-checked in the chapter-315 Japanese dialogue reference: https://www.hellominju.com/2025/08/BlueLock315.html . Official publisher chapter identity verified; English title is a project rendering, not a claim of licensed-English speech-bubble transcription."
      }
    }
  ],
  "6": [
    {
      "name": "Hero",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e19-dancing-boy",
        "episode": 19,
        "timestamp": "02:19",
        "note": "Chigiri addresses Kunigami as hero before joining the opposing team."
      }
    },
    {
      "name": "Wild Card",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 155,
        "url": "https://www.hellominju.com/2025/08/BlueLock155.html",
        "note": "Ego’s chapter-155 introduction explicitly labels the returning Kunigami Wild Card (ワイルドカード)."
      }
    },
    {
      "name": "Hyena Hero",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 187,
        "url": "https://www.hellominju.com/2025/03/BlueLock187.html",
        "note": "Checked chapter-187 speaker/subject dialogue context: ハイエナヒーロー. Isagi directly addresses Kunigami after arguing about the goal. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    }
  ],
  "7": [
    {
      "name": "Princess",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e19-dancing-boy",
        "episode": 19,
        "timestamp": "07:04",
        "note": "Isagi explicitly refers to Chigiri as the selfish princess; the nickname is also used directly in dialogue."
      }
    },
    {
      "name": "Little Miss Redhead",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e10-just-the-way-it-is",
        "timestamp": "14:57",
        "note": "Zantetsu directly addresses Chigiri. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 10
      }
    },
    {
      "name": "Red Panther",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 193,
        "url": "https://www.hellominju.com/2025/03/BlueLock193.html",
        "note": "Isagi's internal narration explicitly identifies Chigiri as 赤豹 with レッドパンサー furigana. The chapter-193 manga panel was visually checked; the title is printed over Chigiri's run and panther aura."
      }
    }
  ],
  "14": [
    {
      "name": "Li’l Genius",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/36-flowers",
        "episode": 36,
        "timestamp": "06:59",
        "note": "Aiku directly addresses Sae as Li’l Genius; later dialogue repeats the reference."
      }
    },
    {
      "name": "Japan's Greatest Treasure",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "url": "https://times.abema.tv/articles/-/10044900",
        "note": "ABEMA official anime distribution/editorial profile explicitly transcribes the official EGOIST BIBLE epithet field as 日本の至宝 and attributes the profile to that book. Independently cross-checked against broadcaster TV Asahi official account, https://x.com/tv_asahi_shop/status/1711516899727782370, using #日本の至宝 for Sae. English is the project rendering of the official Japanese title, not a newly invented fan alias."
      }
    }
  ],
  "15": [
    {
      "name": "King",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e3-soccers-zero",
        "episode": 3,
        "timestamp": "06:42",
        "note": "Barou explicitly declares himself the king on the field."
      }
    },
    {
      "name": "Maid Barou",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e16-tri-fusion",
        "episode": 16,
        "timestamp": "00:45",
        "note": "Isagi and Nagi give Barou the nickname while he cleans their shared room."
      }
    },
    {
      "name": "King of the Heels",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e21-im-not-there",
        "episode": 21,
        "timestamp": "12:11",
        "note": "Nagi uses this title for Barou after his predatory change of playing style; Isagi repeats it at 12:30."
      }
    },
    {
      "name": "Bad Boy",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 204,
        "url": "https://www.hellominju.com/2025/02/BlueLock204.html",
        "note": "Checked chapter-204 speaker/subject dialogue context: この悪童、馬狼照英. Noa explicitly identifies Baro with this title while announcing his top bid; Snuffy repeats the direct nickname in chapter 227. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    }
  ],
  "22": [
    {
      "name": "Stupid Zantetsu",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e9-awakening",
        "episode": 9,
        "timestamp": "05:17",
        "note": "Nagi directly uses the repeated nickname for Zantetsu; Reo uses it later in the same episode."
      }
    },
    {
      "name": "Stupid Specs",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e9-awakening",
        "note": "Chigiri addresses Zantetsu in their speed contest; wording cross-checked against the episode transcript. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 9
      }
    }
  ],
  "28": [
    {
      "name": "the Assassin",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/26-the-assassin-and-the-ninja",
        "episode": 26,
        "timestamp": "11:14",
        "note": "Hiori explicitly introduces Karasu by this alias."
      }
    }
  ],
  "29": [
    {
      "name": "Ninja",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "episode": 31,
        "timestamp": "04:26",
        "note": "Darai directly addresses Otoya by this nickname while marking him."
      }
    }
  ],
  "30": [
    {
      "name": "One-on-One Emperor",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/28-chameleon",
        "episode": 28,
        "timestamp": "11:01",
        "note": "Reo’s analysis explicitly identifies Yukimiya by this title."
      }
    },
    {
      "name": "Yukki",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/28-chameleon",
        "episode": 28,
        "timestamp": "12:45",
        "note": "Yukimiya explicitly tells Nagi he can call him Yukki."
      }
    },
    {
      "name": "Mr. Four-Eyes",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/28-chameleon",
        "episode": 28,
        "timestamp": "12:14",
        "note": "Nagi directly addresses Yukimiya after taking the goal; repeated at 12:38. Official English Crunchyroll subtitle transcript; direct canon usage."
      }
    }
  ],
  "34": [
    {
      "name": "The Scion of Royale",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e23-luck",
        "episode": 23,
        "timestamp": "14:57",
        "note": "The on-screen introduction displays this title beside Leonardo Luna; Tokimitsu repeats it."
      }
    }
  ],
  "35": [
    {
      "name": "Baby Freckles",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e23-luck",
        "episode": 23,
        "timestamp": "15:08",
        "note": "The on-screen introduction displays this title beside Pablo."
      }
    }
  ],
  "36": [
    {
      "name": "The Goal Junkie",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e23-luck",
        "episode": 23,
        "timestamp": "15:03",
        "note": "The on-screen introduction displays this title beside Adam Blake."
      }
    }
  ],
  "37": [
    {
      "name": "The Heavy Tank",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e23-luck",
        "episode": 23,
        "timestamp": "15:13",
        "note": "The on-screen introduction displays this title beside Dada Silva."
      }
    }
  ],
  "38": [
    {
      "name": "Child Prodigy",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e24-the-time-has-come",
        "episode": 24,
        "timestamp": "03:42",
        "note": "Isagi explicitly recognizes Loki by this title after his rapid goal."
      }
    },
    {
      "name": "God Sprinter",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 155,
        "url": "https://www.hellominju.com/2025/08/BlueLock155.html",
        "note": "Ego’s master-striker introduction explicitly gives Loki the title God Sprinter (ゴッドスプリンター)."
      }
    }
  ],
  "50": [
    {
      "name": "The Magician",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 162,
        "url": "https://www.hellominju.com/2025/08/BlueLock162.html",
        "note": "Isagi explicitly identifies Ness as 魔術師・ネス in the original chapter-162 dialogue, naming the rational magic of his ankle technique."
      }
    },
    {
      "name": "Bastard München's Heart",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 162,
        "url": "https://www.hellominju.com/2025/08/BlueLock162.html",
        "note": "Checked chapter-162 speaker/subject dialogue context: バスタード・ミュンヘンの心臓、魔術師・ネス. Isagi identifies Ness by both this title and Magician while analyzing the attack. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    }
  ],
  "52": [
    {
      "name": "Danceman",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 155,
        "url": "https://www.hellominju.com/2025/08/BlueLock155.html",
        "note": "Ego’s introduction explicitly gives Lavinho the title Danceman (舞踏技師 / ダンスマン)."
      }
    }
  ],
  "53": [
    {
      "name": "Perfect Hero",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 155,
        "url": "https://www.hellominju.com/2025/08/BlueLock155.html",
        "note": "Ego explicitly introduces Chris Prince as Perfect Hero (パーフェクト・ヒーロー)."
      }
    }
  ],
  "54": [
    {
      "name": "Doctor",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Chapter_179",
        "chapter": 179,
        "note": "Chris explicitly calls Agi the doctor while introducing his analysis role; chapter-specific dialogue context, not an editorial profile epithet."
      }
    }
  ],
  "55": [
    {
      "name": "Victory Wayfarer",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 155,
        "url": "https://www.hellominju.com/2025/08/BlueLock155.html",
        "note": "Ego’s introduction gives Snuffy the title 勝利の旅人, rendered Victory Wayfarer in English; this is a stated title rather than a club-based inference."
      }
    },
    {
      "name": "Crown Messenger",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 155,
        "url": "https://www.hellominju.com/2025/08/BlueLock155.html",
        "note": "The same introduction explicitly names Crown Messenger (王冠配達士 / クラウン・メッセンジャー)."
      }
    },
    {
      "name": "Royal Messenger",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "url": "https://comics.inkr.com/title/4919-blue-lock-26",
        "note": "The official Kodansha USA Volume 26 description on its licensed English distributor explicitly calls Snuffy Royal Messenger. Publisher credits and copyright checked. Preserve Crown Messenger and Victory Wayfarer as their existing verified variants."
      }
    },
    {
      "name": "The Phoenix",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 229,
        "url": "https://www.hellominju.com/2025/01/BlueLock229.html",
        "note": "Checked chapter-229 speaker/subject dialogue context: 不死鳥スナッフィー. Peron calls Snuffy the Phoenix on hearing his decision to continue playing. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    }
  ],
  "56": [
    {
      "name": "Ace Eater",
      "verified": true,
      "source": {
        "type": "manga",
        "url": "https://kmanga.kodansha.com/title/10008/episode/318983",
        "chapter": 210,
        "note": "The publisher’s official chapter-210 title is ACE EATER, introducing Lorenzo; the same title is explicitly attached to him in the chapter’s recognition dialogue."
      }
    },
    {
      "name": "Zombie",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 214,
        "url": "https://www.hellominju.com/2025/02/BlueLock214.html",
        "note": "Isagi directly addresses Lorenzo as ゾンビ野郎, referencing Lorenzo's established zombie movement. Checked chapter-214 dialogue and the speaker/subject context. This is the short alias, not a quotation or a claimed official English speech-bubble transcription."
      }
    }
  ],
  "70": [
    {
      "name": "Aomori's Messi",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e14-the-geniuses-and-the-average-joes",
        "episode": 14,
        "timestamp": "07:46",
        "note": "Naruhaya names Nishioka by this nickname while describing the team they lost to."
      }
    }
  ],
  "5": [
    {
      "name": "Igaguri",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e2-monster",
        "timestamp": "04:23",
        "note": "Kira directly names Igarashi by this nickname. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 2
      }
    }
  ],
  "23": [
    {
      "name": "Rin-chan",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e13-top3",
        "timestamp": "03:11",
        "note": "Bachira addresses Rin by this nickname. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 13
      }
    },
    {
      "name": "Rin-Rin",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/28-chameleon",
        "timestamp": "13:24",
        "note": "Shido addresses Rin, who explicitly repeats and rejects the nickname at 13:29. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 28
      }
    },
    {
      "name": "Bottom Eyelash Jerk",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/26-the-assassin-and-the-ninja",
        "timestamp": "19:56",
        "note": "Shido directly addresses Rin; normalized title capitalization. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 26
      }
    },
    {
      "name": "The Beast",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 321,
        "url": "https://www.hellominju.com/2025/10/BlueLock321.html",
        "note": "After Rin’s Nigeria goal, Isagi directly addresses Rin as 破壊獣(ビースト). The Beast preserves the canonical katakana reading and actual speaker/subject context, rather than deriving an alias from an aura image."
      }
    }
  ],
  "21": [
    {
      "name": "Hassle Monster",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "timestamp": "23:38",
        "note": "Reo addresses Nagi while describing their relationship. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 31
      }
    },
    {
      "name": "Super Controller",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "timestamp": "06:02",
        "note": "Nio addresses Nagi during his press. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 31
      }
    }
  ],
  "20": [
    {
      "name": "Chameleon",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/28-chameleon",
        "timestamp": "17:45",
        "note": "Reo explicitly names his new play style and established identity. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 28
      }
    },
    {
      "name": "King-of-All-Trades",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "chapter": 106,
        "url": "https://kmanga.kodansha.com/title/10008/episode/318879",
        "originalLanguage": "ja",
        "originalText": "器用大富豪",
        "note": "Reo explicitly asks to be called this rather than a jack-of-all-trades in chapter 106 / anime 28. Licensed distributor ABEMA independently quotes the original Japanese address; existing Chameleon alias is retained.",
        "corroboratingUrls": [
          "https://times.abema.tv/articles/-/10054915",
          "https://bluelock.fandom.com/wiki/Chapter_106"
        ]
      }
    }
  ],
  "31": [
    {
      "name": "Devil Boy",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/34-the-subs-take-to-the-stage",
        "timestamp": "05:15",
        "note": "Sae directly addresses Shido. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 34
      }
    },
    {
      "name": "Devil",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/33-night-snow",
        "timestamp": "11:35",
        "note": "Aiku refers to Shido as the remaining reason his team can win. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 33
      }
    },
    {
      "name": "Antenna-Head",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/28-chameleon",
        "episode": 28,
        "timestamp": "13:23",
        "note": "Rin directly addresses Shido before the counterattack. Title capitalization is normalized. Official English Crunchyroll subtitle transcript; direct canon usage."
      }
    },
    {
      "name": "Pink Devil",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 253,
        "url": "https://www.hellominju.com/2024/11/BlueLock253.html",
        "note": "The match commentator explicitly identifies Shido as ピンクの悪魔 when announcing his diving-header goal. Checked chapter-253 narration and goal/speaker context; not a fandom nickname."
      }
    }
  ],
  "46": [
    {
      "name": "Mannequin Muscleman",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "timestamp": "07:52",
        "note": "Aryu addresses Cho before the pass to Kitsunezato. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 31
      }
    }
  ],
  "27": [
    {
      "name": "Little Boy Light Blue",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/34-the-subs-take-to-the-stage",
        "timestamp": "18:08",
        "note": "Darai directly addresses Hiori. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 34
      }
    },
    {
      "name": "Hiorin",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/37-not-alone",
        "timestamp": "19:55",
        "note": "Bachira praises Hiori by this nickname. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 37
      }
    }
  ],
  "41": [
    {
      "name": "Dobermann",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "timestamp": "06:22",
        "note": "Nio explicitly tells Nagi to call him Dobermann. Official English Crunchyroll transcript; direct canon usage.",
        "episode": 31
      }
    }
  ],
  "9": [
    {
      "name": "Shark Teeth",
      "verified": true,
      "source": {
        "type": "anime-film-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/0-blue-lock-the-movie-episode-nagi",
        "timestamp": "51:38",
        "note": "Reo directly addresses Raichi. Official English Crunchyroll transcript; direct canon usage.",
        "film": "Blue Lock the Movie: Episode Nagi"
      }
    }
  ],
  "8": [
    {
      "name": "Topknot",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/35-what-you-taught-us",
        "episode": 35,
        "timestamp": "06:36",
        "note": "Shido directly addresses Gagamaru after his rushing header. Official English Crunchyroll subtitle transcript; direct canon usage."
      }
    },
    {
      "name": "Mr. Super Reaction",
      "verified": true,
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "episode": 31,
        "timestamp": "12:48",
        "note": "Aryu directly addresses Gagamaru while praising his save. Official English Crunchyroll subtitle transcript; direct canon usage."
      }
    },
    {
      "name": "Japan's Guardian Deity",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 317,
        "url": "https://www.hellominju.com/2025/09/BlueLock317.html",
        "note": "Checked chapter-317 speaker/subject dialogue context: 俺が日本の守護神だ. Gagamaru explicitly identifies himself as Japan’s guardian after stopping Nigeria; the original illustrated panel was inspected. English title is a project rendering of the canonical Japanese designation, not an official-English dialogue quotation."
      }
    }
  ],
  "49": [
    {
      "name": "Emperor",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 221,
        "url": "https://www.hellominju.com/2025/01/BlueLock221.html",
        "note": "Aiku directly addresses Kaiser as 皇帝ちゃん after the bicycle goal. Chapter-221 speaker/subject context was checked; Kodansha's official Full Color Selection 3 publisher description also identifies Kaiser as the emperor of the pitch."
      }
    },
    {
      "name": "Superstar",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 266,
        "url": "https://www.hellominju.com/2024/11/BlueLock266.html",
        "note": "Isagi calls Kaiser 超英雄 with スーパースター reading after his Magnus goal. This is an actual internal-monologue title, not merely the chapter title; checked chapter-266 dialogue context. Kodansha's official Full Color Selection contents independently identifies chapter 266 as Super Star."
      }
    },
    {
      "name": "Bastard München U-20 Ace",
      "verified": true,
      "source": {
        "type": "official-profile",
        "url": "https://tv.bluelock-pr.com/character/",
        "originalLanguage": "ja",
        "originalText": "「バスタード・ミュンヘン」U-20チームのエースフォワード",
        "note": "Official NEL anime profile identifies Kaiser as the club U-20 ace forward. Included under the same explicit school/club/national-team ace-title standard as Senno’s Ace and Japan U-20 Ace; not inferred from his position."
      }
    }
  ],
  "57": [
    {
      "name": "Contrarian",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 246,
        "url": "https://www.hellominju.com/2024/12/BlueLock246.html",
        "note": "Charles explicitly calls himself 天邪鬼 while resisting Loki's instructions; Loki repeats the characterization in chapter 252. Checked chapter-246 dialogue and the illustrated Charles/Loki conversation. English alias describes the canon self-designation; no dialogue is retranslated or displayed as a quote."
      }
    }
  ],
  "16": [
    {
      "name": "The Watchtower",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "url": "https://us.oricon-group.com/news/2163/",
        "note": "ORICON NEWS character guide explicitly reports Ego calling Niko the greatest watchtower of Blue Lock while assigning the center-back role. Speaker, player, and U-20 selection context checked; this is attributed canon usage, not the Wiki alias field or an editorial role descriptor."
      }
    }
  ],
  "79": [
    {
      "name": "Genius of Lies",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "url": "https://h-snufkin.com/bluelock-episodenagi-27/",
        "note": "Episode Nagi chapter 27, FAKE & REAL: inspected the original Japanese panel identifying Himizu as 嘘を見抜く天才 (a genius at seeing through lies). This designates Himizu’s lie-reading ability; it does not mean inventing lies. The established English short alias is retained as a project title rendering.",
        "chapter": 27,
        "series": "Blue Lock: Episode Nagi"
      }
    },
    {
      "name": "Fake Master",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "url": "https://h-snufkin.com/bluelock-episodenagi-27/",
        "note": "Episode Nagi chapter 27: Himizu explicitly identifies himself with 偽蹴作達人(フェイク・マスター) after the Chigiri duel; speaker/action context checked. English is the romanized canonical reading, not an invented fan nickname.",
        "chapter": 27,
        "series": "Blue Lock: Episode Nagi"
      }
    }
  ],
  "25": [
    {
      "name": "Muscle Bullet",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "url": "https://us.oricon-group.com/news/2271/",
        "note": "ORICON NEWS character guide (30 October 2024) identifies Muscle Bullet as Tokimitsu’s nickname in the context of his physicality. Independently cross-checked with chapter-48 Isagi/Tokimitsu duel references: Isagi compares Tokimitsu to a muscle bullet. This is a canon comparison/title, not a fan-made epithet."
      }
    }
  ],
  "17": [
    {
      "name": "Senno's Ace",
      "verified": true,
      "source": {
        "type": "anime",
        "episode": 1,
        "url": "https://www.springfieldspringfield.co.uk/view_episode_scripts.php?episode=s01e01&tv-show=blue-lock-2022",
        "note": "Episode 1, arrival at Blue Lock: Isagi recognizes Okawa as Sennou’s star player, immediately before identifying Ishikari and Nishioka. Speaker, subject and school context checked in the episode transcript. English short alias renders this canon school-ace designation; it is not an invented fan nickname."
      }
    }
  ],
  "24": [
    {
      "name": "Giant of Beauty",
      "verified": true,
      "source": {
        "type": "official-profile",
        "url": "https://x.com/BLUELOCK_WM/status/1676864312395304964",
        "note": "Official BLUELOCK_WM character Q&A, July 6, 2023. Question explicitly asks for an epithet. The original image was inspected: Aryu says 美の巨人. English is a project translation of the official Japanese title, not a fan nickname. The frequently circulated God of Glam wording is not independently asserted as a separate alias."
      }
    }
  ],
  "33": [
    {
      "name": "Dance Battle Footballer",
      "verified": true,
      "source": {
        "type": "official-profile",
        "url": "https://x.com/BLUELOCK_WM/status/1973657698454679911",
        "note": "Official BLUELOCK_WM character Q&A, October 2, 2025. Question explicitly asks for an epithet. Original publisher image inspected: speech identifies Kiyora as ダンスバトル・フットボーラー. This confirms the character-book designation directly rather than relying on a wiki."
      }
    }
  ],
  "48": [
    {
      "name": "Japan U-20 Ace",
      "verified": true,
      "source": {
        "type": "official-profile",
        "url": "https://tv.bluelock-pr.com/tv2nd/news/120/",
        "originalLanguage": "ja",
        "originalText": "U-20日本代表のエース。",
        "note": "Official anime character profile published 2024-06-24 explicitly identifies Sendo as the Japan U-20 ace. Historical title of the original Japan U-20 lineup, not a claim about the current post-NEL team."
      }
    }
  ],
  "67": [
    {
      "name": "Worthless Puppet",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 352,
        "url": "https://kmanga.kodansha.com/title/10008/episode/366476",
        "originalLanguage": "ja",
        "originalText": "ザコ人形（ドール）",
        "note": "Teddy explicitly identifies himself as an ego-less worthless puppet during his introduction; retained quote for player 67 records the same self-designation. Official Japanese chapter title verified at https://pocket.shonenmagazine.com/title/00617/episode/440724 ; official English chapter title is WORTHLESS PUPPET. Original Japanese self-identification panel inspected; speaker/subject context cross-checked at https://h-snufkin.com/bluelock-en/manga-chapter-352/ . This is actual self-designation, not an alias inferred solely from the chapter title."
      }
    },
    {
      "name": "Rainbow Knight",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 356,
        "url": "https://kmanga.kodansha.com/title/10008/episode/367369",
        "originalLanguage": "ja",
        "originalText": "七色騎士",
        "note": "Official chapter-356 English title is RAINBOW KNIGHT; the chapter’s Teddy-focused introduction and corroborating recap identify it as his football moniker, not an unrelated chapter title.",
        "corroboratingUrls": [
          "https://otakukart.com/blue-lock-chapter-356-spoilers-summary/",
          "https://amcanime.com/blue-lock-356-spoilers-rainbow-knight/"
        ]
      }
    }
  ],
  "18": [
    {
      "name": "Double Aces of Rajitsu Tech",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "chapter": 19,
        "url": "https://pocket.shonenmagazine.com/title/00617/episode/237642",
        "note": "A shared moniker for Junichi and Keisuke during Chigiri’s school flashback in chapter 19. It applies to the pair, not a claim that either is the sole ace. Canon chapter synopsis and both character histories corroborate the wording.",
        "corroboratingUrls": [
          "https://bluelock.fandom.com/wiki/Chapter_19",
          "https://bluelock.fandom.com/wiki/Keisuke_Wanima/Synopsis",
          "https://bluelock.fandom.com/wiki/Junichi_Wanima/Synopsis"
        ]
      }
    }
  ],
  "19": [
    {
      "name": "Double Aces of Rajitsu Tech",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "chapter": 19,
        "url": "https://pocket.shonenmagazine.com/title/00617/episode/237642",
        "note": "A shared moniker for Junichi and Keisuke during Chigiri’s school flashback in chapter 19. It applies to the pair, not a claim that either is the sole ace. Canon chapter synopsis and both character histories corroborate the wording.",
        "corroboratingUrls": [
          "https://bluelock.fandom.com/wiki/Chapter_19",
          "https://bluelock.fandom.com/wiki/Keisuke_Wanima/Synopsis",
          "https://bluelock.fandom.com/wiki/Junichi_Wanima/Synopsis"
        ]
      }
    }
  ],
  "62": [
    {
      "name": "Luminous",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 317,
        "url": "https://kmanga.kodansha.com/title/10008/episode/360911",
        "originalLanguage": "ja",
        "originalText": "希望の光（ルミナス）",
        "note": "Kuso addresses Onazi by this moniker in chapter 317, both in their shared past and during the match. The Japanese dialogue transcription and independently illustrated character reference corroborate it; it is not an invented stamina nickname.",
        "corroboratingUrls": [
          "https://www.hellominju.com/2025/09/BlueLock317.html",
          "https://h-snufkin.com/bluelock-character-profile-onazi/"
        ]
      }
    }
  ],
  "64": [
    {
      "name": "Butterfly Lashes",
      "verified": true,
      "source": {
        "type": "canon-reference",
        "chapter": 341,
        "url": "https://kmanga.kodansha.com/title/10008/episode/363939",
        "originalLanguage": "ja",
        "originalText": "蝶まつげ",
        "note": "Reo’s in-match address to Hugo in chapter 341. Corroborated English chapter transcription (Butterfly Lashes), an independent contemporary reader report (Lashy-Boy, same nickname), and Japanese discussion (蝶まつげ). English is a project rendering, not a claim that all licensed editions use identical wording. A complete Japanese dialogue panel was not retrievable in this audit.",
        "corroboratingUrls": [
          "https://www.scribd.com/document/1026211439/341",
          "https://bluelock.fandom.com/f/p/4400000000000802856",
          "https://note.com/sawj74405990/n/nb07bac15af87"
        ]
      }
    }
  ],
  "66": [
    {
      "name": "Iron Man",
      "verified": true,
      "source": {
        "type": "manga",
        "chapter": 359,
        "url": "https://s.kmanga.kodansha.com/ldg?e=367879&t=10008",
        "originalLanguage": "ja",
        "originalText": "鉄人兵（アイアンマン）",
        "note": "Inspected the Japanese chapter-359 introduction panel: the ruby explicitly reads Iron Man (アイアンマン), rather than inferring a new epithet from his physique. 鉄人兵 is the accompanying kanji.",
        "corroboratingUrls": [
          "https://h-snufkin.com/bluelock-episode359/",
          "https://www.animatetimes.com/news/details.php?id=1788831911"
        ]
      }
    }
  ]
}
);
function verifiedPlayerAliases(playerId){return (PLAYER_ALIASES[Number(playerId)]||[]).filter(alias=>alias?.verified===true&&typeof alias.name==="string"&&alias.name.trim()&&alias.source?.url&&alias.source?.note);}
function playerAliasesMarkup(player){const aliases=verifiedPlayerAliases(player.id);return aliases.length?`<p class="player-aliases">${aliases.map(alias=>`<span>${esc(alias.name)}</span>`).join(" · ")}</p>`:"";}

// Short exact canon dialogue. Original wording and internal source context are retained.
const PLAYER_QUOTES=Object.freeze([
    {"playerId": 60, "text": "I'm Haneru Shindo, from AAA in the Dutch second division.", "verified": true, "sourceType": "manga", "chapter": 327, "sourceReference": "https://pocket.shonenmagazine.com/title/00617/episode/428361", "sourceNote": "Japanese speech bubble inspected in the chapter-327 introduction panel: オランダリーグ2部 AAA所属「新導ハネル」だ. Speaker/name plate confirms Shindo. Panel cross-check: https://h-snufkin.com/bluelock-episode327/ . English and display locales are project translations of verified Japanese dialogue, not official-English wording.", "language": "en", "originalLanguage": "ja", "originalText": "オランダリーグ2部 AAA所属「新導ハネル」だ", "localization": "project-translation-Japanese-manga"},
    {"playerId":3,"text":"it feels better to pull off a hat trick and lose 3-4.","verified":true,"sourceType":"anime","episode":1,"timestamp":"10:46","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e1-dream","sourceNote":"Exact second subtitle line of the Noa quotation. Ego begins quoting at 10:43 and explicitly attributes these words to Noel Noa at 10:52; this is reported canon dialogue, not Ego’s own claim.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":1,"text":"Become the one who chooses, not the one waiting to be chosen.","verified":true,"sourceType":"anime","episode":19,"timestamp":"03:55","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e19-dancing-boy","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Isagi, at 03:55. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":4,"text":"I'm going to be the monster!","verified":true,"sourceType":"anime","episode":22,"timestamp":"20:21","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e22-voice","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Bachira/I, at 20:21. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":5,"text":"I'm what people call a \"useful monk.\"","verified":true,"sourceType":"anime","episode":28,"timestamp":"08:47","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/28-chameleon","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker IGARASHI, at 08:47. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":6,"text":"I'm gonna be a soccer superhero.","verified":true,"sourceType":"anime","episode":4,"timestamp":"05:53","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e4-premonition-and-intuition","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Kunigami, at 05:53. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":7,"text":"I'm going to run until this leg of mine no longer works.","verified":true,"sourceType":"anime","episode":7,"timestamp":"17:01","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e7-rush","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Chigiri, at 17:01. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":8,"text":"I can't use my hands, so here's a dashing-out header!","verified":true,"sourceType":"anime","episode":35,"timestamp":"06:37","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/35-what-you-taught-us","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker GAGAMARU, at 06:37. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":9,"text":"Keep attacking until you're dead! Go all-out, morons!","verified":true,"sourceType":"anime","episode":10,"timestamp":"07:32","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e10-just-the-way-it-is","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Raichi, at 07:32. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":10,"text":"There are some dreams that don't come true.","verified":true,"sourceType":"anime","episode":15,"timestamp":"18:33","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e15-devour","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Naruhaya/I, at 18:33. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":12,"text":"In the end, I was the only one playing soccer seriously.","verified":true,"sourceType":"anime","episode":10,"timestamp":"13:07","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e10-just-the-way-it-is","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Kuon/I, at 13:07. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":14,"text":"A striker's value lies only in their ability to score goals.","verified":true,"sourceType":"anime","episode":31,"timestamp":"12:03","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker SAE, at 12:03. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":15,"text":"I found a way to dominate the field as the villain.","verified":true,"sourceType":"anime","episode":18,"timestamp":"16:58","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e18-the-stage-for-the-lead","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Barou, at 16:58. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":16,"text":"You may manage to stop me, but you can't stop my ideas.","verified":true,"sourceType":"anime","episode":5,"timestamp":"02:07","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e5-to-be-reborn","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Niko, at 02:07. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":20,"text":"I wanted a treasure that would be mine and mine alone...","verified":true,"sourceType":"anime","episode":8,"timestamp":"04:34","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e8-the-formula-for-goals","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Reo/I, at 04:34. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":21,"text":"If my talents were at your level, I would've quit soccer by now.","verified":true,"sourceType":"anime","episode":9,"timestamp":"16:29","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e9-awakening","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Nagi, at 16:29. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":22,"text":"I'll slice open a path to the goal again.","verified":true,"sourceType":"anime","episode":9,"timestamp":"11:14","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e9-awakening","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Zantetsu, at 11:14. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":23,"text":"To me, soccer is a fight to the death.","verified":true,"sourceType":"anime","episode":13,"timestamp":"06:04","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e13-top3","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Rin, at 06:04. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":24,"text":"I will score glam goals and win the game for us.","verified":true,"sourceType":"anime","episode":20,"timestamp":"00:30","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e20-super-link-up-play","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Aryu, at 00:30. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":25,"text":"Without a goal, I feel insecure.","verified":true,"sourceType":"anime","episode":13,"timestamp":"09:11","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e13-top3","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Tokimitsu, at 09:11. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":27,"text":"If yer thinkin' then movin', you'll always be too late.","verified":true,"sourceType":"anime","episode":27,"timestamp":"12:40","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/27-the-world-you-feel","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker HIORI, at 12:40. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":28,"text":"Target your opponent's weakness, not his strength.","verified":true,"sourceType":"anime","episode":26,"timestamp":"09:59","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/26-the-assassin-and-the-ninja","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker KARASU, at 09:59. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":29,"text":"Try to outrun me, Mr. Genius's Little Bro.","verified":true,"sourceType":"anime","episode":26,"timestamp":"14:40","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/26-the-assassin-and-the-ninja","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker OTOYA, at 14:40. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":30,"text":"Soccer is fundamentally played one-on-one.","verified":true,"sourceType":"anime","episode":28,"timestamp":"10:24","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/28-chameleon","sourceNote":"Exact Crunchyroll English subtitle line in episode 28, spoken by Yukimiya at 10:24 as he explains his one-on-one football philosophy.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":31,"text":"Every single cell in my body exists to score goals!","verified":true,"sourceType":"anime","episode":35,"timestamp":"04:39","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/35-what-you-taught-us","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker SHIDOU/I, at 04:39. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":34,"text":"You've just got tunnel vision from a lack of experience.","verified":true,"sourceType":"anime","episode":24,"timestamp":"04:19","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e24-the-time-has-come","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Luna, at 04:19. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":38,"text":"But I'm fast.","verified":true,"sourceType":"anime","episode":24,"timestamp":"03:36","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e24-the-time-has-come","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker Loki, at 03:36. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":40,"text":"I'm never gonna play soccer for someone else again.","verified":true,"sourceType":"anime","episode":36,"timestamp":"04:51","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/36-flowers","sourceNote":"Exact Crunchyroll English subtitle line in the timestamped episode transcript; speaker AIKU/I, at 04:51. Dialogue and speaker context checked; no retranslation.","language":"en","originalLanguage":"ja","localization":"official-English-anime"},
    {"playerId":49,"text":"MY NAME’S KAISER... AND I DO THE IMPOSSIBLE.","verified":true,"sourceType":"manga","chapter":156,"sourceReference":"https://www.uniqlo.com/my/en/products/E487922-000/00","sourceNote":"Exact English wording and punctuation printed by the official Kodansha-licensed UNIQLO BLUE LOCK UT collection, product 487922. Its English description explicitly attributes the line to Kaiser. Chapter-156 introduction/spoken Japanese context cross-checked against https://www.hellominju.com/2025/08/BlueLock156.html. This earlier identity/football-philosophy line is more representative than the retained episode-38 command. Licensed English wording is preserved verbatim rather than retranslated.","language":"en","originalLanguage":"ja","localization":"official-English-manga","englishEdition":"Kodansha-licensed UNIQLO UT English quotation","previousQuote":{"playerId":49,"text":"Get down on your damn knees, Blue Lock.","verified":true,"sourceType":"anime","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/38-last-attack","sourceNote":"Exact official English subtitle wording in the final Kaiser scene of episode 38; previously verified transcript and cross-checked against the English anime quote record. No translation or paraphrase.","language":"en","originalLanguage":"ja","localization":"official-English-anime","episode":38,"timestamp":"23:44"}},
    {"playerId":2,"text":"Even so, how can you know anything about me in just two minutes?","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-anime","sourceType":"anime","episode":2,"timestamp":"05:18","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e2-monster","sourceNote":"Exact English Crunchyroll subtitle line; timestamp and speaker context cross-checked in the episode transcript. Display only the dialogue."},
    {"playerId":11,"text":"At long last, I can take my first steps as a striker...","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-anime","sourceType":"anime","episode":19,"timestamp":"24:14","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/e19-dancing-boy","sourceNote":"Exact English Crunchyroll subtitle line; timestamp and speaker context cross-checked in the episode transcript. Display only the dialogue."},
    {"playerId":41,"text":"Super Controller, I ain't giving you any freedom.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-anime","sourceType":"anime","episode":31,"timestamp":"06:02","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae","sourceNote":"Exact English Crunchyroll subtitle line; timestamp and speaker context cross-checked in the episode transcript. Display only the dialogue."},
    {"playerId":48,"text":"I'm not handing my spot over to some newbies called Blue Lock or whatever it is.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-anime","sourceType":"anime","episode":37,"timestamp":"14:04","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/37-not-alone","sourceNote":"Exact English Crunchyroll subtitle line; timestamp and speaker context cross-checked in the episode transcript. Display only the dialogue."},
    {"playerId":13,"text":"My greatest weapon is my speed and technique!","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":9,"sourceReference":"https://bluelock.fandom.com/wiki/Yudai_Imamura","sourceNote":"English manga dialogue attributed to Imamura during Team Z's weapon discussion; chapter reference checked against his canon appearance."},
    {"playerId":26,"text":"Let's go, Isagi. I've decided to follow you.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":177,"sourceReference":"https://bluelock.fandom.com/wiki/Ranze_Kurona","sourceNote":"English manga wording recorded for Kurona's decision to support Isagi; reference identifies Chapter 177."},
    {"playerId":32,"text":"It's finally our time to shine.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-anime","sourceType":"anime","episode":26,"timestamp":"04:14","sourceReference":"https://subs.yakuaru.com/books/blue-lock/page/26-the-assassin-and-the-ninja","sourceNote":"Exact English subtitle line from the episode transcript, spoken by Nanase; timestamp and speaker context checked."},
    {"playerId":33,"text":"Until the last minute, not even the gods know who I choose to side with.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":267,"sourceReference":"https://bluelock.fandom.com/wiki/Jin_Kiyora","sourceNote":"English manga dialogue expressing Kiyora's borderline philosophy; chapter context checked against Chapter 267."},
    {"playerId":35,"text":"Your rhythm is dynamic enough, but you don't have enough attack patterns. Your playstyle lacks theatrics.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":92,"sourceReference":"https://bluelock.fandom.com/wiki/Pablo_Cavasoz","sourceNote":"English manga dialogue attributed to Cavasoz while analyzing Bachira; reference identifies Chapter 92."},
    {"playerId":36,"text":"With an opponent that's a developing country when it comes to football, I thought it'd be like taking candy from a baby.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":91,"sourceReference":"https://bluelock.fandom.com/wiki/Adam_Blake","sourceNote":"Complete English sentence from Blake's Chapter 91 internal evaluation; wording kept as recorded by the chapter reference."},
    {"playerId":37,"text":"Damn, they're scrawnier than I thought!","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":90,"sourceReference":"https://bluelock.fandom.com/wiki/Dada_Silva","sourceNote":"English manga dialogue attributed to Dada Silva on meeting the Blue Lock team; reference identifies Chapter 90."},
    {"playerId":44,"text":"Yeah... Let's catch up before halftime.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":121,"sourceReference":"https://bluelock.fandom.com/wiki/Itsuki_Wakatsuki","sourceNote":"English manga dialogue attributed to Wakatsuki during the U-20 match; reference identifies Chapter 121."},
    {"playerId":46,"text":"Just... superb","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":115,"sourceReference":"https://bluelock.fandom.com/wiki/Kento_Cho","sourceNote":"Short English manga reaction attributed to Kento Cho after Sae's pass; Chapter 115 context checked."},
    {"playerId":47,"text":"Don't waste time and keep moving ahead! That's the basics of a counterattack.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":115,"sourceReference":"https://bluelock.fandom.com/wiki/Teru_Kitsunezato","sourceNote":"English manga dialogue attributed to Kitsunezato during Japan U-20's counterattack; Chapter 115 context checked."},
    {"playerId":50,"text":"My ego wants me... to cast a spell on your broken soul.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":301,"sourceReference":"https://bluelock.fandom.com/wiki/Alexis_Ness","sourceNote":"English manga dialogue from Ness to Kaiser in Chapter 301; chapter discussion and character quote record cross-checked."},
    {"playerId":51,"text":"As the vanguard, my destined role is to die... what an amusement.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":159,"sourceReference":"https://bluelock.fandom.com/wiki/Benedict_Grim","sourceNote":"English manga internal dialogue attributed to Grim; reference identifies Chapter 159."},
    {"playerId":52,"text":"No matter what anyone says, I'm the best in the world. I have my own 'world's best' inside me.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":160,"sourceReference":"https://bluelock.fandom.com/wiki/Lavinho","sourceNote":"Representative English excerpt from Lavinho's Chapter 160 lesson about defining one's own image of the world's best."},
    {"playerId":53,"text":"Talent without self-awareness will wither away.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":170,"sourceReference":"https://bluelock.fandom.com/wiki/Chris_Prince","sourceNote":"English manga line from Prince's body-revolution lesson; reference identifies Chapter 170."},
    {"playerId":54,"text":"It's been a while, Kaiser. This time, I'll give you a proper analysis, Mr. Prodigy.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":180,"sourceReference":"https://bluelock.fandom.com/wiki/Agi","sourceNote":"English manga dialogue attributed to Agi while confronting Kaiser; reference identifies Chapter 180."},
    {"playerId":55,"text":"Will you be able to love yourself when you are no longer viewed as a genius?","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":215,"sourceReference":"https://bluelock.fandom.com/wiki/Marc_Snuffy","sourceNote":"English manga dialogue from Snuffy to Baro; reference identifies Chapter 215."},
    {"playerId":56,"text":"Don't get full of yourself after one sneaky goal... Capiché?","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":216,"sourceReference":"https://bluelock.fandom.com/wiki/Don_Lorenzo","sourceNote":"English manga dialogue attributed to Lorenzo after Isagi's goal during Bastard München vs Ubers; chapter context checked."},
    {"playerId":57,"text":"Well, the more you tell me to do something, the less I wanna! Guess that makes me a contrarian.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":246,"sourceReference":"https://bluelock.fandom.com/wiki/Charles_Chevalier","sourceNote":"English manga dialogue from Charles to Loki; reference identifies Chapter 246."},
    {"playerId":58,"text":"A gyro shot... It's falling with backspin!! Crap!! I'm not gonna reach-","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":202,"sourceReference":"https://bluelock.fandom.com/wiki/Rooke","sourceNote":"English manga internal dialogue attributed to Rooke while facing Yukimiya; reference identifies Chapter 202."},
    {"playerId":61,"text":"When I see a joyful person like you ... it makes me want to die!","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":307,"sourceReference":"https://bluelock.fandom.com/wiki/Bunny_Iglesias","sourceNote":"English manga dialogue attributed to Bunny Iglesias; debut/chapter reference identifies Chapter 307."},
    {"playerId":62,"text":"This won't end as a memory. I'm gonna surpass you someday! Just wait, Yoichi Isagi!","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":326,"sourceReference":"https://bluelock.fandom.com/wiki/Innocent_Onazi","sourceNote":"English manga dialogue from Onazi to Isagi after Nigeria vs Japan; reference identifies Chapter 326."},
    {"playerId":63,"text":"This is my curiosity!","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":323,"sourceReference":"https://bluelock.fandom.com/wiki/Godwin_Kuso","sourceNote":"English manga internal declaration attributed to Godwin Kuso; reference identifies Chapter 323."},
    {"playerId":64,"text":"I will win the World Cup four times... and become one of humanity's legends.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":343,"sourceReference":"https://bluelock.fandom.com/wiki/Vivian_Hugo","sourceNote":"English manga dialogue attributed to Hugo; character/chapter references identify Chapter 343."},
    {"playerId":66,"text":"Let's go, Teddy boy.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":364,"sourceReference":"https://kmanga.kodansha.com/title/10008/episode/368828","sourceNote":"Short Lockhart line from the Chapter 364 England combination; chapter identity verified against Kodansha K MANGA and dialogue context cross-checked."},
    {"playerId":67,"text":"I don't have an ego. I'm a puppet. A worthless puppet.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":352,"sourceReference":"https://ww3.bluelockread.com/chapter/blue-lock-chapter-352/","sourceNote":"Teddy Knight's self-description from Chapter 352; chapter title and dialogue context cross-checked against contemporary chapter discussion."},
    {"playerId":69,"text":"What's goin on in here, anyway?","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":327,"sourceReference":"https://bluelock.fandom.com/wiki/Shigeo_Mizuki","sourceNote":"English manga dialogue attributed to Mizuki during Side-B; reference identifies Chapter 327."},
    {"playerId":72,"text":"You are... The Death itself.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":21,"sourceReference":"https://bluelock.fandom.com/wiki/Chapter_21_(Episode_Nagi)","sourceNote":"English dialogue from Hiiragi to Nagi in Blue Lock: Episode Nagi Chapter 21; spin-off chapter and speaker context checked."},
    {"playerId":76,"text":"HNNGH! You're the crux. If I crush you, we win!","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":334,"sourceReference":"https://bluelock.fandom.com/wiki/Bats","sourceNote":"English manga dialogue from Bats to Karasu; reference identifies Chapter 334."},
    {"playerId":77,"text":"Duhdun! Dun duhdun! Ya think Loki's our only striker? Beatdown time.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":340,"sourceReference":"https://bluelock.fandom.com/wiki/Leyden","sourceNote":"English manga dialogue attributed to Leyden during France vs Japan; reference identifies Chapter 340."},
    {"playerId":78,"text":"As expected.","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":331,"sourceReference":"https://bluelock.fandom.com/wiki/Hermes","sourceNote":"Short English manga reaction attributed to Hermes; Chapter 331 context checked."},
    {"playerId":79,"text":"What are they really thinking? I want to know what's real... Tell me what's real!","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":27,"sourceReference":"https://bluelock.fandom.com/wiki/Aiki_Himizu","sourceNote":"English dialogue attributed to Himizu in Blue Lock: Episode Nagi Chapter 27; spin-off manga source and speaker context checked."},
    {"playerId":42,"text":"What? You on to me next?","verified":true,"language":"en","originalLanguage":"ja","localization":"official-English-manga","sourceType":"manga","chapter":144,"sourceReference":"https://bluelock.fandom.com/wiki/Chapter_144","sourceNote":"Short English dialogue attributed to Miroku Darai as Rin reaches the Iron Wall defenders; Chapter 144 matchup context and character quote record cross-checked."}
]);

// Internal follow-up review ledger. Missing verification is recorded honestly;
// it never authorizes a translated, invented or fan-localized visible quote.
const PLAYER_REFERENCE_CONTENT_REVIEW=Object.freeze({
  "chapterLimit": 364,
  "baseCommit": "4af894a7019c2268d1c448a2eb9165364d296aed",
  "sourceAccess": "Manga dialogue/context research was available through chapter 364; many official English readers and the existing subtitle host were inaccessible. All retained quotes retain their previous verification provenance. This is not a claim of full official-English chapter access.",
  "players": {
    "1": {
      "quoteAction": "retain",
      "reason": "Autonomy and choosing teammates already expresses Isagi’s adaptive ego.",
      "mangaCandidates": [
        208,
        283,
        284,
        294
      ],
      "aliasAction": "retain-verified-only"
    },
    "2": {
      "quoteAction": "retain",
      "reason": "Retain the challenge to the opening test; later Side-B material needs verified official English.",
      "mangaCandidates": [
        306,
        351
      ],
      "aliasAction": "retain-verified-only"
    },
    "3": {
      "quoteAction": "retain",
      "reason": "The personal-goals-over-result philosophy remains distinctive; later rationality and rivalry passages need verified English.",
      "mangaCandidates": [
        156,
        159,
        278
      ],
      "aliasAction": "retain-verified-only"
    },
    "4": {
      "quoteAction": "retain",
      "reason": "The monster declaration defines Bachira; freedom training was reconsidered.",
      "mangaCandidates": [
        160,
        161
      ],
      "aliasAction": "retain-verified-only"
    },
    "5": {
      "quoteAction": "retain",
      "reason": "The useful-monk self-description reflects survival and Malicia; the NEL foul-drawing scenes were reconsidered.",
      "mangaCandidates": [
        277,
        280
      ],
      "aliasAction": "retain-verified-only"
    },
    "6": {
      "quoteAction": "retain",
      "reason": "The superhero declaration remains central to the contrast with the Wild Card persona.",
      "mangaCandidates": [
        155,
        158,
        163
      ],
      "aliasAction": "retain-verified-only"
    },
    "7": {
      "quoteAction": "retain",
      "reason": "Running until the leg fails expresses the stakes better than a speed boast.",
      "mangaCandidates": [
        176,
        193
      ],
      "aliasAction": "retain-verified-only"
    },
    "8": {
      "quoteAction": "retain",
      "reason": "Later reflex and animal-instinct passages are opportunities, but no stronger official-English line was verified.",
      "mangaCandidates": [
        217,
        227,
        283
      ],
      "aliasAction": "retain-verified-only"
    },
    "9": {
      "quoteAction": "retain",
      "reason": "The all-out attacking order represents Raichi’s aggression; protractor defense and the Ness/Rin duels were reconsidered.",
      "mangaCandidates": [
        224,
        276,
        277
      ],
      "aliasAction": "retain-verified-only"
    },
    "10": {
      "quoteAction": "retain",
      "reason": "The failed-dream realization defines Naruhaya’s role.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "11": {
      "quoteAction": "retain",
      "reason": "Retain the striker aspiration; do not fabricate manga-only material for a minor player.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "12": {
      "quoteAction": "retain",
      "reason": "The seriousness/betrayal line represents Kuon’s conflict.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "13": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "14": {
      "quoteAction": "retain",
      "reason": "The goals-only striker evaluation represents Sae’s philosophy.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "15": {
      "quoteAction": "retain",
      "reason": "The villain declaration is defining; rejecting Snuffy’s employment philosophy is a stronger manga opportunity pending English verification.",
      "mangaCandidates": [
        215,
        216,
        226,
        228,
        229
      ],
      "aliasAction": "retain-verified-only"
    },
    "16": {
      "quoteAction": "retain",
      "reason": "The ideas line represents Niko’s thinking; later metavision scenes were reconsidered.",
      "mangaCandidates": [
        218
      ],
      "aliasAction": "retain-verified-only"
    },
    "17": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "18": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "19": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "20": {
      "quoteAction": "retain",
      "reason": "The treasure statement represents Reo’s original personal ambition; independent development scenes were reconsidered.",
      "mangaCandidates": [
        180,
        190,
        295,
        298
      ],
      "aliasAction": "retain-verified-only"
    },
    "21": {
      "quoteAction": "retain",
      "reason": "The talent-versus-effort statement represents early Nagi; awakened frustration and Side-B motivation are alternatives pending chapter-specific official English.",
      "mangaCandidates": [
        190,
        298,
        303,
        351
      ],
      "aliasAction": "retain-verified-only"
    },
    "22": {
      "quoteAction": "retain",
      "reason": "The direct path-to-goal statement suits Zantetsu’s acceleration; no better official-English line was verified.",
      "mangaCandidates": [
        246
      ],
      "aliasAction": "retain-verified-only"
    },
    "23": {
      "quoteAction": "retain",
      "reason": "The death-match philosophy is defining; destruction and original-ego passages were reconsidered.",
      "mangaCandidates": [
        269,
        270,
        271,
        272,
        273,
        274
      ],
      "aliasAction": "retain-verified-only"
    },
    "24": {
      "quoteAction": "retain",
      "reason": "Glamour is the character identity, so the glam-goals line is meaningful despite its scoring language.",
      "mangaCandidates": [
        221
      ],
      "aliasAction": "retain-verified-only"
    },
    "25": {
      "quoteAction": "retain",
      "reason": "Insecurity is the character identity; do not replace it with a generic winning boast.",
      "mangaCandidates": [
        246
      ],
      "aliasAction": "retain-verified-only"
    },
    "26": {
      "quoteAction": "add-verified",
      "reason": "Planet Hotline support dialogue is a possible manga source; no memorable official-English line was verified.",
      "mangaCandidates": [
        179,
        182,
        211,
        244
      ],
      "aliasAction": "retain-verified-only"
    },
    "27": {
      "quoteAction": "retain",
      "reason": "Anticipation already expresses Hiori’s cognition; choosing and producing strikers is a stronger manga opportunity awaiting English verification.",
      "mangaCandidates": [
        230,
        233,
        237,
        239
      ],
      "aliasAction": "retain-verified-only"
    },
    "28": {
      "quoteAction": "retain",
      "reason": "Attacking weakness represents Karasu’s rationality; later controller passages were reconsidered.",
      "mangaCandidates": [
        342
      ],
      "aliasAction": "retain-verified-only"
    },
    "29": {
      "quoteAction": "retain",
      "reason": "The existing line expresses Otoya’s stealth/speed rivalry; later Barcha support dialogue was reconsidered.",
      "mangaCandidates": [
        159,
        161,
        295
      ],
      "aliasAction": "retain-verified-only"
    },
    "30": {
      "quoteAction": "retain",
      "reason": "The one-on-one philosophy is already highly representative; faith and world-best aspirations require exact official English.",
      "mangaCandidates": [
        195,
        196,
        197,
        204
      ],
      "aliasAction": "retain-verified-only"
    },
    "31": {
      "quoteAction": "retain",
      "reason": "The cellular scoring declaration is iconic and representative; preserve it.",
      "mangaCandidates": [
        253,
        254
      ],
      "aliasAction": "retain-verified-only"
    },
    "32": {
      "quoteAction": "add-verified",
      "reason": "NEL support and left-handed training scenes were checked as opportunities; no representative official-English line was verified.",
      "mangaCandidates": [
        249,
        250,
        251
      ],
      "aliasAction": "retain-verified-only"
    },
    "33": {
      "quoteAction": "add-verified",
      "reason": "Borderline choices and the Magnus assist are substantive candidates; no exact official-English dialogue was verified.",
      "mangaCandidates": [
        264,
        265,
        266
      ],
      "aliasAction": "retain-verified-only"
    },
    "34": {
      "quoteAction": "retain",
      "reason": "The tunnel-vision criticism represents Luna’s taunting senior-player confidence.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "35": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "36": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "37": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "38": {
      "quoteAction": "retain",
      "reason": "But I’m fast is an iconic, weapon-defining exception to short-quote filler; preserve it.",
      "mangaCandidates": [
        246,
        277,
        278
      ],
      "aliasAction": "retain-verified-only"
    },
    "39": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "40": {
      "quoteAction": "retain",
      "reason": "Playing for himself represents Aiku’s recovered ego; later defensive role passages were reconsidered.",
      "mangaCandidates": [
        221
      ],
      "aliasAction": "retain-verified-only"
    },
    "41": {
      "quoteAction": "retain",
      "reason": "The no-freedom marking line suits Nio’s duel-oriented role.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "42": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "43": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "44": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "45": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "46": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "47": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "48": {
      "quoteAction": "retain",
      "reason": "The refusal to surrender his position represents Sendo’s pride; the Ubers winner was reconsidered.",
      "mangaCandidates": [
        245
      ],
      "aliasAction": "retain-verified-only"
    },
    "49": {
      "quoteAction": "replace",
      "reason": "Replace the episode-38 kneeling command with the licensor’s exact chapter-156 identity/impossible line.",
      "mangaCandidates": [
        156,
        157,
        243,
        260,
        261,
        266
      ],
      "aliasAction": "retain-verified-only"
    },
    "50": {
      "quoteAction": "add-verified",
      "reason": "Magic, imagination, family rejection, and the Kaiser partnership are substantive candidates; no official-English wording was independently accessible.",
      "mangaCandidates": [
        242,
        243,
        294
      ],
      "aliasAction": "retain-verified-only"
    },
    "51": {
      "quoteAction": "add-verified",
      "reason": "BM teamwork and Kaiser-support scenes were checked; no distinctive verified English quotation was found.",
      "mangaCandidates": [
        157,
        161
      ],
      "aliasAction": "retain-verified-only"
    },
    "52": {
      "quoteAction": "add-verified",
      "reason": "Freedom, imagination, and learning from admired players are substantive teaching-scene candidates; no exact official-English line was independently accessible.",
      "mangaCandidates": [
        159,
        160,
        164
      ],
      "aliasAction": "retain-verified-only"
    },
    "53": {
      "quoteAction": "add-verified",
      "reason": "Ideal-body development, self-belief and the number-two rivalry are substantive candidates; no official-English dialogue was independently accessible.",
      "mangaCandidates": [
        170,
        173,
        192,
        193,
        201
      ],
      "aliasAction": "retain-verified-only"
    },
    "54": {
      "quoteAction": "add-verified",
      "reason": "Developing creativity and ending Reo’s dependence are substantive candidates; no official-English dialogue was independently accessible.",
      "mangaCandidates": [
        177,
        178,
        190,
        245,
        298
      ],
      "aliasAction": "retain-verified-only"
    },
    "55": {
      "quoteAction": "add-verified",
      "reason": "Football as work, being human before being a player, and responsibility are important opportunities; do not insert widely circulated fan translations.",
      "mangaCandidates": [
        214,
        215,
        216,
        223,
        228,
        229
      ],
      "aliasAction": "retain-verified-only"
    },
    "56": {
      "quoteAction": "add-verified",
      "reason": "Valuation, the Snuffy rescue and humor are substantive candidates; no exact official-English dialogue was independently accessible.",
      "mangaCandidates": [
        211,
        214,
        216,
        218
      ],
      "aliasAction": "retain-verified-only"
    },
    "57": {
      "quoteAction": "add-verified",
      "reason": "The contrarian self-description and high-risk passing philosophy are substantive candidates; do not treat a translated alias as a quotation.",
      "mangaCandidates": [
        244,
        246,
        252,
        253,
        256,
        274
      ],
      "aliasAction": "retain-verified-only"
    },
    "58": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "59": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "60": {
      "quoteAction": "add-verified",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "61": {
      "quoteAction": "add-verified",
      "reason": "The Spain encounter and emotional conversation are important manga-only opportunities; no exact official-English dialogue was independently accessible.",
      "mangaCandidates": [
        307,
        308,
        309,
        351
      ],
      "aliasAction": "retain-verified-only"
    },
    "62": {
      "quoteAction": "add-verified",
      "reason": "The Nigeria match and foster-brother history were reconsidered; exact official-English wording is still required.",
      "mangaCandidates": [
        313,
        314,
        315,
        316
      ],
      "aliasAction": "retain-verified-only"
    },
    "63": {
      "quoteAction": "add-verified",
      "reason": "The money/work philosophy and foster-brother history were reconsidered; exact official-English wording is still required.",
      "mangaCandidates": [
        313,
        314,
        315,
        316
      ],
      "aliasAction": "retain-verified-only"
    },
    "64": {
      "quoteAction": "add-verified",
      "reason": "Suitable destiny and changing others are important manga-only opportunities; no exact official-English line was independently accessible.",
      "mangaCandidates": [
        326,
        330,
        338,
        343,
        344,
        345
      ],
      "aliasAction": "retain-verified-only"
    },
    "65": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "66": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "67": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Anti-ego football and the Japan/England confrontation were reconsidered; exact official-English wording remains required.",
      "mangaCandidates": [
        352,
        353,
        356,
        364
      ],
      "aliasAction": "retain-verified-only"
    },
    "68": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "69": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "70": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Keep the established Aomori alias; do not invent a quote for off-panel reputation.",
      "mangaCandidates": [
        298
      ],
      "aliasAction": "retain-verified-only"
    },
    "71": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "72": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Episode Nagi planning and Side-B scenes are possible sources; no verified official-English line was found.",
      "mangaCandidates": [
        298,
        351
      ],
      "aliasAction": "retain-verified-only"
    },
    "73": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "74": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "75": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "76": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "77": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "78": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Reviewed the roster/profile role and available manga appearances. No representative official-English quote or additional canon alias could be verified; absence is not a claim that the character never speaks.",
      "mangaCandidates": [],
      "aliasAction": "retain-verified-only"
    },
    "79": {
      "quoteAction": "leave-empty-pending-verification",
      "reason": "Episode Nagi and Side-B dialogue were reconsidered; no verified official-English representative line was found.",
      "mangaCandidates": [
        298,
        351
      ],
      "aliasAction": "retain-verified-only"
    }
  }});
function isVerifiedCanonQuote(quote){
    return !!quote&&quote.verified===true&&quote.language==="en"&&(quote.localization==="official-English-"+quote.sourceType||(quote.localization==="project-translation-Japanese-manga"&&quote.sourceType==="manga"&&quote.originalLanguage==="ja"&&typeof quote.originalText==="string"&&!!quote.originalText.trim()))&&!!playerById(quote.playerId)&&
        typeof quote.text==="string"&&!!quote.text.trim()&&
        ["manga","anime"].includes(quote.sourceType)&&
        ["chapter","episode"].every(field=>quote[field]===undefined||(Number.isInteger(quote[field])&&quote[field]>0))&&
        (quote.sourceType!=="manga"||quote.chapter<=APP_SUPPORTED_CHAPTER)&&
        Number.isInteger(quote[quote.sourceType==="manga"?"chapter":"episode"])&&quote[quote.sourceType==="manga"?"chapter":"episode"]>0&&
        typeof quote.sourceReference==="string"&&/^https:\/\/\S+$/.test(quote.sourceReference)&&
        typeof quote.sourceNote==="string"&&!!quote.sourceNote.trim();
}
function verifiedPlayerQuotes(playerId){
    return PLAYER_QUOTES.filter(quote=>quote?.playerId===playerId&&isVerifiedCanonQuote(quote));
}
const REFERENCE_PLAYER_BY_NAME=new Map(players.map(player=>[player.name,player]));
// This adapter resolves existing chemistry names once without changing the gameplay model.
const CHEMISTRY_REFERENCE_CONTEXTS=CHEMISTRY_CONTEXTS.map((context,index)=>({
    id:`context-${index}`,type:"context",name:context.name,score:context.score,
    playerIds:context.players.map(name=>REFERENCE_PLAYER_BY_NAME.get(name)?.id),
    description:"Shared competitive history recorded in the project. This group score is a context baseline; individual pair scores can differ."
}));
const PROFILE_ONLY_CHEMISTRY_PAIRS=new Set([["Jingo Raichi","Zaruchi"].sort().join("|")]);
const CHEMISTRY_REFERENCE_PAIRS=CHEMISTRY_SPECIAL_PAIRS.filter(([a,b])=>!PROFILE_ONLY_CHEMISTRY_PAIRS.has([a,b].sort().join("|"))).map(([a,b,score,label,description])=>({
    id:[REFERENCE_PLAYER_BY_NAME.get(a)?.id,REFERENCE_PLAYER_BY_NAME.get(b)?.id].sort((x,y)=>x-y).join("-"),
    type:"pair",playerIds:[REFERENCE_PLAYER_BY_NAME.get(a)?.id,REFERENCE_PLAYER_BY_NAME.get(b)?.id],
    score,label,description
}));
const PLAYER_RECORDS=new Map(players.map(player=>[player.id,{
    player,
    nationality:player.nationality||null,
    quote:verifiedPlayerQuotes(player.id)[0]||null,
    aliases:verifiedPlayerAliases(player.id),
    profile:PLAYER_PROFILE_METADATA[player.id]||null,
    categories:Object.entries(PLAYER_POOL_CATEGORIES).filter(([key])=>PLAYER_POOL_CATEGORY_IDS[key].has(player.id)).map(([key,data])=>({key,label:data.label})),
    affiliations:CHEMISTRY_REFERENCE_CONTEXTS.filter(context=>context.playerIds.includes(player.id))
}]));
function playerRecord(id){return PLAYER_RECORDS.get(Number(id))||null;}
