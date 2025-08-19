// DOM元素
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const selectBtn = document.getElementById('select-btn');
const convertBtn = document.getElementById('convert-btn');
const clearBtn = document.getElementById('clear-btn');
const uploadedImages = document.getElementById('uploaded-images');
const noResult = document.getElementById('no-result');
const resultContent = document.getElementById('result-content');
const resultFilename = document.getElementById('result-filename');
const codeOutput = document.getElementById('code-output');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const processingInfo = document.getElementById('processing-info');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const sizeOptions = document.querySelectorAll('input[name="size-option"]');
const customSizeContainer = document.getElementById('custom-size-container');
const customWidth = document.getElementById('custom-width');
const customHeight = document.getElementById('custom-height');
const scanOptions = document.querySelectorAll('input[name="scan-option"]');
const formatOptions = document.querySelectorAll('input[name="format-option"]');
// 点阵预览相关元素
const noPreview = document.getElementById('no-preview');
const previewContent = document.getElementById('preview-content');
const previewInfo = document.getElementById('preview-info');
const pixelGrid = document.getElementById('pixel-grid');
const pixelSizeSelect = document.getElementById('pixel-size');
const previewBgSelect = document.getElementById('preview-bg');

// 存储上传的图片和转换数据
let uploadedFiles = [];
let currentCode = '';
let currentPixels = [];
let currentWidth = 0;
let currentHeight = 0;
let currentFormat = 'rgb565';
let showLineNumbers = false;

// 初始化事件监听
function initEventListeners() {
    // 上传区域事件
    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('border-primary', 'bg-blue-50');
    });
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('border-primary', 'bg-blue-50');
    });
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-primary', 'bg-blue-50');
        dropArea.classList.remove('border-primary', 'bg-blue-50');

        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

    // 文件选择事件
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });

    // 按钮事件
    selectBtn.addEventListener('click', () => fileInput.click());
    convertBtn.addEventListener('click', convertAllImages);
    clearBtn.addEventListener('click', clearAllFiles);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadHeaderFile);

    // 尺寸选项事件
    sizeOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (option.value === 'custom') {
                customSizeContainer.classList.remove('hidden');
            } else {
                customSizeContainer.classList.add('hidden');
            }
        });
    });

    // 预览设置事件
    pixelSizeSelect.addEventListener('change', updatePixelGrid);
    previewBgSelect.addEventListener('change', updatePixelGrid);

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

// 添加图片预览（包含尺寸信息）
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

    // 处理BMP文件
    if (file.type.match('image/bmp')) {
        reader.readAsDataURL(file);
    } else {
        reader.readAsDataURL(file);
    }
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
}

// 更新按钮状态
function updateButtonStates() {
    const hasFiles = uploadedFiles.length > 0;
    convertBtn.disabled = !hasFiles;
    clearBtn.disabled = !hasFiles;
}

// 获取当前选中的转换选项
function getConversionOptions() {
    // 尺寸选项
    let sizeOption = 'original';
    let width = 0;
    let height = 0;

    // 扫描方式
    let scanOption = 'horizontal';
    for (const option of scanOptions) {
        if (option.checked) {
            scanOption = option.value;
            break;
        }
    }

    // 格式选项
    let formatOption = 'rgb565';
    for (const option of formatOptions) {
        if (option.checked) {
            formatOption = option.value;
            break;
        }
    }

    return {
        sizeOption,
        width,
        height,
        scanOption,
        formatOption
    };
}

// 转换所有图片
function convertAllImages() {
    if (uploadedFiles.length === 0) return;

    showProcessing();

    // 获取转换选项
    const options = getConversionOptions();
    currentFormat = options.formatOption;

    // 异步处理图片，避免UI阻塞
    setTimeout(async () => {
        try {
            const result = await generateCArrayForAllImages(options);
            currentCode = result.code;
            currentPixels = result.pixels;
            currentWidth = result.width;
            currentHeight = result.height;

            displayResult(currentCode, 'images_array.h');
            displayPreview(currentWidth, currentHeight, currentPixels);
        } catch (error) {
            showError(error.message);
        } finally {
            hideProcessing();
        }
    }, 100);
}

// 为所有图片生成C数组和像素数据
async function generateCArrayForAllImages(options) {
    let headerContent = `#ifndef IMAGES_ARRAY_H\n#define IMAGES_ARRAY_H\n\n`;
    headerContent += `// 自动生成的图像数组\n`;
    headerContent += `// 转换选项: 尺寸=${options.sizeOption === 'original' ? '原始' : `${options.width}×${options.height}`}, `;
    headerContent += `扫描方式=${options.scanOption === 'horizontal' ? '水平' : '垂直'}, `;
    headerContent += `格式=${options.formatOption.toUpperCase()}\n`;
    headerContent += `// 数组结构：[头部(4字节) + 像素数据]\n`;
    headerContent += `// 头部定义：前2字节为宽度，后2字节为高度（均为16位小端格式）\n\n`;

    let allPixels = [];
    let width = 0;
    let height = 0;

    // 处理每张图片
    for (const file of uploadedFiles) {
        const result = await processImage(file, options);
        headerContent += result.arrayData + '\n';

        // 只保存第一张图片的像素数据用于预览
        if (allPixels.length === 0) {
            allPixels = result.pixels;
            width = result.width;
            height = result.height;
        }
    }

    headerContent += `#endif // IMAGES_ARRAY_H\n`;
    return {
        code: headerContent,
        pixels: allPixels,
        width: width,
        height: height
    };
}

// 处理单张图片并生成C数组和像素数据
async function processImage(file, options) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        // 处理BMP文件
        if (file.type.match('image/bmp')) {
            reader.onload = (e) => {
                // BMP文件处理逻辑
                try {
                    const arrayBuffer = e.target.result;
                    const dataView = new DataView(arrayBuffer);

                    // BMP文件头解析
                    const fileSize = dataView.getUint32(2, true);
                    const pixelOffset = dataView.getUint32(10, true);
                    const width = dataView.getInt32(18, true);
                    const height = Math.abs(dataView.getInt32(22, true)); // 高度可能为负值
                    const bitsPerPixel = dataView.getUint16(28, true);

                    // 仅支持24位和32位BMP
                    if (bitsPerPixel !== 24 && bitsPerPixel !== 32) {
                        reject(new Error(`不支持的BMP格式: ${bitsPerPixel}位，仅支持24位和32位`));
                        return;
                    }

                    // 创建画布
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.createImageData(width, height);
                    const pixels = imageData.data;

                    // 解析像素数据 (BMP存储顺序是从下到上，从左到右)
                    const rowSize = Math.floor((bitsPerPixel * width + 31) / 32) * 4;
                    let pos = pixelOffset;

                    for (let y = height - 1; y >= 0; y--) {
                        for (let x = 0; x < width; x++) {
                            const index = (y * width + x) * 4;
                            const blue = dataView.getUint8(pos);
                            const green = dataView.getUint8(pos + 1);
                            const red = dataView.getUint8(pos + 2);

                            pixels[index] = red;     // R
                            pixels[index + 1] = green; // G
                            pixels[index + 2] = blue;  // B
                            pixels[index + 3] = 255;   // A (不透明)

                            pos += 3;
                        }
                        pos += rowSize - width * 3; // 跳过行填充
                    }

                    ctx.putImageData(imageData, 0, 0);

                    // 继续处理图像
                    const result = processCanvasImage(canvas, file, options);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`解析BMP文件时出错: ${error.message}`));
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            // 处理JPG和PNG
            reader.onload = (e) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const result = processCanvasImage(canvas, file, options);
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
        }
    });
}

// 处理画布图像并生成数组和像素数据
function processCanvasImage(canvas, file, options) {
    try {
        let width = canvas.width;
        let height = canvas.height;

        // 获取像素数据
        const imageData = canvas.getContext('2d').getImageData(0, 0, width, height);
        const data = imageData.data;

        // 生成头部信息（4字节：宽度2字节 + 高度2字节，小端模式）
        const header = [
            width & 0xFF,         // 宽度低8位（小端）
            (width >> 8) & 0xFF,  // 宽度高8位
            height & 0xFF,        // 高度低8位（小端）
            (height >> 8) & 0xFF  // 高度高8位
        ];

        // 根据扫描方式和格式处理像素数据
        let pixelData = [];
        let rgbPixels = []; // 用于预览的RGB像素数据

        if (options.scanOption === 'horizontal') {
            // 水平扫描：从左到右，从上到下
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    // 根据格式添加像素数据
                    const bytes = addPixelData(r, g, b, options.formatOption);
                    pixelData.push(...bytes);

                    // 保存RGB值用于预览
                    rgbPixels.push({ r, g, b });
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

                    // 根据格式添加像素数据
                    const bytes = addPixelData(r, g, b, options.formatOption);
                    pixelData.push(...bytes);

                    // 保存RGB值用于预览
                    rgbPixels.push({ r, g, b });
                }
            }
        }

        // 组合头部和像素数据
        const allData = [...header, ...pixelData];

        // 生成数组名称
        const baseName = file.name.replace(/\.[^/.]+$/, ""); // 移除扩展名
        const arrayName = `gImage_${baseName.replace(/[^a-zA-Z0-9_]/g, "_")}`;

        // 生成C数组字符串
        let arrayStr = `// 图像：${file.name}，尺寸：${width}×${height}，格式：${options.formatOption.toUpperCase()}\n`;
        arrayStr += `// 扫描方式：${options.scanOption === 'horizontal' ? '水平' : '垂直'}\n`;
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
            pixels: rgbPixels,
            width: width,
            height: height
        };
    } catch (error) {
        throw new Error(`处理图片 ${file.name} 时出错: ${error.message}`);
    }
}

// 根据格式添加像素数据
function addPixelData(r, g, b, format) {
    if (format === 'rgb565') {
        // RGB565格式 (2字节)
        const r5 = (r >> 3) & 0x1F;  // 5位红色
        const g6 = (g >> 2) & 0x3F;  // 6位绿色
        const b5 = (b >> 3) & 0x1F;  // 5位蓝色
        const rgb565 = (r5 << 11) | (g6 << 5) | b5;

        // 小端模式存储
        return [rgb565 & 0xFF, (rgb565 >> 8) & 0xFF];
    } else if (format === 'rgb555') {
        // RGB555格式 (2字节)
        // 第16位通常设置为1（避免被误判为符号位）
        const r5 = (r >> 3) & 0x1F;  // 5位红色
        const g5 = (g >> 3) & 0x1F;  // 5位绿色
        const b5 = (b >> 3) & 0x1F;  // 5位蓝色
        const rgb555 = (1 << 15) | (r5 << 10) | (g5 << 5) | b5;

        // 小端模式存储
        return [rgb555 & 0xFF, (rgb555 >> 8) & 0xFF];
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

// 显示结果
function displayResult(code, filename) {
    resultFilename.textContent = filename;
    codeOutput.textContent = code;
    noResult.classList.add('hidden');
    resultContent.classList.remove('hidden');
    applyCodeTheme();
}

// 显示无结果状态
function showNoResult() {
    resultContent.classList.add('hidden');
    processingInfo.classList.add('hidden');
    errorMessage.classList.add('hidden');
    noResult.classList.remove('hidden');
}

// 显示点阵预览
function displayPreview(width, height, pixels) {
    if (!pixels || pixels.length === 0) {
        showNoPreview();
        return;
    }

    previewInfo.textContent = `尺寸: ${width}×${height} 像素 · 格式: ${currentFormat.toUpperCase()}`;
    noPreview.classList.add('hidden');
    previewContent.classList.remove('hidden');

    // 创建像素网格
    createPixelGrid(width, height, pixels);
}

// 创建像素网格
function createPixelGrid(width, height, pixels) {
    pixelGrid.innerHTML = '';
    pixelGrid.style.width = `${width * getPixelSize()}px`;

    // 设置背景颜色
    pixelGrid.parentElement.style.backgroundColor = previewBgSelect.value === 'black' ? '#000' : '#fff';

    // 创建每个像素
    pixels.forEach(pixel => {
        const pixelElement = document.createElement('div');
        const sizeClass = `pixel-${pixelSizeSelect.value}`;

        pixelElement.className = `pixel ${sizeClass}`;
        pixelElement.style.backgroundColor = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;

        pixelGrid.appendChild(pixelElement);
    });
}

// 更新像素网格（当设置改变时）
function updatePixelGrid() {
    if (currentPixels.length > 0 && currentWidth > 0 && currentHeight > 0) {
        createPixelGrid(currentWidth, currentHeight, currentPixels);
    }
}

// 获取当前像素大小（像素尺寸的CSS值）
function getPixelSize() {
    switch (pixelSizeSelect.value) {
        case 'small': return 4;
        case 'medium': return 8;
        case 'large': return 16;
        default: return 8;
    }
}

// 显示无预览状态
function showNoPreview() {
    previewContent.classList.add('hidden');
    noPreview.classList.remove('hidden');
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
    a.download = 'images_array.h';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 切换行号显示
function toggleLineNumbers() {
    showLineNumbers = !showLineNumbers;
    applyCodeTheme();
}

// 应用代码主题（固定为浅色主题）
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});