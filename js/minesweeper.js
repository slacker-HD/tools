        // 游戏状态
        const gameState = {
            rows: 9,
            cols: 9,
            mines: 10,
            board: [],
            revealed: [],
            flagged: [],
            questioned: [],
            gameStarted: false,
            gameOver: false,
            win: false,
            timer: 0,
            timerInterval: null,
            minesLeft: 10,
            currentPress: null // 记录当前按下的格子
        };

        // DOM元素
        let elements = {};

        // 初始化游戏
        function initGame() {
            // 获取DOM元素
            elements = {
                gameBoard: document.getElementById('game-board'),
                minesCount: document.getElementById('mines-count'),
                timer: document.getElementById('timer'),
                resetBtn: document.getElementById('reset-btn'),
                difficultySelect: document.getElementById('difficulty'),
                victoryModal: document.getElementById('victory-modal'),
                victoryTime: document.getElementById('victory-time'),
                newGameBtn: document.getElementById('new-game-btn'),
                gameContainer: document.getElementById('game-container')
            };

            // 重置游戏状态
            clearInterval(gameState.timerInterval);
            gameState.gameStarted = false;
            gameState.gameOver = false;
            gameState.win = false;
            gameState.timer = 0;
            gameState.minesLeft = gameState.mines;
            gameState.currentPress = null;

            // 更新UI
            elements.timer.textContent = '0';
            elements.minesCount.textContent = gameState.minesLeft;
            if (elements.victoryModal) {
                elements.victoryModal.classList.add('hidden');
            }
            
            // 设置网格行列数的CSS变量
            elements.gameBoard.style.setProperty('--grid-cols', gameState.cols);
            
            // 根据难度调整字体大小
            updateFontSize();

            // 创建并渲染游戏板
            createBoard();
            renderBoard();

            // 确保新游戏按钮有事件监听
            elements.newGameBtn.addEventListener('click', initGame);
            
            // 监听窗口大小变化
            window.addEventListener('resize', renderBoard);
        }

        // 根据难度调整字体大小
        function updateFontSize() {
            const gameContainer = elements.gameContainer;
            if (gameState.cols >= 30) {
                gameContainer.classList.add('text-xs');
                gameContainer.classList.remove('text-sm', 'text-base');
            } else if (gameState.cols >= 16) {
                gameContainer.classList.add('text-sm');
                gameContainer.classList.remove('text-xs', 'text-base');
            } else {
                gameContainer.classList.add('text-base');
                gameContainer.classList.remove('text-xs', 'text-sm');
            }
        }

        // 创建游戏板
        function createBoard() {
            gameState.board = Array(gameState.rows).fill().map(() => Array(gameState.cols).fill(0));
            gameState.revealed = Array(gameState.rows).fill().map(() => Array(gameState.cols).fill(false));
            gameState.flagged = Array(gameState.rows).fill().map(() => Array(gameState.cols).fill(false));
            gameState.questioned = Array(gameState.rows).fill().map(() => Array(gameState.cols).fill(false));

            // 随机放置地雷
            placeMines();

            // 计算周围地雷数
            calculateNumbers();
        }

        // 放置地雷
        function placeMines() {
            let minesPlaced = 0;
            while (minesPlaced < gameState.mines) {
                const row = Math.floor(Math.random() * gameState.rows);
                const col = Math.floor(Math.random() * gameState.cols);

                if (gameState.board[row][col] !== 'M') {
                    gameState.board[row][col] = 'M';
                    minesPlaced++;
                }
            }
        }

        // 计算每个格子周围的地雷数
        function calculateNumbers() {
            for (let i = 0; i < gameState.rows; i++) {
                for (let j = 0; j < gameState.cols; j++) {
                    if (gameState.board[i][j] === 'M') continue;

                    let count = 0;
                    // 检查周围的8个格子
                    for (let x = Math.max(0, i - 1); x <= Math.min(gameState.rows - 1, i + 1); x++) {
                        for (let y = Math.max(0, j - 1); y <= Math.min(gameState.cols - 1, j + 1); y++) {
                            if (gameState.board[x][y] === 'M') {
                                count++;
                            }
                        }
                    }

                    gameState.board[i][j] = count;
                }
            }
        }

        // 渲染游戏板
        function renderBoard() {
            elements.gameBoard.innerHTML = '';
            
            // 设置网格行列数的CSS变量
            elements.gameBoard.style.setProperty('--grid-cols', gameState.cols);

            for (let i = 0; i < gameState.rows; i++) {
                for (let j = 0; j < gameState.cols; j++) {
                    const cell = document.createElement('div');
                    const fontSize = gameState.cols >= 30 ? 'text-xs' : gameState.cols >= 16 ? 'text-sm' : 'text-base';
                    cell.classList.add('cell-size', 'shadow-cell', 'flex', 'items-center', 'justify-center', 'font-bold', fontSize);
                    cell.dataset.row = i;
                    cell.dataset.col = j;

                    // 绑定事件
                    cell.addEventListener('mousedown', (e) => handleCellMouseDown(e, i, j));
                    cell.addEventListener('mouseup', (e) => handleCellMouseUp(e, i, j));
                    cell.addEventListener('mouseleave', () => handleCellMouseLeave(i, j));
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        if (!gameState.currentPress) {
                            handleRightClick(i, j);
                        }
                    });

                    // 显示已揭示或已标记的格子
                    if (gameState.revealed[i][j]) {
                        revealCell(cell, i, j);
                    } else if (gameState.flagged[i][j]) {
                        cell.innerHTML = '<i class="fa fa-flag text-danger"></i>';
                    } else if (gameState.questioned[i][j]) {
                        cell.innerHTML = '<i class="fa fa-question text-warning"></i>';
                    }
                    elements.gameBoard.appendChild(cell);
                }
            }
        }

        // 处理鼠标按下
        function handleCellMouseDown(e, row, col) {
            if (gameState.gameOver || gameState.questioned[row][col]) return;
            
            // 左键或右键按下
            if (e.button === 0 || e.button === 2) {
                // 开始游戏
                if (!gameState.gameStarted) {
                    gameState.gameStarted = true;
                    startTimer();
                    
                    // 确保第一次点击不会点到地雷
                    if (gameState.board[row][col] === 'M') {
                        gameState.board[row][col] = 0;
                        placeMines();
                        calculateNumbers();
                    }
                }
                
                // 处理数字格上的左右键同时按下
                if (gameState.revealed[row][col] && typeof gameState.board[row][col] === 'number' && gameState.board[row][col] > 0) {
                    // 记录当前按下的格子
                    gameState.currentPress = { row, col };
                    
                    // 高亮显示周围未翻开的格子
                    highlightAdjacentCells(row, col);
                } else if (!gameState.revealed[row][col]) {
                    // 按下未翻开的格子
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('cell-pressed');
                }
            }
        }

        // 处理鼠标释放
        function handleCellMouseUp(e, row, col) {
            if (gameState.gameOver) return;
            
            // 清除所有高亮
            clearAllHighlights();
            
            // 处理数字格上的左右键同时释放
            if (gameState.currentPress && gameState.currentPress.row === row && gameState.currentPress.col === col) {
                gameState.currentPress = null;
                
                // 只有当两个按钮都被按下并释放时才执行
                if (typeof gameState.board[row][col] === 'number' && gameState.board[row][col] > 0) {
                    revealAroundIfFlagsMatch(row, col);
                }
            } else if (!gameState.revealed[row][col] && !gameState.flagged[row][col] && !gameState.questioned[row][col]) {
                // 左键点击未翻开的格子
                if (e.button === 0) {
                    handleCellClick(row, col);
                }
            }
            
            // 移除所有格子的按下状态
            document.querySelectorAll('.cell-pressed').forEach(cell => {
                cell.classList.remove('cell-pressed');
            });
        }

        // 处理鼠标离开
        function handleCellMouseLeave(row, col) {
            if (gameState.gameOver) return;
            
            // 如果是从数字格离开，清除高亮
            if (gameState.currentPress && gameState.currentPress.row === row && gameState.currentPress.col === col) {
                clearAllHighlights();
            }
        }

        // 处理左键点击
        function handleCellClick(row, col) {
            if (gameState.gameOver || gameState.revealed[row][col] || gameState.flagged[row][col] || gameState.questioned[row][col]) {
                return;
            }

            if (gameState.board[row][col] === 'M') {
                // 踩到地雷，游戏结束
                gameOver(false);
            } else {
                // 揭示格子
                revealCell(document.querySelector(`[data-row="${row}"][data-col="${col}"]`), row, col);

                // 如果是0，自动揭示周围的格子
                if (gameState.board[row][col] === 0) {
                    revealAdjacentCells(row, col);
                }

                // 检查是否获胜
                checkWin();
            }
        }

        // 处理右键点击（标记地雷）
        function handleRightClick(row, col) {
            if (gameState.gameOver || gameState.revealed[row][col]) {
                return;
            }

            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

            // 切换标记状态
            if (gameState.flagged[row][col]) {
                gameState.flagged[row][col] = false;
                gameState.questioned[row][col] = true;
                gameState.minesLeft++;
            } else if (gameState.questioned[row][col]) {
                gameState.questioned[row][col] = false;
            } else {
                gameState.flagged[row][col] = true;
                gameState.minesLeft--;
            }

            // 更新剩余地雷数
            elements.minesCount.textContent = gameState.minesLeft;

            // 更新单元格显示
            if (gameState.flagged[row][col]) {
                cell.innerHTML = '<i class="fa fa-flag text-danger"></i>';
            } else if (gameState.questioned[row][col]) {
                cell.innerHTML = '<i class="fa fa-question text-warning"></i>';
            } else {
                cell.innerHTML = '';
            }

            // 检查是否获胜
            checkWin();
        }

        // 高亮显示周围的格子
        function highlightAdjacentCells(row, col) {
            for (let i = Math.max(0, row - 1); i <= Math.min(gameState.rows - 1, row + 1); i++) {
                for (let j = Math.max(0, col - 1); j <= Math.min(gameState.cols - 1, col + 1); j++) {
                    // 跳过自身和已揭示的格子
                    if (i === row && j === col) continue;
                    if (gameState.revealed[i][j]) continue;
                    
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (cell) {
                        cell.classList.add('cell-highlight');
                    }
                }
            }
        }

        // 清除所有高亮
        function clearAllHighlights() {
            document.querySelectorAll('.cell-highlight').forEach(cell => {
                cell.classList.remove('cell-highlight');
            });
        }

        // 揭示格子
        function revealCell(cell, row, col) {
            gameState.revealed[row][col] = true;
            cell.classList.remove('shadow-cell');
            cell.classList.add('revealed');

            const cellValue = gameState.board[row][col];

            if (cellValue === 'M') {
                cell.innerHTML = '<i class="fa fa-bomb text-danger"></i>';
            } else if (cellValue > 0) {
                // 根据数字设置不同的颜色
                const colors = ['', 'blue', 'green', 'red', 'darkblue', 'darkred', 'cyan', 'black', 'gray'];
                cell.textContent = cellValue;
                cell.style.color = colors[cellValue];
            }
        }

        // 揭示周围的格子（用于数字0的情况）
        function revealAdjacentCells(row, col) {
            // 使用队列来进行广度优先搜索，避免递归过深导致栈溢出
            const queue = [[row, col]];
            
            while (queue.length > 0) {
                const [i, j] = queue.shift();
                
                // 检查周围的8个格子
                for (let x = Math.max(0, i - 1); x <= Math.min(gameState.rows - 1, i + 1); x++) {
                    for (let y = Math.max(0, j - 1); y <= Math.min(gameState.cols - 1, j + 1); y++) {
                        // 跳过自身
                        if (x === i && y === j) continue;
                        
                        // 如果格子已被揭示、标记或有问号，跳过
                        if (gameState.revealed[x][y] || gameState.flagged[x][y] || gameState.questioned[x][y]) continue;
                        
                        // 揭示格子
                        const cell = document.querySelector(`[data-row="${x}"][data-col="${y}"]`);
                        revealCell(cell, x, y);
                        
                        // 如果揭示的格子是0，加入队列继续处理
                        if (gameState.board[x][y] === 0) {
                            queue.push([x, y]);
                        }
                    }
                }
            }
        }

        // 揭示数字格周围未标记的格子（旗子数等于数字时）
        function revealAroundIfFlagsMatch(row, col) {
            let flagCount = 0;
            let minesHit = 0;
            let cellsToReveal = [];
            
            // 计算周围的旗子数和需要揭示的格子
            for (let i = Math.max(0, row - 1); i <= Math.min(gameState.rows - 1, row + 1); i++) {
                for (let j = Math.max(0, col - 1); j <= Math.min(gameState.cols - 1, col + 1); j++) {
                    if (i === row && j === col) continue;
                    
                    if (gameState.flagged[i][j]) {
                        flagCount++;
                    } else if (!gameState.revealed[i][j] && !gameState.questioned[i][j]) {
                        cellsToReveal.push([i, j]);
                        if (gameState.board[i][j] === 'M') {
                            minesHit++;
                        }
                    }
                }
            }
            
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            // 如果旗子数等于数字，则揭示周围的格子
            if (flagCount === gameState.board[row][col]) {
                // 添加临时背景色
                cell.classList.add('bg-green-100');
                
                // 延迟揭示周围格子，创造更好的视觉效果
                setTimeout(() => {
                    for (const [i, j] of cellsToReveal) {
                        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        revealCell(cell, i, j);
                        
                        // 如果踩到地雷，游戏结束
                        if (gameState.board[i][j] === 'M') {
                            gameOver(false);
                        } else if (gameState.board[i][j] === 0) {
                            // 如果是0，递归揭示周围的格子
                            revealAdjacentCells(i, j);
                        }
                    }
                    
                    // 恢复背景色
                    cell.classList.remove('bg-green-100');
                    
                    // 检查是否获胜
                    checkWin();
                }, 100);
            } else {
                // 添加抖动动画
                cell.classList.remove('shake');
                void cell.offsetWidth; // 触发重绘
                cell.classList.add('shake');
                
                // 添加临时背景色
                cell.classList.add('bg-red-100');
                
                // 移除动画和背景色
                setTimeout(() => {
                    cell.classList.remove('shake', 'bg-red-100');
                }, 500);
            }
        }

        // 游戏结束
        function gameOver(isWin) {
            gameState.gameOver = true;
            clearInterval(gameState.timerInterval);

            // 显示所有地雷和错误标记
            for (let i = 0; i < gameState.rows; i++) {
                for (let j = 0; j < gameState.cols; j++) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);

                    if (gameState.board[i][j] === 'M') {
                        if (!gameState.flagged[i][j]) {
                            cell.innerHTML = '<i class="fa fa-bomb text-danger"></i>';
                            cell.classList.remove('shadow-cell');
                            cell.classList.add('revealed');
                        }
                    } else if (gameState.flagged[i][j]) {
                        cell.innerHTML = '<i class="fa fa-times text-warning"></i>';
                        cell.classList.remove('shadow-cell');
                        cell.classList.add('revealed');
                    }
                }
            }

            // 显示胜利或失败信息
            if (isWin) {
                gameState.win = true;
                elements.victoryTime.textContent = gameState.timer;
                elements.victoryModal.classList.remove('hidden');

                // 确保新游戏按钮有事件监听
                elements.newGameBtn.addEventListener('click', initGame);
            }
        }

        // 检查是否获胜
        function checkWin() {
            // 计算未被揭示的格子数
            let unrevealedCount = 0;
            for (let i = 0; i < gameState.rows; i++) {
                for (let j = 0; j < gameState.cols; j++) {
                    if (!gameState.revealed[i][j] && !gameState.flagged[i][j] && !gameState.questioned[i][j]) {
                        unrevealedCount++;
                    }
                }
            }

            // 如果所有非地雷格子都被揭示，则获胜
            if (unrevealedCount === 0 && gameState.minesLeft === 0) {
                gameOver(true);
            }
        }

        // 启动计时器
        function startTimer() {
            gameState.timerInterval = setInterval(() => {
                gameState.timer++;
                elements.timer.textContent = gameState.timer;
            }, 1000);
        }

        // 根据难度设置游戏参数
        function setDifficulty(difficulty) {
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
        }

        // 绑定事件监听器
        function bindEventListeners() {
            elements = {
                gameBoard: document.getElementById('game-board'),
                minesCount: document.getElementById('mines-count'),
                timer: document.getElementById('timer'),
                resetBtn: document.getElementById('reset-btn'),
                difficultySelect: document.getElementById('difficulty'),
                victoryModal: document.getElementById('victory-modal'),
                victoryTime: document.getElementById('victory-time'),
                newGameBtn: document.getElementById('new-game-btn'),
                gameContainer: document.getElementById('game-container')
            };

            // 重置按钮
            elements.resetBtn.addEventListener('click', initGame);

            // 难度选择器
            elements.difficultySelect.addEventListener('change', (e) => {
                setDifficulty(e.target.value);
                initGame();
            });

            // 新游戏按钮
            elements.newGameBtn.addEventListener('click', initGame);
        }

        // 初始化应用
        function initApp() {
            // 设置初始难度
            const difficulty = document.getElementById('difficulty').value;
            setDifficulty(difficulty);

            // 绑定事件监听器
            bindEventListeners();

            // 初始化游戏
            initGame();
        }

        // 当DOM加载完成后初始化应用
        document.addEventListener('DOMContentLoaded', initApp);