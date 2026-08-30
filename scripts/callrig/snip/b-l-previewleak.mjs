/* sector L: dave's camera is OFF in the call, but /settings/calls renders a live camera preview.
   Does that preview reach the call? Measure dave's senders + alice's view of dave's tile. */
import { DOM } from './lib.mjs';
import { second } from './b-second.mjs';
const DAVE = `async () => {
  const q=window.__qa;
  const out={url:location.pathname};
  out.previewVideo=[...document.querySelectorAll('video')].map(v=>({aria:v.getAttribute('aria-label'),
    vw:v.videoWidth, vh:v.videoHeight, paused:v.paused,
    tracks:v.srcObject?v.srcObject.getTracks().map(t=>t.kind+':'+t.enabled+':'+t.readyState+':'+(t.label||'').slice(0,20)):[]}));
  out.senders=[]; out.gum=(window.__gumCalls||[]).length;
  for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const s of pc.getSenders()) if(s.track) out.senders.push({k:s.track.kind, en:s.track.enabled, lab:(s.track.label||'').slice(0,30)});
    const st=await pc.getStats(); const v=[];
    st.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video') v.push({b:r.bytesSent, fe:r.framesEncoded, fps:r.framesPerSecond}); });
    out.outVideo=v; break; }
  const pip=document.querySelector('[data-testid="draggable-pip"]');
  out.pipCam = pip?(()=>{const b=[...pip.querySelectorAll('button')].find(x=>/^Toggle camera$/i.test(q.nameOf(x).trim()));
    return b?b.getAttribute('aria-pressed'):null;})():null;
  return out;
}`;
const ALICE = `() => {
  const q=window.__qa;
  const t=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>/QA Dave/.test(n.innerText||''));
  if(!t) return {tile:false};
  const v=t.querySelector('video');
  const pq=v&&v.getVideoPlaybackQuality?v.getVideoPlaybackQuality():null;
  const ph=t.querySelector('[data-testid="participant-video-placeholder"]');
  const vm=t.querySelector('[data-testid="video-muted-icon"]');
  return {tile:true, hasVideo:!!v, vw:v?v.videoWidth:null, tf:pq?pq.totalVideoFrames:null,
    placeholderVis:ph?q.boxVis(ph):false, videoMutedIconVis:vm?q.boxVis(vm):false,
    text:(t.innerText||'').replace(/\\s+/g,' ').trim().slice(0,40)};
}`;
export default async ({ page }) => {
  await page.evaluate(DOM);
  const alice = await second('B','alice');
  await alice.page.evaluate(DOM);
  const out={};
  out.dave1 = await page.evaluate(`(${DAVE})()`);
  out.alice1 = await alice.page.evaluate(`(${ALICE})()`);
  await page.waitForTimeout(5000);
  out.dave2 = await page.evaluate(`(${DAVE})()`);
  out.alice2 = await alice.page.evaluate(`(${ALICE})()`);
  await alice.browser.close();
  return out;
};
