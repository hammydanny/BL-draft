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

    // Get information from setup screen

    const team1Name =
        document.getElementById("team1Name").value;

    const team2Name =
        document.getElementById("team2Name").value;

    const budget =
        Number(document.getElementById("budget").value);

    bidIncrement =
        Number(document.getElementById("bidIncrement").value);

    maxPlayers =
        Number(document.getElementById("maxPlayers").value);


    // Create the two teams

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


    // Copy the player list

    remainingPlayers = [...players];


    // Randomly decide who starts

    if (Math.random() < 0.5) {

        startingTeam = 1;

    } else {

        startingTeam = 2;

    }


    // Hide setup screen

    setupScreen.classList.add("hidden");


    // Show auction screen

    auctionScreen.classList.remove("hidden");


    // Start the first auction

    startNextAuction();
}


// ===============================
// START NEXT AUCTION
// ===============================

function startNextAuction() {

    // Check if there are players left

    if (remainingPlayers.length === 0) {

        document.getElementById("auction-content").innerHTML = `
            <h2>AUCTION COMPLETE</h2>
            <p>All available players have been drafted.</p>
        `;

        return;
    }


    // Randomly select a player

    const randomIndex =
        Math.floor(Math.random() * remainingPlayers.length);

    currentPlayer =
        remainingPlayers[randomIndex];


    // Remove player from available pool

    remainingPlayers.splice(randomIndex, 1);


    // Reset auction variables

    currentBid = 0;

    currentBidder = null;


    // The team that starts gets to choose
    // the opening bid

    currentBidder = startingTeam;


    // Display auction

    displayOpeningBid();
}


// ===============================
// DISPLAY OPENING BID
// ===============================

function displayOpeningBid() {

    const startingTeamName =
        startingTeam === 1
            ? team1.name
            : team2.name;


    document.getElementById("auction-content").innerHTML = `

        <h2>${currentPlayer.name}</h2>

        <p>${startingTeamName} starts the bidding.</p>

        <p>Choose your opening bid.</p>

        <input
            type="number"
            id="openingBid"
            placeholder="Enter opening bid"
        >

        <button id="placeOpeningBid">
            PLACE OPENING BID
        </button>

    `;


    document
        .getElementById("placeOpeningBid")
        .addEventListener("click", placeOpeningBid);
}


// ===============================
// PLACE OPENING BID
// ===============================

function placeOpeningBid() {

    const openingBid =
        Number(document.getElementById("openingBid").value);


    const startingTeamObject =
        startingTeam === 1
            ? team1
            : team2;


    // Check that bid is positive

    if (openingBid <= 0) {

        alert("Please enter a valid bid.");

        return;
    }


    // Check bid interval

    if (openingBid % bidIncrement !== 0) {

        alert(
            `Your bid must be in intervals of $${bidIncrement}.`
        );

        return;
    }


    // Check budget

    if (openingBid > startingTeamObject.budget) {

        alert("You cannot bid more than your remaining budget.");

        return;
    }


    // Check roster size

    if (
        startingTeamObject.players.length >=
        maxPlayers
    ) {

        alert("Your team has reached the maximum roster size.");

        return;
    }


    // Set current bid

    currentBid = openingBid;


    // Starting team currently holds the bid

    currentBidder = startingTeam;


    // Switch to the other team

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


    const nextBid =
        currentBid + bidIncrement;


    document.getElementById("auction-content").innerHTML = `

        <h2>${currentPlayer.name}</h2>

        <h3>Current Bid: $${currentBid.toLocaleString()}</h3>

        <p>${team.name}'s turn</p>

        <button id="bidButton">
            BID $${nextBid.toLocaleString()}
        </button>

        <button id="passButton">
            PASS
        </button>

    `;


    document
        .getElementById("bidButton")
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
        currentBid + bidIncrement;


    // Check budget

    if (newBid > team.budget) {

        alert("You cannot afford this bid.");

        return;
    }


    // Update current bid

    currentBid = newBid;


    // This team now holds the highest bid

    currentBidder = teamNumber;


    // Switch turns

    const nextTeam =
        teamNumber === 1 ? 2 : 1;


    displayBiddingTurn(nextTeam);
}


// ===============================
// PASS
// ===============================

function passBid(teamNumber) {

    // The other team wins

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


    // Switch starting team for next auction

    startingTeam =
        startingTeam === 1 ? 2 : 1;


    // Show result

    document.getElementById("auction-content").innerHTML = `

        <h2>${currentPlayer.name}</h2>

        <h3>${winningTeam.name} wins!</h3>

        <p>
            Winning bid:
            $${currentBid.toLocaleString()}
        </p>

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
