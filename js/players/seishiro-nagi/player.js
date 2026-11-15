// Public simulation kit; canonical football data and ratings preserved.
const PLAYER_21_DATA = {
  "id": 21,
  "name": "Seishiro Nagi",
  "debutChapter": 22,
  "appearanceOrder": 21,
  "image": "images/seishiro-nagi.jpg",
  "primaryPosition": "CF",
  "positions": [
    "CF",
    "AM",
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
      "id": "trapping",
      "name": "Trapping",
      "description": "Absorbs difficult passes with controlled touches and sets up unconventional finishes.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "official-profile",
        "url": "https://bluelock-kc.com/characters/nagi/",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "two-stage-fake-volley",
      "name": "Two-Stage Fake Volley",
      "category": "technical",
      "description": "Lifts the ball away from a defender’s first block, then volleys the descending ball before they can reset.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/32-blue-genes",
        "note": "Nagi’s opening goal against Japan U-20 uses successive airborne touches to escape the block.",
        "episode": 32
      }
    },
    {
      "id": "five-shot-revolver-fake-volley",
      "name": "Five-Shot Revolver Fake Volley",
      "category": "technical",
      "description": "Chains airborne shooting feints and touches to draw repeated blocks, then strikes after the defenders exhaust their reactions.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Chapter_190",
        "chapter": 190,
        "note": "Nagi’s named five-shot fake-volley sequence scores against Bastard München; a separate demonstrated finishing technique."
      }
    }
  ],
  "stats": {
    "ovr": 91,
    "off": 94,
    "sho": 92,
    "spd": 82,
    "def": 69,
    "pas": 84,
    "dri": 96,
    "gk": 55
  },
  "battleSim": {
    "awareness": {
      "space": 0.04,
      "anticipation": 0.13
    },
    "tendencies": {
      "shoot": 0.05
    },
    "passives": [
      {
        "id": "perfect-trapping",
        "name": "Perfect Trapping",
        "label": "PERFECT TRAPPING",
        "effect": "perfect-trap",
        "description": "Improves control of reachable ground and aerial deliveries. Defenders can intercept before he receives.",
        "params": {
          "control": 7
        },
        "interpretation": true
      },
      {
        "id": "genius-awakening",
        "name": "Genius Awakening",
        "label": "GENIUS AWAKENING",
        "effect": "flow-state",
        "description": "In Flow, improvises better touches and finishing opportunities. Unreachable balls stay unreachable.",
        "params": {
          "awareness": {
            "space": 0.05,
            "anticipation": 0.08
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "creative-trap",
        "name": "Creative Trap",
        "label": "CREATIVE TRAP",
        "effect": "reception-escape",
        "description": "After receiving under pressure, tries a short touch away from his marker. Can lose the ball. Cooldown: 7 ticks.",
        "params": {
          "cooldownTicks": 7
        },
        "interpretation": true,
        "dialogue": "dribble"
      },
      {
        "id": "two-stage-fake-volley",
        "name": "Two-Stage Fake Volley",
        "label": "TWO-STAGE FAKE VOLLEY",
        "effect": "aerial-feint-finish",
        "description": "After an aerial pass within 18 m, feints at one challenging defender before a volley. Can fail. Cooldown: 10 ticks.",
        "params": {
          "cooldownTicks": 10
        },
        "interpretation": true,
        "dialogue": "dribble"
      }
    ],
    "ultimates": [
      {
        "id": "five-shot-revolver-fake-volley",
        "name": "Five-Shot Revolver Fake Volley",
        "label": "FIVE-SHOT REVOLVER FAKE VOLLEY",
        "effect": "revolver-finish",
        "description": "In Flow after an aerial pass from Reo within 12 m, attempts a difficult chain of feints against two nearby defenders. Can fail. Once per Flow.",
        "params": {},
        "interpretation": true,
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true,
          "receivedPass": true
        },
        "dialogue": "flow"
      }
    ],
    "reactions": [
      {
        "id": "treasure-partnership",
        "name": "Treasure Partnership",
        "label": "TREASURE PARTNERSHIP",
        "effect": "trap-supply",
        "members": [
          20,
          21
        ],
        "cooldownTicks": 12,
        "dialogue": "partnership",
        "description": "With Reo on the pitch: Reo attempts a lofted forward pass for Nagi to control. Interceptions and failed control remain possible. Shared cooldown: 12 ticks."
      }
    ],
    "dialogue": {
      "pass": [
        "There. Take it."
      ],
      "receive": [
        "There. Take it."
      ],
      "dribble": [
        "What a pain."
      ],
      "shot-attempt": [
        "What a pain."
      ],
      "goal": [
        "That was kind of fun."
      ],
      "miss": [
        "Ah... messed that up."
      ],
      "dribbleFail": [
        "Ah... messed that up."
      ],
      "passFail": [
        "Ah... messed that up."
      ],
      "defend": [
        "I can reach that."
      ],
      "flow": [
        "Okay. Now I want to win."
      ],
      "support": [
        "There. Take it."
      ],
      "kickoff": [
        "Okay. Now I want to win."
      ],
      "foul": [
        "Ah... messed that up."
      ],
      "fouled": [
        "What a pain."
      ],
      "offside": [
        "Ah... messed that up."
      ],
      "partnership": [
        "Reo. Right there."
      ]
    }
  }
};
