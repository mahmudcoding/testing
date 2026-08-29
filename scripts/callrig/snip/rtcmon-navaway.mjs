export default async ({page}) => {
  await page.goto('https://staging.airion-cargo.store/w/W4QAF1XTURESO01/calls', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  return { url: await page.evaluate(() => location.pathname),
           inCall: await page.evaluate(() => !!document.querySelector('[data-testid="call-controls-leave"]')) };
};
