const boardSize = 8;
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

function generateBoard() {
    gameBoard = [];
    board.innerHTML = ''; // Очищаем доску

    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            const randomImage = blockImages[Math.floor(Math.random() * blockImages.length)];
            row.push(randomImage);
            const cell = document.createElement('div');
            cell.style.backgroundImage = `url(${randomImage})`;
            cell.dataset.row = i;
            cell.dataset.col = j;

            // Добавляем обработчик для нажатий на блоки
            cell.addEventListener('click', (e) => handleBlockClick(i, j, cell));

            // Для мобильных устройств добавим обработку касания
            cell.addEventListener('touchstart', (e) => handleBlockClick(i, j, cell));

            board.appendChild(cell);
        }
        gameBoard.push(row);
    }
}

function handleBlockClick(row, col, cell) {
    // Если блок уже выбран, то ничего не делаем
    if (selectedBlock && selectedBlock.row === row && selectedBlock.col === col) return;

    if (selectedBlock) {
        const dx = Math.abs(selectedBlock.row - row);
        const dy = Math.abs(selectedBlock.col - col);

        // Блоки могут меняться местами только если они соседние (по горизонтали или вертикали)
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // Меняем местами блоки
            swapBlocks(selectedBlock.row, selectedBlock.col, row, col);

            // Проверка на совпадения
            if (!checkMatches()) {
                setTimeout(() => {
                    // Возвращаем блоки на места, если нет совпадений
                    swapBlocks(row, col, selectedBlock.row, selectedBlock.col);
                }, 500);  // Пауза перед возвратом
            } else {
                setTimeout(() => refillBoard(), 500);
            }
        }

        // Убираем выделение с первого блока
        const firstCell = board.children[selectedBlock.row * boardSize + selectedBlock.col];
        firstCell.classList.remove('selected');
        selectedBlock = null;
    } else {
        // Если блок не выбран, то выбираем текущий
        selectedBlock = { row, col, cell };
        cell.classList.add('selected');
    }
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
