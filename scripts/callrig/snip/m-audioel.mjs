export default async ({page}) => {
  return await page.evaluate(async () => {
    const pcs = window.__pcs || [];
    const perPc = [];
    for (let i=0;i<pcs.length;i++) {
      const pc = pcs[i];
      let s=null; try{s=await pc.getStats();}catch(e){}
      const recv = pc.getReceivers().map(r=>({id:r.track&&r.track.id, kind:r.track&&r.track.kind,
        muted:r.track&&r.track.muted, enabled:r.track&&r.track.enabled, ready:r.track&&r.track.readyState}));
      const send = pc.getSenders().filter(x=>x.track).map(r=>({id:r.track.id, kind:r.track.kind, enabled:r.track.enabled}));
      perPc.push({pc:i, conn:pc.connectionState, recv, send});
    }
    const els = [...document.querySelectorAll('audio,video')].map(e=>{
      const so = e.srcObject;
      const tracks = so && so.getTracks ? so.getTracks().map(t=>({id:t.id, kind:t.kind, enabled:t.enabled, muted:t.muted, ready:t.readyState})) : null;
      return {tag:e.tagName, muted:e.muted, volume:e.volume, paused:e.paused, autoplay:e.autoplay,
        inDom:document.contains(e), rect:(()=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];})(),
        tracks};
    });
    return {perPc, els, nEls: els.length};
  });
};
