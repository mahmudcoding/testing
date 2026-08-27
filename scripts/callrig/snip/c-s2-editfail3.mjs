export default async ({page}) => {
  const out={};
  out.boxes=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('div[contenteditable="true"]')].filter(v)
      .map((c,i)=>({i, label:c.getAttribute('aria-label')||'(none)',
        text:(c.innerText||'').trim().slice(0,30),
        y:Math.round(c.getBoundingClientRect().top)}));});
  const target=(out.boxes||[]).find(b=>b.label!=='Compose message');
  out.editBoxIndex=target?target.i:null;
  if(target===undefined||target===null) return out;
  const box=page.locator('div[contenteditable="true"]').nth(target.i);
  await box.click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.type('QA-EDITFAIL3 edited');
  await page.waitForTimeout(900);
  out.typed=await box.evaluate(e=>e.innerText.trim().slice(0,26));
  await page.route('**/api/v1/messaging/messages/**', r=>{
    const m=r.request().method();
    return (m==='PATCH'||m==='PUT'||m==='POST') ? r.abort('failed') : r.continue();});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  await page.unroute('**/api/v1/messaging/messages/**');
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const boxes=[...document.querySelectorAll('div[contenteditable="true"]')].filter(v)
      .map(c=>({label:c.getAttribute('aria-label')||'(none)', text:(c.innerText||'').trim().slice(0,30)}));
    return {boxes,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,52)).filter(Boolean).slice(0,3)};});
  return out;
};
