import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(800);
  const closed = await page.evaluate((v)=>{ const vis=eval(v);
    const btns=[...document.querySelectorAll('button')].filter(vis)
      .filter(b=>/^(Close|Close thread|Close chat|Cancel)$/i.test((b.getAttribute('aria-label')||b.innerText||'').trim()));
    btns.slice(0,2).forEach(b=>b.click());
    return btns.map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()); }, VIS);
  await page.waitForTimeout(1500);
  const dlgs = await page.evaluate((v)=>{ const vis=eval(v);
    return [...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .map(d=>d.getAttribute('data-testid')|| (d.innerText||'').replace(/\s+/g,' ').slice(0,40)); }, VIS);
  return {closed, dialogsNow: dlgs};
}
