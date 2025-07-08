// 游戏状态对象
const gameState = {
    board: [],
    currentPlayer: 1,
    gameMode: 'pvp',
    playerColor: 1,
    aiPlayer: 0,
    aiDifficulty: 'easy',
    gameOver: false,
    history: [],
    hints: [],
    aiThinking: false,
    aiBestMove: null,
    validMoves: []
};

// 获取 HTML 元素
const boardContainer = document.getElementById('boardContainer');
const blackPlayerLabel = document.getElementById('blackPlayerLabel');
const whitePlayerLabel = document.getElementById('whitePlayerLabel');
const blackCount = document.getElementById('blackCount');
const whiteCount = document.getElementById('whiteCount');
const currentPlayerIndicator = document.getElementById('currentPlayerIndicator');
const currentPlayerText = document.getElementById('currentPlayerText');
const gameMessage = document.getElementById('gameMessage');
const messageContent = document.getElementById('messageContent');
const gameOverModal = document.getElementById('gameOverModal');
const finalBlackCount = document.getElementById('finalBlackCount');
const finalWhiteCount = document.getElementById('finalWhiteCount');
const gameOverMessage = document.getElementById('gameOverMessage');
const winnerIcon = document.getElementById('winnerIcon');

// 游戏模式按钮
const pvpModeBtn = document.getElementById('pvpModeBtn');
const pveModeBtn = document.getElementById('pveModeBtn');
const aiDifficulty = document.getElementById('aiDifficulty');
const easyAIBtn = document.getElementById('easyAIBtn');
const mediumAIBtn = document.getElementById('mediumAIBtn');
const hardAIBtn = document.getElementById('hardAIBtn');

// 控制按钮
const newGameBtn = document.getElementById('newGameBtn');
const undoBtn = document.getElementById('undoBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

// 绑定按钮事件
function bindButtonEvents() {
    pvpModeBtn.addEventListener('click', () => {
        gameState.gameMode = 'pvp';
        updateButtonState(pvpModeBtn, true);
        updateButtonState(pveModeBtn, false);
        aiDifficulty.classList.add('hidden');
        initGame();
    });

    pveModeBtn.addEventListener('click', () => {
        gameState.gameMode = 'pve';
        updateButtonState(pvpModeBtn, false);
        updateButtonState(pveModeBtn, true);
        aiDifficulty.classList.remove('hidden');
        initGame();
    });

    easyAIBtn.addEventListener('click', () => {
        gameState.aiDifficulty = 'easy';
        updateAllAIDifficultyButtons(false);
        updateButtonState(easyAIBtn, true);
        initGame();
    });

    mediumAIBtn.addEventListener('click', () => {
        gameState.aiDifficulty = 'medium';
        updateAllAIDifficultyButtons(false);
        updateButtonState(mediumAIBtn, true);
        initGame();
    });

    hardAIBtn.addEventListener('click', () => {
        gameState.aiDifficulty = 'hard';
        updateAllAIDifficultyButtons(false);
        updateButtonState(hardAIBtn, true);
        initGame();
    });

    newGameBtn.addEventListener('click', initGame);
    undoBtn.addEventListener('click', undoMove);
    playAgainBtn.addEventListener('click', () => {
        gameOverModal.classList.add('hidden');
        initGame();
    });
}

// 更新所有AI难度按钮的状态
function updateAllAIDifficultyButtons(isSelected) {
    [easyAIBtn, mediumAIBtn, hardAIBtn].forEach(btn => updateButtonState(btn, isSelected));
}

// 初始化游戏
function initGame() {
    // 重置游戏状态
    gameState.board = Array(8).fill().map(() => Array(8).fill(null));
    gameState.currentPlayer = 1;
    gameState.gameOver = false;
    gameState.history = [];
    gameState.hints = [];
    gameState.aiThinking = false;
    gameState.aiBestMove = null;

    // 设置初始棋子
    if (gameState.playerColor === 1) { // 玩家执黑
        gameState.board[3][3] = 0; // 白
        gameState.board[3][4] = 1; // 黑
        gameState.board[4][3] = 1; // 黑
        gameState.board[4][4] = 0; // 白
    } else { // 玩家执白
        gameState.board[3][3] = 1; // 黑
        gameState.board[3][4] = 0; // 白
        gameState.board[4][3] = 0; // 白
        gameState.board[4][4] = 1; // 黑
    }

    // 更新玩家标签
    updatePlayerLabels();

    // 渲染棋盘
    renderBoard();

    // 更新游戏状态
    updateGameState();

    // 隐藏游戏消息
    gameMessage.classList.add('hidden');

    // 隐藏游戏结束模态框
    gameOverModal.classList.add('hidden');

    // 如果是人机模式且AI先手，让AI走一步
    if (gameState.gameMode === 'pve') {
        gameState.aiPlayer = gameState.playerColor === 1 ? 0 : 1;
        if (gameState.currentPlayer === gameState.aiPlayer) {
            setTimeout(makeAIMove, 500);
        }
    }
}

// 默认设置玩家执黑
gameState.playerColor = 1;

// DOMContentLoaded 事件处理程序
document.addEventListener('DOMContentLoaded', () => {
    bindButtonEvents();
    initGame();
});

// 更新按钮状态的通用函数
function updateButtonState(button, isSelected) {
    button.classList.toggle('game-mode-btn-selected', isSelected);
    button.classList.toggle('game-mode-btn', !isSelected);
}

// 更新玩家标签
function updatePlayerLabels() {
    if (gameState.gameMode === 'pvp') {
        blackPlayerLabel.textContent = '黑方';
        whitePlayerLabel.textContent = '白方';
    } else {
        const playerColorText = gameState.playerColor === 1 ? '黑' : '白';
        const aiColorText = gameState.playerColor === 1 ? '白' : '黑';
        blackPlayerLabel.textContent = `玩家 (${playerColorText})`;
        whitePlayerLabel.textContent = `AI (${aiColorText})`;
    }
}

// 悔棋
function undoMove() {
    if (gameState.history.length === 0) {
        showMessage('无法再撤销更多步骤', 'warning');
        return;
    }

    let lastState = null;

    // 找到最后一个属于当前玩家的历史记录
    for (let i = gameState.history.length - 1; i >= 0; i--) {
        const state = gameState.history[i];
        if (state.player === gameState.currentPlayer) {
            lastState = state;
            break;
        }
    }

    if (!lastState) {
        showMessage('没有找到可以撤销的步骤', 'warning');
        return;
    }

    // 移除所有后续的历史记录
    while (gameState.history.length > 0 && gameState.history[gameState.history.length - 1] !== lastState) {
        gameState.history.pop();
    }

    // 恢复状态
    gameState.board = lastState.board;
    gameState.currentPlayer = lastState.currentPlayer;

    // 清除提示
    gameState.hints = [];

    // 更新游戏状态
    updateGameState();
}

// 更新游戏状态显示
function updateGameState(updateCells) {
    // 更新棋子计数
    const counts = countPieces();
    blackCount.textContent = counts.black;
    whiteCount.textContent = counts.white;

    // 更新当前玩家显示
    currentPlayerIndicator.className = `w-8 h-8 rounded-full ${gameState.currentPlayer === 1 ? 'piece-black' : 'piece-white'} mr-2 animate-pulse-subtle`;
    currentPlayerText.textContent = getPlayerName(gameState.currentPlayer);
    currentPlayerText.className = gameState.currentPlayer === 1 ? 'text-lg font-semibold text-black' : 'text-lg font-semibold text-gray-800';

    // 更新有效移动列表
    gameState.validMoves = getAllValidMoves();

    // 局部刷新
    if (updateCells && updateCells.size) {
        renderBoard(updateCells);
    } else {
        renderBoard();
    }
}

// 处理单元格点击
function handleCellClick(row, col) {
    // 如果是人机模式且当前是AI回合，不处理点击
    if (gameState.gameMode === 'pve' && gameState.currentPlayer === gameState.aiPlayer) {
        showMessage('请等待AI思考...', 'info');
        return;
    }

    if (gameState.gameOver) {
        showMessage('游戏已结束，请开始新游戏', 'warning');
        return;
    }

    if (!isValidMove(row, col)) {
        showMessage('无效的移动', 'error');
        return;
    }

    // 保存当前状态用于悔棋
    saveHistory(gameState.currentPlayer);

    // 放置棋子并收集需要局部刷新的格子
    const updateCells = new Set();
    updateCells.add(`${row},${col}`);
    let flipped = false;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    gameState.board[row][col] = gameState.currentPlayer;
    for (const [dx, dy] of directions) {
        const flippedPieces = getFlippedPiecesInDirection(row, col, dx, dy);
        if (flippedPieces.length > 0) {
            flipped = true;
            for (const { r, c } of flippedPieces) {
                gameState.board[r][c] = gameState.currentPlayer;
                flipPiece(r, c, gameState.currentPlayer);
                updateCells.add(`${r},${c}`);
            }
        }
    }

    if (!flipped) {
        gameState.board[row][col] = null;
        showMessage('无效的移动', 'error');
        return false;
    }

    // 清除提示
    gameState.hints = [];

    // 切换玩家
    switchPlayer();

    // 检查游戏是否结束
    if (isGameOver()) {
        gameState.gameOver = true;
        showGameOverModal();
        return;
    }

    // 检查当前玩家是否有有效移动
    if (!hasValidMoves()) {
        showMessage(`${getPlayerName(gameState.currentPlayer)} 没有有效移动，自动跳过`, 'info');
        switchPlayer();

        // 再次检查游戏是否结束
        if (isGameOver()) {
            gameState.gameOver = true;
            showGameOverModal();
            return;
        }

        // 如果新玩家也没有有效移动，游戏结束
        if (!hasValidMoves()) {
            gameState.gameOver = true;
            showGameOverModal();
            return;
        }
    }

    // 更新游戏状态（局部刷新）
    updateGameState(updateCells);

    // 如果是人机模式且轮到AI，让AI走一步
    if (gameState.gameMode === 'pve' && gameState.currentPlayer === gameState.aiPlayer) {
        setTimeout(makeAIMove, 500);
    }
}

// 保存当前状态用于悔棋
function saveHistory(player) {
    const boardCopy = gameState.board.map(row => [...row]);
    gameState.history.push({
        board: boardCopy,
        currentPlayer: gameState.currentPlayer,
        player: player // 新增：记录当前操作的玩家
    });
}

// 获取玩家名称
function getPlayerName(player) {
    if (gameState.gameMode === 'pvp') {
        return player === 1 ? '黑方' : '白方';
    } else {
        return player === gameState.aiPlayer ? 'AI' : '玩家';
    }
}

// 检查是否是有效移动
function isValidMove(row, col) {
    // 检查位置是否已被占用
    if (gameState.board[row][col] !== null) {
        return false;
    }

    // 获取所有可能的方向
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    // 检查是否在任何方向上可以翻转对手的棋子
    for (const [dx, dy] of directions) {
        const flippedPieces = getFlippedPiecesInDirection(row, col, dx, dy);

        if (flippedPieces.length > 0) {
            return true;
        }
    }

    return false;
}

// 显示消息
function showMessage(message, type = 'info') {
    messageContent.textContent = message;

    // 设置消息样式
    messageContent.className = 'p-4 rounded-lg border-l-4';

    switch (type) {
        case 'success':
            messageContent.classList.add('bg-green-50', 'border-green-500', 'text-green-800');
            break;
        case 'error':
            messageContent.classList.add('bg-red-50', 'border-red-500', 'text-red-800');
            break;
        case 'warning':
            messageContent.classList.add('bg-yellow-50', 'border-yellow-500', 'text-yellow-800');
            break;
        case 'info':
        default:
            messageContent.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-800');
            break;
    }

    // 显示消息
    gameMessage.classList.remove('hidden');

    // 滚动到消息区域
    gameMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 创建棋子
function createPiece(color) {
    const piece = document.createElement('div');
    piece.className = `absolute inset-1 rounded-full ${color === 1 ? 'piece-black' : 'piece-white'} transform transition-all duration-300`;
    piece.style.transform = 'scale(0)';

    // 添加出现动画
    setTimeout(() => {
        piece.style.transform = 'scale(1)';
    }, 50);

    return piece;
}

// 获取所有有效移动
function getAllValidMoves() {
    const validMoves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isValidMove(row, col)) {
                validMoves.push({ row, col });
            }
        }
    }

    return validMoves;
}

// 显示游戏结束模态框
function showGameOverModal() {
    const counts = countPieces();

    finalBlackCount.textContent = counts.black;
    finalWhiteCount.textContent = counts.white;

    if (counts.black > counts.white) {
        gameOverMessage.textContent = gameState.gameMode === 'pvp' ? '黑方获胜！' : (gameState.aiPlayer === 1 ? 'AI获胜！' : '玩家获胜！');
        winnerIcon.innerHTML = '<i class="fa fa-trophy text-3xl"></i>';
        winnerIcon.className = 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4';
    } else if (counts.white > counts.black) {
        gameOverMessage.textContent = gameState.gameMode === 'pvp' ? '白方获胜！' : (gameState.aiPlayer === 0 ? 'AI获胜！' : '玩家获胜！');
        winnerIcon.innerHTML = '<i class="fa fa-trophy text-3xl"></i>';
        winnerIcon.className = 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4';
    } else {
        gameOverMessage.textContent = '平局！';
        winnerIcon.innerHTML = '<i class="fa fa-handshake-o text-3xl"></i>';
        winnerIcon.className = 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4';
    }

    gameOverModal.classList.remove('hidden');
}

// 获取指定方向上需要翻转的棋子
function getFlippedPiecesInDirection(row, col, dx, dy) {
    const flipped = [];
    const opponent = gameState.currentPlayer === 1 ? 0 : 1;
    let r = row + dx;
    let c = col + dy;

    // 检查是否在棋盘范围内且是对手的棋子
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && gameState.board[r][c] === opponent) {
        flipped.push({ r, c });
        r += dx;
        c += dy;
    }

    // 如果最后一个位置不是当前玩家的棋子，则返回空数组
    if (r < 0 || r >= 8 || c < 0 || c >= 8 || gameState.board[r][c] !== gameState.currentPlayer) {
        return [];
    }

    return flipped;
}

// 中等AI策略：优先选择角落和边缘位置，避免靠近角落的危险位置
function makeMediumAIMove() {
    const validMoves = getAllValidMoves();

    if (validMoves.length === 0) {
        return null;
    }

    // 角落位置评分最高
    const corners = [
        { row: 0, col: 0 },
        { row: 0, col: 7 },
        { row: 7, col: 0 },
        { row: 7, col: 7 }
    ];

    // 边缘位置评分次之
    const edges = [];
    for (let i = 0; i < 8; i++) {
        edges.push({ row: 0, col: i });
        edges.push({ row: 7, col: i });
        edges.push({ row: i, col: 0 });
        edges.push({ row: i, col: 7 });
    }

    // 危险位置（靠近角落的位置）评分最低
    const dangerousPositions = [
        { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 },
        { row: 0, col: 6 }, { row: 1, col: 6 }, { row: 1, col: 7 },
        { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 7, col: 1 },
        { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 7, col: 6 }
    ];

    // 为每个有效移动评分
    const scoredMoves = validMoves.map(move => {
        let score = 0;

        // 如果是角落位置，给予高分
        if (corners.some(corner => corner.row === move.row && corner.col === move.col)) {
            score += 100;
        }
        // 如果是边缘位置，给予中等分数
        else if (edges.some(edge => edge.row === move.row && edge.col === move.col)) {
            score += 50;
        }
        // 如果是危险位置，给予低分
        else if (dangerousPositions.some(pos => pos.row === move.row && pos.col === move.col)) {
            score -= 100;
        }

        // 计算翻转的棋子数量，给予额外分数
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        let flippedCount = 0;

        for (const [dx, dy] of directions) {
            const flippedPieces = getFlippedPiecesInDirection(move.row, move.col, dx, dy);
            flippedCount += flippedPieces.length;
        }

        score += flippedCount;

        return { move, score };
    });

    // 按分数排序
    scoredMoves.sort((a, b) => b.score - a.score);

    // 选择分数最高的移动
    const bestMove = scoredMoves[0].move;

    // 显示AI思考中的最佳位置
    gameState.aiBestMove = bestMove;
    renderBoard();

    return bestMove;
}

// 困难AI策略：使用极小极大算法进行深度搜索
function makeHardAIMove() {
    const validMoves = getAllValidMoves();

    if (validMoves.length === 0) {
        return null;
    }

    // 角落位置评分最高
    const corners = [
        { row: 0, col: 0 },
        { row: 0, col: 7 },
        { row: 7, col: 0 },
        { row: 7, col: 7 }
    ];

    // 边缘位置评分次之
    const edges = [];
    for (let i = 0; i < 8; i++) {
        edges.push({ row: 0, col: i });
        edges.push({ row: 7, col: i });
        edges.push({ row: i, col: 0 });
        edges.push({ row: i, col: 7 });
    }

    // 危险位置（靠近角落的位置）评分最低
    const dangerousPositions = [
        { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 },
        { row: 0, col: 6 }, { row: 1, col: 6 }, { row: 1, col: 7 },
        { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 7, col: 1 },
        { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 7, col: 6 }
    ];

    // 使用极小极大算法，深度为3
    const depth = 3;
    let bestScore = -Infinity;
    let bestMove = null;

    for (const move of validMoves) {
        // 复制当前棋盘
        const boardCopy = gameState.board.map(row => [...row]);

        // 模拟放置棋子
        gameState.board[move.row][move.col] = gameState.currentPlayer;

        // 翻转对手的棋子
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dx, dy] of directions) {
            const flippedPieces = getFlippedPiecesInDirection(move.row, move.col, dx, dy);

            for (const { r, c } of flippedPieces) {
                gameState.board[r][c] = gameState.currentPlayer;
            }
        }

        // 切换玩家进行极小极大搜索
        const opponent = gameState.currentPlayer === 1 ? 0 : 1;
        const score = minimax(boardCopy, depth, -Infinity, Infinity, false, opponent);

        // 恢复棋盘
        gameState.board = boardCopy;

        // 更新最佳移动
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    // 显示AI思考中的最佳位置
    gameState.aiBestMove = bestMove;
    renderBoard();

    return bestMove;
}

// 放置棋子并翻转对手的棋子
function placePiece(row, col) {
    // 放置当前玩家的棋子
    gameState.board[row][col] = gameState.currentPlayer;

    // 获取所有需要翻转的方向
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    let flipped = false;

    // 检查每个方向
    for (const [dx, dy] of directions) {
        const flippedPieces = getFlippedPiecesInDirection(row, col, dx, dy);

        if (flippedPieces.length > 0) {
            flipped = true;

            // 翻转棋子
            for (const { r, c } of flippedPieces) {
                gameState.board[r][c] = gameState.currentPlayer;
                flipPiece(r, c, gameState.currentPlayer);
            }
        }
    }

    // 如果没有翻转任何棋子，回退操作
    if (!flipped) {
        gameState.board[row][col] = null;
        showMessage('无效的移动', 'error');
        return false;
    }

    return true;
}

// 简单AI策略：随机选择有效移动
function makeEasyAIMove() {
    const validMoves = getAllValidMoves();

    if (validMoves.length === 0) {
        return null;
    }

    // 随机选择一个有效移动
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];

    // 显示AI思考中的最佳位置
    gameState.aiBestMove = randomMove;
    renderBoard();

    return randomMove;
}

// 评估棋盘状态
function evaluateBoard(board, player) {
    const opponent = player === 1 ? 0 : 1;
    let score = 0;

    // 角落位置评分最高
    const corners = [
        { row: 0, col: 0 },
        { row: 0, col: 7 },
        { row: 7, col: 0 },
        { row: 7, col: 7 }
    ];

    // 边缘位置评分次之
    const edges = [];
    for (let i = 0; i < 8; i++) {
        edges.push({ row: 0, col: i });
        edges.push({ row: 7, col: i });
        edges.push({ row: i, col: 0 });
        edges.push({ row: i, col: 7 });
    }

    // 危险位置（靠近角落的位置）评分最低
    const dangerousPositions = [
        { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 },
        { row: 0, col: 6 }, { row: 1, col: 6 }, { row: 1, col: 7 },
        { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 7, col: 1 },
        { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 7, col: 6 }
    ];

    // 评估每个位置
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === player) {
                // 是AI的棋子
                if (corners.some(corner => corner.row === row && corner.col === col)) {
                    score += 100; // 角落位置非常重要
                } else if (edges.some(edge => edge.row === row && edge.col === col)) {
                    score += 20; // 边缘位置较好
                } else if (dangerousPositions.some(pos => pos.row === row && pos.col === col)) {
                    score -= 50; // 危险位置应避免
                } else {
                    score += 5; // 普通位置
                }
            } else if (board[row][col] === opponent) {
                // 是对手的棋子
                if (corners.some(corner => corner.row === row && corner.col === col)) {
                    score -= 100; // 对手占据角落位置很不利
                } else if (edges.some(edge => edge.row === row && edge.col === col)) {
                    score -= 20; // 对手占据边缘位置不利
                } else if (dangerousPositions.some(pos => pos.row === row && pos.col === col)) {
                    score += 50; // 对手占据危险位置是好事
                } else {
                    score -= 5; // 对手占据普通位置
                }
            }
        }
    }

    // 评估行动力（有效移动数量）
    const originalBoard = gameState.board;
    gameState.board = board;

    // 当前玩家的有效移动
    const playerMoves = getAllValidMoves().length;

    // 切换玩家，获取对手的有效移动
    switchPlayer();
    const opponentMoves = getAllValidMoves().length;
    switchPlayer(); // 切回

    // 恢复原始棋盘
    gameState.board = originalBoard;

    // 行动力评分
    if (playerMoves + opponentMoves > 0) {
        score += 10 * (playerMoves - opponentMoves) / (playerMoves + opponentMoves);
    }

    return score;
}

// AI移动
function makeAIMove() {
    gameState.aiThinking = true;
    const thinkingTime = Math.random() * 1000 + 500;

    setTimeout(() => {
        let bestMove;
        if (gameState.aiDifficulty === 'easy') {
            bestMove = makeEasyAIMove();
        } else if (gameState.aiDifficulty === 'hard') {
            bestMove = makeHardAIMove();
        } else {
            bestMove = makeMediumAIMove();
        }

        gameState.aiThinking = false;
        gameState.aiBestMove = null;

        if (bestMove) {
            saveHistory();

            // 局部刷新：收集AI落子和被翻转的格子
            const updateCells = new Set();
            updateCells.add(`${bestMove.row},${bestMove.col}`);
            let flipped = false;
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            gameState.board[bestMove.row][bestMove.col] = gameState.currentPlayer;
            for (const [dx, dy] of directions) {
                const flippedPieces = getFlippedPiecesInDirection(bestMove.row, bestMove.col, dx, dy);
                if (flippedPieces.length > 0) {
                    flipped = true;
                    for (const { r, c } of flippedPieces) {
                        gameState.board[r][c] = gameState.currentPlayer;
                        flipPiece(r, c, gameState.currentPlayer);
                        updateCells.add(`${r},${c}`);
                    }
                }
            }

            if (!flipped) {
                gameState.board[bestMove.row][bestMove.col] = null;
                showMessage('无效的移动', 'error');
                return false;
            }

            gameState.hints = [];
            switchPlayer();

            if (isGameOver()) {
                gameState.gameOver = true;
                showGameOverModal();
                return;
            }

            if (!hasValidMoves()) {
                showMessage(`${getPlayerName(gameState.currentPlayer)} 没有有效移动，自动跳过`, 'info');
                switchPlayer();

                if (isGameOver()) {
                    gameState.gameOver = true;
                    showGameOverModal();
                    return;
                }
                if (!hasValidMoves()) {
                    gameState.gameOver = true;
                    showGameOverModal();
                    return;
                }
            }

            // 只局部刷新
            updateGameState(updateCells);
        } else {
            showMessage('AI没有有效移动，自动跳过', 'info');
            switchPlayer();

            if (isGameOver()) {
                gameState.gameOver = true;
                showGameOverModal();
                return;
            }
            if (!hasValidMoves()) {
                gameState.gameOver = true;
                showGameOverModal();
                return;
            }
            // 当AI没有有效移动时，仍然尝试局部更新
            const updateCells = new Set();
            updateGameState(updateCells);
        }
    }, thinkingTime);
}

// 切换玩家
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 0 : 1;
}

// 检查当前玩家是否有有效移动
function hasValidMoves() {
    return getAllValidMoves().length > 0;
}

// 计算双方棋子数量
function countPieces() {
    let black = 0;
    let white = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (gameState.board[row][col] === 1) {
                black++;
            } else if (gameState.board[row][col] === 0) {
                white++;
            }
        }
    }

    return { black, white };
}

// 翻转棋子动画
function flipPiece(row, col, newColor) {
    const cell = boardContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const existingPiece = cell.querySelector('div');

    if (existingPiece) {
        // 添加翻转动画
        existingPiece.classList.add('animate-flip');

        setTimeout(() => {
            // 移除旧棋子
            cell.removeChild(existingPiece);

            // 创建新棋子
            const newPiece = createPiece(newColor);
            cell.appendChild(newPiece);
        }, 250);
    } else {
        // 如果没有棋子，直接创建新棋子
        const newPiece = createPiece(newColor);
        cell.appendChild(newPiece);
    }
}

// 渲染棋盘
function renderBoard(updateCells) {
    const validSet = new Set();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isValidMove(row, col)) {
                validSet.add(`${row},${col}`);
            }
        }
    }

    // 如果传入 updateCells（Set<string>，如 "row,col"），只更新这些格子，否则全局渲染
    if (updateCells && updateCells.size) {
        document.querySelectorAll('#boardContainer [data-row][data-col]').forEach(cell => {
            cell.classList.remove('valid-move');
        });

        validSet.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            const cell = boardContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.add('valid-move');
        });

        updateCells.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            const cell = boardContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!cell) return;
            cell.innerHTML = '';

            if (gameState.board[row][col] !== null) {
                const piece = createPiece(gameState.board[row][col]);
                cell.appendChild(piece);
            }

            if (gameState.hints.some(hint => hint.row === row && hint.col === col)) {
                const hintMarker = document.createElement('div');
                hintMarker.className = 'absolute inset-0 flex items-center justify-center';
                hintMarker.innerHTML = `<div class="w-3 h-3 rounded-full bg-yellow-400 shadow-lg animate-pulse"></div>`;
                cell.appendChild(hintMarker);
            }

            if (gameState.aiThinking && gameState.aiBestMove && gameState.aiBestMove.row === row && gameState.aiBestMove.col === col) {
                const thinkingMarker = document.createElement('div');
                thinkingMarker.className = 'absolute inset-0 flex items-center justify-center';
                thinkingMarker.innerHTML = `<div class="w-4 h-4 rounded-full bg-blue-400 shadow-lg ai-thinking"></div>`;
                cell.appendChild(thinkingMarker);
            }
        });
        return;
    }

    // 全局渲染
    boardContainer.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'board-grid bg-board rounded-lg shadow-lg w-[min(80vw,500px)] h-[min(80vw,500px)] grid grid-cols-8 grid-rows-8';
    board.style.backgroundSize = `calc(100% / 8) calc(100% / 8)`;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.className = 'relative border border-boardLine/30 cursor-pointer transition-all duration-200 hover:bg-boardLine/20';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(row, col));

            if (gameState.board[row][col] !== null) {
                const piece = createPiece(gameState.board[row][col]);
                cell.appendChild(piece);
            }

            if (validSet.has(`${row},${col}`)) {
                cell.classList.add('valid-move');
            }

            if (gameState.hints.some(hint => hint.row === row && hint.col === col)) {
                const hintMarker = document.createElement('div');
                hintMarker.className = 'absolute inset-0 flex items-center justify-center';
                hintMarker.innerHTML = `<div class="w-3 h-3 rounded-full bg-yellow-400 shadow-lg animate-pulse"></div>`;
                cell.appendChild(hintMarker);
            }

            if (gameState.aiThinking && gameState.aiBestMove && gameState.aiBestMove.row === row && gameState.aiBestMove.col === col) {
                const thinkingMarker = document.createElement('div');
                thinkingMarker.className = 'absolute inset-0 flex items-center justify-center';
                thinkingMarker.innerHTML = `<div class="w-4 h-4 rounded-full bg-blue-400 shadow-lg ai-thinking"></div>`;
                cell.appendChild(thinkingMarker);
            }

            board.appendChild(cell);
        }
    }
    boardContainer.appendChild(board);
}

// 检查游戏是否结束
function isGameOver() {
    // 如果棋盘已满，游戏结束
    let emptyCells = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (gameState.board[row][col] === null) {
                emptyCells++;
            }
        }
    }

    if (emptyCells === 0) {
        return true;
    }

    // 如果双方都没有有效移动，游戏结束
    const currentPlayerHasMoves = hasValidMoves();
    switchPlayer();
    const otherPlayerHasMoves = hasValidMoves();
    switchPlayer(); // 切回当前玩家

    return !currentPlayerHasMoves && !otherPlayerHasMoves;
}

// 极小极大算法，带Alpha-Beta剪枝
function minimax(board, depth, alpha, beta, isMaximizing, player) {
    const boardCopy = board.map(row => [...row]);
    const originalBoard = gameState.board;
    gameState.board = boardCopy;

    if (depth === 0 || isGameOver()) {
        gameState.board = originalBoard;
        return evaluateBoard(boardCopy, gameState.aiPlayer);
    }

    const validMoves = getAllValidMoves();

    if (validMoves.length === 0) {
        const opponent = player === 1 ? 0 : 1;
        return minimax(boardCopy, depth - 1, alpha, beta, !isMaximizing, opponent);
    }

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (const move of validMoves) {
            gameState.board[move.row][move.col] = player;
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            for (const [dx, dy] of directions) {
                const flippedPieces = getFlippedPiecesInDirection(move.row, move.col, dx, dy);
                for (const { r, c } of flippedPieces) {
                    gameState.board[r][c] = player;
                }
            }
            const opponent = player === 1 ? 0 : 1;
            const score = minimax(gameState.board, depth - 1, alpha, beta, false, opponent);
            gameState.board = boardCopy.map(row => [...row]);
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);

            if (beta <= alpha) {
                break;
            }
        }
        gameState.board = originalBoard;
        return maxScore;
    } else {
        let minScore = Infinity;
        for (const move of validMoves) {
            gameState.board[move.row][move.col] = player;
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            for (const [dx, dy] of directions) {
                const flippedPieces = getFlippedPiecesInDirection(move.row, move.col, dx, dy);
                for (const { r, c } of flippedPieces) {
                    gameState.board[r][c] = player;
                }
            }
            const opponent = player === 1 ? 0 : 1;
            const score = minimax(gameState.board, depth - 1, alpha, beta, true, opponent);
            gameState.board = boardCopy.map(row => [...row]);
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            if (beta <= alpha) {
                break;
            }
        }
        gameState.board = originalBoard;
        return minScore;
    }
}
