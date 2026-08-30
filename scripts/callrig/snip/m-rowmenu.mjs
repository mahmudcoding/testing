import { DOM } from './lib.mjs';
// QA_WHO='QA Alice'  — opens that participant's row menu in the people panel and enumerates it
export default async ({page}) => {
  await page.evaluate(DOM);
  const who = process.env.QA_WHO || 'QA Alice';
  const out = {who};
  const tog = await page.$('[data-testid="call-controls-people-toggle"]');
  if (tog && (await tog.getAttribute('aria-pressed')) !== 'true') { await tog.click(); await page.waitForTimeout(1800); }
  // find the row's action button
  const handle = await page.evaluateHandle((who) => {
    const q = window.__qa;
    const vis = (e) => q.vis(e) || q.boxVis(e);
    const T = (e) => (e.innerText || '').replace(/\s+/g,' ').trim();
    const acts = [...document.querySelectorAll('button[aria-label="Participant actions"]')].filter(vis);
    for (const a of acts) {
      let el = a;
      for (let i=0;i<8 && el;i++) { el = el.parentElement; if (!el) break;
        const t = T(el);
        if (t.includes(who)) return a;
        if (/QA (Owner|Alice|Bob|Carol|Guest|Dave|Admin)/.test(t)) break; // wrong row
      }
    }
    return null;
  }, who);
  const el = handle.asElement();
  out.found = !!el;
  if (!el) return out;
  const box = await el.boundingBox();
  out.box = box;
  await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
  await page.waitForTimeout(1800);
  out.menu = await page.evaluate(() => {
    const q = window.__qa;
    const vis = (e) => q.vis(e) || q.boxVis(e);
    const T = (e) => (e.innerText || '').replace(/\s+/g,' ').trim();
    const cands = [...document.querySelectorAll('[role=menu],[data-radix-menu-content],[role=listbox],[data-radix-popper-content-wrapper]')].filter(vis);
    const m = cands[cands.length-1];
    if (!m) return {none:true, nCands: cands.length};
    const items = [...m.querySelectorAll('*')].filter(e => vis(e) && !e.children.length && T(e))
      .map(e => T(e));
    return { text: T(m), items: [...new Set(items)],
      buttons: [...m.querySelectorAll('button,[role=menuitem],[role=option]')].filter(vis).map(b=>({
        l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,60),
        d: b.disabled||b.getAttribute('aria-disabled')==='true'})) };
  });
  return out;
};
