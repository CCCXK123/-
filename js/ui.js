/* ===== ui.js — 通用工具与 UI helper ===== */
(function () {
  'use strict';

  /* ---------- 本地存储（file:// 下 localStorage 可能受限，做降级） ---------- */
  var mem = {};
  var canLS = (function () {
    try { window.localStorage.setItem('__t', '1'); window.localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  })();

  var Store = {
    get: function (k, def) {
      try {
        var raw = canLS ? window.localStorage.getItem(k) : mem[k];
        return raw ? JSON.parse(raw) : (def === undefined ? null : def);
      } catch (e) { return def === undefined ? null : def; }
    },
    set: function (k, v) {
      var raw = JSON.stringify(v);
      try { if (canLS) window.localStorage.setItem(k, raw); else mem[k] = raw; }
      catch (e) { mem[k] = raw; }
    },
    records: function (gameId) { return Store.get('pfc.rec.' + gameId, []) || []; },
    addRecord: function (gameId, rec) {
      var list = Store.records(gameId);
      rec.ts = Date.now();
      list.push(rec);
      if (list.length > 300) list = list.slice(list.length - 300);
      Store.set('pfc.rec.' + gameId, list);
      return rec;
    },
    best: function (gameId, cmp) {
      var list = Store.records(gameId);
      if (!list.length) return null;
      var b = list[0];
      for (var i = 1; i < list.length; i++) { if (cmp(list[i], b)) b = list[i]; }
      return b;
    }
  };

  /* ---------- 工具函数 ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function randInt(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[randInt(a.length)]; }
  function fmtMs(ms) {
    if (ms < 0) ms = 0;
    var s = ms / 1000;
    if (s < 60) return s.toFixed(1) + 's';
    var m = Math.floor(s / 60);
    return m + '分' + Math.round(s - m * 60) + '秒';
  }
  function fmtSec(ms) { return (Math.max(0, ms) / 1000).toFixed(1); }
  function fmtDate(ts) {
    var d = new Date(ts);
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg, kind) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 1800);
  }

  /* ---------- Modal ---------- */
  function modal(html, onClose) {
    var mask = document.getElementById('modal');
    var box = document.getElementById('modalBox');
    box.innerHTML = html;
    mask.classList.remove('hidden');
    mask.onclick = function (e) {
      if (e.target === mask) { modalClose(); if (onClose) onClose(); }
    };
    var c = box.querySelector('[data-close]');
    if (c) c.onclick = function () { modalClose(); if (onClose) onClose(); };
  }
  function modalClose() {
    var mask = document.getElementById('modal');
    mask.classList.add('hidden');
    document.getElementById('modalBox').innerHTML = '';
  }

  /* ---------- HUD ---------- */
  /* items: [{label, value, cls}] */
  function renderHud(container, items) {
    container.innerHTML = items.map(function (it) {
      return '<div class="h ' + (it.cls || '') + '"><b>' + it.value + '</b><span>' + it.label + '</span></div>';
    }).join('');
  }
  function setHud(container, idx, value) {
    var hs = container.querySelectorAll('.h b');
    if (hs[idx]) hs[idx].textContent = value;
  }

  /* ---------- 结果面板 ---------- */
  /* opts: {title, sub, stats:[{label,value,cls}], verdict, actions:[{label,cls,fn}]} */
  function resultPanel(opts) {
    var wrap = el('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:14px;width:100%';
    var h = '<h3 style="font-size:21px;margin:0;text-align:center">' + opts.title + '</h3>';
    if (opts.sub) h += '<p style="margin:0;color:var(--muted);font-size:13px;text-align:center">' + opts.sub + '</p>';
    wrap.innerHTML = h;

    if (opts.stats && opts.stats.length) {
      var s = el('div', 'stats');
      s.innerHTML = opts.stats.map(function (x) {
        return '<div class="stat ' + (x.cls || '') + '"><b>' + x.value + '</b><span>' + x.label + '</span></div>';
      }).join('');
      wrap.appendChild(s);
    }
    if (opts.verdict) {
      var v = el('div');
      v.style.cssText = 'font-size:13.5px;color:var(--text2);max-width:560px;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:11px 16px';
      v.innerHTML = opts.verdict;
      wrap.appendChild(v);
    }
    var row = el('div', 'btnrow');
    row.style.justifyContent = 'center';
    (opts.actions || []).forEach(function (a) {
      var b = el('button', 'btn ' + (a.cls || ''), a.label);
      b.onclick = a.fn;
      row.appendChild(b);
    });
    wrap.appendChild(row);
    return wrap;
  }

  /* ---------- 倒计时 / 计时器 ---------- */
  function Timer(onTick, onDone) {
    this.acc = 0; this.running = false; this.last = 0; this.raf = null;
    this.onTick = onTick; this.onDone = onDone;
  }
  Timer.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    var self = this;
    (function loop(now) {
      if (!self.running) return;
      var dt = now - self.last;
      self.last = now;
      if (dt > 250) dt = 250;              // 切后台回来不跳时间
      self.acc += dt;
      if (self.onTick) self.onTick(self.acc);
      if (self.onDone && self.acc >= self.limit) { self.stop(); self.onDone(self.acc); return; }
      self.raf = requestAnimationFrame(loop);
    })(performance.now());
  };
  Timer.prototype.setLimit = function (ms) { this.limit = ms; };
  Timer.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  };
  Timer.prototype.reset = function () { this.stop(); this.acc = 0; };

  /* ---------- DOM 快捷 ---------- */
  function on(node, ev, fn) { node.addEventListener(ev, fn); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  window.UI = {
    el: el, shuffle: shuffle, randInt: randInt, pick: pick,
    fmtMs: fmtMs, fmtSec: fmtSec, fmtDate: fmtDate, pct: pct,
    toast: toast, modal: modal, modalClose: modalClose,
    renderHud: renderHud, setHud: setHud, resultPanel: resultPanel,
    Timer: Timer, on: on, clear: clear
  };
  window.Store = Store;

  /* ---------- 应用骨架（必须先于各游戏模块定义，供其 register 调用） ---------- */
  window.App = window.App || {
    games: [],       // 已注册的训练模块
    routes: {},      // hash 路由表
    cleanup: null,   // 当前视图的清理函数
    register: function (def) { this.games.push(def); },
    route: function (path, fn) { this.routes[path] = fn; },
    go: function (hash) { location.hash = hash; }
  };
})();
