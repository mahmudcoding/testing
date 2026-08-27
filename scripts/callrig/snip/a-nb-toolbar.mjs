import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(600);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return [...ov.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,26))
      .filter(Boolean); }, VIS);
};
