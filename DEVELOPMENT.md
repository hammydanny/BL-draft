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

The identical static header/footer in the seven route documents renders without
fetching a separate HTML fragment. `css/site-header.css` owns shell geometry,
navigation, settings, context strips and footer. `css/site-theme.css` owns semantic
palette/layout tokens; existing component rules consume them.

`js/site-preferences.js` is the **only synchronous head script**. It applies the
stored/resolved theme and favicon before CSS can paint. All application scripts
remain classic/deferred, with `js/app.js` last. `SitePreferences.syncAssets()` runs
before the existing app-initializing gate is lifted, so the themed logo is correct
when content appears. Dark is the default; System listens to OS color changes.

`blSitePreferencesV1` stores `{ theme, sfxEnabled }` and retains unknown future
fields. Existing `blAuctionSound` preferences are imported and mirrored. Settings
and the global SFX control use this one store. Reset Preferences resets sound/theme;
it does not clear `blAuctionSaveV2` or `blStandaloneBuilderV1`.

The light SVG logo embeds the existing header artwork with identical dimensions,
alpha and geometry; its white ink is recolored navy. Theme-specific tab assets use
a tight high-contrast tile of the same artwork. No new character/brand art is used.

`js/player-images.js` is the player image boundary. `playerImageSource(player)`
returns URL, fallback, optional credit/reference and rights status. Local `image`
works unchanged; a future explicitly approved `imageSource.url` can override it.
Metadata is architectural support, **not a rights clearance**. Do not bulk-hotlink
images as a copyright workaround. One capture listener supplies a neutral inline
SVG fallback without retrying, altering card dimensions or hiding player data.
Only the chosen auction target is warmed; off-screen grids remain lazy.

The service worker caches only same-origin images/fonts within the deployed app
scope. It matches full URLs (including versions), revalidates cached assets and
removes cached 404/410 responses. A new cache version removes older `bld-static-`
caches. HTML/JS/CSS are never returned from its cache. App updates are not forced
to reload an active game. Keep the worker cache version and HTML asset query
versions aligned with the central release; inspect this during deployment.

## Route plan

**Current runtime source of truth:** `APP_ROUTE_PATHS` and `canonicalRouteUrl()` in
`js/router.js`. Keep these multi-page URLs during the foundation release. Resolve
all links against `appRootUrl()` so root hosting and `/BL-draft/` both work.

The following is the future migration plan, not additional live URLs:

| Destination | Current compatible destination | Future canonical destination |
| --- | --- | --- |
| Home | `/` or `index.html` | `/` |
| Play | `auction/setup.html` | `play/` |
| Auction Draft | `auction/setup.html`, `auction/room.html` | `play/auction/` |
| Quick Draft | `auction/setup.html?draft=quick` | `play/?mode=quick` |
| Results | `auction/results.html` | under `play/auction/` |
| Auction Builder | `auction/team-builder.html` | under `play/auction/` |
| Standalone Builder | `team-builder.html` | `team-builder/` |
| Database / Lore | `lore.html` | `database/` |
| Characters | `lore.html?view=characters` | `database/characters/` |
| Chemistry | `lore.html?view=chemistry` | `database/chemistry/` |
| How to Play | existing shared modal | `how-to-play/` |
| About | existing shared modal | `about/` |
| Changelog | planned; no active link | `changelog/` |

A later URL migration must provide compatibility redirects, preserve saved-phase
Resume and browser history, and test GitHub Pages without a catch-all server.
Quick Draft currently opens the existing Random Draft settings/action; it does
not introduce a second drafting algorithm. Lore's three views share one document.

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
