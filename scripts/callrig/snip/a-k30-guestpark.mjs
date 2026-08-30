/* Join as a guest and LEAVE the context open, so another run can observe the call. */
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const name = process.env.K30_GNAME || 'Guest Park';
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(8000);
  await gp.locator('input[type=text]').first().fill(name);
  await gp.waitForTimeout(600);
  await gp.locator('button[type=submit]').first().click();
  await gp.waitForTimeout(14000);
  const st = await gp.evaluate(() => ({ url: location.pathname,
    inCall: !!document.querySelector('[data-testid="guest-call-surface"]'),
    text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,220) }));
  return { name, ...st, contextLeftOpen: true };
};
