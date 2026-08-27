export default async ({ page }) => {
  const hit = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="incoming-call-banner-accept"]');
    if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(7000);
  return { clicked: hit, after: await page.evaluate(() => ({
    url: location.pathname,
    tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length,
    hasLeave: !!Array.from(document.querySelectorAll('button')).find(b=>/^Leave call$/.test(b.textContent.trim())),
    tail: document.body.innerText.replace(/\n+/g,' | ').slice(-120) })) };
};
