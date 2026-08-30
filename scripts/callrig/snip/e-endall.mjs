import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  out.wallBefore=new Date().toISOString();
  out.open = await safeClick(page,'[data-testid="call-controls-end-for-everyone"]');
  await page.waitForTimeout(1500);
  out.confirm = await safeClick(page,'[data-testid="call-end-confirm-submit"]');
  await page.waitForTimeout(8000);
  out.url=page.url();
  await page.evaluate(DOM);
  out.screen = await page.evaluate(()=>{
    const q=window.__qa;
    const ov=document.querySelector('[data-testid="call-ended-overlay"]');
    return {ovPresent:!!ov, ovText: ov?(ov.innerText||'').replace(/\s+/g,' ').slice(0,1600):null,
      body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...(ov||document.body).querySelectorAll('button,a')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,50),t:n.getAttribute('data-testid')}))};
  });
  out.wallAfter=new Date().toISOString();
  return out;
};
