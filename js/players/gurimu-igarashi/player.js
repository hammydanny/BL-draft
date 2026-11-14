// Character player data: Gurimu Igarashi (ID 5).
const PLAYER_5_DATA = { id: 5, name: "Gurimu Igarashi", debutChapter: 1, appearanceOrder: 5, image: "images/gurimu-igarashi.jpg", primaryPosition: "FW", positions: ["FW", "DF"] , nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}}, weapons: [{"id":"malicia","name":"Malicia","description":"Positions his body to draw contact and earn fouls from opponents.","battleSimType":"Special Move","battleSimDescription":"When a defender comes close, Igarashi can try to draw a foul. It works more often if the defender comes from behind or the side, or arrives fast; careful defenders rarely fall for it. If it fails, he keeps the ball, loses it, or gets a yellow card for diving.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Gurimu_Igarashi","note":"Demonstrated football strength; exact chapter omitted where not independently confirmed."},"category":"technical"}], stats: { ovr:69, off:67, sho:65, spd:68, def:77, pas:66, dri:65, gk:54 },
        battleSim: {
            "awareness": {
                "defensiveRead": 0.03
            },
            "passives": [
                {
                    "id": "never-give-up",
                    "name": "Never Give Up",
                    "label": "NEVER GIVE UP",
                    "effect": "persistent-press",
                    "params": {
                        "press": 0.5,
                        "looseBall": 0.12
                    },
                    "description": "Igarashi joins the press sooner and reacts faster to loose balls. He does not get extra speed or stamina."
                },
                {
                    "id": "opportunist",
                    "name": "Opportunist",
                    "label": "OPPORTUNIST",
                    "effect": "contact-read",
                    "params": {
                        "range": 1
                    },
                    "description": "Igarashi notices defenders rushing in, or coming from a bad angle, a little earlier, which gives him more chances to use Malicia."
                }
            ],
            "weapons": [
                {
                    "id": "malicia",
                    "name": "Malicia",
                    "label": "MALICIA",
                    "effect": "foul-drawing",
                    "dialogue": "malicia",
                    "params": {
                        "base": 0.1,
                        "range": 3.4,
                        "preference": 0.022
                    },
                    "description": "When a defender comes close, Igarashi can try to draw a foul. It works more often if the defender comes from behind or the side, or arrives fast; careful defenders rarely fall for it. If it fails, he keeps the ball, loses it, or gets a yellow card for diving."
                },
                {
                    "id": "right-side-trap",
                    "name": "Right-Side Trap",
                    "label": "RIGHT-SIDE TRAP",
                    "effect": "right-side-trap",
                    "params": {
                        "bonus": 0.1,
                        "cooldownTicks": 8
                    },
                    "description": "When a defender challenges Igarashi from his right side, Malicia is more likely to win a foul. Careful defenders can still avoid it. Short cooldown."
                }
            ],
            "ultimates": [
                {
                    "id": "survival-instinct",
                    "name": "Survival Instinct",
                    "label": "SURVIVAL INSTINCT",
                    "effect": "flow-state",
                    "interpretation": "gameplay",
                    "params": {
                        "boost": {
                            "foul-drawing": {
                                "base": 0.16
                            },
                            "persistent-press": {
                                "press": 0.8,
                                "looseBall": 0.18
                            }
                        }
                    },
                    "description": "Igarashi's Flow. In Flow, Malicia works more often, and he presses and chases loose balls even harder. It does not help his shooting."
                }
            ],
            "dialogue": {
    "malicia": [
        "Gotcha! That's a foul, ref!",
        "Heh, Malicia never fails!"
    ],
    "maliciaFail": [
        "W-wait, he really hit me!",
        "Ugh, the ref saw that..."
    ],
    "defend": [
        "I survived that one!",
        "I'm not giving up!",
        "Survived another one!"
    ],
    "secondBall": [
        "Mine! Loose ball's mine!"
    ],
    "goal": [
        "I am still in this!",
        "Did everyone see?! I scored!"
    ],
    "miss": [
        "No, come on!",
        "Nooo, why not!"
    ],
    "flow": [
        "I am not done yet!"
    ],
    "kickoff": [
        "Please let this go well!"
    ],
    "pass": [
        "Take it, quick!",
        "Do not lose it!"
    ],
    "receive": [
        "Okay, okay, I have it!"
    ],
    "dribble": [
        "Just let me through!"
    ],
    "dribbleFail": [
        "Wait, give it back!"
    ],
    "shot-attempt": [
        "Please go in!"
    ],
    "concede": [
        "We can still do this, right?"
    ],
    "support": [
        "Take it, quick!"
    ],
    "passFail": [
        "Wait, give it back!",
        "No, come on!"
    ],
    "foul": [
        "Wait, give it back!"
    ],
    "save": [
        "I survived that one!"
    ]
}
        }
    };
