export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  const mk=async(body)=>page.evaluate(async({ch,body})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body, idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, {ch,body});
  const watch=async(id, secs=5)=>{
    const s=[];
    for(let i=0;i<secs*2;i++){ await page.waitForTimeout(500);
      s.push(await page.evaluate((id)=>{
        const e=document.querySelector(`[data-message-id="${id}"]`);
        const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
        return {present:!!e, txt:e?(e.innerText||'').replace(/\s+/g,' ').slice(-34):null,
          notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
            .map(x=>x.textContent.trim().slice(0,50))};}, id));
    }
    return {first:s[0], last:s.at(-1), everAbsent:s.some(x=>!x.present),
      notices:[...new Set(s.flatMap(x=>x.notices))]};
  };
  const server=async(id)=>page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=12`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {body:(m.body||'').slice(0,30), pinned:m.pinned??null}:'absent from server';
  }, {ch,id});

  // --- EDIT under failure
  const editId=await mk('QA-S2-FAILEDIT original');
  await page.waitForTimeout(2500);
  await page.route('**/messaging/channels/*/messages/*', r=>r.request().method()==='PATCH'? r.abort('failed'):r.continue());
  const el=page.locator(`[data-message-id="${editId}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(400);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(700);
  const ed=page.locator('[role="menu"]').getByText('Edit',{exact:true}).first();
  if(await ed.count()){ await ed.click(); await page.waitForTimeout(1500);
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(300);
    await comp.type('QA-S2-FAILEDIT rewritten', {delay:30}); await page.waitForTimeout(300);
    const save=page.locator('button[aria-label="Save changes"]').first();
    if(await save.count()) await save.click(); else await page.keyboard.press('Meta+Enter');
  }
  out.edit=await watch(editId,5);
  out.editServer=await server(editId);
  await page.unroute('**/messaging/channels/*/messages/*');
  const cancel=page.locator('button[aria-label="Cancel editing"]').first();
  if(await cancel.count()) await cancel.click();
  await page.waitForTimeout(800);

  // --- DELETE under failure
  const delId=await mk('QA-S2-FAILDELETE target');
  await page.waitForTimeout(2500);
  await page.route('**/messaging/channels/*/messages', r=>r.request().method()==='DELETE'? r.abort('failed'):r.continue());
  const el2=page.locator(`[data-message-id="${delId}"]`);
  await el2.scrollIntoViewIfNeeded(); await el2.hover(); await page.waitForTimeout(400);
  await el2.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(700);
  const dl=page.locator('[role="menu"]').getByText('Delete',{exact:true}).first();
  out.deleteOffered=await dl.count();
  if(out.deleteOffered){ await dl.click(); await page.waitForTimeout(1200);
    const conf=page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/^Delete$/}).first();
    if(await conf.count()) await conf.click(); }
  out.del=await watch(delId,6);
  out.delServer=await server(delId);
  await page.unroute('**/messaging/channels/*/messages');
  await page.reload(); await page.waitForTimeout(6000);
  out.delAfterReload=await page.evaluate((id)=>!!document.querySelector(`[data-message-id="${id}"]`), delId);
  return out;
};
