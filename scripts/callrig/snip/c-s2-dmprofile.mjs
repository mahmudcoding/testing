export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(11000);
  const dlgCount=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v);
    return {n:d.length, text:d[0]?(d[0].innerText||'').replace(/\s+/g,' ').trim().slice(0,170):null,
      buttons:d[0]?[...new Set([...d[0].querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,24)))]:null};});
  const out={before:await dlgCount()};
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,20));},true);});
  await page.locator('button[aria-label="Profile"]').first().click({timeout:6000}).catch(e=>{out.profileClick='FAIL';});
  await page.waitForTimeout(4000);
  out.afterProfile=await dlgCount();
  out.landed=await page.evaluate(()=>window.__c);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(2000);
  // Add users in a DM
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.locator('button').filter({hasText:/^Add users$/}).first().click({timeout:6000}).catch(()=>{out.addClick='FAIL';});
  await page.waitForTimeout(4500);
  page.off('request',onReq);
  out.afterAddUsers=await dlgCount();
  out.addRequests=reqs.slice(0,4);
  return out;
};
