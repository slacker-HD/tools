// 获取语录并显示在页面上
async function fetchRuozhibaQuote() {
    try {
        const response = await fetch('./api/Ruozhiba.php');
        if (!response.ok) {
            throw new Error('网络请求失败');
        }
        const data = await response.json();
        if (data.success) {
            document.getElementById('ruozhiba-quote').textContent = data.content;
        } else {
            console.error('API错误:', data.error);
            document.getElementById('ruozhiba-quote').textContent = '获取语录失败，请稍后重试！';
        }
    } catch (error) {
        console.error('获取语录时发生错误:', error);
        document.getElementById('ruozhiba-quote').textContent = '获取语录失败，请检查网络连接！';
    }
}

// 绑定按钮点击事件
document.addEventListener('DOMContentLoaded', () => {
    const getQuoteBtn = document.getElementById('get-quote-btn');
    getQuoteBtn.addEventListener('click', fetchRuozhibaQuote);

    // 页面加载时自动获取一条语录
    fetchRuozhibaQuote();
});