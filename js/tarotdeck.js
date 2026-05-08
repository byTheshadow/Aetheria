/*============================================
 * Aetheria — 塔罗占卜系统
 * 文件: js/tarotdeck.js
 * 依赖: app.js (必须在此之前加载), api.js (AI解读)
 * 功能: 78张塔罗牌，6种牌阵，正逆位，翻牌动画，AI深度解读
 *============================================*/

/* == BLOCK: tarotdeck-data == */

// 6种牌阵配置
var TAROT_SPREAD_CONFIG = {
    single: {
        count: 1,
        positions: {
            zh: ['今日指引'],
            en: ['Daily Guidance']
        }
    },
    three: {
        count: 3,
        positions: {
            zh: ['过去', '现在', '未来'],
            en: ['Past', 'Present', 'Future']
        }
    },
    five: {
        count: 5,
        positions: {
            zh: ['当前学业状态', '主要障碍', '潜在优势', '建议方法', '可能结果'],
            en: ['Current Study State', 'Main Obstacle', 'Hidden Potential', 'Suggested Method', 'Possible Outcome']
        }
    },
    six: {
        count: 6,
        positions: {
            zh: ['你的状态', '对方状态', '关系基础', '当前挑战', '建议', '关系走向'],
            en: ['Your State', 'Their State', 'Foundation', 'Challenge', 'Advice', 'Direction']
        }
    },
        seven: {
        count: 7,
        positions: {
            zh: ['当前现状', '核心挑战', '过去根源', '未来趋势', '行动建议', '潜在影响', '最终指引'],
            en: ['Current Situation', 'Core Challenge', 'Past Root', 'Future Trend', 'Action Advice', 'Hidden Influence', 'Final Guidance']
        }
    },
    ten: {
        count: 10,
        positions: {
            zh: ['现状', '挑战/交叉', '潜意识', '过去', '可能结果', '近未来', '自我认知', '外部环境', '希望与恐惧', '最终结果'],
            en: ['Present', 'Challenge', 'Subconscious', 'Past', 'Possible Outcome', 'Near Future', 'Self', 'Environment', 'Hopes & Fears', 'Final Outcome']
        }
    }
};

// 牌阵对应的布局 class
var TAROT_LAYOUT_CLASS = {
    single: 'tarot-layout--single',
    three:  'tarot-layout--three',
    five:   'tarot-layout--five',
    six:    'tarot-layout--six',
    seven:  'tarot-layout--seven',
    ten:    'tarot-layout--ten'
};

/* == END: tarotdeck-data == */


/* == BLOCK: tarotdeck-state == */

var tarotState = {
    spread:       null,      // 当前选择的牌阵 key
    topic:        'general', // 当前话题
    question:     '',        // 用户输入的问题
    drawnCards:   [],        // 抽出的牌 [{card, reversed}, ...]
    flippedCount: 0,         // 已翻开的牌数
    isAnimating:  false,     // 是否正在动画中
    dataLoaded:   false,     // JSON 是否已加载
    allCards:     []         // 全部78张牌数据
};

/* == END: tarotdeck-state == */


/* == BLOCK: tarotdeck-init == */

function initTarotDeck() {
    bindEventsTarot();
    loadTarotData();
}

/* == END: tarotdeck-init == */


/* == BLOCK: tarotdeck-loadData == */

function loadTarotData() {
    if (tarotState.dataLoaded) { return; }
    fetch('data/tarotdeck.json')
        .then(function(res) {
            if (!res.ok) { throw new Error('HTTP ' + res.status); }
            return res.json();
        })
        .then(function(data) {
            tarotState.allCards = data;
            tarotState.dataLoaded = true;
        })
        .catch(function(err) {
            console.error('[tarotdeck] 加载数据失败:', err);
        });
}

/* == END: tarotdeck-loadData == */


/* == BLOCK: tarotdeck-bindEvents == */

function bindEventsTarot() {

    // ── 牌阵选择 ──
    var spreadCards = $$('#tarotSpreadGrid .tarot-spread-card');
    for (var i = 0; i < spreadCards.length; i++) {
        (function(btn) {
            btn.addEventListener('click', function() {
                tarotSelectSpread(btn.getAttribute('data-spread'));
            });
        })(spreadCards[i]);
    }

    // ── 话题标签 ──
    var topicTags = $$('#tarotTopicTags .div-topic-tag');
    for (var j = 0; j < topicTags.length; j++) {
        (function(tag) {
            tag.addEventListener('click', function() {
                // 移除其他 active
                var all = $$('#tarotTopicTags .div-topic-tag');
                for (var k = 0; k < all.length; k++) {
                    all[k].classList.remove('active');
                }
                tag.classList.add('active');
                tarotState.topic = tag.getAttribute('data-topic');
            });
        })(topicTags[j]);
    }

    // ── 开始抽牌 ──
    var drawBtn = $('#tarotDrawBtn');
    if (drawBtn) {
        drawBtn.addEventListener('click', function() {
            tarotStartDraw();
        });
    }

    // ── 重新抽牌 ──
    var againBtn = $('#tarotAgainBtn');
    if (againBtn) {
        againBtn.addEventListener('click', function() {
            tarotReset();
        });
    }

    // ── AI 深度解读 ──
    var aiBtn = $('#tarotAIBtn');
    if (aiBtn) {
        aiBtn.addEventListener('click', function() {
            tarotRequestAI();
        });
    }

    // ── 问题输入框同步 ──
    var qInput = $('#tarotQuestionInput');
    if (qInput) {
        qInput.addEventListener('input', function() {
            tarotState.question = qInput.value.trim();
        });
    }
}

/* == END: tarotdeck-bindEvents == */


/* == BLOCK: tarotdeck-selectSpread == */

function tarotSelectSpread(spreadKey) {
    if (!TAROT_SPREAD_CONFIG[spreadKey]) { return; }

    tarotState.spread = spreadKey;

    // 更新选中样式
    var btns = $$('#tarotSpreadGrid .tarot-spread-card');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
        if (btns[i].getAttribute('data-spread') === spreadKey) {
            btns[i].classList.add('active');
        }
    }

    // 显示问题区
    var qSection = $('#tarotQuestionSection');
    if (qSection) {
        qSection.style.display = 'block';
        qSection.style.animation = 'fadeInUp 0.35s ease';
    }
}

/* == END: tarotdeck-selectSpread == */


/* == BLOCK: tarotdeck-draw == */

function tarotStartDraw() {
    if (!tarotState.spread) {
        showToast('tarot_toast_no_spread');
        return;
    }
    if (!tarotState.dataLoaded || tarotState.allCards.length === 0) {
        showToast('tarot_toast_loading');
        return;
    }
    if (tarotState.isAnimating) { return; }

    // 同步问题输入
    var qInput = $('#tarotQuestionInput');
    if (qInput) { tarotState.question = qInput.value.trim(); }

    // 洗牌抽牌
    tarotState.drawnCards = tarotShuffle(tarotState.spread);
    tarotState.flippedCount = 0;

    // 隐藏问题区，显示牌台
    var qSection = $('#tarotQuestionSection');
    if (qSection) { qSection.style.display = 'none'; }

    var stage = $('#tarotStage');
    if (stage) { stage.style.display = 'block'; }

    var reading = $('#tarotReading');
    if (reading) { reading.style.display = 'none'; }

    // 构建牌台布局
    tarotBuildLayout();

    // 牌堆动画后逐张飞出
    tarotAnimateDeck();
}

function tarotShuffle(spreadKey) {
    var count = TAROT_SPREAD_CONFIG[spreadKey].count;
    var pool = tarotState.allCards.slice();

    // Fisher-Yates 洗牌
    for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
    }

    var result = [];
    for (var k = 0; k < count; k++) {
        result.push({
            card:     pool[k],
            reversed: Math.random() < 0.35  // 35% 概率逆位
        });
    }
    return result;
}

/* == END: tarotdeck-draw == */


/* == BLOCK: tarotdeck-buildLayout == */

function tarotBuildLayout() {
    var layout = $('#tarotLayout');
    if (!layout) { return; }

    var spreadKey  = tarotState.spread;
    var count      = TAROT_SPREAD_CONFIG[spreadKey].count;
    var layoutClass = TAROT_LAYOUT_CLASS[spreadKey];
    var lang       = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    var positions  = TAROT_SPREAD_CONFIG[spreadKey].positions[lang];

    // 重置 layout class
    layout.className = 'tarot-layout ' + layoutClass;
    layout.innerHTML = '';

    for (var i = 0; i < count; i++) {
        (function(idx) {
            // 外层 slot（用于 grid 定位）
            var slot = document.createElement('div');
            slot.className = 'tarot-slot';
            slot.style.display = 'flex';
            slot.style.flexDirection = 'column';
            slot.style.alignItems = 'center';

            // 翻牌容器
            var sizeClass = tarotGetSizeClass(spreadKey);
            var wrap = document.createElement('div');
            wrap.className = 'tarot-card-wrap ' + sizeClass;
            wrap.id = 'tarotCardWrap' + idx;
            wrap.style.opacity = '0'; // 初始隐藏，等飞入动画

            var inner = document.createElement('div');
            inner.className = 'tarot-card-inner';

            // 牌背
            var back = document.createElement('div');
            back.className = 'tarot-card-back';

            // 牌面（先空，飞入后填充）
            var front = document.createElement('div');
            front.className = 'tarot-card-front';
            front.id = 'tarotCardFront' + idx;

            inner.appendChild(back);
            inner.appendChild(front);
            wrap.appendChild(inner);

            // 点击翻牌
            wrap.addEventListener('click', function() {
                tarotFlipCard(idx);
            });

            // 牌位标签
            var posLabel = document.createElement('div');
            posLabel.className = 'tarot-card-pos-label';
            posLabel.textContent = positions[idx] || '';

            slot.appendChild(wrap);
            slot.appendChild(posLabel);
            layout.appendChild(slot);
        })(i);
    }
}

function tarotGetSizeClass(spreadKey) {
    if (spreadKey === 'single') { return ''; }
    if (spreadKey === 'three' || spreadKey === 'five') { return ''; }
    if (spreadKey === 'six' || spreadKey === 'seven') { return 'tarot-card--sm'; }
    if (spreadKey === 'ten') { return 'tarot-card--xs'; }
    return '';
}

/* == END: tarotdeck-buildLayout == */


/* == BLOCK: tarotdeck-animate == */

function tarotAnimateDeck() {
    var deck = $('#tarotDeck');
    if (!deck) { return; }

    var count = TAROT_SPREAD_CONFIG[tarotState.spread].count;

    // 构建牌堆视觉（3张叠加）
    deck.innerHTML = '';
    for (var d = 0; d < 3; d++) {
        var ghost = document.createElement('div');
        ghost.style.cssText = [
            'position:absolute',
            'width:72px',
            'height:108px',
            'border-radius:12px',
            'background:linear-gradient(135deg,var(--accent),rgba(0,0,0,0.6))',
            'border:1px solid var(--glass-border)',
            'top:' + (d * -3) + 'px',
            'left:' + (d * 2) + 'px',
            'opacity:' + (1 - d * 0.25)
        ].join(';');
        deck.appendChild(ghost);
    }
    deck.style.cssText = 'position:relative;width:72px;height:108px;margin:0 auto 24px;';

    // 逐张飞出
    var delay = 0;
    for (var i = 0; i < count; i++) {
        (function(idx, d) {
            setTimeout(function() {
                var wrap = $('#tarotCardWrap' + idx);
                if (!wrap) { return; }
                wrap.style.opacity = '1';
                wrap.style.animation = 'tarotFlyIn 0.45s cubic-bezier(0.22,1,0.36,1) both';
                // 最后一张飞出后隐藏牌堆
                if (idx === count - 1) {
                    setTimeout(function() {
                        if (deck) { deck.style.opacity = '0'; }
                    }, 400);
                }
            }, d);
        })(i, delay);
        delay += 120;
    }
}

/* == END: tarotdeck-animate == */


/* == BLOCK: tarotdeck-flip == */

function tarotFlipCard(idx) {
    if (tarotState.isAnimating) { return; }

    var wrap = $('#tarotCardWrap' + idx);
    if (!wrap || wrap.classList.contains('flipped')) { return; }

    tarotState.isAnimating = true;

    var cardData = tarotState.drawnCards[idx];
    var isReversed = cardData.reversed;

    // 填充牌面内容
    tarotFillCardFront(idx, cardData);

    // 翻牌
    wrap.classList.add('flipped');
    if (isReversed) { wrap.classList.add('reversed'); }

    tarotState.flippedCount++;

    setTimeout(function() {
        tarotState.isAnimating = false;
        // 全部翻完 → 显示解读
        if (tarotState.flippedCount === tarotState.drawnCards.length) {
            setTimeout(function() {
                tarotShowReading();
            }, 500);
        }
    }, 650);
}

function tarotFillCardFront(idx, cardData) {
    var front = $('#tarotCardFront' + idx);
    if (!front) { return; }

    var card = cardData.card;
    var isReversed = cardData.reversed;
    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';

    var name = card.name ? (card.name[lang] || card.name.zh) : '';
    var orientLabel = isReversed ? t('tarot_reversed') : t('tarot_upright');
    var orientClass = isReversed ? 'reversed' : 'upright';

    front.innerHTML = [
        '<div class="tarot-card-emoji">' + (card.emoji || '🃏') + '</div>',
        '<div class="tarot-card-name">' + name + '</div>',
        '<div class="tarot-card-orientation ' + orientClass + '">' + orientLabel + '</div>'
    ].join('');
}

/* == END: tarotdeck-flip == */


/* == BLOCK: tarotdeck-reading == */

function tarotShowReading() {
    var stage = $('#tarotStage');
    if (stage) { stage.style.display = 'none'; }

    var reading = $('#tarotReading');
    if (!reading) { return; }
    reading.style.display = 'block';

    var summary = $('#tarotCardsSummary');
    if (!summary) { return; }
    summary.innerHTML = '';

    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    var spreadKey = tarotState.spread;
    var positions = TAROT_SPREAD_CONFIG[spreadKey].positions[lang];

    for (var i = 0; i < tarotState.drawnCards.length; i++) {
        (function(idx) {
            var item     = tarotState.drawnCards[idx];
            var card     = item.card;
            var isRev    = item.reversed;
            var orient   = isRev ? 'reversed' : 'upright';
            var orientData = card[orient] || {};

            var name     = card.name ? (card.name[lang] || card.name.zh) : '';
            var keywords = (orientData.keywords && orientData.keywords[lang])
                           ? orientData.keywords[lang]
                           : [];
            var meaning  = (orientData.meaning && orientData.meaning[lang])
                           ? orientData.meaning[lang]
                           : (orientData.meaning ? orientData.meaning.zh : '');

            var orientLabel = isRev ? t('tarot_reversed') : t('tarot_upright');
            var orientClass = isRev ? 'reversed' : 'upright';
            var detailClass = isRev ? 'is-reversed' : 'is-upright';

            // 元素/星座 meta
            var metaHtml = '';
            if (card.element) {
                metaHtml += '<span>' + card.element + '</span>';
            }
            if (card.zodiac) {
                metaHtml += '<span>' + card.zodiac + '</span>';
            }
            if (card.arcana) {
                var arcanaKey = card.arcana === 'major' ? 'tarot_arcana_major' : 'tarot_arcana_minor';
                metaHtml += '<span>' + t(arcanaKey) + '</span>';
            }
            if (card.suit) {
                var suitKey = 'tarot_suit_' + card.suit;
                metaHtml += '<span>' + t(suitKey) + '</span>';
            }

            // 关键词标签
            var kwHtml = '';
            for (var k = 0; k < keywords.length; k++) {
                kwHtml += '<span class="tarot-keyword-tag">' + keywords[k] + '</span>';
            }

            // emoji 逆位旋转
            var emojiClass = isRev ? 'tarot-detail-emoji is-reversed-emoji' : 'tarot-detail-emoji';

            var html = [
                '<div class="tarot-card-detail ' + detailClass + '">',
                '  <div class="tarot-detail-left">',
                '    <div class="' + emojiClass + '">' + (card.emoji || '🃏') + '</div>',
                '    <div class="tarot-detail-badge ' + orientClass + '">' + orientLabel + '</div>',
                '  </div>',
                '  <div class="tarot-detail-right">',
                '    <div class="tarot-detail-pos">' + t('tarot_pos_label') + ' ' + (idx + 1) + ' · ' + (positions[idx] || '') + '</div>',
                '    <div class="tarot-detail-name">' + name + '</div>',
                '    <div class="tarot-detail-meta">' + metaHtml + '</div>',
                '    <div class="tarot-detail-keywords">' + kwHtml + '</div>',
                '    <div class="tarot-detail-meaning">' + meaning + '</div>',
                '  </div>',
                '</div>'
            ].join('');

            var node = document.createElement('div');
            node.innerHTML = html;
            summary.appendChild(node.firstChild);
        })(i);
    }

    // AI 按钮
    var aiSection = $('#tarotAISection');
    if (aiSection) {
        aiSection.style.display = (typeof isAIConfigured === 'function' && isAIConfigured())
            ? 'block' : 'none';
    }

    // 滚动到解读区
    setTimeout(function() {
        reading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/* == END: tarotdeck-reading == */


/* == BLOCK: tarotdeck-ai == */

function tarotRequestAI() {
    if (typeof isAIConfigured !== 'function' || !isAIConfigured()) {
        showToast('ai_not_configured');
        return;
    }

    var aiResult  = $('#tarotAIResult');
    var aiLoading = $('#tarotAILoading');
    var aiText    = $('#tarotAIText');
    var aiBtn     = $('#tarotAIBtn');

    if (!aiResult || !aiLoading || !aiText) { return; }

    // 显示加载状态
    aiResult.style.display  = 'block';
    aiLoading.style.display = 'flex';
    aiText.style.display    = 'none';
    aiText.innerHTML        = '';
    if (aiBtn) { aiBtn.disabled = true; }

    var lang      = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    var spreadKey = tarotState.spread;
    var positions = TAROT_SPREAD_CONFIG[spreadKey].positions[lang];

    // 构建牌面描述
    var cardDesc = '';
    for (var i = 0; i < tarotState.drawnCards.length; i++) {
        var item   = tarotState.drawnCards[i];
        var card   = item.card;
        var isRev  = item.reversed;
        var orient = isRev ? 'reversed' : 'upright';
        var name   = card.name ? (card.name[lang] || card.name.zh) : '';
        var orientLabel = isRev
            ? (lang === 'zh' ? '逆位' : 'Reversed')
            : (lang === 'zh' ? '正位' : 'Upright');
        var posName = positions[i] || ('位置' + (i + 1));
        cardDesc += (i + 1) + '. ' + posName + '：' + name + '（' + orientLabel + '）\n';
    }

    var spreadName = '';
    var spreadNameMap = {
        single: lang === 'zh' ? '每日一卡' : 'Daily Card',
        three:  lang === 'zh' ? '时间之流' : 'River of Time',
        five:   lang === 'zh' ? '学业之路' : "Scholar's Path",
        six:    lang === 'zh' ? '关系之镜' : 'Mirror of Relations',
        seven:  lang === 'zh' ? '指引之星' : 'Guiding Star',
        ten:    lang === 'zh' ? '凯尔特十字' : 'Celtic Cross'
    };
    spreadName = spreadNameMap[spreadKey] || spreadKey;

    var questionPart = tarotState.question
        ? (lang === 'zh' ? '\n问题：' + tarotState.question : '\nQuestion: ' + tarotState.question)
        : '';

    var systemPrompt = lang === 'zh'
        ? '你是一位温柔而深刻的塔罗解读师，擅长将牌意与提问者的实际处境结合，给出有温度、有洞见的解读。语言流畅自然，避免机械罗列，用叙事的方式娓娓道来。'
        : 'You are a gentle and insightful tarot reader who connects card meanings with the querent\'s real situation, offering warm and perceptive readings. Write in a flowing, narrative style rather than mechanical lists.';

    var userPrompt = lang === 'zh'
        ? ('我使用了「' + spreadName + '」牌阵进行占卜。' + questionPart + '\n\n抽到的牌如下：\n' + cardDesc + '\n请结合牌阵的位置含义，为我做一个完整、有深度的综合解读。')
        : ('I used the "' + spreadName + '" spread for a reading.' + questionPart + '\n\nCards drawn:\n' + cardDesc + '\nPlease provide a complete, insightful reading that integrates the positional meanings of the spread.');

    var messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
    ];

    aiChat(
        messages,
        // onChunk
        function(chunk, fullText) {
            aiLoading.style.display = 'none';
            aiText.style.display    = 'block';
            aiText.innerHTML        = tarotFormatAIText(fullText);
        },
        // onDone
        function(fullText) {
            aiLoading.style.display = 'none';
            aiText.style.display    = 'block';
            aiText.innerHTML        = tarotFormatAIText(fullText);
            if (aiBtn) { aiBtn.disabled = false; }
        },
        // onError
        function(errMsg) {
            aiLoading.style.display = 'none';
            aiText.style.display    = 'block';
            aiText.innerHTML        = '<span style="color:#f87171;">⚠ ' + errMsg + '</span>';
            if (aiBtn) { aiBtn.disabled = false; }
        }
    );
}

function tarotFormatAIText(text) {
    // 换行转 <br>，**粗体** 转 <strong>
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>\$1</strong>')
        .replace(/\n/g, '<br>');
}

/* == END: tarotdeck-ai == */


/* == BLOCK: tarotdeck-reset == */

function tarotReset() {
    // 清空状态
    tarotState.spread       = null;
    tarotState.topic        = 'general';
    tarotState.question     = '';
    tarotState.drawnCards   = [];
    tarotState.flippedCount = 0;
    tarotState.isAnimating  = false;

    // 清空 UI
    var layout = $('#tarotLayout');
    if (layout) { layout.innerHTML = ''; layout.className = 'tarot-layout'; }

    var deck = $('#tarotDeck');
    if (deck) { deck.innerHTML = ''; deck.style.opacity = '1'; }

    var summary = $('#tarotCardsSummary');
    if (summary) { summary.innerHTML = ''; }

    var aiResult = $('#tarotAIResult');
    if (aiResult) { aiResult.style.display = 'none'; }

    var aiText = $('#tarotAIText');
    if (aiText) { aiText.innerHTML = ''; }

    var aiBtn = $('#tarotAIBtn');
    if (aiBtn) { aiBtn.disabled = false; }

    var qInput = $('#tarotQuestionInput');
    if (qInput) { qInput.value = ''; }

    // 移除牌阵选中样式
    var spreadBtns = $$('#tarotSpreadGrid .tarot-spread-card');
    for (var i = 0; i < spreadBtns.length; i++) {
        spreadBtns[i].classList.remove('active');
    }

    // 移除话题选中样式
    var topicTags = $$('#tarotTopicTags .div-topic-tag');
    for (var j = 0; j < topicTags.length; j++) {
        topicTags[j].classList.remove('active');
    }

    // 隐藏各区块，回到初始状态
    var stage = $('#tarotStage');
    if (stage) { stage.style.display = 'none'; }

    var reading = $('#tarotReading');
    if (reading) { reading.style.display = 'none'; }

    var qSection = $('#tarotQuestionSection');
    if (qSection) { qSection.style.display = 'none'; }

    // 滚动回顶部
    var spreadSection = $('#tarotSpreadSection');
    if (spreadSection) {
        setTimeout(function() {
            spreadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

/* == END: tarotdeck-reset == */


/* == BLOCK: tarotdeck-tabSwitch == */

// 供 tarot.js / app.js 的 tab 切换逻辑调用
// 当用户点击「塔罗」tab 时，显示塔罗区域，隐藏雷诺曼区域
function tarotDeckActivate() {
    // 隐藏雷诺曼相关区域（tarot.js 管理的 DOM）
    var lenSpread  = $('#divSpreadSection');
    var lenQuestion = $('#divQuestionSection');
    var lenStage   = $('#divStage');
    var lenReading = $('#divReading');
    if (lenSpread)   { lenSpread.style.display   = 'none'; }
    if (lenQuestion) { lenQuestion.style.display = 'none'; }
    if (lenStage)    { lenStage.style.display    = 'none'; }
    if (lenReading)  { lenReading.style.display  = 'none'; }

    // 显示塔罗区域
    var tarotSpread = $('#tarotSpreadSection');
    if (tarotSpread) { tarotSpread.style.display = 'block'; }

    // 确保数据已加载
    if (!tarotState.dataLoaded) { loadTarotData(); }
}

// 当用户切换回「雷诺曼」tab 时，隐藏塔罗区域
function tarotDeckDeactivate() {
    var tarotSpread   = $('#tarotSpreadSection');
    var tarotQuestion = $('#tarotQuestionSection');
    var tarotStage    = $('#tarotStage');
    var tarotReading  = $('#tarotReading');
    if (tarotSpread)   { tarotSpread.style.display   = 'none'; }
    if (tarotQuestion) { tarotQuestion.style.display = 'none'; }
    if (tarotStage)    { tarotStage.style.display    = 'none'; }
    if (tarotReading)  { tarotReading.style.display  = 'none'; }
}

/* == END: tarotdeck-tabSwitch == */


/* == BLOCK: tarotdeck-i18n-helper == */

// 简写：取当前语言的 i18n 文本
// 依赖 app.js 中的 I18N 和 currentLang
function t(key) {
    if (typeof I18N === 'undefined' || typeof currentLang === 'undefined') {
        return key;
    }
    var dict = I18N[currentLang] || I18N['zh'];
    return dict[key] || key;
}

/* == END: tarotdeck-i18n-helper == */


/* == BLOCK: tarotdeck-css-keyframes == */

// 动态注入 tarotFlyIn 关键帧（避免污染 CSS 文件）
(function() {
    var styleId = 'tarot-keyframes';
    if (document.getElementById(styleId)) { return; }
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
        '@keyframes tarotFlyIn {',
        '  from {',
        '    opacity: 0;',
        '    transform: translateY(-40px) scale(0.8);',
        '  }',
        '  to {',
        '    opacity: 1;',
        '    transform: translateY(0) scale(1);',
        '  }',
        '}'
    ].join('\n');
    document.head.appendChild(style);
})();

/* == END: tarotdeck-css-keyframes == */


/* == BLOCK: tarotdeck-autoInit == */

// 页面加载完成后自动初始化
// 同时 hook 进占卜页面的 tab 切换逻辑
(function() {
    function hookDivTabs() {
        var tabs = $$('.div-tab');
        if (!tabs || tabs.length === 0) { return; }

        for (var i = 0; i < tabs.length; i++) {
            (function(tab) {
                var system = tab.getAttribute('data-system');
                if (!system) { return; }

                // 克隆节点以移除旧监听器，再重新绑定
                var newTab = tab.cloneNode(true);
                tab.parentNode.replaceChild(newTab, tab);

                newTab.addEventListener('click', function() {
                    // 更新 tab 激活样式
                    var allTabs = $$('.div-tab');
                    for (var j = 0; j < allTabs.length; j++) {
                        allTabs[j].classList.remove('active');
                    }
                    newTab.classList.add('active');

                    // 切换系统
                    if (system === 'tarot') {
                        tarotDeckActivate();
                    } else {
                        tarotDeckDeactivate();
                        // 恢复雷诺曼默认显示
                        var lenSpread = $('#divSpreadSection');
                        if (lenSpread) { lenSpread.style.display = 'block'; }
                    }
                });
            })(tabs[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initTarotDeck();
            hookDivTabs();
        });
    } else {
        initTarotDeck();
        hookDivTabs();
    }
})();

/* == END: tarotdeck-autoInit == */

