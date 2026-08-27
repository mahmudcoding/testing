export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', mid='M4OX0TTPGJCFW4G';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  out.pin=await page.evaluate(async(mid)=>{
    const r=await fetch(`/api/v1/messaging/messages/${mid}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({pin:true})});
    return {status:r.status, body:(await r.text()).slice(0,120)};}, mid);
  // fresh load so the pin is definitely in the initial state
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const vis=`(e)=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;}`;
  out.banner=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
    const m=document.querySelector('main');
    return [...m.querySelectorAll('button,a,[role="button"]')].filter(v)
      .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').slice(0,34),
        al:e.getAttribute('aria-label')})).filter(x=>/pin|View all/i.test(x.t+' '+(x.al||''))).slice(0,8);});
  // open the pinned list
  const va=page.locator('main button, main [role="button"]').filter({hasText:/View all/i}).first();
  out.hasViewAll=await va.count();
  if(out.hasViewAll){ await va.click(); await page.waitForTimeout(2500); }
  out.panelControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
    const d=[...document.querySelectorAll('[role="dialog"],aside,[data-testid*="pinned"]')]
      .filter(v).sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
    if(!d) return 'no panel';
    return {head:(d.innerText||'').replace(/\s+/g,' ').slice(0,90),
      controls:[...d.querySelectorAll('button,a,[role="button"],[data-message-id]')].filter(v)
        .map(e=>({tag:e.tagName, t:(e.innerText||'').replace(/\s+/g,' ').slice(0,30),
          al:e.getAttribute('aria-label'), mid:e.getAttribute('data-message-id')})).slice(0,14)};});
  // click the pinned entry itself
  const entry=page.locator(`[role="dialog"] [data-message-id="${mid}"], aside [data-message-id="${mid}"]`).first();
  out.entryFound=await entry.count();
  if(out.entryFound){ await entry.click(); }
  const marks=[];
  for(let i=0;i<20;i++){
    await page.waitForTimeout(1000);
    marks.push(await page.evaluate((mid)=>{
      const el=document.querySelector(`main [data-message-id="${mid}"]`);
      const loaded=document.querySelectorAll('main [data-message-id]').length;
      if(!el) return {loaded, present:false};
      const r=el.getBoundingClientRect();
      return {loaded, present:true, top:Math.round(r.top), inView:r.top>=-4&&r.bottom<=innerHeight+4};
    }, mid));
    const l=marks[marks.length-1];
    if(l.present&&l.inView&&i>=2) break;
  }
  const key=(s)=>JSON.stringify([s.loaded,s.present,s.inView]);
  const cc=[]; let prev=null; for(const m of marks){ if(key(m)!==prev){cc.push(m);prev=key(m);} }
  out.afterClick={changes:cc.slice(0,6), final:marks[marks.length-1], waited:marks.length};
  return out;
};
