// 游戏状态
const state = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameOver: false,
    mode: 'pvp', // 'pvp' or 'pve'
    aiDifficulty: 'easy', // 'easy' or 'hard'
    xWins: 0,
    oWins: 0
};

const tttBoard = document.getElementById('tttBoard');
const currentPlayerText = document.getElementById('currentPlayerText');
const gameMessage = document.getElementById('gameMessage');
const messageContent = document.getElementById('messageContent');
const newGameBtn = document.getElementById('newGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverMessage = document.getElementById('gameOverMessage');
const winnerIcon = document.getElementById('winnerIcon');
const xWins = document.getElementById('xWins');
const oWins = document.getElementById('oWins');
const pvpModeBtn = document.getElementById('pvpModeBtn');
const pveModeBtn = document.getElementById('pveModeBtn');
const aiDifficulty = document.getElementById('aiDifficulty');
const easyAIBtn = document.getElementById('easyAIBtn');
const hardAIBtn = document.getElementById('hardAIBtn');

function renderBoard() {
    tttBoard.innerHTML = '';
    state.board.forEach((cell, idx) => {
        const div = document.createElement('div');
        div.className = 'ttt-cell';
        if (cell === 'X') div.innerHTML = '<span class="ttt-x">X</span>';
        else if (cell === 'O') div.innerHTML = '<span class="ttt-o">O</span>';
        div.addEventListener('click', () => handleCellClick(idx));
        tttBoard.appendChild(div);
    });
}

function handleCellClick(idx) {
    if (state.gameOver || state.board[idx]) return;
    if (state.mode === 'pve' && state.currentPlayer === 'O') return;
    state.board[idx] = state.currentPlayer;
    renderBoard();
    if (checkWin(state.currentPlayer)) {
        endGame(state.currentPlayer);
        return;
    }
    if (state.board.every(cell => cell)) {
        endGame(null);
        return;
    }
    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
    if (state.mode === 'pve' && state.currentPlayer === 'O' && !state.gameOver) {
        setTimeout(makeAIMove, 400);
    }
}

function updateStatus() {
    currentPlayerText.textContent = state.currentPlayer;
    currentPlayerText.className = 'text-2xl font-bold ' + (state.currentPlayer === 'X' ? 'text-ttt' : 'text-primary') + ' mt-2';
    gameMessage.classList.add('hidden');
}

function showMessage(msg) {
    messageContent.textContent = msg;
    gameMessage.classList.remove('hidden');
}

function checkWin(player) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (const line of wins) {
        if (line.every(i => state.board[i] === player)) {
            // 高亮获胜线
            Array.from(tttBoard.children).forEach((cell, idx) => {
                if (line.includes(idx)) cell.classList.add('ttt-winner');
            });
            return true;
        }
    }
    return false;
}

function endGame(winner) {
    state.gameOver = true;
    if (winner === 'X') {
        gameOverMessage.textContent = 'X获胜！';
        winnerIcon.innerHTML = '<i class="fa fa-trophy text-3xl"></i>';
        winnerIcon.className = 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4';
        state.xWins++;
        xWins.textContent = state.xWins;
    } else if (winner === 'O') {
        gameOverMessage.textContent = 'O获胜！';
        winnerIcon.innerHTML = '<i class="fa fa-trophy text-3xl"></i>';
        winnerIcon.className = 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4';
        state.oWins++;
        oWins.textContent = state.oWins;
    } else {
        gameOverMessage.textContent = '平局！';
        winnerIcon.innerHTML = '<i class="fa fa-handshake text-3xl"></i>';
        winnerIcon.className = 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-600 mb-4';
    }
    gameOverModal.classList.remove('hidden');
}

function resetGame() {
    state.board = Array(9).fill(null);
    state.currentPlayer = 'X';
    state.gameOver = false;
    renderBoard();
    updateStatus();
}

function newGame() {
    resetGame();
}

playAgainBtn.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    resetGame();
});
newGameBtn.addEventListener('click', newGame);

// 模式切换
pvpModeBtn.addEventListener('click', () => {
    state.mode = 'pvp';
    pvpModeBtn.classList.add('game-mode-btn-selected');
    pveModeBtn.classList.remove('game-mode-btn-selected');
    aiDifficulty.classList.add('hidden');
    newGame();
});
pveModeBtn.addEventListener('click', () => {
    state.mode = 'pve';
    pvpModeBtn.classList.remove('game-mode-btn-selected');
    pveModeBtn.classList.add('game-mode-btn-selected');
    aiDifficulty.classList.remove('hidden');
    newGame();
});
easyAIBtn.addEventListener('click', () => {
    state.aiDifficulty = 'easy';
    easyAIBtn.classList.add('game-mode-btn-selected');
    hardAIBtn.classList.remove('game-mode-btn-selected');
    newGame();
});
hardAIBtn.addEventListener('click', () => {
    state.aiDifficulty = 'hard';
    easyAIBtn.classList.remove('game-mode-btn-selected');
    hardAIBtn.classList.add('game-mode-btn-selected');
    newGame();
});

// AI逻辑
function makeAIMove() {
    let move;
    if (state.aiDifficulty === 'easy') {
        move = randomAIMove();
    } else {
        move = minimaxAIMove();
    }
    if (move !== undefined) {
        state.board[move] = 'O';
        renderBoard();
        if (checkWin('O')) {
            endGame('O');
            return;
        }
        if (state.board.every(cell => cell)) {
            endGame(null);
            return;
        }
        state.currentPlayer = 'X';
        updateStatus();
    }
}

function randomAIMove() {
    const empty = state.board.map((v, i) => v ? null : i).filter(i => i !== null);
    if (empty.length === 0) return;
    return empty[Math.floor(Math.random() * empty.length)];
}

// 极小极大算法
function minimaxAIMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (!state.board[i]) {
            state.board[i] = 'O';
            let score = minimax(state.board, 0, false);
            state.board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    const winner = getWinner(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (board.every(cell => cell)) return 0;
    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'O';
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'X';
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = null;
            }
        }
        return best;
    }
}

function getWinner(board) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (const line of wins) {
        if (line.every(i => board[i] === 'X')) return 'X';
        if (line.every(i => board[i] === 'O')) return 'O';
    }
    return null;
}

// 初始化
resetGame();
