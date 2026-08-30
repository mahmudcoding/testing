export default async ({ page }) => {
  const id = process.env.K30_CALL;
  return await page.evaluate(async (cid) => {
    const r = await fetch(`/api/v1/meeting/${cid}/recordings`, { credentials:'include' });
    const m = await fetch(`/api/v1/meeting/${cid}`, { credentials:'include' });
    return { recordings: (await r.text()).slice(0,420), meeting: (await m.text()).slice(0,240),
             now: new Date().toISOString() };
  }, id);
};
