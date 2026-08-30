/* sector L workhorse: in-call state — toolbar with state, tiles, senders, receivers */
import { DOM, RTC_STATS } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out = {};
  out.url = page.url();
  out.vis = await page.evaluate(()=>document.visibilityState);
  out.toolbar = await page.evaluate(()=>{
    const w=window.__qa;
    return [...document.querySelectorAll('button')].filter(w.vis).map(b=>({
      n:w.nameOf(b).slice(0,50), p:b.getAttribute('aria-pressed'), e:b.getAttribute('aria-expanded'),
      d:b.disabled||b.getAttribute('aria-disabled')==='true', t:b.getAttribute('data-testid')||null
    }));
  });
  out.senders = await page.evaluate(()=>{
    const pcs=window.__pcs||[];
    const r=[];
    for(const pc of pcs){ if(pc.connectionState==='closed') continue;
      for(const s of pc.getSenders()){ if(s.track) r.push({kind:s.track.kind, enabled:s.track.enabled, muted:s.track.muted, state:s.track.readyState, label:(s.track.label||'').slice(0,60)}); } }
    return r;
  });
  out.receivers = await page.evaluate(()=>{
    const pcs=window.__pcs||[];
    const r=[];
    for(const pc of pcs){ if(pc.connectionState==='closed') continue;
      for(const s of pc.getReceivers()){ if(s.track) r.push({kind:s.track.kind, enabled:s.track.enabled, muted:s.track.muted, state:s.track.readyState}); } }
    return r;
  });
  out.rtc = await page.evaluate(`(${RTC_STATS})()`);
  out.tiles = await page.evaluate(()=>{
    const w=window.__qa;
    // participant tiles: find elements whose testid mentions tile/participant
    const cand=[...document.querySelectorAll('[data-testid]')].filter(n=>/tile|participant/i.test(n.getAttribute('data-testid')));
    return cand.filter(w.boxVis).map(n=>({t:n.getAttribute('data-testid'),
      text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,80),
      w:Math.round(n.getBoundingClientRect().width), h:Math.round(n.getBoundingClientRect().height)})).slice(0,25);
  });
  out.videos = await page.evaluate(()=>[...document.querySelectorAll('video')].map(v=>({
    w:v.videoWidth,h:v.videoHeight,paused:v.paused,muted:v.muted,hasSrc:!!v.srcObject,
    tracks:v.srcObject?v.srcObject.getTracks().map(t=>t.kind+':'+(t.enabled?'on':'off')+':'+(t.muted?'m':'u')+':'+t.readyState):[]})));
  out.notices = await page.evaluate(()=>window.__qa.notices());
  return out;
};
