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
    const m=ms[ms.length-1];
    return m? {open:true, items:[...m.querySelectorAll('button')].filter(vis).map(i=>(i.textContent||'').trim()).slice(0,8)} : {open:false}; }, VIS);
};
