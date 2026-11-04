# V0.7.4 — Foundation Lock

## Purpose

A stabilisation release before v0.8. No new modes and no gameplay or player-data
changes. The goal was to make the existing foundation harder to break: cached assets,
release checks, cross-mode consistency, save robustness, layout, localization and
accessibility.

## Baseline

- `main` at `5dbd6d5` ("Update Jon secret portrait and explicit-push policy"), version
  0.7.3.2 ALPHA, `APP_SUPPORTED_CHAPTER` 364.
- Baseline checks on that commit: `sync-shells --check` 0 drift, `set-version --check`
  0 stale, `node scripts/preflight.js` exit 0 (every suite PASS).
- Recent collaborator work preserved: Oka portrait and secret-ID fix (`d023ce1`,
  `489444f`), Jon white portrait and explicit-push policy (`5dbd6d5`).

## Problems found

1. **Jon's portrait could stay stale for returning players.** `js/players/jon/player.js`
   changed after 0.7.3.2 shipped, but every character module still loaded as
   `?v=0.7.3.2`, so a browser that cached the old module kept the old image path. The
   version tooling checked that references were *consistent*, not that cached content
   had changed without a bump.
2. **Team Builder on phones in landscape (600–1024 px wide, ≤500 px tall):** the action row
   sat in the narrow side column as one non-wrapping row, squeezing "AUTO BEST TEAM" into a
   one-letter column and pushing "More actions" 20 px off-screen (horizontal scroll).
3. **"↗ TEAM REPORT" was English in every language.** The catalog had "TEAM REPORT", but the
   decorative arrow prevented the lookup.
4. **Keyboard focus was invisible** on the Auction player-pool filters (`.pool-filter-grid
   select{outline:none}` outranked the global focus ring). The player search had no
   accessible name (placeholder only).
5. **Light-theme contrast:** pitch position labels used the raw team colour (2.47:1); the light
   accent (#0072c9) was 4.39:1 on the page background; the Daily amber was 3.76:1 and white
   on it 4.23:1; success green 4.47:1.
6. **Draft Duel never said how the winner is decided** outside a collapsed rules panel; players
   could expect a simulated match.
7. **Ego Record would accept Blue Lock Man's IDs** (9101/9102) as favourite players if they ever
   reached it (defensive; no current mode sends them).
8. **No automated CI** and no automated check that every asset reference resolves.

## Changes

- **Release fingerprint** (`scripts/set-version.js`, `scripts/release-manifest.json`): SHA-256
  of every cached file (versioned scripts/stylesheets, all character modules, images, fonts,
  assets). `--check` and preflight fail when one changes without a version bump. New
  `--stamp` for unreleased versions only. Version bumped to **0.7.4** with the existing tool
  (all `?v=`, character loader, service-worker cache name, manifest).
- Preflight no longer hardcodes the version literal; it checks the format and the tool's value.
- **Jon/Oka regression check**: Jon uses `images/jon-white.webp`, Oka `images/oka.jpg`, both
  exist, are fingerprinted and load with the current version.
- **Asset integrity check** in `js/preflight.js`: every local `src`/`href`/`content` in every
  page (respecting `<base href>`), every CSS `url()` and every `images/…` literal in scripts
  must resolve to a file.
- **GitHub Actions** `.github/workflows/preflight.yml`: PRs to `main`, pushes to `main`, manual
  dispatch; `contents: read`, no secrets, `persist-credentials: false`, official actions
  pinned to commit SHAs (checkout v4.2.2, setup-node v4.4.0), Node LTS, concurrency group.
- **`scripts/v074-tests.js`** (added to preflight): roster partition and unique IDs from data;
  Blue Lock Man and aliases never inflate totals; base OVR and chemistry are pure/symmetric;
  18 random squads give identical OVR, chemistry and exact lineup in Draft Duel, Team Builder
  and share snapshots, independent of signing order; every storage reader survives malformed
  JSON, hostile shapes, `__proto__` keys and blocked storage without erasing unrelated saves;
  Ego Record never counts Blue Lock Man; every character folder is loaded and fingerprinted;
  workflow safety properties.
- Landscape Team Builder actions use a two-column grid (Auto Best full width).
- `text()` translates a label behind a leading decorative icon (arrows, symbols), with a
  preflight test across all ten languages.
- Focus ring restored on pool/database filters; `aria-label` on the player search (existing
  translated string).
- Light theme: `--accent` #006bbd, `--success` #067344, Daily amber #94630a, pitch labels use
  the shared team-heading mix. Dark theme unchanged.
- Draft Duel shows one translated line: no match is played; best formations compared on
  Effective OVR, chemistry settles close calls (matches `duelResult`).
- Ego Record ignores Blue Lock Man IDs when normalising, tracking and listing favourites.
- Docs: `RELEASE_CHECKLIST.md` rewritten (automated vs manual, every v0.7.3 system),
  `DEVELOPMENT.md` (fingerprint, CI, deployment), `README.md` (checks, `/BL-draft/` local
  path), `CLAUDE.md` and `AGENTS.md` (version-bump rule). Changelog V0.7.4 in all languages.

## Decisions

- **Content fingerprint instead of per-file hashes in URLs.** Keeps the established single
  `?v=` version, no build step, no random cache keys. The cost is that every cached-file
  edit needs a bump, which is exactly the rule that was missed.
- **Pages deploy is not gated.** Pages uses GitHub's branch deployment, which does not wait for
  Actions. Making Preflight blocking needs branch protection/rulesets on `main` — a settings
  change for the repository owner, recommended, not made.
- **Battle Sim localization deferred.** Battle Sim (Early Access) is still English in every
  language. Translating it is a larger, separate task; its routes and handoff were verified only.
- **Chemistry palette untouched.** The light "CHEMICAL" tier label is 4.36:1 at 12 px bold; its
  colour is shared with chemistry link geometry, so it was left as is.

## Preserved

No changes to player data, ratings, positions, chemistry values, quotes, images (other than
cache version), secret metadata, Blue Lock Man stats, formation definitions, Auto Best
scoring, CPU logic, Daily/Tactical generation, codes or save schemas. No storage keys were
added, renamed or cleared. Explicit-push policy unchanged.

## Tests run

- `node scripts/sync-shells.js --check` — 0 drift.
- `node scripts/set-version.js --check` — 0 stale, 0 unreleased changes for 0.7.4. Verified it
  fails when `js/players/jon/player.js` is edited without a bump, and that re-running the
  tool for the same version does not hide the edit.
- `node scripts/preflight.js` — exit 0; every suite PASS, including the new v0.7.4 suite.
- `node scripts/v074-tests.js` — 4 PASS groups.

## Browser verification (Playwright/Chromium, local server at `/BL-draft/`)

- **Route sweep**: 16 routes × 8 viewports (320×640, 390×844, 430×932, 932×430, 1024×768,
  1280×720, 1440×900, 1920×1080) in English/dark; 6 routes × 4 viewports × 5 languages
  (de, ru, fr, ms, ar) in light; 8 routes × 3 viewports × 6 languages in system theme.
  392 page loads checked for page errors, console errors, failed requests, broken images,
  horizontal overflow and off-screen header controls. Only issue found: problem 2 above,
  fixed and re-verified.
- **Runtime localization scan** in Arabic and Japanese over home, all play views, Auction setup,
  Team Builder (incl. More actions), Database, dossier, settings, Daily brief/picks, Duel draft
  and result, changelog and legal pages. Remaining Latin text: brand, player and canon team
  names (SIDE-B), credits — and Battle Sim.
- **Keyboard**: 40 Tab stops on five screens with visible focus; settings dialog opens with
  Enter, traps focus, closes with Escape and returns focus to its button.
- **Contrast scan** (WCAG AA) of visible text on seven screens in both themes.
- **Back/Forward and reload** across home, Ego Board and Team Builder.
- **Secret gate**: no secret names before the code; after unlocking, Jon (`jon-white.webp`) and
  Oka (`oka.jpg`) load with `?v=0.7.4`.
- Screenshots inspected: Team Builder landscape (en/ar, More actions open), light pitch,
  German Ego Board at 1280, Arabic Draft Duel at 390.

Not performed: real devices, Safari/Firefox, touch dragging on hardware, screen readers.

## Performance (measured locally, Chromium, localhost)

- DOMContentLoaded 0.55–0.67 s on home, Ego Board, Team Builder and Database; ~1,100–1,800
  DOM nodes; ~246–250 requests per cold load, 222 of them scripts (two per character module).
- Auto Best on a 15-player squad: 0.67–0.86 s until its loader clears (desktop and phone
  viewport). Node, all 10 formations: 0.63–0.71 s (11 players), 1.3–1.5 s (15), 1.5–1.7 s (20).
- Daily rule 0.2 ms/date, Daily Tactical 9.7 ms/date, Draft Duel final evaluation 207 ms.
- No performance-related code changed in this release.

## Known limitations

- Pages deploys `main` even when Preflight fails until branch protection is enabled.
- Battle Sim is English-only.
- The light "CHEMICAL" label is slightly under AA (4.36:1).
- Localhost timings exclude network latency; GitHub Pages will be slower on a cold visit.

## Recommendations for v0.8

1. Enable branch protection on `main` requiring the Preflight check.
2. Bundle character modules (222 requests → a handful) through a generated, versioned file
   while keeping per-character sources.
3. Localize Battle Sim before it leaves Early Access.
4. Run Auto Best off the main thread or cache per-formation results across the search.
5. Add a small cross-browser smoke run (Firefox/WebKit) to CI.
