/* sector L: on a FRESHLY RELOADED client, does the quality prompt appear and then persist
   after severity returns to healthy? Elapsed taken from the RTCStats timestamp, not the sleep. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={samples:[]};
  for(let i=0;i<80;i++){
    const s = await page.evaluate(async ()=>{
      const q=window.__qa;
      const qp=document.querySelector('[data-testid="call-quality-prompt"]');
      const m=document.querySelector('[data-testid="call-quality-signal-meter"]');
      const net=document.querySelector('[data-testid="call-network-indicator"]');
      let v=null, ts=null;
      for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
        const st=await pc.getStats();
        st.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video'){ v={fe:r.framesEncoded,fps:r.framesPerSecond,w:r.frameWidth,h:r.frameHeight,qlr:r.qualityLimitationReason}; ts=r.timestamp; } });
        break; }
      return {statsTs:ts, vis:qp?q.boxVis(qp):false,
        text:qp?(qp.innerText||'').replace(/\s+/g,' ').trim().slice(0,80):null,
        bars:m?m.getAttribute('data-remaining-bars'):null,
        net:net?(net.innerText||'').replace(/\s+/g,' ').trim():null,
        applied:[...document.querySelectorAll('[data-testid="call-quality-applied"]')].map(n=>n.getAttribute('data-action')),
        v};
    });
    out.samples.push({i, wall:Date.now(), ...s});
    await page.waitForTimeout(6000);
  }
  return out;
};
