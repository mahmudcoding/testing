const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.addInitScript(() => {
    window.__ws = {sent: [], recv: [], sockets: 0};
    const OW = window.WebSocket;
    function P(...a){ const s=new OW(...a); window.__ws.sockets++;
      s.addEventListener('message',(e)=>{try{window.__ws.recv.push({t:Math.round(performance.now()),d:String(e.data).slice(0,200)});}catch{}});
      const os=s.send.bind(s); s.send=(d)=>{try{window.__ws.sent.push({t:Math.round(performance.now()),d:String(d).slice(0,200)});}catch{} return os(d);}; return s; }
    P.prototype=OW.prototype; Object.assign(P,OW); window.WebSocket=P;
    // start polling as early as possible
    window.__tpBoot = {samples:[], t0: performance.now()};
    const id = setInterval(()=>{
      const r=window.__tpBoot;
      const rows=[...document.querySelectorAll('[role="status"]')].map(e=>({t:(e.textContent||'').trim().slice(0,50),h:Math.round(e.getBoundingClientRect().height)}));
      r.samples.push({t:Math.round(performance.now()-r.t0), rows, wsN:(window.__ws?.recv||[]).length});
      if (r.samples.length>250) clearInterval(id);
    },200);
    window.__tpBoot.id = id;
  });
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>({ready:true, samples:window.__tpBoot?.samples.length, vis:document.visibilityState, url:location.href}));
};
