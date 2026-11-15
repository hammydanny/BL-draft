// Public simulation kit; canonical football data and ratings preserved.
const PLAYER_23_DATA = {
  "id": 23,
  "name": "Rin Itoshi",
  "debutChapter": 40,
  "appearanceOrder": 23,
  "image": "images/rin-itoshi.jpg",
  "primaryPosition": "CF",
  "positions": [
    "CF",
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
      "id": "kicking-accuracy",
      "name": "Kicking Accuracy",
      "description": "Varies shot placement, curve and trajectory to attack precise scoring routes.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://bluelock-kc.com/characters/rin/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "field-control",
      "name": "Field Control",
      "description": "Reads teammates and opponents to arrange passing and scoring sequences.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://bluelock-kc.com/characters/rin/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "mental"
    },
    {
      "id": "destructive-duels",
      "name": "Destructive Duels",
      "description": "Challenges opponents through their strongest qualities and responds with tailored techniques.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://bluelock-kc.com/characters/rin/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    }
  ],
  "stats": {
    "ovr": 95,
    "off": 97,
    "sho": 97,
    "spd": 90,
    "def": 83,
    "pas": 91,
    "dri": 92,
    "gk": 60
  },
  "battleSim": {
    "awareness": {
      "vision": 0.1,
      "space": 0.12,
      "anticipation": 0.45,
      "defensiveRead": 0.08,
      "scan": 7
    },
    "tendencies": {
      "shoot": 0.09,
      "pass": 0.04
    },
    "rivals": [
      14
    ],
    "passives": [
      {
        "id": "field-control",
        "name": "Field Control",
        "label": "FIELD CONTROL",
        "effect": "space-reading",
        "description": "Reads visible runs and defensive gaps within 55 m. Opponents keep control of their own movement.",
        "params": {
          "rangeMeters": 55
        },
        "interpretation": true
      },
      {
        "id": "kicking-accuracy",
        "name": "Kicking Accuracy",
        "label": "KICKING ACCURACY",
        "effect": "weighted-kick",
        "description": "Reduces technical passing errors and chooses shooting angles. Distance and pressure still matter.",
        "params": {
          "precision": 0.88
        },
        "interpretation": true
      },
      {
        "id": "destructive-impulse",
        "name": "Destructive Impulse",
        "label": "DESTRUCTIVE IMPULSE",
        "effect": "flow-state",
        "description": "In Flow, pursues direct duels and sharp attacking turns more aggressively. He can still lose possession.",
        "params": {
          "awareness": {
            "space": 0.07,
            "anticipation": 0.12,
            "defensiveRead": 0.05
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "precision-curve-shot",
        "name": "Precision Curve Shot",
        "label": "PRECISION CURVE SHOT",
        "effect": "curve-finish",
        "description": "Attempts a curved shot within 30 m when a side angle is available. Blocks, misses and saves remain possible. Cooldown: 7 ticks.",
        "params": {
          "cooldownTicks": 7
        },
        "interpretation": true,
        "dialogue": "dribble"
      },
      {
        "id": "tactical-manipulation",
        "name": "Tactical Manipulation",
        "label": "TACTICAL MANIPULATION",
        "effect": "committed-cut",
        "description": "Baits a nearby defender into stepping toward him, then tries a reachable change of direction. Can fail. Cooldown: 9 ticks.",
        "params": {
          "cooldownTicks": 9
        },
        "interpretation": true,
        "dialogue": "dribble"
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "pass": [
        "Keep up."
      ],
      "receive": [
        "Keep up."
      ],
      "dribble": [
        "Move. I am breaking through."
      ],
      "shot-attempt": [
        "Move. I am breaking through."
      ],
      "goal": [
        "That is all you have?"
      ],
      "miss": [
        "I will crush you next time."
      ],
      "dribbleFail": [
        "I will crush you next time."
      ],
      "passFail": [
        "I will crush you next time."
      ],
      "defend": [
        "I read that."
      ],
      "flow": [
        "I will destroy you myself."
      ],
      "support": [
        "Keep up."
      ],
      "kickoff": [
        "I will destroy you myself."
      ],
      "foul": [
        "I will crush you next time."
      ],
      "fouled": [
        "Move. I am breaking through."
      ],
      "offside": [
        "I will crush you next time."
      ],
      "rival": [
        "Sae. Watch me break through."
      ]
    }
  }
};
