const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  // plain message
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-MUTE-PLAIN'); await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  // mention
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const c of '@Bob') { await page.keyboard.type(c); await page.waitForTimeout(320); }
  await page.waitForTimeout(1300); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  await page.keyboard.type(' QA-S2-MUTE-MENTION');
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=2`,{credentials:'include'});
    const j=await r.json();
    return (j.messages||[]).map(m=>({body:(m.body||'').slice(0,34), mention_ids:JSON.stringify(m.mention_ids||null)}));
  }, GEN);
};
