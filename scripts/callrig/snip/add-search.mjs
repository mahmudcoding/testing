export default async ({page}) => {
  const dlgSel = '[role="dialog"]';
  const s = page.locator(dlgSel + ' input[type=search]').last();
  const out = {};
  for (const q of ['outsider', 'QA', 'zzz']) {
    await s.fill(q);
    await page.waitForTimeout(1200);
    out[q] = await page.evaluate(() => {
      const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
      const body = dlg.querySelector('[data-testid="add-to-call-members"]') || dlg;
      return {names: [...dlg.querySelectorAll('input[type=checkbox]')].map(c=>c.getAttribute('aria-label')),
              text: body.innerText.replace(/\n+/g,' | ').slice(0,300)};
    });
  }
  await s.fill('');
  await page.waitForTimeout(800);
  return out;
};
