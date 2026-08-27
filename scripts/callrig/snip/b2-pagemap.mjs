export default async ({ page }) => {
  return await page.evaluate(() => {
    const t = document.body.innerText || '';
    return { url: location.pathname,
             len: t.length,
             hasLiveNow: /Live now/i.test(t),
             hasLIVE: /\bLIVE\b/.test(t),
             hasStartNow: /Start now/i.test(t),
             hasCallSurface: !!document.querySelector('[data-testid="call-surface"]'),
             hasPip: !!document.querySelector('[class*="pip"],[data-testid*="pip"],[class*="minimi"]'),
             head: t.replace(/\n+/g,' | ').slice(0, 240) };
  });
};
