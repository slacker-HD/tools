document.addEventListener('DOMContentLoaded', function () {
  const inputColor = document.getElementById('input-color');
  const convertBtn = document.getElementById('convert-btn');
  const placeholder = document.getElementById('placeholder');
  const result = document.getElementById('result');
  const loading = document.getElementById('loading');
  const colorPreview = document.getElementById('color-preview');
  const copyToast = document.getElementById('copy-toast');

  // 颜色值显示元素
  const rValue = document.getElementById('r-value');
  const gValue = document.getElementById('g-value');
  const bValue = document.getElementById('b-value');
  const aValue = document.getElementById('a-value');
  const hexValue = document.getElementById('hex-value');
  const rgbValue = document.getElementById('rgb-value');
  const rgbaValue = document.getElementById('rgba-value');
  const hslValue = document.getElementById('hsl-value');
  const hslaValue = document.getElementById('hsla-value');

  // 转换按钮点击事件
  convertBtn.addEventListener('click', function () {
    const input = inputColor.value.trim();
    if (!input) {
      showToast('请输入颜色值');
      return;
    }

    placeholder.classList.add('hidden');
    result.classList.add('hidden');
    loading.classList.remove('hidden');

    setTimeout(() => {
      loading.classList.add('hidden');
      try {
        let color = parseColor(input);
        if (!color) {
          throw new Error('无法解析颜色值');
        }

        // 更新颜色预览
        colorPreview.style.backgroundColor = color.rgba;

        // 更新RGB值
        rValue.textContent = color.r;
        gValue.textContent = color.g;
        bValue.textContent = color.b;
        aValue.textContent = color.a.toFixed(2);

        // 更新各种格式的颜色值
        hexValue.textContent = color.hex;
        rgbValue.textContent = color.rgb;
        rgbaValue.textContent = color.rgba;
        hslValue.textContent = color.hsl;
        hslaValue.textContent = color.hsla;

        result.classList.remove('hidden');
      } catch (error) {
        showToast('输入的颜色格式不正确，请重新输入。');
        placeholder.textContent = '输入的颜色格式不正确，请重新输入。';
        placeholder.classList.remove('hidden');
      }
    }, 500);
  });

  // Added event listener to trigger conversion on Enter key press
  if (inputColor && convertBtn) {
    inputColor.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        convertBtn.click();
      }
    });
  }

  // 复制按钮点击事件
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const textToCopy = document.getElementById(targetId).textContent;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('复制成功');
      }).catch(err => {
        showToast('复制失败，请手动复制');
        console.error('复制失败:', err);
      });
    });
  });

  // 显示提示框
  function showToast(message) {
    copyToast.querySelector('span').textContent = message;
    copyToast.classList.remove('translate-y-16', 'opacity-0');
    copyToast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      copyToast.classList.remove('translate-y-0', 'opacity-100');
      copyToast.classList.add('translate-y-16', 'opacity-0');
    }, 2000);
  }

  // 解析颜色值
  function parseColor(input) {
    let color = {};

    // 处理十六进制格式
    if (input.startsWith('#')) {
      const hexMatch = input.match(/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})?$/i);
      if (hexMatch) {
        color.r = parseInt(hexMatch[1], 16);
        color.g = parseInt(hexMatch[2], 16);
        color.b = parseInt(hexMatch[3], 16);
        color.a = hexMatch[4] ? parseInt(hexMatch[4], 16) / 255 : 1;

        color.hex = hexMatch[4] ? `#${hexMatch[1]}${hexMatch[2]}${hexMatch[3]}${hexMatch[4]}` : `#${hexMatch[1]}${hexMatch[2]}${hexMatch[3]}`;
      } else {
        // 处理短格式十六进制 #RGB 或 #RGBA
        const shortHexMatch = input.match(/^#?([0-9A-F])([0-9A-F])([0-9A-F])([0-9A-F])?$/i);
        if (shortHexMatch) {
          color.r = parseInt(shortHexMatch[1] + shortHexMatch[1], 16);
          color.g = parseInt(shortHexMatch[2] + shortHexMatch[2], 16);
          color.b = parseInt(shortHexMatch[3] + shortHexMatch[3], 16);
          color.a = shortHexMatch[4] ? parseInt(shortHexMatch[4] + shortHexMatch[4], 16) / 255 : 1;

          color.hex = shortHexMatch[4]
            ? `#${shortHexMatch[1]}${shortHexMatch[1]}${shortHexMatch[2]}${shortHexMatch[2]}${shortHexMatch[3]}${shortHexMatch[3]}${shortHexMatch[4]}${shortHexMatch[4]}`
            : `#${shortHexMatch[1]}${shortHexMatch[1]}${shortHexMatch[2]}${shortHexMatch[2]}${shortHexMatch[3]}${shortHexMatch[3]}`;
        } else {
          throw new Error('无效的十六进制颜色格式');
        }
      }
    }
    // 处理RGB/RGBA格式
    else if (input.startsWith('rgb')) {
      const rgbMatch = input.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
      if (rgbMatch) {
        color.r = parseInt(rgbMatch[1], 10);
        color.g = parseInt(rgbMatch[2], 10);
        color.b = parseInt(rgbMatch[3], 10);
        color.a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;

        // 确保值在有效范围内
        color.r = Math.max(0, Math.min(255, color.r));
        color.g = Math.max(0, Math.min(255, color.g));
        color.b = Math.max(0, Math.min(255, color.b));
        color.a = Math.max(0, Math.min(1, color.a));

        // 生成十六进制值
        const rHex = color.r.toString(16).padStart(2, '0');
        const gHex = color.g.toString(16).padStart(2, '0');
        const bHex = color.b.toString(16).padStart(2, '0');
        const aHex = Math.round(color.a * 255).toString(16).padStart(2, '0');

        color.hex = color.a === 1 ? `#${rHex}${gHex}${bHex}` : `#${rHex}${gHex}${bHex}${aHex}`;
      } else {
        throw new Error('无效的RGB/RGBA颜色格式');
      }
    }
    // 处理HSL/HSLA格式
    else if (input.startsWith('hsl')) {
      const hslMatch = input.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)$/);
      if (hslMatch) {
        const h = parseInt(hslMatch[1], 10) / 360;
        const s = parseInt(hslMatch[2], 10) / 100;
        const l = parseInt(hslMatch[3], 10) / 100;
        color.a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;

        // 确保值在有效范围内
        color.a = Math.max(0, Math.min(1, color.a));

        // HSL转RGB
        let r, g, b;

        if (s === 0) {
          r = g = b = l; // 灰度
        } else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };

          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;

          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }

        color.r = Math.round(r * 255);
        color.g = Math.round(g * 255);
        color.b = Math.round(b * 255);

        // 生成十六进制值
        const rHex = color.r.toString(16).padStart(2, '0');
        const gHex = color.g.toString(16).padStart(2, '0');
        const bHex = color.b.toString(16).padStart(2, '0');
        const aHex = Math.round(color.a * 255).toString(16).padStart(2, '0');

        color.hex = color.a === 1 ? `#${rHex}${gHex}${bHex}` : `#${rHex}${gHex}${bHex}${aHex}`;
      } else {
        throw new Error('无效的HSL/HSLA颜色格式');
      }
    } else {
      throw new Error('不支持的颜色格式');
    }

    // 生成其他格式
    color.rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;
    color.rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(2)})`;

    // RGB转HSL
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = 0; // 无色调
      s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    const hDegrees = Math.round(h * 360);
    const sPercent = Math.round(s * 100);
    const lPercent = Math.round(l * 100);

    color.hsl = `hsl(${hDegrees}, ${sPercent}%, ${lPercent}%)`;
    color.hsla = `hsla(${hDegrees}, ${sPercent}%, ${lPercent}%, ${color.a.toFixed(2)})`;

    return color;
  }
});