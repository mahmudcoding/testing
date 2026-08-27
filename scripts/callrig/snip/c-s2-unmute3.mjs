export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={reqs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.method()!=='GET')
      out.reqs.push(r.method()+' '+u.replace(/^https?:\/\/[^/]+\/api\/v1/,'').slice(0,60)); });
  const mute=page.locator('button[aria-label="Mute notifications"]').first();
  out.muteFound=await mute.count();
  if(out.muteFound){
    await mute.click(); await page.waitForTimeout(1600);
    const opt=page.locator('[role="menuitem"],[role="dialog"] button').filter({hasText:/For 1 hour/i}).first();
    out.optFound=await opt.count();
    if(out.optFound){ await opt.click(); await page.waitForTimeout(4000); }
  }
  out.afterMute=[...out.reqs];
  const un=page.locator('button[aria-label="Unmute notifications"]').first();
  out.unmuteFound=await un.count();
  if(out.unmuteFound){
    out.unmuteAria=await un.evaluate(e=>e.getAttribute('aria-pressed'));
    await un.evaluate(e=>{ window.__c=0; e.addEventListener('click',()=>{window.__c++;},{capture:true}); });
    out.reqs.length=0;
    await un.click(); await page.waitForTimeout(5000);
    out.clickLanded=await page.evaluate(()=>window.__c||0);
    out.afterUnmute=[...out.reqs];
    out.labelNow=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
      return [...document.querySelectorAll('button')].filter(v)
        .map(e=>(e.getAttribute('aria-label')||'').trim())
        .filter(t=>/mute/i.test(t)).slice(0,3);});
  }
  return out;
};
