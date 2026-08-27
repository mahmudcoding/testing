export default async ({ page }) => {
  let vis = await page.evaluate(() => !!document.querySelector('[data-testid="side-room-action"]'));
  if (!vis) { await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if(b) b.click(); });
    await page.waitForTimeout(2500); }
  const hit = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="side-room-action"]');
    if (!b || b.getBoundingClientRect().width===0) return null;
    const t=(b.innerText||'').trim(); b.click(); return t; });
  await page.waitForTimeout(8000);
  return { clicked: hit,
    inRoom: await page.evaluate(() => /Side Room|Leave Side Room|Main call/i.test(document.body.innerText||'')),
    state: await page.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(-170)) };
};
