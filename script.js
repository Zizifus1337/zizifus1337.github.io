const boardSize = 8;
const blockImages = [
    'bomb.jpg',   // Бомба
    'drova.jpg',  // Дрова
    'tractor.png',  // Трактор
    'pivo.png',  // Пиво
    'spil.png',  // Спил
];

const board = document.getElementById('board');
const resetButton = document.getElementById('reset-button');
const scoreDisplay = document.getElementById('score');

let gameBoard = [];
let selectedBlock = null;
let score = 0;
let startTouch = null;
let timerInterval;

function generateBoard() {
    gameBoard = [];
    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            const randomImage = blockImages[Math.floor(Math.random() * blockImages.length)];
            row.push(randomImage);
            const cell = document.createElement('div');
            cell.style.backgroundImage = `url(${randomImage})`;
            cell.dataset.row = i;
            cell.dataset.col = j;

            // Добавляем обработчик для касания блоков
            cell.addEventListener('touchstart', (e) => handleTouchStart(i, j, e));
            cell.addEventListener('touchend', (e) => handleTouchEnd(i, j, e));

            board.appendChild(cell);
        }
        gameBoard.push(row);
    }
}

function handleTouchStart(row, col, e) {
    // Запоминаем начальную точку касания для определения свайпа
    startTouch = e.touches[0];
    selectedBlock = { row, col };
}

function handleTouchEnd(row, col, e) {
    if (!startTouch) return;

    const endTouch = e.changedTouches[0];
    const deltaX = endTouch.pageX - startTouch.pageX;
    const deltaY = endTouch.pageY - startTouch.pageY;

    // Если свайп был достаточно длинным, меняем местами блоки
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        // Горизонтальный свайп
        if (deltaX > 0) {
            // Свайп вправо
            if (col < boardSize - 1) {
                swapBlocks(row, col, row, col + 1);
            }
        } else {
            // Свайп влево
            if (col > 0) {
                swapBlocks(row, col, row, col - 1);
            }
        }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
        // Вертикальный свайп
        if (deltaY > 0) {
            // Свайп вниз
            if (row < boardSize - 1) {
                swapBlocks(row, col, row + 1, col);
            }
        } else {
            // Свайп вверх
            if (row > 0) {
                swapBlocks(row, col, row - 1, col);
            }
        }
    }

    // Проверка на совпадения после свапа
    setTimeout(() => {
        if (!checkMatches()) {
            // Если совпадений нет, возвращаем блоки обратно
            setTimeout(() => {
                swapBlocks(row, col, selectedBlock.row, selectedBlock.col);
            }, 500);
        } else {
            setTimeout(() => refillBoard(), 500);
        }
    }, 500);

    // Сбрасываем начальную точку касания
    startTouch = null;
}

function swapBlocks(row1, col1, row2, col2) {
    const temp = gameBoard[row1][col1];
    gameBoard[row1][col1] = gameBoard[row2][col2];
    gameBoard[row2][col2] = temp;

    const cell1 = board.children[row1 * boardSize + col1];
    const cell2 = board.children[row2 * boardSize + col2];
    const image1 = cell1.style.backgroundImage;
    const image2 = cell2.style.backgroundImage;

    // Меняем изображения местами
    cell1.style.backgroundImage = image2;
    cell2.style.backgroundImage = image1;
}

function checkMatches() {
    let matches = [];

    // Проверка по строкам
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize - 2; col++) {
            const image = gameBoard[row][col];
            if (image !== 'bomb') {
                if (gameBoard[row][col + 1] === image && gameBoard[row][col + 2] === image) {
                    matches.push([[row, col], [row, col + 1], [row, col + 2]]);
                }
            }
        }
    }

    // Проверка по столбцам
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row < boardSize - 2; row++) {
            const image = gameBoard[row][col];
            if (image !== 'bomb') {
                if (gameBoard[row + 1][col] === image && gameBoard[row + 2][col] === image) {
                    matches.push([[row, col], [row + 1, col], [row + 2, col]]);
                }
            }
        }
    }

    // Если совпадения есть, удаляем их
    if (matches.length > 0) {
        matches.forEach(match => {
            match.forEach(([r, c]) => {
                gameBoard[r][c] = null;
                const cell = board.children[r * boardSize + c];
                cell.style.animation = 'disappear 0.5s forwards';
            });
        });

        // Начисляем очки
        updateScore(matches.length);

        // Пауза перед перезаполнением поля
        setTimeout(() => {
            refillBoard();
            // Повторная проверка на совпадения после обновления
            if (checkMatches()) {
                setTimeout(refillBoard, 500);
            }
        }, 500);
        return true;
    }

    return false;
}

function refillBoard() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (gameBoard[row][col] === null) {
                const randomImage = blockImages[Math.floor(Math.random() * blockImages.length)];
                gameBoard[row][col] = randomImage;
                const cell = board.children[row * boardSize + col];
                cell.style.backgroundImage = `url(${randomImage})`;
                cell.style.animation = 'appear 0.5s forwards';
            }
        }
    }
}

function updateScore(lines) {
    // Начисление очков
    if (lines === 3) {
        score += 10;
    } else if (lines === 4) {
        score += 15;
    } else if (lines === 5) {
        score += 25;
    }
    scoreDisplay.textContent = `Очки: ${score}`;
}

resetButton.addEventListener('click', () => {
    board.innerHTML = '';
    generateBoard();
    score = 0;
    scoreDisplay.textContent = `Очки: ${score}`;
    startTimer();
});

function startTimer() {
    let timeLeft = 60;
    const timerDisplay = document.getElementById('timer');
    
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Время вышло! Ленур победил!');
        }
        timerDisplay.textContent = `Время: ${timeLeft}s`;
    }, 1000);
}

generateBoard();
startTimer();
