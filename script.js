const boardSize = 8;
const blockSize = 70;
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
let timeLeft = 60; // Время в секундах

function addAnimationEndListener(element, className) {
    element.addEventListener('animationend', function() {
        element.classList.remove(className);
    }, { once: true });
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
        setTimeout(refillBoard, 600);
        return true;
    }
    return false;
}

function refillBoard() {
    for (let col = 0; col < boardSize; col++) {
        let emptyCells = [];
        for (let row = boardSize - 1; row >= 0; row--) {
            if (gameBoard[row][col] === null) {
                emptyCells.push(row);
            } else if (emptyCells.length > 0) {
                let newRow = emptyCells.shift();
                gameBoard[newRow][col] = gameBoard[row][col];
                gameBoard[row][col] = null;
                let cell = board.children[newRow * boardSize + col];
                cell.style.backgroundImage = board.children[row * boardSize + col].style.backgroundImage;
                cell.classList.add('falling');
                addAnimationEndListener(cell, 'falling');
                board.children[row * boardSize + col].style.backgroundImage = '';
                emptyCells.push(row);
            }
        }
        emptyCells.forEach(row => {
            const randomImage = blockImages[Math.floor(Math.random() * blockImages.length)];
            gameBoard[row][col] = randomImage;
            let cell = board.children[row * boardSize + col];
            cell.style.backgroundImage = `url(${randomImage})`;
            cell.classList.add('appearing');
            addAnimationEndListener(cell, 'appearing');
        });
    }
    setTimeout(checkMatches, 600);
}

function updateScore(matches) {
    let scoreIncrease = matches.reduce((sum, match) => sum + (match.length === 3 ? 10 : match.length === 4 ? 15 : 25), 0);
    score += scoreIncrease;
    scoreDisplay.textContent = `Очки: ${score}`;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // Останавливаем предыдущий таймер

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerDisplay.textContent = `Время: ${timeLeft} секунд`;
        } else {
            clearInterval(timerInterval);
            alert('Время истекло! Игра закончена!');
            disableGame();
        }
    }, 1000);
}

function disableGame() {
    const cells = board.querySelectorAll('div');
    cells.forEach(cell => {
        cell.style.pointerEvents = 'none'; // Отключаем клики по ячейкам
    });
}

resetButton.addEventListener('click', () => {
    board.innerHTML = '';
    generateBoard();
    score = 0;
    scoreDisplay.textContent = `Очки: ${score}`;
    timeLeft = 60; // Сброс таймера
    timerDisplay.textContent = `Время: ${timeLeft} секунд`;
    startTimer();
});

generateBoard();
startTimer();
