// 复制原有24点计算器的JS逻辑到这里，无需更改
document.addEventListener('DOMContentLoaded', function() {
            const calculateBtn = document.getElementById('calculateBtn');
            const randomBtn = document.getElementById('randomBtn');
            const clearBtn = document.getElementById('clearBtn');
            const solutionsList = document.getElementById('solutionsList');
            const solutionCount = document.getElementById('solutionCount');
            const historyList = document.getElementById('historyList');
            const historyCount = document.getElementById('historyCount');
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modalContent');
            const closeModal = document.getElementById('closeModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalMessage = document.getElementById('modalMessage');
            const resultTitle = document.getElementById('resultTitle');

            // 从本地存储加载历史记录
            let histories = JSON.parse(localStorage.getItem('24game-histories')) || [];
            updateHistoryDisplay();

            // 计算按钮点击事件
            calculateBtn.addEventListener('click', function() {
                const nums = [
                    parseInt(document.getElementById('num1').value),
                    parseInt(document.getElementById('num2').value),
                    parseInt(document.getElementById('num3').value),
                    parseInt(document.getElementById('num4').value)
                ];

                // 验证输入
                if (nums.some(num => isNaN(num) || num < 1 || num > 13)) {
                    showModal('错误', '请输入1-13之间的数字');
                    return;
                }

                // 计算所有可能的解法
                const solutions = solve24(nums);
                
                // 更新结果显示
                updateSolutionsDisplay(solutions, nums);
                
                // 添加到历史记录
                addToHistory(nums, solutions.length);
            });

            // 随机出题按钮点击事件
            randomBtn.addEventListener('click', function() {
                // 生成4个1-13之间的随机数
                const randomNums = Array(4).fill().map(() => Math.floor(Math.random() * 13) + 1);
                
                // 设置输入框的值
                document.getElementById('num1').value = randomNums[0];
                document.getElementById('num2').value = randomNums[1];
                document.getElementById('num3').value = randomNums[2];
                document.getElementById('num4').value = randomNums[3];
                
                // 清空结果区域
                solutionsList.innerHTML = '<div class="text-gray-500 italic text-center py-10">请点击"计算解法"按钮</div>';
                solutionCount.textContent = '0 种解法';
                resultTitle.textContent = '可能的解法';
            });

            // 清除历史按钮点击事件
            clearBtn.addEventListener('click', function() {
                if (histories.length === 0) return;
                
                if (confirm('确定要清除所有历史记录吗？')) {
                    histories = [];
                    localStorage.setItem('24game-histories', JSON.stringify(histories));
                    updateHistoryDisplay();
                }
            });

            // 关闭模态框
            closeModal.addEventListener('click', function() {
                hideModal();
            });

            // 点击模态框背景关闭
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    hideModal();
                }
            });

            // 显示模态框
            function showModal(title, message) {
                modalTitle.textContent = title;
                modalMessage.textContent = message;
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    modalContent.classList.add('scale-100', 'opacity-100');
                }, 10);
            }

            // 隐藏模态框
            function hideModal() {
                modalContent.classList.remove('scale-100', 'opacity-100');
                modalContent.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
            }

            // 更新解法显示
            function updateSolutionsDisplay(solutions, nums) {
                solutionsList.innerHTML = '';
                
                if (solutions.length === 0) {
                    solutionsList.innerHTML = `
                        <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center">
                            <div class="flex justify-center mb-3">
                                <i class="fa fa-exclamation-circle text-2xl"></i>
                            </div>
                            <p class="font-medium">没有找到解法</p>
                            <p class="text-sm mt-2">数字 ${nums.join(', ')} 无法通过四则运算得到24</p>
                        </div>
                    `;
                    solutionCount.textContent = '0 种解法';
                    resultTitle.textContent = '无解';
                } else {
                    solutions.forEach((solution, index) => {
                        const solutionItem = document.createElement('div');
                        solutionItem.className = 'solution-item';
                        solutionItem.innerHTML = `
                            <div class="flex items-center">
                                <span class="bg-primary/10 text-primary font-bold w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                    ${index + 1}
                                </span>
                                <span class="text-gray-800 text-lg">${solution}</span>
                            </div>
                        `;
                        solutionsList.appendChild(solutionItem);
                    });
                    
                    solutionCount.textContent = `${solutions.length} 种解法`;
                    resultTitle.textContent = '可能的解法';
                }
                
                // 添加淡入动画
                Array.from(solutionsList.children).forEach((child, index) => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                        child.style.transition = 'opacity 300ms ease, transform 300ms ease';
                    }, 50 * index);
                });
            }

            // 添加到历史记录
            function addToHistory(nums, solutionCount) {
                const timestamp = new Date().toLocaleString();
                const historyItem = {
                    nums,
                    solutionCount,
                    timestamp
                };
                
                histories.unshift(historyItem); // 添加到数组开头
                
                // 限制历史记录数量为10条
                if (histories.length > 10) {
                    histories.pop();
                }
                
                // 保存到本地存储
                localStorage.setItem('24game-histories', JSON.stringify(histories));
                
                // 更新历史记录显示
                updateHistoryDisplay();
            }

            // 更新历史记录显示
            function updateHistoryDisplay() {
                historyList.innerHTML = '';
                
                if (histories.length === 0) {
                    historyList.innerHTML = '<div class="text-gray-500 italic text-center py-8">暂无历史记录</div>';
                } else {
                    histories.forEach((history, index) => {
                        const historyItem = document.createElement('div');
                        historyItem.className = 'history-item';
                        historyItem.innerHTML = `
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">${history.nums.join(', ')}</span>
                                <span class="text-gray-500 text-sm">${history.solutionCount} 种解法</span>
                            </div>
                            <div class="text-gray-400 text-sm">${history.timestamp}</div>
                        `;
                        
                        // 点击历史记录可以加载对应的数字
                        historyItem.addEventListener('click', function() {
                            document.getElementById('num1').value = history.nums[0];
                            document.getElementById('num2').value = history.nums[1];
                            document.getElementById('num3').value = history.nums[2];
                            document.getElementById('num4').value = history.nums[3];
                            
                            // 清空结果区域
                            solutionsList.innerHTML = '<div class="text-gray-500 italic text-center py-10">请点击"计算解法"按钮</div>';
                            solutionCount.textContent = '0 种解法';
                            resultTitle.textContent = '可能的解法';
                        });
                        
                        historyList.appendChild(historyItem);
                    });
                }
                
                historyCount.textContent = `${histories.length} 条记录`;
            }

            // 24点算法实现
            function solve24(nums) {
                const results = new Set();
                
                // 生成所有可能的数字排列
                const permutations = permute(nums);
                
                // 对每个排列进行计算
                permutations.forEach(perm => {
                    // 生成所有可能的操作符组合
                    const operators = ['+', '-', '*', '/'];
                    for (let op1 of operators) {
                        for (let op2 of operators) {
                            for (let op3 of operators) {
                                // 生成所有可能的括号组合
                                const expressions = [
                                    `(((${perm[0]}${op1}${perm[1]})${op2}${perm[2]})${op3}${perm[3]})`,
                                    `((${perm[0]}${op1}${perm[1]})${op2}(${perm[2]}${op3}${perm[3]}))`,
                                    `((${perm[0]}${op1}(${perm[1]}${op2}${perm[2]}))${op3}${perm[3]})`,
                                    `(${perm[0]}${op1}(((${perm[1]}${op2}${perm[2]})${op3}${perm[3]})))`,
                                    `(${perm[0]}${op1}(${perm[1]}${op2}(${perm[2]}${op3}${perm[3]})))`
                                ];
                                
                                // 计算每个表达式的值
                                expressions.forEach(exp => {
                                    try {
                                        // 替换÷为/，×为*
                                        const sanitizedExp = exp.replace(/÷/g, '/').replace(/×/g, '*');
                                        const result = evaluateExpression(sanitizedExp);
                                        
                                        // 检查结果是否接近24（考虑浮点数误差）
                                        if (Math.abs(result - 24) < 0.0001) {
                                            // 美化表达式格式
                                            const prettyExp = exp
                                                .replace(/\((\d+)\)/g, '$1') // 移除多余的括号
                                                .replace(/\//g, '÷')
                                                .replace(/\*/g, '×');
                                            
                                            results.add(prettyExp);
                                        }
                                    } catch (e) {
                                        // 忽略计算错误
                                    }
                                });
                            }
                        }
                    }
                });
                
                return Array.from(results);
            }

            // 计算表达式的值
            function evaluateExpression(exp) {
                // 使用Function构造函数计算表达式
                try {
                    return new Function(`return ${exp};`)();
                } catch (e) {
                    return NaN;
                }
            }

            // 生成数组的所有排列
            function permute(nums) {
                const results = [];
                
                function backtrack(path, used) {
                    if (path.length === nums.length) {
                        results.push([...path]);
                        return;
                    }
                    
                    for (let i = 0; i < nums.length; i++) {
                        if (used[i]) continue;
                        
                        // 避免重复排列
                        if (i > 0 && nums[i] === nums[i-1] && !used[i-1]) continue;
                        
                        used[i] = true;
                        path.push(nums[i]);
                        
                        backtrack(path, used);
                        
                        used[i] = false;
                        path.pop();
                    }
                }
                
                backtrack([], Array(nums.length).fill(false));
                return results;
            }

            // 为输入框添加键盘事件
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.addEventListener('keydown', function(e) {
                    // 只允许数字、删除键和方向键
                    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                    if (!allowedKeys.includes(e.key) && !(e.key === 'Enter')) {
                        e.preventDefault();
                    }
                    
                    // 按Enter键时触发计算
                    if (e.key === 'Enter') {
                        calculateBtn.click();
                    }
                });
                
                // 限制输入范围
                input.addEventListener('change', function() {
                    if (this.value < 1) this.value = 1;
                    if (this.value > 13) this.value = 13;
                });
            });
        });