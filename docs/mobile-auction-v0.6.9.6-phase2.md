# v0.6.9.6 — Mobile overhaul, Phase 2

Source: latest main `90e0a232a849f4de973ddb7f450749c488256249`, which includes
Phase 1. Main was fetched before work and checked again before packaging.
Version remains 0.6.9.6. No commit, push, PR or remote branch update was made.

## Changes

### Primary Directory

The entire drawer panel is now the single vertical scroll container. Its heading
stays reachable; links and settings remain in the scroll flow. Wheel events and
touch swipes work over the panel, including its heading. The panel uses bounded
VisualViewport/dynamic viewport height, safe-area padding, contained overscroll,
touch momentum and keyboard Page Up/Down/Home/End support. Background scroll
locking, inert background content, Escape, close and outside-tap handling remain.
Pinch zoom remains available. Desktop nested navigation is retained; Phase 1's
flat mobile destinations are preserved.

### Legitimate high-resolution branding

The source audit found a 1254 × 1254 RGBA `images/bld-logo.png`. The previous
128px header WebP and SVG wrappers were raster-based; no genuine vector source
was available. The new 512 × 512 lossless WebP is downsampled from that original,
not enlarged from the small header file. The light SVG embeds the same new WebP
and retains the existing light-theme colour matrix. Intrinsic/CSS dimensions,
aspect ratio and theme switching are preserved; favicons are unchanged.

The new dark derivative is 124,730 bytes and is cached. Updated asset queries
ensure existing 0.6.9.6 installations request the new logo and Phase 2 code.
Both themes were checked at 3× device scale and 2× page zoom.

### Auction hierarchy and details

- Phones show the portrait, name, nationality, positions and OVR first. A tap
  opens the full-size radar and GK evaluation. New targets on portrait tablets
  show the radar by default, with the same collapse control.
- Compact team rows display name, colour, available budget, roster count,
  active/leading state and full/no-capital warnings. Expanded details reveal
  slots, economy warnings and compact portrait/name/position/OVR roster rows.
- History collapses to a count and heading. Expansion includes every recorded
  transfer, rather than only the six recent desktop entries. Desktop retains
  its six-row presentation. Detail panels scroll with the document.
- Tablet portrait uses a player/evaluation column beside team summaries.
  Landscape phones place player/details on the left and bid controls on the
  right. Legacy Auction `!important` rules that defeated the tablet grid and
  forced roster inner scrolling were removed from `style.css`; other systems'
  rules were retained.

### Fixed bidding controls

The existing action container becomes the mobile bid dock. It uses the existing
opening, Bid, Pass, buy/free-release, Sold and Next handlers and validation.
Current bid/holder, minimum, editable amount and quick increments remain clear.
The input and quick increments share a row when values fit; large increments
receive a full row so values are not broken across digits. Pass and Bid have
separate, stable touch targets. There is no global bottom bar competing for space.

ResizeObserver measures the dock for document bottom clearance. The existing
Phase 1 VisualViewport variables position it above reduced keyboard space.
Portrait keyboard-height changes do not switch the page into landscape columns.
Numeric fields retain number semantics and decimal input mode. Mobile turns do
not repeatedly force the keyboard open; desktop focus behaviour is retained.
Repeated touch submissions are guarded for 320ms, and repeated Enter keydown
events are ignored. Quick-increment buttons only edit the input.

### Coin, reveal and assignment

The larger mobile coin retains both team colours, the normal 2s flip animation,
2200ms result transition and 1400ms result display. GOES FIRST uses the existing
starting team. Tests prohibited a second random draw. Reduced-motion settings
remove the animation while retaining the real winner and feedback.

Portrait reveals emphasise artwork, name, nationality, positions and OVR;
landscape places portrait and identity side by side. Sold/Assigned states show
destination, price/free status and next action. Held automatic assignment keeps
Undo and Next reachable. Cinematic content has one internal scroller with the
background locked; normal bidding resumes without a second scroll trap.

### Localization, accessibility and performance

New presentation reuses existing localized labels in all 11 languages. Arabic
text reads RTL while teams, currency and actions keep predictable positions.
Safe areas, light/dark contrast, reduced motion, focus-visible, expanded states,
semantic controls and comfortable touch targets are preserved.

The same player's portrait and immutable evaluation remain mounted between
bids. One delegated detail handler and one dock observer avoid per-bid listener
growth. Existing portrait warming, lazy loading and fallback behaviour remain;
collapsed rosters/history do not demand new image-loading infrastructure.

## QA results

| Check | Result |
| --- | --- |
| Project preflight and localization integrity | PASS; zero failures/warnings |
| Directory scrolling and locked background | PASS; wheel, real emulated touch movements and keyboard |
| Logo source/quality | PASS; source audit, both themes, high DPI and page zoom |
| 320 × 568, 360 × 800, 390 × 844, 430 × 932 | PASS |
| 768 × 1024, 820 × 1180, 1024 × 768 | PASS |
| 844 × 390, 932 × 430 | PASS |
| Keyboard/bid controls | PASS in emulation; focused input, reduced height, bid and recovery |
| Coin/result/reveal | PASS; original winner/timing and reduced motion |
| Full-roster Undo/Redo and held reload | PASS |
| Zero-budget, free release and bid validation | PASS |
| Normal save/resume and secret-code resume guard | PASS |
| Quick Draft | PASS; 5v5 results and locked-secret exclusion |
| Arabic and long translations | PASS |
| Light and dark themes | PASS |
| Desktop Auction | PASS; 12 geometry comparisons at 1366/1920px, two themes and three states, plus visual review |
| Runtime/console | PASS; actual worker/cache run has zero warnings/errors |

Coverage includes 880 Auction state/layout combinations, 176 localized cinematic
checks, 37 detail/keyboard/rapid-touch cases, 26 drawer/HD-logo cases, six existing
Undo regression scenarios and a complete real-clock, button-driven mobile flow:

Setup → Coin → Goes First → Reveal → Opening Bid → Bid → Pass → Sold →
multiple players → Undo/Redo → full roster → automatic assignment →
Undo/Redo → held save/reload → completion → Results.

Additional checks cover missing-portrait fallback, safe-area token simulation,
new-asset worker caching, normal paid-bid resume and both teams at zero budget.

Limits: Chromium mobile/touch emulation was available. Physical phones/tablets,
Safari/WebKit, Firefox, real software keyboards and physical notches were not
available. Keyboard checks reduce available viewport height while operating a
focused input; they do not claim a physical iOS/Android IME test. Safe-area
checks use resolved CSS token simulation. Page zoom was emulated through CDP.

## Preserved scope

Player data, stats, aliases, demonstrated positions, chemistry, formations,
save normalization/keys, secret-character rules, deterministic queue and
Undo/Redo algorithms are unchanged. Auction logic changes only add presentation
markers and reveal evaluation markup. Results only clears the dock presentation
state. No Team Builder or Database redesign was started.

The delivery ZIP contains only Phase 2 changed/new repository-relative files,
including this note. It contains no complete repository, unchanged files,
dependencies, repository metadata, temporary QA scripts or screenshots.
