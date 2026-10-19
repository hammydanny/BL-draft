# v0.7.2.3 — Chemistry and balance consistency

Based on read-only `main` at `d8f57337745c36fc8505392abe062ac88e255b43`. No commit, push, PR or deployment was made. Copy the ZIP's repository-relative files over this version of the project.

## Chemistry model

Unknown pairs now default to 65, a neutral grey link with exactly zero player-performance adjustment. Red is reserved for demonstrated dysfunctional football cooperation. Existing positive pair and team-context scores are preserved, apart from the two low pairs corrected below.

| Tier | Pair score | Presentation | Example performance effect |
| --- | --- | --- | --- |
| Negative | Below 65 | Red, dashed | 58 → −2.5 OVR; bounded at −3 |
| Neutral | 65–69 | Subdued grey | 65 → 0 |
| Link | 70–81 | Existing purple | Small positive effect |
| Strong | 82–89 | Existing cyan | 82 → +1 |
| Elite | 90–94 | Existing green | 90 → +2.2 |
| Chemical | 95–100 | Existing gold | 95 → +3.2; bounded at +4 |

Player contribution retains the shared `squad-balance.js` model. Each tactical-neighbour link is converted to its bounded performance effect, then combined as 55% local mean, 30% strongest two links and 15% weakest link. Applying the curve before combining effects makes neutral links contribute zero even in mixed networks. Player Effective OVR is base OVR plus the existing bounded positional adjustment plus this contextual chemistry effect, clamped to 1–104. Squad quality retains the nonlinear strength curve and weakest-third weighting introduced in v0.7.2.2.

The network score continues to consider tactical edges, coverage, weakest links and limited familiarity from other deployed players. A complete all-neutral network scores 65; a numerical all-58 negative-link test scores 54. Neutral squads cannot satisfy an 80-chemistry goal without real positive links. Additional links do not stack unlimited player bonuses.

One shared classification now reaches Builder lines and tooltips, selected-player contribution, Auto Best, Daily cards and feedback, Challenge objectives, Results, Database filters and dossiers, HTML reports, Save preview and PNG export. Grey lines have less opacity and no glow; red lines are stronger and dashed. Keyboard focus, Enter/Space, touch and Escape expose the same translated tier labels. PNG reports include a compact translated line legend. The disabled Battle Sim's fallback presentation also recognizes neutral/negative; its disabled state is preserved.

## Low-pair audit, cutoff Chapter 364

These are conservative fan-game classifications, not official manga statistics. Personal hostility and opposing-team performance are not sufficient evidence of bad cooperation.

| Pair | Previous score | New score/tier | Reason |
| --- | --- | --- | --- |
| Junichi Wanima × Hyoma Chigiri | 55 | 65 / Neutral | Bullying and exploiting an opponent's fear do not, by themselves, prove dysfunctional teammate cooperation. Shared-team history must not silently restore a positive floor. |
| Keisuke Wanima × Hyoma Chigiri | 55 | 65 / Neutral | The same distinction between personal mistreatment and demonstrated cooperation applies. |
| Rin Itoshi × Sae Itoshi | 62 | 65 / Neutral | Their fractured personal relationship and recent opposition do not establish current negative teammate chemistry. Childhood history is acknowledged; no new partnership is invented. |
| Rensuke Kunigami × Ryusei Shido | 60 | 65 / Neutral | Elimination history and confrontations as opponents do not establish poor cooperative play. |
| Sae Itoshi × Bunny Iglesias | 58 | 65 / Neutral | An intense rivalry does not establish failed cooperation. |
| Yoichi Isagi × Vivien Hugo | 56 | 65 / Neutral | Opposing philosophies while representing opposing teams do not establish poor teammate chemistry. |
| Sae Itoshi × Shuto Sendo | 67 | 70 / Link | Sae does supply Sendo in the U-20 match; belittling his finishing does not erase actual passing interaction. |
| Ryusei Shido × Shuto Sendo | 48 | 70 / Link | Their U-20 one-two sequence demonstrates useful cooperation despite off-field hostility. |
| Rin Itoshi × Ryusei Shido | 58 | 58 / Negative | Retained: explicit failed chemical cooperation and the initially separate PXG systems provide football-specific evidence, rather than dislike alone. |

The positive rivalry links already recorded for Isagi–Kaiser, Isagi–Baro and other pairs remain intact. No additional red pairs were invented to populate tests or the Database.

Audit references: the existing repository's through-364 relationship descriptions, [Chapter 109](https://bluelock.fandom.com/wiki/Chapter_109), [Chapter 121](https://bluelock.fandom.com/wiki/Chapter_121), [Chapter 126](https://bluelock.fandom.com/wiki/Chapter_126), [Chapter 244](https://bluelock.fandom.com/wiki/Chapter_244), [Sae's relationships](https://bluelock.fandom.com/wiki/Sae_Itoshi/Relationships) and [Chigiri's school history](https://bluelock.fandom.com/wiki/Rakosute_Business_High_School). Only relevant events within the requested chapter boundary informed the patch. These references include secondary chapter summaries; this was not a fresh panel-by-panel licensed-manga audit.

## Results and awards

Head-to-head now compares the actual deployed team's Effective OVR, Base Quality, chemistry and remaining budget, in that order. If no lineup has been constructed, the existing shared planner supplies an explicitly projected lineup. Team cards and CPU export summaries use the same contribution values. Database profile ratings and roster base-rating badges retain their original meaning.

MVP evaluates deployed strength and marginal contribution to the finished lineup. For each starter, it tests removal and available owned-reserve replacements in the same slot, recalculating the surrounding tactical chemistry. A modest 60-OVR replacement baseline handles a role with no reserve. This can identify an irreplaceable lower-rated starter ahead of a slightly better but replaceable star. Raw talent still matters substantially.

Best Value divides that contribution, with a small versatility allowance, by purchase cost with a bounded contract floor for free signings. Expensive redundant reserves no longer beat useful starters simply because their raw OVR is high. Internal scores are not exposed to users. Award calculations never move players, run Auto Best on the user's lineup or write saves.

## CPU reasoning and auction value

CPU assignment now accepts primary, demonstrated secondary and reasonable adapted roles using `playerPositionProfile`. It still rejects poor and goalkeeper-incompatible roles from its normal planning assignment. A 94-OVR CM adapted to DM can beat a 74-OVR natural DM; a striker is rejected at CB/GK in the isolated adaptation test. All ten formations remain candidates and the final CPU build continues to use Auto Best.

Valuation uses the candidate's actual contribution in the proposed lineup, public positional alternatives and their relative quality, squad gaps, chemistry, versatility and completion funds. Normal and especially Hard avoid treating every cheap gap-filler as equally valuable. Hard retains very little random variation and does not access future auction order or receive extra funds.

Initial price sampling still showed 94+ players barely above the 88–93 group, so the existing smooth elite/scarcity premium was increased modestly. There are no fixed player prices or mandatory purchase bands. Mid-tier value, contextual demand, late bargains and free awards remain possible.

## Daily and save compatibility

A balance revision is now recorded on Daily runs. Existing v0.7.2.2 offers depended on the old assignment/chemistry model, so re-evaluating an old action list under the new model could incorrectly reject a saved run. The migration validates and carries forward the actual drafted IDs, seen offers, remaining tokens, captain, chosen formation and exact reviewed assignment. Subsequent actions use the new model. The carry validator now accepts 9- and 10-player formats as well as 7, 8, 11 and 14.

Twenty-four actual v0.7.2.2 states were captured from the unchanged baseline: partial and completed runs for all twelve mini-formations. Tests preserve and reload them, continue partial runs and reject malformed states. New constructive witnesses separately verify that every current mini-formation still has a complete natural-fit drafting path. Existing v0.7.2.1 migrations, Undo/Redo, squad codes and separate save keys remain covered.

## Verification

The full preflight suite passed, including the new comparative experiment. The existing suites exercised 60 game-mode auctions and 45 balance auctions; the new test added 162 paired auctions (54 per difficulty), for 267 simulated auctions in these batches.

The paired experiment uses identical seeds 1–18, public pools (all eligible players, no masters and under-90), 7,000 or 10,000 equal budgets, 11- or 15-player rosters and 50-unit bid increments. Each tested difficulty faces the same Normal-policy opponent. Final metrics use the complete Auto Best lineup, not the incomplete planning projection. Prices below are in the site's internal currency units.

| Difficulty | Auctions | Effective OVR | Base quality | Chemistry | Acceptable / 11 | Natural / 11 | Remaining budget | Avg. signing cost | Redundant purchases/run | Roster completion |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Easy | 54 | 79.746 | 82.825 | 72.000 | 9.463 | 9.204 | 477.778 | 665.208 | 0.537 | 100% |
| Normal | 54 | 81.221 | 83.914 | 72.130 | 9.704 | 9.500 | 438.889 | 667.935 | 0.519 | 100% |
| Hard | 54 | 82.444 | 85.003 | 72.185 | 9.741 | 9.481 | 824.074 | 637.587 | 0.444 | 100% |

Hard's adapted roles are reflected in acceptable coverage; natural-only coverage need not be strictly higher. Effective OVR per 1,000 spent averaged 10.260 / 10.379 / 11.173 for Easy / Normal / Hard. These are aggregate outcomes, not a promise that Hard wins every auction or every metric.

| Paid player tier | Sales | Mean paid price |
| --- | ---: | ---: |
| 94+ | 432 | 1,078.01 |
| 88–93 | 837 | 977.30 |
| 80–87 | 1,064 | 702.91 |
| Below 80 | 1,207 | 444.49 |

Free and forced awards are excluded from the paid-price table. The pools and contexts allow overlapping prices. The separate unchanged 45-auction balance experiment also passes its elite premium test: elite mean 1,415 versus 1,050 for its mid-tier comparison.

Checks cover unknown grey/zero-impact links, retained canon red links, positive and chemical links, neutral-vs-negative networks, bounded chemistry, talent-vs-synergy limits, adapted-role superiority, rejection of incompatible roles, all-formation Auto Best and reserve alternatives, Results effective/base leaders, MVP and value reversals, cache equivalence/invalidation, historical Daily saves, puzzle feasibility, codes, Undo/Redo, versioning, data integrity and localization. All twelve current mini-formations have a complete natural-fit constructive witness; the separate sensible-pick sample meets its existing functional threshold in 17 of 18 formation paths.

A representative 14-player local benchmark took approximately 76 ms for an uncached CPU formation plan and 597 ms for Auto Best across all formations. CPU target evaluations and symmetric chemistry relations are cached separately from saves. Tests compare cached evaluations with fresh calculations and invalidate on difficulty, pool or owned-roster changes; caching does not change auction output.

Additional checks preserve every player's base data, attributes, positions, aliases, quotes, weapons, nationality/flags, secret gates, all standard and mini-formation geometry, squad codes and existing save schemas. Shigeo Mizuki's exact quote, “I can run my ass off.”, and its translations are untouched. Historical changelog prose is retained; the prior current entry becomes the v0.7.2.2 history entry. Central version, HTML asset query strings and image/font worker cache advance together to 0.7.2.3.

New copy and release notes ship in English, Simplified Chinese, Spanish, French, Arabic, German, Portuguese, Russian, Korean, Japanese and Malay. The release gate has zero uncovered source strings, zero integrity errors and zero contextual warnings. Technical files/tests/report documentation are not interface copy.

Browser checks use local Chromium with desktop and responsive 390px viewports: dark/light, Arabic labels, unchanged pitch geometry, neutral/negative strokes, keyboard tooltip access, Results metrics, Daily and puzzle rendering, PNG generation and the Save preview. These checks do not substitute for physical-device testing or every possible saved squad combination. No live public deployment was tested or performed. Browser screenshots were used only for internal QA and are not included in the changed-files ZIP.

Reproduce the complete suite with `node scripts/preflight.js`. The paired experiment can also be run alone with `node scripts/chemistry-balance-tests.js /tmp/bld-chemistry-report.json` to retain the detailed per-auction measurements.

## Changed/new files

- `404.html`
- `auction/results.html`
- `auction/results/index.html`
- `auction/room.html`
- `auction/room/index.html`
- `auction/setup.html`
- `auction/setup/index.html`
- `auction/team-builder.html`
- `auction/team-builder/index.html`
- `battle-sim-disabled/index.html`
- `battle-sim/game/index.html`
- `battle-sim/index.html`
- `battle-sim/initializer/index.html`
- `battle-sim/results/index.html`
- `changelog/index.html`
- `css/battle-sim.css`
- `css/character-lore.css`
- `css/homepage.css`
- `css/player-stats.css`
- `css/site-theme.css`
- `docs/release-v0.7.2.3.md`
- `index.html`
- `js/auction.js`
- `js/battle-sim.js`
- `js/chemistry.js`
- `js/formations.js`
- `js/localization.js`
- `js/lore.js`
- `js/preflight.js`
- `js/results.js`
- `js/solo-draft.js`
- `js/squad-balance.js`
- `js/ui/solo-draft-ui.js`
- `js/version.js`
- `legal/index.html`
- `lore.html`
- `lore/index.html`
- `privacy/index.html`
- `scripts/balance-tests.js`
- `scripts/chemistry-balance-tests.js`
- `scripts/fixtures/daily-mini-completions.json`
- `scripts/fixtures/legacy-solo-v0722.json`
- `scripts/preflight.js`
- `scripts/solo-draft-tests.js`
- `service-worker.js`
- `style.css`
- `team-builder.html`
- `team-builder/index.html`
