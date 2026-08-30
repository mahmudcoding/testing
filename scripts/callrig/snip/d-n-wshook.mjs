// Install a WebSocket frame recorder BEFORE the app's socket opens, then reload and rejoin.
export default async ({page}) => {
  const mid = process.env.QA_MID;
  await page.addInitScript(() => {
    window.__ws = [];
    const OW = window.WebSocket;
    function W(url, proto){
      const s = proto===undefined ? new OW(url) : new OW(url, proto);
      try{ window.__ws.push({at:Date.now(), dir:'open', url:String(url).slice(0,120)}); }catch(e){}
      s.addEventListener('message', ev=>{
        try{ const d = typeof ev.data==='string'? ev.data : '[bin]';
          window.__ws.push({at:Date.now(), dir:'in', d: d.slice(0,400)}); if(window.__ws.length>4000) window.__ws.shift(); }catch(e){}
      });
      return s;
    }
    W.prototype = OW.prototype;
    for (const k of ['CONNECTING','OPEN','CLOSING','CLOSED']) W[k]=OW[k];
    window.WebSocket = W;
  });
  await page.goto(`https://airion-cargo.store/w/W4QDF1XTURESO01/call/${mid}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const out = {url:page.url()};
  for (const t of ['Join call','Join now','Join']) {
    const b = page.locator('button', {hasText:new RegExp('^'+t+'$')}).first();
    if (await b.count()>0 && await b.isVisible().catch(()=>false)) { await b.click(); out.clicked=t; await page.waitForTimeout(6000); break; }
  }
  out.url2 = page.url();
  out.ws = await page.evaluate(()=>({n:(window.__ws||[]).length, first:(window.__ws||[]).slice(0,3)}));
  out.inCall = await page.evaluate(()=>!!document.querySelector('[data-testid="call-overlay-expanded"]'));
  return out;
};
