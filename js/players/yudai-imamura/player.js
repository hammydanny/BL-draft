// Character player data: Yudai Imamura (ID 13).
const PLAYER_13_DATA = {
  "id": 13,
  "name": "Yudai Imamura",
  "debutChapter": 1,
  "appearanceOrder": 13,
  "image": "images/yudai-imamura.jpg",
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
      "id": "speed",
      "name": "Speed",
      "category": "physical",
      "description": "Uses running speed to attack open space during Team Z’s early matches.",
      "battleSimType": "Passive",
      "battleSimDescription": "When nearby support is needed, finds an onside passing angle. Markers can close it.",
      "source": {
        "type": "official-profile",
        "url": "https://tv.bluelock-pr.com/tv1st/character/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      }
    },
    {
      "id": "ball-technique",
      "name": "Ball Technique",
      "category": "technical",
      "description": "Combines controlled touches with his forward runs to carry the ball in Team Z’s early attacks.",
      "battleSimType": "Special Move",
      "battleSimDescription": "In a clear forward lane, keeps closer control during a carry. Defenders can still tackle. Cooldown: 7 ticks.",
      "source": {
        "type": "official-profile",
        "url": "https://tv.bluelock-pr.com/tv1st/character/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      }
    }
  ],
  "stats": {
    "ovr": 68,
    "off": 72,
    "sho": 70,
    "spd": 76,
    "def": 54,
    "pas": 67,
    "dri": 72,
    "gk": 41
  },
  "battleSim": {
    "passives": [
      {
        "id": "quick-support",
        "name": "Quick Support",
        "label": "QUICK SUPPORT",
        "effect": "support-movement",
        "description": "When nearby support is needed, finds an onside passing angle. Markers can close it.",
        "params": {},
        "interpretation": true,
        "dialogue": "support"
      },
      {
        "id": "quick-breakthrough",
        "name": "Quick Breakthrough",
        "label": "QUICK BREAKTHROUGH",
        "effect": "flow-state",
        "description": "In Flow, offers short support and controls open-lane carries better. His running speed still limits him.",
        "params": {
          "boost": {
            "controlled-carry": {
              "control": 3
            }
          }
        },
        "interpretation": true,
        "dialogue": "flow"
      }
    ],
    "weapons": [
      {
        "id": "speed-technique-carry",
        "name": "Speed-and-Technique Carry",
        "label": "SPEED-AND-TECHNIQUE CARRY",
        "effect": "controlled-carry",
        "description": "In a clear forward lane, keeps closer control during a carry. Defenders can still tackle. Cooldown: 7 ticks.",
        "params": {
          "cooldownTicks": 7,
          "control": 2
        },
        "interpretation": true,
        "dialogue": "dribble"
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "All right, let us go."
      ],
      "pass": [
        "Here you go, keep it flowing.",
        "Go on, have a go."
      ],
      "receive": [
        "Nice, leave it to me."
      ],
      "dribble": [
        "A little room is all I need."
      ],
      "dribbleFail": [
        "Ah, lost it."
      ],
      "shot-attempt": [
        "I will have a go."
      ],
      "goal": [
        "Hey, that worked!"
      ],
      "miss": [
        "Ah, just off."
      ],
      "defend": [
        "Got that one."
      ],
      "concede": [
        "Come on, plenty of time."
      ],
      "flow": [
        "This feels good."
      ],
      "support": [
        "Here you go, keep it flowing."
      ],
      "passFail": [
        "Ah, lost it.",
        "Ah, just off."
      ],
      "foul": [
        "Ah, lost it."
      ],
      "save": [
        "Got that one."
      ]
    }
  }
};
