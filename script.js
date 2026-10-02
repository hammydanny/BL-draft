// ==================================================
// BLUE LOCK AUCTION
// MAIN GAME SCRIPT
// ==================================================


// ==================================================
// GAME DATA
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

let remainingPlayers = [];

let currentPlayer = null;
let currentBid = 0;
let currentBidder = null;

let startingTeam = null;


// ==================================================
// HTML ELEMENTS
// ==================================================

const setupScreen =
    document.getElementById("setup-screen");

const auctionScreen =
    document.getElementById("auction-screen");

const startGameButton =
    document.getElementById("startGame");

const auctionContent =
    document.getElementById("auction-content");


startGameButton.addEventListener(
    "click",
    startGame
);


// ==================================================
// START GAME
// ==================================================

function startGame() {

    const team1Name =
        document.getElementById("team1Name")
            .value
            .trim();

    const team2Name =
        document.getElementById("team2Name")
            .value
            .trim();

    const budget =
        Number(
            document.getElementById("budget").value
        );

    bidIncrement =
        Number(
            document.getElementById("bidIncrement").value
        );

    maxPlayers =
        Number(
            document.getElementById("maxPlayers").value
        );


    // VALIDATION

    if (!team1Name || !team2Name) {

        alert("Please enter names for both teams.");

        return;
    }


    if (budget <= 0) {

        alert(
            "Team budget must be greater than $0."
        );

        return;
    }


    if (bidIncrement <= 0) {

        alert(
            "Bid increment must be greater than $0."
        );

        return;
    }


    if (maxPlayers <= 0) {

        alert(
            "Maximum players must be greater than 0."
        );

        return;
    }


    // CREATE TEAMS

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


    // COPY PLAYER POOL

    remainingPlayers = [...players];


    // COIN FLIP

    startingTeam =
        Math.random() < 0.5 ? 1 : 2;


    // CHANGE SCREEN

    setupScreen.classList.add("hidden");

    auctionScreen.classList.remove("hidden");


    startNextAuction();
}


// ==================================================
// START NEXT AUCTION
// ==================================================

function startNextAuction() {

    // CHECK PLAYER POOL

    if (remainingPlayers.length === 0) {

        showAuctionComplete();

        return;
    }


    // RANDOM PLAYER

    const randomIndex =
        Math.floor(
            Math.random() *
            remainingPlayers.length
        );


    currentPlayer =
        remainingPlayers[randomIndex];


    // REMOVE FROM AVAILABLE POOL

    remainingPlayers.splice(
        randomIndex,
        1
    );


    // RESET AUCTION

    currentBid = 0;

    currentBidder = null;


    displayOpeningBid();
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

            <div class="player-card-name">

                ${currentPlayer.name}

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


// ==================================================
// SINGLE TEAM TRACKER
// ==================================================

function createTeamTracker(team, teamNumber) {

    let playerCards = "";


    if (team.players.length === 0) {

        playerCards = `

            <div class="empty-roster">

                No players drafted yet

            </div>

        `;

    } else {

        playerCards =
            team.players
                .map(player => `

                    <div class="mini-player-card">

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

        <div class="team-tracker team-${teamNumber}">

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

                REMAINING BUDGET

            </div>


            <div class="budget-amount">

                $${team.budget.toLocaleString()}

            </div>


            <div class="mini-roster">

                ${playerCards}

            </div>

        </div>

    `;
}


// ==================================================
// OPENING BID
// ==================================================

function displayOpeningBid() {

    const startingTeamObject =
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


    // STARTING TEAM HAS $0

    if (
        startingTeamObject.budget === 0
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

        <div class="auction-action">

            <div class="turn-label">
                OPENING BID
            </div>

            <h3>
                ${startingTeamObject.name}
            </h3>

            <p>
                Choose your opening bid.
            </p>


            <input
                type="number"
                id="openingBid"
                placeholder="Enter bid"
                step="${bidIncrement}"
            >


            <button id="placeOpeningBid">

                PLACE OPENING BID

            </button>

        </div>

    `);


    document
        .getElementById(
            "placeOpeningBid"
        )
        .addEventListener(
            "click",
            placeOpeningBid
        );
}


// ==================================================
// PLACE OPENING BID
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


    const startingTeamObject =
        startingTeam === 1
            ? team1
            : team2;


    if (openingBid <= 0) {

        alert(
            "Please enter a valid bid."
        );

        return;
    }


    if (
        openingBid %
        bidIncrement !== 0
    ) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    if (
        openingBid >
        startingTeamObject.budget
    ) {

        alert(
            "You cannot bid more than your remaining budget."
        );

        return;
    }


    if (
        startingTeamObject
            .players
            .length >= maxPlayers
    ) {

        alert(
            "Your team has reached the maximum roster size."
        );

        return;
    }


    currentBid =
        openingBid;

    currentBidder =
        startingTeam;


    const otherTeam =
        startingTeam === 1
            ? 2
            : 1;


    const otherTeamObject =
        otherTeam === 1
            ? team1
            : team2;


    // OTHER TEAM CANNOT COUNTER

    if (
        otherTeamObject.budget === 0
    ) {

        awardPlayer(
            startingTeam
        );

        return;
    }


    displayBiddingTurn(
        otherTeam
    );
}


// ==================================================
// BIDDING TURN
// ==================================================

function displayBiddingTurn(teamNumber) {

    const team =
        teamNumber === 1
            ? team1
            : team2;


    if (team.budget === 0) {

        awardPlayer(
            currentBidder
        );

        return;
    }


    const holder =
        currentBidder === 1
            ? team1
            : team2;


    renderAuctionScreen(`

        <div class="auction-action">

            <div class="turn-label">

                ${team.name}'S TURN

            </div>


            <div class="current-bid-label">

                CURRENT BID

            </div>


            <div class="current-bid">

                $${currentBid.toLocaleString()}

            </div>


            <p>

                Highest bidder:
                <strong>
                    ${holder.name}
                </strong>

            </p>


            <input
                type="number"
                id="nextBid"
                placeholder="Enter your bid"
                step="${bidIncrement}"
            >


            <button id="placeBidButton">

                PLACE BID

            </button>


            <button
                id="passButton"
                class="secondary-button"
            >

                PASS

            </button>

        </div>

    `);


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
}


// ==================================================
// PLACE BID
// ==================================================

function placeBid(teamNumber) {

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
        newBid <=
        currentBid
    ) {

        alert(
            `Your bid must be higher than $${currentBid.toLocaleString()}.`
        );

        return;
    }


    if (
        newBid %
        bidIncrement !== 0
    ) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    if (
        newBid >
        team.budget
    ) {

        alert(
            "You cannot afford this bid."
        );

        return;
    }


    if (
        team.players.length >=
        maxPlayers
    ) {

        alert(
            "Your team has reached the maximum roster size."
        );

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

function awardPlayer(teamNumber) {

    const winningTeam =
        teamNumber === 1
            ? team1
            : team2;


    winningTeam.budget -=
        currentBid;


    winningTeam.players.push(
        currentPlayer
    );


    const winningBid =
        currentBid;


    // ALTERNATE STARTER

    startingTeam =
        startingTeam === 1
            ? 2
            : 1;


    // PLAYER CARD REMAINS ON SCREEN HERE

    renderAuctionScreen(`

        <div class="auction-result winner-animation">

            <div class="sold-label">

                SOLD

            </div>


            <h2>

                ${winningTeam.name}

            </h2>


            <p>

                signs
                <strong>
                    ${currentPlayer.name}
                </strong>

            </p>


            <div class="winning-price">

                ${
                    winningBid === 0
                        ? "FREE"
                        : "$" +
                          winningBid
                              .toLocaleString()
                }

            </div>

        </div>


        <button
            id="nextPlayerButton"
            class="next-player-button"
        >

            NEXT PLAYER

        </button>

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


    const zeroBudgetTeam =
        teamNumber === 1
            ? team2
            : team1;


    renderAuctionScreen(`

        <div class="auction-action">

            <div class="turn-label">

                AUCTION CONTROL

            </div>


            <h3>

                ${teamWithMoney.name}

            </h3>


            <p>

                ${zeroBudgetTeam.name}
                has no remaining budget.

            </p>


            <p>

                Buy
                <strong>
                    ${currentPlayer.name}
                </strong>
                or pass and give them
                to ${zeroBudgetTeam.name}
                for free.

            </p>


            <input
                type="number"
                id="controlBid"
                placeholder="Enter bid"
                step="${bidIncrement}"
            >


            <button
                id="buyPlayerButton"
            >

                BUY PLAYER

            </button>


            <button
                id="controlPassButton"
                class="secondary-button"
            >

                PASS

            </button>

        </div>

    `);


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


    if (bid <= 0) {

        alert(
            "Please enter a valid bid."
        );

        return;
    }


    if (
        bid %
        bidIncrement !== 0
    ) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    if (
        bid >
        team.budget
    ) {

        alert(
            "You cannot afford this bid."
        );

        return;
    }


    if (
        team.players.length >=
        maxPlayers
    ) {

        alert(
            "Your team has reached the maximum roster size."
        );

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

    const zeroBudgetTeamNumber =
        teamNumber === 1
            ? 2
            : 1;


    currentBid = 0;

    currentBidder =
        zeroBudgetTeamNumber;


    awardPlayer(
        zeroBudgetTeamNumber
    );
}


// ==================================================
// MAIN AUCTION RENDERER
// ==================================================
//
// This is important:
//
// Every auction screen goes through this function.
// That means the player card stays on screen
// throughout the ENTIRE auction.
//

function renderAuctionScreen(
    actionHTML
) {

    auctionContent.innerHTML = `

        <div class="auction-layout">

            ${createTeamTrackers()}


            <main class="auction-center">

                ${createPlayerCard()}

                <div class="action-container">

                    ${actionHTML}

                </div>

            </main>

        </div>

    `;
}


// ==================================================
// AUCTION COMPLETE
// ==================================================

function showAuctionComplete() {

    auctionContent.innerHTML = `

        <div class="final-screen">

            <h2>
                AUCTION COMPLETE
            </h2>


            <p>
                All available players
                have been drafted.
            </p>


            ${createTeamTrackers()}

        </div>

    `;
}
