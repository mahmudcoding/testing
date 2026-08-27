export default async ({page, ctx}) => {
  try { return await run({page,ctx}); }
  finally { try{ await page.unroute('**/messaging/**'); }catch(e){} await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const TAG='QA-S2-DELR-'+Math.random().toString(36).slice(2,5);
  const out={tag:TAG};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const id=await page.evaluate(async({ch,TAG})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:TAG, idempotency_key:'qdr-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;},{ch,TAG});
  out.id=id;
  await page.reload(); await page.waitForTimeout(9000);
  const look=()=>page.evaluate(({id,TAG})=>{
    const el=document.querySelector(`main [data-message-id="${id}"]`);
    return {elementPresent:!!el,
      textVisible: el? (el.innerText||'').includes(TAG) : false,
      saysDeleted: el? /was deleted/i.test(el.innerText||'') : false,
      text: el? (el.innerText||'').replace(/\s+/g,' ').slice(-40):null};},{id,TAG});
  out.beforeDelete=await look();
  await page.route('**/messaging/**', r=> r.request().method()==='DELETE' ? r.abort('failed') : r.continue());
  const el=page.locator(`main [data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1300);
  await page.getByText(/^Delete$/).first().click();
  await page.waitForTimeout(1400);
  const conf=page.locator('button').filter({hasText:/^Delete$/}).last();
  if(await conf.count()) await conf.click();
  const series=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(500); series.push({at:(i+1)*0.5, ...await look()}); }
  const k=(s)=>JSON.stringify([s.elementPresent,s.textVisible,s.saysDeleted]);
  const ch2=[]; let p=null; for(const s of series){ if(k(s)!==p){ch2.push(s);p=k(s);} }
  out.afterConfirm={changes:ch2.slice(0,5), final:series[series.length-1]};
  await page.unroute('**/messaging/**');
  out.server=await page.evaluate(async({ch,id,TAG})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m? {present:true, bodyMatches:(m.body||'').includes(TAG), body:(m.body||'').slice(0,24)}:{present:false};},
    {ch,id,TAG});
  await page.reload(); await page.waitForTimeout(10000);
  out.afterReload=await look();
  return out;
};
