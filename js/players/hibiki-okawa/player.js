// Character player data: Hibiki Okawa (ID 17).
const PLAYER_17_DATA = {
  "id": 17,
  "name": "Hibiki Okawa",
  "debutChapter": 1,
  "appearanceOrder": 17,
  "image": "images/hibiki-okawa.jpg",
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
      "id": "super-shooting",
      "name": "Super Shooting",
      "category": "technical",
      "description": "Disrupts a goalkeeper's timing with a feint before releasing his shot.",
      "battleSimType": "Special Move",
      "battleSimDescription": "Within 20 m, delays a shot against a moving goalkeeper. Pressure or a recovering keeper can stop it. Cooldown: 8 ticks.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Hibiki_Okawa",
        "note": "Named shooting repertoire; game distances, pressure conditions and cooldowns are interpretation."
      }
    },
    {
      "id": "chip-shot",
      "name": "Chip Shot",
      "category": "technical",
      "description": "Lifts a finish over opponents by striking beneath the ball.",
      "battleSimType": "Special Move",
      "battleSimDescription": "Within 24 m, lifts a shot over an advanced goalkeeper. It can miss or be saved. Cooldown: 10 ticks.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Hibiki_Okawa",
        "note": "Named shooting repertoire; game distances, pressure conditions and cooldowns are interpretation."
      }
    }
  ],
  "stats": {
    "ovr": 73,
    "off": 78,
    "sho": 79,
    "spd": 73,
    "def": 55,
    "pas": 68,
    "dri": 73,
    "gk": 42
  },
  "battleSim": {
    "passives": [
      {
        "id": "strikers-timing",
        "name": "Striker's Timing",
        "label": "STRIKER'S TIMING",
        "effect": "finishing-run",
        "description": "Near goal, seeks an onside receiving position. Defenders can track the run.",
        "params": {},
        "interpretation": true,
        "dialogue": "support"
      },
      {
        "id": "finishing-instinct",
        "name": "Finishing Instinct",
        "label": "FINISHING INSTINCT",
        "effect": "flow-state",
        "description": "In Flow, reads finishing positions and selects suitable shots better. Blocks, saves and misses remain possible.",
        "params": {
          "boost": {
            "timed-finish": {
              "timing": 0.18
            },
            "chip-finish": {
              "timing": 0.18
            }
          }
        },
        "interpretation": true,
        "dialogue": "flow"
      }
    ],
    "weapons": [
      {
        "id": "super-shooting",
        "name": "Super Shooting",
        "label": "SUPER SHOOTING",
        "effect": "timed-finish",
        "description": "Within 20 m, delays a shot against a moving goalkeeper. Pressure or a recovering keeper can stop it. Cooldown: 8 ticks.",
        "params": {
          "maxMetres": 20,
          "cooldownTicks": 8,
          "timing": 0.12
        },
        "interpretation": true,
        "dialogue": "superShot"
      },
      {
        "id": "chip-shot",
        "name": "Chip Shot",
        "label": "CHIP SHOT",
        "effect": "chip-finish",
        "description": "Within 24 m, lifts a shot over an advanced goalkeeper. It can miss or be saved. Cooldown: 10 ticks.",
        "params": {
          "maxMetres": 24,
          "cooldownTicks": 10,
          "timing": 0.12
        },
        "interpretation": true,
        "dialogue": "chip"
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "superShot": [
        "Wait... now!"
      ],
      "chip": [
        "Over the keeper."
      ],
      "kickoff": [
        "Get the ball forward."
      ],
      "pass": [
        "Here, build another chance.",
        "Let us build the next attack."
      ],
      "receive": [
        "Good, I can use this."
      ],
      "dribble": [
        "There is a way through."
      ],
      "dribbleFail": [
        "Lost that one."
      ],
      "shot-attempt": [
        "I will take the finish."
      ],
      "goal": [
        "That is the finish I wanted!"
      ],
      "miss": [
        "I should score from there."
      ],
      "defend": [
        "I will take that ball."
      ],
      "concede": [
        "Get me another chance."
      ],
      "flow": [
        "I can feel the timing."
      ],
      "support": [
        "Here, build another chance."
      ],
      "passFail": [
        "Lost that one."
      ],
      "foul": [
        "Lost that one."
      ],
      "save": [
        "I will take that ball."
      ]
    }
  }
};
