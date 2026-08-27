export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={reqs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  const mb=page.locator('button').filter({hasText:/members/i}).first();
  out.membersBtn=await mb.count();
  if(!out.membersBtn) return out;
  await mb.click(); await page.waitForTimeout(2500);
  out.modalControls=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40);
    if(!d) return 'no dialog';
    return {btns:[...d.querySelectorAll('button')].filter(vis)
      .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,22)).slice(0,14),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>i.getAttribute('placeholder'))};});
  const add=page.locator('[role="dialog"] button').filter({hasText:/Add|Invite|Добав/i}).first();
  out.addBtn=await add.count();
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,44)+' '+(r.postData()||'').slice(0,60)); };
  page.on('request', onReq);
  if(out.addBtn){
    await add.click(); await page.waitForTimeout(2200);
    out.afterAdd=await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40);
      return d? {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,180),
        inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>i.getAttribute('placeholder'))}:'gone';});
    const si=page.locator('[role="dialog"] input:visible').first();
    if(await si.count()){ await si.fill('carol'); await page.waitForTimeout(2000);
      out.searchResults=await page.evaluate(()=>{
        const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
        const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40);
        return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,200):'gone';});
      const row=page.locator('[role="dialog"]').getByText('QA Carol', {exact:false}).first();
      if(await row.count()){ await row.click(); await page.waitForTimeout(1200); }
      const conf=page.locator('[role="dialog"] button').filter({hasText:/^(Add|Invite|Done|Save)/}).last();
      if(await conf.count() && !(await conf.evaluate(e=>e.disabled))){ await conf.click(); await page.waitForTimeout(3000); }
    }
  }
  page.off('request', onReq);
  await page.keyboard.press('Escape');
  return out;
};
