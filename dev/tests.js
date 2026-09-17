/* _tests.js — 由 _run.js 通过 CDP 注入执行，返回测试报告字符串 */
(async function () {
  var R = [];
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function E(e) { return e && e.message ? e.message : String(e); }
  function T(name, fn) {
    try { fn(); R.push('PASS | ' + name); }
    catch (e) { R.push('FAIL | ' + name + ' :: ' + E(e)); }
  }
  async function TA(name, fn) {
    try { await fn(); R.push('PASS | ' + name); }
    catch (e) { R.push('FAIL | ' + name + ' :: ' + E(e)); }
  }
  function assert(c, m) { if (!c) throw new Error(m); }
  var view = function () { return document.getElementById('view'); };
  var ov = function () { return document.querySelector('.overlay'); };
  var ovText = function () { var o = ov(); return o ? o.textContent : ''; };
  var hud = function (i) {
    var b = document.querySelectorAll('.hud .h b');
    return b[i] ? b[i].textContent : null;
  };
  /* 结果卡结构为 <b>值</b><span>标签</span>，必须按标签精确取值 */
  function stat(label) {
    var out = null;
    Array.prototype.forEach.call(document.querySelectorAll('.overlay .stat'), function (s) {
      var sp = s.querySelector('span'), b = s.querySelector('b');
      if (sp && b && sp.textContent === label) out = b.textContent.trim();
    });
    return out;
  }
  function findBtn(re) {
    var list = document.querySelectorAll('button');
    for (var i = 0; i < list.length; i++) {
      if (re.test(list[i].textContent) && list[i].offsetParent !== null) return list[i];
    }
    return null;
  }
  async function go(hash) {
    if (location.hash !== hash) { location.hash = hash; await sleep(150); }
    else { App.refresh(); await sleep(70); }
  }
  async function waitFor(fn, ms, step) {
    var t = 0; step = step || 300;
    while (t < ms) { if (fn()) return true; await sleep(step); t += step; }
    return fn();
  }
  var errs = [];
  window.onerror = function (m, s, l, c) { errs.push(m + ' @' + l + ':' + c); };
  window.addEventListener('unhandledrejection', function (e) { errs.push('REJECT ' + E(e.reason)); });

  R.push('== 环境 ==');
  R.push('App.games = ' + App.games.map(function (g) { return g.id; }).join(','));
  R.push('localStorage 可用 = ' + (function () { try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; } catch (e) { return false; } })());
  var wiped = 0;
  try {
    wiped = localStorage.length;
    localStorage.clear();
  } catch (e) {}
  R.push('测试前已清空 localStorage（原有 ' + wiped + ' 条键）');
  R.push('清空后各模块记录数 = ' + ['wheel', 'schulte', 'nback', 'stroop', 'gonogo', 'selfcheck']
    .map(function (id) { return id + ':' + Store.records(id).length; }).join(' '));
  R.push('');
  await go('#/');
  T('首页渲染完整', function () {
    ['前额叶训练营', '旋转数字盘', '舒尔特方格', 'N-back', 'Stroop', 'Go / No-Go', '执行功能自评', '参考文献']
      .forEach(function (k) { assert(view().textContent.indexOf(k) >= 0, '缺少: ' + k); });
    var cards = document.querySelectorAll('.grid .gcard').length;
    assert(cards >= 11, '卡片数异常: ' + cards);
    R.push('INFO | 首页卡片数 = ' + cards);
  });
  T('首页 5 个训练模块 + 1 个隐藏测评', function () {
    assert(App.games.length === 6, 'games=' + App.games.length);
    assert(App.games.filter(function (g) { return !g.hidden; }).length === 5, '可见模块数不符');
    assert(/尚未训练/.test(view().textContent), '缺最佳成绩占位');
  });

  /* ---------- 2. 知识页 ---------- */
  var PAGES = [['#/pfc', '前额叶'], ['#/benefits', '证据'], ['#/damage', 'Phineas'],
               ['#/plan', '最小方案'], ['#/references', '参考文献']];
  for (var p = 0; p < PAGES.length; p++) {
    await go(PAGES[p][0]);
    (function (pg) {
      T('知识页 ' + pg[0] + ' 含「' + pg[1] + '」', function () {
        assert(view().textContent.indexOf(pg[1]) >= 0, '缺少 ' + pg[1]);
      });
    })(PAGES[p]);
  }
  await go('#/references');
  T('参考文献 = ' + CONTENT.refs.length + ' 条', function () {
    var n = document.querySelectorAll('.ref').length;
    assert(n === CONTENT.refs.length, '实际 ' + n + ' 条');
    assert(n >= 18, '条数过少');
  });
  await go('#/pfc');
  T('前额叶页含核心功能表与提示框', function () {
    assert(document.querySelectorAll('.prose table').length >= 1, '缺核心功能表');
    assert(document.querySelectorAll('.note').length >= 1, '缺提示框');
    assert(view().textContent.indexOf('抑制控制') >= 0 && view().textContent.indexOf('工作记忆') >= 0, '缺核心 EF 定义');
  });
  await go('#/damage');
  T('受损页含部位对照表与清单', function () {
    assert(document.querySelectorAll('.prose table').length >= 1, '缺部位对照表');
    assert(document.querySelectorAll('.prose ul,.prose ol').length >= 2, '清单不足');
    assert(view().textContent.indexOf('额叶综合征') >= 0, '缺额叶综合征');
    assert(view().textContent.indexOf('眶额') >= 0 && view().textContent.indexOf('背外侧') >= 0, '缺分区表现');
  });
  await go('#/benefits');
  T('锻炼好处页按证据强度分层', function () {
    assert(document.querySelectorAll('.prose h3').length >= 4, '分层小节不足');
    assert(view().textContent.indexOf('近迁移') >= 0 && view().textContent.indexOf('远迁移') >= 0, '缺迁移概念');
    assert(view().textContent.indexOf('WHO') >= 0, '缺 WHO 指南');
  });

  /* ---------- 3. 各模块路由可挂载 ---------- */
  var IDS = ['wheel', 'schulte', 'nback', 'stroop', 'gonogo', 'selfcheck'];
  for (var q = 0; q < IDS.length; q++) {
    await go('#/' + IDS[q]);
    (function (id) {
      T('路由 #/' + id + ' 正常渲染', function () {
        assert(view().textContent.length > 80, id + ' 内容过少');
      });
    })(IDS[q]);
  }

  /* ---------- 4. 自评量表 ---------- */
  await go('#/selfcheck');
  await TA('自评量表 16 题作答 → 出分', async function () {
    var rows = document.querySelectorAll('.qitem');
    assert(rows.length === 16, '题目数=' + rows.length);
    Array.prototype.forEach.call(rows, function (row) {
      var bs = row.querySelectorAll('.likert button');
      assert(bs.length === 5, '选项数异常');
      bs[2].click();
    });
    var submit = null;
    Array.prototype.forEach.call(document.querySelectorAll('button'), function (b) {
      if (b.textContent.trim() === '查看结果') submit = b;
    });
    assert(submit && !submit.disabled, '提交不可用');
    submit.click();
    await sleep(150);
    var out = document.getElementById('scResult');
    assert(out && out.textContent.length > 80, '未生成结果');
    assert(out.textContent.indexOf('/ 80') >= 0, '缺总分');
    assert(out.textContent.indexOf('各维度得分') >= 0, '缺维度明细');
    assert(out.textContent.indexOf('重要声明') >= 0, '缺免责声明');
    assert(document.querySelectorAll('#scResult .bar').length >= 1, '缺总分等级条');
    assert(document.querySelectorAll('#scResult .dimbar').length === 4, '缺 4 条维度条');
    R.push('INFO | 自评结果 = ' + out.querySelector('.score').textContent.trim().replace(/\s+/g, '') +
           ' 等级=' + out.querySelector('.band h3').textContent);
  });

  /* ---------- 5. 旋转数字盘 ---------- */
  await go('#/wheel');
  T('旋转盘 说明页 / 开始按钮 / 2 行选择器 + 5 档难度', function () {
    assert(document.querySelector('.stage canvas'), '缺 canvas');
    assert(ovText().indexOf('开始训练') >= 0, '缺开始按钮');
    assert(document.querySelectorAll('.levelrow').length === 2, '应有「布局」与「难度」两行');
    assert(document.querySelectorAll('.levelrow')[1].querySelectorAll('.lv').length === 5, '难度档数异常');
  });
  T('旋转盘 点开始 → 遮罩隐藏、目标=1', function () {
    var b = findBtn(/开始训练/); assert(b, '找不到开始按钮'); b.click();
    assert(ov().classList.contains('hidden'), '遮罩未隐藏');
    assert(hud(0) === '1', 'HUD 目标应初始为 1，实际 ' + hud(0));
  });
  T('旋转盘 点环外计入失误', function () {
    var cv = document.querySelector('.stage canvas');
    var rect = cv.getBoundingClientRect();
    var before = parseInt(hud(3), 10);
    cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: rect.left + 5, clientY: rect.top + 5, bubbles: true }));
    assert(parseInt(hud(3), 10) === before + 1, '环外点击未计失误');
  });
  await TA('旋转盘 逐个锁定目标可通关（命中判定 + 通关流程）', async function () {
    var cv = document.querySelector('.stage canvas');
    var rect = cv.getBoundingClientRect();
    assert(rect.width > 100, 'canvas 宽度异常 ' + rect.width);
    function clickAt(rad, deg) {
      var th = deg * Math.PI / 180;
      cv.dispatchEvent(new PointerEvent('pointerdown', {
        clientX: rect.left + (360 + Math.cos(th) * rad) / 720 * rect.width,
        clientY: rect.top + (360 + Math.sin(th) * rad) / 720 * rect.height,
        bubbles: true, cancelable: true
      }));
    }
    var RADII = [139, 273];
    function progress() { return parseInt(hud(2), 10) || 0; }
    var clicks = 0;
    for (var target = 1; target <= 12; target++) {
      var before = progress();
      assert(before === target - 1, '进度异常，期望 ' + (target - 1) + ' 实际 ' + before);
      var found = false;
      for (var r = 0; r < RADII.length && !found; r++) {
        for (var a = 0; a < 360 && !found; a += 2) {
          clickAt(RADII[r], a); clicks++;
          if (progress() > before) { found = true; }
        }
      }
      assert(found, '整圈扫描仍无法命中目标 ' + target);
    }
    R.push('INFO | 旋转盘：' + clicks + ' 次点击完成 1→12，失误 ' + hud(3));
    assert(ovText().indexOf('完成') >= 0, '未通关，进度 ' + hud(2));
    assert(stat('准确率') !== null, '结果缺准确率');
  });

  /* ---------- 6. 舒尔特方格 ---------- */
  await go('#/schulte');
  T('舒尔特 默认 4×4 且方格已铺好', function () {
    var n = document.querySelectorAll('.schulte-grid .cell').length;
    assert(n === 16, '格数异常: ' + n);
    assert(document.querySelectorAll('.levelrow .lv').length === 4, '难度档数异常');
  });
  T('舒尔特 顺序点完 → 出结果', function () {
    var b = findBtn(/开始训练/); assert(b, '找不到开始按钮'); b.click();
    var cells = document.querySelectorAll('.schulte-grid .cell');
    var map = {};
    Array.prototype.forEach.call(cells, function (c) { map[c.textContent.trim()] = c; });
    for (var v = 1; v <= 16; v++) { assert(map[v], '缺数字' + v); map[v].click(); }
    assert(ovText().indexOf('完成') >= 0, '未完成: ' + ovText().slice(0, 60));
    assert(stat('通行基线') !== null, '缺基线对比');
    R.push('INFO | 舒尔特结果 = ' + (ovText().match(/用时[\s\S]{0,14}/) || [''])[0].trim());
  });
  T('舒尔特 错误点击计失误', function () {
    var b = findBtn(/换一组数字/); assert(b, '找不到重开按钮'); b.click();
    var cells = document.querySelectorAll('.schulte-grid .cell');
    var map = {};
    Array.prototype.forEach.call(cells, function (c) { map[c.textContent.trim()] = c; });
    map['9'].click();
    assert(parseInt(hud(3), 10) === 1, '失误计数异常: ' + hud(3));
  });
  T('舒尔特 点过的格子不变色（仅标记 done，视觉保持原样）', function () {
    // 重新开局，保证处于运行中且 next=1
    var lvs = document.querySelectorAll('.levelrow .lv');
    lvs[0].click();                       // 切到 3×3，会重建方格并弹说明
    var b = findBtn(/开始训练/); assert(b, '找不到开始按钮'); b.click();
    var cells = document.querySelectorAll('.schulte-grid .cell');
    var map = {};
    Array.prototype.forEach.call(cells, function (c) { map[c.textContent.trim()] = c; });
    var c1 = map['1'], c2 = map['2'];
    assert(c1 && c2, '缺少数字格');
    var bgBefore = getComputedStyle(c1).backgroundColor;
    var colBefore = getComputedStyle(c1).color;
    c1.click();
    assert(c1.classList.contains('done'), '正确点击未标记 done');
    var bgAfter = getComputedStyle(c1).backgroundColor;
    var colAfter = getComputedStyle(c1).color;
    assert(bgBefore === bgAfter, '点后背景色变了: ' + bgBefore + ' → ' + bgAfter);
    assert(colBefore === colAfter, '点后文字色变了: ' + colBefore + ' → ' + colAfter);
    // 与未点过的格子对比，样式应完全一致（不再用视觉区分已点/未点）
    assert(getComputedStyle(c1).backgroundColor === getComputedStyle(c2).backgroundColor,
      '点过的格子与未点格子背景不一致（仍在视觉上区分）');
    assert(getComputedStyle(c1).color === getComputedStyle(c2).color,
      '点过的格子与未点格子文字色不一致（仍在视觉上区分）');
  });
  T('舒尔特 切难度到 6×6 → 36 格', function () {
    var lvs = document.querySelectorAll('.levelrow .lv');
    lvs[3].click();
    var n = document.querySelectorAll('.schulte-grid .cell').length;
    assert(n === 36, '6x6 格数异常: ' + n);
    var hv = document.querySelectorAll('.hud .h b')[1];
    assert(hv.textContent === '—' || hv.textContent === '0.0s', '切难度后计时未复位: ' + hv.textContent);
  });

  /* ---------- 7. N-back ---------- */
  await go('#/nback');
  T('N-back 说明页 4 档难度', function () {
    assert(document.querySelectorAll('.levelrow .lv').length === 4, '难度档数异常');
    assert(ovText().indexOf('开始训练') >= 0, '缺开始按钮');
  });
  await TA('N-back 倒计时后出现字母刺激', async function () {
    var b = findBtn(/开始训练/); assert(b, '找不到开始按钮'); b.click();
    assert(hud(0).indexOf('back') >= 0, 'HUD 规则异常: ' + hud(0));
    await sleep(2800);
    var l = document.querySelector('.nb-letter');
    assert(l, '缺刺激容器');
    var txt = l.textContent.trim();
    assert(txt && txt !== '·' && txt !== '准备' && txt.length === 1, '未出现字母: [' + txt + ']');
    R.push('INFO | N-back 刺激样本 = ' + txt);
  });
  await TA('N-back 试次持续推进', async function () {
    await sleep(6000);
    var prog = hud(1);
    assert(parseInt(prog, 10) >= 1, '进度未推进: ' + prog);
    R.push('INFO | N-back 进度 = ' + prog);
  });

  /* ---------- 8. Stroop ---------- */
  await go('#/stroop');
  T('Stroop 4 个颜色按钮 + 4 档难度', function () {
    assert(document.querySelectorAll('.cbtn').length === 4, '颜色按钮数异常');
    assert(document.querySelectorAll('.levelrow .lv').length === 4, '难度档数异常');
  });
  await TA('Stroop 全程按墨色作答 24 题 → 出结果', async function () {
    var b = findBtn(/开始训练/); assert(b, '找不到开始'); b.click();
    await sleep(2400);
    for (var k = 0; k < 400; k++) {
      if (stat('冲突代价') !== null) break;
      var wb = document.querySelector('.stroop-word');
      if (!wb) break;
      var txt = wb.textContent.trim();
      var ink = wb.style.color;
      // 仅在真正呈现色词时作答（反馈态显示 ✓/✗/⏱）
      if (/^[红绿蓝黄]$/.test(txt) && ink && ink.indexOf('rgb') === 0) {
        var hit = null;
        Array.prototype.forEach.call(document.querySelectorAll('.cbtn'), function (x) {
          var bg = x.style.background || x.style.backgroundColor;
          if (bg === ink) hit = x;
        });
        assert(hit, '找不到与墨色匹配的按钮 ink=' + ink);
        hit.click();
      }
      await sleep(120);
    }
    var acc = stat('正确率'), cost = stat('冲突代价');
    assert(acc !== null && cost !== null, '未出结果: ' + ovText().slice(0, 80));
    R.push('INFO | Stroop 结果：正确率 ' + acc + ' / 答对 ' + stat('答对') + ' / 答错 ' + stat('答错') +
           ' / 超时 ' + stat('超时') + ' / 冲突代价 ' + cost);
    assert(parseInt(acc, 10) >= 90, '按墨色作答的正确率应 ≥90%，实际 ' + acc);
    assert(cost !== '—', '缺冲突代价数值');
  });

  /* ---------- 9. Go / No-Go ---------- */
  await go('#/gonogo');
  T('Go/No-Go 渲染 / 4 档难度 / 试次数已缩短', function () {
    assert(document.querySelector('.gn-arena'), '缺竞技场');
    assert(document.querySelectorAll('.levelrow .lv').length === 4, '难度档数异常');
    assert(ovText().indexOf('24 个试次') >= 0, '试次数应为 24: ' + ovText().slice(0, 80));
  });
  await TA('Go/No-Go 跑完整轮 → 输出冲动错误率', async function () {
    var b = findBtn(/开始训练/); assert(b, '找不到开始'); b.click();
    await sleep(2500);
    var arena = document.querySelector('.gn-arena');
    var seen = {};
    var tick = setInterval(function () {
      // 顺带采样刺激颜色 class，并与实际背景色对照
      var sh = document.querySelector('.gn-shape');
      if (sh) {
        if (sh.classList.contains('go')) seen.go = (seen.go || 0) + 1;
        if (sh.classList.contains('nogo')) seen.nogo = (seen.nogo || 0) + 1;
        if ((sh.classList.contains('go') || sh.classList.contains('nogo')) && !seen.bg) {
          seen.bg = getComputedStyle(sh).backgroundColor;
        }
      }
      arena.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
    }, 260);
    var ok = await waitFor(function () { return stat('冲动错误') !== null && /冲动错误率/.test(ovText()); }, 70000, 400);
    clearInterval(tick);
    assert(ok, '未出结果: ' + ovText().slice(0, 90));
    R.push('INFO | Go/No-Go 结果：总正确率 ' + stat('总正确率') + ' / 命中 ' + stat('命中(Go)') +
           ' / 漏报 ' + stat('漏报') + ' / 冲动错误 ' + stat('冲动错误') + ' / 忍住 ' + stat('成功忍住'));
    assert(stat('总正确率') !== null, '缺总正确率');
    assert(/冲动错误率/.test(ovText()), '缺冲动错误率指标');
    // 刺激必须真的带颜色：go=绿、nogo=红（此前 bug 会导致 Go 刺激无色）
    assert(seen.go && seen.nogo, '未同时观察到 go / nogo 刺激');
    assert(seen.bg && seen.bg !== 'rgba(0, 0, 0, 0)', 'go/nogo 刺激缺少背景色: ' + seen.bg);
    R.push('INFO | Go/No-Go 刺激采样 go=' + seen.go + ' nogo=' + seen.nogo + ' bg=' + seen.bg);
  });

  /* ---------- 10. 记录与清理 ---------- */
  T('训练记录已写入本地存储（每个模块各 1 条）', function () {
    ['wheel', 'schulte', 'selfcheck', 'stroop', 'gonogo'].forEach(function (id) {
      assert(Store.records(id).length === 1, id + ' 记录数应为 1，实际 ' + Store.records(id).length);
    });
    assert(Store.records('nback').length === 0, 'N-back 未完成不应有记录');
    R.push('INFO | 记录数 = ' + ['wheel', 'schulte', 'nback', 'stroop', 'gonogo', 'selfcheck']
      .map(function (id) { return id + ':' + Store.records(id).length; }).join(' '));
  });
  await go('#/history');
  T('记录页展示统计与逐条明细', function () {
    var t = view().textContent;
    assert(t.indexOf('训练记录') >= 0, '缺标题');
    assert(t.indexOf('最佳') >= 0, '缺最佳成绩');
    assert(document.querySelectorAll('.rec').length === 5, '记录行应为 5，实际 ' + document.querySelectorAll('.rec').length);
    R.push('INFO | 记录页行数 = ' + document.querySelectorAll('.rec').length);
  });
  await go('#/');
  T('回首页后旧视图被清理、最佳成绩已刷新', function () {
    assert(document.querySelectorAll('.stage').length === 0, '旧视图未清理');
    var t = view().textContent;
    assert(t.indexOf('已训练') >= 0, '最佳成绩标签未刷新');
    assert(t.indexOf('尚未训练') >= 0, 'N-back/自评等未训练项应显示尚未训练');
  });

  await sleep(200);
  R.push('');
  R.push('== 运行期未捕获错误 ==');
  R.push(errs.length ? errs.join('\n') : '（无）');
  var f = R.filter(function (x) { return x.indexOf('FAIL') === 0; }).length;
  R.push('');
  R.push('== 汇总: ' + R.filter(function (x) { return x.indexOf('PASS') === 0; }).length + ' passed, ' + f + ' failed ==');
  return R.join('\n');
})()
