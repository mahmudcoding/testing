export default async ({page, ctx}) => {
  const out={};
  const cdp = await ctx.newCDPSession(page);
  const {windowId, bounds} = await cdp.send('Browser.getWindowForTarget');
  out.origBounds = bounds;
  out.before = await page.evaluate(()=>document.visibilityState);
  await cdp.send('Browser.setWindowBounds', {windowId, bounds:{windowState:'minimized'}});
  await page.waitForTimeout(3000);
  out.during = await page.evaluate(()=>document.visibilityState).catch(e=>'eval-blocked');
  const sample = async () => await page.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const o=[];
    for (const pc of pcs) { if (pc.connectionState==='closed') continue;
      const st=await pc.getStats(); st.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio') o.push(r.packetsReceived||0); }); }
    return o; }).catch(()=>['eval-blocked']);
  out.s0 = await sample();
  await page.waitForTimeout(Number(process.env.QA_MIN||45000));
  out.s1 = await sample();
  await cdp.send('Browser.setWindowBounds', {windowId, bounds:{windowState:'normal'}});
  await page.waitForTimeout(2000);
  await cdp.send('Browser.setWindowBounds', {windowId, bounds:{windowState:'maximized'}}).catch(()=>{});
  await page.waitForTimeout(3000);
  out.after = await page.evaluate(()=>document.visibilityState);
  out.s2 = await sample();
  return out;
};
