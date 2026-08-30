import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1400);
  const r = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    const s=w?[...w.querySelectorAll('[role=switch]')].find(n=>/Push to talk/i.test(q.nameOf(n))):null;
    if(!s) return {ok:false};
    const before=s.getAttribute('aria-checked');
    if(before==='true') s.click();
    return {ok:true, before};
  });
  await page.waitForTimeout(1200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();});
  const after = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
    return b?{label:q.nameOf(b).trim(), disabled:b.disabled}:null;
  });
  return {r, after};
};
