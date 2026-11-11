# BL-Draft — Claude Code Project Instructions

These are permanent repository-level instructions for Claude Code when working on **BL-Draft**.

Also read and obey `AGENTS.md`. These instructions expand the project rules; they do not replace task-specific user instructions. If the repository has changed since this file was written, inspect the latest code and use the current repository as source of truth rather than blindly trusting stale examples here.

---

## 1. Start every task by understanding the current repository

Before editing:

1. Inspect the latest `main` / `origin/main`.
2. Read the files that own the affected behaviour.
3. Search the entire repository for related routes, strings, constants, state, tests, legacy pages, duplicated markup and old implementations.
4. Check recent commits when a value or behaviour may have been changed recently.
5. Preserve unrelated collaborator work.

Do **not** patch only the first occurrence of a bug.

BL-Draft has historically had parallel/legacy page shells and repeated references. A site-wide issue may appear in both legacy `*.html` routes and folder `index.html` routes, in tests, in navigation data, in cache-busting URLs and in fallback pages.

For cross-site changes, prove you have found the full blast radius before editing.

---

## 2. One source of truth

Prefer a single authoritative source for shared data and rules.

Before adding a new source of data, ask:

> Does an authoritative source already exist?

Extend or reuse it instead of duplicating it.

This is especially important for:

- player data;
- chemistry;
- player counts;
- secret-character state;
- version numbers;
- route definitions;
- formation data;
- Effective OVR / squad calculations;
- localization strings;
- save schemas;
- shared UI state.

If two existing sources conflict, determine which is newest/authoritative from the current repository and recent history, consolidate them, and add regression coverage where practical.

Do not leave mirrored copies that can drift apart.

---

## 3. Preserve the current architecture unless there is a clear reason to improve it

BL-Draft is a classic browser application, not a framework app.

Current architectural expectations:

- classic scripts are intentional;
- maintain script dependency order;
- `js/app.js` remains last where the existing page shell requires it;
- do not introduce a frontend framework or build system just for convenience;
- do not rewrite routing, storage, formation dragging or the whole CSS system unless the task genuinely requires it;
- prefer targeted consolidation over broad rewrites.

If refactoring duplicated legacy/new page structures, do it incrementally and preserve working URLs and saves.

---

## 4. Protect gameplay foundations

Reuse the shared football systems instead of inventing mode-specific alternatives.

Where applicable, new and existing modes should use the same authoritative logic for:

- base OVR;
- Effective OVR;
- position suitability;
- natural / secondary / adapted roles;
- chemistry;
- squad balance;
- formation evaluation;
- Auto Best;
- captain logic;
- CPU evaluation;
- results;
- sharing / save-image snapshots.

Do not let two modes disagree about the quality of the same squad without a deliberate, documented gameplay reason.

### Formation rules

- Do not casually rewrite formation dragging or slot geometry.
- Auto Best must continue to evaluate all supported formations where that is its intended behaviour.
- Sharing must preserve the exact user-built formation.
- Never silently run Auto Best while sharing/exporting a user's squad.

---

## 5. Player data is protected

Do not casually change player facts or gameplay data.

Unless the user explicitly asks, or the current repository clearly contains a newer authoritative correction, preserve:

- player ratings;
- positions;
- OVR;
- weapons;
- aliases;
- chemistry;
- quotes;
- nationality / representation;
- images;
- team history;
- secret-character metadata.

If a task is about UI, routing, replayability or architecture, do not opportunistically rebalance players.

### Canon cutoff

The current supported manga cutoff is defined by `APP_SUPPORTED_CHAPTER` in `js/version.js`.

At the time this file was created it is **Chapter 364**.

Always read the current value before work. Do not silently advance the canon cutoff.

Chemistry is a fan-made gameplay system, not an official Blue Lock statistic.

### Permanent character writing

Write timeless scouting profiles covering the character's personality, football philosophy, established strengths and development across the manga. Integrate new evidence proportionally into that identity. Refine existing weapon descriptions when a development reinforces them; add a signature weapon only with sufficient manga evidence. Do not let one performance erase earlier traits, replace established weapons, imply an unsupported permanent position or dominate a profile. Avoid recurring chapter references and chronological recaps in permanent content; keep evidence and chapter context in internal source records. Separate canon-established facts from gameplay interpretation. For limited-appearance characters, prefer a concise verified profile to speculative padding. Present content releases as normal roster and balance updates; show the supported chapter in its indicator or a brief release note.

---

## 6. Secret characters are a separate roster

Secret characters must remain separate from the public roster.

Current baseline at the time this file was created:

- 79 normal/public players;
- 10 secret characters;
- secret unlock code: `28032009`.

Current secret roster includes:

- John Paccini
- Zaruchi
- Qazicutie
- hdannyy
- Syaafi
- jon
- floppy_willy
- raf
- oka
- Jameswasnthere

Do not hardcode these totals as permanent truth if the roster later changes. Derive current totals from player data and `secretCharacter`.

Rules:

- public roster totals must exclude secret characters;
- secret roster totals must be presented separately;
- secret players must stay hidden until legitimately unlocked;
- unlock behaviour remains session-gated unless explicitly redesigned;
- saved data must not bypass the secret gate;
- new modes must not leak secret players through generated offers, challenge codes, daily content, database counts, share images, ARIA text, hidden DOM, search results or previews;
- if imported/shared content references a secret character, access must still respect the secret gate.

---

## 7. Localization is mandatory, not optional cleanup

Every new or changed visible UI string must ship in all supported languages before a feature is considered finished.

Supported languages:

- English
- Malay
- Japanese
- Arabic
- Simplified Chinese
- French
- German
- Korean
- Portuguese
- Russian
- Spanish

This includes:

- headings;
- buttons;
- labels;
- descriptions;
- tooltips;
- dialog copy;
- errors;
- empty states;
- accessibility labels;
- dynamic text;
- mode objectives;
- metadata;
- tab/page titles where the project localizes them;
- changelog / release copy when required by the existing system.

English is the source language.

Do not add temporary English-only strings and promise to translate later.

Run the localization coverage/integrity tests before declaring completion.

### Quotes

Verified/source quote text should remain exact in canonical data. Where the UI localizes dossier quotes, use the existing translation architecture rather than altering the source quote.

---

## 8. Arabic / RTL rules

Arabic text should use appropriate RTL direction and alignment.

However, **do not blindly mirror tactical or visual structure**.

Do not mirror:

- pitch geometry;
- formation coordinates;
- player portraits;
- chemistry-link geometry;
- OVR badges;
- tactical diagrams;
- reserve-picker football structure.

Mirror/reflow text and ordinary layout only where appropriate.

When changing UI, test Arabic explicitly.

---

## 9. Visual quality is part of correctness

A change is not complete merely because JavaScript runs.

When browser tools are available, visually inspect affected pages.

Look for:

- overlap;
- clipping;
- broken wrapping;
- inconsistent spacing;
- mismatched card heights;
- inconsistent borders/radii;
- wrong fonts;
- weak contrast;
- hover/click hit-area mismatch;
- accidental horizontal scrolling;
- z-index problems;
- modal positioning;
- dropdown clipping;
- scrollbar/layout shifts;
- stale disabled/coming-soon copy;
- stretched images;
- portrait crop inconsistencies;
- light-mode failures;
- RTL failures;
- mobile-only/desktop-only leakage;
- inaccessible focus states.

Preserve BL-Draft's established Blue Lock-inspired visual identity. Do not turn it into generic SaaS, Bootstrap-style UI, random glassmorphism or excessive neon.

Prefer shared design tokens and consistent patterns when they reduce real inconsistency.

Do not perform a giant visual rewrite solely for cleanliness.

---

## 10. Responsive design is first-class

Changes must work on desktop, tablet and mobile.

At minimum, when relevant, think through:

- desktop around 1440×900;
- smaller desktop around 1280×720;
- tablet around 1024×768;
- phone portrait around 390–430 px;
- phone landscape around 932×430 or similar.

Support touch interactions.

Do not build desktop first and leave mobile as a compressed afterthought.

The site already has mobile-specific interaction patterns. Reuse them where appropriate.

---

## 11. Accessibility

Preserve or improve:

- semantic buttons/controls;
- keyboard navigation;
- visible focus;
- Enter/Space activation;
- Escape-to-close;
- modal focus trapping;
- ARIA labels/states;
- touch target size;
- readable contrast;
- reduced-motion behaviour where already supported.

Do not replace semantic controls with clickable `div` elements.

---

## 12. Saves and compatibility

Preserve existing user data wherever reasonably possible.

Do not wipe or invalidate:

- active Auctions;
- saved squads;
- Team Builder state;
- Daily records;
- Challenge records;
- settings;
- secret gating behaviour.

If a schema must change:

1. version it;
2. write a migration;
3. validate imported/stored data;
4. preserve valid old data;
5. reject malformed data safely.

Avoid placing unrelated systems into one giant localStorage object.

No account, backend or analytics system should be introduced unless the user explicitly requests it.

---

## 13. Routing and duplicated page shells

BL-Draft has had recurring bugs caused by fixing one route while another legacy/new shell still contained old behaviour.

For navigation/routing changes:

1. search all HTML shells;
2. search shared navigation code;
3. search router helpers;
4. search fallback/legacy pages;
5. search tests;
6. search cache-busting URLs;
7. verify no stale redirect remains.

If a legacy URL must remain, prefer a simple compatibility redirect into the canonical route rather than maintaining two active implementations.

Do not re-disable an enabled feature through an old fallback route.

### Battle Sim

Battle Sim is currently an **Early Access** feature.

Unless a task specifically targets Battle Sim:

- preserve its current working routes;
- preserve its Early Access state;
- do not redirect it back to a disabled page;
- do not spend unrelated work redesigning its engine.

---

## 14. Versioning and cache-busting

`js/version.js` is the visible release source.

When a release version changes, keep version references coherent across:

- visible version;
- asset query strings where the repository uses them;
- service worker/cache version where needed;
- changelog;
- release documentation.

When changing a widely cached script or stylesheet, inspect all page shells that load it. If the existing project uses query-string cache busting, update every relevant shell, not only the page you tested.

Do not leave a repository where the code is fixed but normal users still load stale assets.

---

Any edit to a cached file (versioned scripts/stylesheets, `js/players/*/player.js` and `reference.js`, `images/`, `fonts/`, `assets/`) needs a version bump with `node scripts/set-version.js <next-version>`; `scripts/release-manifest.json` makes `--check` and preflight fail otherwise. `--stamp` is only for a version that has not been pushed to `main`.

## 15. Product quality principles

Think from the player's perspective.

Prefer:

- clear decisions;
- meaningful strategy;
- replayability;
- useful feedback;
- quick comprehension;
- polished interactions;
- shareable outcomes;
- depth without clutter.

Avoid:

- fake systems;
- placeholder buttons;
- shallow reskins;
- unnecessary currencies;
- grind for its own sake;
- excessive popups;
- feature-count bloat;
- unreadable dashboards;
- tiny controls;
- technically impressive features that are not fun.

If implementing a mode or system, implement it end-to-end. Do not present unfinished UI as complete functionality.

---

## 16. Performance

BL-Draft should remain lightweight.

Watch for regressions in:

- startup;
- player loading;
- Database rendering;
- Auto Best;
- CPU planning;
- Daily/challenge generation;
- mobile scrolling;
- image/share generation.

Cache expensive pure calculations where useful.

Do not prematurely optimize trivial code or make correctness harder to understand for negligible gains.

---

## 17. Testing is required

Before declaring a code task complete, run the relevant existing test suite.

Primary release gate:

```bash
node scripts/preflight.js
```

The preflight currently includes or invokes:

- JavaScript syntax/integrity checks;
- localization integrity;
- localization source coverage;
- replayability tests;
- game-mode tests;
- solo-draft tests;
- balance tests;
- chemistry-balance tests;
- v0.7.3 and v0.7.4 regression suites (`scripts/v073-tests.js`, `scripts/v074-tests.js`);
- asset-reference integrity and the release fingerprint (`node scripts/set-version.js --check`).

The same gate runs in GitHub Actions (`.github/workflows/preflight.yml`). GitHub Pages deploys `main` independently of that workflow, so run the gate locally before pushing.

Inspect the current scripts before assuming this list is unchanged.

Add regression tests for meaningful bugs, especially recurring cross-site issues and single-source-of-truth failures.

For procedural content, test many seeds/dates rather than a single happy path.

For CPU/gameplay changes, use comparative seeded simulations where appropriate.

---

## 18. Browser testing and honesty

When browser automation is available, use it for important user flows and visual work.

When it is not available, do the strongest code/DOM/CSS audit possible.

Never claim:

- browser testing;
- mobile testing;
- visual verification;
- successful deployment;
- performance numbers;

unless you actually performed them.

Report limitations clearly.

---

## 19. Git discipline

The repository may have active collaborator work.

Rules:

- inspect latest `main` before editing;
- do not revert unrelated commits;
- do not force-push;
- do not rewrite history;
- do not push or create a PR unless the user explicitly asks;
- if the base branch changes during a long task, reconcile rather than overwriting;
- review the final diff for unrelated changes.

If the user explicitly asks for a push, use a normal non-force update and preserve concurrent work.

---

## 20. Finishing a task

Before saying a task is complete:

1. Re-read the user's request.
2. Review the diff.
3. Search for stale references to replaced behaviour.
4. Run relevant tests.
5. Check localization.
6. Check save compatibility if affected.
7. Check all relevant page shells/routes.
8. Perform browser/visual QA when available.
9. Verify no secret data leaked.
10. Report exactly what changed and what was actually tested.

For larger changes, include:

- product/UX summary;
- important architecture decisions;
- files changed;
- tests run and results;
- browser/device checks performed;
- migrations;
- known limitations.

---

## 21. Recurring BL-Draft lessons

These rules exist because the project has already encountered these failure modes:

### Cross-site fixes must be cross-site
Do not fix only one HTML shell or route.

### Shared data must not have shadow copies
Chemistry, roster totals and similar data must not be maintained in multiple conflicting places.

### Cache invalidation is part of a frontend fix
A corrected JS file is not enough if pages still request a stale version.

### "Works in code" is not the same as "works for the player"
Inspect the actual interaction and presentation.

### Protect recent collaborator work
Never assume an old prompt describes the latest repository.

### Tests should prevent recurrence
When a bug reveals a structural weakness, add a focused regression check rather than relying on memory.

---

## 22. Task-specific instructions still matter

This file defines the permanent BL-Draft quality bar.

A user's task may deliberately change one of these baselines—for example:

- advancing the manga cutoff;
- changing player ratings;
- redesigning secret-character behaviour;
- replacing a game mode;
- enabling Git writes;
- restructuring navigation.

When the user explicitly requests such a change, follow that task while preserving the rest of these project rules.

Do not use this file as a reason to ignore an explicit current instruction.
