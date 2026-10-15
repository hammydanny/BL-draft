# Development and releases

`main` is the stable, public GitHub Pages branch. Build and test releases in a
local checkout or development/release branch before merging reviewed work into
`main`. Experimental changes should not become public deployments immediately.
Nothing in this workflow automatically pushes, merges, or changes repository settings.

1. Capture the current local source, including uncommitted work.
2. Implement one scoped release and preserve the game/save contracts.
3. Run `node scripts/preflight.js`, then the browser checks in
   [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).
4. Review every diff and the changed-files ZIP against that starting source.
5. Publish/merge only after explicit release authorization.

## Website foundation

The identical static header/footer across seven destinations (13 canonical and
compatibility documents) renders without
fetching a separate HTML fragment. `css/site-header.css` owns shell geometry,
navigation, settings, context strips and footer. `css/fonts.css` owns the early self-hosted font declarations. `css/site-theme.css` owns semantic
palette/layout tokens; existing component rules consume them.

`js/site-preferences.js` is the **only synchronous head script**. It applies the
stored/resolved site theme before CSS can paint. The transparent favicon follows the browser/OS color preference independently. All application scripts
remain classic/deferred, with `js/app.js` last. Styles and deferred script
requests precede font preloads in the head, so slow fonts cannot monopolize
HTTP/1 connections before the bootstrap arrives. `SitePreferences.syncAssets()` runs
before the existing app-initializing gate is lifted, so the themed logo is correct
when content appears. Dark is the default; System listens to OS color changes.

`blSitePreferencesV1` stores `{ theme, sfxEnabled }` and retains unknown future
fields. Existing `blAuctionSound` preferences are imported and mirrored. Settings
and the global SFX control use this one store. Reset Preferences resets sound/theme;
it does not clear `blAuctionSaveV2` or `blStandaloneBuilderV1`.

The light SVG logo embeds the existing header artwork with identical dimensions,
alpha and geometry; its white ink is recolored navy. Theme-specific tab assets use the same lettering on transparency; their choice follows browser/OS color scheme, independently from the site theme. No new character/brand art is used.

`js/player-images.js` is the player image boundary. `playerImageSource(player)`
returns URL, fallback, optional credit/reference and rights status. Local `image`
works unchanged; a future explicitly approved `imageSource.url` can override it.
Metadata is architectural support, **not a rights clearance**. Do not bulk-hotlink
images as a copyright workaround. One capture listener supplies a neutral inline
SVG fallback without retrying, altering card dimensions or hiding player data.
The chosen auction target and saved squads are warmed conservatively; visible
portraits receive priority and off-screen grids use a bounded background queue.

The service worker caches only same-origin images/fonts within the deployed app
scope. It matches full URLs (including versions), revalidates cached assets and
removes cached 404/410 responses. A new cache version removes older `bld-static-`
caches. HTML/JS/CSS are never returned from its cache. App updates are not forced
to reload an active game. Keep the worker cache version and HTML asset query
versions aligned with the central release; inspect this during deployment.

## Route plan

**Current runtime source of truth:** `APP_ROUTE_PATHS` and `canonicalRouteUrl()` in
`js/router.js`. Keep these canonical directory URLs and their legacy compatibility entries. Resolve
all links against `appRootUrl()` so root hosting and `/BL-draft/` both work.

The following is the future migration plan, not additional live URLs:

| Destination | Current compatible destination | Future canonical destination |
| --- | --- | --- |
| Home | `/` or `index.html` | `/` |
| Play | `auction/setup/` | `play/` |
| Auction Draft | `auction/setup/`, `auction/room/` | `play/auction/` |
| Quick Draft | header mini setup → `auction/results/` | `play/?mode=quick` |
| Results | `auction/results/` | under `play/auction/` |
| Auction Builder | `auction/team-builder/` | under `play/auction/` |
| Standalone Builder | `team-builder/` | `team-builder/` |
| Database / Lore | `lore/` | `database/` |
| Characters | `lore/?view=characters` | `database/characters/` |
| Chemistry | `lore/?view=chemistry` | `database/chemistry/` |
| How to Play | existing shared modal | `how-to-play/` |
| About | existing shared modal | `about/` |
| Changelog | `changelog/` | already implemented |

A later URL migration must provide compatibility redirects, preserve saved-phase
Resume and browser history, and test GitHub Pages without a catch-all server.
Header Quick Draft opens a compact name/color/size setup, validates the saved pool and calls the existing `startRandomDraft()` function. Full Setup keeps its Random Draft action. Lore's three views share one document.

## Later release requirements

- **V0.6.8:** delivered the Homepage/discovery, shared theme polish and project-information release.
- **V0.6.9:** delivered player intelligence, ID-based reference adapters, comparison, exact chemistry evaluation and integrity validation.
- **V0.6.9.1:** expands reference data and dossier navigation. Optional short player quotes must be real
  canon lines, independently verified, not simply the Wiki featured quote, invented
  dialogue, AI paraphrases or another player's line. Keep verification references
  internally and display the character name and compact chapter/episode label.
  Omit unverifiable quotes.
- **V0.6.9.5:** dedicated mobile website overhaul, including deeper gameplay layouts
  and a possible settings bottom sheet. Current mobile navigation is the foundation.
- **Later release hardening:** continue image credits/rights review. The v0.6.8 Legal/Privacy notices describe current behavior; they do not establish rights clearance or legal compliance.

## V0.6.7.2 readability and loading

Component typography uses at least 12px secondary labels, larger controls/names,
and the existing heading hierarchy. Radar labels account for SVG scaling. Pitch
OVR uses `effectiveOVR`; the profile badge shows deployment position or primary
reserve position. Standalone pool and reserves share `compareStandalonePlayers`.
The 200ms pool reveal preserves its live DOM and respects reduced motion.

Directory `index.html` pages are canonical; legacy `.html` documents normalize
to them before showing content. Update both sets when changing shared markup.

All routes preload the same seven critical self-hosted WOFF2 files. A bounded
450ms font wait followed by at most 180ms for visible portraits avoids normal
first-paint swaps without long blank loads on slow/offline connections. Visible
rows are rechecked after font metrics settle. Visible portraits receive priority; clipped
grids defer their real sources until near view, using a two-load background
queue. Squad warming is bounded to 30 images with three workers; decoded image
references are retained in a 64-entry document cache. Cold network bytes remain
unavoidable; branded placeholders preserve every portrait frame meanwhile.
V0.6.8 adds the shared Dark/Light polish while retaining this theme architecture.


## V0.6.8 website experience

`css/homepage.css` owns the landing page. `js/ui/homepage.js` reads existing
players, grades, image URLs, chemistry and normalized saves; it never draws a
player or writes a save. The Scouting Desk searches real players, opens dossiers
and evaluates chemistry through the existing shared helper.
The tactical preview reads the existing formation without altering it.

`js/ui/site-information.js` owns the one shared About/How to Play modal and its
focus/background handling. Information pages load this same modal and directory,
plus audio/preferences, without loading the game database or game-state modules.
Their header buttons resolve the existing `data-directory-href` destinations.
Gameplay pages continue using the existing router and guarded destination loads.

`js/site-runtime.js` applies centralized release/chapter labels and registers the
scope-safe image/font worker on both kinds of page. `js/app.js` still loads last
on game documents and owns only game bootstrap. No save keys/schemas changed.

Changelog summaries are based on the existing release notes and repository
snapshots, including the recorded V0.5 page and the V0.6.7.4 stabilization notes.
Do not add dates or historical claims without an identifiable source.

## V0.6.8.2 reliability and UX

The Scouting Desk reads the existing player and chemistry helpers. Portraits share one script-root URL resolver, bounded request/decode queue and identity-safe DOM binding in `js/player-images.js`; keep new player imagery behind `data-player-image` / `data-portrait-src`. Visible work takes priority over bounded squad warming. Failed requests retry once, and detached UI releases pending work.

Builder selection updates the profile and hints without recreating the pitch or reserve list. Roster changes retain the Global Player Pool DOM and restore internal scroll. Slot hints use one `.slot-target-label`: an active swap takes priority over positional fit. The pointer engine, formation geometry and lineup scoring remain unchanged.

Reports use a shared portrait / position / Captain frame. Desktop keeps the two-team screenshot layout; narrow screens stack with taller pitches. Cache-busting references and the images/fonts worker namespace follow the central release version.

## V0.6.9 reference data

`js/players.js` remains the authority for identity, ratings, attributes, gameplay
positions and existing weapons. `js/player-reference.js` adds the ID-keyed
profiles, explicit demonstrated-role notes, quote verification boundary and shared
category registry. `PLAYER_RECORDS` references the original player object rather
than copying its ratings. Auction category keys, labels and members are unchanged;
the registry now loads once before both Database and Setup.

Chemistry reference adapters resolve existing name-based tuples and team histories
to stable player IDs once. The gameplay chemistry records and calculations remain
unchanged. Team-context baselines are distinguished from exact pair evaluation.
Affiliation/history describes recorded membership, not a claim of a current club.
No nationality filter is exposed without a reliable nationality registry.

`PLAYER_REFERENCE_SCHEMA_VERSION` identifies the reference format. Existing
Auction/Standalone schema constants, storage keys and normalizers are retained.
No save writes or migration occur in the Database. Ratings are project values;
gameplay positions and demonstrated canon roles are separate classifications.

`PLAYER_QUOTES` holds only independently checked short dialogue. An entry needs
player ID, exact text, `verified: true`, manga/anime source type, a positive numeric
chapter/episode, an HTTPS source reference and a verification note. Unverified,
empty, missing-source and unknown-player quotes fail validation and are never
shown. The dossier uses a semantic blockquote with character attribution and a
compact chapter/episode label; URLs and verification notes remain internal.

`node scripts/preflight.js` uses `scripts/data-validation.js` to reject invalid
players, images, positions, categories, profiles, chemistry references, duplicate
or reversed pairs, malformed explanations, unverified quotes and changed formation
coordinates. The formation fingerprint is pinned to latest-main commit
`2fb9dfdd09330f3fb91f061466e6feeaa743b33f` for V0.6.9.1; its geometry is identical to
the V0.6.9 baseline. Pitch sizing remains CSS only.

Directory cards reuse DOM nodes and decoded images. Search is debounced; sort
orders and relationship indexes are cached. Compare accepts up to three players,
uses the same six-axis radar and grade helper, and stays in page memory.

## V0.6.9.1 character intelligence

All 79 player records were audited. Weapons keep the existing `id`, `name`,
`description`, `battleSimType` and `battleSimDescription` structure. Source
metadata records type, URL and a note; omit chapter numbers unless independently
confirmed. Empty weapon arrays are valid. Preserve Isagi's existing seven entries
and leave all Battle Sim fields as the existing safe placeholders.

`nationality` is either null or a single object with ISO country code, country
name, evidence basis and source metadata. National-team representation is valid
evidence; clubs, names and appearance are not. England uses ISO parent code `GB`,
name `United Kingdom` and explicit representation `England`. `PLAYER_COUNTRIES`
maps that representation to the St George flag and visible England label.
Unknown records have no nationality row. `playerNationalityMarkup()` renders the
same accessible country text and 24 x 16 flag between name and positions in the
dossier and both builders' selected-player profiles, never on pitch tokens.

The nine required local SVGs come from MIT-licensed `lipis/flag-icons`; retain
`images/flags/LICENSE-flag-icons.txt` and the accompanying source README. Flag
requests use the central asset version, browser caching and the existing
image/font service worker. No flag dependency or third-party hotlink is needed.

Dossier section anchors use a 300ms animation with one computed header-safe
destination and no history writes. Reduced-motion users jump immediately.
Wheel, touch and keyboard input cancel an active animation. One
IntersectionObserver marks the visible section using `aria-current` and an
underline; profile replacement and leaving the dossier disconnect it.

The builder pitch uses `clamp(650px,69vh,740px)` on desktop and
`clamp(690px,82vh,740px)` on narrow screens. Tighter internal slot spacing and
single-line ellipsis names retain the original coordinates. Full names remain
available through title text and the selected profile. The Captain badge stays
within the portrait's vertical band, clear of the position label. Formation
feedback, chemistry geometry, selection and dragging keep their existing logic.

Validation accepts absent optional reference data, but rejects duplicate or empty
weapons, invalid source metadata, unsupported country codes, missing local flags,
unverified or malformed quotes and duplicated quote text. See
[the player audit](docs/player-audit-v0.6.9.1.md) for factual coverage and
[the release report](docs/release-v0.6.9.1.md) for validation and the file manifest.

## Mandatory localization release gate

Localization is a prerequisite for **every future update**, including small fixes.

Before an update is considered complete:

- Every new or changed user-visible string must be translated into every supported display language: Malay, Japanese, Arabic, Simplified Chinese, French, German, Korean, Portuguese, Russian and Spanish.
- This includes button text, headings, helper text, validation/errors, dynamically generated UI, placeholders, titles, accessible labels/descriptions and Changelog notes.
- Proper names, Blue Lock branding, formation codes, OVR/stat abbreviations and canon quotes stay unchanged where the localization policy already treats them as language-neutral or source-exact.
- New release-specific UI copy must be added to the fully populated `releaseGateOverrides` catalog in `js/localization.js` (or to the main message catalog when appropriate).
- Dynamic DOM inserted after load must be passed through `SiteI18n.apply(...)` when immediate localization is needed.
- `node js/preflight.js` must pass the localization release-gate check before commit/push/release.
- `node scripts/localization-coverage.js` must report **0 uncovered source strings** across canonical pages and dynamic UI hotspots.
- `node scripts/preflight.js` runs both translation-integrity and source-coverage checks; both are release blockers.
- The Changelog must describe the update and that new note must also be localized.

An update that introduces untranslated visible UI or accessibility copy is **not complete**.

