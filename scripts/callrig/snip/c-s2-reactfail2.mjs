export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-REACTFAIL2 base'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={seed:seed.slice(-5)};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  const state=()=>page.evaluate((id)=>{
    const el=document.querySelector(`[data-message-id="${id}"]`);
    if(!el) return 'gone';
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...el.querySelectorAll('button[aria-label]')].filter(v)
      .map(b=>b.getAttribute('aria-label')).filter(t=>/reaction/i.test(t));}, seed);
  out.before=await state();
  await page.route('**/api/v1/messaging/**', r=>{
    const m=r.request().method();
    return (m==='POST'||m==='PUT'||m==='PATCH'||m==='DELETE') ? r.abort('failed') : r.continue();});
  await msg.locator('button[aria-label="Add reaction"]').first().click({timeout:6000}).catch(()=>{out.pickFail=true});
  await page.waitForTimeout(3000);
  const em=page.locator('button[aria-label="🔥"]').first();
  out.emojiCount=await em.count();
  if(out.emojiCount) await em.click({timeout:6000}).catch(()=>{out.emojiFail=true});
  await page.waitForTimeout(2000); out.at2s=await state();
  await page.waitForTimeout(6000); out.at8s=await state();
  await page.unroute('**/api/v1/messaging/**');
  out.toasts=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
      .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean).slice(0,2);});
  await page.reload(); await page.waitForTimeout(11000);
  out.afterReload=await state();
  out.serverReactions=await page.evaluate(async ({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>x.id===id);
    return hit?JSON.stringify(hit.reactions||[]).slice(0,60):'not found';},{ch,id:seed});
  return out;
};
