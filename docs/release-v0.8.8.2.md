# v0.8.8.2 — Roster expansion

Eight public players are appended at IDs 91–98. The roster now has 88 public players and 10 secret characters. Existing IDs, player data, chemistry values, secret access rules and save schemas are preserved. Canon coverage remains chapter 368, the latest official English chapter verified on 11 November 2026: [K MANGA](https://kmanga.kodansha.com/title/10008/episode/369435). No future chapter listing or leak is treated as a released chapter.

## Ratings and positions

Individual attributes are conservative project estimates, labelled GAME ESTIMATES in the existing UI. They are not official manga statistics. Every addition uses the unchanged shared position weights and Effective OVR calculation. Birkenstock retains the manga’s recorded 86 evaluation as Base OVR; his estimated attributes produce 79 at CB. No goalkeeper or unrelated attribute is inflated to force those separate metrics to match.

| ID | Player | Gameplay position | Base | OFF | SHO | PAS | DRI | SPD | DEF | GK |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 91 | Akira Endoji | FW | 69 | 73 | 70 | 66 | 69 | 71 | 40 | 30 |
| 92 | Yukio Ishikari | FW | 72 | 79 | 78 | 69 | 64 | 64 | 62 | 35 |
| 93 | Birkenstock | CB | 86 | 73 | 66 | 79 | 73 | 82 | 90 | 45 |
| 94 | Erik Gesner | RW / RM | 81 | 82 | 78 | 84 | 88 | 81 | 55 | 36 |
| 95 | Ignacio Lara | LW | 78 | 80 | 77 | 80 | 80 | 82 | 49 | 32 |
| 96 | Ryo Nameoka | FW | 64 | 70 | 69 | 57 | 61 | 65 | 44 | 30 |
| 97 | Ringo Pondemizu | FW | 67 | 73 | 74 | 62 | 62 | 64 | 50 | 31 |
| 98 | Camus | RW | 82 | 82 | 78 | 80 | 83 | 91 | 66 | 35 |

FW stays a broad role, normalized by the existing system to CF for weighting. Gesner’s RW/RM eligibility is a gameplay interpretation; the demonstrated-role reference records the broader forward designation without claiming a newly verified specialist position.

## Evidence and limits

- [Endoji](https://bluelock.fandom.com/wiki/Akira_Endoji): chapter 93 debut, fourth clear team, Team C and Paris X Gen. Cheerful temperament and concern during conflict are retained; no distinctive football weapon is sufficiently documented.
- [Ishikari](https://bluelock.fandom.com/wiki/Yukio_Ishikari): chapter 1 debut, two-metre stature, vertical reach and headers. The aerial interception is cross-checked in [chapter 105](https://bluelock.fandom.com/wiki/Chapter_105). The introduction epithet “The Tallest High Schooler” is registered. The shirt number 13 refers to the selection stages, not an invented Ubers appearance.
- [Birkenstock](https://bluelock.fandom.com/wiki/Birkenstock): Bastard München’s number 6 centre-back. The 86 Base OVR is recorded in the [chapter 173 lineup](https://bluelock.fandom.com/wiki/Chapter_173). No speculative signature defending move or personality is added.
- [Gesner](https://bluelock.fandom.com/wiki/Erik_Gesner): Bastard München’s number 13, chapter 156 debut. Delicate control and lofted passing are grounded in the Barcha sequence around chapter 159. “Lofted Passing” describes an ordinary demonstrated skill, not a canon-named special move.
- [Lara](https://bluelock.fandom.com/wiki/Ignacio_Lara): FC Barcha’s number 9 left winger, chapter 158 debut; combination play and an assist against Manshine City. Generic winger archetype text is not promoted into a personal signature weapon.
- [Nameoka](https://movie.bluelock-pr.com/): official Episode Nagi film profile confirms the English name RYO NAMEOKA, captaincy, powerful build and arrogance. [Manga reference](https://bluelock.fandom.com/wiki/Ryo_Nameoka) records Episode Nagi chapter 1 and main-series chapter 327 separately. Main-series chronology remains 327; the spin-off debut stays in metadata.
- [Pondemizu](https://www.bluelockarchive.com/characters/ringo-pondemizu): Side-B forward, chapter 327 debut. Header strength is supported by his individualized heading prohibition in chapter 363, cross-checked against the [Japanese chapter account](https://www.hellominju.com/2026/09/BlueLock363.html). No jersey, personality, advanced aerial technique or extra epithet is invented.
- [Camus](https://bluelock.fandom.com/wiki/Camus): France U-20 number 7 right winger, chapter 330 debut. Chapter 332 supports pace and opponent preparation; chapter 343 supports coordinated decoy movement. The latter is integrated in his profile rather than inflated into a new signature weapon.

Research used indexed manga references, chapter accounts and the official film profile; full official-English readers and the existing subtitle source were unavailable. No new verified dialogue quotation is claimed. Quote fields remain empty rather than silently substituting fan translations. No unsupported aliases are coined. Club membership alone does not establish nationality, so Birkenstock, Gesner and Lara have no new nationality flag.

Team histories describe historical memberships, with registered teammates where verified. They do not create numerical chemistry bonuses or alter existing contexts. All new descriptions, weapons, epithet, team labels and release copy use the existing 11-language catalog. Arabic text uses the existing RTL handling; pitch geometry is unchanged. Original monochrome manga portraits are local WebP files with per-character attribution records.

## Integration and validation

The shared loader, player registry, reference registry, pool categories and generated character bundle include all eight additions. Cache/version metadata and the existing grouped changelog advance to the small patch 0.8.8.2. No mode engine or rating formula changes.

The expansion regression covers public access, secret gating, precise skill boundaries, unknown nationality, all new-player squad/Auction/Battle save round-trips, every formation and runtime translation resolution in all 11 languages. A new exact snapshot protects all 90 pre-existing player objects in addition to the earlier approved-change baseline. Seeded test completion paths are regenerated for the expanded public pool; production rules and objective thresholds stay unchanged.

The original `node scripts/preflight.js` run passed its content, localization, replayability, game-mode, solo-draft and balance stages before an interruption during chemistry simulations. The resumed chemistry suite passed all 162 paired auctions. A subsequent six-seed-per-format Draft Duel comparison placed Hard 0.22 strength below Normal; the strict ordering assertion is retained while the sample is expanded to 18 seeds per format (54 paired duels per difficulty), including every original seed. No production difficulty behavior is changed. The expanded comparison passed with Easy 86.25 < Normal 88.06 < Hard 88.09. This is a seeded regression sample, not a claim of statistically significant separation. All remaining release-gate stages then passed, including v0.7.4 cross-mode/storage checks, protected roster data, expansion checks, navigation, Battle Sim state/spatial/presentation/refinement and chapter-tracker regressions. Final localization integrity and coverage checks reported zero errors, warnings or uncovered strings. Version/fingerprint and deterministic-bundle checks passed, and `git diff --check` is clean. The original whole-gate process did not complete in one invocation; all constituent checks were completed in the resumed runs.

Additional DOM checks rendered all eight dossiers and cards across 11 locale contexts (88 of each), checked source links and secret leakage, and completed two Battle Sim matches with pause, substitutions and save/reload. The expanded-roster match ended 1–2 after 397 events and 18 sequence stops. These are DOM/state tests. Local browser layout and paint have not been verified; portrait crops have been inspected directly.
