export default async ({page}) => {
  const id=process.env.MID;
  const m = page.locator(`[data-message-id="${id}"]`);
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1200);
  await page.locator('button').filter({hasText:/^Edit$/}).last().click();
  await page.waitForTimeout(1800);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click();
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(400);
  const cleared = await page.evaluate(()=>(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).innerText);
  await comp.type('QA-C-EDITPROP-CHANGED');
  await page.waitForTimeout(500);
  const typed = await page.evaluate(()=>(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).innerText);
  let saved='no';
  try{ await page.locator('button').filter({hasText:/^Save changes$/}).first().click({timeout:8000}); saved='clicked'; }
  catch(e){ saved='fail:'+e.message.slice(0,50); }
  await page.waitForTimeout(3000);
  const api = await page.evaluate(async mid=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=4',{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||j;
    const m=(Array.isArray(arr)?arr:[]).find(x=>x.id===mid);
    return m?{body:m.body, created:m.created_at, updated:m.updated_at}:{notFound:true};
  }, id);
  const own = await page.evaluate(mid=>{const x=document.querySelector(`[data-message-id="${mid}"]`);
    return x?x.innerText.replace(/\s+/g,' ').slice(0,110):'ABSENT';}, id);
  return {clearedTo:JSON.stringify(cleared), typed, saved, apiAfterEdit:api, authorView:own};
};
