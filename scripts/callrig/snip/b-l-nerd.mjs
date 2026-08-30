/* sector L: "Show call diagnostics (nerd info)" promises a Nerd Stats button in the call toolbar. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  // toolbar BEFORE (expand the PiP so the real toolbar is on screen)
  const expand = async () => {
    const hasPip = await page.evaluate(()=>!!document.querySelector('[data-testid="draggable-pip"]'));
    if(hasPip){
      await page.evaluate(()=>{const q=window.__qa;
        const p=document.querySelector('[data-testid="draggable-pip"]');
        const b=[...p.querySelectorAll('button')].find(x=>/^Expand$/i.test(q.nameOf(x).trim())); b&&b.click();});
      await page.waitForTimeout(3000);
      await page.evaluate(DOM);
    }
    return page.evaluate(()=>{
      const q=window.__qa;
      const tb=document.querySelector('[data-testid="call-toolbar"]');
      return {toolbarPresent:!!tb,
        buttons:[...document.querySelectorAll('button')].filter(q.vis).map(b=>q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,40)),
        nerdish:[...document.querySelectorAll('button')].filter(q.vis).map(b=>q.nameOf(b)).filter(n=>/nerd|stat|diag/i.test(n)),
        panels:[...document.querySelectorAll('[data-testid]')].filter(q.boxVis).map(n=>n.getAttribute('data-testid')).filter(t=>/stat|nerd|diag/i.test(t))};
    });
  };
  out.a_before = await expand();
  // go back to settings and flip the switch
  await page.evaluate(()=>window.__qa.clickDeepest(/^Minimize to picture-in-picture$/i));
  await page.waitForTimeout(2500);
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/settings/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  out.urlAfterGoto = page.url();
  out.flip = await page.evaluate(()=>{
    const q=window.__qa;
    const s=[...document.querySelectorAll('[role=switch]')].find(n=>/Show call diagnostics/i.test(q.nameOf(n)));
    if(!s) return {ok:false, switches:[...document.querySelectorAll('[role=switch]')].map(n=>q.nameOf(n).slice(0,40))};
    s.scrollIntoView({block:'center'});
    const before=s.getAttribute('aria-checked');
    s.click();
    return {ok:true, before};
  });
  await page.waitForTimeout(2000);
  out.switchAfter = await page.evaluate(()=>{
    const q=window.__qa;
    const s=[...document.querySelectorAll('[role=switch]')].find(n=>/Show call diagnostics/i.test(q.nameOf(n)));
    return s?s.getAttribute('aria-checked'):null;
  });
  out.b_after = await expand();
  return out;
};
