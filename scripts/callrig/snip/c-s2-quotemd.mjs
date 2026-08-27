export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const pid=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-QMD2 parent'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${pid}`);
  await page.waitForTimeout(13000);
  const out={};
  // reply in thread, typed in the composer so it is escaped
  const boxes=await page.evaluate(()=>[...document.querySelectorAll('div[contenteditable="true"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;})
    .map((e,i)=>({i, x:Math.round(e.getBoundingClientRect().left)})));
  const idx=boxes.reduce((a,b)=>b.x>a.x?b:a).i;
  const comp=page.locator('div[contenteditable="true"]').nth(idx);
  await comp.click();
  await page.keyboard.type('QA-QMD2 **b** _i_ x-y');
  await page.waitForTimeout(800);
  await page.locator('button[aria-label="Send"]').last().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(7000);
  out.replyInFeed=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('[data-message-id]')].reverse();
    const hit=els.find(e=>/QA-QMD2 /.test(e.innerText||'')&&!/parent/.test(e.innerText||''));
    return hit?(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-40):'not found';});
  // now Reply here on that reply
  const reply=page.locator('[data-message-id]').filter({hasText:'QA-QMD2 **b**'}).last();
  out.replyNodeFound=await reply.count();
  if(!out.replyNodeFound) return out;
  await reply.hover(); await page.waitForTimeout(1400);
  await reply.locator('button[aria-label="Reply here"]').first().click({timeout:6000})
    .catch(async()=>{ await page.locator('button').filter({hasText:/^Reply here$/}).last().click({timeout:5000}).catch(()=>{out.rhFail=true}); });
  await page.waitForTimeout(3000);
  out.quoteInComposer=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const boxes=[...document.querySelectorAll('div[contenteditable="true"]')].filter(v);
    const c=boxes[boxes.length-1];
    let n=c; for(let i=0;i<4&&n.parentElement;i++) n=n.parentElement;
    return (n.innerText||'').replace(/\s+/g,' ').trim().slice(0,120);});
  return out;
};
