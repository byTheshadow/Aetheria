/* == BLOCK: tarot-init == */
window.AetheriaTarot = (function () {
  'use strict';

  let tarotDeck     = [];
  let lenormandDeck = [];
  let loaded        = false;

  // Minimal inline deck — 22 Major Arcana with emoji
  // Full 78-card tarot.json can replace this later
  const MAJOR_ARCANA = [
    { id:0,  name:'愚者',     emoji:'🃏', keywords:['自由','冒险','新开始'],   meaning_up:'新的旅程即将开始，保持开放的心态', meaning_rev:'鲁莽，缺乏方向' },
    { id:1,  name:'魔术师',   emoji:'🎩', keywords:['意志','技巧','创造'],     meaning_up:'你拥有实现目标的一切工具',         meaning_rev:'欺骗，潜力未发挥' },
    { id:2,  name:'女祭司',   emoji:'🌙', keywords:['直觉','神秘','内在'],     meaning_up:'倾听内心的声音，答案在你心中',     meaning_rev:'隐藏的议程，忽视直觉' },
    { id:3,  name:'女皇',     emoji:'🌸', keywords:['丰盛','母性','自然'],     meaning_up:'创造力与丰盛，滋养与被滋养',       meaning_rev:'依赖，创造力受阻' },
    { id:4,  name:'皇帝',     emoji:'👑', keywords:['权威','稳定','结构'],     meaning_up:'建立秩序，掌控局面',               meaning_rev:'专制，缺乏灵活性' },
    { id:5,  name:'教皇',     emoji:'⛪', keywords:['传统','信仰','指引'],     meaning_up:'寻求智慧与精神指引',               meaning_rev:'打破规则，质疑权威' },
    { id:6,  name:'恋人',     emoji:'💕', keywords:['爱情','选择','和谐'],     meaning_up:'重要的选择，心与心的连接',         meaning_rev:'失衡，价值观冲突' },
    { id:7,  name:'战车',     emoji:'🏆', keywords:['胜利','意志','前进'],     meaning_up:'凭借意志力克服障碍，走向胜利',     meaning_rev:'失控，方向迷失' },
    { id:8,  name:'力量',     emoji:'🦁', keywords:['勇气','耐心','内力'],     meaning_up:'温柔而坚定，内在力量无穷',         meaning_rev:'自我怀疑，软弱' },
    { id:9,  name:'隐士',     emoji:'🕯️', keywords:['内省','孤独','智慧'],     meaning_up:'向内寻找答案，独处是礼物',         meaning_rev:'孤立，拒绝帮助' },
    { id:10, name:'命运之轮', emoji:'🎡', keywords:['命运','转变','循环'],     meaning_up:'命运的转折点，变化即将到来',       meaning_rev:'厄运，抗拒变化' },
    { id:11, name:'正义',     emoji:'⚖️', keywords:['公正','真相','因果'],     meaning_up:'公平的结果，诚实面对自己',         meaning_rev:'不公正，逃避责任' },
    { id:12, name:'倒吊人',   emoji:'🙃', keywords:['等待','牺牲','新视角'],   meaning_up:'暂停，从不同角度看问题',           meaning_rev:'拖延，无谓牺牲' },
    { id:13, name:'死神',     emoji:'🌑', keywords:['结束','转变','重生'],     meaning_up:'一个阶段的结束，新生即将开始',     meaning_rev:'抗拒改变，停滞' },
    { id:14, name:'节制',     emoji:'🌊', keywords:['平衡','耐心','融合'],     meaning_up:'找到平衡，耐心等待时机',           meaning_rev:'失衡，过度' },
    { id:15, name:'恶魔',     emoji:'🔗', keywords:['束缚','欲望','阴影'],     meaning_up:'审视你的束缚，是什么在控制你',     meaning_rev:'挣脱束缚，重获自由' },
    { id:16, name:'塔',       emoji:'⚡', keywords:['突变','崩塌','启示'],     meaning_up:'突如其来的变化，旧结构崩塌',       meaning_rev:'避免灾难，延迟崩塌' },
    { id:17, name:'星星',     emoji:'⭐', keywords:['希望','灵感','治愈'],     meaning_up:'希望之光，相信美好的未来',         meaning_rev:'绝望，失去信念' },
    { id:18, name:'月亮',     emoji:'🌕', keywords:['幻觉','恐惧','潜意识'],   meaning_up:'面对内心的恐惧与幻觉',             meaning_rev:'混乱消散，真相浮现' },
    { id:19, name:'太阳',     emoji:'☀️', keywords:['喜悦','成功','活力'],     meaning_up:'光明与喜悦，一切都在向好',         meaning_rev:'过度乐观，短暂的快乐' },
    { id:20, name:'审判',     emoji:'🎺', keywords:['觉醒','反思','召唤'],     meaning_up:'内心的觉醒，听从内在的召唤',       meaning_rev:'自我怀疑，拒绝改变' },
    { id:21, name:'世界',     emoji:'🌍', keywords:['完成','整合','成就'],     meaning_up:'一个完整的循环，成就与圆满',       meaning_rev:'未完成，缺乏闭合' },
  ];

  const LENORMAND_MINI = [
    { id:1,  name:'骑士',   emoji:'🐴' }, { id:2,  name:'三叶草', emoji:'🍀' },
    { id:3,  name:'船',     emoji:'⛵' }, { id:4,  name:'房子',   emoji:'🏠' },
    { id:5,  name:'树',     emoji:'🌳' }, { id:6,  name:'云',     emoji:'☁️' },
    { id:7,  name:'蛇',     emoji:'🐍' }, { id:8,  name:'棺材',   emoji:'⚰️' },
    { id:9,  name:'花束',   emoji:'💐' }, { id:10, name:'镰刀',   emoji:'⚔️' },
    { id:11, name:'鞭子',   emoji:'🌿' }, { id:12, name:'鸟',     emoji:'🐦' },
    { id:13, name:'孩子',   emoji:'👶' }, { id:14, name:'狐狸',   emoji:'🦊' },
    { id:15, name:'熊',     emoji:'🐻' }, { id:16, name:'星星',   emoji:'⭐' },
    { id:17, name:'鹳',     emoji:'🦢' }, { id:18, name:'狗',     emoji:'🐕' },
    { id:19, name:'塔',     emoji:'🗼' }, { id:20, name:'花园',   emoji:'🌺' },
    { id:21, name:'山',     emoji:'⛰️' }, { id:22, name:'十字路', emoji:'🛤️' },
    { id:23, name:'老鼠',   emoji:'🐭' }, { id:24, name:'心',     emoji:'❤️' },
    { id:25, name:'戒指',   emoji:'💍' }, { id:26, name:'书',     emoji:'📖' },
    { id:27, name:'信',     emoji:'✉️' }, { id:28, name:'男人',   emoji:'👨' },
    { id:29, name:'女人',   emoji:'👩' }, { id:30, name:'百合',   emoji:'🌷' },
    { id:31, name:'太阳',   emoji:'☀️' }, { id:32, name:'月亮',   emoji:'🌙' },
    { id:33, name:'钥匙',   emoji:'🗝️' }, { id:34, name:'鱼',     emoji:'🐟' },
    { id:35, name:'锚',     emoji:'⚓' }, { id:36, name:'十字架', emoji:'✝️' },
  ];

  function init() {
    tarotDeck     = [...MAJOR_ARCANA];
    lenormandDeck = [...LENORMAND_MINI];
    loaded = true;
    window.dispatchEvent(new Event('aetheria:tarot-ready'));
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function drawOne() {
    const deck = shuffle(tarotDeck);
    const card = { ...deck[0], reversed: Math.random() < 0.3 };
    return card;
  }

  function drawSpread(spread) {
    const stage = document.getElementById('cardsStage');
    if (!stage) return;

    const counts = { '1': 1, '3': 3, 'celtic': 10 };
    const labels = {
      '1':      ['当下'],
      '3':      ['过去', '现在', '未来'],
      'celtic': ['当下', '挑战', '远因', '近因', '可能', '近未来', '自我', '环境', '希望', '结果'],
    };

    const n     = counts[spread] || 1;
    const deck  = shuffle(tarotDeck);
    const drawn = deck.slice(0, n).map(c => ({ ...c, reversed: Math.random() < 0.3 }));

    stage.innerHTML = '';
    stage.style.flexWrap = n > 3 ? 'wrap' : 'nowrap';

    drawn.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'tarot-card';
      el.setAttribute('aria-label', card.name);
      el.innerHTML = `
        <div class="tarot-card-inner">
          <div class="tarot-card-face tarot-card-back">
            <span style="font-size:24px;opacity:0.4">✦</span>
          </div>
          <div class="tarot-card-face tarot-card-front-face" style="transform:rotateY(180deg)${card.reversed ? ' rotate(180deg)' : ''}">
            <span class="card-emoji">${card.emoji}</span>
            <span class="card-name">${card.name}${card.reversed ? '\n逆位' : ''}</span>
          </div>
        </div>
        ${labels[spread] ? `<div style="font-size:10px;color:var(--text-muted);text-align:center;margin-top:6px">${labels[spread][i] || ''}</div>` : ''}
      `;

      // Flip on click
      el.addEventListener('click', () => el.classList.toggle('flipped'));

      // Auto-flip with stagger
      setTimeout(() => el.classList.add('flipped'), 300 + i * 200);

      stage.appendChild(el);
    });

    // Show AI reading button if configured
    const aiBlock = document.getElementById('aiReadingBlock');
    if (aiBlock) {
      aiBlock.style.display = window.AetheriaAPI?.isConfigured?.() ? 'flex' : 'none';
      // Store drawn cards for AI reading
      aiBlock.dataset.cards = JSON.stringify(drawn);
    }

    setupAiReading(drawn, spread);
  }

  function drawLenormand() {
    const stage = document.getElementById('lenormandStage');
    if (!stage) return;

    const deck  = shuffle(lenormandDeck);
    const drawn = deck.slice(0, 3);

    stage.innerHTML = '';
    drawn.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'tarot-card';
      el.innerHTML = `
        <div class="tarot-card-inner">
          <div class="tarot-card-face tarot-card-back">
            <span style="font-size:24px;opacity:0.4">✦</span>
          </div>
          <div class="tarot-card-face tarot-card-front-face" style="transform:rotateY(180deg)">
            <span class="card-emoji">${card.emoji}</span>
            <span class="card-name">${card.name}</span>
          </div>
        </div>
      `;
      el.addEventListener('click', () => el.classList.toggle('flipped'));
      setTimeout(() => el.classList.add('flipped'), 300 + i * 200);
      stage.appendChild(el);
    });
  }

  function setupAiReading(cards, spread) {
    const btn     = document.getElementById('aiReadBtn');
    const textEl  = document.getElementById('aiReadingText');
    if (!btn || !textEl) return;

    btn.onclick = async () => {
      if (!window.AetheriaAPI?.isConfigured?.()) {
        window.AetheriaApp?.showToast?.('请先在设置中配置 AI');
        return;
      }

      const spreadNames = { '1':'单张', '3':'三张（过去/现在/未来）', 'celtic':'凯尔特十字' };
      const cardList = cards.map((c, i) => {
        const pos = ['1':'当下','3':['过去','现在','未来'],'celtic':['当下','挑战','远因','近因','可能','近未来','自我','环境','希望','结果']][spread];
        const label = Array.isArray(pos) ? pos[i] : pos;
        return `${label}：${c.name}（${c.reversed ? '逆位' : '正位'}）`;
      }).join('\n');

      const prompt = `你是一位温柔而深刻的塔罗解读师。请用中文为以下牌阵给出解读，语气温暖，不超过200字。\n\n牌阵：${spreadNames[spread] || spread}\n${cardList}`;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> 解读中...';
      textEl.textContent = '';

      try {
        await window.AetheriaAPI.chat(
          [{ role: 'user', content: prompt }],
          (delta, full) => { textEl.textContent = full; }
        );
      } catch (e) {
        textEl.textContent = '解读失败：' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '✨ AI 解读';
      }
    };
  }

  init();

  return { drawOne, drawSpread, drawLenormand };
})();
/* == END: tarot-init == */
