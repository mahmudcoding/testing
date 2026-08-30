import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const re = process.env.QA_MATCH;
  await page.evaluate(DOM);
  const out = {};
  out.click = await page.evaluate((r)=>window.__qa.clickDeepest(new RegExp(r,'i')), re);
  await page.waitForTimeout(Number(process.env.QA_WAIT||4000));
  await page.evaluate(DOM);
  out.url = page.url();
  out.overlay = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.querySelector('main')||document.body;
    return (ov.innerText||'').replace(/\s+/g,' ').slice(0, Number(1200));
  });
  out.notices = await page.evaluate(()=>window.__qa.notices());
  return out;
};
