import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  out.btns = await page.evaluate(()=>{
    const q=window.__qa;
    return [...document.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,40),t:n.getAttribute('data-testid')})).filter(x=>/record/i.test(x.n)||/record/i.test(x.t||''));
  });
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/Stop recording/i));
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(()=>{
    const q=window.__qa;
    return {notices:q.notices(), btns:[...document.querySelectorAll('button')].filter(q.vis).map(n=>q.nameOf(n).slice(0,40)).filter(x=>/record/i.test(x))};
  });
  out.wall = new Date().toISOString();
  return out;
};
