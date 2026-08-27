import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  const b = page.locator('button[aria-label="More"]').first();
  const n = await b.count(); if (!n) return {err:'no More'};
  await b.click(); await page.waitForTimeout(2200);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content]')].filter(vis);
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    return {items:[...m.querySelectorAll('[role="menuitem"],button,[role="menuitemcheckbox"]')].filter(vis)
      .map(i=>({l:(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' ').slice(0,44),
                t:i.getAttribute('data-testid'), sub:i.getAttribute('aria-haspopup')||null}))}; }, VIS);
};
