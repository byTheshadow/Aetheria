/* == BLOCK: init == */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────
  const state = {
    currentPage: 'home',
    theme: localStorage.getItem('aetheria_theme') || 'moon',
    repulled: false,
  };

  // ── DOM refs ───────────────────────────────────────────────────────────
  const body          = document.body;
  const navBtns       = document.querySelectorAll('.nav-btn');
  const sections      = document.querySelectorAll('.page-section');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const bgImageOverlay = document.getElementById('bgImageOverlay');
  const meshCanvas    = document.getElementById('meshCanvas');

  /* == END: init == */

  /* == BLOCK: routing == */
  function navigateTo(page) {
    if (state.currentPage === page) return;
    state.currentPage = page;

    sections.forEach(s => s.classList.remove('active'));
    navBtns.forEach(b => b.classList.remove('active'));

    const target = document.getElementById('section-' + page);
    if (target) target.classList.add('active');

    const activeNav = document.querySelector(`.nav-btn[data-page="${page}"]`);
    if (activeNav) activeNav.classList.add('active');

    // page-specific init hooks
    if (page === 'daily')      initDailyPage();
    if (page === 'wheel')      initWheelPage();
    if (page === 'divination') initDivinationPage();
  }

  navBtns.forEach(btn => {
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

    // sync settings swatches
    document.querySelectorAll('.theme-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.theme === theme);
    });
    // sync theme panel buttons
    document.querySelectorAll('.theme-panel-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
  }

  // Theme toggle button → cycle through themes
  let themePanel = null;

  function buildThemePanel() {
    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.id = 'themePanel';

    const labels = { moon: '🌙 Moon', sakura: '🌸 Sakura', forest: '🌿 Forest', void: '⬛ Void' };
    THEMES.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'theme-panel-btn';
      btn.dataset.theme = t;
      btn.textContent = labels[t];
      if (t === state.theme) btn.classList.add('active');
      btn.addEventListener('click', () => {
        applyTheme(t);
        closeThemePanel();
      });
      panel.appendChild(btn);
    });

    document.body.appendChild(panel);
    return panel;
  }

  function openThemePanel() {
    if (!themePanel) themePanel = buildThemePanel();
    themePanel.classList.add('open');
  }

  function closeThemePanel() {
    if (themePanel) themePanel.classList.remove('open');
  }

  themeToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!themePanel) themePanel = buildThemePanel();
    themePanel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (themePanel && themePanel.classList.contains('open')) {
      if (!themePanel.contains(e.target) && e.target !== themeToggleBtn) {
        closeThemePanel();
      }
    }
  });

  // Settings page theme swatches
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.addEventListener('click', () => applyTheme(s.dataset.theme));
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
    bgImageOverlay.style.backgroundImage = `url(${src})`;
    bgImageOverlay.classList.add('active');
  }

  function loadSavedBackground() {
    const saved = localStorage.getItem('aetheria_bg');
    if (saved) applyBackground(saved);
  }

  // URL input
  const bgUrlInput  = document.getElementById('bgUrlInput');
  const setBgUrlBtn = document.getElementById('setBgUrlBtn');
  const bgFileInput = document.getElementById('bgFileInput');
  const clearBgBtn  = document.getElementById('clearBgBtn');

  setBgUrlBtn.addEventListener('click', () => {
    const url = bgUrlInput.value.trim();
    if (!url) return;
    localStorage.setItem('aetheria_bg', url);
    applyBackground(url);
    showToast('背景已更新');
  });

  bgFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      localStorage.setItem('aetheria_bg', base64);
      applyBackground(base64);
      showToast('背景已更新');
    };
    reader.readAsDataURL(file);
  });

  clearBgBtn.addEventListener('click', () => {
    localStorage.removeItem('aetheria_bg');
    applyBackground(null);
    bgUrlInput.value = '';
    showToast('背景已清除');
  });

  loadSavedBackground();
  /* == END: background == */

  /* == BLOCK: mesh-gradient == */
  (function initMesh() {
    const canvas = meshCanvas;
    const ctx    = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Read CSS vars for mesh colors
    function getMeshColors() {
      const style = getComputedStyle(document.body);
      return [
        style.getPropertyValue('--mesh-a').trim() || '#1a0a3a',
        style.getPropertyValue('--mesh-b').trim() || '#0a0a2a',
        style.getPropertyValue('--mesh-c').trim() || '#2a0a4a',
        style.getPropertyValue('--mesh-d').trim() || '#0d0d1a',
      ];
    }

    // Blobs
    const blobs = Array.from({ length: 5 }, (_, i) => ({
      x:    Math.random() * window.innerWidth,
      y:    Math.random() * window.innerHeight,
      r:    180 + Math.random() * 220,
      vx:   (Math.random() - 0.5) * 0.4,
      vy:   (Math.random() - 0.5) * 0.4,
      ci:   i % 4,
    }));

    let frame = 0;

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      const colors = getMeshColors();

      // Base fill
      ctx.fillStyle = colors[1];
      ctx.fillRect(0, 0, w, h);

      // Draw blobs
      blobs.forEach(b => {
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, hexToRgba(colors[b.ci], 0.55));
        grad.addColorStop(1, hexToRgba(colors[b.ci], 0));
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Move blobs
      blobs.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r)       b.x = canvas.width  + b.r;
        if (b.x > canvas.width  + b.r) b.x = -b.r;
        if (b.y < -b.r)       b.y = canvas.height + b.r;
        if (b.y > canvas.height + b.r) b.y = -b.r;
      });

      frame++;
      requestAnimationFrame(draw);
    }

    draw();

    // Re-read colors on theme change (observe data-theme attr)
    const observer = new MutationObserver(() => {
      // colors are re-read each frame via getMeshColors(), nothing extra needed
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  })();

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  /* == END: mesh-gradient == */

  /* == BLOCK: greeting == */
  function updateGreeting() {
    const hour = new Date().getHours();
    const timeEl = document.getElementById('greetingTime');
    const textEl = document.getElementById('greetingText');

    let period, messages;
    if (hour >= 5 && hour < 12) {
      period = '早上好';
      messages = ['新的一天，轻轻开始', '今天也要好好的', '早安，世界属于你'];
    } else if (hour >= 12 && hour < 18) {
      period = '下午好';
      messages = ['今天过得怎么样？', '记得喝水休息', '你已经很棒了'];
    } else if (hour >= 18 && hour < 22) {
      period = '晚上好';
      messages = ['今天，你还好吗？', '辛苦了，好好休息', '今天有什么想说的吗？'];
    } else {
      period = '夜深了';
      messages = ['还没睡呀', '注意休息，明天见', '深夜的你，还好吗？'];
    }

    if (timeEl) timeEl.textContent = period;
    if (textEl) textEl.textContent = messages[Math.floor(Math.random() * messages.length)];
  }

  updateGreeting();
  /* == END: greeting == */

  /* == BLOCK: home-mood-slider == */
  function initMoodSlider(sliderId, displayId) {
    const slider  = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (!slider) return;

    function update() {
      const val = slider.value;
      if (display) display.textContent = val;
      // Update CSS fill
      slider.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(val - 1) / 9 * 100}%, rgba(255,255,255,0.1) ${(val - 1) / 9 * 100}%, rgba(255,255,255,0.1) 100%)`;
    }

    slider.addEventListener('input', update);
    update();
  }

  initMoodSlider('quickMoodSlider', 'moodScoreDisplay');
  initMoodSlider('dailyMoodSlider', null);

  const saveMoodBtn = document.getElementById('saveMoodBtn');
  if (saveMoodBtn) {
    saveMoodBtn.addEventListener('click', () => {
      const val = document.getElementById('quickMoodSlider').value;
      saveMoodEntry({ score: parseInt(val), tags: [], note: '', silent: false });
      showToast('心情已记录 ✨');
    });
  }
  /* == END: home-mood-slider == */

  /* == BLOCK: daily-card-home == */
  function initDailyCard() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('aetheria_daily_card') || '{}');

    if (saved.date === today && saved.card) {
      renderDailyCard(saved.card);
      state.repulled = saved.repulled || false;
    } else {
      // Will be populated once tarot.js loads
      window.addEventListener('aetheria:tarot-ready', () => {
        const card = window.AetheriaTarot?.drawOne?.();
        if (card) {
          localStorage.setItem('aetheria_daily_card', JSON.stringify({
            date: today, card, repulled: false
          }));
          renderDailyCard(card);
        }
      });
    }
  }

  function renderDailyCard(card) {
    const emojiEl = document.getElementById('dailyCardEmoji');
    const nameEl  = document.getElementById('dailyCardName');
    if (emojiEl) emojiEl.textContent = card.emoji || '🃏';
    if (nameEl)  nameEl.textContent  = card.name  || '未知';
  }

  const repullBtn = document.getElementById('repullBtn');
  if (repullBtn) {
    repullBtn.addEventListener('click', () => {
      if (state.repulled) { showToast('今天只能重抽一次哦'); return; }
      const card = window.AetheriaTarot?.drawOne?.();
      if (!card) return;
      state.repulled = true;
      const today = new Date().toDateString();
      localStorage.setItem('aetheria_daily_card', JSON.stringify({
        date: today, card, repulled: true
      }));
      renderDailyCard(card);
      repullBtn.textContent = '已重抽';
      repullBtn.disabled = true;
      showToast('新的牌面 ✨');
    });
  }

  initDailyCard();
  /* == END: daily-card-home == */

  /* == BLOCK: mood-data == */
  function saveMoodEntry(entry) {
    const today = new Date().toISOString().slice(0, 10);
    const all   = JSON.parse(localStorage.getItem('aetheria_mood') || '{}');
    all[today]  = { ...all[today], ...entry, date: today };
    localStorage.setItem('aetheria_mood', JSON.stringify(all));
  }

  function getMoodHistory(days = 7) {
    const all    = JSON.parse(localStorage.getItem('aetheria_mood') || '{}');
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d   = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, score: all[key]?.score ?? null });
    }
    return result;
  }
  /* == END: mood-data == */

  /* == BLOCK: daily-page-init == */
  function initDailyPage() {
    // Date display
    const dateEl = document.getElementById('dailyDateDisplay');
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      });
    }

    // Mood slider
    initMoodSlider('dailyMoodSlider', null);

    // Load today's mood
    const today = new Date().toISOString().slice(0, 10);
    const all   = JSON.parse(localStorage.getItem('aetheria_mood') || '{}');
    const todayMood = all[today];
    if (todayMood) {
      const slider = document.getElementById('dailyMoodSlider');
      if (slider && todayMood.score) {
        slider.value = todayMood.score;
        slider.dispatchEvent(new Event('input'));
      }
      if (todayMood.tags) {
        document.querySelectorAll('.tag-btn').forEach(t => {
          t.classList.toggle('active', todayMood.tags.includes(t.dataset.tag));
        });
      }
      const noteEl = document.getElementById('moodNote');
      if (noteEl && todayMood.note) noteEl.value = todayMood.note;
    }

    // Mood tags
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', () => btn.classList.toggle('active'));
    });

    // Silent day
    const silentBtn = document.getElementById('silentDayBtn');
    if (silentBtn) {
      silentBtn.addEventListener('click', () => {
        const slider = document.getElementById('dailyMoodSlider');
        saveMoodEntry({ score: parseInt(slider?.value || 5), tags: [], note: '', silent: true });
        showToast('静默日已记录');
      });
    }

    // Save mood
    const saveDailyMoodBtn = document.getElementById('saveDailyMoodBtn');
    if (saveDailyMoodBtn) {
      saveDailyMoodBtn.addEventListener('click', () => {
        const score = parseInt(document.getElementById('dailyMoodSlider')?.value || 5);
        const tags  = [...document.querySelectorAll('.tag-btn.active')].map(t => t.dataset.tag);
        const note  = document.getElementById('moodNote')?.value || '';
        saveMoodEntry({ score, tags, note, silent: false });
        showToast('心情已保存 💫');
      });
    }

    // Mood chart
    drawMoodChart();

    // Tasks
    renderTasks();

    // Habits
    renderHabits();
  }
  /* == END: daily-page-init == */

  /* == BLOCK: mood-chart == */
  function drawMoodChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const data   = getMoodHistory(7);
    const w      = canvas.offsetWidth || 300;
    const h      = 80;
    canvas.width  = w;
    canvas.height = h;

    const accent = getComputedStyle(body).getPropertyValue('--accent').trim();
    const muted  = getComputedStyle(body).getPropertyValue('--text-muted').trim();

    ctx.clearRect(0, 0, w, h);

    const pad   = 16;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const step   = innerW / (data.length - 1);

    // Points
    const points = data.map((d, i) => ({
      x: pad + i * step,
      y: d.score !== null ? pad + innerH - ((d.score - 1) / 9) * innerH : null,
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, hexToRgba(accent, 0.3));
    grad.addColorStop(1, hexToRgba(accent, 0));

    // Draw fill path
    ctx.beginPath();
    let started = false;
    points.forEach((p, i) => {
      if (p.y === null) return;
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    });
    if (started) {
      const lastValid = [...points].reverse().find(p => p.y !== null);
      const firstValid = points.find(p => p.y !== null);
      if (lastValid && firstValid) {
        ctx.lineTo(lastValid.x, h - pad);
        ctx.lineTo(firstValid.x, h - pad);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    // Draw line
    ctx.beginPath();
    started = false;
    points.forEach(p => {
      if (p.y === null) { started = false; return; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = accent;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Draw dots
    points.forEach((p, i) => {
      if (p.y === null) {
        // Empty day dot
        ctx.beginPath();
        ctx.arc(p.x, h / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = muted;
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.shadowColor = accent;
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });

    // Day labels
    ctx.fillStyle  = muted;
    ctx.font       = '10px Inter, sans-serif';
    ctx.textAlign  = 'center';
    const days = ['日','一','二','三','四','五','六'];
    data.forEach((d, i) => {
      const dow = new Date(d.date).getDay();
      ctx.fillText(days[dow], points[i].x, h - 2);
    });
  }
  /* == END: mood-chart == */

  /* == BLOCK: tasks == */
  function getTasks() {
    return JSON.parse(localStorage.getItem('aetheria_tasks') || '[]');
  }

  function saveTasks(tasks) {
    localStorage.setItem('aetheria_tasks', JSON.stringify(tasks));
  }

  function renderTasks() {
    const list  = document.getElementById('taskList');
    if (!list) return;
    const tasks = getTasks();
    list.innerHTML = '';

    if (tasks.length === 0) {
      list.innerHTML = `<li class="empty-state"><span class="empty-state-icon">✅</span><span class="empty-state-text">暂无任务</span></li>`;
      return;
    }

    tasks.forEach((task, idx) => {
      const li = document.createElement('li');
      li.className = `task-item${task.done ? ' done' : ''}`;
      li.innerHTML = `
        <div class="task-check${task.done ? ' done' : ''}" data-idx="${idx}"></div>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <span class="task-priority priority-${task.priority}"></span>
        <button class="task-delete" data-idx="${idx}" aria-label="删除任务">×</button>
      `;
      list.appendChild(li);
    });

    list.querySelectorAll('.task-check').forEach(el => {
      el.addEventListener('click', () => {
        const tasks = getTasks();
        const idx   = parseInt(el.dataset.idx);
        tasks[idx].done = !tasks[idx].done;
        saveTasks(tasks);
        renderTasks();
      });
    });

    list.querySelectorAll('.task-delete').forEach(el => {
      el.addEventListener('click', () => {
        const tasks = getTasks();
        tasks.splice(parseInt(el.dataset.idx), 1);
        saveTasks(tasks);
        renderTasks();
      });
    });
  }

  const addTaskBtn    = document.getElementById('addTaskBtn');
  const taskInputRow  = document.getElementById('taskInputRow');
  const taskInput     = document.getElementById('taskInput');
  const taskPriority  = document.getElementById('taskPriority');
  const confirmTaskBtn = document.getElementById('confirmTaskBtn');

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      const visible = taskInputRow.style.display !== 'none';
      taskInputRow.style.display = visible ? 'none' : 'flex';
      if (!visible) taskInput.focus();
    });
  }

  function addTask() {
    const text = taskInput?.value.trim();
    if (!text) return;
    const tasks = getTasks();
    tasks.push({ text, priority: taskPriority?.value || 'mid', done: false, created: Date.now() });
    saveTasks(tasks);
    taskInput.value = '';
    taskInputRow.style.display = 'none';
    renderTasks();
    showToast('任务已添加');
  }

  if (confirmTaskBtn) confirmTaskBtn.addEventListener('click', addTask);
  if (taskInput) {
    taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  }
  /* == END: tasks == */

  /* == BLOCK: habits == */
  function getHabits() {
    return JSON.parse(localStorage.getItem('aetheria_habits') || '[]');
  }

  function saveHabits(habits) {
    localStorage.setItem('aetheria_habits', JSON.stringify(habits));
  }

  function renderHabits() {
    const container = document.getElementById('habitsList');
    if (!container) return;
    const habits = getHabits();
    const today  = new Date().toISOString().slice(0, 10);
    container.innerHTML = '';

    if (habits.length === 0) {
      container.innerHTML = `<div class="empty-state"><span class="empty-state-icon">🌱</span><span class="empty-state-text">添加你的第一个习惯</span></div>`;
      return;
    }

    habits.forEach((habit, idx) => {
      const checkedToday = habit.checks?.includes(today);
      const streak       = calcStreak(habit.checks || []);
      const div = document.createElement('div');
      div.className = `habit-item${checkedToday ? ' checked' : ''}`;
      div.innerHTML = `
        <div class="habit-check">${checkedToday ? '✓' : ''}</div>
        <span class="habit-name">${escapeHtml(habit.name)}</span>
        <span class="habit-streak${streak > 0 ? ' active' : ''}">🔥 ${streak}天</span>
        <button class="task-delete" data-idx="${idx}" aria-label="删除习惯">×</button>
      `;
            div.querySelector('.habit-check').addEventListener('click', (e) => {
        e.stopPropagation();
        const habits = getHabits();
        const today  = new Date().toISOString().slice(0, 10);
        if (!habits[idx].checks) habits[idx].checks = [];
        const ci = habits[idx].checks.indexOf(today);
        if (ci === -1) habits[idx].checks.push(today);
        else habits[idx].checks.splice(ci, 1);
        saveHabits(habits);
        renderHabits();
      });

      div.querySelector('.task-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        const habits = getHabits();
        habits.splice(idx, 1);
        saveHabits(habits);
        renderHabits();
      });

      container.appendChild(div);
    });
  }

  function calcStreak(checks) {
    if (!checks || checks.length === 0) return 0;
    const sorted = [...checks].sort().reverse();
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const key = cursor.toISOString().slice(0, 10);
      if (sorted.includes(key)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  const addHabitBtn = document.getElementById('addHabitBtn');
  if (addHabitBtn) {
    addHabitBtn.addEventListener('click', () => {
      const name = prompt('新习惯名称：');
      if (!name || !name.trim()) return;
      const habits = getHabits();
      habits.push({ name: name.trim(), checks: [], created: Date.now() });
      saveHabits(habits);
      renderHabits();
    });
  }
  /* == END: habits == */

  /* == BLOCK: divination-page-init == */
  function initDivinationPage() {
    // Tab switching
    const tabBtns    = document.querySelectorAll('.tab-btn');
    const tabTarot   = document.getElementById('tabTarot');
    const tabLenorm  = document.getElementById('tabLenormand');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.tab === 'tarot') {
          tabTarot.classList.remove('hidden');
          tabLenorm.classList.add('hidden');
        } else {
          tabTarot.classList.add('hidden');
          tabLenorm.classList.remove('hidden');
        }
      });
    });

    // Spread selector
    const spreadBtns = document.querySelectorAll('.spread-btn');
    spreadBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        spreadBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Draw button — delegates to tarot.js
    const drawBtn = document.getElementById('drawCardsBtn');
    if (drawBtn) {
      drawBtn.addEventListener('click', () => {
        const spread = document.querySelector('.spread-btn.active')?.dataset.spread || '1';
        window.AetheriaTarot?.drawSpread?.(spread);
      });
    }

    // Lenormand draw
    const drawLenBtn = document.getElementById('drawLenormandBtn');
    if (drawLenBtn) {
      drawLenBtn.addEventListener('click', () => {
        window.AetheriaTarot?.drawLenormand?.();
      });
    }
  }
  /* == END: divination-page-init == */

  /* == BLOCK: wheel-page-init == */
  function initWheelPage() {
    // Delegates to wheel.js — just ensure options are loaded
    window.AetheriaWheel?.init?.();
  }
  /* == END: wheel-page-init == */

  /* == BLOCK: settings-ai == */
  const saveAiBtn = document.getElementById('saveAiBtn');
  if (saveAiBtn) {
    saveAiBtn.addEventListener('click', () => {
      const baseUrl = document.getElementById('aiBaseUrl')?.value.trim();
      const apiKey  = document.getElementById('aiApiKey')?.value.trim();
      const model   = document.getElementById('aiModel')?.value.trim();
      if (baseUrl) localStorage.setItem('aetheria_ai_baseurl', baseUrl);
      if (apiKey)  localStorage.setItem('aetheria_ai_key', apiKey);
      if (model)   localStorage.setItem('aetheria_ai_model', model);
      showToast('AI 配置已保存 🤖');
      // Notify other modules
      window.dispatchEvent(new Event('aetheria:ai-config-updated'));
    });
  }

  // Pre-fill saved AI config (show placeholder, not actual key)
  function loadAiConfig() {
    const baseUrl = localStorage.getItem('aetheria_ai_baseurl');
    const model   = localStorage.getItem('aetheria_ai_model');
    const baseUrlEl = document.getElementById('aiBaseUrl');
    const modelEl   = document.getElementById('aiModel');
    if (baseUrl && baseUrlEl) baseUrlEl.value = baseUrl;
    if (model   && modelEl)   modelEl.value   = model;
    // API key: show placeholder only, never echo value
    const keyEl = document.getElementById('aiApiKey');
    if (keyEl && localStorage.getItem('aetheria_ai_key')) {
      keyEl.placeholder = '已保存（重新输入以更新）';
    }
  }
  loadAiConfig();
  /* == END: settings-ai == */

  /* == BLOCK: settings-data == */
  const exportDataBtn = document.getElementById('exportDataBtn');
  const clearDataBtn  = document.getElementById('clearDataBtn');

  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      const keys = [
        'aetheria_mood', 'aetheria_tasks', 'aetheria_habits',
        'aetheria_daily_card', 'aetheria_wheel_options',
        'aetheria_theme', 'aetheria_ai_baseurl', 'aetheria_ai_model'
        // intentionally exclude aetheria_ai_key and aetheria_bg (may be large base64)
      ];
      const data = {};
      keys.forEach(k => {
        const v = localStorage.getItem(k);
        if (v) data[k] = JSON.parse(v.startsWith('{') || v.startsWith('[') ? v : JSON.stringify(v));
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `aetheria-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('数据已导出');
    });
  }

  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      const confirmed = confirm('确定要清除所有数据吗？此操作不可撤销。');
      if (!confirmed) return;
      const keysToKeep = ['aetheria_theme'];
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith('aetheria_'));
      allKeys.forEach(k => { if (!keysToKeep.includes(k)) localStorage.removeItem(k); });
      showToast('数据已清除');
      setTimeout(() => location.reload(), 800);
    });
  }
  /* == END: settings-data == */

  /* == BLOCK: toast == */
  let toastTimer = null;

  function showToast(msg) {
    let toast = document.getElementById('aetheriaToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.id = 'aetheriaToast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  window.AetheriaApp = { showToast, saveMoodEntry, getMoodHistory, navigateTo };
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

})();
