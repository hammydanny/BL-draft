// Character player data: Meguru Bachira (ID 4).
const PLAYER_4_DATA = { id: 4, name: "Meguru Bachira", debutChapter: 1, appearanceOrder: 4, image: "images/meguru-bachira.jpg", primaryPosition: "CF", positions: ["CF", "LWB", "LM"] , nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [{"id":"creative-dribbling","name":"Creative Dribbling","description":"Uses close touches and unpredictable changes of direction to beat markers.","battleSimType":"Special Move","battleSimDescription":"Bachira can suddenly change direction while dribbling, and his feints make defenders hesitate, so they are less likely to win the ball. Top defenders are rarely fooled.","source":{"type":"official-profile","url":"https://bluelock-kc.com/characters/bachira/","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"technical"},{"id":"creative-passing","name":"Creative Passing","category":"technical","description":"Shapes lofted and disguised passes around the receiver’s movement instead of relying only on dribbling to advance an attack.","battleSimType":"Special Move","battleSimDescription":"Right after a dribble, Bachira spots the space it opened and is more likely to pass into it. These passes are more accurate.","source":{"type":"anime-subtitles","url":"https://subs.yakuaru.com/books/blue-lock/page/e13-top3","note":"Bachira creates the First Clear Team’s goal; Tokimitsu identifies his extraordinary passes at 20:24.","episode":13}}], stats: { ovr:93, off:95, sho:88, spd:84, def:68, pas:88, dri:95, gk:51 },
        battleSim: {
            "awareness": {
                "space": 0.05
            },
            "tendencies": {
                "dribble": 0.08,
                "pass": -0.02
            },
            "passives": [
                {
                    "id": "monster-instinct",
                    "name": "Monster Instinct",
                    "label": "MONSTER INSTINCT",
                    "effect": "isolation-hunter",
                    "params": {
                        "value": 0.012
                    },
                    "description": "Bachira looks for one-on-ones with space behind the defender and is more likely to take them on."
                },
                {
                    "id": "free-spirit",
                    "name": "Free Spirit",
                    "label": "FREE SPIRIT",
                    "effect": "free-spirit",
                    "params": {
                        "factor": 0.35
                    },
                    "description": "Losing the ball on a dribble makes players more careful for a while. Bachira becomes only about a third as careful, so he keeps trying."
                }
            ],
            "weapons": [
                {
                    "id": "creative-dribbling",
                    "name": "Creative Dribbling",
                    "label": "CREATIVE DRIBBLING",
                    "effect": "creative-dribble",
                    "dialogue": "dribble",
                    "params": {
                        "feint": 0.12,
                        "cuts": [
                            -84,
                            84
                        ]
                    },
                    "description": "Bachira can suddenly change direction while dribbling, and his feints make defenders hesitate, so they are less likely to win the ball. Top defenders are rarely fooled."
                },
                {
                    "id": "creative-passing",
                    "name": "Creative Passing",
                    "label": "CREATIVE PASSING",
                    "effect": "disruption-pass",
                    "dialogue": "create",
                    "params": {
                        "value": 0.012,
                        "precision": 0.8
                    },
                    "description": "Right after a dribble, Bachira spots the space it opened and is more likely to pass into it. These passes are more accurate."
                },
                {
                    "id": "bee-shot",
                    "name": "Bee Shot",
                    "label": "BEE SHOT",
                    "effect": "post-dribble-finish",
                    "dialogue": "beeShot",
                    "params": {
                        "maxMetres": 22,
                        "technique": 0.1,
                        "cooldownTicks": 10
                    },
                    "description": "Right after beating a defender within 22 m of goal, Bachira can shoot before that defender recovers. Other defenders and the goalkeeper can still stop it. Short cooldown."
                }
            ],
            "ultimates": [
                {
                    "id": "ginga-monster",
                    "name": "Ginga × Monster",
                    "label": "GINGA × MONSTER",
                    "effects": [
                        "flow-state",
                        "dribble-chain"
                    ],
                    "params": {
                        "maxChain": 2,
                        "boost": {
                            "creative-dribble": {
                                "feint": 0.2
                            }
                        }
                    },
                    "description": "Bachira's Flow. After beating a defender he can try up to two more dribbles in the same attack, and his feints work even better. He can still be tackled each time."
                }
            ],
            "reactions": [
                {
                    "id": "creative-instinct",
                    "name": "Creative Instinct",
                    "label": "CREATIVE INSTINCT",
                    "members": [
                        1,
                        4
                    ],
                    "effect": "exploit-disruption",
                    "cooldownTicks": 12,
                    "dialogue": "creative",
                    "params": {
                        "defendersDrawn": 1,
                        "returnValue": 0.02,
                        "precision": 0.7
                    },
                    "description": "With Yoichi Isagi on the pitch: when Bachira beats a defender or pulls one towards him, Isagi runs into the space that opens and Bachira can pass to him there. Defenders can still get back."
                }
            ],
            "dialogue": {
                "dribble": [
                    "Monster says go!",
                    "Ehehe, this way!",
                    "Bet you didn't see that!"
                ],
                "dribbleFail": [
                    "Aww, you got me!",
                    "Ugh, that one's on me."
                ],
                "create": [
                    "Space! Somebody take it!",
                    "There, the monster opened a door!"
                ],
                "beeShot": [
                    "Buzz! Bee Shot!",
                    "Straight past you!"
                ],
                "goal": [
                    "That was so much fun!",
                    "Did you see that dance?"
                ],
                "miss": [
                    "Ahh, so close!"
                ],
                "flowDribble": [
                    "One more! The monster's hungry!"
                ],
                "flow": [
                    "I can hear the monster singing!"
                ]
            }
        }
    };
