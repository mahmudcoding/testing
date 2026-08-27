export default async ({page}) => {
  const ws='W4QCF1XTURESO01', src='C4QCPRIVATE0001';
  const out={reqs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${src}`);
  await page.waitForTimeout(7000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-FWDATT source'}).last();
  out.found=await el.count();
  if(!out.found) return out;
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,44), body:(r.postData()||'').slice(0,120)}); };
  page.on('request', onReq);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2200);
  out.dialogBtns=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    if(!d) return 'no dialog';
    return [...d.querySelectorAll('button')].filter(vis)
      .map(b=>({l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,24),
        dis:b.disabled, y:Math.round(b.getBoundingClientRect().y)})).slice(0,18);
  });
  // click the destination row precisely
  const rowClicked=await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    if(!d) return null;
    const cand=[...d.querySelectorAll('button,[role="option"],li')]
      .filter(e=>/qa-general/.test((e.textContent||'')) && e.getBoundingClientRect().height>10);
    if(!cand.length) return 'none';
    cand[cand.length-1].setAttribute('data-qa-dest','1');
    return (cand[cand.length-1].textContent||'').trim().slice(0,26);
  });
  out.rowClicked=rowClicked;
  if(rowClicked && rowClicked!=='none'){ await page.locator('[data-qa-dest="1"]').click(); await page.waitForTimeout(1500); }
  out.afterSelect=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    if(!d) return 'dialog gone';
    return {btns:[...d.querySelectorAll('button')].filter(vis)
      .map(b=>({l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,24), dis:b.disabled}))
      .filter(b=>!/^#|Saved|qa-|QA /.test(b.l)).slice(0,8)};
  });
  const go=page.locator('[role="dialog"] button').filter({hasText:/Forward|Send/}).first();
  out.goCount=await go.count();
  if(out.goCount){ out.goDisabled=await go.evaluate(e=>e.disabled); if(!out.goDisabled){ await go.click(); await page.waitForTimeout(3500);} }
  page.off('request', onReq);
  return out;
};
