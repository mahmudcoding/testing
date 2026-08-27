const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  // fresh load — rule out stale client state
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const snap = () => page.evaluate(() => {
    const c = [...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {n: document.querySelectorAll('[data-message-id]').length,
            txt: c.innerText.replace(/\n/g,'\\n').slice(0,70), paras: c.querySelectorAll('p').length};
  });
  const clear = async () => { await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); };
  const out = {};

  // A: fresh page, Bold then Enter
  await clear();
  await page.keyboard.type('QA-S2-FRESH-BOLD ');
  await page.locator('button[aria-label="Bold"]').last().click(); await page.waitForTimeout(400);
  await page.keyboard.type('X');
  const a0 = await snap();
  await page.keyboard.press('Enter'); await page.waitForTimeout(2200);
  const a1 = await snap();
  out.freshBoldEnter = {before:a0, after:a1, sent:a1.n>a0.n};

  // B: press Enter twice more — does it ever send?
  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  const b1 = await snap();
  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  const b2 = await snap();
  out.repeatEnter = {after2:b1, after3:b2, sent: b2.n > a1.n};

  // C: does the Send button still work with the same content?
  const sendBtn = page.locator('button[aria-label="Send"]').last();
  const cDis = await sendBtn.isDisabled();
  await sendBtn.click(); await page.waitForTimeout(2500);
  const c1 = await snap();
  out.sendButton = {wasDisabled:cDis, after:c1, sent: c1.n > b2.n};

  // D: after that send, is Enter healthy again? (no toolbar click this time)
  await clear();
  await page.keyboard.type('QA-S2-AFTER-RECOVER');
  const d0 = await snap();
  await page.keyboard.press('Enter'); await page.waitForTimeout(2200);
  const d1 = await snap();
  out.enterAfterRecover = {before:d0, after:d1, sent: d1.n > d0.n};
  return out;
};
