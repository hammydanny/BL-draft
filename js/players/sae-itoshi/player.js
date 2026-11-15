// Public simulation kit; canonical football data and ratings preserved.
const PLAYER_14_DATA = {
  "id": 14,
  "name": "Sae Itoshi",
  "debutChapter": 4,
  "appearanceOrder": 14,
  "image": "images/sae-itoshi.jpg",
  "primaryPosition": "AM",
  "positions": [
    "AM",
    "CM"
  ],
  "nationality": {
    "code": "JP",
    "name": "Japan",
    "basis": "national-team-representation",
    "source": {
      "type": "canon-reference",
      "url": "https://bluelock.fandom.com/wiki/Japan_U-20",
      "note": "Listed in the original Japan U-20 national-team roster; recorded country representation, not an inference from club."
    }
  },
  "weapons": [
    {
      "id": "precision-passing",
      "name": "Precision Passing",
      "description": "Controls pass weight and timing to supply teammates through narrow openings.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Sae_Itoshi",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "counter-dribbling",
      "name": "Counter Dribbling",
      "description": "Reads a defender’s approach before using precise touches to move past them.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Sae_Itoshi",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "spatial-awareness",
      "name": "Spatial Awareness",
      "category": "mental",
      "description": "Reads the positions and movement of both teams to identify the passing lane or shooting angle the defence has left open.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "note": "Sae reads the Blue Lock defence and creates Japan U-20’s first goal from a narrow angle.",
        "episode": 31
      }
    },
    {
      "id": "precision-shooting",
      "name": "Precision Shooting",
      "category": "technical",
      "description": "Places curved strikes into narrow goal openings, making his own finishing a threat alongside his passing.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "note": "Sae scores Japan U-20’s opening goal himself from the side of the penalty area.",
        "episode": 31
      }
    }
  ],
  "stats": {
    "ovr": 96,
    "off": 95,
    "sho": 91,
    "spd": 88,
    "def": 78,
    "pas": 98,
    "dri": 96,
    "gk": 58
  },
  "battleSim": {
    "awareness": {
      "vision": 0.14,
      "space": 0.13,
      "anticipation": 0.48,
      "scan": 8
    },
    "tendencies": {
      "pass": 0.16,
      "dribble": 0.03
    },
    "passives": [
      {
        "id": "sae-spatial-awareness",
        "name": "Spatial Awareness",
        "label": "SPATIAL AWARENESS",
        "effect": "space-reading",
        "description": "Reads attacking runs and passing lanes within 55 m. He must still reach the space.",
        "params": {
          "rangeMeters": 55
        },
        "interpretation": true
      },
      {
        "id": "perfect-kick-technique",
        "name": "Perfect Kick Technique",
        "label": "PERFECT KICK TECHNIQUE",
        "effect": "weighted-kick",
        "description": "Reduces delivery errors on passes; defenders can still intercept.",
        "params": {
          "precision": 0.82
        },
        "interpretation": true
      },
      {
        "id": "beautiful-destruction",
        "name": "Beautiful Destruction",
        "label": "BEAUTIFUL DESTRUCTION",
        "effect": "flow-state",
        "description": "In Flow, reads attacking openings earlier and counters a defender who steps in. Physical limits still apply.",
        "params": {
          "awareness": {
            "vision": 0.09,
            "space": 0.1,
            "anticipation": 0.12
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "counter-dribbling",
        "name": "Counter Dribbling",
        "label": "COUNTER DRIBBLING",
        "effect": "counter-dribble",
        "description": "When a nearby defender steps toward him, tries a reachable escape touch. Can fail. Cooldown: 7 ticks.",
        "params": {
          "cooldownTicks": 7
        },
        "interpretation": true,
        "dialogue": "dribble"
      },
      {
        "id": "sae-precision-distribution",
        "name": "Precision Distribution",
        "label": "PRECISION DISTRIBUTION",
        "effect": "decisive-delivery",
        "description": "Attempts a precise forward delivery over 18 m. Defenders can intercept. Cooldown: 8 ticks.",
        "params": {
          "cooldownTicks": 8,
          "precision": 0.72
        },
        "interpretation": true,
        "dialogue": "dribble"
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "pass": [
        "Use it."
      ],
      "receive": [
        "Use it."
      ],
      "dribble": [
        "Too slow."
      ],
      "shot-attempt": [
        "Too slow."
      ],
      "goal": [
        "That is the difference."
      ],
      "miss": [
        "A careless touch."
      ],
      "dribbleFail": [
        "A careless touch."
      ],
      "passFail": [
        "A careless touch."
      ],
      "defend": [
        "I see the route."
      ],
      "flow": [
        "Show me something worthwhile."
      ],
      "support": [
        "Use it."
      ],
      "kickoff": [
        "Show me something worthwhile."
      ],
      "foul": [
        "A careless touch."
      ],
      "fouled": [
        "Too slow."
      ],
      "offside": [
        "A careless touch."
      ]
    }
  }
};
