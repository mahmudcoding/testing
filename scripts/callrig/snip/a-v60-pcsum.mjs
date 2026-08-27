export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return (j?.email??j?.data?.email??'').split('@')[0];});
  const snap = () => page.evaluate(async()=>{
    const pcs=window.__pcs||[]; const res=[];
    for(let i=0;i<pcs.length;i++){ const pc=pcs[i]; const s=await pc.getStats(); const ins=[];
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio') ins.push({ssrc:r.ssrc,bytes:r.bytesReceived}); });
      res.push({conn:pc.connectionState, ins}); }
    return res;});
  const a=await snap(); await page.waitForTimeout(6000); const b=await snap();
  const lines=b.map((pc,i)=>{
    const live=pc.ins.filter(s=>{const p=(a[i]?.ins||[]).find(x=>x.ssrc===s.ssrc); return p && s.bytes-p.bytes>0;});
    return `PC${i} ${pc.conn}: ${pc.ins.length} inbound-audio, ${live.length} RISING`;});
  return { who, pcCount:b.length, lines };
};
