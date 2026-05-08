/* == BLOCK: i18n == */
const I18N = {
    zh: {
        nav_home: '首页',
        nav_divination: '占卜',
        nav_wheel: '转盘',
        nav_destroy: '销毁',
        nav_daily: '日常',
        nav_settings: '设置',
        home_subtitle: 'JUST FOR U · Aetheria',
        home_daily_card: '今日一卡',
        home_tarot_hint: '点击前往占卜抽取今日卡牌',
        home_mood: '心情速记',
        home_mood_save: '记录',
        div_desc: '选择你的牌阵，聆听宇宙的低语',
        wheel_desc: '把选择交给命运',
        destroy_desc: '写下你想摧毁的一切',
        daily_desc: '记录你的每一天',
        coming_soon: '即将开放',
        set_theme: '主题',
        set_bg: '背景',
        set_bg_upload: '上传图片',
        set_or: '或',
        set_bg_url_ph: '粘贴图片 URL',
        set_bg_apply: '应用',
        set_bg_reset: '恢复默认背景',
        set_lang: '语言',
        set_ai: 'AI 服务',
        set_ai_key_ph: 'API Key',
        set_ai_save: '保存 AI 配置',
        set_data: '数据',
        set_data_export: '导出 JSON',
        set_data_clear: '清除所有数据',
        greeting_morning: '早安，今天也要好好的',
        greeting_afternoon: '午后时光，慢慢来',
        greeting_evening: '晚上好，辛苦了一天',
        greeting_night: '夜深了，好好休息',
        toast_mood_saved: '心情已记录 ✨',
        toast_theme_changed: '主题已切换',
        toast_bg_set: '背景已设置',
        toast_bg_reset: '背景已恢复',
        toast_ai_saved: 'AI 配置已保存',
        toast_exported: '数据已导出',
        toast_cleared: '所有数据已清除',
        toast_confirm_clear: '再次点击确认清除所有数据',
        destroy_title: '负能量销毁室',
destroy_desc: '写下困扰你的一切，然后看着它们灰飞烟灭。',
destroy_placeholder: '把你的负能量写在这里...',
destroy_mode_label: '选择销毁方式',
destroy_mode_fire: '焚烧',
destroy_mode_water: '溶解',
destroy_mode_wind: '风化',
destroy_mode_void: '黑洞',
destroy_btn: '销毁它',
destroy_again: '再来一次',
destroy_toast_empty: '请先写点什么再销毁',
wheel_input_label: '输入选项',
wheel_add_ph: '输入一个选项...',
wheel_add_btn: '添加',
wheel_hint: '至少输入 2 个选项',
wheel_hint_one: '再添加 1 个选项',
wheel_spin_btn: '旋转命运',
wheel_result_label: '命运选择了',
wheel_again_btn: '再转一次',
wheel_reset_btn: '重置选项',
wheel_empty: '添加选项后开始',
wheel_toast_max: '最多 8 个选项',
wheel_toast_dup: '选项已存在',
div_title: '占卜',
    div_desc: '选择你的牌阵，聆听宇宙的低语',
    div_tab_lenormand: '雷诺曼',
    div_tab_tarot: '塔罗',
    div_choose_spread: '选择牌阵',
    div_spread_single: '每日一卡',
    div_spread_three: '三张牌阵',
    div_spread_five: '十字牌阵',
    div_spread_nine: '九宫格',
    div_question_label: '你想问什么？（可选）',
    div_question_ph: '在心中默念你的问题...',
    div_topic_work: '事业',
    div_topic_love: '爱情',
    div_topic_health: '健康',
    div_topic_money: '财运',
    div_topic_general: '综合',
    div_draw_btn: '开始抽牌',
    div_reading_title: '牌面解读',
    div_advice_label: '建议',
    div_ai_btn: 'AI 深度解读',
    div_ai_loading: '宇宙正在解读...',
    div_again_btn: '重新抽牌',
    div_toast_loading: '牌组加载中，请稍候...',
    div_toast_no_spread: '请先选择一个牌阵',
    ai_not_configured: 'AI 未配置，请在设置中填写 API Key',
    // ── 追加到 I18N.zh 末尾（ai_not_configured 那行末尾先加逗号）──
tarot_tab: '🃏 塔罗',
tarot_spread_single: '每日一卡',
tarot_spread_single_desc: '今日指引 ×1',
tarot_spread_three: '时间之流',
tarot_spread_three_desc: '过去 / 现在 / 未来 ×3',
tarot_spread_five: '学业之路',
tarot_spread_five_desc: '学业专属 ×5',
tarot_spread_six: '关系之镜',
tarot_spread_six_desc: '两人关系 ×6',
tarot_spread_seven: '指引之星',
tarot_spread_seven_desc: '通用深度 ×7',
tarot_spread_ten: '凯尔特十字',
tarot_spread_ten_desc: '经典深度 ×10',
tarot_question_label: '你想问什么？（可选）',
tarot_question_ph: '描述你的问题或情境...',
tarot_topic_work: '事业',
tarot_topic_love: '爱情',
tarot_topic_study: '学业',
tarot_topic_money: '财运',
tarot_topic_general: '综合',
tarot_draw_btn: '开始抽牌',
tarot_reading_title: '牌面解读',
tarot_upright: '正位',
tarot_reversed: '逆位',
tarot_keywords: '关键词',
tarot_meaning: '牌意',
tarot_ai_btn: '✨ AI 深度解读',
tarot_ai_loading: 'AI 正在解读中...',
tarot_again_btn: '重新抽牌',
tarot_pos_label: '位置',
tarot_toast_no_spread: '请先选择牌阵',
tarot_toast_loading: '正在抽牌，请稍候...',
tarot_arcana_major: '大阿卡纳',
tarot_arcana_minor: '小阿卡纳',
tarot_suit_wands: '权杖',
tarot_suit_cups: '圣杯',
tarot_suit_swords: '宝剑',
tarot_suit_pentacles: '星币',
daily_tab_mood:       '心情',
daily_tab_todo:       '待办',
daily_tab_habit:      '习惯',
daily_tab_calendar:   '日程',
mood_how_today:       '今天感觉如何？',
mood_note_placeholder:'写点什么…（可选）',
mood_save:            '记录心情',
mood_saved:           '心情已记录 ✨',
mood_select_first:    '请先选择一个心情',
mood_deleted:         '已删除',
mood_weekdays_zh:     '日,一,二,三,四,五,六',
// I18N.zh
todo_input_placeholder: '添加新任务…',
todo_add:               '添加',
todo_list_title:        '任务清单',
todo_clear_done:        '清除已完成',
todo_empty:             '还没有任务，添加一个吧 ✨',
todo_added:             '任务已添加',
todo_deleted:           '已删除',
todo_cleared:           '已清除完成的任务',
todo_input_empty:       '请输入任务内容',

},
    en: {
        nav_home: 'Home',
        nav_divination: 'Divine',
        nav_wheel: 'Wheel',
        nav_destroy: 'Destroy',
        nav_daily: 'Daily',
        nav_settings: 'Settings',
        home_subtitle: 'JUST FOR U · Aetheria',
        home_daily_card: 'Daily Card',
        home_tarot_hint: 'Tap to draw your daily card',
        home_mood: 'Quick Mood',
        home_mood_save: 'Log',
        div_desc: 'Choose your spread, listen to the cosmos',
        wheel_desc: 'Leave it to fate',
        destroy_desc: 'Write down what you want to destroy',
        daily_desc: 'Track your every day',
        coming_soon: 'Coming Soon',
        set_theme: 'Theme',
        set_bg: 'Background',
        set_bg_upload: 'Upload Image',
        set_or: 'or',
        set_bg_url_ph: 'Paste image URL',
        set_bg_apply: 'Apply',
        set_bg_reset: 'Reset Background',
        set_lang: 'Language',
        set_ai: 'AI Provider',
        set_ai_key_ph: 'API Key',
        set_ai_save: 'Save AI Config',
        set_data: 'Data',
        set_data_export: 'Export JSON',
        set_data_clear: 'Clear All Data',
        greeting_morning: 'Good morning, take it easy',
        greeting_afternoon: 'Good afternoon, slow down',
        greeting_evening: 'Good evening, you did well today',
        greeting_night: 'It\'s late, rest well',
        toast_mood_saved: 'Mood logged ✨',
        toast_theme_changed: 'Theme changed',
        toast_bg_set: 'Background set',
        toast_bg_reset: 'Background reset',
        toast_ai_saved: 'AI config saved',
        toast_exported: 'Data exported',
        toast_cleared: 'All data cleared',
        toast_confirm_clear: 'Click again to confirm clearing all data',
        destroy_title: 'Negativity Destroyer',
destroy_desc: 'Write down everything that bothers you, then watch it vanish.',
destroy_placeholder: 'Write your negativity here...',
destroy_mode_label: 'Choose destruction mode',
destroy_mode_fire: 'Burn',
destroy_mode_water: 'Dissolve',
destroy_mode_wind: 'Erode',
destroy_mode_void: 'Black Hole',
destroy_btn: 'DESTROY',
destroy_again: 'One More Time',
destroy_toast_empty: 'Write something before destroying',
wheel_input_label: 'Enter Options',
wheel_add_ph: 'Type an option...',
wheel_add_btn: 'Add',
wheel_hint: 'Add at least 2 options',
wheel_hint_one: 'Add 1 more option',
wheel_spin_btn: 'Spin the Wheel',
wheel_result_label: 'Fate chose',
wheel_again_btn: 'Spin Again',
wheel_reset_btn: 'Reset Options',
wheel_empty: 'Add options to begin',
wheel_toast_max: 'Max 8 options',
wheel_toast_dup: 'Option already exists',
  div_title: 'Divination',
    div_desc: 'Choose your spread, listen to the whispers of the universe',
    div_tab_lenormand: 'Lenormand',
    div_tab_tarot: 'Tarot',
    div_choose_spread: 'Choose Spread',
    div_spread_single: 'Daily Card',
    div_spread_three: 'Three Cards',
    div_spread_five: 'Cross Spread',
    div_spread_nine: 'Nine Grid',
    div_question_label: 'What do you want to ask? (Optional)',
    div_question_ph: 'Silently think of your question...',
    div_topic_work: 'Career',
    div_topic_love: 'Love',
    div_topic_health: 'Health',
    div_topic_money: 'Finance',
    div_topic_general: 'General',
    div_draw_btn: 'Draw Cards',
    div_reading_title: 'Card Reading',
    div_advice_label: 'Advice',
    div_ai_btn: 'AI Deep Reading',
    div_ai_loading: 'The universe is interpreting...',
    div_again_btn: 'Draw Again',
    div_toast_loading: 'Loading deck, please wait...',
    div_toast_no_spread: 'Please select a spread first',
    ai_not_configured: 'AI not configured. Please set API Key in Settings',
    // ── 追加到 I18N.en 末尾 ──
tarot_tab: '🃏 Tarot',
tarot_spread_single: 'Daily Card',
tarot_spread_single_desc: 'Daily guidance ×1',
tarot_spread_three: 'River of Time',
tarot_spread_three_desc: 'Past / Present / Future ×3',
tarot_spread_five: 'Scholar\'s Path',
tarot_spread_five_desc: 'Study focused ×5',
tarot_spread_six: 'Mirror of Relations',
tarot_spread_six_desc: 'Two-person spread ×6',
tarot_spread_seven: 'Guiding Star',
tarot_spread_seven_desc: 'General deep guidance ×7',
tarot_spread_ten: 'Celtic Cross',
tarot_spread_ten_desc: 'Classic deep spread ×10',
tarot_question_label: 'What\'s your question? (optional)',
tarot_question_ph: 'Describe your question or situation...',
tarot_topic_work: 'Career',
tarot_topic_love: 'Love',
tarot_topic_study: 'Study',
tarot_topic_money: 'Finance',
tarot_topic_general: 'General',
tarot_draw_btn: 'Draw Cards',
tarot_reading_title: 'Reading',
tarot_upright: 'Upright',
tarot_reversed: 'Reversed',
tarot_keywords: 'Keywords',
tarot_meaning: 'Meaning',
tarot_ai_btn: '✨ AI Deep Reading',
tarot_ai_loading: 'AI is reading...',
tarot_again_btn: 'Draw Again',
tarot_pos_label: 'Position',
tarot_toast_no_spread: 'Please select a spread first',
tarot_toast_loading: 'Drawing cards, please wait...',
tarot_arcana_major: 'Major Arcana',
tarot_arcana_minor: 'Minor Arcana',
tarot_suit_wands: 'Wands',
tarot_suit_cups: 'Cups',
tarot_suit_swords: 'Swords',
tarot_suit_pentacles: 'Pentacles',
daily_tab_mood:       'Mood',
daily_tab_todo:       'Todo',
daily_tab_habit:      'Habit',
daily_tab_calendar:   'Calendar',
mood_how_today:       'How are you feeling?',
mood_note_placeholder:'Add a note… (optional)',
mood_save:            'Log Mood',
mood_saved:           'Mood logged ✨',
mood_select_first:    'Pick a mood first',
mood_deleted:         'Deleted',
mood_weekdays_zh:     'Sun,Mon,Tue,Wed,Thu,Fri,Sat',
todo_input_placeholder: 'Add a new task…',
todo_add:               'Add',
todo_list_title:        'Tasks',
todo_clear_done:        'Clear Done',
todo_empty:             'No tasks yet, add one ✨',
todo_added:             'Task added',
todo_deleted:           'Deleted',
todo_cleared:           'Cleared completed tasks',
todo_input_empty:       'Please enter a task',
    }
};
/* == END: i18n == */

/* == BLOCK: quotes == */
const QUOTES = {
    zh: [
        '你不必成为任何人，你已经足够好了。',
        '允许自己慢下来，这不是退步。',
        '每一次呼吸都是重新开始的机会。',
        '你值得被温柔以待。',
        '今天的你，比昨天更勇敢了一点。',
        '不完美也是一种完整。',
        '你的感受是真实的，它们都值得被看见。',
        '休息不是偷懒，是为了走更远的路。',
        '黑夜终将过去，星光会为你留下。',
        '你正在做的已经很好了。',
        '温柔是一种力量，不是软弱。',
        '允许自己不开心，也允许自己重新快乐。',
        '你的存在本身就是一件美好的事。',
        '慢慢来，花总会开的。',
        '今天也是值得被记住的一天。'
    ],
    en: [
        'You don\'t have to be anyone else. You are enough.',
        'It\'s okay to slow down. That\'s not falling behind.',
        'Every breath is a chance to begin again.',
        'You deserve to be treated gently.',
        'You are a little braver today than yesterday.',
        'Imperfection is its own kind of wholeness.',
        'Your feelings are real and they deserve to be seen.',
        'Rest is not laziness — it\'s fuel for the journey.',
        'The night will pass. The stars will stay for you.',
        'What you\'re doing is already enough.',
        'Gentleness is strength, not weakness.',
        'It\'s okay to feel sad. It\'s also okay to feel joy again.',
        'Your existence itself is a beautiful thing.',
        'Take your time. Flowers always bloom eventually.',
        'Today is a day worth remembering.'
    ]
};
/* == END: quotes == */

/* == BLOCK: state == */
var currentLang = localStorage.getItem('aetheria_lang') || 'zh';
var currentTheme = localStorage.getItem('aetheria_theme') || 'moon';
var currentPage = 'home';
var clearConfirm = false;
var clockInterval = null;
/* == END: state == */

/* == BLOCK: utils == */
function $(sel) {
    return document.querySelector(sel);
}

function $$(sel) {
    return document.querySelectorAll(sel);
}

function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || key;
}

function showToast(msgKey) {
    var toast = $('#toast');
    toast.textContent = t(msgKey);
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2200);
}

function formatDate(date, lang) {
    var opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', opts);
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getGreetingKey() {
    var h = new Date().getHours();
    if (h >= 5 && h < 12) return 'greeting_morning';
    if (h >= 12 && h < 18) return 'greeting_afternoon';
    if (h >= 18 && h < 22) return 'greeting_evening';
    return 'greeting_night';
}

function getDailyQuote() {
    var quotes = QUOTES[currentLang] || QUOTES.zh;
    var today = new Date();
    var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return quotes[seed % quotes.length];
}
/* == END: utils == */

/* == BLOCK: i18n-apply == */
function applyI18n() {
    var els = $$('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
        var key = els[i].getAttribute('data-i18n');
        els[i].textContent = t(key);
    }
    var phEls = $$('[data-i18n-placeholder]');
    for (var j = 0; j < phEls.length; j++) {
        var phKey = phEls[j].getAttribute('data-i18n-placeholder');
        phEls[j].placeholder = t(phKey);
    }
}
/* == END: i18n-apply == */

/* == BLOCK: theme == */
function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aetheria_theme', theme);
    var btns = $$('.theme-btn');
    for (var i = 0; i < btns.length; i++) {
        if (btns[i].dataset.theme === theme) {
            btns[i].classList.add('active');
        } else {
            btns[i].classList.remove('active');
        }
    }
}
/* == END: theme == */

/* == BLOCK: background == */
function applyBackground() {
    var bgCustom = $('#bgCustom');
    var bgData = localStorage.getItem('aetheria_bg');

    if (bgData) {
        bgCustom.style.backgroundImage = 'url(' + bgData + ')';
        bgCustom.classList.add('active');
    } else {
        bgCustom.style.backgroundImage = '';
        bgCustom.classList.remove('active');
    }
}

function setupBackgroundHandlers() {
    var upload = $('#bgUpload');
    var urlInput = $('#bgUrlInput');
    var urlApply = $('#bgUrlApply');
    var reset = $('#bgReset');

    upload.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast('toast_bg_set');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(ev) {
            localStorage.setItem('aetheria_bg', ev.target.result);
            applyBackground();
            showToast('toast_bg_set');
        };
        reader.readAsDataURL(file);
    });

    urlApply.addEventListener('click', function() {
        var url = urlInput.value.trim();
        if (!url) return;
        localStorage.setItem('aetheria_bg', url);
        applyBackground();
        showToast('toast_bg_set');
        urlInput.value = '';
    });

    reset.addEventListener('click', function() {
        localStorage.removeItem('aetheria_bg');
        applyBackground();
        showToast('toast_bg_reset');
    });
}
/* == END: background == */

/* == BLOCK: routing == */
function navigateTo(page) {
    if (page === currentPage) return;

    var oldPage = $('#page-' + currentPage);
    var newPage = $('#page-' + page);

    if (!newPage) return;

    // Hide old page
    if (oldPage) {
        oldPage.classList.remove('page--active');
    }

    // Show new page
    newPage.classList.add('page--active');

    // Update nav
    var navItems = $$('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
        if (navItems[i].dataset.page === page) {
            navItems[i].classList.add('active');
        } else {
            navItems[i].classList.remove('active');
        }
    }

    currentPage = page;
}

function setupNav() {
    var navItems = $$('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function() {
            navigateTo(this.dataset.page);
        });
    }

    // Home tarot card click → navigate to divination
    var tarotCard = $('#homeTarotCard');
    if (tarotCard) {
        tarotCard.addEventListener('click', function() {
            navigateTo('divination');
        });
    }
}
/* == END: routing == */

/* == BLOCK: home == */
function updateHome() {
    var now = new Date();

    // Greeting
    var greetEl = $('#homeGreeting');
    if (greetEl) greetEl.textContent = t(getGreetingKey());

    // Date
    var dateEl = $('#homeDate');
    if (dateEl) dateEl.textContent = formatDate(now, currentLang);

    // Quote
    var quoteEl = $('#quoteText');
    if (quoteEl) quoteEl.textContent = getDailyQuote();
}

function startClock() {
    var clockEl = $('#homeClock');
    if (!clockEl) return;

    function tick() {
        clockEl.textContent = formatTime(new Date());
    }
    tick();
    clockInterval = setInterval(tick, 1000);
}

function setupMoodSlider() {
    var slider = $('#homeMoodSlider');
    var value = $('#homeMoodValue');
    var saveBtn = $('#homeMoodSave');

    if (!slider || !value || !saveBtn) return;

    slider.addEventListener('input', function() {
        value.textContent = slider.value;
    });

    saveBtn.addEventListener('click', function() {
        var today = new Date().toISOString().slice(0, 10);
        var moods = JSON.parse(localStorage.getItem('aetheria_moods') || '{}');
        moods[today] = parseInt(slider.value);
        localStorage.setItem('aetheria_moods', JSON.stringify(moods));
        showToast('toast_mood_saved');
    });
}
/* == END: home == */

/* == BLOCK: settings-handlers == */
function setupSettings() {
    // Theme picker
    var themePicker = $('#themePicker');
    if (themePicker) {
        themePicker.addEventListener('click', function(e) {
            var btn = e.target.closest('.theme-btn');
            if (!btn) return;
            applyTheme(btn.dataset.theme);
            showToast('toast_theme_changed');
        });
    }

    // Language picker
    var langPicker = $('#langPicker');
    if (langPicker) {
        langPicker.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-lang]');
            if (!btn) return;
            currentLang = btn.dataset.lang;
            localStorage.setItem('aetheria_lang', currentLang);
            var langBtns = $$('[data-lang]');
            for (var i = 0; i < langBtns.length; i++) {
                if (langBtns[i].dataset.lang === currentLang) {
                    langBtns[i].classList.add('active');
                } else {
                    langBtns[i].classList.remove('active');
                }
            }
            applyI18n();
            updateHome();
        });

        // Set active lang button on load
        var langBtns = $$('[data-lang]');
        for (var i = 0; i < langBtns.length; i++) {
            if (langBtns[i].dataset.lang === currentLang) {
                langBtns[i].classList.add('active');
            } else {
                langBtns[i].classList.remove('active');
            }
        }
    }

    // AI config
    var aiSave = $('#aiSave');
    if (aiSave) {
        // Load existing
        var aiConfig = JSON.parse(localStorage.getItem('aetheria_ai') || '{}');
        if (aiConfig.baseUrl) $('#aiBaseUrl').value = aiConfig.baseUrl;
        if (aiConfig.model) $('#aiModel').value = aiConfig.model;
        if (aiConfig.apiKey) $('#aiApiKey').value = aiConfig.apiKey;

        aiSave.addEventListener('click', function() {
            var config = {
                baseUrl: $('#aiBaseUrl').value.trim(),
                apiKey: $('#aiApiKey').value.trim(),
                model: $('#aiModel').value.trim()
            };
            localStorage.setItem('aetheria_ai', JSON.stringify(config));
            showToast('toast_ai_saved');
        });
    }

    // Data export
    var dataExport = $('#dataExport');
    if (dataExport) {
        dataExport.addEventListener('click', function() {
            var data = {};
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.indexOf('aetheria_') === 0) {
                    try {
                        data[key] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                        data[key] = localStorage.getItem(key);
                    }
                }
            }
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'aetheria-backup-' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('toast_exported');
        });
    }

    // Data clear
    var dataClear = $('#dataClear');
    if (dataClear) {
        dataClear.addEventListener('click', function() {
            if (!clearConfirm) {
                clearConfirm = true;
                showToast('toast_confirm_clear');
                setTimeout(function() { clearConfirm = false; }, 3000);
                return;
            }
            // Clear all aetheria data
            var keysToRemove = [];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.indexOf('aetheria_') === 0) {
                    keysToRemove.push(key);
                }
            }
            for (var j = 0; j < keysToRemove.length; j++) {
                localStorage.removeItem(keysToRemove[j]);
            }
            clearConfirm = false;

            // Reset to defaults
            currentLang = 'zh';
            currentTheme = 'moon';
            applyTheme('moon');
            applyI18n();
            applyBackground();
            updateHome();
            showToast('toast_cleared');
        });
    }

    // Background
    setupBackgroundHandlers();
}
/* == END: settings-handlers == */

/* == BLOCK: init == */
function init() {
    // Apply saved theme
    applyTheme(currentTheme);

    // Apply i18n
    applyI18n();

    // Apply background
    applyBackground();

    // Setup navigation
    setupNav();

    // Setup home
    updateHome();
    startClock();
    setupMoodSlider();

    // Setup settings
    setupSettings();
    initDaily();
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
/* == END: init == */

