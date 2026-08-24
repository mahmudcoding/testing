export default async ({page}) => {
  const inp = page.locator('[role="dialog"] input[type=password]').last();
  const out = [];
  for (const n of [73, 80, 100, 128, 129, 256]) {
    await inp.fill('a'.repeat(n));
    await page.waitForTimeout(1600);
    out.push(await page.evaluate((n) => ({n,
      len: [...document.querySelectorAll('[role="dialog"] input[type=password]')].pop().value.length,
      saveDisabled: (document.querySelector('[data-testid="meeting-settings-save"]')||{}).disabled}), n));
  }
  // back to a normal value
  await inp.fill('secret123');
  await page.waitForTimeout(900);
  out.push(await page.evaluate(() => ({n:'secret123', saveDisabled: (document.querySelector('[data-testid="meeting-settings-save"]')||{}).disabled})));
  return out;
};
