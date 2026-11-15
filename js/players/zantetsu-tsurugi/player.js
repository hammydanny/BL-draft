// Public simulation voice; canonical profile and ratings preserved.
const PLAYER_22_DATA = {
  "id": 22,
  "name": "Zantetsu Tsurugi",
  "debutChapter": 1,
  "appearanceOrder": 22,
  "image": "images/zantetsu-tsurugi.jpg",
  "primaryPosition": "RW",
  "positions": [
    "RW",
    "RM",
    "WB"
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
      "id": "explosive-acceleration",
      "name": "Explosive Acceleration",
      "description": "Reaches speed quickly over short distances to gain an early running advantage.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://tv.bluelock-pr.com/tv1st/news/211/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    },
    {
      "id": "left-footed-shooting",
      "name": "Left-Footed Shooting",
      "description": "Uses his left foot to finish from his preferred diagonal attacking area.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://tv.bluelock-pr.com/tv1st/news/211/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    }
  ],
  "stats": {
    "ovr": 84,
    "off": 84,
    "sho": 81,
    "spd": 95,
    "def": 70,
    "pas": 73,
    "dri": 82,
    "gk": 48
  },
  "battleSim": {
    "passives": [
      {
        "id": "explosive-acceleration",
        "name": "Explosive Acceleration",
        "label": "EXPLOSIVE ACCELERATION",
        "effect": "explosive-acceleration",
        "description": "Accelerates faster over the first few metres. Top speed still comes from his unchanged SPD.",
        "params": {
          "acceleration": 1.5
        },
        "interpretation": true
      },
      {
        "id": "explosive-flow",
        "name": "Explosive Flow",
        "label": "EXPLOSIVE FLOW",
        "effect": "flow-state",
        "description": "In Flow, reads the start earlier and uses his burst more efficiently. Top speed remains unchanged.",
        "params": {
          "awareness": {
            "anticipation": 0.08
          },
          "boost": {
            "push-dribble": {
              "stride": 1.3
            }
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "explosive-burst",
        "name": "Explosive Burst",
        "label": "EXPLOSIVE BURST",
        "effect": "push-dribble",
        "description": "Knocks the ball into real forward space and accelerates after it. Turning or a blocked route prevents the burst; the chase can fail.",
        "params": {
          "stride": 1.25,
          "space": 6,
          "cooldownTicks": 7
        },
        "interpretation": true
      },
      {
        "id": "left-foot-angle",
        "name": "Left-Footed Diagonal",
        "label": "LEFT-FOOTED DIAGONAL",
        "effect": "zone-finish",
        "description": "Improves a left-footed diagonal finish only from the right channel within a realistic shooting angle.",
        "params": {
          "minDistance": 10,
          "maxDistance": 25,
          "minAngle": 16,
          "maxAngle": 53,
          "side": "right",
          "logit": 0.22,
          "approach": 0.008
        },
        "interpretation": true
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "I will get there first."
      ],
      "pass": [
        "Go on, ahead of me."
      ],
      "receive": [
        "Now accelerate."
      ],
      "dribble": [
        "You lost the first step."
      ],
      "dribbleFail": [
        "I turned too soon."
      ],
      "goal": [
        "My left foot has the answer.",
        "Fast enough. That is the word."
      ],
      "miss": [
        "That angle was too acute... or obtuse."
      ],
      "defend": [
        "I can catch him."
      ],
      "passFail": [
        "That was not the trajectory."
      ],
      "flow": [
        "The first step is mine."
      ],
      "shot-attempt": [
        "Across the goal."
      ],
      "criticalGoal": [
        "Fast enough. That is the word."
      ],
      "foul": [
        "I arrived too quickly."
      ],
      "fouled": [
        "You cannot just trip me!"
      ],
      "offside": [
        "Too much acceleration. Bad timing."
      ]
    }
  }
};
