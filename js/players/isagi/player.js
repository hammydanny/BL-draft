// Yoichi Isagi // player-specific stats, weapons, descriptions, dialogue and Battle Sim abilities.
const ISAGI_PLAYER_DATA = {
        id: 1, name: "Yoichi Isagi", debutChapter: 1, appearanceOrder: 1, image: "images/yoichi-isagi.jpg", primaryPosition: "CF", positions: ["CF", "AM"],
        stats: { ovr:94, off:98, sho:94, spd:82, def:78, pas:91, dri:84, gk:48 },
        nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}},
        weapons: [
            {"id":"spatial-metavision","name":"Metavision","description":"Repeatedly scans the surrounding field, combining peripheral information into an updated picture of the next scoring route.","battleSimType":"Passive","battleSimDescription":"Battle Sim: reads runs, gaps and passing options from further away and predicts the back line's shift. No stat boost.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"awareness","name":"Awareness","description":"Notices shifts in player positions, open lanes, danger and passing options before they become obvious.","battleSimType":"Passive","battleSimDescription":"Battle Sim: part of Metavision. Isagi recognises teammates' runs and the timing of a through ball earlier than most players.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"adaptability","name":"Adaptability","description":"Revises his reading as opponents respond, rules out failing routes and combines available skills before committing to a scoring opportunity.","battleSimType":"Passive","battleSimDescription":"Battle Sim: remembers run channels, passing lanes and shot placements opponents have shut down this match and adjusts.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"off-the-ball-movements","name":"Off-the-Ball Movements","description":"Times sharp runs into blind spots and open space to arrive where defenders lose track of him.","battleSimType":"Passive","battleSimDescription":"Battle Sim: Blind-Spot Movement. Runs behind his marker's line of sight; only elite defensive readers track them.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"direct-shot","name":"Direct Shot","description":"Meets the incoming ball with a first-time strike, denying defenders the extra moment a controlling touch would give them.","battleSimType":"Special Move","battleSimDescription":"Battle Sim: a first-time finish from a pass inside 24 m. Less time for defenders to close or block; the keeper still contests it.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"two-gun-volley","name":"Two-Gun Volley","description":"Threatens a volley with one foot, changes the shooting leg in mid-air and finishes after the defender commits to the first motion.","battleSimType":"Ultimate","battleSimDescription":"Battle Sim: in Flow, after a pass, feints a committing defender and switches the volley to the open side. One goal per match at most.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"reverse-back-heel-shot","name":"Reverse Back Heel Shot","description":"Disguises a forward strike before redirecting the ball behind him with a backheel to bypass a closing defender.","battleSimType":"Special Move","battleSimDescription":"Battle Sim: rare. Moving away from goal with a defender tight on him, he backheels a disguised finish past that defender.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"left-footed-direct-shot","name":"Left-Footed Direct Shot","category":"technical","description":"Finishes first-time with his left foot when a defender closes the angle for his preferred right-footed strike.","battleSimType":"Special Move","battleSimDescription":"Battle Sim: a left-footed first-time finish towards the near post when the far-post angle is blocked or already read.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Chapter_211","chapter":211,"note":"Isagi scores with the explicitly named left-footed direct shot against Ubers."}}
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
                    "description": "Reads runs, gaps and passing options from further away, predicts how the back line will shift and starts his runs before the pass is played. It never makes him faster."
                },
                {
                    "id": "off-the-ball-movements",
                    "name": "Blind-Spot Movement",
                    "label": "BLIND-SPOT MOVEMENT",
                    "effect": "blind-spot-run",
                    "dialogue": "blindRun",
                    "description": "Times runs into the space behind his marker's line of sight. Only elite defensive readers track them; other defenders react late when the ball is played."
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
                    "description": "Remembers, for this match only, the run channels, passing lanes and shot placements that opponents have shut down, and changes his choices. The memory is small and fades."
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
                    "description": "Strikes a pass first-time inside 24 m without a controlling touch, so the nearest defender has less time to close him down or block. The goalkeeper still has to be beaten."
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
                    "description": "The same first-time finish with his left foot towards the near post, chosen when the far-post angle is blocked or already read. Slightly less precise."
                },
                {
                    "id": "reverse-back-heel-shot",
                    "name": "Reverse Back Heel Shot",
                    "label": "REVERSE BACK HEEL SHOT",
                    "effect": "disguised-finish",
                    "dialogue": "backHeel",
                    "params": {
                        "maxMetres": 14,
                        "technique": -0.45,
                        "cooldownTicks": 40
                    },
                    "description": "Rare: moving away from goal with a defender tight on him inside 14 m, he disguises the strike and backheels it past that defender. Difficult to execute, with a long cooldown."
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
                        "maxAttemptsPerMatch": 2
                    },
                    "description": "In Flow, when a pass reaches him and a defender commits to the block, he fakes the volley with one foot and strikes with the other towards the open side. The goalkeeper still contests it. At most one goal from two attempts per match."
                }
            ],
            "reactions": [
                {
                    "id": "reflexive-synchronization",
                    "name": "Reflexive Synchronization",
                    "label": "REFLEXIVE SYNCHRONIZATION",
                    "partnerId": 27,
                    "effect": "synchronized-through",
                    "cooldownTicks": 12,
                    "dialogue": "sync",
                    "params": {
                        "precision": 0.55,
                        "value": 0.012
                    },
                    "description": "With Yo Hiori: Hiori reads Isagi's run beyond his normal field of view and plays a more precisely weighted through ball into it."
                },
                {
                    "id": "planet-hotline",
                    "name": "Planet Hotline",
                    "label": "PLANET HOTLINE",
                    "partnerId": 26,
                    "effect": "wall-pass",
                    "cooldownTicks": 14,
                    "dialogue": "hotline",
                    "params": {
                        "value": 0.012,
                        "returnValue": 0.02,
                        "precision": 0.6
                    },
                    "description": "With Ranze Kurona: when Isagi is closed down, he plays into Kurona and sprints behind his marker for a precise first-time return."
                },
                {
                    "id": "creative-instinct",
                    "name": "Creative Instinct",
                    "label": "CREATIVE INSTINCT",
                    "partnerId": 4,
                    "effect": "exploit-disruption",
                    "cooldownTicks": 14,
                    "dialogue": "creative",
                    "params": {
                        "defendersDrawn": 2,
                        "returnValue": 0.02,
                        "precision": 0.7
                    },
                    "description": "With Meguru Bachira: when Bachira's dribble drags two or more defenders, Isagi moves into the space they left and Bachira can find him there."
                },
                {
                    "id": "rational-alliance",
                    "name": "Rational Alliance",
                    "label": "RATIONAL ALLIANCE",
                    "partnerId": 49,
                    "effect": "rival-cooperation",
                    "cooldownTicks": 16,
                    "dialogue": "rival",
                    "params": {
                        "margin": 0.08,
                        "value": 0.02,
                        "rivalry": 0.01
                    },
                    "description": "With Michael Kaiser: the two rivals prefer to finish themselves, but pass to each other when the other's chance is clearly better."
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
