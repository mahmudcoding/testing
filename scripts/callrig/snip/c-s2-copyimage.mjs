export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OXFPK7R352QL5';
  try { await ctx.grantPermissions(['clipboard-read','clipboard-write'],
    {origin:'https://airion-cargo.store'}); } catch(e){}
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const msg=page.locator(`[data-message-id="${id}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  out.imagesInMessage=await msg.evaluate(e=>[...e.querySelectorAll('img')]
    .map(i=>(i.getAttribute('alt')||i.getAttribute('src')||'').split('/').pop().slice(0,28)));
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  const ci=page.locator('[role="menu"] [role="menuitem"], [role="menu"] button').filter({hasText:/^Copy image$/}).first();
  out.copyImageCount=await ci.count();
  if(!out.copyImageCount) return out;
  await ci.click({timeout:6000}).catch(()=>{out.clickFail=true});
  await page.waitForTimeout(4000);
  out.clipboard=await page.evaluate(async ()=>{
    try {
      const items=await navigator.clipboard.read();
      return items.map(i=>i.types.join(','));
    } catch(e){ return 'READ-FAILED: '+String(e.message).slice(0,50); }});
  out.clipboardSize=await page.evaluate(async ()=>{
    try {
      const items=await navigator.clipboard.read();
      if(!items.length) return null;
      const t=items[0].types.find(x=>x.startsWith('image/'));
      if(!t) return 'no image type';
      const b=await items[0].getType(t);
      return {type:t, bytes:b.size};
    } catch(e){ return 'SIZE-FAILED'; }});
  out.toasts=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
      .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean).slice(0,2);});
  return out;
};
