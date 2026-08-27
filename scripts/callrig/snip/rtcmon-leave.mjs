export default async ({page}) => {
  const r = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-controls-leave"]');
    if (!b) return 'leave button not found';
    b.click(); return 'clicked leave';
  });
  await page.waitForTimeout(5000);
  return { r, url: await page.evaluate(()=>location.pathname),
           stillInCall: await page.evaluate(()=>!!document.querySelector('[data-testid="call-controls-leave"]')) };
};
