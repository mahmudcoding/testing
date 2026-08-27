export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const probe = async () => await page.evaluate(async () => {
    const t0=performance.now();
    try { const r = await fetch('/api/v1/auth/me',{credentials:'include'});
          return {ok:true, status:r.status, ms:Math.round(performance.now()-t0)}; }
    catch(e){ return {ok:false, err:String(e).slice(0,60), ms:Math.round(performance.now()-t0)}; }
  });
  const before = await probe();
  await cdp.send('Network.emulateNetworkConditions',{offline:true, latency:0, downloadThroughput:0, uploadThroughput:0});
  await page.waitForTimeout(1500);
  const during = await probe();
  await cdp.send('Network.emulateNetworkConditions',{offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1});
  await page.waitForTimeout(2500);
  const after = await probe();
  return {before, during, after};
};
