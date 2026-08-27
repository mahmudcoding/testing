export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const msg = page.locator('[data-message-id="M4OWAUZE7PA2YX1"]'); // forwarded, body=""
  await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(600);
  await msg.locator('button[aria-label="Save"]').first().click();
  await page.waitForTimeout(1500);
  // also save a plain-text message for contrast
  const plain = page.locator('[data-message-id="M4OWASZC1CPF0A5"]');
  if(await plain.count()){ await plain.scrollIntoViewIfNeeded(); await plain.hover(); await page.waitForTimeout(500);
    const sb = plain.locator('button[aria-label="Save"]'); if(await sb.count()) await sb.first().click(); }
  await page.waitForTimeout(1500);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const items = await page.evaluate(() => [...document.querySelectorAll('[data-message-id]')]
     .map(m=>({id:m.getAttribute('data-message-id'), text:m.innerText.replace(/\s+/g,' ').trim().slice(0,140)})));
  const api = await page.evaluate(async () => {
    for(const u of ['/api/v1/messaging/messages/saved?limit=20','/api/v1/users/me/saved-messages?limit=20']){
      const r=await fetch(u,{credentials:'include'}); if(r.status===200){const j=await r.json(); return {u, keys:Object.keys(j), n:(j.messages||j.data||j||[]).length};}
    }
    return {none:true};
  });
  return {savedItems: items, api};
};
