export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return (j?.email??'').split('@')[0];});
  await page.waitForTimeout(3000);
  return await page.evaluate(async()=>{
    const pcs=window.__pcs||[];
    // map receiver track id -> pc index + ssrc
    const trackToPc={};
    for(let i=0;i<pcs.length;i++){
      const s=await pcs[i].getStats();
      const byTrack={};
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio') byTrack[r.trackIdentifier]={ssrc:r.ssrc,bytes:r.bytesReceived,energy:r.totalAudioEnergy}; });
      for(const r of pcs[i].getReceivers()){ if(r.track&&r.track.kind==='audio') trackToPc[r.track.id]={pc:i, stat:byTrack[r.track.id]||null, muted:r.track.muted, state:r.track.readyState}; }
    }
    const els=[...document.querySelectorAll('audio')].map(a=>{
      const tr=a.srcObject? a.srcObject.getAudioTracks().map(t=>t.id):[];
      return { paused:a.paused, muted:a.muted, volume:a.volume, tracks:tr.map(id=>({id:id.slice(0,8), ...(trackToPc[id]||{unmapped:true})})) };
    });
    return { audioElements: els.length,
             playingElements: els.filter(e=>!e.paused && !e.muted && e.volume>0),
             detail: els };
  });
};
