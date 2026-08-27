export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  // build a fresh archived channel with one of my own messages
  const made=await page.evaluate(async (ws)=>{
    const name='qa-c2-aedit-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json(); const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
    await new Promise(r=>setTimeout(r,2500));
    const m=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:id, body:'QA-AEDIT original text'})});
    const mj=await m.json();
    await new Promise(r=>setTimeout(r,1500));
    await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});
    return {id, msg:mj.id||mj.message?.id};}, ws);
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}`);
  await page.waitForTimeout(12000);
  const out={};
  const msg=page.locator(`[data-message-id="${made.msg}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000}).catch(()=>{out.menuFail=true});
  await page.waitForTimeout(2500);
  out.menu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,18)).filter(Boolean):'NO-MENU';});
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,20));},true);});
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Edit$/}).first().click({timeout:6000}).catch(e=>{out.editErr=String(e.message).slice(0,40);});
  await page.waitForTimeout(4000);
  out.landed=await page.evaluate(()=>window.__c);
  out.afterEdit=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    return {composerPresent:!!c, composerText:c?(c.innerText||'').trim().slice(0,26):null,
      saveChangesBtn:!!document.querySelector('button[aria-label="Save changes"]'),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean).slice(0,2)};});
  return out;
};
