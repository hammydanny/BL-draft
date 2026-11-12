// Yoichi Isagi // player-specific stats, weapons, descriptions, dialogue and Battle Sim abilities.
const ISAGI_PLAYER_DATA = {
        id: 1, name: "Yoichi Isagi", debutChapter: 1, appearanceOrder: 1, image: "images/yoichi-isagi.jpg", primaryPosition: "CF", positions: ["CF", "AM"],
        stats: { ovr:94, off:98, sho:94, spd:82, def:78, pas:91, dri:84, gk:48 },
        nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}},
        weapons: [
            {"id":"spatial-metavision","name":"Metavision","description":"Repeatedly scans the surrounding field, combining peripheral information into an updated picture of the next scoring route.","battleSimType":"Passive","battleSimDescription":"Isagi sees teammates' runs and gaps from further away than other players, so he spots more passing chances and starts his own runs before the ball is played. It does not make him faster.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"awareness","name":"Awareness","description":"Notices shifts in player positions, open lanes, danger and passing options before they become obvious.","battleSimType":"Passive","battleSimDescription":"Part of Metavision: Isagi notices a teammate's run, and the right moment for a through ball, earlier than most players.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"adaptability","name":"Adaptability","description":"Revises his reading as opponents respond, rules out failing routes and combines available skills before committing to a scoring opportunity.","battleSimType":"Passive","battleSimDescription":"If opponents stop one of Isagi's runs, cut out one of his passes or save one of his shots, he remembers it and tries something different next time. This only lasts for the current match.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"off-the-ball-movements","name":"Off-the-Ball Movements","description":"Times sharp runs into blind spots and open space to arrive where defenders lose track of him.","battleSimType":"Passive","battleSimDescription":"Isagi runs into the space behind the defender marking him while that defender is watching the ball. Only the best defenders follow these runs; the rest react late when the pass comes.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"direct-shot","name":"Direct Shot","description":"Meets the incoming ball with a first-time strike, denying defenders the extra moment a controlling touch would give them.","battleSimType":"Special Move","battleSimDescription":"When a pass reaches Isagi within 24 m of goal, he can shoot straight away without controlling it first. Defenders have less time to block, but the goalkeeper can still save it.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"two-gun-volley","name":"Two-Gun Volley","description":"Threatens a volley with one foot, changes the shooting leg in mid-air and finishes after the defender commits to the first motion.","battleSimType":"Ultimate","battleSimDescription":"Isagi's ultimate, only in Flow. When a pass reaches him within 20 m and a defender jumps in to block, he fakes the shot with one foot and volleys with the other into the open side. The goalkeeper can still save it. At most one goal (two attempts) per match.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"reverse-back-heel-shot","name":"Reverse Back Heel Shot","description":"Disguises a forward strike before redirecting the ball behind him with a backheel to bypass a closing defender.","battleSimType":"Special Move","battleSimDescription":"Rare. Within 16 m of goal, with his back to goal and a defender right behind him, Isagi flicks a backheel shot past that defender. It is hard to pull off, and he must wait a long time before trying it again.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"left-footed-direct-shot","name":"Left-Footed Direct Shot","category":"technical","description":"Finishes first-time with his left foot when a defender closes the angle for his preferred right-footed strike.","battleSimType":"Special Move","battleSimDescription":"The same first-time shot, but with his left foot to the near post. He uses it when the far post is blocked. It is slightly less accurate.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Chapter_211","chapter":211,"note":"Isagi scores with the explicitly named left-footed direct shot against Ubers."}}
        ]
    ,
        battleSim: {
            "awareness": {
                "vision": 0.08,
                "space": 0.12,
                "anticipation": 0.6,
                "scan": 8
            },
            "tendencies": {
                "shoot": 0.04,
                "dribble": -0.03
            },
            "passives": [
                {
                    "id": "metavision",
                    "name": "Metavision",
                    "label": "METAVISION",
                    "effect": "space-reading",
                    "dialogue": "read",
                    "description": "Isagi sees teammates' runs and gaps from further away than other players, so he spots more passing chances and starts his own runs before the ball is played. It does not make him faster."
                },
                {
                    "id": "off-the-ball-movements",
                    "name": "Blind-Spot Movement",
                    "label": "BLIND-SPOT MOVEMENT",
                    "effect": "blind-spot-run",
                    "dialogue": "blindRun",
                    "description": "Isagi runs into the space behind the defender marking him while that defender is watching the ball. Only the best defenders follow these runs; the rest react late when the pass comes."
                },
                {
                    "id": "adaptability",
                    "name": "Adaptability",
                    "label": "ADAPTABILITY",
                    "effect": "tactical-memory",
                    "params": {
                        "maxEntries": 6,
                        "maxCount": 3,
                        "decayTicks": 90,
                        "weight": 0.1
                    },
                    "description": "If opponents stop one of Isagi's runs, cut out one of his passes or save one of his shots, he remembers it and tries something different next time. This only lasts for the current match."
                }
            ],
            "weapons": [
                {
                    "id": "direct-shot",
                    "name": "Direct Shot",
                    "label": "DIRECT SHOT",
                    "effect": "first-time-finish",
                    "dialogue": "directShot",
                    "params": {
                        "maxMetres": 24,
                        "technique": 0.25,
                        "pressureRelief": 2.5,
                        "blockFactor": 0.7
                    },
                    "description": "When a pass reaches Isagi within 24 m of goal, he can shoot straight away without controlling it first. Defenders have less time to block, but the goalkeeper can still save it."
                },
                {
                    "id": "left-footed-direct-shot",
                    "name": "Left-Footed Direct Shot",
                    "label": "LEFT-FOOTED DIRECT SHOT",
                    "effect": "weak-foot-finish",
                    "dialogue": "leftFoot",
                    "params": {
                        "technique": -0.12
                    },
                    "description": "The same first-time shot, but with his left foot to the near post. He uses it when the far post is blocked. It is slightly less accurate."
                },
                {
                    "id": "reverse-back-heel-shot",
                    "name": "Reverse Back Heel Shot",
                    "label": "REVERSE BACK HEEL SHOT",
                    "effect": "disguised-finish",
                    "dialogue": "backHeel",
                    "params": {
                        "maxMetres": 16,
                        "technique": -0.45,
                        "cooldownTicks": 40,
                        "tightMetres": 3
                    },
                    "description": "Rare. Within 16 m of goal, with his back to goal and a defender right behind him, Isagi flicks a backheel shot past that defender. It is hard to pull off, and he must wait a long time before trying it again."
                }
            ],
            "ultimates": [
                {
                    "id": "two-gun-volley",
                    "name": "Two-Gun Volley",
                    "label": "TWO-GUN VOLLEY",
                    "effect": "feint-volley",
                    "dialogue": "volley",
                    "params": {
                        "maxMetres": 20,
                        "technique": 0.45,
                        "maxGoalsPerMatch": 1,
                        "maxAttemptsPerMatch": 2,
                        "commitRange": 4.5
                    },
                    "description": "Isagi's ultimate, only in Flow. When a pass reaches him within 20 m and a defender jumps in to block, he fakes the shot with one foot and volleys with the other into the open side. The goalkeeper can still save it. At most one goal (two attempts) per match."
                }
            ],
            "reactions": [
                {
                    "id": "reflexive-synchronization",
                    "name": "Reflexive Synchronization",
                    "label": "REFLEXIVE SYNCHRONIZATION",
                    "effect": "synchronized-through",
                    "cooldownTicks": 12,
                    "dialogue": "sync",
                    "params": {
                        "precision": 0.55,
                        "value": 0.012
                    },
                    "description": "With Yo Hiori on the pitch: when Isagi makes a run, Hiori spots it even from far away and plays him a more accurate through ball.",
                    "members": [
                        1,
                        27
                    ]
                },
                {
                    "id": "planet-hotline",
                    "name": "Planet Hotline",
                    "label": "PLANET HOTLINE",
                    "effect": "wall-pass",
                    "cooldownTicks": 14,
                    "dialogue": "hotline",
                    "params": {
                        "value": 0.012,
                        "returnValue": 0.02,
                        "precision": 0.6
                    },
                    "description": "With Ranze Kurona on the pitch: when a defender closes Isagi down, he passes to Kurona and sprints past the defender, and Kurona passes it straight back to him more accurately than usual.",
                    "members": [
                        1,
                        26
                    ]
                },
                {
                    "id": "rational-alliance",
                    "name": "Rational Alliance",
                    "label": "RATIONAL ALLIANCE",
                    "effect": "rival-cooperation",
                    "cooldownTicks": 16,
                    "dialogue": "rival",
                    "params": {
                        "margin": 0.08,
                        "value": 0.02,
                        "rivalry": 0.01
                    },
                    "description": "With Michael Kaiser on the pitch: both prefer to shoot themselves, but they pass to each other when the other clearly has the better chance.",
                    "members": [
                        1,
                        49
                    ]
                }
            ],
            "dialogue": {
                "read": [
                    "I can see where the line will be.",
                    "That gap is opening. Now."
                ],
                "blindRun": [
                    "He's watching the ball, not me.",
                    "Out of his sight, into the space."
                ],
                "directShot": [
                    "No touch. Straight in.",
                    "First time. No time for them."
                ],
                "leftFoot": [
                    "The other side is open.",
                    "Left foot. Change the angle."
                ],
                "backHeel": [
                    "He's expecting a turn.",
                    "Behind me. This way."
                ],
                "volley": [
                    "Show one, strike with the other.",
                    "He's committed. Switch."
                ],
                "goal": [
                    "That's the route I saw.",
                    "The picture was complete.",
                    "Every piece fit."
                ],
                "sync": [
                    "Hiori, you saw it too.",
                    "Same picture, Hiori."
                ],
                "hotline": [
                    "Kurona, give it straight back!",
                    "One-two, Kurona!"
                ],
                "creative": [
                    "Bachira pulled them away. That space is mine.",
                    "Keep dancing, Bachira. I'm going."
                ],
                "rival": [
                    "This time, your angle is better.",
                    "Use it, Kaiser. I'll take the next one."
                ],
                "flow": [
                    "Everything is slowing down.",
                    "I can see all of it now."
                ]
            }
        }
    };
