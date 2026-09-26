<?php
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>圆形表盘 FontAwesome天气图标</title>
    <!-- 引入Font Awesome 6 CDN 全兼容 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
            font-family: system-ui, sans-serif;
        }
        html, body {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
        }
        .watch-circle {
            width: min(100vw, 100vh);
            height: min(100vw, 100vh);
            max-width: 800px;
            max-height: 800px;
            border-radius: 50%;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
            padding: 6% 4%;
            --bg-color: #000000;
            --text-color: #ffffff;
            background: var(--bg-color);
            color: var(--text-color);
        }
        /* 顶部时间 加大字号 */
        .area-top {
            text-align: center;
            width: 100%;
        }
        #time-text {
            font-size: clamp(36px, 9vw, 64px);
            font-weight: 700;
            line-height: 1;
        }
        #date-text {
            font-size: clamp(20px, 4.5vw, 36px);
            margin-top: 10px;
            opacity: 0.9;
        }
        /* 中间诗词：统一字重、加大字号 */
        .area-middle {
            text-align: center;
            width: 95%;
        }
        #poem-content {
            font-size: clamp(26px, 6vw, 46px);
            line-height: 1.6;
            font-weight: 500;
        }
        #poem-author {
            font-size: clamp(18px, 4vw, 30px);
            margin-top: 14px;
            opacity: 0.85;
        }
        /* 底部天气布局 */
        .area-bottom {
            width: auto;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: clamp(12px,2.5vw,20px);
            color: var(--text-color);
        }
        /* FA图标尺寸，自动继承文字颜色 */
        .weather-fa-icon {
            font-size: clamp(50px,11vw,76px);
        }
        .weather-data-wrap {
            display: flex;
            flex-direction: column;
            gap: clamp(6px,1vw,10px);
        }
        .weather-row {
            display: flex;
            gap: clamp(24px,5vw,44px);
            font-size: clamp(24px,5.5vw,40px);
            font-weight: 600;
        }
        /* 设置按钮 */
        .toggle-set-btn {
            position: absolute;
            bottom: 2%;
            left: 50%;
            transform: translateX(-50%);
            width: clamp(40px, 7vw, 56px);
            height: clamp(40px, 7vw, 56px);
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.25);
            color: var(--text-color);
            font-size: clamp(18px, 3vw, 26px);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100;
        }
        .toggle-set-btn:active {
            background: rgba(255,255,255,0.3);
        }
        .color-setting {
            position: absolute;
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.65);
            padding: 16px 26px;
            border-radius: 30px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            z-index: 99;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease;
            width: min(92vw, 500px);
        }
        .color-setting.show {
            opacity: 1;
            visibility: visible;
        }
        .set-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 18px;
            flex-wrap: wrap;
        }
        .color-setting label {
            font-size: clamp(16px, 3vw, 22px);
            white-space: nowrap;
        }
        .color-setting input[type="color"] {
            width: clamp(30px, 5vw, 40px);
            height: clamp(30px, 5vw, 40px);
            border: none;
            cursor: pointer;
        }
        #cityInput {
            padding: 8px 12px;
            border-radius: 8px;
            border: none;
            font-size: clamp(16px, 3vw, 22px);
            width: min(220px, 50vw);
        }
        .interval-slider {
            width: min(58vw, 260px);
        }
        #interval-value {
            min-width: 90px;
            text-align: center;
            font-size: clamp(16px, 3vw, 22px);
        }
        .loading {
            opacity: 0.6;
        }
    </style>
</head>
<body>
<div class="watch-circle" id="mainCircle">
    <div class="toggle-set-btn" id="toggleBtn">⚙</div>

    <div class="color-setting" id="colorPanel">
        <div class="set-row">
            <label>背景：<input type="color" id="bgColorPick"></label>
            <label>文字：<input type="color" id="txtColorPick"></label>
        </div>
        <div class="set-row">
            <label>天气城市：</label>
            <input id="cityInput" placeholder="例：合肥">
        </div>
        <div class="set-row">
            <label>诗词刷新：</label>
            <input class="interval-slider" type="range" id="intervalSlider" min="1" max="30">
            <span id="interval-value">1 分钟</span>
        </div>
    </div>

    <!-- 顶部时间 -->
    <div class="area-top">
        <div id="time-text">00:00:00</div>
        <div id="date-text">2026年06月30日 周二</div>
    </div>

    <!-- 中间诗词 -->
    <div class="area-middle">
        <div id="poem-content" class="loading">正在加载诗词...</div>
        <div id="poem-author"></div>
    </div>

    <!-- 底部天气 FA字体图标容器 -->
    <div class="area-bottom" id="weatherWrap">
        <i id="weatherIcon" class="fa weather-fa-icon"></i>
        <div class="weather-data-wrap">
            <div class="weather-row">
                <span>温度 <span id="tempVal">--℃</span></span>
                <span>体感 <span id="feelVal">--℃</span></span>
            </div>
            <div class="weather-row">
                <span>湿度 <span id="humVal">--%</span></span>
                <span>风速 <span id="windVal">--km/h</span></span>
            </div>
        </div>
    </div>
</div>

<script src="https://sdk.jinrishici.com/v2/browser/jinrishici.js" charset="utf-8"></script>
<script>
    const circle = document.getElementById('mainCircle');
    const timeEl = document.getElementById('time-text');
    const dateEl = document.getElementById('date-text');
    const poemContent = document.getElementById('poem-content');
    const poemAuthor = document.getElementById('poem-author');
    const bgPicker = document.getElementById('bgColorPick');
    const txtPicker = document.getElementById('txtColorPick');
    const toggleBtn = document.getElementById('toggleBtn');
    const colorPanel = document.getElementById('colorPanel');
    const intervalSlider = document.getElementById('intervalSlider');
    const intervalValue = document.getElementById('interval-value');
    const cityInput = document.getElementById('cityInput');
    const weatherWrap = document.getElementById('weatherWrap');
    const weatherIcon = document.getElementById('weatherIcon');
    const tempVal = document.getElementById('tempVal');
    const feelVal = document.getElementById('feelVal');
    const humVal = document.getElementById('humVal');
    const windVal = document.getElementById('windVal');

    const STORAGE_KEYS = {
        bgColor: 'watch_bg_color',
        txtColor: 'watch_txt_color',
        poemInterval: 'watch_poem_interval',
        weatherCity: 'watch_weather_city'
    };
    const DEFAULT_CONFIG = {
        bg: '#000000',
        text: '#ffffff',
        interval: 1,
        city: '合肥'
    };

    let poemTimer = null;
    let refreshMinute = DEFAULT_CONFIG.interval;
    let weatherTimer = null;

    // wttr天气code 映射 Font Awesome 图标类名
    const FA_MAP = {
        113: "fa-sun-o",
        116: "fa-cloud-sun",
        119: "fa-cloud",
        122: "fa-cloud",
        143: "fa-low-vision",
        248: "fa-low-vision",
        260: "fa-low-vision",
        176: "fa-cloud-rain",
        263: "fa-cloud-rain",
        266: "fa-cloud-rain",
        293: "fa-cloud-rain",
        296: "fa-cloud-rain",
        299: "fa-cloud-showers-heavy",
        302: "fa-cloud-showers-heavy",
        305: "fa-cloud-showers-heavy",
        308: "fa-cloud-showers-heavy",
        353: "fa-cloud-rain",
        356: "fa-cloud-showers-heavy",
        359: "fa-cloud-showers-heavy",
        179: "fa-snowflake-o",
        182: "fa-snowflake-o",
        185: "fa-snowflake-o",
        281: "fa-snowflake-o",
        284: "fa-snowflake-o",
        311: "fa-snowflake-o",
        314: "fa-snowflake-o",
        317: "fa-snowflake-o",
        320: "fa-snowflake-o",
        326: "fa-snowflake-o",
        329: "fa-snowflake-o",
        332: "fa-snowflake-o",
        335: "fa-snowflake-o",
        338: "fa-snowflake-o",
        350: "fa-snowflake-o",
        362: "fa-snowflake-o",
        365: "fa-snowflake-o",
        368: "fa-snowflake-o",
        371: "fa-snowflake-o",
        374: "fa-snowflake-o",
        377: "fa-snowflake-o",
        200: "fa-bolt",
        386: "fa-bolt",
        389: "fa-bolt",
        392: "fa-bolt",
        395: "fa-bolt",
        227: "fa-wind",
        230: "fa-wind",
        default: "fa-cloud"
    };

    function getWeatherFaClass(code) {
        return FA_MAP[code] || FA_MAP["default"];
    }

    function setBgColor(colorVal) {
        circle.style.setProperty('--bg-color', colorVal);
        bgPicker.value = colorVal;
        bgPicker.setAttribute('value', colorVal);
        localStorage.setItem(STORAGE_KEYS.bgColor, colorVal);
    }

    function setTextColor(colorVal) {
        circle.style.setProperty('--text-color', colorVal);
        txtPicker.value = colorVal;
        txtPicker.setAttribute('value', colorVal);
        localStorage.setItem(STORAGE_KEYS.txtColor, colorVal);
        // FA图标自动继承父级color，无需额外滤镜
        document.querySelector('.area-bottom').style.color = colorVal;
    }

    function loadLocalConfig() {
        let savedBg = localStorage.getItem(STORAGE_KEYS.bgColor);
        if (!savedBg) savedBg = DEFAULT_CONFIG.bg;
        setBgColor(savedBg);
        let savedTxt = localStorage.getItem(STORAGE_KEYS.txtColor);
        if (!savedTxt) savedTxt = DEFAULT_CONFIG.text;
        setTextColor(savedTxt);
        let savedInterval = localStorage.getItem(STORAGE_KEYS.poemInterval);
        refreshMinute = (!savedInterval || isNaN(savedInterval)) ? DEFAULT_CONFIG.interval : Math.max(1,Math.min(30,Number(savedInterval)));
        intervalSlider.value = refreshMinute;
        intervalValue.innerText = `${refreshMinute} 分钟`;
        localStorage.setItem(STORAGE_KEYS.poemInterval, refreshMinute);
        let savedCity = localStorage.getItem(STORAGE_KEYS.weatherCity);
        cityInput.value = savedCity || DEFAULT_CONFIG.city;
    }

    function resetPoemTimer() {
        if (poemTimer) clearInterval(poemTimer);
        poemTimer = setInterval(loadPoem, refreshMinute * 60 * 1000);
    }
    function resetWeatherTimer() {
        if (weatherTimer) clearInterval(weatherTimer);
        weatherTimer = setInterval(getWeather, 30 * 60 * 1000);
    }

    toggleBtn.addEventListener('click', () => colorPanel.classList.toggle('show'));
    bgPicker.addEventListener('input', e => setBgColor(e.target.value));
    txtPicker.addEventListener('input', e => setTextColor(e.target.value));
    intervalSlider.addEventListener('input', e => {
        refreshMinute = Number(e.target.value);
        intervalValue.innerText = `${refreshMinute} 分钟`;
        localStorage.setItem(STORAGE_KEYS.poemInterval, refreshMinute);
        resetPoemTimer();
    });
    cityInput.addEventListener('blur', () => {
        const city = cityInput.value.trim();
        if (city) {
            localStorage.setItem(STORAGE_KEYS.weatherCity, city);
            getWeather();
        }
    });
    cityInput.addEventListener('keydown', e => e.key === 'Enter' && cityInput.blur());

    function updateDateTime() {
        const now = new Date();
        const weekArr = ['周日','周一','周二','周三','周四','周五','周六'];
        const h = String(now.getHours()).padStart(2,'0');
        const m = String(now.getMinutes()).padStart(2,'0');
        const s = String(now.getSeconds()).padStart(2,'0');
        const y = now.getFullYear();
        const mon = String(now.getMonth()+1).padStart(2,'0');
        const d = String(now.getDate()).padStart(2,'0');
        const week = weekArr[now.getDay()];
        timeEl.innerText = `${h}:${m}:${s}`;
        dateEl.innerText = `${y}年${mon}月${d}日 ${week}`;
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);

    function loadPoem() {
        poemContent.classList.add('loading');
        if (typeof jinrishici === 'undefined') {
            poemContent.innerText = "诗词加载失败，请检查网络";
            poemContent.classList.remove('loading');
            return;
        }
        jinrishici.load(res => {
            if (res.status === 'success' && res.data) {
                const data = res.data;
                const content = data.content;
                const origin = data.origin;
                const display = content.replace(/([，。？！；、])/g, "$1\n").replace(/\n+/g,"\n").replace(/\n$/,"");
                poemContent.innerText = display;
                poemAuthor.innerText = (origin.dynasty ? `【${origin.dynasty}】`:"") + origin.author + (origin.title ? `《${origin.title}》`:"");
                poemContent.classList.remove('loading');
            } else {
                poemContent.innerText = "诗词加载失败";
                poemContent.classList.remove('loading');
            }
        }, err => {
            poemContent.innerText = "诗词加载失败";
            poemContent.classList.remove('loading');
        });
    }
    document.querySelector('.area-middle').addEventListener('click', loadPoem);

    weatherWrap.addEventListener('click', getWeather);
    function httpGet(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (xhr.status >=200 && xhr.status <300) {
                try {
                    const json = JSON.parse(xhr.responseText);
                    callback(null, json);
                } catch(e) {
                    callback("解析JSON失败", null);
                }
            } else {
                callback(`请求错误${xhr.status}`, null);
            }
        };
        xhr.onerror = () => callback("网络请求失败", null);
        xhr.send();
    }
    function getWeather() {
        const city = cityInput.value.trim() || DEFAULT_CONFIG.city;
        tempVal.innerText = "--℃";
        feelVal.innerText = "--℃";
        humVal.innerText = "--%";
        windVal.innerText = "--km/h";
        weatherIcon.className = `fa weather-fa-icon ${getWeatherFaClass("default")}`;
        const url = `weather_api.php?city=${encodeURIComponent(city)}`;
        httpGet(url, (err, data) => {
            if(err || !data) return;
            renderWeather(data);
        });
    }
    function renderWeather(data) {
        if(data.error) {
            tempVal.innerText = "获取失败";
            return;
        }
        const current = data.current_condition[0];
        const code = current.weatherCode;
        // 切换FA图标类名
        weatherIcon.className = `fa weather-fa-icon ${getWeatherFaClass(code)}`;
        tempVal.innerText = `${current.temp_C} ℃`;
        feelVal.innerText = `${current.FeelsLikeC} ℃`;
        humVal.innerText = `${current.humidity} %`;
        windVal.innerText = `${current.windspeedKmph} km/h`;
    }

    function initPage() {
        setTimeout(() => {
            loadLocalConfig();
            resetPoemTimer();
            resetWeatherTimer();
            setTimeout(loadPoem, 800);
            setTimeout(getWeather, 1200);
        }, 100);
    }
    window.addEventListener('DOMContentLoaded', initPage);

    let fullScreenTriggered = false;
    function fullScreen() {
        if(fullScreenTriggered) return;
        const doc = document.documentElement;
        if(doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
        fullScreenTriggered = true;
    }
    document.body.addEventListener('click', fullScreen);
</script>
</body>
</html>