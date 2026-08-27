export default async ({page}) => {
  return await page.evaluate(async()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const rec=[...body.querySelectorAll('section')].find(s=>/Recent calls/.test((s.innerText||'').slice(0,40)));
    const btns=rec?[...rec.querySelectorAll('button')].filter(v):[];
    const r=await fetch('/api/v1/meetings/history?limit=6',{credentials:'include'});
    const j=await r.json();
    return {
      secText: rec?(rec.innerText||'').replace(/\n+/g,' | ').slice(0,900):null,
      allBtns: btns.map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,70)),
      api: (j.meetings||[]).map(m=>({name:m.name, status:m.status, started:m.started_at, keys:Object.keys(m).slice(0,14)}))
    };
  });
};
