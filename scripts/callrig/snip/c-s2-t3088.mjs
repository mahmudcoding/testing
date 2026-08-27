const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', src='C4QCPRIVATE0001', dst='C4QCGENERAL0001', voice='M4OWWGYTA4NS9ZU';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){}
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${src}`);
  await page.waitForTimeout(7500);
  const el=page.locator(`[data-message-id="${voice}"]`).first();
  out.found=await el.count();
  if(!out.found) return out;
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  await page.evaluate(()=>navigator.clipboard.writeText('SENTINEL')).catch(()=>{});
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(900);
  out.menu=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');
    return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
  const sh=page.locator('[role="menu"]').getByText('Share',{exact:true}).first();
  if(await sh.count()){ await sh.click(); await page.waitForTimeout(2000); }
  out.link=await page.evaluate(async()=>{try{return (await navigator.clipboard.readText()).slice(0,120);}catch(e){return 'ERR';}});
  if(!out.link || out.link.includes('SENTINEL')) return out;
  // paste the link into another channel
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await comp.type('QA-S2-T3088 '+out.link, {delay:12}); await page.waitForTimeout(700);
  await page.keyboard.press('Enter'); await page.waitForTimeout(7000);
  out.preview=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-T3088/.test(x.innerText||''));
    if(!e) return 'not rendered';
    return {txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,140),
      audio:e.querySelectorAll('audio').length,
      play:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(l=>l&&/Play/.test(l)).length,
      links:[...e.querySelectorAll('a')].length};});
  return out;
};
