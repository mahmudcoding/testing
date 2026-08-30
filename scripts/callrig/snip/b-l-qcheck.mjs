import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(async ()=>{
    const q=window.__qa;
    const qp=document.querySelector('[data-testid="call-quality-prompt"]');
    const m=document.querySelector('[data-testid="call-quality-signal-meter"]');
    const net=document.querySelector('[data-testid="call-network-indicator"]');
    let v=null;
    for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
      const st=await pc.getStats();
      st.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video') v={fe:r.framesEncoded,fps:r.framesPerSecond,w:r.frameWidth,h:r.frameHeight,qlr:r.qualityLimitationReason}; });
      break; }
    return {url:location.pathname, promptVis:qp?q.boxVis(qp):false,
      text:qp?(qp.innerText||'').replace(/\s+/g,' ').trim().slice(0,90):null,
      bars:m?m.getAttribute('data-remaining-bars'):null, net:net?(net.innerText||'').trim():null,
      applied:[...document.querySelectorAll('[data-testid="call-quality-applied"]')].map(n=>n.getAttribute('data-action')),
      camBtn:(()=>{const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim())); return b?q.nameOf(b).trim():null;})(),
      outVideo:v};
  });
};
