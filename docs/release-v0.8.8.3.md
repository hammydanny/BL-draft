# v0.8.8.3 — Battle Sim football intelligence and gameplay fixes

A Battle Sim gameplay patch: substitution eligibility, Law 16 goal kicks, off-ball positioning, lane-based passing/interceptions and carrier decision-making. No player ratings, Base OVR, weapons, chemistry values, canon data or formation definitions change. Save schemas stay compatible (older active/result matches are migrated on load).

## Root causes

| Problem | Cause in v0.8.8.2 |
|---|---|
| Substituted players could return | `bench()` was "everyone not in the assignment and not sent off", so a substituted-off player re-entered the reserve list. Nothing recorded match participation. |
| Goal-kick positioning | `arrangeSetPiece()` deliberately left every player where they were (a v0.8.5 test enforced it), so opponents stood in the penalty area in 47% of goal kicks and nobody offered a build-up shape. |
| Clustering / ball-chasing | `moveOffBall()` sent every defender within ~20 m of the ball to the ball's coordinates, pinned attackers to the ball's x plus a fixed lead and pulled all players 35% toward the ball laterally. No teammate spacing existed. |
| Excessive interceptions | Any defender within 10 m of either the passer or the receiver was treated as a direct interception threat; a random one was rolled 50/50 against the passer, and every failure was a clean interception. Combined with clustering, almost every pass was contested. |
| Poor passing decisions | Action choice was a broad random roll (≈40–67% dribble, otherwise pass). About 39% of passes were forced to be ≥45 m long balls when any distant teammate existed, which often meant a backward pass to an isolated defender. |

## Model changes

- **Participation:** every player carries `matchStatus` (`starter`, `reserve`, `subbed-on`, `subbed-off`, `sent-off`) and each team logs `substitutions`. `substitute()` validates at simulation level (eligibility, duplicates, foreign teams, pending mandatory slot). Older saves rebuild participation from substitution events; tampered saves that put a substituted-off player back on are rejected.
- **Shape:** each role keeps a formation anchor that slides with the ball, stretches in possession and compresses toward the ball side out of possession. Attackers search nearby points for open, reachable space with a clear lane and passing distance, capped at the offside line; runners commit to a chosen run for a few ticks. Defending uses one presser, one cover player, an optional lane cutter for aggressive pressing and sticky zonal man-marking that reads planned runs by DEF. Context-dependent separation keeps support players apart without blocking pressing or marking. Players far from their job make SPD-based recovery runs.
- **Passing:** one `passModel()` is used both to choose and to resolve a pass: execution error (PAS, distance, passer pressure, chemistry), lane interception by defenders who can physically reach the actual trajectory in time (ground passes only), and reception contests (feet, lofted, through balls, sweeping keepers). Outcomes: completed, interception, challenged reception (tackle) or misplaced loose ball won by either team.
- **Decisions:** `chooseAction()` evaluates the shot, seven carry/dribble directions and every pass (to feet or into space) with one value scale based on the shared shot model, loss cost and success chance, then varies only among the best four options (temperature set by PAS/OFF vision).
- **Shots and dribbles:** defenders in the shooting lane can block and being closed down affects every shooter (scaled by distance). Dribble tackles depend on defenders who can reach any part of the carry; only engaged defenders can foul. Restarts are kicked from the staged shape before anyone moves.

## Before and after

40 seeded full matches, random formations/strategies/rosters, same harness for both engines:

| Metric | v0.8.8.2 | v0.8.8.3 |
|---|---:|---:|
| Goals per match | 4.15 | 3.55 |
| Shots per match | 17.2 | 16.7 |
| Scoreless matches | 0 / 40 | 1 / 40 |
| Pass completion | 30.0% | 86–87% |
| Interceptions per match | 157.4 | 6.5–7.5 |
| Turnovers per match | 157.4 | ≈32 |
| Possessions per match | 232.5 | ≈47 |
| Actions per possession | 1.55 | ≈7.4 |
| Possessions with 3+ passes | 2.4% | ≈55% |
| Teammate pairs within 3 m (per tick) | 3.37 | ≈0.3–0.4 |
| Backward pass on an unopposed forward run | 23.5% | ≈10% |
| Goal kicks with an opponent in the box | 123 / 261 | 0 |
| Shots from 30 m or more | 41% | ≈18% |
| Engine time per match (Node, no UI) | ≈260 ms | ≈600 ms |

## Limitations

- No offside, throw-ins or out-of-play restarts; attackers are capped at the offside line instead.
- Pass completion (~87%) is on the high side of real football, and lofted/through balls are still ~28% of open-play passes.
- The legacy shot model remains generous for elite shooters; pressure and blocking now temper it but it was not rebalanced.
- Ticks still represent 10–20 s each, so movement is an abstraction of continuous play.
- The engine is ~2.3× slower per tick; fast-forwarding a whole match takes roughly 0.6 s in Node.
