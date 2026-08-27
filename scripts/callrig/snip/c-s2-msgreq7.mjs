export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,50)); };
  page.on('request', onReq);
  const acc=page.locator('[role="dialog"] button').filter({hasText:/^Accept$/}).first();
  out.acceptFound=await acc.count();
  if(!out.acceptFound) return out;
  await acc.click(); await page.waitForTimeout(3500);
  page.off('request', onReq);
  out.afterAccept=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    return {dialogTxt: d? (d.innerText||'').replace(/\s+/g,' ').slice(0,140):'closed',
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(e=>e.textContent.trim().slice(0,50))};});
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  await page.reload(); await page.waitForTimeout(7000);
  out.sidebar=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return {dms:[...document.querySelectorAll('a[href*="/d/"]')].filter(vis)
        .map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,24)),
      reqCtl:[...document.querySelectorAll('button,a')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim())
        .filter(t=>/Message requests/i.test(t))};});
  return out;
};
