// Public simulation voice; canonical profile and ratings preserved.
const PLAYER_24_DATA = {
  "id": 24,
  "name": "Jyubei Aryu",
  "debutChapter": 1,
  "appearanceOrder": 24,
  "image": "images/jyubei-aryu.jpg",
  "primaryPosition": "CB",
  "positions": [
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
      "id": "aerial-reach",
      "name": "Aerial Reach",
      "description": "Combines long limbs and jumping ability to reach balls above opponents.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://bluelock-anime-en.com/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    }
  ],
  "stats": {
    "ovr": 86,
    "off": 68,
    "sho": 69,
    "spd": 74,
    "def": 90,
    "pas": 76,
    "dri": 79,
    "gk": 67
  },
  "battleSim": {
    "passives": [
      {
        "id": "long-reach",
        "name": "Long Reach",
        "label": "LONG REACH",
        "effect": "aerial-reach",
        "description": "Uses his reach on physically reachable airborne balls. Delivery height, running time and the opponent still decide the contest.",
        "params": {
          "reaction": 0.13,
          "aerial": 4
        },
        "interpretation": true
      },
      {
        "id": "stylish-coverage",
        "name": "Stylish Coverage",
        "label": "STYLISH COVERAGE",
        "effect": "anticipatory-interception",
        "description": "Uses observed runs to cover a passing lane. Cannot reach a ball outside his physical range.",
        "params": {
          "reaction": 0.05
        },
        "interpretation": true
      },
      {
        "id": "stylish-flow",
        "name": "Stylish Flow",
        "label": "STYLISH FLOW",
        "effect": "flow-state",
        "description": "In Flow, judges reachable aerial lanes earlier and positions his long frame more efficiently.",
        "params": {
          "awareness": {
            "anticipation": 0.1,
            "space": 0.07
          },
          "boost": {
            "aerial-reach": {
              "reaction": 0.2,
              "reach": 0.4
            }
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "high-point-clearance",
        "name": "High Point Clearance",
        "label": "HIGH POINT CLEARANCE",
        "effect": "high-point-clearance",
        "description": "After winning a reachable aerial delivery, controls the ball at its high point. May then clear or distribute through an ordinary action. A lost contest gives no control.",
        "params": {
          "cooldownTicks": 8
        },
        "interpretation": true
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "Let us make this stylish."
      ],
      "pass": [
        "A clean line."
      ],
      "receive": [
        "Perfect height."
      ],
      "dribble": [
        "Keep it elegant."
      ],
      "dribbleFail": [
        "That was not stylish."
      ],
      "goal": [
        "An elegant finish.",
        "A finish worthy of the stage."
      ],
      "miss": [
        "The shape was wrong."
      ],
      "defend": [
        "I can reach that."
      ],
      "aerial": [
        "At my highest point."
      ],
      "passFail": [
        "An ugly interruption."
      ],
      "flow": [
        "Every line is clear."
      ],
      "shot-attempt": [
        "Watch the finish."
      ],
      "criticalGoal": [
        "A finish worthy of the stage."
      ],
      "foul": [
        "An inelegant challenge."
      ],
      "fouled": [
        "How unstylish of you."
      ],
      "offside": [
        "I spoiled the line."
      ]
    }
  }
};
