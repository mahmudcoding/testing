export default async ({ page, ctx }) => {
  const probe = async (tag) => {
    await page.waitForTimeout(9000);
    return await page.evaluate(async(tag)=>{
      const pcs=window.__pcs||[]; const rows=[];
      for(const pc of pcs){ if(pc.connectionState==='closed') continue;
        const s=await pc.getStats();
        s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='video')
          rows.push({ssrc:r.ssrc,w:r.frameWidth,h:r.frameHeight,fps:r.framesPerSecond,dec:r.framesDecoded}); }); }
      const tiles=[...document.querySelectorAll('video')].map(v=>{const b=v.getBoundingClientRect();
        return {cssW:Math.round(b.width), devW:Math.round(b.width*devicePixelRatio), vw:v.videoWidth};});
      return {tag, vp:[innerWidth,innerHeight], dpr:devicePixelRatio, inbound:rows, tiles};}, tag);
  };
  const out={};
  const cdp = await ctx.newCDPSession(page);
  out.full = await probe('full');
  // shrink the viewport so the remote tile demands far fewer device pixels
  for (const [w,h,tag] of [[900,600,'w900'],[640,480,'w640'],[420,320,'w420']]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
    out[tag] = await probe(tag);
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  out.restored = await probe('restored');
  const line = (k)=>{const p=out[k]; if(!p) return null;
    return {vp:p.vp[0], dpr:p.dpr, tileDevW:p.tiles.map(t=>t.devW), inboundW:p.inbound.map(r=>r.w), fps:p.inbound.map(r=>r.fps)};};
  return { full:line('full'), w900:line('w900'), w640:line('w640'), w420:line('w420'), restored:line('restored') };
};
