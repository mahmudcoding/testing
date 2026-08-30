import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa;
    return {url:location.href,
      body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0, Number(2500)),
      btns:[...document.querySelectorAll('button,a')].filter(q.vis).map(n=>({n:q.nameOf(n).replace(/\s+/g,' ').slice(0,45),t:n.getAttribute('data-testid')})),
      notices:q.notices()};
  });
};
