document.addEventListener('DOMContentLoaded', function () {
    // ...existing code variable declarations...
    let diskCount = 3;
    let towers = [[], [], []];
    let selectedTower = null;
    let isAutoSolving = false;
    let isGameStarted = false;
    let currentMoves = 0;
    let minMoves = 0;
    let bestRecord = {};
    let solutionSteps = [];
    let currentStep = 0;
    let hintGiven = false;

    const diskCountSlider = document.getElementById('diskCount');
    const diskCountValue = document.getElementById('diskCountValue');
    const startBtn = document.getElementById('startBtn');
    const autoSolveBtn = document.getElementById('autoSolveBtn');
    const hintBtn = document.getElementById('hintBtn');
    const resetBtn = document.getElementById('resetBtn');
    const minMovesElement = document.getElementById('minMoves');
    const currentMovesElement = document.getElementById('currentMoves');
    const bestRecordElement = document.getElementById('bestRecord');
    const gameStatus = document.getElementById('gameStatus');
    const towersElements = document.querySelectorAll('.tower');
    const diskContainers = document.querySelectorAll('.disk-container');

    function initBestRecord() {
        const storedRecords = localStorage.getItem('hanoiBestRecords');
        if (storedRecords) {
            bestRecord = JSON.parse(storedRecords);
        }
        updateBestRecordDisplay();
    }

    function updateBestRecordDisplay() {
        if (bestRecord[diskCount]) {
            bestRecordElement.textContent = bestRecord[diskCount];
        } else {
            bestRecordElement.textContent = '--';
        }
    }

    function getDiskColor(index) {
        const hue = (index * 360 / diskCount) % 360;
        return `hsla(${hue}, 85%, 60%, 0.9)`;
    }

    function renderTowers() {
        // 修复：每次渲染前先清空所有圆盘
        diskContainers.forEach(container => {
            container.innerHTML = '';
        });

        // 重新放置所有圆盘，底部的盘在下方，顶部的盘在上方
        towers.forEach((tower, towerIndex) => {
            const gameAreaHeight = document.getElementById('gameArea').offsetHeight;
            const maxDiskHeight = Math.floor((gameAreaHeight - 50) / (diskCount * 1.2));
            const diskHeight = Math.min(25, maxDiskHeight);

            // 正序遍历，最底下的盘先渲染，顶部的盘后渲染
            for (let diskIndex = 0; diskIndex < tower.length; diskIndex++) {
                const diskSize = tower[diskIndex];
                const disk = document.createElement('div');
                const widthPercent = (diskSize * 100 / diskCount) * 0.8 + 10;

                disk.className = `disk disk-transition`;
                disk.style.width = `calc(${widthPercent}% - 2px)`;
                disk.style.height = `${diskHeight}px`;
                disk.style.borderRadius = '8px';
                disk.style.backgroundColor = getDiskColor(diskSize);
                disk.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                disk.style.zIndex = diskIndex + 1;
                disk.dataset.size = diskSize;

                // 居中对齐
                disk.style.margin = '0 auto';
                disk.style.position = 'absolute';
                disk.style.left = '0';
                disk.style.right = '0';
                // 关键：底部的盘bottom为0，往上递增
                disk.style.bottom = `${diskIndex * diskHeight}px`;
                disk.style.transform = 'none';

                diskContainers[towerIndex].appendChild(disk);
            }
        });
    }

    function initGame() {
        towers = [[], [], []];
        for (let i = diskCount; i >= 1; i--) {
            towers[0].push(i);
        }
        selectedTower = null;
        isAutoSolving = false;
        isGameStarted = true;
        currentMoves = 0;
        minMoves = Math.pow(2, diskCount) - 1;
        hintGiven = false;

        renderTowers();
        updateGameUI();
        updateStatus('游戏开始！请点击一个塔选择圆盘，然后点击另一个塔移动它。');

        startBtn.disabled = true;
        autoSolveBtn.disabled = false;
        hintBtn.disabled = false;
        resetBtn.disabled = false;
        diskCountSlider.disabled = true;

        solutionSteps = [];
        solveHanoi(diskCount, 0, 2, 1);
        currentStep = 0;
    }

    function solveHanoi(n, source, target, auxiliary) {
        if (n === 1) {
            solutionSteps.push({ from: source, to: target });
            return;
        }
        solveHanoi(n - 1, source, auxiliary, target);
        solutionSteps.push({ from: source, to: target });
        solveHanoi(n - 1, auxiliary, target, source);
    }

    function autoSolveStep() {
        if (isAutoSolving && currentStep < solutionSteps.length) {
            const step = solutionSteps[currentStep];
            moveDisk(step.from, step.to, true);
            currentStep++;
            setTimeout(autoSolveStep, 500);
        }
    }

    function moveDisk(fromTowerIndex, toTowerIndex, isAuto = false) {
        if (isAutoSolving && !isAuto) return;
        if (fromTowerIndex === toTowerIndex) {
            if (!isAuto) updateStatus('不能移动到同一个塔！');
            return;
        }
        if (towers[fromTowerIndex].length === 0) {
            if (!isAuto) updateStatus('所选的塔没有圆盘！');
            return;
        }
        const fromTower = towers[fromTowerIndex];
        const toTower = towers[toTowerIndex];
        const diskToMove = fromTower[fromTower.length - 1];
        if (toTower.length > 0 && toTower[toTower.length - 1] < diskToMove) {
            if (!isAuto) updateStatus('不能将较大的圆盘放在较小的圆盘上面！');
            return;
        }
        fromTower.pop();
        toTower.push(diskToMove);

        renderTowers();

        if (!isAuto) {
            currentMoves++;
            updateGameUI();
            if (checkWin()) {
                gameOver();
            }
        }
        if (!isAuto) {
            updateStatus(`从塔 ${fromTowerIndex + 1} 移动圆盘到塔 ${toTowerIndex + 1}`);
        }
    }

    function checkWin() {
        return towers[2].length === diskCount;
    }

    function gameOver() {
        isGameStarted = false;
        isAutoSolving = false;
        updateStatus(`恭喜你！你用 ${currentMoves} 步完成了游戏，最少需要 ${minMoves} 步。`);
        if (currentMoves === minMoves) {
            updateStatus('完美！你达到了最少移动次数！');
        }
        if (!bestRecord[diskCount] || currentMoves < bestRecord[diskCount]) {
            bestRecord[diskCount] = currentMoves;
            localStorage.setItem('hanoiBestRecords', JSON.stringify(bestRecord));
            updateBestRecordDisplay();
            updateStatus('新纪录！');
        }
        autoSolveBtn.disabled = true;
        hintBtn.disabled = true;
        startBtn.disabled = false;
        diskCountSlider.disabled = false;

        // --- 新增：完成时弹窗提示 ---
        showFinishTip();
    }

    // 仿 minesweeper.html 的完成提示
    function showFinishTip() {
        // 若已存在则不重复添加
        if (document.getElementById('hanoi-finish-tip')) return;
        const tip = document.createElement('div');
        tip.id = 'hanoi-finish-tip';
        tip.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40';
        tip.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center animate-bounce-in">
                <div class="mb-4">
                    <i class="fa-solid fa-trophy text-5xl text-tool-hanoitower"></i>
                </div>
                <h2 class="text-2xl font-bold mb-2 text-tool-hanoitower">通关成功！</h2>
                <p class="text-gray-700 mb-4">你用 <span class="font-bold text-tool-hanoitower">${currentMoves}</span> 步完成了汉诺塔！</p>
                <button id="hanoi-finish-close" class="mt-2 px-6 py-2 bg-tool-hanoitower text-white rounded-lg font-bold hover:bg-tool-hanoitower/80 transition">
                    确定
                </button>
            </div>
        `;
        document.body.appendChild(tip);
        document.getElementById('hanoi-finish-close').onclick = function() {
            tip.remove();
        };
    }

    function showHint() {
        if (isAutoSolving || !isGameStarted) return;
        if (solutionSteps.length === 0 || currentStep >= solutionSteps.length) {
            updateStatus('提示：请从第一个塔开始移动最小的圆盘。');
            return;
        }
        const hint = solutionSteps[currentStep];
        towersElements.forEach((tower, index) => {
            tower.classList.remove('ring-4', 'ring-accent');
            if (index === hint.from || index === hint.to) {
                tower.classList.add('ring-4', 'ring-accent');
                setTimeout(() => {
                    tower.classList.remove('ring-4', 'ring-accent');
                }, 3000);
            }
        });
        updateStatus(`提示：从塔 ${hint.from + 1} 移动到塔 ${hint.to + 1}`);
        hintGiven = true;
    }

    function updateGameUI() {
        diskCountValue.textContent = diskCount;
        minMovesElement.textContent = minMoves;
        currentMovesElement.textContent = currentMoves;
    }

    function updateStatus(message) {
        const statusEntry = document.createElement('div');
        statusEntry.className = 'mb-1';
        statusEntry.textContent = message;
        gameStatus.appendChild(statusEntry);
        gameStatus.scrollTop = gameStatus.scrollHeight;
    }

    function resetGame() {
        towers = [[], [], []];
        selectedTower = null;
        isAutoSolving = false;
        isGameStarted = false;
        currentMoves = 0;
        currentStep = 0;
        hintGiven = false;
        renderTowers();
        updateGameUI();
        updateStatus('游戏已重置。请点击"开始游戏"按钮开始新游戏。');
        startBtn.disabled = false;
        autoSolveBtn.disabled = true;
        hintBtn.disabled = true;
        resetBtn.disabled = true;
        diskCountSlider.disabled = false;
        towersElements.forEach(tower => {
            tower.classList.remove('ring-4', 'ring-primary', 'ring-accent');
        });
    }

    diskCountSlider.addEventListener('input', function () {
        diskCount = parseInt(this.value);
        updateGameUI();
        updateBestRecordDisplay();
    });

    startBtn.addEventListener('click', initGame);

    autoSolveBtn.addEventListener('click', function () {
        if (isAutoSolving) {
            isAutoSolving = false;
            autoSolveBtn.innerHTML = '<i class="fa fa-magic mr-2"></i> 自动解谜';
            updateStatus('自动解谜已暂停。');
        } else {
            isAutoSolving = true;
            autoSolveBtn.innerHTML = '<i class="fa fa-pause mr-2"></i> 暂停';
            updateStatus('正在自动解谜...');
            autoSolveStep();
        }
    });

    hintBtn.addEventListener('click', showHint);

    resetBtn.addEventListener('click', resetGame);

    towersElements.forEach((tower, index) => {
        tower.addEventListener('click', function () {
            if (!isGameStarted || isAutoSolving) return;
            if (selectedTower === null) {
                if (towers[index].length > 0) {
                    selectedTower = index;
                    towersElements.forEach((t, i) => {
                        t.classList.remove('ring-4', 'ring-primary');
                        if (i === index) {
                            t.classList.add('ring-4', 'ring-primary');
                        }
                    });
                    updateStatus(`选择了塔 ${index + 1}，准备移动最上面的圆盘。`);
                } else {
                    updateStatus('所选的塔没有圆盘！');
                }
            } else {
                moveDisk(selectedTower, index);
                selectedTower = null;
                towersElements.forEach(t => {
                    t.classList.remove('ring-4', 'ring-primary');
                });
                if (hintGiven && currentStep < solutionSteps.length) {
                    currentStep++;
                    hintGiven = false;
                }
            }
        });
    });

    // 初始化游戏
    initBestRecord();
    updateGameUI();
    updateStatus('欢迎来到汉诺塔游戏！选择层数，然后点击"开始游戏"按钮开始。');

    // 窗口大小变化时重新计算圆盘大小
    window.addEventListener('resize', function () {
        if (isGameStarted) {
            renderTowers();
        }
    });
});
