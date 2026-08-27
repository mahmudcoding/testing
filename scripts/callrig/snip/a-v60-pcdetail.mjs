export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return j?.email??j?.data?.email;});
  const snap = () => page.evaluate(async()=>{
    const pcs = window.__pcs||[];
    const res=[];
    for(let i=0;i<pcs.length;i++){
      const pc=pcs[i];
      const s=await pc.getStats();
      const ins=[];
      const idToTrack={};
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio') ins.push({ssrc:r.ssrc,bytes:r.bytesReceived,energy:r.totalAudioEnergy,trackId:r.trackIdentifier}); });
      res.push({i, conn:pc.connectionState, ice:pc.iceConnectionState, sig:pc.signalingState,
                receivers:pc.getReceivers().filter(r=>r.track&&r.track.kind==='audio').map(r=>({id:r.track.id.slice(0,8),enabled:r.track.enabled,state:r.track.readyState,muted:r.track.muted})),
                inbound:ins});
    }
    return res;});
  const a = await snap();
  await page.waitForTimeout(6000);
  const b = await snap();
  // pair up by ssrc to see which are actually rising
  const delta = b.map((pc,i)=>({ pc:pc.i, conn:pc.conn,
    streams: pc.inbound.map(s=>{ const prev=(a[i]?.inbound||[]).find(x=>x.ssrc===s.ssrc);
      return { ssrc:s.ssrc, bytes:s.bytes, deltaBytes: prev? s.bytes-prev.bytes : null,
               deltaEnergy: prev? +(s.energy-prev.energy).toFixed(4) : null, live: prev? (s.bytes-prev.bytes)>0 : null }; }),
    liveReceivers: pc.receivers.filter(r=>r.state==='live'&&!r.muted).length,
    receivers: pc.receivers }));
  return { who, pcCount:b.length, delta };
};
