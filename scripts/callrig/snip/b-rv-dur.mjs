export default async ({page}) => {
  const WS='W4QBF1XTURESO01'; const mid=process.env.QA_MID;
  const out={mid};
  out.inCallTimer = await page.evaluate(()=>{ const t=document.body.innerText.replace(/\s+/g,' '); return (t.match(/\b\d{1,2}:\d{2}(:\d{2})?\b/)||[])[0]||null; });
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/calls/${mid}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.url = page.url();
  out.pageHead = await page.evaluate(()=>{ const m=document.querySelector('main')||document.body; return m.innerText.replace(/\s+/g,' ').slice(0,300); });
  out.clickedViewAll = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,a')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^View all$/i.test((x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(4000);
  out.participants = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],aside')].filter(x=>x.getBoundingClientRect().width>0).pop();
    const src = d || document.querySelector('main') || document.body;
    return src.innerText.replace(/\n{2,}/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,40);
  });
  out.api = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=(j&&(j.participants||j.items||j.data))||[];
    return {s:r.status, rows:a.map(p=>({name:p.name, joined:p.joined_at, left:p.left_at, dur:p.duration_seconds ?? p.in_call_seconds ?? p.duration, keys:Object.keys(p).filter(k=>/dur|second|time|at$/.test(k))}))};
  }, mid);
  out.meeting = await page.evaluate(async(id)=>{ const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'}); const j=await r.json().catch(()=>null); const m=j&&(j.meeting||j); return {status:m&&m.status, started:m&&m.started_at}; }, mid);
  return out;
};
