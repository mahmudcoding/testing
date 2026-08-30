/* sector L: the quality prompt vs the app's own two connection readouts, sampled together */
import { DOM } from './lib.mjs';
const s = async (page) => page.evaluate(async ()=>{
  const q=window.__qa;
  const qp=document.querySelector('[data-testid="call-quality-prompt"]');
  const sug=document.querySelector('[data-testid="call-quality-suggestion"]');
  const meter=document.querySelector('[data-testid="call-quality-signal-meter"]');
  const bars=[...document.querySelectorAll('[data-testid="call-quality-signal-bar"]')].map(b=>{
    const cs=getComputedStyle(b); return {bg:cs.backgroundColor, op:cs.opacity, h:Math.round(b.getBoundingClientRect().height)};});
  const net=document.querySelector('[data-testid="call-network-indicator"]');
  let rtp=null, pair=null;
  for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    const st=await pc.getStats(); const v=[];
    st.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video') v.push({b:r.bytesSent, fe:r.framesEncoded, fps:r.framesPerSecond, w:r.frameWidth, h:r.frameHeight, qlr:r.qualityLimitationReason, qld:r.qualityLimitationDurations});
      if(r.type==='candidate-pair'&&r.state==='succeeded') pair={rtt:r.currentRoundTripTime, br:r.availableOutgoingBitrate};
      if(r.type==='remote-inbound-rtp'&&r.kind==='video') v.push({remoteLoss:r.fractionLost, jitter:r.jitter, rtt:r.roundTripTime, remote:true}); });
    rtp=v; break; }
  return {
    promptVis: qp?q.boxVis(qp):false,
    promptText: qp?(qp.innerText||'').replace(/\s+/g,' ').trim():null,
    suggestionAction: sug?sug.getAttribute('data-action'):null,
    suggestionRole: sug?sug.getAttribute('role'):null,
    meterBars: meter?meter.getAttribute('data-remaining-bars'):null,
    meterAria: meter?meter.getAttribute('aria-label'):null,
    barStyles: bars,
    netIndicator: net?(net.innerText||'').replace(/\s+/g,' ').trim():null,
    netAria: net?net.getAttribute('aria-label'):null,
    camBtn:(()=>{const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim())); return b?q.nameOf(b).trim():null;})(),
    rtp, pair, appliedRows:[...document.querySelectorAll('[data-testid="call-quality-applied"]')].map(n=>n.getAttribute('data-action'))
  };
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={samples:[]};
  for(let i=0;i<10;i++){ out.samples.push({i, ...(await s(page))}); await page.waitForTimeout(3000); }
  return out;
};
