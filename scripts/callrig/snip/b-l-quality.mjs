/* sector L: provoke the adaptive quality surface with CPU throttling + network shaping */
import { DOM, RTC_STATS } from './lib.mjs';
const probe = async (page) => {
  const dom = await page.evaluate(()=>{
    const q=window.__qa;
    const g = t => { const n=document.querySelector('[data-testid="'+t+'"]'); return n?{vis:q.boxVis(n),
      text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,200), aria:n.getAttribute('aria-label')||null,
      bars:n.getAttribute('data-remaining-bars')||null}:null; };
    const applied=[...document.querySelectorAll('[data-testid="call-quality-applied"]')].filter(q.boxVis)
      .map(n=>({text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,120), act:n.getAttribute('data-action')}));
    const net=document.querySelector('[data-testid="call-network-indicator"]');
    return {prompt:g('call-quality-prompt'), meter:g('call-quality-signal-meter'), applied,
      net: net?{vis:q.boxVis(net), text:(net.innerText||'').replace(/\s+/g,' ').trim().slice(0,60), aria:net.getAttribute('aria-label')}:null,
      camBtn: (()=>{const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim()));
        return b?q.nameOf(b).trim():null;})(),
      notices:q.notices().map(n=>({t:n.text.slice(0,90), w:n.w, h:n.h}))};
  });
  const r = await page.evaluate(`(${RTC_STATS})()`);
  const o = r.stats.flatMap(s=>s.out);
  return {...dom, out:o.map(x=>({k:x.kind,b:x.bytes,fps:x.fps,w:x.w,h:x.h,fe:x.framesEnc}))};
};
export default async ({ page, ctx }) => {
  await page.evaluate(DOM);
  const out={samples:[]};
  const cdp = await ctx.newCDPSession(page);
  out.a_baseline = await probe(page);
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 20});
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:900,
    downloadThroughput: 60*1024, uploadThroughput: 30*1024});
  const t0=Date.now();
  for(let i=0;i<20;i++){
    await page.waitForTimeout(3000);
    const p = await probe(page);
    out.samples.push({dt:Math.round((Date.now()-t0)/1000), prompt:p.prompt?p.prompt.text:null,
      meterBars:p.meter?p.meter.bars:null, applied:p.applied, net:p.net?p.net.text:null,
      cam:p.camBtn, vid:p.out.find(x=>x.k==='video')||null, notices:p.notices.map(n=>n.t)});
    if(p.prompt&&p.prompt.vis) { out.hit=true; }
  }
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:0,
    downloadThroughput:-1, uploadThroughput:-1});
  await page.waitForTimeout(3000);
  out.z_restored = await probe(page);
  return out;
};
