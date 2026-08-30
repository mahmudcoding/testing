import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.waitForTimeout(1500);
  await page.evaluate(DOM);
  out.notices = await page.evaluate(()=>window.__qa.notices());
  out.btns = await page.evaluate(()=>{
    const q=window.__qa;
    return [...document.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,50),t:n.getAttribute('data-testid')}));
  });
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^(Admit|Accept|Allow)/i));
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(()=>(document.body.innerText||'').replace(/\s+/g,' ').slice(0,500));
  return out;
};
