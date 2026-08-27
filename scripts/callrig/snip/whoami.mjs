// Which account is this browser signed in as? Reads the session without
// navigating, so it is safe to run against a browser in the middle of a test —
// unlike login.mjs, which goes to /login before it checks.
export default async ({ page }) => {
  try {
    const email = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
        return r.ok ? (await r.json()).email || null : null;
      } catch { return null; }
    });
    return email || 'none';
  } catch { return 'none'; }
};
