/* Ask /meeting/{id}/settings as whoever this browser holds, and say who that is. */
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  return await page.evaluate(async (cid) => {
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json().catch(()=>({}));
    const r = await fetch(`/api/v1/meeting/${cid}/settings`, { credentials: 'include' });
    const b = await r.text();
    return { me: me?.user?.email ?? me?.email ?? JSON.stringify(me).slice(0,120),
             url: location.pathname, status: r.status, bodyFull: b };
  }, id);
};
