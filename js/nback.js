/* ===== nback.js — N-back 工作记忆 =====
   逐个呈现刺激，判断「当前刺激是否与 N 步之前相同」。
   经典工作记忆更新任务（Jaeggi 等 2008 使用的范式家族）。
*/
(function () {
  'use strict';
  var el = UI.el, on = UI.on;

  var LETTERS = ['B', 'C', 'F', 'H', 'K', 'M', 'R', 'T'];

  var LEVELS = [
    { id: 'n1', name: '1-back 字母', hint: 'N=1 · 单通道', n: 1, vis: 1600, isi: 750, trials: 28, mode: 'letter' },
    { id: 'n2', name: '2-back 字母', hint: 'N=2 · 单通道', n: 2, vis: 1800, isi: 750, trials: 30, mode: 'letter' },
    { id: 'n3', name: '3-back 字母', hint: 'N=3 · 明显更难', n: 3, vis: 2000, isi: 800, trials: 32, mode: 'letter' },
    { id: 'sp2', name: '2-back 位置', hint: 'N=2 · 空间通道', n: 2, vis: 1400, isi: 650, trials: 32, mode: 'spatial' }
  ];

  function genSeq(total, n, alphabet, matchRate) {
    var seq = [];
    for (var i = 0; i < total; i++) {
      if (i >= n && Math.random() < matchRate) {
        seq.push(seq[i - n]);
      } else {
        var v;
        var guard = 0;
        do { v = UI.pick(alphabet); guard++; }
        while (i >= n && v === seq[i - n] && guard < 50);
        if (i >= n && v === seq[i - n]) v = alphabet[(alphabet.indexOf(v) + 1) % alphabet.length];
        seq.push(v);
      }
    }
    return seq;
  }

  function mount(host) {
    var wrap = el('div', 'wrap-narrow');
    host.appendChild(wrap);

    wrap.appendChild(el('div', 'game-top', [
      '<div><h1>🧮 N-back 工作记忆</h1>',
      '<p class="desc">刺激会一个一个出现。如果<b>当前这个和 N 步之前那个相同</b>，就立刻按「相同」；否则什么都不用做。' +
      '这是认知神经科学里最常用的工作记忆更新范式。请忍住「不确定就按一下」的冲动——误报会直接扣准确率。</p></div>'
    ].join('')));

    var lvRow = el('div', 'levelrow');
    var hud = el('div', 'hud');
    var stage = el('div', 'stage');
    var arena = el('div');
    var overlay = el('div', 'overlay');
    var feedback = el('div');
    feedback.style.cssText = 'text-align:center;font-size:13px;font-weight:700;min-height:22px;margin-top:8px;color:var(--muted)';

    stage.appendChild(arena);
    stage.appendChild(feedback);
    stage.appendChild(overlay);
    wrap.appendChild(lvRow);
    wrap.appendChild(hud);
    wrap.appendChild(stage);

    var btnRow = el('div', 'btnrow');
    btnRow.style.cssText = 'margin-top:14px;justify-content:center';
    var btnYes = el('button', 'btn ok', '相同（按 空格）');
    btnYes.disabled = true;
    on(btnYes, 'click', respond);
    btnRow.appendChild(btnYes);
    wrap.appendChild(btnRow);

    wrap.appendChild(el('div', 'note info',
      '提示：从第 ' + 'N+1' + ' 个刺激开始才可能构成匹配。开局几个刺激用于建立记忆，不计分。'));

    var L = LEVELS[0];
    var st = null;
    var seq = null;
    var tShow = null, tNext = null, tCount = null;
    var alive = true;
    var keyHandler = null;

    function updateHud() {
      var prog = '0 / ' + (L.trials - L.n), hits = 0, fa = 0;
      if (st) {
        prog = Math.max(0, Math.min(st.scored, L.trials - L.n)) + ' / ' + (L.trials - L.n);
        hits = st.hits; fa = st.fa;
      }
      UI.renderHud(hud, [
        { label: '规则', value: L.n + '-back', cls: 'target' },
        { label: '进度', value: prog },
        { label: '命中', value: hits, cls: 'good' },
        { label: '误报', value: fa, cls: fa > 0 ? 'hot' : '' }
      ]);
    }

    function renderStim(i) {
      var v = seq[i];
      if (L.mode === 'letter') {
        arena.innerHTML = '<div class="nb-letter">' + v + '</div>';
        arena.firstChild.style.cssText =
          'background:var(--surface2);border:1px solid var(--border);border-radius:12px;min-height:230px';
      } else {
        if (!arena.firstChild || arena.firstChild.className !== 'nb-arena') {
          UI.clear(arena);
          var g = el('div', 'nb-arena');
          g.style.gridTemplateColumns = 'repeat(3,1fr)';
          for (var k = 0; k < 9; k++) {
            var c = el('div', 'nb-cell');
            c.style.minHeight = '0';
            g.appendChild(c);
          }
          arena.appendChild(g);
        }
        var cells = arena.querySelectorAll('.nb-cell');
        Array.prototype.forEach.call(cells, function (c) { c.classList.remove('on'); });
        cells[v].classList.add('on');
      }
    }

    function clearStim() {
      if (L.mode === 'letter') {
        arena.innerHTML = '<div class="nb-letter" style="color:#ccd5e4">·</div>';
        arena.firstChild.style.cssText =
          'background:var(--surface2);border:1px solid var(--border);border-radius:12px;min-height:230px';
      } else {
        var cells = arena.querySelectorAll('.nb-cell');
        Array.prototype.forEach.call(cells, function (c) { c.classList.remove('on'); });
      }
    }

    function respond() {
      if (!st || !st.running || st.responded || st.curIdx < 0) return;
      st.responded = true;
      st.rt.push(performance.now() - st.stimStart);
      btnYes.classList.add('pop');
      setTimeout(function () { btnYes.classList.remove('pop'); }, 120);
    }

    function evaluate(i) {
      if (i < L.n) { st.scored = 0; return; }
      var isMatch = seq[i] === seq[i - L.n];
      if (isMatch && st.responded) { st.hits++; feedback.innerHTML = '<span style="color:var(--accent)">✓ 正确命中</span>'; }
      else if (isMatch && !st.responded) { st.miss++; feedback.innerHTML = '<span style="color:var(--danger)">✗ 漏报：这里应该按「相同」</span>'; }
      else if (!isMatch && st.responded) { st.fa++; feedback.innerHTML = '<span style="color:var(--danger)">✗ 误报：它和 ' + L.n + ' 步前不一样</span>'; }
      else { st.cr++; feedback.innerHTML = '<span style="color:var(--muted)">· 正确忍住</span>'; }
      st.scored++;
    }

    function nextTrial() {
      if (!alive || !st || !st.running) return;
      if (st.curIdx >= seq.length - 1) { finish(); return; }

      st.curIdx++;
      st.responded = false;
      st.stimStart = performance.now();
      renderStim(st.curIdx);
      btnYes.disabled = false;
      updateHud();

      tShow = setTimeout(function () { clearStim(); }, L.vis);
      tNext = setTimeout(function () {
        evaluate(st.curIdx);
        tShow = setTimeout(function () { nextTrial(); }, L.isi);
      }, L.vis);
    }

    function startTask() {
      st = { running: true, curIdx: -1, responded: false, hits: 0, miss: 0, fa: 0, cr: 0, scored: 0, rt: [], stimStart: 0 };
      UI.clear(feedback);
      nextTrial();
    }

    function countdown(n) {
      UI.clear(overlay);
      overlay.classList.remove('hidden');
      overlay.innerHTML = '<h3>准备</h3><div class="big">' + n + '</div><p>刺激即将开始，按空格或点按钮表示「与 ' + L.n + ' 步前相同」</p>';
      if (n > 1) {
        tCount = setTimeout(function () { countdown(n - 1); }, 800);
      } else {
        tCount = setTimeout(function () {
          overlay.classList.add('hidden');
          startTask();
        }, 800);
      }
    }

    function finish() {
      if (st) st.running = false;
      btnYes.disabled = true;
      clearStim();
      stopAll();
      var scored = L.trials - L.n;
      var correct = st.hits + st.cr;
      var acc = UI.pct(correct, st.scored || scored);
      var avgRt = st.rt.length ? st.rt.reduce(function (a, b) { return a + b; }, 0) / st.rt.length : 0;

      Store.addRecord('nback', {
        level: L.id, levelName: L.name, n: L.n, acc: acc,
        hits: st.hits, miss: st.miss, fa: st.fa, correct: correct,
        rt: Math.round(avgRt)
      });

      var grade, cls;
      if (acc >= 90) { grade = '优秀 — 工作记忆更新能力很好，可以挑战 ' + (L.n + 1) + '-back'; cls = 'g'; }
      else if (acc >= 80) { grade = '良好 — 属于正常偏上水平'; cls = 'g'; }
      else if (acc >= 70) { grade = '一般 — 属于大多数人的区间，继续练同一档'; cls = ''; }
      else { grade = '偏弱 — 建议先降到低一档，把准确率稳定在 85% 以上再升'; cls = 'r'; }

      UI.clear(overlay);
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: 'N-back 完成 · ' + L.n + '-back',
        sub: '本次共 ' + scored + ' 个计分刺激',
        stats: [
          { label: '准确率', value: acc + '%', cls: cls },
          { label: '命中 / 目标', value: st.hits + ' / ' + st.hits + st.miss, cls: 'g' },
          { label: '漏报', value: st.miss, cls: st.miss ? 'r' : '' },
          { label: '误报', value: st.fa, cls: st.fa ? 'r' : '' },
          { label: '平均反应时', value: avgRt ? Math.round(avgRt) + 'ms' : '—' }
        ],
        verdict: '<b>' + grade + '</b><br>建议把准确率稳定在 <b>85–90%</b> 再升难度：太高说明太简单、太低说明负荷超了，两者都不利于训练效果。',
        actions: [
          { label: '再来一轮', cls: 'ok', fn: begin },
          { label: '换难度', cls: 'sec', fn: function () { UI.clear(overlay); overlay.classList.add('hidden'); showIntro(); } },
          { label: '查看记录', cls: 'sec', fn: function () { App.go('#/history'); } }
        ]
      }));
    }

    function stopAll() {
      clearTimeout(tShow); clearTimeout(tNext); clearTimeout(tCount);
      tShow = tNext = tCount = null;
    }

    function begin() {
      stopAll();
      var alphabet = L.mode === 'letter' ? LETTERS : [0, 1, 2, 3, 4, 5, 6, 7, 8];
      seq = genSeq(L.trials, L.n, alphabet, 0.32);
      st = null;
      UI.clear(feedback);
      updateHud();
      countdown(3);
    }

    function showIntro(msg) {
      stopAll();
      btnYes.disabled = true;
      UI.clear(overlay);
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: 'N-back · ' + L.n + '-back' + (L.mode === 'spatial' ? '（位置）' : '（字母）'),
        sub: L.hint + ' · 共 ' + L.trials + ' 个刺激',
        stats: [
          { label: '记忆步长 N', value: L.n, cls: 'p' },
          { label: '呈现时长', value: L.vis + 'ms' },
          { label: '间隔', value: L.isi + 'ms' },
          { label: '计分题数', value: L.trials - L.n }
        ],
        verdict: msg || (L.mode === 'spatial'
          ? '记住每个光点出现的<b>位置</b>。当它与 <b>' + L.n + ' 步前</b>的位置相同时，按「相同」。'
          : '记住每个<b>字母</b>。当它与 <b>' + L.n + ' 步前</b>的字母相同时，按「相同」。') +
          '<br>开局 ' + L.n + ' 个刺激用于建立记忆，不计分。',
        actions: [{ label: '开始训练', cls: 'ok', fn: begin }]
      }));
    }

    function renderLevels() {
      UI.clear(lvRow);
      LEVELS.forEach(function (lv) {
        var b = el('button', 'lv' + (lv.id === L.id ? ' on' : ''), lv.name + '<small>' + lv.hint + '</small>');
        b.style.lineHeight = '1.25';
        on(b, 'click', function () {
          L = lv; stopAll();
          if (st) st.running = false;
          renderLevels(); showIntro();
        });
        lvRow.appendChild(b);
      });
    }

    keyHandler = function (e) {
      if (e.code === 'Space' || e.key === ' ') {
        if (st && st.running) { e.preventDefault(); respond(); }
      }
    };
    on(document, 'keydown', keyHandler);

    function onVis() {
      if (!st || !st.running) return;
      if (document.hidden) {
        stopAll();
        st.running = false;
        btnYes.disabled = true;
        UI.clear(overlay);
        overlay.classList.remove('hidden');
        overlay.appendChild(UI.resultPanel({
          title: '已暂停',
          sub: '切到后台时任务自动中断，本次不计入记录',
          actions: [
            { label: '重新开始', cls: 'ok', fn: begin },
            { label: '返回说明', cls: 'sec', fn: function () { showIntro(); } }
          ]
        }));
      }
    }
    on(document, 'visibilitychange', onVis);

    renderLevels();
    showIntro();

    return function cleanup() {
      alive = false;
      stopAll();
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('visibilitychange', onVis);
    };
  }

  App.register({
    id: 'nback',
    name: 'N-back 工作记忆',
    icon: '🧮',
    tag: '工作记忆 · 信息更新',
    desc: '判断当前刺激是否与 N 步之前相同。1-back 至 3-back，含字母与空间位置两种通道。',
    bestText: function (list) {
      var b = null;
      list.forEach(function (r) { if (!b || r.acc > b.acc) b = r; });
      return b ? '最高准确率 ' + b.acc + '%（' + b.levelName + '）' : '暂无成绩';
    },
    recordText: function (r) {
      return '准确率 ' + r.acc + '% · 命中 ' + r.hits + ' · 漏报 ' + r.miss + ' · 误报 ' + r.fa + ' · RT ' + r.rt + 'ms';
    },
    mount: mount
  });
})();
