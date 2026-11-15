# BL-Draft 0.8.9.8.3 — dialogue, movement and website polish

Based on main 753177b47e0c38be1b54909be022f87d6e780f87 (0.8.9.8.2), supported chapter 368. No canon cutoff change.

## Changes

All 16 completed voices were audited. Fifteen speaking characters receive more competitive goals, stronger Flow/defensive reactions, distinct shot attempts, and separate failed-pass, foul-offender, foul-victim and offside responses. Existing short passing/reception and signature/reaction pools remain where appropriate. 130 original lines have all ten non-English translations. Junichi retains nonverbal pools and now skips some routine dialogue; Keisuke still interprets Eye Contact. No ordinary sentences were added to Junichi.

The selection hash is presentation-only. Recent-line protection remains, minor-event throttling handles tick zero correctly, and Noa/Niko/Junichi can stay silent on routine events. Goal/save alternatives avoid a single repeated response. Failed actions cannot use the successful-action key; offside and being fouled no longer borrow unrelated dribble-failure copy. Two Isagi ultimate announcements were changed to attempts rather than premature claims of a successful feint. Unfinished characters keep their generic text fallback.

Blue Lock Man is centrally barred from dialogue generation and event output, including explicit lines, ability lines, generic fallback and both team instances. Rendering also filters old stored lines. Match narration remains, unlimited stamina and no Flow remain.

Examples below are original game lines, not verified manga quotations. Normal-match samples are in the metrics file; gameplay comparisons were recorded before the final presentation-only archive/offside-speaker guards. Those guards are separately regression-tested and do not change gameplay RNG or physical results. Character direction follows the task and existing kit references, cross-checked against the [official profiles](https://tv.bluelock-pr.com/tv1st/character/), [current official character page](https://tv.bluelock-pr.com/character/) and [official cast commentary](https://tv.bluelock-pr.com/tv1st/comment/). This is an original voice interpretation, not a claim of exhaustive manga dialogue research.

| Character | Goal example |
|---|---|
| Yoichi Isagi | That's it! This goal is mine! |
| Ryosuke Kira | There! That's what I can do! |
| Noel Noa | That's how it's done. |
| Meguru Bachira | Hehe! That one's mine! |
| Gurimu Igarashi | I SCORED?! Yes! I actually scored! |
| Rensuke Kunigami | I'm taking the next one too. |
| Hyoma Chigiri | Still chasing? The ball's already in. |
| Gin Gagamaru | Oh. I scored. Nice. |
| Jingo Raichi | HAH! Now who's just a defender?! |
| Asahi Naruhaya | Yes! I can score here too! |
| Okuhito Iemon | Yes! We needed that one! |
| Wataru Kuon | Perfect timing! That goal is mine! |
| Yudai Imamura | Hey! Not bad, right?! |
| Ikki Niko | You forgot I could score too. |
| Hibiki Okawa | That's your ace! Remember it! |
| Junichi Wanima | Hmph! / Hnn! / Ngh... (nonverbal only) |

### Physical speed

A shared continuous curve now supplies sprint speed, regular movement, recovery/pressing movement, ordinary interception travel and through-ball races. At full stamina outside Flow, 70 SPD gives 7.225 m/s and 95 SPD gives 9.4125 m/s: 30.3% more top speed. Routine movement budgets are 60% of this, and dribble stride also retains a DRI control factor. Around 80 SPD, ordinary movement stays near the previous baseline.

Races retain acceleration, reaction time, ball flight and actual interception points. Off-ball recovery movement is capped by the same sprint speed, and holding a reached target does not force extra running. Existing stamina, Flow, dribble contests, tactical plans and authoritative event-position snapshots remain. No separate visual-speed simulation was added.

Controlled actual off-ball runs (70 vs 95 SPD) covered 7.225 vs 9.4125 m when attacking/pressing in one direction, 6.729 vs 8.767 m when attacking the other, and 4.937 vs 6.432 m for its defensive case. The same-position through-ball tests require lateral running and demonstrate earlier physical arrival for higher SPD in both directions.

### Navigation

Directory/header/mobile destinations are native anchors with real hrefs. Main builder/database links and dossier section links also retain full destinations. Plain left clicks preserve existing save/setup/navigation helpers; middle, Ctrl, Cmd, Shift and Alt clicks bypass interception. Actual actions such as opening a briefing, starting a new auction with confirmation, comparing players and changing settings stay buttons. Arrow-key directory navigation includes anchors.

The active section is derived from canonical route identities, including Battle Sim landing, initialization, game and results. Recognized legacy/hash routes reuse the router. Home no longer becomes the fallback for those Battle Sim screens. Breadcrumbs include the nested stage.

### Flow and database

Existing Flow rainbow text, badges, borders, full meters, stamina rings and active ratings share a slow 24-second CSS gradient-angle animation. The small dossier FLOW badge now has the rainbow border. Light/dark palettes, a static fallback when custom-property animation is unsupported, and explicit reduced-motion rules are included. No per-frame JavaScript or layout animation was introduced.

Dossier kit cards show compact usage limits sourced from the fields enforced by the engine: cooldown ticks, shared groups, shared reaction cooldowns, once-per-Flow limits and Naruhaya's shorter Flow cooldown. Live goalkeeper readiness now recognizes the engine's existing effect-keyed saved cooldowns. No balance values or caps were changed to match text. Usage text preserves translation metadata, including shared-ability names, for language switching without reload.

Football Weapons retain names, canon/source descriptions and underlying battleSimDescription metadata. The redundant extra Battle Sim paragraphs/type references are removed from their presentation for all dossiers. The separate Battle Sim Kit remains complete. Four older Isagi weapon records duplicate numerical/Flow conditions in their ordinary description field; those four cards use localized football-only display paraphrases while retaining both stored descriptions and source metadata unchanged.

## Match comparison

Same eight lineup scenarios and seeds 11, 37 and 83: 24 baseline + 24 updated full matches. All complete and hydrate. Baseline means: 3.42 goals, 15.75 shots. Updated means: 4.00 goals, 18.46 shots. The sample is diagnostic, not a guarantee of long-run balance. No events or goals were forced. Timing fields include concurrent validation work and are not device benchmarks.

See [polish-match-metrics.json](polish-match-metrics.json) for scenario totals and actual dialogue samples. Reproduce with node scripts/benchmark-character-batch.js BASELINE_DIRECTORY OUTPUT_PATH.

## Validation

- node scripts/battle-polish-tests.js: passed controlled speaker, legacy-line, SPD/acceleration/physical-race, both-direction attack/defence/pressing, native-link/route/modifier and ability-limit checks.
- node scripts/battle-v8982-tests.js: passed all character-batch regression cases and protected-data checks.
- node scripts/information-navigation-tests.js: passed 128 real header destinations across information shells on root/subpath hosts.
- Final node js/preflight.js: zero failed checks, including all JavaScript syntax, current dossier rendering and asset integrity. Final independent data audit passed.
- Independent before/after data audit: every character field outside dialogue is identical, every secret record is identical, and chemistry/formation sources are identical.
- Localization integrity: zero errors/warnings. Source coverage: zero uncovered strings, 3,398 catalog entries. Version references and release fingerprints: zero stale files/assets.
- node scripts/preflight.js: invoked; all gate suites passed in segments. The original invocation stopped at the unchanged character-suite timing guard (14.28 ms/tick during concurrent checks). Its isolated rerun passed at 4.76 ms/tick, then the remaining character, presentation, refinement and chapter-tracker suites passed. This is not a claim of one uninterrupted successful full-gate invocation.
- Browser: native middle-click and Ctrl-click each open a new tab while preserving the dossier; Battle Sim setup/game/results all show the correct active link; a real 3–2 match reaches results. English/dark and Arabic/light dossier checks at desktop 1440×900, tablet 1024×768 and phone 390×844 show no document horizontal overflow. Arabic cooldowns switch to English without reload. The Flow badge's border and the result archive's Flow labels expose the animation in computed CSS. The checked match captured no browser console errors.
- Reduced motion and unsupported-animation fallbacks are checked in CSS; OS reduced-motion emulation and every language/device combination were not exhaustively browser-tested.

Only the authorized speaking-character snapshot hashes were refreshed. Independent protected-data tests remain. The information-navigation test now parses native anchors as well as buttons; the older dossier test now expects removal of redundant references. No statistical scoring thresholds were relaxed in this patch.

## Limits and release

This changes SPD's physical consequences and therefore seeded match outcomes relative to the older release. Within this version, deterministic simulation and save/load continuation remain regression requirements. It is not a general shooting or ability rebalance; rare-special usage from 0.8.9.8.2 is not guaranteed to increase.

Version/cache/page-shell references are 0.8.9.8.3. All public Base stats, OVR, weapons, positions, chemistry, secret data, formation geometry and save schemas are preserved. The original outer workspace's unrelated edits were left untouched; implementation is isolated against current main. Publication uses a normal non-force update only after validation.

## Files changed

- 404.html
- auction/results/index.html
- auction/room/index.html
- auction/setup/index.html
- auction/team-builder/index.html
- battle-sim/game/index.html
- battle-sim/initializer/index.html
- battle-sim/results/index.html
- changelog/index.html
- css/character-lore.css
- css/localization.css
- css/mobile.css
- css/rtl-fixes.css
- css/site-header.css
- css/site-theme.css
- docs/polish-match-metrics.json
- docs/release-v8.9.8.3.md
- index.html
- js/battle-sim.js
- js/characters.generated.js
- js/i18n/battle-messages.js
- js/lore.js
- js/players/asahi-naruhaya/player.js
- js/players/gin-gagamaru/player.js
- js/players/gurimu-igarashi/player.js
- js/players/hibiki-okawa/player.js
- js/players/hyoma-chigiri/player.js
- js/players/ikki-niko/player.js
- js/players/isagi/player.js
- js/players/jingo-raichi/player.js
- js/players/meguru-bachira/player.js
- js/players/noel-noa/player.js
- js/players/okuhito-iemon/player.js
- js/players/rensuke-kunigami/player.js
- js/players/ryosuke-kira/player.js
- js/players/wataru-kuon/player.js
- js/players/yudai-imamura/player.js
- js/players-loader.js
- js/players.js
- js/standalone-builder.js
- js/ui/site-directory.js
- js/version.js
- legal/index.html
- lore/index.html
- privacy/index.html
- scripts/battle-polish-tests.js
- scripts/battle-v0894-tests.js
- scripts/fixtures/roster-v088.json
- scripts/fixtures/roster-v0881.json
- scripts/information-navigation-tests.js
- scripts/preflight.js
- scripts/release-manifest.json
- service-worker.js
- team-builder/index.html
