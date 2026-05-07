/*============================================
 * Aetheria — 占卜系统 (雷诺曼)
 * 文件: js/tarot.js
 * 依赖: app.js, api.js (必须在此之前加载)
 * 功能:雷诺曼36张牌占卜，4种牌阵，翻牌动画，AI解读
 *============================================*/

/* == BLOCK: divination-data == */
var LENORMAND_DATA = null;

var SPREAD_CONFIG = {
    single: {
        count: 1,
        positions: [
            { zh: '指引', en: 'Guidance' }
        ]
    },
    three: {
        count: 3,
        positions: [
            { zh: '过去', en: 'Past' },
            { zh: '现在', en: 'Present' },
            { zh: '未来', en: 'Future' }
        ]
    },
    five: {
        count: 5,
        positions: [
            { zh: '当前状况', en: 'Current' },
            { zh: '挑战', en: 'Challenge' },
            { zh: '过去影响', en: 'Past Influence' },
            { zh: '建议', en: 'Advice' },
            { zh: '结果', en: 'Outcome' }
        ]
    },
    nine: {
        count: 9,
        positions: [
            { zh: '过去远因', en: 'Distant Past' },
            { zh: '过去近因', en: 'Recent Past' },
            { zh: '当前状态', en: 'Current State' },
            { zh: '内心想法', en: 'Inner Thoughts' },
            { zh: '核心主题', en: 'Core Theme' },
            { zh: '外在环境', en: 'Environment' },
            { zh: '近期发展', en: 'Near Future' },
            { zh: '远期发展', en: 'Far Future' },
            { zh: '最终结果', en: 'Final Outcome' }
        ]
    }
};

var SPREAD_LAYOUT_CLASS = {
    single: 'div-layout--single',
    three: 'div-layout--three',
    five: 'div-layout--five',
    nine: 'div-layout--nine'
};
/* == END: divination-data == */

/* == BLOCK: divination-state == */
var divState = {
    system: 'lenormand',
    spread: null,
    topic: 'general',
    question: '',
    drawnCards: [],
    flippedCount: 0,
    isAnimating: false,
    dataLoaded: false
};
/* == END: divination-state == */

/* == BLOCK: divination-init == */
function initDivination() {
    loadLenormandData();
    bindEventsDivination();
}
/* == END: divination-init == */

/* == BLOCK: divination-loadData == */
function loadLenormandData() {
    fetch('data/lenormand.json')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            LENORMAND_DATA = data;
            divState.dataLoaded = true;
        })
        .catch(function(err) {
            console.error('Failed to load lenormand.json:', err);
        });
}
/* == END: divination-loadData == */

/* == BLOCK: divination-bindEvents == */
function bindEventsDivination() {
    /* System tabs */
    var tabs = $$('.div-tab');
    for (var i = 0; i < tabs.length; i++) {
        (function(tab) {
            tab.addEventListener('click', function() {
                if (tab.disabled) return;
                for (var j = 0; j < tabs.length; j++) {
                    tabs[j].classList.remove('div-tab--active');
                }
                tab.classList.add('div-tab--active');
                divState.system = tab.getAttribute('data-system');
            });
        })(tabs[i]);
    }

    /* Spread selection */
    var spreadCards = $$('.div-spread-card');
    for (var i = 0; i < spreadCards.length; i++) {
        (function(card) {
            card.addEventListener('click', function() {
                var spread = card.getAttribute('data-spread');
                divSelectSpread(spread);
            });
        })(spreadCards[i]);
    }

    /* Topic tags */
    var topicTags = $$('.div-topic-tag');
    for (var i = 0; i < topicTags.length; i++) {
        (function(tag) {
            tag.addEventListener('click', function() {
                for (var j = 0; j < topicTags.length; j++) {
                    topicTags[j].classList.remove('div-topic-tag--active');
                }
                tag.classList.add('div-topic-tag--active');
                divState.topic = tag.getAttribute('data-topic');
            });
        })(topicTags[i]);
    }

    /* Draw button */
    var drawBtn = $('#divDrawBtn');
    if (drawBtn) {
        drawBtn.addEventListener('click', function() {
            divState.question = ($('#divQuestionInput') || {}).value || '';
            divStartDraw();
        });
    }

    /* Again button */
    var againBtn = $('#divAgainBtn');
    if (againBtn) {
        againBtn.addEventListener('click', function() {
            divReset();
        });
    }

    /* AI button */
    var aiBtn = $('#divAIBtn');
    if (aiBtn) {
        aiBtn.addEventListener('click', function() {
            divRequestAI();
        });
    }
}
/* == END: divination-bindEvents == */

/* == BLOCK: divination-selectSpread == */
function divSelectSpread(spread) {
    divState.spread = spread;

    /* Highlight selected */
    var cards = $$('.div-spread-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('div-spread-card--active');
        if (cards[i].getAttribute('data-spread') === spread) {
            cards[i].classList.add('div-spread-card--active');
        }
    }

    /* Show question section */
    var qSection = $('#divQuestionSection');
    if (qSection) {
        qSection.style.display = '';
        qSection.classList.add('div-fade-in');
    }

    /* Scroll to question */
    setTimeout(function() {
        if (qSection) qSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}
/* == END: divination-selectSpread == */

/* == BLOCK: divination-draw == */
function divStartDraw() {
    if (!divState.dataLoaded || !LENORMAND_DATA) {
        showToast('div_toast_loading');
        return;
    }
    if (!divState.spread) {
        showToast('div_toast_no_spread');
        return;
    }
    if (divState.isAnimating) return;
    divState.isAnimating = true;

    var config = SPREAD_CONFIG[divState.spread];
    var count = config.count;

    /* Shuffle and draw */
    var deck = [];
    for (var i = 0; i < LENORMAND_DATA.length; i++) {
        deck.push(LENORMAND_DATA[i]);
    }
    divShuffle(deck);
    divState.drawnCards = deck.slice(0, count);
    divState.flippedCount = 0;

    /* Hide spread selection & question */
    var spreadSection = $('#divSpreadSection');
    var qSection = $('#divQuestionSection');
    var tabSection = $('.div-tabs');
    if (spreadSection) spreadSection.style.display = 'none';
    if (qSection) qSection.style.display = 'none';
    if (tabSection) tabSection.style.display = 'none';

    /* Show stage */
    var stage = $('#divStage');
    if (stage) {
        stage.style.display = '';
        stage.classList.add('div-fade-in');
    }

    /* Build layout */
    divBuildLayout();

    /* Animate cards flying from deck */
    divAnimateFlyOut();
}

function divShuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
/* == END: divination-draw == */

/* == BLOCK: divination-buildLayout == */
function divBuildLayout() {
    var layout = $('#divLayout');
    if (!layout) return;
    layout.innerHTML = '';
    layout.className = 'div-layout ' + (SPREAD_LAYOUT_CLASS[divState.spread] || '');

    var config = SPREAD_CONFIG[divState.spread];

    for (var i = 0; i < config.count; i++) {
        (function(idx) {
            var card = divState.drawnCards[idx];
            var posLabel = config.positions[idx][currentLang] || config.positions[idx].zh;

            var slot = document.createElement('div');
            slot.className = 'div-card-slot';
            slot.setAttribute('data-index', idx);

            slot.innerHTML =
                '<div class="div-card-position mono">' + posLabel + '</div>' +
                '<div class="div-card-flip" data-index="' + idx + '">' +
                    '<div class="div-card-inner">' +
                        '<div class="div-card-front glass-card">' +
                            '<span class="div-card-back-symbol">✦</span>' +
                        '</div>' +
                        '<div class="div-card-back glass-card">' +
                            '<div class="div-card-emoji">' + card.emoji + '</div>' +
                            '<div class="div-card-name">' + (card.name[currentLang] || card.name.zh) + '</div>' +
                            '<div class="div-card-id mono">#' + card.id + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            /* Click to flip */
            var flipEl = slot.querySelector('.div-card-flip');
            flipEl.addEventListener('click', function() {
                divFlipCard(idx, flipEl);
            });

            layout.appendChild(slot);
        })(i);
    }
}
/* == END: divination-buildLayout == */

/* == BLOCK: divination-animate == */
function divAnimateFlyOut() {
    var deck = $('#divDeck');
    var slots = $$('.div-card-slot');

    if (deck) deck.style.display = '';

    for (var i = 0; i < slots.length; i++) {
        slots[i].style.opacity = '0';
        slots[i].style.transform = 'scale(0.3)';
    }

    var delay = 0;
    for (var i = 0; i < slots.length; i++) {
        (function(idx) {
            setTimeout(function() {
                slots[idx].style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                slots[idx].style.opacity = '1';
                slots[idx].style.transform = 'scale(1)';
            }, delay);
        })(i);
        delay += 150;
    }

    /* Hide deck after all cards fly out */
    setTimeout(function() {
        if (deck) deck.style.display = 'none';
        divState.isAnimating = false;
    }, delay + 300);
}
/* == END: divination-animate == */

/* == BLOCK: divination-flip == */
function divFlipCard(idx, flipEl) {
    if (flipEl.classList.contains('div-card-flip--flipped')) return;

    flipEl.classList.add('div-card-flip--flipped');
    divState.flippedCount++;

    var config = SPREAD_CONFIG[divState.spread];

    /* Check if all flipped */
    if (divState.flippedCount >= config.count) {
        setTimeout(function() {
            divShowReading();
        }, 600);
    }
}
/* == END: divination-flip == */

/* == BLOCK: divination-reading == */
function divShowReading() {
    var reading = $('#divReading');
    if (reading) {
        reading.style.display = '';
        reading.classList.add('div-fade-in');
    }

    /* Build summary */
    var summary = $('#divCardsSummary');
    if (!summary) return;
    summary.innerHTML = '';

    var config = SPREAD_CONFIG[divState.spread];

    for (var i = 0; i < divState.drawnCards.length; i++) {
        var card = divState.drawnCards[i];
        var posLabel = config.positions[i][currentLang] || config.positions[i].zh;
        var topicKey = divState.topic;
        var meaningKey = topicKey === 'general' ? 'advice' : topicKey;

        var natureClass = 'div-nature--' + card.nature;
        var natureLabel = card.nature === 'positive' ? (currentLang === 'zh' ? '正面' : 'Positive') :
                          card.nature === 'negative' ? (currentLang === 'zh' ? '负面' : 'Negative') :
                          (currentLang === 'zh' ? '中性' : 'Neutral');

        var keywords = (card.keywords[currentLang] || card.keywords.zh).join(' · ');
        var coreTxt = card.core[currentLang] || card.core.zh;
        var meaningTxt = card.meanings[meaningKey] ? (card.meanings[meaningKey][currentLang] || card.meanings[meaningKey].zh) : coreTxt;
        var adviceTxt = card.meanings.advice ? (card.meanings.advice[currentLang] || card.meanings.advice.zh) : '';
        var timeTxt = card.time ? (card.time[currentLang] || card.time.zh) : '';

        var html =
            '<div class="div-summary-card glass-card div-fade-in" style="animation-delay:' + (i * 0.1) + 's">' +
                '<div class="div-summary-header">' +
                    '<span class="div-summary-pos mono">' + posLabel + '</span>' +
                    '<span class="div-summary-nature ' + natureClass + '">' + natureLabel + '</span>' +
                '</div>' +
                '<div class="div-summary-main">' +
                    '<span class="div-summary-emoji">' + card.emoji + '</span>' +
                    '<div class="div-summary-info">' +
                        '<div class="div-summary-name">' + (card.name[currentLang] || card.name.zh) + '<span class="mono">#' + card.id + '</span></div>' +
                        '<div class="div-summary-keywords mono">' + keywords + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="div-summary-core">' + coreTxt + '</div>' +
                '<div class="div-summary-meaning">' +
                    '<span class="div-summary-meaning-label mono">' + divGetTopicLabel(topicKey) + '</span>' +
                    '<p>' + meaningTxt + '</p>' +
                '</div>' +
                (adviceTxt ? '<div class="div-summary-advice"><span class="div-summary-meaning-label mono">' + t('div_advice_label') + '</span><p>' + adviceTxt + '</p></div>' : '') +
                (timeTxt ? '<div class="div-summary-time mono">⏱ ' + timeTxt + '</div>' : '') +
            '</div>';

        summary.innerHTML += html;
    }

    /* Show AI button if configured */
    var aiSection = $('#divAISection');
    if (aiSection) {
        aiSection.style.display = isAIConfigured() ? '' : 'none';
    }

    /* Scroll to reading */
    setTimeout(function() {
        if (reading) reading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

function divGetTopicLabel(topic) {
    var map = {
        work: t('div_topic_work'),
        love: t('div_topic_love'),
        health: t('div_topic_health'),
        money: t('div_topic_money'),
        general: t('div_topic_general')
    };
    return map[topic] || map.general;
}
/* == END: divination-reading == */

/* == BLOCK: divination-ai == */
function divRequestAI() {
    var aiBtn = $('#divAIBtn');
    var aiResult = $('#divAIResult');
    var aiLoading = $('#divAILoading');
    var aiText = $('#divAIText');

    if (!aiBtn || !aiResult || !aiLoading || !aiText) return;

    aiBtn.disabled = true;
    aiBtn.style.display = 'none';
    aiResult.style.display = '';
    aiLoading.style.display = '';
    aiText.innerHTML = '';

    var config = SPREAD_CONFIG[divState.spread];
    var spreadName = divState.spread === 'single' ? '每日一卡' :divState.spread === 'three' ? '三张牌阵（过去/现在/未来）' :
                     divState.spread === 'five' ? '十字牌阵（状况/挑战/过去/建议/结果）' :
                     '九宫格';

    var cardsDesc = '';
    for (var i = 0; i < divState.drawnCards.length; i++) {
        var card = divState.drawnCards[i];
        var pos = config.positions[i].zh;
        cardsDesc += '位置「' + pos + '」: #' + card.id + ' ' + card.name.zh + '（' + card.emoji + '）- ' + card.core.zh + '\n';
    }

    var topicLabel = divGetTopicLabel(divState.topic);
    var questionText = divState.question ? '提问者的问题：' + divState.question + '\n' : '';

    var systemPrompt = '你是一位专业的雷诺曼牌占卜师，精通36张雷诺曼牌的牌意与组合解读。' +
        '请根据抽到的牌面，结合牌阵位置的含义，给出深度、温暖、有洞察力的解读。' +
        '注意牌与牌之间的组合关系和相互影响。语气温柔但有力量，像一位智慧的朋友在给建议。' +
        '回答使用中文，用优美的排版，适当使用emoji。不要重复列出每张牌的基本含义，而是做整体性的深度解读。';

    var userPrompt = '牌阵类型：' + spreadName + '\n' +
        '关注领域：' + topicLabel + '\n' +
        questionText +
        '抽到的牌：\n' + cardsDesc + '\n' +
        '请给出整体性的深度解读，包括：\n' +
        '1. 整体能量概述\n' +
        '2. 各位置牌面的组合解读（注意牌与牌之间的关系）\n' +
        '3. 针对「' + topicLabel + '」领域的具体建议\n' +
        '4. 一句温暖的寄语';

    var messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    aiChat(
        messages,
        function(chunk, fullText) {
            /* onChunk - streaming */
            aiLoading.style.display = 'none';
            aiText.innerHTML = divFormatAIText(fullText);
        },
        function(fullText) {
            /* onDone */
            aiLoading.style.display = 'none';
            aiText.innerHTML = divFormatAIText(fullText);
        },
        function(errMsg) {
            /* onError */
            aiLoading.style.display = 'none';
            aiText.innerHTML = '<p class="div-ai-error">⚠️ ' + errMsg + '</p>';aiBtn.disabled = false;
            aiBtn.style.display = '';
        }
    );
}

function divFormatAIText(text) {
    /* Simple markdown-like formatting */
    var html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    return '<p>' + html + '</p>';
}
/* == END: divination-ai == */

/* == BLOCK: divination-reset == */
function divReset() {
    divState.spread = null;
    divState.topic ='general';
    divState.question = '';
    divState.drawnCards = [];
    divState.flippedCount = 0;
    divState.isAnimating = false;

    /* Reset UI */
    var spreadSection = $('#divSpreadSection');
    var qSection = $('#divQuestionSection');
    var tabSection = $('.div-tabs');
    var stage = $('#divStage');
    var reading = $('#divReading');
    var aiSection = $('#divAISection');
    var aiResult = $('#divAIResult');
    var aiBtn = $('#divAIBtn');
    var aiText = $('#divAIText');
    var layout = $('#divLayout');
    var qInput = $('#divQuestionInput');

    if (spreadSection) spreadSection.style.display = '';
    if (qSection) qSection.style.display = 'none';
    if (tabSection) tabSection.style.display = '';
    if (stage) stage.style.display = 'none';
    if (reading) { reading.style.display = 'none'; reading.classList.remove('div-fade-in'); }
    if (aiSection) aiSection.style.display = 'none';
    if (aiResult) aiResult.style.display = 'none';
    if (aiBtn) { aiBtn.disabled = false; aiBtn.style.display = ''; }
    if (aiText) aiText.innerHTML = '';
    if (layout) layout.innerHTML = '';
    if (qInput) qInput.value = '';

    /* Remove active states */
    var spreadCards = $$('.div-spread-card');
    for (var i = 0; i < spreadCards.length; i++) {
        spreadCards[i].classList.remove('div-spread-card--active');
    }
    var topicTags = $$('.div-topic-tag');
    for (var i = 0; i < topicTags.length; i++) {
        topicTags[i].classList.remove('div-topic-tag--active');
    }

    /* Scroll to top */
    var pageScroll = $('#page-divination .page-scroll');
    if (pageScroll) pageScroll.scrollTop = 0;
}
/* == END: divination-reset == */

/* == BLOCK: divination-autoInit == */
document.addEventListener('DOMContentLoaded', function() {
    initDivination();
});
/* == END: divination-autoInit == */
