/* _shot.js — 通过 CDP 截取关键页面截图 */
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 9333;
const FILE_URL = process.argv[2];
const OUT = process.argv[3] || __dirname;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  let page = null;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) break;
    } catch (e) {}
    await sleep(250);
  }
  if (!page) throw new Error('no target');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
  });
  const send = (method, params) => new Promise((res, rej) => { const i = ++id; pending.set(i, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', () => rej(new Error('ws'))); });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1020, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: FILE_URL });
  for (let i = 0; i < 60; i++) {
    const r = await send('Runtime.evaluate', { expression: 'document.readyState+"|"+(typeof App)', returnByValue: true }).catch(() => null);
    if (r && /^complete\|object/.test(r.result.value || '')) break;
    await sleep(250);
  }
  await sleep(400);

  async function shot(name, setup) {
    if (setup) {
      await send('Runtime.evaluate', { expression: setup, awaitPromise: true, returnByValue: true });
      await sleep(900);
    }
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
    console.log('shot ->', name + '.png');
  }

  await shot('shot-home', 'App.go("#/"); new Promise(r=>setTimeout(r,400))');
  await shot('shot-wheel', '(async()=>{App.go("#/wheel");await new Promise(r=>setTimeout(r,300));var bs=document.querySelectorAll(".overlay button");for(var i=0;i<bs.length;i++){if(/开始训练/.test(bs[i].textContent))bs[i].click();}await new Promise(r=>setTimeout(r,1200));})()');
  await shot('shot-schulte', '(async()=>{App.go("#/schulte");await new Promise(r=>setTimeout(r,300));var bs=document.querySelectorAll(".overlay button");for(var i=0;i<bs.length;i++){if(/开始训练/.test(bs[i].textContent))bs[i].click();}await new Promise(r=>setTimeout(r,300));var c=document.querySelectorAll(".schulte-grid .cell");for(var k=1;k<=7;k++){c[k-1]&&c[k-1].click();}await new Promise(r=>setTimeout(r,200));})()');
  await shot('shot-stroop', '(async()=>{App.go("#/stroop");await new Promise(r=>setTimeout(r,300));var bs=document.querySelectorAll(".overlay button");for(var i=0;i<bs.length;i++){if(/开始训练/.test(bs[i].textContent))bs[i].click();}await new Promise(r=>setTimeout(r,2600));})()');
  await shot('shot-selfcheck', '(async()=>{App.go("#/selfcheck");await new Promise(r=>setTimeout(r,300));document.querySelectorAll(".qitem").forEach(function(row,i){var b=row.querySelectorAll(".likert button");b[(i%5)].click();});var s=null;document.querySelectorAll("button").forEach(function(x){if(x.textContent.trim()==="查看结果")s=x;});s.click();await new Promise(r=>setTimeout(r,300));document.getElementById("scResult").scrollIntoView();})()');

  ws.close();
  process.exit(0);
})().catch(e => { console.error('SHOT ERROR:', e.message); process.exit(1); });
