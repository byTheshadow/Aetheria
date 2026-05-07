/* == BLOCK: init == */
(function () {
  'use strict';

  const state = {
    currentPage: 'home',
    theme: localStorage.getItem('aetheria_theme') || 'moon',
    repulled: false,
  };

  const body           = document.body;
  const navItems       = document.querySelectorAll('.nav-item[data-page]');
  const sections       = document.querySelectorAll('.page-section');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themePanel     = document.getElementById('themePanel');
  const bgImageOverlay = document.getElementById('bgImageOverlay');
  /* == END: init == */

  /* == BLOCK: routing == */
  function navigateTo(page) {
    if (state.currentPage === page) return;
    state.currentPage = page;

    sections.forEach(s => s.classList.remove('active'));
    navItems.forEach(b => b.classList.remove('active'));

    const target    = document.getElementById('section-' + page);
    const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (target)    target.classList.add('active');
    if (activeNav) activeNav.classList.add('active');

    if (page === 'daily')      initDailyPage();
    if (page === 'divination') initDivinationPage();
  }

  navItems.forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });
  /* == END: routing == */

  /* == BLOCK: theme == */
  const THEMES = ['moon', 'sakura', 'forest', 'void'];

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'moon';
    state.theme = theme;
    body.setAttribute('data-theme', theme);
    localStorage.setItem('aetheria_theme', theme);

    document.querySelectorAll('[data-theme-btn], .theme-swatch, .theme-panel-item').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
  }

  // Header theme button → toggle panel
  themeToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    themePanel?.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (themePanel?.classList.contains('open')) {
      if (!themePanel.contains(e.target) && e.target !== themeToggleBtn) {
        themePanel.classList.remove('open');
      }
    }
  });

  // Theme panel items
  document.querySelectorAll('.theme-panel-item').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      themePanel?.classList.remove('open');
    });
  });

  // Settings swatches
  document.querySelectorAll('.theme-swatch').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  applyTheme(state.theme);
  /* == END: theme == */

  /* == BLOCK: background == */
  function applyBackground(src) {
    if (!src) {
      bgImageOverlay.style.backgroundImage = '';
      bgImageOverlay.classList.remove('active');
      return;
    }
    bgImageOverlay.style.backgroundImage = `url(${CSS.escape ? src : src})`;
    bgImageOverlay.classList.add('active');
  }

  const bgUrlInput  = document.getElementById('bgUrlInput');
  const setBgUrlBtn = document.getElementById('setBgUrlBtn');
  const bgFileInput = document.getElementById('bgFileInput');
  const clearBgBtn  = document.getElementById('clearBgBtn');

  setBgUrlBtn?.addEventListener('click', () => {
    const url = bgUrlInput?.value.trim();
    if (!url) return;
    localStorage.setItem('aetheria_bg', url);
    applyBackground(url);
    showToast('背景已更新');
  });

  bgFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      localStorage.setItem('aetheria_bg', b64);
      applyBackground(b64);
      showToast('背景已更新');
    };
    reader.readAsDataURL(file);
  });

  clearBgBtn?.addEventListener('click', () => {
    localStorage.removeItem('aetheria_bg');
    applyBackground(null);
    if (bgUrlInput) bgUrlInput.value = '';
    showToast('背景已清除');
  });

  const savedBg = localStorage.getItem('aetheria_bg');
  if (savedBg) applyBackground(savedBg);
  /* == END: background == */

  /* == BLOCK: greeting == */
  function updateGreeting() {
    const h    = new Date().getHours();
    const timeEl = document.getElementById('greetingTime');
    const textEl = document.getElementById('greetingText');

    const map = [
      { range: [5,  12], label: 'GOOD MORNING',   msgs: ['新的一天，轻轻开始', '早安，今天也要好好的', '清晨的你，最温柔'] },
      { range: [12, 18], label: 'GOOD AFTERNOON',  msgs: ['今天过得怎么样？', '记得喝水休息', '你已经很棒了'] },
      { range: [18, 22], label: 'GOOD EVENING',    msgs: ['今天，你还好吗？', '辛苦了，好好休息', '今天有什么想说的吗？'] },
      { range: [22, 29], label: 'LATE NIGHT',      msgs: ['还没睡呀', '注意休息，明天见', '深夜的你，还好吗？'] },
    ];

    const slot = map.find(m => h >= m.range[0] && h < m.range[1]) || map[3];
    if (timeEl) timeEl.textContent = slot.label;
    if (textEl) textEl.textContent = slot.msgs[Math.floor(Math.random() * slot.msgs.length)];
  }

  updateGreeting();
  /* == END: greeting == */

  /* == BLOCK: mood-slider == */
  function bindMoodSlider(sliderId, displayId) {
    const slider  = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (!slider) return;

    function update() {
      const pct = ((slider.value - 1) / 9) * 100;
      slider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
      if (display) display.textContent = slider.value;
    }

    slider.addEventListener('input', update);
    update();
  }

  bindMoodSlider('quickMoodSlider', 'moodScoreDisplay');

  document.getElementById('saveMoodBtn')?.addEventListener('click', () => {
    const val = document.getElementById('quickMoodSlider')?.value;
    saveMoodEntry({ score: parseInt(val), tags: [], note: '', silent: false });
    showToast('心情已记录');
  });
  /* == END: mood-slider == */

  /* == BLOCK: daily-card == */
  function initDailyCard() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('aetheria_daily_card') || '{}');

    if (saved.date === today && saved.card) {
      renderDailyCard(saved.card);
      if (saved.repulled) {
        state.repulled = true;
        const btn = document.getElementById('repullBtn');
        if (btn) { btn.textContent = '已重抽'; btn.disabled = true; }
      }
    } else {
      window.addEventListener('aetheria:tarot-ready', () => {
        const card = window.AetheriaTarot?.drawOne?.();
        if (card) {
          localStorage.setItem('aetheria_daily_card', JSON.stringify({ date: today, card, repulled: false }));
          renderDailyCard(card);
        }
      }, { once: true });
    }
  }

  function renderDailyCard(card) {
    const emojiEl    = document.getElementById('dailyCardEmoji');
    const nameEl     = document.getElementById('dailyCardName');
    const keywordsEl = document.getElementById('dailyCardKeywords');
    if (emojiEl)    emojiEl.textContent    = card.emoji || '✦';
    if (nameEl)     nameEl.textContent     = card.name  || '—';
    if (keywordsEl) keywordsEl.textContent = card.keywords?.join(' · ') || '—';
  }

  document.getElementById('repullBtn')?.addEventListener('click', () => {
    if (state.repulled) { showToast('今天只能重抽一次'); return; }
    const card = window.AetheriaTarot?.drawOne?.();
    if (!card) return;
    state.repulled = true;
    const today = new Date().toDateString();
    localStorage.setItem('aetheria_daily_card', JSON.stringify({ date: today, card, repulled: true }));
    renderDailyCard(card);
    const btn = document.getElementById('repullBtn');
    if (btn) { btn.textContent = '已重抽'; btn.disabled = true; }
    showToast('新的牌面');
  });

  initDailyCard();
  /* == END: daily-card == */

  /* == BLOCK: mood-data == */
  function saveMoodEntry(entry) {
    const today = new Date().toISOString().slice(0, 10);
    const all   = JSON.parse(localStorage.getItem('aetheria_mood') || '{}');
    all[today]  = { ...all[today], ...entry, date: today };
    localStorage.setItem('aetheria_mood', JSON.stringify(all));
  }

  function getMoodHistory(days = 7) {
    const all = JSON.parse(localStorage.getItem('aetheria_mood') || '{}');
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: key, score: all[key]?.score ?? null, dow: d.getDay() };
    });
  }
  /* == END: mood-data == */

  /* == BLOCK: daily-page == */
  function initDailyPage() {
    const dateEl = document.getElementById('dailyDateDisplay');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('zh-CN', {
        month: 'long', day: 'numeric', weekday: 'long'
      });
    }

    bindMoodSlider('dailyMoodSlider', null);

    // Load today's saved mood
    const today     = new Date().toISOString().slice(0, 10);
    const allMoods  = JSON.parse(localStorage.getItem('aetheria_mood') || '{}');
    const todayMood = allMoods[today];
    if (todayMood) {
      const slider = document.getElementById('dailyMoodSlider');
      if (slider && todayMood.score) {
        slider.value = todayMood.score;
        slider.dispatchEvent(new Event('input'));
      }
      document.querySelectorAll('#moodTags .tag-btn').forEach(t => {
        t.classList.toggle('active', (todayMood.tags || []).includes(t.dataset.tag));
      });
      const noteEl = document.getElementById('moodNote');
      if (noteEl && todayMood.note) noteEl.value = todayMood.note;
    }

    document.querySelectorAll('#moodTags .tag-btn').forEach(btn => {
      // Remove old listeners by cloning
      const fresh = btn.cloneNode(true);
      btn.parentNode.replaceChild(fresh, btn);
      fresh.addEventListener('click', () => fresh.classList.toggle('active'));
    });

    document.getElementById('silentDayBtn')?.addEventListener('click', () => {
      const score = parseInt(document.getElementById('dailyMoodSlider')?.value || 5);
      saveMoodEntry({ score, tags: [], note: '', silent: true });
      showToast('静默日已记录');
    });

    document.getElementById('saveDailyMoodBtn')?.addEventListener('click', () => {
      const score = parseInt(document.getElementById('dailyMoodSlider')?.value || 5);
      const tags  = [...document.querySelectorAll('#moodTags .tag-btn.active')].map(t => t.dataset.tag);
      const note  = document.getElementById('moodNote')?.value || '';
      saveMoodEntry({ score, tags, note, silent: false });
      showToast('心情已保存');
    });

    drawMoodChart();
    renderTasks();
    renderHabits();
  }
  /* == END: daily-page == */

  /* == BLOCK: mood-chart == */
  function drawMoodChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const data = getMoodHistory(7);
    const w    = canvas.offsetWidth || 400;
    const h    = 72;
    canvas.width  = w;
    canvas.height = h;

    const accent = getComputedStyle(body).getPropertyValue('--accent').trim();
    const muted  = getComputedStyle(body).getPropertyValue('--text-muted').trim();

    ctx.clearRect(0, 0, w, h);

    const padX = 12, padY = 10;
    const iW   = w - padX * 2;
    const iH   = h - padY * 2 - 14; // 14px for labels
    const step = iW / (data.length - 1);

    const pts = data.map((d, i) => ({
      x: padX + i * step,
      y: d.score !== null ? padY + iH - ((d.score - 1) / 9) * iH : null,
    }));

    // Fill gradient
    const validPts = pts.filter(p => p.y !== null);
    if (validPts.length > 1) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, accent + '30');
      grad.addColorStop(1, accent + '00');

      ctx.beginPath();
      let started = false;
      pts.forEach(p => {
        if (p.y === null) return;
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      });
      const last  = [...pts].reverse().find(p => p.y !== null);
      const first = pts.find(p => p.y !== null);
      ctx.lineTo(last.x, h - padY - 14);
      ctx.lineTo(first.x, h - padY - 14);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      started = false;
      pts.forEach(p => {
        if (p.y === null) { started = false; return; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = accent;
      ctx.lineWidth   = 1.5;
      ctx.lineJoin    = 'round';
      ctx.lineCap     = 'round';
      ctx.stroke();
    }

    // Dots + labels
    const days = ['日','一','二','三','四','五','六'];
    ctx.font      = '9px Courier New, monospace';
    ctx.textAlign = 'center';

    pts.forEach((p, i) => {
      // Day label
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillText(days[data[i].dow], p.x, h - 2);

      if (p.y === null) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle   = accent;
      ctx.shadowColor = accent;
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });
  }
  /* == END: mood-chart == */

  /* == BLOCK: tasks == */
  function getTasks()       { return JSON.parse(localStorage.getItem('aetheria_tasks') || '[]'); }
  function saveTasks(tasks) { localStorage.setItem('aetheria_tasks', JSON.stringify(tasks)); }

  function renderTasks() {
    const list = document.getElementById('taskList');
    if (!list) return;
    const tasks = getTasks();
    list.innerHTML = '';

    if (!tasks.length) {
      list.innerHTML = `<li class="empty-state"><span class="empty-state-icon">✦</span><span class="empty-state-text">暂无任务</span></li>`;
      return;
    }

    tasks.forEach((task, idx) => {
      const li = document.createElement('li');
      li.className = `task-item${task.done ? ' done' : ''}`;
      li.innerHTML = `
        <div class="task-check${task.done ? ' done' : ''}" data-idx="${idx}" role="checkbox" aria-checked="${task.done}" tabindex="0"></div>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <span class="task-priority priority-${task.priority}"></span>
        <button class="task-delete" data-idx="${idx}" aria-label="删除">×</button>
      `;
      list.appendChild(li);
    });

    list.querySelectorAll('.task-check').forEach(el => {
      el.addEventListener('click', () => {
        const t = getTasks();
        t[+el.dataset.idx].done = !t[+el.dataset.idx].done;
        saveTasks(t); renderTasks();
      });
    });

    list.querySelectorAll('.task-delete').forEach(el => {
      el.addEventListener('click', () => {
        const t = getTasks();
        t.splice(+el.dataset.idx, 1);
        saveTasks(t); renderTasks();
      });
    });
  }

  document.getElementById('addTaskBtn')?.addEventListener('click', () => {
    const row = document.getElementById('taskInputRow');
    if (!row) return;
    const visible = row.style.display !== 'none';
    row.style.display = visible ? 'none' : 'flex';
    if (!visible) document.getElementById('taskInput')?.focus();
  });

  function addTask() {
    const input    = document.getElementById('taskInput');
    const priority = document.getElementById('taskPriority');
    const text     = input?.value.trim();
    if (!text) return;
    const tasks = getTasks();
    tasks.push({ text, priority: priority?.value || 'mid', done: false, created: Date.now() });
    saveTasks(tasks);
    if (input) input.value = '';
    document.getElementById('taskInputRow').style.display = 'none';
    renderTasks();
    showToast('任务已添加');
  }

  document.getElementById('confirmTaskBtn')?.addEventListener('click', addTask);
   document.getElementById('taskInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  /* == END: tasks == */

  /* == BLOCK: habits == */
  function getHabits()        { return JSON.parse(localStorage.getItem('aetheria_habits') || '[]'); }
  function saveHabits(habits) { localStorage.setItem('aetheria_habits', JSON.stringify(habits)); }

  function calcStreak(checks) {
    if (!checks?.length) return 0;
    const sorted = [...checks].sort().reverse();
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const key = cursor.toISOString().slice(0, 10);
      if (sorted.includes(key)) { streak++; cursor.setDate(cursor.getDate() - 1); }
      else break;
    }
    return streak;
  }

  function renderHabits() {
    const container = document.getElementById('habitsList');
    if (!container) return;
    const habits = getHabits();
    const today  = new Date().toISOString().slice(0, 10);
    container.innerHTML = '';

    if (!habits.length) {
      container.innerHTML = `<div class="empty-state"><span class="empty-state-icon">✦</span><span class="empty-state-text">添加你的第一个习惯</span></div>`;
      return;
    }

    habits.forEach((habit, idx) => {
      const checked = habit.checks?.includes(today);
      const streak  = calcStreak(habit.checks || []);
      const div     = document.createElement('div');
      div.className = `habit-item${checked ? ' checked' : ''}`;
      div.innerHTML = `
        <div class="habit-check" aria-label="${checked ? '已完成' : '未完成'}">${checked ? '✓' : ''}</div>
        <span class="habit-name">${escapeHtml(habit.name)}</span>
        <span class="habit-streak${streak > 0 ? ' active' : ''}">🔥 ${streak}d</span>
        <button class="task-delete" data-idx="${idx}" aria-label="删除习惯">×</button>
      `;

      div.querySelector('.habit-check').addEventListener('click', (e) => {
        e.stopPropagation();
        const h = getHabits();
        if (!h[idx].checks) h[idx].checks = [];
        const ci = h[idx].checks.indexOf(today);
        if (ci === -1) h[idx].checks.push(today);
        else h[idx].checks.splice(ci, 1);
        saveHabits(h);
        renderHabits();
      });

      div.querySelector('.task-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        const h = getHabits();
        h.splice(idx, 1);
        saveHabits(h);
        renderHabits();
      });

      container.appendChild(div);
    });
  }

  document.getElementById('addHabitBtn')?.addEventListener('click', () => {
    const name = prompt('新习惯名称：');
    if (!name?.trim()) return;
    const habits = getHabits();
    habits.push({ name: name.trim(), checks: [], created: Date.now() });
    saveHabits(habits);
    renderHabits();
    showToast('习惯已添加');
  });
  /* == END: habits == */

  /* == BLOCK: divination-page == */
  function initDivinationPage() {
    // Tab switching
    document.querySelectorAll('.seg-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.seg-btn[data-tab]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const isLenormand = btn.dataset.tab === 'lenormand';
        document.getElementById('tabTarot')?.classList.toggle('hidden', isLenormand);
        document.getElementById('tabLenormand')?.classList.toggle('hidden', !isLenormand);
      });
    });

    // Spread selector
    document.querySelectorAll('.seg-btn[data-spread]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.seg-btn[data-spread]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Draw tarot
    document.getElementById('drawCardsBtn')?.addEventListener('click', () => {
      const spread = document.querySelector('.seg-btn[data-spread].active')?.dataset.spread || '1';
      window.AetheriaTarot?.drawSpread?.(spread);
    });

    // Draw lenormand
    document.getElementById('drawLenormandBtn')?.addEventListener('click', () => {
      window.AetheriaTarot?.drawLenormand?.();
    });
  }
  /* == END: divination-page == */

    /* == BLOCK: settings == */
  document.getElementById('saveAiBtn')?.addEventListener('click', () => {
    const baseUrl = document.getElementById('aiBaseUrl')?.value.trim();
    const apiKey  = document.getElementById('aiApiKey')?.value.trim();
    const model   = document.getElementById('aiModel')?.value.trim();
    if (baseUrl) localStorage.setItem('aetheria_ai_baseurl', baseUrl);
    if (apiKey)  localStorage.setItem('aetheria_ai_key',     apiKey);
    if (model)   localStorage.setItem('aetheria_ai_model',   model);
    showToast('配置已保存');
    window.dispatchEvent(new Event('aetheria:ai-config-updated'));
  });

  // Pre-fill saved config
  (function loadAiConfig() {
    const baseUrl = localStorage.getItem('aetheria_ai_baseurl');
    const model   = localStorage.getItem('aetheria_ai_model');
    const baseUrlEl = document.getElementById('aiBaseUrl');
    const modelEl   = document.getElementById('aiModel');
    const keyEl     = document.getElementById('aiApiKey');
    if (baseUrl && baseUrlEl) baseUrlEl.value = baseUrl;
    if (model   && modelEl)   modelEl.value   = model;
    if (keyEl && localStorage.getItem('aetheria_ai_key')) {
      keyEl.placeholder = '已保存（重新输入以更新）';
    }
  })();

  document.getElementById('exportDataBtn')?.addEventListener('click', () => {
    const keys = [
      'aetheria_mood', 'aetheria_tasks', 'aetheria_habits',
      'aetheria_daily_card', 'aetheria_wheel_options',
      'aetheria_theme', 'aetheria_ai_baseurl', 'aetheria_ai_model',
    ];
    const data = {};
    keys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v) {
        try { data[k] = JSON.parse(v); }
        catch { data[k] = v; }
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: `aetheria-${new Date().toISOString().slice(0, 10)}.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
    showToast('数据已导出');
  });

  document.getElementById('clearDataBtn')?.addEventListener('click', () => {
    if (!confirm('确定清除所有数据？此操作不可撤销。')) return;
    Object.keys(localStorage)
      .filter(k => k.startsWith('aetheria_') && k !== 'aetheria_theme')
      .forEach(k => localStorage.removeItem(k));
    showToast('数据已清除');
    setTimeout(() => location.reload(), 900);
  });
  /* == END: settings == */

  /* == BLOCK: toast == */
  let toastTimer = null;

  function showToast(msg) {
    const toast = document.getElementById('aetheriaToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  /* == END: toast == */

  /* == BLOCK: utils == */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  /* == END: utils == */

  /* == BLOCK: expose == */
  window.AetheriaApp = {
    showToast,
    saveMoodEntry,
    getMoodHistory,
    navigateTo,
    drawMoodChart,
    escapeHtml,
  };
  /* == END: expose == */

})();

