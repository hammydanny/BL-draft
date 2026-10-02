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
// GET HTML ELEMENTS
// ===============================

const setupScreen = document.getElementById("setup-screen");

const auctionScreen = document.getElementById("auction-screen");

const startGameButton = document.getElementById("startGame");


// ===============================
// START GAME
// ===============================

startGameButton.addEventListener("click", startGame);


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


    // Check settings

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


    // Create teams

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


    // Copy player list

    remainingPlayers = [...players];


    // Randomly decide who starts

    startingTeam =
        Math.random() < 0.5 ? 1 : 2;


    // Hide setup

    setupScreen.classList.add("hidden");

    // Show auction

    auctionScreen.classList.remove("hidden");


    // Start first auction

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


    // Select random player

    const randomIndex =
        Math.floor(Math.random() * remainingPlayers.length);

    currentPlayer =
        remainingPlayers[randomIndex];


    // Remove player from available pool

    remainingPlayers.splice(randomIndex, 1);


    // Reset auction

    currentBid = 0;

    currentBidder = null;


    // Starting team opens bidding

    currentBidder = startingTeam;


    displayOpeningBid();
}


// ===============================
// DISPLAY OPENING BID
// ===============================

function displayOpeningBid() {

    const startingTeamObject =
        startingTeam === 1 ? team1 : team2;

    // ===============================
    // ZERO-BUDGET RULE
    // ===============================

    // If BOTH teams have $0,
    // the scheduled starting team gets the player for free.

    if (team1.budget === 0 && team2.budget === 0) {

        currentBid = 0;
        currentBidder = startingTeam;

        awardPlayer(startingTeam);

        return;
    }


// If the scheduled starting team has $0
// but the other team still has money,
// give control to the team with money.

if (startingTeamObject.budget === 0) {

    const teamWithMoneyNumber =
        startingTeam === 1 ? 2 : 1;

    displayZeroBudgetChoice(teamWithMoneyNumber);

    return;
}



    document.getElementById("auction-content").innerHTML = `

        ${createTeamTrackers()}

        <div class="current-player">

            <h2>${currentPlayer.name}</h2>

        </div>

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


    // Must be positive

    if (openingBid <= 0) {

        alert("Please enter a valid bid.");

        return;
    }


    // Must be an interval of 50

    if (openingBid % bidIncrement !== 0) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    // Must be affordable

    if (openingBid > startingTeamObject.budget) {

        alert("You cannot bid more than your remaining budget.");

        return;
    }


    // Check roster space

    if (
        startingTeamObject.players.length >= maxPlayers
    ) {

        alert("Your team has reached the maximum roster size.");

        return;
    }


    // Set current bid

    currentBid = openingBid;

    currentBidder = startingTeam;


    // Other team gets next turn

    const otherTeam =
        startingTeam === 1 ? 2 : 1;


    displayBiddingTurn(otherTeam);
}


// ===============================
// DISPLAY BIDDING TURN
// ===============================

function displayBiddingTurn(teamNumber) {

    const team =
        teamNumber === 1 ? team1 : team2;





    document.getElementById("auction-content").innerHTML = `

        ${createTeamTrackers()}

        <div class="current-player">

            <h2>${currentPlayer.name}</h2>

            <h3>
                Current Bid:
                $${currentBid.toLocaleString()}
            </h3>

            <p>
                Current holder:
                <strong>
                    ${currentBidder === 1
                        ? team1.name
                        : team2.name}
                </strong>
            </p>

        </div>

        <div class="auction-action">

            <p>
                <strong>${team.name}</strong>'s turn
            </p>

            <p>
                Enter any bid higher than
                $${currentBid.toLocaleString()}
            </p>

            <input
                type="number"
                id="nextBid"
                placeholder="Enter your bid"
            >

            <button id="placeBidButton">
                PLACE BID
            </button>

            <button id="passButton">
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


    // Must be higher than current bid

    if (newBid <= currentBid) {

        alert(
            `Your bid must be higher than $${currentBid.toLocaleString()}.`
        );

        return;
    }


    // Must be an interval

    if (newBid % bidIncrement !== 0) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    // Must be affordable

    if (newBid > team.budget) {

        alert("You cannot afford this bid.");

        return;
    }


    // Check roster size

    if (team.players.length >= maxPlayers) {

        alert("Your team has reached the maximum roster size.");

        return;
    }


    // Update bid

    currentBid = newBid;

    currentBidder = teamNumber;


    // Switch teams

    const nextTeam =
        teamNumber === 1 ? 2 : 1;


    displayBiddingTurn(nextTeam);
}


// ===============================
// PASS
// ===============================

function passBid(teamNumber) {

    const winningTeam =
        currentBidder;


    awardPlayer(winningTeam);
}


// ===============================
// AWARD PLAYER
// ===============================

function awardPlayer(teamNumber) {

    const winningTeam =
        teamNumber === 1 ? team1 : team2;


    // Remove money

    winningTeam.budget -= currentBid;


    // Add player

    winningTeam.players.push(currentPlayer);


    // Switch starting team

    startingTeam =
        startingTeam === 1 ? 2 : 1;


    // Display result

    document.getElementById("auction-content").innerHTML = `

        ${createTeamTrackers()}

        <div class="auction-result">

            <h2>${currentPlayer.name}</h2>

            <h3>${winningTeam.name} wins!</h3>

            <p>
                Winning bid:
                <strong>
                    $${currentBid.toLocaleString()}
                </strong>
            </p>

        </div>

        <button id="nextPlayerButton">
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
                        ${team1.players.length}
                        / ${maxPlayers}
                    </strong>
                </p>

                <div class="player-list">

                    ${
                        team1.players.length === 0
                            ? "<span>No players yet</span>"
                            : team1.players
                                .map(player =>
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
                        ${team2.players.length}
                        / ${maxPlayers}
                    </strong>
                </p>

                <div class="player-list">

                    ${
                        team2.players.length === 0
                            ? "<span>No players yet</span>"
                            : team2.players
                                .map(player =>
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

        <div class="current-player">

            <h2>${currentPlayer.name}</h2>

            <p>
                ${zeroBudgetTeam.name} has no remaining budget.
            </p>

        </div>


        <div class="auction-action">

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
            >

            <button id="buyPlayerButton">
                BUY PLAYER
            </button>

            <button id="controlPassButton">
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


    // Bid must be positive

    if (bid <= 0) {

        alert("Please enter a valid bid.");

        return;
    }


    // Bid must follow the chosen interval

    if (bid % bidIncrement !== 0) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    // Cannot spend more than remaining budget

    if (bid > team.budget) {

        alert("You cannot afford this bid.");

        return;
    }


    // Make sure roster isn't full

    if (team.players.length >= maxPlayers) {

        alert("Your team has reached the maximum roster size.");

        return;
    }


    currentBid = bid;

    currentBidder = teamNumber;


    // The other team has $0,
    // so they cannot counter.

    awardPlayer(teamNumber);
}
// ===============================
// PASS WITH CONTROL
// ===============================

function passWithControl(teamNumber) {

    // The team with $0 receives
    // the player for free.

    const zeroBudgetTeamNumber =
        teamNumber === 1 ? 2 : 1;


    currentBid = 0;

    currentBidder = zeroBudgetTeamNumber;


    awardPlayer(zeroBudgetTeamNumber);
}
