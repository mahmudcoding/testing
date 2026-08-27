// Capture BOTH directions: does the client ever ask for workspace-wide / other-channel updates?
export default async ({page, ctx}) => {
  await ctx.addInitScript(`(()=>{
    if(window.__ws2) return; window.__ws2=true;
    window.__in=[]; window.__out=[]; window.__urls=[];
    const O=window.WebSocket;
    window.WebSocket=function(...a){ const s=new O(...a); window.__urls.push(String(a[0]).slice(0,160));
      s.addEventListener('message', ev=>{ try{ window.__in.push({t:Date.now(), d:(typeof ev.data==='string'?ev.data:'[bin]').slice(0,400)});}catch(e){} });
      const send=s.send.bind(s);
      s.send=(d)=>{ try{ window.__out.push({t:Date.now(), d:(typeof d==='string'?d:'[bin]').slice(0,400)});}catch(e){} return send(d); };
      return s; };
    window.WebSocket.prototype=O.prototype; Object.assign(window.WebSocket,O);
  })()`);
  const ws='W4QCF1XTURESO01', GEN='C4QCGENERAL0001', PRIV='C4QCPRIVATE0001';
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${GEN}`, {waitUntil:'load'});
  await page.waitForTimeout(8000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${PRIV}`, {waitUntil:'load'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>({urls:window.__urls, out:(window.__out||[]).map(x=>x.d), inCount:(window.__in||[]).length}));
};
