import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const t=page.locator('[data-testid="call-nerd-stats-toggle"]');
  const before=await page.evaluate(()=>[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))]);
  const pressed=await t.getAttribute('aria-pressed');
  if (pressed!=='true'){ await t.click(); await page.waitForTimeout(3500); }
  const after=await page.evaluate(()=>[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))]);
  const added=after.filter(x=>!before.includes(x));
  const panelText=await page.evaluate((added)=>{
    for (const t of added){ const e=document.querySelector('[data-testid="'+t+'"]'); if(e && (e.innerText||'').length>60) return {testid:t, text:e.innerText.replace(/\n+/g,' | ').slice(0,800)}; }
    return null;
  }, added);
  const rtc=await page.evaluate('('+RTC_STATS+')()');
  const sum={inA:0,inV:0,outA:0,outV:0};
  for (const pc of rtc.stats){ for(const o of pc.in){ if(o.kind==='audio') sum.inA+=o.bytes||0; else sum.inV+=o.bytes||0; } for(const o of pc.out){ if(o.kind==='audio') sum.outA+=o.bytes||0; else sum.outV+=o.bytes||0; } }
  return {wasPressed:pressed, addedTestids:added, panel:panelText, rtcTotals:sum};
};
