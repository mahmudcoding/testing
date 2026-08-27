export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(9000);
  const hdr = page.locator('main button, main [role="button"]').filter({hasText:'qa-private'}).first();
  let opened='no';
  try { await hdr.click({timeout:5000}); opened='ok'; }
  catch(e){ opened='FAIL '+String(e.message).split('\n')[0].slice(0,50); }
  await page.waitForTimeout(3500);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],aside,section')].filter(v)
      .sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width);
    const panel=d.find(e=>/member|about|setting|role/i.test(e.innerText||''));
    if(!panel) return {panel:false, dialogs:d.length,
      body:(document.body.innerText||'').replace(/\s+/g,' ').slice(-200)};
    const btns=[...panel.querySelectorAll('button,[role="tab"],a')].filter(v)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>t&&t.length<36);
    return {panel:true, text:(panel.innerText||'').replace(/\s+/g,' ').trim().slice(0,180),
            controls:[...new Set(btns)].slice(0,18)};
  });
};
