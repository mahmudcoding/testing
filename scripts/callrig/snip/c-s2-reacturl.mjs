const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\//.test(r.url()) && r.method()!=='GET')
    reqs.push({m:r.method(), u:r.url().split('/api/v1')[1], post:(r.postData()||'').slice(0,90)}); });
  const row = page.locator('[data-message-id]').filter({hasText:'QA-S2-MANYREACT'}).last();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(900);
  await row.locator('button[aria-label="Add reaction"]').first().click({timeout:10000});
  await page.waitForTimeout(1800);
  try { await page.locator('input[aria-label="Search emoji"]').last().fill('grinning'); await page.waitForTimeout(1300);
        await page.locator('button[aria-label="Grinning face"]').last().click({timeout:8000}); } catch(e){}
  await page.waitForTimeout(2500);
  await page.keyboard.press('Escape');
  return {requests:reqs};
};
