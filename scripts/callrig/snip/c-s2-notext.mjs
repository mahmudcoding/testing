export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OWWDJIDZUVN10';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){}
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const el=page.locator(`[data-message-id="${id}"]`).first();
  out.found=await el.count();
  if(!out.found) return out;
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  out.inline=await el.evaluate(e=>[...e.querySelectorAll('button')]
    .filter(b=>b.getBoundingClientRect().height>4).map(b=>b.getAttribute('aria-label')).filter(Boolean));
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  out.menu=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');
    return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
  // Copy text if offered
  const ct=page.locator('[role="menu"]').getByText('Copy text',{exact:true}).first();
  out.copyOffered=await ct.count();
  if(out.copyOffered){
    await page.evaluate(()=>navigator.clipboard.writeText('SENTINEL')).catch(()=>{});
    await ct.click(); await page.waitForTimeout(1500);
    out.clipboard=await page.evaluate(async()=>{try{return (await navigator.clipboard.readText()).slice(0,60);}catch(e){return 'ERR';}});
    out.notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
      .map(e=>e.textContent.trim().slice(0,50)));
  } else await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  // Reply → what does the thread parent / quote show?
  const el2=page.locator(`[data-message-id="${id}"]`).first();
  await el2.hover(); await page.waitForTimeout(400);
  await el2.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(2800);
  out.threadParent=await page.evaluate((id)=>{
    const e=[...document.querySelectorAll(`[data-message-id="${id}"]`)]
      .filter(x=>x.getBoundingClientRect().x>900)[0];
    return e? {txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,70), imgs:e.querySelectorAll('img').length,
      noText:/\(no message text\)/.test(e.innerText||'')}:'not in panel';}, id);
  return out;
};
