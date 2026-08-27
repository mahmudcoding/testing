export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001';
  const out={};
  const TXT='QA-S2-OFFL3-'+Math.random().toString(36).slice(2,6);
  out.text=TXT;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  await ctx.setOffline(true); await page.waitForTimeout(1500);
  await comp.click(); await comp.type(TXT,{delay:40}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(6000);
  await ctx.setOffline(false); await page.waitForTimeout(20000);
  // enumerate every action offered on the stuck message, including the overflow menu
  const el=page.locator(`main [data-message-id]`).filter({hasText:TXT}).first();
  out.present=await el.count();
  if(out.present){
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1200);
    const more=el.locator('button[aria-label="More actions"]').first();
    if(await more.count()){
      await more.click(); await page.waitForTimeout(1600);
      out.overflowMenu=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
        return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean) : 'no menu';});
      await page.keyboard.press('Escape');
    }
  }
  out.serverSees=await page.evaluate(async({gen,TXT})=>{
    const r=await fetch(`/api/v1/messaging/channels/${gen}/messages?limit=100`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.messages||[]).some(m=>(m.body||'').includes(TXT));},{gen,TXT});
  return out;
};
