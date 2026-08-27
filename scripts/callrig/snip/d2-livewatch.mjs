// Sit on a page and record every visible notice for QA_MS, keeping max opacity.
export default async ({page}) => {
  const url = process.env.QA_URL || '/w/W4QDF1XTURESO01/directories';
  await page.goto('https://airion-cargo.store'+url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const ms = Number(process.env.QA_MS||30000);
  await page.evaluate(()=>{ window.__n=[]; window.__t0=performance.now();
    window.__id=setInterval(()=>{
      for(const e of document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')){
        const t=(e.textContent||'').replace(/\s+/g,' ').trim(); if(!t||t.length>200) continue;
        const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) continue;
        let n=e,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
        const k=t+'|'+Math.round(r.width)+'x'+Math.round(r.height);
        const p=window.__n.find(x=>x.k===k);
        if(p){p.maxOp=Math.max(p.maxOp,o);} else window.__n.push({k,txt:t.slice(0,90),maxOp:o,atMs:Math.round(performance.now()-window.__t0)});
      }},200);
  });
  await page.waitForTimeout(ms);
  const notices = await page.evaluate(()=>{clearInterval(window.__id); return window.__n;});
  const state = await page.evaluate(async()=>{
    const s=await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json();
    const n=await (await fetch('/api/v1/notifications?limit=5',{credentials:'include'})).json();
    return {mute_all_channels:s.mute_all_channels, in_app_enabled:s.in_app_enabled, total:n.total};
  });
  return {vis: await page.evaluate(()=>document.visibilityState), notices, state};
};
