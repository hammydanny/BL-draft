# Release checklist

Copy this list into the release notes or PR for each release and tick items only after
they were actually done. "Automated" items are enforced by `node scripts/preflight.js`
and the GitHub **Preflight** workflow; "Manual" items need a person (or a recorded
browser run) and must not be ticked from a code review alone.

## 1. Automated gate (must be green before any push to `main`)

- [ ] `node scripts/sync-shells.js --check` — 0 generated shells differ from `index.html`
- [ ] `node scripts/set-version.js --check` — 0 stale version references and 0 cached assets changed without a version bump
- [ ] `node scripts/preflight.js` — every suite PASS, 0 failed checks
- [ ] `git diff --check` — no whitespace errors
- [ ] GitHub **Preflight** workflow green on the pushed commit (Actions tab)

What the automated gate covers (do not re-tick manually): JavaScript syntax for every
project file; script order (`js/app.js` last); shell/redirect integrity; asset references
resolve to real files; release fingerprint; localization integrity and source coverage;
player data, secret-roster separation and chemistry source; Auction CPU behaviour and
Undo/Redo snapshots; Auto Best over all formations; share/export preserving formations;
Daily Ego Draft (365 dates, Locked Captain 14-pick regression), Daily Tactical (120
dates), 16 Draft Challenges solvable, Challenge Lab and Draft Duel codes rejecting
malformed/secret/forged input; Ego Record normalisation and achievements; Blue Lock Man
contracts; save normalisation for every storage key.

## 2. Version and caching

- [ ] `node scripts/set-version.js <new-version>` run for this release (writes `js/version.js`, every `?v=`, the character loader, the service-worker cache name and `scripts/release-manifest.json`)
- [ ] Changelog entry added in `changelog/index.html` and translated
- [ ] Release document `docs/release-v<version>.md` written
- [ ] Manual: after deploy, a browser that visited the previous version shows the new version label, new portraits and no stale script errors (normal reload, no cache clearing)

## 3. Localization (manual review on top of the automated gate)

- [ ] Every new/changed visible string, accessibility label and changelog note exists in all 11 languages (English, Malay, Japanese, Arabic, Simplified Chinese, French, German, Korean, Portuguese, Russian, Spanish)
- [ ] Manual: header fits at 1280/1440/1920 in German, Russian, French and Malay (dense/tight tiers, no hidden controls)
- [ ] Manual: Arabic reads RTL; pitch, formations, chemistry links and portraits are not mirrored

## 4. Modes (manual smoke test)

- [ ] Auction: setup → bidding, passing, quick bids, Undo/Redo → results → Team Builder; refresh mid-auction restores
- [ ] VS CPU: Easy, Normal and Hard complete; CPU squads valid
- [ ] Blue Lock Man toggle: locked in goal, cannot be benched/moved/sold, not counted in roster totals, image shows
- [ ] Random/Quick Draft completes
- [ ] Team Builder: dragging (mouse and touch), reserves, Captain, Auto Best, exact-formation share image
- [ ] Ego Board: Daily Ego Draft, Daily Tactical and Draft Duel cards show today's state
- [ ] Daily Ego Draft: complete a run; refresh mid-run resumes; result and record saved
- [ ] Daily Tactical Challenge: complete; grade shown; Ego Record updated
- [ ] Draft Duel: Easy/Normal/Hard; code copy and import; refresh mid-duel resumes
- [ ] Draft Challenges: open, complete and replay at least one per category
- [ ] Challenge Lab: create a code, copy, import it in a fresh tab; malformed code shows an error
- [ ] Ego Record: counts, favourites (no secret players) and achievements update
- [ ] Database: search, filters, dossiers; chemistry partners readable
- [ ] Battle Sim (Early Access): routes open; handoff from results works

## 5. Secret roster and code security

- [ ] Public counts exclude secret characters (Database, setup, Lore)
- [ ] Secret players hidden until `28032009` is typed in the session; hidden again in a new session
- [ ] Shared/imported codes that reference secret players do not reveal them without the unlock
- [ ] No secret names in share images, Ego Record favourites, Daily content or ARIA text while locked

## 6. Saves and compatibility

- [ ] Existing Auction, Team Builder, saved squads, Daily/Challenge/Duel records, Ego Record and settings restore after upgrade
- [ ] Settings → reset does not clear saves
- [ ] Malformed storage or blocked storage (private window) does not break page load

## 7. Navigation, layout and accessibility

- [ ] All routes load and refresh under `/BL-draft/`, including legacy `*.html` redirects
- [ ] Browser Back/Forward works across modes
- [ ] No console errors or failed network requests
- [ ] No broken images; neutral portrait fallback works
- [ ] Desktop: 1920×1080, 1440×900, 1280×720
- [ ] Tablet: 1024×768
- [ ] Phone: 390×844, 430×932, 932×430 landscape, 320 wide
- [ ] Dark, light and system themes; correct logo and favicon per theme; no theme/page flash
- [ ] Keyboard: Tab order, visible focus, Enter/Space, Escape closes dialogs, focus returns
- [ ] Reduced motion respected
- [ ] SFX setting persists between pages

## 8. Final review

- [ ] Diff reviewed: no unrelated player, rating, chemistry or gameplay changes
- [ ] No generated junk, screenshots or temporary files committed
- [ ] Pushed with a normal (non-force) fast-forward; remote SHA verified
- [ ] GitHub Pages "pages build and deployment" succeeded for the pushed SHA and the live site shows the new version
