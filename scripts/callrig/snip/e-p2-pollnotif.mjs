export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(() => {
    if(window.__nTimer) clearInterval(window.__nTimer);
    window.__n=[]; const t0=performance.now();
    window.__nTimer=setInterval(async ()=>{
      try{ const r=await fetch('/api/v1/notifications?limit=6',{credentials:'include'});
        const d=await r.json(); const a=d.notifications||[];
        window.__n.push({t:Math.round(performance.now()-t0), n:a.length,
          top:a.slice(0,2).map(x=>x.event_type+' :: '+(x.body||'').slice(0,44))});
      }catch(e){}
      if(window.__n.length>240) window.__n.shift();
    },500); return 'poller installed'; })()`);
};
