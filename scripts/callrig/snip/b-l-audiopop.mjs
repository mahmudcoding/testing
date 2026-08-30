/* sector L: full audio popover contents with control state */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  out.expandedBefore = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim()));
    return b?b.getAttribute('aria-expanded'):null;
  });
  out.open = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim()));
    if(!b) return {ok:false}; b.click(); return {ok:true};
  });
  await page.waitForTimeout(1600);
  out.expandedAfter = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim()));
    return b?b.getAttribute('aria-expanded'):null;
  });
  out.controls = await page.evaluate(()=>{
    const q=window.__qa;
    const wraps=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis);
    const w=wraps[wraps.length-1];
    if(!w) return null;
    const inter = [...w.querySelectorAll('button,input,[role=switch],[role=slider],[role=checkbox],[role=menuitemradio],[role=radio],[role=option],[role=menuitem]')];
    return {
      count: inter.length,
      items: inter.map(n=>({tag:n.tagName, role:n.getAttribute('role'), name:q.nameOf(n).replace(/\s+/g,' ').slice(0,70),
        checked:n.getAttribute('aria-checked'), state:n.getAttribute('data-state'), val:n.getAttribute('aria-valuenow')||n.value||null,
        vis:q.vis(n), disabled:n.disabled||n.getAttribute('aria-disabled')==='true',
        testid:n.getAttribute('data-testid')||null}))
    };
  });
  return out;
};
