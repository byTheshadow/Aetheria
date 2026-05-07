/*============================================
 * Aetheria — 决策转盘
 *   文件: js/wheel.js
 *   依赖: app.js (必须在此之前加载)
 *   功能: 输入 2-8 个选项，canvas 绘制转盘，物理减速旋转，结果高亮
 * ============================================ */

/* == BLOCK: wheel-data == */
// 各主题对应的转盘配色方案
var WHEEL_PALETTES = {
    moon:   ['#a78bfa', '#7c3aed', '#c4b5fd', '#6d28d9', '#ddd6fe', '#8b5cf6', '#ede9fe', '#4c1d95'],
    sakura: ['#f472b6', '#ec4899', '#fbcfe8', '#db2777', '#fce7f3', '#be185d', '#fdf2f8', '#9d174d'],
    forest: ['#6ee7b7', '#10b981', '#a7f3d0', '#059669', '#d1fae5', '#047857', '#ecfdf5', '#065f46'],
    void:   ['#e2e8f0', '#94a3b8', '#cbd5e1', '#64748b', '#f1f5f9', '#475569', '#f8fafc', '#334155']
};
/* == END: wheel-data == */

/* == BLOCK: wheel-state == */
var wheelState = {
    options: [],          // 当前选项数组
    isSpinning: false,    // 是否正在旋转
    currentAngle: 0,      // 当前转盘角度（弧度）
    animFrame: null,      // requestAnimationFrame 句柄
    palette: []           // 当前配色
};
/* == END: wheel-state == */

/* == BLOCK: wheel-init == */
function initWheel() {
    loadWheelOptions();
    renderWheelOptionsList();
    drawWheel();
    bindEventsWheel();
}
/* == END: wheel-init == */

/* == BLOCK: wheel-storage == */
function loadWheelOptions() {
    var saved = localStorage.getItem('aetheria_wheel_options');
    if (saved) {
        try {
            wheelState.options = JSON.parse(saved);
        } catch (e) {
            wheelState.options = [];
        }
    }
}

function saveWheelOptions() {
    localStorage.setItem('aetheria_wheel_options', JSON.stringify(wheelState.options));
}
/* == END: wheel-storage == */

/* == BLOCK: wheel-bindEvents == */
function bindEventsWheel() {
    var addBtn   = $('#wheelAddBtn');
    var addInput = $('#wheelAddInput');
    var spinBtn  = $('#wheelSpinBtn');
    var againBtn = $('#wheelAgainBtn');
    var resetBtn = $('#wheelResetBtn');

    // 添加选项
    addBtn.addEventListener('click', function() {
        wheelAddOption();
    });

    // 回车添加
    addInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            wheelAddOption();
        }
    });

    // 旋转
    spinBtn.addEventListener('click', function() {
        if (!wheelState.isSpinning && wheelState.options.length >= 2) {
            wheelSpin();
        }
    });

    // 再转一次
    againBtn.addEventListener('click', function() {
        $('#wheelResult').style.display = 'none';
        if (!wheelState.isSpinning && wheelState.options.length >= 2) {
            wheelSpin();
        }
    });

    // 重置选项
    resetBtn.addEventListener('click', function() {
        wheelState.options = [];
        saveWheelOptions();
        renderWheelOptionsList();
        drawWheel();
        $('#wheelResult').style.display = 'none';
        updateWheelSpinBtn();
    });

    // 监听主题变化：重绘转盘
    var observer = new MutationObserver(function() {
        drawWheel();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
/* == END: wheel-bindEvents == */

/* == BLOCK: wheel-options == */
function wheelAddOption() {
    var input = $('#wheelAddInput');
    var val = input.value.trim();

    if (!val) return;
    if (wheelState.options.length >= 8) {
        showToast('wheel_toast_max');
        return;
    }
    // 去重
    for (var i = 0; i < wheelState.options.length; i++) {
        if (wheelState.options[i] === val) {
            showToast('wheel_toast_dup');
            return;
        }
    }

    wheelState.options.push(val);
    saveWheelOptions();
    input.value = '';
    renderWheelOptionsList();
    drawWheel();
    updateWheelSpinBtn();
}

function wheelRemoveOption(index) {
    wheelState.options.splice(index, 1);
    saveWheelOptions();
    renderWheelOptionsList();
    drawWheel();
    updateWheelSpinBtn();
    // 如果结果还在显示，隐藏掉
    $('#wheelResult').style.display = 'none';
}

function renderWheelOptionsList() {
    var list = $('#wheelOptionsList');
    list.innerHTML = '';

    for (var i = 0; i < wheelState.options.length; i++) {
        (function(idx) {
            var item = document.createElement('div');
            item.className = 'wheel-option-item';

            var dot = document.createElement('span');
            dot.className = 'wheel-option-dot';
            dot.style.background = getWheelPalette()[idx % getWheelPalette().length];

            var label = document.createElement('span');
            label.className = 'wheel-option-label';
            label.textContent = wheelState.options[idx];

            var del = document.createElement('button');
            del.className = 'wheel-option-del';
            del.innerHTML = '&times;';
            del.setAttribute('aria-label', 'Remove option');
            del.addEventListener('click', function() {
                wheelRemoveOption(idx);
            });

            item.appendChild(dot);
            item.appendChild(label);
            item.appendChild(del);
            list.appendChild(item);
        })(i);
    }

    // 更新提示文字
    var hint = $('#wheelHint');
    if (wheelState.options.length === 0) {
        hint.setAttribute('data-i18n', 'wheel_hint');
        hint.textContent = t('wheel_hint');
        hint.style.display = '';
    } else if (wheelState.options.length === 1) {
        hint.setAttribute('data-i18n', 'wheel_hint_one');
        hint.textContent = t('wheel_hint_one');
        hint.style.display = '';
    } else {
        hint.style.display = 'none';
    }
}

function updateWheelSpinBtn() {
    var btn = $('#wheelSpinBtn');
    if (wheelState.options.length >= 2) {
        btn.removeAttribute('disabled');
    } else {
        btn.setAttribute('disabled', 'disabled');
    }
}
/* == END: wheel-options == */

/* == BLOCK: wheel-draw == */
function getWheelPalette() {
    var theme = document.documentElement.getAttribute('data-theme') || 'moon';
    return WHEEL_PALETTES[theme] || WHEEL_PALETTES.moon;
}

function drawWheel() {
    var canvas = $('#wheelCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    var cx = W / 2;
    var cy = H / 2;
    var radius = Math.min(cx, cy) - 8;

    ctx.clearRect(0, 0, W, H);

    var options = wheelState.options;
    var palette = getWheelPalette();

    if (options.length === 0) {
        // 空状态：画一个虚线圆
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '14px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t('wheel_empty'), cx, cy);
        ctx.restore();
        return;
    }

    var sliceAngle = (Math.PI * 2) / options.length;

    for (var i = 0; i < options.length; i++) {
        var startAngle = wheelState.currentAngle + i * sliceAngle;
        var endAngle   = startAngle + sliceAngle;
        var color      = palette[i % palette.length];

        // 扇形
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // 扇形边框
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // 文字
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.font = 'bold ' + getFontSize(options[i]) + 'px "Noto Sans SC", "Inter", sans-serif';
        ctx.fillText(truncateText(options[i], 8), radius - 12, 0);
        ctx.restore();
    }

    // 中心圆
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function getFontSize(text) {
    if (text.length <= 4) return 13;
    if (text.length <= 7) return 11;
    return 9;
}

function truncateText(text, maxLen) {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1) + '…';
}
/* == END: wheel-draw == */

/* == BLOCK: wheel-spin == */
function wheelSpin() {
    if (wheelState.isSpinning) return;
    if (wheelState.options.length < 2) return;

    wheelState.isSpinning = true;
    $('#wheelSpinBtn').setAttribute('disabled', 'disabled');
    $('#wheelResult').style.display = 'none';

    // 随机旋转圈数：5~10圈 + 随机偏移
    var extraSpins = (5 + Math.random() * 5) * Math.PI * 2;
    var randomOffset = Math.random() * Math.PI * 2;
    var totalRotation = extraSpins + randomOffset;

    var startAngle = wheelState.currentAngle;
    var targetAngle = startAngle + totalRotation;

    // 动画参数
    var duration = 4000 + Math.random() * 1500; // 4~5.5秒
    var startTime = null;

    function easeOut(t) {
        // cubic ease-out
        return 1 - Math.pow(1 - t, 3);
    }

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var easedProgress = easeOut(progress);

        wheelState.currentAngle = startAngle + totalRotation * easedProgress;
        drawWheel();

        if (progress < 1) {
            wheelState.animFrame = requestAnimationFrame(animate);
        } else {
            wheelState.currentAngle = targetAngle;
            wheelState.isSpinning = false;
            drawWheel();
            wheelShowResult();
            $('#wheelSpinBtn').removeAttribute('disabled');
        }
    }

    wheelState.animFrame = requestAnimationFrame(animate);
}

function wheelShowResult() {
    var options = wheelState.options;
    var count = options.length;
    var sliceAngle = (Math.PI * 2) / count;

    // 指针在顶部（-π/2），计算指针指向哪个扇区
    // 转盘顺时针旋转，指针固定在顶部
    // 扇区 i 的中心角 = currentAngle + i * sliceAngle + sliceAngle/2
    // 指针角度 = -π/2（顶部），需要找哪个扇区包含这个角度
    var pointerAngle = -Math.PI / 2;

    // 归一化 currentAngle
    var normalizedAngle = ((wheelState.currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // 指针相对于转盘的角度
    var relativeAngle = ((pointerAngle - normalizedAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

    // 找到对应扇区
    var winIndex = Math.floor(relativeAngle / sliceAngle) % count;

    var resultEl = $('#wheelResult');
    var resultText = $('#wheelResultText');

    resultText.textContent = options[winIndex];
    resultEl.style.display = '';

    // 高亮获胜扇区
    drawWheelHighlight(winIndex);
}

function drawWheelHighlight(winIndex) {
    var canvas = $('#wheelCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    var cx = W / 2;
    var cy = H / 2;
    var radius = Math.min(cx, cy) - 8;
    var options = wheelState.options;
    var palette = getWheelPalette();
    var sliceAngle = (Math.PI * 2) / options.length;

    // 重绘整个转盘
    drawWheel();

    // 在获胜扇区上叠加高亮
    var startAngle = wheelState.currentAngle + winIndex * sliceAngle;
    var endAngle   = startAngle + sliceAngle;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 重绘中心圆（覆盖在高亮上面）
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}
/* == END: wheel-spin == */

/* == BLOCK: wheel-autoInit == */
document.addEventListener('DOMContentLoaded', function() {
    initWheel();
});
/* == END: wheel-autoInit == */
