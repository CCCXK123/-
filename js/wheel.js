/* ===== wheel.js — 旋转数字盘（核心模块） =====
   三种布局（统一为「若干旋转环」模型）：
     · 单盘同心环(disc)：1 个大圆盘，2–5 层环以不同速度/方向旋转
     · 多个小转盘(multi)：2–4 个独立小盘，每盘 1 层环各自旋转
     · 嵌套多盘(nested)：2–4 个小盘，每盘内部再分 2 层同心环，各环独立转速方向
   限时按 1 → N 顺序点击。
   规则要点：
     · 找到的数字【不变色】——点到几了要自己记住，这正是工作记忆负荷所在
     · 数字的位置、以及「哪个数字在哪个盘/环」全部随机，无法靠数值预判
     · 大师/炼狱档可开启【随机换位】：每隔几秒全部数字换到新位置
*/
(function () {
  'use strict';
  var el = UI.el, on = UI.on;

  var SIZE = 720, CX = 360, CY = 360;
  var INNER_R = 72;                  // 单盘模式的环带内半径
  var MIN_SPACING = 52;              // 同一轨道上两颗数字圆心最小弧距(px)

  var MODES = [
    { id: 'disc', name: '单盘同心环', hint: '1 盘 · 2–5 层环' },
    { id: 'multi', name: '多个小转盘', hint: '2–4 个独立小盘' },
    { id: 'nested', name: '嵌套多盘', hint: '多盘 · 每盘再分 2 环' }
  ];

  /* 难度递增：数字更多 / 环更多 / 转速更快 / 限时更紧 / 反转更频繁
     flipEvery  —— 反向旋转间隔(ms)
     swapEvery  —— 随机换位间隔(ms)；有该字段 = 支持换位机制
     swapDefault—— 选中该档时换位默认开还是关 */
  var LEVELS = [
    { id: 'easy', name: '入门', rings: 2, count: 12, speed: 0.12, time: 56, flip: false },
    { id: 'normal', name: '标准', rings: 3, count: 20, speed: 0.20, time: 70, flip: false },
    { id: 'hard', name: '困难', rings: 3, count: 30, speed: 0.29, time: 84, flip: false },
    { id: 'expert', name: '大师', rings: 4, count: 40, speed: 0.35, time: 88, flip: true, flipEvery: 10000, swapEvery: 9000, swapDefault: false },
    { id: 'inferno', name: '炼狱', rings: 5, count: 48, speed: 0.42, time: 105, flip: true, flipEvery: 6500, swapEvery: 7000, swapDefault: true }
  ];

  function ringsPerUnit(mode, lv) {
    return mode === 'disc' ? lv.rings : (mode === 'nested' ? 2 : 1);
  }

  // 计算每个盘（unit）的中心与半径
  function makeUnits(level, mode) {
    if (mode === 'disc') return [{ cx: CX, cy: CY, R: 340 }];
    var margin = 30, gap = 60;
    var cell = (SIZE - margin * 2 - gap) / 2;   // 300
    var R = cell / 2;                            // 150
    var a = margin + R, b = a + cell + gap;      // 180 / 540
    var n = level.count <= 16 ? 2 : 4;
    return n === 2
      ? [{ cx: a, cy: CY, R: R }, { cx: b, cy: CY, R: R }]
      : [{ cx: a, cy: a, R: R }, { cx: b, cy: a, R: R }, { cx: a, cy: b, R: R }, { cx: b, cy: b, R: R }];
  }

  function unitCount(level, mode) { return makeUnits(level, mode).length; }

  // 把盘心半径范围内的环建成旋转环数组
  function makeRings(level, mode, units) {
    var rpu = ringsPerUnit(mode, level), rings = [], gi = 0;
    units.forEach(function (u, ui) {
      var innerR = mode === 'disc' ? INNER_R : u.R * 0.34;
      var band = (u.R - innerR) / rpu;
      for (var ri = 0; ri < rpu; ri++) {
        var inner = innerR + ri * band, mid = inner + band / 2;
        var spd = mode === 'disc'
          ? level.speed * (1 + ri * 0.34)
          : level.speed * (ri === 0 ? 1 : 1.3);          // 同一盘内外环略差速
        rings.push({
          unit: ui, cx: u.cx, cy: u.cy, r: mid,
          bgInner: inner, bgOuter: inner + band, bandW: band,
          angle: Math.random() * Math.PI * 2,
          speed: spd * (gi % 2 === 0 ? 1 : -1)            // 相邻环反向，整体错落
        });
        gi++;
      }
    });
    return rings;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // 在圆周上随机散布 n 个角度，相邻间距不小于 minGap（弧度），避免数字重叠
  function randomAngles(n, minGap) {
    var angles = [], tries = 0;
    while (angles.length < n && tries < 2000) {
      tries++;
      var a = Math.random() * Math.PI * 2;
      var ok = true;
      for (var k = 0; k < angles.length; k++) {
        var d = Math.abs(a - angles[k]);
        if (d > Math.PI) d = Math.PI * 2 - d;
        if (d < minGap) { ok = false; break; }
      }
      if (ok) angles.push(a);
    }
    // 兜底：拒绝采样未凑满时，用「均匀间隔 + 随机基准」补位（数字已打乱，顺序仍随机）
    while (angles.length < n) angles.push((angles.length / n) * Math.PI * 2 + Math.random() * minGap);
    return angles;
  }

  // 某个环上「随机散布 n 个角度」所需的可行最小角距（弧距 ≥ MIN_SPACING）
  function gapFor(o, n) {
    var minGap = MIN_SPACING / o.r;
    if (n * minGap > Math.PI * 2 * 0.9) minGap = Math.PI * 2 * 0.9 / n;
    return minGap;
  }

  function buildLayout(level, mode) {
    var units = makeUnits(level, mode);
    var rings = makeRings(level, mode, units);
    var total = level.count;

    // 1) 生成 1..N 并整体打乱，再跨盘轮询分配
    //    —— 关键：数字与「哪个盘」的对应关系是随机的，玩家无法靠数值预判位置
    var pool = [];
    for (var k = 1; k <= total; k++) pool.push(k);
    shuffle(pool);
    var perUnit = units.map(function () { return []; });
    pool.forEach(function (num, i) { perUnit[i % units.length].push(num); });

    // 2) 盘内数字再随机分配到各环（先打乱，再轮询）
    var ringByUnit = {};
    rings.forEach(function (o, i) { (ringByUnit[o.unit] = ringByUnit[o.unit] || []).push(i); });
    var ringNums = rings.map(function () { return []; });
    units.forEach(function (u, ui) {
      shuffle(perUnit[ui]).forEach(function (num, j) {
        ringNums[ringByUnit[ui][j % ringByUnit[ui].length]].push(num);
      });
    });

    // 3) 各环内：先把数字随机打乱，再随机散布角度（保留最小弧距，避免重叠）
    //    数字顺序与角度都随机 —— 扫圈不再遇到 1→N，位置不再均匀分布
    var slots = [];
    rings.forEach(function (o, ri) {
      var nums = shuffle(ringNums[ri].slice());
      var n = nums.length;
      if (!n) return;
      var angles = randomAngles(n, gapFor(o, n));
      nums.forEach(function (num, t) {
        slots.push({ orbit: ri, angle: angles[t], num: num, flash: 0 });
      });
    });

    if (slots.length !== total) throw new Error('盘面容量异常：' + slots.length + ' / ' + total);

    // 中心提示：每个盘心一份「找 N」
    var labelR = mode === 'disc' ? INNER_R - 12 : units[0].R * 0.34 - 8;
    var hints = units.map(function (u) { return { x: u.cx, y: u.cy, r: labelR }; });

    return { units: units, rings: rings, slots: slots, total: total, hints: hints, mode: mode };
  }

  /* ---------- 游戏主体 ---------- */
  function mount(host) {
    var wrap = el('div', 'wrap-wide');
    host.appendChild(wrap);

    wrap.appendChild(el('div', 'game-top', [
      '<div><h1>🎡 旋转数字盘 <span class="pill core" style="font-size:11.5px;padding:3px 9px;border-radius:999px;vertical-align:middle">核心模块</span></h1>',
      '<p class="desc">数字散布在旋转的圆环或小转盘上，请在限定时间内<b>按 1→N 的顺序依次点击</b>。' +
      '<b>找到的数字不会变色——点到几了要自己记住</b>，重复点击已找到的数字也算失误。' +
      '三种布局可自由切换：单盘同心环 / 多个小转盘 / 嵌套多盘（多盘且每盘内部再分两层环）。' +
      '<b>大师 / 炼狱档还可开启「随机换位」</b>——每隔几秒全部数字换到新位置。</p></div>'
    ].join('')));

    var modeRow = el('div', 'levelrow');
    var lvRow = el('div', 'levelrow');
    var mechRow = el('div');              // 机制行：仅大师/炼狱档出现（不用 .levelrow 类，避免影响选择器）
    mechRow.style.cssText = 'gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px';
    var hud = el('div', 'hud');
    var stage = el('div', 'stage fit-vp');
    var canvas = el('canvas');
    var overlay = el('div', 'overlay');
    stage.appendChild(canvas);
    stage.appendChild(overlay);
    wrap.appendChild(modeRow);
    wrap.appendChild(lvRow);
    wrap.appendChild(mechRow);
    wrap.appendChild(hud);
    wrap.appendChild(stage);

    var ctx = canvas.getContext('2d');
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var FONT = getComputedStyle(document.body).fontFamily;

    /* --- 状态 --- */
    var L = LEVELS[0];
    var mode = 'disc';
    var layout = null;
    var st = null;
    var swapOn = !!L.swapDefault;         // 随机换位开关（仅大师/炼狱可用）
    var raf = null, lastT = 0, flipAt = 0, swapAt = 0;

    function modeName() { return MODES.filter(function (m) { return m.id === mode; })[0].name; }
    function slotFont(o) { return o.bandW ? Math.max(15, Math.min(34, o.bandW * 0.5)) : 30; }
    function slotRad(o) { return o.bandW ? Math.min(slotFont(o) * 0.72, 25) : 22; }
    function flipEvery() { return L.flipEvery || 12000; }

    function unitN() { return unitCount(L, mode); }
    function rpu() { return ringsPerUnit(mode, L); }

    function hintOf(lv) {
      var base;
      if (mode === 'disc') base = lv.rings + ' 环 · ' + lv.count + ' 个数';
      else if (mode === 'multi') base = unitCount(lv, mode) + ' 盘 × 1 环 · ' + lv.count + ' 个数';
      else base = unitCount(lv, mode) + ' 盘 × ' + rpu() + ' 环（嵌套）· ' + lv.count + ' 个数';
      if (lv.speed <= 0.13) base += ' · 慢速';
      else if (lv.speed >= 0.34) base += ' · 极速';
      else if (lv.speed >= 0.24) base += ' · 高速';
      if (lv.flip) base += ' · 会反向';
      if (lv.swapEvery) base += ' · 可换位';
      return base;
    }

    function fmtCountdown(ms) {
      var s = Math.ceil(ms / 1000);
      return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
    }

    function updateHud() {
      var items = [
        { label: '目标数字', value: st.target > layout.total ? '✓' : st.target, cls: 'target' },
        { label: '剩余时间', value: fmtCountdown(st.left), cls: st.left < 15000 ? 'hot' : '' },
        { label: '进度', value: st.found + ' / ' + layout.total, cls: 'good' },
        { label: '失误', value: st.errors, cls: st.errors > 0 ? 'hot' : '' }
      ];
      if (swapOn && L.swapEvery && !st.over) {
        var left = Math.max(0, swapAt - performance.now());
        items.push({ label: '下次换位', value: (left / 1000).toFixed(1) + 's', cls: left < 2000 ? 'hot' : '' });
      }
      UI.renderHud(hud, items);
    }

    function draw() {
      var now = performance.now();
      ctx.clearRect(0, 0, SIZE, SIZE);

      // 轨道底纹：画环形（同心环 / 小盘环带）
      layout.rings.forEach(function (o, i) {
        ctx.beginPath();
        ctx.arc(o.cx, o.cy, o.bgOuter, 0, Math.PI * 2);
        ctx.arc(o.cx, o.cy, o.bgInner, 0, Math.PI * 2, true);
        ctx.fillStyle = i % 2 === 0 ? '#f7f9fd' : '#eef3fb';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(o.cx, o.cy, o.bgOuter, 0, Math.PI * 2);
        ctx.strokeStyle = '#dde5f2';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // 数字：找到与未找到【不加颜色区分】，只有误点瞬间闪红
      layout.slots.forEach(function (s) {
        var o = layout.rings[s.orbit];
        var th = s.angle + o.angle;
        var x = o.cx + Math.cos(th) * o.r;
        var y = o.cy + Math.sin(th) * o.r;
        var fs = slotFont(o);
        var rad = slotRad(o);
        var bad = s.flash > now;

        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        if (bad) { ctx.fillStyle = '#ffe3e3'; ctx.strokeStyle = '#e03131'; }
        else { ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#d3ddef'; }
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.font = '700 ' + fs.toFixed(0) + 'px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = bad ? '#c92a2a' : '#17203a';
        ctx.fillText(String(s.num), x, y + 1);
      });

      // 目标提示：每个盘心一份
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      layout.hints.forEach(function (h) {
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#e3e9f5';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (st.target > layout.total) {
          ctx.font = '800 30px ' + FONT;
          ctx.fillStyle = '#0ca678';
          ctx.fillText('✓', h.x, h.y + 1);
        } else {
          ctx.font = '600 12px ' + FONT;
          ctx.fillStyle = '#8a93a6';
          ctx.fillText('找', h.x, h.y - 16);
          ctx.font = '800 30px ' + FONT;
          ctx.fillStyle = '#3b5bdb';
          ctx.fillText(String(st.target), h.x, h.y + 10);
        }
      });
    }

    // 随机换位：所有环内的数字重新洗牌 + 重新随机散布角度
    function scrambleSlots() {
      var byOrbit = {};
      layout.slots.forEach(function (s) { (byOrbit[s.orbit] = byOrbit[s.orbit] || []).push(s); });
      Object.keys(byOrbit).forEach(function (k) {
        var group = byOrbit[k], o = layout.rings[+k], n = group.length;
        if (!n) return;
        var nums = shuffle(group.map(function (s) { return s.num; }));
        var angles = randomAngles(n, gapFor(o, n));
        group.forEach(function (s, i) { s.num = nums[i]; s.angle = angles[i]; s.flash = 0; });
      });
    }

    function loop(t) {
      if (!st.running) return;
      var dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;

      layout.rings.forEach(function (o) { o.angle += o.speed * dt; });

      if (L.flip && t >= flipAt) {
        flipAt = t + flipEvery();
        layout.rings.forEach(function (o) { o.speed = -o.speed; });
        UI.toast('⚠️ 旋转方向反转！', 'err');
      }

      if (swapOn && L.swapEvery && t >= swapAt) {
        swapAt = t + L.swapEvery;
        scrambleSlots();
        UI.toast('🔄 数字换位了！', 'err');
      }

      st.left = st.endAt - t;
      if (st.left <= 0) { st.left = 0; draw(); updateHud(); finish(false); return; }

      draw();
      updateHud();
      raf = requestAnimationFrame(loop);
    }

    function startLoop() {
      st.running = true;
      lastT = performance.now();
      flipAt = lastT + flipEvery();
      swapAt = lastT + (L.swapEvery || 8000);
      raf = requestAnimationFrame(loop);
    }
    function stopLoop() {
      if (st) st.running = false;      // 未开局时 st 为 null，切布局/难度不能崩
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    /* --- 交互 --- */
    function showIntro(msg) {
      UI.clear(overlay);
      overlay.classList.remove('hidden');
      var stats = [
        { label: '布局', value: modeName() },
        { label: '数字个数', value: L.count },
        { label: '限时(秒)', value: L.time },
        { label: '反向旋转', value: L.flip ? '会' : '不会', cls: L.flip ? 'r' : '' }
      ];
      if (mode === 'disc') stats.splice(1, 0, { label: '圆环数', value: L.rings, cls: 'p' });
      else stats.splice(1, 0, { label: '转盘数', value: unitN(), cls: 'p' }, { label: '每盘环数', value: rpu() });
      if (L.swapEvery) stats.push({ label: '随机换位', value: swapOn ? '开' : '关', cls: swapOn ? 'r' : '' });

      overlay.appendChild(UI.resultPanel({
        title: '旋转数字盘 · ' + modeName() + ' · ' + L.name,
        sub: hintOf(L) + ' · 限时 ' + L.time + ' 秒',
        stats: stats,
        verdict: msg || '按 <b>1 → ' + L.count + '</b> 的顺序点击数字。' +
          (mode === 'disc'
            ? '圆环在转，数字位置一直在变。'
            : mode === 'multi'
              ? '每个小转盘各自以不同速度、方向旋转。'
              : '每个小盘各自旋转，且盘内两层环也以不同速度、方向转——要同时盯多个盘和盘内两层。') +
          '<br><b>找到的数字不会变色，点到几了要自己记住</b>；重复点已找到的数字也算失误。点击开始后计时立刻启动。' +
          (swapOn && L.swapEvery
            ? '<br><b>🔄 随机换位已开启</b>：每 ' + (L.swapEvery / 1000) + ' 秒全部数字换到新位置，得重新找。'
            : ''),
        actions: [{ label: '开始训练', cls: 'ok', fn: begin }]
      }));
    }

    function begin() {
      layout = buildLayout(L, mode);
      st = {
        target: 1, found: 0, errors: 0,
        endAt: performance.now() + L.time * 1000,
        left: L.time * 1000,
        running: false, over: false, pausedLeft: 0
      };
      overlay.classList.add('hidden');
      draw();
      updateHud();
      startLoop();
    }

    function finish(win) {
      if (st.over) return;
      st.over = true;
      stopLoop();
      var used = L.time * 1000 - st.left;
      if (win) {
        Store.addRecord('wheel', {
          level: L.id, levelName: L.name, mode: mode, modeName: modeName(),
          swap: !!(swapOn && L.swapEvery),
          time: +(used / 1000).toFixed(1),
          errors: st.errors, count: L.count,
          acc: UI.pct(L.count, L.count + st.errors)
        });
      }

      UI.clear(overlay);
      overlay.classList.remove('hidden');
      overlay.appendChild(UI.resultPanel({
        title: win ? '🎉 完成！' : '⏰ 时间到',
        sub: (win ? '你把 1 到 ' + layout.total + ' 全部按顺序点完了' : '只找到 ' + st.found + ' / ' + layout.total) +
          ' · ' + modeName() + ' · ' + L.name + (swapOn && L.swapEvery ? ' · 随机换位' : ''),
        stats: [
          { label: '用时', value: win ? UI.fmtSec(used) + 's' : '—', cls: win ? 'g' : '' },
          { label: '失误', value: st.errors, cls: st.errors === 0 ? 'g' : 'r' },
          { label: '准确率', value: UI.pct(st.found, st.found + st.errors) + '%' },
          { label: '平均每个', value: st.found ? UI.fmtSec(used / st.found) + 's' : '—' }
        ],
        verdict: win
          ? (st.errors === 0 ? '零失误完成，注意分配与工作记忆都跟上了。' :
             '失误 ' + st.errors + ' 次。多数失误来自「看到相近数字就点」或「忘了刚点过哪个」——试着在点之前多确认一眼。')
          : '未完成。如果连续 3 次都在同一档失败，建议降一档难度；如果都能轻松完成，就升一档。' +
            (mode !== 'disc' ? '也可以先回「单盘同心环」练熟再来。' : ''),
        actions: [
          { label: '再来一次', cls: 'ok', fn: begin },
          { label: '换难度', cls: 'sec', fn: function () { UI.clear(overlay); overlay.classList.add('hidden'); showIntro('已重置。选好布局与难度后点击开始。'); } },
          { label: '查看记录', cls: 'sec', fn: function () { App.go('#/history'); } }
        ]
      }));
    }

    /* 命中判定：取离点击点最近的数字圆心——所见即所点，三种布局通用 */
    function onClickCanvas(e) {
      if (!st || !st.running || st.over) return;
      var rect = canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width * SIZE;
      var y = (e.clientY - rect.top) / rect.height * SIZE;

      var best = null, bestDist = 1e9, bestTol = 0;
      layout.slots.forEach(function (s) {
        var o = layout.rings[s.orbit];
        var th = s.angle + o.angle;
        var dx = x - (o.cx + Math.cos(th) * o.r);
        var dy = y - (o.cy + Math.sin(th) * o.r);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) { bestDist = d; best = s; bestTol = Math.max(slotRad(o) * 1.25, 24); }
      });
      if (!best || bestDist > bestTol) { miss(); return; }

      if (best.num === st.target) {
        st.target++; st.found++;
        if (st.target > layout.total) { draw(); updateHud(); finish(true); return; }
        UI.toast('✓ ' + (st.target - 1), 'ok');
      } else {
        st.errors++;
        best.flash = performance.now() + 350;
        UI.toast(best.num < st.target
          ? '✗ ' + best.num + ' 已经点过了'
          : '✗ 还没到 ' + best.num + '，先找 ' + st.target, 'err');
      }
      draw();
      updateHud();
    }

    function miss() {
      st.errors++;
      UI.toast('✗ 点到空白处了', 'err');
      updateHud();
    }

    on(canvas, 'pointerdown', onClickCanvas);

    // 切到后台自动暂停：记下剩余时间，回来时从暂停点继续
    function onVis() {
      if (!st || !st.running || st.over) return;
      if (document.hidden) {
        stopLoop();
        st.pausedLeft = Math.max(0, st.endAt - performance.now());
        UI.clear(overlay);
        overlay.classList.remove('hidden');
        overlay.appendChild(UI.resultPanel({
          title: '已暂停',
          sub: '切到后台时自动暂停，剩余 ' + fmtCountdown(st.pausedLeft),
          actions: [
            { label: '继续', cls: 'ok', fn: function () {
              st.endAt = performance.now() + st.pausedLeft;
              overlay.classList.add('hidden');
              startLoop();
            } },
            { label: '放弃本次', cls: 'sec', fn: function () { st.over = true; overlay.classList.add('hidden'); showIntro(); } }
          ]
        }));
      }
    }
    on(document, 'visibilitychange', onVis);

    /* --- 布局 / 难度 / 机制 切换 --- */
    function abortRun() {
      stopLoop();
      if (st) st.over = true;
    }

    function rowLabel(text) {
      var s = el('span', '', text);
      s.style.cssText = 'align-self:center;font-size:12.5px;color:var(--muted);font-weight:700;margin-right:2px';
      return s;
    }

    function renderModes() {
      UI.clear(modeRow);
      modeRow.appendChild(rowLabel('布局'));
      MODES.forEach(function (m) {
        var b = el('button', 'lv' + (m.id === mode ? ' on' : ''), m.name + '<small>' + m.hint + '</small>');
        b.style.lineHeight = '1.25';
        on(b, 'click', function () {
          if (m.id === mode) return;
          mode = m.id;
          abortRun();
          renderModes();
          renderLevels();
          renderMech();
          showIntro();
        });
        modeRow.appendChild(b);
      });
    }

    function renderLevels() {
      UI.clear(lvRow);
      lvRow.appendChild(rowLabel('难度'));
      LEVELS.forEach(function (lv) {
        var b = el('button', 'lv' + (lv.id === L.id ? ' on' : ''), lv.name + '<small>' + hintOf(lv) + '</small>');
        b.style.lineHeight = '1.25';
        on(b, 'click', function () {
          if (lv.id === L.id) return;
          L = lv;
          swapOn = !!L.swapDefault;      // 换位开关随难度回到该档默认值
          abortRun();
          renderLevels();
          renderMech();
          showIntro();
        });
        lvRow.appendChild(b);
      });
    }

    // 机制行：仅大师/炼狱档出现「随机换位」开关
    function renderMech() {
      UI.clear(mechRow);
      if (!L.swapEvery) { mechRow.style.display = 'none'; return; }
      mechRow.style.display = 'flex';
      mechRow.appendChild(rowLabel('机制'));
      var b = el('button', 'lv' + (swapOn ? ' on' : ''),
        '🔄 随机换位<small>每 ' + (L.swapEvery / 1000) + ' 秒全部数字换到新位置</small>');
      b.style.lineHeight = '1.25';
      on(b, 'click', function () {
        swapOn = !swapOn;
        if (st && st.running) swapAt = performance.now() + L.swapEvery;   // 开局中切换则重置计时
        renderMech();
        // 若此刻正显示说明页，同步刷新面板上的「随机换位」状态
        if (!overlay.classList.contains('hidden') && /开始训练/.test(overlay.textContent)) showIntro();
        UI.toast(swapOn ? '已开启随机换位' : '已关闭随机换位', 'ok');
      });
      mechRow.appendChild(b);
    }

    renderModes();
    renderLevels();
    renderMech();
    UI.renderHud(hud, [
      { label: '目标数字', value: '—', cls: 'target' },
      { label: '剩余时间', value: '—' },
      { label: '进度', value: '0 / ' + L.count, cls: 'good' },
      { label: '失误', value: '0' }
    ]);
    showIntro();

    /* --- 清理 --- */
    return function cleanup() {
      stopLoop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }

  App.register({
    id: 'wheel',
    name: '旋转数字盘',
    icon: '🎡',
    core: true,
    tag: '核心 · 视觉搜索 + 工作记忆',
    desc: '三种布局 × 五档难度（入门→炼狱）。限时按 1→N 顺序点击，找到的不变色，进度靠自己记；大师/炼狱档可开「随机换位」。',
    bestText: function (list) {
      var done = list.filter(function (r) { return r.time; });
      if (!done.length) return '暂无完整成绩';
      var b = done[0];
      done.forEach(function (r) { if (r.time < b.time) b = r; });
      return '最快 ' + b.time + 's（' + (b.modeName || '单盘同心环') + ' ' + b.levelName + '，失误 ' + b.errors + '）';
    },
    recordText: function (r) {
      return (r.modeName || '单盘同心环') + ' · 用时 ' + r.time + 's · 失误 ' + r.errors +
        ' · 准确率 ' + (r.acc || 0) + '%' + (r.swap ? ' · 换位' : '');
    },
    mount: mount
  });
})();
