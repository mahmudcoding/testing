export default async ({page}) => {
  const out={posts:[]};
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST')
    out.posts.push((r.postData()||'').slice(0,200)); };
  page.on('request', onReq);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(400);
  await comp.type('/shrug', {delay:70}); await page.waitForTimeout(1200);
  const opt=page.locator('[role="option"]').first();
  if(await opt.count()) await opt.click();
  await page.waitForTimeout(900);
  out.composer = await comp.evaluate(e=>e.innerText);
  await comp.type(' QA-S2-SHRUG2', {delay:35}); await page.waitForTimeout(400);
  out.composerFull = await comp.evaluate(e=>e.innerText);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.rendered = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-SHRUG2/.test(e.innerText||''));
    if(!el) return 'not found';
    const body=[...el.querySelectorAll('*')].filter(e=>/QA-S2-SHRUG2/.test(e.textContent||''))
      .slice(-1)[0];
    return {text:(el.innerText||'').replace(/\s+/g,' ').slice(0,80),
      html: body? body.innerHTML.slice(0,160):null,
      em: el.querySelectorAll('em,i').length, strong: el.querySelectorAll('strong,b').length};
  });
  const ch=page.url().split('/c/')[1];
  out.stored = await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'})).json();
    return (j.messages||j.data||j||[]).map(m=>m.body).filter(b=>/SHRUG2/.test(b||''));
  }, ch);
  return out;
};
