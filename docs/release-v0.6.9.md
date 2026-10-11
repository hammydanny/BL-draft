# Blue Lock Draft — V0.6.9 Alpha release report

Release date: 11 October 2026. Apply the ZIP over the source revision below, preserving its repository-relative paths. The archive contains 27 modified files and 3 new files; it does not contain the repository, unchanged assets, dependencies or QA material.

1. **Source:** latest origin/main fetched at task start: a05c482e08f85aabb4206fc56feae2a496860b22. Implementation used an isolated detached local worktree.

2. **Character Database:** a Player Intelligence hub, 79 compact directory cards, richer dossiers and comparison of up to three players.

3. **Filters:** accent-insensitive, multi-word search; position groups and exact gameplay roles; OVR grade; the existing nine player categories; recorded affiliation/history; appearance, name, OVR, position and six attribute sorts. Reset and useful empty states are included. Nationality is omitted because no reliable nationality registry exists in the source.

4. **Cards:** consistent 4:5 portrait frames with cover/top crop, visible names and position badges, OVR number and grade, real dossier links and a separate accessible Compare control.

5. **Dossiers:** identity/profile, attributes, roles/evidence, existing weapons, exact registered pair relationships and recorded team history. All original player descriptions were retained verbatim and moved to ID-keyed metadata.

6. **Positions:** project primary/secondary roles are explicitly separated from demonstrated-role notes. Eighteen profiles have role notes drawn only from positions explicitly described in their existing latest-main profiles. The UI identifies these as partial records based on the existing profile; it does not infer canon from gameplay badges.

7. **Attributes:** the existing six-axis radar, numeric values and shared S–G grades remain. OVR is prominent, six numeric attribute tiles accompany the radar, and GK stays a separate specialist metric. No values or radar axes changed.

8. **Weapons/playstyle:** existing documented weapon names and descriptions remain. Missing records are stated clearly. Future Battle Sim placeholders are no longer displayed; their existing raw data was preserved. No new weapon facts or gameplay effects were invented.

9. **Affiliation/history:** existing chemistry contexts resolve to player IDs and link to members' dossiers. History is labelled as recorded membership/shared match groups, not a current-club claim. Context baselines are distinguished from exact pair scores.

10. **Quotes:** a verified-only quote registry and rendering boundary were added. The registry is currently empty, so no quote section is displayed.

11. **Verification:** future quotes require a valid player ID, actual dialogue, manga/anime source, chapter/episode, source reference and VERIFIED status. Unverified or incomplete records fail validation and cannot render. Verification metadata remains internal; the UI displays only verified quotation text.

12. **Chemistry Database:** search, relationship/context type, tier, Player A, Player B, recorded context and score/name sorting. An exact-pair panel evaluates any two distinct players through the unchanged shared chemistry helper. All 81 registered pairs and 30 team contexts remain available.

13. **Chemistry integrity:** structural checks reject unknown names, self-pairs, duplicate/reversed pairs, malformed tuples, invalid scores and missing labels/explanations. No chemistry values were repaired or changed.

14. **Data architecture:** players.js remains authoritative for players, ratings, attributes, gameplay positions and weapons. player-reference.js owns reference metadata and the single shared category registry. PLAYER_RECORDS references the original player objects.

15. **IDs:** profiles are keyed by stable player ID. Chemistry adapters resolve existing names once to IDs, shared history and relationship indexes are cached, and dossier navigation uses stable IDs. Existing gameplay chemistry storage was retained.

16. **Formation overlap:** every slot now reserves a fixed fit-label row inside its bounds. Fixed name height, compact internal spacing and a wider desktop canvas separate fit labels, positions, portraits, OVR and names without formation-specific nudges. Intended portrait corner badges remain.

17. **Pitch height:** the shared tactical pitch now uses clamp(790px,78vh,810px) on desktop and 820px at widths up to 760px. Narrow pitches need additional separation for diagonal rows. Conflicting old mobile auto-height/560px overrides were removed. Both builder modes use the same presentation.

18. **Coordinates:** all existing x/y percentages are unchanged. The slot transform remains centered on its original coordinate. Chemistry SVG endpoints and geometry code are unchanged.

19. **Formations checked:** 4-3-3, 4-2-3-1, 4-4-2, 4-1-3-2, 4-3-2-1, 3-4-3, 3-5-2, 3-4-2-1, 5-3-2 and 5-2-3. Filled-XI fixtures included long names and a Captain, in both builder modes.

20. **Fit feedback:** BEST FIT remains gold, GOOD FIT green and SWAP cyan/blue through shared semantic aliases. The final 960 live-feedback layouts passed with no label collisions, clipping, coordinate changes or page errors.

21. **Selection:** the existing dedicated selection ring and nameplate remain distinct from fit/action feedback. Reserving a transparent position border prevents selection from changing slot dimensions. The Yo Hiori-at-AM / Tabito Karasu-at-DM example also passed six desktop/mobile views with Hiori selected and Captain.

22. **Light Database:** shared reference screens sit above the fixed background emblem, preserving the latest profile stacking fix. Cards, dossiers, controls and comparison use semantic light surfaces and text.

23. **Light chemistry:** darker gold, green and cyan text tokens improve readability while retaining distinct tiers. All five chemistry-tier legend text contrasts passed at least 4.5:1 in the tested dark/light reference views.

24. **Privacy audit:** application code uses browser saves/preferences and images/fonts caching. Database filters and comparisons remain in page memory. The current app sets no own cookies and includes no analytics/tracking integration. The notice explains hosting limitations and retains existing reset/browser-data controls; it makes no new blanket hosting or legal-compliance promise.

25. **Legal audit:** existing unofficial, non-commercial, franchise/IP, no-affiliation, warranty and rights-contact statements remain. Project ratings/roles are clarified and licence credits added. No invented company, private contact address or certification was added.

26. **About/Credits:** existing HammyDanny and SyaafiBWN links remain. About explains the rating/reference methodology and links to font credits. Existing How to Play was extended with Database, grades, chemistry tiers and current Captain instructions.

27. **Licences:** visible credits link to the unchanged local SIL Open Font License 1.1 notices for Barlow Condensed (The Barlow Project Authors, 2017) and Rajdhani (Indian Type Foundry, 2014). No framework or runtime library was added.

28. **Methodology:** project ratings, gameplay-compatible roles, partial demonstrated roles and interpreted chemistry are explained in Database guidance, dossiers, About and How to Play. The existing grade helper is reused; grade calculation was not duplicated.

29. **SEO:** all 16 HTML documents have descriptions, canonical links and Open Graph title/description/type/site-name metadata. Database titles and descriptions adapt to the selected view/player. Canonicals resolve against the existing deployment base; no fictional domain or preview image was supplied.

30. **Accessibility:** real dossier anchors, labelled native search/select controls, pressed-state comparison buttons, live status, visible keyboard focus, semantic sections and focus restoration. Narrow Database controls have usable touch heights. Existing shared header/modal keyboard behavior remains.

31. **Performance:** cards/decoded portraits reuse DOM nodes, search is debounced, sorted orders and relationship indexes are cached, and listeners are delegated. Existing lazy/visible-first bounded portrait loading remains unchanged. No new dependency was added.

32. **Player validation:** unique IDs/names, local images, required stats and range, primary/secondary roles, appearance metadata, weapon records, categories and profile classifications/role notes.

33. **Chemistry validation:** original tuples, context membership, duplicate/reversed relationships, score/label/reason fields and valid ID adapters. Rejection fixtures verify that malformed records fail.

34. **Quote validation:** unknown-player, unverified, missing-source and malformed quote fixtures fail. A missing quote is valid and renders no fabricated fallback.

35. **Formation validation:** eleven slots, exactly one GK, valid labels/bounds and a SHA-256 fingerprint pinned to the latest-main formation definitions. A coordinate-mutation fixture is rejected.

36. **Image regression:** all 79 directory portraits loaded successfully while scrolling. Reused-image/late-request safety, two missing-image attempts (one retry) followed by fallback, and rapid dossier switching passed in Chromium. player-images.js and all image assets are byte-for-byte unchanged.

37. **Large screens:** 1920×1080, 2560×1440 and 3440×1440 were tested. Database and builder widths follow the existing responsive shell tokens; text and portraits retain controlled dimensions.

38. **Routing:** canonical and legacy documents, root and /BL-draft/ deployment, nested assets and favicons passed. Dossier reload, Back/Forward, invalid IDs and partner links work. Real header page transitions showed no intervening Main Menu frames. Existing router logic is unchanged.

39. **Cache:** worker namespace bumped to bld-static-v0.6.9; it still caches only images/fonts. HTML/CSS/JS remain network/browser-cache resources. Actual worker tests passed registration/scope, old-cache cleanup, versioned static URLs, revalidation and 404/410 removal.

40. **Saves:** Auction/Standalone keys, schemas and normalizers are unchanged; no migration is needed. Reference metadata has its own schema version 1 and performs no save writes.

41. **Version:** central APP_VERSION is 0.6.9 and the visible label is V0.6.9 ALPHA. Changed/imported CSS and document asset queries use 0.6.9; no duplicate visible version system was added.

42. **Changelog:** a new current release entry was added. The former v0.6.8.3 entry remains as historical release notes, and all earlier entries remain.

43. **Preflight:** node scripts/preflight.js completed with PASS — 0 failed check(s).

44. **Syntax:** node --check passed independently for all 31 project JavaScript files, including unmodified files.

45. **Real browser:** headless Chromium with Playwright was used, alongside actual mouse and CDP touch input. This was not only DOM stubbing or syntax checking.

46. **Desktop:** the broader matrix covered 420 page states and 128 shared dialogs. Final affected-view checks added 160 Database states. Auction opening/bid/pass, Undo/Redo, next target, Quick Draft, reserves, Captain, Auto Best visiting all ten formations, exact sharing, copy/print/close and chemistry-line centers passed. Eleven drag/edge-scroll/cancellation checks passed.

47. **Mobile Database:** 430×932 and 390×844 were tested. Cards, filters, three-player comparison, dossiers, chemistry and header controls passed without horizontal page overflow. This release does not claim the separate full mobile gameplay overhaul.

48. **Dark:** tested across 3440, 2560, 1920, 1600, 1366, 1024, 430 and 390px widths, with the established dark HUD appearance preserved.

49. **Light/System:** Light and System resolving to both light and dark were tested across the same widths in the broad/final Database matrices. Light chemistry contrast and all-formation feedback checks passed.

50. **Exact modified files (27):**

    - DEVELOPMENT.md
    - auction/results.html
    - auction/results/index.html
    - auction/room.html
    - auction/room/index.html
    - auction/setup.html
    - auction/setup/index.html
    - auction/team-builder.html
    - auction/team-builder/index.html
    - changelog/index.html
    - css/character-lore.css
    - css/site-theme.css
    - index.html
    - js/lore.js
    - js/preflight.js
    - js/ui/formation-ui.js
    - js/ui/setup.js
    - js/ui/site-information.js
    - js/version.js
    - legal/index.html
    - lore.html
    - lore/index.html
    - privacy/index.html
    - service-worker.js
    - style.css
    - team-builder.html
    - team-builder/index.html

51. **Exact new files (3):**

    - js/player-reference.js
    - scripts/data-validation.js
    - docs/release-v0.6.9.md

52. **Deleted files:** none.

53. **Ratings:** every player's original OVR is unchanged.

54. **Attributes:** every original player attribute is unchanged.

55. **Positions:** every player ID, primary position and secondary-position list is unchanged from the source commit. No position correction was made in this release.

56. **Chemistry scores:** all original pair and team-context scores are unchanged.

57. **Chemistry calculations:** chemistry.js is byte-for-byte unchanged.

58. **Formations:** formations.js, definitions, coordinates, edges, Captain calculations, Auto Best weights and search are byte-for-byte unchanged.

59. **Auction:** rules, bidding, budgets, draft selection and Undo/Redo logic are unchanged. Moving the original category registry did not change its keys, labels, members or first-click overlap behavior.

60. **Auto Best:** implementation and weights unchanged; browser instrumentation confirmed it continues checking all ten formations.

61. **Existing saves:** retained compatibility and tested legacy/current normalization, restoration and exact sharing; no new save write path.

62. **Latest work:** latest-main header, homepage/Scouting Desk, image loading, Auction/results layouts and Syaafi's profile-over-emblem fix were preserved. An audit verified 148 protected files were unchanged; all non-Database gameplay markup and shared headers/footers remained equivalent after accounting for release asset queries and metadata imports.

63. **Conflicts/cleanup:** no unresolved merge markers, duplicate document asset declarations, line-ending conversions or line-ending-only changes. Chemistry component CSS moved into its owning stylesheet; unused old link/context/weapon-placeholder rules and contradictory mobile pitch height rules were removed. No wholesale stylesheet rewrite or new !important patch was added.

64. **Future modes:** no Singleplayer/VS CPU, Manager Match Battle or full mobile gameplay redesign was added.

65. **GitHub:** no commits, pushes, PRs, remote branches or remote modifications were made. The local worktree remains based on the exact source commit.

66. **Deliverable:** BL-draft-v0.6.9-alpha.zip contains only the 30 paths listed above, with repository-relative paths. ZIP integrity, exact entries and extracted-byte hashes were verified against the final local files.

**Remaining visual checks:** try the deployed release in Safari/Firefox and on physical phones, which were not available here. Review your preferred portrait crops and long-name wrapping on those devices. Demonstrated-role history remains deliberately partial; the quote registry stays empty until actual source verification. No unresolved Chromium layout issue remains within the tested release scope.

