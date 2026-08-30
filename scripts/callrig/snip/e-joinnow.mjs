import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  out.pre = await page.evaluate(()=>{
    const q=window.__qa;
    return [...document.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,50),t:n.getAttribute('data-testid')}));
  });
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Join (now|call|meeting)/i));
  await page.waitForTimeout(8000);
  out.url = page.url();
  await page.evaluate(DOM);
  out.after = await page.evaluate(()=>{
    const q=window.__qa;
    return {text:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,500),
            btns:[...document.querySelectorAll('button')].filter(q.vis).map(n=>q.nameOf(n).slice(0,40)).filter(Boolean)};
  });
  return out;
};
