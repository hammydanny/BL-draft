# Blue Lock Draft — V0.6.7.4 Alpha

Based on the latest `origin/main` fetched for this task: `722fa85`.
This archive contains the complete working project with repository-relative paths.
No changes were committed, pushed, or submitted as a pull request.

## Stabilization changes

- Resolved 17 conflict blocks across 15 HTML documents. Both sides had identical
  functionality and differed only in asset versions. All page content, including
  Syaafi's header, character directory, dedicated dossiers, legal/privacy pages,
  and developer links, was retained. Each document now has one favicon and one
  declaration per script, stylesheet, and font preload.
- Restored favicon declarations to the document head, eliminating the conflict
  text that prematurely ended the head and the resulting duplicate-script errors.
  Icons still follow the browser/OS preference independently of the site theme.
- Centered Auction navigation text and its arrow using the existing header
  system. Auction and Database controls reserve enough room for their arrows;
  keyboard focus, dropdown behavior, and responsive navigation remain intact.
- Moved Builder profile OVR, its grade, and deployment position into Attribute
  Analysis. The portrait is wider, while the profile panel height and its internal
  scroll height remain unchanged at the representative laptop viewport.
- Moved dedicated character dossier OVR into the attributes heading. Its portrait
  is wider without increasing the hero panel height. All seven individual field/GK
  values and grades, the radar, descriptions, positions, and chemistry remain.
- Corrected character-ID validation so direct profile links, refreshes, legacy
  URLs, and Back/Forward retain the selected character.
- Restored narrow-screen navigation and Light-mode logos on legal/privacy pages.
- Fixed compact share-token overlaps and clipped goalkeeper names across all ten
  formations. Desktop pitch heights remain 250px for two-team results and 330px
  for standalone reports; both desktop reports fit within a 1366×768 frame.
  Mobile reports stack cleanly. Standalone Print uses the same safe 330px pitch.
- Removed obsolete character-card CSS, superseded portrait-overlay rules, and
  duplicate declarations. Newly introduced profile labels retain the existing
  12px readability floor. Chemistry comment separators were normalized so literal
  conflict-marker searches return zero matches; its data and functions are unchanged.
- Updated the central version, document asset versions, and static cache namespace.
  Added preflight guards for merge artifacts, duplicate head assets, and profile URLs.

## Preservation and verification

Player data, formation definitions and coordinates, chemistry data/functions,
Auction mechanics, Auto Best search/weights, saves, dragging, Captain behavior,
Random/Quick Draft, sharing snapshots, and the page-transition guard are preserved.
The gameplay/data modules were compared with the fetched source; chemistry differs
only in two decorative comment lines. Every HTML document's page content matches
latest main after resolving equivalent conflicts and updating asset versions.

Validation performed with Chromium and Playwright:

- 147 page/state cases and 36 utility-modal cases across 1920px, 1366px, 1024px,
  and 390px widths in Dark, Light, and System themes.
- All 79 dossiers: numerical stats, letter grades, GK, and chemistry entries.
- Canonical and legacy pages at both root hosting and `/BL-draft/`; favicon loads,
  profile reload/history, and navigation without a Main Menu flash.
- Opening bid, bid/pass, Undo/Redo, next player, Quick Draft, reserves, Captain,
  and Auto Best visiting every formation.
- Desktop mouse and 390px touch dragging, swaps, edge scrolling, and cleanup.
- Exact chemistry-line endpoints for all ten formations.
- 80 standalone share layouts and 40 two-team share layouts with no token
  collisions or clipping; copy/close/print controls and all ten Print formations.
- Real service-worker activation, root/subdirectory scope, versioned asset caching,
  obsolete cache purge, and fresh HTML/CSS/JavaScript after deployment changes.
- Zero unexpected runtime errors, missing assets, or horizontal page overflow.
- `node scripts/preflight.js`: PASS, 0 failed checks; syntax checked for all 26
  project JavaScript files. Final diff and literal conflict-marker scans are clean.

## Changed files

```text
auction/results.html
auction/results/index.html
auction/room.html
auction/room/index.html
auction/setup.html
auction/setup/index.html
auction/team-builder.html
auction/team-builder/index.html
css/character-lore.css
css/legal.css
css/player-stats.css
css/site-header.css
index.html
js/chemistry.js (comments only)
js/lore.js
js/preflight.js
js/router.js
js/site-preferences.js
js/ui/formation-ui.js
js/ui/player-stats.js
js/version.js
legal/index.html
lore.html
lore/index.html
privacy/index.html
service-worker.js
style.css
team-builder.html
team-builder/index.html
docs/release-v0.6.7.4.md (new)
```
