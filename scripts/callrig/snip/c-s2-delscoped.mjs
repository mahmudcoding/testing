export default async ({page, ctx}) => {
  try { return await run({page,ctx}); }
  finally { await ctx.setOffline(false); try{ await page.unroute('**/messaging/**'); }catch(e){} }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const mk=(txt)=>page.evaluate(async({ch,txt})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qds-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;},{ch,txt});
  // scoped strictly to the target element
  const snap=(id,tag)=>page.evaluate(({id,tag})=>{
    const el=document.querySelector(`main [data-message-id="${id}"]`);
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const toasts=[...new Set([...document.querySelectorAll('[data-sonner-toast]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,58)))];
    const tombstones=[...document.querySelectorAll('main [data-message-id]')]
      .filter(m=>/was deleted/i.test(m.innerText||'')).length;
    return {present:!!el,
      ownText: el? (el.innerText||'').replace(/\s+/g,' ').slice(-46) : null,
      saysDeleted: el? /was deleted/i.test(el.innerText||'') : null,
      stillHasTag: el? (el.innerText||'').includes(tag) : null,
      tombstonesInFeed:tombstones, toasts};},{id,tag});
  const doDelete=async(id,tag)=>{
    const el=page.locator(`main [data-message-id="${id}"]`);
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
    await el.locator('button[aria-label="More actions"]').first().click();
    await page.waitForTimeout(1300);
    const del=page.getByText(/^Delete$/).first();
    if(!await del.count()){ await page.keyboard.press('Escape'); return {err:'no Delete'}; }
    await del.click(); await page.waitForTimeout(1500);
    const conf=page.locator('button').filter({hasText:/^Delete$/}).last();
    if(await conf.count()) await conf.click();
    const series=[];
    for(let i=0;i<12;i++){ await page.waitForTimeout(700); series.push(await snap(id,tag)); }
    const k=(s)=>JSON.stringify([s.present,s.saysDeleted,s.stillHasTag,s.toasts]);
    const ch2=[]; let p=null; for(const s of series){ if(k(s)!==p){ch2.push(s);p=k(s);} }
    return {changes:ch2.slice(0,5), final:series[series.length-1]};
  };
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  out.tombstonesBefore=(await snap('none','x')).tombstonesInFeed;
  const A=await mk('QA-S2-DSC-A'), B=await mk('QA-S2-DSC-B');
  await page.reload(); await page.waitForTimeout(9000);
  await ctx.setOffline(true); await page.waitForTimeout(1200);
  out.A_offline=await doDelete(A,'QA-S2-DSC-A');
  await ctx.setOffline(false); await page.waitForTimeout(14000);
  out.A_afterReconnect=await snap(A,'QA-S2-DSC-A');
  out.A_server=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m? {present:true, body:(m.body||'').slice(0,20), deleted:m.deleted||m.is_deleted}:{present:false};},{ch,id:A});
  await page.reload(); await page.waitForTimeout(9000);
  await page.route('**/messaging/**', r=> r.request().method()==='DELETE' ? r.abort('failed') : r.continue());
  out.B_abort=await doDelete(B,'QA-S2-DSC-B');
  await page.unroute('**/messaging/**');
  out.B_server=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m? {present:true, body:(m.body||'').slice(0,20), deleted:m.deleted||m.is_deleted}:{present:false};},{ch,id:B});
  return out;
};
