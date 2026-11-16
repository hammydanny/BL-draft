# 0.8.9.8.12 — Ability activation, World Five + Ishikari, Reflex × Reflex, natural dialogue

Based on main `5b1bbe1` (0.8.9.8.11). Supported chapter stays at 368. Ratings, positions, nationality, chemistry, formations, the intro, Isagi, Hiori, John Paccini and every secret record are unchanged (proof below).

## Measuring first

`scripts/ability-usage-report.js` plays ordinary seeded matches (nothing forced) and reports, per ability: eligible opportunities, rejection reasons, eligible-but-not-selected (with the value gap to the chosen action), attempts, successes/failures, Flow activations and ultimates used per Flow, chips, scorers, Planet Hotline progress and dialogue volume. Diagnostics are recorded only when a harness installs `globalThis.__bsOpportunity` (`abilityDiag` is a no-op otherwise), so the live game pays nothing. `--engine` and `--by-seed` reproduce the baselines. Full numbers: `docs/ability-activation-metrics.json`.

## Root causes found

| Problem | Cause | Fix |
|---|---|---|
| Planet Hotline went nowhere (mean ball progress **−0.3 m / 0.0 m** per sequence over 12/48 matches) | Each tick the receiver only nudged ~3 m from the midpoint, and the next tick's team shape pulled both players back | `hotlineRoute`: a real candidate search (≤14 m, onside, reachable, ≥2 m open, no defender in the lane) for a forward pass or a short lay-off into a partner running forward; the passer then follows; partners are exempt from shape reset during the sequence; never announced unless a route exists |
| Perfect Trapping invisible | Only a +7 control number; no touch, no chip | First touch steers the ball ~2 m into the open side toward goal after lofted/long/threaded balls or under a marker; chip + line; teammates value high balls into Nagi |
| Chameleon rarely learned anything | Observation only through feed chips, which are throttled; tiny whitelist | `noteTechnique` runs where moves are actually performed (also when no chip shows); 13 technical effects; physical gifts, goalkeeping, Flow, ultimates, reactions and personal-geometry moves excluded; copy labels localized; copies feed Reo's Flow |
| Devour almost never armed | Required two defenders already drawn | A teammate taking a defender on counts as attention; reasons logged (most remaining rejections: carrier >38 m from goal) |
| Ultimates "eligible" but always out-valued | Fixed 0.85 weighting | Character-specific `weight`/`value` params where the identity demands it (Adam's charge, Loki's breakthrough); others unchanged |
| Dialogue spam (≈400+ lines per match, "Got it!"×568) | Every actor on every event spoke; generic lines robotic and sometimes wrong ("I’m taking the shot!" before the result, assister saying "Great pass!") | Deterministic speech budget (big moments always; specials with a short gap; routine lines rare); generic lines rewritten and context-checked; robotic kit lines rewritten with the same personality |
| Engine cost | `idOf` (20% of samples) | String fast path; 7.75 → 6.6 ms/tick in the report harness |

## Before / after (48 ordinary seeded matches, same seeds and line-ups)

| | before (main) | after |
|---|---|---|
| Goals per match | 6.04 (±0.40) | 5.92 (±0.36) — no scoring inflation |
| Engine cost | 7.75 ms/tick | 6.57 ms/tick |
| Dialogue lines per match | 416.6 | 144.8 |
| Planet Hotline: sequences / mean ball progress / possession kept | 120 / 0.0 m / 104 | 105 / **+9.2 m** / 96 |
| Perfect Trapping chips | 0 | 253 (only difficult receptions) |
| Most repeated line | Dada "Got it!" ×568 | Raichi "Kurona! He's yours!" ×346 (Ace Neutralization; now limited to once per 60 ticks) |

Controlled Hotline scenes gain about 18 m over three passes in **both** attacking directions; `scripts/battle-v89812-tests.js` requires ≥10 m, three exclusive passes, changing coordinates every pass, cooldown on completion and on early termination, no activation into a blocked pitch, and save/load.

Diagnostics on the same 12 seeds (first baseline vs after): Devour attempts 1 → 3; Puppeteer's Endgame now selected when close (value gap < 0.02); Adam's Unyielding Charge chosen 4/14 eligible (all successful duels); Godspeed Breakthrough chosen when a real gap exists; Reflex × Reflex eligible 4, chosen 3, one finish; Bending Distribution 4 curled passes; 11 of 36 Flow windows of ultimate holders ended with an ultimate used (the baseline did not separate holders from non-holders, so it is not compared).

## New kits (ratings unchanged; names and numbers are fan-game interpretations, `interpretation: true`)

| Player | Passives | Specials | Ultimate (once per Flow) | Identity in the engine |
|---|---|---|---|---|
| Leonardo Luna | Elite Close Control (pressure costs him far less), Flow: Untouchable Rhythm | Deceptive Touch (cd 6, shared counter-dribble), Elegant Breakthrough (cd 8, creative feint with its own cooldown) | Masterful Escape — up to three successive real dribbles (shared dance), each can fail | Tight-space dribbling, not speed |
| Pablo Cavasoz | Pinpoint Accuracy (weighted kick + chance creation), Flow: Exacting Rhythm | Precision Delivery (cd 7), Bending Distribution (cd 9 — the flight curls around the main blocker and comes closer to anyone on the other side) | Precision Masterclass — long ball ≥28 m into a runner's stride | Precision in the kick itself (Sae's is the narrow lane) |
| Adam Blake | Physical Superiority (shield 7, aerial 3), Flow: Unstoppable Engine | Power Shield (cd 7, protected carry), Power Finish (cd 8, 14–30 m, harder to hold, not more accurate) | Unyielding Charge — a real duel through the defender, then normal shot/pass | Strength in contests |
| Dada Silva | Aerial Power (jump power and contact strength, not reach; teammates supply high balls), Flow: Aerial Dominance | Dominant Header (cd 7), Physical Aerial Challenge (cd 8, wins contested high balls more often) | Towering Finish — header through a challenge ≤14 m | Power in the air (Aryu is reach) |
| Julien Loki | Godspeed (acceleration ×1.3 **and** top speed ×1.05; slower defenders lose knock-and-run races), Speed Recognition (turns sooner when a ball goes behind him), Flow: Divine Tempo | Godspeed Burst (cd 7, ~70% further knock-and-run) | Godspeed Breakthrough — finds a gap with ≤1 defender and 4 m beyond, bursts ≤16 m, then chooses normally | Zantetsu keeps the most explosive start; Chigiri sustained speed; Loki both |
| Yukio Ishikari | Towering Reach (canon), Aerial Positioning, Flow: Aerial Determination | High-Point Interception (cd 8, canon), Headed Link-Up (cd 9, canon: a real header pass, interceptable) | none — no canon support | Aerial link player |

The World Five coordinate only through shared systems (chance creation finds Loki's runs, Luna's dribbles draw defenders, crosses look for Dada's power, Adam shields). No pairwise reactions and no chemistry were added. Shidou's kit stays pending; **Reflex × Reflex** (Sae 14 × Shidou 31, shared 12-tick cooldown) is one entry in Sae's kit, listed in both dossiers: Shidou picks a reachable onside spot near goal and runs; Sae may answer with an exactly weighted ball; Shidou tries an acrobatic first-time finish. Offside, interceptions, blocks and saves apply.

## Dialogue

Natural energy, same personalities, context-checked (no claim before a shot, no celebration on a miss, assisters celebrate the scorer):

- Generic: "YES!!", "GET IN!", "There we go!", "Damn, so close!", "Ugh, they read it.", "Mine!", "Come on, ref!"
- Barou: "Finally." / "About time." on receiving (was "Give me the ball!" for passing *and* receiving); Rin "...Fine."; Sae "Cheap." when fouled; Nagi "Easy." / "Stopped it. Now what..." on Perfect Trapping; Kurona "Too early, too early!" offside.
- New voices: Luna "Too slow, too slow~", Pablo "Run. It will be there.", Adam "Straight through you!", Dada "Nobody beats me up there!", Loki "Watch closely. You won't see it twice.", Ishikari "Mine!".
- Blue Lock Man silent; Junichi nonverbal; Isagi's, Hiori's and John Paccini's records untouched.

All new or changed strings ship in 11 languages (about 300 battle strings, 66 dossier strings and two changelog lines).

## Protection proof

`player.js` comparison against `HEAD`: only `battleSim` changed for 20 existing public characters; the six new kits also wire their dossier weapon's `battleSimType`/`battleSimDescription`; every other field of every record is identical; no secret record changed. Fixture hashes (`roster-v088`, `roster-v0881`) were refreshed for exactly those records.

## Known limitations

- Reo and Nagi reach Flow rarely in ordinary matches (2 Flows each in 48), so Chameleon: Evolution and the Five-Shot Revolver did not occur in the sample; both are exercised by controlled scenes. Flow gain and duration were not changed beyond Reo's small Chameleon contribution.
- Precision Masterclass, Towering Finish and Headed Link-Up are rare in ordinary play (their situations are rare); they are covered by controlled tests.
- Adam's Power Shield shares its name with Tokimitsu's entry (the requested name).
- Browser verification (Chromium/Playwright, local server): the Luna (English, 1440×900), Loki (Arabic, 1440×900), Ishikari (Japanese, 1280×720), Pablo (French, 1024×768) and Shidou (English, 390×844) dossiers render their kit cards with no console errors, and Reflex × Reflex appears on Shidou's dossier. A live Battle Sim match was not driven in the browser; match behaviour is verified by the Node suites.
