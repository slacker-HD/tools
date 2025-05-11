// 小数转分数函数，eps 为可选参数
function fraction(x, eps = 1e-10) {
    if (Math.abs(x) < eps) {
        return "0";
    }
    // 先去掉小数的整数部分
    let n = Math.floor(x);
    x -= n;
    if (x < eps) {
        return `${n}/1`;
    } else if (1 - eps < x) {
        return `${n + 1}/1`;
    }

    let lower_n = 0;
    let lower_d = 1;
    let upper_n = 1;
    let upper_d = 1;
    let middle_n, middle_d;
    while (true) {
        // The middle fraction is (lower_n + upper_n) / (lower_d + upper_d)
        middle_n = lower_n + upper_n;
        middle_d = lower_d + upper_d;
        // If x + error < middle
        if (middle_d * (x + eps) < middle_n) {
            // middle is our new upper
            upper_n = middle_n;
            upper_d = middle_d;
        }
        // Else If middle < x - error
        else if (middle_n < (x - eps) * middle_d) {
            // middle is our new lower
            lower_n = middle_n;
            lower_d = middle_d;
        }
        // Else middle is our best fraction
        else {
            return `${n * middle_d + middle_n}/${middle_d}`;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    const decimalInput = document.getElementById('decimal-input');
    const epsInput = document.getElementById('eps-input');
    const convertBtn = document.getElementById('convert-btn');
    const placeholder = document.getElementById('placeholder');
    const result = document.getElementById('result');
    const loading = document.getElementById('loading');
    const fractionResult = document.getElementById('fraction-result');
    const loadingText = document.getElementById('loading-text');

    convertBtn.addEventListener('click', function () {
        const decimalValue = parseFloat(decimalInput.value);
        if (isNaN(decimalValue)) {
            alert('请输入有效的小数！');
            return;
        }

        let epsValue = parseFloat(epsInput.value);
        if (isNaN(epsValue)) {
            epsValue = 1e-10; // 使用默认值
        }

        // 显示加载状态
        placeholder.classList.add('hidden');
        result.classList.add('hidden');
        loading.classList.remove('hidden');
        loadingText.textContent = "正在转换...";

        // 模拟思考时间
        setTimeout(() => {
            const fractionValue = fraction(decimalValue, epsValue);
            fractionResult.textContent = fractionValue;

            // 隐藏加载状态，显示结果
            loading.classList.add('hidden');
            result.classList.remove('hidden');

            // 添加动画效果
            result.classList.add('animate-float');
            setTimeout(() => {
                result.classList.remove('animate-float');
            }, 1000);
        }, 1500);
    });
});