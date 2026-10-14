# V0.6.9.1 Alpha release report

Character intelligence and dossier UX patch. All 79 players were audited; 66 have football weapons, 5 have selected verified short quotes and 78 have known nationality or representation. Gameplay and the latest-main Syaafi work are preserved.

[Full player-by-player factual audit](player-audit-v0.6.9.1.md).

## Required final report

| # | Item | Result |
| ---: | --- | --- |
| 1 | Exact latest-main commit used | `2fb9dfdd09330f3fb91f061466e6feeaa743b33f` (Add player reference metadata and validation script), fetched before editing. Work is in an isolated detached local worktree. |
| 2 | Total players audited | 79; all have an individual row in the linked player audit. |
| 3 | Players with weapon data | 66 players, 108 weapon records. |
| 4 | Players intentionally without weapons | 13: Ryosuke Kira; Hibiki Okawa; Gen Fukaku; Itsuki Wakatsuki; Haru Hayate; Kento Cho; Teru Kitsunezato; Rooke; Childs; Hajime Nishioka; Shizuka Haiji; Taiga Tsunzaki; Hermes. |
| 5 | Weapon data structure | Existing `{ id, name, description, battleSimType, battleSimDescription }`, extended with `{ source: { type, url, note } }`. No guessed chapter numbers. |
| 6 | Existing Syaafi weapon data | Isagi’s original seven IDs, names, descriptions and Battle Sim placeholders are preserved exactly; only internal source metadata was added. |
| 7 | Players with verified canon quotes | 5: Yoichi Isagi, Rensuke Kunigami, Asahi Naruhaya, Okuhito Iemon and Seishiro Nagi. |
| 8 | Players without selected verified quotes | 74. Missing quotes are valid and their optional quote section is hidden. |
| 9 | Quote verification structure | `playerId`, exact short `text`, boolean `verified: true`, `sourceType`, positive numeric `episode` or `chapter`, timestamp, HTTPS `sourceReference`, `sourceNote` and optional corroboration. Dossiers require the verification boundary to pass. |
| 10 | No invented quotes | No invented dialogue, paraphrased quotation, guessed chapter or Wiki-only featured quote was added. The five excerpts were checked against timestamped English caption transcripts with speaker context; see the audit for verification limits. |
| 11 | Nationality records added | 78 confirmed nationality or national-team representation objects using one structure: `{ code, name, basis, source, representation? }`. |
| 12 | Unknown nationality | Marc Snuffy remains null because reviewed secondary sources conflict. Ubers affiliation is not used as nationality evidence. |
| 13 | Flag implementation | One shared helper renders visible country text and a 24 x 16 local SVG. No emoji dependency, third-party hotlink or new runtime package. |
| 14 | Flag assets and licence | Nine unmodified SVGs from `lipis/flag-icons`, MIT licence, copyright Panayiotis Lipiridis. The full licence, source README and Legal credit are included. GB identifies the ISO parent country; England representation uses `gb-eng.svg` and the England label. |
| 15 | Dossier nationality placement | Between the name and position badges. Unknown nationality produces no empty box. |
| 16 | Team Builder nationality placement | Between name and position badges in the same selected-player sidebar component used by Standalone and Auction builders. No pitch-token flags. |
| 17 | Smooth-scroll implementation | 300ms requestAnimationFrame transition with one header-safe destination computed from the section’s existing scroll-margin-top. No route reload, URL rewrite or history push. User input cancels an active transition. |
| 18 | Reduced motion | `prefers-reduced-motion: reduce` jumps immediately. Keyboard Enter remains supported. |
| 19 | Dossier active state | One IntersectionObserver, using the same header-safe offset and thresholds 0/1, tracks visible sections. `aria-current="location"`, an underline and inset border supplement the accent color. Profile replacement and leaving the dossier disconnect it. |
| 20 | Team Builder pitch size | Desktop: `clamp(650px,69vh,740px)`, replacing `clamp(790px,78vh,810px)`. Narrow screens: `clamp(690px,82vh,740px)`, replacing 820px. Internal marker spacing is tighter; names use readable 12px-or-larger single-line ellipsis. Full names remain in title text and the selected profile. |
| 21 | Formation coordinates | Unchanged in source and in the browser. The existing formation fingerprint remains pinned. |
| 22 | All formations tested | All 10 supported formations, full XI, long names, Captain, selection and chemistry; both builders and both themes. BEST FIT, GOOD FIT and SWAP states were checked at all required sizes plus 3440 x 1440. |
| 23 | Overlap protection | 960 formation-state checks: zero label/portrait/name/OVR/Captain collisions and zero pitch clipping. Intentional portrait badge overlays remain. Captain placement stays vertically clear of the position label. |
| 24 | Light Mode | Passed dossier/weapon/quote/flag/navigation/profile and formation checks. Desktop and narrow screenshots were inspected. |
| 25 | Dark Mode | Passed the same checks; desktop and narrow screenshots were inspected. |
| 26 | Data-validation improvements | Rejects malformed/duplicate weapons, meaningless placeholders, invalid source metadata, unsupported nationality, missing flags, unverified/empty/malformed/duplicate quotes and changes to protected formation geometry. Empty weapon lists and null nationality/quotes remain valid. |
| 27 | Preflight | `node scripts/preflight.js`: PASS, 41 checks, 0 failed checks. |
| 28 | JavaScript syntax | Independent `node --check` on every one of the 31 project JavaScript files: all pass. Preflight also checks all 31. |
| 29 | Real browser testing | Actual headless Chromium with Playwright: 79 dossier records, 126 detailed dossier layouts, 112 builder-profile layouts, 960 formation states, manual wheel navigation, keyboard/reduced motion, Back, filtering/comparison/chemistry, Auction controls, Captain/reserves/Auto Best, exact sharing/Print, mouse/touch dragging, root/Pages routing and service-worker/flag caching. |
| 30 | Exact changed files | 27 modified files, listed below. |
| 31 | Exact new files | 13 new files, listed below. |
| 32 | Exact deleted files | None. |
| 33 | Player ratings | Unchanged; all 79 complete original player gameplay records were compared with the starting source. |
| 34 | Player positions | Unchanged. Teddy Knight keeps the latest-main primary LW and secondary LM. |
| 35 | Chemistry | Data, scores, calculations and formation-edge topology unchanged. Browser SVG endpoints match slot centers in all ten formations. |
| 36 | Formation definitions | Unchanged, including all X/Y coordinates and supported shapes. |
| 37 | Auction mechanics | Unchanged. Actual opening bid, bid, pass, Undo/Redo, next player and Quick Draft browser actions pass. |
| 38 | Auto Best | Algorithm and weights unchanged. The real browser confirms all ten formations are searched. |
| 39 | Save compatibility | Existing save keys, schemas, normalizers and storage code unchanged. Existing Auction/Standalone normalization and round-trip checks pass. |
| 40 | No Singleplayer/CPU changes | None introduced. No Battle Sim effects or values were implemented; existing raw weapon placeholders remain safe and hidden. |
| 41 | Syaafi’s current work | Existing dossier design, emblem/profile layering, weapon architecture, Isagi content and character descriptions are preserved. Profile metadata and category registry compare exactly with latest main. |
| 42 | Unresolved merge conflicts | Zero genuine unresolved conflict markers; `git diff --check` passes. Existing line endings are retained. Fourteen HTML files change only asset query versions. |
| 43 | Remote/local Git writes | Nothing committed, pushed or PR’d; no remote branches or GitHub files modified. The fetched baseline and local uncommitted worktree are retained. |
| 44 | Downloadable archive | `BL-draft-v0.6.9.1-alpha.zip`: 40 changed/new files only, repository-relative paths, verified contents. No repository wrapper, .git, node_modules, unchanged portraits, screenshots, test-result files or temporary helpers. |

## Browser coverage

Both themes were tested at 2560 x 1440, 1920 x 1080, 1600 x 900, 1366 x 768, 1024 x 768, 430 x 932 and 390 x 844. Formation checks also include 3440 x 1440. Dossier samples include Isagi, Kaiser, Rin, Sae, Noa, Imamura, Luna, Teddy and Snuffy; every one of the 79 dossiers also had its actual weapon/quote/nationality counts and unchanged OVR checked.

Browser checks completed with no captured page errors or missing assets. The functional regression suite passed 7 checks, Database suite 6, dragging suite 11, and service-worker suite 5. Manual section tracking was tested at 4 widths (24 section destinations). Chemistry SVG geometry and Print were checked in all ten formations. The destination-page Main Menu flash check passed. Screenshots of optional states, weapons, quotes, profile flags, compact pitches and SWAP feedback were inspected in both themes on desktop and narrow layouts.

Validation used Chromium with simulated narrow viewports and actual browser mouse/touch event dispatch; separate Firefox/Safari or physical-device sessions were not performed. No visual issue remains in the tested layouts. Long pitch names intentionally truncate, with the complete name available in the profile/title.

## Diff review and CSS scope

Protected player objects, all profile descriptions, category records, chemistry records, formation definitions and edge topology were compared with the captured latest-main data. Original Isagi weapons and all player calculation helpers match the baseline. Mechanics, dragging, storage, router and sharing modules remain unchanged. Only reference metadata and presentation are added.

CSS edits stay in the relevant nationality, dossier-nav/quote, pitch and token rules. The obsolete two-line name clamp was replaced, redundant position spacing was consolidated, and the Captain’s upward transform was removed. No giant bottom override, new !important declaration, formation-specific nudge or stylesheet rewrite was added.

## Modified files (27)

```text
DEVELOPMENT.md
auction/results.html
auction/results/index.html
auction/room.html
auction/room/index.html
auction/setup.html
auction/setup/index.html
auction/team-builder.html
auction/team-builder/index.html
changelog/index.html
css/character-lore.css
index.html
js/lore.js
js/player-reference.js
js/players.js
js/preflight.js
js/ui/formation-ui.js
js/version.js
legal/index.html
lore.html
lore/index.html
privacy/index.html
scripts/data-validation.js
service-worker.js
style.css
team-builder.html
team-builder/index.html
```

## New files (13)

```text
docs/player-audit-v0.6.9.1.md
docs/release-v0.6.9.1.md
images/flags/LICENSE-flag-icons.txt
images/flags/README.md
images/flags/ar.svg
images/flags/br.svg
images/flags/de.svg
images/flags/es.svg
images/flags/fr.svg
images/flags/gb-eng.svg
images/flags/it.svg
images/flags/jp.svg
images/flags/ng.svg
```

## Deleted files

None.

## Packaging

The archive contains exactly the 27 modified and 13 new files listed above, preserving their repository-relative paths. Its file list, each entry’s bytes and archive CRC were verified against the worktree before delivery.
