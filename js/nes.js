// ==========================================
// 1. 核心配置
// ==========================================
const BUTTON_INDEX = {
    a: 0, b: 1, select: 2, start: 3,
    up: 4, down: 5, left: 6, right: 7
};

const DEFAULT_KEYS_P1 = {
    up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD',
    a: 'KeyU', b: 'KeyI', select: 'Digit2', start: 'Digit1',
    repeatA: 'KeyJ', repeatB: 'KeyK'
};

const DEFAULT_KEYS_P2 = {
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
    a: 'Numpad1', b: 'Numpad2', select: 'Numpad8', start: 'Numpad7',
    repeatA: 'Numpad4', repeatB: 'Numpad5'
};

// ==========================================
// 2. 状态变量
// ==========================================
let nes = null;
let audioCtx = null;
let isRunning = false;
let isPaused = false;
let currentKeys = {
    1: { ...DEFAULT_KEYS_P1 },
    2: { ...DEFAULT_KEYS_P2 }
};
let reverseMap = { 1: {}, 2: {} };
let repeatTimers = { 1: { a: null, b: null }, 2: { a: null, b: null } };
let repeatRates = { 1: 10, 2: 10 };
let frameCount = 0;
let lastFpsTime = 0;
let lastEmulatorTime = 0;
const NES_FRAME_DURATION = 1000 / 60; // 60 FPS target

// ==========================================
// 3. 初始化 NES
// ==========================================
function initAudio() {
    if (audioCtx) return;
    window.audioBuf = [];
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
        const audioNode = audioCtx.createScriptProcessor(4096, 0, 1);
        audioNode.onaudioprocess = (e) => {
            const out = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < 4096; i++) out[i] = (window.audioBuf.length > 0) ? window.audioBuf.shift() : 0;
        };
        audioNode.connect(audioCtx.destination);
    } catch (e) { }
}

function initNES() {
    if (nes) return;

    const canvas = document.getElementById('nes-canvas');
    canvas.width = 256;
    canvas.height = 240;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(256, 240);
    const frameBuffer = new Uint32Array(imageData.data.buffer);

    nes = new jsnes.NES({
        onFrame: (fb) => {
            for (let i = 0; i < fb.length; i++) {
                frameBuffer[i] = 0xFF000000 | fb[i];
            }
            ctx.putImageData(imageData, 0, 0);
            frameCount++;
        },
        onAudioSample: (l, r) => {
            if (window.audioBuf && window.audioBuf.length < 8192) window.audioBuf.push((l + r) / 2 * 0.5);
        }
    });

    // 启动主循环
    requestAnimationFrame(tick);
}

function setStatus(status, color) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    if (dot) dot.style.background = color;
    if (text) text.textContent = status;
}

// ==========================================
// 4. 帧率控制主循环 (修复游戏速度过快)
// ==========================================
function tick(timestamp) {
    // 初始化时间基准
    if (!lastEmulatorTime) lastEmulatorTime = timestamp;
    if (!lastFpsTime) lastFpsTime = timestamp;

    // 计算自上一帧以来经过的时间
    const elapsed = timestamp - lastEmulatorTime;

    // 帧率限制逻辑：只有当经过的时间超过一帧的时间时才运行模拟器
    if (nes && isRunning && !isPaused) {
        // 如果经过的时间大于一帧的时间 (约 16.6ms)，则执行一帧
        // 这可以防止在 144Hz 显示器上运行过快
        if (elapsed >= NES_FRAME_DURATION) {
            nes.frame();
            // 更新基准时间。使用减法而不是赋值 timestamp 可以防止时间漂移
            lastEmulatorTime = timestamp - (elapsed % NES_FRAME_DURATION);
        }
    }

    // FPS 计算 (每秒更新一次显示)
    if (timestamp - lastFpsTime >= 1000) {
        document.getElementById('fpsCounter').textContent = frameCount + ' FPS';
        frameCount = 0;
        lastFpsTime = timestamp;
    }

    requestAnimationFrame(tick);
}

// ==========================================
// 5. 键位管理
// ==========================================
function getKeyName(code) {
    if (!code) return '未设置';
    const map = {
        'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→',
        'Space': '空格', 'Enter': '回车', 'Escape': 'ESC'
    };
    if (map[code]) return map[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return 'N' + code.slice(6);
    return code;
}

function updateMap() {
    reverseMap[1] = {};
    reverseMap[2] = {};
    for (let p of [1, 2]) {
        for (let k in currentKeys[p]) {
            if (currentKeys[p][k]) {
                reverseMap[p][currentKeys[p][k]] = k;
            }
        }
    }
}

function saveConfig() {
    localStorage.setItem('jsnes_keys_v3', JSON.stringify({
        keys: currentKeys,
        repeatRates: repeatRates
    }));
    updateMap();
}

function loadConfig() {
    const saved = localStorage.getItem('jsnes_keys_v3');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            if (loaded.keys) {
                currentKeys[1] = { ...DEFAULT_KEYS_P1, ...loaded.keys[1] };
                currentKeys[2] = { ...DEFAULT_KEYS_P2, ...loaded.keys[2] };
            }
            if (loaded.repeatRates) {
                repeatRates = loaded.repeatRates;
                document.getElementById('repeatRate1').value = repeatRates[1];
                document.getElementById('repeatRate2').value = repeatRates[2];
            }
        } catch (e) { }
    }
    updateMap();
}

// 初始化界面按钮文字，使其与配置同步
function updateKeyButtonsUI() {
    document.querySelectorAll('.key-btn').forEach(btn => {
        const key = btn.dataset.key;
        const player = btn.dataset.player;
        if (key && player && currentKeys[player]) {
            const code = currentKeys[player][key];
            btn.textContent = getKeyName(code);
        }
    });
}

// ==========================================
// 6. 输入处理 (修复核心)
// ==========================================
function sendKey(player, action, pressed) {
    if (!nes || !isRunning) return;

    // 处理连发键的特殊情况：连发键只触发对应的 a/b
    if (action.startsWith('repeat')) {
        const baseAction = action.replace('repeat', '').toLowerCase();
        if (pressed) {
            startRepeat(player, baseAction);
        } else {
            stopRepeat(player, baseAction);
        }
        return;
    }

    const val = BUTTON_INDEX[action];
    if (val === undefined) return;

    try {
        if (pressed) nes.buttonDown(player, val);
        else nes.buttonUp(player, val);
    } catch (e) { }
}

function startRepeat(player, button) {
    if (repeatTimers[player][button]) return;
    const rate = repeatRates[player];
    // 立即触发一次
    sendKey(player, button, true);
    setTimeout(() => sendKey(player, button, false), 50);

    repeatTimers[player][button] = setInterval(() => {
        sendKey(player, button, true);
        setTimeout(() => sendKey(player, button, false), 50);
    }, 1000 / rate);
}

function stopRepeat(player, button) {
    if (repeatTimers[player][button]) {
        clearInterval(repeatTimers[player][button]);
        repeatTimers[player][button] = null;
        sendKey(player, button, false);
    }
}

// 键盘事件监听
document.addEventListener('keydown', e => {
    // 键位配置模式
    if (window.listeningBtn) {
        e.preventDefault();
        if (e.code === 'Escape') {
            const key = window.listeningBtn.dataset.key;
            const player = window.listeningBtn.dataset.player;
            window.listeningBtn.textContent = getKeyName(currentKeys[player][key]);
            window.listeningBtn.classList.remove('pressing');
            window.listeningBtn = null;
            return;
        }

        const key = window.listeningBtn.dataset.key;
        const player = window.listeningBtn.dataset.player;

        // 存储新键位
        currentKeys[player][key] = e.code;
        saveConfig();
        window.listeningBtn.textContent = getKeyName(e.code);
        window.listeningBtn.classList.remove('pressing');
        window.listeningBtn = null;
        return;
    }

    // 游戏控制 - 同时检查 1P 和 2P
    for (let player of [1, 2]) {
        const action = reverseMap[player][e.code];
        if (action) {
            e.preventDefault();
            sendKey(player, action, true);
            break;
        }
    }
});

document.addEventListener('keyup', e => {
    // 游戏控制 - 同时检查 1P 和 2P
    for (let player of [1, 2]) {
        const action = reverseMap[player][e.code];
        if (action) {
            sendKey(player, action, false);
            break;
        }
    }
});

// ==========================================
// 7. UI 事件绑定
// ==========================================
function setupUI() {
    // 加载服务器 ROM 列表
    loadServerRoms();

    // ROM 选择
    const romSelect = document.getElementById('romSelect');
    const localRomInput = document.getElementById('localRomInput');
    const dropZone = document.getElementById('dropZone');
    const localRomInfo = document.getElementById('localRomInfo');
    const localRomName = document.getElementById('localRomName');
    const removeLocalRomBtn = document.getElementById('removeLocalRomBtn');

    dropZone.addEventListener('click', () => localRomInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.nes')) {
            handleLocalRom(file);
        }
    });

    localRomInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleLocalRom(file);
    });

    function handleLocalRom(file) {
        romSelect.value = '__local__';
        localRomName.textContent = file.name;
        localRomInfo.classList.add('show');
    }

    removeLocalRomBtn.addEventListener('click', () => {
        romSelect.value = '';
        localRomInfo.classList.remove('show');
        localRomInput.value = '';
    });

    // 启动游戏
    document.getElementById('startBtn').addEventListener('click', () => {
        const romValue = romSelect.value;
        if (!romValue) {
            alert('请先选择游戏 ROM');
            return;
        }

        // 检测是否在 file:// 协议下运行
        if (window.location.protocol === 'file:') {
            alert('⚠️ 检测到您正在使用 file:// 协议直接打开页面\n\n由于浏览器安全限制，无法从服务器加载 ROM 文件。\n\n解决方案：\n1. 使用本地服务器运行（推荐 VS Code Live Server 扩展）\n2. 或使用下方"本地 ROM 文件"选项直接加载本地文件\n\n启动本地服务器方法：\n- VS Code: 安装 Live Server 扩展，右键 HTML 文件选择"Open with Live Server"\n- Python: 在目录运行 python -m http.server 8000\n- Node.js: 使用 http-server 包');
            romSelect.value = '__local__';
            localRomInput.click();
            return;
        }

        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        initNES();

        if (romValue === '__local__' && localRomInput.files[0]) {
            setStatus('加载中...', '#ffaa00');
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                let str = '';
                const chunk = 8192;
                for (let i = 0; i < data.length; i += chunk) str += String.fromCharCode.apply(null, data.subarray(i, i + chunk));
                nes.loadROM(str);
                isRunning = true;
                isPaused = false;
                setStatus('运行中', '#00d4aa');
            };
            reader.onerror = () => {
                setStatus('读取失败', '#ef4444');
                alert('读取本地 ROM 文件失败，请检查文件是否损坏');
            };
            reader.readAsArrayBuffer(localRomInput.files[0]);
        } else if (romValue === '__server__') {
            setStatus('请选择具体游戏', '#ffaa00');
        } else if (romValue && romValue !== '__local__' && romValue !== '__server__') {
            // 加载服务器 ROM
            setStatus('加载中...', '#ffaa00');
            const romUrl = `/fcroms/${encodeURIComponent(romValue)}`;
            console.log('[JSNES] Loading ROM from server:', romUrl);
            console.log('[JSNES] Current location:', window.location.href);
            console.log('[JSNES] Current protocol:', window.location.protocol);

            fetch(romUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/octet-stream'
                }
            })
                .then(response => {
                    console.log('[JSNES] Response status:', response.status, response.statusText);
                    console.log('[JSNES] Response headers:', Object.fromEntries(response.headers.entries()));

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.arrayBuffer();
                })
                .then(buffer => {
                    console.log('[JSNES] ROM loaded, size:', buffer.byteLength, 'bytes');
                    if (buffer.byteLength === 0) {
                        throw new Error('ROM 文件为空');
                    }
                    const data = new Uint8Array(buffer);
                    let str = '';
                    const chunk = 8192;
                    for (let i = 0; i < data.length; i += chunk) str += String.fromCharCode.apply(null, data.subarray(i, i + chunk));
                    nes.loadROM(str);
                    isRunning = true;
                    isPaused = false;
                    setStatus('运行中', '#00d4aa');
                    console.log('[JSNES] ROM loaded successfully');
                })
                .catch(err => {
                    console.error('[JSNES] 加载 ROM 失败:', err);
                    setStatus('加载失败', '#ef4444');

                    let errorMsg = '❌ ROM 加载失败\n\n错误信息：' + err.message;
                    errorMsg += '\n\n当前协议：' + window.location.protocol;
                    errorMsg += '\n当前地址：' + window.location.href;

                    if (err.message.includes('404')) {
                        errorMsg += '\n\n可能原因：\n1. 服务器上不存在该 ROM 文件\n2. ROM 文件路径配置错误\n3. 请检查 /roms/ 目录下是否有该文件';
                    } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                        errorMsg += '\n\n可能原因：\n1. 服务器未启动或无法访问\n2. 存在 CORS 跨域问题\n3. 请确保在本地服务器环境下运行（如 http://localhost）\n4. 检查浏览器控制台查看详细错误';
                    } else if (window.location.protocol === 'file:') {
                        errorMsg += '\n\n⚠️ 您正在使用 file:// 协议打开页面\n浏览器禁止从本地文件协议发起网络请求\n\n解决方案：\n1. 使用本地服务器（推荐）\n   - VS Code: 安装 Live Server 扩展\n   - Python: python -m http.server 8000\n   - Node.js: npx http-server\n2. 或直接选择"本地 ROM 文件"选项';
                    }

                    console.error('[JSNES] Detailed error:', errorMsg);
                    alert(errorMsg);

                    if (confirm('是否切换到本地 ROM 文件加载模式？')) {
                        romSelect.value = '__local__';
                        localRomInput.click();
                    }
                });
        }
    });

    // 暂停
    document.getElementById('pauseBtn').addEventListener('click', () => {
        if (!nes) return;
        isPaused = !isPaused;
        document.getElementById('pauseBtn').innerHTML = isPaused ?
            '<i class="fa-solid fa-play mr-2"></i>继续' :
            '<i class="fa-solid fa-pause mr-2"></i>暂停';
        setStatus(isPaused ? '已暂停' : '运行中', isPaused ? '#ffaa00' : '#00d4aa');
    });

    // 全屏
    function toggleFullscreen() {
        const container = document.getElementById('nes');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    }
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('fullscreenBtn2').addEventListener('click', toggleFullscreen);

    // 键位设置模态框
    const modal = document.getElementById('keyConfigModal');
    const keySettingsBtn = document.getElementById('keySettingsBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalSaveBtn = document.getElementById('modalSaveBtn');

    keySettingsBtn.addEventListener('click', () => {
        updateKeyButtonsUI();
        modal.classList.add('active');
    });

    modalCloseBtn.addEventListener('click', () => modal.classList.remove('active'));
    modalCancelBtn.addEventListener('click', () => modal.classList.remove('active'));

    modalSaveBtn.addEventListener('click', () => {
        repeatRates[1] = parseInt(document.getElementById('repeatRate1').value) || 10;
        repeatRates[2] = parseInt(document.getElementById('repeatRate2').value) || 10;
        saveConfig();
        modal.classList.remove('active');
    });

    // 键位按钮点击设置
    document.querySelectorAll('.key-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.listeningBtn) {
                window.listeningBtn.classList.remove('pressing');
            }
            window.listeningBtn = btn;
            btn.classList.add('pressing');
            btn.textContent = '请按键...';
        });
    });
}

// ==========================================
// 8. 初始化
// ==========================================
async function loadServerRoms() {
    const romSelect = document.getElementById('romSelect');
    const serverOption = romSelect.querySelector('option[value="__server__"]');

    const exampleRoms = [
        { name: '闪亮亮星星之夜DX', file: '闪亮亮星星之夜DX.nes' },
        { name: '亚马逊减肥大作战', file: '亚马逊减肥大作战.nes' },
        { name: 'SD快打旋风', file: 'SD快打旋风.nes' },
        { name: '爱的小屋', file: '爱的小屋.nes' },
        { name: '超级玛丽', file: '超级玛丽.nes' },
        { name: '魂斗罗', file: '魂斗罗.nes' },
        { name: '沙罗曼蛇', file: '沙罗曼蛇.nes' },
        { name: '荒野大镖客', file: '荒野大镖客.nes' },
        { name: '超级魂斗罗', file: '超级魂斗罗.nes' },
        { name: '马戏团', file: '马戏团.nes' },
        { name: '成龙之龙', file: '成龙之龙.nes' },
        { name: '赤色要塞', file: '赤色要塞.nes' },
        { name: '绿色兵团', file: '绿色兵团.nes' },
    ];

    try {
        if (serverOption) serverOption.remove();

        const serverGroup = document.createElement('option');
        serverGroup.value = '';
        serverGroup.textContent = '── 经典游戏 ──';
        serverGroup.disabled = true;
        romSelect.appendChild(serverGroup);

        exampleRoms.forEach(rom => {
            const option = document.createElement('option');
            option.value = rom.file;
            option.textContent = '🎮 ' + rom.name;
            romSelect.appendChild(option);
        });

        console.log('[JSNES] Loaded', exampleRoms.length, 'example ROMs');
    } catch (err) {
        console.error('[JSNES] Failed to load ROMs:', err);
        if (serverOption) {
            serverOption.textContent = '⚠️ ROM 加载失败';
            serverOption.disabled = false;
            serverOption.value = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    setupUI();
    console.log('[JSNES] Initialization complete');
    console.log('[JSNES] currentKeys:', currentKeys);
    console.log('[JSNES] reverseMap:', reverseMap);
});