export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  const menuOf=async(id)=>{
    const el=page.locator(`[data-message-id="${id}"]`);
    if(!await el.count()) return 'absent';
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
    const more=el.locator('button[aria-label="More actions"]');
    if(!await more.count()) return 'no more button';
    await more.first().click({force:true}); await page.waitForTimeout(800);
    const m=await page.evaluate(()=>{const x=document.querySelector('[role="menu"]');
      return x? (x.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    return m;
  };
  // 1. fresh note in Saved
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(6500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  const noteId=await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:'C4QCSAVED000003', body:'QA-S2-NOTE2', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;});
  out.noteId=noteId;
  await page.reload(); await page.waitForTimeout(6500);
  out.noteMenu=await menuOf(noteId);
  // 2. control in the same list: a saved copy
  const copyId=await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].find(e=>/View original/.test(e.innerText||''));
    return el? el.getAttribute('data-message-id'):null;});
  out.copyId=copyId;
  out.copyMenu=copyId? await menuOf(copyId):'none';
  // 3. control in a regular channel: own message
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  const chanId=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-CHANCTRL', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.waitForTimeout(2500);
  out.chanId=chanId;
  out.chanMenu=await menuOf(chanId);
  // authors, from the API
  out.authors=await page.evaluate(async({noteId,copyId,chanId,ch})=>{
    const me=(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).id;
    const g=async(c,id)=>{ const j=await (await fetch(`/api/v1/messaging/channels/${c}/messages?limit=30`,{credentials:'include'})).json();
      const m=(j.messages||j.data||j||[]).find(x=>x.id===id); return m? m.user_id:null; };
    return {me, note:await g('C4QCSAVED000003',noteId), copy:await g('C4QCSAVED000003',copyId), chan:await g(ch,chanId)};
  }, {noteId,copyId,chanId,ch});
  return out;
};
