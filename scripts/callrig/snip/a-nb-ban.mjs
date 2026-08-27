import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out = {};
  const clicked = await page.evaluate((v) => {
    const vis = eval(v);
    const ms = [...document.querySelectorAll('[role="menu"],[data-radix-menu-content]')].filter(vis);
    const m = ms[ms.length-1];
    if (!m) return {err:'no menu'};
    const b = [...m.querySelectorAll('[role="menuitem"],button')].filter(vis).find(i => /^Ban$/i.test((i.getAttribute('aria-label')||i.innerText||'').trim()));
    if (!b) return {err:'no Ban item'};
    b.click(); return {ok:true};
  }, VIS);
  out.clicked = clicked;
  if (clicked.err) return out;
  await page.waitForTimeout(1800);
  out.confirmDialog = await page.evaluate((v) => {
    const vis = eval(v);
    const d = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    if (!d) return {err:'no confirm dialog'};
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,32), t:b.getAttribute('data-testid')}))};
  }, VIS);
  return out;
}
