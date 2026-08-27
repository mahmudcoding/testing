export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  const me = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
      const j = await r.json().catch(() => null);
      return { status: r.status, email: j?.email ?? j?.data?.email ?? null, id: j?.id ?? j?.data?.id ?? null };
    } catch (e) { return { err: String(e).slice(0, 120) }; }
  });
  return { url: page.url().slice(0, 90), vis: await page.evaluate(() => document.visibilityState), me };
};
