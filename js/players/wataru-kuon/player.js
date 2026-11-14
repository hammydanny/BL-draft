// Character player data: Wataru Kuon (ID 12).
const PLAYER_12_DATA = {
  "id": 12,
  "name": "Wataru Kuon",
  "debutChapter": 1,
  "appearanceOrder": 12,
  "image": "images/wataru-kuon.jpg",
  "primaryPosition": "FW",
  "positions": [
    "FW"
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
      "id": "jumping-power",
      "name": "Jumping Power",
      "description": "Uses his vertical leap to reach high balls and challenge opponents in the air.",
      "battleSimType": "Passive",
      "battleSimDescription": "On reachable lofted balls, reacts 0.18 seconds earlier. Running speed and goalkeeper claims still matter.",
      "source": {
        "type": "official-profile",
        "url": "https://tv.bluelock-pr.com/tv1st/character/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    }
  ],
  "stats": {
    "ovr": 71,
    "off": 76,
    "sho": 73,
    "spd": 79,
    "def": 66,
    "pas": 70,
    "dri": 71,
    "gk": 55
  },
  "battleSim": {
    "passives": [
      {
        "id": "aerial-reach",
        "name": "Aerial Reach",
        "label": "AERIAL REACH",
        "effect": "aerial-reach",
        "description": "On reachable lofted balls, reacts 0.18 seconds earlier. Running speed and goalkeeper claims still matter.",
        "params": {
          "reaction": 0.18
        },
        "interpretation": true,
        "dialogue": "aerial"
      },
      {
        "id": "aerial-dominance",
        "name": "Aerial Dominance",
        "label": "AERIAL DOMINANCE",
        "effect": "flow-state",
        "description": "In Flow, improves aerial timing on reachable balls. Defenders and goalkeepers can still win.",
        "params": {
          "boost": {
            "aerial-reach": {
              "reaction": 0.23
            },
            "aerial-header": {
              "technique": 0.14
            }
          }
        },
        "interpretation": true,
        "dialogue": "flow"
      }
    ],
    "weapons": [
      {
        "id": "high-point-header",
        "name": "High-Point Header",
        "label": "HIGH-POINT HEADER",
        "effect": "aerial-header",
        "description": "After reaching an airborne cross within 16 m, attempts a header. Blocks, saves and misses remain possible. Cooldown: 8 ticks.",
        "params": {
          "maxMetres": 16,
          "cooldownTicks": 8,
          "technique": 0.08
        },
        "interpretation": true,
        "dialogue": "header"
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "aerial": [
        "I can reach that height."
      ],
      "header": [
        "At the highest point!"
      ],
      "kickoff": [
        "Let us keep our shape."
      ],
      "pass": [
        "Use the space ahead.",
        "Keep the shape around it."
      ],
      "receive": [
        "That delivery works."
      ],
      "dribble": [
        "I have a route through."
      ],
      "dribbleFail": [
        "I misjudged the challenge."
      ],
      "shot-attempt": [
        "I will attack this ball."
      ],
      "goal": [
        "The timing worked."
      ],
      "miss": [
        "I need better timing."
      ],
      "defend": [
        "I was watching that lane."
      ],
      "concede": [
        "Let us organize again."
      ],
      "flow": [
        "I can judge the flight clearly."
      ],
      "support": [
        "Use the space ahead."
      ],
      "passFail": [
        "I misjudged the challenge.",
        "I need better timing."
      ],
      "foul": [
        "I misjudged the challenge."
      ],
      "save": [
        "I was watching that lane."
      ]
    }
  }
};
