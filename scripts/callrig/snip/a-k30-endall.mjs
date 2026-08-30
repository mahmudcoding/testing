export default async ({ page }) => {
  const ws = 'W4QAF1XTURESO01';
  const r = await page.evaluate(async (w) => {
    const res = await fetch(`/api/v1/workspace/${w}/meetings/active`, { credentials:'include' });
    const j = await res.json().catch(()=>({}));
    const out = [];
    for (const m of (j.meetings||[])) {
      const e = await fetch(`/api/v1/meeting/${m.id}/end`, {method:'POST',credentials:'include'});
      out.push({ id:m.id, name:m.name, s:e.status });
    }
    return out;
  }, ws);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, { waitUntil:'commit', timeout:90000 });
  await page.waitForTimeout(4000);
  return { ended: r, url: page.url() };
};
