export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/C4OX0TTLIMVOUBH');
  await page.waitForTimeout(8000);
  return {url:page.url().slice(-18)};
};
