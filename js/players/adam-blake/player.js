// Character player data: Adam Blake (ID 36).
const PLAYER_36_DATA = {
  "id": 36,
  "name": "Adam Blake",
  "debutChapter": 87,
  "appearanceOrder": 36,
  "image": "images/adam-blake.jpg",
  "primaryPosition": "FW",
  "positions": [
    "FW"
  ],
  "nationality": {
    "code": "GB",
    "name": "United Kingdom",
    "basis": "national-team-representation",
    "source": {
      "type": "canon-reference",
      "url": "https://bluelock.fandom.com/wiki/Adam_Blake",
      "note": "National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."
    },
    "representation": "England"
  },
  "weapons": [
    {
      "id": "physical-strength",
      "name": "Physical Strength",
      "description": "Uses his powerful frame to hold off defenders while advancing towards goal.",
      "battleSimType": "Passive",
      "battleSimDescription": "Adam holds off challenges with his strength: defenders find it harder to take the ball from him, he is harder to beat in a dribbling duel, and he is stronger in aerial contests. A well-timed tackle still works.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Adam_Blake",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    }
  ],
  "stats": {
    "ovr": 96,
    "off": 99,
    "sho": 99,
    "spd": 96,
    "def": 70,
    "pas": 92,
    "dri": 95,
    "gk": 59
  },
  "battleSim": {
    "awareness": {
      "space": 0.03
    },
    "tendencies": {
      "direct": 0.06,
      "shoot": 0.04
    },
    "passives": [
      {
        "id": "physical-superiority",
        "name": "Physical Superiority",
        "label": "PHYSICAL SUPERIORITY",
        "effect": "physical-shield",
        "params": {
          "shield": 7,
          "aerial": 3
        },
        "description": "Adam holds off challenges with his strength: defenders find it harder to take the ball from him, he is harder to beat in a dribbling duel, and he is stronger in aerial contests. A well-timed tackle still works.",
        "interpretation": true
      },
      {
        "id": "unstoppable-engine",
        "name": "Unstoppable Engine",
        "label": "UNSTOPPABLE ENGINE",
        "effect": "flow-state",
        "dialogue": "flow",
        "params": {
          "boost": {
            "physical-shield": {
              "shield": 9
            },
            "power-shot": {
              "technique": 0.38
            }
          }
        },
        "description": "Adam's Flow. In Flow he is even harder to knock off the ball and his long shots are harder to hold. He can still be tackled or saved.",
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "power-shield",
        "name": "Power Shield",
        "label": "POWER SHIELD",
        "effect": "power-dribble",
        "params": {
          "cooldownTicks": 7,
          "stride": 1.15,
          "protection": 7
        },
        "description": "Adam carries the ball with his body between it and the defender, about 15% further than a normal carry and much harder to dispossess. A defender can still win it. Cooldown: 7 ticks.",
        "interpretation": true
      },
      {
        "id": "adam-power-finish",
        "name": "Power Finish",
        "label": "POWER FINISH",
        "effect": "power-shot",
        "params": {
          "cooldownTicks": 8,
          "minMetres": 14,
          "maxMetres": 30,
          "technique": 0.32,
          "parry": 0.15
        },
        "description": "From 14–30 m Adam hits the ball with full power: it is harder for the keeper to hold, not more accurate. Defenders can block it and the keeper can still save. Cooldown: 8 ticks.",
        "interpretation": true,
        "dialogue": "power"
      }
    ],
    "ultimates": [
      {
        "id": "unyielding-charge",
        "name": "Unyielding Charge",
        "label": "UNYIELDING CHARGE",
        "effect": "collision-course",
        "params": {
          "maxMetres": 34,
          "rangeMeters": 5,
          "force": 8,
          "weight": 1.15,
          "value": 0.02
        },
        "description": "In Flow within 34 m of goal, Adam drives straight at the defender in his path within 5 m and tries to go through him with strength. It is a real duel he can lose; if he wins it he carries on toward goal and chooses his shot or pass normally. Once per Flow.",
        "interpretation": true,
        "dialogue": "collision",
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        }
      }
    ],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "Let's go! Hit them hard!"
      ],
      "pass": [
        "Take it!"
      ],
      "receive": [
        "Got it!"
      ],
      "support": [
        "Over here!"
      ],
      "dribble": [
        "Out of my way!"
      ],
      "dribbleFail": [
        "Damn it!"
      ],
      "shot-attempt": [
        "Here it comes!"
      ],
      "goal": [
        "YEAH!!",
        "That's power!"
      ],
      "criticalGoal": [
        "YEAH!! That's it!"
      ],
      "miss": [
        "Argh! Again!"
      ],
      "defend": [
        "Mine!"
      ],
      "passFail": [
        "Damn!"
      ],
      "flow": [
        "Nothing's stopping me now!"
      ],
      "collision": [
        "Straight through you!"
      ],
      "collisionWin": [
        "Move!!"
      ],
      "collisionFail": [
        "Tch—strong..."
      ],
      "power": [
        "Full power!"
      ],
      "concede": [
        "Come on, wake up!"
      ],
      "fouled": [
        "That all you've got?"
      ],
      "foul": [
        "My bad!"
      ],
      "offside": [
        "Ugh, too early!"
      ],
      "save": [
        "Damn, he saved it!"
      ]
    }
  }
};
