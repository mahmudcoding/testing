/* End any active meeting, then create a call from the hub with a chosen entry mode.
   K30_ENTRY = manual-admit | password | open   K30_NAME = call name  K30_PW = password */
export default async ({ page }) => {
  const ws = 'W4QAF1XTURESO01';
  const entry = process.env.K30_ENTRY || 'manual-admit';
  const name = process.env.K30_NAME || 'QA K30 call';
  const out = { entry, name, api: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u) || r.request().method() === 'GET') return;
    let b = null; try { b = (await r.text()).slice(0, 600); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(),
                req: (r.request().postData()||'').slice(0,400), res: b });
  });

  // end whatever is running
  out.ended = await page.evaluate(async (w) => {
    const r = await fetch(`/api/v1/workspace/${w}/meetings/active`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    const res = [];
    for (const m of (j.meetings || [])) {
      const e = await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
      res.push({ id: m.id, s: e.status });
    }
    return res;
  }, ws);
  await page.waitForTimeout(2500);

  await page.goto(`https://airion-cargo.store/w/${ws}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.locator('[data-testid="calls-hub-start-now"]').click();
  await page.waitForTimeout(2000);
  await page.locator('input[aria-label="Call name"]').first().fill(name);
  await page.locator(`[data-testid="calls-start-entry-${entry}"]`).click();
  await page.waitForTimeout(800);
  if (entry === 'password' && process.env.K30_PW) {
    await page.locator('input[type=password]').first().fill(process.env.K30_PW);
  }
  await page.waitForTimeout(400);
  out.dialogState = await page.evaluate(() => {
    const body = document.querySelector('[data-testid="calls-start-dialog-body"]');
    return body ? [...body.querySelectorAll('input[type=radio]')].filter(e=>e.checked).map(e=>e.value) : null;
  });
  await page.locator('[data-testid="calls-start-submit"]').click();
  await page.waitForTimeout(7000);
  out.api = seen.filter(r => /\/meeting/.test(r.u));
  out.url = page.url();
  out.callId = (page.url().match(/\/call\/([^/?#]+)/) || [])[1] || null;
  return out;
};
