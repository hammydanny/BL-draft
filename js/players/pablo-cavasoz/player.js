// Character player data: Pablo Cavasoz (ID 35).
const PLAYER_35_DATA = {
  "id": 35,
  "name": "Pablo Cavasoz",
  "debutChapter": 87,
  "appearanceOrder": 35,
  "image": "images/pablo-cavasoz.jpg",
  "primaryPosition": "FW",
  "positions": [
    "FW"
  ],
  "nationality": {
    "code": "AR",
    "name": "Argentina",
    "basis": "national-team-representation",
    "source": {
      "type": "canon-reference",
      "url": "https://bluelock.fandom.com/wiki/Pablo_Cavasoz",
      "note": "National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."
    }
  },
  "weapons": [
    {
      "id": "kicking-accuracy",
      "name": "Kicking Accuracy",
      "description": "Places passes and kicks precisely to connect teammates over difficult distances.",
      "battleSimType": "Passive",
      "battleSimDescription": "Pablo's passes and long balls stray less than most players', especially over long distances, and he looks for the pass that puts a teammate into a real shooting position, including runners in behind. Defenders in the lane can still cut them out.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Pablo_Cavasoz",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    }
  ],
  "stats": {
    "ovr": 95,
    "off": 96,
    "sho": 96,
    "spd": 94,
    "def": 69,
    "pas": 99,
    "dri": 98,
    "gk": 55
  },
  "battleSim": {
    "awareness": {
      "vision": 0.1,
      "space": 0.06
    },
    "tendencies": {
      "pass": 0.08
    },
    "passives": [
      {
        "id": "pinpoint-accuracy",
        "name": "Pinpoint Accuracy",
        "label": "PINPOINT ACCURACY",
        "effect": "weighted-kick",
        "effects": [
          "chance-creation"
        ],
        "params": {
          "precision": 0.85,
          "rangeMeters": 50,
          "weight": 0.04
        },
        "description": "Pablo's passes and long balls stray less than most players', especially over long distances, and he looks for the pass that puts a teammate into a real shooting position, including runners in behind. Defenders in the lane can still cut them out.",
        "interpretation": true
      },
      {
        "id": "exacting-rhythm",
        "name": "Exacting Rhythm",
        "label": "EXACTING RHYTHM",
        "effect": "flow-state",
        "dialogue": "flow",
        "params": {
          "boost": {
            "weighted-kick": {
              "precision": 0.78
            },
            "bending-pass": {
              "curve": 2.8
            }
          }
        },
        "description": "Pablo's Flow. In Flow his kicking is even more exact and his curled passes bend further. The receiver must still control the ball.",
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "precision-delivery",
        "name": "Precision Delivery",
        "label": "PRECISION DELIVERY",
        "effect": "decisive-delivery",
        "params": {
          "cooldownTicks": 7,
          "precision": 0.7
        },
        "description": "For a forward pass of 18 m or more that gains at least 5 m, Pablo strikes the ball with extra accuracy. Defenders can still intercept and the receiver must still control it. Cooldown: 7 ticks.",
        "interpretation": true
      },
      {
        "id": "bending-distribution",
        "name": "Bending Distribution",
        "label": "BENDING DISTRIBUTION",
        "effect": "bending-pass",
        "params": {
          "cooldownTicks": 9,
          "minLength": 14,
          "curve": 2.4,
          "minGain": 0.04,
          "value": 0.004
        },
        "description": "When one or two defenders stand in the line of a ground pass of 14 m or more, Pablo curls the ball around the outside of the main blocker. The curve brings it closer to anyone on the other side and makes it slightly less accurate, so it can still be cut out. Cooldown: 9 ticks.",
        "interpretation": true,
        "dialogue": "bend"
      }
    ],
    "ultimates": [
      {
        "id": "precision-masterclass",
        "name": "Precision Masterclass",
        "label": "PRECISION MASTERCLASS",
        "effect": "precision-masterclass",
        "params": {
          "minLength": 28,
          "minForward": 12,
          "precision": 0.4,
          "accuracy": 0.08,
          "minSuccess": 0.4,
          "value": 0.01
        },
        "description": "In Flow, when a teammate is running in behind, Pablo plays a long ball of 28 m or more that gains at least 12 m and drops right into the runner's stride. The runner must still win the race and control it, and offside still counts. Once per Flow.",
        "interpretation": true,
        "dialogue": "masterclass",
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        }
      }
    ],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "Keep it simple. Keep it exact."
      ],
      "pass": [
        "There.",
        "On your foot."
      ],
      "receive": [
        "Good."
      ],
      "support": [
        "Here."
      ],
      "masterclass": [
        "Run. It will be there."
      ],
      "bend": [
        "Around him."
      ],
      "goal": [
        "Clean."
      ],
      "criticalGoal": [
        "Exact."
      ],
      "miss": [
        "Off by a little."
      ],
      "passFail": [
        "...Hm. Off target."
      ],
      "flow": [
        "Every ball, exactly."
      ],
      "dribble": [
        "Space."
      ],
      "dribbleFail": [
        "My mistake."
      ],
      "shot-attempt": [
        "Placed."
      ],
      "defend": [
        "Got it."
      ],
      "concede": [
        "Reset."
      ],
      "fouled": [
        "Careful."
      ],
      "foul": [
        "Sorry."
      ],
      "offside": [
        "Timing."
      ],
      "save": [
        "Hm."
      ]
    }
  }
};
