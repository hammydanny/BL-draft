// ===============================
// GAME SETTINGS
// ===============================

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


// ===============================
// AUCTION VARIABLES
// ===============================

let remainingPlayers = [];
let currentPlayer = null;
let currentBid = 0;
let currentBidder = null;
let startingTeam = null;


// ===============================
// HTML ELEMENTS
// ===============================

const setupScreen = document.getElementById("setup-screen");
const auctionScreen = document.getElementById("auction-screen");
const startGameButton = document.getElementById("startGame");

startGameButton.addEventListener("click", startGame);


// ===============================
// START GAME
// ===============================

function startGame() {

    const team1Name =
        document.getElementById("team1Name").value.trim();

    const team2Name =
        document.getElementById("team2Name").value.trim();

    const budget =
        Number(document.getElementById("budget").value);

    bidIncrement =
        Number(document.getElementById("bidIncrement").value);

    maxPlayers =
        Number(document.getElementById("maxPlayers").value);


    if (!team1Name || !team2Name) {
        alert("Please enter names for both teams.");
        return;
    }

    if (budget <= 0) {
        alert("Team budget must be greater than $0.");
        return;
    }

    if (bidIncrement <= 0) {
        alert("Bid increment must be greater than $0.");
        return;
    }

    if (maxPlayers <= 0) {
        alert("Maximum players must be greater than 0.");
        return;
    }


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

    startingTeam =
        Math.random() < 0.5 ? 1 : 2;


    setupScreen.classList.add("hidden");
    auctionScreen.classList.remove("hidden");

    startNextAuction();
}


// ===============================
// START NEXT AUCTION
// ===============================

function startNextAuction() {

    if (remainingPlayers.length === 0) {
        showAuctionComplete();
        return;
    }


    const randomIndex =
        Math.floor(Math.random() * remainingPlayers.length);

    currentPlayer =
        remainingPlayers[randomIndex];

    remainingPlayers.splice(randomIndex, 1);


    currentBid = 0;
    currentBidder = null;


    displayOpeningBid();
}


// ===============================
// PLAYER CARD
// ===============================

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

            <h2>${currentPlayer.name}</h2>

        </div>
    `;
}


// ===============================
// DISPLAY OPENING BID
// ===============================

function displayOpeningBid() {

    const startingTeamObject =
        startingTeam === 1 ? team1 : team2;


    // BOTH TEAMS HAVE $0
    // Scheduled starting team gets player for free.

    if (team1.budget === 0 && team2.budget === 0) {

        currentBid = 0;
        currentBidder = startingTeam;

        awardPlayer(startingTeam);

        return;
    }


    // STARTING TEAM HAS $0
    // Other team gets control.

    if (startingTeamObject.budget === 0) {

        const teamWithMoneyNumber =
            startingTeam === 1 ? 2 : 1;

        displayZeroBudgetChoice(teamWithMoneyNumber);

        return;
    }


    document.getElementById("auction-content").innerHTML = `

        ${createTeamTrackers()}

        ${createPlayerCard()}

        <div class="auction-action">

            <p>
                <strong>${startingTeamObject.name}</strong>
                starts the bidding.
            </p>

            <p>Choose your opening bid.</p>

            <input
                type="number"
                id="openingBid"
                placeholder="Enter opening bid"
                step="${bidIncrement}"
            >

            <button id="placeOpeningBid">
                PLACE OPENING BID
            </button>

        </div>
    `;


    document
        .getElementById("placeOpeningBid")
        .addEventListener(
            "click",
            placeOpeningBid
        );
}


// ===============================
// PLACE OPENING BID
// ===============================

function placeOpeningBid() {

    const openingBid =
        Number(document.getElementById("openingBid").value);


    const startingTeamObject =
        startingTeam === 1 ? team1 : team2;


    if (openingBid <= 0) {

        alert("Please enter a valid bid.");
        return;
    }


    if (openingBid % bidIncrement !== 0) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    if (openingBid > startingTeamObject.budget) {

        alert(
            "You cannot bid more than your remaining budget."
        );

        return;
    }


    if (
        startingTeamObject.players.length >= maxPlayers
    ) {

        alert(
            "Your team has reached the maximum roster size."
        );

        return;
    }


    currentBid = openingBid;
    currentBidder = startingTeam;


    const otherTeam =
        startingTeam === 1 ? 2 : 1;


    // If the other team has no money,
    // the opening bidder automatically wins.

    const otherTeamObject =
        otherTeam === 1 ? team1 : team2;

    if (otherTeamObject.budget === 0) {

        awardPlayer(startingTeam);
        return;
    }


    displayBiddingTurn(otherTeam);
}


// ===============================
// DISPLAY BIDDING TURN
// ===============================

function displayBiddingTurn(teamNumber) {

    const team =
        teamNumber === 1 ? team1 : team2;


    // If this team has no money,
    // they cannot counter the current bid.

    if (team.budget === 0) {

        awardPlayer(currentBidder);
        return;
    }


    const currentHolder =
        currentBidder === 1 ? team1 : team2;


    document.getElementById("auction-content").innerHTML = `

        ${createTeamTrackers()}

        ${createPlayerCard()}

        <div class="auction-action">

            <h3>
                Current Bid:
                $${currentBid.toLocaleString()}
            </h3>

            <p>
                Current holder:
                <strong>${currentHolder.name}</strong>
            </p>

            <p>
                <strong>${team.name}</strong>'s turn
            </p>

            <p>
                Enter any bid higher than
                $${currentBid.toLocaleString()}.
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
    `;


    document
        .getElementById("placeBidButton")
        .addEventListener(
            "click",
            () => placeBid(teamNumber)
        );


    document
        .getElementById("passButton")
        .addEventListener(
            "click",
            () => passBid(teamNumber)
        );
}


// ===============================
// PLACE BID
// ===============================

function placeBid(teamNumber) {

    const team =
        teamNumber === 1 ? team1 : team2;


    const newBid =
        Number(document.getElementById("nextBid").value);


    if (newBid <= currentBid) {

        alert(
            `Your bid must be higher than $${currentBid.toLocaleString()}.`
        );

        return;
    }


    if (newBid % bidIncrement !== 0) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    if (newBid > team.budget) {

        alert("You cannot afford this bid.");
        return;
    }


    if (team.players.length >= maxPlayers) {

        alert(
            "Your team has reached the maximum roster size."
        );

        return;
    }


    currentBid = newBid;
    currentBidder = teamNumber;


    const nextTeam =
        teamNumber === 1 ? 2 : 1;


    displayBiddingTurn(nextTeam);
}


// ===============================
// PASS
// ===============================

function passBid() {

    awardPlayer(currentBidder);
}


// ===============================
// AWARD PLAYER
// ===============================

function awardPlayer(teamNumber) {

    const winningTeam =
        teamNumber === 1 ? team1 : team2;


    winningTeam.budget -= currentBid;

    winningTeam.players.push(currentPlayer);


    // Save these before the next auction changes anything.

    const playerName = currentPlayer.name;
    const playerImage = currentPlayer.image;
    const winningBid = currentBid;


    // Alternate the scheduled starting team.

    startingTeam =
        startingTeam === 1 ? 2 : 1;


    document.getElementById("auction-content").innerHTML = `

        ${createTeamTrackers()}

        <div class="current-player">

            <div class="player-image-container">

                <img
                    class="player-image"
                    src="${playerImage}"
                    alt="${playerName}"
                >

            </div>

            <h2>${playerName}</h2>

        </div>


        <div class="auction-result">

            <h3>${winningTeam.name} wins!</h3>

            <p>
                Winning bid:
                <strong>
                    ${
                        winningBid === 0
                            ? "FREE"
                            : "$" + winningBid.toLocaleString()
                    }
                </strong>
            </p>

        </div>


        <button
            id="nextPlayerButton"
            class="next-player-button"
        >
            NEXT PLAYER
        </button>
    `;


    document
        .getElementById("nextPlayerButton")
        .addEventListener(
            "click",
            startNextAuction
        );
}


// ===============================
// ZERO-BUDGET CHOICE
// ===============================

function displayZeroBudgetChoice(teamNumber) {

    const teamWithMoney =
        teamNumber === 1 ? team1 : team2;

    const zeroBudgetTeam =
        teamNumber === 1 ? team2 : team1;


    document.getElementById("auction-content").innerHTML = `

        ${createTeamTrackers()}

        ${createPlayerCard()}


        <div class="auction-action">

            <p>
                <strong>${zeroBudgetTeam.name}</strong>
                has no remaining budget.
            </p>

            <p>
                <strong>${teamWithMoney.name}</strong>
                has control of this auction.
            </p>

            <p>
                Enter how much you want to pay for
                ${currentPlayer.name}, or pass.
            </p>

            <input
                type="number"
                id="controlBid"
                placeholder="Enter bid"
                step="${bidIncrement}"
            >

            <button id="buyPlayerButton">
                BUY PLAYER
            </button>

            <button
                id="controlPassButton"
                class="secondary-button"
            >
                PASS
            </button>

        </div>
    `;


    document
        .getElementById("buyPlayerButton")
        .addEventListener(
            "click",
            () => buyWithControl(teamNumber)
        );


    document
        .getElementById("controlPassButton")
        .addEventListener(
            "click",
            () => passWithControl(teamNumber)
        );
}


// ===============================
// BUY WITH CONTROL
// ===============================

function buyWithControl(teamNumber) {

    const team =
        teamNumber === 1 ? team1 : team2;


    const bid =
        Number(document.getElementById("controlBid").value);


    if (bid <= 0) {

        alert("Please enter a valid bid.");
        return;
    }


    if (bid % bidIncrement !== 0) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    if (bid > team.budget) {

        alert("You cannot afford this bid.");
        return;
    }


    if (team.players.length >= maxPlayers) {

        alert(
            "Your team has reached the maximum roster size."
        );

        return;
    }


    currentBid = bid;
    currentBidder = teamNumber;


    awardPlayer(teamNumber);
}


// ===============================
// PASS WITH CONTROL
// ===============================

function passWithControl(teamNumber) {

    const zeroBudgetTeamNumber =
        teamNumber === 1 ? 2 : 1;


    currentBid = 0;
    currentBidder = zeroBudgetTeamNumber;


    awardPlayer(zeroBudgetTeamNumber);
}


// ===============================
// TEAM TRACKERS
// ===============================

function createTeamTrackers() {

    return `

        <div class="team-trackers">

            <div class="team-tracker">

                <h3>${team1.name}</h3>

                <p>
                    Budget:
                    <strong>
                        $${team1.budget.toLocaleString()}
                    </strong>
                </p>

                <p>
                    Players:
                    <strong>
                        ${team1.players.length} / ${maxPlayers}
                    </strong>
                </p>

                <div class="player-list">

                    ${
                        team1.players.length === 0
                            ? "<span>No players yet</span>"
                            : team1.players
                                .map(
                                    player =>
                                        `<div>${player.name}</div>`
                                )
                                .join("")
                    }

                </div>

            </div>


            <div class="team-tracker">

                <h3>${team2.name}</h3>

                <p>
                    Budget:
                    <strong>
                        $${team2.budget.toLocaleString()}
                    </strong>
                </p>

                <p>
                    Players:
                    <strong>
                        ${team2.players.length} / ${maxPlayers}
                    </strong>
                </p>

                <div class="player-list">

                    ${
                        team2.players.length === 0
                            ? "<span>No players yet</span>"
                            : team2.players
                                .map(
                                    player =>
                                        `<div>${player.name}</div>`
                                )
                                .join("")
                    }

                </div>

            </div>

        </div>
    `;
}


// ===============================
// AUCTION COMPLETE
// ===============================

function showAuctionComplete() {

    document.getElementById("auction-content").innerHTML = `

        ${createTeamTrackers()}

        <div class="auction-result">

            <h2>AUCTION COMPLETE</h2>

            <p>
                All available players have been drafted.
            </p>

        </div>
    `;
}
