export default async ({ page }) => {
  const out = { api: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u) || r.request().method() === 'GET') return;
    let b = null; try { b = (await r.text()).slice(0, 300); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(), res: b });
  });
  const inp = page.locator('[data-testid="call-password-input"]');
  if (!(await inp.count())) { out.abort = 'no gate'; out.url = page.url(); return out; }
  await inp.fill('Secret123');
  await page.waitForTimeout(300);
  await page.locator('button[type=submit]').first().click();
  await page.waitForTimeout(9000);
  out.api = seen;
  out.url = page.url();
  out.inCall = await page.evaluate(() => ({
    overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    gate: !!document.querySelector('[data-testid="call-password-gate"]'),
    lobby: !!document.querySelector('[data-testid="lobby-page"]'),
    controls: !!document.querySelector('[data-testid="call-controls-people-toggle"]'),
  }));
  return out;
};
