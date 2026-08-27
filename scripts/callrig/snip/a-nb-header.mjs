import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,300); await page.waitForTimeout(400);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {head:(ov.innerText||'').replace(/\s+/g,' ').slice(0,90)}; }, VIS);
};
