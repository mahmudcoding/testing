const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const out={};
  // plain @handle mention — the CONTROL
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const c of '@Bob') { await page.keyboard.type(c); await page.waitForTimeout(320); }
  await page.waitForTimeout(1300); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  await page.keyboard.type(' QA-S2-NOTIF-CONTROL');
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  out.control = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    return {body:(m.body||'').slice(0,40), mention_ids:JSON.stringify(m.mention_ids||null)};
  }, GEN);
  return out;
};
