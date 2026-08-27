export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(7000);
  out.me=await page.evaluate(async()=>(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).id);
  out.rows = await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')]
    .map((e,i)=>({i, id:e.getAttribute('data-message-id'), txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,50)})));
  out.api = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QCSAVED000003/messages?limit=20',{credentials:'include'})).json();
    return (j.messages||j.data||j||[]).map(m=>({id:m.id, user:m.user_id, body:(m.body||'').slice(0,30),
      fwd: !!(m.forwarded_from||m.forward_of||m.original_message_id),
      keys:Object.keys(m).filter(k=>/forward|original|source/i.test(k))}));
  });
  const menuOf=async(id)=>{
    const el=page.locator(`[data-message-id="${id}"]`);
    if(!await el.count()) return 'absent';
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
    const more=el.locator('button[aria-label="More actions"]');
    if(!await more.count()) return 'no more button';
    await more.first().click({force:true}); await page.waitForTimeout(700);
    const m=await page.evaluate(()=>{const x=document.querySelector('[role="menu"]');
      return x? (x.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    return m;
  };
  out.menus={};
  for (const r of out.rows) out.menus[r.txt.slice(0,26)] = await menuOf(r.id);
  return out;
};
