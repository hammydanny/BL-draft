# v0.6.9.5 follow-up content audit

Canon cutoff: chapter 364. Original task base: `bac57a1c0723d22e752cf49056ae799e444accf5`.
Collaborator integration: `a12abbc8f3a00e344ca82cbc7f29aa22b316a336` (including search, project characters and session-only unlock behavior). Ratings, gameplay positions, chemistry and formations are retained from that latest main.

## Method and limits

All 79 canon roster entries were reviewed against their current reference provenance, official character material, match lineups and chapter-specific candidates. Existing 84 alias records are retained verbatim. An empty alias field means no additional alias was sufficiently verified in this pass; it is not proof that no nickname has ever been used.

Demonstrated roles live only in `PLAYER_PROFILE_METADATA.canonPositions`. Each listed deployment has a source link and, for manga entries, a chapter. The gameplay `players[].positions` and primary position were not changed. The audit records 98 distinct player/position pairs for 68 players, including 80 newly recorded pairs. Eleven players retain no precise verified deployment; their gameplay badges, bids, selection/club membership and loosely interpreted small-sided actions were not converted into canon evidence. These unresolved outcomes are deliberately visible in the Database. The two collaborator-added project characters remain separate from canon and have no invented manga deployments.

Position terminology: RSB/LSB → RB/LB, DMF → DM, OMF → AM, CMF → CM, RWG/LWG → RW/LW. Generic FW is used only where the reference confirms an attacking deployment but not a specialist eleven-a-side slot. A single representative source is displayed per distinct position; this is a sourced role record, not a claim to reproduce every match of a player's career.

## Alias additions

| Player | Display alias | Evidence |
| --- | --- | --- |
| Lockhart | Iron Man | Ch.359 Japanese introduction panel inspected: 鉄人兵 with アイアンマン ruby. [Chapter](https://s.kmanga.kodansha.com/ldg?e=367879&t=10008); [panel reference](https://h-snufkin.com/bluelock-episode359/). The ruby resolves the competing Iron Soldier translation. |
| Innocent Onazi | Luminous | Ch.317 Kuso's actual address, 希望の光（ルミナス）, corroborated in [dialogue transcription](https://www.hellominju.com/2025/09/BlueLock317.html) and [illustrated reference](https://h-snufkin.com/bluelock-character-profile-onazi/). [Official chapter](https://kmanga.kodansha.com/title/10008/episode/360911). |
| Vivien Hugo | Butterfly Lashes | Reo's ch.341 address, corroborated by [chapter transcription](https://www.scribd.com/document/1026211439/341), [independent contemporary report](https://bluelock.fandom.com/f/p/4400000000000802856) and [Japanese discussion](https://note.com/sawj74405990/n/nb07bac15af87). [Official chapter identity](https://kmanga.kodansha.com/title/10008/episode/363939). A complete Japanese dialogue panel was not retrievable; this addition relies on corroborated secondary dialogue evidence. Lashy-Boy is a translation variant of the same nickname, not a second distinct alias. |
| Teddy Knight | Rainbow Knight | [Official ch.356 title](https://kmanga.kodansha.com/title/10008/episode/367369), corroborated as Teddy's moniker by [chapter recap](https://otakukart.com/blue-lock-chapter-356-spoilers-summary/) and [illustrated recap](https://amcanime.com/blue-lock-356-spoilers-rainbow-knight/). Worthless Puppet retained. |
| Reo Mikage | King-of-All-Trades | Ch.106 / anime 28 self-designation. The licensed distributor [ABEMA](https://times.abema.tv/articles/-/10054915) quotes 器用大富豪; [chapter synopsis](https://bluelock.fandom.com/wiki/Chapter_106) corroborates the English rendering. Chameleon retained. |
| Junichi / Keisuke Wanima | Double Aces of Rajitsu Tech | Shared title in the ch.19 school flashback, not a solo title. [Official chapter identity](https://pocket.shonenmagazine.com/title/00617/episode/237642), [chapter synopsis](https://bluelock.fandom.com/wiki/Chapter_19) and [character history](https://bluelock.fandom.com/wiki/Keisuke_Wanima/Synopsis). Recorded for both twins. |

Bunny’s ch.307 on-field introduction panel was inspected and explicitly labels him FW; no specialist slot was inferred. His aliases were checked separately: his given name, jumping ability and NGXI membership were not treated as an additional alias. Hugo's philosophy was not converted into a title. Suggested Shark for Kurona and the childhood Mushroom lead for Nanase were not added without stronger primary corroboration. Minor foreign players (Rooke, Renoir, Kuso, Achanpong, Childs, Oboabona, Bello, Bats, Leyden and Hermes) retain no fabricated epithets. All new titles are localized in the ten non-English locales. Team Builder aliases remain hidden.

## Principal deployment references

- [ABEMA: exhibition lineups and substitutions](https://times.abema.tv/articles/-/10149578) and their linked licensed anime clips.
- Noa's named [ch.173 lineup](https://www.hellominju.com/2025/04/BlueLock173.html), [ch.209 lineup](https://www.hellominju.com/2025/02/BlueLock209.html), and explicit [ch.192 DM declaration](https://www.hellominju.com/2025/03/BlueLock192.html).
- [Ch.211 Lorenzo/Niko role exchange](https://bluelock.fandom.com/wiki/Chapter_211); [ch.249 mixed PXG / Bastard formations](https://bluelock.fandom.com/wiki/Chapter_249); [Snuffy DM deployment](https://www.devdiscourse.com/article/entertainment/2504094-blue-lock-chapter-223-release-date-time-and-prediction).
- Manga lineup panels inspected for [Japan](https://h-snufkin.com/bluelock-u20worldcup-japan-player-result/), [France](https://h-snufkin.com/bluelock-u20worldcup-france-player-result/) and the [Japan–England 4–1–4–1](https://h-snufkin.com/bluelock-en/manga-chapter-354/). [England roster](https://h-snufkin.com/bluelock-u20worldcup-england-player-summary/) and [Lockhart's direct substitution](https://h-snufkin.com/bluelock-episode359/).
- [Nigeria deployments](https://h-snufkin.com/bluelock-u20worldcup-nigeria-player-result/); [Kunigami's World Cup DM deployment](https://www.animeexplained.com/spoilers/blue-lock-chapter-341-spoilers/).
- [Licensed first-season match guide](https://www.crunchyroll.com/news/guides/2024/10/5/all-blue-lock-season-1-matches-goals), official [character profiles](https://tv.bluelock-pr.com/tv1st/character/) and [World Five introduction](https://tv.bluelock-pr.com/tv1st/news/1844/). Specialist slots are not inferred from five-a-side participation alone.

## All-player review outcomes

Every row retains existing valid aliases. Position source links and unresolved-evidence notes are stored with the corresponding profile. This table lists unique position abbreviations, not game eligibility.

| ID | Player | Verified role record | Alias review outcome |
| --- | --- | --- | --- |
| 1 | Yoichi Isagi | AM / RM / CF / CM | Retained 6; no further verified addition |
| 2 | Ryosuke Kira | FW | Retained 3; no further verified addition |
| 3 | Noel Noa | DM / CF | Retained 2; no further verified addition |
| 4 | Meguru Bachira | LB / CF / LM | Retained 3; no further verified addition |
| 5 | Gurimu Igarashi | RB | Retained 1; no further verified addition |
| 6 | Rensuke Kunigami | CF / DM / FW | Retained 3; no further verified addition |
| 7 | Hyoma Chigiri | RB / LW / RW / FW / CF | Retained 3; no further verified addition |
| 8 | Gin Gagamaru | GK / FW | Retained 3; no further verified addition |
| 9 | Jingo Raichi | DM | Retained 1; no further verified addition |
| 10 | Asahi Naruhaya | Unresolved — no position fabricated | No sufficiently verified additional alias |
| 11 | Okuhito Iemon | GK | No sufficiently verified additional alias |
| 12 | Wataru Kuon | CF | No sufficiently verified additional alias |
| 13 | Yudai Imamura | Unresolved — no position fabricated | No sufficiently verified additional alias |
| 14 | Sae Itoshi | AM / FW | Retained 2; no further verified addition |
| 15 | Shoei Baro | RW / CF | Retained 4; no further verified addition |
| 16 | Ikki Niko | CB / DM | Retained 1; no further verified addition |
| 17 | Hibiki Okawa | CF | Retained 1; no further verified addition |
| 18 | Junichi Wanima | Unresolved — no position fabricated | Added verified title; retained existing |
| 19 | Keisuke Wanima | Unresolved — no position fabricated | Added verified title; retained existing |
| 20 | Reo Mikage | CB / CM / RM / RB | Added verified title; retained existing |
| 21 | Seishiro Nagi | AM / RW | Retained 2; no further verified addition |
| 22 | Zantetsu Tsurugi | RW / RM | Retained 2; no further verified addition |
| 23 | Rin Itoshi | CF | Retained 4; no further verified addition |
| 24 | Jyubei Aryu | CB | Retained 1; no further verified addition |
| 25 | Aoshi Tokimitsu | CM | Retained 1; no further verified addition |
| 26 | Ranze Kurona | RB | No sufficiently verified additional alias |
| 27 | Yo Hiori | RB / LB / RW / CM | Retained 2; no further verified addition |
| 28 | Tabito Karasu | DM / CB | Retained 1; no further verified addition |
| 29 | Eita Otoya | RW | Retained 1; no further verified addition |
| 30 | Kenyu Yukimiya | LW / LB / LM | Retained 3; no further verified addition |
| 31 | Ryusei Shido | CF | Retained 4; no further verified addition |
| 32 | Nijiro Nanase | LW | No sufficiently verified additional alias |
| 33 | Jin Kiyora | LB | Retained 1; no further verified addition |
| 34 | Leonardo Luna | FW | Retained 1; no further verified addition |
| 35 | Pablo Cavasoz | FW | Retained 1; no further verified addition |
| 36 | Adam Blake | FW | Retained 1; no further verified addition |
| 37 | Dada Silva | FW | Retained 1; no further verified addition |
| 38 | Julien Loki | CF | Retained 2; no further verified addition |
| 39 | Gen Fukaku | GK | No sufficiently verified additional alias |
| 40 | Oliver Aiku | CB / FW | No sufficiently verified additional alias |
| 41 | Kazuma Nio | CB | Retained 1; no further verified addition |
| 42 | Miroku Darai | LB | No sufficiently verified additional alias |
| 43 | Teppei Neru | RB | No sufficiently verified additional alias |
| 44 | Itsuki Wakatsuki | DM | No sufficiently verified additional alias |
| 45 | Haru Hayate | DM | No sufficiently verified additional alias |
| 46 | Kento Cho | LW | Retained 1; no further verified addition |
| 47 | Teru Kitsunezato | RW | No sufficiently verified additional alias |
| 48 | Shuto Sendo | CF / AM | Retained 1; no further verified addition |
| 49 | Michael Kaiser | CF | Retained 3; no further verified addition |
| 50 | Alexis Ness | AM | Retained 2; no further verified addition |
| 51 | Benedict Grim | LM | No sufficiently verified additional alias |
| 52 | Lavinho | CF | Retained 1; no further verified addition |
| 53 | Chris Prince | CF | Retained 1; no further verified addition |
| 54 | Agi | CF | Retained 1; no further verified addition |
| 55 | Marc Snuffy | DM | Retained 4; no further verified addition |
| 56 | Don Lorenzo | CB / CM | Retained 2; no further verified addition |
| 57 | Charles Chevalier | AM | Retained 1; no further verified addition |
| 58 | Rooke | GK | No sufficiently verified additional alias |
| 59 | Renoir | GK | No sufficiently verified additional alias |
| 60 | Haneru Shindo | Unresolved — no position fabricated | No sufficiently verified additional alias |
| 61 | Bunny Iglesias | FW | No sufficiently verified additional alias |
| 62 | Innocent Onazi | CF | Added verified title; retained existing |
| 63 | Godwin Kuso | AM | No sufficiently verified additional alias |
| 64 | Vivien Hugo | CM | Added verified title; retained existing |
| 65 | Achanpong | AM | No sufficiently verified additional alias |
| 66 | Lockhart | CF | Added verified title; retained existing |
| 67 | Teddy Knight | LW | Added verified title; retained existing |
| 68 | Childs | RW | No sufficiently verified additional alias |
| 69 | Shigeo Mizuki | Unresolved — no position fabricated | No sufficiently verified additional alias |
| 70 | Hajime Nishioka | Unresolved — no position fabricated | Retained 1; no further verified addition |
| 71 | Shizuka Haiji | Unresolved — no position fabricated | No sufficiently verified additional alias |
| 72 | Reiji Hiiragi | Unresolved — no position fabricated | No sufficiently verified additional alias |
| 73 | Taiga Tsunzaki | Unresolved — no position fabricated | No sufficiently verified additional alias |
| 74 | Oboabona | CB | No sufficiently verified additional alias |
| 75 | Bello | RM | No sufficiently verified additional alias |
| 76 | Bats | DM | No sufficiently verified additional alias |
| 77 | Leyden | LW | No sufficiently verified additional alias |
| 78 | Hermes | CB | No sufficiently verified additional alias |
| 79 | Aiki Himizu | Unresolved — no position fabricated | Retained 2; no further verified addition |

Unresolved deployments: Asahi Naruhaya, Yudai Imamura, Junichi Wanima, Keisuke Wanima, Haneru Shindo, Shigeo Mizuki, Hajime Nishioka, Shizuka Haiji, Reiji Hiiragi, Taiga Tsunzaki, Aiki Himizu.
