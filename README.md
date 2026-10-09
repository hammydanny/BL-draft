# BLUE LOCK DRAFT

**Blue Lock Draft** is an unofficial, fan-made Blue Lock football team-building simulator.

Build two custom squads, select your player pool, compete in a local auction, manage your budget, and then arrange your completed roster into tactical formations.

The project is designed as a **local-only browser experience** with no accounts, server, database, or online multiplayer.

## Features

### ⚽ Player Draft & Auction

Choose from a configurable pool of Blue Lock characters and build two teams through an auction system.

Players can compete for each signing by placing valid bids according to the configured:

* Starting budget
* Bid interval
* Maximum roster size
* Player pool

The auction supports alternating turns, passing, automatic assignments when a team is full, zero-budget situations, sold-player animations, and auction history.

### 🎲 Random Draft

Don't want to run a full auction?

Use **Random Draft** to immediately divide the selected player pool between the two teams.

### 📊 Player Ratings & Positions

Every player has a profile containing:

* Overall rating
* Offence
* Shooting
* Speed
* Defence
* Passing
* Dribbling
* Goalkeeping
* Primary position
* Secondary positions

The formation system also calculates **position-specific effective ratings**, so a player's usefulness changes depending on where they are deployed.

### 🧠 Chemistry System

Blue Lock Draft includes a custom fan-made chemistry model based on relationships, team history, tactical combinations, and demonstrated chemical reactions.

Chemistry includes:

* Named player-to-player combinations
* Strong and weak relationships
* Shared-team chemistry
* Special chemistry reactions
* Formation-specific chemistry links

Chemistry values are **gameplay statistics created for this fan project** and are not official Blue Lock statistics.

### 🏟️ Formation Builder

After the draft, each team can be arranged using multiple formations.

Players can be moved between the pitch and bench, formations can be changed, captains can be selected, and the game can automatically generate a best XI based on position suitability, player ratings, and chemistry.

### 🏆 Squad Comparison

Once the draft is complete, the results screen compares both teams using information such as:

* Squad OVR
* Capital remaining
* Capital spent
* Strongest chemistry
* MVP signing
* Best value signing
* Most expensive signing
* Full roster
* Auction history

### 💾 Local Save System

Active games are automatically stored in the browser using `localStorage`.

This allows unfinished auctions to be resumed later on the same browser and device.

No account or external server is required.

## How It Works

The game follows this general flow:

### 1. Set Up

Configure both teams, their colors, the starting budget, bid interval, roster size, and player pool.

### 2. Draft

Either run a traditional auction or use the random draft mode.

### 3. Build

Once both squads are complete, arrange the players into formations and select a captain.

### 4. Analyze

Compare the two completed teams and review player value, squad strength, chemistry, and auction history.

The project uses classic browser scripts rather than a framework or module bundler. The different JavaScript files divide the application into player data, game state, auction rules, chemistry, formations, persistence, audio, results, and UI responsibilities.

## Running Locally

Clone the repository and serve the project using a local web server.

For example:

```bash
git clone https://github.com/hammydanny/BL-draft.git
cd BL-draft
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Using a local HTTP server is recommended instead of opening `index.html` directly with `file://`.

## Important Notes

### Unofficial Fan Project

Blue Lock Draft is an unofficial, non-commercial fan project.

It is not affiliated with, endorsed by, or sponsored by the creators, publishers, licensors, or rights holders of **Blue Lock**.

Blue Lock and related names, characters, artwork, and imagery belong to their respective rights holders.

### Chemistry Ratings

The chemistry system is a **fan-made gameplay model**. Blue Lock does not provide an official universal 0–100 chemistry rating system corresponding to the values used by this website.

Chemistry scores should therefore be treated as part of the game's rules rather than official canon statistics.

## Contributing

Contributions, improvements, bug fixes, UI ideas, balancing suggestions, and additional Blue Lock data are welcome.

## Credits

**Blue Lock Draft**

Originally developed by [hammydanny](https://github.com/hammydanny) and [syaafibwn (Syaafi)](https://github.com/syaafibwn)

## License / Rights

This repository is a fan-made project and does not claim ownership of the Blue Lock intellectual property, characters, names, or related imagery.

The rights to those materials remain with their respective copyright and trademark holders.
