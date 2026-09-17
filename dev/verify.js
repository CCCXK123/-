/* _run.js — 通过 Chrome DevTools Protocol 在真实 Chrome 中执行 _tests.js */
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 9333;
const FILE_URL = process.argv[2];
const TEST_FILE = process.argv[3] || path.join(__dirname, 'tests.js');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitDaemon() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (r.ok) {
        const list = await r.json();
        const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
        if (page) return page;
      }
    } catch (e) { /* not ready */ }
    await sleep(250);
  }
  throw new Error('DevTools daemon 未就绪');
}

(async () => {
  const page = await waitDaemon();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
    }
  });
  const send = (method, params) => new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params: params || {} }));
  });
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', () => rej(new Error('ws error')));
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: FILE_URL });

  // 等页面完全加载（必须等到 App 骨架与各模块都注册完）
  for (let i = 0; i < 120; i++) {
    const r = await send('Runtime.evaluate', {
      expression: '(function(){return document.readyState + "|" + (window.App && App.games ? App.games.length : -1) + "|" + document.querySelectorAll(".overlay").length;})()',
      returnByValue: true
    }).catch(() => null);
    const v = r && r.result && r.result.value;
    if (v && v.split('|')[0] === 'complete' && parseInt(v.split('|')[1], 10) >= 5) break;
    await sleep(250);
  }

  const code = fs.readFileSync(TEST_FILE, 'utf8');
  const out = await send('Runtime.evaluate', {
    expression: code,
    awaitPromise: true,
    returnByValue: true,
    timeout: 120000
  });

  if (out.exceptionDetails) {
    console.log('!!! 测试脚本抛出异常 !!!');
    console.log(JSON.stringify(out.exceptionDetails, null, 2).slice(0, 4000));
  }
  if (out.result && out.result.value !== undefined) console.log(out.result.value);
  else console.log('(无返回值) ' + JSON.stringify(out.result).slice(0, 800));

  try { ws.close(); } catch (e) {}
  process.exit(0);
})().catch(e => { console.error('RUNNER ERROR:', e.message); process.exit(1); });
