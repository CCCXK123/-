/* ===== app.js — 路由、首页、知识页、记录页 ===== */
(function () {
  'use strict';
  var el = UI.el, on = UI.on, clear = UI.clear;

  var App = window.App;   // 骨架在 ui.js 中定义，各游戏模块已在此之前完成注册

  /* ================= 首页 ================= */
  function homeView() {
    var v = el('div');
    v.appendChild(el('section', 'hero', [
      '<h1>前额叶训练营</h1>',
      '<p>用 5 个经典执行功能任务，锻炼你的抑制控制、工作记忆与注意分配能力。纯本地运行、零依赖、数据不出浏览器。</p>',
      '<div class="hero-tags">',
      '<span>🧠 执行功能</span><span>🎯 5 个训练模块</span><span>📈 成绩趋势记录</span><span>📚 权威文献支撑</span>',
      '</div>'
    ].join('')));

    /* --- 训练模块 --- */
    var sec1 = el('section', 'section');
    sec1.appendChild(el('div', 'section-head',
      '<h2>训练模块</h2><span class="sub">点击进入 · 每个模块 4 档难度 · 单次建议 10–15 分钟</span>'));
    var g = el('div', 'grid');
    App.games.filter(function (d) { return !d.hidden; }).forEach(function (def) {
      var b = el('button', 'gcard');
      b.type = 'button';
      b.innerHTML = [
        '<span class="ic">' + def.icon + '</span>',
        '<h3>' + def.name + '</h3>',
        '<p>' + def.desc + '</p>',
        '<span class="pill ' + (def.core ? 'core' : '') + '">' + def.tag + '</span>',
        '<span class="best" data-best="' + def.id + '"></span>'
      ].join('');
      on(b, 'click', function () { App.go('#/' + def.id); });
      g.appendChild(b);
    });
    sec1.appendChild(g);
    v.appendChild(sec1);

    /* --- 知识与测评 --- */
    var sec2 = el('section', 'section');
    sec2.appendChild(el('div', 'section-head', '<h2>先了解，再训练</h2><span class="sub">不夸大、不神化，把证据分层讲清楚</span>'));
    var kg = el('div', 'grid');
    [
      { icon: '🧩', t: '前额叶是什么', d: '三大核心执行功能、它为什么发育最晚，以及「25 岁成熟」这个说法的真相。', h: '#/pfc' },
      { icon: '🏃', t: '锻炼到底有没有用', d: '按证据强度分层：有氧运动最硬、认知训练近迁移可靠但远迁移存疑。', h: '#/benefits' },
      { icon: '⚡', t: '前额叶受损会怎样', d: '从盖奇的铁棒到额叶综合征：不同部位损伤的不同表现。', h: '#/damage' },
      { icon: '📋', t: '怎么练：最小方案', d: '优先级排序 + 剂量建议，避免「练多了反而没效果」。', h: '#/plan' },
      { icon: '📝', t: '执行功能自评', d: '16 题快速自评，定位你最该练的维度。', h: '#/selfcheck' },
      { icon: '📖', t: '参考文献', d: '本文所有数据与结论的出处，共 20 条。', h: '#/references' }
    ].forEach(function (k) {
      var b = el('button', 'gcard');
      b.type = 'button';
      b.innerHTML = '<span class="ic">' + k.icon + '</span><h3>' + k.t + '</h3><p>' + k.d + '</p>';
      on(b, 'click', function () { App.go(k.h); });
      kg.appendChild(b);
    });
    sec2.appendChild(kg);
    v.appendChild(sec2);

    /* --- 温馨提示 --- */
    var n = el('div', 'note');
    n.style.marginTop = '28px';
    n.innerHTML = '<b>使用前请知悉：</b>本工具是认知训练与科普性质的网页应用，<b>不是医疗器械，不提供诊断或治疗</b>。若你或家人存在明显的注意力、冲动控制或情绪调节困难，请到精神科 / 神经内科就诊。数据仅保存在本机浏览器中，清理浏览器数据会一并清除记录。';
    v.appendChild(n);

    setTimeout(renderBestLabels, 0);
    return v;
  }

  function renderBestLabels() {
    var nodes = document.querySelectorAll('[data-best]');
    Array.prototype.forEach.call(nodes, function (n) {
      var id = n.getAttribute('data-best');
      var def = App.games.filter(function (x) { return x.id === id; })[0];
      if (!def || !def.bestText) { n.textContent = ''; return; }
      var list = Store.records(id);
      n.textContent = list.length ? '已训练 ' + list.length + ' 次 · ' + def.bestText(list) : '尚未训练';
    });
  }

  /* ================= 知识页 ================= */
  function articleView(section) {
    var v = el('div', 'prose');
    var back = el('button', 'btn sec', '← 返回首页');
    back.style.marginBottom = '18px';
    on(back, 'click', function () { App.go('#/'); });
    v.appendChild(back);
    v.appendChild(el('h1', '', section.title));
    v.appendChild(el('div', '', section.html));

    if (section === CONTENT.benefits || section === CONTENT.plan || section === CONTENT.pfc) {
      var a = el('div', 'btnrow');
      a.style.marginTop = '26px';
      var b2 = el('button', 'btn', '去看参考文献 →');
      on(b2, 'click', function () { App.go('#/references'); });
      a.appendChild(b2);
      v.appendChild(a);
    }
    return v;
  }

  function referencesView() {
    var v = el('div', 'prose');
    var back = el('button', 'btn sec', '← 返回首页');
    back.style.marginBottom = '18px';
    on(back, 'click', function () { App.go('#/'); });
    v.appendChild(back);
    v.appendChild(el('h1', '', '参考文献'));
    v.appendChild(el('div', 'note info',
      '共 ' + CONTENT.refs.length + ' 条。带 <i>期刊名</i> 的为同行评审论文；其中舒尔特常模为公开经验值，已在条目中明确标注其局限。所有引用均可在 Google Scholar / PubMed 按标题检索原文。'));
    var box = el('div', 'card');
    box.innerHTML = CONTENT.refs.map(function (r, i) {
      return '<div class="ref"><b>[' + (i + 1) + ']</b> ' + r.t + '<div style="margin-top:5px;font-size:12.8px;color:var(--muted)">' + r.d + '</div></div>';
    }).join('');
    v.appendChild(box);
    return v;
  }

  /* ================= 训练记录 ================= */
  function historyView() {
    var v = el('div');
    var back = el('button', 'btn sec', '← 返回首页');
    back.style.marginBottom = '18px';
    on(back, 'click', function () { App.go('#/'); });
    v.appendChild(back);
    v.appendChild(el('h1', '', '训练记录'));
    v.appendChild(el('p', '', '<span style="color:var(--muted);font-size:13.5px">仅保存在本机浏览器。单次成绩波动很正常，请关注 5–10 次以上的趋势，而不是某一次的数字。</span>'));

    var any = false;
    App.games.forEach(function (def) {
      var list = Store.records(def.id);
      if (!list.length) return;
      any = true;
      var c = el('div', 'card');
      c.style.marginBottom = '16px';
      var recent = list.slice(-12).reverse();
      c.innerHTML = '<h3 style="margin:0 0 4px">' + def.icon + ' ' + def.name +
        ' <span style="font-size:12.5px;font-weight:600;color:var(--muted)">共 ' + list.length + ' 次</span></h3>' +
        (def.bestText ? '<div style="font-size:13px;color:var(--accent);font-weight:700;margin-bottom:8px">最佳：' + def.bestText(list) + '</div>' : '');
      recent.forEach(function (r) {
        var d = el('div', 'rec');
        d.innerHTML = '<span class="g">' + (r.levelName || r.level || '') + '</span>' +
          '<span class="m">' + (def.recordText ? def.recordText(r) : '') + '</span>' +
          '<span class="t">' + UI.fmtDate(r.ts) + '</span>';
        c.appendChild(d);
      });

      var clr = el('button', 'btn sec', '清空该模块记录');
      clr.style.marginTop = '12px';
      on(clr, 'click', function () {
        if (confirm('确定清空「' + def.name + '」的全部记录？此操作不可恢复。')) {
          Store.set('pfc.rec.' + def.id, []);
          App.refresh();
        }
      });
      c.appendChild(clr);
      v.appendChild(c);
    });

    if (!any) {
      v.appendChild(el('div', 'card empty', '还没有任何训练记录。去首页选一个模块开始吧。'));
    }
    return v;
  }

  /* ================= 路由分发 ================= */
  function resolve() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('?')[0].split('/');
    return parts[0] || '';
  }

  function render() {
    if (App.cleanup) { try { App.cleanup(); } catch (e) {} App.cleanup = null; }
    var view = document.getElementById('view');
    clear(view);

    var name = resolve();
    var back = document.getElementById('btnBack');
    var sub = document.getElementById('topSub');
    var node = null;

    if (!name) {
      node = homeView();
      back.classList.remove('show');
      sub.textContent = '执行功能锻炼工坊';
    } else {
      back.classList.add('show');
      if (App.routes[name]) {
        var r = App.routes[name]();
        node = r.node || r;
        if (r && r.cleanup) App.cleanup = r.cleanup;
        if (r && r.subtitle) sub.textContent = r.subtitle;
        else sub.textContent = '前额叶训练营';
      } else {
        node = el('div', 'card empty', '页面不存在。<a href="#/">返回首页</a>');
        sub.textContent = '前额叶训练营';
      }
    }
    view.appendChild(node);
    window.scrollTo(0, 0);
  }

  App.refresh = render;

  /* ---------- 注册静态路由 ---------- */
  App.route('pfc', function () { return { node: articleView(CONTENT.pfc), subtitle: '前额叶是什么' }; });
  App.route('benefits', function () { return { node: articleView(CONTENT.benefits), subtitle: '锻炼的好处 · 证据分层' }; });
  App.route('damage', function () { return { node: articleView(CONTENT.damage), subtitle: '前额叶受损' }; });
  App.route('plan', function () { return { node: articleView(CONTENT.plan), subtitle: '训练方案建议' }; });
  App.route('references', function () { return { node: referencesView(), subtitle: '参考文献' }; });
  App.route('history', function () { return { node: historyView(), subtitle: '训练记录' }; });

  /* ---------- 为每个训练模块注册路由 ---------- */
  App.games.forEach(function (def) {
    App.route(def.id, function () {
      var host = el('div');
      var cleanup = def.mount(host);
      return {
        node: host,
        cleanup: (typeof cleanup === 'function' ? cleanup : null),
        subtitle: def.name
      };
    });
  });

  /* ---------- 绑定 ---------- */
  function boot() {
    on(window, 'hashchange', render);
    on(document.getElementById('btnBack'), 'click', function () { App.go('#/'); });
    on(document.getElementById('btnHistory'), 'click', function () { App.go('#/history'); });
    on(document.getElementById('btnHelp'), 'click', function () {
      UI.modal([
        '<h2>关于本工具</h2>',
        '<p>一个纯本地运行的前额叶（执行功能）训练网页。所有代码不依赖网络与第三方库，双击 <code>index.html</code> 即可使用。</p>',
        '<h3 style="font-size:15px">包含 5 个训练模块</h3>',
        '<ul>',
        '<li><b>旋转数字盘</b> — 多层同心圆环不同速度旋转，限时按 1→N 顺序点击（视觉搜索 + 注意分配 + 工作记忆）</li>',
        '<li><b>舒尔特方格</b> — 经典注意力训练，3×3 至 6×6</li>',
        '<li><b>N-back 工作记忆</b> — 判断当前刺激是否与 N 步前相同</li>',
        '<li><b>Stroop 色词干扰</b> — 忽略字义、按字的颜色作答（抑制控制）</li>',
        '<li><b>Go / No-Go</b> — 绿灯点、红灯忍（反应抑制）</li>',
        '</ul>',
        '<h3 style="font-size:15px">数据与隐私</h3>',
        '<p>成绩记录保存在浏览器 localStorage 中，不会上传到任何服务器。清理浏览器数据或在记录页手动清空即会删除。</p>',
        '<div class="note"><b>免责声明：</b>本工具仅用于认知训练与科普，<b>不构成医疗诊断、治疗建议或心理测量结论</b>。自评量表的分数不能用于自我诊断。如有注意力、冲动控制或情绪方面的困扰，请就诊精神科 / 神经内科或咨询临床心理师。</div>',
        '<div class="btnrow" style="justify-content:flex-end"><button class="btn" data-close>知道了</button></div>'
      ].join(''));
    });
    render();
  }

  if (document.readyState === 'loading') on(document, 'DOMContentLoaded', boot);
  else boot();
})();
