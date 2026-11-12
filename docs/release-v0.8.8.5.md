# v0.8.8.5 — Battle Sim: offside, out-of-play restarts and finishing model

A follow-up to v0.8.8.3 that works through its listed limitations, merged on top of the v0.8.8.4 tactical overhaul. No player ratings, Base OVR, weapons, chemistry values, canon data or formation definitions change. Saves remain compatible: new state fields (`throwInPending`, `previousBall`, `pressRoles`, per-player `supportTarget`/`markTarget`, team `offsides`) are optional and default safely for 0.8.8.3 saves.

## What changed

### Offside (IFAB Law 11)
- A receiver is offside when, at the moment of the pass, he is in the opponents' half, ahead of the ball and beyond the second-last opponent (the keeper counts). Goal kicks, corners and throw-ins are exempt.
- An offside pass is stopped: the defending team gets an indirect free kick where the offence happened (`OFFSIDE` stoppage), and the attacking team records an offside, an incomplete pass and a turnover.
- Runners hold a small safety margin against the line, closer for sharp forwards (OFF) and wider against a high line. After a backward ball the defending line steps up together (more for a high `line` setting), so runs can be caught by a trap.
- Passers read the line with an error that shrinks with vision (PAS/OFF): tight calls are misread both ways; clearly offside runners are never picked.

**Important finding:** with offside enforced, about a third of v0.8.8.3's attacking value came from passes to receivers who were already offside, because defenders could step past runners during the same tick. v0.8.8.4 removes that and replaces it with legitimate runs in behind (below).

### Out of play
- Misplaced passes can now cross the lines drawn on the pitch. Over a touchline: a throw-in to the opponents, taken next tick as a short throw (≤ 28 m, no offside, no stoppage). Over the opponents' byline: goal kick. Over the passer's own byline: corner.

### Finishing model
- The open-play shot model is a smooth expected-goals curve by distance (no step thresholds) with an angle term. SHO and GK enter proportionally on a logit scale, followed by one Blue Lock uplift (`SHOT_UPLIFT`). This replaces the flat "base + 25%" that elite shooters received at every range.
- Blocking and closing-down pressure are unchanged; penalties keep their dedicated duel.
- Decisions use a striker "ego" that makes players bolder with half-chances but tapers for hopeless attempts.

### Attack and passing
- **Runs in behind:** an onside runner level with the last line can be played into the space between the line and the keeper; defenders react a beat late; sweeper keepers can claim it.
- Through balls are ground passes up to 42 m (driven at 19 m/s) and can be cut out in the lane; only very long ones are lofted.

### Merge with v0.8.8.4 and free-kick distance fix
- v0.8.8.5 is built on the collaborator v0.8.8.4 tactical overhaul. Their Adjust Tactics weighting (tempo, directness, pressing, line, width) is kept in shape, support runs, pressing and pass value, combined with this release's offside margin, offside-trap step-up and shared per-decision data.
- v0.8.8.4's free-kick layout placed midfield pressers 3.5 m from the ball and could put attacking-free-kick markers next to it (about 1.2 m away), which also made the v0.8.3 Preflight suite fail on `main`. All opponents are now kept at least 9.15 m away (Law 13); `battle-v083-tests.js` checks the Law 13 distance instead of the older 10 m engine margin, and a 720-layout regression covers every routine, direction and pressing level.

### Performance
- Opponent lists, offside line and opponent attributes are computed once per decision; lane geometry and speed ordering avoid per-call allocation.

## Before and after

40 seeded full matches, random formations/strategies/rosters, same harness for every engine:

| Metric | v0.8.8.2 | v0.8.8.3 | v0.8.8.4 | v0.8.8.5 |
|---|---:|---:|---:|---:|
| Goals per match | 4.15 | 3.55 | 3.40 | 3.77 |
| Shots per match | 17.2 | 16.7 | 18.1 | 16.9 |
| On target per match | 10.5 | 9.7 | 10.6 | 10.5 |
| Scoreless matches | 0 / 40 | 1 / 40 | 3 / 40 | 1 / 40 |
| Pass completion | 30.0% | 85.9% | 86.0% | 84.5% |
| Interceptions per match | 157.4 | 6.9 | 8.3 | 8.0 |
| Actions per possession | 1.55 | 7.3 | 7.0 | 6.5 |
| Lofted share of open-play passes | 1.3% | 28.4% | 26.5% | 19.1% |
| Backward pass on an unopposed forward run | 23.5% | 9.1% | 7.8% | 7.3% |
| Goal kicks with an opponent in the box | 47% | 0% | 0% | 0% |
| Free-kick opponents closer than 9.15 m | — | — | yes (≈1.2 m) | never |
| Offsides / throw-ins per match | — | — | — | ≈0.2–1.2 / ≈0.6–2 |
| Engine time per match (Node, no UI) | ≈260 ms | ≈690 ms | ≈690 ms | ≈540 ms |

Fixed-roster balance sample used by `battle-v083-tests.js` (16 matches): v0.8.8.2 298 shots / 74 goals; v0.8.8.5 363 shots / 71 goals.

Shot distance mix (12 matches): about 42% of attempts from 18 m or more and 6% from 30 m or more, against 41% from 30 m or more in v0.8.8.2.

## Remaining limitations

- Ticks still represent 10–20 s of play each, so the number of actions per match (~220 passes) is lower than real football. Throw-ins and offsides happen at a correspondingly lower absolute rate.
- Throw-ins come only from misplaced passes; tackles, blocks and deflections do not yet put the ball out for throw-ins.
- Pass completion (~85%) sits at the top of the real-football range.
- The engine is still ~2× v0.8.8.2's cost per tick (about 0.5 s to fast-forward a whole match in Node).
