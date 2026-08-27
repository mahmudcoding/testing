export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4OX0TTLIMVOUBH`);
  await page.waitForTimeout(8000);
  // create a throwaway channel and put one message in it
  const setup=await page.evaluate(async(ws)=>{
    const list=await (await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'})).json();
    const arr=Array.isArray(list)?list:(list.channels||list.items||[]);
    let ch=arr.find(c=>c.name==='qa-c2-arch2');
    if(!ch){
      const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({name:'qa-c2-arch2', workspace_id:ws, type:'public',
          description:'throwaway: archived-channel checks'})});
      if(!r.ok) return {err:(await r.text()).slice(0,140)};
      ch=await r.json();
    }
    const id=ch.id||ch.channel_id;
    const m=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:id, body:'QA-V2-ARCH target', idempotency_key:'qav-'+Math.random().toString(36).slice(2)})});
    const mj=await m.json();
    const a=await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});
    return {channel:id, msg:mj.id, archiveStatus:a.status};}, ws);
  out.setup=setup;
  if(setup.err||!setup.channel) return out;
  // ── #7: writes still land in an archived channel
  out.f7=await page.evaluate(async({ch,mid})=>{
    const j=async(p)=>{const r=await p; return {status:r.status, body:(await r.text()).slice(0,120)};};
    const send=await j(fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-V2-ARCH after', idempotency_key:'qax-'+Math.random().toString(36).slice(2)})}));
    const react=await j(fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/reactions`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🚀'})}));
    const pin=await j(fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})}));
    return {send, react, pin};},{ch:setup.channel, mid:setup.msg});
  out.f7.PASS = out.f7.send.status===403 && out.f7.react.status===200 && out.f7.pin.status===200;
  // ── #8: Edit in an archived channel does nothing
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${setup.channel}`);
  await page.waitForTimeout(9000);
  const el=page.locator(`main [data-message-id="${setup.msg}"]`);
  out.f8={messageRendered: await el.count()};
  if(out.f8.messageRendered){
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
    const more=el.locator('button[aria-label="More actions"]').first();
    out.f8.moreFound=await more.count();
    if(out.f8.moreFound){
      await more.click(); await page.waitForTimeout(1400);
      const ed=page.getByText(/^Edit$/).first();
      out.f8.editItemFound=await ed.count();
      if(out.f8.editItemFound){
        let reqs=0; const h=(r)=>{ if(/\/api\/v1/.test(r.url())) reqs++; };
        page.on('request',h);
        await ed.click();
        await page.waitForTimeout(4500);
        page.off('request',h);
        out.f8.requestsAfterClick=reqs;
        out.f8.after=await page.evaluate(()=>{
          const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
          const main=document.querySelector('main');
          const notice=[...main.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
            .map(e=>(e.textContent||'').trim()).find(t=>/editing/i.test(t))||null;
          return {editingNotice:notice,
            composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
            menusVisible:[...document.querySelectorAll('[role="menu"]')].filter(v).length,
            toasts:[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v).length};});
        out.f8.PASS = out.f8.after.editingNotice===null && out.f8.after.toasts===0;
      }
    }
  }
  return out;
};
