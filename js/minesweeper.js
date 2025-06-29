const numberColors = [
    '', // 0
    'text-blue-600',      // 1
    'text-green-600',     // 2
    'text-red-600',       // 3
    'text-indigo-700',    // 4
    'text-pink-700',      // 5
    'text-cyan-700',      // 6
    'text-black',         // 7
    'text-gray-700'       // 8
];

document.addEventListener('DOMContentLoaded', () => {
    // 游戏状态
    let gameState = {
        rows: 9,
        cols: 9,
        mines: 10,
        revealed: 0,
        flagged: 0,
        gameOver: false,
        started: false,
        board: [],
        mineLocations: new Set(),
        timer: null,
        timeElapsed: 0,
        mouseDown: {
            left: false,
            right: false,
            row: -1,
            col: -1
        }
    };

    // DOM 元素
    const gameBoard = document.getElementById('game-board');
    const minesCountEl = document.getElementById('mines-count');
    const timerEl = document.getElementById('timer');
    const resetBtn = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty');
    const victoryModal = document.getElementById('victory-modal');
    const victoryTimeEl = document.getElementById('victory-time');
    const newGameBtn = document.getElementById('new-game-btn');

    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        gameState.revealed = 0;
        gameState.flagged = 0;
        gameState.gameOver = false;
        gameState.started = false;
        gameState.board = [];
        gameState.mineLocations = new Set();
        gameState.mouseDown = {
            left: false,
            right: false,
            row: -1,
            col: -1
        };
        
        // 停止计时器
        if (gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
        }
        gameState.timeElapsed = 0;
        timerEl.textContent = '0';
        
        // 设置地雷数量显示
        minesCountEl.textContent = gameState.mines;
        
        // 创建游戏板
        createBoard();

        // 修复：初始化时要确保胜利提示层隐藏
        if (victoryModal) {
            victoryModal.classList.add('hidden');
            // 保证动画状态复原
            const msg = victoryModal.querySelector('.victory-message');
            if (msg) {
                msg.classList.remove('scale-95', 'scale-100');
            }
        }
    }

    // 创建游戏板
    function createBoard() {
        // 设置网格列数
        gameBoard.style.setProperty('--grid-cols', gameState.cols);
        gameBoard.innerHTML = '';
        
        // 初始化游戏板数据结构
        for (let row = 0; row < gameState.rows; row++) {
            gameState.board[row] = [];
            for (let col = 0; col < gameState.cols; col++) {
                gameState.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
                
                // 创建单元格元素
                const cell = document.createElement('div');
                cell.className = 'cell-size bg-gray-200 shadow-cell flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-gray-300';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 添加鼠标事件
                cell.addEventListener('mousedown', (e) => handleMouseDown(e, row, col));
                cell.addEventListener('mouseup', (e) => handleMouseUp(e, row, col));
                cell.addEventListener('mouseleave', () => handleMouseLeave(row, col));
                
                // 添加右键菜单禁用
                cell.addEventListener('contextmenu', (e) => e.preventDefault());
                
                gameBoard.appendChild(cell);
            }
        }
    }

    // 随机放置地雷
    function placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < gameState.mines) {
            const row = Math.floor(Math.random() * gameState.rows);
            const col = Math.floor(Math.random() * gameState.cols);
            
            // 确保不在第一次点击的位置及其相邻位置放置地雷
            const isFirstCellOrNeighbor = 
                (row === firstRow && col === firstCol) ||
                (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1);
            
            if (!gameState.board[row][col].isMine && !isFirstCellOrNeighbor) {
                gameState.board[row][col].isMine = true;
                gameState.mineLocations.add(`${row},${col}`);
                minesPlaced++;
            }
        }
        
        // 计算每个单元格周围的地雷数
        calculateNeighborMines();
    }

    // 计算每个单元格周围的地雷数
    function calculateNeighborMines() {
        for (let row = 0; row < gameState.rows; row++) {
            for (let col = 0; col < gameState.cols; col++) {
                if (gameState.board[row][col].isMine) continue;
                
                let count = 0;
                // 检查周围的8个方向
                for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                        if (r === row && c === col) continue;
                        if (gameState.board[r][c].isMine) {
                            count++;
                        }
                    }
                }
                
                gameState.board[row][col].neighborMines = count;
            }
        }
    }

    // --- 修复同时按左右键功能 ---
    let bothMouseDown = false;

    function handleMouseDown(e, row, col) {
        if (gameState.gameOver || gameState.board[row][col].isRevealed) return;
        if (e.button === 0) gameState.mouseDown.left = true;
        else if (e.button === 2) gameState.mouseDown.right = true;
        gameState.mouseDown.row = row;
        gameState.mouseDown.col = col;

        // 检查是否同时按下左右键
        if (gameState.mouseDown.left && gameState.mouseDown.right) {
            bothMouseDown = true;
            highlightNeighbors(row, col);
        }

        if (!gameState.started && e.button === 0) {
            gameState.started = true;
            placeMines(row, col);
            startTimer();
        }
        if (!bothMouseDown && e.button === 0 && !gameState.board[row][col].isFlagged) {
            const cell = gameBoard.children[row * gameState.cols + col];
            cell.classList.add('cell-pressed');
        }
    }

    function handleMouseUp(e, row, col) {
        if (gameState.gameOver) return;
        const cell = gameBoard.children[row * gameState.cols + col];
        cell.classList.remove('cell-pressed');
        resetHighlightedNeighbors();

        // 检查是否是左右键同时释放
        const wasBothButtonsDown = bothMouseDown;
        bothMouseDown = false;

        if (e.button === 0) {
            gameState.mouseDown.left = false;
            if (!wasBothButtonsDown && !gameState.board[row][col].isFlagged && !gameState.board[row][col].isRevealed) {
                handleCellClick(row, col);
            }
        } else if (e.button === 2) {
            gameState.mouseDown.right = false;
            if (!wasBothButtonsDown && !gameState.board[row][col].isRevealed) {
                handleRightClick(row, col);
            }
        }
        // 同时按下左右键后释放，且在数字格上
        if (wasBothButtonsDown &&
            gameState.board[row][col].isRevealed &&
            gameState.board[row][col].neighborMines > 0) {
            handleChording(row, col);
        }
        gameState.mouseDown.row = -1;
        gameState.mouseDown.col = -1;
    }

    function handleMouseLeave(row, col) {
        if (gameState.gameOver) return;
        const cell = gameBoard.children[row * gameState.cols + col];
        cell.classList.remove('cell-pressed');
        if (bothMouseDown) {
            resetHighlightedNeighbors();
        }
    }

    // 处理单元格点击
    function handleCellClick(row, col) {
        // 如果游戏已结束或单元格已被揭示/标记，则不执行任何操作
        if (gameState.gameOver || gameState.board[row][col].isRevealed || gameState.board[row][col].isFlagged) {
            return;
        }
        
        const cell = gameBoard.children[row * gameState.cols + col];
        
        // 如果点击到地雷，游戏结束
        if (gameState.board[row][col].isMine) {
            endGame(false);
            return;
        }
        
        // 揭示单元格
        revealCell(row, col, cell);
        
        // 检查是否获胜
        checkWin();
    }

    // 处理右键点击（标记地雷）
    function handleRightClick(row, col) {
        // 如果游戏已结束或单元格已被揭示，则不执行任何操作
        if (gameState.gameOver || gameState.board[row][col].isRevealed) {
            return;
        }
        
        // 如果游戏还未开始，右键点击开始游戏
        if (!gameState.started) {
            gameState.started = true;
            placeMines(-1, -1); // -1表示随机放置，不考虑第一次点击位置
            startTimer();
        }
        
        const cell = gameBoard.children[row * gameState.cols + col];
        const cellData = gameState.board[row][col];
        
        // 切换标记状态
        if (cellData.isFlagged) {
            cellData.isFlagged = false;
            gameState.flagged--;
            cell.innerHTML = '';
            cell.className = 'cell-size bg-gray-200 shadow-cell flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-gray-300';
        } else {
            cellData.isFlagged = true;
            gameState.flagged++;
            cell.innerHTML = '<i class="fa fa-flag text-danger"></i>';
            cell.className = 'cell-size bg-gray-200 shadow-cell flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-gray-300';
        }
        
        // 更新剩余地雷数显示
        minesCountEl.textContent = gameState.mines - gameState.flagged;
        
        // 检查是否获胜
        checkWin();
    }

    // 处理左右键同时按下（数字格探测）
    function handleChording(row, col) {
        const cellData = gameState.board[row][col];
        
        // 如果不是已揭示的数字格，不执行任何操作
        if (!cellData.isRevealed || cellData.neighborMines === 0) {
            return;
        }
        
        // 计算周围已标记的地雷数
        let flaggedCount = 0;
        
        // 检查周围的8个方向
        for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                if (gameState.board[r][c].isFlagged) {
                    flaggedCount++;
                }
            }
        }
        
        // 如果已标记的地雷数等于当前格子的数字，则揭示周围未标记的格子
        if (flaggedCount === cellData.neighborMines) {
            // 检查周围的8个方向
            for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    
                    const neighborCell = gameBoard.children[r * gameState.cols + c];
                    
                    // 如果周围的格子没有被标记，则揭示它
                    if (!gameState.board[r][c].isFlagged) {
                        // 如果揭示到地雷，游戏结束
                        if (gameState.board[r][c].isMine) {
                            endGame(false);
                            return;
                        }
                        
                        // 揭示单元格
                        revealCell(r, c, neighborCell);
                    }
                }
            }
            
            // 检查是否获胜
            checkWin();
        }
    }

    // 高亮显示周围的格子
    function highlightNeighbors(row, col) {
        // 检查周围的8个方向
        for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                
                const neighborCell = gameBoard.children[r * gameState.cols + c];
                const neighborData = gameState.board[r][c];
                
                // 如果邻居格子未被揭示且未被标记
                if (!neighborData.isRevealed && !neighborData.isFlagged) {
                    neighborCell.classList.add('cell-pressed');
                }
            }
        }
    }

    // 重置高亮的邻居格子
    function resetHighlightedNeighbors() {
        // 如果没有同时按下左右键，不执行任何操作
        if (!(gameState.mouseDown.left && gameState.mouseDown.right)) {
            return;
        }
        
        const row = gameState.mouseDown.row;
        const col = gameState.mouseDown.col;
        
        // 如果行和列无效，不执行任何操作
        if (row < 0 || col < 0) {
            return;
        }
        
        // 检查周围的8个方向
        for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                
                const neighborCell = gameBoard.children[r * gameState.cols + c];
                neighborCell.classList.remove('cell-pressed');
            }
        }
    }

    // 揭示单元格
    function revealCell(row, col, cell) {
        const cellData = gameState.board[row][col];
        
        // 如果已经被揭示，则不执行任何操作
        if (cellData.isRevealed) return;
        
        // 标记为已揭示
        cellData.isRevealed = true;
        gameState.revealed++;
        
        // 更新UI
        cell.classList.remove('bg-gray-200', 'shadow-cell', 'hover:bg-gray-300', 'cell-pressed');
        cell.classList.add('revealed');
        
        // 如果是地雷
        if (cellData.isMine) {
            cell.innerHTML = '<i class="fa fa-bomb text-danger"></i>';
            return;
        }
        
        // 如果周围没有地雷，自动揭示周围的单元格
        if (cellData.neighborMines === 0) {
            // 检查周围的8个方向
            for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    const neighborCell = gameBoard.children[r * gameState.cols + c];
                    revealCell(r, c, neighborCell);
                }
            }
        } else {
            // 显示周围地雷数
            cell.innerHTML = `<span class="font-bold ${numberColors[cellData.neighborMines]}">${cellData.neighborMines}</span>`;
        }
    }

    // 开始计时器
    function startTimer() {
        gameState.timer = setInterval(() => {
            gameState.timeElapsed++;
            timerEl.textContent = gameState.timeElapsed;
        }, 1000);
    }

    // 结束游戏
    function endGame(isWin) {
        gameState.gameOver = true;
        clearInterval(gameState.timer);
        
        // 显示所有地雷
        gameState.mineLocations.forEach(location => {
            const [row, col] = location.split(',').map(Number);
            const cell = gameBoard.children[row * gameState.cols + col];
            
            if (!gameState.board[row][col].isFlagged) {
                cell.innerHTML = '<i class="fa fa-bomb text-danger"></i>';
                cell.classList.remove('bg-gray-200', 'shadow-cell', 'hover:bg-gray-300', 'cell-pressed');
                cell.classList.add('revealed');
            }
        });
        
        // 如果输了，显示错误标记的地雷
        if (!isWin) {
            for (let row = 0; row < gameState.rows; row++) {
                for (let col = 0; col < gameState.cols; col++) {
                    const cell = gameBoard.children[row * gameState.cols + col];
                    if (gameState.board[row][col].isFlagged && !gameState.board[row][col].isMine) {
                        cell.innerHTML = '<i class="fa fa-times text-warning"></i>';
                        cell.classList.remove('bg-gray-200', 'shadow-cell', 'hover:bg-gray-300', 'cell-pressed');
                        cell.classList.add('revealed', 'bg-warning/20');
                    }
                }
            }
        }
        
        // 显示游戏结果
        setTimeout(() => {
            const message = isWin ? '恭喜你赢了!' : '游戏结束，你踩到地雷了!';
            alert(message);
        }, 100);

        if (isWin) {
            victoryTimeEl.textContent = gameState.timeElapsed;
            victoryModal.classList.remove('hidden');
            victoryModal.querySelector('.victory-message').classList.add('scale-95');
            setTimeout(() => {
                victoryModal.querySelector('.victory-message').classList.remove('scale-95');
                victoryModal.querySelector('.victory-message').classList.add('scale-100');
            }, 10);
        }
    }

    newGameBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        victoryModal.classList.add('hidden');
        initGame();
    });

    // 难度选择变化
    difficultySelect.addEventListener('change', (e) => {
        const difficulty = e.target.value;
        
        switch (difficulty) {
            case 'easy':
                gameState.rows = 9;
                gameState.cols = 9;
                gameState.mines = 10;
                break;
            case 'medium':
                gameState.rows = 16;
                gameState.cols = 16;
                gameState.mines = 40;
                break;
            case 'hard':
                gameState.rows = 16;
                gameState.cols = 30;
                gameState.mines = 99;
                break;
        }
        
        initGame();
    });

    // 初始化游戏
    initGame();
});