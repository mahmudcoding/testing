export default async ({page}) => {
  return await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    const btn=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='Schedule meeting');
    return { url:location.href, cur: j&&j.meeting?{id:j.meeting.id,name:j.meeting.name,status:j.meeting.status}:j,
      schedBtn: btn? {w:Math.round(btn.getBoundingClientRect().width), inert: !!btn.closest('[inert]'), ariaHidden: !!btn.closest('[aria-hidden="true"]')} : null,
      minimize: !!document.querySelector('[data-testid="call-surface-minimize"]'),
      dlgs:[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).map(x=>(x.getAttribute('data-testid')||x.innerText.slice(0,40).replace(/\s+/g,' '))) };
  });
};
