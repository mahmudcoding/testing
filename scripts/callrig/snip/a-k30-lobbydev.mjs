/* Lobby device check: enumerate real devices, the check rows, and the lobby Settings dialog. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = {};
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.screen = await page.evaluate(() => document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other');

  out.devices = await page.evaluate(async () => {
    try {
      const d = await navigator.mediaDevices.enumerateDevices();
      return d.map(x => ({ kind: x.kind, label: x.label, id: x.deviceId.slice(0, 12), group: x.groupId.slice(0,8) }));
    } catch (e) { return { err: String(e) }; }
  });

  out.checkRows = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('[data-testid="lobby-check-row"]')].filter(e=>q.boxVis(e))
      .map(e => ({ text: e.innerText.replace(/\n/g,' | ').slice(0,90),
                   trailing: e.querySelector('[data-testid="lobby-check-row-trailing"]')?.innerText.trim() ?? null,
                   buttons: [...e.querySelectorAll('button')].filter(x=>q.vis(x))
                     .map(x=>({tid:x.getAttribute('data-testid'), l:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,30)})) }));
  });

  // open the lobby Settings
  const c = await page.evaluate(() => window.__qa.clickDeepest(/^Settings$/));
  out.settingsClick = c.ok ? c.name : c.why;
  await page.waitForTimeout(2500);
  out.settings = await page.evaluate(() => {
    const q = window.__qa;
    const dlgs = [...document.querySelectorAll('[role=dialog]')].filter(e=>q.boxVis(e));
    return dlgs.map(d => ({
      testid: d.getAttribute('data-testid'),
      text: d.innerText.replace(/\n{2,}/g,'\n').slice(0, 500),
      controls: [...d.querySelectorAll('button,select,input,[role=combobox],[role=switch],[role=option]')].filter(e=>q.vis(e))
        .map(e => ({ tag: e.tagName, tid: e.getAttribute('data-testid'),
                     l: (e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,50),
                     role: e.getAttribute('role'), expanded: e.getAttribute('aria-expanded'),
                     checked: e.getAttribute('aria-checked') })),
    }));
  });
  return out;
};
