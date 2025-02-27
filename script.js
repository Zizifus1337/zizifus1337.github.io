const boardSize = 8;
const blockSize = 80; // Размер блока
const blockImages = [
    'bomb.jpg',   // Бомба
    'drova.jpg',  // Дрова
    'tractor.jpg',  // Трактор
    'pivo.jpg',  // Пиво
    'spil.png',  // Спил
];

const board = document.getElementById('board');
const resetButton = document.getElementById('reset-button');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

let gameBoard = [];
let selectedBlock = null;
let score = 0;
let timerInterval;

function startTimer() {
    let timeLeft = 60;
    clearInterval(timerInterval);
    timerDisplay.textContent = `Время: ${timeLeft}`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Время: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert(`Время вышло! Ваши очки: ${score}`);
            resetButton.disabled = false;
        }
    }, 1000);
}

function generateBoard() {
    gameBoard = [];
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${boardSize}, ${blockSize}px)`;
    board.style.gridTemplateRows = `repeat(${boardSize}, ${blockSize}px)`;

    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            const randomImage = blockImages[Math.floor(Math.random() * blockImages.length)];
            row.push(randomImage);
            const cell = document.createElement('div');
            cell.style.width = `${blockSize}px`;
            cell.style.height = `${blockSize}px`;
            cell.style.backgroundImage = `url(${randomImage})`;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => handleBlockClick(i, j, cell));
            cell.addEventListener('touchstart', (e) => handleBlockClick(i, j, cell));
            board.appendChild(cell);
        }
        gameBoard.push(row);
    }
}

resetButton.addEventListener('click', () => {
    board.innerHTML = '';
    generateBoard();
    score = 0;
    scoreDisplay.textContent = `Очки: ${score}`;
    startTimer();
    resetButton.disabled = true;
});

generateBoard();
startTimer();
