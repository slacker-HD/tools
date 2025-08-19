// DOM元素
const chineseInput = document.getElementById('chinese-input');
const charPreviewContainer = document.getElementById('char-preview-container');
const fontSelect = document.getElementById('font-select');
const fontCount = document.getElementById('font-count');
const fontPreview = document.getElementById('font-preview').querySelector('span');
const fontBold = document.getElementById('font-bold');
const fontItalic = document.getElementById('font-italic');
const matrixSizeX = document.getElementById('matrix-size');
const matrixSizeY = document.getElementById('matrix-size-y');
const sizePresets = document.querySelectorAll('.size-preset');
const threshold = document.getElementById('threshold');
const thresholdValue = document.getElementById('threshold-value');
const thresholdPresets = document.querySelectorAll('.threshold-preset');
const autoThreshold = document.getElementById('auto-threshold');
const generateBtn = document.getElementById('generate-btn');
const matrixPreview = document.getElementById('matrix-preview');
const previewPlaceholder = document.getElementById('preview-placeholder');
const codeOutput = document.getElementById('code-output');
const copyCodeBtn = document.getElementById('copy-code');
const copySuccess = document.getElementById('copy-success');
const downloadCodeBtn = document.getElementById('download-code');

// 中文字符检测正则
const chineseRegex = /[\u4e00-\u9fa5]/;
// 常用中文字符集（用于字体支持性测试）
const testChineseChars = '星期三测试字体';

// 初始化
function init() {
    // 显示默认字符预览
    updateCharPreview('星期三');
    chineseInput.value = '星期三';

    // 加载系统字体
    loadAllSystemFonts();

    // 事件监听
    threshold.addEventListener('input', () => {
        thresholdValue.textContent = threshold.value;
    });

    // 阈值预设
    thresholdPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            const value = parseInt(preset.dataset.value);
            threshold.value = value;
            thresholdValue.textContent = value;
        });
    });

    // 点阵大小输入验证
    matrixSizeX.addEventListener('input', () => {
        validateMatrixSize(matrixSizeX);
    });

    matrixSizeY.addEventListener('input', () => {
        validateMatrixSize(matrixSizeY);
    });

    // 常用尺寸快捷选择
    sizePresets.forEach(preset => {
        preset.addEventListener('click', () => {
            matrixSizeX.value = preset.dataset.w;
            matrixSizeY.value = preset.dataset.h;
            validateMatrixSize(matrixSizeX);
            validateMatrixSize(matrixSizeY);
        });
    });

    // 字体样式变更时更新预览
    chineseInput.addEventListener('input', () => {
        updateCharPreview(chineseInput.value);
        updateFontPreviewText();
        updateFontPreview();
    });

    fontSelect.addEventListener('change', () => {
        updateFontPreview();
        // 对于宋体等特殊字体，自动建议加粗
        const selectedFont = fontSelect.value;
        if (selectedFont.includes('宋体') || selectedFont.includes('SimSun')) {
            fontBold.checked = true;
            updateFontPreview();
        }
    });

    // 字体加粗/斜体变更
    fontBold.addEventListener('change', updateFontPreview);
    fontItalic.addEventListener('change', updateFontPreview);

    generateBtn.addEventListener('click', generateMatrix);
    copyCodeBtn.addEventListener('click', copyCode);
    downloadCodeBtn.addEventListener('click', downloadCode);

    // 监听编码模式变化，重新生成预览
    document.querySelectorAll('input[name="code-mode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (codeOutput.textContent) {
                generateMatrix();
            }
        });
    });
}

// 验证点阵大小输入
function validateMatrixSize(input) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) {
        value = 1;
    } else if (value > 64) {
        value = 64;
    }
    input.value = value;
}

// 加载所有系统字体
async function loadAllSystemFonts() {
    try {
        // 先清空选择框
        fontSelect.innerHTML = '';

        // 显示加载状态
        const loadingOption = document.createElement('option');
        loadingOption.value = '';
        loadingOption.textContent = '正在加载系统字体...';
        loadingOption.disabled = true;
        loadingOption.selected = true;
        fontSelect.appendChild(loadingOption);

        // 检查浏览器是否支持FontFaceSet API
        if (!window.FontFaceSet) {
            loadFallbackFonts();
            return;
        }

        // 获取所有可用字体
        const fonts = await document.fonts.ready.then(() => {
            return Array.from(document.fonts).filter(font => font.status === 'loaded');
        });

        const fontFamilies = new Set();

        // 提取所有字体家族名称
        fonts.forEach(font => {
            const family = font.family.replace(/"/g, '');
            if (family && !fontFamilies.has(family)) {
                fontFamilies.add(family);
            }
        });

        // 如果没有通过FontFace API获取到字体，则尝试使用系统默认方法
        if (fontFamilies.size === 0) {
            // 使用更通用的方法获取系统字体
            const commonFonts = [
                '微软雅黑', 'Microsoft YaHei', 'SimSun', '宋体', 'SimHei', '黑体',
                'KaiTi', '楷体', 'FangSong', '仿宋', 'YouYuan', '幼圆',
                'STSong', '华文宋体', 'STHeiti', '华文黑体', 'STKaiti', '华文楷体',
                'STZhongsong', '华文中宋', 'STXihei', '华文细黑', 'Arial', 'Times New Roman'
            ];

            commonFonts.forEach(font => fontFamilies.add(font));
        }

        // 转换为数组并排序
        const sortedFonts = Array.from(fontFamilies).sort((a, b) => a.localeCompare(b));

        // 清空并更新下拉框
        fontSelect.innerHTML = '';

        if (sortedFonts.length === 0) {
            loadFallbackFonts();
        } else {
            // 添加所有检测到的字体
            let hasSelected = false;
            sortedFonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font;
                option.textContent = font;
                // 默认选择微软雅黑或Microsoft YaHei
                if (!hasSelected && (font.includes('微软雅黑') || font.includes('Microsoft YaHei'))) {
                    option.selected = true;
                    hasSelected = true;
                } else if (!hasSelected && (font.includes('黑体') || font.includes('SimHei') || font === 'Arial')) {
                    option.selected = true;
                    hasSelected = true;
                }
                fontSelect.appendChild(option);
            });
            fontCount.textContent = sortedFonts.length;

            // 如果没有默认选中的字体，选中第一个
            if (!hasSelected && sortedFonts.length > 0) {
                fontSelect.options[0].selected = true;
            }
        }

        // 更新字体预览
        updateFontPreview();

    } catch (error) {
        console.error('加载系统字体失败:', error);
        loadFallbackFonts();
    }
}

// 加载备用字体列表
function loadFallbackFonts() {
    const fallbackFonts = [
        // 中文字体
        "微软雅黑", "SimSun", "宋体", "SimHei", "黑体", "KaiTi",
        "Microsoft YaHei", "YouYuan", "幼圆",
        "STSong", "华文宋体", "STHeiti", "华文黑体",
        "STKaiti", "华文楷体", "STZhongsong", "华文中宋",
        "STXihei", "华文细黑", "楷体"
    ];

    // 清空并填充下拉框
    fontSelect.innerHTML = '';
    fallbackFonts.forEach((font, index) => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        // 默认选择第一个字体
        if (index === 0) {
            option.selected = true;
        }
        fontSelect.appendChild(option);
    });

    fontCount.textContent = fallbackFonts.length;
}

// 更新字体预览
function updateFontPreview() {
    const selectedFont = fontSelect.value;
    if (selectedFont) {
        // 应用字体样式（加粗、斜体）
        let fontWeight = fontBold.checked ? 'bold' : 'normal';
        let fontStyle = fontItalic.checked ? 'italic' : 'normal';

        fontPreview.style.fontFamily = `"${selectedFont}", sans-serif`;
        fontPreview.style.fontWeight = fontWeight;
        fontPreview.style.fontStyle = fontStyle;
    }
}

// 更新字体预览文本
function updateFontPreviewText() {
    const text = chineseInput.value.trim() || '星期三测试字体';
    fontPreview.textContent = `字体预览：${text}`;
}

// 更新字符预览
function updateCharPreview(text) {
    charPreviewContainer.innerHTML = '';

    if (!text) return;

    for (let i = 0; i < text.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'px-3 py-1 bg-gray-100 rounded text-gray-700';
        charSpan.textContent = text[i];
        charPreviewContainer.appendChild(charSpan);
    }
}

// 根据字体类型获取推荐的阈值
function getRecommendedThreshold(fontFamily) {
    // 对于宋体等较细的字体，推荐较高的阈值使点阵更清晰
    if (fontFamily.includes('宋体') || fontFamily.includes('SimSun')) {
        return 160;
    }
    // 对于楷体等有笔触变化的字体
    else if (fontFamily.includes('楷体') || fontFamily.includes('KaiTi')) {
        return 140;
    }
    // 对于黑体等较粗的字体
    else if (fontFamily.includes('黑体') || fontFamily.includes('SimHei')) {
        return 110;
    }
    // 默认阈值
    return 128;
}

// 生成点阵数据
function generateMatrix() {
    const text = chineseInput.value.trim();
    if (!text) {
        alert('请输入汉字');
        return;
    }

    // 验证点阵尺寸
    validateMatrixSize(matrixSizeX);
    validateMatrixSize(matrixSizeY);

    const sizeX = parseInt(matrixSizeX.value);
    const sizeY = parseInt(matrixSizeY.value);
    const scanRow = document.getElementById('scan-row').checked;
    const codeBlack = document.getElementById('code-black').checked;
    const selectedFont = fontSelect.value;
    const isBold = fontBold.checked;
    const isItalic = fontItalic.checked;

    if (!selectedFont) {
        alert('请选择字体');
        return;
    }

    // 确定最终使用的阈值
    let thresholdValue;
    if (autoThreshold.checked) {
        thresholdValue = getRecommendedThreshold(selectedFont);
        // 更新UI显示
        threshold.value = thresholdValue;
        thresholdValue.textContent = thresholdValue;
    } else {
        thresholdValue = parseInt(threshold.value);
    }

    // 清空之前的预览
    matrixPreview.innerHTML = '';
    matrixPreview.classList.remove('hidden');
    previewPlaceholder.classList.add('hidden');

    // 为每个字符生成点阵
    const allMatrices = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const canvas = document.createElement('canvas');
        canvas.width = sizeX;
        canvas.height = sizeY;

        // 生成单个字符的点阵
        const matrix = generateCharMatrix(canvas, char, sizeX, sizeY, thresholdValue,
            selectedFont, isBold, isItalic);
        allMatrices.push({ char, matrix });

        // 显示预览
        displayMatrixPreview(canvas, char, sizeX, sizeY);
    }

    // 生成C代码
    generateCCode(allMatrices, sizeX, sizeY, scanRow, codeBlack);
}

// 生成单个字符的点阵数据（优化版）
function generateCharMatrix(canvas, char, sizeX, sizeY, threshold, fontFamily, isBold, isItalic) {
    const ctx = canvas.getContext('2d');

    // 增加缩放因子以提高精度，特别是对于小尺寸点阵
    const scaleFactor = Math.max(8, Math.floor(64 / Math.max(sizeX, sizeY)));
    const tempSizeX = sizeX * scaleFactor;
    const tempSizeY = sizeY * scaleFactor;

    // 创建临时画布进行高质量缩放
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tempSizeX;
    tempCanvas.height = tempSizeY;
    const tempCtx = tempCanvas.getContext('2d');

    // 设置字体和样式
    let fontWeight = isBold ? 'bold' : 'normal';
    let fontStyle = isItalic ? 'italic' : 'normal';

    // 对于宋体等较细字体，适当增大字号比例以提高识别度
    let fontSizeRatio = 0.9; // 增加基础比例
    if (fontFamily.includes('宋体') || fontFamily.includes('SimSun')) {
        fontSizeRatio = 1.0; // 进一步增加宋体的比例
    }

    const fontSize = Math.min(tempSizeX, tempSizeY) * fontSizeRatio;
    tempCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';

    // 绘制字符 - 使用双重绘制增强细字体的显示效果
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, tempSizeX, tempSizeY);
    tempCtx.fillStyle = 'white';

    // 对于细字体，绘制多次以增强效果
    if ((fontFamily.includes('宋体') || fontFamily.includes('SimSun')) && !isBold) {
        // 主绘制
        tempCtx.fillText(char, tempSizeX / 2, tempSizeY / 2);
        // 轻微偏移再次绘制，模拟加粗效果
        tempCtx.fillText(char, tempSizeX / 2 + 1, tempSizeY / 2);
        tempCtx.fillText(char, tempSizeX / 2, tempSizeY / 2 + 1);
        tempCtx.fillText(char, tempSizeX / 2 + 1, tempSizeY / 2 + 1);
    } else {
        tempCtx.fillText(char, tempSizeX / 2, tempSizeY / 2);
    }

    // 缩小到目标尺寸，使用更平滑的缩放算法
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, 0, 0, sizeX, sizeY);

    // 获取像素数据并转换为点阵
    const imageData = ctx.getImageData(0, 0, sizeX, sizeY);
    const data = imageData.data;
    const matrix = [];

    // 对宋体等字体应用额外的形态学处理，增强连通性
    let processedData = data;
    if ((fontFamily.includes('宋体') || fontFamily.includes('SimSun')) && !isBold) {
        processedData = enhanceThinFonts(imageData, sizeX, sizeY);
    }

    // 生成矩阵数据
    for (let y = 0; y < sizeY; y++) {
        const row = [];
        for (let x = 0; x < sizeX; x++) {
            const index = (y * sizeX + x) * 4;
            const gray = (processedData[index] + processedData[index + 1] + processedData[index + 2]) / 3;
            // 根据阈值判断是否为黑点
            row.push(gray < threshold ? 1 : 0);
        }
        matrix.push(row);
    }

    return matrix;
}

// 增强细字体的显示效果（针对宋体等）
function enhanceThinFonts(imageData, width, height) {
    const data = new Uint8ClampedArray(imageData.data);
    const output = new Uint8ClampedArray(data);

    // 更强的膨胀算法，增强细线条
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const index = (y * width + x) * 4;

            // 如果当前像素是较亮的（文字边缘部分）
            if (data[index] > 100) { // 降低阈值以便捕获更多边缘像素
                // 检查周围像素
                const neighbors = [
                    (y - 1) * width + x,     // 上
                    (y + 1) * width + x,     // 下
                    y * width + (x - 1),     // 左
                    y * width + (x + 1),     // 右
                    (y - 1) * width + (x - 1), // 左上
                    (y - 1) * width + (x + 1), // 右上
                    (y + 1) * width + (x - 1), // 左下
                    (y + 1) * width + (x + 1)  // 右下
                ];

                // 如果周围有较亮像素，强化当前像素
                let hasBrightNeighbor = false;
                for (const neighbor of neighbors) {
                    const nIndex = neighbor * 4;
                    if (data[nIndex] > 100) {
                        hasBrightNeighbor = true;
                        break;
                    }
                }

                if (hasBrightNeighbor) {
                    output[index] = 255;
                    output[index + 1] = 255;
                    output[index + 2] = 255;
                }
            }
        }
    }

    return output;
}

// 显示点阵预览
function displayMatrixPreview(canvas, char, sizeX, sizeY) {
    const previewWrapper = document.createElement('div');
    previewWrapper.className = 'text-center';

    // 字符标签和尺寸信息
    const charLabel = document.createElement('div');
    charLabel.className = 'mb-2 font-medium';
    charLabel.textContent = `${char} (${sizeX}×${sizeY})`;
    previewWrapper.appendChild(charLabel);

    // 计算每个点的大小
    const maxPreviewSize = 200;
    const cellSize = Math.min(
        Math.floor(maxPreviewSize / sizeX),
        Math.floor(maxPreviewSize / sizeY)
    );

    // 点阵容器
    const matrixContainer = document.createElement('div');
    matrixContainer.className = `inline-grid gap-[1px] bg-gray-300 p-1 rounded`;
    matrixContainer.style.gridTemplateColumns = `repeat(${sizeX}, ${cellSize}px)`;

    // 获取点阵数据
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, sizeX, sizeY);
    const data = imageData.data;

    // 获取当前编码模式
    const codeBlack = document.getElementById('code-black').checked;

    // 绘制点阵
    for (let y = 0; y < sizeY; y++) {
        for (let x = 0; x < sizeX; x++) {
            const index = (y * sizeX + x) * 4;
            const isBlackPixel = data[index] < 128;

            // 根据编码模式计算实际值
            let value;
            if (codeBlack) {
                value = isBlackPixel ? 0 : 1;
            } else {
                value = isBlackPixel ? 1 : 0;
            }

            const pixel = document.createElement('div');
            pixel.className = `aspect-square ${value === 1 ? 'bg-primary' : 'bg-white'}`;
            matrixContainer.appendChild(pixel);
        }
    }

    previewWrapper.appendChild(matrixContainer);
    matrixPreview.appendChild(previewWrapper);
}

// 生成C语言代码
function generateCCode(matrices, sizeX, sizeY, scanRow, codeBlack) {
    // 计算每个字符的字节数
    const bytesPerChar = Math.ceil((sizeX * sizeY) / 8);

    let code = `// 汉字点阵数据: ${matrices.map(m => m.char).join('')}\n`;
    code += `// 点阵大小: ${sizeX}×${sizeY} | ${scanRow ? '横向' : '纵向'}取模 | ${codeBlack ? '阴码(0=像素)' : '阳码(1=像素)'}\n`;
    code += `// 使用字体: ${fontSelect.options[fontSelect.selectedIndex].text} ${fontBold.checked ? '加粗' : ''}${fontItalic.checked ? '斜体' : ''}\n`;
    code += `// 二值化阈值: ${threshold.value}${autoThreshold.checked ? ' (自动)' : ''}\n\n`;
    code += `const unsigned char chinese_font[${matrices.length}][${bytesPerChar}] = {\n`;

    matrices.forEach(({ char, matrix }, index) => {
        code += `    // ${char}\n    { `;

        // 转换点阵为字节数组
        const bytes = [];
        if (scanRow) {
            // 横向取模
            for (let y = 0; y < sizeY; y++) {
                for (let x = 0; x < sizeX; x += 8) {
                    let byte = 0;
                    for (let i = 0; i < 8 && x + i < sizeX; i++) {
                        let pixel = matrix[y][x + i];
                        // 阴码/阳码转换
                        if (codeBlack) pixel = 1 - pixel;

                        if (pixel) {
                            byte |= (1 << (7 - i));
                        }
                    }
                    bytes.push(byte);
                }
            }
        } else {
            // 纵向取模
            for (let x = 0; x < sizeX; x++) {
                for (let y = 0; y < sizeY; y += 8) {
                    let byte = 0;
                    for (let i = 0; i < 8 && y + i < sizeY; i++) {
                        let pixel = matrix[y + i][x];
                        // 阴码/阳码转换
                        if (codeBlack) pixel = 1 - pixel;

                        if (pixel) {
                            byte |= (1 << (7 - i));
                        }
                    }
                    bytes.push(byte);
                }
            }
        }

        // 格式化字节数组
        code += bytes.map(b => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`).join(', ');
        code += index === matrices.length - 1 ? ' }\n' : ' },\n';
    });

    code += '};';
    codeOutput.textContent = code;
}

// 复制代码
function copyCode() {
    const code = codeOutput.textContent;
    navigator.clipboard.writeText(code).then(() => {
        // 显示复制成功提示
        copySuccess.style.opacity = '1';
        setTimeout(() => {
            copySuccess.style.opacity = '0';
        }, 2000);
    });
}

// 下载代码
function downloadCode() {
    const code = codeOutput.textContent;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'chinese_font.h';
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// 初始化应用
window.addEventListener('DOMContentLoaded', init);