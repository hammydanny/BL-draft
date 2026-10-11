# V0.6.9.1 player reference audit

Baseline: latest `origin/main` commit `2fb9dfdd09330f3fb91f061466e6feeaa743b33f`, fetched before editing. Audit date: 11 October 2026. The existing 79 player identities, ratings, attributes, positions, images, descriptions and order are preserved. Reference additions do not affect gameplay.

| Coverage | Count |
| --- | ---: |
| Players individually audited | 79 |
| Players with football weapons | 66 |
| Players intentionally without verified weapons | 13 |
| Individual weapon records | 108 |
| Players with a verified short quote | 5 |
| Players without a selected verified quote | 74 |
| Players with confirmed nationality or national-team representation | 78 |
| Players with unconfirmed nationality | 1 |
| Local country/representation flags | 9 |

## Evidence and limits

Weapons use official character descriptions where available, alongside indexed canon references and identified match recaps for later characters. Each weapon stores its source type, URL and a verification note. Secondary references are identified as such; they are not presented as publisher confirmations. Exact weapon chapter numbers are omitted rather than guessed. Football specialties are individualized, and ratings or position badges are never used as evidence for one. Isagi's seven existing weapon records keep their original IDs, names, descriptions and Battle Sim placeholders; only source metadata was appended.

Every character was checked individually for quote candidates, including exact-name searches and the corresponding available character/reference material. A featured Wiki quote was not accepted as verification. Five brief English anime subtitle excerpts were checked in timestamped third-party archival transcripts of Crunchyroll captions, with speaker context; Isagi also has a separately archived subtitle-track corroboration. This was transcript verification, not direct streamed-episode viewing. The other 74 have no selected independently verified excerpt; this does not claim those characters never speak in canon. No dialogue was invented, paraphrased into a quote, or assigned a guessed chapter.

Nationality records explicitly distinguish recorded nationality from national-team representation. Japanese selection eligibility or the original Japan U-20 roster supports the Japan records. Foreign national/U-20 team representation supports the other applicable records. Club membership, names, appearance and language are not used as evidence. England is represented with ISO parent code `GB`, country name `United Kingdom`, explicit `representation: "England"`, and the England flag/label. This is a football representation record, not a citizenship claim. Marc Snuffy remains `nationality: null`: reviewed secondary sources conflict between Malta and Italy, and his Ubers affiliation cannot resolve nationality.

## Verified quote source records

The text itself is retained only in `js/player-reference.js`; this report does not duplicate the excerpts. The UI attributes the character and shows the anime episode.

| Player ID | Character | Episode | Timestamp | Verification reference |
| ---: | --- | ---: | --- | --- |
| 1 | Yoichi Isagi | 1 | 13:04 | [English caption transcript](https://subs.yakuaru.com/books/blue-lock/page/e1-dream) |
| 6 | Rensuke Kunigami | 4 | 05:53 | [English caption transcript](https://subs.yakuaru.com/books/blue-lock/page/e4-premonition-and-intuition) |
| 10 | Asahi Naruhaya | 4 | 00:20 | [English caption transcript](https://subs.yakuaru.com/books/blue-lock/page/e4-premonition-and-intuition) |
| 11 | Okuhito Iemon | 4 | 00:25 | [English caption transcript](https://subs.yakuaru.com/books/blue-lock/page/e4-premonition-and-intuition) |
| 21 | Seishiro Nagi | 7 | 20:25 | [English caption transcript](https://subs.yakuaru.com/books/blue-lock/page/e7-rush) |

[Isagi subtitle-track corroboration](https://gist.github.com/wraith4081/b8d99fb3c8d633678dbbd008ce55a8ee).

## All-player audit

W = weapon reference; N = nationality or representation reference. A source link is retained even when the audit did not justify adding a weapon. The quote column records a selected verified excerpt, not all possible dialogue.

| ID | Player | Recorded football weapons | Nationality / representation | Quote | Sources |
| ---: | --- | --- | --- | --- | --- |
| 1 | Yoichi Isagi | Metavision; Awareness; Adaptability; Off-the-Ball Movements; Direct Shot; Two-Gun Volley; Reverse Back Heel Shot | Japan | Anime EP. 1 | [W](https://bluelock.fandom.com/wiki/Yoichi_Isagi) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 2 | Ryosuke Kira | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Ryosuke_Kira) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 3 | Noel Noa | Ambidexterity; Ball Control | France | None selected | [W](https://bluelock.fandom.com/wiki/Noel_Noa) / [N](https://bluelock.fandom.com/wiki/Noel_Noa) |
| 4 | Meguru Bachira | Creative Dribbling | Japan | None selected | [W](https://bluelock-kc.com/characters/bachira/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 5 | Gurimu Igarashi | Malicia | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Gurimu_Igarashi) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 6 | Rensuke Kunigami | Physical Strength; Left-Footed Long-Range Shot | Japan | Anime EP. 4 | [W](https://bluelock-kc.com/characters/kunigami/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 7 | Hyoma Chigiri | Top Speed; Golden Zone Shot | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Hyoma_Chigiri) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 8 | Gin Gagamaru | Acrobatic Body Control; Goalkeeping Reflexes | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Gin_Gagamaru) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 9 | Jingo Raichi | Stamina; Man-Marking | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Jingo_Raichi) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 10 | Asahi Naruhaya | Off-the-Ball Movement | Japan | Anime EP. 4 | [W](https://bluelock.fandom.com/wiki/Asahi_Naruhaya) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 11 | Okuhito Iemon | Versatility | Japan | Anime EP. 4 | [W](https://subs.yakuaru.com/books/blue-lock/page/e4-premonition-and-intuition) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 12 | Wataru Kuon | Jumping Power | Japan | None selected | [W](https://tv.bluelock-pr.com/tv1st/character/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 13 | Yudai Imamura | Speed and Technique | Japan | None selected | [W](https://tv.bluelock-pr.com/tv1st/character/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 14 | Sae Itoshi | Precision Passing; Counter Dribbling | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Sae_Itoshi) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 15 | Shoei Baro | Middle-Range Shooting; Chop Dribble; Predator Eye | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Shoei_Baro) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 16 | Ikki Niko | Field Awareness; Metavision | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Ikki_Niko) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 17 | Hibiki Okawa | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Hibiki_Okawa) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 18 | Junichi Wanima | Twin Combination Play | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Junichi_Wanima) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 19 | Keisuke Wanima | Twin Combination Play | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Keisuke_Wanima) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 20 | Reo Mikage | Copy; Passing; Metavision | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Reo_Mikage) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 21 | Seishiro Nagi | Trapping | Japan | Anime EP. 7 | [W](https://bluelock-kc.com/characters/nagi/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 22 | Zantetsu Tsurugi | Explosive Acceleration; Left-Footed Shooting | Japan | None selected | [W](https://tv.bluelock-pr.com/tv1st/news/211/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 23 | Rin Itoshi | Kicking Accuracy; Field Control; Destructive Duels | Japan | None selected | [W](https://bluelock-kc.com/characters/rin/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 24 | Jyubei Aryu | Aerial Reach | Japan | None selected | [W](https://bluelock-anime-en.com/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 25 | Aoshi Tokimitsu | Physical Strength; Stamina | Japan | None selected | [W](https://bluelock-anime-en.com/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 26 | Ranze Kurona | Short-Pass Combination; Quick Turning | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Ranze_Kurona) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 27 | Yo Hiori | Precision Passing; Metavision | Japan | None selected | [W](https://bluelock-anime-en.com/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 28 | Tabito Karasu | Opponent Analysis; Handwork and Ball Protection | Japan | None selected | [W](https://bluelock-kc.com/characters/karasu/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 29 | Eita Otoya | Off-the-Ball Movement | Japan | None selected | [W](https://tv.bluelock-pr.com/tv1st/news/1844/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 30 | Kenyu Yukimiya | One-on-One Dribbling; Gyro Shot | Japan | None selected | [W](https://bluelock-anime-en.com/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 31 | Ryusei Shido | Penalty-Area Awareness; Acrobatic Finishing | Japan | None selected | [W](https://bluelock-kc.com/characters/shidou/) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 32 | Nijiro Nanase | Ambidexterity | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Nijiro_Nanase) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 33 | Jin Kiyora | Body Balance; Backspin Ground Pass | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Jin_Kiyora) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 34 | Leonardo Luna | Dribbling | Spain | None selected | [W](https://bluelock.fandom.com/wiki/Leonardo_Luna) / [N](https://bluelock.fandom.com/wiki/Leonardo_Luna) |
| 35 | Pablo Cavasoz | Kicking Accuracy | Argentina | None selected | [W](https://bluelock.fandom.com/wiki/Pablo_Cavasoz) / [N](https://bluelock.fandom.com/wiki/Pablo_Cavasoz) |
| 36 | Adam Blake | Physical Strength | England | None selected | [W](https://bluelock.fandom.com/wiki/Adam_Blake) / [N](https://bluelock.fandom.com/wiki/Adam_Blake) |
| 37 | Dada Silva | Aerial Power | Brazil | None selected | [W](https://bluelock.fandom.com/wiki/Dada_Silva) / [N](https://bluelock.fandom.com/wiki/Dada_Silva) |
| 38 | Julien Loki | Godspeed | France | None selected | [W](https://tv.bluelock-pr.com/tv1st/news/1844/) / [N](https://bluelock.fandom.com/wiki/Julien_Loki) |
| 39 | Gen Fukaku | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Gen_Fukaku) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 40 | Oliver Aiku | Defensive Anticipation; Physical Defending; Metavision | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Oliver_Aiku) / [N](https://bluelock-kc.com/characters/aiku/) |
| 41 | Kazuma Nio | Physical Duels | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Kazuma_Nio) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 42 | Miroku Darai | Off-the-Ball Defence | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Miroku_Darai) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 43 | Teppei Neru | Explosive Acceleration | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Teppei_Neru) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 44 | Itsuki Wakatsuki | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Itsuki_Wakatsuki) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 45 | Haru Hayate | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Haru_Hayate) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 46 | Kento Cho | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Kento_Cho) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 47 | Teru Kitsunezato | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Teru_Kitsunezato) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 48 | Shuto Sendo | Off-the-Ball Finishing | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Shuto_Sendo) / [N](https://bluelock.fandom.com/wiki/Japan_U-20) |
| 49 | Michael Kaiser | Kaiser Impact; Kaiser Impact Magnus; Metavision | Germany | None selected | [W](https://bluelock.fandom.com/wiki/Michael_Kaiser) / [N](https://bluelock.fandom.com/wiki/Michael_Kaiser) |
| 50 | Alexis Ness | Flexible-Ankle Dribbling; Passing | Germany | None selected | [W](https://bluelock.fandom.com/wiki/Alexis_Ness) / [N](https://bluelock.fandom.com/wiki/Alexis_Ness) |
| 51 | Benedict Grim | Power Dribbling | Germany | None selected | [W](https://bluelock.fandom.com/wiki/Benedict_Grim) / [N](https://bluelock.fandom.com/wiki/Benedict_Grim) |
| 52 | Lavinho | Ginga Dribbling | Brazil | None selected | [W](https://bluelock.fandom.com/wiki/Lavinho) / [N](https://bluelock.fandom.com/wiki/Lavinho) |
| 53 | Chris Prince | Physical Conditioning; Knuckleball | England | None selected | [W](https://bluelock.fandom.com/wiki/Chris_Prince) / [N](https://bluelock.fandom.com/wiki/Chris_Prince) |
| 54 | Agi | Aerial Reach | England | None selected | [W](https://bluelock.fandom.com/wiki/Agi) / [N](https://bluelock.fandom.com/wiki/Agi) |
| 55 | Marc Snuffy | Tactical Planning; Ball Retention; Metavision | Unconfirmed | None selected | [W](https://bluelock.fandom.com/wiki/Marc_Snuffy) |
| 56 | Don Lorenzo | Ace Marking; Unorthodox Dribbling | Italy | None selected | [W](https://bluelock.fandom.com/wiki/Don_Lorenzo) / [N](https://bluelock.fandom.com/wiki/Don_Lorenzo) |
| 57 | Charles Chevalier | Precision Passing; Metavision | France | None selected | [W](https://bluelock.fandom.com/wiki/Charles_Chevalier) / [N](https://bluelock.fandom.com/wiki/Charles_Chevalier) |
| 58 | Rooke | None registered | England | None selected | [W](https://bluelock.fandom.com/wiki/Rooke) / [N](https://bluelock.fandom.com/wiki/Rooke) |
| 59 | Renoir | Goalkeeping Reactions | France | None selected | [W](https://bluelock.fandom.com/wiki/Renoir) / [N](https://bluelock.fandom.com/wiki/Renoir) |
| 60 | Haneru Shindo | Jumping Power | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Haneru_Shindo) / [N](https://bluelock.fandom.com/wiki/Haneru_Shindo) |
| 61 | Bunny Iglesias | Aerial Finishing | Spain | None selected | [W](https://bluelock.fandom.com/wiki/Bunny_Iglesias) / [N](https://bluelock.fandom.com/wiki/Bunny_Iglesias) |
| 62 | Innocent Onazi | Sustained Mobility | Nigeria | None selected | [W](https://bluelock.fandom.com/wiki/Innocent_Onazi) / [N](https://bluelock.fandom.com/wiki/Innocent_Onazi) |
| 63 | Godwin Kuso | Dribbling; Calculated Passing | Nigeria | None selected | [W](https://bluelock.fandom.com/wiki/Godwin_Kuso) / [N](https://bluelock.fandom.com/wiki/Godwin_Kuso) |
| 64 | Vivien Hugo | Game Reading; Long Passing | France | None selected | [W](https://bluelock.fandom.com/wiki/Vivian_Hugo) / [N](https://bluelock.fandom.com/wiki/Vivian_Hugo) |
| 65 | Achanpong | Attacking Distribution | England | None selected | [W](https://areajugones.sport.es/anime/el-capitulo-362-de-blue-lock-se-filtra-antes-de-tiempo-y-presenta-un-epico-cliffhanger-con-isagi-y-ego/) / [N](https://bluelock.fandom.com/wiki/England_U-20) |
| 66 | Lockhart | Aerial Finishing | England | None selected | [W](https://www.aol.ca/articles/blue-lock-chapter-360-lockharts-183500000.html) / [N](https://bluelock.fandom.com/wiki/England_U-20) |
| 67 | Teddy Knight | Cut-In Dribbling | England | None selected | [W](https://www.animeexplained.com/spoilers/teddy-knight-outpaces-blue-lock-blue-lock-chapter-353-spoilers/) / [N](https://bluelock.fandom.com/wiki/England_U-20) |
| 68 | Childs | None registered | England | None selected | [W](https://bluelock.fandom.com/wiki/Childs) / [N](https://bluelock.fandom.com/wiki/England_U-20) |
| 69 | Shigeo Mizuki | Persistent Running | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Shigeo_Mizuki) / [N](https://bluelock.fandom.com/wiki/Shigeo_Mizuki) |
| 70 | Hajime Nishioka | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Hajime_Nishioka) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 71 | Shizuka Haiji | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Shizuka_Haiji) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 72 | Reiji Hiiragi | Trapping; Play Prediction | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Reiji_Hiiragi) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 73 | Taiga Tsunzaki | None registered | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Taiga_Tsunzaki) / [N](https://kodansha.us/series/blue-lock/volume-1/) |
| 74 | Oboabona | Aerial Defending | Nigeria | None selected | [W](https://bluelock.fandom.com/wiki/Oboabona) / [N](https://bluelock.fandom.com/wiki/Oboabona) |
| 75 | Bello | Quick-Tempo Dribbling | Nigeria | None selected | [W](https://bluelock.fandom.com/wiki/Bello) / [N](https://bluelock.fandom.com/wiki/Bello) |
| 76 | Bats | Physical Pressure | France | None selected | [W](https://bluelock.fandom.com/wiki/Bats) / [N](https://bluelock.fandom.com/wiki/Bats) |
| 77 | Leyden | Speed; Deceptive Delivery | France | None selected | [W](https://bluelock.fandom.com/wiki/Leyden) / [N](https://bluelock.fandom.com/wiki/Leyden) |
| 78 | Hermes | None registered | France | None selected | [W](https://bluelock.fandom.com/wiki/Hermes) / [N](https://bluelock.fandom.com/wiki/Hermes) |
| 79 | Aiki Himizu | Feints; Reading Deception | Japan | None selected | [W](https://bluelock.fandom.com/wiki/Aiki_Himizu) / [N](https://kodansha.us/series/blue-lock/volume-1/) |

## Intentional zero-weapon records

| ID | Player | Audit reason |
| ---: | --- | --- |
| 2 | Ryosuke Kira | Reputation and scoring appearances do not establish a distinctive repeatable specialty in the reviewed material. |
| 17 | Hibiki Okawa | Ace/scorer status alone was not used to invent a separate weapon. |
| 39 | Gen Fukaku | Goalkeeper role and ordinary saves do not establish a distinctive specialist strength here. |
| 44 | Itsuki Wakatsuki | Support and defensive-midfielder duties were not promoted into an unsupported named specialty. |
| 45 | Haru Hayate | Midfield circulation and support do not establish a distinctive documented weapon. |
| 46 | Kento Cho | Attacking role and isolated service were not used to invent a specialty. |
| 47 | Teru Kitsunezato | Wide attacking duties alone do not establish a distinctive weapon. |
| 58 | Rooke | Reviewed record lists goalkeeper role but no clearly identified specialist weapon. |
| 68 | Childs | Supporting runs and shots inside England’s system do not establish a distinct repeatable specialty. |
| 70 | Hajime Nishioka | Aomori’s Messi is a nickname, not evidence for copying Messi’s abilities. |
| 71 | Shizuka Haiji | Reviewed material records selection/team history without a distinctive demonstrated weapon. |
| 73 | Taiga Tsunzaki | Reviewed material records selection/team history without a distinctive demonstrated weapon. |
| 78 | Hermes | An aerial contest alone was not promoted into a separate notable strength. |

## Runtime and validation boundaries

Weapons retain `{ id, name, description, battleSimType, battleSimDescription, source }`. Battle Sim values remain `TBD` and the existing safe placeholder description; they are not displayed and do not create simulation effects.

Quotes use `{ playerId, text, verified, sourceType, episode/chapter, timestamp, sourceReference, sourceNote }`, with optional corroboration. `verified === true`, a non-empty exact excerpt, a valid numeric episode/chapter, a supported source type and source metadata are required to render. Missing quotes are valid. Duplicate text, malformed supplied chapter/episode values, empty objects and unverified records fail validation.

Nationality is one optional object: `{ code, name, basis, source, representation? }`. The shared country registry validates code/name/representation and the existence of its local flag. Null is valid and produces no empty identity box. Nine unmodified MIT-licensed `lipis/flag-icons` SVGs are included locally; source and licence are in `images/flags/README.md` and `images/flags/LICENSE-flag-icons.txt`.
