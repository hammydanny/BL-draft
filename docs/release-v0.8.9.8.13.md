# 0.8.9.8.13 — Defensive intelligence, team integration, roster audit and UI

Based on main `5c3cbe7` (0.8.9.8.12). Supported chapter stays at 368. Base stats, OVR, positions, Battle Sim kits and mechanics, chemistry values, formations, the intro, Isagi, Hiori, John Paccini and every secret record are unchanged.

## A. Defending and football shape

Measured first with a new developer report, `scripts/football-metrics-report.js` (ordinary seeded matches, nothing forced; the same seeds and line-ups as `scripts/ability-usage-report.js`). It records the pass mix and completion (short / long / through / cross), what follows a goal kick, interceptions, aerial contests, second balls, touches per player by role group, goals, shots, ability chips and engine cost. Statistics are recorded only when a harness installs `globalThis.__bsStats`; normal play and saves never carry the fields.

Root causes found:

| Problem | Cause | Fix |
|---|---|---|
| Long balls and switches were the default; wingers were the hubs and central midfielders rarely touched the ball | `passValue` rewarded any forward metres and gave no value to keeping the ball through midfield; lofted balls were rarely contested in the air | A small possession value on every pass and a build-up value for passes into an open central midfielder in the first two-thirds; lofted passes are contested by the nearest defender's aerial skill (`passModel`) rather than nerfed |
| A striker beating one man was through on goal | Marking was one-to-one with no cover; the spare defender stayed in shape | `coverAndScreen`: the spare centre-back (or full-back near goal) drops goal-side and inside the most dangerous marked attacker; a free DM/CM screens the lane between the ball and that attacker |
| Strikers left completely free when the nearest defender went to press or cut a lane | No fallback once pressing roles were assigned | Once the ball is in our half, an unmarked striker within 40 m is picked up goal-side by the closest free centre-back or full-back (sticky for six ticks, so nobody oscillates) |
| Markers in dangerous areas stood ball-side of their striker | The mark leaned 10% towards the ball, more than the goal-side offset | Inside 35 m the lean is 6% |
| Goal kicks were always the same shape; long kicks left strikers unmarked | One fixed arrangement | Seeded, tactically varied short and long set-ups (see below) |

Tried and removed after ablation (they increased through balls and shots): a deeper line when the carrier is unpressured, and threat-weighted marking.

Specialists stay better (Raichi, Niko, Aryu, Kurona keep their kit abilities and higher DEF/anticipation), but cover, screening and the striker pick-up are shared team behaviour, so basic competence is not exclusive to them. The 0.8.9.8.12 ability-activation work is unchanged.

### Goal kicks

Short: centre-backs split 19–28% of the width, full-backs stand 0–9 m higher, the build-up leans to a seeded flank, and without a holding midfielder the most central midfielder drops in as the 6 (deep or a few metres higher). Long: the first striker is the target at a seeded height and channel, central midfielders gather 5–12 m short of the landing zone for the second ball. The opposition sees the shape, not the destination: centre-backs stay goal-side of strikers and attacking midfielders, full-backs of wingers, a spare centre-back covers behind the target and up to two midfielders screen the second-ball zone. Nobody stands in the goal area, every opponent starts outside the penalty area, players walk to their spots (no teleporting), both directions and small formats are supported, and the arrangement is deterministic for a given stoppage.

### Before / after

48 ordinary seeded matches per column (same seeds and line-ups; "base" is main `5c3cbe7` with only the inert statistics hooks added). The engine defaults to a short goal kick; the "long goal kicks" columns replay every goal kick as the user's LONG option.

| | base | after | base (long goal kicks) | after (long goal kicks) |
|---|---|---|---|---|
| Goals / shots per match | 6.58 / 23.9 | 5.48 / 21.2 | 7.77 / 27.6 | 6.52 / 23.5 |
| Short passes per match (completion) | 163 (83.1%) | 176 (86.1%) | 150 (88.1%) | 164 (89.2%) |
| Long passes per match (completion) | 54.3 (74.3%) | 40.7 (75.7%) | 59.8 (61.5%) | 47.9 (61.8%) |
| Through balls per match (completion) | 37.2 (79.7%) | 32.8 (81.2%) | 40.3 (81.0%) | 36.1 (82.0%) |
| Crosses per match (completion) | 10.4 (71.9%) | 7.0 (67.2%) | 9.8 (68.4%) | 6.9 (67.2%) |
| Long-ball share of passes | 20.5% | 15.9% | 23.0% | 18.8% |
| Shots straight off a long ball / through ball / cross | 24.5% | 21.1% | 21.1% | 19.8% |
| Interceptions per match | 13.4 | 9.9 | 13.9 | 11.1 |
| Aerial contests per match (contested / clean) | 13.5 / 4.5 | 10.0 / 4.0 | 14.2 / 5.2 | 10.9 / 3.9 |
| Second balls won by the attack (48 matches) | 570 | 585 | 659 | 596 |
| Shots / goals within the kick + one pass after a long goal kick | — | — | 29 / 9 from 169 kicks (17.2%) | 32 / 8 from 188 kicks (17.0%) |
| Touches per player: strikers / wingers / midfielders / defenders | 41.8 / 43.8 / 21.0 / 14.1 | 30.1 / 35.2 / 30.7 / 14.8 | 44.6 / 44.6 / 21.2 / 12.2 | 33.3 / 36.4 / 31.7 / 12.0 |
| Ability chips per match | 78.8 | 78.8 | 85.2 | 83.8 |
| Engine cost | 6.35 ms/tick | 6.46 ms/tick | 6.20 ms/tick | 6.42 ms/tick |

Ablation on the same 48 seeds (short goal kicks): without the cover/screen step goals return to 6.35, without the striker pick-up to 6.06, so most of the scoring drop is the intended "beat one man, meet another" effect. The remaining quick shots after long goal kicks come from multi-action attacks (dribbles and through balls after the second ball), not from free strikers; the per-kick rate is unchanged and the tests require a goal-side defender on every striker.

Ability usage (`scripts/ability-usage-report.js`, its 12 seeded matches): feed chips 1093 → 1108; Ace Neutralization 94 → 137, Precision Distribution 108 → 134, No-Break Dribble 36 → 57; Planet Hotline sequences 32 → 16 (mean progress 10 → 9 m, possession kept 29 → 16); Flow activations 58 → 34 and goals 6.58 → 4.50 in that small sample. Full numbers: `docs/football-metrics-0.8.9.8.13.json`.

## B. Canon-data audit (IDs 91–98 and Ishikari)

Characters audited: Akira Endoji, Yukio Ishikari, Birkenstock, Erik Gesner, Ignacio Lara, Ryo Nameoka, Ringo Pondemizu and Camus. Team histories, weapons, aliases, quotes and chemistry were checked against the project's chemistry contexts and the sources below.

| Character | Finding | Change |
|---|---|---|
| Yukio Ishikari | "5th Clear Team" listed Aryu, who cleared with Rin's first group; the fifth group was Niko, Ishikari, Hiori, Nishioka (and Saramadara) | Aryu → Nishioka (matches the project's FIFTH CLEAR TEAM context) |
| Yukio Ishikari | "Team A" listed Hiiragi, whom the project places in Third Selection B3 and the Team A page does not list | Hiiragi removed |
| Akira Endoji | "Team C" listed Bachira, whom the project places in Third Selection A3 | Bachira removed; Yukimiya, Nagi and Tsurugi kept (Team C page) |
| Birkenstock, Erik Gesner | Bastard München lists omitted Neru, who is in the project's BASTARD MÜNCHEN context | Neru added |
| Ignacio Lara | Overview recapped one assist against Manshine City | Timeless wording ("links the side's combinations from the left and can supply the final pass"), 11 languages |
| Camus, Ryo Nameoka, Ringo Pondemizu | Team lists, weapons and sources consistent; Side-B membership confirmed (Blue Lock Archive lists Pondemizu in Side-B's first team, Nameoka in the wider Side-B group) | none |

No weapons, aliases or quotes were added: the available sources give no verified official-English dialogue or epithets beyond those already registered (Ishikari's "The Tallest High Schooler"). Chemistry is unchanged by design: as recorded in 0.8.8.2, these team histories are display records and do not create numerical chemistry, and none of these characters has a pair entry, so there is nothing asymmetric to correct. Sources: [Team A](https://bluelock.fandom.com/wiki/Team_A), [Team C](https://bluelock.fandom.com/wiki/Team_C), [Akira Endoji](https://bluelock.fandom.com/wiki/Akira_Endoji), [Ryo Nameoka](https://bluelock.fandom.com/wiki/Ryo_Nameoka), [Second Selection clear order](https://thecinemaholic.com/blue-lock-season-1-finale-recap-and-ending-explained), [Side-B roster](https://bluelockarchive.com/selections/side-b). Several fandom pages (Pondemizu, Endoji's synopsis, Third Selection matches) could not be fetched during the audit; Endoji's Team C membership itself is kept from the earlier record but is not confirmed by the pages that could be read.

## C. Auction → Battle Sim

`openBattleSimFromResults` now sends captains and clears any setup left over from an earlier Battle Sim visit. Battle Sim decides with `setupSource(launch, returned)`: a returned setup is kept only if it is newer than the transfer. `launchTeams` restores names, colours, every player (bench included), formations, exact slot assignments, captains and both special keepers; unresolvable players are counted and reported (`role="alert"`), and if a squad cannot be loaded at all the page says so instead of silently opening random teams.

## D. One saved-squad library

Battle Sim saves into `bldSavedSquadsV1` (the Team Builder's library) through `saveReplaySquad`, keeping name, colour, roster, formation, slots, bench, captain, strategy and small-sided starter count (both optional fields are validated in `normalizeReplaySquad` and absent from older saves). It never writes the Team Builder's current squad. The CHOOSE SQUAD list offers library squads (Team Builder saves, imports, Battle Sim saves), the current auction teams, the standalone builder and legacy `blBattleSimTeamLibraryV1` saves (read-only adapter), de-duplicated by name, formation, players and slots. A squad with a locked secret player is not offered at all. Option labels are translated. The setup button is now SAVE SQUAD.

## E. Team Builder

`playerBattleAbilitiesMarkup` uses the shared `battleSimKitList` (moved to a top-level helper in `js/lore.js`; the dossier and the Battle Sim match profile use it too): passives, specials, ultimates, Flow and chemical reactions with their partner, no duplicates. **RANDOMISE TEAM** sits next to Auto Best: same-format formation chosen at random, keeper first (Blue Lock Man, else a natural GK), outfield slots filled by fit-weighted chance from the squad's own players, bench preserved, captain kept valid, saved normally, no confirmation.

## F. UI

- Match Feed: `clamp(340px,46vh,500px)` (was `clamp(280px,38vh,420px)`): +72 px at 900 px tall, +80 px cap.
- Underlines removed from the Team Builder / Database / Battle Sim route cards on the homepage and the Character Dossiers / Chemistry cards on the Database page (targeted selectors; focus outlines and hover unchanged).
- Early Access removed from every shell, the Battle Sim header and title, the homepage badge and the redirect pages; changelog history is unchanged.
- Battle Sim weapon cards size to their content; the list scrolls as one container (keyboard focusable, labelled region). On phones the player profile opens as a full-height sheet so the list has room.
- Team Builder actions on phones: Auto Best + Randomise, then the three squad-library actions, then More Actions.

## G. Removed

`saveTeamToSharedStandalone` (Battle Sim no longer writes the builder), the Early Access badge code and its CSS, the dossier's private kit grouping (`kitKind`, `kitEntries`, `reactions`, `kitData`). Kept: the read-only legacy Battle Sim library adapter and the isolated-test fallback in `battleSimProfileWeapons`.

## Tests

`scripts/battle-v89813-tests.js` (in preflight): transfer exactness (4-4-2 / 3-5-2, 27 players, 22 slots, captains, special keepers), stale-setup precedence, missing-player reporting; shared library save/load with formation, slots, bench, captain and strategy, Team Builder untouched, builder / imported / legacy squads listed once, secret squads hidden until unlocked; Team Builder kit panel (every group, partner named, shared reaction on both partners); Randomise membership, keeper and formation variety over 40 seeds; 96 goal-kick layouts (both directions, short and long, three pressing levels) — distinct, deterministic, nobody in the goal area, every striker with a goal-side defender on a long kick; cover defender goal-side behind the striker in midfield attacks (fails 0/12 without the new logic); no active Early Access labels, feed size, single scrolling weapon list, no route-card underlines.

## Known limitations

- Lower scoring and fewer Flow activations. Flow is earned mostly through goals and decisive actions, so tighter defending lowers it (58 → 34 in the 12-match ability report; Planet Hotline sequences 32 → 16 because Isagi and Kurona are marked closer). The ability mechanics from 0.8.9.8.12 are unchanged; Flow gain was deliberately not retuned in this release. A follow-up could rebalance Flow gain against the new defending.
- Central midfielders now touch the ball about as often as strikers, but long balls are still about 16% of passes: they were made contestable, not removed.
- The canon audit could not read several fandom pages (see B); nothing was added from unread sources.
- Browser verification (Chromium/Playwright, local server, no device lab): Team Builder Randomise + kit panel at 1440×900 (EN dark), 390×844 (EN light, AR dark), 1280×720 (AR), 1024×768 (JA light), 932×430 (EN); Battle Sim transfer from an injected auction hand-off with a stale setup present, saved-squad dropdown, a live match (feed height) and the player profile weapon list at 1440×900, 390×844 (light) and 1280×720 (AR); homepage (light, AR mobile), Database landing (FR) and changelog. No console errors. Real touch devices and Safari were not tested.
