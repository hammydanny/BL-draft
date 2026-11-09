# BL-Draft v0.8.2 ALPHA — Continuous Battle Sim pitch

9 November 2026. Baseline: `0326696614ffe4f0871b9b8dda3c55faf8c3b84f`.

## Gameplay model
Battle Sim now uses continuous normalized coordinates on a 105 m × 68 m virtual pitch for all live player positions and match calculations. The legacy 18-zone grid is used only for compatibility with prior saved matches, not for movement, pass selection, shooting, or pressure.

- Every tick, all active players without possession move toward a tactical target, fastest effective SPD first. Team tactics, formation homes, ball location and possession influence their intended positions. Faster players cover more metres each tick, and a faster ball carrier dribbles farther on a successful dribble.
- Outfield players can travel anywhere within the playable pitch. Goalkeepers remain inside their own penalty-area region.
- Passing success uses physical separation, distance penalty, receiving skill and defenders within the **9-metre receiver pressure radius**, rather than zone counts. Interception and tackling use proximity in metres.
- Shots and shot selection depend on distance from goal and local pressure. Penalty awards check the actual opposing penalty-box rectangle (last ~17% of the pitch, central 60% of its width), not the attacker's former zone.
- Kickoffs and other resets place players in their own halves based on the selected formations. The opening ball starts on the halfway line.

## Presentation
The live pitch now renders actual spatial coordinates rather than arranging all players around zone centres. Close markers receive only a tiny deterministic display separation; this does not alter the match state. The visible ball and player positions continue to follow presented event snapshots rather than unrevealed engine outcomes.

Side formations use compact cards showing a single LIVE OVR value to the right of the portrait, colored from red to green with the player's actual stamina. A horizontal Flow meter appears below the portrait group. Boards are shorter and the central pitch uses available horizontal space without stretching.

## Compatibility and quality
Saved match presentation snapshots are versioned **v2** with continuous coordinates. Existing v1/zone-era matches are migrated into a representative coordinate layout on load without erasing the match, history or statistics. The old grid remains exclusively as a migration bridge and for historical event metadata.

The automated suite includes 24 seeded match save/restore continuations, 12 independent same-seed spatial timeline comparisons, formation/Blue Lock Man regressions, and dedicated coordinate, kickoff-half, off-ball speed-order, goalkeeper confinement, receiver-pressure, penalty-box and v1 migration checks.

## Verification status
A synthetic JavaScript smoke test verified that both teams start in their halves, all 21 off-ball players moved, spatial presentations validated and the engine produced live events. This is **not** a real-browser test.

The complete GitHub Preflight check and live deployment status must be confirmed after preparing the candidate. Real-device and visual browser verification remains separate; do not interpret simulated tests as proof that the layout has been visually inspected.
