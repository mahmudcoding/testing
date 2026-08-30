import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await safeClick(page, '[data-testid="lobby-join"]').then(r=>out.click=r).catch(e=>out.click=String(e));
  await page.waitForTimeout(9000);
  out.url = page.url();
  await page.evaluate(DOM);
  out.after = await page.evaluate(()=>{
    const q=window.__qa;
    return {text:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,600),
            btns:[...document.querySelectorAll('button')].filter(q.vis).map(n=>q.nameOf(n).slice(0,40)).filter(Boolean)};
  });
  return out;
};
