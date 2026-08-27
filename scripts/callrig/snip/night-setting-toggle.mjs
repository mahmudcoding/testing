export default async ({page}) => {
  const tid = process.env.QA_TID;          // data-testid of the control to click
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/meeting')){ let b=''; try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const s = page.locator('[data-testid="call-controls-settings-toggle"]');
  if (await s.getAttribute('aria-pressed') !== 'true') { await s.click(); await page.waitForTimeout(2500); }
  const el = page.locator('[data-testid="'+tid+'"]');
  const before = await el.getAttribute('aria-checked');
  await el.click();
  await page.waitForTimeout(1500);
  const afterClick = await el.getAttribute('aria-checked');
  // save if a Save button is enabled
  let saved = null;
  const sv = page.locator('[data-testid="meeting-settings-save"]');
  if (await sv.count() && !(await sv.isDisabled())) { await sv.click(); saved = 'clicked'; await page.waitForTimeout(3000); }
  const after = await el.getAttribute('aria-checked');
  return {tid, before, afterClick, saveButton: saved, afterSave: after, net};
};
