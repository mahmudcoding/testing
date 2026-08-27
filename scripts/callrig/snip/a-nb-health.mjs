import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  const ui = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const head=(ov.innerText||'').replace(/\s+/g,' ').slice(0,90);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const q=document.querySelector('[data-testid="participant-network-indicator"]');
    return {head, panel:p&&vis(p)?(p.innerText||'').replace(/\s+/g,' ').slice(0,140):null,
      quality:q?q.getAttribute('aria-label'):null,
      tiles:[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis).length,
      videos:[...ov.querySelectorAll('video')].filter(vis).map(x=>x.videoWidth+'x'+x.videoHeight)}; }, VIS);
  const rtc = await page.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const o={pcs:pcs.length, states:[], inb:[], outb:[]};
    for (const pc of pcs) {
      o.states.push(pc.connectionState+'/'+pc.iceConnectionState);
      const st = await pc.getStats();
      st.forEach(r=>{
        if (r.type==='inbound-rtp' && r.kind==='audio') o.inb.push('a:'+(r.packetsReceived||0));
        if (r.type==='outbound-rtp' && r.kind==='audio') o.outb.push('a:'+(r.packetsSent||0));
      });
    }
    return o; });
  const mem = await page.evaluate(()=>{
    const m = performance.memory || {};
    return {used: m.usedJSHeapSize? Math.round(m.usedJSHeapSize/1048576):null,
            total: m.totalJSHeapSize? Math.round(m.totalJSHeapSize/1048576):null,
            nodes: document.querySelectorAll('*').length,
            listeners: (window.__pcs||[]).length};
  });
  return {ui, rtc, mem, at: Date.now()};
};
