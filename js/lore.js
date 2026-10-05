// BLUE LOCK DRAFT // LORE DATABASE
// Local-only character and chemistry reference UI.

const CHARACTER_DESCRIPTIONS = {
    "Yoichi Isagi":
        "A spatially intelligent striker whose greatest weapon is his ability to read the field, identify winning spaces and evolve through adaptation.",

    "Meguru Bachira":
        "A creative dribbler who plays through instinct, imagination and unpredictable one-on-one movement.",

    "Rensuke Kunigami":
        "A physically powerful striker with a strong shooting game, direct attacking style and pronounced sense of fairness.",

    "Hyoma Chigiri":
        "An explosive speedster whose acceleration and ability to attack space make him one of Blue Lock's most dangerous runners.",

    "Seishiro Nagi":
        "A naturally gifted player famous for extraordinary trapping and control. His immense talent contrasts with his initially passive attitude.",

    "Reo Mikage":
        "A versatile all-rounder capable of adapting his game to what his team needs, with strong passing and tactical flexibility.",

    "Shoei Baro":
        "An ego-driven striker who thrives on taking control of attacks and forcing defenders to deal with his shooting threat.",

    "Rin Itoshi":
        "An elite striker with exceptional technical ability, field awareness and an intense drive to dominate the players around him.",

    "Sae Itoshi":
        "A world-class playmaker whose vision, passing range and precision allow him to manipulate the attacking structure around him.",

    "Ryusei Shido":
        "An instinctive penalty-area striker whose movement and finishing are built around explosive reactions and extreme attacking aggression.",

    "Yo Hiori":
        "A technically gifted passer whose calm vision and precision allow him to connect teammates with highly creative attacking solutions.",

    "Tabito Karasu":
        "A cerebral midfielder who uses positioning, ball retention and tactical pressure to control opponents and create advantages.",

    "Eita Otoya":
        "A stealthy attacking player whose off-ball movement and speed allow him to appear in dangerous areas unexpectedly.",

    "Kenyu Yukimiya":
        "A powerful attacking fullback with strong dribbling, pace and a preference for direct individual breakthroughs.",

    "Gin Gagamaru":
        "An unusually athletic player whose reflexes and physical instincts make him an exceptional goalkeeper despite his unconventional path.",

    "Jingo Raichi":
        "A physically aggressive defensive specialist who relies on stamina, pressure and relentless marking.",

    "Ikki Niko":
        "A defensive-minded reader of the game who developed from striker instincts into a player capable of controlling space from deeper positions.",

    "Jin Kiyora":
        "A technically sharp player whose value comes from timing, positioning and the ability to create decisive plays from limited opportunities."
};

function characterLoreDescription(player){
    return CHARACTER_DESCRIPTIONS[player.name] ||
        `${player.name} is a ${primaryPosition(player)}-focused Blue Lock player with ${playerPositions(player).join(", ")} as their listed positions. Their player profile can be evaluated through the attributes and chemistry links below.`;
}


function getCharacterChemistry(player){
    const name = player.name;

    const pairLinks = CHEMISTRY_SPECIAL_PAIRS
        .filter(pair =>
            Array.isArray(pair) &&
            pair.length >= 5 &&
            (pair[0] === name || pair[1] === name)
        )
        .map(pair => ({
            type: "pair",
            characters: [pair[0], pair[1]],
            score: Number(pair[2]) || 0,
            label: pair[3] || "CHEMISTRY",
            description: pair[4] || ""
        }));

    const teamLinks = CHEMISTRY_CONTEXTS
        .filter(context =>
            Array.isArray(context.players) &&
            context.players.includes(name)
        )
        .map(context => ({
            type: "context",
            name: context.name,
            score: Number(context.score) || 0,
            characters: context.players,
            description:
                `${name} is part of the ${context.name} chemistry context represented in the game's fan chemistry model.`
        }));

    return {
        pairLinks,
        teamLinks
    };
}


function renderCharacterLore(){
    const grid = document.getElementById("characterLoreGrid");
    if(!grid) return;

    const query =
        String(document.getElementById("characterLoreSearch")?.value || "")
            .trim()
            .toLowerCase();

    const filtered = players
        .filter(player =>
            !query ||
            player.name.toLowerCase().includes(query) ||
            primaryPosition(player).toLowerCase().includes(query) ||
            playerPositions(player).some(pos =>
                pos.toLowerCase().includes(query)
            )
        )
        .sort((a,b) => playerOverall(b) - playerOverall(a));

    if(!filtered.length){
        grid.innerHTML = `
            <div class="lore-empty">
                NO CHARACTERS MATCH YOUR SEARCH.
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(player => {
        const chemistry = getCharacterChemistry(player);

        const chemistryPreview = chemistry.pairLinks
            .slice()
            .sort((a,b) => b.score - a.score)
            .slice(0,3);

        return `
            <article class="character-lore-card">

                <div class="character-lore-image-wrap">
                    <img
                        src="${esc(player.image)}"
                        alt="${esc(player.name)}"
                        class="character-lore-image"
                        loading="lazy"
                    >
                </div>

                <div class="character-lore-main">

                    <div class="character-lore-heading">
                        <div>
                            <span class="lore-kicker">
                                ${esc(primaryPosition(player))}
                            </span>

                            <h2>${esc(player.name)}</h2>

                            ${positionBadges(player)}
                        </div>

                        <div class="character-lore-ovr">
                            <span>OVR</span>
                            <strong>${playerOverall(player)}</strong>
                        </div>
                    </div>

                    <p class="character-lore-description">
                        ${esc(characterLoreDescription(player))}
                    </p>

                    <div class="character-lore-stats">
                        <div><span>OFF</span><strong>${playerStats(player).off}</strong></div>
                        <div><span>SHO</span><strong>${playerStats(player).sho}</strong></div>
                        <div><span>SPD</span><strong>${playerStats(player).spd}</strong></div>
                        <div><span>DEF</span><strong>${playerStats(player).def}</strong></div>
                        <div><span>PAS</span><strong>${playerStats(player).pas}</strong></div>
                        <div><span>DRI</span><strong>${playerStats(player).dri}</strong></div>
                        <div><span>GK</span><strong>${playerStats(player).gk}</strong></div>
                    </div>

                    <div class="character-lore-chemistry">
                        <div class="lore-subheading">
                            RELEVANT CHEMISTRY
                        </div>

                        ${
                            chemistryPreview.length
                                ? chemistryPreview.map(link => `
                                    <div class="character-chemistry-link">
                                        <div>
                                            <strong>
                                                ${esc(link.characters.filter(name => name !== player.name).join(" × "))}
                                            </strong>

                                            <span>
                                                ${esc(link.label)}
                                            </span>
                                        </div>

                                        <b>${link.score}</b>
                                    </div>
                                `).join("")
                                : `<div class="lore-muted">NO NAMED CHEMISTRY LINKS</div>`
                        }

                        ${
                            chemistry.teamLinks.length
                                ? `
                                    <div class="character-team-contexts">
                                        ${chemistry.teamLinks
                                            .slice(0,5)
                                            .map(context => `
                                                <span>${esc(context.name)}</span>
                                            `)
                                            .join("")}
                                    </div>
                                `
                                : ""
                        }
                    </div>

                </div>
            </article>
        `;
    }).join("");
}


function renderChemistryLore(){
    const grid = document.getElementById("chemistryLoreGrid");
    if(!grid) return;

    const query =
        String(document.getElementById("chemistryLoreSearch")?.value || "")
            .trim()
            .toLowerCase();

    const pairEntries = CHEMISTRY_SPECIAL_PAIRS.map(pair => ({
        type: "pair",
        characters: [pair[0], pair[1]],
        score: Number(pair[2]) || 0,
        label: pair[3] || "CHEMISTRY",
        description: pair[4] || ""
    }));

    const contextEntries = CHEMISTRY_CONTEXTS.map(context => ({
        type: "context",
        name: context.name,
        characters: context.players || [],
        score: Number(context.score) || 0,
        description:
            `A chemistry context based on the group's shared history and tactical relationship in the game's fan model.`
    }));

    const entries = [...pairEntries, ...contextEntries]
        .filter(entry => {
            if(!query) return true;

            const characterText =
                entry.characters.join(" ").toLowerCase();

            return (
                entry.characters.join(" ").toLowerCase().includes(query) ||
                characterText.includes(query) ||
                String(entry.name || "").toLowerCase().includes(query) ||
                String(entry.label || "").toLowerCase().includes(query) ||
                String(entry.description || "").toLowerCase().includes(query)
            );
        });

    grid.innerHTML = entries.map((entry,index) => {
        const isPair = entry.type === "pair";

        return `
            <article class="chemistry-lore-card">

                <div class="chemistry-lore-heading">
                    <div>
                        <span class="lore-kicker">
                            ${isPair ? "PLAYER LINK" : "TEAM CONTEXT"}
                        </span>

                        <h2>
                            ${
                                isPair
                                    ? `${esc(entry.characters[0])} × ${esc(entry.characters[1])}`
                                    : esc(entry.name)
                            }
                        </h2>

                        ${
                            isPair
                                ? `<span class="chemistry-lore-label">${esc(entry.label)}</span>`
                                : ""
                        }
                    </div>

                    <div class="chemistry-lore-score">
                        <span>CHEM</span>
                        <strong>${entry.score}</strong>
                    </div>
                </div>

                <p class="chemistry-lore-description">
                    ${esc(entry.description)}
                </p>

                <div class="chemistry-lore-characters">
                    ${
                        entry.characters.map(name => `
                            <span>${esc(name)}</span>
                        `).join("")
                    }
                </div>

            </article>
        `;
    }).join("");

    if(!entries.length){
        grid.innerHTML = `
            <div class="lore-empty">
                NO CHEMISTRY ENTRIES MATCH YOUR SEARCH.
            </div>
        `;
    }
}


function openLoreMenu(){
    setVisibleScreen(document.getElementById("lore-menu-screen"));
}


function openCharacterLore(){
    setVisibleScreen(document.getElementById("character-lore-screen"));
    renderCharacterLore();
}


function openChemistryLore(){
    setVisibleScreen(document.getElementById("chemistry-lore-screen"));
    renderChemistryLore();
}


function bindLoreUI(){
    document.getElementById("menuLore")
        ?.addEventListener("click", openLoreMenu);

    document.getElementById("loreBackToMenu")
        ?.addEventListener("click", () => {
            setVisibleScreen(menuScreen);
            refreshMainMenu();
        });

    document.getElementById("loreCharacters")
        ?.addEventListener("click", openCharacterLore);

    document.getElementById("loreChemistry")
        ?.addEventListener("click", openChemistryLore);

    document.getElementById("charactersBackToLore")
        ?.addEventListener("click", openLoreMenu);

    document.getElementById("chemistryBackToLore")
        ?.addEventListener("click", openLoreMenu);

    document.getElementById("characterLoreSearch")
        ?.addEventListener("input", renderCharacterLore);

    document.getElementById("chemistryLoreSearch")
        ?.addEventListener("input", renderChemistryLore);
}

bindLoreUI();
