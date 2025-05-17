// 数学计算器类
class MathCalculator {
    constructor() {
        this.outputArea = document.getElementById('output-area');
        this.inputField = document.getElementById('input-field');
        this.clearBtn = document.getElementById('clear-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.themeToggle = document.getElementById('theme-toggle');
        this.helpBtn = document.getElementById('help-btn');
        this.epsSlider = document.getElementById('eps-slider');
        this.epsValue = document.getElementById('eps-value');
        this.precisionValue = document.getElementById('precision-value');
        this.epsReference = document.getElementById('eps-reference');
        this.initPrecision = document.getElementById('init-precision');
        this.customItemsList = document.getElementById('custom-items-list');
        this.functionsReference = document.getElementById('functions-reference');

        // 历史记录
        this.history = [];
        this.historyIndex = -1;

        // 数学环境
        this.math = math.create(math.all, {
            number: 'Complex' // 使用复数类型
        });

        // 内置函数列表
        this.builtinFunctions = [
            'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
            'log', 'exp', 'sqrt', 'abs', 'factorial',
            'conj', 'arg', 're', 'im', 'pow', 'sinh', 'cosh', 'tanh'
        ];

        // 上一次计算结果
        this.lastResult = null;

        // 精度设置 (eps = 10^(-precision))
        this.precision = parseInt(this.epsSlider.value);
        this.updateEpsDisplay();

        // 设置事件监听器
        this.setupEventListeners();

        // 设置数学环境
        this.setupMathEnvironment();

        // 默认主题
        this.darkMode = false;

        // 显示欢迎信息
        this.addOutputLine('>>> 欢迎使用网页版数学计算器');
        this.addOutputLine('>>> 支持基本数学运算、函数、变量和复数运算');
        this.addOutputLine(`>>> 使用滑块调整计算精度 (eps = ${this.formatEps()})`);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 输入框回车事件
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.evaluateExpression();
            } else if (e.key === 'ArrowUp') {
                // 浏览历史记录
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                // 浏览历史记录
                this.navigateHistory(1);
            }
        });

        // 清空按钮
        this.clearBtn.addEventListener('click', () => {
            this.clearOutput();
        });

        // 复制按钮
        this.copyBtn.addEventListener('click', () => {
            this.copyOutput();
        });

        // 主题切换按钮
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // 帮助按钮
        this.helpBtn.addEventListener('click', () => {
            this.toggleHelp();
        });

        // 精度滑块
        this.epsSlider.addEventListener('input', () => {
            this.precision = parseInt(this.epsSlider.value);
            this.updateEpsDisplay();

            // 更新math环境中的eps值
            this.math.import({ eps: Math.pow(10, -this.precision) }, { override: true });

            this.addOutputLine(`>>> eps 设置为 ${this.formatEps()} (精度: ${this.precision} 位小数)`);
            this.scrollToBottom();
        });
    }

    // 更新eps显示
    updateEpsDisplay() {
        this.epsValue.textContent = this.formatEps();
        this.precisionValue.textContent = this.precision;
        this.epsReference.textContent = this.precision;
        this.initPrecision.textContent = this.precision;
    }

    // 格式化eps值
    formatEps() {
        return `1e-${this.precision}`;
    }

    // 设置数学环境
    setupMathEnvironment() {
        // 添加自定义函数和变量
        this.math.import({
            // ans 作为变量，初始为 null
            ans: this.lastResult,
            eps: Math.pow(10, -this.precision)
        });

        // 添加更多数学函数和常量
        this.math.import(math.evaluate('{sin, cos, tan, asin, acos, atan, log, exp, sqrt, abs, factorial, conj, arg, re, im, pow, sinh, cosh, tanh}'));
        this.math.import({ pi: Math.PI, e: Math.E, i: math.complex(0, 1) });

        // 自定义函数处理复数转换问题
        this.math.import({
            pow: (a, b) => this.math.pow(this.ensureComplex(a), this.ensureComplex(b))
        }, { override: true });
    }

    // 确保值是复数
    ensureComplex(value) {
        if (this.math.isComplex(value)) {
            return value;
        } else if (typeof value === 'number' || typeof value === 'string') {
            return this.math.complex(value);
        } else if (this.math.isBigNumber(value)) {
            return this.math.complex(parseFloat(value.toString()));
        } else if (this.math.isFraction(value)) {
            return this.math.complex(value.numerator / value.denominator);
        }
        throw new Error(`Cannot convert ${value} to Complex`);
    }

    // 计算表达式
    evaluateExpression() {
        const expression = this.inputField.value.trim();

        if (!expression) return;

        // 添加到历史记录
        this.history.push(expression);
        this.historyIndex = this.history.length;

        // 显示输入
        this.addOutputLine(`>>> ${expression}`);

        try {
            // 检查是否为变量赋值
            if (expression.includes('=')) {
                const [left, right] = expression.split('=');
                const varName = left.trim();
                const varExpr = right.trim();

                // 检查是否为函数定义
                if (varName.includes('(') && varName.includes(')')) {
                    const funcName = varName.split('(')[0];
                    const paramList = varName.split('(')[1].split(')')[0].split(',').map(p => p.trim());

                    // 检查参数列表是否包含非法名称
                    for (const param of paramList) {
                        if (['i', 'pi', 'e', 'ans'].includes(param)) {
                            throw new Error(`参数名 ${param} 与常量冲突`);
                        }
                    }

                    // 检查是否使用内置函数名
                    if (this.builtinFunctions.includes(funcName)) {
                        throw new Error(`名称 ${funcName} 是内置函数，不能作为自定义函数名`);
                    }

                    // 检查名称是否与常量冲突
                    if (['i', 'pi', 'e', 'ans'].includes(funcName)) {
                        throw new Error(`名称 ${funcName} 与常量冲突，不能作为函数名`);
                    }

                    // 检查名称是否已存在（变量或函数）
                    const existingItem = Array.from(this.customItemsList.children).find(item => {
                        const name = item.querySelector('.font-mono.font-bold').textContent;
                        return name === funcName;
                    });

                    if (existingItem) {
                        const itemType = existingItem.querySelector('i').classList.contains('fa-calculator') ? '函数' : '变量';

                        // 显示确认对话框
                        const confirmUpdate = this.showConfirmDialog(
                            '函数重定义确认',
                            `名称 ${funcName} 已存在，当前为${itemType}，是否要更新为函数？`,
                            '确认',
                            '取消'
                        );

                        if (!confirmUpdate) {
                            this.addOutputLine(`函数 ${funcName} 未更新`, true);
                            return;
                        }

                        // 更新现有项
                        const icon = existingItem.querySelector('i');
                        icon.className = 'fa fa-calculator mr-2 text-primary';

                        const valueText = existingItem.querySelector('.text-sm');
                        valueText.textContent = `function(${paramList.join(',')}) = ${varExpr}`;

                        this.addOutputLine(`自定义函数 ${funcName} 已更新`, true);
                    } else {
                        this.addOutputLine(`自定义函数 ${funcName} 定义成功`, true);
                        this.addCustomItem(funcName, `function(${paramList.join(',')}) = ${varExpr}`, 'function');
                    }

                    // 创建函数
                    const func = new Function(...paramList, `return this.math.evaluate('${varExpr}', {${paramList.join(',')}});`).bind(this);
                    this.math.import({ [funcName]: func }, { override: true });
                } else {
                    // 检查名称是否与常量冲突
                    if (['i', 'pi', 'e', 'ans'].includes(varName)) {
                        throw new Error(`名称 ${varName} 与常量冲突，不能作为变量名`);
                    }

                    // 检查是否使用内置函数名
                    if (this.builtinFunctions.includes(varName)) {
                        throw new Error(`名称 ${varName} 是内置函数，不能作为变量名`);
                    }

                    // 检查名称是否已存在（变量或函数）
                    const existingItem = Array.from(this.customItemsList.children).find(item => {
                        const name = item.querySelector('.font-mono.font-bold').textContent;
                        return name === varName;
                    });

                    const varValue = this.math.evaluate(varExpr);

                    if (existingItem) {
                        const itemType = existingItem.querySelector('i').classList.contains('fa-calculator') ? '函数' : '变量';

                        // 获取当前值
                        const currentValue = existingItem.querySelector('.text-sm').textContent;

                        // 显示确认对话框
                        const confirmUpdate = this.showConfirmDialog(
                            '变量重定义确认',
                            `名称 ${varName} 已存在，当前为${itemType}，是否要更新为变量 ${this.formatResult(varValue)}？`,
                            '确认',
                            '取消'
                        );

                        if (!confirmUpdate) {
                            this.addOutputLine(`变量 ${varName} 未更新`, true);
                            return;
                        }

                        // 更新现有项
                        const icon = existingItem.querySelector('i');
                        icon.className = 'fa fa-variable mr-2 text-primary';

                        const valueText = existingItem.querySelector('.text-sm');
                        valueText.textContent = this.formatResult(varValue);

                        this.addOutputLine(`自定义变量 ${varName} 已更新为 ${this.formatResult(varValue)}`, true);
                    } else {
                        this.addOutputLine(`自定义变量 ${varName} 设置为 ${this.formatResult(varValue)}`, true);
                        this.addCustomItem(varName, this.formatResult(varValue), 'variable');
                    }

                    this.math.import({ [varName]: varValue }, { override: true });
                }
            } else {
                // 计算表达式
                const result = this.math.evaluate(expression);

                // 保存结果
                this.lastResult = result;

                // 更新 ans 变量
                this.math.import({ ans: result }, { override: true });

                // 显示结果（使用当前精度）
                const formattedResult = this.formatResult(result);
                this.addOutputLine(formattedResult, true);
            }
        } catch (error) {
            // 显示错误
            this.addOutputLine(`错误: ${error.message}`, false, true);
        }

        // 清空输入框
        this.inputField.value = '';

        // 滚动到底部
        this.scrollToBottom();
    }

    // 显示确认对话框
    async showConfirmDialog(title, message, confirmText, cancelText) {
        return new Promise(resolve => {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

            // 创建对话框
            const dialog = document.createElement('div');
            dialog.className = 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transform transition-all duration-300 scale-95 opacity-0';

            // 标题
            const dialogTitle = document.createElement('h3');
            dialogTitle.className = 'text-lg font-bold text-primary mb-3';
            dialogTitle.textContent = title;

            // 消息
            const dialogMessage = document.createElement('p');
            dialogMessage.className = 'text-gray-700 mb-6';
            dialogMessage.textContent = message;

            // 按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flex justify-end space-x-3';

            // 取消按钮
            const cancelButton = document.createElement('button');
            cancelButton.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors';
            cancelButton.textContent = cancelText;
            cancelButton.addEventListener('click', () => {
                this.closeDialog(overlay, dialog, resolve, false);
            });

            // 确认按钮
            const confirmButton = document.createElement('button');
            confirmButton.className = 'px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors';
            confirmButton.textContent = confirmText;
            confirmButton.addEventListener('click', () => {
                this.closeDialog(overlay, dialog, resolve, true);
            });

            // 添加元素
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(confirmButton);
            dialog.appendChild(dialogTitle);
            dialog.appendChild(dialogMessage);
            dialog.appendChild(buttonContainer);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // 动画效果
            setTimeout(() => {
                dialog.classList.remove('scale-95', 'opacity-0');
                dialog.classList.add('scale-100', 'opacity-100');
            }, 10);
        });
    }

    // 关闭对话框
    closeDialog(overlay, dialog, resolve, result) {
        dialog.classList.remove('scale-100', 'opacity-100');
        dialog.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            document.body.removeChild(overlay);
            resolve(result);
        }, 300);
    }

    // 格式化结果
    formatResult(result) {
        if (this.math.isComplex(result)) {
            // 复数格式
            let real = this.roundToPrecision(result.re);
            let imag = this.roundToPrecision(result.im);

            // 根据实部和虚部的情况格式化
            if (Math.abs(real) < Math.pow(10, -this.precision)) real = 0;
            if (Math.abs(imag) < Math.pow(10, -this.precision)) imag = 0;

            if (real === 0 && imag !== 0) {
                return `${imag}i`;
            } else if (imag === 0 && real !== 0) {
                return `${real}`;
            } else if (real === 0 && imag === 0) {
                return '0';
            } else {
                return `${real}${imag > 0 ? '+' : ''}${imag}i`;
            }
        } else if (this.math.isMatrix(result)) {
            // 矩阵格式
            return result.toString();
        } else if (typeof result === 'number') {
            // 数字格式
            if (Math.abs(result) < Math.pow(10, -this.precision)) return '0';
            return this.roundToPrecision(result).toString();
        }
        return result.toString();
    }

    // 根据精度四舍五入
    roundToPrecision(value) {
        const factor = Math.pow(10, this.precision);
        return Math.round(value * factor) / factor;
    }

    // 添加输出行
    addOutputLine(text, isResult = false, isError = false) {
        const line = document.createElement('div');
        line.className = `output-line ${isResult ? 'text-green-400' : isError ? 'text-red-400' : ''}`;

        // 如果是结果行，添加额外的缩进
        if (isResult) {
            line.innerHTML = `<span class="text-gray-400">&nbsp;&nbsp;&nbsp;</span><span class="ml-2">${text}</span>`;
        } else {
            line.textContent = text;
        }

        this.outputArea.appendChild(line);
    }

    // 浏览历史记录
    navigateHistory(direction) {
        if (this.history.length === 0) return;

        this.historyIndex += direction;

        // 边界检查
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex > this.history.length) {
            this.historyIndex = this.history.length;
            this.inputField.value = '';
            return;
        }

        // 更新输入框
        if (this.historyIndex < this.history.length) {
            this.inputField.value = this.history[this.historyIndex];
        } else {
            this.inputField.value = '';
        }

        // 移动光标到末尾
        this.inputField.selectionStart = this.inputField.selectionEnd = this.inputField.value.length;
    }

    // 清空输出区域
    clearOutput() {
        this.outputArea.innerHTML = '';
        // 添加欢迎信息
        this.addOutputLine('>>> 欢迎使用网页版数学计算器');
        this.addOutputLine('>>> 支持基本数学运算、函数、变量和复数运算');
        this.addOutputLine(`>>> 使用滑块调整计算精度 (eps = ${this.formatEps()})`);
    }

    // 复制输出内容
    copyOutput() {
        const text = Array.from(this.outputArea.children)
           .map(el => el.textContent)
           .join('\n');

        navigator.clipboard.writeText(text).then(() => {
            // 显示复制成功提示
            const originalIcon = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '<i class="fa fa-check"></i>';

            setTimeout(() => {
                this.copyBtn.innerHTML = originalIcon;
            }, 1500);
        });
    }

    // 滚动到底部
    scrollToBottom() {
        this.outputArea.scrollTop = this.outputArea.scrollHeight;
    }

    // 切换主题
    toggleTheme() {
        this.darkMode = !this.darkMode;

        const body = document.body;
        const calculator = document.querySelector('.bg-white.rounded-2xl.overflow-hidden.shadow-lg');
        const outputArea = document.getElementById('output-area');
        const inputArea = document.querySelector('.bg-editor.text-white.p-4.border-t');
        const toolbar = document.querySelector('.bg-primary.text-white.px-4.py-2');
        const referenceSection = document.getElementById('functions-reference');
        const epsSection = document.querySelector('.bg-gray-100.p-3.border-b');
        const customItemsList = document.getElementById('custom-items-list');

        if (this.darkMode) {
            body.classList.remove('bg-gradient-to-br', 'from-light', 'to-blue-50');
            body.classList.add('bg-dark');

            calculator.classList.remove('bg-white');
            calculator.classList.add('bg-gray-900');

            outputArea.classList.remove('bg-output');
            outputArea.classList.add('bg-gray-800');

            inputArea.classList.remove('bg-editor');
            inputArea.classList.add('bg-gray-800');

            toolbar.classList.remove('bg-primary');
            toolbar.classList.add('bg-gray-700');

            epsSection.classList.remove('bg-gray-100', 'border-gray-200');
            epsSection.classList.add('bg-gray-800', 'border-gray-700');
            epsSection.querySelectorAll('label, span').forEach(el => {
                el.classList.remove('text-gray-700', 'text-gray-500');
                el.classList.add('text-gray-300');
            });

            if (referenceSection) {
                referenceSection.classList.remove('bg-white');
                referenceSection.classList.add('bg-gray-900');

                referenceSection.querySelectorAll('.reference-item').forEach(card => {
                    card.classList.remove('bg-gray-50');
                    card.classList.add('bg-gray-800');
                    card.querySelectorAll('p').forEach(p => {
                        p.classList.remove('text-gray-700', 'text-gray-500');
                        p.classList.add('text-gray-300', 'text-gray-400');
                    });
                    card.querySelector('div.w-20').classList.remove('text-primary');
                    card.querySelector('div.w-20').classList.add('text-blue-400');
                });
            }

            if (customItemsList) {
                customItemsList.querySelectorAll('div').forEach(item => {
                    item.classList.remove('bg-gray-50');
                    item.classList.add('bg-gray-800');
                    item.querySelector('.text-gray-700').classList.remove('text-gray-700');
                    item.querySelector('.text-gray-700').classList.add('text-gray-300');
                });
            }

            this.themeToggle.innerHTML = '<i class="fa fa-sun-o"></i>';
        } else {
            body.classList.add('bg-gradient-to-br', 'from-light', 'to-blue-50');
            body.classList.remove('bg-dark');

            calculator.classList.add('bg-white');
            calculator.classList.remove('bg-gray-900');

            outputArea.classList.add('bg-output');
            outputArea.classList.remove('bg-gray-800');

            inputArea.classList.add('bg-editor');
            inputArea.classList.remove('bg-gray-800');

            toolbar.classList.add('bg-primary');
            toolbar.classList.remove('bg-gray-700');

            epsSection.classList.add('bg-gray-100', 'border-gray-200');
            epsSection.querySelectorAll('label, span').forEach(el => {
                el.classList.remove('text-gray-300');
                el.classList.add('text-gray-700', 'text-gray-500');
            });

            if (referenceSection) {
                referenceSection.classList.add('bg-white');
                referenceSection.classList.remove('bg-gray-900');

                referenceSection.querySelectorAll('.reference-item').forEach(card => {
                    card.classList.add('bg-gray-50');
                    card.classList.remove('bg-gray-800');
                    card.querySelectorAll('p').forEach(p => {
                        p.classList.remove('text-gray-300', 'text-gray-400');
                        p.classList.add('text-gray-700', 'text-gray-500');
                    });
                    card.querySelector('div.w-20').classList.remove('text-blue-400');
                    card.querySelector('div.w-20').classList.add('text-primary');
                });
            }

            if (customItemsList) {
                customItemsList.querySelectorAll('div').forEach(item => {
                    item.classList.remove('bg-gray-800');
                    item.classList.add('bg-gray-50');
                    item.querySelector('.text-gray-300').classList.remove('text-gray-300');
                    item.querySelector('.text-gray-300').classList.add('text-gray-700');
                });
            }

            this.themeToggle.innerHTML = '<i class="fa fa-moon-o"></i>';
        }
    }

    // 切换帮助信息显示
    toggleHelp() {
        if (this.functionsReference.classList.contains('hidden')) {
            this.functionsReference.classList.remove('hidden');
            this.helpBtn.innerHTML = '<i class="fa fa-times"></i>';
        } else {
            this.functionsReference.classList.add('hidden');
            this.helpBtn.innerHTML = '<i class="fa fa-question-circle"></i>';
        }
    }

    // 添加自定义项目到列表
    addCustomItem(name, value, type) {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2 transition-all duration-200 hover:shadow-md';
        item.dataset.name = name;
        item.dataset.type = type;

        const info = document.createElement('div');
        info.className = 'flex items-center';

        const icon = document.createElement('i');
        icon.className = type === 'function' ? 'fa fa-calculator mr-2 text-primary' : 'fa fa-variable mr-2 text-primary';
        info.appendChild(icon);

        const nameText = document.createElement('span');
        nameText.className = 'font-mono font-bold mr-2';
        nameText.textContent = name;
        nameText.style.color = this.darkMode ? '#3b82f6' : '#3b82f6';
        info.appendChild(nameText);

        const valueText = document.createElement('span');
        valueText.className = 'text-sm';
        valueText.textContent = value;
        valueText.style.color = this.darkMode ? '#e5e7eb' : '#4b5563';
        info.appendChild(valueText);

        item.appendChild(info);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn flex items-center text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded ml-4 transition-colors';
        deleteBtn.innerHTML = '<i class="fa fa-trash-o mr-1"></i><span>删除</span>';
        deleteBtn.addEventListener('click', async () => {
            const itemType = type === 'function' ? '函数' : '变量';
            const confirmDelete = await this.showConfirmDialog(
                `删除${itemType}确认`,
                `确定要删除${itemType} ${name} 吗？`,
                '确认删除',
                '取消'
            );

            if (confirmDelete) {
                this.deleteCustomItem(name, type);

                // 添加删除动画
                item.classList.add('opacity-0', 'transform', 'translate-x-full');
                setTimeout(() => {
                    item.remove();
                    this.addOutputLine(`>>> ${itemType} ${name} 已删除`);
                    this.scrollToBottom();
                }, 300);
            }
        });
        item.appendChild(deleteBtn);

        // 添加到列表
        this.customItemsList.appendChild(item);
    }

    // 删除自定义项目
    deleteCustomItem(name, type) {
        try {
            // 从 DOM 中移除该项
            const items = Array.from(this.customItemsList.children);
            for (const item of items) {
                if (item.dataset.name === name && item.dataset.type === type) {
                    item.remove();
                }
            }

            // 重新初始化 math.js 环境
            this.math = math.create(math.all, {
                number: 'Complex' // 使用复数类型
            });

            // 重新设置数学环境
            this.setupMathEnvironment();

            this.addOutputLine(`>>> ${type === 'function' ? '函数' : '变量'} ${name} 已删除`);
            this.scrollToBottom();
        } catch (e) {
            console.error(`删除 ${name} 时出错:`, e);
        }
    }
}

// 创建计算器实例
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new MathCalculator();
});