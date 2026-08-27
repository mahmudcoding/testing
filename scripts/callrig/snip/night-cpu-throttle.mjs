import { RTC_STATS } from './lib.mjs';
export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  const rate = Number(process.env.QA_RATE || 20);
  const snap = async (tag) => {
    const t0=Date.now();
    const ui = await page.evaluate(()=>{
      const tb=document.querySelector('[data-testid="call-top-bar"]');
      const mic=[...document.querySelectorAll('button')].find(b=>/^(Mute|Unmute)$/.test(b.getAttribute('aria-label')||''));
      return {top: tb?tb.innerText.replace(/\n+/g,' | ').slice(0,60):null,
              micDisabled: mic?mic.disabled:null,
              inCall: !!document.querySelector('[data-testid="call-toolbar"]')};});
    const evalMs = Date.now()-t0;
    let rtc={};
    try { const r = await page.evaluate('('+RTC_STATS+')()');
      const st=(r.stats||[])[0]||{}; const sum=(a,k)=>(a||[]).reduce((x,y)=>x+(y[k]||0),0);
      rtc={conn:st.conn, outB:sum(st.out,'bytes'), inB:sum(st.in,'bytes'), outFps:sum(st.out,'fps')};
    } catch(e){ rtc={err:String(e).slice(0,30)}; }
    return {tag, evalMs, ...ui, ...rtc};
  };
  const out=[await snap('before')];
  await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  for (const w of [5000, 10000, 15000]) { await page.waitForTimeout(w); out.push(await snap('throttled+'+(w/1000)+'s')); }
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  await page.waitForTimeout(8000);
  out.push(await snap('restored'));
  return {rate, timeline: out};
};
