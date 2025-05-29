// 格式化日期函数
function formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}

// 从日期字符串中提取年份
function extractYear(dateStr) {
    return dateStr.split('年')[0];
}

// 创建历史事件卡片
function createEventCard(event) {
    const year = extractYear(event.date);
    return `
        <div class="bg-gray-50 p-3 rounded-lg hover:shadow-md transition-all duration-300 mb-2">
            <div class="flex items-center">
                <div class="flex-shrink-0 bg-tool-history/10 text-tool-history font-bold py-1 px-3 rounded w-20 text-center flex items-center justify-center min-h-[2rem]">
                    ${year}年
                </div>
                <p class="ml-4 text-gray-700 flex-1">${event.title}</p>
            </div>
        </div>
    `;
}

// 初始化页面
document.addEventListener('DOMContentLoaded', async () => {
    const currentDate = new Date();
    document.getElementById('current-date').textContent = formatDate(currentDate);

    try {
        const response = await fetch('https://api.oick.cn/api/lishi');
        const data = await response.json();
        console.log('API Response:', data); // 调试用

        const container = document.getElementById('history-container');
        document.getElementById('loading').remove();

        if (data && data.result && Array.isArray(data.result)) {
            // 按年份排序（从新到旧）
            const sortedEvents = data.result.sort((a, b) => 
                extractYear(b.date) - extractYear(a.date)
            );
            const eventsHTML = `<div class="space-y-2">${sortedEvents.map(createEventCard).join('')}</div>`;
            container.innerHTML = eventsHTML || '<p class="text-center text-gray-500">暂无历史数据</p>';
        } else {
            throw new Error(`数据格式不正确: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error('获取历史数据失败:', error);
        document.getElementById('loading').innerHTML = `
            <div class="text-center text-red-500">
                <i class="fa-solid fa-exclamation-circle text-3xl mb-2"></i>
                <p>数据加载失败，请稍后再试</p>
                <p class="text-sm text-gray-500 mt-2">${error.message}</p>
            </div>
        `;
    }
});
