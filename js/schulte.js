/* ===== schulte.js — 舒尔特方格 =====
   经典注意力训练：按 1→N² 顺序点击方格中的数字。
   训练注意力的稳定性、广度、分配与转移。
*/
(function () {
  'use strict';
  var el = UI.el, on = UI.on;

  /* 目标基线参考：一般以「每个字符约 1 秒」为优良水平 */
  var LEVELS = [
    { id: 'g3', name: '3×3', n: 3, target: 9 },
    { id: 'g4', name: '4×4', n: 4, target: 16 },
    { id: 'g5', name: '5×5', n: 5, target: 25 },
    { id: 'g6', name: '6×6', n: 6, target: 36 }
  ];

  function mount(host) {
    var wrap = el('div', 'wrap-narrow');
    host.appendChild(wrap);

    wrap.appendChild(el('div', 'game-top', [
      '<div><h1>🔢 舒尔特方格</h1>',
      '<p class="desc">按 <b>1 → N²</b> 的顺序依次点击方格中的数字，用时越短越好。' +
      '这是飞行员的经典注意力训练法，同时锻炼注意力的广度、分配与转移。' +
      '点过的格子<b>不会变色</b>——靠自己的记忆和余光继续找下一个，更接近真实训练要求。' +
      '点击错误会记一次失误并抖动提示。</p></div>'
    ].join('')));

    var lvRow = el('div', 'levelrow');
    var hud = el('div', 'hud');
    var stage = el('div', 'stage');
    var grid = el('div', 'schulte-grid');
    var overlay = el('div', 'overlay');
    stage.appendChild(grid);
    stage.appendChild(overlay);
    wrap.appendChild(lvRow);
    wrap.appendChild(hud);
    wrap.appendChild(stage);
    wrap.appendChild(el('div', 'note info',
      '<b>参考基线：</b>通行经验以「每个数字约 1 秒」为优良（即 5×5 约 25 秒）。' +
      '据公开资料，我国飞行员 5×5 平均用时在 6.25 秒以内。需注意这类数字是训练实践经验值，<b>不是严格的心理学常模</b>，仅供参考。'));

    var L = LEVELS[1];
    var st = null;
    var raf = null, lastT = 0;

    function fmtCount(ms) {
      var s = ms / 1000;
      return s.toFixed(1) + 's';
    }

    function updateHud() {
      UI.renderHud(hud, [
        { label: '下一个', value: st.next > st.total ? '✓' : st.next, cls: 'target' },
        { label: '用时', value: fmtCount(st.elapsed) },
        { label: '进度', value: (st.next - 1) + ' / ' + st.total, cls: 'good' },
        { label: '失误', value: st.errors, cls: st.errors > 0 ? 'hot' : '' }
      ]);
    }

    function fitFont() {
      var c = grid.firstElementChild;
      if (!c) return;
      var w = c.getBoundingClientRect().width;
      if (w > 0) grid.style.fontSize = (w * 0.42).toFixed(1) + 'px';
    }

    function build() {
      UI.clear(grid);
      grid.style.gridTemplateColumns = 'repeat(' + L.n + ',1fr)';
      grid.style.gap = L.n >= 6 ? '5px' : '7px';
      var nums = [];
      for (var i = 1; i <= L.n * L.n; i++) nums.push(i);
      UI.shuffle(nums);
      nums.forEach(function (v) {
        var c = el('div', 'cell', String(v));
        c.style.aspectRatio = '1 / 1';
        c.dataset.v = v;
        on(c, 'click', function () { hit(c, v); });
        grid.appendChild(c);
      });
      fitFont();
    }

    function loop(t) {
      if (!st.running) return;
      var dt = Math.min(0.1, (t - lastT) / 1000);
      lastT = t;
      st.elapsed += dt * 1000;
      UI.setHud(hud, 1, fmtCount(st.elapsed));
      raf = requestAnimationFrame(loop);
    }
    function startLoop() { st.running = true; lastT = performance.now(); raf = requestAnimationFrame(loop); }
    function stopLoop() { st.running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    function hit(cell, v) {
      if (!st || !st.running) return;
      if (v === st.next) {
        cell.classList.add('done');
        st.next++;
        if (st.next > st.total) { finish(); return; }
        updateHud();
      } else {
        st.errors++;
        cell.classList.remove('err');
        void cell.offsetWidth;
        cell.classList.add('err');
        setTimeout(function () { cell.classList.remove('err'); }, 340);
        UI.toast('✗ 当前应该点 ' + st.next, 'err');
        updateHud();
      }
    }

    function finish() {
      stopLoop();
      var used = st.elapsed;
      var per = used / st.total / 1000;
      Store.addRecord('schulte', {
        level: L.id, levelName: L.name, size: L.n, time: +(used / 1000).toFixed(2),
        errors: st.errors, per: +per.toFixed(2)
      });

      var grade, gc;
      if (per <= 0.7) { grade = '优秀 — 视觉搜索效率高于常人水平'; gc = 'g'; }
      else if (per <= 1.0) { grade = '优良 — 达到「每字符约 1 秒」的通行标准'; gc = 'g'; }
      else if (per <= 1.5) { grade = '中等 — 属于大多数人的区间'; gc = ''; }
      else if (per <= 2.2) { grade = '偏慢 — 建议先降到低一档，练稳了再回来'; gc = 'r'; }
      else { grade = '较慢 — 先从 3×3 或 4×4 开始建立节奏'; gc = 'r'; }

      UI.clear(overlay);
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: '✅ 完成 ' + L.name,
        sub: '用时 ' + (used / 1000).toFixed(2) + ' 秒 · 每个数字平均 ' + per.toFixed(2) + ' 秒',
        stats: [
          { label: '总用时', value: (used / 1000).toFixed(2) + 's', cls: grade.indexOf('优秀') === 0 || grade.indexOf('优良') === 0 ? 'g' : '' },
          { label: '平均每个', value: per.toFixed(2) + 's', cls: gc },
          { label: '失误', value: st.errors, cls: st.errors === 0 ? 'g' : 'r' },
          { label: '通行基线', value: L.target + 's' }
        ],
        verdict: '<b>' + grade + '</b><br>提示：训练时视线尽量保持在方格中央，用余光去捕捉数字——这才是拓展视幅的关键，逐格扫视效果会差很多。',
        actions: [
          { label: '换一组数字', cls: 'ok', fn: begin },
          { label: '换难度', cls: 'sec', fn: function () { UI.clear(overlay); overlay.classList.add('hidden'); showIntro(); } },
          { label: '查看记录', cls: 'sec', fn: function () { App.go('#/history'); } }
        ]
      }));
    }

    function begin() {
      build();
      st = { next: 1, total: L.n * L.n, errors: 0, elapsed: 0, running: false };
      updateHud();
      overlay.classList.add('hidden');
      startLoop();
    }

    function showIntro(msg) {
      UI.clear(overlay);
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: '舒尔特方格 · ' + L.name,
        sub: '共 ' + (L.n * L.n) + ' 个数字 · 参考基线 ' + L.target + ' 秒',
        verdict: msg || '按 <b>1 → ' + (L.n * L.n) + '</b> 顺序点击。计时在你点下「开始」的瞬间启动。<br>建议眼睛固定在方格中央，用余光找数字。',
        actions: [{ label: '开始训练', cls: 'ok', fn: begin }]
      }));
    }

    function renderLevels() {
      UI.clear(lvRow);
      LEVELS.forEach(function (lv) {
        var b = el('button', 'lv' + (lv.id === L.id ? ' on' : ''), lv.name + '<small>基线 ' + lv.target + 's</small>');
        b.style.lineHeight = '1.25';
        on(b, 'click', function () {
          L = lv; stopLoop(); if (st) st.running = false;
          build(); renderLevels(); showIntro();
        });
        lvRow.appendChild(b);
      });
    }

    function onResize() { fitFont(); }
    on(window, 'resize', onResize);

    function onVis() {
      if (!st || !st.running) return;
      if (document.hidden) {
        stopLoop();
        UI.clear(overlay);
        overlay.classList.remove('hidden');
        overlay.appendChild(UI.resultPanel({
          title: '已暂停',
          sub: '已用时 ' + fmtCount(st.elapsed),
          actions: [
            { label: '继续', cls: 'ok', fn: function () { overlay.classList.add('hidden'); startLoop(); } },
            { label: '重新开始', cls: 'sec', fn: function () { begin(); } }
          ]
        }));
      }
    }
    on(document, 'visibilitychange', onVis);

    renderLevels();
    build();            // 先铺好方格，遮罩浮在其上，视觉上更完整
    showIntro();

    return function cleanup() {
      stopLoop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }

  App.register({
    id: 'schulte',
    name: '舒尔特方格',
    icon: '🔢',
    tag: '注意力 · 视觉搜索广度',
    desc: '飞行员经典注意力训练：按 1→N² 顺序点击数字，拓展视幅、加快视觉定向搜索。3×3 至 6×6。',
    bestText: function (list) {
      var same = list.filter(function (r) { return r.size === 5; });
      if (!same.length) { same = list; }
      var b = same[0];
      same.forEach(function (r) { if (r.time < b.time) b = r; });
      return '5×5 最快 ' + b.time + 's（' + b.levelName + '，失误 ' + b.errors + '）';
    },
    recordText: function (r) {
      return '用时 ' + r.time + 's · 平均 ' + r.per + 's/个 · 失误 ' + r.errors;
    },
    mount: mount
  });
})();
