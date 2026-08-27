const WS='W4QCF1XTURESO01', CH='C4OWOSZN35PTPMA';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\/messaging\/messages/.test(r.url()) && r.method()==='POST')
    reqs.push((r.postData()||'').slice(0,200)); });
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-TP2-PARENT'); await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
  const pid = await page.locator('[data-message-id]').last().getAttribute('data-message-id');
  out.pid = pid;
  const p = page.locator(`[data-message-id="${pid}"]`).first();
  await p.hover(); await page.waitForTimeout(900);
  await p.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(3500);
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-TP2-R1'); await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
  out.requests = reqs;
  return out;
};
