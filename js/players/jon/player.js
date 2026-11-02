// jon is a project-created secret character. Internal ID 85 is retained for save compatibility.
const PLAYER_85_DATA = {
  id: 85,
  secretId: "SC-6",
  name: "jon",
  debutChapter: 1,
  appearanceOrder: 85,
  image: "images/jon3.png",
  primaryPosition: "CM",
  positions: ["CM", "CF", "RW", "LW"],
  secretCharacter: true,
  nationality: null,
  countryName: "Roblox",
  countryFlag: "images/flags/roblox.svg",
  description: "The second best player in Minecraft for Pros. A very competent player that works better on his own. Having multiple personalities that each give him a different skill set. Do NOT ignore him if he is drunk (and playing Barou).",
  quote: "Noo, I was lagging!",
  weapons: [{
    id: "split-personality",
    name: "Split Personality",
    category: "mental",
    description: "There are many different versions of jon, some more threatening than others- this allows for a variety of playstyles and an assortment of abilities unique to each personality. The most threatening one is the Drunk."
  }],
  // CM position-weighted overall, derived from the supplied attributes.
  stats: { ovr: 94, sho: 94, pas: 95, dri: 95, spd: 90, off: 93, def: 97, gk: 72 },
  teamHistory: [
    { name: "Azure Latch", members: ["hdannyy", "jon", "raf", "Syaafi", "Qazicutie", "oka", "floppy_willy"] }
  ]
};
