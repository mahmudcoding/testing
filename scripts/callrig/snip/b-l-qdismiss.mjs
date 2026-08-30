/* sector L: the prompt's "way out" — does Not now clear it, and does it return? */
import { DOM } from './lib.mjs';
const s = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const qp=document.querySelector('[data-testid="call-quality-prompt"]');
  const m=document.querySelector('[data-testid="call-quality-signal-meter"]');
  const net=document.querySelector('[data-testid="call-network-indicator"]');
  return {vis:qp?q.boxVis(qp):false, text:qp?(qp.innerText||'').replace(/\s+/g,' ').trim().slice(0,80):null,
    bars:m?m.getAttribute('data-remaining-bars'):null, net:net?(net.innerText||'').replace(/\s+/g,' ').trim():null,
    applied:[...document.querySelectorAll('[data-testid="call-quality-applied"]')].map(n=>n.getAttribute('data-action'))};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.before = await s(page);
  out.click = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Not now$/i.test(q.nameOf(x).trim()));
    if(!b) return {ok:false}; b.click(); return {ok:true};
  });
  await page.waitForTimeout(1200);
  out.immediately = await s(page);
  const poll=[]; const t0=Date.now();
  for(let i=0;i<28;i++){ await page.waitForTimeout(4000); poll.push({dt:Math.round((Date.now()-t0)/1000), ...(await s(page))}); }
  out.poll=poll;
  return out;
};
