// Yoichi Isagi // player-specific stats, weapons, descriptions, dialogue and Battle Sim abilities.
const ISAGI_PLAYER_DATA = {
        id: 1, name: "Yoichi Isagi", debutChapter: 1, appearanceOrder: 1, image: "images/yoichi-isagi.jpg", primaryPosition: "CF", positions: ["CF", "AM"],
        stats: { ovr:94, off:98, sho:94, spd:82, def:78, pas:91, dri:84, gk:48 },
        nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}},
        weapons: [
            {"id":"spatial-metavision","name":"Metavision","description":"Reads the defensive line and identifies gaps up to 50 m away, allowing Isagi to spot passing lanes and position himself before the defense reacts.","battleSimType":"Passive","battleSimDescription":"Reads the defensive line and identifies gaps up to 50 m away, allowing Isagi to spot passing lanes and position himself before the defense reacts.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"adaptability","name":"Adaptability","description":"Revises his reading as opponents respond, rules out failing routes and combines available skills before committing to a scoring opportunity.","battleSimType":"Passive","battleSimDescription":"Remembers failed runs, intercepted passes and saved shots. Isagi avoids repeating the same pattern found in his last three failed events.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"off-the-ball-movements","name":"Blind Spot Movement","description":"When Isagi is being marked, he moves into the defender's blind spot.","battleSimType":"Passive","battleSimDescription":"When Isagi is being marked, he moves into the defender's blind spot.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"direct-shot","name":"Direct Shot","description":"When Isagi receives a pass and shoots first-time, defenders have 30% less blocking effectiveness.","battleSimType":"Special Move","battleSimDescription":"When Isagi receives a pass and shoots first-time, defenders have 30% less blocking effectiveness.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"two-gun-volley","name":"Two-Gun Volley","description":"In Flow after a pass within 20 m, feints against one committed blocker. Other defenders and the keeper can stop it. Once per Flow.","battleSimType":"Ultimate","battleSimDescription":"In Flow after a pass within 20 m, feints against one committed blocker. Other defenders and the keeper can stop it. Once per Flow.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"reverse-back-heel-shot","name":"Reverse Back Heel Shot","description":"In Flow within 20 m, tries to deceive a tackling defender before a backheel shot. A failed feint loses possession. Once per Flow.","battleSimType":"Ultimate","battleSimDescription":"In Flow within 20 m, tries to deceive a tackling defender before a backheel shot. A failed feint loses possession. Once per Flow.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"left-footed-direct-shot","name":"Left-Footed Direct Shot","category":"technical","description":"A variation of Direct Shot: Isagi uses his left foot when the far post is blocked.","battleSimType":"Special Move","battleSimDescription":"A variation of Direct Shot: Isagi uses his left foot when the far post is blocked.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Chapter_211","chapter":211,"note":"Isagi scores with the explicitly named left-footed direct shot against Ubers."}}
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
            "params": {
                "rangeMeters": 50
            },
            "dialogue": "read",
            "description": "Reads the defensive line and identifies gaps up to 50 m away, allowing Isagi to spot passing lanes and position himself before the defense reacts."
        },
        {
            "id": "off-the-ball-movements",
            "name": "Blind Spot Movement",
            "label": "BLIND SPOT MOVEMENT",
            "effect": "blind-spot-run",
            "dialogue": "blindRun",
            "description": "When Isagi is being marked, he moves into the defender's blind spot."
        },
        {
            "id": "adaptability",
            "name": "Adaptability",
            "label": "ADAPTABILITY",
            "effect": "tactical-memory",
            "params": {
                "maxEntries": 3,
                "rollingWindow": 3,
                "weight": 0.1
            },
            "description": "Remembers failed runs, intercepted passes and saved shots. Isagi avoids repeating the same pattern found in his last three failed events."
        },
        {
            "id": "puzzle-completion",
            "name": "Metavision: Puzzle Completion",
            "label": "METAVISION: PUZZLE COMPLETION",
            "effect": "flow-state",
            "dialogue": "flow",
            "params": {
                "awareness": {
                    "vision": 0.06,
                    "space": 0.07,
                    "anticipation": 0.12,
                    "scan": 5
                }
            },
            "description": "In Flow, Isagi notices developing gaps and passing runs earlier, anticipates opponents more effectively and finds better shooting routes. Defenders can still track him, intercept passes and block his shots."
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
                "technique": 0.25,
                "blockFactor": 0.7,
                "cooldownTicks": 5,
                "cooldownGroup": "direct-shot"
            },
            "description": "When Isagi receives a pass and shoots first-time, defenders have 30% less blocking effectiveness."
        },
        {
            "id": "left-footed-direct-shot",
            "name": "Left-Footed Direct Shot",
            "label": "LEFT-FOOTED DIRECT SHOT",
            "effect": "weak-foot-finish",
            "dialogue": "leftFoot",
            "params": {
                "technique": -0.12,
                "cooldownTicks": 5,
                "cooldownGroup": "direct-shot"
            },
            "description": "A variation of Direct Shot: Isagi uses his left foot when the far post is blocked."
        }
    ],
    "ultimates": [
        {
            "id": "reverse-back-heel-shot",
            "name": "Reverse Back Heel Shot",
            "label": "REVERSE BACK HEEL SHOT",
            "effect": "disguised-finish",
            "dialogue": "backHeel",
            "condition": {
                "duringFlow": true
            },
            "oncePerFlow": true,
            "params": {
                "maxMetres": 20,
                "technique": -0.45
            },
            "description": "In Flow within 20 m, tries to deceive a tackling defender before a backheel shot. A failed feint loses possession. Once per Flow."
        },
        {
            "id": "two-gun-volley",
            "name": "Two-Gun Volley",
            "label": "TWO-GUN VOLLEY",
            "effect": "feint-volley",
            "dialogue": "volley",
            "condition": {
                "duringFlow": true,
                "receivedPass": true
            },
            "oncePerFlow": true,
            "params": {
                "maxMetres": 20,
                "technique": 0.45,
                "commitRange": 4.5
            },
            "description": "In Flow after a pass within 20 m, feints against one committed blocker. Other defenders and the keeper can stop it. Once per Flow."
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
            "Direct Shot!"
        ],
        "leftFoot": [
            "Lefty Shoot!"
        ],
        "backHeel": [
            "Just kidding. I fooled you, genius! My reverse direct... Back Heel Shot!"
        ],
        "volley": [
            "This is my ultimate... Two-Gun Volley!"
        ],
        "goal": [
            "That is my goal!",
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
            "The pieces are coming together."
        ],
        "kickoff": [
            "I can build a route from here."
        ],
        "pass": [
            "That lane is open.",
            "Use that gap."
        ],
        "receive": [
            "I see the next piece."
        ],
        "dribble": [
            "I found the gap."
        ],
        "dribbleFail": [
            "That route was closed."
        ],
        "shot-attempt": [
            "I can finish from here."
        ],
        "miss": [
            "I need a different answer."
        ],
        "defend": [
            "I saw that option."
        ],
        "concede": [
            "I need to reset the picture."
        ],
        "support": [
            "That lane is open."
        ],
        "passFail": [
            "That route was closed.",
            "I need a different answer."
        ],
        "foul": [
            "That route was closed."
        ],
        "save": [
            "I saw that option."
        ]
    }
}
    };
