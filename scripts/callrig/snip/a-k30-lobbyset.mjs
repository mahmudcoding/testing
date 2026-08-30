/* Open the lobby device-bar Settings popover and enumerate it. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /^Settings$/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    if (!b) return { ok:false };
    b.click(); return { ok:true, expandedBefore: b.getAttribute('aria-expanded') };
  });
  out.clicked = clicked;
  await page.waitForTimeout(2500);
  out.after = await page.evaluate(() => {
    const q = window.__qa;
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /^Settings$/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    const panels = [...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper],[role=listbox]')]
      .filter(e => q.boxVis(e));
    return {
      expandedAfter: b ? b.getAttribute('aria-expanded') : null,
      dstate: b ? b.getAttribute('data-state') : null,
      panels: panels.map(p => ({
        role: p.getAttribute('role'), tid: p.getAttribute('data-testid'),
        text: p.innerText.replace(/\n{2,}/g,'\n').slice(0, 600),
        controls: [...p.querySelectorAll('button,select,input,[role=menuitem],[role=option],[role=menuitemradio],[role=switch]')]
          .filter(e=>q.vis(e))
          .map(e=>({ tag:e.tagName, role:e.getAttribute('role'), tid:e.getAttribute('data-testid'),
                     l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,45),
                     checked:e.getAttribute('aria-checked'), dstate:e.getAttribute('data-state') })),
      })),
    };
  });
  return out;
};
