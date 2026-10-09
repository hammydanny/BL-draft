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
| Changelog | planned; no active link | `changelog/` |

A later URL migration must provide compatibility redirects, preserve saved-phase
Resume and browser history, and test GitHub Pages without a catch-all server.
Header Quick Draft opens a compact name/color/size setup, validates the saved pool and calls the existing `startRandomDraft()` function. Full Setup keeps its Random Draft action. Lore's three views share one document.

## Later release requirements

- **V0.6.8:** full homepage and artistic theme polish, beyond this foundation.
- **V0.6.9:** player database overhaul. Optional short player quotes must be real
  canon lines, independently verified, not simply the Wiki featured quote, invented
  dialogue, AI paraphrases or another player's line. Store source/chapter internally;
  show **only the quote**, without name, chapter or source label. Omit unverifiable quotes.
- **V0.6.9.5:** dedicated mobile website overhaul, including deeper gameplay layouts
  and a possible settings bottom sheet. Current mobile navigation is the foundation.
- **Later release hardening:** image credits/rights review and proper legal/privacy
  documents. Disabled footer labels must not pretend those pages already exist.

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
Full Light Mode artistic polish remains scheduled for V0.6.8.
