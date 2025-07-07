// 定义变量
const gameState = {
    board: [],
    currentPlayer: 1,
    gameOver: false,
    history: [],
    hints: [],
    aiThinking: false,
    aiBestMove: null,
    gameMode: 'pvp', // 默认模式
    aiPlayer: 0,
    aiDifficulty: 'medium'
};

const boardContainer = document.getElementById('boardContainer');
const gameMessage = document.getElementById('gameMessage');
const gameOverModal = document.getElementById('gameOverModal');
const blackCount = document.getElementById('blackCount');
const whiteCount = document.getElementById('whiteCount');
const currentPlayerIndicator = document.getElementById('currentPlayerIndicator');
const currentPlayerText = document.getElementById('currentPlayerText');
const blackPlayerLabel = document.getElementById('blackPlayerLabel');
const whitePlayerLabel = document.getElementById('whitePlayerLabel');
const finalBlackCount = document.getElementById('finalBlackCount');
const finalWhiteCount = document.getElementById('finalWhiteCount');
const gameOverMessage = document.getElementById('gameOverMessage');
const winnerIcon = document.getElementById('winnerIcon');
const playAgainBtn = document.getElementById('playAgainBtn');

// 为 playAgainBtn 添加点击事件，重新开始游戏
playAgainBtn.addEventListener('click', initGame);

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
    gameState.board[3][3] = 0; // 白
    gameState.board[3][4] = 1; // 黑
    gameState.board[4][3] = 1; // 黑
    gameState.board[4][4] = 0; // 白
    
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
    if (gameState.gameMode === 'pve' && gameState.currentPlayer === gameState.aiPlayer) {
        setTimeout(makeAIMove, 500);
    }
}

// 更新玩家标签
function updatePlayerLabels() {
    if (gameState.gameMode === 'pvp') {
        blackPlayerLabel.textContent = '黑方';
        whitePlayerLabel.textContent = '白方';
    } else {
        blackPlayerLabel.textContent = gameState.aiPlayer === 1 ? 'AI (黑)' : '玩家 (黑)';
        whitePlayerLabel.textContent = gameState.aiPlayer === 0 ? 'AI (白)' : '玩家 (白)';
    }
}

// 渲染棋盘
function renderBoard() {
    // 清空棋盘容器
    boardContainer.innerHTML = '';
    
    // 创建棋盘网格
    const board = document.createElement('div');
    board.className = 'board-grid bg-board rounded-lg shadow-lg w-[min(80vw,500px)] h-[min(80vw,500px)] grid grid-cols-8 grid-rows-8';
    board.style.backgroundSize = `calc(100% / 8) calc(100% / 8)`;
    
    // 添加单元格
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.className = 'relative border border-boardLine/30 cursor-pointer transition-all duration-200 hover:bg-boardLine/20';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 添加点击事件
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            // 如果有棋子，渲染棋子
            if (gameState.board[row][col] !== null) {
                const piece = createPiece(gameState.board[row][col]);
                cell.appendChild(piece);
            }
            
            // 如果是有效移动位置，添加标记
            if (isValidMove(row, col)) {
                cell.classList.add('valid-move');
            }
            
            // 如果是提示位置，添加提示标记
            if (gameState.hints.some(hint => hint.row === row && hint.col === col)) {
                const hintMarker = document.createElement('div');
                hintMarker.className = 'absolute inset-0 flex items-center justify-center';
                hintMarker.innerHTML = `<div class="w-3 h-3 rounded-full bg-yellow-400 shadow-lg animate-pulse"></div>`;
                cell.appendChild(hintMarker);
            }
            
            // 如果是AI思考中的最佳位置，添加思考标记
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
    saveHistory();
    
    // 放置棋子
    placePiece(row, col);
    
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
    
    // 更新游戏状态
    updateGameState();
    
    // 如果是人机模式且轮到AI，让AI走一步
    if (gameState.gameMode === 'pve' && gameState.currentPlayer === gameState.aiPlayer) {
        setTimeout(makeAIMove, 500);
    }
}

// 放置棋子并翻转对手的棋子
function placePiece(row, col) {
    // 放置当前玩家的棋子
    gameState.board[row][col] = gameState.currentPlayer;
    
    // 获取所有需要翻转的方向
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1],  [1, 0], [1, 1]
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

// 检查是否是有效移动
function isValidMove(row, col) {
    // 检查位置是否已被占用
    if (gameState.board[row][col] !== null) {
        return false;
    }
    
    // 获取所有可能的方向
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1],  [1, 0], [1, 1]
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

// 检查当前玩家是否有有效移动
function hasValidMoves() {
    return getAllValidMoves().length > 0;
}

// 切换玩家
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 0 : 1;
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

// 更新游戏状态显示
function updateGameState() {
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
    
    // 重新渲染棋盘以显示有效移动标记
    renderBoard();
}

// 获取玩家名称
function getPlayerName(player) {
    if (gameState.gameMode === 'pvp') {
        return player === 1 ? '黑方' : '白方';
    } else {
        return player === gameState.aiPlayer ? 'AI' : '玩家';
    }
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

// AI 移动
function makeAIMove() {
    if (gameState.gameOver || gameState.currentPlayer !== gameState.aiPlayer) {
        return;
    }
    
    showMessage('AI正在思考...', 'info');
    
    // 模拟AI思考时间
    const thinkingTime = Math.random() * 1000 + 500; // 500-1500ms
    
    // 清空提示
    gameState.hints = [];
    
    // 显示AI思考动画
    gameState.aiThinking = true;
    
    setTimeout(() => {
        let bestMove;
        
        // 根据AI难度选择不同的策略
        if (gameState.aiDifficulty === 'easy') {
            bestMove = makeEasyAIMove();
        } else if (gameState.aiDifficulty === 'hard') {
            bestMove = makeHardAIMove();
        } else {
            // 默认使用中等难度
            bestMove = makeMediumAIMove();
        }
        
        // 隐藏AI思考动画
        gameState.aiThinking = false;
        
        if (bestMove) {
            // 保存当前状态用于悔棋
            saveHistory();
            
            // 放置棋子
            placePiece(bestMove.row, bestMove.col);
            
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
            
            // 更新游戏状态
            updateGameState();
        } else {
            showMessage('AI没有有效移动，自动跳过', 'info');
            switchPlayer();
            
            // 检查游戏是否结束
            if (isGameOver()) {
                gameState.gameOver = true;
                showGameOverModal();
                return;
            }
            
            // 更新游戏状态
            updateGameState();
        }
    }, thinkingTime);
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
            [0, -1],         [0, 1],
            [1, -1],  [1, 0], [1, 1]
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
            [0, -1],         [0, 1],
            [1, -1],  [1, 0], [1, 1]
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
                [0, -1],         [0, 1],
                [1, -1],  [1, 0], [1, 1]
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
                [0, -1],         [0, 1],
                [1, -1],  [1, 0], [1, 1]
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

// 保存当前状态用于悔棋
function saveHistory() {
    const boardCopy = gameState.board.map(row => [...row]);
    gameState.history.push({
        board: boardCopy,
        currentPlayer: gameState.currentPlayer
    });
}

// 悔棋
function undoMove() {
    if (gameState.history.length === 0) {
        showMessage('无法再撤销更多步骤', 'warning');
        return;
    }
    
    const lastState = gameState.history.pop();
    gameState.board = lastState.board;
    gameState.currentPlayer = lastState.currentPlayer;
    
    // 清除提示
    gameState.hints = [];
    
    // 更新游戏状态
    updateGameState();
}

// 显示提示
function showHint() {
    if (gameState.gameOver) {
        showMessage('游戏已结束，无法使用提示', 'warning');
        return;
    }
    
    if (gameState.gameMode === 'pve' && gameState.currentPlayer === gameState.aiPlayer) {
        showMessage('请等待AI思考...', 'info');
        return;
    }
    
    const validMoves = getAllValidMoves();
    
    if (validMoves.length === 0) {
        showMessage('没有可用的有效移动', 'info');
        return;
    }
    
    // 简单策略：优先选择角落位置
    const corners = [
        { row: 0, col: 0 },
        { row: 0, col: 7 },
        { row: 7, col: 0 },
        { row: 7, col: 7 }
    ];
    
    // 检查是否有角落位置可以选择
    const cornerMoves = validMoves.filter(move => 
        corners.some(corner => corner.row === move.row && corner.col === move.col)
    );
    
    if (cornerMoves.length > 0) {
        // 随机选择一个角落位置
        const randomCorner = cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
        gameState.hints = [randomCorner];
        showMessage('提示：角落位置通常是最佳选择', 'info');
        renderBoard();
        return;
    }
    
    // 如果没有角落位置，选择边缘位置
    const edges = [];
    for (let i = 0; i < 8; i++) {
        edges.push({ row: 0, col: i });
        edges.push({ row: 7, col: i });
        edges.push({ row: i, col: 0 });
        edges.push({ row: i, col: 7 });
    }
    
    const edgeMoves = validMoves.filter(move => 
        edges.some(edge => edge.row === move.row && edge.col === move.col)
    );
    
    if (edgeMoves.length > 0) {
        // 随机选择一个边缘位置
        const randomEdge = edgeMoves[Math.floor(Math.random() * edgeMoves.length)];
        gameState.hints = [randomEdge];
        showMessage('提示：边缘位置通常比中间位置更好', 'info');
        renderBoard();
        return;
    }
    
    // 如果没有边缘位置，随机选择一个有效移动
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    gameState.hints = [randomMove];
    showMessage('提示：这是一个可能的有效移动', 'info');
    renderBoard();
}

// 为悔棋和提示按钮添加点击事件
document.getElementById('undoBtn').addEventListener('click', undoMove);
document.getElementById('hintBtn').addEventListener('click', showHint);

// 为游戏模式和AI难度按钮添加点击事件
document.getElementById('pvpModeBtn').addEventListener('click', function () {
    gameState.gameMode = 'pvp';
    updatePlayerLabels();
    initGame();
});

document.getElementById('pveModeBtn').addEventListener('click', function () {
    gameState.gameMode = 'pve';
    updatePlayerLabels();
    initGame();
});

document.getElementById('easyAIBtn').addEventListener('click', function () {
    gameState.aiDifficulty = 'easy';
});

document.getElementById('mediumAIBtn').addEventListener('click', function () {
    gameState.aiDifficulty = 'medium';
});

document.getElementById('hardAIBtn').addEventListener('click', function () {
    gameState.aiDifficulty = 'hard';
});

// 在DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function () {
    initGame();
});

// 修正模式按钮焦点与选中样式
document.addEventListener('DOMContentLoaded', function () {
    const pvpBtn = document.getElementById('pvpModeBtn');
    const pveBtn = document.getElementById('pveModeBtn');
    const aiDiff = document.getElementById('aiDifficulty');

    // 默认高亮 pvp 模式
    updateButtonState(pvpBtn, true);
    updateButtonState(pveBtn, false);
    aiDiff.classList.add('hidden');

    // 游戏模式切换逻辑
    [pvpBtn, pveBtn].forEach(btn => btn.addEventListener('click', function () {
        if (this === pvpBtn) {
            updateButtonState(pvpBtn, true);
            updateButtonState(pveBtn, false);
            aiDiff.classList.add('hidden');
        } else {
            updateButtonState(pveBtn, true);
            updateButtonState(pvpBtn, false);
            aiDiff.classList.remove('hidden');
        }
    }));

    // AI 难度选择逻辑
    const aiButtons = [document.getElementById('easyAIBtn'), document.getElementById('mediumAIBtn'), document.getElementById('hardAIBtn')];
    aiButtons.forEach((btn, index) => btn.addEventListener('click', function () {
        aiButtons.forEach(b => updateButtonState(b, false));
        updateButtonState(this, true);
    }));
});

// 更新按钮状态的通用函数
function updateButtonState(button, isSelected) {
    button.classList.toggle('game-mode-btn-selected', isSelected);
    button.classList.toggle('game-mode-btn', !isSelected);
}

// 修复再玩一次按钮样式
document.getElementById('playAgainBtn').style.background = 'linear-gradient(135deg, #4a90e2, #1c4587)';
document.getElementById('playAgainBtn').style.color = 'white';
document.getElementById('playAgainBtn').style.border = 'none';
