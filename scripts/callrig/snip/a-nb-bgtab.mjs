export default async ({page, ctx}) => {
  const out={};
  out.before = await page.evaluate(()=>({vis:document.visibilityState, hidden:document.hidden}));
  const p2 = await ctx.newPage();
  await p2.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories', {waitUntil:'domcontentloaded'});
  await p2.bringToFront();
  await p2.waitForTimeout(Number(process.env.QA_BG||60000));
  out.duringCallTab = await page.evaluate(()=>({vis:document.visibilityState, hidden:document.hidden}));
  out.rtcDuring = await page.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const o=[];
    for (const pc of pcs) { if (pc.connectionState==='closed') continue;
      const st=await pc.getStats(); st.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio') o.push(r.packetsReceived||0); }); }
    return o; });
  await p2.close();
  await page.bringToFront();
  await page.waitForTimeout(4000);
  out.after = await page.evaluate(()=>({vis:document.visibilityState, hidden:document.hidden}));
  out.rtcAfter = await page.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const o=[];
    for (const pc of pcs) { if (pc.connectionState==='closed') continue;
      const st=await pc.getStats(); st.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio') o.push(r.packetsReceived||0); }); }
    return o; });
  return out;
};
