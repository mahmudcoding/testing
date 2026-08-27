import { VIS, SNAP } from './a-nb-lib.mjs';
export default async ({page, ctx}) => {
  const link = process.env.QA_LINK;
  await ctx.clearCookies();
  await ctx.addInitScript(() => {
    if (window.__wsHooked) return;
    window.__wsHooked = true; window.__wsLog = [];
    const O = window.WebSocket;
    function P(...a){ const s=new O(...a);
      s.addEventListener('message', e=>{ try{ const d=typeof e.data==='string'?e.data:'<binary>';
        window.__wsLog.push({t:Date.now(), dir:'in', d:d.slice(0,700)});
        if(window.__wsLog.length>4000) window.__wsLog.splice(0,2000);}catch{} });
      const snd=s.send.bind(s); s.send=x=>{try{window.__wsLog.push({t:Date.now(),dir:'out',d:String(x).slice(0,300)});}catch{} return snd(x);};
      return s; }
    P.prototype=O.prototype; Object.assign(P,O); window.WebSocket=P;
  });
  await page.goto(link, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(([v,s])=>eval('('+s+')')(v,'main'), [VIS, SNAP]);
}
