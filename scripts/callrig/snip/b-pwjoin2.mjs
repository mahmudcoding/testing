export default async ({page}) => {
  const out={};
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Join$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return true; } return false;
  });
  await page.waitForTimeout(7000);
  out.after = await page.evaluate(async()=>{
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    return {
      url: location.href,
      inCallApi: j&&j.meeting? {id:j.meeting.id, pw:j.meeting.password_protected} : null,
      text: (document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,350),
      inputs: [...document.querySelectorAll('input')].filter(vis).map(i=>({t:i.type, ph:i.placeholder})).slice(0,6),
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,22)
    };
  });
  return out;
};
