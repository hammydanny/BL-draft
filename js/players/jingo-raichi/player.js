// Public simulation dialogue; canonical profile and ratings preserved.
const PLAYER_9_DATA = {
  "id": 9,
  "name": "Jingo Raichi",
  "debutChapter": 1,
  "appearanceOrder": 9,
  "image": "images/jingo-raichi.jpg",
  "primaryPosition": "DM",
  "positions": [
    "DM",
    "CB"
  ],
  "nationality": {
    "code": "JP",
    "name": "Japan",
    "basis": "national-team-representation",
    "source": {
      "type": "official-profile",
      "url": "https://kodansha.us/series/blue-lock/volume-1/",
      "note": "National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."
    }
  },
  "weapons": [
    {
      "id": "stamina",
      "name": "Stamina",
      "description": "Maintains physical pressure and repeated defensive efforts throughout a match.",
      "battleSimType": "Passive",
      "battleSimDescription": "Pressing, marking and duels tire Raichi 35% less than other players. His stamina still runs down.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Jingo_Raichi",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    },
    {
      "id": "man-marking",
      "name": "Man-Marking",
      "description": "Stays close to an assigned opponent and contests their space and possession.",
      "battleSimType": "Special Move",
      "battleSimDescription": "When defending, Raichi picks the most dangerous attacker near his position, stays tight to him and is harder to beat in duels with him. If that player dribbles past him, Raichi recovers faster than other defenders. Cutting out a pass meant for his man earns extra match rating.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Jingo_Raichi",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    }
  ],
  "stats": {
    "ovr": 87,
    "off": 79,
    "sho": 82,
    "spd": 77,
    "def": 90,
    "pas": 81,
    "dri": 82,
    "gk": 62
  },
  "battleSim": {
    "awareness": {
      "defensiveRead": 0.04
    },
    "tendencies": {
      "shoot": -0.05
    },
    "passives": [
      {
        "id": "immense-stamina",
        "name": "Immense Stamina",
        "label": "IMMENSE STAMINA",
        "effect": "durable",
        "params": {
          "drain": 0.65
        },
        "description": "Pressing, marking and duels tire Raichi 35% less than other players. His stamina still runs down."
      },
      {
        "id": "physical-aggression",
        "name": "Physical Aggression",
        "label": "PHYSICAL AGGRESSION",
        "effects": [
          "aggression",
          "persistent-press"
        ],
        "dialogue": "press",
        "params": {
          "duel": 3,
          "foulRisk": 0.012,
          "press": 0.5
        },
        "description": "Raichi joins the press sooner and is harder to dribble past, but he gives away more fouls than other defenders."
      },
      {
        "id": "unbreakable-marking",
        "name": "Unbreakable Marking",
        "label": "UNBREAKABLE MARKING",
        "effect": "flow-state",
        "dialogue": "flow",
        "params": {
          "boost": {
            "man-marking": {
              "duel": 7
            },
            "quick-recovery": {
              "recovery": 0.45
            },
            "aggression": {
              "duel": 5
            },
            "stalking-horse": {
              "read": 0.14
            }
          }
        },
        "description": "Raichi's Flow. In Flow he is harder for his marked opponent to beat, reads passes into that opponent better and recovers faster after being dribbled past. Opponents can still escape him."
      }
    ],
    "weapons": [
      {
        "id": "man-marking",
        "name": "Man-Marking",
        "label": "MAN-MARKING",
        "effects": [
          "man-marking",
          "quick-recovery"
        ],
        "dialogue": "mark",
        "params": {
          "range": 30,
          "duel": 4,
          "recovery": 0.3
        },
        "description": "When defending, Raichi picks the most dangerous attacker near his position, stays tight to him and is harder to beat in duels with him. If that player dribbles past him, Raichi recovers faster than other defenders. Cutting out a pass meant for his man earns extra match rating."
      },
      {
        "id": "stalking-horse-defense",
        "name": "Stalking Horse Defense",
        "label": "STALKING HORSE DEFENSE",
        "effect": "stalking-horse",
        "params": {
          "radius": 6,
          "read": 0.1
        },
        "description": "When Raichi is within 6 m of the player he is marking, he waits a step ahead of him and is more likely to cut out passes played to that player. Quick passing around him and runs he cannot follow still beat it."
      },
      {
        "id": "relentless-duel",
        "name": "Relentless Duel",
        "label": "RELENTLESS DUEL",
        "effect": "physical-shield",
        "dialogue": "duel",
        "params": {
          "shield": 5,
          "looseBall": 0.08
        },
        "description": "In physical contests Raichi is hard to push off the ball and hard to get past, and he reacts faster to loose balls. He can still lose the duel."
      }
    ],
    "reactions": [
      {
        "id": "cornered-prey",
        "name": "Cornered Prey",
        "label": "CORNERED PREY",
        "members": [
          9,
          1
        ],
        "effect": "mark-and-read",
        "cooldownTicks": 16,
        "dialogue": "trap",
        "params": {
          "range": 14,
          "read": 0.12
        },
        "description": "When Raichi is marking an opponent tightly and Isagi is within 14 m, Isagi reads passes played to that opponent earlier and is more likely to intercept them. Nothing is guaranteed."
      },
      {
        "id": "ace-neutralization",
        "name": "Ace Neutralization",
        "label": "ACE NEUTRALIZATION",
        "members": [
          9,
          26
        ],
        "effect": "ace-neutralization",
        "cooldownTicks": 12,
        "dialogue": "aceRaichi",
        "interpretation": true,
        "params": {
          "markMetres": 4.5,
          "rangeMeters": 18,
          "passMetres": 32,
          "dangerMetres": 30,
          "dangerOff": 88,
          "windowTicks": 3,
          "read": 0.15,
          "closing": 1
        },
        "description": "With Kurona on the pitch: when Raichi is tight (within 4.5 m) on a dangerous attacker (within 30 m of goal, or OFF 88+ in Raichi's half) and Kurona is within 18 m, Kurona steps into the passing line for up to 3 ticks and reads passes to that attacker earlier. The attacker can escape and the pass can go elsewhere. Cooldown: 12 ticks."
      }
    ],
    "dialogue": {
      "mark": [
        "You're mine all game!",
        "Go on, try to lose me!"
      ],
      "press": [
        "Get back here!",
        "I'm not tired. Are you?"
      ],
      "duel": [
        "Out of my way!",
        "Too soft!"
      ],
      "trap": [
        "Isagi! He's got nowhere to go!",
        "I pinned him. Finish it!"
      ],
      "fail": [
        "Tch. Lucky.",
        "Next time I flatten you."
      ],
      "goal": [
        "HAH! Now who's just a defender?!",
        "Did you see that?!",
        "See that?! That's Raichi!"
      ],
      "flow": [
        "Come on! I'll chase you all game!"
      ],
      "kickoff": [
        "Do not get in my way!"
      ],
      "pass": [
        "Move! Take it!",
        "Do not waste my pass!"
      ],
      "receive": [
        "About time!"
      ],
      "dribble": [
        "Try stopping me!"
      ],
      "dribbleFail": [
        "Give that back!"
      ],
      "shot-attempt": [
        "Move! I'm shooting!"
      ],
      "miss": [
        "Damn it! Again!"
      ],
      "defend": [
        "HAH! You thought you'd get past me?!",
        "You are going nowhere!"
      ],
      "concede": [
        "Get back in position!"
      ],
      "support": [
        "Move! Take it!"
      ],
      "passFail": [
        "Oi! I gave that straight to them!"
      ],
      "foul": [
        "What?! I was going for the ball!"
      ],
      "save": [
        "You are going nowhere!"
      ],
      "fouled": [
        "Oi! Play the ball, then!"
      ],
      "offside": [
        "Tch! Next time, get the timing right!"
      ],
      "criticalGoal": [
        "See that?! That's Raichi!"
      ],
      "lockdown": [
        "You're not breathing without me!",
        "I'm sticking to you, bastard!"
      ],
      "lockdownEnd": [
        "Ha! Couldn't shake me!"
      ],
      "lockdownFail": [
        "Damn it, slippery bastard!"
      ],
      "aceRaichi": [
        "Kurona! He's yours!"
      ]
    },
    "ultimates": [
      {
        "interpretation": true,
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        },
        "id": "relentless-lockdown",
        "name": "Relentless Lockdown",
        "label": "RELENTLESS LOCKDOWN",
        "effect": "relentless-lockdown",
        "dialogue": "lockdown",
        "params": {
          "triggerMetres": 8,
          "dangerOff": 85,
          "dangerMetres": 34,
          "ticks": 3,
          "gapMetres": 0.9,
          "stamina": 1.5,
          "deny": 0.08,
          "breakMetres": 12
        },
        "description": "In Flow, when the attacker Raichi is marking is dangerous in Raichi's half (OFF 85+ or within 34 m of goal), he shadows him goal-side for 3 ticks, using 1.5 stamina per tick. Passes to that attacker are harder to receive. Speed, dribbling or a 12 m gap breaks it. Once per Flow."
      }
    ]
  }
};
