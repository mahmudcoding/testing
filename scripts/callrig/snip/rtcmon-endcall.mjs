export default async ({page}) => {
  const inCall = () => page.evaluate(() => !!document.querySelector('[data-testid="call-controls-leave"]'));
  if (!(await inCall())) return { done: true, note: 'already out' };
  await page.locator('[data-testid="call-controls-leave"]').first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // Host leave offers "End for everyone" — take it so no zombie call remains.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find(x => /end for everyone|leave call/i.test((x.textContent || '').trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(4000);
  return { done: !(await inCall()), url: await page.evaluate(() => location.pathname) };
};
