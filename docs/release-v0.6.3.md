# Blue Lock Draft — V0.6.3 ALPHA

Source: `/workspace/scratch/a0666f0614cb/BL-draft-v062`, detached HEAD `b809a9064795ccbcd77bd2836eb16968a25d5f61` **plus all local v0.6.2 work present at task start**. The starting filesystem, not Git HEAD, defines this patch. No reset, commit, push or PR occurred.

## Presets and navigation

The category checkboxes represented actual selected members, but their old toggle logic deferred to the union of enabled categories. Overlapping groups therefore kept players selected and a first click could appear to do nothing. Explicit category clicks now select/remove exactly that category’s members. Other overlapping groups show partial states. Manual toggles, Select All, Clear All and Invert remain available. Styling and dimensions are unchanged; Side-B is added using the same control.

| Preset | Members |
| --- | ---: |
| blue-lock-project | 36 |
| original-u20 | 12 |
| world-five | 5 |
| master-strikers | 5 |
| new-gen-11 | 6 |
| nel-foreign | 13 |
| japan-world-cup | 23 |
| world-cup-new | 13 |
| side-b | 9 |

Mapping corrections include the five additional original Blue Lock survivors, five new U-20 internationals and nine playable Side-B participants. Loki remains in World Five/Master Strikers/NEL and is removed from New Generation XI. Rooke and Renoir belong to the NEL cast, so they are not classified as first-introduced World Cup newcomers. Haneru moves from World Cup newcomers to Side-B.

Every HTML entry starts behind a CSS initialization gate until its canonical route and saved state are ready. Navigation starts before altering the outgoing page’s screen or header. Directory-root Main Menu loads avoid an unnecessary redirect. Back/Forward restoration clears stale navigation guards. Scroll-to-top is immediate, and the duplicate deferred Results scroll is removed. The multi-page architecture, direct links, refresh, legacy URL migration, root hosting and `/BL-draft/` remain supported.

## Header system and How to Play

All nine major screens share a 1540px maximum header width, 112px desktop height, 180px mobile/tablet height at 900px and below, fixed 56×56 logos, common title/control sizing, divider and spacing. Headers start at y=18 on desktop and y=12 on mobile. The original Main Menu hero remains below its new shared header. Fonts are self-hosted using the same families; two critical font files are preloaded.

How to Play retains the existing modal, styling and v0.6.2 visibility rules: Main Menu, Setup and active Auction only. Eight short steps cover settings, auction openings, bidding/passing, budgets/full-roster/free-signing states, formation building, positions/chemistry, all-ten-formation Auto Best and Results/sharing. One brief paragraph explains Undo/Redo, partial squads, standalone mode and local saves.

CSS changes edit the existing header/layout sections. Superseded narrow-screen padding declarations and page-specific desktop Auction header padding are removed. No new override appendix or new `!important` declarations were added. The existing radar stylesheet is unchanged.

## New players and estimated ratings

All eight values are **game balancing estimates**, not official manga statistics. Every value is below 90. No speculative secondary positions are added.

| ID | Player | Primary / positions | OVR | OFF | SHO | SPD | DEF | PAS | DRI | GK | Debut chapter |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 69 | Shigeo Mizuki | FW / FW | 69 | 70 | 63 | 76 | 62 | 66 | 64 | 39 | 311 |
| 70 | Hajime Nishioka | FW / FW | 76 | 78 | 74 | 78 | 49 | 74 | 80 | 35 | 1 |
| 71 | Shizuka Haiji | FW / FW | 68 | 69 | 67 | 70 | 48 | 67 | 69 | 35 | 93 |
| 72 | Reiji Hiiragi | FW / FW | 80 | 82 | 77 | 72 | 57 | 79 | 85 | 38 | 93 |
| 73 | Taiga Tsunzaki | FW / FW | 68 | 70 | 68 | 72 | 47 | 65 | 68 | 34 | 93 |
| 74 | Oboabona | CB / CB | 81 | 55 | 58 | 74 | 86 | 67 | 61 | 48 | 312 |
| 75 | Bello | RM / RM | 81 | 77 | 72 | 82 | 58 | 75 | 86 | 34 | 312 |
| 76 | Bats | DM / DM | 84 | 64 | 58 | 74 | 88 | 76 | 68 | 48 | 330 |
| 77 | Leyden | LW / LW | 85 | 80 | 78 | 89 | 57 | 80 | 82 | 33 | 330 |
| 78 | Hermes | CB / CB | 82 | 53 | 50 | 75 | 85 | 73 | 63 | 44 | 330 |
| 79 | Aiki Himizu | FW / FW | 77 | 77 | 70 | 78 | 64 | 73 | 83 | 37 | 93 |

The shared existing S/A/B/C/D/E/F/G helper remains the only production grading function. Six radar axes remain SPD, DEF, PAS, DRI, SHO and OFF; GK stays separate. Numbers and grades are retained. New profiles and radar headings identify the estimates.

## Canon references

Scope is canon available through chapter 364. These are chapter-linked Blue Lock Wiki profiles and their character-history/selection synopses, cross-checked against one another. Episode Nagi supports the relevant Hiiragi/Himizu techniques. Primary official manga pages were not fully accessible, so this report does not claim a complete direct reading of the official chapters. Unknown weapons and secondary roles are left unspecified.

| Player | Reference and facts used |
| --- | --- |
| Shigeo Mizuki | [Shigeo Mizuki profile](https://bluelock.fandom.com/wiki/Shigeo_Mizuki) — Side-B forward; stamina; screen appearance 311, full introduction 327. |
| Hajime Nishioka | [Hajime Nishioka profile](https://bluelock.fandom.com/wiki/Hajime_Nishioka) — Aomori’s Messi; Blue Lock forward, Manshine City and Side-B; distinct weapon not specifically demonstrated. |
| Shizuka Haiji | [Shizuka Haiji profile](https://bluelock.fandom.com/wiki/Shizuka_Haiji) — Blue Lock forward; fourth clear team, Third Selection A3, Barcha; selection jersey 19; weapon not specifically demonstrated. |
| Reiji Hiiragi | [Reiji Hiiragi profile](https://bluelock.fandom.com/wiki/Reiji_Hiiragi) — Forward; trapping and prediction in Episode Nagi; selection jersey 22, Manshine 17; later Side-B. |
| Taiga Tsunzaki | [Taiga Tsunzaki profile](https://bluelock.fandom.com/wiki/Taiga_Tsunzaki) — Forward; fourth clear team, Third Selection C2, Manshine reserve; selection jersey 100; weapon not specifically demonstrated. |
| Oboabona | [Oboabona profile](https://bluelock.fandom.com/wiki/Oboabona) — Nigeria U-20 centre-back, jersey 8; headers and vertical leap. |
| Bello | [Bello profile](https://bluelock.fandom.com/wiki/Bello) — Nigeria U-20 right midfielder, jersey 11; dribbling against Bachira. |
| Bats | [Bats profile](https://bluelock.fandom.com/wiki/Bats) — France U-20 defensive midfielder, jersey 5; physique and physical defensive play. |
| Leyden | [Leyden profile](https://bluelock.fandom.com/wiki/Leyden) — France U-20 left winger, jersey 8; demonstrated speed against Chigiri. |
| Hermes | [Hermes profile](https://bluelock.fandom.com/wiki/Hermes) — France U-20 centre-back, jersey 2; aerial contest with Reo; no established named weapon. |
| Aiki Himizu | [Aiki Himizu profile](https://bluelock.fandom.com/wiki/Aiki_Himizu) — Forward; Karasu’s Second Selection group, Third Selection C2, Barcha and Side-B; feints, reading deception and pressing in Episode Nagi; selection jersey 77. |

Additional selection-history cross-checks: [Nishioka synopsis](https://bluelock.fandom.com/wiki/Hajime_Nishioka/Synopsis), [Haiji synopsis](https://bluelock.fandom.com/wiki/Shizuka_Haiji/Synopsis), [Hiiragi synopsis](https://bluelock.fandom.com/wiki/Reiji_Hiiragi/Synopsis), [Tsunzaki synopsis](https://bluelock.fandom.com/wiki/Taiga_Tsunzaki/Synopsis), [Himizu synopsis](https://bluelock.fandom.com/wiki/Aiki_Himizu/Synopsis), [Team A](https://bluelock.fandom.com/wiki/Team_A), [Team B](https://bluelock.fandom.com/wiki/Team_B).

Rooke history: [Rooke profile](https://bluelock.fandom.com/wiki/Rooke), Manshine U-20 goalkeeper in chapter 173 and later England U-20 goalkeeper, #1 in both roles. Existing GK position and all ratings remain unchanged. Manshine context and NEL preset membership are corrected; existing England context remains.

Later England chronology cross-checks use [chapter 352 review](https://www.animeexplained.com/spoilers/england-challenges-blue-lock-to-lose-blue-lock-chapter-352-spoilers/), [chapter 359 review](https://www.aol.com/articles/blue-lock-chapter-359-lockhart-183500000.html), and the chapter-355 references in [Achanpong profile](https://bluelockdle.com/characters/achanpong-blue-lock/) and [Childs profile](https://bluelockdle.com/characters/childs-blue-lock/). The latter references support chronology only; their unsupported/generated ability descriptions are not used.

## Chemistry and chronology

Side-B membership is cross-checked against the [Side-B roster](https://bluelock.fandom.com/wiki/Side-B), including returning playable members Nagi, Kira, Keisuke Wanima and Hibiki Okawa; their existing ratings and positions are unchanged.

Existing named special pairs and chemistry calculation code are byte-identical. Existing context scores and members are preserved. Extensions add Himizu to Karasu’s unit; Haiji/Himizu to Barcha; Rooke/Nishioka/Hiiragi/Tsunzaki to Manshine; Oboabona/Bello to Nigeria; and Bats/Leyden/Hermes to France. No new special pair is invented.

| New ordinary context | Score | Playable members |
| --- | ---: | --- |
| SECOND SELECTION // BARO-NARUHAYA-NISHIOKA | 78 | Shoei Baro, Asahi Naruhaya, Hajime Nishioka |
| SECOND SELECTION // HIIRAGI-NIKO-ZANTETSU | 79 | Reiji Hiiragi, Ikki Niko, Zantetsu Tsurugi |
| SECOND SELECTION // FOURTH CLEAR TEAM | 79 | Nijiro Nanase, Shizuka Haiji, Reiji Hiiragi, Taiga Tsunzaki |
| SECOND SELECTION // FIFTH CLEAR TEAM | 79 | Ikki Niko, Yo Hiori, Hajime Nishioka |
| THIRD SELECTION // A3 | 80 | Rin Itoshi, Ryusei Shido, Meguru Bachira, Shizuka Haiji, Hajime Nishioka |
| THIRD SELECTION // B3 | 80 | Tabito Karasu, Eita Otoya, Reiji Hiiragi |
| THIRD SELECTION // C2 | 79 | Kenyu Yukimiya, Seishiro Nagi, Taiga Tsunzaki, Aiki Himizu |
| SIDE-B | 70 | Seishiro Nagi, Ryosuke Kira, Haneru Shindo, Hajime Nishioka, Shigeo Mizuki, Reiji Hiiragi, Aiki Himizu, Keisuke Wanima, Hibiki Okawa |

The game now has 30 contexts and the original 81 special pairs. New membership can change derived chemistry where the requested canonical shared histories apply; algorithm weights and original pair scores are unchanged.

All 79 records carry `debutChapter` and stable `appearanceOrder`. UI lists sort copies through one comparator; the original 68 IDs, underlying gameplay-array order and positions are preserved. Fresh Auction pool, Character Database and standalone pool use manga appearance order. Existing saved sort choices are retained. Same-chapter ties preserve stable ID order. Partial/screen/silhouette debuts are recorded with full-introduction notes where relevant.

| ID | Player | Manga debut | Note / source |
| ---: | --- | ---: | --- |
| 1 | Yoichi Isagi | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Yoichi_Isagi) |
| 2 | Ryosuke Kira | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Ryosuke_Kira) |
| 3 | Noel Noa | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Noel_Noa) |
| 4 | Meguru Bachira | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Meguru_Bachira) |
| 5 | Gurimu Igarashi | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Gurimu_Igarashi) |
| 6 | Rensuke Kunigami | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Rensuke_Kunigami) |
| 7 | Hyoma Chigiri | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Hyoma_Chigiri) |
| 8 | Gin Gagamaru | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Gin_Gagamaru) |
| 9 | Jingo Raichi | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Jingo_Raichi) |
| 10 | Asahi Naruhaya | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Asahi_Naruhaya) |
| 11 | Okuhito Iemon | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Okuhito_Iemon) |
| 12 | Wataru Kuon | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Wataru_Kuon) |
| 13 | Yudai Imamura | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Yudai_Imamura) |
| 16 | Ikki Niko | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Ikki_Niko) |
| 17 | Hibiki Okawa | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Hibiki_Okawa) |
| 18 | Junichi Wanima | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Junichi_Wanima) |
| 19 | Keisuke Wanima | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Keisuke_Wanima) |
| 20 | Reo Mikage | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Reo_Mikage) |
| 22 | Zantetsu Tsurugi | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Zantetsu_Tsurugi) |
| 24 | Jyubei Aryu | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Jyubei_Aryu) |
| 25 | Aoshi Tokimitsu | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Aoshi_Tokimitsu) |
| 70 | Hajime Nishioka | 1 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Hajime_Nishioka) |
| 14 | Sae Itoshi | 4 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Sae_Itoshi) |
| 15 | Shoei Baro | 5 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Shoei_Baro) |
| 21 | Seishiro Nagi | 22 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Seishiro_Nagi) |
| 23 | Rin Itoshi | 40 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Rin_Itoshi) |
| 34 | Leonardo Luna | 87 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Leonardo_Luna) |
| 35 | Pablo Cavasoz | 87 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Pablo_Cavasoz) |
| 36 | Adam Blake | 87 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Adam_Blake) |
| 37 | Dada Silva | 87 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Dada_Silva) |
| 38 | Julien Loki | 87 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Julien_Loki) |
| 31 | Ryusei Shido | 88 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Ryusei_Shido) |
| 26 | Ranze Kurona | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Ranze_Kurona) |
| 27 | Yo Hiori | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Yo_Hiori) |
| 28 | Tabito Karasu | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Tabito_Karasu) |
| 29 | Eita Otoya | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Eita_Otoya) |
| 30 | Kenyu Yukimiya | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Kenyu_Yukimiya) |
| 32 | Nijiro Nanase | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Nijiro_Nanase) |
| 33 | Jin Kiyora | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Jin_Kiyora) |
| 71 | Shizuka Haiji | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Shizuka_Haiji) |
| 72 | Reiji Hiiragi | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Reiji_Hiiragi) |
| 73 | Taiga Tsunzaki | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Taiga_Tsunzaki) |
| 79 | Aiki Himizu | 93 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Aiki_Himizu) |
| 40 | Oliver Aiku | 110 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Oliver_Aiku) |
| 41 | Kazuma Nio | 110 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Kazuma_Nio) |
| 42 | Miroku Darai | 110 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Miroku_Darai) |
| 43 | Teppei Neru | 110 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Teppei_Neru) |
| 48 | Shuto Sendo | 110 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Shuto_Sendo) |
| 39 | Gen Fukaku | 112 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Gen_Fukaku) |
| 44 | Itsuki Wakatsuki | 112 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Itsuki_Wakatsuki) |
| 45 | Haru Hayate | 112 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Haru_Hayate) |
| 46 | Kento Cho | 112 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Kento_Cho) |
| 47 | Teru Kitsunezato | 112 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Teru_Kitsunezato) |
| 49 | Michael Kaiser | 149 | Partial appearance; full introduction in chapter 156; [reference](https://bluelock.fandom.com/wiki/Michael_Kaiser) |
| 50 | Alexis Ness | 154 | Silhouette; full introduction in chapter 156; [reference](https://bluelock.fandom.com/wiki/Alexis_Ness) |
| 52 | Lavinho | 155 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Lavinho) |
| 53 | Chris Prince | 155 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Chris_Prince) |
| 55 | Marc Snuffy | 155 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Marc_Snuffy) |
| 51 | Benedict Grim | 156 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Benedict_Grim) |
| 54 | Agi | 169 | Silhouette; full introduction in chapter 173; [reference](https://bluelock.fandom.com/wiki/Agi) |
| 58 | Rooke | 173 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Rooke) |
| 56 | Don Lorenzo | 209 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Don_Lorenzo) |
| 57 | Charles Chevalier | 244 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Charles_Chevalier) |
| 59 | Renoir | 248 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Renoir) |
| 61 | Bunny Iglesias | 307 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Bunny%20Iglesias) |
| 69 | Shigeo Mizuki | 311 | Screen appearance; full introduction in chapter 327; [reference](https://bluelock.fandom.com/wiki/Shigeo_Mizuki) |
| 62 | Innocent Onazi | 312 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Innocent_Onazi) |
| 63 | Godwin Kuso | 312 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Godwin_Kuso) |
| 74 | Oboabona | 312 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Oboabona) |
| 75 | Bello | 312 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Bello) |
| 64 | Vivien Hugo | 326 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Hugo) |
| 60 | Haneru Shindo | 327 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Shindo_Haneru) |
| 76 | Bats | 330 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Bats) |
| 77 | Leyden | 330 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Leyden) |
| 78 | Hermes | 330 | Stable chapter tie order; [reference](https://bluelock.fandom.com/wiki/Hermes) |
| 67 | Teddy Knight | 352 | Stable chapter tie order; [reference](https://www.animeexplained.com/spoilers/england-challenges-blue-lock-to-lose-blue-lock-chapter-352-spoilers/) |
| 65 | Achanpong | 355 | Stable chapter tie order; [reference](https://bluelockdle.com/characters/achanpong-blue-lock/) |
| 68 | Childs | 355 | Stable chapter tie order; [reference](https://bluelockdle.com/characters/childs-blue-lock/) |
| 66 | Lockhart | 359 | Stable chapter tie order; [reference](https://www.aol.com/articles/blue-lock-chapter-359-lockhart-183500000.html) |

## Existing-player corrections and saves

- Junichi Wanima: OVR 73; Keisuke: OVR 72, unchanged. Other attributes unchanged.
- Innocent Onazi: OVR exactly 89; other attributes and Godwin Kuso unchanged.
- Rooke: GK, OVR 88; all attributes unchanged. Manshine-before-England history and memberships corrected.
- Teddy Knight remains primary LW, secondary LM; lore now agrees with the existing positions.
- John Paccini was already absent from the starting playable data, contexts, pairs, lore, references and assets. The final audit confirms absence; no existing record or asset required deletion. Missing historic IDs are handled generically rather than inventing an undocumented former ID.

Storage keys remain `blAuctionSaveV2` and `blStandaloneBuilderV1`; schema versions and save writers are unchanged. Legacy/current known-player saves pass restoration and reload tests. Normalization safely drops missing IDs from rosters, remaining/selected pools, histories, undo/redo snapshots, assignments and captains without mutating input or refunding/changing recorded budgets. A removed current auction target advances to a valid next target. Current valid formations and players remain intact.

## Loading and measurements

Portrait URLs remain stable. Current Auction and visible pitch/sidebar images load eagerly with dimensions and async decoding; only the critical Auction target receives high fetch priority. Visible database/pool portraits are promoted to eager loading after batched geometry reads. Offscreen cards/reserves retain native lazy loading. The decoded-image cache is bounded at eight. Only the drawn next target is decoded during the existing reveal interval, with no additional random draw, reorder or delay. The browser test confirms exactly one RNG draw and a decoded target before the evaluation appears.

Twelve oversized portraits were actually PNG data despite `.jpg` filenames. They are now high-quality JPEGs at the same intrinsic dimensions and crop: **29,571,216 → 8,375,213 bytes (71.7% less)**. New portraits use WebP. The original favicon/logo asset remains unchanged; a small separate header logo is used.

| Controlled local Chromium measurement | Before | After |
| --- | --- | --- |
| Cached Character Database re-render median, 15 runs | 0.1ms / 68 cards | 0.3ms / 79 cards |
| Cached Chemistry Database re-render median, 15 runs | Below 0.1ms timer resolution / 103 entries | Below 0.1ms timer resolution / 111 entries |
| 1366px Main Menu initialization CLS | 0.5933 | 0 |
| 1366px Setup initialization CLS | 1.0 | 0 |
| Header y position at 1366px | varied by screen | 18px for all nine |
| Header logo dimensions | no consistent shared logo | 56×56 for all nine |

The existing cached database nodes remain in use; re-render measurements do not establish a speedup and grow slightly with extra cards/visibility checks. Layout-shift and asset-size measurements are local lab results, not a real-network/device benchmark. Final header geometry is identical at each tested viewport. Small residual content/font shifts remain below 0.02 in the sampled loads. Native lazy loading requests only a nearby subset, not all 79 portraits.

## Validation and preservation

- `node scripts/preflight.js`: PASS, 24 checks, 0 failed.
- Independent `node --check` validation: all 20 project JavaScript files pass.
- Real Chromium 153 / Playwright: 1920×1080, 1366×768 and 390×844.
- Core regression: bidding, pass, opening controls, zero budgets, forced free signing, natural completion, Random Draft, Undo/Redo, resume, direct URLs, refresh, Back/Forward, subdirectory/root hosting, legacy URLs, filters and all grades.
- Detailed new-feature suite: every preset’s first click/overlap/manual/All/Clear/Invert behavior; all eleven new searchable players and decoded portraits; new Chemistry Database context entries; all nine header/logo dimensions; missing-ID legacy saves; selected-target warming and RNG count; delayed initialization on all seven HTML URLs.
- Builder checks: all ten formations, centered tokens, chemistry-line endpoints, reserves, captain, all-formations Auto Best and exact sharing. Mouse and actual touch input verify edge scrolling, swaps and cleanup on pointer cancellation, lost capture, blur, pagehide, visibility changes and secondary buttons.
- Screenshots inspected at desktop and mobile sizes; no horizontal page overflow or missing local assets/browser errors.
- Full semantic/byte comparison confirms original Auto Best search/scoring, formation definitions/coordinates, dragging, captain, chemistry algorithm, position-adjusted OVR and sharing remain unchanged. Bidding/budgets/bid intervals/Random Draft/Undo/Redo logic is unchanged.
- Central version is 0.6.3; HTML asset cache values are consistent; favicon remains `0.6.1.3`.

Remaining optional visual review: portrait crops and typography on a physical phone/Safari. Testing used Chromium, not every browser/device. No unresolved functional failure was found.

## Exact modified/new files

Only files differing from the task-start SHA-256 snapshot are in the ZIP. Earlier v0.6.2 dirty files that this release did not change are excluded. No temporary tests, scripts, node_modules, Git files, installers or unchanged images are packaged.

```text
auction/results.html
auction/room.html
auction/setup.html
auction/team-builder.html
css/site-header.css
docs/release-v0.6.3.md
fonts/LICENSE-Barlow-Condensed.txt
fonts/LICENSE-Rajdhani.txt
fonts/barlow-condensed-latin-500-normal.woff2
fonts/barlow-condensed-latin-600-normal.woff2
fonts/barlow-condensed-latin-700-normal.woff2
fonts/barlow-condensed-latin-800-italic.woff2
fonts/barlow-condensed-latin-800-normal.woff2
fonts/barlow-condensed-latin-900-normal.woff2
fonts/rajdhani-latin-500-normal.woff2
fonts/rajdhani-latin-600-normal.woff2
fonts/rajdhani-latin-700-normal.woff2
images/adam-blake.jpg
images/aiki-himizu.webp
images/bats.webp
images/bello.webp
images/benedict-grim.jpg
images/bld-logo-header.webp
images/chris-prince.jpg
images/dada-silva.jpg
images/eita-otoya.jpg
images/gin-gagamaru.jpg
images/hajime-nishioka.webp
images/hermes.webp
images/kazuma-nio.jpg
images/lavinho.jpg
images/leonardo-luna.jpg
images/leyden.webp
images/oboabona.webp
images/oliver-aiku.jpg
images/reiji-hiiragi.webp
images/renoir.jpg
images/shigeo-mizuki.webp
images/shizuka-haiji.webp
images/taiga-tsunzaki.webp
images/yo-hiori.jpg
index.html
js/app.js
js/auction.js
js/chemistry.js
js/formations.js
js/lore.js
js/players.js
js/preflight.js
js/results.js
js/router.js
js/standalone-builder.js
js/state.js
js/storage.js
js/ui/auction-ui.js
js/ui/formation-ui.js
js/ui/menu.js
js/ui/player-stats.js
js/ui/setup.js
js/version.js
lore.html
style.css
team-builder.html
```

Total: 63 modified/new files. **Deleted files: none.**

GitHub was kept read-only. No commit, push, PR or remote modification occurred.
