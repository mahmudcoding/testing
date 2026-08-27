import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {tabs:[...ov.querySelectorAll('[role="tab"],button')].filter(vis)
      .map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,34),
                t:b.getAttribute('data-testid'), sel:b.getAttribute('aria-selected')||b.getAttribute('data-state')||null}))
      .filter(x=>/main call|side room/i.test(x.l) || (x.t||'').includes('tab'))}; }, VIS);
};
