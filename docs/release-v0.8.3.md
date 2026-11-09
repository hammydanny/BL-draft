# BL-Draft v0.8.3 ALPHA — Battle Sim attacking and presentation

**Release date:** 9 November 2026  
**Baseline:** `02d05ad17b3c9e41c62c47738863ac294ba46e0a`

## Fixing the 0–0 match regression

The v0.8.2 spatial engine pulled attacking runs back toward home formation coordinates too aggressively. This kept many attacks outside shooting range. Failed dribbles also had a fallback that could award possession to a distant defender.

This release preserves continuous x/y simulation, the speed-ordered movement loop, stamina effects, Team Builder OVR and saved match snapshots, but changes:
- **Attacking shape:** forwards make deeper runs toward the box; midfielders support and defenders stay behind the ball. Defense retains tactical pressing and formation recovery.
- **Real shot selection:** players within 36 m of goal consider a shot according to shot skill, distance, pressure, tactics, and Flow. No fake goals or forced outcomes.
- **Passing/dribbling:** pass chances still account for distance and pressure. Dribble failure without a nearby tackler no longer teleports possession to a far-away player.
- **Meaningful Flow:** active Flow boosts relevant outfield action skills modestly; earned Flow charges more noticeably from successful moments, then expires through the existing lifetime rule.
- **Honest statistics:** event and team shot totals still come from the same engine outcomes.

An initial synthetic 30-seed full-match smoke run, *before the final Flow gain adjustment*, recorded **22.2 shots and 2.33 goals per match** and **2 scoreless games**. The new v0.8.3 regression runs 16 full games using canonical roster players and asserts the engine no longer produces persistent 0–0 outcomes. Neither test substitutes for live player feedback.

## Set pieces, saves and goalkeeper

A dedicated set-piece arrangement places players meaningfully before a restart. Corners position their taker at the actual corner, send several attackers and markers into the box, and create real crosses; free kicks position attackers and a nearby defensive wall; penalties clear the area; goal kicks spread both sides.

A **goal kick is always distribution**, not an accidental long-range shot. Crosses, short corners, free-kick passes and long distributions evaluate **PAS**; direct free kicks and penalties evaluate **SHO**. The taker chooser updates its visible skill labels when the routine changes.

The goalkeeper retains possession and the ball's displayed coordinates after a **caught save**. Parried saves can still create rebounds.

## UI from the supplied sketch

- Formation markers are compact cards: **circular portrait and stamina ring left**, **position + LIVE OVR right**, **horizontal Flow bar beneath**, and player identity exposed through the tooltip/accessible label.
- Stamina rings and portraits have fixed equal dimensions and circular clipping, eliminating stretched oval portraits.
- The existing live-pitch marker dimensions are retained. Number chips are replaced by the player's actual portrait, framed by team color with a white highlight.
- Goalkeeper portraits have a yellow highlight and a small **GK** badge above their marker. The original Flow aura and event-synchronized pitch animation remain intact.

## Compatibility, performance and constraints

- No player ratings, chemistry, supported manga chapter or formation definitions were changed.
- No old saves are erased; the v2 spatial snapshots introduced in v0.8.2 remain in use.
- No new dependencies, framework, animation loops or image assets.
- No force-push. Preserve newer collaborator work before release.
- All new changelog copy is localized into the existing 11 languages.

## Verification

Testing includes: spatial movement/position validation; 16 full canon-roster seeded matches with shot/goal distribution thresholds; goalkeeper caught-save possession; corner participants in the box; free-kick defensive wall; goal kick passing without a shot; correct PAS/SHO taker labels; existing 24-match save/restore, 12-seed presentation determinism, Blue Lock Man, formation, localization and web preflight suites.

A synthetic pre-release simulation covered 30 full games. **No real-browser layout screenshots were produced during that synthetic test.** Report GitHub Actions and deployment status only after their runs complete; do not treat DOM/source checks as real-browser QA.
