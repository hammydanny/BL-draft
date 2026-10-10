# V0.6.8.2 Alpha — release report

Implemented locally from latest main `ded0088468f2c0914ed2cf5592b02d8586329697`. GitHub remained read-only. This package overlays that exact source; it contains complete changed files at their repository-relative paths.

1. **Source:** the latest-main commit above, fetched at the start; legitimate v0.6.8 and v0.6.8.1 work retained.
2. **Scouting Desk:** two compact tools replace the passive Featured Egoists / Chemical Reaction section; desktop columns stack on mobile.
3. **Player Lookup:** searches the real `players` array, limits results to six, defaults to the six highest-rated players, shows portrait/name/primary position/numerical OVR/grade, and opens real dossiers or the full Characters database.
4. **Chemistry Check:** two searchable keyboard/touch pickers call the existing relationship/tier helpers. Special, ordinary, empty and same-player cases work; real Chemistry database navigation is provided. Isagi / Kurona correctly returns 98 and PLANET HOTLINE.
5. **Light pitches:** retained the latest pale tactical-board surfaces and extended them to the formerly dark Homepage SVG. Lines, markers and ink now follow the active theme.
6. **Light chemistry:** pitch and page views share the same restrained gold, green, blue, purple and red tier tokens. Chemistry values and tier calculations are unchanged.
7. **Other Light corrections:** theme-aware radar glow, Auction panel shadow/background, report position/OVR frames, Captain controls and pointer-preview name surface. Existing Light scrollbar and token fixes remain.
8. **SWAP:** blue/cyan label, full target outline, restrained glow/background and portrait edge; the hovered action is stronger than passive suggestions.
9. **BEST FIT:** gold label and active full-target gold outline/glow/tint.
10. **GOOD FIT:** related gold with a thinner outline and softer tint/glow; neutral targets stay subtle.
11. **Label priority:** one real `.slot-target-label` per slot. Occupied hover renders SWAP instead of a fit label; empty hover uses BEST / GOOD FIT or neutral. Superseded pseudo-labels were removed.
12. **Results portraits:** two-team portraits increased from 28px to 50px, or 54px on taller desktops. Position badges avoid covering the face; Captain badges are 20px; reserves use 24×26px portraits. Standalone reports share the same portrait frame and keep position-adjusted OVR.
13. **Screenshot fit:** all ten two-team formations passed with full 15-player rosters, both XIs, OVR, chemistry, Captain, deployment, budgets, Best Link, reserves and credits visible. Maximum report bottom was 756.2px at 1366×768 and 786.2px at 1600×900. Desktop reports retain two columns; mobile reports stack. Meaningful text remains at least 12px in the browser scans.
14. **Pool context:** roster changes retain the Global Player Pool DOM and update selection feedback in place; internal scroll stayed at 400px. A separate 200px page-position check stayed at 200px.
15. **Reserves context:** selecting a player refreshes the profile/highlights without replacing pitch or reserves. Desktop list scroll stayed at 450px. Narrow screens preserve the clicked card's viewport position when the profile above it changes height. Full renders restore existing internal scroll and focus without suppressing deliberate navigation.
16. **Image root causes:** the old two-request queue could retain detached work and block replacement cards; reproduced with two held requests. Deferred source removal, separate warming/deferred/direct paths, indefinite stalled work and non-resetting fallback guards also made recovery brittle. Old pool rebuilds independently reproduced the scroll reset from 400px to zero.
17. **Central loader:** one canonical resolver, shared per-URL request/decode cache, visible/background priority queue, DOM bindings, IntersectionObserver and MutationObserver handle all player surfaces. Portraits render a safe placeholder and swap after loading/decoding. Direct templates now enter this same boundary.
18. **Race safety:** asynchronous completion checks the connected node, current binding/entry, desired URL and applied source; removed or reused cards cannot receive a previous player's completion. A delayed previous image and 14 rapid identity changes passed.
19. **Fallback:** self-contained stable SVG; one retry (two attempts total), 250ms retry delay, 8-second attempt timeout and failed-entry cooldown. Native error fallback is guarded until identity change/recovery. The missing-file test made exactly two requests, settled safely and recovered when reused for a valid player.
20. **Warming/lazy loading:** maximum six active requests, maximum two background requests, at most 30 squad candidates and 64 retained settled decode entries. Visible/eager work is promoted, detached non-warming work is released, custom reveal uses native eager loading to avoid two lazy gates. The Homepage does not preload all 79 portraits.
21. **Routes/images:** all 79 portraits decoded successfully in fresh Dark and Light runs at root and `/BL-draft/`. Nested Auction room, Builder, Lore/dossiers, reload and Back/Forward passed. No screen-specific `../images` resolution was introduced.
22. **JavaScript optimization:** profile/selection updates avoid rebuilding the pitch and reserves; pool DOM survives roster renders; the central image cache deduplicates warming and display work. Event handlers remain single-bound. No project dependency or framework was added.
23. **CSS cleanup:** replaced obsolete static discovery styles; consolidated fit/drag states into the actual component rules; removed old pseudo-labels/native drag rules, unused legacy share-card selectors, superseded portrait rules and redundant Light scrollbar declarations. No new `!important` rules or bottom-of-file patch block was added.
24. **Visual sweep:** fixed stacked target labels, dark Homepage art in Light Mode, tiny report portraits, badge obstruction, report truncation and narrow-pitch name collisions. Shared header/game markup outside Scouting and versioned references was verified unchanged.
25. **Cache:** static namespace is `bld-static-v0.6.8.2`; player image URLs include the central version. All document asset references use the new version. The worker continues caching only images/fonts, preserving full URL versions, removing stale 404/410 entries and fetching HTML/JS/CSS fresh. Real worker activation/update/purge tests passed.
26. **Version/history:** central `APP_VERSION` is `0.6.8.2`, yielding `V0.6.8.2 ALPHA`; a concise current Changelog entry was added and the existing v0.6.8.1 entry retained as history.
27. **Preflight:** `node scripts/preflight.js` — PASS, 0 failed checks. Existing gameplay/save simulations retained; new UI/image contracts are covered.
28. **Syntax:** independent `node --check` on every project JavaScript file — 29 checked, 0 failures.
29. **Browser:** real headless Chromium via Playwright; actual mouse, keyboard and CDP touch interactions. No claim of physical-device, Safari or Firefox testing.
30. **Desktop:** 1920×1080, 1600×900, 1366×768 and 1024×768; Auction controls, headers, information pages, images, reports and formations passed.
31. **Mobile:** 430×932 and 390×844; stacked tools/reports, header utilities, pool/reserve context and touch drag/swap/cancel passed. No horizontal page overflow in the screen matrix.
32. **Dark:** preserved the dark futuristic design; all ten report formations and core interactions passed.
33. **Light:** reviewed pale Homepage/pitch/report surfaces and target feedback; all ten report formations passed. The 158-screen / 48-modal Dark+Light matrix recorded zero page errors, missing resources or horizontal page overflow.
34. **Changed/new files:** exact list below (34 files total).
35. **Deleted files:** none.
36. **Player identities/positions:** unchanged byte-for-byte in `js/players.js`; Teddy Knight's existing LW / LM positions remain.
37. **Ratings:** unchanged; grade/radar calculations and source stats are unchanged.
38. **Chemistry:** data and calculations unchanged byte-for-byte. All-ten-formation SVG endpoints still align with the original slot centers.
39. **Formations:** definitions, coordinates, active-slot priorities and formation/scoring/placement code before the UI selection functions are unchanged. Pointer hit-testing, movement, edge-scroll, drop and cleanup logic are unchanged.
40. **Auction mechanics:** only portrait markup enters the central loader. Opening, bidding, passing, Undo/Redo, next player, zero-budget flow and Quick Draft passed. Budget/rules code is unchanged.
41. **Auto Best:** weights, scoring and search unchanged. Browser instrumentation confirmed all ten formations are visited.
42. **Saves/sharing:** storage keys, schemas and compatibility code unchanged; preflight legacy/current round trips passed. Sharing preserves exact assignments, formation, Captain and reserves; it does not run Auto Best.
43. **v0.6.8.1:** status strip and FIELD METRICS label remain removed; SFX polish, Captain-before-attributes placement, Auction scroll fix, Auction OVR placement, Builder OVR, header Auction alignment, favicons, Light fixes and compact reports remain intact. Real navigation tests show no Main Menu flash.
44. **Conflicts/markup:** zero unresolved merge conflicts, duplicate IDs/imports or duplicate HTML attributes. Image alt attributes and classic script order were checked; app.js remains last. No line-ending-only changes or unrelated formatting churn.
45. **GitHub:** nothing committed, pushed, branched remotely or PR'd; all implementation remained local.
46. **Package:** `BL-draft-v0.6.8.2-alpha.zip` contains only the files below, with relative paths. Membership, ZIP CRC and byte-for-byte payloads were verified against the local files. It excludes Git metadata, unchanged assets/source, dependencies, screenshots and QA output.

Remaining visual checks: the actual deployed site on physical devices and Safari/Firefox, especially long custom team names or unusually large reserve rosters. Screenshot-fit measurements above use the tested full 15-player squads and standard team names; larger/custom content can naturally require vertical scrolling.

## Exact changed/new files

- `DEVELOPMENT.md`
- `auction/results.html`
- `auction/results/index.html`
- `auction/room.html`
- `auction/room/index.html`
- `auction/setup.html`
- `auction/setup/index.html`
- `auction/team-builder.html`
- `auction/team-builder/index.html`
- `changelog/index.html`
- `css/homepage.css`
- `css/player-stats.css`
- `css/site-theme.css`
- `docs/release-v0.6.8.2.md` — new
- `index.html`
- `js/app.js`
- `js/auction.js`
- `js/formations.js`
- `js/player-images.js`
- `js/preflight.js`
- `js/results.js`
- `js/standalone-builder.js`
- `js/ui/auction-ui.js`
- `js/ui/formation-ui.js`
- `js/ui/homepage.js`
- `js/version.js`
- `legal/index.html`
- `lore.html`
- `lore/index.html`
- `privacy/index.html`
- `service-worker.js`
- `style.css`
- `team-builder.html`
- `team-builder/index.html`
