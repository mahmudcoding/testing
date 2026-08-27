export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/messaging/messages', { method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ channel_id:'C4QDGENERAL0001', body:'QA-D2 mute-all probe (plain, no mention)' }) });
    const t = await r.text();
    return { status:r.status, id:(t.match(/"id":"([^"]+)"/)||[])[1]||'', at:(t.match(/"created_at":"([^"]+)"/)||[])[1]||'' };
  });
};
