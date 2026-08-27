const CH = 'C4QEGENERAL0001';
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async (CH) => {
    const body = 'verify-unread-' + String(Math.floor(performance.now())).slice(-6);
    const r = await fetch('/api/v1/messaging/messages', {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel_id: CH, body }),
    });
    return { status: r.status, sent: body, at: new Date().toISOString() };
  }, CH);
};
