export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const tag='QA-SAVEDDEL-'+Math.random().toString(36).slice(2,5);
  const seed=await page.evaluate(async ({ch,tag})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch, body:tag})});
    const j=await r.json(); return j.id||j.message?.id;},{ch,tag});
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={tag};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="Save"]').first().click({timeout:6000}).catch(()=>{out.saveFail=true});
  await page.waitForTimeout(4000);
  // confirm it is in Saved
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(11000);
  out.inSavedBefore=await page.evaluate((tag)=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.find(e=>(e.innerText||'').includes(tag));
    return hit?(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-50):'not found';}, tag);
  // delete the source
  out.deleted=await page.evaluate(async ({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',
      credentials:'include',headers:{'content-type':'application/json'},
      body:JSON.stringify({message_ids:[id]})});
    const j=await r.json(); return {status:r.status, ids:j&&j.deleted_ids};},{ch,id:seed});
  await page.waitForTimeout(5000);
  out.savedAfterLive=await page.evaluate((tag)=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.find(e=>(e.innerText||'').includes(tag));
    return hit?(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-50):'gone from list';}, tag);
  await page.reload(); await page.waitForTimeout(11000);
  out.savedAfterReload=await page.evaluate((tag)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.find(e=>(e.innerText||'').includes(tag));
    if(!hit) return {present:false,
      anyDeletedTombstone:(document.querySelector('main')?.innerText||'').includes('was deleted')};
    return {present:true, text:(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-60),
      buttons:[...new Set([...hit.querySelectorAll('button,a')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)))].slice(0,8)};}, tag);
  return out;
};
