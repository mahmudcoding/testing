export default async ({page}) => {
  const id=process.env.MID;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const m = page.locator(`[data-message-id="${id}"]`);
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1200);
  await page.getByText('Edit', {exact:true}).last().click();
  await page.waitForTimeout(1800);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click();
  await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type('QA-C-EDITPROP-CHANGED');
  await page.waitForTimeout(400);
  const saved = await page.locator('button', {hasText:'Save changes'}).first().click().then(()=>'clicked').catch(e=>'fail:'+e.message.slice(0,60));
  await page.waitForTimeout(3000);
  const api = await page.evaluate(async mid=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=4',{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||j;
    const m=(Array.isArray(arr)?arr:[]).find(x=>x.id===mid);
    return m?{body:m.body, updated:m.updated_at, created:m.created_at}:{notFound:true};
  }, id);
  const own = await page.evaluate(mid=>{const m=document.querySelector(`[data-message-id="${mid}"]`);
    return m?m.innerText.replace(/\s+/g,' ').slice(0,110):'ABSENT';}, id);
  return {saved, apiAfterEdit: api, authorView: own};
};
