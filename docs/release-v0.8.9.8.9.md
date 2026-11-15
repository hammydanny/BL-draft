# 0.8.9.8.9 — Formation restoration, reactions and five kits

Local review patch against main `9660045319f1e7a67a6586458ac46f54df56dc90`. Chapter support stays at 368. The initial review build was validated without remote writes. The user subsequently authorized publication to main.

## Formation and intro restoration

`normalizeTeam()` used `formatCount < 11 || !roster.some(naturalKeeper)`. The second branch sent full teams without a natural keeper through the small-team generator, replacing the selected formation with generic rows. Only actual squads smaller than eleven now use that generator. Keeper eligibility is calculated independently. The selected slots, assignments and chemistry geometry remain authoritative for full squads. Existing saved matches with the corrupt full-team layout migrate their slot geometry and role/home references without moving live players or changing the selected assignments. Small squads retain their compact layouts and open goals.

The intro's rendering, player-by-player spotlights, sequence and 760 ms reveal interval were restored from `16b4b043fec75ca412f02e56d48140f99e604207`. The recent opening matchup stage, two-star presentation and appended editorial CSS overrides were removed. Existing earlier intro CSS, portraits, typography, spacing and transition behavior apply again. Starter-count and small-format labels remain accurate. Skip, initialization, image fallbacks, reduced-motion rules and localization remain in the original path.

This is a **source restoration**, not a visually verified recreation. No working browser automation session is available in this environment. Desktop/mobile screenshots and a rendered before/after comparison were not obtained; those checks remain unverified. No visual pass is claimed.

## Gameplay corrections

| Mechanic | Result |
|---|---|
| Move It | Flow only, at most 3 m from an active teammate and within normal movement reach; both near goal. Requires a better shooting opportunity and room to take possession. Physically closes the gap, records the touch and spends the action. No free shot, restart interruption or guaranteed goal. Once per Flow, separate from other ultimates. |
| Reflexive Synchronization | Hiori must possess the ball and Isagi must be active. One forward lofted cross, one action, normal flight/race/offside/interception and reception rules. Target is reachable; shared cooldown is **5 ticks**. The full Hiori kit remains unfinished. |
| Planet Hotline | One shared definition, at most three actual passing actions. Partners advance and pass to each other. Cooldown starts **10 ticks after completion or interruption**, including turnover/restart/half-time. Active sequence and cooldown survive saves. Activation uses keyed, localized football dialogue. |
| Puzzle Completion | Isagi's Flow tactical range covers the pitch diagonal, including Metavision run recognition. Flow improves reading of visible runs. Normal Metavision remains 50 m. Sprint speed, movement budgets and defensive races remain physical; no future random outcome is inspected. |
| Optional substitutions | Existing contribution/position/chemistry/Flow evaluation also considers remaining time, score, attacking urgency and projected fatigue. Meaningful gain thresholds rise for needless very late changes; effective elite/Flow players remain protected. |
| Mandatory substitutions | Fast Forward and Auto Play call the same legal evaluator. It ranks valid replacements instead of taking the first reserve. Subbed-off players cannot re-enter; assignments remain unique. |

The takeover and reaction changes are explicitly authorized corrections to Isagi Part 2.5. His unrelated abilities, including separate ultimate allowances, remain intact. Hiori and John source files and unrelated collaborator engine functions remain pinned by preservation tests.

## Five public kits

These are simulation interpretations of the supplied football identities. Their existing Base stats, OVR, positions, canonical weapons and chemistry are unchanged.

| Character | Implemented identity | Limits |
|---|---|---|
| Sae | Reads attacking lanes; weighted kick execution; precise forward deliveries; counter touch against an approaching defender; Beautiful Destruction Flow | 55 m reading, normal physical flights, 7-tick counter and 8-tick special delivery cooldowns; passes can be intercepted and counters can lose. |
| Barou | Goal-seeking choices, Predator Eye against a screened/moving keeper, sharp chop and middle-range finish; Villainous King Flow | Actual keeper/screen geometry; 16–29 m middle shot and suitable angle, 6-tick shot and 7-tick chop cooldowns. Blocks, misses and saves remain. |
| Nagi | Control of reachable deliveries; short reception escape; aerial fake volley; difficult Flow revolver; Reo supply reaction | Trapping never creates physical reach. 7-tick trap, 10-tick two-stage attempt; revolver requires Flow, an aerial Reo delivery, range within 12 m and two close defenders. It can fail before shooting and consumes its once-per-Flow allowance. Reo–Nagi uses a real lofted pass and shared 12-tick cooldown. |
| Rin | Field reading, kicking accuracy, far-side curve-shot opportunity, observed-defender manipulation; more aggressive Destructive Impulse Flow | 55 m reading; curve attempt within 30 m and a real lateral angle; 7/9-tick special cooldowns. The existing shot model resolves aim, blocking and keeping; it does not simulate a new continuous bending-ball physics system. |
| Kurona | Short support, quicker turning reaction within his own sprint cap, short one-two and Planetary Orbit Flow | 7-tick combination cooldown, actual first pass and reachable return support. A return is optional and can be intercepted. Hotline is displayed from Isagi's single shared reaction, not redefined. Return intent survives save/load. |

All five have original, localized event and signature dialogue, Flow presentation, cooldown descriptions, and dossier entries. Rin's Sae interaction remains hostile; no brother-based positive chemistry or guaranteed combined technique was added. Junichi, Keisuke and silent Blue Lock Man behavior remain protected by existing checks.

## Validation

Targeted validation covers every full formation with/without a keeper, assignment/save/import preservation, small formats, old-layout migration, physical Move It gates, cross action and cooldown, Hotline termination and reload, normal/Flow awareness, specialist duel failure, rare-volley eligibility/failure/allowance, Reo–Nagi delivery, legal substitutions and return-intent persistence. The actual battle translation resolver is checked in ten translated languages plus English source.

`docs/restoration-match-metrics.json` records ordinary seeded full matches with no forced Flow, ability activation or goals. The two teams use actual lineups containing all five new characters. Zero observed activations are retained: counter-dribbling and the aerial feint/revolver opportunities are scarce in this small sample. Component tests demonstrate legitimate opportunities and failure paths separately. Rare-ability match frequency is not established by three seeds.

Existing older isolated tests exclude newly completed characters from their filler pool, so a “no abilities without Isagi” fixture still means an ordinary background team. Obsolete early-Hotline cooldown assertions now check termination timing; Hiori's fixture is a cross. Public roster fingerprints were refreshed only after an exhaustive comparison proving all public non-kit fields and every secret record unchanged. The previous Isagi record remains a fixture; its test allows only the requested range/descriptions/cooldown/dialogue deltas.

The complete local `node scripts/preflight.js` result and changed-file inventory are recorded in the final validation receipt. Browser visual QA is separate and remains unverified.

## Protected data and delivery

Only Isagi (1), Sae (14), Barou (15), Nagi (21), Rin (23) and Kurona (26) player records change, exclusively within `battleSim`. Every other player record, all secret records, chemistry source and formation definitions remain unchanged. Hiori's individual kit is not checked as complete. Corrected 0.7/0.8 changelog dropdowns and historical anchors are retained.

The patch ZIP contains only changed/new repository-relative files against `9660045`. Apply after reviewing concurrent main changes. Publication to main was subsequently authorized; consult the published commit checks for remote validation results.

## Final validation result

- Final `node js/preflight.js`: passed, zero failed checks.
- `node scripts/battle-v0885-tests.js`: passed all spatial/offside/finishing/set-piece and sixteen-match checks at **5.27 ms/tick**, below the unchanged 10 ms limit.
- All ten downstream suites passed against final source fingerprint `9b63794c4b5d558848ada01160ebdc4443147d66abdf06992769485bb7d598ac`: `battle-v089-tests.js`, `battle-v0891-tests.js`, `battle-v0894-tests.js`, `battle-v8982-tests.js`, `battle-polish-tests.js`, `battle-evolution-tests.js`, `battle-restoration-tests.js`, `battle-presentation-tests.js`, `battle-refinement-tests.js`, `chapter-tracker-tests.js`.
- The first complete `node scripts/preflight.js` invocation stopped at the pre-optimization performance check (10.03 ms/tick). The failed suite and every remaining suite were rerun successfully after the fix. The entire single command was not repeated; validation was completed in sections.
- The cache preserves effect priority, multiple effect keys, changed group references/lengths and runtime disable/restore; observed Reo copying remains dynamic.
- The Nagi revolver component resolves four controlled feints, each fallible, then one actual shot within one simulation action. Its early failure and independent once-per-Flow allowance are tested. Lofted Nagi receptions use the existing physical flight/race.
- Source comparison proves the five old intro functions (with small-team label compatibility) and all 179 intro CSS rules/responsive contexts were restored. Actual desktop/mobile screenshots remain unverified.
- See `validation-v0.8.9.8.9.json`, `protection-audit-v08989.json`, `restoration-source-comparison.json`, `restoration-match-metrics.json` and `changed-files-v08989.md`. The review build was validated against main `9660045` before publication authorization.
