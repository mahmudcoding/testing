export default async ({page}) => {
  const probe = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-controls-leave"]');
    if (!b) return { leaveBtn: false };
    const r = b.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { leaveBtn: true, rect: { x: r.x, y: r.y, w: r.width, h: r.height },
             covered: !(at === b || b.contains(at)),
             coveredBy: at ? at.tagName + ':' + (at.textContent || '').trim().slice(0, 40) : null };
  });
  if (!probe.leaveBtn) return { done: true, probe };
  // Trusted click through Playwright at the button's own coordinates; force
  // past any overlay hit-test complaint, then take the confirm sheet by text.
  await page.locator('[data-testid="call-controls-leave"]').first()
    .click({ timeout: 8000, force: true }).catch(() => {});
  await page.waitForTimeout(2000);
  const sheet = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')]
      .map(b => (b.textContent || '').trim()).filter(Boolean);
    return btns.filter(t => /leave|end/i.test(t)).slice(0, 6);
  });
  await page.getByRole('button', { name: /end for everyone/i }).first()
    .click({ timeout: 5000, force: true }).catch(() => {});
  await page.getByRole('button', { name: /^leave call$/i }).first()
    .click({ timeout: 3000, force: true }).catch(() => {});
  await page.waitForTimeout(4000);
  return { probe, sheet,
    done: await page.evaluate(() => !document.querySelector('[data-testid="call-controls-leave"]')),
    url: await page.evaluate(() => location.pathname) };
};
