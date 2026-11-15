# John Paccini — Secret Battle Sim Kit

Design source for secret character SC-2 (player ID 80). John is intentionally a joke/chaos character.

## Battle Sim kit

### Passives
- **Scales of Justice** — At match start, on its own feed tick, says: “Perfectly balanced... Just how I intended it to be...” It globally forces every player's shot, dribble and pass success chance to exactly 50%, ignoring buffs, debuffs, stats and modifiers. Interceptions and goalkeeper saves still resolve after a successful action.
- **Omniscient Spectator** — John knows every event that will happen.

### Specials
- **Universal Decree** — Automatically activates when ready; 24-tick cooldown. John randomly selects one of three rules for the next 3 ticks: every player can pass only; every player can only move towards the center; or every player has 0 vision of the pitch. Each rule uses its corresponding John Paccini dialogue.
- **Reverse Fate** — 40-tick cooldown. Activates only after at least 10 ticks have elapsed in the current half. Says: “Time is nothing to me...” Rewinds the complete match state by five ticks, including positions, possession, ball, stamina, Flow, score, goals, cards, substitutions and player availability. Removes the five reverted tick events and preserves only the Reverse Fate message. Player ability and reaction cooldowns are retained. The pitch animates through the five saved states in reverse without replaying reverted feed events.
- **Dimensional Repositioning** — 15-tick cooldown; usable at any time. Says: “You were standing somewhere else a moment ago...” Consumes a separate tick and teleports the current ball carrier to a random legal pitch location, excluding the goal. Ignores formations and is not a pass or dribble.

### Flow
- **Absolute Authority** — On Flow entry, pauses the match and plays a six-tick coin-flip sequence deciding which team receives the next 6 goals. Says: “There is no opponent. There is no competition. There is only my permission.” All other players' abilities are disabled; all other Flow meters reset to 0, including already-active Flow. John can move anywhere without restrictions. Scales of Justice remains in force, so shot, dribble and pass success chances remain 50%. John's special cooldowns are halved.

## Secret mechanic outside the Battle Sim kit
- **Automatic return from substitution** — If John is subbed off, he automatically substitutes himself back in.

## Implementation notes
The coin flip must resolve once for the six-goal sequence, not once per goal. “Next 6 goals” means the selected team is awarded six goals as the sequence resolves; it is not a guarantee of six normal shot outcomes. The 50% rule applies to the base shot/dribble/pass success roll, not downstream interception or goalkeeper-save resolution.
