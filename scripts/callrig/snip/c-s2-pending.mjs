export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await comp.click();
  const tag='QA-PENDING-'+Math.random().toString(36).slice(2,5);
  await page.keyboard.type(tag);
  await page.waitForTimeout(700);
  // hold the send open for ~18s
  await page.route('**/api/v1/messaging/messages', async r=>{
    await new Promise(res=>setTimeout(res,18000));
    return r.continue();});
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3500);
  out.pendingRow=await page.evaluate((tag)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.reverse().find(e=>(e.innerText||'').includes(tag));
    if(!hit) return 'no optimistic row';
    return {id:(hit.getAttribute('data-message-id')||'').slice(0,10),
      text:(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-40),
      attrs:Object.fromEntries([...hit.attributes].map(a=>[a.name,a.value.slice(0,26)]))};}, tag);
  // open its menu while still pending
  const row=page.locator('main [data-message-id]').filter({hasText:tag}).last();
  if(await row.count()){
    await row.hover().catch(()=>{});
    await page.waitForTimeout(1200);
    out.hoverButtons=await row.evaluate(e=>{
      const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...new Set([...e.querySelectorAll('button')].filter(v)
        .map(b=>b.getAttribute('aria-label')||b.innerText||'(unnamed)'))].slice(0,10);});
    const more=row.locator('button[aria-label="More actions"]').first();
    if(await more.count()){
      await more.click({timeout:5000}).catch(()=>{});
      await page.waitForTimeout(2000);
      out.pendingMenu=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
        return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
          .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,18)).filter(Boolean):'NO-MENU';});
      await page.keyboard.press('Escape').catch(()=>{});
    } else out.pendingMenu='no More actions on pending row';
  }
  await page.waitForTimeout(17000);
  await page.unroute('**/api/v1/messaging/messages');
  out.afterSettled=await page.evaluate((tag)=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.reverse().find(e=>(e.innerText||'').includes(tag));
    return hit?'message present':'absent';}, tag);
  return out;
};
