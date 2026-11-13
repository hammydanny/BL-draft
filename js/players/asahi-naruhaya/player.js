// Character player data: Asahi Naruhaya (ID 10).
const PLAYER_10_DATA = { id: 10, name: "Asahi Naruhaya", debutChapter: 1, appearanceOrder: 10, image: "images/asahi-naruhaya.jpg", primaryPosition: "FW", positions: ["FW"] , nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [{"id":"off-the-ball-movement","name":"Off-the-Ball Movement","description":"Times runs into defenders’ blind spots to become available behind them.","battleSimType":"Special Move","battleSimDescription":"Naruhaya starts runs behind the defence from up to 24 m behind the defensive line, and he still makes his run when two teammates are already running. He only gets into position: he still has to receive the pass and finish.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Asahi_Naruhaya","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"mental"}], stats: { ovr:70, off:77, sho:68, spd:81, def:54, pas:67, dri:75, gk:42 },
        battleSim: {
            "tendencies": {
                "shoot": 0.02
            },
            "passives": [
                {
                    "id": "blind-spot-specialist",
                    "name": "Blind-Spot Specialist",
                    "label": "BLIND-SPOT SPECIALIST",
                    "effect": "blind-spot-run",
                    "dialogue": "blindRun",
                    "params": {
                        "trackRead": 0.84
                    },
                    "description": "Naruhaya runs behind his marker while that defender is watching the ball. Good defenders follow these runs more easily than they follow Isagi's, but average ones react late."
                },
                {
                    "id": "underdogs-determination",
                    "name": "Underdog's Determination",
                    "label": "UNDERDOG'S DETERMINATION",
                    "effect": "run-hunger",
                    "params": {
                        "rest": 2
                    },
                    "description": "After a run that is not used, Naruhaya is ready to go again sooner than other players. It does not make his shooting any better."
                },
                {
                    "id": "desperate-breakthrough",
                    "name": "Desperate Breakthrough",
                    "label": "DESPERATE BREAKTHROUGH",
                    "effect": "flow-state",
                    "dialogue": "flow",
                    "params": {
                        "boost": {
                            "run-hunger": {
                                "rest": 1
                            },
                            "ghost-run": {
                                "cooldownTicks": 8
                            },
                            "blind-spot-run": {
                                "trackRead": 0.88
                            }
                        }
                    },
                    "description": "Naruhaya's Flow. In Flow he makes runs almost without rest, Ghost Run comes back sooner and his runs are harder to follow. His finishing stays the same."
                }
            ],
            "weapons": [
                {
                    "id": "off-the-ball-movement",
                    "name": "Off-the-Ball Movement",
                    "label": "OFF-THE-BALL MOVEMENT",
                    "effect": "run-timing",
                    "params": {
                        "reach": 24
                    },
                    "description": "Naruhaya starts runs behind the defence from up to 24 m behind the defensive line, and he still makes his run when two teammates are already running. He only gets into position: he still has to receive the pass and finish."
                },
                {
                    "id": "ghost-run",
                    "name": "Ghost Run",
                    "label": "GHOST RUN",
                    "effect": "ghost-run",
                    "dialogue": "ghost",
                    "params": {
                        "cooldownTicks": 14
                    },
                    "description": "Once every 14 ticks, a blind-side run by Naruhaya starts at full speed and is even harder for defenders to follow. It only gets him into position: he still has to receive the pass and finish."
                }
            ],
            "dialogue": {
                "blindRun": [
                    "He never saw me go.",
                    "Behind you."
                ],
                "ghost": [
                    "Now. While nobody's looking.",
                    "This is the only way I win."
                ],
                "goal": [
                    "I did it! I really scored!",
                    "That one's for my family!"
                ],
                "miss": [
                    "Why can't I finish it?!",
                    "I got there... and wasted it."
                ],
                "flow": [
                    "I'm not going home yet.",
                    "One more run. One more!"
                ]
            }
        }
    };
