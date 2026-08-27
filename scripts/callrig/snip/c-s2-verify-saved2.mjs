export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const menuOf=async(mid)=>{
    const el=page.locator(`main [data-message-id="${mid}"]`).first();
    if(!await el.count()) return {err:'not found'};
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const more=el.locator('button[aria-label="More actions"]').first();
    if(!await more.count()) return {err:'no More actions'};
    await more.click(); await page.waitForTimeout(1500);
    const menu=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean):[];});
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    return menu;
  };
  // carol posts her OWN message, then saves it
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const mine=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-V2-OWNSAVE', idempotency_key:'qos-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.reload(); await page.waitForTimeout(9000);
  out.channelMenuOwn=await menuOf(mine);
  const el=page.locator(`main [data-message-id="${mine}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  const save=el.locator('button[aria-label="Save"]').first();
  out.saveFound=await save.count();
  if(out.saveFound){ await save.click(); await page.waitForTimeout(3500); }
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(10000);
  const ids=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const own=[...els].reverse().find(e=>/QA-V2-OWNSAVE/.test(e.innerText||''));
    const note=[...els].reverse().find(e=>/QA-V2-NOTE/.test(e.innerText||''));
    return {ownCopy:own?own.getAttribute('data-message-id'):null,
      note:note?note.getAttribute('data-message-id'):null};});
  out.ids=ids;
  if(ids.ownCopy) out.savedCopyOfOwn=await menuOf(ids.ownCopy);
  if(ids.note) out.savedSelfNote=await menuOf(ids.note);
  const has=(m,x)=>Array.isArray(m)&&m.includes(x);
  out.PASS = has(out.savedCopyOfOwn,'Edit') && has(out.savedCopyOfOwn,'Reply')
             && !has(out.savedSelfNote,'Edit') && !has(out.savedSelfNote,'Reply');
  return out;
};
