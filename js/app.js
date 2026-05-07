/* ============================================================
   APP: 路由 + 主题切换 + 时钟 + 初始化
============================================================ */

/* --- 每日一言数据（后续可移入 affirmations.json） --- */
const QUOTES = [
  "在混沌中寻找你自己的星轨。",
  "你不需要每天都闪耀，存在本身就已足够。",
  "有些夜晚是用来沉默的，不是用来解释的。",
  "波动不是失控，那只是你在感受生命的质地。",
  "今天可以很小，小到只是呼吸。",
  "你的情绪没有对错，它们只是信使。",
  "黑暗不是终点，它只是光还没到的地方。",
  "不必把每一个碎片都拼回原样，新的形状也可以很美。",
  "慢下来不是落后，是在给自己留余地。",
  "你已经比你以为的走得更远了。",
];

/* ============================================================
   路由：页面切换
============================================================ */
function navigateTo(pageId) {
  /* 隐藏所有页面 */
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  /* 显示目标页面 */
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');

  /* 更新导航高亮 */
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  /* 存储当前页 */
  localStorage.setItem('aetheria_current_page', pageId);
}

/* ============================================================
   主题切换
============================================================ */
function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('aetheria_theme', themeName);

  /* 更新主题点高亮 */
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.theme === themeName);
  });
}

/* ============================================================
   时钟：实时更新
============================================================ */
function updateClock() {
  const now = new Date();

  /* 时间 */
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s}`;
  }

  /* 日期 */
  const dateEl = document.getElementById('date');
  if (dateEl) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateStr = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日　${weekdays[now.getDay()]}`;
    dateEl.textContent = dateStr;
  }
}

/* ============================================================
   问候语：根据时段
============================================================ */
function updateGreeting() {
  const hour = new Date().getHours();
  const greetingEl = document.getElementById('home-greeting');
  if (!greetingEl) return;

  let text = '';
  if (hour >= 5  && hour < 9)  text = '清晨好，新的一天从这里开始。';
  else if (hour >= 9  && hour < 12) text = '上午好，愿今天轻盈一些。';
  else if (hour >= 12 && hour < 14) text = '午间好，记得喘口气。';
  else if (hour >= 14 && hour < 18) text = '下午好，慢慢来不着急。';
  else if (hour >= 18 && hour < 22) text = '晚上好，今天辛苦了。';
  else text = '深夜了，好好照顾自己。';

  greetingEl.textContent = text;
}

/* ============================================================
   每日一言：按日期固定，同一天不变
============================================================ */
function updateDailyQuote() {
  const quoteEl = document.getElementById('daily-quote');
  if (!quoteEl) return;

  /* 用日期做种子，同一天显示同一句 */
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % QUOTES.length;
  quoteEl.textContent = QUOTES[index];
}

/* ============================================================
   情绪预览：从 localStorage 读取今日情绪
============================================================ */
function updateMoodPreview() {
  const previewEl = document.getElementById('mood-preview');
  if (!previewEl) return;

  const today = new Date().toISOString().split('T')[0];
  const moodData = JSON.parse(localStorage.getItem('aetheria_mood') || '{}');
  const todayMood = moodData[today];

  if (todayMood) {
    const scoreEmoji = todayMood.score >= 7 ? '✨' : todayMood.score >= 4 ? '🌤' : '🌧';
    previewEl.innerHTML = `
      <div class="mood-preview-score">
        <span class="mood-emoji">${scoreEmoji}</span>
        <span class="mood-score-text">${todayMood.score} / 10</span>
      </div>
      ${todayMood.tags?.length
        ? `<div class="mood-tags-preview">${todayMood.tags.map(t => `<span class="mood-tag-chip">${t}</span>`).join('')}</div>`
        : ''}
    `;
  } else {
    previewEl.innerHTML = `<span class="mood-empty">今天还没有记录</span>`;
  }
}

/* ============================================================
   事件绑定
============================================================ */
function bindEvents() {
  /* 侧边栏导航点击 */
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  /* 主页快捷按钮点击 */
  document.querySelectorAll('.shortcut-btn, .btn-ghost[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  /* 主题切换点击 */
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.addEventListener('click', () => setTheme(dot.dataset.theme));
  });
}

/* ============================================================
   初始化
============================================================ */
function init() {
  /* 恢复主题 */
  const savedTheme = localStorage.getItem('aetheria_theme') || 'moon';
  setTheme(savedTheme);

  /* 恢复上次页面 */
  const savedPage = localStorage.getItem('aetheria_current_page') || 'home';
  navigateTo(savedPage);

  /* 启动时钟 */
  updateClock();
  setInterval(updateClock, 1000);

  /* 问候语 + 每日一言 + 情绪预览 */
  updateGreeting();
  updateDailyQuote();
  updateMoodPreview();
}

/* DOM 加载完成后启动 */
document.addEventListener('DOMContentLoaded', init);
/* END APP */
