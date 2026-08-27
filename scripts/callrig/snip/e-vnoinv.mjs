const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  const net = [];
  page.on('response', async r => {
    if (!/\/api\/v1\/calendar\/meetings/.test(r.url())) return;
    net.push({ m: r.request().method(), u: r.url().replace(/https:\/\/[^/]+/, '').slice(0, 80), s: r.status(), b: (await r.text().catch(() => '')).slice(0, 260) });
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.locator('main button:has-text("New meeting")').first().click();
  await page.waitForTimeout(2500);
  const dlg = page.locator('[role=dialog]').first();
  await dlg.locator('input').first().fill('QA-E Solo Check');
  await dlg.locator('input[aria-label="Starts time"]').fill('19:00');
  await page.waitForTimeout(400);
  await dlg.locator('input[aria-label="Ends time"]').fill('19:30');
  await page.waitForTimeout(500);
  // deliberately invite NOBODY
  const selText = await dlg.innerText().catch(() => '');
  await dlg.locator('button:has-text("Schedule meeting")').first().click();
  await page.waitForTimeout(4500);
  return {
    selectedLine: (selText.match(/Selected \(\d+\)/) || ['(no Selected line)'])[0],
    net: net.map(n => `${n.m} ${n.u} ${n.s} ${n.b.slice(0, 150)}`),
  };
};
