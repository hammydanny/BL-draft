# BL-Draft 8.9.8.2 — character kits and dialogue

Based on main `8722a37c154565d7c7183cdbaf72015aa2729187`. Supported chapter remains 368.

## Character kits

- **Kuon:** reacts 0.18 seconds earlier to reachable lofted balls and contests them in the air. High-Point Header requires an actually airborne cross within 16 m and has an eight-tick cooldown. Flow refines aerial timing. No additional running-speed multiplier.
- **Imamura:** ordinary onside short support and a modest control advantage during a real carry through an open lane. Seven-tick carry cooldown; unchanged Base Speed and Dribbling.
- **Niko:** 44 m observation, threat-ranked covering positions and anticipation tied to the observed passer and destination. Defensive Trap baits a lane for two ticks with a ten-tick cooldown. A changed pass can exploit the space left. Flow improves reading without guaranteeing possession.
- **Okawa:** onside finishing-support runs. Within 20 m, Super Shooting delays release against a moving or closing goalkeeper, with eight-tick cooldown. Chip Shot requires an advanced goalkeeper within 24 m and has ten-tick cooldown. Both use the existing shot model as separate choices; bonuses do not stack. His football-weapon dossier also registers these two sourced canon weapons.
- **Junichi:** modest short support and physical twin combinations. Ordinary speech becomes brief nonverbal responses. Keisuke gets only interpreter dialogue and shared reaction participation; his full kit remains pending.

New ability/Flow names are gameplay interpretations unless canon-established. No secret character, public Base rating, position or chemistry value changes. Regression fixtures cover every public Base record, the existing secret-roster digest, the chemistry source, and completed-kit mechanics for characters 2–11.

## Isagi

Part 1 already supplied Metavision, blind-side geometry, rolling tactical memory and Flow resets. Those systems are reused. Both direct shots now share a five-tick cooldown, including older saved per-move cooldowns and their dossier display. Direct Shot retains the relative 0.70 blocking factor. Every failed shot now enters the last-three-failure memory, including misses and deflections.

Back Heel requires an actually committing challenger and a fallible deception roll. Failure loses possession and consumes that Flow allowance. Two-Gun Volley resolves deception only when a shot is selected, and can bypass only its specific deceived blocker. Other defenders and the goalkeeper remain involved. Both ultimates keep independent once-per-Flow allowances and the existing reset on a new Flow activation.

## Shared reactions

Hidden Playmaker × Ace is defined once in Niko's kit (members 16, 17). Eye Contact is defined once in Junichi's kit (members 18, 19). Both reuse the registry, dossiers and saved per-team cooldowns. Both partners must be active; substitutions or dismissals disable availability. Each shares a twelve-tick cooldown.

Eye Contact starts at 4–18 m with a viable short pass, followed by ordinary running and the existing return-pass mechanism. Either pass can be intercepted. Keisuke speaks the attempted combination; it is not announced as a completed success before resolution.

## Dialogue audit

All 16 completed characters have contextual kickoff, pass, reception, carry/dribble, loss, shot-attempt, goal, miss, defensive, save/concession, foul, support and Flow lines. Existing weapon, rival and reaction lines are retained. Limited-canon situations use restrained responses. Unfinished characters retain generic fallback dialogue. Junichi's legacy explicit fallback cannot make him speak ordinary sentences.

Character line selection uses a stable presentation hash, not gameplay RNG. Recent-line protection and minor-event throttling remain. Passing and receiving lines differ; failures do not claim success. Names, descriptions, labels, dialogue and release notes have all ten non-English translations, for eleven languages including English. New lines are original game dialogue, not claimed manga quotations.

Representative dialogue captured in normal seeded matches:

| Character | Context | Observed line |
|---|---|---|
| Isagi | Passing | Use that gap. |
| Kira | Receiving | Thank you. My turn. |
| Noa | Passing | Choose the next action. |
| Bachira | Receiving | Ooh, my turn! |
| Igarashi | Passing | Take it, quick! |
| Kunigami | Receiving | I have it. |
| Chigiri | Receiving | Good. Now watch. |
| Gagamaru | Receiving | Got it. |
| Raichi | Receiving | About time! |
| Naruhaya | Receiving | I can work with this. |
| Iemon | Passing | Here, I am with you. |
| Kuon | Receiving | That delivery works. |
| Imamura | Receiving | Nice, leave it to me. |
| Niko | Receiving | I see the next option. |
| Okawa | Passing | Here, build another chance. |
| Junichi | Receiving | Ngh. |

Speech direction was checked against the [official character profiles](https://tv.bluelock-pr.com/tv1st/character/) and [Niko/Wanima introduction](https://tv.bluelock-pr.com/tv1st/news/297/), alongside existing project references. The First Selection nonverbal style is the explicit game direction for Junichi; this is not a claim he never speaks later in canon.

## Seeded matches

Three fixed seeds per scenario with identical lineups/strategies: 24 baseline and 24 updated matches. All completed and restored successfully. Values are per match. This small sample is diagnostic, not a balance guarantee.

| Scenario | Goals: baseline → update | Shots: baseline → update |
|---|---:|---:|
| All five plus Keisuke | 2.67 → 2.67 | 12.0 → 12.7 |
| Niko + Okawa | 3.00 → 2.00 | 17.7 → 15.3 |
| Twins | 4.00 → 3.00 | 14.7 → 16.7 |
| Isagi + Hiori | 3.00 → 3.33 | 17.0 → 16.7 |
| Isagi + Bachira | 3.67 → 3.67 | 19.3 → 18.0 |
| Kira, Noa, Igarashi, Kunigami, Chigiri | 3.67 → 4.00 | 17.7 → 18.0 |
| Gagamaru, Raichi, Naruhaya, Iemon | 5.00 → 2.67 | 14.0 → 12.7 |
| Unaffected-character control | 6.00 → 6.00 | 16.0 → 16.0 |

The 24 updated matches recorded Eye Contact seven times, Hidden Playmaker × Ace six times, Speed-and-Technique Carry six times, Quick Support ten times and Defensive Trap five times. Isagi used Direct Shot eight times and Left-Footed Direct Shot five times.

Additional normal matches with Hiori/Bachira as delivery partners, ten per focal striker, produced eight Aerial Reach labels and one Kuon header attempt, which failed. Okawa's Super Shooting and Chip Shot were not selected in those ten matches: most evaluated possessions were outside 20 m and the suitable keeper/pressure windows did not coincide. Both legitimate triggers and their cooldowns are tested in controlled scenes, through the ordinary fallible shot model. They have not been forced into normal matches. Back Heel and Two-Gun Volley are also rare under the stricter commitment requirements. This is the principal remaining usage/balance limitation.

Full counts, shot-distance opportunities, interceptions, crosses, cut-backs, reaction counts, attempts/goals and dialogue samples are in [character-batch-metrics.json](character-batch-metrics.json). Timings include concurrent validation workloads and are not device performance benchmarks.

Reproduce paired comparisons with `node scripts/benchmark-character-batch.js <baseline-directory>`; delivery cases with `node scripts/benchmark-character-batch.js --focused`. No hidden event injection or forced goals is used.

## Validation

- `node scripts/battle-v8982-tests.js`: passed. Covers protected data, physical reach, counterplay, cooldowns, partners, saved airborne reception, Flow allowances and dialogue RNG isolation.
- All existing character and presentation suites passed in resumed gate segments after the fixture corrections below.
- Localization integrity: zero errors or warnings. Source coverage: zero uncovered strings.
- Version references and cache fingerprint align with 8.9.8.2.
- Browser: local initializer, match startup/intro skip, live feed, Imamura dossier and a 390 px Arabic/light-mode smoke check. No horizontal overflow or captured console errors in that check. This is not an exhaustive audit of every dossier/device/language.
- The full preflight was invoked and then resumed by suite after correcting stale fixtures. All gate suites passed; this is not a claim of one uninterrupted successful full-gate invocation.

### Regression fixture maintenance

Only the 17 authorized public-character snapshot hashes were refreshed; independent Base-data, previous-kit and secret checks remain. The isolated Isagi fixture excludes the newly completed kits from its filler pool. Its original no-abilities-without-Isagi assertion is retained. Common kit sampling now uses eight seeds instead of three, without changing its seven-goal bound. The older elite-team scoring guard uses 32 seeds and the same seven-goal ceiling as the later kit suites: its measured result was 199 goals in 32 matches (6.22 per match). The v0.8.9.4 eight-seed case produced 57 goals (7.125 per match); its former two-seed, ten-goal individual cap is replaced by a seven-goal expected rate with a one-sided 95% count allowance and a separate 14-goal per-match runaway cap. This changes the statistical acceptance criterion; it does not prove the true mean is below seven. The refinement fixture incorrectly expected a 0.85 multiplier at 50% stamina; the unchanged production formula is 0.85 + 0.15 × stamina fraction, so the expectation is corrected to 0.925. The ordinary shooting model was not rebalanced. Shot-range validation now measures physical routes rather than parsing rounded feed text: 43/305 shots (14.10%) were at least 30 m, below the unchanged 15% ceiling; parsing rounded descriptions incorrectly counted 46.

## Scope

Source changes are the shared Battle Sim hooks, 16 public player modules, Keisuke's interpreter-only addition, battle language catalog, generated character bundle, checklist, tests and these release documents. Generated page queries, loader, version and service-worker changes handle cache invalidation; the changelog gains this patch entry while preserving earlier releases. Preflight's catalog adapter now loads the battle catalog in production order. No framework, route redesign, save reset or formation-dragging rewrite was introduced.
