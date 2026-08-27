export default async ({page}) => {
  await page.addInitScript(() => {
    window.__ws = {created:0, opened:0, closed:0, errors:0, msgIn:0, msgOut:0, last:null, sockets:[]};
    const OW = window.WebSocket;
    window.WebSocket = function(...args){
      const s = new OW(...args);
      window.__ws.created++;
      window.__ws.sockets.push(s);
      s.addEventListener('open', ()=>{ window.__ws.opened++; window.__ws.last='open@'+new Date().toISOString(); });
      s.addEventListener('close', (e)=>{ window.__ws.closed++; window.__ws.last='close('+e.code+')@'+new Date().toISOString(); });
      s.addEventListener('error', ()=>{ window.__ws.errors++; window.__ws.last='error@'+new Date().toISOString(); });
      s.addEventListener('message', ()=>{ window.__ws.msgIn++; window.__ws.lastMsg=Date.now(); });
      const os = s.send.bind(s);
      s.send = (d)=>{ window.__ws.msgOut++; return os(d); };
      return s;
    };
    window.WebSocket.prototype = OW.prototype;
    Object.assign(window.WebSocket, OW);
  });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(12000);
  return await page.evaluate(()=>({
    ws: window.__ws ? {created:window.__ws.created, opened:window.__ws.opened, closed:window.__ws.closed,
                       msgIn:window.__ws.msgIn, msgOut:window.__ws.msgOut, last:window.__ws.last,
                       states:(window.__ws.sockets||[]).map(s=>s.readyState)} : null,
    startedAt: new Date().toISOString()}));
};
