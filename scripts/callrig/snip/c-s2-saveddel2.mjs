export default async ({page}) => {
  const tag='QA-SAVEDDEL-t4k';
  const out={};
  const row=page.locator('main [data-message-id]').filter({hasText:tag}).first();
  out.rowFound=await row.count();
  if(!out.rowFound) return out;
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button,a')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,24));},true);});
  const btn=row.locator('button[aria-label="Open source message"]').first();
  out.btnCount=await btn.count();
  if(!out.btnCount) return out;
  await btn.click({timeout:6000}).catch(()=>{out.clickFail=true});
  await page.waitForTimeout(7000);
  out.after=await page.evaluate((tag)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const main=document.querySelector('main');
    return {landed:window.__c, url:location.pathname+location.search.slice(0,34),
      mainTail:main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(-120):'NO-MAIN',
      tagVisible:(main?.innerText||'').includes(tag),
      tombstone:(main?.innerText||'').includes('was deleted'),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2)};}, tag);
  return out;
};
