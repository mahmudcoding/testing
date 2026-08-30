/* sector L: how long does the quality prompt stay up while the link reads Excellent? */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={samples:[], t0:Date.now()};
  for(let i=0;i<40;i++){
    const s = await page.evaluate(async ()=>{
      const q=window.__qa;
      const qp=document.querySelector('[data-testid="call-quality-prompt"]');
      const m=document.querySelector('[data-testid="call-quality-signal-meter"]');
      const net=document.querySelector('[data-testid="call-network-indicator"]');
      let v=null;
      for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
        const st=await pc.getStats();
        st.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video') v={fe:r.framesEncoded,fps:r.framesPerSecond,w:r.frameWidth,h:r.frameHeight,qlr:r.qualityLimitationReason,qld:r.qualityLimitationDurations}; });
        break; }
      return {vis:qp?q.boxVis(qp):false, text:qp?(qp.innerText||'').replace(/\s+/g,' ').trim().slice(0,90):null,
        bars:m?m.getAttribute('data-remaining-bars'):null, net:net?(net.innerText||'').replace(/\s+/g,' ').trim():null,
        applied:[...document.querySelectorAll('[data-testid="call-quality-applied"]')].map(n=>n.getAttribute('data-action')), v};
    });
    out.samples.push({dt:Math.round((Date.now()-out.t0)/1000), ...s});
    await page.waitForTimeout(6000);
  }
  return out;
};
