// BLUE LOCK DRAFT // CHEMISTRY MODEL
// Split from the former root script.js. Classic scripts share the same global scope.

// ----------------------------------------------------------------------------
// CHEMISTRY MODEL // BLUE LOCK CANON + GAMEPLAY THROUGH MANGA CHAPTER 364
// ----------------------------------------------------------------------------
// Blue Lock does NOT publish an official 0-100 chemistry statistic.
// These scores are a fan-game model. Strong overrides are based on demonstrated
// combinations, chemical reactions, tactical systems, or clear incompatibility.
// Generic fallback scores come from repeated shared-team history.
// ----------------------------------------------------------------------------

const CHEMISTRY_CONTEXTS = [
  {name:"TEAM Z",score:79,players:["Yoichi Isagi","Meguru Bachira","Rensuke Kunigami","Hyoma Chigiri","Gin Gagamaru","Jingo Raichi","Gurimu Igarashi","Asahi Naruhaya","Wataru Kuon","Yudai Imamura","Okuhito Iemon"]},
  {name:"TEAM Y // NIKO-OKAWA ROUTE",score:88,players:["Ikki Niko","Hibiki Okawa"]},
  {name:"TEAM W // WANIMA TWINS",score:96,players:["Junichi Wanima","Keisuke Wanima"]},
  {name:"TEAM V",score:84,players:["Seishiro Nagi","Reo Mikage","Zantetsu Tsurugi"]},
  {name:"SECOND SELECTION // ISAGI UNIT",score:85,players:["Yoichi Isagi","Seishiro Nagi","Shoei Baro","Hyoma Chigiri"]},
  {name:"SECOND SELECTION // RIN UNIT",score:84,players:["Rin Itoshi","Jyubei Aryu","Aoshi Tokimitsu","Meguru Bachira","Yoichi Isagi"]},
  {name:"SECOND SELECTION // KARASU UNIT",score:84,players:["Tabito Karasu","Eita Otoya","Kenyu Yukimiya","Aiki Himizu"]},
  {name:"SECOND SELECTION // SHIDO UNIT",score:81,players:["Ryusei Shido","Gurimu Igarashi","Reo Mikage","Ranze Kurona"]},
  {name:"THIRD SELECTION // A1",score:82,players:["Rin Itoshi","Ryusei Shido","Yoichi Isagi","Yo Hiori","Nijiro Nanase"]},
  {name:"BLUE LOCK ELEVEN",score:80,players:["Yoichi Isagi","Rin Itoshi","Meguru Bachira","Hyoma Chigiri","Seishiro Nagi","Shoei Baro","Tabito Karasu","Eita Otoya","Kenyu Yukimiya","Yo Hiori","Jyubei Aryu","Gin Gagamaru","Ikki Niko","Reo Mikage"]},
  {name:"JAPAN U-20 // ORIGINAL",score:80,players:["Sae Itoshi","Oliver Aiku","Shuto Sendo","Gen Fukaku","Kazuma Nio","Miroku Darai","Teppei Neru","Itsuki Wakatsuki","Haru Hayate","Kento Cho","Teru Kitsunezato"]},
  {name:"JAPAN U-20 // MATCH SQUAD",score:78,players:["Sae Itoshi","Ryusei Shido","Oliver Aiku","Shuto Sendo","Gen Fukaku","Kazuma Nio","Miroku Darai","Teppei Neru","Itsuki Wakatsuki","Haru Hayate","Kento Cho","Teru Kitsunezato"]},
  {name:"BASTARD MÜNCHEN",score:83,players:["Noel Noa","Michael Kaiser","Alexis Ness","Benedict Grim","Yoichi Isagi","Rensuke Kunigami","Kenyu Yukimiya","Gin Gagamaru","Ranze Kurona","Jingo Raichi","Yo Hiori","Jin Kiyora","Gurimu Igarashi","Teppei Neru"]},
  {name:"FC BARCHA",score:83,players:["Lavinho","Meguru Bachira","Eita Otoya","Shizuka Haiji","Aiki Himizu"]},
  {name:"MANSHINE CITY",score:82,players:["Chris Prince","Agi","Seishiro Nagi","Reo Mikage","Hyoma Chigiri","Kazuma Nio","Junichi Wanima","Rooke","Hajime Nishioka","Reiji Hiiragi","Taiga Tsunzaki"]},
  {name:"UBERS",score:84,players:["Marc Snuffy","Don Lorenzo","Shoei Baro","Oliver Aiku","Ikki Niko","Jyubei Aryu","Gen Fukaku","Shuto Sendo"]},
  {name:"PARIS X GEN",score:82,players:["Julien Loki","Rin Itoshi","Ryusei Shido","Charles Chevalier","Tabito Karasu","Aoshi Tokimitsu","Nijiro Nanase","Zantetsu Tsurugi"]},
  {name:"JAPAN U-20 // WORLD CUP",score:79,players:["Yoichi Isagi","Rin Itoshi","Ryusei Shido","Meguru Bachira","Hyoma Chigiri","Reo Mikage","Rensuke Kunigami","Eita Otoya","Oliver Aiku","Tabito Karasu","Gin Gagamaru","Jyubei Aryu","Kenyu Yukimiya","Ikki Niko","Yo Hiori","Shuto Sendo","Ranze Kurona","Zantetsu Tsurugi","Gen Fukaku","Jingo Raichi","Jin Kiyora","Nijiro Nanase","Shoei Baro"]},
  {name:"FRANCE U-20 // GOLDEN GENERATION",score:89,players:["Julien Loki","Charles Chevalier","Vivien Hugo","Renoir","Bats","Leyden","Hermes"]},
  {name:"ENGLAND U-20 // FOX SYSTEM",score:86,players:["Teddy Knight","Lockhart","Achanpong","Childs","Agi","Rooke"]},
  {name:"NIGERIA U-20",score:88,players:["Innocent Onazi","Godwin Kuso","Oboabona","Bello"]},
  {name:"TEAM WORLD FIVE",score:92,players:["Leonardo Luna","Pablo Cavasoz","Adam Blake","Dada Silva","Julien Loki"]},
  {name:"SECOND SELECTION // BARO-NARUHAYA-NISHIOKA",score:78,players:["Shoei Baro","Asahi Naruhaya","Hajime Nishioka"]},
  {name:"SECOND SELECTION // HIIRAGI-NIKO-ZANTETSU",score:79,players:["Reiji Hiiragi","Ikki Niko","Zantetsu Tsurugi"]},
  {name:"SECOND SELECTION // FOURTH CLEAR TEAM",score:79,players:["Nijiro Nanase","Shizuka Haiji","Reiji Hiiragi","Taiga Tsunzaki"]},
  {name:"SECOND SELECTION // FIFTH CLEAR TEAM",score:79,players:["Ikki Niko","Yo Hiori","Hajime Nishioka"]},
  {name:"THIRD SELECTION // A3",score:80,players:["Rin Itoshi","Ryusei Shido","Meguru Bachira","Shizuka Haiji","Hajime Nishioka"]},
  {name:"THIRD SELECTION // B3",score:80,players:["Tabito Karasu","Eita Otoya","Reiji Hiiragi"]},
  {name:"THIRD SELECTION // C2",score:79,players:["Kenyu Yukimiya","Seishiro Nagi","Taiga Tsunzaki","Aiki Himizu"]},
  {name:"SIDE-B",score:70,players:["Seishiro Nagi","Ryosuke Kira","Haneru Shindo","Hajime Nishioka","Shigeo Mizuki","Reiji Hiiragi","Aiki Himizu","Keisuke Wanima","Hibiki Okawa"]}
];

const CHEMISTRY_SPECIAL_PAIRS = [
  ["Shoei Baro","Asahi Naruhaya",78,"SECOND SELECTION DUO","Barou and Naruhaya teamed with Nishioka, then faced Isagi and Nagi as a duo in the Second Selection."],
  // Proven elite / named combinations
  ["Junichi Wanima","Keisuke Wanima",99,"TWIN SYNCHRONIZATION","Team W's core duo can understand each other almost perfectly without words and specialize in synchronized combination play."],
  ["Ikki Niko","Hibiki Okawa",91,"HIDDEN PLAYMAKER × ACE","Team Y used Niko as the deep-lying organizer feeding Okawa as the visible finishing threat; Niko directly assisted Okawa against Team Z."],
  ["Yoichi Isagi","Yo Hiori",99,"CHEMICAL REACTION","Ubers: shared metavision and the no-look final pass/finish created a goal neither player pre-signalled."],
  ["Ryusei Shido","Sae Itoshi",99,"MATCH MADE IN HEAVEN","Japan U-20: Sae immediately unlocked Shido's penalty-area instincts and supplied both of his goals."],
  ["Ryusei Shido","Charles Chevalier",99,"CHEMICAL REACTION","PXG: Charles' contrarian passing repeatedly targets Shido's extreme penalty-area movement."],
  ["Yoichi Isagi","Ranze Kurona",98,"PLANET HOTLINE","Bastard München: rapid orbiting one-twos were built specifically around Isagi's movement and Kurona's turning speed."],
  ["Tabito Karasu","Eita Otoya",98,"ASSASSIN × NINJA","Their play compatibility is repeatedly emphasized; short exchanges and off-ball movement let them read each other at speed."],
  ["Tabito Karasu","Yo Hiori",98,"CROW × ICE","Bambi Osaka history, personal trust, and chapter 337's France match: Karasu directly assists Hiori's equalizer."],
  ["Seishiro Nagi","Reo Mikage",95,"ESTABLISHED DUO","Their creator-finisher understanding is exceptional from Team V through Manshine, but the manga explicitly frames their repeated dependence as a ceiling on further growth."],
  ["Ranze Kurona","Jin Kiyora",92,"DOG HUNT","They share Third Selection/Bastard history, and chapter 364 gives them a direct two-man trap: Kurona presses Teddy while Kiyora seals the escape route."],
  ["Jin Kiyora","Michael Kaiser",95,"BORDERLINE PASS","PXG: Kiyora's extreme-backspin pass stopped perfectly for Kaiser's Magnus, directly creating Kaiser's goal."],
  ["Yoichi Isagi","Meguru Bachira",96,"MONSTER LINK","From Team Z through the Second Selection, Bachira repeatedly seeks the 'monster' he recognizes in Isagi and trusts him to reach the same attacking picture."],
  ["Yoichi Isagi","Seishiro Nagi",94,"SECOND-SELECTION REACTION","Their improvised combinations repeatedly converted each other's weapons into unpredictable scoring routes."],
  ["Yoichi Isagi","Shoei Baro",93,"MUTUAL DEVOURING","Second Selection: Isagi explicitly describes how he and Baro devoured one another to create unforeseeable chemical reactions."],
  ["Michael Kaiser","Yoichi Isagi",92,"RIVAL ALLIANCE","PXG: after prolonged conflict, Kaiser reset his ego and partnered with Isagi to break the genius-led defense."],
  ["Alexis Ness","Yoichi Isagi",84,"UNINTENTIONAL AWAKENING","Chapter 293 proves Isagi can read Ness' awakened pass and score from it, but Ness did not build that play as a trusted Isagi partnership and their personal relationship remains antagonistic."],
  ["Michael Kaiser","Alexis Ness",86,"FRACTURED ELITE DUO","Years of rehearsed combinations give them real technical compatibility, but the PXG match ends with Kaiser severing the dependency and Ness emotionally collapsing."],
  ["Yoichi Isagi","Hyoma Chigiri",91,"SPEED REACTION","Isagi helps Chigiri rediscover his ego, then later selects him specifically because Chigiri's speed can survive inside the Second Selection's devouring reactions."],
  ["Rin Itoshi","Nijiro Nanase",88,"RIN SUPPORT ROUTE","Nanase deliberately trains to become useful to Rin and becomes a dedicated PXG support route, but the relationship is heavily one-sided rather than an equal chemical duo."],
  ["Oliver Aiku","Ikki Niko",92,"UBERS DEFENSIVE CORE","Both are elite readers who repeatedly operate inside Ubers' synchronized defensive rotations, with Aiku anchoring the line and Niko stepping into interception lanes."],
  ["Don Lorenzo","Oliver Aiku",91,"UBERS DEFENSIVE CORE","Lorenzo's elite man-marking and Aiku's reading anchor Ubers' layered defensive system."],
  ["Marc Snuffy","Don Lorenzo",98,"MENTOR CORE","Snuffy built Lorenzo's football career and Ubers system around his rare defensive and ball-carrying qualities."],
  ["Marc Snuffy","Shoei Baro",91,"SUCCESSOR SYSTEM","Snuffy designs Ubers' attack around Baro and later recognizes him as the club's future king."],
  ["Rin Itoshi","Yoichi Isagi",89,"RIVAL READ","They frequently process the same decisive space at an elite level, but their egos make direct cooperation unstable."],
  ["Rin Itoshi","Jyubei Aryu",89,"TOP-3 UNIT","Second Selection: Aryu is a core member of Rin's dominant top-three unit and follows his field control cleanly."],
  ["Rin Itoshi","Aoshi Tokimitsu",89,"TOP-3 UNIT","Second Selection: Tokimitsu's physical pressure complements Rin's control in the top-three unit."],
  ["Rensuke Kunigami","Hyoma Chigiri",94,"TRUSTED POWER × SPEED","They are close from Team Z, deliberately team together in the Second Selection, repeatedly support one another, and combine complementary power/speed weapons."],
  ["Meguru Bachira","Eita Otoya",93,"BARCHA ATTACK","They share Barcha's free attacking structure, and the final NEL match explicitly has Bachira assist Otoya for a goal."],
  ["Don Lorenzo","Ikki Niko",90,"UBERS DEFENSIVE SYSTEM","Niko's reading and Lorenzo's man-marking/ball-carrying function inside the same coordinated Ubers defensive rotations."],
  ["Oliver Aiku","Jyubei Aryu",90,"UBERS DEFENSIVE SYSTEM","Aiku's reading and Aryu's reach/aerial coverage repeatedly share the Ubers back line and the Japan defensive unit."],
  ["Don Lorenzo","Shoei Baro",88,"UBERS TRANSITION","Lorenzo carries through pressure while Baro is the attack's designated finishing point."],
  ["Chris Prince","Seishiro Nagi",85,"MANSHINE DEVELOPMENT","Chris develops Nagi physically, but Nagi struggles to convert the training into independent reproducible creation."],
  ["Agi","Seishiro Nagi",86,"MANSHINE DEVELOPMENT","Agi actively tries to draw out Nagi's creativity, though he opposes Nagi falling back into dependence on Reo."],
  ["Reo Mikage","Hyoma Chigiri",94,"PROVEN CREATOR × RUNNER","Reo assisted Chigiri twice in their Second Selection 3v3 and again assists Chigiri's goal in chapter 295, showing a repeatable creator-runner relationship across arcs."],
  ["Noel Noa","Yoichi Isagi",86,"MASTER / PROTÉGÉ","Noa gives Isagi rational guidance and occasionally enters the same match structure, but they are not a fixed attacking duo."],
  ["Noel Noa","Michael Kaiser",87,"BASTARD SYSTEM","Kaiser is the established ace of Noa's rational Bastard München structure, though Noa does not build every play around him."],
  ["Charles Chevalier","Rin Itoshi",87,"PXG DUAL SYSTEM","Charles can supply Rin's system, but his contrarian personality is more naturally excited by Shido's chaos."],
  ["Charles Chevalier","Tabito Karasu",86,"PXG MIDFIELD","They share PXG's midfield structure and can circulate into either striker system."],
  ["Yo Hiori","Nijiro Nanase",86,"THIRD-SELECTION LINK","Friendly Team A1 teammates who repeatedly function as clean support options around the central striker."],
  ["Yoichi Isagi","Nijiro Nanase",84,"THIRD-SELECTION LINK","Team A1 gave them direct combination experience, though no signature duo developed."],
  ["Tabito Karasu","Yoichi Isagi",86,"TACTICAL FRICTION","They can read and use each other's movement, but chapter 337 shows a genuine philosophical/tactical clash over how Japan should attack."],

  // Team World Five // demonstrated professional passing chains
  ["Leonardo Luna","Julien Loki",97,"KICKOFF PUNISHMENT","Against the First Clear Team, Luna immediately feeds Loki from the restart and Loki turns the pass into the equalizer with his world-class acceleration."],
  ["Pablo Cavasoz","Dada Silva",97,"PINPOINT AERIAL ROUTE","Pablo threads/crosses through pressure to Dada, whose aerial presence turns the delivery into the next scoring action."],
  ["Dada Silva","Adam Blake",97,"AERIAL LAYOFF","Dada converts Pablo's service into a headed layoff and Blake finishes the move, a direct demonstrated two-man scoring connection."],
  ["Julien Loki","Dada Silva",96,"SPEED TO AERIAL","Loki attacks the entire field and later delivers the cross that Dada heads in over Aryu."],
  ["Leonardo Luna","Pablo Cavasoz",95,"CHAIN STARTER","Luna wins possession from Rin and immediately routes the ball into Pablo, starting the sequence that ends with Blake's goal."],
  ["Pablo Cavasoz","Adam Blake",95,"ACCURACY TO POWER","Pablo repeatedly facilitates the World Five passing chain and directly routes possession toward Blake in their professional attack."],
  ["Adam Blake","Julien Loki",94,"WORLD-CLASS TRANSITION","Blake supplies Loki during the World Five attack before Loki turns the phase into Dada's scoring cross."],
  ["Pablo Cavasoz","Julien Loki",94,"CONNECTOR × SPEED","Pablo is the team's central passing facilitator while Loki covers both attack and defense, making them naturally compatible inside the World Five optimal-position system."],
  ["Leonardo Luna","Adam Blake",93,"WORLD FIVE ATTACK","Both occupy the World Five attacking chain and repeatedly move possession toward the best-positioned finisher rather than forcing individual plays."],
  ["Leonardo Luna","Dada Silva",93,"WORLD FIVE ATTACK","Luna's progression and Dada's aerial finishing coexist cleanly inside the World Five's optimal-position passing structure."],

  // Additional demonstrated combinations and World Cup relationships
  ["Hyoma Chigiri","Zantetsu Tsurugi",89,"SPEED PAIR","Second Selection: the two speed specialists play on the same clear team, and Zantetsu directly assists a Chigiri goal."],
  ["Hyoma Chigiri","Seishiro Nagi",89,"SECOND-SELECTION / MANSHINE LINK","They clear the Second Selection together and later share Manshine's attack; their weapons can coexist without either needing to dominate possession."],
  ["Rensuke Kunigami","Reo Mikage",88,"SECOND-SELECTION UNIT","Reo and Kunigami remain together after Chigiri is selected away, giving them direct competitive experience and complementary roles."],
  ["Rin Itoshi","Yo Hiori",91,"THIRD-SELECTION CREATION","Hiori plays behind Rin on Team A, directly assists one of Rin's goals, and Rin is unusually receptive to him as a support option."],
  ["Rin Itoshi","Ranze Kurona",88,"THIRD-SELECTION ROUTE","Kurona plays in Rin's Team A structure and is credited with assisting Rin's winning goal against Team C."],
  ["Yoichi Isagi","Kenyu Yukimiya",90,"SWORD HEART ASSIST","Chapter 202: Isagi abandons his own shot, backheels through Kaiser's interference, and Yukimiya converts the match-winning Sword Screw."],
  ["Yoichi Isagi","Rensuke Kunigami",89,"BASTARD FINISHING ROUTE","Bastard vs Manshine: Isagi's attack becomes Kunigami's goal, one of the match sequences that establishes Isagi as the side's chance creator."],
  ["Oliver Aiku","Shuto Sendo",91,"CAPTAIN × ACE TRUST","Aiku repeatedly protects and encourages Sendo with the original Japan U-20, and they remain close teammates at Ubers."],
  ["Ikki Niko","Jyubei Aryu",91,"ANTI-PRODIGY DEFENSE","Chapter 245 explicitly pairs Niko and Aryu in Ubers' anti-prodigy defense against Nagi."],
  ["Shoei Baro","Ikki Niko",90,"UBERS COUNTER ROUTE","Chapter 245 shows Baro using Niko as the safe recycle option under pressure and receiving the return to immediately restore his attack."],
  ["Shoei Baro","Shuto Sendo",87,"KING × HYENA","They can combine inside Ubers and Sendo celebrates Baro's goals, but they also compete as forwards and Baro openly belittles Sendo's opportunistic finish."],
  ["Meguru Bachira","Lavinho",92,"GINGA MENTORSHIP","Lavinho's free-form dribbling philosophy directly develops Bachira's own monster-based style at Barcha."],
  ["Innocent Onazi","Godwin Kuso",98,"FOSTER-BROTHER AXIS","They grew up playing together; Kuso captains Nigeria, builds attacks around Onazi, and in the Japan match delivers a perfect cross for him after years of shared football."],
  ["Julien Loki","Vivien Hugo",98,"FRANCE GOLDEN AXIS","France U-20: Hugo and Loki have long youth-team history, and Hugo directly assists Loki's goal against Japan."],
  ["Charles Chevalier","Vivien Hugo",97,"FRANCE CREATOR PAIR","Against Japan, Hugo assists Charles' opener and Charles later assists Hugo's goal; their reciprocal creation is demonstrated in the same match."],
  ["Julien Loki","Charles Chevalier",94,"MASTERED PLAYMAKER ROUTE","Loki brings Charles into the NEL to develop him as a midfielder and they continue together as core France U-20 creators."],
  ["Teddy Knight","Lockhart",94,"FOX SYSTEM FINISH","Chapter 360: Teddy's cross directly creates Lockhart's go-ahead header, a clean example of England's automated collective football."],
  ["Teddy Knight","Achanpong",88,"ENGLAND VOLUNTEER SYSTEM","Achanpong explains that England willingly chose Fox's collective system; Teddy is its elite attacking reference and Achanpong its captain."],
  ["Agi","Teddy Knight",72,"SYSTEM FRICTION","They share England U-20, but Agi is removed for allowing his individual ego to disrupt Fox's system while Teddy remains its ideal obedient star."],

  // Explicitly poor or unstable links
  ["Junichi Wanima","Hyoma Chigiri",55,"BAD BLOOD","They share high-school history, but Junichi's treatment of Chigiri and Team W's attempt to exploit his fear make this a poor trust relationship rather than useful chemistry."],
  ["Keisuke Wanima","Hyoma Chigiri",55,"BAD BLOOD","They share high-school history, but Keisuke joins the psychological pressure on Chigiri instead of functioning as a trusted partner."],
  ["Sae Itoshi","Shuto Sendo",67,"DISMISSIVE PLAYMAKER","Sae repeatedly belittles Sendo's finishing during the original U-20 match; they can occupy the same attack, but trust and mutual respect are poor."],
  ["Ryusei Shido","Shuto Sendo",48,"HOSTILE TEAMMATES","Shido physically attacks Sendo before the U-20 match and Sae's preference for Shido further worsens the relationship."],
  ["Seishiro Nagi","Shoei Baro",80,"VOLATILE TEAM WHITE","They can function in the same Second Selection attack, but their constant clashes and competing egos make the partnership unstable."],
  ["Rin Itoshi","Ryusei Shido",58,"INCOMPATIBLE EGOS","Ego states they failed to spark a chemical reaction; PXG initially required separate systems, and they still clash after the France match."],
  ["Rin Itoshi","Sae Itoshi",62,"FRACTURED BROTHERS","They once combined naturally as children, but their shared dream collapsed and their current football relationship is openly hostile."],
  ["Rensuke Kunigami","Ryusei Shido",60,"PERSONAL CONFLICT","Shido eliminated Kunigami from the Second Selection path; their later encounters are defined more by confrontation than combination."],
  ["Sae Itoshi","Bunny Iglesias",58,"INTENSE RIVALRY","Sae is shown reacting bitterly to Bunny and his U-20 World Cup motivation is tied to confronting that rivalry."],
  ["Yoichi Isagi","Vivien Hugo",56,"PHILOSOPHY CLASH","France U-20: Hugo repeatedly challenges Isagi's ego philosophy and tries to redirect his idea of what a striker should be."]
];

const CHEMISTRY_SPECIAL = Object.fromEntries(
  CHEMISTRY_SPECIAL_PAIRS.map(([a,b,score,label,reason])=>[
    [a,b].sort().join("|"),{score,label,reason}
  ])
);

const SHARED_TEAM_CHEMISTRY_FLOOR = 70;
const SHARED_TEAM_FLOOR_EXCEPTIONS = new Set([
  ["Rin Itoshi","Ryusei Shido"].sort().join("|"),
  ["Sae Itoshi","Shuto Sendo"].sort().join("|"),
  ["Ryusei Shido","Shuto Sendo"].sort().join("|"),
  ["Rensuke Kunigami","Ryusei Shido"].sort().join("|"),
  ["Junichi Wanima","Hyoma Chigiri"].sort().join("|"),
  ["Keisuke Wanima","Hyoma Chigiri"].sort().join("|")
]);

function chemistryKey(a,b){return [a.name,b.name].sort().join("|");}
function sharedChemistryContexts(a,b){
    return CHEMISTRY_CONTEXTS.filter(c=>c.players.includes(a.name)&&c.players.includes(b.name));
}
function chemistryRelation(a,b){
    if(!a||!b||a.id===b.id)return {score:0,label:"NO LINK",reason:"A player cannot form chemistry with themself.",contexts:[]};
    const key=chemistryKey(a,b);
    const special=CHEMISTRY_SPECIAL[key];
    const contexts=sharedChemistryContexts(a,b);
    if(special){
        const contextNames=contexts.map(c=>c.name);
        // Shared competitive experience creates a minimum baseline, but only when
        // canon has not explicitly shown the pairing to be dysfunctional.
        if(contexts.length && special.score<SHARED_TEAM_CHEMISTRY_FLOOR && !SHARED_TEAM_FLOOR_EXCEPTIONS.has(key)){
            return {
                ...special,
                score:SHARED_TEAM_CHEMISTRY_FLOOR,
                label:`TEAMMATE FLOOR // ${special.label}`,
                reason:`They have genuine shared-match experience, so their baseline is ${SHARED_TEAM_CHEMISTRY_FLOOR} despite the weaker individual relationship. ${special.reason}`,
                contexts:contextNames
            };
        }
        return {...special,contexts:contextNames};
    }
    if(contexts.length){
        const ordered=[...contexts].sort((x,y)=>y.score-x.score);
        const score=Math.max(SHARED_TEAM_CHEMISTRY_FLOOR,Math.min(91,ordered[0].score+Math.min(6,(ordered.length-1)*2)));
        return {
            score,
            label:ordered.length>1?"REPEATED TEAM HISTORY":"SHARED TEAM HISTORY",
            reason:`Shared competitive history: ${ordered.map(c=>c.name).join(" + ")}.`,
            contexts:ordered.map(c=>c.name)
        };
    }
    return {
        score:55,
        label:"UNPROVEN LINK",
        reason:"No sustained shared on-field system has been demonstrated in Blue Lock through chapter 364.",
        contexts:[]
    };
}
function playerChemistry(a,b){return chemistryRelation(a,b).score;}
function chemistryTier(v){return v>=95?"chemical":v>=90?"elite":v>=82?"strong":v>=70?"link":"weak";}
function chemistryTierLabel(v){return v>=95?"CHEMICAL":v>=90?"ELITE":v>=82?"STRONG":v>=70?"LINK":"WEAK";}

// Explicit tactical adjacency. Position-to-position links never change merely
// because the XI is incomplete. Slot numbers match FORMATIONS below.
const FORMATION_CHEMISTRY_EDGES = {
  "4-3-3":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,5],[2,5],[2,6],[3,6],[3,7],[4,7],
    [5,6],[6,7],
    [5,8],[5,9],[6,8],[6,9],[6,10],[7,9],[7,10],
    [8,9],[9,10]
  ],
  "4-2-3-1":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,5],[2,5],[2,6],[3,5],[3,6],[4,6],[5,6],
    [5,7],[5,8],[6,8],[6,9],[7,8],[8,9],
    [7,10],[8,10],[9,10]
  ],
  "4-4-2":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,5],[2,5],[2,6],[3,7],[3,8],[4,8],
    [5,6],[6,7],[7,8],
    [5,9],[6,9],[6,10],[7,9],[7,10],[8,10],[9,10]
  ],
  "4-1-3-2":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,6],[2,5],[3,5],[4,8],
    [5,6],[5,7],[5,8],[6,7],[7,8],
    [6,9],[7,9],[7,10],[8,10],[9,10]
  ],
  "4-3-2-1":[
    [0,2],[0,3],[1,2],[2,3],[3,4],
    [1,5],[2,5],[2,6],[3,6],[3,7],[4,7],
    [5,6],[6,7],
    [5,8],[6,8],[6,9],[7,9],[8,9],[8,10],[9,10]
  ],
  "3-4-3":[
    [0,1],[0,2],[0,3],[1,2],[2,3],
    [1,4],[1,5],[2,5],[2,6],[3,6],[3,7],
    [4,5],[5,6],[6,7],
    [4,8],[5,8],[5,9],[6,9],[6,10],[7,10],[8,9],[9,10]
  ],
  "3-5-2":[
    [0,1],[0,2],[0,3],[1,2],[2,3],
    [1,4],[1,5],[2,5],[2,6],[2,7],[3,7],[3,8],
    [4,5],[5,6],[6,7],[7,8],
    [4,9],[5,9],[6,9],[6,10],[7,10],[8,10],[9,10]
  ],
  "3-4-2-1":[
    [0,1],[0,2],[0,3],[1,2],[2,3],
    [1,4],[1,5],[2,5],[2,6],[3,6],[3,7],
    [4,5],[5,6],[6,7],
    [4,8],[5,8],[5,9],[6,8],[6,9],[7,9],[8,9],[8,10],[9,10]
  ],
  "5-3-2":[
    [0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,5],
    [1,6],[2,6],[2,7],[3,7],[4,7],[4,8],[5,8],
    [6,7],[7,8],
    [6,9],[7,9],[7,10],[8,10],[9,10]
  ],
  "5-2-3":[
    [0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,5],
    [1,6],[2,6],[3,6],[3,7],[4,7],[5,7],[6,7],
    [6,8],[6,9],[7,9],[7,10],[8,9],[9,10]
  ]
};

function formationChemistryForAssignment(teamNumber,ass,formation=formationByTeam[teamNumber]||"4-3-3",activeSlotsInput=null){
    const team=teamByNumber(teamNumber);
    const shape=FORMATIONS[formation];
    const edgePairs=FORMATION_CHEMISTRY_EDGES[formation]||[];
    const activeSlots=activeSlotsInput||new Set(shape.map((_,i)=>i));
    const eligibleEdges=edgePairs.filter(([a,b])=>activeSlots.has(a)&&activeSlots.has(b));

    const links=eligibleEdges.map(([ai,bi])=>{
        const aId=ass?.[ai],bId=ass?.[bi];
        if(!aId||!bId)return null;
        const aPlayer=team.players.find(p=>p.id===aId);
        const bPlayer=team.players.find(p=>p.id===bId);
        if(!aPlayer||!bPlayer)return null;
        const relation=chemistryRelation(aPlayer,bPlayer);
        return {
            a:{index:ai,slot:shape[ai],p:aPlayer},
            b:{index:bi,slot:shape[bi],p:bPlayer},
            value:relation.score,
            relation
        };
    }).filter(Boolean);

    const deployed=Object.entries(ass||{}).map(([i,id])=>({index:Number(i),player:team.players.find(p=>p.id===id)})).filter(x=>x.player);
    const knownPairs=[];
    for(let i=0;i<deployed.length;i++)for(let j=i+1;j<deployed.length;j++){
        const a=deployed[i].player,b=deployed[j].player,key=chemistryKey(a,b);
        const relation=chemistryRelation(a,b);
        if(relation.contexts.length||CHEMISTRY_SPECIAL[key])knownPairs.push(relation.score);
    }

    const tacticalWeight=l=>l.value<70?1.18:l.value>=95?1.08:1;
    const weightTotal=links.reduce((n,l)=>n+tacticalWeight(l),0);
    const tacticalAverage=weightTotal?links.reduce((n,l)=>n+l.value*tacticalWeight(l),0)/weightTotal:0;
    const familiarityAverage=knownPairs.length?knownPairs.reduce((a,b)=>a+b,0)/knownPairs.length:0;
    let overall=0;
    if(tacticalAverage&&familiarityAverage)overall=Math.round(tacticalAverage*.86+familiarityAverage*.14);
    else overall=Math.round(tacticalAverage||familiarityAverage||0);
    overall=Math.max(0,Math.min(100,overall));

    const sorted=[...links].sort((x,y)=>y.value-x.value);
    const counts={chemical:0,elite:0,strong:0,link:0,weak:0};
    links.forEach(l=>counts[chemistryTier(l.value)]++);
    return {
        overall,
        links,
        counts,
        activeLinks:links.length,
        possibleLinks:eligibleEdges.length,
        knownPairs:knownPairs.length,
        deployedCount:deployed.length,
        coverage:eligibleEdges.length?Math.round(links.length/eligibleEdges.length*100):0,
        top:sorted[0]||null,
        weakest:sorted.length?sorted[sorted.length-1]:null
    };
}
function formationChemistry(teamNumber){
    const formation=formationByTeam[teamNumber]||"4-3-3";
    const activeSlots=typeof activeFormationSlotIndices==="function"
      ?activeFormationSlotIndices(teamNumber)
      :new Set((FORMATIONS[formation]||[]).map((_,i)=>i));
    return formationChemistryForAssignment(teamNumber,formationAssignments[teamNumber]||{},formation,activeSlots);
}

function chemistrySvg(teamNumber){
    const c=formationChemistry(teamNumber);
    return `<svg class="chemistry-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Player chemistry links">${c.links.map(l=>`
      <line
        x1="${l.a.slot.x}" y1="${l.a.slot.y}" x2="${l.b.slot.x}" y2="${l.b.slot.y}"
        class="chem-link ${chemistryTier(l.value)}"
        data-a-id="${l.a.p.id}" data-b-id="${l.b.p.id}"
        aria-label="${esc(l.a.p.name)} and ${esc(l.b.p.name)} chemistry ${l.value}, ${esc(l.relation.label)}"
        onpointerenter="showChemistryTooltip(event,this)"
        onpointermove="moveChemistryTooltip(event)"
        onpointerleave="hideChemistryTooltip()"></line>`).join("")}</svg>`;
}

let chemistryTooltipEl=null;
function showChemistryTooltip(event,line){
    document.querySelectorAll(".chem-link.chem-active").forEach(el=>el.classList.remove("chem-active"));
    line.classList.add("chem-active");
    line.ownerSVGElement?.classList.add("chem-inspecting");
    const team=teamByNumber(formationTeamNumber);
    const a=team.players.find(p=>p.id===Number(line.dataset.aId));
    const b=team.players.find(p=>p.id===Number(line.dataset.bId));
    if(!a||!b)return;
    const r=chemistryRelation(a,b);
    if(!chemistryTooltipEl){
        chemistryTooltipEl=document.createElement("div");
        chemistryTooltipEl.className="chemistry-tooltip";
        document.body.appendChild(chemistryTooltipEl);
    }
    chemistryTooltipEl.innerHTML=`
      <div class="chem-tip-score ${chemistryTier(r.score)}">${r.score}</div>
      <div class="chem-tip-copy">
        <span>${esc(chemistryTierLabel(r.score))} // ${esc(r.label)}</span>
        <strong>${esc(a.name)} × ${esc(b.name)}</strong>
        <small>${esc(r.reason)}</small>
      </div>`;
    chemistryTooltipEl.classList.add("show");
    moveChemistryTooltip(event);
}
function moveChemistryTooltip(event){
    if(!chemistryTooltipEl)return;
    const pad=14;
    let x=event.clientX+18,y=event.clientY+18;
    const rect=chemistryTooltipEl.getBoundingClientRect();
    if(x+rect.width>window.innerWidth-pad)x=event.clientX-rect.width-18;
    if(y+rect.height>window.innerHeight-pad)y=event.clientY-rect.height-18;
    chemistryTooltipEl.style.left=Math.max(pad,x)+"px";
    chemistryTooltipEl.style.top=Math.max(pad,y)+"px";
}
function hideChemistryTooltip(){
    chemistryTooltipEl?.classList.remove("show");
    document.querySelectorAll(".chemistry-lines.chem-inspecting").forEach(el=>el.classList.remove("chem-inspecting"));
    document.querySelectorAll(".chem-link.chem-active").forEach(el=>el.classList.remove("chem-active"));
}

function chemistryLinkName(link){
    return link?`${link.a.p.name} × ${link.b.p.name}`:"—";
}
function chemistryHud(teamNumber,team){
    const c=formationChemistry(teamNumber);
    const top=c.top,weak=c.weakest;
    return `<div class="chemistry-hud chemistry-hud-v2" style="${teamVars(team)}">
      <div class="chem-score">
        <span>TEAM CHEMISTRY</span>
        <strong>${c.overall||"--"}</strong>
        <small>FAN MODEL // CANON GAMEPLAY THROUGH CH.364</small>
      </div>
      <div class="chemistry-summary">
        <div><span>TACTICAL LINKS</span><strong>${c.activeLinks}<small> / ${c.possibleLinks}</small></strong></div>
        <div><span>CHEMICAL</span><strong>${c.counts.chemical}</strong></div>
        <div><span>ELITE</span><strong>${c.counts.elite}</strong></div>
        <div><span>STRONG</span><strong>${c.counts.strong}</strong></div>
      </div>
      <div class="chemistry-featured">
        <div class="best"><span>BEST ACTIVE LINK</span><strong>${top?esc(chemistryLinkName(top)):"ADD PLAYERS"}</strong><b class="${top?chemistryTier(top.value):""}">${top?top.value:"--"}</b></div>
        <div class="risk"><span>LOWEST ACTIVE LINK</span><strong>${weak?esc(chemistryLinkName(weak)):"ADD PLAYERS"}</strong><b class="${weak?chemistryTier(weak.value):""}">${weak?weak.value:"--"}</b></div>
      </div>
      <div class="chem-key">
        <b>LINE KEY</b>
        <span><i class="chemical"></i>95+</span>
        <span><i class="elite"></i>90+</span>
        <span><i class="strong"></i>82+</span>
        <span><i class="link"></i>70+</span>
        <span><i class="weak"></i>&lt;70</span>
      </div>
    </div>`;
}

