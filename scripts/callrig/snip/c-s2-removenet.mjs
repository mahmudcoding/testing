export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const reqs=[];
  const onReq=(r)=>{ const u=r.url(); if(u.includes('/api/v1/')) reqs.push({m:r.method(),u:u.split('/api/v1')[1].slice(0,60)}); };
  const onRes=async(r)=>{ const u=r.url(); if(u.includes('/api/v1/')&&/member|remove/i.test(u)){
      let b=''; try{ b=(await r.text()).slice(0,160);}catch{}
      reqs.push({RESP:r.status(), u:u.split('/api/v1')[1].slice(0,60), body:b}); } };
  page.on('request',onReq); page.on('response',onRes);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Members/}).first().click({timeout:6000});
  await page.waitForTimeout(4000);
  reqs.length=0;                                  // only what the Remove click causes
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,26));},true);});
  await page.locator('button[aria-label="Remove QA Bob"]').first().click({timeout:6000});
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>({landed:window.__c,
    dialogs:document.querySelectorAll('[role="dialog"],[role="alertdialog"]').length,
    toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;})
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean)}));
  page.off('request',onReq); page.off('response',onRes);
  return {requestsAfterClick:reqs.slice(0,8), ...after};
};
