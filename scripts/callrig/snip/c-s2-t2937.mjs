export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', carol='U4QCCAROL000001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  const openCarol=async()=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`);
    await page.waitForTimeout(5000);
    const ok=await page.evaluate(()=>{
      let best=null;
      for(const el of document.querySelectorAll('main *')){
        const t=el.innerText||''; if(!t.includes('QA Carol')) continue;
        const b=[...el.querySelectorAll('button')].find(x=>/Open QA Carol/.test(x.getAttribute('aria-label')||''));
        if(!b) continue;
        const a=el.getBoundingClientRect().width*el.getBoundingClientRect().height;
        if(!best||a<best.a) best={el,a};}
      if(!best) return false;
      [...best.el.querySelectorAll('button')].find(x=>/Open QA Carol/.test(x.getAttribute('aria-label')||''))
        .setAttribute('data-qa-prof','1'); return true;});
    if(!ok) return 'row not found';
    await page.locator('[data-qa-prof="1"]').click();
    await page.waitForTimeout(3000);
    return page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
      const t=d?(d.innerText||'').replace(/\s+/g,' '):'';
      const i=t.indexOf('SHARED CHANNELS');
      return i>=0? t.slice(i, i+90):(t.slice(0,90)||'no dialog');});
  };
  out.beforeAdd=await openCarol();
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  out.add=await page.evaluate(async({ch,carol})=>{
    const r=await fetch('/api/v1/channels/members/add',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,user_id:carol})});
    return r.status;}, {ch,carol});
  await page.waitForTimeout(3000);
  out.afterAddNoReload=await openCarol();
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  out.remove=await page.evaluate(async({ch,carol})=>{
    const r=await fetch('/api/v1/channels/members/remove',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,user_id:carol})});
    return r.status;}, {ch,carol});
  await page.waitForTimeout(3000);
  out.afterRemoveNoReload=await openCarol();
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await page.reload(); await page.waitForTimeout(6000);
  out.afterRemoveReload=await openCarol();
  await page.keyboard.press('Escape');
  return out;
};
