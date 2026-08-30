/* sector L: what actually changes when Call diagnostics is toggled — full before/after diff */
import { DOM } from './lib.mjs';
const snap = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const ids=[...document.querySelectorAll('[data-testid]')].filter(q.boxVis).map(n=>n.getAttribute('data-testid'));
  const counts={}; ids.forEach(i=>counts[i]=(counts[i]||0)+1);
  const lst=[...document.querySelectorAll('[data-testid="live-stats-tile"]')];
  return {counts,
    liveStats: lst.map(n=>({vis:q.boxVis(n), text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,220),
      rect:(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(n.getBoundingClientRect())})),
    surfaceText:(document.querySelector('[data-testid="call-surface"]')||document.body).innerText.replace(/\s+/g,' ').trim().slice(0,500),
    pressed:(()=>{const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]'); return b?b.getAttribute('aria-pressed'):null;})()};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.pressedNow = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]'); return b?b.getAttribute('aria-pressed'):null;});
  // make sure we start OFF
  if(out.pressedNow==='true'){ await page.evaluate(()=>document.querySelector('[data-testid="call-nerd-stats-toggle"]').click()); await page.waitForTimeout(2000); }
  out.off = await snap(page);
  await page.evaluate(()=>document.querySelector('[data-testid="call-nerd-stats-toggle"]').click());
  await page.waitForTimeout(2500);
  out.on = await snap(page);
  await page.waitForTimeout(4000);
  out.on2 = await snap(page);
  const a=out.off.counts, b=out.on.counts;
  out.appeared = Object.keys(b).filter(k=>!a[k]||b[k]>a[k]).map(k=>k+' '+(a[k]||0)+'->'+b[k]);
  out.disappeared = Object.keys(a).filter(k=>!b[k]||b[k]<a[k]).map(k=>k+' '+a[k]+'->'+(b[k]||0));
  return out;
};
