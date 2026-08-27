export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(6000);
  await page.locator('button[aria-label="Start call"]').first().click();
  return {startedAt:new Date().toISOString()};
};
