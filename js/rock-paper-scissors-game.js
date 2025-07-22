// DOM元素
const playerVideo = document.getElementById('playerVideo');
const playerCanvas = document.getElementById('playerCanvas');
const playerGesture = document.getElementById('playerGesture');
const computerGesture = document.getElementById('computerGesture');
const computerStatus = document.getElementById('computerStatus');
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const gameResult = document.getElementById('gameResult');
const resultText = document.getElementById('resultText');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const cameraError = document.getElementById('cameraError');
const errorMessage = document.getElementById('errorMessage');
const retryCamera = document.getElementById('retryCamera');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');
const modelLoading = document.getElementById('modelLoading');
const handDetectionHint = document.getElementById('handDetectionHint');
const showPermissionGuide = document.getElementById('showPermissionGuide');
const permissionGuideModal = document.getElementById('permissionGuideModal');
const closePermissionGuide = document.getElementById('closePermissionGuide');

// Canvas上下文
const ctx = playerCanvas.getContext('2d');

// 游戏状态
let gameState = {
    isPlaying: false,
    isModelLoaded: false,
    playerScore: 0,
    computerScore: 0,
    stream: null,
    model: null,
    detectionInterval: null,
    gestureHistory: [] // 记录手势识别历史，提高准确性
};

// 手势类型 - 修正了胜负关系
const gestures = {
    rock: {
        name: '石头',
        icon: 'fa-solid fa-hand-back-fist', // 6.x石头
        beats: 'scissors'
    },
    paper: {
        name: '布',
        icon: 'fa-solid fa-hand', // 6.x布
        beats: 'rock'
    },
    scissors: {
        name: '剪刀',
        icon: 'fa-solid fa-hand-scissors', // 6.x剪刀
        beats: 'paper'
    }
};

// 修改 displayGesture 函数，确保渲染完整类名
function displayGesture(element, gesture) {
    element.innerHTML = `<i class="${gesture.icon}"></i>`;
    element.classList.add('animate-shake');
    setTimeout(() => {
        element.classList.remove('animate-shake');
    }, 500);
}

// 初始化事件监听
function initEventListeners() {
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    helpBtn.addEventListener('click', () => helpModal.classList.replace('hidden', 'flex'));
    closeHelpBtn.addEventListener('click', () => helpModal.classList.replace('flex', 'hidden'));
    retryCamera.addEventListener('click', startCamera);
    showPermissionGuide.addEventListener('click', () => {
        permissionGuideModal.classList.replace('hidden', 'flex');
    });
    closePermissionGuide.addEventListener('click', () => {
        permissionGuideModal.classList.replace('flex', 'hidden');
    });

    // 响应窗口大小变化，调整canvas尺寸
    window.addEventListener('resize', adjustCanvasSize);
}

// 加载AI模型
async function loadAIModel() {
    try {
        modelLoading.classList.remove('hidden');
        gameState.model = await handpose.load();
        gameState.isModelLoaded = true;
        modelLoading.classList.add('hidden');
        console.log('AI模型加载完成');
    } catch (err) {
        console.error('模型加载失败:', err);
        modelLoading.innerHTML = `
            <i class="fa fa-exclamation-circle mr-2"></i>
            <span>模型加载失败，请刷新页面重试</span>
        `;
    }
}

// 调整Canvas尺寸以匹配视频
function adjustCanvasSize() {
    if (playerVideo.videoWidth) {
        playerCanvas.width = playerVideo.videoWidth;
        playerCanvas.height = playerVideo.videoHeight;
    }
}

// 启动摄像头
async function startCamera() {
    // 隐藏错误提示，显示加载状态
    cameraError.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');

    try {
        // 检查浏览器是否支持媒体设备
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('您的浏览器不支持摄像头访问，请使用Chrome、Firefox或Edge等现代浏览器');
        }

        // 尝试不同的视频配置以提高兼容性
        const videoConstraints = [
            {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            { facingMode: 'user' },
            true
        ];

        let stream = null;
        let constraintIndex = 0;

        // 尝试不同的视频配置，直到成功或全部失败
        while (!stream && constraintIndex < videoConstraints.length) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: videoConstraints[constraintIndex]
                });
            } catch (innerErr) {
                console.log(`尝试视频配置 ${constraintIndex} 失败:`, innerErr);
                constraintIndex++;
            }
        }

        if (!stream) {
            throw new Error('所有视频配置尝试均失败，无法访问摄像头');
        }

        gameState.stream = stream;
        playerVideo.srcObject = gameState.stream;

        // 摄像头加载完成后隐藏加载覆盖层
        playerVideo.onloadedmetadata = () => {
            adjustCanvasSize();
            loadingOverlay.classList.add('hidden');
            startBtn.disabled = true;
            resetBtn.disabled = false;
            gameState.isPlaying = true;

            // 开始手部检测
            startHandDetection();

            // 如果模型尚未加载，等待模型加载完成后开始游戏
            if (gameState.isModelLoaded) {
                startRound();
            } else {
                computerStatus.textContent = '等待AI模型加载...';
                const checkModelInterval = setInterval(() => {
                    if (gameState.isModelLoaded) {
                        clearInterval(checkModelInterval);
                        startRound();
                    }
                }, 500);
            }
        };
    } catch (err) {
        console.error('无法访问摄像头:', err);

        // 根据错误类型显示不同的消息
        let errorMsg = '请确保已授予摄像头权限并检查设备是否正常工作';
        if (err.name === 'NotAllowedError') {
            errorMsg = '已拒绝摄像头权限，请在浏览器设置中启用';
        } else if (err.name === 'NotFoundError') {
            errorMsg = '未找到可用的摄像头设备';
        } else if (err.name === 'NotReadableError') {
            errorMsg = '摄像头被其他应用占用，请关闭后重试';
        } else if (err.name === 'OverconstrainedError') {
            errorMsg = '摄像头不支持所需的分辨率，尝试使用其他设备';
        } else if (err.name === 'TypeError') {
            errorMsg = '摄像头访问被阻止，请检查浏览器设置';
        }

        errorMessage.textContent = errorMsg;
        loadingOverlay.classList.add('hidden');
        cameraError.classList.remove('hidden');
    }
}

// 开始手部检测
function startHandDetection() {
    if (gameState.detectionInterval) {
        clearInterval(gameState.detectionInterval);
    }

    gameState.detectionInterval = setInterval(async () => {
        if (!gameState.isPlaying || !gameState.model || countdownOverlay.classList.contains('hidden')) {
            return;
        }

        try {
            // 检测手部
            const predictions = await gameState.model.estimateHands(playerVideo);
            drawHandDetection(predictions);

            // 如果检测到手，隐藏提示
            if (predictions.length > 0) {
                handDetectionHint.classList.add('hidden');
            } else {
                handDetectionHint.classList.remove('hidden');
            }
        } catch (err) {
            console.error('手部检测出错:', err);
        }
    }, 100);
}

// 绘制手部检测结果
function drawHandDetection(predictions) {
    // 清除之前的绘制
    ctx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);

    if (predictions.length > 0) {
        // 绘制手部关键点
        predictions.forEach(prediction => {
            const landmarks = prediction.landmarks;

            // 绘制连接点
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // 拇指
                [5, 6], [6, 7], [7, 8], // 食指
                [9, 10], [10, 11], [11, 12], // 中指
                [13, 14], [14, 15], [15, 16], // 无名指
                [17, 18], [18, 19], [19, 20], // 小指
                [0, 5], [5, 9], [9, 13], [13, 17], [0, 17] // 手掌
            ];

            ctx.strokeStyle = '#165DFF';
            ctx.lineWidth = 3;

            connections.forEach(connection => {
                const [i, j] = connection;
                const point1 = landmarks[i];
                const point2 = landmarks[j];

                ctx.beginPath();
                ctx.moveTo(point1[0], point1[1]);
                ctx.lineTo(point2[0], point2[1]);
                ctx.stroke();
            });

            // 绘制关键点
            ctx.fillStyle = '#36D399';
            landmarks.forEach(landmark => {
                ctx.beginPath();
                ctx.arc(landmark[0], landmark[1], 5, 0, 2 * Math.PI);
                ctx.fill();
            });
        });
    }
}

// 识别手势 - 优化算法提高准确性
async function recognizeGesture() {
    if (!gameState.model) return null;

    try {
        // 收集多个样本提高准确性
        const samples = [];
        for (let i = 0; i < 3; i++) {
            const predictions = await gameState.model.estimateHands(playerVideo);
            if (predictions.length > 0) {
                samples.push(predictions[0].landmarks);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        if (samples.length === 0) {
            return null; // 未检测到手
        }

        // 对多个样本进行分析
        const gestureCounts = {
            rock: 0,
            paper: 0,
            scissors: 0
        };

        samples.forEach(landmarks => {
            // 计算各手指的弯曲程度（尖端与根部的Y坐标差）
            const thumbBend = landmarks[4][1] - landmarks[2][1];
            const indexBend = landmarks[8][1] - landmarks[5][1];
            const middleBend = landmarks[12][1] - landmarks[9][1];
            const ringBend = landmarks[16][1] - landmarks[13][1];
            const pinkyBend = landmarks[20][1] - landmarks[17][1];

            // 动态阈值调整，适应不同光线条件
            const bendThreshold = Math.max(25, Math.min(40, Math.abs(thumbBend) / 2));

            // 统计伸直的手指数量
            let extendedFingers = 0;
            if (indexBend < -bendThreshold) extendedFingers++; // 食指伸直
            if (middleBend < -bendThreshold) extendedFingers++; // 中指伸直
            if (ringBend < -bendThreshold) extendedFingers++; // 无名指伸直
            if (pinkyBend < -bendThreshold) extendedFingers++; // 小指伸直

            // 判断手势并计数
            if (extendedFingers === 0) {
                gestureCounts.rock++;
            } else if (extendedFingers === 2 &&
                indexBend < -bendThreshold &&
                middleBend < -bendThreshold) {
                gestureCounts.scissors++;
            } else if (extendedFingers >= 3) {
                gestureCounts.paper++;
            }
        });

        // 选择出现次数最多的手势
        let maxCount = -1;
        let bestGesture = null;

        Object.keys(gestureCounts).forEach(gesture => {
            if (gestureCounts[gesture] > maxCount) {
                maxCount = gestureCounts[gesture];
                bestGesture = gestures[gesture];
            }
        });

        // 如果没有明确结果，使用历史记录辅助判断
        if (maxCount === 0 && gameState.gestureHistory.length > 0) {
            return gameState.gestureHistory[gameState.gestureHistory.length - 1];
        }

        // 记录手势历史
        if (bestGesture) {
            gameState.gestureHistory.push(bestGesture);
            if (gameState.gestureHistory.length > 5) {
                gameState.gestureHistory.shift();
            }
        }

        return bestGesture || getRandomGesture();

    } catch (err) {
        console.error('手势识别出错:', err);
        return null;
    }
}

// 开始游戏
function startGame() {
    if (!gameState.isPlaying) {
        // 首次启动时加载模型
        if (!gameState.isModelLoaded) {
            loadAIModel();
        }
        startCamera();
    } else {
        startRound();
    }
}

// 开始新一轮
function startRound() {
    // 重置UI
    playerGesture.innerHTML = '<i class="fa fa-question-circle"></i>';
    computerGesture.innerHTML = '<i class="fa fa-question-circle text-gray-300"></i>';
    gameResult.classList.add('hidden');
    computerStatus.textContent = '准备中...';
    handDetectionHint.classList.remove('hidden');

    // 显示倒计时
    countdownOverlay.classList.remove('hidden');
    let count = 3;
    countdownText.textContent = count;

    const countdownInterval = setInterval(() => {
        count--;
        countdownText.textContent = count;

        if (count === 0) {
            clearInterval(countdownInterval);
            countdownText.textContent = '出!';

            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                playRound();
            }, 500);
        }
    }, 1000);
}

// 进行一轮游戏
async function playRound() {
    computerStatus.textContent = '识别手势中...';

    // 尝试多次识别，提高准确性
    let playerChoice = null;
    let attempts = 0;

    while (!playerChoice && attempts < 5) {
        playerChoice = await recognizeGesture();
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 如果无法识别，使用随机手势
    if (!playerChoice) {
        playerChoice = getRandomGesture();
        computerStatus.textContent = '识别困难，使用随机手势';
    } else {
        computerStatus.textContent = '识别完成';
    }

    gameState.playerChoice = playerChoice;
    displayGesture(playerGesture, playerChoice);

    // 电脑随机选择手势 - 确保完全随机
    const computerChoice = getRandomGesture();
    displayGesture(computerGesture, computerChoice);

    // 延迟判断结果，增加紧张感
    setTimeout(() => {
        determineWinner(playerChoice, computerChoice);
    }, 1000);
}

// 获取随机手势 - 确保均匀分布
function getRandomGesture() {
    const gestureKeys = Object.keys(gestures);
    // 使用更均匀的随机算法
    const random = Math.random();
    const threshold = 1 / gestureKeys.length;

    for (let i = 0; i < gestureKeys.length; i++) {
        if (random < (i + 1) * threshold) {
            return gestures[gestureKeys[i]];
        }
    }

    return gestures[gestureKeys[0]];
}

// 显示手势
function displayGesture(element, gesture) {
    element.innerHTML = `<i class="fa ${gesture.icon}"></i>`;
    element.classList.add('animate-shake');

    setTimeout(() => {
        element.classList.remove('animate-shake');
    }, 500);
}

// 判断胜负 - 修正核心逻辑
function determineWinner(player, computer) {
    let result;

    // 明确的胜负判定逻辑
    if (player.name === computer.name) {
        result = '平局!';
        gameResult.className = 'text-center py-4 mb-6 rounded-lg bg-yellow-100';
        resultText.className = 'text-xl font-semibold text-yellow-800';
    }
    // 玩家胜利条件（用beats属性判断）
    else if (
        (player.beats && computer && computer.name && gestures[player.beats] && gestures[player.beats].name === computer.name)
    ) {
        result = '你赢了!';
        gameState.playerScore++;
        gameResult.className = 'text-center py-4 mb-6 rounded-lg bg-secondary/20';
        resultText.className = 'text-xl font-semibold text-secondary';
    }
    // 电脑胜利条件
    else {
        result = '电脑赢了!';
        gameState.computerScore++;
        gameResult.className = 'text-center py-4 mb-6 rounded-lg bg-danger/20';
        resultText.className = 'text-xl font-semibold text-danger';
    }

    // 更新UI
    resultText.textContent = `${result} 你的${player.name} vs 电脑的${computer.name}`;
    gameResult.classList.remove('hidden');
    playerScoreEl.textContent = gameState.playerScore;
    computerScoreEl.textContent = gameState.computerScore;
    computerStatus.textContent = '点击"开始游戏"进行下一轮';

    // 启用开始按钮
    startBtn.disabled = false;
}

// 重置游戏
function resetGame() {
    // 停止视频流
    if (gameState.stream) {
        gameState.stream.getTracks().forEach(track => track.stop());
        gameState.stream = null;
    }

    // 停止手部检测
    if (gameState.detectionInterval) {
        clearInterval(gameState.detectionInterval);
        gameState.detectionInterval = null;
    }

    // 清除Canvas
    ctx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);

    // 重置游戏状态
    gameState.isPlaying = false;
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.gestureHistory = []; // 清空手势历史

    // 重置UI
    playerVideo.srcObject = null;
    playerGesture.innerHTML = '<i class="fa fa-question-circle"></i>';
    computerGesture.innerHTML = '<i class="fa fa-question-circle text-gray-300"></i>';
    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    gameResult.classList.add('hidden');
    computerStatus.textContent = '等待游戏开始...';
    loadingOverlay.classList.add('hidden');
    cameraError.classList.add('hidden');
    handDetectionHint.classList.add('hidden');

    // 重置按钮状态
    startBtn.disabled = false;
    resetBtn.disabled = true;
}

// 初始化应用
function initApp() {
    initEventListeners();
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);