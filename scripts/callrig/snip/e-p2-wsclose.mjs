import {WS, BASE} from './e-p2-helpers.mjs';
const sample = () => {
  const t = document.body.innerText.replace(/\s+/g,' ');
  const ws = window.__wsRefs || [];
  return {
    total: ws.length,
    open: ws.filter(s => s.readyState === 1).length,
    closed: ws.filter(s => s.readyState === 3).length,
    indicator: /offline|reconnect|connection|no internet|нет соединения|переподключ/i.test(t),
    snippet: (t.match(/[^.]{0,40}(offline|reconnect|connection|переподключ)[^.]{0,30}/i) || [''])[0]
  };
};
export default async ({page}) => {
  await page.addInitScript(() => {
    window.__wsRefs = [];
    const O = window.WebSocket;
    const P = function (...a) { const s = new O(...a); window.__wsRefs.push(s); return s; };
    P.prototype = O.prototype;
    window.WebSocket = P;
  });
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const before = await page.evaluate(sample);
  // close every open socket from inside the page — a genuine disconnection
  const closedCount = await page.evaluate(() => {
    let n = 0;
    (window.__wsRefs || []).forEach(s => { if (s.readyState === 1) { s.close(4001, 'qa-probe'); n++; } });
    return n;
  });
  const samples = [];
  for (let i = 0; i < 40; i++) {          // 20 s
    samples.push(Object.assign({ t: i * 500 }, await page.evaluate(sample)));
    await page.waitForTimeout(500);
  }
  const fi = samples.find(s => s.indicator); const li = [...samples].reverse().find(s => s.indicator);
  const reopened = samples.find(s => s.total > before.total);
  return { before, closedCount,
    firstIndicatorAt: fi ? fi.t : null, indicatorText: fi ? fi.snippet : null,
    reconnectedAt: reopened ? reopened.t : null, lastIndicatorAt: li ? li.t : null,
    timeline: samples.filter((_,i)=>i%2===0).map(s=>`${s.t}ms open=${s.open} closed=${s.closed} total=${s.total} banner=${s.indicator}`),
    last: samples[samples.length - 1] };
};
