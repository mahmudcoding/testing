const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  if (!page.url().includes(GEN)) { await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'}); await page.waitForTimeout(4000); }
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const marks=[];
  const burst = async (label) => {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
    const t=Date.now();
    for (const ch of 'ABCDEFGH') { await page.keyboard.type(ch); await page.waitForTimeout(220); }
    marks.push({label, startEpoch:t, endEpoch:Date.now()});
    await page.waitForTimeout(3000);
  };
  await burst('t+05s');
  await page.waitForTimeout(20000);
  await burst('t+30s');
  await page.waitForTimeout(30000);
  await burst('t+65s');
  await page.waitForTimeout(45000);
  await burst('t+115s');
  return marks;
};
