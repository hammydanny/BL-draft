# Blue Lock Battle Sim — Character Checklist

Track implementation coverage for every character in the player roster. Check an item only when that character's Battle Sim implementation is in place. An unchecked box means work is pending; it does **not** mean the character lacks that ability or dialogue in canon.

- **Special moves:** character-specific move mechanics, triggers, and readable match-feed output.
- **Passives:** character-specific passive mechanics and balanced gameplay effects.
- **Dialogue:** character-specific lines for relevant match events, plus teammate/rival chemistry lines where appropriate.

v0.8.9.1: Kira, Noa, Bachira, Igarashi and Kunigami are checked because each kit entry is wired to an engine effect, appears with a label in seeded full matches (positional lineups, 117-match harness) and has keyed dialogue in all 11 languages. Activation rates differ widely, and some are rare (for example Kunigami's Physical Man-Marking and Rush Volley, and Isagi's Two-Gun Volley); see `docs/release-v0.8.9.1.md`.

| Player (ID) | Special moves | Passives | Dialogue |
|---|:---:|:---:|:---:|
| Yoichi Isagi (1) | [x] | [x] | [x] |
| Ryosuke Kira (2) | [x] | [x] | [x] |
| Noel Noa (3) | [x] | [x] | [x] |
| Meguru Bachira (4) | [x] | [x] | [x] |
| Gurimu Igarashi (5) | [x] | [x] | [x] |
| Rensuke Kunigami (6) | [x] | [x] | [x] |
| Hyoma Chigiri (7) | [x] | [x] | [x] |
| Gin Gagamaru (8) | [x] | [x] | [x] |
| Jingo Raichi (9) | [x] | [x] | [x] |
| Asahi Naruhaya (10) | [x] | [x] | [x] |
| Okuhito Iemon (11) | [x] | [x] | [x] |
| Wataru Kuon (12) | [x] | [x] | [x] |
| Yudai Imamura (13) | [x] | [x] | [x] |
| Ikki Niko (16) | [x] | [x] | [x] |
| Hibiki Okawa (17) | [x] | [x] | [x] |
| Junichi Wanima (18) | [x] | [x] | [x] |
| Sae Itoshi (14) | [ ] | [ ] | [ ] |
| Shoei Baro (15) | [ ] | [ ] | [ ] |
| Keisuke Wanima (19) | [ ] | [ ] | [ ] |
| Reo Mikage (20) | [ ] | [ ] | [ ] |
| Seishiro Nagi (21) | [ ] | [ ] | [ ] |
| Zantetsu Tsurugi (22) | [ ] | [ ] | [ ] |
| Rin Itoshi (23) | [ ] | [ ] | [ ] |
| Jyubei Aryu (24) | [ ] | [ ] | [ ] |
| Aoshi Tokimitsu (25) | [ ] | [ ] | [ ] |
| Ranze Kurona (26) | [ ] | [ ] | [ ] |
| Yo Hiori (27) | [ ] | [ ] | [ ] |
| Tabito Karasu (28) | [ ] | [ ] | [ ] |
| Eita Otoya (29) | [ ] | [ ] | [ ] |
| Kenyu Yukimiya (30) | [ ] | [ ] | [ ] |
| Ryusei Shido (31) | [ ] | [ ] | [ ] |
| Nijiro Nanase (32) | [ ] | [ ] | [ ] |
| Jin Kiyora (33) | [ ] | [ ] | [ ] |
| Leonardo Luna (34) | [ ] | [ ] | [ ] |
| Pablo Cavasoz (35) | [ ] | [ ] | [ ] |
| Adam Blake (36) | [ ] | [ ] | [ ] |
| Dada Silva (37) | [ ] | [ ] | [ ] |
| Julien Loki (38) | [ ] | [ ] | [ ] |
| Gen Fukaku (39) | [ ] | [ ] | [ ] |
| Oliver Aiku (40) | [ ] | [ ] | [ ] |
| Kazuma Nio (41) | [ ] | [ ] | [ ] |
| Miroku Darai (42) | [ ] | [ ] | [ ] |
| Teppei Neru (43) | [ ] | [ ] | [ ] |
| Itsuki Wakatsuki (44) | [ ] | [ ] | [ ] |
| Haru Hayate (45) | [ ] | [ ] | [ ] |
| Kento Cho (46) | [ ] | [ ] | [ ] |
| Teru Kitsunezato (47) | [ ] | [ ] | [ ] |
| Shuto Sendo (48) | [ ] | [ ] | [ ] |
| Michael Kaiser (49) | [ ] | [ ] | [ ] |
| Alexis Ness (50) | [ ] | [ ] | [ ] |
| Benedict Grim (51) | [ ] | [ ] | [ ] |
| Lavinho (52) | [ ] | [ ] | [ ] |
| Chris Prince (53) | [ ] | [ ] | [ ] |
| Agi (54) | [ ] | [ ] | [ ] |
| Marc Snuffy (55) | [ ] | [ ] | [ ] |
| Don Lorenzo (56) | [ ] | [ ] | [ ] |
| Charles Chevalier (57) | [ ] | [ ] | [ ] |
| Rooke (58) | [ ] | [ ] | [ ] |
| Renoir (59) | [ ] | [ ] | [ ] |
| Haneru Shindo (60) | [ ] | [ ] | [ ] |
| Bunny Iglesias (61) | [ ] | [ ] | [ ] |
| Innocent Onazi (62) | [ ] | [ ] | [ ] |
| Godwin Kuso (63) | [ ] | [ ] | [ ] |
| Vivien Hugo (64) | [ ] | [ ] | [ ] |
| Achanpong (65) | [ ] | [ ] | [ ] |
| Lockhart (66) | [ ] | [ ] | [ ] |
| Teddy Knight (67) | [ ] | [ ] | [ ] |
| Childs (68) | [ ] | [ ] | [ ] |
| Shigeo Mizuki (69) | [ ] | [ ] | [ ] |
| Hajime Nishioka (70) | [ ] | [ ] | [ ] |
| Shizuka Haiji (71) | [ ] | [ ] | [ ] |
| Reiji Hiiragi (72) | [ ] | [ ] | [ ] |
| Taiga Tsunzaki (73) | [ ] | [ ] | [ ] |
| Oboabona (74) | [ ] | [ ] | [ ] |
| Bello (75) | [ ] | [ ] | [ ] |
| Bats (76) | [ ] | [ ] | [ ] |
| Leyden (77) | [ ] | [ ] | [ ] |
| Hermes (78) | [ ] | [ ] | [ ] |
| Aiki Himizu (79) | [ ] | [ ] | [ ] |
| John Paccini (80) | [ ] | [ ] | [ ] |
| Zaruchi (81) | [ ] | [ ] | [ ] |

## Isagi implementation reference

- [x] Passive: Metavision
- [x] Special move: Direct Shot
- [x] Unique pass, successful/failed dribble, shot-attempt, missed-shot, and goal dialogue
- [x] Selected chemistry dialogue for Hiori Yo, Meguru Bachira, Seishiro Nagi, Rensuke Kunigami, Rin Itoshi, and Michael Kaiser
- [x] Special-move usage contributes to match rating

## Writing descriptions

Battle Sim descriptions say plainly **when** the ability happens, **what** it does and **what can still stop it**, using the real numbers from the kit and simple words (see CLAUDE.md, "Battle Sim descriptions"). Example: "When a pass reaches Isagi within 24 m of goal, he can shoot straight away without controlling it first. Defenders have less time to block, but the goalkeeper can still save it."

## 8.9.8.2 character batch

Kuon, Imamura, Niko, Okawa and Junichi use physical movement, passing, aerial contests and the shared shot model. Deterministic scenes cover triggers, failure paths and cooldowns. Normal seeded-match opportunities and observed usage are recorded in `docs/release-v8.9.8.2.md`; rare techniques are not forced to activate. All 16 completed characters have localized event dialogue. Keisuke remains unchecked: only Eye Contact interpreter dialogue and shared reaction participation are implemented. Fan-game ability names are marked as interpretations in the kit data.

## Standard for future batches

Every new kit must pair canon-grounded, fallible football effects with contextual character dialogue, including success/failure and quiet or nonverbal personalities. Reuse physical movement and shared reactions, localize names/descriptions/lines in all 11 languages, and verify deterministic saves plus ordinary seeded matches. Limited-canon players stay simple. Do not mark a kit complete from declarations or string counts alone.
