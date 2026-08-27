export default async ({page}) => {
  const btn=page.locator('button[aria-label="Mute notifications"], button[aria-label="Unmute notifications"]');
  const before=await btn.first().getAttribute('aria-label');
  await btn.first().click();
  await page.waitForTimeout(1500);
  const after=await page.locator('button[aria-label="Mute notifications"], button[aria-label="Unmute notifications"]').first().getAttribute('aria-label');
  const total=await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=1',{credentials:'include'})).json();
    return j.total ?? (j.notifications||j.data||j||[]).length;
  });
  return {before, after, total};
};
