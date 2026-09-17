/* ===== gonogo.js — Go / No-Go 反应抑制 =====
   绿色出现就尽快点，红色出现要忍住。
   测量反应抑制（冲动控制）的经典范式；大师档为反向规则。
*/
(function () {
  'use strict';
  var el = UI.el, on = UI.on;

  var LEVELS = [
    { id: 'g1', name: '入门', hint: '绿点红忍 · 1.0s 窗口', trials: 24, goRatio: 0.7, win: 1000, reversed: false },
    { id: 'g2', name: '标准', hint: '窗口缩到 0.85s', trials: 24, goRatio: 0.7, win: 850, reversed: false },
    { id: 'g3', name: '困难', hint: '0.75s · 更多红灯', trials: 30, goRatio: 0.6, win: 750, reversed: false },
    { id: 'g4', name: '大师', hint: '反向！红点绿忍', trials: 30, goRatio: 0.5, win: 750, reversed: true }
  ];

  function mount(host) {
    var wrap = el('div', 'wrap-narrow');
    host.appendChild(wrap);

    wrap.appendChild(el('div', 'game-top', [
      '<div><h1>🚦 Go / No-Go 反应抑制</h1>',
      '<p class="desc">屏幕中央会随机出现圆点。<b>看到绿色就尽快点击（或按空格）</b>，<b>看到红色就什么都不做</b>。' +
      '红色出现的瞬间想点又忍住了，这个「忍住」的过程就是前额叶在做功。' +
      '按红灯等于记录一次<b>冲动错误</b>。<b>大师档规则反转。</b></p></div>'
    ].join('')));

    var lvRow = el('div', 'levelrow');
    var hud = el('div', 'hud');
    var stage = el('div', 'stage');
    var ruleBar = el('div');
    var arena = el('div', 'gn-arena');
    var shape = el('div', 'gn-shape idle', '＋');
    var fb = el('div');
    fb.style.cssText = 'position:absolute;bottom:14px;left:0;right:0;text-align:center;font-size:14px;font-weight:800;pointer-events:none';
    var overlay = el('div', 'overlay');
    arena.appendChild(shape);
    arena.appendChild(fb);
    stage.appendChild(ruleBar);
    stage.appendChild(arena);
    stage.appendChild(overlay);
    wrap.appendChild(lvRow);
    wrap.appendChild(hud);
    wrap.appendChild(stage);
    wrap.appendChild(el('div', 'note info',
      '实操提示：<b>手一直准备好</b>，但不要预先按下——Go/No-Go 的关键恰在于「先准备好、再根据刺激决定要不要动手」。' +
      '<b>优先保证不按错红灯</b>，速度是第二位的。'));

    var L = LEVELS[0];
    var st = null;
    var tStep = null, tWin = null, tCount = null;
    var keyHandler = null;

    function goColor() { return L.reversed ? 'red' : 'green'; }
    function ruleText() {
      return L.reversed
        ? '<b style="color:#e03131">规则反转：红色 = 点！绿色 = 忍住！</b>'
        : '规则：<b>绿色 → 立刻点</b>　|　<b>红色 → 什么都不做</b>';
    }
    function setRuleBar() {
      ruleBar.innerHTML = '<div style="text-align:center;font-size:13px;font-weight:700;padding:7px 12px;border-radius:9px;margin-bottom:10px;background:' +
        (L.reversed ? 'var(--danger-soft);color:#a52525' : 'var(--primary-soft);color:#2b3f9e') + '">' + ruleText() + '</div>';
    }

    function updateHud() {
      var prog = '0 / ' + L.trials, ok = 0, com = 0;
      if (st) { prog = Math.min(st.i, L.trials) + ' / ' + L.trials; ok = st.hit + st.cr; com = st.commission; }
      UI.renderHud(hud, [
        { label: '规则', value: L.reversed ? '红点绿忍' : '绿点红忍', cls: 'target' },
        { label: '进度', value: prog },
        { label: '正确', value: ok, cls: 'good' },
        { label: '冲动错误', value: com, cls: com > 0 ? 'hot' : '' }
      ]);
    }

    function buildQueue() {
      var n = L.trials;
      var nGo = Math.round(n * L.goRatio);
      var arr = [];
      for (var i = 0; i < n; i++) arr.push(i < nGo ? 1 : 0);
      UI.shuffle(arr);
      return arr;
    }

    function setShape(kind, text) {
      shape.className = 'gn-shape ' + kind;
      shape.textContent = text;
      shape.style.transform = 'scale(1)';
    }

    function nextTrial() {
      if (!st || !st.running) return;
      if (st.i >= st.queue.length) { finish(); return; }

      // 注视点
      setShape('idle', '＋');
      fb.textContent = '';
      var fix = 220 + UI.randInt(330);

      tStep = setTimeout(function () {
        if (!st || !st.running) return;
        var isGo = st.queue[st.i] === 1;
        st.curIsGo = isGo;
        st.responded = false;
        st.start = performance.now();
        setShape(isGo ? goColor() : (goColor() === 'green' ? 'nogo' : 'go'),
          isGo ? (L.reversed ? '点我' : '点我') : '别点');
        shape.classList.add('pop');
        updateHud();

        tWin = setTimeout(function () {
          // 窗口结束，结算
          st.start = 0;
          if (isGo && st.responded) { st.hit++; fb.innerHTML = '<span style="color:var(--accent)">✓</span>'; }
          else if (isGo && !st.responded) { st.miss++; fb.innerHTML = '<span style="color:var(--danger)">✗ 漏报：绿灯要点的</span>'; }
          else if (!isGo && st.responded) { st.commission++; fb.innerHTML = '<span style="color:var(--danger)">✗ 冲动！红灯不该点</span>'; }
          else { st.cr++; fb.innerHTML = '<span style="color:var(--muted)">· 成功忍住</span>'; }
          st.i++;
          updateHud();
          setShape('idle', '＋');
          tStep = setTimeout(nextTrial, 180);
        }, L.win);
      }, fix);
    }

    function respond() {
      if (!st || !st.running || st.responded) return;
      if (!st.start) return;               // 只在刺激呈现窗口内响应
      st.responded = true;
      st.rt.push(performance.now() - st.start);
      shape.style.transform = 'scale(.92)';
      setTimeout(function () { shape.style.transform = 'scale(1)'; }, 90);
    }

    function finish() {
      st.running = false;
      clearTimeout(tStep); clearTimeout(tWin);
      setShape('idle', '＋');
      var total = st.hit + st.miss + st.commission + st.cr;
      var acc = UI.pct(st.hit + st.cr, total);
      var nogo = st.commission + st.cr;
      var avgRt = st.rt.length ? st.rt.reduce(function (a, b) { return a + b; }, 0) / st.rt.length : 0;
      var impulsivity = nogo ? UI.pct(st.commission, nogo) : 0;

      Store.addRecord('gonogo', {
        level: L.id, levelName: L.name, acc: acc,
        hit: st.hit, miss: st.miss, commission: st.commission, cr: st.cr,
        impulsivity: impulsivity, rt: Math.round(avgRt)
      });

      var grade, cls;
      if (acc >= 93) { grade = '优秀 — 反应与抑制的平衡把握得很好'; cls = 'g'; }
      else if (acc >= 85) { grade = '良好 — 属于正常偏上水平'; cls = 'g'; }
      else if (acc >= 72) { grade = '一般 — 属于大多数人的区间'; cls = ''; }
      else { grade = '偏弱 — 建议降一档，先把冲动错误压下来'; cls = 'r'; }

      var mv = '';
      if (st.commission > 4) mv = '你的<b>冲动错误偏多（' + st.commission + ' 次）</b>，说明看到刺激时有「先按了再说」的倾向。这是最能被训练的部分：试着在心里默念「看清楚颜色再决定」。';
      else if (st.miss > 4) mv = '你的<b>漏报偏多（' + st.miss + ' 次）</b>，说明反应偏保守或注意力有飘移。可以尝试在绿灯亮起前保持轻度的预备状态。';
      else mv = '冲动错误与漏报控制得比较均衡，抑制与反应之间的取舍做得不错。';

      UI.clear(overlay);
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: 'Go / No-Go 完成 · ' + L.name,
        sub: '共 ' + total + ' 个试次' + (L.reversed ? ' · 反向规则' : ''),
        stats: [
          { label: '总正确率', value: acc + '%', cls: cls },
          { label: '命中(Go)', value: st.hit, cls: 'g' },
          { label: '漏报', value: st.miss, cls: st.miss ? 'r' : '' },
          { label: '冲动错误', value: st.commission, cls: st.commission ? 'r' : '' },
          { label: '成功忍住', value: st.cr, cls: 'g' },
          { label: 'Go 平均反应时', value: avgRt ? Math.round(avgRt) + 'ms' : '—' }
        ],
        verdict: '<b>' + grade + '</b><br>' + mv + '<br>其中<b>冲动错误率</b>（红灯误按 / 红灯总数）= <b>' + impulsivity + '%</b>，这个数字越低，说明反应抑制能力越强。',
        actions: [
          { label: '再来一轮', cls: 'ok', fn: begin },
          { label: '换难度', cls: 'sec', fn: function () { UI.clear(overlay); overlay.classList.add('hidden'); showIntro(); } },
          { label: '查看记录', cls: 'sec', fn: function () { App.go('#/history'); } }
        ]
      }));
    }

    function begin() {
      clearTimeout(tStep); clearTimeout(tWin); clearTimeout(tCount);
      st = { running: false, i: 0, hit: 0, miss: 0, commission: 0, cr: 0, rt: [], queue: buildQueue(), start: 0, responded: false, curIsGo: false };
      overlay.classList.add('hidden');
      updateHud();
      var n = 3;
      (function cd() {
        if (n > 0) {
          setShape('idle', String(n));
          n--;
          tCount = setTimeout(cd, 700);
        } else {
          st.running = true;
          nextTrial();
        }
      })();
    }

    function showIntro(msg) {
      clearTimeout(tStep); clearTimeout(tWin); clearTimeout(tCount);
      if (st) st.running = false;
      setShape('idle', '＋');
      fb.textContent = '';
      setRuleBar();
      updateHud();
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: 'Go / No-Go · ' + L.name,
        sub: L.hint + ' · 共 ' + L.trials + ' 个试次',
        stats: [
          { label: '试次数', value: L.trials },
          { label: '「点」的比例', value: Math.round(L.goRatio * 100) + '%' },
          { label: '反应窗口', value: (L.win / 1000).toFixed(2) + 's' },
          { label: '规则', value: L.reversed ? '反向' : '常规', cls: L.reversed ? 'r' : '' }
        ],
        verdict: msg || (L.reversed
          ? '<b style="color:#e03131">本档规则反转：看到红色要立刻点，看到绿色要忍住。</b>'
          : '看到<b style="color:#0ca678">绿色</b>尽快点击（或按空格），看到<b style="color:#e03131">红色</b>什么都不做。'),
        actions: [{ label: '开始训练', cls: 'ok', fn: begin }]
      }));
    }

    function renderLevels() {
      UI.clear(lvRow);
      LEVELS.forEach(function (lv) {
        var b = el('button', 'lv' + (lv.id === L.id ? ' on' : ''), lv.name + '<small>' + lv.hint + '</small>');
        b.style.lineHeight = '1.25';
        on(b, 'click', function () {
          L = lv; clearTimeout(tStep); clearTimeout(tWin); clearTimeout(tCount);
          if (st) st.running = false;
          renderLevels(); showIntro();
        });
        lvRow.appendChild(b);
      });
    }

    on(arena, 'pointerdown', function (e) { e.preventDefault(); respond(); });
    keyHandler = function (e) {
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (!st || !st.running) return;
      e.preventDefault();
      respond();
    };
    on(document, 'keydown', keyHandler);

    function onVis() {
      if (!st || !st.running) return;
      if (document.hidden) {
        st.running = false;
        clearTimeout(tStep); clearTimeout(tWin);
        UI.clear(overlay);
        overlay.classList.remove('hidden');
        overlay.appendChild(UI.resultPanel({
          title: '已暂停',
          sub: '切到后台时任务中断，本次不计入记录',
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
      clearTimeout(tStep); clearTimeout(tWin); clearTimeout(tCount);
      if (st) st.running = false;
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('visibilitychange', onVis);
    };
  }

  App.register({
    id: 'gonogo',
    name: 'Go / No-Go 反应抑制',
    icon: '🚦',
    tag: '抑制控制 · 冲动控制',
    desc: '绿点就点、红点忍住。测量反应抑制与冲动控制，输出「冲动错误率」指标，大师档反向规则。',
    bestText: function (list) {
      var b = null;
      list.forEach(function (r) { if (!b || r.acc > b.acc) b = r; });
      return b ? '最高正确率 ' + b.acc + '%（' + b.levelName + '，冲动错误 ' + b.commission + '）' : '暂无成绩';
    },
    recordText: function (r) {
      return '正确率 ' + r.acc + '% · 命中 ' + r.hit + ' · 漏报 ' + r.miss + ' · 冲动错误 ' + r.commission +
        ' · 忍住 ' + r.cr + ' · RT ' + r.rt + 'ms';
    },
    mount: mount
  });
})();
