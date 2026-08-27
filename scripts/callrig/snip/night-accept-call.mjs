import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const btns=await page.$$('button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Accept$/i.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Accept', labels: await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,20))};
  await page.waitForTimeout(10000);
  const ui=await page.evaluate(()=>({inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
    topBar:(t=>t?t.innerText.replace(/\n+/g,' | ').slice(0,120):null)(document.querySelector('[data-testid="call-top-bar"]')),
    tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{const n=t.querySelector('[data-testid="participant-name"]');return n?n.innerText.trim():'?';})}));
  const rtc=await page.evaluate('('+RTC_STATS+')()');
  return {clicked, ui, rtcPcs: rtc.pcs, conns: rtc.stats.map(s=>s.conn)};
};
