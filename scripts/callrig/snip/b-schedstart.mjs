export default async ({page}) => {
  const out={};
  out.apiBefore = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?limit=10',{credentials:'include'}); const j=await r.json().catch(()=>null);
    const a=(j&&(j.meetings||j.items||j.data))||[];
    return Array.isArray(a)? a.slice(0,3).map(m=>({id:m.id,title:m.title||m.name,start:m.start_time||m.starts_at, parts:(m.participants||m.attendees||[]).length})) : String(JSON.stringify(j)).slice(0,200);
  });
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Start call$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return true;} return false;
  });
  await page.waitForTimeout(3000);
  out.confirm = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    return d? {t:d.innerText.replace(/\s+/g,' ').slice(0,260), b:[...d.querySelectorAll('button')].filter(y=>y.getBoundingClientRect().width>0).map(y=>(y.innerText||'').trim()).filter(Boolean).slice(0,8)}:null;
  });
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    return {url:location.href, cur: j&&j.meeting?{id:j.meeting.id,name:j.meeting.name}:null,
      txt: document.body.innerText.replace(/\s+/g,' ').slice(0,300)};
  });
  return out;
};
