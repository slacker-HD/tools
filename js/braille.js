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
    '000000': ' ',  // 空格
    '100000': 'a', '110000': 'b', '100100': 'c', '100110': 'd',
    '100010': 'e', '110100': 'f', '110110': 'g', '110010': 'h',
    '010100': 'i', '010110': 'j', '101000': 'k', '111000': 'l',
    '101100': 'm', '101110': 'n', '101010': 'o', '111100': 'p',
    '111110': 'q', '111010': 'r', '011100': 's', '011110': 't',
    '101001': 'u', '111001': 'v', '010111': 'w', '101101': 'x',
    '101111': 'y', '101011': 'z'
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
    const brailleChar = brailleDots[dotString];
    currentChar.textContent = brailleChar;
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
const latinResult = document.getElementById('latinResult');
const brailleResult = document.getElementById('brailleResult');

// 修改清除结果函数
function clearResult() {
    latinResult.value = '';
    brailleResult.value = '';
}

// 添加光标位置保存
let savedCursorPos = null;

// 浮动窗口控制函数
function showPopup() {
    // 保存当前光标位置
    savedCursorPos = brailleResult.selectionStart;
    braillePopup.classList.remove('opacity-0', 'pointer-events-none');
    braillePopup.classList.add('opacity-100');
}

function hidePopup() {
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

// 添加拉丁字母更新函数
function updateLatinText() {
    let latinText = '';
    for (const char of brailleResult.value) {
        // 查找点阵映射
        const dotPattern = Object.entries(brailleDots).find(([_, braille]) => braille === char);
        if (dotPattern) {
            // 如果存在拉丁字母映射则使用，否则保持空
            latinText += brailleMap[dotPattern[0]] || '';
        }
    }
    latinResult.value = latinText;
}

// 修改键盘事件处理
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const code = e.code;
    const mode = document.querySelector('input[name="inputMode"]:checked').value;
    
    if (key === ' ' || code === 'numpad0') {
        e.preventDefault();
        confirmInput();
    } else if (keyMaps[mode][key] !== undefined) {
        showPopup();
        toggleDot(keyMaps[mode][key]);
    } else if (key === 'enter') {
        e.preventDefault();
        // 如果有点位先确认输入
        if (dotStates.some(state => state)) {
            confirmInput();
        }
        // 然后插入换行
        if (savedCursorPos !== null) {
            const before = brailleResult.value.slice(0, savedCursorPos);
            const after = brailleResult.value.slice(savedCursorPos);
            brailleResult.value = before + '\n' + after;
            savedCursorPos++;
            brailleResult.setSelectionRange(savedCursorPos, savedCursorPos);
            updateLatinText();
        }
    } else if (key === 'escape') {
        hidePopup();
        clearDots();
    }
});

// 文本框输入监听
latinResult.addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase();
    let brailleText = '';
    
    // 逐字符转换为盲文
    for (const char of text) {
        // 遍历所有点阵映射找到对应字符
        for (const [dots, letter] of Object.entries(brailleMap)) {
            if (letter === char) {
                brailleText += brailleDots[dots] || char;
                break;
            }
        }
    }
    
    brailleResult.value = brailleText;
});

// 修改盲文字符输入处理
brailleResult.addEventListener('input', (e) => {
    const input = e.target;
    const text = input.value;
    const start = input.selectionStart;
    let validBrailleText = '';
    let cursorPos = start;

    // 逐字符处理 - 只保留盲文字符和换行符
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '\n' || (char >= '⠀' && char <= '⣿')) {
            validBrailleText += char;
        } else if (i < start) {
            cursorPos--;
        }
    }

    // 更新盲文文本
    input.value = validBrailleText;
    input.setSelectionRange(cursorPos, cursorPos);
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
    