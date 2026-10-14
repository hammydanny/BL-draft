# Blue Lock Draft — V0.6.8 Alpha

Website experience release completed on 10 October 2026. The current game and
database remain the foundation; this release improves the Homepage, discovery,
themes, shared information content and global shell.

## Release report

1. **Latest-main source:** `420b6cf8f629764503ef8cedfd16f9ee8c076dd8`, fetched
   from `origin/main` before implementation. Work used an isolated local worktree
   at that exact commit. Earlier local worktrees were not replaced or reset.
2. **Homepage:** replaced the old menu presentation with a complete landing
   experience: Hero, mode cards, valid-session continuation, featured characters,
   real chemistry discovery, runtime status and project navigation.
3. **Hero:** large BLUE LOCK / DRAFT typography, an original football pitch SVG,
   “BUILD THE ULTIMATE EGOIST XI.”, a plain explanation, Start Auction and Quick
   Draft. The tactical preview reads the existing 4-3-3 formation. All three main
   destination cards fit within the tested laptop first viewport.
4. **Destination cards:** Auction Draft, Team Builder and Database use lightweight
   original SVG icons, concise descriptions and visible actions. Native buttons
   support keyboard activation and reuse the existing game entry points.
5. **Continue Session:** reads the normalized existing Auction save. Shows both
   team names, individual roster progress, combined progress, Auction number,
   phase and players remaining. Pending targets count until signed. The same
   Resume implementation restores Auction, Results or Formation Builder as
   appropriate. Empty, malformed and unsupported saves hide the panel.
6. **Featured Players:** four stable existing identities: Yoichi Isagi, Meguru
   Bachira, Rin Itoshi and Michael Kaiser. Names, positions, OVR and grades come
   from live records and shared helpers. Each opens its actual character dossier.
   Portraits use the existing image abstraction, queue and fallback.
7. **Chemistry Discovery:** reads the existing Isagi / Kurona special relationship
   and shared chemistry calculation: Planet Hotline, 98, Chemical. Links reach
   both real dossiers and the existing Chemistry database. No relationship was
   created or changed.
8. **Site Status:** centralized V0.6.8 Alpha, supported chapter 364, dynamically
   counted 79 players and 10 formations, plus the saved/resolved appearance.
9. **Dark Mode:** layered navy surfaces, controlled blue accents, consistent
   borders, shadows and card geometry. Football pitches retain their tactical
   palette. Existing gameplay layout footprints remain intact.
10. **Light Mode:** pale page surfaces, navy text, stronger readable borders,
    contrast-safe blue actions and gentler shadows. Forms, dropdowns, Settings,
    modals, reading pages and footer use the shared semantic tokens.
11. **System theme:** the existing preference architecture is unchanged. Live OS
    changes update resolved appearance and existing theme assets. Head favicons
    retain the established OS-based behavior.
12. **Header:** preserved Syaafi's branding, navigation structure, 72px desktop /
    88px collapsed geometry and Auction label/arrow alignment. Added consistent
    popup states, keyboard support and canonical destinations for information
    pages, which now use the same full header.
13. **Motion:** shared short 140ms / 220ms transitions and finite entry effects for
    landing content, dropdowns and modals. Reduced-motion removes animations,
    transitions and animated scrolling. No continuous decorative animation or
    video was added.
14. **Privacy:** readable sections explain local Auction/Builder/preferences,
    no current app cookies or analytics, hosting logs and asset caching, external
    policies, data controls and browser storage limitations. Reset Preferences
    preserves games; browser site-data deletion removes saves. Public project
    contact links remain available. No encryption/compliance claims were invented.
15. **Legal:** explains the unofficial non-commercial fan project, separate Blue
    Lock rights and original project work, fan-made ratings, project use, concise
    no-warranty wording, external sites and a public rights-concern pathway.
16. **About / Credits:** one shared modal explains the project and features,
    presents deliberate HammyDanny / SyaafiBWN credit cards with their original
    GitHub links, centralized version/chapter and the fan-project disclaimer.
17. **How to Play:** the same shared modal now has six Auction steps, six Builder
    steps, jump navigation, Quick Draft sizes, chemistry, ratings and local saves.
    It retains bidding, free signings, Undo/Redo, Reserves, Captain, all-formation
    Auto Best and exact-formation sharing guidance.
18. **Changelog:** new `changelog/` technical timeline, latest first, with V0.6.8,
    V0.6.7.4, V0.6.7.x, V0.6 and V0.5 summaries. Historical claims derive from
    `docs/release-v0.6.7.4.md`, `docs/release-v0.6.3.md`, `DEVELOPMENT.md` and
    repository snapshots including `c0454eb^:index.html`. Historical dates were
    not fabricated. The latest entry reads the central version.
19. **Footer:** compact Project, Information and Development groups, fan-project
    disclaimer, preserved profiles, functional Changelog, shared About/How to
    Play and centralized version/chapter. Mobile columns and sections stack.
20. **Accessibility:** visible semantic focus, native interactive cards, labeled
    navigation, descriptive image alt text, modal focus trapping/Escape/return,
    inert background content, dropdown Arrow/Home/End support and reduced-motion.
    All 44 checked semantic text/surface contrast pairs meet 4.5:1. Checked mobile
    header utilities, reading-index links and footer actions are at least 44px high.
21. **Performance:** no new image/font bytes, dependency, icon library, tracking
    or video. Homepage requests at most its four featured portraits and uses lazy
    loading with fixed frames. Information pages omit the player/game payload.
    Local bundle accounting: referenced game-page JS/CSS rises from 122,922 to
    131,320 gzip bytes (8,398 bytes added); index HTML rises from 6,131 to 7,728
    gzip bytes. These are payload measurements, not a claim of faster networking.
22. **Cache:** central release and all document asset queries are 0.6.8; the
    static image/font cache namespace is 0.6.8. Shared registration handles root
    and subdirectory deployments with `updateViaCache: "none"`. Existing worker
    network freshness, scoped caching and obsolete-cache cleanup remain intact.
    Active games are not force-refreshed.
23. **Routes:** exercised Home, Setup, Room, Results, both Builders, Lore,
    Characters, dossiers, Chemistry and all information content. Canonical and
    legacy documents work at root and `/BL-draft/`; assets, logos and favicons
    resolve. Back/Forward, selected-character reload and actual header navigation
    pass. Destination documents showed zero Main Menu frames during navigation.
24. **Mobile Homepage / information:** cards stack, featured portraits form two
    columns, controls stay usable, reading indices wrap and modals fit at 390px
    and 430px. No measured horizontal page overflow.
25. **Regression protection:** preflight checks genuine Git conflict syntax,
    shared shell/modal duplication, script order, IDs, versions, required routes,
    nested assets, discovery helper reuse and saved-session phase summaries.
    Documentation separators are not falsely treated as merge conflicts.
26. **Preflight:** `node scripts/preflight.js` — PASS, 0 failed checks.
27. **JavaScript syntax:** independent `node --check` on all 29 project JavaScript
    files — PASS. All 16 HTML documents have balanced structure and no duplicate
    attributes; `git diff --check` passes.
28. **Browser:** actual Chromium 153 controlled with Playwright. The main matrix
    covered 264 page/state cases and 80 modal cases with zero browser errors,
    missing assets or measured page overflow. Additional functional, cache,
    navigation, accessibility, drag and share suites passed.
29. **Desktop:** 1920×1080, 1366×768 and 1024×768, all four appearance modes.
    Checked Hero/destination visibility, header/dropdowns, Auction controls,
    player evaluation, all 79 dossiers, reserves/Captain, Auto Best, chemistry,
    exact shares and print. All ten formations have centered tokens and aligned
    chemistry endpoints. Sharing checks included 80 standalone views, 40
    two-team views and all ten print formations without clipping/collisions.
30. **Mobile:** 430×932 and 390×844, all four appearance modes. Checked shell,
    Homepage, reading pages, modals, Auction and Builder usability. Real CDP
    touch dragging, edge auto-scroll and swapping pass. Mouse dragging,
    cancellation, capture loss and lifecycle cleanup also pass.
31. **Themes:** Dark, Light, System with OS dark and System with OS light pass.
    Live System changes, logo/favicon paths, preference persistence, SFX and
    Reset Preferences were exercised. Both raw game saves remain unchanged by
    resetting preferences. Reduced-motion checks pass.
32. **Changed files (27):**

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
    css/character-lore.css
    css/legal.css
    css/site-header.css
    css/site-theme.css
    index.html
    js/app.js
    js/preflight.js
    js/ui/menu.js
    js/ui/site-directory.js
    js/version.js
    legal/index.html
    lore.html
    lore/index.html
    privacy/index.html
    service-worker.js
    style.css
    team-builder.html
    team-builder/index.html
    ```

33. **New files (7):**

    ```text
    changelog/index.html
    css/homepage.css
    css/site-information.css
    docs/release-v0.6.8.md
    js/site-runtime.js
    js/ui/homepage.js
    js/ui/site-information.js
    ```

34. **Deleted files:** none.
35. **Player data:** unchanged. `js/players.js` is byte-identical to the source;
    ratings, IDs, positions, descriptions and Teddy Knight's existing LW / LM
    positions are preserved. All portrait/font assets are unchanged.
36. **Chemistry data:** unchanged. `js/chemistry.js` is byte-identical; discovery
    calls the existing relation and tier helpers.
37. **Formations:** unchanged. `js/formations.js` and formation UI are
    byte-identical; no coordinates, definitions or chemistry geometry changed.
38. **Auction mechanics:** unchanged. Engine and Auction UI modules are
    byte-identical. Opening, bidding, passing, free signing, Undo/Redo, Quick
    Draft and Results passed. The latest-main portrait/Attribute Analysis OVR
    placement is retained; this release does not rebuild that module.
39. **Auto Best:** unchanged behavior, scoring and weights. Existing production
    modules are byte-identical and browser instrumentation confirmed every one
    of the ten formations is visited. Sharing never runs Auto Best.
40. **Saves:** unchanged keys, schema and compatibility. State/storage modules
    are byte-identical. Existing Auction, standalone and legacy restoration,
    valid-phase resume and preference-reset preservation checks pass.
41. **Syaafi's work:** preserved branding, header geometry, developer links,
    database/lore data, filters and dossier structure. The existing legitimate
    Privacy/Legal topics remain within their requested expanded versions.
    Builder/dossier OVR and the corrected Auction evaluation layout stay as on
    latest main. Game/database HTML content is byte-identical after asset-query
    normalization. Eighteen protected production modules are byte-identical.
42. **Final review:** no unresolved merge-conflict markers, duplicate shared
    headers/scripts/styles/IDs, debug logging, unrelated data edits, unchanged
    assets or line-ending-only churn. Removed superseded old menu/orbit,
    info/rule-grid and footer rules in their original sections; new Homepage
    and information styles have dedicated modules. No full stylesheet rewrite.
43. **GitHub:** nothing committed, pushed, remotely modified or submitted as a PR.
44. **Package:** `BL-draft-v0.6.8-alpha.zip`, 34 changed/new files only, with
    repository-relative paths. Archive membership, CRCs and file bytes were
    verified. No repository wrapper, unchanged images/fonts, browser tests,
    screenshots, dependencies, installers or temporary files are included.

## Remaining visual checks

The existing Auction opening panel needs a short vertical scroll at 1366×768;
its measured footprint is identical to latest main and was deliberately
preserved for this website-only release. Browser interaction tests verified the
controls remain usable. Physical-device Safari/Firefox testing is still useful;
the completed browser validation used Chromium. The deeper Database and mobile
gameplay redesigns remain outside V0.6.8.
