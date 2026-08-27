export default async ({ page }) => {
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=5', {credentials:'include'});
    const t = await r.text();
    return { status: r.status, len: t.length, head: t.slice(0, 600) };
  });
};
