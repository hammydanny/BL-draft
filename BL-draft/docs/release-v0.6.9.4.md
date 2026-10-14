# Blue Lock Draft — V0.6.9.4 Alpha

UI and reference-content release based on main commit `637960085f4a05e31506544f092a79124ec2324c` (V0.6.9.3).

## Content

All 79 roster records were reviewed for quote/alias coverage. The collection has 32 verified English anime quote records and 52 sourced canon aliases. Michael Kaiser's Japanese quote was replaced with the verified English anime line. Quotes keep their existing description → quote → category placement and stay English in every interface language. Source metadata remains internal. Players without verified content render no placeholder.

Vivien Hugo has no added quote: suitable exact official English dialogue could not be independently verified. No fan translation or invented quotation was substituted.

## Interface

- Eleven static, local interface languages, ordered by English language name and displayed with native labels. Arabic uses RTL semantic layout while pitches, radar charts, portraits, position codes and numerical values keep their orientation.
- Matching self-hosted UI glyph subsets for Chinese, Korean, Arabic and extended Latin/Cyrillic, with full OFL license credits.
- Shared headers measure expanded translated navigation before choosing the existing compact menu. Controls and prose wrap without reducing type to fit.
- Blue CTA surfaces retain their solid background while gradients change. Border, glow and movement transitions remain.
- Syaafi’s latest five-piece background emblem and responsive `115vmin` sizing are preserved. Both mask declarations load the current emblem version. Secondary page headers keep Syaafi’s transparent background.
- Formation portraits are 60px on ordinary desktop, 66px on wide desktop, and 56–58px on phones. The image centre remains the slot coordinate. Superseded image sizing/scale rules were removed and label padding was consolidated. Fonts, pitch dimensions, coordinates and game logic are preserved.
- Existing How to Play, About, Settings, radar, grades and navigation implementations are reused.

## Compatibility and verification

Player ratings, IDs, positions, chemistry, formations, coordinates, Auction rules, budgets, bidding, Undo/Redo, Random/Quick Draft, save schemas/keys, Captain, dragging, Auto Best scoring/search and exact sharing retain the baseline implementations. Teddy Knight remains primary LW / secondary LM from the baseline.

Initial V0.6.9.4 validation performed using Node and real Chromium, before this small reconciliation with Syaafi’s changes:

- Every project JavaScript file: 33 syntax checks passed.
- Complete `node scripts/preflight.js`: PASS, 0 failed checks, including reference-data and complete locale/format validation.
- Protected gameplay modules compared byte for byte with the original baseline during the initial release validation.
- 1,080 rendered formation cases: both builders, all ten formations, both themes, normal/selected/SWAP states at 3440×1440, 2560×1440, 1920×1080, 1600×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844; zero collisions or overflow.
- 2,640 additional formation cases across all eleven locales at desktop/mobile widths; zero collisions or overflow.
- 616 major-route/theme/locale/viewport checks, including direct nested loading and the real custom 404; zero unexpected missing assets, script errors or overflow.
- 869 player-dossier cases (79 players × 11 locales) and all 52 alias searches passed. Canon names/quotes, six radar axes, numerical stats and grades remained correct.
- Live Auction language switching preserved the save exactly. Opening bids, bidding, pass, Undo/Redo, mouse dragging, Reserve deployment, Captain controls and Auto Best searching all ten formations passed.
- 440 sharing cases covered both builders, all ten formations, both themes and all eleven locales. User team names and exact lineup geometry were preserved.
- Mobile touch dragging, all nine header widths in eleven languages, existing information dialogs, Settings and Arabic carousel keyboard navigation passed.
- Six interaction states for 16 representative shared button/theme families passed, including rapid hover and blue surface stability. Representative desktop/mobile screenshots were inspected internally.

`git diff --check` and conflict-marker review passed. Nothing was committed, pushed or sent as a PR. The replacement archive contains complete changed/new files only, with repository-relative paths and no wrapper, models, dependencies, screenshots or test output.

## Syaafi reconciliation

Replacement files were merged onto main `637960085f4a05e31506544f092a79124ec2324c`. Transparent secondary headers, the new emblem asset and its responsive sizing are retained. Stylesheet and static-asset cache revisions prevent stale copies. The ZIP contains only differences from this newer main baseline.

Fresh reconciliation validation: all 33 project JavaScript syntax checks and full preflight passed with 0 failed checks. Real Chromium passed 440 route/locale/theme/viewport cases plus 24 active Auction/Results/Auction Builder cases at 1366px and 390px, with zero page errors or horizontal overflow. Transparent secondary headers, responsive emblem dimensions, revised cache URLs and header control bounds were checked. Existing How to Play opened and closed in every Auction case. Representative desktop and Arabic mobile views were inspected. All 13 protected gameplay/SVG files match latest main byte for byte. Archive extraction onto the latest main baseline passed the full preflight again.
