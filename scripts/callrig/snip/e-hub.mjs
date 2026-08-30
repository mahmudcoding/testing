import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa; const m=document.querySelector('main')||document.body;
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Recent calls');
    return {recent: t.slice(i, i+900), full: t.length,
      tabs:[...m.querySelectorAll('button,[role=tab]')].filter(q.vis).map(n=>({n:q.nameOf(n).replace(/\s+/g,' ').slice(0,45),sel:n.getAttribute('aria-selected'),press:n.getAttribute('aria-pressed')}))};
  });
};
