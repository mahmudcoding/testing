const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  // 1. emoji-only message
  await empty(page, comp);
  await comp.type('🎉🎉🎉', {delay:60}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.emojiOnly=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const e=els[els.length-1];
    if(!e) return 'none';
    const leaf=[...e.querySelectorAll('*')].filter(x=>x.children.length===0)
      .find(x=>/🎉/.test(x.textContent||''));
    const cs=leaf?getComputedStyle(leaf):null;
    return {txt:(e.innerText||'').replace(/\s+/g,' ').slice(-16),
      fontSize:cs&&cs.fontSize, lineHeight:cs&&cs.lineHeight};});
  // reference: a normal short message for font-size comparison
  await empty(page, comp);
  await comp.type('QA-S2-REF', {delay:40}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.normal=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const e=els[els.length-1];
    const leaf=[...e.querySelectorAll('*')].filter(x=>x.children.length===0)
      .find(x=>/QA-S2-REF/.test(x.textContent||''));
    const cs=leaf?getComputedStyle(leaf):null;
    return {fontSize:cs&&cs.fontSize};});
  // 2. rapid sequential sends — ordering
  const ids=[];
  for(let i=1;i<=6;i++){
    const id=await page.evaluate(async({ch,i})=>{
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:ch, body:`QA-S2-SEQ-${i}`, idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
      return (await r.json()).id;}, {ch,i});
    ids.push(id);
  }
  await page.waitForTimeout(5000);
  out.order=await page.evaluate(()=>{
    return [...document.querySelectorAll('main [data-message-id]')]
      .map(e=>(e.innerText||'').match(/QA-S2-SEQ-\d/)).filter(Boolean).map(m=>m[0]);});
  out.orderOk=JSON.stringify(out.order)===JSON.stringify(['QA-S2-SEQ-1','QA-S2-SEQ-2','QA-S2-SEQ-3','QA-S2-SEQ-4','QA-S2-SEQ-5','QA-S2-SEQ-6']);
  await empty(page, comp);
  return out;
};
