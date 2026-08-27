export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  // find an archived channel I own with messages
  out.archived = await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}`,{credentials:'include'});
    const j=await r.json();
    const arr=j.channels||j.data||(Array.isArray(j)?j:[]);
    return Array.isArray(arr)? arr.map(c=>({id:c.id, name:c.name})) : [];
  }, ws);
  if(!out.archived.length) return out;
  // pick one with at least one message
  let target=null;
  for (const c of out.archived){
    const n=await page.evaluate(async(id)=>{
      const j=await (await fetch(`/api/v1/messaging/channels/${id}/messages?limit=5`,{credentials:'include'})).json();
      const ms=j.messages||j.data||j||[];
      return ms.length? ms[0].id : null;}, c.id);
    if(n){ target={...c, msg:n}; break; }
  }
  out.target=target;
  if(!target) return out;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${target.id}`);
  await page.waitForTimeout(7000);
  out.banner = await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/archiv/i.test(t)&&t.length<70);});
  const el=page.locator(`[data-message-id="${target.msg}"]`);
  out.msgRendered=await el.count();
  if(!out.msgRendered){
    const any=page.locator('main [data-message-id]').last();
    if(await any.count()) target.msg=await any.getAttribute('data-message-id');
  }
  const el2=page.locator(`[data-message-id="${target.msg}"]`).first();
  await el2.scrollIntoViewIfNeeded(); await el2.hover(); await page.waitForTimeout(600);
  out.inline = await el2.evaluate(e=>[...e.querySelectorAll('button')]
    .filter(b=>b.getBoundingClientRect().height>4).map(b=>b.getAttribute('aria-label')).filter(Boolean));
  const more=el2.locator('button[aria-label="More actions"]');
  if(await more.count()){ await more.first().click({force:true}); await page.waitForTimeout(800);
    out.menu=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
    await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  // BUG-11: does a reaction go through in an archived channel?
  const reqs=[];
  const onResp=async(r)=>{ if(r.url().includes('/reactions')) reqs.push({status:r.status()}); };
  page.on('response', onResp);
  await el2.hover(); await page.waitForTimeout(400);
  const add=el2.locator('button[aria-label="Add reaction"]');
  out.addReactionOffered=await add.count();
  if(out.addReactionOffered){ await add.first().click(); await page.waitForTimeout(1500);
    const pick=page.locator('[role="dialog"] button, [data-radix-popper-content-wrapper] button').nth(3);
    if(await pick.count()){ out.picked=await pick.getAttribute('aria-label'); await pick.click(); }
    await page.waitForTimeout(2500); }
  page.off('response', onResp);
  out.reactionResponses=reqs;
  out.chipsAfter=await el2.evaluate(e=>[...e.querySelectorAll('button')]
    .map(b=>b.getAttribute('aria-label')).filter(l=>l&&/react/i.test(l)).slice(0,4));
  return out;
};
