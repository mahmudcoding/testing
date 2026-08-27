export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const vis = async () => await page.evaluate(()=>
    [...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"],[class*="toast"]')]
      .map(e=>{const r=e.getBoundingClientRect();
        return {t:e.innerText.replace(/\n+/g,' ').trim().slice(0,60),
                w:Math.round(r.width), h:Math.round(r.height),
                srOnly:/sr-only/.test((e.className||'').toString())};})
      .filter(x=>x.t && !x.srOnly && x.w>20 && x.h>10));
  const btn = async () => await page.evaluate(()=>{const b=[...document.querySelectorAll('button')]
    .find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim()));
    return b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed')}:null;});
  const out={before:await btn(), visToastsBefore: await vis()};
  await cdp.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')]
    .find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim())); if(b) b.click();});
  const seen=[]; const t0=Date.now();
  while(Date.now()-t0<9000){ await page.waitForTimeout(500);
    for(const v of await vis()) if(!seen.some(s=>s.t===v.t)) seen.push({...v, at:((Date.now()-t0)/1000).toFixed(1)+'s'}); }
  out.duringOffline={btn: await btn(), visibleToasts: seen};
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  await page.waitForTimeout(10000);
  out.afterRestore={btn: await btn()};
  return out;
};
