export default async ({page, ctx}) => {
  try { await ctx.grantPermissions(['clipboard-read','clipboard-write'],
    {origin:'https://airion-cargo.store'}); } catch(e){}
  const out={};
  const msg=page.locator('main [data-message-id]').last();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  const poll=async(ms)=>{
    const seen=new Set(); const t0=Date.now();
    while(Date.now()-t0<ms){
      const t=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').trim()).filter(Boolean);});
      t.forEach(x=>seen.add(x.slice(0,40)));
      await page.waitForTimeout(300);
    }
    return [...seen];
  };
  // Copy text
  await msg.hover(); await page.waitForTimeout(1200);
  const ct=msg.locator('button[aria-label="Copy text"]').first();
  out.copyTextButton=await ct.count();
  if(out.copyTextButton){
    const p=poll(6000);
    await ct.click({timeout:6000}).catch(()=>{});
    out.copyTextToasts=await p;
  }
  await page.waitForTimeout(2500);
  // Copy code on the code-block message
  const code=page.locator('[data-message-id]').filter({hasText:'QA-COPYCODE'}).first();
  await code.scrollIntoViewIfNeeded().catch(()=>{});
  await code.hover(); await page.waitForTimeout(1200);
  const cc=code.locator('button[aria-label="Copy code"]').first();
  out.copyCodeButton=await cc.count();
  if(out.copyCodeButton){
    const p=poll(6000);
    await cc.click({timeout:6000}).catch(()=>{});
    out.copyCodeToasts=await p;
  }
  return out;
};
