// ==================================================
// BLUE LOCK AUCTION
// ==================================================


// ==================================================
// GAME STATE
// ==================================================

let team1 = {
    name: "",
    budget: 0,
    players: []
};

let team2 = {
    name: "",
    budget: 0,
    players: []
};

let bidIncrement = 50;
let maxPlayers = 15;
let startingBudget = 15000;

let remainingPlayers = [];

let currentPlayer = null;
let currentBid = 0;
let currentBidder = null;

let startingTeam = null;
let auctionNumber = 0;

let auctionHistory = [];


// ==================================================
// HTML
// ==================================================

const setupScreen =
    document.getElementById("setup-screen");

const auctionScreen =
    document.getElementById("auction-screen");

const auctionContent =
    document.getElementById("auction-content");

const startGameButton =
    document.getElementById("startGame");

const gameOverlay =
    document.getElementById("game-overlay");

const overlayContent =
    document.getElementById("overlay-content");

const playersRemainingDisplay =
    document.getElementById("playersRemaining");


startGameButton.addEventListener(
    "click",
    startGame
);


// ==================================================
// START GAME
// ==================================================

function startGame() {

    const team1Name =
        document
            .getElementById("team1Name")
            .value
            .trim();

    const team2Name =
        document
            .getElementById("team2Name")
            .value
            .trim();

    const budget =
        Number(
            document
                .getElementById("budget")
                .value
        );

    bidIncrement =
        Number(
            document
                .getElementById("bidIncrement")
                .value
        );

    maxPlayers =
        Number(
            document
                .getElementById("maxPlayers")
                .value
        );


    if (!team1Name || !team2Name) {

        alert(
            "Please enter names for both teams."
        );

        return;
    }


    if (budget <= 0) {

        alert(
            "Starting budget must be greater than $0."
        );

        return;
    }


    if (bidIncrement <= 0) {

        alert(
            "Bid interval must be greater than $0."
        );

        return;
    }


    if (maxPlayers <= 0) {

        alert(
            "Maximum players must be greater than 0."
        );

        return;
    }


    startingBudget = budget;


    team1 = {
        name: team1Name,
        budget: budget,
        players: []
    };

    team2 = {
        name: team2Name,
        budget: budget,
        players: []
    };


    remainingPlayers = [...players];

    auctionHistory = [];

    auctionNumber = 0;

    currentPlayer = null;

    currentBid = 0;

    currentBidder = null;


    // Coin flip

    startingTeam =
        Math.random() < 0.5
            ? 1
            : 2;


    setupScreen.classList.add(
        "hidden"
    );

    auctionScreen.classList.remove(
        "hidden"
    );


    updatePlayersRemaining();

    showCoinFlip();
}


// ==================================================
// COIN FLIP
// ==================================================

function showCoinFlip() {

    const firstTeam =
        startingTeam === 1
            ? team1
            : team2;


    showOverlay(`

        <div class="coin">
            ?
        </div>

        <div class="overlay-eyebrow">
            OPENING BID
        </div>

        <h2>
            ${firstTeam.name}
        </h2>

        <p>
            won the coin flip
        </p>

    `);


    setTimeout(() => {

        hideOverlay();

        startNextAuction();

    }, 1800);
}


// ==================================================
// NEXT AUCTION
// ==================================================

function startNextAuction() {

    if (
        remainingPlayers.length === 0 ||
        (
            team1.players.length >= maxPlayers &&
            team2.players.length >= maxPlayers
        )
    ) {

        showAuctionComplete();

        return;
    }


    const randomIndex =
        Math.floor(
            Math.random() *
            remainingPlayers.length
        );


    currentPlayer =
        remainingPlayers[randomIndex];


    remainingPlayers.splice(
        randomIndex,
        1
    );


    currentBid = 0;

    currentBidder = null;

    auctionNumber++;


    updatePlayersRemaining();

    showPlayerReveal();
}


// ==================================================
// PLAYER REVEAL
// ==================================================

function showPlayerReveal() {

    showOverlay(`

        <div class="overlay-eyebrow">
            PLAYER SELECTED
        </div>


        <div class="reveal-image">

            <img
                src="${currentPlayer.image}"
                alt="${currentPlayer.name}"
            >

        </div>


        <h2>
            ${currentPlayer.name}
        </h2>


        <div class="auction-number">
            AUCTION ${auctionNumber}
        </div>

    `);


    setTimeout(() => {

        hideOverlay();

        displayOpeningBid();

    }, 1500);
}


// ==================================================
// PLAYER CARD
// ==================================================

function createPlayerCard() {

    return `

        <div class="current-player">

            <div class="player-image-container">

                <img
                    class="player-image"
                    src="${currentPlayer.image}"
                    alt="${currentPlayer.name}"
                >

            </div>


            <div class="player-card-bottom">

                <div class="player-card-label">
                    CURRENT PLAYER // AUCTION ${auctionNumber}
                </div>

                <div class="player-card-name">
                    ${currentPlayer.name}
                </div>

            </div>

        </div>

    `;
}


// ==================================================
// TEAM TRACKERS
// ==================================================

function createTeamTrackers() {

    return `

        <div class="team-trackers">

            ${createTeamTracker(team1, 1)}

            ${createTeamTracker(team2, 2)}

        </div>

    `;
}


function createTeamTracker(
    team,
    number
) {

    let rosterHTML;


    if (
        team.players.length === 0
    ) {

        rosterHTML = `

            <div class="empty-roster">
                No players yet
            </div>

        `;

    } else {

        rosterHTML =
            team.players
                .map(player => `

                    <div
                        class="mini-player-card"
                        title="${player.name}"
                    >

                        <img
                            src="${player.image}"
                            alt="${player.name}"
                        >

                        <span>
                            ${player.name}
                        </span>

                    </div>

                `)
                .join("");
    }


    return `

        <div
            class="
                team-tracker
                team-${number}
            "
        >

            <div class="team-header">

                <h3>
                    ${team.name}
                </h3>


                <span class="roster-count">

                    ${team.players.length}
                    /
                    ${maxPlayers}

                </span>

            </div>


            <div class="budget-label">
                BUDGET
            </div>


            <div class="budget-amount">

                $${team.budget.toLocaleString()}

            </div>


            <div class="mini-roster">

                ${rosterHTML}

            </div>

        </div>

    `;
}


// ==================================================
// OPENING BID
// ==================================================

function displayOpeningBid() {

    const starter =
        startingTeam === 1
            ? team1
            : team2;


    // BOTH TEAMS HAVE $0

    if (
        team1.budget === 0 &&
        team2.budget === 0
    ) {

        currentBid = 0;

        currentBidder =
            startingTeam;

        awardPlayer(
            startingTeam
        );

        return;
    }


    // STARTER HAS $0

    if (
        starter.budget === 0
    ) {

        const teamWithMoney =
            startingTeam === 1
                ? 2
                : 1;


        displayZeroBudgetChoice(
            teamWithMoney
        );

        return;
    }


    renderAuctionScreen(`

        <div class="turn-indicator">

            <span>
                OPENING BID
            </span>

            ${starter.name}

        </div>


        <div class="bid-panel">

            <p>
                Choose your opening bid.
            </p>


            <div class="money-input">

                <span>$</span>

                <input
                    type="number"
                    id="openingBid"
                    value="${bidIncrement}"
                    min="${bidIncrement}"
                    step="${bidIncrement}"
                >

            </div>


            ${createQuickBidButtons(
                "openingBid"
            )}


            <button
                id="placeOpeningBid"
                class="primary-button"
            >

                PLACE BID

            </button>

        </div>

    `);


    const input =
        document.getElementById(
            "openingBid"
        );


    document
        .getElementById(
            "placeOpeningBid"
        )
        .addEventListener(
            "click",
            placeOpeningBid
        );


    enableEnterKey(
        input,
        placeOpeningBid
    );


    input.select();
}


// ==================================================
// QUICK BID BUTTONS
// ==================================================

function createQuickBidButtons(
    inputId
) {

    return `

        <div class="quick-bids">

            <button
                type="button"
                onclick="
                    increaseBidInput(
                        '${inputId}',
                        ${bidIncrement}
                    )
                "
            >
                +$${bidIncrement.toLocaleString()}
            </button>


            <button
                type="button"
                onclick="
                    increaseBidInput(
                        '${inputId}',
                        ${bidIncrement * 5}
                    )
                "
            >
                +$${(
                    bidIncrement * 5
                ).toLocaleString()}
            </button>


            <button
                type="button"
                onclick="
                    increaseBidInput(
                        '${inputId}',
                        ${bidIncrement * 10}
                    )
                "
            >
                +$${(
                    bidIncrement * 10
                ).toLocaleString()}
            </button>

        </div>

    `;
}


function increaseBidInput(
    inputId,
    amount
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {
        return;
    }


    const currentValue =
        Number(input.value) || 0;


    input.value =
        currentValue + amount;
}


// ==================================================
// OPENING BID VALIDATION
// ==================================================

function placeOpeningBid() {

    const openingBid =
        Number(
            document
                .getElementById(
                    "openingBid"
                )
                .value
        );


    const starter =
        startingTeam === 1
            ? team1
            : team2;


    if (
        !validateBid(
            openingBid,
            starter,
            0
        )
    ) {

        return;
    }


    currentBid =
        openingBid;

    currentBidder =
        startingTeam;


    const otherTeamNumber =
        startingTeam === 1
            ? 2
            : 1;


    const otherTeam =
        otherTeamNumber === 1
            ? team1
            : team2;


    if (
        otherTeam.budget === 0
    ) {

        awardPlayer(
            startingTeam
        );

        return;
    }


    displayBiddingTurn(
        otherTeamNumber
    );
}


// ==================================================
// NORMAL BIDDING
// ==================================================

function displayBiddingTurn(
    teamNumber
) {

    const team =
        teamNumber === 1
            ? team1
            : team2;


    if (
        team.budget === 0
    ) {

        awardPlayer(
            currentBidder
        );

        return;
    }


    const holder =
        currentBidder === 1
            ? team1
            : team2;


    const minimumBid =
        currentBid +
        bidIncrement;


    renderAuctionScreen(`

        <div class="turn-indicator active-turn">

            <span>
                YOUR TURN
            </span>

            ${team.name}

        </div>


        <div class="bid-panel">


            <div class="current-bid-label">

                CURRENT BID

            </div>


            <div class="current-bid">

                $${currentBid.toLocaleString()}

            </div>


            <div class="bid-holder">

                Held by

                <strong>
                    ${holder.name}
                </strong>

            </div>


            <div class="money-input">

                <span>$</span>

                <input
                    type="number"
                    id="nextBid"
                    value="${minimumBid}"
                    min="${minimumBid}"
                    step="${bidIncrement}"
                >

            </div>


            ${createQuickBidButtons(
                "nextBid"
            )}


            <button
                id="placeBidButton"
                class="primary-button"
            >

                PLACE BID

            </button>


            <button
                id="passButton"
                class="pass-button"
            >

                PASS

            </button>

        </div>

    `);


    const input =
        document.getElementById(
            "nextBid"
        );


    document
        .getElementById(
            "placeBidButton"
        )
        .addEventListener(
            "click",
            () =>
                placeBid(
                    teamNumber
                )
        );


    document
        .getElementById(
            "passButton"
        )
        .addEventListener(
            "click",
            passBid
        );


    enableEnterKey(
        input,
        () =>
            placeBid(
                teamNumber
            )
    );


    input.select();
}


// ==================================================
// PLACE NORMAL BID
// ==================================================

function placeBid(
    teamNumber
) {

    const team =
        teamNumber === 1
            ? team1
            : team2;


    const newBid =
        Number(
            document
                .getElementById(
                    "nextBid"
                )
                .value
        );


    if (
        !validateBid(
            newBid,
            team,
            currentBid
        )
    ) {

        return;
    }


    currentBid =
        newBid;

    currentBidder =
        teamNumber;


    const nextTeam =
        teamNumber === 1
            ? 2
            : 1;


    displayBiddingTurn(
        nextTeam
    );
}


// ==================================================
// BID VALIDATION
// ==================================================

function validateBid(
    bid,
    team,
    minimum
) {

    if (
        bid <= minimum
    ) {

        alert(
            minimum === 0
                ? "Please enter a valid bid."
                : `Your bid must be higher than $${minimum.toLocaleString()}.`
        );

        return false;
    }


    if (
        bid %
        bidIncrement !== 0
    ) {

        alert(
            `Bids must be in intervals of $${bidIncrement}.`
        );

        return false;
    }


    if (
        bid >
        team.budget
    ) {

        alert(
            `${team.name} only has $${team.budget.toLocaleString()} remaining.`
        );

        return false;
    }


    if (
        team.players.length >=
        maxPlayers
    ) {

        alert(
            `${team.name}'s roster is full.`
        );

        return false;
    }


    return true;
}


// ==================================================
// PASS
// ==================================================

function passBid() {

    awardPlayer(
        currentBidder
    );
}


// ==================================================
// AWARD PLAYER
// ==================================================

function awardPlayer(
    teamNumber
) {

    const winner =
        teamNumber === 1
            ? team1
            : team2;


    const price =
        currentBid;


    winner.budget -=
        price;


    winner.players.push(
        currentPlayer
    );


    // Record completed auction

    auctionHistory.push({

        auction:
            auctionNumber,

        player:
            currentPlayer,

        teamNumber:
            teamNumber,

        teamName:
            winner.name,

        price:
            price

    });


    // Alternate opening bidder

    startingTeam =
        startingTeam === 1
            ? 2
            : 1;


    renderAuctionScreen(`

        <div class="sold-panel">

            <div class="sold-word">
                SOLD
            </div>


            <div class="sold-to">
                TO
            </div>


            <h2>
                ${winner.name}
            </h2>


            <div class="winning-price">

                ${
                    price === 0
                        ? "FREE"
                        : "$" +
                          price
                              .toLocaleString()
                }

            </div>


            <button
                id="nextPlayerButton"
                class="primary-button"
            >

                NEXT PLAYER

            </button>

        </div>

    `);


    document
        .getElementById(
            "nextPlayerButton"
        )
        .addEventListener(
            "click",
            startNextAuction
        );
}


// ==================================================
// ZERO-BUDGET CONTROL
// ==================================================

function displayZeroBudgetChoice(
    teamNumber
) {

    const teamWithMoney =
        teamNumber === 1
            ? team1
            : team2;


    const brokeTeam =
        teamNumber === 1
            ? team2
            : team1;


    renderAuctionScreen(`

        <div class="turn-indicator active-turn">

            <span>
                AUCTION CONTROL
            </span>

            ${teamWithMoney.name}

        </div>


        <div class="bid-panel">

            <p>
                ${brokeTeam.name}
                has no budget.
            </p>


            <p>

                Buy

                <strong>
                    ${currentPlayer.name}
                </strong>

                or pass to give them to

                <strong>
                    ${brokeTeam.name}
                </strong>

                for free.

            </p>


            <div class="money-input">

                <span>$</span>

                <input
                    type="number"
                    id="controlBid"
                    value="${bidIncrement}"
                    min="${bidIncrement}"
                    step="${bidIncrement}"
                >

            </div>


            ${createQuickBidButtons(
                "controlBid"
            )}


            <button
                id="buyPlayerButton"
                class="primary-button"
            >

                BUY PLAYER

            </button>


            <button
                id="controlPassButton"
                class="pass-button"
            >

                PASS

            </button>

        </div>

    `);


    const input =
        document.getElementById(
            "controlBid"
        );


    document
        .getElementById(
            "buyPlayerButton"
        )
        .addEventListener(
            "click",
            () =>
                buyWithControl(
                    teamNumber
                )
        );


    document
        .getElementById(
            "controlPassButton"
        )
        .addEventListener(
            "click",
            () =>
                passWithControl(
                    teamNumber
                )
        );


    enableEnterKey(
        input,
        () =>
            buyWithControl(
                teamNumber
            )
    );


    input.select();
}


// ==================================================
// BUY WITH CONTROL
// ==================================================

function buyWithControl(
    teamNumber
) {

    const team =
        teamNumber === 1
            ? team1
            : team2;


    const bid =
        Number(
            document
                .getElementById(
                    "controlBid"
                )
                .value
        );


    if (
        !validateBid(
            bid,
            team,
            0
        )
    ) {

        return;
    }


    currentBid =
        bid;


    currentBidder =
        teamNumber;


    awardPlayer(
        teamNumber
    );
}


// ==================================================
// PASS WITH CONTROL
// ==================================================

function passWithControl(
    teamNumber
) {

    const brokeTeamNumber =
        teamNumber === 1
            ? 2
            : 1;


    currentBid = 0;


    currentBidder =
        brokeTeamNumber;


    awardPlayer(
        brokeTeamNumber
    );
}


// ==================================================
// ENTER KEY
// ==================================================

function enableEnterKey(
    input,
    action
) {

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                action();
            }
        }
    );
}


// ==================================================
// AUCTION HISTORY PANEL
// ==================================================

function createAuctionHistoryPanel() {

    const latestAuctions =
        [...auctionHistory]
            .reverse()
            .slice(0, 6);


    let historyHTML;


    if (
        latestAuctions.length === 0
    ) {

        historyHTML = `

            <div class="history-empty">
                Completed auctions will appear here.
            </div>

        `;

    } else {

        historyHTML =
            latestAuctions
                .map(item => `

                    <div class="history-row">

                        <img
                            src="${item.player.image}"
                            alt="${item.player.name}"
                        >


                        <div class="history-player">

                            <strong>
                                ${item.player.name}
                            </strong>

                            <span>
                                AUCTION
                                ${String(item.auction).padStart(2, "0")}
                                //
                                ${item.teamName}
                            </span>

                        </div>


                        <div class="history-price">

                            ${
                                item.price === 0
                                    ? "FREE"
                                    : "$" +
                                      item.price
                                          .toLocaleString()
                            }

                        </div>

                    </div>

                `)
                .join("");
    }


    return `

        <section class="auction-history-panel">

            <div class="history-heading">

                <div>

                    <span>
                        TRANSFER LOG
                    </span>

                    <h3>
                        AUCTION HISTORY
                    </h3>

                </div>


                <b>
                    ${auctionHistory.length}
                </b>

            </div>


            <div class="history-list">

                ${historyHTML}

            </div>

        </section>

    `;
}


// ==================================================
// RENDER AUCTION
// ==================================================

function renderAuctionScreen(
    actionHTML
) {

    auctionContent.innerHTML = `

        <div class="auction-layout">

            ${createTeamTrackers()}


            <div class="auction-main">

                ${createPlayerCard()}


                <div class="action-container">

                    ${actionHTML}

                </div>

            </div>


            ${createAuctionHistoryPanel()}

        </div>

    `;
}


// ==================================================
// PLAYER COUNT
// ==================================================

function updatePlayersRemaining() {

    playersRemainingDisplay.innerHTML = `

        <span>
            ${remainingPlayers.length}
        </span>

        PLAYERS LEFT

    `;
}


// ==================================================
// OVERLAY
// ==================================================

function showOverlay(
    html
) {

    overlayContent.innerHTML =
        html;


    gameOverlay.classList.remove(
        "hidden"
    );
}


function hideOverlay() {

    gameOverlay.classList.add(
        "overlay-out"
    );


    setTimeout(() => {

        gameOverlay.classList.add(
            "hidden"
        );


        gameOverlay.classList.remove(
            "overlay-out"
        );

    }, 250);
}


// ==================================================
// FINAL RESULTS HELPERS
// ==================================================

function getTeamHistory(
    teamNumber
) {

    return auctionHistory.filter(
        item =>
            item.teamNumber ===
            teamNumber
    );
}


function getMostExpensiveSigning(
    teamNumber
) {

    const signings =
        getTeamHistory(
            teamNumber
        );


    if (
        signings.length === 0
    ) {

        return null;
    }


    return signings.reduce(
        (
            highest,
            signing
        ) => {

            if (
                signing.price >
                highest.price
            ) {

                return signing;
            }


            return highest;
        }
    );
}


// ==================================================
// FINAL TEAM CARD
// ==================================================

function createFinalTeamCard(
    team,
    teamNumber
) {

    const spent =
        startingBudget -
        team.budget;


    const expensive =
        getMostExpensiveSigning(
            teamNumber
        );


    let rosterHTML;


    if (
        team.players.length === 0
    ) {

        rosterHTML = `

            <div class="history-empty">
                No players drafted.
            </div>

        `;

    } else {

        rosterHTML =
            team.players
                .map(player => `

                    <div class="final-player">

                        <img
                            src="${player.image}"
                            alt="${player.name}"
                        >

                        <span>
                            ${player.name}
                        </span>

                    </div>

                `)
                .join("");
    }


    return `

        <article class="final-team-card">


            <div class="final-team-top">

                <span>
                    TEAM
                    ${String(teamNumber).padStart(2, "0")}
                </span>

                <h3>
                    ${team.name}
                </h3>

            </div>


            <div class="final-stats">


                <div>

                    <span>
                        PLAYERS
                    </span>

                    <strong>
                        ${team.players.length}
                    </strong>

                </div>


                <div>

                    <span>
                        SPENT
                    </span>

                    <strong>
                        $${spent.toLocaleString()}
                    </strong>

                </div>


                <div>

                    <span>
                        REMAINING
                    </span>

                    <strong>
                        $${team.budget.toLocaleString()}
                    </strong>

                </div>


            </div>


            <div class="biggest-signing">

                <span>
                    MOST EXPENSIVE SIGNING
                </span>


                <strong>

                    ${
                        expensive
                            ? expensive.player.name
                            : "—"
                    }

                </strong>


                <b>

                    ${
                        expensive
                            ? (
                                expensive.price === 0
                                    ? "FREE"
                                    : "$" +
                                      expensive.price
                                          .toLocaleString()
                            )
                            : "—"
                    }

                </b>

            </div>


            <div class="final-roster">

                ${rosterHTML}

            </div>

        </article>

    `;
}


// ==================================================
// COMPLETE HISTORY
// ==================================================

function createFullHistory() {

    if (
        auctionHistory.length === 0
    ) {

        return `

            <div class="history-empty">
                No completed auctions.
            </div>

        `;
    }


    return auctionHistory
        .map(item => `

            <div class="final-history-row">


                <span class="history-number">

                    ${String(item.auction).padStart(2, "0")}

                </span>


                <img
                    src="${item.player.image}"
                    alt="${item.player.name}"
                >


                <div>

                    <strong>
                        ${item.player.name}
                    </strong>

                    <span>
                        ${item.teamName}
                    </span>

                </div>


                <b>

                    ${
                        item.price === 0
                            ? "FREE"
                            : "$" +
                              item.price
                                  .toLocaleString()
                    }

                </b>

            </div>

        `)
        .join("");
}


// ==================================================
// AUCTION COMPLETE
// ==================================================

function showAuctionComplete() {

    playersRemainingDisplay.innerHTML =
        "COMPLETE";


    auctionContent.innerHTML = `

        <div class="complete-screen results-screen">


            <div class="complete-label">
                EGO // AUCTION SYSTEM
            </div>


            <h2>
                DRAFT COMPLETE
            </h2>


            <p class="results-subtitle">
                FINAL SQUAD REPORT
            </p>


            <div class="final-team-grid">

                ${createFinalTeamCard(
                    team1,
                    1
                )}

                ${createFinalTeamCard(
                    team2,
                    2
                )}

            </div>


            <section class="full-history">


                <div class="history-heading">

                    <div>

                        <span>
                            COMPLETE RECORD
                        </span>

                        <h3>
                            AUCTION HISTORY
                        </h3>

                    </div>


                    <b>
                        ${auctionHistory.length}
                    </b>

                </div>


                <div class="full-history-list">

                    ${createFullHistory()}

                </div>

            </section>


            <button
                id="restartAuctionButton"
                class="primary-button restart-button"
            >

                NEW AUCTION

            </button>


        </div>

    `;


    document
        .getElementById(
            "restartAuctionButton"
        )
        .addEventListener(
            "click",
            restartAuction
        );
}


// ==================================================
// RESTART
// ==================================================

function restartAuction() {

    auctionScreen.classList.add(
        "hidden"
    );


    setupScreen.classList.remove(
        "hidden"
    );


    auctionContent.innerHTML =
        "";


    playersRemainingDisplay.innerHTML =
        "";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
