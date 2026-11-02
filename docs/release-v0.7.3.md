# v0.7.3 — Replayability, retention and full-site polish

Base: `main` at `fe0e520`. `main` did not move during development. The design rationale
is in [the v0.7.3 product audit](v0.7.3-product-audit.md). Battle Sim stays Early
Access and was not changed. No player ratings, positions, chemistry values, quotes or
the Chapter 364 cutoff were changed.

## What players get

**Ego Board** (`./?play=board`, header CHALLENGES → EGO BOARD, top of the home page) — the
"what can I do today?" screen. Three deterministic daily activities, each with status,
grade and best score, plus a seven-day strip. Missing a day costs nothing: there are no
streaks, energy, timers or currencies.

1. **Daily Ego Draft** keeps its theme, offers, rerolls, formations and scoring, and now adds
   one *mechanical* rule per day: Deep Scouting (four offers, no rerolls), Salary Cap
   (priced offers and a cap), Locked Captain (a fixed star starts in the squad with the
   armband), Elite Cap (one 90+ player), Natural Roles and Chemistry First (scoring
   weights), Extra Scouting (four tokens), Head Start (a defender and an attacker already
   signed) and Fixed Shape (one formation). A compatibility table excludes redundant
   pairs (e.g. Elite Cap on "No Superstars"); themes and rules never repeat on consecutive
   days. Pick sizes now include 7–11 and 14.
2. **Daily Tactical Challenge** — a 2–5 minute squad puzzle from four validated templates
   (Final Pieces, Budget Crunch, Repair Job, Chemistry Call). Each generated puzzle is
   solved by the shared solver before it is shown; required goals sit just below the
   solver's answer and bonus goals ask for it.
3. **Daily Draft Duel** — today's seeded Draft Duel against the Normal CPU.

**Ego Draft Duel** (`./?play=duel`, header PLAY → DRAFT DUEL). Four players reach a shared
market each round. The first picker alternates (a seeded coin decides round one); the
other manager picks from the rest; the remainder vanish. Cards show which players fill
your open roles and which the CPU needs, so denial and scarcity are visible decisions.
Formats: Quick 7, Standard 9, Full XI. At the end you choose your formation; the CPU uses
its best lineup. The verdict compares Effective OVR, then chemistry, then Base Quality,
using the same Auto Best search and snapshots as the Team Builder. No match is simulated.
Rematch, duel codes (`BLDD1.`), copyable result text, PNG export and Build From Team are
included.

**Draft Challenges** (`./?play=challenges`) is now a full browser: category filters
(Tactical, Chemistry, Budget, Formation, Character, Restricted, Expert), a "not
completed" toggle, difficulty, formation/budget/open-role facts, medals (bronze =
required goals, silver = A, gold = S/S+) and best grades. Six new missions each add a new
decision: The Back Five, World Stage, Shoestring XI, U-20 Reunion, Foreign Legion and
Banned Stars (16 total). Import accepts Challenge Lab codes and the existing auction
mission codes.

**Challenge Lab** (`./?play=lab`) — title, formation, budget, player pool, locked players
on a tap-to-lock pitch, optional captain, up to four required and three bonus goals
(minimum chemistry, minimum Effective OVR, budget left, players from one country or
category) and up to eight banned players. TEST CHALLENGE runs the solver and shows a
valid answer's OVR, chemistry and spend; only then is a `BLDL1.` code produced. Codes can
be played immediately, saved to My Lab (20 items) and imported by friends.

**Ego Record** (`./?play=record`) — active days, best Daily score, Daily S/S+ counts,
Tactical Challenges solved, challenge completion and medals, Draft Duel W–L–D per
difficulty, Lab challenges created, favourite formation, most-used players, best
chemistry and best Effective OVR, this week's activity and fourteen achievements (for
example Giant Killer, Natural Eleven, Tactical Range, Gold Standard, Full Board,
Regular). Everything is local; existing Daily and challenge records are credited once
on first load.

**Navigation.** The header's AUCTION group is now PLAY (Auction Draft, Quick Draft, VS CPU,
Draft Duel, Resume). CHALLENGES lists Ego Board, Daily Ego Draft, Draft Challenges,
Challenge Lab and Ego Record. The mobile directory has the same destinations. The home
page leads with today's board, then PLAY and CHALLENGES card groups.

## Pre-existing problems found and fixed

- **The release gate was broken on `main`.** `js/preflight.js` had a syntax error (a patch
  spliced two checks into the middle of a string) hiding 13 more failures; 8 of them
  already failed at `443da13`. Causes: null secret-character reference modules
  registered as profiles, 14 untranslated secret-character weapon strings, an
  untranslated Battle Sim line, stale test expectations for collaborator-updated secret
  data, redirect stubs mistaken for page shells, and drifting asset versions.
- **Secret leak:** after secret chemistry moved into the shared table, public dossiers
  (e.g. Shoei Baro) showed Qazicutie's pair card in locked sessions. Locked partners are
  now filtered from dossier cards and counts; a regression test checks every secret name.
- **Stale assets on one route:** `auction/results/` requested `chemistry.js?v=0.7.10.0`
  and `player-reference.js?v=0.7.2.3` while other pages requested newer files.
- **Shell drift:** six game documents contained a "Meet the developers" block that the
  real home page had dropped.
- **Solo screens** (Daily, puzzles) had no side gutter below 1360 px; the back button
  touched the viewport edge at 1280 px.
- **Home utility cards** left a half-empty row on desktop and broke "DATABASE" into
  "DATABAS / E" at 390 px.
- **Empty Daily best score** rendered an oversized bare dash; it now reads "No score yet".

## Architecture

- `index.html` is the single editable game shell. `scripts/sync-shells.js` regenerates the
  six canonical directory documents, syncs the header/footer into the information and
  Battle Sim documents, and turns the seven legacy `*.html` URLs into ~1 KB redirects that
  preserve query and hash (previously seven 48 KB copies). Preflight fails on drift.
- `scripts/set-version.js` moves `APP_VERSION`, every HTML `?v=` reference, the player
  module loader and the service-worker cache name together (previously three version
  schemes). Preflight fails on stale references.
- New engines are rendering-free and reuse the shared football model:
  `js/draft-duel.js` (`cpuAssignment`, `tacticalChemistrySnapshot`,
  `lineupContributionSnapshot`, `bestLineupForFormation`, `shareFormationSnapshot`),
  `js/challenge-lab.js` (one solver for curated validation, Daily Tactical generation and
  Lab feasibility; Lab and tactical missions are ordinary puzzle missions with the same
  pricing, rules, scoring and records) and `js/ego-record.js`.
- Play views live on the home document (`./?play=…`, like the existing `./?solo=run`); the
  router preserves the parameter and Back/Forward work.

## Saves and compatibility

- New keys: `bldDraftDuelV1`, `bldDraftDuelRecordsV1`, `bldChallengeLabV1`,
  `bldEgoRecordV1`. Every reader validates and sanitizes; malformed data is discarded
  without touching other keys.
- `bldSoloDraftV1`: Daily runs started under the new rules record `rules:3`. Runs saved
  by v0.7.2.3 — including one in progress on 2 November 2026 — replay under their original
  rules. Lab runs store their own code and re-register on reload.
- `bldSoloRecordsV1`: same format; keys additionally accept `puzzle:tactic:<date>` (last 31)
  and `puzzle:lab:<id>` (last 40). The read window grew from 60 to 140 entries so new keys
  cannot evict existing records.
- Auction, Team Builder, saved squads, settings and the secret-session gate are
  unchanged. Secret characters cannot be used in Challenge Lab or appear in any generated
  Daily, Tactical or Duel content; the Ego Record hides them in locked sessions.

## Verification

`node scripts/preflight.js` passes with 0 failed checks: the structural/data checks in
`js/preflight.js` plus localization integrity,
localization coverage (0 uncovered strings, 2,352 catalog entries) and the replayability,
game-mode, solo, balance, chemistry and new v0.7.3 suites. The v0.7.3 suite covers:

- 365 Daily dates: no consecutive theme or rule repeats, every rule and size, conflict
  table respected, sampled complete runs under caps/elite limits/locked captains, reload
  equality, legacy runs on new dates keep legacy rules, and the 14-pick benched-captain
  regression found by the experiment below.
- 120 Daily Tactical dates: deterministic, public players only, every template, the
  solver's answer completes the required goals within budget, the starting squad is not
  already solved.
- All 16 curated missions solvable by the shared solver.
- Challenge Lab: round trips; 23 malformed variants (formations, budgets, pools, secret
  ids, misfit or duplicate locks, captains, goal types/ranges/keys, titles, versions),
  tampered checksums, wrong prefixes, oversized input, secret imports and infeasible
  challenges are rejected.
- Draft Duel: determinism, no duplicate ownership, save/code/record validation, CPU choice
  independent of anything but the visible market and rosters, and Hard > Normal > Easy CPU
  strength on 18 paired duels.
- Ego Record: one-time migration, earned-only achievements, secret hiding, sanitizing.

**Daily experiment** (`node scripts/v073-daily-experiment.js 365`, 2 Nov 2026 – 1 Nov 2027,
three policies per date = 1,095 completed runs): 0 failures; never fewer than 3 offers;
0 consecutive theme or rule repeats; themes 35–37 days each; rules 35–45 days each;
sizes 7×40, 8×45, 9×93, 10×47, 11×80, 14×60; 15 formations used; all 79 public players
offered (95–228 times on the first-offer policy). Rerolls made when no offer fitted an
open role produced a fitting offer 107 of 280 times. Mean score by rule (naive
policies): 7,156 Salary Cap … 7,920 Natural Roles; no rule produced an outlier.

**Draft Duel CPU experiment** (`node scripts/v073-duel-experiment.js 16`): 48 duels per
difficulty (16 seeds × Quick/Standard/Full), the same seeds and the same fixed human
policy (greedy own-squad improvement).

| CPU | CPU Effective strength | Chemistry | Positional fit | Primary roles | Human strength | CPU − human | CPU wins |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Easy | 87.21 | 73.3 | 85.8% | 48.2% | 88.59 | −1.38 | 37.5% |
| Normal | 87.78 | 73.5 | 92.9% | 52.8% | 88.54 | −0.75 | 37.5% |
| Hard | 88.44 | 73.9 | 93.8% | 59.4% | 88.19 | +0.25 | 43.8% |

All squads were complete. Easy wasted 0.54 picks per duel on players worth nothing to its
squad while a useful option existed; Normal 0.06; Hard 0.21 (Hard's include deliberate
denial picks). The baseline human here is a strong greedy oracle; these are aggregates,
not a promise that Hard wins every duel.

**Browser checks** (local Chromium via Playwright against a served copy): Ego Board,
Draft Challenges, Draft Duel (setup, draft, review, result), Challenge Lab (lock, test,
code, import into the browser), Ego Record, Daily (briefing, rule, picks, result),
Daily Tactical (briefing, building, result), home Play Hub, Team Builder, Database,
legacy URL redirects, Battle Sim Early Access route, Back/Forward between views and the
secret gate in a locked session. Viewports: 1440×900, 1280×800, 1024×768, 932×430,
430×932 and 390×844, with no horizontal overflow. Dark and light themes; English,
Arabic (RTL text and layout, left-to-right pitches, portraits, chemistry lines and
formation labels), plus automated runtime scans of every new screen in German, Japanese,
Simplified Chinese and Korean for leftover English text (only player names, position
codes and the Blue Lock Draft brand remain, by policy). No console errors in these runs.
Not performed: physical devices, Safari/Firefox, screen readers and the other
languages' runtime scans (their strings pass the catalog integrity and coverage gates).

## Known limitations

- Draft Duel compares squads; it does not play a match. A future Battle Sim could reuse
  the duel squads.
- The Daily Tactical and Lab solvers are beam searches: they prove a solution exists and
  set targets from it, but they do not prove the answer is optimal, so an S+ above the
  solver's answer is possible.
- The 1280 px header uses the existing compact (hamburger) mode when the full directory
  does not fit; this is pre-existing adaptive behaviour.
- Lab challenge titles are user text and are not translated.
- The Ego Record counts only results finished from v0.7.3 onwards, plus the dated Daily and
  completed challenge records that earlier versions stored.
