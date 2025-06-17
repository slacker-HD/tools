// 获取语录并显示在页面上
async function fetchFeihuaQuote() {
    try {
        const response = await fetch('./api/Feihua.php');
        if (!response.ok) {
            throw new Error('网络请求失败');
        }
        const data = await response.json();

        if (data.success && data.quote) {
            document.getElementById('feihua-quote').querySelector('span').textContent = data.quote;
        } else {
            console.error('API错误:', data.error || '未找到 content 字段');
            document.getElementById('feihua-quote').querySelector('span').textContent = '获取语录失败，请稍后重试！';
        }
    } catch (error) {
        console.error('获取语录时发生错误:', error);
        document.getElementById('feihua-quote').querySelector('span').textContent = '获取语录失败，请检查网络连接！';
    }
}

// 绑定按钮点击事件
document.addEventListener('DOMContentLoaded', () => {
    const getQuoteBtn = document.getElementById('get-quote-btn');
    getQuoteBtn.addEventListener('click', fetchFeihuaQuote);

    // 页面加载时自动获取一条语录
    fetchFeihuaQuote();

    // 添加引言区域的点击事件
    const quoteContainer = document.getElementById('feihua-quote');
    quoteContainer.addEventListener('click', () => {
        quoteContainer.classList.toggle('expanded');
    });
});