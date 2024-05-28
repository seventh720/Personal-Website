document.addEventListener('DOMContentLoaded', function() {
    fetch('/get-leaderboard')
    .then(response => response.json())
    .then(data => {
      renderLeaderboard(data);
    })
    .catch(error => {
      console.error('Error fetching leaderboard data:', error);
    });

    var links = document.querySelectorAll('.nav-bar a');
    links.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            var targetPage = link.getAttribute('href');
            document.querySelector('main').style.opacity = '0';
            setTimeout(function() {
                window.location.href = targetPage;
            }, 500);
        });
    });
    // Initial fade-in effect
    document.querySelector('main').style.opacity = '1';
});

document.getElementById('mode-toggle').addEventListener('click', function() {
    var body = document.body;
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
});

const quizData = [
    {
        question: '2 + 3 = ?',
        options: ['4', '5', '6', '7'],
        answer: 1
    },
    {
        question: 'This question has only one word, and followed by "please". What is it?',
        options: ['Thank you', 'Hello', 'Goodbye', 'Help'],
        answer: 3
    },
    {
        question: 'What is the capital of France?',
        options: ['Berlin', 'London', 'Paris', 'Rome'],
        answer: 2
    },
    {
        question: 'What is the largest planet in our solar system?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        answer: 2
    },
    {
        question: 'What is the chemical symbol for carbon dioxide?',
        options: ['H2O', 'CO2', 'O2', 'NH3'],
        answer: 1
    },
    {
        question: 'Which of the following is not a social media platform?',
        options: ['Facebook', 'Instagram', 'Wechat', 'Spotify'],
        answer: 3
    },
    {
        question: 'What is the smallest country in the world?',
        options: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'],
        answer: 0
    },
    {
        question: 'What does the acronym "NASA" stand for?',
        options: ['National Aeronautics and Space Administration', 'New Aerospace Science Association', 'North American Space Agency', 'National Air and Space Agency'],
        answer: 0
    },
    {
        question: 'Who wrote the novel "Harry Potter"?',
        options: ['George Orwell', 'Aldous Huxley', 'J.k. Rowling', 'F. Scott Fitzgerald'],
        answer: 2
    },
    {
        question: 'Brain Teaser: What has keys but can not open locks?',
        options: ['A book', 'A door', 'A piano', 'A car'],
        answer: 2
    },
];

let currentQuestionIndex = 0;
let score = 0;
let timer;
let startTime; 
let isProcessingOption = false;
    
const timeLimit = 15;
const startQuizBtn = document.getElementById('start-quiz');
const questionEl = document.getElementById('question');
const optionsContainerEl = document.getElementById('options-container');
const timerEl = document.getElementById('timer');
const resultEl = document.getElementById('result');
const questionIndicatorEl = document.getElementById('question-indicator');
const nameInput = document.getElementById('name-input');
const leaderboardContainerEl = document.getElementById('leaderboard-container');
const endQuizBtn = document.getElementById('end-quiz');

function init() {
    displayQuestion();
    startTimer();
    startTime = new Date().getTime();
}
    
function displayQuestion() {
    clearInterval(timer);
    const currentQuestion = quizData[currentQuestionIndex];
    questionEl.textContent = currentQuestion.question;
    questionIndicatorEl.textContent = `Question ${currentQuestionIndex + 1}/${quizData.length}`;
    optionsContainerEl.innerHTML = '';
    currentQuestion.options.forEach((option, index) => {
    const optionEl = document.createElement('div');
    optionEl.classList.add('option');
    optionEl.textContent = option;
    optionEl.dataset.value = index;
    optionEl.addEventListener('click', selectOption);
    optionsContainerEl.appendChild(optionEl);
    });
}

function selectOption(event) {
    if (isProcessingOption) return;
    isProcessingOption = true;

    const selectedOption = event.target;
    const selectedValue = selectedOption.dataset.value;
    const currentQuestion = quizData[currentQuestionIndex];

    clearInterval(timer);
    if (selectedValue == currentQuestion.answer) {
        score++;
        selectedOption.classList.add('correct');
        timerEl.textContent = 'Correct!';
    } else {
        selectedOption.classList.add('incorrect');
        timerEl.textContent = 'Incorrect!';
        const correctOption = optionsContainerEl.querySelectorAll('.option')[currentQuestion.answer];
        correctOption.classList.add('correct');
    }
    setTimeout(nextQuestion, 1000);
}


function nextQuestion() {
    isProcessingOption = false;
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
            resetOptions();
            displayQuestion();
            startTimer();
    } else {
        endQuiz();
    }
}

function resetOptions() {
    const options = optionsContainerEl.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('correct', 'incorrect');
    });
}

function startTimer() {
    let timeLeft = timeLimit;
    timerEl.textContent = `Time: ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `Time: ${timeLeft}s`;
        if (timeLeft === 0) {
            clearInterval(timer);
            timerEl.textContent = 'Times up!';
            const currentQuestion = quizData[currentQuestionIndex];
            const correctOption = optionsContainerEl.querySelectorAll('.option')[currentQuestion.answer];
            correctOption.classList.add('correct');
            setTimeout(nextQuestion, 1000)
        }
    }, 1000);
}

function renderLeaderboard(leaderboardData) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = ''; // 清空现有排行榜数据
  
    leaderboardData.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.rank}</td>
        <td>${entry.name}</td>
        <td>${entry.score}</td>
        <td>${entry.timeTaken}</td>
      `;
      leaderboardBody.appendChild(row);
    });
  }
  
  async function submitResults() {
    try {
      const response = await fetch('/submit-quiz-data', {
        // ...请求配置...
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Results submitted successfully');
      renderLeaderboard(data.leaderboard); 
    } catch (error) {
      console.error('Error submitting results:', error);
    }
  }

  function endQuiz() {
    questionEl.textContent = '';
    optionsContainerEl.innerHTML = '';
    timerEl.textContent = '';
    questionIndicatorEl.classList.add('hide');
    endQuizBtn.classList.remove('hide');
    const endTime = new Date().getTime();
    const totalTime = (endTime - startTime) / 1000;
    const userName = nameInput.value || 'Anonymous';
    const userData = {
      rank: 0,
      name: userName,
      score,
      timeTaken: totalTime
    };
  
    fetch('/submit-quiz-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (response.ok) {
        resultEl.textContent = `Quiz accomplished! ${userName}, your final score is: ${score}. Total time: ${totalTime} seconds.`;
        return response.json();
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .then(data => {
      renderLeaderboard(data.leaderboard);
      leaderboardContainerEl.classList.remove('hide'); 
    })
    
    .catch(error => {
      console.error('Error submitting quiz data:', error);
    });
  }
  
startQuizBtn.addEventListener('click', function() {
    const userName = nameInput.value.trim();
    if (userName === '') {
        alert('Please enter your name to start the quiz.');
        return;
      }
      else{ fetch('/get-leaderboard')
        .then(response => response.json())
        .then(data => {
          renderLeaderboard(data);
    init();
    startQuizBtn.classList.add('hide');
    nameInput.classList.add('hide');
    leaderboardContainerEl.classList.add('hide');})
        }
    }
  );

endQuizBtn.addEventListener('click',function(){
    endQuizBtn.classList.add('hide');
    resultEl.classList.add('hide');
    startQuizBtn.classList.remove('hide');
    nameInput.classList.remove('hide');
})
