# BL-Draft 0.8.9.8.8 — Six kits, match controls and release-history correction

Based on main 16b4b043fec75ca412f02e56d48140f99e604207, including Syaafi’s Isagi revamp Part 2.5 and the newer secret-character work. Supported chapter remains 368.

## Syaafi’s changes are protected

Isagi’s player data and checklist, Hiori’s player data, and John Paccini’s player data and kit document are byte-identical to that main. Eleven Isagi/John engine functions are fingerprinted against main and checked by collaborator-preservation-tests.js. The earlier competing local Move It, Puzzle Completion and Hotline implementation was removed. Syaafi’s Move It trigger, Flow parameters, three-tick Hotline and Hiori synchronization remain authoritative, including his cooldowns. No original-plan tuning was applied over his revamp. All secret records match latest main; public stats, canonical profiles/weapons, chemistry and formation definitions remain unchanged.

The shared ability-lock check now requires an actual disable timestamp; an absent timestamp no longer disables every ordinary ability at tick zero. Signature-event display maps Move It/Hotline to their existing character dialogue rather than replacing their explicit lines with generic support chatter. These compatibility fixes do not replace Syaafi’s character functions or source data.

## Version and changelog repairs

The current release is exactly **0.8.9.8.8**. The updater previously accepted at most four numeric components and silently ignored this five-part version. It now accepts the format and rejects malformed requests. HTML assets, the character loader, service worker and release fingerprint use the same central version.

Older misnumbered V8.9.8.2 / V8.9.8.3 labels now read V0.8.9.8.2 / V0.8.9.8.3. Existing history is retained; no fictional missing releases were added. Both the navigation index and the actual release bodies have native nested 0.7/0.8 dropdowns, with subversion groups. Current and legacy release anchors remain valid, and selecting a release opens its ancestor groups. The release-history regression checks labels, grouping, duplicate IDs and every index target.

## Six public kits

| Character | Implemented behavior | Boundaries |
|---|---|---|
| Keisuke Wanima | Onside short support and modest Flow anticipation | Shares Junichi’s existing Eye Contact; no duplicate reaction; both twins active |
| Reo Mikage | Visible pitch reading, rational decisions, precision distribution, observed technical imitation | Three observed public technical moves; weaker copies using own stats; 8-tick copy cooldown; no secret/physical/GK/Flow/reaction/ultimate copying |
| Zantetsu Tsurugi | Initial acceleration, forward burst, right-channel left-foot diagonal | SPD unchanged; physical acceleration; real space/direction requirements; 7-tick burst cooldown and sprint budget cap |
| Jyubei Aryu | Aerial reach/anticipation and high-point control | Actual flight/race first; 8-tick High Point Clearance cooldown; losing the contest gives no control |
| Aoshi Tokimitsu | Running/action durability, strength shielding, Power Drive | Finite stamina outside Flow; normal counterplay; 8-tick drive attempt cooldown |
| Hajime Nishioka | Modest reception control and stabilizing touch under pressure | Estimated profile retained; reachable balls only; 8-tick touch cooldown; conservative interpretation |

Nagi, Baro, Sae, Hiori and Kurona are not marked as completed individual kits. Existing public voices gain contextual outcomes where appropriate, while Isagi/Hiori retain Syaafi’s current source. Junichi stays nonverbal and Keisuke interprets. Blue Lock Man remains silent across generation, explicit lines and stored feed. New kit/control/history copy is available in eleven languages. Dialogue selection does not consume gameplay RNG. The JSON examples are original simulation dialogue, not claimed manga quotations.

## Match controls and formats

Auto Play and optional Auto Subs are compact setup/live controls, both off by default. Auto Play uses the live scheduler, waits for feed presentation, honors pause/toggling, handles restarts and half time, and chooses takers/routines from current ability, pressure, distance, available receivers and tactics. Goal kicks default to a dedicated keeper. Optional subs compare live position contribution, suitability, chemistry and Flow with a meaningful gain threshold; tired elite players are not replaced merely because weaker reserves are fresh. Required replacements do not deadlock progression.

Formats 1/2/3/5/7/9/11 and unequal teams deploy actual players with compact simulator layouts and active-pair chemistry. With no dedicated keeper, open goals are explicit and the only attacker is not converted into a keeper. Formats up to seven disable offside. Full-sided formation definitions and shared position ratings remain intact. Passing and uncontested carries have workload-based costs, and Tokimitsu’s durability includes running. No arbitrary stamina factor depends on squad size.

All normal/automatic/fast-forward/restored finishes stay on the full-time pitch. VIEW MATCH RESULTS requires an explicit click; both the finished active state and result are saved. Refreshing the game does not redirect to the report. Fast Forward stays distinct from live Auto Play.

## Presentation

The intro has a matchup, actual lineup, meaningful strong outfield spotlights and kickoff. Shared approved portrait sources use cover cropping and optional focal metadata. Image loading does not block the sequence. Skip, reduced motion, semantic light/dark colors, RTL and responsive desktop/tablet/portrait/landscape layouts are implemented. Small squads show actual player counts rather than Starting XI or a misleading full formation.

Flow spectrum cycles are 12 seconds, using existing CSS surfaces and static reduced-motion fallbacks. There is no JavaScript color loop or large animated page surface.

## Validation and limits

The repository gate includes collaborator fingerprints, release-history/version parsing, six-kit data/localization and copy boundaries, Syaafi’s Move It/Hotline save behavior, all requested format completions, live Auto Play with optional subs, manual results and contribution-aware elite retention. Existing physical passing, offside, keeper, set-piece, deterministic save/restore, full-match balance and performance guards remain. Protected fixtures were rebased only after comparing every public non-kit field and every secret field against the latest authoritative main.

Comparative match metrics and 22 voice examples are separate JSON files. Ordinary matches do not force Flow, abilities or goals; controlled legal geometry is used only for targeted component checks. Small open-goal matches retain the full 90-minute pitch/duration and can score much more than keeper formats.

Actual browser visual QA remains **unverified**: available browser launch attempts produced no usable session or rendered output. Responsive/light/dark/Arabic/reduced-motion/Skip changes have source and regression checks, not a visual browser pass.

Local core checks, collaborator fingerprints, release-history checks, evolution checks and comparative match runs passed. The complete repository Preflight runs on the validation commit in GitHub Actions before main is promoted; its commit check is the final release result. The patch contains only changed/new repository-relative files against main 16b4b04.

## Dialogue examples

| Character | Goal example |
|---|---|
| Yoichi Isagi | That's it! This goal is mine! |
| Ryosuke Kira | That is what I came to do! |
| Noel Noa | Good. Now do it again. |
| Meguru Bachira | Did you see that dance? |
| Gurimu Igarashi | Did everyone see?! I scored! |
| Rensuke Kunigami | I came back for this. |
| Hyoma Chigiri | A little too late. |
| Gin Gagamaru | I can score too. |
| Jingo Raichi | See that?! That's Raichi! |
| Asahi Naruhaya | That one's for my family! |
| Okuhito Iemon | Well done, everyone. |
| Wataru Kuon | The timing... yes! |
| Yudai Imamura | Hey, that worked! |
| Ikki Niko | You watched the wrong player. |
| Hibiki Okawa | That is the finish I wanted! |
| Junichi Wanima | Hnn! |
| Keisuke Wanima | You saw that, brother! |
| Reo Mikage | I can make this team win. |
| Zantetsu Tsurugi | Fast enough. That is the word. |
| Jyubei Aryu | A finish worthy of the stage. |
| Aoshi Tokimitsu | I kept going. I scored! |
| Hajime Nishioka | One opening was enough. |
