/* == BLOCK: wheel-init == */
window.AetheriaWheel = (function () {
  'use strict';

  const STORAGE_KEY = 'aetheria_wheel_options';
  const PALETTE = [
    'rgba(167,139,250,0.85)', 'rgba(110,231,183,0.85)',
    'rgba(251,191,36,0.85)',  'rgba(244,114,182,0.85)',
    'rgba(96,165,250,0.85)',  'rgba(251,146,60,0.85)',
    'rgba(167,243,208,0.85)', 'rgba(196,181,253,0.85)',
  ];

  let options  = [];
  let spinning = false;
  let angle    = 0;
  let canvas, ctx, spinBtn, resultEl, resultText;

  function loadOptions() {
    options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function saveOptions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  }

  function renderOptionTags() {
    const list = document.getElementById('optionsList');
    if (!list) return;
    list.innerHTML = '';
    options.forEach((opt, i) => {
      const tag = document.createElement('div');
      tag.className = 'option-tag';
      tag.innerHTML = `<span>${escapeHtml(opt)}</span><button aria-label="删除 ${escapeHtml(opt)}" data-i="${i}">×</button>`;
      tag.querySelector('button').addEventListener('click', () => {
        options.splice(i, 1);
        saveOptions();
        renderOptionTags();
        drawWheel();
      });
      list.appendChild(tag);
    });
  }

  function drawWheel() {
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r  = Math.min(cx, cy) - 8;

    ctx.clearRect(0, 0, w, h);

    if (options.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('添加选项后旋转', cx, cy);
      return;
    }

    const slice = (Math.PI * 2) / options.length;

    options.forEach((opt, i) => {
      const start = angle + i * slice;
      const end   = start + slice;

      // Slice fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();

      // Slice border
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
            ctx.textAlign    = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle    = 'rgba(255,255,255,0.95)';
      ctx.font         = `${Math.min(13, 120 / options.length + 6)}px Inter, sans-serif`;
      ctx.shadowColor  = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur   = 4;

      // Truncate long labels
      const maxLen = 8;
      const label  = opt.length > maxLen ? opt.slice(0, maxLen) + '…' : opt;
      ctx.fillText(label, r - 12, 0);
      ctx.restore();
    });

    // Center circle
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    centerGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    centerGrad.addColorStop(1, 'rgba(255,255,255,0.05)');
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle   = centerGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Pointer (top center)
    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#a78bfa';
    ctx.beginPath();
    ctx.moveTo(cx,      8);
    ctx.lineTo(cx - 10, 28);
    ctx.lineTo(cx + 10, 28);
    ctx.closePath();
    ctx.fillStyle   = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur  = 12;
    ctx.fill();
    ctx.shadowBlur  = 0;
  }

  function spin() {
    if (spinning || options.length < 2) {
      if (options.length < 2) window.AetheriaApp?.showToast?.('至少需要 2 个选项');
      return;
    }

    spinning = true;
    spinBtn.disabled = true;

    const extraSpins  = (5 + Math.floor(Math.random() * 5)) * Math.PI * 2;
    const targetSlice = Math.floor(Math.random() * options.length);
    const sliceAngle  = (Math.PI * 2) / options.length;
    // Land pointer (top = -π/2) on targetSlice center
    const targetAngle = extraSpins - (targetSlice * sliceAngle + sliceAngle / 2) - (Math.PI / 2) % (Math.PI * 2);

    const startAngle = angle;
    const totalDelta = targetAngle - (startAngle % (Math.PI * 2)) + Math.PI * 2 * 5;
    const duration   = 4000 + Math.random() * 1500;
    const startTime  = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function frame(now) {
      const elapsed = now - startTime;
      const t       = Math.min(elapsed / duration, 1);
      angle = startAngle + totalDelta * easeOut(t);
      drawWheel();

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        spinBtn.disabled = false;

        // Determine winner: pointer at top (angle = -π/2 mod 2π)
        const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const pointerAngle = (Math.PI * 2 - normalized + Math.PI * 1.5) % (Math.PI * 2);
        const winIdx = Math.floor(pointerAngle / sliceAngle) % options.length;
        const winner = options[winIdx];

        showResult(winner);
      }
    }

    requestAnimationFrame(frame);
  }

  function showResult(winner) {
    if (!resultEl || !resultText) return;
    resultEl.style.display = 'block';
    resultText.textContent = winner;
    resultEl.style.animation = 'none';
    void resultEl.offsetWidth; // reflow
    resultEl.style.animation = '';
    window.AetheriaApp?.showToast?.(`命运选择了：${winner}`);
  }

  function init() {
    canvas     = document.getElementById('wheelCanvas');
    spinBtn    = document.getElementById('spinBtn');
    resultEl   = document.getElementById('wheelResult');
    resultText = document.getElementById('wheelResultText');

    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Responsive canvas size
    function resizeCanvas() {
      const size = Math.min(window.innerWidth - 48, 320);
      canvas.width  = size;
      canvas.height = size;
      drawWheel();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    loadOptions();
    renderOptionTags();
    drawWheel();

    // Add option via input
    const input    = document.getElementById('optionInput');
    const addBtn   = document.getElementById('addOptionBtn');

    function addOption() {
      const val = input?.value.trim();
      if (!val) return;
      if (options.length >= 8) { window.AetheriaApp?.showToast?.('最多 8 个选项'); return; }
      if (options.includes(val)) { window.AetheriaApp?.showToast?.('选项已存在'); return; }
      options.push(val);
      saveOptions();
      renderOptionTags();
      drawWheel();
      if (input) input.value = '';
    }

    if (input) {
      input.addEventListener('keydown', e => { if (e.key === 'Enter') addOption(); });
    }
    if (addBtn) addBtn.addEventListener('click', addOption);
    if (spinBtn) spinBtn.addEventListener('click', spin);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return { init };
})();
/* == END: wheel-init == */
