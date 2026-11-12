# v0.8.9 — Battle Sim: Ego & Intelligence

Battle Sim release covering the v0.8.9 brief: physical through balls, tactical intelligence, a reusable data-driven ability framework, Isagi's rebuilt kit, chemical reactions with four partners, localized character dialogue and a balance recalibration. No player ratings, Base OVR, positions, chemistry values or canon facts change. The canon cutoff (`APP_SUPPORTED_CHAPTER`) is unchanged.

## Root causes found

1. **Teleporting through balls.** `resolvePass` ended successful through balls with `setPosition(receiver,to)`: the receiver appeared wherever the ball was aimed, however far away. Only the lane interceptions and the reception contest at the target were modelled. About 30–40 through balls per match were completed at 92–99%, and with realistic lineups this produced 7–12 goals per match. Scrambled lineups (roster order) had hidden the problem in the old balance tests.
2. **No intentions.** Off-ball players picked a new best spot every tick. Nobody started a run *before* a pass, passers had no notion of a run, and defenders could not track one.
3. **Abilities were stat multipliers.** Metavision was +10% OFF/SPD off the ball. Direct Shot was a per-nearby-defender bonus. Two-Gun Volley doubled SHO. None of them reflected what the weapon does in the manga.

## Architecture

All of the new behaviour lives in `js/battle-sim.js` (a classic script, no build step).

- **Awareness** (`battleAwareness`): vision, space reading, defensive read and scan distance come from ratings (PAS/OFF/DEF). A kit can add to them (`battleSim.awareness`) and to character tendencies (`battleSim.tendencies`). These are evaluation weights, not success bonuses. The results are cached per player object.
- **Intents** (`p.intent`): a short plan stored on the player and saved with the match.
  - `run`: a timed, onside run into a gap in the back line (`findRunGap`), or into the box against a deep block. It becomes *primed* when the runner reaches full speed at his mark.
  - `hold`: an unused run holds its ground instead of snapping back.
  - Intents are re-validated every tick. They are closed when a defender reaches the target or the line moves, and a short rest stops endless re-runs. At most two runners at a time.
- **Recognition and tracking**:
  - A passer offers a through ball to a run only if it is inside his scan distance (`seesRun`), or a synchronised partner is making it.
  - Defenders mark a run's destination only if they read it (`tracksRun`). A blind-side run needs an elite reader.
- **Ability framework**: each kit entry carries `effect` + `params`, and the engine runs shared effect handlers. Other characters can reuse the same effects by declaring them.
  - Effects: `space-reading`, `blind-spot-run`, `tactical-memory`, `first-time-finish`, `weak-foot-finish`, `disguised-finish`, `feint-volley`.
  - Reactions: `synchronized-through`, `wall-pass`, `exploit-disruption`, `rival-cooperation`.
  - Old-style `statBonuses`/`specials`/`ultimates` entries still run for kits that use them. Effect entries skip the old paths, so the two schemas never stack.
- **Finishing techniques** (`shotTechniques`) are alternatives evaluated by the same `shotModel`, through a `technique` parameter:
  - aim point (near or far post), a small technique term on the logit scale;
  - pressure relief (a first-time finish denies the closest defender his moment);
  - block factor, and one bypassed defender (a feint or backheel).
  - The goalkeeper term is never touched.
- **State and saves**: tactical memory, ability uses, recent lines, reaction cooldowns, the last reception and `lastMove` live on the player or match. `sanitizeIntelligence` re-validates them on load: bounded, finite and limited to known kinds. Forged intents are dropped. New event fields (`runRoute`, `ability`, `abilityNote`, `reaction`, dialogue `key`) are validated in `hydrateMatch`.

## Through-ball fix

`resolveThroughBall` replaces the teleport with a race:

- `ballFlight` samples the ball's path every 1.5 m: ground balls decelerate as they roll, lofted balls can only be reached near the passer or around the landing point.
- **Who races:**
  - The receiver: from a standing start, or already running (`v0`) if his primed run points where the ball goes.
  - Every defender within reach. One who has to turn to chase a ball played behind him reacts later, and later again for a blind-side run he did not read.
  - The goalkeeper, sweeping inside his area or close to it.
- Each racer's earliest interception point comes from his reaction time, acceleration and top speed (`timeToCover`).
- **Possible outcomes:**
  - The receiver collects.
  - A defender intercepts.
  - The keeper claims or sweeps.
  - A contested arrival, decided by a duel.
  - The ball runs out (throw-in, goal kick or corner).
  - The ball stops and the first player to arrive collects it.
- Everyone moves only the distance they could physically cover in the time the play took.
- **Decisions** use the same race without execution error, over under-hit, true and over-hit pace cases. The pass is valued where the runner would actually meet the ball.
- **Unchanged:** offside is judged first, as before (Law 11). RNG use is seeded, so saves and fast-forward reproduce exactly.

## Isagi's kit (Base OVR 94, ratings unchanged)

| Kit entry | Behaviour |
|---|---|
| Metavision (passive) | Wider scan; predicts the back line's shift when choosing a gap; anticipation 0.6 (earlier reactions on runs). No stat or speed bonus. Awareness is folded in here. |
| Blind-Spot Movement (passive) | Runs into the space behind his marker's line of sight are only tracked by elite readers (DEF read + anticipation); other defenders react 0.12 s later to the pass. |
| Adaptability (passive) | Match-only memory of closed run channels, intercepted passing lanes, saved shot placements and offside traps (≤ 6 entries, count ≤ 3, fades after 90 ticks). Steers choices; never adds success. |
| Direct Shot | First-time finish from a pass inside 24 m: technique +0.25 logit (plus passer quality), 2.5 m pressure relief, blocks ×0.7, aimed far post. |
| Left-Footed Direct Shot | Same finish to the near post at −0.12 technique; chosen when the far lane is blocked or remembered. |
| Reverse Back Heel Shot | Only when moving away from goal with a defender within 2.6 m inside 14 m; bypasses that defender at −0.45 technique; 40-tick cooldown. |
| Two-Gun Volley (ultimate) | Flow + first-time pass + a committing defender within 3.6 m; that defender is bypassed and the strike switches to the open side (+0.45). Keeper still contests. Max 1 goal and 2 attempts per match. |

Weapon dossier texts (`battleSimType`/`battleSimDescription`) describe the new behaviour; the canon weapon descriptions are untouched.

## Chemical reactions

Each reaction is declared in Isagi's kit with a partner id. Every reaction:

- requires both players to be active on the same team (a substitution removes it);
- has a cooldown in `state.reactionCooldowns`;
- is never guaranteed: it changes precision or choice value, and the physical race and shot model still decide the outcome.

| Reaction | Trigger and effect |
|---|---|
| Reflexive Synchronization (Hiori) | Hiori on the ball: Isagi sets off on the same beat. Hiori sees the run beyond his scan and plays it with 0.55× pace and direction error. |
| Planet Hotline (Kurona) | Isagi pressed (opponent within 6 m) with Kurona within 20 m: the pass into Kurona is favoured and Isagi starts a blind-side run behind his marker. Kurona's return is tagged and played with 0.6× error. |
| Creative Instinct (Bachira) | A Bachira dribble that draws two or more defenders, or beats one: Isagi moves into the space they left (onside), and Bachira can find him there. |
| Rational Alliance (Kaiser) | The rivals prefer their own shot (small value tax on passing to each other). They pass only when the other's chance is clearly better (+0.08). |

## Dialogue and presentation

- 25 original fan-written lines for Isagi, keyed and translated in all 11 languages (`js/i18n/battle-messages.js`). No line repeats back to back, minor lines are throttled, and major moments (finishing techniques, goals, reactions, Flow) always speak.
- The feed shows restrained, translated chips:
  - ability (weapon, ultimate, passive);
  - reaction (dashed);
  - an "ADAPTABILITY" note when memory changed the chosen finish.
- Chips appear on the event that is happening. Shot chips never reveal the outcome before the result event.
- The pitch draws the receiver's run (dotted cyan) from where he started to where he met the ball. It is drawn from the same event data as the simulation and is hidden when there is no run.
- The match dossier lists signature weapons as SPECIAL and reactions as CHEMICAL REACTION, with live statuses: ready, cooldown, requires Flow, used this match, partner not on pitch.

## Balance recalibration

Physical through balls removed the teleport's goals. The engine is recalibrated on **positional lineups** (primary positions first, a stand-in for Auto Best) instead of roster order:

- `shotUplift(m)`: 1.3 inside 16 m, fading to the old 0.9 at 32 m and beyond.
- Striker ego is now a bounded multiplier: 1 + (0.5 + tempo + SHO + Flow terms) × character shoot tendency. It applies only to chances above 4% and ramps to full by 13%, so speculative long shots stay rare.
- Character tendencies come from ratings: shooters shoot, dribblers dribble (×0.08) and passers pass (×0.02).
- Deep blocks are attacked with onside runs into the box once the ball reaches the final third.

The v0.8.3, v0.8.8.3 and v0.8.8.5 balance samples now use positional lineups (`positionalAssignment` in `battle-sim-tests.js`). The v0.8.8.3 frozen-ball convergence check rests run intents, because tactical runs are deliberate movement.

## Results (seeded, positional lineups, 6 matches per row)

Before (v0.8.8.5 on `main`) → after (v0.8.9).

| Scenario | Goals | Shots | Pass % | Interceptions | Actions/possession | v0.8.9 balls behind the line (att / completed, keeper claims, 6 matches) | Isagi goals/shots | ms/tick |
|---|---|---|---|---|---|---|---|---|
| none/ordinary | 9.83 → 4.33 | 40.7 → 17.2 | 85.7 → 85.6 | 9.7 → 11.8 | 5.09 → 5.61 | 30.7 / 70% (15 keeper) | 0/0 → 0/0 | 1.91 → 2.86 |
| none/defensive | 7 → 2 | 30.3 → 13.5 | 85.3 → 88.1 | 13.8 → 10.3 | 5.74 → 8.12 | 25.2 / 66% (13 keeper) | 0/0 → 0/0 | 1.71 → 2.47 |
| isagi/ordinary | 12.33 → 2.67 | 41.3 → 13.3 | 84 → 85 | 12.3 → 13.8 | 4.8 → 6.06 | 33 / 69% (17 keeper) | 3.17/13.67 → 0.33/2.33 | 1.69 → 2.95 |
| isagi/defensive | 7.33 → 2.5 | 26.3 → 12.2 | 87.1 → 88.4 | 10.8 → 9.2 | 6.54 → 8.13 | 20.5 / 71% (6 keeper) | 2.17/7.33 → 0.5/3.83 | 1.48 → 2.6 |
| hiori/ordinary | 12.5 → 1.67 | 40.5 → 11.2 | 83.5 → 87.4 | 14.8 → 10.7 | 4.62 → 7.22 | 30.8 / 74% (15 keeper) | 5/15.33 → 0/3 | 1.43 → 3.03 |
| hiori/defensive | 8.67 → 2.17 | 30.3 → 11.5 | 87.3 → 88.3 | 8.8 → 10.7 | 6.44 → 8.82 | 18.8 / 59% (11 keeper) | 3.33/11.17 → 0.83/4.67 | 1.51 → 2.56 |
| kurona/ordinary | 9.17 → 2 | 38.2 → 17.5 | 83.5 → 86.8 | 12.8 → 11.5 | 5.01 → 6.52 | 24.3 / 71% (14 keeper) | 2.83/12.67 → 0.5/6.33 | 1.59 → 2.45 |
| kurona/defensive | 8.33 → 2.67 | 32.3 → 13.7 | 85.1 → 87.5 | 10.8 → 11.8 | 5.62 → 7.45 | 24.5 / 65% (7 keeper) | 2/8.5 → 1.5/6 | 1.61 → 2.47 |
| bachira/ordinary | 9.17 → 2.33 | 38 → 12.2 | 83.3 → 86.9 | 14.2 → 13.5 | 5.07 → 6.44 | 27.8 / 67% (18 keeper) | 3.5/13.17 → 0.5/3.5 | 1.53 → 2.53 |
| bachira/defensive | 5.33 → 2.33 | 29 → 11.3 | 86 → 89.9 | 13.2 → 8 | 5.88 → 9.56 | 23 / 66% (10 keeper) | 3.17/10.5 → 1.17/6.33 | 1.54 → 2.6 |
| kaiser/ordinary | 9.33 → 3.5 | 41.7 → 17.8 | 83.7 → 88.8 | 13.5 → 8.7 | 4.98 → 6.82 | 28.7 / 72% (12 keeper) | 1.33/5.17 → 0.5/1.83 | 1.51 → 2.53 |
| kaiser/defensive | 9.33 → 1.67 | 32 → 11.8 | 85.4 → 88 | 13.5 → 13.2 | 5.47 → 7.51 | 19.5 / 60% (10 keeper) | 1.67/3.83 → 0.17/1.67 | 1.48 → 2.29 |

Per match, both teams, 6 seeded matches per row. In the scenario names, `isagi` means Isagi plays and `hiori`/`kurona`/`bachira`/`kaiser` means Isagi plus that partner. `defensive` means the opponent is the 14 highest-DEF players in a low block.

In v0.8.8.5, every ball played into space was described as a through ball and completed 92–99% of the time. The v0.8.9 column counts only balls played beyond the last defender.

Ability labels across the 72 v0.8.9 matches: {"off-the-ball-movements": 92, "direct-shot": 56, "left-footed-direct-shot": 45, "metavision": 1}. Reactions: {"reflexive-synchronization": 24, "creative-instinct": 4, "rational-alliance": 7}. The harness is not part of the repository; Preflight runs the equivalent smaller sample in `battle-v089-tests.js`.

## Tests

`scripts/battle-v089-tests.js` (added to Preflight):

- **Through balls:** 120 random races respect sprint limits; receiver, defender, keeper and contested outcomes; run routes on completions; offside first; determinism.
- **Intelligence:** per-player awareness; onside runs with at most two runners; blind-side tracking; vision-limited recognition; no Metavision speed bonus.
- **Isagi:**
  - Direct Shot is first-time only and inside 24 m. The keeper still matters, and there is no SHO multiplier.
  - The left foot wins when the far lane is blocked.
  - The back heel is contextual and has a cooldown.
  - The volley needs Flow and a committing defender, with one goal per match.
  - Memory is bounded, decays, is saved and is sanitised.
  - Ratings are unchanged and the kit has no stat bonuses.
- **Reactions:** each trigger, each negative case, cooldowns, the partner is required, and none is guaranteed.
- **Dialogue:** no back-to-back repeats, throttling, and every line and label translated.
- **Full matches:** with and without Isagi and with each partner. No abilities without Isagi, no reactions without partners, at most one volley goal, restorable saves, bounded per-tick cost.

Fixture updates: Isagi's hashes in `scripts/fixtures/roster-v088.json` and `roster-v0881.json` were updated because his `battleSim` kit and dossier Battle Sim texts changed. His stats, positions and canon weapon descriptions did not change. The information-navigation test now expects V0.8.9 in the history.

## Known limitations

- Only Isagi has a kit. Hiori, Kurona, Bachira and Kaiser get their behaviour from rating-derived awareness and tendencies, plus the reactions declared in Isagi's kit.
- Crosses and cut-backs are still generic passes. Most chances come from runs, first-time finishes and edge-of-box shots, and fewer from wide deliveries.
- Possession chains are long (6–8 actions per possession) and many through balls are still played. Runs make that number higher than in real football.
- Isagi's output now depends heavily on service. In matches without a creative passer he takes few shots, which is intended but makes his matches more variable.
- The Two-Gun Volley is rare (it needs Flow, a first-time pass and a committing defender at once). Some matches never see it.
- In the 72-match harness the Two-Gun Volley and the Reverse Back Heel Shot never fired. Unit tests cover both, but in real matches they are close to unseen. The Metavision label appeared once, because it is shown only for reads longer than 30 m.
- Planet Hotline needs Kurona near Isagi. Kurona's listed positions (RB/RWB) put him at full-back in positional lineups, so in the harness the reaction appears only in unit scenes and the Preflight scene. Creative Instinct is also uncommon (4 in 12 Bachira matches).
- Shot volume is below real football: 11–18 shots per match, against about 25 in professional play. Goals are mostly 2–3 per match, with the ordinary no-Isagi pairing at about 4.
- Engine cost per tick rose from about 1.5–1.9 ms to about 2.3–3.0 ms because of the intent planning and the multi-case through-ball estimate. It stays well under the 10–12 ms budgets in the tests.
- The DOM feed test (`battle-dom-tests.js`) is not part of Preflight and needs `linkedom`, which is not installed in this environment, so it was not run. The real-browser suite and a targeted browser check of the new chips, translated lines and run route were run.
