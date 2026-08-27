export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/chat/saved', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  return {url: page.url(), vis: await page.evaluate(()=>document.visibilityState)};
};
