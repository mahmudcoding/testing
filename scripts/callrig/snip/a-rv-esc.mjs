export default async ({ page }) => { await page.keyboard.press('Escape'); await page.waitForTimeout(800); await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  return await page.evaluate(()=>({poppers: document.querySelectorAll('[data-radix-popper-content-wrapper]').length})); };
