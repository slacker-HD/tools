// 搜索和过滤功能脚本
// 删除categoryFilter相关JS
// const categoryFilter = document.getElementById('category-filter');
const keyReferenceContent = document.getElementById('key-reference-content');
const categoryCards = document.querySelectorAll('.category-card');
const keySections = document.querySelectorAll('.key-section');

// 初始化时显示所有快捷键
document.addEventListener('DOMContentLoaded', () => {
    keySections.forEach(section => {
        section.style.display = 'table-row-group';
    });
});

// 删除分类过滤功能
/*
categoryFilter.addEventListener('change', () => {
    const selectedCategory = categoryFilter.value;

    keySections.forEach(section => {
        const keys = section.querySelectorAll('tbody tr');
        let sectionVisible = false;

        keys.forEach(key => {
            const keyCategory = key.getAttribute('data-category');

            if (keyCategory === selectedCategory) {
                key.style.display = 'table-row';
                sectionVisible = true;
            } else {
                key.style.display = 'none';
            }
        });

        section.style.display = sectionVisible ? 'table-row-group' : 'none';
    });
});
*/

// 分类卡片点击事件
categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');

        // 高亮显示选中的分类卡片
        categoryCards.forEach(c => c.classList.remove('bg-tool-vim', 'text-white'));
        card.classList.add('bg-tool-vim', 'text-white');

        // 过滤快捷键
        keySections.forEach(section => {
            const keys = section.querySelectorAll('tbody tr');
            let sectionVisible = false;

            keys.forEach(key => {
                const keyCategory = key.getAttribute('data-category');

                if (keyCategory === category) {
                    key.style.display = 'table-row';
                    sectionVisible = true;
                } else {
                    key.style.display = 'none';
                }
            });

            section.style.display = sectionVisible ? 'table-row-group' : 'none';
        });
    });
});

// 折叠/展开功能
function toggleSection(id) {
    const section = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (section.style.display === 'none') {
        section.style.display = '';
        icon.style.transform = 'rotate(0deg)';
    } else {
        section.style.display = 'none';
        icon.style.transform = 'rotate(-90deg)';
    }
}

// 默认全部展开
document.addEventListener('DOMContentLoaded', () => {
    [
        'movement-table', 'insert-table', 'editing-table', 'search-table',
        'marks-table', 'files-table', 'buffers-table', 'windows-table',
        'tabs-table', 'help-table'
    ].forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = '';
        const icon = document.getElementById('icon-' + id);
        if (icon) icon.style.transform = 'rotate(0deg)';
    });
});
