const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  await page.locator('button[aria-label="Start call"]').last().click({timeout:8000});
  const t = Date.now();
  await page.waitForTimeout(2500);
  return {startedEpoch:t, iso:new Date(t).toISOString(), url:page.url()};
};
