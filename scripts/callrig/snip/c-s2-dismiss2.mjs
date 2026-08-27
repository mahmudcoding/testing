export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', other='C4QCGENERAL0001';
  const out={reqs:[]};
  const tag='QA-DISMISS2 https://example.com/qa';
  await page.evaluate(async ({ch,tag})=>{ await fetch('/api/v1/messaging/messages',{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch, body:tag})}); }, {ch,tag});
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const msg=page.locator('[data-message-id]').filter({hasText:'QA-DISMISS2'}).last();
  const state=async()=>await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    const els=[...document.querySelectorAll('main [data-message-id]')]
      .filter(e=>/QA-DISMISS2/.test(e.innerText||''));
    const m=els[els.length-1]; if(!m) return {found:false};
    return {found:true, links:[...m.querySelectorAll('a')].filter(v).length,
      hasCard:/example\.com|Example Domain/i.test(m.innerText||'')
        && [...m.querySelectorAll('a')].filter(v).length>1};});
  out.before=await state();
  page.on('request', r=>{ if(/\/api\/v1\//.test(r.url())&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,60)); });
  await msg.hover(); await page.waitForTimeout(1500);
  const d=msg.locator('button[aria-label="Dismiss preview"]').first();
  out.btn=await d.count();
  if(out.btn){ await d.click(); await page.waitForTimeout(2500); out.afterDismiss=await state(); }
  out.storage=await page.evaluate(()=>Object.keys(localStorage).filter(k=>/preview|dismiss/i.test(k)));
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${other}`); await page.waitForTimeout(6000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(9000);
  out.afterReturn=await state();
  return out;
};
