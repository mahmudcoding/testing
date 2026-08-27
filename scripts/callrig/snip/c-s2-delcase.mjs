export default async ({page, ctx}) => {
  try { return await run({page,ctx}); }
  finally { try{ await page.unroute('**/messaging/**'); }catch(e){} await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const TAG=process.env.QA_TAG||'QA-S2-DELCASE';
  const out={tag:TAG};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const id=await page.evaluate(async({ch,TAG})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:TAG, idempotency_key:'qdc-'+Math.random().toString(36).slice(2)})});
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
  const series=[];
  for(let i=0;i<14;i++){
    await page.waitForTimeout(600);
    series.push(await page.evaluate(({id,TAG})=>{
      const e=document.querySelector(`main [data-message-id="${id}"]`);
      const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
      return {present:!!e,
        saysDeleted: e? /was deleted/i.test(e.innerText||''):null,
        textVisible: e? (e.innerText||'').includes(TAG):null,
        toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
          .map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,50)))]};},{id,TAG}));
  }
  out.deleteAttempts=attempts;
  out.uiTimeline=(()=>{const k=(s)=>JSON.stringify([s.present,s.saysDeleted,s.textVisible,s.toasts]);
    const o=[];let p=null;for(const s of series){if(k(s)!==p){o.push(s);p=k(s);}}return o.slice(0,4);})();
  await page.unroute('**/messaging/**');
  await page.waitForTimeout(6000);
  out.serverNoReload=await page.evaluate(async({ch,id,TAG})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m? {present:true, bodyIntact:(m.body||'').includes(TAG)}:{present:false};},{ch,id,TAG});
  return out;
};
