export default async ({page}) => {
  const hit = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x=>x.offsetParent)
      .find(x => /spotlight/i.test(x.getAttribute('aria-label')||x.textContent||''));
    if (b) { b.click(); return b.getAttribute('aria-label') || b.textContent; }
    return 'not found';
  });
  await page.waitForTimeout(7000);
  return { hit, tiles: await page.evaluate(() => [...document.querySelectorAll('[data-testid="participant-tile"]')].map(t => ({
    local: t.getAttribute('data-local'),
    name: (t.querySelector('[data-testid="participant-name"]')||{}).textContent || null,
    videoW: (t.querySelector('video')||{}).videoWidth || 0
  }))) };
};
