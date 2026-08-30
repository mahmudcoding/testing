/* sector L: the toolbar More menu */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const out={};
  out.click = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^More$/i.test(q.nameOf(x).trim()));
    if(!b) return {ok:false}; b.click(); return {ok:true};
  });
  await page.waitForTimeout(1400);
  out.menu = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return null;
    return {text:(w.innerText||'').replace(/\s+/g,' ').trim(),
      items:[...w.querySelectorAll('button,[role=menuitem],[role=menuitemcheckbox],li,[role=switch]')].filter(q.vis)
        .map(n=>({n:q.nameOf(n).replace(/\s+/g,' ').trim().slice(0,60), role:n.getAttribute('role'),
          checked:n.getAttribute('aria-checked'), testid:n.getAttribute('data-testid')||null}))};
  });
  return out;
};
