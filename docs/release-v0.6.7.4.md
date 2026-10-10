# Blue Lock Draft — V0.6.7.4 Alpha

Corrected against the latest `origin/main` fetched for this task: `d288ceb`.
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
- Corrected the OVR layout target: the change applies to the current player profile
  in the Auction Room only. Its OVR, grade, and primary position now live inside
  Attribute Analysis instead of covering the portrait, and the auction portrait is
  slightly larger while the overall command card footprint stays bounded.
- Restored the Team Builder player profile and dedicated character dossier OVR
  layouts to their pre-v0.6.7.4 behavior; those screens were not the requested target.
- Corrected character-ID validation so direct profile links, refreshes, legacy
  URLs, and Back/Forward retain the selected character.
- Restored narrow-screen navigation and Light-mode logos on legal/privacy pages.
- Fixed compact share-token overlaps and clipped goalkeeper names across all ten
  formations. Desktop pitch heights remain 250px for two-team results and 330px
  for standalone reports; both desktop reports fit within a 1366×768 frame.
  Mobile reports stack cleanly. Standalone Print uses the same safe 330px pitch.
- Removed obsolete character-card CSS, the obsolete Auction portrait OVR overlay rule, and
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

Validation for this corrected archive:

- `node scripts/preflight.js`: PASS, 0 failed checks.
- `node --check` completed successfully for every project JavaScript file.
- Final literal merge-conflict-marker scan is clean.
- Browser automation could not be rerun for this correction because this sandbox
  blocks local/file navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; no browser
  testing is claimed for the corrected Auction-only layout.

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
js/ui/auction-ui.js
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
