export default async ({page}) => {
  const out = {};
  const panel = await page.$('[data-testid="meeting-settings-password-toggle"]');
  if (!panel) { await page.click('[data-testid="call-controls-settings-toggle"]'); await page.waitForTimeout(1800); }
  const t = page.locator('[data-testid="meeting-settings-password-toggle"]');
  out.before = await page.evaluate(() => { const b=document.querySelector('[data-testid="meeting-settings-password-toggle"]'); return b?{ac:b.getAttribute('aria-checked'), d:b.disabled}:'missing'; });
  await t.click();
  await page.waitForTimeout(1200);
  out.afterToggle = await page.evaluate(() => {
    const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
    return {inputs: [...dlg.querySelectorAll('input')].map(i=>`${i.type}|${i.id||''}|${i.placeholder||''}|${i.getAttribute('aria-label')||''}`),
            text: dlg.innerText.replace(/\n+/g,' | ').slice(0,800),
            saveDisabled: (document.querySelector('[data-testid="meeting-settings-save"]')||{}).disabled};
  });
  return out;
};
