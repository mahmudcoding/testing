export default async ({page, ctx}) => {
  try { return await run({page,ctx}); }
  finally { try{ await page.unroute('**/messaging/**'); }catch(e){} await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const TAG='QA-S2-DELQ-'+Math.random().toString(36).slice(2,5);
  const out={tag:TAG};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const id=await page.evaluate(async({ch,TAG})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:TAG, idempotency_key:'qdq-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;},{ch,TAG});
  out.id=id;
  await page.reload(); await page.waitForTimeout(9000);
  // count DELETE attempts the page makes
  let deleteAttempts=0;
  await page.route('**/messaging/**', r=>{
    if(r.request().method()==='DELETE'){ deleteAttempts++; return r.abort('failed'); }
    return r.continue();
  });
  const el=page.locator(`main [data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1300);
  await page.getByText(/^Delete$/).first().click();
  await page.waitForTimeout(1400);
  const conf=page.locator('button').filter({hasText:/^Delete$/}).last();
  if(await conf.count()) await conf.click();
  await page.waitForTimeout(8000);
  out.attemptsWhileBlocked=deleteAttempts;
  // hold the block for a while and confirm the server still has it
  await page.waitForTimeout(25000);
  out.attemptsAfter33s=deleteAttempts;
  out.serverWhileBlocked=await page.evaluate(async({ch,id,TAG})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m? {present:true, bodyIntact:(m.body||'').includes(TAG)}:{present:false};},{ch,id,TAG});
  // release the block, do NOTHING else, and watch the server
  await page.unroute('**/messaging/**');
  const timeline=[];
  for(let i=0;i<12;i++){
    await page.waitForTimeout(5000);
    const s=await page.evaluate(async({ch,id,TAG})=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
      const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
      return m? {present:true, bodyIntact:(m.body||'').includes(TAG)}:{present:false};},{ch,id,TAG});
    timeline.push({at:(i+1)*5, ...s});
    if(s.present && !s.bodyIntact) break;
    if(!s.present) break;
  }
  out.afterRelease={attempts:deleteAttempts, timeline:timeline.slice(0,4),
    final:timeline[timeline.length-1], deletedWithoutUserAction:
      timeline.some(t=>!t.present || (t.present && !t.bodyIntact))};
  return out;
};
