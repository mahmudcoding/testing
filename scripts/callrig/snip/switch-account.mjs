// Sign this browser in as a different account, in place.
//
// A normal thing to do, not a repair: it is how you reach a fifth account while
// at the per-lane window cap, and the only way to have one account signed in
// twice at once (the LiveKit identity-takeover case). `login.mjs` cannot do it —
// it correctly returns early when a session already exists.
//
// The lane guard compares the LANE of the signed-in email, not the account, so
// switching within a lane is allowed by design. rigmap's email no longer
// describes that port afterwards: note the swap in your session log, and use
// snip/whoami.mjs to ask a browser who it actually holds.
//
//   QA_EMAIL=qa.b.alice@aloqa.test ./d b:carol snip/switch-account.mjs
export default async ({ page, ctx }) => {
  const email = process.env.QA_EMAIL;
  const pw = process.env.QA_PW || 'QaPass123!';
  if (!email) return { err: 'set QA_EMAIL to the account to switch to' };

  const before = await page.evaluate(async () => {
    try { return (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).email || null; } catch { return null; }
  });

  await ctx.clearCookies();
  await page.goto('https://airion-cargo.store/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', pw);
  await page.click('button[type=submit]');
  await page.waitForTimeout(4000);

  const after = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
    return { status: r.status, email: r.ok ? (await r.json()).email : null };
  });
  return { before, requested: email, now: after.email, status: after.status, ok: after.email === email, url: page.url() };
};
