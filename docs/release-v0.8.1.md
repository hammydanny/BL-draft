# Battle Sim experience correction — review build 0.8.1.1 ALPHA

6 November 2026. Baseline: `2c91974f34e0b79fe6d52e974f6d1606b6395d28`,
fetched from `origin/main` before work and checked again before packaging.

**Implementation and automated verification are complete locally. Release acceptance
is still open: the corrected build has not completed the required real-browser
match or screenshot/viewport matrix. Do not interpret the DOM tests as browser QA.**

The requested version 0.8.1 was already live on main for collaborator portrait
fixes. This correction uses **0.8.1.1**, preserving those changes and the existing
release-fingerprint rule. Restamping live 0.8.1 would leave returning browsers with
stale assets. Canon coverage remains Chapter 364.

## 1. Confirmed defects and causes

- `css/battle-renaissance.css` explicitly hid `.bs-pitch-panel`. The old renderer
  still rebuilt an invisible 18-cell zone grid and limited each cell to four players.
- Score, clock, possession, formations, stamina and Flow rendered directly from the
  simulation while commentary used a later feed timer. Shots could therefore expose
  goals, possession and player changes before the corresponding event appeared.
- The feed's displayed event count included events still awaiting presentation.
- Reserve cards lacked `data-player-id`, so the incremental updater skipped them.
  Meter titles and player tooltips also retained old values.
- Manual pause stopped the runner but left the feed running. Speed changes restarted
  the event delay instead of preserving its remaining fraction.
- Runner polling, feed state and stoppage rendering used different readiness checks.
  A terminal goal/save/foul/card could leave a paused engine at 90:00 with no legal
  Proceed action; that case now finishes automatically after its events are revealed.
- Historical styles repeatedly redefined layouts, sliders and meter dimensions.
  Some small labels and colored grades used bright ink suited only to dark surfaces.

## 2. Live pitch

A persistent, horizontal football field replaces the grid: striped grass, touchlines,
halfway line, center circle, penalty/six-yard areas, arcs, spots and goals. All active
players receive deterministic coordinates derived from their actual engine zones.
Crowded zones receive ordered offsets, clamped as a group to avoid stacking at edges.

Team 1 attacks right; Team 2 attacks left. A legend shows both directions. Circular
and squared team markers distinguish teams even with similar saved colors. Goalkeepers
have GK labels and gold outlines. Players have shirt numbers, short names and full
name/role tooltips. Possession has a carrier outline and a recognizable football.

Movement uses 180 ms CSS transforms, with no animation loop while paused. Passes,
interceptions, saves and goals update the ball/trail and involved-player emphasis
only at reveal. A shot attempt highlights its shooter without guessing its outcome.
Substitutions replace the appropriate marker; sent-off players disappear on reveal.
The field is a **zone projection**, not an upgrade to the engine's physical accuracy.

## 3. Before/after visual comparison

| Before, confirmed in source and published browser | After, implemented in source/DOM |
| --- | --- |
| Invisible live pitch; static formations and feed dominate | Central live field above the feed, with surrounding tactical boards |
| Up to four initials per grid cell | Every active player has a separate persistent marker |
| Unlabelled speed track and thin meters | Label, numeric delay, explanation, native range thumb/track, wider meters |
| Future score/possession/meter state | Visible event-boundary state |
| Bright fixed-color status/grade labels in light mode | Semantic ink and a deliberately green field palette |

Published setup/live/results screenshots were captured in both themes and supplied
separately as `BL-Draft-before-screenshots.zip`. These are **before images only**.
There are no verified after screenshots; a before/after appearance claim would be
unsupported until the browser gate below runs.

## 4. Sequence progression

`progressionState` is the authoritative calculation for simulating, presenting,
manual pause, stoppage, mandatory substitution and finished states. The stoppage
panel, Proceed button and substitution guard derive from it. The runner advances
only after the presentation boundary settles; repeated 100 ms polling is removed.

Proceed changes state synchronously, blocking double activation. The stoppage panel
sits outside the feed so it cannot obscure or reorder event history. Real post-goal
kickoffs receive a presentation entry without consuming RNG. Half-time keeps its
existing simulation transition. Full-time presents the final event, then routes to
results automatically, including terminal stoppages and restored matches.

Fast Forward cancels pending work, resolves mandatory replacements internally and
stores a valid final display snapshot so results survive navigation and reload.

## 5. Flow, stamina and player panels

Every starter/reserve carries its player ID. Cached node bindings update Flow,
ratings, stamina rings, meter values/titles and player tooltips for the revealed
state. Structural changes rebuild the affected panel while retaining expanded
manager controls. Ordinary frames reuse panel and pitch elements.

Flow meters use 8–9 px tracks and 120 ms fill transitions; full meters receive a
separate fill treatment. **Accumulation, activation/reset rules, stamina drain,
ratings and canonical player data are unchanged.** Twelve baseline fixtures compare
complete tick-by-tick Flow/stamina/statistics digests and final engine/RNG/event
snapshots; the existing 24 seeded save/restore matches also pass.

## 6. Playback and manager controls

Pause/Resume, Fast Forward, feed delay and Proceed occupy one central control group
above the field. The delay label states that it changes seconds between events,
not match calculations. Native ranges retain keyboard and touch behavior, explicit
thumbs/tracks, readable outputs and focus outlines. Pausing suspends presentation;
changing speed rescales its remaining fraction without releasing an event.

Team tactics stay in their respective panels, update in place while the thumb moves
and save on the native change event. Expanding tactics retains values. Set-piece
choices also persist across subsequent stoppage rendering.

## 7. Spoiler boundary and saves

Each event records a compact versioned view of score, clock, phase, possession,
ball/carrier, assignments and mutable player state. Rendering reads that view, not
future engine values. Event-specific colors/actors enter the DOM only on reveal;
the visible event count also counts only revealed events.

Saves retain the current view and unpresented suffix, dropping obsolete historical
position snapshots from serialized storage. Required views are validated against
canonical rosters and value ranges. Unknown presentation versions are rejected.
Old saves without views reveal their existing history together at the restored
engine state; exact earlier movement cannot be reconstructed. Save keys and canonical
rosters remain compatible. No new runtime library or application script is added.

## 8. Light mode and wider-site work

Battle Sim uses semantic surfaces, text, controls, focus and disabled colors.
The green tactical boards and live field retain their own readable ink and chemistry
palette in either theme. Rating colors mix with theme text rather than using the
same bright HSL value on every background. Disciplinary labels and negative chemistry
text consume the existing danger token.

Static review covered the shared palette and component styles used by Home, Auction,
Builder, Database, Duel, Daily, Ego Board/Record, Challenge Lab, results, settings and
information pages. Targeted fixes replace fixed gold/pink text in Ego Record
notifications, Daily grades and challenge grades with existing semantic tokens.
No shared token values or mode gameplay changed.

Calculated sRGB contrast on the light raised surface `#f2f7fc`:

| Text | Before | After |
| --- | ---: | ---: |
| Ego notification label | 1.47:1 | 5.22:1 |
| Daily grade | 1.76:1 | 5.22:1 |
| Challenge grade | 2.84:1 | 5.81:1 |

These are selected palette calculations, **not a site-wide WCAG certification**.
The wider-site light/dark browser audit remains open.

## 9. Performance

Same local Node 24 runtime. No browser layout, paint, network or real-device timing
is included. Five paired runs used linkedom and identical seeded kickoff rosters;
each run called the complete match renderer 200 times at an unchanged presented
state. Median JS/DOM time was **861.33 ms before / 822.24 ms after**. Allocations were
**11,800 / 0** elements. This measures rendering work, not match FPS or animation
smoothness. It includes neither simulation/event generation nor event-card creation.

Reproduce with `NODE_PATH=/tmp/bld-qa/node_modules node scripts/benchmark-battle-dom.js`
(the original baseline git history must be available).

Timings varied between batches; repeat them before drawing conclusions about elapsed-time
gains. The allocation reduction was consistent.

The dependency-free `node scripts/benchmark-battle-sim.js` separately measured
200 warmed panel-only updates: **113.84 / 58.12 ms**, with zero new elements in both
versions. That script also retains its historical bundle comparison; bundling itself
is unchanged in this correction. The one character-bundle request and 178 equivalent
source records are preserved. A complete DOM match's final save was **365,127 bytes**.

## 10. Validation

Passed:

- Baseline and corrected `node scripts/preflight.js`; zero failed checks.
- `node scripts/sync-shells.js --check`, `node scripts/set-version.js --check`,
  `git diff --check` and final focused syntax/presentation checks.
- Eleven-language localization: **0 uncovered strings, 0 integrity errors,
  0 contextual warnings**. New copy and changelog are included in all eleven.
- Existing Battle Sim suite: canonical Blue Lock Man handoff/locks, every formation
  and orientation, sent-off chemistry, 24 full seeded save/restore continuations,
  substitutions and byte-equivalent character data.
- New preflight suite: hidden goal/position/meter state, snapshots and legacy saves,
  stable 22-player projection, cards/substitutions, unique Flow activation, 12 full
  baseline fixtures, pause/speed timer fractions, duplicate prevention, fast-forward
  replacement/result reload, RNG-free kickoff reveal and terminal stoppages at 90:00.
- DOM-only full match, seed 42: **40 stoppages**, half-time, substitution,
  pause/resume, speed changes, reload, score/meter/marker checks throughout,
  automatic full-time, **422 events**, final score **2–7**, no leftover timers.
- Existing Auction, Builder, Database, Daily, Duel, Challenge, Ego Board/Record,
  secret-roster, storage, chemistry and chapter-tracker automated regressions.
- Diff review: no player sources, generated character data, chemistry, formations,
  chapter JSON, supported chapter or GitHub workflows changed.

Reproduce optional DOM exercise (no browser):

```bash
npm install --prefix /tmp/bld-qa linkedom --no-audit --no-fund
NODE_PATH=/tmp/bld-qa/node_modules node scripts/battle-dom-tests.js
```

Real-browser baseline: published setup, live match and fast-forwarded results were
opened and captured in dark/light. This was **not a full narrated match**.

## 11. Remaining browser gate and limitations

Local Playwright Chromium could not launch because its required process socket was
not permitted. The separate cloud browser could inspect the published site but could
not reach the local preview. Its URL policy also disallowed local file URLs; no bypass
was attempted. Consequently the corrected build's required kickoff-to-full-time
browser match, after screenshots and visual/a11y matrix remain **unverified**.

An optional Playwright runner is provided, but has only received syntax checking in
this environment. In a browser-capable checkout, serve the project over HTTP and run:

```bash
python3 -m http.server 8765
# In another terminal, with Playwright and Chromium available:
node scripts/browser-battle-sim.js http://127.0.0.1:8765/ /tmp/bld-browser-qa
```

It exercises a full match and captures setup/live/results in both themes at
320×640, 390×844, 430×932, 932×430, 1024×768, 1280×720, 1440×900 and 1920×1080,
plus Arabic/light live play. Review those screenshots, football geometry, formation
links, crowd readability, touch/keyboard behavior, reduced motion and the other major
pages before release. Real devices, Safari/Firefox and screen readers were not tested.

## 12. GitHub and review status

Work is isolated on local branch `release/v0.8.1-correction`, based on the latest
main above. The local correction commit is identified in the delivery message.
The changed-files ZIP uses repository-relative paths. No screenshots, temporary npm
packages or QA working files are committed.

**Nothing was pushed, merged, deployed or published. No PR was created.** Remote
main remained at the baseline SHA when last fetched. Remote CI/deployment has not
run for this local correction. Separate explicit authorization is required before
pushing this corrective release to main; the remaining browser acceptance must also
be resolved.
