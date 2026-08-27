import {WS, BASE} from './e-p2-helpers.mjs';
const sample = () => {
  const t = document.body.innerText.replace(/\s+/g,' ');
  const ws = window.__ws || [];
  return {
    online: navigator.onLine,
    total: ws.length,
    open: ws.filter(x => x.opened && !x.closed).length,
    closed: ws.filter(x => x.closed).length,
    indicator: /offline|reconnect|connection|no internet|нет соединения|переподключ/i.test(t)
  };
};
export default async ({page}) => {
  await page.addInitScript(() => {
    window.__ws = [];
    const O = window.WebSocket;
    const P = function (...a) {
      const s = new O(...a);
      const rec = { url: String(a[0]).slice(0, 50), opened: false, closed: false, code: null };
      window.__ws.push(rec);
      s.addEventListener('open', () => { rec.opened = true; });
      s.addEventListener('close', (e) => { rec.closed = true; rec.code = e.code; });
      return s;
    };
    P.prototype = O.prototype;
    window.WebSocket = P;
  });
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const before = await page.evaluate(sample);
  await page.context().setOffline(true);
  const samples = [];
  for (let i = 0; i < 40; i++) {
    samples.push(Object.assign({ t: i * 500 }, await page.evaluate(sample)));
    await page.waitForTimeout(500);
  }
  await page.context().setOffline(false);
  await page.waitForTimeout(9000);
  const after = await page.evaluate(sample);
  const fc = samples.find(s => s.closed > 0);
  const fi = samples.find(s => s.indicator);
  return { before, firstSocketCloseAt: fc ? fc.t : null, firstIndicatorAt: fi ? fi.t : null,
           lastOffline: samples[samples.length - 1], after };
};
