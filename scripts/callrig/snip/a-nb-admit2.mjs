import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  const before = await page.evaluate((v)=>{const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {txt:(p?.innerText||'').replace(/\s+/g,' ').slice(0,220),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>((b.getAttribute('data-testid')||'')+'|'+(b.getAttribute('aria-label')||b.textContent||'').trim()).slice(0,50))};}, VIS);
  const clicked = await page.evaluate((v)=>{const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('button')].filter(vis)
      .find(x=>/^(admit|accept|allow)/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if(!b) return null; b.click(); return (b.getAttribute('aria-label')||b.textContent||'').trim();}, VIS);
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return (p?.innerText||'').replace(/\s+/g,' ').slice(0,200);});
  return {before, clicked, after};
};
