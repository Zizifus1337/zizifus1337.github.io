const boardSize = 8;  // Размер доски (можно увеличить на мобильных устройствах)
const maxBlockSize = 70;  // Максимальный размер блока
const blockImages = [
    'bomb.jpg',  // Бомба
    'drova.jpg', // Дрова
    'tractor.jpg', // Трактор
    'pivo.jpg', // Пиво
    'spil.png', // Спил
];

const board = document.getElementById('board');
const resetButton = document.getElementById('reset-button');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

// Звуки
const startSound = new Audio('start_game.mp3');
const endSound = new Audio('end_game.mp3');
const fiveLinesSound = new Audio('five_lines.mp3');
const backgroundMusic = new Audio('background_music.mp3');

let gameBoard = [];
let selectedBlock = null;
let score = 0;
let timerInterval;
let timeLeft = 60;

// Масштаб для увеличения размера блоков на мобильных устройствах
let scaleFactor = 0.55;  // Применим уменьшение для маленьких экранов

function calculateBlockSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const blockWidth = Math.floor(screenWidth / boardSize);
    const blockHeight = Math.floor(screenHeight / boardSize);

    const blockSize = Math.min(blockWidth, blockHeight, maxBlockSize);

    // Применяем масштаб
    return blockSize * scaleFactor;
}

function addAnimationEndListener(element, className) {
    element.addEventListener('animationend', function() {
        element.classList.remove(className);
    }, { once: true });
}

function generateBoard() {
    gameBoard = [];
    board.innerHTML = '';
    const blockSize = calculateBlockSize(); // Вычисляем размер блока с учетом масштаба
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
            cell.classList.add('appearing');

            // Используем touchstart для мобильных устройств
            cell.addEventListener('touchstart', () => handleBlockClick(i, j, cell));

            board.appendChild(cell);
            addAnimationEndListener(cell, 'appearing');
        }
        gameBoard.push(row);
    }
}

function handleBlockClick(row, col, cell) {
    if (selectedBlock && selectedBlock.row === row && selectedBlock.col === col) return;

    if (selectedBlock) {
        const dx = Math.abs(selectedBlock.row - row);
        const dy = Math.abs(selectedBlock.col - col);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            swapBlocks(selectedBlock.row, selectedBlock.col, row, col);
            if (!checkMatches()) {
                setTimeout(() => {
                    swapBlocks(row, col, selectedBlock.row, selectedBlock.col);
                }, 500);
            } else {
                setTimeout(() => refillBoard(), 500);
            }
        }
        board.children[selectedBlock.row * boardSize + selectedBlock.col].classList.remove('selected');
        selectedBlock = null;
    } else {
        selectedBlock = { row, col, cell };
        cell.classList.add('selected');
    }
}

resetButton.addEventListener('click', () => {
    board.innerHTML = '';
    generateBoard();
    score = 0;
    scoreDisplay.textContent = `Очки: ${score}`;
    timeLeft = 60;
    timerDisplay.textContent = `Время: ${timeLeft} секунд`;
    startTimer();
    startSound.play();
    backgroundMusic.play();
    backgroundMusic.loop = true;
});

generateBoard();
startTimer();
startSound.play();
backgroundMusic.play();
backgroundMusic.loop = true;
