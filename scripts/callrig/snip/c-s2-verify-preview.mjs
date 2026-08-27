export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', other='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-V2-LINK https://example.com/', idempotency_key:'qpv-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.reload(); await page.waitForTimeout(11000);
  const state=()=>page.evaluate((id)=>{
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    if(!e) return {absent:true};
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {links:[...e.querySelectorAll('a')].filter(v).length,
      hasCard:/External link|example\.com/i.test(e.innerText||'')
        && [...e.querySelectorAll('a,button')].filter(v).length>1,
      text:(e.innerText||'').replace(/\s+/g,' ').slice(-46),
      lsKeys:Object.keys(localStorage).filter(k=>/preview|dismiss/i.test(k))};}, id);
  out.initial=await state();
  const el=page.locator(`main [data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  const dis=el.locator('button[aria-label="Dismiss preview"]').first();
  out.dismissFound=await dis.count();
  if(!out.dismissFound){
    out.hoverButtons=await el.evaluate(e=>{
      const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...e.querySelectorAll('button')].filter(v).map(b=>b.getAttribute('aria-label')).filter(Boolean);});
    return out;
  }
  let reqs=[];
  const h=(r)=>{ if(/\/api\/v1/.test(r.url()) && r.method()!=='GET') reqs.push(r.method()+' '+r.url().slice(-40)); };
  page.on('request',h);
  await dis.click(); await page.waitForTimeout(3000);
  page.off('request',h);
  out.afterDismiss={...await state(), nonGetRequests:reqs};
  // leave and come back
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${other}`); await page.waitForTimeout(6000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(9000);
  out.afterRoundTrip=await state();
  out.PASS = out.initial.links>out.afterDismiss.links && out.afterRoundTrip.links===out.initial.links
             && out.afterDismiss.nonGetRequests.length===0;
  return out;
};
