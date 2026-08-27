export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return (j?.email??'').split('@')[0];});
  const snap = () => page.evaluate(async()=>{
    const pcs=window.__pcs||[]; const res=[];
    for(let i=0;i<pcs.length;i++){ const pc=pcs[i]; const s=await pc.getStats(); const ins=[];
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio') ins.push({ssrc:r.ssrc,bytes:r.bytesReceived,energy:r.totalAudioEnergy||0}); });
      res.push({conn:pc.connectionState, ins}); }
    return res;});
  const a=await snap(); await page.waitForTimeout(8000); const b=await snap();
  const rows=[];
  b.forEach((pc,i)=>pc.ins.forEach(s=>{ const p=(a[i]?.ins||[]).find(x=>x.ssrc===s.ssrc);
    rows.push({pc:i, ssrc:s.ssrc, dBytes:p?s.bytes-p.bytes:null, dEnergy:p?+(s.energy-p.energy).toFixed(4):null}); }));
  return { who, rows };
};
