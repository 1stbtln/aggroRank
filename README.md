# aggroRank

# PUBG Player Stats Server

This Node.js application serves as an Express.js server to retrieve and display player statistics from PUBG (PlayerUnknown's Battlegrounds) via the PUBG official API. It also provides an endpoint for external access to these statistics, ideal for integration with other applications such as a Discord bot.

## Features

- Retrieves player statistics from the PUBG API.
- Serves data through a REST API endpoint.
- Renders a page with statistics of multiple players using EJS templating.
- Handles requests for individual player stats dynamically.

## Prerequisites

Before you can run this server, you need to have the following:

- Node.js installed on your machine.
- A PUBG API token (you can obtain one from the [PUBG Developer Portal](https://developer.pubg.com/)).

## Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
Install Dependencies

bash
Copy code
npm install
Set Environment Variables
Create a .env file in the root directory and add your PUBG API token:

makefile
Copy code
PUBG_AUTH_TOKEN=your_pubg_api_token_here
Start the Server

bash
Copy code
npm start
Usage
Once the server is running, you can access the following endpoints:

GET /getPlayerStats?playerName=<name>: Fetches and returns stats for the specified player. Replace <name> with the actual player name registered in PUBG.
GET /getPubgData: Displays an EJS page with stats overview of multiple players.
Example Request
bash
Copy code
curl http://localhost:3000/getPlayerStats?playerName=1stbtln
This will return JSON data containing the statistics for the player "1stbtln", if found.

Contributing
Contributions are welcome! Please feel free to submit a pull request or create an issue if you have any ideas or find any bugs.

License
This project is open-sourced under the MIT License. See the LICENSE file for more details.

javascript
Copy code

Replace `<repository-url>` and `<repository-directory>` with your actual GitHub repository URL and directory name. This `README.md` provides a clear overview of what the application does, how to set it up, and how to use it, which can be very useful for new users or contributors.
