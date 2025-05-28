jinrishici.load(function(result) {
    if (result.status === "success") {
        const data = result.data;
        const poemSingle = document.getElementById('poem-single');
        const poemDetail = document.getElementById('poem-detail');
        const container = document.querySelector('.bg-white.rounded-2xl.shadow-card');
        const baseHeight = 200; // 最小高度
        
        // 显示单句
        poemSingle.querySelector('span').textContent = data.content;
        
        // 显示完整诗词信息
        document.getElementById('poem-title').textContent = data.origin.title;
        document.getElementById('poem-dynasty').textContent = data.origin.dynasty;
        document.getElementById('poem-author').textContent = data.origin.author;
        
        // 显示完整诗句
        const contentDiv = document.getElementById('poem-content');
        contentDiv.innerHTML = data.origin.content.map(line => 
            `<p>${line}</p>`
        ).join('');

        // 添加点击事件
        poemSingle.addEventListener('click', () => {
            const isExpanded = poemDetail.classList.contains('show');
            
            if (isExpanded) {
                // 收起
                poemDetail.classList.remove('show');
                poemDetail.classList.remove('opacity-100');
                poemDetail.classList.add('opacity-0', 'max-h-0');
                poemSingle.querySelector('i').classList.remove('rotate-180');
                container.style.height = `${baseHeight}px`;
            } else {
                // 展开
                poemDetail.classList.add('show');
                poemDetail.classList.remove('opacity-0', 'max-h-0');
                poemDetail.classList.add('opacity-100');
                poemDetail.style.maxHeight = 'none';
                const fullHeight = container.scrollHeight;
                poemDetail.style.maxHeight = `${fullHeight}px`;
                container.style.height = `${fullHeight}px`;
                poemSingle.querySelector('i').classList.add('rotate-180');
            }
        });
    }
});
