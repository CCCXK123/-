/* ===== stroop.js — Stroop 色词干扰 =====
   屏幕上出现一个表示颜色的字，但字被涂成另一种颜色。
   需要忽略字义、按「字的墨色」作答（大师档为反向规则）。
   经典抑制控制 / 干扰控制范式。
*/
(function () {
  'use strict';
  var el = UI.el, on = UI.on;

  var COLORS = [
    { key: 'red', name: '红', hex: '#e03131' },
    { key: 'green', name: '绿', hex: '#2f9e44' },
    { key: 'blue', name: '蓝', hex: '#1971c2' },
    { key: 'yellow', name: '黄', hex: '#f08c00' }
  ];

  var LEVELS = [
    { id: 's1', name: '入门', hint: '24 题 · 多数一致 · 2.5s', trials: 24, congruent: 0.8, limit: 2500, rule: 'ink' },
    { id: 's2', name: '标准', hint: '32 题 · 各半 · 2.0s', trials: 32, congruent: 0.5, limit: 2000, rule: 'ink' },
    { id: 's3', name: '困难', hint: '40 题 · 多为冲突 · 1.6s', trials: 40, congruent: 0.2, limit: 1600, rule: 'ink' },
    { id: 's4', name: '大师', hint: '反向规则！按字义选', trials: 40, congruent: 0.0, limit: 1800, rule: 'word' }
  ];

  function mount(host) {
    var wrap = el('div', 'wrap-narrow');
    host.appendChild(wrap);

    wrap.appendChild(el('div', 'game-top', [
      '<div><h1>🎨 Stroop 色词干扰</h1>',
      '<p class="desc">屏幕中央会出现一个<b>表示颜色的字</b>，但它的<b>墨色和字义不一样</b>（比如「红」字被涂成蓝色）。' +
      '你要<b>忽略字义、只按墨色</b>作答。这正是抑制控制最经典的测量方式：大脑自动读字，你必须把这个自动化反应压下去。' +
      '<b>大师档会反转规则</b>，请按提示作答。</p></div>'
    ].join('')));

    var lvRow = el('div', 'levelrow');
    var hud = el('div', 'hud');
    var stage = el('div', 'stage');
    var ruleBar = el('div');
    var wordBox = el('div', 'stroop-word', '—');
    var overlay = el('div', 'overlay');
    var btnGrid = el('div', 'color-btns');

    stage.appendChild(ruleBar);
    stage.appendChild(wordBox);
    stage.appendChild(overlay);
    wrap.appendChild(lvRow);
    wrap.appendChild(hud);
    wrap.appendChild(stage);
    var btnWrap = el('div');
    btnWrap.style.marginTop = '16px';
    btnWrap.appendChild(btnGrid);
    wrap.appendChild(btnWrap);

    var L = LEVELS[0];
    var st = null;
    var tNext = null, tLimit = null, tCount = null;
    var keyHandler = null;

    /* --- 颜色按钮 --- */
    var btns = {};
    COLORS.forEach(function (c) {
      var b = el('button', 'cbtn', c.name);
      b.style.background = c.hex;
      on(b, 'click', function () { answer(c.key); });
      btns[c.key] = b;
      btnGrid.appendChild(b);
    });

    function ruleText() {
      return L.rule === 'ink'
        ? '规则：<b>按「字的颜色」作答</b>，忽略字义'
        : '<b style="color:#e03131">规则反转：按「字的意思」作答</b>，忽略颜色';
    }

    function updateHud() {
      var prog = '0 / ' + L.trials, ok = 0, bad = 0;
      if (st) { prog = Math.min(st.i, L.trials) + ' / ' + L.trials; ok = st.correct; bad = st.wrong + st.timeout; }
      UI.renderHud(hud, [
        { label: '规则', value: L.rule === 'ink' ? '按墨色' : '按字义', cls: 'target' },
        { label: '进度', value: prog },
        { label: '答对', value: ok, cls: 'good' },
        { label: '答错/超时', value: bad, cls: bad > 0 ? 'hot' : '' }
      ]);
    }

    function setRuleBar() {
      ruleBar.innerHTML = '<div style="text-align:center;font-size:13px;font-weight:700;padding:7px 12px;border-radius:9px;background:' +
        (L.rule === 'ink' ? 'var(--primary-soft);color:#2b3f9e' : 'var(--danger-soft);color:#a52525') + '">' + ruleText() + '</div>';
    }

    function buildQueue() {
      var q = [];
      for (var i = 0; i < L.trials; i++) {
        var ink = COLORS[UI.randInt(4)];
        var word;
        if (Math.random() < L.congruent) {
          word = ink;
        } else {
          do { word = COLORS[UI.randInt(4)]; } while (word.key === ink.key);
        }
        q.push({ ink: ink, word: word, congruent: ink.key === word.key });
      }
      return q;
    }

    function showTrial() {
      if (!st || !st.running) return;
      if (st.i >= st.queue.length) { finish(); return; }

      var q = st.queue[st.i];
      st.cur = q;
      st.answered = false;
      st.start = performance.now();

      wordBox.textContent = q.word.name;
      wordBox.style.color = q.ink.hex;
      wordBox.style.transform = 'scale(1)';
      wordBox.style.opacity = '1';
      updateHud();

      clearTimeout(tLimit);
      tLimit = setTimeout(function () {
        if (!st || !st.running || st.answered) return;
        st.answered = true;
        st.timeout++;
        flash('⏱ 超时', '#e8590c');
        nextAfter();
      }, L.limit);
    }

    function flash(text, color) {
      wordBox.style.transition = 'none';
      wordBox.style.opacity = '.35';
      wordBox.textContent = text;
      wordBox.style.color = color;
      setTimeout(function () {
        wordBox.style.opacity = '1';
      }, 260);
    }

    function answer(key) {
      if (!st || !st.running || st.answered) return;
      var q = st.cur;
      var correctKey = L.rule === 'ink' ? q.ink.key : q.word.key;
      st.answered = true;
      clearTimeout(tLimit);
      var rt = performance.now() - st.start;

      if (key === correctKey) {
        st.correct++;
        st.rts.push({ rt: rt, congruent: q.congruent });
        flash('✓', '#0ca678');
      } else {
        st.wrong++;
        flash('✗', '#e03131');
      }
      updateHud();
      nextAfter();
    }

    function nextAfter() {
      setTimeout(function () {
        if (!st || !st.running) return;
        st.i++;
        wordBox.style.transition = 'opacity .12s';
        if (st.i >= st.queue.length) { finish(); return; }
        showTrial();
      }, 330);
    }

    function finish() {
      st.running = false;
      clearTimeout(tLimit); clearTimeout(tNext);
      var total = st.correct + st.wrong + st.timeout;
      var acc = UI.pct(st.correct, total);
      var allRt = st.rts.map(function (x) { return x.rt; });
      var avgRt = allRt.length ? allRt.reduce(function (a, b) { return a + b; }, 0) / allRt.length : 0;
      var con = st.rts.filter(function (x) { return x.congruent; }).map(function (x) { return x.rt; });
      var inc = st.rts.filter(function (x) { return !x.congruent; }).map(function (x) { return x.rt; });
      var mean = function (a) { return a.length ? a.reduce(function (p, c) { return p + c; }, 0) / a.length : 0; };
      var cost = (con.length && inc.length) ? (mean(inc) - mean(con)) : null;

      Store.addRecord('stroop', {
        level: L.id, levelName: L.name, trials: total, acc: acc,
        correct: st.correct, wrong: st.wrong, timeout: st.timeout,
        rt: Math.round(avgRt), cost: cost === null ? null : Math.round(cost)
      });

      var grade, cls;
      if (acc >= 95) { grade = '优秀 — 干扰抑制能力很强'; cls = 'g'; }
      else if (acc >= 85) { grade = '良好 — 属于正常偏上水平'; cls = 'g'; }
      else if (acc >= 70) { grade = '一般 — 属于大多数人的区间'; cls = ''; }
      else { grade = '偏弱 — 建议降一档难度，先保证准确率'; cls = 'r'; }

      var verdict = '<b>' + grade + '</b>';
      if (cost !== null) {
        verdict += '<br>你的<b>冲突代价</b>（不一致条件反应时 − 一致条件反应时）为 <b>' + Math.round(cost) + 'ms</b>。' +
          '这是 Stroop 效应的核心指标：数值越大，说明字义对你的干扰越强、需要花更多时间才能压制住它。' +
          (cost > 200 ? ' 这个值偏高，说明自动化的读字反应占了较大优势。' : ' 这个值比较小，说明你的干扰抑制效率不错。');
      }

      UI.clear(overlay);
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: 'Stroop 完成 · ' + L.name,
        sub: '共 ' + total + ' 题 · 规则：' + (L.rule === 'ink' ? '按墨色' : '按字义'),
        stats: [
          { label: '正确率', value: acc + '%', cls: cls },
          { label: '答对', value: st.correct, cls: 'g' },
          { label: '答错', value: st.wrong, cls: st.wrong ? 'r' : '' },
          { label: '超时', value: st.timeout, cls: st.timeout ? 'r' : '' },
          { label: '平均反应时', value: avgRt ? Math.round(avgRt) + 'ms' : '—' },
          { label: '冲突代价', value: cost === null ? '—' : Math.round(cost) + 'ms', cls: cost !== null && cost > 200 ? 'r' : 'g' }
        ],
        verdict: verdict,
        actions: [
          { label: '再来一轮', cls: 'ok', fn: begin },
          { label: '换难度', cls: 'sec', fn: function () { UI.clear(overlay); overlay.classList.add('hidden'); showIntro(); } },
          { label: '查看记录', cls: 'sec', fn: function () { App.go('#/history'); } }
        ]
      }));
    }

    function begin() {
      clearTimeout(tLimit); clearTimeout(tNext); clearTimeout(tCount);
      st = { running: false, i: 0, correct: 0, wrong: 0, timeout: 0, rts: [], queue: buildQueue() };
      wordBox.textContent = '准备';
      wordBox.style.color = 'var(--muted)';
      overlay.classList.add('hidden');
      updateHud();
      var n = 3;
      (function cd() {
        if (n > 0) {
          wordBox.textContent = String(n);
          wordBox.style.color = 'var(--primary)';
          n--;
          tCount = setTimeout(cd, 700);
        } else {
          st.running = true;
          showTrial();
        }
      })();
    }

    function showIntro(msg) {
      clearTimeout(tLimit); clearTimeout(tNext); clearTimeout(tCount);
      if (st) st.running = false;
      wordBox.textContent = '示例';
      wordBox.style.color = '#1971c2';
      overlay.classList.add('hidden');
      setRuleBar();
      updateHud();
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: 'Stroop · ' + L.name,
        sub: L.hint,
        stats: [
          { label: '题数', value: L.trials },
          { label: '冲突题占比', value: Math.round((1 - L.congruent) * 100) + '%', cls: 'r' },
          { label: '单题限时', value: (L.limit / 1000).toFixed(1) + 's' },
          { label: '规则', value: L.rule === 'ink' ? '按墨色' : '按字义', cls: 'p' }
        ],
        verdict: msg || (L.rule === 'ink'
          ? '看到字后，<b>只按它的颜色</b>点下方对应按钮，别管写的是什么字。'
          : '<b>注意：本档规则反转。</b>看到字后，按<b>它写的是什么颜色</b>点按钮，忽略字体被涂成什么颜色。'),
        actions: [{ label: '开始训练', cls: 'ok', fn: begin }]
      }));
    }

    function renderLevels() {
      UI.clear(lvRow);
      LEVELS.forEach(function (lv) {
        var b = el('button', 'lv' + (lv.id === L.id ? ' on' : ''), lv.name + '<small>' + lv.hint + '</small>');
        b.style.lineHeight = '1.25';
        on(b, 'click', function () {
          L = lv; clearTimeout(tLimit); clearTimeout(tCount);
          if (st) st.running = false;
          renderLevels(); showIntro();
        });
        lvRow.appendChild(b);
      });
    }

    /* 键盘：1-4 对应四个颜色按钮 */
    keyHandler = function (e) {
      if (!st || !st.running) return;
      var map = { '1': 0, '2': 1, '3': 2, '4': 3 };
      if (map[e.key] !== undefined) { e.preventDefault(); answer(COLORS[map[e.key]].key); }
    };
    on(document, 'keydown', keyHandler);

    function onVis() {
      if (!st || !st.running) return;
      if (document.hidden) {
        st.running = false;
        clearTimeout(tLimit);
        UI.clear(overlay);
        overlay.classList.remove('hidden');
        overlay.appendChild(UI.resultPanel({
          title: '已暂停',
          sub: '切到后台时本题作废，本次不计入记录',
          actions: [
            { label: '重新开始', cls: 'ok', fn: begin },
            { label: '返回说明', cls: 'sec', fn: function () { showIntro(); } }
          ]
        }));
      }
    }
    on(document, 'visibilitychange', onVis);

    setRuleBar();
    renderLevels();
    updateHud();
    showIntro();

    return function cleanup() {
      clearTimeout(tLimit); clearTimeout(tNext); clearTimeout(tCount);
      if (st) st.running = false;
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('visibilitychange', onVis);
    };
  }

  App.register({
    id: 'stroop',
    name: 'Stroop 色词干扰',
    icon: '🎨',
    tag: '抑制控制 · 干扰控制',
    desc: '字义与墨色冲突，要求忽略字义按颜色作答。含「冲突代价」指标，大师档为反向规则。',
    bestText: function (list) {
      var b = null;
      list.forEach(function (r) { if (!b || r.acc > b.acc) b = r; });
      return b ? '最高正确率 ' + b.acc + '%（' + b.levelName + '）' : '暂无成绩';
    },
    recordText: function (r) {
      return '正确率 ' + r.acc + '% · 答对 ' + r.correct + ' · 错 ' + r.wrong + ' · 超时 ' + r.timeout +
        ' · RT ' + r.rt + 'ms' + (r.cost === null || r.cost === undefined ? '' : ' · 冲突代价 ' + r.cost + 'ms');
    },
    mount: mount
  });
})();
