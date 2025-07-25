// --- 数独生成与求解 ---
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 生成完整数独解
function generateFullSudoku() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  function fill(row, col) {
    if (row === 9) return true;
    if (col === 9) return fill(row + 1, 0);
    let nums = shuffle([1,2,3,4,5,6,7,8,9]);
    for (let n of nums) {
      if (isSafe(board, row, col, n)) {
        board[row][col] = n;
        if (fill(row, col + 1)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }
  fill(0, 0);
  return board;
}

function isSafe(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3, startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[startRow + i][startCol + j] === num) return false;
  return true;
}

// 挖空生成题目
function makePuzzle(fullBoard, diff) {
  let puzzle = fullBoard.map(row => row.slice());
  let holes = diff === 'easy' ? 36 : diff === 'medium' ? 46 : 54;
  let count = 0;

  // 优化挖空算法，确保均匀分布
  const cells = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      cells.push({i, j});
    }
  }
  shuffle(cells);

  for (let {i, j} of cells) {
    if (count >= holes) break;
    if (puzzle[i][j] !== 0) {
      puzzle[i][j] = 0;
      count++;
    }
  }
  return puzzle;
}

// 检查用户输入是否正确
function checkSudoku(board, solution) {
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++)
      if (Number(board[i][j]) !== solution[i][j]) return false;
  return true;
}

// 获取可用的提示单元格
function getHintCell(userBoard, solution) {
  const emptyCells = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      // 找到用户尚未填写的单元格
      if (!userBoard[i][j] || userBoard[i][j] === 0) {
        emptyCells.push({i, j});
      }
    }
  }
  if (emptyCells.length === 0) return null;
  // 随机选择一个空单元格作为提示
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// --- 计时器 ---
let timer = null, seconds = 0;
function startTimer() {
  if (timer) clearInterval(timer);
  seconds = 0;
  document.getElementById('timer').textContent = '00:00';
  timer = setInterval(() => {
    seconds++;
    let m = String(Math.floor(seconds / 60)).padStart(2, '0');
    let s = String(seconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  if (timer) clearInterval(timer);
}

// --- 渲染与交互 ---
let puzzle = [], solution = [], diff = 'easy', hintCount = 3;

function renderBoard(puzzle, readonly = false) {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < 9; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      if (puzzle[i][j] !== 0) {
        input.value = puzzle[i][j];
        input.readOnly = true;
      } else {
        input.value = '';
        input.readOnly = readonly;
        input.oninput = function() {
          this.value = this.value.replace(/[^1-9]/g, '');
        };
      }
      input.dataset.row = i;
      input.dataset.col = j;
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function getUserBoard() {
  const inputs = document.querySelectorAll('.sudoku-cell');
  let userBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
  inputs.forEach(input => {
    let i = Number(input.dataset.row), j = Number(input.dataset.col);
    userBoard[i][j] = input.value ? Number(input.value) : 0;
  });
  return userBoard;
}

function newGame(selectedDiff) {
  diff = selectedDiff || diff;
  solution = generateFullSudoku();
  puzzle = makePuzzle(solution, diff);
  renderBoard(puzzle);
  document.getElementById('result-msg').textContent = '';
  startTimer();
  // 重置提示次数
  hintCount = 3;
  document.getElementById('hint-count').textContent = `提示: ${hintCount}`;
  // 难度按钮高亮
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.diff === diff);
  });
}

// --- 事件绑定 ---
window.onload = function() {
  newGame('easy');

  document.getElementById('restart').onclick = () => newGame();

  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.onclick = () => newGame(btn.dataset.diff);
  });

  document.getElementById('check-btn').onclick = () => {
    const userBoard = getUserBoard();
    if (userBoard.flat().includes(0)) {
      document.getElementById('result-msg').textContent = '请填写完整后再检查！';
      document.getElementById('result-msg').style.color = '#F59E0B';
      return;
    }
    if (checkSudoku(userBoard, solution)) {
      stopTimer();
      document.getElementById('result-msg').textContent = '恭喜你，答案正确！';
      document.getElementById('result-msg').style.color = '#10B981';
    } else {
      document.getElementById('result-msg').textContent = '有错误，请再检查！';
      document.getElementById('result-msg').style.color = '#EF4444';
    }
  };

  document.getElementById('show-answer-btn').onclick = () => {
    renderBoard(solution, true);
    stopTimer();
    document.getElementById('result-msg').textContent = '已显示答案';
    document.getElementById('result-msg').style.color = '#4F46E5';
  };

  // 提示按钮功能
  document.getElementById('hint-btn').onclick = () => {
    if (hintCount <= 0) {
      document.getElementById('result-msg').textContent = '提示已用完！';
      document.getElementById('result-msg').style.color = '#EF4444';
      setTimeout(() => {
        document.getElementById('result-msg').textContent = '';
      }, 2000);
      return;
    }

    const userBoard = getUserBoard();
    const hintCell = getHintCell(userBoard, solution);

    if (!hintCell) {
      document.getElementById('result-msg').textContent = '没有可提示的单元格了！';
      document.getElementById('result-msg').style.color = '#F59E0B';
      return;
    }

    // 减少提示次数并更新显示
    hintCount--;
    document.getElementById('hint-count').textContent = `提示: ${hintCount}`;

    // 获取对应的输入框并填充正确答案
    const inputs = document.querySelectorAll('.sudoku-cell');
    inputs.forEach(input => {
      if (Number(input.dataset.row) === hintCell.i && Number(input.dataset.col) === hintCell.j) {
        // 添加动画效果
        input.classList.add('hint-cell');
        // 延迟显示答案，让用户注意到提示的位置
        setTimeout(() => {
          input.value = solution[hintCell.i][hintCell.j];
          input.classList.remove('hint-cell');

          // 检查是否完成
          const newUserBoard = getUserBoard();
          if (!newUserBoard.flat().includes(0)) {
            if (checkSudoku(newUserBoard, solution)) {
              stopTimer();
              document.getElementById('result-msg').textContent = '恭喜你，答案正确！';
              document.getElementById('result-msg').style.color = '#10B981';
            }
          }
        }, 1000);
      }
    });
  };
};
