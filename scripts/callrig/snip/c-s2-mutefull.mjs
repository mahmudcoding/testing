export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,150));
  const out={before:await ls()};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,46));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Mute notifications"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Until turned off$/}).first().click({timeout:6000}).catch(()=>{out.pickFail=true});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.requestsOnMute=reqs.slice(0,4);
  out.afterMute=await ls();
  out.buttonAfterMute=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b?b.getAttribute('aria-label'):'gone';});
  // restore in the same run
  await page.locator('button[aria-label*="ute"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const items=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24)).filter(Boolean):[];});
  out.unmuteMenu=items;
  const un=page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/unmute|Turn off mute|Unmute/i}).first();
  if(await un.count()) await un.click({timeout:5000}).catch(()=>{});
  await page.waitForTimeout(3500);
  out.afterRestore=await ls();
  return out;
};
