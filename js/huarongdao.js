// 外部化的数字华容道游戏脚本（从 huarongdao.html 提取）
// 游戏核心变量（改为动态行列数）
let BOARD_SIZE = 4; // 默认4x4
let TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;
const EMPTY_TILE_VALUE = 0;

let board = [];
let emptyRow = 0;
let emptyCol = 0;
let moveCount = 0;
let isGameWon = false;

// 获取DOM元素
const gameBoard = document.getElementById('gameBoard');
const newGameBtn = document.getElementById('newGameBtn');
const hintBtn = document.getElementById('hintBtn');
const gameMessage = document.getElementById('gameMessage');
const moveCountElement = document.getElementById('moveCount');
const sizeSelect = document.getElementById('sizeSelect');

// 更新棋盘尺寸（适配动态行列数）
function updateBoardGridStyle() {
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;
    // 设置CSS变量用于动态字体大小
    document.documentElement.style.setProperty('--board-size', BOARD_SIZE);
}

// 初始化游戏
function initGame() {
    TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;
    // 生成可解的打乱棋盘
    board = generateShuffledBoard();
    // 找到空位位置
    [emptyRow, emptyCol] = findEmptyTilePosition();
    // 重置游戏状态
    moveCount = 0;
    isGameWon = false;
    moveCountElement.textContent = moveCount;
    gameMessage.textContent = '';
    gameMessage.classList.remove('win-message');
    // 更新棋盘样式
    updateBoardGridStyle();
    // 渲染棋盘
    renderBoard();
}

// 生成可解的打乱棋盘（适配任意行列数）
function generateShuffledBoard() {
    // 生成有序数组
    let tiles = Array.from({ length: TOTAL_TILES }, (_, i) => i + 1);
    tiles[TOTAL_TILES - 1] = EMPTY_TILE_VALUE; // 最后一个位置为空

    // 打乱数组（确保可解）
    do {
        shuffleArray(tiles);
    } while (!isSolvable(tiles));

    // 转换为二维数组
    let board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board.push(tiles.slice(i * BOARD_SIZE, (i + 1) * BOARD_SIZE));
    }
    return board;
}

// Fisher-Yates 洗牌
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 可解性判断（适配任意行列数）
function isSolvable(tiles) {
    let inversions = 0;
    let emptyPosition = tiles.indexOf(EMPTY_TILE_VALUE) + 1; // 从1开始计数

    // 计算逆序数
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i] !== EMPTY_TILE_VALUE && tiles[j] !== EMPTY_TILE_VALUE && tiles[i] > tiles[j]) {
                inversions++;
            }
        }
    }

    // 不同行列数的可解性规则
    if (BOARD_SIZE % 2 === 0) {
        // 偶数阶棋盘：逆序数 + 空位所在行数（从下往上数）为偶数则可解
        const emptyRowFromBottom = BOARD_SIZE - Math.floor((emptyPosition - 1) / BOARD_SIZE);
        return (inversions + emptyRowFromBottom) % 2 === 0;
    } else {
        // 奇数阶棋盘：逆序数为偶数则可解
        return inversions % 2 === 0;
    }
}

// 查找空位位置
function findEmptyTilePosition() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY_TILE_VALUE) {
                return [i, j];
            }
        }
    }
    return [0, 0];
}

// 渲染棋盘（适配动态行列数）
function renderBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const tileValue = board[i][j];
            const tileElement = document.createElement('div');
            // base 'tile' class kept for JS queries; add Tailwind utility classes for layout/typography
            // NOTE: 颜色由页面 CSS 变量和类控制 (see huarongdao.html) — 不再使用硬编码 bg-white
            tileElement.classList.add('tile', 'aspect-square', 'flex', 'items-center', 'justify-center', 'border-2', 'border-boardLine', 'rounded-md', 'font-bold', 'text-primary', 'cursor-grab', 'shadow-md', 'transition-transform', 'tile-dynamic-font');

            if (tileValue === EMPTY_TILE_VALUE) {
                tileElement.classList.add('empty', 'tile-empty-inline');
            } else {
                tileElement.textContent = tileValue;
                tileElement.addEventListener('click', () => handleTileClick(i, j));
                tileElement.draggable = true;
                tileElement.addEventListener('dragstart', (e) => handleDragStart(e, i, j));
            }

            gameBoard.appendChild(tileElement);
        }
    }
}

// 点击移动
function handleTileClick(row, col) {
    if (isGameWon) return;

    if (isAdjacentToEmpty(row, col)) {
        swapTiles(row, col, emptyRow, emptyCol);
        moveCount++;
        moveCountElement.textContent = moveCount;
        if (checkWin()) {
            gameWon();
        }
    }
}

// 拖拽开始
function handleDragStart(e, row, col) {
    if (isGameWon || !isAdjacentToEmpty(row, col)) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
}

// 拖拽相关事件
gameBoard.addEventListener('dragover', (e) => e.preventDefault());
gameBoard.addEventListener('drop', (e) => {
    if (isGameWon) return;

    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { row, col } = data;

    if (isAdjacentToEmpty(row, col)) {
        swapTiles(row, col, emptyRow, emptyCol);
        moveCount++;
        moveCountElement.textContent = moveCount;
        if (checkWin()) {
            gameWon();
        }
    }
});

// 检查是否与空位相邻
function isAdjacentToEmpty(row, col) {
    const dx = Math.abs(row - emptyRow);
    const dy = Math.abs(col - emptyCol);
    // 上下左右相邻（只有一个方向相差1）
    return (dx + dy === 1);
}

// 交换棋子位置
function swapTiles(fromRow, fromCol, toRow, toCol) {
    // 交换值
    [board[fromRow][fromCol], board[toRow][toCol]] = [board[toRow][toCol], board[fromRow][fromCol]];
    // 更新空位位置
    [emptyRow, emptyCol] = [fromRow, fromCol];
    // 重新渲染
    renderBoard();
}

// 胜利判断（适配任意行列数）
function checkWin() {
    let expectedValue = 1;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            // 最后一个位置应该是空位
            if (i === BOARD_SIZE - 1 && j === BOARD_SIZE - 1) {
                return board[i][j] === EMPTY_TILE_VALUE;
            }
            if (board[i][j] !== expectedValue) {
                return false;
            }
            expectedValue++;
        }
    }
    return true;
}

// 游戏获胜
function gameWon() {
    isGameWon = true;
    gameMessage.textContent = `恭喜！完成${BOARD_SIZE}x${BOARD_SIZE}挑战！总移动次数: ${moveCount}`;
    gameMessage.classList.add('win-message');

    // 给所有棋子添加获胜效果（使用 CSS 类以保持与其它页面一致）
    const tiles = document.querySelectorAll('.tile:not(.empty)');
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('tile-win');
        }, index * 30); // 缩短间隔适配多行列
    });
}

// 提示功能
function showHint() {
    if (isGameWon) return;

    // 查找可移动的棋子
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== EMPTY_TILE_VALUE && isAdjacentToEmpty(i, j)) {
                const tiles = document.querySelectorAll('.tile');
                const tileIndex = i * BOARD_SIZE + j;
                const hintTile = tiles[tileIndex];

                // 闪烁提示（通过类控制颜色，之后移除）
                hintTile.classList.add('tile-hint');
                setTimeout(() => {
                    hintTile.classList.remove('tile-hint');
                }, 1000);
                return;
            }
        }
    }
}

// 行列数切换事件
sizeSelect.addEventListener('change', () => {
    BOARD_SIZE = parseInt(sizeSelect.value);
    initGame();
});

// 事件监听
newGameBtn.addEventListener('click', initGame);
hintBtn.addEventListener('click', showHint);

// no mode buttons to bind (controls moved into HTML '游戏模式' card)

// 页面加载完成后初始化游戏 —— 兼容脚本被延后或已加载的情况
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM 已就绪，直接初始化
    initGame();
}
