/* sector O: bob joins the live call from the hub Live now card */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  out.liveNow = await page.evaluate(()=>{
    const q=window.__qa;
    const t=(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ');
    const i=t.indexOf('Live now');
    return t.slice(i, i+400);
  });
  out.cardButtons = await page.evaluate(()=>{
    const q=window.__qa;
    return [...document.querySelectorAll('button,a')].filter(q.vis)
      .map(n=>({n:q.nameOf(n).slice(0,60), t:n.getAttribute('data-testid')}))
      .filter(x=>/join|live/i.test(x.n)||/join/i.test(x.t||''));
  });
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Join/i));
  await page.waitForTimeout(7000);
  out.url = page.url();
  out.stage = await page.evaluate(()=> (document.body.innerText||'').replace(/\s+/g,' ').slice(0,400));
  return out;
};
