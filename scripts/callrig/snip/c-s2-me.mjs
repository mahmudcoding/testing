export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(400);
  out.cleared = await comp.evaluate(e=>e.innerText.trim());
  await comp.type('/me', {delay:70}); await page.waitForTimeout(1300);
  const o=page.locator('[role="option"]').first();
  out.opt = await o.count()? (await o.innerText()).replace(/\s+/g,' ').slice(0,34):'none';
  if(await o.count()) await o.click();
  await page.waitForTimeout(900);
  out.afterPick = await comp.evaluate(e=>e.innerText);
  await comp.type(' machet QA-S2-ME1', {delay:40}); await page.waitForTimeout(400);
  out.composerFull = await comp.evaluate(e=>e.innerText);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}')); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.post = posts.map(p=>({body:p.body, keys:Object.keys(p)}));
  out.rendered = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-ME1/.test(e.innerText||''));
    if(!el) return 'not found';
    return {text:(el.innerText||'').replace(/\s+/g,' ').slice(0,90),
      em:el.querySelectorAll('em,i').length, cls:String(el.className||'').slice(0,50)};
  });
  const ch=page.url().split('/c/')[1];
  out.stored = await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'})).json();
    return (j.messages||j.data||j||[]).filter(m=>/ME1/.test(m.body||''))
      .map(m=>({body:m.body, type:m.type, subtype:m.subtype, keys:Object.keys(m).filter(k=>/type|kind|action/i.test(k))}));
  }, ch);
  return out;
};
