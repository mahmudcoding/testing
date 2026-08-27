export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.opened = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Notifications/.test(x.getAttribute('aria-label')||'')); if(b){b.click(); return b.getAttribute('aria-label');} return null; });
  await page.waitForTimeout(3000);
  out.panel = await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0;
    const panels=[...document.querySelectorAll('[role=dialog],[role=menu],aside,[data-testid*="notification"]')].filter(vis);
    const p=panels[panels.length-1];
    if(!p) return {none:true, body:document.body.innerText.replace(/\s+/g,' ').slice(0,300)};
    return { text:p.innerText.replace(/\n{2,}/g,'\n').slice(0,700),
      items:[...p.querySelectorAll('li,[role=listitem],a,button')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,12) };
  });
  out.api = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=6',{credentials:'include'})).json().catch(()=>null);
    const a=(j&&(j.notifications||j.items||j.data))||[];
    return a.slice(0,6).map(n=>({type:n.type, title:n.title, body:n.body||n.message||'', hasMeeting:!!(n.meeting_id||n.data&&n.data.meeting_id)}));
  });
  return out;
};
