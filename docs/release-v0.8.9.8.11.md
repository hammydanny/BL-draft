# 0.8.9.8.11 — Character identity and ultimates

Based on main `a525172` (0.8.9.8.10). Supported chapter stays at 368. Only the `battleSim` sections of 16 public characters change; every other player field, all secret records, chemistry, formations, the intro and Isagi's kit are untouched (proof below).

## Design standard

- **Passive**: how a player always approaches football. **Special**: a repeatable signature action with a cooldown. **Flow**: a temporary intensification of those instincts. **Ultimate**: an exceptional, situational action, once per Flow, with its own allowance.
- Every new ultimate is an `ultimates` entry with `oncePerFlow`, `condition.duringFlow` and an `effect` key. `activateBattleSimUltimate` deliberately skips entries with an effect, so each has a dedicated handler in `js/battle-sim.js` (section "v0.8.9.8.11 character ultimates and identity mechanisms").
- Handlers are reached in one of three ways, never by forcing:
  1. **Tactical selection**: carrier ultimates are added to `chooseAction` as options with values from the same pass/dribble/shot models and compete with ordinary choices.
  2. **Shot techniques**: finishing ultimates join `shotTechniques` and are resolved by the shared shot model.
  3. **Physical triggers**: off-ball, defensive, goalkeeping and race ultimates fire only when the match produces their situation (a run, a predicted pass, a shot that has beaten the keeper, a short race).
- Each records attempts and successes in `battleSimState.ultimateLog` (saved and sanitized), spends only its own allowance, and has keyed dialogue for recognition, success and failure.
- Anticipation is hidden: Watchtower Checkmate and Ace Neutralization improve the defender's read **only when the pass is actually resolved** (`live`). The passer's decision model does not see them; physically visible pressure (Lockdown, Orbital Recovery) is always seen.

## New ultimates

| Character | Ultimate | Trigger (all in Flow) | What happens | Counterplay |
|---|---|---|---|---|
| Barou | Devour: Villain's Shadow | A teammate within 38 m of goal draws ≥2 defenders (within 8 m, or marking him) | Barou makes a real primed run into an onside open space ≤26 m from goal. If the ball reaches him within 3 ticks (pass, rebound or loose ball) he gets a one-tick first-strike finish; teammates recognise the run as a normal pass option | Defenders who read runs follow it; no pass means failure; nothing is teleported or taken from teammates |
| Barou | Predator Eye: Blindside Execution | 6–24 m out; keeper screened (a body ≥3.5 m in front), moving across, or off his line | Powerful finish to the side he cannot cover (+logit 0.04 plus window 0.08–0.24, block factor 0.85) | No defender may stand on the line 2.5–9 m out; blocks, saves and misses remain |
| Rin | Puppeteer's Endgame | ≤40 m out, a defender ≤9 m ahead and two real routes on opposite sides of him | Rin shifts the ball toward the decoy route; the defender commits (probability from Rin's reading versus the defender's; about 0.35–0.75) and physically moves, then Rin uses the other route (pass, dribble or shot) | A defender who reads it closes in; Rin then keeps the ball with the best pass |
| Rin | Destroyer: Collision Course | ≤38 m out, strongest defender in his path ≤5 m | Dribble duel straight through him with a +4 physical edge | Normal dribble model; the defender can win |
| Rin | Spin Gear Shot | Airborne reception ≤14 m out, defender ≤3.5 m | Acrobatic first-time strike (pressure relief 1.6, technique −0.05) | Hard finish; it can be blocked, saved or missed. No new ball physics or forced contact |
| Sae | Beautiful Destruction: Perfect Thread | Forward pass ≥14 m into the attacking third through a contested lane | Recomputed with tighter execution (through ball precision 0.5; ground pass 1.15× pace, +0.04 accuracy) | Same lane, contest and race model; still interceptable |
| Sae | Counter-Dribble: Deadly Release | A defender is actually stepping in (≤4.5 m, moving toward him) | Counter cut away (read 0.14). Only if it works, an instant pass or shot through the opening | Defender can win the first part; the release can be blocked or intercepted |
| Reo | Chameleon: Evolution | Observed a copyable public move in the last 80 ticks (existing whitelist) | Finish mode: a copied first-time finish after a reception ≤20 m. Dribble mode: a copied feint past a defender ≤8 m, then an instant pass | Own ratings; can fail; never copies ultimates, reactions, Flow, keepers or secret kits |
| Bachira | Monster's Dance | After a genuine beaten defender ≤38 m out, another defender ≤7 m ahead | Up to two more goalward duels, each resolved separately with −5 and −10 risk | Any duel can lose the ball. Ginga × Monster stays his Flow passive; the two never stack |
| Chigiri | Red Panther: 44° Breakthrough | Wide, ≥6 m space ahead, within reach of the 44° point ~19 m out | Up to 4 ticks of real pushed sprint carries, a cut inside, then a far-post finish next tick | Any tackle or turnover ends it (allowance spent) |
| Noa | Ambidextrous Checkmate | ≤24 m out, a blocker genuinely committing to one side | Switches feet to the other side, ignoring the committed blocker | If the defender holds, Noa does not shoot into the block; he passes |
| Kunigami | Wild Card: Power Finish | 5–22 m out, just won a contest (rebound, loose ball, beaten defender) or received with a defender ≤2.6 m | Holds the defender off (relief scaled by OFF+shield vs DEF) and strikes with the foot that has the clearer side | Blocks and saves remain; distinct from Power Shot (range) and Rush Volley (first-time rebound) |
| Gagamaru | Beast Reflex | A shot has already beaten the normal save | Dive check from flight time and reach; save chance 0.06–0.42 from GK vs SHO, slack and power; a save is a parry | Unreachable shots keep the allowance; powerful or well-placed shots still score |
| Niko | Watchtower Checkmate | Watchtower predicts a dangerous pass (receiver ≤32 m from goal) he can reach in 2 ticks | Waits 1.8 m beside the lane for up to 3 ticks; on a live pass, +0.25 read and +2 m reach | The passer can go elsewhere; faster players still beat him |
| Raichi | Relentless Lockdown | His marked attacker is dangerous in Raichi's half (OFF 85+ or ≤34 m from goal) | 3 ticks of goal-side shadowing at 0.9 m; −1.5 stamina per tick, also in Flow; passes to the target harder to receive | Reception, a 12 m gap or the target leaving ends it |
| Zantetsu | Lightning Start | Live race for a through or loose ball ≤14 m from him | −0.10 s reaction, first step at 25% of top speed | Others can still arrive first |
| Aryu | Glamorous Last Reach | A shot passes 1.8–3.4 m from him (outside normal block reach) | Long-legged block, chance ≤0.40; a block becomes a corner | Otherwise the shot continues normally |

**Refined:** Nagi's Five-Shot Revolver no longer requires Reo as the passer. It now needs any airborne reception within 14 m, with two defenders within 5 m and one committing; Reo's delivery improves the disguise (0.40 vs 0.32). Its early-failure and per-feint failure checks are unchanged.

**New special and reaction:** Kurona gets **Orbital Recovery**. Within 6 m of a pass receiver he reaches 1.2 m further with a small read; 8-tick cooldown, spent on any real attempt. **Ace Neutralization** (Raichi × Kurona) is declared once in Raichi's kit with `members: [9, 26]`, so it is listed in both dossiers. When Raichi is within 4.5 m of a dangerous attacker and Kurona is within 18 m, Kurona physically takes the passing line for 3 ticks, with a hidden live read. Shared cooldown is 12 ticks. Existing chemistry values are unchanged.

## Behaviour (shared mechanisms, character parameters)

- **King's Ego** (`goal-hunger`, previously declared but unused): with a realistic shot (≥10%), safe sideways or backward passes that create less threat than the shot lose 0.006; forward duels gain 0.003; Barou keeps making runs when two runners are already out.
- **Predator Eye patience**: if the keeper is still moving, no window has opened and nobody is within 3.5 m, Barou may take one 2 m touch to wait (never twice in a row).
- **Destructive Impulse** (Rin, Flow): duels against DEF 80+ gain 0.006 and backward passes lose 0.003. Calculated Rin is unchanged outside Flow.
- **Spatial Awareness** (`chance-creation`, Sae): forward passes are valued by the receiver's open shooting position. **Counter Dribbling**: pointless sideways dribbles with nobody committing lose 0.004.
- **Perfect Trapping** (Nagi): after controlling a high or long ball, his immediate shot gains 0.004.
- **Second-ball hunter** (Kunigami): when his team attacks, he prefers support spots 9–17 m out, central.
- **Quick Turning** (Kurona): +0.08 to his read when tracking changed runs.
- **Races**: `raceTopSpeed` changes only race calculations, never stored ratings. Chigiri's sustained top end is ×1.04 and Zantetsu's ×0.96 against his 1.5× acceleration. Zantetsu wins over 10 m; Chigiri wins over 45 m.
- **Tokimitsu**: a Flow decision profile makes him slightly hesitant before Flow (−0.15 sharpness) and decisive in it (+0.35). No ultimate.

## Characters intentionally without an ultimate

Isagi keeps his three (unchanged). Kira (composed, conventional), Igarashi (Malicia already is his identity), Naruhaya (blind-spot runner), Iemon (organiser), Kuon (aerial), Imamura (support), Okawa (timing), the Wanima twins (shared Eye Contact; Junichi stays nonverbal and Keisuke speaks for him), Nishioka (limited canon) and Tokimitsu (physical toolkit made more recognisable instead). Kurona has no solo ultimate, as requested.

## Validation

- `scripts/battle-v89811-tests.js` (added to preflight) covers:
  - Barou: Devour arming, physical run, tracking, failure without the ball, success on arrival; Blindside window, blocked-lane rejection, failed attempt; independent allowances.
  - Rin: Puppeteer commit and read paths, Collision win and loss, Destructive Impulse weighting. Noa: static versus committed blocker, pass when read.
  - Sae: Deadly Release needs commitment and is two-part, can lose the first part; Perfect Thread is fallible and once per Flow.
  - Reo: Evolution needs observation and never copies ultimates. Nagi: Revolver from any airborne reception, not from a grounded pass.
  - Speed: Zantetsu faster over 10 m, Chigiri over 45 m; ratings unchanged.
  - Staged and failure paths: Red Panther staged and interrupted; Monster's Dance separate escalating duels with loss; Power Finish gated by contest.
  - Defence: Ace Neutralization activation, 12-tick shared cooldown, hidden read, both dossiers; Lockdown stamina and reception failure; Checkmate live-only read and avoidance; Beast Reflex reachable versus unreachable; Last Reach window; Lightning Start short races in Flow only; Orbital Recovery cooldown.
  - Safety: no ultimates during Planet Hotline or restarts, for subbed-off players, or outside Flow; allowances reset with Flow.
  - Saves: allowances, sequences and logs survive; malformed entries and unbounded windows are rejected.
  - Data: every new ultimate has an engine handler, a stated limit and 10-language copy; secret kits are untouched.
  - Ordinary seeded matches complete, are deterministic and stay under 10 ms per tick.
- Updated existing tests only where the request changes them: the handled-effect lists in `battle-v0891`/`battle-v0894`, and the prior-kit and roster fingerprints for the 16 changed kits (`character-batch-protected.json`, `roster-v088.json`, `roster-v0881.json`). An exhaustive comparison against `a525172` shows those 16 records differ only in `battleSim`; no other player or reference file changed, and every secret record is identical. The secret-record hash, chemistry hash, Hiori/John/Isagi source hashes and pinned engine functions (`watchtowerTarget`, `playReaction`, John's functions) are unchanged.
- Performance: on the v0.8.8.5 sample, 4.83 ms/tick against 4.51 before. The heavy all-kits line-ups cost the same as on the previous engine (7.00 vs 6.97 ms/tick).
- Measured usage is in `docs/character-identity-metrics.json`: 12 ordinary seeded matches with no forced Flow, plus a controlled audit where these characters are held in Flow and given a fresh allowance every 40 ticks. Triggers, decisions and outcomes in that audit are the engine's own. See "Measured activation" below.

## Measured activation

Ordinary play: 12 seeded matches, all completed, 5.92 goals per match, 6.57 ms/tick with the heavy line-ups, Flow forced on nobody. Ultimates seen: Power Finish 3 (1 goal), Devour 2 (0), Lightning Start 1 (1), Monster's Dance 2 (2 kept the ball), Puppeteer's Endgame 4 (0 baited), Perfect Thread 1 (1). Ace Neutralization activated 60 times (1 interception) and Orbital Recovery 7 times.

Controlled audit: the same 12 seeds, with these characters held in Flow and a fresh allowance every 40 ticks. Each figure is successes out of attempts.

| Ultimate | Successes / attempts | Success means |
|---|---|---|
| Devour: Villain's Shadow | 30 / 77 | the ball reached Barou in time |
| Predator Eye: Blindside Execution | 7 / 16 | goal |
| Puppeteer's Endgame | 15 / 24 | the defender committed |
| Destroyer: Collision Course | 2 / 2 | won the duel |
| Spin Gear Shot | 0 / 1 | goal |
| Perfect Thread | 4 / 9 | received |
| Deadly Release | 3 / 3 | counter worked, release played |
| Chameleon: Evolution | 1 / 1 | completed |
| Monster's Dance | 6 / 7 | kept the ball |
| Red Panther: 44° Breakthrough | 4 / 15 | reached the shot |
| Wild Card: Power Finish | 6 / 31 | goal |
| Beast Reflex | 5 / 25 | save |
| Watchtower Checkmate | 9 / 106 | interception |
| Relentless Lockdown | 30 / 108 | target never received |
| Lightning Start | 43 / 52 | won the race |
| Glamorous Last Reach | 2 / 8 | block |

Ambidextrous Checkmate was offered but not chosen in this sample: Noa's existing Two-Footed Execution usually covers the same moment. The full counters, including eligible-but-unused opportunities, are in `docs/character-identity-metrics.json`.

## Known limitations

- Ultimates depend on Flow, which most characters reach zero to two times per match. In ordinary matches many ultimates appear only occasionally, and some (Spin Gear Shot, Chameleon: Evolution, Ambidextrous Checkmate, Deadly Release) are rare because their situations are rare. Nothing is forced.
- Watchtower Checkmate and Ace Neutralization mostly work as deterrents: passers usually choose another option, so recorded interception successes are low.
- Browser check: dossier kit cards for Barou (1440×900), Raichi (390×844), Rin in Arabic RTL and Sae in Japanese were rendered with the bundled Chromium. The new cards, ULTIMATE badges, translations and RTL text direction were correct, with no console errors. The live Battle Sim pitch and match feed were **not** visually inspected in a browser; feed templates and chips are covered by unit tests only.
