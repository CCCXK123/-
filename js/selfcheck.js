/* ===== selfcheck.js — 执行功能自评 =====
   16 题自评，定位 4 个执行功能维度中最需要训练的一块。
   注意：非标准化测量工具，仅作定位参考，不具备诊断效力。
*/
(function () {
  'use strict';
  var el = UI.el, on = UI.on;

  var C = CONTENT.selfcheck;

  function mount(host) {
    var wrap = el('div', 'wrap-narrow');
    wrap.style.maxWidth = '860px';
    host.appendChild(wrap);

    wrap.appendChild(el('div', 'game-top', [
      '<div><h1>📝 执行功能自评</h1>',
      '<p class="desc">共 16 题（4 个维度 × 4 题），请按<b>过去一个月</b>的实际情况作答，凭第一反应选，不要反复权衡。' +
      '每题 1–5 分，<b>总分 16–80 分</b>，每个维度满分 20 分。' +
      '测完会给出 4 个维度的得分，帮你定位「最该练哪一块」。<b>非诊断工具。</b></p></div>'
    ].join('')));

    var answers = {};
    var resultHost = null;
    var body = el('div');
    wrap.appendChild(body);

    function render() {
      UI.clear(body);

      /* --- 量表 --- */
      var card = el('div', 'card');
      var idx = 0;
      C.dims.forEach(function (dim) {
        var items = C.items.filter(function (it) { return it.d === dim.key; });
        var h = el('div');
        h.style.cssText = 'margin:18px 0 4px;font-weight:800;font-size:15px;color:var(--primary)';
        h.textContent = dim.name + ' · ' + dim.desc;
        card.appendChild(h);

        items.forEach(function (it) {
          idx++;
          var row = el('div', 'qitem');
          var qt = el('div', 'qt', '<b style="color:var(--muted);font-variant-numeric:tabular-nums">' + idx + '.</b> ' + it.q);
          row.appendChild(qt);

          var lk = el('div');
          var btnsRow = el('div', 'likert');
          for (var v = 1; v <= 5; v++) {
            (function (val) {
              var b = el('button', '', String(val));
              b.type = 'button';
              if (answers[it.q] === val) b.classList.add('on');
              on(b, 'click', function () {
                answers[it.q] = val;
                Array.prototype.forEach.call(btnsRow.children, function (c) { c.classList.remove('on'); });
                b.classList.add('on');
                updateProgress();
              });
              btnsRow.appendChild(b);
            })(v);
          }
          lk.appendChild(btnsRow);
          row.appendChild(lk);
          card.appendChild(row);
        });
      });
      body.appendChild(card);

      var lab = el('div', 'likert-labels');
      lab.innerHTML = '<span>1 = 从不</span><span>2 = 很少</span><span>3 = 有时</span><span>4 = 经常</span><span>5 = 总是</span>';
      body.appendChild(lab);

      var prog = el('div');
      prog.style.cssText = 'text-align:center;font-size:13.5px;color:var(--muted);margin:16px 0 8px;font-weight:600';
      body.appendChild(prog);

      var row = el('div', 'btnrow');
      row.style.justifyContent = 'center';
      var submit = el('button', 'btn', '查看结果');
      submit.disabled = true;
      on(submit, 'click', showResult);
      var reset = el('button', 'btn sec', '重置');
      on(reset, 'click', function () { answers = {}; render(); });
      row.appendChild(submit);
      row.appendChild(reset);
      body.appendChild(row);

    var res = el('div');
    res.id = 'scResult';
    body.appendChild(res);

    function updateProgress() {
      var n = Object.keys(answers).length;
      prog.textContent = '已作答 ' + n + ' / ' + C.items.length + ' 题';
      submit.disabled = n < C.items.length;
    }
    updateProgress();

    // 把结果容器暴露给 showResult，避免再走 getElementById
    resultHost = res;
  }

    function showResult() {
      var dimScores = {};
      C.dims.forEach(function (d) { dimScores[d.key] = 0; });
      var total = 0;
      C.items.forEach(function (it) {
        var v = answers[it.q] || 0;
        dimScores[it.d] += v;
        total += v;
      });

      var band = C.bands[0];
      for (var i = 0; i < C.bands.length; i++) { if (total <= C.bands[i].max) { band = C.bands[i]; break; } }
      var prev = 0;
      for (var j = 0; j < C.bands.length; j++) {
        if (C.bands[j] === band) break;
        prev = C.bands[j].max;
      }

      Store.addRecord('selfcheck', {
        level: 'sc', levelName: '自评', total: total, band: band.name,
        dims: dimScores
      });

      /* 维度排名 */
      var ranked = C.dims.map(function (d) { return { d: d, s: dimScores[d.key] }; })
        .sort(function (a, b) { return a.s - b.s; });
      var weakest = ranked[0], strongest = ranked[ranked.length - 1];

      var recommend = {
        inhibit: '你的<b>抑制控制</b>相对最弱。优先练 <b>Go / No-Go</b> 与 <b>Stroop 色词干扰</b>——这两个都是直接测量「压制自动反应」的范式。',
        wm: '你的<b>工作记忆</b>相对最弱。优先练 <b>N-back</b>（从 1-back 起步，稳定到 85% 准确率再升到 2-back），以及需要边记边找的 <b>旋转数字盘</b>。',
        flex: '你的<b>认知灵活性</b>相对最弱。优先练 <b>旋转数字盘</b>（大师档会突然反向）与 <b>Stroop 大师档</b>（规则反转），这两个都强制你在中途切换规则。',
        plan: '你的<b>计划与组织</b>相对最弱。这类能力在游戏里的迁移最弱，建议直接用在真实任务上：每天开工前把当天任务拆成 3–5 步并排序，配合 <b>旋转数字盘</b> 训练「按序推进不跳步」的习惯。'
      }[weakest.d.key];

      var html = [
        '<div class="band" style="border-color:' + band.color + '">',
        '<div class="score" style="color:' + band.color + '">' + total + ' <span style="font-size:15px;color:var(--muted);font-weight:600">/ 80</span></div>',
        '<h3 style="color:' + band.color + '">' + band.name + '</h3>',
        '<div class="bar">'
      ];
      var bandWidths = [25, 25, 25, 25];
      C.bands.forEach(function (b, k) {
        html.push('<i style="width:' + bandWidths[k] + '%;background:' + b.color + ';opacity:' + (b === band ? 1 : 0.22) + '"></i>');
      });
      html.push('</div><div class="bar-legend"><span>16 分</span><span>34</span><span>47</span><span>63</span><span>80 分</span></div>');
      html.push('<p style="margin:14px 0 0;font-size:13.8px;color:var(--text2)">' + band.text + '</p>');
      html.push('</div>');

      /* 维度明细 */
      html.push('<div class="card"><h3 style="margin-top:0">各维度得分（满分 20）</h3>');
      C.dims.forEach(function (d) {
        var s = dimScores[d.key];
        var p = Math.round((s / 20) * 100);
        var col = p >= 75 ? '#0ca678' : p >= 55 ? '#3b5bdb' : p >= 40 ? '#e8590c' : '#e03131';
        html.push('<div style="margin:12px 0">');
        html.push('<div style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:700"><span>' + d.name +
          '</span><span style="color:' + col + '">' + s + ' / 20</span></div>');
        html.push('<div class="dimbar" style="height:8px;background:var(--bg2);border-radius:999px;overflow:hidden;margin-top:5px"><i style="display:block;height:100%;width:' + p + '%;background:' + col + ';border-radius:999px"></i></div>');
        html.push('</div>');
      });
      html.push('</div>');

      /* 建议 */
      html.push('<div class="note ok"><b>针对你的建议</b><br>' + recommend +
        '<br><br>最不需要担心的维度是「' + strongest.d.name + '」（' + strongest.s + '/20），保持即可。</div>');

      html.push('<div class="note"><b>重要声明</b><br>' + C.disclaimer + '</div>');

      var out = resultHost;
      if (!out) return;
      out.innerHTML = html.join('');
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    render();

    return function cleanup() {};
  }

  App.register({
    id: 'selfcheck',
    name: '执行功能自评',
    icon: '📝',
    tag: '测评 · 定位训练重点',
    desc: '16 题自评，输出 4 个执行功能维度得分并推荐训练重点。非诊断工具。',
    hidden: true,
    bestText: function () { return ''; },
    recordText: function (r) {
      var d = r.dims || {};
      return '总分 ' + r.total + '/80（' + r.band + '）· 抑制' + (d.inhibit || 0) + ' 记忆' + (d.wm || 0) +
        ' 灵活' + (d.flex || 0) + ' 计划' + (d.plan || 0);
    },
    mount: mount
  });
})();
