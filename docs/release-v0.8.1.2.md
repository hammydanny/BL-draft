# v0.8.1.2 ALPHA — Battle Sim layout and presentation

Baseline: `c600089dd8c0dba52fb34cb13c05211444f3007f`. Both its GitHub
Preflight and Pages deployment were confirmed successful. This release does not
change canonical players, ratings, chemistry, formations, simulation rules, save
keys, chapter coverage (364), or the generated character bundle.

## Layout

The desktop grid now reserves at least 330 px for each team rather than 280 px,
with a more balanced 1 : 1.4 : 1 arrangement. The live field keeps its exact
1050:680 proportions but caps its height through its width at roughly 24 svh
(170–230 px). Coordinates continue using that same aspect ratio and container
units; the field is not stretched. Match heading, scoreboard and controls use
less padding. The feed follows the pitch, stoppage and sequence row.

The center stage comes first in DOM order, including keyboard navigation. Team
panels occupy their surrounding desktop columns through explicit grid placement.
At 1180 px and below the match precedes two team panels; at 780 px and below
panels stack and native squad disclosures start collapsed. Both disclosure states
(squad and tactics) survive structural panel updates.

Side boards are wider and taller (840 px), allowing portraits, role labels, names,
two OVR values, Flow, stamina rings and performance ratings to remain separate.
Cards occupy 17% of the board width. A shared padded projection maps tactical
coordinates into 12–88% horizontally and 10–90% vertically for both cards and
chemistry endpoints. Canonical formation definitions and their relative arrangement
are unchanged. Static setup boards retain their existing projection.

## Two OVR values

Green **POS OVR** uses the same `playerContribution(canonicalPlayer, slotLabel,
links).effective` value as Team Builder. It includes the actual assigned role and
local formation chemistry once. Canonical records are resolved through `playerById`
so demonstrated positions and special-keeper metadata survive Battle Sim's cleaned
runtime records. There is no Auto Best call and no formation reassignment.

Red **LIVE OVR** is `round(contribution.raw × (0.7 + 0.3 × stamina / 100))`.
The multiplication delegates to Battle Sim's existing `effective(p, "ovr")`
helper with the unrounded Builder contribution supplied as its input. Thus it
uses exactly the existing stamina effect, applies it once, and rounds only the
final displayed value. At 100% stamina both displays agree. Chemistry is not added
again after fatigue. Flow does not introduce an invented OVR bonus.

Match Rating remains the separate performance score. A localized tooltip explains
all three concepts. Unassigned reserves say BASE OVR until they receive a slot.
Lineup contributions are cached independently of stamina, keyed by formation,
slots, assignments and sent-off players. Revealed stamina updates Live OVR in place;
formation changes and substitutions invalidate the structural display as needed.

## Flow aura and event boundaries

The live pitch toggles `.is-flowing` only for an active player in the presented
view whose Flow is full. The existing engine considers `flow >= 100` active and
resets it after its established full-tick duration. Revealed expiry removes the
class; substituted/sent-off markers are removed normally. There are no added aura
nodes, particle loops or simulation changes. A small cyan pseudo-element pulses
through CSS opacity; reduced motion disables the pulse. The yellow carrier outline
remains distinct. No future engine values are used for aura or OVR rendering.

## Stoppages

The stoppage panel now sits between the field and feed, outside feed scrolling.
The single existing Proceed button moves into an adjacent sequence row. Readiness
still comes from the established progression state and blocks unrevealed events or
mandatory replacements. The panel disappears during play/presentation. Stable
stoppage rendering retains controls, and taker/routine and mandatory reserve choices
persist when controls do need rebuilding. No duplicate Proceed action was added.

## Automated validation

- Baseline GitHub Preflight successful; local full preflight successful.
- Shell/version/fingerprint checks and `git diff --check` passed.
- Eleven-language coverage: 0 uncovered strings; integrity: 0 errors/warnings.
- New preflight refinement suite compares every assigned player against actual
  `formationContributionSnapshot()` in all ten formations for both teams, including
  Blue Lock Man GK. It checks stamina, changed slots, substitutions, bench labels,
  revealed-only OVR and save/reload.
- DOM match tests check stoppage ordering, one Proceed button, aura activation and
  expiry without an early reveal, and chemistry endpoints against marker positions.
- Full DOM match: seed 42, 40 stoppages, half-time, substitution, pause/speed changes,
  reload and automatic full-time; final score 2–7, 422 events, no leftover timers.
- Existing deterministic simulation/Flow/stamina and all other mode/save/secret/
  chapter regressions remain part of preflight.
- Both Battle Sim stylesheets passed CSS parsing. Optional browser runner includes
  1366×768 alongside the existing responsive/theme screenshot matrix.

## Performance

Five paired runs of 200 unchanged-state full DOM renders (Node/linkedom, no browser
layout or paint) compared this release with c600089: median 812.59 ms before and
818.01 ms after; zero new elements during ordinary frames in both versions.
This small timing difference is within a noisy synthetic workload; no FPS or speed
improvement is claimed. Runtime dependencies and script requests are unchanged.
New work is a bounded lineup cache, in-place text updates and one CSS class per
pitch marker. Benchmarks can be repeated with `scripts/benchmark-battle-dom.js`
using linkedom outside the project through NODE_PATH.

## Browser verification and remaining limits

A genuine cloud browser inspected the published v0.8.1.1 baseline in both themes
at its available viewport, 1363×936. The before screenshot showed a 459 px tall
pitch and the feed starting at y=1159, below the viewport; side panels were 280 px.
A fresh release query was needed to avoid an older cached HTML response.

Local Chromium preview previously failed on the environment's process socket
restriction, and the cloud browser cannot reach that preview. The supported cloud
browser interface has no viewport-resizing capability. Therefore actual screenshots
at all seven requested sizes, and real-device/touch testing, cannot be claimed from
these alternatives. The optional Playwright runner is supplied for a browser-capable
checkout. DOM checks are not browser visual verification.

Post-deployment observations, screenshots and the final GitHub SHA/status are
reported with the delivery. Check feed visibility at 1366×768 and 1440×900, dense
five-defender shapes, all labels in both themes, Arabic geometry, reduced motion
and a complete real-browser match before treating the full visual matrix as closed.
