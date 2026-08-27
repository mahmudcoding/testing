export default async ({page}) => {
  const out={};
  out.urlBefore = page.url();
  const box = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button[aria-label="Leave call"],[data-testid="call-controls-leave"]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)};
  });
  out.leaveBox = box;
  if (!box) return {...out, err:'no Leave call'};
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(2200);
  out.dlg = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0 && x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    return d? {t:d.innerText.replace(/\s+/g,' ').slice(0,200), b:[...d.querySelectorAll('button')].filter(y=>y.getBoundingClientRect().width>0).map(y=>(y.innerText||'').trim()).slice(0,8)}:null;
  });
  const cbox = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0 && x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null; const b=[...d.querySelectorAll('button')].find(x=>/^Leave$/i.test((x.innerText||'').trim()));
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)};
  });
  out.confirmBox = cbox;
  if (cbox) await page.mouse.click(cbox.x, cbox.y);
  await page.waitForTimeout(7000);
  out.urlAfter = page.url();
  out.stillInCall = /\/call\//.test(page.url());
  out.cur = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?{id:j.meeting.id,status:j.meeting.status}:j; });
  return out;
};
