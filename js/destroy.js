/*============================================
 *  Aetheria —负能量销毁室
 *  文件: js/destroy.js
 *  依赖: app.js (必须在此之前加载)
 *  功能: 输入负能量文字 → 选择销毁模式 → 粒子动画销毁 → 治愈语
 * ============================================ */

/* == BLOCK: destroy-data == */
var DESTROY_HEALING = {zh: [
        "一切都会好起来的。",
        "你已经很棒了。",
        "深呼吸，世界还在。",
        "放下了，就轻松了。",
        "那些困扰你的，已经不在了。",
        "你值得被温柔以待。",
        "过去的就让它过去吧。",
        "明天又是新的一天。",
        "你比你想象的更强大。",
        "此刻，你是自由的。",
        "乌云之上，永远是晴空。",
        "每一次释放，都是一次重生。"
    ],
    en: [
        "Everything will be okay.",
        "You are already amazing.",
        "Breathe. The world is still here.",
        "Let it go, and feel the lightness.",
        "What troubled you is gone now.",
        "You deserve to be treated gently.",
        "Let the past stay in the past.",
        "Tomorrow is a brand new day.",
        "You are stronger than you think.",
        "Right now, you are free.",
        "Above the clouds, the sky is always clear.",
        "Every release is a rebirth."
    ]
};
/* == END: destroy-data == */

/* == BLOCK: destroy-state == */
var destroyState = {
    mode: 'fire',
    particles: [],
    animating: false,
    canvas: null,
    ctx: null,
    animFrame: null,
    startTime: 0,
    duration: 3000
};
/* == END: destroy-state == */

/* == BLOCK: destroy-init == */
function initDestroy() {
    bindEventsDestroy();
}
/* == END: destroy-init == */

/* == BLOCK: destroy-bindEvents == */
function bindEventsDestroy() {
    /* 字数统计 */
    var textarea = $('#destroyInput');
    var charCount = $('#destroyCharCount');
    var destroyBtn = $('#destroyBtn');

    if (textarea) {
        textarea.addEventListener('input', function () {
            var len = textarea.value.length;
            charCount.textContent = len;
            destroyBtn.disabled = len === 0;
        });
    }

    /* 模式选择 */
    var modeBtns = $$('.destroy-mode-btn');
    for (var i = 0; i < modeBtns.length; i++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                for (var j = 0; j < modeBtns.length; j++) {
                    modeBtns[j].classList.remove('active');
                }
                btn.classList.add('active');
                destroyState.mode = btn.getAttribute('data-mode');
            });
        })(modeBtns[i]);
    }

    /* 销毁按钮 */
    if (destroyBtn) {
        destroyBtn.addEventListener('click', function () {
            if (destroyState.animating) return;
            var text = textarea.value.trim();
            if (!text) return;
            startDestroy(text);
        });
    }

    /* 再来一次 */
    var againBtn = $('#destroyAgainBtn');
    if (againBtn) {
        againBtn.addEventListener('click', function () {
            resetDestroy();
        });
    }
}
/* == END: destroy-bindEvents == */

/* == BLOCK: destroy-start == */
function startDestroy(text) {
    destroyState.animating = true;

    var canvasWrap = $('#destroyCanvasWrap');
    var canvas = $('#destroyCanvas');
    var inputCard = $('.destroy-input-card');
    var modeCard = $('.destroy-mode-card');
    var destroyBtn = $('#destroyBtn');

    /* 隐藏输入区域 */
    inputCard.style.display = 'none';
    modeCard.style.display = 'none';
    destroyBtn.style.display = 'none';

    /* 显示 canvas */
    canvasWrap.style.display = 'flex';

    /* 设置 canvas 尺寸 */
    var rect = canvasWrap.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    destroyState.canvas = canvas;
    destroyState.ctx = canvas.getContext('2d');
    destroyState.ctx.scale(dpr, dpr);

    /* 生成粒子 */
    destroyState.particles = createParticles(text, rect.width, rect.height);
    destroyState.startTime = Date.now();

    /* 启动动画 */
    animateDestroy(rect.width, rect.height);
}
/* == END: destroy-start == */

/* == BLOCK: destroy-particles == */
function createParticles(text, w, h) {
    var particles = [];
    var chars = text.split('');
    var cols = Math.ceil(Math.sqrt(chars.length * (w / h)));
    var rows = Math.ceil(chars.length / cols);
    var cellW = w / (cols + 1);
    var cellH = Math.min(h * 0.6/ (rows + 1), 40);
    var startY = h * 0.15;
    var startX = (w - cols * cellW) / 2;

    for (var i = 0; i < chars.length; i++) {
        var col = i % cols;
        var row = Math.floor(i / cols);
        var x = startX + (col + 0.5) * cellW;
        var y = startY + (row + 0.5) * cellH;

        particles.push({
            char: chars[i],
            x: x,
            y: y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            size: Math.min(cellW, cellH, 28) * 0.7,
            alpha: 1,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            delay: i * 30,
            life: 1
        });
    }

    return particles;
}
/* == END: destroy-particles == */

/* == BLOCK: destroy-animate == */
function animateDestroy(w, h) {
    var ctx = destroyState.ctx;
    var particles = destroyState.particles;
    var elapsed = Date.now() - destroyState.startTime;
    var progress = Math.min(elapsed / destroyState.duration, 1);

    ctx.clearRect(0, 0, w, h);

    var allDead = true;

    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var localElapsed = elapsed - p.delay;
        if (localElapsed < 0) {
            /* 还没开始，画原始状态 */
            drawParticle(ctx, p,1);
            allDead = false;
            continue;
        }

        var localProgress = Math.min(localElapsed / (destroyState.duration - p.delay), 1);

        /* 根据模式更新粒子 */
        updateParticleByMode(p, localProgress, w, h);

        if (p.life > 0.01) {
            drawParticle(ctx, p, p.life);
            allDead = false;
        }
    }

    if (!allDead && progress < 1.2) {
        destroyState.animFrame = requestAnimationFrame(function () {
            animateDestroy(w, h);
        });
    } else {
        finishDestroy();
    }
}
/* == END: destroy-animate == */

/* == BLOCK: destroy-modes == */
function updateParticleByMode(p, progress, w, h) {
    var mode = destroyState.mode;
    var eased = easeOutCubic(progress);

    if (mode === 'fire') {
        /* 火焰：上升 +摇摆 + 变红 + 消散 */
        p.x = p.originX + Math.sin(progress * 10+ p.originX) * 30* eased;
        p.y = p.originY - eased * h * 0.6;
        p.rotation += p.rotationSpeed;
        p.life = 1 - eased;
        p.color = lerpColor('#ffffff', '#ff4500', Math.min(progress * 2, 1));
        if (progress > 0.5) {
            p.color = lerpColor('#ff4500', '#ff0000', (progress - 0.5) * 2);
        }
    } else if (mode === 'water') {
        /* 水：下坠 + 波纹 + 变蓝 + 淡出 */
        p.x = p.originX + Math.sin(progress * 8 + p.originX * 0.1) * 20 * eased;
        p.y = p.originY + eased * h * 0.5;
        p.rotation += p.rotationSpeed * 0.5;
        p.life = 1 - eased;
        p.color = lerpColor('#ffffff', '#00bfff', Math.min(progress * 2, 1));
        p.size = p.size * (1 + eased * 0.5);
    } else if (mode === 'wind') {
        /* 风：向右飘散 + 旋转 + 缩小 */
        p.x = p.originX + eased * w * 0.8;
        p.y = p.originY + Math.sin(progress * 12 + p.originY * 0.1) * 40 * eased;
        p.rotation += p.rotationSpeed * 2;
        p.life = 1 - eased;
        p.color = lerpColor('#ffffff', '#a0a0a0', eased);} else if (mode === 'void') {
        /* 黑洞：螺旋吸入中心 */
        var cx = w / 2;
        var cy = h / 2;
        var dx = cx - p.originX;
        var dy = cy - p.originY;
        var angle = Math.atan2(dy, dx) + eased * Math.PI * 3;
        var dist = Math.sqrt(dx * dx + dy * dy) * (1 - eased);

        p.x = cx - Math.cos(angle) * dist;
        p.y = cy - Math.sin(angle) * dist;
        p.rotation += p.rotationSpeed * 3;
        p.life = 1 - eased * eased;
        p.color = lerpColor('#ffffff', '#8b5cf6', eased);
        p.size = p.size * (1 - eased * 0.8);
    }
}
/* == END: destroy-modes == */

/* == BLOCK: destroy-draw == */
function drawParticle(ctx, p, life) {
    if (life <= 0) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(0, life);
    ctx.font = p.size + 'px "Noto Sans SC", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* 发光效果 */
    if (p.color) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15* life;
        ctx.fillStyle = p.color;
    } else {
        ctx.shadowColor = 'var(--accent, #a78bfa)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
    }

    ctx.fillText(p.char, 0, 0);
    ctx.restore();
}
/* == END: destroy-draw == */

/* == BLOCK: destroy-finish == */
function finishDestroy() {
    destroyState.animating = false;

    if (destroyState.animFrame) {
        cancelAnimationFrame(destroyState.animFrame);destroyState.animFrame = null;
    }

    /* 隐藏 canvas */
    var canvasWrap = $('#destroyCanvasWrap');
    canvasWrap.style.display = 'none';

    /* 显示治愈语 */
    var resultDiv = $('#destroyResult');
    var resultText = $('#destroyResultText');
    var lang = localStorage.getItem('aetheria_lang') || 'zh';
    var healings = DESTROY_HEALING[lang] || DESTROY_HEALING.zh;
    var randomIndex = Math.floor(Math.random() * healings.length);

    resultText.textContent = healings[randomIndex];
    resultDiv.style.display = 'flex';
    resultDiv.classList.add('destroy-result-enter');

    /* 移除入场动画 class */
    setTimeout(function () {
        resultDiv.classList.remove('destroy-result-enter');
    }, 600);
}
/* == END: destroy-finish == */

/* == BLOCK: destroy-reset == */
function resetDestroy() {
    /* 重置所有状态 */
    var textarea = $('#destroyInput');
    var charCount = $('#destroyCharCount');
    var destroyBtn = $('#destroyBtn');
    var inputCard = $('.destroy-input-card');
    var modeCard = $('.destroy-mode-card');
    var resultDiv = $('#destroyResult');
    var canvasWrap = $('#destroyCanvasWrap');

    textarea.value = '';
    charCount.textContent = '0';
    destroyBtn.disabled = true;

    inputCard.style.display = '';
    modeCard.style.display = '';
    destroyBtn.style.display = '';
    resultDiv.style.display ='none';
    canvasWrap.style.display = 'none';

    destroyState.particles = [];
    destroyState.animating = false;

    if (destroyState.animFrame) {
        cancelAnimationFrame(destroyState.animFrame);
        destroyState.animFrame = null;
    }
}
/* == END: destroy-reset == */

/* == BLOCK: destroy-utils == */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function lerpColor(a, b, t) {
    var ar = parseInt(a.slice(1, 3), 16);
    var ag = parseInt(a.slice(3, 5), 16);
    var ab = parseInt(a.slice(5, 7), 16);
    var br = parseInt(b.slice(1, 3), 16);
    var bg = parseInt(b.slice(3, 5), 16);
    var bb = parseInt(b.slice(5, 7), 16);

    var rr = Math.round(ar + (br - ar) * t);
    var rg = Math.round(ag + (bg - ag) * t);
    var rb = Math.round(ab + (bb - ab) * t);

    return 'rgb(' + rr + ',' + rg + ',' + rb + ')';
}
/* == END: destroy-utils == */

/* == BLOCK: destroy-autoInit == */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDestroy);
} else {
    initDestroy();
}
/* == END: destroy-autoInit == */
