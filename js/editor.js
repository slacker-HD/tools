// 编辑器配置
const defaultConfig = {
    fontSize: 14,
    lineHeight: 1.5,
    insertSpaces: true,
    tabSize: 4
};

// 语言扩展名映射
const languageExtensions = {
    'javascript': '.js',
    'typescript': '.ts',
    'html': '.html',
    'css': '.css',
    'json': '.json',
    'xml': '.xml',
    'yaml': '.yml',
    'markdown': '.md',
    'python': '.py',
    'java': '.java',
    'csharp': '.cs',
    'c': '.c',
    'cpp': '.cpp',
    'go': '.go',
    'php': '.php',
    'ruby': '.rb',
    'swift': '.swift',
    'sql': '.sql',
    'shell': '.sh',
    'ini': '.ini',
    'less': '.less',
    'scss': '.scss'
};

class Editor {
    // 添加代码模板作为静态属性
    static codeTemplates = {
        default: '// 开始编写您的代码...',
        javascript: `// JavaScript示例
console.log('Hello World!');`,
        html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
        css: `/* CSS样式 */
body {
    margin: 0;
    padding: 20px;
}`,
        python: `# Python示例
print("Hello World!")`,
        c: `#include <stdio.h>
int main() {
    printf("Hello World!\\n");
    return 0;
}`,
        cpp: `#include <iostream>
int main() {
    std::cout << "Hello World!" << std::endl;
    return 0;
}`
    };

    constructor() {
        this.editor = null;
        this.config = {
            fontSize: 14,
            lineHeight: 1.5,
            insertSpaces: true,
            tabSize: 4
        };
        // 加载上次保存的语言类型，默认为 javascript
        this.lastLanguage = localStorage.getItem('editor-language') || 'javascript';
        this.fileName = `main${languageExtensions[this.lastLanguage]}`;
        this.encoding = localStorage.getItem('editor-encoding') || 'UTF-8';
        this.lineEnding = localStorage.getItem('editor-line-ending') || 'LF';
        this.init();
    }

    async init() {
        await this.initMonaco();
        this.bindEvents();
        // 设置选择器初始值
        document.getElementById('languageSelector').value = this.lastLanguage;
        // 设置初始值
        document.getElementById('encodingSelector').value = this.encoding;
        document.getElementById('lineEndingSelector').value = this.lineEnding;
    }

    async initMonaco() {
        // 等待 Monaco 加载
        await new Promise(resolve => {
            require(['vs/editor/editor.main'], () => resolve());
        });

        const container = document.getElementById('editor');
        container.tabIndex = 0;

        // 创建编辑器实例
        this.editor = monaco.editor.create(container, {
            value: Editor.codeTemplates[this.lastLanguage] || Editor.codeTemplates.default,
            language: this.lastLanguage,
            theme: 'vs',
            automaticLayout: true,
            minimap: { enabled: true },
            fontSize: this.config.fontSize,
            lineHeight: this.config.lineHeight,
            fontFamily: 'Consolas, Monaco, monospace',
            insertSpaces: this.config.insertSpaces,
            tabSize: this.config.tabSize,
            renderWhitespace: 'selection',
            detectIndentation: false
        });

        // 如果自动保存开启，则加载保存的内容
        this.loadSavedContent();
    }

    bindEvents() {
        // 语言切换
        document.getElementById('languageSelector').addEventListener('change', (e) => {
            const language = e.target.value;
            monaco.editor.setModelLanguage(this.editor.getModel(), language);
            this.updateFileName(language);
            this.loadSavedContent();
            // 保存语言选择
            localStorage.setItem('editor-language', language);
        });

        // 主题切换
        document.getElementById('themeSelector').addEventListener('change', (e) => {
            monaco.editor.setTheme(e.target.value);
        });

        // 编码选择
        document.getElementById('encodingSelector').addEventListener('change', (e) => {
            this.encoding = e.target.value;
            localStorage.setItem('editor-encoding', this.encoding);
        });

        // 换行符选择
        document.getElementById('lineEndingSelector').addEventListener('change', (e) => {
            this.lineEnding = e.target.value;
            localStorage.setItem('editor-line-ending', this.lineEnding);
            this.updateLineEndings();
        });

        // 其他事件绑定
        this.bindToolbarEvents();
        this.bindSettingsEvents();

        // 监听编辑器内容变化
        this.editor.onDidChangeModelContent(() => {
            this.saveContent(); // 内容变化时保存
        });
    }

    saveContent() {
        if (this.editor) {
            const content = this.editor.getValue();
            localStorage.setItem(`editor-content-${this.fileName}`, content);
        }
    }

    loadSavedContent() {
        const saved = localStorage.getItem(`editor-content-${this.fileName}`);
        if (saved) {
            this.editor.setValue(saved);
        } else {
            // 如果没有保存的内容，使用语言对应的模板
            const language = this.editor.getModel().getLanguageId();
            const template = Editor.codeTemplates[language] || Editor.codeTemplates.default;
            this.editor.setValue(template);
        }
    }

    updateFileName(language) {
        // 保持基本名称不变，只更新扩展名
        const baseName = this.fileName.replace(/\.[^/.]+$/, "");
        // 使用映射表获取扩展名，如果没有对应的扩展名，使用语言名作为扩展名
        const extension = languageExtensions[language] || `.${language}`;
        this.fileName = baseName + extension;
        
        // 更新界面显示
        document.getElementById('currentFileName').querySelector('span').textContent = this.fileName;
    }

    updateLineEndings() {
        if (this.editor) {
            const model = this.editor.getModel();
            model.setEOL(this.lineEnding === 'CRLF' ? 
                monaco.editor.EndOfLineSequence.CRLF : 
                monaco.editor.EndOfLineSequence.LF
            );
        }
    }

    bindSettingsEvents() {
        // 字体大小下拉菜单
        document.getElementById('fontSizeBtn').addEventListener('click', () => {
            this.toggleDropdown('fontSizeDropdown');
        });

        // 字体大小选项
        document.querySelectorAll('.font-size-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const size = parseInt(e.target.getAttribute('data-size'));
                this.setFontSize(size);
                this.closeAllDropdowns();
            });
        });

        // 行高下拉菜单
        document.getElementById('lineHeightBtn').addEventListener('click', () => {
            this.toggleDropdown('lineHeightDropdown');
        });

        // 行高选项
        document.querySelectorAll('.line-height-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const height = parseFloat(e.target.getAttribute('data-height'));
                this.setLineHeight(height);
                this.closeAllDropdowns();
            });
        });

        // 缩进下拉菜单
        document.getElementById('indentBtn').addEventListener('click', () => {
            this.toggleDropdown('indentDropdown');
        });

        // 缩进选项
        document.querySelectorAll('.indent-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const indent = e.target.getAttribute('data-indent');
                this.setIndent(indent);
                this.closeAllDropdowns();
            });
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[id$="Btn"]') && !e.target.closest('[id$="Dropdown"]')) {
                this.closeAllDropdowns();
            }
        });
    }

    bindToolbarEvents() {
        // 移除通用按钮事件绑定中的保存按钮
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            // 跳过保存按钮，它会单独处理
            if (btn.id === 'saveBtn') return;
            
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.title?.toLowerCase();
                if (action) this.handleToolbarAction(action);
            });
        });

        // 单独绑定保存按钮
        document.getElementById('saveBtn')?.addEventListener('click', () => {
            this.saveFile();
        });
    }

    handleToolbarAction(action) {
        const actions = {
            '撤销': () => this.editor.trigger('keyboard', 'undo'),
            '重做': () => this.editor.trigger('keyboard', 'redo'),
            '复制': () => this.editor.trigger('keyboard', 'editor.action.clipboardCopyAction'),
            '粘贴': () => navigator.clipboard.readText().then(text => {
                this.editor.trigger('keyboard', 'paste', { text });
            }),
            '剪切': () => this.editor.trigger('keyboard', 'editor.action.clipboardCutAction'),
            '查找': () => this.editor.trigger('keyboard', 'actions.find'),
            '替换': () => this.editor.trigger('keyboard', 'editor.action.startFindReplaceAction'),
            '自动格式化': () => this.editor.trigger('keyboard', 'editor.action.formatDocument')
        };

        if (actions[action]) {
            actions[action]();
            this.editor.focus();
        }
    }

    async saveFile() {
        const model = this.editor.getModel();
        const content = model.getValue();
        
        try {
            // 调用PHP接口保存文件
            const response = await fetch('/api/save.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content,
                    encoding: this.encoding,
                    lineEnding: this.lineEnding,
                    fileName: this.fileName
                })
            });

            if (!response.ok) {
                throw new Error('Save failed');
            }

            // 获取二进制数据并触发下载
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // 保存到localStorage作为备份
            this.saveContent();
        } catch (e) {
            console.error('Save failed:', e);
            alert('保存失败，请重试');
        }
    }

    getEncodedBlob(content) {
        let encodedContent;
        switch (this.encoding) {
            case 'UTF-8-BOM':
                encodedContent = new Uint8Array([0xEF, 0xBB, 0xBF, ...new TextEncoder().encode(content)]);
                break;
            case 'UTF-16LE':
                encodedContent = new Uint8Array([0xFF, 0xFE, ...new TextEncoder().encode(content)]);
                break;
            case 'UTF-16BE':
                encodedContent = new Uint8Array([0xFE, 0xFF, ...new TextEncoder().encode(content)]);
                break;
            case 'ASCII':
                encodedContent = new TextEncoder().encode(content);
                break;
            default: // UTF-8
                encodedContent = new TextEncoder().encode(content);
        }
        return new Blob([encodedContent], { type: 'text/plain' });
    }

    setFontSize(size) {
        this.config.fontSize = size;
        this.editor.updateOptions({ fontSize: size });
        document.getElementById('fontSizeValue').textContent = `${size}px`;
        localStorage.setItem('editor-font-size', size);
    }

    setLineHeight(height) {
        this.config.lineHeight = height;
        this.editor.updateOptions({ lineHeight: height });
        document.getElementById('lineHeightValue').textContent = height;
        localStorage.setItem('editor-line-height', height);
    }

    setIndent(indent) {
        const isTab = indent === 'tab';
        const tabSize = isTab ? 4 : parseInt(indent);

        // 更新配置
        this.config.insertSpaces = !isTab;
        this.config.tabSize = tabSize;

        // 更新编辑器选项
        this.editor.updateOptions({
            insertSpaces: !isTab,
            tabSize: tabSize,
            renderWhitespace: 'selection'
        });

        // 更新UI显示
        document.getElementById('indentValue').textContent = isTab ? 'Tab' : tabSize;
        document.getElementById('indentMode').textContent = isTab ? 'Tab' : `空格: ${tabSize}`;

        // 保存配置
        localStorage.setItem('editor-indent', JSON.stringify({
            insertSpaces: !isTab,
            tabSize: tabSize
        }));

        // 重新获取焦点
        this.editor.focus();
    }

    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.classList.toggle('hidden');
        
        // 关闭其他下拉菜单
        document.querySelectorAll('[id$="Dropdown"]').forEach(dd => {
            if (dd.id !== dropdownId) dd.classList.add('hidden');
        });
    }

    closeAllDropdowns() {
        document.querySelectorAll('[id$="Dropdown"]').forEach(dd => {
            dd.classList.add('hidden');
        });
    }

    loadUserPreferences() {
        const fontSize = localStorage.getItem('editor-font-size');
        if (fontSize) this.setFontSize(parseInt(fontSize));

        const lineHeight = localStorage.getItem('editor-line-height');
        if (lineHeight) this.setLineHeight(parseFloat(lineHeight));

        // 加载缩进设置
        const indent = localStorage.getItem('editor-indent');
        if (indent) {
            try {
                const indentConfig = JSON.parse(indent);
                const indentValue = indentConfig.insertSpaces ? 
                    indentConfig.tabSize.toString() : 'tab';
                this.setIndent(indentValue);
            } catch (e) {
                console.error('Failed to load indent settings:', e);
            }
        }
    }
}

// 初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    window.editorInstance = new Editor();
});
