// Syaafi is a project-created secret character. Internal ID 84 is retained for save compatibility.
const PLAYER_84_DATA = {
  id: 84,
  secretId: "SC-5",
  name: "Syaafi",
  debutChapter: 1,
  appearanceOrder: 84,
  image: "images/syaafi.jpg",
  primaryPosition: "CF",
  positions: ["CF", "LW", "RW"],
  secretCharacter: true,
  nationality: null,
  countryName: "Roblox",
  countryFlag: "images/flags/roblox.svg",
  description: "A haphazard egoist with potential. His presence is an inherent gamble for both teams. Every shot, pass and dribble is a volatile coin-flip between absolute success or a complete turnover.",
  quote: "Why is my E not working?",
  weapons: [{
    id: "your-only-move-is-hustle",
    name: "Your Only Move is Hustle",
    category: "mental",
    description: "Gain style points after using emotes on the field. Does not improve stats."
  }],
  // CF position-weighted overall: SHO 25%, OFF 29%, DRI 17%, PAS 12%, SPD 12%, DEF 3%, GK 2%.
  stats: { ovr: 80, sho: 87, pas: 70, dri: 82, spd: 65, off: 84, def: 65, gk: 70 },
  teamHistory: [
    { name: "Azure Latch", members: ["hdannyy", "jon", "raf", "Syaafi", "Qazicutie", "oka", "floppy_willy"] }
  ]
};
