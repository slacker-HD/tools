// 贪吃蛇主脚本 - 放在 js/snake.js
(function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const gridSize = 20;
    let tileCount = Math.floor(canvas.width / gridSize);

    let snake = [{ x: 10, y: 10 }];
    let dx = 0;
    let dy = 0;

    let food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // 根据窗口大小调整画布，使其为 gridSize 的整数倍并保持在合理范围
    function resizeCanvas() {
        const maxSize = 600;
        const vw = Math.max(300, Math.floor(window.innerWidth * 0.85));
        const size = Math.min(maxSize, vw);
        // 保证为 gridSize 的整数倍
        const adjusted = Math.max(gridSize * 10, Math.floor(size / gridSize) * gridSize);
        canvas.width = adjusted;
        canvas.height = adjusted;
        tileCount = Math.floor(canvas.width / gridSize);

        // 把蛇和食物坐标约束到新的 tileCount 范围内
        snake = snake.map(s => ({ x: ((s.x % tileCount) + tileCount) % tileCount, y: ((s.y % tileCount) + tileCount) % tileCount }));
        food.x = ((food.x % tileCount) + tileCount) % tileCount;
        food.y = ((food.y % tileCount) + tileCount) % tileCount;
    }

    // 监听窗口变化
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawGame();
    });

    // 初始调整
    resizeCanvas();

    let score = 0;
    let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    let gameRunning = true;
    let gameLoop = null;

    // 初始化界面数值
    document.getElementById('high-score').textContent = highScore;
    document.getElementById('score').textContent = score;

    document.addEventListener('keydown', changeDirection);

    // 先绘制初始画面
    drawGame();
    startGame();

    function startGame() {
        gameRunning = true;
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(gameUpdate, 150);
    }

    function gameUpdate() {
        if (!gameRunning) return;

        if (dx !== 0 || dy !== 0) {
            moveSnake();
            handleWallWrap();

            if (checkSelfCollision()) {
                endGame();
                return;
            }

            if (snake[0].x === food.x && snake[0].y === food.y) {
                score += 10;
                document.getElementById('score').textContent = score;

                do {
                    food.x = Math.floor(Math.random() * tileCount);
                    food.y = Math.floor(Math.random() * tileCount);
                } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
            } else {
                snake.pop();
            }
        }

        drawGame();
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);
    }

    function handleWallWrap() {
        if (snake[0].x < 0) {
            snake[0].x = tileCount - 1;
        } else if (snake[0].x >= tileCount) {
            snake[0].x = 0;
        }

        if (snake[0].y < 0) {
            snake[0].y = tileCount - 1;
        } else if (snake[0].y >= tileCount) {
            snake[0].y = 0;
        }
    }

    function checkSelfCollision() {
        for (let i = 1; i < snake.length; i++) {
            if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
                return true;
            }
        }
        return false;
    }

    function drawGame() {
        // 背景
        ctx.fillStyle = '#0f1c17';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 网格线
        ctx.strokeStyle = '#112e1f';
        for (let i = 0; i < tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // 食物
        ctx.fillStyle = '#e8f0c8';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);

        // 蛇
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#b8e0b8' : '#88b888';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        });
    }

    function changeDirection(event) {
        const key = event.key;

        // 阻止方向键导致页面滚动
        if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'ArrowRight' || key === 'ArrowDown') {
            event.preventDefault();
        }

        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingLeft = dx === -1;
        const goingRight = dx === 1;

        if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && !goingRight) {
            dx = -1; dy = 0;
        }
        if ((key === 'ArrowUp' || key === 'w' || key === 'W') && !goingDown) {
            dx = 0; dy = -1;
        }
        if ((key === 'ArrowRight' || key === 'd' || key === 'D') && !goingLeft) {
            dx = 1; dy = 0;
        }
        if ((key === 'ArrowDown' || key === 's' || key === 'S') && !goingUp) {
            dx = 0; dy = 1;
        }
    }

    function endGame() {
        gameRunning = false;
        if (gameLoop) clearInterval(gameLoop);

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('high-score').textContent = highScore;
        }

        document.getElementById('final-score').textContent = score;
        const over = document.getElementById('gameOver');
        if (over) over.classList.add('show');
    }

    // 全局可访问的重新开始函数（页面 button onclick 使用）
    window.restartGame = function () {
        snake = [{ x: 10, y: 10 }];
        dx = 0; dy = 0;
        score = 0;
        document.getElementById('score').textContent = score;
        food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
        const over = document.getElementById('gameOver');
        if (over) over.classList.remove('show');
        drawGame();
        startGame();
    };

})();
