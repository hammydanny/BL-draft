// Public simulation voice; canonical profile and ratings preserved.
const PLAYER_25_DATA = {
  "id": 25,
  "name": "Aoshi Tokimitsu",
  "debutChapter": 1,
  "appearanceOrder": 25,
  "image": "images/aoshi-tokimitsu.jpg",
  "primaryPosition": "DM",
  "positions": [
    "DM",
    "CM"
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
      "id": "physical-strength",
      "name": "Physical Strength",
      "description": "Uses his powerful build to resist contact and win physical contests.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://bluelock-anime-en.com/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    },
    {
      "id": "stamina",
      "name": "Stamina",
      "description": "Sustains repeated running and physical efforts without quickly tiring.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://bluelock-anime-en.com/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    },
    {
      "id": "agility",
      "name": "Agility",
      "category": "physical",
      "description": "Changes his body’s direction quickly enough to stay with a dribbler even while engaging in a strength contest.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/e13-top3",
        "note": "Tokimitsu catches Bachira’s changing dribble route and retains a physical advantage.",
        "episode": 13
      }
    }
  ],
  "stats": {
    "ovr": 85,
    "off": 82,
    "sho": 82,
    "spd": 83,
    "def": 87,
    "pas": 75,
    "dri": 76,
    "gk": 64
  },
  "battleSim": {
    "passives": [
      {
        "id": "relentless-engine",
        "name": "Relentless Engine",
        "label": "RELENTLESS ENGINE",
        "effect": "durable",
        "description": "Uses less stamina for actual running and actions. Stamina remains finite outside Flow.",
        "params": {
          "drain": 0.72
        },
        "interpretation": true
      },
      {
        "id": "power-shield",
        "name": "Power Shield",
        "label": "POWER SHIELD",
        "effect": "physical-shield",
        "description": "Protects possession with his strength. Multiple defenders, poor control or a well-timed tackle can beat him.",
        "params": {
          "shield": 5
        },
        "interpretation": true
      },
      {
        "id": "assertive-flow",
        "name": "Assertive Flow",
        "label": "ASSERTIVE FLOW",
        "effect": "flow-state",
        "description": "Before Flow, his choices waver a little. In Flow he commits to his decisions, shields more efficiently and drives forward with power. Carries still require space, and defenders can still win the ball.",
        "params": {
          "awareness": {
            "anticipation": 0.06
          },
          "boost": {
            "physical-shield": {
              "shield": 7
            },
            "power-dribble": {
              "protection": 7,
              "stride": 1.13
            }
          },
          "decision": {
            "base": -0.15,
            "flow": 0.35
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "power-drive",
        "name": "Power Drive",
        "label": "POWER DRIVE",
        "effect": "power-dribble",
        "description": "Carries through a contested lane using strength and control. A closed route or stronger challenge can stop him.",
        "params": {
          "protection": 5,
          "stride": 1.1,
          "cooldownTicks": 8
        },
        "interpretation": true
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "I can keep up... I have to."
      ],
      "pass": [
        "Here, you have space."
      ],
      "receive": [
        "Okay, hold it steady."
      ],
      "dribble": [
        "I can push through here."
      ],
      "dribbleFail": [
        "Ah... I should've shielded that."
      ],
      "goal": [
        "I actually did it!",
        "I kept going. I scored!"
      ],
      "miss": [
        "Breathe. Next chance."
      ],
      "defend": [
        "I'll stay on him."
      ],
      "passFail": [
        "Sorry... I'll win it back!"
      ],
      "flow": [
        "I'm not backing away... not this time!"
      ],
      "shot-attempt": [
        "I can take this one."
      ],
      "criticalGoal": [
        "I kept going. I scored!"
      ],
      "foul": [
        "Sorry, I could not stop in time."
      ],
      "fouled": [
        "I was keeping the ball there!"
      ],
      "offside": [
        "Too early. I can fix that."
      ]
    }
  }
};
