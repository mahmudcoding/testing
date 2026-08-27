export default async ({ page, ctx }) => {
  const probe = () => page.evaluate(async()=>{
    const pcs=window.__pcs||[]; const rows=[];
    for(const pc of pcs){ if(pc.connectionState==='closed') continue;
      const s=await pc.getStats();
      s.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video')
        rows.push({w:r.frameWidth,h:r.frameHeight,fps:r.framesPerSecond,enc:r.framesEncoded,
          q:r.qualityLimitationReason, dur:r.totalEncodeTime, sent:r.framesSent,
          scal:r.scalabilityMode, impl:(r.encoderImplementation||'').slice(0,18),
          qlDur:JSON.stringify(r.qualityLimitationDurations||{}).slice(0,90)}); }); }
    return rows;});
  const out={};
  await page.waitForTimeout(12000);
  out.noise_baseline = await probe();
  const cdp = await ctx.newCDPSession(page);
  for (const rate of [4, 12, 20]) {
    await cdp.send('Emulation.setCPUThrottlingRate',{rate});
    await page.waitForTimeout(22000);
    out['noise_throttle_'+rate] = await probe();
  }
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  await page.waitForTimeout(18000);
  out.noise_released = await probe();
  return out;
};
