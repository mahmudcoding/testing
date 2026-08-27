export default async ({page}) => {
  return await page.evaluate(async () => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width>2 && r.height>2 && s.visibility!=='hidden' && s.display!=='none' && Number(s.opacity)>0.01; };
    const overlays = [...document.querySelectorAll('body *')].filter(e=>{
      const s = getComputedStyle(e);
      return (s.position==='fixed'||s.position==='absolute') && vis(e) && Number(s.zIndex||0) > 5 && (e.innerText||'').trim().length>0;
    }).map(e=>({tag:e.tagName, tid:e.getAttribute('data-testid'), z:getComputedStyle(e).zIndex, t:(e.innerText||'').replace(/\n+/g,' | ').slice(0,110)}));
    let cur=null; try{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); cur = j.meeting? {id:j.meeting.id,status:j.meeting.status,name:j.meeting.name}:j; }catch(e){}
    return {url: location.href, vis: document.visibilityState, overlays: overlays.slice(0,8), overlayCount: overlays.length, current: cur,
            body: document.body.innerText.replace(/\n+/g,' | ').slice(0,900)};
  });
};
