export default async ({page}) => {
  const out={};
  out.before = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?{id:j.meeting.id,name:j.meeting.name}:null; });
  out.warnBefore = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).map(x=>x.innerText.replace(/\s+/g,' ').slice(0,250));
    return d;
  });
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Accept$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(3000);
  out.confirmDialog = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).map(x=>({t:x.innerText.replace(/\s+/g,' ').slice(0,250), b:[...x.querySelectorAll('button')].map(y=>(y.innerText||'').trim()).filter(Boolean)})));
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    return { cur: j&&j.meeting?{id:j.meeting.id,name:j.meeting.name}:null, url:location.href,
      txt: document.body.innerText.replace(/\s+/g,' ').slice(0,350) };
  });
  return out;
};
