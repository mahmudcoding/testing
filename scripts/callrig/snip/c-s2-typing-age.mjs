const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.addInitScript(() => {
    window.__ws = {sent: [], recv: [], sockets: 0};
    const OW = window.WebSocket;
    function P(...a){ const s=new OW(...a); window.__ws.sockets++;
      s.addEventListener('message',(e)=>{try{window.__ws.recv.push({t:Math.round(performance.now()),d:String(e.data).slice(0,200)});}catch{}});
      const os=s.send.bind(s); s.send=(d)=>{try{window.__ws.sent.push({t:Math.round(performance.now()),d:String(d).slice(0,200)});}catch{} return os(d);}; return s; }
    P.prototype=OW.prototype; Object.assign(P,OW); window.WebSocket=P;
    window.__rec = {events: [], t0: performance.now(), boot: Date.now()};
    const push = (why) => {
      const rows=[...document.querySelectorAll('[role="status"]')]
        .map(e=>({t:(e.textContent||'').trim().slice(0,50), h:Math.round(e.getBoundingClientRect().height)}))
        .filter(x=>x.t!=='');
      const r=window.__rec;
      const last = r.events[r.events.length-1];
      const key = why+'|'+JSON.stringify(rows);
      if (!last || last.key !== key) r.events.push({t:Math.round(performance.now()-r.t0), why, rows, key,
        focus: document.hasFocus(), vis: document.visibilityState, wsN: window.__ws.recv.length});
      if (r.events.length>400) r.events.shift();
    };
    const mo = new MutationObserver(()=>push('mut'));
    const start = () => { if (document.body) { mo.observe(document.body,{subtree:true,childList:true,characterData:true}); }
                          else setTimeout(start,50); };
    start();
    setInterval(()=>push('tick'), 400);
  });
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>({ready:true, events:window.__rec.events.length, vis:document.visibilityState}));
};
