// 全局变量
let uploadedFiles = [];
let currentCode = '';
let currentPixels = [];
let currentWidth = 0;
let currentHeight = 0;
let originalImageWidth = 0;
let originalImageHeight = 0;
let showLineNumbers = false;

// DOM元素
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const selectBtn = document.getElementById('select-btn');
const convertBtn = document.getElementById('convert-btn');
const clearBtn = document.getElementById('clear-btn');
const uploadedImages = document.getElementById('uploaded-images');
const resultContent = document.getElementById('result-content');
const noResult = document.getElementById('no-result');
const codeOutput = document.getElementById('code-output');
const resultFilename = document.getElementById('result-filename');
const processingInfo = document.getElementById('processing-info');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const toggleLineNumbersBtn = document.getElementById('toggle-line-numbers');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const previewContent = document.getElementById('preview-content');
const noPreview = document.getElementById('no-preview');
const previewInfo = document.getElementById('preview-info');
const pixelGrid = document.getElementById('pixel-grid');
const pixelSizeSelect = document.getElementById('pixel-size');
const previewBgSelect = document.getElementById('preview-bg');
const thresholdSlider = document.getElementById('threshold');
const thresholdValue = document.getElementById('threshold-value');
const invertColorCheckbox = document.getElementById('invert-color');
const screenSizeRadios = document.querySelectorAll('input[name="screen-size"]');
const customSizeDiv = document.getElementById('custom-size');
const customWidthInput = document.getElementById('custom-width');
const customHeightInput = document.getElementById('custom-height');
const resizingInfo = document.getElementById('resizing-info');
const resizeDetails = document.getElementById('resize-details');

// 初始化事件监听
function initEventListeners() {
    // 文件选择
    selectBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // 拖放功能
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('border-primary');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('border-primary');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-primary');
        handleFiles(e.dataTransfer.files);
    });

    dropArea.addEventListener('click', () => fileInput.click());

    // 转换和清空按钮
    convertBtn.addEventListener('click', convertAllImages);
    clearBtn.addEventListener('click', clearAllFiles);

    // 行号切换
    toggleLineNumbersBtn.addEventListener('click', toggleLineNumbers);

    // 复制和下载
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadHeaderFile);

    // 预览设置变化
    pixelSizeSelect.addEventListener('change', updatePixelGrid);
    previewBgSelect.addEventListener('change', updatePixelGrid);

    // 阈值变化
    thresholdSlider.addEventListener('input', (e) => {
        thresholdValue.textContent = e.target.value;
    });

    // 屏幕尺寸选择变化
    screenSizeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'custom') {
                customSizeDiv.classList.remove('hidden');
            } else {
                customSizeDiv.classList.add('hidden');
            }
        });
    });
}

// 处理上传的文件
function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 检查文件类型
        if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/bmp')) {
            showError(`不支持的文件格式: ${file.name}，请上传JPG、PNG或BMP图片`);
            continue;
        }

        // 检查是否已上传
        if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
            showError(`文件已上传: ${file.name}`);
            continue;
        }

        uploadedFiles.push(file);
        addImagePreview(file);
    }

    updateButtonStates();
}

// 添加图片预览
function addImagePreview(file) {
    // 清空"未选择任何图片"提示
    if (uploadedImages.querySelector('p.italic')) {
        uploadedImages.innerHTML = '';
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const preview = document.createElement('div');
            preview.className = 'flex items-center p-2 bg-gray-50 rounded-lg';
            preview.dataset.filename = file.name;

            const imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.className = 'w-12 h-12 object-cover rounded mr-3';

            const info = document.createElement('div');
            info.className = 'flex-grow min-w-0';

            const name = document.createElement('p');
            name.className = 'text-sm font-medium text-gray-800 truncate';
            name.textContent = file.name;

            const details = document.createElement('p');
            details.className = 'text-xs text-gray-500';
            details.textContent = `${(file.size / 1024).toFixed(1)} KB · ${img.width}×${img.height} 像素`;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'text-gray-400 hover:text-red-500 transition-custom';
            removeBtn.innerHTML = '<i class="fa fa-times"></i>';

            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeFile(file);
                preview.remove();
                updateButtonStates();

                // 如果没有图片了，显示提示
                if (uploadedImages.children.length === 0) {
                    uploadedImages.innerHTML = '<p class="text-gray-500 text-center italic text-sm">未选择任何图片</p>';
                }
            };

            info.appendChild(name);
            info.appendChild(details);
            preview.appendChild(imgElement);
            preview.appendChild(info);
            preview.appendChild(removeBtn);

            uploadedImages.appendChild(preview);
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// 移除文件
function removeFile(file) {
    uploadedFiles = uploadedFiles.filter(f => !(f.name === file.name && f.size === file.size));
}

// 清空所有文件
function clearAllFiles() {
    uploadedFiles = [];
    uploadedImages.innerHTML = '<p class="text-gray-500 text-center italic text-sm">未选择任何图片</p>';
    updateButtonStates();
    showNoResult();
    showNoPreview();
    currentPixels = [];
    currentWidth = 0;
    currentHeight = 0;
    originalImageWidth = 0;
    originalImageHeight = 0;
    resizingInfo.classList.add('hidden');
}

// 更新按钮状态
function updateButtonStates() {
    const hasFiles = uploadedFiles.length > 0;
    convertBtn.disabled = !hasFiles;
    clearBtn.disabled = !hasFiles;
}

// 获取当前选中的转换选项
function getConversionOptions() {
    // 屏幕尺寸
    let width, height;
    let sizeOption;

    for (const radio of screenSizeRadios) {
        if (radio.checked) {
            sizeOption = radio.value;
            if (sizeOption === '128x64') {
                width = 128;
                height = 64;
            } else if (sizeOption === '128x32') {
                width = 128;
                height = 32;
            } else {
                width = parseInt(customWidthInput.value) || 128;
                height = parseInt(customHeightInput.value) || 64;
            }
            break;
        }
    }

    // 阈值
    const threshold = parseInt(thresholdSlider.value) || 128;

    // 是否反色
    const invert = invertColorCheckbox.checked;

    // 扫描方式
    let scanOption = 'horizontal';
    const scanRadios = document.querySelectorAll('input[name="scan-option"]');
    for (const radio of scanRadios) {
        if (radio.checked) {
            scanOption = radio.value;
            break;
        }
    }

    // 是否包含头部信息
    const includeHeader = document.getElementById('include-header') ? document.getElementById('include-header').checked : true;

    return {
        width,
        height,
        threshold,
        invert,
        scanOption,
        includeHeader
    };
}

// 智能调整图片大小
function smartResizeImage(img, maxWidth, maxHeight) {
    // 获取原始尺寸
    const originalWidth = img.width;
    const originalHeight = img.height;

    // 如果图片尺寸小于或等于最大尺寸，不调整
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
        return {
            width: originalWidth,
            height: originalHeight,
            resized: false,
            originalWidth,
            originalHeight
        };
    }

    // 计算缩放比例
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const scaleRatio = Math.min(widthRatio, heightRatio);

    // 计算新尺寸
    const newWidth = Math.round(originalWidth * scaleRatio);
    const newHeight = Math.round(originalHeight * scaleRatio);

    return {
        width: newWidth,
        height: newHeight,
        resized: true,
        originalWidth,
        originalHeight
    };
}

// 转换所有图片
function convertAllImages() {
    if (uploadedFiles.length === 0) return;

    showProcessing();

    // 获取转换选项
    const options = getConversionOptions();

    // 异步处理图片，避免UI阻塞
    setTimeout(async () => {
        try {
            const result = await generateBinaryArrayForAllImages(options);
            currentCode = result.code;
            currentPixels = result.pixels;
            currentWidth = result.width;
            currentHeight = result.height;
            originalImageWidth = result.originalWidth;
            originalImageHeight = result.originalHeight;

            displayResult(currentCode, 'oled_images.h');
            displayPreview(currentWidth, currentHeight, currentPixels,
                originalImageWidth, originalImageHeight,
                result.wasResized);
        } catch (error) {
            showError(error.message);
        } finally {
            hideProcessing();
        }
    }, 100);
}

// 为所有图片生成二进制数组
async function generateBinaryArrayForAllImages(options) {
    let headerContent = `#ifndef OLED_IMAGES_H\n#define OLED_IMAGES_H\n\n`;
    headerContent += `// 自动生成的OLED图像数组\n`;
    headerContent += `// 转换选项: 最大尺寸=${options.width}×${options.height}, `;
    headerContent += `阈值=${options.threshold}, 反色=${options.invert ? '是' : '否'}, `;
    headerContent += `扫描方式=${options.scanOption === 'horizontal' ? '水平' : '垂直'}\n`;
    if (options.includeHeader) {
        headerContent += `// 数组结构：[头部(4字节) + 像素数据]\n`;
        headerContent += `// 头部定义：前2字节为宽度，后2字节为高度（均为16位小端格式）\n`;
    } else {
        headerContent += `// 数组结构：[像素数据，无头部]\n`;
    }
    headerContent += `// 像素数据：每个字节表示8个像素，1表示点亮，0表示熄灭\n\n`;

    let allPixels = [];
    let width = 0;
    let height = 0;
    let originalWidth = 0;
    let originalHeight = 0;
    let wasResized = false;

    // 处理每张图片
    for (const file of uploadedFiles) {
        const result = await processImage(file, options);
        headerContent += result.arrayData + '\n';

        // 只保存第一张图片的像素数据用于预览
        if (allPixels.length === 0) {
            allPixels = result.pixels;
            width = result.width;
            height = result.height;
            originalWidth = result.originalWidth;
            originalHeight = result.originalHeight;
            wasResized = result.wasResized;
        }
    }

    headerContent += `#endif // OLED_IMAGES_H\n`;
    return {
        code: headerContent,
        pixels: allPixels,
        width: width,
        height: height,
        originalWidth: originalWidth,
        originalHeight: originalHeight,
        wasResized: wasResized
    };
}

// 处理单张图片并生成二进制数组
async function processImage(file, options) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                // 智能调整图片大小
                const resizeResult = smartResizeImage(img, options.width, options.height);

                // 创建画布并绘制图像
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 设置画布尺寸为调整后的尺寸
                canvas.width = resizeResult.width;
                canvas.height = resizeResult.height;

                // 绘制并缩放图像（如果需要）
                if (resizeResult.resized) {
                    ctx.drawImage(img, 0, 0, resizeResult.width, resizeResult.height);
                } else {
                    // 对于小图片，直接绘制
                    ctx.drawImage(img, 0, 0);
                }

                // 处理像素数据
                const result = processCanvasImage(canvas, file, options, resizeResult);
                resolve(result);
            };

            img.onerror = () => {
                reject(new Error(`无法加载图片: ${file.name}`));
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            reject(new Error(`读取文件时出错: ${file.name}`));
        };

        reader.readAsDataURL(file);
    });
}

// 处理画布图像并生成数组和像素数据
function processCanvasImage(canvas, file, options, resizeResult) {
    try {
        const width = canvas.width;
        const height = canvas.height;

        // 获取像素数据
        const imageData = canvas.getContext('2d').getImageData(0, 0, width, height);
        const data = imageData.data;

        // 生成头部信息（4字节：宽度2字节 + 高度2字节，小端模式）
        const header = [
            width & 0xFF,
            (width >> 8) & 0xFF,
            height & 0xFF,
            (height >> 8) & 0xFF
        ];

        // 处理像素数据为二进制
        let binaryData = [];
        let pixels = []; // 用于预览的像素数据

        if (options.scanOption === 'horizontal') {
            // 水平扫描：从左到右，从上到下
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    // 计算灰度值
                    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

                    // 根据阈值判断黑白
                    let isBlack = gray < options.threshold;
                    if (options.invert) {
                        isBlack = !isBlack;
                    }

                    // 保存像素状态用于预览
                    pixels.push(isBlack ? 1 : 0);

                    // 收集二进制数据
                    binaryData.push(isBlack ? 1 : 0);
                }
            }
        } else {
            // 垂直扫描：从上到下，从左到右
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    // 计算灰度值
                    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

                    // 根据阈值判断黑白
                    let isBlack = gray < options.threshold;
                    if (options.invert) {
                        isBlack = !isBlack;
                    }

                    // 保存像素状态用于预览
                    pixels.push(isBlack ? 1 : 0);

                    // 收集二进制数据
                    binaryData.push(isBlack ? 1 : 0);
                }
            }
        }

        // 将二进制数据转换为字节数组（每8位一个字节）
        const byteArray = [];
        for (let i = 0; i < binaryData.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j < binaryData.length) {
                    byte |= (binaryData[i + j] << (7 - j)); // 高位在前
                }
            }
            byteArray.push(byte);
        }

        // 组合头部和像素数据
        let allData;
        if (options.includeHeader) {
            allData = [...header, ...byteArray];
        } else {
            allData = byteArray;
        }

        // 生成数组名称
        const baseName = file.name.replace(/\.[^/.]+$/, ""); // 移除扩展名
        const arrayName = `oled_img_${baseName.replace(/[^a-zA-Z0-9_]/g, "_")}`;

        // 生成C数组字符串
        let arrayStr = `// 图像：${file.name}`;
        if (resizeResult.resized) {
            arrayStr += `，原始尺寸：${resizeResult.originalWidth}×${resizeResult.originalHeight}，`;
            arrayStr += `调整后尺寸：${width}×${height}\n`;
        } else {
            arrayStr += `，尺寸：${width}×${height}\n`;
        }
        arrayStr += `const unsigned char ${arrayName}[${allData.length}] PROGMEM = {\n`;

        // 每行16个字节
        for (let i = 0; i < allData.length; i += 16) {
            const lineData = allData.slice(i, i + 16);
            const lineItems = lineData.map(byte => `0x${byte.toString(16).padStart(2, '0').toUpperCase()}`);
            arrayStr += `    ${lineItems.join(', ')},\n`;
        }

        // 移除最后一行的逗号
        arrayStr = arrayStr.replace(/,\n$/, "\n");
        arrayStr += `};\n`;

        return {
            arrayData: arrayStr,
            pixels: pixels,
            width: width,
            height: height,
            originalWidth: resizeResult.originalWidth,
            originalHeight: resizeResult.originalHeight,
            wasResized: resizeResult.resized
        };
    } catch (error) {
        throw new Error(`处理图片 ${file.name} 时出错: ${error.message}`);
    }
}

// 显示处理中状态
function showProcessing() {
    noResult.classList.add('hidden');
    resultContent.classList.add('hidden');
    errorMessage.classList.add('hidden');
    processingInfo.classList.remove('hidden');

    // 同时隐藏预览
    noPreview.classList.add('hidden');
    previewContent.classList.add('hidden');
}

// 隐藏处理中状态
function hideProcessing() {
    processingInfo.classList.add('hidden');
}

// 显示无结果状态
function showNoResult() {
    resultContent.classList.add('hidden');
    processingInfo.classList.add('hidden');
    errorMessage.classList.add('hidden');
    noResult.classList.remove('hidden');
}

// 显示结果
function displayResult(code, filename) {
    resultFilename.textContent = filename;
    currentCode = code;
    codeOutput.textContent = code;
    noResult.classList.add('hidden');
    resultContent.classList.remove('hidden');
    applyCodeTheme();
}

// 显示点阵预览
function displayPreview(width, height, pixels, originalWidth, originalHeight, wasResized) {
    if (!pixels || pixels.length === 0) {
        showNoPreview();
        return;
    }

    previewInfo.textContent = `尺寸: ${width}×${height} 像素 · 像素数: ${pixels.length}`;
    noPreview.classList.add('hidden');
    previewContent.classList.remove('hidden');

    // 显示调整大小信息
    if (wasResized) {
        resizeDetails.textContent = `${originalWidth}×${originalHeight} → ${width}×${height}`;
        resizingInfo.classList.remove('hidden');
    } else {
        resizingInfo.classList.add('hidden');
    }

    // 创建像素网格
    createPixelGrid(width, height, pixels);
}

// 显示无预览状态
function showNoPreview() {
    previewContent.classList.add('hidden');
    noPreview.classList.remove('hidden');
    resizingInfo.classList.add('hidden');
}

// 创建像素网格
function createPixelGrid(width, height, pixels) {
    pixelGrid.innerHTML = '';
    pixelGrid.style.width = `${width * getPixelSize()}px`;

    // 设置背景颜色
    const bgColor = previewBgSelect.value === 'black' ? '#000' : '#fff';
    const pixelColor = previewBgSelect.value === 'black' ? '#fff' : '#000';
    pixelGrid.parentElement.style.backgroundColor = bgColor;

    // 创建每个像素
    pixels.forEach(pixel => {
        const pixelElement = document.createElement('div');
        const sizeClass = `pixel-${pixelSizeSelect.value}`;

        pixelElement.className = `pixel ${sizeClass}`;
        pixelElement.style.backgroundColor = pixel ? pixelColor : bgColor;

        pixelGrid.appendChild(pixelElement);
    });
}

// 获取当前像素大小
function getPixelSize() {
    switch (pixelSizeSelect.value) {
        case 'small': return 4;
        case 'medium': return 8;
        case 'large': return 16;
        default: return 8;
    }
}

// 更新像素网格（当设置改变时）
function updatePixelGrid() {
    if (currentPixels.length > 0 && currentWidth > 0 && currentHeight > 0) {
        createPixelGrid(currentWidth, currentHeight, currentPixels);
    }
}

// 显示错误信息
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');

    // 5秒后自动隐藏错误信息
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// 切换行号显示
function toggleLineNumbers() {
    showLineNumbers = !showLineNumbers;
    applyCodeTheme();
}

// 应用代码主题
function applyCodeTheme() {
    codeOutput.className = 'p-3 rounded-lg text-sm overflow-x-auto max-h-64 font-mono bg-gray-50 text-gray-800';

    // 处理行号
    if (showLineNumbers && currentCode) {
        const lines = currentCode.split('\n');
        let codeWithLines = '';
        lines.forEach((line, index) => {
            const lineNum = (index + 1).toString().padStart(3, ' ') + ' | ';
            codeWithLines += lineNum + line + '\n';
        });
        codeOutput.textContent = codeWithLines;
    } else {
        codeOutput.textContent = currentCode;
    }
}

// 复制到剪贴板
function copyToClipboard() {
    if (!currentCode) return;

    navigator.clipboard.writeText(currentCode).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa fa-check mr-1"></i>已复制';
        copyBtn.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        copyBtn.classList.add('bg-green-100', 'text-green-700');

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('bg-green-100', 'text-green-700');
            copyBtn.classList.add('bg-gray-100', 'hover:bg-gray-200');
        }, 2000);
    }).catch(err => {
        showError('复制失败，请手动复制');
        console.error('复制失败:', err);
    });
}

// 下载头文件
function downloadHeaderFile() {
    if (!currentCode) return;

    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oled_images.h';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 初始化
document.addEventListener('DOMContentLoaded', initEventListeners);