export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', dst='C4QCGENERAL0001';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){}
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  await page.waitForTimeout(7500);
  const id=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-FWDATT source/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  out.card=id;
  if(!id) return out;
  const el=page.locator(`[data-message-id="${id}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  out.inline=await el.evaluate(e=>[...e.querySelectorAll('button')]
    .filter(b=>b.getBoundingClientRect().height>4).map(b=>b.getAttribute('aria-label')).filter(Boolean));
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  out.menu=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');
    return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
  const ct=page.locator('[role="menu"]').getByText('Copy text',{exact:true}).first();
  out.copyOffered=await ct.count();
  if(out.copyOffered){
    await page.evaluate(()=>navigator.clipboard.writeText('SENTINEL')).catch(()=>{});
    await ct.click(); await page.waitForTimeout(1500);
    out.clipboard=await page.evaluate(async()=>{try{return (await navigator.clipboard.readText()).slice(0,70);}catch(e){return 'ERR';}});
  } else await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  // Reply → what does the thread show for a forwarded parent?
  const el2=page.locator(`[data-message-id="${id}"]`).first();
  await el2.hover(); await page.waitForTimeout(400);
  await el2.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(2800);
  out.threadParent=await page.evaluate((id)=>{
    const e=[...document.querySelectorAll(`[data-message-id="${id}"]`)]
      .filter(x=>x.getBoundingClientRect().x>900)[0];
    return e? {txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,90), imgs:e.querySelectorAll('img').length}:'not in panel';}, id);
  return out;
};
