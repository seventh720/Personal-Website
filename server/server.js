const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

const quizDataPath = path.join(__dirname, 'data', 'quiz-data.json');
const leaderboardPath = path.join(__dirname,'data', 'leaderboard.json');

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

// POST路由来提交测验数据
app.post('/submit-quiz-data', (req, res) => {
  const { rank, name, score, timeTaken } = req.body;
  const newEntry = {rank, name, score, timeTaken };

  // 添加新的成绩到答题数据
  quizData.push(newEntry);

  // 写入更新后的答题数据到 JSON 文件
  fs.writeFileSync(quizDataPath, JSON.stringify(quizData, null, 2));

  // 添加新的成绩到排行榜数据
  leaderboardData.push(newEntry);

  // 根据分数和时间排序
  leaderboardData.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

  leaderboardData.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // 写入更新后的排行榜数据到 JSON 文件
  fs.writeFileSync(leaderboardPath, JSON.stringify(leaderboardData, null, 2));

  res.json({ message: 'Results submitted successfully', leaderboard: leaderboardData });
});

  app.get('/get-leaderboard', (req, res) => {
    res.json(leaderboardData);
  });

app.listen(port, () => {
  console.log(`Server is listening on port http://localhost:${port}`);
});