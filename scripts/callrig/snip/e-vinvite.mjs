const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  const net = [];
  page.on('response', async r => {
    if (!/\/api\/v1\/calendar\/meetings$/.test(r.url().split('?')[0])) return;
    if (r.request().method() !== 'POST') return;
    net.push({ s: r.status(), b: (await r.text().catch(() => '')).slice(0, 200) });
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.locator('main button:has-text("New meeting")').first().click();
  await page.waitForTimeout(2500);
  const dlg = page.locator('[role=dialog]').first();
  await dlg.locator('input').first().fill('QA-E Verify Invite');
  await dlg.locator('input[aria-label="Starts time"]').fill('20:00');
  await page.waitForTimeout(400);
  await dlg.locator('input[aria-label="Ends time"]').fill('20:30');
  await page.waitForTimeout(500);
  await dlg.locator('button:has-text("QA Bob")').first().click().catch(() => {});
  await page.waitForTimeout(900);
  const sel = (await dlg.innerText().catch(() => '')).match(/Selected \(\d+\)/);
  await dlg.locator('button:has-text("Schedule meeting")').first().click();
  await page.waitForTimeout(5000);
  return { selected: sel ? sel[0] : 'none', net };
};
