const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const c of '@Bob') { await page.keyboard.type(c); await page.waitForTimeout(320); }
  await page.waitForTimeout(1300); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  await page.keyboard.type(' QA-S2-MENTRENDER **bold** _it_ a-b-c');
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {storedBody:m.body, channelRender: el? el.innerText.replace(/\n+/g,' | ').slice(0,110):null};
  }, GEN);
};
