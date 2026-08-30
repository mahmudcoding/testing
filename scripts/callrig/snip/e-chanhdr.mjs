import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa;
    return [...document.querySelectorAll('button,a')].filter(q.vis)
      .map(n=>({n:q.nameOf(n).replace(/\s+/g,' ').slice(0,45),t:n.getAttribute('data-testid')}))
      .filter(x=>/call|meet|huddle|video|phone/i.test(x.n)||/call|meet/i.test(x.t||''));
  });
};
