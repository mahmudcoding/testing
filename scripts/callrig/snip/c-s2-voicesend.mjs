export default async ({page}) => {
  const out={};
  const stop=page.locator('button[aria-label="Stop recording"]');
  out.stopBtn=await stop.count();
  if(!out.stopBtn) return out;
  await stop.first().click(); await page.waitForTimeout(2000);
  out.afterStop=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20))
      .filter(l=>l&&/send|discard|play|delete|pause/i.test(l));});
  const posts=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}')); };
  page.on('request', onReq);
  const send=page.locator('button[aria-label="Send"]').first();
  if(await send.count() && !(await send.evaluate(e=>e.disabled))) await send.click();
  await page.waitForTimeout(9000);
  page.off('request', onReq);
  out.post=posts.map(p=>({keys:Object.keys(p), body:p.body}));
  const last=page.locator('main [data-message-id]').last();
  out.lastId=await last.getAttribute('data-message-id');
  out.lastShape=await last.evaluate(e=>({audio:e.querySelectorAll('audio').length,
    imgs:e.querySelectorAll('img').length,
    txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,60),
    btns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,8)}));
  return out;
};
