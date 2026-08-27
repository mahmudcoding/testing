import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const t=page.locator('[data-testid="call-nerd-stats-toggle"]');
  if(!await t.count()) return {err:'no diagnostics button'};
  if (await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(3000); }
  const panel=await page.evaluate(()=>{
    const ids=[...document.querySelectorAll('[data-testid*="nerd" i],[data-testid*="stats" i],[data-testid*="diag" i]')];
    const p=ids.find(e=>(e.innerText||'').length>40) || ids[0];
    return p?{testid:p.getAttribute('data-testid'), text:p.innerText.replace(/\n+/g,' | ').slice(0,700)}:{none:true, ids:ids.map(e=>e.getAttribute('data-testid'))};
  });
  const rtc=await page.evaluate('('+RTC_STATS+')()');
  const inb=[]; const outb=[];
  for (const pc of rtc.stats){ for(const o of pc.in) inb.push({kind:o.kind,w:o.w,h:o.h,fps:o.fps,bytes:o.bytes}); for(const o of pc.out) outb.push({kind:o.kind,w:o.w,h:o.h,fps:o.fps,bytes:o.bytes}); }
  return {panel, inbound: inb, outbound: outb};
};
