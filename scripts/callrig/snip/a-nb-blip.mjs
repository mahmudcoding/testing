// Drop the network for a few seconds, restore it, and report what the app WebSocket
// re-subscribed to afterwards. Requires the a-nb-wsrec2 recorder to be installed.
export default async ({page, ctx}) => {
  const OFF = Number(process.env.QA_OFF || 12000);
  const before = await page.evaluate(()=> (window.__wsLog||[]).length);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:true, latency:0, downloadThroughput:-1, uploadThroughput:-1});
  await page.waitForTimeout(OFF);
  await cdp.send('Network.emulateNetworkConditions',{offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1});
  await page.waitForTimeout(Number(process.env.QA_SETTLE || 25000));
  return await page.evaluate((b)=>{ const l=window.__wsLog||[];
    const tail=l.slice(b);
    const t0=tail.length?tail[0].t:0;
    return {before:b, after:l.length,
      frames: tail.filter(x=>x.d!=='<binary>').map(x=>({ms:x.t-t0, dir:x.dir, d:x.d.slice(0,140)}))
        .filter(x=>!/"type":"(ping|pong)"/.test(x.d)).slice(0,40)};
  }, before);
};
