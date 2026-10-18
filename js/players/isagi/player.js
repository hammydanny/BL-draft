// Yoichi Isagi // player-specific stats, weapons, descriptions, dialogue and Battle Sim abilities.
const ISAGI_PLAYER_DATA = {
        id: 1, name: "Yoichi Isagi", debutChapter: 1, appearanceOrder: 1, image: "images/yoichi-isagi.jpg", primaryPosition: "CF", positions: ["CF", "AM"],
        stats: { ovr:94, off:98, sho:94, spd:82, def:78, pas:91, dri:84, gk:48 },
        nationality: {"code":"JP","name":"Japan","basis":"national-team-representation","source":{"type":"official-profile","url":"https://kodansha.us/series/blue-lock/volume-1/","note":"National selection eligibility or explicitly recorded country; never inferred from club, name or appearance."}},
        weapons: [
            {"id":"spatial-metavision","name":"Metavision","description":"Repeatedly scans the surrounding field, combining peripheral information into an updated picture of the next scoring route.","battleSimType":"Passive","battleSimDescription":"Battle Sim: modestly improves Isagi’s short passing and shot chance when defenders are close.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"awareness","name":"Awareness","description":"Notices shifts in player positions, open lanes, danger and passing options before they become obvious.","battleSimType":"TBD","battleSimDescription":"Placeholder: Battle Sim effect to be defined.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"adaptability","name":"Adaptability","description":"Revises his plan as new information exposes an opponent’s habits, then combines available skills to exploit the changed situation.","battleSimType":"TBD","battleSimDescription":"Placeholder: Battle Sim effect to be defined.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"off-the-ball-movements","name":"Off-the-Ball Movements","description":"Times sharp runs into blind spots and open space to arrive where defenders lose track of him.","battleSimType":"TBD","battleSimDescription":"Placeholder: Battle Sim effect to be defined.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"mental"},
            {"id":"direct-shot","name":"Direct Shot","description":"Meets the incoming ball with a first-time strike, denying defenders the extra moment a controlling touch would give them.","battleSimType":"Special Move","battleSimDescription":"Battle Sim: when Isagi attempts a goal with the ball, increases goal chance by 2.5 percentage points per nearby outfield defender, capped at +12 points. Dialogue: Direct Shot!","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"two-gun-volley","name":"Two-Gun Volley","description":"Threatens a volley with one foot, changes the shooting leg in mid-air and finishes after the defender commits to the first motion.","battleSimType":"Ultimate","battleSimDescription":"Battle Sim: while Isagi has full Flow (100%) and possession within two zones of the opposing goal, instantly fires a guaranteed volley. Goal success is 100% and ignores goalkeeper stats. Dialogue: Two-Gun Volley!","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"reverse-back-heel-shot","name":"Reverse Back Heel Shot","description":"Disguises a forward strike before redirecting the ball behind him with a backheel to bypass a closing defender.","battleSimType":"TBD","battleSimDescription":"Placeholder: Battle Sim effect to be defined.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Yoichi_Isagi","note":"Existing latest-main weapon retained; no unverified chapter number added."},"category":"technical"},
            {"id":"left-footed-direct-shot","name":"Left-Footed Direct Shot","category":"technical","description":"Finishes first-time with his left foot when a defender closes the angle for his preferred right-footed strike.","battleSimType":"TBD","battleSimDescription":"Placeholder: Battle Sim effect to be defined.","source":{"type":"canon-reference","url":"https://bluelock.fandom.com/wiki/Chapter_211","chapter":211,"note":"Isagi scores with the explicitly named left-footed direct shot against Ubers."}}
        ]
    ,
        battleSim: {
    "passives": [
        {
            "id": "metavision",
            "name": "Metavision",
            "description": "Scans nearby pressure and passing lanes; modestly improves short-pass success and goal chance when defenders are close."
        }
    ],
    "specials": [
        {
            "id": "direct-shot",
            "name": "Direct Shot",
            "description": "When Isagi has possession and attempts a goal, adds 2.5 percentage points to goal chance per opposing outfield defender within one zone, capped at +12 points.",
            "dialogue": "Direct Shot!"
        }
    ],
    "ultimates": [
        {
            "id": "two-gun-volley",
            "name": "Two-Gun Volley",
            "description": "When Isagi has possession at full Flow (100%) within two zones of the opposing goal, he instantly volleys toward goal. Guaranteed 100% success; goalkeeper stats cannot affect the result. Dialogue: Two-Gun Volley!",
            "dialogue": "Two-Gun Volley!"
        }
    ],
    "dialogue": {
        "pass": [
            "I can see the whole field… now move!",
            "The next play is already there."
        ],
        "dribble": [
            "I’ve found your blind spot!",
            "I’m going to devour that space!"
        ],
        "dribbleFail": [
            "Damn it… I read that wrong!",
            "I was a step behind!"
        ],
        "shotAttempt": [
            "This is the route I calculated!"
        ],
        "shotMiss": [
            "No… I had the goal in my sights!",
            "I need to reconstruct that shot!"
        ],
        "goal": [
            "That’s my formula!",
            "I devoured the final piece!"
        ]
    },
    "chemistryDialogue": {
        "Hiori Yo": {
            "pass": "Hiori, send it exactly where I can finish!",
            "goal": "Hiori! That pass completed the formula!"
        },
        "Meguru Bachira": {
            "pass": "Bachira, your chaos opens the lane I need!",
            "goal": "Bachira—you drew them in, and I took the space!"
        },
        "Seishiro Nagi": {
            "pass": "Nagi, trap it and give me the next picture!",
            "goal": "Nagi! We turned that impossible touch into a goal!"
        },
        "Rensuke Kunigami": {
            "pass": "Kunigami, hold the line—I’m moving into the gap!",
            "goal": "Kunigami, the opening was all I needed!"
        },
        "Rin Itoshi": {
            "pass": "Rin, I’ll surpass your read and finish this!",
            "goal": "Rin… I found a route even you couldn’t shut down!"
        },
        "Michael Kaiser": {
            "pass": "Kaiser, watch me steal the scoring route!",
            "goal": "Kaiser, this goal is my answer to you!"
        }
    }
}
    };
