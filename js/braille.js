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

// // 点阵与字符映射 - 确保与标准布莱叶点位一致
// const brailleMap = {
//     // 空格和轻声
//     '000000': ['⠀', '轻声'],      // 空格/轻声
//     // 英文字母映射
//     '100000': ['a'],            // ⠁ a
//     '110000': ['b'],            // ⠃ b
//     '100100': ['c'],            // ⠉ c
//     '100110': ['d'],            // ⠙ d
//     '100010': ['e'],            // ⠑ e
//     '110100': ['f'],            // ⠋ f
//     '110110': ['g'],            // ⠛ g
//     '110010': ['h'],            // ⠓ h
//     '010100': ['i'],            // ⠊ i
//     '010110': ['j'],            // ⠚ j
//     '101000': ['k'],            // ⠅ k
//     '111000': ['l'],            // ⠇ l
//     '101100': ['m'],            // ⠍ m
//     '101110': ['n'],            // ⠝ n
//     '101010': ['o'],            // ⠕ o
//     '111100': ['p'],            // ⠏ p
//     '111110': ['q'],            // ⠟ q
//     '111010': ['r'],            // ⠗ r
//     '011100': ['s'],            // ⠎ s
//     '011110': ['t'],            // ⠞ t
//     '101001': ['u'],            // ⠥ u
//     '111001': ['v'],            // ⠧ v
//     '010111': ['w'],            // ⠺ w
//     '101101': ['x'],            // ⠭ x
//     '101111': ['y'],            // ⠽ y
//     '101011': ['z'],            // ⠵ z

//     // 声母部分 - 双读音声母（与韵母组合规则）
//     '110110': ['g(歌)/j(机)'],     // ⠛ g/j: g用于a/o/e等，j用于i/ü - 1245点
//     '101000': ['k(科)/q(期)'],     // ⠅ k/q: k用于a/o/e等，q用于i/ü - 13点
//     '110010': ['h(喝)/x(西)'],     // ⠓ h/x: h用于a/o/e等，x用于i/ü - 125点
//     '110000': ['b(播)'],           // ⠃ b - 12点
//     '111100': ['p(坡)'],           // ⠏ p - 1234点
//     '101100': ['m(摸)'],           // ⠍ m - 134点
//     '110100': ['f(佛)'],           // ⠋ f - 124点
//     '100110': ['d(得)'],           // ⠙ d - 145点
//     '011110': ['t(特)'],           // ⠞ t - 2345点
//     '101110': ['n(讷)'],           // ⠝ n - 1345点
//     '111000': ['l(勒)'],           // ⠇ l - 123点
//     '001100': ['zh(知)'],          // ⠌ zh - 34点
//     '111110': ['ch(吃)'],          // ⠟ ch - 12345点
//     '110001': ['sh(诗)'],          // ⠱ sh - 156点
//     '010110': ['r(日)'],           // ⠚ r - 245点
//     '101011': ['z(子)'],           // ⠵ z - 1356点
//     '100100': ['c(词)'],           // ⠉ c - 14点
//     '011100': ['s(思)'],           // ⠎ s - 234点

//     // 数字（使用数字记号 + 字母a-j）
//     '001111': ['#'],            // ⠼ 数字记号
//     '100000': ['1'],            // ⠁ 1 (数字记号 + a)
//     '110000': ['2'],            // ⠃ 2 (数字记号 + b)
//     '100100': ['3'],            // ⠉ 3 (数字记号 + c)
//     '100110': ['4'],            // ⠙ 4 (数字记号 + d)
//     '100010': ['5'],            // ⠑ 5 (数字记号 + e)
//     '110100': ['6'],            // ⠋ 6 (数字记号 + f)
//     '110110': ['7'],            // ⠛ 7 (数字记号 + g)
//     '110010': ['8'],            // ⠓ 8 (数字记号 + h)
//     '010100': ['9'],            // ⠊ 9 (数字记号 + i)
//     '010110': ['0'],            // ⠚ 0 (数字记号 + j)
//     // 数字（1-9,0 全部下移一格实现圆圈数字效果）
//     '010000': ['①'],            // ⠈ 圆圈1 (2)
//     '011000': ['②'],            // ⠘ 圆圈2 (2,3)
//     '010100': ['③'],            // ⠊ 圆圈3 (2,5)
//     '010110': ['④'],            // ⠚ 圆圈4 (2,5,6)
//     '010010': ['⑤'],            // ⠒ 圆圈5 (2,6)
//     '011100': ['⑥'],            // ⠜ 圆圈6 (2,3,5)
//     '011110': ['⑦'],            // ⠞ 圆圈7 (2,3,5,6)
//     '011010': ['⑧'],            // ⠲ 圆圈8 (2,3,6)
//     '001100': ['⑨'],            // ⠆ 圆圈9 (3,5)
//     '001110': ['🄋'],            // ⠖ 圆圈0 (3,5,6)

//     // 韵母部分 - 简单韵母
//     '000101': ['a(啊)'],          // ⠔ 韵母a - 35点
//     '001010': ['o/e(哦/额)'],     // ⠢ 韵母o/e - 26点
//     '010100': ['i(衣)'],          // ⠊ 韵母i - 24点
//     '101001': ['u(乌)'],          // ⠥ 韵母u - 136点
//     '001110': ['ü(鱼)'],          // ⠬ 韵母ü - 346点
//     '111010': ['er(儿)'],         // ⠗ 韵母er - 1235点

//     // 韵母部分 - 复韵母
//     '010110': ['ai(爱)'],         // ⠪ 韵母ai - 246点
//     '011010': ['ao(奥)'],         // ⠖ 韵母ao - 235点
//     '011110': ['ei(诶)'],         // ⠮ 韵母ei - 2346点
//     '111011': ['ou(欧)'],         // ⠷ 韵母ou - 12356点
//     '110100': ['ia(呀)'],         // ⠫ 韵母ia - 1246点
//     '100010': ['ie(耶)'],         // ⠑ 韵母ie - 15点
//     '111111': ['ua(哇)'],         // ⠳ 韵母ua - 123456点
//     '001110': ['iao(妖)'],        // ⠜ 韵母iao - 345点
//     '101010': ['iu(优)'],         // ⠕ 韵母iu - 1256点
//     '011100': ['ui(威)'],         // ⠻ 韵母ui - 2456点

//     // 韵母部分 - 鼻韵母
//     '001110': ['ang(昂)'],        // ⠒ 韵母ang - 236点
//     '001111': ['eng(鞥)'],        // ⠔ 韵母eng - 3456点
//     '101101': ['iang(央)'],       // ⠦ 韵母iang - 1346点
//     '000011': ['ing(英)'],        // ⠂ 韵母ing - 16点
//     '011110': ['uang(汪)'],       // ⠴ 韵母uang - 2356点
//     '000110': ['ong(轰)'],        // ⠠ 韵母ong - 256点
//     '100110': ['ian(烟)'],        // ⠦ 韵母ian - 146点
//     '110010': ['in(因)'],         // ⠂ 韵母in - 126点
//     '111100': ['uan(弯)'],        // ⠼ 韵母uan - 12456点 
//     '001010': ['uen(温)'],        // ⠨ 韵母uen - 25点
//     '111010': ['üan(冤)'],        // ⠸ 韵母üan - 12346点
//     '110110': ['iong(拥)'],       // ⠸ 韵母iong - 1456点

//     // 声调部分
//     '100000': ['声调:阴平', '⠁'],    // ⠁ 1点 - 阴平(ˉ) 如"妈mā"
//     '010000': ['声调:阳平', '⠂'],    // ⠂ 2点 - 阳平(ˊ) 如"麻má"
//     '001000': ['声调:上声', '⠄'],    // ⠄ 3点 - 上声(ˇ) 如"马mǎ"
//     '011000': ['声调:去声', '⠆'],    // ⠆ 23点 - 去声(ˋ) 如"骂mà"
// };
const brailleMap = {
    '000000': ['⠀', '轻声'],      // 空格/轻声

    '100000': ['a', '1', '声调:阴平', '⠁'],            // ⠁ a, 1, 阴平
    '110000': ['b', '2'],            // ⠃ b, 2
    '100100': ['c', '3', '③', 'c(词)'],            // ⠉ c, 3, 圆圈3, c(词)
    '100110': ['d', '4', 'd(得)', 'ian(烟)'],            // ⠙ d, 4, d(得), ian(烟)
    '100010': ['e', '5', 'ie(耶)'],            // ⠑ e, 5, ie(耶)
    '110100': ['f', '6', 'f(佛)', 'ia(呀)', 'iu(优)'],            // ⠋ f, 6, f(佛), ia(呀), iu(优)
    '110110': ['g', '7', 'g(歌)/j(机)', 'iang(央)', 'iong(拥)'],            // ⠛ g, 7, g/j, iang, iong
    '110010': ['h', '8', 'h(喝)/x(西)', 'in(因)', '⑧'],            // ⠓ h, 8, h/x, in, 圆圈8
    '010100': ['i', '9', '③', 'i(衣)', 'ei(诶)', 'üan(冤)'],            // ⠊ i, 9, 圆圈3, i, ei, üan
    '010110': ['j', '0', 'r(日)', 'ai(爱)', 'iao(妖)', 'ing(英)'],            // ⠚ j, 0, r, ai, iao, ing
    
    '101000': ['k', 'k(科)/q(期)'],            // ⠅ k, k/q
    '111000': ['l', 'l(勒)'],            // ⠇ l, l(勒)
    '101100': ['m', 'm(摸)'],            // ⠍ m, m(摸)
    '011100': ['s', '⑥', 's(思)', 'ui(威)', 'uang(汪)'],            // ⠎ s, 圆圈6, s(思), ui, uang
    '101001': ['u', 'u(乌)'],            // ⠥ u, u(乌)
    '010111': ['w'],            // ⠺ w
    '101101': ['x', 'iang(央)'],            // ⠭ x, iang(央)
    '101111': ['y'],            // ⠽ y
    '101011': ['z', 'z(子)'],            // ⠵ z, z(子)

    '111100': ['p', 'p(坡)', 'uan(弯)'],           // ⠏ p, p(坡), uan(弯)
    '111110': ['q', 'ch(吃)', '⑦'],           // ⠟ q, ch(吃), 圆圈7
    '110001': ['sh(诗)'],          // ⠱ sh - 156点
    '001100': ['zh(知)', '⑨'],          // ⠌ zh - 34点, 圆圈9
    '001111': ['#', 'eng(鞥)'],            // ⠼ 数字记号, eng(鞥)

    '010000': ['①', '声调:阳平', '⠂'],            // ⠈ 圆圈1, 阳平
    '011000': ['②', '声调:去声', '⠆'],            // ⠘ 圆圈2, 去声
    '010010': ['⑤'],            // ⠒ 圆圈5
    '011010': ['⑧', 'ao(奥)', 'ou(欧)'],            // ⠲ 圆圈8, ao(奥), ou(欧)
    '001110': ['ü', '🄋', 'iao(妖)', 'ang(昂)', 'ong(轰)'],            // ⠬ 韵母ü, 圆圈0, iao, ang, ong

    '000101': ['a(啊)'],          // ⠔ 韵母a - 35点
    '001010': ['o/e(哦/额)', 'uen(温)'],     // ⠢ 韵母o/e, uen(温)
    '111010': ['er(儿)', 'r(日)', 'üan(冤)'],         // ⠗ 韵母er, r(日), üan(冤)
    '011110': ['t', 't(特)', 'ei(诶)', 'ou(欧)', 'iong(拥)'],         // ⠞ t, t(特), ei, ou, iong
    '111011': ['ou(欧)'],         // ⠷ 韵母ou - 12356点
    '111111': ['ua(哇)'],         // ⠳ 韵母ua - 123456点
    '101010': ['iu(优)'],         // ⠕ 韵母iu - 1256点
    '000011': ['ing(英)'],        // ⠂ 韵母ing - 16点
    '000110': ['ong(轰)'],        // ⠠ 韵母ong - 256点
    '110010': ['in(因)'],         // ⠂ 韵母in - 126点

    '001000': ['声调:上声', '⠄'],    // ⠄ 3点 - 上声(ˇ)
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
