// Public simulation kit; canonical football data and ratings preserved.
const PLAYER_15_DATA = {
  "id": 15,
  "name": "Shoei Baro",
  "debutChapter": 5,
  "appearanceOrder": 15,
  "image": "images/shoei-baro.jpg",
  "primaryPosition": "CF",
  "positions": [
    "CF",
    "RW"
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
      "id": "middle-range-shooting",
      "name": "Middle-Range Shooting",
      "description": "Creates shooting space within his established range for powerful finishes.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Shoei_Baro",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "chop-dribble",
      "name": "Chop Dribble",
      "description": "Uses sharp lateral cuts to change direction while carrying the ball.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Shoei_Baro",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "predator-eye",
      "name": "Predator Eye",
      "description": "Watches the goalkeeper and times his shot when their view or reaction is restricted.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Shoei_Baro",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "mental"
    },
    {
      "id": "physical-strength",
      "name": "Physical Strength",
      "category": "physical",
      "description": "Uses his muscular frame to hold a shooting position and resist defenders attempting to push him off the ball.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e3-soccers-zero",
        "note": "Barou repeatedly breaks through Team Z’s physical challenges while carrying and shooting.",
        "episode": 3
      }
    }
  ],
  "stats": {
    "ovr": 93,
    "off": 96,
    "sho": 96,
    "spd": 89,
    "def": 74,
    "pas": 76,
    "dri": 91,
    "gk": 53
  },
  "battleSim": {
    "awareness": {
      "space": 0.06,
      "anticipation": 0.18
    },
    "tendencies": {
      "shoot": 0.16,
      "direct": 0.1,
      "pass": -0.03
    },
    "passives": [
      {
        "id": "kings-ego",
        "name": "King's Ego",
        "label": "KING'S EGO",
        "effect": "goal-hunger",
        "description": "Prefers shooting from dangerous positions and carrying toward goal. Still passes when another chance is better.",
        "params": {},
        "interpretation": true
      },
      {
        "id": "predator-eye",
        "name": "Predator Eye",
        "label": "PREDATOR EYE",
        "effect": "keeper-window",
        "description": "Watches a screened or moving goalkeeper for a shooting window within 29 m. Blocks and saves remain possible.",
        "params": {},
        "interpretation": true
      },
      {
        "id": "villainous-king",
        "name": "Villainous King",
        "label": "VILLAINOUS KING",
        "effect": "flow-state",
        "description": "In Flow, attacks openings directly and sharpens his reading of the goalkeeper. Defenders can recover.",
        "params": {
          "awareness": {
            "space": 0.08,
            "anticipation": 0.12
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "chop-dribble",
        "name": "Chop Dribble",
        "label": "CHOP DRIBBLE",
        "effect": "committed-cut",
        "description": "Cuts away from a nearby defender who steps toward his original path. Can fail. Cooldown: 7 ticks.",
        "params": {
          "cooldownTicks": 7
        },
        "interpretation": true,
        "dialogue": "dribble"
      },
      {
        "id": "middle-range-shot",
        "name": "Middle-Range Shot",
        "label": "MIDDLE-RANGE SHOT",
        "effect": "middle-range-finish",
        "description": "Attempts a powerful shot from 16–29 m with a suitable angle. Can miss, be blocked or saved. Cooldown: 6 ticks.",
        "params": {
          "cooldownTicks": 6
        },
        "interpretation": true,
        "dialogue": "dribble"
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "pass": [
        "Give me the ball!"
      ],
      "receive": [
        "Give me the ball!"
      ],
      "dribble": [
        "Get out of my way!"
      ],
      "shot-attempt": [
        "Get out of my way!"
      ],
      "goal": [
        "Bow to your king!"
      ],
      "miss": [
        "Tch. Next one is mine."
      ],
      "dribbleFail": [
        "Tch. Next one is mine."
      ],
      "passFail": [
        "Tch. Next one is mine."
      ],
      "defend": [
        "You are not getting through!"
      ],
      "flow": [
        "This field belongs to me!"
      ],
      "support": [
        "Give me the ball!"
      ],
      "kickoff": [
        "This field belongs to me!"
      ],
      "foul": [
        "Tch. Next one is mine."
      ],
      "fouled": [
        "Get out of my way!"
      ],
      "offside": [
        "Tch. Next one is mine."
      ]
    }
  }
};
