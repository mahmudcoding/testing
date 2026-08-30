/* Fill the password and start the call. Report the created meeting's server state. */
export default async ({ page }) => {
  const out = { api: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u) || r.request().method() === 'GET') return;
    let body = null; try { body = (await r.text()).slice(0, 900); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(),
                req: (r.request().postData() || '').slice(0, 600), res: body });
  });

  const pw = page.locator('input[type=password]').first();
  await pw.fill('Secret123');
  await page.locator('input[aria-label="Call name"]').first().fill('QA K30 pwgate');
  await page.waitForTimeout(400);
  await page.locator('[data-testid="calls-start-submit"]').click();
  await page.waitForTimeout(6000);

  out.api = seen;
  out.url = page.url();
  out.callId = (page.url().match(/\/call\/([^/?#]+)/) || [])[1] || null;
  return out;
};
