// DOM元素
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loading = document.getElementById('loading');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusText = document.getElementById('status-text');
const fpsCounter = document.getElementById('fps-counter');
const motionStatus = document.getElementById('motion-status');
const photosContainer = document.getElementById('photos-container');
const notification = document.getElementById('notification');
const notificationIcon = document.getElementById('notification-icon');
const notificationText = document.getElementById('notification-text');

// 状态变量
let isDetecting = false;
let isCameraActive = false;
let previousImageData = null;
let intervalId = null;
let lastTime = 0;
let lastCaptureTime = 0;
let sensitivityValue = 50; // 默认灵敏度
let noSleep = null;
let wakeLock = null;
let isPageVisible = true;
const BACKGROUND_INTERVAL = 300; // 后台检测间隔（300ms）
const BACKEND_THRESHOLD = 15; // 后台模式基础阈值
let isPermissionRequested = false; // 权限请求状态

// 添加 NoSleep.js 脚本
const noSleepScript = document.createElement('script');
noSleepScript.src = 'https://unpkg.com/nosleep.js/dist/NoSleep.min.js';
document.head.appendChild(noSleepScript);

// 更新灵敏度值
document.getElementById('sensitivity').addEventListener('input', (e) => {
    sensitivityValue = parseInt(e.target.value);
});

// 显示通知
function showNotification(message, type = 'info') {
    notification.classList.remove('translate-y-20', 'opacity-0');
    notificationText.textContent = message;
    
    switch (type) {
        case 'success':
            notificationIcon.className = 'fa-solid fa-circle-check text-green-500';
            break;
        case 'error':
            notificationIcon.className = 'fa-solid fa-circle-exclamation text-red-500';
            break;
        default:
            notificationIcon.className = 'fa-solid fa-circle-info text-tool-monitor';
    }
    
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// 打开浏览器权限设置
function openPermissionSettings() {
    const ua = navigator.userAgent.toLowerCase();
    if (/chrome|edge/.test(ua)) {
        window.open('chrome://settings/content/camera', '_blank');
    } else if (/safari/.test(ua)) {
        window.open('safari://settings/privacy', '_blank');
    } else {
        showNotification('请手动打开浏览器权限设置', 'info');
    }
}

// 防止屏幕锁定
async function preventSleep() {
    try {
        if (!noSleep) noSleep = new NoSleep();
        await noSleep.enable();
        
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', async () => {
                try { wakeLock = await navigator.wakeLock.request('screen'); }
                catch (err) { console.warn('重新获取屏幕锁失败:', err); }
            });
        }
    } catch (err) {
        console.warn('阻止屏幕锁定失败:', err);
        showNotification('后台运行可能受限', 'error');
    }
}

// 释放屏幕锁定
function releaseSleep() {
    if (noSleep) noSleep.disable();
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}

// 检测移动
function detectMovement(prevFrame, currFrame, isBackend) {
    let changedPixels = 0;
    const totalPixels = prevFrame.data.length / 4;
    const baseThreshold = isBackend ? BACKEND_THRESHOLD : 30;
    
    for (let i = 0; i < prevFrame.data.length; i += 4) {
        const rDiff = Math.abs(prevFrame.data[i] - currFrame.data[i]);
        const gDiff = Math.abs(prevFrame.data[i + 1] - currFrame.data[i + 1]);
        const bDiff = Math.abs(prevFrame.data[i + 2] - currFrame.data[i + 2]);
        if ((rDiff + gDiff + bDiff) / 3 > baseThreshold) changedPixels++;
    }
    
    const changePercent = (changedPixels / totalPixels) * 100;
    const sensitivity = (100 - sensitivityValue) / 100;
    const threshold = isBackend ? 1 + (sensitivity * 3) : 0.5 + (sensitivity * 4);
    return changePercent > threshold;
}

// 帧处理
function processFrame() {
    if (!isDetecting) return;
    
    // 调整检测区域
    const area = document.getElementById('detection-area').value;
    let x=0, y=0, w=canvas.width, h=canvas.height;
    if (area === 'center') {
        const scale = 0.6;
        x = canvas.width * (1 - scale) / 2;
        y = canvas.height * (1 - scale) / 2;
        w = canvas.width * scale;
        h = canvas.height * scale;
    } else if (area === 'bottom') {
        y = canvas.height * 0.7;
        h = canvas.height * 0.3;
    }
    
    // 调整分辨率
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleFactor = isPageVisible ? 1 : 0.5; // 后台分辨率减半
    ctx.drawImage(video, x, y, w, h, 0, 0, w*scaleFactor, h*scaleFactor);
    
    const currentImageData = ctx.getImageData(
        0, 0, 
        w*scaleFactor, 
        h*scaleFactor
    );
    
    if (previousImageData) {
        const motionDetected = detectMovement(
            previousImageData,
            currentImageData,
            !isPageVisible
        );
        
        motionStatus.textContent = motionDetected ? '检测到移动' : '无运动';
        motionStatus.className = motionDetected 
            ? 'px-2 py-1 rounded-full bg-tool-pose/10 text-tool-pose' 
            : 'px-2 py-1 rounded-full bg-gray-100 text-gray-600';
        
        if (motionDetected) {
            const now = Date.now();
            const delay = parseInt(document.getElementById('capture-delay').value) * 1000;
            if (now - lastCaptureTime > delay) {
                capturePhoto();
                lastCaptureTime = now;
            }
        }
    }
    
    previousImageData = currentImageData;
    if (isPageVisible) updateFPS();
}

// 更新FPS
function updateFPS() {
    const now = performance.now();
    const fps = Math.round(1000 / (now - lastTime));
    fpsCounter.textContent = `FPS: ${fps}`;
    lastTime = now;
}

// 抓拍照片
function capturePhoto() {
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;
    const photoCtx = photoCanvas.getContext('2d');
    
    photoCtx.drawImage(video, 0, 0);
    const timestamp = new Date().toLocaleString();
    
    // 水印
    photoCtx.fillStyle = 'rgba(0,0,0,0.7)';
    photoCtx.fillRect(10, photoCanvas.height-30, 200, 25);
    photoCtx.fillStyle = 'white';
    photoCtx.font = '14px Arial';
    photoCtx.fillText(timestamp, 15, photoCanvas.height-10);
    
    // 创建卡片
    const photoCard = document.createElement('div');
    photoCard.className = 'bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300';
    photoCard.innerHTML = `
        <div class="aspect-video relative">
            <img src="${photoCanvas.toDataURL('image/jpeg', 0.8)}" alt="监控抓拍" class="w-full h-full object-cover">
            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">${timestamp}</div>
        </div>
        <div class="p-3 flex justify-between items-center">
            <a href="${photoCanvas.toDataURL('image/jpeg', 0.8)}" download="capture_${Date.now()}.jpg" class="text-xs text-tool-pose hover:text-tool-pose/80"><i class="fa-solid fa-download mr-1"></i>下载</a>
            <button onclick="this.closest('.bg-white').remove()" class="text-xs text-red-500 hover:text-red-600"><i class="fa-solid fa-trash mr-1"></i>删除</button>
        </div>
    `;
    
    photosContainer.insertBefore(photoCard, photosContainer.firstChild);
    if (photosContainer.firstChild.classList.contains('text-center')) {
        photosContainer.innerHTML = '';
    }
    showNotification('已捕获新画面', 'success');
}

// 修改初始化摄像头函数
async function initCamera() {
    try {
        // 先检查摄像头权限
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        if (permissionStatus.state === 'denied') {
            throw new Error('PermissionDeniedError');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        });
        
        video.srcObject = stream;
        
        // 等待视频加载
        await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
        });
        
        await video.play();
        
        // 设置画布尺寸
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // 更新状态
        isCameraActive = true;
        loading.style.display = 'none';
        statusText.textContent = '摄像头就绪';
        startBtn.disabled = false;
        showNotification('摄像头连接成功', 'success');
        
    } catch (error) {
        console.error('摄像头初始化失败:', error);
        let errorMsg = '摄像头连接失败';
        
        if (error.name === 'NotAllowedError' || error.message === 'PermissionDeniedError') {
            errorMsg = '请允许浏览器使用摄像头';
            setTimeout(() => {
                if (confirm('是否打开浏览器设置以允许摄像头权限？')) {
                    openPermissionSettings();
                }
            }, 1000);
        } else if (error.name === 'NotFoundError') {
            errorMsg = '未检测到摄像头设备';
        } else if (error.name === 'NotReadableError') {
            errorMsg = '摄像头可能被其他程序占用';
        }
        
        loading.innerHTML = `
            <div class="text-white text-center">
                <i class="fa-solid fa-exclamation-circle text-4xl mb-2"></i>
                <p>${errorMsg}</p>
                <button onclick="initCamera()" class="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
                    重试
                </button>
            </div>
        `;
        showNotification(errorMsg, 'error');
    }
}

// 开始监控
function startDetection() {
    if (!isCameraActive) {
        showNotification('请先连接摄像头', 'error');
        return;
    }
    
    isDetecting = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.textContent = '监控中...';
    preventSleep();
    
    if (!intervalId) {
        intervalId = setInterval(processFrame, BACKGROUND_INTERVAL);
    }
    showNotification('监控启动（支持后台）', 'success');
}

// 停止监控
function stopDetection() {
    isDetecting = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = '已停止';
    releaseSleep();
    
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    previousImageData = null;
    showNotification('监控停止', 'info');
}

// 页面可见性处理
function handleVisibilityChange() {
    isPageVisible = !document.hidden;
    if (!isPageVisible && isDetecting) {
        showNotification('后台监控运行中', 'info');
    }
}

// 事件监听
window.addEventListener('DOMContentLoaded', initCamera);
startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);
document.addEventListener('visibilitychange', handleVisibilityChange);

// 清理资源
window.addEventListener('beforeunload', () => {
    releaseSleep();
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    if (intervalId) clearInterval(intervalId);
});