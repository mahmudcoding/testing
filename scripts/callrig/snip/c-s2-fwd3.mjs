export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,44), body:(r.postData()||'').slice(0,140)}); };
  page.on('request', onReq);
  const cont=page.locator('[role="dialog"] button').filter({hasText:/^Continue$/}).first();
  out.contFound=await cont.count();
  if(!out.contFound) return out;
  await cont.click(); await page.waitForTimeout(2200);
  out.step2=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    if(!d) return 'dialog gone';
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,200),
      btns:[...d.querySelectorAll('button')].filter(vis)
        .map(b=>({l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,22), dis:b.disabled})).slice(0,10),
      editors:[...d.querySelectorAll('[contenteditable="true"]')].map(e=>e.getAttribute('aria-label'))};
  });
  const send=page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send)$/}).first();
  out.sendFound=await send.count();
  if(out.sendFound){ await send.click(); await page.waitForTimeout(4000); }
  page.off('request', onReq);
  out.dialogAfter=await page.evaluate(()=>!!document.querySelector('[role="dialog"]'));
  return out;
};
