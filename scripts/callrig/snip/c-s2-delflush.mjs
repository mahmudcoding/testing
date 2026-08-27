export default async ({page, ctx}) => {
  try { return await run({page,ctx}); }
  finally { try{ await page.unroute('**/messaging/**'); }catch(e){} await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const TAG='QA-S2-DELF-'+Math.random().toString(36).slice(2,5);
  const out={tag:TAG};
  const server=(id)=>page.evaluate(async({ch,id,TAG})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m? {present:true, bodyIntact:(m.body||'').includes(TAG), body:(m.body||'').slice(0,20)}
            : {present:false};},{ch,id,TAG});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const id=await page.evaluate(async({ch,TAG})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:TAG, idempotency_key:'qdf-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;},{ch,TAG});
  out.id=id;
  await page.reload(); await page.waitForTimeout(9000);
  let attempts=0;
  await page.route('**/messaging/**', r=>{
    if(r.request().method()==='DELETE'){ attempts++; return r.abort('failed'); }
    return r.continue();});
  const el=page.locator(`main [data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1300);
  await page.getByText(/^Delete$/).first().click();
  await page.waitForTimeout(1400);
  const conf=page.locator('button').filter({hasText:/^Delete$/}).last();
  if(await conf.count()) await conf.click();
  await page.waitForTimeout(7000);
  out.blockedAttempts=attempts;
  await page.unroute('**/messaging/**');
  await page.waitForTimeout(8000);
  out.beforeReload=await server(id);
  // the only new action: a page reload
  await page.reload(); await page.waitForTimeout(11000);
  out.attemptsAfterReload=attempts;   // route is gone, so this stays at the blocked count
  const tl=[];
  for(let i=0;i<8;i++){
    await page.waitForTimeout(4000);
    const s=await server(id); tl.push({at:(i+1)*4, ...s});
    if(!s.present || !s.bodyIntact) break;
  }
  out.afterReload={timeline:tl.slice(0,4), final:tl[tl.length-1],
    flushedByReload: tl.some(t=>!t.present || !t.bodyIntact)};
  out.uiAfterReload=await page.evaluate(({id,TAG})=>{
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    return e? {saysDeleted:/was deleted/i.test(e.innerText||''),
      textVisible:(e.innerText||'').includes(TAG)}:'absent';},{id,TAG});
  return out;
};
