// Character player data: Dada Silva (ID 37).
const PLAYER_37_DATA = {
  "id": 37,
  "name": "Dada Silva",
  "debutChapter": 87,
  "appearanceOrder": 37,
  "image": "images/dada-silva.jpg",
  "primaryPosition": "FW",
  "positions": [
    "FW"
  ],
  "nationality": {
    "code": "BR",
    "name": "Brazil",
    "basis": "national-team-representation",
    "source": {
      "type": "canon-reference",
      "url": "https://bluelock.fandom.com/wiki/Dada_Silva",
      "note": "National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."
    }
  },
  "weapons": [
    {
      "id": "aerial-power",
      "name": "Aerial Power",
      "description": "Combines physical strength and jumping ability to dominate aerial challenges.",
      "battleSimType": "Passive",
      "battleSimDescription": "Dada wins headers with explosive jumping power and strength in the contact, not with extra reach. Teammates look for him with high balls. A defender who times his jump well can still beat him.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Dada_Silva",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    }
  ],
  "stats": {
    "ovr": 95,
    "off": 99,
    "sho": 99,
    "spd": 96,
    "def": 74,
    "pas": 88,
    "dri": 93,
    "gk": 63
  },
  "battleSim": {
    "awareness": {
      "anticipation": 0.06
    },
    "tendencies": {
      "shoot": 0.03
    },
    "passives": [
      {
        "id": "aerial-power",
        "name": "Aerial Power",
        "label": "AERIAL POWER",
        "effect": "aerial-power",
        "params": {
          "power": 5,
          "supplyValue": 0.004
        },
        "description": "Dada wins headers with explosive jumping power and strength in the contact, not with extra reach. Teammates look for him with high balls. A defender who times his jump well can still beat him.",
        "interpretation": true
      },
      {
        "id": "aerial-dominance",
        "name": "Aerial Dominance",
        "label": "AERIAL DOMINANCE",
        "effect": "flow-state",
        "dialogue": "flow",
        "params": {
          "boost": {
            "aerial-power": {
              "power": 7
            },
            "aerial-header": {
              "technique": 0.16
            }
          }
        },
        "description": "Dada's Flow. In Flow he is even stronger in the air and his headers are more accurate. He can still lose the header or miss.",
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "dominant-header",
        "name": "Dominant Header",
        "label": "DOMINANT HEADER",
        "effect": "aerial-header",
        "params": {
          "cooldownTicks": 7,
          "maxMetres": 16,
          "technique": 0.14
        },
        "description": "When Dada meets a cross in the air within 16 m of goal, he powers a header at goal. Blocks, saves and misses are still possible. Cooldown: 7 ticks.",
        "interpretation": true,
        "dialogue": "header"
      },
      {
        "id": "physical-aerial-challenge",
        "name": "Physical Aerial Challenge",
        "label": "PHYSICAL AERIAL CHALLENGE",
        "effect": "aerial-challenge",
        "params": {
          "cooldownTicks": 8,
          "challenge": 0.45
        },
        "description": "When a defender challenges him for a high ball played to him, Dada attacks it through the contact and is more likely to win it. He can still lose the header. Cooldown: 8 ticks.",
        "interpretation": true,
        "dialogue": "aerial"
      }
    ],
    "ultimates": [
      {
        "id": "towering-finish",
        "name": "Towering Finish",
        "label": "TOWERING FINISH",
        "effect": "towering-finish",
        "params": {
          "maxMetres": 14,
          "contestMetres": 3.5,
          "technique": 0.06,
          "relief": 1.8,
          "parry": 0.12
        },
        "description": "In Flow, when Dada meets an airborne pass within 14 m of goal with a defender within 3.5 m, he rises through the challenge for a powerful header. It can still be blocked, saved or missed. Once per Flow.",
        "interpretation": true,
        "dialogue": "towering",
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        }
      }
    ],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "Send it high. I'll do the rest."
      ],
      "pass": [
        "Go!"
      ],
      "receive": [
        "Nice."
      ],
      "support": [
        "Cross it!"
      ],
      "aerial": [
        "Mine in the air!"
      ],
      "header": [
        "Up I go!"
      ],
      "towering": [
        "Nobody beats me up there!"
      ],
      "goal": [
        "YES!! Header!",
        "Too high for you!"
      ],
      "criticalGoal": [
        "YES!! That's the one!"
      ],
      "miss": [
        "Ah, so close!"
      ],
      "dribble": [
        "Coming through!"
      ],
      "dribbleFail": [
        "Hm."
      ],
      "shot-attempt": [
        "Come on!"
      ],
      "defend": [
        "Got it!"
      ],
      "passFail": [
        "Ah, my bad."
      ],
      "flow": [
        "Feels light today!"
      ],
      "concede": [
        "Next one."
      ],
      "fouled": [
        "Hey!"
      ],
      "foul": [
        "Sorry!"
      ],
      "offside": [
        "Too early, huh."
      ],
      "save": [
        "What a save..."
      ]
    }
  }
};
