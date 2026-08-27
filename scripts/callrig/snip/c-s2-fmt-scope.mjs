const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const snap = () => page.evaluate(() => {
    const cs = [...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')];
    const c = cs[cs.length-1];
    return {n: document.querySelectorAll('[data-message-id]').length, composers: cs.length,
            paras: c.querySelectorAll('p').length, txt: c.innerText.replace(/\n/g,'\\n').slice(0,50)};
  });
  const clear = async () => { await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(250); };
  const out = {};
  await clear(); await page.keyboard.type('QA-S2-SCOPE-A');
  await page.locator('button[aria-label="Bold"]').last().click(); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1800);
  out.brokeHere = await snap();
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(3500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(3500);
  await clear(); await page.keyboard.type('QA-S2-AFTER-SWITCH');
  const s0 = await snap(); await page.keyboard.press('Enter'); await page.waitForTimeout(2200); const s1 = await snap();
  out.afterChannelSwitch = {before:s0, after:s1, sent:s1.n>s0.n};
  return out;
};
