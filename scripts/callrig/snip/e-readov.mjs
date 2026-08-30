import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa;
    const ov=document.querySelector('[data-testid="call-ended-overlay"]')||document.querySelector('[data-testid="call-taken-over"]');
    return {url:location.href, ovPresent:!!ov,
      ovText: ov?(ov.innerText||'').replace(/\s+/g,' ').slice(0,1600):null,
      btns: ov?[...ov.querySelectorAll('button,a')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,50),t:n.getAttribute('data-testid')})):[],
      body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,200)};
  });
};
