/* wheel 专项验证：单盘同心环 / 多个小转盘 / 嵌套多盘 三种布局
   多盘几何常量与 wheel.js 的 makeUnits() 保持一致：
   margin=30, gap=60 → cell=300, R=150, 盘内环内半径 = R*0.34 = 51
   count≤16 → 2 盘；count>16 → 4 盘
   多盘单环数字半径 = (51+150)/2 = 100.5
   嵌套多盘每盘两环半径 = 51+(49.5/2)=75.75 与 51+49.5+(49.5/2)=125.25 */
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
  var ov = function () { return document.querySelector('.overlay'); };
  var ovText = function () { var o = ov(); return o ? o.textContent : ''; };
  var hud = function (i) {
    var b = document.querySelectorAll('.hud .h b');
    return b[i] ? b[i].textContent : null;
  };
  function stat(label) {
    var out = null;
    Array.prototype.forEach.call(document.querySelectorAll('.overlay .stat'), function (s) {
      var sp = s.querySelector('span'), b = s.querySelector('b');
      if (sp && b && sp.textContent === label) out = b.textContent.trim();
    });
    return out;
  }
  var rows = function () { return document.querySelectorAll('.levelrow'); };
  var modeBtns = function () { return rows()[0].querySelectorAll('.lv'); };
  var lvBtns = function () { return rows()[1].querySelectorAll('.lv'); };
  function findBtn(re, scope) {
    var list = (scope || document).querySelectorAll('button');
    for (var i = 0; i < list.length; i++) {
      if (re.test(list[i].textContent) && list[i].offsetParent !== null) return list[i];
    }
    return null;
  }
  function startGame() {
    var b = findBtn(/开始训练/);
    assert(b, '找不到开始按钮');
    b.click();
  }
  function clickAbs(lx, ly) {
    var cv = document.querySelector('.stage canvas'), rect = cv.getBoundingClientRect();
    cv.dispatchEvent(new PointerEvent('pointerdown', {
      clientX: rect.left + lx / 720 * rect.width,
      clientY: rect.top + ly / 720 * rect.height,
      bubbles: true, cancelable: true
    }));
  }
  function progress() { return parseInt(hud(2), 10) || 0; }
  function hitTargets(centers, radii) {
    var before = progress();
    for (var c = 0; c < centers.length; c++)
      for (var ri = 0; ri < radii.length; ri++)
        for (var a = 0; a < 360; a += 2) {
          var th = a * Math.PI / 180;
          clickAbs(centers[c][0] + Math.cos(th) * radii[ri], centers[c][1] + Math.sin(th) * radii[ri]);
          if (progress() > before) return true;
        }
    return false;
  }
  var errs = [];
  window.onerror = function (m, s, l, c) { errs.push(m + ' @' + l + ':' + c); };
  window.addEventListener('unhandledrejection', function (e) { errs.push('REJECT ' + E(e.reason)); });

  try { localStorage.clear(); } catch (e) {}

  var M2 = [[180, 360], [540, 360]];
  var M4 = [[180, 180], [540, 180], [180, 540], [540, 540]];
  var MULTI_RAD = 100.5;
  var NEST_RAD = [75.75, 125.25];

  location.hash = '#/wheel';
  await sleep(350);

  T('布局(3)与难度(5)选择器已渲染', function () {
    assert(rows().length === 2, '.levelrow 数量应为 2，实际 ' + rows().length);
    assert(modeBtns().length === 3, '布局按钮数应为 3，实际 ' + modeBtns().length);
    assert(lvBtns().length === 5, '难度按钮数异常: ' + lvBtns().length);
    assert(/单盘同心环/.test(modeBtns()[0].textContent), '缺少单盘按钮');
    assert(/多个小转盘/.test(modeBtns()[1].textContent), '缺少多盘按钮');
    assert(/嵌套多盘/.test(modeBtns()[2].textContent), '缺少嵌套多盘按钮');
  });

  T('默认布局 = 单盘同心环，难度提示为环数', function () {
    assert(modeBtns()[0].classList.contains('on'), '默认未选中单盘');
    assert(/2 环 · 12 个数/.test(lvBtns()[0].textContent), '单盘难度提示异常: ' + lvBtns()[0].textContent);
  });

  /* 回归：st 为 null 时切换布局/难度（曾因 stopLoop 空引用抛 TypeError） */
  T('未开局就切布局与难度不崩溃', function () {
    var errsBefore = errs.length;
    modeBtns()[2].click();   // 嵌套
    lvBtns()[2].click();     // 困难
    modeBtns()[1].click();   // 多盘
    lvBtns()[0].click();     // 入门
    modeBtns()[0].click();   // 单盘
    assert(errs.length === errsBefore, '切换过程抛出异常: ' + errs.slice(errsBefore).join('; '));
    assert(modeBtns()[0].classList.contains('on'), '未切回单盘');
    assert(lvBtns()[0].classList.contains('on'), '未切回入门');
  });

  /* ---------- 多盘 ---------- */
  await TA('切到「多个小转盘」：难度提示随布局变化', async function () {
    modeBtns()[1].click();
    await sleep(250);
    assert(modeBtns()[1].classList.contains('on'), '多盘按钮未选中');
    assert(/2 盘 × 1 环/.test(lvBtns()[0].textContent), '入门档多盘提示异常: ' + lvBtns()[0].textContent);
    assert(/4 盘 × 1 环/.test(lvBtns()[1].textContent), '标准档多盘提示异常: ' + lvBtns()[1].textContent);
    assert(/4 盘 × 1 环/.test(lvBtns()[3].textContent), '大师档多盘提示异常: ' + lvBtns()[3].textContent);
    assert(/多个小转盘/.test(ovText()), '说明页未显示模式名');
    assert(stat('转盘数') === '2', '入门档说明页应显示 2 个转盘，实际 ' + stat('转盘数'));
    assert(stat('每盘环数') === '1', '多盘每盘环数应为 1，实际 ' + stat('每盘环数'));
  });

  await TA('多盘 · 入门（2 盘 × 6 个数）扫描通关', async function () {
    startGame();
    assert(ov().classList.contains('hidden'), '遮罩未隐藏');
    assert(hud(0) === '1', '初始目标应为 1，实际 ' + hud(0));
    await sleep(400);
    for (var target = 1; target <= 12; target++) {
      var before = progress();
      assert(before === target - 1, '进度异常，期望 ' + (target - 1) + ' 实际 ' + before);
      assert(hitTargets(M2, [MULTI_RAD]), '无法命中目标 ' + target);
    }
    R.push('INFO | 2 盘通关，失误 ' + hud(3));
    assert(ovText().indexOf('完成') >= 0, '未通关: ' + ovText().slice(0, 60));
    assert(/多个小转盘/.test(ovText()), '结果页未显示模式名');
    var rec = Store.records('wheel')[0];
    assert(rec && rec.modeName === '多个小转盘' && rec.mode === 'multi', '记录异常: ' + JSON.stringify(rec && rec.mode));
  });

  await TA('多盘 · 标准（4 盘）可正常开始并推进', async function () {
    lvBtns()[1].click();
    await sleep(200);
    assert(stat('转盘数') === '4', '标准档应显示 4 个转盘，实际 ' + stat('转盘数'));
    startGame();
    await sleep(400);
    for (var t = 1; t <= 3; t++) {
      var before = progress();
      assert(hitTargets(M4, [MULTI_RAD]), '4 盘模式无法命中目标 ' + t);
      assert(progress() === before + 1, '进度未推进');
    }
    R.push('INFO | 4 盘模式前 3 个数字命中正常，失误 ' + hud(3));
  });

  /* ---------- 嵌套多盘（核心新增） ---------- */
  await TA('切到「嵌套多盘」：提示为 每盘 2 环', async function () {
    modeBtns()[2].click();
    await sleep(200);
    lvBtns()[0].click();   // 设为入门（12 个数 → 2 盘），便于后续 2 盘扫描
    await sleep(200);
    assert(modeBtns()[2].classList.contains('on'), '嵌套按钮未选中');
    assert(/2 盘 × 2 环/.test(lvBtns()[0].textContent), '入门档嵌套提示异常: ' + lvBtns()[0].textContent);
    assert(/4 盘 × 2 环/.test(lvBtns()[1].textContent), '标准档嵌套提示异常: ' + lvBtns()[1].textContent);
    assert(/嵌套多盘/.test(ovText()), '说明页未显示模式名');
    assert(stat('转盘数') === '2', '入门档应显示 2 个盘，实际 ' + stat('转盘数'));
    assert(stat('每盘环数') === '2', '嵌套每盘环数应为 2，实际 ' + stat('每盘环数'));
  });

  await TA('嵌套多盘 · 入门（2 盘 × 各 2 环 × 6 个数）扫描通关', async function () {
    startGame();
    assert(ov().classList.contains('hidden'), '遮罩未隐藏');
    await sleep(400);
    for (var target = 1; target <= 12; target++) {
      var before = progress();
      assert(before === target - 1, '进度异常，期望 ' + (target - 1) + ' 实际 ' + before);
      assert(hitTargets(M2, NEST_RAD), '嵌套模式无法命中目标 ' + target);
    }
    R.push('INFO | 嵌套 2 盘通关，失误 ' + hud(3));
    assert(ovText().indexOf('完成') >= 0, '未通关: ' + ovText().slice(0, 60));
    assert(/嵌套多盘/.test(ovText()), '结果页未显示模式名');
    var recs = Store.records('wheel');
    var rec = recs[recs.length - 1];
    assert(rec && rec.modeName === '嵌套多盘' && rec.mode === 'nested', '记录异常: ' + JSON.stringify(rec && rec.mode));
  });

  await TA('嵌套多盘 · 标准（4 盘）可正常推进', async function () {
    lvBtns()[1].click();
    await sleep(200);
    assert(stat('转盘数') === '4' && stat('每盘环数') === '2', '标准档嵌套提示异常: 盘' + stat('转盘数') + ' 环' + stat('每盘环数'));
    startGame();
    await sleep(400);
    for (var t = 1; t <= 4; t++) {
      var before = progress();
      assert(hitTargets(M4, NEST_RAD), '嵌套 4 盘无法命中目标 ' + t);
      assert(progress() === before + 1, '进度未推进');
    }
    R.push('INFO | 嵌套 4 盘前 4 个数字命中正常，失误 ' + hud(3));
  });

  /* ---------- 切回单盘 ---------- */
  await TA('切回单盘同心环仍可正常开新一轮', async function () {
    modeBtns()[0].click();
    await sleep(250);
    assert(modeBtns()[0].classList.contains('on'), '未切回单盘');
    assert(/3 环 · 20 个数/.test(lvBtns()[1].textContent), '单盘提示未恢复: ' + lvBtns()[1].textContent);
    assert(stat('圆环数') === '3', '说明页应显示 3 个圆环，实际 ' + stat('圆环数'));
    startGame();
    await sleep(300);
    assert(hud(0) === '1' && hud(2) === '0 / 20', '新一轮状态异常: ' + hud(0) + ' / ' + hud(2));
    var hit = false, before = progress();
    [116.67, 206, 295.33].forEach(function (r) {
      if (hit) return;
      for (var a = 0; a < 360 && !hit; a += 2) {
        var th = a * Math.PI / 180;
        clickAbs(360 + Math.cos(th) * r, 360 + Math.sin(th) * r);
        if (progress() > before) hit = true;
      }
    });
    assert(hit, '切回单盘后无法命中目标 1');
    R.push('INFO | 切回单盘后命中正常');
  });

  await TA('嵌套模式计时与暂停字段仍正常', async function () {
    modeBtns()[2].click();
    lvBtns()[1].click();
    await sleep(200);
    var limit = parseInt(hud(1).split(':')[0], 10) * 60 + parseInt(hud(1).split(':')[1], 10);
    startGame();
    await sleep(2300);
    var mm = hud(1).split(':');
    var sec = parseInt(mm[0], 10) * 60 + parseInt(mm[1], 10);
    assert(sec <= limit - 2 && sec >= limit - 4, '倒计时未正常流逝: ' + hud(1) + '（开局 ' + limit + 's）');
    R.push('INFO | 嵌套 2.3s 后剩余 = ' + hud(1) + '（限时 ' + limit + 's）');
  });

  /* ---------- 新增：炼狱难度档 + 随机换位机制 ---------- */
  await TA('入门/标准档不出现「随机换位」开关', async function () {
    modeBtns()[0].click();    // 单盘
    lvBtns()[0].click();      // 入门
    await sleep(250);
    assert(!findBtn(/随机换位/), '低档不应出现随机换位开关');
    assert(/2 环 · 12 个数 · 慢速/.test(lvBtns()[0].textContent), '入门档提示异常: ' + lvBtns()[0].textContent);
  });

  await TA('大师档出现「随机换位」开关且默认关闭', async function () {
    lvBtns()[3].click();
    await sleep(250);
    var b = findBtn(/随机换位/);
    assert(b, '大师档应出现随机换位开关');
    assert(!b.classList.contains('on'), '大师档换位应默认关闭');
    assert(/可换位/.test(lvBtns()[3].textContent), '大师档提示应含「可换位」: ' + lvBtns()[3].textContent);
    assert(stat('随机换位') === '关', '说明页换位应显示「关」，实际 ' + stat('随机换位'));
  });

  await TA('开启换位 → HUD 出现「下次换位」且倒计时递减', async function () {
    findBtn(/随机换位/).click();
    await sleep(150);
    assert(findBtn(/随机换位/).classList.contains('on'), '换位未开启');
    assert(stat('随机换位') === '开', '说明页换位应显示「开」，实际 ' + stat('随机换位'));
    startGame();
    await sleep(500);
    function sw() {
      var v = null;
      Array.prototype.forEach.call(document.querySelectorAll('.hud .h'), function (h) {
        var sp = h.querySelector('span');
        if (sp && /下次换位/.test(sp.textContent)) v = parseFloat(h.querySelector('b').textContent);
      });
      return v;
    }
    var a = sw();
    assert(a !== null, 'HUD 未出现「下次换位」');
    await sleep(1200);
    var b2 = sw();
    assert(b2 !== null && b2 < a, '换位倒计时未递减: ' + a + ' → ' + b2);
    R.push('INFO | 换位倒计时 ' + a + 's → ' + b2 + 's');
  });

  await TA('炼狱档（5 环 48 数）可开局并推进', async function () {
    lvBtns()[4].click();
    await sleep(300);
    assert(/5 环 · 48 个数/.test(lvBtns()[4].textContent), '炼狱档提示异常: ' + lvBtns()[4].textContent);
    assert(stat('圆环数') === '5', '炼狱应显示 5 环，实际 ' + stat('圆环数'));
    assert(stat('数字个数') === '48', '炼狱应显示 48 个数，实际 ' + stat('数字个数'));
    var b = findBtn(/随机换位/);
    assert(b && b.classList.contains('on'), '炼狱档换位应默认开启');
    startGame();
    await sleep(400);
    assert(ov().classList.contains('hidden'), '遮罩未隐藏');
    for (var t = 1; t <= 3; t++) {
      var before = progress();
      assert(hitTargets([[360, 360]], [98.8, 152.4, 206, 259.6, 313.2]), '炼狱档无法命中目标 ' + t);
      assert(progress() === before + 1, '进度未推进');
    }
    R.push('INFO | 炼狱（5 环 / 48 数）前 3 个数字命中正常，失误 ' + hud(3));
  });

  await TA('切回入门：换位开关消失，HUD 不再有换位倒计时', async function () {
    lvBtns()[0].click();
    await sleep(250);
    assert(!findBtn(/随机换位/), '切回入门后仍有换位开关');
    startGame();
    await sleep(300);
    var has = false;
    Array.prototype.forEach.call(document.querySelectorAll('.hud .h span'), function (sp) {
      if (/下次换位/.test(sp.textContent)) has = true;
    });
    assert(!has, '入门档 HUD 残留「下次换位」');
  });

  R.push('');
  R.push('== 未捕获错误 ==');
  R.push(errs.length ? errs.join('\n') : '（无）');
  R.push('');
  var f = R.filter(function (x) { return x.indexOf('FAIL') === 0; }).length;
  R.push('== 汇总: ' + R.filter(function (x) { return x.indexOf('PASS') === 0; }).length + ' passed, ' + f + ' failed ==');
  return R.join('\n');
})()
