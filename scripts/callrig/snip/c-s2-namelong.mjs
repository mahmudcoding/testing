export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OWNFC5WK5M1D6';   // throwaway channel from this session
  const out={runs:[]};
  const open=async()=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(5200);
    const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
    if(await det.count()){ await det.first().click(); await page.waitForTimeout(1300); }
    const about=page.locator('[role="tab"]').filter({hasText:'About'});
    if(await about.count()){ await about.first().click(); await page.waitForTimeout(1000); }
  };
  const setName=async(name, tag)=>{
    await open();
    const inp=page.locator('input').filter({hasNot:page.locator('x')}).first();
    const visInp=page.locator('input:visible').first();
    await visInp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
    await visInp.fill(name); await page.waitForTimeout(400);
    out.inputMaxlength = await visInp.evaluate(e=>e.getAttribute('maxlength'));
    out.inputValueLen = await visInp.evaluate(e=>e.value.length);
    const resps=[];
    const onResp=async(r)=>{ if(r.url().includes('/api/v1/channels/')&&r.request().method()!=='GET'){
      let b=''; try{ b=(await r.text()).slice(0,130);}catch(e){}
      resps.push({status:r.status(), body:b}); } };
    page.on('response', onResp);
    await page.locator('button').filter({hasText:'Save'}).first().click();
    await page.waitForTimeout(3000);
    page.off('response', onResp);
    const notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
      .map(e=>e.textContent.trim().slice(0,70)));
    const now=await page.evaluate(async(ch)=>{
      const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
      return {name:j.name, len:(j.name||'').length};
    }, ch);
    return {tag, sentLen:name.length, status:resps[0]&&resps[0].status,
      body:resps[0]&&resps[0].body, notices, now};
  };
  out.runs.push(await setName('N'.repeat(300),'name-300'));
  out.runs.push(await setName('QA C2 Verify Rename','restore'));
  return out;
};
