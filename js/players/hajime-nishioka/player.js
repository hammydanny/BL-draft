// Public simulation voice; canonical profile and ratings preserved.
const PLAYER_70_DATA = {
  "id": 70,
  "name": "Hajime Nishioka",
  "debutChapter": 1,
  "appearanceOrder": 70,
  "image": "images/hajime-nishioka.webp",
  "primaryPosition": "FW",
  "positions": [
    "FW"
  ],
  "statEstimate": true,
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
  "weapons": [],
  "stats": {
    "ovr": 76,
    "off": 78,
    "sho": 74,
    "spd": 78,
    "def": 49,
    "pas": 74,
    "dri": 80,
    "gk": 35
  },
  "battleSim": {
    "passives": [
      {
        "id": "balanced-first-touch",
        "name": "Balanced First Touch",
        "label": "BALANCED FIRST TOUCH",
        "effect": "controlled-touch",
        "description": "A modest control improvement on a physically reachable pass. Pressure and execution errors can still cause a turnover.",
        "params": {
          "control": 2
        },
        "interpretation": true
      },
      {
        "id": "composed-flow",
        "name": "Composed Flow",
        "label": "COMPOSED FLOW",
        "effect": "flow-state",
        "description": "In Flow, finds a little more supporting space and steadies his touch. A conservative simulation interpretation, not a confirmed signature technique.",
        "params": {
          "awareness": {
            "space": 0.06,
            "anticipation": 0.04
          },
          "boost": {
            "controlled-touch": {
              "control": 3
            }
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "recovery-touch",
        "name": "Recovery Touch",
        "label": "RECOVERY TOUCH",
        "effect": "recovery-touch",
        "description": "Under nearby pressure, attempts a quick stabilizing touch after a reachable delivery. Does not recover an intercepted or unreachable ball.",
        "params": {
          "control": 2,
          "cooldownTicks": 8
        },
        "interpretation": true
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "I'll find my spot."
      ],
      "pass": [
        "Here is the opening."
      ],
      "receive": [
        "Keep it close."
      ],
      "dribble": [
        "One touch at a time."
      ],
      "dribbleFail": [
        "Too far from my feet."
      ],
      "goal": [
        "There it is!",
        "One opening was enough."
      ],
      "miss": [
        "Reset, then go again."
      ],
      "defend": [
        "Close that angle."
      ],
      "passFail": [
        "I needed a cleaner touch."
      ],
      "flow": [
        "Stay balanced."
      ],
      "shot-attempt": [
        "Now."
      ],
      "criticalGoal": [
        "One opening was enough."
      ],
      "foul": [
        "I caught him instead of the ball."
      ],
      "fouled": [
        "That was a push."
      ],
      "offside": [
        "Wait for the pass next time."
      ]
    }
  }
};
