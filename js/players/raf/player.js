// raf is a project-created secret character. Internal ID 87 is retained for save compatibility.
const PLAYER_87_DATA = {
  id: 87,
  secretId: "SC-6",
  name: "raf",
  debutChapter: 1,
  appearanceOrder: 87,
  image: "images/secret-character-placeholder.svg",
  primaryPosition: "CF",
  positions: ["CF", "LW", "RW"],
  secretCharacter: true,
  nationality: null,
  countryName: "Roblox",
  countryFlag: "images/flags/roblox.svg",
  description: "A player that’s considered a rare sight in a match, but his presence is notable on the pitch for both positive and negative reasons. An expert Raumdeuter, translating to \"space investigator\" with exceptional blind spot reading and consistently positions himself outside of the oppositions point of view, leading to great opportunities in his favor - if he doesn’t fumble.",
  quote: "I will devour you!",
  weapons: [{
    id: "head-boy-positioning",
    name: "Head Boy Positioning",
    category: "technical",
    description: "Positions himself in unoccupied to create confusion among opposition backlines. Making his first touch greatly effective for scoring goals."
  }],
  // CF position-weighted overall, derived from the supplied attributes.
  stats: { ovr: 75, sho: 84, pas: 71, dri: 65, spd: 62, off: 85, def: 54, gk: 42 },
  profileChemistries: [
    { playerName: "Michael Kaiser", score: 85, label: "BEST CHARACTER", description: "Best-character chemistry rating supplied for raf." },
    { playerName: "hdannyy", score: 90, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with raf." },
    { playerName: "Qazicutie", score: 88, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with raf." },
    { playerName: "Syaafi", score: 82, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with raf." },
    { playerName: "jon", score: 60, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with raf." },
    { playerName: "oka", score: 75, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with raf." },
    { playerName: "floppy_willy", score: 70, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with raf." }
  ],
  teamHistory: [
    { name: "Azure Latch", members: ["hdannyy", "jon", "raf", "Syaafi", "Qazicutie", "oka", "floppy_willy"] }
  ]
};
