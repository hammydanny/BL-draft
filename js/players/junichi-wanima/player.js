// Character player data: Junichi Wanima (ID 18).
const PLAYER_18_DATA = {
  "id": 18,
  "name": "Junichi Wanima",
  "debutChapter": 1,
  "appearanceOrder": 18,
  "image": "images/junichi-wanima.jpg",
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
      "id": "twin-combination-play",
      "name": "Twin Combination Play",
      "description": "Coordinates runs and exchanges with Keisuke through their practiced understanding.",
      "battleSimType": "Special Move",
      "battleSimDescription": "With both twins active 4–18 m apart, attempts a one-two. Either pass can be intercepted. Shared cooldown: 12 ticks.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Junichi_Wanima",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    }
  ],
  "stats": {
    "ovr": 73,
    "off": 76,
    "sho": 72,
    "spd": 76,
    "def": 65,
    "pas": 72,
    "dri": 73,
    "gk": 45
  },
  "battleSim": {
    "passives": [
      {
        "id": "combination-awareness",
        "name": "Combination Awareness",
        "label": "COMBINATION AWARENESS",
        "effect": "support-movement",
        "description": "When nearby support is needed, finds an onside passing angle. Markers can close it.",
        "params": {},
        "interpretation": true,
        "dialogue": "support"
      },
      {
        "id": "silent-synchronization",
        "name": "Silent Synchronization",
        "label": "SILENT SYNCHRONIZATION",
        "effect": "flow-state",
        "description": "In Flow, improves short support timing. Twin combinations still require Keisuke on the pitch.",
        "params": {
          "awareness": {
            "anticipation": 0.08
          }
        },
        "interpretation": true,
        "dialogue": "flow"
      }
    ],
    "weapons": [],
    "ultimates": [],
    "reactions": [
      {
        "id": "eye-contact",
        "name": "Eye Contact",
        "label": "EYE CONTACT",
        "effect": "wall-pass",
        "description": "With both twins active 4–18 m apart, attempts a one-two. Either pass can be intercepted. Shared cooldown: 12 ticks.",
        "params": {
          "minDistance": 4,
          "maxDistance": 18,
          "value": 0.012,
          "returnValue": 0.015,
          "precision": 0.2
        },
        "interpretation": true,
        "dialogue": "twin",
        "members": [
          18,
          19
        ],
        "cooldownTicks": 12
      }
    ],
    "dialogue": {
      "twin": [
        "Hnn.",
        "Grr."
      ],
      "kickoff": [
        "Hmph."
      ],
      "pass": [
        "Hnn.",
        "Hmph."
      ],
      "receive": [
        "Ngh.",
        "Hnn."
      ],
      "dribble": [
        "Grr.",
        "Hnn!"
      ],
      "dribbleFail": [
        "Ngh..."
      ],
      "shot-attempt": [
        "Hnn!"
      ],
      "goal": [
        "Hmph!",
        "Hnn!"
      ],
      "miss": [
        "Grr..."
      ],
      "defend": [
        "Hnn."
      ],
      "concede": [
        "Ngh."
      ],
      "flow": [
        "Hnn..."
      ],
      "support": [
        "Hnn."
      ],
      "passFail": [
        "Ngh...",
        "Grr..."
      ],
      "foul": [
        "Ngh..."
      ],
      "save": [
        "Hnn."
      ]
    }
  }
};
