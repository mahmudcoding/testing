const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  return await page.evaluate(async (WS) => {
    const r = await fetch(`/api/v1/workspaces/${WS}/unread`, { credentials: 'include' });
    const t = await r.text();
    return { status: r.status, len: t.length, raw: t.slice(0, 900) };
  }, WS);
};
