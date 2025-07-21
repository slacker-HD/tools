// 获取 HTML 元素
const pvpModeBtn = document.getElementById('pvpModeBtn');
const pveModeBtn = document.getElementById('pveModeBtn');
const blackCount = document.getElementById('blackCount');
const whiteCount = document.getElementById('whiteCount');
const currentPlayerIndicator = document.getElementById('currentPlayerIndicator');
const currentPlayerText = document.getElementById('currentPlayerText');
const boardContainer = document.getElementById('boardContainer');
const gameMessage = document.getElementById('gameMessage');
const messageContent = document.getElementById('messageContent');
const newGameBtn = document.getElementById('newGameBtn');
const undoBtn = document.getElementById('undoBtn');
const gameOverModal = document.getElementById('gameOverModal');
const winnerIcon = document.getElementById('winnerIcon');
const gameOverMessage = document.getElementById('gameOverMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
// 游戏常量
const BOARD_SIZE = 19; // 修改棋盘大小为19x19
const CELL_PX = 32; // 每格32px，可根据需要调整
const BOARD_PX = CELL_PX * BOARD_SIZE; // 棋盘容器宽高
const PIECE_SIZE_RATIO = 0.85; // 棋子相对格子的比例（原为0.7）
const BLACK = 1;
const WHITE = 2;
// 游戏变量
let gameMode = 'pvp'; // 游戏模式，默认为玩家对战
let aiDifficultyLevel = 'medium'; // 默认中等难度
let currentPlayer = BLACK; // 当前玩家，默认为黑方
let board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0)); // 棋盘数组
let moveHistory = []; // 落子历史记录
// 初始化游戏
function initGame() {
    // 清空棋盘数组和落子历史记录
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
    moveHistory = [];
    // 清空棋盘容器（保留边框线）
    const boardLines = document.getElementById('boardLines');
    boardContainer.innerHTML = '';
    boardContainer.appendChild(boardLines);

    addInnerGridLines();
    addStarPoints();

    // 初始化棋子数量
    blackCount.textContent = 0;
    whiteCount.textContent = 0;
    // 设置当前玩家为黑方
    currentPlayer = BLACK;
    currentPlayerIndicator.classList.remove('piece-white');
    currentPlayerIndicator.classList.add('piece-black');
    currentPlayerText.textContent = '黑方';
    // 隐藏游戏消息和游戏结束模态框
    gameMessage.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    // 生成可落子区域
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('absolute', 'valid-move');
            cell.style.width = `${CELL_PX}px`;
            cell.style.height = `${CELL_PX}px`;
            cell.style.left = `${j * CELL_PX}px`;
            cell.style.top = `${i * CELL_PX}px`;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            boardContainer.appendChild(cell);
        }
    }
}

// 添加内部网格线（不延伸到边框外部）
function addInnerGridLines() {
    const boardLines = document.getElementById('boardLines');
    boardLines.innerHTML = `
    <div class="border-line" style="top:0; left:0; width:${BOARD_PX}px; height:2px;"></div>
    <div class="border-line" style="top:${BOARD_PX - 2}px; left:0; width:${BOARD_PX}px; height:2px;"></div>
    <div class="border-line" style="top:0; left:0; width:2px; height:${BOARD_PX}px;"></div>
    <div class="border-line" style="top:0; left:${BOARD_PX - 2}px; width:2px; height:${BOARD_PX}px;"></div>
`;

    // 水平线
    for (let i = 0; i < BOARD_SIZE; i++) {
        const hLine = document.createElement('div');
        hLine.className = 'absolute bg-boardLine';
        hLine.style.height = '1px';
        hLine.style.width = `${CELL_PX * (BOARD_SIZE - 1)}px`;
        hLine.style.left = `${CELL_PX / 2}px`;
        hLine.style.top = `${i * CELL_PX + CELL_PX / 2}px`;
        boardLines.appendChild(hLine);
    }

    // 垂直线
    for (let i = 0; i < BOARD_SIZE; i++) {
        const vLine = document.createElement('div');
        vLine.className = 'absolute bg-boardLine';
        vLine.style.width = '1px';
        vLine.style.height = `${CELL_PX * (BOARD_SIZE - 1)}px`;
        vLine.style.top = `${CELL_PX / 2}px`;
        vLine.style.left = `${i * CELL_PX + CELL_PX / 2}px`;
        boardLines.appendChild(vLine);
    }
}

// 添加星位点（标准19路棋盘位置）
function addStarPoints() {
    // 标准19路棋盘星位坐标（对应第4、10、16路交叉点）
    const starPositions = [
        { x: 3, y: 3 },   // (4,4)
        { x: 9, y: 3 },   // (10,4)
        { x: 15, y: 3 },  // (16,4)
        { x: 3, y: 9 },   // (4,10)
        { x: 9, y: 9 },   // (10,10)
        { x: 15, y: 9 },  // (16,10)
        { x: 3, y: 15 },  // (4,16)
        { x: 9, y: 15 },  // (10,16)
        { x: 15, y: 15 }  // (16,16)
    ];

    starPositions.forEach(pos => {
        const mark = document.createElement('div');
        mark.className = 'board-mark';
        mark.style.left = `${pos.x * CELL_PX + CELL_PX / 2}px`;
        mark.style.top = `${pos.y * CELL_PX + CELL_PX / 2}px`;
        mark.style.width = `${CELL_PX * 0.3}px`;
        mark.style.height = `${CELL_PX * 0.3}px`;
        boardContainer.appendChild(mark);
    });
}

// 处理格子点击事件
function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    // 检查该位置是否可以落子
    if (board[row][col] === 0) {
        makeMove(row, col);
        // 如果是人机对战且当前轮到 AI 下棋
        if (gameMode === 'pve' && currentPlayer === WHITE) {
            // 显示思考中消息
            showMessage('AI正在思考...');
            setTimeout(() => {
                hideMessage();
                aiMakeMove();
            }, 800);
        }
    }
}

// 落子
function makeMove(row, col) {
    // 在棋盘数组中记录落子
    board[row][col] = currentPlayer;
    // 添加落子历史记录
    moveHistory.push({ row, col, player: currentPlayer });
    // 更新棋子数量
    if (currentPlayer === BLACK) {
        blackCount.textContent = parseInt(blackCount.textContent) + 1;
    } else {
        whiteCount.textContent = parseInt(whiteCount.textContent) + 1;
    }
    // 创建棋子元素
    const piece = document.createElement('div');
    piece.classList.add('absolute', 'rounded-full');
    piece.style.width = `${CELL_PX * PIECE_SIZE_RATIO}px`;
    piece.style.height = `${CELL_PX * PIECE_SIZE_RATIO}px`;
    piece.style.left = `${col * CELL_PX + CELL_PX / 2 - (CELL_PX * PIECE_SIZE_RATIO) / 2}px`;
    piece.style.top = `${row * CELL_PX + CELL_PX / 2 - (CELL_PX * PIECE_SIZE_RATIO) / 2}px`;
    if (currentPlayer === BLACK) {
        piece.classList.add('piece-black');
    } else {
        piece.classList.add('piece-white');
    }
    // 添加动画效果
    piece.style.transform = 'scale(0)';
    boardContainer.appendChild(piece);
    setTimeout(() => {
        piece.style.transform = 'scale(1)';
    }, 50);
    // 检查是否获胜
    if (checkWin(row, col, currentPlayer)) {
        showGameOverMessage(`${currentPlayer === BLACK ? '黑方' : '白方'} 获胜！`);
    } else if (isBoardFull()) {
        showGameOverMessage('游戏平局！');
    } else {
        // 切换玩家
        currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
        currentPlayerIndicator.classList.toggle('piece-black');
        currentPlayerIndicator.classList.toggle('piece-white');
        currentPlayerText.textContent = currentPlayer === BLACK ? '黑方' : '白方';
    }
}

// AI 落子
function aiMakeMove() {
    let bestMove = { row: -1, col: -1 };
    if (aiDifficultyLevel === 'easy') {
        // 简单难度：随机落子，但会优先选择有威胁的位置
        const threateningMoves = findThreateningMoves();
        if (threateningMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * threateningMoves.length);
            bestMove = threateningMoves[randomIndex];
        } else {
            while (true) {
                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);
                if (board[row][col] === 0) {
                    bestMove = { row, col };
                    break;
                }
            }
        }
    } else if (aiDifficultyLevel === 'medium') {
        // 中等难度：简单的启发式算法，考虑进攻和防守
        let maxScore = -Infinity;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === 0) {
                    // 评估AI自己落子的得分（进攻）
                    const offensiveScore = evaluateMove(i, j, WHITE);
                    // 评估玩家落子的得分（防守）
                    const defensiveScore = evaluateMove(i, j, BLACK);
                    // 综合考虑进攻和防守
                    const score = Math.max(offensiveScore, defensiveScore * 0.8);
                    if (score > maxScore) {
                        maxScore = score;
                        bestMove = { row: i, col: j };
                    }
                }
            }
        }
    } else if (aiDifficultyLevel === 'hard') {
        // 困难难度：使用极小化极大算法配合Alpha-Beta剪枝
        const depth = 3; // 搜索深度
        let bestScore = -Infinity;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === 0) {
                    board[i][j] = WHITE;
                    const score = minimax(board, depth, -Infinity, Infinity, false);
                    board[i][j] = 0;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row: i, col: j };
                    }
                }
            }
        }
    }
    makeMove(bestMove.row, bestMove.col);
}

// 寻找有威胁的位置（连续三个同色棋子）
function findThreateningMoves() {
    const moves = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 0) {
                // 模拟AI在此处落子
                board[i][j] = WHITE;
                if (evaluateMove(i, j, WHITE) >= 100) { // 三个连续棋子的得分
                    moves.push({ row: i, col: j });
                }
                board[i][j] = 0;
                // 模拟玩家在此处落子
                board[i][j] = BLACK;
                if (evaluateMove(i, j, BLACK) >= 100) { // 三个连续棋子的得分
                    moves.push({ row: i, col: j });
                }
                board[i][j] = 0;
            }
        }
    }
    return moves;
}

// 评估落子得分
function evaluateMove(row, col, player) {
    let score = 0;
    // 检查横、竖、斜方向上的连子情况
    const directions = [
        [1, 0], // 水平方向
        [0, 1], // 垂直方向
        [1, 1], // 正斜方向
        [1, -1] // 反斜方向
    ];
    for (const [dx, dy] of directions) {
        let count = 1; // 当前位置已经有一个棋子
        let blockedEnds = 0; // 被阻挡的端点数量
        // 正向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                if (board[newRow][newCol] === player) {
                    count++;
                } else if (board[newRow][newCol] !== 0) {
                    blockedEnds++;
                    break;
                } else {
                    break;
                }
            } else {
                blockedEnds++;
                break;
            }
        }
        // 反向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row - i * dx;
            const newCol = col - i * dy;
            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                if (board[newRow][newCol] === player) {
                    count++;
                } else if (board[newRow][newCol] !== 0) {
                    blockedEnds++;
                    break;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        // 根据连子数量和被阻挡情况计算得分
        if (count === 5) {
            score += 100000; // 五连
        } else if (count === 4 && blockedEnds === 0) {
            score += 10000; // 活四
        } else if (count === 4 && blockedEnds === 1) {
            score += 1000; // 冲四
        } else if (count === 3 && blockedEnds === 0) {
            score += 100; // 活三
        } else if (count === 3 && blockedEnds === 1) {
            score += 10; // 眠三
        } else if (count === 2 && blockedEnds === 0) {
            score += 5; // 活二
        }
    }
    // 额外奖励：中心位置
    const centerDistance = Math.sqrt(Math.pow(row - (BOARD_SIZE - 1) / 2, 2) +
        Math.pow(col - (BOARD_SIZE - 1) / 2, 2));
    const centerBonus = Math.max(0, 10 - centerDistance * 0.5);
    score += centerBonus;
    return score;
}

// 极小化极大算法配合Alpha-Beta剪枝
function minimax(board, depth, alpha, beta, isMaximizingPlayer) {
    // 检查游戏是否结束或达到最大搜索深度
    if (depth === 0) {
        return evaluateBoard();
    }
    if (isMaximizingPlayer) {
        let maxScore = -Infinity;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === 0) {
                    board[i][j] = WHITE; // AI是白方
                    const score = minimax(board, depth - 1, alpha, beta, false);
                    board[i][j] = 0;
                    maxScore = Math.max(maxScore, score);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) {
                        break; // Beta剪枝
                    }
                }
            }
            if (beta <= alpha) {
                break;
            }
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === 0) {
                    board[i][j] = BLACK; // 玩家是黑方
                    const score = minimax(board, depth - 1, alpha, beta, true);
                    board[i][j] = 0;
                    minScore = Math.min(minScore, score);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) {
                        break; // Alpha剪枝
                    }
                }
            }
            if (beta <= alpha) {
                break;
            }
        }
        return minScore;
    }
}

// 评估整个棋盘状态
function evaluateBoard() {
    let score = 0;
    // 评估AI（白方）的得分
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === WHITE) {
                score += evaluateMove(i, j, WHITE);
            } else if (board[i][j] === BLACK) {
                score -= evaluateMove(i, j, BLACK);
            }
        }
    }
    return score;
}

// 检查是否获胜
function checkWin(row, col, player) {
    const directions = [
        [1, 0], // 水平方向
        [0, 1], // 垂直方向
        [1, 1], // 正斜方向
        [1, -1] // 反斜方向
    ];
    for (const [dx, dy] of directions) {
        let count = 1; // 当前位置已经有一个棋子
        // 正向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                if (board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        // 反向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row - i * dx;
            const newCol = col - i * dy;
            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                if (board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
    }
    return false;
}

// 检查棋盘是否已满
function isBoardFull() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 0) {
                return false;
            }
        }
    }
    return true;
}

// 显示游戏消息
function showMessage(message) {
    messageContent.textContent = message;
    gameMessage.classList.remove('hidden');
    // 3秒后自动隐藏消息
    setTimeout(hideMessage, 3000);
}

// 隐藏游戏消息
function hideMessage() {
    gameMessage.classList.add('hidden');
}

// 显示游戏结束消息
function showGameOverMessage(message) {
    gameOverMessage.textContent = message;
    gameOverModal.classList.remove('hidden');
}

// 悔棋功能
function undoMove() {
    if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop();
        board[lastMove.row][lastMove.col] = 0;

        // 更新棋子数量
        if (lastMove.player === BLACK) {
            blackCount.textContent = parseInt(blackCount.textContent) - 1;
        } else {
            whiteCount.textContent = parseInt(whiteCount.textContent) - 1;
        }

        // 移除最后放置的棋子元素
        const pieces = boardContainer.querySelectorAll('.piece-black, .piece-white');
        if (pieces.length > 0) {
            const lastPiece = pieces[pieces.length - 1];
            lastPiece.style.transform = 'scale(0)';
            setTimeout(() => {
                lastPiece.remove();
            }, 200);
        }

        // 切换回上一个玩家
        currentPlayer = lastMove.player;
        currentPlayerIndicator.classList.toggle('piece-black');
        currentPlayerIndicator.classList.toggle('piece-white');
        currentPlayerText.textContent = currentPlayer === BLACK ? '黑方' : '白方';
    }
}

// 事件监听器
pvpModeBtn.addEventListener('click', () => {
    gameMode = 'pvp';
    pvpModeBtn.classList.add('game-mode-btn-selected');
    pveModeBtn.classList.remove('game-mode-btn-selected');
    initGame();
});

pveModeBtn.addEventListener('click', () => {
    gameMode = 'pve';
    pveModeBtn.classList.add('game-mode-btn-selected');
    pvpModeBtn.classList.remove('game-mode-btn-selected');
    aiDifficultyLevel = 'medium'; // 人机对战直接设为中等难度
    initGame();
});

newGameBtn.addEventListener('click', initGame);
undoBtn.addEventListener('click', undoMove);
playAgainBtn.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    initGame();
});

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);