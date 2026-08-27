import {WS, BASE} from './e-p2-helpers.mjs';
const sample = () => {
  const t = document.body.innerText.replace(/\s+/g,' ');
  const ws = window.__wsRefs || [];
  return { total: ws.length, open: ws.filter(s=>s.readyState===1).length,
    closed: ws.filter(s=>s.readyState===3).length,
    banner:/Reconnecting|offline|connection lost|Unable to connect|переподключ/i.test(t),
    text:(t.match(/[^.]{0,20}(Reconnecting|offline|connection|Unable)[^.]{0,30}/i)||[''])[0].trim().slice(0,60)};
};
export default async ({page}) => {
  await page.addInitScript(() => {
    window.__wsRefs=[]; const O=window.WebSocket;
    const P=function(...a){const s=new O(...a); window.__wsRefs.push(s); return s;};
    P.prototype=O.prototype; window.WebSocket=P;
  });
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const wsUrl = await page.evaluate(()=> (window.__wsRefs[0]||{}).url || null);
  const before = await page.evaluate(sample);
  // block any further WS upgrades, then kill the live socket
  let blocked=0;
  await page.route('**/*', route => {
    const u=route.request().url();
    if (/^wss?:/.test(u) || /\/ws(\/|\?|$)/.test(u) || /socket/i.test(u)) { blocked++; return route.abort('failed'); }
    return route.continue();
  });
  await page.evaluate(()=>{ (window.__wsRefs||[]).forEach(s=>{ if(s.readyState===1) s.close(4002,'qa'); }); });
  const samples=[];
  for(let i=0;i<36;i++){ samples.push(Object.assign({t:i*500}, await page.evaluate(sample))); await page.waitForTimeout(500); }
  await page.unroute('**/*');
  await page.waitForTimeout(9000);
  const recovered = await page.evaluate(sample);
  const fb=samples.find(s=>s.banner);
  return {wsUrl: wsUrl? wsUrl.replace(/\/\/[^/]+/,'//<host>').slice(0,60):null, blockedUpgrades:blocked,
    before, firstBannerAt: fb? fb.t : null, bannerText: fb? fb.text : null,
    bannerStillUpAtEnd: samples[samples.length-1].banner,
    attemptsMade: samples[samples.length-1].total - before.total,
    last: samples[samples.length-1], recovered};
};
