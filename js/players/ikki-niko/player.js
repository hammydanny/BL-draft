// Character player data: Ikki Niko (ID 16).
const PLAYER_16_DATA = {
  "id": 16,
  "name": "Ikki Niko",
  "debutChapter": 1,
  "appearanceOrder": 16,
  "image": "images/ikki-niko.jpg",
  "primaryPosition": "CB",
  "positions": [
    "CB",
    "DM"
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
      "id": "field-awareness",
      "name": "Field Awareness",
      "description": "Observes player movement and passing lanes to anticipate developing attacks.",
      "battleSimType": "Passive",
      "battleSimDescription": "Within 44 m, reads dangerous passing routes and moves to cover one. Blind-side runs can escape his attention.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Ikki_Niko",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "mental"
    },
    {
      "id": "metavision",
      "name": "Metavision",
      "description": "Scans surrounding play to make quicker interceptions and positional decisions.",
      "battleSimType": "Passive",
      "battleSimDescription": "Within 44 m, reads dangerous passing routes and moves to cover one. Blind-side runs can escape his attention.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Ikki_Niko",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "mental"
    },
    {
      "id": "interceptions",
      "name": "Interceptions",
      "category": "technical",
      "description": "Steps into an anticipated passing route and takes the ball before the intended receiver can control it.",
      "battleSimType": "Passive",
      "battleSimDescription": "Moves toward an observed passing route before release. The passer can change plans and Niko can arrive late.",
      "source": {
        "type": "anime-subtitles",
        "url": "https://subs.yakuaru.com/books/blue-lock/page/31-itoshi-sae",
        "note": "Niko interrupts Japan U-20’s attacking routes in his defensive assignment.",
        "episode": 31
      }
    }
  ],
  "stats": {
    "ovr": 87,
    "off": 82,
    "sho": 76,
    "spd": 78,
    "def": 84,
    "pas": 88,
    "dri": 67,
    "gk": 57
  },
  "battleSim": {
    "awareness": {
      "vision": 0.04,
      "anticipation": 0.45,
      "defensiveRead": 0.07
    },
    "passives": [
      {
        "id": "niko-metavision",
        "name": "Metavision",
        "label": "METAVISION",
        "effect": "space-reading",
        "description": "Within 44 m, reads dangerous passing routes and moves to cover one. Blind-side runs can escape his attention.",
        "params": {
          "rangeMeters": 44
        },
        "interpretation": true,
        "dialogue": "read"
      },
      {
        "id": "watchtower-soccer",
        "name": "Watchtower Soccer",
        "label": "WATCHTOWER SOCCER",
        "effect": "watchtower",
        "description": "Within 44 m, reads dangerous passing routes and moves to cover one. Blind-side runs can escape his attention.",
        "params": {
          "rangeMeters": 44
        },
        "interpretation": true,
        "dialogue": "read"
      },
      {
        "id": "anticipatory-interception",
        "name": "Anticipatory Interception",
        "label": "ANTICIPATORY INTERCEPTION",
        "effect": "anticipatory-interception",
        "description": "Moves toward an observed passing route before release. The passer can change plans and Niko can arrive late.",
        "params": {
          "reaction": 0.12
        },
        "interpretation": true,
        "dialogue": "defend"
      },
      {
        "id": "watchtower-command",
        "name": "Watchtower Command",
        "label": "WATCHTOWER COMMAND",
        "effect": "flow-state",
        "description": "In Flow, tracks threats and anticipates observed routes better. Blind-side movement and physical speed still limit him.",
        "params": {
          "awareness": {
            "vision": 0.04,
            "anticipation": 0.1
          },
          "boost": {
            "anticipatory-interception": {
              "reaction": 0.17
            }
          }
        },
        "interpretation": true,
        "dialogue": "flow"
      }
    ],
    "weapons": [
      {
        "id": "defensive-trap",
        "name": "Defensive Trap",
        "label": "DEFENSIVE TRAP",
        "effect": "defensive-trap",
        "description": "Baits an observed passing lane for two ticks. A different pass can exploit the space he leaves. Cooldown: 10 ticks.",
        "params": {
          "cooldownTicks": 10
        },
        "interpretation": true,
        "dialogue": "trap"
      }
    ],
    "ultimates": [],
    "reactions": [
      {
        "id": "hidden-playmaker-ace",
        "name": "Hidden Playmaker × Ace",
        "label": "HIDDEN PLAYMAKER × ACE",
        "effect": "ace-supply",
        "description": "With Niko and Okawa active, Niko seeks a useful pass to Okawa. Defenders can intercept. Shared cooldown: 12 ticks.",
        "params": {
          "value": 0.012
        },
        "interpretation": true,
        "dialogue": "supply",
        "members": [
          16,
          17
        ],
        "cooldownTicks": 12
      }
    ],
    "dialogue": {
      "read": [
        "There is another runner."
      ],
      "trap": [
        "Will you choose that lane?"
      ],
      "supply": [
        "Okawa, there is room ahead."
      ],
      "kickoff": [
        "I will watch how you move."
      ],
      "pass": [
        "There is space on that side.",
        "Look beyond the first option."
      ],
      "receive": [
        "I see the next option."
      ],
      "dribble": [
        "You left a way through."
      ],
      "dribbleFail": [
        "I missed that adjustment."
      ],
      "shot-attempt": [
        "I can try from here."
      ],
      "goal": [
        "You watched the wrong player."
      ],
      "miss": [
        "I misread the opening."
      ],
      "defend": [
        "That was the route you chose."
      ],
      "concede": [
        "I need to read that earlier."
      ],
      "flow": [
        "I can follow the attack now."
      ],
      "support": [
        "There is space on that side."
      ],
      "passFail": [
        "I missed that adjustment.",
        "I misread the opening."
      ],
      "foul": [
        "I missed that adjustment."
      ],
      "save": [
        "That was the route you chose."
      ]
    }
  }
};
