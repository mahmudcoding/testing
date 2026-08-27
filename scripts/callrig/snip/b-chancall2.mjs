export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH='C4QBGENERAL0001';
  const out={};
  // dismiss any leftover dialog first
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>/^Done$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(1500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.preCur = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?j.meeting.id:null; });
  out.clicked = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const b=[...m.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Start call');
    if(b){ b.click(); return true; } return false;
  });
  // poll for 16s without touching anything
  out.timeline = await page.evaluate(async()=>{
    const snaps=[]; const seen=new Set(); const t0=Date.now();
    while (Date.now()-t0 < 16000) {
      const j = await fetch('/api/v1/meetings/current',{credentials:'include'}).then(r=>r.json()).catch(()=>null);
      const m = j&&j.meeting;
      const dlg = [...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).map(x=>x.innerText.replace(/\s+/g,' ').slice(0,110)).join(' || ');
      const rec = JSON.stringify({cur:m?{id:m.id,status:m.status,name:m.name}:null, path:location.pathname, dlg});
      if(!seen.has(rec)){ seen.add(rec); snaps.push({at:Date.now()-t0, ...JSON.parse(rec)}); }
      await new Promise(r=>setTimeout(r,700));
    }
    return snaps.slice(0,12);
  });
  return out;
};
