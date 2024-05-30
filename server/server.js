// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set the port
const port = process.env.PORT || 8080;

// Define the path to the leaderboard data file
const leaderboardPath = path.join(__dirname, 'data', 'leaderboard.json');

// Initialize leaderboard data
let leaderboardData = [];
try {
  const data = fs.readFileSync(leaderboardPath);
  leaderboardData = JSON.parse(data);
  // Sort leaderboard data by score and time taken
  leaderboardData.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
} catch (error) {
  console.error('Initialization failed.', error);
}

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Socket.io event handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Event to send leaderboard data to client
    socket.on('get-leaderboard', () => {
        socket.emit('leaderboard-data', leaderboardData);
    });

    // Event to submit quiz data from client
    socket.on('submit-quiz-data', (data) => {
        const { name, score, timeTaken } = data;
        const newEntry = { name, score, timeTaken };
        
        // Check if the name already exists in the leaderboard
        const existingEntryIndex = leaderboardData.findIndex(entry => entry.name === name);
        if (existingEntryIndex !== -1) {
            // Update the existing entry
            leaderboardData[existingEntryIndex].score = score;
            leaderboardData[existingEntryIndex].timeTaken = timeTaken;
        } else {
            // Add new entry to leaderboard data
            leaderboardData.push(newEntry);
        }
        
        // Sort leaderboard data after adding/updating the entry
        leaderboardData.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
        // Assign ranks to entries based on their position
        leaderboardData.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        // Write updated leaderboard data to file
        fs.writeFileSync(leaderboardPath, JSON.stringify(leaderboardData, null, 2));
        // Emit updated leaderboard data to all clients
        io.emit('leaderboard-data', leaderboardData);
    });

    // Event for client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Start server
server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/`);
});
