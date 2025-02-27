const boardSize = 8;  // Размер доски
const maxBlockSize = 70;  // Максимальный размер блока
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

// Звуки
const startSound = new Audio('start_game.mp3');  // Звук начала игры
const endSound = new Audio('end_game.mp3');  // Звук окончания игры
const fiveLinesSound = new Audio('five_lines.mp3');  // Звук при сжигании 5 линий
const backgroundMusic = new Audio('background_music.mp3');  // Фоновая музыка

let gameBoard = [];
let selectedBlock = null;
let score = 0;
let timerInterval;
let timeLeft = 60; // Время в секундах

// Масштаб для увеличения размера блоков в 1.5 раза
let scaleFactor = 0.75;  // Увеличиваем размер блоков на 1.5

// Функция для вычисления размера блока с учетом масштаба
function calculateBlockSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Вычисляем максимально возможный размер блока, исходя из ширины экрана и размера доски
    const blockWidth = Math.floor(screenWidth / boardSize);
    const blockHeight = Math.floor(screenHeight / boardSize);

    // Выбираем наименьший размер, чтобы все поместилось
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
            cell.addEventListener('click', () => handleBlockClick(i, j, cell));
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

function swapBlocks(row1, col1, row2, col2) {
    [gameBoard[row1][col1], gameBoard[row2][col2]] = [gameBoard[row2][col2], gameBoard[row1][col1]];
    const cell1 = board.children[row1 * boardSize + col1];
    const cell2 = board.children[row2 * boardSize + col2];
    [cell1.style.backgroundImage, cell2.style.backgroundImage] = [cell2.style.backgroundImage, cell1.style.backgroundImage];
}

function checkMatches() {
    let matches = [];
    // Горизонтальные совпадения
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize - 2; col++) {
            const image = gameBoard[row][col];
            if (image && gameBoard[row][col + 1] === image && gameBoard[row][col + 2] === image) {
                matches.push([ [row, col], [row, col + 1], [row, col + 2] ]);
            }
        }
    }

    // Вертикальные совпадения
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row < boardSize - 2; row++) {
            const image = gameBoard[row][col];
            if (image && gameBoard[row + 1][col] === image && gameBoard[row + 2][col] === image) {
                matches.push([ [row, col], [row + 1, col], [row + 2, col] ]);
            }
        }
    }

    // Если есть совпадения
    if (matches.length > 0) {
        matches.flat().forEach(([r, c]) => {
            gameBoard[r][c] = null;
            let cell = board.children[r * boardSize + c];
            cell.classList.add('disappearing');
            addAnimationEndListener(cell, 'disappearing');
            setTimeout(() => cell.style.backgroundImage = '', 500);
        });
        updateScore(matches);
        if (
