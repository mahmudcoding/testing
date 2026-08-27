export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OWNFC5WK5M1D6';
  const out={};
  const open=async()=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(5200);
    const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
    if(await det.count()){ await det.first().click(); await page.waitForTimeout(1300); }
    const about=page.locator('[role="tab"]').filter({hasText:'About'});
    if(await about.count()){ await about.first().click(); await page.waitForTimeout(1000); }
  };
  const submit=async(name, topic, tag)=>{
    await open();
    const inp=page.locator('input:visible').first();
    const ta=page.locator('textarea').first();
    await inp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
    await inp.fill(name); await page.waitForTimeout(300);
    await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
    if(topic) await ta.fill(topic);
    await page.waitForTimeout(400);
    const save=page.locator('button').filter({hasText:'Save'}).first();
    const dis=await save.evaluate(e=>e.disabled);
    if(dis) return {tag, saveDisabled:true};
    const resps=[];
    const onResp=async(r)=>{ if(r.url().includes('/api/v1/channels/')&&r.request().method()!=='GET'){
      let b=''; try{ b=(await r.text()).slice(0,140);}catch(e){}
      resps.push({status:r.status(), body:b}); } };
    page.on('response', onResp);
    await save.click(); await page.waitForTimeout(3200);
    page.off('response', onResp);
    const notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
      .map(e=>e.textContent.trim().slice(0,70)));
    const now=await page.evaluate(async(ch)=>{
      const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
      return {name:j.name, nameLen:(j.name||'').length, descLen:(j.description||'').length};
    }, ch);
    return {tag, sentNameLen:name.length, status:resps[0]&&resps[0].status,
      body:resps[0]&&resps[0].body, notices, now};
  };
  out.long = await submit('N'.repeat(300), '', 'name-300');
  out.restore = await submit('QA C2 Verify Rename', '', 'restore');
  return out;
};
