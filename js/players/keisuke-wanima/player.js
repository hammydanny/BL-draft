// Public simulation voice; canonical profile and ratings preserved.
const PLAYER_19_DATA = {
  "id": 19,
  "name": "Keisuke Wanima",
  "debutChapter": 1,
  "appearanceOrder": 19,
  "image": "images/keisuke-wanima.jpg",
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
      "description": "Coordinates runs and exchanges with Junichi through their practiced understanding.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Keisuke_Wanima",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    }
  ],
  "stats": {
    "ovr": 72,
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
        "id": "twin-support",
        "name": "Twin Support",
        "label": "TWIN SUPPORT",
        "effect": "support-movement",
        "description": "Finds a nearby onside passing angle. Eye Contact still requires Junichi on the pitch.",
        "params": {},
        "interpretation": true
      },
      {
        "id": "twin-anticipation",
        "name": "Twin Anticipation",
        "label": "TWIN ANTICIPATION",
        "effect": "flow-state",
        "description": "In Flow, reads short support angles earlier. Alone, gains only a modest anticipation improvement.",
        "params": {
          "awareness": {
            "anticipation": 0.08,
            "space": 0.05
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "Brother, keep it short."
      ],
      "pass": [
        "Brother, this way!",
        "Use the inside lane."
      ],
      "receive": [
        "He says: give it back."
      ],
      "support": [
        "My brother is asking for the return."
      ],
      "twin": [
        "He says: now!",
        "My brother wants the return pass."
      ],
      "dribble": [
        "Give us room."
      ],
      "dribbleFail": [
        "We need another angle."
      ],
      "goal": [
        "That's how we combine!",
        "You saw that, brother!"
      ],
      "miss": [
        "Next time, closer."
      ],
      "defend": [
        "Brother, cover behind me."
      ],
      "passFail": [
        "They read the exchange."
      ],
      "flow": [
        "I know where he will move."
      ],
      "shot-attempt": [
        "I've got the angle."
      ],
      "criticalGoal": [
        "You saw that, brother!"
      ],
      "foul": [
        "I had to break up that move."
      ],
      "fouled": [
        "You broke our rhythm!"
      ],
      "offside": [
        "Brother, we started too early."
      ]
    }
  }
};
