// Character player data: Okuhito Iemon (ID 11).
const PLAYER_11_DATA = { id: 11, name: "Okuhito Iemon", debutChapter: 1, appearanceOrder: 11, image: "images/okuhito-iemon.jpg", primaryPosition: "GK", positions: ["GK", "FW"] , nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [], stats: { ovr:68, off:67, sho:65, spd:70, def:70, pas:68, dri:67, gk:72 },
        battleSim: {
            "passives": [
                {
                    "id": "all-rounder",
                    "name": "All-Rounder",
                    "label": "ALL-ROUNDER",
                    "effect": "support-movement",
                    "dialogue": "support",
                    "params": {
                        "range": 14
                    },
                    "description": "Only when he plays outfield: when the teammate on the ball has no one nearby, Iemon moves close to give him an easy pass. It does not change his ratings in any position."
                },
                {
                    "id": "team-organizer",
                    "name": "Team Organizer",
                    "label": "TEAM ORGANIZER",
                    "effect": "steady-keeper",
                    "dialogue": "save",
                    "params": {
                        "positioning": 0.08,
                        "hold": 0.07
                    },
                    "description": "In goal, when Iemon is well positioned he is slightly harder to beat from 12 m or further, and he catches more shots instead of parrying them, so there are fewer rebounds."
                },
                {
                    "id": "last-line-of-defence",
                    "name": "Last Line of Defence",
                    "label": "LAST LINE OF DEFENCE",
                    "effect": "flow-state",
                    "dialogue": "flow",
                    "params": {
                        "boost": {
                            "steady-keeper": {
                                "positioning": 0.14,
                                "hold": 0.11
                            },
                            "set-piece-ready": {
                                "ready": 0.3
                            }
                        }
                    },
                    "description": "Iemon's Flow. In Flow his positioning and handling improve a little more and he is better prepared for set pieces. He gains no acrobatic saves."
                }
            ],
            "weapons": [
                {
                    "id": "set-piece-readiness",
                    "name": "Set-Piece Readiness",
                    "label": "SET-PIECE READINESS",
                    "effect": "set-piece-ready",
                    "dialogue": "setPiece",
                    "params": {
                        "window": 2,
                        "ready": 0.22
                    },
                    "description": "In goal, for the two ticks after an opposing free kick or corner is taken, Iemon is set for the shot and harder to beat. A well-struck shot can still go in."
                }
            ],
            "dialogue": {
                "save": [
                    "I've got it. Stay calm.",
                    "Leave that one to me."
                ],
                "setPiece": [
                    "Everyone, mark up! I'm ready.",
                    "I know where this is going."
                ],
                "support": [
                    "Here, play it simple."
                ],
                "goal": [
                    "Well done, everyone."
                ],
                "flow": [
                    "Nothing gets past the last line.",
                    "I'll hold. You attack."
                ]
            }
        }
    };
