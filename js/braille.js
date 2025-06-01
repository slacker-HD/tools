// DOM元素
const dots = Array.from({ length: 6 }, (_, i) => document.getElementById(`dot${i + 1}`));
const currentChar = document.getElementById('currentChar');
const result = document.getElementById('result');
const clearBtn = document.getElementById('clearBtn');
const confirmBtn = document.getElementById('confirmBtn');
const inputModeRadios = document.getElementsByName('inputMode');

// 布莱叶点阵状态
let dotStates = new Array(6).fill(false);
let inputMode = 'ujmik';

// 键位映射 - 确保与标准布莱叶点位一致
const keyMaps = {
    ujmik: {
        'u': 0, // 点位 1 - 左上
        'j': 1, // 点位 2 - 左中
        'm': 2, // 点位 3 - 左下
        'i': 3, // 点位 4 - 右上
        'k': 4, // 点位 5 - 右中
        ',': 5  // 点位 6 - 右下
    },
    numpad: {
        '7': 0, // 点位 1 - 左上
        '4': 1, // 点位 2 - 左中
        '1': 2, // 点位 3 - 左下
        '8': 3, // 点位 4 - 右上
        '5': 4, // 点位 5 - 右中
        '2': 5  // 点位 6 - 右下
    },
    rfvedc: {
        'e': 0, // 点位 1 - 左上
        'd': 1, // 点位 2 - 左中
        'c': 2, // 点位 3 - 左下
        'r': 3, // 点位 4 - 右上
        'f': 4, // 点位 5 - 右中
        'v': 5  // 点位 6 - 右下
    }
};

// 点阵与字符映射 - 确保与标准布莱叶点位一致
const brailleMap = {
    // 空格
    '000000': ['⠀'],    // 盲文空格字符
    
    // 英文字母和数字映射
    '100000': ['a', '1'],         // a/1
    '110000': ['b', '2'],         // b/2
    '100100': ['c', '3'],         // c/3
    '100110': ['d', '4'],         // d/4
    '100010': ['e', '5'],         // e/5
    '110100': ['f', '6'],         // f/6
    '110110': ['g', '7'],         // g/7
    '110010': ['h', '8'],         // h/8
    '010100': ['i', '9'],         // i/9
    '010110': ['j', '0'],         // j/0

    // 数字映射（下移一行）
    '010000': ['①'],         // 圆圈1
    '011000': ['②'],         // 圆圈2
    '010010': ['③'],         // 圆圈3
    '010011': ['④'],         // 圆圈4
    '010001': ['⑤'],         // 圆圈5
    '011010': ['⑥'],         // 圆圈6
    '011011': ['⑦'],         // 圆圈7
    '011001': ['⑧'],         // 圆圈8
    '001010': ['⑨'],         // 圆圈9
    '001011': ['⓪'],         // 圆圈0
    '101000': ['k'],         // k
    '111000': ['l'],         // l
    '101100': ['m'],         // m
    '101110': ['n'],         // n
    '101010': ['o'],         // o
    '111100': ['p'],         // p
    '111110': ['q'],         // q
    '111010': ['r'],         // r
    '011100': ['s'],         // s
    '011110': ['t'],         // t
    '101001': ['u'],         // u
    '111001': ['v'],         // v
    '010111': ['w'],         // w
    '101101': ['x'],         // x
    '101111': ['y'],         // y
    '101011': ['z'],         // z

    // 数字记号
    '001111': ['数字记号'],    // 数字记号

    // 声母符号
    '110000': ['b'],         // b
    '100100': ['c'],         // c
    '100110': ['d'],         // d
    '110100': ['f'],         // f
    '110110': ['g'],         // g
    '110010': ['h'],         // h
    '101100': ['m'],         // m
    '101110': ['n'],         // n
    '101000': ['k'],         // k
    '111000': ['l'],         // l
    '010100': ['i'],         // i
    '010110': ['j'],         // j
    '101010': ['o'],         // o
    '111100': ['p'],         // p
    '111110': ['q'],         // q
    '111010': ['r'],         // r
    '011100': ['s'],         // s
    '011110': ['t'],         // t
    '101001': ['u'],         // u
    '111001': ['v'],         // v
    '010111': ['w'],         // w
    '101101': ['x'],         // x
    '101111': ['y'],         // y
    '101011': ['z'],         // z
    '123456': ['zh'],        // zh
    '112345': ['ch'],        // ch
    '11356': ['sh'],         // sh
    '245': ['r'],            // r
    '14': ['c'],             // c
    '234': ['s'],            // s
    '1245': ['g/j'],         // g/j
    '13': ['k/q'],           // k/q
    '125': ['h/x'],          // h/x

    // 韵母符号
    '000011': ['a'],         // a
    '001010': ['o/e'],       // o/e
    '000100': ['i'],         // i
    '011011': ['u'],         // u
    '110110': ['ü'],         // ü
    '111011': ['er'],        // er
    '001100': ['ai'],        // ai
    '001110': ['ao'],        // ao
    '111100': ['ei'],        // ei
    '111111': ['ou'],        // ou
    '110100': ['ia'],        // ia
    '001011': ['iao'],       // iao
    '000011': ['ie'],        // ie
    '111011': ['iou'],       // iou
    '111111': ['ua'],        // ua
    '111101': ['uai'],       // uai
    '110111': ['uei'],       // uei
    '001111': ['uo'],        // uo
    '111000': ['üe'],        // üe
    '111001': ['an'],        // an
    '110011': ['ang'],       // ang
    '001110': ['en'],        // en
    '110111': ['eng'],       // eng
    '000110': ['ian'],       // ian
    '110010': ['iang'],      // iang
    '000010': ['in'],        // in
    '000111': ['ing'],       // ing
    '111110': ['uan'],       // uan
    '110101': ['uang'],      // uang
    '000101': ['uen'],       // uen
    '001111': ['üan'],       // üan
    '011110': ['ong/ueng'],  // ong/ueng
    '111000': ['ün'],        // ün
    '111100': ['iong'],      // iong,

    // 声调符号
    '000001': ['阴平'],       // 第一声 (ˉ)
    '000010': ['阳平'],       // 第二声 (ˊ)
    '000110': ['上声'],       // 第三声 (ˇ)
    '001010': ['去声'],       // 第四声 (ˋ)
    '000000': ['轻声'],       // 轻声 (不标调)
};


// 为所有可能的点位组合生成盲文字符映射 - 修正点位编码逻辑
function generateAllBrailleDots() {
    const allDots = {};
    
    // 布莱叶点位编码权重
    const dotWeights = [1, 2, 4, 8, 16, 32];
    
    // 遍历所有可能的点位组合 (0-63)
    for (let i = 0; i < 64; i++) {
        // 生成二进制表示
        let binary = i.toString(2).padStart(6, '0');
        
        // 计算Unicode码点
        let codePoint = 0x2800;
        for (let j = 0; j < 6; j++) {
            if (binary[j] === '1') {
                codePoint += dotWeights[j];
            }
        }
        
        // 存储映射关系
        allDots[binary] = String.fromCodePoint(codePoint);
    }
    
    return allDots;
}

// 修改 brailleDots 为包含所有组合的映射
const brailleDots = generateAllBrailleDots();

// 更新点位显示 - 修正UI点位排列
function updateDotDisplay() {
    // 点位顺序：左上(1), 左中(2), 左下(3), 右上(4), 右中(5), 右下(6)
    const dotPositions = [
        { top: '10%', left: '20%' },  // 点位1 - 左上
        { top: '45%', left: '20%' },  // 点位2 - 左中
        { top: '80%', left: '20%' },  // 点位3 - 左下
        { top: '10%', left: '70%' },  // 点位4 - 右上
        { top: '45%', left: '70%' },  // 点位5 - 右中
        { top: '80%', left: '70%' }   // 点位6 - 右下
    ];
    
    // 更新每个点位的位置和状态
    dots.forEach((dot, i) => {
        // 设置点位位置
        dot.style.top = dotPositions[i].top;
        dot.style.left = dotPositions[i].left;
        
        // 设置点位状态
        dot.style.borderColor = dotStates[i] ? '#9333EA' : '#D1D5DB';
        dot.style.backgroundColor = dotStates[i] ? '#9333EA' : 'transparent';
    });
    
    // 更新当前字符显示
    const dotString = dotStates.map(d => d ? '1' : '0').join('');
    const chars = brailleMap[dotString];
    if (chars) {
        const displayText = chars.filter(c => c !== null).join('/');
        currentChar.textContent = displayText || '请按键输入';
    } else {
        currentChar.textContent = '请按键输入';
    }
}

// 切换点位状态
function toggleDot(index) {
    dotStates[index] = !dotStates[index];
    updateDotDisplay();
}

// 清除点位
function clearDots() {
    dotStates.fill(false);
    updateDotDisplay();
}

// 更新DOM元素获取
const brailleResult = document.getElementById('brailleResult');

// 修改清除结果函数
function clearResult() {
    brailleResult.value = '';
}

// 添加光标位置保存
let savedCursorPos = null;

// 浮动窗口控制函数
let isInputting = false;

function showPopup() {
    isInputting = true;
    // 保存当前光标位置
    savedCursorPos = brailleResult.selectionStart;
    braillePopup.classList.remove('opacity-0', 'pointer-events-none');
    braillePopup.classList.add('opacity-100');
    brailleResult.blur(); // 移除文本框焦点
}

function hidePopup() {
    isInputting = false;
    braillePopup.classList.add('opacity-0', 'pointer-events-none');
    braillePopup.classList.remove('opacity-100');
    // 恢复光标位置
    if (savedCursorPos !== null) {
        brailleResult.focus();
        brailleResult.setSelectionRange(savedCursorPos, savedCursorPos);
    }
}

// 修改确认输入函数
function confirmInput() {
    const dotString = dotStates.map(d => d ? '1' : '0').join('');
    const brailleChar = brailleDots[dotString];
    
    if (brailleChar && savedCursorPos !== null) {
        const before = brailleResult.value.slice(0, savedCursorPos);
        const after = brailleResult.value.slice(savedCursorPos);
        brailleResult.value = before + brailleChar + after;
        
        savedCursorPos++;
        brailleResult.setSelectionRange(savedCursorPos, savedCursorPos);
        
        clearDots();
        hidePopup();
        return true;
    }
    return false;
}

// 修改键盘事件处理
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const code = e.code;
    const mode = document.querySelector('input[name="inputMode"]:checked').value;
    
    // 直接输入空格
    if (key === ' ' || (key === '0' && code === 'Numpad0')) {
        e.preventDefault();
        if (isInputting) {
            confirmInput();
        } else {
            const pos = brailleResult.selectionStart;
            const before = brailleResult.value.slice(0, pos);
            const after = brailleResult.value.slice(pos);
            brailleResult.value = before + '⠀' + after;  // 使用盲文空格字符
            brailleResult.setSelectionRange(pos + 1, pos + 1);
        }
        return;
    }
    
    // 如果正在点位输入或按下了映射键
    if (isInputting || keyMaps[mode][key] !== undefined) {
        e.preventDefault();
        if (key === 'escape') {
            hidePopup();
            clearDots();
        } else if (keyMaps[mode][key] !== undefined) {
            showPopup();
            toggleDot(keyMaps[mode][key]);
        } else if (key === 'enter') {
            if (dotStates.some(state => state)) {
                confirmInput();
            }
            const before = brailleResult.value.slice(0, savedCursorPos);
            const after = brailleResult.value.slice(savedCursorPos);
            brailleResult.value = before + '\n' + after;
            savedCursorPos++;
            brailleResult.setSelectionRange(savedCursorPos, savedCursorPos);
        }
    }
});

// 修改文本框事件处理
brailleResult.addEventListener('input', (e) => {
    if (isInputting) {
        e.preventDefault();
        return;
    }

    const input = e.target;
    const text = input.value;
    const start = input.selectionStart;
    let validBrailleText = '';
    let cursorPos = start;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '\n' || (char >= '⠀' && char <= '⣿')) {
            validBrailleText += char;
        } else if (i < start) {
            cursorPos--;
        }
    }

    input.value = validBrailleText;
    input.setSelectionRange(cursorPos, cursorPos);
});

// 防止在输入模式时失去焦点
brailleResult.addEventListener('focus', (e) => {
    if (isInputting) {
        e.target.blur();
    }
});

// 事件监听
clearBtn.addEventListener('click', clearDots);
confirmBtn.addEventListener('click', confirmInput);
inputModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        inputMode = e.target.value;
        clearDots();
    });
});

// 初始化时创建双行显示
window.addEventListener('DOMContentLoaded', () => {
    clearResult();
    updateDotDisplay();
});
