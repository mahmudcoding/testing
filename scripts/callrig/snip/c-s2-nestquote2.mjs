export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={steps:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-V4-NQ parent', idempotency_key:'qnq-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.reload(); await page.waitForTimeout(9000);
  const pEl=page.locator(`main [data-message-id="${parent}"]`);
  await pEl.scrollIntoViewIfNeeded(); await pEl.hover(); await page.waitForTimeout(900);
  await pEl.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(4500);
  const comps=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const n=await comps.count();
  const tc=comps.nth(n-1);
  const empty=async()=>{for(let i=0;i<8;i++){ if((await tc.evaluate(e=>e.innerText.trim()))==='') return true;
    await tc.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const newestReply=()=>page.evaluate(async(p)=>{
    const r=await fetch(`/api/v1/messaging/messages/${p}/thread?limit=100`,{credentials:'include'});
    const j=await r.json(); const reps=j.replies||[];
    const m=reps[reps.length-1];
    return m? {id:m.id, body:m.body}:null;}, parent);
  await empty();
  await tc.click(); await tc.type('QA-V4-NQ base **b** _i_ x-y',{delay:35}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5500);
  let cur=await newestReply();
  out.steps.push({step:'base', stored:cur&&cur.body});
  for(let round=1; round<=2 && cur; round++){
    const el=page.locator(`[data-message-id="${cur.id}"]`).last();
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const q=el.locator('button[aria-label="Reply here"]').first();
    if(!await q.count()){ out.steps.push({step:'r'+round, err:'no Reply here'}); break; }
    await q.click(); await page.waitForTimeout(2000);
    out.steps.push({step:'r'+round+'-quotePreview', preview:await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const hits=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
        .map(e=>(e.textContent||'').trim()).filter(t=>/QA-V4-NQ|QA\\-V4\\-NQ/.test(t));
      return [...new Set(hits)].slice(0,3);})});
    await empty();
    await tc.click(); await tc.type(`QA-V4-NQ r${round}`,{delay:35}); await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); await page.waitForTimeout(5500);
    cur=await newestReply();
    out.steps.push({step:'r'+round, stored:cur&&cur.body});
  }
  await empty();
  return out;
};
