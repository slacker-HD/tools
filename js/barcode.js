class BarcodeGenerator {
    constructor() {
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        // 输入元素
        this.inputText = document.getElementById('input-text');
        this.codeType = document.getElementById('code-type');

        // QR码选项
        this.qrOptions = document.getElementById('qr-options');
        this.qrErrorLevel = document.getElementById('qr-error-level');
        this.qrSize = document.getElementById('qr-size');
        this.qrSizeValue = document.getElementById('qr-size-value');
        this.qrMargin = document.getElementById('qr-margin');
        this.qrMarginValue = document.getElementById('qr-margin-value');
        this.qrColorEnabled = document.getElementById('qr-color-enabled');
        this.qrDarkColor = document.getElementById('qr-dark-color');
        this.qrLightColor = document.getElementById('qr-light-color');
        this.qrVersion = document.getElementById('qr-version');

        // 条形码选项
        this.barcodeOptions = document.getElementById('barcode-options');
        this.barcodeHeight = document.getElementById('barcode-height');
        this.barcodeHeightValue = document.getElementById('barcode-height-value');
        this.barcodeWidth = document.getElementById('barcode-width');
        this.barcodeWidthValue = document.getElementById('barcode-width-value');
        this.barcodeText = document.getElementById('barcode-text');
        this.barcodeColorEnabled = document.getElementById('barcode-color-enabled');
        this.barcodeColor = document.getElementById('barcode-color');
        this.barcodeBackground = document.getElementById('barcode-background');

        // 输出元素
        this.qrCanvas = document.getElementById('qr-canvas');
        this.barcodeSvg = document.getElementById('barcode-svg');
        this.previewPlaceholder = document.getElementById('preview-placeholder');

        // 按钮
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadPngBtn = document.getElementById('download-png');
        this.downloadSvgBtn = document.getElementById('download-svg');
    }

    initEventListeners() {
        // 类型切换
        this.codeType.addEventListener('change', () => {
            this.toggleOptions();
        });

        // 生成按钮
        this.generateBtn.addEventListener('click', () => {
            this.generateCode();
        });

        // 下载按钮
        this.downloadPngBtn.addEventListener('click', () => {
            this.downloadImage('png');
        });
        this.downloadSvgBtn.addEventListener('click', () => {
            this.downloadImage('svg');
        });

        // QR码选项更新
        this.qrSize.addEventListener('input', () => {
            this.qrSizeValue.textContent = this.qrSize.value;
        });
        this.qrMargin.addEventListener('input', () => {
            this.qrMarginValue.textContent = this.qrMargin.value;
        });
        this.qrColorEnabled.addEventListener('change', () => {
            this.qrDarkColor.disabled = !this.qrColorEnabled.checked;
            this.qrLightColor.disabled = !this.qrColorEnabled.checked;
        });

        // 条形码选项更新
        this.barcodeHeight.addEventListener('input', () => {
            this.barcodeHeightValue.textContent = this.barcodeHeight.value;
        });
        this.barcodeWidth.addEventListener('input', () => {
            this.barcodeWidthValue.textContent = this.barcodeWidth.value;
        });
        this.barcodeColorEnabled.addEventListener('change', () => {
            this.barcodeColor.disabled = !this.barcodeColorEnabled.checked;
            this.barcodeBackground.disabled = !this.barcodeColorEnabled.checked;
        });
    }

    toggleOptions() {
        const isQRCode = this.codeType.value === 'qrcode';
        this.qrOptions.classList.toggle('hidden', !isQRCode);
        this.barcodeOptions.classList.toggle('hidden', isQRCode);
        this.qrCanvas.classList.add('hidden');
        this.barcodeSvg.classList.add('hidden');
        this.previewPlaceholder.classList.remove('hidden');
    }

    async generateCode() {
        const text = this.inputText.value.trim();
        if (!text) {
            alert('请输入内容');
            return;
        }

        // 添加输入验证
        if (!this.validateInput(text)) {
            return;
        }

        this.previewPlaceholder.classList.add('hidden');

        if (this.codeType.value === 'qrcode') {
            await this.generateQRCode(text);
        } else {
            await this.generateBarcode(text);
        }
    }

    validateInput(text) {
        const type = this.codeType.value;

        switch (type) {
            case 'qrcode':
                return true; // 支持所有字符
            case 'code128':
                // ASCII 字符验证 (0-127)
                if (!/^[\x00-\x7F]*$/.test(text)) {
                    alert('Code 128 仅支持 ASCII 字符（英文、数字和部分符号）');
                    return false;
                }
                return true;
            case 'ean13':
                if (!/^\d{12,13}$/.test(text)) {
                    alert('EAN-13 条码需要12-13位数字');
                    return false;
                }
                return true;
            case 'ean8':
                if (!/^\d{7,8}$/.test(text)) {
                    alert('EAN-8 条码需要7-8位数字');
                    return false;
                }
                return true;
            case 'upc':
                if (!/^\d{11,12}$/.test(text)) {
                    alert('UPC 条码需要11-12位数字');
                    return false;
                }
                return true;
            default:
                alert('不支持的条码类型');
                return false;
        }
    }

    async generateQRCode(text) {
        try {
            const canvas = this.qrCanvas;
            const options = {
                level: this.qrErrorLevel.value,
                version: this.qrVersion.value === 'auto' ? undefined : parseInt(this.qrVersion.value),
                size: parseInt(this.qrSize.value),
                margin: parseInt(this.qrMargin.value),
                color: {
                    dark: this.qrColorEnabled.checked ? this.qrDarkColor.value.replace('#', '') : '000000',
                    light: this.qrColorEnabled.checked ? this.qrLightColor.value.replace('#', '') : 'ffffff'
                }
            };

            // 使用新的方式生成二维码
            const qr = qrcode(options.version || 4, options.level);
            // 处理中文编码
            const utf8Text = unescape(encodeURIComponent(text));
            qr.addData(utf8Text, 'Byte');
            qr.make();

            const size = options.size;
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;

            const cellSize = size / qr.getModuleCount();
            for (let row = 0; row < qr.getModuleCount(); row++) {
                for (let col = 0; col < qr.getModuleCount(); col++) {
                    ctx.fillStyle = qr.isDark(row, col) ? `#${options.color.dark}` : `#${options.color.light}`;
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }

            // 显示结果
            this.qrCanvas.classList.remove('hidden');
            this.barcodeSvg.classList.add('hidden');
            this.previewPlaceholder.classList.add('hidden');

        } catch (err) {
            console.error('QR Code generation error:', err);
            alert('生成二维码失败: ' + (err.message || '未知错误'));
            this.previewPlaceholder.classList.remove('hidden');
        }
    }

    generateBarcode(text) {
        try {
            this.barcodeSvg.classList.remove('hidden');
            this.qrCanvas.classList.add('hidden');

            const options = {
                format: this.codeType.value,
                height: parseInt(this.barcodeHeight.value),
                width: parseFloat(this.barcodeWidth.value),
                displayValue: this.barcodeText.checked,
                lineColor: this.barcodeColorEnabled.checked ? this.barcodeColor.value : '#000000',
                background: this.barcodeColorEnabled.checked ? this.barcodeBackground.value : '#ffffff'
            };

            // 检查 JsBarcode 是否可用
            if (typeof JsBarcode === 'undefined') {
                alert('JsBarcode 库未正确引入，请检查。');
                return;
            }

            JsBarcode(this.barcodeSvg, text, options);
        } catch (err) {
            alert('生成条形码失败：' + err.message);
        }
    }

    downloadImage(type) {
        if (this.codeType.value === 'qrcode' && type === 'png') {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = this.qrCanvas.toDataURL('image/png');
            link.click();
        } else if (type === 'svg') {
            const element = this.codeType.value === 'qrcode' ? this.qrCanvas : this.barcodeSvg;
            const svg = element.outerHTML;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = this.codeType.value === 'qrcode' ? 'qrcode.svg' : 'barcode.svg';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }
    }
}

// 初始化生成器
const generator = new BarcodeGenerator();