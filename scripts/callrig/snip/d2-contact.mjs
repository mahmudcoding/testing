export default async ({ page }) => {
  const reqs = [];
  page.on('request', r => { const u = r.url(); if (u.includes('/api/v1/')) reqs.push({ m: r.method(), u: u.replace(/^https?:\/\/[^/]+/, ''), body: (r.postData() || '').slice(0, 200) }); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const snap = () => page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; };
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean);
  });

  const before = await snap();
  reqs.length = 0;

  // type into the phone field
  const phone = page.locator('input[placeholder="+1 555 0100"]');
  await phone.scrollIntoViewIfNeeded();
  await phone.click();
  await phone.fill('+998 90 123 4567');
  await page.waitForTimeout(400);
  const afterType = await snap();
  const typedReqs = reqs.slice();

  // poll 6s for any save affordance / autosave request
  let appeared = [];
  for (let i = 0; i < 20; i++) {
    const now = await snap();
    const nu = now.filter(b => !before.includes(b));
    if (nu.length) appeared = nu;
    await page.waitForTimeout(300);
  }
  const val = await phone.inputValue();
  return {
    buttonsBefore: before.slice(-8),
    buttonsAfterTyping: afterType.slice(-8),
    newButtonsAfterTyping: appeared,
    fieldValue: val,
    requestsAfterTyping: reqs.map(r => r.m + ' ' + r.u).slice(0, 12)
  };
};
