/* Start a call from the hub as the driven account, report the call id + surface state. */
export default async ({ page }) => {
  const out = {};
  const ws = 'W4QAF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  out.url0 = page.url();

  // enumerate the hub's visible interactive controls (bounded set)
  out.hubControls = await page.evaluate(() => {
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      let n = e, op = 1;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        op *= parseFloat(cs.opacity || '1');
        n = n.parentElement;
      }
      return op > 0.05;
    };
    return [...document.querySelectorAll('button,a[href],[role=button]')]
      .filter(vis)
      .map(e => ({ t: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 48),
                   tid: e.getAttribute('data-testid') || null,
                   dis: e.disabled === true || e.getAttribute('aria-disabled') === 'true' }))
      .filter(x => x.t || x.tid);
  });

  const startNow = page.locator('[data-testid="calls-hub-start-now"]');
  out.startNowCount = await startNow.count();
  if (out.startNowCount) {
    await startNow.first().click();
    await page.waitForTimeout(3000);
  }
  out.url1 = page.url();
  out.callId = (page.url().match(/\/call\/([^/?#]+)/) || [])[1] || null;

  // what is on screen now
  out.surface = await page.evaluate(() => ({
    h: [...document.querySelectorAll('h1,h2,h3')].map(e => e.textContent.trim()).filter(Boolean).slice(0, 8),
    testids: [...new Set([...document.querySelectorAll('[data-testid]')]
      .map(e => e.getAttribute('data-testid'))
      .filter(t => /call|lobby|meeting|join|device/i.test(t)))].slice(0, 40),
  }));
  return out;
};
