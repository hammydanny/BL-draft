// Character player data: Hyoma Chigiri (ID 7).
const PLAYER_7_DATA = { id: 7, name: "Hyoma Chigiri", debutChapter: 1, appearanceOrder: 7, image: "images/hyoma-chigiri.jpg", primaryPosition: "LW", positions: ["LW", "RW", "RWB", "RB"] , nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [{"id":"top-speed","name":"Top Speed","description":"Carries attacks into open space with sustained sprinting speed.","battleSimType":"Passive","battleSimDescription":"When Chigiri is already sprinting, he starts races for through balls at close to full speed and wins more footraces when he knocks the ball ahead. Sharp turns at speed cost him control, and he is never faster than his top speed.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Hyoma_Chigiri","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"physical"},{"id":"golden-zone-shot","name":"Golden Zone Shot","description":"Cuts in from the left to shoot from his practiced diagonal scoring zone.","battleSimType":"Special Move","battleSimDescription":"From his favourite diagonal spot, about 15–23 m from goal at an angle of roughly 30–58°, Chigiri's shot to the far post is more accurate, and he looks for dribbles that take him there. Defenders can block it and the goalkeeper can save it.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Hyoma_Chigiri","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"technical"},{"id":"high-speed-dribbling","name":"High-Speed Dribbling","category":"technical","description":"Controls the ball at sprinting pace, using changes of direction to beat pressure before choosing a shot or a delivery into the space his run has opened.","battleSimType":"Special Move","battleSimDescription":"With at least 5 m of open grass ahead, Chigiri knocks the ball forward and chases it, covering about 50% more ground than a normal dribble. Speed decides it more than skill, and a defender in the way can still take the ball.","source":{"type":"anime-subtitles","url":"https://subs.yakuaru.com/books/blue-lock/page/e9-awakening","note":"Chigiri runs with the ball beyond Zantetsu to score during Team Z versus Team V.","episode":9}}], stats: { ovr:93, off:88, sho:88, spd:98, def:68, pas:80, dri:93, gk:49 },
        battleSim: {
            "awareness": {
                "space": 0.03
            },
            "tendencies": {
                "direct": 0.08,
                "dribble": 0.03
            },
            "passives": [
                {
                    "id": "top-speed-specialist",
                    "name": "Top-Speed Specialist",
                    "label": "TOP-SPEED SPECIALIST",
                    "effect": "sprint-momentum",
                    "params": {
                        "carry": 0.35,
                        "race": 5
                    },
                    "description": "When Chigiri is already sprinting, he starts races for through balls at close to full speed and wins more footraces when he knocks the ball ahead. Sharp turns at speed cost him control, and he is never faster than his top speed."
                },
                {
                    "id": "high-speed-awareness",
                    "name": "High-Speed Awareness",
                    "label": "HIGH-SPEED AWARENESS",
                    "effect": "wide-runner",
                    "params": {
                        "wide": 4
                    },
                    "description": "Chigiri makes his runs behind the defence through the wide channels instead of crowding the middle. Defenders who read the run can still follow it."
                },
                {
                    "id": "red-panther-sniper",
                    "name": "Red Panther Sniper",
                    "label": "RED PANTHER SNIPER",
                    "effect": "flow-state",
                    "dialogue": "flow",
                    "params": {
                        "boost": {
                            "sprint-momentum": {
                                "carry": 0.42,
                                "race": 7
                            },
                            "speed-cut": {
                                "value": 0.012
                            },
                            "zone-finish": {
                                "technique": 0.4,
                                "approach": 0.02
                            }
                        }
                    },
                    "description": "Chigiri's Flow. In Flow he carries more speed into races, cuts inside more readily and his Golden Zone Shot is more accurate. The shot can still be blocked or saved."
                }
            ],
            "weapons": [
                {
                    "id": "no-break-dribble",
                    "name": "No-Break Dribble",
                    "label": "NO-BREAK DRIBBLE",
                    "effect": "push-dribble",
                    "dialogue": "sprint",
                    "params": {
                        "stride": 1.5,
                        "space": 5
                    },
                    "description": "With at least 5 m of open grass ahead, Chigiri knocks the ball forward and chases it, covering about 50% more ground than a normal dribble. Speed decides it more than skill, and a defender in the way can still take the ball."
                },
                {
                    "id": "high-speed-cut-in",
                    "name": "High-Speed Cut-In",
                    "label": "HIGH-SPEED CUT-IN",
                    "effect": "speed-cut",
                    "dialogue": "cut",
                    "params": {
                        "angle": 48,
                        "minSpeed": 0.35,
                        "value": 0.006
                    },
                    "description": "When Chigiri is sprinting down the wing in the attacking half, he can cut inside at speed without the usual loss of control. A defender covering the inside can still stop him."
                },
                {
                    "id": "golden-zone-shot",
                    "name": "Golden Zone Shot",
                    "label": "GOLDEN ZONE SHOT",
                    "effect": "zone-finish",
                    "dialogue": "zone",
                    "params": {
                        "metres": [
                            15,
                            23
                        ],
                        "angle": [
                            30,
                            58
                        ],
                        "technique": 0.3,
                        "approach": 0.012
                    },
                    "description": "From his favourite diagonal spot, about 15–23 m from goal at an angle of roughly 30–58°, Chigiri's shot to the far post is more accurate, and he looks for dribbles that take him there. Defenders can block it and the goalkeeper can save it."
                }
            ],
            "reactions": [
                {
                    "id": "speed-and-vision",
                    "name": "Speed and Vision",
                    "label": "SPEED AND VISION",
                    "members": [
                        7,
                        1
                    ],
                    "effect": "synchronized-through",
                    "cooldownTicks": 14,
                    "dialogue": "sync",
                    "params": {
                        "precision": 0.65,
                        "value": 0.01
                    },
                    "description": "When Isagi has the ball, Chigiri sets off on a run at the same moment and Isagi spots it even from far away, playing a more accurate through ball. Offside still counts and defenders can still catch the pass."
                }
            ],
            "dialogue": {
                "sprint": [
                    "Try to keep up.",
                    "Nobody catches me in open grass."
                ],
                "cut": [
                    "Inside. Too fast for you.",
                    "You can't turn with me."
                ],
                "zone": [
                    "This is my zone.",
                    "From here, I don't miss the angle."
                ],
                "goal": [
                    "That's my speed.",
                    "Caught the wind. Goal."
                ],
                "miss": [
                    "Too hasty. Again.",
                    "My legs were ready. My shot wasn't."
                ],
                "sync": [
                    "Isagi, put it in front of me!",
                    "You see it. I'll run it."
                ],
                "flow": [
                    "Nothing holds these legs now.",
                    "Faster. I can go faster."
                ]
            }
        }
    };
