/* == BLOCK: schedule == */
/*
 * schedule.js — 日程管理模块 v1.0
 * 入口: initSchedule()，由 daily.js 的 initDaily() 调用
 * 页面容器: #daily-panel-calendar
 * 视图: 月视图 → 点击日期格子 → 日视图（时间轴）
 * 数据: localStorage key = aetheria_schedule_events
 * 事件结构: { id, title, date, startTime, endTime, color, note }
 */

/* == BLOCK: schedule-constants == */
var SCHEDULE_KEY = 'aetheria_schedule_events';

// 6色标签：紫/粉/蓝/绿/橙/红
var SCHEDULE_COLORS = [
    { id: 'purple', hex: '#a78bfa' },
    { id: 'pink',   hex: '#f472b6' },
    { id: 'blue',   hex: '#60a5fa' },
    { id: 'green',  hex: '#34d399' },
    { id: 'orange', hex: '#fb923c' },
    { id: 'red',    hex: '#f87171' }
];
/* == END: schedule-constants == */

/* == BLOCK: schedule-state == */
var scheduleViewMonth = new Date();   // 当前月视图所在月份
scheduleViewMonth.setDate(1);

var scheduleDayViewDate = null;       // 当前日视图日期字符串 "YYYY-MM-DD"
var scheduleCurrentView = 'month';    // 'month' | 'day'
var scheduleEditingId = null;         // 正在编辑的事件 id，null = 新建
var scheduleSelectedColor = SCHEDULE_COLORS[0].id;
/* == END: schedule-state == */

/* == BLOCK: schedule-storage == */
function scheduleLoadAll() {
    var raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch(e) { return []; }
}

function scheduleSaveAll(list) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(list));
}
/* == END: schedule-storage == */

/* == BLOCK: schedule-utils == */
// 返回 "YYYY-MM-DD"
function scheduleDateKey(dateObj) {
    var y = dateObj.getFullYear();
    var m = String(dateObj.getMonth() + 1).padStart(2, '0');
    var d = String(dateObj.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

// 返回今天 "YYYY-MM-DD"
function scheduleTodayKey() {
    return scheduleDateKey(new Date());
}

// 从 "YYYY-MM-DD" 解析为 Date（本地时区，避免 UTC 偏移）
function scheduleParseDateKey(key) {
    var parts = key.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

// 生成唯一 id
function scheduleGenId() {
    return 'sch_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

// 获取某月所有事件（按日期分组）
function scheduleGetMonthEvents(year, month) {
    var all = scheduleLoadAll();
    var map = {};
    for (var i = 0; i < all.length; i++) {
        var ev = all[i];
        var parts = ev.date.split('-');
        if (parseInt(parts[0]) === year && parseInt(parts[1]) - 1 === month) {
            if (!map[ev.date]) map[ev.date] = [];
            map[ev.date].push(ev);
        }
    }
    return map;
}

// 获取某天所有事件，按开始时间排序
function scheduleGetDayEvents(dateKey) {
    var all = scheduleLoadAll();
    var list = [];
    for (var i = 0; i < all.length; i++) {
        if (all[i].date === dateKey) list.push(all[i]);
    }
    list.sort(function(a, b) {
        var ta = a.startTime || '00:00';
        var tb = b.startTime || '00:00';
        return ta < tb ? -1 : ta > tb ? 1 : 0;
    });
    return list;
}

// 根据 color id 取 hex
function scheduleColorHex(colorId) {
    for (var i = 0; i < SCHEDULE_COLORS.length; i++) {
        if (SCHEDULE_COLORS[i].id === colorId) return SCHEDULE_COLORS[i].hex;
    }
    return SCHEDULE_COLORS[0].hex;
}

// 格式化时间显示 "HH:MM"
function scheduleFormatTime(t) {
    if (!t) return '';
    return t;
}

// 格式化日期显示（根据当前语言）
function scheduleFormatDate(dateKey) {
    var parts = dateKey.split('-');
    var y = parts[0], m = parts[1], d = parts[2];
    if (typeof currentLang !== 'undefined' && currentLang === 'en') {
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months[parseInt(m) - 1] + ' ' + parseInt(d) + ', ' + y;
    }
    return y + ' 年 ' + parseInt(m) + ' 月 ' + parseInt(d) + ' 日';
}

// 星期几文字
function scheduleWeekdayLabel(dateKey) {
    var d = scheduleParseDateKey(dateKey);
    var zh = ['日','一','二','三','四','五','六'];
    var en = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    if (typeof currentLang !== 'undefined' && currentLang === 'en') {
        return en[d.getDay()];
    }
    return '周' + zh[d.getDay()];
}
/* == END: schedule-utils == */

/* == BLOCK: schedule-init == */
function initSchedule() {
    var container = $('#daily-panel-calendar');
    if (!container) return;

    // 注入 HTML 骨架
    container.innerHTML = scheduleGetHTML();

    // 绑定月视图导航
    $('#schCalPrev').addEventListener('click', function() {
        scheduleViewMonth.setMonth(scheduleViewMonth.getMonth() - 1);
        scheduleRenderMonth();
    });
    $('#schCalNext').addEventListener('click', function() {
        scheduleViewMonth.setMonth(scheduleViewMonth.getMonth() + 1);
        scheduleRenderMonth();
    });

    // 日视图返回按钮
    $('#schDayBack').addEventListener('click', function() {
        scheduleShowMonthView();
    });

    // 浮动添加按钮
    $('#schAddBtn').addEventListener('click', function() {
        scheduleOpenDrawer(null);
    });

    // 抽屉关闭
    $('#schDrawerClose').addEventListener('click', scheduleCloseDrawer);
    $('#schDrawerOverlay').addEventListener('click', scheduleCloseDrawer);

    // 抽屉保存
    $('#schDrawerSave').addEventListener('click', scheduleDrawerSave);

    // 抽屉删除
    $('#schDrawerDelete').addEventListener('click', scheduleDrawerDelete);

    // 颜色选择器
    scheduleInitColorPicker();

    // 初始渲染月视图
    scheduleRenderMonth();
}
/* == END: schedule-init == */

/* == BLOCK: schedule-html == */
function scheduleGetHTML() {
    return [
        '<!-- == BLOCK: schedule-inner == -->',

        /* ── 月视图 ── */
        '<div class="sch-view" id="schMonthView">',
        '  <div class="glass-card sch-month-card">',
        '    <div class="sch-cal-header">',
        '      <button class="btn btn--ghost btn--sm sch-cal-nav" id="schCalPrev">‹</button>',
        '      <span class="sch-cal-title" id="schCalTitle"></span>',
        '      <button class="btn btn--ghost btn--sm sch-cal-nav" id="schCalNext">›</button>',
        '    </div>',
        '    <div class="sch-cal-weekdays" id="schCalWeekdays"></div>',
        '    <div class="sch-cal-grid" id="schCalGrid"></div>',
        '  </div>',
        '</div>',

        /* ── 日视图 ── */
        '<div class="sch-view" id="schDayView" style="display:none;">',
        '  <div class="sch-day-header glass-card glass-card--flat">',
        '    <button class="btn btn--ghost btn--sm" id="schDayBack">‹ <span data-i18n="sch_back">返回</span></button>',
        '    <div class="sch-day-title-wrap">',
        '      <span class="sch-day-date" id="schDayDate"></span>',
        '      <span class="sch-day-weekday" id="schDayWeekday"></span>',
        '    </div>',
        '  </div>',
        '  <div class="sch-timeline-wrap glass-card" id="schTimeline"></div>',
        '</div>',

        /* ── 浮动添加按钮 ── */
        '<button class="sch-fab" id="schAddBtn" aria-label="Add event">',
        '  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5">',
        '    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
        '  </svg>',
        '</button>',

        /* ── 抽屉遮罩 ── */
        '<div class="sch-drawer-overlay" id="schDrawerOverlay"></div>',

        /* ── 底部抽屉表单 ── */
        '<div class="sch-drawer" id="schDrawer">',
        '  <div class="sch-drawer-handle"></div>',
        '  <div class="sch-drawer-header">',
        '    <span class="sch-drawer-title" id="schDrawerTitle" data-i18n="sch_add_event">添加日程</span>',
        '    <button class="btn btn--ghost btn--sm" id="schDrawerClose">✕</button>',
        '  </div>',
        '  <div class="sch-drawer-body">',
        '    <!-- 标题 -->',
        '    <input class="input sch-input" id="schInputTitle"',
        '      type="text" maxlength="50"',
        '      data-i18n-placeholder="sch_title_ph"',
        '      placeholder="日程标题…" />',
        '    <!-- 日期 -->',
        '    <div class="sch-form-row">',
        '      <label class="sch-form-label" data-i18n="sch_date">日期</label>',
        '      <input class="input sch-input sch-input--date" id="schInputDate" type="date" />',
        '    </div>',
        '    <!-- 时间 -->',
        '    <div class="sch-form-row sch-time-row">',
        '      <div class="sch-time-group">',
        '        <label class="sch-form-label" data-i18n="sch_start">开始</label>',
        '        <input class="input sch-input sch-input--time" id="schInputStart" type="time" />',
        '      </div>',
        '      <span class="sch-time-sep">—</span>',
        '      <div class="sch-time-group">',
        '        <label class="sch-form-label" data-i18n="sch_end">结束</label>',
        '        <input class="input sch-input sch-input--time" id="schInputEnd" type="time" />',
        '      </div>',
        '    </div>',
        '    <!-- 颜色 -->',
        '    <div class="sch-form-row">',
        '      <label class="sch-form-label" data-i18n="sch_color">颜色</label>',
        '      <div class="sch-color-picker" id="schColorPicker"></div>',
        '    </div>',
        '    <!-- 备注 -->',
        '    <textarea class="input sch-input sch-input--note" id="schInputNote"',
        '      rows="2"',
        '      data-i18n-placeholder="sch_note_ph"',
        '      placeholder="备注（可选）…"></textarea>',
        '    <!-- 操作按钮 -->',
        '    <div class="sch-drawer-actions">',
        '      <button class="btn btn--danger btn--sm sch-drawer-delete" id="schDrawerDelete" style="display:none;" data-i18n="sch_delete">删除</button>',
        '      <button class="btn btn--primary sch-drawer-save" id="schDrawerSave" data-i18n="sch_save">保存</button>',
        '    </div>',
        '  </div>',
        '</div>',

        '<!-- == END: schedule-inner == -->'
    ].join('\n');
}
/* == END: schedule-html == */

/* == BLOCK: schedule-color-picker == */
function scheduleInitColorPicker() {
    var picker = $('#schColorPicker');
    if (!picker) return;
    picker.innerHTML = '';
    for (var i = 0; i < SCHEDULE_COLORS.length; i++) {
        (function(color) {
            var btn = document.createElement('button');
            btn.className = 'sch-color-dot' + (color.id === scheduleSelectedColor ? ' sch-color-dot--active' : '');
            btn.style.background = color.hex;
            btn.setAttribute('data-color', color.id);
            btn.setAttribute('aria-label', color.id);
            btn.addEventListener('click', function() {
                scheduleSelectedColor = color.id;
                $$('.sch-color-dot').forEach(function(el) {
                    el.classList.remove('sch-color-dot--active');
                });
                btn.classList.add('sch-color-dot--active');
            });
            picker.appendChild(btn);
        })(SCHEDULE_COLORS[i]);
    }
}
/* == END: schedule-color-picker == */

/* == BLOCK: schedule-month-view == */
function scheduleShowMonthView() {
    scheduleCurrentView = 'month';
    $('#schMonthView').style.display = '';
    $('#schDayView').style.display = 'none';
    scheduleRenderMonth();
}

function scheduleRenderMonth() {
    var year  = scheduleViewMonth.getFullYear();
    var month = scheduleViewMonth.getMonth(); // 0-based

    // 标题
    var titleEl = $('#schCalTitle');
    if (titleEl) {
        if (typeof currentLang !== 'undefined' && currentLang === 'en') {
            var monthNames = ['January','February','March','April','May','June',
                              'July','August','September','October','November','December'];
            titleEl.textContent = monthNames[month] + ' ' + year;
        } else {
            titleEl.textContent = year + ' 年 ' + (month + 1) + ' 月';
        }
    }

    // 星期头
    var weekdaysEl = $('#schCalWeekdays');
    if (weekdaysEl) {
        var wdZh = ['日','一','二','三','四','五','六'];
        var wdEn = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var wdArr = (typeof currentLang !== 'undefined' && currentLang === 'en') ? wdEn : wdZh;
        weekdaysEl.innerHTML = '';
        for (var w = 0; w < 7; w++) {
            var wd = document.createElement('span');
            wd.className = 'sch-cal-wd';
            wd.textContent = wdArr[w];
            weekdaysEl.appendChild(wd);
        }
    }

    // 日期格子
    var gridEl = $('#schCalGrid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    var today = scheduleTodayKey();
    var monthEvents = scheduleGetMonthEvents(year, month);

    // 本月第一天是星期几
    var firstDay = new Date(year, month, 1).getDay();
    // 本月天数
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    // 空白占位
    for (var blank = 0; blank < firstDay; blank++) {
        var emptyCell = document.createElement('div');
        emptyCell.className = 'sch-cal-cell sch-cal-cell--empty';
        gridEl.appendChild(emptyCell);
    }

    // 日期格子
    for (var day = 1; day <= daysInMonth; day++) {
        var dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        var cell = document.createElement('div');
        cell.className = 'sch-cal-cell';
        if (dateKey === today) cell.classList.add('sch-cal-cell--today');

        var numEl = document.createElement('span');
        numEl.className = 'sch-cal-num';
        numEl.textContent = day;
        cell.appendChild(numEl);

        // 事件色点
        var eventsOnDay = monthEvents[dateKey];
        if (eventsOnDay && eventsOnDay.length > 0) {
            var dotsWrap = document.createElement('div');
            dotsWrap.className = 'sch-cal-dots';
            var maxDots = Math.min(eventsOnDay.length, 3);
            for (var di = 0; di < maxDots; di++) {
                var dot = document.createElement('span');
                dot.className = 'sch-cal-dot';
                dot.style.background = scheduleColorHex(eventsOnDay[di].color);
                dotsWrap.appendChild(dot);
            }
            if (eventsOnDay.length > 3) {
                var more = document.createElement('span');
                more.className = 'sch-cal-dot-more';
                more.textContent = '+' + (eventsOnDay.length - 3);
                dotsWrap.appendChild(more);
            }
            cell.appendChild(dotsWrap);
        }

        // 点击进入日视图
        (function(dk) {
            cell.addEventListener('click', function() {
                scheduleShowDayView(dk);
            });
        })(dateKey);

        gridEl.appendChild(cell);
    }
}
/* == END: schedule-month-view == */

/* == BLOCK: schedule-day-view == */
function scheduleShowDayView(dateKey) {
    scheduleCurrentView = 'day';
    scheduleDayViewDate = dateKey;

    $('#schMonthView').style.display = 'none';
    $('#schDayView').style.display = '';

    // 更新标题
    $('#schDayDate').textContent = scheduleFormatDate(dateKey);
    $('#schDayWeekday').textContent = scheduleWeekdayLabel(dateKey);

    scheduleRenderTimeline(dateKey);
}

function scheduleRenderTimeline(dateKey) {
    var timeline = $('#schTimeline');
    if (!timeline) return;

    var events = scheduleGetDayEvents(dateKey);

    if (events.length === 0) {
        timeline.innerHTML =
            '<p class="sch-day-empty" data-i18n="sch_day_empty">今天还没有日程 ✨</p>';
        // 手动应用 i18n（如果已初始化）
        if (typeof applyI18n === 'function') applyI18n(timeline);
        return;
    }

    timeline.innerHTML = '';

    for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        var item = document.createElement('div');
        item.className = 'sch-timeline-item';

        // 左侧色条
        var bar = document.createElement('div');
        bar.className = 'sch-timeline-bar';
        bar.style.background = scheduleColorHex(ev.color);
        item.appendChild(bar);

        // 内容区
        var content = document.createElement('div');
        content.className = 'sch-timeline-content';

        var titleEl = document.createElement('span');
        titleEl.className = 'sch-timeline-title';
        titleEl.textContent = ev.title;
        content.appendChild(titleEl);

        if (ev.startTime || ev.endTime) {
            var timeEl = document.createElement('span');
            timeEl.className = 'sch-timeline-time';
            var timeStr = '';
            if (ev.startTime) timeStr += scheduleFormatTime(ev.startTime);
            if (ev.startTime && ev.endTime) timeStr += ' — ';
            if (ev.endTime) timeStr += scheduleFormatTime(ev.endTime);
            timeEl.textContent = timeStr;
            content.appendChild(timeEl);
        }

        if (ev.note) {
            var noteEl = document.createElement('span');
            noteEl.className = 'sch-timeline-note';
            noteEl.textContent = ev.note;
            content.appendChild(noteEl);
        }

        item.appendChild(content);

        // 编辑按钮
        var editBtn = document.createElement('button');
        editBtn.className = 'btn btn--ghost btn--sm sch-timeline-edit';
        editBtn.textContent = '✎';
        editBtn.setAttribute('aria-label', 'edit');
        (function(evId) {
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                scheduleOpenDrawer(evId);
            });
        })(ev.id);
        item.appendChild(editBtn);

        timeline.appendChild(item);
    }
}
/* == END: schedule-day-view == */

/* == BLOCK: schedule-drawer == */
function scheduleOpenDrawer(eventId) {
    scheduleEditingId = eventId;

    var titleEl = $('#schDrawerTitle');
    var deleteBtn = $('#schDrawerDelete');

    // 重置颜色选择
    scheduleSelectedColor = SCHEDULE_COLORS[0].id;

    if (eventId) {
        // 编辑模式
        var all = scheduleLoadAll();
        var ev = null;
        for (var i = 0; i < all.length; i++) {
            if (all[i].id === eventId) { ev = all[i]; break; }
        }
        if (!ev) return;

        if (titleEl) titleEl.setAttribute('data-i18n', 'sch_edit_event');
        if (titleEl) titleEl.textContent = I18N[currentLang]['sch_edit_event'] || '编辑日程';
        if (deleteBtn) deleteBtn.style.display = '';

        $('#schInputTitle').value = ev.title || '';
        $('#schInputDate').value  = ev.date  || '';
        $('#schInputStart').value = ev.startTime || '';
        $('#schInputEnd').value   = ev.endTime   || '';
        $('#schInputNote').value  = ev.note  || '';

        scheduleSelectedColor = ev.color || SCHEDULE_COLORS[0].id;
    } else {
        // 新建模式
        if (titleEl) titleEl.setAttribute('data-i18n', 'sch_add_event');
        if (titleEl) titleEl.textContent = I18N[currentLang]['sch_add_event'] || '添加日程';
        if (deleteBtn) deleteBtn.style.display = 'none';

        $('#schInputTitle').value = '';
        // 默认填入当前日视图日期，或今天
        $('#schInputDate').value  = scheduleDayViewDate || scheduleTodayKey();
        $('#schInputStart').value = '';
        $('#schInputEnd').value   = '';
        $('#schInputNote').value  = '';
    }

    // 刷新颜色选择器状态
    scheduleInitColorPicker();

    // 打开抽屉
    $('#schDrawer').classList.add('sch-drawer--open');
    $('#schDrawerOverlay').classList.add('sch-drawer-overlay--visible');
    document.body.style.overflow = 'hidden';
}

function scheduleCloseDrawer() {
    $('#schDrawer').classList.remove('sch-drawer--open');
    $('#schDrawerOverlay').classList.remove('sch-drawer-overlay--visible');
    document.body.style.overflow = '';
    scheduleEditingId = null;
}

function scheduleDrawerSave() {
    var title = $('#schInputTitle').value.trim();
    var date  = $('#schInputDate').value;
    var start = $('#schInputStart').value;
    var end   = $('#schInputEnd').value;
    var note  = $('#schInputNote').value.trim();

    if (!title) {
        showToast('sch_title_empty');
        return;
    }
    if (!date) {
        showToast('sch_date_empty');
        return;
    }

    var all = scheduleLoadAll();

    if (scheduleEditingId) {
        // 更新
        for (var i = 0; i < all.length; i++) {
            if (all[i].id === scheduleEditingId) {
                all[i].title     = title;
                all[i].date      = date;
                all[i].startTime = start;
                all[i].endTime   = end;
                all[i].color     = scheduleSelectedColor;
                all[i].note      = note;
                break;
            }
        }
        showToast('sch_updated');
    } else {
        // 新建
        var newEv = {
            id:        scheduleGenId(),
            title:     title,
            date:      date,
            startTime: start,
            endTime:   end,
            color:     scheduleSelectedColor,
            note:      note
        };
        all.push(newEv);
        showToast('sch_added');
    }

    scheduleSaveAll(all);
    scheduleCloseDrawer();

    // 刷新当前视图
    if (scheduleCurrentView === 'month') {
        scheduleRenderMonth();
    } else {
        scheduleRenderTimeline(scheduleDayViewDate);
        scheduleRenderMonth(); // 同步月视图色点
    }
}

function scheduleDrawerDelete() {
    if (!scheduleEditingId) return;
    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    var confirmMsg = I18N[lang]['sch_confirm_delete'] || '确定删除这个日程？';
    if (!confirm(confirmMsg)) return;

    var all = scheduleLoadAll();
    var newList = [];
    for (var i = 0; i < all.length; i++) {
        if (all[i].id !== scheduleEditingId) newList.push(all[i]);
    }
    scheduleSaveAll(newList);
    showToast('sch_deleted');
    scheduleCloseDrawer();

    if (scheduleCurrentView === 'month') {
        scheduleRenderMonth();
    } else {
        scheduleRenderTimeline(scheduleDayViewDate);
        scheduleRenderMonth();
    }
}
/* == END: schedule-drawer == */

/* == END: schedule == */
