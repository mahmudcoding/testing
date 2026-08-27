export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  // send a target message we will try to edit
  const targetId=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-ESCTARGET original', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.targetId=targetId;
  await page.waitForTimeout(2500);
  const el=page.locator(`[data-message-id="${targetId}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(700);
  const ed=page.locator('[role="menu"]').getByText('Edit',{exact:true}).first();
  out.editItem=await ed.count();
  if(!out.editItem) return out;
  await ed.click(); await page.waitForTimeout(1800);
  const snap=()=>page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>6&&r.height>6;};
    return {composer:c?c.innerText.slice(0,50):null,
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(x=>x.textContent.trim().slice(0,40)),
      nearComposerBtns:[...document.querySelectorAll('form button, footer button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,18)).slice(0,12)};
  });
  out.inEdit=await snap();
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  out.afterEscape=await snap();
  // now clear and type something new, then Enter
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(400);
  await comp.type('QA-S2-ESCNEW brand new message', {delay:35}); await page.waitForTimeout(400);
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/messaging/')&&r.method()!=='GET')
    reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,60), body:(r.postData()||'').slice(0,90)}); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.reqs=reqs;
  out.targetNow=await page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {body:m.body, edited:m.edited_at||m.is_edited||null}:'gone';
  }, {ch,id:targetId});
  return out;
};
