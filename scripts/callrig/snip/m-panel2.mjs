import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const out = {};
  const tog = await page.$('[data-testid="call-controls-people-toggle"]');
  out.pressed = tog ? await tog.getAttribute('aria-pressed') : null;
  if (tog && out.pressed !== 'true') { await tog.click(); await page.waitForTimeout(2000);
    out.pressedAfter = await tog.getAttribute('aria-pressed'); }
  out.res = await page.evaluate(() => {
    const q = window.__qa;
    const vis = (e) => q.vis(e) || q.boxVis(e);
    const T = (e) => (e.innerText || '').replace(/\s+/g, ' ').trim();
    const acts = [...document.querySelectorAll('button[aria-label*="Participant actions"]')].filter(vis);
    // panel: smallest visible ancestor containing ALL the action buttons
    let panel = null, best = 1e9;
    if (acts.length) {
      let el = acts[0];
      while (el) {
        if (acts.every(a => el.contains(a)) && vis(el)) { panel = el; break; }
        el = el.parentElement;
      }
      // walk up one more if the found node is tiny
    }
    const rows = acts.map(a => {
      // smallest ancestor containing the button and a name-ish text
      let el = a, r = null;
      for (let i=0;i<8 && el;i++) { el = el.parentElement; if (!el) break;
        const t = T(el); if (/QA (Owner|Alice|Bob|Carol|Guest|Dave|Admin)/.test(t)) { r = el; break; } }
      return { label: a.getAttribute('aria-label'), rowText: r ? T(r).slice(0,200) : null,
        rowBtns: r ? [...r.querySelectorAll('button')].filter(vis).map(x =>
          (x.getAttribute('aria-label')||x.textContent||'').replace(/\s+/g,' ').trim().slice(0,50)) : [],
        rowHtmlSample: r ? r.innerHTML.replace(/\s+/g,' ').slice(0,400) : null };
    });
    return {
      nActions: acts.length,
      panelText: panel ? T(panel).slice(0, 1800) : null,
      rows,
      inputs: panel ? [...panel.querySelectorAll('input')].filter(vis).map(i => ({ph:i.placeholder, al:i.getAttribute('aria-label')})) : [],
      panelBtns: panel ? [...panel.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.textContent||'').replace(/\s+/g,' ').trim().slice(0,50)) : []
    };
  });
  return out;
};
