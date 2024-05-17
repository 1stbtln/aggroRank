const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const basePort = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

const pubgAuthToken = process.env.PUBG_AUTH_TOKEN;

const playerNames = {
    'account.5a2d79249212408792a4266e820ed5d4': '1stbtln',
    'account.928ae95a140f4158aa1852d48d487e2c': 'Forest_Blood',
    'account.f81c61ced0f7486cb3b53a17b64eef5a': 'cLkbAiT',
    'account.58317caa46be4138b3f285cdc1ac4519': 'jamryani',
    'account.2fe8afb68a3c4d4dae9e1d05f379e933': 'TwentyOneHill',
    'account.861b679e209146dc998055250e5f6644': 'Gibstone',
    'account.f100704743654bb2bd70be191581439f': 'BajaMike',
    'account.4ff9aee51e49455cb4a40a13b041cc0d': 'eatsomecake',
    'account.bd78e31554ae4428bc2318439209930a': 'Impereal',
    'account.278abcc13e8d4cd79bacf38ada270e03': 'EndedRz',
    'account.873d1d87510449d3a7d8bd5ddc6cf879': 'MajaBike',
    'account.a471d12cddaa4c809346e698d9c64ca5': 'moonfrags',
    'account.35772c0afc8f4bf6b38c148a66b5c950': 'Shinjirok',
    'account.388c843c728847cdb3036374adef7400': 'Oracle',
    'account.1f781d0ea0284c0fa529771a3ca37569': '3rdbtln ',
};

async function fetchPlayersData(playerIds) {
    const idsString = playerIds.join(',');
    try {
        const response = await axios.get(`https://api.pubg.com/shards/steam/seasons/division.bro.official.pc-2018-29/gameMode/squad-fpp/players?filter[playerIds]=${idsString}`, {
            headers: {
                'Authorization': `Bearer ${pubgAuthToken}`,
                'Accept': 'application/vnd.api+json'
            }
        });

        return response.data.data.map(player => {
            const playerId = player.relationships.player.data.id; 
            const stats = player.attributes.gameModeStats['squad-fpp'];
            const roundsPlayed = stats.roundsPlayed;
            const damagePerRound = stats.damageDealt / roundsPlayed;
            const killsPerRound = stats.kills / roundsPlayed;
            const winsPerRound = stats.wins / roundsPlayed;

            const finalScore = ((damagePerRound / 500) * 4) + ((killsPerRound / 5) * 2) + ((winsPerRound / 0.25) * 1);

            return {
                name: playerNames[playerId], 
                accountId: playerId,
                roundsPlayed: roundsPlayed,
                overallDamage: stats.damageDealt,
                totalKills: stats.kills,
                dBNOs: stats.dBNOs,
                wins: stats.wins,
                finalScore: finalScore
            };
        });
    } catch (error) {
        console.error('Error fetching PUBG data:', error.message);
        return [];
    }
}


app.get('/getPlayerStats', async (req, res) => {
    if (!req.query.playerName) {
        return res.status(400).send('Player name is required');
    }

    const playerName = req.query.playerName.toLowerCase();
    const playerId = Object.keys(playerNames).find(key => playerNames[key].toLowerCase() === playerName);

    if (!playerId) {
        return res.status(404).send('Player not found');
    }

    const url = `https://api.pubg.com/shards/steam/players/${playerId}/seasons/division.bro.official.pc-2018-29?filter[gamepad]=false`;
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${pubgAuthToken}`,
                'Accept': 'application/vnd.api+json'
            }
        });

        const stats = response.data.data.attributes.gameModeStats['squad-fpp'];
        const roundsPlayed = stats.roundsPlayed;
        const damagePerRound = stats.damageDealt / roundsPlayed;
        const killsPerRound = stats.kills / roundsPlayed;
        const winsPerRound = stats.wins / roundsPlayed;

        const finalScore = ((damagePerRound / 500) * 4) + ((killsPerRound / 5) * 2) + ((winsPerRound / 0.25) * 1);

        res.json({
            name: playerName,
            rank: undefined,  
            totalKills: stats.kills,
            overallDamage: stats.damageDealt,
            finalScore: finalScore
        });
    } catch (error) {
        console.error('Error fetching PUBG data:', error.message);
        res.status(500).send('Error fetching data');
    }
});


app.get('/', (req, res) => {
    res.redirect('/getPubgData');
});

app.get('/getPubgData', async (req, res) => {
    const playerIds = Object.keys(playerNames);
    const chunkSize = 10;
    let playersData = [];

    for (let i = 0; i < playerIds.length; i += 30) {
        const batchPromises = [];
        for (let j = i; j < i + 30 && j < playerIds.length; j += chunkSize) {
            const chunk = playerIds.slice(j, j + chunkSize);
            batchPromises.push(fetchPlayersData(chunk));
        }
        const batchResults = await Promise.all(batchPromises);
        playersData = playersData.concat(batchResults.flat());
    }

    playersData.sort((a, b) => b.finalScore - a.finalScore);

    res.render('index', {
        players: playersData,
        success: playersData.length > 0
    });
});


function startServer(port) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying port ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Failed to start server:', err);
        }
    });
}

startServer(basePort);