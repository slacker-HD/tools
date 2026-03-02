// 专门的脚本文件，负责初始化和操作 Ruffle 播放器

// 初始化Ruffle
const ruffle = window.RufflePlayer.newest();
const playerContainer = document.getElementById('flash-player');
let rufflePlayer = null;

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const urlInput = document.getElementById('url-input');
const loadUrlBtn = document.getElementById('load-url');
const resetBtn = document.getElementById('reset-btn');

// 上传区域点击事件
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件选择事件
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.swf')) {
        playSwfFile(file);
    } else {
        alert('请选择有效的SWF格式Flash文件！');
    }
});

// 拖拽文件支持
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-flash');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('border-flash');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-flash');
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.swf')) {
        playSwfFile(file);
    } else {
        alert('请选择有效的SWF格式Flash文件！');
    }
});

// 从URL加载
loadUrlBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
        loadSwfFromUrl(url);
    }
});

urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        loadUrlBtn.click();
    }
});

resetBtn.addEventListener('click', () => {
    clearPlayer();
});

function showFileInfo(text) {
    fileInfo.textContent = text;
}

// 清除播放器
function clearPlayer() {
    if (rufflePlayer) {
        rufflePlayer.remove();
        rufflePlayer = null;
    }
    playerContainer.innerHTML = '';
    showFileInfo('');
    urlInput.value = '';
}

// 播放SWF文件核心函数
function playSwfFile(file) {
    clearPlayer();
    showFileInfo(`文件: ${file.name} (${(file.size/1024).toFixed(1)} KB)`);
    const swfUrl = URL.createObjectURL(file);
    rufflePlayer = ruffle.createPlayer({
        autoplay: true,
        loop: false,
        volume: 1.0,
        allowScriptAccess: 'same-origin',
        allowFullScreen: true
    });
    playerContainer.appendChild(rufflePlayer);
    rufflePlayer.load(swfUrl).catch((error) => {
        console.error('播放失败:', error);
        alert('播放失败：' + error.message);
    });
}

function loadSwfFromUrl(url) {
    clearPlayer();
    showFileInfo(`URL: ${url}`);
    rufflePlayer = ruffle.createPlayer({
        autoplay: true,
        loop: false,
        volume: 1.0,
        allowScriptAccess: 'same-origin',
        allowFullScreen: true
    });
    playerContainer.appendChild(rufflePlayer);
    rufflePlayer.load(url).catch((error) => {
        console.error('加载失败:', error);
        alert('加载失败：' + error.message);
    });
}

// 错误处理
window.addEventListener('error', (e) => {
    console.error('播放器错误:', e.error);
});