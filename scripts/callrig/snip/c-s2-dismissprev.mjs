export default async ({page}) => {
  const out={reqs:[]};
  const msg=page.locator('main [data-message-id]').filter({hasText:'QA-S2-LINK1'}).last();
  out.found=await msg.count();
  if(!out.found) return out;
  out.id=await msg.getAttribute('data-message-id');
  await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(600);
  out.before = await msg.evaluate(e=>({
    previewLinks:[...e.querySelectorAll('a')].length,
    hasExternal:/External link/.test(e.innerText||''),
    btns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,8)}));
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,55)+' '+(r.postData()||'').slice(0,60)); };
  page.on('request', onReq);
  const d=msg.locator('button[aria-label="Dismiss preview"]');
  out.dismissCount=await d.count();
  if(out.dismissCount){ await d.first().click({force:true}); await page.waitForTimeout(2200); }
  page.off('request', onReq);
  out.afterDismiss = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-LINK1/.test(e.innerText||''));
    return el? {links:[...el.querySelectorAll('a')].length, hasExternal:/External link/.test(el.innerText||''),
      txt:(el.innerText||'').replace(/\s+/g,' ').slice(0,80)}:'gone';
  });
  const ls=await page.evaluate(()=>Object.keys(localStorage).filter(k=>/preview|unfurl|link/i.test(k))
    .map(k=>k+' = '+String(localStorage.getItem(k)).slice(0,80)));
  out.ls=ls;
  await page.reload(); await page.waitForTimeout(6000);
  out.afterReload = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-LINK1/.test(e.innerText||''));
    return el? {links:[...el.querySelectorAll('a')].length, hasExternal:/External link/.test(el.innerText||'')}:'gone';
  });
  return out;
};
