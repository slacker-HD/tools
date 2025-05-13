document.addEventListener('DOMContentLoaded', function () {
    // 获取DOM元素
    const inputText = document.getElementById('inputText');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtns = document.querySelectorAll('.copy-btn');
    const copyToast = document.getElementById('copyToast');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // 示例文本
    const sampleText = "你好，世界！Hello, World!";

    // 设置示例文本
    inputText.value = sampleText;

    // 转换按钮点击事件
    convertBtn.addEventListener('click', function () {
        const text = inputText.value.trim();
        if (text === '') {
            alert('请输入要转换的文本！');
            return;
        }
        convertText(text);
    });

    // 清空按钮点击事件
    clearBtn.addEventListener('click', function () {
        inputText.value = '';
        const resultIds = ['gb2312Result', 'big5Result', 'gbkResult', 'gb18030Result', 'unicodeResult', 'utf8Result', 'utf16beResult', 'utf16leResult'];
        resultIds.forEach(id => document.getElementById(id).textContent = '');
    });

    // 获取前端支持的编码
    function getFrontendEncodings(text) {
        return {
            unicode: getUnicodeEncoding(text),
            utf8: getUTF8Encoding(text),
            utf16be: getUTF16BEEncoding(text),
            utf16le: getUTF16LEEncoding(text)
        };
    }

    // 获取后端支持的编码
    async function getBackendEncodings(text) {
        try {
            const response = await fetch('./api/encoding.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (!response.ok) {
                throw new Error('服务器响应错误: ' + response.status);
            }
            return await response.json();
        } catch (error) {
            console.error('获取后端编码失败:', error);
            return {
                gb2312: '获取失败: ' + error.message,
                big5: '获取失败: ' + error.message,
                gbk: '获取失败: ' + error.message,
                gb18030: '获取失败: ' + error.message
            };
        }
    }

    // 获取Unicode编码
    function getUnicodeEncoding(text) {
        return Array.from(text).map(char => `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
    }

    // 获取UTF-8编码
    function getUTF8Encoding(text) {
        const encoder = new TextEncoder();
        return Array.from(encoder.encode(text)).map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    }

    // 获取UTF-16BE编码
    function getUTF16BEEncoding(text) {
        const bytes = [];
        for (let i = 0; i < text.length; i++) {
            const codeUnit = text.charCodeAt(i);
            bytes.push(codeUnit >> 8);
            bytes.push(codeUnit & 0xFF);
        }
        return bytes.map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    }

    // 获取UTF-16LE编码
    function getUTF16LEEncoding(text) {
        const bytes = [];
        for (let i = 0; i < text.length; i++) {
            const codeUnit = text.charCodeAt(i);
            bytes.push(codeUnit & 0xFF);
            bytes.push(codeUnit >> 8);
        }
        return bytes.map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    }

    // 执行文本编码转换
    async function convertText(text) {
        try {
            loadingOverlay.classList.remove('hidden');
            const [frontendResults, backendResults] = await Promise.all([
                getFrontendEncodings(text),
                getBackendEncodings(text)
            ]);
            const resultIds = {
                unicode: 'unicodeResult',
                utf8: 'utf8Result',
                utf16be: 'utf16beResult',
                utf16le: 'utf16leResult',
                gb2312: 'gb2312Result',
                big5: 'big5Result',
                gbk: 'gbkResult',
                gb18030: 'gb18030Result'
            };
            for (const [key, value] of Object.entries({ ...frontendResults, ...backendResults })) {
                document.getElementById(resultIds[key]).textContent = value;
            }
        } catch (error) {
            console.error('编码转换错误:', error);
            alert('编码转换出错: ' + error.message);
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }

    // 初始转换示例文本
    convertText(sampleText);

    // 显示提示框
    function showToast(message) {
        copyToast.querySelector('span').textContent = message;
        copyToast.classList.remove('translate-y-16', 'opacity-0');
        copyToast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            copyToast.classList.remove('translate-y-0', 'opacity-100');
            copyToast.classList.add('translate-y-16', 'opacity-0');
        }, 2000);
    }

    // 复制按钮点击事件
    copyBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.target;
            const targetElement = document.getElementById(targetId);
            const textToCopy = targetElement.textContent;

            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('复制成功');
            }).catch(err => {
                showToast('复制失败，请手动复制');
                console.error('复制失败:', err);
            });
        });
    });
});