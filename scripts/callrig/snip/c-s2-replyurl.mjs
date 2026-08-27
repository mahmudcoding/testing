const WS='W4QCF1XTURESO01', CH='C4OWOSZN35PTPMA';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={}; const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\//.test(r.url()) && r.method()==='POST')
    reqs.push({url:r.url().split('/api/v1')[1], post:(r.postData()||'').slice(0,120)}); });
  const parent = page.locator('[data-message-id]').filter({hasText:'QA-S2-TP2-PARENT'}).last();
  await parent.scrollIntoViewIfNeeded().catch(()=>{});
  await parent.hover(); await page.waitForTimeout(900);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(3500);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-TP2-R2'); await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
  out.requests = reqs;
  out.pid = await parent.getAttribute('data-message-id');
  return out;
};
