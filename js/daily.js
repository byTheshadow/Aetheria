/* == BLOCK: daily-module == */
/*
 * daily.js — 日常中心
 * 当前实现：心情记录（月历热力图 + 多条/天 + 详情抽屉）
 * localStorage key: aetheria_daily_mood
 */

/* == BLOCK: mood-constants == */
var MOOD_COLOR_MAP = {
  '😄': 'var(--mood-happy)',
  '🥰': 'var(--mood-bliss)',
  '😊': 'var(--mood-calm)',
  '😐': 'var(--mood-meh)',
  '😴': 'var(--mood-tired)',
  '😤': 'var(--mood-annoyed)',
  '😔': 'var(--mood-down)',
  '😢': 'var(--mood-sad)',
};
/* == END: mood-constants == */

/* == BLOCK: mood-state == */
var moodSelectedEmoji = null;
var moodCalYear       = new Date().getFullYear();
var moodCalMonth      = new Date().getMonth();
/* == END: mood-state == */

/* == BLOCK: mood-storage == */
function moodLoadAll() {
  var raw = localStorage.getItem('aetheria_daily_mood');
  return raw ? JSON.parse(raw) : {};
}

function moodSaveAll(data) {
  localStorage.setItem('aetheria_daily_mood', JSON.stringify(data));
}

function moodGetDateKey(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function moodGetTodayKey() {
  return moodGetDateKey(new Date());
}
/* == END: mood-storage == */

/* == BLOCK: mood-input == */
function moodInitInput() {
  var btns = $$('.mood-emoji-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', function() {
      moodSelectedEmoji = this.dataset.emoji;
      for (var j = 0; j < btns.length; j++) {
        btns[j].classList.remove('mood-emoji-btn--active');
      }
      this.classList.add('mood-emoji-btn--active');
    });
  }

  moodUpdateTimeHint();
  // 每分钟刷新时间提示
  setInterval(moodUpdateTimeHint, 60000);

  var saveBtn = $('#moodSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', moodHandleSave);
  }
}

function moodUpdateTimeHint() {
  var hint = $('#moodTimeHint');
  if (!hint) return;
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  hint.textContent = h + ':' + m;
}

function moodHandleSave() {
  if (!moodSelectedEmoji) {
    showToast('mood_select_first');
    return;
  }

  var noteEl = $('#moodNoteInput');
  var note   = noteEl ? noteEl.value.trim() : '';
  var now    = new Date();
  var dateKey = moodGetTodayKey();

  var entry = {
    id:    now.getTime(),
    emoji: moodSelectedEmoji,
    note:  note,
    time:  String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
  };

  var data = moodLoadAll();
  if (!data[dateKey]) data[dateKey] = [];
  data[dateKey].push(entry);
  moodSaveAll(data);

  // 重置输入状态
  moodSelectedEmoji = null;
  var btns = $$('.mood-emoji-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('mood-emoji-btn--active');
  }
  if (noteEl) noteEl.value = '';

  showToast('mood_saved');
  moodRenderCalendar();
}
/* == END: mood-input == */

/* == BLOCK: mood-calendar == */
function moodInitCalendar() {
  var prevBtn = $('#moodCalPrev');
  var nextBtn = $('#moodCalNext');

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      moodCalMonth--;
      if (moodCalMonth < 0) { moodCalMonth = 11; moodCalYear--; }
      moodRenderCalendar();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      moodCalMonth++;
      if (moodCalMonth > 11) { moodCalMonth = 0; moodCalYear++; }
      moodRenderCalendar();
    });
  }

  moodRenderCalendar();
}

function moodRenderCalendar() {
  var titleEl   = $('#moodCalTitle');
  var weekdayEl = $('#moodCalWeekdays');
  var gridEl    = $('#moodCalGrid');
  if (!titleEl || !gridEl) return;

  var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';

  // 月份标题
  var monthNames = lang === 'zh'
    ? ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  titleEl.textContent = lang === 'zh'
    ? moodCalYear + '年' + monthNames[moodCalMonth]
    : monthNames[moodCalMonth] + ' ' + moodCalYear;

  // 星期头
  var weekdays = lang === 'zh'
    ? ['日','一','二','三','四','五','六']
    : ['Su','Mo','Tu','We','Th','Fr','Sa'];
  weekdayEl.innerHTML = '';
  for (var w = 0; w < 7; w++) {
    var wd = document.createElement('span');
    wd.className = 'mood-cal-weekday';
    wd.textContent = weekdays[w];
    weekdayEl.appendChild(wd);
  }

  // 日期数据
  var firstDay    = new Date(moodCalYear, moodCalMonth, 1).getDay();
  var daysInMonth = new Date(moodCalYear, moodCalMonth + 1, 0).getDate();
  var todayKey    = moodGetTodayKey();
  var data        = moodLoadAll();

  gridEl.innerHTML = '';

  // 空白占位格
  for (var blank = 0; blank < firstDay; blank++) {
    var emptyCell = document.createElement('div');
    emptyCell.className = 'mood-cal-cell mood-cal-cell--empty';
    gridEl.appendChild(emptyCell);
  }

  // 日期格
  for (var day = 1; day <= daysInMonth; day++) {
    var dateKey = moodCalYear + '-'
      + String(moodCalMonth + 1).padStart(2, '0') + '-'
      + String(day).padStart(2, '0');

    var cell = document.createElement('div');
    cell.className = 'mood-cal-cell';
    cell.dataset.date = dateKey;

    var dayEntries = data[dateKey] || [];

    if (dateKey === todayKey) cell.classList.add('mood-cal-cell--today');

    if (dayEntries.length > 0) {
      cell.classList.add('mood-cal-cell--has-mood');
      var lastEmoji = dayEntries[dayEntries.length - 1].emoji;
      cell.style.setProperty('--cell-mood-color', MOOD_COLOR_MAP[lastEmoji] || 'var(--mood-meh)');
      cell.innerHTML = '<span class="mood-cal-emoji">' + lastEmoji + '</span>'
                     + '<span class="mood-cal-day">' + day + '</span>';
      if (dayEntries.length > 1) {
        var badge = document.createElement('span');
        badge.className = 'mood-cal-badge';
        badge.textContent = dayEntries.length;
        cell.appendChild(badge);
      }
    } else {
      cell.innerHTML = '<span class="mood-cal-day">' + day + '</span>';
    }

    cell.addEventListener('click', function() {
      moodShowDetail(this.dataset.date);
    });

    gridEl.appendChild(cell);
  }
}
/* == END: mood-calendar == */

/* == BLOCK: mood-detail == */
function moodShowDetail(dateKey) {
  var card   = $('#moodDetailCard');
  var dateEl = $('#moodDetailDate');
  var listEl = $('#moodDetailList');
  if (!card || !listEl) return;

  var data    = moodLoadAll();
  var entries = data[dateKey] || [];
  var lang    = (typeof currentLang !== 'undefined') ? currentLang : 'zh';

  // 日期标题
  var parts = dateKey.split('-');
  var dateTitle = lang === 'zh'
    ? parts[0] + '年' + parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日'
    : parts[1] + '/' + parts[2] + '/' + parts[0];
  if (dateEl) dateEl.textContent = dateTitle;

  listEl.innerHTML = '';

  if (entries.length === 0) {
    var empty = document.createElement('p');
    empty.className = 'mood-detail-empty';
    empty.textContent = lang === 'zh' ? '这天还没有记录' : 'No entries for this day';
    listEl.appendChild(empty);
  } else {
    for (var i = 0; i < entries.length; i++) {
      listEl.appendChild(moodBuildEntryEl(entries[i], dateKey, i));
    }
  }

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function moodBuildEntryEl(entry, dateKey, index) {
  var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';

  var item = document.createElement('div');
  item.className = 'mood-detail-item';

  // 左侧：emoji + 标签 + 时间
  var left = document.createElement('div');
  left.className = 'mood-detail-left';

  var emojiSpan = document.createElement('span');
  emojiSpan.className = 'mood-detail-emoji';
  emojiSpan.textContent = entry.emoji;

  var info = document.createElement('div');
  info.className = 'mood-detail-info';

  var labelAttr = lang === 'zh' ? 'data-label-zh' : 'data-label-en';
  var labelEl   = document.querySelector('.mood-emoji-btn[data-emoji="' + entry.emoji + '"]');
  var label     = labelEl ? labelEl.getAttribute(labelAttr) : entry.emoji;

  var labelSpan = document.createElement('span');
  labelSpan.className = 'mood-detail-label';
  labelSpan.textContent = label;

  var timeSpan = document.createElement('span');
  timeSpan.className = 'mood-detail-time';
  timeSpan.textContent = entry.time;

  info.appendChild(labelSpan);
  info.appendChild(timeSpan);
  left.appendChild(emojiSpan);
  left.appendChild(info);
  item.appendChild(left);

  // 备注
  if (entry.note) {
    var noteP = document.createElement('p');
    noteP.className = 'mood-detail-note';
    noteP.textContent = entry.note;
    item.appendChild(noteP);
  }

  // 删除按钮
  var delBtn = document.createElement('button');
  delBtn.className = 'btn btn--ghost btn--sm mood-detail-del';
  delBtn.textContent = '✕';
  delBtn.dataset.date  = dateKey;
  delBtn.dataset.index = index;
  delBtn.addEventListener('click', function() {
    moodDeleteEntry(this.dataset.date, parseInt(this.dataset.index));
  });
  item.appendChild(delBtn);

  return item;
}

function moodDeleteEntry(dateKey, index) {
  var data = moodLoadAll();
  if (!data[dateKey]) return;
  data[dateKey].splice(index, 1);
  if (data[dateKey].length === 0) delete data[dateKey];
  moodSaveAll(data);
  showToast('mood_deleted');
  moodRenderCalendar();
  moodShowDetail(dateKey);
}
/* == END: mood-detail == */

/* == BLOCK: daily-tabs == */
function dailyInitTabs() {
  var tabs = $$('.daily-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function() {
      var target = this.dataset.tab;

      for (var j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove('daily-tab--active');
      }
      this.classList.add('daily-tab--active');

      var panels = $$('.daily-panel');
      for (var k = 0; k < panels.length; k++) {
        panels[k].style.display = 'none';
      }
      var panel = $('#daily-panel-' + target);
      if (panel) panel.style.display = 'block';
    });
  }
}
/* == END: daily-tabs == */

/* == BLOCK: daily-init == */
function initDaily() {
  dailyInitTabs();
  moodInitInput();
  moodInitCalendar();
  todoInit(); // 新增
  habitInit();

  var closeBtn = $('#moodDetailClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      var card = $('#moodDetailCard');
      if (card) card.style.display = 'none';
    });
  }
}
/* == END: daily-init == */
/* == BLOCK: todo-storage == */
function todoLoadAll() {
  var raw = localStorage.getItem('aetheria_daily_todo');
  return raw ? JSON.parse(raw) : [];
}

function todoSaveAll(list) {
  localStorage.setItem('aetheria_daily_todo', JSON.stringify(list));
}
/* == END: todo-storage == */

/* == BLOCK: todo-render == */
function todoRender() {
  var listEl   = $('#todoList');
  var emptyEl  = $('#todoEmpty');
  if (!listEl) return;

  var list = todoLoadAll();
  var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';

  // 清空现有条目（保留 empty 提示）
  var items = listEl.querySelectorAll('.todo-item');
  for (var i = 0; i < items.length; i++) {
    items[i].remove();
  }

  // 未完成在前，已完成在后
  var pending  = [];
  var done     = [];
  for (var j = 0; j < list.length; j++) {
    if (list[j].done) { done.push(list[j]); }
    else              { pending.push(list[j]); }
  }
  var sorted = pending.concat(done);

  if (sorted.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    todoUpdateProgress(0, 0);
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  for (var k = 0; k < sorted.length; k++) {
    listEl.appendChild(todoBuiltItemEl(sorted[k], lang));
  }

  todoUpdateProgress(done.length, list.length);
}

function todoBuiltItemEl(task, lang) {
  var item = document.createElement('div');
  item.className = 'todo-item' + (task.done ? ' todo-item--done' : '');
  item.dataset.id = task.id;

  // 勾选框
  var checkbox = document.createElement('button');
  checkbox.className = 'todo-checkbox' + (task.done ? ' todo-checkbox--checked' : '');
  checkbox.setAttribute('aria-label', task.done ? 'Mark incomplete' : 'Mark complete');
  checkbox.innerHTML = task.done ? '✓' : '';
  checkbox.addEventListener('click', function() {
    todoToggle(parseInt(this.closest('.todo-item').dataset.id));
  });

  // 文字
  var text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = task.text;

  // 时间
  var meta = document.createElement('span');
  meta.className = 'todo-meta';
  var d = new Date(task.createdAt);
  var dateStr = (d.getMonth() + 1) + '/' + d.getDate();
  meta.textContent = task.done
    ? (lang === 'zh' ? '已完成' : 'Done')
    : dateStr;

  // 删除按钮
  var delBtn = document.createElement('button');
  delBtn.className = 'btn btn--ghost btn--sm todo-del';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', function() {
    todoDelete(parseInt(this.closest('.todo-item').dataset.id));
  });

  item.appendChild(checkbox);
  item.appendChild(text);
  item.appendChild(meta);
  item.appendChild(delBtn);

  return item;
}

function todoUpdateProgress(doneCount, total) {
  var labelEl = $('#todoProgressLabel');
  var pctEl   = $('#todoProgressPct');
  var fillEl  = $('#todoProgressFill');
  if (!labelEl) return;

  var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
  var pct  = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  labelEl.textContent = lang === 'zh'
    ? doneCount + ' / ' + total + ' 已完成'
    : doneCount + ' / ' + total + ' done';
  if (pctEl)  pctEl.textContent  = pct + '%';
  if (fillEl) fillEl.style.width = pct + '%';
}
/* == END: todo-render == */

/* == BLOCK: todo-actions == */
function todoAdd(text) {
  text = text.trim();
  if (!text) {
    showToast('todo_input_empty');
    return;
  }
  var list = todoLoadAll();
  var task = {
    id:        Date.now(),
    text:      text,
    done:      false,
    createdAt: Date.now(),
    doneAt:    null
  };
  list.unshift(task); // 新任务插到最前
  todoSaveAll(list);
  showToast('todo_added');
  todoRender();
}

function todoToggle(id) {
  var list = todoLoadAll();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].done   = !list[i].done;
      list[i].doneAt = list[i].done ? Date.now() : null;
      break;
    }
  }
  todoSaveAll(list);
  todoRender();
}

function todoDelete(id) {
  var list = todoLoadAll();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].classList && list[i].classList.add('todo-item--removing');
      list.splice(i, 1);
      break;
    }
  }
  todoSaveAll(list);
  showToast('todo_deleted');
  todoRender();
}

function todoClearDone() {
  var list    = todoLoadAll();
  var pending = [];
  for (var i = 0; i < list.length; i++) {
    if (!list[i].done) pending.push(list[i]);
  }
  todoSaveAll(pending);
  showToast('todo_cleared');
  todoRender();
}
/* == END: todo-actions == */

/* == BLOCK: todo-init == */
function todoInit() {
  var input    = $('#todoInput');
  var addBtn   = $('#todoAddBtn');
  var clearBtn = $('#todoClearDoneBtn');

  if (addBtn) {
    addBtn.addEventListener('click', function() {
      var input = $('#todoInput');
      if (input) {
        todoAdd(input.value);
        input.value = '';
      }
    });
  }

  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        todoAdd(this.value);
        this.value = '';
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', todoClearDone);
  }

  todoRender();
}
/* == END: todo-init == */
/* == BLOCK: habit-storage == */
function habitLoadHabits() {
  var raw = localStorage.getItem('aetheria_daily_habits');
  return raw ? JSON.parse(raw) : [];
}

function habitSaveHabits(list) {
  localStorage.setItem('aetheria_daily_habits', JSON.stringify(list));
}

function habitLoadLogs() {
  var raw = localStorage.getItem('aetheria_daily_habit_logs');
  return raw ? JSON.parse(raw) : {};
}

function habitSaveLogs(logs) {
  localStorage.setItem('aetheria_daily_habit_logs', JSON.stringify(logs));
}

// logs 结构: { "habitId_YYYY-MM-DD": true }
function habitLogKey(habitId, dateKey) {
  return habitId + '_' + dateKey;
}

function habitIsChecked(habitId, dateKey) {
  var logs = habitLoadLogs();
  return !!logs[habitLogKey(habitId, dateKey)];
}

function habitGetTodayKey() {
  var now = new Date();
  var y = now.getFullYear();
  var m = String(now.getMonth() + 1).padStart(2, '0');
  var d = String(now.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function habitGetDateKey(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}
/* == END: habit-storage == */

/* == BLOCK: habit-streak == */
function habitCalcStreak(habitId) {
  var logs    = habitLoadLogs();
  var streak  = 0;
  var cursor  = new Date();

  // 从昨天开始往前数
  cursor.setDate(cursor.getDate() - 1);

  for (var i = 0; i < 365; i++) {
    var key = habitLogKey(habitId, habitGetDateKey(cursor));
    if (logs[key]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function habitCalcTotal(habitId) {
  var logs  = habitLoadLogs();
  var total = 0;
  var prefix = habitId + '_';
  for (var key in logs) {
    if (logs.hasOwnProperty(key) && key.indexOf(prefix) === 0) {
      total++;
    }
  }
  return total;
}
/* == END: habit-streak == */

/* == BLOCK: habit-render == */
function habitRenderToday() {
  var listEl  = $('#habitTodayList');
  var emptyEl = $('#habitEmpty');
  var dateEl  = $('#habitTodayDate');
  if (!listEl) return;

  var habits  = habitLoadHabits();
  var todayKey = habitGetTodayKey();
  var lang    = (typeof currentLang !== 'undefined') ? currentLang : 'zh';

  // 今日日期显示
  if (dateEl) {
    var now = new Date();
    dateEl.textContent = lang === 'zh'
      ? (now.getMonth() + 1) + '月' + now.getDate() + '日'
      : (now.getMonth() + 1) + '/' + now.getDate();
  }

  // 清空旧条目
  var oldItems = listEl.querySelectorAll('.habit-today-item');
  for (var i = 0; i < oldItems.length; i++) oldItems[i].remove();

  if (habits.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  for (var j = 0; j < habits.length; j++) {
    listEl.appendChild(habitBuildTodayItem(habits[j], todayKey));
  }
}

function habitBuildTodayItem(habit, todayKey) {
  var checked = habitIsChecked(habit.id, todayKey);
  var streak  = habitCalcStreak(habit.id);

  var item = document.createElement('div');
  item.className = 'habit-today-item' + (checked ? ' habit-today-item--checked' : '');
  item.dataset.id = habit.id;

  // 左侧：emoji + 名称 + streak
  var left = document.createElement('div');
  left.className = 'habit-today-left';

  var emojiSpan = document.createElement('span');
  emojiSpan.className = 'habit-today-emoji';
  emojiSpan.textContent = habit.emoji;

  var info = document.createElement('div');
  info.className = 'habit-today-info';

  var nameSpan = document.createElement('span');
  nameSpan.className = 'habit-today-name';
  nameSpan.textContent = habit.name;

  var streakSpan = document.createElement('span');
  streakSpan.className = 'habit-today-streak';
  var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
  streakSpan.textContent = lang === 'zh'
    ? '🔥 ' + streak + ' 天连续'
    : '🔥 ' + streak + ' day streak';

  info.appendChild(nameSpan);
  info.appendChild(streakSpan);
  left.appendChild(emojiSpan);
  left.appendChild(info);

  // 右侧：打卡按钮 + 详情按钮
  var right = document.createElement('div');
  right.className = 'habit-today-right';

  var checkBtn = document.createElement('button');
  checkBtn.className = 'habit-check-btn' + (checked ? ' habit-check-btn--checked' : '');
  checkBtn.setAttribute('aria-label', checked ? 'Uncheck' : 'Check in');
  checkBtn.innerHTML = checked ? '✓' : '';
  checkBtn.dataset.id = habit.id;
  checkBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    habitToggleCheck(parseInt(this.dataset.id));
  });

  var detailBtn = document.createElement('button');
  detailBtn.className = 'btn btn--ghost btn--sm';
  detailBtn.textContent = '···';
  detailBtn.dataset.id = habit.id;
  detailBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    habitShowDetail(parseInt(this.dataset.id));
  });

  right.appendChild(checkBtn);
  right.appendChild(detailBtn);

  item.appendChild(left);
  item.appendChild(right);

  return item;
}

function habitRenderHeatmap(habitId) {
  var heatmap = $('#habitHeatmap');
  if (!heatmap) return;

  var logs = habitLoadLogs();
  heatmap.innerHTML = '';

  // 最近30天，从今天往前
  var today = new Date();
  for (var i = 29; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var dateKey = habitGetDateKey(d);
    var key     = habitLogKey(habitId, dateKey);
    var checked = !!logs[key];

    var dot = document.createElement('div');
    dot.className = 'habit-heatmap-dot' + (checked ? ' habit-heatmap-dot--on' : '');
    dot.title = dateKey;

    // 今天加边框
    if (i === 0) dot.classList.add('habit-heatmap-dot--today');

    heatmap.appendChild(dot);
  }
}
/* == END: habit-render == */

/* == BLOCK: habit-actions == */
function habitToggleCheck(habitId) {
  var todayKey = habitGetTodayKey();
  var logs     = habitLoadLogs();
  var key      = habitLogKey(habitId, todayKey);

  if (logs[key]) {
    delete logs[key];
    showToast('habit_unchecked');
  } else {
    logs[key] = true;
    showToast('habit_checked');
  }

  habitSaveLogs(logs);
  habitRenderToday();

  // 如果详情面板正在显示这个习惯，刷新热力图和数据
  var detailCard = $('#habitDetailCard');
  if (detailCard && detailCard.style.display !== 'none' &&
      detailCard.dataset.habitId == habitId) {
    habitRefreshDetail(habitId);
  }
}

function habitAdd() {
  var nameInput  = $('#habitNameInput');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    showToast('habit_name_empty');
    return;
  }

  var habits = habitLoadHabits();
  var habit  = {
    id:        Date.now(),
    name:      name,
    emoji:     habitCurrentEmoji,
    createdAt: Date.now()
  };
  habits.push(habit);
  habitSaveHabits(habits);

  // 重置输入
  if (nameInput) nameInput.value = '';
  habitCurrentEmoji = '🌱';
  var emojiBtn = $('#habitEmojiBtn');
  if (emojiBtn) emojiBtn.textContent = '🌱';
  var panel = $('#habitEmojiPanel');
  if (panel) panel.style.display = 'none';

  showToast('habit_added');
  habitRenderToday();
}

function habitDelete(habitId) {
  var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
  var msg  = lang === 'zh'
    ? '确定删除这个习惯吗？历史记录也会清除。'
    : 'Delete this habit? All history will be lost.';

  if (!confirm(msg)) return;

  // 删除习惯
  var habits = habitLoadHabits();
  for (var i = 0; i < habits.length; i++) {
    if (habits[i].id === habitId) { habits.splice(i, 1); break; }
  }
  habitSaveHabits(habits);

  // 清除该习惯的所有打卡记录
  var logs   = habitLoadLogs();
  var prefix = habitId + '_';
  for (var key in logs) {
    if (logs.hasOwnProperty(key) && key.indexOf(prefix) === 0) {
      delete logs[key];
    }
  }
  habitSaveLogs(logs);

  showToast('habit_deleted');

  // 关闭详情面板
  var detailCard = $('#habitDetailCard');
  if (detailCard) detailCard.style.display = 'none';

  habitRenderToday();
}
/* == END: habit-actions == */

/* == BLOCK: habit-detail == */
function habitShowDetail(habitId) {
  var habits = habitLoadHabits();
  var habit  = null;
  for (var i = 0; i < habits.length; i++) {
    if (habits[i].id === habitId) { habit = habits[i]; break; }
  }
  if (!habit) return;

  var detailCard = $('#habitDetailCard');
  if (!detailCard) return;

  detailCard.dataset.habitId = habitId;
  detailCard.style.display   = 'block';

  var nameEl = $('#habitDetailName');
  if (nameEl) nameEl.textContent = habit.emoji + ' ' + habit.name;

  habitRefreshDetail(habitId);
  detailCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // 绑定删除按钮
  var delBtn = $('#habitDeleteBtn');
  if (delBtn) {
    // 移除旧监听，防止重复绑定
    var newDelBtn = delBtn.cloneNode(true);
    delBtn.parentNode.replaceChild(newDelBtn, delBtn);
    newDelBtn.addEventListener('click', function() {
      habitDelete(habitId);
    });
  }
}

function habitRefreshDetail(habitId) {
  var streakEl = $('#habitStreakNum');
  var totalEl  = $('#habitTotalNum');
  if (streakEl) streakEl.textContent = habitCalcStreak(habitId);
  if (totalEl)  totalEl.textContent  = habitCalcTotal(habitId);
  habitRenderHeatmap(habitId);
}
/* == END: habit-detail == */

/* == BLOCK: habit-emoji-picker == */
var habitCurrentEmoji = '🌱';

function habitInitEmojiPicker() {
  var emojiBtn   = $('#habitEmojiBtn');
  var emojiPanel = $('#habitEmojiPanel');
  if (!emojiBtn || !emojiPanel) return;

  emojiBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = emojiPanel.style.display !== 'none';
    emojiPanel.style.display = isOpen ? 'none' : 'flex';
  });

  var opts = $$('.habit-emoji-opt');
  for (var i = 0; i < opts.length; i++) {
    opts[i].addEventListener('click', function() {
      habitCurrentEmoji    = this.dataset.emoji;
      emojiBtn.textContent = this.dataset.emoji;
      emojiPanel.style.display = 'none';
    });
  }

  // 点击外部关闭
  document.addEventListener('click', function() {
    if (emojiPanel) emojiPanel.style.display = 'none';
  });
}
/* == END: habit-emoji-picker == */

/* == BLOCK: habit-init == */
function habitInit() {
  habitInitEmojiPicker();

  var addBtn = $('#habitAddBtn');
  if (addBtn) {
    addBtn.addEventListener('click', habitAdd);
  }

  var nameInput = $('#habitNameInput');
  if (nameInput) {
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') habitAdd();
    });
  }

  var closeBtn = $('#habitDetailClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      var card = $('#habitDetailCard');
      if (card) card.style.display = 'none';
    });
  }

  habitRenderToday();
}
/* == END: habit-init == */

/* == END: daily-module == */

