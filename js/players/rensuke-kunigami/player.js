// Character player data: Rensuke Kunigami (ID 6).
const PLAYER_6_DATA = { id: 6, name: "Rensuke Kunigami", debutChapter: 1, appearanceOrder: 6, image: "images/rensuke-kunigami.jpg", primaryPosition: "CF", positions: ["CF", "DM"] , nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [{"id":"physical-strength","name":"Physical Strength","description":"Uses his powerful frame to hold off opponents and contest possession.","battleSimType":"Passive","battleSimDescription":"Kunigami is hard to push off the ball and hard to get past when he tackles. He also reacts faster to loose balls. He can still be tackled.","source":{"type":"official-profile","url":"https://bluelock-kc.com/characters/kunigami/","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"physical"},{"id":"left-footed-long-range-shot","name":"Left-Footed Long-Range Shot","description":"Strikes powerful shots from distance with his preferred left foot.","battleSimType":"Special Move","battleSimDescription":"From 16–32 m, Kunigami's powerful shots are harder for goalkeepers to stop, and saves more often bounce out for a rebound. Defenders can still block them.","source":{"type":"official-profile","url":"https://bluelock-kc.com/characters/kunigami/","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"technical"},{"id":"right-footed-finishing","name":"Right-Footed Finishing","category":"technical","description":"Uses his trained right foot to finish a loose or redirected ball without waiting to bring it onto his stronger left side.","battleSimType":"Special Move","battleSimDescription":"Kunigami can shoot with either foot, so he can switch to the near post when the far post is blocked. His weaker foot is slightly less accurate.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Chapter_185","chapter":185,"note":"Kunigami converts the diverted Isagi shot with his right foot against Manshine City."}}], stats: { ovr:90, off:91, sho:95, spd:87, def:86, pas:75, dri:79, gk:58 },
        battleSim: {
            "awareness": {
                "space": -0.02,
                "defensiveRead": 0.02
            },
            "tendencies": {
                "shoot": 0.06
            },
            "rivals": [
                31
            ],
            "passives": [
                {
                    "id": "physical-dominance",
                    "name": "Physical Dominance",
                    "label": "PHYSICAL DOMINANCE",
                    "effect": "physical-shield",
                    "dialogue": "dribble",
                    "params": {
                        "shield": 6,
                        "looseBall": 0.1
                    },
                    "description": "Kunigami is hard to push off the ball and hard to get past when he tackles. He also reacts faster to loose balls. He can still be tackled."
                },
                {
                    "id": "wild-card-physique",
                    "name": "Wild Card Physique",
                    "label": "WILD CARD PHYSIQUE",
                    "effect": "durable",
                    "params": {
                        "drain": 0.75
                    },
                    "description": "Running and duels tire Kunigami 25% less than other players."
                }
            ],
            "weapons": [
                {
                    "id": "power-shot",
                    "name": "Power Shot",
                    "label": "POWER SHOT",
                    "effect": "power-shot",
                    "dialogue": "powerShot",
                    "params": {
                        "minMetres": 16,
                        "maxMetres": 32,
                        "technique": 0.3,
                        "parry": 0.12
                    },
                    "description": "From 16–32 m, Kunigami's powerful shots are harder for goalkeepers to stop, and saves more often bounce out for a rebound. Defenders can still block them."
                },
                {
                    "id": "ambidextrous-finishing",
                    "name": "Ambidextrous Finishing",
                    "label": "AMBIDEXTROUS FINISHING",
                    "effect": "weak-foot-finish",
                    "dialogue": "ambi",
                    "params": {
                        "anyShot": true,
                        "technique": -0.05,
                        "maxMetres": 26
                    },
                    "description": "Kunigami can shoot with either foot, so he can switch to the near post when the far post is blocked. His weaker foot is slightly less accurate."
                },
                {
                    "id": "rush-volley",
                    "name": "Rush Volley",
                    "label": "RUSH VOLLEY",
                    "effect": "rebound-volley",
                    "dialogue": "rushVolley",
                    "params": {
                        "reach": 1.6,
                        "technique": 0.15,
                        "cooldownTicks": 6
                    },
                    "description": "When a goalkeeper parries a shot within 18 m of goal and Kunigami reaches the ball first, he volleys it straight away. He has to actually get there first."
                },
                {
                    "id": "physical-man-marking",
                    "name": "Physical Man-Marking",
                    "label": "PHYSICAL MAN-MARKING",
                    "effect": "man-marking",
                    "dialogue": "defend",
                    "params": {
                        "targets": [
                            31
                        ],
                        "range": 30,
                        "duel": 4
                    },
                    "description": "When defending, Kunigami marks Shidou if he is nearby, or otherwise the most dangerous attacker close to him. He stays tight to that player and is harder to beat in duels with him."
                }
            ],
            "ultimates": [
                {
                    "id": "physical-breakthrough",
                    "name": "Physical Breakthrough",
                    "label": "PHYSICAL BREAKTHROUGH",
                    "effect": "flow-state",
                    "interpretation": "gameplay",
                    "params": {
                        "boost": {
                            "power-shot": {
                                "technique": 0.42,
                                "maxMetres": 35
                            },
                            "physical-shield": {
                                "shield": 10
                            }
                        }
                    },
                    "description": "Kunigami's Flow. In Flow his Power Shot is even harder to stop and works from up to 35 m, and he is even harder to push off the ball."
                }
            ],
            "reactions": [
                {
                    "id": "second-ball-instinct",
                    "name": "Second Ball Instinct",
                    "label": "SECOND BALL INSTINCT",
                    "members": [
                        6,
                        1
                    ],
                    "effect": "second-ball",
                    "cooldownTicks": 10,
                    "dialogue": "kuniSecond",
                    "interpretation": "gameplay",
                    "params": {
                        "reaction": 0.2
                    },
                    "description": "With Yoichi Isagi on the pitch: when a goalkeeper parries one of Isagi's shots, Kunigami reacts to the rebound a little faster. Other players can still get there first."
                }
            ],
            "dialogue": {
                "powerShot": [
                    "Feel the power of this one.",
                    "Full force."
                ],
                "ambi": [
                    "Right foot works too."
                ],
                "rushVolley": [
                    "Hit it before it drops!"
                ],
                "goal": [
                    "That's the weight of my shot.",
                    "I came back for this."
                ],
                "miss": [
                    "Not enough. Hit it harder."
                ],
                "defend": [
                    "You're not getting past me.",
                    "I'll stay on you all game."
                ],
                "secondBall": [
                    "Second ball's mine!"
                ],
                "kuniSecond": [
                    "Isagi, I'll finish what you start!"
                ],
                "dribble": [
                    "Bounce off."
                ],
                "rival": [
                    "Shidou. I'm marking you."
                ],
                "flow": [
                    "I came back stronger. Watch."
                ]
            }
        }
    };
