export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const dm=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const a=[...document.querySelectorAll('a[href*="/d/"]')].filter(v)
      .find(x=>/QA Carol/i.test(x.getAttribute('aria-label')||x.innerText||''));
    return a?(a.getAttribute('href')||'').split('/d/')[1]:null;});
  if(!dm){
    await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
    await page.waitForTimeout(10000);
  }
  const dm2=dm||await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const a=[...document.querySelectorAll('a[href*="/d/"]')].filter(v)
      .find(x=>/QA Carol/i.test(x.getAttribute('aria-label')||x.innerText||''));
    return a?(a.getAttribute('href')||'').split('/d/')[1]:null;});
  const out={dmId:dm2};
  if(!dm2) return out;
  out.block=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({user_id:'U4QCCAROL000001'})});
    return r.status;});
  return out;
};
