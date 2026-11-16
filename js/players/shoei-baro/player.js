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
        "description": "When Barou has a realistic shot (about a 10% chance or better), he shoots instead of playing a safe sideways or backward pass, and takes on defenders when it moves him toward goal. He still passes when a teammate's chance is clearly better.",
        "params": {
          "realistic": 0.1,
          "supportPenalty": 0.006,
          "duel": 0.003
        },
        "interpretation": true
      },
      {
        "id": "predator-eye",
        "name": "Predator Eye",
        "label": "PREDATOR EYE",
        "effect": "keeper-window",
        "description": "Watches the goalkeeper within 29 m. When the keeper is screened or moving across, Barou aims for the open side. If the keeper is still moving and nobody is within 3.5 m of Barou, he may take one small touch to wait for a better moment. Blocks and saves remain possible.",
        "params": {
          "calmMetres": 3.5,
          "patience": 0.003
        },
        "interpretation": true
      },
      {
        "id": "villainous-king",
        "name": "Villainous King",
        "label": "VILLAINOUS KING",
        "effect": "flow-state",
        "description": "Barou's Flow. In Flow he reads space and the keeper sooner, shoots from chances of about 7.5% or better and attacks defenders more directly. He can still be blocked or tackled.",
        "params": {
          "awareness": {
            "space": 0.08,
            "anticipation": 0.12
          },
          "boost": {
            "goal-hunger": {
              "realistic": 0.075,
              "duel": 0.005
            }
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
    "ultimates": [
      {
        "interpretation": true,
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        },
        "id": "devour-villains-shadow",
        "name": "Devour: Villain's Shadow",
        "label": "DEVOUR: VILLAIN'S SHADOW",
        "effect": "devour-shadow",
        "dialogue": "devour",
        "params": {
          "defendersDrawn": 2,
          "drawRadius": 8,
          "carrierRange": 38,
          "barouRange": 36,
          "spaceRange": 26,
          "windowTicks": 3,
          "looseBall": 0.2,
          "passValue": 0.006,
          "finish": 0.1,
          "relief": 1
        },
        "description": "In Flow, when a teammate within 38 m of goal draws two or more defenders, Barou sprints into the space they leave (within 26 m of goal). If the ball reaches him within 3 ticks by a pass, rebound or loose ball, he strikes before they recover. Defenders can follow his run. Once per Flow."
      },
      {
        "interpretation": true,
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        },
        "id": "predator-eye-blindside-execution",
        "name": "Predator Eye: Blindside Execution",
        "label": "PREDATOR EYE: BLINDSIDE EXECUTION",
        "effect": "blindside-execution",
        "dialogue": "blindside",
        "goalDialogue": "blindsideGoal",
        "params": {
          "maxMetres": 24,
          "technique": 0.04,
          "parry": 0.1
        },
        "description": "In Flow, 6–24 m from goal, when the keeper's view is screened, he is moving across or he has left one side uncovered, Barou fires a powerful shot to the side the keeper cannot cover. Nobody may stand right on that line; the shot can still be blocked, saved or missed. Once per Flow."
      }
    ],
    "reactions": [],
    "dialogue": {
      "pass": [
        "Fine. Take it.",
        "Don't waste that."
      ],
      "receive": [
        "Finally.",
        "About time."
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
        "Tch."
      ],
      "defend": [
        "You're not getting through!"
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
        "Out of my way."
      ],
      "fouled": [
        "Is that all you've got?!"
      ],
      "offside": [
        "Tch. Blind linesman."
      ],
      "devour": [
        "Draw them in. The goal is mine.",
        "Your football just became my prey."
      ],
      "devourSuccess": [
        "Thanks for the meal.",
        "The king takes what you built!"
      ],
      "devourFail": [
        "Tch. Nobody fed the king."
      ],
      "blindside": [
        "The keeper's blind. Execution."
      ],
      "blindsideGoal": [
        "Witness the king's execution!"
      ]
    }
  }
};
