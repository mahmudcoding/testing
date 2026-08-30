import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const out = {};
  // open the people panel if not open
  const tog = await page.$('[data-testid="call-controls-people-toggle"]');
  out.togglePresent = !!tog;
  if (tog) {
    const pressed = await tog.getAttribute('aria-pressed');
    out.pressedBefore = pressed;
    if (pressed !== 'true') { await tog.click(); await page.waitForTimeout(1800); }
  }
  out.res = await page.evaluate(() => {
    const q = window.__qa;
    const vis = (e) => q.vis(e) || q.boxVis(e);
    const T = (e) => (e.innerText || '').replace(/\s+/g, ' ').trim();
    // panel = smallest visible element containing all four names
    const names = ['QA Owner','QA Alice','QA Bob','QA Carol'];
    let panel = null, best = 1e9;
    for (const el of document.querySelectorAll('div,aside,section')) {
      if (!vis(el)) continue;
      const t = T(el);
      if (!names.every(n => t.includes(n))) continue;
      if (t.length < best) { best = t.length; panel = el; }
    }
    const rows = [];
    if (panel) {
      for (const n of names) {
        let r = null, b = 1e9;
        for (const el of panel.querySelectorAll('*')) {
          const t = T(el);
          if (!t.includes(n)) continue;
          if (!el.querySelector('button')) continue;
          if (t.length < b) { b = t.length; r = el; }
        }
        rows.push({ name: n, text: r ? T(r) : null,
          buttons: r ? [...r.querySelectorAll('button')].filter(vis).map(x => ({
            l: (x.getAttribute('aria-label')||x.textContent||'').replace(/\s+/g,' ').trim().slice(0,60),
            d: x.disabled || x.getAttribute('aria-disabled')==='true' })) : [] });
      }
    }
    return {
      panelText: panel ? T(panel).slice(0, 1500) : null,
      panelTag: panel ? panel.tagName + '.' + panel.className.slice(0,60) : null,
      rows,
      inputs: panel ? [...panel.querySelectorAll('input,textarea')].filter(vis).map(i => ({
        ph: i.placeholder, type: i.type, al: i.getAttribute('aria-label') })) : [],
      allBtns: panel ? [...panel.querySelectorAll('button')].filter(vis).map(x =>
        (x.getAttribute('aria-label')||x.textContent||'').replace(/\s+/g,' ').trim().slice(0,50)) : []
    };
  });
  return out;
};
