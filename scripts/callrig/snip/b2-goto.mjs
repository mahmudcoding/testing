export default async ({page}) => {
  await page.goto(process.env.QA_URL || 'https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return {url: page.url()};
};
