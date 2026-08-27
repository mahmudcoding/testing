import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  const b = page.locator('button[aria-label="Send reaction"]').first();
  if (!(await b.count())) return {err:'no reaction button'};
  await b.click(); await page.waitForTimeout(1800);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[role="dialog"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1]; if(!m) return {err:'no popover'};
    const r=m.getBoundingClientRect();
    return {rect:`${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`,
      overflow:{sw:m.scrollWidth, cw:m.clientWidth, sh:m.scrollHeight, ch:m.clientHeight},
      items:[...m.querySelectorAll('button,[role="menuitem"]')].filter(vis)
        .map(i=>({l:(i.getAttribute('aria-label')||i.textContent||'').trim().slice(0,20), t:i.getAttribute('data-testid')}))};}, VIS);
};
