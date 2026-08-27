import { RTC_STATS } from './lib.mjs';
export default async ({ page }) => {
  const snap = () => page.evaluate(async()=>{
    const pcs=window.__pcs||[]; const rows=[];
    for(const pc of pcs){ if(pc.connectionState==='closed') continue;
      const s=await pc.getStats();
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio')
        rows.push({ssrc:r.ssrc,bytes:r.bytesReceived,energy:r.totalAudioEnergy||0,level:r.audioLevel||0}); }); }
    return rows;});
  const a=await snap(); await page.waitForTimeout(8000); const b=await snap();
  const d=b.map(x=>{const p=a.find(y=>y.ssrc===x.ssrc);
    return {ssrc:x.ssrc, dBytes:p?x.bytes-p.bytes:null, dEnergy:p?+(x.energy-p.energy).toFixed(4):null, level:+x.level.toFixed(4)};});
  return { streams:d.length, active:d.filter(x=>x.dEnergy>0.01).length, detail:d.sort((x,y)=>(y.dEnergy||0)-(x.dEnergy||0)).slice(0,4) };
};
