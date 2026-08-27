export default async ({ page, ctx }) => {
  const out={};
  // publish video
  const cam = page.locator('button[aria-label="Turn camera on"]').first();
  out.camFound = await cam.count()>0;
  if(out.camFound){ await cam.click(); await page.waitForTimeout(9000); }
  const outbound = () => page.evaluate(async()=>{
    const pcs=window.__pcs||[]; const rows=[];
    for(const pc of pcs){ if(pc.connectionState==='closed') continue;
      const s=await pc.getStats();
      s.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video')
        rows.push({rid:r.rid||'-',w:r.frameWidth,h:r.frameHeight,fps:r.framesPerSecond,
          enc:r.framesEncoded,bytes:r.bytesSent,q:r.qualityLimitationReason,
          scale:r.scalabilityMode||'-'}); }); }
    return rows;});
  out.baseline = await outbound();
  await page.waitForTimeout(6000);
  out.baseline2 = await outbound();
  // apply heavy CPU throttling via CDP
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:20});
  out.throttled='rate:20';
  await page.waitForTimeout(25000);
  out.underPressure = await outbound();
  await page.waitForTimeout(15000);
  out.underPressure2 = await outbound();
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  await page.waitForTimeout(15000);
  out.recovered = await outbound();
  return out;
};
