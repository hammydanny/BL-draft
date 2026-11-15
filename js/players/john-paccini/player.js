// Character player data: John Paccini (secret dossier SC-001; internal key 80).
const PLAYER_80_DATA = {
 id: 80, secretId: "SC-2", name: "John Paccini", debutChapter: 1, appearanceOrder: 80,
 image: "images/john-paccini.jpg", primaryPosition: "CF",
 positions: ["GK","CB","LB","RB","LWB","RWB","DM","CM","AM","LM","RM","LW","RW","ST","CF","FW","DF","WB","WM","SS"],
 allPositions: true, secretCharacter: true, nationality: null, nationalityUnknown: true,
 description: "A mysterious figure known to appear everywhere.",
 quote: "...", noChemistry: true,
 weapons: [{ id: "mysterious-power", name: "Mysterious Power", category: "technical", description: "Control the fate of the match." }],
 stats: { ovr:100, off:100, sho:100, spd:100, def:100, pas:100, dri:100, gk:100 },
 battleSim: {
  passives: [
   { id:"scales-of-justice", name:"Scales of Justice", label:"SCALES OF JUSTICE", effect:"global-fifty-percent", interpretation:"gameplay", trigger:"match-start", dialogue:"scales", params:{ chance:0.5, actions:["shot","dribble","pass"], global:true, ignoreModifiers:true }, description:"At the start of the match, forces every player's shot, dribble and pass success chance to exactly 50%, ignoring all buffs, debuffs, stats and modifiers. Interceptions and saves still resolve after the action succeeds." },
   { id:"omniscient-spectator", name:"Omniscient Spectator", label:"OMNISCIENT SPECTATOR", effect:"omniscient-events", interpretation:"gameplay", params:{ futureKnowledge:true }, description:"John knows every event that will happen in the match." },
   { id:"chamber-of-time", name:"Chamber of Time", label:"CHAMBER OF TIME", effect:"flow-state", dialogue:"flow", description:"In Flow, everyone on the pitch is fucked." }
  ],
  specials: [
   { id:"universal-decree", name:"Universal Decree", label:"UNIVERSAL DECREE", effect:"universal-decree", trigger:"automatic", cooldownTicks:24, dialogue:"decree", params:{ durationTicks:3, rules:["pass-only","center-only","blindness"] }, description:"John Paccini selects between 3 different rules to affect the next 3 ticks: All players can pass only, all players can only move towards the center, all players have 0 vision of the pitch." },
   { id:"reverse-fate", name:"Reverse Fate", label:"REVERSE FATE", effect:"reverse-fate", trigger:"automatic", cooldownTicks:40, dialogue:"reverseFate", params:{ rewindTicks:5, restore:["all-match-state"], removeEvents:5, preserveJohnMessage:true, refundCooldowns:false }, description:"Reverses the entire match state by 5 ticks, including positions, possession, ball, stamina, Flow, score and goals, plus red cards, yellow cards, substitutions, player availability, and all other match changes. Removes the five reverted tick events while preserving. Does not refund cooldowns." },
   { id:"dimensional-repositioning", name:"Dimensional Repositioning", label:"DIMENSIONAL REPOSITIONING", effect:"dimensional-repositioning", trigger:"manual", cooldownTicks:15, dialogue:"reposition", params:{ target:"ball-carrier", destination:"random-legal-pitch-area", excludeGoal:true, separateTick:true, countsAsPass:false, countsAsDribble:false }, description:"Can be used at any time. As its own tick, teleports the player carrying the ball to a random legal area of the pitch, excluding the goal. Ignores formations and is neither a pass nor a dribble. " }
  ],
  ultimates: [
   { id:"absolute-authority", name:"Absolute Authority", label:"ABSOLUTE AUTHORITY", effect:"absolute-authority", interpretation:"gameplay", dialogue:"absoluteAuthority", oncePerMatch:true, params:{ pauseMatch:true, sequenceTicks:6, coinFlip:true, coinFlips:6, coinFlipEachTick:true, goalsAwarded:6, disableAbilitiesForAllOthers:true, resetOtherFlowMeters:true, johnFreeMovement:true, successChance:0.5, halveSpecialCooldowns:true }, description:"Upon entering Flow, John pauses the match and performs six consecutive coin flips over six ticks. Each tick's independent 50% flip awards that tick's goal to the selected team, for six goals total. All other players' abilities are disabled, and every other player's Flow meter is reset to 0—even if they were already in Flow. John can move anywhere without restrictions. Scales of Justice remains active, so all shot, dribble and pass chances stay at 50%. John's special cooldowns are halved." }
  ],
  dialogue: {
   scales:["Perfectly balanced... Just how I intended it to be..."],
   decree:["I have decided that this is how things will work..."],
   decreeFreeze:["The world will stand still. Every player. Every step."],
   decreeCenter:["All paths lead to the center. You will move where I decree."],
   decreeBlind:["Then let the pitch disappear. Play without sight."],
   reverseFate:["Time is nothing to me..."],
   reposition:["You were standing somewhere else a moment ago..."],
   absoluteAuthority:["There is no opponent. There is no competition. There is only my permission."],
   flow:["Ego? What is this mortal feeling?"]
  }
 },
 secretMechanics: {
  automaticReturnFromSubstitution:{ enabled:true, description:"If John is substituted off, he automatically substitutes himself back into the match." }
 }
};