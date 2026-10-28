// Qazicutie is a secret project character. Numeric id 82 is an internal compatibility key;
// SC-003 is the separate identifier shown in the interface.
const PLAYER_82_DATA = {
  id: 82,
  secretId: "SC-003",
  name: "Qazicutie",
  debutChapter: 1,
  appearanceOrder: 82,
  image: "images/secret-character-placeholder.svg",
  primaryPosition: "CF",
  positions: ["CF", "LW", "RW"],
  secretCharacter: true,
  nationality: null,
  nationalityUnknown: true,
  description: "Talkative striker with a very limited set of abilities",
  quote: "Pass it to me we win",
  weapons: [{
    id: "zaruchi-special",
    name: "Zaruchi Special",
    category: "technical",
    description: "Qazicutie aims at the keeper for a suprise shot. Doesn't work"
  }],
  stats: { off: 83, sho: 78, pas: 68, dri: 70, spd: 66, def: 55, gk: 40 },
  profileChemistries: [
    { playerName: "Shoei Baro", score: 85, label: "Best Character", description: "This is the best character they can play" },
    { playerName: "Ryusei Shido", score: 75, label: "SECRET CHARACTER LINK", description: "Project-defined chemistry rating with Qazicutie." },
    { playerName: "hdannyy", score: 88, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with Qazicutie." },
    { playerName: "floppy_willy", score: 88, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with Qazicutie." },
    { playerName: "raf", score: 82, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with Qazicutie." }
  ],
  teamHistory: [
    { name: "Azure Latch", members: ["hdannyy", "jon", "raf", "Syaafi_IV", "Qazicutie", "oka", "floppy_willy"] },
    { name: "3-Headed Cerberus", members: ["hdannyy", "floppy_willy", "Qazicutie"] }
  ]
};
