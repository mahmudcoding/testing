export default async ({ page }) => {
  const r = await page.evaluate(async () => {
    const ws = 'W4QBF1XTURESO01';
    const start = new Date(Date.now() + 3*24*3600*1000);
    const end = new Date(start.getTime() + 30*60*1000);
    const c = await fetch('/api/v1/calendar/meetings', { method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ workspace_id: ws, title: 'QA far future',
        starts_at: start.toISOString(), ends_at: end.toISOString() }) });
    const ct = await c.text();
    const id = (ct.match(/"id":"(S[A-Za-z0-9]+)"/)||[])[1];
    if (!id) return { createStatus: c.status, createBody: ct.slice(0,200) };
    return { createStatus: c.status, scheduledId: id, when: start.toISOString() };
  });
  return r;
};
