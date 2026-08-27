// interaction test on the long-idle tab: no navigation, only UI actions
export default async ({page}) => {
  const out={};
  out.openMin=await page.evaluate(()=>+(performance.now()/60000).toFixed(1));
  out.url=page.url().slice(-24);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  out.composerPresent=await comp.count();
  if(!out.composerPresent) return out;
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  const tag='QA-IDLEACT-'+Math.random().toString(36).slice(2,5);
  const before=await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  await comp.click(); await comp.type(tag,{delay:35}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(6000);
  out.send=await page.evaluate(({tag,before})=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const mine=els.find(e=>(e.innerText||'').includes(tag));
    return {tag, nodesBefore:before, nodesAfter:els.length, appeared:!!mine,
      id:mine?mine.getAttribute('data-message-id'):null};},{tag,before});
  if(!out.send.appeared) return out;
  // react to it, from the same long-idle tab
  const el=page.locator(`main [data-message-id="${out.send.id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  const add=el.locator('button[aria-label="Add reaction"]').first();
  if(await add.count()){
    await add.click(); await page.waitForTimeout(2800);
    const em=page.locator('[frimousse-emoji]:visible').first();
    if(await em.count()){ out.emoji=await em.innerText(); await em.click(); await page.waitForTimeout(3000); }
  }
  await page.keyboard.press('Escape');
  out.serverCheck=await page.evaluate(async({id})=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=5',{credentials:'include'});
    const m=((await r.json()).messages||[]).find(x=>x.id===id);
    return m? {body:m.body.slice(0,24), reactions:(m.reactions||[]).map(x=>x.emoji||x.key)}:'absent';},{id:out.send.id});
  return out;
};
