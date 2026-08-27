export default async ({page}) => {
  const out={};
  out.clicked = await page.evaluate(()=>{
    const dlgs=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0);
    const d=dlgs.find(x=>/Leave this call\?/i.test(x.innerText));
    if(!d) return 'no-confirm';
    const b=[...d.querySelectorAll('button')].find(y=>(y.innerText||'').trim()==='Leave');
    if(!b) return 'no-btn';
    b.click(); return 'clicked';
  });
  await page.waitForTimeout(7000);
  out.after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    return {cur: j&&j.meeting?{id:j.meeting.id}:null, url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,300)};
  });
  return out;
};
