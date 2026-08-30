/* sector L: deterministic trigger attempt — heavy CPU throttle to force receive-side freezes,
   then release it and watch whether the prompt withdraws. */
import { DOM } from './lib.mjs';
const s = async (page) => page.evaluate(async ()=>{
  const q=window.__qa;
  const qp=document.querySelector('[data-testid="call-quality-prompt"]');
  const m=document.querySelector('[data-testid="call-quality-signal-meter"]');
  const net=document.querySelector('[data-testid="call-network-indicator"]');
  let inb=[], out=null, ts=null;
  for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    const st=await pc.getStats();
    st.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='video') inb.push({fd:r.framesDecoded, fz:r.freezeCount, fzd:r.totalFreezesDuration, pl:r.packetsLost});
      if(r.type==='outbound-rtp'&&r.kind==='video'){ out={fe:r.framesEncoded,fps:r.framesPerSecond,w:r.frameWidth,h:r.frameHeight,qlr:r.qualityLimitationReason}; ts=r.timestamp; } });
    break; }
  return {ts, vis:qp?q.boxVis(qp):false, text:qp?(qp.innerText||'').replace(/\s+/g,' ').trim().slice(0,70):null,
    bars:m?m.getAttribute('data-remaining-bars'):null, net:net?(net.innerText||'').replace(/\s+/g,' ').trim():null,
    applied:[...document.querySelectorAll('[data-testid="call-quality-applied"]')].map(n=>n.getAttribute('data-action')),
    autoPause: !!document.querySelector('[data-testid="call-quality-auto-pause"]'),
    inbFreeze: inb.reduce((a,b)=>a+(b.fzd||0),0), inbFd: inb.reduce((a,b)=>a+(b.fd||0),0), out};
});
export default async ({ page, ctx }) => {
  await page.evaluate(DOM);
  const cdp = await ctx.newCDPSession(page);
  const out={phase:[]};
  const rate = Number(process.env.QA_RATE||'50');
  out.a0 = await s(page);
  await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  for(let i=0;i<22;i++){ await page.waitForTimeout(3000); out.phase.push({p:'throttled', i, ...(await s(page))}); }
  await cdp.send('Emulation.setCPUThrottlingRate', {rate:1});
  for(let i=0;i<25;i++){ await page.waitForTimeout(3000); out.phase.push({p:'released', i, ...(await s(page))}); }
  return out;
};
