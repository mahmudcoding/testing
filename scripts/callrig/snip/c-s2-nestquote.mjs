export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={steps:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const newest=()=>page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const m=(await r.json()).messages[0];
    return {id:m.id, body:m.body};}, ch);
  // seed a message with markdown-ish characters
  await empty();
  await comp.type('QA-V4-NEST base **b** _i_ x-y',{delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  let cur=await newest();
  out.steps.push({step:'base', stored:cur.body,
    rendered:await page.evaluate((id)=>{const e=document.querySelector(`main [data-message-id="${id}"]`);
      return e?(e.innerText||'').replace(/\s+/g,' ').slice(-40):null;}, cur.id)});
  // quote it twice in a row, each time quoting the previous quote
  for(let round=1; round<=2; round++){
    const el=page.locator(`main [data-message-id="${cur.id}"]`);
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const q=el.locator('button[aria-label="Reply"], button[aria-label="Reply here"], button[aria-label="Quote"]').first();
    if(!await q.count()){ out.steps.push({step:'round'+round, err:'no quote control'}); break; }
    const label=await q.getAttribute('aria-label');
    if(label==='Reply'){ out.steps.push({step:'round'+round, note:'only Reply (thread) available in channel; stopping'}); break; }
    await q.click(); await page.waitForTimeout(2000);
    await comp.click(); await comp.type(` QA-V4-NEST r${round}`,{delay:35}); await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
    cur=await newest();
    out.steps.push({step:'round'+round, stored:cur.body,
      rendered:await page.evaluate((id)=>{const e=document.querySelector(`main [data-message-id="${id}"]`);
        return e?(e.innerText||'').replace(/\s+/g,' ').slice(-70):null;}, cur.id)});
  }
  await empty();
  return out;
};
