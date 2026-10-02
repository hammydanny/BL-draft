const setupScreen = document.getElementById("setup-screen");
const auctionScreen = document.getElementById("auction-screen");
const startGameButton = document.getElementById("startGame");

startGameButton.addEventListener("click", startGame);


function startGame() {

    const team1Name = document.getElementById("team1Name").value;
    const team2Name = document.getElementById("team2Name").value;

    const budget = Number(
        document.getElementById("budget").value
    );

    const bidIncrement = Number(
        document.getElementById("bidIncrement").value
    );

    const maxPlayers = Number(
        document.getElementById("maxPlayers").value
    );


    console.log("Team 1:", team1Name);
    console.log("Team 2:", team2Name);
    console.log("Budget:", budget);
    console.log("Bid increment:", bidIncrement);
    console.log("Maximum players:", maxPlayers);


    setupScreen.classList.add("hidden");
    auctionScreen.classList.remove("hidden");


    document.getElementById("auction-content").innerHTML = `
        <h2>${team1Name} vs ${team2Name}</h2>

        <p>The auction is about to begin...</p>
    `;
}
