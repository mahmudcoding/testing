import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // instrument WebSocket BEFORE the app loads
  await page.addInitScript(()=>{
    window.__ws=[];
    const OrigWS=window.WebSocket;
    window.WebSocket=function(...a){
      const s=new OrigWS(...a);
      const rec={url:String(a[0]).slice(0,60), opened:false, closed:false, closeCode:null, errors:0};
      window.__ws.push(rec);
      s.addEventListener('open',()=>{rec.opened=true;});
      s.addEventListener('close',e=>{rec.closed=true; rec.closeCode=e.code;});
      s.addEventListener('error',()=>{rec.errors++;});
      return s;
    };
    window.WebSocket.prototype=OrigWS.prototype;
    Object.assign(window.WebSocket, OrigWS);
  });
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const before = await page.evaluate(()=>({sockets:window.__ws.map(x=>({...x})), online:navigator.onLine}));
  await page.context().setOffline(true);
  const samples=[];
  for(let i=0;i<40;i++){                       // 20 s offline
    samples.push({t:i*500, ...(await page.evaluate(()=>({
      online:navigator.onLine,
      open:window.__ws.filter(x=>x.opened&&!x.closed).length,
      closed:window.__ws.filter(x=>x.closed).length,
      total:window.__ws.length,
      indicator: (()=>{ // any element whose text OR title mentions connection
        const t=document.body.innerText.replace(/\s+/g,' ');
        return /offline|reconnect|connection|no internet|нет соединения/i.test(t);})()
    }))));
    await page.waitForTimeout(500);
  }
  await page.context().setOffline(false);
  await page.waitForTimeout(8000);
  const after = await page.evaluate(()=>({sockets:window.__ws.map(x=>({...x})), online:navigator.onLine,
    open:window.__ws.filter(x=>x.opened&&!x.closed).length}));
  const firstClose = samples.find(s=>s.closed>0);
  const firstIndicator = samples.find(s=>s.indicator);
  return {before:{count:before.sockets.length, sockets:before.sockets.slice(0,3)},
    firstSocketCloseAt: firstClose? firstClose.t : null,
    firstIndicatorAt: firstIndicator? firstIndicator.t : null,
    lastSample: samples[samples.length-1], after:{online:after.online, open:after.open, total:after.sockets.length}};
};
