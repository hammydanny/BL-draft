# v0.8.9.1 — Character Expansion & Battle Sim Refinement

This is a Battle Sim point release on top of v0.8.9. It adds five character kits, a single reaction registry, crosses and cut-backs, and a set of attacking-flow fixes.

What does not change:

- No ratings, Base OVR, positions or chemistry values.
- The canon cutoff stays at **Chapter 368**. The chapter tracker reports an official catalog entry of 369.2 that still needs manual verification, so it was not adopted.

## Character kits

Every entry declares an engine effect, and the effect handlers are shared. A kit entry with no effect has no gameplay. Proposed fan-game labels (for example Ace's Finish, Reclaimed Pride, Optimal Execution, Survival Instinct and Physical Breakthrough) are kept to Battle Sim data. The canon weapon descriptions in the database are unchanged; only `battleSimType` and `battleSimDescription` were filled in.

| Character | Kit (effect) |
|---|---|
| Kira (2) | Composed Forward (`support-movement`: offers a close option to an isolated carrier); Striker's Pride (`pride`: more willing to shoot when trailing or uninvolved, no accuracy change); Ace's Finish (`controlled-finish`: composed placement in a narrow window); Reclaimed Pride (Flow `flow-state`). No reactions, by design. |
| Noa (3) | Rational Football (`rational-decisions`: sharper choice among the top options, no knowledge of rolls); Perfect Ambidexterity (`ambidextrous`: no weaker-foot cost); Elite Off-Ball Movement (`decoy-run` + `support-movement`); Machine Dribble (`power-dribble`: longer straight carries, protection, no sharp cuts); Two-Footed Execution (`switch-foot-finish` against a committed blocker); Optimal Execution (Flow raises these parameters). Reaction Imperial Route with Kaiser (`rival-cooperation`). |
| Bachira (4) | Monster Instinct (`isolation-hunter`); Free Spirit (`free-spirit`: a smaller confidence drop after a lost dribble); Creative Dribbling (`creative-dribble`: sharp cuts, feints that delay the defender, which matters less against elite readers); Creative Passing (`disruption-pass`); Bee Shot (`post-dribble-finish`, with a cooldown); Ginga × Monster (Flow + `dribble-chain`: chained feints). Creative Instinct with Isagi now triggers after one beaten defender. |
| Igarashi (5) | Never Give Up (`persistent-press`); Opportunist (`contact-read`); Malicia (`foul-drawing`, decided by approach angle, speed, distance and defender discipline; outcomes are a foul, keeping the ball, losing it, or a booking for simulation); Right-Side Trap (`right-side-trap`); Survival Instinct (Flow). Fouls he wins become the usual free kicks. |
| Kunigami (6) | Physical Dominance (`physical-shield`: duels, loose balls, aerial contests); Wild Card Physique (`durable`); Power Shot (`power-shot`, 16–32 m, more parries into live second balls); Ambidextrous Finishing (`weak-foot-finish`, with a small cost); Rush Volley (`rebound-volley`, only when the rebound race shows he can reach the ball); Physical Man-Marking (`man-marking`: marks the most dangerous attacker, for example Shidou); Physical Breakthrough (Flow). Second Ball Instinct with Isagi: a reachable rebound from an Isagi shot. |

Isagi's kit keeps its v0.8.9 behaviour, with these changes:

- The Reverse Back Heel Shot can also come from a pass received with his back to goal.
- Two-Gun Volley accepts a blocker in the shot lane as the committing defender.
- Metavision is labelled only for significant reads, throttled per player.

## Shared systems

- **Reaction registry:** one identity per reaction id, whichever member's kit declares it. Duplicate declarations collapse into one, with one cooldown. Roles come from the members, not from the kit that declares it.
- **Dialogue:** kit-driven and keyed for all six kits, no longer Isagi-only.
- **Crosses and cut-backs:** separate pass styles, resolved by the existing physical ball race.
  - Crosses are aimed where the receiver is arriving and are decided by an aerial contest. Arrivals within 0.45 s compete, using a timing and rating proxy (there is no height data).
  - A won cross becomes a header or volley.
  - Keepers still claim crosses and defenders still clear them.
- **Attacking flow:**
  - Forwards push up to the last line once the ball is in the opponent's half.
  - A held run is dropped once play has passed it.
  - Forwards attack the near post, far post and penalty spot when the ball is wide.
  - The defensive line drops towards the box against a wide ball.
  - Possession urgency and counter-attack bonuses.
  - A slightly lower ego threshold for shooting.

## Full-match results

Seeded harness, positional lineups, 13 scenarios × 3 opponents (ordinary, high press, low block) × 3 seeds, 117 matches per engine. Per match, both teams.

| | v0.8.9 | v0.8.9.1 |
|---|---|---|
| Goals | 2.58 | 2.81 |
| Shots / on target | 13.95 / 8.17 | 14.68 / 8.68 |
| Pass completion | 86.1% | 85.8% |
| Through balls behind the line (completed) | 28.6 (66%) | 28.1 (67%) |
| Crosses / cut-backs | not modelled | 1.45 / 0.05 |
| Actions per possession | 6.77 | 6.30 |
| Flow ticks | 8.3 | 9.6 |
| Engine ms per tick (harness, single process) | 4.2 | 3.4 |

Character involvement per match (scenario/opponent ranges):

- Noa: 7–11 dribbles, 2–6 shots.
- Bachira: 4–9 dribbles.
- Kunigami: 5–7 shots, 0.7–1.3 goals.
- Kira: 0.3–1.7 shots and 9–17 passes. He plays as a link forward.
- Igarashi: 0–2.7 Malicia attempts and almost no shots.

Labels seen across the 117 matches:

- Isagi:
  - Off-the-ball movement 87 and Metavision 41.
  - Direct Shot 54, Left-Footed 37, Reverse Back Heel 3.
  - **Two-Gun Volley 0.** One appeared in an earlier 117-match run.
- Noa: Machine Dribble 97, Two-Footed Execution 27, Elite Off-Ball 22, Ambidexterity 25, Optimal Execution 9.
- Bachira: Creative Dribbling 50, Bee Shot 12, Creative Passing 10, Ginga × Monster 3.
- Kunigami: Physical Dominance 54, Power Shot 50, Ambidextrous 11, Physical Breakthrough 6, **Man-Marking 1, Rush Volley 0.**
- Igarashi: Malicia 11, Right-Side Trap 2.
- Kira: Composed Forward 15, Striker's Pride 2.
- Reactions:
  - Reflexive Synchronization 19, Imperial Route 17, Rational Alliance 11.
  - Creative Instinct 5, Planet Hotline 2.
  - **Second Ball Instinct 0.**

## Opportunity analysis (Isagi)

Funnel instrumentation over 12 Isagi + Hiori matches: Isagi's finishing techniques were evaluated 138 times.

- He was in Flow for only 13 of those evaluations.
- He had a first-time chance within 20 m 14 times.
- Both conditions held together once.

The Two-Gun Volley is rare because its canon conditions (Flow plus a first-time chance plus a committing defender) almost never coincide. The trigger logic is not the cause. The deeper reason is low box presence: Isagi is inside 20 m on about 1.4 decisions per match.

The Back Heel had 11 situations inside 16 m. Most failed because no tight defender was goal-side of him.

## Known limitations

- **Shot volume rose only about 5%** (14.0 → 14.7 per match), well short of real football's roughly 25.
  - The bottleneck is progression into the final third and the box. Wide final-third possessions are rare, so crosses stay at about 1.5 per match and cut-backs are almost absent.
  - Changing the ego threshold alone added about 1 shot per match.
- Rare in real matches: Two-Gun Volley, Rush Volley, Second Ball Instinct (0 in the final run), Physical Man-Marking (1) and Planet Hotline (2). Kurona's support runs exist but seldom line up with a pressed Isagi.
- Scoring varies a lot by opponent: about 1.8 goals per match against low blocks, 3.9 against high presses.
- `battle-dom-tests.js` still needs `linkedom`, which cannot be installed here (no network). `scripts/browser-battle-feed.js` provides real-browser coverage of the feed instead (see Tests).

## Tests

- Preflight: passed. It includes the new `scripts/battle-v0891-tests.js` (framework, five characters, crosses and cut-backs, full matches) and the updated v0.8.9 and earlier suites.
- `scripts/browser-battle-sim.js` (real Chrome): passed.
- `scripts/browser-battle-feed.js` (new): passed, 20 views. It checks chips, translated lines, run routes, RTL and overflow for reaction, Bachira, Noa, Kunigami and Igarashi saves in en/ja/ar at 1440, 1280 and 390 px, in light and dark themes.
- Roster fixture hashes for ids 1–6 were updated for the Battle Sim kit fields only. Stats, positions and canon descriptions are unchanged.
