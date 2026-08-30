/* Compare the frontend guest-preview route against the backend endpoint it proxies.
   Both called unauthenticated, from a fresh context. Rate limit is 5/60s — two calls only. */
export default async ({ page, browser }) => {
  const token = process.env.K30_TOKEN;
  const out = { token: token ? token.slice(0,12)+'…' : null };
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  await gp.goto('https://staging.airion-cargo.store/login', { waitUntil:'commit', timeout:90000 });
  await gp.waitForTimeout(4000);
  out.anonymous = await gp.evaluate(async () => (await fetch('/api/v1/auth/me',{credentials:'include'})).status);
  out.calls = await gp.evaluate(async (t) => {
    const res = {};
    for (const p of ['/api/guest/preview', '/api/v1/meeting/guest/preview']) {
      try {
        const r = await fetch(p, { method:'POST', credentials:'include',
          headers:{'content-type':'application/json'}, body: JSON.stringify({ token: t }) });
        res[p] = { s: r.status, bodyFull: await r.text() };
      } catch (e) { res[p] = { err: String(e) }; }
    }
    return res;
  }, token);
  await gctx.close();
  return out;
};
