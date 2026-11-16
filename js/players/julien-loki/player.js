// Character player data: Julien Loki (ID 38).
const PLAYER_38_DATA = {
  "id": 38,
  "name": "Julien Loki",
  "debutChapter": 87,
  "appearanceOrder": 38,
  "image": "images/julien-loki.jpg",
  "primaryPosition": "CF",
  "positions": [
    "CF",
    "FW"
  ],
  "nationality": {
    "code": "FR",
    "name": "France",
    "basis": "national-team-representation",
    "source": {
      "type": "canon-reference",
      "url": "https://bluelock.fandom.com/wiki/Julien_Loki",
      "note": "National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."
    }
  },
  "weapons": [
    {
      "id": "godspeed",
      "name": "Godspeed",
      "description": "Uses exceptional acceleration and speed to exploit gaps before defenders can respond.",
      "battleSimType": "Passive",
      "battleSimDescription": "Loki has elite acceleration and the highest top speed at the same time: he reaches full pace almost at once and keeps it. On a knock-and-run, a slower defender is left behind. A defender already standing in his path can still stop him.",
      "source": {
        "type": "official-profile",
        "url": "https://tv.bluelock-pr.com/tv1st/news/1844/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    }
  ],
  "stats": {
    "ovr": 97,
    "off": 96,
    "sho": 94,
    "spd": 99,
    "def": 74,
    "pas": 91,
    "dri": 97,
    "gk": 61
  },
  "battleSim": {
    "awareness": {
      "space": 0.05,
      "anticipation": 0.12
    },
    "tendencies": {
      "direct": 0.06
    },
    "passives": [
      {
        "id": "godspeed",
        "name": "Godspeed",
        "label": "GODSPEED",
        "effect": "godspeed",
        "params": {
          "acceleration": 1.3,
          "raceTopSpeed": 1.05,
          "start": 0.15,
          "race": 0.4
        },
        "description": "Loki has elite acceleration and the highest top speed at the same time: he reaches full pace almost at once and keeps it. On a knock-and-run, a slower defender is left behind. A defender already standing in his path can still stop him.",
        "interpretation": true
      },
      {
        "id": "speed-recognition",
        "name": "Speed Recognition",
        "label": "SPEED RECOGNITION",
        "effect": "speed-recognition",
        "params": {
          "turn": 0.5,
          "read": 0.04
        },
        "description": "Loki judges an opponent's pace at a glance. When a ball is played in behind him, he turns and starts his recovery run sooner than other defenders. He still has to win the race.",
        "interpretation": true
      },
      {
        "id": "divine-tempo",
        "name": "Divine Tempo",
        "label": "DIVINE TEMPO",
        "effect": "flow-state",
        "dialogue": "flow",
        "params": {
          "boost": {
            "godspeed": {
              "acceleration": 1.36,
              "race": 0.5
            }
          }
        },
        "description": "Loki's Flow. In Flow he accelerates even harder and pulls further away from slower defenders on a knock-and-run. A defender in his path can still stop him.",
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "godspeed-burst",
        "name": "Godspeed Burst",
        "label": "GODSPEED BURST",
        "effect": "push-dribble",
        "params": {
          "cooldownTicks": 7,
          "stride": 1.7,
          "space": 5
        },
        "description": "With at least 5 m of open grass ahead, Loki knocks the ball past his marker and accelerates onto it, covering about 70% more ground than a normal dribble. Pace decides it; a defender in the way can still take the ball. Cooldown: 7 ticks.",
        "interpretation": true
      }
    ],
    "ultimates": [
      {
        "id": "godspeed-breakthrough",
        "name": "Godspeed Breakthrough",
        "label": "GODSPEED BREAKTHROUGH",
        "effect": "godspeed-breakthrough",
        "params": {
          "minAhead": 40,
          "maxMetres": 52,
          "runMetres": 16,
          "runSeconds": 1.7,
          "maxDefenders": 1,
          "space": 4,
          "weight": 1.05,
          "value": 0.006
        },
        "description": "In Flow within 52 m of goal, Loki finds a gap with at most one defender in the way and 4 m of space beyond it, and bursts up to 16 m through it with the ball. A defender in the path can still win it; after the burst he shoots or passes as normal. Once per Flow.",
        "interpretation": true,
        "dialogue": "godspeed",
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        }
      }
    ],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "Let us begin. Keep up, if you can."
      ],
      "pass": [
        "Take it."
      ],
      "receive": [
        "Good."
      ],
      "support": [
        "Here."
      ],
      "dribble": [
        "Too slow."
      ],
      "dribbleFail": [
        "Hm. Well read."
      ],
      "shot-attempt": [
        "Now."
      ],
      "goal": [
        "Did you even see it?",
        "Too late. Always too late."
      ],
      "criticalGoal": [
        "Too late. Always too late."
      ],
      "miss": [
        "Hm. Imprecise."
      ],
      "defend": [
        "You thought you'd outrun me?"
      ],
      "passFail": [
        "My error."
      ],
      "flow": [
        "Now I'll show you real speed."
      ],
      "godspeed": [
        "Watch closely. You won't see it twice."
      ],
      "godspeedWin": [
        "Already gone."
      ],
      "godspeedFail": [
        "...Impressive."
      ],
      "concede": [
        "Calm. We answer."
      ],
      "fouled": [
        "Only a foul can stop me?"
      ],
      "foul": [
        "Forgive me."
      ],
      "offside": [
        "A step too eager."
      ],
      "save": [
        "Hm."
      ]
    }
  }
};
