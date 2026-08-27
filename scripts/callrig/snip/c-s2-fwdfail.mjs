export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const msg=page.locator('main [data-message-id]').last();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  try { await msg.locator('button[aria-label="Forward"]').first().click({timeout:6000}); out.open='ok'; }
  catch(e){ out.open='FAIL'; return out; }
  await page.waitForTimeout(3500);
  out.dialog=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    return d?{rows:[...new Set([...d.querySelectorAll('button,li,[role="option"]')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<32))].slice(0,10)}:'NO-DIALOG';});
  // pick the first channel target
  const target=page.locator('[role="dialog"] button').filter({hasText:'Saved Messages'}).first();
  out.targetFound=await target.count();
  if(out.targetFound) await target.click({timeout:6000}).catch(()=>{out.targetFail=true});
  await page.waitForTimeout(1800);
  await page.route('**/api/v1/messaging/**', r=>{
    const m=r.request().method();
    return (m==='POST'||m==='PUT'||m==='PATCH') ? r.abort('failed') : r.continue();});
  const seen=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&/messag/.test(u)&&r.method()!=='GET')
    seen.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  const cont=page.locator('[role="dialog"] button').filter({hasText:/^(Continue|Forward|Send)$/}).first();
  out.continueFound=await cont.count();
  if(out.continueFound) await cont.click({timeout:6000}).catch(()=>{out.contFail=true});
  await page.waitForTimeout(4000);
  // a second step may appear
  const send=page.locator('[role="dialog"] button').filter({hasText:/^(Send|Forward)$/}).first();
  if(await send.count()) await send.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  await page.unroute('**/api/v1/messaging/**');
  out.requests=seen.slice(0,4);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {dialogsOpen:[...document.querySelectorAll('[role="dialog"]')].filter(v).length,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,55)).filter(Boolean).slice(0,3)};});
  return out;
};
