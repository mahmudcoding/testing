export default async ({page}) => {
  const e = page.locator('[data-testid="call-controls-end-for-everyone"]');
  const l = page.locator('[data-testid="call-controls-leave"]');
  let did = null;
  if (await e.count()) { did='end'; await e.click(); await page.waitForTimeout(1200);
    const cf = page.locator('[data-testid="call-end-confirm-submit"]'); if (await cf.count()) await cf.click(); }
  else if (await l.count()) { did='leave'; await l.click(); await page.waitForTimeout(1200);
    const cf = page.locator('[data-testid="call-leave-confirm-submit"], [data-testid="call-end-confirm-submit"]'); if (await cf.count()) await cf.click(); }
  await page.waitForTimeout(6000);
  const close = page.locator('[data-testid="call-ended-close"]');
  if (await close.count()) await close.click();
  await page.waitForTimeout(1500);
  const cur = await page.evaluate(async ()=>{const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return j.meeting?{id:j.meeting.id,status:j.meeting.status}:j;});
  return {did, cur, url: page.url()};
};
