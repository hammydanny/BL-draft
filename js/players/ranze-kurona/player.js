// Public simulation kit; canonical football data and ratings preserved.
const PLAYER_26_DATA = {
  "id": 26,
  "name": "Ranze Kurona",
  "debutChapter": 93,
  "appearanceOrder": 26,
  "image": "images/ranze-kurona.jpg",
  "primaryPosition": "RB",
  "positions": [
    "RB",
    "RWB"
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
      "id": "short-pass-combination",
      "name": "Short-Pass Combination",
      "description": "Exchanges quick one-twos while moving around the ball carrier as a support option.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Ranze_Kurona",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "technical"
    },
    {
      "id": "quick-turning",
      "name": "Quick Turning",
      "description": "Changes direction rapidly to stay available through tight exchanges.",
      "battleSimType": "TBD",
      "battleSimDescription": "Placeholder: Battle Sim effect to be defined.",
      "source": {
        "type": "canon-reference",
        "url": "https://bluelock.fandom.com/wiki/Ranze_Kurona",
        "note": "Demonstrated football strength; exact chapter omitted where not independently confirmed."
      },
      "category": "physical"
    }
  ],
  "stats": {
    "ovr": 87,
    "off": 84,
    "sho": 77,
    "spd": 91,
    "def": 84,
    "pas": 89,
    "dri": 88,
    "gk": 55
  },
  "battleSim": {
    "awareness": {
      "vision": 0.03,
      "space": 0.06,
      "anticipation": 0.2
    },
    "tendencies": {
      "pass": 0.14,
      "shoot": -0.08
    },
    "passives": [
      {
        "id": "quick-turning",
        "name": "Quick Turning",
        "label": "QUICK TURNING",
        "effect": "quick-turn",
        "description": "Turns toward nearby support earlier and follows attackers who change their route more often, without increasing his top speed. Attackers can still lose him.",
        "params": {
          "track": 0.08
        },
        "interpretation": true
      },
      {
        "id": "short-pass-awareness",
        "name": "Short-Pass Awareness",
        "label": "SHORT-PASS AWARENESS",
        "effect": "support-movement",
        "description": "Offers reachable short passing angles near the ball carrier. Keeps his defensive role when possession changes.",
        "params": {},
        "interpretation": true
      },
      {
        "id": "planetary-orbit",
        "name": "Planetary Orbit",
        "label": "PLANETARY ORBIT",
        "effect": "flow-state",
        "description": "In Flow, maintains closer support and reads short exchanges earlier. He remains a supporting player.",
        "params": {
          "awareness": {
            "vision": 0.05,
            "space": 0.07,
            "anticipation": 0.08
          }
        },
        "interpretation": true
      }
    ],
    "weapons": [
      {
        "id": "rapid-one-two",
        "name": "Rapid One-Two",
        "label": "RAPID ONE-TWO",
        "effect": "short-combination",
        "description": "Plays a short pass, then runs for a possible return. Either pass can be intercepted. Cooldown: 7 ticks.",
        "params": {
          "cooldownTicks": 7
        },
        "interpretation": true,
        "dialogue": "dribble"
      },
      {
        "id": "orbital-recovery",
        "name": "Orbital Recovery",
        "label": "ORBITAL RECOVERY",
        "effect": "orbital-recovery",
        "interpretation": true,
        "dialogue": "orbital",
        "params": {
          "cooldownTicks": 8,
          "radiusMeters": 6,
          "turnMetres": 1.2,
          "read": 0.06
        },
        "description": "When a pass is played to an opponent within 6 m of Kurona, he turns sharply to challenge the receiver or the passing lane, reaching about 1.2 m further. He can still lose the duel. Cooldown: 8 ticks."
      }
    ],
    "ultimates": [],
    "reactions": [],
    "dialogue": {
      "pass": [
        "Here, here!"
      ],
      "receive": [
        "Got it, got it!"
      ],
      "dribble": [
        "Turn, turn!"
      ],
      "shot-attempt": [
        "Now, now!"
      ],
      "goal": [
        "We did it, did it!"
      ],
      "miss": [
        "Again, again!"
      ],
      "dribbleFail": [
        "Again, again!"
      ],
      "passFail": [
        "Again, again!"
      ],
      "defend": [
        "Got it, got it!"
      ],
      "flow": [
        "Closer, closer!"
      ],
      "support": [
        "Here, here!"
      ],
      "kickoff": [
        "Closer, closer!"
      ],
      "foul": [
        "Sorry, sorry!"
      ],
      "fouled": [
        "Hey, hey!"
      ],
      "offside": [
        "Too early, too early!"
      ],
      "hotline": [
        "Go, Go!"
      ],
      "orbital": [
        "Turning back—got you!"
      ],
      "aceKurona": [
        "Leave it to me!"
      ],
      "aceWin": [
        "Got it! Nice pressure!"
      ]
    }
  }
};
