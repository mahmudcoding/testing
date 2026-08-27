const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const snap = () => page.evaluate(() => {
    const c = [...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {n: document.querySelectorAll('[data-message-id]').length, paras: c.querySelectorAll('p').length,
            txt: c.innerText.replace(/\n/g,'\\n').slice(0,50)};
  });
  const clear = async () => { await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(250); };
  const labels = ['Bold','Italic','Strikethrough','Insert code','Insert quote','Insert code block','Insert list','Insert numbered list','Markdown formatting'];
  const res = [];
  for (const L of labels) {
    await clear();
    await page.keyboard.type('t');
    try { await page.locator(`button[aria-label="${L}"]`).last().click({timeout:5000}); } catch(e){ res.push({label:L, err:'click failed'}); continue; }
    await page.waitForTimeout(400);
    await page.keyboard.type('QA');
    const b = await snap();
    await page.keyboard.press('Enter'); await page.waitForTimeout(2000);
    const a = await snap();
    res.push({label:L, sent: a.n>b.n, parasBefore:b.paras, parasAfter:a.paras, txtAfter:a.txt});
  }
  // toggle-off variant: click Bold on, then Bold off, then Enter
  await clear(); await page.keyboard.type('t');
  await page.locator('button[aria-label="Bold"]').last().click(); await page.waitForTimeout(300);
  await page.locator('button[aria-label="Bold"]').last().click(); await page.waitForTimeout(300);
  await page.keyboard.type('OFF');
  const tb = await snap(); await page.keyboard.press('Enter'); await page.waitForTimeout(2000); const ta = await snap();
  res.push({label:'Bold ON then OFF', sent: ta.n>tb.n, parasAfter: ta.paras, txtAfter: ta.txt});

  // markdown-typed bold, no toolbar at all
  await clear(); await page.keyboard.type('QA-S2-MDBOLD **x** end');
  const mb = await snap(); await page.keyboard.press('Enter'); await page.waitForTimeout(2000); const ma = await snap();
  res.push({label:'typed **bold**, no toolbar', sent: ma.n>mb.n, parasAfter: ma.paras, txtAfter: ma.txt});
  await clear();
  return res;
};
