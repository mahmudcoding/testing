export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.keyboard.press('Escape').catch(()=>{});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(10000);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,24));},true);});
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  let click='no';
  try { await page.locator('button[aria-label="Add users"]').first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,44); }
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  return page.evaluate(({click,reqs})=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v);
    return {click, landedOn:window.__c, apiCalls:reqs.slice(0,6),
      dialogs:d.length,
      dialogText:d[0]?(d[0].innerText||'').replace(/\s+/g,' ').trim().slice(0,180):null};
  },{click,reqs});
};
