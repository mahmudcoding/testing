export default async ({page}) => {
  // The leave button sits under an overlay; click it by coordinates through
  // Playwright, then take the confirm sheet by role.
  const btn = page.locator('[data-testid="call-controls-leave"]').first();
  if (!(await btn.count())) return { done: true, note: 'not in call' };
  const box = await btn.boundingBox();
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(2500);
  for (const name of [/end for everyone/i, /^leave call$/i, /^leave$/i]) {
    const b = page.getByRole('button', { name }).first();
    if (await b.count()) { await b.click({ force: true }).catch(() => {}); await page.waitForTimeout(2000); break; }
  }
  await page.waitForTimeout(3000);
  return { done: await page.evaluate(() => !document.querySelector('[data-testid="call-controls-leave"]')) };
};
