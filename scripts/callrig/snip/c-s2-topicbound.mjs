export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={runs:[]};
  const open=async()=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(5200);
    const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
    if(await det.count()){ await det.first().click(); await page.waitForTimeout(1300); }
    const about=page.locator('[role="tab"]').filter({hasText:'About'});
    if(await about.count()){ await about.first().click(); await page.waitForTimeout(1000); }
  };
  const attempt=async(n)=>{
    await open();
    const ta=page.locator('textarea').first();
    await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(250);
    await ta.fill('T'.repeat(n)); await page.waitForTimeout(400);
    const resps=[];
    const onResp=async(r)=>{ if(r.url().includes('/api/v1/channels/')&&r.request().method()!=='GET'){
      let b=''; try{ b=(await r.text()).slice(0,120);}catch(e){}
      resps.push({status:r.status(), body:b}); } };
    page.on('response', onResp);
    await page.locator('button').filter({hasText:'Save'}).first().click();
    await page.waitForTimeout(2800);
    page.off('response', onResp);
    const notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
      .map(e=>e.textContent.trim().slice(0,70)));
    const stored=await page.evaluate(async(ch)=>{
      const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
      return (j.description||'').length;
    }, ch);
    return {n, status:resps[0]&&resps[0].status, body:resps[0]&&resps[0].body, notices, storedLen:stored};
  };
  out.runs.push(await attempt(256));
  out.runs.push(await attempt(257));
  // hints near the textarea?
  await open();
  out.panelHints = await page.evaluate(()=>{
    const ta=document.querySelector('textarea'); if(!ta) return 'none';
    const p=ta.closest('div').parentElement;
    return {near:(p?p.innerText:'').replace(/\s+/g,' ').slice(0,140),
      attrs:{maxlength:ta.getAttribute('maxlength'), aria:ta.getAttribute('aria-describedby')}};
  });
  // restore empty
  const ta=page.locator('textarea').first();
  await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(300);
  await page.locator('button').filter({hasText:'Save'}).first().click(); await page.waitForTimeout(2200);
  out.finalStored = await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return {len:(j.description||'').length, name:j.name};
  }, ch);
  return out;
};
