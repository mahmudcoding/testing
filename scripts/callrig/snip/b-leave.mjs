export default async ({page}) => {
  const out={};
  out.cur = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?{id:j.meeting.id,name:j.meeting.name}:null; });
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Leave call$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(2500);
  out.dlg = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).map(x=>({t:x.innerText.replace(/\s+/g,' ').slice(0,250), b:[...x.querySelectorAll('button')].map(y=>(y.innerText||'').trim()).filter(Boolean)})));
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-end-confirm-submit"]')||[...document.querySelectorAll('[role=dialog] button,[role=alertdialog] button')].find(x=>/^(Leave|Leave call|Confirm|End)/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(()=>({url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,300)}));
  return out;
};
