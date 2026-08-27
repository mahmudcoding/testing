export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  // --- BUG-21: Dismiss preview does not persist
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  await comp.type('QA-S2-V21 https://example.net', {delay:30}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(6000);
  const st=()=>page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-V21/.test(x.innerText||''));
    return e? {links:[...e.querySelectorAll('a')].length, card:/External link/.test(e.innerText||'')}:'absent';});
  out.v21_initial=await st();
  const msg=page.locator('main [data-message-id]').filter({hasText:'QA-S2-V21'}).last();
  await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(600);
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET') reqs.push(r.method()); };
  page.on('request', onReq);
  const d=msg.locator('button[aria-label="Dismiss preview"]');
  out.v21_btn=await d.count();
  if(out.v21_btn){ await d.first().click({force:true}); await page.waitForTimeout(2200); }
  page.off('request', onReq);
  out.v21_reqs=reqs;
  out.v21_afterDismiss=await st();
  await page.reload(); await page.waitForTimeout(7000);
  out.v21_afterReload=await st();

  // --- BUG-23: a note in Saved Messages has no Edit / Reply
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(7000);
  const noteId=await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:'C4QCSAVED000003', body:'QA-S2-V23NOTE', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;});
  await page.reload(); await page.waitForTimeout(7000);
  const menuOf=async(id)=>{
    const e=page.locator(`[data-message-id="${id}"]`).first();
    if(!await e.count()) return 'absent';
    await e.scrollIntoViewIfNeeded(); await e.hover(); await page.waitForTimeout(600);
    await e.locator('button[aria-label="More actions"]').first().click({force:true});
    await page.waitForTimeout(900);
    const m=await page.evaluate(()=>{const x=document.querySelector('[role="menu"]');
      return x? (x.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    return m;};
  out.v23_noteMenu=await menuOf(noteId);
  const copyId=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].find(x=>/View original/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  out.v23_copyMenu=copyId? await menuOf(copyId):'no saved copy';
  return out;
};
