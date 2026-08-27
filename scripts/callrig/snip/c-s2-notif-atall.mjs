const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\/messaging\/messages/.test(r.url()) && r.method()==='POST')
    reqs.push((r.postData()||'').slice(0,150)); });
  for (const [token, tail] of [['@all',' QA-S2-NOTIF-ALL'], ['@here',' QA-S2-NOTIF-HERE']]) {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    for (const c of token) { await page.keyboard.type(c); await page.waitForTimeout(300); }
    await page.waitForTimeout(1300); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    await page.keyboard.type(tail);
    await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  }
  return {requests:reqs};
};
