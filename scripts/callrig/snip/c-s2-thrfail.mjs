export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-THRFAIL parent'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${seed}`);
  await page.waitForTimeout(12000);
  const out={parent:seed.slice(-5)};
  const boxes=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('div[contenteditable="true"]')].filter(v)
      .map((c,i)=>({i, label:c.getAttribute('aria-label')||'(none)',
        x:Math.round(c.getBoundingClientRect().left)}));});
  out.composers=boxes;
  // the thread composer is the right-most one
  const idx=boxes.length?boxes.reduce((a,b)=>b.x>a.x?b:a).i:null;
  if(idx===null) return out;
  const comp=page.locator('div[contenteditable="true"]').nth(idx);
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await comp.click();
  await page.keyboard.type('QA-THRFAIL reply text');
  await page.waitForTimeout(900);
  out.typed=await comp.evaluate(e=>e.innerText.trim().slice(0,26));
  await page.route('**/api/v1/messaging/**', r=>{
    const m=r.request().method();
    return (m==='POST'||m==='PUT'||m==='PATCH') ? r.abort('failed') : r.continue();});
  const seen=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    seen.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Send"]').last().click({timeout:6000}).catch(()=>{out.sendFail=true});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  await page.unroute('**/api/v1/messaging/**');
  out.requests=seen.slice(0,3);
  out.after=await comp.evaluate(e=>e.innerText.trim().slice(0,26));
  out.kept=out.after===out.typed;
  out.toasts=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
      .map(e=>(e.innerText||'').trim().slice(0,52)).filter(Boolean).slice(0,2);});
  return out;
};
