const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const snap = () => page.evaluate(() => {
    const c = [...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {n: document.querySelectorAll('[data-message-id]').length, paras: c.querySelectorAll('p').length,
            txt: c.innerText.replace(/\n/g,'\\n').slice(0,60)};
  });
  const clear = async () => { await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(250); };
  const out = {};

  // 1. realistic: type text, select all of it, click Bold, Enter
  await clear();
  await page.keyboard.type('QA-S2-SELBOLD');
  await page.keyboard.press('Meta+A');
  await page.locator('button[aria-label="Bold"]').last().click(); await page.waitForTimeout(400);
  const s0 = await snap(); await page.keyboard.press('Enter'); await page.waitForTimeout(2200); const s1 = await snap();
  out.selectThenBold = {before:s0, after:s1, sent:s1.n>s0.n};

  // 2. recovery: click back into the composer text with the mouse, then Enter
  await comp().click(); await page.waitForTimeout(400);
  const r0 = await snap(); await page.keyboard.press('Enter'); await page.waitForTimeout(2200); const r1 = await snap();
  out.clickComposerThenEnter = {before:r0, after:r1, sent:r1.n>r0.n};

  // 3. recovery: click a message in the feed, then back into composer, then Enter
  await page.locator('[data-message-id]').last().click({position:{x:5,y:5}}).catch(()=>{});
  await page.waitForTimeout(400);
  await comp().click(); await page.waitForTimeout(400);
  const q0 = await snap(); await page.keyboard.press('Enter'); await page.waitForTimeout(2200); const q1 = await snap();
  out.clickAwayThenBack = {before:q0, after:q1, sent:q1.n>q0.n};

  // 4. does clicking the toolbar WITHOUT typing after also break Enter?
  await clear(); await page.keyboard.type('QA-S2-NOTYPE');
  await page.locator('button[aria-label="Italic"]').last().click(); await page.waitForTimeout(400);
  const t0 = await snap(); await page.keyboard.press('Enter'); await page.waitForTimeout(2200); const t1 = await snap();
  out.clickNoTypeThenEnter = {before:t0, after:t1, sent:t1.n>t0.n};

  await clear();
  return out;
};
