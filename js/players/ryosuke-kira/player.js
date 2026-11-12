// Character player data: Ryosuke Kira (ID 2).
const PLAYER_2_DATA = { id: 2, name: "Ryosuke Kira", debutChapter: 1, appearanceOrder: 2, image: "images/ryosuke-kira.jpg", primaryPosition: "FW", positions: ["FW"] , nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [], stats: { ovr:79, off:83, sho:84, spd:79, def:60, pas:77, dri:80, gk:43 },
        battleSim: {
            "awareness": {
                "vision": 0.02
            },
            "tendencies": {
                "pass": 0.04,
                "shoot": -0.02
            },
            "rivals": [
                1
            ],
            "passives": [
                {
                    "id": "composed-forward",
                    "name": "Composed Forward",
                    "label": "COMPOSED FORWARD",
                    "effect": "support-movement",
                    "interpretation": "gameplay",
                    "description": "When the teammate on the ball has no one nearby, Kira moves close to give him an easy pass. He prefers simple passing moves to risky dribbles."
                },
                {
                    "id": "strikers-pride",
                    "name": "Striker's Pride",
                    "label": "STRIKER'S PRIDE",
                    "effect": "pride",
                    "dialogue": "responsibility",
                    "interpretation": "gameplay",
                    "params": {
                        "shoot": 0.22,
                        "quietAfter": 30
                    },
                    "description": "When his team is losing, or he hasn't had a shot after the first 30 ticks, Kira becomes more willing to shoot. His shots do not become more accurate."
                }
            ],
            "weapons": [
                {
                    "id": "aces-finish",
                    "name": "Ace's Finish",
                    "label": "ACE'S FINISH",
                    "effect": "controlled-finish",
                    "dialogue": "aceFinish",
                    "interpretation": "gameplay",
                    "params": {
                        "maxMetres": 18,
                        "technique": 0.12
                    },
                    "description": "When Kira gets the ball within 18 m of goal with no defender within 2 m, he places a calm shot into the far corner. It is a little more accurate than a normal shot."
                }
            ],
            "ultimates": [
                {
                    "id": "reclaimed-pride",
                    "name": "Reclaimed Pride",
                    "label": "RECLAIMED PRIDE",
                    "effect": "flow-state",
                    "interpretation": "gameplay",
                    "params": {
                        "boost": {
                            "controlled-finish": {
                                "maxMetres": 21,
                                "technique": 0.16
                            },
                            "pride": {
                                "always": true,
                                "shoot": 0.26
                            }
                        }
                    },
                    "description": "Kira's Flow. In Flow he is always willing to shoot, and he can use Ace's Finish from up to 21 m. His stats do not change."
                }
            ],
            "dialogue": {
                "support": [
                    "I'm here, use me!",
                    "Keep it simple. I've got your back."
                ],
                "responsibility": [
                    "This one is mine to finish.",
                    "I won't hide from this chance."
                ],
                "aceFinish": [
                    "Pick the corner. Stay calm."
                ],
                "goal": [
                    "That's how a striker answers.",
                    "I'm still here. Remember that."
                ],
                "miss": [
                    "Not good enough. Again.",
                    "I had that one..."
                ],
                "rival": [
                    "Isagi... I won't fall behind you again."
                ],
                "flow": [
                    "My pride's back. Give me the ball."
                ]
            }
        }
    };
