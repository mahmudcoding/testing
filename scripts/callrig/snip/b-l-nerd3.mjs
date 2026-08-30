/* sector L: exact copy on both sides + does the diagnostics panel open and work */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={url:page.url()};
  // 1. the toolbar control, read off the element
  out.toolbarBtn = await page.evaluate(()=>{
    const q=window.__qa;
    const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]');
    if(!b) return null;
    return {ariaLabel:b.getAttribute('aria-label'), title:b.getAttribute('title'),
      innerText:(b.innerText||'').trim(), textContent:(b.textContent||'').trim(),
      nameOf:q.nameOf(b).trim(), pressed:b.getAttribute('aria-pressed'), vis:q.vis(b)};
  });
  // 2. open it
  out.open = await page.evaluate(()=>{
    const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]');
    if(!b) return {ok:false}; b.click(); return {ok:true};
  });
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(()=>{
    const q=window.__qa;
    const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(q.boxVis)
      .map(n=>n.getAttribute('data-testid')).filter(t=>/nerd|stat|diag/i.test(t)))];
    const p=[...document.querySelectorAll('[data-testid]')].filter(q.boxVis)
      .find(n=>/nerd|diag/i.test(n.getAttribute('data-testid')) && n.getAttribute('data-testid')!=='call-nerd-stats-toggle');
    return {ids, panelText:p?(p.innerText||'').replace(/\s+/g,' ').trim().slice(0,600):null,
      panelTestid:p?p.getAttribute('data-testid'):null,
      pressedAfter:(()=>{const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]');
        return b?b.getAttribute('aria-pressed'):null;})()};
  });
  await page.waitForTimeout(3500);
  out.panel2 = await page.evaluate(()=>{
    const q=window.__qa;
    const p=[...document.querySelectorAll('[data-testid]')].filter(q.boxVis)
      .find(n=>/nerd|diag/i.test(n.getAttribute('data-testid')) && n.getAttribute('data-testid')!=='call-nerd-stats-toggle');
    return p?(p.innerText||'').replace(/\s+/g,' ').trim().slice(0,600):null;
  });
  return out;
};
