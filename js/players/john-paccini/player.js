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
   { id:"omniscient-spectator", name:"Omniscient Spectator", label:"OMNISCIENT SPECTATOR", effect:"omniscient-events", interpretation:"gameplay", params:{ futureKnowledge:true }, description:"John knows every event that will happen in the match." }
  ],
  specials: [
   { id:"universal-decree", name:"Universal Decree", label:"UNIVERSAL DECREE", effect:"universal-decree", trigger:"manual", cooldownTicks:13, dialogue:"decree", params:{ durationTicks:3, choices:["freeze","center-only","blindness"], choiceDialogues:{ freeze:"The world will stand still. Every player. Every step.", "center-only":"All paths lead to the center. You will move where I decree.", blindness:"Then let the pitch disappear. Play without sight." } }, description:"Can be used at any time. First announces “I have decided that this is how things will work...”, then selects one rule for the next 3 ticks: all players cannot move; all players can only move towards the center; or all players completely lose vision. 13-tick cooldown." },
   { id:"reverse-fate", name:"Reverse Fate", label:"REVERSE FATE", effect:"reverse-fate", trigger:"manual", cooldownTicks:40, dialogue:"reverseFate", params:{ rewindTicks:5, restore:["positions","possession","ball","stamina","flow","score"], removeEvents:5, refundCooldowns:false, undoGoals:true }, description:"Can be used at any time. Rewinds the match by 5 ticks, restoring player positions, possession, ball location, stamina, Flow and the score; removes the previous 5 events. John's ability cooldowns are not refunded. Can undo goals. 40-tick cooldown." },
   { id:"dimensional-repositioning", name:"Dimensional Repositioning", label:"DIMENSIONAL REPOSITIONING", effect:"dimensional-repositioning", trigger:"manual", cooldownTicks:15, dialogue:"reposition", params:{ target:"ball-carrier", destination:"random-legal-pitch-area", excludeGoal:true, separateTick:true, countsAsPass:false, countsAsDribble:false }, description:"Can be used at any time. As its own tick, teleports the player carrying the ball to a random legal area of the pitch, excluding the goal. Ignores formations and is neither a pass nor a dribble. 15-tick cooldown." }
  ],
  ultimates: [
   { id:"absolute-authority", name:"Absolute Authority", label:"ABSOLUTE AUTHORITY", effect:"absolute-authority", interpretation:"gameplay", dialogue:"absoluteAuthority", oncePerMatch:true, params:{ pauseMatch:true, sequenceTicks:6, coinFlip:true, goalsAwarded:6, disableAbilitiesForAllOthers:true, resetOtherFlowMeters:true, johnFreeMovement:true, successChance:0.5, halveSpecialCooldowns:true }, description:"Upon entering Flow, John pauses the match and performs a six-tick coin-flip sequence to decide which team receives the next 6 goals. All other players' abilities are disabled, and every other player's Flow meter is reset to 0—even if they were already in Flow. John can move anywhere without restrictions. Scales of Justice remains active, so all shot, dribble and pass chances stay at 50%. John's special cooldowns are halved." }
  ],
  dialogue: {
   scales:["Perfectly balanced... Just how I intended it to be..."],
   decree:["I have decided that this is how things will work..."],
   decreeFreeze:["The world will stand still. Every player. Every step."],
   decreeCenter:["All paths lead to the center. You will move where I decree."],
   decreeBlind:["Then let the pitch disappear. Play without sight."],
   reverseFate:["Time is nothing to me..."],
   reposition:["You were standing somewhere else a moment ago..."],
   absoluteAuthority:["There is no opponent. There is no competition. There is only my permission."]
  }
 },
 secretMechanics: {
  automaticReturnFromSubstitution:{ enabled:true, description:"If John is substituted off, he automatically substitutes himself back into the match." }
 }
};