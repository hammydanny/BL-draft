// Character player data: Leonardo Luna (ID 34).
const PLAYER_34_DATA = {
  "id": 34,
  "name": "Leonardo Luna",
  "debutChapter": 87,
  "appearanceOrder": 34,
  "image": "images/leonardo-luna.jpg",
  "primaryPosition": "FW",
  "positions": [
    "FW"
  ],
  "nationality": {
    "code": "ES",
    "name": "Spain",
    "basis": "national-team-representation",
    "source": {
      "type": "canon-reference",
      "url": "https://bluelock.fandom.com/wiki/Leonardo_Luna",
      "note": "National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."
    }
  },
  "weapons": [
    {
      "id": "dribbling",
      "name": "Dribbling",
      "description": "Uses close control and deft touches to move through defensive pressure.",
      "battleSimType": "Passive",
      "battleSimDescription": "With a defender within 3.5 m, Luna keeps the ball so close that pressure costs him far less than it costs other dribblers, even with two or three defenders around him. A clean tackle can still win it.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Leonardo_Luna",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    }
  ],
  "stats": {
    "ovr": 96,
    "off": 99,
    "sho": 97,
    "spd": 96,
    "def": 73,
    "pas": 94,
    "dri": 99,
    "gk": 58
  },
  "battleSim": {
    "awareness": {
      "space": 0.04
    },
    "tendencies": {
      "dribble": 0.08
    },
    "passives": [
      {
        "id": "elite-close-control",
        "name": "Elite Close Control",
        "label": "ELITE CLOSE CONTROL",
        "effect": "close-control",
        "params": {
          "tight": 3,
          "crowd": 4
        },
        "description": "With a defender within 3.5 m, Luna keeps the ball so close that pressure costs him far less than it costs other dribblers, even with two or three defenders around him. A clean tackle can still win it.",
        "interpretation": true
      },
      {
        "id": "untouchable-rhythm",
        "name": "Untouchable Rhythm",
        "label": "UNTOUCHABLE RHYTHM",
        "effect": "flow-state",
        "dialogue": "flow",
        "params": {
          "boost": {
            "close-control": {
              "tight": 4,
              "crowd": 5
            }
          }
        },
        "description": "Luna's Flow. In Flow his close control holds up under even heavier pressure. Defenders can still win a clean tackle.",
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "deceptive-touch",
        "name": "Deceptive Touch",
        "label": "DECEPTIVE TOUCH",
        "effect": "counter-dribble",
        "params": {
          "cooldownTicks": 6,
          "pointless": 0.004
        },
        "description": "When a nearby defender steps in toward him, Luna shows the ball one way and touches it the other. If nobody is committing, he does not force it. The defender can still read it. Cooldown: 6 ticks.",
        "interpretation": true
      },
      {
        "id": "elegant-breakthrough",
        "name": "Elegant Breakthrough",
        "label": "ELEGANT BREAKTHROUGH",
        "effect": "creative-dribble",
        "params": {
          "cooldownTicks": 8,
          "feint": 0.14,
          "cuts": [
            -70,
            70
          ]
        },
        "description": "Luna glides past a defender with a sharp, balanced change of direction that makes a poor reader hesitate. A defender who reads it can still tackle him. Cooldown: 8 ticks.",
        "interpretation": true
      }
    ],
    "ultimates": [
      {
        "id": "masterful-escape",
        "name": "Masterful Escape",
        "label": "MASTERFUL ESCAPE",
        "effect": "monster-dance",
        "params": {
          "maxMetres": 36,
          "rangeMeters": 7,
          "maxDuels": 3,
          "risk": 4
        },
        "description": "In Flow within 36 m of goal, with defenders closing within 7 m, Luna slips past up to three of them one after another. Each one is a real dribble that can fail, and he stops as soon as the way is clear. Once per Flow.",
        "interpretation": true,
        "dialogue": "dance",
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        }
      }
    ],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "Let's make this pretty."
      ],
      "pass": [
        "Go on."
      ],
      "receive": [
        "Mm. Nice."
      ],
      "support": [
        "Over here."
      ],
      "dribble": [
        "Too slow, too slow~",
        "Follow me, if you can."
      ],
      "dribbleFail": [
        "Oh? Not bad."
      ],
      "shot-attempt": [
        "Watch this."
      ],
      "goal": [
        "Was that too easy?",
        "Ahaha! Lovely."
      ],
      "criticalGoal": [
        "Game over~"
      ],
      "miss": [
        "Tch, sloppy of me."
      ],
      "defend": [
        "Mine, thank you."
      ],
      "passFail": [
        "Hm. Careless."
      ],
      "flow": [
        "Now you can't even touch me."
      ],
      "dance": [
        "Dance with me, if you can keep up."
      ],
      "danceFail": [
        "Ah... you caught me."
      ],
      "danceEnd": [
        "See? Untouchable."
      ],
      "concede": [
        "Hmm, annoying."
      ],
      "fouled": [
        "Rough, aren't you?"
      ],
      "foul": [
        "Oops."
      ],
      "offside": [
        "Hm, too eager."
      ],
      "save": [
        "Ah, close."
      ]
    }
  }
};
