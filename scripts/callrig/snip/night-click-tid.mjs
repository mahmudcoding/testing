export default async ({page}) => {
  const tid = process.env.QA_TID;
  const l = page.locator('[data-testid="'+tid+'"]');
  const before = {label: await l.getAttribute('aria-label'), pressed: await l.getAttribute('aria-pressed')};
  await l.click();
  await page.waitForTimeout(Number(process.env.QA_WAIT||3000));
  const after = {label: await l.getAttribute('aria-label').catch(()=>null), pressed: await l.getAttribute('aria-pressed').catch(()=>null)};
  return {tid, before, after};
};
