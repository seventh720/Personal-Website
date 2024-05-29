document.addEventListener('DOMContentLoaded', function() {
    const socket = io(); // Initialize socket.io client

    // Triggered when connected to the server
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('get-leaderboard'); // Request leaderboard data
    });

    // Receive leaderboard data from the server and render it
    socket.on('leaderboard-data', (data) => {
        renderLeaderboard(data);
    });

    // Add click event to navigation links to switch pages with a fade-out effect
    const links = document.querySelectorAll('.nav-bar a');
    links.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetPage = link.getAttribute('href');
            document.querySelector('main').style.opacity = '0';
            setTimeout(function() {
                window.location.href = targetPage;
            }, 500);
        });
    });

    // Initial fade-in effect
    document.querySelector('main').style.opacity = '1';

    // Add click event to the dark mode toggle button
    document.getElementById('mode-toggle').addEventListener('click', function() {
        const body = document.body;
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
    });

    // Quiz data
    const quizData = [
        {
            question: 'Who is the course coordinator of Web Application Development in CS programme?',
            options: ['Jari Korhonen', 'Xiaonan Liu', 'Yuan Wen', 'Aladdin Ayesh'],
            answer: 0
        },
        {
            question: 'This question has only one word, and followed by "please". What is it?',
            options: ['Thank you', 'Hello', 'Goodbye', 'Help'],
            answer: 3
        },
        {
            question: 'Who was the first person to step on the moon?',
            options: ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'John Glenn'],
            answer: 0
        },
        {
            question: 'How many continents are there in the world?',
            options: ['5', '6', '7', '8'],
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
            question: 'Who painted the Mona Lisa?',
            options: ['Michelangelo', 'Leonardo da Vinci', 'Vincent van Gogh', 'Pablo Picasso'],
            answer: 1
        },
        {
            question: 'Who wrote the novel "Harry Potter"?',
            options: ['George Orwell', 'Aldous Huxley', 'J.K. Rowling', 'F. Scott Fitzgerald'],
            answer: 2
        },
        {
            question: 'Brain Teaser: What has keys but can not open locks?',
            options: ['A book', 'A door', 'A piano', 'A car'],
            answer: 2
        },
    ];

    let currentQuestionIndex = 0; // Index of the current question
    let score = 0; // Player's score
    let timer; // Timer for each question
    let startTime; // Start time of the quiz
    let isProcessingOption = false; // Flag to prevent multiple option selections
    
    const timeLimit = 15; // Time limit for each question in seconds
    const startQuizBtn = document.getElementById('start-quiz'); // Start quiz button
    const questionEl = document.getElementById('question'); // Element to display the current question
    const optionsContainerEl = document.getElementById('options-container'); // Container for the question options
    const timerEl = document.getElementById('timer'); // Element to display the timer
    const resultEl = document.getElementById('result'); // Element to display the quiz result
    const questionIndicatorEl = document.getElementById('question-indicator'); // Element to display the current question index
    const nameInput = document.getElementById('name-input'); // Input field for the player's name
    const leaderboardContainerEl = document.getElementById('leaderboard-container'); // Container to display the leaderboard
    const endQuizBtn = document.getElementById('end-quiz'); // End quiz button

    // Initialize the quiz
    function init() {
        displayQuestion();
        startTimer();
        startTime = new Date().getTime(); // Record the quiz start time
    }

    // Display the current question
    function displayQuestion() {
        clearInterval(timer); // Clear any existing timer
        const currentQuestion = quizData[currentQuestionIndex];
        questionEl.textContent = currentQuestion.question;
        questionIndicatorEl.textContent = `Question ${currentQuestionIndex + 1}/${quizData.length}`;
        optionsContainerEl.innerHTML = ''; // Clear previous options
        currentQuestion.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.classList.add('option');
            optionEl.textContent = option;
            optionEl.dataset.value = index;
            optionEl.addEventListener('click', selectOption);
            optionsContainerEl.appendChild(optionEl);
        });
    }

    // Handle option selection
    function selectOption(event) {
        if (isProcessingOption) return;
        isProcessingOption = true;

        const selectedOption = event.target;
        const selectedValue = selectedOption.dataset.value;
        const currentQuestion = quizData[currentQuestionIndex];

        clearInterval(timer); // Stop the timer
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
        setTimeout(nextQuestion, 1000); // Proceed to the next question after a delay
    }

    // Move to the next question
    function nextQuestion() {
        isProcessingOption = false;
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            resetOptions();
            displayQuestion();
            startTimer();
        } else {
            endQuiz(); // End the quiz if all questions are answered
        }
    }

    // Reset option styles
    function resetOptions() {
        const options = optionsContainerEl.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('correct', 'incorrect');
        });
    }

    // Start the timer for the current question
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
                setTimeout(nextQuestion, 1000); // Proceed to the next question after a delay
            }
        }, 1000);
    }

    // Render the leaderboard with provided data
    function renderLeaderboard(leaderboardData) {
        const leaderboardBody = document.getElementById('leaderboard-body');
        leaderboardBody.innerHTML = ''; // Clear existing leaderboard data

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

    // End the quiz and display the result
    function endQuiz() {
        questionEl.textContent = '';
        optionsContainerEl.innerHTML = '';
        timerEl.textContent = '';
        questionIndicatorEl.classList.add('hide');
        endQuizBtn.classList.remove('hide');
        const endTime = new Date().getTime();
        const totalTime = (endTime - startTime) / 1000; // Calculate total time taken
        const userName = nameInput.value || 'Anonymous';
        const userData = {
            rank: 0,
            name: userName,
            score,
            timeTaken: totalTime
        };

        // Send quiz data to the server
        socket.emit('submit-quiz-data', userData);

        // Receive and render updated leaderboard data
        socket.on('leaderboard-data', (data) => {
            renderLeaderboard(data);
            resultEl.textContent = `Quiz completed! Your final score is: ${score}. Total time: ${totalTime} seconds.`;
            leaderboardContainerEl.classList.remove('hide');
        });
    }

    // Start the quiz when the start button is clicked
    startQuizBtn.addEventListener('click', function() {
        const userName = nameInput.value.trim();
        if (userName === '') {
            alert('Please enter your name to start the quiz.');
            return;
        } else {
            init();
            startQuizBtn.classList.add('hide');
            nameInput.classList.add('hide');
            leaderboardContainerEl.classList.add('hide');
        }
    });

    // Reload the page when the end quiz button is clicked
    endQuizBtn.addEventListener('click', function() {
        endQuizBtn.classList.add('hide');
        resultEl.classList.add('hide');
        startQuizBtn.classList.remove('hide');
        nameInput.classList.remove('hide');
        location.reload();
    });
});

