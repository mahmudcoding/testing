import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  await safeClick(page,'[data-testid="call-controls-people-toggle"]').catch(()=>{});
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.panel = await page.evaluate(()=>{
    const q=window.__qa;
    const btns=[...document.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,60),t:n.getAttribute('data-testid')}));
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
    return {btns, text:(ov?ov.innerText:'').replace(/\s+/g,' ').slice(0,800)};
  });
  return out;
};
