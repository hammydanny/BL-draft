// Yukio Ishikari: append-only ID; individual attributes are project estimates.
const PLAYER_92_DATA = {
  "id": 92,
  "name": "Yukio Ishikari",
  "debutChapter": 1,
  "appearanceOrder": 92,
  "image": "images/yukio-ishikari.webp",
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
      "type": "canon-reference",
      "url": "https://bluelock.fandom.com/wiki/Yukio_Ishikari",
      "note": "Explicit Japanese selection eligibility or France U-20 representation; not inferred from club or appearance."
    }
  },
  "weapons": [
    {
      "id": "aerial-reach",
      "name": "Aerial Reach",
      "description": "Uses his height and vertical leap to meet high passes, intercept aerial balls and connect with teammates through headers.",
      "category": "physical",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Yukio_Ishikari",
        "note": "Aerial interception and headed combination with Aryu in the Third Selection.",
        "chapter": 105
      },
      "battleSimType": "Passive",
      "battleSimDescription": "Ishikari's height and leap let him reach high balls about half a metre further than most players and react to them sooner, so teammates look for him with high balls. A defender can still get there first."
    }
  ],
  "stats": {
    "ovr": 72,
    "off": 79,
    "sho": 78,
    "pas": 69,
    "dri": 64,
    "spd": 64,
    "def": 62,
    "gk": 35
  },
  "teamHistory": [
    {
      "name": "Nobiiru High School",
      "members": [
        "Yukio Ishikari"
      ],
      "description": "Recorded team memberships and shared match groups; inclusion does not mean a current club affiliation."
    },
    {
      "name": "Blue Lock — 5th Clear Team",
      "members": [
        "Yukio Ishikari",
        "Ikki Niko",
        "Yo Hiori",
        "Jyubei Aryu"
      ],
      "description": "Recorded team memberships and shared match groups; inclusion does not mean a current club affiliation."
    },
    {
      "name": "Team A",
      "members": [
        "Yukio Ishikari",
        "Rin Itoshi",
        "Ryusei Shido",
        "Jyubei Aryu",
        "Reiji Hiiragi"
      ],
      "description": "Recorded team memberships and shared match groups; inclusion does not mean a current club affiliation."
    },
    {
      "name": "Blue Lock Eleven",
      "members": [
        "Yukio Ishikari"
      ],
      "description": "Recorded team memberships and shared match groups; inclusion does not mean a current club affiliation."
    },
    {
      "name": "Ubers",
      "members": [
        "Yukio Ishikari",
        "Shoei Baro",
        "Oliver Aiku",
        "Jyubei Aryu",
        "Ikki Niko",
        "Shuto Sendo",
        "Gen Fukaku",
        "Don Lorenzo",
        "Marc Snuffy"
      ],
      "description": "Recorded team memberships and shared match groups; inclusion does not mean a current club affiliation."
    }
  ],
  "jerseyNumber": 13,
  "battleSim": {
    "awareness": {
      "anticipation": 0.04
    },
    "tendencies": {},
    "passives": [
      {
        "id": "towering-reach",
        "name": "Towering Reach",
        "label": "TOWERING REACH",
        "effect": "aerial-reach",
        "params": {
          "reach": 0.45,
          "reaction": 0.15,
          "supplyValue": 0.003
        },
        "description": "Ishikari's height and leap let him reach high balls about half a metre further than most players and react to them sooner, so teammates look for him with high balls. A defender can still get there first.",
        "interpretation": false
      },
      {
        "id": "aerial-positioning",
        "name": "Aerial Positioning",
        "label": "AERIAL POSITIONING",
        "effect": "aerial-positioning",
        "params": {
          "reaction": 0.1
        },
        "description": "He reads where a high ball will drop and moves under it early, so he starts aerial races sooner. A badly judged flight still beats him.",
        "interpretation": true
      },
      {
        "id": "aerial-determination",
        "name": "Aerial Determination",
        "label": "AERIAL DETERMINATION",
        "effect": "flow-state",
        "dialogue": "flow",
        "params": {
          "boost": {
            "aerial-reach": {
              "reach": 0.6
            },
            "high-point-interception": {
              "challenge": 0.55
            }
          }
        },
        "description": "Ishikari's Flow. In Flow he reaches even higher balls and fights harder for headers. He can still lose them.",
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "high-point-interception",
        "name": "High-Point Interception",
        "label": "HIGH-POINT INTERCEPTION",
        "effect": "high-point-interception",
        "params": {
          "cooldownTicks": 8,
          "reach": 0.3,
          "challenge": 0.4
        },
        "description": "When an opponent's high ball comes near him, Ishikari jumps to meet it at its highest point, with extra reach and a stronger challenge. If he wins it, his team has the ball. He can still be beaten to it. Cooldown: 8 ticks.",
        "interpretation": false,
        "dialogue": "aerial"
      },
      {
        "id": "headed-link-up",
        "name": "Headed Link-Up",
        "label": "HEADED LINK-UP",
        "effect": "headed-link-up",
        "params": {
          "cooldownTicks": 9,
          "maxMetres": 15,
          "minSuccess": 0.4,
          "value": 0.016
        },
        "description": "Right after winning a high ball, Ishikari can head it straight on to a teammate 4–15 m away instead of controlling it. It is a normal pass: it can be misdirected or intercepted. Cooldown: 9 ticks.",
        "interpretation": false,
        "dialogue": "header"
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "Let's go."
      ],
      "pass": [
        "Here."
      ],
      "receive": [
        "Got it."
      ],
      "support": [
        "Up here!"
      ],
      "aerial": [
        "Mine!"
      ],
      "header": [
        "Go!"
      ],
      "goal": [
        "Yes!"
      ],
      "criticalGoal": [
        "Yes!"
      ],
      "miss": [
        "Damn."
      ],
      "dribble": [
        "Move!"
      ],
      "dribbleFail": [
        "Tch."
      ],
      "shot-attempt": [
        "Come on!"
      ],
      "defend": [
        "Got it!"
      ],
      "passFail": [
        "Sorry."
      ],
      "flow": [
        "Not losing in the air."
      ],
      "concede": [
        "Focus."
      ],
      "fouled": [
        "Hey!"
      ],
      "foul": [
        "Sorry."
      ],
      "offside": [
        "Ah."
      ],
      "save": [
        "Close."
      ]
    }
  }
};
