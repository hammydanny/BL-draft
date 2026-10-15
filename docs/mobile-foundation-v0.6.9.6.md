# v0.6.9.6 — Mobile overhaul, Phase 1

Built locally from latest GitHub main, `c2bb8ab0ef17dfdaae5b7816b0d3f37ac1501e23`,
fetched before implementation and checked again before packaging. No commit,
push, pull request or remote branch change was made for this phase.

## Shared shell

- A single compact header has the brand on the left, translated page context
  in the centre and a 44px menu control on the right. Tablets retain the full
  wordmark. The existing desktop header and its dropdowns remain in use when
  their actual translated content fits.
- A flat mobile drawer exposes the existing Home, Auction, Builder, Database,
  Quick Draft, Resume, Characters, Chemistry, How to Play, About, Changelog,
  Privacy and Legal destinations. Unavailable Resume stays hidden. The current
  section is highlighted. There are no nested mobile navigation menus.
- Theme, SFX and all 11 languages remain in the shared settings panel, reached
  from the drawer. Desktop retains its existing utility controls.
- No bottom navigation was added. The compact header and drawer provide access
  without taking the bottom area needed by future Auction controls.

## Responsive foundation

`css/mobile.css` loads once, after localization styles, on every HTML entry point.
The obsolete compact-header rules were removed from the earlier shared styles.
Page-specific Auction, pitch and database breakpoints are deliberately retained
for later phases rather than rewritten here.

| Content band | Page gutter | Shared header |
| --- | --- | --- |
| Below 360px | 10px | 56px; logo and page context |
| 360–479px | 12px | 56px |
| 480–767px | 16px | 56px |
| 768–1024px | 24px | 64px; full wordmark |
| Larger screens | Existing desktop gutter | Existing header; compact fallback if needed |

Short landscape viewports use a 52px compact header. Safe-area insets add only
the necessary device clearance. The drawer and settings panel have bounded,
independently scrollable content. Responsive heading sizes, less letter-spacing,
16px mobile form fields and comfortable global controls improve readability
without shrinking translated labels to fit.

## Dialogs, accessibility and continuity

- Shared dialogs preserve the document scroll offset, lock background touch
  scrolling and make background branches inert. Nested dialog locks remain
  active until the last dialog closes. Quick Draft uses this same lifecycle.
- Drawer close, outside tap, Escape, focus trapping, focus return and navigation
  dismissal work. Settings and information dialogs retain reachable close controls.
- `VisualViewport` supplies available height and vertical offset above software
  keyboards. Normal browser zoom/panning remains in control at zoomed scales.
  Dialogs use internal scrolling; the shared cinematic container avoids a
  second user-scrollable outer layer.
- `viewport-fit=cover` and all four safe-area tokens support notches and home
  indicators. No restrictive maximum scale or `user-scalable=no` was added.
- Arabic text reads RTL while physical header controls, pitch geometry and
  navigation placement remain predictable. All new drawer labels reuse the
  existing catalog. Release notes are translated into all supported languages.
- Existing reduced-motion support remains active, including the new drawer.
- Existing clean URLs, database filter/scroll return and portrait-loading/fallback
  architecture are preserved. New changelog CJK text fits the existing font subsets;
  no new fonts or image requests were introduced.
- Version labels, HTML asset queries and the static-asset cache now use 0.6.9.6.
  The previous 0.6.9.5 changelog entry is retained below the new release.

## Validation

| Check | Result |
| --- | --- |
| Project preflight and localization integrity | PASS; zero failed checks or localization warnings |
| 320 × 568, 360 × 800, 390 × 844, 430 × 932 | PASS |
| 768 × 1024, 820 × 1180, 1024 × 768 | PASS |
| 844 × 390 landscape | PASS |
| Arabic RTL; all 11 languages | PASS |
| Light and dark themes | PASS |
| Drawer/settings, touch targets, Escape, outside tap and focus return | PASS |
| Modal scrolling, reduced height, safe-area token simulation | PASS |
| Database Back preserves filter and scroll | PASS |
| Existing Auction Undo and held-assignment reload cases | PASS |
| Desktop at 1366px and 1920px | PASS; header/homepage geometry and viewport screenshots match baseline exactly in both themes |
| Console/runtime | PASS |

Browser checks used Chromium with mobile/touch emulation, not just a resized
desktop window. The layout matrix covered 1,188 combinations across six routes,
11 languages, two themes and nine viewport sizes, with no horizontal page overflow
or runtime errors. A further 88 cases exercised localized drawer/settings/modal
interactions. Additional checks covered safe areas, cinematic boundaries, actual
worker caching, missing-portrait fallback and six existing Auction regressions.

Hardware limitations: no physical phone/tablet, Safari/WebKit or Firefox was
available. Keyboard checks focused inputs and reduced available viewport height;
they did not operate a real iOS/Android software keyboard. Safe-area checks used
the resolved CSS tokens rather than a physical notch.

Core gameplay, ratings, chemistry, formations, aliases, demonstrated positions,
save normalization, portrait loader and router are unchanged from the baseline.
No Phase 2 Auction redesign or later Builder/Database redesign is included.

The delivery ZIP contains only changed/new repository-relative files, including
this review note. It contains no repository metadata, dependencies, screenshots,
temporary QA files or unchanged source files.
