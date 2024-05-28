const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 8080;

const quizDataPath = path.join(__dirname, 'data', 'quiz-data.json');
const leaderboardPath = path.join(__dirname, 'data', 'leaderboard.json');

let quizData = [];
try {
  const data = fs.readFileSync(quizDataPath);
  quizData = JSON.parse(data);
} catch (error) {
  console.error('初始化答题数据失败，将使用空数组开始', error);
}

// 读取初始排行榜数据
let leaderboardData = [];
try {
  const data = fs.readFileSync(leaderboardPath);
  leaderboardData = JSON.parse(data);
  leaderboardData.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
} catch (error) {
  console.error('初始化排行榜数据失败，将使用空数组开始', error);
}

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('get-leaderboard', () => {
        socket.emit('leaderboard-data', leaderboardData);
    });

    socket.on('submit-quiz-data', (data) => {
        const { name, score, timeTaken } = data;
        const newEntry = { name, score, timeTaken };
        
        leaderboardData.push(newEntry);
        leaderboardData.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
        leaderboardData.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        fs.writeFileSync(leaderboardPath, JSON.stringify(leaderboardData, null, 2));
        io.emit('leaderboard-data', leaderboardData);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
