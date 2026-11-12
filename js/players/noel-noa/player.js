// Character player data: Noel Noa (ID 3).
const PLAYER_3_DATA = { id: 3, name: "Noel Noa", debutChapter: 1, appearanceOrder: 3, image: "images/noel-noa.jpg", primaryPosition: "CF", positions: ["CF", "FW"] , nationality: {"code":"FR","name":"France","basis":"nationality","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Noel_Noa","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [{"id":"ambidexterity","name":"Ambidexterity","description":"Finishes with either foot, removing the need to set up a preferred side.","battleSimType":"Passive","battleSimDescription":"Noa has no weaker foot. He can shoot with either foot, including first time, without losing accuracy.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Noel_Noa","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"physical"},{"id":"ball-control","name":"Ball Control","description":"Keeps the ball secure while changing direction and selecting a shooting route.","battleSimType":"Special Move","battleSimDescription":"When Noa dribbles, he goes in straight lines and covers more ground with each carry. He is hard to knock off the ball, but he does not make sharp turns, and good defenders can still tackle him.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Noel_Noa","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"technical"}], stats: { ovr:98, off:99, sho:98, spd:94, def:84, pas:91, dri:94, gk:66 },
        battleSim: {
            "awareness": {
                "vision": 0.06,
                "space": 0.08,
                "anticipation": 0.4,
                "defensiveRead": 0.04
            },
            "tendencies": {
                "shoot": 0.03
            },
            "passives": [
                {
                    "id": "rational-football",
                    "name": "Rational Football",
                    "label": "RATIONAL FOOTBALL",
                    "effect": "rational-decisions",
                    "params": {
                        "sharpness": 0.45
                    },
                    "description": "Noa weighs up the same options as everyone else but picks the best one far more often. He still cannot know whether a shot or tackle will work."
                },
                {
                    "id": "perfect-ambidexterity",
                    "name": "Perfect Ambidexterity",
                    "label": "PERFECT AMBIDEXTERITY",
                    "effect": "ambidextrous",
                    "params": {
                        "technique": 0,
                        "firstTime": 0.08,
                        "maxMetres": 28
                    },
                    "description": "Noa has no weaker foot. He can shoot with either foot, including first time, without losing accuracy."
                },
                {
                    "id": "elite-off-ball-movement",
                    "name": "Elite Off-Ball Movement",
                    "label": "ELITE OFF-BALL MOVEMENT",
                    "effects": [
                        "decoy-run",
                        "support-movement"
                    ],
                    "description": "Noa keeps making runs even when teammates are already running, which drags defenders with him and opens space. When the ball carrier has no one nearby, he moves close to help."
                }
            ],
            "weapons": [
                {
                    "id": "machine-dribble",
                    "name": "Machine Dribble",
                    "label": "MACHINE DRIBBLE",
                    "effect": "power-dribble",
                    "dialogue": "dribble",
                    "params": {
                        "stride": 1.2,
                        "protection": 5
                    },
                    "description": "When Noa dribbles, he goes in straight lines and covers more ground with each carry. He is hard to knock off the ball, but he does not make sharp turns, and good defenders can still tackle him."
                },
                {
                    "id": "two-footed-execution",
                    "name": "Two-Footed Execution",
                    "label": "TWO-FOOTED EXECUTION",
                    "effect": "switch-foot-finish",
                    "dialogue": "twoFooted",
                    "params": {
                        "technique": 0.06,
                        "commitRange": 4,
                        "maxMetres": 24
                    },
                    "description": "When a defender within 4 m tries to block one side, Noa shoots with his other foot to the other post. The goalkeeper can still save it."
                }
            ],
            "ultimates": [
                {
                    "id": "optimal-execution",
                    "name": "Optimal Execution",
                    "label": "OPTIMAL EXECUTION",
                    "effect": "flow-state",
                    "interpretation": "gameplay",
                    "params": {
                        "boost": {
                            "switch-foot-finish": {
                                "technique": 0.12
                            },
                            "rational-decisions": {
                                "sharpness": 0.65
                            },
                            "power-dribble": {
                                "protection": 8
                            }
                        }
                    },
                    "description": "Noa's Flow. In Flow his decisions are even sharper, his two-footed shots are more accurate and he is harder to tackle. No automatic goals."
                }
            ],
            "reactions": [
                {
                    "id": "imperial-route",
                    "name": "Imperial Route",
                    "label": "IMPERIAL ROUTE",
                    "members": [
                        3,
                        49
                    ],
                    "effect": "rival-cooperation",
                    "cooldownTicks": 14,
                    "dialogue": "route",
                    "interpretation": "gameplay",
                    "params": {
                        "margin": 0.06,
                        "value": 0.02,
                        "rivalry": 0.008,
                        "startsRun": true
                    },
                    "description": "With Michael Kaiser on the pitch: when Kaiser has the ball, Noa makes a run to open a route for him. They only pass to each other when the other clearly has the better chance."
                }
            ],
            "dialogue": {
                "dribble": [
                    "The shortest route.",
                    "No wasted touches."
                ],
                "twoFooted": [
                    "Wrong side. You committed.",
                    "Either foot. Your choice was the mistake."
                ],
                "goal": [
                    "Efficient. As calculated.",
                    "That was the correct answer."
                ],
                "miss": [
                    "An error. Corrected next time."
                ],
                "defend": [
                    "Read and removed."
                ],
                "route": [
                    "Kaiser, your route is better. Take it."
                ],
                "flow": [
                    "Optimal. Every piece is in place."
                ]
            }
        }
    };
