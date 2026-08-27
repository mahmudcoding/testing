export default async ({page}) => {
  const ws='W4QCF1XTURESO01', A='C4QCPRIVATE0001', B='C4QCGENERAL0001';
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-PREVIEW2 https://example.com/page'})});
    const j=await r.json(); return j.id||j.message?.id;}, A);
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`);
  await page.waitForTimeout(12000);
  const st=()=>page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    if(!e) return {node:false};
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {node:true, links:e.querySelectorAll('a').length,
      hasCard:/external link/i.test(e.innerText||''),
      dismissBtn:[...e.querySelectorAll('button')].filter(v)
        .some(b=>/dismiss/i.test(b.getAttribute('aria-label')||b.innerText||''))};}, seed);
  const out={initial:await st()};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,36));};
  page.on('request',onReq);
  await page.locator('button').filter({hasText:/^Dismiss preview$/}).first()
    .click({timeout:6000}).catch(async()=>{
      await page.locator('button[aria-label*="Dismiss"]').first().click({timeout:5000}).catch(()=>{});});
  await page.waitForTimeout(4000);
  page.off('request',onReq);
  out.afterDismiss={...(await st()), requests:reqs.slice(0,3),
    localStorageKeys:await page.evaluate(()=>Object.keys(localStorage).filter(k=>/preview|dismiss/i.test(k)))};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${B}`); await page.waitForTimeout(8000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`); await page.waitForTimeout(11000);
  out.afterReturn=await st();
  return out;
};
