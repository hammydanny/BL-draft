// Character player data: Gin Gagamaru (ID 8).
const PLAYER_8_DATA = { id: 8, name: "Gin Gagamaru", debutChapter: 1, appearanceOrder: 8, image: "images/gin-gagamaru.jpg", primaryPosition: "GK", positions: ["GK", "FW"] , nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [{"id":"acrobatic-body-control","name":"Acrobatic Body Control","description":"Uses springy, flexible movements to reach balls from unusual body positions.","battleSimType":"Passive","battleSimDescription":"In goal, his flexibility lets him reach shots from wide angles and shots aimed at a post more often than other keepers. He still has to be in position to get there.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Gin_Gagamaru","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"physical"},{"id":"goalkeeping-reflexes","name":"Goalkeeping Reflexes","description":"Reacts quickly to close shots and adjusts his body for instinctive saves.","battleSimType":"Special Move","battleSimDescription":"In goal, against a well-placed shot from 8–22 m, Gagamaru reacts in time to dive across and make a much harder shot saveable. After he makes a save with it, it needs 10 ticks to come back.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Gin_Gagamaru","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"technical"}], stats: { ovr:89, off:79, sho:80, spd:87, def:93, pas:88, dri:84, gk:96 },
        battleSim: {
            "passives": [
                {
                    "id": "wild-reflexes",
                    "name": "Wild Reflexes",
                    "label": "WILD REFLEXES",
                    "effect": "reflex-save",
                    "dialogue": "save",
                    "params": {
                        "reflex": 0.28
                    },
                    "description": "In goal, Gagamaru reacts faster to close-range shots: the nearer the shooter (inside about 17 m), the harder he is to beat. Well-placed shots still go in."
                },
                {
                    "id": "springlike-body",
                    "name": "Springlike Body",
                    "label": "SPRINGLIKE BODY",
                    "effect": "acrobatic-reach",
                    "dialogue": "save",
                    "params": {
                        "reach": 0.2
                    },
                    "description": "In goal, his flexibility lets him reach shots from wide angles and shots aimed at a post more often than other keepers. He still has to be in position to get there."
                },
                {
                    "id": "wild-instinct",
                    "name": "Wild Instinct",
                    "label": "WILD INSTINCT",
                    "effect": "flow-state",
                    "dialogue": "flow",
                    "params": {
                        "boost": {
                            "reflex-save": {
                                "reflex": 0.38
                            },
                            "acrobatic-reach": {
                                "reach": 0.28
                            },
                            "smother-block": {
                                "block": 0.45
                            },
                            "super-reflex": {
                                "reflex": 0.4
                            }
                        }
                    },
                    "description": "Gagamaru's Flow. In Flow his reflexes, reach, Super Reflex Save and point-blank blocks all improve. He can still be beaten."
                }
            ],
            "weapons": [
                {
                    "id": "super-reflex-save",
                    "name": "Super Reflex Save",
                    "label": "SUPER REFLEX SAVE",
                    "effect": "super-reflex",
                    "dialogue": "save",
                    "params": {
                        "minMetres": 8,
                        "maxMetres": 22,
                        "reflex": 0.3,
                        "cooldownTicks": 10
                    },
                    "description": "In goal, against a well-placed shot from 8–22 m, Gagamaru reacts in time to dive across and make a much harder shot saveable. After he makes a save with it, it needs 10 ticks to come back."
                },
                {
                    "id": "shachihoko-defense",
                    "name": "Shachihoko Defense",
                    "label": "SHACHIHOKO DEFENSE",
                    "effect": "smother-block",
                    "dialogue": "block",
                    "params": {
                        "maxMetres": 9,
                        "maxGap": 7,
                        "block": 0.35,
                        "cooldownTicks": 12
                    },
                    "description": "In goal, when a shooter is within 9 m and Gagamaru is within 7 m of him, he throws his whole body, even upside down, in front of the ball, making the shot much harder to score. After he makes a save with it, it needs 12 ticks to come back."
                },
                {
                    "id": "bear-claw-deflection",
                    "name": "Bear Claw Deflection",
                    "label": "BEAR CLAW DEFLECTION",
                    "effect": "extended-parry",
                    "params": {
                        "parry": 0.05
                    },
                    "description": "In goal, Gagamaru gets a hand on shots he cannot hold and pushes them away, so more of his saves are parries. A parry leaves a loose ball that either team can win."
                },
                {
                    "id": "scorpion-kick",
                    "name": "Scorpion Kick",
                    "label": "SCORPION KICK",
                    "effect": "acrobatic-finish",
                    "dialogue": "scorpion",
                    "params": {
                        "maxMetres": 12,
                        "technique": 0.15
                    },
                    "description": "Only when he plays outfield: when a cross reaches him within 12 m of goal, he can finish it acrobatically in the air. Defenders and the goalkeeper can still stop it."
                }
            ],
            "dialogue": {
                "save": [
                    "Got it.",
                    "My body moved first."
                ],
                "block": [
                    "Not past me.",
                    "I'll stop it with everything."
                ],
                "scorpion": [
                    "Any part of me can score.",
                    "Like this!"
                ],
                "goal": [
                    "I can score too."
                ],
                "flow": [
                    "I can feel where it's going.",
                    "Shoot. I'll reach it."
                ]
            }
        }
    };
