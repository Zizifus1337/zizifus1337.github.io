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
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');

let gameBoard = [];
let selectedBlock = null;
let originalPosition = null;
let score = 0;
let timeLeft = 60; // 60 секунд
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
            cell.addEventListener('mousedown', () => handleMouseDown(i, j, cell));
            cell.addEventListener('mouseover', () => handleMouseOver(i, j, cell));
            cell.addEventListener('mouseup', () => handleMouseUp(i, j, cell));
            board.appendChild(cell);
        }
        gameBoard.push(row);
    }
}

function handleMouseDown(row, col, cell) {
    selectedBlock = { row, col, cell };
    originalPosition = { row, col };
    cell.classList.add('selected');  // Увеличиваем блок при нажатии
}

function handleMouseOver(row, col, cell) {
    if (!selectedBlock) return;
    const dx = Math.abs(selectedBlock.row - row);
    const dy = Math.abs(selectedBlock.col - col);
    if (dx + dy === 1) {
        cell.style.cursor = 'pointer';
    }
}

function handleMouseUp(row, col, cell) {
    if (!selectedBlock) return;

    const dx = Math.abs(selectedBlock.row - row);
    const dy = Math.abs(selectedBlock.col - col);
    if (dx + dy === 1) {
        swapBlocks(selectedBlock.row, selectedBlock.col, row, col);
        
        // Проверка на совпадения
        if (!checkMatches()) {
            setTimeout(() => {
                returnBlockToOriginalPosition();
            }, 500);  // Пауза перед возвращением
        } else {
            setTimeout(() => refillBoard(), 500);
        }
    }
    selectedBlock.cell.classList.remove('selected');  // Убираем увеличение при отпускании
    selectedBlock = null;
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

        // Пауза перед перезаполнением поля
        setTimeout(() => {
            refillBoard();
            // Повторная проверка на совпадения после обновления
            if (checkMatches()) {
                setTimeout(refillBoard, 500);
            }
        }, 500);

        // Добавляем очки
        score += matches.length * 10;  // Считаем по числу совпадений
        scoreElement.textContent = `Очки: ${score}`;

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

function returnBlockToOriginalPosition() {
    const cell = board.children[selectedBlock.row * boardSize + selectedBlock.col];
    const originalCell = board.children[originalPosition.row * boardSize + originalPosition.col];
    
    // Получаем координаты исходной ячейки
    const rect = originalCell.getBoundingClientRect();

    // Плавное перемещение блока обратно на исходное место
    cell.style.transition = 'transform 0.3s ease';
    cell.style.transform = `translate(${rect.left - cell.getBoundingClientRect().left}px, ${rect.top - cell.getBoundingClientRect().top}px)`;

    // Возвращаем блок на место
    setTimeout(() => {
        cell.style.transform = 'none';
    }, 300);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Время: ${timeLeft} секунд`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            messageElement.textContent = "Ленур победил!";
            resetButton.disabled = false;
        }
    }, 1000);
}

resetButton.addEventListener('click', () => {
    board.innerHTML = '';
    score = 0;
    scoreElement.textContent = `Очки: ${score}`;
    timeLeft = 60;
    timerElement.textContent = `Время: ${timeLeft} секунд`;
    messageElement.textContent = '';
    resetButton.disabled = true;

    generateBoard();
    startTimer();
});

generateBoard();
startTimer();
