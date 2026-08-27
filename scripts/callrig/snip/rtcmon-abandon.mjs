export default async ({page}) => {
  // Navigate away without pressing Leave: what closing the tab does.
  await page.goto('about:blank', {waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(2000);
  return 'abandoned call page, url=' + await page.evaluate(()=>location.href).catch(()=>'?');
};
