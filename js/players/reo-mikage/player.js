// Public simulation voice; canonical profile and ratings preserved.
const PLAYER_20_DATA = {
  "id": 20,
  "name": "Reo Mikage",
  "debutChapter": 1,
  "appearanceOrder": 20,
  "image": "images/reo-mikage.jpg",
  "primaryPosition": "CM",
  "positions": [
    "CM",
    "AM",
    "CB",
    "RM"
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
      "id": "copy",
      "name": "Copy",
      "description": "Reproduces observed techniques within the limits of his own physical abilities.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Reo_Mikage",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "passing",
      "name": "Passing",
      "description": "Connects teammates through varied, accurately weighted attacking passes.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Reo_Mikage",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "metavision",
      "name": "Metavision",
      "description": "Scans the field to read developing plays and choose supporting positions.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Reo_Mikage",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "mental"
    }
  ],
  "stats": {
    "ovr": 90,
    "off": 89,
    "sho": 85,
    "spd": 86,
    "def": 86,
    "pas": 91,
    "dri": 89,
    "gk": 68
  },
  "battleSim": {
    "passives": [
      {
        "id": "reo-metavision",
        "name": "Metavision",
        "label": "METAVISION",
        "effect": "space-reading",
        "description": "Reads visible passing lanes and runs up to 50 m away.",
        "params": {
          "rangeMeters": 50
        },
        "interpretation": true
      },
      {
        "id": "all-round-judgement",
        "name": "All-Round Judgement",
        "label": "ALL-ROUND JUDGEMENT",
        "effect": "rational-decisions",
        "description": "Compares shooting, carrying and distribution using his own current ability.",
        "params": {
          "sharpness": 0.3
        },
        "interpretation": true
      },
      {
        "id": "chameleon",
        "name": "Chameleon",
        "label": "CHAMELEON",
        "effect": "observed-technique",
        "description": "Remembers up to three observed public technical moves. Uses a weaker imitation only when its normal physical conditions are met; never copies stats, physiques, keepers, reactions, Flow or ultimates.",
        "params": {
          "capacity": 3,
          "cooldownTicks": 8
        },
        "interpretation": true
      },
      {
        "id": "chameleon-flow",
        "name": "Chameleon Flow",
        "label": "CHAMELEON FLOW",
        "effect": "flow-state",
        "description": "In Flow, reads teammates earlier and makes more precise technical imitations. Own physical limits still apply.",
        "params": {
          "awareness": {
            "vision": 0.1,
            "space": 0.08,
            "anticipation": 0.08
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "precision-distribution",
        "name": "Precision Distribution",
        "label": "PRECISION DISTRIBUTION",
        "effect": "precision-distribution",
        "description": "Reduces execution error on real forward passes. The ball can still be intercepted.",
        "params": {
          "precision": 0.85
        },
        "interpretation": true
      }
    ],
    "ultimates": [
      {
        "interpretation": true,
        "oncePerFlow": true,
        "condition": {
          "duringFlow": true
        },
        "id": "chameleon-evolution",
        "name": "Chameleon: Evolution",
        "label": "CHAMELEON: EVOLUTION",
        "effect": "chameleon-evolution",
        "dialogue": "evolution",
        "params": {
          "memoryTicks": 80,
          "finishMetres": 20,
          "technique": 0.12,
          "read": 0.08,
          "value": 0.006,
          "rangeMeters": 8
        },
        "description": "In Flow, after seeing a copyable move in the last 80 ticks, Reo turns it into a two-part move: a copied finish straight after receiving within 20 m, or a copied feint past a defender within 8 m followed by an instant pass. He uses his own ratings and it can fail. Once per Flow."
      }
    ],
    "reactions": [],
    "dialogue": {
      "kickoff": [
        "I will find what this team needs."
      ],
      "pass": [
        "I can put it there.",
        "Use that space."
      ],
      "receive": [
        "I have options."
      ],
      "dribble": [
        "I can reproduce that touch."
      ],
      "dribbleFail": [
        "The timing was different."
      ],
      "goal": [
        "That is one way to win.",
        "I can make this team win."
      ],
      "miss": [
        "I need a better angle."
      ],
      "defend": [
        "I see the route."
      ],
      "passFail": [
        "That lane closed."
      ],
      "flow": [
        "I can connect all of this."
      ],
      "copy": [
        "I have seen that move."
      ],
      "shot-attempt": [
        "This is the opening."
      ],
      "criticalGoal": [
        "I can make this team win."
      ],
      "foul": [
        "I mistimed the challenge."
      ],
      "fouled": [
        "That stopped the whole play."
      ],
      "offside": [
        "I read the line a step late."
      ],
      "evolution": [
        "Got it. Now it's mine.",
        "Chameleon... evolve!"
      ],
      "evolutionFail": [
        "Not yet... I'll get it next time."
      ]
    }
  }
};
