// Does the server push anything about unread when a message lands in a channel we are NOT viewing?
export default async ({page, ctx}) => {
  await ctx.addInitScript(`(()=>{
    if(window.__wsHooked) return; window.__wsHooked=true;
    window.__frames=[]; const O=window.WebSocket;
    window.WebSocket=function(...a){ const s=new O(...a);
      s.addEventListener('message', ev=>{ try{ const d=typeof ev.data==='string'?ev.data:'[bin]';
        window.__frames.push({t:Date.now(), d:d.slice(0,600)});}catch(e){} });
      return s; };
    window.WebSocket.prototype=O.prototype; Object.assign(window.WebSocket,O);
  })()`);
  const ws='W4QCF1XTURESO01', GEN='C4QCGENERAL0001', PRIV='C4QCPRIVATE0001';
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${GEN}`, {waitUntil:'load'});
  await page.waitForTimeout(8000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${PRIV}`, {waitUntil:'load'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>({hooked:!!window.__wsHooked, framesSoFar:(window.__frames||[]).length,
    t0:Date.now(), url:location.pathname}));
};
