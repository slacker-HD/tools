document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewEmpty = document.getElementById('preview-empty');
    const previewImg = document.getElementById('preview-img');
    const generateBtn = document.getElementById('generate-btn');
    const asciiResult = document.getElementById('ascii-result');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const loading = document.getElementById('loading');
    const scaleInput = document.getElementById('scale');
    const brightnessInput = document.getElementById('brightness');
    const charsetSelect = document.getElementById('charset');
    const fontSizeInput = document.getElementById('font-size');

    // 存储图片数据
    let imageData = null;

    // 监听文件选择
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            previewEmpty.style.display = 'none';
            previewImg.style.display = 'block';
            previewImg.src = event.target.result;
            
            // 加载图片获取数据
            const img = new Image();
            img.onload = () => {
                imageData = img;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 生成 ASCII 艺术
    generateBtn.addEventListener('click', async () => {
        if (!imageData) {
            alert('请先选择图片！');
            return;
        }

        // 显示加载状态
        loading.style.display = 'block';
        generateBtn.disabled = true;

        try {
            const asciiArt = await convertImageToAscii(
                imageData,
                parseInt(scaleInput.value) / 100,
                parseFloat(brightnessInput.value),
                charsetSelect.value
            );
            
            // 更新结果显示
            asciiResult.textContent = asciiArt;
            // 设置字体大小
            asciiResult.style.fontSize = `${fontSizeInput.value}px`;
        } catch (error) {
            alert('生成失败：' + error.message);
            console.error(error);
        } finally {
            // 隐藏加载状态
            loading.style.display = 'none';
            generateBtn.disabled = false;
        }
    });

    // 复制结果
    copyBtn.addEventListener('click', () => {
        const text = asciiResult.textContent;
        if (!text) {
            alert('暂无内容可复制！');
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => alert('复制成功！'))
            .catch(() => {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('复制成功！');
            });
    });

    // 下载结果
    downloadBtn.addEventListener('click', () => {
        const text = asciiResult.textContent;
        if (!text) {
            alert('暂无内容可下载！');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art-' + new Date().getTime() + '.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    // 监听字体大小变化
    fontSizeInput.addEventListener('input', () => {
        asciiResult.style.fontSize = `${fontSizeInput.value}px`;
    });

    /**
     * 将图片转换为 ASCII 字符画
     * @param {HTMLImageElement} img 图片元素
     * @param {number} scale 缩放比例 (0-1)
     * @param {number} brightness 亮度调整 (0.5-2)
     * @param {string} charset 字符集
     * @returns {Promise<string>} ASCII 艺术文本
     */
    function convertImageToAscii(img, scale, brightness, charset) {
        return new Promise((resolve) => {
            // 创建画布
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 计算缩放后的宽度
            let width = Math.floor(img.width * scale);
            // 测量当前字体的字符宽度，用于提示和计算纵横比
            const asciiDiv = document.getElementById('ascii-result');
            const style = getComputedStyle(asciiDiv);
            const measureCanvas = document.createElement('canvas');
            const measureCtx = measureCanvas.getContext('2d');
            measureCtx.font = style.font;
            // 计算字符集的平均宽度（忽略空格），防止首字符为空格导致误差
            let widths = charset.split('').map(c => measureCtx.measureText(c).width);
            // 排除零宽度字符（如空格）用于纵横比
            let nonzero = widths.filter(w => w > 0);
            const avgWidth = nonzero.length ? nonzero.reduce((a,b)=>a+b,0)/nonzero.length : parseFloat(style.fontSize) * 0.6;
            const charWidth = avgWidth;
            if (charset.length > 1) {
                // 再次检测宽度差异以警告用户
                let allWidths = charset.split('').map(c => measureCtx.measureText(c).width);
                const avg = allWidths.reduce((a,b)=>a+b,0) / allWidths.length;
                if (allWidths.some(w => w > avg * 1.1 || w < avg * 0.9)) {
                    console.warn('所选字符宽度不一致，可能导致排版异常', charset);
                }
            }
            // 按图像宽高比计算行数，并根据字符纵横比调整
            // 字符纵横比 ≈ 字体高度 / 字符宽度
            const fontSize = parseFloat(style.fontSize) || 8;
            const charHeight = fontSize; // 使用 font-size 作为近似高度
            const aspect = charHeight / charWidth;
            let height = Math.floor(width * (img.height / img.width) * aspect);
            // 保证至少1个字符
            if (width < 1) width = 1;
            if (height < 1) height = 1;
            canvas.width = width;
            canvas.height = height;

            // 绘制图片到画布
            ctx.drawImage(img, 0, 0, width, height);

            // 获取像素数据
            const imageData = ctx.getImageData(0, 0, width, height);
            const pixels = imageData.data;

            // 字符集长度
            const charLength = charset.length;
            let asciiArt = '';

            // 遍历像素 (每4个值：r, g, b, a)
            for (let y = 0; y < height; y++) {
                let row = '';
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    const r = pixels[index] * brightness;
                    const g = pixels[index + 1] * brightness;
                    const b = pixels[index + 2] * brightness;
                    const a = pixels[index + 3];

                    // 如果透明，使用空字符
                    if (a < 128) {
                        row += ' ';
                        continue;
                    }

                    // 计算灰度值 (0-255)
                    const gray = Math.floor((r * 0.299 + g * 0.587 + b * 0.114));
                    // 限制灰度值范围
                    const clampedGray = Math.max(0, Math.min(255, gray));
                    // 映射到字符集
                    const charIndex = Math.floor((clampedGray / 255) * (charLength - 1));
                    row += charset[charIndex];
                }
                asciiArt += row + '\n';
            }

            resolve(asciiArt);
        });
    }
});