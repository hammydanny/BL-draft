# v0.8.9.4 — Battle Sim Expansion & Polish

## New character kits

All kits are data in `js/players/<slug>/player.js` (`battleSim`) and run through shared engine effects; no stat bonuses.

| Player | Passives | Signature moves | Flow | Reaction |
|---|---|---|---|---|
| Hyoma Chigiri | Top-Speed Specialist (`sprint-momentum`), High-Speed Awareness (`wide-runner`) | No-Break Dribble (`push-dribble`), High-Speed Cut-In (`speed-cut`), Golden Zone Shot (`zone-finish`, 15–23 m / 30–58°) | Red Panther Sniper | Speed and Vision with Isagi (`synchronized-through`) |
| Gin Gagamaru | Wild Reflexes (`reflex-save`), Springlike Body (`acrobatic-reach`) | Super Reflex Save (`super-reflex`), Shachihoko Defense (`smother-block`), Bear Claw Deflection (`extended-parry`), Scorpion Kick (`acrobatic-finish`, outfield only) | Wild Instinct | none |
| Jingo Raichi | Immense Stamina (`durable`), Physical Aggression (`aggression` + `persistent-press`) | Man-Marking (`man-marking` + `quick-recovery`), Stalking Horse Defense (`stalking-horse`), Relentless Duel (`physical-shield`) | Unbreakable Marking | Cornered Prey with Isagi (`mark-and-read`) |
| Asahi Naruhaya | Blind-Spot Specialist (`blind-spot-run`, easier to read than Isagi's), Underdog's Determination (`run-hunger`) | Off-the-Ball Movement (`run-timing`), Ghost Run (`ghost-run`, 14-tick cooldown) | Desperate Breakthrough | none |
| Okuhito Iemon | All-Rounder (`support-movement`, outfield only), Team Organizer (`steady-keeper`) | Set-Piece Readiness (`set-piece-ready`, two ticks) | Last Line of Defence | none |

Naming notes: Bear Claw Deflection, Scorpion Kick and the Shachihoko handstand block (canon reference: "Shachihoko Fish Kick") come from canon references for Gagamaru; Super Reflex Save and Stalking Horse Defense follow how fan references describe established techniques of Gagamaru and Raichi. Top-Speed Specialist, High-Speed Awareness, Red Panther Sniper, Wild Instinct, Physical Aggression, Unbreakable Marking, Underdog's Determination, Ghost Run, Desperate Breakthrough, Team Organizer, Last Line of Defence, Set-Piece Readiness, Speed and Vision and Cornered Prey are gameplay labels. Cornered Prey is a gameplay interpretation of Raichi screening for Isagi at Bastard München, not a named canon technique.

Keeper abilities apply only when the player is in goal; outfield-only abilities never apply in goal. The in-match profile shows "CONDITIONS UNMET" in those cases.

## Engine

- **Goalkeeping:** keepers stand on the ball–goal line (1.4–4.2 m off the line as play approaches, up to 10 m as a sweeper when play is far away). Being off that line makes shots easier. Catch vs parry depends on keeper GK, distance and power.
- **Beaten defenders:** a defender who loses a dribble duel is slowed for one tick (two for a clean beat), only against the player who beat him; DEF/SPD, defensive reading and recovery abilities shorten it; it never stacks past two ticks and is saved with the match.
- **Attacking:** long-range shots weigh the value of keeping the ball (25 m+ shots fell from about 43% to about 25% of shots), the defensive line drops toward the box when the ball is central and close, forwards value onside spots in the box, a midfielder arrives at the edge of the box for cut-backs when the ball is wide, wide players value reaching the byline when team-mates are arriving, strikers following in anticipate rebounds, and a carrier with no support nearby can turn away and shield instead of forcing a hopeless take-on.
- **Marking credit:** a man-marker is credited for interceptions, denied receptions and tackles against his own man.
- **Blue Lock Man:** stamina fixed at 100 and no Flow for both instances, enforced every tick and on load.
- **Reactions:** one definition, one cooldown per reaction per team (`"<team>:<id>"`), shared by both partners; statuses Ready / On cooldown / Partner not on pitch / Conditions unmet.
- **Opportunity metrics:** `globalThis.__bsOpportunity` (no-op in the app) counts eligibility and refusal reasons for Two-Gun Volley, Reverse Back Heel, Rush Volley, Planet Hotline and Second Ball Instinct, plus shot distance, team-mates in the box and rebound distances.

## Data

- Public Base stats capped at 99: Leonardo Luna DRI 100→99; Adam Blake OFF 100→99, SHO 100→99. Stored Base OVR unchanged; Blake's derived FW rating is 95 instead of 96 as a direct result.
- Protected records are byte-identical to v0.8.9.3 (`scripts/fixtures/protected-v0893.json`).

## Presentation

- Dossiers: football weapons link to their kit card (type colour + name) instead of repeating the description; the kit lists passives, specials, ultimate, Flow, then reactions with "WITH: <partner>" from the shared registry. Type colours: passive cyan, special amber, ultimate violet, reaction teal, Flow rainbow (solid fallback without `background-clip:text`, no animation).
- In-match profile: reaction cards get their own row for the partner line; a full Flow meter and an active Flow ability use the rainbow; the profile title stays readable in light mode.
- Match feed: ability/reaction badges sit between the comparison/probability row and the player cards, name their owner (both partners for a reaction), one per ability.
- Side formations: both teams show forwards at the top and the goalkeeper and goal box at the bottom; sizes unchanged.

## Benchmark (180 seeded matches, same harness, 15 scenarios × 3 opponents × 4 seeds)

| | v0.8.9.3 engine | v0.8.9.4 |
|---|---:|---:|
| Goals | 3.02 | 3.24 |
| Shots | 16.43 | 14.23 |
| On target | 9.74 | 8.95 |
| Pass completion | 86.3% | 86.8% |
| Through balls | 27.8 (68%) | 21.3 (70%) |
| Crosses | 1.93 | 1.98 |
| Cut-backs | 0.12 | 0.10 |
| Actions per possession | 5.95 | 6.36 |
| Final-third entries | 23.7 | 23.1 |
| Box entries | 3.88 | 3.99 |
| Beaten-defender delays | – | 37.3 |
| ms per tick | 2.38 | 2.74 |

v0.8.9.1 reference (its own harness): 2.81 goals, 14.68 shots, 1.45 crosses, 0.05 cut-backs, 6.30 actions per possession.

## Known limitations

- Box occupation is still the main bottleneck: box entries and cut-backs barely moved, and most shots are still taken with no team-mate in the box.
- Rebounds won by the attack rose from about 2% to about 9%, but Rush Volley and Second Ball Instinct remain very rare; Cornered Prey did not trigger in the benchmark; Two-Gun Volley is limited by Flow and first-time chances inside 20 m.
- Goals are slightly higher than v0.8.9.3; engine cost is about 15% higher per tick.
