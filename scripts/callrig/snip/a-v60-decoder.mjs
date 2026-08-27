const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const probe = () => page.evaluate(async()=>{
    const pcs=window.__pcs||[]; const rows=[];
    for(const pc of pcs){ if(pc.connectionState==='closed') continue;
      const s=await pc.getStats();
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='video')
        rows.push({ssrc:r.ssrc,w:r.frameWidth,h:r.frameHeight,dec:r.framesDecoded,
          decoder:(r.decoderImplementation||'').slice(0,26), freeze:r.freezeCount, pli:r.pliCount}); }); }
    const tiles=[...document.querySelectorAll('video')].map(v=>Math.round(v.getBoundingClientRect().width));
    return {rows, tiles};});
  const out={};
  out.t0 = await probe();
  // switch view (grid <-> spotlight): the classic decoder-remount trigger
  const sw = async () => { for(const al of ['Grid view','Spotlight view']){
      const b=page.locator(`button[aria-label="${al}"]`).first();
      if(await b.count()){ await b.click().catch(()=>{}); return al; } } return null; };
  out.switch1 = await sw(); await page.waitForTimeout(7000);
  out.t1 = await probe();
  out.switch2 = await sw(); await page.waitForTimeout(7000);
  out.t2 = await probe();
  // open and close a side panel — another remount trigger
  await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{});
  await page.waitForTimeout(4000);
  out.t3 = await probe();
  await page.locator('button[aria-label="Close"]').first().click().catch(()=>{});
  await page.waitForTimeout(5000);
  out.t4 = await probe();
  const seq = ['t0','t1','t2','t3','t4'].map(k=>({at:k, tiles:out[k].tiles,
    dec:out[k].rows.map(r=>r.dec), w:out[k].rows.map(r=>r.w),
    decoder:[...new Set(out[k].rows.map(r=>r.decoder))], freeze:out[k].rows.map(r=>r.freeze)}));
  const decs = seq.map(s=>s.dec[0]).filter(x=>x!==undefined);
  return { seq, framesDecodedMonotonic: decs.every((v,i)=>i===0||v>=decs[i-1]),
           decoderChanged: new Set(seq.flatMap(s=>s.decoder)).size>1,
           switches:[out.switch1,out.switch2] };
};
