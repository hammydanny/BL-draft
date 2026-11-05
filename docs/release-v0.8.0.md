# v0.8.0 ALPHA — Battle Sim Renaissance

Starting commit: `66b2ada0fadd52b967a1f1b55787897ea7c89fb9`. The workspace was
empty; the repository was cloned, `origin/main` fetched, and the clean starting
state and recent collaborator changes inspected. No player source data, ratings,
chemistry values, shared formation definitions or secret unlock rules changed.

## Confirmed fixes

- **Proceed readiness:** action and button share `sequenceReady`. A paused engine
  is insufficient: the runner must stop, queued/unpresented events must finish,
  presentation timers must settle, manual pause must be clear and mandatory
  replacements must be resolved. The state changes synchronously before a new
  sequence begins, preventing double activation. The old 500 ms presentation
  delay is removed. Feed completion refreshes readiness immediately.
- **Reload and full time:** the last displayed event ID is saved. Reload rebuilds
  the displayed history and queues only the remaining events. Full time resolves
  without another Proceed, including a final stoppage restored after a reload.
  Fast-forward cancels feed/runner timers and clears pending/mandatory state.
- **Formation mismatch:** live Team 1 markers were inverted while Team 2 links
  were inverted. A shared coordinate helper now positions both endpoints and
  markers identically, including edge clamps. Sent-off players invalidate the
  chemistry cache and have no links. Substitutions update the lineup immediately.
- **Collapsed setup pitch:** the shared `.football-pitch.formation-pitch-v2`
  selector could override the preview height with an undefined variable. A scoped
  pitch-height definition prevents collapse. Board heights and compact markers
  accommodate all ten existing formations without moving their tactical slots.
- **Blue Lock Man:** the actual Auction-results handoff now includes him and its
  goalkeeper assignment. IDs 9101/9102 resolve through canonical `playerById`,
  retaining his unchanged OVR 82/GK 86 and portrait. Imported attributes are
  ignored; duplicate special keepers collapse to the correct team identity. His
  slot stays locked through normalization, saves, results and rematches. The
  public roster and Auction capacity rules remain unchanged.
- **Simulation consistency:** Flow events previously generated during rendering
  could consume randomness. They now belong to the simulation tick. Saving and
  restoring retains subsequent seeded results. A substituted ball carrier hands
  the ball to the replacement. Turnovers and restarts clear stale assist credit;
  goal kicks/corners receive the correct restart zone and possession. Zone zero
  survives position resets. Unused reserves are explicitly benched.
- **Windows release checks:** path comparisons now use repository separators;
  `.gitattributes` preserves LF text. The clean baseline initially failed on CRLF
  and Windows path differences, not application source drift.
- **Nested-page cache coverage:** release fingerprints now resolve each page's
  `<base href>`. Previously, the Battle Sim script/stylesheet could be missed
  because their relative URLs were resolved from the nested file directory.
  A regression assertion requires the engine, both styles and bundle coverage.

## Presentation and localization

Setup now has a coherent squad dossier, explicit selection of every existing
formation, readable source controls, larger tactical boards, starters/reserves,
restrained chemistry lines and consistent spacing. Live play uses an anchored
score hierarchy, exact formation boards, distinct event borders, compact sequence
controls, stamina/Flow indicators and a prominent stoppage panel. The old abstract
zone grid is hidden; exact formations and the event feed carry the match view.
Results add a player-of-the-match callout, clearer statistics and ranked ratings.

New styles consume site palette tokens, including corrected light-theme contrast.
Reduced motion is honored. Arabic text reflows while pitch geometry remains LTR.
Battle Sim copy is integrated into the existing eleven-language catalog, with
structured event templates and protected player names. Source dialogue remains
unchanged in saved events; the UI uses event commentary instead of displaying
unverified dramatic quotations. English keeps the original detailed event prose.
Other languages use the corresponding localized event template and statistics.

## Performance measurements

Same local machine, Node 24; these timings are **not browser paint/network timings**.
`node scripts/benchmark-battle-sim.js` reproduces both comparisons against the
starting commit.

| Measurement | v0.7.4 | v0.8.0 |
| --- | ---: | ---: |
| Character module requests | 178 | 1 |
| Total application script requests | 222 | 47 |
| Mean character read/evaluate, 20 Node VM runs | 45.14 ms | 2.54 ms |
| Team-panel elements allocated across 200 ordinary live frames | 93,600 | 0 |
| Synthetic-DOM panel work across those frames | 204.73 ms | 190.13 ms |

The old report's 222 figure was **all scripts**, not character modules alone.
The generated bundle retains all 178 modules in original dependency/registration
order; individual files remain the editable source. Preflight rejects stale
generated output, compares every data record, and fingerprints both sources and
bundle. The live browser requests the one versioned bundle. Match panels retain
their player elements during ticks, rebuild only for lineup/control changes,
preserve expanded tactics, and avoid repeated per-event selector scans.

## Manga publication tracking: safe fallback is active

`APP_SUPPORTED_CHAPTER` remains **364**. No automation changes reviewed canon.
`data/latest-chapter.json` is independent of release fingerprints and contains
chapter/part, display label, optional date, official source, verification method,
timestamp and whether the global latest release was actually verified.

Official sources inspected on 5 November 2026:

- [Kodansha's Blue Lock chapter catalog](https://kodansha.us/series/blue-lock/chapters/)
  exposes available English chapters, including multipart entries and Chapter 364.
- [Kodansha's K MANGA explanation](https://kodansha.us/k-manga-chapters/) describes
  the selected-series catalog and its weekly/monthly updates. This does not prove
  the newest Japanese publication.
- The `s.kmanga.kodansha.com` endpoint returned 403 during investigation.
- A real Node run against the Kodansha catalog also returned 403 and preserved
  the stored record, confirming the need for the manual fallback.

There is currently no verified dependable programmatic global-latest source.
Accordingly, the homepage says **Verification pending**, **Last confirmed
publication: 364**, and **BL-Draft canon coverage: 364**, with an official link.
It does not present the highest catalog entry or a chapter count as global latest.

The daily workflow runs at 03:25 UTC and supports manual dispatch. Scheduled runs
fetch/parse the official catalog but retain stored data while global recency is
unconfirmed. A maintainer may supply a newest-chapter number/part, official source,
optional verified publication date, and an explicit verification attestation via
dispatch. This explicit manual mode records the maintainer's official-source
verification without requiring the machine scraper to bypass access restrictions;
it must not be used unless the maintainer has actually confirmed global recency.
Increases exceeding three chapters require another explicit check.
Only the chapter JSON is staged, committed and normally pushed. Concurrent source
changes are rebased; conflicts fail safely, with no force push. Source failures,
ambiguous responses in scheduled/check-only runs, and unchanged values, produce
no commit. Explicitly attested manual verification is the separate fallback. The workflow does
not bump the application version or modify normal CI/release fingerprints.

The deployed client reads the same public `main`-branch JSON through
`raw.githubusercontent.com`, falling back to the deployed Pages copy. This is
necessary because [GITHUB_TOKEN pushes do not trigger Pages builds](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
Chapter updates therefore do not require a new app release or Pages deployment.
GitHub's raw-content CDN can introduce a short propagation delay. Both requests
use `cache: no-store`; the client validates data, retains a last-good browser
record and rejects older cached data. The service worker caches only
images/fonts, so it cannot pin chapter JSON. Unknown publication dates stay null;
parts use integers and whole chapters supersede their numbered parts. Invalid,
future-dated, decreasing and suspicious values are rejected.

## Validation

- `node scripts/sync-shells.js --check`
- `node scripts/set-version.js --check`
- `node scripts/preflight.js` (existing Auction/Builder, Draft Duel, Daily,
  Tactical, Challenge Lab, Ego Board/Record, Database and secret-roster suites)
- `node scripts/battle-sim-tests.js`: actual Auction handoff, canonical keeper
  attributes/locks/saves, every formation/orientation, sent-off chemistry,
  progression guards, timer cancellation, malformed imports, substitute possession,
  24 complete seeded save/restore continuations, all 178 bundled source records.
- `node scripts/chapter-tracker-tests.js`: schema, newer/unchanged/older/future
  values, multipart ordering, malformed/unavailable sources, jump rejection,
  non-writing fallback, UI labels, separate canon coverage and workflow scope.
- Localization: zero uncovered source strings, zero integrity errors/warnings.
- `git diff --check` and review of protected source data.

Browser verification used the in-app Chromium browser and the real local site:

- Setup, live and results at 320×640, 390×844, 430×932, 932×430, 1024×768, 1280×720,
  1440×900 and 1920×1080: no horizontal overflow or broken match images;
  actual SVG endpoints compared with rendered marker centers.
- Every setup formation at 320 px in Arabic/light: no marker overlaps, clipping
  or endpoint drift after fixing the collapsed pitch/close midfield rows.
- Every live formation, both orientations, at 1440 px in Arabic/light: no marker
  overlaps, clipping or endpoint drift.
- All eleven setup languages switched through real settings; translated headings
  and controls appeared without overflow. English/dark and Arabic/light setup,
  live feed and results visually inspected.
- Actual Auction-handoff function invoked with two canonical special keepers;
  both portraits appeared in goal, results included both, and rematch kept both.
- Proceed disabled immediately on activation; feed count/readiness agreed at the
  next stoppage. Paused-match reload, feed speed, fast-forward, full results,
  rematch, chapter labels and console-error inspection performed.

## Limits

- Global latest-chapter verification currently requires a maintainer. The daily
  check deliberately does not infer Japanese recency from the English catalog.
- Real devices, Safari/Firefox, hardware touch dragging and screen-reader testing
  were not performed. Browser paint/real-network performance was not benchmarked.
- Pre-existing application modes keep their automated regression coverage; this
  release's interactive browser effort focused on Battle Sim and chapter status.
- GitHub Pages remains a separate deployment from Preflight. Repository branch
  protection was not changed. Remote CI/deployment status must be checked after
  the push; a local passing gate alone is not deployment confirmation.
