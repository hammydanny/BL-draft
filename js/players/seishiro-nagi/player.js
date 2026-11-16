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
        "description": "When a lofted, long or threaded pass reaches Nagi, or a marker is within 3.5 m, his first touch kills the ball and steers it about 2 m into the open side, toward goal. Teammates trust him with high balls, and after the touch he is readier to shoot. With no open side the ball just stops at his feet, and defenders can still intercept before it arrives.",
        "params": {
          "control": 7,
          "improvise": 0.004,
          "touchMetres": 2,
          "supplyValue": 0.004
        },
        "interpretation": true
      },
      {
        "id": "genius-awakening",
        "name": "Genius Awakening",
        "label": "GENIUS AWAKENING",
        "effect": "flow-state",
        "description": "Nagi's Flow. In Flow his first touch carries the ball a little further into space and he improvises more finishing chances. Unreachable balls stay unreachable.",
        "params": {
          "awareness": {
            "space": 0.05,
            "anticipation": 0.08
          },
          "boost": {
            "perfect-trap": {
              "control": 8,
              "touchMetres": 2.4
            }
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
        "description": "In Flow, when Nagi meets an airborne pass within 16 m of goal with two defenders within 6 m, he chains fake volleys to send a closing defender the wrong way before shooting. Any feint can be read, and the keeper can still save. Passes from Reo make the disguise slightly better. Once per Flow.",
        "params": {
          "maxMetres": 16,
          "pressureMetres": 6,
          "defenders": 2
        },
        "interpretation": true,
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true,
          "receivedPass": true
        },
        "dialogue": "revolver"
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
        "Got it... I guess."
      ],
      "dribble": [
        "What a pain."
      ],
      "shot-attempt": [
        "Eh, let's just shoot."
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
        "Over here... I guess."
      ],
      "kickoff": [
        "Okay. Now I want to win."
      ],
      "foul": [
        "Oops."
      ],
      "fouled": [
        "Ow... what a pain."
      ],
      "offside": [
        "Huh? Offside? Annoying."
      ],
      "partnership": [
        "Reo. Right there."
      ],
      "revolver": [
        "Huh... this is actually fun.",
        "Five shots. Guess which one's real."
      ],
      "trap": [
        "Easy.",
        "Stopped it. Now what..."
      ]
    }
  }
};
