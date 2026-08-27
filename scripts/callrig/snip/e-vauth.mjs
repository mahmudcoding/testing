export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  const me = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
      const j = await r.json().catch(() => null);
      return { status: r.status, id: j?.id ?? j?.user?.id ?? null, email: j?.email ?? j?.user?.email ?? null, name: j?.display_name ?? j?.user?.display_name ?? null };
    } catch (e) { return { err: String(e).slice(0, 120) }; }
  });
  return { url: page.url().slice(0, 90), vis: await page.evaluate(() => document.visibilityState), me };
};
