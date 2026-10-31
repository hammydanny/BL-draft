// floppy_willy is a project-created secret character. Internal ID 86 is retained for save compatibility.
const PLAYER_86_DATA = {
  id: 86,
  secretId: "SC-7",
  name: "floppy_willy",
  debutChapter: 1,
  appearanceOrder: 86,
  image: "images/floppy-willy.png",
  primaryPosition: "CF",
  positions: ["CF", "RW", "LW"],
  secretCharacter: true,
  nationality: null,
  countryName: "Roblox",
  countryFlag: "images/flags/roblox.svg",
  description: "An egotistical bastard that only cares about scoring. However, under the right team, will fully utilise his passing capabilities to work well with his teammates.",
  quote: "Bro I was too far...",
  weapons: [{
    id: "skill-run",
    name: "Skill Run",
    category: "technical",
    description: "When on a solo run, disregard all other players and only focus on getting the ball into the net by your own hands. Increases stats when teammates are yelling to pass."
  }],
  // CF position-weighted overall, derived from the supplied attributes.
  stats: { ovr: 88, sho: 91, pas: 84, dri: 86, spd: 84, off: 92, def: 80, gk: 60 },
  profileChemistries: [
    { playerName: "Seishiro Nagi", score: 92, label: "BEST CHARACTER", description: "Best-character chemistry rating supplied for floppy_willy." },
    { playerName: "Kenyu Yukimiya", score: 90, label: "BEST CHARACTER", description: "Best-character chemistry rating supplied for floppy_willy." },
    { playerName: "Yoichi Isagi", score: 84, label: "BEST CHARACTER", description: "Best-character chemistry rating supplied for floppy_willy." },
    { playerName: "Syaafi", score: 67, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with floppy_willy." },
    { playerName: "Qazicutie", score: 88, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with floppy_willy." },
    { playerName: "hdannyy", score: 88, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with floppy_willy." },
    { playerName: "oka", score: 75, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with floppy_willy." },
    { playerName: "jon", score: 50, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with floppy_willy." },
    { playerName: "raf", score: 70, label: "TEAMMATE CHEMISTRY", description: "Project-defined chemistry rating with floppy_willy." }
  ],
  teamHistory: [
    { name: "Azure Latch", members: ["hdannyy", "jon", "raf", "Syaafi", "Qazicutie", "oka", "floppy_willy"] },
    { name: "3-Headed Succubus", members: ["hdannyy", "floppy_willy", "Qazicutie"] }
  ]
};
