import { RTC_STATS } from './lib.mjs';
export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  const sum = s => s.stats.map(pc=>({
    outA: pc.out.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0),
    outV: pc.out.filter(o=>o.kind==='video').reduce((x,o)=>x+(o.bytes||0),0),
    inA: pc.in.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0),
    inV: pc.in.filter(o=>o.kind==='video').reduce((x,o)=>x+(o.bytes||0),0)}));
  const measure = async (label, secs) => {
    const a = sum(await page.evaluate('('+RTC_STATS+')()'));
    const t0 = Date.now();
    await page.waitForTimeout(secs*1000);
    const b = sum(await page.evaluate('('+RTC_STATS+')()'));
    const ui = await page.evaluate(()=>({
      quality: (()=>{const e=[...document.querySelectorAll('[data-testid="call-network-indicator"]')][0]; return e? e.innerText.replace(/\n+/g,' ').trim():null;})(),
      toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,90)).filter(Boolean).slice(0,3)}));
    return {label, secs: ((Date.now()-t0)/1000).toFixed(1),
      d_outA: b[0]? b[0].outA-a[0].outA:null, d_outV: b[0]? b[0].outV-a[0].outV:null,
      d_inA: b[0]? b[0].inA-a[0].inA:null, d_inV: b[0]? b[0].inV-a[0].inV:null, ui};
  };
  const out=[];
  out.push(await measure('baseline (1x)', 8));
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 20});
  out.push(await measure('cpu 20x', 10));
  const responsive = await page.evaluate(()=>{ const t0=performance.now(); let n=0; while(performance.now()-t0<50) n++; return {loopIters:n}; });
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  out.push(await measure('restored (1x)', 8));
  return {out, responsive};
};
