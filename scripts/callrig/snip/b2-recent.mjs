export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const ui = await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const rows=[...body.querySelectorAll('button')].filter(v).filter(b=>/(Outbound|Inbound)\s*·/.test(b.innerText||''));
    return rows.slice(0,5).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,80));
  });
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meetings/history?limit=3',{credentials:'include'});
    const j=await r.json();
    return (j.meetings||[]).map(m=>({name:m.name, status:m.status, ended:m.ended_at, started:m.started_at, dur:m.duration_seconds, type:m.type, dir:m.direction, parts:m.participant_count}));
  });
  return {ui, api};
};
