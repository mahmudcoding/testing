export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const det=page.locator('button[aria-label="Channel details"]');
  if(await det.count()){ await det.first().click(); await page.waitForTimeout(1400); }
  const about=page.locator('[role="tab"]').filter({hasText:'About'});
  if(await about.count()){ await about.first().click(); await page.waitForTimeout(1200); }
  const lv=page.locator('button').filter({hasText:'Leave channel'}).first();
  out.leaveFound=await lv.count();
  if(!out.leaveFound) return out;
  out.leaveDisabled=await lv.evaluate(e=>e.disabled);
  out.hint=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('*')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/admin|leave|owner/i.test(t)&&t.length<70);});
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET') reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,40)); };
  page.on('request', onReq);
  if(!out.leaveDisabled){ await lv.click(); await page.waitForTimeout(2500); }
  page.off('request', onReq);
  out.reqs=reqs;
  out.after=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)[0];
    return {dialog: d? (d.innerText||'').replace(/\s+/g,' ').slice(0,160):'none',
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(e=>e.textContent.trim().slice(0,60)),
      url:location.pathname};});
  await page.keyboard.press('Escape');
  out.stillMember=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    return r.status;}, ch);
  return out;
};
