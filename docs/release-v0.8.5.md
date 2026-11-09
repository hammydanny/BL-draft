# BL-Draft v0.8.5 ALPHA — Battle Sim Overhaul Part 2

**Date:** 9 November 2026  
**Baseline:** `86ee2f643e7e2035b350cbe57158b9c279e8e463` (Syaafi's v0.8.4 pre-match introduction preserved).

## Virtual match engine and viewing projection

The simulation continues to store normalized x/y coordinates so saved v1/v2 matches and the existing mobile pitch remain compatible. It now has an independent **1050×680 virtual pixel plane** corresponding to a 105 m × 68 m football pitch. Movement, measured distance, and events derive from this plane, and a separate projection converts physics coordinates to percentages on the displayed live pitch. Visual marker separation never changes player physics.

- Faster players still move farther each tick. Off-ball runners move in effective SPD order.
- Kickoffs force the first taker to pass safely to a teammate, without interception.
- Short passes favor nearby receivers and draw straight paths; long passes target at least two-thirds of the virtual pitch height (~45 m) where possible and draw a curved arc. Explicit corner crosses are a set-piece exception to the general range rule.
- Passing uses the sender's PAS, physical distance, receiver pressure, and the canonical relationship chemistry. An unguarded receiver succeeds automatically on ordinary passes.
- Uncontested dribbles succeed automatically; contested dribbles use the number of nearby defenders and one seeded-random nearby defender's DEF.
- Pass paths are drawn only when the event is revealed, using chemistry tier colors. The simulation's event cursor and visible state remain separated.

## Shooting, saves, set pieces and Flow

The emphasis is on energetic Blue Lock-style opportunities, not guaranteed scoring. Players are more likely to shoot from or near the box, with reduced distance penalties and balanced goalkeeper outcomes. Failed shots can be corners, clean goalkeeper possession, rebounds, and near misses. Higher GK skill favors clean catches over rebounds; penalties can produce a second chance from a rebound/woodwork without awarding a guaranteed goal.

Corners, free kicks, goal kicks and penalties **move everyone into planned positions during the stoppage**, before the next simulation tick. The taker and routine selectors immediately restage players and update the visible presentation snapshot. Corners put most outfield players inside the large box and choose a deterministic-random corner; short corners bring a nearby teammate and defender. Goal kicks default to the GK, with a distinct choice to nominate an outfield taker, who physically travels back to the goal before distributing. Goal-kick distribution uses the taker's GK attribute. Free-kick passing uses PAS, direct shots use SHO.

Flow remains earned through play, with the existing halo on the live-pitch portraits enhanced for readability in both themes.

## UI and saved-team integration

- Removed the text “LIVE OVR” from compact side-formation cards while retaining the numeric live rating, accessible names, circular stamina rings and horizontal Flow meters.
- Right-hand Team 2 tactical formation and chemistry edges are vertically flipped together.
- Compact source picker allows directly selecting each saved Standalone Team Builder, Auction, or Battle Sim library squad with one action. Refresh Saved Teams supports returning from the Team Builder. Saving a team to Team Builder additionally keeps a named Battle Sim library copy without changing the builder's existing single-save format.
- Feed delay minimum reduced to **0.1 second**.
- Existing v0.8.4 pre-match lineup introduction remains in place.

## Verification and limitations

Run targeted simulation checks on the virtual physics, pass route semantics, chemistry, uncontested interactions, early stoppage layouts, goalkeeper vs outfield goal-kick takers, import persistence, the speed control, 11-language localization, fast forward, and deterministic full matches, alongside the established preflight.

A synthetic 40-match smoke sample on a draft implementation averaged about **3.0 goals and 27.6 shots**, with one 0–0. These are development measurements, not claims about every saved squad or difficulty combination.

Real-browser layout and live-device tests are not established by that synthetic run. Confirm GitHub Preflight, release fingerprints, and Pages deployment before declaring the release ready; report any remaining visual limitation honestly.
