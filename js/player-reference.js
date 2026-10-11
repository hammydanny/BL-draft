// Reference metadata is keyed by stable player IDs. Ratings and weapons are referenced,
// never copied. Existing latest-main profiles/categories are retained verbatim.
const PLAYER_REFERENCE_SCHEMA_VERSION=1;
const PLAYER_DATA_CLASSIFICATIONS=Object.freeze({ratings:"PROJECT_RATING",positions:"GAMEPLAY_INTERPRETATION",canonPositions:"CANON",profile:"PROJECT_REFERENCE"});
const PLAYER_PROFILE_METADATA = {
  "1": {
    "overview": "An adaptive striker whose spatial awareness, off-ball movement and metavision let him read entire attacks and repeatedly reinvent the route to goal.",
    "classification": "PROJECT_REFERENCE"
  },
  "2": {
    "overview": "A highly regarded high-school forward known as the Jewel of Japanese Soccer before Blue Lock's opening test eliminated him and challenged his team-first ideals. He later returns through Side-B.",
    "classification": "PROJECT_REFERENCE"
  },
  "3": {
    "overview": "The world's benchmark striker and Bastard München master, defined by ruthless rationality, elite two-footed finishing and an ability to choose the most efficient scoring action.",
    "classification": "PROJECT_REFERENCE"
  },
  "4": {
    "overview": "A free-form dribbler who follows his instinctive 'monster,' using elastic close control, creativity and fearless one-on-one play to break defensive structure.",
    "classification": "PROJECT_REFERENCE"
  },
  "5": {
    "overview": "A survival-focused forward whose persistence and Malicia-style foul drawing let him manufacture value even when he lacks the elite technical weapons of Blue Lock's stars.",
    "classification": "PROJECT_REFERENCE"
  },
  "6": {
    "overview": "A powerful left-footed striker rebuilt through the Wild Card into a physically dominant finisher with long-range shooting, strength and a more severe competitive edge.",
    "classification": "PROJECT_REFERENCE"
  },
  "7": {
    "overview": "An explosive runner whose top speed, acceleration and wide attacking routes turn open grass into a direct scoring weapon.",
    "classification": "PROJECT_REFERENCE"
  },
  "8": {
    "overview": "An acrobatic instinct player who successfully converted into goalkeeper, combining reach, reflexes, flexibility and unusual body control for spectacular saves.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "GK",
        "context": "Blue Lock goalkeeper conversion",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "9": {
    "overview": "A relentless duel specialist whose stamina, physical pressure and man-marking make him valuable as a defensive midfielder or disruptive central presence.",
    "classification": "PROJECT_REFERENCE"
  },
  "10": {
    "overview": "A quick forward whose best weapon is off-the-ball movement, using blind spots and sharp runs to appear in finishing spaces despite limited individual power.",
    "classification": "PROJECT_REFERENCE"
  },
  "11": {
    "overview": "Team Z's dependable utility player who accepted the goalkeeper role during the First Selection and contributed through composure, sacrifice and basic all-around ability.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "GK",
        "context": "Team Z // First Selection",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "12": {
    "overview": "A tall, intelligent forward with aerial ability and planning instincts, remembered for both his calculated betrayal of Team Z and his later attempt to make amends.",
    "classification": "PROJECT_REFERENCE"
  },
  "13": {
    "overview": "A Team Z attacker whose speed and forward instincts gave him value in transition, though he never developed a defining weapon strong enough to survive deeper Blue Lock stages.",
    "classification": "PROJECT_REFERENCE"
  },
  "14": {
    "overview": "A New Generation World XI midfielder whose technique, scanning, dribbling and surgical passing let him dictate the tempo and quality of an entire attack.",
    "classification": "PROJECT_REFERENCE"
  },
  "15": {
    "overview": "A domineering striker who treats the field as his kingdom, combining power, chop dribbles, disciplined shooting zones and a predator's willingness to devour teammates' plans.",
    "classification": "PROJECT_REFERENCE"
  },
  "16": {
    "overview": "A cerebral defender converted from striker, using vision, anticipation and metavision-like reading to intercept passing lanes and organize defensive space.",
    "classification": "PROJECT_REFERENCE"
  },
  "17": {
    "overview": "Team Y's recognized ace scorer, used as the focal point of Niko's early tactical system and valued primarily for direct finishing presence. He later participates in Side-B.",
    "classification": "PROJECT_REFERENCE"
  },
  "18": {
    "overview": "One half of the Wanima partnership, a forward who thrives on synchronized movement and familiar combination play built through years beside his brother.",
    "classification": "PROJECT_REFERENCE"
  },
  "19": {
    "overview": "One half of the Wanima partnership, relying on coordinated timing, shared reads and rehearsed attacking movement with his brother. After his First Selection elimination, he later enters Side-B.",
    "classification": "PROJECT_REFERENCE"
  },
  "20": {
    "overview": "An elite all-rounder whose copy ability, passing and tactical flexibility let him reproduce a wide range of techniques and serve as creator, midfielder or defender.",
    "classification": "PROJECT_REFERENCE"
  },
  "21": {
    "overview": "A prodigious trapping genius capable of killing impossible passes and inventing finishes from awkward situations, though his growth depends heavily on finding genuine personal motivation. After the NEL, he enters Side-B.",
    "classification": "PROJECT_REFERENCE"
  },
  "22": {
    "overview": "A left-footed speedster with exceptional initial acceleration, dangerous diagonal shooting and a simple direct style that contrasts with his poor academic instincts.",
    "classification": "PROJECT_REFERENCE"
  },
  "23": {
    "overview": "A complete elite striker whose shooting, technique, field control and destructive ego allow him to dominate matches while constantly seeking opponents strong enough to force evolution.",
    "classification": "PROJECT_REFERENCE"
  },
  "24": {
    "overview": "Aerial and reach specialist whose long limbs, jumping ability and stylish body control make him dangerous in both penalty boxes and highly useful as a center back.",
    "classification": "PROJECT_REFERENCE"
  },
  "25": {
    "overview": "An anxious but physically exceptional player with huge stamina, acceleration and strength, capable of overwhelming opponents once he commits to a duel.",
    "classification": "PROJECT_REFERENCE"
  },
  "26": {
    "overview": "A compact combination player whose turning speed, short passing and orbiting support runs make him an ideal connector for rapid one-two attacks such as Isagi's Planet Hotline.",
    "classification": "PROJECT_REFERENCE"
  },
  "27": {
    "overview": "A technically refined playmaker with calm scanning, elite passing precision and metavision, at his best when creating the decisive route rather than simply following another striker.",
    "classification": "PROJECT_REFERENCE"
  },
  "28": {
    "overview": "A calculating midfielder who targets weaknesses, protects the ball intelligently and controls tempo through positioning, pressing choices and efficient distribution.",
    "classification": "PROJECT_REFERENCE"
  },
  "29": {
    "overview": "A stealth-oriented attacker who specializes in slipping behind markers, exploiting blind spots and timing off-ball runs to arrive where defenders stop tracking him.",
    "classification": "PROJECT_REFERENCE"
  },
  "30": {
    "overview": "A gifted one-on-one dribbler with strong pace, gyro-style shooting and the confidence to attack defenders directly, even when his personal ambition conflicts with the team's route.",
    "classification": "PROJECT_REFERENCE"
  },
  "31": {
    "overview": "An explosive penalty-box striker driven by instinct, using extraordinary spatial reactions, athleticism and acrobatic finishing to score from situations most players cannot even attempt.",
    "classification": "PROJECT_REFERENCE"
  },
  "32": {
    "overview": "A hard-working support player who developed greater two-footed usefulness and learned to position himself as a reliable passing route around stronger central stars.",
    "classification": "PROJECT_REFERENCE"
  },
  "33": {
    "overview": "A balanced, technically subtle player whose sharp positioning, break-dance-like body control and precisely weighted passing let him influence decisive moments without dominating possession.",
    "classification": "PROJECT_REFERENCE"
  },
  "34": {
    "overview": "A Spanish World Five forward with elite senior-level technique, playful provocation and the composure to expose the gap between Blue Lock prospects and established international stars.",
    "classification": "PROJECT_REFERENCE"
  },
  "35": {
    "overview": "An Argentine World Five technician whose precise passing, set-piece quality and light-footed control make him one of the group's strongest connectors.",
    "classification": "PROJECT_REFERENCE"
  },
  "36": {
    "overview": "An English World Five striker built around senior-level power and finishing, using strength and direct attacking force to punish defenders who cannot match him physically.",
    "classification": "PROJECT_REFERENCE"
  },
  "37": {
    "overview": "A Brazilian World Five forward whose imposing physique, aerial ability and athletic presence make him a major target in direct attacks.",
    "classification": "PROJECT_REFERENCE"
  },
  "38": {
    "overview": "A French super-prodigy and master striker whose transcendent acceleration changes the geometry of the field, pairing world-class speed with increasingly mature tactical leadership.",
    "classification": "PROJECT_REFERENCE"
  },
  "39": {
    "overview": "The original Japan U-20 goalkeeper, valued for conventional shot-stopping fundamentals, positioning and experience behind a disciplined national-team defense.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "GK",
        "context": "Original Japan U-20",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "40": {
    "overview": "A commanding center back and proven captain whose physicality, reading, leadership and metavision make him one of Japan's most complete defensive organizers.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "CB",
        "context": "Japan defensive organizer",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "41": {
    "overview": "A rugged original U-20 center back who specializes in physical contests, contact-heavy defending and using strength to disrupt opposing forwards.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "CB",
        "context": "Original Japan U-20",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "42": {
    "overview": "A disciplined U-20 defender known for tight marking, agile footwork and persistence when assigned to contain dangerous wide attackers.",
    "classification": "PROJECT_REFERENCE"
  },
  "43": {
    "overview": "A pace-focused U-20 fullback whose quick recovery speed and acceleration let him contest fast wingers and support an aggressive defensive line.",
    "classification": "PROJECT_REFERENCE"
  },
  "44": {
    "overview": "A defensive midfielder from the original Japan U-20 setup, providing structure, ball-winning support and positional discipline in front of the back line.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "DM",
        "context": "Original Japan U-20",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "45": {
    "overview": "A composed original U-20 midfielder who contributes through circulation, positioning and support play rather than a single overwhelming individual weapon.",
    "classification": "PROJECT_REFERENCE"
  },
  "46": {
    "overview": "An original Japan U-20 attacker used as part of the national side's forward structure, offering movement and finishing support around the main ace.",
    "classification": "PROJECT_REFERENCE"
  },
  "47": {
    "overview": "A wide U-20 attacker whose role emphasizes running lanes, support and maintaining attacking width within Japan's pre-Blue-Lock system.",
    "classification": "PROJECT_REFERENCE"
  },
  "48": {
    "overview": "The original Japan U-20 ace forward, an opportunistic finisher with strong instincts around loose balls who later adapts well to Ubers' organized attacking structure.",
    "classification": "PROJECT_REFERENCE"
  },
  "49": {
    "overview": "A New Generation World XI striker with metavision, ruthless positioning and the Kaiser Impact, a world-class shooting weapon built around extraordinary swing speed.",
    "classification": "PROJECT_REFERENCE"
  },
  "50": {
    "overview": "A highly technical left-footed midfielder whose close control and imaginative passing earned the 'Magician' identity, historically functioning as Kaiser's most devoted creator.",
    "classification": "PROJECT_REFERENCE"
  },
  "51": {
    "overview": "A Bastard München attacker who supports the club's established system through movement, width and combination play around its central stars.",
    "classification": "PROJECT_REFERENCE"
  },
  "52": {
    "overview": "Brazil's flamboyant master dribbler, teaching Barcha through freedom, rhythm and individual expression rather than rigid tactical imitation.",
    "classification": "PROJECT_REFERENCE"
  },
  "53": {
    "overview": "Manshine City's master striker and physical idealist, obsessively engineering his body so every movement, shot and duel can be produced at elite athletic output.",
    "classification": "PROJECT_REFERENCE"
  },
  "54": {
    "overview": "A tall, intelligent Manshine attacker who initially acts as Nagi's development partner, combining technical quality with an analytical interest in drawing out other players' creativity.",
    "classification": "PROJECT_REFERENCE"
  },
  "55": {
    "overview": "Ubers' master striker and tactical mastermind, famous for designing repeatable team patterns, maximizing player roles and leading through preparation rather than pure individual ego.",
    "classification": "PROJECT_REFERENCE"
  },
  "56": {
    "overview": "A New Generation World XI center back nicknamed the Ace Eater, combining elite man-marking with unusual dribbling and ball-carrying to erase star attackers and launch counters.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "CB",
        "context": "Ubers // Ace Eater",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "57": {
    "overview": "A gifted French playmaker whose contrarian personality and pinpoint passing make him especially dangerous when a difficult or unexpected attacking route captures his interest.",
    "classification": "PROJECT_REFERENCE"
  },
  "58": {
    "overview": "A goalkeeper first shown with Manshine City’s U-20 side in the Neo Egoist League in chapter 173. He later plays in goal for England U-20, wearing number 1 in both roles.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "GK",
        "context": "Manshine City U-20 / England U-20; chapter 173 noted in the existing profile",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "59": {
    "overview": "A French U-20 goalkeeper associated with the tournament's elite international generation, offering strong reflexes and composure behind France's talented outfield group.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "GK",
        "context": "France U-20",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "60": {
    "overview": "A World Cup-era forward in the current database, represented as a developing attacker whose value comes from direct movement and finishing support.",
    "classification": "PROJECT_REFERENCE"
  },
  "61": {
    "overview": "An elite U-20 forward recognized among the New Generation World XI, carrying the reputation and technical ceiling of a striker already measured against the world's best youth talent.",
    "classification": "PROJECT_REFERENCE"
  },
  "62": {
    "overview": "Nigeria's powerful central forward and major attacking reference, combining strength, finishing and long-standing chemistry with foster brother Godwin Kuso.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "CF",
        "context": "Nigeria central forward",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "63": {
    "overview": "Nigeria's attacking midfielder and leader, a creator who has played alongside Onazi for years and focuses on supplying the striker with high-quality chances.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "AM",
        "context": "Nigeria attacking midfielder",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "64": {
    "overview": "An elite French central midfielder and New Generation World XI-level presence whose passing, control and tactical confidence make him a major connector in France's attack.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "CM",
        "context": "France central midfielder",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "65": {
    "overview": "An England U-20 forward operating inside the team's collective system, offering athletic running and supporting movement rather than being treated as an individual superstar.",
    "classification": "PROJECT_REFERENCE"
  },
  "66": {
    "overview": "An England U-20 forward with proven penalty-area presence, including the movement and aerial finishing required to convert service from the team's structured wide attacks.",
    "classification": "PROJECT_REFERENCE"
  },
  "67": {
    "overview": "An elite England U-20 left winger and New Generation World XI-level talent, combining delivery, pace and high-end chance creation within England’s collective system.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "LW",
        "context": "England left winger",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "69": {
    "overview": "A Japanese forward in Side-B, first shown on a screen in chapter 311 and introduced in person in chapter 327. He identifies stamina as his strength and partners with Nagi in the Bird Cage challenge.",
    "classification": "PROJECT_REFERENCE"
  },
  "70": {
    "overview": "The Japanese forward known as Aomori’s Messi. He teamed with Baro and Naruhaya, cleared the Second Selection with Niko and Hiori, joined Manshine City in the NEL and later entered Side-B. His distinctive football weapon is not specifically demonstrated.",
    "classification": "PROJECT_REFERENCE"
  },
  "71": {
    "overview": "A Japanese forward who survived the Second Selection with Nanase, Hiiragi and Tsunzaki. He played on Third Selection Team A3 and joined FC Barcha during the NEL. A distinctive weapon is not specifically demonstrated. His selection jersey number was 19.",
    "classification": "PROJECT_REFERENCE"
  },
  "72": {
    "overview": "A Japanese forward whose trapping and prediction are explored in Episode Nagi. He teamed with Niko and Zantetsu, cleared the Second Selection with Nanase’s group and played for Manshine City before entering Side-B. His selection number was 22; Manshine number 17.",
    "classification": "PROJECT_REFERENCE"
  },
  "73": {
    "overview": "A Japanese forward in the fourth Second Selection clear team alongside Nanase, Hiiragi and Haiji. He played on Third Selection Team C2 and was a Manshine City reserve in the NEL. A distinctive weapon is not specifically demonstrated. His selection number was 100.",
    "classification": "PROJECT_REFERENCE"
  },
  "74": {
    "overview": "Nigeria U-20’s number 8 centre-back. His headers and vertical leap support his aerial defending. He grew up playing football with Onazi, Kuso and Bello; their shared Nigeria team history provides his ordinary chemistry links.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "CB",
        "context": "Nigeria U-20 // number 8",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "75": {
    "overview": "Nigeria U-20’s number 11 right midfielder. His quick dribbling tempo is demonstrated against Bachira. He grew up playing football with Onazi, Kuso and Oboabona.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "RM",
        "context": "Nigeria U-20 // number 11",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "76": {
    "overview": "France U-20’s number 5 defensive midfielder. He uses his physique to pressure and obstruct opponents, including Karasu, in France’s match against Japan.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "DM",
        "context": "France U-20 // number 5",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "77": {
    "overview": "France U-20’s number 8 left winger. His speed lets him keep pace with Chigiri, and he uses threatening deliveries and decoy movement during the Japan match.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "LW",
        "context": "France U-20",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "78": {
    "overview": "France U-20’s number 2 centre-back, introduced with the team in chapter 330. He contests Reo in the air during the Japan match. A distinctive named weapon is not specifically demonstrated.",
    "classification": "PROJECT_REFERENCE",
    "canonPositions": [
      {
        "position": "CB",
        "context": "France U-20 // chapter 330 noted in the existing profile",
        "sourceType": "existing-profile",
        "sourceReference": "Player description retained from latest main; a demonstrated role, separate from gameplay compatibility."
      }
    ]
  },
  "79": {
    "overview": "A Japanese forward whose feints, reading of deceptive movements and pressing are demonstrated in Episode Nagi. He cleared the Second Selection in Karasu’s group, played on Third Selection Team C2, joined FC Barcha and later entered Side-B. His selection number was 77.",
    "classification": "PROJECT_REFERENCE"
  },
  "68": {
    "overview": "An England U-20 forward used as part of the team's system-oriented attack, providing supporting runs and finishing options around the more prominent creators.",
    "classification": "PROJECT_REFERENCE"
  }
};

// Shared category registry: Auction selection and Database browsing use the same data.
const PLAYER_POOL_CATEGORIES = {
    "blue-lock-project":{
        label:"BLUE LOCK PROJECT",
        names:["Yoichi Isagi","Ryosuke Kira","Meguru Bachira","Gurimu Igarashi","Rensuke Kunigami","Hyoma Chigiri","Gin Gagamaru","Jingo Raichi","Asahi Naruhaya","Okuhito Iemon","Wataru Kuon","Yudai Imamura","Shoei Baro","Ikki Niko","Hibiki Okawa","Junichi Wanima","Keisuke Wanima","Reo Mikage","Seishiro Nagi","Zantetsu Tsurugi","Rin Itoshi","Jyubei Aryu","Aoshi Tokimitsu","Ranze Kurona","Yo Hiori","Tabito Karasu","Eita Otoya","Kenyu Yukimiya","Ryusei Shido","Nijiro Nanase","Jin Kiyora","Hajime Nishioka","Shizuka Haiji","Reiji Hiiragi","Taiga Tsunzaki","Aiki Himizu"]
    },
    "original-u20":{
        label:"ORIGINAL JAPAN U-20",
        names:["Sae Itoshi","Gen Fukaku","Oliver Aiku","Kazuma Nio","Miroku Darai","Teppei Neru","Itsuki Wakatsuki","Haru Hayate","Kento Cho","Teru Kitsunezato","Shuto Sendo","Ryusei Shido"]
    },
    "world-five":{
        label:"WORLD FIVE",
        names:["Leonardo Luna","Pablo Cavasoz","Adam Blake","Dada Silva","Julien Loki"]
    },
    "master-strikers":{
        label:"MASTER STRIKERS",
        names:["Noel Noa","Lavinho","Chris Prince","Marc Snuffy","Julien Loki"]
    },
    "new-gen-11":{
        label:"NEW GENERATION XI",
        names:["Sae Itoshi","Michael Kaiser","Don Lorenzo","Bunny Iglesias","Vivien Hugo","Teddy Knight"]
    },
    "nel-foreign":{
        label:"NEL FOREIGN PLAYERS",
        names:["Noel Noa","Julien Loki","Michael Kaiser","Alexis Ness","Benedict Grim","Lavinho","Chris Prince","Agi","Marc Snuffy","Don Lorenzo","Charles Chevalier","Rooke","Renoir"]
    },
    "japan-world-cup":{
        label:"JAPAN U-20 WORLD CUP",
        names:["Yoichi Isagi","Rin Itoshi","Ryusei Shido","Meguru Bachira","Hyoma Chigiri","Reo Mikage","Rensuke Kunigami","Eita Otoya","Oliver Aiku","Tabito Karasu","Gin Gagamaru","Jyubei Aryu","Kenyu Yukimiya","Ikki Niko","Yo Hiori","Shuto Sendo","Ranze Kurona","Zantetsu Tsurugi","Gen Fukaku","Jingo Raichi","Jin Kiyora","Nijiro Nanase","Shoei Baro"]
    },
    "world-cup-new":{
        label:"U-20 WC NEWCOMERS",
        names:["Bunny Iglesias","Innocent Onazi","Godwin Kuso","Vivien Hugo","Achanpong","Lockhart","Teddy Knight","Childs","Oboabona","Bello","Bats","Leyden","Hermes"]
    },
    "side-b":{
        label:"SIDE-B",
        names:["Seishiro Nagi","Ryosuke Kira","Haneru Shindo","Hajime Nishioka","Shigeo Mizuki","Reiji Hiiragi","Aiki Himizu","Keisuke Wanima","Hibiki Okawa"]
    }
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
    GB:{name:"United Kingdom",label:"England",representation:"England",flag:"images/flags/gb-eng.svg"}
});
function playerNationalityMarkup(player){
    const nationality=player?.nationality,country=PLAYER_COUNTRIES[nationality?.code];
    if(!country||nationality.name!==country.name)return "";
    const label=country.label,src=new URL(country.flag,document.baseURI);src.searchParams.set("v",APP_VERSION);
    return `<div class="player-nationality" title="${esc(label)}"><img src="${src.href}" alt="" width="24" height="16" decoding="async"><span>${esc(label)}</span></div>`;
}

// Exact, short English subtitle excerpts, checked independently of Wiki quotes.
// Timestamped transcript references retain the translation and speaker context.
const PLAYER_QUOTES=Object.freeze([
    {playerId:1,text:"I am a striker!",verified:true,sourceType:"anime",episode:1,timestamp:"13:04",sourceReference:"https://subs.yakuaru.com/books/blue-lock/page/e1-dream",sourceNote:"Crunchyroll English subtitles, Isagi at 13:04; corroborated by the independently archived episode-1 subtitle track.",corroboration:"https://gist.github.com/wraith4081/b8d99fb3c8d633678dbbd008ce55a8ee"},
    {playerId:6,text:"I'm gonna be a soccer superhero.",verified:true,sourceType:"anime",episode:4,timestamp:"05:53",sourceReference:"https://subs.yakuaru.com/books/blue-lock/page/e4-premonition-and-intuition",sourceNote:"Crunchyroll English subtitle transcript, Kunigami's answer to Isagi about why he plays soccer."},
    {playerId:10,text:"Mine is getting in behind.",verified:true,sourceType:"anime",episode:4,timestamp:"00:20",sourceReference:"https://subs.yakuaru.com/books/blue-lock/page/e4-premonition-and-intuition",sourceNote:"Crunchyroll English subtitle transcript, Naruhaya identifies his own weapon during Team Z's discussion."},
    {playerId:11,text:"I'm an all-rounder.",verified:true,sourceType:"anime",episode:4,timestamp:"00:25",sourceReference:"https://subs.yakuaru.com/books/blue-lock/page/e4-premonition-and-intuition",sourceNote:"Crunchyroll English subtitle transcript, Iemon's own answer during Team Z's weapon discussion."},
    {playerId:21,text:"It's too much hassle.",verified:true,sourceType:"anime",episode:7,timestamp:"20:25",sourceReference:"https://subs.yakuaru.com/books/blue-lock/page/e7-rush",sourceNote:"Exact short excerpt from Nagi's subtitle line after Reo reminds him why they came to eat."}
]);
function isVerifiedCanonQuote(quote){
    return !!quote&&quote.verified===true&&!!playerById(quote.playerId)&&
        typeof quote.text==="string"&&!!quote.text.trim()&&
        ["manga","anime"].includes(quote.sourceType)&&
        ["chapter","episode"].every(field=>quote[field]===undefined||(Number.isInteger(quote[field])&&quote[field]>0))&&
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
const CHEMISTRY_REFERENCE_PAIRS=CHEMISTRY_SPECIAL_PAIRS.map(([a,b,score,label,description])=>({
    id:[REFERENCE_PLAYER_BY_NAME.get(a)?.id,REFERENCE_PLAYER_BY_NAME.get(b)?.id].sort((x,y)=>x-y).join("-"),
    type:"pair",playerIds:[REFERENCE_PLAYER_BY_NAME.get(a)?.id,REFERENCE_PLAYER_BY_NAME.get(b)?.id],
    score,label,description
}));
const PLAYER_RECORDS=new Map(players.map(player=>[player.id,{
    player,
    nationality:player.nationality||null,
    quote:verifiedPlayerQuotes(player.id)[0]||null,
    profile:PLAYER_PROFILE_METADATA[player.id]||null,
    categories:Object.entries(PLAYER_POOL_CATEGORIES).filter(([key])=>PLAYER_POOL_CATEGORY_IDS[key].has(player.id)).map(([key,data])=>({key,label:data.label})),
    affiliations:CHEMISTRY_REFERENCE_CONTEXTS.filter(context=>context.playerIds.includes(player.id))
}]));
function playerRecord(id){return PLAYER_RECORDS.get(Number(id))||null;}
