import {WS, BASE} from './e-p2-helpers.mjs';
const sample = () => {
  const t=document.body.innerText.replace(/\s+/g,' ');
  const ws=window.__wsRefs||[];
  return {total:ws.length, open:ws.filter(s=>s.readyState===1).length,
    closed:ws.filter(s=>s.readyState===3).length,
    banner:/Reconnecting|offline|connection|Unable to connect|переподключ/i.test(t),
    text:(t.match(/[^.]{0,16}(Reconnecting|offline|connection|Unable)[^.]{0,34}/i)||[''])[0].trim().slice(0,56)};
};
export default async ({page}) => {
  await page.addInitScript(()=>{
    window.__wsRefs=[]; const O=window.WebSocket;
    const P=function(...a){const s=new O(...a); window.__wsRefs.push(s); return s;};
    P.prototype=O.prototype; window.WebSocket=P;
  });
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const before = await page.evaluate(sample);
  // refuse every further WS: intercept and close immediately, never connect to the server
  let intercepted=0;
  await page.routeWebSocket(/.*/, ws => { intercepted++; ws.close({code:1011, reason:'qa-blocked'}); });
  await page.evaluate(()=>{ (window.__wsRefs||[]).forEach(s=>{ if(s.readyState===1) s.close(4003,'qa'); }); });
  const samples=[];
  for(let i=0;i<40;i++){ samples.push(Object.assign({t:i*500}, await page.evaluate(sample))); await page.waitForTimeout(500); }
  const fb=samples.find(s=>s.banner);
  return {before, interceptedUpgrades:intercepted,
    firstBannerAt: fb? fb.t : null, bannerText: fb? fb.text : null,
    bannerAtEnd: samples[samples.length-1].banner,
    reconnectAttempts: samples[samples.length-1].total - before.total,
    everReopened: samples.some(s=>s.open>0),
    timeline: samples.filter((_,i)=>i%4===0).map(s=>`${s.t}ms total=${s.total} open=${s.open} banner=${s.banner}`)};
};
