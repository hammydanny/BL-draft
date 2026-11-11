# v0.8.8.1 — Roster & Balance

Prepared against `main` at `5e8aec3` (Syaafi's merged v0.8.8 work). Prepared as a patch release. The user has authorized committing and pushing this patch to main after validation.

## Content and balance

Seven secret players receive exactly the approved attribute/Base OVR changes. hdannyy loses GK eligibility; all other unspecified fields, portraits, secret IDs, descriptions and team histories remain unchanged. The public roster is now 80 players; the secret roster remains 10. Exum is appended as numeric ID 90, so existing IDs and saved references do not move.

| Player | Base OVR | OFF | SHO | PAS | DRI | SPD | DEF | GK | Calculated primary OVR |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Dada Silva | 95 | 99 | 99 | 88 | 93 | 96 | 74 | 63 | 95 |
| Pablo Cavasoz | 95 | 96 | 96 | 99 | 98 | 94 | 69 | 55 | 95 |
| Adam Blake | 96 | 100 | 100 | 92 | 95 | 96 | 70 | 59 | 96 |
| Leonardo Luna | 96 | 99 | 97 | 94 | 100 | 96 | 73 | 58 | 96 |

The existing `FW` role resolves to `CF` in the position-weighted formula. These attributes reach the approved OVR targets without changing weights, roles, chemistry or the shared rating model. Dada emphasizes attacking power and aerial finishing, Pablo accurate distribution and close control, Blake finishing and positioning, and Luna dribbling and attacking technique. There is no independent physicality stat in this schema; existing physical weapons remain the expression of that strength. All four retain their DEF/GK attributes. Julien Loki is unchanged.

Jon retains Base OVR **94**. His approved PAS 90 / OFF 95 / SPD 92 produce a rounded raw CM formula rating of **93**. The existing shared contribution model anchors a player's primary-position score to Base OVR, so a neutral-link primary CM contribution remains **94** before chemistry. These are distinct calculations; neither the formula nor unrelated attributes were changed to disguise the difference. Battle Sim keeps its current shared slot, chemistry, stamina, Flow and ability rules.

Only four authoritative pair overrides change:

- floppy_willy × jon: 65.
- hdannyy × floppy_willy: 92.
- Isagi × Shidou: 61, justified by conflicting finishing routes rather than personal hostility.
- Isagi × Chigiri: 93, reflecting their established runner/reader partnership and attacking deliveries.

No other pair or team-context score changes. Exum receives no newly invented teammate synergy; normal neutral chemistry applies where no existing relationship is established.

## Canon and writing

Supported coverage advances to 368. The independent latest-publication record is manually verified against the official released chapter. Publication automation remains unchanged.

Isagi, Shidou, Chigiri, Hiori and Karasu receive broader scouting profiles covering their established identity and current development. Existing weapons, IDs, positions and ratings are retained; four existing weapon descriptions are refined. No new named technique, numerical ability, quote, permanent tactical role or extra chemistry buff is inferred for them. Isagi's collaborator-authored Battle Sim ability configuration and every simulation engine rule are unchanged.

Exum is England U-20's number 13 defensive midfielder, with the exact proposed project attributes (Base 81; OFF 79, SHO 68, PAS 82, DRI 78, SPD 91, DEF 95, GK 39). The supplied profile is concise and his sole weapon is Man-Marking. His ratings are explicitly project estimates. The official introduction supports the name **Exum**, DMF, jersey and dueling/man-marking. “Igzam” is recorded internally as an unofficial alternate romanization, not exposed as a verified canon epithet. The portrait is a crop of the publisher's monochrome promotional panel, not generated art.

Permanent writing guidance is added to `CLAUDE.md`: integrate evidence proportionally, preserve established identity, avoid recency-heavy profiles, and keep chapter provenance separate from permanent scouting copy.

Dossier role-audit captions now show each actual audit boundary rather than a hardcoded 364. Older untouched dossiers retain their historical audit boundary; this does not falsely claim every role was newly re-audited. Coverage captions and all added/changed visible content have translations for the ten non-English languages. Arabic geometry is unchanged.

### Research provenance and limits

- Official English release: https://kmanga.kodansha.com/title/10008/episode/369435 — Chapter 368, *Path to Failure*, released November 10, 2026.
- Official Japanese release: https://pocket.shonenmagazine.com/title/00617/episode/446788 .
- Publisher introduction, name and portrait: https://x.com/KMANGA_KODANSHA/status/2120188483633377661 . The image was inspected: DMF, Exum, number 13, England's shape and the man-marking/dueling introduction are visible.
- Surrounding Chapter 365–368 play was cross-checked through English and Japanese chapter coverage, including https://www.aol.com/articles/blue-lock-chapter-365-chigiri-183500000.html , https://h-snufkin.com/bluelock-en/bluelock-chapter-367/ , https://www.sirolog.com/entry/2026/11/11/bluelock368/ , and https://noscriptneeded.com/blue-lock-chapter-368-recap-isagis-gamble/ .
- Full official-English reader access was unavailable. No new verbatim dialogue or quote is presented as independently verified. The profiles synthesize established source-backed traits; speculative names and fan theories are excluded.

## Integration

The classic loader, generated character bundle, player registry, reference registry, newcomer category, versioned shells, images and service-worker fingerprint are updated. No save schema, formation geometry, engine, Auction rule, secret gate or unlock code changes.

`roster-content-tests.js` pins all 89 pre-existing player objects against the latest-main baseline after excluding only explicitly authorized edits. It similarly pins all unaffected chemistry pairs and every context. It covers exact secret changes, World Five formula targets, Jon's independent ratings, Exum's stats/access, old/new squad codes, locked-secret imports, every formation and Battle Sim hydration.

Constructive test examples were updated: the new Isagi/Shidou score changes one chemistry layout; appending a public player changes a seeded limited-market pool. Twelve mini-draft offer witnesses were also regenerated and replayed to complete every slot with natural fits. Objectives and targets remain unchanged. Old Battle Sim tests now account for current effective speed passives, restart placement, notable-event RNG draws and Flow duration, and force a goal explicitly when testing presentation. These are test repairs against current main; no engine behavior was modified.

### Validation

- Localization integrity: 0 errors / 0 warnings.
- Localization coverage: 0 uncovered strings, 2,621 catalog entries.
- Targeted roster/content regression: passed.
- Deterministic character bundle: passed.
- Chapter tracker and boundary checks: passed.
- Game-mode regression: passed, including 60 CPU auctions and 180 deterministic dates.
- Optional DOM match: seed 42 reached full-time automatically, 30 stops, half-time, substitution, pause/resume and reload; score 3–4, 410 events. This is DOM validation, not browser layout testing.
- Full `node scripts/preflight.js`: **passed, exit 0**. This includes 267 completed Auction simulations (60 game-mode, 45 balance, 162 chemistry/CPU), 365 Daily dates, 120 tactical dates, 18 paired duels, 24 seeded Battle Sim save/restore matches and 12 deterministic presentation timelines.
- CPU difficulty comparison across 54 auctions each: mean Effective OVR Easy 79.639 < Normal 81.194 < Hard 82.337. All teams completed legally; the existing strength ordering is retained.
- All 12 mini-draft formations have replayed natural-fit completion witnesses (102 picks).
- Runtime localization calls for the coverage/audit captions passed in all 11 languages, including Arabic isolation around chapter numbers. This is automated text testing, not visual RTL verification.
- The roster/content baseline passed full preflight before the patch-version and navigation corrections. The combined patch is revalidated before publishing; final GitHub and browser status is reported in the delivery message.
- Real-browser attempt: Chromium could not launch because this execution environment rejects its singleton socket (`Operation not permitted`). No browser, responsive, visual RTL, or light/dark visual verification is claimed for this unpublished patch. No CSS geometry was changed.

The unchanged baseline `main` failed localization coverage on ten v0.8.7/v0.8.8 changelog strings. Their missing translations are included without altering the collaborator's original release text or behavior.

## Release-history and navigation corrections

- Restored the missing documented v0.8.2–v0.8.6 entries, assigned stable anchors and added grouped v0.8/v0.7 sidebar links to all their releases.
- Information pages now navigate by their canonical URL before touching game-only router or state functions. This covers desktop and mobile directory actions on Changelog, Privacy, Legal and 404 pages. A focused regression passed 120 real header targets across those four documents on root and subpath hosting without loading game globals. The existing game-page Battle Sim helper is preserved.
- The content and balance update uses v0.8.8.1, preserving v0.8.8 as the parent release.
