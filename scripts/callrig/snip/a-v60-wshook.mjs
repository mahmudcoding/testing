export default async ({ page }) => {
  await page.addInitScript(() => {
    window.__ws = [];
    const OW = window.WebSocket;
    window.WebSocket = function(...a){
      const s = new OW(...a);
      window.__ws.push({url:String(a[0]).slice(0,80), opened:Date.now(), frames:[]});
      const rec = window.__ws[window.__ws.length-1];
      s.addEventListener('message', e => {
        let t = typeof e.data === 'string' ? e.data : '[binary]';
        rec.frames.push({at:Date.now(), d:t.slice(0,300)});
        if (rec.frames.length > 400) rec.frames.shift();
      });
      return s;
    };
    window.WebSocket.prototype = OW.prototype;
    Object.assign(window.WebSocket, OW);
  });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>({ sockets:(window.__ws||[]).map(w=>({url:w.url,frames:w.frames.length})), t0:Date.now() }));
};
